import { HEARTBEAT_THRESHOLD } from '../game/systems/battery.js'

export default function HUD({ battery, batteryMax = 10.0, floor }) {
  const pct = battery.toFixed(1)
  const isLow = battery <= HEARTBEAT_THRESHOLD
  const isCritical = battery <= 1.0
  const isEroded = batteryMax < 10.0 - 0.05  // 浸食されているか

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      fontFamily: 'monospace',
      userSelect: 'none',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontSize: isCritical ? '22px' : '16px',
        color: isLow ? '#ff3333' : '#aaffaa',
        textShadow: isLow ? '0 0 8px #ff0000' : '0 0 4px #00ff00',
        transition: 'font-size 0.1s',
        animation: isLow ? 'pulse 0.8s ease-in-out infinite' : 'none',
      }}>
        🔋 {pct}%
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
        {floor}F
      </div>
      {isEroded && (
        <div style={{ fontSize: '10px', color: '#993333', marginTop: 4, textShadow: '0 0 6px #ff0000' }}>
          MAX {batteryMax.toFixed(1)}%
        </div>
      )}
      <div style={{ fontSize: '10px', color: '#444', marginTop: 8 }}>
        [L] ライト　[Shift] 向き固定
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
