import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import ParticleSystem from './ParticleSystem'
import { Suspense } from 'react'

export default function ThreeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: false, alpha: false, stencil: false, depth: false }}
    >
      <color attach="background" args={['#050505']} />
      <Suspense fallback={null}>
        <ParticleSystem />
      </Suspense>
      <OrbitControls makeDefault />
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
      </EffectComposer>
    </Canvas>
  )
}
