import { projectFilters, filters as FILTERS, projectExtras } from '../data/content.js';
import { initReveals } from '../core/scroll.js';
import { asset } from '../core/paths.js';

const imgName = (src) => src.replace(/\.[a-z]+$/i, '').replaceAll('/', '__') + '.webp';
const IMG = (src) => asset(`/img/${imgName(src)}`);

// every project opens in the same case-study reader; freelance ones get their own grid, not the work grid
let PROJECTS = [], CAPTIONS = {}, onOpenSound = null;
const isFreelance = (p) => p.group === 'freelance';

export async function initWork(sound) {
  onOpenSound = sound;
  const [projects, captions] = await Promise.all([
    fetch(asset('/data/projects.json')).then((r) => r.json()),
    fetch(asset('/data/captions.json')).then((r) => r.json()).catch(() => ({})),
  ]);
  PROJECTS = projects;
  CAPTIONS = captions;

  document.getElementById('workCount').textContent = String(projects.filter((p) => !isFreelance(p)).length);
  buildFilters();
  buildGrid();
  buildFreelance();
  buildCase();
}

function buildFilters() {
  const wrap = document.getElementById('filters');
  wrap.innerHTML = FILTERS.map(([id, label], i) =>
    `<button data-filter="${id}" class="${i === 0 ? 'is-on' : ''}" data-cursor="filter">${label}</button>`).join('');
  wrap.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    wrap.querySelectorAll('button').forEach((n) => n.classList.toggle('is-on', n === b));
    const f = b.dataset.filter;
    document.querySelectorAll('#workGrid .card').forEach((card) => {
      const cats = (card.dataset.cats || '').split(' ');
      card.classList.toggle('is-hidden', f !== 'all' && !cats.includes(f));
    });
  });
}

function card(p, flag) {
  const cats = projectFilters[p.slug] || [];
  const year = p.meta?.Year || '';
  const img = p.hero?.src && !p.hero.src.endsWith('.svg')
    ? `<img src="${IMG(p.hero.src)}" alt="${escapeHtml(p.hero.alt || p.title)}" loading="lazy" decoding="async" />`
    : placeholder(p.title);
  return `
      <article class="card reveal" data-slug="${p.slug}" data-cats="${cats.join(' ')}" data-cursor="open case">
        <div class="card__media">${img}</div>
        <span class="card__ref">${p.ref || ''}</span>
        ${flag ? `<span class="card__flag">${flag}</span>` : ''}
        <div class="card__body">
          <p class="card__kicker">${escapeHtml(p.kicker || '')}</p>
          <h3 class="card__title">${escapeHtml(p.title)}</h3>
          <p class="card__lede">${escapeHtml(p.lede || '')}</p>
          <div class="card__tags">${[year, ...Object.values(p.meta || {}).slice(2, 4)]
            .filter(Boolean).map((t) => `<span>${escapeHtml(String(t))}</span>`).join('')}</div>
        </div>
        <i class="card__line"></i>
      </article>`;
}

function mountGrid(grid, html) {
  grid.innerHTML = html;
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.card');
    if (c) openCase(c.dataset.slug);
  });
  initReveals(grid);
}

function buildGrid() {
  mountGrid(document.getElementById('workGrid'), PROJECTS.filter((p) => !isFreelance(p)).map((p, i) => {
    const cats = projectFilters[p.slug] || [];
    return card(p, i === 0 ? 'Flagship' : (i === 1 ? 'Latest' : (cats.includes('employer') ? 'Employer work' : '')));
  }).join(''));
}

function buildFreelance() {
  const grid = document.getElementById('freelanceGrid');
  if (grid) mountGrid(grid, PROJECTS.filter(isFreelance).map((p) => card(p, 'Client work')).join(''));
}

function placeholder(title) {
  return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%">
    <rect width="800" height="500" fill="#070b10"/>
    <g fill="none" stroke="#1d2b38" stroke-width="2">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 85} 460 L${60 + i * 85} ${180 + (i % 3) * 40} L${180 + i * 70} ${120 + (i % 4) * 30}"/>`).join('')}
    </g>
    <g fill="#e08b4c" opacity=".65">
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="${60 + i * 85}" cy="460" r="5"/>`).join('')}
    </g>
    <text x="40" y="60" fill="#64788c" font-family="monospace" font-size="19">ARTWORK NOT PUBLISHED</text>
  </svg>`;
}

