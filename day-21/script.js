import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// Day 21: Mini Scene with Assets - A desk scene with textured models.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a3a);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(2, 1.6, 3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// room dimensions
const roomWidth = 5;
const roomHeight = 3;
const roomDepth = 4;

// create room walls
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b7d6b,
  roughness: 0.9,
});

// floor material - wood-like
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x6b4423,
  roughness: 0.8,
});

// floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(roomWidth, roomDepth),
  floorMaterial,
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// walls
const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(roomDepth, roomHeight),
  wallMaterial,
);
leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(roomWidth, roomHeight),
  wallMaterial,
);
backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
scene.add(backWall);

const rightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(roomDepth, roomHeight),
  wallMaterial,
);
rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

// ceiling
const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(roomWidth, roomDepth),
  wallMaterial,
);
ceiling.position.y = roomHeight;
ceiling.rotation.x = Math.PI / 2;
scene.add(ceiling);

// window with night city view
const windowFrame = new THREE.Group();
const frameColor = 0x8b4513;
const windowWidth = 2;
const windowHeight = 1.5;

// window frame
const frameThickness = 0.05;
const topFrame = new THREE.Mesh(
  new THREE.BoxGeometry(
    windowWidth + frameThickness * 2,
    frameThickness,
    frameThickness,
  ),
  new THREE.MeshStandardMaterial({ color: frameColor }),
);
topFrame.position.set(0, windowHeight / 2, 0);
windowFrame.add(topFrame);

const bottomFrame = topFrame.clone();
bottomFrame.position.set(0, -windowHeight / 2, 0);
windowFrame.add(bottomFrame);

const leftFrame = new THREE.Mesh(
  new THREE.BoxGeometry(frameThickness, windowHeight, frameThickness),
  new THREE.MeshStandardMaterial({ color: frameColor }),
);
leftFrame.position.set(-windowWidth / 2, 0, 0);
windowFrame.add(leftFrame);

const rightFrame = leftFrame.clone();
rightFrame.position.set(windowWidth / 2, 0, 0);
windowFrame.add(rightFrame);

// glass with night sky gradient
const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x87ceeb,
  transparent: true,
  opacity: 0.15,
  roughness: 0.0,
  metalness: 0.1,
});
const glass = new THREE.Mesh(
  new THREE.PlaneGeometry(windowWidth, windowHeight),
  glassMaterial,
);
glass.position.z = -0.01;
windowFrame.add(glass);

windowFrame.position.set(1.2, 1.2, -roomDepth / 2 + 0.01);
scene.add(windowFrame);

// desk setup
const deskGroup = new THREE.Group();
const woodMaterial = new THREE.MeshStandardMaterial({
  color: 0xa0522d,
  roughness: 0.7,
});

// desk surface
const deskTop = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.05, 0.7),
  woodMaterial,
);
deskTop.position.y = 0.75;
deskTop.castShadow = true;
deskTop.receiveShadow = true;
deskGroup.add(deskTop);

// desk legs
const legGeometry = new THREE.BoxGeometry(0.05, 0.75, 0.05);
const positions = [
  [-0.7, 0.375, -0.3],
  [0.7, 0.375, -0.3],
  [-0.7, 0.375, 0.3],
  [0.7, 0.375, 0.3],
];
positions.forEach((pos) => {
  const leg = new THREE.Mesh(legGeometry, woodMaterial);
  leg.position.set(...pos);
  leg.castShadow = true;
  deskGroup.add(leg);
});

deskGroup.position.set(1.5, 0, -1);
scene.add(deskGroup);

// Load GLTF models
const loader = new GLTFLoader();

// Load PC model
loader.load(
  "./models/Pc/scene.gltf",
  (gltf) => {
    const pcModel = gltf.scene;
    pcModel.scale.set(0.3, 0.3, 0.3); // Scale down to fit desk
    pcModel.position.set(0, 0.75, -0.15);
    pcModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    deskGroup.add(pcModel);
  },
  undefined,
  (error) => {
    console.warn("PC model failed to load:", error);
    // Fallback to original monitor code if model fails
    createFallbackMonitor();
  },
);

