import { createPlayer, movePlayer } from './entities/Player.js'
import { updateBattery, BATTERY_START, ERODE_AMOUNT, REJECTION_THRESHOLD } from './systems/battery.js'
import { resolveCollision, rectsOverlap } from './systems/collision.js'
import { updateCamera } from './systems/camera.js'
import { tickFlicker, getLightRadius, drawLight, drawDarkOverlay } from './effects/flicker.js'
import { drawNoise } from './effects/noise.js'
import { drawGlitch } from './effects/glitch.js'
import { createSilhouette, updateSilhouette, drawSilhouette } from './effects/silhouette.js'
import { createGhosts, updateGhosts, drawGhosts, ghostRect } from './entities/Ghost.js'
import { FLOOR4 } from './levels/floor4.js'
import { FLOOR3 } from './levels/floor3.js'
import { FLOOR2 } from './levels/floor2.js'
import { FLOOR1 } from './levels/floor1.js'
const FLOORS = [null, FLOOR1, FLOOR2, FLOOR3, FLOOR4]

export function createGameState() {
  const floorNum = 4
  const floor = FLOORS[floorNum]
  const player = createPlayer(floor.playerStart.x, floor.playerStart.y)
  return {
    player,
    battery: BATTERY_START,
    batteryMax: BATTERY_START,
    camera: { x: 0, y: 0 },       // 800×600世界は常に(0,0)
    floorNum,
    floor,
    screenShake: 0,
    silhouette: createSilhouette(),
    ghosts: createGhosts(floor.ghostSpawns),
    transitioning: false,
    transitionTimer: 0,
    hasCable: false,
    malfunctionTimer: 0,
    glitchTimer: 0,
    _screamPending: false,
    badEnd: false,
    badEndAlpha: 0,
    stunTimer: 0,                  // 接触スタン残り秒数（操作不能）
    ending: false,                 // 1F 心中エンド
    endingAlpha: 0,
  }
}

export function updateGame(state, keys, dt) {
  // エンディング中は白塗り進行のみ
  if (state.ending) {
    state.endingAlpha = Math.min(1, state.endingAlpha + dt * 0.3)
    return
  }

  // バッドエンド中は暗転のみ進める
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

  // スタン中は移動不可
  if (state.stunTimer > 0) {
    state.stunTimer = Math.max(0, state.stunTimer - dt)
  } else {
    movePlayer(state.player, keys, floor.walls, resolveCollision)
  }

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

  updateCamera(state.camera, state.player, 800, 600, state.floor.width, state.floor.height)
  updateSilhouette(state.silhouette, dt)
  updateGhosts(state.ghosts, state.player, dt)

  // ── ゴースト捕捉判定（当たり半径 18px）
  _checkGhostCatch(state)

  // 4F 専用：ケーブル取得で階段アクティブ化
  if (state.floorNum === 4 && !state.hasCable && floor.cable && rectsOverlap(state.player, floor.cable)) {
    state.hasCable = true
    state.player.hasCable = true
  }

  // 階段遷移（4F: ケーブル必須 / 1F: 心中エンディング）
  if (floor.stairDown && rectsOverlap(state.player, floor.stairDown)) {
    if (state.floorNum === 4 && !state.hasCable) {
      // ケーブル未取得: 通過不可
    } else if (state.floorNum === 1) {
      _triggerEnding(state)
    } else {
      _descendFloor(state)
    }
  }
}

// ── ゴースト捕捉：AABB判定・浸食・2秒スタン
function _checkGhostCatch(state) {
  if (state.stunTimer > 0) return   // スタン中は二重捕捉しない
  for (const g of state.ghosts) {
    if (!g.active) continue
    if (rectsOverlap(state.player, ghostRect(g))) {
      state.batteryMax      = Math.max(1.0, state.batteryMax - ERODE_AMOUNT)
      state.battery         = Math.min(state.battery, state.batteryMax)
      state.malfunctionTimer = 5.0
      state.stunTimer       = 2.0   // 2秒スタン
      state.screenShake     = 14
      g.active              = false
      g.cooldownTimer       = 8.0
      break
    }
  }
}

