/**
 * Sistema de Alertas do Atlas City
 */

export interface Alert {
  type: 'ERROR_RATE' | 'ATTACK_DENSITY' | 'GROQ_USAGE' | 'LATENCY' | 'IP_BURST';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  msg: string;
  timestamp: string;
}

export function triggerAlert(alert: Alert) {
  console.error(`[ALERT] [${alert.severity}] ${alert.msg}`);
  
  // Lógica para enviar Telegram/Email no futuro
  if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
    // sendToSlack/Telegram(alert);
  }
}

// Monitor de métricas globais
const GLOBAL_METRICS = {
  errorsInLast5m: 0,
  attacksInLastHour: 0
};

export function trackSecurityMetric(type: 'ERROR' | 'ATTACK') {
  if (type === 'ERROR') GLOBAL_METRICS.errorsInLast5m++;
  if (type === 'ATTACK') GLOBAL_METRICS.attacksInLastHour++;
  
  // Checar thresholds
  if (GLOBAL_METRICS.attacksInLastHour > 50) {
    triggerAlert({
      type: 'ATTACK_DENSITY',
      severity: 'HIGH',
      msg: 'Detectadas mais de 50 tentativas de ataque na última hora.',
      timestamp: new Date().toISOString()
    });
  }
}
