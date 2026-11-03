import {PALETTES} from '../palette.js'; // HUMANE caption palette 2026-11-03
// nottrue kit: camera, scenes, sets, props, captions, finishing (thick stick-man horror, 2026-10-28).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile} from 'remotion';

export const EZ = Easing.bezier(0.45, 0, 0.2, 1);
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ramp = (t, a, b, e = EZ) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// keyframes [[t, v], ...] (t in seconds) -> eased value
export const kv = (t, pts, e = EZ) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [t0, v0] = pts[i], [t1, v1] = pts[i + 1];
    if (t <= t1) return lerp(v0, v1, e(clamp((t - t0) / Math.max(1e-6, t1 - t0))));
  }
  return pts[pts.length - 1][1];
};

export const FontFaces = () => <style>{`
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'Fredoka';src:url('${staticFile('fonts/Fredoka-Variable.ttf')}') format('truetype');font-weight:300 700;}
`}</style>;

// ---------- camera: cam = [[t, cx, cy, zoom, rotDeg?], ...] in scene-local seconds ----------
export const Cam = ({t, cam, shake = 0, children, W = 1080, H = 1920}) => {
  const cx = kv(t, cam.map((c) => [c[0], c[1]])), cy = kv(t, cam.map((c) => [c[0], c[2]]));
  const z = kv(t, cam.map((c) => [c[0], c[3]])), r = kv(t, cam.map((c) => [c[0], c[4] || 0]));
  const sx = shake * (Math.sin(t * 13.1) * 0.6 + Math.sin(t * 29.7) * 0.4) * 6, sy = shake * (Math.cos(t * 11.3) * 0.6 + Math.sin(t * 23.9) * 0.4) * 6;
  const hand = 1.6 * Math.sin(t * 1.3), hand2 = 1.2 * Math.cos(t * 0.9);
  return <g transform={`translate(${W / 2 + sx + hand} ${H / 2 + sy + hand2}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};

// ---------- scene sequencer: scenes [{a, b, cam, shake, draw: (t, T) => svg}] (seconds). 5-frame crossfades, never black ----------
export const Scenes = ({scenes, bg = '#0b0c11', W = 1080, H = 1920, xf = 0.16}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const T = f / fps;
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, background: bg}}>
    {scenes.map((s, i) => {
      if (T < s.a - 0.001 || T >= s.b + (i < scenes.length - 1 ? xf : 0)) return null;
      const t = T - s.a;
      const o = i > 0 && t < xf && !s.hard ? clamp(t / xf) : 1;
      return <g key={i} opacity={o} style={s.filter ? {filter: s.filter} : undefined}><Cam t={t} cam={s.cam || [[0, W / 2, H / 2, 1]]} shake={typeof s.shake === 'function' ? s.shake(t) : (s.shake || 0)} W={W} H={H}>{s.draw(t, T)}</Cam>{s.overlay && s.overlay(t, T)}</g>;
    })}
  </svg>;
};

// ---------- environment ----------
export const NightSky = ({w = 1080, h = 1100, top = '#06070d', bot = '#1a1d2b', stars = 60, moon = null, t = 0, id = 'sky'}) => <g>
  <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
  <rect x={-600} y={-400} width={w + 1200} height={h + 400} fill={`url(#${id})`} />
  {Array.from({length: stars}, (_, i) => <circle key={i} cx={-200 + rnd(i) * (w + 400)} cy={-300 + rnd(i + 99) * h * 0.8} r={1 + rnd(i + 7) * 2.2} fill="#cfd6ff" opacity={0.25 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))} />)}
  {moon && <g><circle cx={moon[0]} cy={moon[1]} r={120} fill="#e8e6d8" opacity={0.08} /><circle cx={moon[0]} cy={moon[1]} r={56} fill="#dcd9c8" opacity={0.85} /></g>}
</g>;

export const Fog = ({t, y = 1250, h = 380, color = '#9aa3b8', op = 0.16, speed = 30, w = 1080, n = 5, seed = 1}) => <g style={{filter: 'blur(28px)'}}>
  {Array.from({length: n}, (_, i) => { const x = ((rnd(i + seed) * 1600 + t * speed * (0.6 + rnd(i + 5 + seed))) % 2000) - 500;
    return <ellipse key={i} cx={x} cy={y + (rnd(i + 3) - 0.5) * h} rx={340 + rnd(i + 9) * 260} ry={70 + rnd(i + 11) * 60} fill={color} opacity={op} />; })}
</g>;

export const Rain = ({t, n = 80, color = '#a8b6d8', op = 0.35, w = 1080, h = 1920}) => <g opacity={op}>
  {Array.from({length: n}, (_, i) => { const x = rnd(i) * (w + 300) - 150, y = ((rnd(i + 50) * h + t * 1400 * (0.8 + rnd(i + 3) * 0.4)) % (h + 200)) - 100;
    return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke={color} strokeWidth={2.2} strokeLinecap="round" />; })}
</g>;

export const Glow = ({x, y, r = 300, color = '#ffd27a', op = 0.35, id}) => <g>
  <defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={op} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
  <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
</g>;

// light cone from (x,y) pointing at angle (deg, 90 = down)
export const Cone = ({x, y, len = 700, spread = 30, ang = 90, color = '#fff2c4', op = 0.22, id}) => {
  const a1 = (ang - spread / 2) * Math.PI / 180, a2 = (ang + spread / 2) * Math.PI / 180;
  return <g><defs><radialGradient id={id} cx={x} cy={y} r={len} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={color} stopOpacity={op} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <path d={`M${x} ${y} L${x + Math.cos(a1) * len} ${y + Math.sin(a1) * len} L${x + Math.cos(a2) * len} ${y + Math.sin(a2) * len} Z`} fill={`url(#${id})`} /></g>;
};

export const Road = ({t, y = 1300, speed = 0, color = '#15171f', line = '#d9d2b0', w = 1080}) => <g>
  <rect x={-800} y={y} width={w + 1600} height={1400} fill={color} />
  <rect x={-800} y={y} width={w + 1600} height={10} fill="#2a2d3a" />
  {Array.from({length: 14}, (_, i) => { const x = ((i * 220 - t * speed) % 3080 + 3080) % 3080 - 900; return <rect key={i} x={x} y={y + 150} width={120} height={14} rx={6} fill={line} opacity={0.55} />; })}
</g>;

// ---------- props ----------
export const TollBooth = ({x = 640, y = 1300, lit = 1, accent = '#ff3b3b', window = 0, flicker = 0}) => {
  const l = lit * (1 - flicker);
  return <g transform={`translate(${x} ${y})`}>
    <Glow x={0} y={-260} r={420} color="#ffd88a" op={0.28 * l} id={`bg${x}`} />
    <rect x={-170} y={-560} width={340} height={560} rx={10} fill="#262a36" stroke="#3a3f50" strokeWidth={8} />
    <rect x={-200} y={-610} width={400} height={64} rx={8} fill="#1b1e28" stroke={accent} strokeWidth={4} />
    <text x={0} y={-566} textAnchor="middle" fontFamily="Lilita One" fontSize={38} fill={accent} letterSpacing={6}>TOLL</text>
    <rect x={-140} y={-470} width={280} height={230} rx={6} fill={`rgba(255,214,140,${0.25 + 0.55 * l})`} stroke="#11131a" strokeWidth={10} />
    {/* sliding window panel */}
    <rect x={-140 + 280 * window * 0.5} y={-470} width={140} height={230} fill="rgba(170,200,230,0.12)" stroke="#11131a" strokeWidth={6} />
    <rect x={100} y={-230} width={56} height={70} fill="#efe9d4" opacity={0.9} transform="rotate(4)" />
    <rect x={-170} y={-12} width={340} height={20} fill="#151821" />
  </g>;
};

export const Barrier = ({x = 900, y = 1300, up = 0, accent = '#ff3b3b'}) => <g transform={`translate(${x} ${y})`}>
  <rect x={-24} y={-130} width={48} height={130} fill="#2f3342" />
  <g transform={`translate(0 -110) rotate(${-80 * up})`}>
    {Array.from({length: 6}, (_, i) => <rect key={i} x={20 + i * 60} y={-14} width={60} height={28} fill={i % 2 ? '#e9e4d6' : accent} />)}
  </g>
  <circle cx={0} cy={-110} r={18} fill="#1b1e28" />
</g>;

// car side view; facing 1 = drives right
export const Car = ({x = 300, y = 1300, s = 1, facing = 1, lights = true, color = '#3b4152', fogWin = 0, kids = false, accent = '#ff3b3b', ghost = 0, t = 0, eyesIn = 0}) => <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`} opacity={1 - ghost * 0.55}>
  {lights && <Cone x={260} y={-90} len={900} spread={22} ang={0} color="#fff3c8" op={0.35} id={`cone${Math.round(x)}${facing}`} />}
  <ellipse cx={0} cy={6} rx={300} ry={18} fill="rgba(0,0,0,0.5)" />
  <path d="M-280 -40 L-270 -120 L-150 -130 L-80 -220 L120 -220 L190 -130 L280 -110 L290 -40 Z" fill={color} stroke="#0c0d12" strokeWidth={10} strokeLinejoin="round" />
  <path d="M-130 -135 L-70 -205 L10 -205 L10 -135 Z" fill={`rgba(150,170,200,${0.22 + fogWin * 0.55})`} stroke="#0c0d12" strokeWidth={6} />
  <path d="M30 -135 L30 -205 L110 -205 L165 -135 Z" fill={`rgba(150,170,200,${0.22 + fogWin * 0.55})`} stroke="#0c0d12" strokeWidth={6} />
  {fogWin > 0.3 && <path d={`M60 -150 q 8 -30 0 -45 M80 -150 q 6 -26 0 -40`} stroke="#0c0d12" strokeWidth={5} opacity={fogWin - 0.3} fill="none" />}
  {eyesIn > 0 && <g opacity={eyesIn}><circle cx={60} cy={-172} r={16} fill={accent} opacity={0.35} style={{filter: 'blur(4px)'}} /><circle cx={52} cy={-172} r={5} fill={accent} /><circle cx={78} cy={-172} r={5} fill={accent} />
    <g transform="translate(110 -170)" opacity={0.8}><ellipse cx={0} cy={6} rx={11} ry={14} fill="#d9e2ee" />{[-9, -3, 3, 9].map((fx) => <rect key={fx} x={fx - 2.5} y={-18} width={5} height={14} rx={2.5} fill="#d9e2ee" />)}</g></g>}
  {kids && <g>{[-80, 70].map((kx, i) => <g key={i}><circle cx={kx} cy={-165} r={20} fill="#f1ede2" /><line x1={kx + 18} y1={-150} x2={kx + 30 + Math.sin(t * 9 + i) * 12} y2={-190} stroke="#f1ede2" strokeWidth={10} strokeLinecap="round" /></g>)}</g>}
  <rect x={265} y={-100} width={26} height={26} rx={6} fill={lights ? '#fff6d6' : '#2a2c33'} />
  <rect x={-286} y={-100} width={18} height={24} rx={5} fill={lights ? accent : '#2a1c1c'} />
  {[-170, 170].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={50} fill="#0c0d12" /><circle cx={wx} cy={-30} r={20} fill="#545a6b" /><line x1={wx} y1={-30} x2={wx + 20 * Math.cos(t * 12 * facing)} y2={-30 + 20 * Math.sin(t * 12 * facing)} stroke="#0c0d12" strokeWidth={6} /></g>)}
</g>;

// paper note: lines [{txt, scratch, glow}]
export const Paper = ({x = 540, y = 900, w = 820, h = 1040, lines = [], accent = '#ff3b3b', rot = -2, reveal = 1, t = 0, title = 'BOOTH RULES'}) => <g transform={`translate(${x} ${y}) rotate(${rot})`}>
  <rect x={-w / 2 + 14} y={-h / 2 + 18} width={w} height={h} fill="rgba(0,0,0,0.5)" />
  <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#e9e2cc" />
  <rect x={-90} y={-h / 2 - 30} width={180} height={60} fill="rgba(230,225,200,0.6)" transform="rotate(4)" />
  <text x={0} y={-h / 2 + 100} textAnchor="middle" fontFamily="Special Elite" fontSize={64} fill="#1d1a14">{title}</text>
  {lines.map((l, i) => { const yy = -h / 2 + 200 + i * ((h - 240) / Math.max(1, lines.length)); const op = clamp(reveal * lines.length - i);
    return <g key={i} opacity={op}>
      {l.glow && <text x={-w / 2 + 50} y={yy} fontFamily="Special Elite" fontSize={l.size || 44} fill={accent} opacity={0.6} style={{filter: 'blur(8px)'}}>{l.txt}</text>}
      <text x={-w / 2 + 50} y={yy} fontFamily="Special Elite" fontSize={l.size || 44} fill={l.glow ? accent : '#1d1a14'}>{l.txt}</text>
      {l.scratch > 0 && Array.from({length: 7}, (_, k) => <path key={k} d={`M${-w / 2 + 40} ${yy - 14 + k * 3 - 8} q ${w * 0.25} ${-18 + rnd(k + i) * 30} ${(w - 80) * l.scratch} ${rnd(k) * 10 - 5}`} stroke="#0d0c0a" strokeWidth={7} fill="none" opacity={0.9} strokeLinecap="round" />)}
      {l.tear && <path d={`M${-w / 2 + 120} ${yy - 4} l 60 -8 l 50 10 l 70 -12 l 40 8`} stroke="#14120d" strokeWidth={4} fill="none" />}
    </g>; })}
</g>;

// CCTV frame overlay (draw last inside a scene, in screen coords if cam is identity)
export const CCTV = ({t, label = 'CAM 02', stamp = '03:00:14', accent = '#ff3b3b', w = 1080, h = 1920}) => <g>
  {Array.from({length: 64}, (_, i) => <rect key={i} x={0} y={i * 30 + ((t * 40) % 30)} width={w} height={3} fill="#fff" opacity={0.035} />)}
  <rect x={30} y={30} width={w - 60} height={h - 60} fill="none" stroke="#e9e4d6" strokeWidth={4} opacity={0.5} />
  <circle cx={90} cy={260} r={14} fill={accent} opacity={Math.sin(t * 6) > 0 ? 1 : 0.2} />
  <text x={120} y={274} fontFamily="Special Elite" fontSize={44} fill="#e9e4d6">REC {label}</text>
  <text x={w - 80} y={274} textAnchor="end" fontFamily="Special Elite" fontSize={44} fill="#e9e4d6">{stamp}</text>
</g>;

// ---------- overlays (DOM) ----------
export const chunkWords = (words, max = 3) => {
  const out = []; let cur = [];
  words.forEach((w, i) => { cur.push({w: w[0], a: w[1], b: w[2], i}); if (cur.length >= max || /[.,!?:;]$/.test(w[0])) { out.push(cur); cur = []; } });
  if (cur.length) out.push(cur); return out;
};
// HUMANE 2026-11-03: overlay captions + hook title use one muted palette per Short (by composition id), not the story's neon accent.
export const NT_PAL = {NTBoothRules: 'sage', NTWishingWell: 'fog-blue', NTElevenCustomers: 'slate', NTFloorZero: 'clay', NTHollowLane: 'lavender', NTSecondVoice: 'sand', NTThirteenSteps: 'dusk-rose', NTRoom414: 'dusty-teal', NTTrailCam: 'stone', NTRouteNine: 'sage', NTVoicemail312: 'stone'};
const ntPal = (id) => PALETTES[NT_PAL[id]] || PALETTES.stone;
export const Captions = ({words, accent, y = 1330, size = 92, hideBefore = 0}) => {
  const f = useCurrentFrame(); const {fps, id} = useVideoConfig(); const T = f / fps; const P = ntPal(id); accent = P.active;
  const ch = React.useMemo(() => chunkWords(words), [words]);
  let k = -1; for (let i = 0; i < ch.length; i++) if (T >= ch[i][0].a - 0.04) k = i;
  if (k < 0 || T < hideBefore) return null; const c = ch[k];
  if (T > c[c.length - 1].b + 0.6 && (!ch[k + 1])) return null;
  const pop = ramp(T, c[0].a - 0.04, c[0].a + 0.08, Easing.out(Easing.back(2)));
  return <div style={{position: 'absolute', top: y - size, left: 70, right: 70, textAlign: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
    {c.map((w) => { const on = T >= w.a - 0.03; const act = T >= w.a - 0.03 && T < w.b + 0.05;
      return <span key={w.i} style={{fontFamily: 'Lilita One', fontSize: size, lineHeight: 1.1, color: act ? accent : P.text, opacity: on ? 1 : 0.0,
        WebkitTextStroke: `14px ${P.ink}`, paintOrder: 'stroke fill', textTransform: 'uppercase', marginRight: 22, display: 'inline-block'}}>{w.w.replace(/[,.:;]$/, '')}</span>; })}
  </div>;
};

export const HookTitle = ({lines, accent, until = 2.8, tag = 'A FICTIONAL STORY'}) => {
  const f = useCurrentFrame(); const {fps, id} = useVideoConfig(); const T = f / fps; const P = ntPal(id); accent = P.active;
  if (T > until + 0.3) return null;
  const out = ramp(T, until, until + 0.3);
  return <div style={{position: 'absolute', top: 200, left: 60, right: 60, textAlign: 'center', opacity: 1 - out, transform: `translateY(${-40 * out}px)`}}>
    <div style={{display: 'inline-block', marginBottom: 14, padding: '6px 20px', border: `4px solid ${accent}`, color: accent, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 30, letterSpacing: 8, background: 'rgba(7,8,12,0.75)'}}>{tag}</div>
    {lines.map((l, i) => { const k = ramp(T, i * 0.12, i * 0.12 + 0.25, Easing.out(Easing.back(2.2)));
      return <div key={i} style={{fontFamily: 'Lilita One', fontSize: l.size || 104, lineHeight: 1.02, color: l.accent ? accent : P.text, WebkitTextStroke: `16px ${P.ink}`, paintOrder: 'stroke fill', transform: `scale(${0.72 + 0.28 * k})`}}>{l.txt}</div>; })}
  </div>;
};

export const ScreenFlash = ({times = [], color = '#ffffff', len = 0.22, max = 0.55}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const T = f / fps;
  let o = 0; times.forEach((a) => { const k = (T - a) / len; if (k >= 0 && k <= 1) o = Math.max(o, max * (k < 0.2 ? k / 0.2 : Math.pow(1 - (k - 0.2) / 0.8, 2))); });
  if (!o) return null; return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${color} 0%, ${color}66 40%, transparent 80%)`, mixBlendMode: 'screen', opacity: o}} />;
};

export const Finish = ({accent, vignette = 0.75, grainSeed = 0}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 45%, transparent 45%, rgba(0,0,0,${vignette}) 100%)`}} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${accent}10 0%, transparent 40%, ${accent}12 100%)`, mixBlendMode: 'screen'}} />
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay'}}>
      <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={(Math.floor(f / 2) + grainSeed) % 50} /></filter>
      <rect width="100%" height="100%" filter="url(#gr)" />
    </svg>
  </AbsoluteFill>;
};

// mouth flap from a per-frame amplitude array, only inside [a,b] seconds
export const mouthAt = (M, f, fps, a, b) => { const T = f / fps; if (!M || T < a || T > b) return 0; return clamp((M[f] || 0) * 1.2); };
