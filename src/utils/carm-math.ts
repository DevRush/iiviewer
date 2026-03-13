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
