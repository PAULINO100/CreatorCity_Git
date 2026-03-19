import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [SEED] Starting production diagnostic seed...');

  // 1. Check if database has data
  const userCount = await prisma.user.count();
  const buildingCount = await prisma.building.count();

  console.log(`📊 [STATS] Current Users: ${userCount}, Buildings: ${buildingCount}`);

  if (userCount > 0 && buildingCount > 0) {
    console.log('✅ [SEED] Database already has data. Skipping seed.');
    return;
  }

  // 2. Create mock citizens
  const mockCitizens = [
    { name: 'Satoshi Dev', score: 9500, district: 'Core' },
    { name: 'Ada Lovelace', score: 8800, district: 'Algorithm' },
    { name: 'Linus B.', score: 8200, district: 'Systems' },
    { name: 'Grace H.', score: 7500, district: 'Compiler' },
    { name: 'Claude AI', score: 9999, district: 'Neural' }
  ];

  for (const citizen of mockCitizens) {
    console.log(`👤 [SEED] Creating citizen: ${citizen.name}`);
    const user = await prisma.user.create({
      data: {
        name: citizen.name,
        email: `${citizen.name.toLowerCase().replace(' ', '.')}@atlas.city`,
        dis_score: citizen.score,
        building: {
          create: {
            structure_type: 'skyscraper',
            district: citizen.district,
            position_x: Math.floor(Math.random() * 80) + 10,
            position_y: Math.floor(Math.random() * 80) + 10,
          }
        }
      }
    });
    console.log(`✨ [SEED] Created user ${user.id} with building.`);
  }

  console.log('✅ [SEED] Production diagnostic seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ [SEED] Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
