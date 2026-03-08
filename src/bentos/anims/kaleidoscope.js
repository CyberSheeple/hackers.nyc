import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="kaleidoscope" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[KL]</span>
    <canvas class="fractal-canvas" data-fractal="kaleidoscope" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let t = 0;
  const segments = 6;

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const cx = w / 2; const cy = h / 2;
    const r = Math.min(w, h) / 2;
    t += 0.0225;

    ctx.fillStyle = "rgb(10,10,15)";
    ctx.fillRect(0, 0, w, h);

    for (let seg = 0; seg < segments; seg++) {
      const a0 = (seg / segments) * Math.PI * 2 + t;
      const a1 = ((seg + 1) / segments) * Math.PI * 2 + t;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let i = 0; i <= 12; i++) {
        const a = a0 + (a1 - a0) * (i / 12);
        const ri = r * (0.3 + 0.7 * Math.sin(i * 0.5 + t * 2));
        ctx.lineTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
      }
      ctx.closePath();
      const col = lerpColor(CYAN, MAGENTA, (seg / segments + t * 0.2) % 1);
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.6)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.9)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  return throttledRaf(draw);
}
