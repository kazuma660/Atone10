import { HEARTBEAT_THRESHOLD } from '../game/systems/battery.js'

export default function HUD({ battery, floor, status }) {
  const pct        = battery.toFixed(1)
  const isLow      = battery <= HEARTBEAT_THRESHOLD
  const isCritical = battery <= 1.0
  const isCleared  = status === 'cleared'
  const isBadEnd   = status === 'badEnd'

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      fontFamily: 'monospace',
      userSelect: 'none',
      pointerEvents: 'none',
      textAlign: 'right',
    }}>
      {!isCleared && !isBadEnd && (
        <>
          {/* バッテリー残量 */}
          <div style={{
            fontSize: isCritical ? '30px' : '24px',
            color: isLow ? '#ff3333' : '#aaffaa',
            textShadow: isLow ? '0 0 10px #ff0000' : '0 0 6px #00ff00',
            transition: 'font-size 0.1s',
            animation: isLow ? 'pulse 0.8s ease-in-out infinite' : 'none',
            letterSpacing: '1px',
          }}>
            🔋 {pct}%
          </div>

          {/* フロア表示 */}
          <div style={{ fontSize: '16px', color: '#666', marginTop: 6 }}>
            {floor}F
          </div>
        </>
      )}

      {/* TODO: Phase 2 Horror Expansion */}
      {/* {isEroded && <div style={{ color: '#993333' }}>MAX {batteryMax.toFixed(1)}%</div>} */}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
