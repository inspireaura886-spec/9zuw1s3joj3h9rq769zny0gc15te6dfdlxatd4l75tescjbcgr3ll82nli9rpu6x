// "The Ghost Rockets" (Sweden 1946) - low-poly 3D Short, ANIMATION UPGRADE kit + GitGems Rigged characters. 26 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, Shockwave, FogLayer, Rigged, Glow, Stars, GodRays, LightCone,
  Grade, KineticCard, cueLine, clamp01, mixPalette, usePreload} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Land, Lake, Pines, Rocket, FireTrail, Raft, CraterBlock, Radar, Desk, Briefcase, FolderTable, Airfield, Meteor, Hamlet, height} from './world.jsx';
import {Plane} from '../shag/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const GR_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.0, 5.4, 7.7, 10.6, 13.1, 15.8, 17.5, 19.7, 21.3, 23.3, 24.8, 27.0, 31.1, 32.4, 34.7, 36.9, 38.9, 40.84, 43.6, 45.0, 48.7, 50.3, 51.4, 53.5, 55.3];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? GR_FRAMES) - C[i];
const sec = (i, f) => CS[i] + f / FPS;
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

// pale green-grey Baltic night (aurora-ish), dawn, interior lamp-light, underwater
const NIGHT = {top: '#06122c', mid: '#164450', hor: '#78b8a4', fog: '#1a4450', amb: 1.0, hemiSky: '#8ad8cc', hemiGround: '#1c2c2a', hemiI: 1.6, sun: '#c0e8ff', sunI: 1.5, sunPos: [-20, 30, 10], rim: '#ff9a50', rimI: 1.0, rimPos: [10, 8, -30], glow: 1};
const DAWN = {top: '#3a4a7a', mid: '#9a7a8a', hor: '#ffc8a0', fog: '#a08a90', amb: 1.1, hemiSky: '#ffd8c0', hemiGround: '#3a3a40', hemiI: 1.5, sun: '#ffd0a0', sunI: 2.2, sunPos: [40, 10, -30], rim: '#ff9ab0', rimI: 1.1, rimPos: [-30, 15, 30], glow: 0.7};
const ROOM = {top: '#120e0c', mid: '#241a14', hor: '#3a2a20', fog: '#1c1612', amb: 1.0, hemiSky: '#ffd8a0', hemiGround: '#3a2a20', hemiI: 1.7, sun: '#ffe0b0', sunI: 1.6, sunPos: [10, 20, 20], rim: '#6aa0ff', rimI: 0.8, rimPos: [-20, 8, -20], glow: 1};
const UNDER = {top: '#0b4a56', mid: '#0a3644', hor: '#06222e', fog: '#0a3442', amb: 1.0, hemiSky: '#6ad0d8', hemiGround: '#14302a', hemiI: 1.3, sun: '#bff6ff', sunI: 1.2, sunPos: [5, 40, 5], rim: '#4ab0c0', rimI: 0.8, rimPos: [-20, 10, -20], glow: 0};
const DUSK = {top: '#1c1850', mid: '#7a3a6a', hor: '#ff9a5a', fog: '#7a5068', amb: 1.0, hemiSky: '#ffb890', hemiGround: '#3a2e30', hemiI: 1.5, sun: '#ffb27a', sunI: 2.0, sunPos: [-40, 14, -30], rim: '#ff7ab0', rimI: 1.0, rimPos: [40, 20, 30], glow: 0.9};

const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;
/** rotation that points the rocket's +x along (from -> to) */
const aim = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2]; return [0, Math.atan2(-dz, dx), Math.atan2(dy, Math.hypot(dx, dz))]; };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 150, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4,
  transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;

const Sky = ({f, trees = 110, amp = 0.07, mist = true}) => <><Stars count={320} radius={170} /><Land /><Lake frame={f} amp={amp} /><Pines count={trees} frame={f} />
  {mist && <FogLayer y={0.5} size={110} layers={3} thickness={1.2} color="#9ad0cc" opacity={0.12} frame={f} center={[0, -30]} />}</>;

