import * as THREE from "three";

// Day 02: Colors & Materials - Try MeshPhongMaterial, MeshStandardMaterial, and basic colors.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Cube with meshphongmaterial (shininess and specular instead of roughness and metalness)
const geometry1 = new THREE.BoxGeometry();
const material1 = new THREE.MeshPhongMaterial({
  color: 0x156289, //Dark Blue
  flatShading: true,
  shininess: 100,
});
const cube1 = new THREE.Mesh(geometry1, material1);
cube1.position.x = -2;
scene.add(cube1);

//Cube with meshstandardmaterial (uses roughness and metalness instead of shininess)
const geometry2 = new THREE.BoxGeometry();
const material2 = new THREE.MeshStandardMaterial({
  color: 0x8ac, //Light Blue
  roughness: 1,
  metalness: 0,
});
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

//Cube with basic color (Fastest to render, no light interaction)
const geometry3 = new THREE.BoxGeometry();
const material3 = new THREE.MeshBasicMaterial({
  color: 0xff5733, //Orange Red
});
const cube3 = new THREE.Mesh(geometry3, material3);
cube3.position.x = 2;
scene.add(cube3);

//Light otherwise u can't see cube 1 and 2
const light = new THREE.AmbientLight(0xfff, 1);
scene.add(light);

camera.position.z = 5;

function animate() {
  cube1.rotation.x += 0.01;
  cube1.rotation.y += 0.01;

  cube2.rotation.x += 0.01;
  cube2.rotation.y += 0.01;

  cube3.rotation.x += 0.01;
  cube3.rotation.y += 0.01;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
