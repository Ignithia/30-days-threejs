import * as THREE from "three";

// Day 28: Procedural Generation - Create terrain or objects with random data.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a0a);

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

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let yaw = 0;
let pitch = 0;
const pitchLimit = Math.PI / 3;

// Dungeon parameters
const ROOM_SIZE = 10;
const CORRIDOR_WIDTH = 3;
const WALL_HEIGHT = 4;
const dungeonSize = 9;

const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
const torchMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 });
const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });

// Dungeon data structure
class Room {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.connected = false;
    this.connections = { north: false, south: false, east: false, west: false };
    this.objects = [];
  }
}

// Create dungeon grid
const dungeon = [];
for (let y = 0; y < dungeonSize; y++) {
  dungeon[y] = [];
  for (let x = 0; x < dungeonSize; x++) {
    dungeon[y][x] = null;
  }
}

// Generate dungeon using random walk
function generateDungeon() {
  const rooms = [];
  const startX = Math.floor(dungeonSize / 2);
  const startY = Math.floor(dungeonSize / 2);

  // Create starting room
  dungeon[startY][startX] = new Room(startX, startY);
  rooms.push(dungeon[startY][startX]);

  const toVisit = [{ x: startX, y: startY }];
  const visited = new Set();
  visited.add(`${startX},${startY}`);

  // Generate rooms using random walk
  while (toVisit.length > 0 && rooms.length < 15) {
    const current = toVisit.pop();
    const directions = [
      { x: 0, y: -1, connection: "north" },
      { x: 0, y: 1, connection: "south" },
      { x: 1, y: 0, connection: "east" },
      { x: -1, y: 0, connection: "west" },
    ];

    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const dir of directions) {
      const newX = current.x + dir.x;
      const newY = current.y + dir.y;
      const key = `${newX},${newY}`;

      if (
        newX >= 0 &&
        newX < dungeonSize &&
        newY >= 0 &&
        newY < dungeonSize &&
        !visited.has(key) &&
        Math.random() > 0.3
      ) {
        // Create new room
        dungeon[newY][newX] = new Room(newX, newY);
        rooms.push(dungeon[newY][newX]);
        visited.add(key);
        toVisit.push({ x: newX, y: newY });

        // Connect rooms
        const currentRoom = dungeon[current.y][current.x];
        const newRoom = dungeon[newY][newX];

        currentRoom.connections[dir.connection] = true;
        const opposite = {
          north: "south",
          south: "north",
          east: "west",
          west: "east",
        };
        newRoom.connections[opposite[dir.connection]] = true;
      }
    }
  }

  return rooms;
}

// Create wall mesh
function createWall(x, y, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const wall = new THREE.Mesh(geometry, wallMaterial);
  wall.position.set(x, y, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  return wall;
}

// Create floor mesh
function createFloor(x, y, z, width, depth) {
  const geometry = new THREE.BoxGeometry(width, 0.2, depth);
  const floor = new THREE.Mesh(geometry, floorMaterial);
  floor.position.set(x, y, z);
  floor.receiveShadow = true;
  return floor;
}

// Create ceiling mesh
function createCeiling(x, y, z, width, depth) {
  const geometry = new THREE.BoxGeometry(width, 0.2, depth);
  const ceiling = new THREE.Mesh(geometry, ceilingMaterial);
  ceiling.position.set(x, y, z);
  return ceiling;
}

// Create torch
function createTorch(x, z) {
  const group = new THREE.Group();

  // Torch base
  const baseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2);
  const base = new THREE.Mesh(
    baseGeometry,
    new THREE.MeshLambertMaterial({ color: 0x4a2c2a }),
  );
  base.position.set(x, 1, z);
  group.add(base);

  // Flame
  const flameGeometry = new THREE.SphereGeometry(0.3, 8, 6);
  const flame = new THREE.Mesh(flameGeometry, torchMaterial);
  flame.position.set(x, 2.5, z);
  flame.scale.y = 1.5;
  group.add(flame);

  // Light
  const light = new THREE.PointLight(0xff6600, 1, 10);
  light.position.set(x, 2.5, z);
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  group.add(light);

  return group;
}

// Create chest
function createChest(x, z) {
  const group = new THREE.Group();

  // Chest body
  const bodyGeometry = new THREE.BoxGeometry(1, 0.6, 0.8);
  const body = new THREE.Mesh(bodyGeometry, chestMaterial);
  body.position.set(x, 0.3, z);
  body.castShadow = true;
  group.add(body);

  // Chest lid
  const lidGeometry = new THREE.BoxGeometry(1, 0.1, 0.8);
  const lid = new THREE.Mesh(lidGeometry, chestMaterial);
  lid.position.set(x, 0.65, z);
  lid.castShadow = true;
  group.add(lid);

  return group;
}

