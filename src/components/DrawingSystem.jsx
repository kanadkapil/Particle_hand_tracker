import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { Line } from '@react-three/drei'

export default function DrawingSystem() {
  const hands = useStore((state) => state.hands)
  const { viewport } = useThree()
  const [lines, setLines] = useState([]) // Array of arrays of points
  const currentLineRef = useRef([]) 
  const isDrawingRef = useRef(false)

  useFrame(() => {
    // Check if any hand is pinching (Drawing Mode)
    const pinchingHand = hands.find(h => h.gesture === 'pinch')
    
    if (pinchingHand) {
        const x = pinchingHand.position.x * (viewport.width / 2)
        const y = pinchingHand.position.y * (viewport.height / 2)
        const z = 0
        
        if (!isDrawingRef.current) {
            // Start new line
            isDrawingRef.current = true
            currentLineRef.current = [new THREE.Vector3(x, y, z)]
        } else {
            // Add point to current line
            const last = currentLineRef.current[currentLineRef.current.length - 1]
            if (last.distanceTo(new THREE.Vector3(x, y, z)) > 0.05) {
                currentLineRef.current.push(new THREE.Vector3(x, y, z))
            }
        }
    } else {
        // Stop drawing
        if (isDrawingRef.current) {
            isDrawingRef.current = false
            if (currentLineRef.current.length > 2) {
                setLines(prev => [...prev, [...currentLineRef.current]])
            }
            currentLineRef.current = []
        }
    }
  })

  // Render finalized lines + current line
  // Optimized: We construct geometry or use Line component
  // Note: Creating new geometries every frame is bad. 
  // For 'currentLine', we should update a buffer geometry.
  // For simplicity MVP: Using Drei Line which handles updates reasonably well for small point counts.

  return (
    <group>
      {lines.map((points, i) => (
        <Line 
            key={i} 
            points={points} 
            color="#ff0088" 
            lineWidth={3} 
            opacity={0.8} 
            transparent 
        />
      ))}
      {isDrawingRef.current && currentLineRef.current.length > 1 && (
         <Line 
            points={currentLineRef.current} 
            color="#ffff00" 
            lineWidth={4} 
         />
      )}
    </group>
  )
}
