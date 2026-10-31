import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Smoke, Clouds, Birds, Glow, Fireflies,
  Terrain, makeHeight, Tree, PALETTES, mixPalette, clamp01, easeOut, easeInOut, rng, COLORS} from '../../kit/index.js';
import {Person, Ghost} from './Chars.jsx';
import {Town, HOUSES, TROFFEA_HOUSE, Dancers, DANCER_SPOTS, LOOKS, TROFFEA, DOCTOR, MiniCrowd, Bubble, popT, Notes, Confetti, Footprints, Chapel, Torch, Chicken, Stall, HalfTimber, Ground} from './world.jsx';
import VO from './vo.json';

const FPS = 30;
const LS = VO.line_starts.map((s) => Math.round(s * FPS));
export const DANCING_FRAMES = Math.round((VO.dur + 1.7) * FPS);
const W = VO.words;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// absolute frame of the first word starting with txt at/after line `fromLine`
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && norm(x[0]).startsWith(txt)); return w ? Math.round(w[1] * FPS) : LS[fromLine]; };
const frz = (f, a, b) => (f < a ? f : f < b ? a : f - (b - a)); // freeze-frame remap

// custom palettes
const DREAD = {top: '#12060c', mid: '#3a0d1e', hor: '#7a1d2a', fog: '#2a0a14', amb: 0.45, hemiSky: '#ff7a6a', hemiGround: '#1a0508', hemiI: 0.9, sun: '#ff8a6a', sunI: 1.3, sunPos: [-20, 30, 10], rim: '#ff3a3a', rimI: 2.2, rimPos: [25, 18, -45], glow: 1};
const DAY = PALETTES.day;
const DOOR = (() => { const h = TROFFEA_HOUSE; const cols = Math.max(2, Math.round(h.w / 1.5)); return {x: h.x - h.w / 2 + (h.w / cols) * (Math.floor(cols / 2) + 0.5), z: h.z + 2.1}; })();

// ---------- DOM helpers ----------
const STROKE = (px, c = '#141414') => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});
/** Deadpan museum-style label card ("FIG. 1"). Snaps in on `at` (frame within the scene). */
const Label = ({at = 0, y = 660, fig, text, sub, color = '#ffffff', rot = -1.5, icon}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null;
  const s = f < 3 ? 1.25 - f * 0.08 : 1; const o = clamp01(f / 2);
  return <div style={{position: 'absolute', top: y, left: '50%', transform: `translateX(-50%) rotate(${rot}deg) scale(${s})`, opacity: o, background: color, border: '6px solid #141414',
    borderRadius: 10, padding: '14px 30px 16px', boxShadow: '10px 10px 0 rgba(0,0,0,0.45)', textAlign: 'center', minWidth: 520}}>
    {fig && <div style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 30, color: '#6a6a6a', letterSpacing: 4}}>{fig}</div>}
    <div style={{fontFamily: 'Lilita One', fontSize: 58, color: '#141414', letterSpacing: 1.5, lineHeight: 1.05, whiteSpace: 'nowrap'}}>{icon}{text}</div>
    {sub && <div style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 34, color: '#d6302a', marginTop: 4, letterSpacing: 1}}>{sub}</div>}
  </div>;
};
const NoNote = () => <svg width="62" height="62" viewBox="0 0 64 64" style={{verticalAlign: '-8px', marginRight: 14}}>
  <ellipse cx="22" cy="46" rx="11" ry="8" fill="#141414" /><rect x="30" y="10" width="5" height="38" fill="#141414" /><rect x="30" y="10" width="20" height="6" fill="#141414" />
  <circle cx="32" cy="32" r="28" fill="none" stroke="#d6302a" strokeWidth="6" /><line x1="12" y1="12" x2="52" y2="52" stroke="#d6302a" strokeWidth="6" /></svg>;
