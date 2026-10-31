// Kinross 1953 diorama parts: radar scope (hero), F-89 jet, C-47, radar room, runway, cockpit, radio desk. Deterministic.
import {useMemo} from 'react';
import * as THREE from 'three';
import {Terrain, makeHeight, Person, rng, clamp01} from '../../kit/index.js';

const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
const Cy = ({p = [0, 0, 0], a = [0.2, 0.2, 1, 8], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><cylinderGeometry args={a} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;

// ---------- radar blips (absolute story seconds; merge at 25.68) ----------
const MV = [-0.25, 0.1];
export const mPos = (t) => [0.2 + MV[0] * (t - 25.68), -0.1 + MV[1] * (t - 25.68)];
export const blips = (t) => { const m = mPos(t); const s = Math.min(1.15, (25.68 - t) / 3.4);
  return {M: m, A: t < 25.68 ? [m[0] - 2.0 * s, m[1] + 1.4 * s] : null, merged: t >= 25.68, pulse: t >= 25.68 ? Math.exp(-(t - 25.68) * 2.5) : 0}; };
const Ring = ({r, w = 0.025, c = '#38ff6a', o = 0.8, y = 0.01}) => <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r - w, r + w, 64]} /><meshBasicMaterial color={c} transparent opacity={o} side={THREE.DoubleSide} /></mesh>;
const SPECK = (() => { const r = rng(5); return Array.from({length: 46}, () => { const a = r() * 6.28, d = Math.sqrt(r()) * 2.8; return {x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.03 + r() * 0.05, k: r()}; }); })();
/** CRT radar scope lying flat. tt = story time driving the blips; mode: 'both' | 'unknown' */
export const Scope = ({position = [0, 0, 0], scale = 1, frame = 0, tt = 25, mode = 'both', iffGone = 1e9, zone = false, rotation = [0, 0, 0], lamp = true}) => {
  const b = blips(tt); const sw = -frame * 0.1;
  const dot = (p, c, s = 1, key) => <mesh key={key} position={[p[0], 0.06, p[1]]} scale={s}><sphereGeometry args={[0.13, 10, 8]} /><meshBasicMaterial color={c} /></mesh>;
  const trail = (fn, c) => [1, 2, 3, 4, 5, 6].map((k) => { const p = fn(tt - k * 0.22); return p ? <mesh key={k + c} position={[p[0], 0.05, p[1]]} scale={1 - k * 0.13}><sphereGeometry args={[0.1, 8, 6]} /><meshBasicMaterial color={c} transparent opacity={0.55 - k * 0.08} /></mesh> : null; });
  const iff = tt < iffGone || Math.sin(frame * 1.9) > 0.5 && tt < iffGone + 0.5;
  return <group position={position} scale={scale} rotation={rotation}>
    <Cy p={[0, -0.32, 0]} a={[3.45, 3.6, 0.5, 40]} c="#1b1f26" /><mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.1, 3.5, 48]} /><meshLambertMaterial color="#2a3038" flatShading /></mesh>
    <Cy p={[0, -0.03, 0]} a={[3.1, 3.1, 0.04, 48]} c="#06301a" basic />
    {[0.75, 1.5, 2.25, 3.0].map((r) => <Ring key={r} r={r} w={r === 3 ? 0.05 : 0.02} o={r === 3 ? 1 : 0.55} />)}
    {zone && <Ring r={1.9} w={0.04} c="#ff4a3a" o={0.9} y={0.03} />}
    <Bx p={[0, 0.011, 0]} s={[6, 0.01, 0.015]} c="#38ff6a" basic o={0.45} /><Bx p={[0, 0.011, 0]} s={[0.015, 0.01, 6]} c="#38ff6a" basic o={0.45} />
    {SPECK.map((s, i) => <mesh key={i} position={[s.x, 0.03, s.z]}><boxGeometry args={[s.s, 0.01, s.s]} /><meshBasicMaterial color="#2ad060" transparent opacity={0.18 + 0.2 * Math.abs(Math.sin(frame * 0.2 + s.k * 9))} /></mesh>)}
    <group rotation={[0, sw, 0]}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <group key={i} rotation={[0, i * 0.06, 0]}><mesh position={[1.5, 0.04, 0]}><boxGeometry args={[3.0, 0.005, 0.04]} /><meshBasicMaterial color="#6aff9a" transparent opacity={0.9 - i * 0.11} /></mesh></group>)}</group>
    {mode === 'both' && b.A && <>{trail((t) => blips(t).A, '#ffd24a')}{dot(b.A, '#ffd24a', 1.05, 'A')}</>}
    {trail((t) => (mode === 'unknown' ? mPos(t) : blips(t).M), mode === 'unknown' ? '#ff7a3a' : '#ffd24a')}
    {dot(b.M, mode === 'unknown' ? '#ff7a3a' : b.merged ? '#fff6c0' : '#ff7a3a', (mode === 'unknown' ? 1.1 : 1) * (1 + b.pulse * 1.2), 'M')}
    {(mode === 'unknown' || b.merged) && <mesh position={[b.M[0], 0.07, b.M[1]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.22 + b.pulse * 0.5, 0.26 + b.pulse * 0.5, 24]} /><meshBasicMaterial color="#ff7a3a" transparent opacity={0.8} /></mesh>}
    {mode === 'both' && iff && (b.A || b.merged) && <mesh position={[(b.A || b.M)[0], 0.08, (b.A || b.M)[1]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.3, 0.34, 4]} /><meshBasicMaterial color="#55ff55" /></mesh>}
    {lamp && <pointLight position={[0, 2.5, 0]} color="#3aff8a" intensity={6} distance={14} />}
  </group>; };

