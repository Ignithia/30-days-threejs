import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// 3D Portfolio - Cyberpunk Command Center
class Portfolio3D {
  constructor() {
    this.currentSection = "home";
    this.interactiveObjects = [];
    this.time = 0;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    // Portfolio sections data
    this.sections = {
      home: {
        title: "Welcome to Ignithia's Command Center",
        description:
          "Navigate through an immersive showcase of digital creativity and technical expertise",
        position: { x: 0, y: 0, z: 0 },
      },
      about: {
        title: "About Ignithia",
        description:
          "A 19-year-old digital creator specializing in interactive experiences and cutting-edge technology",
        position: { x: -10, y: 0, z: 0 },
      },
      projects: {
        title: "Project Showcase",
        description:
          "Explore featured projects that blend creativity with technical innovation",
        position: { x: 10, y: 0, z: 0 },
      },
      skills: {
        title: "Technical Arsenal",
        description:
          "Advanced 3D visualization of skills and expertise in emerging technologies",
        position: { x: 0, y: 0, z: -10 },
      },
      inventory: {
        title: "Digital Inventory",
        description:
          "Tools, technologies, and resources mastered throughout the creative journey",
        position: { x: 0, y: 0, z: 10 },
      },
      contact: {
        title: "Communication Hub",
        description: "Connect through advanced digital communication channels",
        position: { x: -7, y: 0, z: -7 },
      },
    };

    this.init();
    this.animate();
  }

  async init() {
    // Show loading screen
    this.showLoading();

    // Initialize Three.js
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initControls();
    this.initLights();
    this.initPostProcessing();

    // Create environment
    await this.createEnvironment();
    await this.createSectionAreas();

    // Setup interactions
    this.setupEventListeners();
    this.setupNavigation();

    // Hide loading screen
    this.hideLoading();
  }

