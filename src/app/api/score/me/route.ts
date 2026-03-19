import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true, name: true, dis_score: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Mock profile type if not in DB yet (default to tech)
    return NextResponse.json({
      score: user.dis_score,
      name: user.name,
      profileType: "tech"
    });
  } catch (error) {
    console.error("Score Me API Error:", error);
    return NextResponse.json({ error: "Failed to fetch score" }, { status: 500 });
  }
}
