import { useMemo } from 'react'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

interface VHLabHeartProps {
  hoveredSegmentId: string | null
  selectedSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
}

/** Bake GLTF world transforms into geometry vertices, return cloned geometries */
function bakeMeshes(scene: THREE.Object3D): THREE.BufferGeometry[] {
  scene.updateMatrixWorld(true)
  const geos: THREE.BufferGeometry[] = []
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geo = child.geometry.clone()
      geo.applyMatrix4(child.matrixWorld)
      geo.computeBoundingBox()
      geo.computeVertexNormals()
      geos.push(geo)
    }
  })
  return geos
}

/** Compute combined bounding box for multiple geometries */
function combinedBounds(geos: THREE.BufferGeometry[]) {
  const min = new THREE.Vector3(Infinity, Infinity, Infinity)
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
  for (const geo of geos) {
    min.min(geo.boundingBox!.min)
    max.max(geo.boundingBox!.max)
  }
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5)
  const extent = new THREE.Vector3().subVectors(max, min)
  return { center, extent, min, max }
}

/** Sample N evenly-spaced points from mesh surfaces */
function sampleSurfacePoints(geos: THREE.BufferGeometry[], count: number): THREE.Vector3[] {
  // Collect all triangle areas for weighted sampling
  const triangles: { geo: THREE.BufferGeometry; a: number; b: number; c: number; area: number }[] = []
  let totalArea = 0

  for (const geo of geos) {
    const pos = geo.attributes.position!
    const idx = geo.index
    const triCount = idx ? idx.count / 3 : pos.count / 3

    for (let t = 0; t < triCount; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3
      const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1
      const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2

      const ax = pos.getX(i0), ay = pos.getY(i0), az = pos.getZ(i0)
      const bx = pos.getX(i1), by = pos.getY(i1), bz = pos.getZ(i1)
      const cx = pos.getX(i2), cy = pos.getY(i2), cz = pos.getZ(i2)

      // Cross product for area
      const abx = bx - ax, aby = by - ay, abz = bz - az
      const acx = cx - ax, acy = cy - ay, acz = cz - az
      const nx = aby * acz - abz * acy
      const ny = abz * acx - abx * acz
      const nz = abx * acy - aby * acx
      const area = Math.sqrt(nx * nx + ny * ny + nz * nz) * 0.5

      if (area > 0) {
        triangles.push({ geo, a: i0, b: i1, c: i2, area })
        totalArea += area
      }
    }
  }

  // Weighted random sampling
  const points: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalArea
    let tri = triangles[0]!
    for (const t of triangles) {
      r -= t.area
      if (r <= 0) { tri = t; break }
    }
    const pos = tri.geo.attributes.position!
    const u = Math.random(), v = Math.random()
    const su = Math.sqrt(u)
    const w0 = 1 - su, w1 = su * (1 - v), w2 = su * v
    points.push(new THREE.Vector3(
      pos.getX(tri.a) * w0 + pos.getX(tri.b) * w1 + pos.getX(tri.c) * w2,
      pos.getY(tri.a) * w0 + pos.getY(tri.b) * w1 + pos.getY(tri.c) * w2,
      pos.getZ(tri.a) * w0 + pos.getZ(tri.b) * w1 + pos.getZ(tri.c) * w2,
    ))
  }
  return points
}

/** Auto-align arteries to heart surface via vertex-distance grid search.
 *  Uses subsampled vertex proximity scoring — fast (~1-2s) compared to raycasting. */
