// "2 TV Stations Hijacked. Nobody Was Caught." (Max Headroom signal hijackings, Chicago 22 Nov 1987) - low-poly 3D Short, 28 scenes on cues.json cuts.
// Frame 0 = masked, sunglassed bust swaying before a swivelling corrugated panel; last scene restores that set (loop).
// Facts from sources.txt only (S1 Wikipedia, S2 WTTW News). Mask figure is a stylised recreation, not real footage; only the PD still IMG1 is shown as an archival card.
// Styles: found-footage (VhsOverlay over hijack scenes), blueprint-xray (tower, scene 20).
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, Post, Person, Particles, Burst, LightCone, Grade, Stars, Glow, Building, clamp01} from '../../kit/index.js';
import {VhsOverlay, BlueprintXray} from '../../kit/styles/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {RadioDesk} from '../kinross-1953/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const MH_FRAMES = Math.round(52.4 * FPS);
const W = VO.words;
const CS = [0.0, 2.02, 4.46, 6.41, 8.5, 10.0, 11.9, 13.74, 15.2, 17.3, 19.33, 21.07, 22.97, 24.09, 26.24, 28.14, 30.02, 32.2, 34.18, 36.04, 37.56, 39.18, 40.6, 42.22, 43.5, 45.2, 46.9, 48.5];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? MH_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

const NIGHT = {top: '#050a24', mid: '#10204e', hor: '#3a4a90', fog: '#101c44', amb: 0.9, hemiSky: '#9ab0ff', hemiGround: '#1a2040', hemiI: 1.5, sun: '#b8c8ff', sunI: 1.7, sunPos: [-20, 30, 20], rim: '#8fe0ff', rimI: 1.8, rimPos: [25, 12, -40], glow: 1};
const DEEP = {...NIGHT, top: '#02040e', mid: '#08122e', hor: '#16245a', fog: '#080f2a', sunI: 1.3};
const ROOM = {top: '#05181e', mid: '#0a3038', hor: '#14504e', fog: '#06222a', amb: 0.8, hemiSky: '#6ae0a0', hemiGround: '#123a2c', hemiI: 1.2, sun: '#9affc8', sunI: 0.9, sunPos: [0, 10, 5], rim: '#4affb0', rimI: 1.3, rimPos: [0, 5, -10], glow: 1};
const STUDIO = {top: '#14183a', mid: '#2a3a7a', hor: '#4a5aa0', fog: '#1a2250', amb: 1.0, hemiSky: '#b8c8ff', hemiGround: '#2a2a50', hemiI: 1.5, sun: '#fff0d0', sunI: 1.8, sunPos: [10, 20, 14], rim: '#ff9ae0', rimI: 1.4, rimPos: [-20, 10, -20], glow: 1};
const HEAD = {top: '#1a0838', mid: '#3a1470', hor: '#7a2a98', fog: '#2a0e52', amb: 1.0, hemiSky: '#d0a8ff', hemiGround: '#301050', hemiI: 1.5, sun: '#ffe0a8', sunI: 2.0, sunPos: [8, 14, 16], rim: '#40e8ff', rimI: 2.2, rimPos: [-18, 8, -14], glow: 1};
const BLACK = {top: '#000000', mid: '#02030a', hor: '#04060f', fog: '#02030a', amb: 0.5, hemiSky: '#506090', hemiGround: '#101020', hemiI: 0.8, sun: '#8090c0', sunI: 0.8, sunPos: [0, 10, 10], rim: '#8fe0ff', rimI: 0.8, rimPos: [10, 6, -20], glow: 1};

const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
const Cy = ({p = [0, 0, 0], a = [0.2, 0.2, 1, 8], c = '#888', r = [0, 0, 0], e, ei = 1}) => <mesh position={p} rotation={r}><cylinderGeometry args={a} /><meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} /></mesh>;

