// "The Red-Eyed Mothman" (Point Pleasant WV, Nov 1966 / Silver Bridge Dec 1967) - low-poly 3D Short, kit + Rigged people. 25 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, Shockwave, FogLayer, Rigged, Glow, Stars, LightCone,
  Ocean, Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Land, Pines, height, Car, NightRoad, Mothman, TntPlant, Paper, Calendar, SilverBridge, Eyebar, Ruler, Crane, Owl, RiverDebris} from './world.jsx';
import {Beam} from '../flatwoods-monster/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const MM_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0.0, 2.6, 5.2, 7.2, 10.6, 12.8, 14.9, 16.6, 18.0, 20.0, 22.8, 24.8, 27.0, 29.2, 31.2, 33.1, 35.6, 37.9, 40.0, 41.9, 44.2, 46.2, 48.0, 50.7, 52.8];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? MM_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

const NIGHT = {top: '#05081a', mid: '#101c3a', hor: '#2e4468', fog: '#0c1624', amb: 1.0, hemiSky: '#9ab4e8', hemiGround: '#242a30', hemiI: 2.0, sun: '#b0c4ff', sunI: 1.5, sunPos: [-20, 30, 10], rim: '#ff7a40', rimI: 1.0, rimPos: [0, 8, -30], glow: 1};
const AMBER = {...NIGHT, mid: '#241c2c', hor: '#8a5a3a', fog: '#1c1620', hemiSky: '#e8b890', rim: '#ffa050', rimI: 1.5};
const REDN = {...NIGHT, top: '#12040a', mid: '#2a0c14', hor: '#6a1c1c', fog: '#1c0a10', hemiSky: '#ffa098', rim: '#ff2a20', rimI: 1.7};
const OFFICE = {top: '#14100c', mid: '#2a2018', hor: '#4a3626', fog: '#1c1612', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 2.1, sun: '#ffe0b0', sunI: 1.7, sunPos: [10, 20, 20], rim: '#6aa0ff', rimI: 0.8, rimPos: [-20, 8, -20], glow: 1};
const DUSK = {top: '#2a2038', mid: '#7a4a52', hor: '#ffa060', fog: '#4a3440', amb: 1.0, hemiSky: '#ffc8a0', hemiGround: '#3a3238', hemiI: 2.0, sun: '#ffb070', sunI: 1.8, sunPos: [-30, 8, -20], rim: '#ff8a50', rimI: 1.2, rimPos: [20, 10, 10], glow: 1};
const STROBE = {...NIGHT, mid: '#1a2048', hor: '#5a4a8a', fog: '#141a38', hemiSky: '#aab0ff', rim: '#ff2a2a', rimI: 1.6};
const DAWN = {top: '#3a4a6a', mid: '#8a7a8a', hor: '#ffc890', fog: '#7a6a70', amb: 1.0, hemiSky: '#ffe0c0', hemiGround: '#3a3a34', hemiI: 2.0, sun: '#ffd0a0', sunI: 1.8, sunPos: [-30, 10, -30], rim: '#ffa070', rimI: 1.0, rimPos: [20, 10, 10], glow: 0.8};

const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const Chase = ({x, f, z = 1.4, scale = 1, color = '#8a2a2a'}) => <group><Car position={[x, 0.1, z]} rotation={0} scale={scale} color={color} />
  <Beam position={[x + 2.2 * scale, 0.9, z]} dir={[1, -0.08, 0]} length={24} radius={2.6} opacity={0.16} /><Glow position={[x - 2.2 * scale, 0.9, z]} size={2.2} color="#ff2a20" opacity={0.8} /></group>;
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 130, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const Speedo = ({v = 0, glow = 1}) => <group>
  <Cy p={[0, 0, 0]} a={[3.2, 3.2, 0.4, 28]} c="#17181c" r={[Math.PI / 2, 0, 0]} /><Cy p={[0, 0, 0.22]} a={[2.8, 2.8, 0.06, 28]} c="#0a0b0e" r={[Math.PI / 2, 0, 0]} />
  {Array.from({length: 21}, (_, i) => { const a = -2.3 + i * (4.6 / 20); const R = 2.4; return <Bx key={i} p={[Math.sin(a) * R, Math.cos(a) * R, 0.27]} s={[0.07, i % 5 === 0 ? 0.5 : 0.28, 0.04]} c={i > 15 ? '#ff4a30' : '#e8e8e8'} r={[0, 0, -a]} basic />; })}
  <group position={[0, 0, 0.32]} rotation={[0, 0, -(-2.3 + v * 4.6)]}><Bx p={[0, 1.0, 0]} s={[0.12, 2.2, 0.06]} c="#ff3a20" e="#ff3a20" ei={2} basic /></group>
  <Cy p={[0, 0, 0.36]} a={[0.3, 0.3, 0.1, 10]} c="#aaa" r={[Math.PI / 2, 0, 0]} /><Glow position={[0, 0, 0.8]} size={8} color="#ff5a30" opacity={0.2 * glow} />
</group>;
const Dir = ({p, c = '#3a6a3a', s}) => <Bx p={p} s={s} c={c} />;

