/* FORGE - core utilities, settings, state, metadata, 3D viewer */
"use strict";

/* ---------- muscle metadata ---------- */
const MUSCLE_INFO = {
  chest: {
    name: "Chest",
    desc: "Pectorals. The pushing muscles behind every press, push-up and dip.",
    function: "Pushes your arms forward and together. Powers presses, push-ups, and hugging motions."
  },
  back: {
    name: "Back",
    desc: "Rhomboids and mid-traps. A thick upper back built with rows and deadlifts.",
    function: "Pulls your shoulder blades together and down. Keeps posture tall and powers every row."
  },
  lats: {
    name: "Lats",
    desc: "Latissimus dorsi, the wings. Pull-ups and pulldowns build width.",
    function: "Pulls your arms down and back toward your body. Drives pull-ups, pulldowns, and swimming strokes."
  },
  traps: {
    name: "Traps",
    desc: "Trapezius. Shrugs and carries build the upper-back shelf.",
    function: "Shrugs and steadies your shoulders. Supports your neck and helps carry heavy loads."
  },
  "lower-back": {
    name: "Lower Back",
    desc: "Erector spinae. Keeps your spine strong under load.",
    function: "Extends and braces your spine. Keeps you upright during lifts and everyday movement."
  },
  shoulders: {
    name: "Shoulders",
    desc: "Deltoids. Pressing and raising builds capped shoulders.",
    function: "Lifts and rotates your arms in every direction. Caps pressing and raising movements."
  },
  biceps: {
    name: "Biceps",
    desc: "Front of the upper arm. Curls of every kind.",
    function: "Bends your elbow and rotates your forearm. Powers curls and assists pulling."
  },
  triceps: {
    name: "Triceps",
    desc: "Back of the upper arm. About two thirds of your arm size.",
    function: "Straightens your elbow. Drives pushdowns, dips, and locks out every press."
  },
  forearms: {
    name: "Forearms",
    desc: "Grip strength. Carries, hangs and wrist work.",
    function: "Grips, twists, and stabilizes your wrist. Transfers strength from hand to bar."
  },
  abs: {
    name: "Abs",
    desc: "Rectus abdominis, the six-pack wall. Train it with resistance.",
    function: "Bends your trunk forward and braces your core. Protects your spine under load."
  },
  obliques: {
    name: "Obliques",
    desc: "Side core. Rotation and anti-rotation strength.",
    function: "Rotates and side-bends your torso. Stabilizes twists and single-sided lifts."
  },
  glutes: {
    name: "Glutes",
    desc: "The powerhouse. Hip thrusts, swings and lunges.",
    function: "Extends your hips with force. Powers standing up, sprinting, and climbing."
  },
  quads: {
    name: "Quads",
    desc: "Front of the thigh. Squats, presses and lunges.",
    function: "Straightens your knee. Drives squats, lunges, and stairs."
  },
  hamstrings: {
    name: "Hamstrings",
    desc: "Back of the thigh. Hinges, curls and Nordics.",
    function: "Bends your knee and extends your hip. Powers sprinting and hinging lifts."
  },
  calves: {
    name: "Calves",
    desc: "Lower leg. Raises with a full stretch and squeeze.",
    function: "Lifts your heels to push off the ground. Drives running, jumping, and walking."
  },
  "full-body": {
    name: "Full Body",
    desc: "Compound conditioning. Multiple muscles, maximum output.",
    function: "Coordinates every major muscle group at once. Builds power, balance, and stamina together."
  },
  cardio: {
    name: "Cardio",
    desc: "Engine building. Heart, lungs and work capacity.",
    function: "Strengthens your heart and lungs. Builds endurance and recovery capacity."
  }
};

