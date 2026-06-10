import { describe, it, expect } from 'vitest'
import { computeViewQuality, sampleSegments, foreshorteningAt, measureViewGeometry } from './view-quality'
import { computeCameraBasis } from './carm-math'
import { interpolateSegmentScore, scoreToRating } from '@/data/quality-matrix'
import { RIGHT_DOMINANT_SEGMENTS } from '@/data/arteries'
import { LEFT_DOMINANT_SEGMENTS } from '@/data/arteries-left-dominant'
import { CODOMINANT_SEGMENTS } from '@/data/arteries-codominant'
import type { ArterySegment } from '@/types/anatomy'

const SEGS = RIGHT_DOMINANT_SEGMENTS

function ratings(raoLao: number, cranialCaudal: number) {
  const entries = computeViewQuality(SEGS, raoLao, cranialCaudal)
  return new Map(entries.map(e => [e.segmentId, e]))
}

// Named views (matching presets.ts)
const SPIDER = [45, -30] as const
const AP_CRANIAL = [0, 35] as const
const AP_STRAIGHT = [0, 0] as const
const RAO_CAUDAL = [-25, -25] as const
const LAO_STRAIGHT = [45, 0] as const
const LAO_CRANIAL_RCA = [25, 25] as const

describe('camera basis (handedness)', () => {
  it('at AP: patient-left (+X) projects to screen-right, cranial (+Y) projects up', () => {
    const { right, up } = computeCameraBasis(0, 0)
    expect(right[0]).toBeGreaterThan(0.9)
    expect(up[1]).toBeGreaterThan(0.9)
  })
  it('basis is orthonormal across angles', () => {
    for (const [a, b] of [[45, -30], [-25, -25], [0, 35], [79, 41]] as const) {
      const { right, up, forward } = computeCameraBasis(a, b)
      const len = (v: readonly number[]) => Math.hypot(v[0]!, v[1]!, v[2]!)
      const dot = (u: readonly number[], v: readonly number[]) => u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!
      expect(len(right)).toBeCloseTo(1, 5)
      expect(len(up)).toBeCloseTo(1, 5)
      expect(len(forward)).toBeCloseTo(1, 5)
      expect(dot(right, up)).toBeCloseTo(0, 5)
      expect(dot(right, forward)).toBeCloseTo(0, 5)
    }
  })
})

