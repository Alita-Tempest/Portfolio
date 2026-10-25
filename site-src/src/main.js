import './styles/main.css';
import * as THREE from 'three';
import { Stage } from './core/webgl.js';
import { loadBoard, BOARD_UNIFORMS } from './core/board.js';
import { loadParts, updateParts } from './core/parts.js';
import { makeGlass, updateGlass } from './core/glass.js';
import { initCursor } from './core/cursor.js';
import { initScroll, initReveals } from './core/scroll.js';
import { initAudio } from './core/audio.js';
import { initWork, closeCase } from './sections/work.js';
import { buildSections, animateCounters, initForm } from './sections/build.js';

/* ───────────────────────────────────────────────── boot screen */
const BOOT_LINES = [
  'substrate ............ <b>ok</b>',
  'copper 4 layers ...... <b>ok</b>',
  'drill 497 holes ...... <b>ok</b>',
  'solder mask .......... <b>ok</b>',
  'components 194 ....... <b>ok</b>',
];
const bootEl = document.getElementById('boot');
const logEl = document.getElementById('bootLog');
const fillEl = document.getElementById('bootFill');
const pctEl = document.getElementById('bootPct');
let shown = 0;
const setProgress = (p) => {
  const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
  fillEl.style.right = `${100 - pct}%`;
  pctEl.textContent = String(pct).padStart(2, '0');
  const want = Math.floor((pct / 100) * BOOT_LINES.length);
  while (shown < want && shown < BOOT_LINES.length) {
    const s = document.createElement('span');
    s.innerHTML = BOOT_LINES[shown++];
    logEl.appendChild(s);
  }
};

/* ───────────────────────────────────────────────── header height
   The bar wraps to two rows on narrow screens, so its height is measured rather than assumed:
   main's top padding and every anchor's scroll-margin follow it. */
const navEl = document.getElementById('nav');
const syncNavHeight = () => {
  const h = Math.round(navEl.getBoundingClientRect().height);
  if (h) document.documentElement.style.setProperty('--navh', `${h}px`);
};
syncNavHeight();
new ResizeObserver(syncNavHeight).observe(navEl);

/* the hero's build film autoplays — unless the visitor asked for less motion, when it holds a frame */
const heroFilm = document.getElementById('heroFilm');
if (heroFilm && matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroFilm.autoplay = false;
  heroFilm.addEventListener('loadeddata', () => { heroFilm.pause(); heroFilm.currentTime = 6; }, { once: true });
  heroFilm.pause();
}

/* ───────────────────────────────────────────────── boot the page */
const cursor = initCursor();
const sound = initAudio();
buildSections();
initForm();
animateCounters();
const { lenis, gsap, ScrollTrigger } = initScroll();
initReveals();
setTimeout(() => document.querySelector('.hero__name')?.classList.add('in'), 120);

const stage = new Stage(document.getElementById('gl'));
stage.start();

