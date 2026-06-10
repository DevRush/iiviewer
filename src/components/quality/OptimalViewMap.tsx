import { useMemo, useRef, useEffect } from 'react'
import type { ArterySegment } from '@/types/anatomy'
import { interpolateSegmentScore } from '@/data/quality-matrix'

interface OptimalViewMapProps {
  segments: ArterySegment[]
  segmentId: string | null
  raoLao: number
  cranialCaudal: number
  onPick: (raoLao: number, cranialCaudal: number) => void
}

// Angle domain (matches the app sliders)
const RAO_MIN = -90, RAO_MAX = 90
const CC_MIN = -45, CC_MAX = 45
// Heat-map grid resolution (foreshortening is smooth, so a coarse grid suffices)
const GRID_W = 60
const GRID_H = 30
const CANVAS_W = 240
const CANVAS_H = 120

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

/**
 * Optimal-view (best-projection) map for one coronary segment.
 *
 * Sweeps the entire (RAO/LAO × CRAN/CAUD) gantry plane and colours each angle by
 * the segment's view quality (green = ideal, red = not recommended), marks the
 * best view (✦) and the current view (＋), and lets the user click to jump there.
 *
 * The quality field is the interpolated Di Mario & Sutaria reference (the same
 * source that drives the segment chips), so the optimum the map points to is the
 * published best projection for that segment — not an artefact of the stylised
 * centreline geometry.
 */
export function OptimalViewMap({ segments, segmentId, raoLao, cranialCaudal, onPick }: OptimalViewMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

  // Build the quality grid for the selected segment (recompute only when it changes).
  const grid = useMemo(() => {
    if (!segmentId) return null
    const seg = segments.find(s => s.id === segmentId)
    if (!seg) return null

    const values = new Float32Array(GRID_W * GRID_H) // visibility 0..1 (score/3)
    let best = { v: -Infinity, rl: 0, cc: 0 }
    for (let gy = 0; gy < GRID_H; gy++) {
      const cc = lerp(CC_MAX, CC_MIN, gy / (GRID_H - 1)) // top = cranial(+), bottom = caudal(−)
      for (let gx = 0; gx < GRID_W; gx++) {
        const rl = lerp(RAO_MIN, RAO_MAX, gx / (GRID_W - 1))
        const vis = interpolateSegmentScore(segmentId, rl, cc) / 3 // 0 (−) … 1 (+++)
        values[gy * GRID_W + gx] = vis
        if (vis > best.v) best = { v: vis, rl, cc }
      }
    }
    return { values, best, name: seg.name }
  }, [segments, segmentId])

  // Canvas backing-store size is set on the JSX element (below) so it is correct on
  // the first paint — no blank frame. This effect only draws.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    if (!grid) {
      ctx.fillStyle = 'rgba(120,130,150,0.5)'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Select a segment to map its optimal view', CANVAS_W / 2, CANVAS_H / 2)
      return
    }

    // Heat cells: green (elongated) → red (foreshortened).
    const cw = CANVAS_W / GRID_W
    const ch = CANVAS_H / GRID_H
    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        const vis = grid.values[gy * GRID_W + gx]! // 0 (poor) … 1 (ideal)
        const hue = 120 * Math.max(0, Math.min(1, vis)) // 0 red → 120 green
        ctx.fillStyle = `hsl(${hue}, 70%, ${28 + vis * 22}%)`
        ctx.fillRect(gx * cw, gy * ch, cw + 0.5, ch + 0.5)
      }
    }

    // Axes guide lines at AP (rl=0) and straight (cc=0).
    const xAt = (rl: number) => ((rl - RAO_MIN) / (RAO_MAX - RAO_MIN)) * CANVAS_W
    const yAt = (cc: number) => ((CC_MAX - cc) / (CC_MAX - CC_MIN)) * CANVAS_H
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(xAt(0), 0); ctx.lineTo(xAt(0), CANVAS_H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, yAt(0)); ctx.lineTo(CANVAS_W, yAt(0)); ctx.stroke()

    // Optimal marker (✦)
    ctx.fillStyle = 'rgba(120,230,255,0.95)'
    ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦', xAt(grid.best.rl), yAt(grid.best.cc))

    // Current view marker (＋)
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('＋', xAt(raoLao), yAt(cranialCaudal))

    // Corner labels
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '8px monospace'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText('RAO · CRA', 2, 2)
    ctx.textAlign = 'right'
    ctx.fillText('LAO · CRA', CANVAS_W - 2, 2)
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillText('RAO · CAU', 2, CANVAS_H - 2)
    ctx.textAlign = 'right'
    ctx.fillText('LAO · CAU', CANVAS_W - 2, CANVAS_H - 2)
  }, [grid, raoLao, cranialCaudal, dpr])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rl = Math.round(lerp(RAO_MIN, RAO_MAX, px))
    const cc = Math.round(lerp(CC_MAX, CC_MIN, py))
    onPick(rl, cc)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[9px] text-gray-500 uppercase tracking-wider">
        Optimal View {grid ? `· ${grid.name}` : ''}
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W * dpr}
        height={CANVAS_H * dpr}
        onClick={handleClick}
        style={{ width: CANVAS_W, height: CANVAS_H, borderRadius: 4, cursor: grid ? 'crosshair' : 'default', maxWidth: '100%' }}
        title="View-quality map — green = ideal view, red = not recommended. ✦ best · ＋ current. Click to jump."
      />
    </div>
  )
}
