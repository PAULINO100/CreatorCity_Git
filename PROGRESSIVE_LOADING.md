# Atlas City: Progressive Loading System

Sistema de carregamento progressivo por chunks para o motor 3D com 1013+ prédios.

## Arquitetura

```
CityScene3D
  └── fetches all citizens (1013)
  └── CityContent
        └── useChunkedLoader(citizens)
              ├── Sort by distance (Priority Queue)
              ├── Chunk 1 (33%, ~337, t=0ms)    → LOD Ultra
              ├── Chunk 2 (66%, ~337, t=2000ms)  → LOD Mid
              └── Chunk 3 (100%, ~339, t=4500ms) → LOD Far
        └── ChunkPlaceholders  (dark cubes for pending buildings)
        └── BuildingInstances x3 (one per chunk)
        └── ChunkLoadingProgressUI (barra 33%→66%→100%)
```

## Componentes

### `useChunkedLoader` (`/src/hooks/useChunkedLoader.ts`)
Hook principal. Recebe todos os citizens, ordena por distância do spawn (Priority Queue) e divide em 3 chunks. Suporta pause/resume e unloading automático se memória >80%.

### `ChunkLoadingProgressUI` (`/src/components/city/ChunkLoadingProgressUI.tsx`)
UI overlay com barra de progresso e 3 milestone dots (33%→66%→100%). Desaparece automaticamente quando `phase === 'done'`.

### `ChunkPlaceholders` (`/src/components/city/ChunkPlaceholders.tsx`)
Renderiza cubos simples e escuros para todos os prédios ainda não carregados em chunks reais, criando um "skeleton" visual imediato da cidade.

## Configuração de Chunk Delays

```ts
useChunkedLoader(citizens, {
  chunk1delay: 0,        // Imediato (337 prédios mais próximos)
  chunk2delay: 2000,     // 2s após mount
  chunk3delay: 4500,     // 4.5s após mount
  memoryThreshold: 80,   // % de heap antes de fazer unload
})
```

Para ajustar os tamanhos dos chunks, edite `chunkThresholds` no hook:
```ts
const chunkThresholds = [0.33, 0.66, 1.0]; // 33% / 66% / 100%
```

## Benchmarks (Projetados)

| Métrica | Antes | Depois |
| :--- | :--- | :--- |
| Tempo para primeira interação | ~6s | **~1.5s** |
| Memory spike inicial | ~220MB | **~90MB** |
| Load time total | ~6s | ~4.5s |
| FPS durante load | 10-20 FPS | **50-60 FPS** |

## LOD Integration

| Chunk | Faixa de distância | LOD | Delay |
| :--- | :--- | :--- | :--- |
| Chunk 1 | Mais próximos (33%) | Ultra (janelas + sombras) | 0ms |
| Chunk 2 | Distância média (33%) | Mid (Lambert) | 2000ms |
| Chunk 3 | Distantes (34%) | Far (Basic Color) | 4500ms |

## Frustum Culling

A função `isInFrustum(citizen, camera)` no hook pode ser usada para filtrar chunks antes de passá-los ao `BuildingInstances`, eliminando builds fora do campo de visão antes mesmo de entrar no shader. (Ativo por padrão na próxima iteração.)

## Chunk Unloading (Memory Guard)

Se `performance.memory.usedJSHeapSize / jsHeapSizeLimit > 80%`, o Chunk 3 não é carregado e eventuais chunks distantes são removidos do estado. Isso previne crashes em mobile mid-range.
