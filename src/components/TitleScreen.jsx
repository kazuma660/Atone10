import { useState } from 'react'

// 操作方法の内容
const CONTROLS = [
  { key: 'WASD / ↑↓←→',          desc: '移動' },
  { key: 'L',                      desc: 'ライト ON / OFF' },
  { key: 'Shift（押しっぱなし）',   desc: 'ライトの向きを固定' },
  { key: 'R',                      desc: 'リスタート（ゲームオーバー後）' },
  { key: 'Esc',                    desc: 'ポーズ / メニュー' },
]

// ── タイトル画面
function TitlePage({ onStart, onControls }) {
  return (
    <div
      onClick={onStart}
      style={{
        width: '100%', height: '100%',
        background: '#08070a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'serif',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* スキャンライン */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 4px)',
        pointerEvents: 'none',
      }} />

      {/* メインタイトル */}
      <div style={{
        fontSize: 'clamp(48px, 8vw, 80px)',
        fontWeight: 'bold',
        color: '#e8e0d0',
        letterSpacing: '12px',
        marginBottom: '12px',
        textShadow: '0 0 40px rgba(200,180,140,0.3)',
      }}>
        ATONE
      </div>

      {/* サブタイトル 10% */}
      <div style={{
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        color: '#dc2828',
        textShadow: '0 0 20px rgba(220,0,0,0.7)',
        marginBottom: '28px',
        animation: 'redPulse 2s ease-in-out infinite',
      }}>
        10%
      </div>

      {/* キャッチコピー */}
      <div style={{
        fontSize: 'clamp(11px, 1.5vw, 14px)',
        fontFamily: 'monospace',
        color: '#887866',
        marginBottom: '48px',
        letterSpacing: '1px',
      }}>
        バッテリーが尽きる前に、脱出しろ。
      </div>

      {/* スタートボタン */}
      <div
        style={{
          fontSize: 'clamp(13px, 1.6vw, 15px)',
          fontFamily: 'monospace',
          color: '#cccccc',
          border: '1px solid rgba(200,200,200,0.25)',
          padding: '14px 36px',
          marginBottom: '20px',
          transition: 'all 0.15s',
          animation: 'blink 1.8s ease-in-out infinite',
        }}
        onMouseEnter={e => {
          e.stopPropagation()
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.borderColor = '#ffffff'
          e.currentTarget.style.color = '#ffffff'
          e.currentTarget.style.textShadow = '0 0 12px rgba(255,255,255,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(200,200,200,0.25)'
          e.currentTarget.style.color = '#cccccc'
          e.currentTarget.style.textShadow = 'none'
        }}
      >
        ▶　ゲームスタート　( any key )
      </div>

      {/* 操作方法ボタン */}
      <div
        onClick={e => { e.stopPropagation(); onControls() }}
        style={{
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#555',
          cursor: 'pointer',
          padding: '6px 16px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#aaaaff' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
      >
        [ H ] 操作方法
      </div>

      <style>{`
        @keyframes redPulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(220,0,0,0.7); }
          50% { opacity: 0.85; text-shadow: 0 0 36px rgba(220,0,0,1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </div>
  )
}

// ── 操作方法画面
function ControlsPage({ onBack }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#08070a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
      userSelect: 'none',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 4px)',
        pointerEvents: 'none',
      }} />

      <div style={{ fontSize: '18px', color: '#c8b89a', marginBottom: '32px', letterSpacing: '4px' }}>
        ── 操作方法 ──
      </div>

      <div style={{ width: '400px', marginBottom: '32px' }}>
        {CONTROLS.map(({ key, desc }) => (
          <div key={key} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid rgba(80,70,60,0.3)',
          }}>
            <span style={{ fontSize: '12px', color: '#ffee88' }}>[ {key} ]</span>
            <span style={{ fontSize: '12px', color: '#999' }}>{desc}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', color: '#443322', marginBottom: '6px' }}>・バッテリーが時間制限。ライトONで消費増。</div>
      <div style={{ fontSize: '11px', color: '#443322', marginBottom: '6px' }}>・影に触れるとバッテリー減 &amp; スタート地点に戻る。</div>
      <div style={{ fontSize: '11px', color: '#443322', marginBottom: '32px' }}>・4F でケーブルを入手 → 1F の出口へ。</div>

      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: '1px solid #33333388',
          color: '#666', fontSize: '13px', fontFamily: 'monospace',
          padding: '10px 28px', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#aaa' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#33333388' }}
      >
        ← タイトルに戻る
      </button>
    </div>
  )
}

// ── エクスポート
export default function TitleScreen({ onStart }) {
  const [page, setPage] = useState('title')

  // キーボード対応
  const handleKeyDown = (e) => {
    if (page === 'title') {
      if (e.key === 'h' || e.key === 'H') { setPage('controls'); return }
      onStart()
    } else {
      if (e.key === 'Escape' || e.key === 'Backspace') setPage('title')
    }
  }

  return (
    <div
      style={{ width: '100%', height: '100%', outline: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={el => el?.focus()}
    >
      {page === 'title'
        ? <TitlePage onStart={onStart} onControls={() => setPage('controls')} />
        : <ControlsPage onBack={() => setPage('title')} />
      }
    </div>
  )
}
