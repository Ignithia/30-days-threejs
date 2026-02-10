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
  }

  createCRTMonitor() {
    const monitorGeometry = new THREE.BoxGeometry(3.8, 3.0, 1.8, 4, 4, 4);
    const monitorMaterial = new THREE.MeshPhongMaterial({
      color: 0x3a3a3a,
      shininess: 15,
      specular: 0x1a1a1a,
    });
    this.monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    this.scene.add(this.monitor);

    const screenGeometry = new THREE.PlaneGeometry(2.8, 2.1);
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
    this.screen.position.set(0, 0, 0.91);
    this.scene.add(this.screen);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 0, 5);
    this.scene.add(pointLight);
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
        
        uv = uv * 2.0 - 1.0;
        uv *= 1.02;
        uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
        uv.y *= 1.0 + pow((abs(uv.x) / 5.0), 2.0);
        uv = (uv / 2.0) + 0.5;
        
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
        
        color += vhsStatic(uv) * 0.1;
        
        float scanlines = sin(uv.y * 800.0) * 0.04;
        color -= scanlines;
        
        float vignette = smoothstep(0.8, 0.2, length(uv - 0.5));
        color *= vignette;
        
        vec2 offset = vec2(0.002, 0.0);
        
        color *= 1.2;
        color = pow(color, vec3(1.0/2.2));
        
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          color = vec3(0.0);
        }
        
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
