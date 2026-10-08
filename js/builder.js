/* FORGE - My Workouts: drag-and-drop workout builder (offline, localStorage only) */
"use strict";

/* ---------- state ---------- */
const MW_KEY = "forge-my-workouts";
let mwSlots = []; // [{ key, exId, sets, reps }]
let mwEditingId = null;
let mwSearchQ = "";
let mwKeySeq = 1;
let _mwInit = false;

/* ---------- storage ---------- */
function getMyWorkouts() {
  try {
    const l = JSON.parse(localStorage.getItem(MW_KEY) || "[]");
    return Array.isArray(l) ? l : [];
  } catch (e) {
    return [];
  }
}

function saveMyWorkouts(l) {
  localStorage.setItem(MW_KEY, JSON.stringify(l));
}

function mwProgramId(id) {
  return "myworkout-" + id;
}

function mwRemoveMirror(id) {
  saveCustomPrograms(getCustomPrograms().filter(p => p.id !== mwProgramId(id)));
}

/* ---------- view ---------- */
function positionMwPill() {
  const active = document.querySelector(".nav a.active"),
    pill = $("navPill"),
    nav = document.querySelector(".nav");
  if (active && pill && nav) {
    const nr = nav.getBoundingClientRect(),
      ar = active.getBoundingClientRect();
    pill.style.left = ar.left - nr.left + nav.scrollLeft + "px";
    pill.style.width = ar.width + "px";
    pill.style.opacity = "1";
  } else if (pill) {
    pill.style.opacity = "0";
  }
}

function showMyWorkouts() {
  if (typeof clearViewers === "function") clearViewers();
  if (typeof clearDemos === "function") clearDemos();
  show("myworkouts"); // hides all known views, clears timers
  const s = $("view-myworkouts");
  if (s) s.classList.remove("hidden");
  document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.nav === "myworkouts"));
  requestAnimationFrame(positionMwPill);
  window.scrollTo(0, 0);
  renderMyWorkouts();
}

