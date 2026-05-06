import { useEffect, useRef } from 'react'

// フィルムグレイン（gameLoop と同じノイズを再利用）
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

export default function TitleScreen({ onStart }) {
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

      // ── 背景
      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, W, H)

      // ── 上下スキャンライン（雰囲気）
      ctx.save()
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.fillRect(0, y, W, 1)
      }
      ctx.restore()

      // ── タイトル "ATONE" — フェードイン（最初の2秒）
      const titleAlpha = Math.min(1, Math.max(0, (t - 0.5) / 1.5))
      ctx.save()
      ctx.globalAlpha = titleAlpha
      ctx.textAlign   = 'center'

      // メインタイトル
      ctx.font        = 'bold 72px serif'
      ctx.fillStyle   = '#e8e0d0'
      ctx.letterSpacing = '12px'
      ctx.fillText('ATONE', W / 2 + 6, H / 2 - 60)

      // サブタイトル "10%"
      const redPulse = 0.75 + 0.25 * Math.sin(t * 2.0)
      ctx.font      = 'bold 36px monospace'
      ctx.fillStyle = `rgba(220,40,40,${redPulse * titleAlpha})`
      ctx.shadowColor = `rgba(220,0,0,${0.6 * redPulse * titleAlpha})`
      ctx.shadowBlur  = 18
      ctx.fillText('10%', W / 2, H / 2 - 10)
      ctx.shadowBlur  = 0
      ctx.restore()

      // ── キャッチコピー — フェードイン（t > 2.0）
      const subAlpha = Math.min(1, Math.max(0, (t - 2.0) / 1.0))
      ctx.save()
      ctx.globalAlpha = subAlpha
      ctx.textAlign   = 'center'
      ctx.font        = '14px monospace'
      ctx.fillStyle   = '#887866'
      ctx.fillText('バッテリーが尽きる前に、脱出しろ。', W / 2, H / 2 + 36)
      ctx.restore()

      // ── "Press any key" — フェードイン後に点滅（t > 3.0）
      const promptAlpha = Math.min(1, Math.max(0, (t - 3.0) / 0.8))
      const blink       = 0.5 + 0.5 * Math.sin(t * 3.5)
      ctx.save()
      ctx.globalAlpha = promptAlpha * (0.4 + 0.6 * blink)
      ctx.textAlign   = 'center'
      ctx.font        = '13px monospace'
      ctx.fillStyle   = '#aaaaaa'
      ctx.fillText('─── Press any key to start ───', W / 2, H / 2 + 96)
      ctx.restore()

      // ── 操作ヒント（右下）
      const hintAlpha = Math.min(1, Math.max(0, (t - 3.5) / 1.0))
      ctx.save()
      ctx.globalAlpha = hintAlpha * 0.45
      ctx.textAlign   = 'right'
      ctx.font        = '10px monospace'
      ctx.fillStyle   = '#555'
      ctx.fillText('[WASD / ↑↓←→] 移動   [L] ライト   [Shift] 向き固定', W - 20, H - 18)
      ctx.restore()

      // ── フィルムグレイン
      _drawNoise(ctx, W, H)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    // キー or クリックでゲーム開始
    const handleKey   = () => onStart()
    const handleClick = () => onStart()
    window.addEventListener('keydown', handleKey)
    window.addEventListener('click',   handleClick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('click',   handleClick)
    }
  }, [onStart])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        display: 'block',
        width:  '100%',
        height: '100%',
        imageRendering: 'pixelated',
        cursor: 'pointer',
      }}
    />
  )
}
