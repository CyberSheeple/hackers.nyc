import { throttledRaf } from "../../utils.js";

const VARIANTS = [
  { axiom: "F", rules: { F: "FF+[+F-F-F]-[-F+F+F]" } },
  { axiom: "X", rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" } },
  { axiom: "F", rules: { F: "F[+F]F[-F]F" } },
  { axiom: "F", rules: { F: "FF-[-F+F+F]+[+F-F-F]" } },
  { axiom: "X", rules: { X: "F[+X]F[-X]+X", F: "FF" } },
];

export const html = `
  <div class="bento-card bento-card--fractal bento-card--wide" id="fractal-lsystem" title="Click to restart with random seed">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">[FX]</span>
    <canvas class="fractal-canvas" data-fractal="lsystem" aria-hidden="true"></canvas>
  </div>
`;

export function run(canvas) {
  const ctx = canvas.getContext("2d");
  let angle = 0;
  const idx = Math.floor(Math.random() * VARIANTS.length);
  const { axiom, rules } = VARIANTS[idx];
  const iterCount = axiom === "X" ? 1 : 2;
  const angleOffset = Math.random() * Math.PI * 0.5;
  const angleSpeed = 0.009 + Math.random() * 0.012;

  function expand(s, n) {
    if (n <= 0) return s;
    let out = "";
    for (let i = 0; i < s.length; i++) out += rules[s[i]] || s[i];
    return expand(out, n - 1);
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    ctx.fillStyle = "rgb(10,10,15)";
    ctx.fillRect(0, 0, w, h);
    const s = expand(axiom, iterCount);
    const branchAngle = angleOffset + 0.35 + 0.2 * Math.sin(angle);
    angle += angleSpeed;

    const unitLen = 1;
    const stack = [];
    let x = 0, y = 0, dir = -Math.PI / 2;
    let minX = 0, minY = 0, maxX = 0, maxY = 0;

    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "F" || c === "X") {
        x += Math.cos(dir) * unitLen;
        y += Math.sin(dir) * unitLen;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      } else if (c === "+") dir += branchAngle;
      else if (c === "-") dir -= branchAngle;
      else if (c === "[") stack.push({ x, y, dir });
      else if (c === "]") {
        const p = stack.pop();
        if (p) { x = p.x; y = p.y; dir = p.dir; }
      }
    }

    const treeW = maxX - minX || 1;
    const treeH = maxY - minY || 1;
    const pad = 15;
    const scale = Math.min((w - pad * 2) / treeW, (h - pad * 2) / treeH);
    const len = Math.max(1, scale * unitLen);
    const offsetX = (w - (minX + maxX) * len) / 2;
    const offsetY = (h - (minY + maxY) * len) / 2;

    const drawStack = [];
    x = 0;
    y = 0;
    dir = -Math.PI / 2;
    ctx.strokeStyle = "rgba(0,245,255,0.6)";
    ctx.lineWidth = Math.max(1, Math.min(3, (w + h) / 150));
    ctx.beginPath();
    ctx.moveTo(x * len + offsetX, y * len + offsetY);

    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "F" || c === "X") {
        x += Math.cos(dir) * unitLen;
        y += Math.sin(dir) * unitLen;
        ctx.lineTo(x * len + offsetX, y * len + offsetY);
      } else if (c === "+") dir += branchAngle;
      else if (c === "-") dir -= branchAngle;
      else if (c === "[") drawStack.push({ x, y, dir });
      else if (c === "]") {
        const p = drawStack.pop();
        if (p) {
          x = p.x;
          y = p.y;
          dir = p.dir;
          ctx.moveTo(x * len + offsetX, y * len + offsetY);
        }
      }
    }
    ctx.stroke();
  }

  return throttledRaf(draw);
}
