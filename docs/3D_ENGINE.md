# Atlas City: 3D Engine Documentation

## Architecture

### Components
| Component | Description |
|-----------|-------------|
| `CityScene3D.tsx` | Main Canvas wrapper with camera, lighting, fog, and HUD overlay |
| `Building3D.tsx` | Individual building mesh with score-based height, window stripes, and ground glow |
| `DistrictZone3D.tsx` | 5 themed ground planes with semi-transparent colors and edge borders |

### Dependencies
- `three` — Core 3D library
- `@react-three/fiber` — React renderer for Three.js
- `@react-three/drei` — Helpers (OrbitControls, Stars, Html)
- `@react-three/postprocessing` — Post-processing effects (reserved for Phase 3B)

## Camera & Controls
- **OrbitControls**: Zoom (scroll), pan (right-click drag), rotate (left-click drag)
- **Auto-Rotate**: Slow 0.3 speed, stops on interaction
- **Constraints**: Max polar angle π/2.2 (can't go below ground), zoom range 3-25 units
- **Default Position**: `[12, 10, 12]` with 50° FOV

## Lighting
- **Ambient**: Low intensity blue (#4488ff, 0.15) for atmosphere
- **Directional**: White from `[10, 15, 10]`, casts shadows (2048px shadow map)
- **Point**: Blue accent at center, 30 unit range
- **Fog**: Dark navy #050a14, 20-40 unit range

## Building Logic
- Height = `score / 2000` (capped at min 0.3)
- Width = `0.3 + min(score/20000, 0.4)`
- Window stripes: Horizontal lines every 0.4 units, max 12
- Ground glow: Circle under each building, brighter for score > 5000
- Beacon: White sphere on top for score > 8000

## District Zones
| Zone | Color | Grid Position |
|------|-------|---------------|
| Tech | #3b82f6 | Top-left |
| Creator | #a855f7 | Top-right |
| Science | #22c55e | Bottom-left |
| Education | #eab308 | Bottom-center |
| Startup | #f97316 | Bottom-right |

## Performance Targets
- **Target**: >30 FPS with 95+ buildings
- **DPR Scaling**: `[1, 1.5]` — lower bound for weak GPUs
- **Performance**: `{ min: 0.5 }` — R3F adaptive performance
- **No instanced meshes yet**: Phase 3B will add InstancedMesh for 500+ buildings
- **Frustum culling**: Enabled by default in Three.js

## WebGL Fallback
- `detectWebGL()` checks for `webgl2` or `webgl` context
- If unsupported: auto-switches to 2D map, disables 3D toggle button
- User can manually switch between 2D/3D with the toggle

## Roadmap
- **Phase 3B**: Post-processing (bloom, ambient occlusion), instanced meshes, day/night cycle
- **Phase 3C**: Real-time multiplayer presence, flying camera paths, building inspection mode
