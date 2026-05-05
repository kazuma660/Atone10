// 3F: 瓦礫が増え、記憶が混じり始める。
// 階段DOWN: 東廊下腕南寄り（x=1060, y=760）/ プレイヤースタート: 西廊下腕（4Fから降りてくる）
import { MAP_W, MAP_H, SHAFT, ROOMS, DOORS, BASE_WALLS } from './levelBase.js'

export const FLOOR3 = {
  width:  MAP_W,
  height: MAP_H,
  shaft:  SHAFT,
  rooms:  ROOMS,
  doors:  DOORS,
  walls: [
    ...BASE_WALLS,
    // 瓦礫（中量）
    { x: 400, y: 200, w: 80, h: 35 },   // 北廊下 中央寄り
    { x: 900, y: 210, w: 50, h: 30 },   // 北廊下 東寄り
    { x: 350, y: 720, w: 100, h: 40 },  // 南廊下（部分封鎖）
    { x: 750, y: 730, w: 60,  h: 50 },  // 南廊下
    { x: 220, y: 400, w: 40,  h: 80 },  // 西廊下腕
  ],
  stairDown:   { x: 1060, y: 760, w: 50, h: 50 },
  playerStart: { x: 200, y: 300 },  // 4F stairDown と対応
}