const S = [];
// 0 HOOK: huge winged silhouette with red eyes over a speeding car
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const x = -9 + f * 0.2;
  return <Stage palette={AMBER} fog={[30, 160]} overlay={<><CFlash at={[0, at(0.5)]} k={0.45} color="#ff3a20" len={6} /><KineticCard lines={[[{w: '7-FOOT', start: 0.05}, {w: 'WINGS', start: 0.3}], [{w: '100', start: 0.6, accent: true}, {w: 'MPH', start: 0.9}]]} y={300} size={104} hideAt={2.5} /></>}>
    <ShotCam preset="push" from={[11, 1.4, 11]} to={[4, 2.2, 6.5]} look={[[x + 3, 4.5, 0], [x + 5, 5.2, -1]]} fov0={72} fov1={58} start={0} end={d} ease="inout" shake={0.5} shakeFrom={2} shakeLen={16} />
    <NightRoad frame={f} speed={1.8} /><Chase x={x} f={f} /><Mothman position={[x + 3, 5.4, -2.5]} rotation={[0, 0.9, 0.04]} scale={2.4} frame={f} wings={1} flap={0.55} />
    <Particles kind="dust" center={[x, 1, 1]} area={[12, 2, 6]} count={30} frame={f} opacity={0.35} /><Post bloom={1.9} threshold={0.3} vignette={0.4} /></Stage>; };
// 1 chase: car speeds, creature keeps pace
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const x = -16 + f * 0.62;
  return <Stage palette={AMBER} fog={[30, 160]} overlay={<><Pill text="IT CHASED THEIR CAR" y={236} variant="red" delay={loc(3.4, 1)} size={46} /><CFlash at={[loc(3.7, 1)]} k={0.3} color="#ff5a30" len={6} /></>}>
    <ShotCam preset="track" target={(ff) => [-16 + ff * 0.62 + 3, 2.6, 0]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[-3, 0.6, 9]} fov0={60} start={0} end={d} drift={0.1} />
    <NightRoad frame={f} speed={3.2} /><Chase x={x} f={f} /><Mothman position={[x + 3.5, 4.6 + Math.sin(f * 0.2) * 0.3, -2.0]} rotation={[0, -0.2, 0.05]} scale={1.8} frame={f} wings={0.9} flap={0.5} />
    <Particles kind="dust" center={[x, 0.6, 1]} area={[10, 1.2, 5]} count={28} frame={f} opacity={0.4} /><Post bloom={1.7} threshold={0.32} vignette={0.4} /></Stage>; };
// 2 speedometer: 100
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const v = clamp01(f / (d * 0.55));
  return <Stage palette={REDN} fog={[20, 100]} overlay={<><Pill text="100 MILES AN HOUR" y={236} variant="red" delay={loc(5.2, 2)} size={50} /><CFlash at={[loc(5.2, 2)]} k={0.45} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[2.5, 1.2, 19]} to={[0.4, 0.3, 14]} look={[[0, 0, 0], [0, 0, 0]]} fov0={52} fov1={44} start={0} end={d} ease="inout" shake={0.35} shakeFrom={loc(5.2, 2)} shakeLen={14} />
    <Speedo v={v} glow={1 + v} /><Bx p={[0, -4.2, -1]} s={[16, 1.2, 1]} c="#101114" /><Particles kind="embers" center={[0, 0, 1]} area={[10, 7, 4]} count={30} frame={f} opacity={0.5} color="#ff6a40" /><Post bloom={1.7} threshold={0.35} vignette={0.5} /></Stage>; };
// 3 Nov 15 1966 calendar
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const u = clamp01(f / 14);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="NOVEMBER 15, 1966" y={236} variant="yellow" delay={loc(7.3, 3)} size={52} /><CFlash at={[loc(8.5, 3)]} k={0.35} color="#ffb060" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 0.2, 0]} a0={0.35} a1={-0.2} r0={11} r1={8} h0={1.6} h1={0.6} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Bx p={[0, -3.2, -1]} s={[22, 0.4, 8]} c="#3a2c20" /><Calendar position={[0, 0.6 - (1 - u) * 3, 0]} rotation={[0, 0, (1 - u) * 0.5]} scale={1.15} mark={16} frame={f} />
    <Paper position={[-4.6, -2.9, 1.5]} rotation={[0, 0.5, 0]} scale={0.8} /><Particles kind="dust" center={[0, 1, 1]} area={[10, 6, 4]} count={26} frame={f} opacity={0.35} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 4 Point Pleasant map table
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const pulse = 1 + 0.2 * Math.sin(f * 0.3);
  return <Stage palette={OFFICE} fog={[30, 120]} overlay={<><Pill text="POINT PLEASANT" y={236} variant="yellow" delay={loc(10.6, 4)} size={52} /><Pill text="WEST VIRGINIA" y={316} variant="dark" delay={loc(11.5, 4)} size={46} /></>}>
    <ShotCam preset="crane" target={[0, 0.5, 0]} h0={4} h1={13} r0={13} r1={9} angle={0.5} lookY0={0.5} lookY1={0.5} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, 0]} s={[13, 0.5, 9]} c="#2a2f3a" /><Bx p={[1.2, 0.3, 0.4]} s={[7.6, 0.14, 6.4]} c="#3a5a3a" /><Bx p={[-3.8, 0.3, -0.6]} s={[3.4, 0.14, 6]} c="#4a6a42" />
    {Array.from({length: 14}, (_, i) => <Bx key={i} p={[-1.6 + i * 0.45, 0.42, -2.6 + Math.sin(i * 0.6) * 1.2 + i * 0.28]} s={[0.55, 0.07, 0.55]} c="#2a6aa8" e="#3a8ad8" ei={0.4} r={[0, 0.3, 0]} />)}
    <group position={[2.2, 0.45, 0.8]} scale={pulse}><Cy p={[0, 0.8, 0]} a={[0.02, 0.35, 1.2, 8]} c="#ff3a20" e="#ff3a20" ei={1.2} /><Glow position={[0, 1.4, 0]} size={3.6} color="#ff4a30" opacity={0.8} /></group>
    <Shockwave position={[2.2, 0.5, 0.8]} start={loc(10.9, 4)} frame={f} radius={4} life={26} color="#ff6a50" /><Post bloom={1.5} threshold={0.42} vignette={0.45} /></Stage>; };
