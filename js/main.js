// === LOADING ===
const loadingScreen = document.getElementById('loading-screen');
const loaderFill = document.querySelector('.loader-fill');
let loadProgress = 0;

function updateLoading(p) {
  loadProgress = Math.min(p, 100);
  loaderFill.style.width = loadProgress + '%';
  if (loadProgress >= 100) {
    setTimeout(() => loadingScreen.classList.add('hidden'), 500);
  }
}

// === THREE.JS SCENE SETUP ===
const canvas = document.getElementById('scene-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = genSky();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 2, 12);
camera.lookAt(0, 1.5, 0);

function sceneReady() { updateLoading(100); }

// === LIGHTS ===
const ambient = new THREE.AmbientLight(0x404060, 0.4);
scene.add(ambient);

const warmAmbient = new THREE.AmbientLight(0xff8844, 0.1);
scene.add(warmAmbient);

const mainLight = new THREE.DirectionalLight(0xffe4b5, 1.0);
mainLight.position.set(8, 12, 6);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
const d = 12;
mainLight.shadow.camera.left = -d;
mainLight.shadow.camera.right = d;
mainLight.shadow.camera.top = d;
mainLight.shadow.camera.bottom = -d;
mainLight.shadow.camera.near = 1;
mainLight.shadow.camera.far = 20;
scene.add(mainLight);

const fill = new THREE.DirectionalLight(0x8888ff, 0.15);
fill.position.set(-5, 3, -5);
scene.add(fill);

updateLoading(15);

// === FLOOR ===
const floorMat = new THREE.MeshStandardMaterial({
  map: genWoodFloor(),
  roughness: 0.7,
  metalness: 0.05,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 30), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const floorTrim = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.04, 0.3),
  new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 })
);
floorTrim.position.set(0, 0.02, -8);
scene.add(floorTrim);

updateLoading(25);

// === WALLS ===
const wallMat = new THREE.MeshStandardMaterial({
  map: genWallpaper(),
  roughness: 0.9,
  side: THREE.DoubleSide,
});
const wallPositions = [
  { pos: [0, 3, 10], rot: 0 },
  { pos: [0, 3, -10], rot: 0 },
  { pos: [-10, 3, 0], rot: Math.PI / 2 },
  { pos: [10, 3, 0], rot: Math.PI / 2 },
];
wallPositions.forEach(({ pos, rot }) => {
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
  wall.position.set(pos[0], pos[1], pos[2]);
  wall.rotation.y = rot;
  wall.receiveShadow = true;
  scene.add(wall);
});

// baseboards
for (let i = -10; i <= 10; i += 1.5) {
  const bb = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.15, 20),
    new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 })
  );
  bb.position.set(i, 0.075, 10);
  scene.add(bb);
}

updateLoading(35);

