import type { ArterySegment } from '@/types/anatomy'
import { VESSEL_COLORS } from './colors'
import { RIGHT_DOMINANT_SEGMENTS } from './arteries'

/**
 * Left-dominant variant (~8% population prevalence).
 * - PDA arises from the LCx instead of the RCA (dominance = vessel giving off the PDA)
 * - PLV (posterolateral) arises from the LCx
 * - RCA is shorter and terminates before the crux (does not reach it)
 * - LCx extends further posteriorly, around the crux, into the posterior IV groove
 */

// Override distal RCA to terminate earlier (before crux)
const distRcaLeftDom: ArterySegment = {
  id: 'dist-rca',
  name: 'Distal RCA',
  shortName: 'dRCA',
  territory: 'RCA',
  parentId: 'mid-rca',
  controlPoints: [
    [-2.2, -1.2, -1.0],
    [-1.8, -1.3, -1.3],
    [-1.5, -1.3, -1.5], // Terminates early, doesn't reach crux
  ],
  startRadius: 1.4,
  endRadius: 0.8,
  color: VESSEL_COLORS.RCA,
  dominanceVariants: ['left'],
}

// Extended distal LCx reaching the crux
const distLcxLeftDom: ArterySegment = {
  id: 'dist-lcx',
  name: 'Distal LCx',
  shortName: 'dLCx',
  territory: 'LCx',
  parentId: 'prox-lcx',
  controlPoints: [
    [2.8, 0.6, -0.3],   // Matches prox-LCx terminus (continuity)
    [2.8, 0.5, -1.0],
    [2.5, -0.2, -1.5],
    [1.5, -0.8, -2.2],
    [0.5, -1.2, -2.5],  // Reaches crux
    [-0.5, -1.5, -2.5], // At crux
  ],
  startRadius: 1.2,
  endRadius: 0.9,
  color: VESSEL_COLORS.LCx,
  dominanceVariants: ['left'],
}

// PDA from LCx
const pdaLeftDom: ArterySegment = {
  id: 'pda',
  name: 'Posterior Descending Artery',
  shortName: 'PDA',
  territory: 'LCx',
  parentId: 'dist-lcx',
  controlPoints: [
    [-0.5, -1.5, -2.5],
    [0.0, -2.0, -2.2],
    [0.5, -2.5, -1.8],
    [1.0, -2.8, -1.2],
    [1.5, -3.0, -0.5],
  ],
  startRadius: 1.0,
  endRadius: 0.5,
  color: VESSEL_COLORS.PDA,
  dominanceVariants: ['left'],
}

// PLV from LCx
const plvLeftDom: ArterySegment = {
  id: 'plv',
  name: 'Posterolateral Branch',
  shortName: 'PLV',
  territory: 'LCx',
  parentId: 'dist-lcx',
  controlPoints: [
    [-0.5, -1.5, -2.5],
    [-0.8, -2.0, -2.0],
    [-1.0, -2.5, -1.5],
    [-0.8, -3.0, -1.0],
  ],
  startRadius: 0.8,
  endRadius: 0.4,
  color: VESSEL_COLORS.PLV,
  dominanceVariants: ['left'],
}

export const LEFT_DOMINANT_SEGMENTS: ArterySegment[] = RIGHT_DOMINANT_SEGMENTS
  .filter(s => !['dist-rca', 'dist-lcx', 'pda', 'plv'].includes(s.id))
  .concat([distRcaLeftDom, distLcxLeftDom, pdaLeftDom, plvLeftDom])