// ---------- F-89 Scorpion (forward = +z). Tip tanks, T-tail, twin engines ----------
export const Jet = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, burn = 1, ghost = false}) => {
  const o = ghost ? 0.5 : 1; const flick = 0.85 + 0.15 * Math.sin(frame * 1.7);
  return <group position={position} rotation={rotation} scale={scale}>
    <Cy p={[0, 0, 0]} a={[0.3, 0.26, 3.4, 8]} r={[Math.PI / 2, 0, 0]} c="#b9c0c8" o={o} />
    <Cy p={[0, 0, 2.2]} a={[0.02, 0.3, 1.1, 8]} r={[Math.PI / 2, 0, 0]} c="#2a2e36" o={o} />
    <mesh position={[0, 0.27, 0.6]} scale={[0.8, 0.7, 2]}><sphereGeometry args={[0.28, 8, 6]} /><meshLambertMaterial color="#ffc870" emissive="#ff9a30" emissiveIntensity={0.5} flatShading transparent={ghost} opacity={o} /></mesh>
    {[-1, 1].map((s) => <group key={s}>
      <Bx p={[s * 1.15, 0, -0.1]} s={[2.2, 0.07, 1.0]} r={[0, s * 0.12, 0]} c="#a8b0b8" o={o} />
      <Cy p={[s * 2.4, 0, 0]} a={[0.2, 0.16, 1.9, 8]} r={[Math.PI / 2, 0, 0]} c="#c8302a" o={o} />
      <mesh position={[s * 2.4, 0, -1.0]}><sphereGeometry args={[0.06, 6, 5]} /><meshBasicMaterial color={s < 0 ? '#ff2a2a' : '#2aff6a'} /></mesh>
      <Cy p={[s * 0.5, -0.05, -0.8]} a={[0.2, 0.2, 1.4, 8]} r={[Math.PI / 2, 0, 0]} c="#8a9098" o={o} />
      <Bx p={[s * 0.5, 0.95, -1.5]} s={[0.7, 0.05, 0.4]} c="#a8b0b8" o={o} /></group>)}
    <Bx p={[0, 0.5, -1.4]} s={[0.07, 1.0, 0.7]} r={[-0.3, 0, 0]} c="#b9c0c8" o={o} />
    {burn > 0 && [-0.5, 0.5].map((x) => <group key={x} position={[x, -0.05, -1.7]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, flick * burn]}><coneGeometry args={[0.22, 1.6, 8]} /><meshBasicMaterial color="#ffb040" transparent opacity={0.85} /></mesh>
      <mesh position={[0, 0, -0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.6, 1, flick * burn]}><coneGeometry args={[0.22, 1.0, 8]} /><meshBasicMaterial color="#fff2c0" /></mesh></group>)}
  </group>; };
