// "The Goblins at the Door" (Kelly-Hopkinsville, Kentucky, 1955) - low-poly 3D Short, ANIMATION UPGRADE kit.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, OutlineScope, Person, Particles, Burst, FogLayer, LightCone, Car, Tree, Fence, Building,
  Grade, KineticCard, cueLine, clamp01, mixPalette, PALETTES} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Field, Road, Creature, Owl, Inside, Clock, Bed, Meteor, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const HOP_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.74, 4.28, 6.59, 9.74, 12.0, 14.72, 17.08, 19.41, 20.76, 22.16, 24.34, 26.52, 29.28, 31.0, 33.67, 35.84, 38.96, 40.96, 44.76, 46.96, 49.36, 51.52, 53.72];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? HOP_FRAMES) - C[i];
const sec = (i, f) => CS[i] + f / FPS;
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const ease = (u) => u * u * (3 - 2 * u);

const NIGHT = {top: '#070d26', mid: '#1c2c5e', hor: '#4a5e96', fog: '#16224a', amb: 1.1, hemiSky: '#9ab0f0', hemiGround: '#34402c', hemiI: 1.8, sun: '#b8c8ff', sunI: 2.0, sunPos: [-14, 30, 12], rim: '#7a98e8', rimI: 1.6, rimPos: [18, 10, -24], glow: 0.9};
const ROOMP = {top: '#140e08', mid: '#2c1e12', hor: '#6a4624', fog: '#1e150c', amb: 1.2, hemiSky: '#ffd0a0', hemiGround: '#4a3a2c', hemiI: 1.6, sun: '#ffdca8', sunI: 1.1, sunPos: [3, 8, 6], rim: '#7a98e8', rimI: 1.4, rimPos: [-6, 3, -6], glow: 1};
const DAWN = {top: '#5a6ca8', mid: '#e0a07a', hor: '#ffd8a0', fog: '#caa890', amb: 1.2, hemiSky: '#ffe0c0', hemiGround: '#5a6a3a', hemiI: 1.5, sun: '#ffd8a0', sunI: 2.2, sunPos: [-20, 8, -20], rim: '#ffb870', rimI: 1.2, rimPos: [10, 6, 10], glow: 0.7};
const DESKP = {...ROOMP, top: '#0a0e18', mid: '#1c2432', hor: '#3a4658', fog: '#10161f', hemiSky: '#a0b8e0', hemiI: 1.8};
const SKIN = {skin: '#d8a880'};
const UNI = {shirt: '#2a3a6a', pants: '#1c2440', hair: '#2a1d16', skin: '#d8a880'};
const ADULT = [{shirt: '#a84a3a', pants: '#2a3a5a', skin: '#d8a880'}, {shirt: '#4a7a5a', pants: '#3a2a22', skin: '#c89870'}, {shirt: '#d8c8a0', pants: '#2a3a5a', skin: '#e0b890'}, {shirt: '#6a5a9a', pants: '#2a2a3a', skin: '#d8a880'}, {shirt: '#c89848', pants: '#3a3a4a', skin: '#c89870'}];
const KID = [{shirt: '#d8584a', pants: '#3a4a7a'}, {shirt: '#58a8d8', pants: '#4a3a2a'}, {shirt: '#e8d048', pants: '#3a3a5a'}, {shirt: '#78c858', pants: '#5a3a2a'}, {shirt: '#d878b8', pants: '#3a4a6a'}, {shirt: '#e89858', pants: '#2a3a5a'}, {shirt: '#98a8e8', pants: '#4a3a3a'}];

