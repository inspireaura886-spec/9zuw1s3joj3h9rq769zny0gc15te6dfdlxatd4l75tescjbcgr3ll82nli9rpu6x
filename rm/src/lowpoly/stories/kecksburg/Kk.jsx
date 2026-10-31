// "The Acorn That Fell" (Kecksburg PA, Dec 1965) - low-poly 3D Short, kit + Rigged soldiers. 25 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, FogLayer, Rigged, Glow, Stars, LightCone,
  Ocean, Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Land, Pines, height, Beam, Meteor, Archive, Village, Car, Fireball, MapTable, Seismo, BlueSmoke, LightBar, Tape, Geiger, Acorn, Flatbed, Sat, Trajectory, NasaDesk} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const KK_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0.0, 2.7, 5.7, 7.4, 9.2, 11.3, 13.4, 15.1, 17.7, 20.9, 23.5, 25.7, 27.8, 28.9, 30.1, 32.3, 33.9, 36.8, 38.2, 39.7, 42.6, 44.0, 46.1, 47.9, 50.0];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? KK_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

const NIGHT = {top: '#04081a', mid: '#0e2040', hor: '#2c5078', fog: '#0c1a2c', amb: 1.0, hemiSky: '#9ac0f0', hemiGround: '#1c2630', hemiI: 1.9, sun: '#b8d0ff', sunI: 1.5, sunPos: [-20, 30, 10], rim: '#ffa050', rimI: 1.0, rimPos: [0, 8, -30], glow: 1};
const FIRE = {...NIGHT, mid: '#2a1c30', hor: '#a05a38', fog: '#2a1a24', hemiSky: '#e8b898', rim: '#ff8a40', rimI: 1.6};
const STROBE = {...NIGHT, mid: '#1a2048', hor: '#5a4a8a', fog: '#141a38', hemiSky: '#aab0ff', rim: '#ff2a2a', rimI: 1.5};
const GEIG = {...NIGHT, mid: '#0e2a22', hor: '#2a6a4a', fog: '#0c2018', hemiSky: '#a0f0c8', rim: '#40ff80', rimI: 1.1};
const DAWN = {top: '#3a4a6a', mid: '#8a7a8a', hor: '#ffc890', fog: '#7a6a70', amb: 1.0, hemiSky: '#ffe0c0', hemiGround: '#3a3a34', hemiI: 1.9, sun: '#ffd0a0', sunI: 1.8, sunPos: [-30, 10, -30], rim: '#ffa070', rimI: 1.0, rimPos: [20, 10, 10], glow: 0.7};
const OFFICE = {top: '#14100c', mid: '#2a2018', hor: '#4a3626', fog: '#1c1612', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 2.0, sun: '#ffe0b0', sunI: 1.7, sunPos: [10, 20, 20], rim: '#6aa0ff', rimI: 0.8, rimPos: [-20, 8, -20], glow: 1};
const SPACE = {top: '#02040c', mid: '#06102a', hor: '#102448', fog: '#050a18', amb: 1.0, hemiSky: '#a0c0ff', hemiGround: '#102030', hemiI: 1.9, sun: '#fff0d8', sunI: 1.8, sunPos: [30, 20, 20], rim: '#6aa0ff', rimI: 1.0, rimPos: [-20, 8, -20], glow: 1};
const TWIST = {...NIGHT, top: '#1a0608', mid: '#401418', hor: '#c8382a', fog: '#2a0c10', hemiSky: '#ffc8b0', rim: '#ff5a3a', rimI: 1.8};

const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 130, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const CZ = -14; const GH = height(0, CZ);
const Wood = ({f, trees = 100, mist = 0.14, seed = 11, cr = 7}) => <><Stars count={260} radius={170} /><Land /><Pines count={trees} frame={f} seed={seed} cr={cr} cz={CZ} />
  <FogLayer y={0.6} size={120} layers={3} thickness={1.2} color="#7aa4c0" opacity={mist} frame={f} center={[0, -30]} /></>;
