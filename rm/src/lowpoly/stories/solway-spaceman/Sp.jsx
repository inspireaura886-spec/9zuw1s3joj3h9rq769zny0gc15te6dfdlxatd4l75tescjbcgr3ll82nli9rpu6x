// "The Spaceman on the Marsh" (Burgh Marsh 1964) - low-poly 3D Short, 30 scenes on cues.json cuts. Recreation, not the original photo.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, FogLayer, Rigged, Glow, Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Marsh, Firth, Reeds, Fig, Car, Camera, FilmStrip, LightTable, Shelves, Pad, Dunes, Desk, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const SP_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.12, 4.24, 5.38, 6.26, 9.18, 11.36, 12.78, 15.02, 16.38, 17.78, 18.88, 21.19, 23.28, 25.16, 26.52, 28.26, 29.92, 32.4, 34.14, 36.6, 38.22, 39.44, 41.04, 43.08, 44.92, 46.64, 49.05, 51.68, 54.14];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? SP_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 96, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

const base = {amb: 0.8, hemiI: 0.95, sunI: 1.25, glow: 0.4, rimI: 0.6};
const DAY = {...base, top: '#9ab8d0', mid: '#cfd8d0', hor: '#f0e6c8', fog: '#cfd4c4', hemiSky: '#f6f0dc', hemiGround: '#6a7050', sun: '#fff0d0', sunPos: [30, 40, 20], rim: '#ffe0a0', rimPos: [-20, 10, -30]};
const GOLD = {...base, top: '#8aa4c0', mid: '#e0cfa8', hor: '#ffd890', fog: '#d8c8a0', hemiSky: '#ffe8c0', hemiGround: '#6a6040', sun: '#ffd090', sunI: 2.3, sunPos: [-40, 12, -20], rim: '#ff9a60', rimPos: [30, 10, 30]};
const DUSK = {...base, top: '#2a3a68', mid: '#a0708a', hor: '#ffb070', fog: '#9a7a80', hemiSky: '#ffc8a0', hemiGround: '#3a3a40', sun: '#ffa060', sunI: 1.8, sunPos: [-40, 8, -30], rim: '#7a9aff', rimPos: [30, 20, 30]};
const ROOM = {...base, top: '#1a1410', mid: '#2e241a', hor: '#4a3a2a', fog: '#241c14', hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 1.7, sun: '#ffe0b0', sunI: 1.6, sunPos: [10, 20, 20], rim: '#6aa0ff', rimPos: [-20, 8, -20]};
const LAB = {...base, top: '#0c1018', mid: '#161c28', hor: '#222a38', fog: '#141a24', hemiSky: '#cfe0ff', hemiGround: '#20242c', hemiI: 1.2, sun: '#e8f0ff', sunI: 1.2, sunPos: [0, 20, 20], rim: '#fff0c0', rimPos: [0, 8, -10]};
const DESERT = {...base, top: '#5a90c8', mid: '#e8c898', hor: '#ffd8a0', fog: '#e8c898', hemiSky: '#fff0d0', hemiGround: '#a05a30', sun: '#fff2d0', sunI: 2.4, sunPos: [20, 50, 10], rim: '#ffb070', rimPos: [-20, 10, -30]};

const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 130, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const Land = ({f, mist = 0.1}) => <><Marsh /><Firth frame={f} /><Reeds />{mist > 0 && <FogLayer y={0.3} size={90} layers={3} thickness={1.0} color="#e8e8d8" opacity={mist} frame={f} center={[0, -20]} />}</>;
const gz = (x, z) => height(x, z);
const PO = ({text, y = 236, v = 'yellow', d = 2, size = 46}) => <Pill text={text} y={y} variant={v} delay={d} size={size} />;

