import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { ArterySegment } from '@/types/anatomy'
import { buildArterySpline, buildTaperedTubeGeometry } from '@/utils/geometry'

interface ArteryTubeProps {
  segment: ArterySegment
  isHovered: boolean
  isSelected: boolean
  onPointerEnter: () => void
  onPointerLeave: () => void
  onClick: () => void
}

export const ArteryTube = ({
  segment,
  isHovered,
  isSelected,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: ArteryTubeProps) => {
  const [localHover, setLocalHover] = useState(false)
  const showHighlight = isHovered || isSelected || localHover

  const { geometry, midpoint } = useMemo(() => {
    const curve = buildArterySpline(segment.controlPoints)
    const geo = buildTaperedTubeGeometry(curve, segment.startRadius, segment.endRadius)
    const mid = curve.getPoint(0.5)
    return { geometry: geo, midpoint: mid }
  }, [segment])

  const color = new THREE.Color(segment.color)
  const emissiveColor = color.clone().multiplyScalar(0.4)

  return (
    <group>
      <mesh
        geometry={geometry}
        onPointerEnter={(e) => {
          e.stopPropagation()
          setLocalHover(true)
          onPointerEnter()
        }}
        onPointerLeave={() => {
          setLocalHover(false)
          onPointerLeave()
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <meshStandardMaterial
          color={showHighlight ? segment.color : color.clone().multiplyScalar(0.85)}
          emissive={emissiveColor}
          emissiveIntensity={showHighlight ? 0.8 : 0.3}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {showHighlight && (
        <Html
          position={[midpoint.x, midpoint.y + 0.15, midpoint.z]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-gray-900/90 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-gray-700">
            {segment.name}
          </div>
        </Html>
      )}
    </group>
  )
}
