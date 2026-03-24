'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface SplineBuildingData {
  geometry: THREE.BufferGeometry | null;
  material: THREE.Material | null;
}

interface SplineRegistry {
  [district: string]: SplineBuildingData;
}

const SplineBuildingContext = createContext<{ registry: SplineRegistry; isLoading: boolean }>({
  registry: {},
  isLoading: true,
});

const DISTRICT_MODELS = {
  science: 'https://prod.spline.design/J3Gk22PIn1e1zZ8m/scene.splinecode', // AI
  startup: 'https://prod.spline.design/J3Gk22PIn1e1zZ8m/scene.splinecode', // RUST
  education: 'https://prod.spline.design/J3Gk22PIn1e1zZ8m/scene.splinecode', // PYTHON
  creator: 'https://prod.spline.design/J3Gk22PIn1e1zZ8m/scene.splinecode', // WEB
  tech: 'https://prod.spline.design/J3Gk22PIn1e1zZ8m/scene.splinecode',
};

import { Application } from '@splinetool/runtime';

export function SplineBuildingProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<SplineRegistry>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const canvas = document.createElement('canvas');
    const spline = new Application(canvas);
    
    // Load with timeout to ensure fallback kicks in if Spline is unreachable (CORS/403)
    const loadPromise = spline.load(DISTRICT_MODELS.science);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3000));

    Promise.race([loadPromise, timeoutPromise]).then(() => {
      if (!isMounted) return;

      const scene = (spline as any)._scene;
      if (!scene) {
        setIsLoading(false);
        return;
      }

      let buildingGeom: THREE.BufferGeometry | null = null;
      let buildingMat: THREE.Material | null = null;

      scene.traverse((child: any) => {
        if (child.isMesh && !buildingGeom) {
          buildingGeom = child.geometry.clone();
          let sourceMat = Array.isArray(child.material) ? child.material[0] : child.material;
          
          if (sourceMat && typeof sourceMat.clone === 'function') {
            try {
               buildingMat = sourceMat.clone();
            } catch (e) {
               buildingMat = new THREE.MeshStandardMaterial({ color: '#3b82f6' });
            }
          } else {
            buildingMat = new THREE.MeshStandardMaterial({ color: '#3b82f6' });
          }
          
          if (buildingMat instanceof THREE.MeshStandardMaterial) {
            buildingMat.emissiveIntensity = 2.0;
            buildingMat.metalness = 0.8;
            buildingMat.roughness = 0.2;
          }
        }
      });

      const newRegistry: SplineRegistry = {};
      Object.keys(DISTRICT_MODELS).forEach((d) => {
        newRegistry[d] = {
          geometry: buildingGeom,
          material: buildingMat ? buildingMat.clone() : null,
        };
      });

      setRegistry(newRegistry);
      setIsLoading(false);
    }).catch((err: any) => {
      console.warn('Spline Source unreachable or timeout. Using procedural fallback.', err);
      // Initialize with nulls to trigger box fallback in BuildingInstances
      const fallbackRegistry: SplineRegistry = {};
      Object.keys(DISTRICT_MODELS).forEach((d) => {
        fallbackRegistry[d] = { geometry: null, material: null };
      });
      if (isMounted) {
        setRegistry(fallbackRegistry);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      spline.dispose();
    };
  }, []);

  return (
    <SplineBuildingContext.Provider value={{ registry, isLoading }}>
      {children}
    </SplineBuildingContext.Provider>
  );
}

export const useSplineBuilding = (district?: string) => {
  const { registry, isLoading } = useContext(SplineBuildingContext);
  const data = district ? registry[district] : Object.values(registry)[0];
  return { ...data, registry, isLoading };
};
