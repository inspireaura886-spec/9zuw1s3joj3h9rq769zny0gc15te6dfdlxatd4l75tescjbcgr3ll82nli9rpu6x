// "3 Keepers Vanished. One Left His Coat Behind" (Flannan Isles, Dec 1900) REMAKE #1 - low-poly 3D Short, 23 scenes on the cues.json cuts.
// Frame 0 = hut doorway, McArthur's coat on its peg LARGE, door open on the storm, tower beam dead. Last scene = same set, beam ON (loop).
import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, Post, Person, Clouds, Stars, Orb, Glow, Fountain, Grade, GrabProp, grabPaths, usePreload, clamp01, easeOut} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash, flashAt} from '../common.jsx';
import {Bx, Cy} from '../uvb-76/world.jsx';
import {Island, Sea, Whitecaps, Spray, Storm, Ship, KEEPERS, LH, lhY, height, trackPts, islandR} from '../flannan-isles/world.jsx';
import {LanternRoom, WestLanding, LANDING_SET, Coat, Room} from '../flannan-isles/sets.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const FL_FRAMES = Math.round(39.0 * FPS);
const W = VO.words;
const CS = [0.0, 2.2, 4.28, 6.36, 8.1, 9.08, 11.28, 12.46, 14.4, 15.4, 17.08, 18.66, 20.57, 22.22, 23.64, 25.52, 27.17, 28.73, 30.27, 31.23, 32.84, 34.98, 36.56];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? FL_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const GRAB = ['hanging-light-bulb', 'padlocked-chest'];
const PATHS = grabPaths(GRAB, 'ia-dark');

const PAL = (top, mid, hor, sky, rim, sunI = 2.0, gr = '#2a3060') => ({top, mid, hor, fog: mid, amb: 1.0, hemiSky: sky, hemiGround: gr, hemiI: 1.6, sun: '#c8d8ff', sunI, sunPos: [-25, 40, 25], rim, rimI: 2.0, rimPos: [25, 18, -45], glow: 1});
const NIGHT = PAL('#101a4a', '#2c4690', '#6a70c0', '#a9c0ff', '#8fe6ff');
const GALE = {...PAL('#2a3a66', '#56709e', '#c7b7c9', '#cfdcff', '#9fe0ff', 2.2, '#3a4250'), fog: '#7c8aa8'};
const DAWN = {...PAL('#4d6488', '#8fa3c0', '#f0c9a0', '#e6eeff', '#ffc0a0', 2.4, '#55606a'), fog: '#a9b6c8'};
const GOLD = {top: '#2a1606', mid: '#6b3a10', hor: '#e09a3a', fog: '#5a3410', amb: 1.2, hemiSky: '#ffd890', hemiGround: '#4a2a10', hemiI: 1.5, sun: '#ffd28a', sunI: 2.6, sunPos: [10, 20, 15], rim: '#ffb060', rimI: 1.8, rimPos: [-15, 10, -20], glow: 1};
const ROOM = {...DAWN, amb: 1.25, fog: '#3a3020', sunPos: [8, 12, 18], sunI: 2.2, sun: '#fff0d8', hemiGround: '#6a5030'};
const NT = '#8fa6f0', DT = '#eef0f5';
const Moon = () => <><Orb position={[-60, 55, -110]} radius={4} color="#fbf6dc" /><Glow position={[-60, 55, -109]} size={34} color="#9fc0ff" opacity={0.5} /></>;
const beamAng = (f, speed = 0.05, ph = 0) => ph + f * speed;

const push = (from, to, look, d, fov = [58, 46], shake = 0, ease = 'inout') => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease={ease} shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d, fov = [52, 44]) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" />;