// ---------- the stylised masked figure (bust): slick yellow hair, shiny face, black sunglasses, dark suit ----------
export const MaxFig = ({position = [0, 0, 0], scale = 1, f = 0, sway = 1, glitch = 0}) => {
  const sx = Math.sin(f * 0.11) * 0.12 * sway; const tilt = Math.sin(f * 0.07 + 1) * 0.07 * sway; const jit = glitch ? (Math.sin(f * 3.1) > 0.4 ? 0.18 : 0) : 0;
  return <group position={[position[0] + jit, position[1], position[2]]} rotation={[0, sx, tilt]} scale={scale}>
    <Bx p={[0, 0.9, 0]} s={[1.9, 1.7, 0.9]} c="#1c2438" />
    <Bx p={[0, 1.2, 0.46]} s={[0.55, 1.1, 0.06]} c="#e8ecf4" /><Bx p={[0, 1.15, 0.5]} s={[0.14, 0.95, 0.05]} c="#c03038" />
    <Bx p={[-1.05, 1.35, 0]} s={[0.4, 0.5, 0.8]} c="#1c2438" /><Bx p={[1.05, 1.35, 0]} s={[0.4, 0.5, 0.8]} c="#1c2438" />
    <Bx p={[0, 1.95, 0]} s={[0.4, 0.3, 0.4]} c="#d89a70" />
    <group position={[0, 2.65, 0]}>
      <Bx s={[1.05, 1.2, 1.0]} c="#e8a878" e="#ff9a5a" ei={0.35} />
      <Bx p={[0, 0.72, -0.05]} s={[1.1, 0.34, 1.05]} c="#f2d878" e="#f0c040" ei={0.45} />
      <Bx p={[0, 0.12, 0.52]} s={[1.0, 0.26, 0.1]} c="#06060a" basic />
      <Bx p={[-0.26, 0.12, 0.58]} s={[0.4, 0.3, 0.05]} c="#101018" e="#40e8ff" ei={0.35} /><Bx p={[0.26, 0.12, 0.58]} s={[0.4, 0.3, 0.05]} c="#101018" e="#40e8ff" ei={0.35} />
      <Bx p={[0, -0.12, 0.54]} s={[0.12, 0.2, 0.1]} c="#d08860" />
      <Bx p={[0, -0.38, 0.52]} s={[0.55, 0.1, 0.08]} c="#7a1820" /><Bx p={[0.3, -0.34, 0.52]} s={[0.08, 0.1, 0.08]} c="#7a1820" /><Bx p={[-0.3, -0.34, 0.52]} s={[0.08, 0.1, 0.08]} c="#7a1820" />
      <Glow position={[0, 0.1, 0.8]} size={2.4} color="#40e8ff" opacity={0.28} />
    </group>
  </group>; };

// ---------- swivelling corrugated panel (semi-rotating) ----------
export const Panel = ({position = [0, 2, -1.4], f = 0, w = 9, h = 7, n = 22}) => {
  const ang = Math.sin(f * 0.05) * 0.5;
  return <group position={position}>{Array.from({length: n}, (_, i) => { const x = (i / (n - 1) - 0.5) * w; const a = ang + (i % 2 ? 0.55 : -0.55);
    return <Bx key={i} p={[x, 0, 0]} s={[w / n * 1.05, h, 0.12]} r={[0, a, 0]} c={i % 2 ? '#9aa6bc' : '#d8e0ee'} e={i % 3 === 0 ? '#5a3aa0' : '#2a5a8a'} ei={0.35} />; })}</group>; };

// ---------- TV set: screen modes black | static | fig | sport | space ----------
const Screen = ({mode, f, w, h}) => {
  if (mode === 'black') return <Bx p={[0, 0, 0.02]} s={[w, h, 0.04]} c="#010104" basic />;
  const bars = mode === 'static' ? 9 : 0;
  return <group>
    <Bx p={[0, 0, 0.02]} s={[w, h, 0.04]} c={mode === 'fig' ? '#2a1860' : mode === 'space' ? '#06082a' : mode === 'sport' ? '#2a6a38' : '#8c96a8'} basic />
    {Array.from({length: bars}, (_, i) => { const v = 0.35 + 0.65 * Math.abs(Math.sin(f * 1.7 + i * 2.3)); return <Bx key={i} p={[0, (i / (bars - 1) - 0.5) * (h - 0.12), 0.06]} s={[w * 0.96, h / bars * 0.8, 0.02]} c={`rgb(${Math.round(255 * v)},${Math.round(255 * v)},${Math.round(255 * v)})`} basic />; })}
    {mode === 'fig' && <group position={[0, -h * 0.06, 0.07]} scale={[w * 0.17, w * 0.17, 0.01]}><MaxFig f={f} sway={1.2} glitch={1} /></group>}
    {mode === 'space' && <><mesh position={[w * 0.18, h * 0.15, 0.07]}><circleGeometry args={[w * 0.1, 10]} /><meshBasicMaterial color="#ffb060" /></mesh><Bx p={[-w * 0.15, -h * 0.2, 0.07]} s={[w * 0.4, 0.08, 0.02]} c="#60e0ff" basic /></>}
    {mode === 'sport' && <><Bx p={[0, 0, 0.07]} s={[w * 0.9, 0.05, 0.02]} c="#f0f0f0" basic /><mesh position={[0, 0, 0.07]}><ringGeometry args={[h * 0.18, h * 0.2, 16]} /><meshBasicMaterial color="#f0f0f0" /></mesh></>}
  </group>; };
export const TV = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, f = 0, mode = 'static', w = 2.4, h = 1.8, light = '#a8c8ff'}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx s={[w + 0.5, h + 0.5, 0.9]} c="#3a3228" /><Bx p={[w * 0.5 + 0.05, -0.4, 0.46]} s={[0.12, 0.8, 0.06]} c="#1a1812" />
  <group position={[0, 0, 0.46]}><Screen mode={mode} f={f} w={w} h={h} /></group>
  {mode !== 'black' && <Glow position={[0, 0, 1.0]} size={w * 2.2} color={light} opacity={0.4} />}
