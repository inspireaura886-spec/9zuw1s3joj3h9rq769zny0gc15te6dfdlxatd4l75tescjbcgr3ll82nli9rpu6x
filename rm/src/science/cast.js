// IA Science "What If" cast rig v2 (2026-11-02 crew overhaul): Pip (slacker genius), Bolt (exhausted female android),
// Zib (plush chaos alien). Stylised animated-film look: soft gradient shading, coloured line, cyan rim light from the
// right, big glossy eyes. Canvas2D in a 600 x 1000 design space (soles at y = 975), camera-facing billboards in three.js.
// v1 rig (kid scientist / box robot / one-eyed alien) kept in cast_v1.js.
// pose = {mouth 0..1, blink 0..1, expr: happy|shock|worry|deadpan|smug|narrow|meh, armL, armR (deg, 0 = down, + = out),
//         look -1..1, glow 0..1, item: remote|spoon|shovel,
//         Pip: hairColor ('#hex' or ['#a','#b',..] multi-tone, default ginger), shrug 0..1, foreL / foreR (forearm deg; > 75 = open palm), headTilt
//         Bolt: narrow 0..1 (eyes narrow further), hips 0..1 (hands on hips; default 1 when no arm angles given)
//         Zib: squish -1..1 (+ = squashed down, - = stretched up), wob -1..1 (antenna sway), scarf (deg, tail sway)
//         Pip: hairBob (design units, hair bounce)  [secondary-motion params added 2026-11-02 look test; 0 = locked look]}
export const INK = '#241726';
const W = 600, H = 1000;
const rad = (d) => (d * Math.PI) / 180;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const hx = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); };
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const lt = (c, t) => mix(c, '#ffffff', t), dk = (c, t) => mix(c, '#000000', t);
const RIM = '#bff4ff';

const E = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const RR = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
const POLY = (pts) => { const p = new Path2D(); p.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) p.lineTo(...pts[i]); p.closePath(); return p; };
/** tapered capsule from (x0,y0) r0 to (x1,y1) r1 */
const CAP = (x0, y0, x1, y1, r0, r1 = r0) => { const a = Math.atan2(y1 - y0, x1 - x0); const p = new Path2D(); p.arc(x1, y1, r1, a - Math.PI / 2, a + Math.PI / 2); p.arc(x0, y0, r0, a + Math.PI / 2, a + Math.PI * 1.5); p.closePath(); return p; };

/** soft-shaded fill: base gradient [x0,y0,x1,y1,c0,c1(,c2)] or flat fill, cyan rim crescent on the right, top-left highlight,
 *  bottom occlusion, then a coloured outline */
