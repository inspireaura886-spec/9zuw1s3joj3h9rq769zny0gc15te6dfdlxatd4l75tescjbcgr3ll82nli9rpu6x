// "Weapons Panel Went Dead" (Tehran, 19 Sep 1976) - low-poly 3D Short, 27 scenes on cues.json cuts.
// Frame 0 = night F-4 cockpit, huge white-blue light dead ahead, weapons panel lamps lit; last scene = same cockpit, panel dark (loop).
// Facts from sources.txt only (S1 DIA message, S2 Skeptoid, S3 Wikipedia). The lights are shown as the crews described them, not as proven.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, Post, Person, Particles, Burst, LightCone, Grade, Stars, Orb, Glow, Clouds, clamp01, easeOut} from '../../kit/index.js';
import {ShadowPuppet} from '../../kit/styles/index.js';
import {Fonts2, Flash as CFlash} from '../common.jsx';
import {Scope, Jet} from '../kinross-1953/world.jsx';
import {J707} from '../varig-967/Vg.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const TH_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0.0, 2.06, 3.26, 5.3, 6.42, 8.4, 9.5, 14.22, 16.12, 17.48, 19.18, 22.28, 23.4, 24.54, 27.26, 30.48, 32.18, 34.34, 38.76, 41.77, 44.16, 45.2, 47.06, 48.0, 50.31, 52.36, 53.7];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? TH_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

const NIGHT = {top: '#050a24', mid: '#10204e', hor: '#3a4a90', fog: '#101c44', amb: 0.9, hemiSky: '#9ab0ff', hemiGround: '#1a2040', hemiI: 1.5, sun: '#b8c8ff', sunI: 1.7, sunPos: [-20, 30, 20], rim: '#8fe0ff', rimI: 1.8, rimPos: [25, 12, -40], glow: 1};
const DEEP = {...NIGHT, top: '#02040e', mid: '#08122e', hor: '#16245a', fog: '#080f2a', sunI: 1.3};
const ROOM = {top: '#05181e', mid: '#0a3038', hor: '#14504e', fog: '#06222a', amb: 0.8, hemiSky: '#6ae0a0', hemiGround: '#123a2c', hemiI: 1.2, sun: '#9affc8', sunI: 0.9, sunPos: [0, 10, 5], rim: '#4affb0', rimI: 1.3, rimPos: [0, 5, -10], glow: 1};
const DAWN = {top: '#2a2a58', mid: '#8a5a7a', hor: '#ffc890', fog: '#7a5a70', amb: 1.0, hemiSky: '#ffd0b0', hemiGround: '#4a3a40', hemiI: 1.6, sun: '#ffd8a0', sunI: 1.9, sunPos: [-20, 8, -20], rim: '#9ad0ff', rimI: 1.2, rimPos: [20, 10, -30], glow: 1};
const WASH = {...NIGHT, top: '#0a1230', mid: '#1a2a58', hor: '#4a5a98', fog: '#18244e', rim: '#c8e0ff'};

const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
const Cy = ({p = [0, 0, 0], a = [0.2, 0.2, 1, 8], c = '#888', r = [0, 0, 0], e, ei = 1}) => <mesh position={p} rotation={r}><cylinderGeometry args={a} /><meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} /></mesh>;

