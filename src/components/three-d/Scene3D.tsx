import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneLighting } from './SceneLighting'
import { HeartGLTF } from './HeartGLTF'
import { CoronaryArteries3D } from './CoronaryArteries3D'
import { anglesToPosition } from '@/utils/carm-math'
import type { ArterySegment } from '@/types/anatomy'

interface Scene3DProps {
  segments: ArterySegment[]
  hoveredSegmentId: string | null
  selectedSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
  raoLao: number
  cranialCaudal: number
}

function AngleDrivenCamera({
  raoLao,
  cranialCaudal,
}: {
  raoLao: number
  cranialCaudal: number
}) {
  const targetPos = useRef(new THREE.Vector3(0, 0, 6))

  useFrame(({ camera }) => {
    const newPos = anglesToPosition(raoLao, cranialCaudal, 6)
    targetPos.current.lerp(newPos, 0.12)
    camera.position.copy(targetPos.current)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  })

  return null
}

export function Scene3D({
  segments,
  hoveredSegmentId,
  selectedSegmentId,
  onHoverSegment,
  onClickSegment,
  raoLao,
  cranialCaudal,
}: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#0a0a12']} />
      <SceneLighting />
      <AngleDrivenCamera raoLao={raoLao} cranialCaudal={cranialCaudal} />
      <Suspense fallback={null}>
        <HeartGLTF
          style="clay"
          hoveredSegmentId={hoveredSegmentId}
          selectedSegmentId={selectedSegmentId}
          onHoverSegment={onHoverSegment}
          onClickSegment={onClickSegment}
        />
        <CoronaryArteries3D
          segments={segments}
          hoveredSegmentId={hoveredSegmentId}
          selectedSegmentId={selectedSegmentId}
          onHoverSegment={onHoverSegment}
          onClickSegment={onClickSegment}
        />
      </Suspense>
    </Canvas>
  )
}
