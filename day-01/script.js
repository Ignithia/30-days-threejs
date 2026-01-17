import * as THREE from "three";

// Day 01: Hello Cube
// Create a spinning cube with MeshBasicMaterial
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, //FOV
  window.innerWidth / window.innerHeight, //Aspect Ratio
  0.1, //Near
  1000 //Far
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); //Makes the canvas take up the whole screen
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x000080 }); //#000080 Navy Blue (0x is #)
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 7; //Makes sure the camera is not on origin where the cube is

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
