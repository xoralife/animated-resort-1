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
scene.background = new THREE.Color(0x0a0806);
scene.fog = new THREE.FogExp2(0x0a0806, 0.018);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 12);
camera.lookAt(0, 2, 0);

// === CAMERA PATH ===
const pathPoints = [
  new THREE.Vector3(0, 4, 12),      // 0% - Counter/Reception
  new THREE.Vector3(0, 3.8, 8),     // 12% - Past counter
  new THREE.Vector3(-1, 3.2, 4),    // 25% - Entering dining
  new THREE.Vector3(0, 3, 0),       // 40% - Middle dining
  new THREE.Vector3(1.2, 3, -4),    // 55% - Far dining
  new THREE.Vector3(0, 3.2, -7.5),  // 70% - At glass partition
  new THREE.Vector3(-1.5, 4, -10),  // 75% - Side kitchen view
  new THREE.Vector3(0, 4.5, -13),   // 85% - Back of kitchen
  new THREE.Vector3(0, 4, -16),     // 92% - Garden entrance
  new THREE.Vector3(0, 3.5, -20)    // 100% - Garden center
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

// Back wall with glass door opening
function createBackWall() {
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xccbbaa, roughness: 0.8, side: THREE.DoubleSide,
  });
  // Left section
  const left = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
  left.position.set(-9, 2.5, -15); left.receiveShadow = true; scene.add(left);
  // Right section
  const right = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
  right.position.set(9, 2.5, -15); right.receiveShadow = true; scene.add(right);
  // Top section
  const top = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.8), wallMat);
  top.position.set(0, 4.6, -15); top.receiveShadow = true; scene.add(top);

  // Glass door (double)
  const doorMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.2,
    roughness: 0.0, metalness: 0.0, clearcoat: 0.5, side: THREE.DoubleSide,
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 4), doorMat);
  glass.position.set(0, 2.2, -15); scene.add(glass);

  // Door frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.6 });
  [[-2.75, 0], [2.75, 0]].forEach(([x, _]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.4, 0.08), frameMat);
    post.position.set(x, 2.2, -15); scene.add(post);
  });
}
createBackWall();
createWall(30, 5, 0, 2.5, 15, Math.PI);  // front wall
createWall(5, 5, -15, 2.5, 0, Math.PI / 2);  // left wall
createWall(5, 5, 15, 2.5, 0, -Math.PI / 2); // right wall

// === PROCEDURAL WOOD TEXTURE (table) ===
function createTableWoodTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6b5b45'; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = `rgba(80,60,40,${Math.random() * 0.3})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath(); ctx.moveTo(0, i * 6 + Math.random() * 3);
    for (let x = 0; x < 128; x += 10) ctx.lineTo(x, i * 6 + Math.sin(x * 0.05) * 2);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}
const tableWoodTex = createTableWoodTexture();

// === DETAILED DINING TABLE ===
function createDiningTable(x, z) {
  const group = new THREE.Group();

  const legMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.6,
    metalness: 0.1,
  });

  // Center pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 0.7, 12), legMat);
  pedestal.position.y = 0.35;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.08, 12), legMat);
  base.position.y = 0.04;
  base.receiveShadow = true;
  group.add(base);

  // Table top (wood)
  const topMat = new THREE.MeshStandardMaterial({
    map: tableWoodTex,
    roughness: 0.4,
    metalness: 0.05,
  });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 16), topMat);
  top.position.y = 0.73;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Cloth/runner
  const runnerMat = new THREE.MeshStandardMaterial({
    color: 0x8b0000,
    roughness: 0.9,
  });
  const runner = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 1.2), runnerMat);
  runner.position.y = 0.76;
  group.add(runner);

  // === CENTERPIECE (vase with flower) ===
  const vaseMat = new THREE.MeshStandardMaterial({
    color: 0x5a7a5a,
    roughness: 0.3,
    metalness: 0.2,
  });
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8), vaseMat);
  vase.position.y = 0.84;
  group.add(vase);

  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    roughness: 0.8,
  });
  for (let f = 0; f < 3; f++) {
    const angle = (f / 3) * Math.PI * 2;
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), flowerMat);
    flower.position.set(Math.cos(angle) * 0.06, 0.92, Math.sin(angle) * 0.06);
    group.add(flower);
  }
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 4), stemMat);
  stem.position.y = 0.88;
  group.add(stem);

  group.position.set(x, 0, z);
  scene.add(group);
}

