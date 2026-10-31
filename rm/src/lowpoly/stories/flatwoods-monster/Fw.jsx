// "The Glowing Thing on the Hill" (Flatwoods 1952) - low-poly 3D Short, kit + GitGems Rigged crew. 26 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, Shockwave, FogLayer, Rigged, Glow, Stars, LightCone,
  Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Land, Pines, Figure, Farm, Meteor, Beam, Owl, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const FW_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.2, 4.6, 7.1, 9.5, 11.4, 13.6, 15.9, 18.9, 21.4, 23.9, 26.2, 28.4, 29.8, 31.3, 32.9, 34.8, 36.7, 39.2, 41.2, 43.3, 44.4, 47.0, 48.8, 49.9, 51.6];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? FW_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);
const NIGHT = {top: '#050c14', mid: '#0f2a2a', hor: '#2a5a48', fog: '#0c2a24', amb: 1.0, hemiSky: '#6ac8b0', hemiGround: '#14241a', hemiI: 1.5, sun: '#a8d8ff', sunI: 1.3, sunPos: [-20, 30, 10], rim: '#ff3a2a', rimI: 1.1, rimPos: [0, 8, -30], glow: 1};
const RED = {...NIGHT, mid: '#2a1418', hor: '#8a2a20', fog: '#2a1014', rimI: 1.6, hemiSky: '#c07a70'};
const BARN = {top: '#120e0c', mid: '#2a2018', hor: '#4a3626', fog: '#1c1612', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 1.7, sun: '#ffe0b0', sunI: 1.6, sunPos: [10, 20, 20], rim: '#6aa0ff', rimI: 0.8, rimPos: [-20, 8, -20], glow: 1};
const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 130, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const Sky = ({f, trees = 110, mist = 0.14, palette}) => <><Stars count={300} radius={170} /><Land /><Pines count={trees} frame={f} />
  <FogLayer y={0.6} size={120} layers={3} thickness={1.2} color="#7ab8a8" opacity={mist} frame={f} center={[0, -30]} /></>;
const HILL = [0, height(0, -24) , -24];
const CREST = [0, height(0, -24) + 0.2, -24];

const S = [];
// 0 hook: figure on crest, low dolly zoom
S[0] = () => { const f = useCurrentFrame(); const d = dur(0);
  return <Stage palette={RED} fog={[30, 160]} overlay={<><CFlash at={[at(0.1)]} k={0.6} color="#ff4030" />{kc(0, 'ten-foot figure', 0, 'ten-foot', 330, 110, 2.2)}<Pill text="BLOOD-RED FACE" y={236} variant="red" delay={3} size={58} /></>}>
    <ShotCam preset="push" from={[0, CREST[1] - 3.2, 4]} to={[0, CREST[1] - 2.2, -6]} look={[[0, CREST[1] + 3, -24], [0, CREST[1] + 3, -24]]} fov0={72} fov1={38} start={0} end={d} ease="inout" shake={0.3} shakeFrom={3} shakeLen={14} />
    <Sky f={f} /><Figure position={CREST} rotation={0} scale={1.6} frame={f} />
    <Particles kind="motes" center={[0, 6, -18]} area={[20, 8, 10]} count={40} frame={f} color="#ff7a60" opacity={0.5} /><Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };
// 1 meteor streak over Flatwoods
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const u = clamp01(f / d);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><Pill text="SEPT 12, 1952" y={236} variant="yellow" delay={at(0.3)} size={50} /><CFlash at={[at(0.6)]} k={0.4} color="#d8f0ff" /></>}>
    <ShotCam preset="push" from={[0, 2.5, 20]} to={[0, 3.2, 12]} look={[[0, 14, -40], [8, 11, -40]]} fov0={62} fov1={54} start={0} end={d} ease="inout" />
    <Sky f={f} /><Meteor position={[-40 + u * 80, 30 - u * 14, -60]} dir={[1, -0.35, 0]} len={20} size={4} />
    <Post bloom={1.8} threshold={0.3} vignette={0.3} /></Stage>; };
