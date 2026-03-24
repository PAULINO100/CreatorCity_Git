'use client'
import { SplineWrapper } from '@/components/common/SplineWrapper'
import { useState } from 'react'
import { EDUCATECH_AI_LANDMARK } from '@/lib/districts/educatech-ai-landmark-config'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { ThreeErrorBoundary } from '@/components/common/ThreeErrorBoundary'

export function EducatechAILandmark() {
  const [loaded, setLoaded] = useState(false)

  return (
    <group position={[EDUCATECH_AI_LANDMARK.position.x, EDUCATECH_AI_LANDMARK.position.y, EDUCATECH_AI_LANDMARK.position.z]}>
      {/* 1. Edifício Principal Icônico */}
      <ThreeErrorBoundary 
        fallback={
          <mesh position={[0, 40, 0]}>
            <boxGeometry args={[40, 80, 40]} />
            <meshStandardMaterial color="#3B82F6" wireframe />
          </mesh>
        }
      >
        {!EDUCATECH_AI_LANDMARK.splineAssets.mainBuilding.useProceduralFallback ? (
          <Html transform distanceFactor={15} center position={[0,0,0]}>
            <div style={{ width: 800, height: 800 }}>
              <SplineWrapper
                sceneUrl={EDUCATECH_AI_LANDMARK.splineAssets.mainBuilding.url}
                onLoad={() => setLoaded(true)}
                fallbackColor="transparent"
              />
            </div>
          </Html>
        ) : (
          <mesh position={[0, 40, 0]}>
            <boxGeometry args={[40, 80, 40]} />
            <meshStandardMaterial color="#3B82F6" wireframe emissive="#3B82F6" emissiveIntensity={0.5} />
          </mesh>
        )}
      </ThreeErrorBoundary>

      {/* 2. Portal Holográfico na Entrada */}
      <ThreeErrorBoundary 
        fallback={
          <mesh position={[0, 0, 30]}>
            <torusGeometry args={[15, 0.5, 16, 100]} />
            <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        }
      >
        {!EDUCATECH_AI_LANDMARK.splineAssets.holographicPortal.useProceduralFallback ? (
          <Html transform distanceFactor={15} center position={[0, 0, 30]}>
            <div style={{ width: 400, height: 400 }}>
              <SplineWrapper
                sceneUrl={EDUCATECH_AI_LANDMARK.splineAssets.holographicPortal.url}
                fallbackColor="transparent"
              />
            </div>
          </Html>
        ) : (
          <mesh position={[0, 0, 30]}>
            <torusGeometry args={[15, 0.5, 16, 100]} />
            <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        )}
      </ThreeErrorBoundary>

      {/* 3. Esfera de IA no Topo */}
      <ThreeErrorBoundary 
        fallback={
          <mesh position={[0, 80, 0]}>
            <sphereGeometry args={[8, 32, 32]} />
            <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={3} toneMapped={false} />
          </mesh>
        }
      >
        {!EDUCATECH_AI_LANDMARK.splineAssets.aiSphere.useProceduralFallback ? (
          <Html transform distanceFactor={15} center position={[0, 80, 0]}>
            <div style={{ width: 300, height: 300 }}>
              <SplineWrapper
                sceneUrl={EDUCATECH_AI_LANDMARK.splineAssets.aiSphere.url}
                fallbackColor="transparent"
              />
            </div>
          </Html>
        ) : (
          <mesh position={[0, 80, 0]}>
            <sphereGeometry args={[8, 32, 32]} />
            <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={3} toneMapped={false} />
          </mesh>
        )}
      </ThreeErrorBoundary>

      {/* 4. Jardim Digital */}
      <ThreeErrorBoundary 
        fallback={
          <group position={[0, 0, -20]}>
            {[...Array(5)].map((_, i) => (
              <mesh key={i} position={[(i - 2) * 10, 5, 0]}>
                <cylinderGeometry args={[0.2, 0.5, 10]} />
                <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1} toneMapped={false} />
              </mesh>
            ))}
          </group>
        }
      >
        <Html transform distanceFactor={15} center position={[0, 0, -20]}>
          <div style={{ width: 500, height: 500 }}>
            <SplineWrapper
              sceneUrl={EDUCATECH_AI_LANDMARK.splineAssets.digitalGarden.url}
              fallbackColor="transparent"
            />
          </div>
        </Html>
      </ThreeErrorBoundary>

      {/* 5. Letreiro com Logo */}
      <ThreeErrorBoundary fallback={null}>
        <EducatechAISignage />
      </ThreeErrorBoundary>
    </group>
  )
}

function EducatechAISignage() {
  return (
    <group position={[0, 110, 0]}>
      {/* 1. Texto Principal "EDUCATECH AI" */}
      <Text
        fontSize={8}
        color="#60A5FA"
        anchorX="center"
        anchorY="middle"
      >
        EDUCATECH AI
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#3B82F6"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Text>

      {/* 2. Subtítulo "Creating Digital Infrastructure" */}
      <Text
        fontSize={2.5}
        color="#93C5FD"
        anchorX="center"
        anchorY="middle"
        position={[0, -5, 0]}
      >
        Creating Digital Infrastructure
        <meshStandardMaterial
          color="#93C5FD"
          emissive="#60A5FA"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </Text>

      {/* 3. Logo SVG (opcional - usar emoji se SVG não existir) */}
      <Text
        fontSize={6}
        color="#FCD34D"
        position={[-25, 0, 0]}
        anchorX="right"
      >
        ⚡
      </Text>

      {/* 4. Glow/Bloom effect via sprite */}
      <sprite
        position={[0, 0, 0]}
        scale={[60, 15, 1]}
      >
        <spriteMaterial
          color="#60A5FA"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}