// Create pillar
function createPillar(x, z) {
  const geometry = new THREE.CylinderGeometry(0.3, 0.3, WALL_HEIGHT);
  const pillar = new THREE.Mesh(geometry, pillarMaterial);
  pillar.position.set(x, WALL_HEIGHT / 2, z);
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  return pillar;
}

// Build dungeon geometry
function buildDungeon() {
  const rooms = generateDungeon();

  for (const room of rooms) {
    const roomX = room.x * (ROOM_SIZE + CORRIDOR_WIDTH);
    const roomZ = room.y * (ROOM_SIZE + CORRIDOR_WIDTH);

    // Create room floor
    const floor = createFloor(roomX, 0, roomZ, ROOM_SIZE, ROOM_SIZE);
    scene.add(floor);

    // Create room ceiling
    const ceiling = createCeiling(
      roomX,
      WALL_HEIGHT,
      roomZ,
      ROOM_SIZE,
      ROOM_SIZE,
    );
    scene.add(ceiling);

    // Create walls
    if (!room.connections.north) {
      const wall = createWall(
        roomX,
        WALL_HEIGHT / 2,
        roomZ - ROOM_SIZE / 2,
        ROOM_SIZE,
        WALL_HEIGHT,
        0.5,
      );
      scene.add(wall);
      walls.push(wall);
    } else {
      const doorWidth = 2;
      const frameWallWidth = (ROOM_SIZE - doorWidth) / 2;
      const leftFrameWall = createWall(
        roomX - ROOM_SIZE / 2 + frameWallWidth / 2,
        WALL_HEIGHT / 2,
        roomZ - ROOM_SIZE / 2,
        frameWallWidth,
        WALL_HEIGHT,
        0.5,
      );
      const rightFrameWall = createWall(
        roomX + ROOM_SIZE / 2 - frameWallWidth / 2,
        WALL_HEIGHT / 2,
        roomZ - ROOM_SIZE / 2,
        frameWallWidth,
        WALL_HEIGHT,
        0.5,
      );
      scene.add(leftFrameWall);
      scene.add(rightFrameWall);
      walls.push(leftFrameWall);
      walls.push(rightFrameWall);
    }
    if (!room.connections.south) {
      const wall = createWall(
        roomX,
        WALL_HEIGHT / 2,
        roomZ + ROOM_SIZE / 2,
        ROOM_SIZE,
        WALL_HEIGHT,
        0.5,
      );
      scene.add(wall);
      walls.push(wall);
    } else {
      const doorWidth = 2;
      const frameWallWidth = (ROOM_SIZE - doorWidth) / 2;
      const leftFrameWall = createWall(
        roomX - ROOM_SIZE / 2 + frameWallWidth / 2,
        WALL_HEIGHT / 2,
        roomZ + ROOM_SIZE / 2,
        frameWallWidth,
        WALL_HEIGHT,
        0.5,
      );
      const rightFrameWall = createWall(
        roomX + ROOM_SIZE / 2 - frameWallWidth / 2,
        WALL_HEIGHT / 2,
        roomZ + ROOM_SIZE / 2,
        frameWallWidth,
        WALL_HEIGHT,
        0.5,
      );
      scene.add(leftFrameWall);
      scene.add(rightFrameWall);
      walls.push(leftFrameWall);
      walls.push(rightFrameWall);
    }
    if (!room.connections.west) {
      const wall = createWall(
        roomX - ROOM_SIZE / 2,
        WALL_HEIGHT / 2,
        roomZ,
        0.5,
        WALL_HEIGHT,
        ROOM_SIZE,
      );
      scene.add(wall);
      walls.push(wall);
    } else {
      const doorWidth = 2;
      const frameWallDepth = (ROOM_SIZE - doorWidth) / 2;
      const topFrameWall = createWall(
        roomX - ROOM_SIZE / 2,
        WALL_HEIGHT / 2,
        roomZ - ROOM_SIZE / 2 + frameWallDepth / 2,
        0.5,
        WALL_HEIGHT,
        frameWallDepth,
      );
      const bottomFrameWall = createWall(
        roomX - ROOM_SIZE / 2,
        WALL_HEIGHT / 2,
        roomZ + ROOM_SIZE / 2 - frameWallDepth / 2,
        0.5,
        WALL_HEIGHT,
        frameWallDepth,
      );
      scene.add(topFrameWall);
      scene.add(bottomFrameWall);
      walls.push(topFrameWall);
      walls.push(bottomFrameWall);
    }
    if (!room.connections.east) {
      const wall = createWall(
        roomX + ROOM_SIZE / 2,
        WALL_HEIGHT / 2,
        roomZ,
        0.5,
        WALL_HEIGHT,
        ROOM_SIZE,
      );
      scene.add(wall);
      walls.push(wall);
    } else {
      const doorWidth = 2;
      const frameWallDepth = (ROOM_SIZE - doorWidth) / 2;
      const topFrameWall = createWall(
        roomX + ROOM_SIZE / 2,
        WALL_HEIGHT / 2,
        roomZ - ROOM_SIZE / 2 + frameWallDepth / 2,
        0.5,
        WALL_HEIGHT,
        frameWallDepth,
      );
      const bottomFrameWall = createWall(
        roomX + ROOM_SIZE / 2,
        WALL_HEIGHT / 2,
        roomZ + ROOM_SIZE / 2 - frameWallDepth / 2,
        0.5,
        WALL_HEIGHT,
        frameWallDepth,
      );
      scene.add(topFrameWall);
      scene.add(bottomFrameWall);
      walls.push(topFrameWall);
      walls.push(bottomFrameWall);
    }

    // Create corridors for connections
    if (room.connections.north && room.y > 0) {
      const corridorZ = roomZ - ROOM_SIZE / 2 - CORRIDOR_WIDTH / 2;
      const corridorFloor = createFloor(
        roomX,
        0,
        corridorZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorFloor);

      const corridorCeiling = createCeiling(
        roomX,
        WALL_HEIGHT,
        corridorZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorCeiling);

      // Corridor walls
      const leftWall = createWall(
        roomX - CORRIDOR_WIDTH / 2,
        WALL_HEIGHT / 2,
        corridorZ,
        0.5,
        WALL_HEIGHT,
        CORRIDOR_WIDTH,
      );
      const rightWall = createWall(
        roomX + CORRIDOR_WIDTH / 2,
        WALL_HEIGHT / 2,
        corridorZ,
        0.5,
        WALL_HEIGHT,
        CORRIDOR_WIDTH,
      );
      scene.add(leftWall);
      scene.add(rightWall);
      walls.push(leftWall);
      walls.push(rightWall);
    }

    if (room.connections.east && room.x < dungeonSize - 1) {
      const corridorX = roomX + ROOM_SIZE / 2 + CORRIDOR_WIDTH / 2;
      const corridorFloor = createFloor(
        corridorX,
        0,
        roomZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorFloor);

      const corridorCeiling = createCeiling(
        corridorX,
        WALL_HEIGHT,
        roomZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorCeiling);

      // Corridor walls
      const topWall = createWall(
        corridorX,
        WALL_HEIGHT / 2,
        roomZ - CORRIDOR_WIDTH / 2,
        CORRIDOR_WIDTH,
        WALL_HEIGHT,
        0.5,
      );
      const bottomWall = createWall(
        corridorX,
        WALL_HEIGHT / 2,
        roomZ + CORRIDOR_WIDTH / 2,
        CORRIDOR_WIDTH,
        WALL_HEIGHT,
        0.5,
      );
      scene.add(topWall);
      scene.add(bottomWall);
      walls.push(topWall);
      walls.push(bottomWall);
    }

    // Create south corridor
    if (room.connections.south && room.y < dungeonSize - 1) {
      const corridorZ = roomZ + ROOM_SIZE / 2 + CORRIDOR_WIDTH / 2;
      const corridorFloor = createFloor(
        roomX,
        0,
        corridorZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorFloor);

      const corridorCeiling = createCeiling(
        roomX,
        WALL_HEIGHT,
        corridorZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorCeiling);

      // Corridor walls
      const leftWall = createWall(
        roomX - CORRIDOR_WIDTH / 2,
        WALL_HEIGHT / 2,
        corridorZ,
        0.5,
        WALL_HEIGHT,
        CORRIDOR_WIDTH,
      );
      const rightWall = createWall(
        roomX + CORRIDOR_WIDTH / 2,
        WALL_HEIGHT / 2,
        corridorZ,
        0.5,
        WALL_HEIGHT,
        CORRIDOR_WIDTH,
      );
      scene.add(leftWall);
      scene.add(rightWall);
      walls.push(leftWall);
      walls.push(rightWall);
    }

    // Create west corridor
    if (room.connections.west && room.x > 0) {
      const corridorX = roomX - ROOM_SIZE / 2 - CORRIDOR_WIDTH / 2;
      const corridorFloor = createFloor(
        corridorX,
        0,
        roomZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorFloor);

      const corridorCeiling = createCeiling(
        corridorX,
        WALL_HEIGHT,
        roomZ,
        CORRIDOR_WIDTH,
        CORRIDOR_WIDTH,
      );
      scene.add(corridorCeiling);

      // Corridor walls
      const topWall = createWall(
        corridorX,
        WALL_HEIGHT / 2,
        roomZ - CORRIDOR_WIDTH / 2,
        CORRIDOR_WIDTH,
        WALL_HEIGHT,
        0.5,
      );
      const bottomWall = createWall(
        corridorX,
        WALL_HEIGHT / 2,
        roomZ + CORRIDOR_WIDTH / 2,
        CORRIDOR_WIDTH,
        WALL_HEIGHT,
        0.5,
      );
      scene.add(topWall);
      scene.add(bottomWall);
      walls.push(topWall);
      walls.push(bottomWall);
    }

    // Add random objects to the room
    const numObjects = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numObjects; i++) {
      const objType = Math.random();
      const objX = roomX + (Math.random() - 0.5) * (ROOM_SIZE - 2);
      const objZ = roomZ + (Math.random() - 0.5) * (ROOM_SIZE - 2);

      if (objType < 0.4) {
        // Torch
        const torch = createTorch(objX, objZ);
        scene.add(torch);
      } else if (objType < 0.7) {
        // Chest
        const chest = createChest(objX, objZ);
        scene.add(chest);
      } else {
        // Pillar
        const pillar = createPillar(objX, objZ);
        scene.add(pillar);
      }
    }
  }

  // Set player starting position
  const startRoom = rooms[0];
  const startX = startRoom.x * (ROOM_SIZE + CORRIDOR_WIDTH);
  const startZ = startRoom.y * (ROOM_SIZE + CORRIDOR_WIDTH);
  camera.position.set(startX, 1.8, startZ);
}

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x666666, 0.8);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Store walls for collision detection
const walls = [];

