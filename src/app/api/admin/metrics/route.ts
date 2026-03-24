import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Métricas Administrativas
 * Protegida por API Key: ADMIN_METRICS_KEY
 */

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const expectedKey = process.env.ADMIN_METRICS_KEY || 'debug_key_123';

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Dados mockados para o dashboard (futuro: ler do banco/logs)
  const metrics = {
    requests: {
      today: 1250,
      week: 8400,
      month: 32000
    },
    security: {
      blockedIPs: 14,
      attackAttempts: 52,
      lastAttackType: 'Prompt Injection'
    },
    performance: {
      avgResponseTime: '420ms',
      errorRate: '0.8%'
    },
    groqUsage: {
      tokens: 450000,
      limit: 1000000
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(metrics);
}