/* ───────────────────────────────────────────────── background trace field */
const traceMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uTime: { value: 0 }, uFade: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    varying vec2 vUv; uniform float uTime; uniform float uFade;
    float line(float v, float w){ return smoothstep(w, 0.0, abs(v)); }
    void main(){
      vec2 p = vUv * vec2(38.0, 22.0);
      vec2 g = fract(p) - 0.5;
      float grid = max(line(g.x, 0.022), line(g.y, 0.022));
      vec2 id = floor(p);
      float rnd = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
      float horiz = step(0.5, fract(rnd * 7.3));
      float trace = step(0.88, rnd) * mix(line(g.x, 0.05), line(g.y, 0.05), horiz);
      float pulse = smoothstep(0.82, 1.0, sin((id.x * 0.7 + id.y * 0.35 - uTime * 0.9))) * step(0.93, rnd)
                  * mix(line(g.x, 0.05), line(g.y, 0.05), horiz);
      vec3 col = vec3(0.040, 0.075, 0.100) * grid
               + vec3(0.07, 0.115, 0.145) * trace
               + vec3(0.18, 0.45, 0.62) * pulse * 0.35;
      float vig = smoothstep(1.15, 0.15, length(vUv - 0.5) * 1.6);
      gl_FragColor = vec4(col, (grid * 0.16 + trace * 0.26 + pulse * 0.40) * vig * uFade);
    }`,
});
const traces = new THREE.Mesh(new THREE.PlaneGeometry(46, 26), traceMat);
traces.position.set(0, 0, -9);
stage.scene.add(traces);

/* ───────────────────────────────────────────────── the board */
let board = null, partItems = [], glassItems = [];
const boardGroup = new THREE.Group();
stage.scene.add(boardGroup);

/* posX/posY/posZ is where the *focused feature* sits in the frame, not where the board's centre
   goes: fx/fy/fz name a point on the real layout (an IC, a connector, the LED row) and the board
   is placed so that point lands on the anchor. Scaling up therefore pushes in on that feature
   instead of growing the board off-screen — that is what makes the macro shots work. */
const state = {
  rotX: 0.84, rotY: 0.55, rotZ: 0, posX: 0.62, posY: -1.62, posZ: -1.6, scale: 1.15,
  fx: 0, fy: 0, fz: 0, spin: 1, leds: 0, dim: 0.86, bloom: 0.26,
  pulse: 0, mask: 1, finish: 1, traceFade: 1, glass: 1, drift: 0,
};
window.__site = { state, stage, lenis, gsap };   // handy when tuning in the browser console

let features = null, ledMats = [], ledLight = null;
loadBoard(stage, (p) => setProgress(0.15 + p * 0.7)).then(({ root, features: f, ledMeshes, ledLight: ll }) => {
  board = root;
  features = f;
  ledMats = ledMeshes;
  ledLight = ll;
  boardGroup.add(board);
  const g = makeGlass(stage, 7);
  glassItems = g.items;
  stage.scene.add(g.group);
  loadParts(18).then(({ group, items }) => { partItems = items; stage.scene.add(group); });
  setProgress(1);
  setTimeout(() => {
    bootEl.classList.add('is-done');
    document.body.classList.remove('is-locked');
  }, 520);
  buildBoardScroll();
}).catch((err) => {
  console.error('[board]', err);
  // the site must still work without WebGL assets
  setProgress(1);
  bootEl.classList.add('is-done');
  document.body.classList.remove('is-locked');
});

document.body.classList.add('is-locked');
setProgress(0.08);

/* Scroll-driven camera work. Each section is a shot on a named part of the real board, framed by
   putting that feature at an anchor point and pushing the scale up — macro, the way you'd look at a
   board under a bench microscope: the ESP32-S3 module, the 6-pin header, the SOIC beside the card
   slot, the USB-C edge as it rolls over, then the bottom side where the six WS2812s sit, and finally
   back out. */
function shot(f, o) { return { fx: f.x, fy: f.y, fz: f.z, ease: 'none', ...o }; }

let boardTl = null;
function buildBoardScroll() {
  const F = features;
  const SHOTS = [
    // 01 work — macro on U1, the ESP32-S3 module, behind the glass cards
    ['#work', shot(F.module, {
      rotX: 0.98, rotY: 1.30, posX: -1.70, posY: 0.54, posZ: -3.1, scale: 3.5,
      spin: 0.30, glass: 1.35, drift: -0.4, traceFade: 0.55, pulse: 0, leds: 0, dim: 1.2, bloom: 0.26 })],
    // 02 freelance — the 6-pin header, the part every client board gets debugged through
    ['#freelance', shot(F.headers, {
      rotX: 1.12, rotY: 1.72, posX: 1.95, posY: 0.10, posZ: -3.0, scale: 3.9,
      spin: 0.28, glass: 1.2, drift: 0.1, traceFade: 0.55, pulse: 0, leds: 0, dim: 1.3, bloom: 0.28 })],
    // 03 profile — U3, close and nearly face-on, on the other side of the frame
    ['#profile', shot(F.soic, {
      rotX: 1.34, rotY: 2.10, posX: -2.18, posY: -0.45, posZ: -2.9, scale: 4.2,
      spin: 0.26, glass: 1.1, drift: 0.2, traceFade: 0.5, leds: 0, dim: 1.45, bloom: 0.3 })],
    // 04 experience — the board rolls over; we catch the USB-C edge past vertical
    ['#experience', shot(F.usb, {
      rotX: 1.75, rotY: 3.05, posX: 2.05, posY: -2.30, posZ: -2.7, scale: 3.6,
      spin: 0.34, glass: 1.25, drift: -0.2, traceFade: 0.6, leds: 0.15, dim: 1.35, bloom: 0.36 })],
    // 05 capabilities — bottom side up: the RGB row lights, the copper carries a signal
    ['#capabilities', shot(F.ledRow, {
      rotX: 3.92, rotY: 3.34, posX: 0.02, posY: -0.73, posZ: -2.2, scale: 6.4,
      spin: 0.20, pulse: 1, glass: 1.5, drift: 0.3, traceFade: 0.85,
      leds: 1, dim: 0.20, bloom: 0.44 })],
    // 06 contact — pull out, still turning, back to the whole board
    ['#contact', shot(F.centre, {
      rotX: 6.95, rotY: 5.50, posX: 1.15, posY: -0.27, posZ: -0.9, scale: 1.02,
      spin: 1, pulse: 0.4, glass: 1.0, drift: 0, traceFade: 1, leds: 0.3, dim: 1, bloom: 0.26 })],
  ];

  // A single timeline keeps every shot starting from the previous one's pose, but its steps are
  // timed to the real distance between sections rather than split evenly — otherwise the LED shot
  // lands halfway through Education. Each span holds on the current shot, then moves to the next.
  const top = (sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY;
  const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const marks = [top('#hero'), ...SHOTS.map(([sel]) => top(sel))];

  boardTl?.scrollTrigger?.kill();
  boardTl?.kill();
  boardTl = gsap.timeline({
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.1 },
  });
  SHOTS.forEach(([, s], i) => {
    const span = Math.max(0.04, ((i + 1 < marks.length - 1 ? marks[i + 1] : total) - marks[i]) / total);
    boardTl.to({}, { duration: span * 0.42 });              // hold the shot while the section reads
    boardTl.to(state, { ...s, duration: span * 0.58 });     // then move to the next one
  });

  ScrollTrigger.refresh();
}

let rebuildT = 0;
addEventListener('resize', () => {
  clearTimeout(rebuildT);
  rebuildT = setTimeout(() => { if (features) buildBoardScroll(); }, 260);
});

/* the case-study overlay pushes the board back and quiets the field */
addEventListener('case:open', () => { gsap.to(state, { scale: 0.55, traceFade: 0.15, duration: 0.8, ease: 'power2.out' }); lenis.stop(); });
addEventListener('case:close', () => { gsap.to(state, { scale: 1, traceFade: 1, duration: 0.9, ease: 'power2.out' }); lenis.start(); });

const _focus = new THREE.Vector3();      // the feature we are framed on, smoothed
const _anchor = new THREE.Vector3();     // where it should sit in the frame, smoothed
const _off = new THREE.Vector3();
const _hsl = new THREE.Color();
let idleSpin = 0, _dim = 1;

stage.onTick((t, dt, pointer) => {
  traceMat.uniforms.uTime.value = t;
  traceMat.uniforms.uFade.value += (state.traceFade - traceMat.uniforms.uFade.value) * 0.05;
  BOARD_UNIFORMS.uTime.value = t;
  BOARD_UNIFORMS.uPulse.value += (state.pulse - BOARD_UNIFORMS.uPulse.value) * 0.04;
  BOARD_UNIFORMS.uMask.value = state.mask;
  BOARD_UNIFORMS.uFinish.value = state.finish;
  stage.copperLight.intensity = 5 + Math.sin(t * 0.7) * 1.5 + state.pulse * 8;
  _dim += (state.dim - _dim) * 0.05;
  for (let i = 0; i < stage.lights.length; i++) stage.lights[i].intensity = stage.lightBase[i] * _dim;
  stage.scene.environmentIntensity = 0.55 * (0.25 + 0.75 * _dim);   // the room dims with the key
  stage.bloom.strength += (state.bloom - stage.bloom.strength) * 0.05;
  if (partItems.length) updateParts(partItems, t, state.drift, pointer);
  if (glassItems.length) updateGlass(glassItems, t, state.glass, pointer);

  // the WS2812 row on the bottom side, plus the two steady status LEDs
  if (ledMats.length) {
    const lit = state.leds;
    let rH = 0, rB = 0;
    for (let i = 0; i < ledMats.length; i++) {
      const { core, halo } = ledMats[i];
      let h, b;
      if (i < 6) {                                   // LED1..LED6 chase, as the firmware drives them
        h = ((t * 0.11 + i * 0.135) % 1 + 1) % 1;
        b = lit * (0.55 + 0.45 * Math.sin(t * 1.9 - i * 0.85));
      } else if (i === 6) { h = 0.09; b = lit * (0.5 + 0.5 * Math.sin(t * 2.6)); }   // USB, amber blink
      else { h = 0.33; b = lit * 0.85; }                                             // solar, steady green
      b = Math.max(0, b);
      core.color.copy(_hsl.setHSL(h, 0.9, Math.min(0.85, 0.78 * b)));
      halo.color.copy(_hsl.setHSL(h, 0.95, Math.min(0.20, 0.17 * b)));
      if (i < 6) { rH += h; rB += b; }
    }
    if (ledLight) {                                  // the row's spill on the solder mask
      ledLight.color.setHSL(((rH / 6) % 1 + 1) % 1, 0.75, 0.55);
      ledLight.intensity = lit * (0.9 + rB / 6) * 1.25;
    }
  }

  if (!board) return;
  // scroll-driven pose, plus a slow idle turn (integrated, so changing its rate never snaps)
  // and pointer parallax — at macro scale the parallax orbits around the focused part.
  idleSpin += dt * 0.045 * state.spin;
  const px = pointer.x * 0.22, py = pointer.y * 0.16;
  boardGroup.rotation.x += (state.rotX + py - boardGroup.rotation.x) * 0.06;
  boardGroup.rotation.y += (state.rotY + idleSpin + px - boardGroup.rotation.y) * 0.06;
  boardGroup.rotation.z += (state.rotZ - boardGroup.rotation.z) * 0.06;

  const narrow = Math.max(0, Math.min(1, (1.4 - stage.camera.aspect) / 0.65));   // portrait-ish panes
  const sc = boardGroup.scale.x + (state.scale * (1 - narrow * 0.32) - boardGroup.scale.x) * 0.05;
  boardGroup.scale.setScalar(sc);

  _anchor.x += (state.posX * (1 + narrow * 0.15) - _anchor.x) * 0.05;
  _anchor.y += ((state.posY - narrow * 1.25 + Math.sin(t * 0.55) * 0.045) - _anchor.y) * 0.05;
  _anchor.z += (state.posZ - _anchor.z) * 0.05;
  _focus.x += (state.fx - _focus.x) * 0.05;
  _focus.y += (state.fy - _focus.y) * 0.05;
  _focus.z += (state.fz - _focus.z) * 0.05;

  // place the board so the focused feature lands on the anchor
  _off.copy(_focus).multiplyScalar(sc).applyEuler(boardGroup.rotation);
  boardGroup.position.copy(_anchor).sub(_off);
});

/* ───────────────────────────────────────────────── work grid + misc */
initWork(sound).then(() => cursor.bind?.(document));

document.getElementById('toTop')?.addEventListener('click', () => lenis.scrollTo(0));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCase(); });
