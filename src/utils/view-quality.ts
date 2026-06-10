import * as THREE from 'three'
import type { ArterySegment } from '@/types/anatomy'
import type { ViewQualityEntry } from '@/types/quality'
import { buildArterySpline, ANATOMY_SCALE } from '@/utils/geometry'
import { computeCameraBasis } from '@/utils/carm-math'
import { interpolateSegmentScores, scoreToRating } from '@/data/quality-matrix'

/**
 * Geometry layer of the view-quality system.
 *
 * Computes the PHYSICAL foreshortening and overlap of each coronary segment at
 * an arbitrary (RAO/LAO, CRAN/CAUD) angle, straight from the 3D centrelines.
 *
 * Physics (verified against the literature):
 *   • A vessel of true length L projects to L·sin θ, where θ is the angle between
 *     the segment's 3D direction and the central X-ray ray. Foreshortening
 *     fraction = 1 − sin θ = 1 − (projected length / true length): 0 when the
 *     vessel lies in the image plane (perpendicular to the ray, fully elongated),
 *     → 1 when it runs along the ray. [PMC10507606; IEEE 276141; Green PMID 15744720]
 *   • The optimal view minimises foreshortening AND neighbour overlap.
 *     [Chen & Carroll, PubMed 10909927]
 *
 * The HEADLINE rating shown to the user comes from the curated Di Mario & Sutaria
 * reference matrix (smoothly interpolated across presets — see quality-matrix.ts),
 * because the centrelines here are stylised and a pure-physics grade would diverge
 * from the published standard views. The geometry numbers below are surfaced as a
 * transparent physical readout (and drive the optimal-view heat-map), layered on
 * top of — not overriding — the textbook grade.
 *
 * The image-plane basis (right, up, forward) comes from `computeCameraBasis`, the
 * same source of truth the 2D fluoro renderer uses.
 */

const SAMPLES_PER_SEGMENT = 28
const FORESHORTENED_FLAG = 0.5
// A point is "overlapped" when its projected distance to another vessel's
// centreline is within (rA + rB) · OVERLAP_RADIUS_FACTOR (scene units).
const OVERLAP_RADIUS_FACTOR = 3.0

export interface SampledSegment {
  id: string
  parentId: string | null
  radiusScene: number
  /** Sampled centreline points (scene units). */
  pts3d: THREE.Vector3[]
}

export interface SegmentGeometry {
  /** Foreshortening fraction, 0 (fully elongated) … 1 (end-on). */
  foreshorten: number
  /** Fraction of the segment's interior buried under a non-contiguous neighbour. */
  overlapPct: number
  /** Ids of the segments this one overlaps in this projection. */
  overlaps: string[]
}

/** Radius of a segment in scene units (matches buildTaperedTubeGeometry: mm·SCALE·0.1). */
function radiusScene(seg: ArterySegment): number {
  return ((seg.startRadius + seg.endRadius) / 2) * ANATOMY_SCALE * 0.1
}

function dot3(a: readonly [number, number, number], x: number, y: number, z: number): number {
  return a[0] * x + a[1] * y + a[2] * z
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Sample each segment's centreline once (expensive part — reuse across many angles). */
export function sampleSegments(segments: ArterySegment[]): SampledSegment[] {
  return segments.map(seg => {
    const curve = buildArterySpline(seg.controlPoints)
    const pts3d: THREE.Vector3[] = []
    for (let i = 0; i <= SAMPLES_PER_SEGMENT; i++) {
      pts3d.push(curve.getPoint(i / SAMPLES_PER_SEGMENT))
    }
    return { id: seg.id, parentId: seg.parentId, radiusScene: radiusScene(seg), pts3d }
  })
}

/** Foreshortening of one sampled segment at the given angles (cheap; no overlap). */
export function foreshorteningAt(sampled: SampledSegment, raoLao: number, cranialCaudal: number): number {
  const { forward } = computeCameraBasis(raoLao, cranialCaudal)
  const pts = sampled.pts3d
  let trueLen = 0
  let projLen = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
    const segLenSq = dx * dx + dy * dy + dz * dz
    trueLen += Math.sqrt(segLenSq)
    const along = dot3(forward, dx, dy, dz)
    projLen += Math.sqrt(Math.max(0, segLenSq - along * along))
  }
  return trueLen > 1e-9 ? Math.max(0, Math.min(1, 1 - projLen / trueLen)) : 1
}

