// IA What-If 2.5D LOOK TEST (2026-11-02). NOT an episode, never posted.
// Blender cockpit plate (public/science/look/plate.mp4) + locked v2 2D crew (cast.js) projected into the plate's camera
// (cam.json = same numbers as blender/scenes/whatif_look/cockpit2142.py) + Blender foreground layer (fg/*.png, RGBA).
// Crew lighting: ambient multiply, warm Jupiter/sun rim (upper-right edges), cyan console fill + faint cyan left rim,
// red flash spill at the boop; soft contact shadows + projected sun cast shadows on the floor; light motion blur.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {DRAW, CARD, HEIGHT} from '../cast.js';
import {Real3DFinish} from '../../real3d/Real3DKit.jsx';
import CAM from './cam.json';

export const LOOK_FRAMES = 240;
const W = 1080, H = 1920, BOOP = 120;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (f, a, b, e = ss) => e(clamp((f - a) / (b - a)));
const easeIn = (x) => x * x * x, easeOut = (x) => 1 - Math.pow(1 - x, 3);
const damp = (f, f0, hz, decay) => (f < f0 ? 0 : Math.exp(-(f - f0) / decay) * Math.sin(((f - f0) / 30) * 2 * Math.PI * hz));
const blink = (t, seed) => { const p = 2.6 + (seed % 3) * 0.7; const u = (t + seed * 0.91) % p; return u < 0.15 ? Math.sin((u / 0.15) * Math.PI) : 0; };
// piecewise keys [[f, v], ...] with smootherstep between keys
const K = (keys, f, e = ss) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [fa, va] = keys[i], [fb, vb] = keys[i + 1]; if (f <= fb) return lerp(va, vb, e((f - fa) / Math.max(1e-6, fb - fa))); }
  return keys[keys.length - 1][1];
};
const FLASH = [[0, 0], [BOOP - 1, 0], [BOOP + 2, 1], [BOOP + 7, 0.25], [BOOP + 11, 0.9], [BOOP + 18, 0.3], [BOOP + 30, 0.08], [BOOP + 45, 0]];
const flashAt = (f) => clamp(K(FLASH, f, (x) => x));

// ---------------------------------------------------------------- camera (fractional frames for motion-blur samples)
const camAt = (f) => {
  const i = clamp(Math.floor(f), 0, LOOK_FRAMES - 1), j = Math.min(LOOK_FRAMES - 1, i + 1), t = clamp(f - i, 0, 1);
  return CAM.cam[i].map((v, k) => lerp(v, CAM.cam[j][k], t));
};
const proj = (c, X) => {
  const v = [X[0] - c[0], X[1] - c[1], X[2] - c[2]];
  const cx = v[0] * c[3] + v[1] * c[4] + v[2] * c[5], cy = v[0] * c[6] + v[1] * c[7] + v[2] * c[8], cz = v[0] * c[9] + v[1] * c[10] + v[2] * c[11];
  return [W / 2 + (CAM.fpx * cx) / -cz, H / 2 - (CAM.fpx * cy) / -cz, -cz];
};
// world point on plane y = py that projects to screen (sx, sy)
const unproj = (c, sx, sy, py) => {
  const dx = (sx - W / 2) / CAM.fpx, dy = -(sy - H / 2) / CAM.fpx;
  const d = [0, 1, 2].map((k) => c[3 + k] * dx + c[6 + k] * dy - c[9 + k]);
  const t = (py - c[1]) / d[1];
  return [c[0] + d[0] * t, py, c[2] + d[2] * t];
};

// ---------------------------------------------------------------- staging (world metres, floor z = 0)
const BTN = [0.22, 1.64, 0.97];
const SOLE = {PIP: 973, BOLT: 976, ZIB: 970};
// soft key from the window/console behind the crew -> short shadow falling toward the camera (not the plate's sun, which only hits the left wall)
const SUN = (() => { const r = [0.04, -0.35, -1]; const n = Math.hypot(...r); return r.map((x) => x / n); })();
const ZIB_Y = 1.40;
// Zib's raised right nub tip relative to his sole centre, in card design units (armR ~ 85 deg, 0.84 inner scale)
const NUB = [232, -196];
const zibBoopPos = (() => { // solve once at the boop frame: nub tip lands on the button
  const c = camAt(BOOP); const b = proj(c, BTN); const k = (HEIGHT.ZIB * CAM.fpx) / b[2] / 1000;
  const w = unproj(c, b[0] - NUB[0] * k, b[1] - NUB[1] * k, ZIB_Y); return [w[0], w[2]];
})();