const S = [];
const post = (b = 1.0, th = 0.55, vg = 0.35) => <Post bloom={b} threshold={th} vignette={vg} />;
// 0 HOOK: father's photo composition: girl on the marsh, white figure behind, push-in + flash
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const t = f / FPS;
  return <Stage palette={DAY} fog={[60, 260]} overlay={<><CFlash at={[at(0.1)]} k={0.6} color="#ffffff" />{kc(0, 'A DAD PHOTOGRAPHED', 0, 'DAD', 330, 80, 2.1)}<PO text="BEHIND HIS DAUGHTER" y={236} v="red" d={4} size={50} /></>}>
    <ShotCam preset="push" from={[0, 1.9, 9]} to={[0, 1.7, 5.4]} look={[[0, 1.4, 0], [0, 1.6, -4]]} fov0={50} fov1={42} start={0} end={d} ease="inout" shake={0.2} shakeFrom={2} shakeLen={10} />
    <Land f={f} /><Man p={[-0.4, gz(-0.4, 1), 1]} clip="idle" rot={0} t={t} i={2} s={0.5} /><Fig position={[1.0, gz(1, -4), -4]} rotation={0} scale={1.0} />{post(1.2, 0.5)}</Stage>; };
// 1 closer: orbit around girl and the figure
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const t = f / FPS;
  return <Stage palette={DAY} fog={[60, 260]} overlay={<><PO text="1964 · CUMBRIA" y={236} v="yellow" d={3} size={46} /></>}>
    <ShotCam preset="orbit" target={[0, 1.5, -1]} a0={-0.5} a1={0.4} r0={8} r1={6} h0={1.6} h1={2.0} fov0={48} fov1={42} start={0} end={d} ease="inout" />
    <Land f={f} /><Man p={[-0.2, gz(-0.2, 0), 0]} clip="idle" rot={0.2} t={t} i={2} s={0.5} /><Fig position={[1.2, gz(1.2, -3), -3]} scale={1.0} />{post(1.1, 0.5)}</Stage>; };
// 2 father raises camera
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const t = f / FPS;
  return <Stage palette={GOLD} fog={[60, 260]} overlay={<><PO text="HE TAKES THREE PHOTOS" y={236} v="yellow" d={4} size={40} /><CFlash at={[at(0.0), at(1.0)]} k={0.55} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[-4, 1.6, 6]} to={[-1.4, 1.5, 3.2]} look={[[1, 1.2, 0], [1, 1.4, 0]]} fov0={52} fov1={40} start={0} end={d} ease="inout" />
    <Land f={f} /><Man p={[0.3, gz(0.3, 1), 1.5]} clip="interact-right" rot={Math.PI - 0.1} t={t} i={0} s={0.6} /><Camera position={[0.4, 1.2, 0.8]} rotation={[0, Math.PI, 0]} scale={0.9} />
    <Man p={[1.6, gz(1.6, -3), -3]} clip="idle" rot={0} t={t} i={2} s={0.45} />{post(1.0, 0.55)}</Stage>; };
// 3 three film frames flick
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const lit = Math.floor(f / 8) % 3;
  return <Stage palette={LAB} fog={[30, 100]} overlay={<><PO text="THREE FRAMES" y={236} v="yellow" d={2} size={50} /><CFlash at={[0, 8, 16]} k={0.35} color="#ffffff" len={4} /></>}>
    <ShotCam preset="push" from={[0, 0.6, 9]} to={[0, 0.2, 6]} look={[[0, 0, 0], [0, 0, 0]]} fov0={48} fov1={42} start={0} end={d} ease="inout" />
    <FilmStrip lit={lit} /><Particles kind="dust" center={[0, 0, 2]} area={[8, 5, 4]} count={30} frame={f} opacity={0.4} />{post(1.5, 0.4, 0.5)}</Stage>; };
// 4 title card Burgh Marsh
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const p1 = at(0.6);
  return <Stage palette={GOLD} fog={[60, 280]} overlay={<>{f >= p1 && <PhotoCard src="solway/IMG2.jpg" credit="Burgh Marsh and the Solway Firth · Oliver Dixon · CC BY-SA 2.0" tag="BURGH MARSH · 1964" delay={p1} dur={d - p1} />}</>}>
    <ShotCam preset="crane" target={[0, 0, -20]} h0={1.6} h1={9} r0={26} r1={34} angle={0.2} lookY0={1.5} lookY1={0.5} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <Land f={f} />{post(1.0, 0.55)}</Stage>; };
