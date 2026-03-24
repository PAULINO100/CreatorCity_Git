# Spline Asset Workflow — Atlas City

## Designer Guidelines
1. **Tool**: Spline (spline.design)
2. **Export Format**: GLB (Binary GLTF)
3. **Optimizations**:
   - Use **KTX2** for texture compression.
   - Max polygon count: **5,000 per asset**.
   - Bake lighting when possible.
4. **Naming Convention**:
   - Format: `[Type]_[District]_[Variant].glb`
   - Example: `Drone_Tech_01.glb`, `NeonSign_Creator_Alpha.glb`

## Integration Path
Place all exported assets in `/public/assets/spline/`.

## Developer Path
Use the `useSplineAsset(path)` hook in `src/lib/assets/spline-loader.ts`.
Always provide a code-based fallback in the React component.

## Especificações de Assets Spline (Referência)

### TECH/AI District
- **AI_District_Sign.splinecode**
  - Texto: "[AI DISTRICT]\nINTELIGÊNCIA ARTIFICIAL..."
  - Polys: < 2000
  - Neon glow: #60A5FA
  - Animação: pulso 2s

- **Neural_Network_Sphere.splinecode**
  - Esfera de rede neural holográfica
  - Polys: < 3000
  - Animação: rotação + pulsação
  - Cores: azul/ciano brilhante

### EDUCATECH AI Landmark
- **EducatechAI_Building.splinecode**
  - Edifício icônico futurista
  - Polys: < 5000
  - Estilo: campus tecnológico
  - Cores: azul #3B82F6 + branco

- **Holographic_Portal.splinecode**
  - Portal de entrada com holograma
  - Polys: < 2000
  - Animação: rotação + partículas

- **AI_Sphere_Top.splinecode**
  - Esfera de IA no topo do edifício
  - Polys: < 1500
  - Animação: flutuação + glow

### Guidelines Gerais
- **Max polys por asset**: 5000
- **Texturas**: 512px KTX2 compression
- **Animações**: baked keyframes (não runtime)
- **Materiais**: emissive para neon/glow
- **Export**: .splinecode + .glb fallback
