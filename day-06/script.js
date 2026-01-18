import * as THREE from "three";

// Day 06: Resize Handling - Make your scene responsive to browser resize.

const scene = new THREE.Scene();
scene.background = new THREE.Color("blue");

const canvas = document.querySelector("#canvas");

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);
camera.position.z = 5;

{
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-1, 2, 4);
  scene.add(light);
}
{
  const dimension = 1;
  const geometry = new THREE.BoxGeometry(dimension);
  const material = new THREE.MeshPhongMaterial({ color: 0x4488aa });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = -2;
}
{
  const dimension = 1;
  const geometry = new THREE.BoxGeometry(dimension);
  const material = new THREE.MeshPhongMaterial({ color: 0x123456 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = 0;
}
{
  const dimension = 1;
  const geometry = new THREE.BoxGeometry(dimension);
  const material = new THREE.MeshPhongMaterial({ color: 0xaa8844 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = 2;
}

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

function render(time) {
  time *= 0.001;
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
