import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET() {
  console.log('🔄 [DIAGNOSTIC] Starting remote schema sync...');
  const results: Record<string, unknown>[] = [];
  const env = { ...process.env, HOME: '/tmp', XDG_CACHE_HOME: '/tmp', npm_config_cache: '/tmp/.npm' };
  
  try {
    // 1. Try Migrate Deploy & DB Push with /tmp settings
    try {
      console.log('🔄 [DIAGNOSTIC] Step 1: Running prisma migrate deploy...');
      const output = execSync('npx prisma migrate deploy', { encoding: 'utf-8', env });
      results.push({ step: 'migrate-deploy', status: 'success', output });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('⚠️ [DIAGNOSTIC] Migrate deploy failed, trying db push...');
      results.push({ step: 'migrate-deploy', status: 'failed', error: errorMessage });
      
      try {
        const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8', env });
        results.push({ step: 'db-push', status: 'success', output });
      } catch (pushErr: unknown) {
        const pushError = pushErr instanceof Error ? pushErr.message : String(pushErr);
        results.push({ step: 'db-push', status: 'failed', error: pushError });
        
        // 2. Manual SQL Fallback (Crucial tables)
        console.log('🔄 [DIAGNOSTIC] Step 2: Running manual SQL fallback...');
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" SERIAL PRIMARY KEY,
            "email" TEXT UNIQUE,
            "name" TEXT,
            "avatar_url" TEXT,
            "github_id" TEXT UNIQUE,
            "dis_score" INTEGER DEFAULT 0,
            "cis_score" INTEGER DEFAULT 0,
            "trust_score" INTEGER DEFAULT 0,
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS "Building" (
            "id" SERIAL PRIMARY KEY,
            "user_id" INTEGER UNIQUE,
            "structure_type" TEXT NOT NULL,
            "district" TEXT NOT NULL,
            "position_x" DOUBLE PRECISION NOT NULL,
            "position_y" DOUBLE PRECISION NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Building_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);
        results.push({ step: 'manual-sql', status: 'success', message: 'User and Building tables created/verified' });
      }
    }

    // 3. Verify tables
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
