// "It's Not An Aircraft." (Valentich, 21 Oct 1978) - low-poly 3D Short, 21 scenes on cues.json cuts (+1 extra at 34.8).
// Frame 0 = Cessna small + huge shiny 4-light craft above it, dusk Bass Strait; last scene restores that set (loop).
// Facts from sources.txt only (S1 Wikipedia, S2 Skeptical Inquirer). The craft is shown as the pilot described it, not as proven.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, Post, Person, Particles, Burst, LightCone, Ocean, Grade, Stars, Orb, Glow, Clouds, clamp01, easeOut} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Scope, RadioDesk} from '../kinross-1953/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const VL_FRAMES = Math.round(44.04 * FPS);
const W = VO.words;
const CS = [0.0, 2.26, 5.06, 7.02, 9.83, 11.19, 11.97, 14.52, 17.48, 19.96, 22.66, 25.12, 26.24, 29.04, 29.85, 32.64, 33.36, 34.8, 36.56, 38.02, 39.84];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? VL_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

const DUSK = {top: '#1c1440', mid: '#6a3068', hor: '#f08040', fog: '#4a2848', amb: 0.9, hemiSky: '#c0a0ff', hemiGround: '#2a1a30', hemiI: 1.4, sun: '#ffb070', sunI: 1.8, sunPos: [-30, 6, -20], rim: '#9ad0ff', rimI: 1.6, rimPos: [25, 12, -40], glow: 1};
const NIGHT = {top: '#050a24', mid: '#10204e', hor: '#3a4a90', fog: '#101c44', amb: 0.9, hemiSky: '#9ab0ff', hemiGround: '#1a2040', hemiI: 1.5, sun: '#b8c8ff', sunI: 1.7, sunPos: [-20, 30, 20], rim: '#8fe0ff', rimI: 1.8, rimPos: [25, 12, -40], glow: 1};
const DEEP = {...NIGHT, top: '#02040e', mid: '#08122e', hor: '#16245a', fog: '#080f2a', sunI: 1.3};
const ROOM = {top: '#05181e', mid: '#0a3038', hor: '#14504e', fog: '#06222a', amb: 0.8, hemiSky: '#6ae0a0', hemiGround: '#123a2c', hemiI: 1.2, sun: '#9affc8', sunI: 0.9, sunPos: [0, 10, 5], rim: '#4affb0', rimI: 1.3, rimPos: [0, 5, -10], glow: 1};
const SEAN = {deep: '#050e22', face: '#1c3c78', foam: '#a8bcdc', foamAt: 0.9};
const SEAD = {deep: '#14183a', face: '#3a3c80', foam: '#f0c8b0', foamAt: 0.9};

const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
const Cy = ({p = [0, 0, 0], a = [0.2, 0.2, 1, 8], c = '#888', r = [0, 0, 0], e, ei = 1}) => <mesh position={p} rotation={r}><cylinderGeometry args={a} /><meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} /></mesh>;

