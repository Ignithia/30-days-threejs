import * as THREE from "three";

// Day 24: Basic Shaders - Write a simple GLSL shader for color changes.

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, 3);

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Create wave patterns
    float wave1 = sin(uv.x * 10.0 + uTime * 2.0) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 8.0 + uTime * 1.5) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 6.0 + uTime * 3.0) * 0.5 + 0.5;
    
    // Create color channels
    float red = wave1 * sin(uTime * 0.8) * 0.5 + 0.5;
    float green = wave2 * cos(uTime * 0.6) * 0.5 + 0.5;
    float blue = wave3 * sin(uTime * 1.2) * 0.5 + 0.5;
    
    // Add some radial gradient effect
    float distance = length(uv - 0.5);
    float radial = 1.0 - distance * 2.0;
    radial = max(0.0, radial);
    
    // Combine colors
    vec3 color = vec3(red, green, blue) * radial + vec3(0.1, 0.1, 0.2);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Create shader material
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: { value: 0.0 },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  },
});

// Create geometry and mesh
const geometry = new THREE.PlaneGeometry(4, 4, 32, 32);
const mesh = new THREE.Mesh(geometry, shaderMaterial);
scene.add(mesh);

// Create a second mesh with different shader for comparison
const fragmentShader2 = `
  uniform float uTime;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Create spiral pattern
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = uv - center;
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    
    // Animated spiral
    float spiral = sin(radius * 20.0 - uTime * 4.0 + angle * 3.0);
    
    // Color cycling
    vec3 color1 = vec3(1.0, 0.3, 0.7);
    vec3 color2 = vec3(0.2, 0.8, 1.0);
    vec3 color3 = vec3(0.9, 1.0, 0.1);
    
    float colorMix = sin(uTime * 2.0) * 0.5 + 0.5;
    vec3 mixedColor = mix(color1, mix(color2, color3, colorMix), spiral * 0.5 + 0.5);
    
    gl_FragColor = vec4(mixedColor, 1.0);
  }
`;

const shaderMaterial2 = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader2,
  uniforms: {
    uTime: { value: 0.0 },
  },
});

const geometry2 = new THREE.PlaneGeometry(2, 2);
const mesh2 = new THREE.Mesh(geometry2, shaderMaterial2);
mesh2.position.set(3, 0, 0);
scene.add(mesh2);

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    // Update shader resolution uniform
    shaderMaterial.uniforms.uResolution.value.set(width, height);
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

  // Update shader uniforms
  shaderMaterial.uniforms.uTime.value = time;
  shaderMaterial2.uniforms.uTime.value = time;

  // Rotate the second mesh for added movement
  mesh2.rotation.z = time * 0.5;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
