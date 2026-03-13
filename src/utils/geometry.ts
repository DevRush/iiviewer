import * as THREE from 'three'

/** Scale factor: anatomy data is in cm, we use scene units = cm * SCALE */
export const ANATOMY_SCALE = 0.5

// ─── Mesh-based surface projection (used by CoronaryArteries3D) ───

/**
 * Extract the heart GLTF geometry baked into world space for raycasting.
 * Bakes all nested GLTF transforms + the primitive scale into the geometry
 * so the resulting mesh has an identity matrixWorld.
 */
export function extractHeartGeometry(
  gltfScene: THREE.Object3D,
  primitiveScale: number,
): { mesh: THREE.Mesh; center: THREE.Vector3 } {
  // Ensure all world matrices are up to date
  gltfScene.updateMatrixWorld(true)

  // Find the first Mesh in the GLTF scene graph
  let srcMesh: THREE.Mesh | null = null
  gltfScene.traverse((child) => {
    if (!srcMesh && child instanceof THREE.Mesh) {
      srcMesh = child
    }
  })
  if (!srcMesh) throw new Error('No mesh found in GLTF scene')

  // Clone geometry and bake the full world transform into vertices
  const geometry = (srcMesh as THREE.Mesh).geometry.clone()
  geometry.applyMatrix4((srcMesh as THREE.Mesh).matrixWorld)

  // Apply the primitive scale (the <primitive scale={2.2}> wrapper)
  const scaleMat = new THREE.Matrix4().makeScale(primitiveScale, primitiveScale, primitiveScale)
  geometry.applyMatrix4(scaleMat)

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  geometry.computeVertexNormals()

  // Create a mesh with identity transform for raycasting
  const bakedMesh = new THREE.Mesh(geometry)
  bakedMesh.updateMatrixWorld(true)

  const center = new THREE.Vector3()
  geometry.boundingBox!.getCenter(center)

  return { mesh: bakedMesh, center }
}

/**
 * Project a point radially onto the heart mesh surface.
 * Casts a ray from far outside the mesh toward the center, through the
 * point's radial direction. Returns the hit point offset along the face normal.
 */
export function projectPointToMeshSurface(
  point: THREE.Vector3,
  raycaster: THREE.Raycaster,
  mesh: THREE.Mesh,
  meshCenter: THREE.Vector3,
  normalOffset: number,
): THREE.Vector3 | null {
  const dir = new THREE.Vector3().subVectors(point, meshCenter)
  if (dir.lengthSq() < 0.0001) return null
  dir.normalize()

  // Ray from far outside, pointing inward toward center
  const origin = new THREE.Vector3().addVectors(meshCenter, dir.clone().multiplyScalar(10))
  const rayDir = dir.clone().negate()

  raycaster.set(origin, rayDir)
  const hits = raycaster.intersectObject(mesh, false)

  if (hits.length === 0) return null

  // hits[0] = nearest to ray origin = outer surface
  const hit = hits[0]!
  const surfacePoint = hit.point.clone()

  // Offset along the face normal to lift artery above the surface
  const face = hit.face
  if (face) {
    surfacePoint.addScaledVector(face.normal, normalOffset)
  }

  return surfacePoint
}

/**
 * Build a spline that follows the heart mesh surface.
 *
 * 1. Project control points onto mesh surface
 * 2. Build initial CatmullRom spline
 * 3. Resample densely and re-project (prevents CatmullRom dipping)
 * 4. Build final surface-following spline
 */
export function buildMeshProjectedArterySpline(
  controlPoints: [number, number, number][],
  raycaster: THREE.Raycaster,
  mesh: THREE.Mesh,
  meshCenter: THREE.Vector3,
  normalOffset: number = 0.03,
): THREE.CatmullRomCurve3 {
  // Step 1: project control points onto mesh surface
  const projected: THREE.Vector3[] = controlPoints.map(([x, y, z]) => {
    const pt = new THREE.Vector3(x * ANATOMY_SCALE, y * ANATOMY_SCALE, z * ANATOMY_SCALE)
    return projectPointToMeshSurface(pt, raycaster, mesh, meshCenter, normalOffset) ?? pt
  })

  // Step 2: initial spline through projected control points
  const initial = new THREE.CatmullRomCurve3(projected, false, 'catmullrom', 0.5)

  // Step 3: resample densely and re-project each sample
  const numSamples = Math.max(40, controlPoints.length * 8)
  const resampled: THREE.Vector3[] = []
  for (let i = 0; i <= numSamples; i++) {
    const pt = initial.getPoint(i / numSamples)
    const surfPt = projectPointToMeshSurface(pt, raycaster, mesh, meshCenter, normalOffset)
    resampled.push(surfPt ?? pt)
  }

  // Step 4: final surface-following spline
  return new THREE.CatmullRomCurve3(resampled, false, 'catmullrom', 0.5)
}

/**
 * Build a smooth spline curve from raw control points.
 * Used by 2D views (ProjectedArteries, FluoroCanvas) — original paths, no surface projection.
 */
export function buildArterySpline(controlPoints: [number, number, number][]): THREE.CatmullRomCurve3 {
  const vectors = controlPoints.map(
    ([x, y, z]) => new THREE.Vector3(x * ANATOMY_SCALE, y * ANATOMY_SCALE, z * ANATOMY_SCALE)
  )
  return new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5)
}

/**
 * Build a TubeGeometry with tapering radius along the curve.
 * Three.js TubeGeometry doesn't natively support taper, so we modify
 * the geometry positions after creation.
 */
export function buildTaperedTubeGeometry(
  curve: THREE.CatmullRomCurve3,
  startRadius: number,
  endRadius: number,
  tubularSegments = 64,
  radialSegments = 8,
): THREE.TubeGeometry {
  // Use the average radius to create the initial geometry
  const avgRadius = ((startRadius + endRadius) / 2) * ANATOMY_SCALE * 0.1 // mm to scene units
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, avgRadius, radialSegments, false)

  // Now apply tapering by adjusting radial vertex positions
  const positions = geometry.attributes.position!
  const normals = geometry.attributes.normal!

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments
    const targetRadius = (startRadius + (endRadius - startRadius) * t) * ANATOMY_SCALE * 0.1
    const scaleRatio = targetRadius / avgRadius

    for (let j = 0; j <= radialSegments; j++) {
      const idx = i * (radialSegments + 1) + j
      const px = positions.getX(idx)
      const py = positions.getY(idx)
      const pz = positions.getZ(idx)

      // Get the center point on the curve at this t
      const center = curve.getPoint(t)

      // Scale the radial offset
      const dx = px - center.x
      const dy = py - center.y
      const dz = pz - center.z

      positions.setXYZ(
        idx,
        center.x + dx * scaleRatio,
        center.y + dy * scaleRatio,
        center.z + dz * scaleRatio,
      )

      // Scale normals similarly (they're already unit-ish, just re-normalize)
      const nx = normals.getX(idx)
      const ny = normals.getY(idx)
      const nz = normals.getZ(idx)
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
      if (len > 0) {
        normals.setXYZ(idx, nx / len, ny / len, nz / len)
      }
    }
  }

  positions.needsUpdate = true
  normals.needsUpdate = true
  geometry.computeBoundingSphere()

  return geometry
}
