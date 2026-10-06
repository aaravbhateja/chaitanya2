// Fixed full-screen WebGL backdrop: a weight plate stack + barbell + dust,
// driven by scroll and mouse. All geometry is procedural (no external assets).
import * as THREE from "../vendor/three.module.min.js";

export function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0b0c, 8, 26);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xff4d1c, 90, 30);
  rim.position.set(-6, -2, 3);
  scene.add(rim);

  const steel = new THREE.MeshStandardMaterial({ color: 0x8a8d93, metalness: 1, roughness: 0.28 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x1b1b1e, metalness: 0.7, roughness: 0.45 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xff4d1c, metalness: 0.4, roughness: 0.4 });

  // Barbell group
  const bar = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 9, 24), steel);
  shaft.rotation.z = Math.PI / 2;
  bar.add(shaft);
  const sizes = [1.5, 1.25, 1.0, 0.75];
  [-1, 1].forEach((side) => {
    let x = 1.4;
    sizes.forEach((r, i) => {
      const t = 0.22 + (i === 0 ? 0.08 : 0);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 56), i % 2 ? iron : (i === 0 ? accent : iron));
      plate.rotation.z = Math.PI / 2;
      plate.position.x = side * (x + t / 2);
      bar.add(plate);
      const rimRing = new THREE.Mesh(new THREE.TorusGeometry(r - 0.02, 0.025, 12, 64), steel);
      rimRing.rotation.y = Math.PI / 2;
      rimRing.position.x = side * (x + t / 2 + t / 2);
      bar.add(rimRing);
      x += t + 0.04;
    });
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 20), steel);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = side * (x + 0.15);
    bar.add(collar);
  });
  bar.position.set(2.2, 0, 0);
  bar.rotation.set(0.35, -0.5, 0.15);
  scene.add(bar);

  // Floating dumbbells + torus rings as depth objects further back
  const floaters = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Mesh(
      i % 3 === 0 ? new THREE.TorusGeometry(0.5 + Math.random() * 0.5, 0.07, 12, 40) : new THREE.IcosahedronGeometry(0.25 + Math.random() * 0.3, 0),
      i % 4 === 0 ? accent : iron
    );
    g.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 30 - 6, -3 - Math.random() * 9);
    g.userData = { s: 0.2 + Math.random() * 0.5, y0: g.position.y };
    scene.add(g);
    floaters.push(g);
  }

  // Dust particles
  const n = 700;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf4f1ea, size: 0.03, transparent: true, opacity: 0.55 }));
  scene.add(dust);

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bar.position.x = w < 800 ? 0 : 2.2;
    bar.scale.setScalar(w < 800 ? 0.55 : 1);
  }
  addEventListener("resize", resize);
  resize();

  const mouse = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  });

  let scrollP = 0, smooth = 0;
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollP = max > 0 ? scrollY / max : 0;
    smooth += (scrollP - smooth) * 0.06;

    // Scroll: bar spins, drifts and rises away; camera travels down the dust column
    bar.rotation.x = 0.35 + smooth * 14;
    bar.rotation.y = -0.5 + smooth * 6 + mouse.x * 0.3;
    bar.rotation.z = 0.15 + mouse.y * 0.15;
    bar.position.y = Math.sin(t * 0.8) * 0.15 + smooth * 18;
    camera.position.y = -smooth * 20;
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
    camera.lookAt(camera.position.x * 0.2, camera.position.y, 0);
    rim.position.y = camera.position.y - 2;
    key.position.y = camera.position.y + 6;

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