const Stack = ({p = [0, 0, 0], c = '#8a6a3a', n = 3}) => <group position={p}>{Array.from({length: n}, (_, i) => <Bx key={i} p={[0, 0.2 + i * 0.4, 0]} s={[1.6, 0.36, 1.2]} c={c} r={[0, i * 0.12, 0]} />)}</group>;

const S = [];
// 0 HOOK: fireball tears across the sky over a dark forest
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const u = clamp01(f / (d * 0.95));
  return <Stage palette={FIRE} fog={[40, 200]} overlay={<><CFlash at={[at(0.1)]} k={0.55} color="#ffd8a0" />{kc(0, 'December ninth, 1965.', 0, '1965', 340, 80, 2.6)}<Pill text="NASA LOST THE FILES" y={236} variant="red" delay={3} size={54} /></>}>
    <ShotCam preset="push" from={[-4, GH + 2.2, 9]} to={[2, GH + 3.2, 3]} look={[[-6, GH + 12, CZ - 20], [10, GH + 10, CZ - 20]]} fov0={74} fov1={62} start={0} end={d} ease="inout" shake={0.3} shakeFrom={3} shakeLen={14} />
    <Wood f={f} /><Fireball a={[-36, 30, -40]} b={[40, 10, -40]} u={u} size={9} trail={20} />
    <Glow position={[0, GH + 4, CZ]} size={40} color="#ff8a40" opacity={0.15 + u * 0.12} /><Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };
// 1 six states + Canada: map with the arc
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const u = clamp01(f / (d * 0.9));
  return <Stage palette={OFFICE} fog={[30, 120]} overlay={<><Pill text="6 US STATES" y={236} variant="yellow" delay={loc(4.0, 1)} size={54} /><Pill text="+ CANADA" y={316} variant="dark" delay={loc(4.9, 1)} size={50} /><CFlash at={[loc(2.8, 1)]} k={0.4} color="#ffb060" len={7} /></>}>
    <ShotCam preset="orbit" target={[0, 0.6, 0]} a0={-0.5} a1={0.4} r0={15} r1={12} h0={10} h1={8} fov0={54} fov1={48} start={0} end={d} ease="inout" />
    <MapTable frame={f} u={u} /><Particles kind="dust" center={[0, 3, 0]} area={[10, 5, 7]} count={26} frame={f} opacity={0.3} /><Post bloom={1.4} threshold={0.45} vignette={0.45} /></Stage>; };
// 2 seismograph spike
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="SEISMOGRAPHS" y={236} variant="yellow" delay={2} size={52} /><Pill text="FEEL IT" y={316} variant="red" delay={loc(6.4, 2)} size={58} /><CFlash at={[8]} k={0.45} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[0, 10, 13]} to={[0.5, 7, 8]} look={[[0, 0.3, 0], [0.4, 0.3, 0]]} fov0={54} fov1={46} start={0} end={d} ease="inout" shake={0.6} shakeFrom={8} shakeLen={30} />
    <Seismo frame={f} spikeAt={8} /><Particles kind="dust" center={[0, 2, 0]} area={[9, 4, 4]} count={20} frame={f} opacity={0.35} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 3 Kecksburg village at night
S[3] = () => { const f = useCurrentFrame(); const d = dur(3);
  return <Stage palette={NIGHT} fog={[30, 170]} overlay={<><Pill text="KECKSBURG, PA" y={236} variant="yellow" delay={loc(7.5, 3)} size={52} /><Pill text="DEC 9, 1965" y={316} variant="dark" delay={loc(8.3, 3)} size={44} /></>}>
    <ShotCam preset="crane" target={[0, 1.5, -2]} h0={2.5} h1={11} r0={22} r1={30} angle={0.3} lookY0={2} lookY1={2} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Wood f={f} trees={80} cr={9} /><Village frame={f} x0={-16} z={-2} /><Particles kind="embers" center={[0, 4, 0]} area={[30, 6, 8]} count={20} frame={f} opacity={0.2} color="#aac8ff" /><Post bloom={1.4} threshold={0.4} vignette={0.35} /></Stage>; };