// Load Desk Lamp model
loader.load(
  "./models/Desklamp/scene.gltf",
  (gltf) => {
    const lampModel = gltf.scene;
    lampModel.scale.set(0.15, 0.15, 0.15); // Scale to appropriate size
    lampModel.position.set(-0.4, 0.75, 0.2);
    lampModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    deskGroup.add(lampModel);
  },
  undefined,
  (error) => {
    console.warn("Lamp model failed to load:", error);
    // Fallback to original lamp code if model fails
    createFallbackLamp();
  },
);

function createFallbackMonitor() {
  // Original monitor code as fallback
  const monitorBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.03, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x222222 }),
  );
  monitorBase.position.y = 0.775;
  monitorBase.castShadow = true;
  deskGroup.add(monitorBase);

  const monitorStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x222222 }),
  );
  monitorStand.position.set(0, 0.84, -0.05);
  monitorStand.castShadow = true;
  deskGroup.add(monitorStand);

  const screenBezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.025),
    new THREE.MeshStandardMaterial({ color: 0x111111 }),
  );
  screenBezel.position.set(0, 0.95, -0.05);
  screenBezel.castShadow = true;
  deskGroup.add(screenBezel);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.2, 0.01),
    screenMaterial,
  );
  screen.position.set(0, 0.95, -0.045);
  screen.castShadow = true;
  deskGroup.add(screen);
}

function createFallbackLamp() {
  // Original lamp code as fallback
  const lampGroup = new THREE.Group();
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x444444 }),
  );
  lampBase.position.set(-0.4, 0.785, 0.2);
  lampGroup.add(lampBase);

  const lampArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x444444 }),
  );
  lampArm.position.set(-0.4, 1, 0.2);
  lampArm.rotation.z = 0.3;
  lampGroup.add(lampArm);

  lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffaa00,
      emissiveIntensity: 0.1,
    }),
  );
  lampHead.position.set(-0.28, 1.15, 0.2);
  lampHead.rotation.z = 0.5;
  lampGroup.add(lampHead);

  deskGroup.add(lampGroup);
}

// chair
const chairGroup = new THREE.Group();
const chairMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a2a,
  roughness: 0.6,
});

const chairSeat = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, 0.05, 0.4),
  chairMaterial,
);
chairSeat.position.y = 0.5;
chairSeat.castShadow = true;
chairGroup.add(chairSeat);

const chairBack = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, 0.6, 0.05),
  chairMaterial,
);
chairBack.position.set(0, 0.8, -0.175);
chairBack.castShadow = true;
chairGroup.add(chairBack);

// chair legs
const chairLegGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
[
  [0.15, 0.15],
  [0.15, -0.15],
  [-0.15, 0.15],
  [-0.15, -0.15],
].forEach(([x, z]) => {
  const leg = new THREE.Mesh(chairLegGeom, chairMaterial);
  leg.position.set(x, 0.25, z);
  leg.castShadow = true;
  chairGroup.add(leg);
});

chairGroup.position.set(1.2, 0, -0.3);
chairGroup.rotation.y = Math.PI; // Face the desk
scene.add(chairGroup);

// bed
const bedGroup = new THREE.Group();
const bedMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
const bedSheetMaterial = new THREE.MeshStandardMaterial({ color: 0x2f4f4f });

const bedFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.2, 1),
  bedMaterial,
);
bedFrame.position.y = 0.1;
bedFrame.castShadow = true;
bedGroup.add(bedFrame);

const mattress = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 0.15, 0.9),
  bedSheetMaterial,
);
mattress.position.y = 0.275;
mattress.castShadow = true;
bedGroup.add(mattress);

// First pillow at head of bed
const pillow = new THREE.Mesh(
  new THREE.BoxGeometry(0.36, 0.1, 0.35),
  new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 }),
);
pillow.position.set(-0.6, 0.35, 0.17);
pillow.castShadow = true;
bedGroup.add(pillow);

