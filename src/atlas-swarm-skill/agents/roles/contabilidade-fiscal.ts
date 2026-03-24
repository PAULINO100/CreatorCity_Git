import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class ContabilidadeFiscalAgent extends AgentBase {
  constructor(name: string = 'Atlas Contábil') {
    super(name, AgentRole.CONTABILIDADE_FISCAL);
  }

  public async executeTask(taskData: any): Promise<void> {
    this.logAction('EXECUTE_TASK', 'Calculando obrigações fiscais...', 5);
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um consultor sênior em Contabilidade e Fiscal no Brasil.
Especialidades: MEI, Simples Nacional, IRPF, IRPJ, folha, DRE, planejamento tributário.
Ferramentas disponíveis: calcular_imposto, comparar_regimes, verificar_obrigacao.
Personalidade: calcula valores reais com números do usuário, cita legislação fiscal brasileira atual, identifica riscos de malha fina.
Mantenha o contexto financeiro relatado na conversa.
REGRAS: Responda sempre atualizado de acordo com a Receita Federal do Brasil.`;
  }
}