const S = [];
// 0 HOOK: giant cigar rocket with a fire tail crosses a black lake, camera pushes in
const hook = (f, d) => { const x = 1.5 - f * 0.05; return {x}; };
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const {x} = hook(f, d);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><CFlash at={[at(0.1)]} k={0.5} color="#ffd8a0" />{kc(0, 'Summer 1946', 0, '1946', 330, 104, 2.0)}<Pill text="2,000 ROCKETS" y={236} variant="red" delay={2} size={64} /></>}>
    <ShotCam preset="push" from={[0, 2.2, 12]} to={[0, 2.6, 8]} look={[[0, 4.4, -20], [-2, 4.4, -20]]} fov0={56} fov1={48} start={0} end={d} ease="inout" shake={0.3} shakeFrom={2} shakeLen={14} />
    <Sky f={f} /><Rocket position={[x, 4.4 + Math.sin(f * 0.1) * 0.12, -20]} rotation={[0, Math.PI, 0.05]} scale={2.0} fire={1.2} frame={f} />
    {[[-14, 9.5, -46, 1.6], [16, 7.6, -52, 1.4], [-24, 2.2, -40, 1.5], [24, 11.5, -60, 1.3], [6, 14.5, -64, 1.2]].map(([px, py, pz, sc], i) => <Rocket key={'h' + i} position={[px - f * (0.05 + i * 0.012), py + Math.sin(f * 0.08 + i) * 0.15, pz]} rotation={[0, Math.PI, 0.05 + i * 0.01]} scale={sc} fire={1.1} frame={f + i * 7} />)}
    <Particles kind="motes" center={[0, 4, -6]} area={[30, 8, 16]} count={40} frame={f} color="#ffd890" opacity={0.5} /><Post bloom={1.6} threshold={0.4} vignette={0.3} /></Stage>; };
// 1 sky full of rockets over the pines (two thousand)
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={NIGHT} fog={[40, 240]} overlay={<><Pill text="ACROSS SCANDINAVIA" y={236} variant="yellow" delay={loc(3.1, 1)} size={44} /><CFlash at={[loc(2.06, 1)]} k={0.4} color="#ffe8c0" /></>}>
    <ShotCam preset="push" from={[0, 1.8, 16]} to={[0, 2.8, 7]} look={[[0, 11, -40], [0, 15, -40]]} fov0={62} fov1={54} start={0} end={d} ease="inout" />
    <Sky f={f} />
    {Array.from({length: 9}, (_, i) => { const sp = 0.32 + (i % 3) * 0.08; const x = -50 + ((f * sp * 1.4 + i * 21) % 110); return <Rocket key={i} position={[x, 9 + (i * 3.7) % 11, -30 - (i % 4) * 7]} rotation={[0, 0, 0.04 + (i % 3) * 0.03]} scale={1.8} fire={1.1} frame={f + i * 5} />; })}
    <Post bloom={1.6} threshold={0.38} vignette={0.3} /></Stage>; };
// 2 empty lake at dawn, search lamp: nobody finds a rocket
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const sw = Math.sin(f * 0.07) * 0.6;
  return <Stage palette={DAWN} fog={[30, 200]} overlay={<><Pill text="NO ROCKET FOUND" y={236} variant="red" delay={loc(6.1, 2)} size={48} /></>}>
    <ShotCam preset="orbit" target={[0, 0.8, -10]} a0={0.5} a1={-0.5} r0={20} r1={16} h0={3} h1={4.5} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Land /><Lake frame={f} amp={0.05} face="#4a6a7a" deep="#1a2c38" /><Pines count={110} frame={f} /><FogLayer y={0.4} size={110} layers={3} thickness={1.3} color="#e8c8b8" opacity={0.2} frame={f} center={[0, -30]} />
    <Raft position={[0, 0.05, -10]} rotation={0.3} frame={f} lamp /><LightCone position={[-1.9, 1.5, -10]} dir={[sw, -0.18, -1]} length={26} radius={5} color="#fff0b8" opacity={0.28} frame={f} />
    <Raft position={[-16, 0.05, -22]} rotation={-0.4} frame={f + 20} lamp /><Post bloom={1.2} threshold={0.5} vignette={0.35} /></Stage>; };
