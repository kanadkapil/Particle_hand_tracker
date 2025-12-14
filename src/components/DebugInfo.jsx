import { useStore } from '../store'

export default function DebugInfo() {
  const hands = useStore(s => s.hands)
  return (
    <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        zIndex: 9999
    }}>
        Hands: {hands.length}
        {hands.map((h, i) => (
            <div key={i}>
                ID: {h.id} | G: {h.gesture}
            </div>
        ))}
    </div>
  )
}
