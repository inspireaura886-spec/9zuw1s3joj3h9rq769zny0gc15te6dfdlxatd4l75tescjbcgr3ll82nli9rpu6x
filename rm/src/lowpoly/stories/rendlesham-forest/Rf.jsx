// "Britain's Roswell" (Rendlesham Forest, Dec 1980) - low-poly 3D Short, kit + Rigged airmen. 25 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, Shockwave, FogLayer, Rigged, Glow, Stars, LightCone,
  Grade, KineticCard, cueLine, clamp01, usePreload, Cow} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Land, Pines, Craft, Dents, Gate, Recorder, Meter, Scope, Lighthouse, Holes, Archive, Beam, Meteor, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const RF_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.5, 5.8, 8.2, 11.7, 13.6, 14.9, 17.2, 18.7, 21.1, 22.8, 24.4, 26.1, 28.5, 31.8, 34.4, 37.8, 39.7, 42.3, 44.8, 46.5, 48.7, 50.8, 52.6, 55.1];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? RF_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

const NIGHT = {top: '#050a16', mid: '#10243a', hor: '#3a6078', fog: '#0e2030', amb: 1.0, hemiSky: '#8ab8e0', hemiGround: '#1a261c', hemiI: 1.8, sun: '#b8d0ff', sunI: 1.5, sunPos: [-20, 30, 10], rim: '#ff4a3a', rimI: 1.0, rimPos: [0, 8, -30], glow: 1};
const GLARE = {...NIGHT, top: '#0a1220', mid: '#2a3c52', hor: '#9ab8d0', fog: '#1c2c3c', hemiI: 2.0, rim: '#ffffff', rimI: 1.5};
const REDSKY = {...NIGHT, mid: '#2a1418', hor: '#8a2a20', fog: '#2a1418', hemiSky: '#c88a80', rim: '#ff3a2a', rimI: 1.6};
const DAWN = {top: '#3a4a6a', mid: '#9a7a7a', hor: '#ffc890', fog: '#7a6a6a', amb: 1.0, hemiSky: '#ffe0c0', hemiGround: '#3a3a30', hemiI: 1.8, sun: '#ffd0a0', sunI: 1.8, sunPos: [-30, 10, -30], rim: '#ffa070', rimI: 1.0, rimPos: [20, 10, 10], glow: 0.7};
const OFFICE = {top: '#14100c', mid: '#2a2018', hor: '#4a3626', fog: '#1c1612', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 1.9, sun: '#ffe0b0', sunI: 1.7, sunPos: [10, 20, 20], rim: '#6aa0ff', rimI: 0.8, rimPos: [-20, 8, -20], glow: 1};
const SCOPEP = {top: '#04100a', mid: '#0a2014', hor: '#164028', fog: '#08180e', amb: 1.0, hemiSky: '#8affb0', hemiGround: '#102418', hemiI: 1.8, sun: '#aaffc8', sunI: 1.2, sunPos: [0, 20, 15], rim: '#2aff6a', rimI: 0.9, rimPos: [-10, 8, -10], glow: 1};

const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 130, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const CZ = -14; const GH = height(0, CZ); const CP = [0, GH, CZ];
const Wood = ({f, trees = 110, mist = 0.14, seed = 7, cr = 7}) => <><Stars count={260} radius={170} /><Land /><Pines count={trees} frame={f} seed={seed} cr={cr} cz={CZ} />
  <FogLayer y={0.6} size={120} layers={3} thickness={1.2} color="#7aa4c0" opacity={mist} frame={f} center={[0, -30]} /></>;
const Fall = ({f, start, x, z, h0 = 30, color = '#ffffff'}) => { const u = clamp01((f - start) / 24); return u <= 0 || u >= 1 ? null :
  <group>{Array.from({length: 7}, (_, k) => <Glow key={k} position={[x, h0 * (1 - u) + 1 + k * 0.7, z]} size={(2.4 - k * 0.25) * 1.2} color={color} opacity={1 - k * 0.13} />)}</group>; };