// 5 old munitions plant
S[5] = () => { const f = useCurrentFrame(); const d = dur(5);
  return <Stage palette={NIGHT} fog={[25, 150]} overlay={<><Pill text="OLD MUNITIONS PLANT" y={236} variant="yellow" delay={loc(13.1, 5)} size={46} /><Pill text="TNT DOMES" y={316} variant="red" delay={loc(13.6, 5)} size={52} /></>}>
    <ShotCam preset="crane" target={[2, 1.5, -2]} h0={5} h1={16} r0={22} r1={26} angle={0.2} lookY0={2} lookY1={2} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Stars count={200} radius={140} /><TntPlant frame={f} />
    <Particles kind="embers" center={[18, 8, 4]} area={[3, 6, 3]} count={18} frame={f} opacity={0.5} color="#ff8a50" /><Post bloom={1.5} threshold={0.38} vignette={0.4} /></Stage>; };
// 6 eyes glowed red
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const k = f < loc(15.1, 6) ? 0.15 : f < loc(15.8, 6) ? 0.7 : 1.4;
  return <Stage palette={NIGHT} fog={[8, 60]} overlay={<><CFlash at={[loc(15.1, 6), loc(15.8, 6)]} k={0.5} color="#ff2a20" len={7} /><Pill text="ITS EYES GLOWED RED" y={236} variant="red" delay={loc(15.1, 6)} size={46} /></>}>
    <ShotCam preset="push" from={[0, 3.6, 17]} to={[0, 3.7, 11]} look={[[0, 3.5, 0], [0, 3.6, 0]]} fov0={50} fov1={38} start={0} end={d} ease="inout" shake={0.5} shakeFrom={loc(15.1, 6)} shakeLen={12} />
    <Mothman position={[0, 0, 0]} scale={2.6} frame={f} wings={0.35} flap={0.1} eyes={k * 0.8} />
    <Particles kind="dust" center={[0, 2, 3]} area={[10, 6, 6]} count={30} frame={f} opacity={0.3} /><Post bloom={1.1} threshold={0.45} vignette={0.6} /></Stage>; };
// 7 they sped away
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const x = -2 + f * 0.8;
  return <Stage palette={AMBER} fog={[25, 150]} overlay={<><Pill text="THEY SPED AWAY" y={236} variant="yellow" delay={loc(16.8, 7)} size={50} /></>}>
    <ShotCam preset="track" target={(ff) => [-2 + ff * 0.8 - 3, 1.6, 0]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[-9, 2.4, 6]} fov0={64} start={0} end={d} drift={0.15} />
    <NightRoad frame={f} speed={3.6} /><Chase x={x} f={f} /><Mothman position={[x - 14 + f * 0.1, 4 + Math.sin(f * 0.22), -2]} rotation={[0, -0.3, 0]} scale={1.8} frame={f} wings={1} flap={0.5} />
    <Particles kind="dust" center={[x - 2, 0.6, 1]} area={[10, 1.2, 5]} count={30} frame={f} opacity={0.45} /><Post bloom={1.7} threshold={0.32} vignette={0.42} /></Stage>; };
// 8 it took flight and kept pace
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const x = -14 + f * 0.7; const lift = clamp01((f - loc(18.1, 8)) / 18);
  return <Stage palette={AMBER} fog={[30, 160]} overlay={<><Pill text="IT TOOK FLIGHT" y={236} variant="red" delay={loc(18.1, 8)} size={50} /><Pill text="KEPT PACE" y={316} variant="yellow" delay={loc(18.9, 8)} size={52} /><CFlash at={[loc(18.1, 8)]} k={0.35} color="#ff5a30" len={6} /></>}>
    <ShotCam preset="orbit" target={[x + 2, 3.2, 0]} a0={-0.2} a1={0.8} r0={16} r1={14} h0={2.4} h1={4.6} fov0={62} fov1={54} start={0} end={d} ease="inout" />
    <NightRoad frame={f} speed={3.2} /><Chase x={x} f={f} /><Mothman position={[x + 3, 0.4 + lift * 4.2 + Math.sin(f * 0.25) * 0.4, -1.2]} rotation={[0, -0.1, 0.05]} scale={1.9} frame={f} wings={0.4 + lift * 0.6} flap={0.5} />
    <Particles kind="dust" center={[x, 0.6, 1]} area={[10, 1.2, 5]} count={26} frame={f} opacity={0.4} /><Post bloom={1.7} threshold={0.32} vignette={0.42} /></Stage>; };