const poseAt = (f) => {
  const t = f / 30;
  const fl = flashAt(f);
  // ---------- ZIB: hover, sidle up to the button, wind up, boop, bounce
  const [bx, bz] = zibBoopPos;
  const zx = K([[0, bx - 0.10], [40, bx - 0.10], [100, bx - 0.05], [110, bx - 0.07], [118, bx], [124, bx], [175, bx - 0.06], [240, bx - 0.065]], f);
  const zz = K([[0, bz - 0.02], [40, bz - 0.02], [100, bz + 0.03], [110, bz + 0.06], [118, bz], [124, bz], [175, bz + 0.33], [240, bz + 0.34]], f) // after the boop he floats up, proud, into the gap between the heads
    + 0.025 * Math.sin((2 * Math.PI * t) / 1.7) * (1 - ramp(f, 100, 112) + ramp(f, 140, 170));
  const zvx = (K([[0, 0], [40, 0], [100, 1], [240, 1]], f + 1) - K([[0, 0], [40, 0], [100, 1], [240, 1]], f)) * 30;
  const zArm = K([[0, 22], [40, 22], [96, 40], [110, 112], [117, 86], [124, 86], [150, 24], [240, 22]], f);
  const zSq = K([[0, 0], [102, 0], [111, -0.45], [117, -0.15], [120, 0.6], [123, 0.45]], f) + (f > 123 ? 0.45 * damp(f, 123, 2.2, 10) * 1.0 : 0);
  const zWob = 0.12 * Math.sin(t * 3.1) - zvx * 0.25 + 0.9 * damp(f, 119, 2.4, 14) - 0.5 * ramp(f, 104, 111) * (1 - ramp(f, 115, 119));
  const zib = {
    pos: [zx, ZIB_Y, Math.max(0.35, zz)], hover: true,
    pose: {expr: f < 45 ? 'happy' : f < 119 ? 'smug' : 'happy', look: K([[0, 0.3], [40, 0.3], [70, 0.9], [130, 0.9], [160, 0], [240, 0]], f),
      armR: zArm, armL: 20 + 10 * Math.sin(t * 2.4), squish: clamp(zSq, -1, 1), wob: clamp(zWob, -1, 1),
      scarf: 7 * Math.sin(t * 2.2 + 0.6) + 16 * damp(f, 120, 1.7, 16) - zvx * 10, mouth: f > 121 && f < 136 ? 0.45 * Math.sin(((f - 121) / 15) * Math.PI) : 0,
      blink: f > 112 && f < 124 ? 0 : blink(t, 3), glow: 0.5 + 0.5 * fl},
    flip: 1, sx: 1,
  };
  // ---------- PIP: idle, flinch at the boop, then a big shrug to camera
  const jump = K([[0, 0], [121, 0], [125, 0.05], [133, 0], [240, 0]], f, (x) => Math.sin(x * Math.PI / 2));
  const land = 0.035 * damp(f, 133, 2.6, 6);
  const shrug = K([[0, 0], [146, 0], [168, 1], [240, 1]], f);
  const pip = {
    pos: [0.37, 0.72, jump], hover: false,
    pose: {expr: f > 121 && f < 146 ? 'shock' : 'happy', look: K([[0, -0.55], [138, -0.55], [160, 0], [240, 0]], f),
      shrug, armL: K([[0, 8], [121, 8], [126, 34], [140, 14]], f), armR: K([[0, 8], [121, 8], [126, 30], [140, 12]], f),
      headTilt: -3 - 7 * shrug + 2 * Math.sin(t * 1.3),
      hairBob: 10 * Math.sin(t * 1.9) * 0.3 - 22 * damp(f, 123, 2.0, 9) + 16 * damp(f, 133, 2.4, 8) + 8 * damp(f, 150, 1.6, 12),
      blink: f > 121 && f < 140 ? 0 : blink(t, 1)},
    sy: 1 + 0.006 * Math.sin(t * 2.1) - land, sx: 1 + land * 0.6,
  };
  // ---------- BOLT: deadpan watcher; eyes narrow after the boop, hands to hips, turns to camera
  const turn = ramp(f, 166, 192);
  const bolt = {
    pos: [-0.44, 0.85, 0], hover: false,
    pose: {expr: 'deadpan', narrow: ramp(f, 126, 150), hips: ramp(f, 148, 176), armL: 6, armR: 6,
      look: lerp(0.75, 0, turn) + 0.05 * Math.sin(t * 0.9), blink: f > 150 && f < 200 ? 0 : blink(t, 2), glow: 0.6 + 0.3 * fl},
    sx: 1 - 0.07 * Math.sin(turn * Math.PI), sy: 1 + 0.005 * Math.sin(t * 1.7 + 1), shiftX: -0.02 * Math.sin(turn * Math.PI),
  };
  return {ZIB: zib, PIP: pip, BOLT: bolt, flash: fl};
};

