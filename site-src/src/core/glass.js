import * as THREE from 'three';

/**
 * Refractive glass: slabs and shards with real transmission and dispersion, so the board and the
 * floating parts bend and split into colour behind them. This is what the DOM glass cards sit on
 * top of — the page reads as layers of glass over hardware.
 */
export function makeGlass(stage, count = 7) {
  const group = new THREE.Group();
  const items = [];
  const rnd = mulberry(21);

  const mat = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: 1.1,
    roughness: 0.06,
    metalness: 0,
    ior: 1.46,
    envMapIntensity: 1.1,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    attenuationColor: new THREE.Color(0x9fd8ff),
    attenuationDistance: 6,
    specularIntensity: 1,
  });
  if ('dispersion' in mat) mat.dispersion = 2.6;     // three r165+: the rainbow at the edges

  const shapes = [
    () => new THREE.BoxGeometry(2.6, 3.4, 0.12, 1, 1, 1),
    () => new THREE.CylinderGeometry(1.25, 1.25, 0.14, 6),
    () => new THREE.BoxGeometry(1.5, 1.5, 0.14),
    () => new THREE.IcosahedronGeometry(0.95, 0),
  ];

  for (let i = 0; i < count; i++) {
    const g = shapes[i % shapes.length]();
    const m = new THREE.Mesh(g, mat);
    const a = (i / count) * Math.PI * 2 + rnd();
    const rad = 2.4 + rnd() * 3.4;
    m.position.set(Math.cos(a) * rad, (rnd() - 0.5) * 4.2, 0.6 + rnd() * 2.2);
    m.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
    m.scale.setScalar(0.55 + rnd() * 0.75);
    items.push({
      mesh: m,
      spin: new THREE.Vector3((rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.09, (rnd() - 0.5) * 0.05),
      home: m.position.clone(),
      phase: rnd() * 6.28,
    });
    group.add(m);
  }

  // transmission is a second scene render per frame — keep its buffer cheap
  if ('transmissionResolutionScale' in stage.renderer) stage.renderer.transmissionResolutionScale = 0.5;
  return { group, items, material: mat };
}

export function updateGlass(items, t, spread = 1, pointer = { x: 0, y: 0 }) {
  for (const it of items) {
    const m = it.mesh;
    m.rotation.x += it.spin.x * 0.016;
    m.rotation.y += it.spin.y * 0.016;
    m.rotation.z += it.spin.z * 0.016;
    m.position.x = it.home.x * spread + pointer.x * 0.4;
    m.position.y = it.home.y * spread + Math.sin(t * 0.3 + it.phase) * 0.25 + pointer.y * 0.25;
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