// 9 days later, more witnesses (sketch card)
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const t = f / FPS; const p1 = loc(21.1, 9);
  return <Stage palette={STROBE} fog={[20, 120]} overlay={<><Pill text="MORE WITNESSES" y={236} variant="yellow" delay={loc(20.7, 9)} size={50} />
    {f >= p1 && <PhotoCard src="mothman/IMG1.jpg" credit="Witness sketch by Roger Scarberry (public domain)" tag="WITNESS SKETCH" delay={p1} dur={d - p1} />}</>}>
    <ShotCam preset="push" from={[-6, 2.4, 11]} to={[-1.5, 1.8, 6]} look={[[0, 1.2, 0], [0, 1.2, 0]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <NightRoad frame={f} speed={0} z0={-3} lamps trees />
    {[[-3.4, 0.2], [-1.4, 1.0], [0.8, 0.2], [2.8, 0.9]].map(([x, z], i) => <Man key={i} p={[x, 0.1, z]} clip={i % 2 ? 'interact-right' : 'idle'} rot={-0.3 + i * 0.2} t={t + i * 0.5} i={i} s={0.62} />)}
    <Car position={[6.5, 0.1, -0.6]} rotation={Math.PI - 0.4} scale={1.1} color="#e8e8ec" /><Glow position={[5.8, 2.6, -0.6]} size={5} color={f % 12 < 6 ? '#ff2a2a' : '#2a6aff'} opacity={0.85} />
    <Post bloom={1.5} threshold={0.38} vignette={0.42} /></Stage>; };
// 10 newspapers named it Mothman
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="NEWSPAPERS" y={236} variant="dark" delay={loc(22.9, 10)} size={50} /><Pill text="MOTHMAN" y={316} variant="red" delay={loc(24.0, 10)} size={62} /><CFlash at={[loc(24.0, 10)]} k={0.55} color="#ffffff" len={7} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.6} a1={-0.3} r0={9} r1={6.4} h0={6} h1={3.4} fov0={52} fov1={42} start={0} end={d} ease="inout" shake={0.5} shakeFrom={loc(24.0, 10)} shakeLen={12} />
    <Bx p={[0, -0.2, 0]} s={[20, 0.3, 10]} c="#3a2c20" />
    {Array.from({length: 7}, (_, i) => { const a = Math.min(1, f / (8 + i * 2)); return <Paper key={i} position={[(i - 3) * 1.45, 0.05 + i * 0.07, Math.sin(i * 1.9) * 0.9 + (1 - a) * 6]} rotation={[0, (i - 3) * 0.25 + (1 - a) * 2.2, 0]} scale={0.8} tone={['#e8e0c8', '#d8d0b8', '#efe6cc'][i % 3]} head={i === 3 ? '#c8281c' : '#1a1a1a'} />; })}
    <Mothman position={[0, 2.6 + Math.sin(f * 0.1) * 0.15, -2.4]} scale={0.7} frame={f} wings={0.6} flap={0.2} eyes={f > loc(24.0, 10) ? 1 : 0.2} />
    <Glow position={[0, 4, 1]} size={12} color="#ffe0a8" opacity={0.2} /><Particles kind="dust" center={[0, 2, 0]} area={[10, 5, 5]} count={24} frame={f} opacity={0.35} /><Post bloom={1.4} threshold={0.45} vignette={0.45} /></Stage>; };
// 11 Batman villain
S[11] = () => { const f = useCurrentFrame(); const d = dur(11);
  return <Stage palette={NIGHT} fog={[20, 100]} overlay={<>{kc(11, 'after a Batman villain.', 25.2, 'Batman', 300, 80, 26.9)}<Pill text="1966 TV BATMAN" y={1130} variant="yellow" delay={loc(25.8, 11)} size={42} /><CFlash at={[loc(25.8, 11)]} k={0.45} color="#ffe060" len={7} /></>}>
    <ShotCam preset="push" from={[0, 3, 15]} to={[0, 3.5, 9]} look={[[0, 4, 0], [0, 4.4, 0]]} fov0={56} fov1={46} start={0} end={d} ease="inout" shake={0.3} shakeFrom={loc(25.8, 11)} shakeLen={10} />
    <Bx p={[0, 4, -2]} s={[26, 18, 0.4]} c="#10142a" /><mesh position={[0, 4.6, -1.7]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.8]}><cylinderGeometry args={[3.6, 3.6, 0.05, 28]} /><meshBasicMaterial color="#ffe060" toneMapped={false} /></mesh>
    <group position={[0, 4.6, -1.6]} scale={1.1}><Bx p={[0, 0, 0]} s={[1.0, 1.6, 0.1]} c="#101010" /><Bx p={[0, 1.0, 0]} s={[0.7, 0.7, 0.1]} c="#101010" />{[-1, 1].map((s) => <group key={s}><Bx p={[s * 0.35, 1.5, 0]} s={[0.2, 0.5, 0.1]} c="#101010" r={[0, 0, s * -0.2]} /><Bx p={[s * 1.4, 0.4, 0]} s={[2.2, 0.8, 0.1]} c="#101010" r={[0, 0, s * 0.35]} /><Bx p={[s * 2.7, 0.0, 0]} s={[1.4, 0.7, 0.1]} c="#101010" r={[0, 0, s * -0.25]} /></group>)}</group>
    <Bx p={[0, -1.5, 3]} s={[16, 0.3, 8]} c="#2a2420" /><Paper position={[-2.6, -1.3, 3]} rotation={[0, 0.4, 0]} scale={0.9} /><Paper position={[2.6, -1.3, 3.4]} rotation={[0, -0.5, 0]} scale={0.9} head="#c8281c" />
    <Glow position={[0, 4.6, 0]} size={26} color="#ffe060" opacity={0.2} /><Particles kind="dust" center={[0, 3, 1]} area={[12, 8, 6]} count={30} frame={f} opacity={0.35} /><Post bloom={1.6} threshold={0.38} vignette={0.45} /></Stage>; };
