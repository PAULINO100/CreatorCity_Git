import crypto from 'crypto';

/**
 * Logger Estruturado para Atlas City
 * Anonymization (LGPD) e Monitoramento
 */

export interface LogEntry {
  timestamp: string;
  ipHash: string;
  userAgent: string;
  endpoint: string;
  duration: number;
  status: number;
  agent?: string;
  securityScore: number;
  error?: string;
}

// Salt diário para anonimização
const DAILY_SALT = crypto.randomBytes(16).toString('hex');

export function hashIP(ip: string): string {
  return crypto.createHmac('sha256', DAILY_SALT).update(ip).digest('hex').substring(0, 16);
}

export async function logSecurityEvent(entry: LogEntry) {
  console.log(`[SECURITY_LOG] ${JSON.stringify(entry)}`);
  
  // No futuro, salvar em banco de dados ou arquivo rotativo
  // const fs = require('fs');
  // const logLine = JSON.stringify(entry) + '\n';
  // fs.appendFileSync('security.log', logLine);
}

export function measureResponseTime(start: [number, number]): number {
  const diff = process.hrtime(start);
  return (diff[0] * 1e3 + diff[1] * 1e-6); // ms
}
