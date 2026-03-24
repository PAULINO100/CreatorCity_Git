'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface DistrictNeonProps {
  name: string;
  position: [number, number, number];
  color: string;
}

/**
 * DistrictNeon - Floating 3D Text with Neon Glow and Pulse Effect
 * Designed as a hybrid component (procedural visual + high-end glow)
 */
export function DistrictNeon({ name, position, color }: DistrictNeonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Smooth pulse animation (2s cycle)
  useFrame((state) => {
    if (materialRef.current) {
      const time = state.clock.elapsedTime;
      // Pulse between 1.0 and 2.5 intensity
      const pulse = Math.sin((time * Math.PI) / 1.0) * 0.75 + 1.75;
      materialRef.current.opacity = 0.6 + Math.sin(time * Math.PI) * 0.2;
      
      // If using Bloom, the brightness (values > 1) will trigger the glow
      if (materialRef.current.color) {
        materialRef.current.color.set(color).multiplyScalar(pulse);
      }
    }
  });

  return (
    <Float
      speed={2} 
      rotationIntensity={0.2} 
      floatIntensity={0.5} 
      position={position}
    >
      <Text
        ref={meshRef}
        fontSize={0.6} // Reduced size for better buffer management
        maxWidth={2}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {name}
        <meshBasicMaterial 
          ref={materialRef}
          color={color}
          transparent
          opacity={0.8}
          toneMapped={false} // CRITICAL for Neon Glow/Bloom
          blending={THREE.AdditiveBlending}
        />
      </Text>
      
      {/* Visual Support Glow (Backlight) */}
      <mesh scale={[1.2, 0.4, 0.1]}>
        <planeGeometry />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Float>
  );
}
