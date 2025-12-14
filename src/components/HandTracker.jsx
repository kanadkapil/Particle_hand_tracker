import { useEffect, useRef } from 'react'
import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { useStore } from '../store'

export default function HandTracker() {
  const videoRef = useRef(null)
  const setHand = useStore((state) => state.setHand)

  useEffect(() => {
    if (!videoRef.current) return

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      },
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // console.log("Hand detected", results.multiHandLandmarks[0]) // Excessive log
        const landmarks = results.multiHandLandmarks[0]
        
        // Calculate Centroid (approximate)
        let x = 0, y = 0
        landmarks.forEach(l => {
          x += l.x
          y += l.y
        })
        const center = {
          x: (x / landmarks.length - 0.5) * 2, // Normalize -1 to 1 (inverted logic handled in consumer)
          y: -(y / landmarks.length - 0.5) * 2, // Invert Y for Three.js
        }

        // Gesture Detection
        const thumbTip = landmarks[4]
        const indexTip = landmarks[8]
        // Distance is in normalized coordinates (0-1)
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)
        const pinched = pinchDist < 0.05

        // Simple open/closed check (Fingers curled?)
        // Tips below PIP? (In Y-axis, larger Y is lower on screen)
        // 12 (Middle Tip) > 10 (Middle PIP) means tip is lower -> curled
        const isClosed = 
          landmarks[12].y > landmarks[10].y && 
          landmarks[16].y > landmarks[14].y && 
          landmarks[20].y > landmarks[18].y

        setHand({
          position: center, // {x, y}
          gesture: pinched ? 'pinch' : (isClosed ? 'closed' : 'open'),
          pinchDistance: pinchDist
        })
      } else {
        // console.log("No hand")
        setHand(null)
      }
    })

    const videoElement = videoRef.current
    if (!videoElement) return

    let camera = null

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        videoElement.srcObject = stream
        videoElement.onloadedmetadata = () => {
             videoElement.play()
             console.log("Video playing, starting Hands processing")
             camera = new Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({ image: videoElement })
                },
                width: 640,
                height: 480,
             })
             camera.start()
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
      }
    }

    setupCamera()

    return () => {
        const stream = videoElement.srcObject
        if (stream) {
            const tracks = stream.getTracks()
            tracks.forEach(track => track.stop())
        }
    }
  }, [setHand])

  return (
    <video
      ref={videoRef}
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: '200px',
        height: '150px',
        objectFit: 'cover',
        transform: 'scaleX(-1)', // Mirror
        opacity: 0.8,
        borderRadius: '12px',
        zIndex: 100,
        pointerEvents: 'none',
        border: '2px solid rgba(255,255,255,0.2)'
      }}
      playsInline
      muted
    />
  )
}