// ---------- the light, as the crews described it: a brilliant white-blue source ----------
const Lt = ({position = [0, 0, 0], scale = 1, frame = 0, big = 1, tint = '#cfe4ff'}) => { const p = 0.9 + 0.1 * Math.sin(frame * 0.35);
  return <group position={position} scale={scale}>
    <mesh><sphereGeometry args={[0.5, 12, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
    <Glow position={[0, 0, 0]} size={5 * p * big} color={tint} opacity={0.95} />
    <Glow position={[0, 0, 0.05]} size={11 * p * big} color="#7aa8ff" opacity={0.5} />
    <mesh rotation={[Math.PI / 2, 0, frame * 0.04]}><torusGeometry args={[0.95, 0.04, 6, 24]} /><meshBasicMaterial color="#e8f4ff" transparent opacity={0.6} /></mesh>
  </group>; };

// ---------- F-4 cockpit (tandem seats, camera behind them). `kill` = frame the weapons panel dies (Infinity = alive, 0 = dead) ----------
const UNI = {shirt: '#5a6a58', pants: '#3a4452', hair: '#1b1310'};
const Cab = ({f, kill = 1e9, lx = 0, ly = 0.9, lz = 15, lbig = 1.7, withLight = true, redFlash = 0}) => { const dead = f >= kill; const fl = f >= kill - 8 && f < kill ? (Math.sin(f * 2.1) > 0 ? 1 : 0.15) : 1;
  return <group>
    <Bx p={[0, -0.9, 0]} s={[2.4, 0.2, 5]} c="#7a8aa0" /><Bx p={[-1.2, 0, 0]} s={[0.15, 1.8, 5]} c="#7a8aa0" /><Bx p={[1.2, 0, 0]} s={[0.15, 1.8, 5]} c="#7a8aa0" />
    <Bx p={[0, 0.2, 2.3]} s={[2.4, 1.2, 0.5]} c="#2a3240" r={[0.3, 0, 0]} />
    {Array.from({length: 10}, (_, i) => <mesh key={i} position={[-0.9 + (i % 5) * 0.45, 0.46 - Math.floor(i / 5) * 0.3, 2.0]}><circleGeometry args={[0.15, 10]} /><meshBasicMaterial color={i % 3 === 0 ? '#ffc050' : '#b0ffd0'} transparent opacity={dead ? 0.3 : (0.85 + 0.15 * Math.sin(f * 0.2 + i)) * fl} /></mesh>)}
    <mesh position={[0, 1.0, 0.8]}><torusGeometry args={[1.25, 0.06, 6, 20, Math.PI]} /><meshLambertMaterial color="#444c58" flatShading /></mesh>
    <Bx p={[0, -0.55, 0.9]} s={[0.9, 0.18, 0.7]} c="#3a2a22" /><Bx p={[0, -0.55, -0.6]} s={[0.9, 0.18, 0.7]} c="#3a2a22" />
    <Person position={[0, -0.7, 0.9]} rotation={0} scale={0.62} pose="sit" phase={f / 10} {...UNI} />
    <Person position={[0, -0.7, -0.6]} rotation={0} scale={0.62} pose="sit" phase={f / 10 + 2} {...UNI} shirt="#6a7a58" />
    <pointLight position={[0, 0.5, 1.6]} color={redFlash ? '#ff4a3a' : '#ffa840'} intensity={dead ? 2.2 : 4 * fl} distance={6} />
    <pointLight position={[0, 3, -3]} color="#a8c0ff" intensity={14} distance={14} /><pointLight position={[0, 1.5, -1]} color="#7a90c0" intensity={7} distance={9} />
    {withLight && <Lt position={[lx, ly, lz]} scale={1.4} frame={f} big={lbig} />}
    {withLight && <pointLight position={[0, 1.5, 6]} color="#bcd4ff" intensity={5} distance={14} />}
  </group>; };

// ---------- night Tehran: lit blocks on a plain, Alborz ridge behind ----------
const City = ({f, z0 = -6, rows = 6}) => <group>
  <Bx p={[0, -0.6, z0 - 10]} s={[120, 1, 60]} c="#14182c" />
  {Array.from({length: rows * 14}, (_, i) => { const r = Math.floor(i / 14), c = i % 14; const h = 0.8 + ((i * 37) % 11) * 0.28; const x = (c - 6.5) * 3.2 + ((r * 7) % 3) * 0.5; const z = z0 - r * 3.6;
    return <group key={i} position={[x, h / 2 - 0.1, z]}><Bx s={[2, h, 2.2]} c="#222a44" />{Array.from({length: 3}, (_, k) => <Bx key={k} p={[-0.5 + k * 0.5, -h / 2 + 0.5 + ((i + k) % 3) * 0.55, 1.11]} s={[0.28, 0.22, 0.02]} c="#ffd890" basic o={0.55 + 0.45 * (((i * 3 + k) % 4) / 3)} />)}</group>; })}
  {[0, 1, 2, 3, 4, 5, 6].map((i) => <mesh key={i} position={[-48 + i * 16, 6, z0 - 36]} scale={[10 + (i % 3) * 3, 8 + (i * 5) % 7, 6]}><coneGeometry args={[1, 1, 4]} /><meshLambertMaterial color="#1a2040" flatShading /></mesh>)}
</group>;

const Sky = ({f}) => <><Stars opacity={0.5} count={110} /><Orb position={[-55, 38, -100]} radius={3.5} color="#f0eed8" /><Glow position={[-55, 38, -99]} size={24} color="#9fc0ff" opacity={0.4} /><Clouds frame={f} y={24} color="#222c66" opacity={0.8} speed={0.1} count={6} seed={11} /></>;

const S = [];
const mk = (i, {pal = NIGHT, fog = [30, 150], pills = [], cam, children, flash = [], card = null, extra = null, bloom = 1.3, bg}) => { S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} background={bg} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.45} len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d)}<Post bloom={bloom} threshold={0.4} vignette={0.4} /></Stage>; }; };
const push = (from, to, look, d, fov = [52, 44], shake = 0, ease = 'inout') => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease={ease} shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d, fov = [52, 44]) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" />;
const Clock = ({time, y = 520, tag, red = false}) => <div style={{position: 'absolute', top: y, left: 70, width: 340, height: 200, background: '#0c1018', borderRadius: 14, border: '6px solid ' + (red ? '#ff5a4e' : '#ffd93b'), boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center', overflow: 'hidden'}}>
  <div style={{background: red ? '#d6302a' : '#d6a82a', color: '#101010', fontFamily: 'Lilita One', fontSize: 38, padding: '4px 0', letterSpacing: 3}}>{tag}</div><div style={{fontFamily: 'Lilita One', fontSize: 108, color: red ? '#ff7a6e' : '#ffe27a', lineHeight: 1.2}}>{time}</div></div>;
const Stars2 = () => <Stars opacity={0.5} count={100} />;

// frame-0 / end set
const P0 = [0, 1.6, -3.4]; const P1 = [0.2, 0.9, -1.8]; const L0 = [[0, 0.5, 6], [0, 0.8, 8]];

// 0 HOOK: cockpit, huge light dead ahead, weapons lamps lit, fastest push from frame 0
mk(0, {fog: [20, 120], flash: [0.9], bloom: 1.5, cam: (d) => push(P0, P1, L0, d, [68, 52], 0.9, 'out'), children: (f) => <><Cab f={f} /><Stars2 /><Particles kind="motes" center={[0, 1, 6]} area={[4, 3, 8]} count={24} frame={f} color="#cfe4ff" opacity={0.5} /></>});
// 1 missile at a light: jet fires toward the light
mk(1, {fog: [30, 160], flash: [0.5], pills: [['AIM-9 MISSILE', 236, 'yellow', 52, 2.5]], cam: (d) => push([-5, 2.4, -7], [-2.4, 1.8, -3.4], [[0, 1, 8], [0, 1.2, 10]], d, [62, 50], 0.5),
  children: (f) => { const m = Math.max(0, f - 14); return <><Sky f={f} /><Jet position={[-1.2, 1.2, -1 + f * 0.04]} rotation={[0, 0.05, 0.1]} scale={1.1} frame={f} />
    {f > 14 && <group position={[-0.6, 1.0, 0.8 + m * 0.5]}><Cy a={[0.07, 0.07, 0.9, 6]} r={[Math.PI / 2, 0, 0]} c="#e8e8e8" /><Glow position={[0, 0, -0.6]} size={1.3} color="#ffb060" opacity={0.9} /></group>}
    <Lt position={[1.5, 3.2, 16]} scale={1.6} frame={f} /></>; }});
// 2 Tehran: city below, light hovering above
mk(2, {pal: WASH, fog: [40, 190], pills: [['TEHRAN', 236, 'yellow', 70, 3.5], ['IRAN', 316, 'white', 62, 3.9]], cam: (d) => push([-7, 6, 10], [-2, 4.6, 6], [[0, 2, -8], [0, 4, -8]], d, [62, 50], 0.4),
  children: (f) => <><Sky f={f} /><City f={f} /><Lt position={[2, 9, -14]} scale={1.8} frame={f} /><Particles kind="motes" center={[0, 5, -6]} area={[16, 6, 14]} count={30} frame={f} color="#cfe4ff" opacity={0.35} /></>});
// 3 went dead: panel lamps die (kill at 0.7 s into scene)
mk(3, {fog: [14, 60], flash: [5.55], bloom: 1.5, cam: (d) => push([0.2, 0.7, -0.2], [0.1, 0.55, 0.9], [[0, 0.3, 2.0], [0, 0.35, 2.0]], d, [54, 40], 0.7),
  children: (f) => <><Cab f={f} kill={at(5.5) - C[3]} withLight={false} redFlash={f > at(5.5) - C[3] ? 1 : 0} /><Stars2 /></>});
// 4 September 1976: dusk-night over the plain, mountains, city lights
mk(4, {pal: WASH, fog: [40, 200], pills: [['SEPT 1976', 236, 'yellow', 62, 6.55]], cam: (d) => push([6, 3.4, 12], [3, 3.0, 8], [[0, 2, -10], [0, 3, -12]], d, [58, 48], 0.2),
  children: (f) => <><Sky f={f} /><City f={f} rows={5} /></>});
// 5 after midnight: clock, light rising over the roofs
mk(5, {pal: DEEP, fog: [40, 190], flash: [8.45], extra: () => <Clock time="12:30" tag="19 SEP · A.M." />, cam: (d) => push([-3, 2.4, 9], [-1, 3.2, 6.4], [[0, 4, -10], [0, 6, -12]], d, [60, 50], 0.2),
  children: (f) => <><Sky f={f} /><City f={f} rows={4} /><Lt position={[1, 5 + f * 0.04, -12]} scale={1.3} frame={f} /></>});
// 6 four callers look up; no helicopters
mk(6, {pal: DEEP, fog: [30, 150], pills: [['4 CALLERS', 236, 'yellow', 66, 9.7], ['NO HELICOPTERS', 316, 'white', 50, 12.2]], flash: [9.6], cam: (d) => push([-3.5, 2.0, 6.5], [-1.4, 2.2, 3.6], [[0, 3.6, -6], [0, 4.4, -6]], d, [64, 52], 0.3),
  children: (f) => <><Sky f={f} /><Bx p={[0, -0.6, -6]} s={[40, 1, 30]} c="#14182c" /><Bx p={[0, 0.3, -2]} s={[9, 0.5, 3]} c="#2a3252" />{[-3, -1, 1, 3].map((x, i) => <Person key={i} position={[x, 0.55, -1.4 + (i % 2) * 0.6]} rotation={Math.PI} scale={0.85} pose={i % 2 ? 'point' : 'lookup'} phase={f / 10 + i} actT={clamp01((f - 4 - i * 5) / 12)} shirt={['#8a4a3a', '#3a6a8a', '#6a8a4a', '#8a7a3a'][i]} />)}
    <Lt position={[0, 5, -16]} scale={1.6} frame={f} /><LightCone position={[0, 5, -16]} dir={[0, -1, 0.4]} length={9} radius={2.5} frame={f} color="#cfe4ff" opacity={0.25} /></>});
// 7 fighter jet scrambled: takeoff, afterburners
mk(7, {pal: DEEP, fog: [30, 160], flash: [14.3], pills: [['SCRAMBLED', 236, 'yellow', 62, 14.5]], cam: (d) => push([6, 1.2, 8], [3, 1.6, 3], [[0, 1, -3], [0, 1.6, -2]], d, [58, 46], 0.9),
  children: (f) => <><Stars2 /><Bx p={[0, -0.1, -4]} s={[14, 0.1, 60]} c="#252a34" />{Array.from({length: 14}, (_, i) => <mesh key={i} position={[-2.6, 0.05, 6 - i * 3.2]}><sphereGeometry args={[0.1, 6, 5]} /><meshBasicMaterial color="#ffd890" /></mesh>)}
    <Jet position={[0, 0.5 + clamp01((f - 36) / 30) * 1.6, 8 - f * 0.22]} rotation={[-0.2 * clamp01((f - 36) / 30), Math.PI, 0]} scale={1.3} frame={f} burn={1.4} /><Burst kind="sparks" position={[0, 0.4, 6 - f * 0.22]} start={0} frame={f} count={30} color="#ffb040" /></>});
// 8 at twenty-five miles: jet flying toward the light
mk(8, {fog: [30, 170], pills: [['25 MILES', 236, 'yellow', 68, 16.5]], cam: (d) => push([-4, 2.4, -9], [-2, 2.0, -5.5], [[0, 1.5, 6], [0, 1.8, 8]], d, [58, 48], 0.4),
  children: (f) => <><Sky f={f} /><Jet position={[0, 1.4, -2 + f * 0.04]} rotation={[0, 0, 0.04]} scale={1.2} frame={f} /><Lt position={[0.5, 2.2, 22]} scale={2} frame={f} /></>});
// 9 TWIST: loses all instruments and radio (cockpit panel dies)
mk(9, {fog: [14, 70], flash: [17.48, 17.8], bloom: 1.6, cam: (d) => push([0.9, 0.9, -0.6], [0.2, 0.6, 0.7], [[0, 0.3, 2], [0, 0.35, 2]], d, [52, 40], 0.9),
  children: (f) => <><Cab f={f} kill={at(0.28)} withLight={false} redFlash={f > at(0.28) ? 1 : 0} /><Stars2 /></>});
// 10 turns away and they return: orbit around the jet banking, light behind
mk(10, {fog: [30, 170], pills: [['RADIO DEAD', 236, 'red', 56, 19.4]], cam: (d) => orbit([0, 1.5, 0], 3.4, 4.6, 9, 7, 2.4, 2, d, [58, 50]),
  children: (f) => { const k = clamp01(f / 34); return <><Sky f={f} /><Jet position={[0, 1.5, 0]} rotation={[0, Math.PI * (1 - 0.0) * k * 0 + (k < 1 ? k * 2.6 : 2.6), 0.5 * Math.sin(k * 3.1)]} scale={1.2} frame={f} /><Lt position={[0, 3, 20]} scale={1.8} frame={f} /></>; }});
// 11 second jet: two F-4s in formation
mk(11, {fog: [30, 170], pills: [['2ND JET', 236, 'yellow', 66, 22.4]], cam: (d) => push([-6, 2.4, -8], [-3, 2.0, -5], [[0, 1.5, 4], [0, 1.6, 5]], d, [60, 50], 0.4),
  children: (f) => <><Sky f={f} /><Jet position={[-2.4, 1.6, f * 0.03]} rotation={[0, 0, 0.05]} scale={1.1} frame={f} /><Jet position={[2.2, 1.2, -1.5 + f * 0.03]} rotation={[0, 0, -0.04]} scale={1.1} frame={f} /><Lt position={[0, 2, 24]} scale={2} frame={f} /></>});
// 12 radar lock: scope, unknown blip
mk(12, {pal: ROOM, fog: [14, 60], flash: [23.4], bloom: 1.5, pills: [['RADAR LOCK', 236, 'yellow', 58, 23.5], ['27 MILES', 316, 'white', 62, 23.8]], cam: (d) => push([0.4, 6.0, 5.5], [0.4, 3.8, 1.8], [[0, 0, 0], [0.3, 0, -0.3]], d, [50, 42], 0.4),
  children: (f) => <Scope frame={f} tt={21 + f / 30 * 0.5} mode="unknown" />});
// 13 keeps 25 miles ahead: chase cam, light keeps its distance
mk(13, {fog: [30, 190], pills: [['25 MILES', 236, 'yellow', 66, 24.9], ['AHEAD', 316, 'white', 66, 25.5]], cam: (d) => push([-3, 2.6, -10], [-1.4, 2.2, -6.4], [[0, 1.6, 8], [0, 1.8, 10]], d, [60, 50], 0.5),
  children: (f) => <><Sky f={f} /><Jet position={[0, 1.4, -1 + f * 0.09]} rotation={[0, 0, 0.03]} scale={1.2} frame={f} /><Lt position={[0.4, 2.2, 22 + f * 0.09]} scale={2} frame={f} /></>});
// 14 TWIST 2: another light leaves it and races at the jet
mk(14, {fog: [30, 180], flash: [27.26, 27.7], bloom: 1.6, pills: [['2ND LIGHT', 236, 'red', 62, 28.0]], cam: (d) => push([-3.2, 2.2, -9], [-1.6, 1.8, -6.2], [[0, 1.6, 6], [0, 1.8, 8]], d, [64, 50], 1.0),
  children: (f) => { const k = clamp01((f - 8) / 56); const z = 20 - k * k * 22; return <><Sky f={f} /><Jet position={[0, 1.4, -2 + f * 0.04]} rotation={[0, 0, 0.03]} scale={1.2} frame={f} /><Lt position={[0.6, 2.4, 22]} scale={2} frame={f} />
    <Lt position={[0.6 - k * 0.5, 2.4 - k * 0.8, z]} scale={1 + k * 0.8} frame={f + 5} big={0.7} /><Burst kind="sparks" position={[0.6, 2.4, 22]} start={8} frame={f} count={40} color="#cfe4ff" /></>; }});
// 15 pilot reaches to fire: cockpit, light rushing at the windscreen
mk(15, {fog: [14, 70], flash: [30.5], bloom: 1.6, pills: [['FIRE', 236, 'red', 76, 30.9]], cam: (d) => push([0.5, 1.0, -1.4], [0.2, 0.7, 0.2], [[0, 0.5, 4], [0, 0.6, 6]], d, [60, 46], 0.9),
  children: (f, d) => { const k = clamp01(f / d); return <><Cab f={f} withLight={false} /><Lt position={[0, 0.9, 16 - k * 9]} scale={1.4 + k * 1.3} frame={f} big={1.2} /><Stars2 /></>; }});
// 16 weapons panel goes dead
mk(16, {fog: [14, 60], flash: [33.38, 33.7], bloom: 1.6, pills: [['PANEL', 236, 'red', 70, 32.4], ['DEAD', 316, 'white', 80, 33.0]], cam: (d) => push([0.25, 0.7, -0.15], [0.1, 0.55, 1.0], [[0, 0.3, 2.0], [0, 0.35, 2.0]], d, [52, 38], 0.8),
  children: (f) => <><Cab f={f} kill={at(33.38) - C[16]} withLight={false} redFlash={f > at(33.38) - C[16] ? 1 : 0} /><Stars2 /></>});
// 17 third light drops and settles, lighting the ground for miles
const Hills = ({f}) => <group>
  <Bx p={[0, -0.7, -6]} s={[110, 1, 60]} c="#2a2c3c" />
  {[-30, -18, -8, 8, 20, 32].map((x, i) => <mesh key={i} position={[x, 0.2, -22 - (i % 3) * 5]} scale={[9 + (i % 2) * 4, 3 + (i % 3), 5]}><coneGeometry args={[1, 1, 5]} /><meshLambertMaterial color="#2a2c40" flatShading /></mesh>)}
  {Array.from({length: 22}, (_, i) => <mesh key={i} position={[((i * 53) % 41) - 20, -0.1, -2 - ((i * 29) % 17)]} scale={[0.6 + (i % 3) * 0.3, 0.4, 0.6]}><dodecahedronGeometry args={[1, 0]} /><meshLambertMaterial color="#3a3c50" flatShading /></mesh>)}
</group>;
mk(17, {pal: WASH, fog: [40, 190], flash: [34.34], pills: [['3RD LIGHT', 236, 'yellow', 62, 34.6], ['2-3 KM LIT', 316, 'white', 60, 36.6]], cam: (d) => push([-6, 3.4, 10], [-2, 2.2, 6], [[0, 2, -8], [0, 1.6, -8]], d, [62, 50], 0.3),
  children: (f, d) => { const k = clamp01(f / (d - 20)); const y = 8 - easeOut(k) * 6.6; return <><Sky f={f} /><Hills f={f} /><Lt position={[0, y, -8]} scale={1.6} frame={f} /><LightCone position={[0, y, -8]} dir={[0, -1, 0]} length={y + 1} radius={2 + k * 7} frame={f} color="#cfe4ff" opacity={0.3} /><pointLight position={[0, y - 0.5, -7]} color="#bcd4ff" intensity={14 * (0.4 + k)} distance={26} /></>; }});
// 18 airliner nearby loses radio
mk(18, {fog: [30, 180], pills: [['AIRLINER', 236, 'yellow', 62, 38.9], ['RADIO LOST', 316, 'red', 56, 39.5]], cam: (d) => push([8, 2.4, 10], [4, 2.8, 6], [[0, 2.5, 0], [0, 3, 0]], d, [58, 48], 0.4),
  children: (f) => <><Sky f={f} /><J707 position={[-6 + f * 0.1, 2.8, 0]} rotation={[0, Math.PI / 2, 0.03]} scale={1.1} frame={f} /><Lt position={[-4, 8, -18]} scale={1.6} frame={f} /></>});
// 19 dawn: dry lake bed, a small house, a beeping signal
const House = ({f, beep = 0}) => <group position={[0, 0, 0]}>
  <Bx p={[0, 0.8, 0]} s={[3, 1.6, 2.4]} c="#cbb9a0" /><mesh position={[0, 2.0, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.7, 1]}><coneGeometry args={[2.3, 1.4, 4]} /><meshLambertMaterial color="#8a4a3a" flatShading /></mesh>
  <Bx p={[0.7, 0.7, 1.21]} s={[0.7, 1.1, 0.04]} c="#4a3220" /><Bx p={[-0.8, 1.0, 1.21]} s={[0.6, 0.5, 0.04]} c="#ffd890" basic />
  {beep > 0 && [0, 1, 2].map((k) => { const t = ((f * 0.04 + k / 3) % 1); return <mesh key={k} position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.4 + t * 3.2}><ringGeometry args={[0.9, 1.0, 32]} /><meshBasicMaterial color="#ff5a3a" transparent opacity={(1 - t) * 0.9} /></mesh>; })}
  {beep > 0 && <><mesh position={[0, 3.2, 0]}><sphereGeometry args={[0.22, 8, 6]} /><meshBasicMaterial color={Math.sin(f * 0.8) > 0 ? '#ff5a3a' : '#552018'} /></mesh></>}
</group>;
const Lake = () => <group><Bx p={[0, -0.6, -6]} s={[120, 1, 70]} c="#b8a078" /><Bx p={[0, -0.09, -8]} s={[60, 0.05, 40]} c="#cdb88a" />
  {[-26, -12, 14, 28].map((x, i) => <mesh key={i} position={[x, 0.4, -26 - i]} scale={[10, 3 + (i % 2), 5]}><coneGeometry args={[1, 1, 5]} /><meshLambertMaterial color="#8a6a58" flatShading /></mesh>)}</group>;
mk(19, {pal: DAWN, fog: [30, 160], pills: [['DAWN', 236, 'yellow', 70, 41.9], ['A BEEPING SIGNAL', 316, 'white', 44, 43.0]], cam: (d) => push([-8, 3.4, 9], [-4, 2.6, 6], [[0, 1.2, 0], [0, 1.4, 0]], d, [58, 46], 0.2),
  children: (f) => <><Orb position={[-50, 8, -100]} radius={5} color="#ffd8a0" /><Glow position={[-50, 8, -99]} size={40} color="#ffb070" opacity={0.6} /><Lake /><House f={f} beep={f > 30 ? 1 : 0} /></>});
// 20 signal: close on the beacon pulsing
mk(20, {pal: DAWN, fog: [30, 160], flash: [44.4], cam: (d) => push([2.4, 3.8, 4.2], [1.0, 3.3, 2.4], [[0, 3.1, 0], [0, 3.2, 0]], d, [52, 40], 0.3),
  children: (f) => <><Orb position={[-50, 8, -100]} radius={5} color="#ffd8a0" /><Lake /><House f={f + 40} beep={1} /></>});
// 21 skeptics blame Jupiter: shadow-puppet style scene (its own 2D scene)
S[21] = () => { const d = dur(21); return <AbsoluteFill><ShadowPuppet dur={d} set={['moon', 'house']} label="JUPITER?" actors={[{x0: 300, x1: 420, pose: 'stand', then: {at: 10, pose: 'point'}}, {x0: 760, x1: 700, pose: 'stand', flip: true, then: {at: 18, pose: 'point'}}]} /><Dip inFrames={3} color="#04060c" /></AbsoluteFill>; };
// 22 faulty jet: sparks in the cockpit panel
mk(22, {fog: [14, 70], flash: [47.06], bloom: 1.5, pills: [['FAULTY JET?', 236, 'red', 54, 47.2]], cam: (d) => push([0.6, 0.8, -0.8], [0.3, 0.6, 0.5], [[0, 0.3, 2], [0, 0.35, 2]], d, [52, 40], 0.8),
  children: (f) => <><Cab f={f} kill={at(0.25)} withLight={false} redFlash={1} /><Burst kind="sparks" position={[0, 0.5, 2.0]} start={at(0.2)} frame={f} count={40} color="#ffb040" /><Stars2 /></>});
// 23 reveal: the cable still reached the White House
const WhiteHouse = ({f}) => <group>
  <Bx p={[0, -0.6, 0]} s={[60, 1, 40]} c="#1c2a24" />
  <Bx p={[0, 1.6, 0]} s={[12, 3.2, 3.6]} c="#e4e4e8" /><Bx p={[0, 3.45, 0]} s={[12.4, 0.3, 3.9]} c="#d0d0d6" /><Bx p={[0, 4.4, 0.2]} s={[5, 1.6, 2.6]} c="#e4e4e8" />
  <mesh position={[0, 5.5, 0.2]} scale={[2.2, 0.9, 1.2]}><sphereGeometry args={[1, 10, 5, 0, 6.28, 0, Math.PI / 2]} /><meshLambertMaterial color="#d8d8de" flatShading /></mesh>
  {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => <Cy key={x} p={[x, 1.4, 2.2]} a={[0.16, 0.16, 2.8, 8]} c="#f4f4f6" />)}
  {Array.from({length: 10}, (_, i) => <Bx key={i} p={[-5 + i * 1.1, 1.8, 1.82]} s={[0.4, 0.55, 0.04]} c="#ffe6a8" basic o={0.55 + 0.45 * ((i * 7) % 3) / 2} />)}
  <Cy p={[6.8, 3.6, 1]} a={[0.04, 0.04, 4.4, 6]} c="#ccc" /><Bx p={[7.4, 5.1, 1]} s={[1.2, 0.7, 0.04]} c="#c83a3a" r={[0, 0, 0.03 * Math.sin(f * 0.2)]} />
