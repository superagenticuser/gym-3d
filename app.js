/* FORGE — 3D gym training app */
(function () {
  'use strict';

  /* ---------- muscle metadata ---------- */
  const MUSCLE_INFO = {
    chest:      { name: "Chest",        desc: "Pectorals — pushing power for presses, push-ups and dips." },
    back:       { name: "Back",         desc: "Rhomboids & mid-traps — thick upper back from rows and deadlifts." },
    lats:       { name: "Lats",         desc: "Latissimus dorsi — the wings. Pull-ups and pulldowns build width." },
    traps:      { name: "Traps",        desc: "Trapezius — shrugs and carries build the upper-back shelf." },
    "lower-back": { name: "Lower Back", desc: "Erector spinae — keeps your spine strong under load." },
    shoulders:  { name: "Shoulders",    desc: "Deltoids — pressing and raising builds capped shoulders." },
    biceps:     { name: "Biceps",       desc: "Front of the upper arm — curls of every kind." },
    triceps:    { name: "Triceps",      desc: "Back of the upper arm — two-thirds of your arm size." },
    forearms:   { name: "Forearms",     desc: "Grip strength — carries, hangs and wrist work." },
    abs:        { name: "Abs",          desc: "Rectus abdominis — the six-pack wall. Train with resistance." },
    obliques:   { name: "Obliques",     desc: "Side core — rotation and anti-rotation strength." },
    glutes:     { name: "Glutes",       desc: "The powerhouse — hip thrusts, swings and lunges." },
    quads:      { name: "Quads",        desc: "Front of the thigh — squats, presses and lunges." },
    hamstrings: { name: "Hamstrings",   desc: "Back of the thigh — hinges, curls and Nordics." },
    calves:     { name: "Calves",       desc: "Lower leg — raises with full stretch and squeeze." },
    "full-body":{ name: "Full Body",    desc: "Compound conditioning — multiple muscles, maximum output." },
    cardio:     { name: "Cardio",       desc: "Engine building — heart, lungs and work capacity." }
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
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100);
    let camDist = opts.dist || 5.6;
    camera.position.set(0, 2.0, camDist);
    camera.lookAt(0, 1.8, 0);

    scene.add(new THREE.HemisphereLight(0x9aa6c4, 0x0b0d12, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(3, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x7c8cff, 0.7); rim.position.set(-4, 3, -4); scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 48),
      new THREE.MeshBasicMaterial({ color: 0x141824, transparent: true, opacity: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.y = 0.28; scene.add(ground);
    const ringGeo = new THREE.RingGeometry(1.7, 1.78, 64);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xd4ff3f, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.281; scene.add(ring);

    const body = new THREE.Group(); scene.add(body);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x39404f, roughness: 0.55, metalness: 0.15 });
    const neutralMat = new THREE.MeshStandardMaterial({ color: 0x232836, roughness: 0.6, metalness: 0.1 });
    const mats = {}; // muscle id -> material
    const muscleMeshes = []; // {mesh, muscle}

    function matFor(mid) {
      if (!mats[mid]) mats[mid] = baseMat.clone();
      return mats[mid];
    }
    function add(geo, x, y, z, mid, neutral) {
      const m = new THREE.Mesh(geo, neutral ? neutralMat : matFor(mid));
      m.position.set(x, y, z);
      if (mid && !neutral) { m.userData.muscle = mid; muscleMeshes.push(m); }
      body.add(m); return m;
    }
    const ball = (r, x, y, z, mid, sx, sy, sz) => {
      const m = add(new THREE.SphereGeometry(r, 24, 18), x, y, z, mid, !mid);
      if (sx) m.scale.set(sx, sy || sx, sz || sx);
      return m;
    };
    const box = (w, h, d, x, y, z, mid, rz) => {
      const m = add(new THREE.BoxGeometry(w, h, d), x, y, z, mid, !mid);
      if (rz) m.rotation.z = rz; return m;
    };
    const cap = (r, x1, y1, z1, x2, y2, z2, mid) => {
      const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), matFor(mid));
      m.position.copy(a).lerp(b, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      m.userData.muscle = mid; muscleMeshes.push(m); body.add(m); return m;
    };

    // ---- build the mannequin (facing +z) ----
    ball(0.21, 0, 3.34, 0, null);                                  // head
    add(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 16), 0, 3.1, 0, null, true); // neck
    box(0.52, 0.17, 0.26, 0, 2.99, -0.02, "traps");                // traps
    ball(0.19, -0.17, 2.73, 0.10, "chest", 1, 0.88, 0.66);         // pecs
    ball(0.19,  0.17, 2.73, 0.10, "chest", 1, 0.88, 0.66);
    for (const s of [-1, 1]) {
      ball(0.125, s * 0.40, 2.75, 0.09, "front-delt");             // front delt
      ball(0.125, s * 0.48, 2.70, 0.00, "side-delt", 1, 1.12, 1);  // side delt
      ball(0.115, s * 0.44, 2.70, -0.10, "rear-delt");             // rear delt
      cap(0.105, s * 0.48, 2.58, 0.055, s * 0.51, 2.22, 0.055, "biceps");
      cap(0.10,  s * 0.48, 2.58, -0.065, s * 0.51, 2.22, -0.065, "triceps");
      ball(0.08, s * 0.515, 2.16, 0, null);                        // elbow
      cap(0.085, s * 0.52, 2.10, 0.0, s * 0.54, 1.74, 0.01, "forearms");
      ball(0.07, s * 0.545, 1.63, 0.01, null);                     // hand
    }
    box(0.34, 0.44, 0.17, 0, 2.30, 0.06, "abs");                   // abs
    box(0.10, 0.38, 0.15, -0.245, 2.30, 0.03, "obliques");         // obliques
    box(0.10, 0.38, 0.15,  0.245, 2.30, 0.03, "obliques");
    box(0.17, 0.44, 0.11, -0.27, 2.44, -0.13, "lats", 0.12);       // lats
    box(0.17, 0.44, 0.11,  0.27, 2.44, -0.13, "lats", -0.12);
    box(0.38, 0.32, 0.13, 0, 2.64, -0.12, "back");                // upper back
    box(0.33, 0.28, 0.13, 0, 2.02, -0.10, "lower-back");          // lower back
    box(0.44, 0.22, 0.26, 0, 1.82, 0, null, true);                // pelvis
    ball(0.165, -0.155, 1.72, -0.12, "glutes", 1, 1.1, 0.9);      // glutes
    ball(0.165,  0.155, 1.72, -0.12, "glutes", 1, 1.1, 0.9);
    for (const s of [-1, 1]) {
      cap(0.135, s * 0.165, 1.62, 0.085, s * 0.175, 1.08, 0.085, "quads");
      cap(0.12,  s * 0.165, 1.62, -0.095, s * 0.175, 1.08, -0.095, "hamstrings");
      ball(0.09, s * 0.175, 1.0, 0.02, null);                      // knee
      cap(0.095, s * 0.175, 0.88, -0.045, s * 0.175, 0.48, -0.05, "calves");
      box(0.11, 0.09, 0.27, s * 0.175, 0.36, 0.07, null, true);    // foot
    }

    // ---- highlight ----
    function reset() {
      for (const id in mats) { mats[id].emissive.setHex(0x000000); mats[id].emissiveIntensity = 0; mats[id].color.setHex(0x39404f); }
    }
    function highlight(primaryIds, secondaryIds, allSoft) {
      reset();
      if (allSoft) {
        for (const id in mats) { mats[id].emissive.setHex(0xff5c1a); mats[id].emissiveIntensity = 0.35; }
        return;
      }
      (primaryIds || []).forEach(id => {
        if (mats[id]) { mats[id].emissive.setHex(0xff3b1f); mats[id].emissiveIntensity = 1.0; mats[id].color.setHex(0x6b2a20); }
      });
      (secondaryIds || []).forEach(id => {
        if (mats[id] && !(primaryIds || []).includes(id)) { mats[id].emissive.setHex(0xff9f2e); mats[id].emissiveIntensity = 0.5; }
      });
    }

    // ---- interaction ----
    let rotY = Math.PI * 0.12, targetRotY = rotY, rotX = 0;
    let dragging = false, px = 0, py = 0, moved = 0, lastAct = Date.now();
    const el = renderer.domElement;
    el.addEventListener("pointerdown", e => { dragging = true; px = e.clientX; py = e.clientY; moved = 0; lastAct = Date.now(); el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", e => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      moved += Math.abs(dx) + Math.abs(dy);
      rotY += dx * 0.008; targetRotY = rotY;
      rotX = Math.max(-0.3, Math.min(0.5, rotX + dy * 0.004));
      px = e.clientX; py = e.clientY; lastAct = Date.now();
    });
    el.addEventListener("pointerup", e => {
      dragging = false; lastAct = Date.now();
      if (moved < 8 && opts.onMuscleClick) {
        const r = el.getBoundingClientRect();
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
        const hit = ray.intersectObjects(muscleMeshes, false)[0];
        if (hit) opts.onMuscleClick(hit.object.userData.muscle);
      }
    });
    el.addEventListener("wheel", e => {
      e.preventDefault();
      camDist = Math.max(3.4, Math.min(8.5, camDist + e.deltaY * 0.003));
      camera.position.z = camDist; lastAct = Date.now();
    }, { passive: false });

    let raf = 0, dead = false;
    (function loop() {
      if (dead) return;
      raf = requestAnimationFrame(loop);
      if (opts.autoRotate && !dragging && Date.now() - lastAct > 3000) { rotY += 0.004; targetRotY = rotY; }
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
      setView(v) { targetRotY = (v === "back") ? Math.PI : 0; rotY = targetRotY; },
      dispose() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); }
    };
  }

  /* ---------- favorites ---------- */
  const favs = new Set(JSON.parse(localStorage.getItem("forge-favs") || "[]"));
  function saveFavs() {
    localStorage.setItem("forge-favs", JSON.stringify([...favs]));
    document.getElementById("favCount").textContent = favs.size;
  }

  /* ---------- helpers ---------- */
  const $ = id => document.getElementById(id);
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const eqName = { bodyweight: "Bodyweight", barbell: "Barbell", dumbbell: "Dumbbell", cable: "Cable", machine: "Machine", kettlebell: "Kettlebell", band: "Band" };
  const lvlDots = l => l === "beginner" ? "●○○" : l === "intermediate" ? "●●○" : "●●●";
  const byId = id => EXERCISES.find(e => e.id === id);
  let viewers = [];
  function clearViewers() { viewers.forEach(v => v.dispose()); viewers = []; }

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
      if (location.hash.includes("favorites")) renderFavorites();
      return;
    }
    const card = e.target.closest("[data-ex]");
    if (card) location.hash = "#/exercise/" + card.dataset.ex;
  });

  /* ---------- views ---------- */
  const views = ["home", "exercises", "detail", "body", "favorites"];
  function show(name) {
    clearViewers();
    views.forEach(v => $("view-" + v).classList.toggle("hidden", v !== name));
    document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.nav === name ||
      (name === "detail" && a.dataset.nav === "exercises")));
    window.scrollTo(0, 0);
  }

  // HOME
  function renderHome() {
    $("statEx").textContent = EXERCISES.length;
    const counts = {};
    EXERCISES.forEach(e => counts[e.primary] = (counts[e.primary] || 0) + 1);
    $("muscleGrid").innerHTML = Object.keys(MUSCLE_INFO).map(id =>
      `<a class="muscle-card" href="#/exercises?m=${id}"><b>${MUSCLE_INFO[id].name}</b><span>${counts[id] || 0} exercises</span></a>`
    ).join("");
    const v = createBodyViewer($("hero3d"), { autoRotate: true, dist: 5.4 });
    viewers.push(v);
    const groups = ["chest", "back", "shoulders", "quads", "glutes", "biceps"];
    let i = 0;
    const cyc = setInterval(() => {
      if (!document.body.contains($("hero3d"))) { clearInterval(cyc); return; }
      const g = groups[i++ % groups.length];
      v.highlight(expandMuscles(g), []);
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
      ex.secondary.map(s => `<span class="tag" data-goto-muscle="${s}">${MUSCLE_INFO[s] ? MUSCLE_INFO[s].name : s}</span>`).join("");
    const sim = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary).slice(0, 4);
    $("dSimilar").innerHTML = sim.map(x =>
      `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]} · ${cap1(x.level)}</span></div>`
    ).join("");
    const v = createBodyViewer($("detail3d"), { autoRotate: true });
    viewers.push(v);
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
      autoRotate: true, dist: 6.0,
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
    if (!info) return;
    const full = groupId === "full-body" || groupId === "cardio";
    v.highlight(full ? [] : expandMuscles(groupId), [], full);
    $("muscleInfo").innerHTML = `<h3>${info.name}</h3><p class="desc">${info.desc}</p>`;
    const list = EXERCISES.filter(e => e.primary === groupId || e.secondary.includes(groupId));
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
  router();
})();
