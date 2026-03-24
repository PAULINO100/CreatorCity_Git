import { ICityContext } from './interfaces';
import { AgentRole } from '../agents/agent-profile';

/**
 * Provedor de Contexto de Atlas City baseado em Perfis
 */
export class CityContextProvider implements ICityContext {
  public district: string;
  public permissions: string[];
  private isActive: boolean = true;

  constructor(role: AgentRole) {
    // Injeção de dependência via Perfil (Mandatório na Fase 2)
    switch (role) {
      case AgentRole.SEGURANCA:
        this.district = 'Firewall District';
        this.permissions = ['monitor', 'alert', 'lockdown'];
        break;
      case AgentRole.VENDEDOR:
        this.district = 'Market District';
        this.permissions = ['sell', 'browse', 'advertise'];
        break;
      case AgentRole.PROFESSOR:
        this.district = 'Educatech District';
        this.permissions = ['teach', 'curate', 'evaluate'];
        break;
      case AgentRole.CAIXA:
        this.district = 'Financial District';
        this.permissions = ['transact', 'audit', 'refund'];
        break;
      case AgentRole.ANALISTA:
        this.district = 'Data District';
        this.permissions = ['query', 'report', 'visualize'];
        break;
      default:
        this.district = 'Public Area';
        this.permissions = ['walk'];
    }
  }

  public getEnvironmentVariable(key: string): string | undefined {
    return `city_env_${key}`; // Mock
  }

  public isCityActive(): boolean {
    return this.isActive;
  }

  /**
   * Simulação de falha para teste de Safe Mode
   */
  public simulateCrash(): void {
    this.isActive = false;
  }
}
