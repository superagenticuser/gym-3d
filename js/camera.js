/* FORGE - camera: form recorder, mirror mode, photo capture */
'use strict';


/* ---------- CAMERA FEATURES ---------- */
let _camStream = null, _recState = null, _mirrorInt = null, _photoPose = "front", _camFacing = "environment";


async function camGet(facing) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    appAlert("Camera is not available on this device or browser.");
    return null;
  }
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing || "environment" }, audio: false });
    _camFacing = facing || "environment";
    return s;
  } catch (e) {
    const n = e && e.name;
    if (n === "NotAllowedError" || n === "SecurityError")
      appAlert("Camera permission was denied. Allow camera access in your browser settings to use this.");
    else if (n === "NotFoundError" || n === "OverconstrainedError")
      appAlert("No camera found on this device.");
    else
      appAlert("Could not start the camera.");
    return null;
  }
}


function camStop() {
  if (_camStream) { _camStream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} }); _camStream = null; }
  const v = $("camVideo");
  if (v) v.srcObject = null;
}


async function camFlip(mirrored) {
  const track = _camStream && _camStream.getVideoTracks()[0];
  const curId = track ? track.getSettings().deviceId : null;
  let devices = [];
  try {
    devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "videoinput");
  } catch (e) {}
  if (devices.length < 2) {
    // fall back to facingMode toggle
    const want = _camFacing === "user" ? "environment" : "user";
    camStop();
    const s = await camGet(want);
    if (s) {
      _camStream = s; _camFacing = want;
      const v = $("camVideo");
      v.style.transform = (want === "user" && mirrored !== false) ? "scaleX(-1)" : "";
      v.srcObject = s;
    }
    return;
  }
  const curIdx = Math.max(0, devices.findIndex(d => d.deviceId === curId));
  const next = devices[(curIdx + 1) % devices.length];
  camStop();
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: next.deviceId } }, audio: false });
    _camStream = s;
    _camFacing = (next.label || "").toLowerCase().includes("front") ? "user" : "environment";
    const v = $("camVideo");
    v.style.transform = (_camFacing === "user" && mirrored !== false) ? "scaleX(-1)" : "";
    v.srcObject = s;
  } catch (e) {
    appAlert("Could not switch camera.");
  }
}


function camShell() {
  let ov = $("camOverlay");
  if (ov) return ov;
  ov = document.createElement("div");
  ov.id = "camOverlay";
  ov.className = "cam-overlay hidden";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.innerHTML = `<video id="camVideo" playsinline muted autoplay></video>
    <img id="camGhost" class="cam-ghost hidden" alt="">
    <div class="cam-topbar">
      <button class="cam-close" id="camClose" aria-label="Close camera">×</button>
      <div class="cam-title" id="camTitle"></div>
      <div class="cam-timer hidden" id="camTimer">0:00</div>
    </div>
    <div class="cam-hud hidden" id="camHud"></div>
    <div class="cam-controls" id="camControls"></div>`;
  document.body.appendChild(ov);
  $("camClose").addEventListener("click", camHide);
  return ov;
}


function camShow() {
  camShell().classList.remove("hidden");
  document.body.style.overflow = "hidden";
}


function recCleanup() {
  const st = _recState; _recState = null;
  if (st) {
    st.discarded = true;
    if (st.tint) clearInterval(st.tint);
    if (st.rec) { try { st.rec.stop(); } catch (e) {} }
  }
}


function camHide() {
  recCleanup();
  if (_mirrorInt) { clearInterval(_mirrorInt); _mirrorInt = null; }
  camStop();
  const ov = $("camOverlay");
  if (ov) ov.classList.add("hidden");
  document.body.style.overflow = "";
  const hud = $("camHud"); if (hud) { hud.innerHTML = ""; hud.classList.add("hidden"); }
  const ctl = $("camControls"); if (ctl) ctl.innerHTML = "";
  const gh = $("camGhost"); if (gh) { gh.removeAttribute("src"); gh.classList.add("hidden"); }
  const tm = $("camTimer"); if (tm) tm.classList.add("hidden");
  const v = $("camVideo"); if (v) v.style.transform = "";
}


