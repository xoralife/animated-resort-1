// === LOADING ===
const loadingScreen = document.getElementById('loading-screen');
const loaderFill = document.querySelector('.loader-fill');
let loadProgress = 0;

function updateLoading(p) {
  loadProgress = Math.min(p, 100);
  loaderFill.style.width = loadProgress + '%';
  if (loadProgress >= 100) {
    setTimeout(() => loadingScreen.classList.add('hidden'), 400);
  }
}

// === THREE.JS ===
const canvas = document.getElementById('resort-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 0);

// === GENERATE PANORAMA TEXTURES ===
function generatePanorama(sceneData) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  const { bg, floor, ceiling, elements, lights } = sceneData;

  // Sky gradient
  const grad = ctx.createRadialGradient(512, 300, 0, 512, 256, 512);
  grad.addColorStop(0, bg.top);
  grad.addColorStop(0.6, bg.mid);
  grad.addColorStop(1, bg.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Floor (bottom portion)
  const floorGrad = ctx.createLinearGradient(0, 340, 0, 512);
  floorGrad.addColorStop(0, floor.top);
  floorGrad.addColorStop(1, floor.bottom);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 340, 1024, 172);

  // Ceiling (top portion)
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, 100);
  ceilGrad.addColorStop(0, ceiling.top);
  ceilGrad.addColorStop(1, ceiling.bottom);
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(0, 0, 1024, 100);

  // Floor line
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.lineTo(1024, 340);
  ctx.stroke();

  // Floor tiles pattern
  for (let i = 0; i < 50; i++) {
    const tx = Math.random() * 1024;
    const ty = 340 + Math.random() * 172;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
    ctx.fillRect(tx, ty, 15 + Math.random() * 20, 1);
  }

  // Elements (tables, counters, etc.)
  elements.forEach(el => {
    const { type, x, y, w, h, color, blur } = el;
    ctx.save();
    if (blur) {
      ctx.shadowColor = 'transparent';
      ctx.filter = `blur(${blur}px)`;
    }
    ctx.fillStyle = color;
    ctx.globalAlpha = el.alpha || 0.5;
    if (type === 'rect') {
      ctx.fillRect(x, y, w, h);
    } else if (type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'arc') {
      ctx.beginPath();
      ctx.arc(x, y, w, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Lights (glows)
  lights.forEach(l => {
    const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    grad.addColorStop(0, l.color);
    grad.addColorStop(0.3, l.mid);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

// === SCENE DEFINITIONS ===
function genEls(fn) { const a = []; fn(a); return a; }

const scenes = [
  {
    name: 'Reception',
    bg: { top: '#1a1410', mid: '#2a2018', bottom: '#3a2a1a' },
    floor: { top: '#2a1f14', bottom: '#1a140e' },
    ceiling: { top: '#0a0806', bottom: '#1a1410' },
    elements: [
      { type: 'rect', x: 430, y: 280, w: 160, h: 60, color: '#3d2b1f', alpha: 0.7 },
      { type: 'rect', x: 425, y: 270, w: 170, h: 8, color: '#c8a97e', alpha: 0.6 },
      { type: 'arc', x: 512, y: 120, w: 30, color: '#ffdd88', alpha: 0.15, blur: 20 },
      { type: 'rect', x: 100, y: 120, w: 60, h: 180, color: '#2a1f14', alpha: 0.5, blur: 2 },
      { type: 'rect', x: 864, y: 120, w: 60, h: 180, color: '#2a1f14', alpha: 0.5, blur: 2 },
      { type: 'rect', x: 480, y: 120, w: 64, h: 200, color: '#1a1410', alpha: 0.6 },
      { type: 'rect', x: 484, y: 124, w: 56, h: 192, color: '#3a2a1a', alpha: 0.3 },
      { type: 'rect', x: 200, y: 310, w: 40, h: 30, color: '#5c4033', alpha: 0.6 },
      { type: 'arc', x: 220, y: 300, w: 8, color: '#ff6b6b', alpha: 0.4, blur: 3 },
      { type: 'rect', x: 760, y: 310, w: 40, h: 30, color: '#5c4033', alpha: 0.6 },
      { type: 'arc', x: 780, y: 300, w: 8, color: '#ff6b6b', alpha: 0.4, blur: 3 },
    ],
    lights: [
      { x: 512, y: 100, r: 150, color: 'rgba(255,220,100,0.4)', mid: 'rgba(255,220,100,0.15)' },
      { x: 200, y: 100, r: 80, color: 'rgba(255,200,80,0.3)', mid: 'rgba(255,200,80,0.1)' },
      { x: 824, y: 100, r: 80, color: 'rgba(255,200,80,0.3)', mid: 'rgba(255,200,80,0.1)' },
    ]
  },
  {
    name: 'Dining Hall',
    bg: { top: '#1a1410', mid: '#2a2218', bottom: '#3a3220' },
    floor: { top: '#3a2a1a', bottom: '#1a140e' },
    ceiling: { top: '#0a0806', bottom: '#1a1410' },
    elements: [
      { type: 'arc', x: 512, y: 90, w: 50, color: '#ffdd88', alpha: 0.2, blur: 30 },
      { type: 'rect', x: 170, y: 290, w: 50, h: 30, color: '#5c4033', alpha: 0.5 },
      { type: 'rect', x: 370, y: 290, w: 50, h: 30, color: '#5c4033', alpha: 0.5 },
      { type: 'rect', x: 570, y: 290, w: 50, h: 30, color: '#5c4033', alpha: 0.5 },
      { type: 'rect', x: 770, y: 290, w: 50, h: 30, color: '#5c4033', alpha: 0.5 },
      { type: 'rect', x: 270, y: 250, w: 50, h: 30, color: '#5c4033', alpha: 0.4 },
      { type: 'rect', x: 470, y: 250, w: 50, h: 30, color: '#5c4033', alpha: 0.4 },
      { type: 'rect', x: 670, y: 250, w: 50, h: 30, color: '#5c4033', alpha: 0.4 },
      ...genEls(arr => { for (let i = 0; i < 12; i++) { arr.push({ type: 'rect', x: 150 + Math.random() * 720, y: 260 + Math.random() * 50, w: 18, h: 12, color: '#4a3520', alpha: 0.3 }); } }),
      { type: 'rect', x: 100, y: 140, w: 80, h: 120, color: '#1a2a3a', alpha: 0.4 },
      { type: 'rect', x: 844, y: 140, w: 80, h: 120, color: '#1a2a3a', alpha: 0.4 },
    ],
    lights: [
      { x: 512, y: 80, r: 200, color: 'rgba(255,220,100,0.5)', mid: 'rgba(255,220,100,0.15)' },
      { x: 200, y: 80, r: 100, color: 'rgba(255,200,80,0.3)', mid: 'rgba(255,200,80,0.1)' },
      { x: 824, y: 80, r: 100, color: 'rgba(255,200,80,0.3)', mid: 'rgba(255,200,80,0.1)' },
      { x: 350, y: 280, r: 60, color: 'rgba(255,180,60,0.15)', mid: 'rgba(255,180,60,0.05)' },
      { x: 674, y: 280, r: 60, color: 'rgba(255,180,60,0.15)', mid: 'rgba(255,180,60,0.05)' },
    ]
  },
  {
    name: 'Kitchen',
    bg: { top: '#e8e0d8', mid: '#f0e8e0', bottom: '#d8d0c8' },
    floor: { top: '#888888', bottom: '#666666' },
    ceiling: { top: '#cccccc', bottom: '#e0d8d0' },
    elements: [
      { type: 'rect', x: 60, y: 260, w: 300, h: 80, color: '#777777', alpha: 0.6 },
      { type: 'rect', x: 60, y: 250, w: 300, h: 6, color: '#999999', alpha: 0.7 },
      { type: 'rect', x: 664, y: 260, w: 300, h: 80, color: '#777777', alpha: 0.6 },
      { type: 'rect', x: 664, y: 250, w: 300, h: 6, color: '#999999', alpha: 0.7 },
      { type: 'rect', x: 420, y: 270, w: 180, h: 60, color: '#888888', alpha: 0.6 },
      { type: 'rect', x: 420, y: 260, w: 180, h: 6, color: '#aaaaaa', alpha: 0.7 },
      { type: 'arc', x: 150, y: 265, w: 10, color: '#333333', alpha: 0.5 },
      { type: 'arc', x: 180, y: 265, w: 10, color: '#333333', alpha: 0.5 },
      { type: 'arc', x: 300, y: 150, w: 8, color: '#444444', alpha: 0.4 },
      { type: 'arc', x: 330, y: 150, w: 6, color: '#444444', alpha: 0.4 },
      { type: 'arc', x: 700, y: 150, w: 8, color: '#444444', alpha: 0.4 },
      { type: 'rect', x: 470, y: 100, w: 80, h: 120, color: '#999999', alpha: 0.5 },
      { type: 'rect', x: 475, y: 100, w: 70, h: 50, color: '#777777', alpha: 0.3 },
      { type: 'rect', x: 350, y: 160, w: 120, h: 4, color: '#888888', alpha: 0.5 },
      { type: 'rect', x: 550, y: 160, w: 120, h: 4, color: '#888888', alpha: 0.5 },
      ...genEls(arr => { for (let i = 0; i < 6; i++) { arr.push({ type: 'arc', x: 380 + i * 25, y: 158, w: 6, color: '#ffffff', alpha: 0.3 }); } }),
      ...genEls(arr => { for (let i = 0; i < 30; i++) { arr.push({ type: 'rect', x: 50 + Math.random() * 920, y: 240 + Math.random() * 18, w: 8, h: 8, color: 'rgba(200,200,200,0.15)', alpha: 0.3 }); } }),
      { type: 'ellipse', x: 512, y: 300, w: 20, h: 30, color: '#ffffff', alpha: 0.1, blur: 5 },
    ],
    lights: [
      { x: 150, y: 80, r: 80, color: 'rgba(255,255,240,0.5)', mid: 'rgba(255,255,240,0.2)' },
      { x: 512, y: 80, r: 100, color: 'rgba(255,255,240,0.6)', mid: 'rgba(255,255,240,0.2)' },
      { x: 874, y: 80, r: 80, color: 'rgba(255,255,240,0.5)', mid: 'rgba(255,255,240,0.2)' },
      { x: 512, y: 100, r: 40, color: 'rgba(255,200,100,0.4)', mid: 'rgba(255,200,100,0.1)' },
    ]
  },
  {
    name: 'Garden',
    bg: { top: '#4a7a45', mid: '#6a9a55', bottom: '#8aba65' },
    floor: { top: '#3a6b35', bottom: '#2a5a25' },
    ceiling: { top: '#5a8a50', bottom: '#7aaa60' },
    elements: [
      { type: 'rect', x: 0, y: 0, w: 1024, h: 200, color: '#3a6a8a', alpha: 0.3 },
      { type: 'arc', x: 800, y: 60, w: 100, color: '#ffeecc', alpha: 0.2, blur: 50 },
      { type: 'rect', x: 80, y: 200, w: 30, h: 140, color: '#4a3520', alpha: 0.5 },
      { type: 'arc', x: 95, y: 180, w: 50, color: '#2d5a27', alpha: 0.5 },
      { type: 'rect', x: 900, y: 220, w: 25, h: 120, color: '#4a3520', alpha: 0.5 },
      { type: 'arc', x: 912, y: 200, w: 45, color: '#2d5a27', alpha: 0.5 },
      { type: 'rect', x: 0, y: 280, w: 30, h: 60, color: '#5c4033', alpha: 0.4 },
      ...genEls(arr => { for (let i = 0; i < 10; i++) { arr.push({ type: 'rect', x: 100 + i * 90, y: 280, w: 8, h: 60, color: '#5c4033', alpha: 0.35 }, { type: 'rect', x: 60 + i * 90, y: 300, w: 80, h: 4, color: '#5c4033', alpha: 0.3 }); } }),
      { type: 'arc', x: 200, y: 330, w: 30, color: '#3a7a35', alpha: 0.4 },
      { type: 'arc', x: 400, y: 335, w: 25, color: '#3a7a35', alpha: 0.4 },
      { type: 'arc', x: 600, y: 330, w: 28, color: '#3a7a35', alpha: 0.4 },
      { type: 'arc', x: 780, y: 335, w: 22, color: '#3a7a35', alpha: 0.4 },
      ...genEls(arr => { const colors = ['#ff6b6b', '#ffdd44', '#ff88cc', '#ff9944']; for (let i = 0; i < 12; i++) { arr.push({ type: 'arc', x: 150 + Math.random() * 720, y: 310 + Math.random() * 30, w: 3 + Math.random() * 2, color: colors[i % 4], alpha: 0.4, blur: 1 }); } }),
      { type: 'ellipse', x: 220, y: 370, w: 15, h: 8, color: '#888888', alpha: 0.3 },
      { type: 'ellipse', x: 300, y: 378, w: 18, h: 8, color: '#888888', alpha: 0.3 },
      { type: 'ellipse', x: 380, y: 370, w: 14, h: 7, color: '#888888', alpha: 0.3 },
      { type: 'ellipse', x: 460, y: 378, w: 16, h: 8, color: '#888888', alpha: 0.3 },
      { type: 'ellipse', x: 540, y: 370, w: 17, h: 8, color: '#888888', alpha: 0.3 },
      { type: 'rect', x: 640, y: 310, w: 40, h: 20, color: '#5c4033', alpha: 0.5 },
      { type: 'arc', x: 660, y: 290, w: 35, color: '#cc6644', alpha: 0.4 },
      { type: 'rect', x: 658, y: 280, w: 4, h: 30, color: '#5c4033', alpha: 0.5 },
      ...genEls(arr => { for (let i = 0; i < 4; i++) { arr.push({ type: 'arc', x: 100 + i * 250, y: 40 + Math.random() * 40, w: 30 + Math.random() * 20, color: 'rgba(255,255,255,0.2)', alpha: 0.2, blur: 10 }); } }),
    ],
    lights: [
      { x: 800, y: 50, r: 200, color: 'rgba(255,240,200,0.5)', mid: 'rgba(255,240,200,0.15)' },
      { x: 400, y: 320, r: 60, color: 'rgba(255,220,100,0.15)', mid: 'rgba(255,220,100,0.05)' },
      { x: 660, y: 290, r: 40, color: 'rgba(255,200,100,0.2)', mid: 'rgba(255,200,100,0.08)' },
    ]
  }
];

// === CREATE SPHERE ===
const textures = scenes.map(s => generatePanorama(s));
const sphereGeo = new THREE.SphereGeometry(30, 64, 40);
const sphereMat = new THREE.MeshBasicMaterial({ map: textures[0], side: THREE.BackSide });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);

updateLoading(60);

// === VARIABLES ===
let currentScene = 0;
let targetScene = 0;
let transitionProgress = 1;
let isTransitioning = false;
let scrollProgress = 0;
let targetScrollProgress = 0;

// === SCENE INDICATOR ===
const dots = document.querySelectorAll('.scene-dot');
const labelText = document.querySelector('.scene-label-text');

function updateSceneUI(index) {
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  labelText.textContent = scenes[index].name;
}

// === SMOOTH SCENE TRANSITION ===
function transitionToScene(toIndex) {
  if (toIndex === currentScene || isTransitioning) return;
  isTransitioning = true;
  targetScene = toIndex;
  transitionProgress = 0;
}

// === MOUSE DRAG TO LOOK ===
let isDragging = false;
let prevX = 0;
let prevY = 0;
let rotX = 0;
let rotY = 0;
let targetRotX = 0;
let targetRotY = 0;
let autoRotate = true;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  prevX = e.clientX;
  prevY = e.clientY;
  autoRotate = false;
  canvas.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevX;
  const dy = e.clientY - prevY;
  targetRotX -= dx * 0.005;
  targetRotY = Math.max(-1, Math.min(1, targetRotY - dy * 0.003));
  prevX = e.clientX;
  prevY = e.clientY;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.style.cursor = 'grab';

// Touch support
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  isDragging = true;
  prevX = t.clientX;
  prevY = t.clientY;
  autoRotate = false;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || !e.touches[0]) return;
  const t = e.touches[0];
  const dx = t.clientX - prevX;
  const dy = t.clientY - prevY;
  targetRotX -= dx * 0.005;
  targetRotY = Math.max(-1, Math.min(1, targetRotY - dy * 0.003));
  prevX = t.clientX;
  prevY = t.clientY;
}, { passive: true });

canvas.addEventListener('touchend', () => { isDragging = false; }, { passive: true });

// === RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === SCROLL ===
let lastScrollTime = 0;
const scrollDebounce = 600;
window.addEventListener('wheel', (e) => {
  const now = Date.now();
  if (now - lastScrollTime < scrollDebounce) return;
  const dir = e.deltaY > 0 ? 1 : -1;
  const next = Math.max(0, Math.min(targetScene + dir, scenes.length - 1));
  if (next !== currentScene && !isTransitioning) {
    targetScene = next;
    transitionToScene(targetScene);
    lastScrollTime = now;
  }
}, { passive: true });

// Touch scroll
let touchStartY = 0;
let lastTouchTime = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchTime < scrollDebounce) return;
  if (!isDragging) {
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dy) > 30) {
      const dir = dy < 0 ? 1 : -1;
      const next = Math.max(0, Math.min(targetScene + dir, scenes.length - 1));
      if (next !== currentScene && !isTransitioning) {
        targetScene = next;
        transitionToScene(targetScene);
        lastTouchTime = now;
      }
    }
  }
}, { passive: true });

