const CHARS = [];
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
for (let i = 0; i < 32; i++) CHARS.push(LATIN.charCodeAt(i));
for (let i = 0; i < 32; i++) CHARS.push(0x0620 + i);
for (let i = 0; i < 32; i++) CHARS.push(0x0915 + i);
for (let i = 0; i < 32; i++) CHARS.push(0x16a0 + i);
for (let i = 0; i < 32; i++) CHARS.push(0x0400 + i);
for (let i = 0; i < 32; i++) CHARS.push(0x4e00 + i);
for (let i = 0; i < 32; i++) CHARS.push(0x30a0 + i);
for (let i = 0; i < 32; i++) CHARS.push(0x0391 + i);

const BYTE_TO_CHAR = CHARS.map((c) => (c < 0x10000 ? String.fromCharCode(c) : String.fromCodePoint(c)));
const CHAR_TO_BYTE = new Map(BYTE_TO_CHAR.map((ch, i) => [ch, i]));

const CHARS_PER_SET = 32;
export const NUM_SETS = CHARS.length / CHARS_PER_SET;

export function getRandomCharFromSets(numSets) {
  const maxIdx = Math.min(CHARS.length, Math.max(1, numSets) * CHARS_PER_SET);
  return BYTE_TO_CHAR[Math.floor(Math.random() * maxIdx)];
}

export function encodeBytes(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += BYTE_TO_CHAR[u8[i]];
  return s;
}

export function decodeToBytes(str) {
  const chars = [...str];
  const out = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i++) {
    const b = CHAR_TO_BYTE.get(chars[i]);
    if (b === undefined) throw new Error(`Invalid encoded char at ${i}`);
    out[i] = b;
  }
  return out;
}

export function isEncoded(str) {
  if (typeof str !== "string" || str.length < 4) return false;
  for (const ch of str) {
    const c = ch.codePointAt(0);
    if ((c >= 0x0620 && c <= 0x063f) || (c >= 0x0915 && c <= 0x0934) ||
        (c >= 0x16a0 && c <= 0x16bf) || (c >= 0x0400 && c <= 0x041f) ||
        (c >= 0x4e00 && c <= 0x4e1f) || (c >= 0x30a0 && c <= 0x30bf) ||
        (c >= 0x1f300 && c <= 0x1f31f)) return true;
  }
  return false;
}