// 12 thirteen months later: Silver Bridge in rush hour
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const cx = -34 + f * 0.5;
  return <Stage palette={DUSK} fog={[40, 220]} overlay={<><Pill text="13 MONTHS LATER" y={236} variant="yellow" delay={loc(27.0, 12)} size={52} /><Pill text="DEC 15, 1967" y={316} variant="dark" delay={loc(27.9, 12)} size={46} /></>}>
    <ShotCam preset="push" from={[-4, 2.2, 28]} to={[2, 2.6, 21]} look={[[0, 4.5, 0], [0, 4.5, 0]]} fov0={62} fov1={56} start={0} end={d} ease="inout" />
    <Ocean position={[0, -0.2, -6]} size={[220, 90]} seg={40} frame={f} amp={0.12} choppy={0.5} deep="#1c2c40" face="#5a6a88" foam="#c0b8c0" foamAt={0.97} />
    <group scale={0.4} rotation={[0, 0.9, 0]}><SilverBridge frame={f} u={0} /><Car position={[cx, 2.7, 0.9]} rotation={0} scale={0.5} color="#c83a30" /><Car position={[cx + 30, 2.7, -0.9]} rotation={Math.PI} scale={0.5} color="#3a6ac8" /><Car position={[cx - 14, 2.7, 0.9]} rotation={0} scale={0.5} color="#e8c040" /></group>
    <Particles kind="dust" center={[0, 8, 6]} area={[40, 10, 10]} count={30} frame={f} opacity={0.3} color="#ffd0a0" /><Post bloom={1.4} threshold={0.45} vignette={0.38} /></Stage>; };
// 13 REVEAL: the bridge collapses
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const u = clamp01(f / (d * 0.85));
  return <Stage palette={DUSK} fog={[40, 220]} overlay={<>{kc(13, 'collapsed in rush hour.', 29.2, 'collapsed', 300, 84, 31.1)}<CFlash at={[2, 8]} k={0.85} color="#ffffff" len={9} /><Pill text="RUSH HOUR" y={1130} variant="red" delay={loc(30.0, 13)} size={52} /></>}>
    <ShotCam preset="push" from={[-4, 2.2, 26]} to={[2, 3.4, 20]} look={[[0, 4.5, 0], [0, 3.5, 0]]} fov0={62} fov1={56} start={0} end={d} ease="inout" shake={1.1} shakeFrom={2} shakeLen={26} />
    <Ocean position={[0, -0.2, -6]} size={[220, 90]} seg={40} frame={f} amp={0.12 + u * 0.35} choppy={0.8} deep="#1c2c40" face="#5a6a88" foam="#c0b8c0" foamAt={0.8} />
    <group scale={0.4} rotation={[0, 0.9, 0]}><SilverBridge frame={f} u={u} /></group><Shockwave position={[0, 1.5, 0]} start={2} frame={f} radius={12} life={24} color="#ffd8a0" /><Burst kind="sparks" position={[0, 1.5, 0]} start={2} frame={f} count={60} color="#ffc060" /><Burst kind="debris" position={[0, 1.5, 0]} start={3} frame={f} count={40} color="#8a8480" />
    <Particles kind="dust" center={[0, 6, 4]} area={[40, 14, 12]} count={50} frame={f} opacity={0.5} color="#c8b8a8" /><Post bloom={1.9} threshold={0.3} vignette={0.45} /></Stage>; };
// 14 forty-six people died: river debris, rescue strobes
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const t = f / FPS;
  return <Stage palette={STROBE} fog={[25, 160]} overlay={<>{kc(14, 'Forty-six people died.', 31.2, 'Forty-six', 300, 84, 33.0)}<CFlash at={[loc(31.2, 14), loc(31.55, 14)]} k={0.35} color="#ff4a50" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 1.8, -4]} a0={0.25} a1={-0.3} r0={14} r1={10} h0={3.2} h1={2.4} fov0={56} fov1={48} start={0} end={d} ease="inout" />
    <Stars count={180} radius={140} /><Ocean position={[0, -0.3, -8]} size={[200, 80]} seg={40} frame={f} amp={0.18} choppy={0.8} deep="#0a1624" face="#1e3a58" foam="#8aa0b0" foamAt={0.9} />
    <group position={[0, 0, 4]}><RiverDebris frame={f} n={14} /></group><group position={[0, 0, -16]} rotation={[0, 0.5, 0]} scale={0.4}><SilverBridge frame={f} u={0.9} cars={false} /></group>
    {[[-9, 4], [-5, 6]].map(([x, z], i) => <Man key={i} p={[x, 0.2, z]} clip="idle" rot={0.4} t={t + i} i={i} s={0.7} />)}
    {[0, 1].map((k) => <group key={k}><Bx p={[-12 + k * 16, 0.6, 7]} s={[2.2, 0.8, 1.1]} c="#e8e8ec" /><Glow position={[-12 + k * 16, 1.6, 7]} size={7} color={(f + k * 6) % 12 < 6 ? '#ff2a2a' : '#2a6aff'} opacity={0.9} /></group>)}
    <Particles kind="dust" center={[0, 3, 0]} area={[40, 6, 20]} count={30} frame={f} opacity={0.3} /><Post bloom={1.6} threshold={0.35} vignette={0.45} /></Stage>; };
