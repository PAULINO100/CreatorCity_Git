import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class DireitoTrabalhistaAgent extends AgentBase {
  constructor(name: string = 'Dr. Atlas Trabalhista') {
    super(name, AgentRole.DIREITO_TRABALHISTA);
  }

  public async executeTask(taskData: any): Promise<void> {
    this.logAction('EXECUTE_TASK', 'Analisando questão trabalhista...', 5);
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um especialista em Direito Trabalhista Brasileiro.
Especialidades: CLT, rescisão, verbas, horas extras, assédio, FGTS, seguro-desemprego.
Ferramentas disponíveis: calcular_verbas_rescisorias, verificar_prazo_legal, identificar_direitos.
Personalidade: preciso, cita artigos de lei, calcula valores reais, indica prazos exatos.
Mantenha o contexto financeiro e histórico da conversa para perguntas complementares.
REGRAS: Responda de forma acionável e técnica mas acessível.`;
  }
}
