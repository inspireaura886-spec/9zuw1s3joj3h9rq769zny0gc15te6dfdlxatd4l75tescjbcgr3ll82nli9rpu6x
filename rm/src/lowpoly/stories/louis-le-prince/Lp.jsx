// "He Shot the First Known Film. Then Vanished." (Louis Le Prince, Dijon -> Paris 16 Sep 1890) - low-poly 3D Short, hook A/B (only scenes 0-1 differ, cut at frame 105).
// Style: lowpoly main + RouteGlobe interstitial (scene 8). 25 scenes on the cues.json cuts. <= 2 Rigged per scene, no Grab3D props (set is box-built).
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, FogLayer, Rigged, Glow, Grade, clamp01, usePreload, RouteGlobe} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy} from '../uvb-76/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const LP_FRAMES = Math.round(57.2 * FPS);
const W = VO.words;
const CS = [0.0, 1.72, 3.50, 5.58, 7.6, 10.16, 12.63, 14.23, 16.37, 20.26, 21.53, 24.01, 26.03, 28.23, 31.0, 33.2, 35.67, 38.47, 39.93, 42.37, 43.59, 46.07, 48.29, 50.25, 52.85];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? LP_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);
const Man = ({p, clip = 'idle', rot = 0, s = 0.6, t = 0, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const Blk = ({p, s = 1, c = '#3a3a4c', rot = 0}) => <group position={p} rotation={[0, rot, 0]} scale={s}><Bx p={[0, 0.55, 0]} s={[0.5, 0.9, 0.3]} c={c} /><Bx p={[0, 1.2, 0]} s={[0.3, 0.3, 0.3]} c="#d8b090" /><Bx p={[0, 1.4, 0]} s={[0.36, 0.1, 0.36]} c="#16161a" /></group>;

const PAL = (mid, hor, sky, rim, sunI = 1.5) => ({top: '#04060c', mid, hor, fog: mid, amb: 1.0, hemiSky: sky, hemiGround: '#1c2026', hemiI: 1.9, sun: '#ffe4c0', sunI, sunPos: [-10, 20, 12], rim, rimI: 1.1, rimPos: [0, 8, -20], glow: 1});
const DUSK = PAL('#241c2c', '#7a5058', '#d8c8e0', '#ffb070');
const PARIS = PAL('#1c2434', '#566a88', '#c8d4ec', '#ffd8a0');
const NIGHT = PAL('#080c18', '#1a2438', '#8a9ac0', '#6a90d0', 1.0);
const GARDEN = PAL('#2a4a38', '#b0c878', '#eaf4d0', '#ffe8a0', 1.9);
const RED = PAL('#2a0c10', '#a8302a', '#ffc0b0', '#ff4a3a');
const ARCH = PAL('#201810', '#6a5238', '#f0d8b0', '#ffc070');

const Steam = ({p, f, n = 7, k = 1}) => <group position={p}>{Array.from({length: n}, (_, i) => { const t = ((f * 0.018 * k) + i / n) % 1; return <mesh key={i} position={[t * 2.2, t * 4.2, (i % 3 - 1) * 0.25]} scale={0.35 + t * 1.5}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#e6e6ea" transparent opacity={0.55 * (1 - t)} depthWrite={false} /></mesh>; })}</group>;
const Wheel = ({p, r = 0.5, ang = 0}) => <group position={p} rotation={[0, 0, -ang]}><Cy a={[r, r, 0.14, 12]} r={[Math.PI / 2, 0, 0]} c="#1a1c20" /><Bx p={[0, 0, 0.09]} s={[r * 1.8, 0.07, 0.04]} c="#8a8f96" /><Bx p={[0, 0, 0.09]} s={[0.07, r * 1.8, 0.04]} c="#8a8f96" /></group>;
// one passenger carriage, 8 long; gap = open compartment in the front wall (x -1.7..1.7) with benches, an empty luggage rack and an open door
const Carriage = ({x = 0, gap = false, ang = 0, win = true, lit = '#ffcf80', bag = false, pax = 0, rackGap = false}) => <group position={[x, 0, 0]}>
  <Bx p={[0, 0.9, 0]} s={[8, 0.2, 2.8]} c="#2a2c2e" /><Bx p={[0, 3.4, 0]} s={[8.2, 0.25, 3]} c="#26302e" /><Bx p={[0, 3.62, 0]} s={[7.6, 0.22, 1.6]} c="#1e2624" />
  <Bx p={[0, 2.15, -1.35]} s={[8, 2.5, 0.15]} c="#1f3a2c" /><Bx p={[-4, 2.15, 0]} s={[0.15, 2.5, 2.8]} c="#1a3226" /><Bx p={[4, 2.15, 0]} s={[0.15, 2.5, 2.8]} c="#1a3226" />
  {!gap ? <><Bx p={[0, 2.15, 1.35]} s={[8, 2.5, 0.15]} c="#1f3a2c" />{[-2.7, -0.9, 0.9, 2.7].map((wx, i) => <Bx key={i} p={[wx, 2.3, 1.45]} s={[1.1, 1.0, 0.08]} c={lit} e={lit} ei={0.9} />)}</>
    : <><Bx p={[-2.85, 2.15, 1.35]} s={[2.3, 2.5, 0.15]} c="#1f3a2c" /><Bx p={[2.85, 2.15, 1.35]} s={[2.3, 2.5, 0.15]} c="#1f3a2c" /><Bx p={[0, 3.2, 1.35]} s={[3.4, 0.5, 0.15]} c="#1f3a2c" /><Bx p={[0, 1.2, 1.35]} s={[3.4, 0.5, 0.15]} c="#1f3a2c" />
      <Bx p={[-1.75, 2.15, 1.9]} s={[0.1, 2.0, 1.5]} c="#4a3020" r={[0, 0.9, 0]} />
      <Bx p={[0, 1.35, -0.75]} s={[3.0, 0.45, 0.9]} c="#6a2428" /><Bx p={[0, 2.0, -1.2]} s={[3.0, 0.95, 0.14]} c="#5a1c20" />
      <Cy a={[0.04, 0.04, 3.2, 6]} r={[0, 0, Math.PI / 2]} p={[0, 2.95, -1.0]} c="#c8a050" /><Cy a={[0.04, 0.04, 3.2, 6]} r={[0, 0, Math.PI / 2]} p={[0, 2.95, -0.55]} c="#c8a050" />
      {[-1.4, 1.4].map((bx, i) => <Bx key={i} p={[bx, 2.8, -0.8]} s={[0.05, 0.3, 0.7]} c="#c8a050" />)}
      {rackGap && <Bx p={[0.2, 2.97, -0.78]} s={[1.5, 0.02, 0.5]} c="#4a3c2c" e="#6a5238" ei={0.25} />}
      {bag && <group position={[0.2, 3.2, -0.78]}><Bx p={[0, 0, 0]} s={[1.3, 0.55, 0.42]} c="#6a3f22" /><Bx p={[0, 0, 0.22]} s={[1.0, 0.08, 0.02]} c="#d8b050" e="#d8b050" ei={0.4} /></group>}
      <Glow position={[0, 3.0, 0.2]} size={4.5} color="#ffcf80" opacity={0.45} />
      {pax >= 1 && <Blk p={[-1.0, 1.5, -0.7]} c="#4a5a6a" />}{pax >= 2 && <Blk p={[1.0, 1.5, -0.7]} c="#6a4a4a" rot={0.2} />}</>}
  <Wheel p={[-2.6, 0.5, 0.95]} ang={ang} /><Wheel p={[2.6, 0.5, 0.95]} ang={ang} /><Wheel p={[-2.6, 0.5, -0.95]} ang={ang} /><Wheel p={[2.6, 0.5, -0.95]} ang={ang} />
</group>;
const Loco = ({x = 10, ang = 0, f = 0}) => <group position={[x, 0, 0]}>
  <Bx p={[0, 0.9, 0]} s={[8, 0.3, 2.6]} c="#16181c" /><Cy a={[0.95, 0.95, 5.2, 12]} r={[0, 0, Math.PI / 2]} p={[1.2, 2.1, 0]} c="#1a1d22" />
  <Cy a={[0.38, 0.55, 1.5, 8]} p={[3.0, 3.6, 0]} c="#22262c" /><Cy a={[0.4, 0.4, 0.6, 8]} p={[0.2, 3.2, 0]} c="#b08a40" />
  <Bx p={[-2.6, 2.5, 0]} s={[2.4, 3.0, 2.7]} c="#1c2a22" /><Bx p={[-2.6, 4.1, 0]} s={[2.8, 0.2, 3.0]} c="#0e1612" /><Bx p={[-2.6, 2.9, 1.36]} s={[1.0, 0.8, 0.06]} c="#ffcf80" e="#ffcf80" ei={1.0} />
  <Bx p={[4.2, 1.2, 0]} s={[0.4, 0.8, 2.4]} c="#7a1c1c" /><Glow position={[4.5, 2.1, 0]} size={3.2} color="#fff0c0" opacity={0.85} />
  {[-2.6, -0.4, 1.8].map((wx, i) => <Wheel key={i} p={[wx, 0.8, 1.15]} r={0.8} ang={ang * 0.6} />)}{[-2.6, -0.4, 1.8].map((wx, i) => <Wheel key={'b' + i} p={[wx, 0.8, -1.15]} r={0.8} ang={ang * 0.6} />)}
  <Steam p={[3.0, 4.3, 0]} f={f} k={1.3} /></group>;
const Train = ({x = 0, gap = true, f = 0, bag = false, rackGap = false, pax = 0, ang = 0}) => <group position={[x, 0, 0]}><Carriage x={0} gap={gap} ang={ang} bag={bag} rackGap={rackGap} pax={pax} /><Carriage x={-8.3} ang={ang} /><Loco x={9.2} ang={ang} f={f} /></group>;
const Lamp = ({x, z = 2.3, lit = true}) => <group position={[x, 0, z]}><Cy a={[0.07, 0.1, 3.4, 6]} p={[0, 2.3, 0]} c="#1a1c20" /><Bx p={[0, 4.1, 0]} s={[0.34, 0.5, 0.34]} c="#ffe0a0" e="#ffcf80" ei={lit ? 1.2 : 0} />{lit && <Glow position={[0, 4.1, 0]} size={3.6} color="#ffcf80" opacity={0.7} />}</group>;
const Station = ({f, lamps = true, rails = true, fog = '#8a90a8'}) => <group>
  <Bx p={[0, -0.1, 0]} s={[90, 0.2, 40]} c="#22242a" /><Bx p={[0, 0.3, 4.6]} s={[90, 0.6, 6]} c="#5a5650" /><Bx p={[0, 0.62, 1.7]} s={[90, 0.06, 0.25]} c="#e0d8b0" />
  {rails && [-0.7, 0.7].map((z, i) => <Bx key={i} p={[0, 0.12, z]} s={[90, 0.12, 0.12]} c="#6a6e76" />)}
  {rails && Array.from({length: 40}, (_, i) => <Bx key={'s' + i} p={[-48 + i * 2.4, 0.04, 0]} s={[0.4, 0.08, 2.4]} c="#2a2018" />)}
  <Bx p={[0, 5, -14]} s={[90, 11, 0.5]} c="#2a3038" />{Array.from({length: 12}, (_, i) => <Bx key={'w' + i} p={[-33 + i * 6, 4.4, -13.7]} s={[1.6, 2.6, 0.1]} c="#ffcf80" e="#ffb060" ei={0.55} />)}
  {[-30, -18, -6, 6, 18, 30].map((x, i) => <Bx key={'c' + i} p={[x, 7.2, 2]} s={[0.4, 0.4, 16]} c="#1a1e24" />)}<Bx p={[0, 7.4, 4.6]} s={[90, 0.3, 0.3]} c="#1a1e24" />
  {lamps && [-16, -9, 9, 16].map((x, i) => <Lamp key={i} x={x} z={6.6} />)}
  <FogLayer y={0.9} size={70} layers={2} thickness={1} color={fog} opacity={0.12} frame={f} center={[0, 0]} /></group>;
// giant mahogany single-lens camera on a tripod (the Le Prince camera), crank turning
const Cine = ({p = [0, 0, 0], s = 1, f = 0, rot = 0}) => <group position={p} rotation={[0, rot, 0]} scale={s}>
  {[[-0.6, -0.5], [0.6, -0.5], [0, 0.7]].map(([lx, lz], i) => <Cy key={i} a={[0.06, 0.1, 2.4, 6]} p={[lx, 1.1, lz]} r={[lz * 0.18, 0, -lx * 0.2]} c="#3a2412" />)}
  <Bx p={[0, 2.35, 0]} s={[1.3, 1.1, 1.9]} c="#6b3a1f" /><Bx p={[0, 2.95, -0.3]} s={[0.9, 0.35, 1.0]} c="#5a2e18" /><Bx p={[0, 2.35, 0]} s={[1.34, 0.08, 1.94]} c="#c8a050" />
  <Cy a={[0.38, 0.45, 1.0, 12]} r={[Math.PI / 2, 0, 0]} p={[0, 2.35, 1.4]} c="#b8964a" e="#6a4a10" ei={0.3} /><Glow position={[0, 2.35, 1.95]} size={0.6} color="#9ad8ff" opacity={0.55} />
  <group position={[0.8, 2.35, -0.3]} rotation={[f * 0.35, 0, 0]}><Bx p={[0.12, 0.35, 0]} s={[0.08, 0.7, 0.08]} c="#c8a050" /><Bx p={[0.2, 0.7, 0]} s={[0.14, 0.14, 0.14]} c="#3a2412" /></group></group>;
const Tree = ({p, s = 1}) => <group position={p} scale={s}><Cy a={[0.18, 0.26, 2.0, 6]} p={[0, 1, 0]} c="#4a3220" /><Cy a={[0, 1.5, 3.0, 7]} p={[0, 3.2, 0]} c="#2e6a3a" /><Cy a={[0, 1.1, 2.2, 7]} p={[0, 4.4, 0]} c="#3a7e44" /></group>;
const Garden = ({f}) => <group><Bx p={[0, -0.1, 0]} s={[80, 0.2, 60]} c="#4a8a48" /><Bx p={[0, 0.0, 0]} s={[8, 0.02, 8]} c="#5a9a52" />
  {[[-9, -6, 1.2], [9, -7, 1.4], [-13, 0, 1.0], [12, 1, 1.2], [-6, -11, 1.5], [5, -12, 1.3], [16, -5, 1.1], [-16, -6, 1.3]].map(([x, z, s], i) => <Tree key={i} p={[x, 0, z]} s={s} />)}
  <Bx p={[0, 0.5, -9]} s={[30, 1, 0.8]} c="#2e5a34" /><Bx p={[-16, 0.5, -3]} s={[0.8, 1, 14]} c="#2e5a34" /><Bx p={[16, 0.5, -3]} s={[0.8, 1, 14]} c="#2e5a34" />
  {Array.from({length: 7}, (_, i) => { const a = i / 7 * 6.283 + f * 0.012; return <Blk key={i} p={[Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4 - 1]} rot={-a} c={['#6a4a4a', '#4a5a6a', '#7a6a4a', '#5a4a6a'][i % 4]} />; })}</group>;

const S = [];
const mk = (i, {pal, fog = [30, 120], pills = [], cam, children, flash = [], extra = null, bloom = 1.4, card = null}) => { S[i] = ({hook = 'A'}) => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.5} color="#ffffff" len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d, hook)}<Post bloom={bloom} threshold={0.4} vignette={0.42} /></Stage>; }; };
const push = (from, to, look, d, fov = [58, 46], shake = 0) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={52} fov1={44} start={0} end={d} ease="inout" />;
const G = (i, f) => f + C[i]; // global frame

// 0 HOOK. A: giant camera foreground + train pulling out, tall figure in the window. B: arrived train at Paris, open empty compartment, empty rack.
const P0 = {from: [3.2, 3.1, 16.0], to: [1.4, 2.6, 12.2]};
const HOOK_A = [['FIRST FILM.', 236, 'yellow', 66, 0.0], ['THEN GONE.', 316, 'red', 66, 0.15]];
const HOOK_B = [['TRAIN ARRIVED.', 236, 'yellow', 60, 0.0], ["HE DIDN'T.", 316, 'red', 66, 0.15]];
const hookPills = (hook, shift) => (hook === 'B' ? HOOK_B : HOOK_A).map(([t, y, v, s, sec]) => [t, y, v, s, sec - shift]);
S[0] = ({hook = 'A'}) => { const f = useCurrentFrame(); const d = dur(0); const g = f;
  const pills = hookPills(hook, 0);
  return <Stage palette={hook === 'B' ? PARIS : DUSK} fog={[40, 140]} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={at(sec) - 7} size={s} />)}</>}>
    {hook === 'A' ? push(P0.from, P0.to, [[0, 2.0, 2], [0, 1.9, 1]], d, [64, 46], 0.7) : push([1.5, 2.6, 12.5], [0.2, 2.3, 9.2], [[0, 2.2, 0.5], [0, 2.4, -0.4]], d, [60, 44], 0.5)}
    <Station f={f} />
    {hook === 'A' ? <><Train x={0.0025 * g * g} f={f} ang={g * 0.25} /><Man p={[0.0025 * g * g, 1.0, 0.1]} clip="idle" rot={0} s={0.8} i={0} /><Cine p={[-0.2, 0.6, 7.0]} s={2.1} f={f} rot={0.25} /></>
      : <><Train x={0} f={f} rackGap /><Blk p={[-3.2, 0.6, 4.6]} /><Blk p={[3.5, 0.6, 5.2]} c="#5a4a4a" /></>}
    <Particles kind="dust" count={60} center={[0, 3, 4]} area={[16, 6, 10]} frame={f} /><Post bloom={1.5} threshold={0.4} vignette={0.42} /></Stage>; };
