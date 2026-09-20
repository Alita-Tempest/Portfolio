// Custom cursor: a via-style ring that swells and labels itself over anything interactive,
// plus magnetic pull on buttons.
export function initCursor() {
  const el = document.getElementById('cursor');
  const label = document.getElementById('cursorLabel');
  if (!el || window.matchMedia('(hover:none)').matches) return { hot: () => {} };

  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

  const raf = () => {
    x += (tx - x) * 0.22; y += (ty - y) * 0.22;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
    requestAnimationFrame(raf);
  };
  raf();

  const hot = (on, text = '') => {
    el.classList.toggle('is-hot', on);
    label.textContent = on ? text : '';
  };

  const bind = (root = document) => {
    root.querySelectorAll('a,button,[data-cursor]').forEach((n) => {
      if (n.dataset.cursorBound) return;
      n.dataset.cursorBound = '1';
      n.addEventListener('pointerenter', () => hot(true, n.dataset.cursor || 'open'));
      n.addEventListener('pointerleave', () => hot(false));
    });
    root.querySelectorAll('[data-magnetic]').forEach((n) => {
      if (n.dataset.magBound) return;
      n.dataset.magBound = '1';
      let rect = null;
      n.addEventListener('pointerenter', () => { rect = n.getBoundingClientRect(); });
      n.addEventListener('pointermove', (e) => {
        if (!rect) rect = n.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        n.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
      });
      n.addEventListener('pointerleave', () => { n.style.transform = ''; rect = null; });
    });
  };
  bind();
  return { hot, bind };
}
