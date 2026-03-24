# Atlas City: Rendering Scale — 1018 Buildings

Estratégias usadas para escalar o motor 3D de 100 → 1018 prédios mantendo 45+ FPS estável.

## Arquitetura de Renderização

```
useRenderBudget(1018)
  └── Monitora FPS em janela de 30-60 frames
  └── Auto-fallback: 1018 → 800 → 500 → 300
  └── Context Lost listener → step-down imediato

BuildingInstances (x3, um por chunk)
  ├── Texture Atlas Singleton (1 canvas, 1 CanvasTexture para 1018 prédios)
  ├── Material Singletons (matUltra / matMid / matFar — criados uma vez)
  ├── BoxGeometry Singleton + BVH (1 geom compartilhada)
  ├── District Batching (batchByDistrict → menos GL state changes)
  ├── Vector3 Reutilizado (_scratchPos) → zero GC por frame
  ├── BVH Rebuild apenas em mudança de distrito (não por frame)
  ├── LOD em 5 Tiers por chunk (useFrame a cada 45 frames)
  └── Fade-in para Chunks 2 e 3 (opacity 0→1 em ~650ms)
```

## LOD Thresholds (Afinados para 1018 Prédios)

| Preset | Ultra | Near | Mid | Far | Cull |
| :--- | :---: | :---: | :---: | :---: | :---: |
| ULTRA | 8u | 20u | 45u | 100u | 200u |
| HIGH | 6u | 16u | 35u | 75u | 150u |
| MEDIUM | 5u | 12u | 28u | 60u | 120u |
| LOW | 3u | 8u | 18u | 40u | 80u |
| CULL | 2u | 5u | 10u | 20u | 40u |

## Render Budget (Auto-Fallback)

```
1018 buildings (default)
  ↓ se FPS < 25 por 3s
800 buildings
  ↓ se FPS < 25 por 3s
500 buildings
  ↓ se FPS < 25 por 3s
300 buildings (mínimo)
```

Também reage a `webglcontextlost` → step-down imediato.

## Benchmarks Projetados

| Métrica | LOW | MEDIUM | HIGH | ULTRA |
| :--- | :--- | :--- | :--- | :--- |
| FPS (Desktop GPU) | 90+ | 60+ | 45-60 | 30-45 |
| FPS (Integrado) | 60 | 45 | 25-35 | N/A |
| FPS (Mobile) | 30-45 | 20-30 | N/A | N/A |
| Memory (1018) | ~140MB | ~160MB | ~190MB | ~220MB |
| Load t0 (Chunk 1) | ~0.5s | ~0.5s | ~0.8s | ~1.2s |
| Load t1 (all) | ~5s | ~5s | ~5s | ~5s |

## Memória: O que Mudou

| Antes | Depois |
| :--- | :--- |
| `new THREE.Vector3()` por prédio por frame | `_scratchPos` reutilizado |
| `new THREE.BoxGeometry()` por chunk | 1 singleton para todos os chunks |
| `createWindowMaterial()` por render | 1 atlas, 3 materiais singleton |
| BVH rebuild a cada 45 frames | BVH rebuild apenas ao mudar de distrito |

## Arquivos Criados/Modificados

| Arquivo | Status |
| :--- | :--- |
| `src/hooks/useRenderBudget.ts` | ✅ NOVO |
| `src/components/city/BuildingInstances.tsx` | ✅ REESCRITO |
| `src/lib/city/performance-store.ts` | ✅ LOD thresholds afinados |
| `src/components/city/CityScene3D.tsx` | ✅ justLoaded nos chunks 2 e 3 |