// 4 blue smoke + thump
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={NIGHT} fog={[30, 170]} overlay={<><Pill text="BLUE SMOKE" y={236} variant="yellow" delay={loc(9.7, 4)} size={56} /><Pill text="A THUMP" y={316} variant="red" delay={loc(10.8, 4)} size={58} /><CFlash at={[loc(10.8, 4)]} k={0.55} color="#aaccff" len={9} /></>}>
    <ShotCam preset="push" from={[0, GH + 2.0, 12]} to={[0, GH + 3.0, 5]} look={[[0, GH + 6, CZ], [0, GH + 7, CZ]]} fov0={62} fov1={48} start={0} end={d} ease="inout" shake={0.9} shakeFrom={loc(10.8, 4)} shakeLen={18} />
    <Wood f={f} cr={8} /><BlueSmoke position={[0, GH, CZ]} frame={f} h={13} n={14} /><Glow position={[0, GH + 1, CZ]} size={12} color="#6aa8ff" opacity={0.45} /><Post bloom={1.5} threshold={0.38} vignette={0.38} /></Stage>; };
// 5 woods: something crashed, glow in the trees
S[5] = () => { const f = useCurrentFrame(); const d = dur(5);
  return <Stage palette={FIRE} fog={[25, 140]} overlay={<><Pill text="SOMETHING" y={236} variant="dark" delay={loc(11.5, 5)} size={50} /><Pill text="CRASHED" y={316} variant="red" delay={loc(11.9, 5)} size={62} /></>}>
    <ShotCam preset="push" from={[-6, GH + 1.6, 14]} to={[-1, GH + 1.8, 4]} look={[[0, GH + 1.5, CZ], [0, GH + 1.8, CZ]]} fov0={58} fov1={44} start={0} end={d} ease="inout" shake={0.4} shakeFrom={0} shakeLen={d} />
    <Wood f={f} trees={140} cr={4} seed={5} /><Glow position={[0, GH + 1.2, CZ]} size={14} color="#ffa050" opacity={0.7} /><Glow position={[0, GH + 6, CZ]} size={9} color="#fff0d0" opacity={0.3} />
    <BlueSmoke position={[2, GH, CZ + 1]} frame={f} h={8} n={9} /><Particles kind="embers" center={[0, GH + 2, CZ]} area={[8, 5, 6]} count={36} frame={f} opacity={0.7} color="#ffb060" /><Post bloom={1.7} threshold={0.35} vignette={0.4} /></Stage>; };
// 6 police rope off the area
S[6] = () => { const f = useCurrentFrame(); const d = dur(6);
  return <Stage palette={STROBE} fog={[25, 140]} overlay={<><Pill text="POLICE" y={236} variant="yellow" delay={loc(13.5, 6)} size={56} /><Pill text="ROPED OFF" y={316} variant="red" delay={loc(14.0, 6)} size={56} /><CFlash at={[loc(13.55, 6)]} k={0.4} color="#ff6070" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 1, -4]} a0={0.6} a1={-0.3} r0={17} r1={14} h0={3.4} h1={4.2} fov0={54} fov1={48} start={0} end={d} ease="inout" />
    <Wood f={f} trees={110} cr={9} /><Bx p={[0, 0.06, -4]} s={[40, 0.06, 4]} c="#2c2e36" />
    <Car position={[-3, 0.1, -4]} rotation={0.2} color="#e8e8ec" scale={1.1} /><LightBar position={[-3.2, 2.2, -4]} frame={f} scale={1.2} /><Car position={[3.5, 0.1, -5.5]} rotation={Math.PI - 0.3} color="#e8e8ec" scale={1.1} /><LightBar position={[3.7, 2.2, -5.5]} frame={f + 5} scale={1.2} />
    <Tape a={[-8, 0, -1]} b={[8, 0, -1]} frame={f} /><Post bloom={1.6} threshold={0.38} vignette={0.4} /></Stage>; };
