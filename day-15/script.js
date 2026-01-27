import * as THREE from "three";

// Day 15: Texture Mapping - Apply an image texture to a cube.

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, //FOV
  window.innerWidth / window.innerHeight, //Aspect Ratio
  0.1, //Near
  1000 //Far
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({ color: "#514c35" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Load texture for the cube (planks.png in assets/30-days-gallery)
const loader = new THREE.TextureLoader();
loader.load(
  "/assets/30-days-gallery/planks.png",
  (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    material.map = texture;
    material.needsUpdate = true;
  },
  undefined,
  (err) => console.warn("Failed to load texture:", err)
);

camera.position.z = 7;

function resize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  resize();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
