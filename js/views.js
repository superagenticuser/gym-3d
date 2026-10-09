/* FORGE - main views: home, exercises, detail, body, favorites, tools */
"use strict";

/* ---------- views ---------- */
const views = [
  "home",
  "exercises",
  "detail",
  "body",
  "favorites",
  "programs",
  "program",
  "workout",
  "progress",
  "builder",
  "privacy"
];

function show(name) {
  clearViewers();
  clearDemos();
  if (timerInt) {
    clearInterval(timerInt);
    timerInt = null;
  }
  views.forEach(v => {
    const s = $("view-" + v);
    if (s) s.classList.toggle("hidden", v !== name);
  });
  document
    .querySelectorAll(".nav a")
    .forEach(a =>
      a.classList.toggle(
        "active",
        a.dataset.nav === name ||
          (name === "detail" && a.dataset.nav === "exercises") ||
          ((name === "program" || name === "workout") && a.dataset.nav === "programs")
      )
    );
  // slide the nav pill behind the active link
  const positionNavPill = () => {
    const active = document.querySelector(".nav a.active"),
      pill = $("navPill"),
      nav = document.querySelector(".nav");
    if (active && pill && nav) {
      const nr = nav.getBoundingClientRect(),
        ar = active.getBoundingClientRect();
      pill.style.left = ar.left - nr.left + nav.scrollLeft + "px";
      pill.style.width = ar.width + "px";
      pill.style.opacity = "1";
    } else if (pill) pill.style.opacity = "0";
  };
  requestAnimationFrame(positionNavPill);
  // keep the pill aligned when the nav scrolls horizontally
  const _nav = document.querySelector(".nav");
  if (_nav && !_nav._pillScrollBound) {
    _nav._pillScrollBound = true;
    _nav.addEventListener("scroll", () => requestAnimationFrame(positionNavPill), { passive: true });
  }
  window.scrollTo(0, 0);
}

// HOME
// muscle recovery stats (shared by Home suggestion and 3D Body dashboard)
function getRecoveryStats() {
  const log = getLog();
  if (!log.length) return null;
  const groups = ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "abs", "calves"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const stats = groups.map(g => {
    let daysAgo = 99,
      lastVol = 0;
    log.forEach(w => {
      let vol = 0,
        hit = false;
      (w.exercises || []).forEach(x => {
        const ex = byId(x.id);
        if (!ex) return;
        const gs = [groupOf(ex.primary)].concat((ex.secondary || []).map(groupOf));
        if (gs.includes(g)) {
          hit = true;
          vol += (x.sets || []).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
        }
      });
      if (hit) {
        const d = Math.round((today - new Date(w.date + "T00:00:00")) / 864e5);
        if (d < daysAgo) {
          daysAgo = d;
          lastVol = vol;
        }
      }
    });
    const volumeFactor = Math.min(30, (lastVol / 1000) * 10);
    const freshness = Math.max(0, Math.min(100, Math.round(daysAgo * 25 - volumeFactor)));
    const status = freshness >= 75 ? "Fresh" : freshness >= 40 ? "Ready" : "Recovering";
    const cls = freshness >= 75 ? "rs-fresh" : freshness >= 40 ? "rs-ready" : "rs-rec";
    return { g, name: MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g, daysAgo, freshness, status, cls };
  });
  const majors = ["chest", "back", "shoulders", "quads", "hamstrings", "glutes"];
  const best = stats.filter(s => majors.includes(s.g)).sort((a, b) => b.freshness - a.freshness)[0];
  return { stats, best };
}

