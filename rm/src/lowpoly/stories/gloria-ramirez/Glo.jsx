// "The Toxic Lady" (Riverside ER, 1994) - low-poly 3D Short. 25 scenes on cues cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, OutlineScope, Person, Particles, FogLayer, Car, Building, Grade, KineticCard, cueLine, clamp01} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy} from '../uvb-76/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const GLO_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.54, 5.25, 8.44, 10.88, 12.7, 15.18, 16.64, 18.84, 21.1, 22.9, 24.02, 26.14, 28.02, 30.58, 32.86, 36.02, 38.32, 40.5, 41.94, 44.06, 46.19, 48.1, 50.33, 52.0];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? GLO_FRAMES) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const ease = (u) => u * u * (3 - 2 * u);

const ER = {top: '#0a1a1c', mid: '#1c4046', hor: '#3a7076', fog: '#12282c', amb: 1.3, hemiSky: '#b0f0e8', hemiGround: '#40504c', hemiI: 1.9, sun: '#d8fff8', sunI: 1.6, sunPos: [3, 9, 6], rim: '#ff4a3a', rimI: 1.4, rimPos: [-6, 3, -6], glow: 0.9};
const NIGHT = {top: '#070d26', mid: '#1c2c5e', hor: '#4a5e96', fog: '#16224a', amb: 1.1, hemiSky: '#9ab0f0', hemiGround: '#34402c', hemiI: 1.8, sun: '#b8c8ff', sunI: 2.0, sunPos: [-14, 30, 12], rim: '#7a98e8', rimI: 1.6, rimPos: [18, 10, -24], glow: 0.9};
const LAB = {...ER, top: '#0a0e18', mid: '#1c2432', hor: '#3a4658', fog: '#10161f', hemiSky: '#a0b8e0', rim: '#7a98e8'};
const SCRUB = [{shirt: '#3a9aa8', pants: '#2a7a88', skin: '#d8a880'}, {shirt: '#58b8a0', pants: '#2a7a70', skin: '#c89870'}, {shirt: '#3a9aa8', pants: '#2a7a88', skin: '#e0b890'}, {shirt: '#e8f0f0', pants: '#4a5a6a', skin: '#d8a880', hair: '#d8d8d8'}];
const PAT = {shirt: '#e8e8f0', pants: '#e8e8f0', skin: '#c89870', hair: '#1b1310'};

const Siren = ({f, y = 3.8, x = 0, z = -3}) => { const on = Math.sin(f * 0.5) > 0; return <><Bx p={[x, y, z]} s={[0.5, 0.25, 0.3]} c="#ff2a20" e="#ff2a20" ei={on ? 3 : 0.4} /><pointLight position={[x, y - 0.4, z + 1]} color="#ff3a2a" intensity={on ? 10 : 2} distance={12} /></>; };
const Room = ({f, children, red = true}) => <>
  <Bx p={[0, -0.05, 0]} s={[14, 0.1, 12]} c="#a8c8c4" /><Bx p={[0, 4.2, 0]} s={[14, 0.2, 12]} c="#d8e8e4" />
  <Bx p={[-7, 2.1, 0]} s={[0.2, 4.2, 12]} c="#7ab8b0" /><Bx p={[7, 2.1, 0]} s={[0.2, 4.2, 12]} c="#7ab8b0" /><Bx p={[0, 2.1, -6]} s={[14, 4.2, 0.2]} c="#8ac8c0" />
  <Bx p={[-3, 2.4, -5.8]} s={[2.4, 1.3, 0.1]} c="#2a4048" /><Bx p={[3.5, 1.4, -5.7]} s={[2.5, 1.0, 0.5]} c="#c8d8d8" />
  <Bx p={[0, 3.9, 0]} s={[6, 0.1, 0.6]} c="#fff8e8" e="#fff8e8" ei={2} />
  <pointLight position={[0, 3.6, 1]} color="#e8fff8" intensity={6} distance={14} />
  {red && <Siren f={f} />}{children}</>;