// 15 a famous book tied the two together
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const a = 0.4 + f * 0.012;
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="A FAMOUS BOOK" y={236} variant="yellow" delay={loc(33.1, 15)} size={52} /><Pill text="TIED THE TWO TOGETHER" y={316} variant="dark" delay={loc(33.9, 15)} size={40} /><Pill text="REPLICA COVER, NOT EVIDENCE" y={1130} variant="red" delay={loc(34.2, 15)} size={36} /></>}>
    <ShotCam preset="push" from={[-2, 7, 11]} to={[-0.6, 4, 7]} look={[[0, 0.3, 0], [0, 0.6, 0]]} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.3, 0]} s={[16, 0.4, 9]} c="#3a2c20" />
    <group position={[0, 0.9, 0]} rotation={[-0.55, a, 0]}><Bx p={[0, 0, 0]} s={[3.6, 5.0, 0.4]} c="#14161e" /><Bx p={[0, 0, 0.22]} s={[3.2, 4.6, 0.04]} c="#1c2236" />
      <Mothman position={[0, 0.2, 0.35]} scale={0.5} frame={f} wings={1} flap={0.1} eyes={1.1} />
      {[-1.2, -0.4, 0.4, 1.2].map((x, i) => <Bx key={i} p={[x, -1.7, 0.27]} s={[0.1, 0.9, 0.05]} c="#8a9098" />)}<Bx p={[0, -1.25, 0.27]} s={[3.0, 0.1, 0.05]} c="#8a9098" /><Bx p={[0, 1.9, 0.27]} s={[2.4, 0.22, 0.05]} c="#ff3a20" e="#ff3a20" ei={0.8} basic /></group>
    <Cy p={[-5, 1.2, -1.4]} a={[0.05, 0.05, 1.8, 5]} c="#222" /><Cy p={[-5, 2.2, -1.4]} a={[0.1, 0.5, 0.5, 8]} c="#1c6a4a" /><Glow position={[-5, 1.9, -1.3]} size={8} color="#ffe0a8" opacity={0.45} />
    <Particles kind="dust" center={[0, 2, 0]} area={[10, 5, 5]} count={26} frame={f} opacity={0.35} /><Post bloom={1.5} threshold={0.42} vignette={0.45} /></Stage>; };
// 16 investigators at the wreck: the cause
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const t = f / FPS;
  return <Stage palette={DAWN} fog={[25, 150]} overlay={<><Pill text="INVESTIGATORS" y={236} variant="yellow" delay={loc(35.7, 16)} size={50} /><Pill text="FOUND THE CAUSE" y={316} variant="red" delay={loc(36.9, 16)} size={50} /><Pill text="NTSB REPORT, 1970" y={1130} variant="dark" delay={loc(36.2, 16)} size={40} /></>}>
    <ShotCam preset="orbit" target={[0, 1.4, 0]} a0={-0.6} a1={0.3} r0={17} r1={12} h0={6} h1={3.4} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.2, 0]} s={[60, 0.3, 40]} c="#3a3a34" /><Bx p={[0, 0.05, -16]} s={[60, 0.3, 14]} c="#2a4a68" />
    <Eyebar position={[0, 0.9, -1]} rotation={[0, 0.3, 0.05]} scale={0.8} crack={1} frame={f} /><Bx p={[-4, 0.5, 3]} s={[4, 1.0, 0.8]} c="#7a8088" r={[0, 0.4, 0.1]} /><Bx p={[5, 0.4, 2]} s={[3, 0.8, 0.8]} c="#6a7078" r={[0, -0.6, 0.0]} />
    {[[-2.6, 3.0], [3.0, 3.4], [0.2, 4.4]].map(([x, z], i) => <Man key={i} p={[x, 0.0, z]} clip={i === 1 ? 'interact-right' : 'idle'} rot={Math.PI + (i - 1) * 0.3} t={t + i * 0.6} i={i + 1} s={0.7} />)}
    <Particles kind="dust" center={[0, 2, 0]} area={[16, 5, 10]} count={28} frame={f} opacity={0.3} /><Post bloom={1.2} threshold={0.5} vignette={0.4} /></Stage>; };
// 17 one flaw, a tenth of an inch deep
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const cr = clamp01((f - loc(38.0, 17)) / 10);
  return <Stage palette={REDN} fog={[15, 80]} overlay={<><KineticCard lines={[cueLine(W, 'one flaw,', 37.5, 'flaw'), [{w: '0.1', start: 38.9, accent: true}, {w: 'INCH', start: 39.4}]]} y={300} size={100} hideAt={39.9} offsetSec={CS[17]} /><CFlash at={[loc(37.95, 17), loc(38.9, 17)]} k={0.5} color="#ff4a30" len={7} /></>}>
    <ShotCam preset="push" from={[0, 1.5, 15]} to={[3.4, 1.6, 8.5]} look={[[0, 0, 0], [4.2, 0.6, 0.5]]} fov0={52} fov1={38} start={0} end={d} ease="inout" shake={0.5} shakeFrom={loc(38.0, 17)} shakeLen={12} />
    <Eyebar position={[0, 0, 0]} scale={1.1} crack={cr} frame={f} /><Ruler position={[3.6, -1.9, 0.9]} scale={0.6} hl={cr} />
    <Particles kind="dust" center={[0, 0, 2]} area={[10, 5, 4]} count={28} frame={f} opacity={0.45} /><Post bloom={1.8} threshold={0.3} vignette={0.5} /></Stage>; };