// ---------- the keepers' hut doorway (frame 0 / end set). local coords: wall with pegs + open door at z=-2, camera inside on +z ----------
const HX = LH.x - 1.5, HZ = LH.z + 7; const HY = () => height(HX, HZ);
const HP = (p) => [HX + p[0], HY() + 1.0 + p[1], HZ + p[2]];
const Hut = ({f, sway = 0, bulb = 0}) => {
  const hy = HY();
  return <group position={[HX, hy + 1.0, HZ]}>
    <Bx p={[0, -2.2, 1.1]} s={[6.4, 4.4, 6.4]} c="#4a4234" /><Bx p={[0, 0.02, 1.1]} s={[6.2, 0.1, 6.2]} c="#6a563e" />
    <Bx p={[-1.2, 1.6, -2.0]} s={[3.6, 3.2, 0.2]} c="#a89878" /><Bx p={[2.7, 1.6, -2.0]} s={[0.6, 3.2, 0.2]} c="#a89878" /><Bx p={[1.5, 2.9, -2.0]} s={[1.8, 0.6, 0.2]} c="#a89878" />
    <Bx p={[1.5, 0.04, -2.0]} s={[1.9, 0.1, 0.4]} c="#3a3a3c" />
    <Bx p={[-3.1, 1.6, 1.1]} s={[0.2, 3.2, 6.4]} c="#c8bfa8" /><Bx p={[3.1, 1.6, 1.1]} s={[0.2, 3.2, 6.4]} c="#c8bfa8" /><Bx p={[0, 3.3, 1.1]} s={[6.4, 0.2, 6.4]} c="#2a2620" />
    <group position={[2.4, 0, -1.9]} rotation={[0, -1.3, 0]}><Bx p={[0.8, 1.2, 0]} s={[1.6, 2.4, 0.08]} c="#3a4f6b" /></group>
    {/* peg board: three pegs, ONE coat (McArthur's), big in the foreground */}
    <Bx p={[-0.55, 2.45, -1.86]} s={[2.3, 0.22, 0.1]} c="#6b4a2e" />
    {[-1.35, -0.55, 0.25].map((x, i) => <Cy key={i} p={[x, 2.4, -1.74]} a={[0.05, 0.05, 0.26, 6]} r={[Math.PI / 2, 0, 0]} c="#4a3020" />)}
    <group position={[-0.55, 2.36, -1.72]} scale={1.08}><Coat position={[0, 0, 0]} sway={sway} /></group>
    <GrabProp name="padlocked-chest" position={[-2.3, 0.05, -1.2]} rotation={[0, 0.4, 0]} />
    <group position={[0.4, 3.2, 0.2]} rotation={[0, 0, Math.sin(f * 0.09) * 0.12]}><GrabProp name="hanging-light-bulb" position={[0, -0.6, 0]} glow={bulb} /></group>
  </group>;
};
const Outside = ({f, beam = 0, lantern = 0.05, tint = NT, rain = 1, sea = 0.7, night = true, house = false, seed = 0, gate = 0, clouds = true, wind = 1}) => <>
  {night && <><Stars opacity={0.5} count={120} /><Moon /></>}
  {clouds && <Clouds frame={f + seed} y={30} color={night ? '#4a58b8' : '#c8ceda'} opacity={0.95} speed={0.14} count={9} seed={3} />}
  <Island frame={f} beam={beam} ang={beamAng(f, 0.06, 2.2)} lantern={lantern} tint={tint} lit={0} gateOpen={gate} house={house} />
  <Sea frame={f + seed + 127} color={night ? '#2f5fb0' : '#4a7aac'} amp={sea} />
  <Storm frame={f} center={[LH.x, lhY() - 6, LH.z + 6]} area={40} rain={rain} wind={wind} count={200} />
</>;
const OutsideFull = (p) => <><Outside {...p} /><Whitecaps frame={p.f + (p.seed || 0) + 127} count={50} /><Spray frame={p.f + (p.seed || 0) + 127} /></>;
const Hook = ({f, end = false, beam = 0}) => {
  const lantern = beam ? 1 : 0.05;
  return <><Hut f={f} sway={Math.sin(f * 0.11) * (end ? 0.05 : 0.02)} bulb={0} /><Outside f={f} beam={beam} lantern={lantern} seed={0} wind={0} /></>;
};

const trk = (k, base, n) => { const i0 = Math.min(Math.floor(k * n) + base, trackPts.length - 3); const fr = k >= 1 ? 1 : k * n - Math.floor(k * n); const P = trackPts[i0], Q = trackPts[i0 + 1];
  return [P[0] + (Q[0] - P[0]) * fr, P[1] + (Q[1] - P[1]) * fr, P[2] + (Q[2] - P[2]) * fr]; };
const S = [];
const mk = (i, {pal, fog = [30, 120], pills = [], cam, children, flash = [], extra = null, bloom = 1.4, card = null, bg = undefined}) => { S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} background={bg} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.45} len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d)}<Post bloom={bloom} threshold={0.4} vignette={0.42} /></Stage>; }; };
const Lg = (f, a = 0.55) => flashAt(f, [a * 30]);