function camToast(msg, imgSrc) {
  let t = $("camToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "camToast";
    t.className = "cam-toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.innerHTML = `${imgSrc ? `<img src="${imgSrc}" alt="">` : (window.FORGE_ICON ? window.FORGE_ICON("check") : "")}<span>${esc(msg)}</span>`;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._hideT);
  t._hideT = setTimeout(() => t.classList.remove("show"), 2600);
}


/* ----- progress photo capture ----- */
function photoGhost() {
  const gh = $("camGhost");
  if (!gh) return;
  const last = getPhotos().filter(p => p.pose === _photoPose).sort((a, b) => b.ts - a.ts)[0];
  if (last && last.src) { gh.src = last.src; gh.classList.remove("hidden"); }
  else gh.classList.add("hidden");
}


async function openPhotoCapture() {
  camShell(); camShow();
  $("camTitle").textContent = "Take progress photo";
  const ctl = $("camControls");
  ctl.innerHTML = `
    <div class="cam-pose-tabs" role="tablist" aria-label="Photo pose">
      ${["front", "side", "back"].map(p => `<button data-pp="${p}" class="${p === _photoPose ? "on" : ""}" role="tab">${p[0].toUpperCase() + p.slice(1)}</button>`).join("")}
    </div>
    <button class="cam-shutter" id="camShutter" aria-label="Take photo"></button>
    <div style="display:flex;gap:10px;align-items:center">
      <button class="cam-flip" id="camPhotoFlip">Switch camera</button>
    </div>
    <p class="cam-hint">Line up with the ghost of your last photo for consistent framing.</p>`;
  ctl.querySelectorAll("[data-pp]").forEach(b => b.addEventListener("click", () => {
    _photoPose = b.dataset.pp;
    ctl.querySelectorAll("[data-pp]").forEach(x => x.classList.toggle("on", x === b));
    photoGhost();
  }));
  $("camShutter").addEventListener("click", photoSnap);
  $("camPhotoFlip").addEventListener("click", () => camFlip(true));
  const s = await camGet("user");
  if (!s) { camHide(); return; }
  _camStream = s;
  const v = $("camVideo");
  v.style.transform = "scaleX(-1)";
  v.srcObject = s;
  photoGhost();
}


function photoSnap() {
  const v = $("camVideo");
  if (!v || !v.videoWidth) return;
  const canvas = document.createElement("canvas");
  const max = 800, scale = Math.min(1, max / Math.max(v.videoWidth, v.videoHeight));
  canvas.width = Math.round(v.videoWidth * scale);
  canvas.height = Math.round(v.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (v.style.transform.includes("scaleX(-1)")) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
  if (dataUrl.length > 1500000) { appAlert("Photo too large, try again."); return; }
  const photos = getPhotos();
  photos.push({ date: fmtDate(new Date()), ts: Date.now(), src: dataUrl, pose: _photoPose });
  savePhotos(photos);
  const pose = _photoPose;
  camHide();
  renderPhotos();
  camToast(`Photo saved (${pose}).`, dataUrl);
}


/* ----- form clip storage (IndexedDB) ----- */
function clipDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) { reject(new Error("nodb")); return; }
    const req = indexedDB.open("forge-clips", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("clips")) {
        const os = db.createObjectStore("clips", { keyPath: "id", autoIncrement: true });
        os.createIndex("exId", "exId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}


async function saveClip(c) {
  const db = await clipDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("clips", "readwrite");
    tx.objectStore("clips").add(c);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}


async function getClips(exId) {
  const db = await clipDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("clips", "readonly");
    const req = tx.objectStore("clips").index("exId").getAll(exId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}


async function deleteClip(id) {
  const db = await clipDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("clips", "readwrite");
    tx.objectStore("clips").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}


async function refreshClipCounts() {
  if (!("indexedDB" in window)) return;
  let all = [];
  try {
    const db = await clipDB();
    all = await new Promise((resolve, reject) => {
      const tx = db.transaction("clips", "readonly");
      const req = tx.objectStore("clips").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return; }
  const counts = {};
  all.forEach(c => { counts[c.exId] = (counts[c.exId] || 0) + 1; });
  document.querySelectorAll(".clips-toggle").forEach(b => {
    const n = counts[b.dataset.clipEx] || 0;
    b.classList.toggle("hidden", n === 0);
    let badge = b.querySelector(".ex-count");
    if (n > 0 && !badge) {
      badge = document.createElement("b");
      badge.className = "ex-count";
      b.appendChild(badge);
    }
    if (badge) badge.textContent = n;
  });
}


/* ----- form recorder ----- */
async function openFormRecorder(xi, exId, exName) {
  camShell(); camShow();
  $("camTitle").textContent = exName;
  const s = await camGet("environment");
  if (!s) { camHide(); return; }
  _camStream = s;
  $("camVideo").srcObject = s;
  _recState = { xi, exId, exName, reps: 0, rec: null, chunks: [], t0: 0, tint: null, discarded: false };
  const ctl = $("camControls");
  ctl.innerHTML = `
    <div class="cam-rep-row">
      <button class="cam-rep-minus" id="camRepMinus" aria-label="Remove a rep">−</button>
      <div class="cam-rep-count"><b id="camRepNum">0</b><span>reps</span></div>
      <button class="cam-rep-plus" id="camRepPlus" aria-label="Count a rep">+</button>
    </div>
    <div><button class="cam-rec-btn" id="camRecBtn"><span class="cam-rec-dot"></span>Record</button></div>
    <div style="display:flex;gap:10px;align-items:center">
      <button class="cam-flip" id="camRecFlip">Switch camera</button>
    </div>
    <p class="cam-hint">Tap + for each rep, or tap the video. Stop recording to save the clip.</p>`;
  $("camRepPlus").addEventListener("click", ev => { ev.stopPropagation(); recBump(1); });
  $("camRepMinus").addEventListener("click", ev => { ev.stopPropagation(); recBump(-1); });
  $("camVideo").addEventListener("click", () => recBump(1));
  $("camRecBtn").addEventListener("click", recToggle);
  $("camRecFlip").addEventListener("click", () => camFlip(false));
}


function recBump(d) {
  if (!_recState) return;
  _recState.reps = Math.max(0, _recState.reps + d);
  const n = $("camRepNum");
  if (n) n.textContent = _recState.reps;
  buzz(10);
}


function recToggle() {
  if (!_recState) return;
  if (_recState.rec) recStopUser();
  else recStart();
}


function recStart() {
  const st = _recState;
  if (!st || !window.MediaRecorder) { appAlert("Video recording is not supported on this device."); return; }
  const mime = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find(m => MediaRecorder.isTypeSupported(m));
  try {
    st.rec = new MediaRecorder(_camStream, mime ? { mimeType: mime } : undefined);
  } catch (e) { appAlert("Video recording is not supported on this device."); return; }
  st.chunks = [];
  st.discarded = false;
  st.rec.ondataavailable = e => { if (e.data && e.data.size) st.chunks.push(e.data); };
  st.rec.onstop = () => { if (!st.discarded) recSaved(st); };
  try { st.rec.start(500); } catch (e) { appAlert("Could not start recording."); return; }
  st.t0 = Date.now();
  const tm = $("camTimer");
  tm.classList.remove("hidden");
  tm.textContent = "0:00";
  st.tint = setInterval(() => {
    const s = Math.floor((Date.now() - st.t0) / 1000);
    tm.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    if (s >= 300) recStopUser();
  }, 500);
  const btn = $("camRecBtn");
  if (btn) { btn.classList.add("on"); btn.innerHTML = `<span class="cam-rec-dot"></span>Stop`; }
}


function recStopUser() {
  const st = _recState;
  if (!st || !st.rec) return;
  _recState = null;
  if (st.tint) clearInterval(st.tint);
  try { st.rec.stop(); } catch (e) { recSaved(st); }
}


function recSaved(st) {
  const blob = new Blob(st.chunks, { type: (st.rec && st.rec.mimeType) || "video/webm" });
  saveClip({ exId: st.exId, exName: st.exName, date: fmtDate(new Date()), ts: Date.now(), reps: st.reps, blob, mime: blob.type })
    .then(() => refreshClipCounts())
    .catch(() => {});
  const w = currentWorkout;
  const nSets = w ? w.exercises[st.xi].sets : 0;
  const doneCt = document.querySelectorAll(`.set-done[data-x="${st.xi}"].hit`).length;
  const targetSet = Math.min(doneCt + 1, Math.max(nSets, 1));
  camHide();
  const inp = document.querySelector(`input[data-x="${st.xi}"][data-s="${targetSet - 1}"][data-f="reps"]`);
  if (inp && st.reps > 0) {
    inp.value = st.reps;
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    camToast(`Set ${targetSet}: ${st.reps} reps logged. Clip saved.`);
  } else if (st.reps > 0) {
    camToast(`Clip saved with ${st.reps} reps.`);
  } else {
    camToast("Clip saved.");
  }
}


async function openClipLibrary(exId, exName) {
  let clips = [];
  try { clips = await getClips(exId); } catch (e) { appAlert("Clip storage is not available on this device."); return; }
  clips.sort((a, b) => b.ts - a.ts);
  const bd = document.createElement("div");
  bd.className = "clip-backdrop";
  const sh = document.createElement("div");
  sh.className = "clip-sheet";
  sh.setAttribute("role", "dialog");
  sh.setAttribute("aria-modal", "true");
  sh.innerHTML = `<h3>Form clips</h3><p class="muted" style="font-size:13px;margin:0 0 4px">${esc(exName)} · ${clips.length} clip${clips.length === 1 ? "" : "s"}</p>
    ${clips.length ? "" : `<div class="empty-note" style="margin-top:12px"><p><b>No clips yet.</b></p><p>Use Record set during a workout to save form videos here.</p></div>`}
    ${clips.map(c => `
      <div class="clip-item" data-clip="${c.id}">
        <video src="${URL.createObjectURL(c.blob)}" playsinline preload="metadata" controls></video>
        <div class="clip-meta">
          <span class="muted">${esc(c.date)}${c.reps ? " · " + c.reps + " reps" : ""}</span>
          <div class="clip-speed" role="group" aria-label="Playback speed">
            ${[0.25, 0.5, 1, 2].map(sp => `<button data-sp="${sp}" class="${sp === 1 ? "on" : ""}">${sp}x</button>`).join("")}
          </div>
          <button class="clip-del" data-cdel="${c.id}">Delete</button>
        </div>
      </div>`).join("")}
    <button class="btn btn-ghost" id="clipClose" style="margin-top:16px;width:100%">Close</button>`;
  document.body.appendChild(bd);
  document.body.appendChild(sh);
  document.body.style.overflow = "hidden";
  const close = () => {
    sh.querySelectorAll("video").forEach(v => { try { URL.revokeObjectURL(v.src); } catch (e) {} });
    bd.remove(); sh.remove();
    document.body.style.overflow = "";
  };
  bd.addEventListener("click", close);
  $("clipClose").addEventListener("click", close);
  sh.querySelectorAll(".clip-speed").forEach(grp => {
    const vid = grp.closest(".clip-item").querySelector("video");
    grp.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      vid.playbackRate = parseFloat(b.dataset.sp);
      grp.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    }));
  });
  sh.querySelectorAll("[data-cdel]").forEach(b => b.addEventListener("click", async () => {
    await deleteClip(parseInt(b.dataset.cdel, 10));
    close();
    refreshClipCounts();
    openClipLibrary(exId, exName);
  }));
}


/* ----- mirror mode ----- */
async function openMirror() {
  camShell(); camShow();
  const s = await camGet("user");
  if (!s) { camHide(); return; }
  _camStream = s;
  const v = $("camVideo");
  v.style.transform = "scaleX(-1)";
  v.srcObject = s;
  const w = currentWorkout;
  $("camTitle").textContent = w && w.name ? w.name : "Workout";
  const hud = $("camHud");
  hud.classList.remove("hidden");
  const ctl = $("camControls");
  ctl.innerHTML = `
    <button class="cam-rec-btn" id="camSetDone"><span class="cam-rec-dot" style="background:currentColor"></span>Set done</button>
    <div style="display:flex;gap:10px;align-items:center">
      <button class="cam-flip" id="camFlip">Switch camera</button>
    </div>
    <p class="cam-hint">Tap Set done to log the set and move on. Your rest timer keeps running.</p>`;
  $("camFlip").addEventListener("click", () => camFlip(true));
  $("camSetDone").addEventListener("click", () => {
    if (!currentWorkout) return;
    for (let xi = 0; xi < currentWorkout.exercises.length; xi++) {
      const x = currentWorkout.exercises[xi];
      const done = document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).length;
      if (done < x.sets) {
        const btn = document.querySelector(`.set-done[data-x="${xi}"][data-s="${done}"]`);
        if (btn) btn.click();
        buzz(20);
        return;
      }
    }
  });
  const upd = () => {
    if (!currentWorkout) { hud.innerHTML = `<b>No active workout</b>`; return; }
    let html = "";
    for (let xi = 0; xi < currentWorkout.exercises.length; xi++) {
      const x = currentWorkout.exercises[xi];
      const ex = byId(x.id);
      if (!ex) continue;
      const done = document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).length;
      if (done < x.sets) {
        html = `<b>${esc(ex.name)}</b><span>Set ${done + 1} of ${x.sets} · ${esc(String(x.reps))} reps</span>`;
        break;
      }
    }
    if (!html) html = `<b>Workout complete</b><span>Nice work.</span>`;
    if (timerLeft > 0) {
      const s3 = Math.ceil(timerLeft);
      html += `<span class="cam-rest">Rest ${Math.floor(s3 / 60)}:${String(s3 % 60).padStart(2, "0")}</span>`;
    }
    hud.innerHTML = html;
  };
  upd();
  _mirrorInt = setInterval(upd, 1000);
}