// 3 press desk: newspapers + IMG1 photo card (the 1946 streak)
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const p1 = loc(8.0, 3);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<>{f >= p1 && <PhotoCard src="ghostrockets/IMG1.jpg" credit="1946 Swedish military release · public domain · may be a meteor" tag="GHOST ROCKETS" delay={p1} dur={d - p1} />}<Pill text="SWEDEN'S PRESS" y={236} variant="yellow" delay={loc(7.8, 3)} size={44} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.2} a1={-0.5} r0={13} r1={10} h0={6} h1={5} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Desk papers={8} frame={f} /><Particles kind="dust" center={[0, 3, 0]} area={[14, 6, 8]} count={40} frame={f} opacity={0.4} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 4 cigar close-up with trailing fire
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<><Pill text="CIGAR-SHAPED" y={236} variant="yellow" delay={loc(10.65, 4)} size={50} /><Pill text="TRAILING FIRE" y={316} variant="red" delay={loc(11.7, 4)} size={46} /></>}>
    <ShotCam preset="orbit" target={[0, 0, 0]} a0={0.6} a1={2.2} r0={15} r1={11} h0={1.0} h1={2.0} fov0={46} fov1={40} start={0} end={d} ease="inout" />
    <Stars count={320} radius={120} /><Rocket position={[0, Math.sin(f * 0.1) * 0.1, 0]} rotation={[0, 0, 0.02]} scale={1.6} fire={1.25} frame={f} />
    <Particles kind="sparks" center={[-6, 0, 0]} area={[10, 3, 3]} count={50} frame={f} color="#ffb060" opacity={0.8} /><Post bloom={1.1} threshold={0.45} vignette={0.35} /></Stage>; };
// 5 19 July 1946, Lake Kölmjärv: lake wide, crane up
S[5] = () => { const f = useCurrentFrame(); const d = dur(5);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<>{kc(5, 'July nineteenth', 13.1, 'nineteenth', 320, 100, 14.4)}<Pill text="LAKE KÖLMJÄRV" y={236} variant="yellow" delay={loc(14.5, 5)} size={50} /><Pill text="SWEDEN · 1946" y={316} variant="dark" delay={loc(15.0, 5)} size={40} /></>}>
    <ShotCam preset="crane" target={[0, 0, -28]} h0={1.5} h1={14} r0={42} r1={54} angle={0.2} lookY0={2} lookY1={0.5} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Sky f={f} /><Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 6 witnesses on the shore; a grey rocket arcs down toward the lake
const PA = [-30, 20, -52], PB = [2, 2.4, -27];
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const t = f / FPS; const u = Math.pow(clamp01(f / d), 1.5); const p = lerp3(PA, PB, u); const sh = height(0, 10);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<><Pill text="WITNESSES" y={236} variant="yellow" delay={loc(15.8, 6)} size={46} /></>}>
    <ShotCam preset="push" from={[0, sh + 2.6, 21]} to={[0, sh + 2.4, 17.5]} look={[[0, 9, -30], [0, 4, -28]]} fov0={60} fov1={50} start={0} end={d} ease="inout" />
    <Sky f={f} />{[-2.6, 0, 2.4].map((x, i) => <Man key={i} p={[x, height(x, 10) , 10]} clip="idle" rot={Math.PI} t={t + i * 0.4} i={i} s={0.45} />)}
    <Rocket position={p} rotation={aim(PA, PB)} scale={1.9} fire={1.1} frame={f} /><FireTrail path={(v) => lerp3(PA, PB, Math.pow(v, 1.5))} u={Math.pow(clamp01(f / d), 1)} n={18} size={3} step={0.025} />
    <Post bloom={1.6} threshold={0.38} vignette={0.35} /></Stage>; };
// 7 impact: shockwave + splash
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const h = 2; const hit = f >= h; const q = clamp01(f / h);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<><Pill text="INTO THE WATER" y={236} variant="red" delay={loc(18.4, 7)} size={46} /><CFlash at={[h]} k={0.7} color="#ffffff" len={9} /></>}>
    <ShotCam preset="push" from={[1, 2.4, 6]} to={[2, 3.2, -4]} look={[[2, 1.2, -27], [2, 2.4, -27]]} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.9} shakeFrom={h} shakeLen={22} />
    <Sky f={f} amp={hit ? 0.2 : 0.07} />
    {!hit && <Rocket position={lerp3([2, 3.0, -29], [2, 0.2, -27], q)} rotation={aim([2, 3.0, -29], [2, 0.2, -27])} scale={1.9} fire={1.1} frame={f} />}
    {hit && <Glow position={[2, 0.4, -27]} size={7} color="#ffd890" opacity={Math.max(0, 0.9 - (f - h) / 30)} />}
    <Shockwave position={[2, 0.1, -27]} start={h} frame={f} radius={16} life={30} color="#e8f6ff" />
    <Burst kind="splash" position={[2, 0.2, -27]} start={h} frame={f} count={90} speed={0.42} up={1.3} spread={1.1} gravity={0.02} life={40} color="#dff2ff" floorY={0} />
    <Post bloom={1.6} threshold={0.4} vignette={0.3} /></Stage>; };
