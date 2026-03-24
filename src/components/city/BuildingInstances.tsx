import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { usePerformanceStore, getQualitySettings } from '@/lib/city/performance-store';
import { useSplineBuilding } from './effects/SplineBuildingSource';
import { useCityStore } from '@/lib/city/city-store';
import { District } from '@/lib/buildings/generator';

// ── Types ──────────────────────────────────────────────────────────────────

interface BuildingData {
  id: string;
  x: number;
  y: number;
  height: number;
  color: string;
  glowColor: string;
  score: number;
  district: District | string;
  name: string;
  profileType: string;
  isMatch?: boolean;
  auraColor?: string | null;
}

interface BuildingInstancesProps {
  buildings: BuildingData[];
  onSelect?: (building: { id: string }) => void;
  /** Signals that this chunk just became visible (triggers fade-in) */
  justLoaded?: boolean;
  /** Pre-calculated LOD tiers (optional, if managed by parent) */
  tiers?: {
    tier0: BuildingData[];
    tier1: BuildingData[];
    tier2: BuildingData[];
    tier3: BuildingData[];
  };
}

// ── Shared Texture Atlas ───────────────────────────────────────────────────

let _sharedAtlas: THREE.CanvasTexture | null = null;

function getSharedWindowAtlas(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (_sharedAtlas) return _sharedAtlas;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#090909';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#e2eeff';
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(4 + col * 15, 4 + row * 12, 9, 7);
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  _sharedAtlas = tex;
  return tex;
}

// ── Premium Futuristic Shader ──────────────────────────────────────────────



function getMatUltra(opacity: number = 1.0): THREE.MeshStandardMaterial {
  const windowAtlas = getSharedWindowAtlas();
  if (windowAtlas) {
    windowAtlas.repeat.set(1, 4);
    windowAtlas.wrapS = THREE.RepeatWrapping;
    windowAtlas.wrapT = THREE.RepeatWrapping;
  }

  return new THREE.MeshStandardMaterial({
    color: '#0a0f1a',
    emissiveMap: windowAtlas,
    emissive: '#3b82f6',
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: Math.max(opacity, 0.1),
    metalness: 0.9,
    roughness: 0.1,
  });
}

let _matMid: THREE.MeshLambertMaterial | null = null;
let _matFar: THREE.MeshBasicMaterial | null = null;

function getMatMid(): THREE.MeshLambertMaterial {
  if (!_matMid) {
    _matMid = new THREE.MeshLambertMaterial({ color: '#1e293b' });
  }
  return _matMid;
}

function getMatFar(): THREE.MeshBasicMaterial {
  if (!_matFar) {
    _matFar = new THREE.MeshBasicMaterial({ color: '#0f172a', fog: true });
  }
  return _matFar;
}

let _boxGeom: THREE.BoxGeometry | null = null;
function getBoxGeom(): THREE.BoxGeometry {
  if (!_boxGeom) _boxGeom = new THREE.BoxGeometry(1, 1, 1);
  return _boxGeom;
}

function batchByDistrict(buildings: BuildingData[]): BuildingData[] {
  const map: Record<string, BuildingData[]> = {};
  for (const b of buildings) {
    const d = String(b.district);
    if (!map[d]) map[d] = [];
    map[d].push(b);
  }
  return Object.values(map).flat();
}

const _scratchPos = new THREE.Vector3();

// ── Main Component ────────────────────────────────────────────────────────

