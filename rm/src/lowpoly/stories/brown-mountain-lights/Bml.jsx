// "The Ghost Lights of Brown Mountain" (North Carolina, 1913-1922) - low-poly 3D Short, ANIMATION UPGRADE kit + GitGems Rigged characters.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, Burst, FogLayer, Rigged, Glow,
  Grade, KineticCard, cueLine, clamp01, mixPalette, PALETTES, usePreload} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Land, Forest, Orb, RidgeLights, Loco, Track, River, Bridge, Road, roadAt, HeadCar, Hotel, Tent, Fire, Telescope, MapTable, BrushFire, FarmLamp, Cam, Roof, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const BML_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 2.2, 3.4, 5.3, 7.3, 9.9, 12.2, 13.4, 15.8, 17.5, 19.1, 20.7, 22.5, 25.3, 27.0, 29.4, 31.86, 34.2, 37.8, 40.1, 42.5, 44.0, 46.6, 49.2, 51.4, 53.0, 55.4];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? BML_FRAMES) - C[i];
const sec = (i, f) => CS[i] + f / FPS;
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

const NIGHT = {top: '#090d32', mid: '#2a2f6e', hor: '#6a5a9a', fog: '#2a2c5a', amb: 1.0, hemiSky: '#9aa8f0', hemiGround: '#4a3a30', hemiI: 1.7, sun: '#b8c4ff', sunI: 1.7, sunPos: [-20, 30, 20], rim: '#ff9a60', rimI: 0.9, rimPos: [10, 8, -30], glow: 1};
const DUSK = {top: '#201650', mid: '#7a3a7a', hor: '#ff9a5a', fog: '#8a5a70', amb: 1.0, hemiSky: '#ffb890', hemiGround: '#4a3028', hemiI: 1.5, sun: '#ffb27a', sunI: 2.0, sunPos: [-40, 14, -30], rim: '#ff7ab0', rimI: 1.2, rimPos: [40, 20, 30], glow: 0.9};
const MURK = {...NIGHT, top: '#0a0c1e', mid: '#1c2040', hor: '#3a3a64', fog: '#1c1e3c', hemiI: 1.3, sunI: 1.1};
const FLOOD = {...NIGHT, top: '#12142e', mid: '#3a3a5a', hor: '#7a6a7a', fog: '#4a4258'};
const COAT = [{b: 0}, {b: 1}, {b: 2}, {b: 3}];

const Chip = ({f, d, x, y, text, c = '#ffe35a'}) => f < d ? null : <div style={{position: 'absolute', left: x, top: y - Math.min(f - d, 34) * 1.1, transform: `scale(${Math.min(1, (f - d) / 5)}) rotate(${(x % 7) - 3}deg)`, opacity: f - d > 60 ? 1 - (f - d - 60) / 12 : 1, fontFamily: 'Lilita One', fontSize: 78, color: '#141414', background: c, padding: '8px 28px', borderRadius: 34, border: '6px solid #141414'}}>{text}</div>;
const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0, from = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from}]} position={[p[0], p[1] ?? height(p[0], p[2]), p[2]]} rotation={[0, rot, 0]} scale={s} />;
/** shared valley set. flood 0..1, tc = train x (null hides), cars = [[u, dir], ...] */
const World = ({f, flood = 0, train = null, trainBeam = true, cars = [], fire = false, lamp = false, hotel = true, trees = 150, tent = false}) => <>
  <Land /><Forest count={trees} frame={f} />
  <Track z={4} from={-110} to={110} /><River x={24} flood={flood} frame={f} /><Bridge x={24} z={4} />
  <Road />
  {train !== null && <Loco position={[train, 0.32, 4]} frame={f} head={trainBeam} moving={flood < 0.5} />}
  {cars.map(([u, back], i) => { const [x, z, h] = roadAt([[-70, 0, -10], [-30, 0, -14], [0, 0, -9], [30, 0, -15], [70, 0, -10]], back ? 1 - u : u); return <HeadCar key={i} position={[x, 0.1, z]} rotation={back ? h + Math.PI : h} dist={f * 0.25} frame={f} color={i % 2 ? '#3a2a22' : '#22303a'} />; })}
  {hotel && <Hotel position={[-30, height(-30, 18) + 0.1, 18]} frame={f} />}
  {fire && <BrushFire position={[-40, height(-40, -34) + 0.2, -34]} frame={f} size={1.4} />}
  {lamp && <FarmLamp position={[34, height(34, -22), -22]} />}
  {tent && <><Tent position={[12, height(12, 14), 14]} rotation={0.4} /><Fire position={[8.5, height(8.5, 15.5), 15.5]} frame={f} /></>}
  <FogLayer y={0.8} size={140} layers={3} thickness={1.5} color="#6a6aa0" opacity={0.14} frame={f} />
