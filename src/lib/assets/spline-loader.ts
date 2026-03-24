'use client';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useEffect } from 'react';
import { usePerformanceStore } from '@/lib/city/performance-store';

/**
 * useSplineAsset - Hook to load and cache Spline-exported GLB assets.
 * Supports KTX2 compression and centralized performance monitoring.
 */
export function useSplineAsset(path: string) {
  const { setSplineAssetsLoaded } = usePerformanceStore();
  
  // Note: KTX2 support requires a transcoder path.
  // In a real environment, you'd point this to a WASM transcoder.
  const gltf = useGLTF(path, true); // Use Draco/KTX2 if available

  useEffect(() => {
    if (gltf) {
      setSplineAssetsLoaded?.(true);
    }
  }, [gltf, setSplineAssetsLoaded]);

  const scene = useMemo(() => {
    if (!gltf) return null;
    const cloned = gltf.scene.clone();
    
    // Auto-setup shadows and materials
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          // Enhance with cyberpunk emissive logic if needed
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.emissiveIntensity !== undefined) {
             mat.emissiveIntensity = 2.0;
          }
        }
      }
    });
    
    return cloned;
  }, [gltf]);

  return { scene, animations: gltf?.animations, isLoading: !gltf };
}

// Preload common assets
export function preloadSplineAssets() {
  useGLTF.preload('/assets/spline/DroneCyberpunk.glb');
  useGLTF.preload('/assets/spline/ParticleDataRain.glb');
}
