import * as THREE from "three";

// Day 20: Custom Geometry - Create a shape from scratch using BufferGeometry.
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x03030a);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 5);

{
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
}

// Add a directional key light and a colored rim light
{
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 10, 7);
  scene.add(key);

  const rim = new THREE.PointLight(0x66ccff, 0.4, 30);
  rim.position.set(-6, 4, -6);
  scene.add(rim);
}

// Helper: convert HSL to RGB (returns array [r,g,b])
function hslToRgb(hue, saturation, lightness) {
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n) => {
    const k = (n + hue / 30) % 12;
    const value = lightness - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return value;
  };
  return [channel(0), channel(8), channel(4)];
}

// Create multiple twisting bands and a particle trail for visual interest
scene.background = new THREE.Color(0x03030a);

function createBand({
  segments = 360,
  radius = 2.2,
  width = 0.38,
  turns = 4,
  hueOffset = 0,
  twist = 2,
} = {}) {
  const vertexCount = segments * 2;
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array((segments - 1) * 6);
  const basePositions = new Float32Array(vertexCount * 3);
  const centerline = new Float32Array(segments * 3);

  for (let segmentIndex = 0; segmentIndex < segments; segmentIndex++) {
    const segmentRatio = segmentIndex / (segments - 1);
    const centerAngle = segmentRatio * Math.PI * 2 * turns;

    const centerX = Math.cos(centerAngle) * radius;
    const centerZ = Math.sin(centerAngle) * radius;
    const centerY = (segmentRatio - 0.5) * 8;

    // tangent approximation in XZ to compute a perpendicular
    const nextAngle =
      ((segmentIndex + 1) / (segments - 1)) * Math.PI * 2 * turns;
    const nextX = Math.cos(nextAngle) * radius;
    const nextZ = Math.sin(nextAngle) * radius;
    const tangentX = nextX - centerX;
    const tangentZ = nextZ - centerZ;
    let perpX = -tangentZ;
    let perpZ = tangentX;
    const perpLength = Math.hypot(perpX, perpZ) || 1;
    perpX /= perpLength;
    perpZ /= perpLength;

    // rotate the cross-section to introduce a twist
    const twistAngle = segmentRatio * twist * Math.PI * 2;
    const cosTwist = Math.cos(twistAngle);
    const sinTwist = Math.sin(twistAngle);
    const rotatedPerpX = perpX * cosTwist - perpZ * sinTwist;
    const rotatedPerpZ = perpX * sinTwist + perpZ * cosTwist;

    const leftX = centerX + rotatedPerpX * width;
    const leftY = centerY;
    const leftZ = centerZ + rotatedPerpZ * width;

    const rightX = centerX - rotatedPerpX * width;
    const rightY = centerY;
    const rightZ = centerZ - rotatedPerpZ * width;

    const vertexIndexBase = segmentIndex * 2;
    positions[vertexIndexBase * 3 + 0] = leftX;
    positions[vertexIndexBase * 3 + 1] = leftY;
    positions[vertexIndexBase * 3 + 2] = leftZ;

    positions[(vertexIndexBase + 1) * 3 + 0] = rightX;
    positions[(vertexIndexBase + 1) * 3 + 1] = rightY;
    positions[(vertexIndexBase + 1) * 3 + 2] = rightZ;

    basePositions[vertexIndexBase * 3 + 0] = leftX;
    basePositions[vertexIndexBase * 3 + 1] = leftY;
    basePositions[vertexIndexBase * 3 + 2] = leftZ;
    basePositions[(vertexIndexBase + 1) * 3 + 0] = rightX;
    basePositions[(vertexIndexBase + 1) * 3 + 1] = rightY;
    basePositions[(vertexIndexBase + 1) * 3 + 2] = rightZ;

    centerline[segmentIndex * 3 + 0] = centerX;
    centerline[segmentIndex * 3 + 1] = centerY;
    centerline[segmentIndex * 3 + 2] = centerZ;

    // color using hue offset per band
    const hue = (segmentRatio * 360 + hueOffset) % 360;
    const [r, g, b] = hslToRgb((hue / 360) * 30, 0.95, 0.5);
    colors[vertexIndexBase * 3 + 0] = r;
    colors[vertexIndexBase * 3 + 1] = g;
    colors[vertexIndexBase * 3 + 2] = b;
    colors[(vertexIndexBase + 1) * 3 + 0] = r * 0.85;
    colors[(vertexIndexBase + 1) * 3 + 1] = g * 0.85;
    colors[(vertexIndexBase + 1) * 3 + 2] = b * 0.85;
  }

  let indexPointer = 0;
  for (let segmentIndex = 0; segmentIndex < segments - 1; segmentIndex++) {
    const i0 = segmentIndex * 2;
    const i1 = i0 + 1;
    const i2 = i0 + 2;
    const i3 = i0 + 3;
    indices[indexPointer++] = i0;
    indices[indexPointer++] = i2;
    indices[indexPointer++] = i1;
    indices[indexPointer++] = i1;
    indices[indexPointer++] = i2;
    indices[indexPointer++] = i3;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.computeVertexNormals();

  const baseMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.15,
    roughness: 0.35,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    toneMapped: true,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0.35,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, baseMat);
  const glow = new THREE.Mesh(geo, glowMat);
  scene.add(mesh);
  scene.add(glow);

  return {
    mesh,
    glow,
    geo,
    base: basePositions,
    center: centerline,
    segments,
    width,
  };
}

