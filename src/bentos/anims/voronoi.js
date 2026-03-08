import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="voronoi" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[VO]</span>
    <canvas class="fractal-canvas" data-fractal="voronoi" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  const n = 8;
  const pts = Array.from({ length: n }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.012, vy: (Math.random() - 0.5) * 0.012,
    hue: Math.random(),
  }));

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < n; i++) {
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0.05 || p.x > 0.95) { p.vx *= -1; p.x = Math.max(0.05, Math.min(0.95, p.x)); }
      if (p.y < 0.05 || p.y > 0.95) { p.vy *= -1; p.y = Math.max(0.05, Math.min(0.95, p.y)); }
    }

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x = px / w, y = py / h;
        let minD = 1e9, idx = 0;
        for (let i = 0; i < n; i++) {
          const dx = x - pts[i].x, dy = y - pts[i].y;
          const d = dx * dx + dy * dy;
          if (d < minD) { minD = d; idx = i; }
        }
        const dist = Math.min(1, Math.sqrt(minD) * 4);
        const col = lerpColor(CYAN, MAGENTA, (pts[idx].hue + dist * 0.5) % 1);
        const i = (py * w + px) * 4;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  return throttledRaf(draw);
}