const S = [];
// 0 HOOK: craft glowing in a dark clearing, dolly-zoom in
S[0] = () => { const f = useCurrentFrame(); const d = dur(0);
  return <Stage palette={GLARE} fog={[30, 170]} overlay={<><CFlash at={[at(0.1)]} k={0.55} color="#ffffff" />{kc(0, 'A US colonel put it in writing:', 0, 'colonel', 340, 76, 2.4)}<Pill text="OFFICIAL MEMO" y={236} variant="red" delay={3} size={58} /></>}>
    <ShotCam preset="push" from={[0, GH + 1.4, 7]} to={[0, GH + 2.0, 0]} look={[[0, GH + 2.4, CZ], [0, GH + 2.8, CZ]]} fov0={74} fov1={40} start={0} end={d} ease="inout" shake={0.3} shakeFrom={3} shakeLen={14} />
    <Wood f={f} /><Craft position={CP} frame={f} scale={1.5} tilt={0.4} /><LightCone position={[0, GH + 2.2, CZ]} dir={[0, -1, 0.1]} length={7} radius={6} color="#d8ecff" opacity={0.3} frame={f} />
    <Particles kind="motes" center={[0, GH + 3, CZ + 4]} area={[16, 7, 10]} count={40} frame={f} color="#cfe4ff" opacity={0.5} /><Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };
// 1 'a glowing triangle landed': orbit round the craft, shafts
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={GLARE} fog={[30, 170]} overlay={<>{kc(1, 'glowing triangle landed', 2.5, 'triangle', 330, 84, 5.0)}<Pill text="IN A BRITISH FOREST" y={236} variant="yellow" delay={loc(4.4, 1)} size={46} /></>}>
    <ShotCam preset="orbit" target={[0, GH + 2.2, CZ]} a0={0.2} a1={-1.0} r0={15} r1={11} h0={GH + 1.6} h1={GH + 3.4} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Wood f={f} /><Craft position={CP} frame={f} tilt={0.3} /><LightCone position={[0, GH + 2.2, CZ]} dir={[0, -1, 0]} length={7} radius={7} color="#d8ecff" opacity={0.3} frame={f} />
    <Burst kind="sparks" position={[0, GH + 2.8, CZ]} start={2} frame={f} count={40} speed={0.2} up={0.4} spread={1.3} gravity={0.004} life={50} color="#aaccff" />
    <Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };
// 2 December 1980: moonlit Suffolk, pines
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<>{kc(2, 'December 1980.', 5.8, '1980.', 320, 112, 8.0)}<Pill text="SUFFOLK, ENGLAND" y={236} variant="yellow" delay={loc(6.2, 2)} size={46} /></>}>
    <ShotCam preset="crane" target={[0, 4, -30]} h0={2.5} h1={12} r0={24} r1={30} angle={0.2} lookY0={5} lookY1={4} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Wood f={f} trees={150} seed={11} cr={3} mist={0.2} /><Glow position={[28, 24, -80]} size={30} color="#e8f0ff" opacity={0.8} /><mesh position={[28, 24, -79]}><circleGeometry args={[4.5, 20]} /><meshBasicMaterial color="#f4f8ff" toneMapped={false} /></mesh>
    <Post bloom={1.4} threshold={0.4} vignette={0.38} /></Stage>; };
// 3 RAF Woodbridge east gate, two airmen on patrol; lights drop at 10.3
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[30, 160]} overlay={<><Pill text="RAF WOODBRIDGE" y={236} variant="dark" delay={loc(9.0, 3)} size={48} /><Pill text="AIRMEN SEE LIGHTS DROP" y={316} variant="yellow" delay={loc(10.6, 3)} size={40} /><CFlash at={[loc(10.5, 3)]} k={0.4} color="#ffffff" len={8} /></>}>
    <ShotCam preset="push" from={[-5, 2.2, 14]} to={[-2, 2.6, 8]} look={[[0, 3.0, -2], [2, 4.2, -10]]} fov0={56} fov1={48} start={0} end={d} ease="inout" />
    <Stars count={200} radius={140} /><Land /><Pines count={70} frame={f} seed={3} cr={4} cz={-4} /><Gate frame={f} />
    <Man p={[-2.2, 0, 3]} clip="walk" rot={Math.PI} t={t} i={0} s={0.6} /><Man p={[1.6, 0, 4]} clip="idle" rot={Math.PI + 0.3} t={t} i={1} s={0.6} />
    <Fall f={f} start={loc(10.3, 3)} x={7} z={-24} /><Fall f={f} start={loc(10.5, 3)} x={10} z={-28} /><Fall f={f} start={loc(10.7, 3)} x={4} z={-30} />
    <FogLayer y={0.6} size={100} layers={3} thickness={1} color="#7aa4c0" opacity={0.12} frame={f} center={[0, -20]} /><Post bloom={1.4} threshold={0.4} vignette={0.38} /></Stage>; };
