// Tara Tech Arcade — shared 3D particle burst (Three.js).
// Lazy: the WebGL renderer is only created on the first burst, so pages
// that never trigger one pay nothing. Fails soft: if WebGL is
// unavailable, burst() is a no-op and the game keeps working with its
// existing +1/-2 pop text. Exposed as window.ArcadeBurst.
import * as THREE from "three";

let ready = false;
let renderer, scene, camera, clock;
let raf = 0;
const parts = [];
const geo = new THREE.TetrahedronGeometry(0.22, 0);

function ensure() {
  if (ready) return true;
  const canvas = document.createElement("canvas");
  canvas.id = "burst3d";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: "15",
  });
  document.body.appendChild(canvas);
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  clock = new THREE.Clock();
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });
  ready = true;
  return true;
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt / 0.7;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.vy -= 6 * dt;
    p.mesh.rotation.x += dt * 6;
    p.mesh.rotation.y += dt * 8;
    p.mesh.material.opacity = Math.max(0, p.life);
    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.material.dispose();
      parts.splice(i, 1);
    }
  }
  renderer.render(scene, camera);
  raf = parts.length ? requestAnimationFrame(frame) : 0;
}

export function burst(clientX, clientY, colorHex, count = 22) {
  if (!ensure()) return;
  const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1 });
  // Screen point -> world point on the z=0 plane.
  const v = new THREE.Vector3(
    (clientX / window.innerWidth) * 2 - 1,
    -((clientY / window.innerHeight) * 2 - 1),
    0.5
  ).unproject(camera);
  const dir = v.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(dist));
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    const a = Math.random() * Math.PI * 2;
    const up = Math.random() * 5 + 2;
    const sp = Math.random() * 4 + 1;
    parts.push({
      mesh: m,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp * 0.6 + up * 0.5,
      vz: (Math.random() - 0.5) * 2,
      life: 1,
    });
    scene.add(m);
  }
  if (!raf) { clock.getDelta(); raf = requestAnimationFrame(frame); }
}

if (typeof window !== "undefined") window.ArcadeBurst = { burst };
