// 階段を降りた直後に廊下の奥を少女の影が横切る一回限りの演出
export function createSilhouette() {
  return { active: false, x: 0, y: 0, dir: 1, timer: 0 }
}

// sx/sy: 影が走り始める画面上の絶対座標（マップ座標で指定）
export function triggerSilhouette(sil, sx, sy) {
  sil.active = true
  sil.dir    = -1
  sil.x      = sx
  sil.y      = sy
  sil.timer  = 2.0
}

export function updateSilhouette(sil, dt) {
  if (!sil.active) return
  sil.x += sil.dir * 180 * dt
  sil.timer -= dt
  if (sil.timer <= 0) sil.active = false
}

export function drawSilhouette(ctx, sil, camera) {
  if (!sil.active) return
  const sx = sil.x - camera.x
  const sy = sil.y - camera.y
  const alpha = Math.min(1, sil.timer * 2) * 0.75

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#000000'
  // 頭
  ctx.beginPath()
  ctx.arc(sx, sy - 28, 8, 0, Math.PI * 2)
  ctx.fill()
  // 胴体
  ctx.fillRect(sx - 6, sy - 20, 12, 22)
  // 足
  ctx.fillRect(sx - 5, sy + 2, 4, 16)
  ctx.fillRect(sx + 1, sy + 2, 4, 16)
  ctx.restore()
}
