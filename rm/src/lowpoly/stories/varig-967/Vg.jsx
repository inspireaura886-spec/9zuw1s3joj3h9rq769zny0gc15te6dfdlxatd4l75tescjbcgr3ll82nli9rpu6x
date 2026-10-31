// "Six Crew. No Wreckage." (Varig Flight 967, 30 Jan 1979) - low-poly 3D Short, 27 scenes on cues.json cuts.
// Frame 0 = the 707 large, banking over a dark Pacific, engines glowing; last scene = same set, sky around it empty (loop).
// Facts from sources.txt only (S1 Wikipedia, S2 ASN). No invented quotes; paintings count omitted (sources conflict).
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, Post, Person, Particles, Burst, Shockwave, LightCone, Ocean, Rain, Grade, Stars, Orb, Glow, Clouds, clamp01, easeOut} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Scope, Runway, SnowField, RadioDesk, Cockpit, Puffs} from '../kinross-1953/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const VG_FRAMES = Math.round(46.8 * FPS);
const W = VO.words;
const CS = [0.0, 2.1, 3.54, 5.6, 6.44, 8.04, 9.94, 11.6, 13.28, 15.25, 16.59, 18.8, 20.66, 22.36, 24.64, 25.38, 27.42, 29.4, 31.08, 32.4, 34.26, 35.98, 36.68, 38.38, 39.18, 41.36, 43.1];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? VG_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

const NIGHT = {top: '#050a24', mid: '#10204e', hor: '#3a4a90', fog: '#101c44', amb: 0.9, hemiSky: '#9ab0ff', hemiGround: '#1a2040', hemiI: 1.5, sun: '#b8c8ff', sunI: 1.7, sunPos: [-20, 30, 20], rim: '#8fe0ff', rimI: 1.8, rimPos: [25, 12, -40], glow: 1};
const DEEP = {...NIGHT, top: '#02040e', mid: '#08122e', hor: '#16245a', fog: '#080f2a', sunI: 1.3};
const FIRE = {top: '#1a0a06', mid: '#4a1a0c', hor: '#c8501c', fog: '#2a1008', amb: 0.9, hemiSky: '#ffb070', hemiGround: '#3a1a0c', hemiI: 1.4, sun: '#ffc080', sunI: 1.5, sunPos: [10, 20, 10], rim: '#ff7a30', rimI: 1.8, rimPos: [-10, 8, -20], glow: 1};
const ROOM = {top: '#05181e', mid: '#0a3038', hor: '#14504e', fog: '#06222a', amb: 0.8, hemiSky: '#6ae0a0', hemiGround: '#123a2c', hemiI: 1.2, sun: '#9affc8', sunI: 0.9, sunPos: [0, 10, 5], rim: '#4affb0', rimI: 1.3, rimPos: [0, 5, -10], glow: 1};
const SEA = {deep: '#050e22', face: '#1c3c78', foam: '#a8bcdc', foamAt: 0.9};

const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
const Cy = ({p = [0, 0, 0], a = [0.2, 0.2, 1, 8], c = '#888', r = [0, 0, 0], e, ei = 1}) => <mesh position={p} rotation={r}><cylinderGeometry args={a} /><meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} /></mesh>;

