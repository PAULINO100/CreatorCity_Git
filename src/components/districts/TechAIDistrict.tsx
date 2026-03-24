'use client'

import { useFrame } from '@react-three/fiber'
import { SplineWrapper } from '@/components/common/SplineWrapper'
import { BuildingInstances } from '@/components/city/BuildingInstances'
import { useState, useRef } from 'react'
import * as THREE from 'three'
import { Html, Text } from '@react-three/drei'
import { TECH_AI_DISTRICT } from '@/lib/districts/tech-ai-district-config'
import { TechAIDrones, ProceduralDrones } from '@/components/city/effects/TechAIDrones'
import { DataParticles } from '@/components/city/effects/DataParticles'
import { DataRain } from '@/components/city/effects/DataRain'
import { ThreeErrorBoundary } from '@/components/common/ThreeErrorBoundary'
import { Suspense } from 'react'

export function TechAIDistrict({ buildings, cameraPosition }: { buildings: any[], cameraPosition?: any }) {
  const [loaded, setLoaded] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  // Hardware guard
  const isLowEnd = typeof navigator !== 'undefined' && (
    navigator.hardwareConcurrency <= 2 ||
    ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2)
  )

  if (isLowEnd) {
    return <TechAIDistrictFallback buildings={buildings} />
  }

  return (
    <group ref={groupRef} position={[TECH_AI_DISTRICT.centerPosition.x, TECH_AI_DISTRICT.centerPosition.y, TECH_AI_DISTRICT.centerPosition.z]}>
      {/* 1. Letreiro Neon Gigante */}
      <ThreeErrorBoundary 
        fallback={
          <Text
            fontSize={12}
            color="#60A5FA"
            position={[TECH_AI_DISTRICT.splineAssets.neonSign.position.x, 220, TECH_AI_DISTRICT.splineAssets.neonSign.position.z]}
            rotation={[0, Math.PI / 4, 0]}
          >
            {TECH_AI_DISTRICT.name}
            <meshStandardMaterial 
              color="#60A5FA" 
              emissive="#3B82F6" 
              emissiveIntensity={5} 
              toneMapped={false}
            />
          </Text>
        }
      >
        {!TECH_AI_DISTRICT.splineAssets.neonSign.useProceduralFallback ? (
          <Html transform distanceFactor={15} center position={[TECH_AI_DISTRICT.splineAssets.neonSign.position.x, 220, TECH_AI_DISTRICT.splineAssets.neonSign.position.z]}>
            <div style={{ width: 800, height: 400 }}>
              <SplineWrapper
                sceneUrl={TECH_AI_DISTRICT.splineAssets.neonSign.url}
                fallbackColor="transparent"
              />
            </div>
          </Html>
        ) : (
          <Text
            fontSize={12}
            color="#60A5FA"
            position={[TECH_AI_DISTRICT.splineAssets.neonSign.position.x, 220, TECH_AI_DISTRICT.splineAssets.neonSign.position.z]}
            rotation={[0, Math.PI / 4, 0]}
          >
            {TECH_AI_DISTRICT.name}
            <meshStandardMaterial 
              color="#60A5FA" 
              emissive="#3B82F6" 
              emissiveIntensity={5} 
              toneMapped={false}
            />
          </Text>
        )}
      </ThreeErrorBoundary>

      {/* 2. Esfera de Rede Neural */}
      <ThreeErrorBoundary 
        fallback={
          <mesh position={[TECH_AI_DISTRICT.splineAssets.neuralSphere.position.x, TECH_AI_DISTRICT.splineAssets.neuralSphere.position.y, TECH_AI_DISTRICT.splineAssets.neuralSphere.position.z]}>
            <sphereGeometry args={[20, 32, 32]} />
            <meshStandardMaterial 
              color="#3B82F6" 
              emissive="#60A5FA" 
              emissiveIntensity={2} 
              wireframe 
              toneMapped={false}
            />
          </mesh>
        }
      >
        {!TECH_AI_DISTRICT.splineAssets.neuralSphere.useProceduralFallback ? (
          <Html transform distanceFactor={15} center position={[TECH_AI_DISTRICT.splineAssets.neuralSphere.position.x, TECH_AI_DISTRICT.splineAssets.neuralSphere.position.y, TECH_AI_DISTRICT.splineAssets.neuralSphere.position.z]}>
            <div style={{ width: 600, height: 600 }}>
              <SplineWrapper
                sceneUrl={TECH_AI_DISTRICT.splineAssets.neuralSphere.url}
                fallbackColor="transparent"
              />
            </div>
          </Html>
        ) : (
          <mesh position={[TECH_AI_DISTRICT.splineAssets.neuralSphere.position.x, TECH_AI_DISTRICT.splineAssets.neuralSphere.position.y, TECH_AI_DISTRICT.splineAssets.neuralSphere.position.z]}>
            <sphereGeometry args={[20, 32, 32]} />
            <meshStandardMaterial 
              color="#3B82F6" 
              emissive="#60A5FA" 
              emissiveIntensity={2} 
              wireframe 
              toneMapped={false}
            />
          </mesh>
        )}
      </ThreeErrorBoundary>

      {/* 3. Prédios do Distrito (futuristic towers) */}
      {/* Handled by CityContent globally to maintain chunked LOD performance optimizations (21E-OPT) */}
      {/* 
      <BuildingInstances
        buildings={buildings.filter(b => b.district === 'tech')}
      /> 
      */}

      {/* 4. Drones Cyberpunk */}
      <ThreeErrorBoundary fallback={<ProceduralDrones count={20} />}>
        <Suspense fallback={<ProceduralDrones count={20} />}>
          <TechAIDrones count={20} />
        </Suspense>
      </ThreeErrorBoundary>

      {/* 5. Partículas de Dados */}
      {TECH_AI_DISTRICT.effects.floatingParticles && <DataParticles count={500} color={TECH_AI_DISTRICT.color} />}

      {/* 6. Data Rain Effect */}
      {TECH_AI_DISTRICT.effects.dataRain && <DataRain count={200} color={TECH_AI_DISTRICT.color} />}
    </group>
  )
}

function TechAIDistrictFallback({ buildings }: { buildings: any[] }) {
  return (
    <group position={[TECH_AI_DISTRICT.centerPosition.x, TECH_AI_DISTRICT.centerPosition.y, TECH_AI_DISTRICT.centerPosition.z]}>
      {/* Fallback: texto simples + cubos */}
      {/* Commented out Text3D because it requires a font URL, which we might not have */}
      {/*
      <Text3D
        font="/fonts/Inter_Bold.json"
        text="AI DISTRICT"
        position={[0, 180, 0]}
        size={10}
      >
        <meshBasicMaterial color="#60A5FA" />
      </Text3D>
      */}
      {buildings.slice(0, 100).map((b, i) => (
        <mesh key={i} position={[b.x, (b.height || 10)/2, b.y]}>
          <boxGeometry args={[b.width || 2, b.height || 10, b.depth || 2]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
      ))}
    </group>
  )
}
