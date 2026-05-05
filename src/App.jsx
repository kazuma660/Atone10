import { useState } from 'react'
import GameCanvas from './game/GameCanvas.jsx'
import HUD from './components/HUD.jsx'
import { BATTERY_START } from './game/systems/battery.js'

export default function App() {
  const [battery, setBattery] = useState(BATTERY_START)
  const [floor, setFloor] = useState(4)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GameCanvas onBatteryChange={setBattery} onFloorChange={setFloor} />
      <HUD battery={battery} floor={floor} />
    </div>
  )
}
