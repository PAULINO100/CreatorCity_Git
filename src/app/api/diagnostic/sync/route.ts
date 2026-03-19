import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/db/prisma';

export async function GET() {
  console.log('🔄 [DIAGNOSTIC] Starting remote schema sync...');
  const results: Record<string, unknown>[] = [];
  
  try {
    // 1. Try Migrate Deploy
    try {
      console.log('🔄 [DIAGNOSTIC] Step 1: Running prisma migrate deploy...');
      const output = execSync('npx prisma migrate deploy', { encoding: 'utf-8' });
      results.push({ step: 'migrate-deploy', status: 'success', output });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('⚠️ [DIAGNOSTIC] Migrate deploy failed, trying db push...');
      results.push({ step: 'migrate-deploy', status: 'failed', error: errorMessage });
      
      // 2. Try DB Push as fallback
      const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8' });
      results.push({ step: 'db-push', status: 'success', output });
    }

    // 3. Verify tables
    const tables = (await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`) as any[];
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