// 2 farm silhouette, light drops behind
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const u = clamp01(f / (d * 0.7));
  return <Stage palette={NIGHT} fog={[30, 180]} overlay={<><Pill text="IT DROPS BEHIND A FARM" y={236} variant="red" delay={at(0.4)} size={42} /><CFlash at={[Math.round(d * 0.7)]} k={0.5} color="#ff6a40" len={8} /></>}>
    <ShotCam preset="orbit" target={[-10, 4, -8]} a0={0.2} a1={-0.5} r0={24} r1={18} h0={3} h1={5} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <Sky f={f} /><Farm /><Meteor position={[-30 + u * 18, 22 - u * 18, -14]} dir={[1, -1, 0]} len={10} size={3} />
    {f > d * 0.7 && <Glow position={[-18, 1.5, -12]} size={9} color="#ff5a3a" opacity={0.6 + 0.2 * Math.sin(f)} />}<Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };
// 3 date stamp card (no archival photo: license unverified) + road
S[3] = () => { const f = useCurrentFrame(); const d = dur(3);
  return <Stage palette={NIGHT} fog={[30, 160]} overlay={<><Pill text="FLATWOODS · WEST VIRGINIA" y={236} variant="yellow" delay={loc(7.2, 3)} size={44} /><Stamp f={f} at={loc(7.45, 3)} text="1952" y={640} size={200} rot={-5} /><Pill text="NATIONAL GUARD ALERTED" y={1130} variant="dark" delay={loc(8.0, 3)} size={36} /></>}>
    <ShotCam preset="push" from={[0, 2, 14]} to={[0, 2.4, 2]} look={[[0, 4, -30], [0, 4, -30]]} fov0={56} fov1={46} start={0} end={d} ease="inout" />
    <Sky f={f} /><Bx p={[0, height(0, 4) + 0.05, -2]} s={[3, 0.06, 40]} c="#2a2a2c" /><Post bloom={1.3} threshold={0.45} vignette={0.4} /></Stage>; };
// 4 two boys running
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const t = f / FPS; const z = 2 - f * 0.12;
  return <Stage palette={NIGHT} fog={[30, 160]} overlay={<><Pill text="BOYS RUN FOR HELP" y={236} variant="yellow" delay={loc(13.7, 4)} size={46} /></>}>
    <ShotCam preset="track" target={(ff) => [0, 1.2, 2 - ff * 0.12]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[5, 1.2, 9]} fov0={52} start={0} end={d} drift={0.05} />
    <Sky f={f} /><Bx p={[0, height(0, 4) + 0.05, -2]} s={[3, 0.06, 40]} c="#2a2a2c" />
    <Man p={[-0.6, height(0, z) , z]} clip="sprint" rot={Math.PI} t={t} i={0} s={0.5} /><Man p={[0.8, height(0, z + 1) , z + 1.2]} clip="sprint" rot={Math.PI} t={t + 0.2} i={1} s={0.45} /><Post bloom={1.2} threshold={0.5} vignette={0.4} /></Stage>; };
// 5 mother with flashlight at door
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const t = f / FPS;
  return <Stage palette={BARN} fog={[20, 100]} overlay={<><Pill text="A MOTHER GRABS A FLASHLIGHT" y={236} variant="yellow" delay={loc(16.6, 5)} size={40} /><CFlash at={[loc(17.9, 5)]} k={0.4} color="#fff0c0" len={6} /></>}>
    <ShotCam preset="push" from={[-4, 2.4, 9]} to={[0, 2, 5]} look={[[0, 1.6, 0], [0, 1.6, 0]]} fov0={52} fov1={40} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, -0.5]} s={[14, 0.3, 8]} c="#4a3626" /><Bx p={[0, 3, -3]} s={[14, 6, 0.3]} c="#6a3a2a" /><Bx p={[3, 2, -2.8]} s={[2, 4, 0.2]} c="#2a1810" />
    <Man p={[-1.2, 0.15, 1]} clip="idle" rot={0.3} t={t} i={2} s={0.8} /><Man p={[0.4, 0.15, 1.6]} clip="idle" rot={-0.2} t={t + 0.3} i={0} s={0.55} /><Man p={[1.4, 0.15, 1.2]} clip="idle" rot={-0.4} t={t + 0.5} i={1} s={0.5} />
    <Glow position={[-0.5, 1.6, 2]} size={4} color="#ffe0a0" opacity={0.8} /><Post bloom={1.3} threshold={0.5} vignette={0.45} /></Stage>; };
