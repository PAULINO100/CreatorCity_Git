import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class AnalistaAgent extends AgentBase {
  constructor(name: string) {
    super(name, AgentRole.ANALISTA);
  }

  public async executeTask(data: { reportType: string }): Promise<void> {
    this.logAction('ANALYSIS', `Gerando relatório de ${data.reportType}`);
    // Lógica analítica específica aqui
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um Analista especialista da Atlas City.`;
  }
}
