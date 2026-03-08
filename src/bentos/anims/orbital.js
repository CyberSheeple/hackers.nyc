import { CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="orbital" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[OR]</span>
    <canvas class="fractal-canvas" data-fractal="orbital" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let t = 0;
  const orbs = [
    { r: 0.25, speed: 1.8, trail: [] },
    { r: 0.35, speed: 1.2, trail: [] },
    { r: 0.2, speed: 2.7, trail: [] },
  ];

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const cx = w / 2; const cy = h / 2;
    const scale = Math.min(w, h) * 0.35;
    t += 0.03;

    ctx.fillStyle = "rgba(10,10,15,0.2)";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      const x = cx + Math.cos(t * o.speed) * scale * o.r * 2;
      const y = cy + Math.sin(t * o.speed * 0.7) * scale * o.r * 2;
      o.trail.push({ x, y });
      if (o.trail.length > 25) o.trail.shift();

      const col = i === 0 ? CYAN : i === 1 ? MAGENTA : [0, 102, 255];
      for (let j = 0; j < o.trail.length; j++) {
        const p = o.trail[j];
        const a = (j + 1) / o.trail.length * 0.5;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return throttledRaf(draw);
}
