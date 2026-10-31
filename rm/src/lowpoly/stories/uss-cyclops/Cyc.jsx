// "USS Cyclops" (1918) - low-poly 3D Short, ANIMATION UPGRADE kit + GitGems Rigged characters. 21 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, Shockwave, FogLayer, Rigged, Glow, Stars, LightCone,
  Ocean, Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Ship, Pier, EngineRoom, MapTable, Periscope, Lantern, DeckFloor, Bx, Cy} from './world.jsx';
import {FolderTable, Desk} from '../ghost-rockets/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const CYC_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.7, 5.1, 6.9, 9.2, 11.6, 14.4, 17.5, 19.8, 21.2, 24.8, 28.7, 31.4, 33.3, 37.0, 39.2, 41.5, 45.2, 47.7, 49.9, 53.9];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? CYC_FRAMES) - C[i];
const sec = (i, f) => CS[i] + f / FPS;
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

// grey-green Atlantic night, dawn overcast, warm harbour dusk, lantern interior, storm, engine room
const NIGHT = {top: '#050c1e', mid: '#12303c', hor: '#5a8c94', fog: '#12303a', amb: 1.0, hemiSky: '#8ac8d0', hemiGround: '#14242a', hemiI: 1.7, sun: '#b8dcff', sunI: 1.6, sunPos: [-20, 30, 10], rim: '#ff9a50', rimI: 1.1, rimPos: [10, 8, -30], glow: 1};
const OVERCAST = {top: '#5a6a78', mid: '#8a9aa2', hor: '#d8d0c0', fog: '#8a9aa0', amb: 1.1, hemiSky: '#e0e8ea', hemiGround: '#3a4448', hemiI: 1.7, sun: '#fff0d8', sunI: 1.8, sunPos: [30, 18, -30], rim: '#ffb080', rimI: 0.9, rimPos: [-30, 10, 20], glow: 0.6};
const HARBOUR = {top: '#2a2858', mid: '#a0506a', hor: '#ffa862', fog: '#a06a68', amb: 1.0, hemiSky: '#ffc898', hemiGround: '#4a3a38', hemiI: 1.6, sun: '#ffb070', sunI: 2.2, sunPos: [-40, 12, -30], rim: '#ff7a9a', rimI: 1.0, rimPos: [40, 20, 30], glow: 0.9};
const ROOM = {top: '#120e0c', mid: '#241a14', hor: '#3a2a20', fog: '#1c1612', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 1.8, sun: '#ffe0b0', sunI: 1.7, sunPos: [10, 20, 20], rim: '#6aa0ff', rimI: 0.8, rimPos: [-20, 8, -20], glow: 1};
const STORM = {top: '#0a1218', mid: '#223640', hor: '#486068', fog: '#1c2c34', amb: 1.0, hemiSky: '#9ab8c4', hemiGround: '#14202a', hemiI: 1.6, sun: '#c8e0f0', sunI: 1.5, sunPos: [-10, 30, 10], rim: '#8ab0ff', rimI: 1.0, rimPos: [20, 10, -30], glow: 0.8};
const ENGINE = {top: '#14100c', mid: '#2a1e16', hor: '#3a2a20', fog: '#20160e', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a22', hemiI: 1.9, sun: '#ffd8a0', sunI: 1.8, sunPos: [0, 20, 15], rim: '#ff6a40', rimI: 1.0, rimPos: [-20, 8, -10], glow: 1};

const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 150, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const Sea = ({f, amp = 0.35, choppy = 1, deep = '#061a24', face = '#1c4a5a', foam = '#9ab8c0', pos = [0, 0, -30], size = [220, 170]}) => <Ocean position={pos} size={size} seg={44} frame={f} amp={amp} choppy={choppy} deep={deep} face={face} foam={foam} foamAt={0.7} />;
const NightSea = ({f, amp = 0.35}) => <><Stars count={260} radius={170} /><Sea f={f} amp={amp} /><FogLayer y={0.4} size={140} layers={3} thickness={1.2} color="#7aa4ac" opacity={0.1} frame={f} center={[0, -30]} /></>;

const S = [];
// 0 HOOK: collier on a black sea, lamps go out one by one, camera pushes in
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const lit = Math.max(0, Math.round(15 - f * 0.22));
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<><CFlash at={[at(0.1)]} k={0.45} color="#ffd8a0" />{kc(0, 'No distress call.', 0, 'distress', 330, 96, 1.3)}{kc(0, 'No wreckage.', 1.4, 'wreckage', 330, 96, 2.65)}<Pill text="306 PEOPLE" y={236} variant="red" delay={2} size={64} /><Pill text="VANISHED" y={150} variant="dark" delay={6} size={40} /></>}>
    <ShotCam preset="push" from={[-3, 3.2, 14]} to={[-1.5, 3.6, 8]} look={[[-1, 4.2, -13], [-1, 4.4, -13]]} fov0={56} fov1={48} start={0} end={d} ease="inout" shake={0.3} shakeFrom={3} shakeLen={14} />
    <NightSea f={f} /><Ship position={[0, 0, -13]} rotation={[0, -0.5, 0]} frame={f} lit={lit} />
    <Particles kind="motes" center={[0, 3, -6]} area={[30, 8, 16]} count={34} frame={f} color="#ffd890" opacity={0.4} /><Post bloom={1.5} threshold={0.4} vignette={0.32} /></Stage>; };
