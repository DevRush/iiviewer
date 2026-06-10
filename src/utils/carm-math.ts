import * as THREE from 'three'

/**
 * Convert C-arm angles to a camera position in 3D space.
 *
 * The patient lies supine with heart at origin.
 * Coordinate system:
 *   X+ = patient's left
 *   Y+ = superior (cranial)
 *   Z+ = anterior (toward ceiling / toward the detector in AP view)
 *
 * AP view (0,0) = camera at (0, 0, +d), looking at origin.
 *
 * @param raoLao Degrees. Negative = RAO (camera toward patient's right = -X).
 *               Positive = LAO (camera toward patient's left = +X).
 * @param cranialCaudal Degrees. Positive = cranial (camera tilts toward head = +Y).
 *                      Negative = caudal (camera tilts toward feet = -Y).
 * @param distance Distance from isocenter to camera.
 */
export function anglesToPosition(
  raoLao: number,
  cranialCaudal: number,
  distance: number,
): THREE.Vector3 {
  const alpha = THREE.MathUtils.degToRad(raoLao)
  const beta = THREE.MathUtils.degToRad(cranialCaudal)

  // Spherical conversion: start at (0, 0, d) for AP, rotate by alpha around Y, then beta
  const x = distance * Math.sin(alpha) * Math.cos(beta)
  const y = distance * Math.sin(beta)
  const z = distance * Math.cos(alpha) * Math.cos(beta)

  return new THREE.Vector3(x, y, z)
}

const DEG2RAD = Math.PI / 180

export interface CameraBasis {
  /** Viewing direction: from the detector toward isocenter (the central X-ray ray). */
  forward: [number, number, number]
  /** Screen-right axis in world space. */
  right: [number, number, number]
  /** Screen-up axis in world space. */
  up: [number, number, number]
}

/**
 * Orthonormal camera basis for the C-arm at the given angles.
 *
 * Single source of truth shared by the 2D fluoro projection (`FluoroCanvas`)
 * and the geometry-derived view-quality engine (`view-quality.ts`).
 *
 * Validated against DICOM/clinical handedness: patient-left (+X) projects to
 * screen-right, cranial (+Y) projects up. The image-plane projection of a point
 * p is: screenX = dot(p, right); screenY = -dot(p, up) (canvas Y grows downward).
 */
export function computeCameraBasis(raoLao: number, cranialCaudal: number): CameraBasis {
  const alpha = raoLao * DEG2RAD
  const beta = cranialCaudal * DEG2RAD

  // Camera position (latitude–longitude spherical coords)
  const camX = Math.sin(alpha) * Math.cos(beta)
  const camY = Math.sin(beta)
  const camZ = Math.cos(alpha) * Math.cos(beta)

  // Forward = -normalize(camera) — camera sits on the detector side, looks at isocenter
  const fx = -camX, fy = -camY, fz = -camZ

  // World up — handle poles (steep cranial/caudal at AP)
  let ux = 0, uy = 1, uz = 0
  const dotFU = fx * ux + fy * uy + fz * uz
  if (Math.abs(dotFU) > 0.999) { ux = 0; uy = 0; uz = -1 }

  // Right = forward × worldUp
  let rx = fy * uz - fz * uy
  let ry = fz * ux - fx * uz
  let rz = fx * uy - fy * ux
  const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
  rx /= rLen; ry /= rLen; rz /= rLen

  // Up = right × forward
  const upx = ry * fz - rz * fy
  const upy = rz * fx - rx * fz
  const upz = rx * fy - ry * fx

  return {
    forward: [fx, fy, fz],
    right: [rx, ry, rz],
    up: [upx, upy, upz],
  }
}
