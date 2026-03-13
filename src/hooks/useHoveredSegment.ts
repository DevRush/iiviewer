import { useState } from 'react'

export function useHoveredSegment() {
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)

  return { hoveredSegmentId, setHoveredSegmentId, selectedSegmentId, setSelectedSegmentId }
}
