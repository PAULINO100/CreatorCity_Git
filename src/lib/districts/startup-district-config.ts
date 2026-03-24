export const STARTUP_DISTRICT = {
  id: 'startup',
  name: 'RUST DISTRICT',
  description: 'Segurança & Sistemas (Safe & Fast)',
  color: '#EA580C',
  neonColor: '#FACC15',
  centerPosition: { x: 0, y: 10, z: 0 },
  radius: 200,
  buildingCount: 300,
  splineAssets: {
    neonSign: {
      url: 'https://prod.spline.design/seykuYikeIwpprZn/scene.splinecode',
      useProceduralFallback: true,
    },
    label: '[RUST DISTRICT]',
    sublabel: 'RUST / SISTEMAS / SEGURANÇA'
  },
  lod: {
    maxDistance: 150,
    minDistance: 0.5,
    detailLevel: 'ULTRA'
  }
} as const;
