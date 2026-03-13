import { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export type HeartStyle = 'realistic' | 'ghost' | 'clay' | 'flat' | 'wireframe' | 'toon'

interface HeartGLTFProps {
  style?: HeartStyle
  hoveredSegmentId: string | null
  selectedSegmentId: string | null
  onHoverSegment: (id: string | null) => void
  onClickSegment: (id: string) => void
}

export function HeartGLTF({
  style = 'realistic',
  hoveredSegmentId: _hoveredSegmentId,
  selectedSegmentId: _selectedSegmentId,
  onHoverSegment: _onHoverSegment,
  onClickSegment: _onClickSegment,
}: HeartGLTFProps) {
  const { scene } = useGLTF('/models/heart/scene.gltf')

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geo = child.geometry as THREE.BufferGeometry

        switch (style) {
          case 'ghost':
            geo.computeVertexNormals()
            child.material = new THREE.MeshStandardMaterial({
              color: '#8090a8',
              transparent: true,
              opacity: 0.18,
              side: THREE.DoubleSide,
              roughness: 1,
              metalness: 0,
              depthWrite: false,
            })
            break

          case 'clay':
            geo.computeVertexNormals()
            child.material = new THREE.MeshStandardMaterial({
              color: '#c4a0a0',
              roughness: 0.9,
              metalness: 0,
              side: THREE.DoubleSide,
            })
            break

          case 'flat':
            // Skip computeVertexNormals — flatShading uses face normals
            child.material = new THREE.MeshStandardMaterial({
              color: '#b89898',
              roughness: 0.85,
              metalness: 0,
              side: THREE.DoubleSide,
              flatShading: true,
            })
            break

          case 'wireframe': {
            geo.computeVertexNormals()
            // Subtle transparent fill
            child.material = new THREE.MeshStandardMaterial({
              color: '#6878a0',
              transparent: true,
              opacity: 0.08,
              side: THREE.DoubleSide,
              depthWrite: false,
              roughness: 1,
              metalness: 0,
            })
            // Edge lines overlay (cleaner than wireframe — only shows angles > 15°)
            const edges = new THREE.EdgesGeometry(geo, 15)
            const lineMat = new THREE.LineBasicMaterial({
              color: '#4a6080',
              transparent: true,
              opacity: 0.4,
            })
            const lineSegments = new THREE.LineSegments(edges, lineMat)
            child.add(lineSegments)
            break
          }

          case 'toon':
            geo.computeVertexNormals()
            child.material = new THREE.MeshToonMaterial({
              color: '#d4a8a8',
              side: THREE.DoubleSide,
            })
            break

          default: {
            // 'realistic' — keep original PBR materials
            geo.computeVertexNormals()
            if (child.material) {
              const mat = (child.material as THREE.MeshStandardMaterial).clone()
              mat.side = THREE.DoubleSide
              child.material = mat
            }
            break
          }
        }
      }
    })
    return clone
  }, [scene, style])

  return <primitive object={clonedScene} scale={2.2} />
}

useGLTF.preload('/models/heart/scene.gltf')
