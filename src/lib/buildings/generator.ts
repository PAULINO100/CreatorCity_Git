/**
 * Atlas City Building Generator v1.0
 * Logic for converting user metrics into city architecture.
 */

export type BuildingType = 'torre_tech' | 'sobrado_dev' | 'casa_iniciante' | 'laboratorio_os' | 'garagem_startup';
export type District = 'tech' | 'creator' | 'science' | 'education' | 'startup';

export interface BuildingData {
  type: BuildingType;
  height: number;
  district: District;
  color: string;
  glowColor: string;
  svgPath: string;
}

const DISTRICT_COLORS: Record<District, { base: string, glow: string }> = {
  tech: { base: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
  creator: { base: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
  science: { base: '#22c55e', glow: 'rgba(34,197,94,0.5)' },
  education: { base: '#eab308', glow: 'rgba(234,179,8,0.5)' },
  startup: { base: '#f97316', glow: 'rgba(249,115,22,0.5)' }
};

export function generateBuilding(score: number, profileType: string = 'tech'): BuildingData {
  let type: BuildingType = 'casa_iniciante';
  let district: District = 'tech';

  // 1. Determine Type based on Score
  if (score >= 6000) type = 'torre_tech';
  else if (score >= 1000) type = 'sobrado_dev';
  else type = 'casa_iniciante';

  // Overrides for specific profile types
  if (profileType === 'open_source') type = 'laboratorio_os';
  if (profileType === 'startup') type = 'garagem_startup';

  // 2. Determine District based on profileType
  if (profileType.includes('creator')) district = 'creator';
  else if (profileType.includes('science')) district = 'science';
  else if (profileType.includes('edu')) district = 'education';
  else if (profileType.includes('startup')) district = 'startup';
  else district = 'tech';

  const colors = DISTRICT_COLORS[district];

  // 3. Define SVG Paths (Simplified silhouettes)
  const paths: Record<BuildingType, string> = {
    torre_tech: "M20,100 L20,20 L40,10 L60,20 L60,100 Z M30,30 L50,30 M30,50 L50,50 M30,70 L50,70",
    sobrado_dev: "M20,100 L20,50 L60,50 L60,100 Z M25,40 L40,25 L55,40 Z",
    casa_iniciante: "M30,100 L30,70 L70,70 L70,100 Z M30,70 L50,55 L70,70 Z",
    laboratorio_os: "M10,100 L10,60 L30,60 L30,80 L70,80 L70,100 Z",
    garagem_startup: "M15,100 L15,80 L65,80 L65,100 Z"
  };

  return {
    type,
    height: Math.min(20 + (score / 150), 100), // Scaled height
    district,
    color: colors.base,
    glowColor: colors.glow,
    svgPath: paths[type]
  };
}
