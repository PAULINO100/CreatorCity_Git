import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BuildingInstances } from './BuildingInstances';
import { BuildingUnique } from './BuildingUnique';
import { usePerformanceStore, getQualitySettings, QualityLevel } from '@/lib/city/performance-store';
import DistrictZones from './DistrictZone3D';
import { generateBuilding, District } from '@/lib/buildings/generator';
import { assignBuildingBlueprint } from '@/lib/buildings/assignment-engine';
import { BlueprintType } from '@/lib/buildings/blueprint-registry';
import { CityPerformanceOptimizer } from './PerformanceMonitor';
import { useChunkedLoader } from '@/hooks/useChunkedLoader';
import { ChunkPlaceholders } from './ChunkPlaceholders';
import { ChunkLoadingProgressUI } from './ChunkLoadingProgressUI';

// Cyberpunk Effects
import { CyberSky, CyberWater as WaterReflections, DistrictNeonSigns } from './effects/EnvironmentFX';
import { FlyingVehicles } from './effects/FlyingVehicles';
import { DataRain } from './effects/DataRain';
import { SpotLights } from './effects/SpotLights';
import { DistrictPulse } from './effects/DistrictPulse';
import { TechAIDistrict } from '@/components/districts/TechAIDistrict';
import { EducatechAILandmark } from '@/components/landmarks/EducatechAILandmark';
import { trackReMount, trackFlicker } from '@/lib/city/stability-monitor';
import { BadgeUI } from '@/components/ui/BadgeUI';
import { ThreeErrorBoundary } from '../common/ThreeErrorBoundary';
import { CityStateManager } from '@/lib/city/CityStateManager';
import { useCityStore } from '@/lib/city/city-store';

interface CityCitizen {
  id: string;
  name: string;
  score: number;
  profileType: string;
  district: District;
  x: number;
  y: number;
  isMe?: boolean;
  equippedItems?: { category: string; name: string }[];
}

interface BuildingDataExtended extends CityCitizen {
  height: number;
  color: string;
  glowColor: string;
  auraColor: string | null;
  isMatch: boolean;
}

interface UniqueBuildingData extends BuildingDataExtended {
  blueprintType: BlueprintType;
}

interface CityScene3DProps {
  searchQuery?: string;
}

// ── Helper: enrich raw citizen into BuildingDataExtended ──────────────────
function enrichCitizen(
  c: CityCitizen,
  searchQuery: string
): { building: BuildingDataExtended; blueprint: ReturnType<typeof assignBuildingBlueprint> } {
  let scoreScale = c.score;
  const b = generateBuilding(c.score, c.profileType);
  let customColor = b.color;
  let auraColor: string | null = null;

  if (c.equippedItems && c.equippedItems.length > 0) {
    c.equippedItems.forEach((i) => {
      if (i.category === 'facade' && i.name.includes('Gold')) customColor = '#ffd700';
      if (i.category === 'facade' && i.name.includes('Cyberpunk')) customColor = '#ff00ff';
      if (i.category === 'facade' && i.name.includes('Minimalist')) customColor = '#e2e8f0';
      if (i.category === 'effect' && i.name.includes('Shield')) auraColor = '#00ffff';
      if (i.category === 'effect' && i.name.includes('Data')) auraColor = '#00ff00';
      if (i.category === 'lighting' && i.name.includes('Indigo')) auraColor = '#4f46e5';
      if (i.category === 'lighting' && i.name.includes('Aurora')) auraColor = '#ec4899';
      if (i.category === 'lighting' && i.name.includes('Warm')) auraColor = '#f59e0b';
      if (i.category === 'signature' && i.name.includes('Spire')) scoreScale = c.score * 2.5;
    });
  }

  const isMatch = !!searchQuery && (
    (searchQuery.toLowerCase().startsWith('district:')
      && c.district.toLowerCase() === searchQuery.split(':')[1]?.toLowerCase()) ||
    (!searchQuery.toLowerCase().startsWith('district:')
      && (c.name.toLowerCase().includes(searchQuery.toLowerCase())
        || c.district.toLowerCase() === searchQuery.toLowerCase()))
  );

  const building: BuildingDataExtended = {
    ...c,
    height: scoreScale / 2000,
    color: customColor,
    glowColor: b.glowColor,
    auraColor,
    isMatch,
  };

  const blueprint = assignBuildingBlueprint({
    id: c.id,
    name: c.name,
    githubUsername: c.name,
    bio: c.profileType || '',
    techStack: [],
  });

  return { building, blueprint };
}