</>;

const S = [];
// 0 HOOK: red light rises above the ridge, crane up
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const rise = f * 0.12;
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><CFlash at={[at(0.1)]} k={0.35} color="#ff6a40" />{kc(0, 'Ghost lights', 0, 'lights', 300, 130, 2.1)}</>}>
    <ShotCam preset="crane" target={[0, 24, -50]} h0={-14} h1={4} r0={80} r1={64} angle={0.12} lookY0={4} lookY1={10} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} trees={120} /><RidgeLights frame={f} n={3} halo={11} rise={rise} /><Post bloom={1.5} threshold={0.35} vignette={0.35} /></Stage>; };
// 1 North Carolina mountain: wide push toward the ridge, lights bobbing
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<Pill text="NORTH CAROLINA" y={236} variant="yellow" delay={loc(1.6, 1)} size={44} />}>
    <ShotCam preset="push" from={[-30, 12, 44]} to={[-12, 14, 20]} look={[[0, 26, -56], [0, 29, -56]]} fov0={54} fov1={44} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><RidgeLights frame={f + 40} n={3} halo={11} /><Post bloom={1.4} threshold={0.35} vignette={0.35} /></Stage>; };
// 2 the government sent scientists: two surveyors on a hill with a telescope
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const t = f / FPS;
  const hx = 6, hz = 16; const hy = height(hx, hz);
  return <Stage palette={DUSK} fog={[40, 200]} overlay={<><Pill text="U.S. GEOLOGICAL SURVEY" y={236} variant="dark" delay={loc(3.5, 2)} size={38} /></>}>
    <ShotCam preset="orbit" target={[hx, hy + 1.4, hz]} a0={2.4} a1={3.5} r0={9} r1={6.5} h0={1.6} h1={2.2} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><Telescope position={[hx, hy, hz]} yaw={-Math.PI / 2} pitch={0.35} scale={1.2} />
    <Man p={[hx + 1.4, hy, hz + 0.6]} clip="interact-right" rot={-2.2} t={t} i={0} /><Man p={[hx - 1.5, hy, hz + 0.4]} clip="idle" rot={-1.0} t={t} i={1} />
    <Post bloom={1.1} threshold={0.5} vignette={0.35} /></Stage>; };
// 3 catch them. Twice. - the two men run toward the lights, flash on hit
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const t = f / FPS; const z = 20 - t * 7;
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<><CFlash at={[loc(6.26, 3)]} k={0.55} color="#ffe0b0" />{kc(3, 'Twice.', 6.2, 'Twice.', 300, 170, 7.3)}</>}>
    <ShotCam preset="track" target={(ff) => [-4 + 0, height(-4, 20 - ff / FPS * 7) + 1, 20 - ff / FPS * 7]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[6, 2.2, 8]} fov0={50} start={0} end={d} drift={0.05} />
    <World f={f} hotel={false} /><Man p={[-4, height(-4, z), z]} clip="sprint" rot={Math.PI} t={t} i={0} /><Man p={[-2.2, height(-2.2, z + 2.5), z + 2.5]} clip="sprint" rot={Math.PI} t={t + 0.3} i={1} />
    <RidgeLights frame={f} n={3} halo={12} /><Post bloom={1.3} threshold={0.4} vignette={0.35} /></Stage>; };