/* ---------- custom exercises (user-created, stored locally) ---------- */
function getCustomExercises() {
  try {
    const v = JSON.parse(localStorage.getItem("forge-custom-exercises") || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function saveCustomExercises(list) {
  try {
    localStorage.setItem("forge-custom-exercises", JSON.stringify(list));
  } catch (e) {}
}

EXERCISES.push(...getCustomExercises());

function openCustomModal() {
  $("customName").value = "";
  $("customSecondary")
    .querySelectorAll("input:checked")
    .forEach(c => {
      c.checked = false;
    });
  $("customVeil").classList.remove("hidden");
  setTimeout(() => $("customName").focus(), 60);
}

function closeCustomModal() {
  $("customVeil").classList.add("hidden");
}

function saveCustomExercise() {
  const name = $("customName").value.trim();
  if (!name) {
    appAlert("Give your exercise a name first.");
    return;
  }
  const primary = $("customPrimary").value;
  const secondary = Array.from($("customSecondary").querySelectorAll("input:checked"))
    .map(c => c.value)
    .filter(v => v !== primary);
  const ex = {
    id: "custom-" + Date.now().toString(36),
    name,
    primary,
    secondary,
    equipment: $("customEquipment").value,
    level: $("customLevel").value,
    custom: true,
    steps: [],
    pattern: "custom"
  };
  const list = getCustomExercises();
  list.push(ex);
  saveCustomExercises(list);
  EXERCISES.push(ex);
  closeCustomModal();
  initExercises();
  renderExercises();
}

const MANNEQUIN_IDS = [
  "chest",
  "back",
  "lats",
  "traps",
  "lower-back",
  "front-delt",
  "side-delt",
  "rear-delt",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "glutes",
  "quads",
  "hamstrings",
  "calves"
];

const DELT_TO_GROUP = { "front-delt": "shoulders", "side-delt": "shoulders", "rear-delt": "shoulders" };

const groupOf = mid => DELT_TO_GROUP[mid] || mid;

function expandMuscles(groupId) {
  if (groupId === "shoulders") return ["front-delt", "side-delt", "rear-delt"];
  if (groupId === "full-body" || groupId === "cardio") return MANNEQUIN_IDS.slice();
  return [groupId];
}

/* ---------- accent colors ---------- */
const ACCENTS = [
  { id: "volt", name: "Volt", color: "#d4ff3f", ink: "#0b0d12" },
  { id: "ember", name: "Ember", color: "#ff7847", ink: "#0b0d12" },
  { id: "aqua", name: "Aqua", color: "#38e1ff", ink: "#0b0d12" },
  { id: "violet", name: "Violet", color: "#b49aff", ink: "#0b0d12" },
  { id: "crimson", name: "Crimson", color: "#ff4d6d", ink: "#ffffff" },
  { id: "gold", name: "Gold", color: "#ffd23f", ink: "#0b0d12" }
];

function currentAccent() {
  const id = localStorage.getItem("forge-accent") || "volt";
  return ACCENTS.find(a => a.id === id) || ACCENTS[0];
}

/* ---------- 3D body viewer ---------- */
function createBodyViewer(container, opts) {
  opts = opts || {};
  const W = () => container.clientWidth || 400;
  const H = () => container.clientHeight || 400;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  const el = renderer.domElement;
  el.style.touchAction = "none";
  el.style.display = "block";
  container.appendChild(el);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100);
  let camDist = opts.dist || 5.9;
  camera.position.set(0, 2.05, camDist);
  camera.lookAt(0, 1.85, 0);

  scene.add(new THREE.HemisphereLight(0xaab4d4, 0x0b0d12, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(3, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c8cff, 0.85);
  rim.position.set(-4, 3, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdde4ff, 0.35);
  fill.position.set(0, 2, 6);
  scene.add(fill);

  const BODY_FINISHES = {
    standard: { base: 0x3b4356, neutral: 0x222836, roughness: 0.45, metalness: 0.08, opacity: 1 },
    chrome: { base: 0x9aa4b8, neutral: 0x5a6272, roughness: 0.15, metalness: 0.9, opacity: 1 },
    xray: { base: 0x7cc4ff, neutral: 0x3a5a7a, roughness: 0.3, metalness: 0.1, opacity: 0.35 },
    matte: { base: 0x4a4458, neutral: 0x2a2733, roughness: 0.9, metalness: 0.0, opacity: 1 }
  };
  const VTHEME = { base: 0x3b4356, neutral: 0x222836, primary: 0x5e2a22 };
  const vTheme = VTHEME;

  // soft blob shadow under feet
  const bc = document.createElement("canvas");
  bc.width = bc.height = 128;
  const bg = bc.getContext("2d");
  const grd = bg.createRadialGradient(64, 64, 6, 64, 64, 62);
  grd.addColorStop(0, "rgba(0,0,0,0.6)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  bg.fillStyle = grd;
  bg.fillRect(0, 0, 128, 128);
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 1.5),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.295;
  scene.add(blob);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.55, 1.63, 72),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(currentAccent().color),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.3;
  scene.add(ring);

  const body = new THREE.Group();
  scene.add(body);
  const baseMat = new THREE.MeshStandardMaterial({ color: vTheme.base, roughness: 0.45, metalness: 0.08 });
  const neutralMat = new THREE.MeshStandardMaterial({ color: vTheme.neutral, roughness: 0.55, metalness: 0.05 });
  const mats = {};
  const muscleMeshes = [];
  const matFor = mid => mats[mid] || (mats[mid] = baseMat.clone());
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  function part(geo, mid, x, y, z, parent) {
    const m = new THREE.Mesh(geo, mid ? matFor(mid) : neutralMat);
    m.position.set(x, y, z);
    if (mid) {
      m.userData.muscle = mid;
      muscleMeshes.push(m);
    }
    (parent || body).add(m);
    return m;
  }
  function capMesh(r, a, b, mid, parent) {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 18), matFor(mid));
    m.position.copy(a).lerp(b, 0.5);
    m.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize());
    m.userData.muscle = mid;
    muscleMeshes.push(m);
    (parent || body).add(m);
    return m;
  }
  const ball = (r, mid, x, y, z, parent) => part(new THREE.SphereGeometry(r, 26, 20), mid, x, y, z, parent);
  const box = (w, h, d, mid, x, y, z, parent) => part(new THREE.BoxGeometry(w, h, d), mid, x, y, z, parent);

  /* ---- head & neck (anatomical) ---- */
  const skull = ball(0.185, null, 0, 3.42, 0.015);
  skull.scale.set(0.92, 1.05, 0.98);
  const jaw = ball(0.115, null, 0, 3.315, 0.045);
  jaw.scale.set(0.95, 0.82, 0.9);
  // face: subtle brow, nose, chin for human read
  const brow = ball(0.045, null, 0, 3.46, 0.155);
  brow.scale.set(1.6, 0.5, 0.6);
  part(new THREE.CylinderGeometry(0.075, 0.095, 0.18, 18), null, 0, 3.12, 0);
  // trapezius neck blend
  for (const s of [-1, 1]) {
    const trapNeck = capMesh(0.065, V3(s * 0.04, 3.1, -0.02), V3(s * 0.12, 2.98, -0.03), "traps");
  }

  /* ---- torso: athletic V-taper with defined musculature ---- */
  const profile = [
    [0.012, 1.9],
    [0.148, 1.92],
    [0.188, 2.0],
    [0.175, 2.14],
    [0.162, 2.28],
    [0.17, 2.42],
    [0.198, 2.56],
    [0.225, 2.68],
    [0.232, 2.76],
    [0.208, 2.86],
    [0.148, 2.94],
    [0.094, 3.0],
    [0.07, 3.07]
  ].map(p => new THREE.Vector2(p[0], p[1]));
  const torsoCore = new THREE.Mesh(new THREE.LatheGeometry(profile, 36), neutralMat);
  torsoCore.scale.set(1.12, 1, 1.0);
  body.add(torsoCore);
  // traps: full sweep from neck to shoulders, thicker
  for (const s of [-1, 1]) {
    capMesh(0.095, V3(s * 0.05, 3.02, -0.01), V3(s * 0.32, 2.88, -0.02), "traps");
    const trapMid = ball(0.095, "traps", s * 0.18, 2.96, -0.015);
    trapMid.scale.set(1.4, 0.7, 0.8);
  }
  // pecs: defined with upper/lower separation, sternum gap
  for (const s of [-1, 1]) {
    const pecUpper = ball(0.145, "chest", s * 0.125, 2.74, 0.156);
    pecUpper.scale.set(1.25, 0.68, 0.52);
    pecUpper.rotation.z = s * -0.15;
    const pecLower = ball(0.135, "chest", s * 0.135, 2.63, 0.15);
    pecLower.scale.set(1.3, 0.62, 0.48);
    pecLower.rotation.z = s * -0.1;
  }
  // abs: 6-pack with defined separations
  for (const r of [0, 1, 2])
    for (const s of [-1, 1]) {
      const ab = ball(0.08, "abs", s * 0.068, 2.48 - r * 0.112, 0.158);
      ab.scale.set(1.2, 0.92, 0.55);
    }
  // linea alba (center line) subtle
  // serratus anterior: finger-like projections on sides
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const ser = ball(0.045, "obliques", s * 0.195, 2.58 - i * 0.09, 0.095);
      ser.scale.set(0.7, 1.1, 0.6);
      ser.rotation.z = s * 0.3;
    }
  }
  // obliques: defined external obliques
  for (const s of [-1, 1]) {
    capMesh(0.062, V3(s * 0.18, 2.52, 0.055), V3(s * 0.2, 2.26, 0.045), "obliques");
    const obBlade = ball(0.075, "obliques", s * 0.19, 2.4, 0.05);
    obBlade.scale.set(0.6, 1.3, 0.7);
  }
  // lats: wider, more flared wings
  for (const s of [-1, 1]) {
    const l = ball(0.155, "lats", s * 0.195, 2.54, -0.125);
    l.scale.set(0.52, 1.3, 0.44);
    l.rotation.z = s * 0.14;
    const latLow = ball(0.095, "lats", s * 0.165, 2.32, -0.115);
    latLow.scale.set(0.55, 1.1, 0.45);
  }
  // upper back: rhomboids + mid traps (kept proud of the core so they stay visible)
  const ub = ball(0.16, "back", 0, 2.72, -0.18);
  ub.scale.set(1.25, 0.72, 0.5);
  for (const s of [-1, 1]) {
    const rhomb = ball(0.085, "back", s * 0.085, 2.68, -0.185);
    rhomb.scale.set(0.8, 1.1, 0.5);
    rhomb.rotation.z = s * 0.25;
  }
  for (const s of [-1, 1])
    // erector spinae: thicker
    capMesh(0.068, V3(s * 0.068, 2.24, -0.152), V3(s * 0.068, 1.96, -0.152), "lower-back");
  const pelvis = ball(0.215, null, 0, 1.845, 0);
  pelvis.scale.set(1.02, 0.72, 0.82);
  for (const s of [-1, 1]) {
    // glutes: fuller
    const gl = ball(0.165, "glutes", s * 0.148, 1.74, -0.115);
    gl.scale.set(1, 1.12, 0.88);
    const glMed = ball(0.105, "glutes", s * 0.235, 1.84, -0.055);
    glMed.scale.set(0.9, 1.1, 0.8);
  }
  // shoulder blend
  for (const s of [-1, 1]) ball(0.128, null, s * 0.27, 2.82, 0);

  /* ---- arms: defined delts, bicep peak, tricep horseshoe ---- */
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(s * 0.38, 2.84, 0);
    // deltoids: three distinct heads, capped
    const deltF = ball(0.128, "front-delt", 0, 0.03, 0.098, g);
    deltF.scale.set(1, 1.1, 0.95);
    const deltS = ball(0.142, "side-delt", s * 0.058, 0.01, 0.0, g);
    deltS.scale.set(0.95, 1.2, 0.95);
    const deltR = ball(0.12, "rear-delt", 0, 0.03, -0.102, g);
    deltR.scale.set(1, 1.05, 0.9);
    // upper-arm flesh core: continuous flow under the muscles (not clickable)
    const armCore = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5, 6, 18), neutralMat);
    armCore.position.set(s * 0.038, -0.28, 0);
    g.add(armCore);
    // biceps: long head + short head with peak
    capMesh(0.108, V3(s * 0.028, -0.08, 0.055), V3(s * 0.042, -0.42, 0.06), "biceps", g);
    const peak = ball(0.105, "biceps", s * 0.036, -0.22, 0.062, g);
    peak.scale.set(1, 1.35, 1.05);
    // triceps: horseshoe with lateral head
    capMesh(0.102, V3(s * 0.028, -0.08, -0.058), V3(s * 0.042, -0.42, -0.062), "triceps", g);
    const triLat = ball(0.088, "triceps", s * 0.075, -0.2, -0.045, g);
    triLat.scale.set(0.9, 1.25, 0.9);
    ball(0.078, null, s * 0.05, -0.5, 0, g); // elbow
    // forearm: defined extensors/flexors
    const foreG = new THREE.Group();
    foreG.position.set(s * 0.05, -0.5, 0);
    const foreTop = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.068, 0.3, 20), matFor("forearms"));
    foreTop.position.set(s * 0.005, -0.16, 0.005);
    foreTop.userData.muscle = "forearms";
    muscleMeshes.push(foreTop);
    foreG.add(foreTop);
    const foreLow = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.18, 18), matFor("forearms"));
    foreLow.position.set(s * 0.005, -0.38, 0.005);
    foreLow.userData.muscle = "forearms";
    muscleMeshes.push(foreLow);
    foreG.add(foreLow);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.124, 0.049), neutralMat);
    palm.position.set(s * 0.013, -0.52, 0.01);
    foreG.add(palm);
    for (let f = 0; f < 4; f++) {
      const fg = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.072, 4, 10), neutralMat);
      fg.position.set(s * (0.013 - 0.035 + f * 0.023), -0.615, 0.014);
      fg.rotation.x = 0.35;
      foreG.add(fg);
    }
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.058, 4, 10), neutralMat);
    thumb.position.set(s * 0.062, -0.535, 0.024);
    thumb.rotation.z = s * -0.5;
    thumb.rotation.x = 0.3;
    foreG.add(thumb);
    foreG.rotation.x = -0.14;
    foreG.rotation.z = s * 0.05;
    g.add(foreG);
    g.rotation.z = s * 0.13;
    body.add(g);
  }

  /* ---- legs: defined quads, hams, calves ---- */
  for (const s of [-1, 1]) {
    // quads: rectus femoris center, vastus lateralis outer, vastus medialis teardrop
    capMesh(0.132, V3(s * 0.155, 1.64, 0.085), V3(s * 0.165, 1.12, 0.085), "quads");
    const rectus = ball(0.118, "quads", s * 0.16, 1.42, 0.09);
    rectus.scale.set(0.95, 1.45, 0.95);
    capMesh(0.098, V3(s * 0.208, 1.58, 0.03), V3(s * 0.218, 1.16, 0.03), "quads"); // vastus lateralis sweep
    const tear = ball(0.118, "quads", s * 0.148, 1.2, 0.088); // vastus medialis teardrop
    tear.scale.set(1, 1.35, 1.05);
    // hamstrings: biceps femoris + semitendinosus separation
    capMesh(0.095, V3(s * 0.122, 1.62, -0.088), V3(s * 0.128, 1.1, -0.088), "hamstrings");
    capMesh(0.095, V3(s * 0.202, 1.62, -0.088), V3(s * 0.208, 1.1, -0.088), "hamstrings");
    const hamMid = ball(0.085, "hamstrings", s * 0.165, 1.38, -0.088);
    hamMid.scale.set(1.1, 1.3, 0.9);
    ball(0.088, null, s * 0.172, 1.02, 0.03); // knee
    // calves: two gastrocnemius heads + soleus
    const gastMed = ball(0.092, "calves", s * 0.128, 0.88, -0.058);
    gastMed.scale.set(0.95, 1.25, 0.95);
    const gastLat = ball(0.092, "calves", s * 0.216, 0.88, -0.058);
    gastLat.scale.set(0.95, 1.25, 0.95);
    const soleus = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.055, 0.32, 20), matFor("calves"));
    soleus.position.set(s * 0.172, 0.6, -0.048);
    soleus.userData.muscle = "calves";
    muscleMeshes.push(soleus);
    body.add(soleus);
    box(0.105, 0.085, 0.13, null, s * 0.172, 0.355, -0.035); // heel
    const toe = box(0.1, 0.07, 0.19, null, s * 0.172, 0.345, 0.095); // forefoot
    toe.rotation.x = -0.06;
    toe.rotation.y = s * 0.12; // toes out, natural stance
  }

  /* ---- highlight ---- */
  let hlState = { p: [], s: [], soft: false };
  function reset() {
    for (const id in mats) {
      mats[id].emissive.setHex(0x000000);
      mats[id].emissiveIntensity = 0;
      mats[id].color.setHex(vTheme.base);
    }
  }
  function highlight(primaryIds, secondaryIds, allSoft) {
    hlState = { p: primaryIds || [], s: secondaryIds || [], soft: !!allSoft };
    reset();
    if (allSoft) {
      for (const id in mats) {
        mats[id].emissive.setHex(0xff5c1a);
        mats[id].emissiveIntensity = 0.38;
      }
      return;
    }
    (primaryIds || []).forEach(id => {
      if (mats[id]) {
        mats[id].emissive.setHex(0xff3b1f);
        mats[id].emissiveIntensity = 1.1;
        mats[id].color.setHex(vTheme.primary);
      }
    });
    (secondaryIds || []).forEach(id => {
      if (mats[id] && !(primaryIds || []).includes(id)) {
        mats[id].emissive.setHex(0xff9f2e);
        mats[id].emissiveIntensity = 0.55;
      }
    });
  }
  function setAccent(hex) {
    ring.material.color.set(hex);
  }
  function setHeat(heatByGroup) {
    reset();
    for (const id in mats) {
      const h = heatByGroup[groupOf(id)] || 0;
      if (h > 0) {
        mats[id].emissive.setHex(0xff2d1a);
        mats[id].emissiveIntensity = 0.25 + h * 0.95;
      }
    }
  }

  /* ---- interaction: rotate + pinch zoom + tap ---- */
  let rotY = Math.PI * 0.12,
    targetRotY = rotY,
    rotX = 0;
  let dragging = false,
    px = 0,
    py = 0,
    moved = 0,
    tapOK = false,
    pinchDist = 0,
    lastAct = Date.now();
  let holdTimer = 0,
    holdFired = false,
    downX = 0,
    downY = 0;
  const pointers = new Map();
  function clearHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = 0;
    }
  }
  const clampD = d => Math.max(3.6, Math.min(9.5, d));

  el.addEventListener("pointerdown", e => {
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      tapOK = false;
      dragging = false;
    } else {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      moved = 0;
      tapOK = true;
      downX = e.clientX;
      downY = e.clientY;
      holdFired = false;
      clearHold();
      holdTimer = setTimeout(() => {
        if (pointers.size !== 1 || moved > 10) return;
        const r = el.getBoundingClientRect();
        const ray = new THREE.Raycaster();
        ray.setFromCamera(
          new THREE.Vector2(((downX - r.left) / r.width) * 2 - 1, -((downY - r.top) / r.height) * 2 + 1),
          camera
        );
        const hit = ray.intersectObjects(muscleMeshes, false)[0];
        if (hit && opts.onMuscleHold) {
          holdFired = true;
          tapOK = false;
          buzz(25);
          opts.onMuscleHold(hit.object.userData.muscle);
        }
      }, 500);
    }
    lastAct = Date.now();
  });
  el.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchDist > 0 && d > 0) {
        camDist = clampD((camDist * pinchDist) / d);
        camera.position.z = camDist;
      }
      pinchDist = d;
    } else if (dragging) {
      const dx = e.clientX - px,
        dy = e.clientY - py;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 10) {
        tapOK = false;
        clearHold();
      }
      rotY += dx * 0.008;
      targetRotY = rotY;
      rotX = Math.max(-0.3, Math.min(0.5, rotX + dy * 0.004));
      px = e.clientX;
      py = e.clientY;
    }
    lastAct = Date.now();
  });
  function pointerEnd(e) {
    clearHold();
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) {
      dragging = false;
      if (tapOK && moved < 10 && opts.onMuscleClick) {
        const r = el.getBoundingClientRect();
        const ray = new THREE.Raycaster();
        ray.setFromCamera(
          new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
          camera
        );
        const hit = ray.intersectObjects(muscleMeshes, false)[0];
        if (hit) opts.onMuscleClick(hit.object.userData.muscle);
      }
      tapOK = false;
    }
    lastAct = Date.now();
  }
  el.addEventListener("pointerup", pointerEnd);
  el.addEventListener("pointercancel", pointerEnd);
  el.addEventListener(
    "wheel",
    e => {
      e.preventDefault();
      camDist = clampD(camDist + e.deltaY * 0.003);
      camera.position.z = camDist;
      lastAct = Date.now();
    },
    { passive: false }
  );

  let raf = 0,
    dead = false;
  (function loop() {
    if (dead) return;
    raf = requestAnimationFrame(loop);
    const idle = !dragging && pointers.size === 0 && Date.now() - lastAct > 3000;
    // Don't auto-rotate while a Front/Back view transition is still in progress,
    // or it overwrites the target angle and the button appears broken.
    const settling = Math.abs(targetRotY - rotY) > 0.02;
    if (opts.autoRotate && !getSettings().reduceMotion && idle && !settling) {
      rotY += 0.004;
      targetRotY = rotY;
    }
    rotY += (targetRotY - rotY) * 0.12;
    body.rotation.y = rotY;
    body.rotation.x = rotX;
    if (idle && !getSettings().reduceMotion) {
      const br = Math.sin(Date.now() / 900) * 0.008;
      body.scale.set(1 + br * 0.4, 1 + br, 1 + br * 0.4);
    } else {
      body.scale.set(1, 1, 1);
    }
    ring.rotation.z += 0.002;
    renderer.render(scene, camera);
  })();

  const ro = new ResizeObserver(() => {
    const w = W(),
      h = H();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  function setPain(ids) {
    reset();
    (ids || []).forEach(id => {
      if (mats[id]) {
        mats[id].emissive.setHex(0xff2222);
        mats[id].emissiveIntensity = 0.9;
      }
    });
  }
  function setSorenessTint(soreByGroup) {
    reset();
    for (const id in mats) {
      const lvl = soreByGroup[groupOf(id)];
      if (lvl === "mild") {
        mats[id].emissive.setHex(0xffe135);
        mats[id].emissiveIntensity = 0.5;
      } else if (lvl === "sore") {
        mats[id].emissive.setHex(0xff8c1a);
        mats[id].emissiveIntensity = 0.8;
      } else if (lvl === "very-sore") {
        mats[id].emissive.setHex(0xff3b1f);
        mats[id].emissiveIntensity = 1.1;
        mats[id].color.setHex(0xff5c47);
      } else if (lvl === "injured") {
        mats[id].emissive.setHex(0xb537ff);
        mats[id].emissiveIntensity = 1.2;
        mats[id].color.setHex(0xc26bff);
      }
    }
  }
  function setFinish(name) {
    const f = BODY_FINISHES[name] || BODY_FINISHES.standard;
    const apply = m => {
      m.color.setHex(f.base);
      m.roughness = f.roughness;
      m.metalness = f.metalness;
      m.opacity = f.opacity;
      m.transparent = f.opacity < 1;
      m.needsUpdate = true;
    };
    apply(baseMat);
    neutralMat.color.setHex(f.neutral);
    neutralMat.roughness = f.roughness;
    neutralMat.metalness = f.metalness;
    neutralMat.opacity = f.opacity;
    neutralMat.transparent = f.opacity < 1;
    neutralMat.needsUpdate = true;
    for (const id in mats) apply(mats[id]);
  }
  return {
    highlight,
    setAccent,
    setHeat,
    setPain,
    setSorenessTint,
    setFinish,
    setView(v, instant) {
      let t = v === "back" ? Math.PI : 0;
      t += Math.round((rotY - t) / (Math.PI * 2)) * Math.PI * 2;
      targetRotY = t;
      if (instant || getSettings().reduceMotion) rotY = targetRotY;
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      el.remove();
    }
  };
}

/* ---------- favorites & completed ---------- */
const favs = new Set(JSON.parse(localStorage.getItem("forge-favs") || "[]"));

const done = JSON.parse(localStorage.getItem("forge-done") || "{}");

// "progId:dayIdx" -> [dates]
function saveFavs() {
  localStorage.setItem("forge-favs", JSON.stringify([...favs]));
  document.getElementById("favCount").textContent = favs.size;
}

function saveDone() {
  localStorage.setItem("forge-done", JSON.stringify(done));
}

const progById = id => allPrograms().find(p => p.id === id);

function getCustomPrograms() {
  try {
    const l = JSON.parse(localStorage.getItem("forge-custom-programs") || "[]");
    return Array.isArray(l) ? l : [];
  } catch (e) {
    return [];
  }
}

function saveCustomPrograms(l) {
  localStorage.setItem("forge-custom-programs", JSON.stringify(l));
}

function allPrograms() {
  return PROGRAMS.concat(getCustomPrograms());
}

function deleteCustomProgram(id) {
  saveCustomPrograms(getCustomPrograms().filter(p => p.id !== id));
}

/* ---------- accent ---------- */
function applyAccent(id, save) {
  const a = ACCENTS.find(x => x.id === id) || ACCENTS[0];
  document.documentElement.style.setProperty("--volt", a.color);
  document.documentElement.style.setProperty("--volt-ink", a.ink);
  if (save !== false) localStorage.setItem("forge-accent", a.id);
  viewers.forEach(v => {
    if (v.setAccent) v.setAccent(a.color);
  });
  document.querySelectorAll(".accent-pick").forEach(b => b.classList.toggle("on", b.dataset.accent === a.id));
  if ($("mChart") && $("mChart").children.length) {
    try {
      renderMeasureChart();
    } catch (e) {}
  }
}

let finishPreviewViewer = null;

function openSettings() {
  try {
    const grid = $("accentGrid");
    if (!grid) return;
    const cur = currentAccent().id;
    grid.innerHTML = ACCENTS.map(
      a =>
        `<button class="accent-pick ${a.id === cur ? "on" : ""}" data-accent="${a.id}">` +
        `<span class="swatch" style="background:${a.color}"></span>${a.name}</button>`
    ).join("");
    syncSettingsUI();
    const veil = $("settingsVeil");
    if (veil) veil.classList.remove("hidden");
  } catch (e) {
    console.error("openSettings failed:", e);
  }
  // live 3D preview for the finish selector
  try {
    const pc = $("finishPreview");
    if (pc && !finishPreviewViewer) {
      finishPreviewViewer = createBodyViewer(pc, { autoRotate: false, dist: 5.2 });
      if (finishPreviewViewer.setFinish) finishPreviewViewer.setFinish(getSettings().bodyFinish || "standard");
    } else if (finishPreviewViewer && finishPreviewViewer.setFinish) {
      finishPreviewViewer.setFinish(getSettings().bodyFinish || "standard");
    }
  } catch (e) {}
}

function closeSettings() {
  $("settingsVeil").classList.add("hidden");
  try {
    if (finishPreviewViewer) {
      finishPreviewViewer.dispose();
      finishPreviewViewer = null;
    }
    const pc = $("finishPreview");
    if (pc) pc.innerHTML = "";
  } catch (e) {}
}

function syncSettingsUI() {
  const s = getSettings();
  document.querySelectorAll("#unitSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.unit === s.units));
  document
    .querySelectorAll("#goalSeg .seg")
    .forEach(b => b.classList.toggle("on", b.dataset.goal === (s.goal || "maintain")));
  document
    .querySelectorAll("#speedSeg .seg")
    .forEach(b => b.classList.toggle("on", parseFloat(b.dataset.speed) === s.demoSpeed));
  document.querySelectorAll("#langSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.lang === s.lang));
  const tg = (id, on) => $(id).setAttribute("aria-checked", on ? "true" : "false");
  tg("tglSound", s.sound);
  tg("tglMotion", s.reduceMotion);
  tg("tglDemoPlay", s.demoAutoplay);
  tg("tglAutoRest", s.autoRest);
  tg("tglVoice", s.voiceCues);
  tg("tglBigText", s.bigText);
  tg("tglContrast", s.highContrast);
  tg("tglAdvanced", s.advanced);
  tg("tglHaptic", s.haptics);
  syncFinishUI();
  const _rt = $("reminderTime");
  if (_rt) _rt.value = s.reminder || "";
  const eqs = [...new Set(EXERCISES.map(e => e.equipment))].sort();
  $("eqGrid").innerHTML = eqs
    .map(
      q =>
        `<button class="eq-chip ${(s.myEquipment || []).includes(q) ? "on" : ""}" data-eq="${q}">${eqName[q] || q}</button>`
    )
    .join("");
  // Update storage usage display
  try {
    const su = $("storageUsage");
    if (su && typeof ForgeDB !== "undefined") {
      ForgeDB.usage().then(u => {
        const engine = ForgeDB.isIndexedDB() ? "IndexedDB" : "localStorage";
        su.textContent = `Storage: ${ForgeDB.formatBytes(u.used)} of ${ForgeDB.formatBytes(u.quota)} (${u.percent}%) via ${engine}`;
      });
    }
  } catch (e) {}
}

/* ---------- i18n ---------- */
const STRINGS = {
  en: {
    nav_exercises: "Exercises",
    nav_programs: "Programs",
    nav_body: "3D Body Map",
    nav_favorites: "Favorites",
    nav_progress: "Progress",
    home_kicker: "3D GYM TRAINING",
    home_title: "Every muscle. Every exercise. In 3D.",
    home_lede: "243 exercises mapped onto an interactive 3D body. Tap a muscle, see it light up, learn the move.",
    home_cta_body: "Explore the 3D body",
    home_cta_ex: "Browse exercises",
    stat_exercises: "exercises",
    stat_muscles: "muscle groups",
    stat_body: "interactive body",
    home_muscles: "Train by muscle",
    ex_title: "All exercises",
    ex_search_ph: "Search exercises… (e.g. squat, cable, beginner)",
    prog_title: "Training programs",
    prog_lede: "Pick a plan and just train. Every workout is laid out set by set.",
    prog_quiz: "Find my program",
    prog_create: "Create program",
    body_title: "3D Body Map",
    body_lede: "Click any muscle on the body to see every exercise that trains it.",
    body_front: "Front",
    body_back: "Back",
    body_muscles: "Muscles",
    body_recovery: "Recovery",
    body_hint: "Drag to rotate · scroll to zoom · click a muscle",
    fav_title: "Your favorites",
    fav_empty: "Nothing saved yet. Tap the heart on any exercise.",
    progress_title: "Progress",
    tab_overview: "Overview",
    tab_history: "History",
    tab_records: "Records",
    tab_volume: "Volume",
    tab_year: "Year",
    tab_board: "Leaderboard",
    body_pain: "Pain",
    set_title: "Settings",
    set_accent: "Accent color",
    set_accent_note: "Applies across the app, including the 3D body ring.",
    set_units: "Units",
    set_myeq: "My equipment",
    set_myeq_note: "Used by the program quiz and exercise swaps. Empty means everything.",
    set_lang: "Language",
    set_workout: "Workout",
    set_sound: "Rest timer sound",
    set_motion: "Reduce motion",
    set_demos: "Exercise demos",
    set_autoplay: "Autoplay",
    set_speed: "Demo speed",
    set_data: "Data",
    set_haptic: "Haptic feedback",
    set_export: "Export data",
    set_reset: "Reset all data",
    builder_title: "Create program",
    builder_lede: "Build your own training plan from the exercise library.",
    myeq_only: "My equipment only",
    swap_title: "Swap it",
    swap_sub: "same muscle, different gear",
    b_add_day: "Add day",
    b_save: "Save program",
    b_cancel: "Cancel",
    b_delete: "Delete program",
    b_name: "Program name",
    b_name_ph: "e.g. My Push Day Split",
    b_tagline: "Tagline (optional)",
    b_tagline_ph: "e.g. 3 days, dumbbells only"
  },
  fr: {
    nav_exercises: "Exercices",
    nav_programs: "Programmes",
    nav_body: "Corps 3D",
    nav_favorites: "Favoris",
    nav_progress: "Progrès",
    home_kicker: "MUSCULATION 3D",
    home_title: "Chaque muscle. Chaque exercice. En 3D.",
    home_lede:
      "243 exercices sur un corps 3D interactif. Touchez un muscle, voyez-le s'illuminer, apprenez le mouvement.",
    home_cta_body: "Explorer le corps 3D",
    home_cta_ex: "Voir les exercices",
    stat_exercises: "exercices",
    stat_muscles: "groupes musculaires",
    stat_body: "corps interactif",
    home_muscles: "S'entraîner par muscle",
    ex_title: "Tous les exercices",
    ex_search_ph: "Rechercher… (ex. squat, câble, débutant)",
    prog_title: "Programmes",
    prog_lede: "Choisissez un plan et entraînez-vous. Chaque séance est détaillée série par série.",
    prog_quiz: "Trouver mon programme",
    prog_create: "Créer un programme",
    body_title: "Corps 3D",
    body_lede: "Cliquez sur un muscle pour voir tous les exercices qui le travaillent.",
    body_front: "Avant",
    body_back: "Arrière",
    body_muscles: "Muscles",
    body_recovery: "Récupération",
    body_hint: "Glisser pour pivoter · défiler pour zoomer · cliquer un muscle",
    fav_title: "Mes favoris",
    fav_empty: "Rien enregistré. Touchez le cœur sur un exercice.",
    progress_title: "Progrès",
    tab_overview: "Aperçu",
    tab_history: "Historique",
    tab_records: "Records",
    tab_volume: "Volume",
    tab_year: "Année",
    tab_board: "Classement",
    body_pain: "Douleur",
    set_title: "Réglages",
    set_accent: "Couleur d'accent",
    set_accent_note: "S'applique partout, y compris l'anneau du corps 3D.",
    set_units: "Unités",
    set_myeq: "Mon équipement",
    set_myeq_note: "Utilisé par le quiz et les substitutions. Vide = tout.",
    set_lang: "Langue",
    set_workout: "Séance",
    set_sound: "Son du minuteur",
    set_motion: "Réduire les animations",
    set_demos: "Démos d'exercices",
    set_autoplay: "Lecture auto",
    set_speed: "Vitesse des démos",
    set_data: "Données",
    set_haptic: "Retour haptique",
    set_export: "Exporter",
    set_reset: "Tout effacer",
    builder_title: "Créer un programme",
    builder_lede: "Créez votre plan depuis la bibliothèque d'exercices.",
    myeq_only: "Mon équipement uniquement",
    swap_title: "Remplacer",
    swap_sub: "même muscle, autre matériel",
    b_add_day: "Ajouter un jour",
    b_save: "Enregistrer",
    b_cancel: "Annuler",
    b_delete: "Supprimer le programme",
    b_name: "Nom du programme",
    b_name_ph: "ex. Mon split push",
    b_tagline: "Slogan (optionnel)",
    b_tagline_ph: "ex. 3 jours, haltères uniquement"
  }
};

function t(key) {
  const lang = getSettings().lang || "en";
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const txt = t(el.dataset.i18n);
    // replace direct child text nodes only, preserving child elements (SVG, spans)
    let first = true;
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        if (first) {
          node.textContent = txt;
          first = false;
        } else node.textContent = "";
      }
    });
    if (first) el.textContent = txt;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.documentElement.lang = getSettings().lang || "en";
}

