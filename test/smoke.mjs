#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const VALID_PAGES = ["index", "nodes", "patches", "cipher", "inject", "reversing", "hive", "toolz"];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function testConfig() {
  const configPath = join(ROOT, "src/data/config.json");
  assert(existsSync(configPath), `Config not found: ${configPath}`);

  const raw = readFileSync(configPath, "utf-8");
  let config;
  try {
    config = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid config JSON: ${e.message}`);
  }

  for (const page of VALID_PAGES) {
    assert(config[page], `Missing page config: ${page}`);
    assert(Array.isArray(config[page].layout), `Page ${page} missing layout array`);
  }

  assert(config.index.categories?.length === 14, "Index should have 14 categories");
  assert(config.index.heroTitle, "Index missing heroTitle");

  console.log("✓ Config valid");
}

function testHtml() {
  const indexPath = join(ROOT, "index.html");
  assert(existsSync(indexPath), "index.html not found");

  const html = readFileSync(indexPath, "utf-8");
  assert(html.includes('id="bento"'), "index.html missing #bento");
  assert(html.includes('id="hero-cmd"'), "index.html missing #hero-cmd");
  assert(html.includes("src/app.js"), "index.html missing app.js script");

  console.log("✓ HTML structure valid");
}

async function testAppLoad() {
  const url = process.env.SERVER_URL;
  if (!url) return;

  const res = await fetch(url);
  assert(res.ok, `App fetch failed: ${res.status}`);

  const html = await res.text();
  assert(html.includes('id="bento"'), "App response missing #bento");
  assert(html.includes("src/app.js"), "App response missing app.js");

  console.log(`✓ App loads at ${url}`);
}

async function main() {
  try {
    testConfig();
    testHtml();
    await testAppLoad();
    console.log("\n✓ Smoke test passed");
  } catch (e) {
    console.error("\n✗ Smoke test failed:", e.message);
    process.exit(1);
  }
}

main();
