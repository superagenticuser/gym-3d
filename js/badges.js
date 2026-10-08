/* FORGE - achievement badges: definitions, evaluation, storage, celebration */
"use strict";

/* ---------- small helpers used by badge checks ---------- */
function _badgeWorkoutVolumeKg(w) {
  return (w.exercises || []).reduce((a, x) => a + (x.sets || []).reduce((b, s) => b + setVolumeKg(x.id, s), 0), 0);
}

function _badgeWeekStartKey(dateStr) {
  const d = new Date((dateStr || "") + "T12:00:00");
  if (isNaN(d)) return null;
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return fmtDate(mon);
}

// heaviest single set (kg) logged for any exercise whose name matches nameRe
function _badgeMaxLiftKg(log, nameRe) {
  let best = 0;
  (log || []).forEach(w =>
    (w.exercises || []).forEach(x => {
      const ex = byId(x.id);
      if (!ex || !nameRe.test(ex.name)) return;
      (x.sets || []).forEach(s => {
        const wt = s.weight || 0;
        if (wt > best) best = wt;
      });
    })
  );
  return best;
}

// number of distinct exercises with at least one weighted set logged (weight PR count)
function _badgePrExerciseCount(log) {
  const best = {};
  (log || []).forEach(w =>
    (w.exercises || []).forEach(x =>
      (x.sets || []).forEach(s => {
        const wt = s.weight || 0;
        if (wt > 0 && wt > (best[x.id] || 0)) best[x.id] = wt;
      })
    )
  );
  return Object.keys(best).length;
}

/* ---------- badge definitions ----------
   icon is an emoji shown in the badges grid and celebration UI.
   check(history) returns true when the badge is earned. All weights are kg. */
const BADGES = [
  {
    id: "first-workout",
    name: "First workout",
    desc: "Log your first workout",
    icon: "🎯",
    check: log => log.length >= 1
  },
  {
    id: "ten-workouts",
    name: "Getting serious",
    desc: "Log 10 workouts",
    icon: "🔥",
    check: log => log.length >= 10
  },
  {
    id: "fifty-workouts",
    name: "Committed",
    desc: "Log 50 workouts",
    icon: "💪",
    check: log => log.length >= 50
  },
  {
    id: "hundred-workouts",
    name: "Century club",
    desc: "Log 100 workouts",
    icon: "🏆",
    check: log => log.length >= 100
  },
  {
    id: "streak-7",
    name: "Week streak",
    desc: "Train 7 days in a row",
    icon: "⚡",
    check: () => workoutStreak() >= 7
  },
  {
    id: "streak-30",
    name: "Month streak",
    desc: "Train 30 days in a row",
    icon: "🌟",
    check: () => workoutStreak() >= 30
  },
  {
    id: "bench-100",
    name: "Triple-digit bench",
    desc: "Bench press 100 kg in a single set",
    icon: "🏋️",
    check: log => _badgeMaxLiftKg(log, /bench/i) >= 100
  },
  {
    id: "deadlift-140",
    name: "Deadlift milestone",
    desc: "Deadlift 140 kg in a single set",
    icon: "🦍",
    check: log => _badgeMaxLiftKg(log, /deadlift/i) >= 140
  },
  {
    id: "volume-1k-session",
    name: "Tonne session",
    desc: "Lift 1,000 kg in a single workout",
    icon: "🏗️",
    check: log => log.some(w => _badgeWorkoutVolumeKg(w) >= 1000)
  },
  {
    id: "volume-5k-session",
    name: "Five-tonne session",
    desc: "Lift 5,000 kg in a single workout",
    icon: "🚀",
    check: log => log.some(w => _badgeWorkoutVolumeKg(w) >= 5000)
  },
  {
    id: "exercises-25",
    name: "Explorer",
    desc: "Train 25 different exercises",
    icon: "🗺️",
    check: log => {
      const ids = new Set();
      log.forEach(w => (w.exercises || []).forEach(x => ids.add(x.id)));
      return ids.size >= 25;
    }
  },
  {
    id: "exercises-50",
    name: "Variety pack",
    desc: "Train 50 different exercises",
    icon: "🧭",
    check: log => {
      const ids = new Set();
      log.forEach(w => (w.exercises || []).forEach(x => ids.add(x.id)));
      return ids.size >= 50;
    }
  },
  {
    id: "exercises-100",
    name: "Century of moves",
    desc: "Train 100 different exercises",
    icon: "🎖️",
    check: log => {
      const ids = new Set();
      log.forEach(w => (w.exercises || []).forEach(x => ids.add(x.id)));
      return ids.size >= 100;
    }
  },
  {
    id: "first-pr",
    name: "Record breaker",
    desc: "Set your first personal record",
    icon: "🥇",
    check: log => _badgePrExerciseCount(log) >= 1
  },
  {
    id: "prs-10",
    name: "PR machine",
    desc: "Set personal records on 10 exercises",
    icon: "🏅",
    check: log => _badgePrExerciseCount(log) >= 10
  },
  {
    id: "early-bird",
    name: "Early bird",
    desc: "Finish a workout before 7 AM",
    icon: "🌅",
    check: log => log.some(w => w.ts && new Date(w.ts).getHours() < 7)
  },
  {
    id: "night-owl",
    name: "Night owl",
    desc: "Finish a workout after 9 PM",
    icon: "🌙",
    check: log => log.some(w => w.ts && new Date(w.ts).getHours() >= 21)
  },
  {
    id: "weekend-warrior",
    name: "Weekend warrior",
    desc: "Train both Saturday and Sunday in one weekend",
    icon: "🥊",
    check: log => {
      const weeks = {};
      log.forEach(w => {
        const d = new Date((w.date || "") + "T12:00:00");
        if (isNaN(d)) return;
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) return;
        const k = _badgeWeekStartKey(w.date);
        if (!k) return;
        weeks[k] = weeks[k] || new Set();
        weeks[k].add(dow);
      });
      return Object.keys(weeks).some(k => weeks[k].size === 2);
    }
  },
  {
    id: "perfect-week",
    name: "Perfect week",
    desc: "Train 5 or more times in a single week",
    icon: "📅",
    check: log => {
      const counts = {};
      log.forEach(w => {
        const k = _badgeWeekStartKey(w.date);
        if (!k) return;
        counts[k] = (counts[k] || 0) + 1;
      });
      return Object.keys(counts).some(k => counts[k] >= 5);
    }
  },
  {
    id: "streak-365",
    name: "Iron year",
    desc: "Train 365 days in a row",
    icon: "💎",
    check: () => workoutStreak() >= 365
  }
];

