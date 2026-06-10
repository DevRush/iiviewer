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
}

export interface QualityMatrixEntry {
  presetId: string
  ratings: Record<string, SegmentRating>
  overlaps: Record<string, string[]>
}