// ---------------------------------------------------------------- canvas helpers
const scratch = {};
const S = (key, w, h) => {
  let c = scratch[key];
  if (!c) { c = document.createElement('canvas'); scratch[key] = c; }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.globalAlpha = 1; g.clearRect(0, 0, w, h);
  return [c, g];
};
// draw one lit card at screen scale kpx (px per design unit); returns {A: raw card, B: lit card}
const LIGHT = {amb: '#9ba1b5', warm: '#ffa257', warmA: 1.0, cyan: 'rgba(70,215,255,', cyanA: 0.22, cyanRim: 0.5};
const litCard = (who, pose, kpx, fl, btnSide) => {
  const w = Math.ceil(CARD.W * kpx), h = Math.ceil(CARD.H * kpx);
  const [A, a] = S('A' + who, w, h);
  a.scale(kpx, kpx); a.translate(CARD.PAD, 0); DRAW[who](a, pose);
  const [B, b] = S('B' + who, w, h);
  b.drawImage(A, 0, 0);
  // ambient (cockpit is darker than the white card stage)
  b.globalCompositeOperation = 'multiply'; b.fillStyle = LIGHT.amb; b.fillRect(0, 0, w, h);
  // cyan console fill from the lower left/front
  b.globalCompositeOperation = 'screen';
  let gr = b.createLinearGradient(0, h, w * 0.75, h * 0.25); gr.addColorStop(0, LIGHT.cyan + LIGHT.cyanA + ')'); gr.addColorStop(1, LIGHT.cyan + '0)');
  b.fillStyle = gr; b.fillRect(0, 0, w, h);
  // floor occlusion: lower legs sit in the console's shadow
  b.globalCompositeOperation = 'multiply';
  gr = b.createLinearGradient(0, h * 0.62, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(120,118,140,1)');
  b.fillStyle = gr; b.fillRect(0, h * 0.62, w, h * 0.38);
  b.globalCompositeOperation = 'screen';
  // red flash spill from the button side
  if (fl > 0.01) {
    gr = b.createLinearGradient(btnSide > 0 ? w : 0, h * 0.4, btnSide > 0 ? 0 : w, h * 0.6);
    gr.addColorStop(0, `rgba(255,40,25,${0.55 * fl})`); gr.addColorStop(1, `rgba(255,40,25,${0.12 * fl})`);
    b.fillStyle = gr; b.fillRect(0, 0, w, h);
  }
  // warm rim on upper-right edges (sun + Jupiter through the window behind them)
  const off = 8.5 * kpx;
  const [R, r] = S('R' + who, w, h);
  r.drawImage(A, 0, 0); r.globalCompositeOperation = 'destination-out'; r.drawImage(A, -off, off * 0.7);
  r.globalCompositeOperation = 'source-in'; gr = r.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, LIGHT.warm); gr.addColorStop(0.65, LIGHT.warm); gr.addColorStop(1, 'rgba(255,164,92,0.35)');
  r.fillStyle = gr; r.fillRect(0, 0, w, h);
  b.globalCompositeOperation = 'screen'; b.globalAlpha = LIGHT.warmA; b.filter = `blur(${Math.max(0.6, 1.3 * kpx)}px)`; b.drawImage(R, 0, 0); b.filter = 'none'; b.globalAlpha = 1;
  // faint cyan rim on left edges (console glow)
  const [Q, q] = S('Q' + who, w, h);
  q.drawImage(A, 0, 0); q.globalCompositeOperation = 'destination-out'; q.drawImage(A, off * 0.8, off * 0.2);
  q.globalCompositeOperation = 'source-in'; q.fillStyle = 'rgb(90,220,255)'; q.fillRect(0, 0, w, h);
  b.globalAlpha = LIGHT.cyanRim; b.filter = `blur(${Math.max(0.6, 1.5 * kpx)}px)`; b.drawImage(Q, 0, 0); b.filter = 'none'; b.globalAlpha = 1;
  // back to the card's own alpha
  b.globalCompositeOperation = 'destination-in'; b.drawImage(A, 0, 0); b.globalCompositeOperation = 'source-over';
  return {A, B, w, h};
};

