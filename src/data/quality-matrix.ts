import type { QualityMatrixEntry, SegmentRating, ViewQualityEntry } from '@/types/quality'
import { VIEW_PRESETS } from './presets'

/**
 * View quality matrix based on published clinical data:
 * - PMC/Heart Table 2 (PMC1768997)
 * - British Journal of Cardiology optimal views guide
 * - Thoracic Key angiographic views reference
 * - JACC Cardiovascular Interventions optimal projections
 *
 * Ratings: +++ ideal | ++ very useful | + occasionally useful | - not recommended
 */
export const QUALITY_MATRIX: QualityMatrixEntry[] = [
  {
    presetId: 'rao-caudal',
    ratings: {
      'lm': '+++', 'prox-lad': '+++', 'mid-lad': '+', 'dist-lad': '+',
      'd1': '++', 'd2': '+', 'sep1': '+',
      'prox-lcx': '+++', 'dist-lcx': '++', 'om1': '++', 'om2': '+',
      'prox-rca': '+', 'mid-rca': '-', 'dist-rca': '-', 'pda': '-', 'plv': '-', 'am': '-',
    },
    overlaps: {
      'mid-lad': ['d1'],
      'dist-lad': ['d2'],
    },
  },
  {
    presetId: 'spider',
    ratings: {
      'lm': '+++', 'prox-lad': '++', 'mid-lad': '-', 'dist-lad': '+',
      'd1': '++', 'd2': '+', 'sep1': '+',
      'prox-lcx': '+', 'dist-lcx': '+', 'om1': '++', 'om2': '+',
      'prox-rca': '-', 'mid-rca': '-', 'dist-rca': '-', 'pda': '-', 'plv': '-', 'am': '-',
    },
    overlaps: {
      'prox-lad': ['prox-lcx'],
    },
  },
  {
    presetId: 'ap-cranial',
    ratings: {
      'lm': '+++', 'prox-lad': '++', 'mid-lad': '+++', 'dist-lad': '+',
      'd1': '++', 'd2': '++', 'sep1': '+++',
      'prox-lcx': '-', 'dist-lcx': '+++', 'om1': '-', 'om2': '-',
      'prox-rca': '+', 'mid-rca': '-', 'dist-rca': '+++', 'pda': '+++', 'plv': '+++', 'am': '-',
    },
    overlaps: {
      'lm': ['prox-lad'],
    },
  },
  {
    presetId: 'lao-cranial',
    ratings: {
      'lm': '+++', 'prox-lad': '++', 'mid-lad': '++', 'dist-lad': '-',
      'd1': '+++', 'd2': '++', 'sep1': '++',
      'prox-lcx': '-', 'dist-lcx': '++', 'om1': '-', 'om2': '-',
      'prox-rca': '+++', 'mid-rca': '+', 'dist-rca': '+++', 'pda': '++', 'plv': '++', 'am': '-',
    },
    overlaps: {
      'om1': ['dist-lcx'],
    },
  },
  {
    presetId: 'rao-cranial',
    ratings: {
      'lm': '+++', 'prox-lad': '++', 'mid-lad': '++', 'dist-lad': '++',
      'd1': '++', 'd2': '++', 'sep1': '++',
      'prox-lcx': '+', 'dist-lcx': '+', 'om1': '+', 'om2': '+',
      'prox-rca': '-', 'mid-rca': '-', 'dist-rca': '+', 'pda': '+', 'plv': '+', 'am': '-',
    },
    overlaps: {
      'd1': ['d2'],
    },
  },
  {
    presetId: 'lao-straight',
    ratings: {
      'lm': '-', 'prox-lad': '-', 'mid-lad': '-', 'dist-lad': '-',
      'd1': '-', 'd2': '-', 'sep1': '-',
      'prox-lcx': '-', 'dist-lcx': '++', 'om1': '+', 'om2': '+',
      'prox-rca': '++', 'mid-rca': '++', 'dist-rca': '++', 'pda': '+', 'plv': '+', 'am': '+',
    },
    overlaps: {
      'pda': ['plv'],
    },
  },
  {
    presetId: 'lao-cranial-rca',
    ratings: {
      'lm': '-', 'prox-lad': '-', 'mid-lad': '-', 'dist-lad': '-',
      'd1': '-', 'd2': '-', 'sep1': '-',
      'prox-lcx': '-', 'dist-lcx': '+', 'om1': '-', 'om2': '-',
      'prox-rca': '+++', 'mid-rca': '+', 'dist-rca': '+++', 'pda': '++', 'plv': '++', 'am': '+',
    },
    overlaps: {},
  },
  {
    presetId: 'rao-straight',
    ratings: {
      'lm': '-', 'prox-lad': '-', 'mid-lad': '-', 'dist-lad': '-',
      'd1': '-', 'd2': '-', 'sep1': '-',
      'prox-lcx': '-', 'dist-lcx': '-', 'om1': '-', 'om2': '-',
      'prox-rca': '-', 'mid-rca': '+++', 'dist-rca': '+', 'pda': '++', 'plv': '-', 'am': '++',
    },
    overlaps: {},
  },
  {
    presetId: 'ap-cranial-rca',
    ratings: {
      'lm': '-', 'prox-lad': '-', 'mid-lad': '-', 'dist-lad': '-',
      'd1': '-', 'd2': '-', 'sep1': '-',
      'prox-lcx': '-', 'dist-lcx': '-', 'om1': '-', 'om2': '-',
      'prox-rca': '+', 'mid-rca': '-', 'dist-rca': '+++', 'pda': '+++', 'plv': '+++', 'am': '-',
    },
    overlaps: {},
  },
  {
    presetId: 'ap-straight',
    ratings: {
      'lm': '+', 'prox-lad': '+', 'mid-lad': '+', 'dist-lad': '+',
      'd1': '+', 'd2': '+', 'sep1': '+',
      'prox-lcx': '+', 'dist-lcx': '+', 'om1': '+', 'om2': '+',
      'prox-rca': '+', 'mid-rca': '+', 'dist-rca': '+', 'pda': '+', 'plv': '+', 'am': '+',
    },
    overlaps: {
      'lm': ['prox-lad', 'prox-lcx'],
    },
  },
]

/**
 * Find the quality data for arbitrary angles by finding the nearest preset.
 */
export function getQualityForAngles(
  raoLao: number,
  cranialCaudal: number,
): QualityMatrixEntry | null {
  let bestDist = Infinity
  let bestEntry: QualityMatrixEntry | null = null

  for (const entry of QUALITY_MATRIX) {
    const preset = VIEW_PRESETS.find(p => p.id === entry.presetId)
    if (!preset) continue
    const dist = Math.sqrt(
      Math.pow(preset.raoLao - raoLao, 2) +
      Math.pow(preset.cranialCaudal - cranialCaudal, 2)
    )
    if (dist < bestDist) {
      bestDist = dist
      bestEntry = entry
    }
  }

  return bestEntry
}

/**
 * Convert a quality matrix entry to individual ViewQualityEntry objects.
 */
export function getSegmentQualities(
  raoLao: number,
  cranialCaudal: number,
): ViewQualityEntry[] {
  const entry = getQualityForAngles(raoLao, cranialCaudal)
  if (!entry) return []

  const ratingOrder: Record<SegmentRating, number> = { '+++': 3, '++': 2, '+': 1, '-': 0 }

  return Object.entries(entry.ratings).map(([segmentId, rating]) => ({
    segmentId,
    rating,
    foreshortened: ratingOrder[rating] <= 0,
    overlaps: entry.overlaps[segmentId] ?? [],
  }))
}