/* ─────────────────────────────────────────────── case study reader */
function buildCase() {
  const close = document.getElementById('caseClose');
  close.addEventListener('click', closeCase);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCase(); });
  document.getElementById('case').addEventListener('click', (e) => {
    if (e.target.id === 'case' || e.target.id === 'caseScroll') closeCase();
  });
}

export function openCase(slug) {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return;
  const scroll = document.getElementById('caseScroll');
  const extras = projectExtras[p.slug] || [];

  const body = (p.body || []).map((b) => `
    <h3>${escapeHtml(b.h || '')}</h3>
    ${(b.p || []).map((t) => `<p>${t}</p>`).join('')}`).join('');

  const metrics = (p.metrics || []).length ? `<div class="case__metrics">${p.metrics.map((m) =>
    `<div><b>${escapeHtml(m.v)}</b><span>${escapeHtml(m.l)}</span>${m.s ? `<i>${escapeHtml(m.s)}</i>` : ''}</div>`).join('')}</div>` : '';

  const specs = (p.specs || []).length ? `
    <h3>${escapeHtml(p.specs_caption || 'Specification')}</h3>
    <table class="case__specs">${p.specs.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>` : '';

  const gallery = (p.gallery || []).length ? `<div class="case__gallery">${p.gallery.map((g) => {
    const src = typeof g === 'string' ? g : g.src;
    const cap = CAPTIONS[src?.replace('project/', '')] || {};
    return `<figure><img src="${IMG(src)}" alt="${escapeHtml(cap.alt || p.title)}" loading="lazy" decoding="async" />
      ${cap.caption ? `<figcaption>${escapeHtml(cap.caption)}</figcaption>` : ''}</figure>`;
  }).join('')}</div>` : '';

  const extraBlock = extras.length ? `
    <h3>Since that write-up</h3>
    ${extras.map((t) => `<p>${t}</p>`).join('')}` : '';

  scroll.innerHTML = `
    <article class="case__inner">
      <p class="case__ref">${p.ref || ''} &nbsp;·&nbsp; ${escapeHtml(p.kicker || '')}</p>
      <h2 class="case__title">${escapeHtml(p.title)}</h2>
      <p class="case__lede">${escapeHtml(p.lede || '')}</p>
      <div class="case__meta">${Object.entries(p.meta || {}).map(([k, v]) =>
        `<div><span class="k">${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></div>`).join('')}</div>
      ${p.hero?.src && !p.hero.src.endsWith('.svg') ? `<figure class="case__hero">
          <img src="${IMG(p.hero.src)}" alt="${escapeHtml(p.hero.alt || '')}" />
          ${p.hero.caption ? `<figcaption>${escapeHtml(p.hero.caption)}</figcaption>` : ''}</figure>` : ''}
      ${metrics}
      <div class="case__body">${body}${extraBlock}${specs}</div>
      ${gallery}
      <div class="case__next">
        ${p.prev ? `<button data-go="${p.prev}" data-cursor="prev">← ${escapeHtml(title(p.prev))}</button>` : '<span></span>'}
        ${p.next ? `<button data-go="${p.next}" data-cursor="next">${escapeHtml(title(p.next))} →</button>` : '<span></span>'}
      </div>
    </article>`;

  scroll.querySelectorAll('[data-go]').forEach((b) =>
    b.addEventListener('click', (e) => { e.stopPropagation(); openCase(b.dataset.go); }));

  const overlay = document.getElementById('case');
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  scroll.scrollTop = 0;
  onOpenSound?.open?.();
  window.dispatchEvent(new CustomEvent('case:open'));
}

function title(slug) {
  return PROJECTS.find((x) => x.slug === slug)?.title || slug;
}

export function closeCase() {
  const overlay = document.getElementById('case');
  if (!overlay.classList.contains('is-open')) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  window.dispatchEvent(new CustomEvent('case:close'));
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
