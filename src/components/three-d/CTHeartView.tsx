import { useEffect, useRef, useMemo } from 'react'

const TOTAL_FRAMES = 36
const AP_INDEX = 5          // frame-05 = AP view (raoLao = 0)
const DEG_PER_FRAME = 10    // each frame = 10° rotation

/**
 * Map raoLao angle to a continuous frame position.
 * Positive raoLao (RAO) = lower indices, negative (LAO) = higher indices.
 */
function angleToFramePos(raoLao: number): number {
  const pos = AP_INDEX - raoLao / DEG_PER_FRAME
  return ((pos % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES
}

/** Preload all frame images once */
function usePreloadedFrames(): HTMLImageElement[] {
  const frames = useMemo(() => {
    const imgs: HTMLImageElement[] = []
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/ct-frames/frame-${String(i).padStart(2, '0')}.jpg`
      imgs.push(img)
    }
    return imgs
  }, [])
  return frames
}

interface CTHeartViewProps {
  raoLao: number
  cranialCaudal: number
}

export function CTHeartView({ raoLao, cranialCaudal }: CTHeartViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const frames = usePreloadedFrames()
  const rafRef = useRef(0)
  const prevPosRef = useRef(angleToFramePos(raoLao))

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let mounted = true

    const draw = () => {
      if (!mounted) return

      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Smooth interpolation toward target frame
      const targetPos = angleToFramePos(raoLao)
      let current = prevPosRef.current

      // Find shortest path around the circle
      let diff = targetPos - current
      if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES
      if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES
      current = current + diff * 0.15
      current = ((current % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES
      prevPosRef.current = current

      // Get two adjacent frames for cross-fade
      const idx0 = Math.floor(current) % TOTAL_FRAMES
      const idx1 = (idx0 + 1) % TOTAL_FRAMES
      const blend = current - Math.floor(current)

      const img0 = frames[idx0]
      const img1 = frames[idx1]

      // Background
      ctx.fillStyle = '#0a0a12'
      ctx.fillRect(0, 0, width, height)

      // Cranial/caudal perspective tilt (subtle vertical shift + scale)
      const tiltFactor = cranialCaudal / 45 // -1 to 1
      const scaleY = 1 - Math.abs(tiltFactor) * 0.08
      const offsetY = tiltFactor * height * 0.06

      // Calculate image draw area (fit image within canvas, centered)
      const drawFrame = (img: HTMLImageElement, alpha: number) => {
        if (!img.complete || img.naturalWidth === 0) return

        ctx.save()
        ctx.globalAlpha = alpha

        const imgAspect = img.naturalWidth / img.naturalHeight
        const canvasAspect = width / height
        let drawW: number, drawH: number
        if (imgAspect > canvasAspect) {
          drawW = width
          drawH = width / imgAspect
        } else {
          drawH = height
          drawW = height * imgAspect
        }

        const x = (width - drawW) / 2
        const y = (height - drawH) / 2 + offsetY

        // Apply cranial/caudal scale
        ctx.translate(width / 2, height / 2)
        ctx.scale(1, scaleY)
        ctx.translate(-width / 2, -height / 2)

        ctx.drawImage(img, x, y, drawW, drawH)
        ctx.restore()
      }

      // Cross-fade between adjacent frames
      if (blend < 0.01 || !img1?.complete) {
        drawFrame(img0!, 1)
      } else {
        drawFrame(img0!, 1)
        drawFrame(img1!, blend)
      }

      // Keep animating if we haven't converged
      if (Math.abs(diff) > 0.01) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    // Observe size changes
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(draw)
    })
    observer.observe(container)

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [raoLao, cranialCaudal, frames])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#0a0a12',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  )
}
