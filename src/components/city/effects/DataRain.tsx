'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerformanceStore, getQualitySettings } from '@/lib/city/performance-store';

import { useSplineAsset } from '@/lib/assets/spline-loader';

export function DataRain({ count, color }: { count?: number, color?: string }) {
  const { quality } = usePerformanceStore();
  const settings = useMemo(() => getQualitySettings(quality), [quality]);
  const baseCount = count || 1000;
  const PARTICLE_COUNT = Math.floor(baseCount * settings.dataRain);

  const splineParticle = null;
  const isLoading = false;

  const points = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i] = 0.1 + Math.random() * 0.2;
    }
    return { pos, velocities };
  }, [PARTICLE_COUNT]);

  useFrame(() => {
    if (points.current) {
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 1] -= particles.velocities[i];
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 30;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // If Spline asset is ready, we could use an instanced approach with the spline model
  // For now, we enhance the material if spline is "loading" but keep the points for massive count
  return (
    <points key={`data-rain-${PARTICLE_COUNT}`} ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isLoading ? 0.08 : 0.12}
        color={color || (isLoading ? "#00ff41" : "#00f3ff")}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