const Gurney = ({p = [0, 0, 0], sheen = 0}) => <group position={p}><Bx p={[0, 0.8, 0]} s={[1.0, 0.12, 2.3]} c="#d8e0e0" />{[[-0.4, -1], [0.4, -1], [-0.4, 1], [0.4, 1]].map(([x, z], i) => <Bx key={i} p={[x, 0.35, z]} s={[0.08, 0.7, 0.08]} c="#8a9aa0" />)}
  <OutlineScope thickness={0.02}><Person position={[0, 0.95, 0]} rotation={0} scale={0.8} pose="lie" {...PAT} /></OutlineScope>
  {sheen > 0 && <><pointLight position={[0, 1.9, 0.4]} color="#ffe070" intensity={sheen * 2.5} distance={4} />{[[-0.2, -0.5], [0.15, -0.2], [-0.1, 0.2], [0.2, 0.5], [0, 0.8], [-0.25, 0.9]].map(([x, z], i) => <Bx key={i} p={[x, 1.3, z]} s={[0.12, 0.02, 0.12]} c="#fff0a0" e="#ffe070" ei={sheen * 0.8} />)}</>}</group>;
const Staff = ({f, list}) => <>{list.map(([x, z, k, pose, t], i) => <OutlineScope key={i} thickness={0.02}><Person position={[x, 0, z]} rotation={Math.PI * (z < 0 ? 0 : 1) * 0.3} scale={0.85} pose={pose || 'stand'} fallT={t || 0} phase={f / 3 + i} {...SCRUB[k % 4]} /></OutlineScope>)}</>;
const Tube = ({f, glow = 1.6}) => <group position={[0, 1.3, 0]} rotation={[0, 0, 0.5]}><Cy p={[0, 0, 0]} a={[0.18, 0.18, 1.6, 10]} c="#a8b8bc" /><Cy p={[0, -0.3, 0]} a={[0.14, 0.14, 0.9, 10]} c="#b01820" />
  {Array.from({length: 22}).map((_, i) => <Bx key={i} p={[Math.sin(i * 2.1) * 0.09, -0.2 + (i % 7) * 0.1, 0.1 + Math.cos(i) * 0.04]} s={[0.07, 0.07, 0.07]} c="#ffe040" e="#ffe040" ei={glow + Math.sin(f * 0.3 + i) * 0.5} r={[i, i * 2, 0]} />)}</group>;
const Lot = ({f, children}) => <>
  <Bx p={[0, -0.05, 6]} s={[80, 0.1, 60]} c="#3a3e48" />{[-9, -6, -3, 0, 3, 6, 9].map((x) => <Bx key={x} p={[x, 0.02, 10]} s={[0.1, 0.02, 4]} c="#e8e8e8" />)}
  <Building position={[0, 0, -8]} w={16} d={5} h={3.2} roof={0.4} color="#c8c4b8" roofColor="#7a7a82" lit={1} litSeed={3} door scale={1.4} frame={f} glow={1} />
  <Bx p={[0, 1.2, -4.9]} s={[2.4, 0.4, 0.2]} c="#d02a20" e="#ff3a2a" ei={Math.sin(f * 0.4) > 0 ? 2.6 : 0.5} />
  <Car position={[-9, 0, 12]} rotation={0.4} dist={0} color="#a8a8b0" cabin="#8aa0b8" /><Car position={[8, 0, 13]} rotation={-0.3} dist={0} color="#3a4a70" cabin="#8aa0b8" />
  <Car position={[5, 0, 4]} rotation={Math.PI / 2} dist={0} color="#f0f0f0" cabin="#8aa0b8" /><Bx p={[5, 2.0, 4]} s={[0.5, 0.15, 0.3]} c="#ff2a20" e="#ff2a20" ei={Math.sin(f * 0.8) > 0 ? 3 : 0.3} />
  {children}<FogLayer y={0.4} size={90} layers={3} thickness={1.0} color="#4a5a7a" opacity={0.1} frame={f} /></>;