// Router hook: app.js's router() falls through to home for unknown routes,
// so re-assert our view after it has run.
function _mwHashCheck() {
  const first = (location.hash || "").replace(/^#\/?/, "").split("?")[0].split("/")[0];
  if (first === "myworkouts") showMyWorkouts();
}

/* ---------- editor ---------- */
function mwFreshSlot() {
  return { key: "s" + mwKeySeq++ + Date.now().toString(36), exId: null, sets: 3, reps: 10 };
}

function mwEnsureTrailingSlot() {
  mwSlots = mwSlots.filter(s => s.exId);
  mwSlots.push(mwFreshSlot());
}

function mwResetEditor() {
  mwEditingId = null;
  mwSlots = [mwFreshSlot()];
  const n = $("mwName");
  if (n) n.value = "";
  const q = $("mwSearch");
  if (q) {
    q.value = "";
    mwSearchQ = "";
  }
  renderMyWorkouts();
}

function mwLibraryMatches(ex) {
  if (!mwSearchQ) return true;
  return (ex.name || "").toLowerCase().includes(mwSearchQ);
}

function renderLibrary() {
  const lib = $("mwLib");
  if (!lib) return;
  const list = EXERCISES.filter(mwLibraryMatches)
    .slice()
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  lib.innerHTML =
    list
      .map(
        ex =>
          `<div class="mw-lib-item" draggable="true" data-exid="${esc(ex.id)}" title="Drag into a slot, or click to add">
        <span class="mw-lib-name">${esc(ex.name)}</span>
        <span class="mw-lib-meta">${esc(ex.primary || "")}${ex.equipment ? " · " + esc(ex.equipment) : ""}</span>
      </div>`
      )
      .join("") || `<p class="muted" style="padding:12px">No exercises match your search.</p>`;
}

function renderSlots() {
  const host = $("mwSlots");
  if (!host) return;
  mwEnsureTrailingSlot();
  host.innerHTML = mwSlots
    .map((sl, i) => {
      const ex = sl.exId ? byId(sl.exId) : null;
      return `<div class="mw-slot${ex ? "" : " mw-slot-empty"}" draggable="true" data-slot="${i}">
      <span class="mw-grip" title="Drag to reorder" aria-hidden="true">⠿</span>
      <div class="mw-slot-body">
        ${
          ex
            ? `<span class="mw-slot-name">${esc(ex.name)}</span>
             <span class="mw-slot-meta">${esc(ex.primary || "")}${ex.equipment ? " · " + esc(ex.equipment) : ""}</span>`
            : `<span class="mw-slot-hint">Drop an exercise here</span>`
        }
      </div>
      <label class="mw-num">Sets <input type="number" min="1" max="20" value="${sl.sets}" data-f="sets" data-slot="${i}" aria-label="Sets"></label>
      <label class="mw-num">Reps <input type="number" min="1" max="999" value="${sl.reps}" data-f="reps" data-slot="${i}" aria-label="Reps"></label>
      <button class="btn btn-ghost btn-sm mw-remove" data-slot="${i}" title="Remove slot" aria-label="Remove slot">✕</button>
    </div>`;
    })
    .join("");
}

function renderSaved() {
  const host = $("mwSaved");
  if (!host) return;
  const list = getMyWorkouts();
  host.innerHTML =
    list
      .map(w => {
        const names = (w.exercises || [])
          .map(x => {
            const ex = byId(x.exId);
            return ex ? esc(ex.name) : null;
          })
          .filter(Boolean)
          .slice(0, 4)
          .join(", ");
        const more = (w.exercises || []).length > 4 ? ` +${w.exercises.length - 4} more` : "";
        return `<div class="mw-saved" data-id="${esc(w.id)}">
      <div class="mw-saved-head">
        <b>${esc(w.name)}</b>
        <span class="tag">${(w.exercises || []).length} exercise${(w.exercises || []).length === 1 ? "" : "s"}</span>
      </div>
      ${names ? `<p class="muted mw-saved-names">${names}${more}</p>` : ""}
      <div class="mw-saved-actions">
        <button class="btn btn-primary btn-sm" data-act="start">Start Workout</button>
        <button class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
        <button class="btn btn-ghost btn-sm" data-act="dup">Duplicate</button>
        <button class="btn btn-ghost btn-sm" data-act="del">Delete</button>
      </div>
    </div>`;
      })
      .join("") || `<p class="muted">No saved workouts yet. Build one above and hit Save.</p>`;
}

function renderMyWorkouts() {
  renderLibrary();
  renderSlots();
  renderSaved();
}

/* ---------- drag and drop ---------- */
function mwOnDragStart(e) {
  if (e.target.closest("input,button,select,textarea")) {
    e.preventDefault();
    return;
  }
  const libItem = e.target.closest(".mw-lib-item");
  const slot = e.target.closest(".mw-slot");
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("text/plain", "mw");
  } catch (err) {}
  if (libItem) {
    try {
      e.dataTransfer.setData("text/mw-lib", libItem.dataset.exid);
    } catch (err) {}
    e._mwPayload = { kind: "lib", exId: libItem.dataset.exid };
  } else if (slot) {
    try {
      e.dataTransfer.setData("text/mw-slot", slot.dataset.slot);
    } catch (err) {}
    e._mwPayload = { kind: "slot", index: parseInt(slot.dataset.slot, 10) };
  }
  if (e.target.classList) e.target.classList.add("mw-dragging");
}

function mwOnDragEnd(e) {
  if (e.target.classList) e.target.classList.remove("mw-dragging");
  document.querySelectorAll(".mw-over").forEach(x => x.classList.remove("mw-over"));
}

function mwReadPayload(e) {
  if (e._mwPayload) return e._mwPayload;
  const types = e.dataTransfer.types || [];
  let lib = null,
    slot = null;
  try {
    if (types.indexOf("text/mw-lib") !== -1) lib = e.dataTransfer.getData("text/mw-lib");
    if (types.indexOf("text/mw-slot") !== -1) slot = e.dataTransfer.getData("text/mw-slot");
  } catch (err) {}
  if (lib) return { kind: "lib", exId: lib };
  if (slot !== null && slot !== "") return { kind: "slot", index: parseInt(slot, 10) };
  return null;
}