</group>;
mk(23, {pal: DEEP, fog: [40, 180], flash: [48.0], bloom: 1.5, pills: [['WHITE HOUSE', 236, 'yellow', 58, 48.3]], cam: (d) => push([-8, 2.2, 14], [-3, 2.8, 9], [[0, 2.6, 0], [0, 3.0, 0]], d, [60, 48], 0.3),
  children: (f, d) => <><Sky f={f} /><WhiteHouse f={f} />{[0, 1, 2, 3, 4].map((i) => { const k = clamp01((f - i * 6) / 56); return <group key={i} position={[-14 + k * 14, 7 - k * 4.4 + Math.sin(f * 0.2 + i) * 0.2, 11 - k * 9 + i * 0.3]} rotation={[0.3, f * 0.05 + i, 0.2]}><Bx s={[0.6, 0.02, 0.8]} c="#f0eadb" /></group>; })}<pointLight position={[0, 3, 6]} color="#ffe6a8" intensity={6} distance={18} /></>});
// 24 Jupiter or a faulty jet: Jupiter (banded) over a jet
mk(24, {fog: [30, 180], pills: [['JUPITER', 236, 'yellow', 66, 50.4], ['OR A BAD JET', 316, 'white', 50, 51.2]], cam: (d) => push([-4, 2.2, -9], [-2, 2.6, -6.2], [[0, 3, 4], [0, 3.4, 4]], d, [58, 48], 0.3),
  children: (f) => <><Stars opacity={0.6} count={130} /><group position={[3, 6.4, 14]}><mesh scale={[1, 0.96, 1]}><sphereGeometry args={[1.5, 16, 10]} /><meshBasicMaterial color="#d8b890" /></mesh>
    {[0.5, 0.15, -0.3, -0.7].map((y, i) => <mesh key={i} position={[0, y, 0]} scale={[Math.sqrt(Math.max(0.01, 1 - (y / 1.5) ** 2)) * 1.51, 0.12, Math.sqrt(Math.max(0.01, 1 - (y / 1.5) ** 2)) * 1.51]}><cylinderGeometry args={[1, 1, 1, 16]} /><meshBasicMaterial color={i % 2 ? '#a8794a' : '#f0dcb8'} /></mesh>)}<Glow position={[0, 0, -0.2]} size={8} color="#ffe0b0" opacity={0.4} /></group>
    <Jet position={[-1, 1.4, -1 + f * 0.03]} rotation={[0, 0, 0.05]} scale={1.1} frame={f} /><Burst kind="sparks" position={[-1, 1.6, 0]} start={at(0.4)} frame={f} count={26} color="#ffb040" /></>});