/* ---------- settings state ---------- */
const DEFAULT_SETTINGS = {
  units: "kg",
  sound: true,
  demoAutoplay: true,
  demoSpeed: 1,
  reduceMotion: false,
  myEquipment: [],
  lang: "en",
  autoRest: true,
  restShort: 60,
  restLong: 180,
  voiceCues: false,
  reminder: "",
  advanced: false,
  haptics: true,
  bodyFinish: "standard"
};

function getSettings() {
  try {
    return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem("forge-settings") || "{}"));
  } catch (e) {
    return Object.assign({}, DEFAULT_SETTINGS);
  }
}

function saveSettings(s) {
  localStorage.setItem("forge-settings", JSON.stringify(s));
}

function unitLabel() {
  return getSettings().units;
}

function fromKg(kg) {
  const v = getSettings().units === "lb" ? kg * 2.20462 : kg;
  return Math.round(v * 10) / 10;
}

function toKg(v) {
  return getSettings().units === "lb" ? v / 2.20462 : v;
}

function fmtW(kg) {
  return fromKg(kg) + " " + unitLabel();
}

function fmtDate(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/* ---------- workout log (IndexedDB via ForgeDB) ---------- */
function getLog() {
  if (typeof ForgeDB !== "undefined") return ForgeDB.getLogs();
  try {
    const l = JSON.parse(localStorage.getItem("forge-log") || "[]");
    return Array.isArray(l) ? l : [];
  } catch (e) {
    return [];
  }
}

function saveLog(l) {
  if (typeof ForgeDB !== "undefined") {
    ForgeDB.saveLogs(l);
    return;
  }
  localStorage.setItem("forge-log", JSON.stringify(l));
}

function getGoals() {
  try {
    const g = JSON.parse(localStorage.getItem("forge-goals") || "[]");
    return Array.isArray(g) ? g : [];
  } catch (e) {
    return [];
  }
}

function saveGoals(g) {
  localStorage.setItem("forge-goals", JSON.stringify(g));
}

function getTemplates() {
  try {
    const t = JSON.parse(localStorage.getItem("forge-templates") || "[]");
    return Array.isArray(t) ? t : [];
  } catch (e) {
    return [];
  }
}

function saveTemplates(t) {
  localStorage.setItem("forge-templates", JSON.stringify(t));
}

function lastWeightKg(exId) {
  const log = getLog();
  for (let i = log.length - 1; i >= 0; i--) {
    const x = log[i].exercises.find(e => e.id === exId);
    if (x) for (let j = x.sets.length - 1; j >= 0; j--) if (x.sets[j].weight) return x.sets[j].weight;
  }
  return null;
}

function exercisePR(exId) {
  let best = null;
  getLog().forEach(w =>
    w.exercises.forEach(x => {
      if (x.id !== exId) return;
      x.sets.forEach(s => {
        const wgt = s.weight || 0;
        if (!best || wgt > best.weight || (wgt === best.weight && s.reps > best.reps))
          best = { weight: wgt, reps: s.reps };
      });
    })
  );
  return best;
}

function muscleLastTrained() {
  const last = {};
  getLog().forEach(w => {
    (w.exercises || []).forEach(x => {
      const ex = byId(x.id);
      if (!ex) return;
      const g = groupOf(ex.primary);
      if (!last[g] || w.date > last[g]) last[g] = w.date;
    });
  });
  return last;
}

function daysAgo(dateStr) {
  const d = new Date(dateStr + "T12:00:00"),
    n = new Date();
  n.setHours(12, 0, 0, 0);
  return Math.max(0, Math.round((n - d) / 864e5));
}

function getPain() {
  try {
    return JSON.parse(localStorage.getItem("forge-pain") || "{}");
  } catch (e) {
    return {};
  }
}

function savePain(p) {
  try {
    localStorage.setItem("forge-pain", JSON.stringify(p));
  } catch (e) {}
}

function getSoreness() {
  try {
    return JSON.parse(localStorage.getItem("forge-sore") || "{}");
  } catch (e) {
    return {};
  }
}

function saveSoreness(s) {
  try {
    localStorage.setItem("forge-sore", JSON.stringify(s));
  } catch (e) {}
}

function muscleHeat() {
  const last = {};
  getLog().forEach(w => {
    const ago = daysAgo(w.date);
    w.exercises.forEach(x => {
      const ex = byId(x.id);
      if (!ex) return;
      [ex.primary].concat(ex.secondary || []).forEach(g => {
        g = groupOf(g);
        if (last[g] == null || ago < last[g]) last[g] = ago;
      });
    });
  });
  const heat = {};
  for (const g in last) heat[g] = last[g] <= 1 ? 1 : last[g] === 2 ? 0.65 : last[g] === 3 ? 0.35 : 0;
  return heat;
}

function muscleFatigue() {
  // accumulated volume per muscle, decaying over 7 days
  const fatigue = {};
  const now = Date.now();
  getLog().forEach(w => {
    const daysAgo = (now - w.ts) / 864e5;
    if (daysAgo > 7) return;
    const decay = 1 - daysAgo / 7;
    w.exercises.forEach(x => {
      const ex = byId(x.id);
      if (!ex) return;
      const vol = x.sets.reduce((a, s) => a + s.weight * s.reps, 0);
      const g = groupOf(ex.primary);
      fatigue[g] = (fatigue[g] || 0) + vol * decay;
    });
  });
  const max = Math.max(1, ...Object.values(fatigue));
  const out = {};
  for (const g in fatigue) out[g] = Math.min(1, fatigue[g] / max);
  return out;
}

function startReplay(entry) {
  const v = window._bodyViewer;
  if (!v || !entry) return;
  const muscles = [];
  entry.exercises.forEach(x => {
    const ex = byId(x.id);
    if (ex) muscles.push(groupOf(ex.primary));
  });
  let i = 0;
  window._bodyMode = "muscles";
  if (window._syncBodyMode) window._syncBodyMode();
  const step = () => {
    if (i >= muscles.length) {
      v.setHeat(muscleHeat());
      return;
    }
    const heat = {};
    muscles.slice(0, i + 1).forEach(g => (heat[g] = 1));
    v.setHeat(heat);
    // show exercise name
    const ex = byId(entry.exercises[i].id);
    if (ex) {
      let label = document.getElementById("replayLabel");
      if (!label) {
        label = document.createElement("div");
        label.id = "replayLabel";
        label.style.cssText = "text-align:center;font-size:18px;font-weight:700;margin:12px 0;color:var(--volt)";
        $("body3d").parentNode.insertBefore(label, $("body3d").nextSibling);
      }
      label.textContent = `${i + 1}/${muscles.length}: ${ex.name}`;
    }
    i++;
    setTimeout(step, 1200);
  };
  step();
}

function latestBodyweightKg() {
  const m = getMeasures();
  for (let i = m.length - 1; i >= 0; i--) if (m[i].weight) return toKg(m[i].weight);
  return 0;
}

function setVolumeKg(exId, s) {
  const ex = byId(exId);
  if (ex && ex.equipment === "bodyweight") {
    return (latestBodyweightKg() + (s.added || 0)) * (s.reps || 0);
  }
  return (s.weight || 0) * (s.reps || 0);
}

function totalVolumeKg(log) {
  return (log || getLog()).reduce(
    (a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((d, s) => d + setVolumeKg(x.id, s), 0), 0),
    0
  );
}

function volumeByMuscle(days) {
  const cutoff = new Date();
  cutoff.setHours(12, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  const vol = {};
  getLog().forEach(w => {
    if (new Date(w.date + "T12:00:00") < cutoff) return;
    w.exercises.forEach(x => {
      const ex = byId(x.id);
      if (!ex) return;
      const g = groupOf(ex.primary);
      vol[g] = (vol[g] || 0) + x.sets.length;
    });
  });
  return vol;
}

function weeklyStreak(log) {
  const weeks = new Set(
    (log || getLog()).map(w => {
      const d = new Date((w.date || "") + "T12:00:00");
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return fmtDate(monday);
    })
  );
  let streak = 0;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (!weeks.has(fmtDate(d))) d.setDate(d.getDate() - 7);
  while (weeks.has(fmtDate(d))) {
    streak++;
    d.setDate(d.getDate() - 7);
  }
  return streak;
}

function workoutStreak() {
  const days = [...new Set(getLog().map(w => w.date))].sort();
  if (!days.length) return 0;
  const xp = getXP();
  const month = fmtDate(new Date()).slice(0, 7);
  if (xp.freezeMonth !== month) {
    xp.freeze = 1;
    xp.freezeMonth = month;
    xp.frozen = [];
    saveXP(xp);
  }
  xp.frozen = xp.frozen || [];
  let streak = 0,
    changed = false;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (!days.includes(fmtDate(d))) d.setDate(d.getDate() - 1);
  while (true) {
    const key = fmtDate(d);
    if (days.includes(key) || xp.frozen.includes(key)) {
      streak++;
    } else if ((xp.freeze || 0) > 0 && streak > 0) {
      xp.freeze--;
      xp.frozen.push(key);
      streak++;
      changed = true;
    } else break;
    d.setDate(d.getDate() - 1);
  }
  if (changed) saveXP(xp);
  return streak;
}

/* ---------- active program ---------- */
const getActiveProg = () => localStorage.getItem("forge-active") || null;

function setActiveProg(id) {
  if (id) localStorage.setItem("forge-active", id);
  else localStorage.removeItem("forge-active");
}

function nextDayIdx(p) {
  const i = p.days.findIndex((d, di) => !(done[p.id + ":" + di] || []).length);
  return i === -1 ? 0 : i;
}

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);

const QUOTES = [
  "The last three or four reps is what makes the muscle grow.",
  "Strength does not come from winning. Your struggles develop your strengths.",
  "The body achieves what the mind believes.",
  "Don\u2019t wish for it. Work for it.",
  "Push yourself because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Discipline is choosing what you want most over what you want now.",
  "The pain you feel today will be the strength you feel tomorrow."
];

function miniToast(msg) {
  const t = document.createElement("div");
  t.className = "mini-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 2200);
}

let logoTaps = 0,
  logoTimer = null;

const footBrand = document.querySelector(".foot-brand");

if (footBrand) {
  footBrand.style.cursor = "pointer";
  footBrand.addEventListener("click", e => {
    e.preventDefault();
    logoTaps++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => {
      logoTaps = 0;
    }, 2000);
    if (logoTaps >= 5) {
      logoTaps = 0;
      footBrand.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], {
        duration: 600,
        easing: "cubic-bezier(.2,.8,.3,1)"
      });
      const msgs = ["You found it!", "Still forging!", "No shortcuts. Just reps.", "Okay, back to training!"];
      miniToast(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  });
}