// 7 soldiers with Geiger counters
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const t = f / FPS;
  return <Stage palette={GEIG} fog={[20, 100]} overlay={<><Pill text="SOLDIERS" y={236} variant="yellow" delay={loc(15.2, 7)} size={54} /><Pill text="GEIGER COUNTERS" y={316} variant="dark" delay={loc(16.2, 7)} size={46} /></>}>
    <ShotCam preset="push" from={[-5, 2.2, 9]} to={[-1.2, 1.5, 3.4]} look={[[0, 1.0, -3], [0, 1.0, -3]]} fov0={52} fov1={38} start={0} end={d} ease="inout" />
    <Wood f={f} trees={120} cr={6} />
    {[[-2.2, 0.5], [0.4, -1.0], [2.6, 0.2]].map(([x, z], i) => <group key={i}><Man p={[x, height(x, z), z]} clip="idle" rot={0.3 * (i - 1)} t={t + i * 0.4} i={i} s={0.62} /><Geiger position={[x + 0.4, height(x, z) + 0.7, z + 0.55]} rotation={[0.4, 0, 0]} scale={0.5} frame={f + i * 3} />
      <Beam position={[x - 0.2, height(x, z) + 1.5, z + 0.3]} dir={[0.1 * (i - 1), -0.4, -1]} length={16} radius={1.6} opacity={0.1} /></group>)}
    <Glow position={[0, 1.5, -3]} size={16} color="#40ff80" opacity={0.1} /><Post bloom={1.4} threshold={0.42} vignette={0.45} /></Stage>; };
// 8 acorn-shaped object (locals' account)
S[8] = () => { const f = useCurrentFrame(); const d = dur(8);
  return <Stage palette={FIRE} fog={[20, 100]} overlay={<>{kc(8, 'acorn-shaped object,', 19.1, 'acorn-shaped', 320, 76, 20.8)}<Pill text="LOCALS' ACCOUNT" y={236} variant="dark" delay={loc(17.8, 8)} size={46} /><Pill text="UNCONFIRMED LEGEND" y={1130} variant="red" delay={loc(18.8, 8)} size={40} /></>}>
    <ShotCam preset="orbit" target={[0, GH + 1.8, CZ]} a0={0.5} a1={-0.1} r0={10} r1={7} h0={3.6} h1={3.2} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <Wood f={f} trees={140} cr={11} seed={5} /><Acorn position={[0, GH, CZ]} frame={f} glow={0.4 + 0.2 * Math.sin(f * 0.2)} scale={1.3} />
    <LightCone position={[0, GH + 14, CZ]} dir={[0, -1, 0]} length={14} radius={3} color="#ffd8a0" opacity={0.15} frame={f} /><Particles kind="embers" center={[0, GH + 2, CZ]} area={[6, 4, 6]} count={30} frame={f} opacity={0.6} color="#ffc060" /><Post bloom={1.7} threshold={0.35} vignette={0.4} /></Stage>; };
// 9 photo card (replica) over glyph macro
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const p1 = loc(21.6, 9);
  return <Stage palette={FIRE} fog={[20, 100]} overlay={<><Pill text="VOLKSWAGEN-SIZED" y={236} variant="yellow" delay={loc(21.0, 9)} size={46} /><Pill text="HIEROGLYPH-LIKE SYMBOLS" y={316} variant="dark" delay={loc(22.3, 9)} size={38} />
    {f >= p1 && <PhotoCard src="kecksburg/IMG1.jpg" credit="Replica near Kecksburg fire station (CC BY-SA, Ryright)" tag="MODEL, NOT THE OBJECT" delay={p1} dur={d - p1} />}
    {f >= p1 && <Pill text="MODEL, NOT THE OBJECT" y={1500} variant="red" delay={p1 + 4} size={40} />}</>}>
    <ShotCam preset="orbit" target={[0, 1.3, 0]} a0={0.0} a1={0.8} r0={5} r1={3.4} h0={1.6} h1={1.4} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.1, 0]} s={[20, 0.2, 20]} c="#2a2420" /><Acorn frame={f} glow={0.7} scale={1} /><Particles kind="dust" center={[0, 2, 0]} area={[6, 4, 6]} count={26} frame={f} opacity={0.4} /><Post bloom={1.7} threshold={0.35} vignette={0.45} /></Stage>; };