// ── 1F 心中エンディング
function _triggerEnding(state) {
  state.ending      = true
  state.endingAlpha = 0
  state.player.isLightOn = false
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
  state.floorNum        = nextNum
  state.floor           = nextFloor
  state.player.x        = nextFloor.playerStart.x
  state.player.y        = nextFloor.playerStart.y
  state.camera.x        = 0
  state.camera.y        = 0
  state.ghosts          = createGhosts(nextFloor.ghostSpawns)
  state.hasCable        = false
  state.transitioning   = true
  state.transitionTimer = 0.6
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

  // ── ドーナツ回廊: 床（廊下色で全塗り → 壁を上書き）
  ctx.fillStyle = '#1c1814'
  ctx.fillRect(0, 0, floor.width, floor.height)

  // ── 壁（障害物・中央ボイド・ボーダー）
  ctx.fillStyle = '#2e2a24'
  for (const wall of floor.walls) ctx.fillRect(wall.x, wall.y, wall.w, wall.h)

  // ── ケーブル（4F のみ、未取得時）
  if (state.floorNum === 4 && !state.hasCable && floor.cable) {
    const c = floor.cable
    ctx.fillStyle = '#ccaa00'
    ctx.fillRect(c.x, c.y, c.w, c.h)
    ctx.fillStyle = '#ffee44'
    ctx.font = '9px monospace'
    ctx.fillText('CABLE', c.x - 2, c.y - 4)
  }

  // ── 階段（4F: ケーブル取得後のみ表示 / 1F: エンド扉）
  if (floor.stairDown) {
    const stairActive = !(state.floorNum === 4 && !state.hasCable)
    if (stairActive) {
      const s = floor.stairDown
      const is1F = state.floorNum === 1
      ctx.fillStyle   = is1F ? '#3a1020' : '#162816'
      ctx.fillRect(s.x, s.y, s.w, s.h)
      ctx.strokeStyle = is1F ? '#cc2244' : '#3a8a3a'
      ctx.lineWidth   = 2
      ctx.strokeRect(s.x, s.y, s.w, s.h)
      ctx.fillStyle = is1F ? '#ff4466' : '#5aaa5a'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(is1F ? '▼ END' : `▼ ${state.floorNum - 1}F`, s.x + 4, s.y + 26)
    }
  }

  // ── プレイヤー（スタン中は点滅）
  const stunVisible = state.stunTimer <= 0 || Math.floor(state.stunTimer * 8) % 2 === 0
  if (stunVisible) {
    ctx.fillStyle = '#c8b89a'
    ctx.fillRect(player.x, player.y, player.w, player.h)
  }

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

  // ── 浸食による暗化オーバーレイ（batteryMax が減るほど画面が暗くなる）
  const erosionDark = (1 - state.batteryMax / 10.0) * 0.55
  if (erosionDark > 0.01) {
    ctx.fillStyle = `rgba(0,0,0,${erosionDark})`
    ctx.fillRect(0, 0, W, H)
  }

  // ── スタン中: 赤フラッシュ（最初の0.4秒）
  if (state.stunTimer > 1.6) {
    const fa = ((state.stunTimer - 1.6) / 0.4) * 0.5
    ctx.fillStyle = `rgba(180,0,0,${fa})`
    ctx.fillRect(0, 0, W, H)
  }

  // ── バッドエンド：暗転＋テキスト
  if (state.badEnd) {
    ctx.fillStyle = `rgba(0,0,0,${state.badEndAlpha})`
    ctx.fillRect(0, 0, W, H)
    if (state.badEndAlpha > 0.6) {
      const ta = Math.min(1, (state.badEndAlpha - 0.6) / 0.4)
      ctx.save()
      ctx.globalAlpha = ta
      ctx.fillStyle   = '#cccccc'
      ctx.font        = '18px serif'
      ctx.textAlign   = 'center'
      ctx.fillText('……これで、ずっと一緒だよ。', W / 2, H / 2)
      ctx.restore()
    }
  }

  // ── 心中エンディング：白塗り＋テキスト
  if (state.ending) {
    ctx.fillStyle = `rgba(255,255,255,${state.endingAlpha})`
    ctx.fillRect(0, 0, W, H)
    if (state.endingAlpha > 0.85) {
      const ta = Math.min(1, (state.endingAlpha - 0.85) / 0.15)
      ctx.save()
      ctx.globalAlpha = ta
      ctx.fillStyle   = '#1a1a1a'
      ctx.font        = '20px serif'
      ctx.textAlign   = 'center'
      ctx.fillText('……次は、離さないでね。', W / 2, H / 2)
      ctx.restore()
    }
  }

  ctx.restore()
}
