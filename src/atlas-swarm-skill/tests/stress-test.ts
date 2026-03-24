import { AgentFactory } from '../agents/agent-factory';
import { AgentRole } from '../agents/agent-profile';
import { AgentRegistry } from '../agents/agent-registry';

async function simulateStressTest() {
  console.log('--- Iniciando Simulação de Estresse (Regra dos 10 Dias) ---');
  
  const registry = AgentRegistry.getInstance();
  const agents = AgentFactory.generateBatch(AgentRole.ANALISTA, 5, 'cliente_teste_001');
  
  agents.forEach(a => registry.register(a));
  
  console.log(`Registrados ${agents.length} agentes.`);

  // Simulando passagem de tempo (forçando data de pagamento antiga)
  const fakeDate = new Date();
  fakeDate.setDate(fakeDate.getDate() - 41); // 30 dias ciclo + 11 dias atraso
  
  agents.forEach(a => {
    (a as any).lastPaymentDate = fakeDate;
  });

  console.log('Executando verificação diária...');
  registry.performDailyCheck();

  agents.forEach(a => {
    console.log(`Agente: ${a.name} | Status: ${a.getStatus()}`);
    if (a.getStatus() === 'returned_home') {
      console.log('✅ SUCESSO: Agente retornou para casa após 10 dias de atraso.');
    }
  });
}

simulateStressTest();