</group>;

// ---------- towers + skyline ----------
export const Tower = ({position = [0, 0, 0], h = 14, w = 2.2, kind = 'sears', f = 0, beacon = '#ff4a3a', pulse = 1}) => {
  const b = 0.55 + 0.45 * Math.sin(f * 0.25 * pulse);
  return <group position={position}>
    {kind === 'sears' ? <>
      <Bx p={[0, h * 0.25, 0]} s={[w, h * 0.5, w]} c="#10131c" /><Bx p={[0, h * 0.5 + h * 0.12, 0]} s={[w * 0.66, h * 0.24, w * 0.66]} c="#161a26" /><Bx p={[0, h * 0.74 + h * 0.1, 0]} s={[w * 0.4, h * 0.2, w * 0.4]} c="#1c2130" />
      {[-0.15, 0.15].map((x, i) => <Cy key={i} p={[x * w, h + 0.9, 0]} a={[0.05, 0.08, 3.4, 5]} c="#cfd6e8" />)}
      {Array.from({length: 8}, (_, i) => <Bx key={i} p={[w * 0.51, 1 + i * h * 0.1, (i % 3 - 1) * 0.5]} s={[0.02, 0.28, 0.3]} c="#ffd890" basic />)}
    </> : <>
      <mesh position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]}><cylinderGeometry args={[w * 0.5, w * 0.95, h, 4]} /><meshLambertMaterial color="#1a1e2c" flatShading /></mesh>
      <Bx p={[0, h * 0.35, 0]} s={[w * 1.02, 0.12, w * 1.02]} c="#c8d0e0" r={[0, Math.PI / 4, 0]} />
      {[-0.2, 0.2].map((x, i) => <Cy key={i} p={[x * w, h + 1.1, 0]} a={[0.05, 0.08, 4.0, 5]} c="#cfd6e8" />)}
      {Array.from({length: 6}, (_, i) => <Bx key={i} p={[w * 0.4, 1 + i * h * 0.13, 0.4 * (i % 2 ? 1 : -1)]} s={[0.02, 0.3, 0.3]} c="#ffd890" basic />)}
    </>}
    <mesh position={[0, h + 2.7, 0]}><sphereGeometry args={[0.16, 8, 6]} /><meshBasicMaterial color={beacon} /></mesh><Glow position={[0, h + 2.7, 0]} size={1.4 + b * 1.2} color={beacon} opacity={0.5 + b * 0.4} />
  </group>; };
const Skyline = ({f, towers = true, z = -14, spread = 38}) => <group>
  {[-16, -11, -7, -2.5, 3, 8, 13, 18].map((x, i) => <Building key={i} position={[x * spread / 38, 0, z - (i % 3) * 2]} w={3 + (i % 3)} d={3} h={5 + (i * 7 % 6)} floors={4 + i % 3} roof={0.1} color="#1a2038" roofColor="#10142a" lit={0.55} litSeed={i + 3} frame={f} />)}
  {towers && <><Tower position={[-6, 0, z + 5]} h={16} w={2.4} kind="sears" f={f} /><Tower position={[8, 0, z + 3]} h={13} w={2.2} kind="han" f={f} pulse={1.3} /></>}
</group>;
const Ground = ({c = '#0c1020', s = 80}) => <Bx p={[0, -0.4, -6]} s={[s, 0.8, s]} c={c} />;

// microwave beam between two points (pulsing translucent cylinder)
const Beam = ({a, b, f, color = '#ff5acb', r = 0.18, o = 0.7}) => { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2]; const L = Math.hypot(dx, dy, dz);
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; const yaw = Math.atan2(dx, dz); const pitch = -Math.asin(dy / L);
  return <group position={mid} rotation={[pitch, yaw, 0]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[r * (0.8 + 0.2 * Math.sin(f * 0.6)), r * 1.4, L, 8, 1, true]} /><meshBasicMaterial color={color} transparent opacity={o * (0.6 + 0.4 * Math.sin(f * 0.8))} depthWrite={false} /></mesh></group>; };