// 3D Body: full recovery dashboard
function renderBodyRecovery() {
  const el = $("bodyRecoveryDash");
  if (!el) return;
  const r = getRecoveryStats();
  if (!r) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<div class="rec-dash">
    <h3>Muscle recovery</h3>
    <div class="rec-grid">
      ${r.stats
        .map(
          s => `<div class="rec-item">
        <div class="rn"><span>${s.name}</span><span class="rs ${s.cls}">${s.status}</span></div>
        <div class="rec-bar"><i style="width:${s.freshness}%"></i></div>
        <div class="rec-days">${s.daysAgo >= 99 ? "Not trained yet" : s.daysAgo === 0 ? "Trained today" : s.daysAgo === 1 ? "1 day ago" : s.daysAgo + " days ago"}</div>
      </div>`
        )
        .join("")}
    </div>
  </div>`;
}

function renderHome() {
  try {
    const _rs = getSettings().reminder;
    const _rb = $("reminderBanner");
    if (_rb) {
      const today = fmtDate(new Date());
      const trainedToday = getLog().some(w => w.date === today);
      const now = new Date(),
        hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      if (_rs && !trainedToday && hm >= _rs) {
        _rb.classList.remove("hidden");
        _rb.innerHTML = `<div class="reminder-top">${window.FORGE_ICON ? window.FORGE_ICON("flame") : ""}<b>Time to train!</b></div><p class="muted">Your reminder was set for ${_rs}.</p><a class="btn btn-primary btn-sm" href="#/programs">Pick a workout</a>`;
      } else _rb.classList.add("hidden");
    }
    const se = $("statEx");
    if (se) se.textContent = EXERCISES.length;
    const fe = $("footEx");
    if (fe) fe.textContent = EXERCISES.length;
    const heroCount = $("heroExCount");
    if (heroCount) heroCount.textContent = EXERCISES.length;
    const fp = $("footProg");
    if (fp && typeof PROGRAMS !== "undefined") fp.textContent = PROGRAMS.length;
  } catch (e) {
    console.error("renderHome header failed:", e);
  }
  // weekly progress ring + streak flame
  try {
    (function () {
      const hp = $("heroProgress");
      if (!hp) return;
      const log = getLog();
      const now = new Date();
      const monday = new Date(now);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const lastMon = new Date(monday);
      lastMon.setDate(monday.getDate() - 7);
      const nextMon = new Date(monday);
      nextMon.setDate(monday.getDate() + 7);
      const vol = (from, to) =>
        log
          .filter(w => w.date >= fmtDate(from) && w.date < fmtDate(to))
          .reduce(
            (a, w) =>
              a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + (s.weight || 0) * (s.reps || 0), 0), 0),
            0
          );
      const thisW = vol(monday, nextMon),
        lastW = vol(lastMon, monday);
      const streak = workoutStreak();
      if (!log.length || (thisW === 0 && lastW === 0)) {
        hp.innerHTML = "";
        return;
      }
      const pct = lastW > 0 ? Math.min(100, Math.round((thisW / lastW) * 100)) : thisW > 0 ? 100 : 0;
      const circ = 2 * Math.PI * 34,
        off = circ * (1 - pct / 100);
      hp.innerHTML = `<div class="ring-wrap">
      <div class="ring-holder">
        <svg viewBox="0 0 84 84" width="84" height="84" class="prog-ring">
          <circle cx="42" cy="42" r="34" fill="none" stroke="var(--line)" stroke-width="8"/>
          <circle cx="42" cy="42" r="34" fill="none" stroke="var(--volt)" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 42 42)" class="ring-fill"/>
        </svg>
        <span class="ring-pct-html">${pct}%</span>
      </div>
      <div><b>Week volume</b><span class="muted">${Math.round(thisW).toLocaleString()} kg vs ${Math.round(lastW).toLocaleString()} kg last week</span>
      ${streak >= 3 ? `<span class="streak-flame">${window.FORGE_ICON ? window.FORGE_ICON("flame") : ""} ${streak}-day streak</span>` : ""}</div>
    </div>`;
    })();
  } catch (e) {
    console.error("heroProgress failed:", e);
  }
  // Home: compact recovery suggestion only
  try {
    (function () {
      const el = $("recoveryDash");
      if (!el) return;
      const r = getRecoveryStats();
      if (!r || !r.best) {
        el.innerHTML = "";
        return;
      }
      el.innerHTML = `<div class="rec-suggest-card"><span class="rec-suggest-icon">💪</span><p class="rec-suggest">Today is a good&nbsp;<b>${r.best.name.toLowerCase()} day</b>&nbsp;(${r.best.freshness}% fresh).</p></div>`;
    })();
  } catch (e) {
    console.error("recoveryDash failed:", e);
  }
  // goal tracker
  try {
    (function () {
      const el = $("goalsDash");
      if (!el) return;
      const render = () => {
        const goals = getGoals();
        el.innerHTML = `<div class="goal-dash">
        <h3>Goals <button class="btn btn-ghost btn-sm" id="goalAddBtn">+ Add goal</button></h3>
        <div id="goalForm" class="hidden"></div>
        ${
          goals.length
            ? `<div class="goal-grid">${goals
                .map(g => {
                  let title, sub, pct, paceTxt, paceCls;
                  if (g.type === "weight") {
                    const ex = byId(g.exerciseId);
                    const pr = exercisePR(g.exerciseId);
                    const cur = pr ? pr.weight : 0;
                    pct = g.target > 0 ? Math.min(100, Math.round((cur / g.target) * 100)) : 0;
                    title = `${ex ? ex.name : "Lift"} ${g.target}kg`;
                    sub = `Current best: ${cur > 0 ? fmtW(cur) : "none yet"} · by ${g.targetDate}`;
                    const total = new Date(g.targetDate) - new Date(g.created);
                    const elapsed = Date.now() - new Date(g.created);
                    const expected = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;
                    const onPace = pct >= expected * 0.9;
                    paceTxt = onPace ? "On pace" : "Behind pace";
                    paceCls = onPace ? "pace-on" : "pace-off";
                  } else {
                    const weeks = g.weeks || 8;
                    const start = new Date(g.created);
                    start.setHours(0, 0, 0, 0);
                    const log = getLog();
                    let done = 0;
                    for (let w = 0; w < weeks; w++) {
                      const ws = new Date(start);
                      ws.setDate(ws.getDate() + w * 7);
                      const we = new Date(ws);
                      we.setDate(we.getDate() + 7);
                      const c = log.filter(
                        x => new Date(x.date + "T00:00:00") >= ws && new Date(x.date + "T00:00:00") < we
                      ).length;
                      if (c >= g.target) done++;
                    }
                    pct = Math.min(100, Math.round((done / weeks) * 100));
                    title = `Train ${g.target}x/week for ${weeks} weeks`;
                    sub = `${done}/${weeks} weeks hit · ${g.target}x per week target`;
                    paceTxt = done > 0 ? `${done} week${done > 1 ? "s" : ""} on target` : "Not started";
                    paceCls = done > 0 ? "pace-on" : "pace-off";
                  }
                  return `<div class="goal-card">
            <button class="goal-del" data-goal-del="${g.id}" aria-label="Delete goal">×</button>
            <div class="gt">${esc(title)}</div>
            <div class="gm">${esc(sub)}</div>
            <div class="goal-bar"><i style="width:${pct}%"></i></div>
            <div class="goal-pct">${pct}%</div>
            <div class="goal-pace ${paceCls}">${esc(paceTxt)}</div>
          </div>`;
                })
                .join("")}</div>`
            : `<p class="muted" style="font-size:13px">No goals yet. Set a strength target or a training frequency goal.</p>`
        }
      </div>`;
        const addBtn = $("goalAddBtn");
        if (addBtn)
          addBtn.onclick = () => {
            const f = $("goalForm");
            const exOpts = EXERCISES.filter(e => e.equipment !== "bodyweight")
              .slice(0, 60)
              .map(e => `<option value="${e.id}">${esc(e.name)}</option>`)
              .join("");
            f.classList.remove("hidden");
            f.innerHTML = `<div class="goal-form">
          <select id="ngType"><option value="weight">Strength goal</option><option value="frequency">Frequency goal</option></select>
          <span id="ngExWrap"><select id="ngEx">${exOpts}</select></span>
          <input id="ngTarget" type="number" min="1" placeholder="Target kg" style="width:100px">
          <span id="ngDateWrap"><input id="ngDate" type="date"></span>
          <span id="ngWeeksWrap" class="hidden"><input id="ngWeeks" type="number" min="1" max="52" value="8" style="width:70px" placeholder="Weeks"></span>
          <button class="btn btn-primary btn-sm" id="ngSave">Save</button>
        </div>`;
            $("ngType").onchange = e => {
              const isW = e.target.value === "weight";
              $("ngExWrap").classList.toggle("hidden", !isW);
              $("ngDateWrap").classList.toggle("hidden", !isW);
              $("ngWeeksWrap").classList.toggle("hidden", isW);
              $("ngTarget").placeholder = isW ? "Target kg" : "Times/week";
            };
            $("ngSave").onclick = () => {
              const type = $("ngType").value;
              const target = parseFloat($("ngTarget").value);
              if (!target || target <= 0) {
                appAlert("Enter a valid target.");
                return;
              }
              const g = { id: "g" + Date.now().toString(36), type, target, created: fmtDate(new Date()) };
              if (type === "weight") {
                g.exerciseId = $("ngEx").value;
                g.targetDate = $("ngDate").value || fmtDate(new Date(Date.now() + 90 * 864e5));
              } else {
                g.weeks = parseInt($("ngWeeks").value) || 8;
              }
              const gs = getGoals();
              gs.push(g);
              saveGoals(gs);
              render();
            };
          };
        el.querySelectorAll("[data-goal-del]").forEach(
          b =>
            (b.onclick = () => {
              saveGoals(getGoals().filter(g => g.id !== b.dataset.goalDel));
              render();
            })
        );
      };
      render();
    })();
  } catch (e) {
    console.error("goalsDash failed:", e);
  }
  try {
    const counts = {};
    EXERCISES.forEach(e => (counts[e.primary] = (counts[e.primary] || 0) + 1));
    const mg = $("muscleGrid");
    if (mg) {
      mg.innerHTML = Object.keys(MUSCLE_INFO)
        .map(
          id =>
            `<a class="muscle-card" href="#/exercises?m=${id}"><b>${MUSCLE_INFO[id].name}</b><span>${counts[id] || 0} exercises</span></a>`
        )
        .join("");
    }
  } catch (e) {
    console.error("muscleGrid render failed:", e);
  }
  try {
    const heroEl = $("hero3d");
    if (heroEl && typeof createBodyViewer === "function") {
      // Wait for the element to have dimensions (cold-load race condition)
      const initHero = () => {
        if (heroEl.clientWidth === 0 || heroEl.clientHeight === 0) {
          // Layout not ready yet, retry shortly
          setTimeout(initHero, 100);
          return;
        }
        try {
          const v = createBodyViewer(heroEl, { autoRotate: !getSettings().reduceMotion, dist: 5.6 });
          if (v.setFinish) v.setFinish(getSettings().bodyFinish || "standard");
          viewers.push(v);
          const groups = ["chest", "back", "shoulders", "quads", "glutes", "biceps"];
          let i = 0;
          const cyc = setInterval(() => {
            if (!document.body.contains($("hero3d"))) {
              clearInterval(cyc);
              return;
            }
            v.highlight(expandMuscles(groups[i++ % groups.length]), []);
          }, 2400);
          v.highlight(expandMuscles("chest"), []);
          const origDispose = v.dispose.bind(v);
          v.dispose = () => {
            clearInterval(cyc);
            origDispose();
          };
        } catch (e) {
          console.error("hero3d init failed:", e);
        }
      };
      initHero();
    }
  } catch (e) {
    console.error("hero3d render failed:", e);
  }
}

// EXERCISES
const filters = { q: "", muscle: "", eq: "", lvl: "", myEq: false };

function initExercises() {
  const chips = ["", ...Object.keys(MUSCLE_INFO)];
  $("muscleChips").innerHTML = chips
    .map(
      id =>
        `<button class="chip ${id === filters.muscle ? "on" : ""}" data-m="${id}">${id ? MUSCLE_INFO[id].name : "All"}</button>`
    )
    .join("");
  const eqs = [...new Set(EXERCISES.map(e => e.equipment))].sort();
  $("eqFilter").innerHTML =
    `<option value="">All equipment</option>` + eqs.map(q => `<option value="${q}">${eqName[q]}</option>`).join("");
}

function filtered() {
  const q = filters.q.toLowerCase();
  const myEq = getSettings().myEquipment || [];
  return EXERCISES.filter(e => {
    if (filters.muscle && e.primary !== filters.muscle) return false;
    if (filters.eq && e.equipment !== filters.eq) return false;
    if (filters.lvl && e.level !== filters.lvl) return false;
    if (filters.myEq && myEq.length && !myEq.includes(e.equipment)) return false;
    if (
      q &&
      !(
        e.name.toLowerCase().includes(q) ||
        (MUSCLE_INFO[e.primary] && MUSCLE_INFO[e.primary].name.toLowerCase().includes(q)) ||
        e.equipment.includes(q) ||
        e.level.includes(q)
      )
    )
      return false;
    return true;
  });
}

function renderExercises() {
  const list = filtered();
  $("exCount").textContent = list.length;
  $("exerciseGrid").innerHTML =
    list.map(cardHTML).join("") || `<p class="muted">No exercises match. Try clearing filters.</p>`;
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
  if (!ex) {
    location.hash = "#/exercises";
    return;
  }
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
  // Exercise-specific cues
  const exCues = ex.cues || [];
  $("dCues").innerHTML = exCues.length
    ? exCues.map(c => `<li>✓ ${esc(c)}</li>`).join("")
    : `<li class="muted">No specific cues yet.</li>`;
  // Common mistakes
  const exMistakes = ex.mistakes || [];
  $("dMistakes").innerHTML = exMistakes.length
    ? exMistakes
        .map(
          m =>
            `<div class="mistake-card"><p class="mistake-m"><b>✗ ${esc(m.m)}</b></p><p class="mistake-fix">Fix: ${esc(m.fix)}</p></div>`
        )
        .join("")
    : `<p class="muted">No common mistakes listed.</p>`;
  // Variations
  const vars = ex.variations || {};
  const varCard = (id, label) => {
    const v = EXERCISES.find(x => x.id === id);
    if (!v) return "";
    return `<div class="mini-card" data-ex="${v.id}"><b>${esc(v.name)}</b><span>${eqName[v.equipment]} · ${cap1(v.level)}</span><em>${label}</em></div>`;
  };
  const easierHtml = (vars.easier || []).map(id => varCard(id, "Easier")).join("");
  const harderHtml = (vars.harder || []).map(id => varCard(id, "Harder")).join("");
  $("dVariations").innerHTML =
    easierHtml || harderHtml
      ? `<div class="var-group">${easierHtml ? `<p class="var-label">Easier</p><div class="mini-cards">${easierHtml}</div>` : ""}${harderHtml ? `<p class="var-label">Harder</p><div class="mini-cards">${harderHtml}</div>` : ""}</div>`
      : `<p class="muted">No variations listed.</p>`;
  $("dMuscles").innerHTML =
    `<span class="tag tag-lg primary" data-goto-muscle="${ex.primary}">${MUSCLE_INFO[ex.primary].name} · primary</span>` +
    ex.secondary
      .map(s => {
        const g = groupOf(s);
        return `<span class="tag tag-lg" data-goto-muscle="${g}">${MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g}</span>`;
      })
      .join("");
  const sim = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary).slice(0, 4);
  $("dSimilar").innerHTML = sim
    .map(
      x =>
        `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]} · ${cap1(x.level)}</span></div>`
    )
    .join("");
  const myEq = getSettings().myEquipment || [];
  const altPool = EXERCISES.filter(x => x.id !== ex.id && x.primary === ex.primary && x.equipment !== ex.equipment);
  // group by equipment, prioritize user's own equipment
  const byEq = {};
  altPool.forEach(x => {
    (byEq[x.equipment] = byEq[x.equipment] || []).push(x);
  });
  const eqOrder = Object.keys(byEq).sort((a, b) => (myEq.includes(b) ? 1 : 0) - (myEq.includes(a) ? 1 : 0));
  $("dSwaps").innerHTML = eqOrder.length
    ? eqOrder
        .map(
          eq =>
            `<div class="swap-group"><p class="swap-eq">${eqName[eq]}${myEq.includes(eq) ? ` <span class="tag volt-tag" style="font-size:10px">yours</span>` : ""}</p>` +
            byEq[eq]
              .slice(0, 4)
              .map(
                x =>
                  `<button class="swap-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span class="muted" style="font-size:12px">${cap1(x.level)}</span>${window.FORGE_ICON("arrow-right")}</button>`
              )
              .join("") +
            `</div>`
        )
        .join("")
    : `<p class="muted">No swaps needed, this one covers it.</p>`;
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
  $("dOnerm").innerHTML =
    best1rm > 0
      ? `<div class="onerm-box"><b>Estimated 1RM:</b> ${fmtW(best1rm)} <span class="muted">based on your logged sets</span></div>`
      : "";
  // per-lift progression chart
  const _hist = exerciseHistory(ex.id);
  if (_hist.length >= 2) {
    $("dProg").innerHTML =
      `<h3 style="margin-top:18px">Your progression</h3><div class="chart-wrap" style="margin:0 0 12px"><canvas id="dProgCanvas"></canvas></div>`;
    const cv = $("dProgCanvas");
    const dpr = window.devicePixelRatio || 1;
    const wrap = cv.parentElement;
    const cw = wrap.clientWidth - 32,
      ch = 170;
    cv.width = cw * dpr;
    cv.height = ch * dpr;
    cv.style.width = cw + "px";
    cv.style.height = ch + "px";
    const cx = cv.getContext("2d");
    cx.scale(dpr, dpr);
    const accent = currentAccent().color;
    const vals = _hist.map(h => (h.orm > 0 ? h.orm : h.best));
    const mn = Math.min(...vals),
      mx = Math.max(...vals);
    const pad = Math.max((mx - mn) * 0.3, 1),
      lo = mn - pad,
      rg = mx - mn + pad * 2 || 1;
    const pL = 44,
      pR = 10,
      pT = 10,
      pB = 22;
    const X = i => pL + (i / (vals.length - 1)) * (cw - pL - pR);
    const Y = v => pT + (1 - (v - lo) / rg) * (ch - pT - pB);
    cx.font = "11px sans-serif";
    cx.textAlign = "right";
    for (let g = 0; g <= 2; g++) {
      const gv = lo + (rg * g) / 2,
        gy = Y(gv);
      cx.strokeStyle = "rgba(255,255,255,0.07)";
      cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(pL, gy);
      cx.lineTo(cw - pR, gy);
      cx.stroke();
      cx.fillStyle = "#8a93a6";
      cx.fillText(fromKg(gv).toFixed(1), pL - 6, gy + 4);
    }
    cx.beginPath();
    vals.forEach((v, i) => {
      i ? cx.lineTo(X(i), Y(v)) : cx.moveTo(X(0), Y(v));
    });
    cx.strokeStyle = accent;
    cx.lineWidth = 2.5;
    cx.lineJoin = "round";
    cx.stroke();
    vals.forEach((v, i) => {
      cx.beginPath();
      cx.arc(X(i), Y(v), 3.5, 0, 7);
      cx.fillStyle = accent;
      cx.fill();
    });
    cx.fillStyle = "#8a93a6";
    const _fi = i => {
      try {
        return new Date(_hist[i].date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
      } catch (e) {
        return "";
      }
    };
    cx.textAlign = "left";
    cx.fillText(_fi(0), pL, ch - 6);
    cx.textAlign = "right";
    cx.fillText(_fi(vals.length - 1), cw - pR, ch - 6);
    attachChartTip(
      cv,
      vals.map((v, i) => ({ x: X(i), y: Y(v), i })),
      p => `${_fi(p.i)}: est. 1RM ${fromKg(vals[p.i]).toFixed(1)} ${unitLabel()}`
    );
  } else {
    $("dProg").innerHTML = _hist.length
      ? `<p class="muted" style="font-size:13px">Log this exercise once more to see your progression chart.</p>`
      : "";
  }
  const detailEl = $("detail3d");
  let v = null;
  if (detailEl && typeof createBodyViewer === "function") {
    try {
      v = createBodyViewer(detailEl, { autoRotate: !getSettings().reduceMotion });
      if (v.setFinish) v.setFinish(getSettings().bodyFinish || "standard");
      viewers.push(v);
    } catch (e) {
      console.error("detail3d render failed:", e);
    }
  }
  if (v) {
    if (window.FORGE_DEMO) {
      const demo = window.FORGE_DEMO.createDemo($("demoBox"), ex.pattern, ex.steps);
      if (demo && demo.controls) demo.controls($("demoControls"));
      demos.push(demo);
    }
    const full = ex.primary === "full-body" || ex.primary === "cardio";
    v.highlight(full ? [] : expandMuscles(ex.primary), full ? [] : ex.secondary.flatMap(expandMuscles), full);
    const setV = front => {
      v.setView(front ? "front" : "back");
      $("dFront").classList.toggle("on", front);
      $("dBack").classList.toggle("on", !front);
    };
    $("dFront").onclick = () => setV(true);
    $("dBack").onclick = () => setV(false);
  }
}

