// IA POV series, Episode 1 v2 (copy of Pov.jsx, new hangover/flashback opening, timeline lock 9AM-8:57PM): "You just woke up with a penguin in your bathtub". Own composition (shared kits untouched).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, staticFile} from 'remotion';
import VO from './vo_v2.json';
import {P, ease, seg, You, Peng, Waves, Gf} from './Chars2.jsx';

export const FPS = 30;
export const END_HOLD = 3.2;
export const POV_FRAMES = Math.round((VO.dur + END_HOLD) * FPS);
const S = VO.segs, Wd = VO.words;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const wt = (si, tok, k = 0) => { // start time of k-th word in segment si starting with tok
  let c = 0;
  for (const w of Wd) if (w[3] === si && norm(w[0]).startsWith(tok)) { if (c === k) return w[1]; c++; }
  return S[si].start;
};
const st = (i) => S[i].start;
const pop = (t, a, d = 0.3) => { if (t < a) return 0; const x = clamp((t - a) / d) - 1; return x * x * (2.7 * x + 1.7) + 1; };

const Fonts = () => <style>{`
@font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
@font-face{font-family:'Fredoka';src:url('${staticFile('fonts/Fredoka-Variable.ttf')}') format('truetype');font-weight:300 700;}`}</style>;

/* ------------------------------------------------------------------ backgrounds */
const Tiles = ({fill = P.tile, line = P.tileD, y0 = 0, y1 = 1500, size = 120}) => (
  <g><rect x={0} y={y0} width={1080} height={y1 - y0} fill={fill} />
    {[...Array(Math.ceil(1080 / size) + 1)].map((_, i) => <line key={'v' + i} x1={i * size} y1={y0} x2={i * size} y2={y1} stroke={line} strokeWidth={5} />)}
    {[...Array(Math.ceil((y1 - y0) / size) + 1)].map((_, i) => <line key={'h' + i} x1={0} y1={y0 + i * size} x2={1080} y2={y0 + i * size} stroke={line} strokeWidth={5} />)}
  </g>);
const Night = ({k = 0.55}) => <rect x={0} y={0} width={1080} height={1920} fill="#0b1430" opacity={k} />;
const Vig = () => <><defs><radialGradient id="vg" cx="50%" cy="48%" r="75%"><stop offset="55%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.55" /></radialGradient></defs><rect width={1080} height={1920} fill="url(#vg)" /></>;
const Tub = ({x = 600, y = 1500, w = 520, water = true, keys = false, t = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    {[-w / 2 + 60, w / 2 - 60].map((fx) => <path key={fx} d={`M${fx - 22} 0 l10 46 h24 l10 -46z`} fill={P.paper} stroke={P.ink} strokeWidth={7} />)}
    <path d={`M${-w / 2} -230 h${w} v40 q0 190 -110 190 h${-w + 220} q-110 0 -110 -190z`} fill={P.paper} stroke={P.ink} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-w / 2 - 14} y={-252} width={w + 28} height={32} rx={16} fill={P.paper} stroke={P.ink} strokeWidth={9} />
    {water && <path d={`M${-w / 2 + 16} -214 q60 ${-10 + Math.sin(t * 3) * 6} 120 0 t120 0 t120 0 t120 0`} fill="none" stroke="#9fd6e8" strokeWidth={10} strokeLinecap="round" />}
    {keys && <g transform={`translate(110 -262) rotate(-20)`}><circle cx={0} cy={0} r={20} fill="none" stroke={P.ink} strokeWidth={8} /><rect x={16} y={-7} width={70} height={14} rx={5} fill="#c9ccd2" stroke={P.ink} strokeWidth={5} /><rect x={60} y={6} width={10} height={14} fill="#c9ccd2" stroke={P.ink} strokeWidth={4} />
      <path d="M40 -40 l6 -22 l6 22 l22 6 l-22 6 l-6 22 l-6 -22 l-22 -6z" fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 9)} /></g>}
  </g>);
const Bathroom = ({night = 0, t}) => (<g>
  <Tiles fill="#9cc3c4" line="#79a3a6" y0={0} y1={1520} size={130} />
  <rect x={0} y={1520} width={1080} height={400} fill="#5b7f86" />
  <rect x={0} y={1510} width={1080} height={22} fill={P.ink} opacity={0.5} />
  <rect x={70} y={330} width={240} height={330} rx={26} fill="#d8eef0" stroke={P.ink} strokeWidth={10} />
  <path d="M110 380 l60 -30 M120 440 l120 -60" stroke="#fff" strokeWidth={10} opacity={0.7} />
  <rect x={860} y={620} width={140} height={300} rx={16} fill={P.acc} opacity={0.0} />
  <rect x={880} y={560} width={26} height={360} fill="#c9ccd2" stroke={P.ink} strokeWidth={6} />
  <path d="M906 600 h80 q20 0 20 20 v220 q0 20 -20 20 h-80z" fill="#e9e1d0" stroke={P.ink} strokeWidth={7} />
  {night > 0 && <Night k={0.62 * night} />}
</g>);
const Wallpaper = ({c1 = '#2b3354', c2 = '#323c62'}) => <g><rect width={1080} height={1920} fill={c1} />{[...Array(10)].map((_, i) => <rect key={i} x={i * 120} y={0} width={60} height={1920} fill={c2} />)}</g>;

/* ------------------------------------------------------------------ UI */
const Title = ({t, a, b, lines, kicker, y = 380, accent = 0}) => {
  if (t < a || t > b) return null; const s = a === 0 ? 1 : pop(t, a, 0.32); const o = 1 - seg(t, b - 0.18, b);
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o, transform: `scale(${s}) rotate(-2deg)`}}>
    {kicker && <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 34, letterSpacing: 6, color: P.paper, background: P.ink, padding: '6px 18px', borderRadius: 10, marginBottom: 14}}>{kicker}</div>}
    <div style={{background: P.paper, border: `10px solid ${P.ink}`, borderRadius: 26, padding: '14px 36px 18px', boxShadow: `0 14px 0 ${P.ink}`, textAlign: 'center'}}>
      {lines.map((l, i) => <div key={i} style={{fontFamily: 'Lilita One', fontSize: 88, lineHeight: 1.0, color: i === accent ? P.acc : P.ink, letterSpacing: 1}}>{l}</div>)}
    </div></div>;
};
const Chip = ({label, value, warn, w = 300}) => (
  <div style={{width: w, background: 'rgba(21,23,28,0.88)', border: `4px solid ${warn ? P.acc : 'rgba(255,255,255,0.18)'}`, borderRadius: 18, padding: '8px 16px 10px'}}>
    <div style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: warn ? P.acc : '#aab0bd'}}>{label}</div>
    <div style={{fontFamily: 'Lilita One', fontSize: 50, color: warn ? P.acc : P.paper, lineHeight: 1.05}}>{value}</div>
  </div>);
const stepK = (T, keys) => { let v = keys[0][1]; for (const [kt, kv] of keys) if (T >= kt) v = kv; return v; };
const keyed = (T, keys) => { // piecewise-linear over [[t,v],...] with 0.6 s ramps
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) { const [kt, kv] = keys[i]; if (T >= kt) v = keys[i - 1][1] + (kv - keys[i - 1][1]) * clamp((T - kt) / 0.6); }
  return v;
};
const HUD = ({T, off}) => {
  if (off || T < st(10) + 0.3 || T >= st(27)) return null;
  const a = seg(T, st(10) + 0.3, st(10) + 0.7);
  const mins = stepK(T, [[0, 720], [st(10) + 1.2, 719], [st(13), 480], [st(15), 360], [st(21), 240], [st(25), 3]]);
  const hh = Math.floor(mins / 60), mm = Math.floor(mins % 60);
  const fish = Math.round(keyed(T, [[0, 0], [wt(13, 'every'), 0], [wt(13, 'sardines'), 36], [st(17), 30], [st(21), 19], [st(24), 2]]));
  const sus = Math.round(keyed(T, [[0, 0], [wt(16, 'bangs'), 0], [wt(16, 'why'), 40], [wt(17, 'alibi'), 20], [wt(18, 'louder'), 65], [wt(23, 'police'), 90]]));
  return <div style={{position: 'absolute', top: 228, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, opacity: a, transform: `translateY(${(1 - a) * -40}px)`}}>
    <Chip label="TIME LEFT" value={`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`} warn={mins < 60} w={250} />
    <Chip label="FISH" value={`${fish} tins`} w={230} />
    <Chip label="SUSPICION" value={`${sus}%`} warn={sus >= 40} w={250} />
  </div>;
};
const chunks = (() => { const out = []; let cur = [];
  const fl = () => { if (cur.length) out.push(cur); cur = []; };
  Wd.forEach((w) => { if (cur.length && cur[0][3] !== w[3]) fl(); cur.push(w);
    if (/[.,!?:;]$/.test(w[0]) || cur.length >= 3 || cur.reduce((a, x) => a + x[0].length, 0) > 12) fl(); });
  fl(); return out; })();
