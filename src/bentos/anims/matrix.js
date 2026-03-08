/**
 * Matrix rain bento
 */

import { throttledRaf } from "../../utils.js";

const CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01";
const COLS = 12;

export const html = `
  <div class="bento-card bento-card--fractal" data-fractal="matrix" title="Click to restart">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[MT]</span>
    <canvas class="fractal-canvas" data-fractal="matrix" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  const drops = Array(COLS).fill(0).map(() => Math.random() * 20);

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    ctx.fillStyle = "rgba(10,10,15,0.15)";
    ctx.fillRect(0, 0, w, h);
    const colW = w / COLS;
    ctx.font = `${Math.max(10, colW * 0.8)}px monospace`;
    ctx.fillStyle = "#00f5ff";

    for (let c = 0; c < COLS; c++) {
      const x = c * colW + colW / 4;
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillStyle = "#00f5ff";
      ctx.fillText(char, x, drops[c] * (h / 25));
      ctx.fillStyle = "rgba(0,245,255,0.4)";
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, (drops[c] - 1) * (h / 25));
      drops[c] = (drops[c] + 0.75) % 26;
    }
  }
  return throttledRaf(draw);
}
