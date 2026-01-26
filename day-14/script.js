import * as THREE from "three";

// Day 14: Mini Game - A ball that you have to keep in the air
const scene = new THREE.Scene();
scene.background = new THREE.Color("#1e3a8a");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x1e3a8a);
document.body.appendChild(renderer.domElement);

renderer.domElement.style.touchAction = "none";
renderer.domElement.style.outline = "none";

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 6, 25);
camera.lookAt(0, 6, 0);

let sphere;
{
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x52d165,
  });
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(0, 12, 0);
  scene.add(sphere);
}
{
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);
}
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) renderer.setSize(width, height, false);
  return needResize;
}

// Game state
let velocityY = 0;
let velocityX = 0;
let gravity = -0.0035;
let difficultyTimer = 0;
let difficultyLevel = 1;
let gameOver = false;
let startTime = performance.now();
let kicksCount = 0;

//FPS
let lastFrameTime = 0;
const FRAME_DURATION = 1000 / 60; //60 FPS

function resetGame() {
  sphere.position.set(0, 12, 0);
  velocityY = 0;
  velocityX = 0;
  gravity = -0.0035;
  difficultyTimer = 0;
  difficultyLevel = 1;
  gameOver = false;
  startTime = performance.now();
  kicksCount = 0;
  const overDiv = document.getElementById("gameover-div");
  if (overDiv) overDiv.remove();
  lastFrameTime = performance.now();
  requestAnimationFrame(animate);
}

function showGameOver() {
  const existing = document.getElementById("gameover-div");
  if (existing) return;
  const div = document.createElement("div");
  div.id = "gameover-div";
  div.className = "gameover-div";
  div.textContent = "Game Over!";

  const scoreSec = Math.max(
    0,
    Math.floor((performance.now() - startTime) / 1000)
  );
  const scoreP = document.createElement("p");
  scoreP.style.marginTop = "0.5rem";
  scoreP.style.fontSize = "1.25rem";
  scoreP.textContent = `Score: ${scoreSec}s — Kicks: ${kicksCount}`;
  div.appendChild(scoreP);

  const btn = document.createElement("button");
  btn.textContent = "Restart";
  btn.className = "restart-btn";
  btn.onclick = resetGame;
  div.appendChild(document.createElement("br"));
  div.appendChild(btn);

  document.body.appendChild(div);
}

// Input: pointer decides left/middle/right kick
function handleKick(event) {
  if (gameOver) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const clientX =
    event.clientX !== undefined
      ? event.clientX
      : (event.touches && event.touches[0] && event.touches[0].clientX) ||
        rect.left;
  const pointerNDCx = ((clientX - rect.left) / rect.width) * 2 - 1;

  // Project ball's position to screen
  const ballScreen = sphere.position.clone().project(camera);

  // Estimate ball radius in NDC by projecting a point offset in X
  const rightPoint = new THREE.Vector3(
    sphere.position.x + 1,
    sphere.position.y,
    sphere.position.z
  ).project(camera);
  const ballRadiusNDC = Math.abs(rightPoint.x - ballScreen.x);

  let kickX = 0;
  if (pointerNDCx < ballScreen.x - ballRadiusNDC / 3) {
    kickX = -0.18 - 0.03 * difficultyLevel;
  } else if (pointerNDCx > ballScreen.x + ballRadiusNDC / 3) {
    kickX = 0.18 + 0.03 * difficultyLevel;
  } else {
    kickX = 0;
  }

  // allow kicks when the ball is reasonably low so input reliably works
  if (sphere.position.y <= 14) {
    velocityY = 0.22 + 0.02 * difficultyLevel;
    velocityX = kickX;
    kicksCount++;
  }
}

renderer.domElement.addEventListener("pointerdown", handleKick);
window.addEventListener("pointerdown", handleKick);
renderer.domElement.addEventListener("touchstart", handleKick, {
  passive: true,
});
window.addEventListener("touchstart", handleKick, { passive: true });

function handleKey(e) {
  if (gameOver) return;
  const code = e.code || e.key || e.keyCode;
  const isSpace =
    code === "Space" || code === "Spacebar" || code === " " || code === 32;
  if (isSpace && sphere.position.y <= 14) {
    velocityY = 0.22 + 0.02 * difficultyLevel;
  }
}
window.addEventListener("keydown", handleKey);
document.addEventListener("keydown", handleKey);

// Main loop (60 FPS locked)
function animate(now) {
  if (gameOver) return;

  if (now - lastFrameTime < FRAME_DURATION) {
    requestAnimationFrame(animate);
    return;
  }
  lastFrameTime = now;

  // Difficulty increases every 10 seconds
  difficultyTimer += 1 / 60;
  if (difficultyTimer > 10) {
    difficultyTimer = 0;
    difficultyLevel++;
    gravity -= 0.0012; // slight increase
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  velocityY += gravity;
  sphere.position.y += velocityY;
  sphere.position.x += velocityX;

  // Friction on X to slowly reduce horizontal speed
  velocityX *= 0.995;

  // Wall bounce
  if (sphere.position.x <= -9) {
    sphere.position.x = -9;
    velocityX = Math.abs(velocityX) * 0.9;
  } else if (sphere.position.x >= 9) {
    sphere.position.x = 9;
    velocityX = -Math.abs(velocityX) * 0.9;
  }

  // End game if ball hits the floor
  if (sphere.position.y <= 0 + 0.01) {
    sphere.position.y = 0;
    velocityY = 0;
    gameOver = true;
    showGameOver();
    return;
  }

  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

lastFrameTime = performance.now();
requestAnimationFrame(animate);
