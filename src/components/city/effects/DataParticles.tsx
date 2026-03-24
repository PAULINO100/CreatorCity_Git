import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function DataParticles({ count = 400, color = "#00ffff" }: { count?: number, color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  const particles = useMemo(() => {
    return Array.from({ length: Math.min(count, 500) }).map(() => ({
      // Spread across the Tech/AI district radius
      x: (Math.random() - 0.5) * 300,
      y: 10 + Math.random() * 200, // From ground up into the sky
      z: (Math.random() - 0.5) * 300,
      speed: 0.1 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      baseScale: 0.3 + Math.random() * 0.5
    }))
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime

    particles.forEach((p, i) => {
      // Smooth floating up and down
      const y = p.y + Math.sin(time * p.speed + p.phase) * 15
      dummy.position.set(p.x, y, p.z)
      
      // Slight tumbling rotation like digital cubes/bits
      dummy.rotation.x = time * p.speed
      dummy.rotation.y = time * (p.speed * 0.5)
      
      // Pulsating scale to simulate glowing heartbeat / data transfer
      const pulse = Math.sin(time * 3 + p.phase) * 0.3
      const currentScale = p.baseScale + pulse
      dummy.scale.set(currentScale, currentScale, currentScale)

      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* Cyan/bright blue glowing material or custom color */}
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