const paint = (g, p, o) => {
  g.save(); g.clip(p);
  let f = o.fill || '#ccc';
  if (o.grad) { const [x0, y0, x1, y1, ...cs] = o.grad; const gr = g.createLinearGradient(x0, y0, x1, y1); cs.forEach((c, i) => gr.addColorStop(i / Math.max(1, cs.length - 1), c)); f = gr; }
  if (o.rim !== false) { g.fillStyle = o.rim || RIM; g.fill(p); g.save(); g.translate(-(o.rw ?? 9), (o.rw ?? 9) * 0.35); g.filter = 'blur(2px)'; g.fillStyle = f; g.fill(p); g.restore(); }
  else { g.fillStyle = f; g.fill(p); }
  if (o.hl) { const [x, y, r, a] = o.hl; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  if (o.ao) { const [y0, y1, a] = o.ao; const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(20,10,30,0)'); gr.addColorStop(1, `rgba(20,10,30,${a})`); g.fillStyle = gr; g.fillRect(-200, y0, 1000, y1 - y0); }
  if (o.inner) o.inner();
  g.restore();
  if (o.line !== false) { g.lineWidth = o.lw ?? 6; g.strokeStyle = o.line || INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(p); }
};

/** two-segment limb from shoulder (x,y): a1 upper angle, a2 forearm angle (deg from straight down, + = outward), side -1/+1 */
const joints = (x, y, a1, a2, side, L1, L2) => {
  const e = [x + Math.sin(rad(a1)) * L1 * side, y + Math.cos(rad(a1)) * L1];
  const w = [e[0] + Math.sin(rad(a2)) * L2 * side, e[1] + Math.cos(rad(a2)) * L2];
  return [e, w];
};

/** glossy cartoon eye. lidT / lidB = 0..1 cover from top / bottom, lidTilt + = inner corner lower (annoyed), - = sad */
const glossEye = (g, x, y, rx, ry, o) => {
  const { look = 0, lookY = 0, blink = 0, lidT = 0, lidB = 0, tilt = 0, side = 1, iris = '#3b2a22', irisR = 0.7, pupR = 0.55, skin = '#f3c7a5', line = INK, lw = 5, shine = 1 } = o;
  const sc = E(x, y, rx, ry);
  paint(g, sc, { grad: [x, y - ry, x, y + ry, '#ffffff', '#ffffff', '#dfe6f0'], rim: false, line: false });
  g.save(); g.clip(sc);
  const ir = rx * irisR, ix = x + look * rx * 0.3, iy = y + lookY * ry * 0.25 + ry * 0.05;
  const gr = g.createRadialGradient(ix, iy + ir * 0.45, ir * 0.1, ix, iy, ir); gr.addColorStop(0, lt(iris, 0.45)); gr.addColorStop(0.7, iris); gr.addColorStop(1, dk(iris, 0.45));
  g.fillStyle = gr; g.fill(E(ix, iy, ir, ir * 1.04));
  g.fillStyle = '#0d0910'; g.fill(E(ix, iy, ir * pupR, ir * pupR * 1.05));
  if (shine) { g.fillStyle = 'rgba(255,255,255,0.95)'; g.fill(E(ix + ir * 0.32, iy - ir * 0.38, ir * 0.3, ir * 0.27)); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill(E(ix - ir * 0.34, iy + ir * 0.4, ir * 0.13, ir * 0.12)); }
  // lids
  const t = clamp(lidT + (1 - lidT) * clamp(blink)), b = clamp(lidB * (1 - clamp(blink)));
  if (t > 0.001) {
    const ly = y - ry + 2 * ry * t, ti = tilt * ry * 0.5 * side; // inner corner = toward face centre
    const lp = new Path2D(); lp.moveTo(x - rx - 8, y - ry - 8); lp.lineTo(x + rx + 8, y - ry - 8); lp.lineTo(x + rx + 8, ly - ti); lp.quadraticCurveTo(x, ly + ry * 0.12 * (1 - t), x - rx - 8, ly + ti); lp.closePath();
    g.fillStyle = skin; g.fill(lp);
    g.lineWidth = lw + 1.5; g.strokeStyle = line; g.beginPath(); g.moveTo(x + rx + 8, ly - ti); g.quadraticCurveTo(x, ly + ry * 0.12 * (1 - t), x - rx - 8, ly + ti); g.stroke();
  }
  if (b > 0.001) {
    const ly = y + ry - 2 * ry * b; const lp = new Path2D(); lp.moveTo(x - rx - 8, y + ry + 8); lp.lineTo(x + rx + 8, y + ry + 8); lp.lineTo(x + rx + 8, ly); lp.quadraticCurveTo(x, ly - ry * 0.1, x - rx - 8, ly); lp.closePath();
    g.fillStyle = skin; g.fill(lp);
  }
  g.restore();
  g.lineWidth = lw; g.strokeStyle = line; g.stroke(sc);
};

/** mouth: smile / flat / frown line when closed, open shape with tongue when talking. curve + = smile */
const mouth = (g, x, y, w, open, curve, o = {}) => {
  const { line = INK, lw = 6, inside = '#5a1e2c', tongue = '#e8737e', skew = 0 } = o;
  if (open < 0.08) {
    g.lineWidth = lw; g.strokeStyle = line; g.lineCap = 'round'; g.beginPath();
    g.moveTo(x - w / 2, y - curve * w * 0.12 + skew); g.quadraticCurveTo(x, y + curve * w * 0.35, x + w / 2, y - curve * w * 0.12 - skew); g.stroke(); return;
  }
  const h = w * (0.15 + 0.5 * open);
  const p = new Path2D(); p.moveTo(x - w / 2, y + skew); p.quadraticCurveTo(x, y - h * 0.2 + curve * 6, x + w / 2, y - skew);
  p.quadraticCurveTo(x + w * 0.42, y + h, x, y + h); p.quadraticCurveTo(x - w * 0.42, y + h, x - w / 2, y + skew); p.closePath();
  g.save(); g.clip(p); g.fillStyle = inside; g.fill(p); g.fillStyle = tongue; g.fill(E(x, y + h * 0.95, w * 0.3, h * 0.45)); g.fillStyle = '#fff'; g.fillRect(x - w / 2, y - 20, w, 10 + h * 0.18 + 12); g.restore();
  g.lineWidth = lw; g.strokeStyle = line; g.lineJoin = 'round'; g.stroke(p);
};

/** hand props at hand point (hx, hy) */
const prop = (g, kind, hx, hy, glow = 0.6) => {
  if (!kind) return;
  if (kind === 'remote') {
    const b = RR(hx - 30, hy - 92, 60, 118, 18);
    paint(g, b, { grad: [hx - 30, 0, hx + 30, 0, '#5a6070', '#3a3f4b', '#262a33'], rw: 5, line: '#14161c', lw: 5, hl: [hx - 12, hy - 80, 30, 0.25] });
    g.fillStyle = `rgba(255,70,60,${0.25 + 0.3 * glow})`; g.fill(E(hx, hy - 58, 30, 30));
    paint(g, E(hx, hy - 58, 20, 19), { grad: [hx, hy - 76, hx, hy - 40, '#ff8a7a', '#f2342b', '#a5130f'], rim: false, line: '#5c0c0a', lw: 4, hl: [hx - 6, hy - 66, 9, 0.9] });
    for (let i = 0; i < 3; i++) { g.fillStyle = ['#57f2a0', '#ffd25e', '#6fb4ff'][i]; g.fill(RR(hx - 20 + i * 15, hy - 22, 10, 7, 3)); }
    g.strokeStyle = '#14161c'; g.lineWidth = 5; g.beginPath(); g.moveTo(hx + 14, hy - 92); g.lineTo(hx + 22, hy - 120); g.stroke();
    g.fillStyle = '#ff5a4a'; g.fill(E(hx + 23, hy - 123, 6, 6));
  } else if (kind === 'spoon') {
    g.lineCap = 'round'; g.strokeStyle = '#3a3a48'; g.lineWidth = 22; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 50, hy - 140); g.stroke();
    g.strokeStyle = '#dfe5ea'; g.lineWidth = 12; g.stroke();
    paint(g, E(hx + 62, hy - 178, 46, 36, rad(-20)), { grad: [hx + 20, 0, hx + 110, 0, '#ffffff', '#c9d2da'], line: '#3a3a48', lw: 5 });
    g.fillStyle = `rgba(140,200,255,${0.35 + 0.25 * glow})`; g.fill(E(hx + 62, hy - 192, 42 + 14 * glow, 42 + 14 * glow));
    paint(g, E(hx + 62, hy - 190, 24, 20), { fill: '#eaf6ff', rim: false, line: '#6fb4ff', lw: 4 });
  } else if (kind === 'shovel') {
    g.lineCap = 'round'; g.strokeStyle = '#3a2a22'; g.lineWidth = 22; g.beginPath(); g.moveTo(hx, hy - 120); g.lineTo(hx, hy + 260); g.stroke();
    g.strokeStyle = '#b5653f'; g.lineWidth = 12; g.stroke();
    paint(g, POLY([[hx - 44, hy + 250], [hx + 44, hy + 250], [hx + 38, hy + 345], [hx, hy + 380], [hx - 38, hy + 345]]), { grad: [hx - 44, 0, hx + 44, 0, '#c9d2da', '#7f8b97'], line: '#3a3a48', lw: 5 });
  }
};

// ================================================================== PIP — early-20s slacker genius
const SKIN = '#f6c9a6', SKIN_L = '#fde0c8', SKIN_D = '#d99a7a', LINE_P = '#4a2a22';
export const PIP_HAIR = { ginger: '#e0702a', teal: '#2fbfb3', pink: '#ff6fae', violet: '#8b5cf6', platinum: '#f1e6c8', black: '#2a2230' };
const hairFill = (g, hair, x0, x1) => {
  const cs = Array.isArray(hair) ? hair : [hair];
  if (cs.length === 1) return null;
  const gr = g.createLinearGradient(x0, 0, x1, 0); const n = cs.length;
  cs.forEach((c, i) => { gr.addColorStop(Math.max(0, i / n + 0.02), c); gr.addColorStop(Math.min(1, (i + 1) / n - 0.02), c); });
  return gr;
};
const pipArm = (g, sx, sy, a1, a2, side, open, plaid) => {
  const [e, w] = joints(sx, sy, a1, a2, side, 150, 118);
  // forearm (skin) then rolled flannel sleeve over the upper arm + cuff
  paint(g, CAP(e[0], e[1], w[0], w[1], 23, 20), { grad: [Math.min(e[0], w[0]) - 25, 0, Math.max(e[0], w[0]) + 25, 0, SKIN_L, SKIN, SKIN_D], line: LINE_P, lw: 5, rw: 7 });
  // hand: mitten + thumb; open = palm up
  const ha = Math.atan2(w[1] - e[1], w[0] - e[0]);
  const hxp = w[0] + Math.cos(ha) * 18, hyp = w[1] + Math.sin(ha) * 18;
  if (open > 0.5) {
    paint(g, E(hxp, hyp - 4, 30, 20, ha * 0.2), { grad: [hxp - 30, 0, hxp + 30, 0, SKIN_L, SKIN, SKIN_D], line: LINE_P, lw: 5, rw: 5 });
    g.strokeStyle = LINE_P; g.lineWidth = 3; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(hxp + side * 6 + k * 9, hyp - 18); g.lineTo(hxp + side * 10 + k * 9, hyp - 8); g.stroke(); }
  } else {
    paint(g, E(hxp, hyp, 27, 31, ha - Math.PI / 2), { grad: [hxp - 24, 0, hxp + 24, 0, SKIN_L, SKIN, SKIN_D], line: LINE_P, lw: 5, rw: 5 });
    paint(g, E(hxp - side * 21, hyp - 9, 10, 16, -side * 0.6), { fill: SKIN, rim: false, line: LINE_P, lw: 4 });
  }
  const sl = CAP(sx, sy, e[0], e[1], 35, 28);
  paint(g, sl, { fill: plaid.base, line: '#4b1512', lw: 5, rw: 7, inner: () => plaid.pattern(g, Math.atan2(e[1] - sy, e[0] - sx)) });
  paint(g, CAP(e[0] - (e[0] - sx) * 0.12, e[1] - (e[1] - sy) * 0.12, e[0] - (e[0] - sx) * 0.02, e[1] - (e[1] - sy) * 0.02, 30, 29), { grad: [e[0] - 30, 0, e[0] + 30, 0, '#d4544a', '#a8302a'], line: '#4b1512', lw: 5, rw: 5 });
  return [hxp, hyp];
};
const plaidOf = (g) => ({
  base: '#b8392f',
  pattern: (gg, ang = 0) => {
    gg.save(); gg.globalAlpha = 0.55;
    for (let y = 0; y < H; y += 58) { gg.fillStyle = '#6e1c19'; gg.fillRect(-200, y, 1000, 22); gg.fillStyle = 'rgba(255,214,120,0.6)'; gg.fillRect(-200, y + 34, 1000, 3); }
    for (let x = -200; x < 800; x += 58) { gg.fillStyle = 'rgba(70,16,14,0.55)'; gg.fillRect(x, 0, 22, H); gg.fillStyle = 'rgba(255,214,120,0.45)'; gg.fillRect(x + 34, 0, 3, H); }
    gg.restore();
  },
});

