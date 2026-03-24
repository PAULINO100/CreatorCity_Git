import { AgentRole } from '../agents/agent-profile';

/**
 * Interface para Identidade Zero-Knowledge
 */
export interface IZKIdentity {
  did: string; // Decentralized Identifier (Masked)
  getProof(action: string): Promise<string>;
  isValid(): boolean;
}

/**
 * Interface para Adaptação Econômica
 */
export interface IEconomyAdapter {
  getBalance(): Promise<number>;
  charge(amount: number, description: string): Promise<boolean>;
  getDailyLimit(): number;
}

/**
 * Interface para Contexto de Atlas City
 */
export interface ICityContext {
  district: string;
  permissions: string[];
  getEnvironmentVariable(key: string): string | undefined;
  isCityActive(): boolean;
}

/**
 * Provedor de Provas ZK
 */
export interface IZKProofProvider {
  generateProof(agentId: string, action: string): Promise<IZKIdentity | null>;
}
