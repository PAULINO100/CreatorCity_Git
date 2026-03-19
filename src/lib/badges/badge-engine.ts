import prisma from "@/lib/db/prisma";
import { earnCredits } from "@/lib/economy/credits-engine";

/**
 * Atlas City Badge Engine v1.0
 * Handles gamification and achievement logic.
 */

export const INITIAL_BADGES = [
  { 
    name: "Primeiro Território", 
    description: "Reclamou seu primeiro lote na cidade.", 
    requirement_type: "structure_count", 
    requirement_value: 1, 
    reward_cc: 50,
    rarity: "common",
    icon_svg: "M10,10 L90,10 L90,90 L10,90 Z"
  },
  { 
    name: "Dev Ativo", 
    description: "Completou 10 commits em uma semana.", 
    requirement_type: "commit_count", 
    requirement_value: 10, 
    reward_cc: 200,
    rarity: "rare",
    icon_svg: "M20,50 L40,70 L80,30" 
  },
  { 
    name: "Pioneiro", 
    description: "Um dos primeiros 100 cidadãos de Atlas City.", 
    requirement_type: "user_index", 
    requirement_value: 100, 
    reward_cc: 500,
    rarity: "legendary",
    icon_svg: "M50,10 L90,90 L10,90 Z" 
  },
  { 
    name: "Conquistador", 
    description: "Alcançou um Influence Score de 5000+.", 
    requirement_type: "score", 
    requirement_value: 5000, 
    reward_cc: 300,
    rarity: "epic",
    icon_svg: "M50,20 L80,80 L20,80 Z" 
  }
];

/**
 * Seed initial badges into the database.
 */
export async function seedBadges() {
  for (const b of INITIAL_BADGES) {
    await prisma.badge.upsert({
      where: { id: b.name.toLowerCase().replace(/ /g, '_') }, // Using name as ID for seed simplicity or cuid
      update: b,
      create: {
        id: b.name.toLowerCase().replace(/ /g, '_'),
        ...b
      }
    });
  }
}

/**
 * Check and unlock badges for a user.
 */
export async function checkBadges(userId: string) {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    include: { badges: true, building: true }
  });

  if (!user) return [];

  const allBadges = await prisma.badge.findMany();
  const unlockedBadges = [];

  for (const badge of allBadges) {
    const alreadyUnlocked = user.badges.find((ub: any) => ub.badge_id === badge.id); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (alreadyUnlocked) continue;

    let meetsRequirement = false;

    switch (badge.requirement_type) {
      case 'score':
        meetsRequirement = user.dis_score >= badge.requirement_value;
        break;
      case 'structure_count':
        meetsRequirement = !!user.building;
        break;
      // Add more cases for commits, login_days, etc.
    }

    if (meetsRequirement) {
      await unlockBadge(userId, badge.id);
      unlockedBadges.push(badge);
    }
  }

  return unlockedBadges;
}

/**
 * Unlock a badge for a user.
 */
export async function unlockBadge(userId: string, badgeId: string) {
  return await prisma.userBadge.create({
    data: {
      user_id: userId,
      badge_id: badgeId
    }
  });
}

/**
 * Claim rewards for an unlocked badge.
 */
export async function claimBadgeReward(userId: string, badgeId: string) {
  const userBadge = await prisma.userBadge.findUnique({
    where: { user_id_badge_id: { user_id: userId, badge_id: badgeId } },
    include: { badge: true }
  });

  if (!userBadge || userBadge.claimed) throw new Error("Reward already claimed or badge not unlocked");

  // Update badge to claimed
  await prisma.userBadge.update({
    where: { id: userBadge.id },
    data: { claimed: true }
  });

  // Add credits
  return await earnCredits(userId, `Badge: ${userBadge.badge.name}`, userBadge.badge.reward_cc);
}