/** Per-segment foreshortening + overlap at the given angles. */
export function measureViewGeometry(
  sampled: SampledSegment[],
  raoLao: number,
  cranialCaudal: number,
): Map<string, SegmentGeometry> {
  const { right, up, forward } = computeCameraBasis(raoLao, cranialCaudal)

  // Project all + accumulate foreshortening.
  const proj = sampled.map(s => {
    // Screen-space coords (Y negated so it grows downward, matching the fluoro
    // renderer). The distance-based overlap below is invariant to this reflection,
    // but keeping the convention consistent avoids confusion.
    const pts2d = s.pts3d.map(p => ({ x: dot3(right, p.x, p.y, p.z), y: -dot3(up, p.x, p.y, p.z) }))
    let trueLen = 0, projLen = 0
    for (let i = 0; i < s.pts3d.length - 1; i++) {
      const a = s.pts3d[i]!, b = s.pts3d[i + 1]!
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z
      const segLenSq = dx * dx + dy * dy + dz * dz
      trueLen += Math.sqrt(segLenSq)
      const along = dot3(forward, dx, dy, dz)
      projLen += Math.sqrt(Math.max(0, segLenSq - along * along))
    }
    const foreshorten = trueLen > 1e-9 ? Math.max(0, Math.min(1, 1 - projLen / trueLen)) : 1
    return { id: s.id, parentId: s.parentId, radiusScene: s.radiusScene, pts2d, foreshorten }
  })

  const result = new Map<string, SegmentGeometry>()
  for (const target of proj) {
    const interior = target.pts2d.slice(1, -1) // skip endpoints (bifurcation junctions)
    const overlapsWith = new Set<string>()
    let overlapped = 0
    for (const pt of interior) {
      let buried = false
      for (const other of proj) {
        if (other.id === target.id) continue
        // Skip directly-contiguous vessels (parent/child share a real junction).
        if (other.parentId === target.id || target.parentId === other.id) continue
        const threshold = (target.radiusScene + other.radiusScene) * OVERLAP_RADIUS_FACTOR
        let minD = Infinity
        for (let i = 0; i < other.pts2d.length - 1; i++) {
          const p0 = other.pts2d[i]!, p1 = other.pts2d[i + 1]!
          const d = distToSeg(pt.x, pt.y, p0.x, p0.y, p1.x, p1.y)
          if (d < minD) minD = d
          if (minD < threshold) break
        }
        if (minD < threshold) { buried = true; overlapsWith.add(other.id) }
      }
      if (buried) overlapped++
    }
    result.set(target.id, {
      foreshorten: target.foreshorten,
      overlapPct: interior.length > 0 ? overlapped / interior.length : 0,
      overlaps: [...overlapsWith],
    })
  }
  return result
}

/**
 * Hybrid per-segment view quality:
 *   • rating  — curated Di Mario reference, smoothly interpolated across presets
 *   • foreshortenPct / overlapPct / overlaps / foreshortened — live from geometry
 */
export function computeViewQuality(
  segments: ArterySegment[],
  raoLao: number,
  cranialCaudal: number,
): ViewQualityEntry[] {
  const sampled = sampleSegments(segments)
  const geometry = measureViewGeometry(sampled, raoLao, cranialCaudal)
  const scores = interpolateSegmentScores(raoLao, cranialCaudal)

  return segments.map(seg => {
    const g = geometry.get(seg.id)
    const score = scores.get(seg.id) ?? 0
    return {
      segmentId: seg.id,
      rating: scoreToRating(score),
      foreshortened: (g?.foreshorten ?? 0) >= FORESHORTENED_FLAG,
      overlaps: g?.overlaps ?? [],
      foreshortenPct: g?.foreshorten,
      overlapPct: g?.overlapPct,
      computed: true,
    }
  })
}