// 0 HOOK: coat large on the peg, door open on the storm, fastest dolly from frame 0
const H0 = {from: [0.7, 1.8, 2.8], look0: [0.0, 1.5, -2]};
mk(0, {pal: NIGHT, fog: [40, 160], cam: (d) => push(HP(H0.from), HP([0.3, 1.7, 1.7]), [HP(H0.look0), HP([-0.4, 1.5, -2])], d, [62, 52], 0.8, 'out'), flash: [0.9], children: (f) => <Hook f={f} />});
mk(1, {pal: NIGHT, fog: [40, 160], pills: [['STILL ON ITS PEG', 236, 'yellow', 52, 2.9]], cam: (d) => push(HP([-1.5, 1.95, 0.7]), HP([-0.9, 1.7, -0.3]), [HP([-0.55, 1.6, -2]), HP([-0.55, 1.5, -2])], d, [56, 44], 0.3), children: (f) => <Hook f={f + 40} />});
// 2 real photo
mk(2, {pal: DAWN, fog: [40, 200], cam: (d) => orbit([0, 7, 0], -0.8, -0.3, 40, 34, 14, 10, d, [48, 44]), children: (f) => <Outside f={f} tint={DT} night={false} rain={0.2} lantern={0.05} seed={400} />,
  card: (f, d) => <PhotoCard src="flannan/IMG1.jpg" credit="Flannan Isles lighthouse · photo: Chris Downer, CC BY-SA 2.0" tag="FLANNAN ISLES · SCOTLAND" delay={0} dur={d} zoom={[1.02, 1.14]} pan={[10, -20]} />});
// 3 a passing ship sees no light
mk(3, {pal: NIGHT, fog: [40, 200], pills: [['DEC 1900', 236, 'yellow', 62, 6.5], ['A SHIP PASSES', 316, 'dark', 44, 7.1]], cam: (d) => push([36, 6, 62], [30, 5.5, 58], [[12, 3, 34], [10, 4, 33]], d, [52, 42], 0.3),
  children: (f) => <><OutsideFull f={f} tint={NT} lantern={0.03} seed={0} /><Ship position={[24 - f * 0.22, 0.6, 46]} rotation={-Math.PI / 2 + 0.25} frame={f} hull="#3a3a46" band="#e0e0e0" funnel="#b8342c" lit={1} scale={1.25} /></>});
// 4 no light
mk(4, {pal: NIGHT, fog: [40, 200], pills: [['NO LIGHT.', 236, 'red', 70, 8.15]], flash: [8.12], bloom: 1.2, cam: (d) => push([4, lhY() + 1, 14], [1.6, lhY() + 4.6, 7.5], [[LH.x, lhY() + 5.5, LH.z], [LH.x, lhY() + 6.0, LH.z]], d, [58, 40], 0.5),
  children: (f) => <Outside f={f} tint={NT} lantern={0.04} seed={90} />});
