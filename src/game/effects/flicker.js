// 60° 扇形ライト：境界を blur でぼかし、毎フレーム微細な手ブレを加える
// darkOverlay はオフスクリーンで合成してからメイン canvas に貼る
//（main canvas に destination-out するとゲームコンテンツが消えるため）

const SECTOR_HALF = Math.PI / 6   // 30° → 扇形合計 60°
const SHAKE_AMP   = 0.075         // ±4.3° 手ブレ振幅
const BLUR_PX     = 40            // ソフトエッジのぼかし量

let _darkOff   = null
let _sectorOff = null
let _frameAngle = 0

export function tickFlicker(player) {
  if (player.isLightOn) {
    _frameAngle = player.facing + (Math.random() - 0.5) * SHAKE_AMP
  }
}

// MVP版: シンプルなランダムフリッカーのみ
export function getLightRadius(isLightOn) {
  if (!isLightOn) return 0
  if (Math.random() < 0.04) return 0  // 4% の確率でちらつき
  return 190 + (Math.random() - 0.5) * 12

  // TODO: Phase 2 Horror Expansion
  // 浸食が進むほどフリッカー頻度が増し、光量が縮小する
  // export function getLightRadius(isLightOn, malfunctionTimer = 0, batteryMax = 10.0) {
  //   const erosion       = Math.max(0, 1.0 - batteryMax / 10.0)
  //   const flickerChance = erosion * 0.45 + (malfunctionTimer > 0 ? 0.30 : 0)
  //   if (Math.random() < flickerChance) return 0
  //   const ratio      = Math.max(0.1, batteryMax / 10.0)
  //   const baseRadius = 190 * ratio
  //   return baseRadius + (Math.random() - 0.5) * 12
  // }
}

function _ensureOffscreens(w, h) {
  if (!_darkOff || _darkOff.width !== w || _darkOff.height !== h) {
    _darkOff   = document.createElement('canvas')
    _darkOff.width  = w; _darkOff.height  = h
    _sectorOff = document.createElement('canvas')
    _sectorOff.width = w; _sectorOff.height = h
  }
}

export function drawDarkOverlay(ctx, player, camera, radius, w, h) {
  const cx = player.x + player.w / 2 - camera.x
  const cy = player.y + player.h / 2 - camera.y

  _ensureOffscreens(w, h)

  const dc = _darkOff.getContext('2d')
  dc.clearRect(0, 0, w, h)
  dc.fillStyle = 'rgba(0,0,0,0.93)'
  dc.fillRect(0, 0, w, h)

  if (radius > 0) {
    const sc = _sectorOff.getContext('2d')
    sc.clearRect(0, 0, w, h)
    sc.fillStyle = '#ffffff'
    sc.beginPath()
    sc.moveTo(cx, cy)
    sc.arc(cx, cy, radius + BLUR_PX * 2.0, _frameAngle - SECTOR_HALF, _frameAngle + SECTOR_HALF)
    sc.closePath()
    sc.fill()

    dc.save()
    dc.globalCompositeOperation = 'destination-out'
    dc.filter = `blur(${BLUR_PX}px)`
    dc.drawImage(_sectorOff, 0, 0)
    dc.filter = 'none'
    dc.restore()
  }

  ctx.drawImage(_darkOff, 0, 0)
}

export function drawLight(ctx, player, camera, radius) {
  const cx = player.x + player.w / 2 - camera.x
  const cy = player.y + player.h / 2 - camera.y

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, radius, _frameAngle - SECTOR_HALF - 0.05, _frameAngle + SECTOR_HALF + 0.05)
  ctx.closePath()

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  grad.addColorStop(0,    'rgba(255,220,120,0.28)')
  grad.addColorStop(0.45, 'rgba(255,200,80, 0.12)')
  grad.addColorStop(1,    'rgba(0,0,0,0)')

  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}
