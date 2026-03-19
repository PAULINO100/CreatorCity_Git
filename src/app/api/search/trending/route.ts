import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const trending = await prisma.user.findMany({
      orderBy: {
        dis_score: 'desc'
      },
      take: 5,
      include: {
        building: true
      }
    });

    return NextResponse.json(trending);
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Failed to fetch trending users" }, { status: 500 });
  }
}