// ---------- Boeing 707 (forward = +z, wings swept, 4 engines, T-less low tail), Varig-ish white + blue stripe ----------
export const J707 = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, burn = 1, ghost = false, fire = 0}) => {
  const o = ghost ? 0.45 : 1; const fl = 0.85 + 0.15 * Math.sin(frame * 1.7);
  return <group position={position} rotation={rotation} scale={scale}>
    <Cy a={[0.42, 0.42, 6.2, 10]} r={[Math.PI / 2, 0, 0]} c="#eef0f4" />
    <mesh position={[0, 0, 3.2]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.42, 0.9, 10]} /><meshLambertMaterial color="#d8dce6" flatShading /></mesh>
    <mesh position={[0, 0, -3.3]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[0.42, 1.3, 10]} /><meshLambertMaterial color="#d8dce6" flatShading /></mesh>
    <Cy p={[0, 0.0, 0]} a={[0.435, 0.435, 6.0, 10]} r={[Math.PI / 2, 0, 0]} c="#1c4a9a" />
    <Cy p={[0, 0.12, 0]} a={[0.43, 0.43, 6.0, 10]} r={[Math.PI / 2, 0, 0]} c="#eef0f4" />
    {Array.from({length: 14}, (_, i) => [-1, 1].map((s) => <Bx key={i + '_' + s} p={[s * 0.4, 0.2, -2.2 + i * 0.32]} s={[0.04, 0.1, 0.12]} c="#ffe8a0" e="#ffd070" ei={1.2} basic />))}
    <Bx p={[0, 0.2, 3.35]} s={[0.5, 0.14, 0.2]} c="#2a3a52" />
    {[-1, 1].map((s) => <group key={s}>
      <Bx p={[s * 2.2, -0.12, -0.2]} s={[3.6, 0.1, 1.5]} r={[0, s * 0.55, s * -0.05]} c="#d8dce6" />
      <Bx p={[s * 0.9, -0.05, -3.0]} s={[1.5, 0.07, 0.7]} r={[0, s * 0.45, 0]} c="#d8dce6" />
      {[0.6, 1.0].map((k, j) => <group key={j} position={[s * (1.5 + j * 1.5), -0.5, 0.4 - j * 0.75]}><Cy a={[0.2, 0.17, 1.0, 8]} r={[Math.PI / 2, 0, 0]} c="#8a909c" />
        {burn > 0 && <mesh position={[0, 0, -0.8]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, fl * burn]}><coneGeometry args={[0.14, 0.9, 6]} /><meshBasicMaterial color="#ffb040" transparent opacity={0.8} /></mesh>}
        <mesh position={[0, 0, 0.52]}><sphereGeometry args={[0.12, 6, 5]} /><meshBasicMaterial color="#ffd890" /></mesh></group>)}
      <mesh position={[s * 4.0, -0.05, -1.4]}><sphereGeometry args={[0.07, 6, 5]} /><meshBasicMaterial color={s < 0 ? '#ff2a2a' : '#2aff6a'} /></mesh></group>)}
    <Bx p={[0, 0.9, -3.0]} s={[0.08, 1.4, 0.9]} r={[-0.25, 0, 0]} c="#1c4a9a" />
    <mesh position={[0, 0.2, -3.5]}><sphereGeometry args={[0.07, 6, 5]} /><meshBasicMaterial color={Math.sin(frame * 0.35) > 0 ? '#ffffff' : '#444'} /></mesh>
    {fire > 0 && [0.4, 1.2, 2.0].map((z, i) => <mesh key={i} position={[0.2, 0.5 + i * 0.1, z - 1]} scale={[1, 1 + fl * 0.8, 1] }><coneGeometry args={[0.4 - i * 0.07, 1.4, 6]} /><meshBasicMaterial color={i % 2 ? '#ffd24a' : '#ff6a20'} transparent opacity={0.9} /></mesh>)}
  </group>; };

// ---------- shared pieces ----------
const Sea = ({f, amp = 0.7, choppy = 1.2, y = -0.3, size = [150, 90]}) => <Ocean size={size} frame={f} amp={amp} choppy={choppy} position={[0, y, 0]} {...SEA} />;
const Sky = ({f, clouds = true}) => <><Stars opacity={0.55} count={140} /><Orb position={[-50, 50, -100]} radius={4} color="#f8f4dc" /><Glow position={[-50, 50, -99]} size={30} color="#9fc0ff" opacity={0.45} />
  {clouds && <Clouds frame={f} y={22} color="#2a3a80" opacity={0.9} speed={0.12} count={8} seed={7} />}</>;
