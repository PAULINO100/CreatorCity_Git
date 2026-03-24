import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const accountCount = await prisma.account.count();
  const sessionCount = await prisma.session.count();
  const economyUsers = await prisma.cityCredit.count();
  const claimedBadges = await prisma.userBadge.count();
  
  // Check for any user with credits > 0
  const usersWithCredits = await prisma.user.findMany({
    where: { dis_score: { gt: 0 } }, // In this project, dis_score was used for stars/reputation
    take: 5
  });

  console.log('--- PHASE 1 DB SNAPSHOT ---');
  console.log(`GitHub Accounts Linked: ${accountCount}`);
  console.log(`Active Sessions: ${sessionCount}`);
  console.log(`Economy Users: ${economyUsers}`);
  console.log(`Badges Claimed: ${claimedBadges}`);
  console.log('Sample Citizens with Reputation:');
  usersWithCredits.forEach(u => console.log(`- ${u.name || u.github_id}: ${u.dis_score}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
