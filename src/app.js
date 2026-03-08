import { resizeCanvas } from "./utils.js";
import { loadConfig, slotClasses, buildRandomLayout, buildIndexLayout } from "./layout.js";
import { decryptConfig } from "./decrypt.js";
import { isEncoded, getRandomCharFromSets, NUM_SETS } from "./encode.js";
import { html as descHtml } from "./bentos/desc.js";
import { renderLink } from "./bentos/link.js";
import { html as fractalHtml } from "./bentos/anims/fractal.js";
import { html as plasmaHtml, run as runPlasma } from "./bentos/anims/plasma.js";
import { html as starfieldHtml, run as runStarfield } from "./bentos/anims/starfield.js";
import { run as runMandelbrot } from "./bentos/anims/mandelbrot.js";
import { run as runJulia } from "./bentos/anims/julia.js";
import { run as runLsystem } from "./bentos/anims/lsystem.js";
import { run as runGol } from "./bentos/anims/gol.js";
import { run as runMatrix } from "./bentos/anims/matrix.js";
import { run as runAurora } from "./bentos/anims/aurora.js";
import { run as runWaves } from "./bentos/anims/waves.js";
import { run as runOrbital } from "./bentos/anims/orbital.js";
import { run as runKaleidoscope } from "./bentos/anims/kaleidoscope.js";
import { run as runBoids } from "./bentos/anims/boids.js";
import { run as runReaction } from "./bentos/anims/reaction.js";
import { run as runVoronoi } from "./bentos/anims/voronoi.js";

const FRACTAL_RUNNERS = {
  plasma: runPlasma,
  starfield: runStarfield,
  mandelbrot: runMandelbrot,
  julia: runJulia,
  lsystem: runLsystem,
  gol: runGol,
  matrix: runMatrix,
  aurora: runAurora,
  waves: runWaves,
  orbital: runOrbital,
  kaleidoscope: runKaleidoscope,
  boids: runBoids,
  reaction: runReaction,
  voronoi: runVoronoi,
};

const VALID_PAGES = [
  "index", "nodes", "patches", "cipher", "inject", "reversing", "hive", "toolz",
  "encoding", "crypto", "web", "forensics", "stego", "network", "fuzz", "misc"
];

const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;

function isConfigEncrypted(config) {
  const t = config?.index?.heroTitle;
  if (typeof t !== "string" || t.length < 4) return false;
  return isEncoded(t) || (BASE64_RE.test(t) && t.length > 32);
}

function showPasswdPrompt() {
  const form = document.getElementById("passwd-prompt");
  const err = document.getElementById("passwd-error");
  if (form) form.classList.add("visible");
  if (err) err.classList.remove("visible");
}

function hidePasswdPrompt() {
  const form = document.getElementById("passwd-prompt");
  const err = document.getElementById("passwd-error");
  if (form) {
    form.classList.remove("visible");
    form.reset();
  }
  if (err) err.classList.remove("visible");
}

function showPasswdError(msg) {
  const err = document.getElementById("passwd-error");
  if (err) {
    err.textContent = msg;
    err.classList.add("visible");
  }
}

function randomDecryptString(len, numSets) {
  let s = "";
  for (let i = 0; i < len; i++) s += getRandomCharFromSets(numSets);
  return s;
}

const DECRYPT_DURATION_MS = 5_000;

function animateDecrypt(el, finalText) {
  const iterations = 20 + Math.floor(Math.random() * 50);
  const delayMs = DECRYPT_DURATION_MS / iterations;
  const len = Math.max(finalText.length, 8);
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (i < iterations) {
        const numSets = Math.max(1, Math.ceil(NUM_SETS * (1 - i / iterations)));
        el.textContent = randomDecryptString(len, numSets);
        i++;
        setTimeout(tick, delayMs);
      } else {
        el.textContent = finalText;
        resolve();
      }
    };
    tick();
  });
}

