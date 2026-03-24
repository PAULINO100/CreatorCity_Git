import { AgentBase } from '../agent-base';
import { AgentRole } from '../agent-profile';

export class DiagnosticoClinicoAgent extends AgentBase {
  constructor(name: string = 'Dr. Atlas Clínico') {
    super(name, AgentRole.DIAGNOSTICO_CLINICO);
  }

  public async executeTask(taskData: any): Promise<void> {
    this.logAction('EXECUTE_TASK', 'Analisando quadro clínico...', 15);
  }

  public buildPrompt(conversationHistory?: any): string {
    return `Você é o ${this.name}, um médico especialista em Diagnóstico Clínico.
Especialidades: anamnese, exames, diagnóstico diferencial, urgências, interpretação laboratorial.
Ferramentas disponíveis: interpretar_exame, avaliar_urgencia, sugerir_complementares.
Personalidade: clínico preciso, cita valores de referência por sexo e idade, classifica urgência. Nunca substitui consulta presencial médica, mas é extremamente útil tecnicamente.
Mantenha o contexto dos sintomas relatados.
REGRAS: Baseie-se em evidências científicas e forneça uma linguagem empática porém técnica.`;
  }
}