// 4 Brown Mountain 1910s: hotel on the hill, dusk, lights come on
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={DUSK} fog={[40, 220]} overlay={<><Pill text="BROWN MOUNTAIN" y={236} variant="yellow" delay={loc(7.4, 4)} size={46} /><Pill text="1910s" y={312} variant="dark" delay={loc(8.3, 4)} size={44} /></>}>
    <ShotCam preset="crane" target={[-30, 4, 14]} h0={0.4} h1={10} r0={26} r1={34} angle={-0.5} lookY0={2.6} lookY1={6} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <World f={f} /><RidgeLights frame={f} n={3} halo={10} /><Post bloom={1.3} threshold={0.4} vignette={0.35} /></Stage>; };
// 5 locals watch red lights: porch with rocking locals, camera behind them
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const t = f / FPS; const hy = height(-30, 8) + 0.9;
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<Pill text="LOCALS WATCH" y={236} variant="yellow" delay={loc(10.0, 5)} size={44} />}>
    <ShotCam preset="push" from={[-34, hy + 1.4, 12]} to={[-30.5, hy + 1.8, 4]} look={[[-30, hy + 12, -50], [-30, hy + 14, -50]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <World f={f} /><RidgeLights frame={f} n={3} halo={10} />
    {[-33.4, -30, -26.6].map((x, i) => <Man key={i} p={[x, hy - 0.45, 9.6]} clip={i === 1 ? 'idle' : 'sit'} rot={Math.PI} t={t} i={i} s={0.5} />)}
    <Post bloom={1.4} threshold={0.35} vignette={0.4} /></Stage>; };
// 6 float above the ridge nightly: crane over the valley, lights drift
S[6] = () => { const f = useCurrentFrame(); const d = dur(6);
  return <Stage palette={NIGHT} fog={[40, 240]} overlay={<Pill text="NIGHTLY" y={236} variant="red" delay={loc(12.4, 6)} size={46} />}>
    <ShotCam preset="orbit" target={[0, 24, -52]} a0={0.55} a1={0.0} r0={70} r1={60} h0={-6} h1={4} fov0={48} fov1={44} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><RidgeLights frame={f + 80} n={4} halo={12} /><Post bloom={1.5} threshold={0.35} vignette={0.35} /></Stage>; };
// 7 1913: an official with a notebook beside the rail line
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const t = f / FPS; const x = -6 + t * 0.8; const z = 14;
  return <Stage palette={DUSK} fog={[40, 220]} overlay={<><Pill text="1913" y={236} variant="red" delay={loc(13.4, 7)} size={60} /><Pill text="AN OFFICIAL" y={326} variant="dark" delay={loc(14.5, 7)} size={38} /></>}>
    <ShotCam preset="push" from={[x - 6, height(x, z) + 1.8, z + 8]} to={[x - 2.6, height(x, z) + 1.5, z + 5]} look={[[x, height(x, z) + 1, z], [x + 1.4, height(x, z) + 1.2, z]]} fov0={50} fov1={40} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><Man p={[x, height(x, z), z]} clip="walk" rot={1.4} t={t} i={2} s={0.6} />
    <Man p={[x + 1.5, height(x, z), z + 0.2]} clip="interact-right" rot={0.7} t={t} i={3} s={0.5} /><Post bloom={1.1} threshold={0.5} vignette={0.35} /></Stage>; };
// 8 train headlights: loco rushes through with its beam toward the ridge
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const x = -34 + f * 1.15;
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><Pill text="TRAIN HEADLIGHTS?" y={236} variant="yellow" delay={loc(16.0, 8)} size={44} /><CFlash at={[loc(16.3, 8)]} k={0.3} color="#fff0c0" /></>}>
    <ShotCam preset="track" target={(ff) => [-34 + ff * 1.15, 2.6, 4]} from={[0, 0, 0]} to={[0, 0, 0]} offset={[2, 3.4, 15]} fov0={50} start={0} end={d} />
    <World f={f} hotel={false} train={x} /><RidgeLights frame={f} n={3} halo={10} /><Post bloom={1.4} threshold={0.38} vignette={0.35} /></Stage>; };