document.addEventListener("click", e => {
  const g = e.target.closest("[data-goto-muscle]");
  if (g) location.hash = "#/exercises?m=" + g.dataset.gotoMuscle;
  const sr = e.target.closest("[data-sore]");
  if (sr) {
    const grp = sr.dataset.g,
      val = sr.dataset.sore;
    const today = fmtDate(new Date());
    const m = getSoreness();
    if (val === "clear") {
      if (m[today]) delete m[today][grp];
    } else {
      m[today] = m[today] || {};
      m[today][grp] = val;
    }
    saveSoreness(m);
    selectMuscle(grp);
    return;
  }
});

// BODY MAP
function openMuscleSheet(mid) {
  const g = groupOf(mid);
  const info = MUSCLE_INFO[g];
  if (!info) return;
  const ranked = EXERCISES.filter(e => e.primary === g || (e.secondary || []).map(groupOf).includes(g))
    .sort((a, b) => (a.primary === g ? 0 : 1) - (b.primary === g ? 0 : 1))
    .slice(0, 5);
  const today = fmtDate(new Date());
  const sm = getSoreness();
  let cur = (sm[today] && sm[today][g]) || "none";
  const old = document.querySelector(".sheet-veil");
  if (old) old.remove();
  const veil = document.createElement("div");
  veil.className = "sheet-veil";
  const chip = (lvl, label) =>
    `<button class="sore-chip ${cur === lvl ? "on" : ""}" data-sore-log="${lvl}" data-lvl="${lvl}">${label}</button>`;
  veil.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">
    <div class="sheet-head">
      <h3 style="margin:0">${esc(info.name)}</h3>
      <button class="modal-x sheet-close" aria-label="Close"></button>
    </div>
    <p class="muted muscle-fn">${esc(info.function || info.desc)}</p>
    <p class="muted sheet-label">How sore is it today?</p>
    <div class="sore-chips sheet-center">
      ${chip("mild", "Mild")}
      ${chip("sore", "Sore")}
      ${chip("very-sore", "Very sore")}
      ${chip("injured", "Injured")}
      ${chip("none", "Clear")}
    </div>
    <p class="muted sheet-label">Top 5 exercises - tap one to open it</p>
    ${ranked.length ? `<div class="mini-cards">${ranked.map(x => `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment] || x.equipment}</span></div>`).join("")}</div>` : `<div class="empty-note"><p><b>No exercises yet.</b></p><p>Exercises for this muscle will appear here.</p></div>`}
  </div>`;
  veil.querySelector(".sheet-close").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
  const closeSheet = () => veil.remove();
  const onEsc = e => {
    if (e.key === "Escape") closeSheet();
  };
  veil.addEventListener("click", e => {
    const sc = e.target.closest("[data-sore-log]");
    if (sc) {
      const lvl = sc.dataset.soreLog;
      const m = getSoreness();
      m[today] = m[today] || {};
      if (lvl === "none") delete m[today][g];
      else m[today][g] = lvl;
      saveSoreness(m);
      cur = lvl;
      veil.querySelectorAll("[data-sore-log]").forEach(c => c.classList.toggle("on", c.dataset.soreLog === lvl));
      if (window._paintSoreness) window._paintSoreness();
      return;
    }
    if (e.target === veil || e.target.closest("[data-ex]") || e.target.closest(".sheet-close")) closeSheet();
  });
  document.addEventListener("keydown", onEsc, { once: true });
  document.body.appendChild(veil);
}

function renderBody(selected) {
  // Dispose the previous viewer so multiple animation loops don't fight.
  try {
    if (window._bodyViewer && window._bodyViewer.dispose) window._bodyViewer.dispose();
  } catch (e) {}
  window._bodyViewer = null;
  let v = null;
  try {
    const bodyEl = $("body3d");
    if (bodyEl && typeof createBodyViewer === "function") {
      v = createBodyViewer(bodyEl, {
        autoRotate: !getSettings().reduceMotion,
        dist: 6.1,
        onMuscleHold: mid => openMuscleSheet(mid),
        onMuscleClick: mid => {
          const g = groupOf(mid);
          if (window._bodyMode === "soreness") {
            const today = fmtDate(new Date());
            const m = getSoreness();
            const todayMap = (m[today] = m[today] || {});
            const SORE_LEVELS = ["mild", "sore", "very-sore", "injured"];
            const cur = SORE_LEVELS.indexOf(todayMap[g]);
            if (cur === SORE_LEVELS.length - 1) delete todayMap[g];
            else todayMap[g] = SORE_LEVELS[cur + 1];
            saveSoreness(m);
            paintSoreness();
            return;
          }
          selectMuscle(g);
          const backSide = [
            "back",
            "lats",
            "traps",
            "lower-back",
            "rear-delt",
            "triceps",
            "glutes",
            "hamstrings",
            "calves"
          ].includes(mid);
          v.setView(backSide ? "back" : "front");
          $("bFront").classList.toggle("on", !backSide);
          $("bBack").classList.toggle("on", backSide);
        }
      });
    }
  } catch (e) {
    console.error("body3d render failed:", e);
  }
  if (!v) return;
  viewers.push(v);
  const setV = front => {
    v.setView(front ? "front" : "back");
    $("bFront").classList.toggle("on", front);
    $("bBack").classList.toggle("on", !front);
  };
  const paintSoreness = () => {
    const today = fmtDate(new Date());
    const todayMap = getSoreness()[today] || {};
    v.setSorenessTint(todayMap);
    const n = Object.keys(todayMap).length;
    $("soreCount").textContent = n ? n + " logged today" : "Tap a muscle to log soreness";
  };
  window._paintSoreness = paintSoreness;
  const syncMode = () => {
    const mode = window._bodyMode || "muscles";
    $("bMuscles").classList.toggle("on", mode === "muscles");
    $("bRecovery").classList.toggle("on", mode === "recovery");
    $("bFatigue").classList.toggle("on", mode === "fatigue");
    $("bSoreness").classList.toggle("on", mode === "soreness");
    $("heatLegend").classList.toggle("hidden", mode === "muscles" || mode === "soreness");
    $("soreHint").classList.toggle("hidden", mode !== "soreness");
    $("soreCount").classList.toggle("hidden", mode !== "soreness");
    if (mode === "soreness") paintSoreness();
  };
  window._syncBodyMode = syncMode;
  window._bodyMode = "muscles";
  // Use the stored viewer reference so the buttons work even if renderBody re-runs.
  $("bFront").onclick = () => {
    const bv = window._bodyViewer;
    if (bv && bv.setView) {
      bv.setView("front");
      $("bFront").classList.add("on");
      $("bBack").classList.remove("on");
    }
  };
  $("bBack").onclick = () => {
    const bv = window._bodyViewer;
    if (bv && bv.setView) {
      bv.setView("back");
      $("bBack").classList.add("on");
      $("bFront").classList.remove("on");
    }
  };
  $("bMuscles").onclick = () => {
    window._bodyMode = "muscles";
    syncMode();
    selectMuscle(window._lastMuscle || "chest");
  };
  $("bRecovery").onclick = () => {
    window._bodyMode = "recovery";
    syncMode();
    v.setHeat(muscleHeat());
  };
  $("bFatigue").onclick = () => {
    window._bodyMode = "fatigue";
    syncMode();
    v.setHeat(muscleFatigue());
  };
  $("bSoreness").onclick = () => {
    window._bodyMode = "soreness";
    syncMode();
  };
  window._bodyViewer = v;
  v.setFinish(getSettings().bodyFinish || "standard");
  // Migrate old pain marks to injured soreness (one-time)
  try {
    const oldPain = getPain();
    const keys = Object.keys(oldPain);
    if (keys.length) {
      const today = fmtDate(new Date());
      const sm = getSoreness();
      sm[today] = sm[today] || {};
      keys.forEach(g => {
        if (!sm[today][g]) sm[today][g] = "injured";
      });
      saveSoreness(sm);
      localStorage.removeItem("forge-pain");
    }
  } catch (e) {}
  selectMuscle(selected || "chest");
  renderBodyRecovery();
}

function selectMuscle(groupId) {
  const v = window._bodyViewer;
  const info = MUSCLE_INFO[groupId];
  if (!info || !v) return;
  window._lastMuscle = groupId;
  if (window._bodyHeatMode) {
    window._bodyHeatMode = false;
    if (window._syncBodyMode) window._syncBodyMode();
  }
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
  const soreLabel =
    soreState === "sore"
      ? `<span style="color:var(--warn);font-weight:700">Sore today</span>`
      : soreState === "injured"
        ? `<span style="color:#f87171;font-weight:700">Injured - take it easy</span>`
        : "";
  $("muscleInfo").innerHTML = `<h3>${info.name}</h3><p class="desc">${info.desc}</p>
    <p style="margin-top:8px;font-size:14px">${recHTML}</p>
    ${soreLabel ? `<p style="font-size:14px;margin-top:4px">${soreLabel}</p>` : ""}
    ${soreState ? `<div style="display:flex;gap:8px;margin:10px 0 14px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-sore="clear" data-g="${groupId}">Clear</button></div>` : ""}`;
  const list = EXERCISES.filter(e => e.primary === groupId);
  $("bodyExercises").innerHTML = list.length
    ? `<p class="muted" style="margin-bottom:10px">${list.length} exercise${list.length > 1 ? "s" : ""}</p>` +
      list
        .map(
          x => `<div class="mini-card" data-ex="${x.id}"><b>${esc(x.name)}</b><span>${eqName[x.equipment]}</span></div>`
        )
        .join("")
    : `<div class="empty-note"><p><b>No exercises yet.</b></p><p>Exercises for this muscle will appear here.</p></div>`;
}

// FAVORITES
function renderFavorites() {
  const list = EXERCISES.filter(e => favs.has(e.id));
  $("favGrid").innerHTML = list.map(cardHTML).join("");
  const fe = $("favEmpty");
  fe.classList.toggle("hidden", list.length > 0);
  if (!list.length) fe.innerHTML = emptyNote("No favorites yet", "Tap the heart on any exercise to save it here.");
}

// QUIZ
const QUIZ_QUESTIONS = [
  {
    key: "days",
    title: "How many days per week can you train?",
    title_fr: "Combien de jours par semaine pouvez-vous vous entraîner ?",
    options: [
      { v: 2, label: "2 days", label_fr: "2 jours" },
      { v: 3, label: "3 days", label_fr: "3 jours" },
      { v: 4, label: "4 days", label_fr: "4 jours" },
      { v: 6, label: "5+ days", label_fr: "5+ jours" }
    ]
  },
  {
    key: "equip",
    title: "What equipment do you have access to?",
    title_fr: "De quel équipement disposez-vous ?",
    options: [
      { v: "full", label: "Full gym", label_fr: "Salle complète" },
      { v: "dumbbells", label: "Dumbbells + bench", label_fr: "Haltères + banc" },
      { v: "dumbbells-only", label: "Dumbbells only", label_fr: "Haltères uniquement" },
      { v: "bodyweight", label: "Bodyweight / minimal", label_fr: "Poids du corps / minimal" }
    ]
  },
  {
    key: "goal",
    title: "What's your main goal?",
    title_fr: "Quel est votre objectif principal ?",
    options: [
      { v: "muscle", label: "Build muscle", label_fr: "Prendre du muscle" },
      { v: "strength", label: "Get stronger", label_fr: "Devenir plus fort" },
      { v: "fitness", label: "General fitness", label_fr: "Forme générale" }
    ]
  }
];

function ql(o) {
  return getSettings().lang === "fr" ? o.label_fr || o.label : o.label;
}

function qt(q) {
  return getSettings().lang === "fr" ? q.title_fr || q.title : q.title;
}

const QUIZ_FIT = {
  "full-body-starter": {
    days: [2, 3],
    equip: ["dumbbells", "dumbbells-only", "bodyweight"],
    goal: ["muscle", "fitness"]
  },
  "push-pull-legs": { days: [6], equip: ["full"], goal: ["muscle"] },
  "upper-lower": { days: [4], equip: ["full"], goal: ["muscle", "strength"] },
  "strength-5x5": { days: [3], equip: ["full"], goal: ["strength"] },
  "dumbbell-home": { days: [2, 3], equip: ["dumbbells", "dumbbells-only"], goal: ["fitness", "muscle"] },
  "hiit-conditioning": { days: [3, 4], equip: ["bodyweight", "dumbbells-only"], goal: ["fitness"] }
};

let quizState = null;

function openQuiz() {
  quizState = { step: 0, answers: {} };
  $("quizClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
  renderQuizStep();
  $("quizVeil").classList.remove("hidden");
}

function closeQuiz() {
  $("quizVeil").classList.add("hidden");
}

function renderQuizStep() {
  const q = QUIZ_QUESTIONS[quizState.step];
  const fr = getSettings().lang === "fr";
  $("quizBody").innerHTML =
    `<p class="muted" style="margin-bottom:6px">${fr ? `Question ${quizState.step + 1} sur ${QUIZ_QUESTIONS.length}` : `Question ${quizState.step + 1} of ${QUIZ_QUESTIONS.length}`}</p>
     <h4 style="margin:0 0 16px;font-size:18px">${qt(q)}</h4>
     <div class="quiz-opts">` +
    q.options.map(o => `<button class="quiz-opt" data-qv="${o.v}">${ql(o)}</button>`).join("") +
    `</div>` +
    (quizState.step > 0
      ? `<button class="btn btn-ghost btn-sm" id="quizBack" style="margin-top:14px">${fr ? "Retour" : "Back"}</button>`
      : "");
}

function quizScore(p, a) {
  const fit = QUIZ_FIT[p.id];
  if (!fit) return { score: 0, reasons: [] };
  let s = 0;
  const reasons = [];
  if (fit.days.includes(a.days)) {
    s += 3;
    reasons.push(`${p.daysPerWeek} days/week fits your schedule`);
  } else if (fit.days.some(d => Math.abs(d - a.days) === 1)) {
    s += 1;
  }
  if (fit.equip.includes(a.equip)) {
    s += 3;
    reasons.push(`Uses your ${QUIZ_QUESTIONS[1].options.find(o => String(o.v) === a.equip).label.toLowerCase()}`);
  }
  if (fit.goal.includes(a.goal)) {
    s += 3;
    reasons.push(`Built for ${QUIZ_QUESTIONS[2].options.find(o => String(o.v) === a.goal).label.toLowerCase()}`);
  }
  if (p.level === "beginner") s += 0.5;
  return { score: s, reasons };
}

function renderQuizResult() {
  const a = quizState.answers;
  const fr = getSettings().lang === "fr";
  const ranked = PROGRAMS.map(p => ({ p, ...quizScore(p, a) })).sort((x, y) => y.score - x.score);
  const top = ranked[0];
  $("quizBody").innerHTML = `<p class="muted" style="margin-bottom:6px">${fr ? "Votre programme" : "Your match"}</p>
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
  $("bName").value = "";
  $("bTagline").value = "";
  renderBuilder();
}