// 8 soldiers on a raft with poles + IMG2 archival card
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const t = f / FPS; const p1 = loc(20.0, 8);
  return <Stage palette={DAWN} fog={[30, 200]} overlay={<>{f >= p1 && <PhotoCard src="ghostrockets/IMG2.jpg" credit="Swedish military photo, July 1946 · public domain" tag="THE SEARCH" delay={p1} dur={d - p1} />}<Pill text="3 WEEKS" y={236} variant="yellow" delay={loc(20.45, 8)} size={50} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, -6]} a0={0.3} a1={1.1} r0={9} r1={7} h0={2.2} h1={2.8} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Land /><Lake frame={f} amp={0.05} face="#4a6a7a" deep="#1a2c38" /><Pines count={90} frame={f} /><FogLayer y={0.4} size={110} layers={3} thickness={1.3} color="#e8c8b8" opacity={0.2} frame={f} center={[0, -30]} />
    <Raft position={[0, 0.05, -6]} rotation={0.2} frame={f} />{[-1.1, 0.2, 1.4].map((x, i) => <Man key={i} p={[x, 0.3, -6 + (i % 2) * 0.5]} clip={i === 1 ? 'interact-right' : 'idle'} rot={0.6 + i} t={t + i * 0.3} i={i + 1} s={0.5} />)}
    <Post bloom={1.1} threshold={0.5} vignette={0.35} /></Stage>; };
// 9 lakebed crater cutaway, underwater murk
S[9] = () => { const f = useCurrentFrame(); const d = dur(9);
  return <Stage palette={UNDER} fog={[10, 60]} overlay={<><Pill text="DISTURBED LAKEBED" y={236} variant="yellow" delay={loc(21.8, 9)} size={46} /><Pill text="NO WRECKAGE" y={316} variant="red" delay={loc(22.6, 9)} size={42} /></>}>
    <ShotCam preset="orbit" target={[0, -0.5, 0]} a0={0.4} a1={-0.9} r0={15} r1={10} h0={5} h1={3} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <CraterBlock frame={f} /><GodRays position={[2, 14, -2]} dir={[0.1, -1, 0.1]} length={18} width={2.4} count={6} spread={0.4} frame={f} color="#bff6ff" opacity={0.2} dust={50} />
    <Particles kind="motes" center={[0, 2, 0]} area={[16, 5, 10]} count={60} frame={f} color="#9ad8e0" opacity={0.5} /><Post bloom={1.0} threshold={0.55} vignette={0.45} /></Stage>; };
// 10 empty raft, calm lake, no wreckage
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={DAWN} fog={[30, 200]} overlay={<><Pill text="NO WRECKAGE" y={236} variant="red" delay={loc(23.4, 10)} size={52} /></>}>
    <ShotCam preset="push" from={[8, 2.2, 6]} to={[3, 1.6, -2]} look={[[0, 0.4, -10], [0, 0.4, -10]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <Land /><Lake frame={f} amp={0.03} face="#5a7a8a" deep="#1a2c38" /><Pines count={90} frame={f} /><FogLayer y={0.4} size={110} layers={3} thickness={1.3} color="#f0d0c0" opacity={0.22} frame={f} center={[0, -30]} />
    <Raft position={[0, 0.05, -10]} rotation={0.5} frame={f} empty /><Post bloom={1.1} threshold={0.5} vignette={0.4} /></Stage>; };
// 11 radar scope with ~200 blips
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const t = sec(11, f); const n = Math.min(200, Math.round(200 * clamp01((t - 24.9) / 1.2))); const cnt = Math.round(n);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="RADAR LOGS" y={236} variant="yellow" delay={loc(24.85, 11)} size={48} />
    {t >= 25.0 && <div style={{position: 'absolute', top: 1090, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 170, color: '#6aff9a', WebkitTextStroke: '10px #05140a', paintOrder: 'stroke fill'}}>{cnt >= 200 ? '~200' : cnt}</div>}<CFlash at={[loc(26.01, 11)]} k={0.35} color="#9affc0" /></>}>
    <ShotCam preset="push" from={[0, 0, 22]} to={[0, 0, 15]} look={[[0, 0, 0], [0, 0, 0]]} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Radar frame={f} n={n} size={8} /><Particles kind="dust" center={[0, 0, 4]} area={[20, 14, 8]} count={30} frame={f} color="#6aff9a" opacity={0.3} /><Post bloom={1.8} threshold={0.3} vignette={0.4} /></Stage>; };
