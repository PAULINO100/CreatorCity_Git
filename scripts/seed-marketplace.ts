import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MARKETPLACE_ITEMS = [
  // FACADES
  {
    name: 'Minimalist Glass',
    description: 'A sleek, modern glass facade. Clean and efficient.',
    category: 'facade',
    price_cc: 100,
    rarity: 'common',
    preview_url: '/assets/items/facade_minimalist.png'
  },
  {
    name: 'Cyberpunk Neon',
    description: 'High-tech dark plating with neon accents.',
    category: 'facade',
    price_cc: 500,
    rarity: 'rare',
    preview_url: '/assets/items/facade_cyberpunk.png'
  },
  {
    name: 'Golden Prism',
    description: 'An architectural marvel coated entirely in reflective gold.',
    category: 'facade',
    price_cc: 2500,
    rarity: 'legendary',
    preview_url: '/assets/items/facade_gold.png'
  },

  // LIGHTING
  {
    name: 'Standard Warm',
    description: 'Warm, welcoming glow for your building\'s base.',
    category: 'lighting',
    price_cc: 50,
    rarity: 'common',
    preview_url: '/assets/items/light_warm.png'
  },
  {
    name: 'Bioluminescent Indigo',
    description: 'A deep oceanic blue that pulses softly.',
    category: 'lighting',
    price_cc: 750,
    rarity: 'epic',
    preview_url: '/assets/items/light_indigo.png'
  },
  {
    name: 'Prismatic Aurora',
    description: 'A lighting system that shifts through the color spectrum.',
    category: 'lighting',
    price_cc: 5000,
    rarity: 'legendary',
    preview_url: '/assets/items/light_prismatic.png'
  },

  // GARDEN
  {
    name: 'Rooftop Zen',
    description: 'A simple, calming bonsai garden on your roof.',
    category: 'garden',
    price_cc: 200,
    rarity: 'common',
    preview_url: '/assets/items/garden_zen.png'
  },
  {
    name: 'Hanging Babylon',
    description: 'Lush greenery cascading down the sides of your tower.',
    category: 'garden',
    price_cc: 1000,
    rarity: 'epic',
    preview_url: '/assets/items/garden_babylon.png'
  },
  {
    name: 'Crystal Forest',
    description: 'A grove of glowing, semi-translucent crystal trees.',
    category: 'garden',
    price_cc: 3500,
    rarity: 'legendary',
    preview_url: '/assets/items/garden_crystal.png'
  },

  // EFFECT
  {
    name: 'Data Stream',
    description: 'Binary code raining down your building\'s surface.',
    category: 'effect',
    price_cc: 800,
    rarity: 'rare',
    preview_url: '/assets/items/effect_data.png'
  },
  {
    name: 'Holo-Shield',
    description: 'A faint hexagonal energy shield surrounding the structure.',
    category: 'effect',
    price_cc: 2000,
    rarity: 'epic',
    preview_url: '/assets/items/effect_shield.png'
  },
  {
    name: 'Orbiting Drones',
    description: 'Three personal drones circling your tower continuously.',
    category: 'effect',
    price_cc: 4000,
    rarity: 'legendary',
    preview_url: '/assets/items/effect_drones.png'
  },

  // SIGNATURE
  {
    name: 'Founder Monument',
    description: 'A glowing hologram displaying your GitHub logo at the apex.',
    category: 'signature',
    price_cc: 1500,
    rarity: 'epic',
    preview_url: '/assets/items/sig_founder.png'
  },
  {
    name: 'Atlas Spire',
    description: 'Extends your building past the clouds into orbit.',
    category: 'signature',
    price_cc: 8000,
    rarity: 'legendary',
    preview_url: '/assets/items/sig_spire.png'
  },
  {
    name: 'Beacon of Knowledge',
    description: 'A gigantic beam of light shooting straight up into the sky.',
    category: 'signature',
    price_cc: 300,
    rarity: 'rare',
    preview_url: '/assets/items/sig_beacon.png'
  }
];

async function main() {
  console.log('Seeding Marketplace Items...');
  
  for (const item of MARKETPLACE_ITEMS) {
    await prisma.marketplaceItem.create({
      data: item
    });
    console.log(`Created item: ${item.name} (${item.rarity})`);
  }

  console.log('Marketplace Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
