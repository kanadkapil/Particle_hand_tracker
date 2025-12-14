import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export default function GameManager() {
  const hands = useStore((state) => state.hands)
  const setGameScore = useStore((state) => state.setGameScore)
  const { viewport } = useThree()
  
  const enemies = useRef([]) // Array of { pos: Vector3, active: bool }
  const enemySpeed = 2.0
  const spawnRate = 0.02
  
  // Instance Mesh for performance
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Initialize pool
  const maxEnemies = 50
  useMemo(() => {
     enemies.current = new Array(maxEnemies).fill(0).map(() => ({
         pos: new THREE.Vector3(0,0,-50), // Far away initially
         active: false,
         color: new THREE.Color('red')
     }))
  }, [])

  useFrame((state, delta) => {
     if (!meshRef.current) return

     // Spawn
     if (Math.random() < spawnRate) {
         const enemy = enemies.current.find(e => !e.active)
         if (enemy) {
             enemy.active = true
             enemy.pos.set(
                 (Math.random() - 0.5) * viewport.width * 1.5,
                 (Math.random() - 0.5) * viewport.height * 1.5,
                 -15 // Spawn depth
             )
         }
     }

     // Update & Collision
     let scoreInc = 0
     
     enemies.current.forEach((enemy, i) => {
         if (!enemy.active) {
             dummy.scale.set(0,0,0)
             dummy.updateMatrix()
             meshRef.current.setMatrixAt(i, dummy.matrix)
             return
         }

         // Move forward
         enemy.pos.z += enemySpeed * delta
         
         // Collision with Hand
         let hit = false
         for (let hand of hands) {
             const hPos = new THREE.Vector3(
                 hand.position.x * (viewport.width / 2),
                 hand.position.y * (viewport.height / 2),
                 0
             )
             if (hPos.distanceTo(enemy.pos) < 1.0) {
                 hit = true
                 break
             }
         }

         if (hit) {
             enemy.active = false
             scoreInc += 10
             // Visual pop?
         } else if (enemy.pos.z > 2) {
             // Past camera
             enemy.active = false
         }
         
         dummy.position.copy(enemy.pos)
         dummy.scale.set(1,1,1)
         dummy.rotation.x += delta
         dummy.rotation.y += delta
         dummy.updateMatrix()
         meshRef.current.setMatrixAt(i, dummy.matrix)
     })
     
     if (scoreInc > 0) {
         setGameScore(prev => prev + scoreInc)
     }

     meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, maxEnemies]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={2} />
    </instancedMesh>
  )
}
