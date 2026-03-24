import { SplineWrapper } from '@/components/common/SplineWrapper';

interface SplineDroneProps {
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

/**
 * SplineDrone - Specialized component for the Cyberpunk Drone asset
 * Scene: https://prod.spline.design/seykuYikeIwpprZn/scene.splinecode
 */
export function SplineDrone({ className, style, onLoad }: SplineDroneProps) {
  return (
    <SplineWrapper
      sceneUrl="https://prod.spline.design/seykuYikeIwpprZn/scene.splinecode"
      fallbackColor="transparent"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style
      }}
      onLoad={onLoad}
    />
  );
}