// 12 press room censorship: map, black bars, CENSORED stamp
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const t = sec(12, f); const bars = t < 28.0 ? 0 : t < 29.0 ? 1 : t < 29.5 ? 2 : t < 30.0 ? 3 : t < 30.5 ? 4 : 5;
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="NEWSPAPERS GAGGED" y={236} variant="yellow" delay={loc(27.6, 12)} size={44} />
    <Stamp f={f} at={loc(28.98, 12)} text="CENSORED" y={900} size={150} /><Pill text="NO PLACE NAMES" y={316} variant="dark" delay={loc(29.6, 12)} size={40} /><CFlash at={[loc(28.98, 12)]} k={0.4} color="#ffffff" len={6} /></>}>
    <ShotCam preset="orbit" target={[1.5, 0.4, 0]} a0={0.0} a1={-0.9} r0={11} r1={7} h0={7} h1={5} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Desk papers={4} map bars={bars} frame={f} /><Particles kind="dust" center={[0, 3, 0]} area={[14, 6, 8]} count={40} frame={f} opacity={0.4} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 13 General Doolittle lands: low plane over the airfield at dusk
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const x = -40 + f * 1.4;
  return <Stage palette={DUSK} fog={[40, 200]} overlay={<>{kc(13, "America's General Doolittle", 31.2, 'Doolittle', 300, 76, 32.35)}</>}>
    <ShotCam preset="track" target={(ff) => [-40 + ff * 1.4, 3 - ff * 0.03, 0]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[-8, 3.4, 16]} fov0={50} start={0} end={d} drift={0.04} />
    <Stars count={120} radius={150} /><Airfield frame={f} /><Plane position={[x, 3 - f * 0.03, 0]} rotation={Math.PI / 2} scale={1.8} frame={f} /><Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 14 Doolittle on the airfield, parked plane behind, hit flash
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const t = f / FPS; const z = 6 - Math.min(f, 70) * 0.05;
  return <Stage palette={DUSK} fog={[40, 200]} overlay={<><Pill text="STOCKHOLM" y={236} variant="yellow" delay={loc(33.6, 14)} size={52} /><Pill text="AUGUST 1946" y={316} variant="dark" delay={loc(33.0, 14)} size={40} /><CFlash at={[1]} k={0.5} color="#ffe0b0" /></>}>
    <ShotCam preset="push" from={[-6, 1.8, 12]} to={[-2.5, 1.5, 9]} look={[[0, 1.4, 4], [0, 1.4, 4]]} fov0={52} fov1={38} start={0} end={d} ease="inout" />
    <Stars count={120} radius={150} /><Airfield frame={f} /><Plane position={[10, 0.9, -6]} rotation={0.3} scale={1.8} frame={0} />
    <Man p={[0, 0, z]} clip="walk" rot={0} t={t} i={2} s={0.62} /><Man p={[1.7, 0, z - 1.2]} clip="idle" rot={0.4} t={t} i={3} s={0.55} /><Post bloom={1.2} threshold={0.5} vignette={0.4} /></Stage>; };
