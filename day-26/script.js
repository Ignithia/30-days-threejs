import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

// Day 26: Post Processing - Add bloom or depth of field with EffectComposer.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x0a0a0a, 5, 25);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
document.body.appendChild(renderer.domElement);

const colors = {
  primary: new THREE.Color(0x00ffcc),
  secondary: new THREE.Color(0x7df9ff),
  accent: new THREE.Color(0x02b894),
};

// Neon materials with transparency for glow effect
const neonMaterial1 = new THREE.MeshBasicMaterial({
  color: colors.primary,
  transparent: true,
  opacity: 0.8,
});

const neonMaterial2 = new THREE.MeshBasicMaterial({
  color: colors.secondary,
  transparent: true,
  opacity: 0.8,
});

const neonMaterial3 = new THREE.MeshBasicMaterial({
  color: colors.accent,
  transparent: true,
  opacity: 0.8,
});

// Create cyber elements
const cityGroup = new THREE.Group();

// Neon signs
const signGeometry = new THREE.BoxGeometry(2, 0.3, 0.1);
for (let i = 0; i < 8; i++) {
  const sign = new THREE.Mesh(
    signGeometry,
    i % 3 === 0 ? neonMaterial1 : i % 3 === 1 ? neonMaterial2 : neonMaterial3,
  );
  sign.position.set(
    (Math.random() - 0.5) * 20,
    Math.random() * 8 + 2,
    (Math.random() - 0.5) * 20,
  );
  sign.rotation.y = Math.random() * Math.PI * 2;
  cityGroup.add(sign);

  // Add point light for each sign
  const signLight = new THREE.PointLight(
    i % 3 === 0
      ? colors.primary
      : i % 3 === 1
        ? colors.secondary
        : colors.accent,
    2,
    8,
  );
  signLight.position.copy(sign.position);
  scene.add(signLight);
}

// Floating neon rings
const ringGeometry = new THREE.TorusGeometry(1, 0.1, 8, 32);
const rings = [];
for (let i = 0; i < 12; i++) {
  const ring = new THREE.Mesh(
    ringGeometry,
    i % 2 === 0 ? neonMaterial1 : neonMaterial2,
  );
  ring.position.set(
    (Math.random() - 0.5) * 30,
    Math.random() * 15 + 3,
    (Math.random() - 0.5) * 30,
  );
  ring.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  rings.push(ring);
  cityGroup.add(ring);

  // Add light for each ring
  const ringLight = new THREE.PointLight(
    i % 2 === 0 ? colors.primary : colors.secondary,
    1.5,
    6,
  );
  ringLight.position.copy(ring.position);
  scene.add(ringLight);
}

// Neon tubes/pillars
const tubeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 8);
for (let i = 0; i < 15; i++) {
  const tube = new THREE.Mesh(tubeGeometry, neonMaterial3);
  tube.position.set((Math.random() - 0.5) * 40, 4, (Math.random() - 0.5) * 40);
  cityGroup.add(tube);

  const tubeLight = new THREE.PointLight(colors.accent, 1, 10);
  tubeLight.position.copy(tube.position);
  tubeLight.position.y += 4;
  scene.add(tubeLight);
}

// Central floating crystal
const crystalGeometry = new THREE.OctahedronGeometry(1.5);
const crystal = new THREE.Mesh(crystalGeometry, neonMaterial1);
crystal.position.set(0, 8, 0);
cityGroup.add(crystal);

// Main crystal light
const crystalLight = new THREE.PointLight(colors.primary, 3, 15);
crystalLight.position.copy(crystal.position);
scene.add(crystalLight);

scene.add(cityGroup);

// Subtle ambient lighting to enhance the neon glow
const ambientLight = new THREE.AmbientLight(0x002244, 0.2);
scene.add(ambientLight);

// Post-processing pipeline for cyber effects
const composer = new EffectComposer(renderer);

// Base render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom pass for neon glow
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.0, // strength
  0.8, // radius
  0.1, // threshold
);
composer.addPass(bloomPass);

// Film grain for intensifying the cyber aesthetic
const filmPass = new FilmPass(0.15, 0.025, 648, false);
composer.addPass(filmPass);

// Afterimage for motion trails
const afterimagePass = new AfterimagePass(0.92);
composer.addPass(afterimagePass);

// Custom chromatic aberration shader for adding the glitch effect
const chromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.003 },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float time;
    varying vec2 vUv;
    
    void main() {
      vec2 offset = vec2(amount * sin(time * 2.0 + vUv.y * 10.0), 0.0);
      
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

const chromaticPass = new ShaderPass(chromaticAberrationShader);
composer.addPass(chromaticPass);

camera.position.set(0, 12, 20);
camera.lookAt(0, 5, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 5, 0);
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI * 0.8;

// Animation loop with rotating objects and pulsing effects
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Animate crystal rotation
  crystal.rotation.x = time * 0.5;
  crystal.rotation.y = time * 0.3;
  crystal.position.y = 8 + Math.sin(time * 2) * 0.5;

  // Animate rings
  rings.forEach((ring, index) => {
    ring.rotation.x += 0.01 * (index % 2 === 0 ? 1 : -1);
    ring.rotation.y += 0.015 * (index % 2 === 0 ? -1 : 1);
    ring.position.y += Math.sin(time * 2 + index) * 0.01;
  });

  // Animate bloom intensity
  bloomPass.strength = 1.5 + Math.sin(time * 3) * 0.5;

  // Animate chromatic aberration
  chromaticPass.uniforms.time.value = time;
  chromaticPass.uniforms.amount.value = 0.003 + Math.sin(time * 4) * 0.002;

  // Pulse lights
  crystalLight.intensity = 3 + Math.sin(time * 4) * 1;

  composer.render();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
