import { useMemo } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { ArterySegment } from '@/types/anatomy'
import {
  extractHeartGeometry,
  buildMeshProjectedArterySpline,
  buildTaperedTubeGeometry,
} from '@/utils/geometry'

interface CoronaryArteries3DProps {
  segments: ArterySegment[]
  hoveredSegmentId: string | null
  selectedSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
}

interface TubeData {
  id: string
  geometry: THREE.TubeGeometry
  color: string
  name: string
}

// Radius scale for 3D overlay — thinner than anatomical for visual clarity
const RADIUS_SCALE = 0.5
// Normal offset lifts arteries just above the heart surface
const NORMAL_OFFSET = 0.03

export function CoronaryArteries3D({
  segments,
  hoveredSegmentId,
  selectedSegmentId,
  onHoverSegment,
  onClickSegment,
}: CoronaryArteries3DProps) {
  // Load heart GLTF (cached by drei — zero cost after first load)
  const { scene } = useGLTF('/models/heart/scene.gltf')

  // Extract baked heart geometry for raycasting (matches <primitive scale={2.2}>)
  const { mesh: heartMesh, center: heartCenter } = useMemo(
    () => extractHeartGeometry(scene, 2.2),
    [scene],
  )

  // Build tube geometries projected onto heart surface
  const tubeData = useMemo(() => {
    const raycaster = new THREE.Raycaster()

    const tubes: TubeData[] = segments.map((seg) => {
      const spline = buildMeshProjectedArterySpline(
        seg.controlPoints,
        raycaster,
        heartMesh,
        heartCenter,
        NORMAL_OFFSET,
      )
      const geometry = buildTaperedTubeGeometry(
        spline,
        seg.startRadius * RADIUS_SCALE,
        seg.endRadius * RADIUS_SCALE,
        48,
        6,
      )
      return { id: seg.id, geometry, color: seg.color, name: seg.name }
    })

    return tubes
  }, [segments, heartMesh, heartCenter])

  return (
    <group>
      {tubeData.map(({ id, geometry, color }) => {
        const isHovered = hoveredSegmentId === id
        const isSelected = selectedSegmentId === id

        return (
          <mesh
            key={id}
            geometry={geometry}
            renderOrder={1}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation()
              onHoverSegment(id)
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation()
              onHoverSegment(null)
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              onClickSegment(id)
            }}
          >
            <meshStandardMaterial
              color={isSelected ? '#ffffff' : isHovered ? '#ffff44' : color}
              emissive={isSelected ? color : isHovered ? color : '#000000'}
              emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.4 : 0}
              roughness={0.5}
              metalness={0.15}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        )
      })}
    </group>
  )
}