async function runDecryptAnimation() {
  const heroCmd = document.getElementById("hero-cmd");
  const heroText = document.getElementById("hero-text");
  const targets = [
    heroCmd,
    heroText,
    ...document.querySelectorAll(".bento .card-label, .bento .card-text, .bento .card-desc, .toolz-filter-btn"),
  ].filter(Boolean);

  const tasks = [];
  for (const el of targets) {
    const text = el.textContent;
    if (text && text.trim().length > 0) {
      tasks.push(animateDecrypt(el, text));
    }
  }
  await Promise.all(tasks);
}

function toSeedNum(val) {
  if (typeof val === "number") return val;
  return String(val).split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0) | 0, 0) >>> 0;
}

function getLayoutSeed(config, page) {
  const params = new URLSearchParams(window.location.search);
  const urlSeed = params.get("seed");
  if (urlSeed !== null) {
    const n = parseInt(urlSeed, 10);
    return Number.isNaN(n) ? toSeedNum(urlSeed) : n;
  }
  const pageSeed = config[page]?.layoutSeed;
  if (pageSeed != null) return toSeedNum(pageSeed);
  const seeds = config.layoutSeeds;
  if (seeds && typeof seeds === "object" && seeds[page] != null) return toSeedNum(seeds[page]);
  const globalSeed = config.layoutSeed;
  if (globalSeed != null) return toSeedNum(globalSeed);
  return Date.now();
}

function getPageFromRoute() {
  let hash = window.location.hash.slice(1).toLowerCase();
  if (hash && VALID_PAGES.includes(hash)) return hash;
  if (hash.startsWith("toolz")) return "toolz";
  let path = window.location.pathname.replace(/^\//, "").replace(/\/index\.html?$/i, "").replace(/^\/+|\/+$/g, "").toLowerCase();
  const m = path.match(/^pages\/([^/.]+)/);
  if (m && VALID_PAGES.includes(m[1])) path = m[1];
  if (path && VALID_PAGES.includes(path)) {
    const target = `${window.location.origin}/index.html#${path}`;
    if (window.location.href !== target) {
      window.history.replaceState(null, "", target);
    }
    return path;
  }
  return "index";
}

function navigate(page) {
  const hash = page === "index" ? "" : page;
  if (window.location.hash.slice(1) !== hash) {
    window.location.hash = hash;
  }
}

function renderCategoryCard(cat) {
  const href = cat.route ? `#${cat.route}` : (cat.href ?? "#");
  return `<a href="${href}" class="bento-card bento-card--nav" data-glitch data-route="${cat.route ?? ""}">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">${cat.label}</span>
    <span class="card-prefix">&gt;</span>
    <span class="card-text">${cat.text}</span>
  </a>`;
}

function renderToolzcatCard(cat) {
  const href = `#${cat.id}`;
  return `<a href="${href}" class="bento-card bento-card--nav" data-glitch data-route="${cat.id}">
    <span class="card-corner card-corner--tl"></span>
    <span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span>
    <span class="card-corner card-corner--br"></span>
    <span class="card-label">learn</span>
    <span class="card-prefix">&gt;</span>
    <span class="card-text">${cat.label}</span>
  </a>`;
}

function assembleIndexGrid(config, layout) {
  const { categories } = config.index;
  const encrypted = isConfigEncrypted(config);
  const bentoById = {
    plasma: plasmaHtml,
    starfield: starfieldHtml,
  };

  const toolzCats = config.toolz?.categories ?? [];
  return layout
    .map((item) => {
      let content = "";
      if (item.id === "category") {
        const cat = categories?.[item.index];
        if (!cat) return "";
        content = renderCategoryCard(cat);
      } else if (item.id === "toolzcat") {
        const cat = toolzCats[item.index];
        if (!cat || cat.id === "all") return "";
        content = renderToolzcatCard(cat);
      } else if (item.id === "cybersheeple") {
        content = renderLink(config.index.cybersheeple, -1);
      } else if (item.id?.startsWith("fractal:")) {
        content = fractalHtml(item.id.slice(8));
      } else {
        const html = bentoById[item.id];
        content = typeof html === "function" ? html() : html ?? "";
      }
      if (!content) return "";
      return `<div class="${slotClasses(item)}">${content}</div>`;
    })
    .filter(Boolean)
    .join("\n");
}

function assembleSubpageGrid(page, pageConfig, layout) {
  let links = Array.isArray(pageConfig.links) ? [...pageConfig.links] : pageConfig.links ?? [];
  if (page === "toolz") links.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }));
  let linkIndex = 0;

  return layout
    .map((item) => {
      let content = "";
      if (item.id === "desc") {
        content = descHtml();
      } else if (item.id === "link") {
        const link = links[linkIndex++];
        if (!link) return "";
        const opts = page === "toolz" && link.category ? { category: link.category } : {};
        content = renderLink(link, linkIndex - 1, opts);
      } else if (item.id.startsWith("fractal:")) {
        content = fractalHtml(item.id.slice(8));
      } else if (item.id === "filters" && page === "toolz") {
        const cats = pageConfig.categories ?? [];
        content = `<div class="toolz-filters" id="toolz-filters" role="group" aria-label="Filter tools by category">${cats
          .map((c) => `<button type="button" class="toolz-filter-btn${c.id === "all" ? " active" : ""}" data-category="${c.id}">${c.label}</button>`)
          .join("")}</div>`;
      }
      if (!content) return "";
      return `<div class="${slotClasses(item)}">${content}</div>`;
    })
    .filter(Boolean)
    .join("\n");
}