// 9 nobody buys it: locals shake heads on the porch
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const t = f / FPS; const hy = height(-30, 8) + 0.9;
  return <Stage palette={DUSK} fog={[30, 220]} overlay={<><Pill text="NOBODY BUYS IT" y={236} variant="red" delay={loc(17.6, 9)} size={46} /></>}>
    <ShotCam preset="orbit" target={[-30, hy + 0.8, 8.4]} a0={-0.9} a1={-0.1} r0={9} r1={7} h0={1.2} h1={1.6} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <World f={f} />
    {[-32.6, -30, -27.4].map((x, i) => <Man key={i} p={[x, hy - 0.45, 8.6]} clip={i === 1 ? 'emote-no' : 'idle'} rot={Math.PI * 0.2 * (i - 1) + Math.PI} t={t + i * 0.3} i={i} s={0.5} />)}
    <Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 10 1922: survey camp wide, tent + fire
S[10] = () => { const f = useCurrentFrame(); const d = dur(10);
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<><Pill text="1922" y={236} variant="red" delay={loc(19.2, 10)} size={64} /></>}>
    <ShotCam preset="crane" target={[11, height(11, 15) + 1, 15]} h0={0.5} h1={8} r0={13} r1={20} angle={0.7} lookY0={1.5} lookY1={1} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <World f={f} tent /><RidgeLights frame={f} n={3} halo={9} /><Post bloom={1.4} threshold={0.38} vignette={0.4} /></Stage>; };
// 11 geologist George Mansfield: figure at the fire, name pill
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const t = f / FPS; const hy = height(10, 17);
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<><Pill text="GEOLOGIST" y={236} variant="yellow" delay={loc(20.7, 11)} size={44} /><Pill text="GEORGE MANSFIELD" y={316} variant="dark" delay={loc(21.4, 11)} size={42} /></>}>
    <ShotCam preset="push" from={[13.5, hy + 1.4, 22]} to={[11.5, hy + 1.5, 19.4]} look={[[9.8, hy + 1.2, 16.5], [9.8, hy + 1.3, 16.5]]} fov0={50} fov1={38} start={0} end={d} ease="inout" />
    <World f={f} tent /><Man p={[9.9, hy, 16.8]} clip="walk" rot={0.6} t={t} i={0} s={0.62} /><Post bloom={1.3} threshold={0.4} vignette={0.4} /></Stage>; };
// 12 camps two weeks with a telescope: telescope + map table + fire, IMG2 card
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const t = f / FPS; const hy = height(4, 18); const p2 = loc(23.4, 12);
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<><Pill text="TWO WEEKS" y={236} variant="yellow" delay={loc(23.2, 12)} size={44} />{f >= p2 && <PhotoCard src="brownmtn/IMG2.png" credit="Mansfield's 1922 map · USGS · public domain" tag="THE SURVEY" delay={p2} dur={d - p2} />}</>}>
    <ShotCam preset="orbit" target={[5, hy + 1.6, 18]} a0={2.6} a1={3.5} r0={7.5} r1={6} h0={1.0} h1={1.8} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <World f={f} tent /><Telescope position={[4, hy, 18]} yaw={-Math.PI / 2 + Math.sin(t * 0.8) * 0.03} pitch={0.4} scale={1.3} /><MapTable position={[7, height(7, 19.5), 19.5]} rotation={0.3} />
    <Man p={[3.0, hy, 19.6]} clip="idle" rot={-1.2} t={t} i={0} s={0.6} /><Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 13 twenty-three lights: 23 points across the dark valley
