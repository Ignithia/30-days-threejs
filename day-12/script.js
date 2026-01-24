import * as THREE from "three";

// Day 12: Camera Switcher - Toggle between multiple cameras.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Primary (default) camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 5);
camera.lookAt(0, 0, 0);

//Cameras to toggle between
const topCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
topCamera.position.set(0, 10, 0);
topCamera.lookAt(0, 0, 0);

const sideCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
sideCamera.position.set(10, 2, 0);
sideCamera.lookAt(0, 0, 0);

const cameras = [camera, topCamera, sideCamera];
let activeCameraIndex = 0;
let activeCamera = cameras[activeCameraIndex];

{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

{
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.9,
    metalness: 0,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff4466 }),
    new THREE.MeshStandardMaterial({ color: 0x44ff88 }),
    new THREE.MeshStandardMaterial({ color: 0x4499ff }),
    new THREE.MeshStandardMaterial({ color: 0xffcc44 }),
  ];

  const shapes = new THREE.Group();

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials[0]);
  box.position.set(-2, 0.5, -1);
  shapes.add(box);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    materials[1]
  );
  sphere.position.set(1.5, 0.7, -0.5);
  shapes.add(sphere);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 1.6, 32),
    materials[2]
  );
  cone.position.set(0.5, 0.8, 1.4);
  shapes.add(cone);

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.18, 16, 100),
    materials[3]
  );
  torus.position.set(-0.3, 0.6, 0.6);
  torus.rotation.x = Math.PI / 4;
  shapes.add(torus);

  scene.add(shapes);

  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 3);
  scene.add(dir);
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
    //Update the currently active camera's aspect
    activeCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    activeCamera.updateProjectionMatrix();
  }

  renderer.render(scene, activeCamera);
}

renderer.setAnimationLoop(animate);

// Cycle cameras on click/tap
window.addEventListener("pointerdown", () => {
  activeCameraIndex = (activeCameraIndex + 1) % cameras.length;
  activeCamera = cameras[activeCameraIndex];
});