export function drawPip(g, p) {
  const { mouth: mo = 0, blink = 0, expr = 'happy', look = 0, item = null, hairColor = PIP_HAIR.ginger, shrug = 0 } = p;
  const s = clamp(shrug);
  let armL = p.armL ?? 8, armR = p.armR ?? 8;
  g.clearRect(-150, 0, 900, H);
  const sh = 395 - 18 * s, hd = 6 * s; // shoulder line, head drop
  const plaid = plaidOf(g);
  // ---- legs: baggy faded jeans, knee rip, mismatched socks, beat-up sneakers
  for (const [x, d] of [[252, -1], [348, 1]]) {
    const leg = POLY([[x - 44, 640], [x + 44, 640], [x + 40 + d * 4, 905], [x - 40 + d * 4, 905]]);
    paint(g, leg, { grad: [x - 44, 0, x + 44, 0, '#7e9cc8', '#5577aa', '#3d5a88'], line: '#1f2c48', lw: 5, ao: [820, 905, 0.25] });
    g.strokeStyle = 'rgba(31,44,72,0.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + d * 14, 660); g.lineTo(x + d * 16, 900); g.stroke();
  }
  for (const [x, d] of [[252, -1], [348, 1]]) paint(g, RR(x - 44 + d * 4, 872, 88, 26, 8), { grad: [x - 44, 0, x + 44, 0, '#9fb8dc', '#6f8fc0'], line: '#1f2c48', lw: 4, rw: 5 }); // rolled cuffs
  // knee rip on the left leg
  paint(g, E(244, 790, 22, 10, 0.1), { fill: SKIN, rim: false, line: '#e8eef8', lw: 4 });
  g.strokeStyle = '#e8eef8'; g.lineWidth = 3; for (const k of [-12, 0, 12]) { g.beginPath(); g.moveTo(244 + k, 778); g.lineTo(244 + k, 802); g.stroke(); }
  // socks: left red/white stripes, right mustard with green dots
  const sockL = RR(214, 894, 72, 36, 10), sockR = RR(314, 894, 72, 36, 10);
  paint(g, sockL, { fill: '#f4f1ea', rim: false, line: LINE_P, lw: 4, inner: () => { g.fillStyle = '#e2453c'; for (let y = 892; y < 930; y += 14) g.fillRect(200, y, 100, 7); } });
  paint(g, sockR, { fill: '#e6b437', rim: false, line: LINE_P, lw: 4, inner: () => { g.fillStyle = '#3f9a4a'; for (const [a, b] of [[328, 902], [352, 912], [372, 900], [340, 922], [366, 924]]) g.fill(E(a, b, 4, 4)); } });
  for (const [x, d] of [[246, -1], [354, 1]]) {
    const shoe = new Path2D(); shoe.moveTo(x - 46, 922); shoe.lineTo(x + 20, 918); shoe.quadraticCurveTo(x + d * 6 + 62, 930, x + d * 4 + 60, 958); shoe.lineTo(x + d * 4 + 58, 972); shoe.lineTo(x - 50, 972); shoe.quadraticCurveTo(x - 58, 945, x - 46, 922); shoe.closePath();
    paint(g, shoe, { grad: [0, 918, 0, 972, '#efe9dc', '#cfc7b6'], line: '#3a3330', lw: 5, rw: 6 });
    g.fillStyle = '#f7f3ea'; g.fill(RR(x - 52, 958, 114, 15, 6)); g.strokeStyle = '#3a3330'; g.lineWidth = 4; g.stroke(RR(x - 52, 958, 114, 15, 6));
    g.fillStyle = 'rgba(90,70,60,0.35)'; g.fill(E(x + 30, 944, 14, 6, 0.3)); g.fill(E(x - 20, 935, 8, 4));
    g.strokeStyle = '#3a3330'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - 8 + k * 10, 924); g.lineTo(x + k * 10, 938); g.stroke(); }
  }
  // untied lace (right shoe)
  g.strokeStyle = '#f7f3ea'; g.lineWidth = 4; g.beginPath(); g.moveTo(370, 936); g.quadraticCurveTo(395, 960, 380, 975); g.stroke();
  // ---- arms behind torso? no: back arm first (left), torso, then right arm on top
  const shrugA = (a) => a * (1 - s) + 22 * s, shrugF = (a) => a * (1 - s) + 112 * s;
  const fl = (a) => a + (a > 60 ? 18 : 8);
  const fL = p.foreL ?? fl(armL), fR = p.foreR ?? fl(armR); // forearm angles (bend at the elbow)
  const hL = pipArm(g, 204, sh + 22, shrugA(armL), shrugF(fL), -1, Math.max(s, fL > 75 ? 1 : 0), plaid);
  // ---- torso: faded sci-fi tee + open flannel, buttoned below the chest
  const tee = new Path2D(); tee.moveTo(206, sh + 4); tee.quadraticCurveTo(300, sh - 14, 394, sh + 4); tee.quadraticCurveTo(412, sh + 20, 410, sh + 60); tee.lineTo(410, 652); tee.quadraticCurveTo(300, 664, 190, 652); tee.lineTo(190, sh + 60); tee.quadraticCurveTo(188, sh + 20, 206, sh + 4); tee.closePath();
  paint(g, tee, { grad: [190, 0, 410, 0, '#3a4a72', '#2c3a5e', '#1f2a46'], line: '#141a2c', lw: 5 });
  // tee graphic: retro ringed planet + little rocket (faded print)
  g.save(); g.globalAlpha = 0.85;
  paint(g, E(300, 472, 34, 34), { grad: [270, 440, 330, 506, '#ffb35c', '#e0702a'], rim: false, line: '#f4e2c4', lw: 3 });
  g.strokeStyle = '#f4e2c4'; g.lineWidth = 5; g.beginPath(); g.ellipse(300, 474, 62, 15, rad(-14), rad(195), rad(345 + 360)); g.stroke();
  g.fillStyle = '#f4e2c4'; for (const [a, b] of [[248, 430], [352, 436], [338, 516], [262, 512]]) g.fill(E(a, b, 3, 3));
  g.restore();
  // flannel panels: open V down to y 545, overlapping below
  const vb = 548;
  const panL = new Path2D(); panL.moveTo(208, sh + 2); panL.lineTo(254, sh - 6); panL.quadraticCurveTo(262, sh + 90, 302, vb); panL.lineTo(306, 662); panL.lineTo(184, 656); panL.lineTo(186, sh + 70); panL.quadraticCurveTo(186, sh + 18, 208, sh + 2); panL.closePath();
  const panR = new Path2D(); panR.moveTo(392, sh + 2); panR.lineTo(346, sh - 6); panR.quadraticCurveTo(338, sh + 90, 298, vb); panR.lineTo(294, 662); panR.lineTo(416, 656); panR.lineTo(414, sh + 70); panR.quadraticCurveTo(414, sh + 18, 392, sh + 2); panR.closePath();
  for (const pn of [panL, panR]) paint(g, pn, { fill: plaid.base, line: '#4b1512', lw: 5, rw: 8, ao: [560, 660, 0.3], inner: () => plaid.pattern(g) });
  // collar flaps
  paint(g, POLY([[254, sh - 8], [228, sh + 46], [268, sh + 40]]), { fill: '#c9463b', line: '#4b1512', lw: 4, rw: 4 });
  paint(g, POLY([[346, sh - 8], [372, sh + 46], [332, sh + 40]]), { fill: '#c9463b', line: '#4b1512', lw: 4, rw: 4 });
  // buttons (only the lower ones done up)
  for (const y of [572, 618]) { paint(g, E(300, y, 7, 7), { fill: '#efe2c6', rim: false, line: '#4b1512', lw: 3 }); }
  paint(g, E(318, 520, 6, 6), { fill: '#efe2c6', rim: false, line: '#4b1512', lw: 3 }); // undone button
  // ---- neck + head (drops a touch on a shrug)
  g.save(); g.translate(0, hd); g.translate(300, 380); g.rotate(rad(p.headTilt ?? -3)); g.translate(-300, -380);
  paint(g, RR(276, 330, 48, 76, 18), { grad: [276, 0, 324, 0, SKIN, SKIN_D], line: LINE_P, lw: 5, rim: false });
  // back hair mass
  const hairCs = Array.isArray(hairColor) ? hairColor : [hairColor];
  const hairBase = hairCs[0];
  const hb = p.hairBob ?? 0; // secondary motion: hair lags/bounces (design units, + = down)
  g.save(); g.translate(0, hb * 0.6);
  const back = new Path2D(); back.ellipse(300, 196, 118, 112, 0, Math.PI * 0.95, Math.PI * 2.05); back.lineTo(412, 260); back.quadraticCurveTo(300, 300, 188, 260); back.closePath();
  paint(g, back, { fill: hairFill(g, hairColor, 180, 420) || dk(hairBase, 0.15), rim: false, line: dk(hairBase, 0.6), lw: 5 });
  g.restore();
  // ears
  for (const [x, d] of [[200, -1], [400, 1]]) paint(g, E(x, 238, 16, 24), { grad: [x - 16, 0, x + 16, 0, SKIN, SKIN_D], line: LINE_P, lw: 5, rw: 5 });
  // face
  const face = new Path2D(); face.moveTo(300, 104); face.bezierCurveTo(372, 104, 402, 160, 400, 225); face.bezierCurveTo(398, 292, 362, 346, 300, 350); face.bezierCurveTo(238, 346, 202, 292, 200, 225); face.bezierCurveTo(198, 160, 228, 104, 300, 104); face.closePath();
  paint(g, face, { grad: [200, 0, 400, 0, SKIN_L, SKIN, SKIN_D], line: LINE_P, lw: 6, rw: 10, hl: [255, 200, 90, 0.25], ao: [300, 352, 0.15] });
  // freckles + blush
  g.fillStyle = 'rgba(190,100,70,0.55)'; for (const [a, b] of [[238, 278], [250, 288], [228, 290], [362, 278], [350, 288], [372, 290], [244, 270], [356, 270]]) g.fill(E(a, b, 2.6, 2.6));
  for (const x of [240, 360]) { const gr = g.createRadialGradient(x, 286, 0, x, 286, 26); gr.addColorStop(0, 'rgba(240,120,110,0.35)'); gr.addColorStop(1, 'rgba(240,120,110,0)'); g.fillStyle = gr; g.fillRect(x - 26, 260, 52, 52); }
  // expression map
  const X = { happy: [0.2, 0, 0, 1], smug: [0.42, 0.1, 0.2, 0.6], deadpan: [0.48, 0, 0, 0], shock: [0, 0, 0, -0.2], worry: [0.12, 0, -0.5, -0.5], meh: [0.38, 0, 0, -0.1] }[s > 0.5 ? 'meh' : expr] || [0.2, 0, 0, 1];
  const [lidT, lidB, tilt, curve] = X;
  const er = expr === 'shock' ? 1.12 : 1;
  glossEye(g, 260, 234, 29 * er, 34 * er, { look, blink, lidT, lidB, tilt, side: 1, iris: '#4f8a3a', irisR: expr === 'shock' ? 0.55 : 0.68, skin: SKIN, line: LINE_P, lw: 5 });
  glossEye(g, 340, 234, 29 * er, 34 * er, { look, blink, lidT, lidB, tilt, side: -1, iris: '#4f8a3a', irisR: expr === 'shock' ? 0.55 : 0.68, skin: SKIN, line: LINE_P, lw: 5 });
  // brows (hair colour, darker)
  const bc = dk(hairBase, 0.35);
  const by = { happy: [-6, 0], smug: [-2, 10], deadpan: [4, 0], shock: [-18, 0], worry: [-8, -10], meh: [-14, -6] }[s > 0.5 ? 'meh' : expr] || [-6, 0];
  g.lineCap = 'round'; g.strokeStyle = bc; g.lineWidth = 9;
  g.beginPath(); g.moveTo(232, 192 + by[0] + 3); g.quadraticCurveTo(258, 184 + by[0] - by[1] * 0.3, 284, 192 + by[0] - by[1] * 0.2); g.stroke();
  g.beginPath(); g.moveTo(316, 192 + by[0] + by[1] * (expr === 'smug' ? -1.4 : -0.2)); g.quadraticCurveTo(342, 184 + by[0] - by[1] * (expr === 'smug' ? 1.2 : 0.3), 368, 192 + by[0] + 3); g.stroke();
  // nose
  g.strokeStyle = LINE_P; g.lineWidth = 4.5; g.beginPath(); g.moveTo(300, 252); g.quadraticCurveTo(290, 278, 302, 284); g.quadraticCurveTo(310, 285, 314, 279); g.stroke();
  // lopsided grin / talking mouth
  mouth(g, 302, 312, 58, mo, curve, { line: LINE_P, lw: 5, skew: expr === 'smug' || expr === 'happy' ? 4 : 0 });
  // ---- messy bedhead (front): clumpy tufts + fringe strands, any colour / multi-tone
  const tufts = [[196, 210], [186, 160], [214, 112], [250, 78], [292, 62], [338, 70], [378, 92], [412, 130], [420, 178], [406, 214]];
  g.save(); g.translate(300, 236); g.scale(1, 1 - hb * 0.004); g.translate(-300, -236 + hb);
  const hp = new Path2D(); hp.moveTo(200, 236);
  hp.quadraticCurveTo(176, 196, 186, 160); hp.quadraticCurveTo(170, 128, 214, 112); hp.quadraticCurveTo(212, 70, 252, 80);
  hp.quadraticCurveTo(262, 40, 298, 60); hp.quadraticCurveTo(330, 30, 340, 72); hp.quadraticCurveTo(388, 54, 380, 94);
  hp.quadraticCurveTo(436, 98, 414, 134); hp.quadraticCurveTo(446, 168, 418, 186); hp.quadraticCurveTo(424, 214, 402, 236);
  // fringe: chunky strands sweeping across the forehead
  hp.quadraticCurveTo(396, 186, 372, 166); hp.quadraticCurveTo(366, 196, 340, 200); hp.quadraticCurveTo(346, 172, 322, 158);
  hp.quadraticCurveTo(312, 192, 282, 198); hp.quadraticCurveTo(292, 170, 268, 158); hp.quadraticCurveTo(254, 186, 228, 196);
  hp.quadraticCurveTo(228, 176, 222, 168); hp.quadraticCurveTo(208, 196, 200, 236); hp.closePath();
  paint(g, hp, { fill: hairFill(g, hairColor, 186, 420) || hairBase, line: dk(hairBase, 0.55), lw: 6, rw: 9, hl: [270, 90, 80, 0.3], ao: [150, 240, 0.25] });
  // strand lines + a cowlick sticking up
  g.strokeStyle = dk(hairBase, 0.3); g.lineWidth = 4;
  for (const [a, b, c, d] of [[250, 92, 262, 140], [300, 70, 302, 130], [345, 82, 352, 135], [390, 120, 386, 160], [212, 130, 226, 160]]) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 8, (b + d) / 2, c, d); g.stroke(); }
  const cow = new Path2D(); cow.moveTo(292, 64); cow.quadraticCurveTo(286, 22, 318, 14); cow.quadraticCurveTo(300, 34, 310, 62); cow.closePath();
  paint(g, cow, { fill: hairCs[Math.min(1, hairCs.length - 1)], line: dk(hairBase, 0.55), lw: 5, rw: 4 });
  g.restore();
  g.restore();
  // front arm last
  const hR = pipArm(g, 396, sh + 22, shrugA(armR), shrugF(fR), 1, Math.max(s, fR > 75 ? 1 : 0), plaid);
  prop(g, item, hR[0], hR[1] - 10);
}

