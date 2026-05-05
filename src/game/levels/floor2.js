// 2F: 床が抜け落ち、瓦礫大幅増加。一部の部屋ドアも塞がる。
// 階段DOWN: 北廊下中央（x=680, y=220）/ プレイヤースタート: 東廊下腕南（3Fから）
import { MAP_W, MAP_H, SHAFT, ROOMS, DOORS, BASE_WALLS } from './levelBase.js'

export const FLOOR2 = {
  width:  MAP_W,
  height: MAP_H,
  shaft:  SHAFT,
  rooms:  ROOMS,
  doors:  DOORS,
  walls: [
    ...BASE_WALLS,
    // 瓦礫（重量）
    { x: 450, y: 200, w: 100, h: 50 },  // 北廊下（N2ドア付近を圧迫）
    { x: 750, y: 185, w: 80,  h: 40 },  // 北廊下 東寄り
    { x: 200, y: 720, w: 120, h: 60 },  // 南廊下 西端
    { x: 600, y: 735, w: 80,  h: 50 },  // 南廊下 中央
    { x: 950, y: 715, w: 100, h: 60 },  // 南廊下 東端
    { x: 220, y: 350, w: 40,  h: 100 }, // 西廊下腕
    { x: 1080,y: 450, w: 40,  h: 80 },  // 東廊下腕
  ],
  stairDown:   { x: 680, y: 220, w: 50, h: 50 },
  playerStart: { x: 1060, y: 760 },  // 3F stairDown と対応
}
