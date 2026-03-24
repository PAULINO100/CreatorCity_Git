import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/middleware/rateLimiter';
import { validateUserInput } from '@/lib/inputValidator';
import { getIpReputation, updateReputation, getSecurityAction } from '@/lib/ipReputation';
import { AtlasGuardian } from '@/agents/content-moderator';
import { logSecurityEvent, hashIP, measureResponseTime } from '@/lib/logger';
import { trackSecurityMetric, triggerAlert } from '@/lib/alerts';

const guardian = new AtlasGuardian();

export async function POST(req: NextRequest) {
  const startTime = process.hrtime();
  try {
    const headerList = headers();
    const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = hashIP(ip);
    
    // 1. IP Reputation & Security Check
    const rep = getIpReputation(ip);
    const action = getSecurityAction(rep.score);
    
    if (action === 'BLOCK_PERMANENT' || action === 'BLOCK_TEMPORARY') {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        ipHash,
        userAgent: headerList.get('user-agent') || 'unknown',
        endpoint: '/api/chat',
        duration: measureResponseTime(startTime),
        status: 403,
        securityScore: rep.score,
        error: 'Blocked by reputation'
      });
      return NextResponse.json({ error: 'Acesso bloqueado por razões de segurança.' }, { status: 403 });
    }

    // 2. Rate Limiting
    const rl = checkRateLimit(ip);
    if (rl.blocked) {
      updateReputation(ip, 'EXCEED_RATE_LIMIT', 'Rate limit hit');
      trackSecurityMetric('ATTACK');
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em breve.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rl.limit.toString(),
            'X-RateLimit-Remaining': rl.remaining.toString(),
            'X-RateLimit-Reset': rl.reset.toString()
          }
        }
      );
    }

    // 2. Body Validation
    const body = await req.json();
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const { messages, system } = body;
    const lastUserMessage = messages[messages.length - 1];

    if (lastUserMessage?.role === 'user') {
      const v = validateUserInput(lastUserMessage.content);
      if (!v.valid) {
        updateReputation(ip, 'MALICIOUS_INPUT', v.error);
        trackSecurityMetric('ATTACK');
        return NextResponse.json({ error: v.error }, { status: 400 });
      }
      // Atualizar com conteúdo sanitizado
      lastUserMessage.content = v.sanitized;
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: system },
            ...messages
          ],
        }),
      }
    );

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
    let reply = data.choices?.[0]?.message?.content
      ?? 'Agente não disponível no momento.';

    // 4. Moderação de Conteúdo na Saída
    reply = guardian.sanitizeResponse(reply);

    updateReputation(ip, 'DAILY_GOOD_USE');

    const duration = measureResponseTime(startTime);
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      ipHash,
      userAgent: headerList.get('user-agent') || 'unknown',
      endpoint: '/api/chat',
      duration,
      status: 200,
      securityScore: rep.score
    });

    return NextResponse.json({
      content: [{ text: reply }]
    });

  } catch (error: any) {
    const headerList = headers();
    const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = hashIP(ip);
    
    console.error('Groq error:', error);
    trackSecurityMetric('ERROR');
    
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      ipHash,
      userAgent: headerList.get('user-agent') || 'unknown',
      endpoint: '/api/chat',
      duration: measureResponseTime(startTime),
      status: 500,
      securityScore: 0,
      error: error.message || 'Falha na comunicação'
    });

    return NextResponse.json(
      { error: 'Falha na comunicação' },
      { status: 500 }
    );
  }
}