// ---------- Cessna 182 (forward = +z): white high-wing, red stripe, spinning prop, nav lights ----------
export const Cessna = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, spin = 1}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx s={[0.85, 0.8, 3.2]} c="#f0f2f6" />
  <Bx p={[0, -0.06, 0]} s={[0.88, 0.12, 3.0]} c="#c03030" />
  <Bx p={[0, -0.02, 1.85]} s={[0.78, 0.66, 0.7]} c="#d8dce6" />
  <mesh position={[0, -0.02, 2.3]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.2, 0.3, 8]} /><meshLambertMaterial color="#ffe08a" flatShading /></mesh>
  <group position={[0, -0.02, 2.4]} rotation={[0, 0, frame * 1.7 * spin]}><Bx s={[1.9, 0.12, 0.04]} c="#1a1a1a" /><mesh><circleGeometry args={[0.95, 14]} /><meshBasicMaterial color="#cfd8e8" transparent opacity={0.16 * spin} /></mesh></group>
  <Bx p={[0, 0.34, 0.45]} s={[0.87, 0.3, 1.2]} c="#1a2a44" e="#2a4a7a" ei={0.5} />
  <Bx p={[0, 0.12, -2.2]} s={[0.5, 0.55, 1.6]} c="#eef0f4" />
  <Bx p={[0, 0.78, -2.85]} s={[0.07, 0.95, 0.75]} r={[-0.3, 0, 0]} c="#c03030" />
  <Bx p={[0, 0.25, -2.95]} s={[2.1, 0.06, 0.5]} c="#f0f2f6" />
  <Bx p={[0, 0.7, 0.35]} s={[6.8, 0.08, 1.15]} c="#f6f8fb" />
  {[-1, 1].map((k) => <group key={k}><Bx p={[k * 1.6, 0.25, 0.35]} s={[0.05, 0.95, 0.06]} r={[0, 0, k * 0.65]} c="#aab2c0" />
    <Bx p={[k * 0.45, -0.55, 0.7]} s={[0.05, 0.5, 0.05]} c="#8a909c" /><Cy p={[k * 0.45, -0.85, 0.7]} a={[0.2, 0.2, 0.1, 8]} r={[0, 0, Math.PI / 2]} c="#222" />
    <mesh position={[k * 3.4, 0.7, 0.35]}><sphereGeometry args={[0.1, 6, 5]} /><meshBasicMaterial color={k < 0 ? '#ff2a2a' : '#2aff6a'} /></mesh></group>)}
  <mesh position={[0, 1.2, -2.95]}><sphereGeometry args={[0.07, 6, 5]} /><meshBasicMaterial color={Math.sin(frame * 0.4) > 0.3 ? '#ffffff' : '#555'} /></mesh>
</group>;

// ---------- the craft, as described: shiny metal, four bright lights in a row, one green light ----------
export const Craft = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, beams = true}) => {
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.4);
  return <group position={position} rotation={rotation} scale={scale}>
    <mesh scale={[1.7, 0.42, 1.7]}><sphereGeometry args={[1, 14, 8]} /><meshLambertMaterial color="#e2e8f2" flatShading emissive="#7a8aa8" emissiveIntensity={0.55} /></mesh>
    <mesh position={[0, 0.3, 0]} scale={[0.8, 0.36, 0.8]}><sphereGeometry args={[1, 12, 7]} /><meshLambertMaterial color="#b8c4d8" flatShading emissive="#5a6a88" emissiveIntensity={0.5} /></mesh>
    <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.62, 0.07, 6, 28]} /><meshLambertMaterial color="#9aa6bc" flatShading emissive="#4a5a78" emissiveIntensity={0.6} /></mesh>
    {[-0.9, -0.3, 0.3, 0.9].map((x, i) => <group key={i} position={[x, -0.34, 0.55 + Math.abs(x) * -0.25]}><mesh><sphereGeometry args={[0.2, 8, 6]} /><meshBasicMaterial color="#ffffff" /></mesh><Glow position={[0, -0.05, 0.05]} size={1.25 * pulse} color="#fffbe8" opacity={0.6} /></group>)}
    <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.18, 8, 6]} /><meshBasicMaterial color="#38ff7a" /></mesh><Glow position={[0, 0.72, 0]} size={2.6 * pulse} color="#38ff7a" opacity={0.9} />
    {beams && [-0.6, 0.6].map((x, i) => <LightCone key={i} position={[x, -0.4, 0.5]} dir={[0, -1, 0.25]} length={7} radius={1.5} frame={frame + i * 9} color="#fff6d0" opacity={0.3} />)}
  </group>; };

