import type { ArterySegment } from '@/types/anatomy'
import { ArteryTube } from './ArteryTube'

interface ArterySystemProps {
  segments: ArterySegment[]
  hoveredSegmentId: string | null
  selectedSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
}

export function ArterySystem({
  segments,
  hoveredSegmentId,
  selectedSegmentId,
  onHoverSegment,
  onClickSegment,
}: ArterySystemProps) {
  return (
    <group>
      {segments.map(segment => (
        <ArteryTube
          key={segment.id}
          segment={segment}
          isHovered={hoveredSegmentId === segment.id}
          isSelected={selectedSegmentId === segment.id}
          onPointerEnter={() => onHoverSegment(segment.id)}
          onPointerLeave={() => onHoverSegment(null)}
          onClick={() => onClickSegment(segment.id)}
        />
      ))}
    </group>
  )
}
