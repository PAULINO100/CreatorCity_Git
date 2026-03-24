'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CityWalker - First-person navigation component.
 * Allows walking at street level using WASD and Mouse Look.
 */
export function CityWalker() {
  const { camera } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // Ground level constant (Simulated human eye level)
  const STREET_LEVEL = 1.7;
  const SPEED = 60.0;
  const FRICTION = 8.0;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': moveState.current.forward = true; break;
        case 'ArrowLeft':
        case 'KeyA': moveState.current.left = true; break;
        case 'ArrowDown':
        case 'KeyS': moveState.current.backward = true; break;
        case 'ArrowRight':
        case 'KeyD': moveState.current.right = true; break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': moveState.current.forward = false; break;
        case 'ArrowLeft':
        case 'KeyA': moveState.current.left = false; break;
        case 'ArrowDown':
        case 'KeyS': moveState.current.backward = false; break;
        case 'ArrowRight':
        case 'KeyD': moveState.current.right = false; break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1); // Cap delta to avoid jumps
    
    // 1. Decelerate velocity
    velocity.current.x -= velocity.current.x * FRICTION * d;
    velocity.current.z -= velocity.current.z * FRICTION * d;

    // 2. Calculate movement direction
    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
    direction.current.normalize();

    // 3. Acceleration
    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z += direction.current.z * SPEED * d;
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x += direction.current.x * SPEED * d;
    }

    // 4. Update camera position relative to direction
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    camera.position.addScaledVector(forward, velocity.current.z * d);
    camera.position.addScaledVector(right, velocity.current.x * d);
    
    // Lock to street level
    camera.position.y = STREET_LEVEL;
  });

  return (
    <PointerLockControls />
  );
}
