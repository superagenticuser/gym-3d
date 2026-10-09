/* FORGE - workout player, timer, celebrations */
"use strict";

let timerInt = null,
  timerLeft = 0,
  timerTotal = 0,
  currentWorkout = null;

const TIMER_CIRC = 2 * Math.PI * 52;

function paintTimer() {
  const d = $("timerDisplay");
  if (d) d.textContent = fmtT(Math.max(0, timerLeft));
  const ring = $("timerRing");
  if (ring)
    ring.style.strokeDashoffset = String(timerTotal > 0 ? TIMER_CIRC * (1 - Math.max(0, timerLeft) / timerTotal) : 0);
}

(function () {
  var timerEl = null,
    miniQueued = false,
    miniOn = false;
  function timerVisible() {
    if (!timerEl) timerEl = document.querySelector(".timer");
    return timerEl && timerEl.offsetParent !== null;
  }
  function updateMini() {
    miniQueued = false;
    if (!timerVisible()) {
      if (miniOn && timerEl) {
        miniOn = false;
        timerEl.classList.remove("mini");
      }
      return;
    }
    var top = timerEl.getBoundingClientRect().top;
    if (!miniOn && top <= 67) {
      miniOn = true;
      timerEl.classList.add("mini");
    } else if (miniOn && top > 92) {
      miniOn = false;
      timerEl.classList.remove("mini");
    }
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
  cueInt = setInterval(() => {
    i = (i + 1) % cues.length;
    el.textContent = "Form cue: " + cues[i];
  }, 15000);
}

function startTimer(sec) {
  clearInterval(timerInt);
  clearInterval(cueInt);
  timerLeft = sec;
  timerTotal = sec;
  paintTimer();
  showRestCue();
  timerInt = setInterval(() => {
    timerLeft--;
    paintTimer();
    if (timerLeft <= 0) {
      clearInterval(timerInt);
      timerInt = null;
      clearInterval(cueInt);
      const rc = $("restCue");
      if (rc) rc.textContent = "";
      beep();
      buzz([40, 40, 40]);
      if (getSettings().voiceCues && window.speechSynthesis) {
        speechSynthesis.speak(new SpeechSynthesisUtterance("Rest over. Next set."));
      }
    }
  }, 1000);
}

function fmtT(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function renderWorkout(pid, di, week) {
  clearInterval(timerInt);
  timerInt = null;
  timerLeft = 0;
  timerTotal = 0;
  paintTimer();
  const p = progById(pid);
  const mesoDay = week && p && p.mesocycle && p.mesocycle[week - 1] ? p.mesocycle[week - 1].days[di] : null;
  const d = mesoDay || (p && p.days[di]);
  if (!d) {
    location.hash = "#/program/" + pid;
    return;
  }
  const sameWorkout = currentWorkout && currentWorkout._pid === pid && currentWorkout._di === di;
  const savedPairs = sameWorkout ? currentWorkout._pairs : null;
  currentWorkout = JSON.parse(JSON.stringify(d));
  currentWorkout._pairs = savedPairs || new Set();
  currentWorkout._pid = pid;
  currentWorkout._di = di;
  if (week) currentWorkout._week = week;
  let travelSwaps = 0;
  if (window._travelOn) {
    currentWorkout.exercises.forEach(x => {
      const sub = travelSub(x.id);
      if (sub) {
        x.id = sub.id;
        x._swapped = true;
        travelSwaps++;
      }
    });
  }
  $("woTitle").textContent = d.name;
  $("woSub").textContent =
    p.name +
    (week
      ? " · Week " + week + (p.mesocycle && p.mesocycle[week - 1] && p.mesocycle[week - 1].deload ? " (deload)" : "")
      : "");
  const advHint = `<p class="muted" style="font-size:12px;margin-bottom:12px">Set type: Std = standard, Drop = drop set, R-P = rest-pause, Clu = cluster, Myo = myo-rep.</p>`;
  const travelHint = window._travelOn
    ? travelSwaps > 0
      ? `<p class="muted" style="font-size:12px;margin-bottom:12px">Travel mode is on: ${travelSwaps} exercise${travelSwaps > 1 ? "s" : ""} swapped to bodyweight / dumbbell / band alternatives.</p>`
      : `<p class="muted" style="font-size:12px;margin-bottom:12px">Travel mode is on: all exercises are already travel-friendly, nothing to swap.</p>`
    : "";
  $("woList").innerHTML =
    `<p class="muted" style="font-size:12px;margin-bottom:12px">RPE = how hard the set felt (6 easy → 10 all-out). Optional but helps the coach adapt.</p>` +
    advHint +
    travelHint +
    currentWorkout.exercises
      .map((x, xi) => {
        const ex = byId(x.id);
        if (!ex) {
          return `<div class="wo-ex"><div class="wo-ex-head"><b class="muted">Missing exercise</b><span class="tag">no longer available</span></div><p class="muted" style="font-size:13px;margin:4px 0">This exercise was deleted from your library. You can still finish the workout.</p></div>`;
        }
        const isBW = ex.equipment === "bodyweight";
        const lw = x.weight != null && x.weight > 0 ? x.weight : lastWeightKg(x.id);
        const repsNum = parseInt(x.reps) || 8;
        const lastRpe = getRPE(x.id);
        const ls = lastSessionFull(x.id);
        const rows = Array.from({ length: x.sets }, (_, si) => {
          const wVal = lw != null ? fromKg(lw) : "";
          const repsVal = x.repsArr && x.repsArr[si] != null ? x.repsArr[si] : repsNum;
          const wValSi = x.weightsArr && x.weightsArr[si] != null ? fromKg(x.weightsArr[si]) : wVal;
          const lsSet = ls && ls.sets && ls.sets[si] ? ls.sets[si] : null;
          const lsLabel = lsSet
            ? `<span class="set-last" data-x="${xi}" data-s="${si}" title="Last time">${lsSet.reps}×${fmtW(lsSet.weight)}</span>`
            : "";
          return `<div class="set-row2">
        <button class="set-done" data-x="${xi}" data-s="${si}" aria-label="Mark set ${si + 1} done">${window.FORGE_ICON("check")}</button>
        <button class="set-fail" data-x="${xi}" data-s="${si}" aria-label="Mark set ${si + 1} as failed" title="Failed set (missed reps)">${window.FORGE_ICON("x")}</button>
        <span class="set-num">Set ${si + 1}</span>${lsLabel}
        <span class="set-reps"><input type="number" min="1" value="${repsVal}" data-x="${xi}" data-s="${si}" data-f="reps" aria-label="Reps"> reps</span>
        ${
          isBW
            ? `<span class="set-bw">Bodyweight</span><input class="set-weight" type="number" min="0" step="any" placeholder="+kg" value="${wValSi}" data-x="${xi}" data-s="${si}" data-f="added" aria-label="Added weight" style="width:64px"><span class="set-unit">${unitLabel()}</span>`
            : `<input class="set-weight" type="number" min="0" step="any" placeholder="–" value="${wValSi}" data-x="${xi}" data-s="${si}" data-f="weight" aria-label="Weight"><span class="set-unit">${unitLabel()}</span>`
        }
        <select class="set-type" data-x="${xi}" data-s="${si}" aria-label="Set type" title="Set type: Standard, Drop set, Rest-pause, Cluster, Myo-rep" style="width:66px;padding:6px 4px;font-size:12px">
          <option value="std">Std</option><option value="drop">Drop</option><option value="rp">R-P</option><option value="cluster">Clu</option><option value="myo">Myo</option>
        </select>
        <select class="set-rpe" data-x="${xi}" data-s="${si}" aria-label="RPE: Rate of Perceived Exertion (6=easy, 10=max effort)" title="RPE: how hard was this set? 6=easy, 10=all-out" style="width:62px;padding:6px 4px;font-size:12px">
          <option value="">RPE</option>${[6, 7, 8, 9, 10].map(r => `<option value="${r}"${lastRpe && lastRpe.rpe === r ? " selected" : ""}>${r}</option>`).join("")}
        </select>
      </div>`;
        }).join("");
        const pairs = currentWorkout._pairs;
        const isPaired = pairs.has(xi) || pairs.has(xi - 1);
        // linked groups: pairs.has(i) links exercise i to i+1, so consecutive
        // links form one group; {0,1} means exercises 0,1,2 are a giant set.
        let gStart = xi,
          gEnd = xi;
        while (gStart > 0 && pairs.has(gStart - 1)) gStart--;
        while (pairs.has(gEnd)) gEnd++;
        const gSize = gEnd - gStart + 1,
          gPos = xi - gStart + 1;
        const pairBadge =
          gSize === 2
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
      ${(() => {
        const ls = lastSessionFull(x.id);
        return ls
          ? `<p class="last-time-line" style="font-size:13px;margin:6px 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span class="muted">Last time:</span> <b>${esc(lastSessionSummary(ls))}</b><span class="beat-badge hidden" id="beat-${xi}"></span></p>`
          : "";
      })()}
      <input class="ex-note-input" data-x="${xi}" placeholder="Note for next time…" value="${esc(note)}" aria-label="Exercise note">
      <div class="ex-actions">
        <button class="ex-act guide-toggle" data-guide="${xi}" title="Form guide" aria-label="Form guide">${window.FORGE_ICON("book-open")}<span>Guide</span></button>
        <button class="ex-act tempo-toggle" data-tempo="${xi}" title="Tempo coach" aria-label="Tempo coach">${window.FORGE_ICON("timer")}<span>Tempo</span></button>
        ${!isBW && lw ? `<button class="ex-act warmup-toggle" data-warmup="${xi}" title="Warm up" aria-label="Warm up">${window.FORGE_ICON("flame")}<span>Warm up</span></button>` : ""}
        <button class="ex-act rec-toggle" data-rec="${xi}" title="Record set" aria-label="Record set">${window.FORGE_ICON("video")}<span>Record</span></button>
        <button class="ex-act clips-toggle hidden" data-clips="${xi}" data-clip-ex="${x.id}" title="Form clips" aria-label="Form clips">${window.FORGE_ICON("film")}<span>Clips</span></button>
      </div>
      <div class="warmup-box hidden" id="warmup-${xi}"></div>
      <div class="tempo-box hidden" id="tempo-${xi}">
        <p class="muted" style="font-size:12px;margin:0 0 8px">Paces each rep: slow lowering, a pause, then lifting.</p>
        ${(() => {
          const tp = getTempo(x.id);
          return `
        <label>Eccentric <input type="number" class="tempo-in" data-t="0" min="1" max="10" value="${tp[0]}"></label>
        <label>Pause <input type="number" class="tempo-in" data-t="1" min="0" max="10" value="${tp[1]}"></label>
        <label>Concentric <input type="number" class="tempo-in" data-t="2" min="1" max="10" value="${tp[2]}"></label>`;
        })()}
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
      })
      .join("");
  timerLeft = 0;
  timerTotal = 0;
  paintTimer();
  $("woDone").classList.add("hidden");
  $("woFinish").classList.remove("hidden");
  window._woPid = pid;
  window._woDi = di;
  window._woWeek = week || null;
  // pace timer: reset, starts on first set done
  window._woStartTime = null;
  if (window._paceInt) {
    clearInterval(window._paceInt);
    window._paceInt = null;
  }
  const _paceEl = $("woPace");
  if (_paceEl) {
    _paceEl.classList.add("hidden");
    _paceEl.textContent = "";
  }
  // energy-based scaling: low check-in energy suggests a shorter session
  if (!window._scaleDone) {
    const _ci = getCheckin(fmtDate(new Date()));
    if (_ci && _ci.energy != null && _ci.energy <= 2 && d.exercises.length > 1) {
      const banner = document.createElement("div");
      banner.className = "onerm-box";
      banner.id = "scaleBanner";
      banner.style.borderColor = "var(--warn)";
      banner.style.marginBottom = "12px";
      banner.innerHTML = `<b>Low energy today (${_ci.energy}/5).</b> <span class="muted">Want a shorter session? We can drop the last exercise.</span>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" data-scale="shorten">Shorten session</button>
          <button class="btn btn-ghost btn-sm" data-scale="keep">Keep as planned</button>
        </div>`;
      $("woList").prepend(banner);
    }
  }
  refreshClipCounts();
}

function updateBeatdown(xi) {
  const badge = $("beat-" + xi);
  if (!badge || !currentWorkout || !currentWorkout.exercises[xi]) return;
  const woEx = currentWorkout.exercises[xi];
  const ls = lastSessionFull(woEx.id);
  if (!ls) {
    badge.classList.add("hidden");
    return;
  }
  // current completed volume (from DOM inputs)
  let curVol = 0,
    curSets = 0;
  document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).forEach(btn => {
    const si = parseInt(btn.dataset.s, 10);
    const wIn = document.querySelector(
      `input[data-x="${xi}"][data-s="${si}"][data-f="weight"], input[data-x="${xi}"][data-s="${si}"][data-f="added"]`
    );
    const rIn = document.querySelector(`input[data-x="${xi}"][data-s="${si}"][data-f="reps"]`);
    const w = wIn ? parseFloat(wIn.value) || 0 : 0;
    const r = rIn ? parseInt(rIn.value) || 0 : 0;
    curVol += w * r;
    curSets++;
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
  const rc = e.target.closest(".rec-toggle");
  if (rc) {
    const xi = parseInt(rc.dataset.rec, 10);
    const x = currentWorkout && currentWorkout.exercises[xi];
    const ex = x ? byId(x.id) : null;
    if (ex) openFormRecorder(xi, x.id, ex.name);
    return;
  }
  const cc = e.target.closest(".clips-toggle");
  if (cc) {
    e.stopPropagation();
    const ex = byId(cc.dataset.clipEx);
    openClipLibrary(cc.dataset.clipEx, ex ? ex.name : "Exercise");
    return;
  }
  const sf = e.target.closest(".set-fail");
  if (sf) {
    sf.classList.toggle("hit");
    return;
  }
  const sd = e.target.closest(".set-done");
  if (sd) {
    const wasHit = sd.classList.contains("hit");
    sd.classList.toggle("hit");
    if (!wasHit) {
      buzz(15);
      sd.classList.remove("just-hit");
      void sd.offsetWidth;
      sd.classList.add("just-hit");
      setTimeout(() => sd.classList.remove("just-hit"), 380);
      const row = sd.closest(".set-row2");
      if (row) {
        row.classList.remove("set-flash");
        void row.offsetWidth;
        row.classList.add("set-flash");
      }
      // pace timer: start on first set done
      if (!window._woStartTime) {
        window._woStartTime = Date.now();
        const paceEl = $("woPace");
        if (paceEl) {
          paceEl.classList.remove("hidden");
          const tick = () => {
            const s = Math.floor((Date.now() - window._woStartTime) / 1000);
            const m = Math.floor(s / 60);
            paceEl.textContent = `Elapsed: ${m}:${String(s % 60).padStart(2, "0")}`;
          };
          tick();
          window._paceInt = setInterval(tick, 1000);
        }
      }
    }
    try {
      updateBeatdown(parseInt(sd.dataset.x, 10));
    } catch (e2) {}
    // per-set comparison: highlight if this set beats last time
    try {
      const xi = parseInt(sd.dataset.x, 10),
        si = parseInt(sd.dataset.s, 10);
      const lbl = document.querySelector(`.set-last[data-x="${xi}"][data-s="${si}"]`);
      if (lbl && !wasHit) {
        const wIn = document.querySelector(
          `input[data-x="${xi}"][data-s="${si}"][data-f="weight"], input[data-x="${xi}"][data-s="${si}"][data-f="added"]`
        );
        const rIn = document.querySelector(`input[data-x="${xi}"][data-s="${si}"][data-f="reps"]`);
        const w = wIn ? parseFloat(wIn.value) || 0 : 0;
        const r = rIn ? parseInt(rIn.value) || 0 : 0;
        const woEx = currentWorkout && currentWorkout.exercises[xi];
        const ls2 = woEx ? lastSessionFull(woEx.id) : null;
        const lsSet = ls2 && ls2.sets && ls2.sets[si];
        if (lsSet && (w > lsSet.weight || (w === lsSet.weight && r > lsSet.reps))) lbl.classList.add("beat");
      } else if (lbl && wasHit) {
        lbl.classList.remove("beat");
      }
    } catch (e3) {}
    if (!wasHit && getSettings().autoRest) {
      const xi = parseInt(sd.dataset.x, 10);
      const woEx = currentWorkout && currentWorkout.exercises[xi];
      const ex = woEx && byId(woEx.id);
      // linked groups (supersets and giant sets) get short rest
      const isPair =
        currentWorkout && currentWorkout._pairs && (currentWorkout._pairs.has(xi) || currentWorkout._pairs.has(xi - 1));
      startTimer(isPair ? 30 : getRestFor(woEx.id) || getRestSeconds(ex));
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
  if (tt) {
    const box = $("tempo-" + tt.dataset.tempo);
    if (box) box.classList.toggle("hidden");
    stopTempo();
    return;
  }
  const wut = e.target.closest(".warmup-toggle");
  if (wut) {
    const xi = wut.dataset.warmup,
      box = $("warmup-" + xi);
    if (box) {
      const isHidden = box.classList.toggle("hidden");
      wut.classList.toggle("open", !isHidden);
      if (!isHidden && !box.dataset.built) {
        let wKg = null;
        const wIn = document.querySelector(`input[data-x="${xi}"][data-f="weight"]`);
        if (wIn && parseFloat(wIn.value) > 0) wKg = toKg(parseFloat(wIn.value));
        if (!wKg && currentWorkout && currentWorkout.exercises[parseInt(xi, 10)]) {
          const x = currentWorkout.exercises[parseInt(xi, 10)];
          wKg = x.weight != null && x.weight > 0 ? x.weight : lastWeightKg(x.id);
        }
        const sets = warmupSets(wKg);
        box.dataset.built = "1";
        box.innerHTML = sets.length
          ? `<p class="muted" style="font-size:12px;margin:0 0 8px">Warm-up for ${fmtW(wKg)}. Tap each set when done.</p>` +
            sets
              .map(
                (s, si) =>
                  `<div class="warmup-row"><button class="set-done warmup-done" aria-label="Mark warm-up set ${si + 1} done">${window.FORGE_ICON("check")}</button><span><b>${fmtW(s.weight)}</b> × ${s.reps} reps</span></div>`
              )
              .join("")
          : `<p class="muted" style="font-size:13px;margin:0">Enter a working weight above first.</p>`;
      }
    }
    return;
  }
  const wud = e.target.closest(".warmup-done");
  if (wud) {
    wud.classList.toggle("hit");
    const row = wud.closest(".warmup-row");
    if (row) row.classList.toggle("done", wud.classList.contains("hit"));
    return;
  }
  const ts = e.target.closest(".tempo-start");
  if (ts) {
    const xi = ts.dataset.x,
      box = $("tempo-" + xi);
    const vals = [0, 1, 2].map(i => Math.max(0, parseInt(box.querySelector(`.tempo-in[data-t="${i}"]`).value) || 0));
    const exId =
      currentWorkout && currentWorkout.exercises[parseInt(xi, 10)]
        ? currentWorkout.exercises[parseInt(xi, 10)].id
        : null;
    if (exId) saveTempo(exId, vals);
    startTempo(vals[0], vals[1], vals[2], "tempo-d-" + xi);
    return;
  }
  if (e.target.closest(".tempo-stop")) {
    stopTempo();
    return;
  }
  const sc = e.target.closest("[data-scale]");
  if (sc) {
    window._scaleDone = true;
    if (sc.dataset.scale === "shorten" && currentWorkout && currentWorkout.exercises.length > 1) {
      currentWorkout.exercises.pop();
      renderWorkout(window._woPid, window._woDi, window._woWeek);
    } else {
      const b = $("scaleBanner");
      if (b) b.remove();
    }
    return;
  }
  const tp = e.target.closest("[data-timer]");
  if (tp) {
    const sec = parseInt(tp.dataset.timer, 10);
    const _cid = currentExerciseId();
    if (_cid) saveRestFor(_cid, sec);
    clearInterval(timerInt);
    timerLeft = sec;
    timerTotal = sec;
    paintTimer();
    timerInt = setInterval(() => {
      timerLeft--;
      paintTimer();
      if (timerLeft <= 0) {
        clearInterval(timerInt);
        timerInt = null;
        beep();
        buzz([40, 40, 40]);
      }
    }, 1000);
    return;
  }
  if (e.target.closest("#timerStop")) {
    clearInterval(timerInt);
    timerInt = null;
    clearInterval(cueInt);
    const rc = $("restCue");
    if (rc) rc.textContent = "";
    return;
  }
});

// VOICE COMMANDS - hands-free control of the workout player
// (voice LOGGING lives in views.js; this is the command side)
let voiceCmdRec = null;

function setVoiceCmdBtn(listening) {
  const b = $("voiceCmdBtn");
  if (!b) return;
  b.innerHTML =
    `<span class="btn-ic">` +
    (window.FORGE_ICON ? window.FORGE_ICON(listening ? "square" : "mic") : "") +
    `</span>` +
    (listening ? " Stop" : " Voice");
  b.classList.toggle("listening", !!listening);
  b.setAttribute("aria-label", listening ? "Stop voice control" : "Voice control");
  b.title = listening ? 'Listening… say "next set", "start timer", or "10 reps 60 kilos"' : "Voice control";
}

// first exercise that still has incomplete sets
function firstOpenExerciseIndex() {
  if (!currentWorkout || !currentWorkout.exercises) return -1;
  for (let xi = 0; xi < currentWorkout.exercises.length; xi++) {
    const total = currentWorkout.exercises[xi].sets || 0;
    const doneCt = document.querySelectorAll(`.set-done[data-x="${xi}"].hit`).length;
    if (doneCt < total) return xi;
  }
  return -1;
}

// "next set" / "complete set": click the same button the user would tap
function completeNextSetByVoice() {
  const xi = firstOpenExerciseIndex();
  if (xi < 0) return false;
  const btn = document.querySelector(`.wo-ex .set-done[data-x="${xi}"]:not(.hit):not(.warmup-done)`);
  if (btn) {
    btn.click(); // runs the exact on-screen set-done handler
    return true;
  }
  return false;
}

// "start timer" / "start rest": same rest math as the auto-rest after a set
function startRestByVoice() {
  const s = getSettings();
  let sec = s.restShort;
  const xi = firstOpenExerciseIndex();
  if (xi >= 0) {
    const woEx = currentWorkout.exercises[xi];
    const ex = byId(woEx.id);
    sec = getRestFor(woEx.id) || getRestSeconds(ex);
    // linked groups (supersets / giant sets) get short rest, same as auto-rest
    if (currentWorkout._pairs && (currentWorkout._pairs.has(xi) || currentWorkout._pairs.has(xi - 1))) sec = 30;
  }
  startTimer(sec);
}

// "finish exercise" / "next exercise": scroll to the next incomplete exercise
function scrollToNextExerciseByVoice() {
  const xi = firstOpenExerciseIndex();
  if (xi < 0) {
    appAlert("All exercises are complete.");
    return false;
  }
  const el = document.querySelectorAll(".wo-ex")[xi];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.remove("set-flash");
    void el.offsetWidth;
    el.classList.add("set-flash");
    return true;
  }
  return false;
}

function handleVoiceCommand(text) {
  const status = $("voiceStatus");
  const say = m => {
    if (status) status.textContent = m;
  };
  if (text.indexOf("next set") >= 0 || text.indexOf("complete set") >= 0 || text.indexOf("set done") >= 0) {
    say(completeNextSetByVoice() ? `Set logged: "${text}"` : "No open sets left.");
  } else if (text.indexOf("start timer") >= 0 || text.indexOf("start rest") >= 0) {
    startRestByVoice();
    say(`Rest timer started: "${text}"`);
  } else if (text.indexOf("stop timer") >= 0) {
    const stop = $("timerStop");
    if (stop) stop.click();
    say(`Timer stopped: "${text}"`);
  } else if (text.indexOf("next exercise") >= 0 || text.indexOf("finish exercise") >= 0) {
    say(scrollToNextExerciseByVoice() ? `Next exercise: "${text}"` : "All exercises are complete.");
  } else if (tryVoiceLog(text)) {
    // tryVoiceLog returns true and updates status if it parsed reps/weight
  } else {
    say(`Heard: "${text}". Try "next set", "start timer", or "10 reps 60 kilos"`);
  }
}

// Parse "10 reps 60 kilos" style input and fill the next open set row. Returns true if parsed.
function tryVoiceLog(text) {
  const WORDS = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100
  };
  text = text.replace(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/g,
    w => WORDS[w]
  );
  text = text.replace(/(\d+)\s+(\d+)\b/g, (m, a, b) =>
    parseInt(a) >= 20 && parseInt(b) < 10 ? String(parseInt(a) + parseInt(b)) : m
  );
  const repsM = text.match(/(\d+)\s*reps?/);
  const wM = text.match(/(\d+(?:\.\d+)?)\s*(kg|kilos?|lb|lbs|pounds?)/);
  let reps = repsM ? repsM[1] : null,
    weight = wM ? wM[1] : null;
  if (!reps && !weight) {
    const nums = text.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 2) {
      reps = nums[0];
      weight = nums[1];
    } else if (nums && nums.length === 1) {
      reps = nums[0];
    }
  }
  if (!reps && !weight) return false;
  const rows = document.querySelectorAll(".set-row2:not(.voiced)");
  if (!rows.length) return false;
  const row = rows[0];
  row.classList.add("voiced");
  if (reps) {
    const inp = row.querySelector('input[data-f="reps"]');
    if (inp) {
      inp.value = reps;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  if (weight) {
    const inp = row.querySelector('input[data-f="weight"]');
    if (inp) {
      inp.value = weight;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  const status = $("voiceStatus");
  if (status)
    status.textContent = `Logged: ${reps ? reps + " reps" : ""}${reps && weight ? " " : ""}${weight ? weight + " " + (getSettings().units || "kg") : ""}`;
  return true;
}

function toggleVoiceCmd() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    appAlert("Voice commands are not supported in this browser.");
    return;
  }
  if (voiceCmdRec) {
    voiceCmdRec.stop();
    voiceCmdRec = null;
    setVoiceCmdBtn(false);
    return;
  }
  voiceCmdRec = new SR();
  voiceCmdRec.lang = "en-US";
  voiceCmdRec.continuous = true;
  voiceCmdRec.interimResults = false;
  voiceCmdRec.onresult = e => {
    const text = e.results[e.resultIndex][0].transcript.toLowerCase().trim();
    handleVoiceCommand(text);
  };
  voiceCmdRec.onend = () => {
    voiceCmdRec = null;
    setVoiceCmdBtn(false);
  };
  voiceCmdRec.onerror = () => {};
  voiceCmdRec.start();
  setVoiceCmdBtn(true);
  const status = $("voiceStatus");
  if (status) status.textContent = 'Listening… say "next set", "start timer", or "10 reps 60 kilos"';
}

function ensureVoiceCmdButton() {
  const b = $("voiceCmdBtn");
  if (!b || b.dataset.wired) return;
  b.dataset.wired = "1";
  b.addEventListener("click", toggleVoiceCmd);
  setVoiceCmdBtn(false);
  const status = $("voiceStatus");
  if (status) status.textContent = 'Tap Voice, then say "next set", "start timer", or "10 reps 60 kilos"';
}

ensureVoiceCmdButton();

function showLevelUp(lvl) {
  const veil = document.createElement("div");
  veil.className = "pr-veil";
  veil.innerHTML = `<div class="pr-card lvl-card">
    <div class="lvl-hero">
      <div class="pr-trophy">${window.FORGE_ICON ? window.FORGE_ICON("trophy") : ""}</div>
      <div class="lvl-num">${lvl}</div>
    </div>
    <h2>Level up!</h2>
    <p class="muted">Your training is compounding.</p>
    <button class="btn btn-primary" id="lvlClose">Keep going</button>
  </div>`;
  veil.addEventListener("click", e => {
    if (e.target === veil || e.target.closest("#lvlClose")) veil.remove();
  });
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
    s.style.left = Math.random() * 100 + "%";
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
  veil.addEventListener("click", e => {
    if (e.target === veil || e.target.closest("#prClose")) veil.remove();
  });
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
  const entry = {
    date: today,
    ts: Date.now(),
    programId: raw[1],
    programName: p ? p.name : "",
    dayName: d ? d.name : "",
    week: wq.get("week") ? parseInt(wq.get("week"), 10) : null,
    exercises: []
  };
  if (d)
    d.exercises.forEach((x, xi) => {
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
          rpe,
          failed,
          type: typeEl ? typeEl.value : "std"
        });
      });
      if (sets.length) {
        entry.exercises.push({ id: x.id, sets });
        const lastRpe = sets
          .map(s => s.rpe)
          .filter(r => r != null)
          .pop();
        if (lastRpe != null) saveRPE(x.id, lastRpe);
        const noteEl = document.querySelector(`.ex-note-input[data-x="${xi}"]`);
        if (noteEl) saveExNote(x.id, noteEl.value.trim());
      }
    });
  if (!entry.exercises.length) {
    appAlert("Mark at least one set as done to log this workout.");
    return;
  }
  const _woNoteEl = $("woNotes");
  entry.notes = _woNoteEl ? _woNoteEl.value.trim() : "";
  const newPRs = [];
  entry.exercises.forEach(x => {
    const ex = byId(x.id);
    const prev = exercisePR(x.id);
    x.sets.forEach(s => {
      const w = s.weight || 0;
      if (!prev || w > prev.weight || (w === prev.weight && s.reps > prev.reps)) {
        if (!newPRs.some(p => p.id === x.id))
          newPRs.push({ id: x.id, name: ex ? ex.name : x.id, weight: w, reps: s.reps });
      }
    });
  });
  const log = getLog();
  // volume PR check: best daily volume per muscle group before this workout
  const prevVolBest = {};
  log.forEach(w => {
    const dv = {};
    (w.exercises || []).forEach(x => {
      const ex = byId(x.id);
      if (!ex) return;
      const v = (x.sets || []).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
      [groupOf(ex.primary)].concat((ex.secondary || []).map(groupOf)).forEach(g => {
        dv[g] = (dv[g] || 0) + v;
      });
    });
    Object.keys(dv).forEach(g => {
      if (!prevVolBest[g] || dv[g] > prevVolBest[g]) prevVolBest[g] = dv[g];
    });
  });
  log.push(entry);
  saveLog(log);
  // pace timer: save duration
  if (window._woStartTime) {
    entry.durationMin = Math.max(1, Math.round((Date.now() - window._woStartTime) / 60000));
    const l2 = getLog();
    if (l2.length) {
      l2[l2.length - 1].durationMin = entry.durationMin;
      saveLog(l2);
    }
    if (window._paceInt) {
      clearInterval(window._paceInt);
      window._paceInt = null;
    }
    const paceEl = $("woPace");
    if (paceEl) paceEl.classList.add("hidden");
  }
  // check if this workout set new daily volume records
  const newVolPRs = [];
  const entryVol = {};
  entry.exercises.forEach(x => {
    const ex = byId(x.id);
    if (!ex) return;
    const v = (x.sets || []).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
    [groupOf(ex.primary)].concat((ex.secondary || []).map(groupOf)).forEach(g => {
      entryVol[g] = (entryVol[g] || 0) + v;
    });
  });
  Object.keys(entryVol).forEach(g => {
    if (entryVol[g] > 0 && (!prevVolBest[g] || entryVol[g] > prevVolBest[g])) {
      newVolPRs.push({ group: g, name: MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g, vol: entryVol[g] });
    }
  });
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
  if (_xpLine)
    _xpLine.innerHTML = `Earned <b style="color:var(--volt)">+${xpGain} XP</b>${p && p.dungeon ? " including the dungeon bonus" : ""} · Level ${xpLevel(getXP().xp)}`;
  // animated XP bar to next level
  (function () {
    const xp = getXP().xp,
      lvl = xpLevel(xp);
    const cur = 100 * Math.pow(lvl - 1, 2),
      nxt = 100 * Math.pow(lvl, 2);
    const pct = Math.max(0, Math.min(100, ((xp - cur) / (nxt - cur)) * 100));
    const fill = $("woXpFill"),
      next = $("woXpNext");
    if (fill) {
      fill.style.width = "0%";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          fill.style.width = pct.toFixed(1) + "%";
        })
      );
    }
    if (next) next.textContent = `${Math.round(nxt - xp).toLocaleString()} XP to level ${lvl + 1}`;
    if (lvl > _oldLvl) setTimeout(() => showLevelUp(lvl), 600);
  })();
  checkBadges();
  if (typeof getNewBadges === "function") {
    const _newBadges = getNewBadges();
    if (_newBadges.length && typeof showBadgeCelebration === "function") showBadgeCelebration(_newBadges);
  }
  window._lastEntry = entry;
  done[key] = done[key] || [];
  done[key].push(today);
  saveDone();
  $("woDone").classList.remove("hidden");
  $("woFinish").classList.add("hidden");
  const _durEl = $("woDurationLine");
  if (_durEl) _durEl.textContent = entry.durationMin ? `Finished in ${entry.durationMin} min.` : "";
  // post-workout rating stars
  (function () {
    const wrap = $("woStars");
    if (!wrap) return;
    window._woRating = 0;
    const noteEl = $("woRatingNote");
    if (noteEl) noteEl.value = "";
    const paint = n => {
      wrap.innerHTML = [1, 2, 3, 4, 5]
        .map(i => `<span data-star="${i}" class="${i <= n ? "lit" : ""}">★</span>`)
        .join("");
    };
    paint(0);
    wrap.onclick = e => {
      const s = e.target.closest("[data-star]");
      if (!s) return;
      const n = parseInt(s.dataset.star, 10);
      window._woRating = n;
      paint(n);
      // save to the log entry
      const l = getLog();
      if (l.length) {
        l[l.length - 1].rating = n;
        const nt = $("woRatingNote");
        if (nt) l[l.length - 1].ratingNote = nt.value.trim();
        saveLog(l);
        window._lastEntry = l[l.length - 1];
      }
    };
    if (noteEl)
      noteEl.onchange = () => {
        const l = getLog();
        if (l.length && window._woRating) {
          l[l.length - 1].ratingNote = noteEl.value.trim();
          saveLog(l);
          window._lastEntry = l[l.length - 1];
        }
      };
  })();
  if (newPRs.length) showPRCelebration(newPRs);
  else if (newVolPRs.length) {
    const veil = document.createElement("div");
    veil.className = "pr-veil";
    veil.innerHTML = `<div class="pr-card">
      <div class="pr-trophy">${window.FORGE_ICON ? window.FORGE_ICON("trophy") : ""}</div>
      <h2>Volume record${newVolPRs.length > 1 ? "s" : ""}!</h2>
      ${newVolPRs.map(v => `<p><b>${esc(v.name)}</b><br><span>${Math.round(v.vol).toLocaleString()} ${getSettings().units || "kg"} in one day</span></p>`).join("")}
      <button class="btn btn-primary" id="prClose">Keep going</button>
    </div>`;
    veil.addEventListener("click", e => {
      if (e.target === veil || e.target.closest("#prClose")) veil.remove();
    });
    document.body.appendChild(veil);
    spawnConfetti(veil, 42);
    setTimeout(() => veil.remove(), 8000);
  } else {
    const _wb = $("woDone");
    if (_wb) spawnConfetti(_wb, 28);
  }
  clearInterval(timerInt);
  timerInt = null;
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
    x.sets.forEach(s =>
      lines.push(
        `  ${s.reps} reps${s.weight ? " @ " + fmtW(s.weight) : ""}${s.rpe ? " RPE " + s.rpe : ""}${s.failed ? " (failed)" : ""}`
      )
    );
  });
  const text = lines.join("\n");
  if (navigator.share) {
    try {
      await navigator.share({ title: "FORGE workout", text });
    } catch (e) {}
  } else {
    try {
      await navigator.clipboard.writeText(text);
      appAlert("Workout summary copied to clipboard.");
    } catch (e) {
      appAlert("Sharing is not available on this device.");
    }
  }
});

$("shareCard").addEventListener("click", async () => {
  const entry = window._lastEntry;
  if (!entry) return;
  const canvas = generateShareCard(entry);
  if (!canvas) {
    appAlert("Could not create share image.");
    return;
  }
  const fname = `forge-workout-${entry.date}.png`;
  // try native share first (mobile + desktop)
  try {
    const blob = await new Promise((res, rej) =>
      canvas.toBlob(b => (b ? res(b) : rej(new Error("blob"))), "image/png")
    );
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
    document.body.appendChild(a);
    a.click();
    a.remove();
    appAlert("Image downloaded.");
  } catch (e) {
    appAlert("Could not create share image.");
  }
});

$("replayBtn").addEventListener("click", () => {
  if (!window._lastEntry) return;
  // store the entry for replay and go to body map
  window._replayEntry = window._lastEntry;
  location.hash = "#/body?replay=1";
});
