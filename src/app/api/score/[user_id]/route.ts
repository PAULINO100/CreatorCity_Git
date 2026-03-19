import { NextResponse } from "next/server";
import { calculateDIS } from "@/lib/score/dis-calculator";
import { fetchGitHubStats } from "@/lib/adapters/github-adapter";

export async function GET(
  _request: Request,
  { params }: { params: { user_id: string } }
) {
  const userId = params.user_id;

  try {
    // 1. Check cache (Static mock for now)
    // const cached = await redis.get(`score:github:${userId}`);
    
    // 2. Fetch stats (In production, use the token from the Session/DB)
    const stats = await fetchGitHubStats(userId, "mock_token");

    // 3. Calculate Score
    const scoreResult = calculateDIS(userId, stats);

    return NextResponse.json(scoreResult);
  } catch {
    return NextResponse.json({ error: "Failed to calculate score" }, { status: 500 });
  }
}
