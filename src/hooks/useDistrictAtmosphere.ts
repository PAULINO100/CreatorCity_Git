'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CREATOR_DISTRICT } from '@/lib/districts/creator-district-config';
import { SCIENCE_DISTRICT } from '@/lib/districts/science-district-config';
import { TECH_AI_DISTRICT } from '@/lib/districts/tech-ai-district-config';

const DISTRICTS = [
  { 
    id: 'TECH', 
    pos: new THREE.Vector3(TECH_AI_DISTRICT.centerPosition.x, TECH_AI_DISTRICT.centerPosition.y, TECH_AI_DISTRICT.centerPosition.z), 
    color: new THREE.Color(TECH_AI_DISTRICT.effects.fog.color), 
    radius: TECH_AI_DISTRICT.radius 
  },
  { id: 'CREATOR', pos: new THREE.Vector3(-12, 10, 12), color: new THREE.Color('#a855f7'), radius: 25 },
  { id: 'SCIENCE', pos: new THREE.Vector3(12, 10, -12), color: new THREE.Color('#22c55e'), radius: 25 },
  { id: 'EDUCATION', pos: new THREE.Vector3(-12, 10, -12), color: new THREE.Color('#eab308'), radius: 25 },
  { id: 'STARTUP', pos: new THREE.Vector3(0, 10, 0), color: new THREE.Color('#ff6600'), radius: 25 },
  { id: 'DEFAULT', pos: new THREE.Vector3(0, 5, 0), color: new THREE.Color('#080414'), radius: 500 }
];

/**
 * useDistrictAtmosphere - Hook to calculate the dominant district atmosphere 
 * based on camera proximity and return interpolated colors for fog/lighting.
 */
export function useDistrictAtmosphere() {
  const { camera } = useThree();
  const [targetColor] = useState(() => new THREE.Color('#080414'));
  const [currentColor] = useState(() => new THREE.Color('#080414'));

  useFrame((state) => {
    let dominantDistrict = DISTRICTS[DISTRICTS.length - 1]; // Default
    let minDistance = Infinity;

    // Find the closest district the camera is within
    for (const district of DISTRICTS) {
      const dist = camera.position.distanceTo(district.pos);
      if (dist < district.radius && dist < minDistance) {
        minDistance = dist;
        dominantDistrict = district;
      }
    }

    // Interpolate fog color smoothly
    targetColor.copy(dominantDistrict.color);
    currentColor.lerp(targetColor, 0.02); // 2% lerp per frame for smooth transition
  });

  return { 
    fogColor: currentColor, 
    ambientIntensity: 0.15 + (currentColor.getHSL({ h: 0, s: 0, l: 0 }).l * 0.1) 
  };
}
