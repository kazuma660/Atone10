import { useState, useCallback } from 'react'
import TitleScreen from './components/TitleScreen.jsx'
import GameCanvas  from './game/GameCanvas.jsx'
import HUD         from './components/HUD.jsx'
import { BATTERY_START } from './game/systems/battery.js'

export default function App() {
  const [phase,   setPhase]   = useState('title')   // 'title' | 'game'
  const [battery, setBattery] = useState(BATTERY_START)
  const [floor,   setFloor]   = useState(4)
  const [status,  setStatus]  = useState('normal')

  const handleStart = useCallback(() => setPhase('game'), [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {phase === 'title' ? (
        <TitleScreen onStart={handleStart} />
      ) : (
        <>
          <GameCanvas
            onBatteryChange={setBattery}
            onFloorChange={setFloor}
            onStatusChange={setStatus}
          />
          <HUD battery={battery} floor={floor} status={status} />
        </>
      )}
    </div>
  )
}