// ---------- shared pieces ----------
const Sea = ({f, amp = 0.7, choppy = 1.2, y = -0.3, size = [150, 90], dusk = false}) => <Ocean size={size} frame={f} amp={amp} choppy={choppy} position={[0, y, 0]} {...(dusk ? SEAD : SEAN)} />;
const Sky = ({f, clouds = true, dusk = false}) => <>
  {dusk ? <><Orb position={[-70, 6, -110]} radius={6} color="#ffc088" /><Glow position={[-70, 6, -109]} size={55} color="#ff8a50" opacity={0.55} /><Stars opacity={0.3} count={90} /></> : <><Stars opacity={0.55} count={140} /><Orb position={[-50, 50, -100]} radius={4} color="#f8f4dc" /><Glow position={[-50, 50, -99]} size={30} color="#9fc0ff" opacity={0.45} /></>}
  {clouds && <Clouds frame={f} y={22} color={dusk ? '#6a3a60' : '#2a3a80'} opacity={0.9} speed={0.12} count={8} seed={7} />}</>;
const S = [];
const mk = (i, {pal = NIGHT, fog = [30, 150], pills = [], cam, children, flash = [], card = null, extra = null, bloom = 1.3, bg}) => { S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} background={bg} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.45} len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d)}<Post bloom={bloom} threshold={0.4} vignette={0.4} /></Stage>; }; };
const push = (from, to, look, d, fov = [52, 44], shake = 0, ease = 'inout') => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease={ease} shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d, fov = [52, 44]) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" />;
const Clock = ({time, y = 520, tag, red = false}) => <div style={{position: 'absolute', top: y, left: 70, width: 340, height: 200, background: '#0c1018', borderRadius: 14, border: '6px solid ' + (red ? '#ff5a4e' : '#ffd93b'), boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center', overflow: 'hidden'}}>
  <div style={{background: red ? '#d6302a' : '#d6a82a', color: '#101010', fontFamily: 'Lilita One', fontSize: 38, padding: '4px 0', letterSpacing: 3}}>{tag}</div><div style={{fontFamily: 'Lilita One', fontSize: 108, color: red ? '#ff7a6e' : '#ffe27a', lineHeight: 1.2}}>{time}</div></div>;

// frame-0 set (also the last scene): Cessna low, craft huge above it
const CE = [0, 3, 1]; const CR = [-0.5, 9.2, -2];
const P0 = [-3, 2.0, 12]; const P1 = [-1.2, 2.8, 9.2]; const L0 = [[0, 5.2, 0], [0, 5.6, 0]];
const Hero = ({f, bank = 0.2, craftPulse = 0, dusk = true}) => <><Sky f={f} dusk={dusk} /><Sea f={f} dusk={dusk} />
  <Cessna position={CE} rotation={[0.02, Math.PI / 2, bank + Math.sin(f * 0.05) * 0.02]} scale={1.0} frame={f} />
  <Craft position={[CR[0], CR[1] + Math.sin(f * 0.06) * 0.15, CR[2]]} rotation={[0.1, f * 0.01, 0]} scale={1.6} frame={f} /></>;

// Cabin interior (pilot's seat view): panel, yoke, windscreen frame; lights of the craft out front
const Cabin = ({f, lights = true, lx = 0, ly = 2.6, lz = 9, red = 0}) => <group>
  <Bx p={[0, -0.9, 0]} s={[2.2, 0.2, 3.5]} c="#3a4252" />
  <Bx p={[-1.1, 0.2, 0.2]} s={[0.12, 2.0, 3.2]} c="#4a5262" /><Bx p={[1.1, 0.2, 0.2]} s={[0.12, 2.0, 3.2]} c="#4a5262" /><Bx p={[0, 1.3, 0.2]} s={[2.4, 0.12, 3.2]} c="#3a4252" />
  <Bx p={[0, -0.1, 1.6]} s={[2.2, 0.8, 0.3]} c="#14181e" />
  {Array.from({length: 6}, (_, i) => <mesh key={i} position={[-0.7 + (i % 3) * 0.7, 0.05 - Math.floor(i / 3) * 0.3, 1.43]}><circleGeometry args={[0.15, 10]} /><meshBasicMaterial color={i % 3 === 0 ? '#ffc050' : '#b0ffd0'} transparent opacity={0.8 + 0.2 * Math.sin(f * 0.2 + i)} /></mesh>)}
  <Bx p={[0.45, -0.3, 1.0]} s={[0.08, 0.08, 0.6]} c="#222" /><mesh position={[0.45, -0.05, 0.72]} rotation={[0, 0.3, 0]}><torusGeometry args={[0.22, 0.04, 6, 14]} /><meshLambertMaterial color="#222" flatShading /></mesh>
  <Person position={[0.5, -0.9, -0.2]} rotation={0} scale={0.75} pose="sit" phase={f / 10} shirt="#e8e8ee" pants="#2a3040" />
  {lights && <group position={[lx, ly, lz]}>{[-1.2, -0.4, 0.4, 1.2].map((x, i) => <group key={i} position={[x, 0, 0]}><mesh><sphereGeometry args={[0.3, 8, 6]} /><meshBasicMaterial color="#ffffff" /></mesh><Glow position={[0, 0, -0.1]} size={1.6} color="#fffbe8" opacity={0.7} /></group>)}
    <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.22, 8, 6]} /><meshBasicMaterial color="#38ff7a" /></mesh><Glow position={[0, 0.7, -0.1]} size={3.4} color="#38ff7a" opacity={0.9} /></group>}
  <pointLight position={[0, 0.6, 0.6]} color={red ? '#ff4a3a' : '#ffa840'} intensity={red ? 7 * (0.6 + 0.4 * Math.sin(f * 0.8)) : 3} distance={6} />
