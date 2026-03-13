import { useMemo } from 'react'
import type { ArterySegment } from '@/types/anatomy'
import type { SegmentRating } from '@/types/quality'
import { getSegmentQualities } from '@/data/quality-matrix'

interface QualityPanelProps {
  raoLao: number
  cranialCaudal: number
  segments: ArterySegment[]
  hoveredSegmentId: string | null
  onHoverSegment: (id: string | null) => void
}

const ratingColors: Record<SegmentRating, string> = {
  '+++': 'text-emerald-400',
  '++': 'text-yellow-400',
  '+': 'text-orange-400',
  '-': 'text-red-400/60',
}

const ratingBg: Record<SegmentRating, string> = {
  '+++': 'bg-emerald-500/10',
  '++': 'bg-yellow-500/10',
  '+': 'bg-orange-500/10',
  '-': 'bg-red-500/5',
}

export function QualityPanel({
  raoLao,
  cranialCaudal,
  segments,
  hoveredSegmentId,
  onHoverSegment,
}: QualityPanelProps) {
  const qualities = useMemo(
    () => getSegmentQualities(raoLao, cranialCaudal),
    [raoLao, cranialCaudal],
  )

  const qualityMap = useMemo(() => {
    const map = new Map<string, { rating: SegmentRating; overlaps: string[] }>()
    for (const q of qualities) {
      map.set(q.segmentId, { rating: q.rating, overlaps: q.overlaps })
    }
    return map
  }, [qualities])

  // Group segments by territory
  const ladSegments = segments.filter(s => s.territory === 'LAD' || s.territory === 'LM')
  const lcxSegments = segments.filter(s => s.territory === 'LCx')
  const rcaSegments = segments.filter(s => s.territory === 'RCA')

  return (
    <div className="flex gap-4 text-[10px] justify-center flex-wrap">
      <QualityGroup
        label="LM / LAD"
        segments={ladSegments}
        qualityMap={qualityMap}
        hoveredSegmentId={hoveredSegmentId}
        onHoverSegment={onHoverSegment}
      />
      <QualityGroup
        label="LCx"
        segments={lcxSegments}
        qualityMap={qualityMap}
        hoveredSegmentId={hoveredSegmentId}
        onHoverSegment={onHoverSegment}
      />
      <QualityGroup
        label="RCA"
        segments={rcaSegments}
        qualityMap={qualityMap}
        hoveredSegmentId={hoveredSegmentId}
        onHoverSegment={onHoverSegment}
      />
    </div>
  )
}

function QualityGroup({
  label,
  segments,
  qualityMap,
  hoveredSegmentId,
  onHoverSegment,
}: {
  label: string
  segments: ArterySegment[]
  qualityMap: Map<string, { rating: SegmentRating; overlaps: string[] }>
  hoveredSegmentId: string | null
  onHoverSegment: (id: string | null) => void
}) {
  return (
    <div>
      <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="flex flex-wrap gap-0.5">
        {segments.map(s => {
          const q = qualityMap.get(s.id)
          const rating = q?.rating ?? '-'
          const isHovered = hoveredSegmentId === s.id
          return (
            <div
              key={s.id}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${ratingBg[rating]} ${
                isHovered ? 'ring-1 ring-white/30' : ''
              }`}
              onMouseEnter={() => onHoverSegment(s.id)}
              onMouseLeave={() => onHoverSegment(null)}
              title={`${s.name}: ${rating}${q?.overlaps.length ? ` (overlaps: ${q.overlaps.join(', ')})` : ''}`}
            >
              <span className="text-gray-400">{s.shortName}</span>
              <span className={`ml-1 font-mono font-bold ${ratingColors[rating]}`}>
                {rating}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
