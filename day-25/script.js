import * as THREE from "three";

// Day 25: Shader Effects - Create gradient and wave effects on a mesh

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Vertex shader - creates wave deformation on the mesh
const vertexShader = `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vWave;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Create multiple wave patterns
    float wave1 = sin(position.x * uFrequency + uTime * 2.0) * uAmplitude;
    float wave2 = cos(position.y * uFrequency * 1.2 + uTime * 1.5) * uAmplitude * 0.8;
    float wave3 = sin(length(position.xy) * uFrequency * 0.8 + uTime * 3.0) * uAmplitude * 0.6;
    
    // Combine waves
    float totalWave = wave1 + wave2 + wave3;
    vWave = totalWave;
    
    // Displace vertices along their normal
    vec3 newPosition = position + normal * totalWave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment shader - creates cyberpunk gradient with energy effects
const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorPrimary;   // #00ffcc
  uniform vec3 uColorSecondary; // #7df9ff  
  uniform vec3 uColorAccent;    // #02b894
  uniform float uGlowIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vWave;
  
  void main() {
    // Create animated gradient based on UV coordinates and time
    vec2 animatedUv = vUv;
    animatedUv.x += sin(uTime * 0.5 + vUv.y * 8.0) * 0.1;
    animatedUv.y += cos(uTime * 0.3 + vUv.x * 6.0) * 0.1;
    
    // Create flowing gradient
    float gradient1 = sin(animatedUv.x * 4.0 + uTime) * 0.5 + 0.5;
    float gradient2 = cos(animatedUv.y * 3.0 + uTime * 1.5) * 0.5 + 0.5;
    float circularGradient = length(animatedUv - 0.5) * 2.0;
    
    // Create energy pulses based on wave displacement
    float waveIntensity = (vWave + 0.5) * 2.0;
    float pulse = sin(uTime * 4.0 + circularGradient * 10.0) * 0.5 + 0.5;
    
    // Mix colors based on different factors
    vec3 color = mix(uColorAccent, uColorPrimary, gradient1);
    color = mix(color, uColorSecondary, gradient2 * pulse);
    
    // Add energy lines
    float energyLines = sin(vUv.x * 20.0 + uTime * 2.0) * sin(vUv.y * 15.0 + uTime * 1.5);
    energyLines = smoothstep(0.8, 1.0, energyLines);
    color += uColorPrimary * energyLines * 0.5;
    
    // Add glow based on wave displacement
    float glow = abs(vWave) * uGlowIntensity;
    color += color * glow;
    
    // Add rim lighting effect
    float rimLight = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    color += uColorSecondary * rimLight * 0.3;
    
    // Pulse the overall brightness
    float globalPulse = sin(uTime * 1.5) * 0.2 + 0.8;
    
    gl_FragColor = vec4(color * globalPulse, 1.0);
  }
`;

// Create the shader material with a few colors
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uFrequency: { value: 2.0 },
    uAmplitude: { value: 0.15 },
    uColorPrimary: { value: new THREE.Color(0x00ffcc) },
    uColorSecondary: { value: new THREE.Color(0x7df9ff) },
    uColorAccent: { value: new THREE.Color(0x02b894) },
    uGlowIntensity: { value: 1.5 },
  },
  side: THREE.DoubleSide,
});

// Create a torus knot mesh (just because I haven't used that object yet)
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32, 2, 3);
const mesh = new THREE.Mesh(geometry, shaderMaterial);
scene.add(mesh);

// Add some basic lighting to enhance the mesh
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffcc, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

camera.position.z = 5;

// Mouse interaction for rotation
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Update shader time uniform
  shaderMaterial.uniforms.uTime.value = elapsedTime;

  // Rotate the mesh
  mesh.rotation.x = elapsedTime * 0.3 + mouseY * 0.5;
  mesh.rotation.y = elapsedTime * 0.5 + mouseX * 0.5;

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
