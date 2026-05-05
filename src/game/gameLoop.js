import { createPlayer, movePlayer } from './entities/Player.js'
import { updateBattery, clampBattery, BATTERY_START } from './systems/battery.js'
import { resolveCollision, rectsOverlap } from './systems/collision.js'
import { updateCamera } from './systems/camera.js'
import { getLightRadius, drawLight, drawDarkOverlay } from './effects/flicker.js'
import { drawNoise } from './effects/noise.js'
import { createSilhouette, triggerSilhouette, updateSilhouette, drawSilhouette } from './effects/silhouette.js'
import { FLOOR4 } from './levels/floor4.js'
import { FLOOR3 } from './levels/floor3.js'
import { FLOOR2 } from './levels/floor2.js'
import { FLOOR1 } from './levels/floor1.js'
import { COR_B } from './levels/levelBase.js'

const FLOORS = [null, FLOOR1, FLOOR2, FLOOR3, FLOOR4]

export function createGameState() {
  const floorNum = 4
  const floor = FLOORS[floorNum]
  const player = createPlayer(floor.playerStart.x, floor.playerStart.y)
  return {
    player,
    battery: BATTERY_START,
    camera: { x: player.x - 392, y: player.y - 292 },
    floorNum,
    floor,
    screenShake: 0,
    silhouette: createSilhouette(),
    transitioning: false,
    transitionTimer: 0,
    hasCable: false,
    panelConnected: false,
  }
}

export function updateGame(state, keys, dt) {
  if (state.transitioning) {
    state.transitionTimer -= dt
    if (state.transitionTimer <= 0) state.transitioning = false
    return
  }

  const { floor } = state

  movePlayer(state.player, keys, floor.walls, resolveCollision)

  const rawBattery = updateBattery(state.battery, state.player.isLightOn, dt)

  if (state.battery > BATTERY_START) {
    state.screenShake = 12
    state.battery = clampBattery(state.battery)
  } else {
    state.battery = rawBattery
  }

  if (state.screenShake > 0) state.screenShake -= 1

  updateCamera(state.camera, state.player, 800, 600)
  updateSilhouette(state.silhouette, dt)

  // 1F 専用インタラクション
  if (state.floorNum === 1) {
    const p = state.player
    if (!state.hasCable && floor.cable && rectsOverlap(p, floor.cable)) {
      state.hasCable = true
      state.player.hasCable = true
    }
    if (state.hasCable && !state.panelConnected && floor.panel && rectsOverlap(p, floor.panel)) {
      state.panelConnected = true
      state.battery = BATTERY_START + 95
    }
  }

  // 階段遷移
  if (floor.stairDown && rectsOverlap(state.player, floor.stairDown)) {
    _descendFloor(state)
  }
}

function _descendFloor(state) {
  const nextNum = state.floorNum - 1
  if (nextNum < 1) return
  const nextFloor = FLOORS[nextNum]

  state.floorNum = nextNum
  state.floor = nextFloor
  state.player.x = nextFloor.playerStart.x
  state.player.y = nextFloor.playerStart.y
  state.camera.x = state.player.x - 392
  state.camera.y = state.player.y - 292
  state.transitioning = true
  state.transitionTimer = 0.6

  // 南廊下中央に少女の影を走らせる
  triggerSilhouette(state.silhouette, 1300, COR_B - 60)
}

export function drawGame(ctx, state) {
  const { player, camera, floor, screenShake, silhouette, transitioning, transitionTimer } = state
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  ctx.save()

  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake)
  }

  // キャンバス背景（最暗）
  ctx.fillStyle = '#080706'
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y))

  // ── マップ床（廊下・階段室エリア）
  ctx.fillStyle = '#1c1814'
  ctx.fillRect(0, 0, floor.width, floor.height)

  // ── 部屋床（廊下より暗い異質感）
  if (floor.rooms) {
    ctx.fillStyle = '#141008'
    for (const r of floor.rooms) ctx.fillRect(r.x, r.y, r.w, r.h)
  }

  // ── 中央シャフト（最暗）
  if (floor.shaft) {
    ctx.fillStyle = '#050403'
    const s = floor.shaft
    ctx.fillRect(s.x, s.y, s.w, s.h)
    // シャフト内側フレーム（廃墟感）
    ctx.strokeStyle = '#1a1510'
    ctx.lineWidth = 4
    ctx.strokeRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4)
  }

  // ── 壁・瓦礫
  ctx.fillStyle = '#2e2a24'
  for (const wall of floor.walls) ctx.fillRect(wall.x, wall.y, wall.w, wall.h)

  // ── ドア枠（廊下外壁のギャップを明るい縁取りで示す）
  if (floor.doors) {
    ctx.fillStyle = '#3d3830'
    for (const d of floor.doors) {
      // 開口の左右縁だけ細い柱を描画
      ctx.fillRect(d.x - 4,      d.y, 4, d.h)
      ctx.fillRect(d.x + d.w,    d.y, 4, d.h)
    }
  }

  // ── 階段（降口）
  if (floor.stairDown) {
    const s = floor.stairDown
    ctx.fillStyle = '#162816'
    ctx.fillRect(s.x, s.y, s.w, s.h)
    ctx.strokeStyle = '#3a8a3a'
    ctx.lineWidth = 2
    ctx.strokeRect(s.x, s.y, s.w, s.h)
    ctx.fillStyle = '#5aaa5a'
    ctx.font = 'bold 11px monospace'
    ctx.fillText(`▼ ${state.floorNum - 1}F`, s.x + 4, s.y + 32)
  }

  // ── 1F: ケーブル・配電盤
  if (state.floorNum === 1) {
    if (!state.hasCable && floor.cable) {
      ctx.fillStyle = '#aaaa00'
      ctx.fillRect(floor.cable.x, floor.cable.y, floor.cable.w, floor.cable.h)
      ctx.fillStyle = '#ffff44'
      ctx.font = '9px monospace'
      ctx.fillText('CABLE', floor.cable.x - 2, floor.cable.y - 4)
    }
    if (floor.panel) {
      ctx.fillStyle = state.panelConnected ? '#00ffaa' : '#334466'
      ctx.fillRect(floor.panel.x, floor.panel.y, floor.panel.w, floor.panel.h)
      ctx.fillStyle = '#88aaff'
      ctx.font = '9px monospace'
      ctx.fillText('PANEL', floor.panel.x - 2, floor.panel.y - 4)
    }
  }

  // ── プレイヤー
  ctx.fillStyle = '#c8b89a'
  ctx.fillRect(player.x, player.y, player.w, player.h)

  // ── 少女の影
  drawSilhouette(ctx, silhouette, camera)

  ctx.restore()

  // ── 暗闇 + ライト
  const radius = getLightRadius(player.isLightOn)
  drawDarkOverlay(ctx, player, camera, radius, W, H)
  if (player.isLightOn) drawLight(ctx, player, camera, radius)

  // ── ノイズ
  drawNoise(ctx, W, H)

  // ── フロア遷移フラッシュ（暗転）
  if (transitioning) {
    const alpha = Math.min(1, transitionTimer / 0.4)
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.fillRect(0, 0, W, H)
  }

  ctx.restore()
}
