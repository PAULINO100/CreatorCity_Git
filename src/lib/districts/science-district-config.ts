export const SCIENCE_DISTRICT = {
  id: 'science',
  name: 'SCIENCE DISTRICT',
  description: 'Neural Networks & Machine Learning',
  color: '#8B5CF6',
  neonColor: '#D946EF',
  centerPosition: { x: 150, y: 10, z: -150 },
  radius: 180,
  buildingCount: 150,
  splineAssets: {
    neonSign: {
      url: 'https://prod.spline.design/kZ-9m-0_0-3_/scene.splinecode',
      useProceduralFallback: true,
    },
    label: '[SCIENCE DISTRICT]',
    sublabel: 'QUANTUM / RESEARCH / BIO-TECH'
  },
  lod: {
    maxDistance: 120,
    minDistance: 0.5,
    detailLevel: 'HIGH'
  }
} as const;