export function BuildingInstances({ buildings, onSelect, justLoaded = false, tiers: propsTiers }: BuildingInstancesProps) {
  const { quality, budget } = usePerformanceStore();
  const settings = useMemo(() => getQualitySettings(quality), [quality]);
  const { camera } = useThree();

  // Cap buildings by render budget
  const budgetedBuildings = useMemo(() => 
    buildings.slice(0, Math.min(budget, buildings.length)), 
  [buildings, budget]);

  const cityStatus = useCityStore((state) => state.status);
  const isSafeMode = cityStatus === 'safe_mode';

  const sortedBuildings = useMemo(() => batchByDistrict(budgetedBuildings), [budgetedBuildings]);

  // Fade-in
  const [opacityState, setOpacityState] = useState(justLoaded ? 0.1 : 1);
  useEffect(() => {
    if (!justLoaded) return;
    let opacity = 0.1;
    let raf: number;
    const fade = () => {
      opacity = Math.min(opacity + 0.05, 1);
      setOpacityState(opacity);
      if (opacity < 1) raf = requestAnimationFrame(fade);
    };
    raf = requestAnimationFrame(fade);
    return () => cancelAnimationFrame(raf);
  }, [justLoaded]);

  const matUltra = useMemo(() => getMatUltra(justLoaded ? 0.1 : 1.0), []); 

  useFrame(() => {
    // Standard material handled by Three.js
  });

  const matMid = useMemo(() => getMatMid(), []);
  const matFar  = useMemo(() => getMatFar(), []);
  const boxGeom = useMemo(() => getBoxGeom(), []);
  
  // High-level access to the spline registry (hook will be called inside render per group if needed, 
  // but for instances we need a single geom per <Instances> call)
  // We'll split instances by district to support different geoms
  const { registry } = useSplineBuilding();

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Local LOD state
  const [internalTiers, setInternalTiers] = useState({
    tier0: [] as BuildingData[],
    tier1: [] as BuildingData[],
    tier2: [] as BuildingData[],
    tier3: [] as BuildingData[],
  });

  useEffect(() => {
    if (propsTiers) return;
    const [d0, d1, d2, d3] = settings.lodDistances;
    const camPos = camera.position;
    const groups: BuildingData[][] = [[], [], [], [], []];

    for (const b of sortedBuildings) {
      _scratchPos.set(b.x * 0.2 - 10, 0, b.y * 0.2 - 10);
      const dist = camPos.distanceTo(_scratchPos);
      if (dist < d0) groups[0].push(b);
      else if (dist < d1) groups[1].push(b);
      else if (dist < d2) groups[2].push(b);
      else if (dist < d3) groups[3].push(b);
      else groups[4].push(b);
    }

    setInternalTiers({
      tier0: groups[0],
      tier1: groups[1],
      tier2: groups[2],
      tier3: groups[3],
    });
  }, [sortedBuildings, settings.lodDistances, camera.position, propsTiers]);

  const activeTiers = propsTiers || internalTiers;

  const renderInstances = (
    tier: BuildingData[],
    isLODLow: boolean,
    canCastShadow: boolean,
    tierIndex: number,
    mat: THREE.Material,
    geom: THREE.BufferGeometry
  ) => (
    <Instances
      key={`tier-${tierIndex}-${quality}`}
      limit={Math.max(tier.length + 50, 1100)}
      castShadow={canCastShadow}
      receiveShadow={!isLODLow}
      geometry={geom}
      material={mat}
    >
      {tier.map((b) => {
        const width = 0.3 + Math.min(b.score / 20000, 0.4);
        const height = Math.max(0.3, b.height * 1.2);
        let emissiveIntensity = (b.isMatch || hoveredId === b.id) ? 1.5 : (b.score > 9000 ? 2.5 : 0.2);
        if (isLODLow) emissiveIntensity = 0.5;

        return (
          <Instance
            key={`b-${b.id}`}
            position={[b.x * 0.2 - 10, height / 2, b.y * 0.2 - 10]}
            scale={[width, height, width]}
            color={new THREE.Color(b.color).multiplyScalar(emissiveIntensity)}
            onClick={(e) => { e.stopPropagation(); onSelect?.(b); }}
            onPointerOver={() => setHoveredId(b.id)}
            onPointerOut={() => setHoveredId(null)}
          />
        );
      })}
    </Instances>
  );

  const glowGeom = useMemo(() => new THREE.CircleGeometry(1, 4), []);
  const auraGeom = useMemo(() => new THREE.CylinderGeometry(0.8, 0.8, 1, 6, 1, true), []);

  // Separate rendering by district to support unique Spline models
  const districts = useMemo(() => {
    const dMap: Record<string, BuildingData[]> = {};
    Object.values(activeTiers).flat().forEach(b => {
      const d = String(b.district);
      if (!dMap[d]) dMap[d] = [];
      dMap[d].push(b);
    });
    return dMap;
  }, [activeTiers]);

  return (
    <group>
      {Object.entries(districts).map(([dName, dBuildings]) => {
        const spline = registry[dName] || registry['science'] || Object.values(registry)[0];
        const districtGeom = spline?.geometry || boxGeom;
        const districtMat = isSafeMode ? new THREE.MeshStandardMaterial({ color: '#ef4444', wireframe: true }) : matUltra;
        const fallbackMatMid = isSafeMode ? districtMat : matMid;
        const fallbackMatFar = isSafeMode ? districtMat : matFar;

        // Filter buildings in this district by tier
        const t0 = dBuildings.filter(b => activeTiers.tier0.includes(b));
        const t1 = dBuildings.filter(b => activeTiers.tier1.includes(b));
        const t2 = dBuildings.filter(b => activeTiers.tier2.includes(b));
        const t3 = dBuildings.filter(b => activeTiers.tier3.includes(b));

        return (
          <React.Fragment key={`dist-group-${dName}`}>
            {t0.length > 0 && renderInstances(t0, false, true, 0, districtMat, districtGeom)}
            {t1.length > 0 && renderInstances(t1, false, false, 1, fallbackMatMid, districtGeom)}
            {t2.length > 0 && renderInstances(t2, true, false, 2, fallbackMatMid, boxGeom)}
            {t3.length > 0 && renderInstances(t3, true, false, 3, fallbackMatFar, boxGeom)}
          </React.Fragment>
        );
      })}

      <Instances limit={Math.max(activeTiers.tier0.length + activeTiers.tier1.length + 5, 10)} geometry={glowGeom}>
        <meshBasicMaterial transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
        {[...activeTiers.tier0, ...activeTiers.tier1].map((b) => {
          const scale = (0.3 + Math.min(b.score / 20000, 0.4)) * 1.4;
          return (
            <Instance
              key={`g-${b.id}`}
              position={[b.x * 0.2 - 10, 0.01, b.y * 0.2 - 10]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale, scale, 1]}
              color={b.glowColor}
            />
          );
        })}
      </Instances>

      <Instances limit={Math.max(activeTiers.tier0.length + 5, 10)} geometry={auraGeom}>
        <meshBasicMaterial transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        {activeTiers.tier0.map((b) => {
          if (!b.auraColor) return null;
          const width = 0.3 + Math.min(b.score / 20000, 0.4);
          const height = Math.max(0.3, b.height * 1.2);
          return (
            <Instance
              key={`a-${b.id}`}
              position={[b.x * 0.2 - 10, height / 2, b.y * 0.2 - 10]}
              scale={[width * 1.5, height * 1.05, width * 1.5]}
              color={new THREE.Color(b.auraColor).multiplyScalar(2.0)}
            />
          );
        })}
      </Instances>
    </group>
  );
}

export default BuildingInstances;