// === DETAILED DINING CHAIR ===
function createDiningChair(x, z, rot) {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x4a3520,
    roughness: 0.7,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x8b0000,
    roughness: 0.9,
  });

  // 4 legs
  const legPos = [[-0.15, 0, -0.15], [0.15, 0, -0.15], [-0.15, 0, 0.15], [0.15, 0, 0.15]];
  legPos.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.3, 6), woodMat);
    leg.position.set(lx, 0.15, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.35), woodMat);
  seat.position.y = 0.32;
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  // Cushion
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.3), cushionMat);
  cushion.position.y = 0.34;
  group.add(cushion);

  // Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.02), woodMat);
  back.position.set(0, 0.5, -0.17);
  back.castShadow = true;
  group.add(back);

  // Backrest cushion
  const backCush = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.02), cushionMat);
  backCush.position.set(0, 0.5, -0.16);
  group.add(backCush);

  group.position.set(x, 0, z);
  group.rotation.y = rot || 0;
  scene.add(group);
}

// === PLACE FURNITURE ===
for (let i = -2; i <= 2; i++) {
  for (let j = 0; j <= 3; j++) {
    if (i === 0 && j === 0) continue;
    const x = i * 2.5;
    const z = j * 2.5 - 2;
    createDiningTable(x, z);
    createDiningChair(x + 0.6, z + 0.5, 0);
    createDiningChair(x - 0.6, z - 0.5, Math.PI);
    createDiningChair(x + 0.6, z - 0.5, Math.PI / 2);
    createDiningChair(x - 0.6, z + 0.5, -Math.PI / 2);
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

// === LIGHTING ENHANCEMENT ===
// Central chandelier
function createChandelier() {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e, roughness: 0.3, metalness: 0.8,
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffeecc, emissive: 0xffdd44, emissiveIntensity: 0.4,
  });

  // Center rod
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), goldMat);
  rod.position.y = -0.25;
  group.add(rod);

  // Arms
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.02), goldMat);
    arm.position.set(Math.cos(angle) * 0.2, -0.3, Math.sin(angle) * 0.2);
    arm.rotation.y = -angle;
    group.add(arm);

    // Bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), bulbMat);
    bulb.position.set(Math.cos(angle) * 0.35, -0.35, Math.sin(angle) * 0.35);
    group.add(bulb);

    // Light from each arm
    const l = new THREE.PointLight(0xffdd44, 0.15, 4);
    l.position.set(Math.cos(angle) * 0.35, -0.35, Math.sin(angle) * 0.35);
    group.add(l);
  }

  // Center base
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.04, 8), goldMat);
  cap.position.y = 0;
  group.add(cap);

  group.position.set(0, 4.6, 0);
  scene.add(group);
}
createChandelier();

// Pendant lights over dining tables
function createPendantLight(x, z) {
  const group = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x333333, roughness: 0.3, metalness: 0.9,
  });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 12), metalMat);
  shade.position.y = -0.1;
  group.add(shade);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffeecc, emissive: 0xffdd44, emissiveIntensity: 0.3,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), bulbMat);
  bulb.position.y = -0.2;
  group.add(bulb);

  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4), metalMat);
  wire.position.y = 0.25;
  group.add(wire);

  const light = new THREE.PointLight(0xffdd44, 0.2, 3.5);
  light.position.set(0, -0.2, 0);
  group.add(light);

  group.position.set(x, 4.7, z);
  scene.add(group);
}

// Place pendant lights over table clusters
[-3.75, -1.25, 1.25, 3.75].forEach(x => {
  [1.5, 3.5].forEach(z => {
    createPendantLight(x, z);
  });
});