// 5 father + girl walk across the marsh, crane
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const t = f / FPS; const x = -2.5 + f * 0.035;
  return <Stage palette={GOLD} fog={[60, 280]} overlay={<>{kc(5, 'Jim Templeton', 7.0, 'Templeton', 300, 80, 9.0)}<PO text="FIREFIGHTER" y={236} v="red" d={at(1.5)} size={46} /></>}>
    <ShotCam preset="crane" target={[0, 1, -2]} h0={1.5} h1={8} r0={14} r1={20} angle={0.5} lookY0={1.4} lookY1={0.8} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Land f={f} /><Man p={[x, gz(x, 0), 0]} clip="walk" rot={Math.PI / 2} t={t} i={0} s={0.6} /><Man p={[x + 1.0, gz(x, 0), 0.5]} clip="walk" rot={Math.PI / 2} t={t + 0.3} i={2} s={0.4} />{post(1.0, 0.55)}</Stage>; };
// 6 creek orbit: nobody else was there
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const t = f / FPS;
  return <Stage palette={GOLD} fog={[60, 280]} overlay={<><PO text="HE SWEARS" y={236} v="yellow" d={at(0.6)} size={52} /><PO text="NO ONE ELSE WAS THERE" y={316} v="red" d={at(1.7)} size={38} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, -2]} a0={0.2} a1={-1.2} r0={9} r1={7} h0={1.8} h1={2.4} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Land f={f} /><Man p={[0, gz(0, -1), -1]} clip="idle" rot={0.4} t={t} i={0} s={0.55} /><Man p={[1.2, gz(1.2, -1.5), -1.5]} clip="idle" rot={-0.3} t={t} i={2} s={0.4} />{post(1.0, 0.55)}</Stage>; };
// 7 distant car with two elderly women, empty horizon pan
S[7] = () => { const f = useCurrentFrame(); const d = dur(7);
  return <Stage palette={GOLD} fog={[60, 280]} overlay={<><PO text="TWO WOMEN IN A CAR" y={236} v="dark" d={at(0.3)} size={40} /></>}>
    <ShotCam preset="push" from={[-10, 1.6, 12]} to={[4, 1.8, 8]} look={[[4, 1, -8], [9, 1, -7]]} fov0={46} fov1={40} start={0} end={d} ease="inout" />
    <Land f={f} /><Car position={[9, gz(9, -7), -7]} rotation={0.3} scale={1.5} color="#6a3a3a" />{post(1.0, 0.55)}</Stage>; };
// 8 darkroom counter: prints come back
S[8] = () => { const f = useCurrentFrame(); const d = dur(8);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><PO text="BACK FROM KODAK" y={236} v="yellow" d={at(0.5)} size={46} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.2} a1={-0.5} r0={12} r1={9} h0={6} h1={5} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Desk papers={3} frame={f} /><FilmStrip position={[-2.5, 0.8, 1.5]} rotation={[-1.2, 0, 0]} lit={1} />{post(1.2, 0.5, 0.45)}</Stage>; };
// 9 middle print grows
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const k = clamp01(f / d);
  return <Stage palette={LAB} fog={[30, 100]} overlay={<><PO text="THE MIDDLE SHOT" y={236} v="red" d={at(0.3)} size={48} /></>}>
    <ShotCam preset="push" from={[0, 0.6, 12]} to={[0, 0.3, 5]} look={[[0, 0, 0], [0, 0, 0]]} fov0={46} fov1={40} start={0} end={d} ease="inout" />
    <FilmStrip lit={1} /><Fig position={[0, -0.8, 0.2]} scale={0.45 + k * 0.1} glow={0.2} />{post(1.5, 0.4, 0.5)}</Stage>; };
// 10 visor close-up
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={DAY} fog={[30, 200]} overlay={<><CFlash at={[at(0.0)]} k={0.5} color="#ffffff" len={7} /><PO text="WHITE FIGURE" y={236} v="yellow" d={2} size={50} /><PO text="DARK VISOR" y={316} v="dark" d={at(0.7)} size={46} /></>}>
    <ShotCam preset="orbit" target={[0, 2.4, 0]} a0={-0.5} a1={0.5} r0={5} r1={3.2} h0={2.6} h1={2.6} fov0={44} fov1={36} start={0} end={d} ease="inout" />
    <Marsh /><Fig position={[0, 0, 0]} scale={1.0} />{post(1.5, 0.45, 0.4)}</Stage>; };