const Crowd = ({f, fall = 0}) => <>{[[-3, 6], [-1.4, 7], [0.2, 5.6], [1.8, 7.2], [3.2, 6], [-2.2, 4.4]].map(([x, z], i) => <OutlineScope key={i} thickness={0.02}><Person position={[x, 0, z]} rotation={Math.PI + Math.sin(i)} scale={0.85} pose={i === 1 && fall ? 'fall' : 'stand'} fallT={fall} phase={f / 3 + i} {...SCRUB[i % 4]} /></OutlineScope>)}</>;
const Mol = ({f, p = [0, 2, 0], n = 8, c = '#40e0c0', s = 1}) => <group position={p} rotation={[0, f * 0.03, 0]} scale={s}>{Array.from({length: n}).map((_, i) => <Bx key={i} p={[Math.sin(i * 2.4) * 1.1, Math.cos(i * 1.7) * 0.8, Math.cos(i * 2.4) * 1.1]} s={[0.4, 0.4, 0.4]} c={i % 3 ? c : '#ffe040'} e={c} ei={1.2} r={[i, i, 0]} />)}</group>;
const P = {bloom: 1.2, threshold: 0.45, vignette: 0.35};
const Cam = (o) => <ShotCam {...o} />;

const S = [];
const room = (i, o) => { const {txt, from, acc, card, pill, pv, cam, kids, extra, red = true, flash, y = 300, size = 100, hide, pal = ER, glow = 0} = o;
  S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
    return <Stage palette={pal} fog={[30, 90]} overlay={<>{txt && kc(i, txt, from, acc, y, size, hide)}{pill && <Pill text={pill} y={236} variant={pv || 'yellow'} delay={at(0.3)} size={38} />}{flash && <CFlash at={flash} k={0.5} color="#fff0e0" />}{card}</>}>
      <Cam start={0} end={d} ease="inout" {...cam} /><Room f={f} red={red}><Gurney sheen={glow} />{kids && kids(f, d)}{extra && extra(f, d)}</Room><Post {...P} /></Stage>; }; };

// 0 hook: gurney, red light
room(0, {txt: 'Thirty-five minutes.', from: 0, acc: 'Thirty-five', pill: '35 MINUTES · 1 DYING WOMAN', pv: 'red', size: 104, hide: 2.4, glow: 2.6, cam: {preset: 'push', from: [0.8, 1.6, 5.2], to: [0.3, 2.4, 3.2], look: [[0, 1.1, 0], [0, 1.1, 0]], fov0: 52, fov1: 44},
  kids: (f) => <><Staff f={f} list={[[-2.2, 0.5, 0], [2.2, -0.6, 1]]} /><Particles kind="motes" center={[0, 1.6, 0]} area={[3, 2, 3]} count={40} frame={f} color="#c8ff60" size={0.09} opacity={0.6} speed={0.5} /></>});
// 1 twenty-three workers
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={ER} fog={[30, 90]} overlay={<>{kc(1, 'Twenty-three hospital workers', 2.54, 'Twenty-three', 300, 80, 5.0)}<Pill text="23 WORKERS FELL ILL" y={236} variant="red" delay={at(0.3)} size={40} /></>}>
    <Cam preset="push" from={[0, 3.2, 6.6]} to={[0, 2.7, 4.0]} look={[[0, 1, 0], [0, 1, 0]]} fov0={58} fov1={52} start={0} end={d} ease="inout" />
    <Room f={f}>{Array.from({length: 23}).map((_, i) => <OutlineScope key={i} thickness={0.02}><Person position={[-5 + (i % 8) * 1.4, 0, -2 + Math.floor(i / 8) * 2]} rotation={Math.PI} scale={0.8} pose={i % 3 === 0 ? 'fall' : 'stand'} fallT={clamp01((f - i * 2) / 12)} {...SCRUB[i % 4]} /></OutlineScope>)}</Room><Post {...P} /></Stage>; };
