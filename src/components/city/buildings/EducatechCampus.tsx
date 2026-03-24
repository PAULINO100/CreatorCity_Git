'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

interface UniqueBuildingProps {
  lod: 'ULTRA' | 'NEAR' | 'FAR';
  color?: string;
}

export function EducatechCampus({ lod }: UniqueBuildingProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      sphereRef.current.position.y = 5 + Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <group>
      {/* 1. Base Structure */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 4]} />
        <meshStandardMaterial color="#0a0f1e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 2. Entrance Portal (Ultra only) */}
      {lod === 'ULTRA' && (
        <group position={[0, 0, 2.1]}>
          <mesh>
            <boxGeometry args={[2, 2.5, 0.1]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
          </mesh>
          <pointLight color="#3b82f6" intensity={2} distance={5} />
        </group>
      )}

      {/* 3. Central AI Sphere */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={sphereRef} position={[0, 5, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <MeshDistortMaterial
            color="#00ffff"
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0}
            distort={0.4}
            speed={2}
          />
        </mesh>
      </Float>

      {/* 4. Holographic Rings (Ultra/Near) */}
      {lod !== 'FAR' && (
        <group position={[0, 5, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * Math.PI / 3]}>
              <torusGeometry args={[1.8 + i * 0.4, 0.02, 16, 100]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.5 - i * 0.1} />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. Logo/Text (Ultra only) */}
      {lod === 'ULTRA' && (
        <Text
          position={[0, 3.5, 2.1]}
          fontSize={0.4}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
        >
          EDUCATECH AI
          <meshBasicMaterial color="#3b82f6" toneMapped={false} />
        </Text>
      )}

      {/* 6. Support Pillars */}
      <group>
        {[-1.8, 1.8].map((x) => 
          [-1.8, 1.8].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 4, z]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}