function autoAlign(
  heartGeos: THREE.BufferGeometry[],
  arteryGeos: THREE.BufferGeometry[],
): { scale: number; rotation: THREE.Euler; offset: THREE.Vector3 } {
  const hBounds = combinedBounds(heartGeos)
  const aBounds = combinedBounds(arteryGeos)

  const hMaxExt = Math.max(hBounds.extent.x, hBounds.extent.y, hBounds.extent.z)
  const aMaxExt = Math.max(aBounds.extent.x, aBounds.extent.y, aBounds.extent.z)
  const scale = hMaxExt / aMaxExt

  // Subsample heart surface vertices (every 50th) for fast distance queries
  const heartVerts: Float32Array[] = []
  for (const geo of heartGeos) {
    const pos = geo.attributes.position!
    for (let i = 0; i < pos.count; i += 50) {
      heartVerts.push(new Float32Array([
        pos.getX(i) - hBounds.center.x,
        pos.getY(i) - hBounds.center.y,
        pos.getZ(i) - hBounds.center.z,
      ]))
    }
  }

  // Sample artery points (centered, scaled to match heart)
  const rawSamples = sampleSurfacePoints(arteryGeos, 40)
  const centeredSamples = rawSamples.map(p => [
    (p.x - aBounds.center.x) * scale,
    (p.y - aBounds.center.y) * scale,
    (p.z - aBounds.center.z) * scale,
  ] as [number, number, number])

  // Score = negative total min-distance (higher = better = arteries closer to heart surface)
  function scoreRotation(rx: number, ry: number, rz: number): number {
    const mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz))
    const e = mat.elements
    let totalDist = 0
    for (const [sx, sy, sz] of centeredSamples) {
      // Manual matrix multiply (rotation only, no translation)
      const px = e[0]! * sx + e[4]! * sy + e[8]! * sz
      const py = e[1]! * sx + e[5]! * sy + e[9]! * sz
      const pz = e[2]! * sx + e[6]! * sy + e[10]! * sz
      let minDistSq = Infinity
      for (const hv of heartVerts) {
        const dx = px - hv[0]!, dy = py - hv[1]!, dz = pz - hv[2]!
        const dsq = dx * dx + dy * dy + dz * dz
        if (dsq < minDistSq) minDistSq = dsq
      }
      totalDist += Math.sqrt(minDistSq)
    }
    return -totalDist
  }

  // Coarse search: 45° steps → 8³ = 512 candidates
  let bestScore = -Infinity
  let bestRx = 0, bestRy = 0, bestRz = 0
  const step = 45 * Math.PI / 180
  for (let rx = -Math.PI; rx < Math.PI; rx += step) {
    for (let ry = -Math.PI; ry < Math.PI; ry += step) {
      for (let rz = -Math.PI; rz < Math.PI; rz += step) {
        const score = scoreRotation(rx, ry, rz)
        if (score > bestScore) {
          bestScore = score; bestRx = rx; bestRy = ry; bestRz = rz
        }
      }
    }
  }

  // Fine search: 10° steps, ±40° around best → ≤9³ = 729 candidates
  const fineStep = 10 * Math.PI / 180
  const range = 40 * Math.PI / 180
  for (let rx = bestRx - range; rx <= bestRx + range; rx += fineStep) {
    for (let ry = bestRy - range; ry <= bestRy + range; ry += fineStep) {
      for (let rz = bestRz - range; rz <= bestRz + range; rz += fineStep) {
        const score = scoreRotation(rx, ry, rz)
        if (score > bestScore) {
          bestScore = score; bestRx = rx; bestRy = ry; bestRz = rz
        }
      }
    }
  }

  // Extra-fine: 3° steps, ±8° → ≤7³ = 343 candidates
  const xfStep = 3 * Math.PI / 180
  const xfRange = 8 * Math.PI / 180
  for (let rx = bestRx - xfRange; rx <= bestRx + xfRange; rx += xfStep) {
    for (let ry = bestRy - xfRange; ry <= bestRy + xfRange; ry += xfStep) {
      for (let rz = bestRz - xfRange; rz <= bestRz + xfRange; rz += xfStep) {
        const score = scoreRotation(rx, ry, rz)
        if (score > bestScore) {
          bestScore = score; bestRx = rx; bestRy = ry; bestRz = rz
        }
      }
    }
  }

  console.log(`Auto-align: rotation=(${(bestRx*180/Math.PI).toFixed(1)}°, ${(bestRy*180/Math.PI).toFixed(1)}°, ${(bestRz*180/Math.PI).toFixed(1)}°) score=${bestScore.toFixed(1)}`)

  return {
    scale,
    rotation: new THREE.Euler(bestRx, bestRy, bestRz),
    offset: new THREE.Vector3(0, 0, 0),
  }
}

const ARTERY_COLORS = ['#FF4444', '#4488FF', '#44CC44']
const DISPLAY_SCALE = 3.0

export function VHLabHeart({
  hoveredSegmentId: _hoveredSegmentId,
  selectedSegmentId: _selectedSegmentId,
  onHoverSegment,
  onClickSegment: _onClickSegment,
}: VHLabHeartProps) {
  const heartGltf = useGLTF('/models/vhlab/heart0069_full.glb')
  const arteryGltf = useGLTF('/models/vhlab/heart0069.glb')

  const { heartGeos, arteryGeos, heartCenter, arteryCenter, alignment } = useMemo(() => {
    const hGeos = bakeMeshes(heartGltf.scene)
    const aGeos = bakeMeshes(arteryGltf.scene)

    const hBounds = combinedBounds(hGeos)
    const aBounds = combinedBounds(aGeos)

    // Normalize heart to DISPLAY_SCALE
    const hMaxExt = Math.max(hBounds.extent.x, hBounds.extent.y, hBounds.extent.z)
    const heartNorm = DISPLAY_SCALE / hMaxExt

    const align = autoAlign(hGeos, aGeos)

    return {
      heartGeos: hGeos,
      arteryGeos: aGeos,
      heartCenter: hBounds.center,
      arteryCenter: aBounds.center,
      alignment: { ...align, heartNorm },
    }
  }, [heartGltf.scene, arteryGltf.scene])

  const arteryRotArr: [number, number, number] = [alignment.rotation.x, alignment.rotation.y, alignment.rotation.z]

  return (
    <group>
      {/* Heart — clay material, centered and normalized */}
      <group scale={alignment.heartNorm}>
        <group position={[-heartCenter.x, -heartCenter.y, -heartCenter.z]}>
          {heartGeos.map((geo, i) => (
            <mesh key={`heart-${i}`} geometry={geo}>
              <meshStandardMaterial
                color="#c4a0a0"
                roughness={0.9}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Coronary arteries — centered, scaled, rotated to match heart */}
      <group rotation={arteryRotArr}>
        <group scale={alignment.scale * alignment.heartNorm}>
          <group position={[-arteryCenter.x, -arteryCenter.y, -arteryCenter.z]}>
            {arteryGeos.map((geo, i) => (
              <mesh
                key={`artery-${i}`}
                geometry={geo}
                renderOrder={1}
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onHoverSegment(`artery-${i}`)
                }}
                onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onHoverSegment(null)
                }}
              >
                <meshStandardMaterial
                  color={ARTERY_COLORS[i] ?? '#FF4444'}
                  roughness={0.5}
                  metalness={0.15}
                  side={THREE.DoubleSide}
                  polygonOffset
                  polygonOffsetFactor={-1}
                  polygonOffsetUnits={-1}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/vhlab/heart0069_full.glb')
useGLTF.preload('/models/vhlab/heart0069.glb')
