import { Stars, Cloud } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function SpaceEnvironment() {
  const dustRef = useRef()
  
  useFrame((state, delta) => {
      if (dustRef.current) {
          dustRef.current.rotation.y += delta * 0.02
          dustRef.current.rotation.x += delta * 0.01
      }
  })

  return (
    <group>
      {/* Distant Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floating Dust / Debris for Parallax */}
      <points ref={dustRef}>
         <bufferGeometry>
            <bufferAttribute
                attach="attributes-position"
                count={200}
                array={new Float32Array(200 * 3).map(() => (Math.random() - 0.5) * 40)}
                itemSize={3}
            />
         </bufferGeometry>
         <pointsMaterial 
            size={0.2} 
            color="#88ccff" 
            transparent 
            opacity={0.4} 
            blending={THREE.AdditiveBlending}
            sizeAttenuation
         />
      </points>
      
      {/* Subtle Fog for depth */}
      <fog attach="fog" args={['#000000', 10, 50]} />
    </group>
  )
}