</group>;

// 0 HOOK: Cessna small, huge craft above, fastest push from frame 0
mk(0, {pal: DUSK, flash: [0.9], fog: [40, 170], cam: (d) => push(P0, P1, L0, d, [64, 50], 0.9, 'out'), children: (f) => <><Hero f={f} /><Particles kind="motes" center={[0, 5, 0]} area={[10, 5, 10]} count={24} frame={f} color="#ffe8c0" opacity={0.5} /></>});
// 1 seventeen seconds of scraping: cabin, craft lights ahead, flicker
mk(1, {pal: NIGHT, fog: [20, 100], flash: [3.5], bloom: 1.5, pills: [['SCRAPING', 236, 'red', 66, 3.6]], cam: (d) => push([0.5, 0.8, -1.6], [0.35, 0.7, -0.6], [[0, 0.9, 3], [0, 1.0, 4]], d, [64, 52], 0.9),
  extra: (f, d) => <Clock time={String(Math.min(17, Math.floor(clamp01(f / (d - 6)) * 17)))} tag="SECONDS" red />, children: (f) => <><Cabin f={f} red={1} lx={Math.sin(f * 0.2) * 0.6} ly={1.3} lz={8} /><Stars opacity={0.5} count={100} /></>});
// 2 October 1978: portrait card
mk(2, {pal: DUSK, pills: [], cam: (d) => push([-6, 3, 14], [-3, 3.4, 10], [[0, 3, 0], [0, 3, 0]], d, [54, 46], 0.2),
  children: (f) => <Hero f={f} />, card: (f, d) => <PhotoCard src="valentich/IMG1.png" credit="Frederick Valentich · Australian Dept of Transport, public domain" tag="21 OCT 1978 · PILOT, AGE 20" delay={4} dur={d} rot={-2} />});
// 3 Frederick Valentich flies: chase cam behind the Cessna
mk(3, {pal: DUSK, pills: [['FREDERICK', 236, 'yellow', 62, 7.3], ['VALENTICH', 316, 'white', 62, 7.75]], cam: (d) => orbit([0, 3, 0], 2.6, 3.5, 14, 11, 4.5, 3.5, d, [54, 46]),
  children: (f) => <><Sky f={f} dusk /><Sea f={f} dusk /><Cessna position={[f * 0.05, 3, 0]} rotation={[0, Math.PI / 2, 0.08]} scale={1.1} frame={f} /></>});
