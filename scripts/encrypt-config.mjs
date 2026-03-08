#!/usr/bin/env node
/**
 * Encrypt secret.json → config.json
 *
 * Uses AES-256-GCM. All string values are encrypted except: id, route, href when it starts with "#", and href when parent has internal:true or hrefEncrypt:false.
 * Keys remain unencrypted. Output is valid JSON with UTF-8 encoded ciphertext (CJK + emoji, no control chars).
 *
 * Ciphertext format: encode(iv || ciphertext || authTag)
 *   iv: 12 bytes, ciphertext: variable, authTag: 16 bytes
 *
 * Key derivation: PBKDF2-SHA256, 600k iterations, salt "hackers.nyc-config-salt"
 *
 * Usage:
 *   CONFIG_SECRET=your-32-byte-key node scripts/encrypt-config.mjs
 *   npm run encrypt-config  # requires CONFIG_SECRET in env
 *
 * Output: src/data/config.json
 */

import { createCipheriv, randomBytes, pbkdf2Sync } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { encodeBytes } from "../src/encode.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const ALGORITHM = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
const SALT = "hackers.nyc-config-salt";
const ITERATIONS = 600_000;

function getKey(secret) {
  if (!secret) {
    console.error("CONFIG_SECRET env var required");
    process.exit(1);
  }
  return pbkdf2Sync(secret, SALT, ITERATIONS, KEY_LEN, "sha256");
}

function encrypt(plaintext, key) {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LEN });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return encodeBytes(Buffer.concat([iv, encrypted, tag]));
}

function processValue(value, key, encryptFn) {
  if (key === "id") return value;
  if (typeof value === "string") {
    if (key === "href" && value.trimStart().startsWith("#")) return value;
    if (key === "route") return value;
    return encryptFn(value);
  }
  if (Array.isArray(value)) return value.map((v) => processValue(v, null, encryptFn));
  if (value !== null && typeof value === "object") {
    const out = {};
    const skipHref = value.internal === true || value.hrefEncrypt === false;
    for (const [k, v] of Object.entries(value)) {
      if (k === "href" && skipHref) {
        out[k] = v;
      } else {
        out[k] = processValue(v, k, encryptFn);
      }
    }
    return out;
  }
  return value;
}

function main() {
  const secret = process.env.CONFIG_SECRET;
  const key = getKey(secret);

  const secretPath = join(ROOT, "src/data/secret.json");
  const configPath = join(ROOT, "src/data/config.json");

  const data = JSON.parse(readFileSync(secretPath, "utf8"));
  const encryptFn = (s) => encrypt(s, key);
  const encrypted = processValue(data, null, encryptFn);

  writeFileSync(configPath, JSON.stringify(encrypted, null, 2), "utf8");
  console.log(`Wrote ${configPath}`);
}

main();