const L23 = Array.from({length: 23}, (_, i) => { const a = (i * 2.399) % (Math.PI * 2); const r = 14 + (i * 7) % 30; return [Math.cos(a) * r * 1.4, -10 - Math.abs(Math.sin(a)) * r * 0.9 - 4]; });
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const t = f / FPS; const n = Math.min(23, Math.floor(t * 12));
  return <Stage palette={MURK} fog={[40, 240]} overlay={<>{kc(13, 'twenty-three lights.', 25.3, 'twenty-three', 300, 96, 27.0)}<CFlash at={[loc(25.56, 13)]} k={0.4} color="#ffd8a0" /></>}>
    <ShotCam preset="push" from={[0, 9, 36]} to={[0, 13, 14]} look={[[0, 3, -40], [0, 6, -40]]} fov0={58} fov1={46} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} />{L23.slice(0, n).map(([x, z], i) => <Orb key={i} position={[x, height(x, z) + 2.4 + (i % 4) * 0.8, z]} r={0.32} halo={4.6} color={i % 3 ? '#ffb04a' : '#ff5a38'} />)}
    <RidgeLights frame={f} n={2} halo={9} /><Post bloom={1.5} threshold={0.3} vignette={0.4} /></Stage>; };
// 14 one flares, drifts, looks alive: close on one orb that flares and floats
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const t = f / FPS; const u = clamp01(f / d);
  const ox = -8 + u * 14 + Math.sin(f * 0.1) * 0.8, oy = 9 + Math.sin(f * 0.08) * 0.9 + u * 2, oz = -32;
  const fl = (t >= 27.2 && t < 27.9) ? 1 : (t >= 28.3 ? 0.55 + 0.3 * Math.sin(f * 0.6) : 0);
  return <Stage palette={MURK} fog={[40, 240]} overlay={<>{t >= 27.2 && <Pill text="IT FLARES" y={236} variant="red" delay={loc(27.2, 14)} size={46} />}{t >= 28.4 && <Pill text="LOOKS ALIVE" y={316} variant="yellow" delay={loc(28.4, 14)} size={44} />}<CFlash at={[loc(27.2, 14)]} k={0.5} color="#ff8a50" /></>}>
    <ShotCam preset="push" from={[-6, 6, 14]} to={[3, 8, 2]} look={[[-8, 9, -32], [6, 11, -32]]} fov0={48} fov1={34} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><Orb position={[ox, oy, oz]} r={0.7} halo={10} flare={fl} />{L23.slice(0, 22).map(([x, z], i) => <Orb key={i} position={[x * 0.8, height(x, z) + 2.4, z]} r={0.28} halo={4} color="#ffb04a" a={0.75} />)}
    <Burst kind="sparks" position={[ox, oy, oz]} start={loc(27.2, 14)} frame={f} count={26} color="#ffb060" /><Post bloom={1.6} threshold={0.3} vignette={0.45} /></Stage>; };
// 15 through the telescope it never moves: crosshair POV, light locked while the world sways
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const t = sec(15, f); const sway = Math.sin(f * 0.18) * 0.9;
  return <Stage palette={MURK} fog={[40, 240]} overlay={<>
    <AbsoluteFill style={{pointerEvents: 'none'}}><svg width="1080" height="1920" viewBox="0 0 1080 1920"><defs><mask id="lens"><rect width="1080" height="1920" fill="white" /><circle cx="540" cy="760" r="470" fill="black" /></mask></defs>
      <rect width="1080" height="1920" fill="#030306" mask="url(#lens)" /><circle cx="540" cy="760" r="470" fill="none" stroke="#caa84a" strokeWidth="14" />
      <line x1="540" y1="300" x2="540" y2="1220" stroke="#e8ffd0" strokeWidth="3" opacity="0.8" /><line x1="80" y1="760" x2="1000" y2="760" stroke="#e8ffd0" strokeWidth="3" opacity="0.8" /><circle cx="540" cy="760" r="90" fill="none" stroke="#e8ffd0" strokeWidth="3" opacity="0.8" /></svg></AbsoluteFill>
    <CFlash at={[loc(30.48, 15)]} k={0.6} color="#ffffff" />{kc(15, 'never moves.', 30.4, 'never', 1180, 110, 31.8)}<Pill text="THROUGH THE TELESCOPE" y={150} variant="dark" delay={loc(29.5, 15)} size={36} /></>}>
    <ShotCam preset="push" from={[sway, 8, 8]} to={[sway * 0.4, 8.4, 6]} look={[[sway * 1.6, 8, -32], [sway * 1.0, 8.2, -32]]} fov0={22} fov1={14} start={0} end={d} ease="inout" drift={0.0} />
    <World f={f} hotel={false} />
    <Orb position={[sway * 0.0 + sway * 1.6 * 0.0 + (-32 - 8) * Math.tan(sway * 1.6 / 40) * 0, 8.2, -32]} r={0.75} halo={10} flare={t > 30.4 ? 0.2 : 0} />
    <Post bloom={1.5} threshold={0.3} vignette={0.2} /></Stage>; };
