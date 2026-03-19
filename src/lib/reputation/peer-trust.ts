import prisma from "@/lib/db/prisma";

/**
 * Peer Trust System v1.0 logic.
 * Formula: weight = sqrt(voter_dis_score / 10000) * (0.9 ^ (days_since_vote / 90))
 */

/**
 * Calculates the raw weight of a vote based on the voter's DIS score.
 * Using sqrt ensures diminishing returns for extremely high scores, 
 * distributing influence more fairly.
 */
export function calculateVoteWeight(voterDisScore: number): number {
  const normalized = Math.min(voterDisScore / 10000, 1.0);
  return Math.sqrt(normalized); // 0.0 - 1.0
}

/**
 * Applies a temporal decay factor to a vote.
 * Every 90 days, the vote loses ~10% of its power.
 */
export function applyTemporalDecay(createdAt: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // weightMultiplier = 0.9 ^ (days / 90)
  return Math.pow(0.9, diffDays / 90);
}

/**
 * Detects if a vote is reciprocal (Direct collusion detection).
 */
export async function detectReciprocity(voterId: string, targetId: string): Promise<boolean> {
  const reverseVote = await prisma.peerVote.findFirst({
    where: {
      voter_id: targetId,
      target_user_id: voterId,
    }
  });
  
  return !!reverseVote;
}

/**
 * Aggregates trust for a target user.
 * trust_score = (sum(vote_value * weight * decay)) / (sum(weight * decay))
 */
export async function calculateAggregateTrust(targetUserId: string): Promise<number> {
  const votes = await prisma.peerVote.findMany({
    where: { 
      target_user_id: targetUserId,
      flagged: false 
    },
    include: { voter: true }
  });

  if (votes.length === 0) return 0.5; // Neutral starting trust

  let totalWeightedValue = 0;
  let totalWeight = 0;

  for (const vote of votes) {
    const voterWeight = calculateVoteWeight(vote.voter.dis_score);
    const timeDecay = applyTemporalDecay(vote.created_at);
    
    // Sybil penalty: Reciprocal votes lose 50% power
    const reciprocityPenalty = vote.is_reciprocal ? 0.5 : 1.0;
    
    const finalWeight = voterWeight * timeDecay * reciprocityPenalty;
    
    totalWeightedValue += vote.vote_value * finalWeight;
    totalWeight += finalWeight;
  }

  return totalWeight > 0 ? totalWeightedValue / totalWeight : 0.5;
}
