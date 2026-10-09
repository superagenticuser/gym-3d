/* FORGE - program list, detail, builder extras */
"use strict";

// PROGRAMS
const EXPRESS_POOL = [
  { id: "goblet-squat", sets: 3, reps: "10" },
  { id: "push-up", sets: 3, reps: "12" },
  { id: "dumbbell-romanian-deadlift", sets: 3, reps: "10" },
  { id: "chest-supported-dumbbell-row", sets: 3, reps: "10" },
  { id: "overhead-press", sets: 2, reps: "10" },
  { id: "glute-bridge", sets: 2, reps: "15" },
  { id: "plank", sets: 2, reps: "45s" },
  { id: "standing-calf-raise", sets: 2, reps: "15" }
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
  veil.addEventListener("click", e => {
    if (e.target === veil || e.target.closest(".modal-x")) close();
  });
  document.body.appendChild(veil);
  const topEl = veil.querySelector("#pyrTop"),
    botEl = veil.querySelector("#pyrBot"),
    stepsEl = veil.querySelector("#pyrSteps"),
    repsEl = veil.querySelector("#pyrReps"),
    dirEl = veil.querySelector("#pyrDir"),
    outEl = veil.querySelector("#pyrOut");
  function buildPlan() {
    const top = parseFloat(topEl.value),
      bot = parseFloat(botEl.value);
    let steps = Math.round(parseFloat(stepsEl.value) || 4);
    steps = Math.min(6, Math.max(3, steps));
    stepsEl.value = steps;
    const reps = Math.max(1, Math.round(parseFloat(repsEl.value) || 8));
    if (!(top > 0) || !(bot > 0)) {
      outEl.innerHTML = `<p class="muted" style="font-size:13px">Enter top and bottom weights to preview the pyramid.</p>`;
      return null;
    }
    const hi = Math.max(top, bot),
      lo = Math.min(top, bot),
      dir = dirEl.value;
    const wUser = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const raw = dir === "desc" ? hi - (hi - lo) * t : lo + (hi - lo) * t;
      wUser.push(Math.round(raw * 2) / 2);
    }
    const weightsKg = wUser.map(toKg);
    outEl.innerHTML =
      `<table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr style="color:var(--muted);text-align:left"><th style="padding:6px 4px">Step</th><th style="padding:6px 4px">Weight</th><th style="padding:6px 4px">Reps</th></tr>` +
      wUser
        .map(
          (w, i) =>
            `<tr style="border-top:1px solid var(--line)"><td style="padding:6px 4px">${i + 1}</td><td style="padding:6px 4px">${fmtW(weightsKg[i])}</td><td style="padding:6px 4px">${reps}</td></tr>`
        )
        .join("") +
      `</table>`;
    return { steps, reps, weightsKg, repsArr: Array(steps).fill(reps) };
  }
  veil.querySelector("#pyrPreviewBtn").addEventListener("click", buildPlan);
  [topEl, botEl, stepsEl, repsEl, dirEl].forEach(el => el.addEventListener("input", buildPlan));
  buildPlan();
  veil.querySelector("#pyrStart").addEventListener("click", () => {
    const plan = buildPlan();
    if (!plan) {
      appAlert("Enter valid top and bottom weights first.");
      return;
    }
    const prog = {
      id: "pyramid-" + Date.now().toString(36),
      name: ex.name + " Pyramid",
      tagline: "Pyramid session",
      custom: true,
      level: "custom",
      daysPerWeek: 1,
      weeks: 1,
      equipment: ex.equipment || "Mixed",
      days: [
        {
          name: "Pyramid session",
          exercises: [
            { id: ex.id, sets: plan.steps, reps: String(plan.reps), repsArr: plan.repsArr, weightsArr: plan.weightsKg }
          ]
        }
      ]
    };
    const all = getCustomPrograms();
    all.push(prog);
    saveCustomPrograms(all);
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
  const prog = {
    id: "express-" + Date.now().toString(36),
    name: "20-Minute Express",
    tagline: "Full-body condensed session",
    custom: true,
    level: "custom",
    daysPerWeek: 1,
    weeks: 1,
    equipment: "Mixed",
    express: true,
    days: [{ name: "Express session", exercises: picks }]
  };
  const all = getCustomPrograms();
  all.push(prog);
  saveCustomPrograms(all);
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

const DUNGEON_TITLES = [
  "Goblin ambush",
  "Skeleton crypt",
  "Dragon's lair",
  "Orc war camp",
  "Dark dungeon",
  "Troll bridge"
];

function startDungeon() {
  const groups = [...new Set(EXERCISES.map(e => e.primary))];
  for (let i = groups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [groups[i], groups[j]] = [groups[j], groups[i]];
  }
  const picks = [];
  for (const g of groups) {
    if (picks.length >= 5) break;
    const cands = EXERCISES.filter(e => e.primary === g);
    if (!cands.length) continue;
    const ex = cands[Math.floor(Math.random() * cands.length)];
    picks.push({ id: ex.id, sets: 3, reps: "8-12" });
  }
  const title = DUNGEON_TITLES[Math.floor(Math.random() * DUNGEON_TITLES.length)];
  const prog = {
    id: "dungeon-" + Date.now().toString(36),
    name: "Dungeon: " + title,
    tagline: "Random encounter. Finish it for +100 bonus XP.",
    custom: true,
    level: "custom",
    daysPerWeek: 1,
    weeks: 1,
    equipment: "Mixed",
    dungeon: true,
    days: [{ name: "The encounter", exercises: picks }]
  };
  const all = getCustomPrograms();
  all.push(prog);
  saveCustomPrograms(all);
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
  $("programGrid").innerHTML = allPrograms()
    .map(p => {
      const n = p.days.reduce((a, d) => a + d.exercises.length, 0);
      const isActive = activeId === p.id;
      const pIcon =
        {
          "full-body-starter": "dumbbell",
          "push-pull-legs": "arrow-right",
          "upper-lower": "calendar",
          "strength-5x5": "trophy",
          "dumbbell-home": "flame",
          "hiit-conditioning": "zap"
        }[p.id] || (p.custom ? "plus" : "dumbbell");
      return `<div class="prog-card" data-prog="${p.id}">
      <div class="prog-top"><span class="prog-icon">${window.FORGE_ICON(pIcon)}</span>
      <h3>${esc(p.name)} ${isActive ? '<span class="tag volt-tag">Active</span>' : ""} ${p.custom ? '<span class="tag">Custom</span>' : ""}</h3></div>
      <p class="muted">${esc(p.tagline)}</p>
      <div class="meta">
        <span class="tag volt-tag">${cap1(p.level)}</span>
        <span class="tag">${p.daysPerWeek} day${p.daysPerWeek === 1 ? "" : "s"}/wk</span>
        <span class="tag">${p.weeks} week${p.weeks === 1 ? "" : "s"}</span>
      </div>
      <p class="muted" style="margin-top:10px;font-size:13px">${p.days.length} workout${p.days.length === 1 ? "" : "s"} · ${n} exercises · ${esc(p.equipment)}</p>
    </div>`;
    })
    .join("");
}

document.addEventListener("click", e => {
  const pc = e.target.closest("[data-prog]");
  if (pc) location.hash = "#/program/" + pc.dataset.prog;
});

// PROGRAM DETAIL
function renderProgram(id) {
  const p = progById(id);
  if (!p) {
    location.hash = "#/programs";
    return;
  }
  $("pgName").textContent = p.name;
  $("pgTag").textContent = p.tagline;
  $("pgBadges").innerHTML = `<span class="tag volt-tag">${cap1(p.level)}</span>
     <span class="tag">${p.daysPerWeek} day${p.daysPerWeek === 1 ? "" : "s"}/week</span>
     <span class="tag">${p.weeks} week${p.weeks === 1 ? "" : "s"}</span>
     <span class="tag">${esc(p.equipment)}</span>`;
  const isActive = getActiveProg() === p.id;
  const ni = nextDayIdx(p);
  $("pgActions").innerHTML = isActive
    ? `<a class="btn btn-primary btn-sm" href="#/workout/${p.id}/${ni}">Continue: ${esc(p.days[ni].name)}</a>
       <button class="btn btn-ghost btn-sm" id="pgStop">Stop program</button>`
    : `<button class="btn btn-primary btn-sm" id="pgStart">Start this program</button>`;
  const st = $("pgStart");
  if (st)
    st.onclick = () => {
      setActiveProg(p.id);
      renderProgram(p.id);
    };
  const sp = $("pgStop");
  if (sp)
    sp.onclick = () => {
      setActiveProg(null);
      renderProgram(p.id);
    };
  $("pgActions").innerHTML +=
    ` <button class="btn btn-ghost btn-sm" id="pgICS" title="Download a calendar file">Export to calendar</button>`;
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
      p.mesocycle
        .map(
          w => `
        <h3 style="margin:20px 0 12px">${w.deload ? "Week " + w.week + " (Deload)" : "Week " + w.week}</h3>
        ${w.days
          .map(
            (d, di) => `
          <div class="day-card">
            <div class="day-head">
              <h3>${esc(d.name)}</h3>
              <a class="btn btn-primary btn-sm" href="#/workout/${p.id}/${di}?week=${w.week}">Start workout</a>
            </div>
            <div class="day-exercises">
              ${d.exercises
                .map(x => {
                  const ex = byId(x.id);
                  return `<div class="mini-card" data-ex="${x.id}"><b>${esc(ex ? ex.name : x.id)}</b><span>${x.sets} × ${esc(x.reps)} @ ${fmtW(x.weight)}</span></div>`;
                })
                .join("")}
            </div>
          </div>`
          )
          .join("")}
      `
        )
        .join("")
    : p.days
        .map((d, di) => {
          const key = p.id + ":" + di;
          const times = (done[key] || []).length;
          return `<div class="day-card">
      <div class="day-head">
        <h3>${esc(d.name)} ${times ? `<span class="done-mark">${window.FORGE_ICON("check")} ${times}x</span>` : ""}</h3>
        <a class="btn btn-primary btn-sm" href="#/workout/${p.id}/${di}">Start workout</a>
      </div>
      <div class="day-exercises">
      ${d.exercises
        .map(x => {
          const ex = byId(x.id);
          return `<div class="mini-card" data-ex="${x.id}"><b>${esc(ex ? ex.name : x.id)}</b><span>${x.sets} × ${esc(x.reps)}</span></div>`;
        })
        .join("")}
      </div>
    </div>`;
        })
        .join("");
}

function exportProgramICS(pid) {
  const p = progById(pid);
  if (!p) return;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FORGE//Workout//EN"];
  const start = new Date();
  start.setDate(start.getDate() + 1);
  for (let wk = 0; wk < 4; wk++) {
    p.days.forEach((d, di) => {
      const dt = new Date(start);
      dt.setDate(dt.getDate() + wk * 7 + di);
      const ds = fmtDate(dt).replace(/-/g, "");
      lines.push(
        "BEGIN:VEVENT",
        "UID:forge-" + pid + "-" + wk + "-" + di + "@forge",
        "DTSTART:" + ds + "T180000",
        "DURATION:PT1H",
        "SUMMARY:FORGE " + d.name.replace(/[,;\\]/g, ""),
        "DESCRIPTION:" +
          d.exercises
            .map(x => {
              const ex = byId(x.id);
              return (ex ? ex.name : x.id) + " " + x.sets + "x" + x.reps;
            })
            .join(", ")
            .replace(/[,;\\]/g, ""),
        "END:VEVENT"
      );
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
