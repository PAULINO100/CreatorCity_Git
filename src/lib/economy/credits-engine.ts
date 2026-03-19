import prisma from "@/lib/db/prisma";

/**
 * City Credits Engine v1.0
 * Handles off-chain economic transactions.
 */

export const REWARD_TABLE = {
  DAILY_CLAIM: 10,
  GITHUB_COMMIT: 15,
  YOUTUBE_VIDEO: 25,
  CONNECT_PLATFORM: 100,
  INVITE_FRIEND: 50,
  ACHIEVEMENT_BADGE: 200
};

export interface Transaction {
  type: 'earn' | 'spend' | 'claim';
  amount: number;
  date: string;
  description: string;
}

export interface CreditTransactionResult {
  success: boolean;
  balance: number;           // nunca undefined
  previousBalance: number;   // nunca undefined
  creditsEarned?: number;    // opcional
  note?: string;             // debug interno
}

/**
 * Earn credits for a specific action.
 */
export async function earnCredits(
  userId: string, 
  action: keyof typeof REWARD_TABLE | string, 
  customAmount?: number
): Promise<CreditTransactionResult> {
  const amount = customAmount || (REWARD_TABLE[action as keyof typeof REWARD_TABLE] || 0);
  
  // Validação inicial
  if (amount < 0) {
    return { success: false, balance: 0, previousBalance: 0 };
  }

  const economy = await getOrCreateEconomy(userId);
  const previousBalance = economy.balance;

  // Se amount = 0, ainda retornar estado atual (não pular)
  if (amount === 0) {
    return { 
      success: true, 
      balance: previousBalance, 
      previousBalance,
      note: 'No credits earned (amount=0)'
    };
  }

  const history: Transaction[] = JSON.parse(economy.transaction_history);
  const newTransaction: Transaction = {
    type: 'earn',
    amount,
    date: new Date().toISOString(),
    description: `Earned for ${action.toString().replace('_', ' ').toLowerCase()}`
  };

  history.unshift(newTransaction);

  const updatedEconomy = await prisma.cityCredit.update({
    where: { user_id: userId },
    data: {
      balance: { increment: amount },
      transaction_history: JSON.stringify(history.slice(0, 50))
    }
  });

  // Increment User DIS score as well (Reputation sync)
  await prisma.user.update({
    where: { id: userId },
    data: { dis_score: { increment: amount } }
  });

  return {
    success: true,
    balance: updatedEconomy.balance,
    previousBalance,
    creditsEarned: amount
  };
}

/**
 * Spend credits.
 */
export async function spendCredits(userId: string, amount: number, description: string) {
  const economy = await getOrCreateEconomy(userId);
  if (economy.balance < amount) throw new Error("Insufficient credits");

  const history: Transaction[] = JSON.parse(economy.transaction_history);
  const newTransaction: Transaction = {
    type: 'spend',
    amount: -amount,
    date: new Date().toISOString(),
    description
  };

  history.unshift(newTransaction);

  return await prisma.cityCredit.update({
    where: { user_id: userId },
    data: {
      balance: { decrement: amount },
      transaction_history: JSON.stringify(history.slice(0, 50))
    }
  });
}

/**
 * Daily Login Claim.
 */
export async function claimDaily(userId: string) {
  const economy = await getOrCreateEconomy(userId);
  
  if (economy.last_claim_at) {
    const lastClaim = new Date(economy.last_claim_at);
    const now = new Date();
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      throw new Error(`Daily claim available in ${Math.ceil(24 - diffHours)}h`);
    }
  }

  const amount = REWARD_TABLE.DAILY_CLAIM;
  const history: Transaction[] = JSON.parse(economy.transaction_history);
  history.unshift({
    type: 'claim',
    amount,
    date: new Date().toISOString(),
    description: "Daily login reward"
  });

  const updatedEconomy = await prisma.cityCredit.update({
    where: { user_id: userId },
    data: {
      balance: { increment: amount },
      last_claim_at: new Date(),
      transaction_history: JSON.stringify(history.slice(0, 50))
    }
  });

  // Increment User DIS score as well
  await prisma.user.update({
    where: { id: userId },
    data: { dis_score: { increment: amount } }
  });

  return {
    success: true,
    balance: updatedEconomy.balance,
    previousBalance: economy.balance,
    creditsEarned: amount
  };
}

/**
 * Get economy stats.
 */
export async function getEconomyStats(userId: string) {
  const economy = await getOrCreateEconomy(userId);
  return {
    balance: economy.balance,
    reputation: economy.reputation_points,
    history: JSON.parse(economy.transaction_history) as Transaction[],
    lastClaim: economy.last_claim_at
  };
}

/**
 * Helper: Find or create economy record for a user.
 */
async function getOrCreateEconomy(userId: string) {
  let economy = await prisma.cityCredit.findUnique({ where: { user_id: userId } });
  
  if (!economy) {
    economy = await prisma.cityCredit.create({
      data: {
        user_id: userId,
        balance: 0,
        transaction_history: "[]"
      }
    });
  }
  
  return economy;
}