interface CityContentProps {
  citizens: CityCitizen[];
  searchQuery: string;
  onSelect: (c: CityCitizen) => void;
  // Chunks passed as props now
  chunk1: CityCitizen[];
  chunk2: CityCitizen[];
  chunk3: CityCitizen[];
  placeholders: CityCitizen[];
}

function CityContent({
  citizens,
  searchQuery,
  onSelect,
  chunk1,
  chunk2,
  chunk3,
  placeholders,
}: CityContentProps) {
  const { postProcessingEnabled, quality } = usePerformanceStore();
  const settings = useMemo(() => getQualitySettings(quality), [quality]);
  const { camera } = useThree();

  // 1. Enrich chunks (memoized)
  const enrichChunk = useCallback(
    (chunk: CityCitizen[]) => {
      const unique: UniqueBuildingData[] = [];
      const generic: BuildingDataExtended[] = [];
      chunk.forEach((c) => {
        const { building, blueprint } = enrichCitizen(c, searchQuery);
        if (blueprint !== 'GENERIC') {
          unique.push({ ...building, blueprintType: blueprint });
        } else {
          generic.push(building);
        }
      });
      return { unique, generic };
    },
    [searchQuery]
  );

  const { unique: u1, generic: g1 } = useMemo(() => enrichChunk(chunk1), [chunk1, enrichChunk]);
  const { unique: u2, generic: g2 } = useMemo(() => enrichChunk(chunk2), [chunk2, enrichChunk]);
  const { unique: u3, generic: g3 } = useMemo(() => enrichChunk(chunk3), [chunk3, enrichChunk]);

  // Master LOD State
  const [lodTiers, setLodTiers] = useState(() => ({
    chunk1: { tier0: [], tier1: [], tier2: [], tier3: [] } as any,
    chunk2: { tier0: [], tier1: [], tier2: [], tier3: [] } as any,
    chunk3: { tier0: [], tier1: [], tier2: [], tier3: [] } as any,
  }));

  const frameCount = useRef(0);
  const _scratchPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 45 !== 0) return;

    const [d0, d1, d2, d3] = settings.lodDistances;
    const camPos = camera.position;

    const calculateTiers = (generic: BuildingDataExtended[]) => {
      const groups: BuildingDataExtended[][] = [[], [], [], []];
      for (const b of generic) {
        _scratchPos.set(b.x * 0.2 - 10, 0, b.y * 0.2 - 10);
        const dist = camPos.distanceTo(_scratchPos);
        if (dist < d0) groups[0].push(b);
        else if (dist < d1) groups[1].push(b);
        else if (dist < d2) groups[2].push(b);
        else if (dist < d3) groups[3].push(b);
      }
      return { tier0: groups[0], tier1: groups[1], tier2: groups[2], tier3: groups[3] };
    };

    setLodTiers({
      chunk1: calculateTiers(g1),
      chunk2: calculateTiers(g2),
      chunk3: calculateTiers(g3),
    });
  });

  const spotLightBuildings = useMemo(() => [...g1, ...g2, ...g3], [g1, g2, g3]);
  const allUnique = useMemo(() => [...u1, ...u2, ...u3], [u1, u2, u3]);

  const loadedIds = useMemo(() => {
    const ids = new Set<string>();
    [...chunk1, ...chunk2, ...chunk3].forEach(c => ids.add(c.id));
    return ids;
  }, [chunk1, chunk2, chunk3]);

  const pendingPlaceholders = useMemo(() =>
    placeholders.filter(c => !loadedIds.has(c.id)),
    [placeholders, loadedIds]
  );

  return (
    <>
      <SpotLights buildings={spotLightBuildings} />
      <ChunkPlaceholders citizens={pendingPlaceholders} />

      {/* Static City Districts / Landmarks */}
      <ThreeErrorBoundary fallback={null}>
        <EducatechAILandmark />
      </ThreeErrorBoundary>

      <ThreeErrorBoundary fallback={null}>
        <TechAIDistrict 
          buildings={citizens} 
          cameraPosition={camera.position}
        />
      </ThreeErrorBoundary>

      <BuildingInstances
        buildings={g1}
        onSelect={onSelect as (b: { id: string }) => void}
        justLoaded={false}
        tiers={lodTiers.chunk1}
      />
      <BuildingInstances
        buildings={g2}
        onSelect={onSelect as (b: { id: string }) => void}
        justLoaded={g2.length > 0}
        tiers={lodTiers.chunk2}
      />
      <BuildingInstances
        buildings={g3}
        onSelect={onSelect as (b: { id: string }) => void}
        justLoaded={g3.length > 0}
        tiers={lodTiers.chunk3}
      />

      {allUnique.map((b) => (
        <BuildingUnique
          key={b.id}
          type={b.blueprintType}
          position={[b.x * 0.2 - 10, 0, b.y * 0.2 - 10]}
          color={b.color}
        />
      ))}

      {postProcessingEnabled && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} mipmapBlur intensity={1.5} radius={0.4} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      )}
    </>
  );
}

