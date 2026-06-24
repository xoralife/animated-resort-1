// === LOADING SCREEN ===
const loadingScreen = document.getElementById('loading-screen');
const loaderFill = document.querySelector('.loader-fill');
const loaderPercent = document.querySelector('.loader-percent');

let loadProgress = 0;
function updateLoading(progress) {
  loadProgress = Math.min(progress, 100);
  loaderFill.style.width = loadProgress + '%';
  loaderPercent.textContent = Math.round(loadProgress) + '%';
  if (loadProgress >= 100) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 500);
  }
}

// === THREE.JS SETUP ===
const canvas = document.getElementById('resort-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d0d);
scene.fog = new THREE.Fog(0x0d0d0d, 30, 60);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 12);
camera.lookAt(0, 2, 0);

// === CAMERA PATH ===
const pathPoints = [
  new THREE.Vector3(0, 4, 12),    // 0% - Counter/Reception
  new THREE.Vector3(0, 3.5, 6),   // 20% - Entering dining
  new THREE.Vector3(-1, 3, 0),    // 40% - Middle dining
  new THREE.Vector3(1, 3, -4),    // 60% - Kitchen view
  new THREE.Vector3(0, 3.5, -8),  // 80% - Garden transition
  new THREE.Vector3(0, 5, -12)    // 100% - Final view
];

const cameraPath = new THREE.CatmullRomCurve3(pathPoints);

// === LIGHTS ===
const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffe4b5, 1.5);
mainLight.position.set(5, 12, 8);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 30;
mainLight.shadow.camera.left = -15;
mainLight.shadow.camera.right = 15;
mainLight.shadow.camera.top = 15;
mainLight.shadow.camera.bottom = -15;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// === PROCEDURAL WOOD TEXTURE ===
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const colors = ['#3d2b1f', '#4a3525', '#2a1f14', '#5c4033'];
  for (let i = 0; i < 60; i++) {
    const y = i * 8.5 + Math.random() * 4;
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(0, y, 512, 7 + Math.random() * 3);
  }

  // Grain lines
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 120; i++) {
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.random() * 2);
    for (let x = 0; x < 512; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + Math.random()) * 2);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(15, 20);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

// === FLOOR ===
const floorGeo = new THREE.PlaneGeometry(30, 40);
const floorMat = new THREE.MeshStandardMaterial({
  map: createWoodTexture(),
  roughness: 0.5,
  metalness: 0.05,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor);

// Area rug near counter
function createRug(cx, cz, w, h, color) {
  const rugGeo = new THREE.PlaneGeometry(w, h);
  const rugMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(cx, 0.01, cz);
  rug.receiveShadow = true;
  scene.add(rug);
}
createRug(0, 5.5, 4, 3, 0x8b0000);

// === CEILING ===
const ceilGeo = new THREE.PlaneGeometry(30, 40);
const ceilMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.9,
  side: THREE.DoubleSide,
});
const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 5;
scene.add(ceiling);

// === WALLS ===
function createWall(w, h, px, py, pz, ry) {
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xccbbaa,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(px, py, pz);
  mesh.rotation.y = ry || 0;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

createWall(30, 5, 0, 2.5, -15, 0);   // back wall
createWall(30, 5, 0, 2.5, 15, Math.PI);  // front wall
createWall(5, 5, -15, 2.5, 0, Math.PI / 2);  // left wall
createWall(5, 5, 15, 2.5, 0, -Math.PI / 2); // right wall

// === TEST OBJECTS (placeholder furniture) ===
function createTestTable(x, z) {
  const tableGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.8, 8);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.5,
    metalness: 0.3
  });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(x, 0.4, z);
  table.castShadow = true;
  table.receiveShadow = true;
  scene.add(table);

  // Table top
  const topGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 8);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x6b5b45,
    roughness: 0.4,
    metalness: 0.2
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.set(x, 0.84, z);
  top.castShadow = true;
  top.receiveShadow = true;
  scene.add(top);
}

