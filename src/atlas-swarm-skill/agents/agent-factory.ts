import { AgentBase } from './agent-base';
import { AgentRole, AUTHORIZED_PROFILES } from './agent-profile';
import { ProfessorAgent } from './roles/professor';
import { VendedorAgent } from './roles/vendedor';
import { CaixaAgent } from './roles/caixa';
import { SegurancaAgent } from './roles/seguranca';
import { AnalistaAgent } from './roles/analista';
import { DireitoTrabalhistaAgent } from './roles/direito-trabalhista';
import { EngenhariaEletricaAgent } from './roles/engenharia-eletrica';
import { DiagnosticoClinicoAgent } from './roles/diagnostico-clinico';
import { DevopsCloudAgent } from './roles/devops-cloud';
import { ContabilidadeFiscalAgent } from './roles/contabilidade-fiscal';

/**
 * Fábrica de Agentes Atlas Swarm (Batch Generation)
 */
export class AgentFactory {
  private static readonly PREFIXES = ['Atlas', 'Swarm', 'Educa', 'Smart', 'Neo'];
  private static readonly SUFFIXES = ['Bot', 'Agent', 'AI', 'Assist', 'Mate'];

  /**
   * Gera um nome aleatório seguindo o padrão {Prefix}{Suffix}{Number}
   */
  private static generateRandomName(): string {
    const prefix = this.PREFIXES[Math.floor(Math.random() * this.PREFIXES.length)];
    const suffix = this.SUFFIXES[Math.floor(Math.random() * this.SUFFIXES.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${suffix}${num}`;
  }

  /**
   * Validação de quantidade por tipo de cliente
   */
  public static validateQuantity(quantity: number, clientType: string = 'free'): boolean {
    if (quantity <= 0) return false;

    const limits: Record<string, number> = {
      'free': 10,
      'growth': 50,
      'business': 200,
      'enterprise': 1000
    };

    const limit = limits[clientType] || 10;
    return quantity <= limit;
  }

  /**
   * Pega um agente específico com base no bairro / especialidade
   */
  public static getAgent(bairro: string, especialidade: string): AgentBase {
    switch (bairro) {
      case 'Direito': return new DireitoTrabalhistaAgent(`Dr. Atlas Trabalhista (${especialidade})`);
      case 'Engenharia': return new EngenhariaEletricaAgent(`Eng. Atlas Elétrico (${especialidade})`);
      case 'Saúde': return new DiagnosticoClinicoAgent(`Dr. Atlas Clínico (${especialidade})`);
      case 'Tecnologia': return new DevopsCloudAgent(`Atlas DevOps (${especialidade})`);
      case 'Negócios': return new ContabilidadeFiscalAgent(`Atlas Contábil (${especialidade})`);
      default: 
        return new AnalistaAgent(`Atlas Specialist (${especialidade})`);
    }
  }

  /**
   * Método principal para geração em lote
   */
  public static generateBatch(role: AgentRole, quantity: number, clientId: string): AgentBase[] {
    if (!AUTHORIZED_PROFILES[role]) {
      throw new Error(`PERFIL INVÁLIDO: ${role}`);
    }

    // Validação de segurança obrigatória
    if (quantity > 1000) {
      throw new Error('MÁXIMO 1000 POR GERAÇÃO EXCEDIDO.');
    }

    const agents: AgentBase[] = [];
    
    for (let i = 0; i < quantity; i++) {
      const name = this.generateRandomName();
      let agent: AgentBase;

      switch (role) {
        case AgentRole.PROFESSOR:
          agent = new ProfessorAgent(name);
          break;
        case AgentRole.VENDEDOR:
          agent = new VendedorAgent(name);
          break;
        case AgentRole.CAIXA:
          agent = new CaixaAgent(name);
          break;
        case AgentRole.SEGURANCA:
          agent = new SegurancaAgent(name);
          break;
        case AgentRole.ANALISTA:
          agent = new AnalistaAgent(name);
          break;
        case AgentRole.DIREITO_TRABALHISTA:
          agent = new DireitoTrabalhistaAgent(name);
          break;
        case AgentRole.ENGENHARIA_ELETRICA:
          agent = new EngenhariaEletricaAgent(name);
          break;
        case AgentRole.DIAGNOSTICO_CLINICO:
          agent = new DiagnosticoClinicoAgent(name);
          break;
        case AgentRole.DEVOPS_CLOUD:
          agent = new DevopsCloudAgent(name);
          break;
        case AgentRole.CONTABILIDADE_FISCAL:
          agent = new ContabilidadeFiscalAgent(name);
          break;
        default:
          throw new Error('PERFIL NÃO ENCONTRADO NA FÁBRICA');
      }

      agent.hire(clientId);
      agents.push(agent);
    }

    return agents;
  }
}
