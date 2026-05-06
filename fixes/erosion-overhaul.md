# Atone: Erosion — 根幹システム オーバーホール記録

日付: 2026-05-06

---

## 変更一覧

### systems/battery.js
- `ERODE_AMOUNT`: `0.1` → `1.0`（捕捉1回で最大容量 -1.0）
- `REJECTION_THRESHOLD = 10.1` を追加（既存）

### entities/Player.js
- `CABLE_PENALTY`: `0.8` → `0.95`（ケーブル所持時の鈍足を最小限に）
- Shift キーで `player.facing` を固定する処理を追加（既存）

### effects/flicker.js
- `getLightRadius(isLightOn, malfunctionTimer, batteryMax)` に第3引数 `batteryMax` を追加
- 光量を `190 * (batteryMax / 10.0)` に比例させ、浸食が進むほど光が弱くなる
- 最低光量比率 10%（= radius ≒ 19px）を確保

### effects/glitch.js（新規）
- 10.1%拒絶時のグリッチ描画：スキャンライン・帯ズレ・白フラッシュ・赤ビネット

### entities/Ghost.js
- 捕捉判定は gameLoop 側で行う（Ghost.js 自体に変更なし）

### gameLoop.js
- `state.batteryMax`: 浸食で永久減少する最大容量を追加
- `state.malfunctionTimer`: 故障フリッカー残り秒数を追加
- `state.glitchTimer`: グリッチ演出残り秒数を追加
- `state._screamPending`: スクリーム再生フラグを追加
- `state.badEnd`: battery=0 バッドエンドフラグを追加
- `state.badEndAlpha`: 暗転フェードイン進行度（0→1）を追加
- `_checkGhostCatch()`: ゴースト捕捉 → batteryMax 浸食 + 故障フリッカー5秒
- `_trigger101Rejection()`: battery≥10.1 → グリッチ2.5秒＋スクリーム＋Floor4強制リセット
- バッドエンド判定: battery≤0 → `state.badEnd=true`・操作ロック・暗転フェード
- バッドエンド描画: 暗転後に「……これで、ずっと一緒だよ。」をフェードイン表示
- `getLightRadius` 呼び出しに `state.batteryMax` を渡すよう修正
- パネル充電: `BATTERY_START + 95` → `Math.min(batteryMax, REJECTION_THRESHOLD - 0.001)`

### GameCanvas.jsx
- `_playScream(audioCtx)`: Web Audio API による合成スクリーム（鋸波+歪み、900→80Hz）
- `onBatteryMaxChange` コールバックを追加
- ゲームループ内で `state._screamPending` を検知してスクリーム再生

### components/HUD.jsx
- `batteryMax` prop を追加
- 浸食が発生した場合（batteryMax < 9.95）に `MAX X.X%` を赤字で表示
- キー説明に `[Shift] 向き固定` を追加

### App.jsx
- `batteryMax` state と `setBatteryMax` を追加
- `GameCanvas` に `onBatteryMaxChange` を渡す
- `HUD` に `batteryMax` を渡す

---

## 未実装・将来課題
- バッドエンド後のリスタートUI（現状: 画面が止まるのみ）
- 10.1%拒絶の「リセット後も浸食を持続」するセーブ機構（現状: セッション内のみ）
- 階段を下りるほど Ghost の AI 強化