// studio sports desk with anchor
const Desk = ({f, anchor = true}) => <group>
  <Bx p={[0, -0.1, 0]} s={[14, 0.2, 10]} c="#1a2038" />
  <Bx p={[0, 0.9, 0.8]} s={[4.6, 1.8, 1.2]} c="#2a3a7a" /><Bx p={[0, 1.85, 0.8]} s={[4.8, 0.12, 1.4]} c="#d8e0f0" />
  <Bx p={[0, 0.9, 1.42]} s={[3.6, 1.0, 0.04]} c="#ffd93b" e="#ffb800" ei={0.5} />
  {anchor && <Person position={[0, 0, -0.6]} rotation={0} scale={1.05} pose="stand" phase={f / 10} shirt="#e8e8f0" pants="#202840" />}
  <TV position={[-3.6, 3.2, -2.6]} f={f} mode="sport" w={2.2} h={1.6} /><TV position={[3.6, 3.2, -2.6]} f={f} mode="sport" w={2.2} h={1.6} />
  <Bx p={[0, 3.2, -3.2]} s={[5.2, 3.0, 0.2]} c="#0e1a40" e="#2a4aa0" ei={0.6} />
  <Bx p={[-0.2, 3.5, -3.05]} s={[2.6, 0.5, 0.05]} c="#ffd93b" basic /><Bx p={[0.1, 2.8, -3.05]} s={[3.4, 0.2, 0.05]} c="#f0f4ff" basic />
  <pointLight position={[0, 4, 3]} color="#fff0d0" intensity={5} distance={14} />
</group>;

