import { useEffect, useRef } from 'react'
import { createGameState, updateGame, drawGame } from './gameLoop.js'

export default function GameCanvas({ paused, onEscape, onBatteryChange, onFloorChange, onStatusChange }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const keysRef   = useRef({})
  const rafRef    = useRef(null)
  const pausedRef = useRef(paused)

  // paused が変わったら ref にも反映（ループ内で参照するため）
  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    stateRef.current = createGameState()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onEscape?.(); return }
      keysRef.current[e.key] = true
      if (e.key === 'l' || e.key === 'L') {
        stateRef.current.player.isLightOn = !stateRef.current.player.isLightOn
      }
      e.preventDefault()
    }
    const onKeyUp = (e) => { keysRef.current[e.key] = false }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    let lastBattery = null
    let lastFloor   = null
    let lastStatus  = null
    let lastTime    = performance.now()

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp

      // ポーズ中はゲーム更新をスキップ（描画だけ続ける）
      if (!pausedRef.current) {
        updateGame(stateRef.current, keysRef.current, dt)
      }
      drawGame(ctx, stateRef.current)

      const s = stateRef.current
      if (s.battery !== lastBattery)  { lastBattery = s.battery;   onBatteryChange?.(s.battery)  }
      if (s.floorNum !== lastFloor)   { lastFloor   = s.floorNum;  onFloorChange?.(s.floorNum)   }
      const status = s.cleared ? 'cleared' : s.badEnd ? 'badEnd' : s.hasCable ? 'hasCable' : 'normal'
      if (status !== lastStatus)      { lastStatus  = status;      onStatusChange?.(status)       }

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
