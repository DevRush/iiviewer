import { useRef, useEffect } from 'react'
import { drawFoggyBackground, drawNoiseLayer, drawScanlineLayer } from '@/utils/fluoro-effects'

/**
 * Transparent canvas overlay that draws anatomical background landmarks,
 * quantum mottle noise, and subtle scanline effects on top of the R3F scene.
 */
export function FluoroEffectsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(parent)

    let raf = 0
    const draw = (timestamp: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) { raf = requestAnimationFrame(draw); return }

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cssW = w / dpr
      const cssH = h / dpr

      // Foggy gray diffusion blotches + vignette
      drawFoggyBackground(ctx, cssW, cssH)

      // Quantum mottle noise
      drawNoiseLayer(ctx, cssW, cssH, timestamp)

      // Subtle scanlines
      drawScanlineLayer(ctx, cssW, cssH, timestamp)

      ctx.restore()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  )
}
