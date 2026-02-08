import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
//Cannon.js Documentation: https://schteppe.github.io/cannon.js/docs/

// Day 27: Physics Engine - Integrate Cannon.js or Ammo.js for real physics.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

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
camera.position.set(-10, 8, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Physics world setup (realism wow)
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

const groundMaterial = new CANNON.Material("groundMaterial");
const boxMaterial = new CANNON.Material("boxMaterial");
const ballMaterial = new CANNON.Material("ballMaterial");

// Contact materials (This is how materials interact with eachother)
const groundBoxContact = new CANNON.ContactMaterial(
  groundMaterial,
  boxMaterial,
  {
    friction: 0.4,
    restitution: 0.3,
  },
);
const boxBoxContact = new CANNON.ContactMaterial(boxMaterial, boxMaterial, {
  friction: 0.4,
  restitution: 0.3,
});
const ballBoxContact = new CANNON.ContactMaterial(ballMaterial, boxMaterial, {
  friction: 0.2,
  restitution: 0.7,
});
const ballGroundContact = new CANNON.ContactMaterial(
  ballMaterial,
  groundMaterial,
  {
    friction: 0.4,
    restitution: 0.6,
  },
);

world.addContactMaterial(groundBoxContact);
world.addContactMaterial(boxBoxContact);
world.addContactMaterial(ballBoxContact);
world.addContactMaterial(ballGroundContact);

// Arrays to store bodies and meshes (easier to maintain everything)
const boxBodies = [];
const boxMeshes = [];
const bodies = [];
const meshes = [];

const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterialThree = new THREE.MeshLambertMaterial({ color: 0x228b22 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterialThree);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Create pyramid out of boxes
function createBox(x, y, z, color = 0xff6b6b) {
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterialThree = new THREE.MeshLambertMaterial({ color });
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterialThree);
  boxMesh.position.set(x, y, z);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  scene.add(boxMesh);

  const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const boxBody = new CANNON.Body({ mass: 1, material: boxMaterial });
  boxBody.addShape(boxShape);
  boxBody.position.set(x, y, z);
  world.addBody(boxBody);

  boxBodies.push(boxBody);
  boxMeshes.push(boxMesh);
  bodies.push(boxBody);
  meshes.push(boxMesh);
}

// Build pyramid
const pyramidColors = [
  0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7,
];
let colorIndex = 0;

// Pyramid levels
for (let level = 0; level < 4; level++) {
  const y = 0.5 + level * 1.1; // Add more vertical spacing
  const size = 4 - level;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = (i - size / 2 + 0.5) * 1.1 + 5; // Add horizontal spacing
      const z = (j - size / 2 + 0.5) * 1.1; // Add depth spacing (spacings were added because the boxes exploded on initialization)
      createBox(x, y, z, pyramidColors[colorIndex % pyramidColors.length]);
      colorIndex++;
    }
  }
}

// Bowling balls array (makes it easier to remove/add balls)
const bowlingBalls = [];

function createBowlingBall(x, y, z) {
  const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const ballMaterialThree = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterialThree);
  ballMesh.position.set(x, y, z);
  ballMesh.castShadow = true;
  scene.add(ballMesh);

  const ballShape = new CANNON.Sphere(0.3);
  const ballBody = new CANNON.Body({ mass: 5, material: ballMaterial });
  ballBody.addShape(ballShape);
  ballBody.position.set(x, y, z);
  world.addBody(ballBody);

  const ballObject = { body: ballBody, mesh: ballMesh };
  bowlingBalls.push(ballObject);

  return ballObject;
}

// Launch ball function
function launchBall() {
  // Get camera position and direction (so we can make the ball come from the cam)
  const cameraPosition = camera.position.clone();
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  // Create ball slightly in front of camera ( so it looks a bit like throwing)
  const spawnPosition = cameraPosition
    .clone()
    .add(direction.clone().multiplyScalar(2));
  const ball = createBowlingBall(
    spawnPosition.x,
    spawnPosition.y,
    spawnPosition.z,
  );

  const targetDirection = direction.clone().multiplyScalar(15);
  targetDirection.x += (Math.random() - 0.5) * 2;
  targetDirection.y += (Math.random() - 0.5) * 1;
  targetDirection.z += (Math.random() - 0.5) * 2;

  const force = new CANNON.Vec3(
    targetDirection.x,
    targetDirection.y,
    targetDirection.z,
  );
  ball.body.velocity.set(force.x, force.y, force.z);

  // Remove old balls if too many
  if (bowlingBalls.length > 5) {
    const oldBall = bowlingBalls.shift();
    scene.remove(oldBall.mesh);
    world.removeBody(oldBall.body);
  }
}

function resetScene() {
  // Remove all bowling balls
  bowlingBalls.forEach((ball) => {
    scene.remove(ball.mesh);
    world.removeBody(ball.body);
  });
  bowlingBalls.length = 0;

  let boxIndex = 0;
  for (let level = 0; level < 4; level++) {
    const y = 0.5 + level * 1.1;
    const size = 4 - level;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (boxIndex < boxBodies.length) {
          const body = boxBodies[boxIndex];
          const mesh = boxMeshes[boxIndex];

          const x = (i - size / 2 + 0.5) * 1.1 + 5;
          const z = (j - size / 2 + 0.5) * 1.1;

          body.position.set(x, y, z);
          body.quaternion.set(0, 0, 0, 1);
          body.velocity.set(0, 0, 0);
          body.angularVelocity.set(0, 0, 0);

          mesh.position.copy(body.position);
          mesh.quaternion.copy(body.quaternion);

          boxIndex++;
        }
      }
    }
  }
}

window.addEventListener("click", launchBall);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    resetScene();
  }
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

  // Step the physics simulation with fixed timestep
  world.fixedStep();

  bowlingBalls.forEach((ball) => {
    ball.mesh.position.copy(ball.body.position);
    ball.mesh.quaternion.copy(ball.body.quaternion);
  });

  for (let i = 0; i < boxBodies.length; i++) {
    boxMeshes[i].position.copy(boxBodies[i].position);
    boxMeshes[i].quaternion.copy(boxBodies[i].quaternion);
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
