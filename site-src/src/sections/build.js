import {
  person, disciplines, experience, publication, education, certifications, capabilities,
} from '../data/content.js';

const h = (s) => String(s ?? '');

export function buildSections() {
  // ── profile disciplines
  document.getElementById('disciplines').innerHTML = disciplines.map((d) => `
    <article class="reveal">
      <p class="mono num">${d.n}</p>
      <h3>${h(d.h)}</h3>
      <p>${h(d.p)}</p>
    </article>`).join('');

  // ── experience timeline + publication
  document.getElementById('timeline').innerHTML = experience.map((j) => `
    <article class="job reveal ${j.current ? 'is-current' : ''}">
      <p class="job__when">${h(j.from)} — ${h(j.to)}${j.current ? ' · current' : ''}</p>
      <h3 class="job__role">${h(j.role)}</h3>
      <p class="job__org">${h(j.org)} <span>· ${h(j.where)}</span></p>
      <ul>${j.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      <div class="chips">${j.tags.map((t) => `<span>${h(t)}</span>`).join('')}</div>
    </article>`).join('') + `
    <article class="pub reveal">
      <p class="mono num">Publication · ${h(publication.when)} · ${h(publication.note)}</p>
      <h3>${h(publication.title)}</h3>
      <p>${h(publication.authors)}</p>
      <p class="mono" style="margin-top:8px">${h(publication.venue)} · ${h(publication.where)}</p>
    </article>`;

  // ── education + certifications
  document.getElementById('edu').innerHTML = education.map((e) => `
    <article class="reveal">
      <p class="mono">${h(e.from)}${e.from ? ' — ' : ''}${h(e.to)}</p>
      <div>
        <h3>${h(e.degree)}</h3>
        <p>${h(e.org)}</p>
        ${e.tags?.length ? `<div class="chips" style="margin-top:12px">${e.tags.map((t) => `<span>${h(t)}</span>`).join('')}</div>` : ''}
      </div>
      <span class="res">${h(e.result)}</span>
    </article>`).join('');

  document.getElementById('certs').innerHTML = certifications.map((c) => `
    <div class="reveal"><h4>${h(c.h)}</h4><p>${h(c.org)} · ${h(c.when)}</p></div>`).join('');

  // ── capabilities
  document.getElementById('caps').innerHTML = capabilities.map((g) => `
    <section class="reveal">
      <h3>${h(g.h)}</h3>
      <ul>${g.items.map(([label, core]) => `<li class="${core ? 'core' : ''}">${h(label)}</li>`).join('')}</ul>
    </section>`).join('');

  // ── contact rows
  const rows = [
    ['Email', person.email, `mailto:${person.email}`, true],
    ['Phone', person.phone, `tel:${person.phone.replace(/\s/g, '')}`, true],
    ['LinkedIn', person.linkedin.label, person.linkedin.href, false],
    ['GitHub', person.github.label, person.github.href, false],
    ['Based in', person.location, '', false],
  ];
  document.getElementById('contactRows').innerHTML = rows.map(([k, v, href, copy]) => `
    <li>
      <span class="k">${h(k)}</span>
      ${href ? `<a class="v" href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} data-cursor="${k.toLowerCase()}">${h(v)}</a>`
             : `<span class="v">${h(v)}</span>`}
      ${copy ? `<button class="copy" data-copy="${h(v)}" data-cursor="copy">copy</button>` : ''}
    </li>`).join('');

  document.getElementById('contactRows').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      const was = b.textContent;
      b.textContent = 'copied';
      setTimeout(() => { b.textContent = was; }, 1400);
    } catch { /* clipboard blocked — the value is visible next to the button anyway */ }
  });

  document.getElementById('year').textContent = String(new Date().getFullYear());
}

// count-up for the hero figures
export function animateCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count);
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = String(Math.round(to * e));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
  });
}

export function initForm() {
  const form = document.getElementById('form');
  const status = document.getElementById('formStatus');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = form.querySelector('[name="access_key"]').value;
    if (!key || key.includes('0000-0000')) {
      status.textContent = 'Form key not set — email works, or paste your Web3Forms key into index.html.';
      status.classList.add('err');
      return;
    }
    status.classList.remove('err');
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      const json = await res.json();
      if (json.success) { status.textContent = 'Sent — I will reply from my inbox.'; form.reset(); }
      else { status.textContent = json.message || 'That did not go through.'; status.classList.add('err'); }
    } catch {
      status.textContent = 'Network error — try email instead.';
      status.classList.add('err');
    }
  });
}
