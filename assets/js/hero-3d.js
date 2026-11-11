// Tara Tech Arcade — 3D hero background (Three.js, hub page only).
// No build step: loaded as an ES module via the import map in index.html.
// Fails soft: if WebGL is unavailable the canvas stays hidden and the
// page works exactly as before. Respects prefers-reduced-motion.
import * as THREE from "three";

const COLORS = [0x2f7bff, 0xffc531, 0x3ddc84, 0xff4d5e, 0xeef3fa];

export function initHero3D(canvas) {
  if (!canvas) return false;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    return false;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.innerWidth < 560;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 8, 6);
  scene.add(key);
  const gold = new THREE.PointLight(0xffc531, 30, 30);
  gold.position.set(-6, -3, 4);
  scene.add(gold);

  const group = new THREE.Group();
  scene.add(group);

  const geos = [
    new THREE.IcosahedronGeometry(0.9, 0),
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.TorusGeometry(0.65, 0.28, 12, 24),
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.TetrahedronGeometry(1, 0),
  ];
  const floaters = [];
  const count = small ? 9 : 14;
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS[i % COLORS.length],
      flatShading: true,
      roughness: 0.35,
      metalness: 0.15,
      transparent: true,
      opacity: 0.92,
    });
    const mesh = new THREE.Mesh(geos[i % geos.length], mat);
    mesh.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 - 1);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      baseY: mesh.position.y,
      bob: 0.4 + Math.random() * 0.6,
      speed: 0.3 + Math.random() * 0.7,
      rx: (Math.random() - 0.5) * 0.008,
      ry: (Math.random() - 0.5) * 0.012,
      phase: Math.random() * Math.PI * 2,
    };
    group.add(mesh);
    floaters.push(mesh);
  }

  // Starfield / dust particles.
  const pCount = small ? 200 : 350;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 26;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const points = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0x93a5bd, size: 0.07, transparent: true, opacity: 0.7 })
  );
  scene.add(points);

  // Click / tap burst: a ring of small tetrahedra flying out from the tap.
  const bursts = [];
  const burstGeo = new THREE.TetrahedronGeometry(0.16, 0);
  function spawnBurst(nx, ny) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(burstGeo, mat);
      const a = (i / 18) * Math.PI * 2 + Math.random() * 0.5;
      const v = 2 + Math.random() * 3;
      m.position.set(nx * 9, ny * 5, 1);
      m.userData = { vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 };
      scene.add(m);
      bursts.push(m);
    }
  }

  let targetRX = 0, targetRY = 0, pointerX = 0, pointerY = 0;
  function onMove(x, y) {
    pointerX = (x / window.innerWidth) * 2 - 1;
    pointerY = -((y / window.innerHeight) * 2 - 1);
    targetRY = pointerX * 0.35;
    targetRX = pointerY * 0.2;
  }
  window.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener("pointerdown", (e) => {
    onMove(e.clientX, e.clientY);
    spawnBurst(pointerX, pointerY);
  }, { passive: true });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    const t = clock.getElapsedTime();
    group.rotation.y += (targetRY - group.rotation.y) * 0.05;
    group.rotation.x += (targetRX - group.rotation.x) * 0.05;
    for (const m of floaters) {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y = m.userData.baseY + Math.sin(t * m.userData.speed + m.userData.phase) * m.userData.bob;
    }
    points.rotation.y = t * 0.02;
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.userData.life -= 0.02;
      b.position.x += b.userData.vx * 0.03;
      b.position.y += b.userData.vy * 0.03;
      b.rotation.x += 0.1;
      b.material.opacity = Math.max(0, b.userData.life);
      if (b.userData.life <= 0) {
        scene.remove(b);
        bursts.splice(i, 1);
      }
    }
    renderer.render(scene, camera);
    if (!reduced) raf = requestAnimationFrame(frame);
  }

  // One static frame for reduced-motion users, then stop.
  frame();
  if (reduced) cancelAnimationFrame(raf);

  document.addEventListener("visibilitychange", () => {
    if (reduced) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else { clock.getDelta(); raf = requestAnimationFrame(frame); }
  });
  return true;
}

// Card tilt: subtle 3D tilt on game cards, mouse/trackpad only.
export function initCardTilt() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".card:not(.soon)").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}
