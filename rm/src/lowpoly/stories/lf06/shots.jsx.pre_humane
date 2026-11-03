// LF01 shot components (1920x1080, 24 fps). Overlays: Pill (top-left tag), Big (2-line headline), Sub (word-highlighted subtitles).
import * as THREE from 'three';
import {createContext, useContext, useMemo} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Clouds, FontFaces, Person, Particles, Campfire, clamp01, easeOut, easeInOut, FogLayer} from '../../kit/index.js';
import {Sea, Whitecaps, Storm, Ship, Island, Lighthouse} from '../flannan-isles/world.jsx';
import {Squad, Avenger, Mariner, Schooner, Brig, Joyita, Liner, Lifeboat, Deck, Compass, EmptyBracket, SignalLamp, Derby, Chair, Hatch, Stove, Cat, DoctorBag, Radio, WallClock, Bulb, dirv} from './world.jsx';
import MAPS from './maps.json';

export const FPS = 24;
export const FR = (s) => Math.round(s * FPS);
export const ChCtx = createContext(null);
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9']/g, '');
export const STROKE = (px, c = '#141414') => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});
export const COL = {white: '#ffffff', yellow: '#ffd93b', red: '#ff5a4e', cyan: '#7fe3ff', green: '#9be15d'};

// ------------------------------------------------------------- palettes
const base = {rimPos: [-30, 15, -40]};
export const PAL = {
  day: {top: '#3a78c8', mid: '#78b4e8', hor: '#eaf3ff', fog: '#a8c8e8', amb: 1.1, hemiSky: '#e6f2ff', hemiGround: '#3a6a90', hemiI: 1.4, sun: '#fff0d0', sunI: 2.8, sunPos: [30, 40, 20], rim: '#ffe0b0', rimI: 1.0, rimPos: [-30, 15, -40], glow: 0},
  grey: {top: '#4d6488', mid: '#8fa3c0', hor: '#d8d0c4', fog: '#a9b6c8', amb: 1.15, hemiSky: '#e6eeff', hemiGround: '#55606a', hemiI: 1.4, sun: '#ffe0c0', sunI: 2.4, sunPos: [30, 25, 30], rim: '#ffc0a0', rimI: 1.2, rimPos: [-30, 15, -40], glow: 0},
  dusk: {top: '#2a1a50', mid: '#a04a68', hor: '#ffb060', fog: '#8a4a60', amb: 0.95, hemiSky: '#ffc890', hemiGround: '#3a2a50', hemiI: 1.3, sun: '#ffb070', sunI: 2.6, sunPos: [-40, 8, -30], rim: '#ff8a60', rimI: 2, rimPos: [30, 10, 40], glow: 1},
  night: {top: '#101a4a', mid: '#2a4488', hor: '#6a72c0', fog: '#2a3c78', amb: 0.9, hemiSky: '#a9c0ff', hemiGround: '#242a58', hemiI: 1.35, sun: '#c0d4ff', sunI: 2.4, sunPos: [-25, 40, 25], rim: '#8fe6ff', rimI: 2.2, rimPos: [25, 18, -45], glow: 1},
  storm: {top: '#16205a', mid: '#2f4c9a', hor: '#7d7fd0', fog: '#3a4c8e', amb: 0.95, hemiSky: '#a9c0ff', hemiGround: '#2a3060', hemiI: 1.4, sun: '#c0d4ff', sunI: 2.4, sunPos: [-25, 40, 25], rim: '#8fe6ff', rimI: 2.4, rimPos: [25, 18, -45], glow: 1},
  gale: {top: '#2a3a66', mid: '#56709e', hor: '#c7b7c9', fog: '#7c8aa8', amb: 1.05, hemiSky: '#cfdcff', hemiGround: '#3a4250', hemiI: 1.4, sun: '#e8eeff', sunI: 2.2, sunPos: [-30, 30, 20], rim: '#9fe0ff', rimI: 1.8, rimPos: [30, 15, -40], glow: 0.3},
  room: {top: '#241a12', mid: '#3a2a1c', hor: '#5a4630', fog: '#1a120c', amb: 1.0, hemiSky: '#ffe2b8', hemiGround: '#5a4028', hemiI: 1.4, sun: '#ffd8a0', sunI: 2.2, sunPos: [8, 14, 18], rim: '#ffb060', rimI: 1.4, rimPos: [-15, 10, -20], glow: 1},
  cold: {top: '#0c1420', mid: '#16243a', hor: '#2a3c58', fog: '#0c1624', amb: 0.9, hemiSky: '#b8d0ff', hemiGround: '#20283a', hemiI: 1.3, sun: '#c0d4ff', sunI: 2.0, sunPos: [10, 20, 18], rim: '#7fe3ff', rimI: 1.6, rimPos: [-15, 10, -20], glow: 1},
};
const BG = {
  room: 'radial-gradient(ellipse at 50% 45%, #6b5a48 0%, #2a2018 70%, #120c08 100%)',
  warm: 'radial-gradient(ellipse at 50% 50%, #8a5a2a 0%, #3a2410 60%, #140a04 100%)',
  cold: 'radial-gradient(ellipse at 50% 45%, #2c4468 0%, #101c30 65%, #060a14 100%)',
};