const Captions = ({T, hide}) => {
  if (hide) return null;
  let ci = -1; for (let i = 0; i < chunks.length; i++) { if (T >= chunks[i][0][1] - 0.04) ci = i; else break; }
  if (ci < 0) return null; const c = chunks[ci]; if (T > c[c.length - 1][2] + 0.5) return null;
  const s = pop(T, c[0][1] - 0.04, 0.18);
  return <div style={{position: 'absolute', left: 60, right: 60, top: 1345, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20, transform: `scale(${0.85 + 0.15 * s})`}}>
    {c.map((w, i) => { const on = T >= w[1] - 0.03; const cur = on && (i === c.length - 1 || T < c[i + 1][1] - 0.03);
      return <span key={i} style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 84, color: cur ? P.acc : P.paper, opacity: on ? 1 : 0.55, WebkitTextStroke: `14px ${P.ink}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${P.ink}`, textTransform: 'uppercase'}}>{w[0].replace(/[.,!?:;]$/, '')}</span>; })}
  </div>;
};
const Btn = ({label, on, accent, t0, T, x}) => { const s = pop(T, t0, 0.3); return (
  <div style={{position: 'absolute', top: 1060, left: x, width: 380, transform: `scale(${s})`, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 96, color: accent ? P.paper : P.ink, background: accent ? P.acc : P.paper, border: `10px solid ${P.ink}`, borderRadius: 30, boxShadow: `0 ${on ? 6 : 16}px 0 ${P.ink}`, padding: '10px 0'}}>{label}</div>); };
const Tag = ({text, x, y, t, a, rot = -4, acc}) => { const s = pop(t, a, 0.28); if (!s) return null; return (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`, fontFamily: 'Lilita One', fontSize: 58, color: acc ? P.paper : P.ink, background: acc ? P.acc : P.paper, border: `8px solid ${P.ink}`, borderRadius: 16, padding: '4px 22px', whiteSpace: 'nowrap', boxShadow: `0 8px 0 ${P.ink}`}}>{text}</div>); };
const Stamp = ({text, t, a, y = 1000, size = 120}) => { if (t < a) return null; const p = clamp((t - a) / 0.22); const s = 2.2 - 1.2 * ease(p);
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: p, transform: `scale(${s}) rotate(-8deg)`}}>
    <span style={{fontFamily: 'Lilita One', fontSize: size, color: P.acc, border: `12px solid ${P.acc}`, borderRadius: 22, padding: '0 34px', letterSpacing: 4}}>{text}</span></div>; };
const Clock = ({x, y, label, t, a = 0}) => { const s = pop(t, a, 0.3); return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, fontFamily: 'Lilita One', fontSize: 88, color: '#ff3d2e', background: '#120f10', border: `8px solid ${P.ink}`, borderRadius: 18, padding: '2px 26px', textShadow: '0 0 18px rgba(255,61,46,0.8)'}}>{label}</div>; };
const Kicker = ({text, y = 330, dark}) => <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 38, letterSpacing: 8, color: dark ? '#9aa1ad' : '#7d776c'}}>{text}</div>;
const Big = ({lines, y, t, a, dark, size = 130, accent = -1}) => <div style={{position: 'absolute', top: y, left: 40, right: 40, textAlign: 'center'}}>
  {lines.map((l, i) => { const s = pop(t, a + i * 0.25, 0.3); return <div key={i} style={{fontFamily: 'Lilita One', fontSize: size, lineHeight: 1.02, color: i === accent ? P.acc : (dark ? P.paper : P.ink), transform: `scale(${s})`}}>{l}</div>; })}</div>;

/* camera wrapper: slow push + optional shake, origin (ox,oy) */
const Cam = ({t, d, z0 = 1, z1 = 1.08, ox = 540, oy = 960, shake = 0, children}) => {
  const z = z0 + (z1 - z0) * ease(clamp(t / Math.max(d, 0.1)));
  const sx = shake ? Math.sin(t * 61) * shake : 0, sy = shake ? Math.cos(t * 53) * shake : 0;
  return <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(${ox + sx} ${oy + sy}) scale(${z}) translate(${-ox} ${-oy})`}>{children}</g></svg>;
};

/* ------------------------------------------------------------------ shots: [from, to, render(t local, T global, d)] */
const SH = [];
const add = (a, b, f, card = false) => SH.push({a, b, f, card});
/* ---------------- v2 helpers: memory look, static, silhouette, curtain, heart */
const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Mem = ({T, t, children, label = 'LAST NIGHT'}) => { const fi = Math.floor(T * 15); const jx = (rnd(fi) - 0.5) * 18; const blur = 2.0 + 1.6 * Math.abs(Math.sin(t * 6));
  const g = rnd(fi * 3.1) > 0.72; const gy = 300 + rnd(fi * 7.7) * 1200;
  return <AbsoluteFill>
    <AbsoluteFill style={{filter: `blur(${blur}px) saturate(0.55) sepia(0.3) contrast(1.05)`, transform: `translateX(${jx}px)`}}>{children}</AbsoluteFill>
    <AbsoluteFill style={{filter: `blur(${blur + 2}px)`, transform: `translateX(${jx + 22}px)`, opacity: 0.28, mixBlendMode: 'screen'}}><AbsoluteFill style={{background: '#ff2a6d', mixBlendMode: 'multiply'}} />{children}</AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs><radialGradient id="mv" cx="50%" cy="50%" r="72%"><stop offset="58%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#f4ecff" stopOpacity="0.8" /></radialGradient></defs>
      {[...Array(48)].map((_, i) => <rect key={i} x={0} y={i * 40 + (t * 120) % 40} width={1080} height={4} fill="#000" opacity={0.12} />)}
      {g && <><rect x={0} y={gy} width={1080} height={26 + rnd(fi) * 40} fill="#7af7ff" opacity={0.35} /><rect x={0} y={gy + 60} width={1080} height={10} fill="#ff2a6d" opacity={0.45} /></>}
      <rect width={1080} height={1920} fill="url(#mv)" /></svg>
    <div style={{position: 'absolute', top: 236, left: 0, right: 0, textAlign: 'center', opacity: 0.75 + 0.25 * Math.sin(t * 9)}}>
      <span style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 40, letterSpacing: 8, color: P.paper, background: 'rgba(21,23,28,0.75)', padding: '6px 22px', borderRadius: 10}}>◀◀ {label}</span></div>
  </AbsoluteFill>; };
const Static = ({T, k}) => { if (k <= 0) return null; const fi = Math.floor(T * 30);
  return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: k}}><rect width={1080} height={1920} fill="#6d6f75" />
    {[...Array(260)].map((_, i) => { const r = rnd(fi * 1000 + i); return <rect key={i} x={rnd(fi * 77 + i * 3) * 1080} y={r * 1920} width={30 + rnd(i + fi) * 160} height={6 + rnd(i * 5 + fi) * 14} fill={r > 0.5 ? '#e8e8e8' : '#26282d'} />; })}</svg>; };
const SilDefs = () => <defs><filter id="blk"><feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.09  0 0 0 0 0.11  0 0 0 1 0" /></filter></defs>;
const Curtain = ({x0 = 420, x1 = 1010, y0 = 880, y1 = 1470, t = 0, op = 0.8}) => <g>
  <rect x={x0 - 20} y={y0 - 24} width={x1 - x0 + 40} height={16} rx={8} fill="#c9ccd2" stroke={P.ink} strokeWidth={6} />
  <path d={`M${x0} ${y0} ${[...Array(9)].map((_, i) => `q${(x1 - x0) / 18} ${18 + Math.sin(t * 2 + i) * 4} ${(x1 - x0) / 9} 0`).join(' ')} V${y1} H${x0} Z`} fill="#f2c6d6" opacity={op} stroke={P.ink} strokeWidth={6} />
  {[...Array(8)].map((_, i) => <line key={i} x1={x0 + (i + 1) * (x1 - x0) / 9} y1={y0 + 14} x2={x0 + (i + 1) * (x1 - x0) / 9 + Math.sin(t + i) * 6} y2={y1} stroke="#d99ab2" strokeWidth={6} opacity={0.8} />)}</g>;
