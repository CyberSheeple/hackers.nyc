export function renderLink(link, index, options = {}) {
  const { category } = options;
  const catAttr = category ? ` data-category="${category}"` : "";
  const desc = (link.desc || "").replace(/"/g, "&quot;");
  const label = link.label ?? String(index + 1).padStart(2, "0");
  return `<a href="${link.href}" class="bento-card bento-card--link" data-glitch data-desc="${desc}"${catAttr} target="_blank" rel="noopener">
    <span class="card-corner card-corner--tl"></span><span class="card-corner card-corner--tr"></span>
    <span class="card-corner card-corner--bl"></span><span class="card-corner card-corner--br"></span>
    <span class="card-label">[${label}]</span>
    <span class="card-prefix">&gt;</span>
    <span class="card-text">${link.name}</span>
  </a>`;
}
