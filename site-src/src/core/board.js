import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { asset } from './paths.js';

/**
 * The hero object is the real AgroSense rev 3 board: geometry exported from the same Blender
 * scene as the build film, and the surface rebuilt here from the film's channel-packed rasters
 * (R copper, G mask opening, B silkscreen, A drilled hole) so the copper, mask, silkscreen and
 * ENIG pads are all real layout data rather than a texture of a board.
 */
/* From `Animation/data/pcb/pcb.json`: `board.center` is the Gerber outline's centre and
   `board.tex_mm` the rectangle the rasters cover. Two things have to line up here:

   1. the exported geometry is centred on the board centre while the texture is indexed from board
      (0,0), so the centre has to be added back — half the *texture* size is not the same point and
      leaves the copper ~0.5 mm off the parts;
   2. `build_pcb.py` rasterises board y = 0 to the LAST row of the PNG (Blender's v convention), but
      these textures are loaded `flipY = false`, where v = 0 is the FIRST row — so v must be flipped
      here. Without it the whole copper layer is mirrored top-to-bottom and parts sit on bare mask. */
const BOARD_CX = 41.0005, BOARD_CY = 37.531;   // mm
const TEX_W = 83.0, TEX_H = 76.0;              // mm

export async function loadBoard(stage, onProgress) {
  const draco = new DRACOLoader().setDecoderPath(asset('/draco/'));
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const texLoader = new THREE.TextureLoader();

  const load = (url) => new Promise((res, rej) => texLoader.load(url, res, undefined, rej));
  const [topTex, botTex] = await Promise.all([load(asset('/tex/board_top.webp')), load(asset('/tex/board_bot.webp'))]);
  for (const t of [topTex, botTex]) {
    t.colorSpace = THREE.NoColorSpace;   // packed data, not colour
    t.flipY = false;
    t.anisotropy = Math.min(8, stage.renderer.capabilities.getMaxAnisotropy());
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
  }

  const gltf = await new Promise((res, rej) =>
    loader.load(asset('/models/aria-node.glb'), res, (e) => onProgress && e.total && onProgress(e.loaded / e.total), rej));

  const root = new THREE.Group();
  const model = gltf.scene;
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = false;
    if (o.name.startsWith('board')) applyBoardMaterial(o, topTex, botTex);
    else if (o.material) {
      o.material.envMapIntensity = 1.15;
      o.material.vertexColors = true;
    }
  });

  // the export is in millimetres, Y-up: scale so the 82 mm board is ~2.7 world units
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3(); box.getSize(size);
  const centre = new THREE.Vector3(); box.getCenter(centre);
  const s = 2.7 / Math.max(size.x, size.z);
  model.scale.setScalar(s);
  model.position.set(-centre.x * s, -centre.y * s, -centre.z * s);
  root.add(model);

  // board millimetres (origin at the board's bottom-left, as in the Gerbers) -> root space.
  // z is the height above the top surface; the bottom side is negative.
  const CX = BOARD_CX, CY = BOARD_CY;
  const toRoot = (bx, by, bz = 0) => new THREE.Vector3(
    (bx - CX) * s + model.position.x,
    bz * s + model.position.y,
    -(by - CY) * s + model.position.z,
  );

  // The six WS2812s and the two status LEDs are on the BOTTOM side (verified against the layout:
  // 1.6 x 1.5 mm packages 0.83 mm tall, so the emitting face sits 2.43 mm below the top surface).
  // Each gets a bright core plus an additive halo, facing down — invisible until the board flips.
  const leds = new THREE.Group();
  const LED_MM = [
    [52.20, 67.69], [55.91, 67.69], [59.61, 67.69],
    [63.32, 67.69], [67.03, 67.69], [70.74, 67.69],   // LED1..LED6, the RGB row
    [38.97, 73.65], [22.99, 73.66],                   // USB LED, SOL LED
  ];
  const glowTex = makeGlowTexture();
  const coreGeo = new THREE.CircleGeometry(0.95 * s, 18);
  const haloGeo = new THREE.PlaneGeometry(9.0 * s, 9.0 * s);
  const ledMeshes = [];
  for (const [bx, by] of LED_MM) {
    const p = toRoot(bx, by, -2.46);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
      color: 0x0a0c10, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({
      map: glowTex, color: 0x0a0c10, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    for (const m of [core, halo]) { m.position.copy(p); m.rotation.x = Math.PI / 2; leds.add(m); }
    halo.position.y -= 0.004;     // the halo hangs just below the die so they never z-fight
    halo.renderOrder = 2; core.renderOrder = 3;
    ledMeshes.push({ core: core.material, halo: halo.material });
  }
  // one light for the whole row: the glow has to land on the solder mask, not just float over it
  const ledLight = new THREE.PointLight(0xffffff, 0, 0, 1.8);
  ledLight.position.copy(toRoot(61.47, 67.69, -8));
  leds.add(ledLight);
  root.add(leds);

  // macro-shot targets, in board millimetres straight out of the layout
  const features = {
    module:  toRoot(67.06, 57.40, 2.43),   // U1, the ESP32-S3 module
    soic:    toRoot(53.21, 68.20, 2.88),   // U3, SOIC-16
    qfn:     toRoot(21.62, 26.55, 1.02),   // U5, QFN-16
    usb:     toRoot(23.00, 69.80, 3.30),   // USB-C
    headers: toRoot(80.64, 40.77, 5.75),   // J2, the 6-pin header
    ledRow:  toRoot(61.47, 67.69, -2.46),  // LED1..LED6, bottom side
    ledEnd:  toRoot(70.74, 67.69, -2.46),  // the far end of the row
    centre:  toRoot(41.00, 37.53, 0),
  };
  return { root, model, uniforms: BOARD_UNIFORMS, features, ledMeshes, ledLight, mmScale: s };
}

export const BOARD_UNIFORMS = {
  uTime: { value: 0 },
  uPulse: { value: 0.0 },      // travelling signal highlight on the copper
  uFinish: { value: 1.0 },     // 0 = bare copper pads, 1 = ENIG gold
  uMask: { value: 1.0 },       // 0 = bare laminate, 1 = solder mask applied
};

// board mm -> texture: u = bx / TEX_W, v = 1 - by / TEX_H   (bx = x + CX, by = CY - z)
const BUV = `vec2(
          (vLocalPos.x + ${BOARD_CX.toFixed(4)}) / ${TEX_W.toFixed(1)},
          (${(TEX_H - BOARD_CY).toFixed(3)} + vLocalPos.z) / ${TEX_H.toFixed(1)})`;

function applyBoardMaterial(mesh, topTex, botTex) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.55 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, BOARD_UNIFORMS, {
      uTop: { value: topTex },
      uBot: { value: botTex },
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        varying vec3 vLocalPos;
        varying vec3 vLocalNrm;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vLocalPos = position;
        vLocalNrm = normal;`);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform sampler2D uTop; uniform sampler2D uBot;
        uniform float uTime; uniform float uPulse; uniform float uFinish; uniform float uMask;
        varying vec3 vLocalPos; varying vec3 vLocalNrm;
        // sampled once in map_fragment and reused by the roughness and metalness chunks:
        // at macro scale this board covers the whole screen, and three fetches per fragment cost
        vec4 gTex; bool gFace;`)
      .replace('#include <map_fragment>', `
        // board-space UV: geometry is mm about the board centre, the raster is indexed from
        // board (0,0) with y running up the image, and the glTF y-up export put board +y on -z
        vec2 buv = ${BUV};
        float up = vLocalNrm.y;
        gFace = abs(up) > 0.5;
        bool isFace = gFace;
        gTex = up > 0.0 ? texture2D(uTop, buv) : texture2D(uBot, buv);
        vec4 t = gTex;
        float cu = t.r, opening = t.g, silk = t.b;

        vec3 fr4      = vec3(0.235, 0.190, 0.085);
        vec3 maskFr   = vec3(0.012, 0.070, 0.030);
        vec3 maskCu   = vec3(0.030, 0.135, 0.052);
        vec3 copperC  = vec3(0.540, 0.250, 0.110);
        vec3 goldC    = vec3(0.760, 0.560, 0.230);
        vec3 silkC    = vec3(0.880, 0.885, 0.870);

        vec3 bare   = mix(fr4, copperC, cu);
        vec3 masked = mix(maskFr, maskCu, cu);
        vec3 col    = mix(bare, masked, uMask * (1.0 - opening));
        col = mix(col, mix(copperC, goldC, uFinish), cu * opening);
        col = mix(col, silkC, silk * (1.0 - opening));

        // a signal pulse chasing across the copper, like the routing pass in the build film
        float wave = smoothstep(0.985, 1.0, sin((buv.x * 2.4 + buv.y * 1.1 - uTime * 0.22) * 6.2831) * 0.5 + 0.5);
        col += vec3(0.16, 0.55, 0.78) * wave * cu * opening * uPulse;

        vec3 edgeC = vec3(0.215, 0.180, 0.085);
        diffuseColor.rgb *= isFace ? col : edgeC;
        float metalness_ = isFace ? cu * opening : 0.0;
        float rough_ = isFace
          ? mix(mix(0.62, 0.34, cu), mix(0.30, 0.20, uFinish), cu * opening)
          : 0.72;
      `)
      .replace('#include <roughnessmap_fragment>', `
        float roughnessFactor = gFace
          ? mix(mix(0.60, 0.33, gTex.r), mix(0.28, 0.18, uFinish), gTex.r * gTex.g)
          : 0.72;
        // solder mask is glossier than bare laminate
        roughnessFactor = mix(roughnessFactor, 0.26, gFace ? uMask * (1.0 - gTex.g) * 0.55 : 0.0);
      `)
      .replace('#include <metalnessmap_fragment>', `
        float metalnessFactor = gFace ? gTex.r * gTex.g : 0.0;
      `);
    mat.userData.shader = shader;
  };
  mesh.material = mat;
}

/** a soft radial falloff for the LED halos — one 128 px texture shared by all of them */
function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d').createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0.00, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(255,255,255,0.72)');
  g.addColorStop(0.42, 'rgba(255,255,255,0.20)');
  g.addColorStop(1.00, 'rgba(255,255,255,0)');
  const ctx = c.getContext('2d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
