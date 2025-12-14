import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export default function MirrorSystem() {
  const points = useRef()
  const hands = useStore((state) => state.hands)
  const { viewport } = useThree()
  
  // Grid resolution
  const width = 100
  const height = 75
  const count = width * height
  
  // Webcam Texture
  const videoTexture = useRef()

  useEffect(() => {
    // Access the shared video element if possible, or create new stream.
    // For simplicity, we create a new texture from the existing video element used in HandTracker 
    // BUT HandTracker hides it. 
    // Strategy: We'll assume the browser allows a new getUserMedia or we try to find the hidden video.
    // Better: HandTracker should probably lift the video element or stream ref to store.
    // Workaround: Quick new stream.
    const vid = document.createElement('video')
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } }).then(stream => {
        vid.srcObject = stream
        vid.play()
    })
    
    videoTexture.current = new THREE.VideoTexture(vid)
    return () => {
        const stream = vid.srcObject
        if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Initial Grid Positions
  const { positions, uvs } = useMemo(() => {
    const p = new Float32Array(count * 3)
    const u = new Float32Array(count * 2)
    
    // Fill grid
    for(let y=0; y<height; y++) {
        for(let x=0; x<width; x++) {
            const i = (y * width) + x
            // Spread across viewport
            // X: -width/2 to width/2
            // Y: -height/2 to height/2
            p[i*3] = (x / width - 0.5) * viewport.width
            p[i*3+1] = -(y / height - 0.5) * viewport.height // Invert Y
            p[i*3+2] = 0
            
            u[i*2] = x / width
            u[i*2+1] = 1.0 - (y / height) // Flip UV Y
        }
    }
    
    return { positions: p, uvs: u }
  }, [viewport])
  
  // Physics (Displacement)
  const currentPositions = useMemo(() => new Float32Array(positions), [positions])

  useFrame((state, delta) => {
    if (!points.current || !videoTexture.current) return
    if (videoTexture.current.image.readyState === videoTexture.current.image.HAVE_ENOUGH_DATA) {
        videoTexture.current.needsUpdate = true
    }
    
    // Displacement Logic
    // Reset to grid
    for(let i=0; i<count; i++) {
        const i3 = i*3
        let px = currentPositions[i3]
        let py = currentPositions[i3+1]
        let pz = currentPositions[i3+2]
        
        let tx = positions[i3]
        let ty = positions[i3+1]
        let tz = positions[i3+2]
        
        // Hand Repulsion
        hands.forEach(hand => {
            const hx = hand.position.x * (viewport.width / 2)
            const hy = hand.position.y * (viewport.height / 2)
            const hz = 0
            
            const dx = hx - px
            const dy = hy - py
            const dist = Math.sqrt(dx*dx + dy*dy)
            
            if (dist < 2.0) {
                // Push away
                const force = (2.0 - dist) * 5.0
                tx -= (dx / dist) * force
                ty -= (dy / dist) * force
                tz -= 2.0 * force // Push back in Z
            }
        })

        // Spring back
        px += (tx - px) * 5.0 * delta
        py += (ty - py) * 5.0 * delta
        pz += (tz - pz) * 5.0 * delta
        
        currentPositions[i3] = px
        currentPositions[i3+1] = py
        currentPositions[i3+2] = pz
    }
    
    points.current.geometry.attributes.position.needsUpdate = true
  })

  // Shader to use video texture for color
  const material = useMemo(() => {
      // Basic PointsMaterial map doesn't map UVs per particle easily without custom shader
      // We will use standard PointsMaterial and set color based on UV in vertex shader?
      // Actually, PointsMaterial map applies to the point sprite, NOT sampling the texture based on point position.
      // We need a custom ShaderMaterial.
      
      return new THREE.ShaderMaterial({
          uniforms: {
              uTexture: { value: videoTexture.current },
              uTime: { value: 0 }
          },
          vertexShader: `
            attribute vec2 uvGrid;
            varying vec2 vUv;
            void main() {
                vUv = uvGrid;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 6.0 * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
                vec4 color = texture2D(uTexture, vUv);
                if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard; // Circle
                gl_FragColor = color;
            }
          `,
          transparent: true,
          depthWrite: false
      })
  }, [])
  
  // Update uniform ref
  useFrame(() => {
      if (material.uniforms.uTexture.value !== videoTexture.current) {
          material.uniforms.uTexture.value = videoTexture.current
      }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute 
            attach="attributes-uvGrid"
            count={count}
            array={uvs}
            itemSize={2}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}
