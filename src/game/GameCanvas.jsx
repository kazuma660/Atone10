import { useEffect, useRef } from 'react'
import { createGameState, updateGame, drawGame } from './gameLoop.js'

export default function GameCanvas({ onBatteryChange, onFloorChange }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({})
  const rafRef = useRef(null)

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

    let lastBattery = null
    let lastFloor = null
    let lastTime = performance.now()
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp
      updateGame(stateRef.current, keysRef.current, dt)
      drawGame(ctx, stateRef.current)

      const b = stateRef.current.battery
      if (b !== lastBattery) {
        lastBattery = b
        onBatteryChange?.(b)
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
