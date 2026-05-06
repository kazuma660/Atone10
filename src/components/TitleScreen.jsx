import { useEffect, useRef, useState } from 'react'

function _drawNoise(ctx, w, h) {
  const img = ctx.createImageData(w, h)
  const d   = img.data
  for (let i = 0; i < d.length; i += 4) {
    if (Math.random() < 0.05) {
      const v = Math.random() * 70 | 0
      d[i] = d[i+1] = d[i+2] = v
      d[i+3] = 60
    }
  }
  ctx.putImageData(img, 0, 0)
}

// ── タイトル画面
function TitleCanvas({ onStart, onControls }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let t = 0

    const draw = (ts) => {
      t = ts / 1000
      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, W, H)

      // スキャンライン
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.fillRect(0, y, W, 1)
      }

      // "ATONE" フェードイン
      const titleAlpha = Math.min(1, Math.max(0, (t - 0.5) / 1.5))
      ctx.save()
      ctx.globalAlpha = titleAlpha
      ctx.textAlign   = 'center'
      ctx.font        = 'bold 72px serif'
      ctx.fillStyle   = '#e8e0d0'
      ctx.fillText('ATONE', W / 2, H / 2 - 60)

      // "10%" 赤パルス
      const redPulse  = 0.75 + 0.25 * Math.sin(t * 2.0)
      ctx.font        = 'bold 36px monospace'
      ctx.fillStyle   = `rgba(220,40,40,${redPulse})`
      ctx.shadowColor = `rgba(220,0,0,${0.6 * redPulse})`
      ctx.shadowBlur  = 18
      ctx.fillText('10%', W / 2, H / 2 - 10)
      ctx.shadowBlur  = 0
      ctx.restore()

      // キャッチコピー
      const subAlpha = Math.min(1, Math.max(0, (t - 2.0) / 1.0))
      ctx.save()
      ctx.globalAlpha = subAlpha
      ctx.textAlign   = 'center'
      ctx.font        = '14px monospace'
      ctx.fillStyle   = '#887866'
      ctx.fillText('バッテリーが尽きる前に、脱出しろ。', W / 2, H / 2 + 36)
      ctx.restore()

      // メニュー項目（t > 3.0 で表示）
      const menuAlpha = Math.min(1, Math.max(0, (t - 3.0) / 0.8))
      const blink     = 0.5 + 0.5 * Math.sin(t * 3.5)
      ctx.save()
      ctx.textAlign = 'center'

      // ゲームスタート
      ctx.globalAlpha = menuAlpha * (0.5 + 0.5 * blink)
      ctx.font        = '15px monospace'
      ctx.fillStyle   = '#cccccc'
      ctx.fillText('▶  ゲームスタート  ( any key )', W / 2, H / 2 + 88)

      // 操作方法
      ctx.globalAlpha = menuAlpha * 0.65
      ctx.font        = '13px monospace'
      ctx.fillStyle   = '#777'
      ctx.fillText('[ H ]  操作方法', W / 2, H / 2 + 118)

      ctx.restore()

      _drawNoise(ctx, W, H)
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const handleKey = (e) => {
      if (e.key === 'h' || e.key === 'H') { onControls(); return }
      onStart()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onStart, onControls])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={onStart}
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated', cursor: 'pointer' }}
    />
  )
}

// ── 操作方法画面
function ControlsCanvas({ onBack }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let t = 0

    const CONTROLS = [
      { key: 'WASD / ↑↓←→',  desc: '移動' },
      { key: 'L',              desc: 'ライト ON / OFF' },
      { key: 'Shift（押しっぱなし）', desc: 'ライトの向きを固定' },
      { key: 'R',              desc: 'リスタート（ゲームオーバー後）' },
    ]

    const RULES = [
      'バッテリーが時間制限。ライトONで消費が増える。',
      '黒い影に触れるとバッテリーが大幅に減り、スタート地点へ戻る。',
      '4F でケーブルを入手してから出口へ向かえ。',
      '1F の出口（青い扉）にたどり着けばクリア。',
    ]

    const draw = (ts) => {
      t = ts / 1000
      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, W, H)

      // スキャンライン
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, y, W, 1)
      }

      const a = Math.min(1, t / 0.4)
      ctx.globalAlpha = a

      // タイトル
      ctx.textAlign = 'center'
      ctx.font      = 'bold 22px monospace'
      ctx.fillStyle = '#c8b89a'
      ctx.fillText('── 操作方法 ──', W / 2, 72)

      // 操作一覧
      ctx.textAlign = 'left'
      CONTROLS.forEach((c, i) => {
        const y = 130 + i * 44
        // キー
        ctx.font      = 'bold 14px monospace'
        ctx.fillStyle = '#ffee88'
        ctx.fillText(`[ ${c.key} ]`, 80, y)
        // 説明
        ctx.font      = '14px monospace'
        ctx.fillStyle = '#aaaaaa'
        ctx.fillText(c.desc, 340, y)
        // 区切り線
        ctx.strokeStyle = 'rgba(80,70,60,0.4)'
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.moveTo(80, y + 12)
        ctx.lineTo(W - 80, y + 12)
        ctx.stroke()
      })

      // ゲームルール
      ctx.textAlign = 'center'
      ctx.font      = 'bold 14px monospace'
      ctx.fillStyle = '#776655'
      ctx.fillText('── ゲームルール ──', W / 2, 316)

      ctx.textAlign = 'left'
      RULES.forEach((r, i) => {
        ctx.font      = '12px monospace'
        ctx.fillStyle = '#665544'
        ctx.fillText(`・${r}`, 80, 344 + i * 26)
      })

      // 戻るヒント
      const blink = 0.5 + 0.5 * Math.sin(t * 3.0)
      ctx.globalAlpha = a * (0.4 + 0.6 * blink)
      ctx.textAlign   = 'center'
      ctx.font        = '13px monospace'
      ctx.fillStyle   = '#888'
      ctx.fillText('[ Backspace / Esc ]  タイトルに戻る', W / 2, H - 32)

      ctx.globalAlpha = 1
      _drawNoise(ctx, W, H)
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const handleKey = (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onBack])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={onBack}
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated', cursor: 'pointer' }}
    />
  )
}

// ── エクスポート: title | controls を内部で切り替え
export default function TitleScreen({ onStart }) {
  const [page, setPage] = useState('title')

  return page === 'title'
    ? <TitleCanvas onStart={onStart} onControls={() => setPage('controls')} />
    : <ControlsCanvas onBack={() => setPage('title')} />
}
