import { lerpColor, CYAN, MAGENTA, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="reaction" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[RD]</span>
    <canvas class="fractal-canvas" data-fractal="reaction" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  const size = 64;
  let gridA = new Float32Array(size * size);
  let gridB = new Float32Array(size * size);
  const Da = 1, Db = 0.5, f = 0.055, k = 0.062;

  for (let i = 0; i < size * size; i++) {
    gridA[i] = 1;
    gridB[i] = Math.random() < 0.01 ? 1 : 0;
  }
  const center = Math.floor(size / 2);
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++)
      gridB[(center + dy) * size + (center + dx)] = 1;

  function step() {
    const nextA = new Float32Array(size * size);
    const nextB = new Float32Array(size * size);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const i = y * size + x;
        const la = gridA[i - 1] + gridA[i + 1] + gridA[i - size] + gridA[i + size] - 4 * gridA[i];
        const lb = gridB[i - 1] + gridB[i + 1] + gridB[i - size] + gridB[i + size] - 4 * gridB[i];
        const ab2 = gridA[i] * gridB[i] * gridB[i];
        nextA[i] = gridA[i] + (Da * la - ab2 + f * (1 - gridA[i])) * 0.75;
        nextB[i] = gridB[i] + (Db * lb + ab2 - (k + f) * gridB[i]) * 0.75;
        nextA[i] = Math.max(0, Math.min(1, nextA[i]));
        nextB[i] = Math.max(0, Math.min(1, nextB[i]));
      }
    }
    gridA = nextA;
    gridB = nextB;
  }

  function draw() {
    step();
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const scaleX = size / w, scaleY = size / h;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const sx = Math.floor(px * scaleX), sy = Math.floor(py * scaleY);
        const b = gridB[Math.min(sy, size - 1) * size + Math.min(sx, size - 1)];
        const col = lerpColor([10, 10, 15], CYAN, b);
        const i = (py * w + px) * 4;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  return throttledRaf(draw);
}
