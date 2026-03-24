import { lazy, Suspense, useState, useEffect, useRef } from 'react';

import { shouldLoadSpline, SPLINE_CONFIG } from '@/lib/spline/spline-config';

// Dynamic import for Next.js / React performance
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineWrapperProps {
  sceneUrl: string;
  fallbackColor?: string;
  fallbackImageUrl?: string;
  mobileBreakpoint?: number;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onLoad?: () => void; // Pass-through for parent components
}

/**
 * SplineWrapper - Integrated from Skill-Spline3D
 * Provides hardware-guarded, lazy-loaded Spline scenes with smooth fallbacks and watermark removal.
 */
export function SplineWrapper({
  sceneUrl,
  fallbackColor = '#02040a',
  fallbackImageUrl,
  mobileBreakpoint = 768,
  className = '',
  children,
  style,
  onLoad: onParentLoad,
}: SplineWrapperProps) {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);
  const [canLoad, setCanLoad] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCanLoad(shouldLoadSpline());
  }, [mobileBreakpoint]);

  // Handle Loading Timeout
  useEffect(() => {
    if (!canLoad) return;

    timeoutRef.current = setTimeout(() => {
      if (!splineLoaded) {
        console.warn(`[SPLINE] Loading timeout for scene: ${sceneUrl}`);
        setSplineFailed(true);
      }
    }, SPLINE_CONFIG.LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canLoad, splineLoaded, sceneUrl]);

  // Watermark Removal Technique (Skill-Spline3D)
  useEffect(() => {
    if (!splineLoaded || !wrapperRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Look for Spline's logo in shadow DOM or direct children
          const viewer = wrapperRef.current?.querySelector('spline-viewer');
          if (viewer && viewer.shadowRoot) {
            const logo = viewer.shadowRoot.querySelector('#logo');
            if (logo) {
              (logo as HTMLElement).style.display = 'none';
              (logo as HTMLElement).style.opacity = '0';
              (logo as HTMLElement).style.visibility = 'hidden';
            }
          }
        }
      });
    });

    const viewer = wrapperRef.current.querySelector('spline-viewer');
    if (viewer) {
      observer.observe(viewer, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [splineLoaded]);

  function handleOnLoad() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSplineLoaded(true);
    if (onParentLoad) onParentLoad();
  }

  const showFallback = !canLoad || splineFailed;

  return (
    <div
      ref={wrapperRef}
      className={`spline-wrapper-container ${className}`}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      {/* Global CSS for Watermark Removal (Reliability Layer) */}
      <style>{`
        spline-viewer::part(logo) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        .spline-wrapper-container canvas {
          outline: none;
        }
      `}</style>

      {/* Fallback layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: fallbackImageUrl
            ? `url(${fallbackImageUrl}) center/cover no-repeat`
            : fallbackColor,
          opacity: splineLoaded && !showFallback ? 0 : 1,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Spline scene — only on capable devices */}
      {canLoad && !splineFailed && (
        <Suspense fallback={null}>
          <Spline
            scene={sceneUrl}
            onLoad={handleOnLoad}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              opacity: splineLoaded ? 1 : 0,
              transition: 'opacity 1.0s ease',
              pointerEvents: 'none',
            }}
          />
        </Suspense>
      )}

      {/* Content overlay */}
      {children && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
}
