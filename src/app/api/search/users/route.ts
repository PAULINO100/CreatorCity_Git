/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  // Simple parser for tags like district:tech or stars:>8000
  let districtFilter: string | undefined;
  let minStars: number | undefined;
  let searchTerm = "";

  const parts = rawQuery.split(" ");
  for (const part of parts) {
    if (part.startsWith("district:")) {
      districtFilter = part.split(":")[1];
    } else if (part.startsWith("stars:>")) {
      minStars = parseInt(part.split(">")[1]);
    } else {
      searchTerm += (searchTerm ? " " : "") + part;
    }
  }

  try {
    const where: any = {
      AND: []
    };

    // Generic search term
    if (searchTerm) {
      where.AND.push({
        OR: [
          { name: { contains: searchTerm } },
          { github_id: { contains: searchTerm } },
        ]
      });
    }

    // Tag filters
    if (districtFilter) {
      where.AND.push({
        building: {
          district_name: { contains: districtFilter }
        }
      });
    }

    if (minStars) {
      where.AND.push({
        dis_score: { gte: minStars }
      });
    }

    // Fetch users with buildings
    const users = await prisma.user.findMany({
      where: where.AND.length > 0 ? where : {},
      include: {
        building: true
      },
      orderBy: {
        dis_score: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.user.count({ 
      where: where.AND.length > 0 ? where : {} 
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (_error: any) {
    console.error("SEARCH_API_ERROR_DETAILS:", _error.message || _error);
    return NextResponse.json({ 
      error: "Failed to search users",
      details: _error.message
    }, { status: 500 });
  }
}
