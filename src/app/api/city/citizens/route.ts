/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  console.log("🏙️ [CITY_API] Fetching citizens...");
  try {
    const citizens = await prisma.user.findMany({
      include: { building: true },
      where: { 
        building: { isNot: null },
        dis_score: { gt: 0 } // Only show citizens with some influence
      },
      take: 100 // Safety limit
    });

    console.log(`✅ [CITY_API] Found ${citizens.length} citizens.`);

    const session = await getServerSession(authOptions).catch(e => {
        console.warn("⚠️ [CITY_API] Session fetch failed:", e.message);
        return null;
    });
    const userId = session?.user?.id;

    const result = citizens.map((c: any) => ({
      id: c.id,
      name: c.name || "Unknown Citizen",
      score: c.dis_score,
      profileType: "tech",
      district: c.building?.district || "tech",
      x: c.building?.position_x || 0,
      y: c.building?.position_y || 0,
      isMe: c.id === userId
    }));

    return NextResponse.json(result);
  } catch (_error: any) {
    console.error("❌ [CITY_API] Error:", _error.message || _error);
    return NextResponse.json({ 
        error: "Failed to fetch city data",
        details: process.env.NODE_ENV === 'development' ? _error.message : undefined 
    }, { status: 500 });
  }
}
