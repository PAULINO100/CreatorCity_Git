/**
 * Perfis de Agentes Autorizados (Strictly Mandatory)
 */
export enum AgentRole {
  PROFESSOR = 'professor',
  VENDEDOR = 'vendedor',
  CAIXA = 'caixa',
  SEGURANCA = 'seguranca',
  ANALISTA = 'analista',
  DIREITO_TRABALHISTA = 'direito_trabalhista',
  ENGENHARIA_ELETRICA = 'engenharia_eletrica',
  DIAGNOSTICO_CLINICO = 'diagnostico_clinico',
  DEVOPS_CLOUD = 'devops_cloud',
  CONTABILIDADE_FISCAL = 'contabilidade_fiscal'
}

export interface AgentProfile {
  role: AgentRole;
  baseSalary: number;
  description: string;
}

export const AUTHORIZED_PROFILES: Record<AgentRole, AgentProfile> = {
  [AgentRole.PROFESSOR]: {
    role: AgentRole.PROFESSOR,
    baseSalary: 150,
    description: 'Aulas e suporte educacional'
  },
  [AgentRole.VENDEDOR]: {
    role: AgentRole.VENDEDOR,
    baseSalary: 150,
    description: 'Atendimento e vendas'
  },
  [AgentRole.CAIXA]: {
    role: AgentRole.CAIXA,
    baseSalary: 180,
    description: 'Processamento de pagamentos'
  },
  [AgentRole.SEGURANCA]: {
    role: AgentRole.SEGURANCA,
    baseSalary: 120,
    description: 'Monitoramento e segurança'
  },
  [AgentRole.ANALISTA]: {
    role: AgentRole.ANALISTA,
    baseSalary: 200,
    description: 'Relatórios e análise de dados'
  },
  [AgentRole.DIREITO_TRABALHISTA]: {
    role: AgentRole.DIREITO_TRABALHISTA,
    baseSalary: 300,
    description: 'Consultoria jurídica trabalhista'
  },
  [AgentRole.ENGENHARIA_ELETRICA]: {
    role: AgentRole.ENGENHARIA_ELETRICA,
    baseSalary: 320,
    description: 'Diagnóstico e projetos elétricos'
  },
  [AgentRole.DIAGNOSTICO_CLINICO]: {
    role: AgentRole.DIAGNOSTICO_CLINICO,
    baseSalary: 400,
    description: 'Análise clínica avançada'
  },
  [AgentRole.DEVOPS_CLOUD]: {
    role: AgentRole.DEVOPS_CLOUD,
    baseSalary: 350,
    description: 'Gestão de infraestrutura em nuvem'
  },
  [AgentRole.CONTABILIDADE_FISCAL]: {
    role: AgentRole.CONTABILIDADE_FISCAL,
    baseSalary: 280,
    description: 'Rotinas e gestão fiscal'
  }
};