// 1 306 crew on deck, counter
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const t = f / FPS; const n = Math.round(306 * clamp01((t - 0.12) / 0.9));
  return <Stage palette={NIGHT} fog={[30, 160]} overlay={<><div style={{position: 'absolute', top: 1000, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 190, color: '#ffd93b', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill'}}>{n}</div><CFlash at={[1]} k={0.4} color="#ffffff" len={7} /><Pill text="ALL ABOARD" y={236} variant="yellow" delay={10} size={50} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, 0]} a0={0.4} a1={-0.4} r0={8} r1={6} h0={1.0} h1={1.6} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Stars count={200} radius={120} /><DeckFloor w={18} d={7} /><Bx p={[0, 0.7, -3]} s={[18, 0.3, 0.2]} c="#3a3a3a" /><Ship position={[0, -4, -16]} scale={1.8} frame={f} lit={20} />
    {[-5, -3, -1, 1, 3, 5].map((x, i) => <Man key={i} p={[x * 0.7, 0, 0.2 + (i % 2) * 0.5]} clip="idle" rot={0.1 * (i - 2)} t={t + i * 0.3} i={i} s={0.55} />)}
    <Glow position={[0, 3.5, 2]} size={10} color="#ffd890" opacity={0.18} /><Post bloom={1.3} threshold={0.45} vignette={0.4} /></Stage>; };
// 2 one US Navy ship: cruises toward camera
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return <Stage palette={OVERCAST} fog={[40, 200]} overlay={<><Pill text="US NAVY" y={236} variant="yellow" delay={loc(5.5, 2)} size={54} /><Pill text="ONE SHIP" y={316} variant="dark" delay={loc(5.9, 2)} size={44} /></>}>
    <ShotCam preset="push" from={[6, 1.6, 8]} to={[3, 2.4, 3]} look={[[0, 2.2, -14], [0, 2.4, -10]]} fov0={56} fov1={46} start={0} end={d} ease="inout" />
    <Sea f={f} amp={0.45} deep="#1c3a44" face="#46707a" foam="#d8e8ea" /><Ship position={[0, 0, -20 + f * 0.12]} rotation={[0, -1.15, 0]} frame={f} lit={0} sink={0.2} />
    <FogLayer y={0.3} size={140} layers={3} thickness={1.0} color="#d0d8d8" opacity={0.16} frame={f} center={[0, -20]} /><Post bloom={0.9} threshold={0.55} vignette={0.35} /></Stage>; };
// 3 March 1918, Barbados harbour dusk, crane up
S[3] = () => { const f = useCurrentFrame(); const d = dur(3);
  return <Stage palette={HARBOUR} fog={[40, 200]} overlay={<>{kc(3, 'March 1918.', 6.9, '1918', 320, 108, 9.1)}<Pill text="BARBADOS" y={236} variant="yellow" delay={loc(7.5, 3)} size={50} /></>}>
    <ShotCam preset="crane" target={[0, 2, 0]} h0={2} h1={13} r0={28} r1={34} angle={0.25} lookY0={2} lookY1={2} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Stars count={100} radius={150} /><Sea f={f} amp={0.12} pos={[0, 0, 10]} size={[180, 70]} deep="#1c2a50" face="#a05a70" foam="#ffc8a0" /><Pier frame={f} ore={0.5} />
    <Ship position={[0, 0, 4.5]} frame={f} lit={20} sink={0.1} /><Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 4 leaves Barbados + IMG1 plans card
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const p1 = loc(9.9, 4); const x = -2 + f * 0.1;
  return <Stage palette={HARBOUR} fog={[40, 200]} overlay={<><Pill text="THE COLLIER CYCLOPS" y={316} variant="dark" delay={loc(9.7, 4)} size={44} /><Pill text="LEAVES BARBADOS" y={236} variant="yellow" delay={loc(10.3, 4)} size={46} /></>}>
    <ShotCam preset="track" target={(ff) => [-2 + ff * 0.1, 2, 4.5]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[-6, 3.5, 17]} fov0={50} start={0} end={d} drift={0.04} />
    <Stars count={100} radius={150} /><Sea f={f} amp={0.18} pos={[0, 0, 10]} size={[180, 70]} deep="#1c2a50" face="#a05a70" foam="#ffc8a0" /><Pier frame={f} ore={0.5} />
    <Ship position={[x, 0, 4.5]} frame={f} lit={20} sink={0.3} ore={0.7} /><Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 5 loading manganese ore: she sinks lower
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const u = clamp01(f / d);
  return <Stage palette={HARBOUR} fog={[40, 200]} overlay={<><Pill text="FOR BALTIMORE" y={236} variant="dark" delay={2} size={46} /><Pill text="MANGANESE ORE" y={316} variant="yellow" delay={loc(12.9, 5)} size={50} /></>}>
    <ShotCam preset="orbit" target={[0, 2, 3]} a0={0.7} a1={-0.1} r0={17} r1={13} h0={5} h1={4} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Stars count={100} radius={150} /><Sea f={f} amp={0.1} pos={[0, 0, 10]} size={[180, 70]} deep="#1c2a50" face="#a05a70" foam="#ffc8a0" /><Pier frame={f} ore={1 - u * 0.6} />
    <Ship position={[0, 0, 4.5]} frame={f} lit={20} sink={0.1 + u * 0.8} ore={0.3 + u * 1.0} />
    <Particles kind="dust" center={[4, 3.5, 4.5]} area={[2.5, 5, 2]} count={46} frame={f} color="#2c2630" opacity={0.9} /><Post bloom={1.2} threshold={0.5} vignette={0.4} /></Stage>; };
// 6 overloaded (waterline), then the dead engine
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const t = sec(6, f); const sw = loc(15.8, 6);
  if (f < sw) return <Stage palette={OVERCAST} fog={[30, 160]} overlay={<><Pill text="OVERLOADED" y={236} variant="red" delay={loc(14.7, 6)} size={58} /><CFlash at={[loc(14.7, 6)]} k={0.35} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[2, 0.9, 11]} to={[2.5, 0.5, 6]} look={[[2.5, -0.4, -4], [3, -0.4, -4]]} fov0={52} fov1={40} start={0} end={sw} ease="inout" />
    <Sea f={f} amp={0.22} deep="#1c3a44" face="#46707a" foam="#d8e8ea" /><Ship position={[0, 0, -4]} frame={f} lit={0} sink={1} ore={1.2} />
    <Bx p={[3, -0.4, -2.35]} s={[2.2, 0.16, 0.06]} c="#e03020" basic /><Glow position={[3, -0.4, -2.2]} size={3.4} color="#ff4030" opacity={0.7} />
    <Post bloom={1.0} threshold={0.55} vignette={0.38} /></Stage>;
  return <Stage palette={ENGINE} fog={[30, 120]} overlay={<><Pill text="ONE ENGINE" y={236} variant="yellow" delay={loc(15.8, 6)} size={52} /><Pill text="BROKEN" y={316} variant="red" delay={loc(16.3, 6)} size={58} /></>}>
    <ShotCam preset="push" from={[-2, 6, 30]} to={[3, 4.6, 21]} look={[[0, 2.8, -1], [3.6, 3.0, -1]]} fov0={50} fov1={44} start={sw} end={d} ease="inout" />
    <EngineRoom frame={f} dead={1} /><Burst kind="sparks" position={[4.2, 3, 0.6]} start={loc(16.3, 6)} frame={f} count={70} speed={0.3} up={0.6} spread={1.4} gravity={0.014} life={40} color="#ffb050" />
    <Particles kind="dust" center={[0, 3, 0]} area={[14, 6, 6]} count={36} frame={f} opacity={0.35} /><Post bloom={1.5} threshold={0.4} vignette={0.45} /></Stage>; };
