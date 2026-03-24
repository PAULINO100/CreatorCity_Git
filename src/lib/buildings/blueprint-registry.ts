export type BlueprintType = 'GENERIC' | 'EDUCATECH_CAMPUS' | 'AI_TOWER';

export interface BuildingBlueprint {
  type: BlueprintType;
  name: string;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export const BLUEPRINT_REGISTRY: Record<BlueprintType, BuildingBlueprint> = {
  GENERIC: {
    type: 'GENERIC',
    name: 'Standard Building',
    description: 'A standard skyscraper in Atlas City.',
    rarity: 'COMMON',
  },
  EDUCATECH_CAMPUS: {
    type: 'EDUCATECH_CAMPUS',
    name: 'Educatech AI Campus',
    description: 'The futuristic headquarters of Educatech AI. Featuring holograms and neural spheres.',
    rarity: 'LEGENDARY',
  },
  AI_TOWER: {
    type: 'AI_TOWER',
    name: 'Neural Network Tower',
    description: 'A tower that pulses with AI/ML data streams and neural connections.',
    rarity: 'EPIC',
  },
};