const Heart = ({x, y, s = 1, fill = P.acc, broken = false}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M0 18 C-30 -4 -34 -26 -18 -34 C-8 -38 0 -30 0 -22 C0 -30 8 -38 18 -34 C34 -26 30 -4 0 18 Z" fill={fill} stroke={P.ink} strokeWidth={4} />
  {broken && <path d="M0 -22 l-6 10 l8 8 l-6 10" fill="none" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />}</g>;
const LivingRoom = ({t}) => <g>
  <Wallpaper c1="#e8d9b8" c2="#e2d0aa" />
  <rect x={650} y={600} width={360} height={430} rx={12} fill="#9fd8ff" stroke={P.ink} strokeWidth={12} />
  <circle cx={900} cy={720} r={52} fill="#ffe14a" stroke={P.ink} strokeWidth={6} />
  <g opacity={0.95}><ellipse cx={760 + Math.sin(t) * 8} cy={860} rx={70} ry={26} fill="#fff" /><ellipse cx={800 + Math.sin(t) * 8} cy={840} rx={44} ry={28} fill="#fff" /></g>
  <line x1={830} y1={600} x2={830} y2={1030} stroke={P.ink} strokeWidth={10} /><line x1={650} y1={815} x2={1010} y2={815} stroke={P.ink} strokeWidth={10} />
  <polygon points="650,1030 1010,1030 620,1300 160,1300" fill="rgba(255,240,170,0.28)" />
  <rect x={0} y={1560} width={1080} height={360} fill="#8a6a4a" /><rect x={0} y={1552} width={1080} height={14} fill={P.ink} opacity={0.4} />
  {/* sofa */}
  <rect x={290} y={860} width={780} height={260} rx={60} fill="#6b5b95" stroke={P.ink} strokeWidth={10} />
  <rect x={300} y={1090} width={770} height={190} rx={40} fill="#7d6aa8" stroke={P.ink} strokeWidth={10} />
  <rect x={300} y={1280} width={24} height={60} fill={P.ink} /><rect x={1030} y={1280} width={24} height={60} fill={P.ink} />
  {/* side table + alarm clock */}
  <rect x={80} y={1060} width={260} height={26} rx={8} fill="#a7764a" stroke={P.ink} strokeWidth={7} /><rect x={110} y={1086} width={20} height={470} fill="#a7764a" stroke={P.ink} strokeWidth={6} /><rect x={290} y={1086} width={20} height={470} fill="#a7764a" stroke={P.ink} strokeWidth={6} />
  <g transform={`translate(215 990) rotate(${Math.sin(t * 40) * 3})`}><rect x={-125} y={-62} width={250} height={124} rx={22} fill="#120f10" stroke={P.ink} strokeWidth={8} />
    <text x={0} y={24} textAnchor="middle" fontFamily="Lilita One" fontSize={70} fill="#ff3d2e" opacity={Math.sin(t * 8) > -0.6 ? 1 : 0.35}>9:00 AM</text>
    {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 140} -40 l${sd * 30} -20 M${sd * 145} 0 l${sd * 34} 0`} stroke={P.acc} strokeWidth={8} strokeLinecap="round" />)}</g>
  {/* party mess */}
  <g transform="translate(250 1700) rotate(80)"><rect x={-24} y={-90} width={48} height={130} rx={14} fill="#3f8f5a" stroke={P.ink} strokeWidth={6} /><rect x={-12} y={-130} width={24} height={44} fill="#3f8f5a" stroke={P.ink} strokeWidth={6} /></g>
  <g transform="translate(600 1760) rotate(-70)"><rect x={-24} y={-90} width={48} height={130} rx={14} fill="#8a5a2b" stroke={P.ink} strokeWidth={6} /><rect x={-12} y={-130} width={24} height={44} fill="#8a5a2b" stroke={P.ink} strokeWidth={6} /></g>
  <path d="M820 1640 l60 120 l-120 0 z" fill={P.acc} stroke={P.ink} strokeWidth={6} />
  {[...Array(18)].map((_, i) => <rect key={i} x={60 + rnd(i) * 960} y={1590 + rnd(i * 3) * 300} width={18} height={10} fill={[P.acc, '#8fd3ff', '#ffe14a', '#90be6d'][i % 4]} transform={`rotate(${rnd(i * 7) * 180} ${60 + rnd(i) * 960} ${1590 + rnd(i * 3) * 300})`} />)}
</g>;
const PartyBg = ({t, dim = 0}) => <g>
  <rect width={1080} height={1920} fill="#141a3a" /><circle cx={860} cy={420} r={60} fill="#f5f0d0" opacity={0.8} />
  {[0, 1].map((r) => <g key={r}><path d={`M-20 ${500 + r * 170} Q540 ${640 + r * 170} 1100 ${500 + r * 170}`} fill="none" stroke="#333a5c" strokeWidth={5} />
    {[...Array(12)].map((_, i) => { const u = i / 11, x = -20 + u * 1120, y = 500 + r * 170 + 2 * (1 - u) * u * 140; return <circle key={i} cx={x} cy={y + 14} r={13} fill={['#ffd58a', P.acc, '#8fd3ff', '#ff7ab6'][(i + r) % 4]} opacity={(0.55 + 0.45 * Math.sin(t * 6 + i * 1.7 + r)) * (1 - dim * 0.7)} />; })}</g>)}
  <g transform="rotate(-3 540 820)"><rect x={150} y={740} width={780} height={170} rx={20} fill={P.paper} stroke={P.ink} strokeWidth={10} />
    <text x={540} y={815} textAnchor="middle" fontFamily="Lilita One" fontSize={70} fill={P.ink}>CITY ZOO</text>
    <text x={540} y={885} textAnchor="middle" fontFamily="Lilita One" fontSize={54} fill={P.acc}>LATE-NIGHT PARTY</text></g>
  {[0, 1].map((i) => <polygon key={i} points={`${200 + i * 680},0 ${80 + i * 680},1600 ${380 + i * 680},1600`} fill={i ? '#ff7ab6' : '#8fd3ff'} opacity={(0.12 + 0.08 * Math.sin(t * 4 + i)) * (1 - dim)} />)}
  <rect x={560} y={1170} width={500} height={190} fill="#c7d3d8" stroke={P.ink} strokeWidth={8} /><rect x={560} y={1170} width={500} height={34} fill="#7fb7c9" />
  {[0, 1, 2].map((i) => <Peng key={i} x={650 + i * 150} y={1175} s={0.4} t={t + i} expr="smug" band={i === 1} bob />)}
  <rect x={0} y={1500} width={1080} height={420} fill="#0c1028" />
  {[...Array(9)].map((_, i) => <g key={i}><circle cx={40 + i * 130} cy={1600 + (i % 2) * 30 + Math.sin(t * 5 + i) * 10} r={52} fill="#0a0d20" /><rect x={-10 + i * 130} y={1640 + (i % 2) * 30} width={100} height={300} rx={40} fill="#0a0d20" /></g>)}
</g>;

/* ------------------------------------------------------------------ v2 opening */
// 1 hook: 9 AM hangover on the sofa (headline box in frame 0)
add(0, st(1) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.0} z1={1.1} ox={420} oy={1100}><LivingRoom t={t} />
  <g transform="translate(990 1150) rotate(-90)"><You x={0} y={0} s={1.05} t={t} expr="hang" hat stars={0.8} armR={[-40, -60]} armL={[30, 20]} bob={false} /></g>
  <Vig /></Cam>
  <Title t={T} a={0} b={st(1) - 0.05} lines={['PENGUIN', 'IN YOUR BATHTUB']} kicker="EPISODE 1" y={300} /></>);
// 2 flashback: zoo late-night party (memory look)
add(st(1) - 0.05, st(2) - 0.05, (t, T, d) => <Mem T={T} t={t}><Cam t={t} d={d} z0={1.05} z1={1.15} ox={400} oy={1200}><PartyBg t={t} />
  <You x={310} y={1690} s={1.15} t={t} expr="happy" hat armL={[150 + 15 * Math.sin(t * 9), -20]} armR={[-150 - 15 * Math.sin(t * 9 + 1), 20]} tilt={8 * Math.sin(t * 5)}
    holding={<g><path d="M-26 -10 l8 70 h36 l8 -70z" fill="#e0342b" stroke={P.ink} strokeWidth={5} /></g>} /></Cam></Mem>);
// 3 flashback: girlfriend "It's over." -> static
add(st(2) - 0.05, st(3) - 0.05, (t, T, d) => { const over = T > wt(2, 'its') - 0.08; const nk = clamp((T - (wt(2, 'then') - 0.05)) / 0.6) * 0.9;
  return <><Mem T={T} t={t}><Cam t={t} d={d} z0={1.0} z1={1.12} ox={540} oy={1150}><PartyBg t={t} dim={0.8} />
    <You x={290} y={1700} s={1.15} t={t} expr={over ? 'shock' : 'happy'} hat look={1} />
    <Gf x={790} y={1700} s={1.15} t={t} expr="cold" look={-1} armL={[60, -110]} armR={[-60, 110]} /></Cam>
    {over && <div style={{position: 'absolute', left: 520, top: 420, width: 470, transform: `scale(${pop(T, wt(2, 'its') - 0.08)})`, background: P.paper, border: `9px solid ${P.ink}`, borderRadius: 30, padding: '18px 22px', fontFamily: 'Lilita One', fontSize: 92, lineHeight: 1.0, color: P.acc, textAlign: 'center', boxShadow: `0 10px 0 ${P.ink}`}}>IT'S OVER.</div>}
  </Mem><Static T={T} k={nk} /></>; });
// 4 bathroom: silhouette in the tub
const TubScene = ({t, T, sil = true, youX = 300, expr = 'hang', walk = 0, tilt = 0, extra = null, curtain = true}) => <><SilDefs /><Bathroom t={t} />
  <g filter={sil ? 'url(#blk)' : undefined}><Peng x={730} y={1560} s={1.2} t={t} expr="angry" look={-1} /></g>
  {curtain && <Curtain t={t} op={0.78} />}<Tub x={730} y={1720} w={560} t={t} />
  <You x={youX} y={1800} s={1.4} t={t} expr={expr} hat stars={expr === 'hang' ? 0.8 : 0} walk={walk} tilt={tilt} look={1} />{extra}<Vig /></>;
add(st(3) - 0.05, st(4) - 0.05, (t, T, d) => { const q = T > wt(3, 'someones') - 0.1;
  return <><Cam t={t} d={d} z0={1.0} z1={1.08} ox={600} oy={1200}><TubScene t={t} T={T} youX={120 + 160 * ease(clamp(t / 1.8))} walk={t * 7} tilt={8 * Math.sin(t * 3)} /></Cam>
    {q && <Tag text="?" x={730} y={820} t={T} a={wt(3, 'someones') - 0.1} acc />}</>; });
// 5 hungover brain: she came back (thought bubble)
add(st(4) - 0.05, st(5) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.08} z1={1.18} ox={400} oy={1150}><TubScene t={t} T={T} youX={280} expr="happy" /></Cam>
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {[[400, 930, 22], [450, 860, 34]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * pop(T, wt(4, 'thinks') - 0.2 + i * 0.08, 0.2)} fill={P.paper} stroke={P.ink} strokeWidth={7} />)}
    <g transform={`translate(500 560) scale(${pop(T, wt(4, 'thinks'), 0.3)})`}><ellipse cx={0} cy={0} rx={270} ry={190} fill={P.paper} stroke={P.ink} strokeWidth={9} />
      <g transform="translate(0 210)"><Gf x={0} y={0} s={0.55} t={t} expr="smile" /></g>
      {[[-190, -60], [190, -40], [-150, 90], [170, 100]].map(([x, y], i) => <Heart key={i} x={x} y={y + Math.sin(t * 4 + i) * 10} s={1.3} />)}</g></svg></>);
// 6 lean in for a kiss (eyes closed) -- holds through the 0.4 s beat
add(st(5) - 0.05, st(6) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.0} z1={1.08} ox={600} oy={1100}><SilDefs />
  <g transform="translate(560 1100) scale(1.7) translate(-560 -1100)"><Bathroom t={t} /></g>
  <g filter="url(#blk)"><Peng x={840} y={1660} s={2.0} t={t} expr="angry" look={-1} bob={false} /></g>
  <Curtain x0={640} x1={1100} y0={500} y1={1920} t={t} op={0.8} />
  <You x={290 + 50 * ease(clamp(t / 1.4))} y={2080} s={2.0} t={t} expr="kiss" tilt={16} bob={false} />
  {[0, 1, 2, 3].map((i) => { const p = ((t * 0.7 + i / 4) % 1); return <Heart key={i} x={500 + i * 30} y={1000 - p * 500} s={1.2 + p} />; })}
  <rect width={1080} height={1920} fill="#ff6fa8" opacity={0.14} /><Vig /></Cam></>);
// 7 reveal: it's a penguin
add(st(6) - 0.05, st(7) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.12} z1={1.18} ox={600} oy={1100} shake={t < 0.3 ? 6 : 0}>
  <g transform="translate(560 1100) scale(1.7) translate(-560 -1100)"><Bathroom t={t} /></g>
  <Peng x={840} y={1660} s={2.0} t={t} expr="angry" look={-1} beak={0.5 + 0.4 * Math.sin(t * 16)} bob={false} />
  <You x={320} y={2080} s={2.0} t={t} expr="shock" tilt={-10} bob={false} /><Vig /></Cam>
  <Tag text="!!" x={300} y={760} t={T} a={st(6)} acc rot={-8} /></>);
// 8 the slapstick flipper hit: wind-up -> impact frame (DING) -> doubled over
add(st(7) - 0.05, wt(8, 'its', 1) - 0.05, (t, T, d) => { const ti = wt(7, 'balls') - 0.06; const pre = T < ti; const imp = T >= ti && T < ti + 0.1; const after = T >= ti + 0.1;
  const wind = pre ? clamp((T - (ti - 0.7)) / 0.55) : 0; const flap = pre ? -0.5 * wind + (T > ti - 0.15 ? 2.2 * clamp((T - (ti - 0.15)) / 0.15) : 0) : 1.0 - 0.8 * clamp((T - ti) / 0.5);
  const shk = after ? 16 * Math.max(0, 1 - (T - ti) / 0.6) : 0; const burst = after ? Math.max(0, 1 - (T - ti - 0.1) / 0.9) : 0;
  const scene = <><SilDefs /><Bathroom t={t} />
    <Peng x={730} y={1480} s={1.2} t={t} expr={after ? 'smug' : 'angry'} look={-1} flap={flap} />
    <Tub x={730} y={1720} w={560} t={t} />
    <You x={390} y={after ? 1830 : 1800} s={1.4} t={t} expr={after ? 'xx' : 'shock'} bend={after ? -26 : 0} stars={after ? 1.1 : 0} sweat={after} look={1}
      armL={after ? [40, 30] : [150, -30]} armR={after ? [-20, -40] : [-150, 30]} />
    {T > ti - 0.15 && pre && <path d="M600 1300 Q560 1500 480 1540" fill="none" stroke={P.paper} strokeWidth={22} strokeLinecap="round" opacity={0.85} />}
    {after && burst > 0 && <g transform={`translate(470 1540) scale(${0.6 + 0.6 * burst})`}><polygon points={[...Array(16)].map((_, i) => { const r = i % 2 ? 60 : 130; const a = i * Math.PI / 8; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' ')} fill={P.acc} stroke={P.ink} strokeWidth={8} /></g>}
    <Vig /></>;
  return <><Cam t={t} d={d} z0={1.0} z1={1.06} ox={500} oy={1300} shake={shk}>{scene}</Cam>
    {imp && <><AbsoluteFill style={{background: P.acc}} /><svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {[...Array(22)].map((_, i) => { const a = i * Math.PI / 11; return <polygon key={i} points={`470,1540 ${470 + Math.cos(a) * 2200},${1540 + Math.sin(a) * 2200} ${470 + Math.cos(a + 0.09) * 2200},${1540 + Math.sin(a + 0.09) * 2200}`} fill={P.paper} />; })}
      <g filter="url(#blk2)"><defs><filter id="blk2"><feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.09  0 0 0 0 0.11  0 0 0 1 0" /></filter></defs>
        <Peng x={730} y={1480} s={1.2} t={t} expr="angry" look={-1} flap={1.2} /><You x={390} y={1800} s={1.4} t={t} expr="shock" bend={-14} /></g></svg></>}
    {T >= ti && <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', transform: `scale(${pop(T, ti, 0.25)}) rotate(-8deg)`, opacity: 1 - seg(T, ti + 1.1, ti + 1.4)}}>
      <span style={{fontFamily: 'Lilita One', fontSize: 210, color: P.paper, WebkitTextStroke: `16px ${P.ink}`, paintOrder: 'stroke fill', textShadow: `0 14px 0 ${P.ink}`}}>DING!</span></div>}</>; });
// 2 angry close-up
add(wt(8, 'its', 1) - 0.05, wt(8, 'landlord') - 0.1, (t, T, d) => <Cam t={t} d={d} z0={1.0} z1={1.15} ox={540} oy={900}><Bathroom t={t} />
  <Peng x={540} y={1900} s={2.6} t={t} expr="angry" beak={0.5 + 0.5 * Math.sin(t * 16)} flap={0.4 + 0.4 * Math.sin(t * 18)} squash={0.03 * Math.sin(t * 16)} />
  <Waves x={540} y={1300} t={t} dir={-90} big={1.2} /><Vig /></Cam>);
// 3 fridge note: inspection
add(wt(8, 'landlord') - 0.1, st(9) - 0.02, (t, T, d) => <><Cam t={t} d={d} z0={1.05} z1={1.18} ox={540} oy={900}>
  <rect width={1080} height={1920} fill="#d9d4c7" /><rect x={160} y={160} width={760} height={1760} rx={40} fill="#eef0f2" stroke={P.ink} strokeWidth={12} />
  <rect x={850} y={500} width={30} height={260} rx={12} fill="#b9bec6" stroke={P.ink} strokeWidth={6} />
  <g transform={`rotate(-4 540 820)`}><rect x={250} y={560} width={560} height={520} fill="#fff27a" stroke={P.ink} strokeWidth={9} />
    <text x={530} y={680} textAnchor="middle" fontFamily="Lilita One" fontSize={46} fill={P.ink}>INSPECTION TONIGHT</text>
    <text x={530} y={820} textAnchor="middle" fontFamily="Lilita One" fontSize={150} fill={P.acc}>9:00 PM</text>
    <text x={530} y={920} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={44} fill={P.ink}>- your landlord</text>
    <circle cx={530} cy={575} r={26} fill={P.acc} stroke={P.ink} strokeWidth={6} /></g>
  <You x={270} y={1960} s={1.5} t={t} expr="worried" sweat look={0.6} /><Vig /></Cam></>);
// 4 rule card
add(st(9) - 0.02, st(10) - 0.05, (t, T, d) => <AbsoluteFill style={{background: P.ink}}>
  <Cam t={t} d={d} z0={1} z1={1.04}><rect width={1080} height={1920} fill={P.ink} /></Cam>
  <Kicker text="BUILDING RULE #1" y={560} dark /><Big lines={['NO PETS.']} y={640} t={T} a={wt(9, 'no')} dark size={170} />
  <Stamp text="NO EXCEPTIONS" t={T} a={wt(9, 'exceptions') - 0.05} y={900} size={110} /></AbsoluteFill>, true);
// 5 thesis card: 12 hours
add(st(10) - 0.05, st(11) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.0} z1={1.1} ox={540} oy={1100}><Wallpaper />
  <rect x={300} y={760} width={480} height={360} rx={20} fill="#9fd8ff" stroke={P.ink} strokeWidth={12} />
  <ellipse cx={420} cy={980} rx={70} ry={24} fill="#fff" /><ellipse cx={450} cy={962} rx={40} ry={24} fill="#fff" />
  <circle cx={680} cy={840} r={40} fill="#ffe14a" stroke={P.ink} strokeWidth={5} />
  <Peng x={760} y={1720} s={1.0} t={t} expr="smug" look={-1} /><You x={330} y={1800} s={1.0} t={t} expr="think" look={1} armR={[-150, 40]} /><Vig /></Cam>
  <Kicker text="EPISODE 1 · THE BATHTUB" y={250} dark /><Big lines={['12 HOURS', 'TO HIDE', 'A PENGUIN']} y={330} t={T} a={wt(10, 'twelve') - 0.1} dark size={128} accent={0} /></>, true);
// 6 problem 1 card: fish per day
add(st(11) - 0.05, st(12) - 0.04, (t, T, d) => { const n = Math.floor(clamp((T - wt(11, 'eats')) / 1.4) * 12);
  return <AbsoluteFill style={{background: P.cream}}><Kicker text="PROBLEM 1 · FOOD" y={300} />
    <Big lines={["IT'S STARVING"]} y={360} t={T} a={st(11) + 0.3} size={120} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{[...Array(12)].map((_, i) => { if (i >= n) return null; const x = 190 + (i % 4) * 200, y = 640 + Math.floor(i / 4) * 150;
      return <g key={i} transform={`translate(${x} ${y}) scale(${pop(T, wt(11, 'eats') + i * 0.116, 0.25)})`}><path d="M-70 0 q40 -45 100 0 q-60 45 -100 0z" fill="#8fb3c9" stroke={P.ink} strokeWidth={6} /><path d="M30 0 l40 -30 v60z" fill="#8fb3c9" stroke={P.ink} strokeWidth={6} /><circle cx={-45} cy={-6} r={6} fill={P.ink} /></g>; })}</svg>
    <Big lines={['½ KG FISH', 'EVERY DAY']} y={1110} t={T} a={wt(11, 'kilo')} size={110} accent={0} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Peng x={880} y={1620} s={0.55} t={t} expr="angry" beak={0.4 + 0.4 * Math.sin(t * 10)} /></svg></AbsoluteFill>; }, true);
// 7 fridge open
add(st(12) - 0.04, st(13) - 0.05, (t, T, d) => <Cam t={t} d={d} z0={1.0} z1={1.1} ox={540} oy={1000}><rect width={1080} height={1920} fill="#151c33" />
  <rect x={120} y={300} width={620} height={1320} rx={30} fill="#fffbe8" stroke={P.ink} strokeWidth={12} />
  {[640, 920, 1200].map((y) => <rect key={y} x={140} y={y} width={580} height={14} fill="#cfd6db" stroke={P.ink} strokeWidth={4} />)}
  <g transform={`translate(330 ${640 - 50 + 0}) scale(${pop(T, wt(12, 'lemon') - 0.05)})`}><ellipse cx={0} cy={0} rx={70} ry={50} fill="#ffe14a" stroke={P.ink} strokeWidth={7} /><circle cx={-74} cy={0} r={10} fill="#ffe14a" stroke={P.ink} strokeWidth={5} /></g>
  <g transform={`translate(520 ${920 - 120}) scale(${pop(T, wt(12, 'ketchup') - 0.05)})`}><path d="M-45 120 v-150 q0 -40 45 -40 q45 0 45 40 v150z" fill="#e0342b" stroke={P.ink} strokeWidth={7} /><rect x={-20} y={-90} width={40} height={30} fill={P.paper} stroke={P.ink} strokeWidth={5} /></g>
  <polygon points="740,300 1080,120 1080,1800 740,1620" fill="rgba(255,250,220,0.18)" />
  <You x={880} y={1900} s={1.25} t={t} expr="dead" look={-1} /><Peng x={200} y={1880} s={0.8} t={t} expr="angry" look={1} /><Vig /></Cam>);
// 8 shop: tins tower
add(st(13) - 0.05, wt(13, 'cashier') - 0.08, (t, T, d) => { const n = Math.floor(clamp((T - wt(13, 'buy')) / 1.6) * 24);
  return <><Cam t={t} d={d} z0={1.0} z1={1.08} ox={540} oy={1200}><rect width={1080} height={1920} fill="#dfe8dc" />
    {[300, 520, 740].map((y) => <g key={y}><rect x={0} y={y} width={1080} height={22} fill="#9aa69a" />{[...Array(9)].map((_, i) => <rect key={i} x={30 + i * 118} y={y - 90} width={80} height={90} rx={8} fill={['#e9c46a', '#8ecae6', '#f4a261', '#90be6d'][(i + y) % 4]} stroke={P.ink} strokeWidth={5} />)}</g>)}
    <rect x={0} y={1350} width={1080} height={570} fill="#a7764a" stroke={P.ink} strokeWidth={10} />
    {[...Array(n)].map((_, i) => { const row = Math.floor(i / 6), col = i % 6; return <g key={i} transform={`translate(${250 + col * 100 + (row % 2) * 50} ${1330 - row * 70})`}><rect x={-44} y={-66} width={88} height={66} rx={10} fill="#3d7ea6" stroke={P.ink} strokeWidth={6} /><rect x={-44} y={-46} width={88} height={22} fill={P.paper} /></g>; })}
    <You x={170} y={1900} s={1.0} t={t} expr="smug" armR={[-120, -20]} /><Vig /></Cam>
    <Clock x={560} y={370} label="1:00 PM" t={T} a={wt(13, 'one') - 0.1} /></>; });
// 9 cashier / you
add(wt(13, 'cashier') - 0.08, st(14) - 0.05, (t, T, d) => { const second = T >= wt(13, 'you', 1) - 0.08;
  return <><Cam t={t} d={d} z0={1.05} z1={1.15} ox={540} oy={1100}><rect width={1080} height={1920} fill="#dfe8dc" /><rect x={0} y={1400} width={1080} height={520} fill="#a7764a" stroke={P.ink} strokeWidth={10} />
    {!second ? <g><You x={540} y={2000} s={1.6} t={t} expr="dead" bob={false} /><rect x={420} y={1240} width={240} height={36} rx={10} fill="#6e9f5a" stroke={P.ink} strokeWidth={6} /><text x={540} y={1180} fontFamily="Lilita One" fontSize={50} textAnchor="middle" fill={P.ink}>CASHIER</text></g>
      : <You x={540} y={2050} s={1.7} t={t} expr="smug" bob={false} look={-0.4} />}
    <Vig /></Cam>{second ? <Tag text="NO QUESTIONS" x={540} y={560} t={T} a={wt(13, 'you', 1)} acc /> : <Tag text="..." x={720} y={600} t={T} a={wt(13, 'doesnt')} />}</>; });
// 10 problem 2 card: African penguin
add(st(14) - 0.05, wt(14, 'nicknamed') - 0.1, (t, T, d) => <AbsoluteFill style={{background: P.ink}}><Kicker text="PROBLEM 2 · NOISE" y={300} dark />
  <Big lines={['AFRICAN', 'PENGUIN']} y={380} t={T} a={wt(14, 'african') - 0.1} dark size={140} />
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Peng x={540} y={1250} s={1.0} t={t} expr="smug" /></svg></AbsoluteFill>, true);
// 11 jackass = donkey card
add(wt(14, 'nicknamed') - 0.1, st(15) - 0.05, (t, T, d) => { const eq = T > wt(14, 'donkey') - 0.1;
  return <AbsoluteFill style={{background: P.cream}}><Kicker text="ITS REAL NICKNAME" y={300} />
    <Big lines={['"JACKASS', 'PENGUIN"']} y={370} t={T} a={wt(14, 'jackass') - 0.1} size={130} accent={0} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Peng x={290} y={1220} s={0.75} t={t} expr="angry" beak={eq ? 0.8 : 0} /> {eq && <Waves x={290} y={1000} t={t} big={0.6} />}
      <g transform={`translate(560 1030) scale(${pop(T, wt(14, 'calls') - 0.1)})`}><text x={0} y={0} fontFamily="Lilita One" fontSize={130} textAnchor="middle" fill={P.ink}>=</text></g>
      <g transform={`translate(820 1180) scale(${pop(T, wt(14, 'donkey') - 0.1)})`}>
        <path d="M-40 -170 l-20 -110 l45 90z M20 -170 l20 -110 l-45 90z" fill="#9c958c" stroke={P.ink} strokeWidth={7} />
        <ellipse cx={0} cy={-90} rx={90} ry={110} fill="#a8a197" stroke={P.ink} strokeWidth={8} /><ellipse cx={0} cy={-10} rx={70} ry={55} fill="#d9d1c3" stroke={P.ink} strokeWidth={7} />
        <circle cx={-40} cy={-120} r={11} fill={P.ink} /><circle cx={40} cy={-120} r={11} fill={P.ink} /><ellipse cx={-22} cy={-10} rx={9} ry={13} fill={P.ink} /><ellipse cx={22} cy={-10} rx={9} ry={13} fill={P.ink} /></g></svg>
    {eq && <Tag text="HEE-HAW!" x={540} y={1440} t={T} a={wt(14, 'donkey')} acc />}</AbsoluteFill>; }, true);
// 12 3 PM calling (daylight)
add(st(15) - 0.05, st(16) - 0.05, (t, T, d) => { const call = T > wt(15, 'calling') - 0.1;
  return <><Cam t={t} d={d} z0={1.0} z1={1.12} ox={600} oy={1200} shake={call ? 5 : 0}><Bathroom t={t} />
    <Peng x={640} y={1360} s={1.15} t={t} expr="angry" beak={call ? 0.6 + 0.4 * Math.sin(t * 20) : 0} flap={call ? 0.5 + 0.4 * Math.sin(t * 18) : 0} tilt={call ? -12 : 0} />
    <Tub x={640} y={1580} w={580} t={t} />{call && <Waves x={650} y={1040} t={t} big={1.3} />}<Vig /></Cam>
    <Clock x={330} y={370} label="3:00 PM" t={T} a={st(15)} />{call && <Tag text="HEE-HAW!!" x={700} y={760} t={T} a={wt(15, 'calling')} acc rot={6} />}</>; });
// 13 neighbour bangs
add(st(16) - 0.05, st(17) - 0.05, (t, T, d) => { const bang = T > wt(16, 'bangs') - 0.05; const k = bang ? Math.max(0, Math.sin((T - wt(16, 'bangs')) * 18)) : 0;
  return <><Cam t={t} d={d} z0={1.0} z1={1.06} shake={k * 8}><rect width={1080} height={1920} fill="#2b3354" /><rect x={0} y={0} width={520} height={1920} fill="#3e486e" />
    <rect x={505} y={0} width={70} height={1920} fill="#8b8579" stroke={P.ink} strokeWidth={8} />
    <You x={250} y={1650} s={0.9} t={t} expr="shock" sweat look={1} />
    <g opacity={0.95}><You x={830} y={1650} s={0.9} t={t} expr="angry" flip armL={[150, -30]} look={-1} /></g>
    {bang && [0, 1, 2].map((i) => <path key={i} d={`M600 ${1000 + i * 60} l${50 + i * 10} ${-20 + i * 20}`} stroke={P.acc} strokeWidth={12} strokeLinecap="round" opacity={k} />)}
    <Vig /></Cam>
    {T > wt(16, 'why') - 0.1 && <div style={{position: 'absolute', left: 540, top: 400, width: 440, transform: `scale(${pop(T, wt(16, 'why') - 0.1)})`, background: P.paper, border: `9px solid ${P.ink}`, borderRadius: 30, padding: '18px 22px', fontFamily: 'Lilita One', fontSize: 60, lineHeight: 1.05, color: P.ink, textAlign: 'center', boxShadow: `0 10px 0 ${P.ink}`}}>WHY IS THERE A <span style={{color: P.acc}}>DONKEY</span> IN THERE?!</div>}
    <Tag text="NEIGHBOUR" x={830} y={1080} t={T} a={st(16) + 0.2} /></>; });
// 14 documentary alibi
add(st(17) - 0.05, st(18) - 0.05, (t, T, d) => { const vol = clamp((T - wt(17, 'blast')) / 1.2);
  return <><Cam t={t} d={d} z0={1.0} z1={1.1} ox={540} oy={1000}><Wallpaper />
    <rect x={180} y={420} width={720} height={470} rx={24} fill={P.ink} /><rect x={210} y={450} width={660} height={410} rx={10} fill="#ffd27a" />
    <circle cx={760} cy={540} r={50} fill="#fff3b0" /><rect x={210} y={720} width={660} height={140} fill="#e9d29a" />
    {[0, 1, 2].map((i) => <Peng key={i} x={330 + i * 150} y={800} s={0.28} t={t + i} expr="smug" band={false} />)}
    <text x={540} y={500} fontFamily="Fredoka" fontWeight={700} fontSize={32} textAnchor="middle" fill={P.ink}>NATURE DOCUMENTARY</text>
    <rect x={240} y={930} width={600} height={36} rx={18} fill="#1b2235" stroke={P.ink} strokeWidth={5} /><rect x={244} y={934} width={592 * vol} height={28} rx={14} fill={P.acc} />
    <rect x={120} y={1450} width={840} height={260} rx={50} fill="#6b5b95" stroke={P.ink} strokeWidth={10} />
    <You x={540} y={1700} s={0.95} t={t} expr="smug" armR={[-100, -30]} holding={<rect x={-14} y={-50} width={28} height={60} rx={8} fill={P.ink} />} /><Vig /></Cam>
    <Tag text="ALIBI ✓" x={540} y={400} t={T} a={wt(17, 'alibi') - 0.05} acc /></>; });
// 15 penguin answers the TV
add(st(18) - 0.05, wt(18, 'louder') - 0.08, (t, T, d) => { const back = T > wt(18, 'calling') - 0.1;
  return <Cam t={t} d={d} z0={1.0} z1={1.15} ox={540} oy={1000}><Wallpaper />
    <rect x={180} y={420} width={720} height={470} rx={24} fill={P.ink} /><rect x={210} y={450} width={660} height={410} rx={10} fill="#ffd27a" />
    <Peng x={540} y={840} s={0.7} t={t} expr="angry" band={false} beak={0.6 + 0.4 * Math.sin(t * 15)} />
    <Waves x={540} y={600} t={t} big={0.7} color={P.ink} />
    <Peng x={540} y={1780} s={1.2} t={t} expr="angry" tilt={-8} beak={back ? 0.7 + 0.3 * Math.sin(t * 19) : 0} flap={back ? 0.5 + 0.3 * Math.sin(t * 17) : 0} />
    {back && <Waves x={540} y={1440} t={t} big={1.0} />}<Vig /></Cam>; });
// 16 LOUDER smash
add(wt(18, 'louder') - 0.08, st(19) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.25} z1={1.5} ox={540} oy={1300} shake={14}><rect width={1080} height={1920} fill={P.acc} />
  {[...Array(16)].map((_, i) => <polygon key={i} points={`540,1150 ${540 + Math.cos(i * 0.39) * 1400},${1150 + Math.sin(i * 0.39) * 1400} ${540 + Math.cos(i * 0.39 + 0.18) * 1400},${1150 + Math.sin(i * 0.39 + 0.18) * 1400}`} fill="#ff7a45" />)}
  <Peng x={540} y={1800} s={1.6} t={t} expr="angry" beak={1} flap={0.9} squash={0.06 * Math.sin(t * 30)} /><Waves x={540} y={1300} t={t} big={1.8} color={P.paper} /></Cam>
  <Big lines={['LOUDER.']} y={360} t={T} a={wt(18, 'louder') - 0.05} size={170} dark /></>);
// 17 problem 3 card: trajectory
add(st(19) - 0.05, st(20) - 0.05, (t, T, d) => { const p = clamp((T - wt(19, 'fire')) / 0.9);
  const pts = [...Array(31)].map((_, i) => { const u = i / 30 * p; return `${300 + u * 520},${1100 - Math.sin(u * Math.PI) * 240}`; }).join(' ');
  return <AbsoluteFill style={{background: P.cream}}><Kicker text="PROBLEM 3 · AIM" y={300} />
    <Big lines={["PENGUINS", "DON'T AIM"]} y={360} t={T} a={st(19) + 0.4} size={124} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Peng x={220} y={1250} s={0.6} t={t} expr="smug" flip tilt={20} />
      <polyline points={pts} fill="none" stroke={P.acc} strokeWidth={12} strokeDasharray="26 18" strokeLinecap="round" />
      {p >= 1 && <circle cx={820} cy={1100} r={26} fill="#e8e3c8" stroke={P.ink} strokeWidth={6} />}
      <line x1={300} y1={1270} x2={820} y2={1270} stroke={P.ink} strokeWidth={8} />{[...Array(11)].map((_, i) => <line key={i} x1={300 + i * 52} y1={1270} x2={300 + i * 52} y2={i % 5 ? 1295 : 1315} stroke={P.ink} strokeWidth={6} />)}</svg>
    <Big lines={['ACROSS THE ROOM']} y={660} t={T} a={wt(19, 'room') - 0.1} size={96} accent={0} /></AbsoluteFill>; }, true);
// 18 bathroom wall
add(st(20) - 0.05, st(21) - 0.05, (t, T, d) => <Cam t={t} d={d} z0={1.0} z1={1.1} ox={540} oy={1100}><Bathroom t={t} />
  {[[300, 700, 70], [520, 520, 110], [760, 820, 80], [420, 980, 60], [880, 450, 50], [640, 1150, 70]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) scale(${pop(T, st(20) + i * 0.08, 0.2)})`}>
    <circle r={r} fill="#ece6c6" stroke="#c9c19a" strokeWidth={6} />{[0, 1, 2, 3].map((j) => <circle key={j} cx={Math.cos(j * 1.7 + i) * r * 1.3} cy={Math.sin(j * 1.7 + i) * r * 1.3} r={r * 0.22} fill="#ece6c6" />)}
    <path d={`M0 ${r * 0.8} v${r * 1.2}`} stroke="#ece6c6" strokeWidth={r * 0.3} strokeLinecap="round" /></g>)}
  <You x={330} y={1820} s={1.0} t={t} expr="dead" armR={[-170, 10]} holding={<g><rect x={-8} y={-260} width={16} height={330} fill="#b07a3b" stroke={P.ink} strokeWidth={5} /><path d="M-50 -280 h100 l-20 30 h-60z" fill="#d6d3cc" stroke={P.ink} strokeWidth={5} /></g>} />
  <Peng x={800} y={1820} s={0.85} t={t} expr="smug" look={-1} /><Vig /></Cam>);
