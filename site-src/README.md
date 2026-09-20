# Portfolio — K. V. Siva Teja (3D rebuild)

A rebuild of [alita-tempest.github.io/Portfolio](https://alita-tempest.github.io/Portfolio) as an
immersive WebGL site: same content, new shell. The hero object is **your actual AgroSense rev 3
board** — geometry exported from the Blender scene behind the build film, with the copper, solder
mask, silkscreen and ENIG pads rebuilt in a shader from the real Gerber-derived rasters.

Nothing is deployed. Run it locally.

```bash
cd "F:\Personal Projects\portfolio-3d"
npm install      # first time only
npm run dev      # → http://127.0.0.1:5173
```

`npm run build` writes a static `dist/` if you ever want to publish it; `npm run preview` serves that build.

## What it is

| | |
|---|---|
| Stack | Vite + three.js + GSAP ScrollTrigger + Lenis. No framework. |
| Weight | 218 kB gzipped JS, 0.69 MB board + 0.33 MB parts models, 134 kB board textures, 5.4 MB images, 10.8 MB hero video |
| 3D | One canvas behind the whole page: the board, 11 floating components, refractive glass shards with dispersion, a trace field, bloom and vignette |
| Camera | Scroll drives five macro shots on named parts of the real layout — U1, U3, the USB-C edge, then the bottom side with the WS2812 row lit — and pulls back out at Contact |
| Glass | Cards, filters, capability chips and the contact form are real frosted glass (`backdrop-filter`), so the 3D reads through them; project imagery sits at 46% opacity and comes to full on hover |
| Content | `src/data/content.js` (from your Sep 2026 CV) + `public/data/projects.json` (from the old site) |

## Structure

```
index.html              shell: boot screen, canvas, nav, sections, case-study overlay
src/main.js             wiring: boot, scroll-driven board states, trace field
src/core/webgl.js       renderer, environment, lights, post-processing
src/core/board.js       GLB load + the PCB surface shader
src/core/parts.js       floating components from the board (parts.glb)
src/core/glass.js       refractive shards: transmission + dispersion
src/core/scroll.js      Lenis smooth scroll, ScrollTrigger, reveals
src/core/cursor.js      custom cursor + magnetic buttons
src/core/audio.js       optional synthesised UI ticks (off until you toggle "sound")
src/sections/work.js    work grid, filters, case-study reader
src/sections/build.js   profile, experience, education, capabilities, contact
src/data/content.js     all home-page copy
public/                 model, textures, fonts, images, project data
```

## Where the content came from

- **Experience, summary, publication, education** — `CV.pdf` (Sep 2026). That CV has work the old
  site never mentioned: the ESP32-S3 robotics main control board, the two-board humanoid
  architecture, ARIA's measured model results, and the ICoICI 2026 IEEE paper.
- **Capabilities** — the pre-2026-09-13 CV backup, whose skills section is fuller. Bold entries in
  that CV are marked `core` and render highlighted.
- **Case studies** — `tools/projects.json` from the old repo, unchanged, plus a "Since that write-up"
  block on the two AgroSense entries carrying the newer CV detail (`projectExtras` in content.js).
- **Images** — the old repo's optimised WebP derivatives (95 files).

## The board in the hero

`public/models/aria-node.glb` is 210k triangles, Draco-compressed, exported by
`Animation/scripts/export_web_glb.py` in the Agro Node project. Component colours are baked to
vertex colours across four PBR materials. The board slab carries no baked texture: `board.js`
samples `public/tex/board_*.webp`, where **R = copper, G = mask opening, B = silkscreen, A = drilled
hole**, and composes FR4, mask, copper and gold in the shader — so what you see is the layout data.

**The shader reconstructs board coordinates from the vertex position, and two separate things have
to line up for that to land on the right copper.** Both were wrong at first, and the parts looked
scattered across bare solder mask with stray gold pads in empty places.

1. **Which point the geometry is centred on.** The export is centred on the *board outline's* centre,
   `board.center` = (41.0005, 37.531) mm, while the rasters cover the *texture* rectangle,
   `board.tex_mm` = 83 x 76 mm, indexed from board (0, 0). Using half the texture size (41.5, 38.0)
   instead samples 0.50 / 0.47 mm off.
2. **Which row of the PNG is board y = 0.** `build_pcb.py` rasterises board y = 0 to the *last* row,
   which is Blender's v convention — and the Blender film maps the board from real UVs, so the film
   was always right. These textures are loaded `flipY = false`, where v = 0 is the *first* row, so v
   has to be flipped here. Without the flip the copper is mirrored top-to-bottom, which is the big
   error; the 0.5 mm offset only becomes visible once the mirror is gone.

The mapping is `u = (x + CX) / TEX_W`, `v = ((TEX_H - CY) + z) / TEX_H`, built from the constants at
the top of `board.js`; a board revision changes them together.

Worth measuring rather than eyeballing: drop a 1.6 mm box on each of the 110 chip parts and average
the solder-mask-opening coverage the mapping lands on. A chip part sits on two openings, so a correct
mapping scores far above chance. Mirrored scored **17.0%** against a board-wide average of **16.4%** —
i.e. indistinguishable from sampling at random — and the corrected mapping scores **42.5%**. Mirroring
u as well drops it to 17.2%, so exactly one flip, in v, is right.

To regenerate after a board revision, re-run the export script and re-crop the textures from
`Animation/data/tex/board_top.png`.

## The header, and where the page starts

The bar is `position:fixed`, effectively opaque, and sits above everything that scrolls. Its height
is **measured, not assumed** — a `ResizeObserver` in `main.js` writes it to `--navh`, because the bar
wraps to two rows below 860 px (66 px wide, 89 px on a phone). `main` takes that as top padding and
every `section[id]` takes it as `scroll-margin-top`, so content begins at the bar's edge and anchor
links land below it.

## The film beside the name

The hero is a two-column grid: name on the left, `public/video/cad.mp4` auto-playing in a glass panel
on the right, given the wider of the two columns. It is frames 150–930 of the build film — footprints
landing, then nets routing — and it pauses on a still frame under `prefers-reduced-motion`. Below
1020 px the hero stacks and the panel follows the copy. Rebuild the clip with
`Animation/scripts/make_loop.py` (`start=`, `end=`, `pct=`, `gop=`); it was encoded at 672×378 with a
5-frame GOP back when scroll scrubbed it, so a larger `pct=` and a normal `gop=` would now suit it
better — it only loops. The text column carries its own gradient scrim (`.hero__grid::before`) because the board now
sits behind the copy rather than beside it.

## Macro shots

`src/core/board.js` maps board millimetres straight out of the layout to scene space and exports a
`features` table: U1 at (67.06, 57.40), U3 at (53.21, 68.20), USB-C, the 6-pin header, and the RGB row
at y 67.69. `state.fx/fy/fz` names the feature a shot is framed on, and `main.js` places the board so
that point lands on the anchor — so raising `scale` pushes *in on that part* instead of growing the
board off-screen. The anchors were solved by unprojecting a target NDC position, not by eye.

`LED1..LED6` and the two status LEDs are **bottom-side** parts (1.6 x 1.5 mm, 0.83 mm tall), so they
only appear once the board rolls over at Capabilities: each is a bright core plus an additive halo
facing down, chasing through hue like the firmware drives them, with one point light for the spill on
the solder mask. That shot also pulls the room lights down to 20% and lifts bloom, so the LEDs carry
the frame.

To retune a shot, open the console: `__site.state` is live, and `__site.lenis.scrollTo(px, {immediate:true})`
jumps to any scroll position.

## Frame rate

Measured at 1512x900 on this machine: hero ~50 fps, work ~42, capabilities ~52, contact ~53.

Two things cost far more than the 3D, and both are fixed: **116 capability chips** each had
`backdrop-filter: blur(8px)` (33 → 47 fps when dropped — they keep a plain translucent fill), and the
**grain overlay** spanned four viewports (47 → 54 fps at `inset:-6%` with `contain:paint`). Hiding the
entire board group changes nothing measurable, so if the page ever feels slow, look at CSS compositing
before the renderer. The board shader also samples its packed raster once per fragment now instead of
three times, and the film plane is hidden outright when it is transparent.

## The work grid

Grid: four columns above 1200 px, three to 900 px, two to 600 px, one below. Card sizing and the
glass tokens are in the `/* work */` block of `main.css`.

## Things you may want to change

- **Hero stats** — `index.html` (`data-count`) and `stats` in `content.js`.
- **Contact form** — Web3Forms key is carried over from the old site and live.
- **Colophon case study** — its copy still describes the old no-framework site. It needs a rewrite
  for this build; everything else in `projects.json` is current.
- **Dletabotix artwork** — still deliberately a generated placeholder, per your earlier decision
  that the artwork is the company's.
- **Sound** — off by default; the toggle sits in the nav.

Reduced-motion is respected (smooth scroll, reveals and animation back off), and if WebGL or the
model fails to load the page still renders and reads normally.