// create 3 layered bands with different parameters for richness
const bands = [];
bands.push(
  createBand({
    segments: 420,
    radius: 2.0,
    width: 0.44,
    turns: 4,
    hueOffset: 0,
    twist: 2,
  })
);
bands.push(
  createBand({
    segments: 420,
    radius: 2.3,
    width: 0.32,
    turns: 5,
    hueOffset: 80,
    twist: 1.5,
  })
);
bands.push(
  createBand({
    segments: 420,
    radius: 1.8,
    width: 0.26,
    turns: 6,
    hueOffset: 200,
    twist: 3,
  })
);

// particle trail removed (simpler, cleaner visuals)

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

  // animate bands with layered waves and twisting
  for (let bi = 0; bi < bands.length; bi++) {
    const band = bands[bi];
    const { geo, base, segments } = band;
    const posAttr = geo.getAttribute("position");
    const positions = posAttr.array;
    const speed = 1.1 + bi * 0.25;
    const amplitude = 0.6 - bi * 0.12;
    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const phase = t * Math.PI * 8 + time * speed + bi * 0.9;
      const sway = Math.sin(phase) * amplitude;

      const vi = i * 2;
      // left vertex
      positions[vi * 3 + 0] =
        base[vi * 3 + 0] + Math.sin(phase * 0.9) * amplitude * 0.8;
      positions[vi * 3 + 1] = base[vi * 3 + 1] + Math.cos(phase * 0.6) * 0.22;
      positions[vi * 3 + 2] = base[vi * 3 + 2] + Math.sin(phase * 0.5) * 0.28;

      // right vertex (offset phase to create breathing)
      positions[(vi + 1) * 3 + 0] =
        base[(vi + 1) * 3 + 0] - Math.sin(phase * 0.95) * amplitude * 0.8;
      positions[(vi + 1) * 3 + 1] =
        base[(vi + 1) * 3 + 1] + Math.cos(phase * 0.6 + 1.1) * 0.18;
      positions[(vi + 1) * 3 + 2] =
        base[(vi + 1) * 3 + 2] + Math.cos(phase * 0.45 + 0.6) * 0.26;
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  }

  // cinematic camera orbit with slight vertical bob
  const r = 8;
  camera.position.x = Math.cos(time * 0.18) * r;
  camera.position.z = Math.sin(time * 0.18) * r;
  camera.position.y = 1.5 + Math.sin(time * 0.6) * 1.0;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
