#!/usr/bin/env node
/**
 * Unit tests for src/decrypt.js
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import { decryptConfig } from "../../src/decrypt.js";

describe("decryptConfig", () => {
  test("is a function", () => {
    assert.strictEqual(typeof decryptConfig, "function");
  });

  test("rejects wrong password with encrypted config", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const configPath = join(dirname(fileURLToPath(import.meta.url)), "../../src/data/config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    if (!config?.index?.heroTitle || config.index.heroTitle.length < 40) {
      return; // config not encrypted, skip
    }
    await assert.rejects(
      () => decryptConfig(config, "wrong-password")
    );
  });
});