// 11 police desk
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const t = f / FPS;
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><PO text="POLICE" y={236} v="yellow" d={2} size={50} /><PO text="NOTHING SUSPICIOUS" y={316} v="dark" d={at(0.5)} size={40} /></>}>
    <ShotCam preset="push" from={[2, 5, 10]} to={[0.5, 3.4, 6]} look={[[0, 0.8, 0], [0, 0.8, 0]]} fov0={50} fov1={40} start={0} end={d} ease="inout" />
    <Desk papers={4} frame={f} /><Man p={[0, -1.6, -4]} clip="idle" rot={0} t={t} i={3} s={1.0} />{post(1.2, 0.5, 0.45)}</Stage>; };
// 12 Kodak lab negative on light table
S[12] = () => { const f = useCurrentFrame(); const d = dur(12);
  return <Stage palette={LAB} fog={[30, 100]} overlay={<><CFlash at={[2]} k={0.45} color="#ffffff" len={7} />{kc(12, 'Kodak', 21.19, 'Kodak', 300, 110, 23.2)}</>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.3} a1={-0.4} r0={11} r1={8} h0={6} h1={4} fov0={48} fov1={42} start={0} end={d} ease="inout" />
    <LightTable frame={f} /><FilmStrip position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} lit={1} />{post(1.4, 0.4, 0.5)}</Stage>; };
// 13 magnifier over the negative
S[13] = () => { const f = useCurrentFrame(); const d = dur(13);
  return <Stage palette={LAB} fog={[30, 100]} overlay={<><PO text="NO FAKERY" y={236} v="red" d={at(0.2)} size={52} /></>}>
    <ShotCam preset="push" from={[0, 6, 5]} to={[0, 3.2, 1.2]} look={[[0, 0.6, 0], [0, 0.6, 0]]} fov0={50} fov1={36} start={0} end={d} ease="inout" />
    <LightTable frame={f} /><FilmStrip position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} lit={1} />
    <group position={[0.4 + Math.sin(f * 0.06) * 0.5, 2.0, 0.2]} rotation={[-Math.PI / 2, 0, 0]}><mesh><torusGeometry args={[0.9, 0.1, 6, 20]} /><meshLambertMaterial color="#c8a050" flatShading /></mesh><mesh><circleGeometry args={[0.85, 20]} /><meshBasicMaterial color="#cfe8ff" transparent opacity={0.25} toneMapped={false} /></mesh><Bx p={[0, -1.4, 0]} s={[0.12, 1.2, 0.12]} c="#6a4a2a" /></group>{post(1.3, 0.45, 0.5)}</Stage>; };
// 14 reward unclaimed
S[14] = () => { const f = useCurrentFrame(); const d = dur(14);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Stamp f={f} at={at(0.4)} text="UNCLAIMED" y={760} size={130} rot={-8} /><PO text="HOAX REWARD" y={236} v="yellow" d={2} size={50} /><CFlash at={[at(0.4)]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.1} a1={-0.6} r0={11} r1={8} h0={6} h1={5} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Desk papers={6} frame={f} />{[0, 1, 2].map((i) => <Bx key={i} p={[-1 + i * 0.4, 0.4 + i * 0.1, 1.2]} s={[1.6, 0.08, 0.8]} c="#7aa060" r={[0, 0.2 * i, 0]} />)}{post(1.2, 0.5, 0.45)}</Stage>; };
// 15 two men in dark suits by a car on the marsh road
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const t = f / FPS;
  return <Stage palette={GOLD} fog={[60, 260]} overlay={<>{kc(15, 'Number Nine and Eleven', 28.5, 'Nine', 300, 70, 30.5)}<PO text="TWO MEN" y={236} v="dark" d={at(0.3)} size={50} /></>}>
    <ShotCam preset="push" from={[-6, 1.5, 11]} to={[-2.4, 1.6, 7]} look={[[3, 1.1, 0], [3, 1.4, 0]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <Land f={f} /><Car position={[5, gz(5, 0), 0]} rotation={0.2} scale={0.9} /><Man p={[1.2, gz(1.2, 2), 2]} clip="idle" rot={-0.4} t={t} i={3} s={0.9} /><Man p={[2.4, gz(2.4, 2.6), 2.6]} clip="idle" rot={-0.6} t={t + 0.5} i={1} s={0.9} />{post(1.0, 0.55)}</Stage>; };
// 16 tags 9 and 11
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const t = f / FPS;
  return <Stage palette={GOLD} fog={[60, 260]} overlay={<><PO text="NUMBER 9" y={236} v="yellow" d={at(0.2)} size={52} /><PO text="NUMBER 11" y={316} v="red" d={at(1.0)} size={52} /><PO text="NO NAMES" y={396} v="dark" d={at(1.6)} size={42} /></>}>
    <ShotCam preset="orbit" target={[0, 1.4, 0]} a0={-0.4} a1={0.5} r0={6} r1={4.5} h0={1.8} h1={1.8} fov0={46} fov1={40} start={0} end={d} ease="inout" />
    <Land f={f} mist={0.04} /><Man p={[-1, gz(-1, 0), 0]} clip="idle" rot={0.3} t={t} i={3} s={0.95} /><Man p={[1, gz(1, 0), 0]} clip="idle" rot={-0.3} t={t} i={1} s={0.95} />{post(1.0, 0.55)}</Stage>; };