// 15 briefcase on a table, shadow men behind (officially on business)
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const t = f / FPS;
  return <Stage palette={ROOM} fog={[30, 100]} overlay={<><Pill text="OFFICIALLY" y={236} variant="dark" delay={loc(34.8, 15)} size={46} /><Pill text="ON BUSINESS" y={316} variant="yellow" delay={loc(35.85, 15)} size={46} /></>}>
    <ShotCam preset="push" from={[0, 4.4, 9]} to={[0, 2.4, 4.5]} look={[[0, 0.6, 0], [0, 0.8, 0]]} fov0={50} fov1={36} start={0} end={d} ease="inout" />
    <Desk papers={2} frame={f} /><Briefcase position={[0, 0.25, 0.4]} rotation={0.2} />
    {[-2.4, 2.6].map((x, i) => <Man key={i} p={[x, -1.4, -5]} clip="idle" rot={0} t={t + i} i={i} s={0.9} />)}
    <Post bloom={1.3} threshold={0.5} vignette={0.5} /></Stage>; };
// 16 Swedish defence staff room: table of reports, officers
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const t = f / FPS;
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="OCTOBER 1946" y={236} variant="yellow" delay={loc(36.9, 16)} size={46} /><Pill text="DEFENCE STAFF" y={316} variant="dark" delay={loc(38.2, 16)} size={44} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.0} a1={0.8} r0={12} r1={9} h0={5.5} h1={4} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <FolderTable frame={f} />{[-4.5, -1.5, 1.5, 4.5].map((x, i) => <Man key={i} p={[x, -3.1, -3.4]} clip={i === 1 ? 'interact-right' : 'idle'} rot={0} t={t + i * 0.3} i={i} s={0.95} />)}
    <Glow position={[0, 4, 0]} size={14} color="#ffe0a8" opacity={0.2} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 17 stamp VAGUE on most, one folder glows
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const t = sec(17, f);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="MOST: VAGUE" y={236} variant="dark" delay={loc(39.0, 17)} size={46} /><Pill text="SOME SIGHTINGS..." y={316} variant="yellow" delay={loc(39.8, 17)} size={42} />
    <Stamp f={f} at={loc(39.3, 17)} text="VAGUE" y={1050} color="#8a8a8a" size={130} rot={6} /></>}>
    <ShotCam preset="push" from={[-5, 6, 8]} to={[1.5, 3.2, 3.6]} look={[[0, 0.3, 0], [1.2, 0.3, 0.6]]} fov0={50} fov1={36} start={0} end={d} ease="inout" />
    <FolderTable frame={f} litIndex={t > 39.6 ? 7 : -1} /><Post bloom={1.4} threshold={0.45} vignette={0.45} /></Stage>; };
// 18 REVEAL: UNEXPLAINED stamp + flash, then the three crossed-out explanations
const Icon = ({x, kind, show, f}) => !show ? null : <group position={[x, 3.2, -6]}>
  {kind === 'tree' && <><Cy p={[0, -0.6, 0]} a={[0.2, 0.28, 1.2, 6]} c="#6b4a2b" /><mesh position={[0, 0.6, 0]}><coneGeometry args={[1.0, 1.9, 7]} /><meshLambertMaterial color="#2f7a46" flatShading emissive="#1a4a2a" emissiveIntensity={0.5} /></mesh></>}
  {kind === 'plane' && <group rotation={[0.3, 0.6, 0]}><Plane position={[0, 0, 0]} rotation={0} scale={0.55} frame={f} /></group>}
  {kind === 'cloud' && [[0, 0, 0, 1.0], [-0.9, -0.2, 0, 0.75], [0.9, -0.2, 0, 0.75], [0.3, 0.5, 0, 0.7]].map(([a, b, c, r], i) => <mesh key={i} position={[a, b, c]}><icosahedronGeometry args={[r, 1]} /><meshBasicMaterial color="#cfe0ff" toneMapped={false} /></mesh>)}
  <Bx p={[0, 0, 1.2]} s={[2.6, 0.22, 0.1]} c="#e8302a" e="#e8302a" ei={0.8} r={[0, 0, 0.7]} /><Bx p={[0, 0, 1.2]} s={[2.6, 0.22, 0.1]} c="#e8302a" e="#e8302a" ei={0.8} r={[0, 0, -0.7]} />
  <Glow position={[0, 0, 0]} size={3.5} color="#ff6a50" opacity={0.15} /></group>;
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const t = sec(18, f);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><CFlash at={[2]} k={0.9} color="#ffffff" len={10} /><Stamp f={f} at={2} text="UNEXPLAINED" y={560} size={118} rot={-6} /><Pill text="SWEDEN'S OWN STAFF" y={236} variant="red" delay={loc(41.0, 18)} size={44} />
    {t >= 41.7 && <Pill text="NOT NATURE" y={1000} variant="dark" delay={loc(41.7, 18)} size={46} />}{t >= 42.56 && <Pill text="NOT AIRCRAFT" y={1090} variant="dark" delay={loc(42.56, 18)} size={46} />}</>}>
    <ShotCam preset="push" from={[1, 5.5, 10]} to={[0.4, 4.2, 6]} look={[[1.2, 0.3, 0.6], [0, 3.2, -6]]} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.6} shakeFrom={2} shakeLen={14} />
    <FolderTable frame={f} litIndex={7} /><Icon x={-1.7} kind="tree" show={t >= 41.7} f={f} /><Icon x={1.7} kind="plane" show={t >= 42.56} f={f} /><Post bloom={1.5} threshold={0.4} vignette={0.45} /></Stage>; };