const Chip = ({f, d, x, y, text, c = '#ff5a40'}) => f < d ? null : <div style={{position: 'absolute', left: x, top: y - Math.min(f - d, 30) * 1.2, transform: `scale(${Math.min(1, (f - d) / 5)}) rotate(${(x % 7) - 3}deg)`, opacity: f - d > 40 ? 1 - (f - d - 40) / 10 : 1, fontFamily: 'Lilita One', fontSize: 120, color: '#fff', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', background: 'transparent'}}>{text}</div>;
const Q = ({f, items}) => <>{items.map(([x, y, d], i) => { const t = f - d; if (t < 0) return null; const rise = Math.min(t, 60) * 1.2; const s = Math.min(1, t / 6);
  return <div key={i} style={{position: 'absolute', left: x, top: y - rise, fontFamily: 'Lilita One', fontSize: 150, color: '#ffe35a', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', transform: `scale(${s}) rotate(${(i % 2 ? 8 : -8)}deg)`, opacity: t > 50 ? 1 - (t - 50) / 14 : 1}}>?</div>; })}</>;

// ---- shared night farm ----
const TREES = [[-9, -6, 1.7], [-12, -1, 2.0], [-10, 5, 1.6], [10, -5, 1.9], [12, 1, 1.7], [9, 8, 1.6], [6, -9, 1.5], [-4, -10, 1.8], [2, -12, 2.1], [-15, -8, 2.2], [15, -6, 2.0]];
const Farm = ({f, lit = 1, children, fog = true, glow = 1, door = true}) => <>
  <Field /><Road z={16} />
  <Building position={[0, 0, 0]} w={6} d={4} h={2.6} roof={1.4} color="#c8bca0" roofColor="#6a4a3a" lit={lit} litSeed={5} door={door} scale={1.3} frame={f} glow={glow} />
  <Bx p={[-3.6, 4.2, -0.4]} s={[0.7, 1.8, 0.7]} c="#8a6a5a" />
  {TREES.map(([x, z, s], i) => <Tree key={i} position={[x, height(x, z), z]} s={s} color={i % 2 ? '#2a4a30' : '#34603a'} seed={i + 1} frame={f} wind={0.6} />)}
  <Fence from={[-9, 0, 9]} to={[-2, 0, 11]} posts={7} /><Fence from={[2, 0, 11]} to={[9, 0, 9]} posts={7} /><Fence from={[-9, 0, -4]} to={[-9, 0, 9]} posts={8} />
  <group position={[5.2, 0, 4.5]}><Cy p={[0, 0.35, 0]} a={[0.5, 0.55, 0.7, 8]} c="#8a8a8a" /><Bx p={[-0.5, 1.0, 0]} s={[0.08, 1.2, 0.08]} c="#5a4028" /><Bx p={[0.5, 1.0, 0]} s={[0.08, 1.2, 0.08]} c="#5a4028" /><Bx p={[0, 1.65, 0]} s={[1.3, 0.1, 0.9]} c="#4a3224" r={[0, 0, 0]} /></group>
  {children}
  {fog && <FogLayer y={0.4} size={90} layers={3} thickness={1.0} color="#4a5a7a" opacity={0.12} frame={f} />}
  <Particles kind="motes" center={[0, 2, 6]} area={[24, 5, 22]} count={46} frame={f} color="#d8ff90" size={0.07} opacity={0.5} speed={0.5} />
</>;
const Siren = ({position = [0, 0, 0], rotation = 0, color = '#161620', dist = 0, f = 0, cone = true, bar = true, pickup = false}) => <group position={position} rotation={[0, rotation, 0]}>
  <Car position={[0, 0, 0]} rotation={0} dist={dist} color={color} cabin="#8aa0b8" pickup={pickup} />
  {bar && <><Bx p={[-0.35, 1.78, -0.1]} s={[0.5, 0.14, 0.3]} c="#ff2a20" e="#ff2a20" ei={Math.sin(f * 0.9) > 0 ? 3 : 0.2} /><Bx p={[0.35, 1.78, -0.1]} s={[0.5, 0.14, 0.3]} c="#2a5aff" e="#2a5aff" ei={Math.sin(f * 0.9) > 0 ? 0.2 : 3} />
    <pointLight position={[0, 2.2, 0]} color={Math.sin(f * 0.9) > 0 ? '#ff4a3a' : '#4a6aff'} intensity={5} distance={9} /></>}
  {[-0.55, 0.55].map((x) => <Bx key={x} p={[x, 0.75, 1.82]} s={[0.3, 0.2, 0.06]} c="#fff6d0" e="#fff0b0" ei={3} />)}
  {cone && <LightCone position={[0, 0.8, 1.9]} dir={[0, -0.06, 1]} length={11} radius={2.6} frame={f} color="#fff0c0" opacity={0.3} />}
</group>;
const Gun = ({p, r = [0, 0, 0], l = 1.3}) => <group position={p} rotation={r}><Bx p={[0, 0, 0]} s={[0.07, 0.09, l]} c="#2a2420" /><Bx p={[0, -0.02, -l * 0.35]} s={[0.08, 0.14, l * 0.4]} c="#6a4a30" /></group>;
const Crowd = ({f}) => <>{[...ADULT.map((c, i) => ({c, x: -4.2 + i * 2.1, z: 5.4 + (i % 2) * 0.8, s: 0.78, i})), ...KID.map((c, i) => ({c, x: -3.4 + i * 1.15, z: 7.4 + (i % 2) * 0.7, s: 0.52, i: i + 5}))].map(({c, x, z, s, i}) =>
  <OutlineScope key={i} thickness={0.025}><Person position={[x, height(x, z), z]} rotation={Math.sin(i) * 0.3} scale={s} pose="stand" phase={f / 3 + i * 1.7} shadow {...c} /></OutlineScope>)}</>;
const mflash = (f, at0, k = 8) => (f >= at0 && f < at0 + k) ? 1 - (f - at0) / k : 0;

const S = [];
// 0 HOOK: twelve people (5 adults + 7 children) in the yard, muzzle flash at "gunfire"
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const g = loc(1.76, 0);
  return <Stage palette={NIGHT} fog={[30, 120]} overlay={<><CFlash at={[g, g + 12]} k={0.5} color="#fff0b0" />
    <KineticCard lines={[cueLine(W, 'Twelve', 0, 'Twelve'), cueLine(W, 'people.', 0.12, 'people')]} y={300} size={110} hideAt={2.7} />
    <Pill text="5 ADULTS · 7 CHILDREN" y={236} variant="yellow" delay={at(0.5)} size={40} /></>}>
    <ShotCam preset="crane" target={[0, 1.6, 4]} h0={0.9} h1={5.5} r0={13} r1={17} angle={0.1} lookY0={1.5} lookY1={2.6} fov0={58} fov1={52} start={0} end={d} ease="inout" shake={0.14} shakeFrom={g} shakeLen={14} />
    <Farm f={f} /><Crowd f={f} />
    <Burst kind="sparks" position={[-0.98 * 1.0, 2.0, 2.8]} start={g} frame={f} count={26} color="#ffe070" floorY={0} />
    <pointLight position={[-1, 2.2, 3.4]} color="#ffe090" intensity={mflash(f, g, 8) * 40} distance={14} /><Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 1 sixteen officers race down the road
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const u = ease(clamp01(f / d));
  return <Stage palette={NIGHT} fog={[30, 120]} overlay={<>{kc(1, 'Sixteen officers.', 2.74, 'Sixteen', 300, 100, 4.2)}<Pill text="4 CITY POLICE · 5 TROOPERS · 3 DEPUTIES · 4 MPs" y={236} variant="dark" delay={at(0.3)} size={30} /></>}>
    <ShotCam preset="push" from={[4, 1.7, 22]} to={[-2, 1.7, 22]} look={[[30, 1.2, 15.2], [-30, 1.2, 15.2]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Farm f={f} />
    {[0, 1, 2].map((k) => <Siren key={k} position={[30 - u * 60 + k * 7, 0, 15.2]} rotation={-Math.PI / 2} dist={u * 70} f={f} color={k === 2 ? '#3a4a30' : '#161620'} pickup={k === 2} />)}
    <Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 2 and no creature was ever found: empty yard, flashlight sweeps
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const t = f / FPS; const a = Math.sin(t * 1.6) * 0.7;
  return <Stage palette={NIGHT} fog={[24, 100]} overlay={<>{kc(2, 'ever found.', 5.32, 'found.', 300, 120)}<Q f={f} items={[[150, 700, at(1.0)], [800, 640, at(1.5)], [470, 560, at(2.0)]]} /><Pill text="NO CREATURE FOUND" y={236} variant="red" delay={at(0.4)} size={42} /></>}>
    <ShotCam preset="push" from={[5, 1.7, 17]} to={[1, 1.8, 14]} look={[[0, 1.4, 2], [0, 1.2, 2]]} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <Farm f={f} />
    <LightCone position={[2.4, 1.5, 9.6]} dir={[Math.sin(a - 0.3) * 0.6, -0.12, -1]} length={12} radius={2.2} frame={f} color="#fff6d0" opacity={0.4} />
    <OutlineScope thickness={0.03}><Person position={[2.4, 0, 9.8]} rotation={Math.PI + a * 0.4} scale={0.85} pose="walk" phase={f / 4.5} shadow {...UNI} /></OutlineScope>
    <Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 3 Kelly, Kentucky, 1955: aerial + map card
S[3] = () => { const f = useCurrentFrame(); const d = dur(3);
  return <Stage palette={NIGHT} fog={[50, 190]} overlay={<PhotoCard src="hopkinsville/IMG3.jpg" credit="Kentucky map · Alexrk2 · CC BY 3.0 · Wikimedia Commons" tag="KELLY, KENTUCKY · 1955" delay={at(0.4)} dur={d} rot={2} zoom={[1.02, 1.1]} pan={[0, -10]} />}>
    <ShotCam preset="crane" target={[0, 1, 2]} h0={3} h1={24} r0={14} r1={30} angle={0.6} lookY0={2} lookY1={0} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Farm f={f} /><Post bloom={1.1} threshold={0.5} vignette={0.35} /></Stage>; };
// 4 at a farmhouse: orbit with the family on the yard
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={NIGHT} fog={[30, 120]} overlay={<Pill text="THE FARMHOUSE · NEAR KELLY" y={236} variant="yellow" delay={at(0.4)} size={40} />}>
    <ShotCam preset="orbit" target={[0, 1.8, 2]} a0={-0.6} a1={0.5} r0={14} r1={10} h0={2.2} h1={3.4} fov0={54} fov1={48} start={0} end={d} ease="inout" />
    <Farm f={f} /><Crowd f={f} /><Post bloom={1.2} threshold={0.45} vignette={0.35} /></Stage>; };
// 5 creatures keep appearing at the windows: a face rises in the window
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const r1 = ease(clamp01((f - at(0.3)) / 14)); const r2 = ease(clamp01((f - at(1.5)) / 12));
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<><Pill text="AT THE WINDOWS" y={236} variant="red" delay={at(0.8)} size={44} /><CFlash at={[at(0.7)]} k={0.35} color="#ffee90" /></>}>
    <ShotCam preset="push" from={[1.8, 2.0, 3.8]} to={[0.2, 1.9, 0.2]} look={[[0, 1.9, -3], [0, 1.9, -3]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <Inside lamp={1} />
    <Creature position={[0, -0.9 + r1 * 1.0, -4.2]} rotation={0} scale={1.0} frame={f} arms={0.4 + 0.5 * r1} />
    <Creature position={[-1.0, -1.2 + r2 * 1.2, -4.8]} rotation={0.2} scale={0.9} frame={f + 9} arms={0.8} />
    <OutlineScope thickness={0.03}><Person position={[-1.9, 0, 0.6]} rotation={Math.PI * 0.85} scale={0.95} pose="recoil" actT={clamp01((f - at(1.0)) / 12)} phase={f / 3} shadow {...ADULT[0]} /></OutlineScope>
    <Particles kind="dust" center={[0, 2.5, 0]} area={[8, 3, 6]} count={30} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.3} threshold={0.4} vignette={0.35} /></Stage>; };
// 6 the men fire again and again
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const shots = [at(0.35), at(0.85), at(1.45), at(2.05)]; const fl = Math.max(...shots.map((s) => mflash(f, s, 7)));
  return <Stage palette={ROOMP} fog={[14, 70]} overlay={<>{kc(6, 'again and again.', 15.24, 'again', 300, 100, 17.0)}<Pill text="ABOUT 4 HOURS OF GUNFIRE (THEIR CLAIM)" y={236} variant="dark" delay={at(0.2)} size={30} /><CFlash at={shots} k={0.5} color="#fff0b0" /></>}>
    <ShotCam preset="push" from={[1.4, 1.9, 1.8]} to={[0.5, 1.8, 0.6]} look={[[0, 1.7, -4], [0, 1.7, -4]]} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.12} shakeFrom={shots[0]} shakeLen={10} />
    <Inside lamp={0.8} />
    <OutlineScope thickness={0.03}><Person position={[-0.3, 0, -0.8]} rotation={Math.PI} scale={1.0} pose="point" phase={f / 3} shadow {...ADULT[1]} /></OutlineScope>
    <Gun p={[-0.55, 1.45, -1.7]} r={[0, 0, 0]} />
    <Creature position={[0.2, 0, -8.5]} rotation={0} scale={1.05} frame={f} arms={0.8} />
    {shots.map((s, i) => <Burst key={i} kind="sparks" position={[-0.55, 1.45, -2.4]} start={s} frame={f} count={14} color="#ffe070" floorY={0} dir={[0, 0.2, -1]} />)}
    <pointLight position={[-0.5, 1.6, -2.2]} color="#ffe090" intensity={fl * 45} distance={12} /><Post bloom={1.3} threshold={0.45} vignette={0.4} /></Stage>; };
// 7 bullets ring like a tin can: spark on the chest, creature rocks back
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const h = at(18.34 - CS[7]); const rec = clamp01((f - h) / 8); const lean = -0.35 * Math.sin(rec * Math.PI) * (rec < 1 ? 1 : 0);
  return <Stage palette={NIGHT} fog={[24, 100]} overlay={<>{kc(7, 'tin can.', 18.14, 'tin', 300, 130, 19.3)}<CFlash at={[h]} k={0.3} color="#fff0c0" />{f >= h && <Chip f={f} d={h} x={620} y={800} text="CLANG" />}</>}>
    <ShotCam preset="push" from={[3, 1.4, 11.5]} to={[1.6, 1.3, 9.0]} look={[[0, 1.1, 4.6], [0, 1.1, 4.6]]} fov0={52} fov1={40} start={0} end={d} ease="ramp" shake={0.15} shakeFrom={h} shakeLen={10} />
    <Farm f={f} /><Creature position={[0, 0, 4.6]} rotation={0.3} scale={1.15} frame={f} arms={0.8} lean={lean} glow={0.1} />
    <Burst kind="sparks" position={[0.1, 1.1, 5.0]} start={h} frame={f} count={22} color="#ffe8a0" floorY={0} /><Post bloom={1.0} threshold={0.8} vignette={0.35} ca={0.0012} /></Stage>; };
// 8 they float to the ground: creature drifts down from a tree
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const u = ease(clamp01(f / (d * 0.95))); const y = 4.6 * (1 - u);
  return <Stage palette={NIGHT} fog={[24, 100]} overlay={<Pill text="THEY FLOAT TO THE GROUND" y={236} variant="yellow" delay={at(0.3)} size={38} />}>
    <ShotCam preset="push" from={[-2.5, 1.6, 11]} to={[0.2, 1.9, 9.0]} look={[[2.4, 2.8, 3.8], [2.4, 1.6, 3.8]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Farm f={f} /><Tree position={[3.2, 0, 3]} s={2.6} color="#34603a" seed={3} frame={f} wind={0.6} />
    <Creature position={[2.4 - u * 0.4, y, 4.0]} rotation={0.5} scale={1.1} frame={f} arms={0.95} glow={0.5} />
    <Particles kind="motes" center={[2.4, 2.4, 4]} area={[2, 4.5, 2]} count={22} frame={f} color="#d8ff90" size={0.08} opacity={0.7} speed={0.4} /><Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 9 REVEAL: then slip away into the dark
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const r = at(20.94 - CS[9]); const u = clamp01((f - r) / 22); const x = -u * u * 16;
  return <Stage palette={NIGHT} fog={[24, 100]} overlay={<><CFlash at={[r, r + 5]} k={0.7} color="#d8ffb0" />{kc(9, 'slip away.', 20.94, 'slip', 300, 130, 22.0)}</>}>
    <ShotCam preset="push" from={[6, 1.5, 13]} to={[3.4, 1.4, 11]} look={[[0, 1.1, 4.8], [-2, 1.1, 4.8]]} fov0={50} fov1={40} start={0} end={d} ease="ramp" shake={0.2} shakeFrom={r} shakeLen={12} />
    <Farm f={f} /><Creature position={[x, 0.02, 4.8]} rotation={-1.2 + 0.4 * u} scale={1.1} frame={f * (1 + 2 * u)} arms={0.9} opacity={1 - clamp01((u - 0.7) / 0.3)} glow={0.6} />
    <Burst kind="sparks" position={[0, 1.1, 4.8]} start={r} frame={f} count={34} color="#c8ff90" floorY={0} /><Particles kind="motes" center={[x * 0.5, 1.2, 4.8]} area={[8, 2, 1.4]} count={30} frame={f} color="#d8ff90" size={0.09} opacity={0.8} speed={0.8} />
    <Post bloom={1.5} threshold={0.4} vignette={0.4} ca={0.0014} /></Stage>; };
// 10 the children hide under the beds
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={{...ROOMP, amb: 1.0, hemiI: 1.4}} fog={[10, 40]} overlay={<><Pill text="CHILDREN UNDER THE BEDS" y={236} variant="yellow" delay={at(0.3)} size={40} /><CFlash at={[at(1.2)]} k={0.3} color="#fff0b0" /></>}>
    <ShotCam preset="push" from={[3.4, 1.6, 4.2]} to={[1.3, 1.2, 2.6]} look={[[0, 0.6, -0.3], [0, 0.5, -0.2]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <Inside lamp={0.5} /><Bed position={[0, 0, -0.5]} eyes={0.7 + 0.3 * Math.sin(f * 0.3)} />
    <Particles kind="dust" center={[0, 1, 0]} area={[8, 2, 6]} count={30} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 11 the family drives to town
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const u = ease(clamp01(f / d));
  return <Stage palette={NIGHT} fog={[30, 120]} overlay={<Pill text="THE FAMILY DRIVES TO TOWN" y={236} variant="yellow" delay={at(0.3)} size={38} />}>
    <ShotCam preset="push" from={[6, 1.7, 22]} to={[8, 1.8, 22]} look={[[-20, 1, 15.2], [26, 1, 15.2]]} fov0={50} fov1={46} start={0} end={d} ease="inout" />
    <Farm f={f} />
    <Siren position={[-20 + u * 46, 0, 15.2]} rotation={Math.PI / 2} dist={u * 60} f={f} color="#6a8a9a" bar={false} />
    {Array.from({length: 18}, (_, i) => <Bx key={i} p={[34 + (i % 6) * 2.2, 1 + (i % 3), 6 - Math.floor(i / 6) * 3]} s={[0.8, 0.9 + (i % 3) * 0.5, 0.8]} c="#2a2a3a" e="#ffd070" ei={1.6} />)}
    <Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 12 police and soldiers race to the farm
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const u = ease(clamp01(f / d));
  return <Stage palette={NIGHT} fog={[30, 130]} overlay={<Pill text="POLICE · TROOPERS · SOLDIERS" y={236} variant="red" delay={at(0.3)} size={42} />}>
    <ShotCam preset="push" from={[-8, 1.8, 22]} to={[4, 1.9, 21]} look={[[26, 1, 15.2], [-26, 1, 15.2]]} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <Farm f={f} />
    {[0, 1, 2, 3].map((k) => <Siren key={k} position={[26 - u * 52 + k * 6.5, 0, 15.2]} rotation={-Math.PI / 2} dist={u * 80} f={f + k * 3} color={k === 3 ? '#3a4a30' : '#161620'} pickup={k === 3} />)}
    <Particles kind="dust" center={[0, 0.5, 15]} area={[30, 2, 4]} count={40} frame={f} color="#c8c0a8" opacity={0.4} speed={2} />
    <Post bloom={1.3} threshold={0.45} vignette={0.35} /></Stage>; };
// 13 they find broken windows
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[20, 80]} overlay={<><Pill text="BROKEN WINDOWS" y={236} variant="red" delay={at(0.7)} size={46} /><CFlash at={[at(0.1)]} k={0.3} color="#fff6d0" /></>}>
    <ShotCam preset="push" from={[1.2, 2.2, 7.4]} to={[-0.4, 2.0, 4.8]} look={[[-0.98, 1.96, 2.7], [-1.0, 1.96, 2.7]]} fov0={50} fov1={36} start={0} end={d} ease="inout" />
    <Farm f={f} />
    <group position={[-0.98 * 1.3, 1.96, 2.68]}>{[[0.0, 0.1, 0.5], [0.15, -0.1, -0.7], [-0.2, 0.25, 1.0], [0.25, 0.28, -0.4]].map(([x, y, r], i) => <Bx key={i} p={[x, y, 0.04]} s={[0.04, 0.5, 0.02]} c="#06080e" r={[0, 0, r]} />)}</group>
    <Burst kind="debris" position={[-1.27, 1.9, 2.8]} start={at(0.05)} frame={f} count={24} color="#bfe4ff" floorY={0} />
    <LightCone position={[1.8, 1.7, 7.0]} dir={[-0.3 + Math.sin(t * 2) * 0.1, 0.0, -1]} length={8} radius={1.6} frame={f} color="#fff6d0" opacity={0.4} />
    <Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 14 holes in the screens, nothing else
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const t = f / FPS;
  return <Stage palette={NIGHT} fog={[20, 80]} overlay={<><Pill text="HOLES IN THE SCREENS" y={236} variant="yellow" delay={at(0.3)} size={42} />{t >= 1.7 && <Pill text="NOTHING ELSE" y={312} variant="red" delay={at(1.7)} size={46} />}</>}>
    <ShotCam preset="push" from={[2.2, 1.5, 6.6]} to={[1.0, 1.0, 4.4]} look={[[0.98 * 1.3, 0.9, 2.7], [1.3, 0.8, 2.7]]} fov0={50} fov1={38} start={0} end={d} ease="inout" />
    <Farm f={f} />
    <group position={[1.27, 0.7, 2.72]}><Bx s={[0.9, 1.4, 0.06]} c="#3a2a1c" /><Bx p={[0, 0, 0.02]} s={[0.78, 1.28, 0.02]} c="#a8b0b0" o={0.55} />
      {[[-0.15, 0.3], [0.2, -0.1], [-0.1, -0.4], [0.18, 0.45]].map(([x, y], i) => <Cy key={i} p={[x, y, 0.04]} a={[0.07, 0.07, 0.03, 8]} c="#05060a" r={[Math.PI / 2, 0, 0]} />)}</group>
    <LightCone position={[2.4, 1.4, 6.0]} dir={[-0.5, -0.1, -1]} length={8} radius={1.4} frame={f} color="#fff6d0" opacity={0.4} />
    <Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 15 by morning the family has fled: dawn, empty yard, door ajar
S[15] = () => { const f = useCurrentFrame(); const d = dur(15);
  return <Stage palette={DAWN} fog={[30, 140]} overlay={<Pill text="BY MORNING: GONE" y={236} variant="yellow" delay={at(0.3)} size={44} />}>
    <ShotCam preset="crane" target={[0, 1.8, 2]} h0={1.2} h1={7} r0={9} r1={15} angle={-0.3} lookY0={1.6} lookY1={2.6} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Farm f={f} lit={0} glow={0} door={false} fog={false} />
    <Bx p={[1.27, 0.85, 2.65]} s={[0.9, 1.7, 0.06]} c="#5a3b24" r={[0, 0.9, 0]} />
    <mesh position={[-30, 12, -50]}><sphereGeometry args={[4.5, 12, 10]} /><meshBasicMaterial color="#fff0c0" toneMapped={false} fog={false} /></mesh>
    <Particles kind="dust" center={[0, 2, 6]} area={[20, 4, 16]} count={40} frame={f} color="#ffe8c0" opacity={0.5} speed={0.5} /><Post bloom={1.1} threshold={0.55} vignette={0.3} /></Stage>; };
// 16 they came back at three thirty: clock + face in the window
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const r1 = ease(clamp01((f - at(1.4)) / 14));
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<>{kc(16, 'three thirty,', 37.08, 'three', 300, 110, 38.6)}<CFlash at={[at(1.4)]} k={0.4} color="#ffee90" /></>}>
    <ShotCam preset="push" from={[1.4, 2.2, 3.4]} to={[-0.2, 2.2, 0.8]} look={[[-2.6, 2.4, -2.7], [-1.2, 2.1, -2.8]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <Inside lamp={0.4} /><Clock position={[-2.9, 2.9, -2.7]} hour={3} min={30} scale={1.0} />
    <Creature position={[0, -0.9 + r1 * 1.0, -4.2]} rotation={0} scale={1.0} frame={f} arms={0.5} />
    <Particles kind="dust" center={[0, 2.5, 0]} area={[8, 3, 6]} count={30} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.3} threshold={0.4} vignette={0.4} /></Stage>; };
// 17 LOOP3: and here's the strange part: the Air Force desk
S[17] = () => { const f = useCurrentFrame(); const d = dur(17);
  return <Stage palette={DESKP} fog={[12, 50]} overlay={<>{kc(17, 'strange part.', 39.46, 'strange', 300, 110, 40.8)}<Pill text="A HOAX?" y={236} variant="red" delay={at(0.3)} size={50} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, 0]} a0={0.6} a1={-0.3} r0={6.5} r1={4.6} h0={2.8} h1={2.0} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#3a3a3a" /><Bx p={[0, 4, -4]} s={[12, 8, 0.2]} c="#4a5058" />
    <Bx p={[0, 0.9, 0]} s={[4.2, 0.14, 1.9]} c="#8a6a44" />{[-1.9, 1.9].map((x) => <Bx key={x} p={[x, 0.45, 0]} s={[0.14, 0.9, 1.7]} c="#5a4028" />)}
    {[0, 1, 2].map((k) => <Bx key={k} p={[-0.8 + k * 0.5, 1.02 + k * 0.03, 0.1]} s={[0.9, 0.04, 0.65]} c={k === 1 ? '#c8a860' : '#d8c8a0'} r={[0, 0.2 * k - 0.2, 0]} />)}
    <Bx p={[1.4, 1.5, -0.2]} s={[0.1, 1.2, 0.1]} c="#2a2a2a" /><mesh position={[1.4, 2.2, -0.2]}><sphereGeometry args={[0.35, 8, 6]} /><meshLambertMaterial color="#ffe0a0" emissive="#ffb858" emissiveIntensity={1.6} flatShading /></mesh>
    <pointLight position={[1.4, 2.4, 0.2]} color="#ffc878" intensity={8} distance={10} />
    <OutlineScope thickness={0.03}><Person position={[0, 0, -1.3]} rotation={0} scale={1.0} pose="sit" phase={f / 3} shadow {...UNI} /></OutlineScope>
    <Particles kind="dust" center={[0, 2, 0]} area={[8, 3, 6]} count={36} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.2} threshold={0.45} vignette={0.45} /></Stage>; };
// 18 the Air Force's own notes list the case among hoaxes
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const sx = at(43.64 - CS[18]);
  return <Stage palette={DESKP} fog={[12, 50]} overlay={<><DocCard lines={['PROJECT BLUE BOOK', 'LECTURE NOTES, UNDATED', '', 'HOAXES:', '"Hopkinsville Little', ' Green Men case"']} source="SKEPTOID #331 · BLUE BOOK FILES" delay={at(0.3)} top={600} width={880} size={46} highlight={[3, 4, 5]} />
    {f >= sx && <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 130, color: '#d6302a', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', transform: `scale(${1 + Math.max(0, 1 - (f - sx) / 6) * 0.5}) rotate(-6deg)`}}>HOAXES</div>}
    <CFlash at={[sx]} k={0.45} color="#ffd0c0" /></>}>
    <ShotCam preset="push" from={[1.5, 2.8, 4.8]} to={[0.2, 2.0, 2.6]} look={[[0, 1.1, 0], [0, 1.1, 0]]} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Bx p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#3a3a3a" /><Bx p={[0, 4, -4]} s={[12, 8, 0.2]} c="#4a5058" />
    <Bx p={[0, 0.9, 0]} s={[4.2, 0.14, 1.9]} c="#8a6a44" />{[0, 1, 2, 3].map((k) => <Bx key={k} p={[-1.0 + k * 0.6, 1.02 + k * 0.03, 0.1]} s={[0.9, 0.04, 0.65]} c="#d8c8a0" r={[0, 0.2 * k - 0.3, 0]} />)}
    <pointLight position={[1.4, 2.4, 0.2]} color="#ffc878" intensity={8} distance={10} />
    <Particles kind="dust" center={[0, 2, 0]} area={[8, 3, 6]} count={36} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.1} threshold={0.5} vignette={0.45} /></Stage>; };
// 19 skeptics say great horned owls: owl on the fence post turns its head
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const hd = Math.sin(f * 0.08) * 1.1 * clamp01(f / 20);
  return <Stage palette={NIGHT} fog={[20, 90]} overlay={<>{kc(19, 'great horned owls:', 45.38, 'owls', 300, 90, 46.9)}<Pill text="THE SKEPTICS' ANSWER" y={236} variant="yellow" delay={at(0.3)} size={40} /></>}>
    <ShotCam preset="push" from={[3.6, 2.0, 10.4]} to={[1.4, 2.1, 8.4]} look={[[0, 2.1, 3.6], [0, 2.2, 3.6]]} fov0={48} fov1={36} start={0} end={d} ease="inout" />
    <Farm f={f} /><Bx p={[0, 0.7, 3.6]} s={[0.22, 1.4, 0.22]} c="#6a4a30" />
    <Owl position={[0, 1.4, 3.6]} rotation={0} scale={1.1} frame={f} head={hd} />
    <Post bloom={1.3} threshold={0.45} vignette={0.4} /></Stage>; };
