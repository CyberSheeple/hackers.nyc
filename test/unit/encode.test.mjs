#!/usr/bin/env node
/**
 * Unit tests for src/encode.js
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import {
  encodeBytes,
  decodeToBytes,
  isEncoded,
  getRandomCharFromSets,
  NUM_SETS,
} from "../../src/encode.js";

describe("encodeBytes", () => {
  test("encodes empty buffer", () => {
    const out = encodeBytes(new Uint8Array([]));
    assert.strictEqual(out, "");
  });

  test("encodes bytes roundtrip", () => {
    const input = new Uint8Array([0, 1, 32, 255]);
    const encoded = encodeBytes(input);
    assert.strictEqual(typeof encoded, "string");
    assert.strictEqual(encoded.length, 4);
    const decoded = decodeToBytes(encoded);
    assert.deepStrictEqual(Array.from(decoded), Array.from(input));
  });
});

describe("decodeToBytes", () => {
  test("decodes valid string", () => {
    const encoded = encodeBytes(new Uint8Array([1, 2, 3]));
    const decoded = decodeToBytes(encoded);
    assert.deepStrictEqual(Array.from(decoded), [1, 2, 3]);
  });

  test("throws on invalid char", () => {
    assert.throws(() => decodeToBytes("!@#$"), /Invalid encoded char/);
  });
});

describe("isEncoded", () => {
  test("returns false for short string", () => {
    assert.strictEqual(isEncoded("ab"), false);
  });

  test("returns false for plain Latin", () => {
    assert.strictEqual(isEncoded("hello world"), false);
  });

  test("returns true for non-Latin scripts", () => {
    assert.strictEqual(isEncoded("hello\u0620world"), true);
    assert.strictEqual(isEncoded("test\u0915abc"), true);
  });
});

describe("getRandomCharFromSets", () => {
  test("returns single char", () => {
    const ch = getRandomCharFromSets(1);
    assert.strictEqual(typeof ch, "string");
    assert.strictEqual(ch.length, 1);
  });

  test("respects numSets", () => {
    for (let i = 0; i < 20; i++) {
      const ch = getRandomCharFromSets(1);
      assert(/^[A-Z0-9]$/.test(ch), `Expected Latin, got ${ch}`);
    }
  });
});

describe("NUM_SETS", () => {
  test("is positive number", () => {
    assert.strictEqual(typeof NUM_SETS, "number");
    assert.ok(NUM_SETS >= 1);
  });
});
