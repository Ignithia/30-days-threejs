import * as THREE from "three";

// Day 09: Mouse Hover Highlight - Highlight an object on mouseover using raycasting.

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

const cubes = [];
{
  for (let i = 0; i < 5; i++) {
    const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0xaa33f9 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);

    // Position cubes in a row
    cube.position.x = (i - 2) * 2.5;
    scene.add(cube);
    cubes.push(cube);
  }
}
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

// Picking so we can do a hover properly
const raycaster = new THREE.Raycaster();
const pickPosition = { x: -100000, y: -100000 };
let hoveredObject = null;
let savedColor = 0;
let lastColorChangeTime = 0;

// Update pick position on mouse move
function setPickPosition(event) {
  pickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  pickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Clear pick position when mouse leaves canvas
function clearPickPosition() {
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

// Pick objects in render loop
function pick(time) {
  raycaster.setFromCamera(pickPosition, camera);
  const intersects = raycaster.intersectObjects(cubes);

  // Restore previous hover
  if (
    hoveredObject &&
    (!intersects.length || intersects[0].object !== hoveredObject)
  ) {
    hoveredObject.material.emissive.setHex(savedColor);
    hoveredObject = null;
  }

  // Highlight hover
  if (intersects.length > 0) {
    const newHovered = intersects[0].object;

    // Save color on first hover
    if (newHovered !== hoveredObject) {
      hoveredObject = newHovered;
      savedColor = hoveredObject.material.emissive.getHex();
    }
    // Change color every 1 seconds (to prevent seizures)
    if (time - lastColorChangeTime > 1) {
      hoveredObject.material.color.set(Math.random() * 0xffffff);
      lastColorChangeTime = time;
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

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // Rotate while hovering
  if (hoveredObject) {
    hoveredObject.rotation.x += 0.01;
    hoveredObject.rotation.y += 0.01;
  }

  // Do picking every frame
  pick(time);

  renderer.render(scene, camera);
}
window.addEventListener("mousemove", setPickPosition);
window.addEventListener("mouseout", clearPickPosition);
window.addEventListener("mouseleave", clearPickPosition);
renderer.setAnimationLoop(animate);