// 4 rented Cessna: side orbit
mk(4, {pal: DUSK, pills: [['RENTED', 236, 'yellow', 66, 10.0], ['CESSNA 182', 316, 'white', 56, 10.4]], cam: (d) => orbit([0, 3, 0], 0.4, 1.3, 11, 8, 3, 3.8, d, [52, 46]),
  children: (f) => <><Sky f={f} dusk /><Sea f={f} dusk /><Cessna position={[0, 3, 0]} rotation={[0, Math.PI / 2, 0.1]} scale={1.2} frame={f} /></>});
// 5 Strait: map card
mk(5, {pal: DUSK, pills: [], cam: (d) => push([0, 6, 16], [0, 5, 12], [[0, 0, 0], [0, 0.5, 0]], d, [58, 50], 0.3),
  children: (f) => <><Sky f={f} dusk /><Sea f={f} dusk amp={0.9} /></>, card: (f, d) => <PhotoCard src="valentich/IMG4.png" credit="Route map · Australian Dept of Transport, public domain" tag="MELBOURNE → KING ISLAND" delay={1} dur={d} rot={2} />});
// 6 19:06 Melbourne radio desk
mk(6, {pal: ROOM, fog: [80, 220], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', pills: [['FOUR LIGHTS', 236, 'yellow', 58, 13.6]], flash: [13.9],
  cam: (d) => push([0.5, 2.8, 5.5], [0.1, 1.9, 2.4], [[0, 1.3, 0], [0, 1.3, 0]], d, [52, 40], 0.3), extra: () => <Clock time="19:06" tag="MELBOURNE" />,
  children: (f) => <><RadioDesk frame={f} /><LightCone position={[0, 4.4, 0.4]} dir={[0, -1, 0]} length={3.6} radius={1.8} frame={f} color="#ffe8b0" opacity={0.3} /></>});
// 7 four lights pass a thousand feet above him
mk(7, {pal: DUSK, pills: [['1,000 FT', 236, 'yellow', 64, 15.3], ['ABOVE HIM', 316, 'white', 58, 15.9]], flash: [14.9], cam: (d) => push([3, 2.2, 7], [1, 2.8, 4.4], [[0, 5.5, 0], [2, 6.5, 0]], d, [66, 54], 0.5),
  children: (f) => <><Sky f={f} dusk /><Sea f={f} dusk /><Cessna position={[0, 3, 0]} rotation={[0, Math.PI / 2, 0.1]} scale={1.1} frame={f} />
    <Craft position={[-6 + f * 0.17, 6.6, -1]} rotation={[0.1, f * 0.02, 0]} scale={1.1} frame={f} beams={false} /></>});
// 8 TWIST: Melbourne has no aircraft there - lone unknown blip
mk(8, {pal: ROOM, fog: [14, 60], flash: [17.48], bloom: 1.5, cam: (d) => push([0.4, 6.0, 5.5], [0.4, 3.6, 1.6], [[0, 0, 0], [0.3, 0, -0.3]], d, [50, 42], 0.4),
  children: (f) => <Scope frame={f} tt={21 + f / 30 * 0.5} mode="unknown" />});
// 9 orbiting him: craft circles the Cessna, green light
mk(9, {pal: NIGHT, pills: [['ORBITING', 236, 'yellow', 66, 20.2], ['SHINY METAL', 316, 'white', 52, 21.2]], cam: (d) => orbit([0, 4, 0], 0.5, 1.6, 17, 14, 4.5, 4, d, [62, 56]),
  children: (f) => { const a = 0.9 + f * 0.05; return <><Sky f={f} /><Sea f={f} /><Cessna position={[0, 3, 0]} rotation={[0, Math.PI / 2, 0.12]} scale={1.0} frame={f} />
    <Craft position={[Math.cos(a) * 5, 6.3 + Math.sin(f * 0.1) * 0.3, Math.sin(a) * 5]} rotation={[0.1, -a, 0]} scale={1.2} frame={f} /></>; }});