// 7 captain hated: crew turn their backs
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const t = f / FPS;
  return <Stage palette={ROOM} fog={[20, 100]} overlay={<><Pill text="HER CAPTAIN" y={236} variant="dark" delay={loc(17.6, 7)} size={48} /><Pill text="HATED BY HIS CREW" y={316} variant="red" delay={loc(18.1, 7)} size={46} /></>}>
    <ShotCam preset="push" from={[0, 1.5, 9]} to={[0.3, 1.7, 4.4]} look={[[0, 1.4, -2.5], [0, 1.6, -2.5]]} fov0={50} fov1={36} start={0} end={d} ease="inout" />
    <DeckFloor w={16} d={14} /><Bx p={[0, 3, -6]} s={[16, 6, 0.3]} c="#3a3430" />
    <Man p={[0, 0, -2.5]} clip="idle" rot={0} t={t} i={0} s={0.95} />
    {[-3.2, -1.7, 1.7, 3.2].map((x, i) => <Man key={i} p={[x, 0, 0.8 + (i % 2) * 0.4]} clip="idle" rot={Math.PI + (x > 0 ? 0.4 : -0.4)} t={t + i * 0.4} i={i + 1} s={0.58} />)}
    <Lantern position={[-2.5, 2.8, -2]} frame={f} /><Lantern position={[2.5, 2.8, -2]} frame={f + 9} color="#ff7a40" /><Post bloom={1.4} threshold={0.45} vignette={0.5} /></Stage>; };
