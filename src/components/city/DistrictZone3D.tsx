'use client';

import React from 'react';
import * as THREE from 'three';

interface DistrictZone3DProps {
  position: [number, number, number];
  size: [number, number];
  color: string;
  label: string;
}

const DISTRICT_ZONES: DistrictZone3DProps[] = [
  { position: [-5, 0.005, -5], size: [10, 10], color: '#3b82f6', label: 'TECH' },
  { position: [5, 0.005, -5], size: [10, 10], color: '#a855f7', label: 'CREATOR' },
  { position: [-5, 0.005, 5], size: [10, 10], color: '#22c55e', label: 'SCIENCE' },
  { position: [3, 0.005, 5], size: [7, 10], color: '#eab308', label: 'EDUCATION' },
  { position: [9, 0.005, 5], size: [3, 10], color: '#f97316', label: 'STARTUP' },
];

function Zone({ position, size, color }: DistrictZone3DProps) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

export function DistrictZones() {
  return (
    <group>
      {DISTRICT_ZONES.map((zone) => (
        <Zone key={zone.label} {...zone} />
      ))}
      {/* District border lines */}
      {DISTRICT_ZONES.map((zone) => (
        <lineSegments key={`border-${zone.label}`} position={[zone.position[0], 0.01, zone.position[2]]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(zone.size[0], zone.size[1])]} />
          <lineBasicMaterial color={zone.color} transparent opacity={0.15} />
        </lineSegments>
      ))}
    </group>
  );
}

export default DistrictZones;