// Counter spot light
const spotMat = new THREE.MeshStandardMaterial({
  color: 0x333333, roughness: 0.3, metalness: 0.9,
});
const spotCone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.15, 12), spotMat);
spotCone.position.set(0, 4.7, 5.5);
scene.add(spotCone);

const spotLight = new THREE.SpotLight(0xffeedd, 0.4);
spotLight.position.set(0, 4.7, 5.5);
spotLight.target.position.set(0, 1.2, 6);
spotLight.angle = 0.4;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 8;
scene.add(spotLight);
scene.add(spotLight.target);

updateLoading(78);

// === KITCHEN VIEW AREA ===
// Glass partition wall
function createGlassPartition() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 0.3,
    side: THREE.DoubleSide,
    envMapIntensity: 0.5,
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.5), glassMat);
  glass.position.set(0, 1.75, -8.5);
  scene.add(glass);

  // Glass frame
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.5,
    metalness: 0.8,
  });
  // Horizontal rails
  [-0.5, 1.75, 3.5].forEach(y => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.05, 0.05), frameMat);
    rail.position.set(0, y, -8.5);
    scene.add(rail);
  });
  // Vertical mullions
  [-4, 0, 4].forEach(x => {
    const mull = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.5, 0.05), frameMat);
    mull.position.set(x, 1.75, -8.5);
    scene.add(mull);
  });
}
createGlassPartition();

// Kitchen floor (different tile)
function createKitchenFloor() {
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = 128; tileCanvas.height = 128;
  const tCtx = tileCanvas.getContext('2d');
  tCtx.fillStyle = '#4a4a4a'; tCtx.fillRect(0, 0, 128, 128);
  tCtx.strokeStyle = '#555555'; tCtx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    tCtx.beginPath(); tCtx.moveTo(i * 16, 0); tCtx.lineTo(i * 16, 128); tCtx.stroke();
    tCtx.beginPath(); tCtx.moveTo(0, i * 16); tCtx.lineTo(128, i * 16); tCtx.stroke();
  }
  const tileTex = new THREE.CanvasTexture(tileCanvas);
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(4, 3);

  const floorMat = new THREE.MeshStandardMaterial({
    map: tileTex,
    roughness: 0.7,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.01, -11);
  floor.receiveShadow = true;
  scene.add(floor);
}
createKitchenFloor();

