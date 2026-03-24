/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { canClaimDistrict, DISTRICT_CONFIGS } from "@/lib/districts/district-engine";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { districtId } = await request.json();
    if (!districtId) {
      return NextResponse.json({ error: "districtId required" }, { status: 400 });
    }

    // 1. Check if user already claimed a district
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { building: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.district_claimed) {
      return NextResponse.json({ error: "You have already claimed a district. Each citizen may only claim one." }, { status: 409 });
    }

    // 2. Check eligibility
    if (!canClaimDistrict(user.dis_score, districtId)) {
      const config = DISTRICT_CONFIGS.find(d => d.id === districtId);
      return NextResponse.json({ 
        error: `Score too low. ${config?.requirement_label || 'Requirements not met.'}` 
      }, { status: 403 });
    }

    // 3. Find or create the District record in DB
    const config = DISTRICT_CONFIGS.find(d => d.id === districtId);
    if (!config) {
      return NextResponse.json({ error: "Invalid district" }, { status: 400 });
    }

    let district = await prisma.district.findUnique({ where: { name: config.name } });
    if (!district) {
      district = await prisma.district.create({
        data: {
          name: config.name,
          description: config.description,
          theme_color: config.theme_color,
          min_score: config.min_score,
          bonus_multiplier: config.bonus_multiplier,
          icon_svg: config.icon_svg
        }
      });
    }

    // 4. Update user and building
    await prisma.user.update({
      where: { id: user.id },
      data: { district_claimed: true }
    });

    if (user.building) {
      await prisma.building.update({
        where: { id: user.building.id },
        data: { 
          district_id: district.id,
          district_name: districtId
        }
      });
    }

    return NextResponse.json({
      success: true,
      district: config.name,
      bonus: config.bonus_label,
      message: `Welcome to the ${config.name} District! ${config.bonus_label}`
    });

  } catch (error: any) {
    console.error("DISTRICT_CLAIM_ERROR:", error.message);
    return NextResponse.json({ error: "Claim failed" }, { status: 500 });
  }
}
