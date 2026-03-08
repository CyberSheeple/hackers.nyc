import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="plasma" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[PL]</span>
    <canvas class="fractal-canvas" data-fractal="plasma" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let t = 0;
  const speed = 0.03;

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    t += speed;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x = px / w; const y = py / h;
        const v = Math.sin(x * 10 + t) + Math.sin(y * 10 + t * 1.3) +
          Math.sin((x + y) * 10 + t * 0.7) + Math.sin(Math.sqrt(x * x + y * y) * 15 + t);
        const n = (v + 4) / 8;
        const col = lerpColor(CYAN, MAGENTA, n);
        const i = (py * w + px) * 4;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  return throttledRaf(draw);
}
