#!/usr/bin/env node
/**
 * Unit tests for src/utils.js
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import {
  CYAN,
  MAGENTA,
  BLUE,
  MAX_CANVAS_DIM,
  ANIMATION_FPS,
  lerpColor,
  throttledRaf,
} from "../../src/utils.js";

describe("constants", () => {
  test("CYAN is RGB array", () => {
    assert.deepStrictEqual(CYAN, [0, 245, 255]);
  });

  test("MAGENTA is RGB array", () => {
    assert.deepStrictEqual(MAGENTA, [255, 0, 170]);
  });

  test("BLUE is RGB array", () => {
    assert.deepStrictEqual(BLUE, [0, 102, 255]);
  });

  test("MAX_CANVAS_DIM is number", () => {
    assert.strictEqual(typeof MAX_CANVAS_DIM, "number");
    assert.ok(MAX_CANVAS_DIM > 0);
  });

  test("ANIMATION_FPS is number", () => {
    assert.strictEqual(typeof ANIMATION_FPS, "number");
    assert.ok(ANIMATION_FPS > 0);
  });
});

describe("lerpColor", () => {
  test("lerp at t=0 returns first color", () => {
    const a = [0, 0, 0];
    const b = [100, 100, 100];
    assert.deepStrictEqual(lerpColor(a, b, 0), [0, 0, 0]);
  });

  test("lerp at t=1 returns second color", () => {
    const a = [0, 0, 0];
    const b = [100, 100, 100];
    assert.deepStrictEqual(lerpColor(a, b, 1), [100, 100, 100]);
  });

  test("lerp at t=0.5 returns midpoint", () => {
    const a = [0, 0, 0];
    const b = [100, 200, 50];
    assert.deepStrictEqual(lerpColor(a, b, 0.5), [50, 100, 25]);
  });
});

describe("throttledRaf", () => {
  test("returns stop function (skipped in Node - no requestAnimationFrame)", { skip: true }, () => {});
});
