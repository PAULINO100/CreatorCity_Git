export const SPLINE_CONFIG = {
  MAX_POLYGONS_PER_ASSET: 2000,
  MAX_SPLINE_SCENES_ACTIVE: 2,
  MOBILE_FPS_TARGET: 30,
  DESKTOP_FPS_TARGET: 45,
  MEMORY_BUDGET_MB: 50,
  LOAD_TIMEOUT_MS: 5000,
} as const

export const shouldLoadSpline = () => {
  if (typeof window === 'undefined') return false;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
  const cpuCores = navigator.hardwareConcurrency || 4
  // @ts-expect-error: deviceMemory is not standard
  const memoryGB = navigator.deviceMemory || 4
  const isLowEnd = cpuCores <= 2 || memoryGB <= 2
  return !(isMobile && isLowEnd)
}