// 10 engine coughing: Cessna shakes, smoke + sparks
mk(10, {pal: NIGHT, pills: [['ENGINE', 236, 'red', 62, 23.7], ['COUGHING', 316, 'white', 56, 24.1]], flash: [23.5], cam: (d) => push([5, 3.2, 8], [2.6, 3.4, 5], [[0, 3, 1], [0, 3, 1.5]], d, [58, 48], 1.0),
  children: (f) => <><Sky f={f} /><Sea f={f} /><Cessna position={[0, 3 + Math.sin(f * 1.3) * 0.08, 0]} rotation={[0.05, Math.PI / 2, 0.14 + Math.sin(f * 0.9) * 0.05]} scale={1.2} frame={f} spin={0.6 + 0.4 * Math.sin(f * 0.7)} />
    <Particles kind="ash" center={[1.5, 3.2, 0]} area={[2, 1.2, 1.5]} count={40} frame={f} opacity={0.7} /><Burst kind="sparks" position={[1.6, 3.1, 0]} start={at(0.5)} frame={f} count={36} color="#ff8a4a" />
    <Craft position={[-3, 8, -6]} rotation={[0.1, f * 0.02, 0]} scale={1.2} frame={f} /></>});
// 11 then he says it again: close on the Cessna's cabin window, craft glowing right above, red warning flicker
mk(11, {pal: {...NIGHT, rim: '#ff4a3a', hor: '#5a2a50'}, fog: [30, 150], flash: [25.12], pills: [['AGAIN', 236, 'red', 76, 25.2]], cam: (d) => push([6.4, 4.2, 6.6], [4.2, 3.8, 4.4], [[0, 3.3, 0.4], [0, 3.4, 0.6]], d, [58, 46], 0.8),
  children: (f) => <><Sky f={f} /><Sea f={f} /><Cessna position={[0, 3, 0]} rotation={[0.02, Math.PI / 2, 0.12 + Math.sin(f * 0.8) * 0.03]} scale={1.25} frame={f} />
    <Craft position={[-0.5, 7.2, -0.8]} rotation={[0.1, f * 0.02, 0]} scale={1.5} frame={f} /><pointLight position={[0.5, 3.6, 1.5]} color="#ff4a3a" intensity={9 * (0.5 + 0.5 * Math.sin(f * 0.8))} distance={6} /></>});
// 12 seventeen seconds of scraping: craft huge overhead, clock counts to 17
mk(12, {pal: NIGHT, flash: [26.3, 27.4], bloom: 1.5, cam: (d) => push([2, 2.6, 6], [0.5, 3.0, 4], [[0, 6, 0], [0, 6.5, 0]], d, [66, 56], 1.1),
  extra: (f, d) => <Clock time={String(Math.min(17, Math.floor(clamp01(f / (d - 8)) * 17)))} tag="SECONDS" red />,
  children: (f) => <><Sky f={f} /><Sea f={f} /><Cessna position={[0, 3, 0]} rotation={[0.04, Math.PI / 2, 0.16 + Math.sin(f * 1.1) * 0.05]} scale={1.1} frame={f} />
    <Craft position={[0, 7.6, -0.6]} rotation={[0.08, f * 0.03, 0]} scale={1.7} frame={f} /><Burst kind="sparks" position={[0.2, 3.7, 0.5]} start={at(0.5)} frame={f} count={50} color="#ffd890" /></>});
// 13 silence: empty dark sky
mk(13, {pal: NIGHT, bloom: 1.6, extra: () => <CFlash at={[at(29.5) - C[13]]} k={0.5} len={10} />, pills: [['SILENCE.', 236, 'red', 76, 29.15]], flash: [29.04], cam: (d) => push([0, 5, 14], [0, 4, 11], [[0, 3, 0], [0, 3, 0]], d, [58, 50], 0.2),
  children: (f) => <><Sky f={f} /><Sea f={f} amp={0.6} /></>});