S[1] = ({hook = 'A'}) => { const f = useCurrentFrame(); const d = dur(1); const g = G(1, f);
  const pills = hookPills(hook, CS[1]);
  return <Stage palette={hook === 'B' ? PARIS : DUSK} fog={[40, 140]} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={at(sec) - 2} size={s} />)}</>}>
    {hook === 'A' ? push([-5, 1.6, 8], [2, 2.2, 6.4], [[3, 2, 0], [5, 2, 0]], d, [58, 44], 0.5) : push([-1.0, 2.7, 6.5], [0.1, 2.9, 4.4], [[0.2, 2.5, -0.8], [0.2, 2.9, -0.8]], d, [54, 44])}
    <Station f={f} />
    {hook === 'A' ? <><Train x={0.0025 * g * g} f={g} ang={g * 0.25} /><Man p={[0.0025 * g * g, 1.0, 0.1]} clip="idle" rot={0} s={0.8} i={0} /></> : <><Train x={0} f={g} rackGap /></>}
    <Post bloom={1.5} threshold={0.4} vignette={0.42} /></Stage>; };
mk(2, {pal: DUSK, pills: [['DIJON, 1890', 236, 'yellow', 56, 3.7]], cam: (d) => orbit([0, 2, 2], -0.7, -0.3, 17, 13, 5, 3.4, d), children: (f) => <><Station f={f} /><Train x={0} f={f} gap={false} /><Blk p={[1.5, 0.6, 4.8]} /><Blk p={[-3, 0.6, 5.5]} c="#5a4a4a" /></>});
mk(3, {pal: DUSK, pills: [['LE PRINCE', 236, 'yellow', 52, 5.6], ['& BROTHER ALBERT', 316, 'red', 40, 6.1]], cam: (d) => push([4.5, 1.9, 9.5], [1.8, 2.1, 7.2], [[0, 1.7, 3.8], [0, 1.7, 3.6]], d, [56, 42]), children: (f) => <><Station f={f} /><Train x={0} f={f} gap={false} />
    <Man p={[-0.6, 0.6, 3.1]} clip="walk" rot={Math.PI} s={0.82} t={f / FPS} i={0} /><Man p={[1.6, 0.6, 4.4]} clip="emote-yes" rot={Math.PI * 0.82} s={0.6} t={f / FPS} i={1} /></>});
