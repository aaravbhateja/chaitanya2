// Fixed full-screen WebGL backdrop.
// Hero: a procedural 3D lifter performing a looping conventional deadlift
// (two-bone IK legs, arms hanging to the bar, bar path vertical over mid-foot).
// Scroll orbits/raises the lifter out of frame; mouse turns it. No external assets.
import * as THREE from "../vendor/three.module.min.js";

const UP = new THREE.Vector3(0, 1, 0);
const ease = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);
const lerp = (a, b, t) => a + (b - a) * t;

// Body proportions (metres, then group-scaled)
const THIGH = 0.46, SHIN = 0.46, TORSO = 0.52, ARM = 0.62;
const BAR_R = 0.225;            // plate radius -> bar centre height on the floor
const ANKLE = new THREE.Vector2(-0.1, 0.08);
const LOCKOUT_BAR_Y = 0.86;
const HALF_GRIP = 0.27;

// Rep timeline (seconds): lower, bottom reset, pull, lockout hold
const T_DOWN = 1.7, T_RESET = 0.55, T_UP = 1.35, T_HOLD = 1.0;
const T_TOTAL = T_DOWN + T_RESET + T_UP + T_HOLD;

// Returns { p: 0 (bottom) .. 1 (lockout), phase, rep }
export function repAt(t) {
  const rep = Math.floor(t / T_TOTAL);
  let s = t - rep * T_TOTAL;
  if (s < T_UP) return { p: ease(s / T_UP) * 0.5 + easeOut(s / T_UP) * 0.5, phase: "Pull", rep };
  s -= T_UP;
  if (s < T_HOLD) return { p: 1, phase: "Lockout", rep };
  s -= T_HOLD;
  if (s < T_DOWN) return { p: 1 - ease(s / T_DOWN), phase: "Lower", rep };
  return { p: 0, phase: "Reset", rep };
}

