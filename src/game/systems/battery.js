export const BATTERY_START       = 10.0
export const DRAIN_LIGHT_ON      = 0.055
export const DRAIN_LIGHT_OFF     = 0.005
export const HEARTBEAT_THRESHOLD = 3.0
export const ERODE_AMOUNT        = 1.0   // 捕捉1回で最大容量を永久に -1.0 減少
export const REJECTION_THRESHOLD = 10.1  // これ以上になろうとすると強制拒絶

export function updateBattery(battery, isLightOn, dt) {
  const drain = isLightOn ? DRAIN_LIGHT_ON : DRAIN_LIGHT_OFF
  const next = battery - drain * dt
  return Math.max(0, next)
}

export function clampBattery(battery) {
  if (battery > BATTERY_START) return BATTERY_START
  return battery
}
