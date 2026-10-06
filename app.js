/* FORGE - 3D gym training app */
(function () {
  'use strict';

  /* ---------- muscle metadata ---------- */
  const MUSCLE_INFO = {
    chest:      { name: "Chest",        desc: "Pectorals. The pushing muscles behind every press, push-up and dip." },
    back:       { name: "Back",         desc: "Rhomboids and mid-traps. A thick upper back built with rows and deadlifts." },
    lats:       { name: "Lats",         desc: "Latissimus dorsi, the wings. Pull-ups and pulldowns build width." },
    traps:      { name: "Traps",        desc: "Trapezius. Shrugs and carries build the upper-back shelf." },
    "lower-back": { name: "Lower Back", desc: "Erector spinae. Keeps your spine strong under load." },
    shoulders:  { name: "Shoulders",    desc: "Deltoids. Pressing and raising builds capped shoulders." },
    biceps:     { name: "Biceps",       desc: "Front of the upper arm. Curls of every kind." },
    triceps:    { name: "Triceps",      desc: "Back of the upper arm. About two thirds of your arm size." },
    forearms:   { name: "Forearms",     desc: "Grip strength. Carries, hangs and wrist work." },
    abs:        { name: "Abs",          desc: "Rectus abdominis, the six-pack wall. Train it with resistance." },
    obliques:   { name: "Obliques",     desc: "Side core. Rotation and anti-rotation strength." },
    glutes:     { name: "Glutes",       desc: "The powerhouse. Hip thrusts, swings and lunges." },
    quads:      { name: "Quads",        desc: "Front of the thigh. Squats, presses and lunges." },
    hamstrings: { name: "Hamstrings",   desc: "Back of the thigh. Hinges, curls and Nordics." },
    calves:     { name: "Calves",       desc: "Lower leg. Raises with a full stretch and squeeze." },
    "full-body":{ name: "Full Body",    desc: "Compound conditioning. Multiple muscles, maximum output." },
    cardio:     { name: "Cardio",       desc: "Engine building. Heart, lungs and work capacity." }
  };

  /* ---------- custom exercises (user-created, stored locally) ---------- */
  function getCustomExercises() {
    try {
      const v = JSON.parse(localStorage.getItem("forge-custom-exercises") || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function saveCustomExercises(list) {
    try { localStorage.setItem("forge-custom-exercises", JSON.stringify(list)); } catch (e) {}
  }
  EXERCISES.push(...getCustomExercises());
  function openCustomModal() {
    $("customName").value = "";
    $("customSecondary").querySelectorAll("input:checked").forEach(c => { c.checked = false; });
    $("customVeil").classList.remove("hidden");
    setTimeout(() => $("customName").focus(), 60);
  }
  function closeCustomModal() { $("customVeil").classList.add("hidden"); }
  function saveCustomExercise() {
    const name = $("customName").value.trim();
    if (!name) { appAlert("Give your exercise a name first."); return; }
    const primary = $("customPrimary").value;
    const secondary = Array.from($("customSecondary").querySelectorAll("input:checked")).map(c => c.value).filter(v => v !== primary);
    const ex = {
      id: "custom-" + Date.now().toString(36),
      name, primary, secondary,
      equipment: $("customEquipment").value,
      level: $("customLevel").value,
      custom: true, steps: [], pattern: "custom"
    };
    const list = getCustomExercises();
    list.push(ex); saveCustomExercises(list);
    EXERCISES.push(ex);
    closeCustomModal();
    initExercises(); renderExercises();
  }
  const MANNEQUIN_IDS = ["chest","back","lats","traps","lower-back","front-delt","side-delt","rear-delt",
    "biceps","triceps","forearms","abs","obliques","glutes","quads","hamstrings","calves"];
  const DELT_TO_GROUP = { "front-delt": "shoulders", "side-delt": "shoulders", "rear-delt": "shoulders" };
  const groupOf = (mid) => DELT_TO_GROUP[mid] || mid;
  function expandMuscles(groupId) {
    if (groupId === "shoulders") return ["front-delt", "side-delt", "rear-delt"];
    if (groupId === "full-body" || groupId === "cardio") return MANNEQUIN_IDS.slice();
    return [groupId];
  }

  /* ---------- accent colors ---------- */
  const ACCENTS = [
    { id: "volt",    name: "Volt",    color: "#d4ff3f", ink: "#0b0d12" },
    { id: "ember",   name: "Ember",   color: "#ff7847", ink: "#0b0d12" },
    { id: "aqua",    name: "Aqua",    color: "#38e1ff", ink: "#0b0d12" },
    { id: "violet",  name: "Violet",  color: "#b49aff", ink: "#0b0d12" },
    { id: "crimson", name: "Crimson", color: "#ff4d6d", ink: "#ffffff" },
    { id: "gold",    name: "Gold",    color: "#ffd23f", ink: "#0b0d12" }
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
    const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(3, 6, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x7c8cff, 0.85); rim.position.set(-4, 3, -4); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xdde4ff, 0.35); fill.position.set(0, 2, 6); scene.add(fill);

    const BODY_FINISHES = {
      standard: { base: 0x3b4356, neutral: 0x222836, roughness: 0.45, metalness: 0.08, opacity: 1 },
      chrome: { base: 0x9aa4b8, neutral: 0x5a6272, roughness: 0.15, metalness: 0.9, opacity: 1 },
      xray: { base: 0x7cc4ff, neutral: 0x3a5a7a, roughness: 0.3, metalness: 0.1, opacity: 0.35 },
      matte: { base: 0x4a4458, neutral: 0x2a2733, roughness: 0.9, metalness: 0.0, opacity: 1 }
    };
    const VTHEME = { base: 0x3b4356, neutral: 0x222836, primary: 0x5e2a22 };
    const vTheme = VTHEME;

    // soft blob shadow under feet
    const bc = document.createElement("canvas"); bc.width = bc.height = 128;
    const bg = bc.getContext("2d");
    const grd = bg.createRadialGradient(64, 64, 6, 64, 64, 62);
    grd.addColorStop(0, "rgba(0,0,0,0.6)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    bg.fillStyle = grd; bg.fillRect(0, 0, 128, 128);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.295; scene.add(blob);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.63, 72),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(currentAccent().color), transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.30; scene.add(ring);

    const body = new THREE.Group(); scene.add(body);
    const baseMat = new THREE.MeshStandardMaterial({ color: vTheme.base, roughness: 0.45, metalness: 0.08 });
    const neutralMat = new THREE.MeshStandardMaterial({ color: vTheme.neutral, roughness: 0.55, metalness: 0.05 });
    const mats = {};
    const muscleMeshes = [];
    const matFor = mid => (mats[mid] || (mats[mid] = baseMat.clone()));
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

    function part(geo, mid, x, y, z, parent) {
      const m = new THREE.Mesh(geo, mid ? matFor(mid) : neutralMat);
      m.position.set(x, y, z);
      if (mid) { m.userData.muscle = mid; muscleMeshes.push(m); }
      (parent || body).add(m);
      return m;
    }
    function capMesh(r, a, b, mid, parent) {
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 18), matFor(mid));
      m.position.copy(a).lerp(b, 0.5);
      m.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize());
      m.userData.muscle = mid; muscleMeshes.push(m);
      (parent || body).add(m);
      return m;
    }
    const ball = (r, mid, x, y, z, parent) => part(new THREE.SphereGeometry(r, 26, 20), mid, x, y, z, parent);
    const box = (w, h, d, mid, x, y, z, parent) => part(new THREE.BoxGeometry(w, h, d), mid, x, y, z, parent);

    /* ---- head & neck (anatomical) ---- */
    const skull = ball(0.185, null, 0, 3.42, 0.015);
    skull.scale.set(0.92, 1.05, 0.98);
    const jaw = ball(0.115, null, 0, 3.315, 0.045); jaw.scale.set(0.95, 0.82, 0.9);
    // face: subtle brow, nose, chin for human read
    const brow = ball(0.045, null, 0, 3.46, 0.155); brow.scale.set(1.6, 0.5, 0.6);
    part(new THREE.CylinderGeometry(0.075, 0.095, 0.18, 18), null, 0, 3.12, 0);
    // trapezius neck blend
    for (const s of [-1, 1]) {
      const trapNeck = capMesh(0.065, V3(s * 0.04, 3.10, -0.02), V3(s * 0.12, 2.98, -0.03), "traps");
    }

    /* ---- torso: athletic V-taper with defined musculature ---- */
    const profile = [
      [0.012, 1.90], [0.148, 1.92], [0.188, 2.00], [0.175, 2.14], [0.162, 2.28],
      [0.170, 2.42], [0.198, 2.56], [0.225, 2.68], [0.232, 2.76], [0.208, 2.86],
      [0.148, 2.94], [0.094, 3.00], [0.070, 3.07]
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
      const pecLower = ball(0.135, "chest", s * 0.135, 2.63, 0.150);
      pecLower.scale.set(1.30, 0.62, 0.48);
      pecLower.rotation.z = s * -0.10;
    }
    // abs: 6-pack with defined separations
    for (const r of [0, 1, 2]) for (const s of [-1, 1]) {
      const ab = ball(0.080, "abs", s * 0.068, 2.48 - r * 0.112, 0.158);
      ab.scale.set(1.20, 0.92, 0.55);
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
      capMesh(0.062, V3(s * 0.180, 2.52, 0.055), V3(s * 0.200, 2.26, 0.045), "obliques");
      const obBlade = ball(0.075, "obliques", s * 0.190, 2.40, 0.050);
      obBlade.scale.set(0.6, 1.3, 0.7);
    }
    // lats: wider, more flared wings
    for (const s of [-1, 1]) {
      const l = ball(0.155, "lats", s * 0.195, 2.54, -0.125);
      l.scale.set(0.52, 1.30, 0.44); l.rotation.z = s * 0.14;
      const latLow = ball(0.095, "lats", s * 0.165, 2.32, -0.115);
      latLow.scale.set(0.55, 1.1, 0.45);
    }
    // upper back: rhomboids + mid traps (kept proud of the core so they stay visible)
    const ub = ball(0.160, "back", 0, 2.72, -0.180); ub.scale.set(1.25, 0.72, 0.50);
    for (const s of [-1, 1]) {
      const rhomb = ball(0.085, "back", s * 0.085, 2.68, -0.185);
      rhomb.scale.set(0.8, 1.1, 0.5);
      rhomb.rotation.z = s * 0.25;
    }
    for (const s of [-1, 1])                                   // erector spinae: thicker
      capMesh(0.068, V3(s * 0.068, 2.24, -0.152), V3(s * 0.068, 1.96, -0.152), "lower-back");
    const pelvis = ball(0.215, null, 0, 1.845, 0); pelvis.scale.set(1.02, 0.72, 0.82);
    for (const s of [-1, 1]) {                                 // glutes: fuller
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
      deltS.scale.set(0.95, 1.20, 0.95);
      const deltR = ball(0.120, "rear-delt", 0, 0.03, -0.102, g);
      deltR.scale.set(1, 1.05, 0.9);
      // upper-arm flesh core: continuous flow under the muscles (not clickable)
      const armCore = new THREE.Mesh(new THREE.CapsuleGeometry(0.100, 0.50, 6, 18), neutralMat);
      armCore.position.set(s * 0.038, -0.28, 0); g.add(armCore);
      // biceps: long head + short head with peak
      capMesh(0.108, V3(s * 0.028, -0.08, 0.055), V3(s * 0.042, -0.42, 0.060), "biceps", g);
      const peak = ball(0.105, "biceps", s * 0.036, -0.22, 0.062, g);
      peak.scale.set(1, 1.35, 1.05);
      // triceps: horseshoe with lateral head
      capMesh(0.102, V3(s * 0.028, -0.08, -0.058), V3(s * 0.042, -0.42, -0.062), "triceps", g);
      const triLat = ball(0.088, "triceps", s * 0.075, -0.20, -0.045, g);
      triLat.scale.set(0.9, 1.25, 0.9);
      ball(0.078, null, s * 0.05, -0.50, 0, g);                // elbow
      // forearm: defined extensors/flexors
      const foreG = new THREE.Group();
      foreG.position.set(s * 0.05, -0.50, 0);
      const foreTop = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.068, 0.30, 20), matFor("forearms"));
      foreTop.position.set(s * 0.005, -0.16, 0.005);
      foreTop.userData.muscle = "forearms"; muscleMeshes.push(foreTop); foreG.add(foreTop);
      const foreLow = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.18, 18), matFor("forearms"));
      foreLow.position.set(s * 0.005, -0.38, 0.005);
      foreLow.userData.muscle = "forearms"; muscleMeshes.push(foreLow); foreG.add(foreLow);
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.124, 0.049), neutralMat);
      palm.position.set(s * 0.013, -0.52, 0.010); foreG.add(palm);
      for (let f = 0; f < 4; f++) {
        const fg = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.072, 4, 10), neutralMat);
        fg.position.set(s * (0.013 - 0.035 + f * 0.023), -0.615, 0.014);
        fg.rotation.x = 0.35;
        foreG.add(fg);
      }
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.058, 4, 10), neutralMat);
      thumb.position.set(s * 0.062, -0.535, 0.024);
      thumb.rotation.z = s * -0.5; thumb.rotation.x = 0.3;
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
      const rectus = ball(0.118, "quads", s * 0.160, 1.42, 0.090);
      rectus.scale.set(0.95, 1.45, 0.95);
      capMesh(0.098, V3(s * 0.208, 1.58, 0.030), V3(s * 0.218, 1.16, 0.030), "quads"); // vastus lateralis sweep
      const tear = ball(0.118, "quads", s * 0.148, 1.20, 0.088);   // vastus medialis teardrop
      tear.scale.set(1, 1.35, 1.05);
      // hamstrings: biceps femoris + semitendinosus separation
      capMesh(0.095, V3(s * 0.122, 1.62, -0.088), V3(s * 0.128, 1.10, -0.088), "hamstrings");
      capMesh(0.095, V3(s * 0.202, 1.62, -0.088), V3(s * 0.208, 1.10, -0.088), "hamstrings");
      const hamMid = ball(0.085, "hamstrings", s * 0.165, 1.38, -0.088);
      hamMid.scale.set(1.1, 1.3, 0.9);
      ball(0.088, null, s * 0.172, 1.02, 0.03);                   // knee
      // calves: two gastrocnemius heads + soleus
      const gastMed = ball(0.092, "calves", s * 0.128, 0.88, -0.058);
      gastMed.scale.set(0.95, 1.25, 0.95);
      const gastLat = ball(0.092, "calves", s * 0.216, 0.88, -0.058);
      gastLat.scale.set(0.95, 1.25, 0.95);
      const soleus = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.055, 0.32, 20), matFor("calves"));
      soleus.position.set(s * 0.172, 0.60, -0.048);
      soleus.userData.muscle = "calves"; muscleMeshes.push(soleus); body.add(soleus);
      box(0.105, 0.085, 0.13, null, s * 0.172, 0.355, -0.035);    // heel
      const toe = box(0.10, 0.07, 0.19, null, s * 0.172, 0.345, 0.095); // forefoot
      toe.rotation.x = -0.06; toe.rotation.y = s * 0.12;                // toes out, natural stance
    }

    /* ---- highlight ---- */
    let hlState = { p: [], s: [], soft: false };
    function reset() {
      for (const id in mats) {
        mats[id].emissive.setHex(0x000000); mats[id].emissiveIntensity = 0;
        mats[id].color.setHex(vTheme.base);
      }
    }
    function highlight(primaryIds, secondaryIds, allSoft) {
      hlState = { p: primaryIds || [], s: secondaryIds || [], soft: !!allSoft };
      reset();
      if (allSoft) {
        for (const id in mats) { mats[id].emissive.setHex(0xff5c1a); mats[id].emissiveIntensity = 0.38; }
        return;
      }
      (primaryIds || []).forEach(id => {
        if (mats[id]) { mats[id].emissive.setHex(0xff3b1f); mats[id].emissiveIntensity = 1.1; mats[id].color.setHex(vTheme.primary); }
      });
      (secondaryIds || []).forEach(id => {
        if (mats[id] && !(primaryIds || []).includes(id)) { mats[id].emissive.setHex(0xff9f2e); mats[id].emissiveIntensity = 0.55; }
      });
    }
    function setAccent(hex) {
      ring.material.color.set(hex);
    }
    function setHeat(heatByGroup) {
      reset();
      for (const id in mats) {
        const h = heatByGroup[groupOf(id)] || 0;
        if (h > 0) { mats[id].emissive.setHex(0xff2d1a); mats[id].emissiveIntensity = 0.25 + h * 0.95; }
      }
    }

    /* ---- interaction: rotate + pinch zoom + tap ---- */
    let rotY = Math.PI * 0.12, targetRotY = rotY, rotX = 0;
    let dragging = false, px = 0, py = 0, moved = 0, tapOK = false, pinchDist = 0, lastAct = Date.now();
    let holdTimer = 0, holdFired = false, downX = 0, downY = 0;
    const pointers = new Map();
    function clearHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = 0; } }
    const clampD = d => Math.max(3.6, Math.min(9.5, d));

    el.addEventListener("pointerdown", e => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const p = [...pointers.values()];
        pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        tapOK = false; dragging = false;
      } else {
        dragging = true; px = e.clientX; py = e.clientY; moved = 0; tapOK = true;
        downX = e.clientX; downY = e.clientY; holdFired = false;
        clearHold();
        holdTimer = setTimeout(() => {
          if (pointers.size !== 1 || moved > 10) return;
          const r = el.getBoundingClientRect();
          const ray = new THREE.Raycaster();
          ray.setFromCamera(new THREE.Vector2(
            ((downX - r.left) / r.width) * 2 - 1,
            -((downY - r.top) / r.height) * 2 + 1), camera);
          const hit = ray.intersectObjects(muscleMeshes, false)[0];
          if (hit && opts.onMuscleHold) {
            holdFired = true; tapOK = false;
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
        if (pinchDist > 0 && d > 0) { camDist = clampD(camDist * pinchDist / d); camera.position.z = camDist; }
        pinchDist = d;
      } else if (dragging) {
        const dx = e.clientX - px, dy = e.clientY - py;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 10) { tapOK = false; clearHold(); }
        rotY += dx * 0.008; targetRotY = rotY;
        rotX = Math.max(-0.3, Math.min(0.5, rotX + dy * 0.004));
        px = e.clientX; py = e.clientY;
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
          ray.setFromCamera(new THREE.Vector2(
            ((e.clientX - r.left) / r.width) * 2 - 1,
            -((e.clientY - r.top) / r.height) * 2 + 1), camera);
          const hit = ray.intersectObjects(muscleMeshes, false)[0];
          if (hit) opts.onMuscleClick(hit.object.userData.muscle);
        }
        tapOK = false;
      }
      lastAct = Date.now();
    }
    el.addEventListener("pointerup", pointerEnd);
    el.addEventListener("pointercancel", pointerEnd);
    el.addEventListener("wheel", e => {
      e.preventDefault();
      camDist = clampD(camDist + e.deltaY * 0.003);
      camera.position.z = camDist; lastAct = Date.now();
    }, { passive: false });

    let raf = 0, dead = false;
    (function loop() {
      if (dead) return;
      raf = requestAnimationFrame(loop);
      const idle = !dragging && pointers.size === 0 && Date.now() - lastAct > 3000;
      if (opts.autoRotate && !getSettings().reduceMotion && idle) {
        rotY += 0.004; targetRotY = rotY;
      }
      rotY += (targetRotY - rotY) * 0.12;
      body.rotation.y = rotY; body.rotation.x = rotX;
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
      const w = W(), h = H();
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    });
    ro.observe(container);

    function setPain(ids) {
      reset();
      (ids || []).forEach(id => {
        if (mats[id]) { mats[id].emissive.setHex(0xff2222); mats[id].emissiveIntensity = 0.9; }
      });
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
      setFinish,
      setView(v, instant) {
        let t = (v === "back") ? Math.PI : 0;
        t += Math.round((rotY - t) / (Math.PI * 2)) * Math.PI * 2;
        targetRotY = t;
        if (instant || getSettings().reduceMotion) rotY = targetRotY;
      },
      dispose() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); }
    };
  }

  /* ---------- favorites & completed ---------- */
  const favs = new Set(JSON.parse(localStorage.getItem("forge-favs") || "[]"));
  const done = JSON.parse(localStorage.getItem("forge-done") || "{}"); // "progId:dayIdx" -> [dates]
  function saveFavs() {
    localStorage.setItem("forge-favs", JSON.stringify([...favs]));
    document.getElementById("favCount").textContent = favs.size;
  }
  function saveDone() { localStorage.setItem("forge-done", JSON.stringify(done)); }
  const progById = id => allPrograms().find(p => p.id === id);
  function getCustomPrograms() {
    try { const l = JSON.parse(localStorage.getItem("forge-custom-programs") || "[]"); return Array.isArray(l) ? l : []; }
    catch (e) { return []; }
  }
  function saveCustomPrograms(l) { localStorage.setItem("forge-custom-programs", JSON.stringify(l)); }
  function allPrograms() { return PROGRAMS.concat(getCustomPrograms()); }
  function deleteCustomProgram(id) {
    saveCustomPrograms(getCustomPrograms().filter(p => p.id !== id));
  }

  /* ---------- accent ---------- */
  function applyAccent(id, save) {
    const a = ACCENTS.find(x => x.id === id) || ACCENTS[0];
    document.documentElement.style.setProperty("--volt", a.color);
    document.documentElement.style.setProperty("--volt-ink", a.ink);
    if (save !== false) localStorage.setItem("forge-accent", a.id);
    viewers.forEach(v => { if (v.setAccent) v.setAccent(a.color); });
    document.querySelectorAll(".accent-pick").forEach(b => b.classList.toggle("on", b.dataset.accent === a.id));
    if ($("mChart") && $("mChart").children.length) { try { renderMeasureChart(); } catch (e) {} }
  }
  let finishPreviewViewer = null;
  function openSettings() {
    const grid = $("accentGrid");
    const cur = currentAccent().id;
    grid.innerHTML = ACCENTS.map(a =>
      `<button class="accent-pick ${a.id === cur ? "on" : ""}" data-accent="${a.id}">` +
      `<span class="swatch" style="background:${a.color}"></span>${a.name}</button>`).join("");
    syncSettingsUI();
    $("settingsVeil").classList.remove("hidden");
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
      if (finishPreviewViewer) { finishPreviewViewer.dispose(); finishPreviewViewer = null; }
      const pc = $("finishPreview"); if (pc) pc.innerHTML = "";
    } catch (e) {}
  }
  function syncSettingsUI() {
    const s = getSettings();
    document.querySelectorAll("#unitSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.unit === s.units));
    document.querySelectorAll("#goalSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.goal === (s.goal || "maintain")));
    document.querySelectorAll("#speedSeg .seg").forEach(b => b.classList.toggle("on", parseFloat(b.dataset.speed) === s.demoSpeed));
    document.querySelectorAll("#langSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.lang === s.lang));
    const tg = (id, on) => $(id).setAttribute("aria-checked", on ? "true" : "false");
    tg("tglSound", s.sound); tg("tglMotion", s.reduceMotion); tg("tglDemoPlay", s.demoAutoplay);
    tg("tglAutoRest", s.autoRest); tg("tglVoice", s.voiceCues);
    tg("tglBigText", s.bigText); tg("tglContrast", s.highContrast); tg("tglAdvanced", s.advanced); tg("tglHaptic", s.haptics); syncFinishUI();
    const _rt = $("reminderTime"); if (_rt) _rt.value = s.reminder || "";
    const eqs = [...new Set(EXERCISES.map(e => e.equipment))].sort();
    $("eqGrid").innerHTML = eqs.map(q =>
      `<button class="eq-chip ${(s.myEquipment || []).includes(q) ? "on" : ""}" data-eq="${q}">${eqName[q] || q}</button>`).join("");
  }

  /* ---------- i18n ---------- */
  const STRINGS = {
    en: {
      nav_exercises: "Exercises", nav_programs: "Programs", nav_body: "3D Body Map", nav_favorites: "Favorites", nav_progress: "Progress",
      home_kicker: "3D GYM TRAINING", home_title: "Every muscle. Every exercise. In 3D.",
      home_lede: "193 exercises mapped onto an interactive 3D body. Tap a muscle, see it light up, learn the move.",
      home_cta_body: "Explore the 3D body", home_cta_ex: "Browse exercises",
      stat_exercises: "exercises", stat_muscles: "muscle groups", stat_body: "interactive body",
      home_muscles: "Train by muscle",
      ex_title: "All exercises", ex_search_ph: "Search exercises… (e.g. squat, cable, beginner)",
      prog_title: "Training programs", prog_lede: "Pick a plan and just train. Every workout is laid out set by set.",
      prog_quiz: "Find my program", prog_create: "Create program",
      body_title: "3D Body Map", body_lede: "Click any muscle on the body to see every exercise that trains it.",
      body_front: "Front", body_back: "Back", body_muscles: "Muscles", body_recovery: "Recovery",
      body_hint: "Drag to rotate · scroll to zoom · click a muscle",
      fav_title: "Your favorites", fav_empty: "Nothing saved yet. Tap the heart on any exercise.",
      progress_title: "Progress", tab_overview: "Overview", tab_history: "History", tab_records: "Records", tab_volume: "Volume",
      tab_year: "Year", tab_board: "Leaderboard", body_pain: "Pain",
      set_title: "Settings", set_accent: "Accent color", set_accent_note: "Applies across the app, including the 3D body ring.",
      set_units: "Units", set_myeq: "My equipment", set_myeq_note: "Used by the program quiz and exercise swaps. Empty means everything.",
      set_lang: "Language", set_workout: "Workout", set_sound: "Rest timer sound", set_motion: "Reduce motion",
      set_demos: "Exercise demos", set_autoplay: "Autoplay", set_speed: "Demo speed", set_data: "Data", set_haptic: "Haptic feedback",
      set_export: "Export data", set_reset: "Reset all data",
      builder_title: "Create program", builder_lede: "Build your own training plan from the exercise library.",
      myeq_only: "My equipment only", swap_title: "Swap it", swap_sub: "same muscle, different gear",
      b_add_day: "Add day", b_save: "Save program", b_cancel: "Cancel", b_delete: "Delete program",
      b_name: "Program name", b_name_ph: "e.g. My Push Day Split", b_tagline: "Tagline (optional)", b_tagline_ph: "e.g. 3 days, dumbbells only",
    },
    fr: {
      nav_exercises: "Exercices", nav_programs: "Programmes", nav_body: "Corps 3D", nav_favorites: "Favoris", nav_progress: "Progrès",
      home_kicker: "MUSCULATION 3D", home_title: "Chaque muscle. Chaque exercice. En 3D.",
      home_lede: "193 exercices sur un corps 3D interactif. Touchez un muscle, voyez-le s'illuminer, apprenez le mouvement.",
      home_cta_body: "Explorer le corps 3D", home_cta_ex: "Voir les exercices",
      stat_exercises: "exercices", stat_muscles: "groupes musculaires", stat_body: "corps interactif",
      home_muscles: "S'entraîner par muscle",
      ex_title: "Tous les exercices", ex_search_ph: "Rechercher… (ex. squat, câble, débutant)",
      prog_title: "Programmes", prog_lede: "Choisissez un plan et entraînez-vous. Chaque séance est détaillée série par série.",
      prog_quiz: "Trouver mon programme", prog_create: "Créer un programme",
      body_title: "Corps 3D", body_lede: "Cliquez sur un muscle pour voir tous les exercices qui le travaillent.",
      body_front: "Avant", body_back: "Arrière", body_muscles: "Muscles", body_recovery: "Récupération",
      body_hint: "Glisser pour pivoter · défiler pour zoomer · cliquer un muscle",
      fav_title: "Mes favoris", fav_empty: "Rien enregistré. Touchez le cœur sur un exercice.",
      progress_title: "Progrès", tab_overview: "Aperçu", tab_history: "Historique", tab_records: "Records", tab_volume: "Volume",
      tab_year: "Année", tab_board: "Classement", body_pain: "Douleur",
      set_title: "Réglages", set_accent: "Couleur d'accent", set_accent_note: "S'applique partout, y compris l'anneau du corps 3D.",
      set_units: "Unités", set_myeq: "Mon équipement", set_myeq_note: "Utilisé par le quiz et les substitutions. Vide = tout.",
      set_lang: "Langue", set_workout: "Séance", set_sound: "Son du minuteur", set_motion: "Réduire les animations",
      set_demos: "Démos d'exercices", set_autoplay: "Lecture auto", set_speed: "Vitesse des démos", set_data: "Données", set_haptic: "Retour haptique",
      set_export: "Exporter", set_reset: "Tout effacer",
      builder_title: "Créer un programme", builder_lede: "Créez votre plan depuis la bibliothèque d'exercices.",
      myeq_only: "Mon équipement uniquement", swap_title: "Remplacer", swap_sub: "même muscle, autre matériel",
      b_add_day: "Ajouter un jour", b_save: "Enregistrer", b_cancel: "Annuler", b_delete: "Supprimer le programme",
      b_name: "Nom du programme", b_name_ph: "ex. Mon split push", b_tagline: "Slogan (optionnel)", b_tagline_ph: "ex. 3 jours, haltères uniquement",
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
          if (first) { node.textContent = txt; first = false; }
          else node.textContent = "";
        }
      });
      if (first) el.textContent = txt;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.documentElement.lang = getSettings().lang || "en";
  }

  /* ---------- settings state ---------- */
  const DEFAULT_SETTINGS = { units: "kg", sound: true, demoAutoplay: true, demoSpeed: 1, reduceMotion: false, myEquipment: [], lang: "en", autoRest: true, restShort: 60, restLong: 180, voiceCues: false, reminder: "", advanced: false, haptics: true, bodyFinish: "standard" };
  function getSettings() {
    try { return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem("forge-settings") || "{}")); }
    catch (e) { return Object.assign({}, DEFAULT_SETTINGS); }
  }
  function saveSettings(s) { localStorage.setItem("forge-settings", JSON.stringify(s)); }
  function unitLabel() { return getSettings().units; }
  function fromKg(kg) { const v = getSettings().units === "lb" ? kg * 2.20462 : kg; return Math.round(v * 10) / 10; }
  function toKg(v) { return getSettings().units === "lb" ? v / 2.20462 : v; }
  function fmtW(kg) { return fromKg(kg) + " " + unitLabel(); }
  function fmtDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  /* ---------- workout log ---------- */
  function getLog() {
    try { const l = JSON.parse(localStorage.getItem("forge-log") || "[]"); return Array.isArray(l) ? l : []; }
    catch (e) { return []; }
  }
  function saveLog(l) { localStorage.setItem("forge-log", JSON.stringify(l)); }
  function getTemplates() { try { const t = JSON.parse(localStorage.getItem("forge-templates") || "[]"); return Array.isArray(t) ? t : []; } catch (e) { return []; } }
  function saveTemplates(t) { localStorage.setItem("forge-templates", JSON.stringify(t)); }
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
    getLog().forEach(w => w.exercises.forEach(x => {
      if (x.id !== exId) return;
      x.sets.forEach(s => {
        const wgt = s.weight || 0;
        if (!best || wgt > best.weight || (wgt === best.weight && s.reps > best.reps)) best = { weight: wgt, reps: s.reps };
      });
    }));
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
    const d = new Date(dateStr + "T12:00:00"), n = new Date();
    n.setHours(12, 0, 0, 0);
    return Math.max(0, Math.round((n - d) / 864e5));
  }
  function getPain() {
    try { return JSON.parse(localStorage.getItem("forge-pain") || "{}"); } catch (e) { return {}; }
  }
  function savePain(p) { try { localStorage.setItem("forge-pain", JSON.stringify(p)); } catch (e) {} }
  function getSoreness() {
    try { return JSON.parse(localStorage.getItem("forge-sore") || "{}"); } catch (e) { return {}; }
  }
  function saveSoreness(s) { try { localStorage.setItem("forge-sore", JSON.stringify(s)); } catch (e) {} }
  function muscleHeat() {
    const last = {};
    getLog().forEach(w => {
      const ago = daysAgo(w.date);
      w.exercises.forEach(x => {
        const ex = byId(x.id); if (!ex) return;
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
        const ex = byId(x.id); if (!ex) return;
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
      muscles.slice(0, i + 1).forEach(g => heat[g] = 1);
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
    return (log || getLog()).reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((d, s) => d + setVolumeKg(x.id, s), 0), 0), 0);
  }
  function volumeByMuscle(days) {
    const cutoff = new Date(); cutoff.setHours(12, 0, 0, 0); cutoff.setDate(cutoff.getDate() - days);
    const vol = {};
    getLog().forEach(w => {
      if (new Date(w.date + "T12:00:00") < cutoff) return;
      w.exercises.forEach(x => {
        const ex = byId(x.id); if (!ex) return;
        const g = groupOf(ex.primary);
        vol[g] = (vol[g] || 0) + x.sets.length;
      });
    });
    return vol;
  }
  function weeklyStreak(log) {
    const weeks = new Set((log || getLog()).map(w => {
      const d = new Date((w.date || "") + "T12:00:00");
      const monday = new Date(d); monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return fmtDate(monday);
    }));
    let streak = 0;
    const d = new Date(); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    if (!weeks.has(fmtDate(d))) d.setDate(d.getDate() - 7);
    while (weeks.has(fmtDate(d))) { streak++; d.setDate(d.getDate() - 7); }
    return streak;
  }
  function workoutStreak() {
    const days = [...new Set(getLog().map(w => w.date))].sort();
    if (!days.length) return 0;
    const xp = getXP();
    const month = fmtDate(new Date()).slice(0, 7);
    if (xp.freezeMonth !== month) { xp.freeze = 1; xp.freezeMonth = month; xp.frozen = []; saveXP(xp); }
    xp.frozen = xp.frozen || [];
    let streak = 0, changed = false;
    const d = new Date(); d.setHours(12, 0, 0, 0);
    if (!days.includes(fmtDate(d))) d.setDate(d.getDate() - 1);
    while (true) {
      const key = fmtDate(d);
      if (days.includes(key) || xp.frozen.includes(key)) { streak++; }
      else if ((xp.freeze || 0) > 0 && streak > 0) {
        xp.freeze--; xp.frozen.push(key); streak++; changed = true;
      }
      else break;
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
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 2200);
  }
  let logoTaps = 0, logoTimer = null;
  const footBrand = document.querySelector(".foot-brand");
  if (footBrand) {
    footBrand.style.cursor = "pointer";
    footBrand.addEventListener("click", (e) => {
      e.preventDefault();
      logoTaps++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoTaps = 0; }, 2000);
      if (logoTaps >= 5) {
        logoTaps = 0;
        footBrand.animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }],
          { duration: 600, easing: "cubic-bezier(.2,.8,.3,1)" }
        );
        const msgs = ["You found it!", "Still forging!", "No shortcuts. Just reps.", "Okay, back to training!"];
        miniToast(msgs[Math.floor(Math.random() * msgs.length)]);
      }
    });
  }
  const fq = $("footQuote");
  if (fq) {
    const d = new Date();
    fq.textContent = "\u201C" + QUOTES[(d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % QUOTES.length] + "\u201D";
  }
  const fa = $("footAccents");
  if (fa) {
    fa.innerHTML = ACCENTS.map(a =>
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
    ["v11.16", "Fix doubled unit in last-time summary (was showing kg twice)"],
    ["v11.15", "Warm-up set generator in the workout player: one-tap warm-up sets based on last session's working weight"],
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
  const fv = $("footVer"), fc = $("footChangelog");
  if (fv && fc) {
    const N = 5;
    const row = ([v, t]) => `<div><b>${v}</b> - ${t}</div>`;
    const recent = CHANGELOG.slice(0, N).map(row).join("");
    const older = CHANGELOG.length > N
      ? `<div class="hidden" id="footOlder">${CHANGELOG.slice(N).map(row).join("")}</div>
         <button class="foot-more" id="footMore">Show older</button>`
      : "";
    fc.innerHTML = recent + older;
    const more = $("footMore");
    if (more) more.onclick = e => {
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
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const eqName = { bodyweight: "Bodyweight", barbell: "Barbell", dumbbell: "Dumbbell", cable: "Cable", machine: "Machine", kettlebell: "Kettlebell", band: "Band" };
  const lvlDots = l => l === "beginner" ? "●○○" : l === "intermediate" ? "●●○" : "●●●";
  const byId = id => EXERCISES.find(e => e.id === id);
  let viewers = [];
  function clearViewers() { viewers.forEach(v => v.dispose()); viewers = []; }
  function applyBodyFinish(name) {
    viewers.forEach(v => { if (v.setFinish) v.setFinish(name); });
    if (window._bodyViewer && window._bodyViewer.setFinish && !viewers.includes(window._bodyViewer)) window._bodyViewer.setFinish(name);
  }
  let demos = [];
  function clearDemos() { demos.forEach(d => d.destroy()); demos = []; }

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

  /* ---------- views ---------- */
  const views = ["home", "exercises", "detail", "body", "favorites", "programs", "program", "workout", "progress", "builder", "privacy"];
  function show(name) {
    clearViewers();
    clearDemos();
    if (timerInt) { clearInterval(timerInt); timerInt = null; }
    views.forEach(v => { const s = $("view-" + v); if (s) s.classList.toggle("hidden", v !== name); });
    document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.nav === name ||
      (name === "detail" && a.dataset.nav === "exercises") ||
      ((name === "program" || name === "workout") && a.dataset.nav === "programs")));
    window.scrollTo(0, 0);
  }

  // HOME
  function renderHome() {
    const _rs = getSettings().reminder;
    const _rb = $("reminderBanner");
    if (_rb) {
      const today = fmtDate(new Date());
      const trainedToday = getLog().some(w => w.date === today);
      const now = new Date(), hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      if (_rs && !trainedToday && hm >= _rs) {
        _rb.classList.remove("hidden");
        _rb.innerHTML = `<div class="reminder-top">${window.FORGE_ICON ? window.FORGE_ICON("flame") : ""}<b>Time to train!</b></div><p class="muted">Your reminder was set for ${_rs}.</p><a class="btn btn-primary btn-sm" href="#/programs">Pick a workout</a>`;
      } else _rb.classList.add("hidden");
    }
    $("statEx").textContent = EXERCISES.length;
    $("footEx").textContent = EXERCISES.length;
    const counts = {};
    EXERCISES.forEach(e => counts[e.primary] = (counts[e.primary] || 0) + 1);
    $("muscleGrid").innerHTML = Object.keys(MUSCLE_INFO).map(id =>
      `<a class="muscle-card" href="#/exercises?m=${id}"><b>${MUSCLE_INFO[id].name}</b><span>${counts[id] || 0} exercises</span></a>`
    ).join("");
    const v = createBodyViewer($("hero3d"), { autoRotate: !getSettings().reduceMotion, dist: 5.6 });
    if (v.setFinish) v.setFinish(getSettings().bodyFinish || "standard");
    viewers.push(v);
    const groups = ["chest", "back", "shoulders", "quads", "glutes", "biceps"];
    let i = 0;
    const cyc = setInterval(() => {
      if (!document.body.contains($("hero3d"))) { clearInterval(cyc); return; }
      v.highlight(expandMuscles(groups[i++ % groups.length]), []);
    }, 2400);
    v.highlight(expandMuscles("chest"), []);
    const origDispose = v.dispose.bind(v);
    v.dispose = () => { clearInterval(cyc); origDispose(); };
  }

  // EXERCISES
  const filters = { q: "", muscle: "", eq: "", lvl: "", myEq: false };
  function initExercises() {
    const chips = ["", ...Object.keys(MUSCLE_INFO)];
    $("muscleChips").innerHTML = chips.map(id =>
      `<button class="chip ${id === filters.muscle ? "on" : ""}" data-m="${id}">${id ? MUSCLE_INFO[id].name : "All"}</button>`
    ).join("");
    const eqs = [...new Set(EXERCISES.map(e => e.equipment))].sort();
    $("eqFilter").innerHTML = `<option value="">All equipment</option>` + eqs.map(q => `<option value="${q}">${eqName[q]}</option>`).join("");
  }
  function filtered() {
    const q = filters.q.toLowerCase();
    const myEq = getSettings().myEquipment || [];
    return EXERCISES.filter(e => {
      if (filters.muscle && e.primary !== filters.muscle) return false;
      if (filters.eq && e.equipment !== filters.eq) return false;
      if (filters.lvl && e.level !== filters.lvl) return false;
      if (filters.myEq && myEq.length && !myEq.includes(e.equipment)) return false;
      if (q && !(e.name.toLowerCase().includes(q) || (MUSCLE_INFO[e.primary] && MUSCLE_INFO[e.primary].name.toLowerCase().includes(q)) || e.equipment.includes(q) || e.level.includes(q))) return false;
      return true;
    });
  }
  function renderExercises() {
    const list = filtered();
    $("exCount").textContent = list.length;
    $("exerciseGrid").innerHTML = list.map(cardHTML).join("") || `<p class="muted">No exercises match. Try clearing filters.</p>`;
  }

  // DETAIL
  function syncDetailFav(ex) {
    const b = $("dFav");
    b.dataset.id = ex.id;
    b.classList.toggle("faved", favs.has(ex.id));
    b.innerHTML = window.FORGE_ICON("heart") + (favs.has(ex.id) ? " Saved to favorites" : " Save to favorites");
  }
  function renderDetail(id) {
    const ex = byId(id);
    if (!ex) { location.hash = "#/exercises"; return; }
    $("dName").textContent = ex.name;
    $("dBadges").innerHTML =
      (ex.custom ? `<span class="tag volt-tag">Custom</span>` : "") +
      `<span class="tag volt-tag">${MUSCLE_INFO[ex.primary].name}</span>
       <span class="tag">${eqName[ex.equipment]}</span>
       <span class="tag">${cap1(ex.level)}</span>`;
    $("dDelete").dataset.id = ex.id;
    $("dDelete").classList.toggle("hidden", !ex.custom);
    syncDetailFav(ex);
    $("dPyramid").dataset.id = ex.id;
    $("dSteps").innerHTML = ex.steps.map(s => `<li>${esc(s)}</li>`).join("");
    const cues = FORM_CUES[ex.primary] || FORM_CUES.default;
    $("dSteps").innerHTML += `<li class="cue-header"><b>Form cues:</b><ul class="cues">${cues.map(c => `<li>✓ ${esc(c)}</li>`).join("")}</ul></li>`;
    $("dMuscles").innerHTML =
      `<span class="tag tag-lg primary" data-goto-muscle="${ex.primary}">${MUSCLE_INFO[ex.primary].name} · primary</span>` +
      ex.secondary.map(s => { const g = groupOf(s); return `<span class="tag tag-lg" data-goto-muscle="${g}">${MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g}</span>`; }).join("");
    const sim = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary).slice(0, 4);
    $("dSimilar").innerHTML = sim.map(x =>
      `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]} · ${cap1(x.level)}</span></div>`
    ).join("");
    const myEq = getSettings().myEquipment || [];
    const altPool = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary && x.equipment !== ex.equipment);
    // group by equipment, prioritize user's own equipment
    const byEq = {};
    altPool.forEach(x => { (byEq[x.equipment] = byEq[x.equipment] || []).push(x); });
    const eqOrder = Object.keys(byEq).sort((a, b) => (myEq.includes(b) ? 1 : 0) - (myEq.includes(a) ? 1 : 0));
    $("dSwaps").innerHTML = eqOrder.length ? eqOrder.map(eq =>
      `<div class="swap-group"><p class="swap-eq">${eqName[eq]}${myEq.includes(eq) ? ` <span class="tag volt-tag" style="font-size:10px">yours</span>` : ""}</p>` +
      byEq[eq].slice(0, 4).map(x =>
        `<button class="swap-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span class="muted" style="font-size:12px">${cap1(x.level)}</span>${window.FORGE_ICON("arrow-right")}</button>`
      ).join("") + `</div>`
    ).join("") : `<p class="muted">No swaps needed, this one covers it.</p>`;
    // 1RM estimator from logged sets (Epley formula)
    const log = getLog();
    let best1rm = 0;
    log.forEach(w => {
      (w.exercises || []).forEach(x => {
        if (x.id === ex.id) {
          (x.sets || []).forEach(s => {
            if (s.weight > 0 && s.reps > 0) {
              const est = s.weight * (1 + s.reps / 30);
              if (est > best1rm) best1rm = est;
            }
          });
        }
      });
    });
    $("dOnerm").innerHTML = best1rm > 0
      ? `<div class="onerm-box"><b>Estimated 1RM:</b> ${fmtW(best1rm)} <span class="muted">based on your logged sets</span></div>`
      : "";
    // per-lift progression chart
    const _hist = exerciseHistory(ex.id);
    if (_hist.length >= 2) {
      $("dProg").innerHTML = `<h3 style="margin-top:18px">Your progression</h3><div class="chart-wrap" style="margin:0 0 12px"><canvas id="dProgCanvas"></canvas></div>`;
      const cv = $("dProgCanvas");
      const dpr = window.devicePixelRatio || 1;
      const wrap = cv.parentElement;
      const cw = wrap.clientWidth - 32, ch = 170;
      cv.width = cw * dpr; cv.height = ch * dpr;
      cv.style.width = cw + "px"; cv.style.height = ch + "px";
      const cx = cv.getContext("2d"); cx.scale(dpr, dpr);
      const accent = currentAccent().color;
      const vals = _hist.map(h => h.orm > 0 ? h.orm : h.best);
      const mn = Math.min(...vals), mx = Math.max(...vals);
      const pad = Math.max((mx - mn) * 0.3, 1), lo = mn - pad, rg = (mx - mn + pad * 2) || 1;
      const pL = 44, pR = 10, pT = 10, pB = 22;
      const X = i => pL + (i / (vals.length - 1)) * (cw - pL - pR);
      const Y = v => pT + (1 - (v - lo) / rg) * (ch - pT - pB);
      cx.font = "11px sans-serif"; cx.textAlign = "right";
      for (let g = 0; g <= 2; g++) {
        const gv = lo + rg * g / 2, gy = Y(gv);
        cx.strokeStyle = "rgba(255,255,255,0.07)"; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(pL, gy); cx.lineTo(cw - pR, gy); cx.stroke();
        cx.fillStyle = "#8a93a6"; cx.fillText(fromKg(gv).toFixed(1), pL - 6, gy + 4);
      }
      cx.beginPath();
      vals.forEach((v, i) => { i ? cx.lineTo(X(i), Y(v)) : cx.moveTo(X(0), Y(v)); });
      cx.strokeStyle = accent; cx.lineWidth = 2.5; cx.lineJoin = "round"; cx.stroke();
      vals.forEach((v, i) => {
        cx.beginPath(); cx.arc(X(i), Y(v), 3.5, 0, 7); cx.fillStyle = accent; cx.fill();
      });
      cx.fillStyle = "#8a93a6";
      const _fi = i => { try { return new Date(_hist[i].date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return ""; } };
      cx.textAlign = "left"; cx.fillText(_fi(0), pL, ch - 6);
      cx.textAlign = "right"; cx.fillText(_fi(vals.length - 1), cw - pR, ch - 6);
      attachChartTip(cv, vals.map((v, i) => ({ x: X(i), y: Y(v), i })), p =>
        `${_fi(p.i)}: est. 1RM ${fromKg(vals[p.i]).toFixed(1)} ${unitLabel()}`);
    } else {
      $("dProg").innerHTML = _hist.length ? `<p class="muted" style="font-size:13px">Log this exercise once more to see your progression chart.</p>` : "";
    }
    const v = createBodyViewer($("detail3d"), { autoRotate: !getSettings().reduceMotion });
    if (v.setFinish) v.setFinish(getSettings().bodyFinish || "standard");
    viewers.push(v);
    if (window.FORGE_DEMO) demos.push(window.FORGE_DEMO.createDemo($("demoBox"), ex.pattern, ex.steps));
    const full = ex.primary === "full-body" || ex.primary === "cardio";
    v.highlight(full ? [] : expandMuscles(ex.primary), full ? [] : ex.secondary.flatMap(expandMuscles), full);
    const setV = front => {
      v.setView(front ? "front" : "back");
      $("dFront").classList.toggle("on", front); $("dBack").classList.toggle("on", !front);
    };
    $("dFront").onclick = () => setV(true);
    $("dBack").onclick = () => setV(false);
  }
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-goto-muscle]");
    if (g) location.hash = "#/exercises?m=" + g.dataset.gotoMuscle;
    const sr = e.target.closest("[data-sore]");
    if (sr) {
      const grp = sr.dataset.g, val = sr.dataset.sore;
      const today = fmtDate(new Date());
      const m = getSoreness();
      if (val === "clear") { if (m[today]) delete m[today][grp]; }
      else { m[today] = m[today] || {}; m[today][grp] = val; }
      saveSoreness(m);
      selectMuscle(grp);
      return;
    }
  });

  // BODY MAP
  function openMuscleSheet(mid) {
    const g = groupOf(mid), info = MUSCLE_INFO[g];
    if (!info) return;
    const list = EXERCISES.filter(e => e.primary === g || (e.secondary || []).map(groupOf).includes(g)).slice(0, 6);
    const old = document.querySelector(".sheet-veil");
    if (old) old.remove();
    const veil = document.createElement("div");
    veil.className = "sheet-veil";
    veil.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-head">
        <h3 style="margin:0">${esc(info.name)}</h3>
        <button class="modal-x sheet-close" aria-label="Close"></button>
      </div>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Top exercises - tap one to open it</p>
      ${list.length ? `<div class="mini-cards">${list.map(x => `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment] || x.equipment}</span></div>`).join("")}</div>` : `<div class="empty-note"><p><b>No exercises yet.</b></p><p>Exercises for this muscle will appear here.</p></div>`}
    </div>`;
    veil.querySelector(".sheet-close").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    const onEsc = e => { if (e.key === "Escape") closeSheet(); };
    const closeSheet = () => { document.removeEventListener("keydown", onEsc); veil.remove(); };
    veil.addEventListener("click", e => {
      if (e.target === veil || e.target.closest("[data-ex]") || e.target.closest(".sheet-close")) closeSheet();
    });
    document.addEventListener("keydown", onEsc);
    document.body.appendChild(veil);
  }
  function renderBody(selected) {
    const v = createBodyViewer($("body3d"), {
      autoRotate: !getSettings().reduceMotion, dist: 6.1,
      onMuscleHold: mid => openMuscleSheet(mid),
      onMuscleClick: mid => {
        const g = groupOf(mid);
        if (window._bodyMode === "pain") {
          const pain = getPain();
          if (pain[g]) delete pain[g]; else pain[g] = Date.now();
          savePain(pain);
          paintPain();
          return;
        }
        selectMuscle(g);
        const backSide = ["back", "lats", "traps", "lower-back", "rear-delt", "triceps", "glutes", "hamstrings", "calves"].includes(mid);
        v.setView(backSide ? "back" : "front");
        $("bFront").classList.toggle("on", !backSide);
        $("bBack").classList.toggle("on", backSide);
      }
    });
    viewers.push(v);
    const setV = front => {
      v.setView(front ? "front" : "back");
      $("bFront").classList.toggle("on", front); $("bBack").classList.toggle("on", !front);
    };
    const paintPain = () => {
      const marked = Object.keys(getPain());
      v.setPain(marked.flatMap(g => expandMuscles(g)));
      const n = marked.length;
      $("painCount").textContent = n ? n + " marked" : "Tap a muscle to mark pain";
    };
    const syncMode = () => {
      const mode = window._bodyMode || "muscles";
      $("bMuscles").classList.toggle("on", mode === "muscles");
      $("bRecovery").classList.toggle("on", mode === "recovery");
      $("bFatigue").classList.toggle("on", mode === "fatigue");
      $("bPain").classList.toggle("on", mode === "pain");
      $("heatLegend").classList.toggle("hidden", mode === "muscles" || mode === "pain");
      $("painHint").classList.toggle("hidden", mode !== "pain");
      if (mode === "pain") paintPain();
    };
    window._syncBodyMode = syncMode;
    window._bodyMode = "muscles";
    $("bFront").onclick = () => setV(true);
    $("bBack").onclick = () => setV(false);
    $("bMuscles").onclick = () => { window._bodyMode = "muscles"; syncMode(); selectMuscle(window._lastMuscle || "chest"); };
    $("bRecovery").onclick = () => { window._bodyMode = "recovery"; syncMode(); v.setHeat(muscleHeat()); };
    $("bFatigue").onclick = () => { window._bodyMode = "fatigue"; syncMode(); v.setHeat(muscleFatigue()); };
    $("bPain").onclick = () => { window._bodyMode = "pain"; syncMode(); };
    window._bodyViewer = v;
    v.setFinish(getSettings().bodyFinish || "standard");
    selectMuscle(selected || "chest");
  }
  function selectMuscle(groupId) {
    const v = window._bodyViewer;
    const info = MUSCLE_INFO[groupId];
    if (!info || !v) return;
    window._lastMuscle = groupId;
    if (window._bodyHeatMode) { window._bodyHeatMode = false; if (window._syncBodyMode) window._syncBodyMode(); }
    const full = groupId === "full-body" || groupId === "cardio";
    v.highlight(full ? [] : expandMuscles(groupId), [], full);
    const lastTr = muscleLastTrained();
    const ld = lastTr[groupId];
    const ago = ld ? daysAgo(ld) : null;
    let recHTML;
    if (ago === null) {
      recHTML = `<span class="muted">Not trained yet</span>`;
    } else {
      const recLabel = ago === 0 ? "Trained today" : ago === 1 ? "Trained yesterday" : `Trained ${ago} days ago`;
      const recState = ago <= 1 ? "Recovering" : ago <= 3 ? "Recovered" : "Ready";
      const recColor = ago <= 1 ? "var(--warn)" : "var(--volt)";
      recHTML = `<span style="color:${recColor};font-weight:700">${recState}</span> <span class="muted">- ${recLabel}</span>`;
    }
    const today = fmtDate(new Date());
    const soreMap = getSoreness();
    const soreState = (soreMap[today] && soreMap[today][groupId]) || null;
    const soreLabel = soreState === "sore" ? `<span style="color:var(--warn);font-weight:700">Sore today</span>`
      : soreState === "injured" ? `<span style="color:#f87171;font-weight:700">Injured - take it easy</span>` : "";
    $("muscleInfo").innerHTML = `<h3>${info.name}</h3><p class="desc">${info.desc}</p>
      <p style="margin-top:8px;font-size:14px">${recHTML}</p>
      ${soreLabel ? `<p style="font-size:14px;margin-top:4px">${soreLabel}</p>` : ""}
      <div style="display:flex;gap:8px;margin:10px 0 14px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" data-sore="sore" data-g="${groupId}">Feeling sore</button>
        <button class="btn btn-ghost btn-sm" data-sore="injured" data-g="${groupId}">Injured</button>
        ${soreState ? `<button class="btn btn-ghost btn-sm" data-sore="clear" data-g="${groupId}">Clear</button>` : ""}
      </div>`;
    const list = EXERCISES.filter(e => e.primary === groupId || e.secondary.map(groupOf).includes(groupId));
    $("bodyExercises").innerHTML = list.length
      ? `<p class="muted" style="margin-bottom:10px">${list.length} exercise${list.length > 1 ? "s" : ""}</p>` +
        list.map(x => `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]}</span></div>`).join("")
      : `<div class="empty-note"><p><b>No exercises yet.</b></p><p>Exercises for this muscle will appear here.</p></div>`;
  }

  // FAVORITES
  function renderFavorites() {
    const list = EXERCISES.filter(e => favs.has(e.id));
    $("favGrid").innerHTML = list.map(cardHTML).join("");
    $("favEmpty").classList.toggle("hidden", list.length > 0);
  }

  // QUIZ
  const QUIZ_QUESTIONS = [
    { key: "days", title: "How many days per week can you train?", title_fr: "Combien de jours par semaine pouvez-vous vous entraîner ?", options: [
      { v: 2, label: "2 days", label_fr: "2 jours" }, { v: 3, label: "3 days", label_fr: "3 jours" }, { v: 4, label: "4 days", label_fr: "4 jours" }, { v: 6, label: "5+ days", label_fr: "5+ jours" } ] },
    { key: "equip", title: "What equipment do you have access to?", title_fr: "De quel équipement disposez-vous ?", options: [
      { v: "full", label: "Full gym", label_fr: "Salle complète" }, { v: "dumbbells", label: "Dumbbells + bench", label_fr: "Haltères + banc" },
      { v: "dumbbells-only", label: "Dumbbells only", label_fr: "Haltères uniquement" }, { v: "bodyweight", label: "Bodyweight / minimal", label_fr: "Poids du corps / minimal" } ] },
    { key: "goal", title: "What's your main goal?", title_fr: "Quel est votre objectif principal ?", options: [
      { v: "muscle", label: "Build muscle", label_fr: "Prendre du muscle" }, { v: "strength", label: "Get stronger", label_fr: "Devenir plus fort" }, { v: "fitness", label: "General fitness", label_fr: "Forme générale" } ] },
  ];
  function ql(o) { return getSettings().lang === "fr" ? (o.label_fr || o.label) : o.label; }
  function qt(q) { return getSettings().lang === "fr" ? (q.title_fr || q.title) : q.title; }
  const QUIZ_FIT = {
    "full-body-starter": { days: [2, 3], equip: ["dumbbells", "dumbbells-only", "bodyweight"], goal: ["muscle", "fitness"] },
    "push-pull-legs":    { days: [6], equip: ["full"], goal: ["muscle"] },
    "upper-lower":       { days: [4], equip: ["full"], goal: ["muscle", "strength"] },
    "strength-5x5":      { days: [3], equip: ["full"], goal: ["strength"] },
    "dumbbell-home":     { days: [2, 3], equip: ["dumbbells", "dumbbells-only"], goal: ["fitness", "muscle"] },
    "hiit-conditioning": { days: [3, 4], equip: ["bodyweight", "dumbbells-only"], goal: ["fitness"] },
  };
  let quizState = null;
  function openQuiz() {
    quizState = { step: 0, answers: {} };
    $("quizClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    renderQuizStep();
    $("quizVeil").classList.remove("hidden");
  }
  function closeQuiz() { $("quizVeil").classList.add("hidden"); }
  function renderQuizStep() {
    const q = QUIZ_QUESTIONS[quizState.step];
    const fr = getSettings().lang === "fr";
    $("quizBody").innerHTML =
      `<p class="muted" style="margin-bottom:6px">${fr ? `Question ${quizState.step + 1} sur ${QUIZ_QUESTIONS.length}` : `Question ${quizState.step + 1} of ${QUIZ_QUESTIONS.length}`}</p>
       <h4 style="margin:0 0 16px;font-size:18px">${qt(q)}</h4>
       <div class="quiz-opts">` +
      q.options.map(o => `<button class="quiz-opt" data-qv="${o.v}">${ql(o)}</button>`).join("") +
      `</div>` +
      (quizState.step > 0 ? `<button class="btn btn-ghost btn-sm" id="quizBack" style="margin-top:14px">${fr ? "Retour" : "Back"}</button>` : "");
  }
  function quizScore(p, a) {
    const fit = QUIZ_FIT[p.id];
    if (!fit) return { score: 0, reasons: [] };
    let s = 0; const reasons = [];
    if (fit.days.includes(a.days)) { s += 3; reasons.push(`${p.daysPerWeek} days/week fits your schedule`); }
    else if (fit.days.some(d => Math.abs(d - a.days) === 1)) { s += 1; }
    if (fit.equip.includes(a.equip)) { s += 3; reasons.push(`Uses your ${QUIZ_QUESTIONS[1].options.find(o => String(o.v) === a.equip).label.toLowerCase()}`); }
    if (fit.goal.includes(a.goal)) { s += 3; reasons.push(`Built for ${QUIZ_QUESTIONS[2].options.find(o => String(o.v) === a.goal).label.toLowerCase()}`); }
    if (p.level === "beginner") s += 0.5;
    return { score: s, reasons };
  }
  function renderQuizResult() {
    const a = quizState.answers;
    const fr = getSettings().lang === "fr";
    const ranked = PROGRAMS.map(p => ({ p, ...quizScore(p, a) })).sort((x, y) => y.score - x.score);
    const top = ranked[0];
    $("quizBody").innerHTML =
      `<p class="muted" style="margin-bottom:6px">${fr ? "Votre programme" : "Your match"}</p>
       <h4 style="margin:0 0 8px;font-size:20px">${esc(top.p.name)}</h4>
       <p class="muted" style="margin-bottom:12px">${esc(top.p.tagline)}</p>
       ${top.reasons.map(r => `<p style="margin:6px 0;font-size:14px"><span style="color:var(--volt)">✓</span> ${esc(r)}</p>`).join("")}
       <div class="meta" style="margin:14px 0">
         <span class="tag volt-tag">${cap1(top.p.level)}</span>
         <span class="tag">${top.p.daysPerWeek} ${fr ? "jours/sem" : "days/wk"}</span>
         <span class="tag">${top.p.weeks} ${fr ? "semaines" : "weeks"}</span>
       </div>
       <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
         <a class="btn btn-primary btn-sm" href="#/program/${top.p.id}" id="quizGo">${fr ? "Voir le programme" : "View program"}</a>
         <button class="btn btn-ghost btn-sm" id="quizAgain">${fr ? "Recommencer" : "Retake quiz"}</button>
       </div>
       ${ranked[1] ? `<p class="muted" style="margin-top:16px;font-size:13px">${fr ? "Aussi : " : "Runner-up: "}<a href="#/program/${ranked[1].p.id}" style="color:var(--volt)">${esc(ranked[1].p.name)}</a></p>` : ""}`;
  }

  // PROGRAM BUILDER
  let builder = null;
  let pickerDay = -1;
  function newBuilder() {
    builder = { name: "", tagline: "", days: [{ name: "Day 1", exercises: [] }] };
    $("bName").value = ""; $("bTagline").value = "";
    renderBuilder();
  }
  function renderBuilder() {
    if (!builder) newBuilder();
    $("bDays").innerHTML = builder.days.map((d, di) => `
      <div class="day-block">
        <div class="day-head">
          <input type="text" class="text-input" value="${esc(d.name)}" data-bday="${di}" maxlength="40" aria-label="Day name" />
          <button class="icon-btn" data-bdel-day="${di}" aria-label="Delete day">${window.FORGE_ICON("x")}</button>
        </div>
        ${d.exercises.map((x, xi) => {
          const ex = byId(x.id);
          return `<div class="bex-row">
            <span class="drag-handle" data-bdrag="${di}:${xi}" title="Drag to reorder" aria-label="Drag to reorder">&#8942;&#8942;</span>
            <b>${esc(ex ? ex.name : x.id)}</b>
            <span class="bex-fields">
            <input type="number" min="1" max="20" value="${x.sets}" data-bset="${di}:${xi}" aria-label="Sets" /><span class="lbl">sets</span>
            <input type="text" value="${esc(x.reps)}" data-brep="${di}:${xi}" maxlength="12" aria-label="Reps" style="width:64px" /><span class="lbl">reps</span>
            <input type="number" min="0" step="any" value="${x.weight != null ? fromKg(x.weight) : ""}" data-bwt="${di}:${xi}" aria-label="Target weight" style="width:76px" placeholder="-" /><span class="lbl">${unitLabel()}</span>
            </span>
            <button class="icon-btn" data-bdel-ex="${di}:${xi}" aria-label="Remove exercise">${window.FORGE_ICON("x")}</button>
          </div>`;
        }).join("")}
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" data-bpick="${di}">Add exercises</button>
          <button class="btn btn-ghost btn-sm" data-btpl-save="${di}">Save as template</button>
          <button class="btn btn-ghost btn-sm" data-btpl-apply="${di}">From template</button>
          <button class="btn btn-ghost btn-sm" data-b1rm="${di}" title="Fill target weights at 75% of your estimated 1RM">Autofill 75% 1RM</button>
        </div>
      </div>`).join("");
  }
  function openPicker(di) {
    pickerDay = di; templateDay = -1;
    $("pickerTitle").textContent = "Add exercises";
    $("pickerSearch").closest(".search-wrap").style.display = "";
    $("pickerClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    $("pickerSearch").value = "";
    renderPicker("");
    $("pickerVeil").classList.remove("hidden");
  }
  function closePicker() { $("pickerVeil").classList.add("hidden"); pickerDay = -1; }
  let templateDay = -1;
  function openTemplatePicker(di) {
    templateDay = di;
    const tpl = getTemplates();
    $("pickerTitle").textContent = "Apply template";
    $("pickerSearch").closest(".search-wrap").style.display = "none";
    $("pickerList").innerHTML = tpl.length ? tpl.map(t =>
      `<div class="picker-item tpl-item" style="cursor:default">
        <b>${esc(t.name)}</b><span class="tag">${t.exercises.length} exercises</span>
        <div class="tpl-actions">
          <button class="btn btn-primary btn-sm" data-tpl-apply="${t.id}">Apply</button>
          <button class="btn btn-ghost btn-sm danger" data-tpl-del="${t.id}">Delete</button>
        </div>
      </div>`).join("") : `<div class="empty-note"><p><b>No templates yet.</b></p><p>Build a day and tap "Save as template".</p></div>`;
    $("pickerVeil").classList.remove("hidden");
  }
  function renderPicker(q) {
    q = q.toLowerCase();
    const inDay = pickerDay >= 0 ? new Set(builder.days[pickerDay].exercises.map(x => x.id)) : new Set();
    const list = EXERCISES.filter(e =>
      !q || e.name.toLowerCase().includes(q) || (MUSCLE_INFO[e.primary] && MUSCLE_INFO[e.primary].name.toLowerCase().includes(q))
    ).slice(0, 60);
    $("pickerList").innerHTML = list.map(e =>
      `<button class="picker-item" data-pick="${e.id}">
        <b>${esc(e.name)}</b><span class="tag">${MUSCLE_INFO[e.primary].name}</span>
        ${inDay.has(e.id) ? `<span class="added">Added</span>` : ""}
      </button>`).join("") || `<p class="muted">No matches.</p>`;
  }
  function saveBuilder() {
    builder.name = $("bName").value.trim();
    builder.tagline = $("bTagline").value.trim() || "Custom program";
    if (!builder.name) {
      appPrompt("Program name:", "", "Save program").then(name => {
        if (!name || !name.trim()) return;
        $("bName").value = name.trim();
        saveBuilder();
      });
      return;
    }
    const days = builder.days.filter(d => d.exercises.length > 0);
    if (!days.length) { appAlert("Add at least one exercise to a day."); return; }
    const id = "custom-" + Date.now().toString(36);
    const prog = {
      id, name: builder.name, tagline: builder.tagline, custom: true,
      level: "custom", daysPerWeek: days.length, weeks: 4, equipment: "Mixed",
      days: days.map(d => ({ name: d.name.trim() || "Day", exercises: d.exercises.map(x => ({ id: x.id, sets: x.sets, reps: x.reps, weight: x.weight != null ? x.weight : null })) }))
    };
    const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
    location.hash = "#/program/" + id;
  }

  // PLATE CALCULATOR
  // Plate colors follow the common competition scheme (kg) / gym scheme (lb)
  const PLATE_COLORS = {
    25: "#d43a2f", 20: "#2f6fd4", 15: "#d4a92f", 10: "#3aa655", 5: "#e8e8e8",
    2.5: "#c0392b", 1.25: "#95a5a6",
    45: "#d43a2f", 35: "#2f6fd4"
  };
  function plateDiagramSVG(used, units) {
    const maxW = units === "kg" ? 25 : 45;
    const W = 400, H = 130, cx = W / 2, cy = H / 2;
    // real barbell anatomy from the center out: grip shaft, then plates on the
    // sleeves, then collars, then a short bar tip
    let plateSpan = 0;
    used.forEach(w => { plateSpan += Math.round(9 + 11 * (w / maxW)) + 2; });
    const shaftHalf = 95;                   // grip area each side of center
    const collarGap = 4;                    // gap between last plate and collar
    const tipLen = 14;                      // bar tip beyond the collar
    const halfBar = shaftHalf + plateSpan + collarGap + 8 + tipLen;
    const barX = cx - halfBar, barW = halfBar * 2;
    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Barbell loading diagram">`;
    // bar shaft
    svg += `<rect x="${barX}" y="${cy - 3}" width="${barW}" height="6" rx="3" fill="#8a8f98"/>`;
    // center knurl mark
    svg += `<rect x="${cx - 1.5}" y="${cy - 5}" width="3" height="10" rx="1.5" fill="#6a6f78"/>`;
    // knurl rings where the sleeves start
    svg += `<rect x="${cx - shaftHalf - 1.5}" y="${cy - 5}" width="3" height="10" rx="1.5" fill="#6a6f78"/>`;
    svg += `<rect x="${cx + shaftHalf - 1.5}" y="${cy - 5}" width="3" height="10" rx="1.5" fill="#6a6f78"/>`;
    // plates load OUTSIDE-IN: heaviest plate nearest the sleeve start (inside),
    // lighter plates toward the collar (outside), like real loading
    const ordered = [...used].sort((a, b) => b - a);
    let offset = shaftHalf;
    ordered.forEach(w => {
      const frac = w / maxW;
      const ph = Math.round(34 + 66 * frac);      // plate height
      const pw = Math.round(9 + 11 * frac);       // plate thickness
      const color = PLATE_COLORS[w] || "#8a8f98";
      const dark = color === "#e8e8e8";
      const y = cy - ph / 2;
      // right side
      svg += `<rect x="${cx + offset}" y="${y}" width="${pw}" height="${ph}" rx="3" fill="${color}" stroke="${dark ? "#9aa0a8" : "rgba(0,0,0,0.35)"}" stroke-width="1"/>`;
      // left side (mirror)
      svg += `<rect x="${cx - offset - pw}" y="${y}" width="${pw}" height="${ph}" rx="3" fill="${color}" stroke="${dark ? "#9aa0a8" : "rgba(0,0,0,0.35)"}" stroke-width="1"/>`;
      // weight label on larger plates
      if (ph >= 52) {
        const fs = ph >= 80 ? 13 : 11;
        const tc = (dark || w === 15) ? "#1a1d21" : "#fff";
        svg += `<text x="${cx + offset + pw / 2}" y="${cy + fs / 3}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${tc}" font-family="inherit">${w}</text>`;
        svg += `<text x="${cx - offset - pw / 2}" y="${cy + fs / 3}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${tc}" font-family="inherit">${w}</text>`;
      }
      offset += pw + 2;
    });
    // collars outside the last (lightest) plate
    const colX = shaftHalf + plateSpan + collarGap;
    svg += `<rect x="${cx - colX - 7}" y="${cy - 10}" width="7" height="20" rx="2" fill="#5a5f66"/>`;
    svg += `<rect x="${cx + colX}" y="${cy - 10}" width="7" height="20" rx="2" fill="#5a5f66"/>`;
    svg += `</svg>`;
    return svg;
  }
  function calcPlates() {
    const units = getSettings().units;
    const bar = parseFloat($("plateBar").value) || 0;
    const target = parseFloat($("plateTarget").value) || 0;
    const plates = units === "kg" ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5];
    let remaining = (target - bar) / 2;
    if (remaining < 0) {
      $("plateResult").innerHTML = `<p class="muted">Target must be heavier than the bar.</p>`;
      return;
    }
    const used = [];
    for (const p of plates) {
      while (remaining >= p - 0.001) { used.push(p); remaining -= p; }
    }
    const diagram = used.length ? `<div class="plate-diagram">${plateDiagramSVG(used, units)}</div>` : "";
    if (remaining > 0.01) {
      $("plateResult").innerHTML = diagram + `<p class="muted">Closest: ${used.length ? used.join(" + ") : "bar only"} per side (${(remaining * 2).toFixed(1)} ${units} short).</p>`;
    } else {
      $("plateResult").innerHTML = diagram + (used.length
        ? `<p style="font-size:16px;margin-top:10px"><b>Per side:</b> ${used.join(" + ")} <span class="muted">${units}</span></p>`
        : `<p class="muted">Just the bar.</p>`);
    }
  }
  function openPlates() {
    const units = getSettings().units;
    $("plateBar").value = units === "kg" ? 20 : 45;
    $("plateClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    calcPlates();
    $("plateVeil").classList.remove("hidden");
  }

  // FORM CUES
  const FORM_CUES = {
    "chest": ["Squeeze shoulder blades together", "Keep a slight arch in your back", "Lower with control, don't bounce"],
    "back": ["Lead with your elbows", "Squeeze at the top for 1 second", "Don't swing, control the weight"],
    "shoulders": ["Keep core braced", "Don't shrug your traps up", "Control the negative"],
    "biceps": ["Pin elbows to your sides", "Don't swing your torso", "Full range of motion"],
    "triceps": ["Keep upper arms still", "Lock out at the top", "Don't flare elbows"],
    "quads": ["Knees track over toes", "Chest up, core tight", "Drive through your heels"],
    "hamstrings": ["Hinge at the hips", "Slight bend in knees", "Feel the stretch, then squeeze"],
    "glutes": ["Squeeze hard at the top", "Don't hyperextend your back", "Drive through heels"],
    "calves": ["Full stretch at bottom", "Pause at the top", "Don't bounce"],
    "abs": ["Exhale on the effort", "Don't pull your neck", "Slow and controlled"],
    "default": ["Breathe steadily", "Control the weight both ways", "Stop if form breaks down"]
  };

  // SHARE CARD (Feature 7): renders a 1080x1350 portrait workout card to an offscreen canvas
  function generateShareCard(entry) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const W = 1080, H = 1350;
      const volt = "#d4ff3f", ink = "#f2f4f8", muted = "#9aa3b5";
      // background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0b0d12"); grad.addColorStop(1, "#161b26");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      // volt accent bar
      ctx.fillStyle = volt; ctx.fillRect(0, 0, W, 10);
      ctx.textAlign = "center";
      // brand
      ctx.fillStyle = volt;
      ctx.font = "800 92px system-ui, -apple-system, sans-serif";
      try { ctx.letterSpacing = "14px"; } catch (e) {}
      ctx.fillText("FORGE", W / 2, 150);
      try { ctx.letterSpacing = "0px"; } catch (e) {}
      // date, e.g. "Mon, Oct 5, 2026"
      const parts = (entry.date || "").split("-");
      let dateStr = entry.date || "";
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
      }
      ctx.fillStyle = muted; ctx.font = "500 40px system-ui, sans-serif";
      ctx.fillText(dateStr, W / 2, 225);
      // program + day
      const sub = [entry.programName, entry.dayName].filter(Boolean).join(" - ");
      const subShown = sub.length > 34 ? sub.slice(0, 33) + "…" : (sub || "Workout");
      ctx.fillStyle = ink; ctx.font = "700 52px system-ui, sans-serif";
      ctx.fillText(subShown, W / 2, 300);
      // divider
      ctx.strokeStyle = "#232936"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(140, 360); ctx.lineTo(W - 140, 360); ctx.stroke();
      // stats row
      const totalSets = entry.exercises.reduce((a, x) => a + x.sets.length, 0);
      const totalVol = entry.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + setVolumeKg(x.id, s), 0), 0);
      const stats = [
        [String(entry.exercises.length), "exercises"],
        [String(totalSets), "sets"],
        [fmtW(totalVol), "total volume"]
      ];
      const colX = [W / 2 - 340, W / 2, W / 2 + 340];
      stats.forEach((st, i) => {
        ctx.fillStyle = ink; ctx.font = "800 76px system-ui, sans-serif";
        ctx.fillText(st[0], colX[i], 480);
        ctx.fillStyle = muted; ctx.font = "500 32px system-ui, sans-serif";
        ctx.fillText(st[1], colX[i], 535);
      });
      // top 4 exercises by volume
      ctx.fillStyle = volt; ctx.font = "700 36px system-ui, sans-serif";
      ctx.fillText("TOP LIFTS", W / 2, 650);
      const ranked = entry.exercises.map(x => ({
        x,
        vol: x.sets.reduce((b, s) => b + setVolumeKg(x.id, s), 0),
        reps: x.sets.reduce((b, s) => b + (s.reps || 0), 0)
      })).sort((a, b) => b.vol - a.vol).slice(0, 4);
      ctx.textAlign = "left";
      let y = 730;
      ranked.forEach(r => {
        const ex = byId(r.x.id);
        const name = ex ? ex.name : r.x.id;
        const shown = name.length > 30 ? name.slice(0, 29) + "…" : name;
        ctx.fillStyle = ink; ctx.font = "600 40px system-ui, sans-serif";
        ctx.fillText(shown, 110, y);
        ctx.fillStyle = muted; ctx.font = "500 34px system-ui, sans-serif";
        ctx.fillText(r.x.sets.length + " sets - " + r.reps + " reps - " + fmtW(r.vol), 110, y + 52);
        y += 130;
      });
      // footer
      ctx.textAlign = "center";
      ctx.fillStyle = "#5b6472"; ctx.font = "500 32px system-ui, sans-serif";
      ctx.fillText("Trained with FORGE", W / 2, H - 70);
      return canvas;
    } catch (e) { return null; }
  }

  // AI FORM CHECK (MoveNet pose estimation, on-device)
  let formStream = null, formDetector = null, formRunning = false, formRaf = 0;
  let squatState = "up", squatReps = 0;
  async function loadFormModel() {
    if (formDetector) return formDetector;
    if (!window.tf) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js";
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }
    if (!window.poseDetection) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js";
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }
    const model = poseDetection.SupportedModels.MoveNet;
    formDetector = await poseDetection.createDetector(model, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });
    return formDetector;
  }
  async function startFormCheck() {
    $("formFeedback").textContent = "Loading AI model…";
    try {
      await loadFormModel();
      formStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      const video = $("formVideo");
      video.srcObject = formStream;
      await video.play();
      $("formStart").classList.add("hidden");
      $("formStop").classList.remove("hidden");
      squatState = "up"; squatReps = 0;
      formRunning = true;
      formLoop();
    } catch (e) {
      $("formFeedback").textContent = "Camera unavailable: " + e.message;
    }
  }
  function stopFormCheck() {
    formRunning = false;
    cancelAnimationFrame(formRaf);
    if (formStream) { formStream.getTracks().forEach(t => t.stop()); formStream = null; }
    $("formStart").classList.remove("hidden");
    $("formStop").classList.add("hidden");
    $("formVeil").classList.add("hidden");
  }
  async function formLoop() {
    if (!formRunning) return;
    const video = $("formVideo"), canvas = $("formCanvas");
    if (video.readyState >= 2 && formDetector) {
      const poses = await formDetector.estimatePoses(video);
      drawPose(canvas, video, poses[0]);
      analyzeSquat(poses[0]);
    }
    formRaf = requestAnimationFrame(formLoop);
  }
  function drawPose(canvas, video, pose) {
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!pose) return;
    ctx.fillStyle = "#a3e635";
    pose.keypoints.forEach(kp => {
      if (kp.score > 0.3) { ctx.beginPath(); ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI); ctx.fill(); }
    });
  }
  function analyzeSquat(pose) {
    if (!pose) { $("formFeedback").textContent = "No body detected, step back."; return; }
    const kp = n => pose.keypoints.find(k => k.name === n);
    const hip = kp("left_hip"), knee = kp("left_knee");
    if (!hip || !knee || hip.score < 0.3 || knee.score < 0.3) {
      $("formFeedback").textContent = "Show your side profile to the camera.";
      return;
    }
    // in image coords, y increases downward. Hip below knee = hip.y > knee.y
    const depth = hip.y - knee.y;
    let msg;
    if (squatState === "up" && depth > 20) {
      squatState = "down";
      msg = "Good depth! Drive up.";
    } else if (squatState === "down" && depth < 0) {
      squatState = "up"; squatReps++;
      msg = `Rep ${squatReps}, nice!`;
    } else if (squatState === "up") {
      msg = depth > -30 ? "Bend your knees…" : "Going down…";
    } else {
      msg = "Hold… now drive up!";
    }
    $("formFeedback").innerHTML = `${msg}<br><span class="muted" style="font-size:13px">Reps: ${squatReps}</span>`;
  }
  function openFormCheck() {
    $("formClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    $("formVeil").classList.remove("hidden");
  }

  // VOICE LOGGING
  let voiceRec = null;
  function setVoiceBtn(listening) {
    const b = $("voiceBtn"); if (!b) return;
    b.innerHTML = `<span class="btn-ic">` + (window.FORGE_ICON ? window.FORGE_ICON(listening ? "square" : "mic") : "") + `</span>` + (listening ? " Stop" : " Voice log");
  }
  function toggleVoiceLog() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { appAlert("Voice not supported in this browser."); return; }
    if (voiceRec) { voiceRec.stop(); voiceRec = null; setVoiceBtn(false); return; }
    voiceRec = new SR();
    voiceRec.lang = "en-US";
    voiceRec.onresult = e => {
      let text = e.results[0][0].transcript.toLowerCase();
      // convert word numbers to digits (speech recognition often hears "ten" not "10")
      const WORDS = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10,
        eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20,
        thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90, hundred:100 };
      text = text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/g, w => WORDS[w]);
      // handle "twenty five" style compounds
      text = text.replace(/(\d+)\s+(\d+)\b/g, (m, a, b) => (parseInt(a) >= 20 && parseInt(b) < 10) ? String(parseInt(a) + parseInt(b)) : m);
      const repsM = text.match(/(\d+)\s*reps?/);
      const wM = text.match(/(\d+(?:\.\d+)?)\s*(kg|kilos?|lb|lbs|pounds?)/);
      // fallback: two bare numbers = reps then weight (e.g. "10 60")
      let reps = repsM ? repsM[1] : null, weight = wM ? wM[1] : null, wUnit = wM ? wM[2] : null;
      if (!reps && !weight) {
        const nums = text.match(/\d+(?:\.\d+)?/g);
        if (nums && nums.length >= 2) { reps = nums[0]; weight = nums[1]; }
        else if (nums && nums.length === 1) { reps = nums[0]; }
      }
      if (reps || weight) {
        const rows = document.querySelectorAll(".set-row2:not(.voiced)");
        if (rows.length) {
          const row = rows[0];
          row.classList.add("voiced");
          if (reps) {
            const inp = row.querySelector('input[data-f="reps"]');
            if (inp) { inp.value = reps; inp.dispatchEvent(new Event("input", { bubbles: true })); }
          }
          if (weight) {
            const inp = row.querySelector('input[data-f="weight"]');
            if (inp) {
              let v = parseFloat(weight);
              const unit = wUnit || "";
              if (/lb|lbs|pound/.test(unit) && getSettings().units === "kg") v = v * 0.453592;
              if (/kg|kilo/.test(unit) && getSettings().units === "lb") v = v * 2.20462;
              inp.value = Math.round(v * 10) / 10;
              inp.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
          const btn = row.querySelector(".set-done");
          if (btn) btn.click();
          $("voiceStatus").textContent = `Logged: ${text}`;
        }
      } else {
        $("voiceStatus").textContent = `Heard: "${text}". Try "10 reps 60 kilos"`;
      }
    };
    voiceRec.onend = () => { voiceRec = null; setVoiceBtn(false); };
    voiceRec.start();
    setVoiceBtn(true);
    $("voiceStatus").textContent = "Listening… say \"10 reps 60 kilos\"";
  }

  // AI COACH - generates a program from your history
  function generateCoachProgram() {
    const log = getLog();
    const myEq = getSettings().myEquipment || [];
    // find weak muscle groups (low 28-day volume)
    const vol = {};
    const cutoff = Date.now() - 28 * 864e5;
    log.forEach(w => {
      if (w.ts < cutoff) return;
      w.exercises.forEach(x => {
        const ex = byId(x.id);
        if (!ex) return;
        vol[ex.primary] = (vol[ex.primary] || 0) + x.sets.length;
      });
    });
    const weak = Object.keys(MUSCLE_INFO)
      .filter(g => MANNEQUIN_IDS.includes(g))
      .sort((a, b) => (vol[a] || 0) - (vol[b] || 0))
      .slice(0, 4);
    // pick exercises for weak groups, preferring user's equipment
    const picks = [];
    weak.forEach(g => {
      const cands = EXERCISES.filter(e => e.primary === g && (!myEq.length || myEq.includes(e.equipment)));
      if (cands.length) picks.push(cands[Math.floor(Math.random() * cands.length)]);
    });
    // fill to 6 exercises with compounds
    const compounds = EXERCISES.filter(e => ["chest", "back", "quads"].includes(e.primary) && (!myEq.length || myEq.includes(e.equipment)));
    while (picks.length < 6 && compounds.length) {
      const c = compounds.splice(Math.floor(Math.random() * compounds.length), 1)[0];
      if (!picks.includes(c)) picks.push(c);
    }
    const id = "coach-" + Date.now().toString(36);
    const prog = {
      id, name: "AI Coach Plan", tagline: "Generated for your weak points: " + weak.map(g => MUSCLE_INFO[g].name).join(", "),
      custom: true, level: "custom", daysPerWeek: 3, weeks: 4, equipment: "Mixed",
      days: [
        { name: "Day 1", exercises: picks.slice(0, 3).map(e => ({ id: e.id, sets: 3, reps: "10" })) },
        { name: "Day 2", exercises: picks.slice(3, 6).map(e => ({ id: e.id, sets: 3, reps: "10" })) },
        { name: "Day 3", exercises: picks.slice(0, 3).map(e => ({ id: e.id, sets: 3, reps: "12" })) },
      ]
    };
    const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
    location.hash = "#/program/" + id;
  }
  // AUTO-REGULATION + DELOAD + RECOVERY
  function suggestWeight(exId) {
    // find last logged weight for this exercise, suggest +2.5% if reps were high
    const log = getLog();
    for (let i = log.length - 1; i >= 0; i--) {
      const w = log[i];
      const x = w.exercises.find(e => e.id === exId);
      if (x && x.sets.length) {
        const last = x.sets[x.sets.length - 1];
        const avgReps = x.sets.reduce((a, s) => a + s.reps, 0) / x.sets.length;
        let suggested = last.weight;
        if (avgReps >= 10) suggested = last.weight * 1.025; // progressive overload
        return { last: last.weight, suggested: Math.round(suggested * 4) / 4, reps: last.reps };
      }
    }
    return null;
  }
  function lastSessionFull(exId) {
    // returns the most recent logged session's sets for this exercise
    const log = getLog();
    for (let i = log.length - 1; i >= 0; i--) {
      const x = (log[i].exercises || []).find(e => e.id === exId);
      if (x && x.sets && x.sets.length) {
        return { date: log[i].date, sets: x.sets.map(st => ({ weight: st.weight || 0, reps: st.reps || 0 })) };
      }
    }
    return null;
  }
  function lastSessionSummary(ls) {
    if (!ls || !ls.sets.length) return "";
    // compact: group identical sets, e.g. "3x8 @ 60kg"
    const groups = [];
    ls.sets.forEach(st => {
      const key = st.weight + "x" + st.reps;
      const g = groups.find(g => g.key === key);
      if (g) g.n++;
      else groups.push({ key, n: 1, weight: st.weight, reps: st.reps });
    });
    return groups.map(g => `${g.n}x${g.reps} @ ${fmtW(g.weight)}`).join(", ");
  }
  function checkDeload() {
    const log = getLog();
    if (log.length < 6) return false;
    // check if last 2 weeks volume is dropping while frequency stays high
    const now = Date.now();
    const week1 = log.filter(w => now - w.ts < 7 * 864e5);
    const week2 = log.filter(w => now - w.ts >= 7 * 864e5 && now - w.ts < 14 * 864e5);
    if (week1.length < 2 || week2.length < 2) return false;
    const vol = ws => ws.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0), 0);
    return vol(week1) < vol(week2) * 0.85;
  }
  function recoveryScore() {
    const log = getLog();
    if (!log.length) return 100;
    const last = log[log.length - 1];
    const daysSince = (Date.now() - last.ts) / 864e5;
    const lastVol = last.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + s.weight * s.reps, 0), 0);
    // base 100, -10 per day since workout (up to 3 days), -volume factor
    let score = 100 - Math.min(30, daysSince * 10) - Math.min(20, lastVol / 500);
    return Math.max(0, Math.round(score));
  }

  /* ---------- movement pattern radar ---------- */
  const PATTERNS = ["push", "pull", "squat", "hinge", "lunge", "carry"];
  const PATTERN_NAMES = { push: "Push", pull: "Pull", squat: "Squat", hinge: "Hinge", lunge: "Lunge", carry: "Carry" };
  const MUSCLE_TO_PATTERN = {
    chest: "push", shoulders: "push", triceps: "push",
    back: "pull", lats: "pull", biceps: "pull",
    quads: "squat",
    hamstrings: "hinge", glutes: "hinge", "lower-back": "hinge",
    traps: "carry", forearms: "carry", abs: "carry", obliques: "carry",
    "full-body": "carry", cardio: "carry"
  };
  const LUNGE_WORDS = ["lunge", "bulgarian", "split squat", "step-up", "stepup", "step up"];
  function patternOfExercise(ex) {
    const nm = (ex.name || "").toLowerCase();
    if (LUNGE_WORDS.some(w => nm.includes(w))) return "lunge";
    return MUSCLE_TO_PATTERN[groupOf(ex.primary)] || "carry";
  }
  function patternVolume(days) {
    const cutoff = new Date(); cutoff.setHours(12, 0, 0, 0); cutoff.setDate(cutoff.getDate() - days);
    const vol = { push: 0, pull: 0, squat: 0, hinge: 0, lunge: 0, carry: 0 };
    getLog().forEach(w => {
      if (new Date(w.date + "T12:00:00") < cutoff) return;
      w.exercises.forEach(x => {
        const ex = byId(x.id); if (!ex) return;
        vol[patternOfExercise(ex)] += x.sets.length;
      });
    });
    return vol;
  }
  function radarSection() {
    const vol = patternVolume(28);
    const total = PATTERNS.reduce((a, p) => a + vol[p], 0);
    if (!total) return `<h3 style="margin-top:20px">Movement balance</h3><div class="empty-note"><p><b>No training data in the last 28 days.</b></p><p>Log workouts and your movement balance will appear here.</p></div>`;
    const max = Math.max.apply(null, PATTERNS.map(p => vol[p]).concat([1]));
    const W = 400, H = 360, cx = 200, cy = 180, R = 115;
    const pt = (i, frac) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / PATTERNS.length;
      return [cx + Math.cos(a) * R * frac, cy + Math.sin(a) * R * frac];
    };
    let grid = "";
    [0.25, 0.5, 0.75, 1].forEach(f => {
      grid += `<polygon points="${PATTERNS.map((_, i) => pt(i, f).map(n => n.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
    });
    let axes = "";
    PATTERNS.forEach((p, i) => {
      const xy = pt(i, 1);
      axes += `<line x1="${cx}" y1="${cy}" x2="${xy[0].toFixed(1)}" y2="${xy[1].toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`;
      const lb = pt(i, 1.24);
      const anchor = Math.abs(lb[0] - cx) < 10 ? "middle" : (lb[0] > cx ? "start" : "end");
      axes += `<text x="${lb[0].toFixed(1)}" y="${(lb[1] + 4).toFixed(1)}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="var(--ink)">${PATTERN_NAMES[p]}</text>`;
      axes += `<text x="${lb[0].toFixed(1)}" y="${(lb[1] + 20).toFixed(1)}" text-anchor="${anchor}" font-size="11" fill="var(--muted)">${vol[p]} sets</text>`;
    });
    const poly = PATTERNS.map((p, i) => pt(i, vol[p] / max).map(n => n.toFixed(1)).join(",")).join(" ");
    const dots = PATTERNS.map((p, i) => { const d = pt(i, vol[p] / max); return `<circle cx="${d[0].toFixed(1)}" cy="${d[1].toFixed(1)}" r="4" fill="var(--volt)"/>`; }).join("");
    const weakest = PATTERNS.reduce((a, b) => vol[a] <= vol[b] ? a : b);
    const weakestTip = vol[weakest] === 0
      ? `No ${PATTERN_NAMES[weakest].toLowerCase()} work logged in 28 days.`
      : `${PATTERN_NAMES[weakest]} is your least trained pattern at ${vol[weakest]} sets.`;
    return `<h3 style="margin-top:20px">Movement balance</h3>
    <p class="muted" style="font-size:13px;margin-bottom:12px">Sets per movement pattern, last 28 days. Shape shows balance, not absolute volume. Carry covers traps, forearms, core and conditioning.</p>
    <div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" style="height:auto;display:block;max-width:430px;margin:0 auto" role="img" aria-label="Movement pattern balance radar chart">${grid}${axes}<polygon points="${poly}" fill="color-mix(in srgb, var(--volt) 22%, transparent)" stroke="var(--volt)" stroke-width="2.5" stroke-linejoin="round"/>${dots}</svg></div>
    <div class="onerm-box"><b>Weakest pattern: ${PATTERN_NAMES[weakest]}.</b> <span class="muted">${weakestTip}</span></div>`;
  }
  function renderInsightsTab(body) {
    const bal = muscleBalance();
    const dots = dotsScore();
    const corr = correlationInsights();
    const plats = detectPlateaus();
    const xp = getXP();
    body.innerHTML = `
      <h3>Training insights</h3>
      <p class="muted" style="font-size:13px;margin-bottom:12px">Deep analysis of your training data. Ratios near 1.0 are balanced.</p>
      <div class="stat-grid">
        <div class="stat-card"><b>${xpLevel(xp.xp)}</b><span>level (${xp.xp.toLocaleString()} XP)</span></div>
        ${dots ? `<div class="stat-card"><b>${dots}</b><span>DOTS score</span></div>` : ""}
        <div class="stat-card"><b>${bal.ratio ? bal.ratio.toFixed(2) : "-"}</b><span>push/pull ratio</span></div>
        <div class="stat-card"><b>${bal.legRatio ? bal.legRatio.toFixed(2) : "-"}</b><span>quad/ham ratio</span></div>
      </div>
      ${bal.ratio > 1.3 ? `<div class="onerm-box warn"><b>Imbalance:</b> <span class="muted">Push volume ${Math.round(bal.ratio * 100)}% of pull. Add more rows and pull-ups.</span></div>` : ""}
      ${bal.legRatio > 1.6 ? `<div class="onerm-box warn"><b>Imbalance:</b> <span class="muted">Quads dominate hamstrings. Add Romanian deadlifts and leg curls.</span></div>` : ""}
      ${radarSection()}
      ${plats.length ? `<h3 style="margin-top:20px">Plateaus detected</h3>` + plats.map(p => `<div class="onerm-box"><b>${p.name}</b> <span class="muted">stuck for ${p.sessions} sessions. Try: +1 set, swap variation, or deload.</span></div>`).join("") : ""}
      ${corr.length ? `<h3 style="margin-top:20px">Correlations</h3>` + corr.map(c => `<p>💡 ${c}</p>`).join("") : ""}
      <h3 style="margin-top:20px">Total volume lifted</h3>
      <p style="font-size:28px;font-weight:800;color:var(--volt)">${Math.round(totalVolumeAll()).toLocaleString()} kg</p>
      ${rpeTrendSection()}
    `;
  }
  function rpeTrendSection() {
    const log = getLog();
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // this week's Monday
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(monday); start.setDate(monday.getDate() - i * 7);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const sKey = fmtDate(start), eKey = fmtDate(end);
      let sum = 0, n = 0;
      log.forEach(w => {
        if (w.date >= sKey && w.date < eKey) w.exercises.forEach(x => x.sets.forEach(s => { if (s.rpe != null) { sum += s.rpe; n++; } }));
      });
      weeks.push({ label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }), avg: n ? sum / n : null });
    }
    if (!weeks.some(w => w.avg != null)) {
      return `<h3 style="margin-top:20px">RPE trend</h3><div class="empty-note"><p><b>No RPE data yet.</b></p><p>Log RPE on your sets and the trend will appear here.</p></div>`;
    }
    const W = 600, H = 220, padL = 34, padR = 12, padT = 12, padB = 28;
    const iw = W - padL - padR, ih = H - padT - padB;
    const yOf = v => padT + ih - (v - 6) / 4 * ih;
    const xOf = i => padL + i / (weeks.length - 1) * iw;
    let grid = "";
    for (let v = 6; v <= 10; v++) {
      grid += `<line x1="${padL}" y1="${yOf(v)}" x2="${W - padR}" y2="${yOf(v)}" stroke="var(--line)" stroke-width="1"/><text x="${padL - 6}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}</text>`;
    }
    let xl = "";
    weeks.forEach((w, i) => {
      if (i % 4 === 0 || i === weeks.length - 1) xl += `<text x="${xOf(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(w.label)}</text>`;
    });
    const pts = weeks.map((w, i) => w.avg == null ? null : [xOf(i), yOf(w.avg)]);
    let path = "", started = false;
    pts.forEach(p => {
      if (!p) { started = false; return; }
      path += (started ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1);
      started = true;
    });
    const dots = pts.map(p => p ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--volt)"/>` : "").join("");
    return `<h3 style="margin-top:20px">RPE trend</h3><p class="muted" style="font-size:13px;margin-bottom:12px">Average RPE per week, last 12 weeks.</p><div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" width="100%" style="height:auto;display:block" role="img" aria-label="Average RPE per week">${grid}<path d="${path}" fill="none" stroke="var(--volt)" stroke-width="2.5" stroke-linecap="round"/>${dots}${xl}</svg></div>`;
  }
  function renderCoachTab(body) {
    body.innerHTML = `
      <h3>Ask your coach</h3>
      <p class="muted">Answers from your own training data.</p>
      <div class="field-group" style="margin-top:12px">
        <label class="field-label" for="coachQ">Your question</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="coachQ" placeholder="e.g. why is my bench stuck?" class="field-input" style="flex:1" />
          <button class="btn btn-primary btn-sm" id="coachAsk">Ask</button>
        </div>
      </div>
      <div id="coachA" style="margin-top:12px"></div>
      <h3 style="margin-top:24px">Quick actions</h3>
      <p class="muted" style="font-size:13px;margin-bottom:12px">Powerful tools for structured training.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <button class="btn btn-ghost btn-sm" id="mesoBtn" style="width:100%">4-week mesocycle</button>
          <p class="muted" style="font-size:12px;margin-top:6px">Auto-progressive 4-week plan with deload, built from any program.</p>
        </div>
        <div style="flex:1;min-width:200px">
          <button class="btn btn-ghost btn-sm" id="warmupBtn" style="width:100%">Warm-up calculator</button>
          <p class="muted" style="font-size:12px;margin-top:6px">Enter working weight, get exact warm-up sets.</p>
        </div>
        <div style="flex:1;min-width:200px">
          <button class="btn btn-ghost btn-sm" id="wodBtn" style="width:100%">WOD timer</button>
          <p class="muted" style="font-size:12px;margin-top:6px">AMRAP, Tabata, and EMOM timers with audio cues.</p>
        </div>
        <div style="flex:1;min-width:200px">
          <button class="btn btn-ghost btn-sm" id="meetBtn" style="width:100%">Virtual meet</button>
          <p class="muted" style="font-size:12px;margin-top:6px">Mock powerlifting meet: attempts, total and DOTS score.</p>
        </div>
      </div>
      <div id="coachTool" style="margin-top:16px"></div>
    `;
    const _meetBtn = $("meetBtn");
    if (_meetBtn) _meetBtn.addEventListener("click", renderMeetTool);
    $("coachAsk").addEventListener("click", answerCoach);
    $("coachQ").addEventListener("keydown", e => { if (e.key === "Enter") answerCoach(); });
    $("mesoBtn").addEventListener("click", () => {
      const progs = getCustomPrograms().concat(PROGRAMS);
      if (!progs.length) {
        $("coachTool").innerHTML = `<div class="onerm-box" style="border-color:#f87171"><b>No programs found.</b></div>`;
        return;
      }
      const opts = progs.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
      $("coachTool").innerHTML = `
        <div class="field-group">
          <label class="field-label" for="mesoBase">Base program</label>
          <select id="mesoBase" style="width:100%;max-width:400px">${opts}</select>
        </div>
        <p class="muted" style="font-size:13px;margin:8px 0 12px">Creates a 4-week plan: weights increase 2.5% each week for weeks 1-3, week 4 is a deload at 60%.</p>
        <button class="btn btn-primary btn-sm" id="mesoGo">Generate mesocycle</button>`;
      $("mesoGo").addEventListener("click", () => {
        const sel = $("mesoBase");
        if (!sel || !sel.value) {
          $("coachTool").innerHTML = `<div class="onerm-box" style="border-color:#f87171"><b>Error:</b> <span class="muted">Please select a program.</span></div>`;
          return;
        }
        try {
          generatePeriodized(sel.value);
        } catch (err) {
          $("coachTool").innerHTML = `<div class="onerm-box" style="border-color:#f87171"><b>Error:</b> <span class="muted">${esc(err.message)}</span></div>`;
        }
      });
    });
    $("warmupBtn").addEventListener("click", () => {
      $("coachTool").innerHTML = `
        <div class="field-group">
          <label class="field-label" for="wuW">Working weight (${getSettings().units})</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="number" id="wuW" class="field-input" style="width:140px" />
            <button class="btn btn-primary btn-sm" id="wuGo">Calculate</button>
          </div>
        </div>
        <div id="wuOut" style="margin-top:12px"></div>`;
      $("wuGo").addEventListener("click", () => {
        const sets = warmupSets($("wuW").value);
        $("wuOut").innerHTML = sets.map(s => `<p>${fmtW(s.weight)} × ${s.reps}</p>`).join("") || "<p class='muted'>Enter a weight.</p>";
      });
    });
    $("wodBtn").addEventListener("click", () => {
      $("coachTool").innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" data-wod="amrap">AMRAP 20</button>
          <button class="btn btn-ghost btn-sm" data-wod="tabata">Tabata</button>
          <button class="btn btn-ghost btn-sm" data-wod="emom">EMOM 10</button>
        </div><div id="wodOut" style="margin-top:16px;text-align:center"></div>`;
      $("coachTool").addEventListener("click", e => {
        const b = e.target.closest("[data-wod]");
        if (b) startWOD(b.dataset.wod);
      });
    });
  }
  function answerCoach() {
    const q = $("coachQ").value.toLowerCase();
    const out = $("coachA");
    let ans = "I need more data. Log a few workouts first.";
    if (/bench|stuck|plateau/.test(q)) {
      const plats = detectPlateaus();
      const bp = plats.find(p => /bench|press/i.test(p.name));
      ans = bp ? `Your ${bp.name} has stalled for ${bp.sessions} sessions. Try adding a back-off set, swapping to incline for 2 weeks, or checking your sleep.` : "No bench plateau detected. Keep progressing!";
    } else if (/sleep|recover/.test(q)) {
      const corr = correlationInsights();
      ans = corr.length ? corr[0] : "Log sleep in daily check-ins to unlock recovery insights.";
    } else if (/volume|how much/.test(q)) {
      ans = `You've lifted ${Math.round(totalVolumeAll()).toLocaleString()} kg total across ${getLog().length} workouts.`;
    } else if (/balance|imbalance/.test(q)) {
      const bal = muscleBalance();
      ans = `Push/pull ratio is ${bal.ratio ? bal.ratio.toFixed(2) : "unknown"}. Aim for 1.0 or slightly pull-dominant.`;
    } else if (/deload|tired/.test(q)) {
      ans = checkDeload() ? "Yes, your volume is dropping. Take a light week." : "No deload needed right now. Keep pushing.";
    }
    out.innerHTML = `<div class="onerm-box"><b>Coach:</b> <span>${ans}</span></div>`;
  }
  let wodInterval = null;
  function startWOD(type) {
    if (wodInterval) { clearInterval(wodInterval); wodInterval = null; }
    const out = $("wodOut");
    if (!out) return;
    let secs, label;
    if (type === "amrap") { secs = 1200; label = "AMRAP 20:00"; }
    else if (type === "tabata") { secs = 240; label = "Tabata 4:00"; }
    else { secs = 600; label = "EMOM 10:00"; }
    let left = secs;
    out.innerHTML = `<div style="font-size:48px;font-weight:800;color:var(--volt)">${label}</div><div id="wodTimer" style="font-size:36px"></div><button class="btn btn-ghost btn-sm" id="wodStop" style="margin-top:12px">Stop</button>`;
    wodInterval = setInterval(() => {
      left--;
      const m = Math.floor(left / 60), s = left % 60;
      const t = $("wodTimer");
      if (t) t.textContent = `${m}:${String(s).padStart(2, "0")}`;
      if (type === "emom" && left % 60 === 0 && left > 0) beep(880, 0.2);
      if (type === "tabata") {
        const cycle = (secs - left) % 30;
        if (cycle === 0 || cycle === 20) beep(cycle === 0 ? 880 : 440, 0.15);
      }
      if (left <= 0) { clearInterval(wodInterval); wodInterval = null; beep(880, 0.5); if (t) t.textContent = "Done!"; }
    }, 1000);
    $("wodStop").addEventListener("click", () => { clearInterval(wodInterval); wodInterval = null; });
  }

  // PERSONAL CHALLENGES
  const CHALLENGES = [
    { id: "vol-week", name: "Volume week", desc: "Hit 20,000 kg total volume in 7 days", target: 20000, metric: "volume7" },
    { id: "freq-week", name: "5x week", desc: "Train 5 times in 7 days", target: 5, metric: "freq7" },
    { id: "streak-14", name: "2-week streak", desc: "14-day streak", target: 14, metric: "streak" },
  ];
  function challengeProgress() {
    const log = getLog();
    const now = Date.now();
    const week = log.filter(w => now - w.ts < 7 * 864e5);
    const vol7 = week.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0), 0);
    return {
      volume7: vol7,
      freq7: week.length,
      streak: workoutStreak(),
    };
  }
  function renderChallengesTab(body) {
    const prog = challengeProgress();
    body.innerHTML = `<h3>Challenges</h3><p class="muted">Beat your own records.</p><div class="badge-grid">` +
      CHALLENGES.map(c => {
        const cur = prog[c.metric] || 0;
        const pct = Math.min(100, Math.round(cur / c.target * 100));
        const done = cur >= c.target;
        return `<div class="badge-card ${done ? "earned" : ""}">
          <div class="badge-icon">${window.FORGE_ICON ? window.FORGE_ICON(done ? "trophy" : "target") : ""}</div>
          <b>${c.name}</b><span>${c.desc}</span>
          <div style="margin-top:8px;background:var(--surface2);border-radius:999px;height:8px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:var(--volt)"></div>
          </div>
          <span style="font-size:12px">${Math.round(cur).toLocaleString()} / ${c.target.toLocaleString()}</span>
        </div>`;
      }).join("") + `</div>`;
  }

  function applyA11y() {
    const s = getSettings();
    document.body.classList.toggle("big-text", !!s.bigText);
    document.body.classList.toggle("high-contrast", !!s.highContrast);
    document.body.classList.toggle("rm", !!s.reduceMotion);
  }
  function buzz(p) {
    if (!getSettings().haptics) return;
    try { if (navigator.vibrate) navigator.vibrate(p || 15); } catch (e) {}
  }
  function countUp(el, final, fmt) {
    fmt = fmt || (v => Math.round(v).toLocaleString());
    if (!el) return;
    if (getSettings().reduceMotion) { el.textContent = fmt(final); return; }
    const dur = 700, t0 = performance.now();
    (function tick(t) {
      const pr = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - pr, 3);
      el.textContent = fmt(final * e);
      if (pr < 1) requestAnimationFrame(tick);
    })(t0);
  }
  // DAILY CHECK-IN UI
  let ciEnergyVal = 3;
  function syncCiSliders() {
    const so = $("ciSleepOut"), eo = $("ciEnergyOut");
    if (so) so.textContent = parseFloat($("ciSleep").value).toFixed(1) + "h";
    ciEnergyVal = parseInt($("ciEnergy").value, 10);
    if (eo) eo.textContent = ciEnergyVal + "/5";
  }
  function openCheckin() {
    $("checkinClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    const today = fmtDate(new Date());
    const existing = getCheckin(today);
    if (existing) {
      if (existing.sleep != null) $("ciSleep").value = existing.sleep;
      $("ciHrv").value = existing.hrv || "";
      ciEnergyVal = existing.energy || 3;
    }
    $("ciEnergy").value = ciEnergyVal;
    syncCiSliders();
    updateTrackerLabels();
    $("checkinVeil").classList.remove("hidden");
  }
  var WATER_TARGET = 2000;
  function updateTrackerLabels() {
    const today = fmtDate(new Date());
    const w = getWater(today);
    $("waterToday").textContent = `${w} ml today`;
    const wf = $("waterFill");
    if (wf) wf.style.height = Math.min(100, (w / WATER_TARGET) * 100) + "%";
    function paintRing(id, lid, frac, txt) {
      const el = $(id), lb = $(lid);
      if (el) el.style.strokeDashoffset = (119.4 * (1 - Math.min(1, Math.max(0, frac)))).toFixed(1);
      if (lb) lb.textContent = txt;
    }
    paintRing("waterRing", "waterRingLabel", w / WATER_TARGET, Math.round(Math.min(100, (w / WATER_TARGET) * 100)) + "%");
    const pNow = getProtein(today), ptNow = proteinTarget();
    paintRing("proteinRing", "proteinRingLabel", pNow / ptNow, Math.round(Math.min(100, (pNow / ptNow) * 100)) + "%");
    $("proteinToday").textContent = `${getProtein(today)}g / ${proteinTarget()}g`;
    renderCheckinHistory();
    renderSuppList();
  }
  function renderCheckinHistory() {
    const hist = getCheckinHistory(7);
    const el = $("checkinHistory");
    if (!el) return;
    el.innerHTML = hist.map(h => {
      const d = new Date(h.date + "T12:00:00");
      const label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      const parts = [];
      if (h.checkin) {
        if (h.checkin.sleep) parts.push(`😴 ${h.checkin.sleep}h`);
        if (h.checkin.energy) parts.push(`⚡ ${h.checkin.energy}/5`);
        if (h.checkin.hrv) parts.push(`❤️ ${h.checkin.hrv}ms`);
      }
      if (h.water) parts.push(`💧 ${h.water}ml`);
      if (h.protein) parts.push(`🥩 ${h.protein}g`);
      const ci = h.checkin || {};
      return `<div style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><b style="font-size:14px">${label}</b><div class="muted" style="font-size:12px">${parts.join(" · ") || "-"}</div></div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm" data-ciedit="${h.date}" >Edit</button>
            ${(h.water || h.protein) ? `<button class="btn btn-ghost btn-sm" data-clearday="${h.date}" >Clear</button>` : ""}
          </div>
        </div>
        <div class="ci-edit hidden" id="ciedit-${h.date}" style="margin-top:10px;background:var(--surface2);border-radius:10px;padding:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="muted" style="font-size:12px">Sleep (h)<br><input type="number" class="ci-e-sleep field-input" min="0" max="14" step="0.5" value="${ci.sleep || ""}" style="width:100%"></label>
            <label class="muted" style="font-size:12px">Energy (1-5)<br><input type="number" class="ci-e-energy field-input" min="1" max="5" value="${ci.energy || ""}" style="width:100%"></label>
            <label class="muted" style="font-size:12px">HRV (ms)<br><input type="number" class="ci-e-hrv field-input" min="0" max="300" value="${ci.hrv || ""}" style="width:100%"></label>
            <label class="muted" style="font-size:12px">Water (ml)<br><input type="number" class="ci-e-water field-input" min="0" value="${h.water || 0}" style="width:100%"></label>
            <label class="muted" style="font-size:12px">Protein (g)<br><input type="number" class="ci-e-protein field-input" min="0" value="${h.protein || 0}" style="width:100%"></label>
          </div>
          <button class="btn btn-primary btn-sm" data-cisave="${h.date}" style="margin-top:10px">Save</button>
        </div>
      </div>`;
    }).join("");
    el.querySelectorAll("[data-clearday]").forEach(b => b.addEventListener("click", () => {
      const day = b.dataset.clearday;
      setWater(day, 0); setProtein(day, 0);
      updateTrackerLabels();
    }));
    el.querySelectorAll("[data-ciedit]").forEach(b => b.addEventListener("click", () => {
      const box = $("ciedit-" + b.dataset.ciedit);
      if (box) box.classList.toggle("hidden");
    }));
    el.querySelectorAll("[data-cisave]").forEach(b => b.addEventListener("click", () => {
      const day = b.dataset.cisave;
      const box = $("ciedit-" + day);
      const q = sel => { const i = box.querySelector(sel); return i ? parseFloat(i.value) : NaN; };
      const sleep = q(".ci-e-sleep"), energy = q(".ci-e-energy"), hrv = q(".ci-e-hrv");
      const water = q(".ci-e-water"), protein = q(".ci-e-protein");
      const prev = getCheckin(day) || {};
      saveCheckin(day, { sleep: isNaN(sleep) ? (prev.sleep || null) : sleep, energy: isNaN(energy) ? (prev.energy || null) : Math.max(1, Math.min(5, energy)), hrv: isNaN(hrv) ? (prev.hrv || null) : hrv, ts: Date.now() });
      if (!isNaN(water)) setWater(day, water);
      if (!isNaN(protein)) setProtein(day, protein);
      updateTrackerLabels();
    }));
  }
  function initCheckin() {
    $("checkinClose").addEventListener("click", () => $("checkinVeil").classList.add("hidden"));
    $("checkinVeil").addEventListener("click", e => { if (e.target.id === "checkinVeil") $("checkinVeil").classList.add("hidden"); });
    $("ciSleep").addEventListener("input", syncCiSliders);
    $("ciEnergy").addEventListener("input", syncCiSliders);
    document.querySelectorAll("[data-water]").forEach(b => b.addEventListener("click", () => {
      addWater(fmtDate(new Date()), parseInt(b.dataset.water)); updateTrackerLabels();
    }));
    $("proteinAdd").addEventListener("click", () => {
      const v = parseFloat($("ciProtein").value) || 0;
      if (v > 0) { addProtein(fmtDate(new Date()), v); $("ciProtein").value = ""; updateTrackerLabels(); }
    });
    $("proteinClear").addEventListener("click", () => {
      setProtein(fmtDate(new Date()), 0); updateTrackerLabels();
    });
    $("checkinSave").addEventListener("click", () => {
      saveCheckin(fmtDate(new Date()), { sleep: parseFloat($("ciSleep").value) || null, energy: ciEnergyVal, hrv: parseFloat($("ciHrv").value) || null, ts: Date.now() });
      $("checkinVeil").classList.add("hidden");
    });
    $("suppAdd").addEventListener("click", () => {
      const v = $("suppName").value.trim();
      if (!v) return;
      const list = getSupplements();
      list.push({ id: "supp-" + Date.now().toString(36), name: v });
      saveSupplements(list);
      $("suppName").value = "";
      renderSuppList();
    });
    $("suppList").addEventListener("click", e => {
      const tg = e.target.closest("[data-supp]");
      if (tg) {
        const today = fmtDate(new Date());
        let taken = getSuppLog(today);
        taken = taken.includes(tg.dataset.supp) ? taken.filter(id => id !== tg.dataset.supp) : taken.concat(tg.dataset.supp);
        saveSuppLog(today, taken);
        renderSuppList();
        return;
      }
      const del = e.target.closest("[data-suppdel]");
      if (del) {
        saveSupplements(getSupplements().filter(s => s.id !== del.dataset.suppdel));
        renderSuppList();
      }
    });
    $("waterSet").addEventListener("click", () => {
      const v = parseFloat($("ciWaterSet").value);
      if (!isNaN(v) && v >= 0) { setWater(fmtDate(new Date()), v); $("ciWaterSet").value = ""; updateTrackerLabels(); }
    });
  }

  // ============ V10: TRAINING INTELLIGENCE ============
  // Periodization planner - 4-week mesocycle with progressive overload
  function generatePeriodized(baseProgId) {
    const base = progById(baseProgId);
    if (!base) {
      $("coachTool").innerHTML = `<div class="onerm-box" style="border-color:#f87171"><b>Error:</b> <span class="muted">Could not find that program.</span></div>`;
      return;
    }
    $("coachTool").innerHTML = `<p class="muted">Generating your mesocycle…</p>`;
    const weeks = [];
    for (let w = 1; w <= 4; w++) {
      const isDeload = w === 4;
      weeks.push({
        week: w, deload: isDeload,
        days: base.days.map(d => ({
          name: d.name,
          exercises: d.exercises.map(x => {
            const last = suggestWeight(x.id);
            const baseW = last ? last.suggested : 20;
            const factor = isDeload ? 0.6 : 1 + (w - 1) * 0.025;
            return { id: x.id, sets: isDeload ? Math.max(2, x.sets - 1) : x.sets, reps: x.reps,
              weight: Math.round(baseW * factor * 4) / 4 };
          })
        }))
      });
    }
    const id = "meso-" + Date.now().toString(36);
    const prog = { id, name: base.name + " Mesocycle", tagline: "4-week periodized plan with deload week 4",
      custom: true, level: "custom", daysPerWeek: base.days.length, weeks: 4, equipment: base.equipment || "Mixed",
      mesocycle: weeks, days: base.days };
    const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
    // show success with link
    $("coachTool").innerHTML = `
      <div class="onerm-box" style="border-color:var(--volt)">
        <b>Mesocycle created!</b>
        <p class="muted" style="margin:8px 0">4 weeks: progressive overload weeks 1-3 (+2.5%/week), deload week 4 (60% volume).</p>
        <a class="btn btn-primary btn-sm" href="#/program/${id}">View mesocycle</a>
      </div>`;
  }
  // RPE tracking helpers
  function getRPE(exId) {
    try { const m = JSON.parse(localStorage.getItem("forge-rpe") || "{}"); return m[exId] || null; }
    catch (e) { return null; }
  }
  function saveRPE(exId, rpe) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-rpe") || "{}");
      m[exId] = { rpe, ts: Date.now() };
      localStorage.setItem("forge-rpe", JSON.stringify(m));
    } catch (e) {}
  }
  // Plateau detection - 3+ sessions without progress on a lift
  function detectPlateaus() {
    const log = getLog();
    const byEx = {};
    log.forEach(w => w.exercises.forEach(x => {
      if (!byEx[x.id]) byEx[x.id] = [];
      const best = Math.max(...x.sets.map(s => s.weight || 0));
      byEx[x.id].push({ ts: w.ts, best });
    }));
    const plateaus = [];
    for (const id in byEx) {
      const hist = byEx[id].slice(-4);
      if (hist.length >= 3) {
        const first = hist[0].best, last = hist[hist.length - 1].best;
        if (last <= first && first > 0) {
          const ex = byId(id);
          if (ex) plateaus.push({ id, name: ex.name, sessions: hist.length });
        }
      }
    }
    return plateaus.slice(0, 5);
  }
  // %1RM helpers
  function parsePercent(repsStr) {
    const m = String(repsStr).match(/(\d+)%/);
    return m ? parseInt(m[1]) : null;
  }
  function weightFromPercent(exId, pct) {
    const orm = oneRM(exId);
    if (!orm) return null;
    return Math.round(orm * pct / 100 * 4) / 4;
  }
  // Warm-up calculator
  function warmupSets(workingWeight) {
    const w = parseFloat(workingWeight) || 0;
    if (w <= 0) return [];
    const steps = [];
    if (w > 60) steps.push({ weight: 20, reps: 10 });
    if (w > 40) steps.push({ weight: Math.round(w * 0.4), reps: 8 });
    if (w > 30) steps.push({ weight: Math.round(w * 0.6), reps: 5 });
    steps.push({ weight: Math.round(w * 0.8), reps: 3 });
    return steps;
  }
  // Per-exercise rest memory
  function getRestFor(exId) {
    try { return JSON.parse(localStorage.getItem("forge-restmem") || "{}")[exId] || null; }
    catch (e) { return null; }
  }
  function saveRestFor(exId, secs) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-restmem") || "{}");
      m[exId] = secs; localStorage.setItem("forge-restmem", JSON.stringify(m));
    } catch (e) {}
  }
  // Exercise notes
  function getExNote(exId) {
    try { return localStorage.getItem("forge-note-" + exId) || ""; }
    catch (e) { return ""; }
  }
  function saveExNote(exId, note) {
    try { localStorage.setItem("forge-note-" + exId, note); } catch (e) {}
  }
  // Tempo coach
  function getTempo(exId) {
    try { return JSON.parse(localStorage.getItem("forge-tempo") || "{}")[exId] || [3, 1, 2]; }
    catch (e) { return [3, 1, 2]; }
  }
  function saveTempo(exId, arr) {
    try { const m = JSON.parse(localStorage.getItem("forge-tempo") || "{}"); m[exId] = arr; localStorage.setItem("forge-tempo", JSON.stringify(m)); } catch (e) {}
  }
  let tempoTimer = null;
  function startTempo(ecc, pause, con, elId) {
    stopTempo();
    const phases = [["Lower", Math.max(1, ecc) * 1000], ["Hold", Math.max(0, pause) * 1000], ["Lift", Math.max(1, con) * 1000]];
    let pi = 0;
    const el = $(elId || "tempoDisplay");
    const tick = () => {
      if (pi >= phases.length) pi = 0;
      const [name, dur] = phases[pi];
      if (el) el.textContent = name;
      if (window.speechSynthesis && getSettings().voiceCues) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(name));
      }
      beep(660, 0.1);
      pi++;
      tempoTimer = setTimeout(tick, dur);
    };
    tick();
  }
  function stopTempo() { if (tempoTimer) { clearTimeout(tempoTimer); tempoTimer = null; } }
  function beep(freq, dur) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq; o.type = "sine";
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }

  // ============ V10: RECOVERY & HEALTH ============
  function getCheckin(dateKey) {
    try { return JSON.parse(localStorage.getItem("forge-checkin") || "{}")[dateKey] || null; }
    catch (e) { return null; }
  }
  function saveCheckin(dateKey, data) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-checkin") || "{}");
      m[dateKey] = data; localStorage.setItem("forge-checkin", JSON.stringify(m));
    } catch (e) {}
  }
  function getSupplements() {
    try { return JSON.parse(localStorage.getItem("forge-supp") || "[]"); }
    catch (e) { return []; }
  }
  function saveSupplements(list) {
    try { localStorage.setItem("forge-supp", JSON.stringify(list)); } catch (e) {}
  }
  function getSuppLog(dateKey) {
    try { return JSON.parse(localStorage.getItem("forge-supp-log") || "{}")[dateKey] || []; }
    catch (e) { return []; }
  }
  function saveSuppLog(dateKey, ids) {
    try { const m = JSON.parse(localStorage.getItem("forge-supp-log") || "{}"); m[dateKey] = ids; localStorage.setItem("forge-supp-log", JSON.stringify(m)); } catch (e) {}
  }
  function renderSuppList() {
    const list = getSupplements();
    const el = $("suppList");
    if (!el) return;
    const today = fmtDate(new Date());
    const taken = getSuppLog(today);
    el.innerHTML = list.length ? list.map(s => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)">
        <button class="set-done ${taken.includes(s.id) ? "hit" : ""}" data-supp="${s.id}" aria-label="Mark ${esc(s.name)} taken" style="width:34px;height:34px">${window.FORGE_ICON("check")}</button>
        <span style="flex:1;font-size:14px">${esc(s.name)}</span>
        <button class="icon-btn" data-suppdel="${s.id}" aria-label="Remove supplement">${window.FORGE_ICON("x")}</button>
      </div>`).join("") : `<div class="empty-note"><p><b>No supplements yet.</b></p><p>Add your daily stack below.</p></div>`;
  }
  function getWater(dateKey) {
    try { return JSON.parse(localStorage.getItem("forge-water") || "{}")[dateKey] || 0; }
    catch (e) { return 0; }
  }
  function addWater(dateKey, ml) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-water") || "{}");
      m[dateKey] = Math.max(0, (m[dateKey] || 0) + ml);
      localStorage.setItem("forge-water", JSON.stringify(m));
    } catch (e) {}
  }
  function setWater(dateKey, ml) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-water") || "{}");
      m[dateKey] = Math.max(0, ml);
      localStorage.setItem("forge-water", JSON.stringify(m));
    } catch (e) {}
  }
  function getCheckinHistory(days) {
    try {
      const all = JSON.parse(localStorage.getItem("forge-checkin") || "{}");
      const water = JSON.parse(localStorage.getItem("forge-water") || "{}");
      const protein = JSON.parse(localStorage.getItem("forge-protein") || "{}");
      const out = [];
      for (let i = 0; i < (days || 7); i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = fmtDate(d);
        out.push({ date: key, checkin: all[key] || null, water: water[key] || 0, protein: protein[key] || 0 });
      }
      return out;
    } catch (e) { return []; }
  }
  function setProtein(dateKey, g) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-protein") || "{}");
      m[dateKey] = Math.max(0, g);
      localStorage.setItem("forge-protein", JSON.stringify(m));
    } catch (e) {}
  }
  function getCycle() {
    try { return JSON.parse(localStorage.getItem("forge-cycle") || "null"); }
    catch (e) { return null; }
  }
  function saveCycle(data) {
    try { localStorage.setItem("forge-cycle", JSON.stringify(data)); } catch (e) {}
  }
  function cyclePhase() {
    const c = getCycle();
    if (!c || !c.lastStart) return null;
    const day = Math.floor((Date.now() - c.lastStart) / 864e5) % (c.length || 28) + 1;
    if (day <= 5) return { phase: "Menstrual", day, tip: "Lower intensity, focus on technique and mobility." };
    if (day <= 13) return { phase: "Follicular", day, tip: "Energy rising, great window for PRs and volume." };
    if (day <= 16) return { phase: "Ovulatory", day, tip: "Peak strength window. Push hard but warm up well." };
    return { phase: "Luteal", day, tip: "Energy may dip. Moderate intensity, prioritize recovery." };
  }
  // ============ V10: NUTRITION ============
  function proteinTarget() {
    const m = getMeasures();
    const last = m.length ? m[m.length - 1] : null;
    const bw = last && last.weight ? last.weight : 70;
    const goal = getSettings().goal || "maintain";
    const mult = goal === "bulk" ? 2.0 : goal === "cut" ? 2.4 : 1.8;
    const kg = getSettings().units === "lb" ? bw * 0.453592 : bw;
    return Math.round(kg * mult);
  }
  function getProtein(dateKey) {
    try { return JSON.parse(localStorage.getItem("forge-protein") || "{}")[dateKey] || 0; }
    catch (e) { return 0; }
  }
  function addProtein(dateKey, g) {
    try {
      const m = JSON.parse(localStorage.getItem("forge-protein") || "{}");
      m[dateKey] = (m[dateKey] || 0) + g;
      localStorage.setItem("forge-protein", JSON.stringify(m));
    } catch (e) {}
  }
  // ============ V10: INSIGHTS ============
  function exerciseHistory(exId, limit) {
    const hist = [];
    getLog().forEach(w => {
      const x = w.exercises.find(e => e.id === exId);
      if (x) {
        const best = Math.max(...x.sets.map(s => s.weight || 0));
        const orm = oneRMFromSets(x.sets);
        hist.push({ date: w.date, ts: w.ts, best, orm });
      }
    });
    return limit ? hist.slice(-limit) : hist;
  }
  function oneRM(exId) {
    const log = getLog();
    let best = 0;
    log.forEach(w => {
      (w.exercises || []).forEach(x => {
        if (x.id === exId) {
          const e = oneRMFromSets(x.sets || []);
          if (e > best) best = e;
        }
      });
    });
    return best;
  }
  function oneRMFromSets(sets) {
    let best = 0;
    sets.forEach(s => {
      if (s.weight > 0 && s.reps > 0) {
        const e = s.weight * (1 + s.reps / 30);
        if (e > best) best = e;
      }
    });
    return best;
  }
  function muscleBalance() {
    const vol = volumeByMuscle(28);
    const push = (vol.chest || 0) + (vol.shoulders || 0) + (vol.triceps || 0);
    const pull = (vol.back || 0) + (vol.lats || 0) + (vol.biceps || 0);
    const quad = vol.quads || 0, ham = vol.hamstrings || 0;
    return {
      push, pull, ratio: pull > 0 ? push / pull : 0,
      quad, ham, legRatio: ham > 0 ? quad / ham : 0
    };
  }
  function dotsFromTotal(totalKg, bwKg) {
    if (!totalKg || !bwKg) return null;
    const x = Math.min(Math.max(bwKg, 40), 200);
    const coef = 0.000001093 * Math.pow(x, 4) - 0.0007391293 * Math.pow(x, 3) + 0.19147565 * Math.pow(x, 2) - 22.41233541 * x + 1143.86505292;
    return Math.round(totalKg * 500 / coef * 10) / 10;
  }
  function renderMeetTool() {
    const bw = latestBodyweightKg();
    const lifts = ["Squat", "Bench", "Deadlift"];
    $("coachTool").innerHTML = `
      <div class="onerm-box">
        <b>Virtual meet simulator</b>
        <p class="muted" style="margin:8px 0">Enter up to 3 attempts per lift (${unitLabel()}). Your heaviest successful attempt counts.</p>
        ${lifts.map((l, li) => `
          <div style="display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap">
            <b style="min-width:80px">${l}</b>
            ${[1, 2, 3].map(a => `<input type="number" min="0" step="any" class="meet-in field-input" data-l="${li}" placeholder="Att ${a}" style="width:90px">`).join("")}
          </div>`).join("")}
        <div style="display:flex;gap:8px;align-items:center;margin:8px 0">
          <b style="min-width:80px">Bodyweight</b>
          <input type="number" min="0" step="any" id="meetBw" value="${bw ? fromKg(bw) : ""}" placeholder="${unitLabel()}" class="field-input" style="width:110px">
        </div>
        <button class="btn btn-primary btn-sm" id="meetCalc" style="margin-top:8px">Calculate total</button>
        <div id="meetResult" style="margin-top:12px"></div>
      </div>`;
    $("meetCalc").addEventListener("click", () => {
      const best = [0, 1, 2].map(li => {
        let m = 0;
        document.querySelectorAll(`.meet-in[data-l="${li}"]`).forEach(i => { m = Math.max(m, parseFloat(i.value) || 0); });
        return toKg(m);
      });
      const bwKg = toKg(parseFloat($("meetBw").value) || 0);
      const total = best[0] + best[1] + best[2];
      if (total <= 0 || bwKg <= 0) {
        $("meetResult").innerHTML = `<p class="muted">Enter at least one attempt and your bodyweight.</p>`;
        return;
      }
      const dots = dotsFromTotal(total, bwKg);
      try {
        const meets = JSON.parse(localStorage.getItem("forge-meets") || "[]");
        meets.push({ date: fmtDate(new Date()), ts: Date.now(), lifts: best, total, bw: bwKg, dots });
        localStorage.setItem("forge-meets", JSON.stringify(meets.slice(-20)));
      } catch (e) {}
      addXP(75);
      $("meetResult").innerHTML = `
        <div class="stat-grid" style="margin:12px 0">
          <div class="stat-card"><b>${fmtW(best[0])}</b><span>squat</span></div>
          <div class="stat-card"><b>${fmtW(best[1])}</b><span>bench</span></div>
          <div class="stat-card"><b>${fmtW(best[2])}</b><span>deadlift</span></div>
          <div class="stat-card"><b>${fmtW(total)}</b><span>total</span></div>
          <div class="stat-card"><b>${dots}</b><span>DOTS</span></div>
        </div>
        <p class="muted" style="font-size:13px">Meet logged. +75 XP earned.</p>`;
    });
  }
  function dotsScore() {
    // DOTS formula (men), simplified polynomial
    const m = getMeasures();
    const last = m.length ? m[m.length - 1] : null;
    if (!last || !last.weight) return null;
    const bw = getSettings().units === "lb" ? last.weight * 0.453592 : last.weight;
    const total = ["squat", "bench", "deadlift"].reduce((a, name) => {
      const ex = EXERCISES.find(e => e.name.toLowerCase().includes(name));
      if (!ex) return a;
      const orm = oneRM(ex.id);
      return a + (orm || 0);
    }, 0);
    if (total <= 0 || bw <= 0) return null;
    const bwKg = bw;
    const x = Math.min(Math.max(bwKg, 40), 200);
    const coef = 0.000001093 * Math.pow(x, 4) - 0.0007391293 * Math.pow(x, 3) + 0.19147565 * Math.pow(x, 2) - 22.41233541 * x + 1143.86505292;
    const totalKg = getSettings().units === "lb" ? total * 0.453592 : total;
    return Math.round(totalKg * 500 / coef * 10) / 10;
  }
  function correlationInsights() {
    const insights = [];
    const log = getLog();
    if (log.length < 5) return insights;
    // sleep vs performance (from check-ins)
    const pairs = [];
    log.forEach(w => {
      const ci = getCheckin(w.date);
      if (ci && ci.sleep) {
        const vol = w.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + s.weight * s.reps, 0), 0);
        pairs.push({ sleep: ci.sleep, vol });
      }
    });
    if (pairs.length >= 5) {
      const high = pairs.filter(p => p.sleep >= 8), low = pairs.filter(p => p.sleep < 7);
      if (high.length >= 2 && low.length >= 2) {
        const avgH = high.reduce((a, p) => a + p.vol, 0) / high.length;
        const avgL = low.reduce((a, p) => a + p.vol, 0) / low.length;
        if (avgH > avgL * 1.1) {
          insights.push(`You lift ${Math.round((avgH / avgL - 1) * 100)}% more volume on 8+ hour sleep nights.`);
        }
      }
    }
    return insights;
  }
  function totalVolumeAll() {
    return getLog().reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0), 0);
  }
  // ============ V10: MOTIVATION ============
  function getXP() {
    try { return JSON.parse(localStorage.getItem("forge-xp") || '{"xp":0,"freeze":1}'); }
    catch (e) { return { xp: 0, freeze: 1 }; }
  }
  function saveXP(d) { try { localStorage.setItem("forge-xp", JSON.stringify(d)); } catch (e) {} }
  function addXP(amount) {
    const d = getXP();
    d.xp += amount;
    saveXP(d);
    return d;
  }
  function xpLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
  // ============ V10: DATA ============
  function exportCSV() {
    const log = getLog();
    let csv = "date,exercise,sets,reps,weight\n";
    log.forEach(w => w.exercises.forEach(x => {
      const ex = byId(x.id);
      x.sets.forEach(s => {
        csv += `${w.date},"${ex ? ex.name : x.id}",${x.sets.length},${s.reps},${s.weight}\n`;
      });
    }));
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "forge-export.csv";
    a.click();
  }
  function backupData() {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("forge-")) data[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `forge-backup-${fmtDate(new Date())}.json`;
    a.click();
  }
  function shareProgramURL(progId) {
    const prog = progById(progId);
    if (!prog) return "";
    const json = JSON.stringify({ n: prog.name, d: prog.days.map(d => ({ n: d.name, e: d.exercises.map(x => [x.id, x.sets, x.reps]) })) });
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return location.origin + location.pathname + "#/shared/" + b64;
  }
  function parseSharedProgram(b64) {
    try {
      const json = decodeURIComponent(escape(atob(b64)));
      const d = JSON.parse(json);
      return { name: d.n, days: d.d.map(x => ({ name: x.n, exercises: x.e.map(e => ({ id: e[0], sets: e[1], reps: e[2] })) })) };
    } catch (e) { return null; }
  }

  // ACHIEVEMENTS
  function streakCalendar(log) {
    const counts = {};
    log.forEach(w => { counts[w.date] = (counts[w.date] || 0) + 1; });
    const today = new Date();
    const weeks = 16, days = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    let html = `<div class="heatmap" role="img" aria-label="Workout activity, last ${weeks} weeks">`;
    let monthIdx = 0;
    for (let w = 0; w < days.length; w += 7) {
      let mLabel = "";
      if (w === 0) mLabel = days[w].toLocaleDateString(undefined, { month: "short" });
      else {
        for (let d = 0; d < 7 && w + d < days.length; d++) {
          if (days[w + d].getDate() === 1) { mLabel = days[w + d].toLocaleDateString(undefined, { month: "short" }); break; }
        }
      }
      if (mLabel) monthIdx++;
      const mo = monthIdx % 2 === 1 ? " mo" : "";
      html += `<span class="hm-month${mo}" aria-hidden="true">${mLabel}</span>`;
      for (let d = 0; d < 7 && w + d < days.length; d++) {
        const dt = days[w + d];
        const key = fmtDate(dt);
        const n = counts[key] || 0;
        const lvl = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4;
        const isToday = key === fmtDate(today);
        const label = dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) + (n ? `: ${n} workout${n > 1 ? "s" : ""}` : ": rest day");
        html += `<div class="hm-day${lvl ? " l" + lvl : ""}${isToday ? " today" : ""}${mo}" title="${label}"></div>`;
      }
    }
    html += `</div>`;
    const legend = `<div class="heatmap-legend"><span>Less</span><div class="hm-day"></div><div class="hm-day l1"></div><div class="hm-day l2"></div><div class="hm-day l3"></div><div class="hm-day l4"></div><span>More</span></div>`;
    return `<div class="heatmap-scroll">${html}</div>${legend}`;
  }
  const BADGES = [
    { id: "first", icon: "target", name: "First workout", desc: "Log your first workout", check: log => log.length >= 1 },
    { id: "ten", icon: "flame", name: "Getting serious", desc: "Log 10 workouts", check: log => log.length >= 10 },
    { id: "fifty", icon: "dumbbell", name: "Committed", desc: "Log 50 workouts", check: log => log.length >= 50 },
    { id: "streak7", icon: "zap", name: "Week streak", desc: "7-day streak", check: (log, streak) => streak >= 7 },
    { id: "streak30", icon: "star", name: "Month streak", desc: "30-day streak", check: (log, streak) => streak >= 30 },
    { id: "vol10k", icon: "dumbbell", name: "Volume king", desc: "10,000 kg in one workout", check: log => log.some(w => w.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + setVolumeKg(x.id, s), 0), 0) >= 10000) },
    { id: "hundred", icon: "trophy", name: "Century", desc: "Log 100 workouts", check: log => log.length >= 100 },
    { id: "dl100", icon: "dumbbell", name: "Triple digits", desc: "Deadlift 100 kg", check: log => log.some(w => w.exercises.some(x => { const ex = byId(x.id); return ex && /deadlift/i.test(ex.name) && x.sets.some(s => (s.weight || 0) >= 100); })) },
    { id: "vol100k", icon: "flame", name: "100-ton club", desc: "100,000 kg lifetime volume", check: log => totalVolumeKg(log) >= 100000 },
    { id: "xp5k", icon: "zap", name: "Rising star", desc: "Earn 5,000 XP", check: () => getXP().xp >= 5000 },
    { id: "earlybird", icon: "star", name: "Consistent", desc: "Train 4 weeks in a row", check: log => weeklyStreak(log) >= 4 },
    { id: "allmuscles", icon: "map", name: "Full body", desc: "Train all 17 muscle groups", check: log => {
      const groups = new Set();
      log.forEach(w => w.exercises.forEach(x => { const ex = byId(x.id); if (ex) groups.add(ex.primary); }));
      return groups.size >= 17;
    }},
  ];
  function getBadges() {
    try { return JSON.parse(localStorage.getItem("forge-badges") || "[]"); }
    catch (e) { return []; }
  }
  function checkBadges() {
    const log = getLog();
    const streak = workoutStreak();
    const earned = getBadges();
    BADGES.forEach(b => {
      if (!earned.includes(b.id) && b.check(log, streak)) {
        earned.push(b.id);
        // toast notification
        const toast = document.createElement("div");
        toast.className = "badge-toast";
        toast.innerHTML = `<span class="toast-icon">${window.FORGE_ICON ? window.FORGE_ICON(b.icon) : ""}</span><div><b>Badge earned!</b><br>${b.name}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 500); }, 4000);
      }
    });
    localStorage.setItem("forge-badges", JSON.stringify(earned));
  }
  function renderYearTab(body) {
    const yr = new Date().getFullYear();
    const ylog = getLog().filter(w => (w.date || "").indexOf(String(yr)) === 0);
    if (!ylog.length) {
      body.innerHTML = `<div class="empty-note"><p><b>No workouts in ${yr} yet.</b></p><p>Your annual review will build itself as you train.</p></div>`;
      return;
    }
    const vol = totalVolumeKg(ylog);
    const sets = ylog.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.length, 0), 0);
    const days = [...new Set(ylog.map(w => w.date))].sort();
    let best = 1, run = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1] + "T12:00:00"), cur = new Date(days[i] + "T12:00:00");
      if ((cur - prev) / 86400000 === 1) { run++; best = Math.max(best, run); } else run = 1;
    }
    const liftBest = {};
    ylog.forEach(w => w.exercises.forEach(x => {
      const e = oneRMFromSets(x.sets || []);
      if (e > (liftBest[x.id] || 0)) liftBest[x.id] = e;
    }));
    const top = Object.keys(liftBest).map(id => ({ id, v: liftBest[id] }))
      .sort((a, b) => b.v - a.v).slice(0, 3);
    const groups = new Set();
    ylog.forEach(w => w.exercises.forEach(x => { const ex = byId(x.id); if (ex) groups.add(ex.primary); }));
    body.innerHTML = `
      <h3>${yr} in review</h3>
      <div class="stat-grid">
        <div class="stat-card"><b>${ylog.length}</b><span>workouts</span></div>
        <div class="stat-card"><b>${fmtW(vol)}</b><span>volume lifted</span></div>
        <div class="stat-card"><b>${sets}</b><span>sets</span></div>
        <div class="stat-card"><b>${days.length}</b><span>active days</span></div>
        <div class="stat-card"><b>${best}</b><span>best streak</span></div>
        <div class="stat-card"><b>${groups.size}</b><span>muscle groups</span></div>
      </div>
      <h3 style="margin-top:20px">Top lifts this year</h3>
      ${top.length ? top.map(({ id, v }) => { const ex = byId(id); return `<div class="rec-row">${window.FORGE_ICON("trophy")}<b>${esc(ex ? ex.name : id)}</b><span>est. 1RM ${fmtW(v)}</span></div>`; }).join("") : `<p class="muted">Log weighted sets to rank your lifts.</p>`}`;
  }
  function renderBoardTab(body) {
    const months = {};
    getLog().forEach(w => {
      const m = (w.date || "").slice(0, 7);
      if (!m) return;
      months[m] = months[m] || { workouts: 0, sets: 0, vol: 0 };
      months[m].workouts++;
      w.exercises.forEach(x => {
        months[m].sets += x.sets.length;
        x.sets.forEach(s => { months[m].vol += setVolumeKg(x.id, s); });
      });
    });
    let xpLog = [];
    try { xpLog = JSON.parse(localStorage.getItem("forge-xp-log") || "[]"); } catch (e) {}
    xpLog.forEach(e => {
      const m = (e.date || "").slice(0, 7);
      if (months[m]) months[m].xp = (months[m].xp || 0) + e.xp;
    });
    const rows = Object.keys(months).map(m => ({ m, ...months[m], xp: months[m].xp || 0 }))
      .sort((a, b) => b.xp - a.xp || b.vol - a.vol);
    if (!rows.length) {
      body.innerHTML = `<div class="empty-note"><p><b>No months ranked yet.</b></p><p>Log workouts to climb your own leaderboard.</p></div>`;
      return;
    }
    const medals = ["🥇", "🥈", "🥉"];
    body.innerHTML = `<h3>Your monthly leaderboard</h3><p class="muted" style="font-size:13px;margin-bottom:12px">Your personal best months, ranked by XP.</p>` +
      rows.map((r, i) => {
        const d = new Date(r.m + "-15T12:00:00");
        const label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
        return `<div class="rec-row"><span style="font-size:20px">${medals[i] || (i + 1) + "."}</span><b>${label}</b><span>${r.workouts} workouts · ${fmtW(r.vol)} · ${r.xp} XP</span></div>`;
      }).join("");
  }
  function renderBadgesTab(body) {
    const earned = getBadges();
    body.innerHTML = `<h3>Achievements</h3><div class="badge-grid">` +
      BADGES.map(b => `
        <div class="badge-card ${earned.includes(b.id) ? "earned" : "locked"}">
          <div class="badge-icon">${window.FORGE_ICON ? window.FORGE_ICON(earned.includes(b.id) ? b.icon : "lock") : ""}</div>
          <b>${b.name}</b><span>${b.desc}</span>
        </div>`).join("") + `</div>`;
  }

  // BODY MEASUREMENTS
  function getMeasures() {
    try { return JSON.parse(localStorage.getItem("forge-measures") || "[]"); }
    catch (e) { return []; }
  }
  function saveMeasures(m) { localStorage.setItem("forge-measures", JSON.stringify(m)); }
  let _calYear = null, _calMonth = null;
  function renderCalendarTab(body) {
    const now = new Date();
    if (_calYear == null) { _calYear = now.getFullYear(); _calMonth = now.getMonth(); }
    const yr = _calYear, mo = _calMonth;
    const counts = {};
    getLog().forEach(w => { counts[w.date] = (counts[w.date] || 0) + 1; });
    const title = new Date(yr, mo, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const first = (new Date(yr, mo, 1).getDay() + 6) % 7; // Monday-first offset
    const dim = new Date(yr, mo + 1, 0).getDate();
    const todayKey = fmtDate(now);
    let cells = "";
    for (let i = 0; i < first; i++) cells += `<div class="cal-blank"></div>`;
    for (let d = 1; d <= dim; d++) {
      const key = yr + "-" + String(mo + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      const n = counts[key] || 0;
      const lvl = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4;
      const isToday = key === todayKey, isFuture = key > todayKey;
      const tip = n ? n + " workout" + (n > 1 ? "s" : "") : "Rest day";
      cells += `<div class="cal-day${lvl ? " l" + lvl : ""}${isToday ? " today" : ""}${isFuture ? " future" : ""}${n ? "" : " rest"}" data-calday="${key}" title="${tip}">${d}</div>`;
    }
    body.innerHTML = `
      <div class="cal-view">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <button class="btn btn-ghost btn-sm" id="calPrev" aria-label="Previous month">&lt;</button>
          <h3 style="margin:0">${esc(title)}</h3>
          <button class="btn btn-ghost btn-sm" id="calNext" aria-label="Next month">&gt;</button>
        </div>
        <div class="cal-grid">
          ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(w => `<div class="cal-wd">${w}</div>`).join("")}
          ${cells}
        </div>
        <div id="calDetail"></div>
      </div>`;
    $("calPrev").addEventListener("click", () => {
      _calMonth--; if (_calMonth < 0) { _calMonth = 11; _calYear--; }
      renderCalendarTab(body);
    });
    $("calNext").addEventListener("click", () => {
      _calMonth++; if (_calMonth > 11) { _calMonth = 0; _calYear++; }
      renderCalendarTab(body);
    });
    body.querySelectorAll("[data-calday]").forEach(el => el.addEventListener("click", () => {
      body.querySelectorAll("[data-calday]").forEach(c => c.classList.remove("sel"));
      el.classList.add("sel");
      renderCalDetail($("calDetail"), el.dataset.calday);
    }));
  }
  function renderCalDetail(el, key) {
    if (!el) return;
    const ws = getLog().filter(w => w.date === key);
    const dstr = new Date(key + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    if (!ws.length) {
      el.innerHTML = `<h3 style="margin-top:20px">${esc(dstr)}</h3><div class="empty-note"><p><b>Rest day.</b></p><p>No workouts logged.</p></div>`;
      return;
    }
    const sets = ws.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.length, 0), 0);
    const vol = ws.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + setVolumeKg(x.id, s), 0), 0), 0);
    const detail = ws.map(w => `<div class="cal-wo"><p class="cal-wo-title"><b>${esc(w.programName)}</b>${w.dayName ? `<span class="muted"> · ${esc(w.dayName)}</span>` : ""}</p>` +
      w.exercises.map(x => {
        const ex = byId(x.id);
        const setStr = x.sets.map(s => `${s.reps}${s.weight ? " × " + fmtW(s.weight) : ""}${s.rpe != null ? " @ RPE " + s.rpe : ""}${s.failed ? " (failed)" : ""}`).join(", ");
        return `<p class="cal-ex"><span class="cal-ex-name">${esc(ex ? ex.name : x.id)}</span><span class="muted"> · ${setStr}</span></p>`;
      }).join("") + `</div>`).join("");
    el.innerHTML = `<h3 style="margin-top:20px">${esc(dstr)}</h3><p class="muted">${ws.length} workout${ws.length > 1 ? "s" : ""} · ${sets} sets · ${fmtW(vol)} volume</p>${detail}`;
  }
  function renderBodyTab(body) {
    const measures = getMeasures();
    const units = getSettings().units;
    body.innerHTML = `
      <h3>Body measurements</h3>
      <div class="measure-grid">
        <div class="builder-field"><label>Weight (${units})</label><input type="number" id="mWeight" class="text-input" step="any" placeholder="–" /></div>
        <div class="builder-field"><label>Waist (${units === "kg" ? "cm" : "in"})</label><input type="number" id="mWaist" class="text-input" step="any" placeholder="–" /></div>
        <div class="builder-field"><label>Chest (${units === "kg" ? "cm" : "in"})</label><input type="number" id="mChest" class="text-input" step="any" placeholder="–" /></div>
        <div class="builder-field"><label>Arms (${units === "kg" ? "cm" : "in"})</label><input type="number" id="mArms" class="text-input" step="any" placeholder="–" /></div>
      </div>
      <button class="btn btn-primary btn-sm" id="mSave" style="margin-bottom:14px">Log measurements</button>
      <div id="mChart"></div>
      <h3 style="margin-top:24px">Progress photos</h3>
      <div style="display:flex;align-items:center;gap:12px;margin:12px 0;flex-wrap:wrap">
        <label class="btn btn-ghost btn-sm" style="cursor:pointer;margin:0">
          Choose file
          <input type="file" id="photoInput" accept="image/*" style="display:none" />
        </label>
        <span class="muted" id="photoFileName" style="font-size:14px">No file chosen</span>
      </div>
      <div class="photo-grid" id="photoGrid"></div>`;
    renderMeasureChart();
    renderPhotos();
    $("mSave").addEventListener("click", () => {
      const entry = { date: fmtDate(new Date()), ts: Date.now() };
      const w = parseFloat($("mWeight").value), wa = parseFloat($("mWaist").value);
      const c = parseFloat($("mChest").value), a = parseFloat($("mArms").value);
      if (w) entry.weight = w; if (wa) entry.waist = wa; if (c) entry.chest = c; if (a) entry.arms = a;
      if (!entry.weight && !entry.waist && !entry.chest && !entry.arms) { appAlert("Enter at least one measurement."); return; }
      const all = getMeasures(); all.push(entry); saveMeasures(all);
      renderBodyTab(body);
    });
    $("photoInput").addEventListener("change", (e) => {
      const fn = e.target.files[0] ? e.target.files[0].name : "No file chosen";
      const label = $("photoFileName");
      if (label) label.textContent = fn;
      handlePhotoUpload(e);
    });
  }
  function attachChartTip(canvas, pts, fmt) {
    const par = canvas.parentElement;
    par.style.position = "relative";
    const oldT = par.querySelector(".chart-tip");
    if (oldT) oldT.remove();
    const tip = document.createElement("div");
    tip.className = "chart-tip"; tip.style.display = "none";
    par.appendChild(tip);
    canvas.style.cursor = "pointer";
    function showAt(cx, cy) {
      const r = canvas.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      let best = null, bd = 1e9;
      pts.forEach(p => { const d = Math.hypot(p.x - px, p.y - py); if (d < bd) { bd = d; best = p; } });
      if (best && bd < 32) {
        tip.textContent = fmt(best);
        tip.style.left = best.x + "px"; tip.style.top = best.y + "px";
        tip.style.display = "block";
      } else tip.style.display = "none";
    }
    canvas.addEventListener("pointerdown", e => showAt(e.clientX, e.clientY));
    canvas.addEventListener("pointermove", e => { if (e.pointerType === "mouse") showAt(e.clientX, e.clientY); });
    canvas.addEventListener("pointerleave", () => { tip.style.display = "none"; });
  }
  let mChartSpan = 0;
  function renderMeasureChart() {
    const measures = getMeasures().filter(m => m.weight);
    if (measures.length < 2) {
      $("mChart").innerHTML = `<p class="muted">Log weight twice to see a trend.</p>`;
      return;
    }
    const accent = currentAccent().color;
    const unit = unitLabel();
    if (mChartSpan > 0 && measures.length > mChartSpan) measures = measures.slice(-mChartSpan);
    const vals = measures.map(m => toKg(m.weight));
    const min = Math.min(...vals), max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.25, 0.5);
    const lo = min - pad, hi = max + pad, range = hi - lo || 1;
    const change = vals[vals.length - 1] - vals[0];
    const changeTxt = (change > 0 ? "+" : "") + fromKg(change).toFixed(1) + " " + unit;
    const changeColor = change > 0.05 ? "var(--warn)" : change < -0.05 ? accent : "var(--muted)";
    $("mChart").innerHTML = `<div class="chart-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <h4 style="margin:0">Weight trend</h4>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn btn-ghost btn-sm" data-mspan="10" >10</button>
          <button class="btn btn-ghost btn-sm" data-mspan="30" >30</button>
          <button class="btn btn-ghost btn-sm" data-mspan="0" >All</button>
        </div>
        <span style="font-size:13px;color:${changeColor};font-weight:700">${changeTxt} total</span>
      </div>
    </div>`;
    const wrap = $("mChart").querySelector(".chart-wrap");
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    const dpr = window.devicePixelRatio || 1;
    const cw = wrap.clientWidth - 32, ch = 210;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    canvas.style.width = cw + "px"; canvas.style.height = ch + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const padL = 44, padR = 12, padT = 12, padB = 26;
    const iw = cw - padL - padR, ih = ch - padT - padB;
    const X = i => padL + (i / (vals.length - 1)) * iw;
    const Y = v => padT + (1 - (v - lo) / range) * ih;
    // gridlines + y labels
    ctx.font = "11px sans-serif"; ctx.textAlign = "right";
    for (let g = 0; g <= 3; g++) {
      const gv = lo + (range * g) / 3, gy = Y(gv);
      ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(cw - padR, gy); ctx.stroke();
      ctx.fillStyle = "#8a93a6";
      ctx.fillText(fromKg(gv).toFixed(1), padL - 8, gy + 4);
    }
    // area fill
    const grad = ctx.createLinearGradient(0, padT, 0, ch - padB);
    grad.addColorStop(0, accent + "55"); grad.addColorStop(1, accent + "00");
    ctx.beginPath();
    vals.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(0), Y(v)); });
    ctx.lineTo(X(vals.length - 1), ch - padB); ctx.lineTo(X(0), ch - padB); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // line
    ctx.beginPath();
    vals.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(0), Y(v)); });
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.stroke();
    // dots
    vals.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(X(i), Y(v), i === 0 || i === vals.length - 1 ? 4.5 : 3, 0, 7);
      ctx.fillStyle = "#0b0d12"; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = accent; ctx.stroke();
    });
    // date labels (edge labels pushed inward so they don't clip)
    ctx.fillStyle = "#8a93a6";
    const fmtD = dstr => { try { return new Date(dstr + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return ""; } };
    const idx = [0, Math.floor((vals.length - 1) / 2), vals.length - 1].filter((v, i, a) => a.indexOf(v) === i);
    idx.forEach(i => {
      ctx.textAlign = i === 0 ? "left" : i === vals.length - 1 ? "right" : "center";
      ctx.fillText(fmtD(measures[i].date), X(i), ch - 8);
    });
    attachChartTip(canvas, vals.map((v, i) => ({ x: X(i), y: Y(v), i })), p =>
      `${fmtD(measures[p.i].date)}: ${fromKg(vals[p.i]).toFixed(1)} ${unitLabel()}`);
  }
  document.addEventListener("click", e => {
    const zb = e.target.closest("[data-mspan]");
    if (zb) { mChartSpan = parseInt(zb.dataset.mspan, 10) || 0; renderMeasureChart(); }
  });
  function getPhotos() {
    try { return JSON.parse(localStorage.getItem("forge-photos") || "[]"); }
    catch (e) { return []; }
  }
  function savePhotos(p) { localStorage.setItem("forge-photos", JSON.stringify(p)); }
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 800;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (dataUrl.length > 1500000) { appAlert("Photo too large, try a smaller one."); return; }
        const photos = getPhotos();
        photos.push({ date: fmtDate(new Date()), ts: Date.now(), src: dataUrl });
        savePhotos(photos);
        renderPhotos();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
  let compareSel = [];
  function renderPhotos() {
    const photos = getPhotos().sort((a, b) => a.ts - b.ts);
    const grid = $("photoGrid");
    if (!grid) return;
    grid.innerHTML = (photos.length >= 2 ? `<p class="muted" style="grid-column:1/-1;font-size:13px">Tap two photos to compare them side by side.</p>` : "") + photos.map((p, i) => `
      <div class="photo-item ${compareSel.includes(i) ? "cmp-sel" : ""}" data-pcmp="${i}">
        <img src="${p.src}" alt="Progress photo ${p.date}" />
        <div class="photo-date">${p.date}</div>
        <button class="photo-del" data-pdel="${i}" aria-label="Delete photo">×</button>
      </div>`).join("") || `<div class="empty-note" style="grid-column:1/-1"><p><b>No photos yet.</b></p><p>Take a progress photo to start tracking.</p></div>`;
    grid.querySelectorAll("[data-pdel]").forEach(b => {
      b.addEventListener("click", ev => {
        ev.stopPropagation();
        const all = getPhotos(); all.splice(parseInt(b.dataset.pdel, 10), 1); savePhotos(all); compareSel = []; renderPhotos();
      });
    });
    grid.querySelectorAll("[data-pcmp]").forEach(el => {
      el.addEventListener("click", () => {
        const i = parseInt(el.dataset.pcmp, 10);
        if (compareSel.includes(i)) compareSel = compareSel.filter(x => x !== i);
        else { compareSel.push(i); if (compareSel.length > 2) compareSel.shift(); }
        if (compareSel.length === 2) openCompare(photos[compareSel[0]], photos[compareSel[1]]);
        renderPhotos();
      });
    });
  }
  function openCompare(a, b) {
    compareSel = [];
    const veil = document.createElement("div");
    veil.className = "modal-veil";
    veil.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="max-width:640px">
      <div class="modal-head" style="flex-direction:column;align-items:stretch;gap:10px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h3 style="margin:0">Compare photos</h3>
          <button class="modal-x" aria-label="Close"></button>
        </div>
        <div class="seg-ctrl" role="tablist" style="align-self:center">
          <button class="seg-btn active" data-cmode="side">Side by side</button>
          <button class="seg-btn" data-cmode="slider">Slider</button>
        </div>
      </div>
      <div class="modal-body">
        <div class="cmp-side" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><img src="${a.src}" style="width:100%;border-radius:12px" alt="Photo ${a.date}" /><p class="muted" style="text-align:center;margin-top:6px">${a.date}</p></div>
          <div><img src="${b.src}" style="width:100%;border-radius:12px" alt="Photo ${b.date}" /><p class="muted" style="text-align:center;margin-top:6px">${b.date}</p></div>
        </div>
        <div class="cmp-slider-wrap hidden">
          <div class="cmp-slider" id="cmpSlider">
            <img class="cmp-img-base" src="${b.src}" alt="Photo ${b.date}" />
            <img class="cmp-img-top" src="${a.src}" alt="Photo ${a.date}" />
            <div class="cmp-handle"><div class="cmp-grip"></div></div>
            <span class="cmp-label cmp-label-a">${a.date}</span>
            <span class="cmp-label cmp-label-b">${b.date}</span>
          </div>
          <p class="muted" style="text-align:center;font-size:12px;margin-top:8px">Drag the handle to compare</p>
        </div>
      </div>
    </div>`;
    veil.querySelector(".modal-x").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    veil.addEventListener("click", e => { if (e.target === veil || e.target.closest(".modal-x")) veil.remove(); });
    // mode toggle
    veil.querySelectorAll("[data-cmode]").forEach(btn => {
      btn.addEventListener("click", () => {
        veil.querySelectorAll("[data-cmode]").forEach(b => b.classList.toggle("active", b === btn));
        const slider = btn.dataset.cmode === "slider";
        veil.querySelector(".cmp-side").classList.toggle("hidden", slider);
        veil.querySelector(".cmp-slider-wrap").classList.toggle("hidden", !slider);
      });
    });
    // slider drag logic: clip-path keeps both images full-size and aligned
    const sliderEl = veil.querySelector("#cmpSlider");
    const top = veil.querySelector(".cmp-img-top");
    const handle = veil.querySelector(".cmp-handle");
    let dragging = false;
    const setPos = clientX => {
      const r = sliderEl.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      top.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + "%";
    };
    handle.addEventListener("pointerdown", e => { dragging = true; handle.setPointerCapture(e.pointerId); });
    handle.addEventListener("pointermove", e => { if (dragging) setPos(e.clientX); });
    handle.addEventListener("pointerup", () => dragging = false);
    handle.addEventListener("pointercancel", () => dragging = false);
    sliderEl.addEventListener("pointerdown", e => { if (e.target !== handle && !handle.contains(e.target)) setPos(e.clientX); });
    // init at 50%
    requestAnimationFrame(() => { top.style.clipPath = "inset(0 50% 0 0)"; handle.style.left = "50%"; });
    document.body.appendChild(veil);
  }

  const STD_LIFTS = [
    { id: "barbell-back-squat", name: "Squat", ratios: [0.75, 1.0, 1.5, 2.0, 2.5] },
    { id: "barbell-bench-press", name: "Bench", ratios: [0.5, 0.75, 1.0, 1.5, 1.75] },
    { id: "barbell-deadlift", name: "Deadlift", ratios: [1.0, 1.25, 1.75, 2.25, 2.75] },
    { id: "barbell-overhead-press", name: "Overhead press", ratios: [0.35, 0.5, 0.75, 1.0, 1.25] },
  ];
  const STD_LEVELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
  function epley1RM(weight, reps) { return weight * (1 + Math.max(0, reps) / 30); }
  function renderStandards() {
    const measures = getMeasures();
    const bw = measures.length && measures[measures.length - 1].weight ? toKg(measures[measures.length - 1].weight) : 0;
    if (!bw) return `<div class="empty-note"><p><b>Log your bodyweight first.</b></p><p>Standards compare your estimated 1RM against bodyweight ratios. Add a weight in Progress > Body.</p></div>`;
    const rows = STD_LIFTS.map(lift => {
      let ex = byId(lift.id) || EXERCISES.find(e => e.name.toLowerCase().includes(lift.name.toLowerCase().split(" ")[0]));
      const pr = ex ? exercisePR(ex.id) : null;
      const est = pr && pr.weight > 0 ? epley1RM(pr.weight, pr.reps) : 0;
      const ratio = est / bw;
      let level = 0;
      lift.ratios.forEach((r, i) => { if (ratio >= r) level = i + 1; });
      const lvlName = level === 0 ? "Untrained" : STD_LEVELS[level - 1];
      const nextR = level < 5 ? lift.ratios[level] : null;
      const nextW = nextR ? (nextR * bw).toFixed(1) : null;
      return `<div class="rec-row" style="flex-direction:column;align-items:stretch;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b>${lift.name}</b><span>${est ? fmtW(est) + " est. 1RM" : "No data"}</span>
        </div>
        <div style="display:flex;gap:4px">${STD_LEVELS.map((_, i) =>
          `<div style="flex:1;height:8px;border-radius:4px;background:${i < level ? "var(--volt)" : "var(--surface2)"}"></div>`).join("")}</div>
        <div class="muted" style="font-size:13px">${lvlName}${nextW ? " - next: " + fmtW(parseFloat(nextW)) + " (" + STD_LEVELS[level] + ")" : " - top level"}</div>
      </div>`;
    }).join("");
    return `<p class="muted" style="margin-bottom:14px">Estimated 1RM vs bodyweight (${fmtW(bw)}). Based on Epley formula from your best logged set.</p>` + rows;
  }
  function renderProgress(tab) {
    tab = tab || localStorage.getItem("forge-progress-tab") || "overview";
    try { localStorage.setItem("forge-progress-tab", tab); } catch (e) {}
    document.querySelectorAll("#progTabs .chip").forEach(c => {
      const on = c.dataset.ptab === tab;
      c.classList.toggle("on", on);
      if (on) c.scrollIntoView({ block: "nearest", inline: "center" });
    });
    const log = getLog();
    const body = $("progressBody");
    const paint = () => {
    if (tab === "body") { renderBodyTab(body); return; }
    if (tab === "badges") { renderBadgesTab(body); return; }
    if (tab === "year") { renderYearTab(body); return; }
    if (tab === "board") { renderBoardTab(body); return; }
    if (tab === "challenges") { renderChallengesTab(body); return; }
    if (tab === "insights") { renderInsightsTab(body); return; }
    if (tab === "coach") { renderCoachTab(body); return; }
    if (tab === "calendar") { renderCalendarTab(body); return; }
    paintOverview(body, log);
    };
    paint();
    return;
    function paintOverview(body, log) {
    if (!log.length) {
      body.innerHTML = `<div class="empty-note"><p><b>No workouts logged yet.</b></p><p>Finish a workout and it will show up here with your history, records and volume.</p></div>`;
      return;
    }
    if (tab === "overview") {
      const totalSets = log.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.length, 0), 0);
      const totalVol = totalVolumeKg(log);
      body.innerHTML = `<div class="stat-grid">
        <div class="stat-card"><b data-cu="${log.length}">0</b><span>workouts logged</span></div>
        <div class="stat-card"><b data-cu="${workoutStreak()}">0</b><span>day streak</span></div>
        <div class="stat-card"><b data-cu="${totalSets}">0</b><span>total sets</span></div>
        <div class="stat-card"><b data-cu="${totalVol}" data-cufmt="w">0</b><span>total volume</span></div>
        <div class="stat-card"><b data-cu="${recoveryScore()}" data-cufmt="pct">0</b><span>recovery</span></div>
        <div class="stat-card"><b>${xpLevel(getXP().xp)}</b><span>level (${getXP().xp.toLocaleString()} XP)</span></div>
        <div class="stat-card"><b>${getXP().freeze || 0}</b><span>streak freeze${(getXP().freeze || 0) === 1 ? "" : "s"}</span></div>
      </div>
      ${checkDeload() ? `<div class="onerm-box warn"><b>${window.FORGE_ICON ? window.FORGE_ICON("triangle-alert") : ""} Deload suggested:</b> <span class="muted">Volume dropping, consider a light week.</span></div>` : ""}
      <h3 style="margin-top:20px">Last 16 weeks</h3>
      ${streakCalendar(log)}
      <p class="muted">Volume = weight × reps across every logged set (bodyweight included for bodyweight moves).</p>`;
      body.querySelectorAll("[data-cu]").forEach(b => {
        const v = parseFloat(b.dataset.cu), f = b.dataset.cufmt;
        countUp(b, v, f === "w" ? (x => fmtW(x)) : f === "pct" ? (x => Math.round(x) + "%") : undefined);
      });
    } else if (tab === "history") {
      const byDate = {};
      log.forEach(w => { (byDate[w.date] = byDate[w.date] || []).push(w); });
      const TYPE_NAMES = { std: "Standard", drop: "Drop set", rp: "Rest-pause", cluster: "Cluster", myo: "Myo-rep" };
      body.innerHTML = Object.keys(byDate).sort().reverse().map((dt, di) => {
        const ws = byDate[dt];
        const sets = ws.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.length, 0), 0);
        const dstr = new Date(dt + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        const detail = ws.map(w => `<p style="margin:8px 0 4px"><b>${esc(w.programName)}: ${esc(w.dayName)}</b></p><ul style="margin:0 0 8px">` +
          w.exercises.map(x => {
            const ex = byId(x.id);
            return `<li>${esc(ex ? ex.name : x.id)}<ul class="muted" style="font-size:13px">` +
              x.sets.map(s => `<li>${s.reps} reps${s.weight ? " @ " + fmtW(s.weight) : ""}${s.added ? " +" + fmtW(s.added) : ""}${s.rpe ? " · RPE " + s.rpe : ""}${s.failed ? " · <b style='color:#f87171'>failed</b>" : ""}${s.type && s.type !== "std" ? " · " + (TYPE_NAMES[s.type] || s.type) : ""}</li>`).join("") +
              `</ul></li>`;
          }).join("") + `</ul>` +
          (w.notes ? `<p class="muted" style="font-style:italic;margin:8px 0">Note: ${esc(w.notes)}</p>` : "")).join("");
        return `<div class="hist-day"><div class="hd hist-toggle" data-hd="${di}" style="cursor:pointer"><b>${dstr}</b><span class="muted">${sets} sets · Tap for detail</span></div><div class="hist-detail hidden" id="hist-${di}">${detail}</div></div>`;
      }).join("");
      body.querySelectorAll(".hist-toggle").forEach(tg => tg.addEventListener("click", () => {
        const el = $("hist-" + tg.dataset.hd); if (el) el.classList.toggle("hidden");
      }));
    } else if (tab === "standards") {
      body.innerHTML = renderStandards();
    } else if (tab === "records") {
      const recs = [];
      EXERCISES.forEach(ex => {
        const pr = exercisePR(ex.id);
        if (pr && (pr.weight > 0 || pr.reps > 0)) recs.push({ ex, pr });
      });
      recs.sort((a, b) => b.pr.weight - a.pr.weight || b.pr.reps - a.pr.reps);
      body.innerHTML = recs.length ? recs.map(({ ex, pr }) =>
        `<div class="rec-row">${window.FORGE_ICON("trophy")}<b>${esc(ex.name)}</b><span>${pr.weight > 0 ? fmtW(pr.weight) + " × " + pr.reps : pr.reps + " reps"}</span></div>`
      ).join("") : `<div class="empty-note"><p><b>No records yet.</b></p><p>Log a workout to set your first.</p></div>`;
    } else {
      const vol = volumeByMuscle(28);
      const entries = Object.keys(vol).map(g => ({ g, n: vol[g] })).sort((a, b) => b.n - a.n);
      const max = entries.length ? entries[0].n : 1;
      body.innerHTML = entries.length
        ? `<p class="muted" style="margin-bottom:14px">Sets per muscle group, last 28 days.</p>` +
          entries.map(({ g, n }) => `<div class="vol-row"><span class="vn">${MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g}</span><span class="bar"><i style="width:${Math.round(n / max * 100)}%"></i></span><span class="vc">${n} sets</span></div>`).join("")
        : `<div class="empty-note"><p><b>Nothing in the last 28 days.</b></p><p>Log a workout and your volume will show up here.</p></div>`;
    }
  }
  }

  // PROGRAMS
  const EXPRESS_POOL = [
    { id: "goblet-squat", sets: 3, reps: "10" }, { id: "push-up", sets: 3, reps: "12" },
    { id: "dumbbell-romanian-deadlift", sets: 3, reps: "10" }, { id: "chest-supported-dumbbell-row", sets: 3, reps: "10" },
    { id: "overhead-press", sets: 2, reps: "10" }, { id: "glute-bridge", sets: 2, reps: "15" },
    { id: "plank", sets: 2, reps: "45s" }, { id: "standing-calf-raise", sets: 2, reps: "15" }
  ];
  // PYRAMID SET BUILDER
  function openPyramid(exId) {
    const ex = byId(exId);
    if (!ex) return;
    const isBW = ex.equipment === "bodyweight";
    const lwKg = lastWeightKg(ex.id);
    const defTop = lwKg ? fromKg(lwKg) : "";
    const defBot = lwKg ? Math.round(fromKg(lwKg) * 0.6 * 2) / 2 : "";
    const old = document.querySelector(".pyr-veil");
    if (old) old.remove();
    const veil = document.createElement("div");
    veil.className = "modal-veil pyr-veil";
    veil.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="max-width:430px">
      <div class="modal-head"><h3>Pyramid: ${esc(ex.name)}</h3><button class="modal-x" aria-label="Close"></button></div>
      <div class="modal-body">
        <p class="muted" style="font-size:13px;margin:0 0 12px">Weights ramp linearly between top and bottom${isBW ? " (added weight)" : ""}.</p>
        <div class="field-group">
          <label class="field-label">Top weight (${unitLabel()})<input class="text-input" id="pyrTop" type="number" min="0" step="any" value="${defTop}" placeholder="e.g. 40"></label>
          <label class="field-label">Bottom weight (${unitLabel()})<input class="text-input" id="pyrBot" type="number" min="0" step="any" value="${defBot}" placeholder="e.g. 25"></label>
          <label class="field-label">Steps (3-6)<input class="text-input" id="pyrSteps" type="number" min="3" max="6" value="4"></label>
          <label class="field-label">Reps per step<input class="text-input" id="pyrReps" type="number" min="1" value="8"></label>
          <label class="field-label">Direction
            <select class="text-input" id="pyrDir">
              <option value="desc">Descending (heavy to light)</option>
              <option value="asc">Ascending (light to heavy)</option>
            </select>
          </label>
        </div>
        <button class="btn btn-ghost btn-sm" id="pyrPreviewBtn">Preview</button>
        <div id="pyrOut" style="margin-top:12px"></div>
        <button class="btn btn-primary" id="pyrStart" style="margin-top:12px;width:100%">Start workout with these sets</button>
      </div>
    </div>`;
    veil.querySelector(".modal-x").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    const close = () => veil.remove();
    veil.addEventListener("click", e => { if (e.target === veil || e.target.closest(".modal-x")) close(); });
    document.body.appendChild(veil);
    const topEl = veil.querySelector("#pyrTop"), botEl = veil.querySelector("#pyrBot"),
          stepsEl = veil.querySelector("#pyrSteps"), repsEl = veil.querySelector("#pyrReps"),
          dirEl = veil.querySelector("#pyrDir"), outEl = veil.querySelector("#pyrOut");
    function buildPlan() {
      const top = parseFloat(topEl.value), bot = parseFloat(botEl.value);
      let steps = Math.round(parseFloat(stepsEl.value) || 4);
      steps = Math.min(6, Math.max(3, steps));
      stepsEl.value = steps;
      const reps = Math.max(1, Math.round(parseFloat(repsEl.value) || 8));
      if (!(top > 0) || !(bot > 0)) {
        outEl.innerHTML = `<p class="muted" style="font-size:13px">Enter top and bottom weights to preview the pyramid.</p>`;
        return null;
      }
      const hi = Math.max(top, bot), lo = Math.min(top, bot), dir = dirEl.value;
      const wUser = [];
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const raw = dir === "desc" ? hi - (hi - lo) * t : lo + (hi - lo) * t;
        wUser.push(Math.round(raw * 2) / 2);
      }
      const weightsKg = wUser.map(toKg);
      outEl.innerHTML = `<table style="width:100%;font-size:13px;border-collapse:collapse">
        <tr style="color:var(--muted);text-align:left"><th style="padding:6px 4px">Step</th><th style="padding:6px 4px">Weight</th><th style="padding:6px 4px">Reps</th></tr>` +
        wUser.map((w, i) => `<tr style="border-top:1px solid var(--line)"><td style="padding:6px 4px">${i + 1}</td><td style="padding:6px 4px">${fmtW(weightsKg[i])}</td><td style="padding:6px 4px">${reps}</td></tr>`).join("") +
        `</table>`;
      return { steps, reps, weightsKg, repsArr: Array(steps).fill(reps) };
    }
    veil.querySelector("#pyrPreviewBtn").addEventListener("click", buildPlan);
    [topEl, botEl, stepsEl, repsEl, dirEl].forEach(el => el.addEventListener("input", buildPlan));
    buildPlan();
    veil.querySelector("#pyrStart").addEventListener("click", () => {
      const plan = buildPlan();
      if (!plan) { appAlert("Enter valid top and bottom weights first."); return; }
      const prog = { id: "pyramid-" + Date.now().toString(36), name: ex.name + " Pyramid", tagline: "Pyramid session",
        custom: true, level: "custom", daysPerWeek: 1, weeks: 1, equipment: ex.equipment || "Mixed",
        days: [{ name: "Pyramid session", exercises: [{ id: ex.id, sets: plan.steps, reps: String(plan.reps), repsArr: plan.repsArr, weightsArr: plan.weightsKg }] }] };
      const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
      close();
      location.hash = "#/workout/" + prog.id + "/0";
    });
  }
  function startExpress() {
    const picks = [];
    const groups = new Set();
    for (const e of EXPRESS_POOL) {
      const ex = byId(e.id);
      if (!ex || picks.some(p => p.id === e.id)) continue;
      if (groups.has(ex.primary) && picks.length >= 5) continue;
      groups.add(ex.primary);
      picks.push({ id: e.id, sets: e.sets, reps: e.reps });
      if (picks.length >= 6) break;
    }
    const prog = { id: "express-" + Date.now().toString(36), name: "20-Minute Express", tagline: "Full-body condensed session",
      custom: true, level: "custom", daysPerWeek: 1, weeks: 1, equipment: "Mixed", express: true,
      days: [{ name: "Express session", exercises: picks }] };
    const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
    location.hash = "#/workout/" + prog.id + "/0";
  }
  // Travel mode: swap exercises to minimal-equipment alternatives
  const TRAVEL_EQ = ["bodyweight", "dumbbell", "band"];
  function travelSub(exId) {
    const ex = byId(exId);
    if (!ex || TRAVEL_EQ.includes(ex.equipment)) return null;
    const cands = EXERCISES.filter(e => e.id !== exId && e.primary === ex.primary && TRAVEL_EQ.includes(e.equipment));
    if (!cands.length) return null;
    cands.sort((a, b) => (a.level === "beginner" ? 0 : 1) - (b.level === "beginner" ? 0 : 1));
    return cands[0];
  }
  const DUNGEON_TITLES = ["Goblin ambush", "Skeleton crypt", "Dragon's lair", "Orc war camp", "Dark dungeon", "Troll bridge"];
  function startDungeon() {
    const groups = [...new Set(EXERCISES.map(e => e.primary))];
    for (let i = groups.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[groups[i], groups[j]] = [groups[j], groups[i]]; }
    const picks = [];
    for (const g of groups) {
      if (picks.length >= 5) break;
      const cands = EXERCISES.filter(e => e.primary === g);
      if (!cands.length) continue;
      const ex = cands[Math.floor(Math.random() * cands.length)];
      picks.push({ id: ex.id, sets: 3, reps: "8-12" });
    }
    const title = DUNGEON_TITLES[Math.floor(Math.random() * DUNGEON_TITLES.length)];
    const prog = { id: "dungeon-" + Date.now().toString(36), name: "Dungeon: " + title, tagline: "Random encounter. Finish it for +100 bonus XP.",
      custom: true, level: "custom", daysPerWeek: 1, weeks: 1, equipment: "Mixed", dungeon: true,
      days: [{ name: "The encounter", exercises: picks }] };
    const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
    location.hash = "#/workout/" + prog.id + "/0";
  }
  function renderPrograms() {
    const activeId = getActiveProg();
    const active = activeId && progById(activeId);
    if (active) {
      const ni = nextDayIdx(active);
      $("activeBanner").classList.remove("hidden");
      $("activeBanner").innerHTML =
        `<div><b>Active program: ${esc(active.name)}</b><br><span class="muted">Up next: ${esc(active.days[ni].name)}</span></div>
         <div style="display:flex;gap:8px">
           <a class="btn btn-primary btn-sm" href="#/workout/${active.id}/${ni}">Continue</a>
           <a class="btn btn-ghost btn-sm" href="#/program/${active.id}">View</a>
         </div>`;
    } else {
      $("activeBanner").classList.add("hidden");
      $("activeBanner").innerHTML = "";
    }
    $("programGrid").innerHTML = allPrograms().map(p => {
      const n = p.days.reduce((a, d) => a + d.exercises.length, 0);
      const isActive = activeId === p.id;
      const pIcon = { "full-body-starter": "dumbbell", "push-pull-legs": "arrow-right", "upper-lower": "calendar", "strength-5x5": "trophy", "dumbbell-home": "flame", "hiit-conditioning": "zap" }[p.id] || (p.custom ? "plus" : "dumbbell");
      return `<div class="prog-card" data-prog="${p.id}">
        <div class="prog-top"><span class="prog-icon">${window.FORGE_ICON(pIcon)}</span>
        <h3>${esc(p.name)} ${isActive ? '<span class="tag volt-tag">Active</span>' : ""} ${p.custom ? '<span class="tag">Custom</span>' : ""}</h3></div>
        <p class="muted">${esc(p.tagline)}</p>
        <div class="meta">
          <span class="tag volt-tag">${cap1(p.level)}</span>
          <span class="tag">${p.daysPerWeek} days/wk</span>
          <span class="tag">${p.weeks} weeks</span>
        </div>
        <p class="muted" style="margin-top:10px;font-size:13px">${p.days.length} workouts · ${n} exercises · ${esc(p.equipment)}</p>
      </div>`;
    }).join("");
  }
  document.addEventListener("click", e => {
    const pc = e.target.closest("[data-prog]");
    if (pc) location.hash = "#/program/" + pc.dataset.prog;
  });

  // PROGRAM DETAIL
  function renderProgram(id) {
    const p = progById(id);
    if (!p) { location.hash = "#/programs"; return; }
    $("pgName").textContent = p.name;
    $("pgTag").textContent = p.tagline;
    $("pgBadges").innerHTML =
      `<span class="tag volt-tag">${cap1(p.level)}</span>
       <span class="tag">${p.daysPerWeek} days/week</span>
       <span class="tag">${p.weeks} weeks</span>
       <span class="tag">${esc(p.equipment)}</span>`;
    const isActive = getActiveProg() === p.id;
    const ni = nextDayIdx(p);
    $("pgActions").innerHTML = isActive
      ? `<a class="btn btn-primary btn-sm" href="#/workout/${p.id}/${ni}">Continue: ${esc(p.days[ni].name)}</a>
         <button class="btn btn-ghost btn-sm" id="pgStop">Stop program</button>`
      : `<button class="btn btn-primary btn-sm" id="pgStart">Start this program</button>`;
    const st = $("pgStart");
    if (st) st.onclick = () => { setActiveProg(p.id); renderProgram(p.id); };
    const sp = $("pgStop");
    if (sp) sp.onclick = () => { setActiveProg(null); renderProgram(p.id); };
    $("pgActions").innerHTML += ` <button class="btn btn-ghost btn-sm" id="pgICS" title="Download a 4-week calendar file">Export to calendar</button>`;
    $("pgICS").onclick = () => exportProgramICS(p.id);
    if (p.custom) {
      $("pgActions").innerHTML += ` <button class="btn btn-ghost btn-sm danger" id="pgDelete">${t("b_delete")}</button>`;
      $("pgDelete").onclick = async () => {
        if (await appConfirm(`Delete "${p.name}"? This cannot be undone.`, { okText: "Delete", danger: true })) {
          if (getActiveProg() === p.id) setActiveProg(null);
          deleteCustomProgram(p.id);
          location.hash = "#/programs";
        }
      };
    }
    $("pgDays").innerHTML = p.mesocycle
      ? `<div class="onerm-box" style="margin-bottom:16px"><b>Periodized plan:</b> <span class="muted">Weights increase 2.5% weekly. Week 4 is a deload at 60%.</span></div>` +
        p.mesocycle.map(w => `
          <h3 style="margin:20px 0 12px">${w.deload ? "Week " + w.week + " (Deload)" : "Week " + w.week}</h3>
          ${w.days.map((d, di) => `
            <div class="day-card">
              <div class="day-head">
                <h3>${esc(d.name)}</h3>
                <a class="btn btn-primary btn-sm" href="#/workout/${p.id}/${di}?week=${w.week}">Start workout</a>
              </div>
              <div class="day-exercises">
                ${d.exercises.map(x => {
                  const ex = byId(x.id);
                  return `<div class="mini-card" data-ex="${x.id}"><b>${esc(ex ? ex.name : x.id)}</b><span>${x.sets} × ${esc(x.reps)} @ ${fmtW(x.weight)}</span></div>`;
                }).join("")}
              </div>
            </div>`).join("")}
        `).join("")
      : p.days.map((d, di) => {
      const key = p.id + ":" + di;
      const times = (done[key] || []).length;
      return `<div class="day-card">
        <div class="day-head">
          <h3>${esc(d.name)} ${times ? `<span class="done-mark">${window.FORGE_ICON("check")} ${times}x</span>` : ""}</h3>
          <a class="btn btn-primary btn-sm" href="#/workout/${p.id}/${di}">Start workout</a>
        </div>
        <div class="day-exercises">
        ${d.exercises.map(x => {
          const ex = byId(x.id);
          return `<div class="mini-card" data-ex="${x.id}"><b>${esc(ex ? ex.name : x.id)}</b><span>${x.sets} × ${esc(x.reps)}</span></div>`;
        }).join("")}
        </div>
      </div>`;
    }).join("");
  }
  function exportProgramICS(pid) {
    const p = progById(pid);
    if (!p) return;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FORGE//Workout//EN"];
    const start = new Date(); start.setDate(start.getDate() + 1);
    for (let wk = 0; wk < 4; wk++) {
      p.days.forEach((d, di) => {
        const dt = new Date(start); dt.setDate(dt.getDate() + wk * 7 + di);
        const ds = fmtDate(dt).replace(/-/g, "");
        lines.push("BEGIN:VEVENT", "UID:forge-" + pid + "-" + wk + "-" + di + "@forge",
          "DTSTART:" + ds + "T180000", "DURATION:PT1H",
          "SUMMARY:FORGE " + d.name.replace(/[,;\\]/g, ""),
          "DESCRIPTION:" + d.exercises.map(x => { const ex = byId(x.id); return (ex ? ex.name : x.id) + " " + x.sets + "x" + x.reps; }).join(", ").replace(/[,;\\]/g, ""),
          "END:VEVENT");
      });
    }
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "forge-" + pid + ".ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  let timerInt = null, timerLeft = 0, timerTotal = 0, currentWorkout = null;
  const TIMER_CIRC = 2 * Math.PI * 52;
  function paintTimer() {
    const d = $("timerDisplay");
    if (d) d.textContent = fmtT(Math.max(0, timerLeft));
    const ring = $("timerRing");
    if (ring) ring.style.strokeDashoffset = String(timerTotal > 0 ? TIMER_CIRC * (1 - Math.max(0, timerLeft) / timerTotal) : 0);
  }
  (function () {
    var timerEl = null, miniQueued = false, miniOn = false;
    function timerVisible() {
      if (!timerEl) timerEl = document.querySelector(".timer");
      return timerEl && timerEl.offsetParent !== null;
    }
    function updateMini() {
      miniQueued = false;
      if (!timerVisible()) { if (miniOn && timerEl) { miniOn = false; timerEl.classList.remove("mini"); } return; }
      var top = timerEl.getBoundingClientRect().top;
      if (!miniOn && top <= 67) { miniOn = true; timerEl.classList.add("mini"); }
      else if (miniOn && top > 92) { miniOn = false; timerEl.classList.remove("mini"); }
    }
    function queueMini() {
      if (miniQueued) return;
      miniQueued = true;
      requestAnimationFrame(updateMini);
    }
    window.addEventListener("scroll", queueMini, { passive: true });
    window.addEventListener("resize", queueMini);
    window._refreshTimerMini = queueMini;
  })();
  function currentExerciseId() {
    if (!currentWorkout || !currentWorkout.exercises) return null;
    for (let xi = 0; xi < currentWorkout.exercises.length; xi++) {
      const total = currentWorkout.exercises[xi].sets || 0;
      const doneCt = document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).length;
      if (doneCt < total) return currentWorkout.exercises[xi].id;
    }
    return currentWorkout.exercises.length ? currentWorkout.exercises[0].id : null;
  }
  function getRestSeconds(ex) {
    const s = getSettings();
    if (!ex) return s.restShort;
    // heavy compounds get long rest
    if (ex.equipment === "barbell" || ex.level === "advanced") return s.restLong;
    return s.restShort;
  }
  let cueInt = null;
  function showRestCue() {
    clearInterval(cueInt);
    const el = $("restCue");
    if (!el) return;
    let cues = FORM_CUES.default;
    if (currentWorkout && currentWorkout.exercises) {
      // find first exercise with incomplete sets
      for (let xi = 0; xi < currentWorkout.exercises.length; xi++) {
        const done = document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).length;
        const total = (currentWorkout.exercises[xi].sets || []).length || currentWorkout.exercises[xi].sets || 3;
        if (done < total) {
          const ex = byId(currentWorkout.exercises[xi].id);
          if (ex) cues = FORM_CUES[groupOf(ex.primary)] || FORM_CUES.default;
          break;
        }
      }
    }
    let i = 0;
    el.textContent = "Form cue: " + cues[0];
    cueInt = setInterval(() => { i = (i + 1) % cues.length; el.textContent = "Form cue: " + cues[i]; }, 15000);
  }
  function startTimer(sec) {
    clearInterval(timerInt);
    clearInterval(cueInt);
    timerLeft = sec; timerTotal = sec;
    paintTimer();
    showRestCue();
    timerInt = setInterval(() => {
      timerLeft--;
      paintTimer();
      if (timerLeft <= 0) {
        clearInterval(timerInt); timerInt = null;
        clearInterval(cueInt); const rc = $("restCue"); if (rc) rc.textContent = "";
        beep(); buzz([40, 40, 40]);
        if (getSettings().voiceCues && window.speechSynthesis) {
          speechSynthesis.speak(new SpeechSynthesisUtterance("Rest over. Next set."));
        }
      }
    }, 1000);
  }
  function fmtT(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function beep() {
    if (!getSettings().sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = "sine";
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.65);
    } catch (e) { /* audio unavailable */ }
  }
  function renderWorkout(pid, di, week) {
    clearInterval(timerInt); timerInt = null; timerLeft = 0; timerTotal = 0; paintTimer();
    const p = progById(pid);
    const mesoDay = week && p && p.mesocycle && p.mesocycle[week - 1] ? p.mesocycle[week - 1].days[di] : null;
    const d = mesoDay || (p && p.days[di]);
    if (!d) { location.hash = "#/program/" + pid; return; }
    const sameWorkout = currentWorkout && currentWorkout._pid === pid && currentWorkout._di === di;
    const savedPairs = sameWorkout ? currentWorkout._pairs : null;
    currentWorkout = JSON.parse(JSON.stringify(d));
    currentWorkout._pairs = savedPairs || new Set();
    currentWorkout._pid = pid; currentWorkout._di = di;
    if (week) currentWorkout._week = week;
    let travelSwaps = 0;
    if (window._travelOn) {
      currentWorkout.exercises.forEach(x => {
        const sub = travelSub(x.id);
        if (sub) { x.id = sub.id; x._swapped = true; travelSwaps++; }
      });
    }
    $("woTitle").textContent = d.name;
    $("woSub").textContent = p.name + (week ? " · Week " + week + (p.mesocycle && p.mesocycle[week - 1] && p.mesocycle[week - 1].deload ? " (deload)" : "") : "");
    const advHint = `<p class="muted" style="font-size:12px;margin-bottom:12px">Set type: Std = standard, Drop = drop set, R-P = rest-pause, Clu = cluster, Myo = myo-rep.</p>`;
    const travelHint = window._travelOn ? (travelSwaps > 0
      ? `<p class="muted" style="font-size:12px;margin-bottom:12px">Travel mode is on: ${travelSwaps} exercise${travelSwaps > 1 ? "s" : ""} swapped to bodyweight / dumbbell / band alternatives.</p>`
      : `<p class="muted" style="font-size:12px;margin-bottom:12px">Travel mode is on: all exercises are already travel-friendly, nothing to swap.</p>`) : "";
    $("woList").innerHTML = `<p class="muted" style="font-size:12px;margin-bottom:12px">RPE = how hard the set felt (6 easy → 10 all-out). Optional but helps the coach adapt.</p>` + advHint + travelHint + currentWorkout.exercises.map((x, xi) => {
      const ex = byId(x.id);
      if (!ex) {
        return `<div class="wo-ex"><div class="wo-ex-head"><b class="muted">Missing exercise</b><span class="tag">no longer available</span></div><p class="muted" style="font-size:13px;margin:4px 0">This exercise was deleted from your library. You can still finish the workout.</p></div>`;
      }
      const isBW = ex.equipment === "bodyweight";
      const lw = (x.weight != null && x.weight > 0) ? x.weight : lastWeightKg(x.id);
      const repsNum = parseInt(x.reps) || 8;
      const lastRpe = getRPE(x.id);
      const rows = Array.from({ length: x.sets }, (_, si) => {
        const wVal = lw != null ? fromKg(lw) : "";
        const repsVal = (x.repsArr && x.repsArr[si] != null) ? x.repsArr[si] : repsNum;
        const wValSi = (x.weightsArr && x.weightsArr[si] != null) ? fromKg(x.weightsArr[si]) : wVal;
        return `<div class="set-row2">
          <button class="set-done" data-x="${xi}" data-s="${si}" aria-label="Mark set ${si + 1} done">${window.FORGE_ICON("check")}</button>
          <button class="set-fail" data-x="${xi}" data-s="${si}" aria-label="Mark set ${si + 1} as failed" title="Failed set (missed reps)">${window.FORGE_ICON("x")}</button>
          <span class="set-num">Set ${si + 1}</span>
          <span class="set-reps"><input type="number" min="1" value="${repsVal}" data-x="${xi}" data-s="${si}" data-f="reps" aria-label="Reps"> reps</span>
          ${isBW ? `<span class="set-bw">Bodyweight</span><input class="set-weight" type="number" min="0" step="any" placeholder="+kg" value="${wValSi}" data-x="${xi}" data-s="${si}" data-f="added" aria-label="Added weight" style="width:64px"><span class="set-unit">${unitLabel()}</span>`
                 : `<input class="set-weight" type="number" min="0" step="any" placeholder="–" value="${wValSi}" data-x="${xi}" data-s="${si}" data-f="weight" aria-label="Weight"><span class="set-unit">${unitLabel()}</span>`}
          <select class="set-type" data-x="${xi}" data-s="${si}" aria-label="Set type" title="Set type: Standard, Drop set, Rest-pause, Cluster, Myo-rep" style="width:66px;padding:6px 4px;font-size:12px">
            <option value="std">Std</option><option value="drop">Drop</option><option value="rp">R-P</option><option value="cluster">Clu</option><option value="myo">Myo</option>
          </select>
          <select class="set-rpe" data-x="${xi}" data-s="${si}" aria-label="RPE: Rate of Perceived Exertion (6=easy, 10=max effort)" title="RPE: how hard was this set? 6=easy, 10=all-out" style="width:62px;padding:6px 4px;font-size:12px">
            <option value="">RPE</option>${[6,7,8,9,10].map(r => `<option value="${r}"${lastRpe && lastRpe.rpe === r ? " selected" : ""}>${r}</option>`).join("")}
          </select>
        </div>`;
      }).join("");
      const pairs = currentWorkout._pairs;
      const isPaired = pairs.has(xi) || pairs.has(xi - 1);
      // linked groups: pairs.has(i) links exercise i to i+1, so consecutive
      // links form one group; {0,1} means exercises 0,1,2 are a giant set.
      let gStart = xi, gEnd = xi;
      while (gStart > 0 && pairs.has(gStart - 1)) gStart--;
      while (pairs.has(gEnd)) gEnd++;
      const gSize = gEnd - gStart + 1, gPos = xi - gStart + 1;
      const pairBadge = gSize === 2
        ? `<span class="superset-badge">${gPos === 1 ? "A1" : "A2"}</span>`
        : gSize >= 3
          ? `<span class="giant-badge" title="Giant set">G${gPos}</span>`
          : "";
      const sug = suggestWeight(x.id);
      const note = getExNote(x.id);
      return `<div class="wo-ex ${isPaired ? "superset" : ""}">
        <div class="wo-ex-head">
          <b data-ex="${x.id}" class="wo-link">${esc(ex.name)}</b>
          ${pairBadge}
          ${x._swapped ? `<span class="tag volt-tag">Travel swap</span>` : ""}
          <span class="tag">${x.sets} × ${esc(x.reps)}</span>
        </div>
        ${(() => { const ls = lastSessionFull(x.id); return ls ? `<p class="last-time-line" style="font-size:13px;margin:6px 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span class="muted">Last time:</span> <b>${esc(lastSessionSummary(ls))}</b><span class="beat-badge hidden" id="beat-${xi}"></span></p>` : ""; })()}
        <input class="ex-note-input" data-x="${xi}" placeholder="Note for next time…" value="${esc(note)}" aria-label="Exercise note">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0">
          <button class="guide-toggle" data-guide="${xi}">Form guide ${window.FORGE_ICON("chevron-down")}</button>
          <button class="btn btn-ghost btn-sm tempo-toggle" data-tempo="${xi}">Tempo coach</button>
          ${!isBW && lw ? `<button class="btn btn-ghost btn-sm warmup-toggle" data-warmup="${xi}">Warm up</button>` : ""}
        </div>
        <div class="warmup-box hidden" id="warmup-${xi}"></div>
        <div class="tempo-box hidden" id="tempo-${xi}">
          <p class="muted" style="font-size:12px;margin:0 0 8px">Paces each rep: slow lowering, a pause, then lifting.</p>
          ${(() => { const tp = getTempo(x.id); return `
          <label>Eccentric <input type="number" class="tempo-in" data-t="0" min="1" max="10" value="${tp[0]}"></label>
          <label>Pause <input type="number" class="tempo-in" data-t="1" min="0" max="10" value="${tp[1]}"></label>
          <label>Concentric <input type="number" class="tempo-in" data-t="2" min="1" max="10" value="${tp[2]}"></label>`; })()}
          <button class="btn btn-primary btn-sm tempo-start" data-x="${xi}">Start</button>
          <button class="btn btn-ghost btn-sm tempo-stop">Stop</button>
          <span class="tempo-display" id="tempo-d-${xi}">Ready</span>
        </div>
        ${xi < d.exercises.length - 1 ? `<button class="btn btn-ghost btn-sm" data-pair="${xi}" style="margin:6px 0">${pairs.has(xi) ? "Unlink" : "Link with next"}</button>` : ""}
        <ol class="steps wo-steps hidden" id="guide-${xi}">
          ${ex.steps.map(s => `<li>${esc(s)}</li>`).join("")}
        </ol>
        <div>${rows}</div>
        <span class="tag volt-tag wo-muscle">${MUSCLE_INFO[ex.primary].name}</span>
      </div>`;
    }).join("");
    timerLeft = 0; timerTotal = 0; paintTimer();
    $("woDone").classList.add("hidden");
    $("woFinish").classList.remove("hidden");
    window._woPid = pid; window._woDi = di; window._woWeek = week || null;
    // energy-based scaling: low check-in energy suggests a shorter session
    if (!window._scaleDone) {
      const _ci = getCheckin(fmtDate(new Date()));
      if (_ci && _ci.energy != null && _ci.energy <= 2 && d.exercises.length > 1) {
        const banner = document.createElement("div");
        banner.className = "onerm-box"; banner.id = "scaleBanner";
        banner.style.borderColor = "var(--warn)"; banner.style.marginBottom = "12px";
        banner.innerHTML = `<b>Low energy today (${_ci.energy}/5).</b> <span class="muted">Want a shorter session? We can drop the last exercise.</span>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" data-scale="shorten">Shorten session</button>
            <button class="btn btn-ghost btn-sm" data-scale="keep">Keep as planned</button>
          </div>`;
        $("woList").prepend(banner);
      }
    }
  }

  function updateBeatdown(xi) {
    const badge = $("beat-" + xi);
    if (!badge || !currentWorkout || !currentWorkout.exercises[xi]) return;
    const woEx = currentWorkout.exercises[xi];
    const ls = lastSessionFull(woEx.id);
    if (!ls) { badge.classList.add("hidden"); return; }
    // current completed volume (from DOM inputs)
    let curVol = 0, curSets = 0;
    document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).forEach(btn => {
      const si = parseInt(btn.dataset.s, 10);
      const wIn = document.querySelector(`input[data-x="${xi}"][data-s="${si}"][data-f="weight"], input[data-x="${xi}"][data-s="${si}"][data-f="added"]`);
      const rIn = document.querySelector(`input[data-x="${xi}"][data-s="${si}"][data-f="reps"]`);
      const w = wIn ? (parseFloat(wIn.value) || 0) : 0;
      const r = rIn ? (parseInt(rIn.value) || 0) : 0;
      curVol += w * r; curSets++;
    });
    const lastVol = ls.sets.reduce((a, st) => a + st.weight * st.reps, 0);
    if (curSets > 0 && curVol > lastVol) {
      badge.textContent = "Beating last time";
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }
  document.addEventListener("click", e => {
    const gt = e.target.closest(".guide-toggle");
    if (gt) {
      const panel = $("guide-" + gt.dataset.guide);
      const open = panel.classList.toggle("hidden");
      gt.classList.toggle("open", !open);
      return;
    }
    const sf = e.target.closest(".set-fail");
    if (sf) { sf.classList.toggle("hit"); return; }
    const sd = e.target.closest(".set-done");
    if (sd) {
      const wasHit = sd.classList.contains("hit");
      sd.classList.toggle("hit");
      if (!wasHit) {
        buzz(15);
        sd.classList.remove("just-hit"); void sd.offsetWidth; sd.classList.add("just-hit");
        setTimeout(() => sd.classList.remove("just-hit"), 380);
        const row = sd.closest(".set-row2");
        if (row) { row.classList.remove("set-flash"); void row.offsetWidth; row.classList.add("set-flash"); }
      }
      try { updateBeatdown(parseInt(sd.dataset.x, 10)); } catch (e2) {}
      if (!wasHit && getSettings().autoRest) {
        const xi = parseInt(sd.dataset.x, 10);
        const woEx = currentWorkout && currentWorkout.exercises[xi];
        const ex = woEx && byId(woEx.id);
        // linked groups (supersets and giant sets) get short rest
        const isPair = currentWorkout && currentWorkout._pairs && (currentWorkout._pairs.has(xi) || currentWorkout._pairs.has(xi - 1));
        startTimer(isPair ? 30 : (getRestFor(woEx.id) || getRestSeconds(ex)));
        if (getSettings().voiceCues && window.speechSynthesis) {
          const setNum = parseInt(sd.dataset.s, 10) + 1;
          const total = woEx ? woEx.sets : 0;
          speechSynthesis.speak(new SpeechSynthesisUtterance(`Set ${setNum} of ${total} done. Rest.`));
        }
      }
      return;
    }
    const pr = e.target.closest("[data-pair]");
    if (pr && currentWorkout) {
      const xi = parseInt(pr.dataset.pair, 10);
      if (!currentWorkout._pairs) currentWorkout._pairs = new Set();
      if (currentWorkout._pairs.has(xi)) currentWorkout._pairs.delete(xi);
      else currentWorkout._pairs.add(xi);
      const raw = location.hash.replace(/^#\/?/, "").split("?")[0].split("/");
      const _wq = new URLSearchParams((location.hash.split("?")[1] || "").split("/")[0]);
      renderWorkout(raw[1], parseInt(raw[2], 10), parseInt(_wq.get("week") || "0", 10) || null);
      return;
    }
    const tt = e.target.closest(".tempo-toggle");
    if (tt) { const box = $("tempo-" + tt.dataset.tempo); if (box) box.classList.toggle("hidden"); stopTempo(); return; }
    const wut = e.target.closest(".warmup-toggle");
    if (wut) {
      const xi = wut.dataset.warmup, box = $("warmup-" + xi);
      if (box) {
        const isHidden = box.classList.toggle("hidden");
        wut.classList.toggle("open", !isHidden);
        if (!isHidden && !box.dataset.built) {
          let wKg = null;
          const wIn = document.querySelector(`input[data-x="${xi}"][data-f="weight"]`);
          if (wIn && parseFloat(wIn.value) > 0) wKg = toKg(parseFloat(wIn.value));
          if (!wKg && currentWorkout && currentWorkout.exercises[parseInt(xi, 10)]) {
            const x = currentWorkout.exercises[parseInt(xi, 10)];
            wKg = (x.weight != null && x.weight > 0) ? x.weight : lastWeightKg(x.id);
          }
          const sets = warmupSets(wKg);
          box.dataset.built = "1";
          box.innerHTML = sets.length
            ? `<p class="muted" style="font-size:12px;margin:0 0 8px">Warm-up for ${fmtW(wKg)}. Tap each set when done.</p>` +
              sets.map((s, si) => `<div class="warmup-row"><button class="set-done warmup-done" aria-label="Mark warm-up set ${si + 1} done">${window.FORGE_ICON("check")}</button><span><b>${fmtW(s.weight)}</b> × ${s.reps} reps</span></div>`).join("")
            : `<p class="muted" style="font-size:13px;margin:0">Enter a working weight above first.</p>`;
        }
      }
      return;
    }
    const wud = e.target.closest(".warmup-done");
    if (wud) { wud.classList.toggle("hit"); const row = wud.closest(".warmup-row"); if (row) row.classList.toggle("done", wud.classList.contains("hit")); return; }
    const ts = e.target.closest(".tempo-start");
    if (ts) {
      const xi = ts.dataset.x, box = $("tempo-" + xi);
      const vals = [0, 1, 2].map(i => Math.max(0, parseInt(box.querySelector(`.tempo-in[data-t="${i}"]`).value) || 0));
      const exId = currentWorkout && currentWorkout.exercises[parseInt(xi, 10)] ? currentWorkout.exercises[parseInt(xi, 10)].id : null;
      if (exId) saveTempo(exId, vals);
      startTempo(vals[0], vals[1], vals[2], "tempo-d-" + xi);
      return;
    }
    if (e.target.closest(".tempo-stop")) { stopTempo(); return; }
    const sc = e.target.closest("[data-scale]");
    if (sc) {
      window._scaleDone = true;
      if (sc.dataset.scale === "shorten" && currentWorkout && currentWorkout.exercises.length > 1) {
        currentWorkout.exercises.pop();
        renderWorkout(window._woPid, window._woDi, window._woWeek);
      } else {
        const b = $("scaleBanner"); if (b) b.remove();
      }
      return;
    }
    const tp = e.target.closest("[data-timer]");
    if (tp) {
      const sec = parseInt(tp.dataset.timer, 10);
      const _cid = currentExerciseId(); if (_cid) saveRestFor(_cid, sec);
      clearInterval(timerInt);
      timerLeft = sec; timerTotal = sec;
      paintTimer();
      timerInt = setInterval(() => {
        timerLeft--;
        paintTimer();
        if (timerLeft <= 0) { clearInterval(timerInt); timerInt = null; beep(); buzz([40, 40, 40]); }
      }, 1000);
      return;
    }
    if (e.target.closest("#timerStop")) { clearInterval(timerInt); timerInt = null; clearInterval(cueInt); const rc = $("restCue"); if (rc) rc.textContent = ""; return; }
  });
  function showLevelUp(lvl) {
    const veil = document.createElement("div");
    veil.className = "pr-veil";
    veil.innerHTML = `<div class="pr-card lvl-card">
      <div class="pr-trophy">${window.FORGE_ICON ? window.FORGE_ICON("trophy") : ""}</div>
      <div class="lvl-num">${lvl}</div>
      <h2>Level up!</h2>
      <p class="muted">Your training is compounding.</p>
      <button class="btn btn-primary" id="lvlClose">Keep going</button>
    </div>`;
    veil.addEventListener("click", e => { if (e.target === veil || e.target.closest("#lvlClose")) veil.remove(); });
    document.body.appendChild(veil);
    buzz([30, 50, 30, 50, 60]);
    setTimeout(() => veil.remove(), 6000);
  }
  function spawnConfetti(host, n) {
    if (getSettings().reduceMotion) return;
    const colors = ["#c8ff00", "#38e1ff", "#ff5d5d", "#ffd166", "#b388ff"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.style.left = (Math.random() * 100) + "%";
      s.style.background = colors[i % colors.length];
      s.style.animationDuration = (1.6 + Math.random() * 1.4).toFixed(2) + "s";
      s.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s";
      s.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
      host.appendChild(s);
      setTimeout(() => s.remove(), 3600);
    }
  }
  function showPRCelebration(prs) {
    const veil = document.createElement("div");
    veil.className = "pr-veil";
    veil.innerHTML = `<div class="pr-card">
      <div class="pr-trophy">${window.FORGE_ICON ? window.FORGE_ICON("trophy") : "🏆"}</div>
      <h2>New PR${prs.length > 1 ? "s" : ""}!</h2>
      ${prs.map(p => `<p><b>${esc(p.name)}</b><br><span>${p.weight > 0 ? fmtW(p.weight) + " × " + p.reps : p.reps + " reps"}</span></p>`).join("")}
      <button class="btn btn-primary" id="prClose">Keep going</button>
    </div>`;
    veil.addEventListener("click", e => { if (e.target === veil || e.target.closest("#prClose")) veil.remove(); });
    document.body.appendChild(veil);
    spawnConfetti(veil, 42);
    setTimeout(() => veil.remove(), 8000);
  }
  $("woFinish").addEventListener("click", () => {
    const raw = location.hash.replace(/^#\/?/, "").split("?")[0].split("/");
    const key = raw[1] + ":" + raw[2];
    const today = fmtDate(new Date());
    const p = progById(raw[1]);
    const d = p && p.days[parseInt(raw[2], 10)];
    const wq = new URLSearchParams((location.hash.split("?")[1] || "").split("/")[0]);
    const entry = { date: today, ts: Date.now(), programId: raw[1], programName: p ? p.name : "", dayName: d ? d.name : "", week: wq.get("week") ? parseInt(wq.get("week"), 10) : null, exercises: [] };
    if (d) d.exercises.forEach((x, xi) => {
      const sets = [];
      document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).forEach(btn => {
        const si = btn.dataset.s;
        const repsEl = document.querySelector(`input[data-f="reps"][data-x="${xi}"][data-s="${si}"]`);
        const wEl = document.querySelector(`input[data-f="weight"][data-x="${xi}"][data-s="${si}"]`);
        const aEl = document.querySelector(`input[data-f="added"][data-x="${xi}"][data-s="${si}"]`);
        const rpeEl = document.querySelector(`select.set-rpe[data-x="${xi}"][data-s="${si}"]`);
        const typeEl = document.querySelector(`select.set-type[data-x="${xi}"][data-s="${si}"]`);
        const failed = !!document.querySelector(`.set-fail[data-x="${xi}"][data-s="${si}"].hit`);
        const rpe = rpeEl && rpeEl.value ? parseInt(rpeEl.value, 10) : null;
        sets.push({
          reps: Math.max(1, parseInt(repsEl && repsEl.value) || 0),
          weight: wEl ? toKg(parseFloat(wEl.value) || 0) : 0,
          added: aEl ? toKg(parseFloat(aEl.value) || 0) : 0,
          rpe, failed, type: typeEl ? typeEl.value : "std"
        });
      });
      if (sets.length) {
        entry.exercises.push({ id: x.id, sets });
        const lastRpe = sets.map(s => s.rpe).filter(r => r != null).pop();
        if (lastRpe != null) saveRPE(x.id, lastRpe);
        const noteEl = document.querySelector(`.ex-note-input[data-x="${xi}"]`);
        if (noteEl) saveExNote(x.id, noteEl.value.trim());
      }
    });
    if (!entry.exercises.length) { appAlert("Mark at least one set as done to log this workout."); return; }
    const _woNoteEl = $("woNotes");
    entry.notes = _woNoteEl ? _woNoteEl.value.trim() : "";
    const newPRs = [];
    entry.exercises.forEach(x => {
      const ex = byId(x.id);
      const prev = exercisePR(x.id);
      x.sets.forEach(s => {
        const w = s.weight || 0;
        if (!prev || w > prev.weight || (w === prev.weight && s.reps > prev.reps)) {
          if (!newPRs.some(p => p.id === x.id)) newPRs.push({ id: x.id, name: ex ? ex.name : x.id, weight: w, reps: s.reps });
        }
      });
    });
    const log = getLog(); log.push(entry); saveLog(log);
    if (_woNoteEl) _woNoteEl.value = "";
    // XP: 2 per set, 50 per PR, 25 streak bonus, 100 dungeon bonus
    let xpGain = entry.exercises.reduce((a, x) => a + x.sets.length * 2, 0) + newPRs.length * 50;
    if (workoutStreak() >= 7) xpGain += 25;
    if (p && p.dungeon) xpGain += 100;
    const _oldLvl = xpLevel(getXP().xp);
    addXP(xpGain);
    try {
      const xl = JSON.parse(localStorage.getItem("forge-xp-log") || "[]");
      xl.push({ date: today, xp: xpGain });
      localStorage.setItem("forge-xp-log", JSON.stringify(xl));
    } catch (e) {}
    const _xpLine = $("woXpLine");
    if (_xpLine) _xpLine.innerHTML = `Earned <b style="color:var(--volt)">+${xpGain} XP</b>${p && p.dungeon ? " including the dungeon bonus" : ""} · Level ${xpLevel(getXP().xp)}`;
    // animated XP bar to next level
    (function () {
      const xp = getXP().xp, lvl = xpLevel(xp);
      const cur = 100 * Math.pow(lvl - 1, 2), nxt = 100 * Math.pow(lvl, 2);
      const pct = Math.max(0, Math.min(100, ((xp - cur) / (nxt - cur)) * 100));
      const fill = $("woXpFill"), next = $("woXpNext");
      if (fill) { fill.style.width = "0%"; requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct.toFixed(1) + "%"; })); }
      if (next) next.textContent = `${Math.round(nxt - xp).toLocaleString()} XP to level ${lvl + 1}`;
      if (lvl > _oldLvl) setTimeout(() => showLevelUp(lvl), 600);
    })();
    checkBadges();
    window._lastEntry = entry;
    done[key] = done[key] || [];
    done[key].push(today); saveDone();
    $("woDone").classList.remove("hidden");
    $("woFinish").classList.add("hidden");
    if (newPRs.length) showPRCelebration(newPRs);
    clearInterval(timerInt); timerInt = null;
    // scroll to the summary so the user sees it
    setTimeout(() => {
      const el = $("woDone");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  });
  $("shareTextBtn").addEventListener("click", async () => {
    const entry = window._lastEntry;
    if (!entry) return;
    const lines = [`FORGE workout - ${entry.date}`, `${entry.programName}: ${entry.dayName}`, ""];
    entry.exercises.forEach(x => {
      const ex = byId(x.id);
      lines.push(`${ex ? ex.name : x.id}`);
      x.sets.forEach(s => lines.push(`  ${s.reps} reps${s.weight ? " @ " + fmtW(s.weight) : ""}${s.rpe ? " RPE " + s.rpe : ""}${s.failed ? " (failed)" : ""}`));
    });
    const text = lines.join("\n");
    if (navigator.share) { try { await navigator.share({ title: "FORGE workout", text }); } catch (e) {} }
    else {
      try { await navigator.clipboard.writeText(text); appAlert("Workout summary copied to clipboard."); }
      catch (e) { appAlert("Sharing is not available on this device."); }
    }
  });
  $("shareCard").addEventListener("click", async () => {
    const entry = window._lastEntry;
    if (!entry) return;
    const canvas = generateShareCard(entry);
    if (!canvas) { appAlert("Could not create share image."); return; }
    const fname = `forge-workout-${entry.date}.png`;
    // try native share first (mobile + desktop)
    try {
      const blob = await new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error("blob")), "image/png"));
      const file = new File([blob], "forge-workout.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "FORGE workout",
          text: `${entry.programName || ""}${entry.dayName ? ": " + entry.dayName : ""} - ${entry.date}`
        });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // user dismissed the share sheet
    }
    // fallback: download the PNG
    try {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
      appAlert("Image downloaded.");
    } catch (e) { appAlert("Could not create share image."); }
  });
  $("replayBtn").addEventListener("click", () => {
    if (!window._lastEntry) return;
    // store the entry for replay and go to body map
    window._replayEntry = window._lastEntry;
    location.hash = "#/body?replay=1";
  });

  /* ---------- router ---------- */
  function router() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query] = raw.split("?");
    const parts = path.split("/");
    const params = new URLSearchParams(query || "");
    if (parts[0] === "exercise" && parts[1]) { show("detail"); renderDetail(parts[1]); }
    else if (parts[0] === "exercises") {
      show("exercises");
      filters.muscle = params.get("m") || "";
      filters.q = ""; $("search").value = "";
      filters.eq = ""; $("eqFilter").value = "";
      filters.lvl = ""; $("lvlFilter").value = "";
      filters.myEq = false; $("myEqToggle").checked = false;
      const hasEq = (getSettings().myEquipment || []).length > 0;
      $("myEqWrap").classList.toggle("hidden", !hasEq);
      initExercises(); renderExercises();
    }
    else if (parts[0] === "body") {
      show("body");
      renderBody(params.get("m"));
      if (params.get("replay") && window._replayEntry) {
        setTimeout(() => startReplay(window._replayEntry), 800);
      }
    }
    else if (parts[0] === "favorites") { show("favorites"); renderFavorites(); }
    else if (parts[0] === "programs") { show("programs"); renderPrograms(); }
    else if (parts[0] === "program" && parts[1]) { show("program"); renderProgram(parts[1]); }
    else if (parts[0] === "workout" && parts[1] && parts[2] !== undefined) { show("workout"); window._scaleDone = false; window._travelOn = false; const _tb = $("travelBtn"); if (_tb) { _tb.classList.remove("on"); _tb.textContent = "Travel mode"; } renderWorkout(parts[1], parseInt(parts[2], 10), parseInt(params.get("week") || "0", 10) || null); }
    else if (parts[0] === "progress") { show("progress"); renderProgress(); }
    else if (parts[0] === "privacy") { show("privacy"); }
    else if (parts[0] === "builder") { show("builder"); newBuilder(); }
    else { show("home"); renderHome(); }
    if (window._refreshTimerMini) setTimeout(window._refreshTimerMini, 60);
  }
  $("search").addEventListener("input", e => { filters.q = e.target.value; renderExercises(); });
  $("muscleChips").addEventListener("click", e => {
    const c = e.target.closest("[data-m]"); if (!c) return;
    filters.muscle = c.dataset.m;
    document.querySelectorAll("#muscleChips .chip").forEach(x => x.classList.toggle("on", x === c));
    renderExercises();
  });
  $("eqFilter").addEventListener("change", e => { filters.eq = e.target.value; renderExercises(); });
  $("lvlFilter").addEventListener("change", e => { filters.lvl = e.target.value; renderExercises(); });
  $("myEqToggle").addEventListener("change", e => { filters.myEq = e.target.checked; renderExercises(); });
  $("dFav").addEventListener("click", () => {
    const id = $("dFav").dataset.id;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    saveFavs(); syncDetailFav(byId(id));
  });
  $("dPyramid").addEventListener("click", () => {
    const id = $("dPyramid").dataset.id;
    if (id) openPyramid(id);
  });

  window.addEventListener("hashchange", router);
  initExercises();
  saveFavs();
  // retire the old light/dark theme; dark only from here on
  localStorage.removeItem("forge-theme");
  document.documentElement.removeAttribute("data-theme");
  applyAccent(localStorage.getItem("forge-accent") || "volt", false);
  applyI18n();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  $("settingsBtn").addEventListener("click", openSettings);
  $("settingsClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
  document.querySelectorAll("[data-icon]").forEach(el => {
    if (window.FORGE_ICON) el.innerHTML = window.FORGE_ICON(el.dataset.icon);
  });
  $("settingsClose").addEventListener("click", closeSettings);
  $("settingsVeil").addEventListener("click", e => { if (e.target.id === "settingsVeil") closeSettings(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSettings(); closeQuiz(); } });
  $("accentGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-accent]");
    if (b) applyAccent(b.dataset.accent);
  });
  $("unitSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-unit]"); if (!b) return;
    const s = getSettings(); s.units = b.dataset.unit; saveSettings(s); syncSettingsUI();
  });
  $("speedSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-speed]"); if (!b) return;
    const s = getSettings(); s.demoSpeed = parseFloat(b.dataset.speed); saveSettings(s); syncSettingsUI();
  });
  $("langSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-lang]"); if (!b) return;
    const s = getSettings(); s.lang = b.dataset.lang; saveSettings(s); syncSettingsUI(); applyI18n();
  });
  $("eqGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-eq]"); if (!b) return;
    const s = getSettings(); s.myEquipment = s.myEquipment || [];
    const q = b.dataset.eq;
    s.myEquipment = s.myEquipment.includes(q) ? s.myEquipment.filter(x => x !== q) : [...s.myEquipment, q];
    saveSettings(s); syncSettingsUI();
  });
  $("reminderTime").addEventListener("change", e => { const s = getSettings(); s.reminder = e.target.value || ""; saveSettings(s); });
  $("reminderClear").addEventListener("click", () => { const s = getSettings(); s.reminder = ""; saveSettings(s); $("reminderTime").value = ""; });
  [["tglSound", "sound"], ["tglMotion", "reduceMotion"], ["tglDemoPlay", "demoAutoplay"], ["tglAutoRest", "autoRest"], ["tglVoice", "voiceCues"], ["tglBigText", "bigText"], ["tglContrast", "highContrast"], ["tglAdvanced", "advanced"], ["tglHaptic", "haptics"]].forEach(([id, key]) => {
    $(id).addEventListener("click", () => {
      const s = getSettings(); s[key] = !s[key]; saveSettings(s); syncSettingsUI(); applyA11y(); applyAdvanced();
    });
  });
  function applyAdvanced() {
    document.body.classList.toggle("no-adv", !getSettings().advanced);
  }
  function syncFinishUI() {
    const cur = getSettings().bodyFinish || "standard";
    document.querySelectorAll("#finishSeg [data-finish]").forEach(b =>
      b.classList.toggle("on", b.dataset.finish === cur));
  }
  // migrate legacy finish from localStorage to settings
  try {
    const legacy = localStorage.getItem("forge-body-finish");
    if (legacy && !getSettings().bodyFinish) {
      const st = getSettings(); st.bodyFinish = legacy; saveSettings(st);
    }
    localStorage.removeItem("forge-body-finish");
  } catch (e) {}
  $("goalSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-goal]");
    if (b) { const s = getSettings(); s.goal = b.dataset.goal; saveSettings(s); syncSettingsUI(); }
  });
  $("finishSeg").addEventListener("click", e => {
    const b = e.target.closest("[data-finish]");
    if (b) {
      const st = getSettings(); st.bodyFinish = b.dataset.finish; saveSettings(st);
      syncFinishUI(); applyBodyFinish(st.bodyFinish);
      try { if (finishPreviewViewer && finishPreviewViewer.setFinish) finishPreviewViewer.setFinish(st.bodyFinish); } catch (e2) {}
    }
  });
  $("exportData").addEventListener("click", () => {
    const data = {
      favs: [...favs], log: getLog(), done,
      settings: getSettings(), accent: localStorage.getItem("forge-accent") || "volt",
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "forge-backup.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });
  $("csvExport").addEventListener("click", exportCSV);
  $("backupData").addEventListener("click", backupData);
  $("restoreData").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!(await appConfirm("Restore from this backup? Current data will be replaced.", { okText: "Restore", danger: true }))) { e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        let restored = 0;
        Object.keys(data).forEach(k => {
          if (k.startsWith("forge-") && typeof data[k] === "string") { localStorage.setItem(k, data[k]); restored++; }
        });
        if (!restored) { appAlert("No FORGE data found in this file."); return; }
        appAlert("Backup restored. Reloading.");
        location.reload();
      } catch (err) { appAlert("Could not read this backup file."); }
      e.target.value = "";
    };
    reader.readAsText(file);
  });
  $("resetData").addEventListener("click", async () => {
    if (await appConfirm("Delete all favorites, workout history, records and settings? This cannot be undone.", { okText: "Delete everything", danger: true })) {
      localStorage.clear();
      location.reload();
    }
  });
  $("progTabs").addEventListener("click", e => {
    const c = e.target.closest("[data-ptab]"); if (!c) return;
    c.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    renderProgress(c.dataset.ptab);
  });
  // builder events
  $("bAddDay").addEventListener("click", () => {
    builder.days.push({ name: "Day " + (builder.days.length + 1), exercises: [] });
    renderBuilder();
  });
  $("bSave").addEventListener("click", saveBuilder);
  $("bDays").addEventListener("click", e => {
    const delD = e.target.closest("[data-bdel-day]");
    if (delD) {
      const di = parseInt(delD.dataset.bdelDay, 10);
      if (builder.days.length > 1) { builder.days.splice(di, 1); renderBuilder(); }
      return;
    }
    const delX = e.target.closest("[data-bdel-ex]");
    if (delX) {
      const [di, xi] = delX.dataset.bdelEx.split(":").map(Number);
      builder.days[di].exercises.splice(xi, 1); renderBuilder();
      return;
    }
    const pk = e.target.closest("[data-bpick]");
    if (pk) { openPicker(parseInt(pk.dataset.bpick, 10)); return; }
    const tSave = e.target.closest("[data-btpl-save]");
    if (tSave) {
      const di = parseInt(tSave.dataset.btplSave, 10);
      const day = builder.days[di];
      if (!day.exercises.length) { appAlert("Add exercises to this day first."); return; }
      appPrompt("Name this template:", day.name || "Workout template", "Save as template").then(name => {
        if (!name) return;
        const tpl = getTemplates();
        tpl.push({ id: "tpl-" + Date.now().toString(36), name: name.trim(), date: fmtDate(new Date()),
          exercises: day.exercises.map(x => ({ id: x.id, sets: x.sets, reps: x.reps, weight: x.weight != null ? x.weight : null })) });
        saveTemplates(tpl);
        appAlert("Template saved.");
      });
      return;
    }
    const tApply = e.target.closest("[data-btpl-apply]");
    if (tApply) { openTemplatePicker(parseInt(tApply.dataset.btplApply, 10)); return; }
    const b1 = e.target.closest("[data-b1rm]");
    if (b1) {
      const di = parseInt(b1.dataset.b1rm, 10);
      let filled = 0, missing = 0;
      builder.days[di].exercises.forEach(x => {
        const orm = oneRM(x.id);
        if (orm > 0) { x.weight = Math.round(orm * 0.75 * 4) / 4; filled++; }
        else missing++;
      });
      renderBuilder();
      appAlert(filled ? `Filled ${filled} exercise${filled > 1 ? "s" : ""} at 75% of estimated 1RM.` + (missing ? ` ${missing} had no logged data.` : "") : "No logged data yet. Log workouts to estimate your 1RMs.");
      return;
    }
  });
  $("bDays").addEventListener("input", e => {
    const dn = e.target.closest("[data-bday]");
    if (dn) { builder.days[parseInt(dn.dataset.bday, 10)].name = dn.value; return; }
    const bw = e.target.closest("[data-bwt]");
    if (bw) {
      const [di, xi] = bw.dataset.bwt.split(":").map(Number);
      const v = parseFloat(bw.value);
      builder.days[di].exercises[xi].weight = v > 0 ? toKg(v) : null;
      return;
    }
    const st = e.target.closest("[data-bset]");
    if (st) {
      const [di, xi] = st.dataset.bset.split(":").map(Number);
      builder.days[di].exercises[xi].sets = Math.max(1, Math.min(20, parseInt(st.value) || 3));
      return;
    }
    const rp = e.target.closest("[data-brep]");
    if (rp) {
      const [di, xi] = rp.dataset.brep.split(":").map(Number);
      builder.days[di].exercises[xi].reps = rp.value;
    }
  });
  (function () {
    var wrap = $("bDays");
    if (!wrap) return;
    var dragEl = null, dragDi = -1, dragXi = -1, startY = 0, active = false, overEl = null;
    wrap.addEventListener("pointerdown", function (e) {
      var h = e.target.closest(".drag-handle");
      if (!h) return;
      var row = h.closest(".bex-row");
      if (!row) return;
      var parts = h.dataset.bdrag.split(":").map(Number);
      dragDi = parts[0]; dragXi = parts[1];
      dragEl = row; startY = e.clientY; active = false; overEl = null;
    });
    wrap.addEventListener("pointermove", function (e) {
      if (!dragEl) return;
      if (!active && Math.abs(e.clientY - startY) > 10) {
        active = true;
        dragEl.classList.add("dragging");
        try { dragEl.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (!active) return;
      dragEl.style.transform = "translateY(" + (e.clientY - startY) + "px)";
      dragEl.style.zIndex = "5";
      wrap.querySelectorAll(".drag-over").forEach(function (r) { r.classList.remove("drag-over"); });
      overEl = null;
      var rows = Array.prototype.slice.call(wrap.querySelectorAll(".bex-row")).filter(function (r) { return r !== dragEl; });
      for (var i = 0; i < rows.length; i++) {
        var hd = rows[i].querySelector(".drag-handle");
        if (!hd || parseInt(hd.dataset.bdrag.split(":")[0], 10) !== dragDi) continue;
        var rect = rows[i].getBoundingClientRect();
        if (e.clientY > rect.top && e.clientY < rect.bottom) { overEl = rows[i]; rows[i].classList.add("drag-over"); break; }
      }
    });
    function endDrag() {
      if (!dragEl) return;
      var wasActive = active, srcDi = dragDi, srcXi = dragXi, tgt = overEl;
      dragEl.classList.remove("dragging");
      dragEl.style.transform = ""; dragEl.style.zIndex = "";
      wrap.querySelectorAll(".drag-over").forEach(function (r) { r.classList.remove("drag-over"); });
      dragEl = null; active = false; overEl = null;
      if (wasActive && tgt) {
        var tXi = parseInt(tgt.querySelector(".drag-handle").dataset.bdrag.split(":")[1], 10);
        if (tXi !== srcXi && typeof builder !== "undefined" && builder.days[srcDi]) {
          var arr = builder.days[srcDi].exercises;
          var mv = arr.splice(srcXi, 1)[0];
          arr.splice(tXi, 0, mv);
          renderBuilder();
        }
      }
    }
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
  })();
  $("pickerClose").addEventListener("click", closePicker);
  $("pickerVeil").addEventListener("click", e => { if (e.target.id === "pickerVeil") closePicker(); });
  $("pickerSearch").addEventListener("input", e => renderPicker(e.target.value));
  $("pickerList").addEventListener("click", async e => {
    const tDel = e.target.closest("[data-tpl-del]");
    if (tDel) {
      if (!(await appConfirm("Delete this template?", { okText: "Delete", danger: true }))) return;
      saveTemplates(getTemplates().filter(t => t.id !== tDel.dataset.tplDel));
      openTemplatePicker(templateDay);
      return;
    }
    const tApp = e.target.closest("[data-tpl-apply]");
    if (tApp && templateDay >= 0) {
      const t = getTemplates().find(x => x.id === tApp.dataset.tplApply);
      if (t) {
        builder.days[templateDay].exercises = t.exercises.map(x => ({ id: x.id, sets: x.sets, reps: x.reps }));
        renderBuilder();
      }
      closePicker();
      return;
    }
    const b = e.target.closest("[data-pick]"); if (!b || pickerDay < 0) return;
    const id = b.dataset.pick;
    const day = builder.days[pickerDay];
    if (!day.exercises.some(x => x.id === id)) {
      day.exercises.push({ id, sets: 3, reps: "10" });
      renderBuilder(); renderPicker($("pickerSearch").value);
    }
  });
  $("travelBtn").addEventListener("click", () => {
    window._travelOn = !window._travelOn;
    $("travelBtn").classList.toggle("on", !!window._travelOn);
    $("travelBtn").textContent = window._travelOn ? "Travel mode: on" : "Travel mode";
    if (window._woPid) renderWorkout(window._woPid, window._woDi, window._woWeek);
  });
  const _exBtn = $("expressBtn");
  if (_exBtn) _exBtn.addEventListener("click", startExpress);
  const _duBtn = $("dungeonBtn");
  if (_duBtn) _duBtn.addEventListener("click", startDungeon);
  $("gymModeBtn").addEventListener("click", () => {
    const on = document.body.classList.toggle("gym-mode");
    $("gymModeBtn").textContent = on ? "Exit gym mode" : "Gym mode";
  });
  $("plateBtn").addEventListener("click", openPlates);
  $("voiceBtn").addEventListener("click", toggleVoiceLog);
  $("plateClose").addEventListener("click", () => $("plateVeil").classList.add("hidden"));
  $("plateVeil").addEventListener("click", e => { if (e.target.id === "plateVeil") $("plateVeil").classList.add("hidden"); });
  $("plateBar").addEventListener("input", calcPlates);
  $("plateTarget").addEventListener("input", calcPlates);
  $("coachBtn").addEventListener("click", generateCoachProgram);
  /* ---------- custom exercises: modal + delete wiring ---------- */
  $("customPrimary").innerHTML = Object.keys(MUSCLE_INFO).map(id => `<option value="${id}">${MUSCLE_INFO[id].name}</option>`).join("");
  $("customEquipment").innerHTML = Object.keys(eqName).map(q => `<option value="${q}">${eqName[q]}</option>`).join("");
  $("customSecondary").innerHTML = Object.keys(MUSCLE_INFO).map(id =>
    `<label class="check-pill"><input type="checkbox" value="${id}" /> ${MUSCLE_INFO[id].name}</label>`).join("");
  $("customClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
  $("addCustomBtn").addEventListener("click", openCustomModal);
  $("customCancel").addEventListener("click", closeCustomModal);
  $("customClose").addEventListener("click", closeCustomModal);
  $("customVeil").addEventListener("click", e => { if (e.target.id === "customVeil") closeCustomModal(); });
  $("customSave").addEventListener("click", saveCustomExercise);
  $("dDelete").addEventListener("click", async () => {
    const id = $("dDelete").dataset.id;
    const ex = byId(id);
    if (!ex || !ex.custom) return;
    const ok = await appConfirm(`Delete "${ex.name}"? It will be removed from your library. Programs that use it will show it as missing.`, { title: "Delete exercise", okText: "Delete", danger: true });
    if (!ok) return;
    saveCustomExercises(getCustomExercises().filter(c => c.id !== id));
    const i = EXERCISES.findIndex(e => e.id === id);
    if (i >= 0) EXERCISES.splice(i, 1);
    location.hash = "#/exercises";
  });
  /* ---------- in-app dialogs (replace native alert/confirm/prompt) ---------- */
  let _dlgResolve = null, _dlgMode = null;
  function _showDlg(o) {
    return new Promise(res => {
      _dlgMode = o.mode || "msg";
      _dlgResolve = res;
      $("dlgTitle").textContent = o.title || "FORGE";
      $("dlgMsg").textContent = o.msg;
      const ok = $("dlgOk");
      ok.textContent = o.okText || "OK";
      ok.className = "btn btn-sm " + (o.danger ? "btn-danger-solid" : "btn-primary");
      $("dlgCancel").classList.toggle("hidden", !o.cancelText);
      if (o.cancelText) $("dlgCancel").textContent = o.cancelText;
      const inp = $("dlgInput");
      if (o.mode === "prompt") {
        inp.value = o.defVal || "";
        inp.classList.remove("hidden");
        setTimeout(() => inp.focus(), 60);
      } else {
        inp.classList.add("hidden");
      }
      $("dlgVeil").classList.remove("hidden");
    });
  }
  function _closeDlg(val) {
    $("dlgVeil").classList.add("hidden");
    $("dlgInput").classList.add("hidden");
    _dlgMode = null;
    if (_dlgResolve) { const r = _dlgResolve; _dlgResolve = null; r(val); }
  }
  function appAlert(msg, title) { return _showDlg({ msg, title: title || "FORGE", okText: "OK" }); }
  function appConfirm(msg, o) {
    o = o || {};
    return _showDlg({ msg, title: o.title || "Are you sure?", okText: o.okText || "Confirm", cancelText: "Cancel", danger: o.danger });
  }
  function appPrompt(msg, defVal, title) {
    return _showDlg({ msg, title: title || "FORGE", okText: "OK", cancelText: "Cancel", mode: "prompt", defVal });
  }
  $("dlgOk").addEventListener("click", () => {
    if (_dlgMode === "prompt") _closeDlg($("dlgInput").value);
    else _closeDlg(true);
  });
  $("dlgCancel").addEventListener("click", () => _closeDlg(_dlgMode === "prompt" ? null : false));
  $("dlgVeil").addEventListener("click", e => { if (e.target.id === "dlgVeil") _closeDlg(_dlgMode === "prompt" ? null : false); });
  $("dlgInput").addEventListener("keydown", e => {
    if (_dlgMode !== "prompt") return;
    if (e.key === "Enter") $("dlgOk").click();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("dlgVeil").classList.contains("hidden")) _closeDlg(false); });

  initCheckin();
  $("checkinBtn").addEventListener("click", openCheckin);
  applyA11y(); applyAdvanced();
  $("formCheckBtn").addEventListener("click", openFormCheck);
  $("formClose").addEventListener("click", stopFormCheck);
  $("formVeil").addEventListener("click", e => { if (e.target.id === "formVeil") stopFormCheck(); });
  $("formStart").addEventListener("click", startFormCheck);
  $("formStop").addEventListener("click", stopFormCheck);
  // quiz
  document.addEventListener("click", e => {
    if (e.target.closest("#quizBtn")) { openQuiz(); return; }
    if (e.target.closest("#quizClose") || e.target.id === "quizVeil") { closeQuiz(); return; }
    const qv = e.target.closest("[data-qv]");
    if (qv && quizState) {
      const q = QUIZ_QUESTIONS[quizState.step];
      quizState.answers[q.key] = q.key === "days" ? parseInt(qv.dataset.qv, 10) : qv.dataset.qv;
      quizState.step++;
      if (quizState.step < QUIZ_QUESTIONS.length) renderQuizStep();
      else renderQuizResult();
      return;
    }
    if (e.target.closest("#quizBack") && quizState) { quizState.step--; renderQuizStep(); return; }
    if (e.target.closest("#quizAgain")) { quizState = { step: 0, answers: {} }; renderQuizStep(); return; }
    if (e.target.closest("#quizGo")) { closeQuiz(); return; }
  });
  const syncOffline = () => $("offlineBar").classList.toggle("hidden", navigator.onLine);
  window.addEventListener("online", syncOffline);
  window.addEventListener("offline", syncOffline);
  syncOffline();
  router();
})();
