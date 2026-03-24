'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlaceholderCitizen {
  id: string;
  x: number;
  y: number;
  score?: number;
}

interface ChunkPlaceholdersProps {
  citizens: PlaceholderCitizen[];
}

const PLACEHOLDER_GEO = new THREE.BoxGeometry(1, 1, 1);

export function ChunkPlaceholders({ citizens }: ChunkPlaceholdersProps) {
  const [displayCitizens, setDisplayCitizens] = useState<PlaceholderCitizen[]>(citizens);
  const opacityRef = useRef(1);
  const isFadingOut = useRef(false);
  
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#1e293b', 
    transparent: true, 
    opacity: 1,
    depthWrite: false 
  }), []);

  useEffect(() => {
    if (citizens.length > 0) {
      setDisplayCitizens(citizens);
      opacityRef.current = 1;
      isFadingOut.current = false;
      mat.opacity = 1;
      mat.visible = true;
    } else if (displayCitizens.length > 0 && !isFadingOut.current) {
      // Start fade out
      isFadingOut.current = true;
    }
  }, [citizens, displayCitizens.length, mat]);

  useFrame((state, delta) => {
    if (isFadingOut.current) {
      opacityRef.current = Math.max(0, opacityRef.current - delta * 1.25); // ~800ms fade
      mat.opacity = opacityRef.current;
      if (opacityRef.current <= 0) {
        mat.visible = false;
        isFadingOut.current = false;
        setDisplayCitizens([]);
      }
    }
  });

  if (displayCitizens.length === 0) return null;

  return (
    <Instances limit={Math.max(displayCitizens.length, 100)} geometry={PLACEHOLDER_GEO} material={mat}>
      {displayCitizens.map((c) => {
        const height = Math.max(0.1, (c.score ?? 1000) / 10000);
        const width = 0.25;
        return (
          <Instance
            key={`ph-${c.id}`}
            position={[c.x * 0.2 - 10, height / 2, c.y * 0.2 - 10]}
            scale={[width, height, width]}
          />
        );
      })}
    </Instances>
  );
}