// 8 she never arrives: map, marker vanishes
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const prog = 0.15 + 0.5 * clamp01(f / 26); const lost = f >= 24;
  return <Stage palette={ROOM} fog={[20, 100]} overlay={<>{kc(8, 'She never arrives.', 19.8, 'never', 300, 92, 21.2)}<CFlash at={[at(19.9) - C[8], 24]} k={0.45} color="#ff6050" len={7} /><Stamp f={f} at={24} text="NEVER ARRIVED" y={1000} size={104} rot={-7} /></>}>
    <ShotCam preset="push" from={[0, 11, 7]} to={[0.5, 7.5, 3.5]} look={[[0, 0, 0], [0.3, 0, -0.4]]} fov0={52} fov1={44} start={0} end={d} ease="inout" shake={0.5} shakeFrom={24} shakeLen={12} />
    <MapTable frame={f} prog={prog} lost={lost} /><Particles kind="dust" center={[0, 3, 0]} area={[12, 6, 8]} count={30} frame={f} opacity={0.3} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 9 empty ocean: no lifeboat, no board, no body
S[9] = () => { const f = useCurrentFrame(); const d = dur(9);
  return <Stage palette={OVERCAST} fog={[40, 240]} overlay={<><Pill text="NO LIFEBOAT" y={236} variant="red" delay={loc(21.3, 9)} size={50} /><Pill text="NO BOARD" y={316} variant="red" delay={loc(22.3, 9)} size={50} />
    <Pill text="NO BODY" y={396} variant="red" delay={loc(23.0, 9)} size={50} /><Pill text="FOUND: ZERO" y={476} variant="dark" delay={loc(23.9, 9)} size={46} /></>}>
    <ShotCam preset="crane" target={[0, 0, -30]} h0={1.5} h1={20} r0={30} r1={60} angle={0.15} lookY0={1} lookY1={0} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Sea f={f} amp={0.4} deep="#1c3a44" face="#46707a" foam="#d8e8ea" /><FogLayer y={0.3} size={160} layers={3} thickness={1.2} color="#d8dcdc" opacity={0.2} frame={f} center={[0, -30]} />
    <Glow position={[0, 3, -90]} size={50} color="#fff0d0" opacity={0.35} /><Post bloom={1.0} threshold={0.55} vignette={0.4} /></Stage>; };
