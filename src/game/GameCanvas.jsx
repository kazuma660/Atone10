import { useEffect, useRef } from 'react'
import { createGameState, updateGame, drawGame } from './gameLoop.js'

// ── Web Audio: 10.1%拒絶スクリーム合成
function _playScream(audioCtx) {
  const osc   = audioCtx.createOscillator()
  const gain  = audioCtx.createGain()
  const dist  = audioCtx.createWaveShaper()

  // 歪みカーブ（Fuzz 系）
  const n = 256
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = (Math.PI + 300) * x / (Math.PI + 300 * Math.abs(x))
  }
  dist.curve = curve

  osc.type = 'sawtooth'
  const t0 = audioCtx.currentTime
  osc.frequency.setValueAtTime(900, t0)
  osc.frequency.exponentialRampToValueAtTime(80, t0 + 1.8)

  gain.gain.setValueAtTime(0.0, t0)
  gain.gain.linearRampToValueAtTime(0.9, t0 + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2.2)

  osc.connect(dist)
  dist.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(t0)
  osc.stop(t0 + 2.2)
}

export default function GameCanvas({ onBatteryChange, onBatteryMaxChange, onFloorChange }) {
  const canvasRef   = useRef(null)
  const stateRef    = useRef(null)
  const keysRef     = useRef({})
  const rafRef      = useRef(null)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    stateRef.current = createGameState()
    window.__stateRef = stateRef

    const onKeyDown = (e) => {
      keysRef.current[e.key] = true
      if (e.key === 'l' || e.key === 'L') {
        stateRef.current.player.isLightOn = !stateRef.current.player.isLightOn
      }
      // デバッグ: 0 キーで階段ワープ
      if (e.key === '0') {
        const s = stateRef.current
        const stair = s.floor.stairDown
        if (stair) { s.player.x = stair.x + 2; s.player.y = stair.y + 2 }
      }
      e.preventDefault()
    }
    const onKeyUp = (e) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let lastBattery    = null
    let lastBatteryMax = null
    let lastFloor      = null
    let lastTime = performance.now()
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp
      updateGame(stateRef.current, keysRef.current, dt)
      drawGame(ctx, stateRef.current)

      // 10.1%拒絶スクリームトリガー
      if (stateRef.current._screamPending) {
        stateRef.current._screamPending = false
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext()
        }
        _playScream(audioCtxRef.current)
      }

      const b = stateRef.current.battery
      if (b !== lastBattery) {
        lastBattery = b
        onBatteryChange?.(b)
      }

      const bm = stateRef.current.batteryMax
      if (bm !== lastBatteryMax) {
        lastBatteryMax = bm
        onBatteryMaxChange?.(bm)
      }

      const f = stateRef.current.floorNum
      if (f !== lastFloor) {
        lastFloor = f
        onFloorChange?.(f)
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    />
  )
}
