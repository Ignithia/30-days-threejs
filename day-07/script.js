import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 07: Review & Mini Scene - Build a small room scene using all skills so far.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3, 0);
controls.enableDamping = true;
controls.update();

const roomSize = 10; // Called roomSize because its the size for the floor, walls and ceiling
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 0.8,
  side: THREE.DoubleSide,
});

{
  // Floor
  const floorGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const floor = new THREE.Mesh(floorGeo, wallMaterial);
  floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);
}

{
  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const ceiling = new THREE.Mesh(ceilingGeo, wallMaterial);
  ceiling.rotation.x = Math.PI / 2; // Rotate opposite to floor
  ceiling.position.y = roomSize;
  ceiling.receiveShadow = true;
  scene.add(ceiling);
}
// Walls
{
  // Back
  const wallGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const backWall = new THREE.Mesh(wallGeo, wallMaterial);
  backWall.position.z = -roomSize / 2;
  backWall.position.y = roomSize / 2;
  backWall.receiveShadow = true;
  scene.add(backWall);
}

{
  // Front
  const wallGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const frontWall = new THREE.Mesh(wallGeo, wallMaterial);
  frontWall.position.z = roomSize / 2;
  frontWall.position.y = roomSize / 2;
  frontWall.rotation.y = Math.PI;
  frontWall.receiveShadow = true;
  scene.add(frontWall);
}

{
  // Left
  const wallGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const leftWall = new THREE.Mesh(wallGeo, wallMaterial);
  leftWall.position.x = -roomSize / 2;
  leftWall.position.y = roomSize / 2;
  leftWall.rotation.y = Math.PI / 2; // Rotate 90° to face right
  leftWall.receiveShadow = true;
  scene.add(leftWall);
}

{
  // Right wall
  const wallGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const rightWall = new THREE.Mesh(wallGeo, wallMaterial);
  rightWall.position.x = roomSize / 2;
  rightWall.position.y = roomSize / 2;
  rightWall.rotation.y = -Math.PI / 2; // Rotate -90° to face left
  rightWall.receiveShadow = true;
  scene.add(rightWall);
}

//
{
  // Table
  const tableGeo = new THREE.BoxGeometry(3, 0.2, 2);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.5,
  });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(0, 1.5, -2);
  table.castShadow = true;
  table.receiveShadow = true;
  scene.add(table);

  // Table legs (I saw that the documentation code makes it like this if u have something with a lot of similarities)
  const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.6,
  });

  const legPositions = [
    [-1.3, 0.75, -2.8], // Front left
    [1.3, 0.75, -2.8], // Front right
    [-1.3, 0.75, -1.2], // Back left
    [1.3, 0.75, -1.2], // Back right
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    leg.castShadow = true;
    scene.add(leg);
  });
}

let cube;
{
  // A cube
  const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: 0xff5733,
    roughness: 0.3,
    metalness: 0.2,
  });
  cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.set(-0.5, 3.5, -2);
  cube.castShadow = true;
  scene.add(cube);
}

{
  // A ball
  const sphereGeo = new THREE.SphereGeometry(0.5, 32, 16);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x4cda5f,
    roughness: 0.4,
    metalness: 0.6,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(0.7, 2.1, -1.8);
  sphere.castShadow = true;
  scene.add(sphere);
}

{
  // Lamp
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(-3, 1.5, 2);
  pole.castShadow = true;
  scene.add(pole);

  const lampGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffff88 });
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.set(-3, 3, 2);
  scene.add(lamp);
}

// Lighting
{
  // Main light
  const light = new THREE.PointLight(0xffffff, 100);
  light.position.set(0, 8, 0);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);
}

{
  // Lamp light
  const lampLight = new THREE.PointLight(0xffff88, 30);
  lampLight.position.set(-3, 3, 2);
  lampLight.castShadow = true;
  scene.add(lampLight);
}

{
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
}

// Resizing
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

// Animation
function animate(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  cube.position.y = 3.5 + Math.sin(time * 2) * 0.3;

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