// 6 seven figures climb the hill, camera follows
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const t = f / FPS; const z0 = -6 - f * 0.09;
  return <Stage palette={NIGHT} fog={[25, 140]} overlay={<><Pill text="SEVEN CLIMB IN THE DARK" y={236} variant="yellow" delay={loc(18.95, 6)} size={42} /></>}>
    <ShotCam preset="track" target={(ff) => [0, height(0, -6 - ff * 0.09) + 1.2, -6 - ff * 0.09]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[4, 2.2, 8]} fov0={50} start={0} end={d} drift={0.05} />
    <Sky f={f} />{[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = -2.4 + (i % 4) * 1.6, z = z0 + (i < 4 ? 0 : 2.2) - (i % 2); return <Man key={i} p={[x, height(x, z), z]} clip="walk" rot={Math.PI} t={t + i * 0.2} i={i} s={0.5} />; })}
    <Beam position={[0.5, height(0.5, z0) + 1.4, z0 - 1]} dir={[0, -0.1, -1]} length={14} radius={1.6} opacity={0.22} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 7 red pulse at hilltop
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const p = 0.5 + 0.5 * Math.sin(f * 0.4);
  return <Stage palette={RED} fog={[25, 130]} overlay={<><Pill text="A RED LIGHT PULSES" y={236} variant="red" delay={loc(21.9, 7)} size={46} /></>}>
    <ShotCam preset="push" from={[0, 3, 10]} to={[0, 5, 0]} look={[[0, CREST[1] + 1, -24], [0, CREST[1] + 1, -24]]} fov0={58} fov1={44} start={0} end={d} ease="inout" />
    <Sky f={f} mist={0.25} /><Glow position={[0, CREST[1] + 1.2, -24]} size={10 + p * 4} color="#ff2a18" opacity={0.5 + p * 0.4} />
    <LightCone position={[0, CREST[1] + 1, -24]} dir={[0, 1, 0]} length={20} radius={5} color="#ff4a30" opacity={0.2} frame={f} />
    <Post bloom={1.8} threshold={0.3} vignette={0.4} /></Stage>; };
// 8 group close, breath
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const t = f / FPS;
  return <Stage palette={RED} fog={[15, 70]} overlay={<><Pill text="THE GUARDSMAN" y={236} variant="yellow" delay={loc(23.95, 8)} size={46} /></>}>
    <ShotCam preset="orbit" target={[0, 1.4, -4]} a0={0.2} a1={-0.4} r0={7} r1={5} h0={1.6} h1={1.4} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Sky f={f} trees={60} mist={0.3} />{[-1.4, 0, 1.4].map((x, i) => <Man key={i} p={[x, height(x, -4), -4 + (i % 2) * 0.6]} clip="idle" rot={Math.PI + 0.2 * i} t={t + i * 0.3} i={i + 1} s={0.7} />)}
    <Glow position={[0, 2, -12]} size={12} color="#ff2a18" opacity={0.4} /><Particles kind="dust" center={[0, 2, -3]} area={[8, 4, 6]} count={30} frame={f} color="#ffd0c0" opacity={0.4} /><Post bloom={1.4} threshold={0.4} vignette={0.5} /></Stage>; };
