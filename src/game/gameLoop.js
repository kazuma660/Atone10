import { createPlayer, movePlayer } from './entities/Player.js'
import { updateBattery, BATTERY_START, GHOST_HIT_DRAIN } from './systems/battery.js'
import { resolveCollision, rectsOverlap } from './systems/collision.js'
import { updateCamera } from './systems/camera.js'
import { tickFlicker, getLightRadius, drawLight, drawDarkOverlay } from './effects/flicker.js'
import { drawNoise } from './effects/noise.js'
import { createGhosts, updateGhosts, drawGhosts, ghostRect } from './entities/Ghost.js'
import { FLOOR4 } from './levels/floor4.js'
import { FLOOR3 } from './levels/floor3.js'
import { FLOOR2 } from './levels/floor2.js'
import { FLOOR1 } from './levels/floor1.js'

// TODO: Phase 2 Horror Expansion
// import { drawGlitch } from './effects/glitch.js'
// import { createSilhouette, updateSilhouette, drawSilhouette } from './effects/silhouette.js'

const FLOORS = [null, FLOOR1, FLOOR2, FLOOR3, FLOOR4]

export function createGameState() {
  const floorNum = 4
  const floor = FLOORS[floorNum]
  const player = createPlayer(floor.playerStart.x, floor.playerStart.y)
  return {
    player,
    battery:   BATTERY_START,
    camera:    { x: 0, y: 0 },
    floorNum,
    floor,
    screenShake:    0,
    ghosts:         createGhosts(floor.ghostSpawns),
    transitioning:  false,
    transitionTimer: 0,
    hasCable:  false,
    stunTimer: 0,      // ゴースト接触後の一時スタン
    cleared:   false,  // 脱出成功フラグ
    clearAlpha: 0,
    badEnd:    false,  // バッテリー切れフラグ
    badEndAlpha: 0,

    // TODO: Phase 2 Horror Expansion
    // batteryMax:      BATTERY_START,  // 浸食でMaxが下がる
    // malfunctionTimer: 0,             // ライトマルファンクション
    // glitchTimer:     0,              // 10.1%拒絶グリッチ
    // _screamPending:  false,          // Web Audio スクリーム
  }
}

export function updateGame(state, keys, dt) {
  // リスタートキー（クリア or バッドエンド後に R キー）
  if ((state.cleared || state.badEnd) && keys['r'] || keys['R']) {
    _restartGame(state)
    return
  }

  // クリア演出中
  if (state.cleared) {
    state.clearAlpha = Math.min(1, state.clearAlpha + dt * 0.4)
    return
  }

  // バッドエンド演出中
  if (state.badEnd) {
    state.badEndAlpha = Math.min(1, state.badEndAlpha + dt * 0.4)
    return
  }

  // フロア遷移中
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

  // バッテリー消費
  state.battery = updateBattery(state.battery, state.player.isLightOn, dt)

  // TODO: Phase 2 Horror Expansion
  // 10.1% 拒絶チェック: if (state.battery >= REJECTION_THRESHOLD) { _trigger101Rejection(state) }
  // state.battery = Math.min(state.battery, state.batteryMax)

  // バッテリー切れ判定
  if (state.battery <= 0 && !state.badEnd) {
    state.battery = 0
    state.badEnd  = true
    state.player.isLightOn = false
  }

  if (state.screenShake > 0) state.screenShake -= 1

  updateCamera(state.camera, state.player, 800, 600, floor.width, floor.height)
  updateGhosts(state.ghosts, state.player, dt)
  _checkGhostContact(state)

  // 4F: ケーブル取得
  if (state.floorNum === 4 && !state.hasCable && floor.cable &&
      rectsOverlap(state.player, floor.cable)) {
    state.hasCable          = true
    state.player.hasCable   = true
  }

  // 階段遷移（4F: ケーブル必須 / 2F・3F: 常時）
  if (floor.stairDown && rectsOverlap(state.player, floor.stairDown)) {
    if (state.floorNum === 4 && !state.hasCable) {
      // ケーブル未取得: 通過不可（何もしない）
    } else if (state.floorNum > 1) {
      _descendFloor(state)
    }
  }

  // 1F: 配電盤に到達 → 脱出成功
  if (state.floorNum === 1 && state.hasCable && floor.panel &&
      rectsOverlap(state.player, floor.panel)) {
    state.cleared = true
    state.player.isLightOn = false
  }
}