// 19 imagination crossed out
S[19] = () => { const f = useCurrentFrame(); const d = dur(19);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<><Pill text="NOT IMAGINATION" y={236} variant="red" delay={loc(43.65, 19)} size={48} /></>}>
    <ShotCam preset="push" from={[0, 3.2, 12]} to={[0, 3.2, 5]} look={[[0, 3.2, -6], [0, 3.2, -6]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <group position={[0, 0, 0]}><Icon x={0} kind="cloud" show f={f} /></group><Particles kind="motes" center={[0, 3, -4]} area={[12, 6, 6]} count={50} frame={f} color="#cfe0ff" opacity={0.6} /><Post bloom={1.5} threshold={0.4} vignette={0.45} /></Stage>; };
// 20 secret US review (IMG3) + 2 or 3 were real
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const t = sec(20, f); const p1 = loc(45.1, 20);
  return <Stage palette={ROOM} fog={[30, 120]} overlay={<>{f >= p1 && <PhotoCard src="ghostrockets/IMG3.png" credit="Declassified US Top Secret document, 1948 · National Archives · public domain" tag="SECRET AMERICAN FILES" delay={p1} dur={d - p1} />}
    {t >= 46.6 && <Pill text={t >= 47.8 ? '2-3 WERE REAL' : 'MAYBE 2 OR 3...'} y={236} variant="red" delay={loc(46.6, 20)} size={48} />}<Stamp f={f} at={loc(45.6, 20)} text="SECRET" y={1500} size={110} rot={-9} /><CFlash at={[loc(47.84, 20)]} k={0.35} color="#ffffff" len={7} /></>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={-0.3} a1={0.5} r0={12} r1={9} h0={6} h1={5} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Desk papers={9} frame={f} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 21 meteors over the village (the rest)
S[21] = () => { const f = useCurrentFrame(); const d = dur(21); const t = sec(21, f);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<><Pill text="THE REST?" y={236} variant="yellow" delay={loc(48.78, 21)} size={52} />{t >= 49.56 && <Pill text="METEORS" y={316} variant="red" delay={loc(49.56, 21)} size={46} />}<CFlash at={[loc(49.6, 21)]} k={0.3} color="#ffe8c0" len={6} /></>}>
    <ShotCam preset="push" from={[0, 2.4, 20]} to={[0, 3.2, 12]} look={[[0, 10, -40], [0, 13, -40]]} fov0={62} fov1={54} start={0} end={d} ease="inout" />
    <Sky f={f} /><Hamlet frame={f} />
    {Array.from({length: 7}, (_, i) => { const u = ((f * 0.045 + i * 0.31) % 1); return <Meteor key={i} position={[-34 + i * 11 + u * 26, 30 - u * 22 - (i % 3) * 3, -50 - (i % 3) * 8]} dir={[1, -0.8, 0]} len={16} size={2.6} />; })}
    <Post bloom={1.7} threshold={0.35} vignette={0.3} /></Stage>; };
// 22 fireworks burst over the village (hit @50.3)
S[22] = () => { const f = useCurrentFrame(); const d = dur(22);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<><Pill text="FIREWORKS" y={236} variant="red" delay={2} size={54} /><CFlash at={[1, 14]} k={0.55} color="#ffd0a0" len={7} /></>}>
    <ShotCam preset="push" from={[0, 2.2, 18]} to={[0, 3.0, 13]} look={[[0, 11, -36], [0, 12, -36]]} fov0={62} fov1={56} start={0} end={d} ease="inout" shake={0.5} shakeFrom={1} shakeLen={12} />
    <Sky f={f} /><Hamlet frame={f} />
    <Burst kind="sparks" position={[-4, 14, -36]} start={1} frame={f} count={110} speed={0.55} up={0.0} spread={2.0} gravity={0.01} life={50} color="#ff5a4a" />
    <Burst kind="sparks" position={[8, 17, -40]} start={9} frame={f} count={110} speed={0.55} up={0.0} spread={2.0} gravity={0.01} life={50} color="#ffd84a" />
    <Burst kind="sparks" position={[-14, 12, -34]} start={17} frame={f} count={90} speed={0.5} up={0.0} spread={2.0} gravity={0.01} life={50} color="#7affc0" />
    <Post bloom={1.8} threshold={0.3} vignette={0.3} /></Stage>; };
