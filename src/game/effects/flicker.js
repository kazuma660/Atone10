export function getLightRadius(isLightOn) {
  if (!isLightOn) return 0
  return 120 + (Math.random() - 0.5) * 12
}

export function drawLight(ctx, player, camera, radius) {
  const cx = player.x + player.w / 2 - camera.x
  const cy = player.y + player.h / 2 - camera.y

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  grad.addColorStop(0, 'rgba(255,220,120,0.18)')
  grad.addColorStop(0.5, 'rgba(255,200,80,0.08)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function drawDarkOverlay(ctx, player, camera, radius, w, h) {
  const cx = player.x + player.w / 2 - camera.x
  const cy = player.y + player.h / 2 - camera.y

  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.92)'
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  if (radius > 0) {
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true)
  }
  ctx.fill('evenodd')
  ctx.restore()
}
