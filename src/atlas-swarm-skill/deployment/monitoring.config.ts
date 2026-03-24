import { AgentBase, AgentStatus } from '../agents/agent-base';

/**
 * Configuração e Lógica de Monitoramento e Observabilidade
 */
export class MonitoringService {
  /**
   * Coleta métricas em tempo real de um agente
   */
  public static getAgentMetrics(agent: AgentBase) {
    const logs = agent.getLogs();
    const activeDays = (agent as any).daysOverdue >= 0 ? 10 - (agent as any).daysOverdue : 10; // Simplificado

    return {
      id: agent.id,
      name: agent.name,
      status: agent.getStatus(),
      activeDaysRemaining: activeDays,
      balance: (agent as any).economy.getBalance(), // Mock async access
      zkFailures: logs.filter(l => l.action === 'SECURITY_FAILURE').length,
      isAlertActive: activeDays <= 2 // Alerta no Dia 8, 9 e 10
    };
  }

  /**
   * Dashboard Summary (Mock)
   */
  public static getSystemDashboard(agents: AgentBase[]) {
    const summary = {
      totalAgents: agents.length,
      alive: agents.filter(a => a.getStatus() === 'active').length,
      safeMode: agents.filter(a => a.getStatus() === 'safe_mode').length,
      terminated: agents.filter(a => a.getStatus() === 'terminated').length,
      criticalOverdue: agents.filter(a => {
        const remaining = (a as any).daysOverdue > 0 ? 10 - (a as any).daysOverdue : 10;
        return remaining <= 2;
      }).length
    };

    console.log('[MONITORING] Dashboard Update:', summary);
    return summary;
  }
}
