'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChunkableCitizen {
  id: string;
  x: number;
  y: number;
}

export interface ChunkState<T extends ChunkableCitizen> {
  chunk1: T[];      // 33% — closest buildings (Ultra LOD)
  chunk2: T[];      // 66% — mid-range buildings (Mid LOD)
  chunk3: T[];      // 100% — distant buildings (Far LOD)
  placeholders: T[]; // all citizens, used for simple cube rendering while real chunks load
  progress: number;  // 0 → 100
  phase: 'idle' | 'chunk1' | 'chunk2' | 'chunk3' | 'done';
  loadedCount: number;
  totalCount: number;
}

const chunkThresholds = [0.33, 0.66, 1.0];

// Convert grid (x,y) to world coords for distance calc
function toWorld(x: number, y: number): THREE.Vector2 {
  return new THREE.Vector2(x * 0.2 - 10, y * 0.2 - 10);
}

// ── Priority-Queue Sort ────────────────────────────────────────────────────

function sortByDistance<T extends ChunkableCitizen>(citizens: T[]): T[] {
  return [...citizens].sort((a, b) => {
    const da = toWorld(a.x, a.y).distanceTo(new THREE.Vector2(0, 0));
    const db = toWorld(b.x, b.y).distanceTo(new THREE.Vector2(0, 0));
    return da - db;
  });
}

// ── Frustum Culling ────────────────────────────────────────────────────────

export function isInFrustum<T extends ChunkableCitizen>(
  citizen: T,
  camera: THREE.PerspectiveCamera
): boolean {
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  const wx = citizen.x * 0.2 - 10;
  const wz = citizen.y * 0.2 - 10;
  const pos = new THREE.Vector3(wx, 0, wz);
  return frustum.containsPoint(pos);
}

// ── Memory Usage Estimation ────────────────────────────────────────────────

function getMemoryUsagePercent(): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mem = (performance as any).memory;
  if (!mem) return 0;
  return (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100;
}

// ── use Chunked Loader ─────────────────────────────────────────────────────

export function useChunkedLoader<T extends ChunkableCitizen>(
  allCitizens: T[],
  { chunk1delay: _c1 = 0, chunk2delay: _c2 = 1500, chunk3delay: _c3 = 3000, memoryThreshold = 95 } = {}
) {
  const [state, setState] = useState<ChunkState<T>>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('atlas-chunk-progress');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.totalCount === allCitizens.length && allCitizens.length > 0) {
             return { ...parsed, placeholders: allCitizens }; // Restore phase but refresh objects
          }
        } catch (e) { console.error(e); }
      }
    }
    return {
      chunk1: [], chunk2: [], chunk3: [], placeholders: [],
      progress: 0, phase: 'idle', loadedCount: 0, totalCount: 0,
    };
  });

  const pausedRef = useRef(false);
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer3Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetTime = useRef(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (allCitizens.length === 0) return;

    // Session Persistence: save current state
    if (state.phase !== 'idle') {
      sessionStorage.setItem('atlas-chunk-progress', JSON.stringify({
        ...state,
        chunk1: state.chunk1.map(c => ({ id: c.id, x: c.x, y: c.y })), // Minimal data
        chunk2: state.chunk2.map(c => ({ id: c.id, x: c.x, y: c.y })),
        chunk3: state.chunk3.map(c => ({ id: c.id, x: c.x, y: c.y })),
        placeholders: [],
      }));
    }

    // Reset logic with stability check
    const diff = Math.abs(allCitizens.length - prevCountRef.current);
    const now = Date.now();
    
    if (prevCountRef.current > 0 && diff < 10 && (now - lastResetTime.current < 5000)) {
        console.log('[useChunkedLoader] Ignoring small change to avoid flicker reset');
        return;
    }

    if (state.phase !== 'idle' && state.totalCount === allCitizens.length) return;

    console.log('[useChunkedLoader] Resetting/Starting loader cycle');
    lastResetTime.current = now;
    prevCountRef.current = allCitizens.length;

    // Clear previous timers
    if (timer2Ref.current) clearTimeout(timer2Ref.current);
    if (timer3Ref.current) clearTimeout(timer3Ref.current);

    const sorted = sortByDistance(allCitizens);
    const total = sorted.length;
    const cut1 = Math.floor(total * chunkThresholds[0]);
    const cut2 = Math.floor(total * chunkThresholds[1]);

    const c1 = sorted.slice(0, cut1);
    const c2 = sorted.slice(cut1, cut2);
    const c3 = sorted.slice(cut2);

    const t1 = setTimeout(() => {
      setState(prev => ({
        ...prev,
        chunk1: c1,
        placeholders: allCitizens,
        progress: 33,
        phase: 'chunk1',
        loadedCount: c1.length,
        totalCount: total,
      }));
    }, 500);

    timer2Ref.current = setTimeout(() => {
      if (pausedRef.current || getMemoryUsagePercent() > memoryThreshold) return;
      setState(prev => ({
        ...prev,
        chunk2: c2,
        progress: 66,
        phase: 'chunk2',
        loadedCount: c1.length + c2.length,
      }));
    }, 2500);

    timer3Ref.current = setTimeout(() => {
      if (pausedRef.current || getMemoryUsagePercent() > memoryThreshold) {
        setState(prev => ({ ...prev, phase: 'done' }));
        return;
      }
      setState(prev => ({
        ...prev,
        chunk3: c3,
        placeholders: [],
        progress: 100,
        phase: 'done',
        loadedCount: total,
      }));
    }, 5500);

    return () => {
      clearTimeout(t1);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
      if (timer3Ref.current) clearTimeout(timer3Ref.current);
    };
  }, [allCitizens.length, memoryThreshold]);

  const pauseLoading = useCallback(() => { pausedRef.current = true; }, []);
  const resumeLoading = useCallback(() => {
    pausedRef.current = false;
    // Re-schedule remaining chunks if still in early phase
    setState(prev => {
      if (prev.phase === 'chunk1') {
        timer2Ref.current = setTimeout(() => {
          const sorted = sortByDistance(allCitizens);
          const total = sorted.length;
          const cut1 = Math.floor(total * 0.33);
          const cut2 = Math.floor(total * 0.66);
          const chunk2 = sorted.slice(cut1, cut2);
          setState(s => ({ ...s, chunk2, progress: 66, phase: 'chunk2', loadedCount: cut2 }));
        }, 500);
      }
      return prev;
    });
  }, [allCitizens]);

  return { ...state, pauseLoading, resumeLoading };
}
