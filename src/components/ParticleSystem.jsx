import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { useControls } from 'leva'
import { generateShape } from '../utils/shapes'

export default function ParticleSystem() {
  const points = useRef()
  const hand = useStore((state) => state.hand)
  const { viewport } = useThree()
  
  const count = 8000
  
  const { shape, colorA, colorB } = useControls({
    shape: { options: ['cloud', 'sphere', 'galaxy', 'heart', 'ring', 'dna', 'torusKnot', 'pyramid', 'cube'] },
    colorA: '#ff0055',
    colorB: '#0055ff'
  })

  // Target positions (the shape)
  const targetPositions = useMemo(() => {
    return generateShape(shape, count)
  }, [shape, count])

  // Physics state
  const particles = useMemo(() => {
    const p = new Float32Array(count * 3)
    const v = new Float32Array(count * 3) // Velocity
    // Initialize positions randomly
    for(let i=0; i<count*3; i++) {
        p[i] = (Math.random() - 0.5) * 20
    }
    return { positions: p, velocities: v }
  }, [count])

  // Colors
  const colors = useMemo(() => new Float32Array(count * 3), [count])
  const c1 = new THREE.Color()
  const c2 = new THREE.Color()

  useFrame((state, delta) => {
    if (!points.current) return

    c1.set(colorA)
    c2.set(colorB)

    // Hand Inputs
    let hx = 0, hy = 0, hz = 0
    let isHandActive = false
    let pinchStrength = 0
    
    if (hand) {
        isHandActive = true
        // Remap hand (-1..1) to Viewport
        hx = hand.position.x * (viewport.width / 2)
        hy = hand.position.y * (viewport.height / 2)
        hz = 0 // Hand is at Z=0 plane typically
        
        if (hand.gesture === 'pinch') pinchStrength = 1.0
    }

    const positions = points.current.geometry.attributes.position.array
    const colorAttr = points.current.geometry.attributes.color.array

    // Physics Loop
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        
        // Physics State
        let px = particles.positions[i3]
        let py = particles.positions[i3+1]
        let pz = particles.positions[i3+2]
        
        let vx = particles.velocities[i3]
        let vy = particles.velocities[i3+1]
        let vz = particles.velocities[i3+2]

        // 1. Spring force to Target Shape
        let tx = targetPositions[i3]
        let ty = targetPositions[i3+1]
        let tz = targetPositions[i3+2]

        // Noise/Drift
        const time = state.clock.elapsedTime
        tx += Math.sin(time * 0.5 + i) * 0.1
        ty += Math.cos(time * 0.3 + i * 0.5) * 0.1
        
        const dx = tx - px
        const dy = ty - py
        const dz = tz - pz
        
        vx += dx * 2.0 * delta // Spring stiffness
        vy += dy * 2.0 * delta
        vz += dz * 2.0 * delta

        // 2. Hand Interaction
        if (isHandActive) {
            const hdx = hx - px
            const hdy = hy - py
            const hdz = hz - pz
            const distSq = hdx*hdx + hdy*hdy + hdz*hdz
            const dist = Math.sqrt(distSq)
            
            // Repel/Attract radius
            if (dist < 4.0) {
                 const force = (4.0 - dist) * 20.0 * delta
                 
                 if (pinchStrength > 0.5) {
                    // Pinch: Strong Attraction
                    vx += (hdx / dist) * force * 2.0
                    vy += (hdy / dist) * force * 2.0
                    vz += (hdz / dist) * force * 2.0
                 } else if (hand.gesture === 'closed') {
                    // Closed: Gentle Swirl? Or Strong Repel? Let's do Swirl
                    vx += -(hdy / dist) * force * 2.0
                    vy += (hdx / dist) * force * 2.0
                 } else {
                    // Open: Spread/Repel
                    vx -= (hdx / dist) * force * 0.5
                    vy -= (hdy / dist) * force * 0.5
                    vz -= (hdz / dist) * force * 0.5
                 }
            }
        }

        // Damping
        vx *= 0.90
        vy *= 0.90
        vz *= 0.90
        
        // Update Physics
        px += vx
        py += vy
        pz += vz
        
        particles.positions[i3] = px
        particles.positions[i3+1] = py
        particles.positions[i3+2] = pz
        particles.velocities[i3] = vx
        particles.velocities[i3+1] = vy
        particles.velocities[i3+2] = vz

        // Write to geometry
        positions[i3] = px
        positions[i3+1] = py
        positions[i3+2] = pz

        // Color Update
        // Mix based on position or velocity
        const mixFactor = (Math.sin(px * 0.2) + 1) * 0.5
        const r = c1.r * mixFactor + c2.r * (1 - mixFactor)
        const g = c1.g * mixFactor + c2.g * (1 - mixFactor)
        const b = c1.b * mixFactor + c2.b * (1 - mixFactor)
        
        // Boost brightness on fast movement or proximity
        let intensity = 1.0
        if (isHandActive) {
            const hdx = hx - px
            const hdy = hy - py
            const hdz = hz - pz
            const dist = Math.sqrt(hdx*hdx + hdy*hdy + hdz*hdz)
            if (dist < 2.5) intensity = 2.0 + (3.0 - dist)
        }

        colorAttr[i3] = r * intensity
        colorAttr[i3+1] = g * intensity
        colorAttr[i3+2] = b * intensity
    }

    points.current.geometry.attributes.position.needsUpdate = true
    points.current.geometry.attributes.color.needsUpdate = true
    
    // Slow global rotation
    points.current.rotation.y += delta * 0.1
    points.current.rotation.z += delta * 0.05
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        sizeAttenuation
        transparent
        alphaTest={0.01} // Helps with sorting issues slightly
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