// 20 yellow eyes, silent wings: eye closeup then the owl glides past (photo card)
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const t = sec(20, f); const gl = ease(clamp01((t - 48.0) / 1.3));
  return <Stage palette={NIGHT} fog={[20, 90]} overlay={<>{f < at(1.0) && <PhotoCard src="hopkinsville/IMG2.jpg" credit="Great horned owl · brendan.lally · CC BY 2.0 · Wikimedia Commons" tag="YELLOW EYES" delay={0} dur={at(1.0)} rot={-2} zoom={[1.0, 1.08]} pan={[0, -10]} />}{t >= 48.06 && <Pill text="SILENT WINGS" y={236} variant="red" delay={at(48.06 - CS[20])} size={44} />}</>}>
    <ShotCam preset="push" from={[1.4, 2.2, 8.2]} to={[0.6, 2.2, 6.6]} look={[[0, 2.3, 3.6], [-2.0 * gl, 2.5, 3.4 - 2 * gl]]} fov0={30} fov1={44} start={0} end={d} ease="inout" />
    <Farm f={f} />
    <Owl position={[-gl * 5 + 0, 1.4 + gl * 1.2, 3.6 - gl * 2]} rotation={-gl * 1.2} scale={1.1} frame={f} head={0} wings={gl} eyes={3.0} />
    <Bx p={[0, 0.7, 3.6]} s={[0.22, 1.4, 0.22]} c="#6a4a30" />
    <Post bloom={1.5} threshold={0.4} vignette={0.4} /></Stage>; };
