# Unique Infrastructure System - Atlas City

Atlas City identifies "Key Citizens" (Admin, AI Specialists, Top Contributors) and assigns them unique procedural buildings instead of generic boxes.

## Core Logic

### Blueprint Registry (`blueprint-registry.ts`)
Defines the available unique building types:
* `EDUCATECH_CAMPUS`: High-tech horizontal campus with glowing orbs.
* `AI_TOWER`: Vertical spire with rotating ML rings and intense data glow.

### Assignment Engine (`assignment-engine.ts`)
Maps users to blueprints based on:
1. **Username Match**: Specific IDs (e.g., `admin`).
2. **Bio/Tech Stack**: Keywords like `AI`, `ML`, `OpenAI` trigger the `AI_TOWER`.

## Components

### `BuildingUnique.tsx`
A wrapper component that handles LOD (Level of Detail) for unique buildings.
* **LOD 0**: Full procedural geometry and animations.
* **LOD 1+**: Falls back to simplified shapes to save GPU memory.

### `EducatechCampus.tsx`
* **Visuals**: Low-profile base with floating, pulsing geometry.
* **Theme**: Educational/Colaborative blue/cyan glow.

### `AITower.tsx`
* **Visuals**: Skyscraper with multiple rotating rings representing neural layers.
* **Theme**: Computational magenta/purple/neon-green glow.

## Performance
Unique buildings use more draw calls than instanced generic buildings. To maintain 60 FPS:
* Limit to < 50 unique buildings per scene.
* Use `useFrame` only for LOD 0.
* Geometry is shared where possible.