// 19 the flipper band
add(st(21) - 0.05, wt(21, 'city') - 0.08, (t, T, d) => <><Cam t={t} d={d} z0={1.0} z1={1.25} ox={760} oy={1000}><Bathroom t={t} night={0.12} />
  <Peng x={540} y={1800} s={2.0} t={t} expr="smug" flap={0.15} look={-1} /><Vig /></Cam><Clock x={330} y={370} label="5:00 PM" t={T} a={st(21)} /></>);
// 20 band close-up
add(wt(21, 'city') - 0.08, st(22) - 0.05, (t, T, d) => <Cam t={t} d={d} z0={1.0} z1={1.08}><rect width={1080} height={1920} fill="#1d2027" />
  <g transform="translate(540 1000) rotate(-8)"><rect x={-420} y={-170} width={840} height={340} rx={40} fill={P.acc} stroke={P.ink} strokeWidth={16} />
    <text x={0} y={-30} textAnchor="middle" fontFamily="Lilita One" fontSize={120} fill={P.ink}>CITY ZOO</text>
    <text x={0} y={120} textAnchor="middle" fontFamily="Lilita One" fontSize={150} fill={P.paper} stroke={P.ink} strokeWidth={8} paintOrder="stroke">#47</text></g><Vig /></Cam>);
// 21 lock screen: text from "Ex" (5:00 PM)
add(st(22) - 0.05, st(23) - 0.05, (t, T, d) => { const msg = T > wt(22, 'did') - 0.15;
  return <><Cam t={t} d={d} z0={1.0} z1={1.08} shake={t < 0.5 ? 4 : 0}><Bathroom t={t} night={0.12} />
  <g transform={`translate(540 1000) rotate(${t < 0.5 ? Math.sin(t * 50) * 3 : 0})`}><rect x={-300} y={-640} width={600} height={1180} rx={70} fill={P.ink} /><rect x={-275} y={-612} width={550} height={1124} rx={52} fill="#2a3a63" />
    <text x={0} y={-470} textAnchor="middle" fontFamily="Lilita One" fontSize={130} fill={P.paper}>5:00</text>
    <text x={0} y={-400} textAnchor="middle" fontFamily="Fredoka" fontWeight={700} fontSize={40} fill="#c9d3ea">PM · Friday</text></g>
  {[0, 1].map((i) => <path key={i} d={`M${200 - i * 40} ${760 + i * 30} l-40 -20 M${880 + i * 40} ${760 + i * 30} l40 -20`} stroke={P.acc} strokeWidth={12} strokeLinecap="round" />)}<Vig /></Cam>
  <div style={{position: 'absolute', left: 280, width: 520, top: 760, transform: `translateY(${(1 - seg(T, st(22) + 0.05, st(22) + 0.35)) * -80}px)`, opacity: seg(T, st(22) + 0.05, st(22) + 0.3), background: 'rgba(250,248,242,0.96)', borderRadius: 34, padding: '20px 24px', border: `6px solid ${P.ink}`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}><div style={{width: 54, height: 54, borderRadius: 14, background: '#34c759', border: `4px solid ${P.ink}`}} />
      <div style={{fontFamily: 'Lilita One', fontSize: 50, color: P.ink}}>Ex</div>
      <svg width={52} height={52} viewBox="-30 -40 60 62"><path d="M0 18 C-30 -4 -34 -26 -18 -34 C-8 -38 0 -30 0 -22 C0 -30 8 -38 18 -34 C34 -26 30 -4 0 18 Z" fill="#e0342b" stroke={P.ink} strokeWidth={4} /><path d="M0 -22 l-6 10 l8 8 l-6 10" fill="none" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" /></svg>
      <div style={{marginLeft: 'auto', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 30, color: '#7d776c'}}>now</div></div>
    <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 46, lineHeight: 1.15, color: P.ink, marginTop: 10, opacity: msg ? 1 : 0.0}}>Did you take something from the zoo?</div></div></>; });