// 18 one steel link in the chain
S[18] = () => { const f = useCurrentFrame(); const d = dur(18);
  return <Stage palette={DAWN} fog={[25, 120]} overlay={<><Pill text="ONE STEEL LINK" y={236} variant="yellow" delay={loc(40.3, 18)} size={54} /><Pill text="CRACK HID INSIDE" y={316} variant="red" delay={loc(41.0, 18)} size={44} /></>}>
    <ShotCam preset="push" from={[-14, 2.5, 9]} to={[10, 1.6, 6]} look={[[-8, 0, 0], [12, 0, 0]]} fov0={56} fov1={46} start={0} end={d} ease="inout" />
    <Bx p={[0, -1.4, 0]} s={[70, 0.3, 14]} c="#2a2a2e" />
    {Array.from({length: 6}, (_, i) => <Eyebar key={i} position={[-22 + i * 9, 0, 0]} scale={0.95} crack={i === 3 ? clamp01((f - loc(40.8, 18)) / 8) : 0} frame={f} />)}
    <Particles kind="dust" center={[0, 1, 2]} area={[30, 4, 6]} count={30} frame={f} opacity={0.35} /><Post bloom={1.4} threshold={0.42} vignette={0.42} /></Stage>; };
// 19 not the strangest part: silhouette on the ridge
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const e = clamp01((f - loc(42.4, 19)) / 12);
  return <Stage palette={REDN} fog={[20, 130]} overlay={<><Pill text="NOT THE" y={236} variant="dark" delay={loc(42.0, 19)} size={52} /><Pill text="STRANGEST PART" y={316} variant="red" delay={loc(42.6, 19)} size={50} /><CFlash at={[loc(42.6, 19)]} k={0.4} color="#ff2a20" len={7} /></>}>
    <ShotCam preset="push" from={[0, 3, 16]} to={[0, 3.4, 9]} look={[[0, 6, -14], [0, 6.4, -14]]} fov0={62} fov1={48} start={0} end={d} ease="inout" />
    <Stars count={260} radius={160} /><Land /><Pines count={90} frame={f} seed={21} cr={5} cz={-14} />
    <Glow position={[10, 20, -50]} size={22} color="#e8f0ff" opacity={0.5} />
    <Mothman position={[0, height(0, -22) + 3.4, -22]} scale={2.2} frame={f} wings={0.9} flap={0.12} eyes={e * 1.6} />
    <FogLayer y={0.8} size={120} layers={3} thickness={1.4} color="#a04048" opacity={0.18} frame={f} center={[0, -20]} /><Post bloom={1.8} threshold={0.3} vignette={0.5} /></Stage>; };
// 20 a biologist: the sightings fit a sandhill crane
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const t = f / FPS; const x = -30 + f * 0.8;
  return <Stage palette={DAWN} fog={[30, 200]} overlay={<><Pill text="A BIOLOGIST SAYS" y={236} variant="yellow" delay={loc(44.2, 20)} size={50} /><Pill text="SIGHTINGS FIT A..." y={316} variant="dark" delay={loc(45.3, 20)} size={46} /></>}>
    <ShotCam preset="push" from={[-6, 1.0, 9]} to={[-2, 1.6, 5]} look={[[0, 4.5, -10], [2, 6, -12]]} fov0={62} fov1={52} start={0} end={d} ease="inout" />
    <Ocean position={[0, -0.4, -30]} size={[200, 90]} seg={36} frame={f} amp={0.06} choppy={0.4} deep="#3a4a60" face="#8a90a8" foam="#e8dcd0" foamAt={0.97} />
    <Bx p={[0, -0.2, 6]} s={[60, 0.4, 14]} c="#4a5a38" /><Man p={[-3.2, 0.0, 0.5]} clip="idle" rot={0.9} t={t} i={2} s={0.6} />
    <Crane position={[x * 0.6, 8 + Math.sin(f * 0.1), -24]} scale={1.3} frame={f} wings={1} /><Crane position={[x * 0.6 - 9, 11 + Math.sin(f * 0.1 + 1), -30]} scale={1.0} frame={f + 5} wings={1} />
    <Glow position={[24, 6, -40]} size={26} color="#ffd8a0" opacity={0.5} /><Post bloom={1.4} threshold={0.42} vignette={0.4} /></Stage>; };
// 21 crane: wings vs the sketch
S[21] = () => { const f = useCurrentFrame(); const d = dur(21);
  return <Stage palette={AMBER} fog={[20, 120]} overlay={<>{kc(21, 'sandhill crane.', 46.2, 'crane', 300, 92, 47.9)}<Pill text="RED FOREHEAD" y={1130} variant="red" delay={loc(46.9, 21)} size={46} /><CFlash at={[loc(46.8, 21)]} k={0.45} color="#ffffff" len={7} /></>}>
    <ShotCam preset="orbit" target={[0, 2.4, 0]} a0={0.7} a1={-0.5} r0={15} r1={11} h0={2.8} h1={4.0} fov0={56} fov1={48} start={0} end={d} ease="inout" />
    <Stars count={200} radius={140} /><Crane position={[0, 2.2 + Math.sin(f * 0.15) * 0.25, 0]} scale={0.8} frame={f} wings={1.3} />
    <Mothman position={[-5, 2.4, -5]} rotation={[0, 0.5, 0]} scale={1.0} frame={f} wings={1} flap={0.3} eyes={0.35} /><Glow position={[0, 3, -3]} size={24} color="#ffd8a0" opacity={0.18} />
    <Particles kind="dust" center={[0, 3, 0]} area={[16, 6, 10]} count={24} frame={f} opacity={0.3} /><Post bloom={1.5} threshold={0.38} vignette={0.42} /></Stage>; };
