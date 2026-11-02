// IA Science "What If" cast rig: Pip (kid scientist), Bolt (deadpan robot), Zib (tiny alien).
// Original characters (2026-11-02). Flat cartoon cards with a thick plum ink outline, drawn on a Canvas2D in a
// 600 x 1000 design space (soles at y = 975), used as camera-facing billboards in a three.js world.
// Technique (cards in 3D, plum ink, deadpan lids, ink-dot hands) borrowed from mromidev/claude-animated-shorts (MIT).
// pose = {mouth 0..1, blink 0..1, expr: happy|shock|worry|deadpan|smug, armL, armR (deg, 0 = down, + = raised forward/out),
//         look -1..1 (pupil x), glow 0..1 (Bolt antenna / Zib antenna tips)}
export const INK = '#241726';
const W = 600, H = 1000;
const rad = (d) => (d * Math.PI) / 180;

const path = (g, pts, close = true) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (close) g.closePath(); };
const fillInk = (g, fill, lw = 12) => { g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
const ell = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const shadeL = (g, fn, alpha = 0.16) => { g.save(); fn(); g.clip(); g.fillStyle = `rgba(36,23,38,${alpha})`; g.fillRect(0, 0, W, H); g.restore(); };

/** stick arm from shoulder (sx, sy): angle a (0 = straight down), side -1 left / +1 right; ink-dot hand */
const arm = (g, sx, sy, a, side, len, col, lw = 26, hand = '#ffd9b8') => {
  const ang = rad(a) * side; const ex = sx + Math.sin(ang) * len * 0.52, ey = sy + Math.cos(ang) * len * 0.52;
  const ang2 = ang + rad(a > 60 ? 12 : 6) * side; const hx = ex + Math.sin(ang2) * len * 0.48, hy = ey + Math.cos(ang2) * len * 0.48;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = lw + 14; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  ell(g, hx, hy, lw * 0.95, lw * 0.95); fillInk(g, hand, 9);
  return [hx, hy];
};

const mouthShape = (g, x, y, w, open, expr, col = '#5a1e28') => {
  if (expr === 'deadpan' && open < 0.08) { g.lineWidth = 10; g.strokeStyle = INK; g.beginPath(); g.moveTo(x - w * 0.4, y); g.lineTo(x + w * 0.4, y); g.stroke(); return; }
  if (open < 0.08) {
    g.lineWidth = 10; g.strokeStyle = INK; g.beginPath();
    if (expr === 'worry' || expr === 'shock') g.arc(x, y + w * 0.35, w * 0.35, rad(205), rad(335));
    else g.arc(x, y - w * 0.25, w * 0.45, rad(25), rad(155));
    g.stroke(); return;
  }
  const h = w * (0.18 + 0.55 * open) * (expr === 'shock' ? 1.35 : 1);
  g.beginPath(); g.moveTo(x - w * 0.45, y - h * 0.15); g.quadraticCurveTo(x, y - h * 0.35, x + w * 0.45, y - h * 0.15);
  g.quadraticCurveTo(x + w * 0.38, y + h, x, y + h); g.quadraticCurveTo(x - w * 0.38, y + h, x - w * 0.45, y - h * 0.15); g.closePath();
  fillInk(g, col, 9);
  g.save(); g.clip(); ell(g, x, y + h * 0.95, w * 0.28, h * 0.42); g.fillStyle = '#e86e78'; g.fill(); g.restore();
};

const eye = (g, x, y, rx, ry, look, blink, expr, iris = '#2b1d2e', irisR = 0.42, lidCol = '#f2d2b6') => {
  const b = Math.max(0, Math.min(1, blink));
  ell(g, x, y, rx, ry); fillInk(g, '#ffffff', 9);
  g.save(); ell(g, x, y, rx, ry); g.clip();
  ell(g, x + look * rx * 0.38, y + ry * 0.08, rx * irisR * (expr === 'shock' ? 0.8 : 1), rx * irisR * (expr === 'shock' ? 0.8 : 1)); g.fillStyle = iris; g.fill();
  // lids: deadpan = half lid; blink closes
  let lid = expr === 'deadpan' ? 0.42 : expr === 'smug' ? 0.32 : 0;
  lid = lid + (1 - lid) * b;
  if (lid > 0) { g.fillStyle = lidCol; g.fillRect(x - rx - 4, y - ry - 4, rx * 2 + 8, (ry * 2 + 8) * lid); g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(x - rx, y - ry + (ry * 2) * lid); g.lineTo(x + rx, y - ry + (ry * 2) * lid); g.stroke(); }
  g.restore();
  ell(g, x, y, rx, ry); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
};

const brows = (g, xl, xr, y, expr, s = 1) => {
  const t = { happy: [-8, 0], shock: [-22, 0], worry: [-10, 14], deadpan: [0, 0], smug: [-4, -8] }[expr] || [0, 0];
  g.lineWidth = 11 * s; g.strokeStyle = INK; g.lineCap = 'round';
  g.beginPath(); g.moveTo(xl - 28 * s, y + t[0] + t[1]); g.lineTo(xl + 28 * s, y + t[0] - t[1]); g.stroke();
  g.beginPath(); g.moveTo(xr - 28 * s, y + t[0] - t[1]); g.lineTo(xr + 28 * s, y + t[0] + t[1]); g.stroke();
};


/** hand props drawn at hand point (hx, hy) */
const prop = (g, kind, hx, hy, glow = 0.6) => {
  if (!kind) return;
  if (kind === 'remote') {
    rrect(g, hx - 34, hy - 70, 68, 100, 14); fillInk(g, '#3a3f4b', 9);
    ell(g, hx, hy - 40, 20, 20); fillInk(g, '#ff3b3b', 8);
    rrect(g, hx - 18, hy - 2, 36, 10, 4); g.fillStyle = '#57f2a0'; g.fill();
  } else if (kind === 'spoon') {
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 30; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 60, hy - 150); g.stroke();
    g.strokeStyle = '#d7dde3'; g.lineWidth = 16; g.stroke();
    ell(g, hx + 72, hy - 190, 52, 40, rad(-20)); fillInk(g, '#d7dde3', 10);
    ell(g, hx + 72, hy - 205, 46 + 14 * glow, 46 + 14 * glow); g.fillStyle = `rgba(140,200,255,${0.35 + 0.2 * glow})`; g.fill();
    ell(g, hx + 72, hy - 202, 26, 22); fillInk(g, '#eaf6ff', 8);
  } else if (kind === 'shovel') {
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 26; g.beginPath(); g.moveTo(hx, hy - 120); g.lineTo(hx, hy + 260); g.stroke();
    g.strokeStyle = '#b5653f'; g.lineWidth = 13; g.stroke();
    path(g, [[hx - 46, hy + 250], [hx + 46, hy + 250], [hx + 40, hy + 350], [hx, hy + 385], [hx - 40, hy + 350]]); fillInk(g, '#9aa6b2', 10);
  }
};

