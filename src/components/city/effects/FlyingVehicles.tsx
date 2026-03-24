'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Instances, Instance, Html } from '@react-three/drei';
import { usePerformanceStore, getQualitySettings } from '@/lib/city/performance-store';
import { shouldLoadSpline } from '@/lib/spline/spline-config';
import { SplineDrone } from './SplineDrone';

export function FlyingVehicles() {
  const { quality } = usePerformanceStore();
  const settings = useMemo(() => getQualitySettings(quality), [quality]);
  const DRONE_COUNT = settings.drones;
  const canUseSpline = useMemo(() => shouldLoadSpline(), []);

  const drones = useMemo(() => {
    return Array.from({ length: DRONE_COUNT }).map((_, i) => ({
      id: i,
      speed: 0.2 + Math.random() * 0.5,
      radius: 5 + Math.random() * 15,
      offset: Math.random() * Math.PI * 2,
      height: 5 + Math.random() * 10,
      phase: Math.random() * Math.PI,
      color: i % 2 === 0 ? '#00ffff' : '#ff00ff'
    }));
  }, [DRONE_COUNT]);

  if (DRONE_COUNT === 0) return null;

  // Split drones into:
  // - Hero Drones (Spline Scenes, high detail, limited count)
  // - Clone Drones (Procedural Instances, high performance)
  const heroDroneCount = canUseSpline ? Math.min(2, DRONE_COUNT) : 0;
  const heroDrones = drones.slice(0, heroDroneCount);
  const cloneDrones = drones.slice(heroDroneCount);

  return (
    <group>
      {/* Hero Drones - Higher Detail Spline scenes */}
      {heroDrones.map((d) => (
        <HeroDrone key={d.id} data={d} />
      ))}

      {/* Clone Drones - Performance-first instances */}
      <Instances limit={20} range={cloneDrones.length}>
        <boxGeometry args={[0.4, 0.1, 0.2]} />
        <meshBasicMaterial toneMapped={false} />
        {cloneDrones.map((d) => (
          <Drone key={d.id} data={d} />
        ))}
      </Instances>
    </group>
  );
}

/**
 * HeroDrone - Renders the Spline asset positioned in 3D
 */
function HeroDrone({ data }: { data: any }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * data.speed + data.offset;
      const x = Math.cos(t) * data.radius;
      const z = Math.sin(t) * data.radius;
      const y = data.height + Math.sin(t * 0.5 + data.phase) * 2;
      
      ref.current.position.set(x, y, z);
      ref.current.rotation.y = -t + Math.PI / 2;
    }
  });

  return (
    <group ref={ref}>
      <Html
        transform
        distanceFactor={10}
        occlude="blending"
        style={{
          width: '200px',
          height: '200px',
          pointerEvents: 'none',
        }}
      >
        <SplineDrone />
      </Html>
    </group>
  );
}

// Fallback Drone for Instances
function Drone({ data }: { data: any }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * data.speed + data.offset;
      const x = Math.cos(t) * data.radius;
      const z = Math.sin(t) * data.radius;
      const y = data.height + Math.sin(t * 0.5 + data.phase) * 2;
      ref.current.position.set(x, y, z);
      ref.current.rotation.y = -t + Math.PI / 2;
      ref.current.rotation.z = Math.sin(t * 2) * 0.2;
    }
  });
  return <Instance ref={ref} color={data.color} />;
}
