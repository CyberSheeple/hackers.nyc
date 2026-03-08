/**
 * Boids / flocking bento
 */

import { CYAN, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="boids" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[BD]</span>
    <canvas class="fractal-canvas" data-fractal="boids" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  const n = 18;
  const boids = Array.from({ length: n }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.02, vy: (Math.random() - 0.5) * 0.02,
  }));
  const sep = 0.08, align = 0.05, coh = 0.02;

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    ctx.fillStyle = "rgba(10,10,15,0.3)";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < n; i++) {
      const b = boids[i];
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, nc = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const o = boids[j];
        const dx = o.x - b.x, dy = o.y - b.y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < 0.15) { sx -= dx / d; sy -= dy / d; }
        if (d < 0.25) { ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; nc++; }
      }
      if (nc > 0) {
        ax /= nc; ay /= nc; cx = cx / nc - b.x; cy = cy / nc - b.y;
        b.vx += sep * sx + align * (ax - b.vx) + coh * cx;
        b.vy += sep * sy + align * (ay - b.vy) + coh * cy;
      }
      const speed = Math.hypot(b.vx, b.vy) || 0.001;
      b.vx = (b.vx / speed) * 0.0225;
      b.vy = (b.vy / speed) * 0.0225;
      b.x = (b.x + b.vx + 1) % 1;
      b.y = (b.y + b.vy + 1) % 1;

      ctx.fillStyle = "rgba(0,245,255,0.9)";
      ctx.beginPath();
      ctx.arc(b.x * w, b.y * h, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return throttledRaf(draw);
}
