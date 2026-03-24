'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { SplineWrapper } from '@/components/common/SplineWrapper';
import { shouldLoadSpline } from '@/lib/spline/spline-config';
import { DistrictSplineFX } from './DistrictSplineFX';

interface SplineDistrictProps {
  position: [number, number, number];
  sceneUrl: string;
  name: string;
  color?: string;
  glowColor?: string;
}

/**
 * SplineDistrict - Renders a high-fidelity Spline scene for a specific district.
 * Parameters allow for district-specific branding (TECH: Cyan, CREATOR: Purple, etc).
 */
export function SplineDistrict({ 
  position, 
  sceneUrl, 
  name, 
  color = '#22d3ee', // Default Cyan
  glowColor = 'rgba(34,211,238,0.1)' 
}: SplineDistrictProps) {
  const canLoadSpline = useMemo(() => shouldLoadSpline(), []);

  if (!canLoadSpline) return null;

  return (
    <group position={position}>
      {/* High-Fidelity Procedural Effects */}
      <DistrictSplineFX position={[0, 0, 0]} color={color} />

      <Html
        transform
        distanceFactor={12}
        occlude="blending"
        style={{
          width: '500px',
          height: '500px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="w-full h-full relative group flex items-center justify-center">
          {/* District Glow - Dynamic Color */}
          <div 
            className="absolute inset-0 blur-[100px] rounded-full" 
            style={{ backgroundColor: glowColor }}
          />
          
          <div className="w-[400px] h-[400px] relative">
            <SplineWrapper 
              sceneUrl={sceneUrl}
              className="w-full h-full"
              fallbackColor="transparent"
            />
          </div>
          
          {/* Central Label - Dynamic Color */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-2">
            <div 
              className="w-24 h-px" 
              style={{ background: `linear-gradient(to r, transparent, ${color}, transparent)` }}
            />
            <h2 
              className="text-[12px] font-black tracking-[0.6em] whitespace-nowrap"
              style={{ color, textShadow: `0 0 12px ${color}` }}
            >
              {name} DISTRICT
            </h2>
            <div 
              className="w-24 h-px" 
              style={{ background: `linear-gradient(to r, transparent, ${color}, transparent)` }}
            />
            <span 
              className="text-[7px] font-bold tracking-widest mt-1 opacity-50"
              style={{ color }}
            >
              META-SECTOR ACTIVE
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}