// 2 Riverside: city / hospital exterior
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return <Stage palette={NIGHT} fog={[40, 140]} overlay={<>{kc(2, 'Riverside, California, 1994.', 5.25, 'Riverside,', 300, 84, 8.0)}<Pill text="RIVERSIDE · CALIFORNIA · 1994" y={236} variant="yellow" delay={at(0.3)} size={36} /></>}>
    <Cam preset="crane" target={[0, 2, -4]} h0={1.5} h1={9} r0={22} r1={26} angle={0.2} lookY0={2} lookY1={2.4} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Lot f={f} /><Post {...P} /></Stage>; };
// 3 Gloria rushed in: ambulance, gurney across lot
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const u = ease(clamp01(f / d));
  return <Stage palette={NIGHT} fog={[40, 140]} overlay={<>{kc(3, 'Gloria Ramirez, thirty-one,', 8.44, 'Gloria', 300, 84, 10.8)}<Pill text="GLORIA RAMIREZ · AGE 31" y={236} variant="yellow" delay={at(0.3)} size={38} /></>}>
    <Cam preset="push" from={[-6, 1.8, 14]} to={[-2, 1.8, 10]} look={[[0, 1, 3], [0, 1, -2]]} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <Lot f={f}><group position={[0, 0, 4 - u * 8]}><Gurney /></group>{[[-1.4, 4 - u * 8, 0], [1.4, 4 - u * 8, 1]].map(([x, z, k], i) => <OutlineScope key={i} thickness={0.02}><Person position={[x, 0, z]} rotation={Math.PI} scale={0.85} pose="walk" phase={f / 2} {...SCRUB[k]} /></OutlineScope>)}</Lot><Post {...P} /></Stage>; };
// 4 cancer: IV bag, monitor
room(4, {txt: 'with late-stage cancer.', from: 10.88, acc: 'cancer.', pill: 'LATE-STAGE CANCER', pv: 'dark', y: 300, size: 90, hide: 12.6, cam: {preset: 'push', from: [-3, 2.6, 4], to: [-0.8, 1.8, 2.2], look: [[0, 1.2, 0], [0, 1.2, 0]], fov0: 50, fov1: 42},
  extra: () => <><Bx p={[-1.1, 2.2, -0.4]} s={[0.05, 1.8, 0.05]} c="#8a9aa0" /><Bx p={[-1.1, 2.9, -0.4]} s={[0.35, 0.5, 0.12]} c="#e8f4ff" e="#a0d8ff" ei={0.6} /><Bx p={[1.6, 1.4, -0.6]} s={[0.8, 0.6, 0.4]} c="#16282c" /><Bx p={[1.6, 1.55, -0.38]} s={[0.6, 0.3, 0.02]} c="#40ff90" e="#40ff90" ei={2} /></>});
// 5 oily sheen
room(5, {txt: 'Nurses see an oily sheen', from: 12.7, acc: 'oily', pill: 'OILY SHEEN · GARLIC SMELL', pv: 'yellow', size: 80, hide: 15.0, glow: 3, cam: {preset: 'push', from: [0.8, 2.8, 3.4], to: [0.3, 2.3, 2.0], look: [[0, 1.2, 0], [0, 1.2, 0]], fov0: 46, fov1: 40}, kids: (f) => <Staff f={f} list={[[-1.4, 0.8, 0], [1.4, 0.6, 2]]} />});
// 6 smell garlic: green fumes
room(6, {txt: 'smell garlic.', from: 15.18, acc: 'garlic.', pill: 'SMELL OF GARLIC', pv: 'red', size: 110, hide: 16.6, flash: [at(0.2)], cam: {preset: 'push', from: [-2, 2.2, 3.4], to: [0.6, 2.0, 1.6], look: [[0, 1.4, 0], [0, 1.4, 0]], fov0: 48, fov1: 38},
  extra: (f) => <Particles kind="motes" center={[0, 1.6, 0]} area={[3, 2, 3]} count={50} frame={f} color="#c8ff60" size={0.1} opacity={0.7} speed={0.6} />});