mk(4, {pal: DUSK, pills: [['SUITCASE', 236, 'yellow', 56, 8.1], ['OF PATENTS?', 316, 'red', 54, 8.9]], cam: (d) => orbit([0, 1.2, 4.6], 0.3, -0.35, 5.2, 3.4, 2.4, 1.7, d), children: (f) => <><Station f={f} /><Train x={0} f={f} gap={false} />
    <group position={[0, 0.6, 4.6]}><Bx p={[0, 0.4, 0]} s={[1.1, 0.75, 0.4]} c="#6a3f22" /><Bx p={[0, 0.4, 0.21]} s={[1.0, 0.08, 0.02]} c="#d8b050" e="#d8b050" ei={0.5} /><Bx p={[-0.3, 0.4, 0.21]} s={[0.1, 0.5, 0.02]} c="#2a1608" /><Bx p={[0.3, 0.4, 0.21]} s={[0.1, 0.5, 0.02]} c="#2a1608" /><Glow position={[0, 0.9, 0]} size={2.4} color="#ffcf80" opacity={0.5} />
      {[0, 1, 2, 3, 4].map((k) => <Bx key={k} p={[Math.sin(f * 0.04 + k * 1.3) * 0.8, 1.3 + ((f * 0.01 + k * 0.2) % 1) * 1.2, Math.cos(f * 0.04 + k * 1.3) * 0.5]} s={[0.3, 0.02, 0.4]} c="#f2e8cc" r={[f * 0.05 + k, f * 0.03, 0]} />)}</group></>});