// ── ゴースト接触: バッテリーダメージ + スタート地点に戻す
function _checkGhostContact(state) {
  if (state.stunTimer > 0) return
  for (const g of state.ghosts) {
    if (!g.active) continue
    if (rectsOverlap(state.player, ghostRect(g))) {
      state.battery       = Math.max(0, state.battery - GHOST_HIT_DRAIN)
      state.player.x      = state.floor.playerStart.x
      state.player.y      = state.floor.playerStart.y
      state.stunTimer     = 0.5
      state.screenShake   = 10
      g.active            = false
      g.cooldownTimer     = 8.0

      // TODO: Phase 2 Horror Expansion
      // state.batteryMax       = Math.max(1.0, state.batteryMax - ERODE_AMOUNT)  // MaxCapacity減少
      // state.malfunctionTimer = 5.0   // ライトマルファンクション
      // state.stunTimer        = 2.0   // 2秒スタン
      break
    }
  }
}

// ── 下の階へ
function _descendFloor(state) {
  const nextNum   = state.floorNum - 1
  if (nextNum < 1) return
  const nextFloor = FLOORS[nextNum]
  state.floorNum       = nextNum
  state.floor          = nextFloor
  state.player.x       = nextFloor.playerStart.x
  state.player.y       = nextFloor.playerStart.y
  state.camera.x       = 0
  state.camera.y       = 0
  state.ghosts         = createGhosts(nextFloor.ghostSpawns)
  state.transitioning  = true
  state.transitionTimer = 0.6
}

// ── ゲームリスタート（ステートを初期値に戻す）
function _restartGame(state) {
  const fresh = createGameState()
  Object.assign(state, fresh)
}

// ── TODO: Phase 2 Horror Expansion
// function _trigger101Rejection(state) {
//   state.glitchTimer    = 2.5
//   state.screenShake    = 25
//   state._screamPending = true
//   state.battery = state.batteryMax
//   const floor = FLOORS[4]
//   state.floorNum = 4; state.floor = floor
//   state.player.x = floor.playerStart.x; state.player.y = floor.playerStart.y
//   state.ghosts = createGhosts(floor.ghostSpawns)
//   state.hasCable = false
// }

// ── TODO: Phase 2 Horror Expansion
// function _triggerEnding(state) {
//   state.ending      = true
//   state.endingAlpha = 0
//   state.player.isLightOn = false
// }

