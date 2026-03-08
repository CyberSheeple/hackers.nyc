import { CYAN, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="starfield" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[★]</span>
    <canvas class="fractal-canvas" data-fractal="starfield" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  const count = 80;
  const stars = Array.from({ length: count }, () => ({
    x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(),
    speed: 0.003 + Math.random() * 0.0045,
  }));

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    ctx.fillStyle = "rgb(10,10,15)";
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      s.z -= s.speed;
      if (s.z <= 0) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; }
      const sx = (s.x / s.z + 1) * w / 2;
      const sy = (s.y / s.z + 1) * h / 2;
      const r = Math.max(0.5, 2 * (1 - s.z));
      const a = 0.3 + 0.7 * (1 - s.z);
      ctx.fillStyle = `rgba(0,245,255,${a})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return throttledRaf(draw);
}
