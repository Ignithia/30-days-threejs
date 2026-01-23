import * as THREE from "three";

// Day 11: Animate Properties - Use GSAP or Three.js animations to animate rotation/scale.

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 5);
camera.lookAt(0, 0, 0);

let cube;
const cubeSize = 3;
{
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0x123abc });
  cube = new THREE.Mesh(cubeGeo, cubeMat);

  scene.add(cube);
}
const cubes = [cube];
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

const raycaster = new THREE.Raycaster();
const pickPosition = { x: -100000, y: -100000 };
let hoveredObject = null;

cube.scale.set(1, 1, 1);

function setPickPosition(event) {
  pickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  pickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function clearPickPosition() {
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

function pick() {
  raycaster.setFromCamera(pickPosition, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length) {
    const obj = intersects[0].object;
    if (obj !== hoveredObject) {
      hoveredObject = obj;
      document.body.style.cursor = "pointer";
    }
  } else {
    if (hoveredObject) {
      hoveredObject = null;
      document.body.style.cursor = "default";
    }
  }
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

function animate(time) {
  time *= 0.001;

  pick();

  const target = hoveredObject === cube ? 2 : 1;
  cube.scale.x += (target - cube.scale.x) * 0.12;
  cube.scale.y += (target - cube.scale.y) * 0.12;
  cube.scale.z += (target - cube.scale.z) * 0.12;

  cube.rotation.x += 0.01;
  cube.rotation.z += 0.01;
  cube.rotation.y += 0.01;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
window.addEventListener("mousemove", setPickPosition);
window.addEventListener("mouseout", clearPickPosition);
window.addEventListener("mouseleave", clearPickPosition);
