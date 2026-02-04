import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 23: Fog & Atmosphere - Add depth with fog.

const scene = new THREE.Scene();

// Add fog for atmosphere
scene.fog = new THREE.FogExp2(0x1a2a1a, 0.08);
scene.background = new THREE.Color(0x0f1a0f);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 3, 15);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// Lighting setup
{
  const ambientLight = new THREE.AmbientLight(0x2a4a2a, 0.15);
  scene.add(ambientLight);

  // moonlight
  const moonLight = new THREE.DirectionalLight(0x6a8a6a, 0.3);
  moonLight.position.set(-10, 20, 5);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 2048;
  moonLight.shadow.mapSize.height = 2048;
  moonLight.shadow.camera.near = 0.1;
  moonLight.shadow.camera.far = 100;
  moonLight.shadow.camera.left = -20;
  moonLight.shadow.camera.right = 20;
  moonLight.shadow.camera.top = 20;
  moonLight.shadow.camera.bottom = -20;
  scene.add(moonLight);
}

// Create the house
function createHouse() {
  const houseGroup = new THREE.Group();

  // Main house body
  const houseGeometry = new THREE.BoxGeometry(4, 3, 3);
  const houseMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
  const house = new THREE.Mesh(houseGeometry, houseMaterial);
  house.position.y = 1.5;
  house.castShadow = true;
  house.receiveShadow = true;
  houseGroup.add(house);

  // Roof
  const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 4;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  houseGroup.add(roof);

  // Windows
  const windowGeometry = new THREE.PlaneGeometry(0.8, 1);
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6644,
    transparent: true,
    opacity: 0.9,
  });

  // Front windows
  const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
  window1.position.set(-0.8, 1.5, 1.51);
  houseGroup.add(window1);

  const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
  window2.position.set(0.8, 1.5, 1.51);
  houseGroup.add(window2);

  // Window lights
  const windowLight1 = new THREE.PointLight(0xff4422, 3, 15);
  windowLight1.position.set(-0.8, 1.5, 2);
  houseGroup.add(windowLight1);

  const windowLight2 = new THREE.PointLight(0xff4422, 3, 15);
  windowLight2.position.set(0.8, 1.5, 2);
  houseGroup.add(windowLight2);

  const porchLight = new THREE.PointLight(0x666644, 1.2, 8);
  porchLight.position.set(0, 0.5, 2.5);
  houseGroup.add(porchLight);

  // Door
  const doorGeometry = new THREE.PlaneGeometry(0.8, 1.8);
  const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.9, 1.51);
  houseGroup.add(door);

  return houseGroup;
}

// Create forest trees
function createTree(x, z, scale = 1, isDead = false) {
  const treeGroup = new THREE.Group();

  // Trunk
  const trunkTopRadius = isDead ? 0.3 * scale : 0.2 * scale;
  const trunkBottomRadius = isDead ? 0.45 * scale : 0.3 * scale;
  const trunkHeight = isDead ? 3 * scale : 2 * scale;

  const trunkGeometry = new THREE.CylinderGeometry(
    trunkTopRadius,
    trunkBottomRadius,
    trunkHeight,
  );
  const trunkMaterial = new THREE.MeshLambertMaterial({
    color: isDead ? 0x2a2a2a : 0x3a3a3a,
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  if (!isDead) {
    // Foliage
    const foliageGeometry = new THREE.ConeGeometry(1.5 * scale, 3 * scale, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x0a2a0a });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 3 * scale;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    treeGroup.add(foliage);
  } else {
    const branchCount = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < branchCount; i++) {
      const branchLength = (0.6 + Math.random() * 0.6) * scale;
      const branchGeometry = new THREE.CylinderGeometry(
        0.02 * scale,
        0.06 * scale,
        branchLength,
      );

      branchGeometry.translate(0, branchLength / 2, 0);

      const branchMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
      const branch = new THREE.Mesh(branchGeometry, branchMaterial);

      // Position branch base
      const height = 1.2 * scale + (i / branchCount) * 2.0 * scale;
      const trunkRadius = 0.1 * scale;
      const angle = (i / branchCount) * Math.PI * 2;

      branch.position.set(
        Math.cos(angle) * trunkRadius,
        height,
        Math.sin(angle) * trunkRadius,
      );

      // Use quaternion to reliably point branch outward and slightly up
      const outwardDir = new THREE.Vector3(
        Math.cos(angle),
        0.3 + Math.random() * 0.3,
        Math.sin(angle),
      ).normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(up, outwardDir);
      branch.quaternion.copy(quaternion);

      branch.castShadow = true;
      treeGroup.add(branch);
    }
  }

  treeGroup.position.set(x, 0, z);
  return treeGroup;
}

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x0f1f0f });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Add house to scene
const house = createHouse();
scene.add(house);

// Add trees around the house
const treePositions = [
  [-8, -5],
  [-6, -8],
  [6, -6],
  [8, -3],
  [-10, 2],
  [9, 1],
  [-4, 8],
  [3, 9],
  [-12, -2],
  [11, 4],
  [-7, 6],
  [5, 7],
  [-15, -8],
  [14, -7],
  [-13, 5],
  [12, -10],
  [0, -12],
  [-2, 10],
];

treePositions.forEach(([x, z]) => {
  const scale = 0.8 + Math.random() * 0.6;
  const isDead = Math.random() < 0.3;
  const tree = createTree(x, z, scale, isDead);
  scene.add(tree);
});

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

  // Update orbit controls
  controls.update();

  // Animate lights for creepy flickering effect
  const windowLights = scene.children.filter(
    (child) =>
      child.type === "Group" &&
      child.children.some((c) => c.type === "PointLight"),
  );

  if (windowLights.length > 0) {
    windowLights[0].children.forEach((child) => {
      if (child.type === "PointLight") {
        const flicker =
          Math.sin(time * 8 + child.position.x * 3) * 0.5 +
          Math.sin(time * 15 + child.position.z) * 0.3;
        const blackout = Math.sin(time * 0.7) < -0.9 ? 0 : 1;

        if (child.position.y < 1) {
          // Porch light
          child.intensity = (0.3 + flicker * 0.4) * blackout;
        } else {
          // Window lights
          child.intensity = (1.5 + flicker * 0.8) * blackout;
        }
      }
    });
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