// 25 or something that stopped a missile: the light looms, jet tiny
mk(25, {fog: [30, 190], flash: [52.4], bloom: 1.6, cam: (d) => push([-1.5, 2.0, -9], [-0.6, 1.8, -5.4], [[0, 1.8, 10], [0, 2.0, 12]], d, [66, 54], 0.8),
  children: (f, d) => { const k = clamp01(f / d); return <><Sky f={f} /><Jet position={[0, 1.5, -2 + f * 0.04]} rotation={[0, 0, 0.03]} scale={1.0} frame={f} /><Lt position={[0.2, 2.0, 22 - k * 10]} scale={2 + k * 1.6} frame={f} big={1.2 + k * 0.6} /></>; }});
// 26 END: frame-0 cockpit again, light still there, weapons panel dark (loops to line 1)
mk(26, {fog: [20, 120], bloom: 1.5, cam: (d) => push(P1, P0, L0, d, [52, 68], 0.2, 'inout'),
  children: (f) => <><Cab f={f} kill={0} /><Stars2 /><Particles kind="motes" center={[0, 1, 6]} area={[4, 3, 8]} count={24} frame={f} color="#cfe4ff" opacity={0.5} /></>});

const Over = () => <>
  <Sequence from={0} durationInFrames={at(2.6)}><Pill text="WEAPONS PANEL" y={236} variant="yellow" delay={-7} size={64} /><Pill text="WENT DEAD" y={316} variant="red" delay={-5} size={78} /></Sequence>
  <Sequence from={at(17.48)} durationInFrames={at(19.8) - at(17.48)}><Pill text="ALL INSTRUMENTS" y={236} variant="yellow" delay={0} size={58} /><Pill text="DEAD" y={316} variant="red" delay={3} size={80} /></Sequence>
  <Sequence from={at(27.26)} durationInFrames={at(29.6) - at(27.26)}><Pill text="ANOTHER LIGHT." y={236} variant="yellow" delay={0} size={58} /><Pill text="HEADS FOR THE JET." y={316} variant="red" delay={3} size={52} /></Sequence>
  <Sequence from={at(48.0)} durationInFrames={at(50.2) - at(48.0)}><Pill text="CABLE TO" y={236} variant="yellow" delay={0} size={64} /><Pill text="THE WHITE HOUSE" y={316} variant="red" delay={3} size={56} /></Sequence>
  <Sequence from={at(50.31)} durationInFrames={TH_FRAMES - at(50.31)}><Pill text="JUPITER AND A BAD JET?" y={236} variant="yellow" delay={0} size={44} /><Pill text="OR SOMETHING ELSE?" y={316} variant="red" delay={5} size={52} /></Sequence></>;

export const TH = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? TH_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && i !== 21 && <Dip inFrames={3} color="#04060c" />}</Sequence>; })}
    <Over />
    <Grade look="cold" strength={0.15} /><Finish vignette={0.3} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
