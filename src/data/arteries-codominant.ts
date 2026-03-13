import type { ArterySegment } from '@/types/anatomy'
import { VESSEL_COLORS } from './colors'
import { RIGHT_DOMINANT_SEGMENTS } from './arteries'

/**
 * Co-dominant variant:
 * - PDA from RCA (smaller)
 * - PLV from LCx
 * - LCx extends further posteriorly
 */

// Extended distal LCx
const distLcxCoDom: ArterySegment = {
  id: 'dist-lcx',
  name: 'Distal LCx',
  shortName: 'dLCx',
  territory: 'LCx',
  parentId: 'prox-lcx',
  controlPoints: [
    [2.8, 1.2, -0.3],
    [2.8, 0.5, -1.0],
    [2.5, -0.2, -1.5],
    [1.5, -0.8, -2.2],
    [0.5, -1.2, -2.5],
  ],
  startRadius: 1.2,
  endRadius: 0.8,
  color: VESSEL_COLORS.LCx,
  dominanceVariants: ['codominant'],
}

// PLV from LCx in co-dominant
const plvCoDom: ArterySegment = {
  id: 'plv',
  name: 'Posterolateral Branch',
  shortName: 'PLV',
  territory: 'LCx',
  parentId: 'dist-lcx',
  controlPoints: [
    [0.5, -1.2, -2.5],
    [0.0, -1.8, -2.2],
    [-0.5, -2.3, -1.8],
    [-0.8, -2.8, -1.2],
  ],
  startRadius: 0.8,
  endRadius: 0.4,
  color: VESSEL_COLORS.PLV,
  dominanceVariants: ['codominant'],
}

export const CODOMINANT_SEGMENTS: ArterySegment[] = RIGHT_DOMINANT_SEGMENTS
  .filter(s => !['dist-lcx', 'plv'].includes(s.id))
  .concat([distLcxCoDom, plvCoDom])