// === SECTIONS ===
const sections = document.querySelectorAll('.section');
let currentSection = 0;

function activateSection(index) {
  sections.forEach((s, i) => s.classList.toggle('active', i === index));
  currentSection = index;
  // Nav links
  document.querySelectorAll('.nav-link').forEach((l, i) => l.classList.toggle('active-link', i === index));
}

activateSection(0);

// === NAV LINKS ===
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    // Close mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks.classList.contains('open')) {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }
    const id = link.getAttribute('href').replace('#', '');
    const idx = Array.from(sections).findIndex(s => s.id === id);
    if (idx >= 0) {
      targetScene = Math.min(idx, scenes.length - 1);
      if (targetScene !== currentScene) transitionToScene(targetScene);
      else activateSection(targetScene);
    }
  });
});

// === MOBILE MENU ===
document.querySelector('.menu-toggle')?.addEventListener('click', function() {
  this.classList.toggle('open');
  document.querySelector('.nav-links').classList.toggle('open');
});

// === ANIMATION LOOP ===
function animate() {
  requestAnimationFrame(animate);

  // Auto rotate when idle
  if (autoRotate) targetRotX += 0.002;

  // Smooth rotation
  rotX += (targetRotX - rotX) * 0.08;
  rotY += (targetRotY - rotY) * 0.08;
  sphere.rotation.x = rotY;
  sphere.rotation.y = rotX;

  // Scene transition
  if (isTransitioning) {
    transitionProgress += 0.02;
    if (transitionProgress >= 1) {
      transitionProgress = 1;
      isTransitioning = false;
      currentScene = targetScene;
      sphereMat.map = textures[currentScene];
      sphereMat.needsUpdate = true;
      updateSceneUI(currentScene);
      activateSection(Math.min(currentScene, sections.length - 1));
    } else {
      // Cross-fade: show both textures
      const ease = transitionProgress < 0.5
        ? 2 * transitionProgress * transitionProgress
        : -1 + (4 - 2 * transitionProgress) * transitionProgress;
      sphereMat.opacity = 1 - ease;
      sphereMat.transparent = true;
    }
  } else {
    sphereMat.opacity = 1;
    sphereMat.transparent = false;
  }

  renderer.render(scene, camera);
}

animate();
updateSceneUI(0);
updateLoading(100);

console.log('The Grand Resort - 360° Experience');
