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

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0806);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 2, 10);
camera.lookAt(0, 2, 0);

// === LIGHTS ===
const ambient = new THREE.AmbientLight(0x404060, 0.3);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0xffe4b5, 1.2);
mainLight.position.set(5, 10, 8);
mainLight.castShadow = true;
scene.add(mainLight);

const fill = new THREE.DirectionalLight(0x8888ff, 0.2);
fill.position.set(-5, 3, -5);
scene.add(fill);

// === PLACEHOLDER FLOOR ===
const floorGeo = new THREE.PlaneGeometry(20, 30);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x2a1f14,
  roughness: 0.8,
  metalness: 0.05,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

updateLoading(20);

// === PLACEHOLDER WALLS ===
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.9, side: THREE.DoubleSide });
[[0, 0, 10], [0, 0, -10], [-10, 0, 0], [10, 0, 0]].forEach(([x, y, z], i) => {
  const w = i < 2 ? new THREE.PlaneGeometry(20, 6) : new THREE.PlaneGeometry(20, 6);
  const wall = new THREE.Mesh(w, wallMat);
  wall.position.set(x, 3, z);
  if (Math.abs(x) === 10) wall.rotation.y = Math.PI / 2;
  wall.receiveShadow = true;
  scene.add(wall);
});

// === PLACEHOLDER COUNTER ===
const counterMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.6 });
const counter = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1), counterMat);
counter.position.set(0, 0.6, 4);
counter.castShadow = true;
counter.receiveShadow = true;
scene.add(counter);

const counterTop = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, 0.06, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.2, metalness: 0.3 })
);
counterTop.position.set(0, 1.23, 4);
counterTop.castShadow = true;
scene.add(counterTop);

updateLoading(40);

// === PLACEHOLDER TABLES ===
function createTable(x, z) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.7 });
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.7, 8), mat);
  t.position.set(x, 0.35, z);
  t.castShadow = true; t.receiveShadow = true;
  scene.add(t);
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.5 })
  );
  top.position.set(x, 0.73, z);
  top.castShadow = true;
  scene.add(top);
}

function createChair(x, z, rot) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), mat);
  c.position.set(x, 0.175, z);
  c.rotation.y = rot || 0;
  c.castShadow = true;
  scene.add(c);
}

for (let i = -1; i <= 1; i++) {
  for (let j = 0; j <= 2; j++) {
    const x = i * 2.5;
    const z = j * 2.5;
    createTable(x, z);
    createChair(x + 0.5, z + 0.4, 0);
    createChair(x - 0.5, z - 0.4, Math.PI);
    createChair(x + 0.5, z - 0.4, Math.PI / 2);
    createChair(x - 0.5, z + 0.4, -Math.PI / 2);
  }
}

updateLoading(60);

// === PLACEHOLDER LAMPS ===
function createLamp(x, z) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.7 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.8, 6), mat);
  pole.position.set(x, 1.4, z);
  pole.castShadow = true;
  scene.add(pole);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffeecc, emissive: 0xffa500, emissiveIntensity: 0.3 })
  );
  bulb.position.set(x, 2.9, z);
  scene.add(bulb);
  const light = new THREE.PointLight(0xffa500, 0.3, 4);
  light.position.set(x, 2.9, z);
  scene.add(light);
}

createLamp(-2, 2);
createLamp(2, 2);
createLamp(-2, -2);
createLamp(2, -2);

updateLoading(80);

// === RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === ANIMATION ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

updateLoading(100);
console.log('The Grand Resort - Three.js 3D Scene');