// 10 U-boat periscope: Navy blames Germany, Germany denies
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={HARBOUR} fog={[30, 180]} overlay={<><Pill text="NAVY BLAMES U-BOATS" y={236} variant="yellow" delay={loc(25.2, 10)} size={44} /><Pill text="GERMANY DENIES" y={316} variant="red" delay={loc(26.9, 10)} size={46} /><Stamp f={f} at={loc(27.3, 10)} text="DENIED" y={1000} size={130} rot={-6} /></>}>
    <ShotCam preset="track" target={(ff) => [-6 + ff * 0.07, 0.8, -10]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[2.5, 1.3, 5.5]} fov0={46} start={0} end={d} drift={0.05} />
    <Stars count={100} radius={150} /><Sea f={f} amp={0.4} deep="#1c2a50" face="#8a4a64" foam="#ffc8a0" /><Periscope position={[-6 + f * 0.07, 0, -10]} rotation={0.1} frame={f} />
    <Ship position={[14, 0, -34]} rotation={[0, -0.4, 0]} frame={f} lit={0} scale={1.2} /><Post bloom={1.2} threshold={0.45} vignette={0.38} /></Stage>; };
// 11 German records show nothing
S[11] = () => { const f = useCurrentFrame(); const d = dur(11);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="GERMAN RECORDS" y={236} variant="yellow" delay={loc(29.4, 11)} size={46} /><Stamp f={f} at={loc(30.4, 11)} text="NOTHING" y={1050} size={130} rot={-7} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.0} a1={0.8} r0={12} r1={8.5} h0={5.5} h1={4.5} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <FolderTable frame={f} /><Particles kind="dust" center={[0, 3, 0]} area={[14, 6, 8]} count={40} frame={f} opacity={0.4} /><Glow position={[0, 4, 0]} size={14} color="#ffe0a8" opacity={0.2} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 12 mutiny rumours: crew whispering around a lantern
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const t = f / FPS;
  return <Stage palette={ROOM} fog={[20, 90]} overlay={<><Pill text="RUMORS" y={236} variant="dark" delay={loc(31.5, 12)} size={48} /><Pill text="MUTINY?" y={316} variant="red" delay={loc(32.3, 12)} size={62} /><CFlash at={[loc(32.3, 12)]} k={0.3} color="#ff7040" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, 0]} a0={0.3} a1={-0.7} r0={7} r1={5} h0={1.8} h1={2.4} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <DeckFloor w={14} d={14} /><Bx p={[0, 3, -7]} s={[14, 6, 0.3]} c="#2a2420" /><Cy p={[0, 0.5, 0]} a={[0.5, 0.5, 1.0, 8]} c="#6a4a2c" /><Lantern position={[0, 1.3, 0]} frame={f} />
    {[0, 1, 2, 3, 4].map((i) => { const a = i / 5 * Math.PI * 2 + 0.4; return <Man key={i} p={[Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5]} clip={i === 1 ? 'interact-right' : 'idle'} rot={Math.atan2(-Math.cos(a), -Math.sin(a))} t={t + i * 0.3} i={i} s={0.62} />; })}
    <Particles kind="embers" center={[0, 1.4, 0]} area={[2, 3, 2]} count={24} frame={f} opacity={0.7} /><Post bloom={1.5} threshold={0.4} vignette={0.5} /></Stage>; };
// 13 Navy investigates: no evidence
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const t = f / FPS;
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="NAVY INVESTIGATES" y={236} variant="yellow" delay={loc(33.6, 13)} size={46} /><Stamp f={f} at={loc(35.8, 13)} text="NO EVIDENCE" y={1050} size={112} rot={-7} /><CFlash at={[loc(35.8, 13)]} k={0.35} color="#ffffff" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.0} a1={0.6} r0={12} r1={9.5} h0={5.5} h1={4} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <FolderTable frame={f} />{[-4.5, 0, 4.5].map((x, i) => <Man key={i} p={[x, -1.2, -3.4]} clip={i === 1 ? 'interact-right' : 'idle'} rot={0} t={t + i * 0.3} i={i} s={1.1} />)}
    <Glow position={[0, 4, 0]} size={14} color="#ffe0a8" opacity={0.2} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 14 not the strangest part: dark storm horizon, far ship flickers
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const lit = f % 24 < 18 ? 14 : 3;
  return <Stage palette={STORM} fog={[30, 200]} overlay={<>{kc(14, 'not the strangest part.', 37.3, '', 320, 70, 38.9)}<CFlash at={[loc(37.7, 14)]} k={0.6} color="#d8e8ff" len={9} /></>}>
    <ShotCam preset="push" from={[0, 1.6, 14]} to={[0, 2.0, 6]} look={[[0, 2.4, -30], [0, 2.8, -30]]} fov0={58} fov1={44} start={0} end={d} ease="inout" shake={0.4} shakeFrom={loc(37.7, 14)} shakeLen={16} />
    <NightSea f={f} amp={0.7} /><Ship position={[6, 0, -34]} rotation={[0, -0.7, 0]} frame={f} lit={lit} scale={1.3} /><Post bloom={1.5} threshold={0.4} vignette={0.4} /></Stage>; };