// === RECEPTION COUNTER ===
function buildReception() {
  const woodMat = new THREE.MeshStandardMaterial({
    map: genDarkWood(),
    roughness: 0.5,
    metalness: 0.1,
  });
  const marbleMat = new THREE.MeshStandardMaterial({
    map: genMarble(512),
    roughness: 0.15,
    metalness: 0.1,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e,
    roughness: 0.3,
    metalness: 0.4,
  });

  // main counter body
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.9, 1.2), woodMat);
  body.position.set(0, 0.45, 4.5);
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);

  // upper tier (raised section)
  const upper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.8), woodMat);
  upper.position.set(0.8, 0.9, 4.5);
  upper.castShadow = true;
  scene.add(upper);

  // marble top
  const top = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 1.4), marbleMat);
  top.position.set(0, 1.125, 4.5);
  top.castShadow = true;
  scene.add(top);

  // gold trim strip
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.04, 0.04), trimMat);
  trim.position.set(0, 0.9, 5.11);
  scene.add(trim);
  const trim2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.04, 0.04), trimMat);
  trim2.position.set(0, 0.9, 3.89);
  scene.add(trim2);

  // decorative front panel
  for (let i = -1.4; i <= 1.4; i += 1.4) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.7 })
    );
    panel.position.set(i, 0.5, 5.11);
    scene.add(panel);
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.02, 0.05),
      trimMat
    );
    border.position.set(i, 0.3, 5.12);
    scene.add(border);
    border.position.set(i, 0.7, 5.12);
    scene.add(border);
  }

  // bell on counter
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e,
    roughness: 0.2,
    metalness: 0.7,
  });
  const bellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.02, 12), bellMat);
  bellBase.position.set(-1.1, 1.16, 4.3);
  scene.add(bellBase);
  const bellDome = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), bellMat);
  bellDome.position.set(-1.1, 1.2, 4.3);
  bellDome.scale.y = 0.5;
  scene.add(bellDome);

  // small vase with flower
  const vaseMat = new THREE.MeshStandardMaterial({
    color: 0x8a7a6a,
    roughness: 0.3,
    metalness: 0.2,
  });
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.1, 8), vaseMat);
  vase.position.set(1.4, 1.15, 4.3);
  scene.add(vase);
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xe8d4c8, roughness: 0.8 });
  for (let fi = 0; fi < 4; fi++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), flowerMat);
    f.position.set(1.4 + (Math.random() - 0.5) * 0.06, 1.25 + Math.random() * 0.08, 4.3 + (Math.random() - 0.5) * 0.06);
    scene.add(f);
  }

  // wall sign behind counter
  const signMat = new THREE.MeshStandardMaterial({ color: 0xc8a97e, roughness: 0.2, metalness: 0.5 });
  const signBg = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.02), signMat);
  signBg.position.set(0, 2.2, 5.51);
  scene.add(signBg);
  const signText = new THREE.Mesh(
    new THREE.BoxGeometry(0.001, 0.001, 0.001),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  signText.position.set(0, 2.2, 5.53);
  scene.add(signText);
}

buildReception();

// rug in front of counter
const rugMat = new THREE.MeshStandardMaterial({
  map: genFabric(128, '#8a1a1a', '#6a0a0a'),
  roughness: 0.9,
});
const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), rugMat);
rug.rotation.x = -Math.PI / 2;
rug.position.set(0, 0.002, 3.5);
rug.receiveShadow = true;
scene.add(rug);
const rugTrim = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 1.6),
  new THREE.MeshStandardMaterial({ color: 0xc8a97e, roughness: 0.3, side: THREE.DoubleSide })
);
rugTrim.rotation.x = -Math.PI / 2;
rugTrim.position.set(0, 0.001, 3.5);
scene.add(rugTrim);

updateLoading(45);

// === DINING HALL ===
const tableWood = new THREE.MeshStandardMaterial({
  map: genDarkWood(256),
  roughness: 0.6,
  metalness: 0.05,
});
const tableTopMat = new THREE.MeshStandardMaterial({
  map: genMarble(256),
  roughness: 0.2,
  metalness: 0.1,
});
const chairFab = new THREE.MeshStandardMaterial({
  map: genFabric(256, '#6b3a2e', '#4a2d22'),
  roughness: 0.9,
});
const chairFrame = new THREE.MeshStandardMaterial({
  map: genMetal(128, '#5a4a3a'),
  roughness: 0.4,
  metalness: 0.6,
});
const goldMat = new THREE.MeshStandardMaterial({
  color: 0xc8a97e,
  roughness: 0.2,
  metalness: 0.7,
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xccccdd,
  roughness: 0.05,
  metalness: 0,
  transparent: true,
  opacity: 0.4,
  clearcoat: 1,
});

function createTable(x, z) {
  // pedestal base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.08, 8), tableWood);
  base.position.set(x, 0.04, z);
  base.receiveShadow = true;
  scene.add(base);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.55, 8), tableWood);
  pillar.position.set(x, 0.355, z);
  pillar.castShadow = true;
  scene.add(pillar);

  // table top
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 16), tableTopMat);
  top.position.set(x, 0.68, z);
  top.castShadow = true;
  scene.add(top);

  // plate
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.3 })
  );
  plate.position.set(x, 0.72, z);
  scene.add(plate);

  // napkin on plate
  const napkin = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.01, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 })
  );
  napkin.position.set(x, 0.735, z);
  scene.add(napkin);

  // fork
  const forkMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1, metalness: 0.8 });
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.002, 0.1), forkMat);
  fork.position.set(x - 0.12, 0.73, z + 0.05);
  scene.add(fork);

  // knife
  const knife = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.002, 0.1), forkMat);
  knife.position.set(x + 0.12, 0.73, z + 0.05);
  scene.add(knife);

  // wine glass
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), glassMat);
  stem.position.set(x + 0.2, 0.77, z - 0.05);
  scene.add(stem);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), glassMat);
  bowl.position.set(x + 0.2, 0.84, z - 0.05);
  bowl.scale.y = 0.6;
  scene.add(bowl);

  // water glass
  const wg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.1, 8), glassMat);
  wg.position.set(x - 0.2, 0.78, z - 0.05);
  scene.add(wg);
}

