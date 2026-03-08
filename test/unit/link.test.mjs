#!/usr/bin/env node
/**
 * Unit tests for src/bentos/link.js
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import { renderLink } from "../../src/bentos/link.js";

describe("renderLink", () => {
  test("produces anchor with bento-card class", () => {
    const html = renderLink({ href: "https://example.com", name: "Test" }, 0);
    assert.ok(html.includes("bento-card"));
    assert.ok(html.includes("bento-card--link"));
    assert.ok(html.includes('href="https://example.com"'));
    assert.ok(html.includes("Test"));
  });

  test("escapes desc in data-desc", () => {
    const html = renderLink(
      { href: "#", name: "X", desc: 'foo"bar' },
      0
    );
    assert.ok(html.includes("data-desc="));
    assert.ok(!html.includes('foo"bar'));
    assert.ok(html.includes("&quot;"));
  });

  test("uses label when provided", () => {
    const html = renderLink(
      { href: "#", name: "X", label: "GH" },
      0
    );
    assert.ok(html.includes("[GH]"));
  });

  test("pads index as label when no label", () => {
    const html = renderLink({ href: "#", name: "X" }, 4);
    assert.ok(html.includes("[05]"));
  });

  test("adds category when in options", () => {
    const html = renderLink(
      { href: "#", name: "X" },
      0,
      { category: "crypto" }
    );
    assert.ok(html.includes('data-category="crypto"'));
  });
});