// 16 the count: nearly half car headlights - cars on the winding road with chips
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const u = f / d;
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<><Pill text="THE COUNT" y={236} variant="yellow" delay={loc(31.9, 16)} size={46} /><Chip f={f} d={loc(32.9, 16)} x={120} y={900} text="CARS 47%" c="#ffe35a" /><Chip f={f} d={loc(33.3, 16)} x={250} y={760} text="HEADLIGHTS" c="#ffffff" /></>}>
    <ShotCam preset="track" target={(ff) => { const [x, z] = roadAt([[-70, 0, -10], [-30, 0, -14], [0, 0, -9], [30, 0, -15], [70, 0, -10]], 0.25 + ff / d * 0.4); return [x, 1.4, z]; }} from={[0, 0, 0]} to={[0, 0, 0]} offset={[-10, 4.5, 14]} fov0={52} start={0} end={d} drift={0.04} />
    <World f={f} hotel={false} cars={[[0.25 + u * 0.4, false], [0.12 + u * 0.4, false], [0.9 - u * 0.4, true]]} /><RidgeLights frame={f} n={3} halo={9} /><Post bloom={1.4} threshold={0.38} vignette={0.35} /></Stage>; };
// 17 a third trains; the rest fires and fixed lamps: train passes, then pan to fire + lamp
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const t = sec(17, f); const x = -40 + f * 1.2;
  const cutT = at(34.95 - CS[17]);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<>{t < 35.0 ? <Pill text="TRAINS 33%" y={236} variant="yellow" delay={loc(34.3, 17)} size={46} /> : <><Pill text="FIRES 10%" y={236} variant="red" delay={loc(35.5, 17)} size={44} /><Pill text="FIXED LAMPS 10%" y={316} variant="yellow" delay={loc(36.6, 17)} size={40} /></>}<CFlash at={[cutT]} k={0.3} color="#ffe0b0" /></>}>
    <ShotCam preset="orbit" target={[-8, 3, -6]} a0={0.2} a1={-0.9} r0={40} r1={34} h0={5} h1={7} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} train={x} fire lamp /><RidgeLights frame={f} n={3} halo={9} /><Post bloom={1.4} threshold={0.38} vignette={0.35} /></Stage>; };
// 18 case closed? Not for locals: porch group stands, arms crossed (idle), stamp
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const t = f / FPS; const hy = height(-30, 8) + 0.9; const tx = loc(37.9, 18);
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<>{f >= tx && <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 130, color: '#d6302a', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', transform: `scale(${1 + Math.max(0, 1 - (f - tx) / 6) * 0.5}) rotate(-7deg)`}}>CASE CLOSED?</div>}<Pill text="NOT FOR LOCALS" y={236} variant="dark" delay={loc(38.8, 18)} size={44} /></>}>
    <ShotCam preset="push" from={[-24, hy + 2.2, 17]} to={[-28.5, hy + 1.8, 12.6]} look={[[-30, hy + 1.0, 8], [-30, hy + 1.2, 8]]} fov0={50} fov1={38} start={0} end={d} ease="inout" />
    <World f={f} /><RidgeLights frame={f} n={3} halo={10} />
    {[-32.4, -30.2, -28].map((x, i) => <Man key={i} p={[x, hy - 0.45, 8.8]} clip={i === 2 ? 'emote-no' : 'idle'} rot={Math.PI} t={t + i * 0.5} i={i + 1} s={0.5} />)}
    <Post bloom={1.3} threshold={0.4} vignette={0.4} /></Stage>; };