export function drawGame(ctx, state) {
  const { player, camera, floor, screenShake, transitioning, transitionTimer } = state
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  ctx.save()

  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake)
  }

  // 背景（最暗）
  ctx.fillStyle = '#080706'
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y))

  // ── 床
  ctx.fillStyle = '#1c1814'
  ctx.fillRect(0, 0, floor.width, floor.height)

  // ── 壁
  ctx.fillStyle = '#2e2a24'
  for (const wall of floor.walls) ctx.fillRect(wall.x, wall.y, wall.w, wall.h)

  // ── ケーブル（4F・未取得時）
  if (state.floorNum === 4 && !state.hasCable && floor.cable) {
    const c = floor.cable
    ctx.fillStyle = '#ccaa00'
    ctx.fillRect(c.x, c.y, c.w, c.h)
    ctx.fillStyle = '#ffee44'
    ctx.font = '9px monospace'
    ctx.fillText('CABLE', c.x - 2, c.y - 4)
  }

  // ── 階段（4F: ケーブル取得後のみ / 2F・3F: 常時）
  if (floor.stairDown && state.floorNum > 1) {
    const stairActive = !(state.floorNum === 4 && !state.hasCable)
    if (stairActive) {
      const s = floor.stairDown
      ctx.fillStyle   = '#162816'
      ctx.fillRect(s.x, s.y, s.w, s.h)
      ctx.strokeStyle = '#3a8a3a'
      ctx.lineWidth   = 2
      ctx.strokeRect(s.x, s.y, s.w, s.h)
      ctx.fillStyle = '#5aaa5a'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`▼ ${state.floorNum - 1}F`, s.x + 4, s.y + 26)
    }
  }

  // ── 配電盤（1F ゴール）
  if (state.floorNum === 1 && floor.panel) {
    const p = floor.panel
    const active = state.hasCable
    ctx.fillStyle   = active ? '#102030' : '#201010'
    ctx.fillRect(p.x, p.y, p.w, p.h)
    ctx.strokeStyle = active ? '#2288cc' : '#553333'
    ctx.lineWidth   = 2
    ctx.strokeRect(p.x, p.y, p.w, p.h)
    ctx.fillStyle = active ? '#44aaff' : '#aa4444'
    ctx.font = 'bold 9px monospace'
    ctx.fillText('PANEL', p.x + 2, p.y + 15)
    ctx.fillText(active ? '[ ON ]' : '[LOCK]', p.x + 2, p.y + 28)
  }

  // ── プレイヤー（スタン中は点滅）
  const stunVisible = state.stunTimer <= 0 || Math.floor(state.stunTimer * 8) % 2 === 0
  if (stunVisible) {
    ctx.fillStyle = '#c8b89a'
    ctx.fillRect(player.x, player.y, player.w, player.h)
  }

  // ── ゴースト
  drawGhosts(ctx, state.ghosts, camera)

  // TODO: Phase 2 Horror Expansion
  // drawSilhouette(ctx, silhouette, camera)

  ctx.restore()

  // ── 扇形ライト
  tickFlicker(player)
  const radius = getLightRadius(player.isLightOn)
  drawDarkOverlay(ctx, player, camera, radius, W, H)
  if (player.isLightOn && radius > 0) drawLight(ctx, player, camera, radius)

  // ── フィルムグレイン
  drawNoise(ctx, W, H)

  // TODO: Phase 2 Horror Expansion
  // if (state.glitchTimer > 0) drawGlitch(ctx, W, H, state.glitchTimer)

  // ── フロア遷移フラッシュ
  if (transitioning) {
    const alpha = Math.min(1, transitionTimer / 0.4)
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.fillRect(0, 0, W, H)
  }

  // ── スタン赤フラッシュ（接触直後 0.3 秒）
  if (state.stunTimer > 0.2) {
    const fa = ((state.stunTimer - 0.2) / 0.3) * 0.4
    ctx.fillStyle = `rgba(180,0,0,${Math.min(fa, 0.4)})`
    ctx.fillRect(0, 0, W, H)
  }

  // ── バッドエンド: 暗転 + テキスト
  if (state.badEnd) {
    ctx.fillStyle = `rgba(0,0,0,${state.badEndAlpha})`
    ctx.fillRect(0, 0, W, H)
    if (state.badEndAlpha > 0.6) {
      const ta = Math.min(1, (state.badEndAlpha - 0.6) / 0.4)
      ctx.save()
      ctx.globalAlpha = ta
      ctx.textAlign   = 'center'
      ctx.fillStyle   = '#cccccc'
      ctx.font        = '20px serif'
      ctx.fillText('バッテリー切れ...', W / 2, H / 2 - 10)
      ctx.fillStyle = '#666'
      ctx.font      = '13px monospace'
      ctx.fillText('[R] でリスタート', W / 2, H / 2 + 26)
      ctx.restore()
    }
  }

  // ── クリア画面: 白塗り + テキスト
  if (state.cleared) {
    ctx.fillStyle = `rgba(255,255,255,${state.clearAlpha})`
    ctx.fillRect(0, 0, W, H)
    if (state.clearAlpha > 0.7) {
      const ta = Math.min(1, (state.clearAlpha - 0.7) / 0.3)
      ctx.save()
      ctx.globalAlpha = ta
      ctx.textAlign   = 'center'
      ctx.fillStyle   = '#1a1a1a'
      ctx.font        = 'bold 26px serif'
      ctx.fillText('脱出成功', W / 2, H / 2 - 24)
      ctx.font      = '14px monospace'
      ctx.fillStyle = '#333'
      ctx.fillText('電力を復旧させ、ビルから脱出した。', W / 2, H / 2 + 14)
      ctx.fillStyle = '#888'
      ctx.font      = '12px monospace'
      ctx.fillText('[R] でリスタート', W / 2, H / 2 + 46)
      ctx.restore()
    }
  }

  // TODO: Phase 2 Horror Expansion
  // 浸食暗化オーバーレイ（batteryMax 減少に比例して画面が暗くなる）
  // const erosionDark = (1 - state.batteryMax / 10.0) * 0.55
  // if (erosionDark > 0.01) { ctx.fillStyle = `rgba(0,0,0,${erosionDark})`; ctx.fillRect(0,0,W,H) }

  ctx.restore()
}
