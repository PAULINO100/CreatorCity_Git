import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        building: true
      },
      take: 20
    });

    return NextResponse.json(users);
  } catch (_error) {
    console.error("Search API Error:", _error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
