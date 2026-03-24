'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface UniqueBuildingProps {
  lod: 'ULTRA' | 'NEAR' | 'FAR';
  color?: string;
}

export function AITower({ lod }: UniqueBuildingProps) {
  const lineMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      sphereRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group>
      {/* 1. Core Pillar */}
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <cylinderGeometry args={[1, 1.5, 12, 8]} />
        <meshStandardMaterial color="#0c0a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 2. Neural Connections (Ultra/Near only) */}
      {lod !== 'FAR' && (
        <group>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
              <mesh position={[1.5, 6, 0]}>
                <boxGeometry args={[0.1, 10, 0.1]} />
                <meshBasicMaterial 
                  ref={i === 0 ? lineMaterialRef : null} 
                  color="#a855f7" 
                  transparent 
                  opacity={0.5} 
                />
              </mesh>
              {/* Floating Data Bits */}
              {lod === 'ULTRA' && [2, 4, 6, 8, 10].map((y) => (
                <mesh key={y} position={[1.5, y, 0]}>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* 3. Top Data Sphere */}
      <Float speed={4} rotationIntensity={2} floatIntensity={1}>
        <mesh ref={sphereRef} position={[0, 13, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <MeshDistortMaterial
            color="#a855f7"
            envMapIntensity={2}
            distort={0.3}
            speed={4}
            roughness={0}
          />
          <pointLight color="#a855f7" intensity={3} distance={10} />
        </mesh>
      </Float>

      {/* 4. Base Pulsing Glow (Ultra only) */}
      {lod === 'ULTRA' && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4, 32]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.1} />
        </mesh>
      )}

      {/* 5. HUD Label (Ultra only) */}
      {lod === 'ULTRA' && (
        <Text
          position={[0, 2, 2]}
          fontSize={0.3}
          color="#a855f7"
        >
          NEURAL TOWER v1.0
        </Text>
      )}
    </group>
  );
}