// 9 tree/oak silhouette, red glow behind
S[9] = () => { const f = useCurrentFrame(); const d = dur(9);
  return <Stage palette={RED} fog={[20, 100]} overlay={<>{kc(9, 'A guardsman', 23.88, 'guardsman', 300, 96, 26.0)}</>}>
    <ShotCam preset="push" from={[-6, 2.4, 6]} to={[-1, 2.8, -4]} look={[[0, 3.6, -22], [0, 3.6, -22]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <Sky f={f} mist={0.3} /><Glow position={[0, 6, -22]} size={20} color="#ff2a18" opacity={0.55} /><Beam position={[-2, 1.4, 2]} dir={[0.1, 0.1, -1]} length={20} radius={2} opacity={0.3} /><Post bloom={1.6} threshold={0.35} vignette={0.45} /></Stage>; };
// 10 text moment + flashlight raised (hit 26.7 next)
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const t = f / FPS;
  return <Stage palette={RED} fog={[15, 80]} overlay={<><Pill text="ONE FLASHLIGHT" y={236} variant="yellow" delay={loc(24.5, 10)} size={46} /></>}>
    <ShotCam preset="push" from={[2, 2, 5]} to={[0.8, 2.2, 2]} look={[[0, 2, -6], [0, 2.2, -10]]} fov0={52} fov1={40} start={0} end={d} ease="inout" />
    <Sky f={f} trees={60} mist={0.3} /><Man p={[0, height(0, 0), 0]} clip="interact-right" rot={Math.PI} t={t} i={2} s={0.8} />
    <Beam position={[0.5, height(0, 0) + 1.7, -0.5]} dir={[0, 0.15, -1]} length={30} radius={2.4} opacity={0.3} /><Glow position={[0, 4, -26]} size={14} color="#ff2a18" opacity={0.4} /><Post bloom={1.4} threshold={0.4} vignette={0.5} /></Stage>; };
// 11 beam hits: round red face (hit 26.7)
S[11] = () => { const f = useCurrentFrame(); const d = dur(11);
  return <Stage palette={RED} fog={[15, 100]} overlay={<><CFlash at={[at(0.5)]} k={0.8} color="#ffffff" len={8} /><Pill text="IT STARES BACK" y={236} variant="red" delay={at(0.6)} size={52} /></>}>
    <ShotCam preset="push" from={[0, 5, 4]} to={[0, 5.4, -4]} look={[[0, 4.6, -14], [0, 4.6, -14]]} fov0={56} fov1={34} start={0} end={d} ease="inout" shake={0.6} shakeFrom={at(0.5)} shakeLen={14} />
    <Sky f={f} trees={50} mist={0.3} /><Figure position={[0, height(0, -14), -14]} rotation={0} scale={1.5} frame={f} /><Beam position={[0.8, 1.2, 6]} dir={[-0.05, 0.3, -1]} length={26} radius={2.2} opacity={0.35} /><Post bloom={1.8} threshold={0.3} vignette={0.45} /></Stage>; };
// 12 face close
S[12] = () => { const f = useCurrentFrame(); const d = dur(12);
  return <Stage palette={RED} fog={[8, 50]} overlay={<><Pill text="ROUND RED FACE" y={236} variant="red" delay={loc(27.5, 12)} size={46} /><Pill text="POINTED HOOD" y={316} variant="dark" delay={loc(28.4, 12)} size={42} /></>}>
    <ShotCam preset="push" from={[0, 6.2, -4]} to={[0, 6.0, -8]} look={[[0, 5.6, -12], [0, 5.6, -12]]} fov0={44} fov1={30} start={0} end={d} ease="inout" />
    <Sky f={f} trees={40} mist={0.3} /><Figure position={[0, height(0, -12), -12]} rotation={0.15} scale={1.4} frame={f} glow={1.4} /><Post bloom={2.0} threshold={0.28} vignette={0.5} /></Stage>; };
// 13 REVEAL: lunge, flash + shake (hit 29.9)
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const u = clamp01(f / d);
  return <Stage palette={RED} fog={[8, 60]} overlay={<><CFlash at={[2, 10]} k={0.9} color="#ffffff" len={9} />{kc(13, 'It hisses', 29.8, 'hisses', 320, 112, 31.3)}</>}>
    <ShotCam preset="push" from={[0, 5.2, 2]} to={[0, 5.4, -1]} look={[[0, 4.6, -10], [0, 4.6, -3]]} fov0={58} fov1={42} start={0} end={d} ease="inout" shake={1.0} shakeFrom={2} shakeLen={26} />
    <Sky f={f} trees={40} mist={0.35} /><Figure position={[0, height(0, -12 + u * 7), -12 + u * 7]} rotation={0} scale={1.6 + u * 0.4} frame={f} glow={1.6} />
    <Shockwave position={[0, height(0, -10), -10]} start={2} frame={f} radius={14} life={26} color="#ff6a50" /><Post bloom={2.1} threshold={0.25} vignette={0.5} /></Stage>; };