// 15 1941: wartime night, searchlight sweeps a convoy
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const sw = Math.sin(f * 0.05) * 0.8;
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<>{kc(15, 'In 1941,', 39.2, '1941', 310, 150, 41.4)}<Pill text="WORLD WAR II" y={236} variant="dark" delay={loc(39.8, 15)} size={42} /></>}>
    <ShotCam preset="crane" target={[0, 2, -30]} h0={2} h1={11} r0={26} r1={34} angle={0.1} lookY0={3} lookY1={2} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <NightSea f={f} amp={0.45} />{[[-22, -30, 0.5], [0, -40, 0.4], [22, -34, 0.6]].map(([x, z, r], i) => <Ship key={i} position={[x, 0, z]} rotation={[0, r, 0]} frame={f + i * 11} lit={3} scale={0.9} />)}
    <LightCone position={[-14, 4, -8]} dir={[0.7 + sw, -0.05, -1]} length={40} radius={5} color="#e8f4ff" opacity={0.22} frame={f} /><Post bloom={1.4} threshold={0.4} vignette={0.38} /></Stage>; };
// 16 REVEAL: Proteus and Nereus in fog, then both vanish
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const t = sec(16, f); const gone = t >= 43.5; const sunk = Math.max(0, (t - 43.5) * 7);
  return <Stage palette={NIGHT} fog={[25, 150]} overlay={<><Pill text="HER SISTER SHIPS" y={236} variant="yellow" delay={loc(41.2, 16)} size={44} /><Pill text="PROTEUS" y={316} variant="red" delay={loc(42.3, 16)} size={54} /><Pill text="NEREUS" y={396} variant="red" delay={loc(43.0, 16)} size={54} />
    <CFlash at={[loc(42.3, 16)]} k={0.7} color="#ffffff" len={10} /><Stamp f={f} at={loc(43.55, 16)} text="VANISHED" y={1000} size={124} rot={-6} /></>}>
    <ShotCam preset="push" from={[0, 2.2, 15]} to={[0, 3.0, 7]} look={[[0, 2.6, -20], [0, 2.8, -20]]} fov0={56} fov1={46} start={0} end={d} ease="inout" shake={0.7} shakeFrom={loc(42.3, 16)} shakeLen={16} />
    <NightSea f={f} amp={0.4} />{!gone || sunk < 3 ? <><Ship position={[-9, -sunk, -17]} rotation={[0, -0.25, 0]} frame={f} lit={12} sink={sunk > 0 ? 1 : 0} /><Ship position={[10, -sunk, -26]} rotation={[0, 0.3, 0]} frame={f + 17} lit={12} hull="#6a4030" sink={sunk > 0 ? 1 : 0} /></> : null}
    <FogLayer y={0.6} size={120} layers={4} thickness={1.4} color="#9ab8c0" opacity={gone ? 0.2 : 0.16} frame={f} center={[0, -20]} /><Post bloom={1.6} threshold={0.38} vignette={0.38} /></Stage>; };