function renderBuilder() {
  if (!builder) newBuilder();
  $("bDays").innerHTML = builder.days
    .map(
      (d, di) => `
    <div class="day-block">
      <div class="day-head">
        <input type="text" class="text-input" value="${esc(d.name)}" data-bday="${di}" maxlength="40" aria-label="Day name" />
        <button class="icon-btn" data-bdel-day="${di}" aria-label="Delete day">${window.FORGE_ICON("x")}</button>
      </div>
      ${d.exercises
        .map((x, xi) => {
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
        })
        .join("")}
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" data-bpick="${di}">Add exercises</button>
        <button class="btn btn-ghost btn-sm" data-btpl-save="${di}">Save as template</button>
        <button class="btn btn-ghost btn-sm" data-btpl-apply="${di}">From template</button>
        <button class="btn btn-ghost btn-sm" data-b1rm="${di}" title="Fill target weights at 75% of your estimated 1RM">Autofill 75% 1RM</button>
      </div>
    </div>`
    )
    .join("");
}

function openPicker(di) {
  pickerDay = di;
  templateDay = -1;
  $("pickerTitle").textContent = "Add exercises";
  $("pickerSearch").closest(".search-wrap").style.display = "";
  $("pickerClose").innerHTML = window.FORGE_ICON ? window.FORGE_ICON("x") : "×";
  $("pickerSearch").value = "";
  renderPicker("");
  $("pickerVeil").classList.remove("hidden");
}

