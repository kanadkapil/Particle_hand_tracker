import { useEffect, useRef } from 'react'
import { Hands } from '@mediapipe/hands'
import { useStore } from '../store'

export default function HandTracker() {
  const videoRef = useRef(null)
  const setHands = useStore((state) => state.setHands)
  const requestRef = useRef()

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      },
    })

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const newHands = results.multiHandLandmarks.map((landmarks, index) => {
            let x = 0, y = 0
            landmarks.forEach(l => {
                x += l.x
                y += l.y
            })
            const center = {
                x: (x / landmarks.length - 0.5) * 2,
                y: -(y / landmarks.length - 0.5) * 2,
            }

            const thumbTip = landmarks[4]
            const indexTip = landmarks[8]
            const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)
            const pinched = pinchDist < 0.05
            
            const isClosed = 
                landmarks[12].y > landmarks[10].y && 
                landmarks[16].y > landmarks[14].y && 
                landmarks[20].y > landmarks[18].y

            return {
                id: index,
                position: center,
                gesture: pinched ? 'pinch' : (isClosed ? 'closed' : 'open'),
                pinchDistance: pinchDist
            }
        })
        setHands(newHands)
      } else {
        setHands([])
      }
    })

    const predict = async () => {
        if (videoElement && videoElement.readyState === 4) {
             // Only predict if video is playing
             if (!videoElement.paused && !videoElement.ended) {
                try {
                    await hands.send({ image: videoElement })
                } catch (err) {
                    console.error("MP Error", err)
                }
             }
        }
        requestRef.current = requestAnimationFrame(predict)
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, facingMode: "user" } 
            })
            videoElement.srcObject = stream
            videoElement.onloadedmetadata = () => {
                videoElement.play().then(() => {
                    requestRef.current = requestAnimationFrame(predict)
                }).catch(e => console.error("Play error", e))
            }
        } catch (e) {
            console.error("Camera Error:", e)
        }
    }

    startCamera()

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
        hands.close()
        const stream = videoElement.srcObject
        if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [setHands])

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
