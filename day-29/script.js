import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Day 29: Full Small Project - Build a small interactive scene (e.g., solar system).

class RetroShaderMonitor {
  constructor() {
    this.currentChannel = 0;
    this.channels = [];
    this.time = 0;
    this.mouse = new THREE.Vector2();

    this.initRenderer();
    this.initCamera();
    this.initControls();
    this.initPostProcessing();
    this.createCRTMonitor();
    this.createShaderChannels();
    this.initEventListeners();

    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    document.body.appendChild(this.renderer.domElement);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 0, 5);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 5;
    this.controls.minDistance = 1;
  }

  initPostProcessing() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("skyblue");

    const envTexture = new THREE.CubeTextureLoader().load([
      "data:image/svg+xml;base64," +
        btoa(
          '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#87CEEB" width="512" height="512"/></svg>',
        ),
      "data:image/svg+xml;base64," +
        btoa(
          '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#87CEEB" width="512" height="512"/></svg>',
        ),
      "data:image/svg+xml;base64," +
        btoa(
          '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#B0E0E6" width="512" height="512"/></svg>',
        ),
      "data:image/svg+xml;base64," +
        btoa(
          '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#6495ED" width="512" height="512"/></svg>',
        ),
      "data:image/svg+xml;base64," +
        btoa(
          '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#87CEEB" width="512" height="512"/></svg>',
        ),
      "data:image/svg+xml;base64," +
        btoa(
          '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#87CEEB" width="512" height="512"/></svg>',
        ),
    ]);
    this.envMap = envTexture;
  }

  createCRTGeometry() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    const width = 3.8;
    const height = 3.0;
    const depth = 1.8;
    const curve = 0.25;
    const taper = 0.88;
    const bezelWidth = 0.45;
    const segments = 72;

    for (let layer = 0; layer <= 1; layer++) {
      const z = layer === 0 ? depth / 2 : -depth / 2;
      const scale = layer === 0 ? 1.0 : taper;

      for (let ring = 0; ring <= 1; ring++) {
        const outerW = (width / 2) * scale;
        const outerH = (height / 2) * scale;
        const innerW = outerW - bezelWidth * scale;
        const innerH = outerH - bezelWidth * scale;

        const w = ring === 0 ? outerW : innerW;
        const h = ring === 0 ? outerH : innerH;

        for (let seg = 0; seg <= segments; seg++) {
          let x, y;
          const t = (seg / segments) * 4; // traverse parameter

          if (t < 1) {
            x = (t - 0.5) * 2 * w;
            y = -h;
          } else if (t < 2) {
            x = w;
            y = (t - 1 - 0.5) * 2 * h;
          } else if (t < 3) {
            x = (3 - t - 0.5) * 2 * w;
            y = h;
          } else {
            x = -w;
            y = (4 - t - 0.5) * 2 * h;
          }

          let zOffset = 0;
          if (layer === 0) {
            const distSq = (x / outerW) ** 2 + (y / outerH) ** 2; //Distance squared
            zOffset = curve * Math.exp(-distSq * 1.5);
          }

          vertices.push(x, y, z + zOffset);
        }
      }
    }

    const vertsPerRing = segments + 1;
    const ringsPerLayer = 2;

    for (let seg = 0; seg < segments; seg++) {
      const a = seg;
      const b = seg + 1;
      const c = vertsPerRing + seg;
      const d = vertsPerRing + seg + 1;
      indices.push(a, b, d, a, d, c);
    }

    const backStart = ringsPerLayer * vertsPerRing;
    for (let seg = 0; seg < segments; seg++) {
      const a = backStart + seg;
      const b = backStart + seg + 1;
      const c = backStart + vertsPerRing + seg;
      const d = backStart + vertsPerRing + seg + 1;
      indices.push(a, d, b, a, c, d); // a,b,c,d are the vertex indeices to form a quad
    }

    for (let ring = 0; ring < ringsPerLayer; ring++) {
      for (let seg = 0; seg < segments; seg++) {
        const frontBase = ring * vertsPerRing;
        const backBase = backStart + ring * vertsPerRing;

        const a = frontBase + seg;
        const b = frontBase + seg + 1;
        const c = backBase + seg;
        const d = backBase + seg + 1;

        indices.push(a, b, d, a, d, c);
      }
    }

    const backOuterRing = backStart;
    for (let seg = 0; seg < segments; seg++) {
      const a = backOuterRing + seg;
      const b = backOuterRing + seg + 1;
      const c = backOuterRing + vertsPerRing + seg;
      const d = backOuterRing + vertsPerRing + seg + 1;

      indices.push(a, c, d, a, d, b);
    }

    const centerIdx = vertices.length / 3;
    vertices.push(0, 0, -depth / 2);

    const backInnerRing = backStart + vertsPerRing;
    for (let seg = 0; seg < segments; seg++) {
      const a = backInnerRing + seg;
      const b = backInnerRing + seg + 1;
      indices.push(centerIdx, a, b);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  createRoughnessTexture() {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const idx = (i * size + j) * 4;
        const noise = Math.random() * 30 + 160;
        data[idx] = noise;
        data[idx + 1] = noise;
        data[idx + 2] = noise;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  createCRTMonitor() {
    const monitorGeometry = this.createCRTGeometry();
    const monitorMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide,
      roughnessMap: this.createRoughnessTexture(),
    });
    this.monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    this.scene.add(this.monitor);

    const screenGeometry = new THREE.PlaneGeometry(2.95, 2.15);
    this.screenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uMouse: { value: new THREE.Vector2() },
        uChannel: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: this.getChannelShader(),
    });

    this.screen = new THREE.Mesh(screenGeometry, this.screenMaterial);
    this.screen.position.set(0, 0, 0.95);
    this.scene.add(this.screen);

    const glassGeometry = new THREE.PlaneGeometry(2.95, 2.15);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.05,
      transmission: 0.98,
      thickness: 0.1,
      envMap: this.envMap,
      envMapIntensity: 0.25,
      transparent: true,
      opacity: 0.15,
    });
    this.glass = new THREE.Mesh(glassGeometry, glassMaterial);
    this.glass.position.set(0, 0, 0.96);
    this.scene.add(this.glass);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(3, 3, 5);
    this.scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-2, 2, 3);
    this.scene.add(directionalLight);
  }

  getChannelShader() {
    return `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uChannel;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      vec3 vhsStatic(vec2 uv) {
        float staticNoise = random(uv + uTime * 0.01);
        staticNoise = step(0.95, staticNoise);
        return vec3(staticNoise);
      }
      
      // Channel 1: Retro plasma
      vec3 plasma(vec2 uv) {
        float x = uv.x;
        float y = uv.y;
        float v = sin((x * 10.0 + uTime)) + sin((y * 10.0 + uTime * 2.0)) + 
                  sin(((x + y) * 10.0 + uTime)) + sin((sqrt(x * x + y * y) * 10.0 + uTime));
        
        vec3 col = vec3(
          sin(v * 3.14159),
          sin(v * 3.14159 + 2.094),
          sin(v * 3.14159 + 4.188)
        ) * 0.5 + 0.5;
        
        return col;
      }
      
      // Channel 2: Digital rain
      vec3 digitalRain(vec2 uv) {
        vec2 st = uv * 20.0;
        vec2 ipos = floor(st);
        vec2 fpos = fract(st);
        
        float rand = random(ipos + floor(uTime * 2.0));
        float brightness = step(0.7, rand);
        
        vec3 green = vec3(0.0, brightness, 0.0);
        return green * (1.0 - length(fpos - 0.5));
      }
      
      // Channel 3: Synthwave grid
      vec3 synthwaveGrid(vec2 uv) {
        vec2 grid = abs(fract(uv * 10.0) - 0.5);
        float line = min(grid.x, grid.y);
        float glow = 1.0 - smoothstep(0.0, 0.1, line);
        
        vec3 purple = vec3(1.0, 0.2, 1.0);
        vec3 cyan = vec3(0.0, 1.0, 1.0);
        
        float wave = sin(uv.y * 10.0 + uTime * 2.0) * 0.5 + 0.5;
        vec3 color = mix(purple, cyan, wave);
        
        return color * glow;
      }
      
      // Channel 4: TV static
      vec3 tvStatic(vec2 uv) {
        float noise1 = random(uv + uTime * 10.0);
        float noise2 = random(uv * 2.0 + uTime * 5.0);
        float combined = noise1 * noise2;
        
        return vec3(combined);
      }
      
      void main() {
        vec2 uv = vUv;
        
        vec2 centeredUV = uv * 2.0 - 1.0;
        float dist = length(centeredUV);
        centeredUV *= 1.0 + 0.08 * dist * dist;
        uv = (centeredUV / 2.0) + 0.5;
        
        vec3 color = vec3(0.0);
        
        if (uChannel < 1.0) {
          color = plasma(uv);
        } else if (uChannel < 2.0) {
          color = digitalRain(uv);
        } else if (uChannel < 3.0) {
          color = synthwaveGrid(uv);
        } else {
          color = tvStatic(uv);
        }
        
        vec2 offset = vec2(0.002, 0.0);
        float r = (color.r + (uChannel < 1.0 ? plasma(uv - offset).r : color.r) * 0.5) * 0.7;
        float g = color.g;
        float b = (color.b + (uChannel < 1.0 ? plasma(uv + offset).b : color.b) * 0.5) * 0.7;
        color = vec3(r, g, b);
        
        float mask = 1.0;
        float py = mod(gl_FragCoord.y, 3.0);
        if (py < 1.0) mask = 0.85;
        else if (py < 2.0) mask = 0.9;
        else mask = 0.95;
        color *= mask;
        
        float scanline = sin(uv.y * 600.0 + uTime * 0.5) * 0.5 + 0.5;
        scanline = scanline * 0.15 + 0.85;
        color *= scanline;
        
        color += vhsStatic(uv) * 0.08;
        
        float brightness = dot(color, vec3(0.299, 0.587, 0.114));
        vec3 bloom = color * smoothstep(0.6, 1.0, brightness) * 0.4;
        color += bloom;
        
        float vignette = 1.0 - smoothstep(0.7, 1.4, length(centeredUV));
        vignette = pow(vignette, 0.5);
        color *= vignette;
        
        color *= 1.1;
        color = pow(color, vec3(1.0/2.2));
        
        float edgeFade = 1.0;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          edgeFade = 0.0;
        } else {
          float edgeDistX = min(uv.x, 1.0 - uv.x);
          float edgeDistY = min(uv.y, 1.0 - uv.y);
          float edgeDist = min(edgeDistX, edgeDistY);
          edgeFade = smoothstep(0.0, 0.05, edgeDist);
        }
        color *= edgeFade;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  createShaderChannels() {
    this.channels = [
      { name: "Retro Plasma", description: "Psychedelic plasma waves" },
      { name: "Digital Rain", description: "Matrix-style code rain" },
      { name: "Synthwave Grid", description: "80s neon grid" },
      { name: "TV Static", description: "Classic television noise" },
    ];
  }

  initEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    this.renderer.domElement.addEventListener("click", (e) => this.onClick(e));
    this.renderer.domElement.addEventListener("mousemove", (e) =>
      this.onMouseMove(e),
    );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.screenMaterial.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );
  }

  onKeyDown(event) {
    if (event.code === "Space" || event.code === "ArrowRight") {
      event.preventDefault();
      this.changeChannel(1);
    } else if (event.code === "ArrowLeft") {
      event.preventDefault();
      this.changeChannel(-1);
    }
  }

  onClick(event) {
    this.changeChannel(1);
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.screenMaterial.uniforms.uMouse.value.copy(this.mouse);
  }

  changeChannel(direction = 1) {
    this.currentChannel =
      (this.currentChannel + direction + this.channels.length) %
      this.channels.length;
    this.screenMaterial.uniforms.uChannel.value = this.currentChannel;

    const indicator = document.getElementById("channelIndicator");
    if (indicator) {
      const channel = this.channels[this.currentChannel];
      indicator.textContent = `Channel ${this.currentChannel + 1}: ${channel.name}`;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.016;
    this.controls.update();

    this.screenMaterial.uniforms.uTime.value = this.time;

    this.renderer.render(this.scene, this.camera);
  }
}

new RetroShaderMonitor();
