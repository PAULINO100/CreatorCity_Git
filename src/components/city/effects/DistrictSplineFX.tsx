'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

interface DistrictSplineFXProps {
  position: [number, number, number];
  color: string;
  count?: number;
}

/**
 * DistrictSplineFX - Procedural high-fidelity effects for Spline Districts.
 * Provides particles/sparkles and localized lighting when GLB assets are missing.
 */
export function DistrictSplineFX({ 
  position, 
  color, 
  count = 50 
}: DistrictSplineFXProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  // Pulse the light intensity for a more "alive" feel
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime;
      lightRef.current.intensity = 1.5 + Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Central Point Light to illuminate the Spline scene */}
      <pointLight 
        ref={lightRef}
        intensity={2} 
        distance={20} 
        color={color} 
        decay={2}
      />

      {/* Procedural Particles (Ideas/Data) */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Sparkles
          count={count}
          scale={8}
          size={2}
          speed={0.3}
          opacity={0.6}
          color={color}
          noise={1}
        />
      </Float>

      {/* Decorative Outer Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <ringGeometry args={[6, 6.2, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