// 10 hauled away on a flatbed
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const x = -14 + f * 0.28;
  return <Stage palette={NIGHT} fog={[25, 140]} overlay={<><Pill text="HAULED AWAY" y={236} variant="yellow" delay={loc(23.6, 10)} size={54} /><Pill text="ON A FLATBED" y={316} variant="red" delay={loc(24.7, 10)} size={52} /><CFlash at={[loc(24.7, 10)]} k={0.3} color="#ffffff" len={6} /></>}>
    <ShotCam preset="track" target={(ff) => [-14 + ff * 0.28, 1.2, -4]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[2.5, 2.2, 8]} fov0={50} start={0} end={d} drift={0.05} />
    <Wood f={f} trees={110} cr={6} /><Bx p={[0, 0.06, -4]} s={[60, 0.06, 3.6]} c="#2c2e36" /><Bx p={[0, 0.095, -4]} s={[60, 0.01, 0.12]} c="#c8b878" />
    <Flatbed position={[x, 0.1, -4]} rotation={0} frame={f} load tarp /><Glow position={[x + 2.7, 0.9, -4]} size={6} color="#fff2c0" opacity={0.5} />
    <Particles kind="dust" center={[x - 3, 0.6, -4]} area={[5, 1.4, 3]} count={20} frame={f} opacity={0.35} /><Post bloom={1.4} threshold={0.4} vignette={0.4} /></Stage>; };
// 11 the official answer: nothing there
S[11] = () => { const f = useCurrentFrame(); const d = dur(11);
  return <Stage palette={DAWN} fog={[30, 160]} overlay={<>{kc(11, 'The official answer:', 25.7, 'official', 300, 72, 26.8)}<Pill text="FOUND NOTHING" y={236} variant="dark" delay={loc(26.9, 11)} size={50} /><Stamp f={f} at={loc(27.2, 11)} text="NOTHING" y={1050} size={130} rot={-7} /></>}>
    <ShotCam preset="crane" target={[0, GH + 1, CZ]} h0={2} h1={10} r0={14} r1={22} angle={0.2} lookY0={1} lookY1={1} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Wood f={f} trees={110} cr={5} seed={9} mist={0.2} /><Cy p={[0, GH + 0.05, CZ]} a={[2.2, 2.2, 0.06, 14]} c="#3a3226" /><Post bloom={1.0} threshold={0.5} vignette={0.35} /></Stage>; };
// 12 a meteor
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const u = clamp01(f / d);
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<><Pill text="A METEOR." y={236} variant="yellow" delay={loc(27.9, 12)} size={64} /><CFlash at={[loc(27.95, 12)]} k={0.5} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[0, 3, 12]} to={[0, 4, 6]} look={[[0, 14, -40], [8, 12, -40]]} fov0={62} fov1={52} start={0} end={d} ease="inout" />
    <Wood f={f} trees={80} /><Meteor position={[-40 + u * 80, 40 - u * 25, -45]} dir={[1, -0.35, 0]} len={22} size={4} /><Post bloom={1.6} threshold={0.38} vignette={0.38} /></Stage>; };
