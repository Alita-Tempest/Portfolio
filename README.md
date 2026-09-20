# alita-tempest.github.io/Portfolio

Portfolio of **K. V. Siva Teja** — IoT embedded hardware and PCB design.

The hero object is the real AgroSense rev 3 sensor node: geometry exported from the Blender scene
behind the board's build film, with the copper, solder mask, silkscreen and ENIG pads rebuilt in a
shader from the Gerber-derived rasters. Scrolling moves through macro shots of named parts on that
layout — the ESP32-S3 module, the SOIC beside the card slot, the USB-C edge, then the bottom side
where the WS2812 row lights.

## Layout of this repo

GitHub Pages serves this repo from `main` at the root, so the **built site is committed at the top
level** and the source that produces it lives in [`site-src/`](site-src).

```
index.html  assets/  img/  models/  tex/  video/  fonts/  data/  draco/   the published site
site-src/                                                               the Vite project
```

To change the site, work in `site-src/` and publish the result to the root:

```bash
cd site-src
npm install          # first time only
npm run dev          # http://127.0.0.1:5173/Portfolio/
npm run build        # writes site-src/dist
cp -r dist/* ..      # publish
```

`site-src/README.md` documents the 3D pipeline, where the content came from, the board shader's
coordinate conventions and the things worth knowing before changing them.

The previous hand-written site is not gone — it is the tree at commit `4d498ad`, and
`git checkout 4d498ad -- .` restores it.
