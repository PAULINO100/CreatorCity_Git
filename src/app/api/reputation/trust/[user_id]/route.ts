import { NextResponse } from "next/server";
import { calculateAggregateTrust } from "@/lib/reputation/peer-trust";

export async function GET(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  const userId = params.user_id;

  try {
    // 1. Check Cache (Mock)
    // const cached = await redis.get(`trust:${userId}`);

    // 2. Calculate Trust
    const trustScore = await calculateAggregateTrust(userId);

    return NextResponse.json({
      userId,
      trustScore: parseFloat(trustScore.toFixed(4)),
      status: trustScore >= 0.7 ? "Trusted" : trustScore <= 0.3 ? "Suspicious" : "Neutral"
    });
  } catch (error) {
    console.error("Trust API Error:", error);
    return NextResponse.json({ error: "Failed to fetch trust score" }, { status: 500 });
  }
}