// ------------------------------------------------------------- shared helpers
export const useCh = () => useContext(ChCtx);
export const secOf = (VO, e) => {
  if (e.s !== undefined) return e.s;
  const ls = VO.line_starts[e.l ?? 0];
  if (!e.w) return ls + (e.o || 0);
  const hit = VO.words.find((w) => w[1] >= ls - 0.05 && norm(w[0]).startsWith(norm(e.w)));
  return (hit ? hit[1] : ls) + (e.o || 0);
};
export const relF = (VO, e, startSec) => FR(secOf(VO, e) - startSec);

// ------------------------------------------------------------- overlays
export const Pill = ({text, variant = 'yellow', delay = 0, x = 96, y = 64, size = 38, right = false, legacy = false}) => {
  const slide = legacy ? 200 : 36; // legacy = style of chunks rendered before 2026-10-25 16:15 IST (COLD, CH1 after shot 0, CH2)
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig(); const s = spring({frame: f, fps, config: {damping: 14, stiffness: 170}});
  if (f < 0) return null;
  const bg = {yellow: '#ffd93b', white: '#f4f4f4', red: '#d6302a', dark: '#141414', cyan: '#7fe3ff'}[variant]; const fg = ['red', 'dark'].includes(variant) ? '#fff' : '#141414';
  return <div style={{position: 'absolute', top: y, [right ? 'right' : 'left']: x, padding: '8px 26px 10px', background: bg, color: fg, border: '4px solid #141414', borderRadius: 12, fontFamily: 'Lilita One', fontSize: size, letterSpacing: 2,
    boxShadow: '0 8px 0 rgba(0,0,0,0.35)', transform: `translateX(${(1 - s) * (right ? slide : -slide)}px)`, opacity: clamp01(s * (legacy ? 2 : 1.4))}}>{text}</div>;
};
export const Big = ({lines, y: y0 = 120, size = 112, align = 'center', x = 0}) => {
  const y = y0 < 500 ? Math.max(y0, 125) : y0;
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', top: y, left: x, width: align === 'center' ? '100%' : 1100, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', paddingLeft: align === 'center' ? 0 : 90, gap: 0}}>
    {lines.map((l, i) => { const s = spring({frame: f - i * 6, fps, config: {damping: 12, stiffness: 190}});
      return <div key={i} style={{fontFamily: 'Lilita One', fontSize: l.size || size, color: COL[l.color] || l.color || '#fff', lineHeight: 1.05, textAlign: align, maxWidth: 1760, transform: `translateY(${(1 - s) * -34}px) scale(${0.86 + 0.14 * s})`, opacity: clamp01(s * 1.6),
        ...STROKE(14), textShadow: '0 8px 0 rgba(0,0,0,0.3)', letterSpacing: 1.5}}>{l.text}</div>; })}
  </div></AbsoluteFill>;
};
export const TimedOverlays = ({ents, startSec, endSec, C}) => {
  const {VO} = useCh(); const d = FR(endSec - startSec);
  const items = (ents || []).map((e) => ({...e, f: Math.max(0, relF(VO, e, startSec))})).sort((a, b) => a.f - b.f);
  return <>{items.map((e, i) => { const nxt = items.slice(i + 1).find((q) => q.kind === e.kind); const end = (nxt && !e.keep) ? nxt.f : d;
    return <Sequence key={i} from={e.f} durationInFrames={Math.max(1, end - e.f)}><C e={e} /></Sequence>; })}</>;
};
export const BigE = ({e}) => <Big lines={e.lines} y={e.y ?? 110} size={e.size ?? 112} align={e.align} />;
export const PillE = ({e}) => <Pill text={e.text} variant={e.v} y={e.y ?? (e.legacy ? 48 : 64)} x={e.legacy ? (e.x ?? 60) : Math.max(96, e.x ?? 96)} right={e.right} size={e.size} legacy={e.legacy} />;

