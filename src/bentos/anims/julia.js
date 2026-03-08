import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

function julia(zr, zi, cr, ci, maxIter) {
  for (let i = 0; i < maxIter; i++) {
    const zr2 = zr * zr, zi2 = zi * zi;
    if (zr2 + zi2 > 4) return i / maxIter;
    const nzr = zr2 - zi2 + cr, nzi = 2 * zr * zi + ci;
    zr = nzr; zi = nzi;
  }
  return 1;
}

export const html = `
  <div class="bento-card bento-card--fractal" id="fractal-julia" title="Click to restart with random seed">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[FX]</span>
    <canvas class="fractal-canvas" data-fractal="julia" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let phase = 0;
  const baseAngle = Math.random() * Math.PI * 2;
  const radius = 0.6 + Math.random() * 0.35;
  const phaseSpeed = 0.003 + Math.random() * 0.006;

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const cr = radius * Math.cos(baseAngle + phase);
    const ci = radius * Math.sin(baseAngle + phase);
    phase += phaseSpeed;
    const scale = 3 / Math.min(w, h);
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const zr = (px - w / 2) * scale, zi = (py - h / 2) * scale;
        const t = julia(zr, zi, cr, ci, 28);
        const col = lerpColor(
          [0, 0, 0],
          t < 1 ? lerpColor(MAGENTA, CYAN, Math.pow(t, 0.4)) : [0, 0, 0],
          t < 1 ? 0.2 + 0.8 * t : 0
        );
        const i = (py * w + px) * 4;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

    return throttledRaf(draw);
}