function mwApplyDrop(payload, targetIndex) {
  if (!payload) return;
  if (payload.kind === "lib") {
    const ex = byId(payload.exId);
    if (!ex) return;
    if (targetIndex == null || !mwSlots[targetIndex]) {
      mwSlots.push({ key: "s" + mwKeySeq++ + Date.now().toString(36), exId: ex.id, sets: 3, reps: 10 });
    } else {
      mwSlots[targetIndex].exId = ex.id;
    }
  } else if (payload.kind === "slot") {
    const from = payload.index;
    if (from == null || isNaN(from) || !mwSlots[from]) return;
    const moved = mwSlots.splice(from, 1)[0];
    let to = targetIndex == null ? mwSlots.length : targetIndex;
    if (to > from) to -= 1;
    mwSlots.splice(Math.max(0, Math.min(to, mwSlots.length)), 0, moved);
  }
  renderSlots();
}

/* ---------- editor actions ---------- */
function mwCurrentDraft() {
  const name = ($("mwName") ? $("mwName").value : "").trim();
  const exercises = mwSlots
    .filter(s => s.exId)
    .map(s => ({
      exId: s.exId,
      sets: Math.max(1, Math.min(20, parseInt(s.sets, 10) || 3)),
      reps: Math.max(1, parseInt(s.reps, 10) || 10)
    }));
  return { name, exercises };
}

function mwSaveDraft() {
  const d = mwCurrentDraft();
  if (!d.name) {
    appAlert("Give your workout a name first.");
    return null;
  }
  if (!d.exercises.length) {
    appAlert("Drag at least one exercise into the slots before saving.");
    return null;
  }
  const list = getMyWorkouts();
  if (mwEditingId) {
    const w = list.find(x => x.id === mwEditingId);
    if (w) {
      w.name = d.name;
      w.exercises = d.exercises;
    }
    saveMyWorkouts(list);
    appAlert("Workout saved.");
    mwResetEditor();
    return mwEditingId;
  }
  const id = Date.now().toString(36);
  list.push({ id, name: d.name, exercises: d.exercises });
  saveMyWorkouts(list);
  appAlert("Workout saved.");
  mwResetEditor();
  return id;
}

// Launch the existing workout player with a custom routine, using the same
// initiation the programs view uses: register a single-day custom program,
// then route to #/workout/<id>/0 which calls renderWorkout().
function mwLaunch(id) {
  const w = getMyWorkouts().find(x => x.id === id);
  if (!w || !(w.exercises || []).length) {
    appAlert("This workout has no exercises to start.");
    return;
  }
  const prog = {
    id: mwProgramId(w.id),
    name: w.name,
    tagline: "Custom workout",
    custom: true,
    level: "custom",
    daysPerWeek: 1,
    weeks: 1,
    equipment: "Mixed",
    myworkout: true,
    days: [
      {
        name: w.name,
        exercises: w.exercises.map(x => ({ id: x.exId, sets: x.sets, reps: String(x.reps) }))
      }
    ]
  };
  const all = getCustomPrograms().filter(p => p.id !== prog.id);
  all.push(prog);
  saveCustomPrograms(all);
  location.hash = "#/workout/" + prog.id + "/0";
}

function mwEdit(id) {
  const w = getMyWorkouts().find(x => x.id === id);
  if (!w) return;
  mwEditingId = w.id;
  $("mwName").value = w.name;
  mwSlots = (w.exercises || []).map(x => ({
    key: "s" + mwKeySeq++ + Date.now().toString(36),
    exId: x.exId,
    sets: x.sets,
    reps: x.reps
  }));
  renderSlots();
  window.scrollTo(0, 0);
  $("mwName").focus();
}

function mwDuplicate(id) {
  const w = getMyWorkouts().find(x => x.id === id);
  if (!w) return;
  const list = getMyWorkouts();
  list.push({
    id: Date.now().toString(36),
    name: w.name + " copy",
    exercises: JSON.parse(JSON.stringify(w.exercises || []))
  });
  saveMyWorkouts(list);
  renderSaved();
  appAlert("Workout duplicated.");
}

