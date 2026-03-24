/**
 * Stability Monitor for Atlas City
 * Tracks flicker events, re-mounts, and rendering anomalies.
 */

interface StabilityMetrics {
  flickerEvents: number;
  reMounts: Record<string, number>;
  lastBuildingCount: number;
  instabilityScore: number;
}

const metrics: StabilityMetrics = {
  flickerEvents: 0,
  reMounts: {},
  lastBuildingCount: 0,
  instabilityScore: 0,
};

export const trackReMount = (componentId: string) => {
  metrics.reMounts[componentId] = (metrics.reMounts[componentId] || 0) + 1;
  if (metrics.reMounts[componentId] > 5) {
    console.warn(`[STABILITY] Excessive re-mounts detected for ${componentId}`);
    metrics.instabilityScore += 2;
  }
};

export const trackFlicker = (currentCount: number) => {
  const diff = Math.abs(currentCount - metrics.lastBuildingCount);
  // If count changes by more than 50% in one frame (excluding initial load)
  if (metrics.lastBuildingCount > 0 && diff > metrics.lastBuildingCount * 0.5) {
    metrics.flickerEvents++;
    metrics.instabilityScore += 5;
    console.error(`[STABILITY] Flicker event detected! Count jumped from ${metrics.lastBuildingCount} to ${currentCount}`);
  }
  metrics.lastBuildingCount = currentCount;
};

export const getStabilityStatus = () => {
  return {
    isStable: metrics.instabilityScore < 10,
    score: metrics.instabilityScore,
    metrics: { ...metrics }
  };
};

export const resetStabilityMetrics = () => {
  metrics.flickerEvents = 0;
  metrics.instabilityScore = 0;
  // We don't reset reMounts as they are cumulative for the session
};
