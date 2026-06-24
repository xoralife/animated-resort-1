// === CANVAS TEXTURE GENERATORS ===

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// --- WOOD FLOOR ---
function genWoodFloor(size = 512) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const plankW = size / 8;
  for (let row = 0; row < 8; row++) {
    const x = row * plankW;
    const base = 80 + Math.random() * 30;
    ctx.fillStyle = `rgb(${base + 20}, ${base}, ${base - 30})`;
    ctx.fillRect(x, 0, plankW - 1, size);
    // grain lines
    for (let i = 0; i < 30; i++) {
      const gx = x + Math.random() * (plankW - 2);
      const gy = Math.random() * size;
      ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + Math.random() * 4 - 2, gy + 8 + Math.random() * 10);
      ctx.stroke();
    }
    // knots
    if (row % 2 === 0) {
      const kx = x + plankW / 2 + (Math.random() - 0.5) * 8;
      const ky = Math.random() * size;
      ctx.fillStyle = `rgba(40,30,20,${0.2 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 3 + Math.random() * 4, 4 + Math.random() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  tex.anisotropy = 4;
  return tex;
}

// --- MARBLE ---
function genMarble(size = 512) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e0d8';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 50 + Math.random() * 200;
    const angle = Math.random() * Math.PI;
    ctx.strokeStyle = `rgba(160,150,140,${0.05 + Math.random() * 0.08})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const cx = x + Math.cos(angle) * len;
    const cy = y + Math.sin(angle) * len;
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40,
      cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 40,
      cx, cy
    );
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 4;
  return tex;
}

// --- FABRIC (velvet/damask) ---
function genFabric(size = 256, color1 = '#5c3a2e', color2 = '#4a2d22') {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, size, size);
  // weave pattern
  for (let x = 0; x < size; x += 4) {
    for (let y = 0; y < size; y += 4) {
      ctx.fillStyle = (x + y) % 8 === 0 ? `rgba(0,0,0,0.06)` : `rgba(255,255,255,0.03)`;
      ctx.fillRect(x, y, 3, 3);
    }
  }
  // subtle stripes
  for (let y = 0; y < size; y += 12) {
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    ctx.fillRect(0, y, size, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// --- METAL (brushed) ---
function genMetal(size = 256, baseColor = '#888888') {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// --- TILES (checkerboard) ---
function genTiles(size = 512, tileSize = 8) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const ts = size / tileSize;
  for (let x = 0; x < tileSize; x++) {
    for (let y = 0; y < tileSize; y++) {
      const bright = (x + y) % 2 === 0 ? 220 : 200;
      ctx.fillStyle = `rgb(${bright}, ${bright - 5}, ${bright - 15})`;
      ctx.fillRect(x * ts, y * ts, ts - 0.5, ts - 0.5);
      // slight grout
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(x * ts, y * ts, ts, 1);
      ctx.fillRect(x * ts, y * ts, 1, ts);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = 4;
  return tex;
}

// --- SKY (gradient) ---
function genSky(size = 512) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.4, '#2a2a4e');
  grad.addColorStop(0.7, '#4a3a2a');
  grad.addColorStop(1, '#6a4a2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // stars
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.5 + Math.random() * 1, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// --- RECEPTION DESK WOOD (darker) ---
function genDarkWood(size = 256) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3d2817';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 50; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.05})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.02) * 2 + (Math.random() - 0.5) * 2);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 4;
  return tex;
}

// --- WALL PAPER ---
function genWallpaper(size = 256) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(0, 0, size, size);
  // damask-like pattern
  for (let x = 0; x < size; x += 40) {
    for (let y = 0; y < size; y += 40) {
      ctx.strokeStyle = 'rgba(200,169,126,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 20, y + 20, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}