// 4 Rendlesham Forest crane, 3 points of light sink in
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<>{kc(4, 'Rendlesham Forest.', 11.7, 'Rendlesham', 320, 96, 13.5)}<CFlash at={[loc(11.9, 4)]} k={0.4} color="#ffffff" len={7} /></>}>
    <ShotCam preset="crane" target={[0, 3, -20]} h0={3} h1={20} r0={22} r1={34} angle={-0.2} lookY0={4} lookY1={1} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Wood f={f} trees={160} seed={5} cr={5} mist={0.18} />
    {[[-5, -12], [2, -18], [8, -14]].map(([x, z], i) => <Fall key={i} f={f} start={2 + i * 6} x={x} z={z} h0={22} color="#ffe8c0" />)}
    <Post bloom={1.5} threshold={0.38} vignette={0.38} /></Stage>; };
// 5 'They walk in': airmen with torches, tracking from behind
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[20, 120]} overlay={<><Pill text="THEY WALK IN" y={236} variant="red" delay={loc(13.8, 5)} size={52} /></>}>
    <ShotCam preset="push" from={[-1, 1.7, 6]} to={[0, 1.9, 1.5]} look={[[0, 1.2, -10], [0, 1.4, -12]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <Wood f={f} trees={150} seed={9} cr={3} /><Man p={[-0.9, GH, 0 - f * 0.012]} clip="walk" rot={Math.PI} t={t} i={0} s={0.6} /><Man p={[1.0, GH, -1 - f * 0.012]} clip="walk" rot={Math.PI} t={t + 0.2} i={2} s={0.6} />
    <Beam position={[-0.5, 1.0, -0.3]} dir={[0.2, -0.1, -1]} length={14} radius={0.7} opacity={0.22} /><Beam position={[1.4, 1.0, -1.3]} dir={[-0.1, -0.1, -1]} length={14} radius={0.7} opacity={0.22} />
    <Glow position={[0, GH + 3, -16]} size={10} color="#ff4a3a" opacity={0.35} /><Post bloom={1.4} threshold={0.4} vignette={0.45} /></Stage>; };
// 6 metallic triangle pulsing red/blue between trees
S[6] = () => { const f = useCurrentFrame(); const d = dur(6);
  return <Stage palette={GLARE} fog={[20, 150]} overlay={<>{kc(6, 'A metallic triangle,', 14.3, 'metallic', 330, 88, 16.0)}<Pill text="PULSING RED" y={236} variant="red" delay={loc(15.5, 6)} size={52} /><Pill text="AND BLUE" y={316} variant="yellow" delay={loc(16.4, 6)} size={52} /><CFlash at={[1]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[-3, GH + 1.6, 2]} to={[-1, GH + 2.0, -4]} look={[[0, GH + 2.2, CZ], [0, GH + 2.4, CZ]]} fov0={58} fov1={44} start={0} end={d} ease="inout" shake={0.4} shakeFrom={0} shakeLen={d} />
    <Wood f={f} trees={160} seed={13} cr={6} /><Craft position={CP} frame={f} tilt={0.35} /><LightCone position={[0, GH + 2.2, CZ]} dir={[0, -1, 0.2]} length={7} radius={6} color="#ffd8d0" opacity={0.25} frame={f} />
    <Post bloom={1.8} threshold={0.33} vignette={0.4} /></Stage>; };
// 7 it slips away: whip, craft glides off between trees
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const u = clamp01(f / d);
  return <Stage palette={GLARE} fog={[20, 150]} overlay={<><Pill text="IT SLIPS AWAY" y={236} variant="dark" delay={loc(17.3, 7)} size={52} /><CFlash at={[loc(17.3, 7)]} k={0.5} color="#ffffff" len={7} /></>}>
    <ShotCam preset="push" from={[2, GH + 1.6, 2]} to={[-2, GH + 2.6, -6]} look={[[0, GH + 2.4, CZ], [-6, GH + 3, CZ - 8]]} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.5} shakeFrom={2} shakeLen={14} />
    <Wood f={f} trees={160} seed={13} cr={6} /><Craft position={[-u * u * 28, GH + u * u * 9, CZ - u * u * 12]} rotation={u * 0.8} tilt={u * 0.3} frame={f} glow={1 - u * 0.4} />
    {Array.from({length: 6}, (_, k) => <Glow key={k} position={[-u * u * 28 + k * 2.2 * u, GH + 2.6 + u * u * 9, CZ - u * u * 12]} size={3.4 - k * 0.4} color="#ff5040" opacity={0.5 * (1 - k / 7) * u} />)}
    <Post bloom={1.8} threshold={0.33} vignette={0.4} /></Stage>; };