mk(5, {pal: GARDEN, pills: [['LEEDS', 236, 'yellow', 58, 11.0], ['2 YEARS EARLIER', 316, 'dark', 38, 10.3]], cam: (d) => push([-8, 3.2, 9.5], [-3.6, 2.3, 6.4], [[0, 1, -1], [0, 1, -1]], d, [56, 44]), children: (f) => <><Garden f={f} /><Cine p={[4.5, 0, 4]} s={0.8} f={f} rot={-2.4} /></>});
mk(6, {pal: GARDEN, pills: [['HE FILMED', 236, 'yellow', 56, 12.8]], flash: [12.7], cam: (d) => orbit([4.5, 2.4, 4], 1.2, 2.2, 5.5, 3.6, 2.6, 2.4, d), children: (f) => <><Garden f={f} /><Cine p={[4.5, 0, 4]} s={1.1} f={f} rot={-2.4} /></>});
mk(7, {pal: GARDEN, bloom: 1.2, cam: (d) => orbit([0, 1, -1], 2.2, 2.9, 11, 8, 4, 3, d), children: (f) => <Garden f={f} />, card: (f, d) => <PhotoCard src="leprince/IMG2.jpg" credit="Roundhay Garden Scene, 1888 (public domain)" tag="OLDEST SURVIVING FILM" delay={0} dur={d} />});
S[8] = () => <AbsoluteFill><RouteGlobe labelY={960} dur={dur(8)} title="DIJON TO PARIS, 1890" stops={[{lat: 47.322, lon: 5.041, label: 'DIJON', date: '16 SEP 1890'}, {lat: 48.857, lon: 2.352, label: 'PARIS', date: 'FRIENDS WAIT'}, {lat: 40.713, lon: -74.006, label: 'NEW YORK?', date: 'PLANNED SCREENING'}]} /></AbsoluteFill>;
mk(9, {pal: PARIS, pills: [['PARIS', 236, 'yellow', 62, 20.5], ['FRIENDS WAIT', 316, 'dark', 46, 20.8]], cam: (d) => push([-6, 1.9, 10.5], [-1.2, 2.1, 8.2], [[0, 1.6, 3.5], [0, 1.6, 3.5]], d, [56, 44]), children: (f, d) => <><Station f={f} /><Train x={-26 + 26 * (1 - Math.pow(1 - clamp01(f / d), 2))} f={f} gap={false} />
    <Man p={[-2.4, 0.6, 5.0]} clip="idle" rot={0.2} s={0.6} t={f / FPS} i={2} /><Man p={[-1.2, 0.6, 5.4]} clip="idle" rot={-0.1} s={0.6} t={f / FPS + 0.5} i={1} /><Blk p={[2.5, 0.6, 5.0]} c="#6a5a4a" /></>});
