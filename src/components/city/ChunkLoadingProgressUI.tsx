'use client';

import React, { useMemo } from 'react';
import { usePerformanceStore } from '@/lib/city/performance-store';

interface ChunkLoadingProgressUIProps {
  progress: number;       // 0-100
  loadedCount: number;
  totalCount: number;
  phase: 'idle' | 'chunk1' | 'chunk2' | 'chunk3' | 'done';
}

const phaseLabel: Record<string, string> = {
  idle: 'INITIALIZING',
  chunk1: 'LOADING DISTRICT CORE',
  chunk2: 'LOADING SUBURBS',
  chunk3: 'LOADING OUTSKIRTS',
  done: 'CITY READY',
};

export function ChunkLoadingProgressUI({
  progress,
  loadedCount,
  totalCount,
  phase,
}: ChunkLoadingProgressUIProps) {
  const { splineAssetsLoaded } = usePerformanceStore();

  const statusText = useMemo(() => {
    if (progress >= 100) return 'CITY READY';
    const base = `LOADING METROPOLIS: ${loadedCount}/${totalCount}`;
    return splineAssetsLoaded ? `${base} + VISUAL ASSETS READY` : `${base}...`;
  }, [progress, loadedCount, totalCount, splineAssetsLoaded]);

  if (phase === 'done' || phase === 'idle' || totalCount === 0) return null;

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{ width: 320 }}
    >
      <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 flex flex-col gap-2">
        {/* Label */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
            {phaseLabel[phase] ?? 'LOADING'}
          </span>
          <span className="text-[9px] font-black text-slate-400">
            {loadedCount} / {totalCount} buildings
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Chunk milestones */}
        <div className="flex justify-between mt-0.5">
          {[33, 66, 100].map((milestone) => (
            <div key={milestone} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  progress >= milestone ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'bg-slate-700'
                }`}
              />
              <span className={`text-[7px] font-black ${progress >= milestone ? 'text-cyan-400' : 'text-slate-600'}`}>
                {milestone}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