// camera helpers
const S = [];
const mk = (i, {pal = NIGHT, fog = [30, 150], pills = [], cam, children, flash = [], card = null, extra = null, bloom = 1.3, bg}) => { S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} background={bg} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.45} len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d)}<Post bloom={bloom} threshold={0.4} vignette={0.4} /></Stage>; }; };
const push = (from, to, look, d, fov = [52, 44], shake = 0, ease = 'inout') => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease={ease} shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d, fov = [52, 44]) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" />;
const Clock = ({time, y = 520, tag, red = false}) => <div style={{position: 'absolute', top: y, left: 70, width: 360, height: 200, background: '#0c1018', borderRadius: 14, border: '6px solid ' + (red ? '#ff5a4e' : '#ffd93b'), boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center', overflow: 'hidden'}}>
  <div style={{background: red ? '#d6302a' : '#d6a82a', color: '#101010', fontFamily: 'Lilita One', fontSize: 38, padding: '4px 0', letterSpacing: 3}}>{tag}</div><div style={{fontFamily: 'Lilita One', fontSize: 100, color: red ? '#ff7a6e' : '#ffe27a', lineHeight: 1.2}}>{time}</div></div>;

// frame-0 set (also the last scene)
const P0 = [0.9, 2.5, 6.4]; const P1 = [0.2, 2.5, 4.2]; const L0 = [[0, 2.4, 0], [0, 2.5, 0]];
const HeroSet = ({f, glitch = 0}) => <><Ground c="#1a1030" /><Panel f={f} /><MaxFig position={[0, 0, 0]} f={f} glitch={glitch} />
  <Particles kind="motes" center={[0, 3, 0]} area={[8, 5, 4]} count={22} frame={f} color="#c8a8ff" opacity={0.5} /></>;

// 0 HOOK
mk(0, {pal: HEAD, flash: [0.9], fog: [40, 170], bloom: 1.5, cam: (d) => push(P0, P1, L0, d, [66, 52], 1.0, 'out'), children: (f) => <HeroSet f={f} />});
// 1 two stations: two towers, skyline, beacons
mk(1, {pal: NIGHT, flash: [2.2], pills: [['WGN', 236, 'yellow', 70, 2.3], ['WTTW', 316, 'white', 70, 2.9]], cam: (d) => push([0, 6, 22], [0, 9, 14], [[0, 9, 0], [0, 10, 0]], d, [60, 50], 0.3),
  children: (f) => <><Stars opacity={0.5} count={120} /><Ground /><Skyline f={f} z={-10} /></>});
// 2 the mask: orbit the figure
mk(2, {pal: HEAD, flash: [4.7], bloom: 1.5, pills: [['MAX HEADROOM', 236, 'yellow', 52, 5.0], ['MASK', 316, 'white', 70, 5.5]], cam: (d) => orbit([0, 2.6, 0], -0.5, 0.5, 6, 4.2, 3, 2.7, d, [56, 46]), children: (f) => <HeroSet f={f} />});
// 3 Sunday Nov 22 1987: night city, date card
mk(3, {pal: NIGHT, pills: [['SUNDAY', 236, 'yellow', 66, 6.4], ['22 NOV 1987', 316, 'white', 56, 7.1]], cam: (d) => push([-10, 5, 20], [-4, 7, 14], [[0, 8, 0], [2, 9, 0]], d, [58, 50], 0.2),
  children: (f) => <><Stars opacity={0.45} count={110} /><Ground /><Skyline f={f} z={-10} /></>});
// 4 9:14 pm: wall clock card in the studio
mk(4, {pal: STUDIO, flash: [9.42], bg: 'radial-gradient(ellipse at 50% 40%, #1a2a60 0%, #080c28 100%)', cam: (d) => push([0, 3.6, 10], [0, 3.2, 6.6], [[0, 3, 0], [0, 3, 0]], d, [56, 48], 0.3),
  extra: () => <Clock time="9:14 PM" tag="WGN · SUNDAY" />, children: (f) => <Desk f={f} />});
// 5 WGN sports: anchor at the desk
mk(5, {pal: STUDIO, pills: [['SPORTS', 236, 'yellow', 70, 11.2]], cam: (d) => push([3.4, 2.8, 8.4], [1.4, 2.6, 6.2], [[0, 2.2, 0], [0, 2.2, 0]], d, [56, 46], 0.2), children: (f) => <Desk f={f} />});
// 6 report cuts: glitch on the screens behind
mk(6, {pal: STUDIO, flash: [12.96], cam: (d) => push([-3.6, 3.0, 9], [-1.4, 3.0, 6.6], [[0, 2.8, 0], [0, 2.8, 0]], d, [58, 46], 0.7),
  children: (f, d) => <><Desk f={f} anchor /><TV position={[0, 5.8, -2.2]} f={f} mode={f > d - 8 ? 'static' : 'sport'} w={2.4} h={1.6} /></>});
// 7 to black
mk(7, {pal: BLACK, fog: [14, 60], bloom: 1.1, flash: [13.74], cam: (d) => push([0, 1.6, 5], [0, 1.6, 3.4], [[0, 1.6, 0], [0, 1.6, 0]], d, [56, 46], 0.2),
  children: (f) => <><Bx p={[0, 0, -3]} s={[40, 16, 0.2]} c="#000000" basic /><TV position={[0, 1.6, 0]} f={f} mode="black" w={3.4} h={2.4} light="#304070" /></>,
  pills: [['BLACK', 236, 'red', 90, 13.8]]});
// 8 figure appears on TV (VHS) + archival still
mk(8, {pal: HEAD, flash: [15.2], bloom: 1.5, cam: (d) => push([0, 1.8, 6.5], [0, 1.8, 4.2], [[0, 1.8, 0], [0, 1.8, 0]], d, [58, 46], 0.7),
  extra: (f, d) => <><VhsOverlay stamp="NOV 22 1987" glitchAt={6} />{f > 20 && <PhotoCard src="maxheadroom/IMG1.png" credit="WGN-TV broadcast, 22 Nov 1987 · public-domain still" tag="9:14 PM" delay={20} dur={d} rot={-2} />}</>,
  children: (f) => <><Bx p={[0, 0, -3]} s={[40, 16, 0.2]} c="#12081e" basic /><TV position={[0, 1.8, 0]} f={f} mode="fig" w={3.2} h={2.4} light="#c898ff" /></>});
// 9 grinding buzz: close on speaker / waveform on the TV
mk(9, {pal: HEAD, pills: [['NO AUDIO', 236, 'red', 62, 17.35], ['JUST BUZZ', 316, 'white', 60, 17.9]], bloom: 1.5, cam: (d) => push([1.5, 2.6, 6], [0.5, 2.5, 4.2], [[0, 2.4, 0], [0, 2.5, 0]], d, [58, 46], 0.9),
  extra: () => <VhsOverlay stamp="NOV 22 1987" glitchAt={30} />,
  children: (f) => <><HeroSet f={f} glitch={1} />{[0, 1, 2, 3, 4].map((i) => <Bx key={i} p={[-2.6 + i * 1.3, 0.3, 2]} s={[0.28, 0.2 + 1.2 * Math.abs(Math.sin(f * 0.9 + i * 1.7)), 0.28]} c="#ff5acb" basic />)}</>});
// 10 TWIST: engineers retune one link (control room desk)
mk(10, {pal: ROOM, fog: [80, 220], flash: [19.66], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', cam: (d) => push([0.5, 2.8, 5.5], [0.1, 1.9, 2.4], [[0, 1.3, 0], [0, 1.3, 0]], d, [52, 40], 0.5),
  children: (f) => <RadioDesk frame={f} />});
// 11 thirty seconds he's gone: clock + TV flips to static
mk(11, {pal: ROOM, fog: [30, 120], flash: [22.92], pills: [['GONE', 236, 'red', 90, 22.9]], cam: (d) => push([0, 2.4, 7], [0, 2.2, 4.6], [[0, 2, 0], [0, 2, 0]], d, [56, 46], 0.5),
  extra: (f, d) => <Clock time={String(Math.min(30, Math.floor(clamp01(f / (d - 12)) * 30)))} tag="SECONDS" red />,
  children: (f, d) => <><Bx p={[0, 0, -3]} s={[40, 16, 0.2]} c="#04141a" basic /><TV position={[0, 2, 0]} f={f} mode={f > d - 12 ? 'static' : 'fig'} w={3.0} h={2.2} light="#6affd0" /></>});
// 12 two hours later: clock runs 9:14 -> 11:14
mk(12, {pal: NIGHT, pills: [['2 HOURS', 236, 'yellow', 74, 23.5]], cam: (d) => push([0, 6, 18], [0, 8, 12], [[0, 8, 0], [0, 9, 0]], d, [58, 50], 0.2),
  extra: (f, d) => { const m = Math.floor(clamp01(f / (d - 4)) * 120); const t = 9 * 60 + 14 + m; return <Clock time={`${Math.floor(t / 60) % 12 || 12}:${String(t % 60).padStart(2, '0')} PM`} tag="LATER" />; },
  children: (f) => <><Stars opacity={0.45} count={110} /><Ground /><Skyline f={f * 6} z={-10} /></>});
// 13 he's back: big flash, figure fills the TV
mk(13, {pal: HEAD, flash: [24.09, 24.74], bloom: 1.6, pills: [["HE'S BACK", 236, 'red', 70, 24.3]], cam: (d) => push([0, 2.0, 6.8], [0, 2.0, 4.0], [[0, 1.8, 0], [0, 1.8, 0]], d, [60, 46], 1.0),
  extra: () => <VhsOverlay stamp="NOV 22 1987" glitchAt={4} />,
  children: (f) => <><Bx p={[0, 0, -3]} s={[40, 16, 0.2]} c="#12081e" basic /><TV position={[0, 1.8, 0]} f={f} mode="fig" w={3.2} h={2.4} light="#c898ff" /></>});
// 14 11:20 WTTW: tower with beacon
mk(14, {pal: NIGHT, flash: [26.47], pills: [['WTTW', 236, 'yellow', 80, 26.5]], cam: (d) => push([-3, 2, 14], [-1, 6, 11], [[-3, 8, 0], [-3, 12, 0]], d, [62, 52], 0.5),
  extra: () => <Clock time="11:20 PM" tag="WTTW" y={600} />, children: (f) => <><Stars opacity={0.5} count={110} /><Ground /><Skyline f={f} z={-10} /></>});
// 15 middle of Doctor Who: living-room TV with a sci-fi show
mk(15, {pal: STUDIO, pills: [['DOCTOR WHO', 236, 'yellow', 56, 28.4]], cam: (d) => orbit([0, 2, 0], 0.3, -0.3, 8, 6, 2.6, 2.3, d, [56, 46]),
  children: (f) => <><Bx p={[0, -0.1, 0]} s={[14, 0.2, 10]} c="#2a1c20" /><Bx p={[0, 0.7, 0]} s={[4.2, 1.4, 1.4]} c="#4a3226" /><TV position={[0, 2.4, 0]} f={f} mode="space" w={3.0} h={2.2} light="#8aa8ff" />
    <Person position={[-3, 0, 4]} rotation={2.7} scale={1} pose="sit" phase={f / 10} shirt="#8a3a3a" pants="#2a2a40" /><pointLight position={[0, 2.4, 3]} color="#8aa8ff" intensity={5} distance={10} /></>});
// 16 this time there's sound: figure TV + sound waves
mk(16, {pal: HEAD, flash: [30.17], pills: [['SOUND', 236, 'yellow', 84, 30.2]], bloom: 1.5, cam: (d) => orbit([0, 2.2, 0], -0.4, 0.4, 7, 5, 2.4, 2.2, d, [56, 46]),
  extra: () => <VhsOverlay stamp="NOV 22 1987" glitchAt={50} />,
  children: (f) => <><Bx p={[0, 0, -3]} s={[40, 16, 0.2]} c="#12081e" basic /><TV position={[0, 1.8, 0]} f={f} mode="fig" w={3.0} h={2.2} light="#c898ff" />
    {[1, 2, 3].map((k) => <mesh key={k} position={[0, 1.8, 0.6]} scale={[1 + ((f * 0.04 + k * 0.33) % 1) * 3, 1 + ((f * 0.04 + k * 0.33) % 1) * 3, 1]}><ringGeometry args={[1.8, 1.9, 24]} /><meshBasicMaterial color="#ff5acb" transparent opacity={0.6 * (1 - ((f * 0.04 + k * 0.33) % 1))} /></mesh>)}</>});
// 17 rants for ninety seconds: clock to 90
mk(17, {pal: HEAD, flash: [32.2], pills: [['90 SECONDS', 236, 'red', 64, 32.3]], bloom: 1.5, cam: (d) => push([0, 2.0, 6.6], [0, 2.0, 4.4], [[0, 1.8, 0], [0, 1.8, 0]], d, [60, 46], 0.8),
  extra: (f, d) => <><VhsOverlay stamp="NOV 22 1987" glitchAt={20} /><Clock time={String(Math.min(90, Math.floor(clamp01(f / (d - 6)) * 90)))} tag="SECONDS" red y={640} /></>,
  children: (f) => <><Bx p={[0, 0, -3]} s={[40, 16, 0.2]} c="#12081e" basic /><TV position={[0, 1.8, 0]} f={f} mode="fig" w={3.0} h={2.2} light="#c898ff" /></>});
// 18 Sears Tower
mk(18, {pal: NIGHT, flash: [33.35], pills: [['SEARS TOWER', 236, 'yellow', 58, 33.5]], cam: (d) => push([6, 2, 16], [2, 9, 12], [[-6, 7, -5], [-6, 15, -5]], d, [64, 54], 0.4),
  children: (f) => <><Stars opacity={0.5} count={110} /><Ground /><Skyline f={f} z={-10} /></>});
// 19 nobody on duty: empty transmitter room, one empty chair, dead lights
mk(19, {pal: ROOM, fog: [20, 90], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', flash: [34.91], pills: [['NOBODY', 236, 'red', 80, 34.9], ['ON DUTY', 316, 'white', 66, 35.5]], cam: (d) => push([0.6, 2.6, 6], [0.1, 1.8, 3.2], [[0, 1.2, 0], [0, 1.2, 0]], d, [54, 42], 0.3),
  children: (f) => <><RadioDesk frame={f} /><Bx p={[1.8, 0.55, 1.6]} s={[0.9, 0.12, 0.9]} c="#222a38" /><Bx p={[1.8, 1.1, 1.15]} s={[0.9, 1.0, 0.1]} c="#222a38" /><Cy p={[1.8, 0.28, 1.6]} a={[0.06, 0.06, 0.56, 6]} c="#111" /></>});
// 20 BLUEPRINT: the transmitter tower, drawn in
S[20] = () => { const d = dur(20); const parts = [
  {type: 'box', args: [2.4, 7, 2.4], position: [0, 3.5, 0], color: '#2a3144'}, {type: 'box', args: [1.6, 3.2, 1.6], position: [0, 8.6, 0], color: '#323a50'}, {type: 'box', args: [1.0, 2.2, 1.0], position: [0, 11.3, 0], color: '#3a4460'},
  {type: 'cyl', args: [0.05, 0.08, 4, 6], position: [-0.25, 14.4, 0], color: '#cfd6e8'}, {type: 'cyl', args: [0.05, 0.08, 4, 6], position: [0.25, 14.4, 0], color: '#cfd6e8'},
  {type: 'box', args: [0.5, 0.3, 0.5], position: [0, 12.6, 0], color: '#ff4a3a'}];
  return <BlueprintXray dur={d} parts={parts} target={[0, 7, 0]} radius={16} label="TRANSMITTER TOWER" />; };
// 21 beams hit both towers
mk(21, {pal: NIGHT, flash: [39.76], bloom: 1.5, pills: [['STRONGER', 236, 'yellow', 60, 38.5], ['SIGNAL', 316, 'white', 70, 39.0]], cam: (d) => push([0, 7, 22], [0, 9, 14], [[0, 9, 0], [0, 10, 0]], d, [60, 50], 0.3),
  children: (f) => <><Stars opacity={0.5} count={110} /><Ground /><Skyline f={f} z={-10} /><Beam a={[-14, 10, -3]} b={[-6, 17, -5]} f={f} /><Beam a={[-14, 10, -3]} b={[8, 14, -7]} f={f} color="#40e8ff" /></>});
// 22 FCC finds: folder on desk
mk(22, {pal: DEEP, bg: 'radial-gradient(ellipse at 50% 40%, #1a2038 0%, #04060f 100%)', pills: [['FCC', 236, 'yellow', 90, 40.7]], cam: (d) => push([1, 4.4, 5], [0.3, 3.0, 2.6], [[0, 0.6, 0], [0, 0.6, 0]], d, [54, 44], 0.2),
  children: (f) => <><Bx p={[0, 0, 0]} s={[8, 0.3, 5]} c="#2a2018" /><Bx p={[0, 0.25, 0]} s={[2.6, 0.12, 3.4]} c="#d8b878" r={[0, 0.2, 0]} /><Bx p={[0, 0.33, 0]} s={[1.8, 0.04, 0.6]} c="#c03038" r={[0, 0.2, 0]} />
    <Cy p={[-2.6, 0.7, -0.6]} a={[0.3, 0.2, 0.9, 8]} c="#808890" /><LightCone position={[0, 6, 1]} dir={[0, -1, -0.1]} length={6} radius={2} frame={f} color="#ffe8b0" opacity={0.3} /></>});
// 23 no one: empty chair, spotlight (REVEAL)
mk(23, {pal: DEEP, flash: [42.26, 42.54], bloom: 1.5, bg: 'radial-gradient(ellipse at 50% 40%, #1a2038 0%, #02030a 100%)', cam: (d) => push([0, 2.6, 7.4], [0, 2.0, 4.4], [[0, 1.2, 0], [0, 1.2, 0]], d, [58, 44], 0.4),
  children: (f) => <><Bx p={[0, -0.1, 0]} s={[12, 0.2, 10]} c="#121626" /><Bx p={[0, 0.55, 0]} s={[1.0, 0.14, 1.0]} c="#222a38" /><Bx p={[0, 1.2, -0.45]} s={[1.0, 1.1, 0.12]} c="#222a38" /><Cy p={[0, 0.28, 0]} a={[0.07, 0.07, 0.56, 6]} c="#111" />
    <LightCone position={[0, 7, 0.4]} dir={[0, -1, 0]} length={7} radius={2.6} frame={f} color="#ffe8b0" opacity={0.4} /></>});
// 24 nobody has claimed it: dark folder, question marks
mk(24, {pal: DEEP, cam: (d) => orbit([0, 0.6, 0], 0.2, -0.5, 6, 4.4, 4, 2.8, d, [54, 44]),
  children: (f) => <><Bx p={[0, 0, 0]} s={[8, 0.3, 5]} c="#2a2018" /><Bx p={[0, 0.25, 0]} s={[2.6, 0.12, 3.4]} c="#a8946a" r={[0, 0.2, 0]} />
    {[0, 1, 2].map((i) => <Glow key={i} position={[-1.8 + i * 1.8, 2 + Math.sin(f * 0.1 + i) * 0.2, 0]} size={1.4} color="#ff5acb" opacity={0.6} />)}</>});
// 25 disgruntled insider: silhouette at the control desk
mk(25, {pal: ROOM, fog: [30, 120], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', cam: (d) => push([-1.4, 2.6, 5.4], [-0.5, 2.0, 3], [[0, 1.3, 0], [0, 1.3, 0]], d, [54, 42], 0.3),
  children: (f) => <><RadioDesk frame={f} /><Person position={[0.8, 0, 1.6]} rotation={Math.PI} scale={0.95} pose="sit" phase={f / 10} shirt="#2a3a48" pants="#1a2230" /></>});
// 26 hacker: laptop glow in the dark
mk(26, {pal: DEEP, cam: (d) => push([2.4, 2.8, 4.8], [1, 2.2, 3], [[0, 1.6, 0], [0, 1.6, 0]], d, [56, 44], 0.4),
  children: (f) => <><Bx p={[0, 0.5, 0]} s={[5, 0.2, 2.6]} c="#1a1c28" /><Bx p={[0, 1.2, -0.3]} s={[1.6, 1.1, 0.08]} c="#0a2a1a" e="#40ff9a" ei={0.9} r={[-0.15, 0, 0]} /><Bx p={[0, 0.65, 0.3]} s={[1.6, 0.06, 1.0]} c="#2a2c38" />
    <Person position={[0, 0.6, 1.8]} rotation={Math.PI} scale={0.9} pose="sit" phase={f / 10} shirt="#20242e" pants="#14161e" hair="#101014" /><pointLight position={[0, 1.6, 0.6]} color="#40ff9a" intensity={6} distance={7} />
    <Particles kind="motes" center={[0, 2, 0]} area={[6, 3, 4]} count={20} frame={f} color="#40ff9a" opacity={0.5} /></>});
// 27 END: frame-0 set restored; camera ends on frame 0's pose (loops to line 1)
S[27] = () => { const f = useCurrentFrame(); const d = dur(27);
  return <Stage palette={HEAD} fog={[40, 170]} overlay={<CFlash at={[at(0.3)]} k={0.4} len={6} />}>
    {push(P1, P0, L0, d, [52, 66], 0.2, 'inout')}
    <HeroSet f={f} /><Post bloom={1.5} threshold={0.4} vignette={0.4} /></Stage>; };

const Over = () => <>
  <Sequence from={0} durationInFrames={at(2.6)}><Pill text="2 STATIONS" y={236} variant="yellow" delay={-7} size={72} /><Pill text="HIJACKED." y={316} variant="red" delay={-5} size={78} /></Sequence>
  <Sequence from={at(19.66)} durationInFrames={at(22.0) - at(19.66)}><Pill text="GONE IN 30 S." y={236} variant="yellow" delay={0} size={62} /><Pill text="BACK IN 2 H." y={316} variant="red" delay={3} size={62} /></Sequence>
  <Sequence from={at(42.4)} durationInFrames={at(44.4) - at(42.4)}><Pill text="NOBODY" y={236} variant="yellow" delay={0} size={72} /><Pill text="CAUGHT." y={316} variant="red" delay={3} size={78} /></Sequence>
  <Sequence from={at(44.52)} durationInFrames={MH_FRAMES - at(44.52)}><Pill text="INSIDER?" y={236} variant="yellow" delay={0} size={72} /><Pill text="OR HACKER?" y={316} variant="red" delay={5} size={64} /></Sequence></>;

export const MH = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? MH_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#04060c" />}</Sequence>; })}
    <Over />
    <Grade look="cold" strength={0.15} /><Finish vignette={0.3} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