// ------------------------------------------------------------------ PIP
export function drawPip(g, p) {
  const { mouth = 0, blink = 0, expr = 'happy', armL = 8, armR = 8, look = 0, item = null } = p;
  g.clearRect(0, 0, W, H);
  // legs + sneakers
  g.lineCap = 'round';
  for (const x of [255, 345]) { g.strokeStyle = INK; g.lineWidth = 40; g.beginPath(); g.moveTo(x, 760); g.lineTo(x, 935); g.stroke(); g.strokeStyle = '#3b4f8f'; g.lineWidth = 26; g.beginPath(); g.moveTo(x, 760); g.lineTo(x, 935); g.stroke(); }
  for (const [x, d] of [[245, -1], [355, 1]]) { rrect(g, x - 44 + d * 10, 920, 88, 52, 24); fillInk(g, '#e2453c', 11); rrect(g, x - 40 + d * 10, 952, 80, 14, 6); g.fillStyle = '#fff'; g.fill(); }
  // arms behind coat edge
  arm(g, 212, 545, armL, -1, 250, '#f4f3ef', 30);
  const hp = arm(g, 388, 545, armR, 1, 250, '#f4f3ef', 30);
  // shirt + lab coat (trapezoid, open front)
  path(g, [[215, 520], [385, 520], [430, 800], [170, 800]]); fillInk(g, '#f4f3ef', 13);
  shadeL(g, () => path(g, [[300, 520], [385, 520], [430, 800], [300, 800]]), 0.08);
  path(g, [[262, 522], [338, 522], [322, 790], [278, 790]]); fillInk(g, '#2bb3a6', 10);
  g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(262, 522); g.lineTo(240, 600); g.lineTo(272, 600); g.stroke(); g.beginPath(); g.moveTo(338, 522); g.lineTo(360, 600); g.lineTo(328, 600); g.stroke();
  rrect(g, 352, 640, 50, 46, 8); fillInk(g, '#f4f3ef', 8); g.strokeStyle = '#3f6fb5'; g.lineWidth = 7; g.beginPath(); g.moveTo(366, 630); g.lineTo(366, 660); g.stroke(); g.strokeStyle = '#e2453c'; g.beginPath(); g.moveTo(382, 628); g.lineTo(382, 658); g.stroke();
  // neck + head
  rrect(g, 280, 470, 40, 60, 12); fillInk(g, '#ffd9b8', 10);
  ell(g, 300, 330, 170, 165); fillInk(g, '#ffd9b8', 13);
  ell(g, 132, 345, 26, 38); fillInk(g, '#ffd9b8', 10); ell(g, 468, 345, 26, 38); fillInk(g, '#ffd9b8', 10);
  ell(g, 300, 330, 170, 165); g.lineWidth = 13; g.strokeStyle = INK; g.stroke();
  // mop of orange hair (bumpy cap)
  g.beginPath(); const cx = 300, cy = 300; g.moveTo(128, 320);
  for (let i = 0; i <= 12; i++) { const a = rad(195 + i * 12.5); const rr = 178 + (i % 2 ? 26 : 0); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.98); }
  g.lineTo(472, 320); g.quadraticCurveTo(420, 230, 300, 238); g.quadraticCurveTo(180, 230, 128, 320); g.closePath(); fillInk(g, '#f08a2c', 13);
  // goggles on forehead
  g.strokeStyle = INK; g.lineWidth = 30; g.beginPath(); g.moveTo(140, 250); g.quadraticCurveTo(300, 205, 460, 250); g.stroke(); g.strokeStyle = '#2b2b3a'; g.lineWidth = 18; g.stroke();
  for (const x of [245, 355]) { ell(g, x, 228, 48, 38); fillInk(g, '#5fd6e0', 11); ell(g, x - 12, 218, 14, 9); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fill(); }
  // face
  brows(g, 235, 365, 290, expr);
  eye(g, 235, 345, 40, 46, look, blink, expr);
  eye(g, 365, 345, 40, 46, look, blink, expr);
  mouthShape(g, 300, 430, 110, mouth, expr);
  prop(g, item, hp[0], hp[1]);
  ell(g, 205, 405, 22, 12); g.fillStyle = 'rgba(232,110,120,0.0)'; g.fill();
}

