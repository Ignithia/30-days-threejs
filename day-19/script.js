import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Day 19: Animated Model - Load an animated model and trigger animations.
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
camera.position.set(0, 1, 4);

{
  const roadGeo = new THREE.PlaneGeometry(10, 100);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeo, roadMat);

  road.rotation.x = -Math.PI / 2;
  road.position.y = 0;

  scene.add(road);

  for (let z = -50; z < 50; z += 5) {
    const lineGeo = new THREE.BoxGeometry(0.3, 0.1, 2);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const line = new THREE.Mesh(lineGeo, lineMat);

    line.position.set(0, 0.05, z);
    scene.add(line);
  }
}
{
  for (let z = -50; z < 50; z += 15) {
    const leftHeight = Math.random() * 8 + 5;
    const leftGeo = new THREE.BoxGeometry(8, leftHeight, 10);
    const leftMat = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
    });
    const leftBuilding = new THREE.Mesh(leftGeo, leftMat);

    leftBuilding.position.set(-11, leftHeight / 2, z);
    scene.add(leftBuilding);

    const rightHeight = Math.random() * 8 + 5;
    const rightGeo = new THREE.BoxGeometry(8, rightHeight, 10);
    const rightMat = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
    });
    const rightBuilding = new THREE.Mesh(rightGeo, rightMat);

    rightBuilding.position.set(11, rightHeight / 2, z);
    scene.add(rightBuilding);
  }
}
{
  const sidewalkgeo = new THREE.PlaneGeometry(3, 100);
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

  const sidewalkLeft = new THREE.Mesh(sidewalkgeo, sidewalkMat);
  sidewalkLeft.rotation.x = -Math.PI / 2;
  sidewalkLeft.position.set(-6.5, 0.01, 0);
  scene.add(sidewalkLeft);

  const sidewalkRight = new THREE.Mesh(sidewalkgeo, sidewalkMat);
  sidewalkRight.rotation.x = -Math.PI / 2;
  sidewalkRight.position.set(6.5, 0.01, 0);
  scene.add(sidewalkRight);
}
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

// GLTF animation support
const clock = new THREE.Clock();
let mixer = null;
let character = null;
let idleAction = null;
let walkAction = null;
let runAction = null;
let actions = [];

function setWeight(action, weight) {
  if (!action) return;
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./Soldier.glb",
  (gltf) => {
    character = gltf.scene;
    character.position.set(0, 0, 0);
    character.scale.set(1, 1, 1);
    scene.add(character);

    character.traverse((node) => {
      if (node.isMesh) node.castShadow = true;
      if (node.isSkinnedMesh)
        console.log("Found SkinnedMesh:", node.name || node.uuid);
    });

    const clips = gltf.animations || [];
    console.log("GLB loaded:", gltf.scene);
    console.log("GLB animations count:", clips.length);
    clips.forEach((c, i) => console.log(`clip[${i}] name:`, c.name));

    if (clips.length) {
      mixer = new THREE.AnimationMixer(character);

      // find idle/walk/run by name, fallback to indices
      let idleIndex = -1;
      let walkIndex = -1;
      let runIndex = -1;
      for (let i = 0; i < clips.length; i++) {
        const n = (clips[i].name || "").toLowerCase();
        if (idleIndex === -1 && (n.includes("idle") || n.includes("take")))
          idleIndex = i;
        if (walkIndex === -1 && (n.includes("walk") || n.includes("mixamo")))
          walkIndex = i;
        if (runIndex === -1 && n.includes("run")) runIndex = i;
      }
      if (idleIndex === -1) idleIndex = 0;
      if (walkIndex === -1) walkIndex = Math.min(3, clips.length - 1);
      if (runIndex === -1) runIndex = Math.min(1, clips.length - 1);

      console.log(
        "Chosen idle/walk/run indices:",
        idleIndex,
        walkIndex,
        runIndex,
        "names:",
        clips[idleIndex]?.name,
        clips[walkIndex]?.name,
        clips[runIndex]?.name
      );

      // create actions and play them; control weights each frame
      idleAction = mixer.clipAction(clips[idleIndex]);
      walkAction = mixer.clipAction(clips[walkIndex]);
      if (clips[runIndex]) runAction = mixer.clipAction(clips[runIndex]);

      [idleAction, walkAction, runAction].forEach((a) => {
        if (!a) return;
        a.loop = THREE.LoopRepeat;
        a.play();
        actions.push(a);
      });

      // start with idle weight 1
      setWeight(idleAction, 1);
      setWeight(walkAction, 0);
      if (runAction) setWeight(runAction, 0);
    }
  },
  (xhr /*XMLHttpRequest*/) => {
    if (xhr.total)
      console.log(`GLB ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
  },
  (err) => {
    console.error("GLB load error:", err);
  }
);

const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
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
  const delta = clock.getDelta();
  const speed = 0.12;
  const rotSpeed = 0.06;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (character) {
    let moving = false;
    if (keys["w"] || keys["arrowup"]) {
      character.translateZ(-speed);
      moving = true;
    }
    if (keys["s"] || keys["arrowdown"]) {
      character.translateZ(speed);
      moving = true;
    }
    if (keys["a"] || keys["arrowleft"]) {
      character.rotation.y += rotSpeed;
    }
    if (keys["d"] || keys["arrowright"]) {
      character.rotation.y -= rotSpeed;
    }

    character.position.x = Math.max(-6, Math.min(6, character.position.x));
    character.position.z = Math.max(-50, Math.min(50, character.position.z));
    character.position.y = Math.max(0, character.position.y);

    if (mixer) mixer.update(delta);
    if (idleAction && walkAction) {
      if (moving) {
        setWeight(idleAction, 0);
        setWeight(walkAction, 1);
      } else {
        setWeight(idleAction, 1);
        setWeight(walkAction, 0);
      }
      if (runAction) setWeight(runAction, 0);
    } else if (actions && actions.length) {
      // fallback: ensure actions are progressing
      for (let i = 0; i < actions.length; i++) {
        actions[i].setEffectiveTimeScale(1);
      }
    }

    // Third-person chase camera
    const chaseOffset = new THREE.Vector3(0, 2.5, 5);
    const offset = chaseOffset.clone().applyQuaternion(character.quaternion);
    camera.position.copy(character.position).add(offset);
    camera.lookAt(
      character.position.x,
      character.position.y + 1.5,
      character.position.z
    );
  } else {
    // fallback: move the camera if character not yet loaded
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
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