// 7 blood tube crystals
S[7] = () => { const f = useCurrentFrame(); const d = dur(7);
  return <Stage palette={LAB} fog={[12, 40]} overlay={<>{kc(7, 'yellow crystals.', 17.2, 'crystals.', 300, 100, 18.7)}<Pill text="YELLOW CRYSTALS IN HER BLOOD" y={236} variant="yellow" delay={at(0.3)} size={34} /><CFlash at={[at(0.9)]} k={0.4} color="#fff0a0" /></>}>
    <Cam preset="push" from={[1.6, 1.8, 2.4]} to={[0.9, 1.5, 1.8]} look={[[0, 1.3, 0], [0, 1.3, 0]]} fov0={50} fov1={38} start={0} end={d} ease="inout" />
    <Bx p={[0, 0.7, 0]} s={[6, 0.1, 4]} c="#2a3a44" /><Tube f={f} /><pointLight position={[0, 1.6, 1]} color="#ffe060" intensity={3.5} distance={6} /><Post bloom={1.0} threshold={0.65} vignette={0.4} /></Stage>; };
// 8 nurse faints then doctor
room(8, {txt: 'A nurse faints.', from: 18.84, acc: 'faints.', pill: 'NURSE FAINTS · THEN A DOCTOR', pv: 'red', size: 100, hide: 20.4, flash: [at(0.5), at(1.6)], cam: {preset: 'push', from: [-4, 2.4, 5], to: [-1, 1.8, 3], look: [[0, 1, 0], [0, 1, 0]], fov0: 54, fov1: 46},
  kids: (f) => <Staff f={f} list={[[-1.6, 1.2, 0, 'fall', clamp01((f - 15) / 14)], [1.7, 0.8, 3, 'fall', clamp01((f - 48) / 14)], [0, -1.6, 1]]} />});
// 9 evacuated: crowd runs to lot
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const u = ease(clamp01(f / d));
  return <Stage palette={NIGHT} fog={[40, 140]} overlay={<>{kc(9, 'The room is evacuated.', 21.1, 'evacuated.', 300, 84, 22.8)}<Pill text="ER EVACUATED" y={236} variant="red" delay={at(0.2)} size={42} /></>}>
    <Cam preset="push" from={[0, 2.4, 16]} to={[2, 2.6, 13]} look={[[0, 1, 4], [0, 1, 4]]} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Lot f={f}>{[0, 1, 2, 3, 4, 5].map((i) => <OutlineScope key={i} thickness={0.02}><Person position={[-4 + i * 1.6, 0, -3 + u * 9 + (i % 2)]} rotation={0} scale={0.85} pose="walk" phase={f / 1.6 + i} {...SCRUB[i % 4]} /></OutlineScope>)}</Lot><Post {...P} /></Stage>; };
// 10 Ramirez dies: heart monitor flatline
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={LAB} fog={[12, 40]} overlay={<>{kc(10, 'Ramirez dies.', 22.9, 'dies.', 300, 110, 24.0)}<Pill text="RAMIREZ DIES" y={236} variant="red" delay={at(0.2)} size={44} /><CFlash at={[at(0.7)]} k={0.5} color="#ffffff" /></>}>
    <Cam preset="push" from={[0, 1.6, 3]} to={[0, 1.5, 1.6]} look={[[0, 1.2, 0], [0, 1.2, 0]]} fov0={46} fov1={36} start={0} end={d} ease="inout" />
    <Bx p={[0, 1.2, 0]} s={[2.4, 1.4, 0.2]} c="#10181c" /><Bx p={[0, 1.2, 0.12]} s={[2.1, 1.1, 0.02]} c="#06140c" />
    {Array.from({length: 30}).map((_, i) => <Bx key={i} p={[-1 + i * 0.07, 1.2 + (f < at(0.7) ? Math.sin(i * 0.9 + f * 0.4) * 0.3 * (i % 5 === 0 ? 2 : 0.4) : 0), 0.14]} s={[0.06, 0.04, 0.02]} c="#40ff80" e="#40ff80" ei={2.4} />)}
    <pointLight position={[0, 1.4, 1.2]} color="#40ff80" intensity={4} distance={5} /><Post bloom={1.5} threshold={0.4} vignette={0.45} /></Stage>; };
