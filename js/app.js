/* FORGE - router, init, global wiring */
"use strict";

/* ---------- router ---------- */
function router() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const parts = path.split("/");
  const params = new URLSearchParams(query || "");
  if (parts[0] === "exercise" && parts[1]) {
    show("detail");
    renderDetail(parts[1]);
  } else if (parts[0] === "exercises") {
    show("exercises");
    filters.muscle = params.get("m") || "";
    filters.q = "";
    $("search").value = "";
    filters.eq = "";
    $("eqFilter").value = "";
    filters.lvl = "";
    $("lvlFilter").value = "";
    filters.myEq = false;
    $("myEqToggle").checked = false;
    const hasEq = (getSettings().myEquipment || []).length > 0;
    $("myEqWrap").classList.toggle("hidden", !hasEq);
    initExercises();
    renderExercises();
  } else if (parts[0] === "body") {
    show("body");
    renderBody(params.get("m"));
    try {
      renderBodyRecovery();
    } catch (e) {}
    if (params.get("replay") && window._replayEntry) {
      setTimeout(() => startReplay(window._replayEntry), 800);
    }
  } else if (parts[0] === "favorites") {
    show("favorites");
    renderFavorites();
  } else if (parts[0] === "programs") {
    show("programs");
    renderPrograms();
  } else if (parts[0] === "program" && parts[1]) {
    show("program");
    renderProgram(parts[1]);
  } else if (parts[0] === "workout" && parts[1] && parts[2] !== undefined) {
    show("workout");
    window._scaleDone = false;
    window._travelOn = false;
    const _tb = $("travelBtn");
    if (_tb) {
      _tb.classList.remove("on");
      _tb.textContent = "Travel mode";
    }
    renderWorkout(parts[1], parseInt(parts[2], 10), parseInt(params.get("week") || "0", 10) || null);
  } else if (parts[0] === "progress") {
    show("progress");
    renderProgress();
  } else if (parts[0] === "privacy") {
    show("privacy");
  } else if (parts[0] === "builder") {
    show("builder");
    newBuilder();
  } else {
    show("home");
    renderHome();
  }
  if (window._refreshTimerMini) setTimeout(window._refreshTimerMini, 60);
}

$("search").addEventListener("input", e => {
  filters.q = e.target.value;
  renderExercises();
});

$("muscleChips").addEventListener("click", e => {
  const c = e.target.closest("[data-m]");
  if (!c) return;
  filters.muscle = c.dataset.m;
  document.querySelectorAll("#muscleChips .chip").forEach(x => x.classList.toggle("on", x === c));
  renderExercises();
});

$("eqFilter").addEventListener("change", e => {
  filters.eq = e.target.value;
  renderExercises();
});

$("lvlFilter").addEventListener("change", e => {
  filters.lvl = e.target.value;
  renderExercises();
});

$("myEqToggle").addEventListener("change", e => {
  filters.myEq = e.target.checked;
  renderExercises();
});

$("dFav").addEventListener("click", () => {
  const id = $("dFav").dataset.id;
  favs.has(id) ? favs.delete(id) : favs.add(id);
  saveFavs();
  syncDetailFav(byId(id));
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

$("settingsVeil").addEventListener("click", e => {
  if (e.target.id === "settingsVeil") closeSettings();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeSettings();
    closeQuiz();
  }
});

$("accentGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-accent]");
  if (b) applyAccent(b.dataset.accent);
});

$("unitSeg").addEventListener("click", e => {
  const b = e.target.closest("[data-unit]");
  if (!b) return;
  const s = getSettings();
  s.units = b.dataset.unit;
  saveSettings(s);
  syncSettingsUI();
});

$("speedSeg").addEventListener("click", e => {
  const b = e.target.closest("[data-speed]");
  if (!b) return;
  const s = getSettings();
  s.demoSpeed = parseFloat(b.dataset.speed);
  saveSettings(s);
  syncSettingsUI();
});

$("langSeg").addEventListener("click", e => {
  const b = e.target.closest("[data-lang]");
  if (!b) return;
  const s = getSettings();
  s.lang = b.dataset.lang;
  saveSettings(s);
  syncSettingsUI();
  applyI18n();
});

$("eqGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-eq]");
  if (!b) return;
  const s = getSettings();
  s.myEquipment = s.myEquipment || [];
  const q = b.dataset.eq;
  s.myEquipment = s.myEquipment.includes(q) ? s.myEquipment.filter(x => x !== q) : [...s.myEquipment, q];
  saveSettings(s);
  syncSettingsUI();
});

$("reminderTime").addEventListener("change", e => {
  const s = getSettings();
  s.reminder = e.target.value || "";
  saveSettings(s);
});

$("reminderClear").addEventListener("click", () => {
  const s = getSettings();
  s.reminder = "";
  saveSettings(s);
  $("reminderTime").value = "";
});

