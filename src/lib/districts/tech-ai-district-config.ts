export const TECH_AI_DISTRICT = {
  id: 'tech',
  name: 'AI DISTRICT',
  color: '#3B82F6',
  neonColor: '#60A5FA',
  centerPosition: { x: -200, y: 0, z: 150 },
  radius: 220,
  buildingCount: 250,
  
  // Elementos Spline 3D únicos
  splineAssets: {
    // Letreiro gigante flutuante
    neonSign: {
      url: 'https://prod.spline.design/seykuYikeIwpprZn/scene.splinecode',
      position: { x: 0, y: 50, z: 0 },
      scale: 1.5,
      useProceduralFallback: true,
    },
    
    // Esfera de rede neural holográfica
    neuralSphere: {
      url: 'https://prod.spline.design/kZ-9m-0_0-3_/scene.splinecode',
      position: { x: 0, y: 150, z: 0 },
      scale: 2.0,
      useProceduralFallback: true,
    },
    
    // Drones cyberpunk
    drones: {
      url: '/assets/spline/DroneCyberpunk.glb',
      useProceduralFallback: true,
    },
    
    // Partículas de dados
    dataParticles: {
      url: '/assets/spline/DataParticles_Tech.glb',
      useProceduralFallback: true,
    },
  },
  
  // Arquitetura dos prédios
  buildings: {
    style: 'futuristic-towers',
    colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'],
    heightRange: { min: 40, max: 180 },
    windowsGlow: true,
    neonEdges: true,
  },
  
  // Efeitos ambientais
  effects: {
    fog: { color: '#1E3A5F', density: 0.02 },
    dataRain: true,
    holographicBeams: true,
    floatingParticles: true,
  },
} as const;
