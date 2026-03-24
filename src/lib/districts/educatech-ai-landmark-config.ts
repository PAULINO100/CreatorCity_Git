export const EDUCATECH_AI_LANDMARK = {
  id: 'educatech-ai',
  name: 'EDUCATECH AI',
  subtitle: 'Creating Digital Infrastructure',
  position: { x: 0, y: 0, z: 0 }, // Centro da cidade
  scale: 4,
  
  splineAssets: {
    // Edifício principal icônico
    mainBuilding: {
      url: 'https://prod.spline.design/J3Gk22PIn1e1zZ8m/scene.splinecode',
      useProceduralFallback: true,
    },
    
    // Portal holográfico de entrada
    holographicPortal: {
      url: 'https://prod.spline.design/kZ-9m-0_0-3_/scene.splinecode',
      useProceduralFallback: true,
    },
    
    // Esfera de IA flutuante no topo
    aiSphere: {
      url: 'https://prod.spline.design/seykuYikeIwpprZn/scene.splinecode',
      useProceduralFallback: true,
    },
    
    // Jardim digital (árvores de dados)
    digitalGarden: {
      url: 'https://prod.spline.design/SAt8tQoG-W27Xl7m/scene.splinecode',
      useProceduralFallback: true,
    },
  },
  
  // Texto do letreiro
  signage: {
    mainText: 'EDUCATECH AI',
    subText: 'Creating Digital Infrastructure',
    logo: '/assets/spline/EducatechAI_Logo.svg',
  },
} as const