const fq = $("footQuote");

if (fq) {
  const d = new Date();
  fq.textContent =
    "\u201C" + QUOTES[(d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % QUOTES.length] + "\u201D";
}

const fa = $("footAccents");

if (fa) {
  fa.innerHTML = ACCENTS.map(
    a =>
      `<button style="background:${a.color}" data-faccent="${a.id}" aria-label="${a.name}" title="${a.name}" class="${(localStorage.getItem("forge-accent") || "volt") === a.id ? "on" : ""}"></button>`
  ).join("");
  fa.querySelectorAll("[data-faccent]").forEach(b => {
    b.onclick = () => {
      applyAccent(b.dataset.faccent);
      fa.querySelectorAll("[data-faccent]").forEach(x => x.classList.toggle("on", x === b));
    };
  });
}

const CHANGELOG = [
  ["v11.75", "restore handles export format too"],
  ["v11.74", "fix ForgeDB reference in backup/restore"],
  ["v11.73", "fix session volume popup positioning and instant-close"],
  ["v11.72", "fix backup/restore/reset to handle IndexedDB"],
  ["v11.71", "fix challenge bar width and add JS cache-busting"],
  ["v11.70", "make challenge bars more visible"],
  ["v11.69", "fix challenge progress bars"],
  ["v11.68", "fix chart overflow"],
  ["v11.67", "fix history tap and storage race condition"],
  ["v11.66", "IndexedDB migration for photos and workout logs"],
  ["v11.65", "cycle 4 audit fixes"],
  ["v11.64", "cycle 3 audit fixes"],
  ["v11.63", "fix remaining hardcoded kg units"],
  ["v11.62", "cycle 1 audit fixes"],
  ["v11.61", "fix auto-rotate fighting front/back"],
  ["v11.60", "fix front/back viewer disposal"],
  ["v11.59", "body map soreness fixes"],
  ["v11.58", "remove My Workouts"],
  ["v11.57", "independent event wiring with safeOn"],
  ["v11.56", "fix hero text, settings open"],
  ["v11.55", "protect all top-level wiring from first element"],
  ["v11.54", "on-page error display for diagnosis"],
  ["v11.53", "ensure router always runs even if wiring throws"],
  ["v11.52", "isolate all homepage sections"],
  ["v11.51", "fix first-load race, footer program count"],
  ["v11.50", "fix cold-load hero, footer count, program plural"],
  ["v11.49", "fix renderHome null element crash"],
  ["v11.48", "defensive error handling for 3D viewers"],
  ["v11.47", "dynamic exercise counts on homepage"],
  ["v11.46", "richer calendar day detail with stat cards"],
  ["v11.45", "fix chart popup overflowing viewport"],
  ["v11.44", "level up dialog: trophy and level number side by side"],
  ["v11.43", "merge voice log and voice commands into one smart voice button"],
  ["v11.42", "merge pain into soreness as injured level, remove separate pain mode"],
  [
    "v11.41",
    "my workouts fixes: clean empty slot, styled inputs, no text wrap, nav next to programs, dynamic footer counts; muscle sheet: soreness on top, centered, live 3D update"
  ],
  ["v11.40", "fix duplicate form cues, improve section spacing"],
  [
    "v11.39",
    "interactive upgrades: scrubbable demos, form cues/mistakes, workout builder, variations, tappable charts, badges, soreness overlay, voice commands, anatomy deep-dives; 50 new exercises, 5 new programs"
  ],
  ["v11.38", "prettier formatting across js, css, html; fixed stray div tag"],
  ["v11.37", "code formatting: 2 blank lines between functions, 1 declaration per line in CSS, fixed split brace bugs"],
  ["v11.36", "Refactor: split codebase into js and css modules"],
  ["v11.35", "Fix Clips button navigating to exercise page"],
  ["v11.34", "Fix mirror rest timer, uniform action buttons"],
  ["v11.33", "Camera fixes: icon action bar, camera switch, mirror sets, toasts"],
  ["v11.32", "Camera features: form recorder, mirror mode, photo capture"],
  ["v11.31", "Align all card padding to documented system"],
  ["v11.30", "Volume count-up shows whole numbers only"],
  ["v11.29", "Match recovery dashboard card style to body panel"],
  ["v11.28", "Compact workout complete buttons to one row with icons"],
  ["v11.27", "Move recovery dashboard to own section on body page"],
  ["v11.26", "Fix recovery suggestion card, ensure body dashboard renders"],
  ["v11.25", "Move recovery dashboard to 3D Body page"],
  ["v11.24", "Fix goals not refreshing after add"],
  ["v11.23", "Fix volume records row layout overlap"],
  ["v11.22", "7 new features: recovery dashboard, goals, PR timeline, volume PRs, set comparison, ratings, pace timer"],
  ["v11.21", "Fix week volume excluding today's workouts"],
  ["v11.20", "Revert empty state illustrations"],
  ["v11.19", "Fix nav pill glide for scrolled nav positions"],
  ["v11.18", "Fix nav pill glide, week ring text and empty data, empty state icons"],
  [
    "v11.17",
    "Visual polish pass: animated nav indicator, button press physics, chart entrance animations, card depth, typography scale, two-column Insights, workout celebration, illustrated empty states, weekly progress ring, streak flame"
  ],
  ["v11.16", "Fix doubled unit in last-time summary (was showing kg twice)"],
  [
    "v11.15",
    "Warm-up set generator in the workout player: one-tap warm-up sets based on last session's working weight"
  ],
  ["v11.14", "Fix radar chart label overlap."],
  ["v11.13", "Movement balance radar on Insights, set-complete micro-animation."],
  ["v11.12", "Fix finish preview layout in settings."],
  ["v11.11", "Live 3D preview for body finish in settings."],
  ["v11.10", "Rewrite photo slider with clip-path so images stay aligned."],
  ["v11.09", "Fix body finish setting scope."],
  ["v11.08", "Fix reduced motion override, photo slider alignment, compare dialog header."],
  ["v11.07", "Body finish moved to settings (applies everywhere); fixed reduced motion toggle."],
  ["v11.06", "Correct barbell anatomy: plates load on the sleeves at the bar ends."],
  ["v11.05", "Tighter barbell diagram: bar and collars hug the plates."],
  ["v11.04", "Last-time beatdown, photo compare slider, grouped equipment swaps, page transitions, 3D body finishes."],
  ["v11.03", "Visual barbell diagram in plate calculator."],
  ["v11.02", "Tighter gap between content and footer."],
  ["v11.01", "Reduced bottom padding before footer."],
  ["v11.00", "Body map uses more width on large screens."],
  ["v10.99", "Footer sticks to bottom on short pages."],
  ["v10.98", "Body map fills available width from tablet landscape up."],
  ["v10.97", "Wider body map and larger heatmap on desktop."],
  ["v10.96", "Centered privacy cards on wide screens."],
  ["v10.95", "Privacy page back inside main, hero badge restored."],
  ["v10.94", "Privacy page uses standard page title pattern."],
  ["v10.93", "Fixed privacy page spacing and accent colors."],
  ["v10.92", "Redesigned privacy page with icon rows."],
  ["v10.91", "Release notes show latest 5 with a Show older toggle."],
  ["v10.90", "Release notes now update automatically."],
  ["v10.89", "Removed redundant footer pills. Capitalized footer tagline."],
  ["v10.88", "Privacy page. Slimmer footer."],
  ["v10.87", "Subtle dot pattern footer background."],
  ["v10.86", "Version bump to trigger fresh Pages build."],
  ["v10.85", "Footer easter egg. Homepage greeting."],
  ["v10.84", "Footer accent dots. Daily training quote."],
  ["v10.83", "Smaller program builder buttons."],
  ["v10.82", "Fixed JS crash that broke the app."],
  ["v10.80", "Back to top button. Removed footer glow."],
  ["v10.78", "Fixed broken styles from footer CSS."],
  ["v10.77", "New centered footer design."]
];

const fv = $("footVer"),
  fc = $("footChangelog");

if (fv && fc) {
  const N = 5;
  const row = ([v, t]) => `<div><b>${v}</b> - ${t}</div>`;
  const recent = CHANGELOG.slice(0, N).map(row).join("");
  const older =
    CHANGELOG.length > N
      ? `<div class="hidden" id="footOlder">${CHANGELOG.slice(N).map(row).join("")}</div>
       <button class="foot-more" id="footMore">Show older</button>`
      : "";
  fc.innerHTML = recent + older;
  const more = $("footMore");
  if (more)
    more.onclick = e => {
      e.stopPropagation();
      const o = $("footOlder");
      o.classList.toggle("hidden");
      more.textContent = o.classList.contains("hidden") ? "Show older" : "Show less";
    };
  fv.onclick = () => fc.classList.toggle("hidden");
}

const hg = $("homeGreet");

if (hg) {
  const hr = new Date().getHours();
  hg.textContent = hr < 5 ? "Night owl" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
}

const toTop = $("toTop");

if (toTop) {
  window.addEventListener(
    "scroll",
    () => {
      toTop.classList.toggle("show", window.scrollY > 600);
    },
    { passive: true }
  );
  toTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const emptyNote = (title, hint) => `<div class="empty-note"><p><b>${title}</b></p><p>${hint}</p></div>`;

const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

const eqName = {
  bodyweight: "Bodyweight",
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  kettlebell: "Kettlebell",
  band: "Band"
};

const lvlDots = l => (l === "beginner" ? "●○○" : l === "intermediate" ? "●●○" : "●●●");

const byId = id => EXERCISES.find(e => e.id === id);

let viewers = [];

function clearViewers() {
  viewers.forEach(v => v.dispose());
  viewers = [];
}

function applyBodyFinish(name) {
  viewers.forEach(v => {
    if (v.setFinish) v.setFinish(name);
  });
  if (window._bodyViewer && window._bodyViewer.setFinish && !viewers.includes(window._bodyViewer))
    window._bodyViewer.setFinish(name);
}

let demos = [];

function clearDemos() {
  demos.forEach(d => d.destroy());
  demos = [];
}

function heartBtn(ex) {
  return `<button class="heart ${favs.has(ex.id) ? "faved" : ""}" data-fav="${ex.id}" title="Save" aria-label="Save to favorites">${window.FORGE_ICON("heart")}</button>`;
}

function cardHTML(ex) {
  return `<div class="card" data-ex="${ex.id}">
    ${heartBtn(ex)}
    <h3>${esc(ex.name)}</h3>
    <div class="meta">
      <span class="tag volt-tag">${MUSCLE_INFO[ex.primary] ? MUSCLE_INFO[ex.primary].name : ex.primary}</span>
      <span>${eqName[ex.equipment] || ex.equipment}</span>
      <span class="dots" title="${ex.level}">${lvlDots(ex.level)}</span>
    </div>
  </div>`;
}

document.addEventListener("click", e => {
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    e.stopPropagation();
    const id = fav.dataset.fav;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    saveFavs();
    document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => {
      b.classList.toggle("faved", favs.has(id));
      /* filled state handled by .faved class */
    });
    const df = $("dFav");
    if (df && df.dataset.id === id) syncDetailFav(byId(id));
    if ((location.hash || "").includes("favorites")) renderFavorites();
    return;
  }
  const card = e.target.closest("[data-ex]");
  if (card) location.hash = "#/exercise/" + card.dataset.ex;
});

/* audio beep: respects sound setting, optional freq/dur */
function beep(freq, dur) {
  if (!getSettings().sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = freq || 880;
    o.type = "sine";
    const d = dur || 0.5;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + d);
    o.start();
    o.stop(ctx.currentTime + d + 0.05);
  } catch (e) {}
}
