// Tara Tech Arcade — Juragan Warung! 3D isometric village (Three.js).
// Original low-poly art built from code (boxes, cylinders, spheres) in the
// style of an Indonesian warung neighbourhood: warung, houses, trees,
// market stall, road, and people who walk. No copied assets.
// Fails soft: init() returns false when WebGL is unavailable and the game
// falls back to the emoji seats. Loaded as an ES module via import map.
import * as THREE from "three";

const TABLE_POS = [
  new THREE.Vector3(-4.6, 0, 1.0),
  new THREE.Vector3(0, 0, 1.8),
  new THREE.Vector3(4.6, 0, 1.0),
];
const SPAWNS = [new THREE.Vector3(-10.5, 0, 5.6), new THREE.Vector3(10.5, 0, 5.6)];
const SHIRTS = [0x2f7bff, 0xff4d5e, 0x3ddc84, 0xff8c42, 0x9b5de5, 0xef476f, 0x06d6a0];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
const HAIRS = [0x1a1a1a, 0x3b2f2f, 0x6b4226, 0x808080, 0x2d1a0e];

function mat(color, opts) {
  return new THREE.MeshLambertMaterial(Object.assign({ color }, opts || {}));
}

function box(w, h, d, color, x, y, z, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, color, x, y, z, seg) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function ball(r, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

function textTexture(text, bg, fg, sub) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = bg; g.fillRect(0, 0, 512, 160);
  g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(6, 6, 500, 148);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 64px system-ui, sans-serif";
  g.fillText(text, 256, sub ? 62 : 80);
  if (sub) { g.font = "700 34px system-ui, sans-serif"; g.fillText(sub, 256, 122); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makePerson(shirt, skin, hair, opts) {
  opts = opts || {};
  const g = new THREE.Group();
  const legGeo = new THREE.BoxGeometry(0.16, 0.36, 0.16);
  legGeo.translate(0, -0.18, 0);
  const legL = new THREE.Mesh(legGeo, mat(0x2b3a55));
  legL.position.set(-0.11, 0.36, 0);
  const legR = new THREE.Mesh(legGeo, mat(0x2b3a55));
  legR.position.set(0.11, 0.36, 0);
  legL.castShadow = legR.castShadow = true;
  const body = box(0.52, 0.56, 0.32, shirt, 0, 0.64, 0);
  const armGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
  armGeo.translate(0, -0.2, 0);
  const armL = new THREE.Mesh(armGeo, mat(shirt));
  armL.position.set(-0.32, 0.86, 0);
  const armR = new THREE.Mesh(armGeo, mat(shirt));
  armR.position.set(0.32, 0.86, 0);
  const head = ball(0.23, skin, 0, 1.14, 0);
  const hairM = ball(0.24, hair, 0, 1.2, -0.03);
  hairM.scale.set(1, 0.75, 1);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
  );
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01;
  g.add(legL, legR, body, armL, armR, head, hairM, shadow);
  if (opts.apron) {
    const apron = box(0.4, 0.44, 0.04, 0xf5f5f5, 0, 0.62, 0.18);
    g.add(apron);
  }
  if (opts.hat) {
    const hat = cyl(0.26, 0.3, 0.1, 0xffc531, 0, 1.36, 0, 14);
    g.add(hat);
  }
  g.userData = { legL, legR, armL, armR, body, phase: Math.random() * 6, walkSpeed: 0 };
  return g;
}

function makeTree(x, z, s) {
  const g = new THREE.Group();
  g.add(cyl(0.14 * s, 0.2 * s, 0.9 * s, 0x8b5a2b, 0, 0.45 * s, 0, 8));
  const top1 = ball(0.75 * s, 0x2e9e44, 0, 1.35 * s, 0);
  const top2 = ball(0.5 * s, 0x3fbf5a, 0.45 * s, 1.0 * s, 0.2 * s);
  g.add(top1, top2);
  g.position.set(x, 0, z);
  g.userData.top = top1;
  return g;
}

function makeHouse(x, z, wall, roof, ry) {
  const g = new THREE.Group();
  g.add(box(2.6, 1.6, 2.2, wall, 0, 0.8, 0));
  const r1 = box(1.7, 0.14, 2.5, roof, -0.62, 1.95, 0);
  r1.rotation.z = 0.55;
  const r2 = box(1.7, 0.14, 2.5, roof, 0.62, 1.95, 0);
  r2.rotation.z = -0.55;
  g.add(r1, r2);
  g.add(box(0.6, 1.0, 0.08, 0x6b4226, 0, 0.5, 1.12));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat(0xffe9a8));
  win.position.set(-0.7, 1.0, 1.12);
  g.add(win);
  g.position.set(x, 0, z);
  g.rotation.y = ry || 0;
  return g;
}

