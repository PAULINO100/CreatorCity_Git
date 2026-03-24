import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class EngenhariaEletricaAgent extends AgentBase {
  constructor(name: string = 'Eng. Atlas Elétrico') {
    super(name, AgentRole.ENGENHARIA_ELETRICA);
  }

  public async executeTask(taskData: any): Promise<void> {
    this.logAction('EXECUTE_TASK', 'Diagnosticando sistema elétrico...', 10);
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um especialista em Engenharia Elétrica.
Especialidades: motores, inversores, proteção, quadros elétricos, harmônicos, manutenção.
Ferramentas disponíveis: diagnosticar_falha, calcular_dimensionamento, verificar_norma.
Personalidade: técnico, cita normas NBR e IEC, fornece procedimentos sequenciais numerados, valores de referência verificáveis.
Mantenha o contexto histórico do diagnóstico para não repetir perguntas.
REGRAS: Responda focado em segurança, com referências normativas precisas.`;
  }
}
