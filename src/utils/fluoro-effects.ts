/**
 * Canvas 2D fluoroscopy rendering effects.
 * Anatomical background, quantum mottle noise, subtle scanlines, LUT inversion.
 */

/** Draw foggy gray diffusion blotches across the background */
export function drawFoggyBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  // Scatter several soft gray blotches at fixed positions
  const blotches = [
    { x: 0.30, y: 0.35, r: 0.32, a: 0.50 },
    { x: 0.62, y: 0.55, r: 0.36, a: 0.45 },
    { x: 0.45, y: 0.70, r: 0.30, a: 0.55 },
    { x: 0.70, y: 0.30, r: 0.26, a: 0.40 },
    { x: 0.25, y: 0.60, r: 0.24, a: 0.45 },
    { x: 0.55, y: 0.25, r: 0.22, a: 0.48 },
    { x: 0.40, y: 0.50, r: 0.40, a: 0.35 },
    { x: 0.75, y: 0.65, r: 0.24, a: 0.42 },
    { x: 0.20, y: 0.20, r: 0.26, a: 0.38 },
    { x: 0.50, y: 0.85, r: 0.30, a: 0.45 },
    { x: 0.80, y: 0.50, r: 0.22, a: 0.35 },
    { x: 0.35, y: 0.15, r: 0.24, a: 0.42 },
  ]

  for (const b of blotches) {
    const cx = width * b.x
    const cy = height * b.y
    const rad = width * b.r
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
    grad.addColorStop(0, `rgba(160, 170, 185, ${b.a})`)
    grad.addColorStop(0.4, `rgba(140, 150, 165, ${b.a * 0.6})`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
  }

  // Overall fog wash
  const fogGrad = ctx.createRadialGradient(
    width * 0.48, height * 0.46, 0,
    width * 0.48, height * 0.46, width * 0.55,
  )
  fogGrad.addColorStop(0, 'rgba(160, 170, 185, 0.40)')
  fogGrad.addColorStop(0.6, 'rgba(140, 150, 165, 0.25)')
  fogGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = fogGrad
  ctx.fillRect(0, 0, width, height)

  // Edge vignette
  const vigGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.48, width * 0.22,
    width * 0.5, height * 0.48, width * 0.65,
  )
  vigGrad.addColorStop(0, 'transparent')
  vigGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.10)')
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)')
  ctx.fillStyle = vigGrad
  ctx.fillRect(0, 0, width, height)
}

/** Draw radial gradient background simulating II tube falloff */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const gradient = ctx.createRadialGradient(
    width * 0.52, height * 0.46, width * 0.08,
    width * 0.52, height * 0.48, width * 0.7,
  )
  gradient.addColorStop(0, '#15263f')
  gradient.addColorStop(1, '#050a13')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  ctx.fillRect(0, 0, width, height)
}

/** Quantum mottle noise — dense salt-and-pepper grain */
export function drawNoiseLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
): void {
  ctx.save()
  const seed = Math.floor(timestamp * 0.25)

  // Bright noise grains
  ctx.fillStyle = 'rgba(160, 175, 200, 0.07)'
  for (let i = 0; i < 4000; i++) {
    const x = (seed * (i + 23) * 13) % width
    const y = (seed * (i + 7) * 17) % height
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Dark noise grains
  ctx.fillStyle = 'rgba(0, 0, 10, 0.06)'
  for (let i = 0; i < 2200; i++) {
    const x = (seed * (i + 41) * 19) % width
    const y = (seed * (i + 11) * 23) % height
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Larger scattered photon clusters
  ctx.fillStyle = 'rgba(180, 195, 220, 0.045)'
  for (let i = 0; i < 600; i++) {
    const x = (seed * (i + 59) * 29) % width
    const y = (seed * (i + 31) * 37) % height
    ctx.fillRect(x, y, 3, 3)
  }

  ctx.restore()
}

/** Very subtle scanlines */
export function drawScanlineLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timestamp: number,
): void {
  ctx.save()
  const shift = (Math.sin(timestamp * 0.001) + 1) * 0.5
  ctx.fillStyle = `rgba(180, 195, 215, ${0.008 + shift * 0.008})`
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1)
  }
  ctx.restore()
}

/** Invert RGB channels (classic LUT inversion) */
export function invertCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]!
    data[i + 1] = 255 - data[i + 1]!
    data[i + 2] = 255 - data[i + 2]!
  }
  ctx.putImageData(imageData, 0, 0)
}
