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
  const mouseRef  = useRef({ x: -1, y: -1 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let t = 0

    // ボタン領域（canvas 座標）
    const BTN_START    = { cx: W / 2, cy: H / 2 + 88, hw: 185, hh: 18 }
    const BTN_CONTROLS = { cx: W / 2, cy: H / 2 + 122, hw: 90,  hh: 14 }

    const inBtn = (btn, mx, my) =>
      Math.abs(mx - btn.cx) < btn.hw && Math.abs(my - btn.cy) < btn.hh

    const toCanvas = (e) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top)  * (H / rect.height),
      }
    }

    const onMouseMove = (e) => { mouseRef.current = toCanvas(e) }
    const onClick     = (e) => {
      const { x, y } = toCanvas(e)
      if (inBtn(BTN_CONTROLS, x, y)) { onControls(); return }
      onStart()
    }
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click',     onClick)

    const draw = (ts) => {
      t = ts / 1000
      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, W, H)

      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.fillRect(0, y, W, 1)
      }

      const titleAlpha = Math.min(1, t / 0.3)  // 即表示（0.3秒でフェードイン）
      ctx.save()
      ctx.globalAlpha = titleAlpha
      ctx.textAlign   = 'center'
      ctx.font        = 'bold 72px serif'
      ctx.fillStyle   = '#e8e0d0'
      ctx.fillText('ATONE', W / 2, H / 2 - 60)

      const redPulse  = 0.75 + 0.25 * Math.sin(t * 2.0)
      ctx.font        = 'bold 36px monospace'
      ctx.fillStyle   = `rgba(220,40,40,${redPulse})`
      ctx.shadowColor = `rgba(220,0,0,${0.6 * redPulse})`
      ctx.shadowBlur  = 18
      ctx.fillText('10%', W / 2, H / 2 - 10)
      ctx.shadowBlur  = 0
      ctx.restore()

      const subAlpha = Math.min(1, Math.max(0, (t - 0.8) / 0.5))
      ctx.save()
      ctx.globalAlpha = subAlpha
      ctx.textAlign   = 'center'
      ctx.font        = '14px monospace'
      ctx.fillStyle   = '#887866'
      ctx.fillText('バッテリーが尽きる前に、脱出しろ。', W / 2, H / 2 + 36)
      ctx.restore()

      const menuAlpha = Math.min(1, Math.max(0, (t - 1.5) / 0.6))
      const blink     = 0.5 + 0.5 * Math.sin(t * 3.5)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const hoverStart    = inBtn(BTN_START,    mx, my)
      const hoverControls = inBtn(BTN_CONTROLS, mx, my)

      ctx.save()
      ctx.textAlign = 'center'

      // ── ゲームスタートボタン
      ctx.globalAlpha = menuAlpha
      if (hoverStart) {
        // ホバー時: 背景帯 + ブライトン
        ctx.fillStyle = 'rgba(200,200,200,0.08)'
        ctx.fillRect(W/2 - BTN_START.hw - 10, BTN_START.cy - BTN_START.hh - 4,
                     (BTN_START.hw + 10) * 2, BTN_START.hh * 2 + 8)
        ctx.font      = 'bold 16px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(255,255,255,0.6)'
        ctx.shadowBlur  = 12
      } else {
        ctx.globalAlpha = menuAlpha * (0.45 + 0.55 * blink)
        ctx.font        = '15px monospace'
        ctx.fillStyle   = '#cccccc'
        ctx.shadowBlur  = 0
      }
      ctx.fillText('▶  ゲームスタート  ( any key )', W / 2, BTN_START.cy)
      ctx.shadowBlur = 0

      // ── 操作方法ボタン
      ctx.globalAlpha = menuAlpha * (hoverControls ? 1.0 : 0.55)
      ctx.font        = hoverControls ? 'bold 13px monospace' : '13px monospace'
      ctx.fillStyle   = hoverControls ? '#aaaaff' : '#666'
      if (hoverControls) {
        ctx.shadowColor = 'rgba(100,100,255,0.5)'
        ctx.shadowBlur  = 8
      }
      ctx.fillText('[ H ]  操作方法', W / 2, BTN_CONTROLS.cy)
      ctx.shadowBlur = 0

      ctx.restore()

      // カーソル変更用フラグをデータ属性で管理
      canvas.style.cursor = (hoverStart || hoverControls) ? 'pointer' : 'default'

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
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click',     onClick)
      window.removeEventListener('keydown',   handleKey)
    }
  }, [onStart, onControls])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
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
      { key: 'WASD / ↑↓←→',        desc: '移動' },
      { key: 'L',                    desc: 'ライト ON / OFF' },
      { key: 'Shift（押しっぱなし）', desc: 'ライトの向きを固定' },
      { key: 'R',                    desc: 'リスタート（ゲームオーバー後）' },
      { key: 'Esc',                  desc: 'ポーズ / メニュー' },
    ]
    const RULES = [
      'バッテリーが時間制限。ライトONで消費が増える。',
      '黒い影に触れるとバッテリーが大幅に減り、スタート地点へ戻る。',
      '4F でケーブルを入手してから出口へ向かえ。',
      '1F の出口にたどり着けばクリア。',
    ]

    const draw = (ts) => {
      t = ts / 1000
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, W, H)
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, y, W, 1)
      }

      const a = Math.min(1, t / 0.4)
      ctx.globalAlpha = a

      ctx.textAlign = 'center'
      ctx.font      = 'bold 22px monospace'
      ctx.fillStyle = '#c8b89a'
      ctx.fillText('── 操作方法 ──', W / 2, 72)

      ctx.textAlign = 'left'
      CONTROLS.forEach((c, i) => {
        const y = 128 + i * 44
        ctx.font      = 'bold 14px monospace'
        ctx.fillStyle = '#ffee88'
        ctx.fillText(`[ ${c.key} ]`, 80, y)
        ctx.font      = '14px monospace'
        ctx.fillStyle = '#aaaaaa'
        ctx.fillText(c.desc, 340, y)
        ctx.strokeStyle = 'rgba(80,70,60,0.35)'
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.moveTo(80, y + 12); ctx.lineTo(W - 80, y + 12)
        ctx.stroke()
      })

      ctx.textAlign = 'center'
      ctx.font      = 'bold 13px monospace'
      ctx.fillStyle = '#665544'
      ctx.fillText('── ゲームルール ──', W / 2, 358)

      ctx.textAlign = 'left'
      RULES.forEach((r, i) => {
        ctx.font      = '12px monospace'
        ctx.fillStyle = '#554433'
        ctx.fillText(`・${r}`, 80, 384 + i * 24)
      })

      const blink = 0.5 + 0.5 * Math.sin(t * 3.0)
      ctx.globalAlpha = a * (0.4 + 0.6 * blink)
      ctx.textAlign   = 'center'
      ctx.font        = '13px monospace'
      ctx.fillStyle   = '#888'
      ctx.fillText('[ Backspace / Esc ]  タイトルに戻る', W / 2, H - 30)

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

export default function TitleScreen({ onStart }) {
  const [page, setPage] = useState('title')
  return page === 'title'
    ? <TitleCanvas onStart={onStart} onControls={() => setPage('controls')} />
    : <ControlsCanvas onBack={() => setPage('title')} />
}
