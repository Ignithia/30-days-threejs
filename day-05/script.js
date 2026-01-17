import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 05: Shadows - Learn shadow casting and receiving with multiple objects.

const scene = new THREE.Scene();
scene.background = new THREE.Color("Blue");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const fov = 45;
const aspect = 2;
const near = 0.1;
const far = 150;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 30);
scene.add(camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.autoRotate = true;
controls.update();

{
  //ground
  const planeSize = 40;
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -0.5;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
{
  //Cube
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: "#8AC",
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
{
  //Sphere
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthDivisions,
    sphereHeightDivisions
  );
  const sphereMat = new THREE.MeshPhongMaterial({
    color: "#4cda5f",
  });
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}
{
  const light = new THREE.SpotLight(0xffffff, 200);
  light.position.set(0, 10, 5); // Position above and slightly forward
  light.castShadow = true;

  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 100;

  light.angle = Math.PI / 3; // 60 degree cone
  light.penumbra = 0.3; // Slightly soft edges (0=hard, 1=very soft)
  light.decay = 2; // Realistic light falloff
  light.distance = 100; // Maximum light range

  camera.add(light);
  camera.add(light.target);
  light.target.position.set(0, -5, -5); // Points down and forward at the scene
}

// Ambient light so areas outside spotlight aren't completely black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