// 14 flashlight dropped, tumbling beam
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const t = f / FPS; const a = f * 0.18;
  return <Stage palette={RED} fog={[10, 80]} overlay={<><Pill text="HE SCREAMS" y={236} variant="red" delay={loc(32.1, 14)} size={52} /></>}>
    <ShotCam preset="push" from={[2, 2.2, 6]} to={[0, 2.4, 3]} look={[[0, 1.2, -2], [0, 1.2, -2]]} fov0={54} fov1={44} start={0} end={d} ease="inout" shake={0.5} shakeFrom={0} shakeLen={12} />
    <Sky f={f} trees={50} mist={0.3} /><Man p={[-0.5, height(0, 0), 0]} clip="idle" rot={Math.PI} t={t} i={2} s={0.8} />
    <Beam position={[1, 0.6 + Math.max(0, 2 - f * 0.1), -0.5]} dir={[Math.sin(a), -0.2, -Math.cos(a)]} length={14} radius={1.8} opacity={0.3} /><Figure position={[0, height(0, -8), -8]} rotation={0} scale={1.8} frame={f} /><Post bloom={1.6} threshold={0.35} vignette={0.5} /></Stage>; };
// 15 all run downhill
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const t = f / FPS; const z = -2 + f * 0.14;
  return <Stage palette={NIGHT} fog={[25, 140]} overlay={<><Pill text="THEY ALL RUN" y={236} variant="yellow" delay={loc(33.0, 15)} size={52} /></>}>
    <ShotCam preset="track" target={(ff) => [0, 1.2, -2 + ff * 0.14]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[5, 2, -9]} fov0={54} start={0} end={d} drift={0.06} />
    <Sky f={f} />{[0, 1, 2, 3].map((i) => { const x = -1.8 + i * 1.2; const zz = z + (i % 2) * 1.5; return <Man key={i} p={[x, height(x, zz), zz]} clip="sprint" rot={0} t={t + i * 0.15} i={i} s={0.5} />; })}
    <Glow position={[0, 6, -26]} size={14} color="#ff2a18" opacity={0.5} /><Post bloom={1.4} threshold={0.45} vignette={0.45} /></Stage>; };
// 16 mist over field, loop3 text
S[16] = () => { const f = useCurrentFrame(); const d = dur(16);
  return <Stage palette={NIGHT} fog={[15, 90]} overlay={<>{kc(16, 'not the strange part', 34.8, 'strange', 330, 112, 36.6)}<Pill text="NOT THE STRANGE PART" y={236} variant="yellow" delay={loc(35.3, 16)} size={40} /></>}>
    <ShotCam preset="push" from={[-8, 1.6, 8]} to={[4, 1.8, 2]} look={[[0, 1.2, -10], [0, 1.2, -10]]} fov0={58} fov1={50} start={0} end={d} ease="inout" />
    <Sky f={f} mist={0.5} /><FogLayer y={1.2} size={90} layers={4} thickness={2} color="#c8d890" opacity={0.3} frame={f} center={[0, -4]} /><Particles kind="motes" center={[0, 1.5, 0]} area={[24, 3, 14]} count={60} frame={f} color="#d8e8a0" opacity={0.6} /><Post bloom={1.4} threshold={0.4} vignette={0.45} /></Stage>; };
// 17 pungent mist, boy clutching throat
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[12, 70]} overlay={<><Pill text="PUNGENT MIST" y={236} variant="yellow" delay={loc(37.3, 17)} size={50} /></>}>
    <ShotCam preset="orbit" target={[0, 1, 0]} a0={0.5} a1={-0.3} r0={7} r1={5} h0={1.4} h1={1.8} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Sky f={f} trees={50} mist={0.5} /><Man p={[0, height(0, 0), 0]} clip="interact-left" rot={0.4} t={t} i={1} s={0.6} /><FogLayer y={0.8} size={30} layers={4} thickness={1.6} color="#c8d890" opacity={0.4} frame={f} center={[0, 0]} /><Post bloom={1.3} threshold={0.45} vignette={0.5} /></Stage>; };
// 18 throat swelling closeup (hit 40.0)
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[8, 40]} overlay={<><Pill text="THROATS SWELLED" y={236} variant="red" delay={loc(39.4, 18)} size={50} /><CFlash at={[loc(40.0, 18)]} k={0.6} color="#ffe0c0" len={7} /></>}>
    <ShotCam preset="push" from={[0, 1.9, 4]} to={[0, 1.6, 1.4]} look={[[0, 1.4, 0], [0, 1.2, 0]]} fov0={46} fov1={32} start={0} end={d} ease="inout" shake={0.5} shakeFrom={loc(40.0, 18)} shakeLen={12} />
    <Sky f={f} trees={30} mist={0.4} /><Man p={[0, height(0, 0), 0]} clip="interact-left" rot={Math.PI * 0.9} t={t} i={1} s={0.9} /><Post bloom={1.4} threshold={0.4} vignette={0.55} /></Stage>; };