// 11 five hospitalized
room(11, {txt: 'Five staff are hospitalized.', from: 24.02, acc: 'Five', pill: '5 STAFF HOSPITALIZED', pv: 'red', size: 78, hide: 26.0, cam: {preset: 'push', from: [-4, 3.6, 6], to: [0, 3.0, 3.8], look: [[0, 0.6, 0], [0, 0.6, 0]], fov0: 56, fov1: 48},
  kids: (f) => <>{[0, 1, 2, 3, 4].map((i) => <group key={i} position={[-3 + i * 1.5, 0, 1.5]}><Bx p={[0, 0.55, 0]} s={[0.9, 0.1, 2]} c="#d8e0e0" /><OutlineScope thickness={0.02}><Person position={[0, 0.65, 0]} scale={0.7} pose="lie" {...SCRUB[i % 4]} /></OutlineScope></group>)}</>});
// 12 strange part: question marks over room
room(12, {txt: 'the strange part.', from: 26.5, acc: 'strange', pill: 'THE STRANGE PART', pv: 'yellow', size: 92, hide: 28.0, y: 300, cam: {preset: 'push', from: [4, 2.2, 6], to: [1.5, 1.8, 3], look: [[0, 1, 0], [0, 1, 0]], fov0: 54, fov1: 44}, flash: [at(0.4)]});
// 13 autopsy: no toxin
room(13, {txt: 'autopsy finds no outside toxin.', from: 28.02, acc: 'no', pill: 'AUTOPSY · NO OUTSIDE TOXIN', pv: 'dark', size: 70, hide: 30.4, red: false, pal: LAB, cam: {preset: 'push', from: [-3, 3.4, 4], to: [-0.6, 2.8, 2], look: [[0, 0.9, 0], [0, 0.9, 0]], fov0: 52, fov1: 42},
  extra: () => <><Bx p={[0, 3.0, 0]} s={[1.4, 0.1, 1.4]} c="#fff8e8" e="#fff8e8" ei={2.5} /><pointLight position={[0, 2.7, 0]} color="#fff8e8" intensity={10} distance={8} /></>});
// 14 hysteria
room(14, {txt: 'The state blames mass hysteria.', from: 30.58, acc: 'hysteria.', pill: 'STATE: MASS HYSTERIA', pv: 'red', size: 68, hide: 32.7, cam: {preset: 'push', from: [0, 3, 7], to: [0, 2.2, 4.5], look: [[0, 1.2, 0], [0, 1.2, 0]], fov0: 54, fov1: 46},
  kids: (f) => <Staff f={f} list={[[-2.4, 1, 0], [2.4, 1, 1], [-1.2, 2.2, 2], [1.2, 2.2, 3]]} />});
// 15 Livermore lab photo
S[15] = () => { const f = useCurrentFrame(); const d = dur(15);
  return <Stage palette={LAB} fog={[20, 70]} overlay={<><PhotoCard src="gloria/IMG3.jpg" credit="Livermore lab · Wikimedia Commons · CC0" tag="LIVERMORE SCIENTISTS" delay={at(0.2)} dur={d} rot={-2} zoom={[1.02, 1.12]} pan={[0, -14]} />{kc(15, 'chain reaction:', 34.6, 'chain', 300, 84, 36.0)}</>}>
    <Cam preset="push" from={[0, 2, 8]} to={[0, 2, 6]} look={[[0, 1, 0], [0, 1, 0]]} fov0={50} fov1={46} start={0} end={d} ease="inout" /><Bx p={[0, 0, 0]} s={[1, 1, 1]} c="#10181c" /></Stage>; };
