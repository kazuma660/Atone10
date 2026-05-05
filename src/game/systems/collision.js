export function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

export function resolveCollision(player, walls) {
  for (const wall of walls) {
    if (!rectsOverlap(player, wall)) continue

    const overlapLeft = player.x + player.w - wall.x
    const overlapRight = wall.x + wall.w - player.x
    const overlapTop = player.y + player.h - wall.y
    const overlapBottom = wall.y + wall.h - player.y

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

    if (minOverlap === overlapLeft) player.x = wall.x - player.w
    else if (minOverlap === overlapRight) player.x = wall.x + wall.w
    else if (minOverlap === overlapTop) player.y = wall.y - player.h
    else player.y = wall.y + wall.h
  }
}