// Second pillow
const pillow2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.36, 0.1, 0.35),
  new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 }),
);
pillow2.position.set(-0.6, 0.35, -0.17);
pillow2.castShadow = true;
bedGroup.add(pillow2);

// Blanket
const blanket = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.015, 0.7),
  new THREE.MeshStandardMaterial({ color: 0x4682b4, roughness: 0.8 }),
);
blanket.position.set(0, 0.35, 0);
blanket.castShadow = true;
bedGroup.add(blanket);

bedGroup.position.set(-1.5, 0, 0.5);
scene.add(bedGroup);

// Define screen material for fallback monitor
const screenMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  emissive: 0xffe135,
  emissiveIntensity: 0.4,
});

// Global reference for lamp head animation
let lampHead = null;

// keyboard
const keyboard = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, 0.02, 0.15),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 }),
);
keyboard.position.set(0, 0.785, 0.15);
keyboard.castShadow = true;
deskGroup.add(keyboard);

// mouse
const mouse = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 0.015, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }),
);
mouse.position.set(0.25, 0.785, 0.15);
mouse.castShadow = true;
deskGroup.add(mouse);

// small book stack
const book1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.12, 0.015, 0.18),
  new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
);
book1.position.set(-0.5, 0.785, -0.1);
book1.castShadow = true;
deskGroup.add(book1);

const book2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.11, 0.015, 0.17),
  new THREE.MeshStandardMaterial({ color: 0x2f4f4f }),
);
book2.position.set(-0.5, 0.8, -0.1);
book2.castShadow = true;
deskGroup.add(book2);

// enhanced plant
const plantPot = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.06, 0.07),
  new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }),
);
plantPot.position.set(0.45, 0.815, 0.25);
plantPot.castShadow = true;
deskGroup.add(plantPot);

const plantStem = new THREE.Mesh(
  new THREE.CylinderGeometry(0.005, 0.005, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x228b22 }),
);
plantStem.position.set(0.45, 0.885, 0.25);
plantStem.castShadow = true;
deskGroup.add(plantStem);

const plantLeaves = new THREE.Mesh(
  new THREE.SphereGeometry(0.06, 8, 6),
  new THREE.MeshStandardMaterial({ color: 0x32cd32, roughness: 0.7 }),
);
plantLeaves.position.set(0.45, 0.92, 0.25);
plantLeaves.castShadow = true;
deskGroup.add(plantLeaves);

// atmospheric lighting
scene.add(new THREE.AmbientLight(0x4a4564, 0.3));

// desk lamp light (warm)
const deskLight = new THREE.SpotLight(0xffc649, 2.0, 3, Math.PI / 5, 0.3);
deskLight.position.set(1.1, 1.25, -0.8); // Adjusted for new lamp position
deskLight.target.position.set(1.5, 0.75, -1);
deskLight.castShadow = true;
deskLight.shadow.mapSize.setScalar(1024);
scene.add(deskLight);
scene.add(deskLight.target);

// window light (cool blue)
const windowLight = new THREE.DirectionalLight(0x8bb4ff, 0.4);
windowLight.position.set(1.2, 2, -1.8);
windowLight.target.position.set(0, 0, 0);
windowLight.castShadow = true;
windowLight.shadow.mapSize.setScalar(2048);
scene.add(windowLight);
scene.add(windowLight.target);

// screen glow - directional like real monitor
const screenLight = new THREE.SpotLight(0xffe135, 0.6, 2, Math.PI / 3, 0.3);
screenLight.position.set(1.5, 0.95, -1.05);
screenLight.target.position.set(1.5, 0.75, -0.5); // Point toward user area
scene.add(screenLight);
scene.add(screenLight.target);

// simple animation
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

function animate(t) {
  t *= 0.001;
  resize();
  controls.update();

  // subtle screen flicker
  screenLight.intensity = 0.6 + Math.sin(t * 8) * 0.05;
  screenMaterial.emissiveIntensity = 0.3 + Math.sin(t * 12) * 0.02;

  // gentle lamp sway (only if fallback lamp is loaded)
  if (lampHead) {
    lampHead.rotation.x = Math.sin(t * 0.8) * 0.02;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
