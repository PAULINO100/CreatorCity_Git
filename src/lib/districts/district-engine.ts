/**
 * Atlas City District Engine v2.0
 * Rules, bonuses, and eligibility logic for city districts.
 */

export interface DistrictConfig {
  id: string;
  name: string;
  description: string;
  theme_color: string;
  min_score: number;
  bonus_multiplier: number;
  bonus_label: string;
  icon_svg: string;
  requirement_label: string;
}

export const DISTRICT_CONFIGS: DistrictConfig[] = [
  {
    id: 'tech',
    name: 'Tech',
    description: 'The beating heart of engineering. Home to backend architects, system designers, and framework creators.',
    theme_color: '#3b82f6',
    min_score: 5000,
    bonus_multiplier: 1.10,
    bonus_label: '+10% Influence Score',
    icon_svg: 'M12 2L2 7v10l10 5 10-5V7L12 2z M12 22V12 M2 7l10 5 10-5',
    requirement_label: 'Score ≥ 5,000'
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'The creative district. Designers, content creators, and visual storytellers build here.',
    theme_color: '#a855f7',
    min_score: 3000,
    bonus_multiplier: 1.15,
    bonus_label: '+15% Visibility',
    icon_svg: 'M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z',
    requirement_label: 'Score ≥ 3,000'
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Research-driven innovation. Data scientists, ML engineers, and computational researchers.',
    theme_color: '#22c55e',
    min_score: 7000,
    bonus_multiplier: 1.20,
    bonus_label: '+20% Credibility',
    icon_svg: 'M9 3L5 7v4l4 4 4-4V7L9 3z M15 3l-4 4v4l4 4 4-4V7l-4-4z',
    requirement_label: 'Score ≥ 7,000'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Knowledge multipliers. Teachers, tutorial creators, and documentation champions.',
    theme_color: '#eab308',
    min_score: 2000,
    bonus_multiplier: 1.12,
    bonus_label: '+12% Reach',
    icon_svg: 'M2 3h20v14H2V3z M8 21h8 M12 17v4',
    requirement_label: 'Score ≥ 2,000'
  },
  {
    id: 'startup',
    name: 'Startup',
    description: 'Entrepreneurial energy. Founders, product builders, and growth hackers.',
    theme_color: '#f97316',
    min_score: 4000,
    bonus_multiplier: 1.18,
    bonus_label: '+18% Growth',
    icon_svg: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    requirement_label: 'Score ≥ 4,000'
  }
];

/**
 * Get district rules/config by ID
 */
export function getDistrictRules(districtId: string): DistrictConfig | undefined {
  return DISTRICT_CONFIGS.find(d => d.id === districtId);
}

/**
 * Calculate the bonus-adjusted score for a user in a given district
 */
export function calculateDistrictBonus(userScore: number, districtId: string): { adjustedScore: number; bonusAmount: number; bonusLabel: string } {
  const district = getDistrictRules(districtId);
  if (!district) return { adjustedScore: userScore, bonusAmount: 0, bonusLabel: 'No bonus' };
  
  const adjustedScore = Math.floor(userScore * district.bonus_multiplier);
  const bonusAmount = adjustedScore - userScore;
  return { adjustedScore, bonusAmount, bonusLabel: district.bonus_label };
}

/**
 * Get all districts a user qualifies for based on their score
 */
export function getAvailableDistricts(userScore: number): DistrictConfig[] {
  return DISTRICT_CONFIGS.filter(d => userScore >= d.min_score);
}

/**
 * Check if a user qualifies for a specific district
 */
export function canClaimDistrict(userScore: number, districtId: string): boolean {
  const district = getDistrictRules(districtId);
  if (!district) return false;
  return userScore >= district.min_score;
}
