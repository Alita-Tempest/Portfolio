import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Vignette + a touch of chromatic aberration, so the frame edges fall away like a camera.
const FrameShader = {
  uniforms: { tDiffuse: { value: null }, uAmount: { value: 0.0005 }, uVig: { value: 1.0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmount; uniform float uVig; varying vec2 vUv;
    void main(){
      vec2 d = vUv - 0.5;
      float r2 = dot(d,d);
      vec2 off = d * r2 * uAmount * 60.0;
      vec3 c;
      c.r = texture2D(tDiffuse, vUv + off).r;
      c.g = texture2D(tDiffuse, vUv).g;
      c.b = texture2D(tDiffuse, vUv - off).b;
      float vig = smoothstep(0.95, 0.18, r2 * 1.9);
      c *= mix(1.0, vig, uVig);
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x05070a, 1);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05070a, 0.035);
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
    this.camera.position.set(0, 1.25, 6.4);
    this.camera.lookAt(0, -0.12, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;

    const key = new THREE.DirectionalLight(0xfff0e0, 2.6);
    key.position.set(4, 6, 3);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fd8ff, 1.9);
    rim.position.set(-5, 2.2, -4);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffd7a8, 0.7);
    fill.position.set(-2, -3, 4);
    this.scene.add(fill);
    // kept so a shot can pull the room down and let the board's own LEDs carry the frame
    this.lights = [key, rim, fill];
    this.lightBase = this.lights.map((l) => l.intensity);
    this.copperLight = new THREE.PointLight(0xe08b4c, 0, 9, 2);
    this.copperLight.position.set(0, -0.6, 1.4);
    this.scene.add(this.copperLight);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.26, 0.7, 0.92);
    this.composer.addPass(this.bloom);
    this.frame = new ShaderPass(FrameShader);
    this.composer.addPass(this.frame);
    this.composer.addPass(new OutputPass());

    this.clock = new THREE.Clock();
    this.ticks = [];
    this.running = true;
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerT = new THREE.Vector2(0, 0);

    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('pointermove', (e) => {
      this.pointerT.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { this.running = !document.hidden; });
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
  }

  onTick(fn) { this.ticks.push(fn); }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      if (!this.running) return;
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;
      this.pointer.lerp(this.pointerT, 1 - Math.pow(0.001, dt));
      for (const fn of this.ticks) fn(t, dt, this.pointer);
      this.composer.render();
    };
    loop();
  }
}