/** word-highlighted subtitles, chunks of <= 8 words, bottom third. */
export const Sub = () => {
  const {VO} = useCh(); const f = useCurrentFrame(); const t = f / FPS;
  const chunks = useMemo(() => { const out = []; let cur = [];
    VO.words.forEach((w, i) => { cur.push(w); const end = /[.!?]$/.test(w[0]) || cur.length >= 8 || (/[,;:]$/.test(w[0]) && cur.length >= 4); if (end || i === VO.words.length - 1) { out.push(cur); cur = []; } });
    return out; }, [VO]);
  let ci = -1; for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0][1] - 0.02) ci = i;
  if (ci < 0) return null; const ch = chunks[ci]; const last = ch[ch.length - 1]; const nxt = chunks[ci + 1];
  if (t > last[2] + 0.45 && (!nxt || t < nxt[0][1] - 0.02)) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', bottom: 64, width: '100%', textAlign: 'center', padding: '0 160px', boxSizing: 'border-box'}}>
    <span style={{display: 'inline-block', background: 'rgba(8,10,18,0.55)', borderRadius: 14, padding: '10px 28px 14px'}}>
      {ch.map((w, i) => { const active = t >= w[1] - 0.01 && t <= w[2] + 0.12; const past = t > w[2] + 0.12;
        return <span key={i} style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 52, color: active ? '#ffd93b' : past ? '#ffffff' : 'rgba(255,255,255,0.42)', marginRight: 14, ...STROKE(active ? 9 : 7, '#0a0a12'), display: 'inline-block', transform: active ? 'scale(1.07)' : 'none'}}>{w[0]}</span>; })}
    </span></div></AbsoluteFill>;
};

