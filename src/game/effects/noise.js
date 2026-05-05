// オフスクリーン canvas に描いてから drawImage で合成（putImageData は compositing を無視するため）
let offscreen = null

export function drawNoise(ctx, w, h) {
  if (!offscreen || offscreen.width !== w || offscreen.height !== h) {
    offscreen = document.createElement('canvas')
    offscreen.width = w
    offscreen.height = h
  }
  const oc = offscreen.getContext('2d')
  const imageData = oc.createImageData(w, h)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 40
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = 22
  }
  oc.putImageData(imageData, 0, 0)
  ctx.drawImage(offscreen, 0, 0)
}