function createChair(x, z, rot) {
  const grp = new THREE.Group();
  grp.position.set(x, 0, z);
  grp.rotation.y = rot || 0;

  // seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.38), chairFab);
  seat.position.set(0, 0.22, 0);
  seat.castShadow = true;
  grp.add(seat);

  // seat base
  const sBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.35), tableWood);
  sBase.position.set(0, 0.19, 0);
  grp.add(sBase);

  // curved back
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.03), chairFab);
  back.position.set(0, 0.42, -0.18);
  back.castShadow = true;
  grp.add(back);

  // back top rail
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.02), tableWood);
  rail.position.set(0, 0.57, -0.19);
  grp.add(rail);

  // armrests
  for (let side of [-0.2, 0.2]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.25), tableWood);
    arm.position.set(side, 0.35, -0.08);
    grp.add(arm);
  }

  // legs
  for (let lx of [-0.17, 0.17]) {
    for (let lz of [-0.17, 0.17]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.19, 6), chairFrame);
      leg.position.set(lx, 0.095, lz);
      leg.castShadow = true;
      grp.add(leg);
    }
  }

  scene.add(grp);
}

// place tables
for (let i = -1; i <= 1; i++) {
  for (let j = 0; j <= 2; j++) {
    const x = i * 2.8;
    const z = j * 2.5;
    createTable(x, z);
    createChair(x + 0.55, z + 0.45, 0);
    createChair(x - 0.55, z - 0.45, Math.PI);
    createChair(x + 0.55, z - 0.45, Math.PI / 2);
    createChair(x - 0.55, z + 0.45, -Math.PI / 2);
  }
}

updateLoading(55);

// === BUFFET TABLE ===
function buildBuffet() {
  const woodMat = new THREE.MeshStandardMaterial({
    map: genDarkWood(256),
    roughness: 0.5,
  });
  const buffet = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.6), woodMat);
  buffet.position.set(-5, 0.5, 3);
  buffet.castShadow = true;
  buffet.receiveShadow = true;
  scene.add(buffet);

  const buffetTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 0.05, 0.7),
    new THREE.MeshStandardMaterial({ map: genMarble(256), roughness: 0.15 })
  );
  buffetTop.position.set(-5, 1.03, 3);
  scene.add(buffetTop);

  // trays on buffet
  const trayMat = new THREE.MeshStandardMaterial({ color: 0xc8a97e, roughness: 0.3, metalness: 0.5 });
  const tray1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.02, 12), trayMat);
  tray1.position.set(-5.5, 1.05, 3.2);
  scene.add(tray1);
  const tray2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.02, 12), trayMat);
  tray2.position.set(-4.5, 1.05, 3.2);
  scene.add(tray2);
}
buildBuffet();

// === CHANDELIERS ===
function createChandelier(x, z) {
  const mat = new THREE.MeshStandardMaterial({
    map: genMetal(128, '#8a7a5a'),
    roughness: 0.3,
    metalness: 0.8,
  });

  // ceiling mount
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.1, 6), mat);
  mount.position.set(x, 2.95, z);
  scene.add(mount);

  // chain
  for (let ci = 0; ci < 3; ci++) {
    const link = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 4, 8), mat);
    link.position.set(x, 2.85 - ci * 0.08, z);
    link.rotation.x = Math.PI / 2;
    scene.add(link);
  }

  // main body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.15, 8), mat);
  body.position.set(x, 2.7, z);
  scene.add(body);

  // arms
  const armCount = 5;
  for (let i = 0; i < armCount; i++) {
    const angle = (i / armCount) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.35, 4), mat);
    arm.position.set(x + Math.cos(angle) * 0.1, 2.68, z + Math.sin(angle) * 0.1);
    arm.rotation.z = Math.cos(angle) * 0.5;
    arm.rotation.x = -Math.sin(angle) * 0.5;
    scene.add(arm);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.06, 6),
      new THREE.MeshStandardMaterial({ color: 0xffeecc, emissive: 0xffa500, emissiveIntensity: 0.4 })
    );
    candle.position.set(
      x + Math.cos(angle) * 0.35,
      2.62,
      z + Math.sin(angle) * 0.35
    );
    scene.add(candle);
  }

  const light = new THREE.PointLight(0xffa500, 0.4, 6);
  light.position.set(x, 2.6, z);
  scene.add(light);
}

