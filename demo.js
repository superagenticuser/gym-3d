/* FORGE — animated stick-figure exercise demos.
   Parametric 2D figure (side view) with keyframed poses per movement pattern.
   Each animation's frames sync to the exercise's written steps. */
(function () {
  'use strict';
  const D = Math.PI / 180;

  /* ---------- pose helpers ---------- */
  // Standing skeleton -> explicit joints {hd,sh,el,ha,hip,kn,an,kn2,an2} (x,y world, y up)
  function S(o) {
    o = Object.assign({ hx: 0, hy: 0.95, lean: 6, arm: 8, elb: 10, hipF: 2, knee: 6 }, o);
    const T = o.lean * D, A = o.arm * D, E = o.elb * D, HF = o.hipF * D, K = o.knee * D;
    const hip = { x: o.hx, y: o.hy };
    const kn = { x: hip.x + Math.sin(HF) * 0.44, y: hip.y - Math.cos(HF) * 0.44 };
    const an = { x: kn.x + Math.sin(HF - K) * 0.44, y: kn.y - Math.cos(HF - K) * 0.44 };
    const HF2 = (o.hipF2 == null ? o.hipF : o.hipF2) * D, K2 = (o.knee2 == null ? o.knee : o.knee2) * D;
    const kn2 = { x: hip.x + Math.sin(HF2) * 0.44, y: hip.y - Math.cos(HF2) * 0.44 };
    const an2 = { x: kn2.x + Math.sin(HF2 - K2) * 0.44, y: kn2.y - Math.cos(HF2 - K2) * 0.44 };
    const sh = { x: hip.x + Math.sin(T) * 0.52, y: hip.y + Math.cos(T) * 0.52 };
    const hd = { x: sh.x + Math.sin(T) * 0.17, y: sh.y + Math.cos(T) * 0.17 };
    const el = { x: sh.x + Math.sin(A) * 0.30, y: sh.y - Math.cos(A) * 0.30 };
    const ha = { x: el.x + Math.sin(A - E) * 0.28, y: el.y - Math.cos(A - E) * 0.28 };
    return { hd, sh, el, ha, hip, kn, an, kn2, an2 };
  }
  // Explicit pose (defaults = lying on back); override any joints with [x,y]
  const XD = { hd: [-0.78, 0.55], sh: [-0.52, 0.47], el: [-0.30, 0.47], ha: [-0.30, 0.95], hip: [0.05, 0.44], kn: [0.45, 0.32], an: [0.78, 0.10], kn2: [0.45, 0.32], an2: [0.78, 0.10] };
  function X(o) {
    const r = {};
    for (const k in XD) { const v = (o && o[k]) || XD[k]; r[k] = { x: v[0], y: v[1] }; }
    return r;
  }
  const lerpJ = (a, b, t) => {
    const r = {};
    for (const k in a) r[k] = { x: a[k].x + (b[k].x - a[k].x) * t, y: a[k].y + (b[k].y - a[k].y) * t };
    return r;
  };
  const ease = t => t * t * (3 - 2 * t);

  /* ---------- animations: frames of {p: joints, dur, step} ---------- */
  const HINGE = { hx: -0.35, hy: 0.66, lean: 62, hipF: 60, knee: 35 };
  const ANIMS = {
    bench: { hot: 'arms', prop: 'barbell', frames: [
      { p: X({ ha: [-0.32, 0.60], el: [-0.45, 0.33] }), dur: 1.3, step: 1 },
      { p: X({ ha: [-0.32, 1.04], el: [-0.33, 0.74] }), dur: 1.1, step: 2 } ] },
    pushup: { hot: 'arms', frames: [
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.10, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 1.1, step: 1 },
      { p: X({ hd: [0.20, 0.46], sh: [0.05, 0.40], el: [0.18, 0.22], ha: [0.05, 0.05], hip: [-0.52, 0.48], kn: [-0.82, 0.26], an: [-1.02, 0.07] }), dur: 1.1, step: 2 } ] },
    fly: { hot: 'arms', prop: 'dumbbells', frames: [
      { p: X({ ha: [-0.72, 0.72], el: [-0.58, 0.58] }), dur: 1.3, step: 1 },
      { p: X({ ha: [-0.32, 1.00], el: [-0.33, 0.78] }), dur: 1.1, step: 2 } ] },
    cableFly: { hot: 'arms', prop: 'cableFly', frames: [
      { p: S({ arm: 72, elb: 12 }), dur: 1.2, step: 1 },
      { p: S({ arm: 12, elb: 12 }), dur: 1.0, step: 2 } ] },
    dip: { hot: 'arms', frames: [
      { p: S({ arm: -22, elb: 12, lean: 10 }), dur: 1.0, step: 1 },
      { p: S({ hy: 0.76, arm: -38, elb: 88, lean: 14 }), dur: 1.2, step: 2 } ] },
    pressFwd: { hot: 'arms', frames: [
      { p: S({ arm: 88, elb: 70 }), dur: 1.1, step: 1 },
      { p: S({ arm: 88, elb: 8 }), dur: 1.0, step: 2 } ] },
    landmine: { hot: 'arms', prop: 'barbell', frames: [
      { p: S({ arm: 118, elb: 72, lean: 8 }), dur: 1.2, step: 1 },
      { p: S({ arm: 162, elb: 10, lean: 4 }), dur: 1.0, step: 2 } ] },
    bentRow: { hot: 'arms', prop: 'barbell', frames: [
      { p: S(Object.assign({ arm: 42, elb: 10 }, HINGE)), dur: 1.1, step: 1 },
      { p: S(Object.assign({ arm: -25, elb: 75 }, HINGE)), dur: 1.1, step: 2 } ] },
    cableRow: { hot: 'arms', prop: 'cableLow', frames: [
      { p: S({ hy: 0.62, hipF: 80, knee: 80, lean: 8, arm: 55, elb: 10 }), dur: 1.1, step: 1 },
      { p: S({ hy: 0.62, hipF: 80, knee: 80, lean: 8, arm: 5, elb: 78 }), dur: 1.1, step: 2 } ] },
    pullup: { hot: 'arms', prop: 'barFixed', frames: [
      { p: S({ arm: 165, elb: 12, hy: 0.95, knee: 25 }), dur: 1.3, step: 1 },
      { p: S({ arm: 150, elb: 72, hy: 1.22, knee: 25 }), dur: 1.1, step: 2 } ] },
    pulldown: { hot: 'arms', prop: 'cableTop', frames: [
      { p: S({ arm: 160, elb: 15 }), dur: 1.2, step: 1 },
      { p: S({ arm: 95, elb: 70 }), dur: 1.0, step: 2 } ] },
    pullover: { hot: 'arms', prop: 'dumbbell', frames: [
      { p: X({ ha: [-0.95, 0.50], el: [-0.80, 0.55] }), dur: 1.3, step: 1 },
      { p: X({ ha: [-0.32, 1.02], el: [-0.33, 0.76] }), dur: 1.1, step: 2 } ] },
    ohp: { hot: 'arms', prop: 'barbell', frames: [
      { p: S({ arm: 150, elb: 80 }), dur: 1.1, step: 1 },
      { p: S({ arm: 175, elb: 5 }), dur: 1.0, step: 2 } ] },
    raise: { hot: 'arms', prop: 'dumbbells', frames: [
      { p: S({ arm: 8, elb: 8 }), dur: 1.1, step: 1 },
      { p: S({ arm: 76, elb: 8 }), dur: 1.0, step: 2 } ] },
    bentRaise: { hot: 'arms', prop: 'dumbbells', frames: [
      { p: S(Object.assign({ arm: 15, elb: 10 }, HINGE)), dur: 1.1, step: 1 },
      { p: S(Object.assign({ arm: 65, elb: 10 }, HINGE)), dur: 1.0, step: 2 } ] },
    facePull: { hot: 'arms', prop: 'cableTop', frames: [
      { p: S({ arm: 70, elb: 10 }), dur: 1.1, step: 1 },
      { p: S({ arm: 40, elb: 95 }), dur: 1.0, step: 2 } ] },
    curl: { hot: 'arms', prop: 'barbell', frames: [
      { p: S({ arm: 8, elb: 8 }), dur: 1.1, step: 1 },
      { p: S({ arm: 8, elb: 115 }), dur: 1.0, step: 2 } ] },
    pushdown: { hot: 'arms', prop: 'cableTop', frames: [
      { p: S({ arm: 5, elb: 85 }), dur: 1.0, step: 1 },
      { p: S({ arm: 5, elb: 8 }), dur: 1.0, step: 2 } ] },
    overheadExt: { hot: 'arms', frames: [
      { p: S({ arm: 170, elb: 8 }), dur: 1.1, step: 1 },
      { p: S({ arm: 170, elb: 95 }), dur: 1.1, step: 2 } ] },
    skullcrusher: { hot: 'arms', prop: 'barbell', frames: [
      { p: X({ ha: [-0.68, 1.02], el: [-0.60, 0.70] }), dur: 1.0, step: 1 },
      { p: X({ ha: [-0.80, 0.72], el: [-0.62, 0.52] }), dur: 1.2, step: 2 } ] },
    kickback: { hot: 'arms', prop: 'dumbbell', frames: [
      { p: S(Object.assign({ arm: -30, elb: 85 }, HINGE)), dur: 1.0, step: 1 },
      { p: S(Object.assign({ arm: -30, elb: 8 }, HINGE)), dur: 1.0, step: 2 } ] },
    squat: { hot: 'legs', prop: 'barbell', frames: [
      { p: S({}), dur: 1.2, step: 1 },
      { p: S({ hy: 0.58, lean: 28, arm: 75, elb: 8, hipF: 78, knee: 95 }), dur: 1.3, step: 2 } ] },
    lunge: { hot: 'legs', prop: 'dumbbells', frames: [
      { p: S({}), dur: 1.1, step: 1 },
      { p: S({ hy: 0.60, lean: 8, hipF: 75, knee: 88, hipF2: -40, knee2: 65 }), dur: 1.3, step: 2 } ] },
    legPress: { hot: 'legs', prop: 'platform', frames: [
      { p: X({ hip: [0.0, 0.42], kn: [-0.15, 1.02], an: [-0.15, 1.42], kn2: [-0.15, 1.02], an2: [-0.15, 1.42] }), dur: 1.2, step: 1 },
      { p: X({ hip: [0.0, 0.42], kn: [-0.10, 1.24], an: [-0.10, 1.68], kn2: [-0.10, 1.24], an2: [-0.10, 1.68] }), dur: 1.1, step: 2 } ] },
    legExtension: { hot: 'legs', frames: [
      { p: S({ hy: 0.58, hipF: 85, knee: 85, lean: 5 }), dur: 1.1, step: 1 },
      { p: S({ hy: 0.58, hipF: 85, knee: 8, lean: 5 }), dur: 1.1, step: 2 } ] },
    hinge: { hot: 'legs', frames: [
      { p: S({}), dur: 1.2, step: 1 },
      { p: S(Object.assign({ arm: 30, elb: 8 }, HINGE)), dur: 1.3, step: 2 } ] },
    deadlift: { hot: 'full', prop: 'barbell', frames: [
      { p: S({ hx: -0.30, hy: 0.60, lean: 55, arm: 25, elb: 8, hipF: 65, knee: 45 }), dur: 1.3, step: 1 },
      { p: S({}), dur: 1.2, step: 2 } ] },
    legCurl: { hot: 'legs', frames: [
      { p: X({ hd: [0.75, 0.30], sh: [0.55, 0.28], el: [0.35, 0.28], ha: [0.15, 0.28], hip: [0.0, 0.28], kn: [-0.42, 0.22], an: [-0.80, 0.15] }), dur: 1.1, step: 1 },
      { p: X({ hd: [0.75, 0.30], sh: [0.55, 0.28], el: [0.35, 0.28], ha: [0.15, 0.28], hip: [0.0, 0.28], kn: [-0.40, 0.30], an: [-0.48, 0.62] }), dur: 1.1, step: 2 } ] },
    nordic: { hot: 'legs', frames: [
      { p: S({ hy: 0.52, hipF: 5, knee: 85, lean: 5, arm: 10 }), dur: 1.4, step: 1 },
      { p: S({ hy: 0.52, hipF: 5, knee: 85, lean: 48, arm: 10 }), dur: 1.6, step: 2 } ] },
    calfRaise: { hot: 'legs', frames: [
      { p: S({}), dur: 1.0, step: 1 },
      { p: S({ hy: 1.03, arm: 6 }), dur: 1.0, step: 2 } ] },
    hipThrust: { hot: 'legs', prop: 'bench', frames: [
      { p: X({ sh: [-0.55, 0.45], hd: [-0.68, 0.52], hip: [0.05, 0.34], kn: [0.42, 0.30], an: [0.62, 0.08] }), dur: 1.2, step: 1 },
      { p: X({ sh: [-0.55, 0.45], hd: [-0.68, 0.52], hip: [0.05, 0.60], kn: [0.40, 0.44], an: [0.62, 0.08] }), dur: 1.2, step: 2 } ] },
    swing: { hot: 'full', prop: 'dumbbell', frames: [
      { p: S(Object.assign({ arm: 25, elb: 5 }, HINGE)), dur: 1.0, step: 1 },
      { p: S({ hy: 0.95, lean: 8, arm: 80, elb: 5 }), dur: 0.9, step: 2 } ] },
    plankHold: { hot: 'core', frames: [
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.05, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 3.0, step: 1 } ] },
    crunch: { hot: 'core', frames: [
      { p: X({}), dur: 1.1, step: 1 },
      { p: X({ hd: [-0.70, 0.64], sh: [-0.48, 0.56], el: [-0.35, 0.55], ha: [-0.28, 0.60] }), dur: 1.1, step: 2 } ] },
    situp: { hot: 'core', frames: [
      { p: X({}), dur: 1.2, step: 1 },
      { p: X({ hd: [-0.30, 0.95], sh: [-0.18, 0.82], el: [-0.05, 0.80], ha: [0.05, 0.82], hip: [0.05, 0.44] }), dur: 1.3, step: 2 } ] },
    legRaise: { hot: 'core', prop: 'barFixed', frames: [
      { p: S({ arm: 168, elb: 8, hy: 0.92, hipF: 5, knee: 10 }), dur: 1.2, step: 1 },
      { p: S({ arm: 168, elb: 8, hy: 0.92, hipF: 80, knee: 15 }), dur: 1.2, step: 2 } ] },
    twist: { hot: 'core', prop: 'dumbbell', frames: [
      { p: S({ hy: 0.62, hipF: 80, knee: 80, lean: 15, arm: 45, elb: 20 }), dur: 1.0, step: 1 },
      { p: S({ hy: 0.62, hipF: 80, knee: 80, lean: 38, arm: 25, elb: 20 }), dur: 1.0, step: 2 } ] },
    sidePlank: { hot: 'core', frames: [
      { p: X({ hd: [-0.50, 0.78], sh: [-0.45, 0.64], el: [-0.45, 0.36], ha: [-0.45, 0.08], hip: [-0.10, 0.44], kn: [0.25, 0.26], an: [0.55, 0.08] }), dur: 3.0, step: 1 } ] },
    woodchopper: { hot: 'core', prop: 'cableTop', frames: [
      { p: S({ arm: 150, elb: 15, lean: 8 }), dur: 1.1, step: 1 },
      { p: S({ arm: 40, elb: 15, lean: 30 }), dur: 1.1, step: 2 } ] },
    carry: { hot: 'full', prop: 'dumbbells', frames: [
      { p: S({ hipF: 25, knee: 20, hipF2: -15, knee2: 30, arm: 5 }), dur: 0.8, step: 1 },
      { p: S({ hipF: -15, knee: 30, hipF2: 25, knee2: 20, arm: 5 }), dur: 0.8, step: 2 } ] },
    shrug: { hot: 'arms', prop: 'barbell', frames: [
      { p: S({ hy: 0.95 }), dur: 1.0, step: 1 },
      { p: S({ hy: 0.99, arm: 5 }), dur: 1.0, step: 2 } ] },
    burpee: { hot: 'full', frames: [
      { p: S({}), dur: 0.8, step: 0 },
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.10, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 0.9, step: 1 },
      { p: S({ hy: 1.08, arm: 170, elb: 5 }), dur: 0.9, step: 2 } ] },
    clean: { hot: 'full', prop: 'barbell', frames: [
      { p: S(Object.assign({ arm: 25, elb: 8 }, HINGE)), dur: 1.0, step: 0 },
      { p: S({ hy: 0.62, lean: 20, arm: 55, elb: 95, hipF: 70, knee: 85 }), dur: 1.0, step: 1 },
      { p: S({ arm: 60, elb: 90 }), dur: 1.0, step: 2 } ] },
    march: { hot: 'legs', frames: [
      { p: S({ hipF: 25, knee: 20, hipF2: -15, knee2: 30 }), dur: 0.7, step: 0 },
      { p: S({ hipF: -15, knee: 30, hipF2: 25, knee2: 20 }), dur: 0.7, step: 1 } ] },
    sprint: { hot: 'full', frames: [
      { p: S({ lean: 18, hipF: 55, knee: 60, hipF2: -30, knee2: 90, arm: 60, elb: 70 }), dur: 0.45, step: 0 },
      { p: S({ lean: 18, hipF: -30, knee: 90, hipF2: 55, knee2: 60, arm: -20, elb: 70 }), dur: 0.45, step: 1 } ] },
    highKnees: { hot: 'legs', frames: [
      { p: S({ hipF: 80, knee: 90, hipF2: 5, knee2: 10, arm: 30, elb: 40 }), dur: 0.5, step: 0 },
      { p: S({ hipF: 5, knee: 10, hipF2: 80, knee2: 90, arm: -10, elb: 40 }), dur: 0.5, step: 1 } ] },
    boxJump: { hot: 'legs', prop: 'box', frames: [
      { p: S({ hy: 0.58, lean: 28, arm: 40, hipF: 78, knee: 95 }), dur: 0.9, step: 0 },
      { p: S({ hy: 1.18, hipF: 70, knee: 100, arm: 120, elb: 10 }), dur: 0.8, step: 1 },
      { p: S({ hy: 0.72, lean: 20, hipF: 60, knee: 75, arm: 40 }), dur: 0.9, step: 2 } ] },
    wallSit: { hot: 'legs', prop: 'wall', frames: [
      { p: S({ hx: -0.55, hy: 0.60, lean: 5, hipF: 85, knee: 90, arm: 10 }), dur: 3.0, step: 1 } ] },
    deadbug: { hot: 'core', frames: [
      { p: X({ ha: [-0.50, 1.10], el: [-0.45, 0.80], kn: [0.30, 0.90], an: [0.32, 1.25] }), dur: 1.1, step: 0 },
      { p: X({ ha: [-0.85, 0.60], el: [-0.70, 0.55], kn: [0.45, 0.35], an: [0.70, 0.15] }), dur: 1.1, step: 1 } ] },
    hang: { hot: 'arms', prop: 'barFixed', frames: [
      { p: S({ arm: 168, elb: 8, hy: 0.92 }), dur: 3.0, step: 1 } ] },
    hangKneeRaise: { hot: 'core', prop: 'barFixed', frames: [
      { p: S({ arm: 168, elb: 8, hy: 0.92, hipF: 5, knee: 10 }), dur: 1.1, step: 0 },
      { p: S({ arm: 168, elb: 8, hy: 0.92, hipF: 75, knee: 85 }), dur: 1.1, step: 1 } ] },
    superman: { hot: 'core', frames: [
      { p: X({ hd: [0.70, 0.26], sh: [0.50, 0.25], el: [0.68, 0.24], ha: [0.88, 0.24], hip: [0.0, 0.25], kn: [-0.40, 0.22], an: [-0.75, 0.26] }), dur: 1.2, step: 0 },
      { p: X({ hd: [0.72, 0.44], sh: [0.52, 0.40], el: [0.70, 0.42], ha: [0.92, 0.44], hip: [0.0, 0.28], kn: [-0.40, 0.32], an: [-0.75, 0.48] }), dur: 1.4, step: 1 } ] },
    birddog: { hot: 'core', frames: [
      { p: X({ hd: [0.62, 0.74], sh: [0.50, 0.70], el: [0.72, 0.70], ha: [0.94, 0.70], hip: [-0.15, 0.68], kn: [-0.18, 0.32], an: [-0.20, 0.08], kn2: [-0.48, 0.64], an2: [-0.84, 0.68] }), dur: 1.3, step: 0 },
      { p: X({ hd: [0.62, 0.74], sh: [0.50, 0.70], el: [0.52, 0.45], ha: [0.54, 0.20], hip: [-0.15, 0.68], kn: [-0.18, 0.32], an: [-0.20, 0.08] }), dur: 1.3, step: 1 } ] },
    hyper: { hot: 'core', prop: 'bench', frames: [
      { p: X({ hd: [0.55, 0.36], sh: [0.40, 0.34], el: [0.30, 0.34], ha: [0.20, 0.34], hip: [0.0, 0.34], kn: [-0.40, 0.26], an: [-0.70, 0.12] }), dur: 1.2, step: 0 },
      { p: X({ hd: [0.60, 0.64], sh: [0.45, 0.56], el: [0.35, 0.54], ha: [0.25, 0.52], hip: [0.0, 0.35], kn: [-0.40, 0.26], an: [-0.70, 0.12] }), dur: 1.3, step: 1 } ] },
    highPull: { hot: 'full', prop: 'barbell', frames: [
      { p: S(Object.assign({ arm: 25, elb: 8 }, HINGE)), dur: 1.0, step: 0 },
      { p: S({ arm: 70, elb: 95, lean: 8 }), dur: 1.0, step: 1 } ] },
    thruster: { hot: 'full', prop: 'barbell', frames: [
      { p: S({ hy: 0.58, lean: 28, arm: 60, elb: 90, hipF: 78, knee: 95 }), dur: 1.1, step: 0 },
      { p: S({ arm: 172, elb: 6 }), dur: 1.0, step: 1 } ] },
    wallBall: { hot: 'full', prop: 'ball', frames: [
      { p: S({ hy: 0.58, lean: 28, arm: 45, elb: 60, hipF: 78, knee: 95 }), dur: 1.1, step: 0 },
      { p: S({ hy: 1.0, arm: 165, elb: 10 }), dur: 1.0, step: 1 } ] },
    uprightRow: { hot: 'arms', prop: 'barbell', frames: [
      { p: S({ arm: 10, elb: 10 }), dur: 1.0, step: 0 },
      { p: S({ arm: 45, elb: 100 }), dur: 1.0, step: 1 } ] },
    climbers: { hot: 'core', frames: [
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.10, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.30, 0.48], an: [-0.12, 0.18] }), dur: 0.55, step: 0 },
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.10, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 0.55, step: 1 } ] },
    jumpingJacks: { hot: 'full', frames: [
      { p: S({ arm: 8, hipF: 5 }), dur: 0.5, step: 0 },
      { p: S({ hy: 1.02, arm: 160, elb: 5, hipF: 18, hipF2: -18 }), dur: 0.5, step: 1 } ] },
    rollout: { hot: 'core', frames: [
      { p: X({ hip: [0.0, 0.52], kn: [-0.05, 0.16], an: [-0.08, 0.06], sh: [-0.02, 0.98], hd: [-0.02, 1.14], el: [0.10, 0.70], ha: [0.18, 0.45] }), dur: 1.4, step: 0 },
      { p: X({ hip: [-0.35, 0.42], kn: [-0.42, 0.16], an: [-0.45, 0.06], sh: [0.25, 0.50], hd: [0.38, 0.55], el: [0.35, 0.30], ha: [0.42, 0.12] }), dur: 1.6, step: 1 } ] },
    pallof: { hot: 'core', prop: 'cableSide', frames: [
      { p: S({ arm: 88, elb: 6 }), dur: 1.5, step: 0 },
      { p: S({ arm: 88, elb: 6, lean: 4 }), dur: 1.5, step: 1 } ] },
    sled: { hot: 'legs', frames: [
      { p: S({ lean: 42, hipF: 40, knee: 45, hipF2: -20, knee2: 50, arm: 55, elb: 30 }), dur: 0.7, step: 0 },
      { p: S({ lean: 42, hipF: -20, knee: 50, hipF2: 40, knee2: 45, arm: 55, elb: 30 }), dur: 0.7, step: 1 } ] },
    crawl: { hot: 'full', frames: [
      { p: X({ hd: [0.60, 0.72], sh: [0.48, 0.68], el: [0.50, 0.40], ha: [0.52, 0.10], hip: [-0.18, 0.62], kn: [-0.22, 0.30], an: [-0.24, 0.08] }), dur: 0.7, step: 0 },
      { p: X({ hd: [0.66, 0.70], sh: [0.54, 0.66], el: [0.56, 0.38], ha: [0.58, 0.10], hip: [-0.10, 0.60], kn: [-0.14, 0.30], an: [-0.16, 0.08] }), dur: 0.7, step: 1 } ] },
    ropes: { hot: 'arms', frames: [
      { p: S({ arm: 60, elb: 40 }), dur: 0.4, step: 0 },
      { p: S({ arm: 78, elb: 62 }), dur: 0.4, step: 1 } ] },
    getup: { hot: 'full', prop: 'dumbbell', frames: [
      { p: X({ ha: [-0.55, 1.05], el: [-0.53, 0.78] }), dur: 1.2, step: 0 },
      { p: X({ hip: [0.0, 0.45], sh: [-0.10, 0.95], hd: [-0.12, 1.12], ha: [-0.12, 1.35], el: [-0.11, 1.15], kn: [0.35, 0.30], an: [0.60, 0.08] }), dur: 1.2, step: 1 },
      { p: S({ hy: 0.62, hipF: 85, knee: 90, hipF2: 5, knee2: 85, arm: 170, elb: 5 }), dur: 1.2, step: 2 },
      { p: S({ arm: 170, elb: 5 }), dur: 1.0, step: 3 } ] },
    jefferson: { hot: 'core', frames: [
      { p: S({ lean: 8, arm: 10 }), dur: 1.6, step: 0 },
      { p: S({ lean: 55, arm: 25, hy: 0.90 }), dur: 1.8, step: 1 } ] },
    pullThrough: { hot: 'legs', prop: 'cableLow', frames: [
      { p: S(Object.assign({ arm: 20, elb: 5 }, HINGE)), dur: 1.2, step: 0 },
      { p: S({ arm: 10, elb: 5 }), dur: 1.1, step: 1 } ] },
    invertedRow: { hot: 'arms', prop: 'barFixed', frames: [
      { p: X({ hd: [-0.55, 0.72], sh: [-0.40, 0.66], el: [-0.15, 0.84], ha: [-0.08, 1.02], hip: [0.10, 0.44], kn: [0.50, 0.24], an: [0.80, 0.06] }), dur: 1.2, step: 0 },
      { p: X({ hd: [-0.48, 0.78], sh: [-0.34, 0.72], el: [-0.36, 0.68], ha: [-0.38, 0.74], hip: [0.10, 0.46], kn: [0.50, 0.25], an: [0.80, 0.06] }), dur: 1.2, step: 1 } ] },
    swim: { hot: 'full', frames: [
      { p: X({ hd: [0.70, 0.30], sh: [0.50, 0.28], el: [0.72, 0.30], ha: [0.92, 0.32], hip: [0.0, 0.28], kn: [-0.40, 0.24], an: [-0.75, 0.30] }), dur: 0.8, step: 0 },
      { p: X({ hd: [0.70, 0.30], sh: [0.50, 0.28], el: [0.30, 0.26], ha: [0.10, 0.26], hip: [0.0, 0.28], kn: [-0.40, 0.30], an: [-0.75, 0.24] }), dur: 0.8, step: 1 } ] },
    skipRope: { hot: 'legs', frames: [
      { p: S({ hy: 0.95, arm: 30, elb: 50 }), dur: 0.4, step: 0 },
      { p: S({ hy: 1.04, arm: 30, elb: 50 }), dur: 0.4, step: 1 } ] },
    stepUp: { hot: 'legs', prop: 'box', frames: [
      { p: S({}), dur: 0.9, step: 0 },
      { p: S({ hy: 1.15, hipF: 70, knee: 75, hipF2: 5, knee2: 10 }), dur: 1.0, step: 1 } ] },
    gluteKickback: { hot: 'legs', frames: [
      { p: S({ lean: 15 }), dur: 1.0, step: 0 },
      { p: S({ lean: 15, hipF2: -38, knee2: 12 }), dur: 1.1, step: 1 } ] },
    fireHydrant: { hot: 'legs', frames: [
      { p: X({ hip: [0.0, 0.55], kn: [-0.05, 0.18], an: [-0.08, 0.06], sh: [-0.02, 1.02], hd: [-0.02, 1.18] }), dur: 1.0, step: 0 },
      { p: X({ hip: [0.0, 0.55], kn: [0.30, 0.45], an: [0.42, 0.35], sh: [-0.02, 1.02], hd: [-0.02, 1.18] }), dur: 1.1, step: 1 } ] },
    wipers: { hot: 'core', frames: [
      { p: X({ kn: [0.30, 1.05], an: [0.32, 1.40], kn2: [0.34, 1.05], an2: [0.36, 1.40] }), dur: 1.2, step: 0 },
      { p: X({ kn: [-0.45, 0.95], an: [-0.60, 1.25], kn2: [-0.41, 0.95], an2: [-0.56, 1.25] }), dur: 1.2, step: 1 } ] },
    manmaker: { hot: 'full', prop: 'dumbbells', frames: [
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.10, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 1.0, step: 0 },
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.22, 0.55], ha: [0.28, 0.50], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 1.0, step: 1 },
      { p: S({ arm: 170, elb: 5 }), dur: 1.0, step: 2 } ] },
    devilPress: { hot: 'full', prop: 'dumbbells', frames: [
      { p: X({ hd: [0.22, 0.68], sh: [0.05, 0.62], el: [0.10, 0.34], ha: [0.05, 0.05], hip: [-0.52, 0.56], kn: [-0.82, 0.30], an: [-1.02, 0.07] }), dur: 1.0, step: 0 },
      { p: S({ hy: 0.95, lean: 8, arm: 80, elb: 5 }), dur: 0.9, step: 1 },
      { p: S({ arm: 172, elb: 5 }), dur: 0.9, step: 2 } ] },
    rowMachine: { hot: 'full', frames: [
      { p: S({ hy: 0.60, hipF: 85, knee: 85, lean: 12, arm: 55, elb: 10 }), dur: 1.0, step: 0 },
      { p: S({ hy: 0.62, hipF: 70, knee: 60, lean: 22, arm: 5, elb: 75 }), dur: 1.0, step: 1 } ] },
    pedal: { hot: 'legs', frames: [
      { p: S({ hy: 0.72, hipF: 70, knee: 75, hipF2: 30, knee2: 40, lean: 12 }), dur: 0.5, step: 0 },
      { p: S({ hy: 0.72, hipF: 30, knee: 40, hipF2: 70, knee2: 75, lean: 12 }), dur: 0.5, step: 1 } ] },
    lateralWalk: { hot: 'legs', frames: [
      { p: S({ hy: 0.72, hipF: 45, knee: 55 }), dur: 0.8, step: 0 },
      { p: S({ hy: 0.72, hx: 0.25, hipF: 45, knee: 55 }), dur: 0.8, step: 1 } ] },
    situpStand: { hot: 'core', frames: [
      { p: S({ hy: 0.62, hipF: 80, knee: 80, lean: 10, arm: 45, elb: 15 }), dur: 1.1, step: 0 },
      { p: S({ hy: 0.62, hipF: 80, knee: 80, lean: 30, arm: 25, elb: 15 }), dur: 1.1, step: 1 } ] }
  };

  /* template -> animation */
  const T2A = {
    'press-h': 'bench', 'pushup': 'pushup', 'fly': 'fly', 'cable-fly': 'cableFly',
    'dip': 'dip', 'machine-press': 'pressFwd', 'landmine-press': 'landmine',
    'row': 'bentRow', 'cable-row': 'cableRow', 'inverted-row': 'invertedRow',
    'pullup': 'pullup', 'pulldown': 'pulldown', 'straight-pulldown': 'pulldown',
    'pullover': 'pullover', 'ohp': 'ohp', 'raise': 'raise', 'rear-fly': 'bentRaise',
    'face-pull': 'facePull', 'curl': 'curl', 'hammer-curl': 'curl',
    'pushdown': 'pushdown', 'overhead-ext': 'overheadExt', 'skullcrusher': 'skullcrusher',
    'kickback': 'kickback', 'squat': 'squat', 'lunge': 'lunge', 'leg-press': 'legPress',
    'split-squat': 'lunge', 'leg-extension': 'legExtension', 'sissy': 'squat',
    'pistol': 'lunge', 'wall-sit': 'wallSit', 'rdl': 'hinge', 'nordic': 'nordic',
    'leg-curl': 'legCurl', 'good-morning': 'hinge', 'pull-through': 'pullThrough',
    'ball-curl': 'legCurl', 'calf-raise': 'calfRaise', 'jump-rope': 'skipRope',
    'box-jump': 'boxJump', 'shrug': 'shrug', 'high-pull': 'highPull', 'hyper': 'hyper',
    'superman': 'superman', 'birddog': 'birddog', 'jefferson': 'jefferson',
    'deadlift': 'deadlift', 'burpee': 'burpee', 'thruster': 'thruster',
    'clean-family': 'clean', 'snatch': 'clean', 'getup': 'getup', 'manmaker': 'manmaker',
    'devil-press': 'devilPress', 'ropes': 'ropes', 'sled': 'sled', 'crawl': 'crawl',
    'run': 'march', 'row-machine': 'rowMachine', 'bike': 'pedal', 'stairs': 'highKnees',
    'climbers': 'climbers', 'high-knees': 'highKnees', 'swim': 'swim',
    'jacks': 'jumpingJacks', 'sprint': 'sprint', 'zotten': 'curl',
    'kickback-glute': 'gluteKickback', 'stepup': 'stepUp', 'hydrant': 'fireHydrant',
    'wall-ball': 'wallBall', 'sandbag-carry': 'carry', 'tibialis': 'calfRaise',
    'slider-curl': 'legCurl', 'cyclist-squat': 'squat', 'belt-squat': 'squat',
    'drag-curl': 'curl', 'bayesian-curl': 'curl', 'cross-extension': 'overheadExt',
    'weighted-dip': 'dip', 'decline-pushup': 'pushup', 'machine-fly': 'fly',
    'yates-row': 'bentRow', 'seal-row': 'bentRow', 'cable-front-raise': 'raise',
    'db-push-press': 'ohp', 'hanging-knee-raise': 'hangKneeRaise',
    'standing-crunch': 'situpStand', 'band-walk': 'lateralWalk',
    'single-hip-thrust': 'hipThrust', 'side-plank': 'sidePlank', 'wipers': 'wipers',
    'rotation': 'woodchopper', 'deadbug': 'deadbug', 'hang': 'hang',
    'roller': 'pushdown', 'pinch': 'hang', 'carry': 'carry', 'twist': 'twist',
    'woodchopper': 'woodchopper', 'pallof': 'pallof', 'rollout': 'rollout',
    'plank': 'plankHold', 'crunch': 'crunch', 'leg-raise': 'legRaise',
    'situp': 'situp', 'cable-crunch': 'situpStand', 'swing': 'swing',
    'hip-thrust': 'hipThrust', 'upright-row': 'uprightRow', 'cuban': 'ohp',
    'wrist-curl': 'pushdown', 'cardio': 'march'
  };

  /* ---------- renderer ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const W2S = (x, y) => [200 + x * 118, 332 - y * 118];

  function drawFigure(svg, J, anim, theme) {
    const C = theme === 'light'
      ? { base: '#232b3a', dim: '#9aa3b5', hot: '#4d7c0f', ground: '#c6cdd9', prop: '#7d8699' }
      : { base: '#dfe5f0', dim: '#7d8699', hot: '#d4ff3f', ground: '#2a3040', prop: '#8a93a8' };
    svg.innerHTML = '';
    const hot = anim.hot || 'full';
    const hotLimb = part => (hot === 'full' || hot === part) ? C.hot : C.base;
    const line = (a, b, w, color) => {
      const [x1, y1] = W2S(a.x, a.y), [x2, y2] = W2S(b.x, b.y);
      el('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }, svg);
    };
    const dot = (p, r, color) => {
      const [x, y] = W2S(p.x, p.y);
      el('circle', { cx: x, cy: y, r, fill: color }, svg);
    };
    // ground
    const [gx1, gy] = W2S(-1.35, 0), [gx2] = W2S(1.35, 0);
    el('line', { x1: gx1, y1: gy, x2: gx2, y2: gy, stroke: C.ground, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    // props behind figure
    const prop = anim.prop;
    if (prop === 'bench' || prop === 'platform') {
      const [bx1, by1] = W2S(-0.85, 0.30), [bx2, by2] = W2S(0.85, 0.42);
      el('rect', { x: bx1, y: by2, width: bx2 - bx1, height: by1 - by2, rx: 6, fill: C.prop, opacity: 0.55 }, svg);
    }
    if (prop === 'box') {
      const [bx1, by1] = W2S(0.55, 0), [bx2, by2] = W2S(1.05, 0.45);
      el('rect', { x: bx1, y: by2, width: bx2 - bx1, height: by1 - by2, rx: 6, fill: C.prop, opacity: 0.55 }, svg);
    }
    if (prop === 'wall') {
      const [wx1, wy1] = W2S(-1.18, 0), [wx2, wy2] = W2S(-1.08, 1.60);
      el('rect', { x: wx1, y: wy2, width: wx2 - wx1, height: wy1 - wy2, rx: 4, fill: C.prop, opacity: 0.55 }, svg);
    }
    if (prop === 'barFixed') {
      const [rx1, ry] = W2S(-0.55, 2.0), [rx2] = W2S(0.55, 2.0);
      el('line', { x1: rx1, y1: ry, x2: rx2, y2: ry, stroke: C.prop, 'stroke-width': 7, 'stroke-linecap': 'round' }, svg);
    }
    // far leg (dimmer)
    line(J.hip, J.kn2, 13, C.dim); line(J.kn2, J.an2, 11, C.dim);
    // near leg
    const legC = hotLimb('legs');
    line(J.hip, J.kn, 14, legC); line(J.kn, J.an, 12, legC);
    dot(J.an, 7, legC);
    // torso + head
    line(J.hip, J.sh, 17, hot === 'core' || hot === 'full' ? C.hot : C.base);
    dot(J.hd, 14, hot === 'core' || hot === 'full' ? C.hot : C.base);
    // arm
    const armC = hotLimb('arms');
    line(J.sh, J.el, 12, armC); line(J.el, J.ha, 10, armC);
    dot(J.ha, 6, armC);
    // props at hands
    const hyp = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    if (prop === 'barbell' || prop === 'dumbbells' || prop === 'dumbbell') {
      const len = prop === 'barbell' ? 0.62 : 0.34;
      const ang = Math.atan2(J.ha.y - J.el.y, J.ha.x - J.el.x) + Math.PI / 2;
      const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
      line({ x: J.ha.x - dx, y: J.ha.y - dy }, { x: J.ha.x + dx, y: J.ha.y + dy }, prop === 'barbell' ? 9 : 12, C.prop);
      if (prop === 'barbell') {
        dot({ x: J.ha.x - dx, y: J.ha.y - dy }, 11, C.prop);
        dot({ x: J.ha.x + dx, y: J.ha.y + dy }, 11, C.prop);
      }
    }
    if (prop === 'ball') dot(J.ha, 13, C.prop);
    if (prop === 'cableTop' || prop === 'cableFly') {
      const t1 = W2S(J.ha.x, J.ha.y), t2 = W2S(prop === 'cableFly' ? 1.15 : J.ha.x, 1.95);
      el('line', { x1: t1[0], y1: t1[1], x2: t2[0], y2: t2[1], stroke: C.prop, 'stroke-width': 3 }, svg);
      if (prop === 'cableFly') {
        const u1 = W2S(J.ha.x, J.ha.y), u2 = W2S(-1.15, 1.95);
        el('line', { x1: u1[0], y1: u1[1], x2: u2[0], y2: u2[1], stroke: C.prop, 'stroke-width': 3 }, svg);
      }
    }
    if (prop === 'cableLow' || prop === 'cableSide') {
      const t1 = W2S(J.ha.x, J.ha.y), t2 = W2S(J.ha.x + 0.35, 0.04);
      el('line', { x1: t1[0], y1: t1[1], x2: t2[0], y2: t2[1], stroke: C.prop, 'stroke-width': 3 }, svg);
    }
  }

  /* ---------- player ---------- */
  function createDemo(container, templateId, steps) {
    const anim = ANIMS[T2A[templateId] || 'march'];
    const theme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    container.innerHTML =
      `<div class="demo-player">
        <svg class="demo-svg" viewBox="0 0 400 400" role="img" aria-label="Exercise demonstration"></svg>
        <div class="demo-side">
          <ol class="demo-steps"></ol>
          <button class="demo-play">Pause</button>
        </div>
      </div>`;
    const svg = container.querySelector('.demo-svg');
    const stepsBox = container.querySelector('.demo-steps');
    const playBtn = container.querySelector('.demo-play');
    const frames = anim.frames;
    const total = frames.reduce((a, f) => a + f.dur, 0);
    // one list item per written step; clicking jumps the figure to that step
    const stepToFrame = {};
    frames.forEach((f, i) => { if (stepToFrame[f.step] == null) stepToFrame[f.step] = i; });
    const starts = [];
    let acc = 0;
    frames.forEach(f => { starts.push(acc); acc += f.dur; });
    steps.forEach((s, si) => {
      const li = document.createElement('li');
      li.innerHTML = '<span>' + s.replace(/</g, '&lt;') + '</span>';
      li.addEventListener('click', () => {
        const fi = stepToFrame[si];
        if (fi != null) t = starts[fi] + 0.001;
      });
      stepsBox.appendChild(li);
    });
    const items = [...stepsBox.children];
    let t = 0, last = performance.now(), playing = true, raf = 0, dead = false, curStep = -1;
    function frameAt(time) {
      for (let i = frames.length - 1; i >= 0; i--) if (time >= starts[i]) return i;
      return 0;
    }
    function tick(now) {
      if (dead) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playing) t = (t + dt) % total;
      const i = frameAt(t);
      const prev = frames[(i - 1 + frames.length) % frames.length].p;
      const q = Math.min(1, (t - starts[i]) / (frames[i].dur * 0.55));
      drawFigure(svg, lerpJ(prev, frames[i].p, ease(q)), anim, theme());
      const st = frames[i].step;
      if (st !== curStep) {
        curStep = st;
        items.forEach((li, si) => li.classList.toggle('on', si === st));
        const active = items[st];
        if (active) active.scrollIntoView({ block: 'nearest' });
      }
    }
    playBtn.addEventListener('click', () => {
      playing = !playing;
      playBtn.textContent = playing ? 'Pause' : 'Play';
      last = performance.now();
    });
    raf = requestAnimationFrame(tick);
    return { destroy() { dead = true; cancelAnimationFrame(raf); } };
  }

  /* test helper: draw one static frame */
  function drawStatic(svg, animName, frameIdx) {
    const anim = ANIMS[animName];
    drawFigure(svg, anim.frames[frameIdx || 0].p, anim,
      document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }

  window.FORGE_DEMO = { createDemo, drawStatic, ANIMS, T2A };
})();
