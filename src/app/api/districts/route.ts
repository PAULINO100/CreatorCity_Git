/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { DISTRICT_CONFIGS } from "@/lib/districts/district-engine";

export async function GET() {
  try {
    // Fetch from DB or return defaults
    const dbDistricts = await prisma.district.findMany({
      include: { _count: { select: { buildings: true } } }
    });

    // If DB is empty, return config defaults
    if (dbDistricts.length === 0) {
      return NextResponse.json(DISTRICT_CONFIGS.map(d => ({
        ...d,
        citizenCount: 0
      })));
    }

    const result = dbDistricts.map(d => {
      const config = DISTRICT_CONFIGS.find(c => c.id === d.name.toLowerCase());
      return {
        id: d.id,
        name: d.name,
        description: d.description,
        theme_color: d.theme_color,
        min_score: d.min_score,
        bonus_multiplier: d.bonus_multiplier,
        bonus_label: config?.bonus_label || `+${Math.round((d.bonus_multiplier - 1) * 100)}%`,
        icon_svg: d.icon_svg,
        requirement_label: config?.requirement_label || `Score ≥ ${d.min_score}`,
        citizenCount: d._count.buildings
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DISTRICTS_API_ERROR:", error.message);
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 });
  }
}
