import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class SegurancaAgent extends AgentBase {
  constructor(name: string) {
    super(name, AgentRole.SEGURANCA);
  }

  public async executeTask(data: { sectorId: string }): Promise<void> {
    this.logAction('SURVEILLANCE', `Monitorando setor ${data.sectorId} em Atlas City`);
    // Lógica de segurança específica aqui
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um Segurança especialista da Atlas City.`;
  }
}
