// Optional UI sound: short synthesised ticks, same idea as the build film's effects —
// nothing is sampled, and it stays off until the visitor asks for it.
export function initAudio() {
  let ctx = null, on = false, master = null;
  const btn = document.getElementById('sound');

  const ensure = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  };

  const blip = (freq = 1400, dur = 0.035, type = 'sine', gain = 1) => {
    if (!on || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.1;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  };

  const api = {
    hover: () => blip(2100, 0.025, 'sine', 0.35),
    click: () => blip(760, 0.07, 'triangle', 0.8),
    open: () => { blip(520, 0.09, 'sine', 0.7); setTimeout(() => blip(1040, 0.07, 'sine', 0.4), 70); },
    get enabled() { return on; },
  };

  btn?.addEventListener('click', () => {
    ensure();
    if (ctx.state === 'suspended') ctx.resume();
    on = !on;
    btn.setAttribute('aria-pressed', String(on));
    if (on) api.open();
  });

  document.addEventListener('pointerenter', (e) => {
    if (on && e.target instanceof Element && e.target.closest('a,button,[data-cursor]')) api.hover();
  }, true);
  document.addEventListener('click', (e) => {
    if (on && e.target instanceof Element && e.target.closest('a,button')) api.click();
  }, true);

  return api;
}
