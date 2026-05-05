const LERP = 0.08

export function updateCamera(camera, player, canvasW, canvasH) {
  const targetX = player.x + player.w / 2 - canvasW / 2
  const targetY = player.y + player.h / 2 - canvasH / 2
  camera.x += (targetX - camera.x) * LERP
  camera.y += (targetY - camera.y) * LERP
}