// 14 searchers: aircraft with beams sweeping the sea
mk(14, {pal: DEEP, pills: [['1,000 SQ MILES', 236, 'yellow', 52, 30.9], ['4 DAYS', 316, 'white', 66, 32.1]], cam: (d) => push([-3, 3.5, 13], [1, 4.5, 10], [[0, 5, 0], [0, 5.5, 0]], d, [58, 52], 0.3),
  children: (f) => <><Sky f={f} /><Sea f={f} />{[0, 1].map((i) => <group key={i}><Cessna position={[-5 + f * 0.1 + i * 7, 5.5 - i * 0.6, -2 - i * 3]} rotation={[0, Math.PI / 2, 0]} scale={0.9} frame={f} />
    <LightCone position={[-5 + f * 0.1 + i * 7, 5.1 - i * 0.6, -2 - i * 3]} dir={[Math.sin(f * 0.05 + i * 2) * 0.5, -1, 0.1]} length={6} radius={1.6} frame={f} color="#fff2c0" opacity={0.35} /></group>)}</>});
// 15 No: empty sea flash
mk(15, {pal: NIGHT, bloom: 1.6, flash: [32.64], cam: (d) => push([0, 3.5, 18], [0, 3, 13], [[0, 3, 0], [0, 3.5, 0]], d, [58, 48], 0.4), children: (f) => <><Sky f={f} /><Sea f={f + 40} amp={1.0} /></>});
// 16 No wreck. No body.: empty sea, slow crane
mk(16, {pal: DEEP, flash: [33.36, 34.1], cam: (d) => push([6, 3, 14], [2, 4.5, 11], [[0, 2.5, 0], [0, 3, -2]], d, [56, 50], 0.4), children: (f) => <><Sky f={f} /><Sea f={f + 80} amp={0.9} /><Particles kind="spray" center={[0, 0.5, 0]} area={[30, 1, 24]} count={40} frame={f} opacity={0.5} /></>});
// 17 Five years later: beach at dawn, surf
const Beach = ({f, part = true}) => <group>
  <Bx p={[0, -0.5, -9]} s={[60, 1.0, 14]} c="#cdb88a" r={[0.05, 0, 0]} /><Bx p={[0, -0.25, -3.2]} s={[60, 0.4, 1.6]} c="#bfa878" r={[0.1, 0, 0]} />
  {Array.from({length: 7}, (_, i) => <Bx key={i} p={[-12 + i * 4, 0.1, -8 - (i % 3)]} s={[1.6 + (i % 2), 0.5, 1.2]} c="#8a7a5a" />)}
  {part && <group position={[0.8, 0.12, -2.4]} rotation={[0.1, 0.6, 0.05]}><Bx s={[1.5, 0.08, 1.0]} c="#e4e8f0" /><Bx p={[0, 0.04, 0]} s={[1.3, 0.04, 0.8]} c="#c03030" /><Bx p={[0.55, 0.1, 0.1]} s={[0.1, 0.18, 0.4]} c="#9aa2b0" /></group>}
</group>;
const DAWN = {top: '#2a2a58', mid: '#8a5a7a', hor: '#ffc890', fog: '#7a5a70', amb: 1.0, hemiSky: '#ffd0b0', hemiGround: '#4a3a40', hemiI: 1.6, sun: '#ffd8a0', sunI: 1.9, sunPos: [-20, 8, -20], rim: '#9ad0ff', rimI: 1.2, rimPos: [20, 10, -30], glow: 1};
mk(17, {pal: DAWN, pills: [['5 YEARS LATER', 236, 'yellow', 52, 34.9], ['ONE CESSNA PART', 316, 'white', 48, 35.6]], flash: [34.8], fog: [30, 140], cam: (d) => push([-6, 3.4, 8], [-2, 2.0, 3], [[0, 0, -3], [0.8, 0, -2.4]], d, [58, 46], 0.2),
  children: (f) => <><Orb position={[-50, 8, -100]} radius={5} color="#ffd8a0" /><Sea f={f} dusk amp={0.4} y={-0.3} size={[150, 50]} /><group position={[0, 0, 2]}><Beach f={f} /></group></>});