export function initScene(canvas, { onRep, reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0b0c, 10, 30);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight(0xbfc4d4, 0x1a0f0c, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 7, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  key.shadow.bias = -0.0005;
  scene.add(key, key.target);
  const rim = new THREE.PointLight(0xff4d1c, 110, 30);
  rim.position.set(-6, 1, -2);
  scene.add(rim);

  const skin = new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.55, metalness: 0.05 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x232327, roughness: 0.8, metalness: 0.05 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0xff4d1c, roughness: 0.5, metalness: 0.1 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x9a9da4, metalness: 1, roughness: 0.28 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x1b1b1e, metalness: 0.6, roughness: 0.5 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff4d1c, metalness: 0.3, roughness: 0.45 });
  const deck = new THREE.MeshStandardMaterial({ color: 0x131315, roughness: 0.9 });

  // ---- lifter group: origin at the feet, +x = facing direction, z = bar axis
  const lifter = new THREE.Group();
  scene.add(lifter);
  const cast = (m) => { m.castShadow = true; return m; };

  // platform + glowing edge
  const platform = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 2.6), deck);
  platform.position.y = -0.03;
  platform.receiveShadow = true;
  lifter.add(platform);
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(platform.geometry),
    new THREE.LineBasicMaterial({ color: 0xff4d1c })
  );
  edge.position.copy(platform.position);
  lifter.add(edge);

  // barbell (axis = z)
  const bar = new THREE.Group();
  const shaft = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.2, 20), steel));
  shaft.rotation.x = Math.PI / 2;
  bar.add(shaft);
  [-1, 1].forEach((side) => {
    [[0.52, 0.045, iron], [0.585, 0.045, accent], [0.65, 0.03, iron]].forEach(([z, t, m]) => {
      const plate = cast(new THREE.Mesh(new THREE.CylinderGeometry(BAR_R, BAR_R, t, 48), m));
      plate.rotation.x = Math.PI / 2;
      plate.position.z = side * z;
      bar.add(plate);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, t + 0.004, 20), steel);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = side * z;
      bar.add(hub);
    });
    const collar = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16), steel));
    collar.rotation.x = Math.PI / 2;
    collar.position.z = side * 0.7;
    bar.add(collar);
  });
  lifter.add(bar);

  // limb helper: cylinder + end joints between two points
  function limb(radA, radB, mat) {
    const g = new THREE.Group();
    const seg = cast(new THREE.Mesh(new THREE.CylinderGeometry(radB, radA, 1, 14), mat));
    const ja = cast(new THREE.Mesh(new THREE.SphereGeometry(radA, 14, 10), mat));
    const jb = cast(new THREE.Mesh(new THREE.SphereGeometry(radB, 14, 10), mat));
    g.add(seg, ja, jb);
    g.userData = { seg, ja, jb };
    lifter.add(g);
    return g;
  }
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
  function place(g, A, B) {
    const { seg, ja, jb } = g.userData;
    _d.subVectors(B, A);
    const len = _d.length() || 1e-4;
    seg.scale.set(1, len, 1);
    seg.position.copy(A).addScaledVector(_d, 0.5);
    seg.quaternion.setFromUnitVectors(UP, _d.normalize());
    ja.position.copy(A);
    jb.position.copy(B);
  }

  const sides = [-1, 1].map((s) => ({
    s,
    thigh: limb(0.075, 0.062, skin),
    shin: limb(0.062, 0.045, skin),
    upper: limb(0.058, 0.045, skin),
    fore: limb(0.045, 0.036, skin),
    shoe: cast(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.11), shoe)),
  }));
  sides.forEach((l) => lifter.add(l.shoe));

  const torso = cast(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), shirt));
  const pelvis = cast(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), shirt));
  const neck = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.1, 12), skin));
  const head = cast(new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), skin));
  lifter.add(torso, pelvis, neck, head);

  // ---- pose solver
  const H = new THREE.Vector3(), S = new THREE.Vector3(), K = new THREE.Vector3(), A = new THREE.Vector3(), W = new THREE.Vector3(), E = new THREE.Vector3(), Hd = new THREE.Vector3();
  function pose(p) {
    const barY = lerp(BAR_R, LOCKOUT_BAR_Y, p);
    const theta = THREE.MathUtils.degToRad(lerp(52, -2, Math.pow(p, 0.9))); // forward lean from vertical
    S.set(0.02, barY + ARM, 0);
    H.set(S.x - TORSO * Math.sin(theta), S.y - TORSO * Math.cos(theta), 0);

    bar.position.set(0, barY, 0);

    // torso + pelvis
    const mid = new THREE.Vector3().addVectors(H, S).multiplyScalar(0.5);
    torso.position.copy(mid).add(new THREE.Vector3(0.0, 0.03, 0));
    torso.scale.set(0.14, TORSO * 0.5 + 0.1, 0.205);
    torso.rotation.z = -theta;
    pelvis.position.copy(H);
    pelvis.scale.set(0.15, 0.11, 0.19);
    pelvis.rotation.z = -theta * 0.5;

    // neck + head follow the spine line (neutral, slightly packed)
    const hd = theta * 0.75;
    Hd.set(S.x + Math.sin(hd) * 0.2, S.y + Math.cos(hd) * 0.2, 0);
    neck.position.set(S.x + Math.sin(hd) * 0.1, S.y + Math.cos(hd) * 0.1, 0);
    neck.rotation.z = -hd;
    head.position.copy(Hd);

    sides.forEach((l) => {
      const z = l.s;
      // leg IK (planar, knee forward)
      const hz = z * 0.1, az = z * 0.13;
      const hx = H.x, hy = H.y;
      A.set(ANKLE.x, ANKLE.y, az);
      let dx = A.x - hx, dy = A.y - hy;
      let d = Math.hypot(dx, dy);
      d = Math.min(d, THIGH + SHIN - 1e-3);
      const a = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(THIGH * THIGH - a * a, 0));
      const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
      let px = -uy, py = ux;
      if (px < 0) { px = -px; py = -py; }
      K.set(hx + ux * a + px * h, hy + uy * a + py * h, lerp(hz, az, 0.6));
      const hip = new THREE.Vector3(hx, hy, hz);
      place(l.thigh, hip, K);
      place(l.shin, K, A);
      l.shoe.position.set(A.x + 0.08, 0.04, az);

      // arm: shoulder -> hand on the bar
      const sh = new THREE.Vector3(S.x, S.y - 0.02, z * 0.2);
      W.set(0, barY, z * HALF_GRIP);
      E.addVectors(sh, W).multiplyScalar(0.5).add(new THREE.Vector3(0.015, 0, z * 0.012));
      place(l.upper, sh, E);
      place(l.fore, E, W);
    });
  }

  // ---- depth props: rings + chunks behind, and dust
  const floaters = [];
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Mesh(
      i % 3 === 0 ? new THREE.TorusGeometry(0.5 + Math.random() * 0.5, 0.07, 12, 40) : new THREE.IcosahedronGeometry(0.25 + Math.random() * 0.3, 0),
      i % 4 === 0 ? accent : iron
    );
    g.position.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 32 - 6, -4 - Math.random() * 9);
    g.userData = { s: 0.2 + Math.random() * 0.5 };
    scene.add(g);
    floaters.push(g);
  }
  const n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf4f1ea, size: 0.03, transparent: true, opacity: 0.5 }));
  scene.add(dust);

  // ---- layout
  let baseScale = 2.7, baseX = 2.5, baseY = -2.35;
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const narrow = w < 800;
    baseScale = narrow ? 1.5 : Math.min(2.9, 2.0 + w / 2200 * 1.0 + h / 1600);
    baseX = narrow ? 0 : 2.6;
    baseY = narrow ? -4.1 : -2.45;
  }
  addEventListener("resize", resize);
  resize();

  const mouse = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  });

  let smooth = 0, heroP = 0, lastPhase = "", lastRep = -1;
  const clock = new THREE.Clock();
  pose(1);

  function frame() {
    const t = clock.getElapsedTime();
    const max = document.documentElement.scrollHeight - innerHeight;
    const sp = max > 0 ? scrollY / max : 0;
    smooth += (sp - smooth) * 0.06;
    const hp = Math.min(Math.max(scrollY / innerHeight, 0), 1.6);
    heroP += (hp - heroP) * 0.08;

    const r = reducedMotion ? { p: 1, phase: "Lockout", rep: 0 } : repAt(t);
    pose(r.p);
    if (onRep && (r.phase !== lastPhase || r.rep !== lastRep)) {
      lastPhase = r.phase; lastRep = r.rep;
      onRep({ phase: r.phase, rep: r.rep + (r.phase === "Pull" || r.phase === "Lockout" ? 1 : 0) });
    }

    // 3/4 front view that orbits with scroll, turns slightly with the mouse; rises out of frame
    lifter.scale.setScalar(baseScale);
    lifter.rotation.y = Math.PI + 0.62 + heroP * 2.2 + mouse.x * 0.45;
    lifter.position.set(baseX, baseY + heroP * heroP * 7 + heroP * 3 + Math.sin(t * 0.7) * 0.02, 0);
    camera.position.y = -smooth * 20 + mouse.y * -0.25;
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.04;
    camera.lookAt(0, camera.position.y + 0.15 * 0, 0);
    rim.position.y = camera.position.y + 1;
    key.position.set(3 + lifter.position.x * 0.3, lifter.position.y + 7, 6);
    key.target.position.copy(lifter.position);
    key.target.updateMatrixWorld();

    floaters.forEach((f, i) => {
      f.rotation.x = t * f.userData.s + i;
      f.rotation.y = t * f.userData.s * 0.8;
    });
    dust.rotation.y = t * 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();
}