// 17 they march him to the spot
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const t = f / FPS; const x = -8 + f * 0.09;
  return <Stage palette={DUSK} fog={[60, 280]} overlay={<><PO text="SHOW US THE SPOT" y={236} v="yellow" d={at(0.5)} size={44} /></>}>
    <ShotCam preset="track" target={(ff) => [-8 + ff * 0.09, 1.3, 0]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[-3, 0.8, 8]} fov0={48} start={0} end={d} drift={0.04} />
    <Land f={f} /><Man p={[x, gz(x, 0), 0]} clip="walk" rot={Math.PI / 2} t={t} i={0} s={0.6} /><Man p={[x - 1.4, gz(x, 0.8), 0.8]} clip="walk" rot={Math.PI / 2} t={t} i={3} s={0.95} /><Man p={[x - 1.4, gz(x, -0.8), -0.8]} clip="walk" rot={Math.PI / 2} t={t + 0.4} i={1} s={0.95} />{post(1.1, 0.5)}</Stage>; };
// 18 Woomera: pad
S[18] = () => { const f = useCurrentFrame(); const d = dur(18);
  return <Stage palette={DESERT} fog={[50, 260]} overlay={<><PO text="AUSTRALIA 1964" y={236} v="yellow" d={at(0.3)} size={48} /><PO text="ABORTED LAUNCH" y={316} v="red" d={at(1.4)} size={42} /></>}>
    <ShotCam preset="crane" target={[0, 5, -6]} h0={1.5} h1={8} r0={26} r1={34} angle={0.3} lookY0={5} lookY1={6} fov0={54} fov1={48} start={0} end={d} ease="inout" />
    <Dunes /><Pad /><Particles kind="dust" center={[0, 1, 0]} area={[30, 3, 20]} count={40} frame={f} color="#e8c898" opacity={0.4} />{post(1.0, 0.55)}</Stage>; };
// 19 desert wide, two tiny figures
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const t = f / FPS;
  return <Stage palette={DESERT} fog={[50, 260]} overlay={<><PO text="TWO FIGURES" y={236} v="dark" d={at(0.4)} size={46} /></>}>
    <ShotCam preset="push" from={[-6, 1.4, 18]} to={[-2, 1.6, 12]} look={[[0, 3, -6], [0, 4, -6]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Dunes /><Pad /><Man p={[-2, -0.9, 4]} clip="idle" rot={0.5} t={t} i={1} s={0.5} /><Man p={[-0.8, -0.9, 4.4]} clip="idle" rot={-0.5} t={t} i={3} s={0.5} />{post(1.0, 0.55)}</Stage>; };
// 20 film frame with lens flare triangle
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const k = clamp01(f / d);
  return <Stage palette={LAB} fog={[30, 100]} overlay={<><PO text="THE FILM" y={236} v="yellow" d={2} size={52} /><PO text="JUST LENS FLARE" y={316} v="red" d={at(0.9)} size={44} /></>}>
    <ShotCam preset="push" from={[0, 0, 10]} to={[0, 0, 6]} look={[[0, 0, 0], [0, 0, 0]]} fov0={46} fov1={40} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, 0]} s={[6, 4, 0.1]} c="#e8d8a8" e="#fff0c0" ei={0.6} />
    <group position={[-1 + k * 2, 0.4, 0.2]}><Glow position={[0, 0, 0]} size={3.5} color="#ffffff" opacity={0.95} /><Glow position={[1.2, -0.3, 0]} size={1.2} color="#ff9a60" opacity={0.7} /><Glow position={[2.0, -0.5, 0]} size={0.8} color="#7affc0" opacity={0.6} /></group>{post(1.8, 0.35, 0.5)}</Stage>; };