// 8 farm animals bolt in a frenzy
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const t = f / FPS;
  return <Stage palette={REDSKY} fog={[20, 150]} overlay={<><Pill text="FARM ANIMALS" y={236} variant="dark" delay={loc(18.8, 8)} size={50} /><Pill text="IN A FRENZY" y={316} variant="red" delay={loc(19.9, 8)} size={56} /><CFlash at={[loc(20.1, 8), loc(20.7, 8)]} k={0.35} color="#ff6040" len={6} /></>}>
    <ShotCam preset="orbit" target={[0, 1, -3]} a0={0.5} a1={-0.6} r0={12} r1={9} h0={3.5} h1={2.4} fov0={54} fov1={46} start={0} end={d} ease="inout" shake={0.5} shakeFrom={0} shakeLen={d} />
    <Stars count={120} radius={150} /><Land /><Pines count={50} frame={f} seed={21} cr={14} cz={-2} />
    <Bx p={[-8, 1.4, -8]} s={[4, 2.8, 5]} c="#7a2c24" /><Bx p={[-8, 3.2, -8]} s={[4.2, 0.5, 5.2]} c="#2a2a2a" /><Bx p={[-5.9, 1.2, -6]} s={[0.06, 0.8, 0.8]} c="#ffd890" basic /><Glow position={[-5.6, 1.4, -6]} size={3} color="#ffc060" opacity={0.7} />
    {[0, 1, 2, 3, 4].map((i) => <Cow key={i} position={[-3 + i * 2 + Math.sin(f * 0.5 + i) * 0.5, 0, -2 + (i % 2) * 2 - ((f * (0.04 + i * 0.01)) % 6)]} rotation={0.6 + i * 1.3 + Math.sin(f * 0.4 + i) * 0.6} scale={0.9} frame={f} graze={0} seed={i} />)}
    <Glow position={[8, GH + 4, -20]} size={9} color="#ff4a3a" opacity={0.5} /><Particles kind="dust" center={[0, 1, -2]} area={[14, 2, 8]} count={46} frame={f} color="#8a7a5a" opacity={0.5} /><Post bloom={1.4} threshold={0.4} vignette={0.42} /></Stage>; };
// 9 dawn: three dents in the ground
S[9] = () => { const f = useCurrentFrame(); const d = dur(9);
  return <Stage palette={DAWN} fog={[30, 160]} overlay={<>{kc(9, 'At dawn: three dents', 21.1, 'dents', 320, 84, 22.7)}<CFlash at={[loc(21.9, 9)]} k={0.4} color="#ffd8a0" len={7} /></>}>
    <ShotCam preset="crane" target={[0, GH, CZ]} h0={2.2} h1={9} r0={9} r1={12} angle={0.5} lookY0={0.3} lookY1={0} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Land /><Pines count={130} frame={f} seed={7} cr={6} cz={CZ} /><Dents position={[0, GH + 0.05, CZ]} scale={1.1} />
    <FogLayer y={0.5} size={100} layers={3} thickness={1} color="#f0d0b0" opacity={0.2} frame={f} center={[0, -14]} /><Post bloom={1.2} threshold={0.5} vignette={0.38} /></Stage>; };
// 10 macro of one dent, 1.5 in deep, ruler
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={DAWN} fog={[10, 80]} overlay={<><Pill text="1.5 INCHES DEEP" y={236} variant="yellow" delay={loc(23.3, 10)} size={50} /><Pill text="WHERE IT STOOD" y={316} variant="red" delay={loc(23.5, 10)} size={46} /></>}>
    <ShotCam preset="push" from={[2.4, 2.0, 3.4]} to={[1.3, 1.2, 1.9]} look={[[0, 0, 0], [0, 0, 0]]} fov0={52} fov1={40} start={0} end={d} ease="inout" />
    <Land /><group position={[0, GH + 0.04, 0]}><Cy p={[0, 0.0, 0]} a={[0.75, 0.6, 0.08, 10]} c="#6a4a24" /><Cy p={[0, 0.02, 0]} a={[0.5, 0.35, 0.1, 10]} c="#1a0e06" />
      <group position={[-1.2, 0.04, 0.1]} rotation={[0, -0.25, 0]}><Bx p={[0, 0, 0]} s={[0.3, 0.04, 1.9]} c="#f0e2a0" />{Array.from({length: 10}, (_, i) => <Bx key={i} p={[0.08, 0.04, -0.85 + i * 0.19]} s={[0.1, 0.02, 0.012]} c="#222" />)}</group></group>
    <Glow position={[0, GH + 0.6, 0]} size={4} color="#ffb060" opacity={0.25} /><Particles kind="dust" center={[0, GH + 1, 0]} area={[3, 1.5, 3]} count={30} frame={f} color="#ffd8a0" opacity={0.6} /><Post bloom={1.2} threshold={0.5} vignette={0.4} /></Stage>; };
