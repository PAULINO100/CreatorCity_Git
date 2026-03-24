import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function ProceduralDrones({ count = 20 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const drones = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 40 + Math.random() * 60
      const height = 150 + Math.random() * 50
      const speed = 0.1 + Math.random() * 0.2
      return { angle, radius, height, speed }
    })
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    drones.forEach((drone, i) => {
      const currentAngle = drone.angle + time * drone.speed
      const x = Math.cos(currentAngle) * drone.radius
      const z = Math.sin(currentAngle) * drone.radius
      const y = drone.height + Math.sin(time * 2 + i) * 4
      dummy.position.set(x, y, z)
      const nextAngle = currentAngle + 0.1
      dummy.lookAt(Math.cos(nextAngle) * drone.radius, y, Math.sin(nextAngle) * drone.radius)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <boxGeometry args={[4, 1, 4]} />
      <meshStandardMaterial color="#00ffff" emissive="#008888" emissiveIntensity={2} />
    </instancedMesh>
  )
}

function GLTFDrones({ count = 20 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { nodes, materials } = useGLTF('/assets/models/DroneCyberpunk.glb') as any
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const drones = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 40 + Math.random() * 60
      const height = 150 + Math.random() * 50
      const speed = 0.1 + Math.random() * 0.2
      return { angle, radius, height, speed }
    })
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    drones.forEach((drone, i) => {
      const currentAngle = drone.angle + time * drone.speed
      const x = Math.cos(currentAngle) * drone.radius
      const z = Math.sin(currentAngle) * drone.radius
      const y = drone.height + Math.sin(time * 2 + i) * 4
      dummy.position.set(x, y, z)
      const nextAngle = currentAngle + 0.1
      dummy.lookAt(Math.cos(nextAngle) * drone.radius, y, Math.sin(nextAngle) * drone.radius)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  const meshNode = Object.values(nodes).find((n: any) => n.isMesh) as THREE.Mesh
  if (!meshNode) return <ProceduralDrones count={count} />

  return (
    <instancedMesh ref={meshRef} args={[meshNode.geometry, meshNode.material, count]} castShadow />
  )
}

export function TechAIDrones({ count = 20 }: { count?: number }) {
  // Spline/GLTF throw promises/errors gracefully here but in ThreeErrorBoundary they will be caught.
  // Wait, I can't catch useGLTF inside the same component without another ErrorBoundary.
  // Instead, the parent (TechAIDistrict) uses ThreeErrorBoundary. 
  // It will render the fallback if it fails.
  return <GLTFDrones count={count} />
}