// ---------- RCAF C-47 (claimed in the story; shown translucent) ----------
export const C47 = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, ghost = true}) => {
  const o = ghost ? 0.55 : 1;
  return <group position={position} rotation={rotation} scale={scale}>
    <Cy a={[0.45, 0.35, 4.2, 8]} r={[Math.PI / 2, 0, 0]} c="#c8ccd2" o={o} />
    <mesh position={[0, 0.1, 2.1]}><sphereGeometry args={[0.45, 8, 6]} /><meshLambertMaterial color="#c8ccd2" flatShading transparent opacity={o} /></mesh>
    <Bx p={[0, 0.05, 0.3]} s={[6.2, 0.14, 1.1]} c="#b8bcc4" o={o} />
    {[-1, 1].map((s) => <group key={s} position={[s * 1.4, 0, 0.9]}><Cy a={[0.2, 0.2, 0.9, 8]} r={[Math.PI / 2, 0, 0]} c="#6a6e76" o={o} />
      <group position={[0, 0, 0.5]} rotation={[0, 0, frame * 0.9]}><Bx s={[1.5, 0.08, 0.04]} c="#222" o={o} /></group></group>)}
    <Bx p={[0, 0.5, -2.0]} s={[0.07, 1.0, 0.8]} c="#c8ccd2" o={o} /><Bx p={[0, 0.2, -2.0]} s={[1.9, 0.07, 0.6]} c="#b8bcc4" o={o} />
    <Bx p={[0, 0.3, 0]} s={[0.92, 0.12, 2.6]} c="#2a6aa8" o={o * 0.8} />
  </group>; };

// ---------- ground + sea ----------
export const height = makeHeight({seed: 1953, amp: 0.25, freq: 0.06, shape: (x, z, h) => h * 0.5});
const snowColor = (h, x, z) => ((Math.floor(x * 0.4) + Math.floor(z * 0.4)) % 2 ? '#e4ecf6' : '#d6e0ee');
export const SnowField = () => <Terrain height={height} size={160} seg={60} colorFn={snowColor} center={[0, 0]} jitter={0.15} />;
export const Runway = ({frame = 0}) => <group>
  <Bx p={[0, 0.12, 0]} s={[8, 0.06, 90]} c="#2a2e36" />
  {Array.from({length: 22}, (_, i) => <Bx key={i} p={[0, 0.16, -42 + i * 4]} s={[0.25, 0.02, 1.8]} c="#e8e8e0" />)}
  {Array.from({length: 24}, (_, i) => [-1, 1].map((s) => <mesh key={i + '_' + s} position={[s * 4.3, 0.25, -44 + i * 4]}><sphereGeometry args={[0.13, 6, 5]} /><meshBasicMaterial color={i % 2 ? '#fff0b0' : '#ffd070'} /></mesh>))}
  {/* hangar + tower */}
  <group position={[-16, 0, -6]}><Bx p={[0, 2.2, 0]} s={[10, 4.4, 14]} c="#8a94a6" /><Bx p={[0, 4.6, 0]} s={[10.4, 0.5, 14.4]} c="#5a6478" />
    <Bx p={[5.01, 1.8, 0]} s={[0.1, 3.4, 8]} c="#ffd27a" e="#ffb040" ei={0.8} /></group>
  <group position={[14, 0, 8]}><Bx p={[0, 1.5, 0]} s={[2.4, 3, 2.4]} c="#9aa4b6" /><Bx p={[0, 3.4, 0]} s={[3.4, 1.0, 3.4]} c="#ffe4a0" e="#ffc060" ei={0.9} /><Bx p={[0, 4.1, 0]} s={[3.8, 0.25, 3.8]} c="#4a5468" /></group>
  <pointLight position={[-10, 3, -2]} color="#ffc070" intensity={3} distance={14} />
