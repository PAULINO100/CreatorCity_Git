'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePerformanceStore, getQualitySettings, QualityLevel } from '@/lib/city/performance-store';

export function CityPerformanceOptimizer() {
  const { quality, setQuality, autoQuality, setPostProcessing, budget, setBudget, setStable } = usePerformanceStore();
  const { gl } = useThree();
  const fpsRef = useRef<number[]>([]);
  const lastTime = useRef(0);
  const consecutiveLowFps = useRef(0);
  const consecutiveHighFps = useRef(0);
  
  const FALLBACK_LADDER = [1018, 800, 500, 300];

  useEffect(() => {
    lastTime.current = performance.now();
  }, []);

  useFrame((state, delta) => {
    if (!autoQuality) return;

    const fps = 1 / delta;
    fpsRef.current.push(fps);
    if (fpsRef.current.length > 60) fpsRef.current.shift();

    if (fpsRef.current.length < 30) return;

    const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;

    // Hysteresis Logic
    if (avgFps < 25) {
      consecutiveLowFps.current++;
      consecutiveHighFps.current = 0;
      setStable(false);

      if (consecutiveLowFps.current > 180) { // ~3 seconds at 60fps
        // 1. First try dropping quality
        const levels: QualityLevel[] = ['ULTRA', 'HIGH', 'MEDIUM', 'LOW', 'CULL'];
        const qIdx = levels.indexOf(quality);
        if (qIdx < levels.length - 1) {
          setQuality(levels[qIdx + 1]);
          console.log(`[PERF] Low FPS (${Math.round(avgFps)}). Dropping quality to ${levels[qIdx + 1]}`);
        } else {
          // 2. If already at lowest quality, drop budget
          const bIdx = FALLBACK_LADDER.indexOf(budget);
          if (bIdx !== -1 && bIdx < FALLBACK_LADDER.length - 1) {
            setBudget(FALLBACK_LADDER[bIdx + 1]);
            console.log(`[PERF] Critical FPS. Dropping budget to ${FALLBACK_LADDER[bIdx + 1]}`);
          }
        }
        consecutiveLowFps.current = 0;
      }
    } else if (avgFps > 35) {
      consecutiveHighFps.current++;
      consecutiveLowFps.current = 0;

      if (consecutiveHighFps.current > 300) { // ~5 seconds at 60fps
        setStable(true);
        // Step-up with safeguard (random + check if stable)
        if (Math.random() > 0.98) {
          const bIdx = FALLBACK_LADDER.indexOf(budget);
          if (bIdx > 0) {
            setBudget(FALLBACK_LADDER[bIdx - 1]);
            console.log(`[PERF] High FPS (${Math.round(avgFps)}). Boosting budget to ${FALLBACK_LADDER[bIdx - 1]}`);
          } else {
            const levels: QualityLevel[] = ['ULTRA', 'HIGH', 'MEDIUM', 'LOW', 'CULL'];
            const qIdx = levels.indexOf(quality);
            if (qIdx > 0) {
              setQuality(levels[qIdx - 1]);
              console.log(`[PERF] High FPS. Boosting quality to ${levels[qIdx - 1]}`);
            }
          }
        }
        consecutiveHighFps.current = 0;
      }
    } else {
      consecutiveLowFps.current = Math.max(0, consecutiveLowFps.current - 1);
      consecutiveHighFps.current = Math.max(0, consecutiveHighFps.current - 1);
    }
  });

  // Sync gl properties with quality
  useEffect(() => {
    const settings = getQualitySettings(quality);
    if (gl) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2) * settings.dpr);
      setPostProcessing(settings.postProcessing);
    }
  }, [quality, gl, setPostProcessing]);

  return null;
}