// 11 two nights later: Halt in the forest at night
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[20, 120]} overlay={<>{kc(11, 'Two nights later,', 24.4, 'nights', 320, 92, 26.0)}<Pill text="TWO NIGHTS LATER" y={236} variant="dark" delay={loc(24.6, 11)} size={44} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, -2]} a0={0.6} a1={-0.4} r0={8} r1={6} h0={1.6} h1={2.0} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Wood f={f} trees={150} seed={17} cr={4} /><Man p={[0, GH, -2]} clip="walk" rot={Math.PI} t={t} i={3} s={0.85} /><Man p={[2.4, GH, -3]} clip="walk" rot={Math.PI} t={t + 0.3} i={1} s={0.6} />
    <Beam position={[0.3, 1.1, -2.4]} dir={[0, -0.12, -1]} length={14} radius={1.6} opacity={0.3} /><Post bloom={1.4} threshold={0.4} vignette={0.45} /></Stage>; };
// 12 Colonel Charles Halt + tape recorder
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[16, 90]} overlay={<>{kc(12, 'Colonel Charles Halt', 25.3, 'Halt', 320, 84, 26.4)}<Pill text="TAPE RECORDING" y={236} variant="red" delay={loc(27.4, 12)} size={50} />{f % 30 < 18 && f > loc(27.4, 12) && <div style={{position: 'absolute', top: 160, left: 360, width: 36, height: 36, borderRadius: 18, background: '#ff2a2a'}} />}</>}>
    <ShotCam preset="push" from={[-2, 1.5, 4.5]} to={[-0.5, 1.5, 2.2]} look={[[0.3, 1.2, -1], [0.2, 1.2, -1]]} fov0={52} fov1={38} start={0} end={d} ease="inout" />
    <Wood f={f} trees={140} seed={19} cr={3} /><Man p={[0, GH, -1]} clip="interact-right" rot={0} t={t} i={3} s={1.1} /><Recorder position={[0.55, GH + 1.35, 0.1]} frame={f} scale={0.6} />
    <Beam position={[-0.6, 1.2, 0.2]} dir={[-0.3, -0.2, -1]} length={12} radius={1.3} opacity={0.25} /><Glow position={[0, 2, -6]} size={8} color="#ff4a3a" opacity={0.3} /><Post bloom={1.4} threshold={0.4} vignette={0.45} /></Stage>; };
// 13 team scans the dents: meter needle 0.1
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[20, 120]} overlay={<><Pill text="SCANNING FOR RADIATION" y={236} variant="yellow" delay={loc(29.0, 13)} size={42} /><Stamp f={f} at={loc(30.7, 13)} text="0.1 mR" y={1040} color="#ffd93b" size={120} rot={-5} /></>}>
    <ShotCam preset="orbit" target={[0, 0.6, CZ + 5]} a0={-0.5} a1={0.6} r0={8} r1={6} h0={2.4} h1={3.0} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Wood f={f} trees={140} seed={23} cr={7} /><Dents position={[0, GH + 0.05, CZ + 5]} /><Man p={[-1.4, GH, CZ + 7]} clip="interact-right" rot={Math.PI * 0.9} t={t} i={0} s={0.65} /><Man p={[2.6, GH, CZ + 6]} clip="idle" rot={-Math.PI * 0.8} t={t} i={2} s={0.65} />
    <Meter position={[-0.8, GH + 1.0, CZ + 6]} needle={0.1 + 0.55 * clamp01((f - 40) / 20)} scale={1.2} /><Beam position={[2.4, 1.1, CZ + 6.2]} dir={[-0.4, -0.5, -0.4]} length={7} radius={1.0} opacity={0.3} />
    <Glow position={[0, GH + 4, CZ - 2]} size={7} color="#ff4a3a" opacity={0.3} /><Post bloom={1.4} threshold={0.4} vignette={0.45} /></Stage>; };
