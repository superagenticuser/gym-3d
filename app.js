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

    const VIEW_THEMES = {
      dark:  { base: 0x3b4356, neutral: 0x222836, ring: 0xd4ff3f, primary: 0x5e2a22 },
      light: { base: 0x94a1bb, neutral: 0x6b7690, ring: 0x4d7c0f, primary: 0x7a3a2a }
    };
    let vTheme = VIEW_THEMES[(document.documentElement.dataset.theme === "light") ? "light" : "dark"];

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
      new THREE.MeshBasicMaterial({ color: vTheme.ring, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
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
    part(new THREE.CylinderGeometry(0.070, 0.098, 0.28, 18), null, 0, 3.15, 0);
    // face — subtle features
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.65, metalness: 0 });
    const feat = (geo, x, y, z, mat) => {
      const m = new THREE.Mesh(geo, mat || darkMat); m.position.set(x, y, z); body.add(m); return m;
    };
    feat(new THREE.SphereGeometry(0.024, 14, 12), -0.064, 3.455, 0.158);
    feat(new THREE.SphereGeometry(0.024, 14, 12), 0.064, 3.455, 0.158);
    const nose = feat(new THREE.SphereGeometry(0.022, 12, 10), 0, 3.395, 0.185, neutralMat);
    nose.scale.set(0.8, 1.15, 0.9);
    feat(new THREE.BoxGeometry(0.075, 0.010, 0.012), 0, 3.335, 0.168);
    for (const s of [-1, 1]) {
      const ear = feat(new THREE.SphereGeometry(0.038, 12, 10), s * 0.178, 3.42, 0.01, neutralMat);
      ear.scale.set(0.45, 1.0, 0.7);
    }

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
    function setTheme(name) {
      vTheme = VIEW_THEMES[name] || VIEW_THEMES.dark;
      neutralMat.color.setHex(vTheme.neutral);
      ring.material.color.setHex(vTheme.ring);
      highlight(hlState.p, hlState.s, hlState.soft);
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
      setTheme,
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
  const progById = id => PROGRAMS.find(p => p.id === id);

  /* ---------- theme ---------- */
  function applyTheme(name, save) {
    document.documentElement.dataset.theme = name;
    if (save !== false) localStorage.setItem("forge-theme", name);
    viewers.forEach(v => { if (v.setTheme) v.setTheme(name); });
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
    return `<button class="heart ${favs.has(ex.id) ? "faved" : ""}" data-fav="${ex.id}" title="Save">${favs.has(ex.id) ? "♥" : "♡"}</button>`;
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
        b.textContent = favs.has(id) ? "♥" : "♡";
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
  const views = ["home", "exercises", "detail", "body", "favorites", "programs", "program", "workout"];
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
    const v = createBodyViewer($("hero3d"), { autoRotate: true, dist: 5.6 });
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
  const filters = { q: "", muscle: "", eq: "", lvl: "" };
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
    return EXERCISES.filter(e => {
      if (filters.muscle && e.primary !== filters.muscle) return false;
      if (filters.eq && e.equipment !== filters.eq) return false;
      if (filters.lvl && e.level !== filters.lvl) return false;
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
    b.textContent = favs.has(ex.id) ? "♥ Saved to favorites" : "♡ Save to favorites";
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
    $("dMuscles").innerHTML =
      `<span class="tag primary" data-goto-muscle="${ex.primary}">${MUSCLE_INFO[ex.primary].name} · primary</span>` +
      ex.secondary.map(s => { const g = groupOf(s); return `<span class="tag" data-goto-muscle="${g}">${MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g}</span>`; }).join("");
    const sim = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary).slice(0, 4);
    $("dSimilar").innerHTML = sim.map(x =>
      `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]} · ${cap1(x.level)}</span></div>`
    ).join("");
    const v = createBodyViewer($("detail3d"), { autoRotate: true });
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
      autoRotate: true, dist: 6.1,
      onMuscleClick: mid => selectMuscle(groupOf(mid))
    });
    viewers.push(v);
    const setV = front => {
      v.setView(front ? "front" : "back");
      $("bFront").classList.toggle("on", front); $("bBack").classList.toggle("on", !front);
    };
    $("bFront").onclick = () => setV(true);
    $("bBack").onclick = () => setV(false);
    window._bodyViewer = v;
    selectMuscle(selected || "chest");
  }
  function selectMuscle(groupId) {
    const v = window._bodyViewer;
    const info = MUSCLE_INFO[groupId];
    if (!info || !v) return;
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
    $("programGrid").innerHTML = PROGRAMS.map(p => {
      const n = p.days.reduce((a, d) => a + d.exercises.length, 0);
      const isActive = activeId === p.id;
      return `<div class="prog-card" data-prog="${p.id}">
        <h3>${esc(p.name)} ${isActive ? '<span class="tag volt-tag">Active</span>' : ""}</h3>
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
    $("pgDays").innerHTML = p.days.map((d, di) => {
      const key = p.id + ":" + di;
      const times = (done[key] || []).length;
      return `<div class="day-card">
        <div class="day-head">
          <h3>${esc(d.name)} ${times ? `<span class="done-mark">✓ ${times}x</span>` : ""}</h3>
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
  let timerInt = null, timerLeft = 0;
  function fmtT(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function beep() {
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
    $("woTitle").textContent = d.name;
    $("woSub").textContent = p.name;
    $("woList").innerHTML = d.exercises.map((x, xi) => {
      const ex = byId(x.id);
      const dots = Array.from({ length: x.sets }, (_, si) =>
        `<button class="set-dot" data-x="${xi}" data-s="${si}" aria-label="set ${si + 1}"></button>`).join("");
      return `<div class="wo-ex">
        <div class="wo-ex-head">
          <b data-ex="${x.id}" class="wo-link">${esc(ex.name)}</b>
          <span class="tag">${x.sets} × ${esc(x.reps)}</span>
        </div>
        <button class="guide-toggle" data-guide="${xi}">Form guide ▾</button>
        <ol class="steps wo-steps hidden" id="guide-${xi}">
          ${ex.steps.map(s => `<li>${esc(s)}</li>`).join("")}
        </ol>
        <div class="set-row">${dots}</div>
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
      gt.textContent = open ? "Form guide ▾" : "Form guide ▴";
      return;
    }
    const sd = e.target.closest(".set-dot");
    if (sd) { sd.classList.toggle("hit"); return; }
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
    const today = new Date().toISOString().slice(0, 10);
    done[key] = done[key] || [];
    done[key].push(today); saveDone();
    $("woDone").classList.remove("hidden");
    $("woFinish").classList.add("hidden");
    clearInterval(timerInt); timerInt = null;
    window.scrollTo(0, 0);
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
      initExercises(); renderExercises();
    }
    else if (parts[0] === "body") { show("body"); renderBody(params.get("m")); }
    else if (parts[0] === "favorites") { show("favorites"); renderFavorites(); }
    else if (parts[0] === "programs") { show("programs"); renderPrograms(); }
    else if (parts[0] === "program" && parts[1]) { show("program"); renderProgram(parts[1]); }
    else if (parts[0] === "workout" && parts[1] && parts[2] !== undefined) { show("workout"); renderWorkout(parts[1], parseInt(parts[2], 10)); }
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
  $("dFav").addEventListener("click", () => {
    const id = $("dFav").dataset.id;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    saveFavs(); syncDetailFav(byId(id));
  });

  window.addEventListener("hashchange", router);
  initExercises();
  saveFavs();
  applyTheme(localStorage.getItem("forge-theme") || "dark", false);
  $("themeToggle").addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  });
  router();
})();
