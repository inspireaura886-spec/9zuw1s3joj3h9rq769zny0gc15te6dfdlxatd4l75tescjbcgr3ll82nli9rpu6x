// ThickStickMan: reusable rigged THICK stick figure (nottrue batch, 2026-10-28).
// Draw inside an <svg>. Feet land on (x, y) automatically for grounded poses.
// props: x, y, s (scale), pose (name | [nameA, nameB, k]), t (frame for cycles), facing (1 right / -1 left),
//        look (-1..1 head turn; |look|>0.6 = looking back over shoulder), eyes ('normal'|'wide'|'closed'|'none'|'glow'),
//        mouth (0..1 flap), rot (whole-body degrees, for falls), ink (stroke), head (head fill), rim (accent rim colour),
//        variant ('man' | 'shadow' = the Thing: black body, glowing eyes, taller), brow (-1 calm .. 1 fear), opacity
import React from 'react';

const L = {thigh: 92, shin: 92, torso: 150, neck: 18, up: 78, fore: 74, head: 46};
const D = Math.PI / 180;

// angles in degrees: 0 = straight down, + = toward facing. shin/fore are RELATIVE to thigh/upper.
const P = {
  stand:   {tor: 0,  hd: 0,   ua: [10, -8],   fa: [8, 6],     th: [4, -4],   sh: [0, 0]},
  frozen:  {tor: -2, hd: -4,  ua: [3, -3],    fa: [0, 0],     th: [2, -2],   sh: [0, 0]},
  scared:  {tor: -8, hd: -6,  ua: [150, 140], fa: [-120, -110], th: [10, -12], sh: [-14, -10]},
  cower:   {tor: 28, hd: 18,  ua: [120, 110], fa: [-130, -120], th: [60, 20], sh: [-100, -60]},
  hide:    {tor: 38, hd: 10,  ua: [70, 60],   fa: [80, 90],   th: [95, 85],  sh: [-150, -140]},
  sit:     {tor: -4, hd: 0,   ua: [30, 20],   fa: [60, 50],   th: [90, 86],  sh: [-90, -86]},
  phone:   {tor: 2,  hd: 6,   ua: [30, 8],    fa: [140, 8],   th: [4, -4],   sh: [0, 0]},
  point:   {tor: 0,  hd: 0,   ua: [88, -6],   fa: [0, 6],     th: [6, -6],   sh: [0, 0]},
  reach:   {tor: 10, hd: 4,   ua: [70, 50],   fa: [10, 20],   th: [14, -10], sh: [-6, 0]},
  wave:    {tor: 0,  hd: 0,   ua: [160, -8],  fa: [20, 6],    th: [4, -4],   sh: [0, 0]},
  lookback:{tor: -4, hd: 0,   ua: [-14, 12],  fa: [10, 20],   th: [10, -8],  sh: [0, -6]},
  lean:    {tor: 24, hd: 18,  ua: [40, 30],   fa: [30, 30],   th: [8, -6],   sh: [0, 0]},
  hug:     {tor: 6,  hd: 6,   ua: [75, 75],   fa: [70, 70],   th: [6, -6],   sh: [0, 0]},
  slump:   {tor: 22, hd: 30,  ua: [6, 2],     fa: [4, 4],     th: [4, -4],   sh: [0, 0]},
  drive:   {tor: -8, hd: 0,   ua: [60, 55],   fa: [40, 40],   th: [80, 76],  sh: [-80, -76]},
};

const cyc = (name, t) => {
  if (name === 'walk' || name === 'sneak') {
    const k = name === 'sneak' ? 0.55 : 1, w = t * (name === 'sneak' ? 0.16 : 0.24);
    const a = Math.sin(w);
    return {tor: name === 'sneak' ? 18 : 4, hd: name === 'sneak' ? 8 : 0, bob: Math.abs(Math.cos(w)) * 6 * k,
      ua: [-a * 26 * k, a * 26 * k], fa: [14 + Math.max(0, -a) * 20, 14 + Math.max(0, a) * 20],
      th: [a * 26 * k, -a * 26 * k], sh: [-Math.max(0, -a) * 40 * k - 4, -Math.max(0, a) * 40 * k - 4]};
  }
  if (name === 'run') {
    const w = t * 0.42, a = Math.sin(w);
    return {tor: 16, hd: 6, bob: Math.abs(Math.cos(w)) * 14,
      ua: [-a * 55, a * 55], fa: [85, 85], th: [a * 46 + 10, -a * 46 + 10], sh: [-(a < 0 ? 95 : 25), -(a > 0 ? 95 : 25)]};
  }
  if (name === 'shiver') {
    const j = Math.sin(t * 2.1) * 3;
    return {...P.scared, tor: P.scared.tor + j, hd: P.scared.hd - j};
  }
  if (name === 'talk') {
    const a = Math.sin(t * 0.18);
    return {...P.stand, ua: [10 + a * 6, 40 + a * 20], fa: [8, 60 + a * 25]};
  }
  return P[name] || P.stand;
};