function createTestChair(x, z, rot) {
  const chairGeo = new THREE.BoxGeometry(0.4, 0.4, 0.3);
  const chairMat = new THREE.MeshStandardMaterial({
    color: 0x4a3520,
    roughness: 0.7,
  });
  const chair = new THREE.Mesh(chairGeo, chairMat);
  chair.position.set(x, 0.2, z);
  chair.rotation.y = rot || 0;
  chair.castShadow = true;
  chair.receiveShadow = true;
  scene.add(chair);
}

// Place tables in dining area
for (let i = -2; i <= 2; i++) {
  for (let j = 0; j <= 3; j++) {
    if (i === 0 && j === 0) continue;
    const x = i * 2.5;
    const z = j * 2.5 - 2;
    createTestTable(x, z);
    createTestChair(x + 0.6, z + 0.5, 0);
    createTestChair(x - 0.6, z - 0.5, Math.PI);
    createTestChair(x + 0.6, z - 0.5, Math.PI / 2);
    createTestChair(x - 0.6, z + 0.5, -Math.PI / 2);
  }
}

updateLoading(20);

// === PROCEDURAL MARBLE TEXTURE ===
function createMarbleTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = `rgba(180,170,160,${Math.random() * 0.3})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    let x = Math.random() * 256, y = Math.random() * 256;
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

// === RECEPTION COUNTER ===
function createDetailedCounter() {
  const group = new THREE.Group();

  // Main counter body
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x2a1f14,
    roughness: 0.6,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 1.2), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Front panel with wood panels
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.7,
    metalness: 0.05,
  });
  for (let i = -1; i <= 1; i += 0.5) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.05), panelMat);
    panel.position.set(i, 0.5, 0.6);
    panel.castShadow = true;
    group.add(panel);
  }

  // Marble counter top
  const marbleTex = createMarbleTexture();
  const topMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.15,
    metalness: 0.3,
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 1.4), topMat);
  top.position.y = 1.04;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Gold trim
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e,
    roughness: 0.3,
    metalness: 0.8,
  });
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.03, 1.45), trimMat);
  trim.position.y = 1.08;
  group.add(trim);

  group.position.set(0, 0, 6);
  scene.add(group);
  return group;
}

const counter = createDetailedCounter();

// === RECEPTION SIGN ===
function createReceptionSign() {
  const signMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e,
    emissive: 0xc8a97e,
    emissiveIntensity: 0.1,
    roughness: 0.3,
    metalness: 0.8,
  });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.05), signMat);
  sign.position.set(0, 2.0, 5.4);
  scene.add(sign);
}
createReceptionSign();

// === RECEPTION POTTED PLANT ===
function createPottedPlant(x, z) {
  const group = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.8,
  });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.4, 12), potMat);
  pot.position.y = 0.2;
  pot.castShadow = true;
  group.add(pot);

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x2d5a27,
    roughness: 0.9,
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), stemMat);
    leaf.position.set(Math.cos(angle) * 0.25, 0.45 + Math.random() * 0.2, Math.sin(angle) * 0.25);
    leaf.scale.set(1, 1.5 + Math.random(), 1);
    group.add(leaf);
  }
  // Center leaves
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), stemMat);
    leaf.position.set((Math.random() - 0.5) * 0.15, 0.55 + Math.random() * 0.2, (Math.random() - 0.5) * 0.15);
    leaf.scale.set(1, 2, 1);
    group.add(leaf);
  }

  group.position.set(x, 0, z);
  scene.add(group);
}
createPottedPlant(-1.8, 5.5);
createPottedPlant(1.8, 5.5);

updateLoading(40);

// === LAMP POSTS (pillars with lights) ===
function createLamp(x, z) {
  const pillarGeo = new THREE.CylinderGeometry(0.1, 0.15, 3, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.6,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.set(x, 1.5, z);
  pillar.castShadow = true;
  scene.add(pillar);

  const lampGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffeedd,
    emissive: 0xffa500,
    emissiveIntensity: 0.5,
  });
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.set(x, 3.2, z);
  scene.add(lamp);

  // Point light
  const light = new THREE.PointLight(0xffa500, 0.3, 5);
  light.position.set(x, 3, z);
  scene.add(light);
}

createLamp(-2, 4);
createLamp(2, 4);
createLamp(-2, -2);
createLamp(2, -2);
createLamp(-2, -6);
createLamp(2, -6);

updateLoading(60);

// === WALL DECORATIONS ===
function createBaseboards() {
  const bbMat = new THREE.MeshStandardMaterial({ color: 0x2a1f14, roughness: 0.7 });
  [-15, 15].forEach(z => {
    const bb = new THREE.Mesh(new THREE.BoxGeometry(30, 0.2, 0.05), bbMat);
    bb.position.set(0, 0.1, z);
    scene.add(bb);
  });
  [-15, 15].forEach(x => {
    const bb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 40), bbMat);
    bb.position.set(x, 0.1, 0);
    scene.add(bb);
  });
}
createBaseboards();

// Wall panel frames
function createWallFrames() {
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.5,
    metalness: 0.1,
  });
  // Right wall panels (-z direction)
  for (let i = 0; i < 4; i++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.2, 0.8), frameMat);
    panel.position.set(14.97, 2, -2 - i * 3);
    scene.add(panel);
  }
  // Wall sconces
  const sconceMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e,
    emissive: 0xffa500,
    emissiveIntensity: 0.15,
    metalness: 0.8,
    roughness: 0.3,
  });
  [-4, 4].forEach(x => {
    [4, -2, -8].forEach(z => {
      const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), sconceMat);
      sconce.position.set(x, 2.5, z);
      scene.add(sconce);
      const sLight = new THREE.PointLight(0xffa500, 0.15, 3);
      sLight.position.set(x, 2.5, z);
      scene.add(sLight);
    });
  });
}
createWallFrames();

updateLoading(75);

// === SECTION CONTROLS ===
const sections = document.querySelectorAll('.section');
let currentSectionIndex = 0;
let isTransitioning = false;

function activateSection(index) {
  if (isTransitioning) return;
  isTransitioning = true;

  sections.forEach((s, i) => {
    if (i === index) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });

  currentSectionIndex = index;
  setTimeout(() => { isTransitioning = false; }, 600);
}

activateSection(0);

// === RESIZE ===
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// === ANIMATION LOOP ===
let scrollProgress = 0;
let targetProgress = 0;

function animate() {
  requestAnimationFrame(animate);

  // Smooth scroll interpolation
  scrollProgress += (targetProgress - scrollProgress) * 0.05;

  // Move camera along path
  const pathPos = cameraPath.getPoint(scrollProgress);
  const pathLook = cameraPath.getPoint(Math.min(scrollProgress + 0.01, 1));
  camera.position.copy(pathPos);
  camera.lookAt(pathLook);

  // Section switching based on scroll
  const sectionCount = sections.length;
  const sectionIndex = Math.min(
    Math.floor(scrollProgress * sectionCount),
    sectionCount - 1
  );
  if (sectionIndex !== currentSectionIndex) {
    activateSection(sectionIndex);
  }

  renderer.render(scene, camera);
}

animate();

// === SCROLL LISTENER ===
window.addEventListener('scroll', () => {
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return;
  targetProgress = Math.min(window.scrollY / scrollHeight, 1);
});

// === NAV LINKS ===
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    const sectionIndex = Array.from(sections).findIndex(s => s.id === href.replace('#', ''));
    if (sectionIndex >= 0) {
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const targetScroll = (sectionIndex / (sections.length - 1)) * scrollHeight;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  });
});

updateLoading(100);
console.log('The Grand Resort - 3D Experience Loaded');