// Kitchen counters and equipment
function createKitchen() {
  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.3,
    metalness: 0.9,
  });
  const counterMat = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.4,
    metalness: 0.7,
  });
  const tileMat = new THREE.MeshStandardMaterial({
    color: 0xf0e8e0,
    roughness: 0.8,
  });

  // Back wall (tiled)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.5), tileMat);
  backWall.position.set(0, 1.75, -13.5);
  scene.add(backWall);

  // Main counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(8, 0.9, 1.5), counterMat);
  counter.position.set(0, 0.45, -12);
  counter.castShadow = true;
  counter.receiveShadow = true;
  scene.add(counter);

  // Stainless steel top
  const top = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.05, 1.7), stainlessMat);
  top.position.set(0, 0.92, -12);
  top.receiveShadow = true;
  scene.add(top);

  // Stove (hob)
  const stoveMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.2,
    metalness: 0.9,
  });
  const stove = new THREE.Mesh(new THREE.BoxGeometry(2, 0.02, 0.8), stoveMat);
  stove.position.set(0, 0.95, -12);
  scene.add(stove);

  // Burner rings
  const burnerMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.5,
    metalness: 0.8,
  });
  [-0.5, 0.5].forEach(x => {
    [-0.2, 0.2].forEach(z => {
      const burner = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 12), burnerMat);
      burner.position.set(x, 0.96, z - 12);
      burner.rotation.x = -Math.PI / 2;
      scene.add(burner);
    });
  });

  // Ventilation hood
  const hoodMat = new THREE.MeshStandardMaterial({
    color: 0x777777,
    roughness: 0.3,
    metalness: 0.9,
  });
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.8), hoodMat);
  hood.position.set(0, 2.2, -12);
  scene.add(hood);
  const hoodPipe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.3), hoodMat);
  hoodPipe.position.set(0, 2.6, -12);
  scene.add(hoodPipe);

  // Sink
  const sinkMat = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 0.1,
    metalness: 0.9,
  });
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.6), sinkMat);
  sink.position.set(2.5, 0.95, -12);
  scene.add(sink);

  // Shelves above counter
  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.5,
    metalness: 0.6,
  });
  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2, 0.03, 0.6), shelfMat);
    shelf.position.set(-3 + i * 3, 2.2, -11);
    scene.add(shelf);

    // Items on shelf (plates)
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    for (let p = 0; p < 3; p++) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 12), plateMat);
      plate.position.set(-3 + i * 3 + (p - 1) * 0.3, 2.22, -11);
      scene.add(plate);
    }
  }

  // Hanging lights over kitchen
  const kLightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffeedd,
    emissiveIntensity: 0.3,
  });
  [-2, 2].forEach(x => {
    const kl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), kLightMat);
    kl.position.set(x, 4.5, -12);
    scene.add(kl);
    const kLight = new THREE.PointLight(0xffeedd, 0.2, 4);
    kLight.position.set(x, 4.5, -12);
    scene.add(kLight);
  });

  // Kitchen sign
  const signMat = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    emissive: 0xff2222,
    emissiveIntensity: 0.05,
    roughness: 0.3,
  });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.03), signMat);
  sign.position.set(0, 3.2, -8.3);
  scene.add(sign);
}
createKitchen();

updateLoading(82);

// === GARDEN / PATIO AREA ===
// Grass floor
function createGardenFloor() {
  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = 128; grassCanvas.height = 128;
  const gCtx = grassCanvas.getContext('2d');
  gCtx.fillStyle = '#3a6b35'; gCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 400; i++) {
    const shade = Math.floor(80 + Math.random() * 80);
    gCtx.fillStyle = `rgb(${shade-30},${shade+30},${shade-50})`;
    gCtx.fillRect(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }
  const grassTex = new THREE.CanvasTexture(grassCanvas);
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(8, 8);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshStandardMaterial({
    map: grassTex, roughness: 0.9,
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.01, -19.5);
  floor.receiveShadow = true;
  scene.add(floor);
}
createGardenFloor();

// Stone path from door to garden
function createStonePath() {
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x888888, roughness: 0.9,
  });
  for (let i = 0; i < 7; i++) {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.15 + Math.random() * 0.1, 0.18 + Math.random() * 0.1, 0.03, 6), stoneMat);
    stone.position.set((Math.random() - 0.5) * 0.5, 0.02, -16.5 - i * 0.7);
    stone.receiveShadow = true;
    scene.add(stone);
  }
}
createStonePath();

// Trees
function createTree(x, z, scale) {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.2 * scale, 6), trunkMat);
  trunk.position.y = 0.6 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5 * scale, 8, 8), leafMat);
    leaf.position.set(
      (Math.random() - 0.5) * 0.4 * scale,
      1.2 * scale + i * 0.3 * scale,
      (Math.random() - 0.5) * 0.4 * scale
    );
    leaf.scale.y = 0.7 + Math.random() * 0.3;
    leaf.castShadow = true;
    group.add(leaf);
  }
  group.position.set(x, 0, z);
  scene.add(group);
}

createTree(-4, -17.5, 1.2);
createTree(4, -17.5, 1.2);
createTree(-5, -21, 1.5);
createTree(5, -21, 1.5);
createTree(0, -22, 1.8);