// ------------------------------------------------------------- generic 3D objects for sea shots
const Obj = ({o, f, d}) => {
  const p = o.p ?? [0, 0, 0]; const v = o.v ?? [0, 0, 0];
  if (o.hide !== undefined && f >= o.hide) return null;
  if (o.show !== undefined && f < o.show) return null;
  const pos = [p[0] + v[0] * f, p[1] + v[1] * f, p[2] + v[2] * f];
  const r = o.r ?? 0;
  switch (o.k) {
    case 'squad': return <Squad position={pos} rotation={r} n={o.n ?? 5} f={f} bank={o.bank ?? 0} scale={o.s ?? 1} gap={o.gap} lights={o.lights} lost={o.lost ?? null} />;
    case 'avenger': return <Avenger position={pos} rotation={r} f={f} bank={o.bank ?? 0} scale={o.s ?? 1} lights={o.lights} />;
    case 'mariner': return <Mariner position={pos} rotation={r} f={f} bank={o.bank ?? 0} pitch={o.pitch ?? 0} scale={o.s ?? 1} />;
    case 'liner': return <Liner position={pos} rotation={r} f={f} {...o.sp} scale={o.s ?? 1} />;
    case 'ship': return <Ship position={pos} rotation={r} frame={f} scale={o.s ?? 1} {...o.sp} />;
    case 'schooner': return <Schooner position={pos} rotation={r} f={f} scale={o.s ?? 1} {...o.sp} />;
    case 'brig': return <Brig position={pos} rotation={r} f={f} scale={o.s ?? 1} {...o.sp} />;
    case 'joyita': return <Joyita position={pos} rotation={r} f={f} scale={o.s ?? 1.35} {...o.sp} />;
    case 'lifeboat': return <Lifeboat position={pos} rotation={r} f={f} scale={o.s ?? 1} />;
    case 'person': return <Person position={pos} rotation={r} scale={o.s ?? 0.62} pose={o.pose ?? 'stand'} phase={f / (o.pose === 'walk' ? 4 : 9) + (o.ph ?? 0)} {...o.sp} />;
    case 'fire': return <Campfire position={pos} frame={f} scale={o.s ?? 3} />;
    case 'glow': return <Glow position={pos} size={o.size ?? 6} color={o.color ?? '#ffb060'} opacity={o.op ?? 0.8} />;
    case 'slick': return <mesh position={[pos[0], 0.06, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[o.size ?? 8, 18]} /><meshBasicMaterial color="#05060a" transparent opacity={0.75} /></mesh>;
    case 'rock': return <group position={pos}><mesh position={[0, (o.h ?? 14) / 2 - 1, 0]} scale={[o.w ?? 12, o.h ?? 14, o.w ?? 12]}><dodecahedronGeometry args={[0.6, 0]} /><meshLambertMaterial color="#8a8478" flatShading /></mesh>
      <mesh position={[(o.w ?? 12) * 0.35, (o.h ?? 14) * 0.25, 2]} scale={[(o.w ?? 12) * 0.7, (o.h ?? 14) * 0.5, (o.w ?? 12) * 0.7]}><dodecahedronGeometry args={[0.6, 0]} /><meshLambertMaterial color="#6f6a60" flatShading /></mesh></group>;
    case 'barrels': return <group position={pos}>{Array.from({length: o.n ?? 8}, (_, i) => <mesh key={i} position={[(i % 4) * 0.8 - 1.2, 0.4 + Math.floor(i / 4) * 0.8, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.38, 0.38, 0.7, 9]} /><meshLambertMaterial color="#8a5a32" flatShading /></mesh>)}</group>;
    case 'orb': return <Orb position={pos} radius={o.size ?? 5} color={o.color ?? '#ffd090'} />;
    case 'shoal': return <group position={pos}>{Array.from({length: 14}, (_, i) => <sprite key={i} position={[(i - 7) * 2.6, 0.5, Math.sin(i * 2.3) * 3]} scale={[4 + Math.sin(f * 0.2 + i) * 1.2, 1.3, 1]}><spriteMaterial color="#f4f8ff" transparent opacity={0.75} depthWrite={false} /></sprite>)}</group>;
    default: return null;
  }
};

export const SeaShot = ({pal = 'day', objs = [], cam, orbit, amp = 0.6, sea = '#2f63a8', rain = 0, wind = 0, slant = 0.4, stars = 0, moon = false, clouds = null, fog = [50, 260], flash = [], big, pill, startSec, endSec, shake = 0, seaOff = 0, birds = false, mist = 0, sunset = null, extra = null}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec);
  const keys = cam ? cam.map((k) => ({...k, f: Math.round(k.t * d)})) : null;
  const flashO = flash.reduce((a, x) => { const g = FR(x); return f >= g && f < g + 7 ? Math.max(a, 0.6 * (1 - (f - g) / 7)) : a; }, 0);
  return <Stage palette={PAL[pal]} fog={fog} overlay={<>
    <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
    {flashO > 0 && <AbsoluteFill style={{background: '#e8f0ff', opacity: flashO, mixBlendMode: 'screen'}} />}
  </>}>
    {keys ? <CameraRig keys={keys} shake={shake} shakeFrom={0} shakeLen={d} /> : <CameraRig orbit={{...orbit, start: 0, end: d}} />}
    {stars > 0 && <Stars opacity={stars} count={160} />}
    {moon && <><Orb position={[-70, 60, -120]} radius={4.5} color="#fbf6dc" /><Glow position={[-70, 60, -119]} size={38} color="#9fc0ff" opacity={0.5} /></>}
    {clouds && <Clouds frame={f + seaOff} y={32} color={clouds} opacity={0.95} speed={0.12} count={10} seed={5} />}
    <Sea frame={f + seaOff} color={sea} amp={amp} spec="#b8cce8" /><Whitecaps frame={f + seaOff} count={amp > 0.8 ? 90 : 50} area={140} opacity={0.65} seed={7} />
    {rain > 0 && <Storm frame={f} center={[0, 0, 0]} area={60} rain={rain} wind={wind} slant={slant} count={300} />}
    {mist > 0 && <FogLayer y={1.2} size={160} layers={4} thickness={3} color="#c8d4e8" opacity={mist} frame={f} />}
    {objs.map((o, i) => <Obj key={i} o={o} f={f} d={d} />)}
    {extra}
  </Stage>;
};

