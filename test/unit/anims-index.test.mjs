#!/usr/bin/env node
import { test, describe } from "node:test";
import assert from "node:assert";
import { ANIM_TYPES } from "../../src/bentos/anims/index.js";

describe("ANIM_TYPES", () => {
  test("is non-empty array", () => {
    assert(Array.isArray(ANIM_TYPES));
    assert.ok(ANIM_TYPES.length > 0);
  });

  test("contains expected anims", () => {
    assert.ok(ANIM_TYPES.includes("plasma"));
    assert.ok(ANIM_TYPES.includes("mandelbrot"));
    assert.ok(ANIM_TYPES.includes("voronoi"));
  });

  test("all strings", () => {
    for (const t of ANIM_TYPES) {
      assert.strictEqual(typeof t, "string");
    }
  });
});
