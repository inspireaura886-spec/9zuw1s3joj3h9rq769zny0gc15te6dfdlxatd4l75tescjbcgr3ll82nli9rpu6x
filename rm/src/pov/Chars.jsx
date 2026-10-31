// IA POV series: original flat-vector characters ("You" + Penguin #47). SVG only (fast CPU render).
import React from 'react';
export const P = {
  ink: '#15171c', cream: '#f1ede3', paper: '#faf8f2', acc: '#ff5a1f', accD: '#c93d0c',
  navy: '#1b2440', navy2: '#2a3558', slate: '#4f6d9a', slateL: '#86a3cc', skin: '#f7f3ea',
  tile: '#7fa9b0', tileD: '#5d8790', teal: '#24464f', warm: '#ffd58a', grey: '#8d8a84',
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const seg = (t, a, b) => ease((t - a) / (b - a));
export const blinkAt = (t, seed = 0) => { const p = (t + seed * 0.71) % 3.3; return p < 0.13 ? Math.sin(p / 0.13 * Math.PI) : 0; };
const rad = (d) => d * Math.PI / 180;
const limb = (x, y, a, b, l1, l2) => { // a,b degrees from straight-down; b relative bend
  const ex = x + Math.sin(rad(a)) * l1, ey = y + Math.cos(rad(a)) * l1;
  const hx = ex + Math.sin(rad(a + b)) * l2, hy = ey + Math.cos(rad(a + b)) * l2;
  return {ex, ey, hx, hy};
};

/* ------------------------------------------------ YOU: bean head, bed-hair, striped pyjamas */
export const You = ({x = 540, y = 1500, s = 1, t = 0, expr = 'neutral', armL = [15, 10], armR = [-15, -10], walk = 0, tilt = 0, look = 0, sweat = false, holding = null, flip = false, bob = true}) => {
  const br = bob ? Math.sin(t * 2.2) * 4 : 0;
  const wl = Math.sin(walk) * 22, wr = -Math.sin(walk) * 22;
  const bl = blinkAt(t, 1);
  const L = limb(-62, -345 + br, armL[0], armL[1], 92, 88);
  const R = limb(62, -345 + br, armR[0], armR[1], 92, 88);
  const lL = limb(-34, -195, wl, Math.max(0, -wl) * 0.6, 100, 95);
  const lR = limb(34, -195, wr, Math.max(0, -wr) * 0.6, 100, 95);
  const eyeY = -478 + br, ex = look * 14;
  const E = {
    neutral: {ry: 17, brow: [0, 0], mouth: 'flat'}, shock: {ry: 24, brow: [-14, 14], mouth: 'o', big: true},
    worried: {ry: 17, brow: [16, -16], mouth: 'wave'}, smug: {ry: 9, brow: [-10, 4], mouth: 'smile'},
    dead: {ry: 5, brow: [0, 0], mouth: 'flat'}, angry: {ry: 15, brow: [-18, 18], mouth: 'frown'},
    happy: {ry: 17, brow: [-6, 6], mouth: 'grin'}, think: {ry: 15, brow: [10, -4], mouth: 'side'},
  }[expr] || {};
  const ry = Math.max(2, (E.ry || 17) * (1 - bl * 0.9));
  const mouth = {
    flat: <line x1={-24} y1={-425 + br} x2={24} y2={-425 + br} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />,
    o: <ellipse cx={0} cy={-418 + br} rx={17} ry={23} fill={P.ink} />,
    wave: <path d={`M-30 ${-424 + br} q10 -10 20 0 t20 0 t20 0`} fill="none" stroke={P.ink} strokeWidth={7} strokeLinecap="round" />,
    smile: <path d={`M-28 ${-432 + br} q28 26 56 -4`} fill="none" stroke={P.ink} strokeWidth={8} strokeLinecap="round" />,
    grin: <path d={`M-32 ${-436 + br} q32 40 64 0 z`} fill={P.ink} />,
    frown: <path d={`M-26 ${-416 + br} q26 -22 52 0`} fill="none" stroke={P.ink} strokeWidth={8} strokeLinecap="round" />,
    side: <path d={`M-6 ${-426 + br} q18 -4 32 -12`} fill="none" stroke={P.ink} strokeWidth={8} strokeLinecap="round" />,
  }[E.mouth || 'flat'];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={6} rx={110} ry={16} fill="rgba(0,0,0,0.25)" />
      {[lL, lR].map((l, i) => <g key={i}>
        <polyline points={`${i ? 34 : -34},-195 ${l.ex},${l.ey} ${l.hx},${l.hy}`} fill="none" stroke={P.ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx={l.hx + (i ? 12 : -12)} cy={l.hy + 4} rx={34} ry={15} fill={P.slateL} stroke={P.ink} strokeWidth={6} />
      </g>)}
      {/* torso: pyjama top */}
      <g transform={`rotate(${tilt * 0.4} 0 -270)`}>
        <path d={`M-70 ${-365 + br} Q0 ${-385 + br} 70 ${-365 + br} L84 -190 Q0 -176 -84 -190 Z`} fill={P.slate} stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
        {[-48, -16, 16, 48].map((sx) => <line key={sx} x1={sx} y1={-366 + br} x2={sx * 1.15} y2={-188} stroke={P.slateL} strokeWidth={7} opacity={0.75} />)}
        <path d={`M-22 ${-376 + br} L0 ${-340 + br} L22 ${-376 + br}`} fill="none" stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
        {[L, R].map((a, i) => <g key={i}>
          <polyline points={`${i ? 62 : -62},${-345 + br} ${a.ex},${a.ey} ${a.hx},${a.hy}`} fill="none" stroke={P.ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={a.hx} cy={a.hy} r={17} fill={P.skin} stroke={P.ink} strokeWidth={6} />
        </g>)}
        {holding && <g transform={`translate(${R.hx} ${R.hy})`}>{holding}</g>}
        {/* head */}
        <g transform={`rotate(${tilt} 0 ${-390 + br})`}>
          <path d={`M-50 ${-560 + br} l-14 -40 l34 26 l10 -44 l22 42 l26 -36 l2 44 l34 -18 l-20 36`} fill={P.ink} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={-470 + br} r={96} fill={P.skin} stroke={P.ink} strokeWidth={9} />
          <ellipse cx={-34 + ex} cy={eyeY} rx={E.big ? 15 : 12} ry={ry} fill={P.ink} />
          <ellipse cx={34 + ex} cy={eyeY} rx={E.big ? 15 : 12} ry={ry} fill={P.ink} />
          <line x1={-54 + ex} y1={-512 + br + (E.brow?.[0] || 0) * 0.4} x2={-16 + ex} y2={-512 + br - (E.brow?.[0] || 0) * 0.4} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />
          <line x1={16 + ex} y1={-512 + br - (E.brow?.[1] || 0) * 0.4} x2={54 + ex} y2={-512 + br + (E.brow?.[1] || 0) * 0.4} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />
          <g transform={`translate(${ex * 0.6} 0)`}>{mouth}</g>
          {sweat && <path d={`M78 ${-520 + br + (t * 60) % 40} q-12 22 0 30 q12 -8 0 -30`} fill="#8fd3ff" stroke={P.ink} strokeWidth={4} />}
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------------------ PENGUIN #47 (African penguin cues: chest band, eye stripe) */
export const Peng = ({x = 540, y = 1500, s = 1, t = 0, expr = 'angry', flap = 0, beak = 0, tilt = 0, look = 0, band = true, flip = false, bob = true, squash = 0}) => {
  const b = bob ? Math.sin(t * 3.1) * 5 : 0;
  const bl = blinkAt(t, 3);
  const fl = flap;
  const ex = look * 10;
  const sq = 1 + squash;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -s : s) / Math.sqrt(sq)} ${s * sq}) rotate(${tilt} 0 -150)`}>
      <ellipse cx={0} cy={4} rx={95} ry={14} fill="rgba(0,0,0,0.25)" />
      <ellipse cx={-38} cy={-4} rx={34} ry={13} fill={P.acc} stroke={P.ink} strokeWidth={6} />
      <ellipse cx={38} cy={-4} rx={34} ry={13} fill={P.acc} stroke={P.ink} strokeWidth={6} />
      {/* flippers */}
      <g transform={`rotate(${18 + fl * 55} -88 ${-235 + b})`}><ellipse cx={-100} cy={-160 + b} rx={26} ry={86} fill="#22252d" stroke={P.ink} strokeWidth={7} /></g>
      <g transform={`rotate(${-18 - fl * 55} 88 ${-235 + b})`}>
        <ellipse cx={100} cy={-160 + b} rx={26} ry={86} fill="#22252d" stroke={P.ink} strokeWidth={7} />
        {band && <g><rect x={78} y={-200 + b} width={46} height={26} rx={6} fill={P.acc} stroke={P.ink} strokeWidth={5} />
          <text x={101} y={-180 + b} fontFamily="Lilita One" fontSize={20} textAnchor="middle" fill={P.ink}>47</text></g>}
      </g>
      <ellipse cx={0} cy={-165 + b} rx={106} ry={168} fill="#1d2027" stroke={P.ink} strokeWidth={9} />
      <ellipse cx={0} cy={-128 + b} rx={74} ry={124} fill={P.paper} />
      <path d={`M-70 ${-170 + b} Q0 ${-140 + b} 70 ${-170 + b}`} fill="none" stroke="#1d2027" strokeWidth={14} />
      {/* eye stripes */}
      <path d={`M-30 ${-300 + b} q-46 10 -58 70`} fill="none" stroke={P.paper} strokeWidth={10} strokeLinecap="round" />
      <path d={`M30 ${-300 + b} q46 10 58 70`} fill="none" stroke={P.paper} strokeWidth={10} strokeLinecap="round" />
      {[-34, 34].map((cx) => <g key={cx}>
        <ellipse cx={cx} cy={-262 + b} rx={19} ry={Math.max(2, 20 * (1 - bl * 0.9))} fill={P.paper} stroke={P.ink} strokeWidth={4} />
        <circle cx={cx + ex} cy={-260 + b} r={Math.max(1, 9 * (1 - bl))} fill={P.ink} />
      </g>)}
      {expr === 'angry' && <g><line x1={-58} y1={-298 + b} x2={-16} y2={-282 + b} stroke={P.paper} strokeWidth={9} strokeLinecap="round" /><line x1={58} y1={-298 + b} x2={16} y2={-282 + b} stroke={P.paper} strokeWidth={9} strokeLinecap="round" /></g>}
      {expr === 'smug' && <g><line x1={-56} y1={-286 + b} x2={-14} y2={-286 + b} stroke={P.paper} strokeWidth={9} strokeLinecap="round" /><line x1={56} y1={-296 + b} x2={14} y2={-286 + b} stroke={P.paper} strokeWidth={9} strokeLinecap="round" /></g>}
      {/* beak */}
      <path d={`M-24 ${-236 + b} L24 ${-236 + b} L${ex} ${-200 + b - beak * 6} Z`} fill={P.acc} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
      {beak > 0.05 && <path d={`M-20 ${-230 + b + beak * 10} L20 ${-230 + b + beak * 10} L${ex} ${-196 + b + beak * 34} Z`} fill={P.accD} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />}
    </g>
  );
};

/* sound waves fanning from a point */
export const Waves = ({x, y, t, dir = -90, n = 3, color = P.acc, big = 1}) => (
  <g>{[...Array(n)].map((_, i) => {
    const p = ((t * 2.2 + i / n) % 1); const r = (60 + p * 220) * big;
    const a0 = rad(dir - 35), a1 = rad(dir + 35);
    return <path key={i} d={`M${x + Math.cos(a0) * r} ${y + Math.sin(a0) * r} A${r} ${r} 0 0 1 ${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r}`} fill="none" stroke={color} strokeWidth={14 * big} strokeLinecap="round" opacity={1 - p} />;
  })}</g>
);
