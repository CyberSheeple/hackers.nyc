#!/usr/bin/env node
/**
 * Unit tests for src/bentos/anims/fractal.js
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import { html } from "../../src/bentos/anims/fractal.js";

describe("fractal html", () => {
  test("returns string", () => {
    const out = html("mandelbrot");
    assert.strictEqual(typeof out, "string");
  });

  test("includes data-fractal with type", () => {
    assert.ok(html("mandelbrot").includes('data-fractal="mandelbrot"'));
    assert.ok(html("julia").includes('data-fractal="julia"'));
  });

  test("includes fractal-canvas", () => {
    assert.ok(html("plasma").includes("fractal-canvas"));
  });

  test("includes bento-card--fractal", () => {
    assert.ok(html("gol").includes("bento-card--fractal"));
  });
});