function updateShell(page, pageConfig) {
  const isIndex = page === "index";
  document.body.dataset.page = page;
  document.title = pageConfig?.title ?? "hackers.nyc";

  const heroCmd = document.getElementById("hero-cmd");
  const heroText = document.getElementById("hero-text");
  const heroCursor = document.getElementById("hero-cursor");
  if (heroCmd) heroCmd.textContent = pageConfig?.heroTitle ?? "whoami";
  if (heroText) heroText.textContent = pageConfig?.heroBio ?? "";
  if (heroCursor) heroCursor.style.display = isIndex ? "" : "none";
  const uptimeSep = document.getElementById("hud-uptime-sep");
  const uptimeLabel = document.getElementById("hud-uptime-label");
  const uptimeValue = document.getElementById("uptime");
  const hudTimestamp = document.getElementById("hud-timestamp");
  const hudBack = document.getElementById("hud-back");
  const hudFooter = document.getElementById("hud-footer");

  if (uptimeSep) uptimeSep.style.display = isIndex ? "" : "none";
  if (uptimeLabel) uptimeLabel.style.display = isIndex ? "" : "none";
  if (uptimeValue) uptimeValue.style.display = isIndex ? "" : "none";
  if (hudTimestamp) hudTimestamp.style.display = isIndex ? "" : "none";
  if (hudBack) hudBack.style.display = isIndex ? "none" : "";
  if (hudFooter) hudFooter.style.display = "";
}

function isAnimation(item) {
  return item?.id?.startsWith("fractal:") || item?.id === "plasma" || item?.id === "starfield";
}

function countConnections(layout) {
  return layout.filter((i) => i.id !== "filters" && !isAnimation(i)).length;
}

function updateConnections(count) {
  const el = document.getElementById("hud-connections");
  if (el) el.textContent = String(count);
}

function updateSeed(seed) {
  const el = document.getElementById("hud-seed");
  if (el) el.textContent = String(seed);
}

function initFractals(runners) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  document.querySelectorAll(".fractal-canvas").forEach((canvas) => {
    let stop = null;
    const type = canvas.dataset.fractal;
    const run = runners[type];

    function restart() {
      if (stop) stop();
      resizeCanvas(canvas);
      stop = run?.(canvas) ?? null;
    }

    requestAnimationFrame(restart);
    const card = canvas.closest(".bento-card");
    if (card) {
      card.addEventListener("click", restart);
      new ResizeObserver(() => resizeCanvas(canvas)).observe(card);
    }
  });
}

