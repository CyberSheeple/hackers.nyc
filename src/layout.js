import { ANIM_TYPES } from "./bentos/anims/index.js";

const COLS = 4;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let animDeck = null;

function getAnimDeck(rng) {
  if (!animDeck || animDeck.length === 0) {
    animDeck = shuffle([...ANIM_TYPES], rng);
  }
  return animDeck;
}

function drawFromDeck(rng, pool, n) {
  const deck = getAnimDeck(rng);
  const poolSet = new Set(pool);
  const drawn = [];
  let attempts = 0;
  const maxAttempts = deck.length * 2;
  while (drawn.length < n && attempts < maxAttempts) {
    const t = deck.shift();
    deck.push(t);
    attempts++;
    if (poolSet.has(t)) {
      drawn.push(t);
    }
  }
  return drawn;
}

function insertRandomAnimations(ordered, rng, pool, idPrefix = "fractal:") {
  const nonAnim = ordered.filter((i) => !isAnimation(i));
  const existingAnims = ordered.filter(isAnimation);
  const totalTarget = nonAnim.length + existingAnims.length;
  const animTarget = Math.max(1, Math.round(totalTarget * 0.1));
  const toAdd = Math.max(0, animTarget - existingAnims.length);
  if (toAdd === 0) return ordered;

  const newAnims = drawFromDeck(rng, pool, toAdd).map((t) => ({
    id: idPrefix ? `${idPrefix}${t}` : t,
    colSpan: 1,
    rowSpan: 1,
  }));

  let result = [...ordered];
  for (const anim of newAnims) {
    const idx = Math.floor(rng() * (result.length + 1));
    result.splice(idx, 0, anim);
  }
  return result;
}

function packGrid(items, rng) {
  const grid = [];
  const result = [];

  function get(row, col) {
    return grid[row]?.[col] ?? false;
  }
  function set(row, col, val) {
    if (!grid[row]) grid[row] = [];
    grid[row][col] = val;
  }
  function fits(row, col, w, h) {
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        if (get(r, c)) return false;
      }
    }
    return true;
  }
  function place(row, col, w, h) {
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) set(r, c, true);
    }
  }

  for (const item of items) {
    const w = item.colSpan || 1;
    const h = item.rowSpan || 1;
    let placed = false;
    for (let row = 0; !placed; row++) {
      for (let col = 0; col <= COLS - w && !placed; col++) {
        if (fits(row, col, w, h)) {
          place(row, col, w, h);
          result.push({ ...item });
          placed = true;
        }
      }
    }
  }
  return result;
}

function isIntel(item) {
  return item.id === "desc";
}

function isFractal(item) {
  return item.id?.startsWith("fractal:");
}

function isAnimation(item) {
  return isFractal(item) || item.id === "plasma" || item.id === "starfield";
}

export function buildRandomLayout(pageConfig, page, seed = Date.now()) {
  const rng = mulberry32(seed);
  const raw = pageConfig.layout || [];

  const intel = raw.find(isIntel);
  const filters = raw.filter((i) => i.id === "filters");
  const explicitFractals = raw.filter((i) => i.id?.startsWith("fractal:"));

  let ordered;
  if (Array.isArray(pageConfig.links) && pageConfig.links.length > 0) {
    const links = pageConfig.links.map(() => ({ id: "link", colSpan: 1, rowSpan: 1 }));
    const hasLinksPlaceholder = raw.some((i) => i.id === "links");
    if (hasLinksPlaceholder) {
      ordered = raw
        .filter((i) => !isIntel(i) && i.id !== "filters")
        .flatMap((i) =>
          i.id === "links" ? links : i.id?.startsWith("fractal:") ? [{ ...i }] : [i]
        );
      if (!ordered.some(isAnimation)) {
        ordered = insertRandomAnimations(ordered, rng, ANIM_TYPES);
      }
    } else {
      const fractalEvery = pageConfig.fractalEvery;
      if (typeof fractalEvery === "number" && fractalEvery > 0 && explicitFractals.length === 0) {
        ordered = links;
        ordered = insertRandomAnimations(ordered, rng, ANIM_TYPES);
      } else {
        ordered = [...links, ...explicitFractals.map((i) => ({ ...i }))];
        if (explicitFractals.length === 0) {
          ordered = insertRandomAnimations(ordered, rng, ANIM_TYPES);
        }
      }
    }
  } else {
    ordered = raw.filter((i) => !isIntel(i) && i.id !== "filters").map((i) => ({ ...i }));
    if (!ordered.some(isAnimation)) {
      ordered = insertRandomAnimations(ordered, rng, ANIM_TYPES);
    }
  }

  const withSizes = ordered.map((item) => {
    if (isAnimation(item)) return item;
    const colSpan = rng() < 0.6 ? 1 : 2;
    const rowSpan = rng() < 0.6 ? 1 : 2;
    return { ...item, colSpan, rowSpan };
  });

  const packed = packGrid(withSizes, rng);
  const out = [...filters];
  if (intel) {
    out.push({
      ...intel,
      colSpan: 2,
      rowSpan: 1,
      colFull: intel.id === "desc",
    });
  }
  out.push(...packed);
  return out;
}

export function buildIndexLayout(config, seed = Date.now()) {
  const rng = mulberry32(seed);
  const { layout } = config.index;
  let ordered = layout.map((i) => ({ ...i }));
  const pool = ANIM_TYPES.filter((t) => !ordered.some((a) => a.id === `fractal:${t}` || a.id === t));
  ordered = insertRandomAnimations(ordered, rng, pool);

  const withSizes = ordered.map((item) => {
    if (isAnimation(item)) return { ...item, colSpan: item.colSpan ?? 1, rowSpan: item.rowSpan ?? 1 };
    const colSpan = item.colSpan ?? (rng() < 0.6 ? 1 : 2);
    const rowSpan = item.rowSpan ?? (rng() < 0.6 ? 1 : 2);
    return { ...item, colSpan, rowSpan };
  });

  return packGrid(withSizes, rng);
}

export function slotClasses(item) {
  const classes = ["bento-slot"];
  if (item.colFull) {
    classes.push("col-full");
  } else {
    if (item.colSpan) classes.push(`col-span-${item.colSpan}`);
    if (item.rowSpan) classes.push(`row-span-${item.rowSpan}`);
  }
  return classes.join(" ");
}

export async function loadConfig() {
  const url = new URL("./data/config.json", import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
  return res.json();
}
