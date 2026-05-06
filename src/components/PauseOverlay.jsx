import { useEffect, useState } from 'react'

// 操作方法の内容（TitleScreen と共通）
const CONTROLS = [
  { key: 'WASD / ↑↓←→',        desc: '移動' },
  { key: 'L',                    desc: 'ライト ON / OFF' },
  { key: 'Shift（押しっぱなし）', desc: 'ライトの向きを固定' },
  { key: 'R',                    desc: 'リスタート（ゲームオーバー後）' },
  { key: 'Esc',                  desc: 'ポーズ / メニュー' },
]

export default function PauseOverlay({ onResume, onExitTitle }) {
  const [page, setPage] = useState('pause')  // 'pause' | 'controls'

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape')                        { page === 'controls' ? setPage('pause') : onResume(); return }
      if (e.key === 'Backspace' && page === 'controls') { setPage('pause'); return }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [page, onResume])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(4,3,6,0.78)',
      backdropFilter: 'blur(2px)',
      fontFamily: 'monospace',
      userSelect: 'none',
      zIndex: 10,
    }}>
      {page === 'pause' ? (
        <PauseMenu onResume={onResume} onControls={() => setPage('controls')} onExitTitle={onExitTitle} />
      ) : (
        <ControlsPage onBack={() => setPage('pause')} />
      )}
    </div>
  )
}

function PauseMenu({ onResume, onControls, onExitTitle }) {
  const items = [
    { label: 'ゲームに戻る',  action: onResume,    color: '#aaffaa', glow: '#00ff00' },
    { label: '操作方法',      action: onControls,  color: '#aaaaff', glow: '#4444ff' },
    { label: 'タイトルへ戻る', action: onExitTitle, color: '#ff8888', glow: '#ff2222' },
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: '#443322', letterSpacing: '4px', marginBottom: 28 }}>
        ── PAUSED ──
      </div>
      {items.map(({ label, action, color, glow }) => (
        <button
          key={label}
          onClick={action}
          style={{
            display: 'block',
            width: '220px',
            margin: '0 auto 14px',
            padding: '12px 0',
            background: 'transparent',
            border: `1px solid ${color}33`,
            borderRadius: '2px',
            color,
            fontSize: '15px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            transition: 'all 0.15s',
            textShadow: `0 0 0px ${glow}`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${color}18`
            e.currentTarget.style.borderColor = color
            e.currentTarget.style.textShadow = `0 0 10px ${glow}`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = `${color}33`
            e.currentTarget.style.textShadow = `0 0 0px ${glow}`
          }}
        >
          {label}
        </button>
      ))}
      <div style={{ marginTop: 18, fontSize: '10px', color: '#333' }}>
        Esc でゲームに戻る
      </div>
    </div>
  )
}

function ControlsPage({ onBack }) {
  return (
    <div style={{ width: '440px' }}>
      <div style={{ textAlign: 'center', fontSize: '14px', color: '#c8b89a', marginBottom: 24, letterSpacing: '3px' }}>
        ── 操作方法 ──
      </div>
      {CONTROLS.map(({ key, desc }) => (
        <div key={key} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid rgba(80,70,60,0.3)',
          gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: '#ffee88', whiteSpace: 'nowrap' }}>[ {key} ]</span>
          <span style={{ fontSize: '12px', color: '#999' }}>{desc}</span>
        </div>
      ))}
      <div style={{ marginTop: 20, fontSize: '11px', color: '#443', textAlign: 'center' }}>
        ・バッテリーが時間制限。ライトONで消費増。
      </div>
      <div style={{ fontSize: '11px', color: '#443', textAlign: 'center', marginTop: 6 }}>
        ・影に触れるとバッテリー減 &amp; スタート地点に戻る。
      </div>
      <div style={{ fontSize: '11px', color: '#443', textAlign: 'center', marginTop: 6 }}>
        ・4F でケーブルを入手 → 1F の出口へ。
      </div>
      <button
        onClick={onBack}
        style={{
          display: 'block', margin: '24px auto 0', padding: '10px 28px',
          background: 'transparent', border: '1px solid #44444488',
          color: '#777', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#aaa' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#777'; e.currentTarget.style.borderColor = '#44444488' }}
      >
        ← 戻る
      </button>
    </div>
  )
}
