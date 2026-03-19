import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { claimDaily } from "@/lib/economy/credits-engine";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const result = await claimDaily(user.id);
    return NextResponse.json({ success: true, balance: result.balance });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Economy Claim API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to claim reward" }, { status: 400 });
  }
}
