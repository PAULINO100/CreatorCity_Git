import { AgentBase } from './agent-base';

/**
 * Registro Central de Agentes Atlas Swarm
 * Gerencia o estado global e auditoria de todos os agentes.
 */
export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, AgentBase> = new Map();

  private constructor() {}

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Registra um novo agente no sistema
   */
  public register(agent: AgentBase): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agente com ID ${agent.id} já registrado.`);
    }
    this.agents.set(agent.id, agent);
  }

  /**
   * Recupera um agente pelo ID
   */
  public getAgent(id: string): AgentBase | undefined {
    return this.agents.get(id);
  }

  /**
   * Retorna todos os agentes de um cliente específico
   */
  public getAgentsByClient(clientId: string): AgentBase[] {
    return Array.from(this.agents.values()).filter(a => {
      // Usando uma interface interna para acessar clientId que está protected
      return (a as any).clientId === clientId;
    });
  }

  /**
   * Validação de Estado da Cidade antes de operações críticas (Fase 21B)
   */
  private async validateCityState(): Promise<boolean> {
    try {
      // Em produção, isso integraria com o módulo CityStateManager da atlas-city
      console.log('[REGISTRY] Validando estado da cidade com CityStateManager...');
      
      // Simulando consulta (Simulamos sucesso para demonstrar o hook)
      const cityStateAvailable = true; 
      
      if (!cityStateAvailable) {
        console.warn('[REGISTRY] Falha na validação do estado da cidade. Operação bloqueada.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('[REGISTRY] Erro crítico ao consultar CityStateManager:', error);
      return false;
    }
  }

  /**
   * Executa a verificação diária de pagamentos em todos os agentes
   */
  public async performDailyCheck(): Promise<void> {
    const isStateValid = await this.validateCityState();
    if (!isStateValid) {
      console.error('[REGISTRY] Daily check abortado: Estado da cidade inconsistente.');
      return;
    }

    this.agents.forEach(agent => {
      agent.checkPaymentStatus();
    });
  }

  public getAllAgents(): AgentBase[] {
    return Array.from(this.agents.values());
  }
}
