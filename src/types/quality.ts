export type SegmentRating = '+++' | '++' | '+' | '-'

export interface ViewQualityEntry {
  segmentId: string
  rating: SegmentRating
  foreshortened: boolean
  overlaps: string[]
}

export interface QualityMatrixEntry {
  presetId: string
  ratings: Record<string, SegmentRating>
  overlaps: Record<string, string[]>
}