function closePicker() {
  $("pickerVeil").classList.add("hidden");
  pickerDay = -1;
}

let templateDay = -1;

function openTemplatePicker(di) {
  templateDay = di;
  const tpl = getTemplates();
  $("pickerTitle").textContent = "Apply template";
  $("pickerSearch").closest(".search-wrap").style.display = "none";
  $("pickerList").innerHTML = tpl.length
    ? tpl
        .map(
          t =>
            `<div class="picker-item tpl-item" style="cursor:default">
      <b>${esc(t.name)}</b><span class="tag">${t.exercises.length} exercises</span>
      <div class="tpl-actions">
        <button class="btn btn-primary btn-sm" data-tpl-apply="${t.id}">Apply</button>
        <button class="btn btn-ghost btn-sm danger" data-tpl-del="${t.id}">Delete</button>
      </div>
    </div>`
        )
        .join("")
    : `<div class="empty-note"><p><b>No templates yet.</b></p><p>Build a day and tap "Save as template".</p></div>`;
  $("pickerVeil").classList.remove("hidden");
}

function renderPicker(q) {
  q = q.toLowerCase();
  const inDay = pickerDay >= 0 ? new Set(builder.days[pickerDay].exercises.map(x => x.id)) : new Set();
  const list = EXERCISES.filter(
    e =>
      !q ||
      e.name.toLowerCase().includes(q) ||
      (MUSCLE_INFO[e.primary] && MUSCLE_INFO[e.primary].name.toLowerCase().includes(q))
  ).slice(0, 60);
  $("pickerList").innerHTML =
    list
      .map(
        e =>
          `<button class="picker-item" data-pick="${e.id}">
      <b>${esc(e.name)}</b><span class="tag">${MUSCLE_INFO[e.primary].name}</span>
      ${inDay.has(e.id) ? `<span class="added">Added</span>` : ""}
    </button>`
      )
      .join("") || `<p class="muted">No matches.</p>`;
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
  if (!days.length) {
    appAlert("Add at least one exercise to a day.");
    return;
  }
  const id = "custom-" + Date.now().toString(36);
  const prog = {
    id,
    name: builder.name,
    tagline: builder.tagline,
    custom: true,
    level: "custom",
    daysPerWeek: days.length,
    weeks: 4,
    equipment: "Mixed",
    days: days.map(d => ({
      name: d.name.trim() || "Day",
      exercises: d.exercises.map(x => ({
        id: x.id,
        sets: x.sets,
        reps: x.reps,
        weight: x.weight != null ? x.weight : null
      }))
    }))
  };
  const all = getCustomPrograms();
  all.push(prog);
  saveCustomPrograms(all);
  location.hash = "#/program/" + id;
}

