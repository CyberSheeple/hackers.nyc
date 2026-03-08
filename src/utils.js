export const CYAN = [0, 245, 255];
export const MAGENTA = [255, 0, 170];
export const BLUE = [0, 102, 255];

export const MAX_CANVAS_DIM = 128;

export const ANIMATION_FPS = 15;

export function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function resizeCanvas(canvas) {
  const card = canvas?.closest(".bento-card");
  if (!card) return false;
  const rect = card.getBoundingClientRect();
  const dpr = 1;
  let w = Math.floor(rect.width * dpr);
  let h = Math.floor(rect.height * dpr);
  const scale = Math.min(1, MAX_CANVAS_DIM / Math.max(w, h, 1));
  w = Math.max(1, Math.floor(w * scale));
  h = Math.max(1, Math.floor(h * scale));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

export function throttledRaf(callback) {
  let rafId;
  let last = 0;
  const interval = 1000 / ANIMATION_FPS;

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (now - last >= interval) {
      last = now;
      callback();
    }
  }
  rafId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(rafId);
}