// 19 ground tracks, Air Force men
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[25, 130]} overlay={<><Pill text="SKID MARKS ON THE GROUND" y={236} variant="yellow" delay={loc(41.3, 19)} size={40} /></>}>
    <ShotCam preset="orbit" target={[0, 0.4, -6]} a0={0.3} a1={-0.4} r0={11} r1={8} h0={4} h1={3} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Sky f={f} />{[0, 1, 2].map((i) => <Bx key={i} p={[-2.2 + i * 2.2, height(0, -6) + 0.06, -7 + i * 0.4]} s={[0.5, 0.05, 6]} c="#14100a" r={[0, 0.15 * (i - 1), 0]} />)}
    {[-3, 3].map((x, i) => <Man key={i} p={[x, height(x, -4), -4]} clip="idle" rot={Math.PI * 0.5 * (i ? -1 : 1) + Math.PI / 2} t={t + i} i={i + 2} s={0.65} />)}<Beam position={[3, 1.6, -3]} dir={[-1, -0.5, -0.6]} length={8} radius={1.2} opacity={0.3} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 20 Air Force report card
S[20] = () => { const f = useCurrentFrame(); const d = dur(20);
  return <Stage palette={BARN} fog={[20, 100]} overlay={<><Pill text="AIR FORCE REPORT" y={236} variant="yellow" delay={loc(43.35, 20)} size={46} /><Stamp f={f} at={loc(43.8, 20)} text="METEOR" y={640} size={150} color="#d8d0b0" rot={-4} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.2} a1={-0.5} r0={11} r1={8} h0={6} h1={5} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, 0]} s={[12, 0.5, 6]} c="#4a3626" />{[0, 1, 2, 3].map((i) => <Bx key={i} p={[-3 + i * 1.1, 0.35 + i * 0.1, 0.2]} s={[2.4, 0.08, 3.2]} c={i % 2 ? '#e8e0cc' : '#d8d0bc'} r={[0, 0.1 * i - 0.15, 0]} />)}<Glow position={[4, 2, -2]} size={7} color="#ffd890" opacity={0.6} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 21 meteor + three red beacons
S[21] = () => { const f = useCurrentFrame(); const d = dur(21); const u = clamp01(f / d);
  return <Stage palette={NIGHT} fog={[30, 200]} overlay={<><Pill text="3 RED BEACONS" y={236} variant="red" delay={loc(44.7, 21)} size={50} /></>}>
    <ShotCam preset="push" from={[0, 2.4, 18]} to={[0, 3.2, 10]} look={[[0, 10, -40], [0, 12, -40]]} fov0={62} fov1={54} start={0} end={d} ease="inout" />
    <Sky f={f} /><Meteor position={[-30 + u * 40, 24 - u * 10, -50]} dir={[1, -0.3, 0]} len={14} size={3} />
    {[-6, 0, 6].map((x, i) => <group key={i}><Cy p={[x * 1.5, height(x * 1.5, -20) + 1.5, -20]} a={[0.08, 0.08, 3, 5]} c="#3a3a3a" /><Glow position={[x * 1.5, height(x * 1.5, -20) + 3.2, -20]} size={2.6 + 0.6 * Math.sin(f * 0.4 + i)} color="#ff2a18" opacity={0.9} /></group>)}<Post bloom={1.8} threshold={0.3} vignette={0.35} /></Stage>; };
