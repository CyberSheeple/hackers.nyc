import { decodeToBytes } from "./encode.js";

const SALT = "hackers.nyc-config-salt";
const ITERATIONS = 600_000;
const KEY_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;

function getKeyMaterial(password) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function deriveKey(password) {
  const keyMaterial = await getKeyMaterial(password);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(SALT),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

function toRawBytes(str) {
  if (/^[A-Za-z0-9+/]+=*$/.test(str)) {
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  }
  return decodeToBytes(str);
}

async function decryptString(ciphertextEncoded, key) {
  const raw = toRawBytes(ciphertextEncoded);
  if (raw.length < IV_LEN + TAG_LEN) throw new Error("Invalid ciphertext");
  const iv = raw.slice(0, IV_LEN);
  const tag = raw.slice(-TAG_LEN);
  const ciphertext = raw.slice(IV_LEN, -TAG_LEN);
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LEN * 8 },
    key,
    combined
  );
  return new TextDecoder().decode(decrypted);
}

async function processValue(value, key, decryptFn) {
  if (key === "id") return value;
  if (typeof value === "string") {
    if (key === "href" && value.trimStart().startsWith("#")) return value;
    if (key === "route") return value;
    return decryptFn(value);
  }
  if (Array.isArray(value)) return Promise.all(value.map((v) => processValue(v, null, decryptFn)));
  if (value !== null && typeof value === "object") {
    const out = {};
    const skipHref = value.internal === true || value.hrefEncrypt === false;
    for (const [k, v] of Object.entries(value)) {
      if (k === "href" && skipHref) {
        out[k] = v;
      } else {
        out[k] = await processValue(v, k, decryptFn);
      }
    }
    return out;
  }
  return value;
}

export async function decryptConfig(encryptedConfig, password) {
  const key = await deriveKey(password);
  const decryptFn = (s) => decryptString(s, key);
  return processValue(JSON.parse(JSON.stringify(encryptedConfig)), null, decryptFn);
}