// PLATE CALCULATOR
// Plate colors follow the common competition scheme (kg) / gym scheme (lb)
const PLATE_COLORS = {
  25: "#d43a2f",
  20: "#2f6fd4",
  15: "#d4a92f",
  10: "#3aa655",
  5: "#e8e8e8",
  2.5: "#c0392b",
  1.25: "#95a5a6",
  45: "#d43a2f",
  35: "#2f6fd4"
};

function plateDiagramSVG(used, units) {
  const maxW = units === "kg" ? 25 : 45;
  const W = 400,
    H = 130,
    cx = W / 2,
    cy = H / 2;
  // real barbell anatomy from the center out: grip shaft, then plates on the
  // sleeves, then collars, then a short bar tip
  let plateSpan = 0;
  used.forEach(w => {
    plateSpan += Math.round(9 + 11 * (w / maxW)) + 2;
  });
  const shaftHalf = 95; // grip area each side of center
  const collarGap = 4; // gap between last plate and collar
  const tipLen = 14; // bar tip beyond the collar
  const halfBar = shaftHalf + plateSpan + collarGap + 8 + tipLen;
  const barX = cx - halfBar,
    barW = halfBar * 2;
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
    const ph = Math.round(34 + 66 * frac); // plate height
    const pw = Math.round(9 + 11 * frac); // plate thickness
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
      const tc = dark || w === 15 ? "#1a1d21" : "#fff";
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
    while (remaining >= p - 0.001) {
      used.push(p);
      remaining -= p;
    }
  }
  const diagram = used.length ? `<div class="plate-diagram">${plateDiagramSVG(used, units)}</div>` : "";
  if (remaining > 0.01) {
    $("plateResult").innerHTML =
      diagram +
      `<p class="muted">Closest: ${used.length ? used.join(" + ") : "bar only"} per side (${(remaining * 2).toFixed(1)} ${units} short).</p>`;
  } else {
    $("plateResult").innerHTML =
      diagram +
      (used.length
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
  chest: ["Squeeze shoulder blades together", "Keep a slight arch in your back", "Lower with control, don't bounce"],
  back: ["Lead with your elbows", "Squeeze at the top for 1 second", "Don't swing, control the weight"],
  shoulders: ["Keep core braced", "Don't shrug your traps up", "Control the negative"],
  biceps: ["Pin elbows to your sides", "Don't swing your torso", "Full range of motion"],
  triceps: ["Keep upper arms still", "Lock out at the top", "Don't flare elbows"],
  quads: ["Knees track over toes", "Chest up, core tight", "Drive through your heels"],
  hamstrings: ["Hinge at the hips", "Slight bend in knees", "Feel the stretch, then squeeze"],
  glutes: ["Squeeze hard at the top", "Don't hyperextend your back", "Drive through heels"],
  calves: ["Full stretch at bottom", "Pause at the top", "Don't bounce"],
  abs: ["Exhale on the effort", "Don't pull your neck", "Slow and controlled"],
  default: ["Breathe steadily", "Control the weight both ways", "Stop if form breaks down"]
};

// SHARE CARD (Feature 7): renders a 1080x1350 portrait workout card to an offscreen canvas
function generateShareCard(entry) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const W = 1080,
      H = 1350;
    const volt = "#d4ff3f",
      ink = "#f2f4f8",
      muted = "#9aa3b5";
    // background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0b0d12");
    grad.addColorStop(1, "#161b26");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // volt accent bar
    ctx.fillStyle = volt;
    ctx.fillRect(0, 0, W, 10);
    ctx.textAlign = "center";
    // brand
    ctx.fillStyle = volt;
    ctx.font = "800 92px system-ui, -apple-system, sans-serif";
    try {
      ctx.letterSpacing = "14px";
    } catch (e) {}
    ctx.fillText("FORGE", W / 2, 150);
    try {
      ctx.letterSpacing = "0px";
    } catch (e) {}
    // date, e.g. "Mon, Oct 5, 2026"
    const parts = (entry.date || "").split("-");
    let dateStr = entry.date || "";
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    }
    ctx.fillStyle = muted;
    ctx.font = "500 40px system-ui, sans-serif";
    ctx.fillText(dateStr, W / 2, 225);
    // program + day
    const sub = [entry.programName, entry.dayName].filter(Boolean).join(" - ");
    const subShown = sub.length > 34 ? sub.slice(0, 33) + "…" : sub || "Workout";
    ctx.fillStyle = ink;
    ctx.font = "700 52px system-ui, sans-serif";
    ctx.fillText(subShown, W / 2, 300);
    // divider
    ctx.strokeStyle = "#232936";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 360);
    ctx.lineTo(W - 140, 360);
    ctx.stroke();
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
      ctx.fillStyle = ink;
      ctx.font = "800 76px system-ui, sans-serif";
      ctx.fillText(st[0], colX[i], 480);
      ctx.fillStyle = muted;
      ctx.font = "500 32px system-ui, sans-serif";
      ctx.fillText(st[1], colX[i], 535);
    });
    // top 4 exercises by volume
    ctx.fillStyle = volt;
    ctx.font = "700 36px system-ui, sans-serif";
    ctx.fillText("TOP LIFTS", W / 2, 650);
    const ranked = entry.exercises
      .map(x => ({
        x,
        vol: x.sets.reduce((b, s) => b + setVolumeKg(x.id, s), 0),
        reps: x.sets.reduce((b, s) => b + (s.reps || 0), 0)
      }))
      .sort((a, b) => b.vol - a.vol)
      .slice(0, 4);
    ctx.textAlign = "left";
    let y = 730;
    ranked.forEach(r => {
      const ex = byId(r.x.id);
      const name = ex ? ex.name : r.x.id;
      const shown = name.length > 30 ? name.slice(0, 29) + "…" : name;
      ctx.fillStyle = ink;
      ctx.font = "600 40px system-ui, sans-serif";
      ctx.fillText(shown, 110, y);
      ctx.fillStyle = muted;
      ctx.font = "500 34px system-ui, sans-serif";
      ctx.fillText(r.x.sets.length + " sets - " + r.reps + " reps - " + fmtW(r.vol), 110, y + 52);
      y += 130;
    });
    // footer
    ctx.textAlign = "center";
    ctx.fillStyle = "#5b6472";
    ctx.font = "500 32px system-ui, sans-serif";
    ctx.fillText("Trained with FORGE", W / 2, H - 70);
    return canvas;
  } catch (e) {
    return null;
  }
}