// 5 eleven days: gale at sea, day counter
const DayBox = ({n}) => <div style={{position: 'absolute', top: 540, left: 70, width: 300, height: 250, background: '#f7f2e8', borderRadius: 16, border: '6px solid #141414', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', overflow: 'hidden', textAlign: 'center'}}>
  <div style={{background: '#d6302a', color: '#fff', fontFamily: 'Lilita One', fontSize: 46, padding: '6px 0', letterSpacing: 3}}>DEC 1900</div><div style={{fontFamily: 'Lilita One', fontSize: 140, color: '#141414', lineHeight: 1.15}}>{n}</div></div>;
mk(5, {pal: GALE, fog: [30, 160], pills: [['STORMS', 236, 'white', 62, 9.2], ['11 DAYS', 316, 'yellow', 70, 9.5]], cam: (d) => push([13, 7, 16], [9, 6, 12], [[0, 2.2, 0], [0, 2.6, 0]], d, [52, 50], 0.3),
  extra: (f, d) => <DayBox n={15 + Math.min(11, Math.floor(clamp01((f - 6) / (d - 14)) * 11))} />,
  children: (f) => <><Clouds frame={f} y={22} color="#5a6a90" opacity={0.95} speed={0.25} count={10} seed={9} /><Sea frame={f * 1.6} color="#2c5d94" amp={0.95} /><Whitecaps frame={f * 1.5} count={80} area={80} opacity={0.85} center={[0, 30]} seed={6} />
    <Ship position={[0, 0.9, 0]} rotation={0.4} frame={f * 1.4} rough={1.8} lit={0.6} /><Storm frame={f} center={[0, 0, 0]} area={36} rain={1} wind={1.3} slant={0.5} count={180} /></>});
// 6 relief boat comes through
mk(6, {pal: DAWN, fog: [40, 200], pills: [['26 DEC', 236, 'yellow', 62, 11.35], ['RELIEF BOAT', 316, 'white', 50, 11.7]], cam: (d) => push([22, 5, 50], [14, 3.5, 40], [[2, 4, 10], [0, 5, 6]], d, [54, 44], 0.3),
  children: (f, d) => <><OutsideFull f={f} tint={DT} night={false} rain={0.2} lantern={0.04} seed={300} /><Ship position={[14 - f * 0.2, 0, 34]} rotation={-1.0} frame={f} lit={0} scale={1.4} rough={0.8} /></>});
// 7 the gate is shut, the beds empty
const gx = LH.x + 1.6, gz = LH.z + 4.4;
mk(7, {pal: DAWN, fog: [40, 200], pills: [['GATE SHUT.', 236, 'red', 62, 12.55], ['BEDS EMPTY.', 316, 'yellow', 56, 13.4]], cam: (d) => push([gx + 7, height(gx, gz) + 5, gz + 12], [gx + 3.5, height(gx, gz) + 2.6, gz + 6], [[gx - 1, height(gx, gz) + 1, gz], [gx, height(gx, gz) + 1, gz - 0.5]], d, [48, 42]),
  children: (f, d) => { const t = clamp01(f / (d - 6)); const px = gx - 3.5 + 3.3 * t, pz = gz + 6 - 5.3 * t;
    return <><Outside f={f} tint={DT} night={false} rain={0.2} house gate={0} seed={500} /><Person position={[px, height(px, pz) + 0.05, pz]} rotation={Math.atan2(gx - px, gz - 0.6 - pz)} scale={0.62} pose={t < 1 ? 'walk' : 'stand'} phase={t < 1 ? f / 4 : f / 9} {...KEEPERS.moore} /></>; }});
// 8 clock stopped (interior)
mk(8, {pal: ROOM, fog: [30, 80], bg: 'radial-gradient(ellipse at 50% 40%, #6b5a48 0%, #2a2018 100%)', pills: [['CLOCK', 236, 'yellow', 62, 14.45], ['STOPPED.', 316, 'red', 66, 14.65]], flash: [14.4], cam: (d) => push([-0.5, 3.8, 2.5], [-1.9, 3.6, -1.0], [[-2.2, 3.4, -5], [-2.2, 3.5, -5]], d, [50, 38], 0.3),
  children: (f) => <Room frame={f} flash={flashAt(f, [10])} />});
// 9 TWIST: lamp room (global LAMP: READY overlay)
mk(9, {pal: GOLD, fog: [20, 60], bg: 'radial-gradient(ellipse at 50% 55%, #f0a640 0%, #8a4a14 45%, #2a1606 100%)', flash: [15.4], bloom: 1.8, cam: (d) => orbit([0, 2.6, 0], -0.9, -0.2, 7.5, 6.2, 0.8, 1.2, d, [54, 46]),
  children: (f) => <><LanternRoom frame={f} glint={0.5 + 0.5 * Math.sin(f * 0.1)} /><Storm frame={f} center={[0, -4, 0]} area={26} rain={0.6} wind={0.6} count={120} /></>});
mk(10, {pal: GOLD, fog: [20, 60], bg: 'radial-gradient(ellipse at 50% 55%, #f0a640 0%, #8a4a14 45%, #2a1606 100%)', pills: [['FOUNTAIN FULL', 236, 'yellow', 52, 17.7], ['LAMP CLEAN', 316, 'white', 48, 18.0]], bloom: 1.6, cam: (d) => orbit([2.4, 1.2, 1.4], 1.4, 0.4, 6.0, 3.8, 1.8, 1.2, d, [52, 44]),
  children: (f) => <><LanternRoom frame={f + 30} glint={0.8} /></>});
// 11-14 west landing
const WL = (i, {pills, cam, box = 0, twist = 0, marker = 0, persons = false}) => mk(i, {pal: GALE, fog: [30, 140], pills, cam, children: (f, d) => { const BX = LANDING_SET.box;
  return <><Clouds frame={f} y={26} color="#8a98b8" opacity={0.95} speed={0.3} count={9} seed={14} z0={-20} /><WestLanding frame={f + 900} twist={twist} boxGone={box} marker={typeof marker === 'function' ? marker(f, d) : marker} tint="#e6ebf5" />
    <Sea frame={f * 1.3 + 1100} color="#3a6aa4" amp={0.9} y={-0.2} size={160} seg={56} /><Whitecaps frame={f * 1.2} count={50} area={60} center={[0, 30]} seed={11} />
    <Spray frame={f} pts={[[0, 2], [2.5, 1.6], [5, 1.4], [7.5, 1.8], [-2.5, 2.2], [10, 2]]} height={4} size={2.6} period={50} /><Storm frame={f} center={[4, 0, 2]} area={26} rain={0.6} wind={1.2} slant={0.5} count={140} /></>; }});
WL(11, {pills: [['WEST LANDING', 236, 'white', 52, 18.8]], cam: (d) => push([-2, 6, 20], [1, 8, 15], [[4, 6.5, -2], [4.5, 8, -2.5]], d, [52, 48], 0.3)});
WL(12, {pills: [['110 FT', 236, 'yellow', 80, 20.7], ['ABOVE THE SEA', 316, 'dark', 44, 21.0]], marker: (f, d) => clamp01((f - 8) / 30), cam: (d) => push([8, 1.5, 12], [6, 4.5, 8], [[4.6, 4, -2], [4.6, 9, -2.9]], d, [58, 50], 0.3)});
WL(13, {pills: [['ROPE BOX', 236, 'white', 56, 22.3], ['TORN AWAY.', 316, 'red', 62, 22.55]], box: 1, marker: 0.0, cam: (d) => push([0, 8.5, 15], [3.4, 9.2, 8.5], [[4.5, 8, -2.5], [4.6, 9.6, -2.9]], d, [50, 38], 0.6)});
WL(14, {pills: [['IRON RAILINGS', 236, 'white', 44, 23.7], ['TWISTED.', 316, 'red', 66, 24.2]], box: 1, twist: 1, cam: (d) => push([8, 9, 10], [9.5, 8.5, 6.5], [[4.5, 6.6, -1.2], [4.6, 6.6, -1.0]], d, [48, 42], 0.5)});
// 15 two keepers go down the track in boots + oilskins
mk(15, {pal: GALE, fog: [35, 180], pills: [['BOOTS +', 236, 'yellow', 56, 25.6], ['OILSKINS', 316, 'white', 56, 25.9]], flash: [25.52], cam: (d) => { const A = trk(0, 2, 8), B = trk(1, 2, 8); return push([A[0] + 4.5, A[1] + 2.4, A[2] + 4.5], [B[0] + 3.4, B[1] + 2.0, B[2] + 3.6], [[A[0], A[1] + 1.0, A[2]], [B[0], B[1] + 1.0, B[2]]], d, [52, 44], 0.5); },
  children: (f, d) => { const k = clamp01(f / d); const [px, , pz] = trk(k, 2, 8); const [qx, , qz] = trk(Math.min(1, k + 0.04), 2, 8); const rot = Math.atan2(qx - px, qz - pz);
    return <><Outside f={f} tint="#d8e0f0" night={false} rain={0.9} sea={0.9} seed={700} house /><Whitecaps frame={f + 700} count={50} />
      <Person position={[px, height(px, pz) + 0.05, pz]} rotation={rot} scale={0.62} pose="walk" phase={f / 3.2} {...KEEPERS.marshall} />
      <Person position={[px + 1.0, height(px + 1.0, pz) + 0.05, pz - 0.4]} rotation={rot} scale={0.62} pose="walk" phase={f / 3.2 + 1.3} {...KEEPERS.ducat} shirt="#c8921e" /></>; }});
// 16 storm gear on at the landing
mk(16, {pal: GALE, fog: [30, 140], pills: [['STORM GEAR', 236, 'yellow', 56, 27.3], ['ON.', 316, 'white', 62, 27.9]], cam: (d) => push([8.5, 7.6, 7.0], [6.4, 7.0, 4.2], [[4.6, 6.7, -1.2], [4.4, 6.9, -1.4]], d, [54, 42], 0.5),
  children: (f) => { const P = LANDING_SET.platform;
    return <><WestLanding frame={f + 900} twist={0} boxGone={0} tint="#dfe6f2" /><Sea frame={f * 1.4 + 300} color="#3a6aa4" amp={1.0} y={-0.2} size={160} seg={56} /><Spray frame={f} pts={[[0, 2], [2.5, 1.6], [5, 1.4], [7.5, 1.8]]} height={4.5} size={2.6} period={44} /><Storm frame={f} center={[4, 0, 2]} area={26} rain={0.9} wind={1.5} slant={0.55} count={150} />
      <Person position={[P[0] - 0.4, P[1] + 0.02, P[2] + 0.7]} rotation={Math.PI * 0.9} scale={0.6} pose="stand" phase={f / 5} {...KEEPERS.marshall} /><Person position={[P[0] + 0.9, P[1] + 0.02, P[2] + 0.5]} rotation={Math.PI * 0.85} scale={0.6} pose="stand" phase={f / 5 + 1} {...KEEPERS.ducat} shirt="#c8921e" /></>; }});
// 17 third was meant to stay (lamp room, McArthur beside the lens)
mk(17, {pal: GOLD, fog: [20, 60], bg: 'radial-gradient(ellipse at 50% 55%, #f0a640 0%, #8a4a14 45%, #2a1606 100%)', pills: [['ONE MUST', 236, 'yellow', 56, 28.8], ['STAY.', 316, 'red', 70, 29.2]], cam: (d) => orbit([0, 2.4, 0], 0.5, -0.4, 8.2, 6.4, 1.0, 1.4, d, [54, 46]),
  children: (f) => <><LanternRoom frame={f + 90} glint={0.3} /><Person position={[1.1, 0.05, 3.0]} rotation={-2.7} scale={1.1} pose="stand" phase={f / 9} {...KEEPERS.mcarthur} /></>});
// 18 with the light
mk(18, {pal: NIGHT, fog: [40, 200], pills: [['WITH THE', 236, 'white', 56, 30.3], ['LIGHT.', 316, 'yellow', 70, 30.6]], cam: (d) => push([-6, lhY() + 0.8, 14], [-2.5, lhY() + 3.6, 9], [[LH.x, lhY() + 4.5, LH.z], [LH.x, lhY() + 5.8, LH.z]], d, [58, 44], 0.3),
  children: (f) => <><Outside f={f} beam={0.0} lantern={0.55} tint={NT} seed={1100} /><Glow position={[LH.x, lhY() + 6.0, LH.z]} size={6} color="#ffd36a" opacity={0.5} /></>});
// 19 REVEAL: shirt sleeves (global SHIRT SLEEVES overlay): McArthur runs out of the compound, white shirt, no coat
mk(19, {pal: GALE, fog: [35, 180], flash: [31.23], bloom: 1.6, cam: (d) => { const A = trk(0, 0, 4), B = trk(1, 0, 4); return push([A[0] + 3.0, A[1] + 1.8, A[2] + 5.0], [B[0] + 2.0, B[1] + 1.6, B[2] + 3.6], [[A[0], A[1] + 1.1, A[2]], [B[0], B[1] + 1.1, B[2]]], d, [56, 44], 0.7); },
  children: (f, d) => { const k = clamp01(f / d); const [px, , pz] = trk(k, 0, 4); const [qx, , qz] = trk(Math.min(1, k + 0.04), 0, 4);
    return <><Outside f={f} tint="#d8e0f0" night={false} rain={1} sea={0.9} house seed={1200} /><Person position={[px, height(px, pz) + 0.05, pz]} rotation={Math.atan2(qx - px, qz - pz)} scale={0.75} pose="walk" phase={f / 2.6} {...KEEPERS.mcarthur} /></>; }});
// 20 one wave (the official theory) - the roller hits the landing (global endq overlay)
mk(20, {pal: GALE, fog: [30, 140], flash: [34.0], cam: (d) => push([14, 7, 18], [12, 9, 22], [[4, 7, -1], [4, 8, -1]], d, [52, 56], 0.5),
  children: (f, d) => { const w = easeOut(clamp01((f - 8) / (d - 20))); const BX = LANDING_SET.box;
    return <><Clouds frame={f} y={26} color="#7a88aa" opacity={0.95} speed={0.35} count={9} seed={15} z0={-20} /><WestLanding frame={f + 900} twist={0} boxGone={0} tint="#dfe6f2" /><Sea frame={f * 1.5} color="#3a6aa4" amp={1.0 + w} y={-0.2} size={160} seg={56} />
      <group position={[4, -1 + w * 2, 8 - w * 9]} scale={[1, 0.2 + w * 1.0, 1]}><mesh rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[6, 6, 22, 14, 1, true, 0, Math.PI * 0.75]} /><meshPhongMaterial color="#2f78c8" transparent opacity={0.92} flatShading side={THREE.DoubleSide} shininess={80} specular="#cfe6ff" /></mesh></group>
      {w > 0.5 && <Fountain position={[4.6, 1, -0.5]} t={clamp01((w - 0.5) * 2)} height={9} width={3.2} count={44} puff={0.17} frame={f} color="#d6ecfa" />}
      <Storm frame={f * 1.4} center={[4, 0, 2]} area={26} rain={0.8} wind={1.6} slant={0.6} count={140} /></>; }});
// 21 or he ran to save them: McArthur running down the track toward the landing
mk(21, {pal: GALE, fog: [35, 180], cam: (d) => { const A = trk(0, 8, 9), B = trk(1, 8, 9); return push([A[0] + 4.0, A[1] + 2.2, A[2] + 5.0], [B[0] + 3.0, B[1] + 1.9, B[2] + 4.0], [[A[0], A[1] + 1.0, A[2]], [B[0], B[1] + 1.0, B[2]]], d, [54, 46], 0.7); },
  children: (f, d) => { const k = clamp01(f / d); const [px, , pz] = trk(k, 8, 9); const [qx, , qz] = trk(Math.min(1, k + 0.04), 8, 9);
    return <><Outside f={f} tint="#d8e0f0" night={false} rain={1} sea={1.0} house seed={1300} /><Person position={[px, height(px, pz) + 0.05, pz]} rotation={Math.atan2(qx - px, qz - pz)} scale={0.7} pose="walk" phase={f / 2.4} {...KEEPERS.mcarthur} /></>; }});
// 22 END: frame-0 hut set, camera ends on frame 0's pose, beam ON, coat swinging
S[22] = () => { const f = useCurrentFrame(); const d = dur(22);
  return <Stage palette={NIGHT} fog={[40, 160]} overlay={<CFlash at={[at(0.4)]} k={0.4} len={6} />}>
    {push(HP([0.3, 1.7, 1.7]), HP(H0.from), [HP([-0.4, 1.5, -2]), HP(H0.look0)], d, [52, 62], 0.2, 'inout')}
    <Hook f={f} end beam={clamp01(f / 14)} /><Post bloom={1.4} threshold={0.4} vignette={0.42} /></Stage>; };

const Over = () => <>
  <Sequence from={0} durationInFrames={at(2.6)}><Pill text="3 KEEPERS GONE." y={236} variant="yellow" delay={-7} size={60} /><Pill text="1 COAT LEFT." y={316} variant="red" delay={-5} size={66} /></Sequence>
  <Sequence from={C[9]} durationInFrames={at(17.6) - C[9]}><Pill text="LAMP:" y={236} variant="yellow" delay={0} size={66} /><Pill text="READY." y={316} variant="red" delay={3} size={70} /></Sequence>
  <Sequence from={C[19]} durationInFrames={at(32.8) - C[19]}><Pill text="SHIRT" y={236} variant="yellow" delay={0} size={66} /><Pill text="SLEEVES." y={316} variant="red" delay={3} size={70} /></Sequence>
  <Sequence from={at(33.2)} durationInFrames={at(38.4) - at(33.2)}><Pill text="ONE WAVE?" y={236} variant="yellow" delay={0} size={62} /><Pill text="OR HE RAN?" y={316} variant="red" delay={5} size={62} /></Sequence></>;

export const FL = () => {
  const ready = usePreload(PATHS);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? FL_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 1 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Over />
    <Grade look="cold" strength={0.12} /><Finish vignette={0.3} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