// 13 2005 calendar on the NASA desk
S[13] = () => { const f = useCurrentFrame(); const d = dur(13);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<>{kc(13, '2005,', 28.9, '2005', 300, 190, 30.0)}</>}>
    <ShotCam preset="push" from={[-7, 9, 12]} to={[-3, 5.5, 7]} look={[[0, 0.5, 0], [0.4, 0.6, 0]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <NasaDesk frame={f} /><Particles kind="dust" center={[0, 3, 0]} area={[10, 5, 5]} count={26} frame={f} opacity={0.35} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 14 NASA says fragments
S[14] = () => { const f = useCurrentFrame(); const d = dur(14);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="NASA SAYS" y={236} variant="yellow" delay={loc(30.2, 14)} size={54} /><Pill text="FRAGMENTS" y={316} variant="dark" delay={loc(30.7, 14)} size={50} /></>}>
    <ShotCam preset="orbit" target={[0.4, 0.6, 0.2]} a0={0.6} a1={-0.3} r0={9} r1={6} h0={5} h1={3.6} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <NasaDesk frame={f} /><Stack p={[2.4, 0.4, 1.2]} c="#aab0b8" n={3} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 15 Soviet satellite
S[15] = () => { const f = useCurrentFrame(); const d = dur(15);
  return <Stage palette={SPACE} fog={[60, 300]} overlay={<><Pill text="SOVIET SATELLITE" y={236} variant="red" delay={loc(32.6, 15)} size={48} /></>}>
    <ShotCam preset="orbit" target={[0, 1, 0]} a0={0.8} a1={-0.4} r0={12} r1={8} h0={3} h1={2} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Stars count={320} radius={90} /><mesh position={[0, -22, -10]} scale={[1.4, 1, 1]}><sphereGeometry args={[22, 28, 20]} /><meshLambertMaterial color="#1a4a7a" flatShading emissive="#0a2a4a" emissiveIntensity={0.7} /></mesh>
    <Sat position={[0, 1, 0]} rotation={[0.2, f * 0.01, 0.1]} frame={f} scale={1.2} /><Glow position={[0, 1, 0]} size={8} color="#8ab0ff" opacity={0.15} /><Post bloom={1.4} threshold={0.4} vignette={0.38} /></Stage>; };
// 16 records lost
S[16] = () => { const f = useCurrentFrame(); const d = dur(16);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="THE RECORDS?" y={236} variant="yellow" delay={loc(34.0, 16)} size={52} /><Pill text="LOST IN THE 1980s" y={316} variant="red" delay={loc(35.4, 16)} size={44} /><Stamp f={f} at={loc(34.8, 16)} text="LOST" y={1050} size={150} rot={-7} /><CFlash at={[loc(34.8, 16)]} k={0.4} color="#ff6050" len={6} /></>}>
    <ShotCam preset="push" from={[0, 3, 15]} to={[0.5, 2.8, 8]} look={[[0, 2.4, 0], [0.4, 2.4, 0]]} fov0={54} fov1={42} start={0} end={d} ease="inout" />
    <Archive frame={f} /><Bx p={[0.5, 2.3 + 0.75, 0]} s={[1.0, 1.4, 1.9]} c="#0a0806" /><Particles kind="dust" center={[0, 3, 2]} area={[12, 6, 5]} count={36} frame={f} opacity={0.4} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 17 REVEAL: the twist
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const u = clamp01(f / d);
  return <Stage palette={TWIST} fog={[30, 160]} overlay={<>{kc(17, "But here's the twist.", 36.8, 'twist', 300, 84, 38.1)}<CFlash at={[loc(37.3, 17), 1]} k={0.8} color="#ffffff" len={10} /><Pill text="THE TWIST" y={1130} variant="red" delay={loc(37.3, 17)} size={62} /></>}>
    <ShotCam preset="push" from={[0, GH + 2.5, 12]} to={[0, GH + 4, 6]} look={[[0, GH + 8, CZ], [0, GH + 9, CZ]]} fov0={62} fov1={50} start={0} end={d} ease="inout" shake={0.8} shakeFrom={loc(37.3, 17)} shakeLen={14} />
    <Wood f={f} trees={100} /><Fireball a={[-6, 60, -30]} b={[6, 3, -30]} u={0.3 + u * 0.65} size={8} trail={18} /><Post bloom={1.9} threshold={0.32} vignette={0.4} /></Stage>; };
// 18 NASA's own catalogue
S[18] = () => { const f = useCurrentFrame(); const d = dur(18);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="NASA'S OWN CATALOGUE" y={236} variant="yellow" delay={loc(38.3, 18)} size={44} /><Pill text="NSSDCA 1965-094A" y={316} variant="dark" delay={loc(39.0, 18)} size={40} /></>}>
    <ShotCam preset="push" from={[3, 10, 11]} to={[1.5, 6, 6.5]} look={[[0.4, 0.7, 0.2], [0.4, 0.7, 0.2]]} fov0={54} fov1={44} start={0} end={d} ease="inout" />
    <NasaDesk frame={f} stamp /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 19 steep trajectory diagram
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const u = clamp01(f / (d * 0.6));
  return <Stage palette={SPACE} fog={[60, 300]} overlay={<><Pill text="PATH TOO STEEP" y={236} variant="red" delay={loc(41.0, 19)} size={56} /><Pill text="FOR ANY SATELLITE" y={316} variant="yellow" delay={loc(41.6, 19)} size={44} /><CFlash at={[loc(41.0, 19)]} k={0.4} color="#ff8a50" len={6} /></>}>
    <ShotCam preset="push" from={[0, 5, 17]} to={[0, 3.5, 11]} look={[[0, 2.5, 0], [0, 2.5, 0]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Stars count={240} radius={90} /><Trajectory frame={f} u={u} /><Post bloom={1.5} threshold={0.4} vignette={0.4} /></Stage>; };
// 20 meteor over Lake Erie
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const u = clamp01(f / d);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><Pill text="LIKELY A METEOR" y={236} variant="yellow" delay={loc(42.7, 20)} size={52} /><Pill text="OVER LAKE ERIE" y={316} variant="dark" delay={loc(43.2, 20)} size={44} /></>}>
    <ShotCam preset="push" from={[0, 2.4, 14]} to={[0, 3, 8]} look={[[0, 8, -40], [6, 6, -40]]} fov0={58} fov1={48} start={0} end={d} ease="inout" />
    <Stars count={240} radius={150} /><Ocean position={[0, 0, -40]} size={220} seg={44} frame={f} amp={0.3} choppy={1} deep="#06141e" face="#1c4a5e" foam="#9ab8c0" foamAt={0.7} />
    <Meteor position={[-30 + u * 60, 24 - u * 22, -50]} dir={[1, -0.6, 0]} len={18} size={3.5} /><Post bloom={1.5} threshold={0.38} vignette={0.38} /></Stage>; };
