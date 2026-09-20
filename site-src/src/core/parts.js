import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { asset } from './paths.js';

/**
 * Floating hardware: the board's own components (module, USB-C, DC jack, cap, SD holder,
 * inductor, headers, U.FL …) drifting through the scene behind the content, so the glass
 * panels in front of them have something real to refract and blur.
 */
export async function loadParts(count = 18) {
  const draco = new DRACOLoader().setDecoderPath(asset('/draco/'));
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const gltf = await new Promise((res, rej) => loader.load(asset('/models/parts.glb'), res, undefined, rej));

  const sources = [];
  gltf.scene.traverse((o) => {
    if (o.isMesh) {
      o.geometry.computeBoundingSphere();
      sources.push(o);
    }
  });
  if (!sources.length) return { group: new THREE.Group(), items: [] };

  const group = new THREE.Group();
  const items = [];
  const rnd = mulberry(7);

  for (let i = 0; i < count; i++) {
    const src = sources[i % sources.length];
    const mesh = new THREE.Mesh(src.geometry, src.material.clone());
    mesh.material.envMapIntensity = 1.3;
    mesh.material.metalness = Math.min(1, (mesh.material.metalness ?? 0.5) + 0.15);
    mesh.material.roughness = 0.34;

    // normalise: every part reads at a similar size whatever its real millimetres
    const r = src.geometry.boundingSphere.radius || 1;
    const base = (0.22 + rnd() * 0.3) / r;
    mesh.scale.setScalar(base);

    const a = rnd() * Math.PI * 2;
    const rad = 3.2 + rnd() * 5.2;
    mesh.position.set(Math.cos(a) * rad, (rnd() - 0.5) * 6.5, -2 - rnd() * 7);
    mesh.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);

    items.push({
      mesh,
      spin: new THREE.Vector3((rnd() - 0.5) * 0.22, (rnd() - 0.5) * 0.26, (rnd() - 0.5) * 0.16),
      bob: 0.12 + rnd() * 0.3,
      phase: rnd() * 6.28,
      home: mesh.position.clone(),
    });
    group.add(mesh);
  }
  return { group, items };
}

export function updateParts(items, t, drift = 0, pointer = { x: 0, y: 0 }) {
  for (const it of items) {
    const m = it.mesh;
    m.rotation.x += it.spin.x * 0.016;
    m.rotation.y += it.spin.y * 0.016;
    m.rotation.z += it.spin.z * 0.016;
    m.position.y = it.home.y + Math.sin(t * 0.35 + it.phase) * it.bob + drift;
    m.position.x = it.home.x + Math.cos(t * 0.22 + it.phase) * it.bob * 0.7 + pointer.x * 0.25;
  }
}

function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
