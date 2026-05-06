import { HEARTBEAT_THRESHOLD } from '../game/systems/battery.js'

// ステータスに応じた目標ヒントテキスト
const OBJECTIVE = {
  normal:   '4F でケーブルを探せ',
  hasCable: 'ケーブル取得！1F 配電盤へ',
  cleared:  '脱出成功',
  badEnd:   'バッテリー切れ',
}

export default function HUD({ battery, floor, status }) {
  const pct        = battery.toFixed(1)
  const isLow      = battery <= HEARTBEAT_THRESHOLD
  const isCritical = battery <= 1.0
  const isCleared  = status === 'cleared'
  const isBadEnd   = status === 'badEnd'

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      fontFamily: 'monospace',
      userSelect: 'none',
      pointerEvents: 'none',
    }}>
      {/* バッテリー残量 */}
      {!isCleared && !isBadEnd && (
        <>
          <div style={{
            fontSize: isCritical ? '22px' : '16px',
            color: isLow ? '#ff3333' : '#aaffaa',
            textShadow: isLow ? '0 0 8px #ff0000' : '0 0 4px #00ff00',
            transition: 'font-size 0.1s',
            animation: isLow ? 'pulse 0.8s ease-in-out infinite' : 'none',
          }}>
            🔋 {pct}%
          </div>

          {/* フロア表示 */}
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
            {floor}F
          </div>

          {/* 目標ヒント */}
          <div style={{
            fontSize: '10px',
            marginTop: 6,
            color: status === 'hasCable' ? '#44aaff' : '#888',
            textShadow: status === 'hasCable' ? '0 0 6px #0088ff' : 'none',
          }}>
            ▶ {OBJECTIVE[status] ?? OBJECTIVE.normal}
          </div>

          {/* 操作ヒント */}
          <div style={{ fontSize: '10px', color: '#333', marginTop: 10 }}>
            [WASD / ↑↓←→] 移動
          </div>
          <div style={{ fontSize: '10px', color: '#333', marginTop: 2 }}>
            [L] ライト　[Shift] 向き固定
          </div>
        </>
      )}

      {/* TODO: Phase 2 Horror Expansion */}
      {/* batteryMax 表示 */}
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
