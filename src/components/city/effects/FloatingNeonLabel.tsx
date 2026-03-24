'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingNeonLabelProps {
  position: [number, number, number];
  label: string;
  sublabel?: string;
  color: string;
  neonColor: string;
}

/**
 * FloatingNeonLabel - Implements the iconic district markers from the reference vision.
 * Features a glowing background, stylized brackets, and secondary informational text.
 */
export function FloatingNeonLabel({ position, label, sublabel, color, neonColor }: FloatingNeonLabelProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group position={position} ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Main Neon Label */}
        <Text
          fontSize={1.2}
          color={neonColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={color}
          outlineOpacity={0.8}
        >
          {label}
        </Text>

        {/* Sublabel / Description */}
        {sublabel && (
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.35}
            color="#FFFFFF"
            maxWidth={5}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
          >
            {sublabel}
          </Text>
        )}
      </Float>
      
      {/* Light Source for the area */}
      <pointLight position={[0, 0, 0]} color={neonColor} intensity={25} distance={20} decay={2} />
    </group>
  );
}