// 21 two stories: meteor stand vs satellite stand
S[21] = () => { const f = useCurrentFrame(); const d = dur(21);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="ONE NASA" y={236} variant="dark" delay={loc(44.1, 21)} size={52} /><Pill text="TWO STORIES" y={316} variant="red" delay={loc(45.2, 21)} size={58} /><CFlash at={[loc(45.2, 21)]} k={0.45} color="#ffffff" len={7} /></>}>
    <ShotCam preset="orbit" target={[0, 1.4, 0]} a0={-0.3} a1={0.3} r0={15} r1={12} h0={4.2} h1={4} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.1, 0]} s={[16, 0.2, 7]} c="#2a2420" />
    <Bx p={[-3.2, 0.5, 0]} s={[2.6, 1.0, 2.6]} c="#5a4a3a" /><mesh position={[-3.2, 1.8, 0]} scale={[1.2, 0.9, 1]}><icosahedronGeometry args={[1.0, 0]} /><meshLambertMaterial color="#6a5a4a" flatShading emissive="#ff6a30" emissiveIntensity={0.4} /></mesh>
    <Bx p={[3.2, 0.5, 0]} s={[2.6, 1.0, 2.6]} c="#3a4a5a" /><Sat position={[3.2, 2.1, 0]} rotation={[0.3, f * 0.02, 0]} frame={f} scale={0.7} />
    <Glow position={[-3.2, 2.2, 0]} size={5} color="#ffa060" opacity={0.3} /><Glow position={[3.2, 2.2, 0]} size={5} color="#80a8ff" opacity={0.3} /><Post bloom={1.5} threshold={0.42} vignette={0.45} /></Stage>; };
