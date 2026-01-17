import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 04: Orbit Controls - Add camera controls using OrbitControls.

const scene = new THREE.Scene();
scene.background = new THREE.Color("Blue");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const fov = 45;
const aspect = 2;
const near = 0.1;
const far = 150;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 30);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0); //Focus point of orbit control
controls.autoRotate = true; //Makes it rotate automatically
controls.autoRotateSpeed = 1; //Changes the speed for the autorotate
controls.enableDamping = true; //Gives the controls a sense of weight. Meaning if u move the camera and u let go it will keep going until it's back at its normal movement.
controls.update(); //must be called after any manual change to the camera's transform

{
  //Defined early so we can use it with the texture
  const planeSize = 40;

  //Loads a texture so we can use it on the plane
  const loader = new THREE.TextureLoader();
  const texture = loader.load("./checker.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  //Plane
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);
}
{
  //Cube
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: "#8AC",
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  //Sphere
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthDivisions,
    sphereHeightDivisions
  );
  const sphereMat = new THREE.MeshPhongMaterial({
    color: "#4cda5f",
  });
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
{
  //Directional light
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}

function animate() {
  controls.update(); //I think this causes it to be allowed to move.
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
