import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { calculateVoteWeight, detectReciprocity } from "@/lib/reputation/peer-trust";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetUserId, voteValue } = await request.json();

    // 1. Validations
    if (voteValue < 0 || voteValue > 1) {
      return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
    }

    const voter = await prisma.user.findFirst({ where: { email: session.user.email } });
    if (!voter) return NextResponse.json({ error: "Voter not found" }, { status: 404 });

    if (voter.id === targetUserId) {
      return NextResponse.json({ error: "Self-voting is not allowed" }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return NextResponse.json({ error: "Target user not found" }, { status: 404 });

    // 2. Rate Limit Check (Mocked for 5 votes/week)
    const recentVotes = await prisma.peerVote.count({
      where: {
        voter_id: voter.id,
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    if (recentVotes >= 5) {
      return NextResponse.json({ error: "Weekly vote limit reached (5/week)" }, { status: 429 });
    }

    // 3. Reciprocity Tracking
    const isReciprocal = await detectReciprocity(voter.id, targetUserId);

    // 4. Record Vote
    const vote = await prisma.peerVote.create({
      data: {
        voter_id: voter.id,
        target_user_id: targetUserId,
        vote_value: voteValue,
        weight: calculateVoteWeight(voter.dis_score),
        is_reciprocal: isReciprocal
      }
    });

    return NextResponse.json({ success: true, voteId: vote.id });
  } catch (error) {
    console.error("Voting API Error:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
