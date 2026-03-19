import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET() {
  console.log('🔄 [DIAGNOSTIC] Starting remote schema sync (Manual SQL)...');
  const results: Record<string, unknown>[] = [];
  
  try {
    // 1. Manual SQL Schema Creation
    console.log('🔄 [DIAGNOSTIC] Step 1: Running manual SQL for ALL tables...');
    await prisma.$executeRawUnsafe(`
      -- 1. User
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT,
        "github_id" TEXT,
        "name" TEXT,
        "avatar_url" TEXT,
        "dis_score" INTEGER DEFAULT 0,
        "cis_score" INTEGER DEFAULT 0,
        "trust_score" DOUBLE PRECISION DEFAULT 0.0,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "User_github_id_key" ON "User"("github_id");

      -- 2. Building
      CREATE TABLE IF NOT EXISTS "Building" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT UNIQUE NOT NULL,
        "structure_type" TEXT NOT NULL,
        "height" INTEGER DEFAULT 1,
        "district" TEXT NOT NULL,
        "position_x" INTEGER NOT NULL,
        "position_y" INTEGER NOT NULL,
        "last_activity_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Building_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- 3. PeerVote
      CREATE TABLE IF NOT EXISTS "PeerVote" (
        "id" TEXT PRIMARY KEY,
        "voter_id" TEXT NOT NULL,
        "target_user_id" TEXT NOT NULL,
        "vote_value" DOUBLE PRECISION DEFAULT 0.0,
        "weight" DOUBLE PRECISION DEFAULT 1.0,
        "decay_factor" DOUBLE PRECISION DEFAULT 1.0,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "is_reciprocal" BOOLEAN DEFAULT FALSE,
        "flagged" BOOLEAN DEFAULT FALSE,
        CONSTRAINT "PeerVote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PeerVote_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- 4. CityCredit
      CREATE TABLE IF NOT EXISTS "CityCredit" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT UNIQUE NOT NULL,
        "balance" INTEGER DEFAULT 0,
        "last_claim_at" TIMESTAMP WITH TIME ZONE,
        "reputation_points" INTEGER DEFAULT 0,
        "transaction_history" TEXT DEFAULT '[]',
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CityCredit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- 5. Badge
      CREATE TABLE IF NOT EXISTS "Badge" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "icon_svg" TEXT NOT NULL,
        "requirement_type" TEXT NOT NULL,
        "requirement_value" INTEGER NOT NULL,
        "reward_cc" INTEGER DEFAULT 0,
        "rarity" TEXT DEFAULT 'common',
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 6. UserBadge
      CREATE TABLE IF NOT EXISTS "UserBadge" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "badge_id" TEXT NOT NULL,
        "unlocked_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "claimed" BOOLEAN DEFAULT FALSE,
        CONSTRAINT "UserBadge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "UserBadge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "UserBadge_user_id_badge_id_key" ON "UserBadge"("user_id", "badge_id");

      -- 7. Account (NextAuth)
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

      -- 8. Session (NextAuth)
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT PRIMARY KEY,
        "sessionToken" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- 9. VerificationToken (NextAuth)
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT UNIQUE NOT NULL,
        "expires" TIMESTAMP WITH TIME ZONE NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    `);
    results.push({ step: 'manual-sql', status: 'success', message: 'All tables created/verified' });

    // 2. Verify tables
    const tables = (await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`) as unknown[];
    results.push({ step: 'verify-tables', status: 'success', tables });

    return NextResponse.json({ message: 'Synchronization complete', results });
  } catch (error: unknown) {
    const finalError = error instanceof Error ? error.message : String(error);
    console.error('❌ [DIAGNOSTIC] Sync failed:', finalError);
    return NextResponse.json({ 
      error: 'Synchronization Failure', 
      details: finalError,
      results 
    }, { status: 500 });
  }
}