[
  ["tglSound", "sound"],
  ["tglMotion", "reduceMotion"],
  ["tglDemoPlay", "demoAutoplay"],
  ["tglAutoRest", "autoRest"],
  ["tglVoice", "voiceCues"],
  ["tglBigText", "bigText"],
  ["tglContrast", "highContrast"],
  ["tglAdvanced", "advanced"],
  ["tglHaptic", "haptics"]
].forEach(([id, key]) => {
  $(id).addEventListener("click", () => {
    const s = getSettings();
    s[key] = !s[key];
    saveSettings(s);
    syncSettingsUI();
    applyA11y();
    applyAdvanced();
  });
});

function applyAdvanced() {
  document.body.classList.toggle("no-adv", !getSettings().advanced);
}

function syncFinishUI() {
  const cur = getSettings().bodyFinish || "standard";
  document
    .querySelectorAll("#finishSeg [data-finish]")
    .forEach(b => b.classList.toggle("on", b.dataset.finish === cur));
}

// migrate legacy finish from localStorage to settings
try {
  const legacy = localStorage.getItem("forge-body-finish");
  if (legacy && !getSettings().bodyFinish) {
    const st = getSettings();
    st.bodyFinish = legacy;
    saveSettings(st);
  }
  localStorage.removeItem("forge-body-finish");
} catch (e) {}

$("goalSeg").addEventListener("click", e => {
  const b = e.target.closest("[data-goal]");
  if (b) {
    const s = getSettings();
    s.goal = b.dataset.goal;
    saveSettings(s);
    syncSettingsUI();
  }
});

$("finishSeg").addEventListener("click", e => {
  const b = e.target.closest("[data-finish]");
  if (b) {
    const st = getSettings();
    st.bodyFinish = b.dataset.finish;
    saveSettings(st);
    syncFinishUI();
    applyBodyFinish(st.bodyFinish);
    try {
      if (finishPreviewViewer && finishPreviewViewer.setFinish) finishPreviewViewer.setFinish(st.bodyFinish);
    } catch (e2) {}
  }
});

