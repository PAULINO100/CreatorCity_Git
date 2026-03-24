import { AgentBase } from '../agents/agent-base';
import { AgentRole } from '../agents/agent-profile';
import { AgentFactory } from '../agents/agent-factory';

export interface CanaryConfig {
  role: AgentRole;
  percentage: number; // 0-100
  version: string;
}

/**
 * Gerenciador de Implantação Controlada (Canary Release)
 */
export class DeploymentManager {
  private static activeDeployments: Map<AgentRole, CanaryConfig> = new Map();

  /**
   * Define uma nova configuração de deploy canary
   */
  public static setCanaryConfig(config: CanaryConfig): void {
    if (config.percentage < 0 || config.percentage > 100) {
      throw new Error('Percentual deve estar entre 0 e 100');
    }
    this.activeDeployments.set(config.role, config);
    console.log(`[DEPLOY] Configuração Canary ativada para ${config.role}: ${config.percentage}% na versão ${config.version}`);
  }

  /**
   * Determina qual versão implantar para um novo agente
   */
  public static shouldDeployNewVersion(role: AgentRole): boolean {
    const config = this.activeDeployments.get(role);
    if (!config) return false;

    return Math.random() * 100 < config.percentage;
  }

  /**
   * Executa o rollout de uma lista de agentes (Ex: Analista e Professor como prioridade)
   */
  public static async rollout(role: AgentRole, quantity: number, clientId: string): Promise<AgentBase[]> {
    console.log(`[DEPLOY] Iniciando rollout faseado para ${role}...`);
    
    // Na Fase 3, validamos se o perfil é seguro para deploy gradual
    const unsafeRoles = [AgentRole.SEGURANCA, AgentRole.CAIXA];
    if (unsafeRoles.includes(role)) {
      console.warn(`[DEPLOY] ALERTA: Perfil crítico ${role} requer validação manual extra.`);
    }

    const agents = AgentFactory.generateBatch(role, quantity, clientId);
    // Aqui poderíamos injetar a versão específica nos agentes se tivéssemos suporte a versionamento no AgentBase
    
    return agents;
  }
}
