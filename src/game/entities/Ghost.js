// 敵（少女の影）: 黒い矩形。AABB当たり判定。ライトが当たると停止。

const SPEED        = 35
const LIGHT_RADIUS = 110
const DESPAWN_MIN  = 8
const DESPAWN_MAX  = 12
const COOLDOWN_MIN = 5
const COOLDOWN_MAX = 10

function randRange(min, max) { return min + Math.random() * (max - min) }

function _make(x, y) {
  return { active: false, x, y, frozen: false,
           despawnTimer: 0, cooldownTimer: randRange(1, 3),
           spawnX: x, spawnY: y }
}

export function createGhosts(spawns) {
  return spawns.map(({ x, y }) => _make(x, y))
}

export function updateGhosts(ghosts, player, dt) {
  const px = player.x + player.w / 2
  const py = player.y + player.h / 2
  for (const g of ghosts) {
    if (!g.active) {
      g.cooldownTimer -= dt
      if (g.cooldownTimer <= 0) {
        g.x = g.spawnX; g.y = g.spawnY
        g.active = true; g.frozen = false
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
    const dx = g.x - px
    const dy = g.y - py
    const dist = Math.sqrt(dx * dx + dy * dy)
    g.frozen = player.isLightOn && dist < LIGHT_RADIUS
    if (!g.frozen && dist > 1) {
      g.x -= (dx / dist) * SPEED * dt
      g.y -= (dy / dist) * SPEED * dt
    }
  }
}

// ゴーストの AABB 矩形（当たり判定用）
export function ghostRect(g) {
  return { x: g.x - 10, y: g.y - 22, w: 20, h: 44 }
}

export function drawGhosts(ctx, ghosts, camera) {
  for (const g of ghosts) {
    if (!g.active) continue
    const sx = Math.round(g.x - camera.x)
    const sy = Math.round(g.y - camera.y)
    ctx.save()
    if (g.frozen) {
      ctx.globalAlpha = 0.40
      ctx.fillStyle = '#111122'
      ctx.fillRect(sx - 10, sy - 22, 20, 44)
      ctx.strokeStyle = '#334466'
      ctx.lineWidth = 1
      ctx.strokeRect(sx - 10, sy - 22, 20, 44)
    } else {
      ctx.globalAlpha = 0.88
      ctx.fillStyle = '#000000'
      const jx = (Math.random() - 0.5) * 3
      const jy = (Math.random() - 0.5) * 3
      ctx.fillRect(sx - 10 + jx, sy - 22 + jy, 20, 44)
    }
    ctx.restore()
  }
}
