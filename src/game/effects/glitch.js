// 10.1%拒絶時のグリッチ演出
// intensity: glitchTimer の残り秒数（2.5→0）

export function drawGlitch(ctx, w, h, intensity) {
  if (intensity <= 0) return

  const t = Math.min(intensity / 2.5, 1.0)  // 0〜1 に正規化

  // ── ランダムな水平スキャンライン（崩壊感）
  const lineCount = 4 + Math.floor(t * 14)
  for (let i = 0; i < lineCount; i++) {
    const y  = Math.random() * h
    const lh = 1 + Math.random() * 7
    const r  = Math.random() > 0.5 ? 255 : 0
    const g  = Math.random() > 0.7 ? 200 : 0
    const b  = Math.random() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${r},${g},${b},0.75)`
    ctx.fillRect(0, y, w, lh)
  }

  // ── 水平帯のズレ（映像信号乱れ）
  const bandCount = 3 + Math.floor(t * 5)
  ctx.save()
  ctx.globalAlpha = 0.25
  for (let i = 0; i < bandCount; i++) {
    const by    = Math.random() * h
    const bh    = 8 + Math.random() * 30
    const shift = (Math.random() - 0.5) * 40 * t
    ctx.fillStyle = `rgba(255,0,0,0.5)`
    ctx.fillRect(shift, by, w, bh)
  }
  ctx.restore()

  // ── 白フラッシュ（拒絶の瞬間に強く、フェードアウト）
  const flashAlpha = t * 0.7
  ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`
  ctx.fillRect(0, 0, w, h)

  // ── 赤いビネット（恐怖の縁）
  const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.75)
  grad.addColorStop(0, 'rgba(180,0,0,0)')
  grad.addColorStop(1, `rgba(180,0,0,${t * 0.6})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}
