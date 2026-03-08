#!/usr/bin/env node
/**
 * Unit tests for src/bentos/desc.js
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import { html } from "../../src/bentos/desc.js";

describe("desc html", () => {
  test("returns string", () => {
    const out = html();
    assert.strictEqual(typeof out, "string");
  });

  test("includes desc-bento id", () => {
    assert.ok(html().includes('id="desc-bento"'));
  });

  test("includes bento-card--desc class", () => {
    assert.ok(html().includes("bento-card--desc"));
  });

  test("includes INTEL label", () => {
    assert.ok(html().includes("[INTEL]"));
  });
});