// ------------------------------------------------------------- prop close-up shot (dark room)
const PROP = {
  compass: (f, p) => <Compass f={f} mad={p.mad ?? 1} />,
  bracket: () => <EmptyBracket />,
  lamp: (f) => <SignalLamp f={f} />,
  hat: (f) => <group><Chair position={[0, 0, 0]} rot={0.2} /><Derby position={[0.1, 1.12, 0.05]} rot={0.4} /></group>,
  hatch: (f) => <Hatch f={f} />,
  stove: (f) => <group><Stove f={f} /><Cat position={[-2.2, 0, 1.8]} rot={0.6} f={f} /><Cat position={[2.4, 0, 2.0]} rot={-0.8} f={f + 9} /><Cat position={[0.2, 0, 2.9]} rot={3.0} f={f + 4} /></group>,
  bag: (f) => <DoctorBag f={f} />,
  radio: (f) => <Radio f={f} />,
  clock: (f) => <group><WallClock f={f} /><Bulb position={[0, 2.9, 0.6]} f={f} /></group>,
};
export const PropShot = ({prop, bg = 'room', pal = 'room', cam, orbit, floor = '#4a3623', big, pill, startSec, endSec, dust = true, pp = {}, light = '#ffd8a0', lightI = 14, fogC = null}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec);
  const keys = cam ? cam.map((k) => ({...k, f: Math.round(k.t * d)})) : null;
  return <Stage palette={PAL[pal]} fog={[10, 60]} background={BG[bg]} overlay={<>
    <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
  </>}>
    {keys ? <CameraRig keys={keys} drift={0.05} /> : <CameraRig orbit={{...orbit, start: 0, end: d}} drift={0.04} />}
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[14, 28]} /><meshLambertMaterial color={floor} flatShading /></mesh>
    <pointLight position={[2, 7, 4]} color={light} intensity={lightI} distance={28} decay={1.4} />
    {PROP[prop](f, pp)}
    {dust && <Particles kind="dust" count={90} center={[0, 3, 0]} area={[10, 6, 10]} frame={f} />}
  </Stage>;
};

// ------------------------------------------------------------- 2D shots
export const MapShot = ({id, route = [], marks = [], show = [], startSec, endSec, big, pill, zoom = [1.0, 1.08], focus = [960, 540], routeAt = 0.5, routeEnd = 0.9}) => {
  const {VO} = useCh(); const f = useCurrentFrame(); const {fps} = useVideoConfig(); const d = FR(endSec - startSec); const M = MAPS[id];
  const P = (n) => (typeof n === 'string' ? M.pts[n] : n);
  const pts = route.map(P);
  const poly = useMemo(() => { const out = [[...pts[0]]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1]; const c = [(a[0] + b[0]) / 2 - dy * 0.12, (a[1] + b[1]) / 2 + dx * 0.12];
    for (let k = 1; k <= 40; k++) { const t = k / 40; out.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); } } return out; }, [JSON.stringify(pts)]);
  const lens = useMemo(() => { const L = [0]; for (let i = 1; i < poly.length; i++) L.push(L[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1])); return L; }, [poly]);
  const total = lens[lens.length - 1]; const prog = easeInOut(clamp01((f - d * 0.08) / (d * routeEnd - d * 0.08)));
  const upto = total * prog; let idx = lens.findIndex((l) => l >= upto); if (idx < 0) idx = poly.length - 1;
  const drawn = poly.slice(0, idx + 1); const head = poly[idx];
  const z = zoom[0] + (zoom[1] - zoom[0]) * clamp01(f / d);
  const s = spring({frame: f, fps, config: {damping: 16, stiffness: 120}});
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #123456 0%, #08182c 80%)'}}>
    <AbsoluteFill style={{transform: `scale(${z}) translate(${(960 - focus[0]) * (z - 1)}px, ${(540 - focus[1]) * (z - 1)}px)`, opacity: s}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 13}, (_, i) => <line key={'v' + i} x1={i * 160} y1={0} x2={i * 160} y2={1080} stroke="#1e4366" strokeWidth={1} opacity={0.5} />)}
        {Array.from({length: 8}, (_, i) => <line key={'h' + i} x1={0} y1={i * 160} x2={1920} y2={i * 160} stroke="#1e4366" strokeWidth={1} opacity={0.5} />)}
        <path d={M.d} fill="#27465c" stroke="#7fc0dd" strokeWidth={2.5} strokeLinejoin="round" />
        {drawn.length > 1 && <polyline points={drawn.map((p) => p.join(',')).join(' ')} fill="none" stroke="#ffd93b" strokeWidth={8} strokeDasharray="22 14" strokeLinecap="round" />}
        {show.map((n) => { const p = M.pts[n]; return <g key={n}><circle cx={p[0]} cy={p[1]} r={13} fill="#ffd93b" stroke="#141414" strokeWidth={4} />
          <text x={p[0] + 24} y={p[1] + 10} fontFamily="Lilita One" fontSize={38} fill="#fff" stroke="#141414" strokeWidth={9} paintOrder="stroke" letterSpacing={2}>{n}</text></g>; })}
        {marks.map((m, i) => { const p = P(m.at); const t = relF(VO, m, startSec); if (f < t) return null; const k = spring({frame: f - t, fps, config: {damping: 10, stiffness: 160}});
          return <g key={i} transform={`translate(${p[0]},${p[1]}) scale(${k})`}><circle r={m.r ?? 46} fill="none" stroke={m.color ?? '#ff5a4e'} strokeWidth={8} />{m.cross && <><line x1={-26} y1={-26} x2={26} y2={26} stroke={m.color ?? '#ff5a4e'} strokeWidth={9} /><line x1={26} y1={-26} x2={-26} y2={26} stroke={m.color ?? '#ff5a4e'} strokeWidth={9} /></>}
            {m.text && <text x={m.dx ?? 0} y={m.dy ?? -70} textAnchor="middle" fontFamily="Lilita One" fontSize={m.size ?? 40} fill={m.color ?? '#ff5a4e'} stroke="#141414" strokeWidth={9} paintOrder="stroke" letterSpacing={2}>{m.text}</text>}</g>; })}
        {head && drawn.length > 1 && <circle cx={head[0]} cy={head[1]} r={15} fill="#ff5a4e" stroke="#fff" strokeWidth={5} />}
      </svg>
    </AbsoluteFill>
    <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
  </AbsoluteFill>;
};

