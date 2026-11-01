const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

export async function initAircraftShowcase(section) {
  const THREE = await import(THREE_URL);
  const container = section.querySelector(".flight-study__canvas");
  const viewport = section.querySelector(".flight-study__viewport");
  const steps = [...section.querySelectorAll(".flight-study__step")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    section.classList.add("flight-study--fallback");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 16);
  scene.add(new THREE.HemisphereLight(0xd8fff1, 0x18251c, 2.2));
  const key = new THREE.DirectionalLight(0xf5fff1, 3.1);
  key.position.set(4, 8, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8cff56, 2.1);
  rim.position.set(-5, 2, -8);
  scene.add(rim);

  const model = makeAircraft(THREE);
  scene.add(model);
  const target = { progress: 0 };
  let frame = 0;

  function draw() {
    frame = 0;
    const p = reducedMotion.matches ? 0.28 : target.progress;
    model.rotation.set(-0.23 + p * 0.22, -0.62 + p * 2.3, -0.16 + Math.sin(p * Math.PI) * 0.13);
    const zoom = 1 + Math.sin(p * Math.PI) * 0.24 + p * 0.08;
    model.scale.setScalar(zoom);
    renderer.render(scene, camera);
  }

  function scheduleDraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function update() {
    const distance = Math.max(1, section.offsetHeight - viewport.offsetHeight);
    target.progress = Math.max(0, Math.min(1, (16 - section.getBoundingClientRect().top) / distance));
    section.style.setProperty("--study-progress", String(target.progress));
    const active = Math.min(2, Math.floor(target.progress * 3));
    steps.forEach((step, index) => step.classList.toggle("is-active", index === active));
    scheduleDraw();
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1 ? 19 : 16;
    camera.updateProjectionMatrix();
    scheduleDraw();
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  reducedMotion.addEventListener("change", update);
  renderer.domElement.addEventListener("webglcontextlost", () => {
    section.classList.remove("is-3d-ready");
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    section.classList.add("is-3d-ready");
    scheduleDraw();
  });
  resize();
  update();
  section.classList.add("is-3d-ready");
}

function makeAircraft(T) {
  const aircraft = new T.Group();
  const body = new T.MeshStandardMaterial({ color: 0xb2bfb4, metalness: 0.68, roughness: 0.34 });
  const dark = new T.MeshStandardMaterial({ color: 0x22332c, metalness: 0.72, roughness: 0.3 });
  const glass = new T.MeshStandardMaterial({ color: 0x1c4a42, metalness: 0.75, roughness: 0.2 });
  const accent = new T.MeshStandardMaterial({ color: 0x78ff3d, emissive: 0x1a7810, emissiveIntensity: 0.45, metalness: 0.4, roughness: 0.3 });

  function mesh(geometry, material, x = 0, y = 0, z = 0) {
    const item = new T.Mesh(geometry, material);
    item.position.set(x, y, z);
    aircraft.add(item);
    return item;
  }

  // Rings create a tapered fuselage along the aircraft's longitudinal axis.
  const rings = [
    [-3.45, 0.06, 0.08], [-3, 0.25, 0.24], [-2.2, 0.43, 0.36],
    [-1.2, 0.58, 0.45], [0, 0.65, 0.5], [1.35, 0.54, 0.44],
    [2.25, 0.36, 0.33], [3.05, 0.16, 0.17], [3.55, 0.01, 0.01]
  ];
  const vertices = [];
  const indices = [];
  const segments = 32;
  rings.forEach(([z, width, height]) => {
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push(Math.cos(angle) * width, Math.sin(angle) * height, z);
    }
  });
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < segments; i++) {
      const a = r * (segments + 1) + i;
      const b = a + segments + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const hull = new T.BufferGeometry();
  hull.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  hull.setIndex(indices);
  hull.computeVertexNormals();
  mesh(hull, body);

  function flatSurface(points, material, y, thickness = 0.08) {
    const shape = new T.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, z]) => shape.lineTo(x, z));
    shape.closePath();
    const geometry = new T.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2 });
    geometry.rotateX(Math.PI / 2);
    return mesh(geometry, material, 0, y, 0);
  }

  flatSurface([[0, 1.05], [0.65, 0.95], [3.95, -0.8], [4.1, -1.15], [1.05, -0.8], [0, -1.2], [-1.05, -0.8], [-4.1, -1.15], [-3.95, -0.8], [-0.65, 0.95]], body, 0.02);
  flatSurface([[0, -2.05], [0.35, -2.15], [1.65, -2.9], [1.7, -3.1], [0, -2.8], [-1.7, -3.1], [-1.65, -2.9], [-0.35, -2.15]], body, 0.12, 0.05);
  flatSurface([[3.5, -0.78], [3.95, -0.8], [4.1, -1.15], [3.62, -1.09]], accent, 0.08, 0.025);
  flatSurface([[-3.5, -0.78], [-3.95, -0.8], [-4.1, -1.15], [-3.62, -1.09]], accent, 0.08, 0.025);

  const canopy = mesh(new T.SphereGeometry(1, 32, 20), glass, 0, 0.41, 1.38);
  canopy.scale.set(0.34, 0.24, 0.83);
  const spine = mesh(new T.SphereGeometry(1, 24, 16), dark, 0, 0.24, -1.1);
  spine.scale.set(0.34, 0.27, 1.35);
  const fin = new T.Shape();
  fin.moveTo(-2.95, 0.24);
  fin.lineTo(-2.5, 1.42);
  fin.lineTo(-2.1, 1.5);
  fin.lineTo(-1.65, 0.27);
  fin.closePath();
  const finGeometry = new T.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025 });
  finGeometry.rotateY(-Math.PI / 2);
  mesh(finGeometry, body, 0.04, 0, 0);

  [-1, 1].forEach((side) => {
    const engine = mesh(new T.CylinderGeometry(0.25, 0.29, 1.4, 24), dark, side * 1.12, -0.2, -0.25);
    engine.rotation.x = Math.PI / 2;
    const intake = mesh(new T.TorusGeometry(0.245, 0.035, 10, 32), body, side * 1.12, -0.2, 0.46);
    const exhaust = mesh(new T.TorusGeometry(0.22, 0.025, 10, 32), accent, side * 1.12, -0.2, -0.96);
    intake.rotation.z = exhaust.rotation.z = 0;
  });
  return aircraft;
}
