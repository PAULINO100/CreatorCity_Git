// Core
export * from './agents/agent-base';
export * from './agents/agent-factory';
export * from './agents/agent-registry';
export * from './agents/agent-profile';

// Roles
export * from './agents/roles/professor';
export * from './agents/roles/vendedor';
export * from './agents/roles/caixa';
export * from './agents/roles/seguranca';
export * from './agents/roles/analista';

// Deployment & Monitoring (Fase 3)
export * from './deployment/deployment-manager';
export * from './deployment/monitoring.config';
export * from './deployment/rollback-manager';

console.log('🚀 Atlas Swarm Skill Core, Integration & Deployment Initialized');