// 23 the question: rockets in the sky again, crane up
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={NIGHT} fog={[40, 240]} overlay={<><Pill text="WHAT CROSSED THOSE SKIES?" y={236} variant="yellow" delay={loc(51.5, 23)} size={40} /></>}>
    <ShotCam preset="crane" target={[0, 6, -34]} h0={1.5} h1={10} r0={44} r1={58} angle={0.1} lookY0={6} lookY1={9} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Sky f={f} />{[0, 1, 2].map((i) => <Rocket key={i} position={[-30 + ((f * 0.5 + i * 28) % 80), 12 + i * 4, -36 - i * 8]} rotation={[0, 0, 0.05]} scale={2} fire={1.1} frame={f + i * 9} />)}
    <Post bloom={1.6} threshold={0.38} vignette={0.3} /></Stage>; };
// 24 three options floating: missiles / meteors / something else
S[24] = () => { const f = useCurrentFrame(); const d = dur(24);
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<><Pill text="SOVIET MISSILES?" y={236} variant="red" delay={loc(53.56, 24)} size={44} /><Pill text="METEORS?" y={316} variant="yellow" delay={loc(54.36, 24)} size={44} /><Pill text="SOMETHING ELSE?" y={396} variant="dark" delay={loc(55.0, 24)} size={44} /></>}>
    <ShotCam preset="push" from={[0, 5, 24]} to={[0, 6, 19]} look={[[0, 7, -4], [0, 7, -4]]} fov0={54} fov1={48} start={0} end={d} ease="inout" />
    <Stars count={320} radius={120} />
    <Rocket position={[-6.5, 7 + Math.sin(f * 0.1) * 0.3, -4]} rotation={[0, 0.5, 0.2]} scale={0.8} fire={1} frame={f} />
    <Meteor position={[1.5 + Math.sin(f * 0.05), 8, -4]} dir={[1, -0.7, 0]} len={5} size={1.4} />
    <group position={[6, 7 + Math.sin(f * 0.08) * 0.4, -4]}><mesh><icosahedronGeometry args={[0.8, 1]} /><meshBasicMaterial color="#cfffe8" toneMapped={false} /></mesh><Glow position={[0, 0, 0]} size={7} color="#9affd0" opacity={0.7} /></group>
    <Post bloom={1.6} threshold={0.35} vignette={0.35} /></Stage>; };
// 25 loop: back to the opening frame + end card
S[25] = () => { const f = useCurrentFrame(); const d = dur(25); const x = 0;
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><Pill text="TELL ME BELOW" y={1130} variant="red" delay={2} size={46} /><EndCard delay={2} sources={['SWEDISH DEFENCE STAFF 1946', 'US WAR DEPT REVIEW 1947', 'WIKIPEDIA']} /></>}>
    <ShotCam preset="push" from={[0, 2.2, 12]} to={[0, 2.25, 11.5]} look={[[0, 4.4, -20], [0, 4.4, -20]]} fov0={56} fov1={56} start={0} end={d} ease="inout" />
    <Sky f={f} /><Rocket position={[x, 4.4, -20]} rotation={[0, Math.PI, 0.05]} scale={2.0} fire={1.2} frame={f} /><Post bloom={1.6} threshold={0.4} vignette={0.3} /></Stage>; };

export const Gr = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? GR_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
