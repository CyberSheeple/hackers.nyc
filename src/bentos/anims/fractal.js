/**
 * Fractal bento — canvas placeholder for subpage fractals
 */

export function html(type) {
  return `
    <div class="bento-card bento-card--fractal" title="Click to restart">
      <span class="card-corner card-corner--tl"></span><span class="card-corner card-corner--tr"></span>
      <span class="card-corner card-corner--bl"></span><span class="card-corner card-corner--br"></span>
      <span class="card-label">[FX]</span>
      <canvas class="fractal-canvas" data-fractal="${type}" aria-hidden="true"></canvas>
    </div>`;
}