  showLoading() {
    const loadingScreen = document.getElementById("loading-screen");
    const progress = document.querySelector(".loading-progress");
    const percentage = document.querySelector(".loading-percentage");

    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.random() * 15;
      if (percent > 100) {
        percent = 100;
        clearInterval(interval);
      }
      progress.style.width = percent + "%";
      percentage.textContent = Math.floor(percent) + "%";
    }, 100);
  }

  hideLoading() {
    const loadingScreen = document.getElementById("loading-screen");
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 1000);
    }, 1500);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("threejs-canvas"),
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);

    // Add fog for depth
    this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 0, 0);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 25;
    this.controls.minDistance = 3;
    this.controls.maxPolarAngle = Math.PI * 0.7;
    this.controls.target.set(0, 0, 0);
  }

  initLights() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    this.mainLight = new THREE.DirectionalLight(0x00ffcc, 1);
    this.mainLight.position.set(10, 15, 5);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.width = 2048;
    this.mainLight.shadow.mapSize.height = 2048;
    this.mainLight.shadow.camera.near = 0.5;
    this.mainLight.shadow.camera.far = 30;
    this.mainLight.shadow.camera.left = -20;
    this.mainLight.shadow.camera.right = 20;
    this.mainLight.shadow.camera.top = 20;
    this.mainLight.shadow.camera.bottom = -20;
    this.scene.add(this.mainLight);

    // Accent lights for cyberpunk atmosphere
    const accentLight1 = new THREE.PointLight(0x7df9ff, 0.8, 20);
    accentLight1.position.set(-8, 3, -8);
    this.scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff007f, 0.6, 15);
    accentLight2.position.set(8, 2, 8);
    this.scene.add(accentLight2);

    // Spotlight for dramatic effect
    this.spotlight = new THREE.SpotLight(0x00ffcc, 1, 25, Math.PI / 6, 0.3);
    this.spotlight.position.set(0, 20, 0);
    this.spotlight.target.position.set(0, 0, 0);
    this.spotlight.castShadow = true;
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom effect for cyberpunk glow
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85, // threshold
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  async createEnvironment() {
    await this.createFloor();
    await this.createWalls();
    await this.createCeiling();
    await this.createAtmosphere();
  }

  async createFloor() {
    // Create hexagonal floor pattern
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.7,
    });

    // Create hex pattern texture
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Hex grid pattern
    const hexSize = 20;
    for (let x = 0; x < canvas.width; x += hexSize * 1.5) {
      for (let y = 0; y < canvas.height; y += hexSize * Math.sqrt(3)) {
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1;
        this.drawHexagon(ctx, x, y, hexSize);
      }
    }

    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    floorMaterial.map = floorTexture;

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const dx = x + size * Math.cos(angle);
      const dy = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  async createWalls() {
    // Create holographic walls with data streams
    const wallPositions = [
      { x: -20, y: 0, z: 0, rotation: Math.PI / 2 },
      { x: 20, y: 0, z: 0, rotation: -Math.PI / 2 },
      { x: 0, y: 0, z: -20, rotation: 0 },
      { x: 0, y: 0, z: 20, rotation: Math.PI },
    ];

    wallPositions.forEach((pos, index) => {
      const wallGeometry = new THREE.PlaneGeometry(40, 20);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a1a,
        transparent: true,
        opacity: 0.3,
        emissive: 0x001122,
      });

      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos.x, pos.y + 8, pos.z);
      wall.rotation.y = pos.rotation;
      this.scene.add(wall);

      // Add data stream effects
      this.createDataStream(pos, index);
    });
  }

  createDataStream(wallPos, index) {
    const numStreams = 5;
    for (let i = 0; i < numStreams; i++) {
      const streamGeometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      // Create vertical data stream
      for (let j = 0; j < 50; j++) {
        positions.push(
          wallPos.x + (Math.random() - 0.5) * 15,
          j * 0.5 - 5,
          wallPos.z + (Math.random() - 0.5) * 2,
        );

        const intensity = Math.random();
        colors.push(0, intensity, intensity * 0.8);
      }

      streamGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      streamGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );

      const streamMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });

      const dataStream = new THREE.Points(streamGeometry, streamMaterial);
      this.scene.add(dataStream);

      // Animate data streams
      dataStream.userData = {
        type: "dataStream",
        speed: 1 + Math.random() * 2,
      };
      this.interactiveObjects.push(dataStream);
    }
  }

  async createCeiling() {
    const ceilingGeometry = new THREE.PlaneGeometry(40, 40);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.1,
    });

    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 18;
    this.scene.add(ceiling);
  }

  async createAtmosphere() {
    // Add floating particles for atmosphere
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = Math.random() * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      const intensity = Math.random();
      colors[i3] = 0;
      colors[i3 + 1] = intensity;
      colors[i3 + 2] = intensity * 0.8;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }

  async createSectionAreas() {
    // Create holographic terminals for each section
    Object.entries(this.sections).forEach(([key, section]) => {
      this.createSectionTerminal(key, section);
    });
  }

  createSectionTerminal(sectionKey, section) {
    const terminalGroup = new THREE.Group();

    // Terminal base
    const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.2, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x001122,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.9;
    base.castShadow = true;
    terminalGroup.add(base);

    // Holographic screen
    const screenGeometry = new THREE.PlaneGeometry(2, 1.5);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.7,
      emissive: 0x002222,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.y = 0.5;
    screen.rotation.x = -Math.PI / 6;
    screen.renderOrder = 1000;
    terminalGroup.add(screen);

    // Add glow effect - offset to prevent z-fighting
    const glowGeometry = new THREE.PlaneGeometry(2.2, 1.7);
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.15,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = screen.position.y - 0.01;
    glow.position.z = screen.position.z - 0.01;
    glow.rotation.copy(screen.rotation);
    glow.renderOrder = 999;
    terminalGroup.add(glow);

    // Position terminal
    const pos = section.position;
    terminalGroup.position.set(pos.x, pos.y, pos.z);

    // Add floating icon and energy effects
    this.createFloatingIcon(terminalGroup, sectionKey);
    this.createEnergyRings(terminalGroup);

    // Add interaction data
    terminalGroup.userData = {
      type: "terminal",
      section: sectionKey,
      interactive: true,
    };

    this.scene.add(terminalGroup);
    this.interactiveObjects.push(terminalGroup);
  }

  createFloatingIcon(terminalGroup, sectionKey) {
    const iconSymbols = {
      home: "🏠",
      about: "👨‍💻",
      projects: "🚀",
      skills: "⚡",
      inventory: "🛠️",
      contact: "📡",
    };

    // Create text sprite
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    context.fillStyle = "#00ffcc";
    context.font = "100px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(iconSymbols[sectionKey] || "💻", 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      emissive: 0x002222,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.8, 0.8, 1);
    sprite.position.set(0, 2, 0);

    terminalGroup.add(sprite);

    // Add animation data
    sprite.userData = {
      type: "floatingIcon",
      baseY: 2,
      amplitude: 0.3,
      frequency: 2,
    };
  }

  createEnergyRings(terminalGroup) {
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(
        2 + i * 0.5,
        2.1 + i * 0.5,
        32,
      );
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.15 - i * 0.03,
        emissive: 0x00ffcc,
        emissiveIntensity: 0.2,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      // Store base opacity for animation
      ringMaterial.userData = { baseOpacity: 0.15 - i * 0.03 };

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -1.8 + i * 0.1;
      ring.renderOrder = 999;

      terminalGroup.add(ring);

      // Add rotation animation data (disabled in animate loop)
      ring.userData = {
        type: "energyRing",
        rotationSpeed: 0,
      };
    }
  }

  setupEventListeners() {
    // Mouse movement
    document.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Mouse click
    document.addEventListener("click", (event) => {
      this.onMouseClick(event);
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });

    // Return to 2D button
    document.getElementById("return-2d").addEventListener("click", () => {
      window.location.href = "../../index.html";
    });

    // View toggle button (toggle controls instructions)
    document.getElementById("view-toggle").addEventListener("click", () => {
      const controlsInfo = document.getElementById("controls-info");
      const icon = document.querySelector("#view-toggle i");
      
      if (controlsInfo.style.display === "none") {
        controlsInfo.style.display = "flex";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      } else {
        controlsInfo.style.display = "none";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    });

    // Close panel button
    document.getElementById("close-panel").addEventListener("click", () => {
      this.hideInteractionPanel();
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigateToSection(section);
      });
    });
  }

  navigateToSection(sectionKey) {
    if (this.sections[sectionKey]) {
      const section = this.sections[sectionKey];
      const pos = section.position;

      // Update current section
      this.currentSection = sectionKey;

      // Update navigation
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
      });
      document
        .querySelector(`[data-section="${sectionKey}"]`)
        .classList.add("active");

      // Update section info
      this.updateSectionInfo(section);

      // Animate camera to position - improved positioning
      this.animateCameraTo(pos.x, pos.y + 4, pos.z + 10, pos.x, pos.y, pos.z);
    }
  }

  updateSectionInfo(section) {
    document.getElementById("section-title").textContent = section.title;
    document.getElementById("section-description").textContent =
      section.description;
  }

  animateCameraTo(x, y, z, targetX = x, targetY = 0, targetZ = z) {
    const targetPosition = new THREE.Vector3(x, y, z);
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const endTarget = new THREE.Vector3(targetX, targetY, targetZ);

    let progress = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate camera position
      this.camera.position.lerpVectors(startPosition, targetPosition, eased);

      // Interpolate controls target
      this.controls.target.lerpVectors(startTarget, endTarget, eased);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  onMouseClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.interactiveObjects,
      true,
    );

    if (intersects.length > 0) {
      const object = intersects[0].object.parent || intersects[0].object;

      if (object.userData.type === "terminal") {
        this.showInteractionPanel(object.userData.section);
      }
    }
  }

  showInteractionPanel(sectionKey) {
    const panel = document.getElementById("interaction-panel");
    const title = document.getElementById("panel-title");
    const content = document.getElementById("panel-content");

    // Set panel content based on section
    const sectionContent = this.getSectionContent(sectionKey);
    title.textContent = sectionContent.title;
    content.innerHTML = sectionContent.content;

    // Show panel
    panel.classList.remove("hidden");
  }

  hideInteractionPanel() {
    const panel = document.getElementById("interaction-panel");
    panel.classList.add("hidden");
  }

  getSectionContent(sectionKey) {
    const contents = {
      home: {
        title: "Command Center",
        content: `
                    <h3>Welcome to the Future</h3>
                    <p>This 3D portfolio represents the next evolution of digital presentation, demonstrating advanced capabilities beyond traditional web portfolios.</p>
                    
                    <div class="feature-grid">
                        <div class="feature-item">
                            <strong>Real-time 3D Graphics</strong>
                            <p>Powered by Three.js with WebGL acceleration</p>
                        </div>
                        <div class="feature-item">
                            <strong>Interactive Environment</strong>
                            <p>Navigate through a fully immersive space</p>
                        </div>
                        <div class="feature-item">
                            <strong>Advanced Post-Processing</strong>
                            <p>Bloom effects and cinematic rendering</p>
                        </div>
                        <div class="feature-item">
                            <strong>Dynamic Lighting</strong>
                            <p>Real-time shadows and atmospheric effects</p>
                        </div>
                    </div>
                    
                    <p style="margin-top: 1.5rem; font-style: italic; color: #7df9ff;">This 3D interface showcases technical expertise while providing an engaging user experience that traditional 2D portfolios cannot match.</p>
                `,
      },
      about: {
        title: "Digital Creator Profile",
        content: `
                    <h3>Ignithia (Ryan) - Digital Creator</h3>
                    <p>A 19-year-old student at Thomas More, specializing in cutting-edge digital experiences and interactive technology.</p>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <strong>30+</strong>
                            <span>Days of Three.js</span>
                        </div>
                        <div class="stat-item">
                            <strong>10+</strong>
                            <span>Interactive Projects</span>
                        </div>
                        <div class="stat-item">
                            <strong>5+</strong>
                            <span>Technologies Mastered</span>
                        </div>
                    </div>
                    
                    <div class="expertise-areas">
                        <h4>Core Expertise:</h4>
                        <ul>
                            <li>Front-end Development & Modern JavaScript</li>
                            <li>3D Graphics Programming with Three.js</li>
                            <li>Interactive Design & User Experience</li>
                            <li>WebGL Shaders & Visual Effects</li>
                            <li>Real-time Animation & Physics</li>
                        </ul>
                    </div>
                    
                    <p style="margin-top: 1rem; color: #00ffcc;">Passionate about pushing the boundaries of web technology to create unprecedented digital experiences.</p>
                `,
      },
      projects: {
        title: "Featured Projects",
        content: `
                    <h3>Interactive Project Showcase</h3>
                    <p>Comprehensive collection demonstrating evolution from basic concepts to advanced implementations:</p>
                    
                    <div class="project-showcase">
                        <div class="project-highlight main-projects">
                            <strong>🎮 Bullet Hell Game</strong>
                            <p>Fast-paced arcade game with advanced collision detection and particle systems.</p>
                            <div class="tech-stack">JavaScript • Canvas API • Physics • Game Logic</div>
                            <div class="project-links">
                                <a href="../../../projects/index.html" target="_blank" class="project-link">View Project</a>
                            </div>
                        </div>
                        
                        <div class="project-highlight main-projects">
                            <strong>🧠 Killer Teddies</strong>
                            <p>Strategic grid-based puzzle game with AI pathfinding algorithms.</p>
                            <div class="tech-stack">JavaScript • AI Logic • Grid Systems</div>
                            <div class="project-links">
                                <a href="../../../projects/index.html" target="_blank" class="project-link">View Project</a>
                            </div>
                        </div>
                        
                        <div class="project-highlight main-projects">
                            <strong>📚 The Library Experience</strong>
                            <p>Immersive 3D audio-visual environment with interactive storytelling elements.</p>
                            <div class="tech-stack">Three.js • Audio API • 3D Modeling</div>
                            <div class="project-links">
                                <a href="../../../the_library/index.html" target="_blank" class="project-link">Experience Demo</a>
                            </div>
                        </div>
                        
                        <div class="project-highlight main-projects">
                            <strong>⭐ Orbity Skill System</strong>
                            <p>Interactive 3D skill visualization with real-time physics and dynamic tooltips.</p>
                            <div class="tech-stack">Canvas API • Physics • Interactive Design</div>
                            <div class="project-links">
                                <a href="../../../index.html#skills" target="_blank" class="project-link">View Orbity</a>
                            </div>
                        </div>
                        
                        <div class="project-highlight">
                            <strong>🎯 30 Days of Three.js Challenge</strong>
                            <p>Progressive learning journey from basic 3D concepts to advanced shader programming.</p>
                            <div class="tech-stack">Three.js • WebGL • GLSL • Shaders</div>
                            
                            <div class="threejs-days">
                                <div class="day-group">
                                    <h4>Week 1: Fundamentals</h4>
                                    <div class="day-links">
                                        <a href="../../day-01/index.html" class="day-link">Day 1: Hello Cube</a>
                                        <a href="../../day-02/index.html" class="day-link">Day 2: Materials</a>
                                        <a href="../../day-03/index.html" class="day-link">Day 3: Lighting</a>
                                        <a href="../../day-04/index.html" class="day-link">Day 4: Controls</a>
                                        <a href="../../day-05/index.html" class="day-link">Day 5: Shadows</a>
                                        <a href="../../day-06/index.html" class="day-link">Day 6: Responsive</a>
                                        <a href="../../day-07/index.html" class="day-link">Day 7: Mini Scene</a>
                                    </div>
                                </div>
                                
                                <div class="day-group">
                                    <h4>Week 2: Interactions</h4>
                                    <div class="day-links">
                                        <a href="../../day-08/index.html" class="day-link">Day 8: Click Events</a>
                                        <a href="../../day-09/index.html" class="day-link">Day 9: Textures</a>
                                        <a href="../../day-10/index.html" class="day-link">Day 10: Geometries</a>
                                        <a href="../../day-11/index.html" class="day-link">Day 11: Animations</a>
                                        <a href="../../day-12/index.html" class="day-link">Day 12: Particles</a>
                                        <a href="../../day-13/index.html" class="day-link">Day 13: Physics</a>
                                        <a href="../../day-14/index.html" class="day-link">Day 14: Audio</a>
                                    </div>
                                </div>
                                
                                <div class="day-group">
                                    <h4>Week 3: Advanced</h4>
                                    <div class="day-links">
                                        <a href="../../day-15/index.html" class="day-link">Day 15: Shaders</a>
                                        <a href="../../day-16/index.html" class="day-link">Day 16: GLSL</a>
                                        <a href="../../day-17/index.html" class="day-link">Day 17: HDRI</a>
                                        <a href="../../day-18/index.html" class="day-link">Day 18: Post-Processing</a>
                                        <a href="../../day-19/index.html" class="day-link">Day 19: Raycasting</a>
                                        <a href="../../day-20/index.html" class="day-link">Day 20: Instancing</a>
                                        <a href="../../day-21/index.html" class="day-link">Day 21: Assets</a>
                                    </div>
                                </div>
                                
                                <div class="day-group">
                                    <h4>Week 4: Mastery</h4>
                                    <div class="day-links">
                                        <a href="../../day-22/index.html" class="day-link">Day 22: Performance</a>
                                        <a href="../../day-23/index.html" class="day-link">Day 23: Optimization</a>
                                        <a href="../../day-24/index.html" class="day-link">Day 24: Advanced Scene</a>
                                        <a href="../../day-25/index.html" class="day-link">Day 25: Interactions</a>
                                        <a href="../../day-26/index.html" class="day-link">Day 26: AR/VR Prep</a>
                                        <a href="../../day-27/index.html" class="day-link">Day 27: Complex Models</a>
                                        <a href="../../day-28/index.html" class="day-link">Day 28: Final Scene</a>
                                        <a href="../../day-29/index.html" class="day-link">Day 29: Integration</a>
                                        <a href="index.html" class="day-link current">Day 30: 3D Portfolio</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem; text-align: center; padding: 1rem; background: rgba(0, 255, 204, 0.1); border-radius: 8px;">
                        <p style="margin: 0;"><strong>Portfolio Highlights:</strong> Each project demonstrates progression in technical complexity and creative problem-solving.</p>
                        <a href="../../../projects/index.html" target="_blank" class="cyber-link" style="margin-top: 1rem; display: inline-block;">Explore Full Portfolio →</a>
                    </div>
                `,
      },
      skills: {
        title: "Technical Arsenal",
        content: `
                    <h3>Advanced Skill Matrix</h3>
                    <p>Comprehensive technical capabilities across multiple domains:</p>
                    
                    <div class="skill-matrix">
                        <div class="skill-domain">
                            <strong>Frontend Development</strong>
                            <div class="skill-list">
                                <span class="skill-tag expert">JavaScript ES6+</span>
                                <span class="skill-tag expert">HTML5 & CSS3</span>
                                <span class="skill-tag advanced">React.js</span>
                                <span class="skill-tag intermediate">Vue.js</span>
                            </div>
                        </div>
                        
                        <div class="skill-domain">
                            <strong>3D Graphics & WebGL</strong>
                            <div class="skill-list">
                                <span class="skill-tag expert">Three.js</span>
                                <span class="skill-tag advanced">WebGL</span>
                                <span class="skill-tag intermediate">GLSL Shaders</span>
                                <span class="skill-tag intermediate">Blender</span>
                            </div>
                        </div>
                        
                        <div class="skill-domain">
                            <strong>Design & Creative</strong>
                            <div class="skill-list">
                                <span class="skill-tag expert">Adobe Creative Suite</span>
                                <span class="skill-tag expert">Figma</span>
                                <span class="skill-tag advanced">UI/UX Design</span>
                                <span class="skill-tag intermediate">Motion Graphics</span>
                            </div>
                        </div>
                        
                        <div class="skill-domain">
                            <strong>Development Tools</strong>
                            <div class="skill-list">
                                <span class="skill-tag expert">Git & GitHub</span>
                                <span class="skill-tag expert">VS Code</span>
                                <span class="skill-tag advanced">Node.js</span>
                                <span class="skill-tag intermediate">SQL</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(0, 255, 204, 0.1); border-radius: 8px;">
                        <p><strong>Currently Learning:</strong> Advanced shader programming, physics simulations, and cutting-edge web technologies.</p>
                    </div>
                `,
      },
      inventory: {
        title: "Digital Arsenal",
        content: `
                    <h3>Professional Toolkit</h3>
                    <p>Comprehensive collection of tools and technologies for modern digital creation:</p>
                    
                    <div class="tool-categories">
                        <div class="tool-category">
                            <strong>Development Environment</strong>
                            <ul>
                                <li>Visual Studio Code - Primary development environment</li>
                                <li>GitHub - Version control and collaboration</li>
                                <li>Node.js - JavaScript runtime environment</li>
                                <li>NPM/Yarn - Package management</li>
                            </ul>
                        </div>
                        
                        <div class="tool-category">
                            <strong>Graphics & 3D</strong>
                            <ul>
                                <li>Three.js - 3D graphics library</li>
                                <li>WebGL - Low-level graphics API</li>
                                <li>Blender - 3D modeling software</li>
                                <li>GLSL - Shader programming language</li>
                            </ul>
                        </div>
                        
                        <div class="tool-category">
                            <strong>Design & Media</strong>
                            <ul>
                                <li>Adobe Creative Suite - Complete design toolkit</li>
                                <li>Figma - Collaborative design platform</li>
                                <li>Piskel - Pixel art creation</li>
                                <li>Color pickers & design utilities</li>
                            </ul>
                        </div>
                        
                        <div class="tool-category">
                            <strong>Infrastructure</strong>
                            <ul>
                                <li>Combell - Professional hosting</li>
                                <li>FileZilla - FTP management</li>
                                <li>Browser DevTools - Debugging</li>
                                <li>Performance monitoring tools</li>
                            </ul>
                        </div>
                    </div>
                    
                    <p style="margin-top: 1rem; color: #7df9ff; font-style: italic;">Each tool has been carefully selected to enable the creation of cutting-edge digital experiences.</p>
                `,
      },
      contact: {
        title: "Communication Hub",
        content: `
                    <h3>Connect to the Network</h3>
                    <p>Ready to collaborate on innovative digital projects and push the boundaries of web technology.</p>
                    
                    <div class="contact-grid">
                        <div class="contact-method primary">
                            <i class="fa-regular fa-envelope"></i>
                            <div>
                                <strong>Primary Contact</strong>
                                <p>ryan_vandevreken@outlook.be</p>
                                <span>Professional inquiries welcome</span>
                                <a href="mailto:ryan_vandevreken@outlook.be" class="contact-link">Send Email</a>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <i class="fa-brands fa-github"></i>
                            <div>
                                <strong>Code Repository</strong>
                                <p>GitHub Portfolio</p>
                                <span>View projects & contributions</span>
                                <a href="https://github.com/Ignithia" target="_blank" class="contact-link">Visit GitHub</a>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <i class="fa-brands fa-linkedin"></i>
                            <div>
                                <strong>Professional Network</strong>
                                <p>LinkedIn Profile</p>
                                <span>Connect professionally</span>
                                <a href="https://linkedin.com/in/ryan-vandevreken" target="_blank" class="contact-link">Connect on LinkedIn</a>
                            </div>
                        </div>
                        
                        <div class="contact-method">
                            <i class="fa-brands fa-instagram"></i>
                            <div>
                                <strong>Creative Updates</strong>
                                <p>@v.d.vr_ryan</p>
                                <span>Latest creative work</span>
                                <a href="https://www.instagram.com/v.d.vr_ryan/" target="_blank" class="contact-link">View Instagram</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="collaboration-note">
                        <h4>Collaboration Interests:</h4>
                        <ul>
                            <li>Interactive 3D web experiences</li>
                            <li>Innovative frontend development</li>
                            <li>Creative coding projects</li>
                            <li>WebGL & shader programming</li>
                            <li>Educational content creation</li>
                            <li>Real-time graphics and animations</li>
                            <li>VR/AR web applications</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem; padding: 1.5rem; background: rgba(0, 255, 204, 0.1); border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.3);">
                        <p style="color: #00ffcc; font-weight: bold; font-size: 1.1rem; margin: 0;">
                            "Let's create something extraordinary together."
                        </p>
                        <p style="margin-top: 0.5rem; margin-bottom: 0; color: #7df9ff;">
                            Open to freelance opportunities and collaborative projects
                        </p>
                    </div>
                `,
      },
    };

    return contents[sectionKey] || contents.home;
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.01;

    // Update controls
    this.controls.update();

    // Animate particles
    if (this.particles) {
      this.particles.rotation.y += 0.0005;
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(this.time + positions[i] * 0.01) * 0.0005;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Animate data streams - stabilized
    this.interactiveObjects.forEach((obj) => {
      if (obj.userData.type === "dataStream") {
        const positions = obj.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += obj.userData.speed * 0.05;
          if (positions[i + 1] > 20) {
            positions[i + 1] = -5;
          }
        }
        obj.geometry.attributes.position.needsUpdate = true;
      }
    });

    // Animate terminal glows and new effects
    this.interactiveObjects.forEach((obj) => {
      if (obj.userData.type === "terminal") {
        // Animate glow
        const glow = obj.children.find(
          (child) =>
            child.material &&
            child.material.blending === THREE.AdditiveBlending,
        );
        if (glow) {
          // Use fixed opacity to prevent glitching during camera movement
          glow.material.opacity = 0.2;
        }

        // Animate floating icons and energy rings
        obj.children.forEach((child) => {
          if (child.userData.type === "floatingIcon") {
            child.position.y =
              child.userData.baseY +
              Math.sin(this.time * child.userData.frequency) *
                child.userData.amplitude;
          }
          if (child.userData.type === "energyRing") {
            // Completely disable rotation to prevent glitching
            // child.rotation.z += 0;
            // Use fixed opacity - no animation
            const baseOpacity = child.material.userData.baseOpacity || 0.1;
            child.material.opacity = baseOpacity;
          }
        });
      }
    });

    // Update lighting
    if (this.mainLight) {
      this.mainLight.position.x = Math.sin(this.time * 0.5) * 5;
      this.mainLight.intensity = 1 + Math.sin(this.time) * 0.2;
    }

    // Render
    this.composer.render();
  }
}

// Initialize the 3D Portfolio
new Portfolio3D();
