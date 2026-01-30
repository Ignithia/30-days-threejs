import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 18: GLTF Model Loading - Load a .glb or .gltf model using GLTFLoader.

const scene = new THREE.Scene();
scene.background = new THREE.Color("gray");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 12);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);
controls.update();

{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

{
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);
}

// Load the model placed in the same folder: Engine.glb
const loader = new GLTFLoader();
loader.load(
  "./Engine.glb",
  (gltf) => {
    const model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh) node.castShadow = true;
    });
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);
    console.log("GLB loaded:", gltf);
  },
  (xhr) => {
    if (xhr.total)
      console.log(
        `Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`
      );
  },
  (error) => {
    console.error("Error loading GLB:", error);
  }
);

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function animate(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
