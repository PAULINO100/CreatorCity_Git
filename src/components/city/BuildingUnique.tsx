'use client';

import React, { useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EducatechCampus } from './buildings/EducatechCampus';
import { AITower } from './buildings/AITower';
import { BlueprintType } from '@/lib/buildings/blueprint-registry';
import { useSplineAsset } from '@/lib/assets/spline-loader';

interface BuildingUniqueProps {
  type: BlueprintType;
  position: [number, number, number];
  color?: string;
}

export function BuildingUnique({ type, position, color }: BuildingUniqueProps) {
  const { camera } = useThree();
  const [lod, setLod] = React.useState<'ULTRA' | 'NEAR' | 'FAR'>('FAR');

  useFrame(() => {
    const posVector = new THREE.Vector3(...position);
    const dist = camera.position.distanceTo(posVector);

    if (dist < 15) {
      if (lod !== 'ULTRA') setLod('ULTRA');
    } else if (dist < 30) {
      if (lod !== 'NEAR') setLod('NEAR');
    } else {
      if (lod !== 'FAR') setLod('FAR');
    }
  });

  const Model = useMemo(() => {
    switch (type) {
      case 'EDUCATECH_CAMPUS':
        return EducatechCampus;
      case 'AI_TOWER':
        return AITower;
      default:
        return null;
    }
  }, [type]);

  const { scene: splineModel, isLoading } = useSplineAsset(`/assets/spline/Building_${type}.glb`);

  if (!Model) return null;

  return (
    <group position={position}>
      {splineModel ? (
        <primitive object={splineModel} />
      ) : (
        <Model lod={lod} color={color} />
      )}
    </group>
  );
}
