import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

const CENTERS = [
  [-0.5, 0],
  [-0.17, 1.04],
  [0.3, 0],
  [-0.76, 0.12],
  [-0.235, 0.827],
  [0.28, 0.008],
];

function mandelbrot(cr, ci, maxIter) {
  let zr = 0, zi = 0;
  for (let i = 0; i < maxIter; i++) {
    const zr2 = zr * zr, zi2 = zi * zi;
    if (zr2 + zi2 > 4) return i / maxIter;
    zi = 2 * zr * zi + ci;
    zr = zr2 - zi2 + cr;
  }
  return 1;
}

export const html = `
  <div class="bento-card bento-card--fractal" id="fractal-mandelbrot" title="Click to restart with random seed">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[FX]</span>
    <canvas class="fractal-canvas" data-fractal="mandelbrot" aria-hidden="true"></canvas>
  </div>
`;

const MIN_ZOOM = 20;
const MAX_ZOOM = 5e5;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let zoom = MIN_ZOOM;
  const idx = Math.floor(Math.random() * CENTERS.length);
  const centerX = CENTERS[idx][0], centerY = CENTERS[idx][1];
  const zoomSpeed = 0.0009 + Math.random() * 0.00045;

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const scale = (3.5 / zoom) / Math.min(w, h);
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const cr = centerX + (px - w / 2) * scale;
        const ci = centerY + (py - h / 2) * scale;
        const t = mandelbrot(cr, ci, 28);
        const col = lerpColor(
          [0, 0, 0],
          t < 1 ? lerpColor(CYAN, MAGENTA, Math.pow(t, 0.5)) : [0, 0, 0],
          t < 1 ? 0.3 + 0.7 * t : 0
        );
        const i = (py * w + px) * 4;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

    function tick() {
      zoom *= 1 + zoomSpeed;
      if (zoom > MAX_ZOOM) zoom = MIN_ZOOM;
      draw();
    }
    const stop = throttledRaf(tick);
    return stop;
}
