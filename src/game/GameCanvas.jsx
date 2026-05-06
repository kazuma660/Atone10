import { useEffect, useRef } from 'react'
import { createGameState, updateGame, drawGame } from './gameLoop.js'

// TODO: Phase 2 Horror Expansion
// Web Audio スクリーム合成（10.1%拒絶時）
// function _playScream(audioCtx) { ... sawtooth oscillator, 900→80Hz ... }

export default function GameCanvas({ onBatteryChange, onFloorChange, onStatusChange }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const keysRef   = useRef({})
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    stateRef.current = createGameState()

    const onKeyDown = (e) => {
      keysRef.current[e.key] = true
      // ライト ON/OFF
      if (e.key === 'l' || e.key === 'L') {
        stateRef.current.player.isLightOn = !stateRef.current.player.isLightOn
      }
      e.preventDefault()
    }
    const onKeyUp = (e) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    let lastBattery = null
    let lastFloor   = null
    let lastStatus  = null
    let lastTime    = performance.now()

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp

      updateGame(stateRef.current, keysRef.current, dt)
      drawGame(ctx, stateRef.current)

      // TODO: Phase 2 Horror Expansion
      // if (stateRef.current._screamPending) {
      //   stateRef.current._screamPending = false
      //   if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      //   _playScream(audioCtxRef.current)
      // }

      const s = stateRef.current
      if (s.battery !== lastBattery) {
        lastBattery = s.battery
        onBatteryChange?.(s.battery)
      }
      if (s.floorNum !== lastFloor) {
        lastFloor = s.floorNum
        onFloorChange?.(s.floorNum)
      }

      // ステータス通知（HUD向け: ケーブル取得済みか、クリアか）
      const status = s.cleared ? 'cleared' : s.badEnd ? 'badEnd' : s.hasCable ? 'hasCable' : 'normal'
      if (status !== lastStatus) {
        lastStatus = status
        onStatusChange?.(status)
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
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