document.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      moveForward = true;
      break;
    case "KeyS":
    case "ArrowDown":
      moveBackward = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      moveLeft = true;
      break;
    case "KeyD":
    case "ArrowRight":
      moveRight = true;
      break;
    case "Space":
      if (canJump) velocity.y += 8;
      canJump = false;
      break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      moveForward = false;
      break;
    case "KeyS":
    case "ArrowDown":
      moveBackward = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      moveLeft = false;
      break;
    case "KeyD":
    case "ArrowRight":
      moveRight = false;
      break;
  }
});

let isPointerLocked = false;

document.addEventListener("click", () => {
  if (!isPointerLocked) {
    document.body.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange", () => {
  isPointerLocked = document.pointerLockElement === document.body;
});

document.addEventListener("mousemove", (event) => {
  if (!isPointerLocked) return;

  const sensitivity = 0.002;
  yaw -= event.movementX * sensitivity;
  pitch -= event.movementY * sensitivity;
  pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});

// Collision detection
function checkCollision(newPosition) {
  const playerRadius = 0.5;

  for (const wall of walls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      newPosition,
      new THREE.Vector3(playerRadius * 2, 2, playerRadius * 2),
    );

    if (wallBox.intersectsBox(playerBox)) {
      return true;
    }
  }
  return false;
}

// Build the dungeon
buildDungeon();

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

  const forward = new THREE.Vector3(0, 0, -1);
  const right = new THREE.Vector3(1, 0, 0);
  forward.applyQuaternion(camera.quaternion);
  right.applyQuaternion(camera.quaternion);

  const moveVector = new THREE.Vector3();
  if (moveForward) moveVector.add(forward);
  if (moveBackward) moveVector.sub(forward);
  if (moveLeft) moveVector.sub(right);
  if (moveRight) moveVector.add(right);

  moveVector.multiplyScalar(0.1);

  // Collision check
  const newPosition = camera.position.clone().add(moveVector);
  newPosition.y = 1.8; // Keep at walking height

  if (!checkCollision(newPosition)) {
    camera.position.copy(newPosition);
  }

  // Flame flicker
  scene.traverse((child) => {
    if (child.material === torchMaterial) {
      child.scale.y = 1.5 + Math.sin(time * 10) * 0.1;
      child.scale.x = child.scale.z = 1 + Math.sin(time * 8) * 0.05;
    }
  });

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
