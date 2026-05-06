import { createPlayer, movePlayer } from './entities/Player.js'
import { updateBattery, clampBattery, BATTERY_START, ERODE_AMOUNT, REJECTION_THRESHOLD } from './systems/battery.js'
import { resolveCollision, rectsOverlap } from './systems/collision.js'
import { updateCamera } from './systems/camera.js'
import { tickFlicker, getLightRadius, drawLight, drawDarkOverlay } from './effects/flicker.js'
import { drawNoise } from './effects/noise.js'
import { drawGlitch } from './effects/glitch.js'
import { createSilhouette, triggerSilhouette, updateSilhouette, drawSilhouette } from './effects/silhouette.js'
import { createGhosts, updateGhosts, drawGhosts } from './entities/Ghost.js'
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
    batteryMax: BATTERY_START,    // 浸食で永久減少する最大容量
    camera: { x: player.x - 392, y: player.y - 292 },
    floorNum,
    floor,
    screenShake: 0,
    silhouette: createSilhouette(),
    ghosts: createGhosts(floor.ghostSpawns),
    transitioning: false,
    transitionTimer: 0,
    hasCable: false,
    panelConnected: false,
    malfunctionTimer: 0,          // 故障フリッカー残り秒数
    glitchTimer: 0,               // 10.1%拒絶グリッチ残り秒数
    _screamPending: false,        // GameCanvas 側でスクリーム再生トリガー
    badEnd: false,                // battery=0 バッドエンド
    badEndAlpha: 0,               // 暗転フェードイン進行度（0→1）
  }
}

export function updateGame(state, keys, dt) {
  // バッドエンド中は操作ロック・暗転だけ進める
  if (state.badEnd) {
    state.badEndAlpha = Math.min(1, state.badEndAlpha + dt * 0.4)
    return
  }

  if (state.transitioning) {
    state.transitionTimer -= dt
    if (state.transitionTimer <= 0) state.transitioning = false
    return
  }

  const { floor } = state

  movePlayer(state.player, keys, floor.walls, resolveCollision)

  // ── バッテリー消費
  const rawBattery = updateBattery(state.battery, state.player.isLightOn, dt)

  if (state.battery >= REJECTION_THRESHOLD) {
    // 10.1%拒絶：叫び声＋グリッチ＋強制リセット
    _trigger101Rejection(state)
  } else {
    state.battery = Math.min(rawBattery, state.batteryMax)
  }

  // バッドエンド判定（battery が 0 に到達）
  if (state.battery <= 0 && !state.badEnd) {
    state.battery = 0
    state.badEnd  = true
    state.player.isLightOn = false
  }

  // ── タイマー更新
  if (state.screenShake > 0)     state.screenShake -= 1
  if (state.malfunctionTimer > 0) state.malfunctionTimer = Math.max(0, state.malfunctionTimer - dt)
  if (state.glitchTimer > 0)      state.glitchTimer      = Math.max(0, state.glitchTimer - dt)

  updateCamera(state.camera, state.player, 800, 600)
  updateSilhouette(state.silhouette, dt)
  updateGhosts(state.ghosts, state.player, dt)

  // ── ゴースト捕捉判定（当たり半径 18px）
  _checkGhostCatch(state)

  // 1F 専用インタラクション
  if (state.floorNum === 1) {
    const p = state.player
    if (!state.hasCable && floor.cable && rectsOverlap(p, floor.cable)) {
      state.hasCable = true
      state.player.hasCable = true
    }
    if (state.hasCable && !state.panelConnected && floor.panel && rectsOverlap(p, floor.panel)) {
      state.panelConnected = true
      // batteryMax まで充電。ただし REJECTION_THRESHOLD を超えると次フレームで拒絶が発火する
      state.battery = Math.min(state.batteryMax, REJECTION_THRESHOLD - 0.001)
    }
  }

  // 階段遷移
  if (floor.stairDown && rectsOverlap(state.player, floor.stairDown)) {
    _descendFloor(state)
  }
}

// ── ゴースト捕捉：浸食＋故障フリッカー
function _checkGhostCatch(state) {
  const px = state.player.x + state.player.w / 2
  const py = state.player.y + state.player.h / 2
  for (const g of state.ghosts) {
    if (!g.active) continue
    const dx = g.x - px
    const dy = g.y - py
    if (Math.sqrt(dx * dx + dy * dy) < 18) {
      // バッテリー最大容量を永久に 1% 浸食
      state.batteryMax = Math.max(1.0, state.batteryMax - ERODE_AMOUNT)
      state.battery    = Math.min(state.battery, state.batteryMax)
      // ライト故障フリッカー 5秒
      state.malfunctionTimer = 5.0
      state.screenShake = 10
      // ゴーストをスポーン地点へ戻す（8秒クールダウン）
      g.active = false
      g.cooldownTimer = 8.0
    }
  }
}

// ── 10.1%拒絶：叫び声＋グリッチ＋フロア4へ強制リセット（浸食は維持）
function _trigger101Rejection(state) {
  state.glitchTimer    = 2.5
  state.screenShake    = 25
  state._screamPending = true

  // バッテリーを現在の batteryMax に戻す
  state.battery = state.batteryMax

  // フロア4の先頭へ強制ワープ
  const floorNum = 4
  const floor    = FLOORS[floorNum]
  state.floorNum      = floorNum
  state.floor         = floor
  state.player.x      = floor.playerStart.x
  state.player.y      = floor.playerStart.y
  state.camera.x      = state.player.x - 392
  state.camera.y      = state.player.y - 292
  state.ghosts        = createGhosts(floor.ghostSpawns)
  state.hasCable      = false
  state.panelConnected = false
  state.transitioning = false
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
  state.ghosts      = createGhosts(nextFloor.ghostSpawns)
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

  // ── 幽霊エンティティ
  drawGhosts(ctx, state.ghosts, camera)

  // ── 少女の影
  drawSilhouette(ctx, silhouette, camera)

  ctx.restore()

  // ── 扇形ライト（shake 角度を 1 フレーム 1 回計算）
  tickFlicker(player)
  const radius = getLightRadius(player.isLightOn, state.malfunctionTimer, state.batteryMax)
  drawDarkOverlay(ctx, player, camera, radius, W, H)
  if (player.isLightOn && radius > 0) drawLight(ctx, player, camera, radius)

  // ── ノイズ
  drawNoise(ctx, W, H)

  // ── 10.1%拒絶グリッチ（ノイズより上に重ねる）
  if (state.glitchTimer > 0) drawGlitch(ctx, W, H, state.glitchTimer)

  // ── フロア遷移フラッシュ（暗転）
  if (transitioning) {
    const alpha = Math.min(1, transitionTimer / 0.4)
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.fillRect(0, 0, W, H)
  }

  // ── バッドエンド：暗転＋テキスト
  if (state.badEnd) {
    ctx.fillStyle = `rgba(0,0,0,${state.badEndAlpha})`
    ctx.fillRect(0, 0, W, H)
    if (state.badEndAlpha > 0.6) {
      const textAlpha = Math.min(1, (state.badEndAlpha - 0.6) / 0.4)
      ctx.save()
      ctx.globalAlpha = textAlpha
      ctx.fillStyle   = '#cccccc'
      ctx.font        = '18px serif'
      ctx.textAlign   = 'center'
      ctx.fillText('……これで、ずっと一緒だよ。', W / 2, H / 2)
      ctx.restore()
    }
  }

  ctx.restore()
}