function mwDelete(id) {
  const w = getMyWorkouts().find(x => x.id === id);
  if (!w) return;
  appConfirm(`Delete "${w.name}"? This cannot be undone.`, {
    title: "Delete workout",
    okText: "Delete",
    danger: true
  }).then(ok => {
    if (!ok) return;
    saveMyWorkouts(getMyWorkouts().filter(x => x.id !== id));
    mwRemoveMirror(id);
    if (mwEditingId === id) mwResetEditor();
    else renderSaved();
    appAlert("Workout deleted.");
  });
}

/* ---------- events ---------- */
function initBuilder() {
  if (_mwInit) return;
  _mwInit = true;
  const sec = $("view-myworkouts");
  if (!sec) return;

  $("mwSearch").addEventListener("input", e => {
    mwSearchQ = e.target.value.trim().toLowerCase();
    renderLibrary();
  });

  $("mwLib").addEventListener("dragstart", mwOnDragStart);
  $("mwLib").addEventListener("dragend", mwOnDragEnd);
  // click-to-add fallback (touch devices)
  $("mwLib").addEventListener("click", e => {
    const item = e.target.closest(".mw-lib-item");
    if (!item) return;
    const ex = byId(item.dataset.exid);
    if (!ex) return;
    let target = mwSlots.findIndex(s => !s.exId);
    if (target === -1) {
      mwSlots.push({ key: "s" + mwKeySeq++ + Date.now().toString(36), exId: ex.id, sets: 3, reps: 10 });
    } else {
      mwSlots[target].exId = ex.id;
    }
    renderSlots();
  });

  const slotsHost = $("mwSlots");
  slotsHost.addEventListener("dragstart", mwOnDragStart);
  slotsHost.addEventListener("dragend", mwOnDragEnd);
  slotsHost.addEventListener("dragover", e => {
    const slot = e.target.closest(".mw-slot");
    if (!slot && e.target !== slotsHost) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (slot) slot.classList.add("mw-over");
  });
  slotsHost.addEventListener("dragleave", e => {
    const slot = e.target.closest(".mw-slot");
    if (slot) slot.classList.remove("mw-over");
  });
  slotsHost.addEventListener("drop", e => {
    e.preventDefault();
    const slot = e.target.closest(".mw-slot");
    document.querySelectorAll(".mw-over").forEach(x => x.classList.remove("mw-over"));
    mwApplyDrop(mwReadPayload(e), slot ? parseInt(slot.dataset.slot, 10) : null);
  });

  slotsHost.addEventListener("change", e => {
    const inp = e.target.closest("input[data-f]");
    if (!inp) return;
    const i = parseInt(inp.dataset.slot, 10);
    if (!mwSlots[i]) return;
    const v = parseInt(inp.value, 10);
    if (inp.dataset.f === "sets") mwSlots[i].sets = Math.max(1, Math.min(20, v || 3));
    else mwSlots[i].reps = Math.max(1, v || 10);
    inp.value = inp.dataset.f === "sets" ? mwSlots[i].sets : mwSlots[i].reps;
  });

  slotsHost.addEventListener("click", e => {
    const btn = e.target.closest(".mw-remove");
    if (!btn) return;
    const i = parseInt(btn.dataset.slot, 10);
    mwSlots.splice(i, 1);
    if (!mwSlots.length) mwSlots.push(mwFreshSlot());
    renderSlots();
  });

  $("mwSave").addEventListener("click", () => mwSaveDraft());
  $("mwStart").addEventListener("click", () => {
    const id = mwSaveDraft();
    if (id) mwLaunch(id);
  });
  $("mwNew").addEventListener("click", () => mwResetEditor());

  $("mwSaved").addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const row = e.target.closest(".mw-saved");
    if (!row) return;
    const id = row.dataset.id;
    const act = btn.dataset.act;
    if (act === "start") mwLaunch(id);
    else if (act === "edit") mwEdit(id);
    else if (act === "dup") mwDuplicate(id);
    else if (act === "del") mwDelete(id);
  });

  mwResetEditor();
}

window.addEventListener("hashchange", () => setTimeout(_mwHashCheck, 0));
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBuilder);
else initBuilder();
setTimeout(_mwHashCheck, 0);