// 22 breaking news + CCTV
add(st(23) - 0.05, st(24) - 0.05, (t, T, d) => { const cctv = T > wt(23, 'police') - 0.1;
  return <AbsoluteFill style={{background: '#22314f'}}>
    <div style={{position: 'absolute', left: 70, right: 110, top: 330, transform: `translateY(${(1 - seg(T, st(23) - 0.05, st(23) + 0.25)) * -300}px)`, background: P.paper, borderRadius: 34, padding: '24px 30px', border: `8px solid ${P.ink}`}}>
      <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 34, color: P.acc, letterSpacing: 4}}>● BREAKING NEWS · 5:00 PM</div>
      <div style={{fontFamily: 'Lilita One', fontSize: 70, color: P.ink, lineHeight: 1.05}}>Penguin <span style={{color: P.acc}}>STOLEN</span> from City Zoo last night</div></div>
    {cctv && <div style={{position: 'absolute', left: 110, top: 700, width: 830, height: 516, border: `8px solid ${P.ink}`, borderRadius: 16, overflow: 'hidden', transform: `scale(${pop(T, wt(23, 'police') - 0.1)})`}}>
      <svg width={814} height={500} viewBox="0 0 900 560"><rect width={900} height={560} fill="#5d6b63" /><rect x={0} y={380} width={900} height={180} fill="#4a554f" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={i * 260 + 60} y1={560} x2={i * 260 + 160} y2={380} stroke="#e6e6dc" strokeWidth={8} />)}
        <g transform="translate(240 300)"><rect x={-150} y={0} width={330} height={110} rx={30} fill="#8a9a8f" stroke="#222" strokeWidth={6} /><rect x={-90} y={-60} width={210} height={70} rx={20} fill="#8a9a8f" stroke="#222" strokeWidth={6} /><circle cx={-80} cy={110} r={34} fill="#222" /><circle cx={110} cy={110} r={34} fill="#222" /></g>
        <g transform="scale(0.5) translate(1260 950)"><You x={0} y={0} s={1} t={t} expr="happy" bob={false} armR={[-60, -60]} armL={[60, 60]} /></g>
        <g transform="scale(0.5) translate(1420 900)"><Peng x={0} y={0} s={0.8} t={t} expr="smug" bob={false} /></g>
        <rect width={900} height={560} fill="#3a4a40" opacity={0.35} />{[...Array(28)].map((_, i) => <rect key={i} x={0} y={i * 20 + (t * 80) % 20} width={900} height={3} fill="#000" opacity={0.18} />)}
        <text x={24} y={44} fontFamily="Fredoka" fontWeight={700} fontSize={30} fill="#fff">CAM 03 · CAR PARK · 23:41</text><circle cx={860} cy={34} r={12} fill="#ff3d2e" opacity={Math.sin(t * 8) > 0 ? 1 : 0.2} /></svg></div>}
  </AbsoluteFill>; }, true);