createChandelier(-2.8, 1.25);
createChandelier(2.8, 1.25);
createChandelier(0, 1.25);
createChandelier(-2.8, -1.25);
createChandelier(2.8, -1.25);

// === WALL SCONCES ===
function createSconce(x, z, rotY) {
  const sMat = new THREE.MeshStandardMaterial({
    color: 0xc8a97e,
    roughness: 0.3,
    metalness: 0.6,
  });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.15, 0.06), sMat);
  arm.position.set(x, 2.0, z);
  arm.rotation.z = 0.2;
  scene.add(arm);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 6), sMat);
  cup.position.set(x, 2.0, z);
  cup.rotation.x = Math.PI / 2;
  scene.add(cup);
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffeecc, emissive: 0xffa500, emissiveIntensity: 0.6 })
  );
  flame.position.set(x, 2.05, z);
  flame.scale.y = 0.6;
  scene.add(flame);
  const sl = new THREE.PointLight(0xffa500, 0.15, 2);
  sl.position.set(x, 2.0, z);
  scene.add(sl);
}

createSconce(-4, 8.5, 0);
createSconce(4, 8.5, 0);
createSconce(-4, 5, 0);
createSconce(4, 5, 0);

// === PICTURE FRAMES ===
function createFrame(x, z, rotY) {
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc8a97e, roughness: 0.3, metalness: 0.4 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.02), frameMat);
  frame.position.set(x, 2.2, z);
  frame.rotation.y = rotY || 0;
  scene.add(frame);
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.35, 0.025),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 })
  );
  inner.position.set(x, 2.2, z);
  inner.rotation.y = rotY || 0;
  scene.add(inner);
}
createFrame(-7.5, 9.51, 0);
createFrame(7.5, 9.51, 0);

updateLoading(65);

// === KITCHEN PARTITION (glass) ===
const glass = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.5), glassMat);
glass.position.set(0, 1.25, -1.5);
scene.add(glass);

// counter in kitchen area
const kitchenCounter = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 0.6),
  new THREE.MeshStandardMaterial({ map: genMetal(128, '#888888'), roughness: 0.3, metalness: 0.7 })
);
kitchenCounter.position.set(-3, 0.5, -4.5);
kitchenCounter.castShadow = true;
kitchenCounter.receiveShadow = true;
scene.add(kitchenCounter);

updateLoading(85);

// === PLANTERS (garden) ===
function createPlanter(x, z) {
  const potMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a3a,
    roughness: 0.8,
  });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 8), potMat);
  pot.position.set(x, 0.15, z);
  pot.castShadow = true;
  pot.receiveShadow = true;
  scene.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2a5a2a,
    roughness: 0.9,
  });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 6, 6),
      leafMat
    );
    leaf.position.set(
      x + (Math.random() - 0.5) * 0.3,
      0.35 + Math.random() * 0.2,
      z + (Math.random() - 0.5) * 0.3
    );
    leaf.scale.y = 0.4 + Math.random() * 0.3;
    scene.add(leaf);
  }
}

createPlanter(-6, -3);
createPlanter(6, -3);
createPlanter(-6, -5);
createPlanter(6, -5);

updateLoading(95);

// === RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === SCENE LABEL ===
const sceneLabel = document.getElementById('scene-label');
const sceneNames = ['Reception', 'Dining Hall', 'Kitchen', 'Garden Patio'];
let currentSceneIdx = 0;

// === ANIMATION ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

sceneReady();
console.log('The Grand Resort - Three.js 3D Scene with Procedural Textures');