// 21 researcher at desk
S[21] = () => { const f = useCurrentFrame(); const d = dur(21); const t = f / FPS;
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<>{kc(21, 'David Clarke', 38.4, 'Clarke', 300, 70, 39.4)}<PO text="2014" y={236} v="yellow" d={2} size={52} /></>}>
    <ShotCam preset="push" from={[3, 5, 11]} to={[0.5, 3.2, 6]} look={[[0, 0.8, 0], [0, 0.8, 0]]} fov0={50} fov1={40} start={0} end={d} ease="inout" />
    <Desk papers={5} frame={f} /><Man p={[0, -1.6, -4]} clip="idle" rot={0} t={t} i={2} s={1.0} />{post(1.2, 0.5, 0.45)}</Stage>; };
// 22 print on desk, loupe
S[22] = () => { const f = useCurrentFrame(); const d = dur(22);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><PO text="A SIMPLER ANSWER" y={236} v="yellow" d={2} size={44} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.0} a1={-0.7} r0={10} r1={6} h0={6} h1={4} fov0={48} fov1={40} start={0} end={d} ease="inout" />
    <Desk papers={3} frame={f} /><Bx p={[0, 0.4, 0.5]} s={[3, 0.06, 2.2]} c="#f0ead8" r={[0, 0.1, 0]} /><Fig position={[0, 0.45, 0.5]} scale={0.25} glow={0.1} />{post(1.2, 0.5, 0.45)}</Stage>; };
// 23 loupe / tension at the print
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={LAB} fog={[30, 100]} overlay={<><PO text="HIS WIFE" y={236} v="red" d={at(0.6)} size={52} /></>}>
    <ShotCam preset="push" from={[3, 7, 11]} to={[1.4, 4.2, 7.2]} look={[[0, 0.4, 0], [0, 0.8, 0]]} fov0={46} fov1={38} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, 0]} s={[12, 0.5, 6]} c="#2a2a30" /><Bx p={[0, 0.29, 0]} s={[5.4, 0.06, 3.8]} c="#f2eee0" /><Bx p={[0, 0.33, 0]} s={[5, 0.06, 3.4]} c="#6f7f58" /><Bx p={[0, 0.34, -1.1]} s={[5, 0.06, 1.2]} c="#a8b8c4" /><Glow position={[0, 1.4, 0]} size={5} color="#ffe8b0" opacity={0.18} /><Fig position={[0, 0.35, 0]} scale={0.5} glow={0.2} />{post(0.8, 0.65, 0.55)}</Stage>; };
// 24 marsh at dusk, figure waits (tension)
S[24] = () => { const f = useCurrentFrame(); const d = dur(24); const t = f / FPS;
  return <Stage palette={DUSK} fog={[30, 160]} overlay={<><PO text="BACK TURNED" y={236} v="dark" d={at(0.4)} size={48} /></>}>
    <ShotCam preset="push" from={[0, 1.6, 12]} to={[0, 1.8, 6]} look={[[0, 1.8, -3], [0, 1.9, -3]]} fov0={52} fov1={40} start={0} end={d} ease="inout" />
    <Land f={f} mist={0.18} /><Fig position={[0, gz(0, -3), -3]} woman expo={0} scale={1.0} rotation={0} />{post(1.1, 0.5)}</Stage>; };
// 25 REVEAL: orbit behind, it is Annie: dress blows out to white
S[25] = () => { const f = useCurrentFrame(); const d = dur(25); const k = clamp01(f / (d * 0.5));
  return <Stage palette={GOLD} fog={[30, 200]} overlay={<><CFlash at={[2]} k={0.9} color="#ffffff" len={10} />{kc(25, 'Annie', 44.8, 'Annie', 330, 130, 46.6)}</>}>
    <ShotCam preset="orbit" target={[0, 1.7, 0]} a0={Math.PI - 0.9} a1={Math.PI + 0.1} r0={7} r1={5} h0={2.0} h1={2.0} fov0={46} fov1={38} start={0} end={d} ease="inout" shake={0.6} shakeFrom={2} shakeLen={12} />
    <Marsh /><Fig position={[0, 0, 0]} woman expo={k} scale={1.0} />{post(1.4 + k, 0.4, 0.4)}</Stage>; };