mk(10, {pal: PARIS, pills: [['NOT ON', 236, 'red', 62, 21.53], ['THE TRAIN', 316, 'yellow', 62, 21.7]], flash: [21.53], bloom: 1.6, cam: (d) => push([1.6, 2.6, 9.0], [0.1, 2.2, 5.2], [[0, 2.2, 0], [0, 2.2, -0.5]], d, [54, 38], 0.5), children: (f) => <><Station f={f} /><Train x={0} f={f} rackGap />
    {[-5, -3.6, 4, 5.5].map((x, i) => <Blk key={i} p={[x + Math.sin(f * 0.03 + i) * 0.4, 0.6, 5 + (i % 2) * 0.8]} c={['#4a5a6a', '#6a4a4a', '#5a5a4a', '#4a4a5a'][i]} rot={i} />)}</>});
mk(11, {pal: PARIS, pills: [['6 FT 4', 236, 'yellow', 70, 24.3]], cam: (d) => push([-4.5, 1.1, 9.5], [-1.4, 1.5, 8.4], [[0, 2.6, 4.2], [0, 2.7, 4.2]], d, [56, 46]), children: (f) => <><Station f={f} /><Train x={0} f={f} gap={false} />
    <Man p={[0, 0.6, 4.2]} clip="idle" rot={0.1} s={0.86} t={f / FPS} i={0} /><Man p={[1.6, 0.6, 4.6]} clip="idle" rot={-0.2} s={0.58} t={f / FPS} i={3} /><Blk p={[-1.7, 0.6, 4.8]} s={0.95} /><Blk p={[3.0, 0.6, 5.2]} s={0.95} c="#5a4a4a" />
    <Bx p={[-0.9, 2.5, 4.2]} s={[0.04, 3.6, 0.04]} c="#ffcf80" e="#ffcf80" ei={0.8} />{[0, 1, 2, 3, 4].map((k) => <Bx key={k} p={[-0.8, 0.8 + k * 0.72, 4.2]} s={[0.35, 0.04, 0.04]} c="#ffcf80" e="#ffcf80" ei={0.8} />)}</>});
