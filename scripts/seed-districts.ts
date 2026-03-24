import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DISTRICTS = [
  {
    name: 'Tech',
    description: 'The beating heart of engineering. Home to backend architects, system designers, and framework creators.',
    theme_color: '#3b82f6',
    min_score: 5000,
    bonus_multiplier: 1.10,
    icon_svg: 'M12 2L2 7v10l10 5 10-5V7L12 2z M12 22V12 M2 7l10 5 10-5'
  },
  {
    name: 'Creator',
    description: 'The creative district. Designers, content creators, and visual storytellers build here.',
    theme_color: '#a855f7',
    min_score: 3000,
    bonus_multiplier: 1.15,
    icon_svg: 'M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z'
  },
  {
    name: 'Science',
    description: 'Research-driven innovation. Data scientists, ML engineers, and computational researchers.',
    theme_color: '#22c55e',
    min_score: 7000,
    bonus_multiplier: 1.20,
    icon_svg: 'M9 3L5 7v4l4 4 4-4V7L9 3z M15 3l-4 4v4l4 4 4-4V7l-4-4z'
  },
  {
    name: 'Education',
    description: 'Knowledge multipliers. Teachers, tutorial creators, and documentation champions.',
    theme_color: '#eab308',
    min_score: 2000,
    bonus_multiplier: 1.12,
    icon_svg: 'M2 3h20v14H2V3z M8 21h8 M12 17v4'
  },
  {
    name: 'Startup',
    description: 'Entrepreneurial energy. Founders, product builders, and growth hackers.',
    theme_color: '#f97316',
    min_score: 4000,
    bonus_multiplier: 1.18,
    icon_svg: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
  }
];

async function seedDistricts() {
  console.log('🏙️ Seeding 5 districts...');
  
  for (const d of DISTRICTS) {
    const existing = await prisma.district.findUnique({ where: { name: d.name } });
    if (existing) {
      console.log(`⏭️  ${d.name} already exists, skipping.`);
      continue;
    }
    await prisma.district.create({ data: d });
    console.log(`✅ Created district: ${d.name} (${d.theme_color})`);
  }

  // Link existing buildings to districts
  const buildings = await prisma.building.findMany();
  let linked = 0;
  for (const b of buildings) {
    const districtName = b.district_name.charAt(0).toUpperCase() + b.district_name.slice(1);
    const district = await prisma.district.findUnique({ where: { name: districtName } });
    if (district && !b.district_id) {
      await prisma.building.update({
        where: { id: b.id },
        data: { district_id: district.id }
      });
      linked++;
    }
  }

  console.log(`🔗 Linked ${linked} buildings to their districts.`);
  const total = await prisma.district.count();
  console.log(`📊 Total districts: ${total}`);
}

seedDistricts().catch(console.error).finally(() => prisma.$disconnect());
