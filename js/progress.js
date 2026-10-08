/* FORGE - progress tracking: stats, charts, check-in, measures, photos */
'use strict';


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
  if (!total) return `<h3 style="margin-top:20px">Movement balance</h3>` + emptyNote("No training data in the last 28 days", "Log workouts and your movement balance will appear here.");
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
    <div class="insights-grid">
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
    </div>
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
    return `<h3 style="margin-top:20px">RPE trend</h3>` + emptyNote("No RPE data yet", "Log RPE on your sets and the trend will appear here.");
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
  { id: "vol-week", name: "Volume week", desc: "Hit 20,000 kg total volume in 7 days", target: 20000, metric: "volume7" }


,
  { id: "freq-week", name: "5x week", desc: "Train 5 times in 7 days", target: 5, metric: "freq7" }


,
  { id: "streak-14", name: "2-week streak", desc: "14-day streak", target: 14, metric: "streak" }


,
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
  { id: "first", icon: "target", name: "First workout", desc: "Log your first workout", check: log => log.length >= 1 }


,
  { id: "ten", icon: "flame", name: "Getting serious", desc: "Log 10 workouts", check: log => log.length >= 10 }


,
  { id: "fifty", icon: "dumbbell", name: "Committed", desc: "Log 50 workouts", check: log => log.length >= 50 }


,
  { id: "streak7", icon: "zap", name: "Week streak", desc: "7-day streak", check: (log, streak) => streak >= 7 }


,
  { id: "streak30", icon: "star", name: "Month streak", desc: "30-day streak", check: (log, streak) => streak >= 30 }


,
  { id: "vol10k", icon: "dumbbell", name: "Volume king", desc: "10,000 kg in one workout", check: log => log.some(w => w.exercises.reduce((a, x) => a + x.sets.reduce((b, s) => b + setVolumeKg(x.id, s), 0), 0) >= 10000) }


,
  { id: "hundred", icon: "trophy", name: "Century", desc: "Log 100 workouts", check: log => log.length >= 100 }


,
  { id: "dl100", icon: "dumbbell", name: "Triple digits", desc: "Deadlift 100 kg", check: log => log.some(w => w.exercises.some(x => { const ex = byId(x.id); return ex && /deadlift/i.test(ex.name) && x.sets.some(s => (s.weight || 0) >= 100); })) }


,
  { id: "vol100k", icon: "flame", name: "100-ton club", desc: "100,000 kg lifetime volume", check: log => totalVolumeKg(log) >= 100000 }


,
  { id: "xp5k", icon: "zap", name: "Rising star", desc: "Earn 5,000 XP", check: () => getXP().xp >= 5000 }


,
  { id: "earlybird", icon: "star", name: "Consistent", desc: "Train 4 weeks in a row", check: log => weeklyStreak(log) >= 4 }


,
  { id: "allmuscles", icon: "map", name: "Full body", desc: "Train all 17 muscle groups", check: log => {
    const groups = new Set();
    log.forEach(w => w.exercises.forEach(x => { const ex = byId(x.id); if (ex) groups.add(ex.primary); }));
    return groups.size >= 17;
  }}


,
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
      <button class="btn btn-ghost btn-sm" id="photoCamBtn" style="margin:0">Take photo</button>
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
  $("photoCamBtn").addEventListener("click", openPhotoCapture);
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
}


);


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
    <div class="photo-item ${compareSel.includes(i) ? "cmp-sel" : ""}" data-pcmp="${i}" style="position:relative">
      <img src="${p.src}" alt="Progress photo ${p.date}" />
      ${p.pose ? `<span class="photo-pose-tag">${esc(p.pose)}</span>` : ""}
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
  { id: "barbell-back-squat", name: "Squat", ratios: [0.75, 1.0, 1.5, 2.0, 2.5] }


,
  { id: "barbell-bench-press", name: "Bench", ratios: [0.5, 0.75, 1.0, 1.5, 1.75] }


,
  { id: "barbell-deadlift", name: "Deadlift", ratios: [1.0, 1.25, 1.75, 2.25, 2.75] }


