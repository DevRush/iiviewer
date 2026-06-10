export type SegmentRating = '+++' | '++' | '+' | '-'

export interface ViewQualityEntry {
  segmentId: string
  rating: SegmentRating
  foreshortened: boolean
  overlaps: string[]
  /** Geometry-derived foreshortening, 0 (fully elongated) … 1 (end-on). Optional. */
  foreshortenPct?: number
  /** Geometry-derived overlap fraction, 0 (clear) … 1 (fully obscured). Optional. */
  overlapPct?: number
  /** True when the grade was computed live from 3D geometry rather than a static table. */
  computed?: boolean
}

export interface QualityMatrixEntry {
  presetId: string
  ratings: Record<string, SegmentRating>
  overlaps: Record<string, string[]>
}
