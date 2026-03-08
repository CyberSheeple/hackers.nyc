import { CYAN, throttledRaf } from "../../utils.js";

export const html = `
  <div class="bento-card bento-card--fractal" id="fractal-gol" title="Click to restart with random seed">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[GOL]</span>
    <canvas class="fractal-canvas" data-fractal="gol" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  const cellSize = 6;
  let cols = 0, rows = 0, grid = null, next = null;
  let frameCount = 0, stepInterval = 5;
  let lastW = 0, lastH = 0;

  function initGrid() {
    if (canvas.width === 0 || canvas.height === 0) return;
    cols = Math.max(1, Math.floor(canvas.width / cellSize));
    rows = Math.max(1, Math.floor(canvas.height / cellSize));
    grid = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);
    const fill = 0.25 + Math.random() * 0.2;
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < fill ? 1 : 0;
  }

  function countNeighbors(x, y) {
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + cols) % cols, ny = (y + dy + rows) % rows;
        n += grid[ny * cols + nx];
      }
    }
    return n;
  }

  function step() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const n = countNeighbors(x, y);
        const idx = y * cols + x;
        next[idx] = (n === 3 || (grid[idx] && n === 2)) ? 1 : 0;
      }
    }
    [grid, next] = [next, grid];
  }

  function draw() {
    if (canvas.width !== lastW || canvas.height !== lastH) {
      lastW = canvas.width;
      lastH = canvas.height;
      initGrid();
    }
    if (!grid?.length) return;
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const alive = grid[y * cols + x];
        const [r, g, b] = alive ? CYAN : [10, 10, 15];
        for (let dy = 0; dy < cellSize && y * cellSize + dy < canvas.height; dy++) {
          for (let dx = 0; dx < cellSize && x * cellSize + dx < canvas.width; dx++) {
            const py = y * cellSize + dy, px = x * cellSize + dx;
            const i = (py * canvas.width + px) * 4;
            data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function tick() {
    frameCount++;
    if (frameCount >= stepInterval && grid) { frameCount = 0; step(); }
    draw();
  }
  initGrid();
  return throttledRaf(tick);
}