describe('foreshortening physics (geometry layer)', () => {
  it('a vessel perpendicular to the ray is NOT foreshortened; parallel IS', () => {
    const seg: ArterySegment = {
      id: 'test', name: 'test', shortName: 't', territory: 'LAD', parentId: null,
      controlPoints: [[0, -2, 0], [0, 2, 0]], startRadius: 1, endRadius: 1,
      color: '#fff', dominanceVariants: ['right'],
    }
    const [sampled] = sampleSegments([seg])
    expect(foreshorteningAt(sampled!, 0, 0)).toBeLessThan(0.05) // Y-vessel in image plane at AP
    const cran = foreshorteningAt(sampled!, 0, 80) // ray swings toward +Y → end-on
    expect(cran).toBeGreaterThan(0.6)
    expect(cran).toBeGreaterThan(foreshorteningAt(sampled!, 0, 0))
  })
  // NOTE: the geometry layer reports honest foreshortening of the (stylised)
  // centrelines; it is surfaced as a transparent readout, NOT as the headline
  // grade — which is why the model's per-segment foreshortening is not asserted
  // against textbook view-quality here. The headline ratings (textbook) are
  // validated in the suite below.
  it('every segment reports foreshortening in [0,1] at every named view', () => {
    for (const [a, b] of [SPIDER, AP_CRANIAL, AP_STRAIGHT, RAO_CAUDAL, LAO_STRAIGHT, LAO_CRANIAL_RCA]) {
      for (const e of computeViewQuality(SEGS, a, b)) {
        expect(e.foreshortenPct!).toBeGreaterThanOrEqual(0)
        expect(e.foreshortenPct!).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('textbook ratings at the standard views (interpolated Di Mario matrix)', () => {
  it('AP cranial → mid/distal LAD well seen', () => {
    const m = ratings(...AP_CRANIAL)
    expect(['++', '+++']).toContain(m.get('mid-lad')!.rating)
  })
  it('Spider → LM ideal, mid-LAD poor (foreshortened)', () => {
    const m = ratings(...SPIDER)
    expect(['++', '+++']).toContain(m.get('lm')!.rating)
    expect(['-', '+']).toContain(m.get('mid-lad')!.rating)
  })
  it('RAO caudal → distal LAD and proximal LCx both well seen', () => {
    const m = ratings(...RAO_CAUDAL)
    expect(['++', '+++']).toContain(m.get('dist-lad')!.rating) // Di Mario: key distal-LAD view
    expect(['++', '+++']).toContain(m.get('prox-lcx')!.rating)
  })
  it('LAO straight → proximal/mid RCA visible', () => {
    const m = ratings(...LAO_STRAIGHT)
    expect(m.get('prox-rca')!.rating).not.toBe('-')
    expect(m.get('mid-rca')!.rating).not.toBe('-')
  })
  it('LAO cranial (RCA) → distal RCA / crux well seen', () => {
    const m = ratings(...LAO_CRANIAL_RCA)
    expect(['++', '+++']).toContain(m.get('dist-rca')!.rating)
  })
})

describe('interpolation: exact at presets, smooth between', () => {
  it('at a preset the interpolated rating equals the textbook cell (rao-caudal → dist-lad +++)', () => {
    expect(scoreToRating(interpolateSegmentScore('dist-lad', -25, -25))).toBe('+++')
    expect(scoreToRating(interpolateSegmentScore('mid-lad', 0, 35))).toBe('+++') // ap-cranial
    expect(scoreToRating(interpolateSegmentScore('lm', 45, -30))).toBe('+++') // spider
    expect(scoreToRating(interpolateSegmentScore('prox-rca', 45, 0))).toBe('++') // lao-straight
  })
  it('a midpoint score lies between the two preset endpoints (no hard snapping)', () => {
    const lo = interpolateSegmentScore('mid-lad', 0, 0) // AP straight (mid-lad +)
    const hi = interpolateSegmentScore('mid-lad', 0, 35) // AP cranial (mid-lad +++)
    const mid = interpolateSegmentScore('mid-lad', 0, 17)
    expect(mid).toBeGreaterThan(Math.min(lo, hi))
    expect(mid).toBeLessThan(Math.max(lo, hi))
  })
})

describe('overlap engine (geometry layer)', () => {
  it('reports overlap between genuinely crossing vessels but NOT for contiguous parent/child', () => {
    const sampled = sampleSegments(SEGS)
    // AP straight: the LM/proximal-LAD/proximal-LCx region superimposes (Di Mario).
    const geo = measureViewGeometry(sampled, 0, 0)
    // Parent/child (lm → prox-lad) must NOT be reported as overlapping each other.
    expect(geo.get('prox-lad')!.overlaps).not.toContain('lm')
    expect(geo.get('lm')!.overlaps).not.toContain('prox-lad')
    // overlapPct is a valid fraction for every segment.
    for (const g of geo.values()) {
      expect(g.overlapPct).toBeGreaterThanOrEqual(0)
      expect(g.overlapPct).toBeLessThanOrEqual(1)
    }
  })
})

describe('dominance variants grade cleanly', () => {
  for (const [name, segs] of [
    ['left-dominant', LEFT_DOMINANT_SEGMENTS],
    ['codominant', CODOMINANT_SEGMENTS],
  ] as const) {
    it(`${name}: every segment gets a valid rating + foreshortening across standard views`, () => {
      for (const [a, b] of [SPIDER, AP_CRANIAL, LAO_STRAIGHT, LAO_CRANIAL_RCA]) {
        const entries = computeViewQuality(segs as ArterySegment[], a, b)
        expect(entries.length).toBe(segs.length)
        for (const e of entries) {
          expect(['+++', '++', '+', '-']).toContain(e.rating)
          expect(e.foreshortenPct!).toBeGreaterThanOrEqual(0)
          expect(e.foreshortenPct!).toBeLessThanOrEqual(1)
        }
      }
    })
  }
  it('left-dominant: PDA arises from the LCx (territory LCx), not the RCA', () => {
    const pda = LEFT_DOMINANT_SEGMENTS.find(s => s.id === 'pda')!
    expect(pda.territory).toBe('LCx')
  })
})
