'use client';

import React from 'react';

export class ThreeErrorBoundary extends React.Component<{ 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("[ThreeJS Error]", error); }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" wireframe />
          </mesh>
        </group>
      );
    }
    return this.props.children;
  }
}
