/**
 * Configurações da Regra dos 10 Dias e Pagamentos
 */
export const PAYMENT_CONFIG = {
  CURRENCY: 'BRL',
  BILLING_CYCLE_DAYS: 30,
  GRACE_PERIOD_DAYS: 10, // A famosa "Regra dos 10 dias"
  
  NOTIFICATIONS: {
    SOFT_WARNING_DAYS: [1, 2, 3],
    MEDIUM_WARNING_DAYS: [4, 5, 6],
    URGENT_WARNING_DAYS: [7, 8, 9],
    RETURN_HOME_DAY: 10
  },

  TIERS: {
    FREE: { maxAgents: 10, approvalRequired: false },
    GROWTH: { maxAgents: 50, approvalRequired: false },
    BUSINESS: { maxAgents: 200, approvalRequired: false },
    ENTERPRISE: { maxAgents: 1000, approvalRequired: true }
  }
};