// 21 two feet tall, plus meteors
S[21] = () => { const f = useCurrentFrame(); const d = dur(21); const mu = clamp01((f - at(50.34 - CS[21])) / 22) * 1.1;
  return <Stage palette={NIGHT} fog={[20, 90]} overlay={<><Pill text="2 FEET TALL" y={236} variant="yellow" delay={at(0.2)} size={46} />{mu > 0 && <Pill text="PLUS METEORS" y={340} variant="red" delay={at(50.34 - CS[21])} size={44} />}<CFlash at={[at(50.4 - CS[21])]} k={0.3} color="#e8f4ff" /></>}>
    <ShotCam preset="push" from={[3.6, 1.8, 10.4]} to={[1.8, 1.6, 8.4]} look={[[0, 1.0, 3.6], [0, 0.9, 3.6]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Farm f={f} />
    <Owl position={[0, 0.02, 3.6]} rotation={0.4} scale={1.1} frame={f} head={0.3} />
    <group position={[-0.7, 0, 3.6]}><Bx p={[0, 0.7, 0]} s={[0.04, 1.4, 0.04]} c="#e8e0c8" />{[0, 1, 2].map((k) => <Bx key={k} p={[0.07, 0.25 + k * 0.5, 0]} s={[0.16, 0.03, 0.03]} c="#d6302a" />)}</group>
    <Meteor from={[-30, 38, -20]} to={[24, 12, -20]} u={mu} /><Meteor from={[-10, 34, -26]} to={[34, 18, -26]} u={mu - 0.2} len={0.1} />
    <Post bloom={1.3} threshold={0.45} vignette={0.4} /></Stage>; };
// 22 what came to that farmhouse door: knocks, creature vs owl
S[22] = () => { const f = useCurrentFrame(); const d = dur(22); const k = [at(1.4), at(1.9), at(2.4)]; const shake = k.reduce((m, a) => (f >= a && f < a + 6 ? 0.05 : m), 0);
  return <Stage palette={NIGHT} fog={[20, 90]} overlay={<>{kc(22, 'farmhouse door?', 52.34, 'door', 300, 96, 53.7)}<CFlash at={k} k={0.4} color="#ffe8b0" /></>}>
    <ShotCam preset="push" from={[0.5, 1.7, 14]} to={[1.3, 1.5, 9.4]} look={[[1.27, 1.0, 2.7], [1.27, 1.0, 2.7]]} fov0={52} fov1={40} start={0} end={d} ease="inout" shake={0.1} shakeFrom={k[0]} shakeLen={14} />
    <Farm f={f} />
    <Creature position={[-1.8, 0, 6.0]} rotation={0.5} scale={1.1} frame={f} arms={0.6} glow={0.5} />
    <Owl position={[3.4, 0, 6.0]} rotation={-0.5} scale={1.4} frame={f} head={Math.sin(f * 0.1) * 0.8} />
    <Bx p={[1.27 + shake, 0.85, 2.7]} s={[0.9, 1.7, 0.06]} c="#5a3b24" />
    <Post bloom={1.3} threshold={0.45} vignette={0.4} /></Stage>; };
// 23 loop to the opening: pull back over the yard
S[23] = () => { const f = useCurrentFrame(); const d = dur(23);
  return <Stage palette={NIGHT} fog={[30, 120]} overlay={<><Pill text="OWLS, OR SOMETHING ELSE?" y={236} variant="yellow" delay={at(0.3)} size={40} /><Pill text="TELL ME BELOW" y={1130} variant="red" delay={at(55.9 - CS[23])} size={46} /><EndCard delay={at(54.3 - CS[23])} sources={['WIKIPEDIA', 'SKEPTOID']} /></>}>
    <ShotCam preset="crane" target={[0, 1.6, 4]} h0={5.5} h1={0.9} r0={17} r1={13} angle={0.1} lookY0={2.6} lookY1={1.5} fov0={52} fov1={58} start={0} end={d} ease="inout" />
    <Farm f={f} /><Crowd f={f} /><Post bloom={1.2} threshold={0.45} vignette={0.35} /></Stage>; };

export const Hop = () => <AbsoluteFill style={{background: '#000'}}>
  <FontFaces /><Fonts2 />
  {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? HOP_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
  <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
  <WordCaption words={W} y={1310} />
</AbsoluteFill>;