$("exportData").addEventListener("click", () => {
  const data = {
    favs: [...favs],
    log: getLog(),
    done,
    settings: getSettings(),
    accent: localStorage.getItem("forge-accent") || "volt",
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "forge-backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
});

$("csvExport").addEventListener("click", exportCSV);

$("backupData").addEventListener("click", backupData);

$("restoreData").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (
    !(await appConfirm("Restore from this backup? Current data will be replaced.", { okText: "Restore", danger: true }))
  ) {
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      let restored = 0;
      Object.keys(data).forEach(k => {
        if (k.startsWith("forge-") && typeof data[k] === "string") {
          localStorage.setItem(k, data[k]);
          restored++;
        }
      });
      if (!restored) {
        appAlert("No FORGE data found in this file.");
        return;
      }
      appAlert("Backup restored. Reloading.");
      location.reload();
    } catch (err) {
      appAlert("Could not read this backup file.");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

$("resetData").addEventListener("click", async () => {
  if (
    await appConfirm("Delete all favorites, workout history, records and settings? This cannot be undone.", {
      okText: "Delete everything",
      danger: true
    })
  ) {
    localStorage.clear();
    location.reload();
  }
});

$("progTabs").addEventListener("click", e => {
  const c = e.target.closest("[data-ptab]");
  if (!c) return;
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
    if (builder.days.length > 1) {
      builder.days.splice(di, 1);
      renderBuilder();
    }
    return;
  }
  const delX = e.target.closest("[data-bdel-ex]");
  if (delX) {
    const [di, xi] = delX.dataset.bdelEx.split(":").map(Number);
    builder.days[di].exercises.splice(xi, 1);
    renderBuilder();
    return;
  }
  const pk = e.target.closest("[data-bpick]");
  if (pk) {
    openPicker(parseInt(pk.dataset.bpick, 10));
    return;
  }
  const tSave = e.target.closest("[data-btpl-save]");
  if (tSave) {
    const di = parseInt(tSave.dataset.btplSave, 10);
    const day = builder.days[di];
    if (!day.exercises.length) {
      appAlert("Add exercises to this day first.");
      return;
    }
    appPrompt("Name this template:", day.name || "Workout template", "Save as template").then(name => {
      if (!name) return;
      const tpl = getTemplates();
      tpl.push({
        id: "tpl-" + Date.now().toString(36),
        name: name.trim(),
        date: fmtDate(new Date()),
        exercises: day.exercises.map(x => ({
          id: x.id,
          sets: x.sets,
          reps: x.reps,
          weight: x.weight != null ? x.weight : null
        }))
      });
      saveTemplates(tpl);
      appAlert("Template saved.");
    });
    return;
  }
  const tApply = e.target.closest("[data-btpl-apply]");
  if (tApply) {
    openTemplatePicker(parseInt(tApply.dataset.btplApply, 10));
    return;
  }
  const b1 = e.target.closest("[data-b1rm]");
  if (b1) {
    const di = parseInt(b1.dataset.b1rm, 10);
    let filled = 0,
      missing = 0;
    builder.days[di].exercises.forEach(x => {
      const orm = oneRM(x.id);
      if (orm > 0) {
        x.weight = Math.round(orm * 0.75 * 4) / 4;
        filled++;
      } else missing++;
    });
    renderBuilder();
    appAlert(
      filled
        ? `Filled ${filled} exercise${filled > 1 ? "s" : ""} at 75% of estimated 1RM.` +
            (missing ? ` ${missing} had no logged data.` : "")
        : "No logged data yet. Log workouts to estimate your 1RMs."
    );
    return;
  }
});

$("bDays").addEventListener("input", e => {
  const dn = e.target.closest("[data-bday]");
  if (dn) {
    builder.days[parseInt(dn.dataset.bday, 10)].name = dn.value;
    return;
  }
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
  var dragEl = null,
    dragDi = -1,
    dragXi = -1,
    startY = 0,
    active = false,
    overEl = null;
  wrap.addEventListener("pointerdown", function (e) {
    var h = e.target.closest(".drag-handle");
    if (!h) return;
    var row = h.closest(".bex-row");
    if (!row) return;
    var parts = h.dataset.bdrag.split(":").map(Number);
    dragDi = parts[0];
    dragXi = parts[1];
    dragEl = row;
    startY = e.clientY;
    active = false;
    overEl = null;
  });
  wrap.addEventListener("pointermove", function (e) {
    if (!dragEl) return;
    if (!active && Math.abs(e.clientY - startY) > 10) {
      active = true;
      dragEl.classList.add("dragging");
      try {
        dragEl.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
    if (!active) return;
    dragEl.style.transform = "translateY(" + (e.clientY - startY) + "px)";
    dragEl.style.zIndex = "5";
    wrap.querySelectorAll(".drag-over").forEach(function (r) {
      r.classList.remove("drag-over");
    });
    overEl = null;
    var rows = Array.prototype.slice.call(wrap.querySelectorAll(".bex-row")).filter(function (r) {
      return r !== dragEl;
    });
    for (var i = 0; i < rows.length; i++) {
      var hd = rows[i].querySelector(".drag-handle");
      if (!hd || parseInt(hd.dataset.bdrag.split(":")[0], 10) !== dragDi) continue;
      var rect = rows[i].getBoundingClientRect();
      if (e.clientY > rect.top && e.clientY < rect.bottom) {
        overEl = rows[i];
        rows[i].classList.add("drag-over");
        break;
      }
    }
  });
  function endDrag() {
    if (!dragEl) return;
    var wasActive = active,
      srcDi = dragDi,
      srcXi = dragXi,
      tgt = overEl;
    dragEl.classList.remove("dragging");
    dragEl.style.transform = "";
    dragEl.style.zIndex = "";
    wrap.querySelectorAll(".drag-over").forEach(function (r) {
      r.classList.remove("drag-over");
    });
    dragEl = null;
    active = false;
    overEl = null;
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

$("pickerVeil").addEventListener("click", e => {
  if (e.target.id === "pickerVeil") closePicker();
});

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
  const b = e.target.closest("[data-pick]");
  if (!b || pickerDay < 0) return;
  const id = b.dataset.pick;
  const day = builder.days[pickerDay];
  if (!day.exercises.some(x => x.id === id)) {
    day.exercises.push({ id, sets: 3, reps: "10" });
    renderBuilder();
    renderPicker($("pickerSearch").value);
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

$("mirrorBtn").addEventListener("click", openMirror);

$("plateBtn").addEventListener("click", openPlates);

$("voiceBtn").addEventListener("click", toggleVoiceLog);

$("plateClose").addEventListener("click", () => $("plateVeil").classList.add("hidden"));

$("plateVeil").addEventListener("click", e => {
  if (e.target.id === "plateVeil") $("plateVeil").classList.add("hidden");
});

$("plateBar").addEventListener("input", calcPlates);

$("plateTarget").addEventListener("input", calcPlates);

$("coachBtn").addEventListener("click", generateCoachProgram);

/* ---------- custom exercises: modal + delete wiring ---------- */
$("customPrimary").innerHTML = Object.keys(MUSCLE_INFO)
  .map(id => `<option value="${id}">${MUSCLE_INFO[id].name}</option>`)
  .join("");

$("customEquipment").innerHTML = Object.keys(eqName)
  .map(q => `<option value="${q}">${eqName[q]}</option>`)
  .join("");

$("customSecondary").innerHTML = Object.keys(MUSCLE_INFO)
  .map(id => `<label class="check-pill"><input type="checkbox" value="${id}" /> ${MUSCLE_INFO[id].name}</label>`)
  .join("");

$("customClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";

$("addCustomBtn").addEventListener("click", openCustomModal);

$("customCancel").addEventListener("click", closeCustomModal);

$("customClose").addEventListener("click", closeCustomModal);

$("customVeil").addEventListener("click", e => {
  if (e.target.id === "customVeil") closeCustomModal();
});

$("customSave").addEventListener("click", saveCustomExercise);

$("dDelete").addEventListener("click", async () => {
  const id = $("dDelete").dataset.id;
  const ex = byId(id);
  if (!ex || !ex.custom) return;
  const ok = await appConfirm(
    `Delete "${ex.name}"? It will be removed from your library. Programs that use it will show it as missing.`,
    { title: "Delete exercise", okText: "Delete", danger: true }
  );
  if (!ok) return;
  saveCustomExercises(getCustomExercises().filter(c => c.id !== id));
  const i = EXERCISES.findIndex(e => e.id === id);
  if (i >= 0) EXERCISES.splice(i, 1);
  location.hash = "#/exercises";
});

/* ---------- in-app dialogs (replace native alert/confirm/prompt) ---------- */
let _dlgResolve = null,
  _dlgMode = null;

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
  if (_dlgResolve) {
    const r = _dlgResolve;
    _dlgResolve = null;
    r(val);
  }
}

function appAlert(msg, title) {
  return _showDlg({ msg, title: title || "FORGE", okText: "OK" });
}

function appConfirm(msg, o) {
  o = o || {};
  return _showDlg({
    msg,
    title: o.title || "Are you sure?",
    okText: o.okText || "Confirm",
    cancelText: "Cancel",
    danger: o.danger
  });
}

function appPrompt(msg, defVal, title) {
  return _showDlg({ msg, title: title || "FORGE", okText: "OK", cancelText: "Cancel", mode: "prompt", defVal });
}

// Top-level wiring is wrapped so a single failing element can never
// prevent router() from running (which left the homepage blank on first load).
try {
  $("dlgOk").addEventListener("click", () => {
    if (_dlgMode === "prompt") _closeDlg($("dlgInput").value);
    else _closeDlg(true);
  });

  $("dlgCancel").addEventListener("click", () => _closeDlg(_dlgMode === "prompt" ? null : false));

  $("dlgVeil").addEventListener("click", e => {
    if (e.target.id === "dlgVeil") _closeDlg(_dlgMode === "prompt" ? null : false);
  });

  $("dlgInput").addEventListener("keydown", e => {
    if (_dlgMode !== "prompt") return;
    if (e.key === "Enter") $("dlgOk").click();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("dlgVeil").classList.contains("hidden")) _closeDlg(false);
  });

  initCheckin();

  $("checkinBtn").addEventListener("click", openCheckin);

  applyA11y();

  applyAdvanced();

  $("formCheckBtn").addEventListener("click", openFormCheck);

  $("formClose").addEventListener("click", stopFormCheck);

  $("formVeil").addEventListener("click", e => {
    if (e.target.id === "formVeil") stopFormCheck();
  });

  $("formStart").addEventListener("click", startFormCheck);

  $("formStop").addEventListener("click", stopFormCheck);

  // quiz
  document.addEventListener("click", e => {
    if (e.target.closest("#quizBtn")) {
      openQuiz();
      return;
    }
    if (e.target.closest("#quizClose") || e.target.id === "quizVeil") {
      closeQuiz();
      return;
    }
    const qv = e.target.closest("[data-qv]");
    if (qv && quizState) {
      const q = QUIZ_QUESTIONS[quizState.step];
      quizState.answers[q.key] = q.key === "days" ? parseInt(qv.dataset.qv, 10) : qv.dataset.qv;
      quizState.step++;
      if (quizState.step < QUIZ_QUESTIONS.length) renderQuizStep();
      else renderQuizResult();
      return;
    }
    if (e.target.closest("#quizBack") && quizState) {
      quizState.step--;
      renderQuizStep();
      return;
    }
    if (e.target.closest("#quizAgain")) {
      quizState = { step: 0, answers: {} };
      renderQuizStep();
      return;
    }
    if (e.target.closest("#quizGo")) {
      closeQuiz();
      return;
    }
  });

  const syncOffline = () => $("offlineBar").classList.toggle("hidden", navigator.onLine);

  window.addEventListener("online", syncOffline);

  window.addEventListener("offline", syncOffline);

  syncOffline();
} catch (e) {
  console.error("app.js wiring failed:", e);
}

// router() must always run, even if wiring above threw.
router();
