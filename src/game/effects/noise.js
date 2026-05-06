// Film Grain: 毎フレーム全ピクセルにランダムな輝度変化を与えて不気味な粒状感を演出
let offscreen = null

export function drawNoise(ctx, w, h) {
  if (!offscreen || offscreen.width !== w || offscreen.height !== h) {
    offscreen = document.createElement('canvas')
    offscreen.width  = w
    offscreen.height = h
  }
  const oc   = offscreen.getContext('2d')
  const img  = oc.createImageData(w, h)
  const data = img.data

  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 70   // 0〜70: 粒子の最大輝度を強化
    data[i]     = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = Math.random() < 0.05 ? 80 : 28  // 5% の確率でホットピクセル
  }

  oc.putImageData(img, 0, 0)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'  // 加算合成: 暗所で粒が光って見える
  ctx.globalAlpha = 0.65
  ctx.drawImage(offscreen, 0, 0)
  ctx.restore()
}