// Bushes
function createBush(x, z, scale) {
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a7a35, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 8, 8), bushMat);
    bush.position.set((Math.random() - 0.5) * 0.3 * scale, 0.15 * scale, (Math.random() - 0.5) * 0.3 * scale);
    bush.scale.y = 0.6;
    bush.castShadow = true;
    scene.add(bush);
  }
  // Position group
  bushMat.color.setHex(0x3a7a35);
  const base = new THREE.Mesh(new THREE.SphereGeometry(0.25 * scale, 8, 8), bushMat);
  base.position.set(x, 0.1 * scale, z);
  base.scale.y = 0.5;
  base.castShadow = true;
  scene.add(base);
}

[3.5, -3.5].forEach(x => createBush(x, -19, 1));
createBush(-2, -20.5, 0.8);
createBush(2, -20.5, 0.8);

// Outdoor table & chairs
function createOutdoorFurniture(x, z) {
  const furMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8), furMat);
  table.position.set(x, 0.3, z);
  table.castShadow = true; table.receiveShadow = true;
  scene.add(table);

  const topMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.5 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.04, 8), topMat);
  top.position.set(x, 0.62, z);
  top.castShadow = true;
  scene.add(top);

  // Chairs around table
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
  const offsets = [[0.5, 0.5], [-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5]];
  offsets.forEach(([ox, oz]) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.25), chairMat);
    seat.position.set(x + ox, 0.22, z + oz);
    seat.castShadow = true;
    scene.add(seat);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.2, 4), chairMat);
    leg.position.set(x + ox, 0.1, z + oz);
    scene.add(leg);
  });
}
createOutdoorFurniture(-2, -18.5);
createOutdoorFurniture(2, -18.5);

// Small water fountain
function createFountain() {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.8 });
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.3, 12), stoneMat);
  basin.position.y = 0.15;
  basin.receiveShadow = true;
  group.add(basin);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8), stoneMat);
  pillar.position.y = 0.55;
  group.add(pillar);

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x4488ff, transparent: true, opacity: 0.5, roughness: 0.0, metalness: 0.0,
  });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 12), waterMat);
  water.position.y = 0.31;
  group.add(water);

  group.position.set(0, 0, -20);
  scene.add(group);
}
createFountain();

// String lights
function createStringLights() {
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffeeaa, emissive: 0xffdd44, emissiveIntensity: 0.3,
  });
  const wires = [[-6, -16], [-6, -19], [-6, -22]];
  wires.forEach(([xStart, z]) => {
    const points = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      points.push(new THREE.Vector3(xStart + t * 12, 4 + Math.sin(t * Math.PI * 4) * 0.3, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const wireGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
    const wire = new THREE.Line(wireGeo, new THREE.LineBasicMaterial({ color: 0x333333 }));
    scene.add(wire);

    for (let i = 1; i < points.length - 1; i += 2) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), lightMat);
      bulb.position.copy(points[i]);
      scene.add(bulb);
      const bLight = new THREE.PointLight(0xffdd44, 0.1, 2);
      bLight.position.copy(points[i]);
      scene.add(bLight);
    }
  });
}
createStringLights();

updateLoading(88);

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
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.005;

  // Smooth scroll interpolation
  scrollProgress += (targetProgress - scrollProgress) * 0.06;

  // Move camera along path
  const pathPos = cameraPath.getPoint(scrollProgress);
  const pathLook = cameraPath.getPoint(Math.min(scrollProgress + 0.02, 1));
  camera.position.copy(pathPos);

  // Natural head sway while looking
  const sway = Math.sin(time * 0.5) * 0.3;
  const lookTarget = new THREE.Vector3(
    pathLook.x + sway * 0.3,
    pathLook.y + Math.sin(time * 0.3) * 0.1,
    pathLook.z
  );
  camera.lookAt(lookTarget);

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
  // Update progress bar
  const bar = document.querySelector('.progress-bar-fill');
  if (bar) bar.style.width = (targetProgress * 100) + '%';
});

// === SCROLL PROGRESS BAR ===
const bar = document.createElement('div');
bar.className = 'progress-bar-fill';
bar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:2px;background:linear-gradient(90deg,#c8a97e,#e8c99e);z-index:1000;transition:width 0.1s ease';
document.body.appendChild(bar);

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
