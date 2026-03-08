#!/usr/bin/env node
/**
 * Bento smoke tests — verify each used bento loads and runs without throwing
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BENTOS_DIR = join(ROOT, "src/bentos");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/** Mock canvas for Node — avoids createImageData(0,0) and provides required 2d context */
function createMockCanvas(w = 64, h = 64) {
  const id = { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
  return {
    width: w,
    height: h,
    getContext: () => ({
      createImageData: (a, b) => {
        const width = typeof a === "number" ? a : a.width;
        const height = typeof a === "number" ? b : a.height;
        return {
          data: new Uint8ClampedArray(Math.max(1, width) * Math.max(1, height) * 4),
          width,
          height,
        };
      },
      putImageData: () => {},
      fillRect: () => {},
      fillStyle: "",
      fillText: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      arc: () => {},
      strokeStyle: "",
      lineWidth: 0,
      font: "",
    }),
  };
}

/** Mock requestAnimationFrame — async to avoid stack overflow, supports cancel */
const pending = new Map();
let nextId = 0;
const origRaf = globalThis.requestAnimationFrame;
const origCancel = globalThis.cancelAnimationFrame;

function mockRaf() {
  globalThis.requestAnimationFrame = (cb) => {
    const id = ++nextId;
    const t = setTimeout(() => cb(performance.now()), 0);
    pending.set(id, t);
    return id;
  };
  globalThis.cancelAnimationFrame = (id) => {
    const t = pending.get(id);
    if (t) clearTimeout(t);
    pending.delete(id);
  };
}

function restoreRaf() {
  pending.forEach((t) => clearTimeout(t));
  pending.clear();
  globalThis.requestAnimationFrame = origRaf;
  globalThis.cancelAnimationFrame = origCancel;
}

async function testBento(name, runFn) {
  mockRaf();
  try {
    const canvas = createMockCanvas();
    const stop = runFn(canvas);
    assert(typeof stop === "function", `${name}: run() should return stop function`);
    await new Promise((r) => setTimeout(r, 50));
    if (stop) stop();
  } finally {
    restoreRaf();
  }
}

async function testBentos() {
  const configPath = join(ROOT, "src/data/config.json");
  const config = JSON.parse(readFileSync(configPath, "utf-8"));

  const fractalTypes = new Set();
  for (const page of Object.values(config)) {
    for (const item of page.layout || []) {
      if (item.id?.startsWith("fractal:")) fractalTypes.add(item.id.slice(8));
    }
  }

  const RUNNERS = {
    plasma: (await import("../src/bentos/anims/plasma.js")).run,
    starfield: (await import("../src/bentos/anims/starfield.js")).run,
    mandelbrot: (await import("../src/bentos/anims/mandelbrot.js")).run,
    julia: (await import("../src/bentos/anims/julia.js")).run,
    lsystem: (await import("../src/bentos/anims/lsystem.js")).run,
    gol: (await import("../src/bentos/anims/gol.js")).run,
    matrix: (await import("../src/bentos/anims/matrix.js")).run,
    aurora: (await import("../src/bentos/anims/aurora.js")).run,
    waves: (await import("../src/bentos/anims/waves.js")).run,
    orbital: (await import("../src/bentos/anims/orbital.js")).run,
    kaleidoscope: (await import("../src/bentos/anims/kaleidoscope.js")).run,
    boids: (await import("../src/bentos/anims/boids.js")).run,
    reaction: (await import("../src/bentos/anims/reaction.js")).run,
    voronoi: (await import("../src/bentos/anims/voronoi.js")).run,
  };

  for (const type of fractalTypes) {
    const run = RUNNERS[type];
    assert(run, `Fractal type "${type}" has no runner in app.js`);
    await testBento(`fractal:${type}`, run);
  }

  const { html: descHtml } = await import("../src/bentos/desc.js");
  assert(typeof descHtml === "function", "desc: html should be function");
  assert(typeof descHtml() === "string", "desc: html() should return string");

  const { renderLink } = await import("../src/bentos/link.js");
  assert(typeof renderLink === "function", "link: renderLink should be function");
  const linkHtml = renderLink({ href: "https://x.com", name: "test", desc: "d" }, 0);
  assert(linkHtml.includes("bento-card"), "link: renderLink should produce card HTML");

  const { html: fractalHtml } = await import("../src/bentos/anims/fractal.js");
  assert(typeof fractalHtml === "function", "fractal: html should be function");
  assert(fractalHtml("mandelbrot").includes("data-fractal"), "fractal: html(type) should include data-fractal");


  console.log(`✓ All ${fractalTypes.size + 3} bentos OK`);
}

async function main() {
  try {
    await testBentos();
    console.log("✓ Bento tests passed");
  } catch (e) {
    console.error("\n✗ Bento test failed:", e.message);
    process.exit(1);
  }
}

main();
