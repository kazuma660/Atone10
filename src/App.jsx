import { useState, useCallback } from 'react'
import TitleScreen   from './components/TitleScreen.jsx'
import GameCanvas    from './game/GameCanvas.jsx'
import HUD           from './components/HUD.jsx'
import PauseOverlay  from './components/PauseOverlay.jsx'
import { BATTERY_START } from './game/systems/battery.js'

export default function App() {
  const [phase,   setPhase]   = useState('title')   // 'title' | 'game'
  const [paused,  setPaused]  = useState(false)
  const [battery, setBattery] = useState(BATTERY_START)
  const [floor,   setFloor]   = useState(4)
  const [status,  setStatus]  = useState('normal')

  const handleStart   = useCallback(() => { setPhase('game'); setPaused(false) }, [])
  const handleEscape  = useCallback(() => setPaused(p => !p), [])
  const handleResume  = useCallback(() => setPaused(false), [])
  const handleExitTitle = useCallback(() => {
    setPhase('title')
    setPaused(false)
    setBattery(BATTERY_START)
    setFloor(4)
    setStatus('normal')
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {phase === 'title' ? (
        <TitleScreen onStart={handleStart} />
      ) : (
        <>
          <GameCanvas
            paused={paused}
            onEscape={handleEscape}
            onBatteryChange={setBattery}
            onFloorChange={setFloor}
            onStatusChange={setStatus}
          />
          <HUD battery={battery} floor={floor} status={status} />
          {paused && (
            <PauseOverlay onResume={handleResume} onExitTitle={handleExitTitle} />
          )}
        </>
      )}
    </div>
  )
}
