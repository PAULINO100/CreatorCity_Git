import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  console.log('🌱 [DIAGNOSTIC] Step 1: Initialization...');
  try {
    console.log('🌱 [DIAGNOSTIC] Step 2: Connecting to Prisma...');
    const userCount = await prisma.user.count();
    console.log(`🌱 [DIAGNOSTIC] Step 3: Connection Success! User count: ${userCount}`);
    
    if (userCount > 0) {
      return NextResponse.json({ message: 'Database already has data', count: userCount });
    }

    console.log('🌱 [DIAGNOSTIC] Step 4: Creating seed data...');
    const mockCitizens = [
      { name: 'Satoshi Dev', score: 9500, district: 'Core' },
      { name: 'Ada Lovelace', score: 8800, district: 'Algorithm' },
      { name: 'Linus B.', score: 8200, district: 'Systems' }
    ];

    for (const citizen of mockCitizens) {
      console.log(`🌱 [DIAGNOSTIC] Step 5: Creating User ${citizen.name}...`);
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

    console.log('🌱 [DIAGNOSTIC] Step 6: Seed Complete!');
    return NextResponse.json({ message: 'Seed successful', created: mockCitizens.length });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.stack : String(err);
    console.error('❌ [DIAGNOSTIC] Step FAILED:', errorMessage);
    return NextResponse.json({ 
        error: "Diagnostic Failure",
        details: errorMessage,
        env_check: {
            has_db_url: !!process.env.DATABASE_URL,
            node_env: process.env.NODE_ENV
        }
    }, { status: 500 });
  }
}
