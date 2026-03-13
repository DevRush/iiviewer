import * as THREE from 'three'
import { ANATOMY_SCALE } from '@/utils/geometry'

/**
 * Opaque heart ellipsoid, sized to fit inside the coronary tree
 * so arteries naturally wrap around the outside.
 */
export function HeartMesh() {
  const shrink = 0.38
  const scaleX = 4 * ANATOMY_SCALE * shrink
  const scaleY = 6 * ANATOMY_SCALE * shrink
  const scaleZ = 3.5 * ANATOMY_SCALE * shrink

  return (
    <mesh scale={[scaleX, scaleY, scaleZ]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color="#c4766e"
        roughness={0.8}
        side={THREE.FrontSide}
        emissive="#8b4040"
        emissiveIntensity={0.15}
      />
    </mesh>
  )
}