function initGlitch() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;
  document.querySelectorAll("[data-glitch]").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("glitch");
      setTimeout(() => card.classList.remove("glitch"), 300);
    });
    card.addEventListener("focus", () => {
      card.classList.add("glitch");
      setTimeout(() => card.classList.remove("glitch"), 300);
    });
  });
}

const TYPEWRITER_MS = 18;
const PAUSE_AFTER_MS = 2500;

function initDescBento(page, config) {
  const descCard = document.getElementById("desc-bento");
  if (!descCard) return;

  const descText = descCard.querySelector(".desc-text");
  if (!descText) return;

  let blocks = config?.pageCommands?.[page];
  if ((!blocks || blocks.length === 0) && config[page]?.resourceCategory) {
    blocks = config?.pageCommands?.toolz;
  }
  if (!blocks || blocks.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let idx = 0;
  let timeoutId = null;
  let buffer = "";
  const SEP = "\n\n";

  function typewriter(str, pos = 0) {
    if (reducedMotion) {
      buffer += (buffer ? SEP : "") + str;
      descText.textContent = buffer;
      descText.scrollTop = descText.scrollHeight;
      timeoutId = setTimeout(cycle, PAUSE_AFTER_MS);
      return;
    }
    if (pos <= str.length) {
      const typed = str.slice(0, pos);
      descText.textContent = buffer + (buffer ? SEP : "") + typed;
      descText.scrollTop = descText.scrollHeight;
      if (pos < str.length) {
        timeoutId = setTimeout(() => typewriter(str, pos + 1), TYPEWRITER_MS);
      } else {
        buffer += (buffer ? SEP : "") + str;
        if (buffer.length > 8000) buffer = buffer.slice(-8000);
        timeoutId = setTimeout(cycle, PAUSE_AFTER_MS);
      }
    }
  }

  function cycle() {
    typewriter(blocks[idx]);
    idx = (idx + 1) % blocks.length;
  }
  cycle();
}

function initLinkDescriptions() {
  document.querySelectorAll(".bento-card[data-desc]").forEach((card) => {
    card.classList.add("bento-card--link");
    const desc = card.dataset.desc;
    const span = document.createElement("span");
    span.className = "card-desc";
    span.textContent = desc;
    span.setAttribute("aria-hidden", "true");
    card.appendChild(span);
  });
}

function initToolzFilters(pageConfig) {
  const filtersEl = document.getElementById("toolz-filters");
  const bentoEl = document.getElementById("bento");
  const heroCmd = document.getElementById("hero-cmd");
  if (!filtersEl || !bentoEl) return;

  const baseTitle = pageConfig?.heroTitle ?? "cat toolz";

  function updateHeroTitle(cat, btn) {
    if (heroCmd) {
      heroCmd.textContent = cat === "all" ? baseTitle : `${baseTitle} | grep -Ri ${(btn?.textContent ?? cat).trim()} `;
    }
  }

  const hash = window.location.hash.slice(1).toLowerCase();
  const toolzCatMatch = hash.startsWith("toolz/") ? hash.slice(6).split("/")[0] : null;
  const validCatIds = (pageConfig?.categories ?? []).map((c) => c.id);
  let activeCat = toolzCatMatch && validCatIds.includes(toolzCatMatch) ? toolzCatMatch : "all";

  filtersEl.querySelectorAll(".toolz-filter-btn").forEach((b) => b.classList.toggle("active", b.dataset.category === activeCat));
  bentoEl.querySelectorAll(".bento-card--link").forEach((el) => {
    const show = activeCat === "all" || el.dataset.category === activeCat;
    el.closest(".bento-slot")?.classList.toggle("toolz-card-hidden", !show);
  });
  updateHeroTitle(activeCat, null);

  filtersEl.querySelectorAll(".toolz-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      const isTogglingOff = cat === activeCat;
      activeCat = isTogglingOff ? "all" : cat;

      filtersEl.querySelectorAll(".toolz-filter-btn").forEach((b) => b.classList.toggle("active", b.dataset.category === activeCat));
      bentoEl.querySelectorAll(".bento-card--link").forEach((el) => {
        const show = activeCat === "all" || el.dataset.category === activeCat;
        el.closest(".bento-slot")?.classList.toggle("toolz-card-hidden", !show);
      });
      updateHeroTitle(activeCat, isTogglingOff ? null : btn);
      const newHash = activeCat === "all" ? "toolz" : `toolz/${activeCat}`;
      if (window.location.hash.slice(1).toLowerCase() !== newHash) {
        window.history.replaceState(null, "", `#${newHash}`);
      }
    });
  });
}