</group>;

// ---------- radar room ----------
const UNI = {shirt: '#5a6a48', pants: '#3a4a30', hair: '#2a1d14', skin: '#d8a880'};
export const Console = ({position = [0, 0, 0], rotation = 0, frame = 0, tt = 25, seat = true, actor = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <Bx p={[0, 0.5, 0]} s={[2.2, 1.0, 0.9]} c="#4a5560" /><Bx p={[0, 1.05, 0.05]} s={[2.0, 0.1, 0.8]} c="#2a323a" r={[-0.2, 0, 0]} />
  <Scope position={[0, 1.14, 0.05]} scale={0.22} rotation={[-0.2, 0, 0]} frame={frame} tt={tt} lamp={false} />
  {[-0.8, 0.8].map((x) => <Bx key={x} p={[x, 1.1, 0.2]} s={[0.25, 0.06, 0.25]} c="#d83a2a" e="#ff4a3a" ei={1} />)}
  <pointLight position={[0, 1.6, 0.5]} color="#4aff9a" intensity={1.2} distance={4} />
  {seat && <group position={[0, 0, 1.1]}><Bx p={[0, 0.45, 0]} s={[0.7, 0.1, 0.7]} c="#3a2a22" /><Bx p={[0, 0.9, 0.3]} s={[0.7, 0.8, 0.1]} c="#3a2a22" />
    <Person position={[0, 0.2, -0.05]} rotation={Math.PI} scale={0.62} pose="sit" phase={frame / 14 + actor} {...UNI} /></group>}
</group>;
export const RadarRoom = ({frame = 0, tt = 25}) => <group>
  <Bx p={[0, -0.05, 0]} s={[16, 0.1, 14]} c="#2a3038" /><Bx p={[0, 3, -6]} s={[16, 6, 0.2]} c="#1e2830" /><Bx p={[-8, 3, 0]} s={[0.2, 6, 14]} c="#1e2830" /><Bx p={[8, 3, 0]} s={[0.2, 6, 14]} c="#1e2830" />
  {/* plotting board */}
  <group position={[0, 3, -5.8]}><Bx s={[7, 3.6, 0.1]} c="#0a2a22" e="#0a5a40" ei={0.6} />
    {Array.from({length: 7}, (_, i) => <Bx key={i} p={[-3 + i, 0, 0.06]} s={[0.02, 3.4, 0.01]} c="#3affa0" basic o={0.35} />)}
    {Array.from({length: 4}, (_, i) => <Bx key={i} p={[0, -1.2 + i * 0.8, 0.06]} s={[6.8, 0.02, 0.01]} c="#3affa0" basic o={0.35} />)}
    {[0, 1, 2].map((i) => <mesh key={i} position={[-2 + i * 1.7 + Math.sin(frame * 0.03 + i) * 0.3, 0.4 - i * 0.4 + Math.cos(frame * 0.04 + i) * 0.2, 0.12]}><sphereGeometry args={[0.1, 8, 6]} /><meshBasicMaterial color="#ffd24a" /></mesh>)}</group>
  <Console position={[-3.2, 0, -2.6]} rotation={0.35} frame={frame} tt={tt} actor={0} /><Console position={[0, 0, -3.2]} rotation={0} frame={frame} tt={tt} actor={2} /><Console position={[3.2, 0, -2.6]} rotation={-0.35} frame={frame} tt={tt} actor={4} />
  {[-3, 3].map((x) => <group key={x} position={[x, 5.6, -1]}><Cy a={[0.05, 0.05, 0.6, 5]} c="#333" /><Cy p={[0, -0.4, 0]} a={[0.1, 0.5, 0.3, 8]} c="#e8e0b0" e="#fff0b0" ei={1} /><pointLight position={[0, -0.8, 0]} color="#e8ffd8" intensity={1.0} distance={8} /></group>)}
</group>;

// ---------- cockpit (tandem seats). Camera sits behind the pilots. ----------
export const Cockpit = ({frame = 0, vertigo = false}) => <group>
  <Bx p={[0, -0.9, 0]} s={[2.4, 0.2, 5]} c="#566272" /><Bx p={[-1.2, 0, 0]} s={[0.15, 1.8, 5]} c="#566272" /><Bx p={[1.2, 0, 0]} s={[0.15, 1.8, 5]} c="#566272" />
  <Bx p={[0, 0.2, 2.3]} s={[2.4, 1.2, 0.5]} c="#12161c" r={[0.3, 0, 0]} />
  {Array.from({length: 8}, (_, i) => <mesh key={i} position={[-0.8 + (i % 4) * 0.5, 0.42 - Math.floor(i / 4) * 0.3, 2.0]}><circleGeometry args={[0.2, 10]} /><meshBasicMaterial color={i % 3 === 0 ? '#ffc050' : '#b0ffd0'} transparent opacity={0.85 + 0.15 * Math.sin(frame * 0.2 + i)} /></mesh>)}
  <mesh position={[0, 1.0, 0.8]} rotation={[0, 0, 0]}><torusGeometry args={[1.25, 0.06, 6, 20, Math.PI]} /><meshLambertMaterial color="#444c58" flatShading /></mesh>
  <Bx p={[0, -0.55, 0.9]} s={[0.9, 0.18, 0.7]} c="#3a2a22" /><Bx p={[0, -0.55, -0.6]} s={[0.9, 0.18, 0.7]} c="#3a2a22" />
  <Person position={[0, -0.7, 0.9]} rotation={0} scale={0.8} pose="sit" phase={frame / 10} {...UNI} />
  <Person position={[0, -0.7, -0.6]} rotation={0} scale={0.8} pose="sit" phase={frame / 10 + 2} {...UNI} shirt="#6a7a58" />
  <mesh position={[0, 0.2, 0.8]} scale={[1, 0.5, 1]}><sphereGeometry args={[1.1, 10, 6, 0, 6.28, 0, Math.PI / 2]} /><meshBasicMaterial color="#9ad0ff" transparent opacity={0.1} /></mesh>
  <pointLight position={[0, 0.5, 1.6]} color="#ffa840" intensity={4} distance={6} /><pointLight position={[0, 3, -3]} color="#a8c0ff" intensity={7} distance={12} />
</group>;

// ---------- radio desk (empty) ----------
export const RadioDesk = ({frame = 0}) => <group>
  <Bx p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#46525c" /><Bx p={[0, 2.5, -3]} s={[12, 5, 0.2]} c="#34505a" />
  <Bx p={[0, 0.8, 0]} s={[3.6, 0.12, 1.6]} c="#5a4632" />{[-1.6, 1.6].map((x) => <Bx key={x} p={[x, 0.4, 0]} s={[0.12, 0.8, 1.4]} c="#4a3a28" />)}
  <Bx p={[0, 1.25, -0.3]} s={[1.6, 0.8, 0.7]} c="#56626e" />
  {Array.from({length: 14}, (_, i) => { const h = 0.1 + 0.5 * Math.abs(Math.sin(frame * 0.7 + i * 2.3) * Math.cos(frame * 0.31 + i)); return <Bx key={i} p={[-0.65 + i * 0.1, 1.0 + h / 2, 0.12]} s={[0.07, h, 0.02]} c="#8affc0" basic />; })}
  <mesh position={[0.9, 1.3, 0.0]}><sphereGeometry args={[0.12, 8, 6]} /><meshBasicMaterial color={Math.sin(frame * 0.4) > 0 ? '#ff3a2a' : '#5a1a14'} /></mesh>
  <Cy p={[-1.1, 1.0, 0.3]} a={[0.04, 0.04, 0.4, 6]} c="#aaa" /><mesh position={[-1.1, 1.25, 0.3]}><sphereGeometry args={[0.1, 8, 6]} /><meshLambertMaterial color="#222" flatShading /></mesh>
  <mesh position={[1.2, 0.9, 0.4]} rotation={[Math.PI / 2, 0, 0.5]}><torusGeometry args={[0.2, 0.04, 6, 14, Math.PI * 1.4]} /><meshLambertMaterial color="#222" flatShading /></mesh>
  <group position={[0, 0.0, 2.0]}><Bx p={[0, 0.5, 0]} s={[0.8, 0.1, 0.8]} c="#3a2a22" r={[0, 0.5, 0]} /><Bx p={[0, 1.0, 0.3]} s={[0.8, 0.9, 0.1]} c="#3a2a22" r={[0, 0.5, 0]} /></group>
  <group position={[-4, 3.3, -2.85]}><mesh><circleGeometry args={[0.8, 20]} /><meshBasicMaterial color="#e8e0c8" /></mesh><Bx p={[0, 0.3, 0.02]} s={[0.05, 0.6, 0.02]} c="#222" /><Bx p={[0.2, 0.0, 0.02]} s={[0.4, 0.05, 0.02]} c="#222" r={[0, 0, 0.6]} /></group>
  <pointLight position={[0, 3.4, 0.5]} color="#ffe0a0" intensity={9} distance={16} />
</group>;

// ---------- weather helpers ----------
export const Puffs = ({frame = 0, speed = 0.6, count = 22, z0 = -30, z1 = 30, y = [-1, 6], x = 18, color = '#2a3348', seed = 4, size = 2.2}) => {
  const P = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * 2 * x, y: y[0] + r() * (y[1] - y[0]), z: z0 + r() * (z1 - z0), s: size * (0.6 + r()), o: 0.3 + r() * 0.3})); }, [count]);
  return <group>{P.map((p, i) => { const R = z1 - z0; const z = z0 + ((((p.z - z0 + frame * speed) % R) + R) % R); return <mesh key={i} position={[p.x, p.y, z]} scale={[p.s * 1.6, p.s * 0.7, p.s]}><icosahedronGeometry args={[1, 0]} /><meshLambertMaterial color={color} flatShading transparent opacity={p.o} /></mesh>; })}</group>; };
export const RestrictedZone = ({frame = 0, r = 9, h = 6}) => <group>
  <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[r, r, h, 40, 1, true]} /><meshBasicMaterial color="#ff3a2a" transparent opacity={0.09 + 0.03 * Math.sin(frame * 0.2)} side={THREE.DoubleSide} depthWrite={false} /></mesh>
  <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r - 0.12, r + 0.12, 60]} /><meshBasicMaterial color="#ff5a3a" /></mesh>
  <mesh position={[0, 0.2 + h, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r - 0.08, r + 0.08, 60]} /><meshBasicMaterial color="#ff5a3a" transparent opacity={0.5} /></mesh>
  <group position={[0, 2.6 + Math.sin(frame * 0.08) * 0.2, 0]} rotation={[0, frame * 0.04, 0]}><mesh><octahedronGeometry args={[0.7, 0]} /><meshBasicMaterial color="#ffb040" wireframe /></mesh><mesh><octahedronGeometry args={[0.28, 0]} /><meshBasicMaterial color="#ffb040" /></mesh></group>
</group>;
