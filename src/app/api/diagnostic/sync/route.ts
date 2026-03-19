import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/db/prisma';

export async function GET() {
  console.log('🔄 [DIAGNOSTIC] Starting remote schema sync...');
  const results: any[] = [];
  
  try {
    // 1. Try Migrate Deploy
    try {
      console.log('🔄 [DIAGNOSTIC] Step 1: Running prisma migrate deploy...');
      const output = execSync('npx prisma migrate deploy', { encoding: 'utf-8' });
      results.push({ step: 'migrate-deploy', status: 'success', output });
    } catch (err: any) {
      console.warn('⚠️ [DIAGNOSTIC] Migrate deploy failed, trying db push...');
      results.push({ step: 'migrate-deploy', status: 'failed', error: err.message });
      
      // 2. Try DB Push as fallback
      const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8' });
      results.push({ step: 'db-push', status: 'success', output });
    }

    // 3. Verify tables
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    results.push({ step: 'verify-tables', status: 'success', tables });

    return NextResponse.json({ message: 'Synchronization complete', results });
  } catch (error: any) {
    console.error('❌ [DIAGNOSTIC] Sync failed:', error.message);
    return NextResponse.json({ 
      error: 'Synchronization Failure', 
      details: error.message,
      results 
    }, { status: 500 });
  }
}