const mixPose = (A, B, k) => {
  const m = (a, b) => a + (b - a) * k;
  const m2 = (a, b) => [m(a[0], b[0]), m(a[1], b[1])];
  return {tor: m(A.tor, B.tor), hd: m(A.hd, B.hd), bob: m(A.bob || 0, B.bob || 0), ua: m2(A.ua, B.ua), fa: m2(A.fa, B.fa), th: m2(A.th, B.th), sh: m2(A.sh, B.sh)};
};

export const resolvePose = (pose, t) => Array.isArray(pose) ? mixPose(cyc(pose[0], t), cyc(pose[1], t), Math.max(0, Math.min(1, pose[2]))) : cyc(pose, t);

export const ThickStickMan = ({x = 540, y = 1500, s = 1, pose = 'stand', t = 0, facing = 1, look = 0, eyes = 'normal', mouth = 0, rot = 0,
  ink = '#f1ede2', head = '#f1ede2', rim = null, variant = 'man', brow = 0, smile = 0, opacity = 1, blink = true, grounded = true}) => {
  const p = resolvePose(pose, t);
  const shadow = variant === 'shadow';
  const LL = shadow ? {...L, torso: 190, thigh: 110, shin: 110, up: 96, fore: 92, head: 44} : L;
  const W = (shadow ? 30 : 26); // limb stroke
  const dir = (deg) => [Math.sin(deg * D) * facing, Math.cos(deg * D)]; // 0 = down
  const add = (P0, len, deg) => { const d = dir(deg); return [P0[0] + d[0] * len, P0[1] + d[1] * len]; };
  // build in local space with hip at (0,0)
  const H = [0, 0];
  const torDeg = 180 - p.tor; // torso points up
  const Nk = add(H, LL.torso, torDeg);
  const hc = add(Nk, LL.neck + LL.head, torDeg - p.hd);
  const S = add(H, LL.torso - 10, torDeg);
  const kneeL = add(H, LL.thigh, p.th[0]), kneeR = add(H, LL.thigh, p.th[1]);
  const footL = add(kneeL, LL.shin, p.th[0] + p.sh[0]), footR = add(kneeR, LL.shin, p.th[1] + p.sh[1]);
  const elL = add(S, LL.up, p.ua[0] - p.tor * 0.0), elR = add(S, LL.up, p.ua[1]);
  const haL = add(elL, LL.fore, p.ua[0] + p.fa[0]), haR = add(elR, LL.fore, p.ua[1] + p.fa[1]);
  const lowest = Math.max(footL[1], footR[1]) + W / 2;
  const oy = grounded ? -lowest + (p.bob ? -p.bob : 0) : 0;
  const tr = (Q) => [Q[0], Q[1] + oy];
  const seg = (a, b, w, c, key) => { const A = tr(a), B = tr(b); return <line key={key} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />; };
  const body = shadow ? '#050507' : ink;
  const far = shadow ? '#050507' : shade(ink, 0.62);
  const HC = tr(hc);
  const lk = Math.max(-1, Math.min(1, look));
  const back = Math.abs(lk) > 0.6; // over-the-shoulder: face flips
  const fdir = back ? -facing : facing;
  const ex = fdir * (back ? 14 : 12 + lk * 8 * facing), r = LL.head;
  const blinkNow = blink && !shadow && eyes !== 'closed' && (Math.floor(t) % 97 < 3);
  const eyeCol = shadow ? (rim || '#ff3b3b') : '#111014';
  const eye = (cx) => {
    if (eyes === 'none') return null;
    if (eyes === 'closed' || blinkNow) return <line x1={cx - 8} y1={HC[1] - 4} x2={cx + 8} y2={HC[1] - 4} stroke={eyeCol} strokeWidth={5} strokeLinecap="round" />;
    if (eyes === 'wide') return <g><circle cx={cx} cy={HC[1] - 6} r={11} fill="#fff" stroke="#111014" strokeWidth={4} /><circle cx={cx + fdir * 2} cy={HC[1] - 6} r={3.6} fill="#111014" /></g>;
    if (eyes === 'glow' || shadow) return <g><circle cx={cx} cy={HC[1] - 4} r={13} fill={eyeCol} opacity={0.35} /><circle cx={cx} cy={HC[1] - 4} r={6} fill={eyeCol} /></g>;
    return <ellipse cx={cx} cy={HC[1] - 4} rx={5.5} ry={9} fill={eyeCol} />;
  };
  const mx = HC[0] + fdir * 10 + ex * 0.4, my = HC[1] + 20;
  const mOpen = Math.max(0, Math.min(1, mouth));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      {/* ground shadow */}
      {grounded && !rot && <ellipse cx={0} cy={2} rx={70} ry={12} fill="rgba(0,0,0,0.45)" />}
      {/* rim glow (accent) behind body */}
      {shadow && <g opacity={0.5} style={{filter: 'blur(9px)'}}>{seg(H, Nk, W + 22, rim || '#ff3b3b', 's1')}<circle cx={HC[0]} cy={HC[1]} r={r + 14} fill={rim || '#ff3b3b'} /></g>}
      {rim && !shadow && <g opacity={0.55} style={{filter: 'blur(6px)'}}>
        {seg(H, Nk, W + 14, rim, 'r1')}{seg(H, kneeL, W + 12, rim, 'r2')}{seg(kneeL, footL, W + 12, rim, 'r3')}{seg(H, kneeR, W + 12, rim, 'r4')}{seg(kneeR, footR, W + 12, rim, 'r5')}
        {seg(S, elL, W + 10, rim, 'r6')}{seg(elL, haL, W + 10, rim, 'r7')}{seg(S, elR, W + 10, rim, 'r8')}{seg(elR, haR, W + 10, rim, 'r9')}
        <circle cx={HC[0]} cy={HC[1]} r={r + 10} fill={rim} />
      </g>}
      {/* far limbs (slightly darker) */}
      {seg(H, kneeR, W, far, 'a')}{seg(kneeR, footR, W, far, 'b')}{seg(S, elR, W - 2, far, 'c')}{seg(elR, haR, W - 2, far, 'd')}
      {/* torso */}
      {seg(H, Nk, W + 6, body, 'e')}
      {/* near limbs */}
      {seg(H, kneeL, W, body, 'f')}{seg(kneeL, footL, W, body, 'g')}{seg(S, elL, W - 2, body, 'h')}{seg(elL, haL, W - 2, body, 'i')}
      {/* head */}
      <circle cx={HC[0]} cy={HC[1]} r={r} fill={shadow ? '#050507' : head} stroke={shadow ? '#050507' : ink} strokeWidth={12} />
      {!shadow && brow > 0.2 && <>
        <line x1={HC[0] + ex - 14} y1={HC[1] - 22 - brow * 4} x2={HC[0] + ex - 2} y2={HC[1] - 26 - brow * 8} stroke="#111014" strokeWidth={4} strokeLinecap="round" />
        <line x1={HC[0] + ex + 30 * fdir - 14} y1={HC[1] - 26 - brow * 8} x2={HC[0] + ex + 30 * fdir - 2} y2={HC[1] - 22 - brow * 4} stroke="#111014" strokeWidth={4} strokeLinecap="round" />
      </>}
      {eye(HC[0] + ex - 4 * fdir)}{eye(HC[0] + ex + 22 * fdir)}
      {eyes === 'none' ? null : !shadow && smile > 0 ? <path d={`M${mx - 14} ${my - 4} Q ${mx} ${my + 4 + smile * 14} ${mx + 14} ${my - 4}`} stroke="#111014" strokeWidth={5} fill="none" strokeLinecap="round" /> : !shadow && (mOpen > 0.05
        ? <ellipse cx={mx} cy={my} rx={6 + mOpen * 5} ry={2 + mOpen * 9} fill="#111014" />
        : eyes === 'wide' ? <ellipse cx={mx} cy={my} rx={5} ry={6} fill="#111014" />
        : <line x1={mx - 8} y1={my} x2={mx + 8} y2={my} stroke="#111014" strokeWidth={4} strokeLinecap="round" />)}
    </g>
  );
};

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(v * k).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