,
  { id: "barbell-overhead-press", name: "Overhead press", ratios: [0.35, 0.5, 0.75, 1.0, 1.25] }


,
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
    const rated = log.filter(w => w.rating);
    const avgRating = rated.length ? (rated.reduce((a, w) => a + w.rating, 0) / rated.length) : 0;
    const fiveStar = rated.filter(w => w.rating === 5 && w.durationMin);
    const avgFiveDur = fiveStar.length ? Math.round(fiveStar.reduce((a, w) => a + w.durationMin, 0) / fiveStar.length) : 0;
    const withDur = log.filter(w => w.durationMin);
    const avgDur = withDur.length ? Math.round(withDur.reduce((a, w) => a + w.durationMin, 0) / withDur.length) : 0;
    body.innerHTML = `<div class="stat-grid">
      <div class="stat-card"><b data-cu="${log.length}">0</b><span>workouts logged</span></div>
      <div class="stat-card"><b data-cu="${workoutStreak()}">0</b><span>day streak</span></div>
      <div class="stat-card"><b data-cu="${totalSets}">0</b><span>total sets</span></div>
      <div class="stat-card"><b data-cu="${totalVol}" data-cufmt="w">0</b><span>total volume</span></div>
      <div class="stat-card"><b data-cu="${recoveryScore()}" data-cufmt="pct">0</b><span>recovery</span></div>
      <div class="stat-card"><b>${xpLevel(getXP().xp)}</b><span>level (${getXP().xp.toLocaleString()} XP)</span></div>
      <div class="stat-card"><b>${getXP().freeze || 0}</b><span>streak freeze${(getXP().freeze || 0) === 1 ? "" : "s"}</span></div>
      ${rated.length ? `<div class="stat-card"><b>${avgRating.toFixed(1)} ★</b><span>avg rating (${rated.length})</span></div>` : ""}
      ${avgDur ? `<div class="stat-card"><b>${avgDur} min</b><span>avg workout pace</span></div>` : ""}
    </div>
    ${avgFiveDur ? `<p class="rating-avg">Your 5-star workouts average ${avgFiveDur} min.</p>` : ""}
    ${checkDeload() ? `<div class="onerm-box warn"><b>${window.FORGE_ICON ? window.FORGE_ICON("triangle-alert") : ""} Deload suggested:</b> <span class="muted">Volume dropping, consider a light week.</span></div>` : ""}
    <h3 style="margin-top:20px">Last 16 weeks</h3>
    ${streakCalendar(log)}
    <p class="muted">Volume = weight × reps across every logged set (bodyweight included for bodyweight moves).</p>`;
    body.querySelectorAll("[data-cu]").forEach(b => {
      const v = parseFloat(b.dataset.cu), f = b.dataset.cufmt;
      countUp(b, v, f === "w" ? (x => Math.round(fromKg(x)).toLocaleString() + " " + unitLabel()) : f === "pct" ? (x => Math.round(x) + "%") : undefined);
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
    // PR timeline: scan logs chronologically, record each time a weight PR was beaten
    const prEvents = [];
    const bestSoFar = {};
    const sortedLog = getLog().slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.ts || 0) - (b.ts || 0)));
    sortedLog.forEach(w => {
      (w.exercises || []).forEach(x => {
        (x.sets || []).forEach(s => {
          const wgt = s.weight || 0;
          if (wgt <= 0) return;
          const cur = bestSoFar[x.id] || 0;
          if (wgt > cur) {
            bestSoFar[x.id] = wgt;
            const ex = byId(x.id);
            prEvents.push({ date: w.date, id: x.id, name: ex ? ex.name : x.id, weight: wgt, reps: s.reps || 0 });
          }
        });
      });
    });
    prEvents.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const prExIds = [...new Set(prEvents.map(e => e.id))].sort((a, b) => {
      const ea = byId(a), eb = byId(b);
      return (ea ? ea.name : a).localeCompare(eb ? eb.name : b);
    });
    // volume records per muscle group (daily + weekly best)
    const volRecs = (function () {
      const daily = {}, weekly = {};
      const log = getLog();
      log.forEach(w => {
        const dayVol = {};
        (w.exercises || []).forEach(x => {
          const ex = byId(x.id); if (!ex) return;
          const v = (x.sets || []).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
          [groupOf(ex.primary)].concat((ex.secondary || []).map(groupOf)).forEach(g => {
            dayVol[g] = (dayVol[g] || 0) + v;
          });
        });
        Object.keys(dayVol).forEach(g => {
          if (!daily[g] || dayVol[g] > daily[g].vol) daily[g] = { vol: dayVol[g], date: w.date };
        });
      });
      // weekly: group by ISO week starting Monday
      const weekVol = {};
      log.forEach(w => {
        const d = new Date(w.date + "T00:00:00");
        const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        const wk = fmtDate(mon);
        (w.exercises || []).forEach(x => {
          const ex = byId(x.id); if (!ex) return;
          const v = (x.sets || []).reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
          [groupOf(ex.primary)].concat((ex.secondary || []).map(groupOf)).forEach(g => {
            const k = wk + "|" + g;
            weekVol[k] = (weekVol[k] || 0) + v;
          });
        });
      });
      Object.keys(weekVol).forEach(k => {
        const [wk, g] = k.split("|");
        if (!weekly[g] || weekVol[k] > weekly[g].vol) weekly[g] = { vol: weekVol[k], date: wk };
      });
      return { daily, weekly };
    })();
    const volGroups = [...new Set([...Object.keys(volRecs.daily), ...Object.keys(volRecs.weekly)])].sort();
    body.innerHTML = (recs.length ? `<h3 style="margin-top:0">Current records</h3>` + recs.map(({ ex, pr }) =>
      `<div class="rec-row">${window.FORGE_ICON("trophy")}<b>${esc(ex.name)}</b><span>${pr.weight > 0 ? fmtW(pr.weight) + " × " + pr.reps : pr.reps + " reps"}</span></div>`
    ).join("") : `<div class="empty-note"><p><b>No records yet.</b></p><p>Log a workout to set your first.</p></div>`)
    + (volGroups.length ? `<h3 style="margin-top:20px">Volume records</h3><p class="muted" style="font-size:13px;margin-bottom:12px">Best single-day and single-week volume per muscle group.</p>` +
      volGroups.map(g => {
        const d = volRecs.daily[g], wk = volRecs.weekly[g];
        const nm = MUSCLE_INFO[g] ? MUSCLE_INFO[g].name : g;
        return `<div class="vol-rec-row"><b>${esc(nm)}</b><span>${d ? `Day: ${Math.round(d.vol).toLocaleString()} kg (${d.date})` : ""}${d && wk ? " · " : ""}${wk ? `Week: ${Math.round(wk.vol).toLocaleString()} kg (w/c ${wk.date})` : ""}</span></div>`;
      }).join("") : "")
    + `<div class="pr-timeline"><h3>PR timeline</h3>
      ${prEvents.length ? `<div class="pr-filter"><select id="prFilter"><option value="">All exercises</option>${prExIds.map(id => { const e = byId(id); return `<option value="${id}">${esc(e ? e.name : id)}</option>`; }).join("")}</select></div>
      <div class="pr-feed" id="prFeed"></div>` : `<div class="empty-note"><p><b>No PR history yet.</b></p><p>Your PR milestones will appear here as you train.</p></div>`}
    </div>`;
    // PR timeline filter
    const renderPRFeed = (fid) => {
      const feed = $("prFeed");
      if (!feed) return;
      const list = fid ? prEvents.filter(e => e.id === fid) : prEvents;
      feed.innerHTML = list.length ? list.map(e =>
        `<div class="pr-item"><span class="pr-ic">${window.FORGE_ICON("trophy")}</span><div><div class="pb">${esc(e.name)} - ${fmtW(e.weight)} × ${e.reps}</div><div class="pm">${e.date}</div></div></div>`
      ).join("") : `<div class="empty-note"><p><b>Nothing here.</b></p><p>No PRs for this exercise yet.</p></div>`;
    };
    const pf = $("prFilter");
    if (pf) { renderPRFeed(""); pf.onchange = () => renderPRFeed(pf.value); }
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
