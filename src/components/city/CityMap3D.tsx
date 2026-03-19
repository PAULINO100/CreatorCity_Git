'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-expect-error OrbitControls is missing types in some builds
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeCitizen {
  id: string;
  name: string;
  score: number;
  x: number;
  y: number;
}

export const CityMap3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [citizens, setCitizens] = useState<ThreeCitizen[]>([]);

  useEffect(() => {
    fetch('/api/city/citizens').then(r => r.json()).then(setCitizens);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || citizens.length === 0) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x2563eb, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // 5. Ground
    const grid = new THREE.GridHelper(200, 20, 0x1e3a5c, 0x1e3a5c);
    scene.add(grid);

    // 6. Citizens as "Buildings"
    citizens.forEach(c => {
      const height = 2 + (c.score / 500);
      const geometry = new THREE.BoxGeometry(2, height, 2);
      const material = new THREE.MeshPhongMaterial({ color: 0x2563eb, transparent: true, opacity: 0.8 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(c.x - 50, height / 2, c.y - 50);
      scene.add(cube);
    });

    // 7. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 8. Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      if (container) container.removeChild(renderer.domElement);
    };
  }, [citizens]);

  return <div ref={containerRef} className="w-full h-screen bg-[#0A1628]" />;
};

export default CityMap3D;
