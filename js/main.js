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
const counterMat = new THREE.MeshStandardMaterial({
  map: genDarkWood(),
  roughness: 0.5,
  metalness: 0.1,
});
const counter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 1), counterMat);
counter.position.set(0, 0.55, 4.5);
counter.castShadow = true;
counter.receiveShadow = true;
scene.add(counter);

const counterTopMat = new THREE.MeshStandardMaterial({
  map: genMarble(512),
  roughness: 0.15,
  metalness: 0.1,
});
const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.06, 1.2), counterTopMat);
counterTop.position.set(0, 1.11, 4.5);
counterTop.castShadow = true;
scene.add(counterTop);

// counter front panel
const counterFront = new THREE.Mesh(
  new THREE.BoxGeometry(3.5, 0.15, 0.03),
  new THREE.MeshStandardMaterial({ color: 0xc8a97e, roughness: 0.3, metalness: 0.4 })
);
counterFront.position.set(0, 1.0, 5.01);
scene.add(counterFront);

updateLoading(45);

// === DINING TABLES ===
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

function createTable(x, z) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.6, 0.65, 8),
    tableWood
  );
  leg.position.set(x, 0.325, z);
  leg.castShadow = true; leg.receiveShadow = true;
  scene.add(leg);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.06, 12),
    tableTopMat
  );
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

  // wine glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xccccdd,
    roughness: 0.05,
    metalness: 0,
    transparent: true,
    opacity: 0.4,
    clearcoat: 1,
  });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), glassMat);
  stem.position.set(x + 0.15, 0.77, z + 0.1);
  scene.add(stem);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), glassMat);
  bowl.position.set(x + 0.15, 0.84, z + 0.1);
  bowl.scale.y = 0.6;
  scene.add(bowl);
}

function createChair(x, z, rot) {
  const grp = new THREE.Group();
  grp.position.set(x, 0, z);
  grp.rotation.y = rot || 0;

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), chairFab);
  seat.position.set(0, 0.22, 0);
  seat.castShadow = true;
  grp.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.03), chairFab);
  back.position.set(0, 0.4, -0.2);
  back.castShadow = true;
  grp.add(back);

  for (let lx of [-0.17, 0.17]) {
    for (let lz of [-0.17, 0.17]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.2, 6), chairFrame);
      leg.position.set(lx, 0.1, lz);
      leg.castShadow = true;
      grp.add(leg);
    }
  }

  scene.add(grp);
}

const tablePositions = [];
for (let i = -1; i <= 1; i++) {
  for (let j = 0; j <= 2; j++) {
    tablePositions.push({ x: i * 2.8, z: j * 2.5 });
  }
}
tablePositions.forEach(({ x, z }) => {
  createTable(x, z);
  createChair(x + 0.55, z + 0.45, 0);
  createChair(x - 0.55, z - 0.45, Math.PI);
  createChair(x + 0.55, z - 0.45, Math.PI / 2);
  createChair(x - 0.55, z + 0.45, -Math.PI / 2);
});

updateLoading(60);

// === CHANDELIERS ===
function createChandelier(x, z) {
  const mat = new THREE.MeshStandardMaterial({
    map: genMetal(128, '#8a7a5a'),
    roughness: 0.3,
    metalness: 0.8,
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6), mat);
  pole.position.set(x, 2.8, z);
  pole.castShadow = true;
  scene.add(pole);

  const armCount = 4;
  for (let i = 0; i < armCount; i++) {
    const angle = (i / armCount) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 4), mat);
    arm.position.set(x + Math.cos(angle) * 0.15, 2.75, z + Math.sin(angle) * 0.15);
    arm.rotation.z = Math.cos(angle) * 0.3;
    arm.rotation.x = Math.sin(angle) * 0.3;
    scene.add(arm);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffeecc,
        emissive: 0xffa500,
        emissiveIntensity: 0.5,
      })
    );
    bulb.position.set(
      x + Math.cos(angle) * 0.3,
      2.7,
      z + Math.sin(angle) * 0.3
    );
    scene.add(bulb);
  }

  const light = new THREE.PointLight(0xffa500, 0.5, 5);
  light.position.set(x, 2.6, z);
  scene.add(light);
}

createChandelier(-2.8, 1.25);
createChandelier(2.8, 1.25);
createChandelier(0, 1.25);
createChandelier(-2.8, -1.25);
createChandelier(2.8, -1.25);

updateLoading(75);

// === KITCHEN PARTITION (glass) ===
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xaabbcc,
  transparent: true,
  opacity: 0.2,
  roughness: 0.05,
  metalness: 0,
  clearcoat: 0.5,
  side: THREE.DoubleSide,
});
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