/** 2D comic punch-zoom + freeze look wrapper. zoom: [{f, s, ox, oy}] keyframes (snappy). freeze [a,b] -> desaturate + flash. */
const Punch = ({children, keys = [], freeze, flashAt = []}) => {
  const f = useCurrentFrame(); let s = 1, ox = 50, oy = 50;
  for (const k of keys) { if (f >= k.f) { const t = easeOut(clamp01((f - k.f) / (k.d || 4))); s = (k.from ?? s) + (k.s - (k.from ?? s)) * t; ox = k.ox ?? ox; oy = k.oy ?? oy; } }
  const fr = freeze && f >= freeze[0] && f < freeze[1];
  const flash = Math.max(0, ...flashAt.map((a) => (f >= a && f < a + 4 ? 1 - (f - a) / 4 : 0)));
  return <AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${ox}% ${oy}%`, filter: fr ? 'saturate(0.25) contrast(1.15) brightness(1.05)' : 'none'}}>{children}</AbsoluteFill>
    {fr && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 100%)'}} />}
    {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.8}} />}
  </AbsoluteFill>;
};
const Counter = ({value, label, y = 560, color = COLORS.yellow}) => <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center'}}>
  <span style={{fontFamily: 'Lilita One', fontSize: 150, color, ...STROKE(16), textShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>{value}</span>
  {label && <div style={{fontFamily: 'Lilita One', fontSize: 52, color: '#fff', ...STROKE(10), marginTop: -16, letterSpacing: 3}}>{label}</div>}
</div>;

const DayTown = (p) => <><Clouds frame={p.frame} y={26} count={9} speed={0.08} /><Birds center={[0, 16, -10]} radius={16} frame={p.frame} count={7} /><Town {...p} /></>;

// ---------- S0: hook ----------
const S0 = () => {
  const f = useCurrentFrame(); const tD = wordAt('dancing', 0) - LS[0];
  return <Punch keys={[{f: tD, s: 1.32, from: 1, ox: 50, oy: 52, d: 4}]} flashAt={[tD]}>
    <Stage palette="day" fog={[45, 190]} overlay={<>
      <Pill text="STRASBOURG · 1518" y={236} variant="yellow" delay={-12} />
      <Headline y={318} lines={[{text: 'THE PLAGUE', color: 'white', size: 100}, {text: 'OF DANCING', color: 'yellow', size: 116}]} delay={-14} />
    </>}>
      <CameraRig keys={[{f: 0, pos: [0, 6.5, 24], look: [0, 2.2, 0], fov: 50}, {f: 179, pos: [1.5, 4.2, 15], look: [0, 1.8, 0], fov: 48}]} />
      <DayTown frame={f} panic={1} />
      <Dancers frame={f} n={22} energy={1} />
      <Person position={[0, 0, 1.8]} rotation={0} pose="dance" style={1} phase={f / 3.5} {...TROFFEA} expr="happy" />
    </Stage>
    {f >= tD && <Label at={tD} y={680} fig="SYMPTOMS:" text="1. DANCING" sub="(THAT'S IT)" />}
  </Punch>;
};

// ---------- S1: Frau Troffea steps outside ----------
const S1 = () => {
  const f = useCurrentFrame(); const base = LS[1]; const tName = wordAt('troffea', 1) - base; const tDance = wordAt('dance', 1) - base; const tOut = wordAt('stepped', 1) - base;
  const walkT = clamp01((f - tOut) / 40); const tz = DOOR.z - 0.2 + walkT * 2.6; const dancing = f >= tDance;
  const pb = (i) => { const x = -7 + i * 2 + f * 0.05 * (i ? -1 : 1) + (i ? 11 : 0); return x; };
  return <Stage palette="day" fog={[45, 190]} overlay={<>
    <Pill text="JULY 1518" y={236} variant="white" delay={2} />
    {f >= tName && <Pill text="FRAU TROFFEA" y={330} variant="yellow" delay={tName} size={56} />}
    {f >= tName && <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 34, color: '#fff', ...STROKE(7), opacity: clamp01((f - tName - 6) / 6)}}>local resident · no prior dancing record</div>}
  </>}>
    <CameraRig keys={[{f: 0, pos: [DOOR.x + 4.5, 3.4, DOOR.z + 10], look: [DOOR.x, 1.7, DOOR.z], fov: 46}, {f: tDance, pos: [DOOR.x + 2.6, 2.6, DOOR.z + 8], look: [DOOR.x, 1.4, DOOR.z + 2.4], fov: 44}, {f: 175, pos: [DOOR.x + 2.0, 2.5, DOOR.z + 7.4], look: [DOOR.x, 1.4, DOOR.z + 2.4], fov: 46}]} />
    <DayTown frame={f} />
    <Person position={[DOOR.x, 0, tz]} rotation={0} pose={dancing ? 'dance' : walkT > 0 && walkT < 1 ? 'walk' : 'stand'} style={3} energy={dancing ? clamp01((f - tDance) / 6) : 0} phase={dancing ? f / 3 : f / 5} {...TROFFEA} expr={dancing ? 'shock' : 'open'} />
    {[0, 1].map((i) => { const x = DOOR.x + (i ? 5.5 - f * 0.045 : -6 + f * 0.05); const z = DOOR.z + 4.2 + i * 1.3; const surprised = f >= tDance + 4;
      return <group key={i}><Person position={[x, 0, z]} rotation={i ? -Math.PI / 2 : Math.PI / 2} pose={surprised ? 'jump' : 'walk'} fallT={surprised ? clamp01((f - tDance - 4) / 14) : 0} phase={f / 5 + i} {...LOOKS[i + 2]} expr={surprised ? 'shock' : 'open'} scale={0.95} />
        <Bubble position={[x, 2.9, z]} text={i ? '?!' : '?'} pop={popT(f - tDance - 6 - i * 3)} size={1.15} /></group>; })}
    <Chicken position={[DOOR.x - 2, 0, DOOR.z + 3]} frame={f} seed={4} panic={dancing ? 1 : 0} path={1.2} />
  </Stage>;
};

// ---------- S2: no music (freeze) + could not stop ----------
const S2 = () => {
  const f = useCurrentFrame(); const base = LS[2]; const tStop = LS[3] - base; const fe = frz(f, 4, tStop);
  return <Punch keys={[{f: 4, s: 1.15, from: 1, ox: 50, oy: 62, d: 3}, {f: tStop, s: 1, d: 6}]} freeze={[4, tStop]} flashAt={[4]}>
    <Stage palette="day" fog={[45, 190]} overlay={null}>
      <CameraRig keys={[{f: 0, pos: [DOOR.x + 2.2, 2.9, DOOR.z + 10.5], look: [DOOR.x, 1.5, DOOR.z + 2.4], fov: 46}, {f: 120, pos: [DOOR.x - 1.4, 2.6, DOOR.z + 9.5], look: [DOOR.x, 1.4, DOOR.z + 2.4], fov: 44}]} drift={f >= 4 && f < tStop ? 0 : 0.18} />
      <DayTown frame={fe} />
      <Person position={[DOOR.x, 0, DOOR.z + 2.4]} rotation={Math.sin(fe * 0.05) * 0.6} pose="dance" style={f < tStop ? 1 : 3} energy={1} phase={fe / (f < tStop ? 3 : 2.2)} {...TROFFEA} expr={f < tStop ? 'shock' : 'tired'} />
      {/* neighbour slowly backing away */}
      <Person position={[DOOR.x + 2.2 + Math.max(0, fe - tStop + 4) * 0.035, 0, DOOR.z + 3.6]} rotation={-Math.PI / 2 + 0.3} pose={f > tStop ? 'walk' : 'stand'} phase={fe / 7} {...LOOKS[4]} expr="shock" scale={0.95} />
      <Bubble position={[DOOR.x + 2.2 + Math.max(0, fe - tStop + 4) * 0.035, 2.9, DOOR.z + 3.6]} text="..." pop={popT(f - tStop - 10)} size={1.0} />
    </Stage>
    {f >= 4 && f < tStop && <Label at={4} y={290} fig="FIG. 1 · THE SOUNDTRACK" text="MUSIC: NONE" icon={<NoNote />} />}
  </Punch>;
};

// ---------- S3: a week passes, neighbours join ----------
const S3 = () => {
  const f = useCurrentFrame(); const base = LS[4]; const d = LS[5] - base; const tJoin = wordAt('joined', 4) - base;
  const cyc = (f / d) * 3; const night = 0.5 - 0.5 * Math.cos(cyc * Math.PI * 2); const pal = mixPalette('day', 'night', night * 0.92);
  const day = Math.min(6, 1 + Math.floor(cyc * 2));
  const join = (i) => clamp01((f - (tJoin - 40) - i * 6) / 6);
  const sunA = cyc * Math.PI * 2;
  return <Stage palette={pal} fog={[45, 190]} overlay={<>
    <Counter value={`DAY ${day}`} y={250} />
    {f >= tJoin && <Pill text="NEIGHBOURS: JOINED IN" y={500} variant="red" delay={tJoin} size={44} />}
  </>}>
    <CameraRig orbit={{center: [0, 0, 1], radius: 15, height: 6, from: -0.5, to: 0.5, start: 0, end: d, lookY: 1.8, fov: 48}} />
    <Orb position={[Math.sin(sunA) * 70, Math.cos(sunA) * 50 + 10, -90]} radius={5} color="#fff3a0" />
    <Orb position={[-Math.sin(sunA) * 70, -Math.cos(sunA) * 50 + 10, -90]} radius={3.5} color="#e8f0ff" />
    {night > 0.5 && <Stars opacity={(night - 0.5) * 2} />}
    <Town frame={f * 3} lit={night > 0.55 ? 0.7 : 0} />
    <Person position={[0, 0, 1]} rotation={f * 0.05} pose="dance" style={3} energy={1 - night * 0.3} phase={f / 2.5} {...TROFFEA} expr={night > 0.6 ? 'tired' : 'shock'} />
    {DANCER_SPOTS.slice(0, 10).map((sp, i) => { const j = join(i); const L = LOOKS[sp.look]; const x = sp.x * 0.6, z = sp.z * 0.6 + 0.5;
      return <group key={i}><Person position={[x, 0, z]} rotation={Math.atan2(-x, 1 - z)} pose={j > 0 ? 'dance' : 'stand'} style={sp.style} energy={j} phase={f / 3 + sp.ph} {...L} expr={j > 0 ? 'happy' : 'shock'} scale={0.85} />
        <Bubble position={[x, 2.5, z]} text="!" pop={j > 0 ? 0 : popT(f - (tJoin - 52) - i * 6)} size={0.9} /></group>; })}
  </Stage>;
};

// ---------- S4: doctors diagnose hot blood ----------
const S4 = () => {
  const f = useCurrentFrame(); const base = LS[5]; const d = LS[6] - base; const tHot = wordAt('hot', 5) - base; const tStud = wordAt('studied', 5) - base;
  const steam = clamp01((f - tHot) / 8);
  return <Stage palette="day" fog={[45, 190]} overlay={<>
    <Pill text="EXPERT OPINION · 1518" y={236} variant="white" delay={2} />
    {f >= tStud && <Headline y={318} lines={[{text: 'CAREFUL STUDY', color: 'white', size: 86}]} delay={tStud} />}
    {f >= tHot && <Label at={tHot} y={440} fig="OFFICIAL DIAGNOSIS" text="HOT BLOOD" sub="(SHE WAS FINE OTHERWISE)" color="#fff1d6" rot={1.5} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 2.8, 10.5], look: [0, 1.3, 0.4], fov: 46}, {f: d, pos: [0.5, 2.5, 8.6], look: [0, 1.3, 0.4], fov: 44}]} />
    <DayTown frame={f} />
    <Person position={[0, 0, 0]} rotation={Math.sin(f * 0.07) * 0.5} pose="dance" style={0} phase={f / 3} {...TROFFEA} expr="tired" />
    {[-1, 1].map((s) => <group key={s}><Person position={[s * 1.15, 0, 1.0]} rotation={-s * 0.9} pose={s < 0 ? 'point' : 'stand'} phase={f / 6 + s} {...DOCTOR} expr="open" />
      {/* scroll/book */}{s > 0 && <mesh position={[s * 1.15 - 0.2, 1.15, 1.35]} rotation={[0.4, -s * 0.9, 0]}><boxGeometry args={[0.5, 0.06, 0.38]} /><meshLambertMaterial color="#f4e2b0" /></mesh>}</group>)}
    {steam > 0 && <Smoke position={[0, 2.3, 0]} frame={f * 2} count={12} height={2.5} color="#ff6a3a" opacity={0.55 * steam} size={0.8} wind={[0, 0, 0]} />}
    {steam > 0 && <Glow position={[0, 1.6, 0.2]} size={3.5 * steam} color="#ff4a2a" opacity={0.45} />}
  </Stage>;
};

// ---------- S5: "Their cure?" ... "More dancing." ----------
const S5 = () => {
  const f = useCurrentFrame(); const base = LS[6]; const tMore = LS[7] - base; const d = LS[8] - base;
  const after = f >= tMore;
  return <Punch keys={[{f: 0, s: 1, from: 1}, {f: tMore, s: 1.08, from: 1.25, ox: 50, oy: 45, d: 5}]} flashAt={[tMore]}>
    <Stage palette="day" fog={[45, 190]} overlay={<>
      {after && <Headline y={300} lines={[{text: 'THE CURE:', color: 'white', size: 80}, {text: 'MORE DANCING', color: 'yellow', size: 118}]} delay={tMore} stagger={5} />}
    </>}>
      {after
        ? <CameraRig keys={[{f: 0, pos: [0, 3.2, 10], look: [0, 1.5, 0], fov: 50}, {f: d, pos: [0, 3.6, 12], look: [0, 1.6, 0], fov: 50}]} shake={0.25} shakeFrom={tMore} shakeLen={12} />
        : <CameraRig keys={[{f: 0, pos: [-0.2, 2.25, 5.4], look: [-1.15, 2.05, 1.0], fov: 40}, {f: tMore, pos: [-0.35, 2.25, 4.4], look: [-1.15, 2.1, 1.0], fov: 32}]} drift={0.04} />}
      <DayTown frame={f} />
      <Person position={[0, 0, 0]} pose="dance" style={1} phase={f / 2.6} {...TROFFEA} expr={after ? 'shock' : 'tired'} />
      <Person position={[-1.15, 0, 1.0]} rotation={after ? 0 : 0.5} pose={after ? 'jump' : 'point'} fallT={after ? clamp01((f - tMore) / 16) : 0} phase={f / 6} {...DOCTOR} expr={after ? 'happy' : 'open'} />
      <Person position={[1.15, 0, 1.0]} rotation={after ? 0 : -0.9} pose={after ? 'jump' : 'stand'} fallT={after ? clamp01((f - tMore - 3) / 16) : 0} phase={f / 6} {...DOCTOR} expr={after ? 'happy' : 'open'} />
      {after && <Confetti origin={[0, 3.5, 0.5]} frame={f - tMore} count={90} />}
      {after && <Notes position={[0, 2.2, 0]} frame={f} count={7} spread={3} height={4} />}
    </Stage>
  </Punch>;
};

// ---------- S6: halls, band, strong men ----------
const Band = ({f, frozen = false, flee = 0}) => { const fe = frozen ? 0 : f; return <group position={[0, 1.2, -3.2]}>
  {/* drummer */}
  <group position={[-2.2 - flee * 6, 0, 0]}><Person pose="stand" phase={fe / 5} {...LOOKS[6]} hat="cap" expr={frozen ? 'shock' : 'happy'} />
    <mesh position={[0, 0.8, 0.7]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.6, 10]} /><meshLambertMaterial color="#d6302a" flatShading /></mesh>
    <mesh position={[0, 1.11, 0.7]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.48, 10]} /><meshLambertMaterial color="#f4ead6" /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 0.25, 1.3 + (frozen ? 0 : Math.max(0, Math.sin(fe * 0.6 + s * 1.6)) * 0.35), 0.6]} rotation={[0.6, 0, s * 0.3]}><boxGeometry args={[0.06, 0.6, 0.06]} /><meshLambertMaterial color="#f2d6a0" /></mesh>)}</group>
  {/* piper */}
  <group position={[0, 0, -0.3]}><Person pose="stand" phase={fe / 5} {...LOOKS[3]} expr={frozen ? 'shock' : 'closed'} />
    <mesh position={[0, 1.55, 0.55]} rotation={[1.2 + Math.sin(fe * 0.3) * 0.1, 0, 0]}><cylinderGeometry args={[0.05, 0.07, 0.9, 6]} /><meshLambertMaterial color="#8a5a34" /></mesh></group>
  {/* lute */}
  <group position={[2.2 + flee * 6, 0, 0]}><Person pose="stand" phase={fe / 5} {...LOOKS[0]} hat={null} expr={frozen ? 'shock' : 'happy'} />
    <mesh position={[0.05, 1.0, 0.4]} rotation={[0, 0, 0.6 + Math.sin(fe * 0.5) * 0.08]} scale={[1, 1.3, 0.4]}><sphereGeometry args={[0.35, 8, 6]} /><meshLambertMaterial color="#c98a3a" flatShading /></mesh>
    <mesh position={[-0.35, 1.45, 0.4]} rotation={[0, 0, 0.6]}><boxGeometry args={[0.08, 0.8, 0.06]} /><meshLambertMaterial color="#6a4426" /></mesh></group>
  {!frozen && <Notes position={[0, 1.6, 0.5]} frame={f} count={8} spread={5} height={5} />}
</group>; };
const Hall = ({f, lit = 1}) => <group>
  {/* guildhall interior: wooden floor, back wall with banners, stage */}
  <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /><meshLambertMaterial color="#b07a46" /></mesh>
  {Array.from({length: 12}, (_, i) => <mesh key={i} position={[-15 + i * 2.6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.06, 30]} /><meshBasicMaterial color="#8a5a34" /></mesh>)}
  <mesh position={[0, 5, -5]}><boxGeometry args={[30, 10, 0.4]} /><meshLambertMaterial color="#e8c9a0" flatShading /></mesh>
  {[-8, -4, 0, 4, 8].map((x, i) => <mesh key={x} position={[x, 6.6 + Math.sin(f * 0.08 + i) * 0.04, -4.75]}><planeGeometry args={[1.6, 3]} /><meshLambertMaterial color={['#d6302a', '#2f6df0', '#ffd23a', '#2fa38a', '#c94ad6'][i]} /></mesh>)}
  {[-10, -5, 5, 10].map((x) => <mesh key={x} position={[x, 5, -4.6]}><boxGeometry args={[0.6, 10, 0.6]} /><meshLambertMaterial color="#5a3420" flatShading /></mesh>)}
  <mesh position={[0, 0.6, -3.4]}><boxGeometry args={[9, 1.2, 3]} /><meshLambertMaterial color="#7a4a2a" flatShading /></mesh>
  {[-7, 7].map((x, i) => <group key={x}><mesh position={[x, 4.2, -4.5]}><boxGeometry args={[0.2, 0.6, 0.2]} /><meshLambertMaterial color="#3a2618" /></mesh><Glow position={[x, 4.7, -4.3]} size={2.5} color="#ffb84a" opacity={0.7 + 0.2 * Math.sin(f * 0.5 + i)} /><pointLight position={[x, 4.7, -3.8]} color="#ffb06a" intensity={6} distance={12} decay={1.3} /></group>)}
</group>;
const S6 = () => {
  const f = useCurrentFrame(); const base = LS[8]; const d = LS[9] - base;
  const tH = wordAt('halls', 8) - base, tB = wordAt('band', 8) - base, tM = wordAt('strong', 8) - base;
  const chk = (t, txt, y) => f >= t && <div style={{position: 'absolute', top: y, left: 120, fontFamily: 'Lilita One', fontSize: 56, color: '#fff', ...STROKE(10), opacity: clamp01((f - t) / 4), transform: `translateX(${(1 - easeOut(clamp01((f - t) / 6))) * -60}px)`}}><span style={{color: COLORS.green}}>✔</span> {txt}</div>;
  // strong man support pair
  const sag = 0.5 + 0.5 * Math.sin(f * 0.15);
  return <Stage palette="dusk" background="linear-gradient(180deg,#4a2a5a,#8a4a5a 60%,#c9784a)" fog={[30, 120]} overlay={<>
    <Pill text="CITY COUNCIL · OFFICIAL PLAN" y={236} variant="red" delay={2} size={40} />
    {chk(tH, 'HALLS', 340)}{chk(tB, 'A BAND', 410)}{chk(tM, 'STRONG MEN', 480)}
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 4.2, 13], look: [0, 1.8, -1], fov: 48}, {f: tM - 6, pos: [1.2, 3.6, 11], look: [0, 1.8, -1], fov: 46}, {f: d, pos: [2.2, 2.6, 6.8], look: [1.2, 1.4, 1.6], fov: 44}]} />
    <Hall f={f} />
    <Band f={f} />
    {DANCER_SPOTS.slice(0, 12).map((sp, i) => <Person key={i} position={[sp.x * 0.9 - 1, 0, sp.z * 0.5 + 2.2]} rotation={sp.rot} pose="dance" style={sp.style} phase={f / 3 + sp.ph} {...LOOKS[sp.look]} scale={0.85} expr={i % 2 ? 'tired' : 'shock'} />)}
    {/* strong men hold up a drooping dancer */}
    <group position={[1.2, 0, 1.8]}>
      <Person position={[0, -0.1 * sag, 0]} pose="dance" style={3} energy={0.35} phase={f / 4} {...LOOKS[5]} expr="tired" />
      {[-1, 1].map((s) => <Person key={s} position={[s * 0.75, 0, 0.1]} rotation={-s * 0.4} pose="carry" phase={f / 5} skin="#d99a6c" shirt="#5a4a3a" pants="#2a2a2a" hair="#1a1210" scale={1.18} expr="open" />)}
    </group>
  </Stage>;
};

// ---------- S7: did not help -> 400 (scale reveal) ----------
const S7 = () => {
  const f = useCurrentFrame(); const base = LS[9]; const d = LS[10] - base; const tAug = wordAt('august', 9) - base; const tFour = wordAt('four', 9) - base;
  const rev = easeInOut(clamp01((f - tAug + 6) / 40)); const n = Math.round(34 + (400 - 34) * easeOut(clamp01((f - tAug) / (tFour - tAug + 18))));
  return <Stage palette="day" fog={[60, 240]} overlay={<>
    {f < tAug ? <Label at={4} y={300} fig="RESULT OF OFFICIAL PLAN" text="DID NOT HELP" color="#ffffff" rot={-2} />
      : <Counter value={`${n}`} label="DANCERS · AUGUST 1518" y={270} color="#ff5a4e" />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 3, 10], look: [0, 1.6, 0], fov: 46}, {f: tAug - 6, pos: [0, 3.2, 11], look: [0, 1.6, 0], fov: 46}, {f: tAug + 40, pos: [0, 30, 40], look: [0, 0, -2], fov: 50}, {f: d, pos: [3, 33, 44], look: [0, 0, -2], fov: 50}]} />
    <Clouds frame={f} y={30} count={9} speed={0.08} />
    <Town frame={f} stalls={false} />
    <Dancers frame={f} n={14} energy={1} />
    <Person position={[0, 0, 4]} rotation={Math.PI * 0.1} pose="stand" phase={f / 6} {...DOCTOR} expr="shock" />
    <Bubble position={[0, 3.2, 4]} text="?!" pop={popT(f - 10)} size={1.2} />
    {rev > 0 && <MiniCrowd frame={f} count={Math.round(380 * clamp01(rev * 1.4))} area={[-12, 12, -5.5, 16]} seed={4} />}
    {rev > 0.3 && <MiniCrowd frame={f + 40} count={140} area={[-30, 30, 16, 34]} seed={9} />}
  </Stage>;
};

// ---------- S8: the joke stops (lighting drop) ----------
const S8 = () => {
  const f = useCurrentFrame(); const base = LS[10]; const d = LS[11] - base;
  const drop = clamp01(f / 3);
  return <Stage palette={mixPalette('day', DREAD, drop)} fog={[18, 90]} overlay={<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 35%, rgba(40,0,6,0.75) 100%)'}} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 2.4, 9], look: [0, 1.6, 0], fov: 44}, {f: d, pos: [0, 2.0, 4.6], look: [0, 1.75, 0], fov: 38}]} drift={0.08} />
    <Stars opacity={0.4} />
    <Town frame={f * 0.4} lit={0.3} bunting={false} chickens={false} stalls={false} />
    <Dancers frame={f * 0.45} n={20} energy={0.55} expr="tired" />
    <Person position={[0, 0, 1.8]} rotation={0} pose="dance" style={3} energy={0.5} phase={f / 7} {...TROFFEA} expr="tired" />
    <Torch position={[-3.5, 0, 3]} frame={f} k={1} /><Torch position={[3.8, 0, 2.5]} frame={f} k={2} />
  </Stage>;
};

// ---------- S9: bleeding feet, screams ----------
const S9 = () => {
  const f = useCurrentFrame(); const base = LS[11]; const d = LS[12] - base; const tScr = wordAt('screamed', 11) - base; const tBled = wordAt('bled', 11) - base;
  const red = clamp01((f - tBled + 4) / 18); const shoe = '#' + new THREE.Color('#2a1d16').lerp(new THREE.Color('#b0121c'), red).getHexString();
  const face = f >= tScr - 4;
  return <Stage palette={DREAD} fog={[14, 70]} overlay={<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(30,0,4,0.7) 100%)'}} />
    {!face && f > tBled + 10 && <Pill text="DAY 30+" y={250} variant="dark" delay={tBled + 10} size={40} />}
  </>}>
    {face
      ? <CameraRig keys={[{f: tScr - 4, pos: [0.3, 1.95, 3.2], look: [0, 1.75, 0], fov: 40}, {f: d, pos: [0.2, 1.9, 2.4], look: [0, 1.75, 0], fov: 36}]} shake={0.05} shakeFrom={tScr} shakeLen={40} drift={0.05} />
      : <CameraRig keys={[{f: 0, pos: [1.6, 0.55, 3.2], look: [0, 0.35, 0], fov: 42}, {f: tScr - 5, pos: [0.6, 0.5, 2.6], look: [0, 0.3, 0], fov: 40}]} drift={0.05} />}
    <Town frame={0} lit={0.3} bunting={false} chickens={false} stalls={false} cathedral={false} />
    <Footprints frame={f} start={tBled - 6} n={60} area={2.2} rate={1.2} />
    <Person position={[0, 0, 0]} rotation={Math.sin(f * 0.04) * 0.3} pose="dance" style={0} energy={0.6} phase={f / 5} {...TROFFEA} shoes={shoe} expr={face ? 'scream' : 'tired'} />
    {[[-1.6, -0.8, 1], [1.5, -1.2, 4], [-0.6, -2.5, 2]].map(([x, z, k], i) => <Person key={i} position={[x, 0, z]} rotation={0.3 * (i - 1)} pose="dance" style={k} energy={0.55} phase={f / 5.5 + i} {...LOOKS[k]} shoes={shoe} expr={face ? 'scream' : 'tired'} scale={0.92} />)}
    <Torch position={[2.4, 0, -1]} frame={f} k={3} />
    {face && <Bubble position={[0.32, 2.42, 0.3]} text="HELP" pop={popT(f - tScr)} size={0.62} color="#ffffff" textColor="#b0121c" />}
  </Stage>;
};

// ---------- S10: collapse (respectful, no gag) ----------
const S10 = () => {
  const f = useCurrentFrame(); const base = LS[12]; const d = LS[13] - base; const tArg = wordAt('argue', 12) - base; const tDied = wordAt('died', 12) - base;
  const col = (i) => (i % 3 === 1 || i === 4 ? clamp01((f - 6 - (i % 7) * 7) / 18) : 0);
  return <Stage palette={DREAD} fog={[20, 90]} overlay={<>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(25,0,4,0.7) 100%)'}} />
    {f >= tDied - 4 && <Pill text="DEATH TOLL: UNKNOWN" y={250} variant="white" delay={tDied - 4} size={44} />}
    {f >= tArg && <div style={{position: 'absolute', top: 340, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 36, color: '#ffd9d0', ...STROKE(7), opacity: clamp01((f - tArg) / 8)}}>city records of 1518 do not list deaths</div>}
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 12, 12], look: [0, 0, 0.5], fov: 46}, {f: d, pos: [2.5, 10, 9], look: [0, 0, 0.5], fov: 44}]} drift={0.06} />
    <Town frame={0} lit={0.25} bunting={false} chickens={false} stalls={false} />
    <Dancers frame={f * 0.6} n={20} energy={0.5} collapse={col} expr="tired" />
    <Torch position={[-4, 0, 3]} frame={f} k={1} /><Torch position={[4.5, 0, -1]} frame={f} k={5} />
    <Footprints frame={200} n={90} area={6} seed={11} />
  </Stage>;
};

// ---------- S11: council bans music (record scratch gag) ----------
const S11 = () => {
  const f = useCurrentFrame(); const base = LS[13]; const d = LS[14] - base; const tBan = wordAt('banned', 13) - base;
  const banned = f >= tBan; const flee = banned ? easeInOut(clamp01((f - tBan - 18) / 40)) : 0;
  const st = clamp01((f - tBan) / 5);
  return <Punch keys={[{f: tBan, s: 1.12, from: 1, ox: 50, oy: 50, d: 3}]} flashAt={[tBan]}>
    <Stage palette="dusk" background="linear-gradient(180deg,#4a2a5a,#8a4a5a 60%,#c9784a)" fog={[30, 120]} overlay={<>
      <Pill text="CITY COUNCIL · NEW RULE" y={236} variant="white" delay={2} size={38} />
      {banned && <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center'}}><span style={{display: 'inline-block', fontFamily: 'Lilita One', fontSize: 170, color: '#ff3b30', ...STROKE(14, '#fff'),
        border: '14px solid #ff3b30', borderRadius: 24, padding: '0 36px', transform: `rotate(-12deg) scale(${1.8 - 0.8 * easeOut(st)})`, opacity: st, letterSpacing: 6, boxShadow: '0 0 0 6px #fff'}}>BANNED</span></div>}
      {f >= tBan + 22 && <Label at={tBan + 22} y={360} fig="TIMING" text="A BIT LATE" rot={2} />}
    </>}>
      <CameraRig keys={[{f: 0, pos: [0, 3.4, 9], look: [0, 2.2, -3], fov: 46}, {f: d, pos: [0, 3.8, 11], look: [0, 2.2, -3], fov: 48}]} />
      <Hall f={f} />
      <Band f={f} frozen={banned} flee={flee} />
      {banned && <Bubble position={[0, 4.6, -3.5]} text="?!" pop={popT(f - tBan - 4)} size={1.2} />}
    </Stage>
  </Punch>;
};

// ---------- S12: procession to the St Vitus shrine ----------
const hillH = makeHeight({seed: 3, amp: 1.6, freq: 0.07, shape: (x, z, h) => h + 11 * Math.exp(-((x * x + (z + 14) * (z + 14)) / 140))});
const pathPt = (t) => { const z = 8 - t * 22; const x = Math.sin(t * 5) * 3.2 * (1 - t); return [x, hillH(x, z), z]; };
const S12 = () => {
  const f = useCurrentFrame(); const base = LS[14]; const d = LS[15] - base; const tSep = wordAt('september', 14) - base; const tShr = wordAt('shrine', 14) - base;
  const top = pathPt(1);
  return <Stage palette="dawn" fog={[50, 200]} overlay={<>
    {f >= tShr && <Pill text="SHRINE OF SAINT VITUS" y={250} variant="yellow" delay={tShr} size={48} />}
    {f >= tSep && <Headline y={350} lines={[{text: 'SEPTEMBER:', color: 'white', size: 80}, {text: 'IT STOPPED', color: 'green', size: 108}]} delay={tSep} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [14, 9, 22], look: [0, 4, -4], fov: 46}, {f: d, pos: [9, 13, 18], look: [0, 7, -9], fov: 44}]} />
    <Clouds frame={f} y={30} count={10} speed={0.06} /><Birds center={[0, 22, -10]} radius={14} frame={f} count={8} />
    <Terrain height={hillH} size={120} seg={60} />
    {[[-9, 2], [8, -3], [-6, -12], [7, -15], [-12, -6], [11, 6], [-4, 10], [5, 12]].map(([x, z], i) => <Tree key={i} position={[x, hillH(x, z), z]} s={1.3} kind={i % 2 ? 'pine' : 'round'} seed={i} frame={f} />)}
    <Chapel position={[top[0], top[1] - 0.2, top[2] - 2]} />
    {Array.from({length: 14}, (_, i) => { const t = clamp01(0.05 + i * 0.045 + f * 0.0018); const [x, y, z] = pathPt(t); const [x2, , z2] = pathPt(Math.min(1, t + 0.01));
      return <Person key={i} position={[x, y, z]} rotation={Math.atan2(x2 - x, z2 - z)} pose="walk" phase={f / 6 + i} {...(i === 6 ? TROFFEA : LOOKS[i % 8])} shoes="#c0121c" scale={0.8} expr="tired" />; })}
  </Stage>;
};

// ---------- S13: theory 1 - ergot on rye bread ----------
const S13 = () => {
  const f = useCurrentFrame(); const base = LS[15]; const d = LS[16] - base; const tSp = wordAt('spasms', 15) - base;
  const spots = rng(3);
  const sp = Array.from({length: 14}, () => [(spots() - 0.5) * 5, (spots() - 0.5) * 1.6]);
  return <Stage palette="blueprint" background={'repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 64px), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 64px), linear-gradient(180deg,#0f3563,#1b5590)'} fog={[80, 300]} overlay={<>
    <Pill text="ONE IDEA" y={236} variant="white" delay={2} />
    <Headline y={318} lines={[{text: 'ERGOT:', color: 'white', size: 90}, {text: 'A RYE MOULD', color: 'yellow', size: 100}]} delay={4} />
    <div style={{position: 'absolute', top: 1500, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 30, color: '#cfe0ff', ...STROKE(5, '#0b1020')}}>can cause spasms and hallucinations</div>
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 5.5, 17], look: [0, 1.6, 0], fov: 44}, {f: d, pos: [1.5, 5, 15], look: [0, 1.7, 0], fov: 42}]} />
    <group rotation={[0, f * 0.006, 0]}>
      <mesh position={[0, 0.9, 0]} scale={[3.2, 1.1, 1.6]}><sphereGeometry args={[1, 10, 6]} /><meshLambertMaterial color="#b9783a" flatShading /></mesh>
      {[-2, -1, 0, 1, 2].map((x) => <mesh key={x} position={[x * 1.0, 1.95, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.12, 0.6, 1.2]} /><meshLambertMaterial color="#8a5022" /></mesh>)}
      {sp.map(([x, z], i) => <mesh key={i} position={[x * 0.9, 1.7 + Math.cos(x) * 0.2, z * 0.6]} scale={0.18 + (i % 3) * 0.06}><dodecahedronGeometry args={[1, 0]} /><meshLambertMaterial color={i % 2 ? '#3a1a4a' : '#2a0f36'} flatShading /></mesh>)}
    </group>
    {/* tiny twitching person standing on the loaf */}
    <Person position={[0.4, 1.95, 0.3]} rotation={0.3} pose="dance" style={3} energy={f >= tSp - 6 ? 1 : 0.4} phase={f / 1.8} {...LOOKS[2]} scale={0.8} expr="shock" />
    <Glow position={[0, 1.4, 0]} size={9} color="#9a5aff" opacity={0.25 + 0.1 * Math.sin(f * 0.2)} />
  </Stage>;
};

// ---------- S14: theory 2 - fear (famine, disease, curse) ----------
const S14 = () => {
  const f = useCurrentFrame(); const base = LS[16]; const d = LS[17] - base;
  const tFear = wordAt('fear', 16) - base, tFam = wordAt('famine', 16) - base, tDis = wordAt('disease', 16) - base, tCur = wordAt('cursed', 16) - base;
  const curse = clamp01((f - tCur + 10) / 20);
  return <Stage palette={mixPalette('dusk', DREAD, 0.4 + curse * 0.6)} fog={[20, 110]} overlay={<>
    <Pill text="WHAT MOST HISTORIANS THINK" y={236} variant="white" delay={2} size={38} />
    {f >= tFear && <Headline y={318} lines={[{text: 'FEAR', color: 'red', size: 140}]} delay={tFear} />}
    {f >= tFam && <Pill text="FAMINE" y={520} x="27%" variant="yellow" delay={tFam} size={46} />}
    {f >= tDis && <Pill text="DISEASE" y={520} x="73%" variant="yellow" delay={tDis} size={46} />}
    {f >= tCur && <Pill text="A FEARED CURSE: DANCE" y={610} variant="red" delay={tCur} size={46} />}
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(30,0,6,${0.4 + curse * 0.35}) 100%)`}} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 3, 14], look: [0, 2, 0], fov: 46}, {f: d, pos: [0, 2.4, 9], look: [0, 2.3, 0], fov: 44}]} />
    <Town frame={f * 0.3} lit={0.3} emptyStalls bunting={false} chickens={false} />
    {/* gaunt townsfolk standing still, staring */}
    {[-4, -2, 2, 4.2].map((x, i) => <Person key={i} position={[x, 0, 3 - (i % 2)]} rotation={-x * 0.08} pose="stand" phase={f / 12 + i} {...LOOKS[(i * 3) % 8]} expr="tired" scale={0.95} />)}
    {/* the curse: ghostly dancers circling above the square */}
    {curse > 0 && Array.from({length: 8}, (_, i) => { const a = i / 8 * 6.28 + f * 0.035; return <Ghost key={i} frame={f} position={[Math.sin(a) * 2.8, 0.4 + Math.sin(f * 0.06 + i) * 0.4, Math.cos(a) * 1.6 - 1]} rotation={a + Math.PI / 2} pose="dance" style={i % 4} opacity={curse} scale={1.0} />; })}
    <Birds center={[0, 9, -3]} radius={7} frame={f} count={6} speed={0.02} color="#140a10" />
    {curse > 0 && <Glow position={[0, 1.8, 2]} size={10} color="#ff3a4a" opacity={0.35 * curse} />}
  </Stage>;
};