// 22 barn owl in barn (stinger hit 46.0)
S[22] = () => { const f = useCurrentFrame(); const d = dur(22); const fl = Math.sin(f * 0.5) * 0.4;
  return <Stage palette={BARN} fog={[10, 60]} overlay={<><CFlash at={[loc(46.0, 22)]} k={0.8} color="#ffffff" len={8} /><Pill text="A STARTLED BARN OWL" y={236} variant="yellow" delay={loc(46.0, 22)} size={46} /></>}>
    <ShotCam preset="push" from={[0, 2.6, 8]} to={[0, 2.8, 4.4]} look={[[0, 2.6, 0], [0, 2.6, 0]]} fov0={52} fov1={36} start={0} end={d} ease="inout" shake={0.7} shakeFrom={loc(46.0, 22)} shakeLen={14} />
    <Bx p={[0, 0, 0]} s={[14, 0.3, 8]} c="#5a4630" /><Bx p={[0, 4, -4]} s={[14, 8, 0.3]} c="#7a3a28" />{[-4, -2, 0, 2, 4].map((x, i) => <Bx key={i} p={[x, 4, -3.8]} s={[0.2, 8, 0.1]} c="#4a2418" />)}
    <Bx p={[0, 3.2, -1.6]} s={[10, 0.25, 0.4]} c="#6a4a2a" /><Owl position={[0, 4.0, -1.6]} rotation={0} scale={0.9} flap={fl * (f > 14 ? 1 : 0.1)} /><Glow position={[0, 4.2, -1]} size={9} color="#ffd890" opacity={0.35} />
    <Particles kind="dust" center={[0, 3, -1]} area={[8, 4, 4]} count={40} frame={f} color="#ffe0b0" opacity={0.5} /><Post bloom={1.3} threshold={0.45} vignette={0.5} /></Stage>; };
// 23 owl vs figure side by side
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={RED} fog={[15, 100]} overlay={<><Pill text="OWL vs FIGURE" y={236} variant="dark" delay={loc(48.9, 23)} size={48} /><Pill text="SAME FACE?" y={316} variant="yellow" delay={loc(49.4, 23)} size={42} /></>}>
    <ShotCam preset="orbit" target={[0, 2.4, -2]} a0={-0.4} a1={0.4} r0={12} r1={9} h0={3} h1={3.4} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Stars count={200} radius={100} /><Bx p={[0, -0.1, -2]} s={[26, 0.2, 14]} c="#1c2a22" />
    <Owl position={[-3.4, 1.2, -2]} rotation={0.3} scale={1.4} flap={0.1} /><Figure position={[3.2, 0, -2]} rotation={-0.3} scale={0.9} frame={f} /><Post bloom={1.5} threshold={0.35} vignette={0.45} /></Stage>; };
// 24 CASE CLOSED crossed out
S[24] = () => { const f = useCurrentFrame(); const d = dur(24);
  return <Stage palette={BARN} fog={[20, 100]} overlay={<><Pill text="CASE CLOSED?" y={236} variant="red" delay={at(0.1)} size={56} /><Stamp f={f} at={3} text="CLOSED" y={700} size={170} rot={-7} />
    {f > 18 && <div style={{position: 'absolute', top: 790, left: 160, width: Math.min(760, (f - 18) * 90), height: 20, background: '#ff2a18', transform: 'rotate(-7deg)', boxShadow: '0 0 20px #ff2a18'}} />}<CFlash at={[3]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="push" from={[0, 3, 9]} to={[0, 2.6, 5]} look={[[0, 1, 0], [0, 1, 0]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <Bx p={[0, 0, 0]} s={[12, 0.5, 6]} c="#4a3626" />{[0, 1, 2].map((i) => <Bx key={i} p={[-2 + i * 2, 0.35, 0.2]} s={[2.4, 0.08, 3.2]} c="#e8e0cc" r={[0, 0.1 * i - 0.15, 0]} />)}<Post bloom={1.2} threshold={0.5} vignette={0.5} /></Stage>; };
// 25 loop: back to the crest + end card
S[25] = () => { const f = useCurrentFrame(); const d = dur(25);
  return <Stage palette={RED} fog={[30, 160]} overlay={<><Pill text="WHAT DID THEY SEE?" y={1130} variant="red" delay={2} size={46} /><EndCard delay={2} sources={['WIKIPEDIA', 'SKEPTICAL INQUIRER 2000', 'HISTORY.COM']} /></>}>
    <ShotCam preset="push" from={[0, CREST[1] - 3.2, 4]} to={[0, CREST[1] - 3.1, 3.5]} look={[[0, CREST[1] + 3, -24], [0, CREST[1] + 3, -24]]} fov0={72} fov1={70} start={0} end={d} ease="inout" />
    <Sky f={f} /><Figure position={CREST} rotation={0} scale={1.6} frame={f} /><Post bloom={1.7} threshold={0.35} vignette={0.35} /></Stage>; };

export const Fw = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? FW_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
