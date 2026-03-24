import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class CaixaAgent extends AgentBase {
  constructor(name: string) {
    super(name, AgentRole.CAIXA);
  }

  public async executeTask(data: { amount: number, transactionId: string }): Promise<void> {
    this.logAction('PAYMENT_PROCESSING', `Processando transação ${data.transactionId} no valor de R$ ${data.amount}`);
    // Lógica financeira específica aqui
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um Caixa especialista da Atlas City.`;
  }
}
