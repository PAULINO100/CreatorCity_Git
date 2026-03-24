# Spline Integration Guide — Atlas City

## Overview
This project uses a hybrid integration of Spline assets:
1. **Spline Runtime**: For complex, interactive scenes (via `SplineWrapper`).
2. **Spline GLB Exports**: For high-performance instanced elements (Drones, Particles, Neon).

## Workflow (Skill-Spline3D Pattern)
1. **Design**: Create assets in Spline.
2. **Export**: 
   - For interactive scenes: Copy `.splinecode` URL.
   - For performance assets: Export as `.glb` with KTX2 compression.
3. **Placement**: Store `.glb` files in `/public/assets/spline/`.
4. **Integration**:
   - Use `useSplineAsset(path)` hook for GLBs.
   - Use `<SplineWrapper sceneUrl="..." />` for interactive scenes.

## Performance Guidelines
- **Max Polygons**: 5,000 per asset.
- **Hardware Guard**: Heavy scenes are automatically skipped on devices with `hardwareConcurrency <= 2`.
- **Instancing**: Always use `Instances` or `clone()` for repeated elements like drones.

## Troubleshooting
- **Flickering**: Ensure `pointerEvents: 'none'` if the Spline canvas covers UI elements.
- **Loading Hangs**: Check the `/public/assets/spline/` paths in the browser network tab.
