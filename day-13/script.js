import * as THREE from "three";

// Day 13: Basic Physics - Simulate simple gravity with y position changes.

const scene = new THREE.Scene();
scene.background = new THREE.Color("blue");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

let sphere;
{
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x52d165,
  });
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(0, 1, 0);
  scene.add(sphere);
}
{
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);
}
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

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

const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

let velocityY = 0;
function animate(time) {
  time *= 0.001;
  const speed = 0.05;
  const gravity = -0.01;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (keys[" "] && sphere.position.y <= 1 && velocityY === 0) {
    velocityY = 0.2;
  }
  sphere.position.y += velocityY;
  velocityY += gravity;

  if (sphere.position.y < 1) {
    sphere.position.y = 1;
    velocityY = 0;
  }
  if ((keys["w"] || keys["arrowup"]) && sphere.position.z > -9) {
    sphere.position.z -= speed;
  }
  if ((keys["s"] || keys["arrowdown"]) && sphere.position.z < 9) {
    sphere.position.z += speed;
  }
  if ((keys["a"] || keys["arrowleft"]) && sphere.position.x > -9) {
    sphere.position.x -= speed;
  }
  if ((keys["d"] || keys["arrowright"]) && sphere.position.x < 9) {
    sphere.position.x += speed;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