// 22 one has missing files
S[22] = () => { const f = useCurrentFrame(); const d = dur(22);
  return <Stage palette={OFFICE} fog={[20, 100]} overlay={<><Pill text="MISSING FILES" y={236} variant="red" delay={loc(46.4, 22)} size={58} /><CFlash at={[loc(46.7, 22)]} k={0.35} color="#ff6050" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 2.4, 0]} a0={0.5} a1={-0.4} r0={13} r1={9} h0={3.4} h1={2.8} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Archive frame={f} /><Bx p={[0.5, 2.3 + 0.75, 0]} s={[1.0, 1.4, 1.9]} c="#0a0806" /><Bx p={[-1.7, 2.3 + 0.75, 0]} s={[1.0, 1.4, 1.9]} c="#0a0806" /><Bx p={[2.7, 4.6 + 0.75, 0]} s={[1.0, 1.4, 1.9]} c="#0a0806" />
    <Particles kind="dust" center={[0, 3, 2]} area={[12, 6, 5]} count={34} frame={f} opacity={0.4} /><Post bloom={1.3} threshold={0.5} vignette={0.5} /></Stage>; };
// 23 meteor? satellite? taken away?
S[23] = () => { const f = useCurrentFrame(); const d = dur(23); const k = f < loc(48.4, 23) ? 0 : f < loc(49.2, 23) ? 1 : 2;
  return <Stage palette={FIRE} fog={[20, 100]} overlay={<><Pill text="METEOR?" y={236} variant="yellow" delay={loc(47.95, 23)} size={52} /><Pill text="SATELLITE?" y={316} variant="yellow" delay={loc(48.4, 23)} size={52} /><Pill text="TAKEN AWAY?" y={396} variant="red" delay={loc(49.3, 23)} size={52} /><CFlash at={[loc(48.4, 23), loc(49.3, 23)]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 1.4, 0]} a0={0.0} a1={0.5} r0={16} r1={13} h0={4} h1={3.6} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.1, 0]} s={[18, 0.2, 8]} c="#1c1814" />
    {[-4, 0, 4].map((x, i) => <group key={i}><Bx p={[x, 0.4, 0]} s={[2.2, 0.8, 2.2]} c="#3a3430" /><Glow position={[x, 2, 0]} size={k === i ? 7 : 2} color={['#ffa060', '#80a8ff', '#ffd060'][i]} opacity={k === i ? 0.5 : 0.1} /></group>)}
    <mesh position={[-4, 1.6, 0]} scale={[1.2, 0.9, 1]}><icosahedronGeometry args={[0.9, 0]} /><meshLambertMaterial color="#6a5a4a" flatShading emissive="#ff6a30" emissiveIntensity={k === 0 ? 0.8 : 0.15} /></mesh>
    <Sat position={[0, 1.8, 0]} rotation={[0.3, f * 0.02, 0]} frame={f} scale={0.6} /><Acorn position={[4, 0.8, 0]} scale={0.5} frame={f} glow={k === 2 ? 0.9 : 0.1} />
    <Post bloom={1.5} threshold={0.4} vignette={0.45} /></Stage>; };
// 24 loop: back to the opening woods + end card
S[24] = () => { const f = useCurrentFrame(); const d = dur(24);
  return <Stage palette={FIRE} fog={[40, 200]} overlay={<>{kc(24, 'in the dark?', 50.1, 'dark', 310, 96, 52.0)}<Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(51.0, 24)} size={46} /><EndCard delay={loc(51.0, 24)} sources={['WIKIPEDIA: KECKSBURG UFO INCIDENT', 'WIRED 2007', 'NASA NSSDCA 1965-094A']} /></>}>
    <ShotCam preset="push" from={[-4, GH + 2.2, 9]} to={[-3.9, GH + 2.25, 8.9]} look={[[0, GH + 14, CZ - 20], [0, GH + 14, CZ - 20]]} fov0={72} fov1={72} start={0} end={d} ease="inout" />
    <Wood f={f} /><Fireball a={[-70, 46, -48]} b={[70, 10, -48]} u={0.02} size={9} trail={20} /><Glow position={[0, GH + 4, CZ]} size={40} color="#ff8a40" opacity={0.15} /><Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };

export const Kk = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? KK_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
