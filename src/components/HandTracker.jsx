import { useEffect, useRef } from 'react'
// import { Hands } from '@mediapipe/hands' // Scripts loaded in index.html
import { useStore } from '../store'

export default function HandTracker() {
  const videoRef = useRef(null)
  const setHands = useStore((state) => state.setHands)
  const setTrackerStatus = useStore((state) => state.setTrackerStatus)
  const requestRef = useRef()

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (setTrackerStatus) setTrackerStatus("Waiting for MediaPipe...")

    let hands = null
    let cameraStream = null
    const pollInterval = setInterval(() => {
        if (window.Hands) {
            clearInterval(pollInterval)
            initHands()
        }
    }, 100)

    const initHands = () => {
        if (setTrackerStatus) setTrackerStatus("Initializing Tracker...")
        try {
            hands = new window.Hands({
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
            
            hands.onResults(onResults)
            startCamera()
        } catch (err) {
            console.error(err)
            if (setTrackerStatus) setTrackerStatus(`Init Error: ${err.message}`)
        }
    }

    const onResults = (results) => {
      if (setTrackerStatus) setTrackerStatus("Tracking Active - OK")
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        if (setTrackerStatus) setTrackerStatus(`Hands Detected: ${results.multiHandLandmarks.length}`)
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
            const middleTip = landmarks[12]
            const ringTip = landmarks[16]
            const pinkyTip = landmarks[20]

            const thumbIP = landmarks[3] // Thumb IP joint
            const indexPIP = landmarks[6]
            const middlePIP = landmarks[10]
            const ringPIP = landmarks[14]
            const pinkyPIP = landmarks[18]

            const indexCurled = indexTip.y > indexPIP.y
            const middleCurled = middleTip.y > middlePIP.y
            const ringCurled = ringTip.y > ringPIP.y
            const pinkyCurled = pinkyTip.y > pinkyPIP.y

            // Improved Thumb Detection
            // We use the Wrist (0) as a reference point to determine hand orientation
            const wrist = landmarks[0]
            const thumbMCP = landmarks[2]
            
            // Check general hand orientation (upright vs inverted)
            const isHandUpright = wrist.y > middlePIP.y 
            const isHandInverted = wrist.y < middlePIP.y

            // Thumb states relative to knuckles
            const thumbIsHigh = thumbTip.y < thumbMCP.y
            const thumbIsLow = thumbTip.y > thumbMCP.y
            
            // Strict Thumbs Up: Hand is upright, fingers curled, thumb matches
            // Strict Thumbs Down: Hand might be rotated, but mainly thumb tip is clearly below
            
            const fingersCurled = indexCurled && middleCurled && ringCurled && pinkyCurled
            
            let gesture = 'open'

            const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)
            
            if (pinchDist < 0.05) {
                gesture = 'pinch'
            } else if (fingersCurled) {
                // Thumbs Up: Thumb tip is ABOVE thumb joint, and generic 'up'
                if (thumbIsHigh && thumbTip.y < middlePIP.y) {
                     gesture = 'thumbs_up'
                } 
                // Thumbs Down: Thumb tip is BELOW thumb joint, and significantly low
                else if (thumbIsLow && thumbTip.y > middlePIP.y + 0.05) {
                     gesture = 'thumbs_down'
                } else {
                     gesture = 'closed'
                }
            } else if (!indexCurled && !middleCurled && ringCurled && pinkyCurled) {
                gesture = 'victory' 
            } else if (!indexCurled && middleCurled && ringCurled && pinkyCurled) {
                gesture = 'pointing'
            } else {
                gesture = 'open'
            }

            return {
                id: index,
                position: center,
                gesture: gesture,
                pinchDistance: pinchDist
            }
        })
        setHands(newHands)
      } else {
        setHands([])
      }
    }

    const predict = async () => {
        if (videoElement && videoElement.readyState === 4) {
             if (!videoElement.paused && !videoElement.ended) {
                try {
                    if(hands) await hands.send({ image: videoElement })
                } catch (err) {
                    console.error("MP Error", err)
                    if (setTrackerStatus) setTrackerStatus(`MediaPipe Error: ${err.message}`)
                }
             }
        }
        requestRef.current = requestAnimationFrame(predict)
    }

    const startCamera = async () => {
        if (setTrackerStatus) setTrackerStatus("Requesting Camera (Any)...")
        try {
            // Simplified constraints
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            })
            cameraStream = stream
            videoElement.srcObject = stream
            videoElement.onloadedmetadata = () => {
                if (setTrackerStatus) setTrackerStatus("Video Ready. Starting Loop...")
                videoElement.play().then(() => {
                    requestRef.current = requestAnimationFrame(predict)
                }).catch(e => {
                    console.error("Play error", e)
                    if (setTrackerStatus) setTrackerStatus(`Play Error: ${e.message}`)
                })
            }
        } catch (e) {
            console.error("Camera Error:", e)
            if (setTrackerStatus) setTrackerStatus(`Camera Error: ${e.message}. Check browser permissions.`)
        }
    }

    // Cleanup
    return () => {
        clearInterval(pollInterval)
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
        if (hands) hands.close()
        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop())
        else if (videoElement.srcObject) {
             videoElement.srcObject.getTracks().forEach(t => t.stop())
        }
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
