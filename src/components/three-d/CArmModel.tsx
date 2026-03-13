import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CArmModelProps {
  raoLao: number
  cranialCaudal: number
}

/**
 * 3D C-arm model showing the arc, image intensifier (detector),
 * and X-ray tube. Rotates to match current C-arm angles with
 * smooth slerp interpolation for realistic mechanical lag.
 */
export function CArmModel({ raoLao, cranialCaudal }: CArmModelProps) {
  const groupRef = useRef<THREE.Group>(null!)

  const targetQuat = useMemo(() => {
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(-cranialCaudal),
      THREE.MathUtils.degToRad(raoLao),
      0,
      'YXZ'
    )
    return new THREE.Quaternion().setFromEuler(euler)
  }, [raoLao, cranialCaudal])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.slerp(targetQuat, 0.08)
    }
  })

  const arcRadius = 3.8
  const arcThickness = 0.06

  return (
    <group ref={groupRef}>
      {/* C-arm arc (partial torus) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[arcRadius, arcThickness, 8, 48, Math.PI]} />
        <meshStandardMaterial
          color="#667788"
          transparent
          opacity={0.35}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Image Intensifier / Flat Panel Detector (top, anterior) */}
      <mesh position={[0, 0, arcRadius]}>
        <cylinderGeometry args={[0.5, 0.55, 0.15, 16]} />
        <meshStandardMaterial
          color="#445566"
          transparent
          opacity={0.4}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* Detector face (circle) */}
      <mesh position={[0, 0, arcRadius - 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 24]} />
        <meshBasicMaterial color="#223344" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* X-ray tube (bottom, posterior) */}
      <mesh position={[0, 0, -arcRadius]}>
        <cylinderGeometry args={[0.2, 0.25, 0.3, 12]} />
        <meshStandardMaterial
          color="#556677"
          transparent
          opacity={0.35}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Connecting beam line (very faint) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, arcRadius * 2, 4]} />
        <meshBasicMaterial color="#4488cc" transparent opacity={0.1} />
      </mesh>
    </group>
  )
}