// AI FORM CHECK (MoveNet pose estimation, on-device)
let formStream = null,
  formDetector = null,
  formRunning = false,
  formRaf = 0;

let squatState = "up",
  squatReps = 0;

async function loadFormModel() {
  if (formDetector) return formDetector;
  if (!window.tf) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  if (!window.poseDetection) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const model = poseDetection.SupportedModels.MoveNet;
  formDetector = await poseDetection.createDetector(model, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
  });
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
    squatState = "up";
    squatReps = 0;
    formRunning = true;
    formLoop();
  } catch (e) {
    $("formFeedback").textContent = "Camera unavailable: " + e.message;
  }
}

function stopFormCheck() {
  formRunning = false;
  cancelAnimationFrame(formRaf);
  if (formStream) {
    formStream.getTracks().forEach(t => t.stop());
    formStream = null;
  }
  $("formStart").classList.remove("hidden");
  $("formStop").classList.add("hidden");
  $("formVeil").classList.add("hidden");
}

async function formLoop() {
  if (!formRunning) return;
  const video = $("formVideo"),
    canvas = $("formCanvas");
  if (video.readyState >= 2 && formDetector) {
    const poses = await formDetector.estimatePoses(video);
    drawPose(canvas, video, poses[0]);
    analyzeSquat(poses[0]);
  }
  formRaf = requestAnimationFrame(formLoop);
}