export const ArchShot = ({src, credit, startSec, endSec, big, pill, w = 1100, h = 620, lowres = false, rot = -1.2, tint = '#0a0f22', tag}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const d = FR(endSec - startSec); const s = spring({frame: f, fps, config: {damping: 15, stiffness: 150}}); const t = clamp01(f / d);
  const cw = lowres ? 820 : w, ch = h; const z = 1.03 + 0.12 * t;
  return <AbsoluteFill style={{background: tint}}>
    <Img src={staticFile(src)} style={{position: 'absolute', inset: -40, width: 2000, height: 1160, objectFit: 'cover', filter: 'blur(26px) brightness(0.45) saturate(1.2)'}} />
    <div style={{position: 'absolute', left: (1920 - cw) / 2, top: 270, width: cw, height: ch, background: '#f1ece0', padding: 16, paddingBottom: 64, boxSizing: 'border-box', borderRadius: 8,
      transform: `translateY(${(1 - s) * 220}px) rotate(${rot * s}deg) scale(${0.9 + 0.1 * s})`, opacity: s, boxShadow: '0 40px 80px rgba(0,0,0,0.65)'}}>
      <div style={{width: '100%', height: '100%', overflow: 'hidden', borderRadius: 4}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: lowres ? 'contain' : 'cover', background: '#222', transform: `scale(${z}) translateX(${-14 + 28 * t}px)`, filter: 'contrast(1.06) saturate(0.9) sepia(0.12)'}} />
      </div>
      <div style={{position: 'absolute', bottom: 14, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 25, color: '#3a3a3a'}}>{credit}</div>
    </div>
    <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
  </AbsoluteFill>;
};

