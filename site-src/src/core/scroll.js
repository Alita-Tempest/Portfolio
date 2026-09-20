import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = new Lenis({
    duration: reduced ? 0.1 : 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reduced,
    touchMultiplier: 1.6,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // progress bar + active nav link
  const bar = document.getElementById('navProgress');
  const links = [...document.querySelectorAll('[data-nav]')];
  lenis.on('scroll', ({ scroll, limit }) => {
    if (bar) bar.style.width = `${(scroll / Math.max(1, limit)) * 100}%`;
  });
  links.forEach((a) => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(target, { offset: -10 }); });
    ScrollTrigger.create({
      trigger: target, start: 'top 45%', end: 'bottom 45%',
      onToggle: (s) => a.classList.toggle('is-active', s.isActive),
    });
  });
  document.querySelectorAll('a[href^="#"]:not([data-nav])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -10 }); }
    });
  });

  return { lenis, ScrollTrigger, gsap };
}

// Reveal on enter — used for anything with .reveal, including nodes added later.
export function initReveals(root = document) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  root.querySelectorAll('.reveal:not(.in)').forEach((n) => io.observe(n));
  return io;
}
