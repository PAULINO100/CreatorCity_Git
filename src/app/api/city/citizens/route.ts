/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("🏙️ [CITY_API] Fetching citizens...");
  try {
    const citizens = await prisma.user.findMany({
      include: { 
        building: true,
        purchases: {
          where: { equipped: true },
          include: { item: true }
        }
      },
      where: { 
        building: { isNot: null },
        dis_score: { gt: 0 } // Only show citizens with some influence
      },
      take: 2000 // Support large metropolis
    });

    console.log(`✅ [CITY_API] Found ${citizens.length} citizens.`);

    const session = await getServerSession(authOptions).catch(e => {
        console.warn("⚠️ [CITY_API] Session fetch failed:", e.message);
        return null;
    });
    const userId = session?.user?.id;

    let result = citizens.map((c: any) => ({
      id: c.id,
      name: c.name || "Unknown Citizen",
      score: c.dis_score,
      profileType: "tech",
      district: c.building?.district_name || "tech",
      x: c.building?.position_x || 0,
      y: c.building?.position_y || 0,
      isMe: c.id === userId,
      equippedItems: c.purchases?.map((p: any) => p.item) || []
    }));

    // Guarantee exactly 1018 developers for the 3D Metropolis as requested
    const TARGET_COUNT = 1018;
    if (result.length < TARGET_COUNT) {
      console.log(`📡 [CITY_API] Filling with ${TARGET_COUNT - result.length} mock developers...`);
      const districts = ["tech", "creator", "science", "education"];
      for (let i = result.length; i < TARGET_COUNT; i++) {
        const district = districts[i % districts.length];
        // Distribute within district-specific quadrants
        let baseX = 0, baseY = 0;
        if (district === "tech") { baseX = 60; baseY = 60; }
        if (district === "creator") { baseX = 20; baseY = 60; }
        if (district === "science") { baseX = 60; baseY = 20; }
        if (district === "education") { baseX = 20; baseY = 20; }

        result.push({
          id: `mock-dev-${i}`,
          name: `Developer #${i}`,
          score: Math.floor(Math.random() * 8000) + 1000,
          profileType: district,
          district: district,
          x: baseX + Math.random() * 30,
          y: baseY + Math.random() * 30,
          isMe: false,
          equippedItems: []
        });
      }
    } else if (result.length > TARGET_COUNT) {
      result = result.slice(0, TARGET_COUNT);
    }

    return NextResponse.json(result);
  } catch (_error: any) {
    const errorMessage = _error instanceof Error ? _error.message : String(_error);
    const errorStack = _error instanceof Error ? _error.stack : undefined;
    
    console.error("❌ [CITY_API] Error fetch citizens:", errorMessage);
    if (errorStack) console.error(errorStack);

    return NextResponse.json({ 
        error: "Failed to fetch city data",
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined 
    }, { status: 500 });
  }
}