// 26 overexposure demo
S[26] = () => { const f = useCurrentFrame(); const d = dur(26); const k = clamp01(f / d);
  return <Stage palette={DAY} fog={[30, 200]} overlay={<><PO text="BLUE DRESS" y={236} v="yellow" d={2} size={48} /><PO text="BLOWN OUT TO WHITE" y={316} v="red" d={at(0.9)} size={42} /></>}>
    <ShotCam preset="push" from={[2, 1.8, 7]} to={[0.6, 1.9, 4.4]} look={[[0, 1.8, 0], [0, 1.9, 0]]} fov0={46} fov1={38} start={0} end={d} ease="inout" />
    <Marsh /><Fig position={[-1.4, 0, 0]} woman expo={0} scale={0.9} /><Fig position={[1.4, 0, 0]} woman expo={1} scale={0.9} />{post(1.3 + k * 0.6, 0.4, 0.4)}</Stage>; };
// 27 old Templeton at the archive shelves
S[27] = () => { const f = useCurrentFrame(); const d = dur(27); const t = f / FPS;
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><PO text="JIM TEMPLETON" y={236} v="yellow" d={2} size={46} /><PO text="DIED 2011" y={316} v="dark" d={at(0.9)} size={46} /></>}>
    <ShotCam preset="push" from={[0, 3, 12]} to={[0, 2.6, 8]} look={[[0, 2.4, -1], [0, 2.4, -1]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <group position={[0, 0, -2]}><Shelves /></group><Man p={[0, -0.1, 1]} clip="idle" rot={Math.PI} t={t} i={0} s={1.0} /><Glow position={[0, 4, 3]} size={14} color="#ffe0a8" opacity={0.2} />{post(1.1, 0.5, 0.5)}</Stage>; };
// 28 still insisting: photo on wall
S[28] = () => { const f = useCurrentFrame(); const d = dur(28);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><PO text="STILL INSISTING" y={236} v="red" d={2} size={48} /><PO text="IT WAS REAL" y={316} v="yellow" d={at(0.9)} size={50} /></>}>
    <ShotCam preset="push" from={[1, 3, 9]} to={[0, 3, 4.5]} look={[[0, 3, 0], [0, 3, 0]]} fov0={50} fov1={38} start={0} end={d} ease="inout" />
    <Bx p={[0, 3, 0]} s={[6, 4.6, 0.2]} c="#3a2a1c" /><Bx p={[0, 3, 0.15]} s={[5.2, 3.8, 0.1]} c="#e8e0c8" e="#fff0c0" ei={0.3} /><Fig position={[0.8, 1.6, 0.25]} scale={0.7} glow={0.15} />{post(1.2, 0.5, 0.5)}</Stage>; };
// 29 loop: back to the marsh + end card
S[29] = () => { const f = useCurrentFrame(); const d = dur(29); const t = f / FPS;
  return <Stage palette={DAY} fog={[60, 260]} overlay={<><PO text="SPACEMAN, OR ANNIE?" y={1130} v="red" d={2} size={44} /><EndCard delay={2} sources={['WIKIPEDIA', 'BBC NEWS 2014', 'DAVID CLARKE 2013']} /></>}>
    <ShotCam preset="push" from={[0, 1.9, 9]} to={[0, 1.85, 8.6]} look={[[0, 1.4, 0], [0, 1.6, -4]]} fov0={50} fov1={50} start={0} end={d} ease="inout" />
    <Land f={f} /><Man p={[-0.4, gz(-0.4, 1), 1]} clip="idle" rot={0} t={t} i={2} s={0.5} /><Fig position={[1.0, gz(1, -4), -4]} scale={1.0} />{post(1.2, 0.5)}</Stage>; };

export const Sp = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? SP_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="warm" strength={0.18} /><Finish vignette={0.25} grain={0.07} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