// 16 DMSO photo
S[16] = () => { const f = useCurrentFrame(); const d = dur(16);
  return <Stage palette={LAB} fog={[20, 70]} overlay={<><PhotoCard src="gloria/IMG1.png" credit="DMSO model · Wikimedia Commons · public domain" tag="DMSO · HER PAIN REMEDY" delay={at(0.2)} dur={d} rot={2} zoom={[1.0, 1.1]} pan={[0, -10]} />{kc(16, 'DMSO,', 36.4, 'DMSO,', 300, 110, 38.2)}</>}>
    <Cam preset="push" from={[0, 2, 8]} to={[0, 2, 6]} look={[[0, 1, 0], [0, 1, 0]]} fov0={50} fov1={46} start={0} end={d} ease="inout" /><Mol f={f} /></Stage>; };
// 17 dimethyl sulfate
S[17] = () => { const f = useCurrentFrame(); const d = dur(17);
  return <Stage palette={LAB} fog={[20, 70]} overlay={<><PhotoCard src="gloria/IMG2.png" credit="Dimethyl sulfate model · Wikimedia Commons · CC0" tag="DIMETHYL SULFATE · TOXIC" delay={at(0.2)} dur={d} rot={-2} zoom={[1.0, 1.1]} pan={[0, -10]} />{kc(17, 'toxic dimethyl sulfate.', 38.32, 'toxic', 300, 84, 40.3)}<CFlash at={[at(0.9)]} k={0.4} color="#c8ff60" /></>}>
    <Cam preset="push" from={[0, 2, 8]} to={[0, 2, 6]} look={[[0, 1, 0], [0, 1, 0]]} fov0={50} fov1={46} start={0} end={d} ease="inout" /><Mol f={f} c="#ff4a3a" n={10} /></Stage>; };
// 18 REVEAL never detected
S[18] = () => { const f = useCurrentFrame(); const d = dur(18);
  return <Stage palette={LAB} fog={[12, 40]} overlay={<>{kc(18, 'never detected it.', 40.54, 'never', 300, 104, 42.0)}<Pill text="NEVER DETECTED" y={236} variant="red" delay={at(0.1)} size={46} /><CFlash at={[at(0.05)]} k={0.7} color="#ffffff" /></>}>
    <Cam preset="push" from={[1, 1.8, 3]} to={[0.8, 1.5, 2.0]} look={[[0, 1.3, 0], [0, 1.3, 0]]} fov0={50} fov1={38} start={0} end={d} ease="inout" shake={0.12} shakeFrom={0} shakeLen={14} />
    <Bx p={[0, 0.7, 0]} s={[6, 0.1, 4]} c="#2a3a44" /><Tube f={f} glow={0.3} /><pointLight position={[0, 1.6, 1]} color="#ff4a3a" intensity={3} distance={6} /><Post bloom={0.9} threshold={0.65} vignette={0.45} /></Stage>; };
// 19 oxygen + defibrillator shocks
room(19, {txt: 'defibrillator shocks,', from: 42.4, acc: 'defibrillator', pill: 'OXYGEN + DEFIBRILLATOR SHOCKS', pv: 'yellow', size: 74, hide: 43.9, flash: [at(0.5), at(0.9), at(1.3)], cam: {preset: 'push', from: [-2.4, 2.6, 3.6], to: [-0.4, 2.0, 2], look: [[0, 1.2, 0], [0, 1.2, 0]], fov0: 52, fov1: 40},
  extra: (f) => <><Bx p={[-0.9, 1.6, 0.8]} s={[0.4, 0.3, 0.1]} c="#ffe040" e="#ffe040" ei={Math.sin(f * 1.6) > 0 ? 3 : 0.5} /><Bx p={[0.9, 1.6, 0.8]} s={[0.4, 0.3, 0.1]} c="#ffe040" e="#ffe040" ei={Math.sin(f * 1.6) > 0 ? 3 : 0.5} /></>});
