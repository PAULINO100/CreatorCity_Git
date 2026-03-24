import { AgentBase, AgentStatus } from '../agents/agent-base';
import { AgentRegistry } from '../agents/agent-registry';

/**
 * Gerenciador de Rollback e Recuperação de Desastre
 */
export class RollbackManager {
  /**
   * Reverte um agente específico para o estado anterior (Safe Mode/Checkpoint)
   */
  public static async rollbackAgent(agentId: string): Promise<boolean> {
    const registry = AgentRegistry.getInstance();
    const agent = registry.getAgent(agentId);

    if (!agent) {
      console.error(`[ROLLBACK] Agente ${agentId} não encontrado.`);
      return false;
    }

    console.log(`[ROLLBACK] Iniciando reversão para o agente ${agent.name}...`);
    // Simulação de reversão de estado
    (agent as any).status = 'safe_mode'; 
    (agent as any).logAction('ROLLBACK', 'Reversão de emergência executada pelo RollbackManager');
    
    return true;
  }

  /**
   * Gatilho Global de Pânico: Coloca todos os agentes em Safe Mode
   */
  public static triggerGlobalSafeMode(): void {
    console.error('[ROLLBACK] FALHA CRÍTICA DETECTADA: Acionando Global Safe Mode.');
    const registry = AgentRegistry.getInstance();
    const agents = registry.getAllAgents();

    agents.forEach(agent => {
      (agent as any).status = 'safe_mode';
      (agent as any).logAction('GLOBAL_SAFE_MODE', 'Acionando por falha crítica no Registry.');
    });
  }
}