function drawPose(canvas, video, pose) {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!pose) return;
  ctx.fillStyle = "#a3e635";
  pose.keypoints.forEach(kp => {
    if (kp.score > 0.3) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

function analyzeSquat(pose) {
  if (!pose) {
    $("formFeedback").textContent = "No body detected, step back.";
    return;
  }
  const kp = n => pose.keypoints.find(k => k.name === n);
  const hip = kp("left_hip"),
    knee = kp("left_knee");
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
    squatState = "up";
    squatReps++;
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
  const b = $("voiceBtn");
  if (!b) return;
  b.innerHTML =
    `<span class="btn-ic">` +
    (window.FORGE_ICON ? window.FORGE_ICON(listening ? "square" : "mic") : "") +
    `</span>` +
    (listening ? " Stop" : " Voice log");
}

function toggleVoiceLog() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    appAlert("Voice not supported in this browser.");
    return;
  }
  if (voiceRec) {
    voiceRec.stop();
    voiceRec = null;
    setVoiceBtn(false);
    return;
  }
  voiceRec = new SR();
  voiceRec.lang = "en-US";
  voiceRec.onresult = e => {
    let text = e.results[0][0].transcript.toLowerCase();
    // convert word numbers to digits (speech recognition often hears "ten" not "10")
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
    // handle "twenty five" style compounds
    text = text.replace(/(\d+)\s+(\d+)\b/g, (m, a, b) =>
      parseInt(a) >= 20 && parseInt(b) < 10 ? String(parseInt(a) + parseInt(b)) : m
    );
    const repsM = text.match(/(\d+)\s*reps?/);
    const wM = text.match(/(\d+(?:\.\d+)?)\s*(kg|kilos?|lb|lbs|pounds?)/);
    // fallback: two bare numbers = reps then weight (e.g. "10 60")
    let reps = repsM ? repsM[1] : null,
      weight = wM ? wM[1] : null,
      wUnit = wM ? wM[2] : null;
    if (!reps && !weight) {
      const nums = text.match(/\d+(?:\.\d+)?/g);
      if (nums && nums.length >= 2) {
        reps = nums[0];
        weight = nums[1];
      } else if (nums && nums.length === 1) {
        reps = nums[0];
      }
    }
    if (reps || weight) {
      const rows = document.querySelectorAll(".set-row2:not(.voiced)");
      if (rows.length) {
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
  voiceRec.onend = () => {
    voiceRec = null;
    setVoiceBtn(false);
  };
  voiceRec.start();
  setVoiceBtn(true);
  $("voiceStatus").textContent = 'Listening… say "10 reps 60 kilos"';
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
  const compounds = EXERCISES.filter(
    e => ["chest", "back", "quads"].includes(e.primary) && (!myEq.length || myEq.includes(e.equipment))
  );
  while (picks.length < 6 && compounds.length) {
    const c = compounds.splice(Math.floor(Math.random() * compounds.length), 1)[0];
    if (!picks.includes(c)) picks.push(c);
  }
  const id = "coach-" + Date.now().toString(36);
  const prog = {
    id,
    name: "AI Coach Plan",
    tagline: "Generated for your weak points: " + weak.map(g => MUSCLE_INFO[g].name).join(", "),
    custom: true,
    level: "custom",
    daysPerWeek: 3,
    weeks: 4,
    equipment: "Mixed",
    days: [
      { name: "Day 1", exercises: picks.slice(0, 3).map(e => ({ id: e.id, sets: 3, reps: "10" })) },
      { name: "Day 2", exercises: picks.slice(3, 6).map(e => ({ id: e.id, sets: 3, reps: "10" })) },
      { name: "Day 3", exercises: picks.slice(0, 3).map(e => ({ id: e.id, sets: 3, reps: "12" })) }
    ]
  };
  const all = getCustomPrograms();
  all.push(prog);
  saveCustomPrograms(all);
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
  const vol = ws =>
    ws.reduce((a, w) => a + w.exercises.reduce((b, x) => b + x.sets.reduce((c, s) => c + s.weight * s.reps, 0), 0), 0);
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
