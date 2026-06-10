import type { QualityMatrixEntry, SegmentRating, ViewQualityEntry } from '@/types/quality'
import { VIEW_PRESETS } from './presets'

/**
 * Per-preset coronary view-quality REFERENCE TABLE.
 *
 * Source of truth: Di Mario & Sutaria, "Coronary angiography in the angioplasty
 * era: projections with a meaning", Heart 2005 (PMC1768997), Table 2 — operationalised
 * on a 0–3 scale by Smith et al., Br J Radiol 2012 (PMC3487091). Cross-checked against
 * the JACC Cardiovasc Interv 2020 CT-derived optimal angles and the BJC trainee guide.
 *
 * Ratings: +++ ideal | ++ very useful | + occasionally useful | - not recommended
 *
 * NOTE: The live View-Quality panel no longer reads this table — it computes grades
 * directly from 3D geometry (`utils/view-quality.ts`), so every angle (not just these
 * presets) gets a physically-derived answer. This table is retained as the cited
 * reference and as the validation fixture the geometry engine is checked against.
 */
export const QUALITY_MATRIX: QualityMatrixEntry[] = [
  {
    presetId: 'rao-caudal',
    ratings: {
      // Di Mario: the right caudal view is "the most important view for the distal LAD",
      // in addition to profiling the LM bifurcation and the full proximal/mid LCx.
      'lm': '+++', 'prox-lad': '+++', 'mid-lad': '+', 'dist-lad': '+++',
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

  return Object.entries(entry.ratings).map(([segmentId, rating]) => ({
    segmentId,
    rating,
    foreshortened: RATING_SCORE[rating] <= 0,
    overlaps: entry.overlaps[segmentId] ?? [],
  }))
}

export const RATING_SCORE: Record<SegmentRating, number> = { '+++': 3, '++': 2, '+': 1, '-': 0 }

/** Map a numeric 0–3 score back to an ordinal rating. */
export function scoreToRating(score: number): SegmentRating {
  if (score >= 2.5) return '+++'
  if (score >= 1.5) return '++'
  if (score >= 0.5) return '+'
  return '-'
}

/** All segment ids that appear anywhere in the reference matrix. */
const ALL_SEGMENT_IDS: string[] = [
  ...new Set(QUALITY_MATRIX.flatMap(e => Object.keys(e.ratings))),
]

/**
 * Smoothly interpolate the curated Di Mario reference ratings across the named
 * presets using inverse-distance weighting in (RAO/LAO, CRAN/CAUD) angle space.
 *
 * At a preset's exact angles this returns that preset's textbook ratings; between
 * presets it blends smoothly — replacing the old hard "snap to nearest preset"
 * behaviour while staying anchored to the published per-view quality data.
 *
 * Returns a per-segment numeric score in [0, 3].
 */
export function interpolateSegmentScores(
  raoLao: number,
  cranialCaudal: number,
): Map<string, number> {
  const weighted = QUALITY_MATRIX.flatMap(entry => {
    const preset = VIEW_PRESETS.find(p => p.id === entry.presetId)
    if (!preset) return []
    const d2 =
      (preset.raoLao - raoLao) ** 2 + (preset.cranialCaudal - cranialCaudal) ** 2
    // ε = 1 deg² so that at a preset (d2≈0) its own weight dominates → exact rating.
    return [{ entry, w: 1 / (d2 + 1) }]
  })
  const totalW = weighted.reduce((s, x) => s + x.w, 0)

  const scores = new Map<string, number>()
  for (const segId of ALL_SEGMENT_IDS) {
    let acc = 0
    for (const { entry, w } of weighted) {
      acc += w * RATING_SCORE[entry.ratings[segId] ?? '-']
    }
    scores.set(segId, acc / totalW)
  }
  return scores
}

/**
 * Interpolated textbook quality score (0–3) for a SINGLE segment at the given
 * angles. Cheaper than the full map — used by the optimal-view heat-map, which
 * sweeps thousands of angles. Shares the same inverse-distance interpolation, so
 * its peak lands on the published best view for that segment.
 */
export function interpolateSegmentScore(
  segmentId: string,
  raoLao: number,
  cranialCaudal: number,
): number {
  let acc = 0
  let totalW = 0
  for (const entry of QUALITY_MATRIX) {
    const preset = VIEW_PRESETS.find(p => p.id === entry.presetId)
    if (!preset) continue
    const d2 =
      (preset.raoLao - raoLao) ** 2 + (preset.cranialCaudal - cranialCaudal) ** 2
    const w = 1 / (d2 + 1)
    acc += w * RATING_SCORE[entry.ratings[segmentId] ?? '-']
    totalW += w
  }
  return totalW > 0 ? acc / totalW : 0
}
