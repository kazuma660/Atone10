export const SPEED_BASE = 2.5
export const SPEED_DARK = 1.25
export const CABLE_PENALTY = 0.8

export function createPlayer(x, y) {
  return {
    x,
    y,
    w: 16,
    h: 16,
    isLightOn: true,
    hasCable: false,
  }
}

export function getSpeed(player) {
  let speed = player.isLightOn ? SPEED_BASE : SPEED_DARK
  if (player.hasCable) speed *= CABLE_PENALTY
  return speed
}

export function movePlayer(player, keys, walls, resolveCollision) {
  const speed = getSpeed(player)
  let dx = 0
  let dy = 0

  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= speed
  if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += speed
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= speed
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += speed

  if (dx !== 0 && dy !== 0) {
    const norm = Math.SQRT2
    dx /= norm
    dy /= norm
  }

  player.x += dx
  resolveCollision(player, walls)
  player.y += dy
  resolveCollision(player, walls)
}
