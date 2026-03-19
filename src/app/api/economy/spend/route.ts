import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { spendCredits } from "@/lib/economy/credits-engine";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount, description } = await request.json();
    
    if (amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const user = await prisma.user.findFirst({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const result = await spendCredits(user.id, amount, description);
    return NextResponse.json({ success: true, balance: result.balance });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Economy Spend API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process transaction" }, { status: 400 });
  }
}
