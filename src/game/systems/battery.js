export const BATTERY_START       = 10.0
export const DRAIN_LIGHT_ON      = 0.055   // 光ON時の毎秒消費
export const DRAIN_LIGHT_OFF     = 0.005   // 光OFF時の毎秒消費
export const HEARTBEAT_THRESHOLD = 3.0     // HUD警告閾値
export const GHOST_HIT_DRAIN     = 2.0     // ゴースト接触1回で失うバッテリー

// TODO: Phase 2 Horror Expansion
// export const ERODE_AMOUNT        = 1.0   // 接触1回で batteryMax を永久に -1.0
// export const REJECTION_THRESHOLD = 10.1  // 10.1% 拒絶トリガー

export function updateBattery(battery, isLightOn, dt) {
  const drain = isLightOn ? DRAIN_LIGHT_ON : DRAIN_LIGHT_OFF
  return Math.max(0, battery - drain * dt)
}

// TODO: Phase 2 Horror Expansion
// export function clampBattery(battery, batteryMax) {
//   return Math.min(battery, batteryMax)
// }