function initNav(config) {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-route]");
    if (!link || link.target === "_blank") return;
    e.preventDefault();
    navigate(link.dataset.route || "index");
  });
}

function resolvePageConfig(config, page) {
  const pageConfig = config[page];
  if (!pageConfig) return null;
  const resourceCat = pageConfig.resourceCategory;
  if (!resourceCat || !config.resources?.[resourceCat]) return pageConfig;
  const links = config.resources[resourceCat].links ?? [];
  return { ...pageConfig, links };
}

function render(config, page) {
  const bentoEl = document.getElementById("bento");
  if (!bentoEl) return;

  const pageConfig = resolvePageConfig(config, page);
  if (!pageConfig) return;

  updateShell(page, pageConfig);

  if (page === "index") {
    const seed = getLayoutSeed(config, page);
    const layout = buildIndexLayout(config, seed);
    bentoEl.innerHTML = assembleIndexGrid(config, layout);
    bentoEl.setAttribute("aria-label", "Links and data");
    updateConnections(countConnections(layout));
    initFractals(FRACTAL_RUNNERS);
  } else {
    const seed = getLayoutSeed(config, page);
    const layout = buildRandomLayout(pageConfig, page, seed);
    bentoEl.innerHTML = assembleSubpageGrid(page, pageConfig, layout);
    updateConnections(countConnections(layout));
    updateSeed(seed);
    bentoEl.setAttribute("aria-label", page.charAt(0).toUpperCase() + page.slice(1));
    initFractals(FRACTAL_RUNNERS);
    initDescBento(page, config);
    initLinkDescriptions();
    if (page === "toolz") initToolzFilters(pageConfig);
  }

  initGlitch();
  document.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (!a.target) a.target = "_blank";
    if (!a.rel) a.rel = "noopener noreferrer";
    else if (!a.rel.includes("noopener")) a.rel = (a.rel + " noopener noreferrer").trim();
  });
}

async function init() {
  let config;
  try {
    config = await loadConfig();
  } catch (e) {
    console.warn("Could not load config", e);
    return;
  }

  const encrypted = isConfigEncrypted(config);
  let decryptedConfig = encrypted ? null : config;

  async function onDecrypted(decConfig) {
    decryptedConfig = decConfig;
    hidePasswdPrompt();
    const page = getPageFromRoute();
    render(decConfig, page);
    await runDecryptAnimation();
  }

  if (encrypted) {
    showPasswdPrompt();
    const form = document.getElementById("passwd-prompt");
    const input = document.getElementById("passwd-input");
    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const password = input.value;
        if (!password) return;
        showPasswdError("");
        try {
          const dec = await decryptConfig(config, password);
          await onDecrypted(dec);
        } catch (err) {
          showPasswdError("Access denied.");
        }
      });
      input.focus();
    }
  }

  initNav(decryptedConfig ?? config);

  function handleRoute() {
    const page = getPageFromRoute();
    const cfg = decryptedConfig ?? config;
    render(cfg, page);
  }

  handleRoute();
  window.addEventListener("hashchange", handleRoute);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