// 14 red sun-like light through trees; at 32.6 it breaks into five
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const t = f / FPS + CS[14]; const b = clamp01((t - 32.6) / 1.4);
  const pts = [[-9, 7, 0], [-4, 10, 2], [0, 5, 3], [5, 9, 1], [10, 6, -1]];
  return <Stage palette={REDSKY} fog={[20, 170]} overlay={<>{kc(14, 'a red light breaks into five.', 31.9, 'five.', 330, 78, 34.2)}<CFlash at={[loc(32.6, 14)]} k={0.8} color="#ffffff" len={10} /><Pill text="ONE RED LIGHT" y={236} variant="red" delay={loc(31.9, 14)} size={48} /></>}>
    <ShotCam preset="push" from={[0, 1.8, 6]} to={[0, 2.4, 1]} look={[[0, 5, -30], [0, 7, -30]]} fov0={58} fov1={46} start={0} end={d} ease="inout" shake={0.6} shakeFrom={loc(32.6, 14)} shakeLen={16} />
    <Wood f={f} trees={160} seed={29} cr={2} />
    {b === 0 ? <><Glow position={[0, 6, -30]} size={16 + Math.sin(f * 0.3) * 1.5} color="#ff2a18" opacity={0.95} /><Glow position={[0, 6, -30]} size={7} color="#ffd8b0" opacity={0.9} /></>
      : pts.map(([x, y, z], i) => <group key={i}><Glow position={[x * b * 1.6, 6 + (y - 6) * b * 1.5, -30 + z * b]} size={5 - b * 1.6} color="#ffffff" opacity={0.95} /><Glow position={[x * b * 1.6, 6 + (y - 6) * b * 1.5, -30 + z * b]} size={9} color="#9ac0ff" opacity={0.35} /></group>)}
    <Post bloom={1.9} threshold={0.3} vignette={0.4} /></Stage>; };
// 15 memo flies to the MoD: Halt memo archival card
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const p1 = loc(35.0, 15);
  return <Stage palette={OFFICE} fog={[30, 120]} overlay={<><Pill text="MINISTRY OF DEFENCE" y={236} variant="yellow" delay={loc(35.5, 15)} size={46} />{f >= p1 && <PhotoCard src="rendlesham/IMG1.jpg" credit="Halt memo, 13 Jan 1981 (public domain)" tag="THE MEMO" delay={p1} dur={d - p1} />}</>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.0} a1={0.6} r0={12} r1={9} h0={5.5} h1={4.5} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, 0]} s={[12, 0.5, 6]} c="#4a3626" />{[0, 1, 2, 3].map((i) => <Bx key={i} p={[-3.4 + i * 0.3, 0.32 + i * 0.05, 0.4]} s={[2.6, 0.1, 3.4]} c={i % 2 ? '#e8e0cc' : '#d8d0bc'} r={[0, 0.08 * i, 0]} />)}
    <Bx p={[3, 0.5, -1]} s={[1.2, 0.8, 0.9]} c="#2a3a52" /><Glow position={[0, 4, 0]} size={12} color="#ffe0a8" opacity={0.25} />
    <Particles kind="dust" center={[0, 3, 0]} area={[12, 6, 8]} count={36} frame={f} opacity={0.4} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 16 radar shows nothing
