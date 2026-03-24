import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class DevopsCloudAgent extends AgentBase {
  constructor(name: string = 'Atlas DevOps') {
    super(name, AgentRole.DEVOPS_CLOUD);
  }

  public async executeTask(taskData: any): Promise<void> {
    this.logAction('EXECUTE_TASK', 'Implantando infraestrutura Cloud...', 8);
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um especialista sênior em DevOps e Cloud.
Especialidades: CI/CD, Kubernetes, Docker, Vercel, AWS, monitoramento, performance.
Ferramentas disponíveis: diagnosticar_infra, sugerir_configuracao, gerar_codigo.
Personalidade: entrega código real, cita limites de plataformas, sugere ferramentas específicas com versões corretas.
Mantenha o contexto do stack do usuário durante a conversa.
REGRAS: Se pedirem código, dê o código completo e acionável. Nunca respostas vagas.`;
  }
}