// ================================================================== BOLT — sleek silver female android
const SIL = ['#ffffff', '#dfe4ea', '#aab3bf'], SIL_LINE = '#3a404c', JOINT = '#23262e';
const silver = (x0, x1) => [x0, 0, x1, 0, ...SIL];
const boltLimb = (g, sx, sy, a1, a2, side, L1, L2, r1, r2) => {
  const [e, w] = joints(sx, sy, a1, a2, side, L1, L2);
  paint(g, CAP(sx, sy, e[0], e[1], r1, r1 * 0.82), { grad: silver(Math.min(sx, e[0]) - r1, Math.max(sx, e[0]) + r1), line: SIL_LINE, lw: 4.5, rw: 7 });
  paint(g, CAP(e[0], e[1], w[0], w[1], r2, r2 * 0.75), { grad: silver(Math.min(e[0], w[0]) - r2, Math.max(e[0], w[0]) + r2), line: SIL_LINE, lw: 4.5, rw: 6 });
  paint(g, E(e[0], e[1], r2 * 0.95, r2 * 0.95), { grad: [e[0] - r2, 0, e[0] + r2, 0, '#4a505c', JOINT], rim: false, line: '#121318', lw: 3.5 });
  return [e, w];
};
export function drawBolt(g, p) {
  const { mouth: mo = 0, blink = 0, expr = 'deadpan', look = 0, glow = 0.6 } = p;
  const hips = clamp(p.hips ?? (p.armL === undefined && p.armR === undefined ? 1 : 0));
  const nar = clamp(Math.max(p.narrow ?? 0, expr === 'narrow' ? 1 : 0));
  const armL = p.armL ?? 6, armR = p.armR ?? 6;
  g.clearRect(-150, 0, 900, H);
  // ---- legs (slight contrapposto): full thighs tapering to the knee, calf curve, sleek pointed feet
  const legs = [[256, 240, -1], [344, 352, 1]];
  for (const [hx0, fx, d] of legs) {
    const kx = (hx0 + fx) / 2 + d * 2, ky = 742;
    const th = new Path2D(); th.moveTo(hx0 - d * 2 - 46, 560); th.quadraticCurveTo(hx0 - 52, 650, kx - 23, ky); th.lineTo(kx + 23, ky); th.quadraticCurveTo(hx0 + 46, 640, hx0 + 44, 556); th.closePath();
    paint(g, th, { grad: silver(hx0 - 50, hx0 + 46), line: SIL_LINE, lw: 4.5, rw: 8, hl: [hx0 - 14, 600, 30, 0.35] });
    const sh = new Path2D(); sh.moveTo(kx - 22, ky); sh.quadraticCurveTo(kx - 30 - d * 2, ky + 70, fx - 14, 926); sh.lineTo(fx + 14, 926); sh.quadraticCurveTo(kx + 30 - d * 2, ky + 60, kx + 22, ky); sh.closePath();
    paint(g, sh, { grad: silver(kx - 32, kx + 32), line: SIL_LINE, lw: 4.5, rw: 7, hl: [kx - 10, ky + 60, 22, 0.35] });
    paint(g, E(kx, ky, 22, 20), { grad: [kx - 22, 0, kx + 22, 0, '#4a505c', JOINT], rim: false, line: '#121318', lw: 3.5 });
    const toe = fx + d * 40;
    const foot = new Path2D(); foot.moveTo(fx - 17, 918); foot.quadraticCurveTo(fx, 910, fx + 17, 918); foot.quadraticCurveTo(fx + d * 22 + (d > 0 ? 6 : -6), 950, toe, 970); foot.quadraticCurveTo(toe - d * 4, 976, toe - d * 14, 976); foot.lineTo(fx - d * 24, 976); foot.quadraticCurveTo(fx - d * 26, 948, d > 0 ? fx - 17 : fx + 17, 918); foot.closePath();
    paint(g, foot, { grad: silver(fx - 40, fx + 40), line: SIL_LINE, lw: 4.5, rw: 6 });
  }
  // ---- pelvis (flared hips) + dark flexible waist
  const pel = new Path2D(); pel.moveTo(262, 488); pel.quadraticCurveTo(300, 482, 338, 488); pel.quadraticCurveTo(384, 508, 392, 566); pel.quadraticCurveTo(360, 576, 318, 616); pel.quadraticCurveTo(300, 626, 282, 616); pel.quadraticCurveTo(240, 576, 208, 566); pel.quadraticCurveTo(216, 508, 262, 488); pel.closePath();
  paint(g, pel, { grad: silver(208, 392), line: SIL_LINE, lw: 4.5, rw: 8, hl: [250, 520, 40, 0.4] });
  g.strokeStyle = 'rgba(58,64,76,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(232, 548); g.quadraticCurveTo(300, 600, 368, 548); g.stroke();
  paint(g, RR(264, 440, 72, 62, 24), { grad: [264, 0, 336, 0, '#4a505c', '#2a2d35', '#15171c'], rim: false, line: '#0d0e12', lw: 4, inner: () => { g.strokeStyle = 'rgba(160,170,190,0.35)'; g.lineWidth = 3; for (let y = 452; y < 500; y += 12) { g.beginPath(); g.moveTo(264, y); g.lineTo(336, y); g.stroke(); } } });
  // ---- back arm (left)
  const arm = (side, a) => {
    const sx = side < 0 ? 224 : 376;
    const a1 = a * (1 - hips) + 40 * hips, a2 = (a + (a > 60 ? 16 : 6)) * (1 - hips) + -44 * hips;
    const [e, w] = boltLimb(g, sx, 336, a1, a2, side, 120, 112 - 6 * hips, 20, 17);
    const ha = Math.atan2(w[1] - e[1], w[0] - e[0]);
    paint(g, E(w[0] + Math.cos(ha) * 12, w[1] + Math.sin(ha) * 12, 17, 23, ha - Math.PI / 2), { grad: silver(w[0] - 20, w[0] + 20), line: SIL_LINE, lw: 4.5, rw: 4 });
    return w;
  };
  arm(-1, armL);
  // ---- torso: shaped chest plate, narrow waist
  const tor = new Path2D(); tor.moveTo(232, 318); tor.quadraticCurveTo(300, 304, 368, 318);
  tor.bezierCurveTo(392, 340, 394, 392, 366, 414); tor.bezierCurveTo(346, 430, 338, 440, 338, 460); tor.lineTo(262, 460); tor.bezierCurveTo(262, 440, 254, 430, 234, 414); tor.bezierCurveTo(206, 392, 208, 340, 232, 318); tor.closePath();
  paint(g, tor, { grad: silver(206, 394), line: SIL_LINE, lw: 5, rw: 9, hl: [262, 360, 60, 0.45] });
  g.strokeStyle = 'rgba(58,64,76,0.55)'; g.lineWidth = 3;
  g.strokeStyle = 'rgba(58,64,76,0.35)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(240, 400); g.quadraticCurveTo(270, 418, 296, 404); g.stroke(); g.beginPath(); g.moveTo(304, 404); g.quadraticCurveTo(330, 418, 360, 400); g.stroke(); // under-bust seams
  g.beginPath(); g.moveTo(262, 452); g.lineTo(338, 452); g.stroke();
  
  // neck (dark segmented) + shoulder balls
  paint(g, RR(282, 268, 36, 46, 10), { grad: [282, 0, 318, 0, '#4a505c', JOINT], rim: false, line: '#0d0e12', lw: 3.5, inner: () => { g.strokeStyle = 'rgba(160,170,190,0.4)'; g.lineWidth = 2.5; for (const y of [276, 290]) { g.beginPath(); g.moveTo(282, y); g.lineTo(318, y); g.stroke(); } } });
  for (const x of [224, 376]) paint(g, E(x, 334, 25, 24), { grad: silver(x - 30, x + 30), line: SIL_LINE, lw: 4.5, rw: 6, hl: [x - 10, 322, 18, 0.6] });
  // ---- head: smooth silver dome + glossy black visor
  const head = E(300, 160, 104, 116);
  paint(g, head, { grad: silver(208, 392), line: SIL_LINE, lw: 5, rw: 10, hl: [262, 108, 60, 0.6] });
  for (const [x, d] of [[196, -1], [404, 1]]) { paint(g, E(x, 170, 14, 32), { grad: [x - 13, 0, x + 13, 0, '#8d96a3', '#5b6370'], rim: false, line: SIL_LINE, lw: 4 }); g.fillStyle = `rgba(110,236,255,${0.4 + 0.4 * glow})`; g.fill(E(x + d * 2, 170, 3.5, 13)); }
  const vis = new Path2D(); vis.moveTo(204, 146); vis.bezierCurveTo(212, 92, 388, 92, 396, 146); vis.bezierCurveTo(402, 186, 380, 214, 346, 218); vis.quadraticCurveTo(300, 226, 254, 218); vis.bezierCurveTo(220, 214, 198, 186, 204, 146); vis.closePath();
  paint(g, vis, { grad: [0, 110, 0, 222, '#2a2f3a', '#0b0d12', '#05060a'], rim: '#5a6a80', rw: 4, line: '#05060a', lw: 4 });
  // glowing eyes: resting = unamused flat-topped half lids; narrow -> slits; brow LEDs slant inward
  const eh0 = { deadpan: 15, narrow: 15, smug: 13, happy: 12, worry: 16, shock: 24 }[expr] || 15;
  const eh = Math.max(2.5, eh0 * (1 - 0.72 * nar) * (1 - clamp(blink)));
  const ex = look * 10;
  g.save(); g.clip(vis);
  for (const [cx, sd] of [[258 + ex, 1], [342 + ex, -1]]) {
    const ew = 33, cy = 162;
    const top = cy - eh * 0.45 + sd * 0 , slant = (expr === 'worry' ? -4 : 3 + 6 * nar) ; // inner corner lower
    const ep = new Path2D();
    ep.moveTo(cx - ew, top + (sd > 0 ? -slant * 0.3 : slant)); ep.lineTo(cx + ew, top + (sd > 0 ? slant : -slant * 0.3));
    ep.quadraticCurveTo(cx + ew * 0.8, cy + eh * 0.9, cx, cy + eh * 0.95); ep.quadraticCurveTo(cx - ew * 0.8, cy + eh * 0.9, cx - ew, top + (sd > 0 ? -slant * 0.3 : slant)); ep.closePath();
    g.save(); g.shadowColor = '#5ff2ff'; g.shadowBlur = 18 + 10 * glow; g.fillStyle = '#7ff6ff'; g.fill(ep); g.restore();
    g.fillStyle = 'rgba(230,255,255,0.85)'; g.fill(E(cx - 6, cy + eh * 0.2, ew * 0.45, Math.max(1, eh * 0.22)));
    // brow LED (inner end drops as she narrows)
    const bi = 4 + 12 * nar + (expr === 'shock' ? -10 : 0) + (expr === 'worry' ? -10 : 0);
    g.save(); g.shadowColor = '#5ff2ff'; g.shadowBlur = 10; g.strokeStyle = 'rgba(127,246,255,0.85)'; g.lineWidth = 4.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - sd * ew * 0.9, top - 14 - (expr === 'smug' && sd < 0 ? 6 : 0)); g.lineTo(cx + sd * ew * 0.8, top - 14 + bi); g.stroke(); g.restore();
  }
  // glossy reflection streak
  g.fillStyle = 'rgba(255,255,255,0.13)'; g.fill(POLY([[236, 112], [268, 112], [228, 214], [208, 196]]));
  g.fillStyle = 'rgba(255,255,255,0.07)'; g.fill(POLY([[280, 110], [292, 110], [252, 220], [242, 218]]));
  g.restore();
  // mouth on the silver lower face: flat, slightly down = unamused; opens to a dark slot when talking
  if (mo < 0.08) { g.strokeStyle = SIL_LINE; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(286, 248); g.quadraticCurveTo(300, expr === 'happy' || expr === 'smug' ? 252 : 246, 314, expr === 'smug' ? 244 : 249); g.stroke(); }
  else { const h = 4 + 14 * mo; const mp = RR(286, 245 - h * 0.3, 28, h, Math.min(7, h / 2)); paint(g, mp, { fill: '#14161c', rim: false, line: SIL_LINE, lw: 3.5, inner: () => { g.fillStyle = 'rgba(95,242,255,0.35)'; g.fillRect(286, 245 + h * 0.3, 28, h); } }); }
  // ---- front arm (right)
  arm(1, armR);
}

