import * as THREE from "three";

// Day 08: Click to Change Color - Detect clicks on an object and change its color.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 5);
camera.lookAt(0, 0, 0);

let cube;
{
  const cubeGeo = new THREE.BoxGeometry(3, 3, 3);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xaa33f9 });
  cube = new THREE.Mesh(cubeGeo, cubeMat);

  scene.add(cube);
}

{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

//Raycaster so we can click the object
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); //Vector2 for 2D

function onMouseClick(event) {
  //convert to coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersect = raycaster.intersectObjects(scene.children);

  if (intersect.length > 0) {
    intersect[0].object.material.color.set(Math.random() * 0xffffff);
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

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
window.addEventListener("click", onMouseClick);
