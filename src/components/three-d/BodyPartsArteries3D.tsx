import { useMemo } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { ArterySegment } from '@/types/anatomy'

interface BodyPartsArteries3DProps {
  segments: ArterySegment[]
  hoveredSegmentId: string | null
  selectedSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
  alignScale: [number, number, number]
  alignPosition: [number, number, number]
  alignRotation: [number, number, number]
}

interface ArteryMeshData {
  id: string
  geometry: THREE.BufferGeometry
  color: string
}

export function BodyPartsArteries3D({
  segments,
  hoveredSegmentId,
  selectedSegmentId,
  onHoverSegment,
  onClickSegment,
  alignScale,
  alignPosition,
  alignRotation,
}: BodyPartsArteries3DProps) {
  const { scene } = useGLTF('/models/heart_anatomy.glb')

  // Build a color lookup from segments prop
  const colorMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const seg of segments) {
      map.set(seg.id, seg.color)
    }
    return map
  }, [segments])

  // Extract artery meshes from the GLB
  const arteryMeshes = useMemo(() => {
    const meshes: ArteryMeshData[] = []
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const name = child.name || ''
      if (!name.startsWith('artery__')) return

      // Parse segment ID from name: "artery__{segId}__{label}"
      const parts = name.split('__')
      if (parts.length < 2) return
      const segId = parts[1]!
      const color = colorMap.get(segId)
      if (!color) return

      // Clone geometry and compute normals for proper lighting
      const geo = child.geometry.clone()
      geo.computeVertexNormals()

      meshes.push({ id: segId, geometry: geo, color: color })
    })
    return meshes
  }, [scene, colorMap])

  return (
    <group scale={alignScale} position={alignPosition} rotation={alignRotation.map(d => d * Math.PI / 180) as unknown as [number, number, number]}>
      {arteryMeshes.map(({ id, geometry, color }) => {
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
              side={THREE.DoubleSide}
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

useGLTF.preload('/models/heart_anatomy.glb')
