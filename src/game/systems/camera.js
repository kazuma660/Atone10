const LERP = 0.08  // わずかに遅れて追従

export function updateCamera(camera, player, canvasW, canvasH, floorW = canvasW, floorH = canvasH) {
  const targetX = player.x + player.w / 2 - canvasW / 2
  const targetY = player.y + player.h / 2 - canvasH / 2
  camera.x += (targetX - camera.x) * LERP
  camera.y += (targetY - camera.y) * LERP
  // フロアサイズに合わせてクランプ（800×600世界ではカメラは(0,0)固定になる）
  camera.x = Math.max(0, Math.min(camera.x, Math.max(0, floorW  - canvasW)))
  camera.y = Math.max(0, Math.min(camera.y, Math.max(0, floorH - canvasH)))
}