// 20 may have set it off: green cloud
room(20, {txt: 'may have set it off.', from: 44.7, acc: 'set', pill: 'MAY HAVE SET IT OFF', pv: 'red', size: 84, hide: 46.1, cam: {preset: 'push', from: [0, 2.6, 5], to: [0, 2.2, 2.4], look: [[0, 1.2, 0], [0, 1.2, 0]], fov0: 54, fov1: 44},
  extra: (f) => <Particles kind="motes" center={[0, 1.6, 0]} area={[5, 3, 5]} count={90} frame={f} color="#c8ff60" size={0.14} opacity={0.75} speed={0.8} />});
// 21 doctor in ICU
room(21, {txt: 'two weeks in intensive care', from: 46.8, acc: 'intensive', pill: 'TWO WEEKS IN INTENSIVE CARE', pv: 'yellow', size: 60, hide: 48.0, red: false, cam: {preset: 'push', from: [4, 2.8, 5], to: [1.6, 2.2, 2.6], look: [[0, 1, 0], [0, 1, 0]], fov0: 52, fov1: 42},
  extra: (f) => <><Bx p={[1.6, 0.8, 0.4]} s={[1, 0.12, 2.3]} c="#d8e0e0" /><OutlineScope thickness={0.02}><Person position={[1.6, 0.95, 0.4]} scale={0.8} pose="lie" {...SCRUB[3]} /></OutlineScope></>});
// 22 it was real
room(22, {txt: 'it was real.', from: 49.0, acc: 'real.', pill: 'HE SAYS IT WAS REAL', pv: 'red', size: 92, hide: 50.2, cam: {preset: 'push', from: [0, 2, 4], to: [0, 1.9, 2.2], look: [[0, 1.5, 0], [0, 1.5, 0]], fov0: 46, fov1: 36}, flash: [at(0.3)],
  kids: (f) => <Staff f={f} list={[[-1.7, 1.0, 3], [1.7, 0.9, 1]]} />});
// 23 question
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={ER} fog={[30, 90]} overlay={<><Pill text="CHEMISTRY OR FEAR?" y={236} variant="yellow" delay={at(0.3)} size={44} />{kc(23, 'poisoned that room?', 50.5, 'poisoned', 300, 84, 52.0)}</>}>
    <Cam preset="crane" target={[0, 1.4, 0]} h0={1.6} h1={3.4} r0={7} r1={9.5} angle={0.2} lookY0={1.4} lookY1={1.2} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Room f={f}><Gurney /><Staff f={f} list={[[-1.8, 0.5, 0], [1.8, -0.6, 1]]} /></Room><Post {...P} /></Stage>; };
// 24 loop to opening
S[24] = () => { const f = useCurrentFrame(); const d = dur(24);
  return <Stage palette={ER} fog={[30, 90]} overlay={<><Pill text="TELL ME BELOW" y={1130} variant="red" delay={at(0.4)} size={46} /><EndCard delay={at(1.0)} sources={['WIKIPEDIA', 'LA TIMES']} /></>}>
    <Cam preset="push" from={[0, 3.4, 9]} to={[0, 1.6, 6]} look={[[0, 1.2, 0], [0, 1.2, 0]]} fov0={52} fov1={56} start={0} end={d} ease="inout" />
    <Room f={f}><Gurney /></Room><Post {...P} /></Stage>; };

export const Glo = () => <AbsoluteFill style={{background: '#000'}}>
  <FontFaces /><Fonts2 />
  {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? GLO_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
  <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
  <WordCaption words={W} y={1310} />
</AbsoluteFill>;