// 19 1916 flood: river swells over the bridge, camera dolly over the water
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const fl = clamp01(f / (d * 0.75));
  return <Stage palette={FLOOD} fog={[30, 200]} overlay={<>{kc(19, '1916 flood', 40.1, 'flood', 300, 120, 42.4)}<CFlash at={[loc(40.9, 19)]} k={0.4} color="#c0d8ff" /></>}>
    <ShotCam preset="orbit" target={[24, 1, 4]} a0={-0.9} a1={0.4} r0={22} r1={16} h0={3} h1={5.5} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} flood={fl} /><Post bloom={1.1} threshold={0.45} vignette={0.4} />
    <Particles kind="spray" center={[24, 1, 4]} area={[26, 3, 40]} count={60} frame={f} /></Stage>; };
// 20 trains stopped for weeks: loco sits dead on the track by the flood
S[20] = () => { const f = useCurrentFrame(); const d = dur(20);
  return <Stage palette={FLOOD} fog={[30, 200]} overlay={<><Pill text="TRAINS STOPPED" y={236} variant="red" delay={loc(42.5, 20)} size={46} /><Pill text="FOR WEEKS" y={316} variant="dark" delay={loc(43.0, 20)} size={42} /></>}>
    <ShotCam preset="push" from={[6, 3, 18]} to={[12, 2.2, 10]} look={[[10, 1.8, 4], [14, 1.8, 4]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} flood={1} train={8} trainBeam={false} /><Post bloom={1.1} threshold={0.45} vignette={0.45} /></Stage>; };
// 21 the hotel owner points: lights keep coming (rise above the ridge)
S[21] = () => { const f = useCurrentFrame(); const d = dur(21); const t = f / FPS; const hy = height(-30, 8) + 0.9;
  return <Stage palette={NIGHT} fog={[30, 220]} overlay={<><Pill text="HOTEL OWNER" y={236} variant="yellow" delay={loc(43.9, 21)} size={44} /><Pill text="THE LIGHTS KEPT COMING" y={316} variant="red" delay={loc(45.0, 21)} size={38} /></>}>
    <ShotCam preset="push" from={[-36, hy + 1.6, 16]} to={[-31.5, hy + 1.8, 10.4]} look={[[-29, hy + 6, -20], [-29, hy + 14, -50]]} fov0={56} fov1={44} start={0} end={d} ease="inout" />
    <World f={f} /><RidgeLights frame={f + 120} n={4} halo={12} rise={f * 0.05} />
    <Man p={[-30, hy - 0.45, 8.6]} clip="interact-right" rot={Math.PI + 0.2} t={t} i={2} s={0.55} /><Man p={[-32.6, hy - 0.45, 8.8]} clip="idle" rot={Math.PI - 0.3} t={t} i={1} s={0.5} />
    <Post bloom={1.5} threshold={0.35} vignette={0.4} /></Stage>; };
// 22 university cameras on a roof, aimed at the ridge
S[22] = () => { const f = useCurrentFrame(); const d = dur(22);
  return <Stage palette={MURK} fog={[40, 240]} overlay={<><Pill text="UNIVERSITY CAMERAS" y={236} variant="yellow" delay={loc(47.0, 22)} size={42} /><Pill text="DECADES LATER" y={316} variant="dark" delay={loc(46.7, 22)} size={38} /></>}>
    <ShotCam preset="orbit" target={[0, 2.2, 0]} a0={0.9} a1={-0.2} r0={11} r1={8.5} h0={2.2} h1={3.4} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Land /><Forest count={90} frame={f} /><group position={[0, -5, 4]}><Roof />
      <Cam position={[-3, 0.4, 0]} yaw={Math.PI + 0.1} frame={f} /><Cam position={[3, 0.4, 0]} yaw={Math.PI - 0.1} frame={f} /></group>
    <RidgeLights frame={f} n={3} halo={10} /><Post bloom={1.3} threshold={0.38} vignette={0.4} /></Stage>; };
// 23 six thousand hours: time-lapse ridge with a counter
S[23] = () => { const f = useCurrentFrame(); const d = dur(23); const t = sec(23, f); const hrs = Math.round(6000 * clamp01((t - 49.6) / 1.2) / 10) * 10;
  return <Stage palette={mixPalette(MURK, NIGHT, 0.5 + 0.5 * Math.sin(f * 0.12))} fog={[40, 240]} overlay={<><div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 190, color: '#ffe35a', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill'}}>{t >= 49.6 ? hrs.toLocaleString('en-US') : ''}</div>{t >= 49.6 && <Pill text="HOURS WATCHED" y={236} variant="yellow" delay={loc(49.6, 23)} size={46} />}</>}>
    <ShotCam preset="push" from={[0, 6, 44]} to={[0, 10, 28]} look={[[0, 26, -56], [0, 28, -56]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 24 nothing unexplained: empty dark ridge + real photo card
S[24] = () => { const f = useCurrentFrame(); const d = dur(24); const p1 = loc(51.7, 24);
  return <Stage palette={MURK} fog={[40, 240]} overlay={<><Pill text="NOTHING UNEXPLAINED" y={236} variant="dark" delay={loc(51.4, 24)} size={42} />{f >= p1 && <PhotoCard src="brownmtn/IMG1.jpg" credit="Brown Mountain from Beacon Heights · CC0" tag="THE RIDGE" delay={p1} dur={d - p1} />}</>}>
    <ShotCam preset="push" from={[0, 8, 40]} to={[0, 10, 30]} look={[[0, 27, -56], [0, 27, -56]]} fov0={50} fov1={46} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><Post bloom={1.0} threshold={0.5} vignette={0.5} /></Stage>; };
// 25 the question: a light returns over the ridge (near-miss ending), real photo card
S[25] = () => { const f = useCurrentFrame(); const d = dur(25); const p3 = loc(54.0, 25);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<>{f >= p3 && <PhotoCard src="brownmtn/IMG3.jpg" credit="Table Rock from Wiseman's View · public domain" tag="THE BLUE RIDGE" delay={p3} dur={d - p3} />}<Pill text="GHOST LIGHTS?" y={236} variant="red" delay={loc(53.5, 25)} size={46} /><Pill text="OR JUST HEADLIGHTS?" y={316} variant="yellow" delay={loc(54.4, 25)} size={42} /></>}>
    <ShotCam preset="crane" target={[0, 24, -50]} h0={4} h1={-14} r0={64} r1={80} angle={0.12} lookY0={10} lookY1={4} fov0={48} fov1={52} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} /><RidgeLights frame={f} n={3} halo={11} rise={Math.min(f, 40) * 0.12} /><Post bloom={1.5} threshold={0.35} vignette={0.35} /></Stage>; };
// 26 tell me below: back to the opening frame
S[26] = () => { const f = useCurrentFrame(); const d = dur(26);
  return <Stage palette={NIGHT} fog={[40, 230]} overlay={<><Pill text="TELL ME BELOW" y={1130} variant="red" delay={2} size={46} /><EndCard delay={2} sources={['USGS CIRC. 646', 'WIKIPEDIA']} /></>}>
    <ShotCam preset="crane" target={[0, 24, -50]} h0={-14} h1={-10} r0={80} r1={78} angle={0.12} lookY0={4} lookY1={5} fov0={52} fov1={51} start={0} end={d} ease="inout" />
    <World f={f} hotel={false} trees={120} /><RidgeLights frame={f} n={3} halo={11} rise={0} /><Post bloom={1.5} threshold={0.35} vignette={0.35} /></Stage>; };

export const Bml = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? BML_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
