import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 16: Normal & Bump Maps - Add realistic surface detail using normal maps.

const canvas = document.createElement("canvas");
canvas.style.display = "block";
canvas.style.width = "100%";
canvas.style.height = "100%";
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x22222a);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.2, 3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load textures (using the three.js example stuff)
const loader = new THREE.TextureLoader();
const colorMap = loader.load(
  "https://threejs.org/examples/textures/brick_diffuse.jpg"
);
const normalMap = loader.load(
  "https://threejs.org/examples/textures/brick_normal.jpg"
);
const bumpMap = loader.load(
  "https://threejs.org/examples/textures/brick_bump.jpg"
);

// make textures tile and repeat for more visible detail
colorMap.wrapS =
  colorMap.wrapT =
  normalMap.wrapS =
  normalMap.wrapT =
  bumpMap.wrapS =
  bumpMap.wrapT =
    THREE.RepeatWrapping;
colorMap.repeat.set(2, 2);
normalMap.repeat.set(2, 2);
bumpMap.repeat.set(2, 2);

const sphereGeo = new THREE.SphereGeometry(0.9, 128, 128);
const sphereMat = new THREE.MeshStandardMaterial({
  map: colorMap,
  normalMap: normalMap,
  bumpMap: bumpMap,
  bumpScale: 0.25,
  metalness: 0.05,
  roughness: 0.9,
  displacementMap: bumpMap,
  displacementScale: 0.08,
});

sphereMat.normalScale = new THREE.Vector2(0.9, 0.9);
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(-1.05, 0.9, 0);
scene.add(sphere);
sphere.castShadow = true;

const planeGeo = new THREE.PlaneGeometry(2.5, 2.5, 64, 64);
const planeMat = sphereMat.clone();
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.set(1.5, 0.65, 0);
scene.add(plane);
plane.receiveShadow = true;

const groundGeo = new THREE.PlaneGeometry(10, 10);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0f0f12,
  roughness: 1,
  metalness: 0,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);
ground.receiveShadow = true;

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(3, 6, 4);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.camera.near = 0.5;
dir.shadow.camera.far = 20;
dir.shadow.camera.left = -6;
dir.shadow.camera.right = 6;
dir.shadow.camera.top = 6;
dir.shadow.camera.bottom = -6;
scene.add(dir);

const rim = new THREE.PointLight(0x66ccff, 0.25, 10);
rim.position.set(-3, 2, -2);
scene.add(rim);

plane.receiveShadow = true;
sphere.castShadow = true;

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize, { passive: true });

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  sphere.rotation.y = t * 0.25;
  plane.rotation.z = Math.sin(t * 0.2) * 0.02;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