mk(12, {pal: PARIS, pills: [['NOT ONE', 236, 'red', 58, 26.0], ['SAW HIM', 316, 'yellow', 56, 26.5]], cam: (d) => push([0.4, 2.6, 8.0], [0.0, 2.2, 4.8], [[0, 2.0, -0.5], [0, 2.0, -0.5]], d, [58, 44]), children: (f) => <><Station f={f} /><Train x={0} f={f} pax={2} /><Man p={[-0.2, 1.1, -0.35]} clip="sit" rot={0} s={0.55} t={0} i={1} /></>});
mk(13, {pal: NIGHT, pills: [['FRENCH POLICE', 236, 'yellow', 48, 28.3], ['+ SCOTLAND YARD', 316, 'red', 44, 29.0]], cam: (d) => orbit([0, 1.2, 1], -0.9, -0.3, 11, 8, 2.6, 2.0, d), children: (f) => <><Station f={f} lamps={false} fog="#5a6a90" />
    {[0, 1].map((i) => { const x = -6 + i * 3.4 + f * 0.02; return <group key={i}><Man p={[x, 0.2, 0.2 + i * 0.5]} clip="walk" rot={-Math.PI / 2} s={0.6} t={f / FPS + i * 0.3} i={i + 1} /><Glow position={[x + 0.6, 1.3, 0.5 + i * 0.5]} size={2.6} color="#ffcf80" opacity={0.85} /></group>; })}
    <Blk p={[-1 + f * 0.02, 0.2, -0.5]} rot={-Math.PI / 2} c="#2a2a3a" /><Glow position={[-0.4 + f * 0.02, 1.4, -0.3]} size={2.4} color="#ffcf80" opacity={0.8} /></>});
mk(14, {pal: NIGHT, pills: [['NO BODY.', 236, 'yellow', 62, 31.0], ['NO SUITCASE.', 316, 'red', 56, 31.2]], flash: [31.0], cam: (d) => push([0, 1.1, 8.0], [0, 0.9, 3.2], [[0, 0.6, -8], [0, 0.6, -8]], d, [60, 46], 0.4), children: (f) => <><Station f={f} lamps={false} fog="#5a6a90" /><Lamp x={-3} z={2.4} lit={Math.sin(f * 0.7) > -0.5} />
    <Bx p={[3.5, 0.95, 4.4]} s={[2.0, 0.12, 0.6]} c="#3a2a1c" /><Bx p={[3.5, 0.6, 4.4]} s={[0.1, 0.6, 0.5]} c="#1a1a1e" /><Particles kind="dust" count={50} center={[0, 2, 2]} area={[10, 4, 8]} frame={f} /></>});
mk(15, {pal: NIGHT, pills: [['1897', 236, 'yellow', 72, 33.2], ['"DECLARED DEAD"', 316, 'dark', 40, 34.4]], cam: (d) => orbit([0, 1.6, 0], 0.4, -0.4, 9, 6, 4, 2.4, d), children: (f) => <><Bx p={[0, -0.1, 0]} s={[60, 0.2, 60]} c="#14181e" /><Bx p={[0, 1.2, 0]} s={[1.5, 2.4, 0.45]} c="#8a8e96" /><Bx p={[0, 2.8, 0]} s={[0.3, 1.2, 0.3]} c="#8a8e96" /><Bx p={[0, 2.9, 0]} s={[1.0, 0.3, 0.3]} c="#8a8e96" />
    {[-4, 4, -6, 6].map((x, i) => <Bx key={i} p={[x, 0.7, -3 - (i % 2) * 2]} s={[0.9, 1.4, 0.3]} c="#5a5e66" />)}<Glow position={[0, 3, 1]} size={7} color="#9ab0e0" opacity={0.25} /><FogLayer y={0.4} size={50} layers={2} thickness={1} color="#8a9ac0" opacity={0.14} frame={f} center={[0, 0]} /></>});