// ================================================================== ZIB — plush chaos bean (two big glossy eyes)
const G0 = '#a8ec6a', G1 = '#7ed34a', G2 = '#4fa632', GL = '#2f6a1f';
export function drawZib(g, p) {
  const { mouth: mo = 0, blink = 0, expr = 'happy', armL = 20, armR = 20, look = 0, glow = 0.5, item = null } = p;
  const sq = clamp(p.squish ?? 0, -1, 1);
  g.clearRect(-150, 0, 900, H);
  const sy0 = sq >= 0 ? 1 - 0.2 * sq : 1 - 0.16 * sq, sx0 = sq >= 0 ? 1 + 0.16 * sq : 1 + 0.1 * sq;
  g.save(); g.translate(300, 968); g.scale(0.84 * sx0, 0.84 * sy0); g.translate(-300, -968);
  // antennae (wobble a touch with squish), green stalks + pink-tipped bulbs
  for (const [bx, tx, d] of [[250, 196, -1], [350, 404, 1]]) {
    const wb = p.wob ?? 0; const ty = 122 + 14 * sq + Math.abs(wb) * 5, tx2 = tx + d * 10 * sq + wb * 26; // wob = antenna sway -1..1
    g.lineCap = 'round'; g.strokeStyle = GL; g.lineWidth = 26; g.beginPath(); g.moveTo(bx, 320); g.bezierCurveTo(bx + d * 6, 220, tx2 - d * 40, 150, tx2, ty); g.stroke();
    g.strokeStyle = G1; g.lineWidth = 16; g.stroke();
    g.strokeStyle = 'rgba(200,250,160,0.7)'; g.lineWidth = 5; g.beginPath(); g.moveTo(bx - 4, 310); g.bezierCurveTo(bx + d * 2, 220, tx2 - d * 44, 156, tx2 - 4, ty + 4); g.stroke();
    g.fillStyle = `rgba(255,140,190,${0.25 * glow})`; g.fill(E(tx2, ty - 8, 40, 40));
    paint(g, E(tx2, ty - 8, 28, 27), { grad: [tx2 - 28, ty - 36, tx2 + 28, ty + 20, '#ffd0e4', '#ff7fb3', '#e0558e'], line: '#8a2a55', lw: 5, rw: 6, hl: [tx2 - 9, ty - 18, 12, 0.85] });
  }
  // stubby legs
  for (const x of [240, 360]) paint(g, RR(x - 50, 884, 100, 86, 42), { grad: [x - 50, 0, x + 50, 0, G0, G1, G2], line: GL, lw: 6, rw: 8, ao: [930, 970, 0.22] });
  // plush gumdrop body (round top, fuller bottom)
  const body = new Path2D(); body.moveTo(300, 262);
  body.bezierCurveTo(440, 262, 488, 380, 494, 560); body.bezierCurveTo(502, 790, 452, 920, 300, 920);
  body.bezierCurveTo(148, 920, 98, 790, 106, 560); body.bezierCurveTo(112, 380, 160, 262, 300, 262); body.closePath();
  paint(g, body, { grad: [106, 262, 494, 920, G0, G1, G2], line: GL, lw: 7, rw: 12, hl: [226, 350, 150, 0.35], ao: [780, 920, 0.18],
    inner: () => { // felt fuzz speckle
      let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 420; i++) { const x = 110 + rnd() * 380, y = 266 + rnd() * 650; g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(30,70,20,0.07)'; g.fillRect(x, y, 2.5, 2.5); }
    } });
  // plush seam stitches down the left side
  g.strokeStyle = 'rgba(47,106,31,0.45)'; g.lineWidth = 3.5; g.setLineDash([9, 9]); g.beginPath(); g.moveTo(140, 440); g.bezierCurveTo(128, 580, 140, 740, 190, 870); g.stroke(); g.setLineDash([]);
  // eyes: two big glossy eyes
  const X = { happy: [0, 0.18, 0, 1], smug: [0.36, 0.12, 0.3, 0.6], deadpan: [0.42, 0, 0, 0], shock: [0, 0, 0, -0.3], worry: [0.08, 0, -0.6, -0.6] }[expr] || [0, 0.18, 0, 1];
  const er = expr === 'shock' ? 1.1 : 1;
  for (const [x, sd] of [[230, 1], [370, -1]]) glossEye(g, x, 478, 66 * er, 76 * er, { look, blink, lidT: X[0], lidB: X[1], tilt: X[2], side: sd, iris: '#3a2618', irisR: expr === 'shock' ? 0.62 : 0.78, pupR: 0.5, skin: G1, line: GL, lw: 6 });
  // tiny brows
  const bo = { happy: -4, smug: 4, deadpan: 6, shock: -16, worry: -6 }[expr] ?? -4, bt = expr === 'worry' ? -8 : expr === 'smug' ? 6 : 0;
  g.strokeStyle = GL; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath(); g.moveTo(200, 382 + bo + bt * -0.5); g.quadraticCurveTo(228, 372 + bo, 256, 380 + bo + bt); g.stroke();
  g.beginPath(); g.moveTo(344, 380 + bo + bt); g.quadraticCurveTo(372, 372 + bo, 400, 382 + bo + bt * -0.5); g.stroke();
  // blush
  for (const x of [168, 432]) { const gr = g.createRadialGradient(x, 574, 0, x, 574, 44); gr.addColorStop(0, 'rgba(255,120,150,0.6)'); gr.addColorStop(1, 'rgba(255,120,150,0)'); g.fillStyle = gr; g.fillRect(x - 44, 530, 88, 88); }
  // mouth
  mouth(g, 300, 590, 70, mo, X[3], { line: GL, lw: 6, inside: '#5a1e2c', tongue: '#ff7f98' });
  // knitted purple scarf + hanging tail
  const sc = new Path2D(); sc.moveTo(114, 650); sc.quadraticCurveTo(300, 712, 486, 650); sc.lineTo(492, 712); sc.quadraticCurveTo(300, 782, 110, 712); sc.closePath();
  const ribs = () => { g.strokeStyle = 'rgba(60,20,110,0.35)'; g.lineWidth = 4; for (let x = 120; x < 490; x += 20) { g.beginPath(); g.moveTo(x, 600); g.lineTo(x + 4, 780); g.stroke(); } };
  const tail = new Path2D(); tail.moveTo(352, 722); tail.quadraticCurveTo(392, 722, 416, 712); tail.lineTo(436, 842); tail.quadraticCurveTo(404, 854, 372, 848); tail.closePath();
  g.save(); g.translate(384, 722); g.rotate(rad(p.scarf ?? 0)); g.translate(-384, -722); // scarf = tail sway (deg)
  paint(g, tail, { grad: [352, 0, 436, 0, '#a983ff', '#8b5cf6', '#6b3fd6'], line: '#3c1f7a', lw: 5, rw: 6, inner: ribs });
  g.strokeStyle = '#7a4be8'; g.lineWidth = 5; for (let x = 378; x <= 430; x += 10) { g.beginPath(); g.moveTo(x, 848); g.lineTo(x + 1, 868); g.stroke(); }
  g.restore();
  paint(g, sc, { grad: [0, 628, 0, 760, '#b493ff', '#8b5cf6', '#6436d0'], line: '#3c1f7a', lw: 6, rw: 8, inner: ribs });
  paint(g, E(372, 724, 34, 26, -0.3), { grad: [338, 0, 406, 0, '#a983ff', '#7d4cf0'], line: '#3c1f7a', lw: 5, rw: 5 }); // knot
  // stubby nub arms
  const nub = (side, a) => {
    const sx = side < 0 ? 122 : 478, sy = 742;
    const ex = sx + Math.sin(rad(a)) * 74 * side, ey = sy + Math.cos(rad(a)) * 74;
    paint(g, CAP(sx, sy, ex, ey, 32, 30), { grad: [Math.min(sx, ex) - 30, 0, Math.max(sx, ex) + 30, 0, G0, G1, G2], line: GL, lw: 6, rw: 7 });
    return [ex, ey];
  };
  nub(-1, armL);
  const hz = nub(1, armR);
  g.save(); g.translate(hz[0], hz[1] + 6); g.scale(1.35, 1.35); prop(g, item, 0, 0, glow); g.restore();
  g.restore();
}

export const DRAW = { PIP: drawPip, BOLT: drawBolt, ZIB: drawZib };
/** world height (m) of each card: Pip 1.65, Bolt 1.7, Zib 0.95 (Zib drawn at 0.84 scale inside his card for squash headroom) */
export const HEIGHT = { PIP: 1.65, BOLT: 1.7, ZIB: 0.95 };
export const CARD = { W: 900, H, PAD: 150, RES: 2 };
