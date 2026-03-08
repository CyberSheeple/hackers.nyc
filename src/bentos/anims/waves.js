/**
 * Wave ripples / interference bento
 */

import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="waves" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[WV]</span>
    <canvas class="fractal-canvas" data-fractal="waves" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let t = 0;
  const sources = [
    { x: 0.3, y: 0.4 },
    { x: 0.7, y: 0.6 },
    { x: 0.5, y: 0.2 },
  ];

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    t += 0.12;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x = px / w; const y = py / h;
        let v = 0;
        for (const s of sources) {
          const d = Math.hypot(x - s.x, y - s.y);
          v += Math.sin(d * 25 - t) * 0.5 + 0.5;
        }
        v = (v / sources.length + Math.sin(x * 8 + t * 0.5) * 0.2) % 1;
        const col = lerpColor(CYAN, MAGENTA, v);
        const i = (py * w + px) * 4;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  return throttledRaf(draw);
}
