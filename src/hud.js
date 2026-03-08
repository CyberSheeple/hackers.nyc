(function () {
  "use strict";

  const UPTIME_STORAGE_KEY = "hackers.nyc:loadTime";

  function initUptime() {
    const el = document.getElementById("uptime");
    if (!el) return;

    let startTime = parseInt(sessionStorage.getItem(UPTIME_STORAGE_KEY), 10);
    if (!startTime) {
      startTime = Date.now();
      sessionStorage.setItem(UPTIME_STORAGE_KEY, String(startTime));
    }

    function format(ms) {
      const s = Math.floor(ms / 1000) % 60;
      const m = Math.floor(ms / 60000) % 60;
      const h = Math.floor(ms / 3600000);
      return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
    }

    function tick() {
      const elapsed = Date.now() - startTime;
      el.textContent = format(elapsed);
    }

    tick();
    setInterval(tick, 1000);
  }

  function initTimestamp() {
    const el = document.getElementById("timestamp");
    if (!el) return;

    function update() {
      const now = new Date();
      el.textContent = now.toISOString().slice(11, 19);
    }

    update();
    setInterval(update, 1000);
  }

  function initGlitch() {
    const cards = document.querySelectorAll("[data-glitch]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) return;

    cards.forEach((card) => {
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

  function init() {
    initUptime();
    initTimestamp();
    initGlitch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