mk(16, {pal: RED, pills: [['HIS WIFE BLAMES', 236, 'yellow', 44, 35.8], ['EDISON', 316, 'red', 66, 37.2]], flash: [37.2], cam: (d) => orbit([0, 2.2, 0], 0.6, -0.3, 9, 6.5, 3.4, 2.6, d), children: (f) => <><Bx p={[0, -0.1, 0]} s={[40, 0.2, 40]} c="#1c1014" />
    <mesh position={[0, 3.4, 0]} scale={1.3 + Math.sin(f * 0.15) * 0.05}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color="#fff0b0" /></mesh><Cy a={[0.5, 0.5, 0.8, 8]} p={[0, 2.2, 0]} c="#6a6a70" /><Glow position={[0, 3.4, 0]} size={10} color="#ffd070" opacity={0.7} />
    <Man p={[2.2, 0, 1.5]} clip="idle" rot={-0.5} s={0.7} t={f / FPS} i={2} /><Particles kind="sparks" count={40} center={[0, 1, 0]} area={[4, 5, 4]} frame={f} /></>});
mk(17, {pal: ARCH, pills: [['113 YEARS LATER', 236, 'red', 42, 38.5]], cam: (d) => push([0, 2.6, 9], [0, 2.2, 5], [[0, 2, -4], [0, 2, -4]], d, [58, 44]), children: (f) => <><Bx p={[0, -0.1, 0]} s={[40, 0.2, 40]} c="#2a2018" /><Bx p={[0, 4, -7]} s={[24, 8, 0.4]} c="#3a2c20" />
    {[0, 1, 2, 3].map((r) => [-9, -5.5, -2, 1.5, 5, 8.5].map((x, k) => <Bx key={r + '-' + k} p={[x, 1 + r * 1.7, -6.4]} s={[3.1, 1.4, 0.8]} c={['#c8b088', '#a89068', '#d8c498', '#b8a078'][(r + k) % 4]} />))}<Glow position={[0, 6.5, -2]} size={8} color="#ffd890" opacity={0.4} /><Particles kind="dust" count={70} center={[0, 3, -2]} area={[14, 6, 10]} frame={f} /></>});
mk(18, {pal: ARCH, pills: [['2003:', 236, 'yellow', 62, 39.93], ['A DROWNED MAN', 316, 'red', 46, 40.1]], flash: [39.93], bloom: 1.6, cam: (d) => push([1.5, 3.0, 7.0], [0.1, 2.6, 3.6], [[0, 2.4, 0], [0, 2.4, 0]], d, [54, 38], 0.4), children: (f) => <><Bx p={[0, -0.1, 0]} s={[40, 0.2, 40]} c="#2a2018" /><Bx p={[0, 1.0, 0]} s={[5, 0.2, 3]} c="#4a3626" />
    <group position={[0, 2.6 + Math.sin(f * 0.07) * 0.08, 0]} rotation={[0.2, Math.sin(f * 0.05) * 0.15, 0]}><Bx p={[0, 0, 0]} s={[2.4, 3.0, 0.08]} c="#e8dcc0" /><Bx p={[0, 0.2, 0.06]} s={[1.9, 2.0, 0.04]} c="#5a5448" /><Bx p={[0, 0.5, 0.1]} s={[0.5, 0.5, 0.04]} c="#2a2824" /><Bx p={[0, -0.2, 0.1]} s={[0.9, 1.0, 0.04]} c="#2a2824" /></group>
    <Glow position={[0, 3, 1.5]} size={6} color="#ffe0a0" opacity={0.5} /><Particles kind="dust" count={60} center={[0, 3, 0]} area={[10, 5, 8]} frame={f} /></>});
mk(19, {pal: NIGHT, pills: [['SEINE', 236, 'yellow', 58, 42.5], ['1890', 316, 'dark', 56, 43.0]], cam: (d) => push([0, 5.5, 10], [0, 1.6, 6.0], [[0, 0.2, 0], [0, 0.2, 0]], d, [58, 46]), children: (f) => <><Bx p={[0, -0.4, 0]} s={[60, 0.2, 60]} c="#12303c" e="#0a2430" ei={0.4} /><Bx p={[0, 1.4, -4]} s={[40, 0.5, 2.5]} c="#3a3e48" />{[-12, -6, 0, 6, 12].map((x, i) => <Bx key={i} p={[x, 0.4, -4]} s={[1.0, 2.0, 2.2]} c="#2a2e38" />)}<Lamp x={-3} z={-3} /><Lamp x={5} z={-3} />
    {[0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} position={[-6 + k * 2.4, -0.28, 2 + Math.sin(f * 0.05 + k) * 0.6]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + 0.4 * ((f * 0.02 + k * 0.17) % 1)}><ringGeometry args={[0.8, 0.9, 16]} /><meshBasicMaterial color="#9ac0d8" transparent opacity={0.5 * (1 - ((f * 0.02 + k * 0.17) % 1))} depthWrite={false} /></mesh>)}<FogLayer y={0.2} size={60} layers={2} thickness={0.8} color="#5a6a90" opacity={0.18} frame={f} center={[0, 0]} /></>});