/* ---------- storage ----------
   forge-badges: { badgeId: earnedTimestamp }. Legacy format was an array of
   ids; it is migrated in place, mapping old ids to their new equivalents. */
const _BADGE_LEGACY_MAP = {
  first: "first-workout",
  ten: "ten-workouts",
  fifty: "fifty-workouts",
  hundred: "hundred-workouts",
  streak7: "streak-7",
  streak30: "streak-30"
};

function getEarnedBadges() {
  try {
    const raw = localStorage.getItem("forge-badges");
    if (!raw) return {};
    const d = JSON.parse(raw);
    if (Array.isArray(d)) {
      const now = Date.now();
      const obj = {};
      d.forEach(id => {
        const mapped = _BADGE_LEGACY_MAP[id] || id;
        obj[mapped] = now;
      });
      saveEarnedBadges(obj);
      // legacy badges were already celebrated by the old toast, do not re-celebrate
      try {
        localStorage.setItem("forge-badges-seen", String(now));
      } catch (e2) {}
      return obj;
    }
    return d && typeof d === "object" ? d : {};
  } catch (e) {
    return {};
  }
}

function saveEarnedBadges(obj) {
  try {
    localStorage.setItem("forge-badges", JSON.stringify(obj));
  } catch (e) {}
}

// legacy helper kept for callers that only need earned ids
function getBadges() {
  return Object.keys(getEarnedBadges());
}

// earned date for one badge, "YYYY-MM-DD", or null
function badgeEarnedOn(id) {
  const ts = getEarnedBadges()[id];
  if (!ts) return null;
  try {
    return fmtDate(new Date(ts));
  } catch (e) {
    return null;
  }
}

/* ---------- evaluation ---------- */
// Evaluate every badge against the workout log, store newly earned badges with
// the current date, and return the newly earned badge objects.
function checkBadges() {
  const log = getLog();
  const earned = getEarnedBadges();
  const fresh = [];
  BADGES.forEach(b => {
    if (earned[b.id]) return;
    let ok = false;
    try {
      ok = !!b.check(log);
    } catch (e) {
      ok = false;
    }
    if (ok) {
      earned[b.id] = Date.now();
      fresh.push(b);
    }
  });
  if (fresh.length) saveEarnedBadges(earned);
  return fresh;
}

/* ---------- celebration ---------- */
// Returns badge objects earned since the last check (last getNewBadges or
// markBadgesSeen call), then marks them seen so each badge celebrates once.
// Drive the celebration UI from this function's return value.
function getNewBadges() {
  let seen = 0;
  try {
    seen = parseInt(localStorage.getItem("forge-badges-seen") || "0", 10) || 0;
  } catch (e) {}
  const earned = getEarnedBadges();
  const out = BADGES.filter(b => earned[b.id] && earned[b.id] > seen);
  markBadgesSeen();
  return out;
}

// Record that the user has seen the current badges (e.g. opened the Badges tab).
function markBadgesSeen() {
  try {
    localStorage.setItem("forge-badges-seen", String(Date.now()));
  } catch (e) {}
}

// Show a celebration popup for newly earned badges
function showBadgeCelebration(badges) {
  if (!badges || !badges.length) return;
  const old = document.querySelector(".badge-celebrate-veil");
  if (old) old.remove();
  const veil = document.createElement("div");
  veil.className = "badge-celebrate-veil";
  veil.innerHTML = `<div class="badge-celebrate" role="dialog" aria-modal="true">
    <div class="badge-celebrate-icon">🏆</div>
    <h3>New badge${badges.length > 1 ? "s" : ""} earned!</h3>
    ${badges.map(b => `<div class="badge-celebrate-item"><span class="badge-icon">${b.icon}</span><div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div></div>`).join("")}
    <button class="btn btn-primary" id="badgeCelebrateOk">Nice!</button>
  </div>`;
  veil.querySelector("#badgeCelebrateOk").onclick = () => veil.remove();
  veil.addEventListener("click", e => {
    if (e.target === veil) veil.remove();
  });
  document.body.appendChild(veil);
}
