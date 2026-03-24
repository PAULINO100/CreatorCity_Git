import React, { useRef, useMemo, Suspense } from 'react';
import { Stars, Reflector, Text, Environment, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerformanceStore, getQualitySettings } from '@/lib/city/performance-store';
import { DistrictNeon } from './DistrictNeon';
import { SplineDistrict } from './SplineDistrict';
import { ThreeErrorBoundary } from '../../common/ThreeErrorBoundary';
import { SPLINE_CONFIG, shouldLoadSpline } from '@/lib/spline/spline-config';
import { FloatingNeonLabel } from './FloatingNeonLabel';

function FallbackSky() {
  const gradientRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    topColor: { value: new THREE.Color('#0f172a') },
    bottomColor: { value: new THREE.Color('#7e22ce') }, // Deep purple sunset
    offset: { value: 33 },
    exponent: { value: 0.6 }
  }), []);

  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={gradientRef}
        side={THREE.BackSide}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `}
        uniforms={uniforms}
      />
    </mesh>
  );
}

import { useDistrictAtmosphere } from '@/hooks/useDistrictAtmosphere';

export function CyberSky() {
  const { quality } = usePerformanceStore();
  const settings = useMemo(() => getQualitySettings(quality), [quality]);
  const canLoadHDR = settings.hdr;
  const { fogColor } = useDistrictAtmosphere();
  
  return (
    <>
      <color attach="background" args={['#02040a']} />
      <fogExp2 attach="fog" color={fogColor} args={[fogColor, 0.025]} />
      
      {canLoadHDR ? (
        <ThreeErrorBoundary fallback={<FallbackSky />}>
          <Suspense fallback={<FallbackSky />}>
            <Environment 
              preset="night" 
              background
              blur={0.5}
            />
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <FallbackSky />
      )}

      <Stars 
        radius={100} 
        depth={50} 
        count={quality === 'LOW' ? 1000 : (quality === 'MEDIUM' ? 3000 : 8000)} 
        factor={quality === 'ULTRA' ? 6 : (quality === 'HIGH' ? 4 : 2)} 
        saturation={1} 
        fade 
        speed={1.2} 
      />
      
      <ambientLight intensity={0.6} color="#8b5cf6" />
      <directionalLight 
        position={[80, 100, 50]} 
        intensity={3.5} 
        color="#fb923c" // Golden sunset light
        castShadow={quality !== 'LOW'} 
        shadow-mapSize={[settings.shadowRes, settings.shadowRes]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-far={300}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-20, 20, -10]} intensity={1.5} color="#c026d3" />
      <hemisphereLight args={['#0f172a', '#312e81', 0.8]} />
    </>
  );
}

export function CyberWater() {
  const { quality } = usePerformanceStore();
  const settings = useMemo(() => getQualitySettings(quality), [quality]);

  if (quality === 'LOW') {
    return (
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#050a14" roughness={0.1} metalness={0.8} />
      </mesh>
    );
  }

  return (
    <Reflector
      position={[0, -0.01, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[120, 120]}
      resolution={settings.reflectionRes}
      mixBlur={2.5}
      mixStrength={1.5}
      // @ts-expect-error: roughness property
      roughness={0.15}
      metalness={0.9}
      depthScale={1.5}
      minDepthThreshold={0.4}
      maxDepthThreshold={1.4}
      color="#050a14"
    />
  );
}

import { CREATOR_DISTRICT } from '@/lib/districts/creator-district-config';
import { SCIENCE_DISTRICT } from '@/lib/districts/science-district-config';
import { EDUCATION_DISTRICT } from '@/lib/districts/education-district-config';
import { STARTUP_DISTRICT } from '@/lib/districts/startup-district-config';
import { TECH_AI_DISTRICT } from '@/lib/districts/tech-ai-district-config';
import { SplineWrapper } from '@/components/common/SplineWrapper';

const DISTRICT_DATA = [
  { 
    id: 'AI', 
    name: TECH_AI_DISTRICT.name,
    sub: 'INTELIGÊNCIA ARTIFICIAL | MACHINE LEARNING',
    pos: [TECH_AI_DISTRICT.centerPosition.x, TECH_AI_DISTRICT.centerPosition.y + 12, TECH_AI_DISTRICT.centerPosition.z] as [number, number, number], 
    color: TECH_AI_DISTRICT.color,
    neonColor: TECH_AI_DISTRICT.neonColor,
    glowColor: 'rgba(59, 130, 246, 0.2)'
  },
  { 
    id: 'RUST', 
    name: STARTUP_DISTRICT.name,
    sub: STARTUP_DISTRICT.splineAssets.sublabel,
    pos: [STARTUP_DISTRICT.centerPosition.x, STARTUP_DISTRICT.centerPosition.y + 12, STARTUP_DISTRICT.centerPosition.z] as [number, number, number], 
    color: STARTUP_DISTRICT.color,
    neonColor: STARTUP_DISTRICT.neonColor,
    glowColor: 'rgba(234, 88, 12, 0.2)',
    splineUrl: STARTUP_DISTRICT.splineAssets.neonSign.url
  },
  { 
    id: 'PYTHON', 
    name: EDUCATION_DISTRICT.name,
    sub: EDUCATION_DISTRICT.splineAssets.sublabel,
    pos: [EDUCATION_DISTRICT.centerPosition.x, EDUCATION_DISTRICT.centerPosition.y + 12, EDUCATION_DISTRICT.centerPosition.z] as [number, number, number], 
    color: EDUCATION_DISTRICT.color,
    neonColor: EDUCATION_DISTRICT.neonColor,
    glowColor: 'rgba(22, 163, 74, 0.2)',
    splineUrl: EDUCATION_DISTRICT.splineAssets.neonSign.url
  },
  { 
    id: 'WEB', 
    name: CREATOR_DISTRICT.name,
    sub: CREATOR_DISTRICT.splineAssets.sublabel,
    pos: [CREATOR_DISTRICT.centerPosition.x, CREATOR_DISTRICT.centerPosition.y + 12, CREATOR_DISTRICT.centerPosition.z] as [number, number, number], 
    color: CREATOR_DISTRICT.color,
    neonColor: CREATOR_DISTRICT.neonColor,
    glowColor: 'rgba(236, 72, 153, 0.2)',
    splineUrl: CREATOR_DISTRICT.splineAssets.neonSign.url
  },
  { 
    id: 'SCIENCE', 
    name: SCIENCE_DISTRICT.name,
    sub: SCIENCE_DISTRICT.splineAssets.sublabel,
    pos: [SCIENCE_DISTRICT.centerPosition.x, SCIENCE_DISTRICT.centerPosition.y + 12, SCIENCE_DISTRICT.centerPosition.z] as [number, number, number], 
    color: SCIENCE_DISTRICT.color,
    neonColor: SCIENCE_DISTRICT.neonColor,
    glowColor: 'rgba(139, 92, 246, 0.2)',
    splineUrl: SCIENCE_DISTRICT.splineAssets.neonSign.url
  }
];

export function DistrictNeonSigns() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        {DISTRICT_DATA.map((d) => (
          <ThreeErrorBoundary key={`eb-${d.id}`}>
            <Suspense fallback={null}>
              <DistrictSign data={d} />
            </Suspense>
          </ThreeErrorBoundary>
        ))}
      </group>
      
      {/* Floating Neon Labels from reference vision */}
      {DISTRICT_DATA.map((d) => (
        <FloatingNeonLabel 
          key={`label-${d.id}`}
          position={d.pos}
          label={`[${d.name}]`}
          sublabel={d.sub}
          color={d.color}
          neonColor={d.neonColor}
        />
      ))}
    </group>
  );
}

function DistrictSign({ data }: { data: any }) {
  const canUseSpline = shouldLoadSpline();
  
  // High-fidelity Spline enhancement for specific districts
  if (data.splineUrl && canUseSpline) {
    return (
      <SplineDistrict 
        name={data.name} 
        position={data.pos} 
        sceneUrl={data.splineUrl}
        color={data.color}
        glowColor={data.glowColor}
      />
    );
  }

  return (
    <DistrictNeon 
      name={data.name} 
      position={data.pos} 
      color={data.color} 
    />
  );
}
