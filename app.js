/* FORGE — 3D gym training app */
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
    const baseMat = new THREE.MeshStandardMaterial({ color: vTheme.base, roughness: 0.52, metalness: 0.10 });
    const neutralMat = new THREE.MeshStandardMaterial({ color: vTheme.neutral, roughness: 0.62, metalness: 0.06 });
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

    /* ---- head & neck (refined) ---- */
    ball(0.185, null, 0, 3.42, 0.015);
    const jaw = ball(0.115, null, 0, 3.315, 0.045); jaw.scale.set(0.95, 0.82, 0.9);
    part(new THREE.CylinderGeometry(0.075, 0.095, 0.18, 18), null, 0, 3.12, 0);

    /* ---- torso: organic lathe core + muscle overlays ---- */
    const profile = [
      [0.012, 1.90], [0.155, 1.92], [0.198, 2.00], [0.186, 2.14], [0.172, 2.28],
      [0.180, 2.42], [0.205, 2.56], [0.228, 2.68], [0.232, 2.76], [0.210, 2.86],
      [0.150, 2.94], [0.096, 3.00], [0.072, 3.07]
    ].map(p => new THREE.Vector2(p[0], p[1]));
    const torsoCore = new THREE.Mesh(new THREE.LatheGeometry(profile, 30), neutralMat);
    body.add(torsoCore);
    // traps — sloped capsules from neck to shoulders
    for (const s of [-1, 1])
      capMesh(0.085, V3(s * 0.05, 3.03, -0.01), V3(s * 0.30, 2.90, -0.02), "traps");
    // pecs — flatter, blended
    for (const s of [-1, 1]) {
      const p = ball(0.145, "chest", s * 0.14, 2.70, 0.145);
      p.scale.set(1.30, 0.72, 0.48);
    }
    // abs — six low blocks reading as definition, not attachments
    for (const r of [0, 1, 2]) for (const s of [-1, 1]) {
      const ab = ball(0.068, "abs", s * 0.066, 2.48 - r * 0.12, 0.148);
      ab.scale.set(1.25, 0.95, 0.50);
    }
    // obliques
    for (const s of [-1, 1])
      capMesh(0.058, V3(s * 0.185, 2.52, 0.055), V3(s * 0.205, 2.26, 0.045), "obliques");
    // lats — smooth flared wings hugging the back
    for (const s of [-1, 1]) {
      const l = ball(0.150, "lats", s * 0.19, 2.56, -0.125);
      l.scale.set(0.50, 1.25, 0.42); l.rotation.z = s * 0.12;
    }
    // upper back
    const ub = ball(0.150, "back", 0, 2.70, -0.140); ub.scale.set(1.25, 0.70, 0.42);
    for (const s of [-1, 1])                                   // erector spinae
      capMesh(0.060, V3(s * 0.070, 2.22, -0.150), V3(s * 0.070, 1.98, -0.150), "lower-back");
    const pelvis = ball(0.215, null, 0, 1.845, 0); pelvis.scale.set(1.02, 0.72, 0.82);
    for (const s of [-1, 1]) {                                 // glutes
      const gl = ball(0.16, "glutes", s * 0.15, 1.74, -0.115);
      gl.scale.set(1, 1.12, 0.85);
      ball(0.10, "glutes", s * 0.235, 1.83, -0.05);
    }
    // shoulder blend — smooths arm into torso
    for (const s of [-1, 1]) ball(0.115, null, s * 0.27, 2.82, 0);

    /* ---- arms (grouped at shoulder, slight A-pose) ---- */
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(s * 0.38, 2.84, 0);
      ball(0.125, "front-delt", 0, 0.02, 0.095, g);
      const sd = ball(0.135, "side-delt", s * 0.055, 0.0, 0.0, g);
      sd.scale.set(0.95, 1.15, 0.95);
      ball(0.115, "rear-delt", 0, 0.02, -0.10, g);
      capMesh(0.105, V3(s * 0.03, -0.08, 0.05), V3(s * 0.045, -0.44, 0.055), "biceps", g);
      const peak = ball(0.10, "biceps", s * 0.038, -0.20, 0.058, g);
      peak.scale.set(1, 1.3, 1);
      capMesh(0.10, V3(s * 0.03, -0.08, -0.055), V3(s * 0.045, -0.44, -0.06), "triceps", g);
      ball(0.075, null, s * 0.05, -0.50, 0, g);                // elbow
      // forearm in its own group for a natural slight bend + articulated hand
      const foreG = new THREE.Group();
      foreG.position.set(s * 0.05, -0.50, 0);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.062, 0.44, 20), matFor("forearms"));
      fore.position.set(s * 0.005, -0.24, 0.005);
      fore.userData.muscle = "forearms"; muscleMeshes.push(fore); foreG.add(fore);
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.095, 0.038), neutralMat);
      palm.position.set(s * 0.01, -0.51, 0.008); foreG.add(palm);
      for (let f = 0; f < 4; f++) {
        const fg = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.055, 4, 10), neutralMat);
        fg.position.set(s * (0.01 - 0.027 + f * 0.018), -0.585, 0.012);
        fg.rotation.x = 0.35;
        foreG.add(fg);
      }
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.045, 4, 10), neutralMat);
      thumb.position.set(s * 0.048, -0.52, 0.02);
      thumb.rotation.z = s * -0.5; thumb.rotation.x = 0.3;
      foreG.add(thumb);
      foreG.rotation.x = -0.14;
      foreG.rotation.z = s * 0.05;
      g.add(foreG);
      g.rotation.z = s * 0.13;
      body.add(g);
    }

    /* ---- legs ---- */
    for (const s of [-1, 1]) {
      capMesh(0.13, V3(s * 0.16, 1.64, 0.08), V3(s * 0.17, 1.10, 0.08), "quads");
      const tear = ball(0.115, "quads", s * 0.15, 1.20, 0.085);   // vastus medialis teardrop
      tear.scale.set(1, 1.35, 1);
      capMesh(0.095, V3(s * 0.205, 1.58, 0.03), V3(s * 0.215, 1.16, 0.03), "quads"); // outer sweep
      capMesh(0.092, V3(s * 0.125, 1.62, -0.085), V3(s * 0.13, 1.10, -0.085), "hamstrings");
      capMesh(0.092, V3(s * 0.20, 1.62, -0.085), V3(s * 0.205, 1.10, -0.085), "hamstrings");
      ball(0.085, null, s * 0.172, 1.02, 0.03);                   // knee
      ball(0.088, "calves", s * 0.13, 0.88, -0.055);              // calf heads
      ball(0.088, "calves", s * 0.215, 0.88, -0.055);
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.058, 0.36, 20), matFor("calves"));
      calf.position.set(s * 0.172, 0.62, -0.05);
      calf.userData.muscle = "calves"; muscleMeshes.push(calf); body.add(calf);
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
    const pointers = new Map();
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
        if (moved > 10) tapOK = false;
        rotY += dx * 0.008; targetRotY = rotY;
        rotX = Math.max(-0.3, Math.min(0.5, rotX + dy * 0.004));
        px = e.clientX; py = e.clientY;
      }
      lastAct = Date.now();
    });
    function pointerEnd(e) {
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
      if (opts.autoRotate && !dragging && pointers.size === 0 && Date.now() - lastAct > 3000) {
        rotY += 0.004; targetRotY = rotY;
      }
      rotY += (targetRotY - rotY) * 0.12;
      body.rotation.y = rotY; body.rotation.x = rotX;
      ring.rotation.z += 0.002;
      renderer.render(scene, camera);
    })();

    const ro = new ResizeObserver(() => {
      const w = W(), h = H();
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return {
      highlight,
      setAccent,
      setHeat,
      setView(v) { targetRotY = (v === "back") ? Math.PI : 0; rotY = targetRotY; },
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
  }
  function openSettings() {
    const grid = $("accentGrid");
    const cur = currentAccent().id;
    grid.innerHTML = ACCENTS.map(a =>
      `<button class="accent-pick ${a.id === cur ? "on" : ""}" data-accent="${a.id}">` +
      `<span class="swatch" style="background:${a.color}"></span>${a.name}</button>`).join("");
    syncSettingsUI();
    $("settingsVeil").classList.remove("hidden");
  }
  function closeSettings() { $("settingsVeil").classList.add("hidden"); }
  function syncSettingsUI() {
    const s = getSettings();
    document.querySelectorAll("#unitSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.unit === s.units));
    document.querySelectorAll("#speedSeg .seg").forEach(b => b.classList.toggle("on", parseFloat(b.dataset.speed) === s.demoSpeed));
    document.querySelectorAll("#langSeg .seg").forEach(b => b.classList.toggle("on", b.dataset.lang === s.lang));
    const tg = (id, on) => $(id).setAttribute("aria-checked", on ? "true" : "false");
    tg("tglSound", s.sound); tg("tglMotion", s.reduceMotion); tg("tglDemoPlay", s.demoAutoplay);
    tg("tglAutoRest", s.autoRest); tg("tglVoice", s.voiceCues);
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
      set_title: "Settings", set_accent: "Accent color", set_accent_note: "Applies across the app, including the 3D body ring.",
      set_units: "Units", set_myeq: "My equipment", set_myeq_note: "Used by the program quiz and exercise swaps. Empty means everything.",
      set_lang: "Language", set_workout: "Workout", set_sound: "Rest timer sound", set_motion: "Reduce motion",
      set_demos: "Exercise demos", set_autoplay: "Autoplay", set_speed: "Demo speed", set_data: "Data",
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
      set_title: "Réglages", set_accent: "Couleur d'accent", set_accent_note: "S'applique partout, y compris l'anneau du corps 3D.",
      set_units: "Unités", set_myeq: "Mon équipement", set_myeq_note: "Utilisé par le quiz et les substitutions. Vide = tout.",
      set_lang: "Langue", set_workout: "Séance", set_sound: "Son du minuteur", set_motion: "Réduire les animations",
      set_demos: "Démos d'exercices", set_autoplay: "Lecture auto", set_speed: "Vitesse des démos", set_data: "Données",
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
  const DEFAULT_SETTINGS = { units: "kg", sound: true, demoAutoplay: true, demoSpeed: 1, reduceMotion: false, myEquipment: [], lang: "en", autoRest: true, restShort: 60, restLong: 180, voiceCues: false };
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
  function daysAgo(dateStr) {
    const d = new Date(dateStr + "T12:00:00"), n = new Date();
    n.setHours(12, 0, 0, 0);
    return Math.max(0, Math.round((n - d) / 864e5));
  }
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
  function workoutStreak() {
    const days = [...new Set(getLog().map(w => w.date))].sort();
    if (!days.length) return 0;
    let streak = 0;
    const d = new Date(); d.setHours(12, 0, 0, 0);
    if (!days.includes(fmtDate(d))) d.setDate(d.getDate() - 1);
    while (days.includes(fmtDate(d))) { streak++; d.setDate(d.getDate() - 1); }
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
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const eqName = { bodyweight: "Bodyweight", barbell: "Barbell", dumbbell: "Dumbbell", cable: "Cable", machine: "Machine", kettlebell: "Kettlebell", band: "Band" };
  const lvlDots = l => l === "beginner" ? "●○○" : l === "intermediate" ? "●●○" : "●●●";
  const byId = id => EXERCISES.find(e => e.id === id);
  let viewers = [];
  function clearViewers() { viewers.forEach(v => v.dispose()); viewers = []; }
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
  const views = ["home", "exercises", "detail", "body", "favorites", "programs", "program", "workout", "progress", "builder"];
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
    $("statEx").textContent = EXERCISES.length;
    $("footEx").textContent = EXERCISES.length;
    const counts = {};
    EXERCISES.forEach(e => counts[e.primary] = (counts[e.primary] || 0) + 1);
    $("muscleGrid").innerHTML = Object.keys(MUSCLE_INFO).map(id =>
      `<a class="muscle-card" href="#/exercises?m=${id}"><b>${MUSCLE_INFO[id].name}</b><span>${counts[id] || 0} exercises</span></a>`
    ).join("");
    const v = createBodyViewer($("hero3d"), { autoRotate: !getSettings().reduceMotion, dist: 5.6 });
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
    $("exCount").textContent = `· ${list.length}`;
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
      `<span class="tag volt-tag">${MUSCLE_INFO[ex.primary].name}</span>
       <span class="tag">${eqName[ex.equipment]}</span>
       <span class="tag">${cap1(ex.level)}</span>`;
    syncDetailFav(ex);
    $("dSteps").innerHTML = ex.steps.map(s => `<li>${esc(s)}</li>`).join("");
    const cues = FORM_CUES[ex.primary] || FORM_CUES.default;
    $("dSteps").innerHTML += `<li class="cue-header"><b>Form cues:</b><ul class="cues">${cues.map(c => `<li>✓ ${esc(c)}</li>`).join("")}</ul></li>`;
    $("dMuscles").innerHTML =
      `<span class="tag primary" data-goto-muscle="${ex.primary}">${MUSCLE_INFO[ex.primary].name} · primary</span>` +
      ex.secondary.map(s => { const g = groupOf(s); return `<span class="tag" data-goto-muscle="${g}">${MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g}</span>`; }).join("");
    const sim = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary).slice(0, 4);
    $("dSimilar").innerHTML = sim.map(x =>
      `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]} · ${cap1(x.level)}</span></div>`
    ).join("");
    const myEq = getSettings().myEquipment || [];
    const swaps = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary && x.equipment !== ex.equipment)
      .sort((a, b) => (myEq.includes(b.equipment) ? 1 : 0) - (myEq.includes(a.equipment) ? 1 : 0))
      .slice(0, 3);
    $("dSwaps").innerHTML = swaps.length ? swaps.map(x =>
      `<button class="swap-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span class="tag">${eqName[x.equipment]}</span>${window.FORGE_ICON("arrow-right")}</button>`
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
    const v = createBodyViewer($("detail3d"), { autoRotate: !getSettings().reduceMotion });
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
  });

  // BODY MAP
  function renderBody(selected) {
    const v = createBodyViewer($("body3d"), {
      autoRotate: !getSettings().reduceMotion, dist: 6.1,
      onMuscleClick: mid => selectMuscle(groupOf(mid))
    });
    viewers.push(v);
    const setV = front => {
      v.setView(front ? "front" : "back");
      $("bFront").classList.toggle("on", front); $("bBack").classList.toggle("on", !front);
    };
    const syncMode = () => {
      const mode = window._bodyMode || "muscles";
      $("bMuscles").classList.toggle("on", mode === "muscles");
      $("bRecovery").classList.toggle("on", mode === "recovery");
      $("bFatigue").classList.toggle("on", mode === "fatigue");
      $("heatLegend").classList.toggle("hidden", mode === "muscles");
    };
    window._syncBodyMode = syncMode;
    window._bodyMode = "muscles";
    $("bFront").onclick = () => setV(true);
    $("bBack").onclick = () => setV(false);
    $("bMuscles").onclick = () => { window._bodyMode = "muscles"; syncMode(); selectMuscle(window._lastMuscle || "chest"); };
    $("bRecovery").onclick = () => { window._bodyMode = "recovery"; syncMode(); v.setHeat(muscleHeat()); };
    $("bFatigue").onclick = () => { window._bodyMode = "fatigue"; syncMode(); v.setHeat(muscleFatigue()); };
    window._bodyViewer = v;
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
    $("muscleInfo").innerHTML = `<h3>${info.name}</h3><p class="desc">${info.desc}</p>`;
    const list = EXERCISES.filter(e => e.primary === groupId || e.secondary.map(groupOf).includes(groupId));
    $("bodyExercises").innerHTML = list.length
      ? `<p class="muted" style="margin-bottom:10px">${list.length} exercise${list.length > 1 ? "s" : ""}</p>` +
        list.map(x => `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]}</span></div>`).join("")
      : `<p class="muted">No exercises yet.</p>`;
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
          <input type="text" value="${esc(d.name)}" data-bday="${di}" maxlength="40" aria-label="Day name" />
          <button class="icon-btn" data-bdel-day="${di}" aria-label="Delete day">${window.FORGE_ICON("x")}</button>
        </div>
        ${d.exercises.map((x, xi) => {
          const ex = byId(x.id);
          return `<div class="bex-row">
            <b>${esc(ex ? ex.name : x.id)}</b>
            <input type="number" min="1" max="20" value="${x.sets}" data-bset="${di}:${xi}" aria-label="Sets" /><span class="lbl">sets</span>
            <input type="text" value="${esc(x.reps)}" data-brep="${di}:${xi}" maxlength="12" aria-label="Reps" style="width:64px" /><span class="lbl">reps</span>
            <button class="icon-btn" data-bdel-ex="${di}:${xi}" aria-label="Remove exercise">${window.FORGE_ICON("x")}</button>
          </div>`;
        }).join("")}
        <button class="btn btn-ghost btn-sm" data-bpick="${di}" style="margin-top:10px">Add exercises</button>
      </div>`).join("");
  }
  function openPicker(di) {
    pickerDay = di;
    $("pickerClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
    $("pickerSearch").value = "";
    renderPicker("");
    $("pickerVeil").classList.remove("hidden");
  }
  function closePicker() { $("pickerVeil").classList.add("hidden"); pickerDay = -1; }
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
    if (!builder.name) { alert("Give your program a name."); return; }
    const days = builder.days.filter(d => d.exercises.length > 0);
    if (!days.length) { alert("Add at least one exercise to a day."); return; }
    const id = "custom-" + Date.now().toString(36);
    const prog = {
      id, name: builder.name, tagline: builder.tagline, custom: true,
      level: "custom", daysPerWeek: days.length, weeks: 4, equipment: "Mixed",
      days: days.map(d => ({ name: d.name.trim() || "Day", exercises: d.exercises.map(x => ({ id: x.id, sets: x.sets, reps: x.reps })) }))
    };
    const all = getCustomPrograms(); all.push(prog); saveCustomPrograms(all);
    location.hash = "#/program/" + id;
  }

  // PLATE CALCULATOR
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
    if (remaining > 0.01) {
      $("plateResult").innerHTML = `<p class="muted">Closest: ${used.length ? used.join(" + ") : "bar only"} per side (${(remaining * 2).toFixed(1)} ${units} short).</p>`;
    } else {
      $("plateResult").innerHTML = used.length
        ? `<p style="font-size:16px"><b>Per side:</b> ${used.join(" + ")} <span class="muted">${units}</span></p>`
        : `<p class="muted">Just the bar.</p>`;
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
    "back": ["Lead with your elbows", "Squeeze at the top for 1 second", "Don't swing — control the weight"],
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

  // SHARE CARD
  function generateShareCard(entry) {
    const canvas = $("shareCanvas");
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    // background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0b0e13"); grad.addColorStop(1, "#1a1f2a");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    // accent bar
    ctx.fillStyle = "#a3e635"; ctx.fillRect(0, 0, W, 12);
    // title
    ctx.fillStyle = "#fff"; ctx.font = "bold 72px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("FORGE", W/2, 140);
    ctx.font = "36px sans-serif"; ctx.fillStyle = "#888";
    ctx.fillText(entry.dayName || "Workout", W/2, 200);
    ctx.fillText(entry.date, W/2, 250);
    // stats
    const totalSets = entry.exercises.reduce((a, x) => a + x.sets.length, 0);
    const totalVol = entry.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + s.weight * s.reps, 0), 0);
    ctx.fillStyle = "#fff"; ctx.font = "bold 96px sans-serif";
    ctx.fillText(entry.exercises.length, W/2 - 200, 450);
    ctx.fillText(totalSets, W/2 + 200, 450);
    ctx.font = "32px sans-serif"; ctx.fillStyle = "#888";
    ctx.fillText("exercises", W/2 - 200, 500);
    ctx.fillText("sets", W/2 + 200, 500);
    ctx.fillStyle = "#a3e635"; ctx.font = "bold 80px sans-serif";
    ctx.fillText(fmtW(totalVol), W/2, 650);
    ctx.font = "32px sans-serif"; ctx.fillStyle = "#888";
    ctx.fillText("total volume", W/2, 700);
    // exercises list
    ctx.textAlign = "left"; ctx.font = "28px sans-serif"; ctx.fillStyle = "#ccc";
    let y = 800;
    entry.exercises.slice(0, 6).forEach(x => {
      const ex = byId(x.id);
      if (ex && y < 1000) {
        ctx.fillText(`• ${ex.name} — ${x.sets.length} sets`, 120, y);
        y += 45;
      }
    });
    return canvas.toDataURL("image/png");
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
    if (!pose) { $("formFeedback").textContent = "No body detected — step back."; return; }
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
      msg = `Rep ${squatReps} — nice!`;
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
    if (!SR) { alert("Voice not supported in this browser."); return; }
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
        $("voiceStatus").textContent = `Heard: "${text}" — try "10 reps 60 kilos"`;
      }
    };
    voiceRec.onend = () => { voiceRec = null; setVoiceBtn(false); };
    voiceRec.start();
    setVoiceBtn(true);
    $("voiceStatus").textContent = "Listening… say \"10 reps 60 kilos\"";
  }

  // AI COACH — generates a program from your history
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

  // ACHIEVEMENTS
  function streakCalendar(log) {
    const dates = new Set(log.map(w => w.date));
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let html = `<div class="cal-months">`;
    let lastMonth = -1;
    for (let i = 55; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      const isToday = i === 0;
      const m = d.getMonth();
      if (m !== lastMonth) {
        if (lastMonth !== -1) html += `</div><div class="cal-month"><div class="cal-month-label">${months[m]}</div><div class="cal-grid">`;
        else html += `<div class="cal-month"><div class="cal-month-label">${months[m]}</div><div class="cal-grid">`;
        lastMonth = m;
      }
      html += `<div class="cal-day ${dates.has(key) ? "has" : ""} ${isToday ? "today" : ""}" title="${key}">${d.getDate()}</div>`;
    }
    return html + `</div></div>`;
  }
  const BADGES = [
    { id: "first", icon: "target", name: "First workout", desc: "Log your first workout", check: log => log.length >= 1 },
    { id: "ten", icon: "flame", name: "Getting serious", desc: "Log 10 workouts", check: log => log.length >= 10 },
    { id: "fifty", icon: "dumbbell", name: "Committed", desc: "Log 50 workouts", check: log => log.length >= 50 },
    { id: "streak7", icon: "zap", name: "Week streak", desc: "7-day streak", check: (log, streak) => streak >= 7 },
    { id: "streak30", icon: "star", name: "Month streak", desc: "30-day streak", check: (log, streak) => streak >= 30 },
    { id: "vol10k", icon: "dumbbell", name: "Volume king", desc: "10,000 kg in one workout", check: log => log.some(w => w.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + s.weight * s.reps, 0), 0) >= 10000) },
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
  function renderBodyTab(body) {
    const measures = getMeasures();
    const units = getSettings().units;
    body.innerHTML = `
      <h3>Body measurements</h3>
      <div class="measure-grid">
        <div class="builder-field"><label>Weight (${units})</label><input type="number" id="mWeight" step="any" placeholder="–" /></div>
        <div class="builder-field"><label>Waist (${units === "kg" ? "cm" : "in"})</label><input type="number" id="mWaist" step="any" placeholder="–" /></div>
        <div class="builder-field"><label>Chest (${units === "kg" ? "cm" : "in"})</label><input type="number" id="mChest" step="any" placeholder="–" /></div>
        <div class="builder-field"><label>Arms (${units === "kg" ? "cm" : "in"})</label><input type="number" id="mArms" step="any" placeholder="–" /></div>
      </div>
      <button class="btn btn-primary btn-sm" id="mSave">Log measurements</button>
      <div id="mChart"></div>
      <h3 style="margin-top:24px">Progress photos</h3>
      <input type="file" id="photoInput" accept="image/*" style="margin:12px 0" />
      <div class="photo-grid" id="photoGrid"></div>`;
    renderMeasureChart();
    renderPhotos();
    $("mSave").addEventListener("click", () => {
      const entry = { date: fmtDate(new Date()), ts: Date.now() };
      const w = parseFloat($("mWeight").value), wa = parseFloat($("mWaist").value);
      const c = parseFloat($("mChest").value), a = parseFloat($("mArms").value);
      if (w) entry.weight = w; if (wa) entry.waist = wa; if (c) entry.chest = c; if (a) entry.arms = a;
      if (!entry.weight && !entry.waist && !entry.chest && !entry.arms) { alert("Enter at least one measurement."); return; }
      const all = getMeasures(); all.push(entry); saveMeasures(all);
      renderBodyTab(body);
    });
    $("photoInput").addEventListener("change", handlePhotoUpload);
  }
  function renderMeasureChart() {
    const measures = getMeasures().filter(m => m.weight);
    if (measures.length < 2) {
      $("mChart").innerHTML = `<p class="muted">Log weight twice to see a trend.</p>`;
      return;
    }
    const canvas = document.createElement("canvas");
    $("mChart").innerHTML = `<div class="chart-wrap"><h4>Weight trend</h4></div>`;
    $("mChart").querySelector(".chart-wrap").appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 600, h = canvas.height = 200;
    const vals = measures.map(m => m.weight);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    ctx.strokeStyle = "#a3e635"; ctx.lineWidth = 3; ctx.beginPath();
    vals.forEach((v, i) => {
      const x = 30 + (i / (vals.length - 1)) * (w - 60);
      const y = h - 30 - ((v - min) / range) * (h - 60);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = "#888"; ctx.font = "12px sans-serif";
    ctx.fillText(max.toFixed(1), 5, 20); ctx.fillText(min.toFixed(1), 5, h - 10);
  }
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
        if (dataUrl.length > 1500000) { alert("Photo too large, try a smaller one."); return; }
        const photos = getPhotos();
        photos.push({ date: fmtDate(new Date()), ts: Date.now(), src: dataUrl });
        savePhotos(photos);
        renderPhotos();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
  function renderPhotos() {
    const photos = getPhotos().sort((a, b) => a.ts - b.ts);
    const grid = $("photoGrid");
    if (!grid) return;
    grid.innerHTML = photos.map((p, i) => `
      <div class="photo-item">
        <img src="${p.src}" alt="Progress photo ${p.date}" />
        <div class="photo-date">${p.date}</div>
        <button class="photo-del" data-pdel="${i}" aria-label="Delete photo">×</button>
      </div>`).join("") || `<p class="muted">No photos yet.</p>`;
    grid.querySelectorAll("[data-pdel]").forEach(b => {
      b.addEventListener("click", () => {
        const all = getPhotos(); all.splice(parseInt(b.dataset.pdel, 10), 1); savePhotos(all); renderPhotos();
      });
    });
  }

  function renderProgress(tab) {
    tab = tab || "overview";
    document.querySelectorAll("#progTabs .chip").forEach(c => c.classList.toggle("on", c.dataset.ptab === tab));
    const log = getLog();
    const body = $("progressBody");
    if (tab === "body") { renderBodyTab(body); return; }
    if (tab === "badges") { renderBadgesTab(body); return; }
    if (tab === "challenges") { renderChallengesTab(body); return; }
    if (!log.length) {
      body.innerHTML = `<div class="empty-note"><p><b>No workouts logged yet.</b></p><p>Finish a workout and it will show up here with your history, records and volume.</p></div>`;
      return;
    }
    if (tab === "overview") {
      const totalSets = log.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.length, 0), 0);
      const totalVol = log.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + (s.weight || 0) * s.reps, 0), 0), 0);
      body.innerHTML = `<div class="stat-grid">
        <div class="stat-card"><b>${log.length}</b><span>workouts logged</span></div>
        <div class="stat-card"><b>${workoutStreak()}</b><span>day streak</span></div>
        <div class="stat-card"><b>${totalSets}</b><span>total sets</span></div>
        <div class="stat-card"><b>${fmtW(totalVol)}</b><span>total volume</span></div>
        <div class="stat-card"><b>${recoveryScore()}%</b><span>recovery</span></div>
      </div>
      ${checkDeload() ? `<div class="onerm-box" style="border-color:#f59e0b"><b>${window.FORGE_ICON ? window.FORGE_ICON("triangle-alert") : ""} Deload suggested:</b> <span class="muted">Volume dropping — consider a light week.</span></div>` : ""}
      <h3 style="margin-top:20px">Last 8 weeks</h3>
      ${streakCalendar(log)}
      <p class="muted">Volume = weight × reps across every logged set.</p>`;
    } else if (tab === "history") {
      const byDate = {};
      log.forEach(w => { (byDate[w.date] = byDate[w.date] || []).push(w); });
      body.innerHTML = Object.keys(byDate).sort().reverse().map(dt => {
        const ws = byDate[dt];
        const sets = ws.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.length, 0), 0);
        const dstr = new Date(dt + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        return `<div class="hist-day"><div class="hd"><b>${dstr}</b><span class="muted">${sets} sets</span></div><ul>` +
          ws.map(w => `<li>${esc(w.programName)} — ${esc(w.dayName)} (${w.exercises.length} exercises)</li>`).join("") + `</ul></div>`;
      }).join("");
    } else if (tab === "records") {
      const recs = [];
      EXERCISES.forEach(ex => {
        const pr = exercisePR(ex.id);
        if (pr && (pr.weight > 0 || pr.reps > 0)) recs.push({ ex, pr });
      });
      recs.sort((a, b) => b.pr.weight - a.pr.weight || b.pr.reps - a.pr.reps);
      body.innerHTML = recs.length ? recs.map(({ ex, pr }) =>
        `<div class="rec-row">${window.FORGE_ICON("trophy")}<b>${esc(ex.name)}</b><span>${pr.weight > 0 ? fmtW(pr.weight) + " × " + pr.reps : pr.reps + " reps"}</span></div>`
      ).join("") : `<div class="empty-note"><p>No records yet. Log a workout to set your first.</p></div>`;
    } else {
      const vol = volumeByMuscle(28);
      const entries = Object.keys(vol).map(g => ({ g, n: vol[g] })).sort((a, b) => b.n - a.n);
      const max = entries.length ? entries[0].n : 1;
      body.innerHTML = entries.length
        ? `<p class="muted" style="margin-bottom:14px">Sets per muscle group, last 28 days.</p>` +
          entries.map(({ g, n }) => `<div class="vol-row"><span class="vn">${MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g}</span><span class="bar"><i style="width:${Math.round(n / max * 100)}%"></i></span><span class="vc">${n} sets</span></div>`).join("")
        : `<div class="empty-note"><p>Nothing in the last 28 days.</p></div>`;
    }
  }

  // PROGRAMS
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
      ? `<a class="btn btn-primary" href="#/workout/${p.id}/${ni}">Continue: ${esc(p.days[ni].name)}</a>
         <button class="btn btn-ghost" id="pgStop">Stop program</button>`
      : `<button class="btn btn-primary" id="pgStart">Start this program</button>`;
    const st = $("pgStart");
    if (st) st.onclick = () => { setActiveProg(p.id); renderProgram(p.id); };
    const sp = $("pgStop");
    if (sp) sp.onclick = () => { setActiveProg(null); renderProgram(p.id); };
    if (p.custom) {
      $("pgActions").innerHTML += ` <button class="btn btn-ghost btn-sm danger" id="pgDelete">${t("b_delete")}</button>`;
      $("pgDelete").onclick = () => {
        if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
          if (getActiveProg() === p.id) setActiveProg(null);
          deleteCustomProgram(p.id);
          location.hash = "#/programs";
        }
      };
    }
    $("pgDays").innerHTML = p.days.map((d, di) => {
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
          return `<div class="mini-card" data-ex="${x.id}"><b>${esc(ex.name)}</b><span>${x.sets} × ${esc(x.reps)}</span></div>`;
        }).join("")}
        </div>
      </div>`;
    }).join("");
  }

  // WORKOUT MODE
  let timerInt = null, timerLeft = 0, currentWorkout = null;
  function getRestSeconds(ex) {
    const s = getSettings();
    if (!ex) return s.restShort;
    // heavy compounds get long rest
    if (ex.equipment === "barbell" || ex.level === "advanced") return s.restLong;
    return s.restShort;
  }
  function startTimer(sec) {
    clearInterval(timerInt);
    timerLeft = sec;
    $("timerDisplay").textContent = fmtT(timerLeft);
    timerInt = setInterval(() => {
      timerLeft--;
      $("timerDisplay").textContent = fmtT(Math.max(0, timerLeft));
      if (timerLeft <= 0) {
        clearInterval(timerInt); timerInt = null;
        beep();
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
  function renderWorkout(pid, di) {
    clearInterval(timerInt); timerInt = null; timerLeft = 0;
    const p = progById(pid);
    const d = p && p.days[di];
    if (!d) { location.hash = "#/program/" + pid; return; }
    currentWorkout = d;
    if (!currentWorkout._pairs) currentWorkout._pairs = new Set();
    $("woTitle").textContent = d.name;
    $("woSub").textContent = p.name;
    $("woList").innerHTML = d.exercises.map((x, xi) => {
      const ex = byId(x.id);
      const isBW = ex.equipment === "Bodyweight";
      const lw = lastWeightKg(x.id);
      const repsNum = parseInt(x.reps) || 8;
      const rows = Array.from({ length: x.sets }, (_, si) => {
        const wVal = lw != null ? fromKg(lw) : "";
        return `<div class="set-row2">
          <button class="set-done" data-x="${xi}" data-s="${si}" aria-label="Mark set ${si + 1} done">${window.FORGE_ICON("check")}</button>
          <span class="set-num">Set ${si + 1}</span>
          <span class="set-reps"><input type="number" min="1" value="${repsNum}" data-x="${xi}" data-s="${si}" data-f="reps" aria-label="Reps"> reps</span>
          ${isBW ? `<span class="set-bw">Bodyweight</span>`
                 : `<input class="set-weight" type="number" min="0" step="any" placeholder="–" value="${wVal}" data-x="${xi}" data-s="${si}" data-f="weight" aria-label="Weight"><span class="set-unit">${unitLabel()}</span>`}
        </div>`;
      }).join("");
      const pairs = currentWorkout._pairs;
      const isPaired = pairs.has(xi) || pairs.has(xi - 1);
      const pairLabel = pairs.has(xi) ? "A1" : pairs.has(xi - 1) ? "A2" : "";
      const sug = suggestWeight(x.id);
      return `<div class="wo-ex ${isPaired ? "superset" : ""}">
        <div class="wo-ex-head">
          <b data-ex="${x.id}" class="wo-link">${esc(ex.name)}</b>
          ${pairLabel ? `<span class="superset-badge">${pairLabel}</span>` : ""}
          <span class="tag">${x.sets} × ${esc(x.reps)}</span>
        </div>
        ${sug && sug.suggested > 0 ? `<p class="muted" style="font-size:13px;margin:4px 0;display:flex;align-items:center;gap:6px">${window.FORGE_ICON ? window.FORGE_ICON("lightbulb") : ""} Last: ${fmtW(sug.last)} × ${sug.reps} → try ${fmtW(sug.suggested)}</p>` : ""}
        <button class="guide-toggle" data-guide="${xi}">Form guide ${window.FORGE_ICON("chevron-down")}</button>
        ${xi < d.exercises.length - 1 ? `<button class="btn btn-ghost btn-sm" data-pair="${xi}" style="margin:6px 0">${pairs.has(xi) ? "Unpair" : "Pair as superset with next"}</button>` : ""}
        <ol class="steps wo-steps hidden" id="guide-${xi}">
          ${ex.steps.map(s => `<li>${esc(s)}</li>`).join("")}
        </ol>
        <div>${rows}</div>
        <span class="tag volt-tag wo-muscle">${MUSCLE_INFO[ex.primary].name}</span>
      </div>`;
    }).join("");
    $("timerDisplay").textContent = "0:00";
    $("woDone").classList.add("hidden");
    $("woFinish").classList.remove("hidden");
  }
  document.addEventListener("click", e => {
    const gt = e.target.closest(".guide-toggle");
    if (gt) {
      const panel = $("guide-" + gt.dataset.guide);
      const open = panel.classList.toggle("hidden");
      gt.classList.toggle("open", !open);
      return;
    }
    const sd = e.target.closest(".set-done");
    if (sd) {
      const wasHit = sd.classList.contains("hit");
      sd.classList.toggle("hit");
      if (!wasHit && getSettings().autoRest) {
        const xi = parseInt(sd.dataset.x, 10);
        const woEx = currentWorkout && currentWorkout.exercises[xi];
        const ex = woEx && byId(woEx.id);
        // superset pairs get short rest
        const isPair = currentWorkout && currentWorkout._pairs && (currentWorkout._pairs.has(xi) || currentWorkout._pairs.has(xi - 1));
        startTimer(isPair ? 30 : getRestSeconds(ex));
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
      renderWorkout(raw[1], parseInt(raw[2], 10));
      return;
    }
    const tp = e.target.closest("[data-timer]");
    if (tp) {
      const sec = parseInt(tp.dataset.timer, 10);
      clearInterval(timerInt);
      timerLeft = sec;
      $("timerDisplay").textContent = fmtT(timerLeft);
      timerInt = setInterval(() => {
        timerLeft--;
        $("timerDisplay").textContent = fmtT(Math.max(0, timerLeft));
        if (timerLeft <= 0) { clearInterval(timerInt); timerInt = null; beep(); }
      }, 1000);
      return;
    }
    if (e.target.closest("#timerStop")) { clearInterval(timerInt); timerInt = null; return; }
  });
  $("woFinish").addEventListener("click", () => {
    const raw = location.hash.replace(/^#\/?/, "").split("?")[0].split("/");
    const key = raw[1] + ":" + raw[2];
    const today = fmtDate(new Date());
    const p = progById(raw[1]);
    const d = p && p.days[parseInt(raw[2], 10)];
    const entry = { date: today, ts: Date.now(), programId: raw[1], programName: p ? p.name : "", dayName: d ? d.name : "", exercises: [] };
    if (d) d.exercises.forEach((x, xi) => {
      const sets = [];
      document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).forEach(btn => {
        const si = btn.dataset.s;
        const repsEl = document.querySelector(`input[data-f="reps"][data-x="${xi}"][data-s="${si}"]`);
        const wEl = document.querySelector(`input[data-f="weight"][data-x="${xi}"][data-s="${si}"]`);
        sets.push({ reps: Math.max(1, parseInt(repsEl && repsEl.value) || 0), weight: wEl ? toKg(parseFloat(wEl.value) || 0) : 0 });
      });
      if (sets.length) entry.exercises.push({ id: x.id, sets });
    });
    if (!entry.exercises.length) { alert("Mark at least one set as done to log this workout."); return; }
    const log = getLog(); log.push(entry); saveLog(log);
    checkBadges();
    window._lastEntry = entry;
    done[key] = done[key] || [];
    done[key].push(today); saveDone();
    $("woDone").classList.remove("hidden");
    $("woFinish").classList.add("hidden");
    clearInterval(timerInt); timerInt = null;
    window.scrollTo(0, 0);
  });
  $("shareCard").addEventListener("click", () => {
    if (!window._lastEntry) return;
    const dataUrl = generateShareCard(window._lastEntry);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `forge-workout-${window._lastEntry.date}.png`;
    a.click();
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
    else if (parts[0] === "workout" && parts[1] && parts[2] !== undefined) { show("workout"); renderWorkout(parts[1], parseInt(parts[2], 10)); }
    else if (parts[0] === "progress") { show("progress"); renderProgress("overview"); }
    else if (parts[0] === "builder") { show("builder"); newBuilder(); }
    else { show("home"); renderHome(); }
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
  [["tglSound", "sound"], ["tglMotion", "reduceMotion"], ["tglDemoPlay", "demoAutoplay"], ["tglAutoRest", "autoRest"], ["tglVoice", "voiceCues"]].forEach(([id, key]) => {
    $(id).addEventListener("click", () => {
      const s = getSettings(); s[key] = !s[key]; saveSettings(s); syncSettingsUI();
    });
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
  $("resetData").addEventListener("click", () => {
    if (confirm("Delete all favorites, workout history, records and settings? This cannot be undone.")) {
      localStorage.clear();
      location.reload();
    }
  });
  $("progTabs").addEventListener("click", e => {
    const c = e.target.closest("[data-ptab]"); if (!c) return;
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
  });
  $("bDays").addEventListener("input", e => {
    const dn = e.target.closest("[data-bday]");
    if (dn) { builder.days[parseInt(dn.dataset.bday, 10)].name = dn.value; return; }
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
  $("pickerClose").addEventListener("click", closePicker);
  $("pickerVeil").addEventListener("click", e => { if (e.target.id === "pickerVeil") closePicker(); });
  $("pickerSearch").addEventListener("input", e => renderPicker(e.target.value));
  $("pickerList").addEventListener("click", e => {
    const b = e.target.closest("[data-pick]"); if (!b || pickerDay < 0) return;
    const id = b.dataset.pick;
    const day = builder.days[pickerDay];
    if (!day.exercises.some(x => x.id === id)) {
      day.exercises.push({ id, sets: 3, reps: "10" });
      renderBuilder(); renderPicker($("pickerSearch").value);
    }
  });
  $("plateBtn").addEventListener("click", openPlates);
  $("voiceBtn").addEventListener("click", toggleVoiceLog);
  $("plateClose").addEventListener("click", () => $("plateVeil").classList.add("hidden"));
  $("plateVeil").addEventListener("click", e => { if (e.target.id === "plateVeil") $("plateVeil").classList.add("hidden"); });
  $("plateBar").addEventListener("input", calcPlates);
  $("plateTarget").addEventListener("input", calcPlates);
  $("coachBtn").addEventListener("click", generateCoachProgram);
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
  router();
})();