mk(20, {pal: ARCH, bloom: 1.2, cam: (d) => orbit([0, 2, 0], 0.3, -0.3, 11, 9, 4, 3, d), children: (f) => <><Bx p={[0, -0.1, 0]} s={[40, 0.2, 40]} c="#2a2018" /><Bx p={[0, 4, -7]} s={[24, 8, 0.4]} c="#3a2c20" /></>, card: (f, d) => <PhotoCard src="leprince/IMG1.jpg" credit="Louis Le Prince, 1880s (public domain)" tag="LOOKS LIKE HIM" delay={0} dur={d} zoom={[1.02, 1.12]} pan={[0, -20]} rot={2} />});
mk(21, {pal: RED, pills: [['TOO SHORT', 236, 'red', 62, 46.1]], flash: [46.07], cam: (d) => push([-5, 1.6, 9], [-1.5, 2.0, 7], [[0, 1.7, 0], [0, 1.7, 0]], d, [56, 44], 0.3), children: (f) => <><Bx p={[0, -0.1, 0]} s={[40, 0.2, 40]} c="#2a1014" /><Man p={[-1.3, 0, 0]} clip="idle" rot={0.15} s={0.86} t={f / FPS} i={0} /><Man p={[1.3, 0, 0]} clip="idle" rot={-0.15} s={0.58} t={f / FPS} i={3} />
    <Bx p={[-2.6, 2.2, 0]} s={[0.04, 4.4, 0.04]} c="#ffcf80" e="#ffcf80" ei={0.8} /><Bx p={[2.6, 1.5, 0]} s={[0.04, 3.0, 0.04]} c="#ffcf80" e="#ffcf80" ei={0.8} /><Glow position={[0, 2, -2]} size={9} color="#ff4a3a" opacity={0.3} /></>});
mk(22, {pal: NIGHT, pills: [['THE BROTHER', 236, 'yellow', 52, 48.4], ['SAW HIM LAST', 316, 'red', 46, 49.2]], cam: (d) => push([5, 1.8, 9.5], [2.2, 2.0, 7.4], [[0, 1.5, 4.4], [0, 1.5, 4.4]], d, [56, 44]), children: (f) => <><Station f={f} fog="#5a6a90" /><Man p={[0, 0.6, 4.4]} clip="idle" rot={Math.PI * 0.55} s={0.6} t={f / FPS} i={1} />
    <Glow position={[-6 - f * 0.12, 1.8, 0]} size={2.6} color="#ff3a20" opacity={0.9} /></>});
mk(23, {pal: RED, pills: [["MOTHER'S WILL", 236, 'yellow', 46, 51.2], ['A BITTER ROW?', 316, 'red', 40, 51.9]], cam: (d) => orbit([0, 1.4, 0], -0.4, 0.4, 7, 5.5, 2.6, 2.2, d), children: (f) => <><Bx p={[0, -0.1, 0]} s={[40, 0.2, 40]} c="#2a1014" /><Man p={[-1.0, 0, 0]} clip="emote-no" rot={0.9} s={0.62} t={f / FPS} i={1} /><Man p={[1.0, 0, 0]} clip="emote-no" rot={-0.9} s={0.62} t={f / FPS + 0.4} i={2} />
    <Bx p={[0, 1.8 + Math.sin(f * 0.1) * 0.15, 0]} s={[0.8, 0.02, 1.0]} c="#f2e8cc" r={[0.5, f * 0.04, 0.2]} /><Glow position={[0, 2, -2]} size={9} color="#ff4a3a" opacity={0.3} /></>});
// 24 END: frame 0's platform set (A): train at the platform, giant camera foreground, same camera pose as frame 0 on the last frame; headline in the frame-0 title box
S[24] = () => { const f = useCurrentFrame(); const d = dur(24); const g = C[24] + f;
  return <Stage palette={DUSK} fog={[40, 140]} overlay={<><Pill text="EDISON?" y={236} variant="yellow" delay={0} size={66} /><Pill text="OR HIS BROTHER?" y={316} variant="red" delay={6} size={56} /></>}>
    {push([-1.2, 3.4, 15.6], P0.from, [[0, 2.0, 2], [0, 2.0, 2]], d, [52, 64], 0.2)}
    <Station f={g} /><Train x={0} f={g} ang={0} /><Man p={[0, 1.0, 0.1]} clip="idle" rot={0} s={0.8} i={0} /><Cine p={[-0.2, 0.6, 7.0]} s={2.1} f={0} rot={0.25} /><Particles kind="dust" count={60} center={[0, 3, 4]} area={[16, 6, 10]} frame={f} />
    <Post bloom={1.5} threshold={0.4} vignette={0.42} /></Stage>; };

export const LP = ({hook = 'A'}) => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? LP_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp hook={hook} />{i > 1 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.15} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
