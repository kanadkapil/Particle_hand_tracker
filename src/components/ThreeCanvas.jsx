import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import ParticleSystem from './ParticleSystem'
import DrawingSystem from './DrawingSystem'
import GameManager from './GameManager'
import MirrorSystem from './MirrorSystem'
import { Suspense } from 'react'
import { useStore } from '../store'
import { useControls } from 'leva'

export default function ThreeCanvas() {
  const { bgColor, drawingMode, gameMode, mirrorMode } = useControls({
    bgColor: '#050505',
    drawingMode: false,
    gameMode: false,
    mirrorMode: false
  })
  
  const setGameActive = useStore(s => s.setGameActive)
  if (gameMode !== undefined) setGameActive(gameMode)

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: false, alpha: false, stencil: false, depth: false }}
    >
      <color attach="background" args={[bgColor]} />
      <Suspense fallback={null}>
        {!mirrorMode && <ParticleSystem />}
        {mirrorMode && <MirrorSystem />}
        {drawingMode && <DrawingSystem />}
        {gameMode && <GameManager />}
      </Suspense>
      <OrbitControls makeDefault enabled={!drawingMode} />
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
      </EffectComposer>
    </Canvas>
  )
}
