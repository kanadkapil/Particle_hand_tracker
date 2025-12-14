import { useStore } from '../store'

export default function InstructionsOverlay() {
  const gameActive = useStore(s => s.gameActive)
  const gameScore = useStore(s => s.gameScore)

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      padding: '24px',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      color: '#fff',
      fontFamily: '"Inter", sans-serif',
      maxWidth: '320px',
      pointerEvents: 'none',
      userSelect: 'none',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    }}>
      {gameActive && (
          <div style={{
              position: 'absolute',
              top: -60,
              left: 0,
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#ff3333',
              textShadow: '0 0 10px red'
          }}>
              SCORE: {gameScore}
          </div>
      )}

      <h2 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '1.2rem', 
        fontWeight: '600',
        background: 'linear-gradient(90deg, #fff, #aaa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Gesture Controls
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <InstructionItem 
          icon="✋" 
          action="Move Hand" 
          desc="Control position" 
        />
        <InstructionItem 
          icon="👌" 
          action="Pinch" 
          desc="Implode (Attract)" 
          highlight="#ff5555"
        />
        <InstructionItem 
          icon="✊" 
          action="Closed Fist" 
          desc="Swirl Vortex" 
          highlight="#aa55ff"
        />
        <InstructionItem 
          icon="🖐️" 
          action="Open Palm" 
          desc="Repel Particles" 
        />
      </div>

      <div style={{ 
        marginTop: '20px', 
        fontSize: '0.75rem', 
        opacity: 0.5, 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '12px'
      }}>
        Use Top-Right panel to change shapes ↗
      </div>
    </div>
  )
}

function InstructionItem({ icon, action, desc, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: '500', color: highlight || '#fff' }}>{action}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{desc}</div>
      </div>
    </div>
  )
}
