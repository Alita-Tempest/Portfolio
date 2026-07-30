/* =============================================================================
   THE BOARD — behaviour
   No dependencies. Everything degrades to a working static page without it.

   1  Motion preference
   2  Layer (theme) switch
   3  Navigation
   4  Typed role line
   5  Reveals & live sections
   6  HUD
   7  Reticle
   8  Project filters
   9  Lightbox
   10 Copy to clipboard
   11 View transitions
   ========================================================================== */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const raf = window.requestAnimationFrame.bind(window);

  /* ---------------------------------------------------------------------
     1  MOTION PREFERENCE
     Gate at the JS layer too — a reduced-motion visitor should not have
     observers and rAF loops running just to be told to hold still.
     --------------------------------------------------------------------- */

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let calm = motionQuery.matches;

  const calmListeners = new Set();
  motionQuery.addEventListener('change', (e) => {
    calm = e.matches;
    calmListeners.forEach((fn) => fn(calm));
  });

  /* ---------------------------------------------------------------------
     2  LAYER SWITCH
     The stackup selector. The initial value is applied by an inline script
     in <head> so there is no flash; this only wires the buttons.
     --------------------------------------------------------------------- */

  const layers = $('.layers');
  if (layers) {
    const sync = () => {
      const active = document.documentElement.dataset.layer || 'copper';
      $$('.layers__btn', layers).forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.layer === active));
      });
    };

    layers.addEventListener('click', (e) => {
      const btn = e.target.closest('.layers__btn');
      if (!btn) return;
      const next = btn.dataset.layer;

      const root = document.documentElement;

      // See .layer-switching in board.css — token-driven transitions stall, so
      // they are suppressed across the swap and restored once it has landed.
      const done = () => root.classList.remove('layer-switching');

      const apply = () => {
        root.classList.add('layer-switching');
        root.dataset.layer = next;
        try {
          localStorage.setItem('layer', next);
        } catch {
          /* private mode — the choice just won't persist */
        }
        sync();
      };

      // Same-document view transition gives the palette swap a soft cross-fade.
      if (!calm && document.startViewTransition) {
        document.startViewTransition(apply).finished.finally(done);
      } else {
        apply();
        raf(() => raf(done));
      }

      // rAF is deferred while a view transition is capturing, so never rely on
      // it alone — leaving this class on would kill every hover transition.
      setTimeout(done, 900);
    });

    sync();
  }

  /* ---------------------------------------------------------------------
     3  NAVIGATION — stuck state, mobile menu, scrollspy
     --------------------------------------------------------------------- */

  const nav = $('.nav');
  const navLinks = $('.nav__links');
  const menuBtn = $('.nav__menu');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.dataset.open === 'true';
      navLinks.dataset.open = String(!open);
      menuBtn.setAttribute('aria-expanded', String(!open));
    });

    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('.nav__link')) {
        navLinks.dataset.open = 'false';
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (nav) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(
      ([entry]) => {
        nav.dataset.stuck = String(!entry.isIntersecting);
      },
      { threshold: 0 }
    ).observe(sentinel);
  }

  const sections = $$('section[id]');
  const linkFor = new Map(
    $$('.nav__link')
      .filter((a) => a.hash)
      .map((a) => [a.hash.slice(1), a])
  );

  if (sections.length && linkFor.size) {
    const seen = new Set();
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        });
        // Highest section currently on screen wins.
        const active = sections.find((s) => seen.has(s.id));
        linkFor.forEach((a, id) => {
          if (active && id === active.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------------------------------------------------------------
     4  TYPED ROLE LINE
     --------------------------------------------------------------------- */

  const roleEl = $('[data-typed]');
  if (roleEl) {
    const words = JSON.parse(roleEl.dataset.typed);
    const out = $('.typed-out', roleEl) || roleEl;

    if (calm) {
      out.textContent = words[0];
    } else {
      // The markup ships with the first role as a no-JS fallback; clear it so
      // the typing starts from empty rather than jumping.
      out.textContent = '';
      let w = 0;
      let i = 0;
      let deleting = false;

      const tick = () => {
        const word = words[w];
        i += deleting ? -1 : 1;
        out.textContent = word.slice(0, i);

        let wait = deleting ? 34 : 62;
        if (!deleting && i === word.length) {
          wait = 1900;
          deleting = true;
        } else if (deleting && i === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          wait = 320;
        }
        setTimeout(tick, wait);
      };

      setTimeout(tick, 700);
    }
  }

  /* ---------------------------------------------------------------------
     5  REVEALS & LIVE SECTIONS
     CSS handles the reveal itself where animation-timeline is supported;
     `is-live` drives the rail pulse and capability bars everywhere.
     --------------------------------------------------------------------- */

  const revealables = $$('.reveal, .section');

  if (calm) {
    revealables.forEach((el) => el.classList.add('is-in', 'is-live'));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          if (entry.target.tagName === 'SECTION') entry.target.classList.add('is-live');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealables.forEach((el) => io.observe(el));

    calmListeners.add((isCalm) => {
      if (isCalm) revealables.forEach((el) => el.classList.add('is-in', 'is-live'));
    });
  }

  // Stagger children of any [data-stagger] container.
  $$('[data-stagger]').forEach((group) => {
    const step = Number(group.dataset.stagger) || 60;
    Array.from(group.children).forEach((child, n) => {
      child.style.setProperty('--delay', `${n * step}ms`);
    });
  });

  /* ---------------------------------------------------------------------
     6  HUD — scroll position and active section
     --------------------------------------------------------------------- */

  const hud = $('.hud');
  if (hud && !calm) {
    const pctEl = $('[data-hud-pct]', hud);
    const secEl = $('[data-hud-section]', hud);
    const bar = $('.hud__bar i', hud);
    let queued = false;

    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (bar) bar.style.setProperty('--p', p.toFixed(3));
      if (pctEl) pctEl.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (secEl) {
        const current = sections.filter((s) => s.getBoundingClientRect().top < innerHeight * 0.4).pop();
        secEl.textContent = current ? current.dataset.label || current.id : 'top';
      }
    };

    addEventListener(
      'scroll',
      () => {
        if (!queued) {
          queued = true;
          raf(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------------
     7  RETICLE — crosshair cursor on fine pointers
     --------------------------------------------------------------------- */

  const reticle = $('.reticle');
  if (reticle && !calm && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let x = 0;
    let y = 0;
    let queued = false;

    const draw = () => {
      queued = false;
      reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    addEventListener(
      'pointermove',
      (e) => {
        x = e.clientX;
        y = e.clientY;
        reticle.dataset.on = 'true';
        reticle.dataset.hot = String(
          Boolean(e.target.closest('a, button, .card, .shot, summary, [role="button"]'))
        );
        if (!queued) {
          queued = true;
          raf(draw);
        }
      },
      { passive: true }
    );

    addEventListener('pointerleave', () => {
      reticle.dataset.on = 'false';
    });
  }

  /* ---------------------------------------------------------------------
     8  PROJECT FILTERS
     --------------------------------------------------------------------- */

  const filterBar = $('.filters');
  if (filterBar) {
    const cards = $$('.card[data-cat]');
    const count = $('[data-filter-count]');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn) return;

      const cat = btn.dataset.cat;
      $$('.filter', filterBar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      const show = (card) => cat === 'all' || card.dataset.cat.split(' ').includes(cat);
      const apply = () => {
        let n = 0;
        cards.forEach((card) => {
          const visible = show(card);
          card.hidden = !visible;
          if (visible) n += 1;
        });
        if (count) count.textContent = `${n} ${n === 1 ? 'project' : 'projects'}`;
      };

      if (!calm && document.startViewTransition) document.startViewTransition(apply);
      else apply();
    });
  }

  /* ---------------------------------------------------------------------
     9  LIGHTBOX — native <dialog>, arrow-key navigable
     --------------------------------------------------------------------- */

  const box = $('.lightbox');
  if (box) {
    const img = $('.lightbox img', box);
    const cap = $('.lightbox__cap', box);
    const shots = $$('.shot');
    let index = 0;

    const show = (n) => {
      index = (n + shots.length) % shots.length;
      const shot = shots[index];
      const full = shot.dataset.full || $('img', shot).currentSrc || $('img', shot).src;
      img.src = full;
      img.alt = $('img', shot).alt;
      cap.textContent = `${String(index + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}  ·  ${
        shot.dataset.caption || ''
      }`;
    };

    const open = (n) => {
      show(n);
      box.showModal();
    };

    shots.forEach((shot, n) => {
      shot.addEventListener('click', () => open(n));
      // role="button" does not get Enter/Space for free.
      shot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(n);
        }
      });
    });

    box.addEventListener('click', (e) => {
      const action = e.target.closest('[data-lb]')?.dataset.lb;
      if (action === 'next') show(index + 1);
      else if (action === 'prev') show(index - 1);
      else if (action === 'close' || e.target === box) box.close();
    });

    addEventListener('keydown', (e) => {
      if (!box.open) return;
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
  }

  /* ---------------------------------------------------------------------
     10  COPY TO CLIPBOARD
     --------------------------------------------------------------------- */

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* Blocked — an unfocused document or a denied permission. Fall through. */
    }
    // Legacy path: succeeds in some contexts the async API refuses.
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  };

  $$('[data-copy]').forEach((btn) => {
    // Captured once, so a second click during the timeout cannot latch
    // "copied" in as the button's permanent label.
    const original = btn.textContent;
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const ok = await copyText(btn.dataset.copy);
      // Always report an outcome — a button that appears inert reads as broken.
      btn.textContent = ok ? 'copied' : 'copy failed';
      btn.dataset.copied = String(ok);
      setTimeout(() => {
        btn.textContent = original;
        btn.dataset.copied = 'false';
      }, 1800);
    });
  });

  /* ---------------------------------------------------------------------
     10b  MESSAGE FORM
     Posts to Web3Forms from the browser, which is what makes a working contact
     form possible on GitHub Pages — static hosting cannot send mail itself.
     Until a real access key is configured the dialog stays shut and the
     "Write to me" button is left as an ordinary mailto: link, so the site is
     never in a half-broken state.
     --------------------------------------------------------------------- */

  const mailer = $('.mailer');
  const mailerForm = mailer && $('[data-mailer-form]', mailer);

  if (mailer && mailerForm) {
    const status = $('.mailer__status', mailer);
    const submitBtn = $('[data-mailer-submit]', mailer);
    const key = mailerForm.elements.access_key;
    const configured = key && !/^REPLACE_/.test(key.value) && key.value.trim().length > 10;

    if (configured) {
      $$('a[data-mailer-open]').forEach((a) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          status.textContent = '';
          status.removeAttribute('data-state');
          mailer.showModal();
        });
      });
    }

    // Close on the × or on a backdrop click. Esc is handled by <dialog> itself.
    mailer.addEventListener('click', (e) => {
      if (e.target.closest('[data-mailer="close"]') || e.target === mailer) mailer.close();
    });

    mailerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      status.removeAttribute('data-state');
      status.textContent = 'Sending…';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(mailerForm))),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`);

        status.dataset.state = 'ok';
        status.textContent = 'Sent. I reply to the address you gave.';
        mailerForm.reset();
      } catch (err) {
        status.dataset.state = 'error';
        status.textContent = `Could not send — ${err.message}. Please email me directly.`;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------------------
     11  VIEW TRANSITIONS
     Morph a project card thumbnail into the case-study hero and back.
     Only one element may carry a given view-transition-name at a time, so
     the name is assigned immediately before navigation and cleared after.
     --------------------------------------------------------------------- */

  const VT_NAME = 'pcb-hero';
  const clearNames = () => {
    $$('[data-vt-active]').forEach((el) => {
      el.style.viewTransitionName = '';
      delete el.dataset.vtActive;
    });
  };

  const nameIt = (el) => {
    if (!el) return;
    clearNames();
    el.style.viewTransitionName = VT_NAME;
    el.dataset.vtActive = 'true';
  };

  // Outgoing: index -> case study
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-slug]');
    if (!link || calm) return;
    try {
      sessionStorage.setItem('vt-slug', link.dataset.slug);
    } catch {
      /* ignore */
    }
    nameIt($(`.card[data-slug="${link.dataset.slug}"] img`));
  });

  // Incoming: restore the name on the card we came back to.
  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition || calm) return;
    let slug = null;
    try {
      slug = sessionStorage.getItem('vt-slug');
    } catch {
      /* ignore */
    }
    if (!slug) return;
    const card = $(`.card[data-slug="${slug}"] img`);
    if (card) {
      nameIt(card);
      e.viewTransition.finished.finally(clearNames);
    }
  });

  // Leaving a case study clears the stored slug unless we are going home.
  addEventListener('pageswap', (e) => {
    if (!e.viewTransition) return;
    e.viewTransition.finished?.finally?.(clearNames);
  });

  /* ---------------------------------------------------------------------
     OUTBOUND LINKS
     Every link leaving the site opens in a new tab — LinkedIn, GitHub, the
     certificate PDFs, the résumé. The markup already declares this; this is a
     net so a hand-added link cannot quietly regress. Same-origin absolute
     URLs are left alone.
     --------------------------------------------------------------------- */

  $$('a[href^="http"]').forEach((a) => {
    if (a.host === location.host) return;
    if (!a.target) a.target = '_blank';
    if (!a.rel.split(/\s+/).includes('noopener')) a.rel = `${a.rel} noopener`.trim();
  });

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */

  $$('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
