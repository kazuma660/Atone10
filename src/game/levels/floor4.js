// 4F: 廃墟化最大。植物が侵食し、瓦礫は少なめ（探索しやすい）
// 階段DOWN: 西廊下腕（x=200, y=300）/ プレイヤースタート: 東廊下腕中央
import { MAP_W, MAP_H, SHAFT, ROOMS, DOORS, BASE_WALLS } from './levelBase.js'

export const FLOOR4 = {
  width:  MAP_W,
  height: MAP_H,
  shaft:  SHAFT,
  rooms:  ROOMS,
  doors:  DOORS,
  walls: [
    ...BASE_WALLS,
    // 瓦礫（少量）
    { x: 600, y: 200, w: 60, h: 30 },  // 北廊下
    { x: 850, y: 720, w: 50, h: 40 },  // 南廊下
  ],
  stairDown:   { x: 200, y: 280, w: 50, h: 50 },
  playerStart: { x: 1100, y: 480 },
  ghostSpawns: [{ x: 750, y: 80 }],  // 北側 N3 室内
}
