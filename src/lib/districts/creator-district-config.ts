export const CREATOR_DISTRICT = {
  id: 'creator',
  name: 'WEB DEVELOPMENT',
  description: 'Frontend, Backend & Connectivity',
  color: '#EC4899',
  neonColor: '#22D3EE',
  centerPosition: { x: -12, y: 10, z: 12 }, 
  radius: 180,
  buildingCount: 200,
  splineAssets: {
    neonSign: {
      url: 'https://prod.spline.design/SAt8tQoG-W27Xl7m/scene.splinecode',
      useProceduralFallback: true,
    },
    label: '[WEB DEVELOPMENT]',
    sublabel: 'FRONTEND / BACKEND / CLOUD / APIs'
  },
  lod: {
    maxDistance: 120,
    minDistance: 0.5,
    detailLevel: 'HIGH'
  }
} as const;
