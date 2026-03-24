import { create } from 'zustand';

export type QualityLevel = 'ULTRA' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CULL';

export const FALLBACK_LADDER = [1018, 800, 500, 300];

interface PerformanceState {
  quality: QualityLevel;
  setQuality: (quality: QualityLevel) => void;
  budget: number;
  setBudget: (budget: number) => void;
  isStable: boolean;
  setStable: (stable: boolean) => void;
  showProfiler: boolean;
  toggleProfiler: () => void;
  autoQuality: boolean;
  toggleAutoQuality: () => void;
  postProcessingEnabled: boolean;
  setPostProcessing: (enabled: boolean) => void;
  splineAssetsLoaded: boolean;
  setSplineAssetsLoaded: (loaded: boolean) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  quality: 'LOW',
  setQuality: (quality) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atlas-quality', quality);
    }
    set({ quality });
  },
  budget: 1018,
  setBudget: (budget) => set({ budget }),
  isStable: false,
  setStable: (isStable) => set({ isStable }),
  showProfiler: false,
  toggleProfiler: () => set((state) => ({ showProfiler: !state.showProfiler })),
  autoQuality: true,
  toggleAutoQuality: () => set((state) => ({ autoQuality: !state.autoQuality })),
  postProcessingEnabled: true,
  setPostProcessing: (enabled) => set({ postProcessingEnabled: enabled }),
  splineAssetsLoaded: false,
  setSplineAssetsLoaded: (loaded) => set({ splineAssetsLoaded: loaded }),
}));

// Initialize store from localStorage if available
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('atlas-quality') as QualityLevel;
  if (saved) {
    usePerformanceStore.getState().setQuality(saved);
  }
}

export const getQualitySettings = (quality: QualityLevel) => {
  switch (quality) {
    case 'ULTRA':
      return {
        dpr: 2,
        shadowRes: 2048,
        shadowFar: 60,
        // Tuned for 1018 buildings: wider tiers reduce Ultra overdraw
        lodDistances: [8, 20, 45, 100, 200],
        drones: 25,
        dataRain: 1.0,
        bloomSamples: 8,
        reflectionRes: 1024,
        postProcessing: true,
        hdr: true,
      };
    case 'HIGH':
      return {
        dpr: 1.5,
        shadowRes: 1024,
        shadowFar: 45,
        lodDistances: [6, 16, 35, 75, 150],
        drones: 15,
        dataRain: 0.7,
        bloomSamples: 6,
        reflectionRes: 512,
        postProcessing: true,
        hdr: true,
      };
    case 'MEDIUM':
      return {
        dpr: 1.0,
        shadowRes: 512,
        shadowFar: 25,
        lodDistances: [5, 12, 28, 60, 120],
        drones: 8,
        dataRain: 0.4,
        bloomSamples: 4,
        reflectionRes: 256,
        postProcessing: true,
        hdr: false,
      };
    case 'LOW':
      return {
        dpr: 0.75,
        shadowRes: 256,
        shadowFar: 15,
        // Low: keep Ultra radius tiny (3u), most in Mid/Far/Cull
        lodDistances: [3, 8, 18, 40, 80],
        drones: 0,
        dataRain: 0.0,
        bloomSamples: 0,
        reflectionRes: 0,
        postProcessing: false,
        hdr: false,
      };
    case 'CULL':
    default:
      return {
        dpr: 0.5,
        shadowRes: 0,
        shadowFar: 0,
        lodDistances: [2, 5, 10, 20, 40],
        drones: 0,
        dataRain: 0,
        bloomSamples: 0,
        reflectionRes: 0,
        postProcessing: false,
        hdr: false,
      };
  }
};