// 17 same design: three identical hulls in a row
S[17] = () => { const f = useCurrentFrame(); const d = dur(17);
  return <Stage palette={OVERCAST} fog={[40, 220]} overlay={<><Pill text="SAME DESIGN" y={236} variant="yellow" delay={loc(45.3, 17)} size={56} /><Pill text="3 IDENTICAL SHIPS" y={316} variant="dark" delay={loc(46.3, 17)} size={40} /></>}>
    <ShotCam preset="push" from={[-8, 10, 12]} to={[-3, 6, 4]} look={[[0, 0, -16], [0, 0, -16]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Sea f={f} amp={0.18} deep="#1c3a44" face="#46707a" foam="#d8e8ea" />{[-6, -17, -28].map((z, i) => <Ship key={i} position={[0, 0, z]} frame={f + i * 13} lit={0} smoke={i === 0} />)}
    <FogLayer y={0.3} size={140} layers={3} thickness={1.0} color="#d0d8d8" opacity={0.14} frame={f} center={[0, -20]} /><Post bloom={0.9} threshold={0.55} vignette={0.35} /></Stage>; };
// 18 heavy ore, both lost without a trace (ship slips under)
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const t = sec(18, f); const go = Math.max(0, t - 48.9); const dropY = go * go * 14;
  return <Stage palette={OVERCAST} fog={[30, 160]} overlay={<><Pill text="HEAVY ORE" y={236} variant="dark" delay={loc(47.7, 18)} size={52} /><Pill text="NO TRACE" y={316} variant="red" delay={loc(48.9, 18)} size={60} /><CFlash at={[loc(48.9, 18)]} k={0.5} color="#ffffff" len={8} /></>}>
    <ShotCam preset="orbit" target={[0, 1, -6]} a0={0.2} a1={-0.7} r0={20} r1={15} h0={4} h1={5} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.5} shakeFrom={loc(48.9, 18)} shakeLen={14} />
    <Sea f={f} amp={0.3} deep="#1c3a44" face="#46707a" foam="#d8e8ea" /><Ship position={[0, -dropY, -6]} frame={f} lit={0} sink={0.9} ore={1.5} roll={go * 0.5} smoke={go === 0} />
    {go > 0 && <Burst kind="splash" position={[0, 0.2, -6]} start={loc(48.95, 18)} frame={f} count={90} speed={0.35} up={1.0} spread={1.3} gravity={0.02} life={40} color="#dff2ff" floorY={0} />}
    <Post bloom={1.0} threshold={0.55} vignette={0.38} /></Stage>; };
// 19 storm: she rolls and her hull breaks
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const t = sec(19, f); const snap = clamp01((t - 52.9) / 0.9) * 0.4; const roll = Math.sin(f * 0.13) * (0.05 + clamp01((t - 49.9) / 3) * 0.12);
  return <Stage palette={STORM} fog={[25, 170]} overlay={<><Pill text="THE NAVY'S GUESS" y={236} variant="dark" delay={loc(50.0, 19)} size={42} /><Pill text="A STORM" y={316} variant="yellow" delay={loc(51.5, 19)} size={56} /><Pill text="BUILT TO BREAK" y={396} variant="red" delay={loc(52.9, 19)} size={50} />
    <CFlash at={[loc(51.4, 19), loc(52.5, 19), loc(53.0, 19)]} k={0.65} color="#d8e8ff" len={8} /></>}>
    <ShotCam preset="orbit" target={[0, 1.5, -8]} a0={0.4} a1={-0.5} r0={19} r1={14} h0={3} h1={5} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.8} shakeFrom={0} shakeLen={d} />
    <Stars count={80} radius={170} /><Sea f={f} amp={1.3} choppy={1.6} deep="#081820" face="#2f5f73" foam="#e8f4f8" /><Ship position={[0, 0, -8]} rotation={[0, 0.15, 0]} frame={f} lit={t < 52.9 ? 8 : 0} sink={0.7} ore={1.0} roll={roll} snap={snap} smoke={false} />
    <Particles kind="spray" center={[0, 5, -6]} area={[40, 10, 22]} count={90} frame={f} color="#cfe4ee" opacity={0.5} /><Post bloom={1.4} threshold={0.4} vignette={0.4} /></Stage>; };
// 20 loop: back to the opening ship + end card
S[20] = () => { const f = useCurrentFrame(); const d = dur(20);
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>{kc(20, 'But nobody knows.', 53.9, 'nobody', 310, 96, 55.6)}<Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(55.0, 20)} size={46} /><EndCard delay={loc(55.0, 20)} sources={['WIKIPEDIA: USS CYCLOPS', 'NHHC H-GRAM 016-4', 'US NATIONAL ARCHIVES']} /></>}>
    <ShotCam preset="push" from={[-3, 3.2, 14]} to={[-2.95, 3.2, 13.95]} look={[[-1, 4.2, -13], [-1, 4.2, -13]]} fov0={56} fov1={56} start={0} end={d} ease="inout" />
    <NightSea f={f} /><Ship position={[0, 0, -13]} rotation={[0, -0.5, 0]} frame={f} lit={15} /><Post bloom={1.5} threshold={0.4} vignette={0.32} /></Stage>; };

export const Cyc = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? CYC_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
