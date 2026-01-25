import * as THREE from "three";

// Day 10: Keyboard - Move an object with arrow keys/WASD.

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
camera.position.set(0, 2, 5);
camera.lookAt(0, 2, 0);

{
  //Road
  const roadGeo = new THREE.PlaneGeometry(10, 100);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeo, roadMat);

  road.rotation.x = -Math.PI / 2; //-90 degrees
  road.position.y = 0; //Ground

  scene.add(road);

  for (let z = -50; z < 50; z += 5) {
    const lineGeo = new THREE.BoxGeometry(0.3, 0.1, 2);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow
    const line = new THREE.Mesh(lineGeo, lineMat);

    line.position.set(0, 0.05, z); //Center of road
    scene.add(line);
  }
}
{
  for (let z = -50; z < 50; z += 15) {
    // Every 15 units
    // Left side building
    const leftHeight = Math.random() * 8 + 5;
    const leftGeo = new THREE.BoxGeometry(8, leftHeight, 10);
    const leftMat = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
    });
    const leftBuilding = new THREE.Mesh(leftGeo, leftMat);

    leftBuilding.position.set(
      -11, //Left side
      leftHeight / 2,
      z //Along the street
    );
    scene.add(leftBuilding);

    const rightHeight = Math.random() * 8 + 5;
    const rightGeo = new THREE.BoxGeometry(8, rightHeight, 10);
    const rightMat = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
    });
    const rightBuilding = new THREE.Mesh(rightGeo, rightMat);

    rightBuilding.position.set(
      11, //Right side
      rightHeight / 2,
      z //Along the street
    );
    scene.add(rightBuilding);
  }
}
{
  const sidewalkgeo = new THREE.PlaneGeometry(3, 100);
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

  // Left sidewalk
  const sidewalkLeft = new THREE.Mesh(sidewalkgeo, sidewalkMat);
  sidewalkLeft.rotation.x = -Math.PI / 2;
  sidewalkLeft.position.set(-6.5, 0.01, 0); // Slightly above road
  scene.add(sidewalkLeft);

  // Right sidewalk
  const sidewalkRight = new THREE.Mesh(sidewalkgeo, sidewalkMat);
  sidewalkRight.rotation.x = -Math.PI / 2;
  sidewalkRight.position.set(6.5, 0.01, 0); // Slightly above road
  scene.add(sidewalkRight);
}
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

//Keyboard movement
const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true; //this way even if caps is on it moves
});
window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
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
  const speed = 0.1;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  //Movement
  if ((keys["w"] || keys["arrowup"]) && camera.position.z > -50) {
    camera.position.z -= speed;
  }
  if ((keys["s"] || keys["arrowdown"]) && camera.position.z < 50) {
    camera.position.z += speed;
  }
  if ((keys["a"] || keys["arrowleft"]) && camera.position.x > -6) {
    camera.position.x -= speed;
  }
  if ((keys["d"] || keys["arrowright"]) && camera.position.x < 6) {
    camera.position.x += speed;
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