// 18 part washes ashore: close on the part in the surf
mk(18, {pal: DAWN, flash: [36.56], pills: [['WASHES ASHORE', 236, 'white', 54, 36.8]], fog: [30, 140], cam: (d) => push([3.2, 2.0, 2.2], [1.9, 1.3, 0.5], [[0.8, 0.1, -0.4], [0.8, 0.1, -0.4]], d, [54, 44], 0.2),
  children: (f) => <><Sea f={f} dusk amp={0.45 + 0.3 * Math.sin(f * 0.15)} y={-0.1} size={[150, 50]} /><group position={[0, 0, 2]}><Beach f={f} /></group></>});
// 19 Was something really orbiting him: craft circles the Cessna again
mk(19, {pal: NIGHT, cam: (d) => orbit([0, 4, 0], 2.2, 3.0, 17, 14, 4.5, 4, d, [62, 56]),
  children: (f) => { const a = 2.8 + f * 0.04; return <><Sky f={f} /><Sea f={f} /><Cessna position={[0, 3, 0]} rotation={[0, Math.PI / 2, 0.12]} scale={1.0} frame={f} />
    <Craft position={[Math.cos(a) * 5, 6.3, Math.sin(a) * 5]} rotation={[0.1, -a, 0]} scale={1.2} frame={f} /></>; }});
// 20 END: tilted horizon, then the frame-0 set restored; camera ends on frame 0's pose (loops to line 1)
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const k = clamp01(f / (d - 14)); const tilt = 0.5 * Math.sin(Math.PI * k) * (1 - clamp01((f - (d - 14)) / 1));
  return <Stage palette={DUSK} fog={[40, 170]} overlay={<CFlash at={[at(0.3)]} k={0.4} len={6} />}>
    {push(P1, P0, L0, d, [50, 64], 0.2, 'inout')}
    <group rotation={[0, 0, tilt]} position={[0, 3, 0]}><group position={[0, -3, 0]}><Sky f={f} dusk /><Sea f={f} dusk /></group></group>
    <Cessna position={CE} rotation={[0.02, Math.PI / 2, 0.2 + tilt * 0.6 + Math.sin(f * 0.05) * 0.02]} scale={1.0} frame={f} />
    <Craft position={[CR[0], CR[1] + Math.sin(f * 0.06) * 0.15, CR[2]]} rotation={[0.1, f * 0.01, 0]} scale={1.6} frame={f} />
    <Post bloom={1.3} threshold={0.4} vignette={0.4} /></Stage>; };

const Over = () => <>
  <Sequence from={0} durationInFrames={at(2.6)}><Pill text="IT'S NOT AN" y={236} variant="yellow" delay={-7} size={72} /><Pill text="AIRCRAFT." y={316} variant="red" delay={-5} size={78} /></Sequence>
  <Sequence from={at(17.48)} durationInFrames={at(19.57) - at(17.48)}><Pill text="NO KNOWN" y={236} variant="yellow" delay={0} size={66} /><Pill text="TRAFFIC." y={316} variant="red" delay={3} size={72} /></Sequence>
  <Sequence from={at(27.4)} durationInFrames={at(29.52) - at(27.4)}><Pill text="17 SECONDS" y={236} variant="yellow" delay={0} size={62} /><Pill text="OF SCRAPING." y={316} variant="red" delay={3} size={60} /></Sequence>
  <Sequence from={at(33.36)} durationInFrames={at(34.7) - at(33.36)}><Pill text="NO WRECK." y={236} variant="yellow" delay={0} size={68} /><Pill text="NO BODY." y={316} variant="red" delay={3} size={68} /></Sequence>
  <Sequence from={at(38.02)} durationInFrames={VL_FRAMES - at(38.02)}><Pill text="SOMETHING?" y={236} variant="yellow" delay={0} size={66} /><Pill text="OR THE SKY?" y={316} variant="red" delay={5} size={64} /></Sequence></>;

export const VL = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? VL_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#04060c" />}</Sequence>; })}
    <Over />
    <Grade look="cold" strength={0.15} /><Finish vignette={0.3} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
