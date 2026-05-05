// 1F: 事件現場。最も廃墟化。配電盤接続でエンディング。
// 階段なし（最終フロア）/ プレイヤースタート: 北廊下中央（2Fから降りてくる）
// ケーブル: 北廊下東寄り / 配電盤: 西廊下腕（北側）
import { MAP_W, MAP_H, SHAFT, ROOMS, DOORS, BASE_WALLS } from './levelBase.js'

export const FLOOR1 = {
  width:  MAP_W,
  height: MAP_H,
  shaft:  SHAFT,
  rooms:  ROOMS,
  doors:  DOORS,
  walls: [
    ...BASE_WALLS,
    // 瓦礫（最大量）
    { x: 450, y: 195, w: 120, h: 55 },  // 北廊下 西寄り
    { x: 850, y: 195, w: 90,  h: 45 },  // 北廊下 東寄り
    { x: 190, y: 720, w: 130, h: 65 },  // 南廊下 西端（大）
    { x: 530, y: 730, w: 80,  h: 55 },  // 南廊下 中央
    { x: 820, y: 710, w: 110, h: 65 },  // 南廊下 東寄り
    { x: 1070,y: 720, w: 80,  h: 50 },  // 南廊下 東端
    { x: 215, y: 320, w: 50,  h: 120 }, // 西廊下腕 中央ブロック
    { x: 1070,y: 350, w: 50,  h: 90 },  // 東廊下腕
  ],
  stairDown: null,  // 最終フロア
  cable: { x: 950, y: 210, w: 20, h: 20 },
  panel: { x: 195, y: 185, w: 30, h: 40 },
  playerStart: { x: 680, y: 220 },  // 2F stairDown と対応
  ghostSpawns: [
    { x: 500, y: 780 },  // 南廊下 中央
    { x: 120, y: 350 },  // 西階段室（配電盤エリア）
  ],
}
