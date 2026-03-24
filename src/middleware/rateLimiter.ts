/**
 * Rate Limiter para Atlas City
 * Armazenamento em memória com TTL automático
 */

interface RateLimitInfo {
  count: number;
  reset: number;
  lastRequest: number;
}

const STORAGE = new Map<string, RateLimitInfo>();

// Limites configurados
const LIMITS = {
  NORMAL_MIN: 20,      // req/min por IP
  VERIFIED_MIN: 100,  // req/min para usuários verificados
  ABSOLUTE_HOUR: 500  // limite absoluto por hora
};

export interface RateLimitResult {
  blocked: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(identifier: string, isVerified: boolean = false): RateLimitResult {
  const now = Date.now();
  const minuteWindow = 60 * 1000;
  
  let info = STORAGE.get(identifier);

  // Limpar entradas expiradas periodicamente (ou se resetou)
  if (info && now > info.reset) {
    STORAGE.delete(identifier);
    info = undefined;
  }

  const limit = isVerified ? LIMITS.VERIFIED_MIN : LIMITS.NORMAL_MIN;

  if (!info) {
    const newInfo = {
      count: 1,
      reset: now + minuteWindow,
      lastRequest: now
    };
    STORAGE.set(identifier, newInfo);
    return {
      blocked: false,
      limit,
      remaining: limit - 1,
      reset: newInfo.reset
    };
  }

  info.count++;
  info.lastRequest = now;

  if (info.count > limit) {
    return {
      blocked: true,
      limit,
      remaining: 0,
      reset: info.reset
    };
  }

  return {
    blocked: false,
    limit,
    remaining: limit - info.count,
    reset: info.reset
  };
}

// Limpeza automática de memória a cada hora
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    STORAGE.forEach((info, key) => {
      if (now > info.reset + 3600000) { // 1 hora de inatividade
        STORAGE.delete(key);
      }
    });
  }, 3600000);
}
