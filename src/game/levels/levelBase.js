// 全フロア共通のマップ定数と基本壁配列
// マップ: 1400×1000 / 廊下外周: 180,160〜1220,840 / シャフト: 360,300 w680 h400
// 廊下幅: 北南140px / 東西180px

export const MAP_W  = 1400
export const MAP_H  = 1000
export const WALL   = 14   // 薄い仕切り壁厚
export const COR_L  = 180  // 廊下外周 左端
export const COR_T  = 160  // 廊下外周 上端
export const COR_R  = 1220 // 廊下外周 右端
export const COR_B  = 840  // 廊下外周 下端
export const SX = 360, SY = 300, SW = 680, SH = 400  // 中央シャフト

export const SHAFT = { x: SX, y: SY, w: SW, h: SH }

// 北側 4 室と南側 4 室（描画用カラー領域）
export const ROOMS = [
  { x: COR_L, y: 0,     w: 260, h: COR_T,       label: null },  // N1
  { x: 454,   y: 0,     w: 246, h: COR_T,       label: null },  // N2
  { x: 714,   y: 0,     w: 246, h: COR_T,       label: null },  // N3
  { x: 974,   y: 0,     w: 246, h: COR_T,       label: null },  // N4
  { x: COR_L, y: COR_B, w: 260, h: MAP_H-COR_B, label: null },  // S1
  { x: 454,   y: COR_B, w: 246, h: MAP_H-COR_B, label: null },  // S2
  { x: 714,   y: COR_B, w: 246, h: MAP_H-COR_B, label: null },  // S3
  { x: 974,   y: COR_B, w: 246, h: MAP_H-COR_B, label: null },  // S4
]

// ドア開口部（描画用: 廊下外壁のギャップを可視化）
export const DOORS = [
  { x: 285,  y: COR_T, w: 50, h: WALL },  // N1
  { x: 552,  y: COR_T, w: 50, h: WALL },  // N2
  { x: 812,  y: COR_T, w: 50, h: WALL },  // N3
  { x: 1072, y: COR_T, w: 50, h: WALL },  // N4
  { x: 285,  y: COR_B, w: 50, h: WALL },  // S1
  { x: 552,  y: COR_B, w: 50, h: WALL },  // S2
  { x: 812,  y: COR_B, w: 50, h: WALL },  // S3
  { x: 1072, y: COR_B, w: 50, h: WALL },  // S4
]

// 全フロア共通の基本壁（外周 + シャフト + 廊下外壁 + 部屋仕切り）
// 北廊下外壁ドア位置: 285〜335 / 552〜602 / 812〜862 / 1072〜1122
export const BASE_WALLS = [
  // MAP 外周
  { x: 0,          y: 0,          w: MAP_W, h: WALL },
  { x: 0,          y: MAP_H-WALL, w: MAP_W, h: WALL },
  { x: 0,          y: 0,          w: WALL,  h: MAP_H },
  { x: MAP_W-WALL, y: 0,          w: WALL,  h: MAP_H },

  // 中央シャフト
  { x: SX, y: SY, w: SW, h: SH },

  // 北廊下 外壁（ドア4か所を空ける）
  { x: COR_L, y: COR_T, w: 105, h: WALL },  // 180〜285
  { x: 335,   y: COR_T, w: 217, h: WALL },  // 335〜552
  { x: 602,   y: COR_T, w: 210, h: WALL },  // 602〜812
  { x: 862,   y: COR_T, w: 210, h: WALL },  // 862〜1072
  { x: 1122,  y: COR_T, w: 98,  h: WALL },  // 1122〜1220

  // 南廊下 外壁
  { x: COR_L, y: COR_B, w: 105, h: WALL },
  { x: 335,   y: COR_B, w: 217, h: WALL },
  { x: 602,   y: COR_B, w: 210, h: WALL },
  { x: 862,   y: COR_B, w: 210, h: WALL },
  { x: 1122,  y: COR_B, w: 98,  h: WALL },

  // 北側 部屋仕切り壁（y=0〜COR_T）
  { x: COR_L, y: 0, w: WALL, h: COR_T },  // N1 左壁 / 階段室との境界
  { x: 440,   y: 0, w: WALL, h: COR_T },  // N1/N2 境界
  { x: 700,   y: 0, w: WALL, h: COR_T },  // N2/N3 境界
  { x: 960,   y: 0, w: WALL, h: COR_T },  // N3/N4 境界
  { x: COR_R, y: 0, w: WALL, h: COR_T },  // N4 右壁 / 階段室との境界

  // 南側 部屋仕切り壁（y=COR_B〜MAP_H）
  { x: COR_L, y: COR_B, w: WALL, h: MAP_H-COR_B },
  { x: 440,   y: COR_B, w: WALL, h: MAP_H-COR_B },
  { x: 700,   y: COR_B, w: WALL, h: MAP_H-COR_B },
  { x: 960,   y: COR_B, w: WALL, h: MAP_H-COR_B },
  { x: COR_R, y: COR_B, w: WALL, h: MAP_H-COR_B },
]
