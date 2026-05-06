const LERP = 0.08  // わずかに遅れて追従（高速移動時に遅延が体感できる値）

export function updateCamera(camera, player, canvasW, canvasH) {
  const targetX = player.x + player.w / 2 - canvasW / 2
  const targetY = player.y + player.h / 2 - canvasH / 2
  camera.x += (targetX - camera.x) * LERP
  camera.y += (targetY - camera.y) * LERP
}
