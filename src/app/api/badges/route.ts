import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { checkBadges, seedBadges } from "@/lib/badges/badge-engine";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Seed if empty (first run safety)
    const count = await prisma.badge.count();
    if (count === 0) await seedBadges();

    // Check for new unlocks
    await checkBadges(user.id);

    // Get all badges with unlock status
    const allBadges = await prisma.badge.findMany({
      include: {
        users: {
          where: { user_id: user.id }
        }
      }
    });

    const result = allBadges.map((b: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      ...b,
      unlocked: b.users.length > 0,
      claimed: b.users[0]?.claimed || false,
      unlockedAt: b.users[0]?.unlocked_at || null
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Badges API Error:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