function CameraUpdater({ targetCitizen, isUserInteracting }: { targetCitizen: CityCitizen | null, isUserInteracting: boolean }) {
  const { camera, controls } = useThree<{ camera: THREE.PerspectiveCamera, controls: any }>();
  const [vec] = useState(() => new THREE.Vector3());
  const [targetVec] = useState(() => new THREE.Vector3());
  const lastTargetId = useRef<string | null>(null);
  const [isLerping, setIsLerping] = useState(false);

  // Trigger lerp when target changes
  useEffect(() => {
    if (targetCitizen && targetCitizen.id !== lastTargetId.current) {
      lastTargetId.current = targetCitizen.id;
      setIsLerping(true);
    } else if (!targetCitizen) {
      lastTargetId.current = null;
      setIsLerping(false);
    }
  }, [targetCitizen]);

  useFrame(() => {
    if (targetCitizen && controls && isLerping && !isUserInteracting) {
      const x = targetCitizen.x * 0.2 - 10;
      const z = targetCitizen.y * 0.2 - 10;
      const bHeight = Math.max(0.3, targetCitizen.score / 2000);
      
      targetVec.set(x, bHeight / 2, z);
      controls.target.lerp(targetVec, 0.1);

      vec.set(x + 10, Math.max(6, bHeight + 6), z + 10); // Lower zoom for better detail
      camera.position.lerp(vec, 0.1);
      
      controls.update();

      // Stop lerping when close enough
      if (camera.position.distanceTo(vec) < 0.05 && controls.target.distanceTo(targetVec) < 0.05) {
        setIsLerping(false);
      }
    }
  });

  return null;
}




function CameraTransitioner({ target, onFinished }: { target: THREE.Vector3 | null, onFinished: () => void }) {
  const { camera, controls } = useThree<{ camera: THREE.PerspectiveCamera, controls: any }>();
  const [vec] = useState(() => new THREE.Vector3());
  
  useFrame(() => {
    if (target && controls) {
      // 1. Set destination (street level)
      const destX = target.x;
      const destZ = target.z;
      const destY = 1.7; // Street Level
      
      vec.set(destX, destY, destZ);
      
      // 2. Lerp camera position
      camera.position.lerp(vec, 0.08);
      
      // 3. Move OrbitControls target slightly ahead to set initial walking orientation
      const currentPos = camera.position.clone();
      const dir = vec.clone().sub(currentPos).normalize();
      const lookTarget = vec.clone().add(dir.multiplyScalar(5));
      
      controls.target.lerp(lookTarget, 0.08);
      controls.update();

      // 4. Check if reached destination
      if (camera.position.distanceTo(vec) < 0.15) {
        onFinished();
      }
    }
  });

  return null;
}

import { CityWalker } from './effects/CityWalker';
import { SplineBuildingProvider } from './effects/SplineBuildingSource';

