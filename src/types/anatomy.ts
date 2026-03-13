import type { DominanceType } from './angles'

export type VesselTerritory = 'LM' | 'LAD' | 'LCx' | 'RCA'

export interface ArterySegment {
  id: string
  name: string
  shortName: string
  territory: VesselTerritory
  parentId: string | null
  controlPoints: [number, number, number][]
  startRadius: number
  endRadius: number
  color: string
  dominanceVariants: DominanceType[]
}
