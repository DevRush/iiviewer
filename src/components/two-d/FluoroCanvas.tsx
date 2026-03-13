import { useRef, useEffect, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import type { ArterySegment } from '@/types/anatomy'
import { buildArterySpline, ANATOMY_SCALE } from '@/utils/geometry'
import {
  drawBackground,
  drawNoiseLayer,
  drawScanlineLayer,
  invertCanvas,
} from '@/utils/fluoro-effects'

interface FluoroCanvasProps {
  segments: ArterySegment[]
  raoLao: number
  cranialCaudal: number
  hoveredSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
  realism: boolean
  invertLut: boolean
  showLabels: boolean
}

interface CurveEntry {
  id: string
  shortName: string
  points3d: THREE.Vector3[]
  midpoint3d: THREE.Vector3
  lineWidth: number
}

interface ProjectedSegment {
  id: string
  shortName: string
  points: { x: number; y: number }[]
  midpoint: { x: number; y: number }
  lineWidth: number
}

const DPR_MAX = 2
const SAMPLES_PER_CURVE = 50
const HIT_THRESHOLD = 12
const DEG2RAD = Math.PI / 180
const ZOOM = 50

function distToLineSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function findNearestSegment(
  mx: number, my: number,
  projected: ProjectedSegment[],
): string | null {
  let minDist = HIT_THRESHOLD
  let nearest: string | null = null
  for (const seg of projected) {
    for (let i = 0; i < seg.points.length - 1; i++) {
      const p0 = seg.points[i]!
      const p1 = seg.points[i + 1]!
      const d = distToLineSegment(
        mx, my,
        p0.x, p0.y,
        p1.x, p1.y,
      )
      if (d < minDist) {
        minDist = d
        nearest = seg.id
      }
    }
  }
  return nearest
}

/** Compute orthographic camera basis vectors from C-arm angles */
function computeCameraBasis(raoLao: number, cranialCaudal: number) {
  const alpha = raoLao * DEG2RAD
  const beta = cranialCaudal * DEG2RAD

  // Camera position (spherical coords)
  const camX = Math.sin(alpha) * Math.cos(beta)
  const camY = Math.sin(beta)
  const camZ = Math.cos(alpha) * Math.cos(beta)

  // Forward = -normalize(camera)
  const fx = -camX, fy = -camY, fz = -camZ

  // World up — handle poles
  let ux = 0, uy = 1, uz = 0
  const dotFU = fx * ux + fy * uy + fz * uz
  if (Math.abs(dotFU) > 0.999) { ux = 0; uy = 0; uz = -1 }

  // Right = forward × worldUp
  let rx = fy * uz - fz * uy
  let ry = fz * ux - fx * uz
  let rz = fx * uy - fy * ux
  const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
  rx /= rLen; ry /= rLen; rz /= rLen

  // Up = right × forward
  const upx = ry * fz - rz * fy
  const upy = rz * fx - rx * fz
  const upz = rx * fy - ry * fx

  return { rx, ry, rz, upx, upy, upz }
}

export function FluoroCanvas({
  segments,
  raoLao,
  cranialCaudal,
  hoveredSegmentId,
  onHoverSegment,
  onClickSegment,
  realism,
  invertLut,
  showLabels,
}: FluoroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const rafRef = useRef(0)
  const isRunningRef = useRef(false)

  // Refs for values accessed in rAF loop
  const anglesRef = useRef({ raoLao, cranialCaudal })
  anglesRef.current = { raoLao, cranialCaudal }
  const hoveredRef = useRef(hoveredSegmentId)
  hoveredRef.current = hoveredSegmentId
  const realismRef = useRef(realism)
  realismRef.current = realism
  const invertRef = useRef(invertLut)
  invertRef.current = invertLut
  const showLabelsRef = useRef(showLabels)
  showLabelsRef.current = showLabels

  // Pre-compute 3D curve samples (only when segments change)
  const curveData = useMemo<CurveEntry[]>(() => {
    return segments.map(segment => {
      const curve = buildArterySpline(segment.controlPoints)
      const points3d: THREE.Vector3[] = []
      for (let i = 0; i <= SAMPLES_PER_CURVE; i++) {
        points3d.push(curve.getPoint(i / SAMPLES_PER_CURVE))
      }
      const avgRadius = (segment.startRadius + segment.endRadius) / 2
      return {
        id: segment.id,
        shortName: segment.shortName,
        points3d,
        midpoint3d: curve.getPoint(0.5),
        lineWidth: Math.max(1.5, avgRadius * 1.2 * ANATOMY_SCALE * 0.1 * 2 * ZOOM),
      }
    })
  }, [segments])

  const curveDataRef = useRef(curveData)
  curveDataRef.current = curveData

  // Store projected segments for hit testing
  const projectedRef = useRef<ProjectedSegment[]>([])
  // Ref to draw function so ResizeObserver can trigger it
  const drawRef = useRef<(ts: number) => void>(() => {})

  // Canvas sizing via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      sizeRef.current = { width, height }
      const canvas = canvasRef.current
      if (canvas) {
        const dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1)
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
      }
      // Trigger a draw now that size is available
      drawRef.current(performance.now())
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Main draw function — uses refs to avoid stale closures
  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const { width, height } = sizeRef.current
    if (width === 0 || height === 0) {
      // Size not yet available — keep rAF loop alive to retry
      if (realismRef.current && isRunningRef.current) {
        rafRef.current = requestAnimationFrame(draw)
      }
      return
    }

    const dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const { raoLao: rl, cranialCaudal: cc } = anglesRef.current
    const hovered = hoveredRef.current
    const doRealism = realismRef.current
    const curves = curveDataRef.current

    // 1. Background
    drawBackground(ctx, width, height)

    // 2. Project and draw vessels
    const { rx, ry, rz, upx, upy, upz } = computeCameraBasis(rl, cc)
    const cx = width / 2
    const cy = height / 2
    const jitter = doRealism ? Math.sin(timestamp * 0.004) * 0.45 : 0

    const projected: ProjectedSegment[] = curves.map(seg => {
      const points = seg.points3d.map(p => ({
        x: cx + (p.x * rx + p.y * ry + p.z * rz) * ZOOM,
        y: cy - (p.x * upx + p.y * upy + p.z * upz) * ZOOM,
      }))
      return {
        id: seg.id,
        shortName: seg.shortName,
        points,
        midpoint: {
          x: cx + (seg.midpoint3d.x * rx + seg.midpoint3d.y * ry + seg.midpoint3d.z * rz) * ZOOM,
          y: cy - (seg.midpoint3d.x * upx + seg.midpoint3d.y * upy + seg.midpoint3d.z * upz) * ZOOM,
        },
        lineWidth: seg.lineWidth,
      }
    })
    projectedRef.current = projected

    // Draw each vessel
    for (const seg of projected) {
      const isHovered = seg.id === hovered

      ctx.save()
      // First pass: glow/shadow layer
      if (doRealism) {
        ctx.strokeStyle = isHovered
          ? 'rgba(200, 220, 255, 0.4)'
          : 'rgba(180, 200, 240, 0.25)'
        ctx.lineWidth = (isHovered ? seg.lineWidth * 1.3 : seg.lineWidth) + 6
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.filter = 'blur(4px)'
        ctx.beginPath()
        for (let i = 0; i < seg.points.length; i++) {
          const pt = seg.points[i]!
          const x = pt.x + jitter * (i % 2 === 0 ? 1 : -1)
          const y = pt.y + jitter * (i % 3 === 0 ? -1 : 1)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.filter = 'none'
      }

      // Second pass: crisp vessel stroke
      ctx.strokeStyle = isHovered
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(230, 238, 255, 0.85)'
      ctx.lineWidth = isHovered ? seg.lineWidth * 1.3 : seg.lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      for (let i = 0; i < seg.points.length; i++) {
        const pt = seg.points[i]!
        const x = pt.x + jitter * (i % 2 === 0 ? 1 : -1)
        const y = pt.y + jitter * (i % 3 === 0 ? -1 : 1)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()
    }

    // 3. Labels
    if (showLabelsRef.current) {
      for (const seg of projected) {
        const isHovered = seg.id === hovered
        ctx.save()
        ctx.font = isHovered ? 'bold 10px monospace' : '9px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = isHovered
          ? 'rgba(255, 215, 0, 0.95)'
          : 'rgba(100, 220, 180, 0.7)'
        ctx.fillText(seg.shortName, seg.midpoint.x, seg.midpoint.y - 10)
        ctx.restore()
      }
    } else {
      // Show label only for hovered segment
      const hoveredSeg = projected.find(s => s.id === hovered)
      if (hoveredSeg) {
        ctx.save()
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'rgba(255, 215, 0, 0.95)'
        ctx.fillText(hoveredSeg.shortName, hoveredSeg.midpoint.x, hoveredSeg.midpoint.y - 10)
        ctx.restore()
      }
    }

    // 4. Effects
    if (doRealism) {
      drawNoiseLayer(ctx, width, height, timestamp)
      drawScanlineLayer(ctx, width, height, timestamp)
    }

    // 5. LUT inversion (applies to device pixels)
    if (invertRef.current) {
      invertCanvas(ctx, Math.round(width * dpr), Math.round(height * dpr))
      // Reset transform after getImageData/putImageData (which operate in device coords)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // 6. Continue rAF loop if realism mode
    if (doRealism && isRunningRef.current) {
      rafRef.current = requestAnimationFrame(draw)
    }
  }, [])
  drawRef.current = draw

  // Start/stop animation loop based on realism toggle
  useEffect(() => {
    if (realism) {
      isRunningRef.current = true
      rafRef.current = requestAnimationFrame(draw)
    } else {
      isRunningRef.current = false
      cancelAnimationFrame(rafRef.current)
      // Draw one static frame
      draw(performance.now())
    }
    return () => {
      isRunningRef.current = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [realism, draw])

  // Redraw static frame when props change (non-realism mode)
  useEffect(() => {
    if (!realism) {
      draw(performance.now())
    }
  }, [raoLao, cranialCaudal, hoveredSegmentId, invertLut, showLabels, segments, realism, draw])

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const nearest = findNearestSegment(mx, my, projectedRef.current)
    onHoverSegment(nearest)
  }, [onHoverSegment])

  const handleMouseLeave = useCallback(() => {
    onHoverSegment(null)
  }, [onHoverSegment])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const nearest = findNearestSegment(mx, my, projectedRef.current)
    if (nearest) onClickSegment(nearest)
  }, [onClickSegment])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  )
}
