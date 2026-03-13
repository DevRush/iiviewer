import { useState, useCallback, useRef } from 'react'
import type { AngleState } from '@/types/angles'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function useAngleState() {
  const [angles, setAngles] = useState<AngleState>({ raoLao: 0, cranialCaudal: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const anglesRef = useRef(angles)
  anglesRef.current = angles

  const setRaoLao = useCallback((v: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      setIsAnimating(false)
    }
    setAngles(prev => ({ ...prev, raoLao: v }))
  }, [])

  const setCranialCaudal = useCallback((v: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      setIsAnimating(false)
    }
    setAngles(prev => ({ ...prev, cranialCaudal: v }))
  }, [])

  const animateTo = useCallback((target: AngleState, durationMs = 600) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const start = { ...anglesRef.current }
    const startTime = performance.now()
    setIsAnimating(true)

    const animate = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / durationMs, 1)
      const eased = easeInOutCubic(t)

      setAngles({
        raoLao: start.raoLao + (target.raoLao - start.raoLao) * eased,
        cranialCaudal: start.cranialCaudal + (target.cranialCaudal - start.cranialCaudal) * eased,
      })

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [])

  const adjustRaoLao = useCallback((delta: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      setIsAnimating(false)
    }
    setAngles(prev => ({
      ...prev,
      raoLao: Math.max(-90, Math.min(90, prev.raoLao + delta))
    }))
  }, [])

  const adjustCranialCaudal = useCallback((delta: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      setIsAnimating(false)
    }
    setAngles(prev => ({
      ...prev,
      cranialCaudal: Math.max(-45, Math.min(45, prev.cranialCaudal + delta))
    }))
  }, [])

  return { angles, setRaoLao, setCranialCaudal, adjustRaoLao, adjustCranialCaudal, animateTo, isAnimating }
}