// ---------- S15: question + end (windows full of dancing shadows) ----------
const S15 = () => {
  const f = useCurrentFrame(); const base = LS[17]; const d = DANCING_FRAMES - base; const stop = d - 30;
  const stopped = f >= stop;
  return <Stage palette="night" fog={[25, 140]} overlay={<>
    <Headline y={290} lines={[{text: 'A CURSE?', color: 'white', size: 84}, {text: 'A MOULD?', color: 'white', size: 84}, {text: 'OR FEAR ITSELF?', color: 'yellow', size: 92}]} delay={3} stagger={10} />
    <EndCard delay={30} sources={['BRITANNICA', 'HISTORY.COM', 'WALLER, THE LANCET 2009']} />
    {stopped && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 30%, rgba(60,0,8,0.6) 100%)', opacity: clamp01((f - stop) / 3)}} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 2.6, 9.5], look: [0, 3.4, -6], fov: 50}, {f: stop, pos: [0, 3.6, 14], look: [0, 4, -6], fov: 50}, {f: d, pos: [0, 3.2, 11.5], look: [0, 3.6, -6], fov: 46}]} shake={0.12} shakeFrom={stop} shakeLen={14} />
    <Stars opacity={0.9} /><Orb position={[-30, 45, -90]} radius={4} color="#fbf6dc" /><Glow position={[-30, 45, -89]} size={30} color="#9fc0ff" opacity={0.5} />
    <Town frame={f} lit={0.95} silhouettes={0.85} silStop={stop} bunting={false} chickens={false} stalls={false} />
    <Person position={[0, 0, 1]} rotation={stopped ? 0 : Math.sin(f * 0.05) * 0.8} pose={stopped ? 'stand' : 'dance'} style={1} energy={0.6} phase={(stopped ? stop : f) / 5} {...TROFFEA} expr={stopped ? 'shock' : 'tired'} />
    <Fireflies center={[0, 0, 2]} area={[20, 3, 10]} count={30} frame={f} color="#ffe8a0" size={0.4} opacity={0.6} />
  </Stage>;
};

const SCENES = [[S0, 0, 1], [S1, 1, 2], [S2, 2, 4], [S3, 4, 5], [S4, 5, 6], [S5, 6, 8], [S6, 8, 9], [S7, 9, 10], [S8, 10, 11], [S9, 11, 12], [S10, 12, 13], [S11, 13, 14], [S12, 14, 15], [S13, 15, 16], [S14, 16, 17], [S15, 17, null]];

export const Dancing = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces />
    {SCENES.map(([C, a, b], i) => {
      const from = i === 0 ? 0 : LS[a] - 4; const to = b === null ? DANCING_FRAMES : LS[b] - 4;
      return <Sequence key={i} from={from} durationInFrames={to - from}><C />{i > 0 && i !== 8 && <Dip inFrames={5} />}</Sequence>;
    })}
    <Finish vignette={0.45} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