// 23 you don't remember
add(st(24) - 0.05, wt(24, 'but') - 0.08, (t, T, d) => <Cam t={t} d={d} z0={1.05} z1={1.2} ox={540} oy={900}><Bathroom t={t} night={0.15} />
  <You x={540} y={1950} s={1.6} t={t} expr="think" armR={[-160, -40]} look={-0.5} />
  {[0, 1, 2].map((i) => <text key={i} x={300 + i * 230} y={560 - Math.sin(t * 3 + i) * 20} fontFamily="Lilita One" fontSize={130} fill={P.paper} stroke={P.ink} strokeWidth={8} paintOrder="stroke" opacity={seg(t, i * 0.25, i * 0.25 + 0.2)}>?</text>)}<Vig /></Cam>);
// 24 keys in bathtub
add(wt(24, 'but') - 0.08, st(25) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.0} z1={1.3} ox={700} oy={1250}><Bathroom t={t} />
  <Peng x={560} y={1290} s={1.0} t={t} expr="smug" look={1} /><Tub x={600} y={1520} w={600} keys t={t} /><Vig /></Cam><Tag text="YOUR CAR KEYS" x={560} y={420} t={T} a={wt(24, 'keys') - 0.05} acc /></>);
// 25 door knocks
add(st(25) - 0.05, st(26) - 0.05, (t, T, d) => { const ks = [wt(25, 'three') + 0.245, wt(25, 'three') + 0.455, wt(25, 'three') + 0.608]; const hit = ks.some((k) => T >= k && T < k + 0.15);
  return <><Cam t={t} d={d} z0={1.0} z1={1.12} ox={540} oy={1000} shake={hit ? 10 : 0}><rect width={1080} height={1920} fill="#1a1f33" />
    <rect x={250} y={380} width={580} height={1300} rx={12} fill="#6b4a32" stroke={P.ink} strokeWidth={14} />
    {[[300, 440], [300, 1080]].map(([x, y]) => <rect key={y} x={x} y={y} width={480} height={540} rx={10} fill="none" stroke="#4d3423" strokeWidth={12} />)}
    <circle cx={540} cy={640} r={22} fill="#ffd58a" stroke={P.ink} strokeWidth={6} /><circle cx={760} cy={1060} r={28} fill="#d9b25b" stroke={P.ink} strokeWidth={7} />
    <rect x={250} y={1680} width={580} height={18} fill="#ffd58a" opacity={0.8} />
    {ks.map((k, i) => T >= k && <g key={i} opacity={1 - seg(T, k + 0.2, k + 0.6)}><text x={360 + i * 170} y={900 + i * 40} fontFamily="Lilita One" fontSize={110} fill={P.acc} stroke={P.ink} strokeWidth={8} paintOrder="stroke" transform={`rotate(${-10 + i * 10} ${400 + i * 170} 880)`}>KNOCK</text></g>)}<Vig /></Cam>
    <Clock x={330} y={370} label="8:57 PM" t={T} a={st(25)} /></>; });
