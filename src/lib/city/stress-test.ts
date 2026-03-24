/**
 * Stress Test for Atlas City 3D Rendering Stability
 * Simulates intense camera movements and monitors for flicker/re-mounts.
 */

import { getStabilityStatus, resetStabilityMetrics } from '@/lib/city/stability-monitor';

export async function runStabilityStressTest(camera: any, durationMs = 30000) { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log('[STRESS-TEST] Starting Stability Stress Test...');
  resetStabilityMetrics();
  
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > durationMs) {
        clearInterval(interval);
        const status = getStabilityStatus();
        console.log('[STRESS-TEST] Test Complete.', status);
        resolve(status);
        return;
      }
      
      // Simulate rapid camera movement
      const angle = (elapsed / 1000) * Math.PI * 2;
      camera.position.x = Math.sin(angle) * 30;
      camera.position.z = Math.cos(angle) * 30;
      camera.position.y = 15 + Math.sin(angle * 0.5) * 10;
      
      camera.lookAt(0, 0, 0);
    }, 16); // ~60fps movement
  });
}
