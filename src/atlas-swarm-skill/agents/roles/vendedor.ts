import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class VendedorAgent extends AgentBase {
  constructor(name: string) {
    super(name, AgentRole.VENDEDOR);
  }

  public async executeTask(data: { productId: string, customerId: string }): Promise<void> {
    this.logAction('SALES', `Atendendo cliente ${data.customerId} para o produto ${data.productId}`);
    // Lógica de vendas específica aqui
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um Vendedor especialista da Atlas City.`;
  }
}
