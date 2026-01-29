import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

//Use a skybox or HDRI for reflections.

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
//Lighter reflections
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// PMREM generator
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

//Load EXR HDRI
//From polyhaven!
new EXRLoader().load("satara_night_1k.exr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = pmrem.fromEquirectangular(texture).texture;
  scene.environment = envMap;
  scene.background = envMap;
});

scene.add(new THREE.AmbientLight(0xffffff, 0.5)); //Learned I can add ambient light this way how cool!

// Example reflective object
const material = new THREE.MeshPhysicalMaterial({
  metalness: 1,
  roughness: 0,
  envMapIntensity: 1.0,
});

const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
scene.add(sphere);

// Animate
function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.005;
  renderer.render(scene, camera);
  controls.update();
}

animate();
