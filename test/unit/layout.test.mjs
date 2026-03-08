#!/usr/bin/env node
import { test, describe } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  slotClasses,
  buildRandomLayout,
  buildIndexLayout,
} from "../../src/layout.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");

function loadConfig() {
  const configPath = join(ROOT, "src/data/config.json");
  return JSON.parse(readFileSync(configPath, "utf8"));
}

describe("slotClasses", () => {
  test("base classes", () => {
    assert.ok(slotClasses({}).includes("bento-slot"));
  });

  test("colSpan", () => {
    assert.ok(slotClasses({ colSpan: 2 }).includes("col-span-2"));
  });

  test("rowSpan", () => {
    assert.ok(slotClasses({ rowSpan: 3 }).includes("row-span-3"));
  });

  test("colFull", () => {
    assert.ok(slotClasses({ colFull: true }).includes("col-full"));
  });
});

describe("buildRandomLayout", () => {
  test("returns array", () => {
    const layout = buildRandomLayout(
      { layout: [{ id: "desc" }], links: [] },
      "nodes",
      123
    );
    assert(Array.isArray(layout));
  });

  test("includes desc when in config", () => {
    const layout = buildRandomLayout(
      { layout: [{ id: "desc" }], links: [] },
      "nodes",
      123
    );
    const desc = layout.find((i) => i.id === "desc");
    assert.ok(desc);
  });

  test("includes link slots when links present", () => {
    const layout = buildRandomLayout(
      {
        layout: [{ id: "desc" }],
        links: [{ href: "#", name: "A" }, { href: "#", name: "B" }],
      },
      "nodes",
      123
    );
    const links = layout.filter((i) => i.id === "link");
    assert.ok(links.length >= 2);
  });
});

describe("buildIndexLayout", () => {
  test("returns array", async () => {
    const config = await loadConfig();
    const layout = buildIndexLayout(config, 123);
    assert(Array.isArray(layout));
  });

  test("preserves layout items", async () => {
    const config = await loadConfig();
    const layout = buildIndexLayout(config, 456);
    const ids = layout.map((i) => i.id);
    assert.ok(ids.length > 0);
  });
});

describe("loadConfig", () => {
  test("loads config with index", async () => {
    const config = await loadConfig();
    assert.ok(config.index);
    assert.ok(Array.isArray(config.index.layout));
  });

  test("loads all page configs", async () => {
    const config = await loadConfig();
    const pages = [
      "index", "nodes", "patches", "cipher", "inject", "reversing", "hive", "toolz",
      "encoding", "crypto", "forensics", "stego", "network", "fuzz", "misc"
    ];
    for (const p of pages) {
      assert.ok(config[p], `Missing ${p}. Run 'npm run encrypt-config' to regenerate config.json from secret.json.`);
    }
  });
});