S[16] = () => { const f = useCurrentFrame(); const d = dur(16);
  return <Stage palette={SCOPEP} fog={[20, 90]} overlay={<>{kc(16, 'Radar shows nothing.', 37.8, 'nothing.', 330, 88, 39.5)}<Stamp f={f} at={loc(38.6, 16)} text="NOTHING" y={1040} color="#8affa8" size={130} rot={-6} /></>}>
    <ShotCam preset="push" from={[0, 7, 4]} to={[0, 5, 1.2]} look={[[0, 0, 0], [0, 0, 0]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <Scope frame={f} size={3.4} blips={0} /><Glow position={[0, 1, 0]} size={12} color="#2aff6a" opacity={0.28} /><Post bloom={1.6} threshold={0.35} vignette={0.45} /></Stage>; };
// 17 stamp: no defence significance
S[17] = () => { const f = useCurrentFrame(); const d = dur(17);
  return <Stage palette={OFFICE} fog={[30, 120]} overlay={<><Pill text="THE VERDICT" y={236} variant="dark" delay={loc(39.8, 17)} size={48} /><Stamp f={f} at={loc(40.5, 17)} text="NO DEFENCE" y={900} size={110} rot={-6} /><Stamp f={f} at={loc(40.9, 17)} text="SIGNIFICANCE" y={1060} size={100} rot={-6} /><CFlash at={[loc(40.5, 17), loc(40.9, 17)]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[0, 7, 8]} to={[0.5, 4.2, 3]} look={[[0, 0, 0], [0.3, 0, 0]]} fov0={52} fov1={44} start={0} end={d} ease="inout" shake={0.5} shakeFrom={loc(40.5, 17)} shakeLen={12} />
    <Bx p={[0, 0, 0]} s={[12, 0.5, 7]} c="#4a3626" /><Bx p={[0, 0.4, 0]} s={[5, 0.1, 6.5]} c="#e8e0cc" r={[0, 0.1, 0]} />
    {Array.from({length: 12}, (_, i) => <Bx key={i} p={[0, 0.5, -2.6 + i * 0.4]} s={[3.6 - (i % 3) * 0.6, 0.02, 0.1]} c="#6a6a6a" r={[0, 0.1, 0]} />)}<Glow position={[0, 4, 0]} size={12} color="#ffe0a8" opacity={0.25} />
    <Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 18 and that's not the strangest part: dark forest, craft glow far off
S[18] = () => { const f = useCurrentFrame(); const d = dur(18);
  return <Stage palette={NIGHT} fog={[20, 150]} overlay={<>{kc(18, "that's not the strangest part.", 42.3, 'strangest', 330, 72, 44.6)}<CFlash at={[loc(42.4, 18)]} k={0.5} color="#d8e8ff" len={9} /></>}>
    <ShotCam preset="push" from={[0, 1.6, 12]} to={[0, 2.0, 3]} look={[[0, 3, -30], [0, 3.5, -30]]} fov0={60} fov1={42} start={0} end={d} ease="inout" shake={0.5} shakeFrom={2} shakeLen={d} />
    <Wood f={f} trees={170} seed={31} cr={2} /><Glow position={[0, 4, -30]} size={12 + Math.sin(f * 0.3) * 2} color="#ff5040" opacity={0.6} />
    <Post bloom={1.6} threshold={0.38} vignette={0.45} /></Stage>; };
// 19 skeptics: fireball streaks over the forest
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const u = clamp01(f / (d * 0.8));
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<><Pill text="SKEPTIC #1" y={236} variant="dark" delay={loc(44.9, 19)} size={44} /><Pill text="A FIREBALL" y={316} variant="yellow" delay={loc(45.6, 19)} size={56} /><CFlash at={[loc(45.2, 19)]} k={0.5} color="#fff0d0" len={8} /></>}>
    <ShotCam preset="push" from={[0, 1.8, 14]} to={[0, 2.4, 8]} look={[[0, 12, -40], [-6, 8, -40]]} fov0={62} fov1={54} start={0} end={d} ease="inout" />
    <Wood f={f} trees={140} seed={37} cr={3} /><Meteor position={[22 - u * 44, 22 - u * 16, -40]} dir={[1, -0.35, 0]} len={16} size={3} color="#ffd8a0" />
    <Post bloom={1.7} threshold={0.35} vignette={0.38} /></Stage>; };
// 20 lighthouse beam + rabbit holes
S[20] = () => { const f = useCurrentFrame(); const d = dur(20);
  return <Stage palette={NIGHT} fog={[30, 230]} overlay={<><Pill text="A LIGHTHOUSE" y={236} variant="yellow" delay={loc(46.6, 20)} size={50} /><Pill text="SWEEPING EVERY 5 SECONDS" y={316} variant="dark" delay={loc(47.0, 20)} size={36} /><Pill text="RABBIT HOLES" y={396} variant="red" delay={loc(47.6, 20)} size={50} /></>}>
    <ShotCam preset="push" from={[1.5, 0.9, 6]} to={[0.6, 0.7, 2.6]} look={[[-6, 6, -40], [-8, 8, -40]]} fov0={58} fov1={46} start={0} end={d} ease="inout" />
    <Wood f={f} trees={90} seed={41} cr={6} cz={-4} /><Lighthouse position={[-18, 0, -48]} frame={f + 25} scale={1.8} /><Holes position={[0, GH + 0.02, 0]} rabbit frame={f} />
    <Post bloom={1.5} threshold={0.38} vignette={0.4} /></Stage>; };
// 21 memo in the archive: shelf with the glowing box
S[21] = () => { const f = useCurrentFrame(); const d = dur(21);
  return <Stage palette={OFFICE} fog={[30, 120]} overlay={<>{kc(21, 'The memo is real,', 48.7, 'real,', 320, 92, 50.6)}<Pill text="STILL ON FILE" y={236} variant="yellow" delay={loc(49.6, 21)} size={48} /></>}>
    <ShotCam preset="push" from={[-2, 3.2, 12]} to={[0.4, 3.0, 6.5]} look={[[0, 2.6, 0], [0.5, 2.8, 0]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <Archive frame={f} /><Particles kind="dust" center={[0, 3, 2]} area={[12, 6, 6]} count={36} frame={f} opacity={0.4} /><Post bloom={1.3} threshold={0.45} vignette={0.45} /></Stage>; };
// 22 National Archives (Kew): pull back to the full stacks
S[22] = () => { const f = useCurrentFrame(); const d = dur(22);
  return <Stage palette={OFFICE} fog={[30, 140]} overlay={<><Pill text="NATIONAL ARCHIVES" y={236} variant="yellow" delay={loc(50.9, 22)} size={46} /><Pill text="KEW, ENGLAND" y={316} variant="dark" delay={loc(51.4, 22)} size={42} /></>}>
    <ShotCam preset="orbit" target={[0, 2.4, 0]} a0={0.3} a1={-0.5} r0={9} r1={14} h0={3.2} h1={5.5} fov0={50} fov1={48} start={0} end={d} ease="inout" />
    <Archive frame={f} /><group position={[0, 0, -8]}><Archive frame={f} /></group><Particles kind="dust" center={[0, 3, 0]} area={[12, 6, 8]} count={36} frame={f} opacity={0.4} /><Post bloom={1.3} threshold={0.45} vignette={0.45} /></Stage>; };
// 23 CRAFT or LIGHTS? split view
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={GLARE} fog={[30, 200]} overlay={<><Pill text="CRAFT?" y={236} variant="red" delay={loc(52.7, 23)} size={64} /><Pill text="LIGHTS?" y={316} variant="yellow" delay={loc(53.7, 23)} size={64} />
    <div style={{position: 'absolute', top: 420, bottom: 560, left: 538, width: 4, background: '#ffffff', opacity: 0.8}} /></>}>
    <ShotCam preset="push" from={[0, 3.2, 14]} to={[0, 3.6, 9]} look={[[0, 3.4, -14], [0, 3.6, -14]]} fov0={62} fov1={56} start={0} end={d} ease="inout" />
    <Wood f={f} trees={140} seed={43} cr={4} /><Craft position={[-4.5, GH, -14]} frame={f} scale={0.9} />
    {[[2, 9, -24], [6.5, 5, -20], [11, 9.5, -26]].map(([x, y, z], i) => <group key={i}><Glow position={[x, y, z]} size={3} color="#ffffff" opacity={0.95} /><Glow position={[x, y, z]} size={5.5} color="#9ac0ff" opacity={0.28} /></group>)}
    <Post bloom={1.7} threshold={0.33} vignette={0.4} /></Stage>; };
// 24 loop: back to the glowing craft + end card
S[24] = () => { const f = useCurrentFrame(); const d = dur(24);
  return <Stage palette={GLARE} fog={[30, 170]} overlay={<>{kc(24, 'Comment CRAFT or LIGHTS.', 55.1, 'CRAFT', 320, 80, 56.9)}<Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(55.5, 24)} size={46} /><EndCard delay={loc(55.2, 24)} sources={['WIKIPEDIA: RENDLESHAM FOREST INCIDENT', 'HALT MEMO, 13 JAN 1981', 'UK NATIONAL ARCHIVES DEFE 24/1948']} /></>}>
    <ShotCam preset="push" from={[0, GH + 1.2, 4]} to={[0, GH + 1.25, 3.95]} look={[[0, GH + 2.4, CZ], [0, GH + 2.8, CZ]]} fov0={74} fov1={74} start={0} end={d} ease="inout" />
    <Wood f={f} /><Craft position={CP} frame={f} scale={1.5} tilt={0.4} /><LightCone position={[0, GH + 2.2, CZ]} dir={[0, -1, 0.1]} length={7} radius={6} color="#d8ecff" opacity={0.3} frame={f} />
    <Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };

export const Rf = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? RF_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
