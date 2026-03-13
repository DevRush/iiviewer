import { useMemo } from 'react'
import * as THREE from 'three'
import { anglesToPosition } from '@/utils/carm-math'

export function useCameraPosition(raoLao: number, cranialCaudal: number, distance: number): THREE.Vector3 {
  return useMemo(() => {
    return anglesToPosition(raoLao, cranialCaudal, distance)
  }, [raoLao, cranialCaudal, distance])
}
