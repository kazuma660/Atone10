export const BATTERY_START = 10.0
export const DRAIN_LIGHT_ON = 0.055
export const DRAIN_LIGHT_OFF = 0.005
export const HEARTBEAT_THRESHOLD = 3.0

export function updateBattery(battery, isLightOn, dt) {
  const drain = isLightOn ? DRAIN_LIGHT_ON : DRAIN_LIGHT_OFF
  const next = battery - drain * dt
  return Math.max(0, next)
}

export function clampBattery(battery) {
  if (battery > BATTERY_START) return BATTERY_START
  return battery
}
