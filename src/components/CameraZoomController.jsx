import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'

export default function CameraZoomController() {
  const hands = useStore((state) => state.hands)
  const { camera } = useThree()
  
  useFrame((state, delta) => {
    let zoomIn = false
    let zoomOut = false
    
    // Check if any hand is doing the gesture
    for (let hand of hands) {
        if (hand.gesture === 'thumbs_up') zoomIn = true
        if (hand.gesture === 'thumbs_down') zoomOut = true
    }

    const speed = 10.0 * delta
    const currentZ = camera.position.z
    const minZ = 2
    const maxZ = 20

    if (zoomIn && currentZ > minZ) {
        camera.position.z = THREE.MathUtils.lerp(currentZ, currentZ - speed, 0.1)
    }
    if (zoomOut && currentZ < maxZ) {
        camera.position.z = THREE.MathUtils.lerp(currentZ, currentZ + speed, 0.1)
    }
  })

  return null
}