export const CityScene3D: React.FC<CityScene3DProps> = ({ searchQuery = "" }) => {
  const [citizens, setCitizens] = useState<CityCitizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCitizen, setSelectedCitizen] = useState<CityCitizen | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [walkMode, setWalkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<THREE.Vector3 | null>(null);
  const [userScore, setUserScore] = useState<{ score: number, name: string } | null>(null);
  const { quality, setQuality, showProfiler, toggleProfiler } = usePerformanceStore();

  const handleGroundClick = useCallback((point: THREE.Vector3) => {
    if (walkMode || isTransitioning) return;
    setTransitionTarget(point.clone());
    setIsTransitioning(true);
  }, [walkMode, isTransitioning]);

  const { 
    chunk1, chunk2, chunk3, placeholders, 
    progress, phase, loadedCount, totalCount 
  } = useChunkedLoader(citizens, {
    chunk1delay: 0,
    chunk2delay: 1500,
    chunk3delay: 4000,
    memoryThreshold: 95,
  });

  useEffect(() => {
    trackReMount('CityScene3D');
  }, []);

  useEffect(() => {
    trackFlicker(loadedCount);
  }, [loadedCount]);

  const fetchCitizens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/city/citizens');
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      setCitizens(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load citizens");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserScore = useCallback(async () => {
    try {
      const res = await fetch('/api/score/me');
      if (res.ok) setUserScore(await res.json());
    } catch (err) {
      console.error("Failed to fetch user score", err);
    }
  }, []);

  const initializeCityState = useCallback(async () => {
    try {
      const state = await CityStateManager.getInstance().loadCityState();
      if (state) {
        useCityStore.getState().setStatus(state.status);
        useCityStore.getState().setLastSnapshotId(state.id || null);
        console.log(`[CITY_SCENE] City State loaded: ${state.status}`);
      }
    } catch (err) {
      console.error("[CITY_SCENE] Failed to initialize city state", err);
    }
  }, []);

  useEffect(() => { 
    initializeCityState();
    fetchCitizens(); 
    fetchUserScore();
  }, [initializeCityState, fetchCitizens, fetchUserScore]);

  // Search-to-District Navigation Logic
  useEffect(() => {
    if (searchQuery.toLowerCase().startsWith('district:')) {
      const districtName = searchQuery.split(':')[1]?.toLowerCase();
      // Find district and set camera target
      if (districtName === 'tech' || districtName === 'ai') {
        setSelectedCitizen({ id: 'dist-ai', name: 'AI District', score: 100000, profileType: 'tech', district: 'tech', x: -1000, y: 750 } as any);
      } else if (districtName === 'startup' || districtName === 'rust') {
        setSelectedCitizen({ id: 'dist-rust', name: 'Rust District', score: 100000, profileType: 'startup', district: 'startup', x: 1000, y: 750 } as any);
      } else if (districtName === 'education' || districtName === 'python') {
        setSelectedCitizen({ id: 'dist-python', name: 'Python District', score: 100000, profileType: 'education', district: 'education', x: 1000, y: -750 } as any);
      } else if (districtName === 'creator' || districtName === 'web') {
        setSelectedCitizen({ id: 'dist-web', name: 'Web District', score: 100000, profileType: 'creator', district: 'creator', x: -1000, y: -750 } as any);
      } else if (districtName === 'science') {
        setSelectedCitizen({ id: 'dist-science', name: 'Science District', score: 100000, profileType: 'science', district: 'science', x: 1000, y: -1000 } as any);
      }
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] animate-pulse">Initializing 3D...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-slate-950 border border-red-900/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-red-500">
        <div className="font-bold mb-2 uppercase">Connection Failure</div>
        <div className="text-[10px] text-slate-400 mb-4">{error}</div>
        <button onClick={() => fetchCitizens()} className="px-4 py-2 bg-slate-900 border border-slate-700 text-[10px] text-white rounded">RETRY</button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden group/canvas">
      <Canvas
        shadows
        onCreated={({ gl }) => { (window as any).THREE_RENDERER = gl; }}
        gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
        dpr={getQualitySettings(quality).dpr}
        camera={{ position: [20, 20, 20], fov: 45, far: 2000 }}
      >
        <ThreeErrorBoundary>
          <CityPerformanceOptimizer />
          <PerformanceMonitor />
          <color attach="background" args={['#050a14']} />


          {/* Global Environment */}
          <Suspense fallback={null}>
            <CyberSky />
            <WaterReflections />
            <gridHelper args={[40, 40, '#1e293b', '#0f172a']} position={[0, 0.002, 0]} />
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.01, 0]} 
              onPointerDown={(e) => {
                e.stopPropagation();
                handleGroundClick(e.point);
              }}
            >
              <planeGeometry args={[1000, 1000]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <DistrictZones />
            <DistrictPulse />
            <DistrictNeonSigns />
            <FlyingVehicles />
            <DataRain />
          </Suspense>
          
          <Suspense fallback={null}>
            <SplineBuildingProvider>
              <CityContent
                citizens={citizens}
                searchQuery={searchQuery}
                onSelect={setSelectedCitizen}
                chunk1={chunk1}
                chunk2={chunk2}
                chunk3={chunk3}
                placeholders={placeholders}
              />
            </SplineBuildingProvider>
            {!walkMode && (
              <CameraTransitioner 
                target={transitionTarget} 
                onFinished={() => {
                  setWalkMode(true);
                  setIsTransitioning(false);
                  setTransitionTarget(null);
                }} 
              />
            )}
            {!walkMode && !isTransitioning && <CameraUpdater targetCitizen={selectedCitizen} isUserInteracting={isUserInteracting} />}
          </Suspense>

          {walkMode ? (
             <CityWalker />
          ) : (
            <OrbitControls 
              makeDefault
              target={[0, 0, 0]}
              enableDamping 
              dampingFactor={0.12} 
              minPolarAngle={Math.PI / 10} 
              maxPolarAngle={Math.PI / 2.1} 
              minDistance={3.0} 
              maxDistance={300} 
              zoomSpeed={0.8}
              rotateSpeed={0.8}
              panSpeed={0.8}
              enableZoom={!isTransitioning}
              enablePan={!isTransitioning}
              onStart={() => setIsUserInteracting(true)}
              onEnd={() => setTimeout(() => setIsUserInteracting(false), 200)} 
            />
          )}
          {showProfiler && <Stats className="!static" />}
        </ThreeErrorBoundary>
      </Canvas>

      {/* HUD & Overlays */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button 
          onClick={() => setWalkMode(!walkMode)}
          className={`px-3 py-2 border backdrop-blur-md text-[9px] font-black rounded-lg transition-all ${
            walkMode 
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/50' 
              : 'bg-black/60 border-white/10 text-white hover:bg-blue-600/40'
          }`}
          disabled={isTransitioning}
        >
          {isTransitioning ? 'TRANSITIONING...' : (walkMode ? 'EXIT WALK MODE' : 'ENTER WALK MODE')}
        </button>
        <button 
          onClick={() => {
            setSelectedCitizen(null);
            setWalkMode(false);
            setIsTransitioning(false);
            setTransitionTarget(null);
          }}
          className="px-3 py-2 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] text-white font-black rounded-lg hover:bg-blue-600/40 transition-colors"
        >
          RESET VIEW
        </button>
        <div className="flex bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-lg">
          {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as QualityLevel[]).map((level) => (
            <button key={level} onClick={() => setQuality(level)} className={`px-3 py-1 text-[9px] font-black rounded ${quality === level ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{level}</button>
          ))}
        </div>
        <button onClick={toggleProfiler} className={`px-3 py-2 text-[9px] font-black rounded-lg border ${showProfiler ? 'bg-blue-600/20 text-blue-400' : 'bg-black/60 text-slate-500'}`}>FPS {showProfiler ? 'HIDE' : 'SHOW'}</button>
      </div>

      {phase === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-950/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-3" />
          <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">Calibrating City Grid...</div>
        </div>
      )}

      <ChunkLoadingProgressUI progress={progress} loadedCount={loadedCount} totalCount={totalCount} phase={phase} />

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-blue-400 font-black uppercase">
          METROPOLIS • {citizens.length} NODES
        </div>
      </div>

      {showBadges && <BadgeUI onClose={() => setShowBadges(false)} onClaimSuccess={() => fetchUserScore()} />}
    </div>
  );
};
export default CityScene3D;
