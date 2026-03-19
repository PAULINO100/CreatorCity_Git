import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { claimBadgeReward } from "@/lib/badges/badge-engine";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { badgeId } = await request.json();
    const user = await prisma.user.findFirst({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const result = await claimBadgeReward(user.id, badgeId);

    return NextResponse.json({ 
      success: result.success, 
      newBalance: result.balance,
      previousBalance: result.previousBalance
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Generic error message for production to avoid leaking internal stack traces
    const isDev = process.env.NODE_ENV === "development";
    const errorMessage = isDev ? (error.message || "Failed to claim reward") : "Process limit reached or internal error. Please try again later.";
    
    console.error("Badge Claim API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