export function initWarung3D(canvas, hooks) {
  hooks = hooks || {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (err) {
    return null;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // Isometric-style orthographic camera.
  const FRUSTUM = 9.5;
  const camera = new THREE.OrthographicCamera(-FRUSTUM, FRUSTUM, FRUSTUM, -FRUSTUM, 0.1, 100);
  const CAM_BASE = new THREE.Vector3(13, 15, 13);
  camera.position.copy(CAM_BASE);
  camera.lookAt(0, 0, 0.5);

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xfff2cc, 1.6);
  sun.position.set(8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
  scene.add(sun);

  // ---- Village ----
  const ground = box(23, 0.3, 17, 0x69b844, 0, -0.15, 0);
  ground.castShadow = false;
  scene.add(ground);
  // Grass patches.
  [[-7, -4, 0x7cc24a], [7, -4.5, 0x5da83c], [-8.5, 2, 0x7cc24a], [8.5, 2.5, 0x5da83c]].forEach((p) => {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), mat(p[2]));
    patch.rotation.x = -Math.PI / 2; patch.position.set(p[0], 0.01, p[1]); patch.receiveShadow = true;
    scene.add(patch);
  });
  // Main road (bottom) + path to the warung.
  scene.add(box(23, 0.06, 2.2, 0x8a8f98, 0, 0.03, 5.6));
  scene.add(box(2.2, 0.06, 4.4, 0xd9b380, 0, 0.03, 3.4));
  // Road dashes.
  for (let x = -10; x <= 10; x += 2) scene.add(box(0.9, 0.02, 0.14, 0xffffff, x, 0.07, 5.6));

  // Warung building (back centre).
  const warung = new THREE.Group();
  warung.add(box(7.4, 2.3, 3.2, 0xfff3d6, 0, 1.15, 0));
  const wr1 = box(4.3, 0.16, 3.7, 0xc0392b, -1.75, 2.75, 0); wr1.rotation.z = 0.5;
  const wr2 = box(4.3, 0.16, 3.7, 0xc0392b, 1.75, 2.75, 0); wr2.rotation.z = -0.5;
  warung.add(wr1, wr2);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 1.44),
    new THREE.MeshBasicMaterial({ map: textTexture("WARUNG BERKAH", "#ffc531", "#231a00", "NASI PECEL • MIE • KOPI") })
  );
  sign.position.set(0, 1.5, 1.62);
  warung.add(sign);
  warung.add(box(0.9, 1.4, 0.1, 0x6b4226, -2.4, 0.7, 1.62));
  const winMat = new THREE.MeshBasicMaterial({ color: 0x9fd8ff });
  [[-1.4], [1.4]].forEach((wx) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), winMat);
    w.position.set(wx[0], 1.3, 1.62);
    warung.add(w);
  });
  warung.position.set(0, 0, -4.6);
  scene.add(warung);
  // Counter in front of the warung + food bowls.
  scene.add(box(3.4, 0.9, 1.0, 0x8b5a2b, 0, 0.45, -2.6));
  scene.add(box(3.6, 0.12, 1.2, 0xd9b380, 0, 0.96, -2.6));
  [[-1.1, 0xff8c42], [-0.4, 0x3ddc84], [0.4, 0xffc531], [1.1, 0xff4d5e]].forEach((b) => {
    scene.add(cyl(0.22, 0.16, 0.18, b[1], b[0], 1.08, -2.6, 10));
  });

  // Tables + umbrellas.
  const tables = [];
  TABLE_POS.forEach((p, i) => {
    const t = new THREE.Group();
    t.add(cyl(0.08, 0.08, 0.7, 0x6b4226, 0, 0.35, 0, 8));
    t.add(cyl(0.75, 0.75, 0.08, 0xffffff, 0, 0.72, 0, 18));
    if (i !== 1) {
      t.add(cyl(0.05, 0.05, 1.6, 0x6b4226, 0, 1.4, 0, 8));
      const um = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.55, 12), mat(i === 0 ? 0x2f7bff : 0xffc531));
      um.position.y = 2.2; um.castShadow = true;
      t.add(um);
    }
    t.add(box(0.45, 0.45, 0.45, 0x8b5a2b, -0.85, 0.22, 0.4));
    t.add(box(0.45, 0.45, 0.45, 0x8b5a2b, 0.85, 0.22, 0.4));
    t.position.copy(p);
    scene.add(t);
    tables.push(t);
  });

  // Houses, trees, market stall.
  scene.add(makeHouse(-8.2, -4.2, 0xf5e6c8, 0xc0392b, 0.4));
  scene.add(makeHouse(8.4, -4.0, 0xd6eaf8, 0x2f7bff, -0.4));
  scene.add(makeHouse(8.8, -0.5, 0xfdebd0, 0x27ae60, -0.9));
  const trees = [makeTree(-6.5, -1.5, 1), makeTree(6.8, 2.2, 1.15), makeTree(-9, 3.2, 0.9), makeTree(3.2, -6.2, 1), makeTree(-3.4, -6.4, 0.85), makeTree(9.8, 4.2, 0.9)];
  trees.forEach((t) => scene.add(t));
  // Market stall (right).
  const stall = new THREE.Group();
  stall.add(box(2.6, 1.0, 1.4, 0x8b5a2b, 0, 0.5, 0));
  for (let i = 0; i < 5; i++) {
    stall.add(box(0.52, 0.08, 1.6, i % 2 ? 0xffffff : 0xff4d5e, -1.04 + i * 0.52, 1.55, 0));
  }
  stall.add(box(0.08, 1.5, 0.08, 0x6b4226, -1.2, 0.75, 0.7));
  stall.add(box(0.08, 1.5, 0.08, 0x6b4226, 1.2, 0.75, 0.7));
  [[-1, 0xff8c42], [-0.3, 0x3ddc84], [0.4, 0xffc531], [1, 0xff4d5e]].forEach((f) => {
    stall.add(ball(0.22, f[1], f[0], 1.15, 0.2));
  });
  stall.position.set(7.6, 0, -2.2);
  stall.rotation.y = -0.5;
  scene.add(stall);

  // Clouds drifting.
  const clouds = [];
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Group();
    c.add(ball(0.9, 0xffffff, 0, 0, 0));
    c.add(ball(0.65, 0xffffff, 0.9, -0.1, 0.2));
    c.add(ball(0.6, 0xffffff, -0.85, -0.12, -0.1));
    c.position.set(-8 + i * 8, 7.5 + i * 0.4, -5 - i);
    scene.add(c);
    clouds.push(c);
  }

  // ---- People ----
  const customers = [null, null, null];
  const juragan = makePerson(0x2f7bff, 0xf1c27d, 0x1a1a1a, { apron: true });
  juragan.position.set(0, 0, -1.4);
  juragan.userData.target = null;
  juragan.userData.keys = new Set();
  scene.add(juragan);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let downPos = null;

  function groundPoint(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    return raycaster.ray.intersectPlane(groundPlane, hit) ? hit : null;
  }
  canvas.addEventListener("pointerdown", (e) => { downPos = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("pointerup", (e) => {
    if (!downPos) return;
    const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    if (moved > 8) return;
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    for (let i = 0; i < 3; i++) {
      const c = customers[i];
      if (c && c.state === "waiting") {
        const hits = raycaster.intersectObject(c.group, true);
        if (hits.length) { if (hooks.onSelect) hooks.onSelect(i); return; }
      }
    }
    const p = groundPoint(e);
    if (p) {
      juragan.userData.target = new THREE.Vector3(
        THREE.MathUtils.clamp(p.x, -10.5, 10.5),
        0,
        THREE.MathUtils.clamp(p.z, -7, 7.5)
      );
    }
  });
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      juragan.userData.keys.add(k);
      juragan.userData.target = null;
    }
  });
  window.addEventListener("keyup", (e) => juragan.userData.keys.delete(e.key.toLowerCase()));

  function walkStep(person, dt, speed) {
    const u = person.userData;
    u.phase += dt * speed * 3.2;
    const s = Math.sin(u.phase);
    u.legL.rotation.x = s * 0.7;
    u.legR.rotation.x = -s * 0.7;
    u.armL.rotation.x = -s * 0.5;
    u.armR.rotation.x = s * 0.5;
    person.position.y = Math.abs(Math.cos(u.phase)) * 0.05;
  }
  function idleStep(person, dt, t) {
    const u = person.userData;
    u.legL.rotation.x *= 0.8; u.legR.rotation.x *= 0.8;
    u.armL.rotation.x *= 0.8; u.armR.rotation.x *= 0.8;
    person.position.y = Math.sin(t * 2 + u.phase) * 0.02;
  }
  function face(person, tx, tz) {
    const dx = tx - person.position.x, dz = tz - person.position.z;
    if (Math.hypot(dx, dz) < 0.05) return;
    person.rotation.y = Math.atan2(dx, dz);
  }
  function moveToward(person, target, dt, speed) {
    const dx = target.x - person.position.x, dz = target.z - person.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.08) return true;
    const step = Math.min(d, speed * dt);
    person.position.x += (dx / d) * step;
    person.position.z += (dz / d) * step;
    face(person, target.x, target.z);
    walkStep(person, dt, speed);
    return false;
  }

  const api = {
    ready: true,
    spawn(i, data) {
      if (customers[i]) scene.remove(customers[i].group);
      const shirt = SHIRTS[(data.colorIndex || 0) % SHIRTS.length];
      const skin = SKINS[(data.colorIndex || 0) % SKINS.length];
      const hair = HAIRS[(data.colorIndex || 0) % HAIRS.length];
      const group = makePerson(shirt, skin, hair, { hat: !!data.vip });
      const spawn = SPAWNS[i % SPAWNS.length].clone();
      group.position.copy(spawn);
      scene.add(group);
      const table = TABLE_POS[i];
      customers[i] = {
        group, state: "walking",
        waypoints: [new THREE.Vector3(table.x * 0.55, 0, 4.4), new THREE.Vector3(table.x, 0, table.z + 1.4)],
        wp: 0, seat: i, vip: !!data.vip,
      };
    },
    leave(i, happy) {
      const c = customers[i];
      if (!c) return;
      c.state = "leaving";
      c.happy = happy;
      c.waypoints = [new THREE.Vector3(c.group.position.x * 0.6, 0, 5.6), SPAWNS[i % SPAWNS.length].clone()];
      c.wp = 0;
      customers[i] = c; // keep walking out; slot freed by game logic, spawn() replaces mesh
    },
    clearAll() {
      for (let i = 0; i < 3; i++) {
        if (customers[i]) { scene.remove(customers[i].group); customers[i] = null; }
      }
    },
    select(i) {
      customers.forEach((c, idx) => {
        if (!c) return;
        c.group.traverse((o) => { if (o.userData && o.userData.ring) o.visible = idx === i; });
      });
    },
    setDayProgress(p) {
      // Pagi cerah -> sore keemasan.
      const t = THREE.MathUtils.clamp(p, 0, 1);
      sun.intensity = 1.6 - t * 0.5;
      sun.color.setHSL(0.1, 0.7, 0.75 - t * 0.12);
      scene.background.setHSL(0.58, 0.55, 0.72 - t * 0.22);
      ambient.intensity = 0.85 - t * 0.15;
    },
    project(i) {
      const c = customers[i];
      if (!c) return null;
      const v = c.group.position.clone(); v.y += 1.9;
      v.project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: (v.x * 0.5 + 0.5) * r.width, y: (-v.y * 0.5 + 0.5) * r.height, behind: v.z > 1 };
    },
  };

  // Selection rings (created lazily per customer inside spawn via traverse marker).
  const origSpawn = api.spawn;
  api.spawn = function (i, data) {
    origSpawn(i, data);
    const c = customers[i];
    if (!c) return;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.6, 24),
      new THREE.MeshBasicMaterial({ color: 0xffc531, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02;
    ring.userData.ring = true; ring.visible = false;
    c.group.add(ring);
  };

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
    const h = canvas.clientHeight || 340;
    const aspect = w / h;
    camera.left = -FRUSTUM * aspect; camera.right = FRUSTUM * aspect;
    camera.top = FRUSTUM; camera.bottom = -FRUSTUM;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);
  resize();

  let mouseX = 0, mouseY = 0;
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseY = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });

  const clock = new THREE.Clock();
  let raf = 0;
  let bubbleTimer = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    // Camera parallax (skip when reduced motion).
    if (!reduced) {
      camera.position.x = CAM_BASE.x + mouseX * 0.7;
      camera.position.y = CAM_BASE.y + -mouseY * 0.4;
      camera.lookAt(0, 0, 0.5);
    }
    // Customers.
    customers.forEach((c, i) => {
      if (!c) return;
      if (c.state === "walking" || c.state === "leaving") {
        const target = c.waypoints[c.wp];
        if (target && moveToward(c.group, target, dt, c.state === "leaving" ? 3.2 : 2.4)) {
          c.wp++;
          if (c.wp >= c.waypoints.length) {
            if (c.state === "walking") { c.state = "waiting"; c.group.rotation.y = Math.PI; }
            else { scene.remove(c.group); customers[i] = null; }
          }
        }
      } else if (c.state === "waiting") {
        idleStep(c.group, dt, t);
      }
    });
    // Juragan: keys move, else click target.
    const keys = juragan.userData.keys;
    let kx = 0, kz = 0;
    if (keys.has("a") || keys.has("arrowleft")) kx -= 1;
    if (keys.has("d") || keys.has("arrowright")) kx += 1;
    if (keys.has("w") || keys.has("arrowup")) kz -= 1;
    if (keys.has("s") || keys.has("arrowdown")) kz += 1;
    if (kx || kz) {
      const len = Math.hypot(kx, kz);
      juragan.position.x = THREE.MathUtils.clamp(juragan.position.x + (kx / len) * 3.6 * dt, -10.5, 10.5);
      juragan.position.z = THREE.MathUtils.clamp(juragan.position.z + (kz / len) * 3.6 * dt, -7, 7.5);
      if (juragan.position.z < -2.4 && Math.abs(juragan.position.x) < 4.2) juragan.position.z = -2.4;
      juragan.rotation.y = Math.atan2(kx / len, kz / len);
      walkStep(juragan, dt, 3.6);
    } else if (juragan.userData.target) {
      const done = moveToward(juragan, juragan.userData.target, dt, 3.6);
      if (done) juragan.userData.target = null;
    } else {
      idleStep(juragan, dt, t);
    }
    // Trees sway, clouds drift.
    trees.forEach((tr, idx) => { if (tr.userData.top) tr.userData.top.rotation.z = Math.sin(t * 0.8 + idx) * 0.04; });
    clouds.forEach((c) => { c.position.x += dt * 0.25; if (c.position.x > 14) c.position.x = -14; });
    // Order bubbles follow customers (position only; content is owned by the game script).
    bubbleTimer += dt;
    if (bubbleTimer > 0.08 && hooks.getBubble) {
      bubbleTimer = 0;
      for (let i = 0; i < 3; i++) {
        const el = hooks.getBubble(i);
        if (!el) continue;
        const p = api.project(i);
        if (!p || p.behind || !customers[i] || customers[i].state !== "waiting") {
          el.style.display = "none";
          continue;
        }
        el.style.display = "block";
        el.style.left = p.x + "px";
        el.style.top = p.y + "px";
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  frame();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else { clock.getDelta(); raf = requestAnimationFrame(frame); }
  });

  if (typeof window !== "undefined") window.Warung3D = api;
  return api;
}