const drawFrame = (g, f) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const c = camAt(f);
  const P = poseAt(f);
  const btn = proj(c, BTN);
  const order = ['ZIB', 'BOLT', 'PIP'].map((who) => ({who, ...P[who], d: proj(c, P[who].pos)[2]})).sort((x, y) => y.d - x.d);
  // pass 1: shadows on the floor (all characters, before any character)
  const cards = {};
  for (const o of order) {
    const foot = [o.pos[0] + (o.shiftX || 0), o.pos[1], 0];
    const anchor = [foot[0], foot[1], o.hover ? o.pos[2] : o.pos[2]];
    const sp = proj(c, anchor);
    const kpx = (HEIGHT[o.who] * CAM.fpx) / sp[2] / 1000;
    const L = litCard(o.who, o.pose, kpx, P.flash, Math.sign(btn[0] - sp[0]) || 1);
    cards[o.who] = {L, sp, kpx};
    const hgt = o.hover ? o.pos[2] : Math.max(0, o.pos[2]);
    const F = proj(c, foot);
    const fade = 1 / (1 + hgt * 3.2);
    // soft contact shadow: true floor ellipse (projected), wide + tight core
    for (const [rad, al] of [[0.32 * (1 + hgt), 0.62], [0.15 * (1 + hgt * 1.5), 0.82]]) {
      const ex = proj(c, [foot[0] + rad, foot[1], 0]), ey = proj(c, [foot[0], foot[1] + rad, 0]);
      const rx = Math.abs(ex[0] - F[0]), ry = Math.max(2, Math.abs(ey[1] - F[1]));
      g.save(); g.translate(F[0], F[1]); g.scale(rx, ry);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, `rgba(6,4,10,${al * fade})`); gr.addColorStop(0.55, `rgba(6,4,10,${al * fade * 0.5})`); gr.addColorStop(1, 'rgba(6,4,10,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
    }
    // sun cast shadow: the card silhouette laid on the floor along the sun rays (soft, faint)
    const m = HEIGHT[o.who] / 1000, len = Math.hypot(SUN[0], SUN[1]) / -SUN[2];
    const dirF = [SUN[0] / Math.hypot(SUN[0], SUN[1]), SUN[1] / Math.hypot(SUN[0], SUN[1])];
    const base = [foot[0] + dirF[0] * len * hgt, foot[1] + dirF[1] * len * hgt, 0];
    const F2 = proj(c, base);
    const eR = proj(c, [base[0] + m * 100, base[1], 0]), eU = proj(c, [base[0] + dirF[0] * m * 100 * len, base[1] + dirF[1] * m * 100 * len, 0]);
    const rX = [(eR[0] - F2[0]) / 100, (eR[1] - F2[1]) / 100], uX = [(eU[0] - F2[0]) / 100, (eU[1] - F2[1]) / 100];
    const [Sh, sh] = S('S' + o.who, L.w, L.h); sh.drawImage(L.A, 0, 0); sh.globalCompositeOperation = 'source-in'; sh.fillStyle = '#05040a'; sh.fillRect(0, 0, L.w, L.h);
    const cx0 = CARD.PAD + 300, sole = SOLE[o.who];
    g.save();
    g.setTransform(rX[0] / kpx, rX[1] / kpx, -uX[0] / kpx, -uX[1] / kpx, F2[0] - cx0 * rX[0] + sole * uX[0], F2[1] - cx0 * rX[1] + sole * uX[1]);
    g.globalAlpha = 0.34 * fade; g.filter = 'blur(6px)'; g.drawImage(Sh, 0, 0); g.restore();
    g.filter = 'none'; g.globalAlpha = 1;
  }
  // pass 2: characters far -> near, soles on the projected floor point
  for (const o of order) {
    const {L, sp, kpx} = cards[o.who];
    const sx = o.sx || 1, sy = o.sy || 1;
    const cx0 = (CARD.PAD + 300) * kpx, sole = SOLE[o.who] * kpx;
    g.save(); g.translate(sp[0], sp[1]); g.scale(sx, sy);
    g.filter = 'blur(0.45px)';
    g.drawImage(L.B, -cx0, -sole);
    g.restore(); g.filter = 'none';
  }
};

const Crew = () => {
  const f = useCurrentFrame();
  return <canvas width={W} height={H} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}
    ref={(cv) => { if (cv) drawFrame(cv.getContext('2d'), f); }} />;
};

export const LookTest = () => {
  const f = useCurrentFrame();
  const fg = String(Math.min(LOOK_FRAMES - 1, f)).padStart(5, '0');
  return (<AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('science/look/plate.mp4')} muted style={{width: W, height: H}} />
    <CameraMotionBlur shutterAngle={120} samples={5}><Crew /></CameraMotionBlur>
    <Img src={staticFile(`science/look/fg/${fg}.webp`)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}} />
    <Real3DFinish grain={0.045} vignette={0.1} tone={0.07} />
  </AbsoluteFill>);
};