// ------------------------------------------------------------------ BOLT
export function drawBolt(g, p) {
  const { mouth = 0, blink = 0, expr = 'deadpan', armL = 6, armR = 6, look = 0, glow = 0.5 } = p;
  g.clearRect(0, 0, W, H);
  // treads
  rrect(g, 150, 835, 300, 135, 60); fillInk(g, '#3a3f4b', 13);
  for (const x of [205, 300, 395]) { ell(g, x, 902, 36, 36); fillInk(g, '#8d97a3', 9); ell(g, x, 902, 10, 10); g.fillStyle = INK; g.fill(); }
  // arms (segmented steel)
  arm(g, 168, 560, armL, -1, 260, '#9aa6b2', 30, '#c7d0d8');
  arm(g, 432, 560, armR, 1, 260, '#9aa6b2', 30, '#c7d0d8');
  // body
  rrect(g, 160, 520, 280, 330, 34); fillInk(g, '#b9c3cc', 13);
  shadeL(g, () => rrect(g, 300, 520, 140, 330, 34), 0.12);
  rrect(g, 205, 600, 190, 150, 18); fillInk(g, '#d9e0e6', 10);
  for (let i = 0; i < 4; i++) { ell(g, 240 + i * 40, 640, 11, 11); g.fillStyle = ['#ff6a3d', '#57f2a0', '#ffb547', '#6fa8ff'][i]; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
  for (let i = 0; i < 3; i++) { g.lineWidth = 8; g.strokeStyle = '#7b8794'; g.beginPath(); g.moveTo(230, 685 + i * 20); g.lineTo(370, 685 + i * 20); g.stroke(); }
  // neck
  rrect(g, 268, 470, 64, 60, 10); fillInk(g, '#7b8794', 10);
  // antenna
  g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(300, 200); g.lineTo(300, 110); g.stroke(); g.strokeStyle = '#7b8794'; g.lineWidth = 10; g.stroke();
  ell(g, 300, 96, 30 + glow * 8, 30 + glow * 8); g.fillStyle = `rgba(255,181,71,${0.25 * glow})`; g.fill();
  ell(g, 300, 96, 26, 26); fillInk(g, glow > 0.4 ? '#ffc35c' : '#c98a2a', 10);
  // head
  rrect(g, 140, 190, 320, 290, 46); fillInk(g, '#c7d0d8', 13);
  shadeL(g, () => rrect(g, 300, 190, 160, 290, 46), 0.1);
  ell(g, 128, 335, 22, 52); fillInk(g, '#7b8794', 10); ell(g, 472, 335, 22, 52); fillInk(g, '#7b8794', 10);
  rrect(g, 178, 228, 244, 212, 30); fillInk(g, '#16223a', 11);
  // single round eye screen
  const ex = 300 + look * 40, ey = 310;
  ell(g, ex, ey, 66, 66); g.fillStyle = 'rgba(111,229,255,0.18)'; g.fill();
  g.save(); ell(g, ex, ey, 54, 54); g.clip(); g.fillStyle = '#6fe5ff'; g.fillRect(ex - 60, ey - 60, 120, 120);
  ell(g, ex, ey, 22, 22); g.fillStyle = '#16223a'; g.fill();
  let lid = expr === 'deadpan' ? 0.38 : expr === 'shock' ? 0 : 0.2; lid = lid + (1 - lid) * Math.min(1, blink);
  g.fillStyle = '#16223a'; g.fillRect(ex - 60, ey - 60, 120, 120 * lid); g.restore();
  // LED mouth bar: segments light with speech
  const n = 7; const lit = Math.round(mouth * n);
  for (let i = 0; i < n; i++) { const d = Math.abs(i - (n - 1) / 2); const on = d < lit / 2 + 0.01; rrect(g, 216 + i * 25, 396, 18, on ? 26 : 10, 4); g.fillStyle = on ? '#6fe5ff' : '#2c3e5c'; g.fill(); }
}

// ------------------------------------------------------------------ ZIB
export function drawZib(g, p) {
  const { mouth = 0, blink = 0, expr = 'happy', armL = 20, armR = 20, look = 0, glow = 0.5, item = null } = p;
  g.clearRect(0, 0, W, H);
  // feet
  for (const x of [235, 365]) { ell(g, x, 945, 52, 28); fillInk(g, '#4fae3c', 11); }
  // arms
  arm(g, 165, 640, armL, -1, 200, '#7ed957', 28, '#7ed957');
  const hz = arm(g, 435, 640, armR, 1, 200, '#7ed957', 28, '#7ed957');
  // antennae
  for (const [bx, tx] of [[240, 170], [360, 430]]) {
    g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(bx, 330); g.quadraticCurveTo((bx + tx) / 2, 220, tx, 150); g.stroke();
    g.strokeStyle = '#7ed957'; g.lineWidth = 10; g.stroke();
    ell(g, tx, 140, 36 + glow * 10, 36 + glow * 10); g.fillStyle = `rgba(255,143,177,${0.3 * glow})`; g.fill();
    ell(g, tx, 140, 30, 30); fillInk(g, '#ff8fb1', 10);
  }
  // bean body
  g.beginPath(); g.moveTo(300, 300); g.bezierCurveTo(470, 300, 480, 560, 460, 760); g.bezierCurveTo(445, 930, 155, 930, 140, 760); g.bezierCurveTo(120, 560, 130, 300, 300, 300); g.closePath();
  fillInk(g, '#7ed957', 14);
  shadeL(g, () => { g.beginPath(); g.moveTo(300, 300); g.bezierCurveTo(470, 300, 480, 560, 460, 760); g.bezierCurveTo(445, 930, 300, 930, 300, 930); g.lineTo(300, 300); g.closePath(); }, 0.1);
  // belly spots
  for (const [x, y, r] of [[210, 820, 16], [395, 790, 12], [380, 845, 9]]) { ell(g, x, y, r, r); g.fillStyle = '#5fbf45'; g.fill(); }
  // scarf
  g.beginPath(); g.moveTo(150, 640); g.quadraticCurveTo(300, 700, 455, 640); g.lineTo(458, 690); g.quadraticCurveTo(300, 750, 146, 690); g.closePath(); fillInk(g, '#8b5cf6', 11);
  path(g, [[370, 700], [420, 700], [440, 790], [392, 800]]); fillInk(g, '#8b5cf6', 10);
  // one huge eye
  eye(g, 300, 470, 112, 108, look, blink, expr, '#2b1d2e', 0.36, '#6cc84a');
  // brow (single)
  const b = { happy: -6, shock: -26, worry: 6, deadpan: 0, smug: -2 }[expr] || 0;
  g.lineWidth = 13; g.strokeStyle = INK; g.lineCap = 'round'; g.beginPath(); g.moveTo(225, 345 + b + (expr === 'worry' ? 10 : 0)); g.quadraticCurveTo(300, 330 + b, 375, 345 + b + (expr === 'worry' ? 10 : 0)); g.stroke();
  mouthShape(g, 300, 615, 90, mouth, expr);
  prop(g, item, hz[0], hz[1], glow);
}

export const DRAW = { PIP: drawPip, BOLT: drawBolt, ZIB: drawZib };
/** world height (m) of each card: Pip 1.5, Bolt 1.7, Zib 0.85 */
export const HEIGHT = { PIP: 1.5, BOLT: 1.7, ZIB: 0.85 };
export const CARD = { W: 900, H, PAD: 150 };
