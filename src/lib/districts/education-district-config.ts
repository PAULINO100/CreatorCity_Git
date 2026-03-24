export const EDUCATION_DISTRICT = {
  id: 'education',
  name: 'PYTHON DISTRICT',
  description: 'Data Science & Automação',
  color: '#16A34A',
  neonColor: '#FDE047',
  centerPosition: { x: -12, y: 10, z: -12 },
  radius: 180,
  buildingCount: 180,
  splineAssets: {
    neonSign: {
      url: 'https://prod.spline.design/SEY4M-3M_-M_/scene.splinecode', // Placeholder URL
      useProceduralFallback: true,
    },
    label: '[PYTHON DISTRICT]',
    sublabel: 'EDUCATION / DATA SCIENCE / AI'
  },
  lod: {
    maxDistance: 120,
    minDistance: 0.5,
    detailLevel: 'HIGH'
  }
} as const;