// 26 the choice
add(st(26) - 0.05, st(27) - 0.05, (t, T, d) => <><Cam t={t} d={d} z0={1.0} z1={1.06} ox={540} oy={1400}><rect width={1080} height={1920} fill="#1a1f33" />
  <rect x={0} y={1640} width={1080} height={280} fill="#2a2f45" />
  <You x={330} y={1930} s={0.78} t={t} expr="worried" sweat look={1} /><Peng x={760} y={1900} s={0.8} t={t} expr="smug" look={-1} /><Vig /></Cam>
  <Btn label="HIDE" t0={wt(26, 'hide') - 0.05} T={T} x={110} /><Btn label="TRUTH" accent t0={wt(26, 'truth') - 0.05} T={T} x={545} />
  <Kicker text="WHAT DO YOU DO?" y={940} dark /></>);
// 27 end card
add(st(27) - 0.05, 999, (t, T, d) => <AbsoluteFill style={{background: P.ink, transform: `scale(${1 + 0.06 * ease(clamp(t / 8))}) rotate(${0.6 * Math.sin(t * 1.3)}deg)`}}>
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><Peng x={540} y={1760} s={0.9} t={t} expr="smug" /></svg>
  <Kicker text="PENGUIN #47 · EPISODE 1" y={330} dark />
  <Big lines={['PART 2', 'IS YOURS']} y={410} t={T} a={st(27)} dark size={150} accent={1} />
  <div style={{position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 52, color: P.paper}}>Comment ONE word.<br />Most-liked answer wins.</div>
  <Btn label="HIDE" on={T > wt(27, 'hide')} t0={wt(27, 'hide') - 0.05} T={T} x={110} /><Btn label="TRUTH" accent on={T > wt(27, 'truth')} t0={wt(27, 'truth') - 0.05} T={T} x={545} />
  <div style={{position: 'absolute', top: 1260, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(T, wt(27, 'follow') - 0.05) * (1 + 0.05 * Math.sin(t * 5))})`}}><span style={{fontFamily: 'Lilita One', fontSize: 64, color: P.ink, background: P.paper, borderRadius: 20, padding: '8px 30px'}}>FOLLOW FOR PART 2</span></div>
</AbsoluteFill>, true);

export const Pov = () => {
  const f = useCurrentFrame(); const T = f / FPS;
  const sh = SH.find((s) => T >= s.a && T < s.b) || SH[SH.length - 1];
  const t = T - sh.a, d = Math.min(sh.b, VO.dur + END_HOLD) - sh.a;
  const inT = clamp(t / 0.12); // punch-in on every cut
  const noCap = T >= st(27) - 0.05;
  return <AbsoluteFill style={{background: P.ink, overflow: 'hidden'}}><Fonts />
    <AbsoluteFill style={{transform: `scale(${1.06 - 0.06 * ease(inT)})`}}>{sh.f(t, T, d)}</AbsoluteFill>
    <HUD T={T} off={sh.card} /><Captions T={T} hide={noCap} />
    <AbsoluteFill style={{background: '#fff', opacity: (1 - inT) * 0.18, pointerEvents: 'none'}} />
  </AbsoluteFill>;
};