const kc = (id, a, b, v1 = 'yellow', v2 = 'red') => null;
const S = [];
const mk = (i, {pal = NIGHT, fog = [30, 150], pills = [], cam, children, flash = [], card = null, extra = null, bloom = 1.3, bg}) => { S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} background={bg} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.45} len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d)}<Post bloom={bloom} threshold={0.4} vignette={0.4} /></Stage>; }; };
const push = (from, to, look, d, fov = [52, 44], shake = 0, ease = 'inout') => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease={ease} shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d, fov = [52, 44]) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" />;
const Flying = ({f, x0 = 0, y = 4, z = 0, bank = 0.3, speed = 0.0, scale = 1, burn = 1}) => <J707 position={[x0 + f * speed, y + Math.sin(f * 0.05) * 0.15, z]} rotation={[0, Math.PI / 2 + 0.0, bank + Math.sin(f * 0.04) * 0.04]} scale={scale} frame={f} burn={burn} />;
const Clock = ({time, y = 520, tag, red = false}) => <div style={{position: 'absolute', top: y, left: 70, width: 340, height: 200, background: '#0c1018', borderRadius: 14, border: '6px solid ' + (red ? '#ff5a4e' : '#ffd93b'), boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center', overflow: 'hidden'}}>
  <div style={{background: red ? '#d6302a' : '#d6a82a', color: '#101010', fontFamily: 'Lilita One', fontSize: 38, padding: '4px 0', letterSpacing: 3}}>{tag}</div><div style={{fontFamily: 'Lilita One', fontSize: 108, color: red ? '#ff7a6e' : '#ffe27a', lineHeight: 1.2}}>{time}</div></div>;
const Frame = ({p, r = [0, 0, 0], s = 1, c = '#c8923a', art = '#3a6a9a', art2 = '#d8b04a'}) => <group position={p} rotation={r} scale={s}>
  <Bx s={[1.5, 1.1, 0.1]} c={c} /><Bx p={[0, 0, 0.06]} s={[1.3, 0.9, 0.03]} c={art} /><Bx p={[-0.2, -0.15, 0.08]} s={[0.55, 0.4, 0.02]} c={art2} /><Bx p={[0.3, 0.2, 0.08]} s={[0.4, 0.3, 0.02]} c="#a83a30" /></group>;

// 0 HOOK: 707 large, banking over a dark Pacific, engines glowing, fastest push from frame 0
mk(0, {pills: [], flash: [0.9], fog: [40, 160], cam: (d) => push([9, 3.8, -14], [3.4, 3.4, -7.4], [[0, 4, 0], [0, 4, -0.5]], d, [64, 50], 0.9, 'out'),
  children: (f) => <><Sky f={f} /><Sea f={f} /><J707 position={[0, 4, 0]} rotation={[0.05, 0.0, 0.32 + Math.sin(f * 0.05) * 0.03]} scale={1.15} frame={f} /><Particles kind="motes" center={[0, 4, -3]} area={[10, 5, 12]} count={30} frame={f} color="#a8c0ff" opacity={0.5} /></>});
// 1 vanished off Tokyo: it flies away, getting small
mk(1, {pills: [['OFF TOKYO', 236, 'yellow', 56, 3.0]], cam: (d) => push([-6, 5, 10], [-3, 4.6, 6], [[0, 4, 0], [2, 4, -6]], d, [54, 44], 0.2),
  children: (f) => <><Sky f={f} /><Sea f={f} /><J707 position={[0.2 * f * 0.02, 4, -f * 0.28]} rotation={[0, 0, 0.1]} scale={1.0} frame={f} /></>});
// 2 empty sea: not one piece
mk(2, {pal: DEEP, pills: [['NOT ONE', 236, 'white', 62, 4.3], ['PIECE FOUND', 316, 'red', 56, 4.8]], cam: (d) => orbit([0, 0, 0], 0.2, 1.1, 22, 17, 9, 6, d, [50, 46]),
  children: (f) => <><Sky f={f} /><Sea f={f} amp={0.9} /><Particles kind="spray" center={[0, 0.5, 0]} area={[30, 1, 24]} count={50} frame={f} opacity={0.5} /></>});
// 3 found. (0.84 s) empty sea flash
mk(3, {pal: DEEP, flash: [5.6], cam: (d) => push([0, 6, 18], [0, 4, 12], [[0, 0, 0], [0, 0.5, 0]], d, [58, 48], 0.4),
  children: (f) => <><Sky f={f} /><Sea f={f + 40} amp={1.0} /></>});
// 4 Varig Flight 967: photo of PP-VLU over the runway
mk(4, {cam: (d) => orbit([0, 1, 0], -0.8, 0.0, 16, 13, 3, 4, d, [50, 46]),
  children: (f) => <><Sky f={f} clouds={false} /><SnowField /><Runway frame={f} /><J707 position={[0, 0.8, 0]} rotation={[0, 1.2, 0]} scale={1.3} frame={f} burn={0} /></>,
  card: (f, d) => <PhotoCard src="varig/IMG1.jpg" credit="Varig Boeing 707 PP-VLU, March 1978 · Keith Sowter, CC BY-SA 2.0" tag="VARIG FLIGHT 967" delay={2} dur={d} rot={-2} />});
// 5 leaves Tokyo: take-off roll down the runway, lights streaking
mk(5, {pills: [['TOKYO', 236, 'yellow', 62, 8.3], ['NARITA', 316, 'white', 50, 8.8]], cam: (d) => push([6, 1.6, 10], [3.5, 3.2, -8], [[0, 1, -6], [0, 4, -18]], d, [60, 52], 0.5, 'inout'),
  children: (f) => { const t = f / 30; const z = 8 - t * t * 9 - t * 3; const y = 0.8 + Math.max(0, t - 1.0) * 1.8;
    return <><Sky f={f} clouds={false} /><SnowField /><Runway frame={f} /><J707 position={[0, y, z]} rotation={[-Math.min(0.3, Math.max(0, t - 1) * 0.2), Math.PI, 0]} scale={1.2} frame={f} /></>; }});
// 6 8:23 at night
mk(6, {cam: (d) => push([-8, 3, 12], [-4, 4.5, 6], [[0, 4, 0], [3, 5, -8]], d, [54, 46], 0.3),
  extra: () => <Clock time="20:23" tag="TAKE-OFF" />, children: (f) => <><Sky f={f} /><Sea f={f} /><J707 position={[2, 4.5 + f * 0.02, -f * 0.2]} rotation={[-0.12, 0, 0.1]} scale={1.1} frame={f} /></>});
// 7 January 1979
mk(7, {pills: [['JAN 30', 236, 'yellow', 62, 12.1], ['1979', 316, 'white', 70, 12.6]], cam: (d) => orbit([0, 4, -3], 1.0, 1.9, 14, 11, 3, 5, d, [52, 46]),
  children: (f) => <><Sky f={f} /><Sea f={f} /><J707 position={[0, 5, -3 - f * 0.1]} rotation={[0, 0, 0.1]} scale={1.1} frame={f} /></>});
// 8 8:45 radio desk
mk(8, {pal: ROOM, fog: [80, 220], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', pills: [['LAST CALL', 236, 'yellow', 58, 13.4]], flash: [13.3],
  cam: (d) => push([0.5, 2.8, 5.5], [0.1, 1.9, 2.4], [[0, 1.3, 0], [0, 1.3, 0]], d, [52, 40], 0.3), extra: () => <Clock time="20:45" tag="LAST CALL" />,
  children: (f) => <><RadioDesk frame={f} /><LightCone position={[0, 4.4, 0.4]} dir={[0, -1, 0]} length={3.6} radius={1.8} frame={f} color="#ffe8b0" opacity={0.3} /></>});
// 9 last radio call: cockpit at night
mk(9, {fog: [20, 100], cam: (d) => push([0, 1.6, -3.4], [0.2, 0.9, -1.8], [[0, 0.3, 3], [0, 0.3, 4]], d, [64, 52], 0.5),
  children: (f) => <><Cockpit frame={f} /><Puffs frame={f} speed={-1.6} z0={-4} z1={40} y={[-2, 5]} x={9} color="#2a3452" count={26} size={1.6} /><Stars opacity={0.5} count={100} /></>});
// 10 TWIST: But its captain had cheated death
mk(10, {fog: [20, 100], flash: [16.59], bloom: 1.5, cam: (d) => push([1.8, 0.7, -0.4], [0.5, 0.6, 0.3], [[0, 0.1, 0.9], [0, 0.1, 0.9]], d, [50, 38], 0.6),
  children: (f) => <><Cockpit frame={f} /><Puffs frame={f} speed={-1.6} z0={-4} z1={40} y={[-2, 5]} x={9} color="#2a3452" count={26} size={1.6} /></>});
// 11 1973 Paris: burning jet in a field
const Field = ({f}) => <><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}><planeGeometry args={[160, 160]} /><meshLambertMaterial color="#2a3a22" flatShading /></mesh>
  {Array.from({length: 18}, (_, i) => <Bx key={i} p={[-30 + i * 3.6, 0.6, -14 - (i % 3) * 3]} s={[1.6, 1.2 + (i % 4) * 0.4, 1.6]} c={i % 2 ? '#1a2a1a' : '#223020'} />)}</>;
const Burn = ({f, scale = 1.2, lite = false}) => <><J707 position={[0, 0.7, 0]} rotation={[0.04, 0.4, 0.06]} scale={scale} frame={f} burn={0} fire={1} />
  <Particles kind="embers" center={[0, 2.5, 0]} area={[5, 7, 5]} count={lite ? 36 : 90} frame={f} /><Particles kind="ash" center={[0, 4, 0]} area={[14, 8, 14]} count={lite ? 20 : 60} frame={f} opacity={0.6} />
  <pointLight position={[0, 2.2, 0]} color="#ff7a30" intensity={30} distance={22} /></>;
mk(11, {pal: FIRE, pills: [['PARIS', 236, 'yellow', 62, 18.95], ['1973', 316, 'white', 70, 19.2]], flash: [18.8], fog: [20, 90], cam: (d) => push([9, 2.6, 11], [6, 3.4, 7], [[0, 1.6, 0], [0, 1.8, 0]], d, [56, 46], 0.5),
  children: (f) => <><Field f={f} /><Burn f={f} /></>});
// 12 survived a burning Varig jet
mk(12, {pal: FIRE, pills: [['SURVIVED', 236, 'red', 62, 20.2], ['A BURNING JET', 316, 'yellow', 48, 20.7]], fog: [20, 90], cam: (d) => orbit([0, 1.5, 0], -0.4, 0.8, 11, 8, 2.2, 3.4, d, [54, 46]),
  children: (f) => <><Field f={f} /><Burn f={f + 20} /><Person position={[3.2, 0, 3.6]} rotation={-2.4} scale={0.65} pose="run" phase={f / 3} shirt="#2a3a6a" /></>});
// 13 near Paris: smoke over the field
mk(13, {pal: FIRE, pills: [['NEAR PARIS', 236, 'white', 56, 22.45]], fog: [20, 90], cam: (d) => push([-12, 6, 14], [-8, 7.5, 8], [[0, 1.5, 0], [0, 3, 0]], d, [54, 48], 0.3),
  children: (f) => <><Field f={f} /><Burn f={f + 40} scale={1.0} lite /><Puffs frame={f} speed={0.3} z0={-10} z1={10} y={[3, 9]} x={6} color="#3a2a26" count={6} size={2.4} /></>});
// 14 123 died
mk(14, {pal: {...FIRE, hor: '#4a2a22', sunI: 0.8}, fog: [20, 80], flash: [24.64], cam: (d) => push([0, 5, 14], [0, 4, 9], [[0, 1, 0], [0, 2, 0]], d, [54, 46], 0.2),
  extra: (f, d) => <Clock time={String(Math.min(123, Math.floor(clamp01((f - 4) / 18) * 123)))} tag="PEOPLE DIED" red y={560} />,
  children: (f) => <><Field f={f} /><Burn f={f + 70} scale={0.9} lite /></>});
// 15 the next call
mk(15, {pal: ROOM, fog: [80, 220], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', pills: [['NEXT CALL', 236, 'yellow', 58, 25.5]],
  cam: (d) => push([-2.5, 2.4, 5], [-0.4, 1.7, 2.6], [[0, 1.3, 0], [0, 1.3, 0]], d, [52, 40], 0.2), extra: () => <Clock time="21:23" tag="DUE" />,
  children: (f) => <><RadioDesk frame={f * 0.2} /><LightCone position={[0, 4.4, 0.4]} dir={[0, -1, 0]} length={3.6} radius={1.8} frame={f} color="#ffe8b0" opacity={0.3} /></>});
// 16 never comes: dead radio, flat bars
mk(16, {pal: ROOM, fog: [80, 220], bg: 'radial-gradient(ellipse at 50% 40%, #0a2a30 0%, #04121a 100%)', pills: [['NEVER', 236, 'red', 76, 27.5], ['COMES.', 316, 'white', 62, 27.9]], flash: [27.42],
  cam: (d) => push([0.3, 1.9, 3.2], [0.1, 1.5, 1.2], [[0, 1.3, 0], [0, 1.2, 0]], d, [48, 36], 0.3), extra: () => <Clock time="21:23" tag="NO CALL" red />,
  children: (f) => <><RadioDesk frame={0} /></>});
// 17 about 200 km from Tokyo: radar map scope
mk(17, {pal: ROOM, fog: [14, 60], pills: [['200 KM', 236, 'yellow', 80, 29.6], ['FROM TOKYO', 316, 'white', 50, 29.9]],
  cam: (d) => push([0.4, 6.0, 5.5], [0.4, 3.6, 1.6], [[0, 0, 0], [0.3, 0, -0.3]], d, [50, 42], 0.2),
  children: (f) => <><Scope frame={f} tt={21 + f / 30 * 0.5} mode="unknown" /></>});
// 18 jet, crew, and cargo: six crew beside the 707 at night
mk(18, {cam: (d) => orbit([0, 2, 0], 0.4, -0.6, 13, 10, 2.5, 3.5, d, [52, 46]),
  pills: [['6 CREW', 236, 'yellow', 66, 31.3]],
  children: (f) => <><Sky f={f} clouds={false} /><SnowField /><J707 position={[0, 0.8, 0]} rotation={[0, 1.2, 0]} scale={1.2} frame={f} burn={0} />
    {Array.from({length: 6}, (_, i) => <Person key={i} position={[-5 + i * 0.9, 0.3, 4.5]} rotation={0.4} scale={0.62} pose="stand" phase={f / 9 + i} shirt={i % 2 ? '#2a3a6a' : '#3a4a7a'} pants="#1a2030" />)}</>});
// 19 paintings: crates and frames in the hold
const Hold = ({f, n = 7}) => <group>
  <Bx p={[0, -0.05, 0]} s={[10, 0.1, 8]} c="#2a2e3a" /><Bx p={[0, 2.5, -4]} s={[10, 5, 0.2]} c="#3a4252" /><Bx p={[-5, 2.5, 0]} s={[0.2, 5, 8]} c="#323a4a" />
  {Array.from({length: n}, (_, i) => <Frame key={i} p={[-3.4 + (i % 4) * 2.2, 1.3 + Math.floor(i / 4) * 1.5, -3.6 + (i % 2) * 0.2]} s={1.15} c={i % 2 ? '#c8923a' : '#8a5a2a'} art={['#3a6a9a', '#7a3a5a', '#3a8a5a', '#9a6a2a'][i % 4]} />)}
  {Array.from({length: 4}, (_, i) => <Bx key={i} p={[-2 + i * 1.4, 0.45, 0.5 + (i % 2) * 0.5]} s={[1.1, 0.9, 1.0]} c="#8a6a3a" />)}
  <pointLight position={[0, 4, 1]} color="#ffe0a0" intensity={14} distance={14} /></group>;
mk(19, {pal: {...ROOM, hemiSky: '#ffd890', hor: '#6a4a20', mid: '#2a1c10', top: '#0e0804', hemiGround: '#3a2a10', sun: '#ffe0a0', rim: '#ffb060'}, fog: [20, 60], bg: 'radial-gradient(ellipse at 50% 55%, #4a3418 0%, #1a1008 100%)', pills: [['PAINTINGS', 236, 'yellow', 58, 32.6]],
  cam: (d) => push([3, 2.4, 6], [0.5, 2.0, 3.2], [[-1, 1.6, -3], [-1.5, 1.6, -3]], d, [54, 44], 0.2), children: (f) => <Hold f={f} />});
// 20 $1.24 million
mk(20, {pal: {...ROOM, hemiSky: '#ffd890', hor: '#6a4a20', mid: '#2a1c10', top: '#0e0804', hemiGround: '#3a2a10', sun: '#ffe0a0', rim: '#ffb060'}, fog: [20, 60], bg: 'radial-gradient(ellipse at 50% 55%, #4a3418 0%, #1a1008 100%)',
  pills: [['$1.24 MILLION', 236, 'yellow', 56, 34.9]], flash: [34.26], cam: (d) => orbit([0, 1.6, -1], 0.9, -0.3, 8, 6, 1.8, 2.4, d, [52, 44]), children: (f) => <Hold f={f} n={8} />});
// 21 gone.: the blip vanishes
mk(21, {pal: ROOM, fog: [14, 60], flash: [35.98], cam: (d) => push([0.4, 3.6, 1.6], [0.5, 6.0, 5.5], [[0.3, 0, -0.3], [0, 0, 0]], d, [42, 50], 0.4),
  pills: [['GONE.', 236, 'red', 88, 36.0]], children: (f, d) => { const t = f / 30; return <Scope frame={f} tt={t < 0.5 ? 24.4 + t : 99} mode="unknown" iffGone={0} />; }});
// 22 no wreckage: search lights over empty sea
mk(22, {pal: DEEP, flash: [36.68], fog: [30, 150], cam: (d) => push([-10, 7, 14], [-4, 9, 8], [[0, 0, 0], [2, 0, 0]], d, [54, 48], 0.3),
  children: (f) => <><Sky f={f} /><Sea f={f} />{[0, 1].map((i) => <group key={i}><J707 position={[-14 + f * 0.0 + i * 12, 8, -4 - i * 6]} rotation={[0, Math.PI / 2, 0]} scale={0.35} frame={f} />
    <LightCone position={[-14 + i * 12, 8, -4 - i * 6]} dir={[Math.sin(f * 0.05 + i * 2) * 0.5, -1, 0.1]} length={9} radius={1.8} frame={f} color="#fff2c0" opacity={0.35} /></group>)}</>});
// 23 not one painting: empty gallery wall, hooks bare
mk(23, {pal: {...ROOM, hemiSky: '#ffd890', hor: '#6a4a20', mid: '#2a1c10', top: '#0e0804', hemiGround: '#3a2a10'}, fog: [20, 60], bg: 'radial-gradient(ellipse at 50% 55%, #3a2a14 0%, #120a04 100%)', flash: [38.38], bloom: 1.5,
  cam: (d) => push([0, 2.2, 8], [0, 2.0, 4.4], [[0, 1.8, -3], [0, 1.8, -3]], d, [52, 40], 0.3),
  children: (f) => <><Bx p={[0, 2.5, -4]} s={[10, 5, 0.2]} c="#3a4252" />{[-3, -1, 1, 3].map((x) => <Bx key={x} p={[x, 2.3, -3.85]} s={[0.12, 0.12, 0.1]} c="#111" />)}<Frame p={[3, 1.6, -3.8]} s={1.15} c="#6a5a4a" art="#1a1a1a" art2="#1a1a1a" /><pointLight position={[0, 4, 1]} color="#ffe0a0" intensity={10} distance={14} /></>});
// 24 did something fail too fast: warning lights, jet shaking
mk(24, {pal: {...NIGHT, rim: '#ff4a3a', hor: '#5a2a50'}, fog: [30, 150], pills: [], flash: [39.2, 40.1], cam: (d) => push([4, 3, 7], [1.8, 3.6, 4.2], [[0, 4, 0], [0, 4, 0]], d, [58, 46], 1.0, 'out'),
  children: (f) => <><Sky f={f} /><Sea f={f} amp={0.9} /><J707 position={[0, 4, 0]} rotation={[0.02, 0.0, 0.3 + Math.sin(f * 0.9) * 0.04]} scale={1.15} frame={f} /><Burst kind="sparks" position={[0.2, 4, -1]} start={at(0.6)} frame={f} count={40} color="#ff8a4a" /></>});
// 25 Pacific swallows: a wave rises over the jet
mk(25, {pal: DEEP, pills: [['THE PACIFIC?', 236, 'white', 54, 41.6]], flash: [41.4], cam: (d) => push([-3, 4, 14], [-1, 5, 9], [[0, 3, 0], [0, 3, 0]], d, [56, 50], 0.5),
  children: (f, d) => { const w = easeOut(clamp01(f / (d - 4))); return <><Sky f={f} /><Sea f={f} amp={0.9 + w * 2.2} choppy={1.6} />
    <J707 position={[0, 3.6 - w * 2.8, -f * 0.1]} rotation={[0.1 + w * 0.6, 0, 0.3]} scale={1.0} frame={f} /><Particles kind="spray" center={[0, 1.5, 0]} area={[20, 4, 16]} count={80} frame={f} opacity={0.6} /></>; }});
// 26 END: frame-0 set, camera ends on frame 0's pose, sky around it empty (jet exits) -> loops to line 1
S[26] = () => { const f = useCurrentFrame(); const d = dur(26);
  return <Stage palette={NIGHT} fog={[40, 160]} overlay={<CFlash at={[at(0.3)]} k={0.4} len={6} />}>
    {push([3.4, 3.4, -7.4], [9, 3.8, -14], [[0, 4, -0.5], [0, 4, 0]], d, [50, 64], 0.2, 'inout')}
    <Sky f={f} /><Sea f={f} /><J707 position={[0, 4 + f * 0.05, f * 0.35]} rotation={[0.05, 0.0, 0.32]} scale={1.15 - f * 0.012} frame={f} /><Post bloom={1.3} threshold={0.4} vignette={0.4} /></Stage>; };

const Over = () => <>
  <Sequence from={0} durationInFrames={at(2.6)}><Pill text="6 CREW." y={236} variant="yellow" delay={-7} size={72} /><Pill text="0 WRECKAGE." y={316} variant="red" delay={-5} size={66} /></Sequence>
  <Sequence from={C[10]} durationInFrames={at(18.7) - C[10]}><Pill text="CAPTAIN:" y={236} variant="yellow" delay={0} size={66} /><Pill text="SURVIVED PARIS." y={316} variant="red" delay={3} size={60} /></Sequence>
  <Sequence from={C[22]} durationInFrames={at(39.1) - C[22]}><Pill text="NO WRECKAGE." y={236} variant="yellow" delay={0} size={62} /><Pill text="NO BODIES." y={316} variant="red" delay={4} size={62} /></Sequence>
  <Sequence from={C[24]} durationInFrames={at(46.2) - C[24]}><Pill text="TOO FAST?" y={236} variant="yellow" delay={0} size={66} /><Pill text="OR THE SEA?" y={316} variant="red" delay={5} size={62} /></Sequence></>;

export const VG = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? VG_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#04060c" />}</Sequence>; })}
    <Over />
    <Grade look="cold" strength={0.15} /><Finish vignette={0.3} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
