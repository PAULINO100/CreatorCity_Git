'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';

interface SpotLightProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildings: any[];
}

export function SpotLights({ buildings }: SpotLightProps) {
  const highScorers = useMemo(() => {
    return buildings
      .filter(b => b.score > 9000)
      .slice(0, 10) // Limit for performance
      .map(b => ({
        id: b.id,
        x: b.x * 0.2 - 10,
        z: b.y * 0.2 - 10,
        height: b.height,
        color: b.color
      }));
  }, [buildings]);

  if (highScorers.length === 0) return null;

  return (
    <Instances limit={10} range={highScorers.length}>
      <cylinderGeometry args={[0.05, 0.5, 40, 8]} />
      <meshBasicMaterial 
        transparent 
        opacity={0.3} 
        toneMapped={false} 
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
      {highScorers.map((s) => (
        <Instance
          key={s.id}
          position={[s.x, 20, s.z]}
          color={s.color}
        />
      ))}
    </Instances>
  );
}
