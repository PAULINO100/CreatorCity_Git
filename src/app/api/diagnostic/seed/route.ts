import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  console.log('🌱 [DIAGNOSTIC] Starting remote seed...');
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ message: 'Database already has data', count: userCount });
    }

    const mockCitizens = [
      { name: 'Satoshi Dev', score: 9500, district: 'Core' },
      { name: 'Ada Lovelace', score: 8800, district: 'Algorithm' },
      { name: 'Linus B.', score: 8200, district: 'Systems' }
    ];

    for (const citizen of mockCitizens) {
      await prisma.user.create({
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
    }

    return NextResponse.json({ message: 'Seed successful', created: mockCitizens.length });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error('❌ [DIAGNOSTIC] Seed failed:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
