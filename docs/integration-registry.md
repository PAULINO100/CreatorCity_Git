# Integração: AgentRegistry & CityState

Este documento descreve como o `AgentRegistry` (Atlas Swarm Skill) interage com o `CityStateManager` (Atlas City) para garantir a integridade das operações críticas.

## Fluxo de Consulta de Estado

Antes de qualquer ação de alto impacto (ex: Deploy em lote, Transação inter-distritos), o `AgentRegistry` deve validar a saúde do estado da cidade:

1. **Consulta Pre-Action**:
   - O Registry chama `CityStateManager.getInstance().loadCityState()`.
   - Se o retorno for `null` ou `Safe Mode`, a ação é bloqueada.

2. **Hook de Auditoria**:
   - O `AgentRegistry` injeta um checkpoint no `CityStateManager` após cada marco de produção (ex: 100 agentes implantados).

## Exemplo de Implementação (Pseudo-código)

```typescript
// No AgentRegistry.ts
import { CityStateManager } from 'atlas-city/lib/city/CityStateManager';

public async deployCriticalBatch(agents: Agent[]) {
  const state = await CityStateManager.getInstance().loadCityState();
  
  if (state?.status === 'corrupted' || !state) {
    throw new Error('DEPLOY_ABORTED: Estado da cidade inconsistente.');
  }
  
  // Prossegue com deploy...
}
```

## Segurança Fail-Closed
Se o `CityStateManager` reportar uma tentativa de carregamento que resultou em rollback ou falha, o `AgentRegistry` deve automaticamente colocar todos os agentes recém-implantados em `Safe Mode`.