export const QuoteShot = ({head, lines, source, stamp, startSec, endSec, big, pill, hi = [], size = 58, bg = 'radial-gradient(ellipse at 50% 40%, #2a2f44 0%, #0a0c16 85%)', stampAt}) => {
  const {VO} = useCh(); const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f, fps, config: {damping: 15, stiffness: 140}});
  const st = stampAt ? Math.max(0, relF(VO, stampAt, startSec)) : null; const ss = st !== null && f >= st ? spring({frame: f - st, fps, config: {damping: 8, stiffness: 220}, from: 2.2, to: 1}) : 0;
  const shown = Math.floor(clamp01(f / (FPS * 2.2)) * lines.join('\n').length); let used = 0;
  return <AbsoluteFill style={{background: bg}}>
    <div style={{position: 'absolute', left: 260, top: 250, width: 1400, background: 'linear-gradient(180deg,#f3ead2,#e2d4ae)', borderRadius: 8, padding: '46px 70px 40px', boxSizing: 'border-box', transform: `rotate(${-0.8 * s}deg) translateY(${(1 - s) * 140}px)`, opacity: s, boxShadow: '0 30px 70px rgba(0,0,0,0.7)', border: '3px solid #b9a678'}}>
      {head && <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 34, letterSpacing: 3, color: '#7a2a20', marginBottom: 16}}>{head}</div>}
      {lines.map((l, i) => { const vis = l.slice(0, Math.max(0, shown - used)); used += l.length + 1; return <div key={i} style={{fontFamily: 'Special Elite', fontSize: size, lineHeight: 1.22, color: hi.includes(i) ? '#9a1d14' : '#2a2116', minHeight: size * 1.22}}>{vis}</div>; })}
      {source && <div style={{marginTop: 20, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 28, color: '#5a4a30', letterSpacing: 1}}>{source}</div>}
    </div>
    {ss > 0 && <div style={{position: 'absolute', right: 230, bottom: 170, transform: `rotate(-9deg) scale(${ss})`, border: '10px solid #d6302a', color: '#d6302a', fontFamily: 'Lilita One', fontSize: 110, padding: '2px 34px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', letterSpacing: 4}}>{stamp}</div>}
    <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
  </AbsoluteFill>;
};

/** checklist: rows revealed by word cues; used for the three-ship instruments callback and the outro. */
export const CheckShot = ({title, rows, startSec, endSec, big, pill}) => {
  const {VO} = useCh(); const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1a2a44 0%, #060a14 85%)'}}>
    <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 78, color: '#ffd93b', ...STROKE(12), letterSpacing: 3}}>{title}</div>
    {rows.map((r, i) => { const t = Math.max(0, relF(VO, r, startSec)); if (f < t) return null; const s = spring({frame: f - t, fps, config: {damping: 12, stiffness: 170}});
      return <div key={i} style={{position: 'absolute', top: 290 + i * 190, left: 280, width: 1360, height: 150, background: '#f3ead2', border: '6px solid #141414', borderRadius: 18, display: 'flex', alignItems: 'center', padding: '0 46px', boxSizing: 'border-box',
        transform: `translateX(${(1 - s) * -900}px)`, boxShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>
        <div style={{fontFamily: 'Lilita One', fontSize: 64, color: '#141414', flex: 1, letterSpacing: 2}}>{r.name}</div>
        <div style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 36, color: '#5a4a30', marginRight: 36}}>{r.what}</div>
        <div style={{fontFamily: 'Lilita One', fontSize: 100, color: '#d6302a', transform: `scale(${spring({frame: f - t - 8, fps, config: {damping: 8, stiffness: 220}, from: 2, to: 1})})`, opacity: f - t > 8 ? 1 : 0}}>✗</div>
      </div>; })}
    <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
  </AbsoluteFill>;
};

export const TeaserShot = ({startSec, endSec, number = 1746, label = 'PEOPLE KILLED IN ONE NIGHT', sub, big, pill, subscribeAt}) => {
  const {VO} = useCh(); const f = useCurrentFrame(); const {fps} = useVideoConfig(); const d = FR(endSec - startSec);
  const n = Math.round(number * easeOut(clamp01(f / (d * 0.55)))); const sb = subscribeAt ? Math.max(0, relF(VO, subscribeAt, startSec)) : d + 1;
  const sp = f >= sb ? spring({frame: f - sb, fps, config: {damping: 10, stiffness: 150}}) : 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1e3a2a 0%, #060c0a 85%)'}}>
    <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 62, color: '#9be15d', ...STROKE(10), letterSpacing: 4}}>NEXT TIME · LF02</div>
    <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 330, color: '#fff', ...STROKE(18), lineHeight: 1}}>{n.toLocaleString('en-US')}</div>
    <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 78, color: '#ffd93b', ...STROKE(12), letterSpacing: 3}}>{label}</div>
    {sub && <div style={{position: 'absolute', top: 680, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 44, color: '#d8e6dc', ...STROKE(8)}}>{sub}</div>}
    {sp > 0 && <div style={{position: 'absolute', left: 660, top: 770, width: 600, height: 120, background: '#d6302a', border: '6px solid #141414', borderRadius: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One', fontSize: 62, color: '#fff', letterSpacing: 3, transform: `scale(${sp})`}}>▶ SUBSCRIBE</div>}
    <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
  </AbsoluteFill>;
};