// 22 barred owls
S[22] = () => { const f = useCurrentFrame(); const d = dur(22); const s = f < loc(49.2, 22) ? 0.15 : 0.9;
  return <Stage palette={NIGHT} fog={[12, 80]} overlay={<><Pill text="ANOTHER EXPERT" y={236} variant="dark" delay={loc(48.2, 22)} size={48} /><Pill text="BARRED OWLS" y={316} variant="yellow" delay={loc(49.2, 22)} size={56} /><CFlash at={[loc(49.6, 22)]} k={0.4} color="#fff0d0" len={6} /></>}>
    <ShotCam preset="push" from={[3, 3, 14]} to={[0.8, 2.8, 9]} look={[[0, 2.4, 0], [0, 2.4, 0]]} fov0={54} fov1={38} start={0} end={d} ease="inout" shake={0.3} shakeFrom={loc(49.6, 22)} shakeLen={10} />
    <Stars count={200} radius={120} /><Bx p={[0, 0.8, -0.2]} s={[9, 0.35, 0.9]} c="#3a2a1c" r={[0, 0, 0.04]} /><Cy p={[-4.4, -2, -0.2]} a={[0.5, 0.7, 7, 6]} c="#2a1e14" />
    <Owl position={[0, 1.0, 0]} scale={0.95} shine={s} frame={f} />
    {Array.from({length: 12}, (_, i) => <Tree3 key={i} i={i} f={f} />)}
    <Glow position={[10, 12, -20]} size={18} color="#e8f0ff" opacity={0.4} />
    <Post bloom={1.7} threshold={0.3} vignette={0.5} /></Stage>; };
const Tree3 = ({i, f}) => <group position={[-18 + i * 3.4, -2, -9 - (i % 3) * 3]}><Cy p={[0, 4, 0]} a={[0.3, 0.45, 8, 6]} c="#1c1612" /><mesh position={[0, 8.5, 0]}><coneGeometry args={[2, 5, 6]} /><meshLambertMaterial color="#14301f" flatShading /></mesh></group>;
// 23 warning, or just a bird? split
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={AMBER} fog={[25, 140]} overlay={<><Pill text="WARNING?" y={236} variant="red" delay={loc(50.7, 23)} size={60} /><Pill text="OR JUST A BIRD?" y={316} variant="yellow" delay={loc(51.4, 23)} size={52} /><CFlash at={[loc(50.7, 23), loc(51.7, 23)]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 2.6, 0]} a0={-0.2} a1={0.2} r0={27} r1={22} h0={4} h1={5} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.2, 0]} s={[22, 0.3, 9]} c="#1c1814" />
    <group position={[-5.2, 0, 0]}><Mothman position={[0, 3, 0]} rotation={[0, 0.3, 0]} scale={1.7} frame={f} wings={1} flap={0.3} eyes={1.3} /><Bx p={[0, 0.2, 0]} s={[4.4, 0.4, 3]} c="#2a1c1c" /><Glow position={[0, 3, 1]} size={13} color="#ff2a20" opacity={0.25} /></group>
    <group position={[5.2, 0, 0]}><Crane position={[0, 2.8 + Math.sin(f * 0.14) * 0.3, 0]} rotation={[0, -0.3, 0]} scale={1.1} frame={f} wings={1.2} /><Bx p={[0, 0.2, 0]} s={[4.4, 0.4, 3]} c="#1c2218" /><Glow position={[0, 3, 1]} size={13} color="#80b0ff" opacity={0.2} /></group>
    <Particles kind="embers" center={[0, 3, 0]} area={[18, 7, 6]} count={36} frame={f} opacity={0.5} color="#ffb070" /><Post bloom={1.6} threshold={0.36} vignette={0.45} /></Stage>; };
// 24 loop: back to the night road + end card
S[24] = () => { const f = useCurrentFrame(); const d = dur(24); const x = -9 + f * 0.08;
  return <Stage palette={AMBER} fog={[30, 160]} overlay={<>{kc(24, 'WARNING or BIRD.', 52.7, 'WARNING', 310, 92, 54.5)}<EndCard delay={loc(53.2, 24)} sources={['WIKIPEDIA: MOTHMAN', 'WIKIPEDIA: SILVER BRIDGE (NTSB 1970)', 'AUDUBON / SKEPTICAL INQUIRER']} /></>}>
    <ShotCam preset="push" from={[11, 1.4, 11]} to={[10.8, 1.45, 10.8]} look={[[x + 3, 4.5, 0], [x + 3, 4.5, 0]]} fov0={72} fov1={72} start={0} end={d} ease="inout" />
    <NightRoad frame={f} speed={1.0} /><Chase x={x} f={f} /><Mothman position={[x + 3, 5.4, -2.5]} rotation={[0, 0.9, 0.04]} scale={2.4} frame={f} wings={1} flap={0.2} />
    <Post bloom={1.9} threshold={0.3} vignette={0.4} /></Stage>; };

export const Mm = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? MM_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
