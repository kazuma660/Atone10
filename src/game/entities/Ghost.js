const SPEED        = 35    // px/sec、プレイヤー方向への移動速度
const LIGHT_RADIUS = 110   // この距離以内でライトが当たると硬直
const DESPAWN_MIN  = 8
const DESPAWN_MAX  = 12
const COOLDOWN_MIN = 5
const COOLDOWN_MAX = 10

function randRange(min, max) {
  return min + Math.random() * (max - min)
}

function _makeGhost(x, y) {
  return {
    active: false,
    x,
    y,
    frozen: false,
    despawnTimer:  0,
    cooldownTimer: randRange(1, 3),  // 初回スポーンを少し遅らせる
    spawnX: x,
    spawnY: y,
  }
}

export function createGhosts(spawns) {
  return spawns.map(({ x, y }) => _makeGhost(x, y))
}

export function updateGhosts(ghosts, player, dt) {
  const px = player.x + player.w / 2
  const py = player.y + player.h / 2

  for (const g of ghosts) {
    if (!g.active) {
      g.cooldownTimer -= dt
      if (g.cooldownTimer <= 0) {
        // スポーン地点に復帰して出現
        g.x = g.spawnX
        g.y = g.spawnY
        g.active = true
        g.frozen = false
        g.despawnTimer = randRange(DESPAWN_MIN, DESPAWN_MAX)
      }
      continue
    }

    g.despawnTimer -= dt
    if (g.despawnTimer <= 0) {
      g.active = false
      g.cooldownTimer = randRange(COOLDOWN_MIN, COOLDOWN_MAX)
      continue
    }

    // ライト照射判定
    const dx = g.x - px
    const dy = g.y - py
    const dist = Math.sqrt(dx * dx + dy * dy)
    g.frozen = player.isLightOn && dist < LIGHT_RADIUS

    // 硬直していなければプレイヤーに向かってゆっくり近づく
    if (!g.frozen && dist > 1) {
      g.x -= (dx / dist) * SPEED * dt
      g.y -= (dy / dist) * SPEED * dt
    }
  }
}

export function drawGhosts(ctx, ghosts, camera) {
  for (const g of ghosts) {
    if (!g.active) continue
    const sx = g.x - camera.x
    const sy = g.y - camera.y

    if (g.frozen) {
      _drawSilhouette(ctx, sx, sy)
    } else {
      _drawNoise(ctx, sx, sy)
    }
  }
}

function _drawSilhouette(ctx, sx, sy) {
  ctx.save()
  ctx.globalAlpha = 0.70
  ctx.fillStyle = '#bbbbcc'
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

function _drawNoise(ctx, sx, sy) {
  ctx.save()
  ctx.globalAlpha = 0.55
  const count = 12 + Math.floor(Math.random() * 5)
  for (let i = 0; i < count; i++) {
    const ox   = (Math.random() - 0.5) * 40
    const oy   = (Math.random() - 0.5) * 50
    const size = 2 + Math.random() * 4
    ctx.fillStyle = Math.random() > 0.5 ? '#777777' : '#444444'
    ctx.fillRect(sx + ox - size / 2, sy + oy - size / 2, size, size)
  }
  ctx.restore()
}
