import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="aurora" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[AU]</span>
    <canvas class="fractal-canvas" data-fractal="aurora" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let t = 0;
  const layers = 3;

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    ctx.fillStyle = "rgb(10,10,15)";
    ctx.fillRect(0, 0, w, h);
    t += 0.03;

    for (let L = 0; L < layers; L++) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      const off = L * 0.7 + t;
      for (let x = 0; x <= w + 10; x += 8) {
        const y = h * (0.3 + 0.4 * Math.sin(x * 0.02 + off) * Math.sin(x * 0.01 + off * 2));
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w + 10, h);
      ctx.closePath();
      const col = lerpColor(CYAN, MAGENTA, (L + t * 0.5) % 1);
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.15)`;
      ctx.fill();
    }
  }
  return throttledRaf(draw);
}
