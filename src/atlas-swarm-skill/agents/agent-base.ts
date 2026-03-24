import { v4 as uuidv4 } from 'uuid';
import { AgentRole, AgentProfile, AUTHORIZED_PROFILES } from './agent-profile';
import { IZKIdentity, IZKProofProvider, IEconomyAdapter, ICityContext } from '../integration/interfaces';
import { ZKAdapter } from '../integration/zk-adapter';
import { EconomyAdapter } from '../integration/economy-adapter';
import { CityContextProvider } from '../integration/city-adapter';

export type AgentStatus = 'active' | 'pending_payment' | 'returned_home' | 'terminated' | 'safe_mode';

/**
 * Interface para logs de auditoria
 */
export interface AuditLog {
  timestamp: Date;
  action: string;
  details: string;
  cost?: number; // Adicionado para auditoria econômica (Fase 2)
}

/**
 * Classe Abstrata Base para todos os Agentes Atlas Swarm
 * Implementa lifecycle, segurança, Regra dos 10 Dias e Integração com Ecossistema.
 */
export abstract class AgentBase {
  public readonly id: string;
  public readonly name: string;
  public readonly role: AgentRole;
  public readonly baseSalary: number;
  
  protected status: AgentStatus = 'active';
  protected clientId: string | null = null;
  protected daysOverdue: number = 0;
  protected lastPaymentDate: Date;
  protected logs: AuditLog[] = [];

  // Integrações (Fase 2)
  protected identity: IZKIdentity | null = null;
  protected zkProvider: IZKProofProvider = new ZKAdapter();
  protected economy: IEconomyAdapter = new EconomyAdapter();
  protected cityContext: ICityContext;

  constructor(name: string, role: AgentRole) {
    const profile = AUTHORIZED_PROFILES[role];
    if (!profile) {
      throw new Error(`PERFIL NÃO AUTORIZADO: ${role}`);
    }

    this.id = uuidv4();
    this.name = name;
    this.role = role;
    this.baseSalary = profile.baseSalary;
    this.lastPaymentDate = new Date();
    this.cityContext = new CityContextProvider(role);
    
    this.logAction('INITIALIZATION', `Agente ${name} (${role}) criado com ID ${this.id}`);
  }

  /**
   * Lifecycle: Atribui o agente a um cliente e gera identidade ZK
   */
  public async hire(clientId: string): Promise<void> {
    this.clientId = clientId;
    this.status = 'active';
    
    // Autênticação Obrigatória em Fase 2
    const identityResult = await this.zkProvider.generateProof(this.id, 'HIRE');
    if (!identityResult) {
      this.status = 'terminated';
      this.logAction('SECURITY_FAILURE', 'Falha ao obter identidade ZK. Agente encerrado.');
      throw new Error('SEC_FAIL: ZK-ID Indisponível');
    }

    this.identity = identityResult;
    this.logAction('HIRE', `Agente contratado pelo cliente ${clientId} com DID: ${this.identity.did}`);
  }

  /**
   * Execução Segura de Tarefa (Wrapper com Fail-Closed e Auditoria Econômica)
   */
  public async performAction(actionName: string, cost: number, taskData: any): Promise<void> {
    // 1. Verificação de Identidade (Fail-Closed)
    if (!this.identity || !this.identity.isValid()) {
      this.status = 'terminated';
      throw new Error('SECURITY_BREACH: Identidade inválida ou ausente.');
    }

    // 2. Verificação de Saúde do Contexto (Safe Mode)
    if (!this.cityContext.isCityActive()) {
      this.status = 'safe_mode';
      this.logAction('SAFE_MODE_ENTRY', 'Atlas City offline. Operando em modo de segurança.');
      // No Safe Mode, o agente pode decidir não cobrar ou executar apenas tarefas locais
    }

    // 3. Verificação de Saldo e Limite (Atlas Economy)
    const canAfford = await this.economy.charge(cost, actionName);
    if (!canAfford) {
      this.logAction('ECONOMY_FAILURE', `Saldo insuficiente para ação: ${actionName}`, cost);
      throw new Error('ECON_FAIL: Recurso insuficiente.');
    }

    // 4. Execução Concreta (Try-Catch Obrigatório na Fase 2)
    try {
      this.logAction('ACTION_START', `Iniciando task: ${actionName}`, cost);
      await this.executeTask(taskData);
      this.logAction('ACTION_COMPLETE', `Task finalizada: ${actionName}`);
    } catch (error) {
      this.logAction('EXECUTE_ERROR', `Falha na execução: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Segurança & Regra dos 10 Dias: Verifica status de pagamento
   */
  public checkPaymentStatus(): void {
    if (this.status === 'returned_home' || !this.clientId) return;

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - this.lastPaymentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      this.daysOverdue = diffDays - 30;
      
      if (this.daysOverdue >= 10) {
        this.returnHome();
      } else if (this.daysOverdue > 0) {
        this.status = 'pending_payment';
        this.logAction('WARNING', `Pagamento em atraso: ${this.daysOverdue} dias`);
      }
    }
  }

  /**
   * 🏠 REGRA DOS 10 DIAS: O Agente volta para a Educatech AI
   */
  protected returnHome(): void {
    this.status = 'returned_home';
    const oldClient = this.clientId;
    this.clientId = null;
    this.daysOverdue = 0;
    
    this.logAction('RETURN_HOME', `Regra dos 10 dias aplicada. Agente removido do cliente ${oldClient}`);
  }

  protected logAction(action: string, details: string, cost?: number): void {
    const entry: AuditLog = {
      timestamp: new Date(),
      action,
      details,
      cost
    };
    this.logs.push(entry);
    console.log(`[AUDIT][${entry.timestamp.toISOString()}] ${this.name} | ${action}: ${details} ${cost ? `| Custo: ${cost}` : ''}`);
  }

  public getStatus(): AgentStatus {
    return this.status;
  }

  public getLogs(): AuditLog[] {
    return [...this.logs];
  }

  public abstract executeTask(taskData: any): Promise<void>;
  public abstract buildPrompt(conversationHistory?: any): string;
}
