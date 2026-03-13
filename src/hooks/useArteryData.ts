import { useMemo } from 'react'
import type { DominanceType } from '@/types/angles'
import type { ArterySegment } from '@/types/anatomy'
import { RIGHT_DOMINANT_SEGMENTS } from '@/data/arteries'
import { LEFT_DOMINANT_SEGMENTS } from '@/data/arteries-left-dominant'
import { CODOMINANT_SEGMENTS } from '@/data/arteries-codominant'

export function useArteryData(dominance: DominanceType): ArterySegment[] {
  return useMemo(() => {
    switch (dominance) {
      case 'right': return RIGHT_DOMINANT_SEGMENTS
      case 'left': return LEFT_DOMINANT_SEGMENTS
      case 'codominant': return CODOMINANT_SEGMENTS
    }
  }, [dominance])
}
