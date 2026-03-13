import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { ArterySegment } from '@/types/anatomy'
import type { ViewMode } from '@/types/angles'
import { buildArterySpline, buildTaperedTubeGeometry } from '@/utils/geometry'

interface ProjectedArteriesProps {
  segments: ArterySegment[]
  viewMode: ViewMode
  hoveredSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
  showLabels?: boolean
}

function ProjectedArtery({
  segment,
  viewMode,
  isHovered,
  showLabels,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: {
  segment: ArterySegment
  viewMode: ViewMode
  isHovered: boolean
  showLabels?: boolean
  onPointerEnter: () => void
  onPointerLeave: () => void
  onClick: () => void
}) {
  const { geometry, midpoint } = useMemo(() => {
    const curve = buildArterySpline(segment.controlPoints)
    const geo = buildTaperedTubeGeometry(
      curve,
      segment.startRadius * 1.2,
      segment.endRadius * 1.2,
    )
    const mid = curve.getPoint(0.5)
    return { geometry: geo, midpoint: mid }
  }, [segment])

  const isFluoro = viewMode === 'fluoroscopy'

  return (
    <group>
      <mesh
        geometry={geometry}
        onPointerEnter={(e) => { e.stopPropagation(); onPointerEnter() }}
        onPointerLeave={onPointerLeave}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        {isFluoro ? (
          <meshBasicMaterial
            color={isHovered ? '#ffffff' : '#cccccc'}
            transparent
            opacity={isHovered ? 0.95 : 0.7}
            depthTest={false}
            depthWrite={false}
          />
        ) : (
          <meshBasicMaterial
            color={isHovered ? segment.color : new THREE.Color(segment.color).multiplyScalar(0.9)}
            depthTest={false}
            depthWrite={false}
          />
        )}
      </mesh>

      {((viewMode === 'schematic') || isHovered || showLabels) && (
        <Html
          position={[midpoint.x, midpoint.y + 0.12, midpoint.z]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap font-medium ${
              isFluoro
                ? 'bg-black/80 text-white border border-gray-700'
                : 'text-gray-800 bg-white/90 border border-gray-300 shadow-sm'
            }`}
          >
            {segment.shortName}
          </div>
        </Html>
      )}
    </group>
  )
}

export function ProjectedArteries({
  segments,
  viewMode,
  hoveredSegmentId,
  onHoverSegment,
  onClickSegment,
  showLabels,
}: ProjectedArteriesProps) {
  return (
    <group>
      {segments.map(segment => (
        <ProjectedArtery
          key={segment.id}
          segment={segment}
          viewMode={viewMode}
          isHovered={hoveredSegmentId === segment.id}
          showLabels={showLabels}
          onPointerEnter={() => onHoverSegment(segment.id)}
          onPointerLeave={() => onHoverSegment(null)}
          onClick={() => onClickSegment(segment.id)}
        />
      ))}
    </group>
  )
}
