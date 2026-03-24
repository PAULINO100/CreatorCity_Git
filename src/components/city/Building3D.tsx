'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface Building3DProps {
  position: [number, number, number];
  height: number;
  color: string;
  glowColor: string;
  score: number;
  isHighlighted?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export function Building3D({ 
  position, height, color, glowColor, score,
  isHighlighted, onClick, onPointerOver, onPointerOut 
}: Building3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Subtle float animation for highlighted buildings
  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.position.y = position[1] + height / 2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      glowRef.current.scale.set(s, 1, s);
    }
  });

  // Building width varies slightly by score
  const width = 0.3 + Math.min(score / 20000, 0.4);
  const depth = width;

  const emissiveIntensity = isHighlighted ? 0.8 : 0.2;

  return (
    <group position={position}>
      {/* Main Building Body */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Window Lines (horizontal stripes) */}
      {Array.from({ length: Math.min(Math.floor(height / 0.4), 12) }).map((_, i) => (
        <mesh key={i} position={[0, 0.3 + i * 0.4, depth / 2 + 0.001]}>
          <planeGeometry args={[width * 0.8, 0.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      ))}

      {/* Ground Glow */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[width * 1.5, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={score > 5000 ? 0.25 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Score beacon for top buildings */}
      {score > 8000 && (
        <mesh position={[0, height + 0.3, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// For rendering many buildings efficiently
export function BuildingInstances({ buildings }: { buildings: Array<{
  x: number; y: number; height: number; color: string; glowColor: string;
  name: string; score: number; id: string; district: string;
}> }) {
  return (
    <group>
      {buildings.map(b => (
        <Building3D
          key={b.id}
          position={[b.x * 0.2 - 10, 0, b.y * 0.2 - 10]}
          height={Math.max(0.3, b.height * 0.06)}
          color={b.color}
          glowColor={b.glowColor}
          score={b.score}
        />
      ))}
    </group>
  );
}

export default Building3D;
