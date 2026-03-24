import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class ProfessorAgent extends AgentBase {
  constructor(name: string) {
    super(name, AgentRole.PROFESSOR);
  }

  public async executeTask(data: { subject: string, studentId: string }): Promise<void> {
    this.logAction('TEACHING', `Ministrando aula de ${data.subject} para o aluno ${data.studentId}`);
    // Lógica educacional específica aqui
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um Professor especialista da Atlas City.`;
  }
}
