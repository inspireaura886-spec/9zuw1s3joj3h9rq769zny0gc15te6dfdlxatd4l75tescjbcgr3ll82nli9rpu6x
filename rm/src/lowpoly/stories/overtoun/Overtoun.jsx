// "The bridge where dogs jump" (Overtoun Bridge, Scotland) - low-poly 3D Short, ANIMATION UPGRADE 2026-10-22 kit.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Stage, CameraRig, ShotCam, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Person, VILLAGER_LOOKS, Glow, Clouds, Birds,
  Post, OutlineScope, Particles, Burst, GodRays, FogLayer, Grade, Flash, WhipStreaks, MotionBlur, LightLeak, Orb, Building, Tree, Rock,
  clamp01, easeOut, easeInOut, mixPalette} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2} from '../common.jsx';
import {Ground, Burn, Bridge, House, Woods, Dog, Mink, Canister, height, PARAPET_H, WALL_Z} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
const LS = VO.line_starts.map((s) => at(s));
export const OT_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(txt)); return w ? at(w[1]) : LS[fromLine]; };
const cl = (f, a, b) => clamp01((f - a) / Math.max(1, b - a));
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// palettes: golden autumn afternoon, eerie overcast, dusk, bright test-field day
const GOLDEN = {top: '#2a3f7a', mid: '#c27a52', hor: '#ffd38c', fog: '#d3a27c', amb: 1.15, hemiSky: '#ffe2b4', hemiGround: '#4c4a2a', hemiI: 1.45, sun: '#ffd49c', sunI: 2.9, sunPos: [-30, 26, 24], rim: '#ff9a5a', rimI: 1.7, rimPos: [30, 18, -40], glow: 0.5};
const EERIE = {top: '#232a3a', mid: '#566470', hor: '#c8b48c', fog: '#7c8078', amb: 1.0, hemiSky: '#d8e0e8', hemiGround: '#3a3a2c', hemiI: 1.3, sun: '#e8e0d0', sunI: 1.9, sunPos: [-20, 30, 10], rim: '#9fc8ff', rimI: 1.4, rimPos: [25, 18, -45], glow: 0.6};
const DUSK = {top: '#1e1a4e', mid: '#7a3a6a', hor: '#ff8a4a', fog: '#8a5a68', amb: 0.95, hemiSky: '#ffb08a', hemiGround: '#2d2a4a', hemiI: 1.3, sun: '#ffa060', sunI: 2.3, sunPos: [-40, 10, -20], rim: '#ff7ab0', rimI: 1.6, rimPos: [40, 20, 30], glow: 1};
const FIELD = {top: '#2a6ad0', mid: '#6ab6f0', hor: '#ffe9be', fog: '#c6e0ee', amb: 1.15, hemiSky: '#cfe8ff', hemiGround: '#6a8a3a', hemiI: 1.5, sun: '#fff1d6', sunI: 3.0, sunPos: [30, 40, 20], rim: '#ffd7a0', rimI: 1.5, rimPos: [-30, 25, -40], glow: 0};
const LEAVES = (f, c = [0, 2, 3], a = [22, 14, 16], n = 70) => <><Particles kind="ash" center={c} area={a} count={n} frame={f} color="#e07a2a" size={0.11} wind={[0.012, 0.006]} seed={3} /><Particles kind="ash" center={c} area={a} count={Math.round(n * 0.5)} frame={f} color="#c8401c" size={0.1} wind={[0.01, 0.004]} seed={8} /></>;
const RAYS = (f, p = [-14, 18, -18]) => <GodRays position={p} dir={[0.45, -1, 0.55]} length={26} width={2.6} count={6} spread={0.35} frame={f} color="#ffd9a0" opacity={0.2} dust={40} />;
const DOG_Y = 0.06; const WALL_TOP = PARAPET_H + 0.16;
const HOOKCAM = {pos: [3.0, -0.3, 7.6], look: [-0.5, 2.7, 2.05], fov: 54};
const World = ({f, lit = 0.3, woods = true, seed = 5}) => <><Ground /><Burn frame={f} /><Bridge /><House lit={lit} frame={f} />{woods && <Woods frame={f} seed={seed} />}</>;

// ---------- A1: hook. a dog frozen on the parapet, staring at nothing, the gorge below ----------
const A1 = () => {
  const f = useCurrentFrame(); const d = at(4.34);
  return <Stage palette={GOLDEN} fog={[30, 140]} overlay={<>
    <Pill text="SCOTLAND" y={236} variant="yellow" delay={-20} />
    <Headline y={318} lines={[{text: 'THE BRIDGE', color: 'white', size: 108}, {text: 'WHERE DOGS JUMP', color: 'yellow', size: 96}]} delay={-20} />
    {f >= wordAt('stare') && <Pill text="STARING AT NOTHING" y={1130} variant="red" delay={wordAt('stare')} size={44} />}
  </>}>
    <CameraRig keys={[{f: 0, ...HOOKCAM}, {f: d, pos: [2.2, 0.3, 6.2], look: [-0.5, 2.6, 2.05], fov: 50}]} drift={0.06} />
    <World f={f} />
    <Dog position={[-0.5, WALL_TOP, 2.05]} rotation={1.75} scale={1.35} look="golden" pose="freeze" headUp={0.25 + 0.15 * cl(f, 60, 100)} frame={f} shadow={false} />
    {RAYS(f)}{LEAVES(f, [0, 1, 4], [14, 10, 8], 60)}
    <Birds center={[0, 16, -10]} radius={10} frame={f} count={5} color="#2a1a14" speed={0.03} size={0.5} />
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- A2: the leap, seen from the bottom of the gorge (cut before it lands) ----------
const A2 = () => {
  const f = useCurrentFrame(); const t = f; const fallEnd = 46;
  const y = WALL_TOP + 0.16 * t - 0.0078 * t * t; const z = 2.05 + 0.1 * t;
  return <Stage palette={GOLDEN} fog={[30, 150]} overlay={<>
    <Headline y={300} lines={[{text: '50 FEET', color: 'yellow', size: 130}, {text: 'ONTO THE ROCKS', color: 'white', size: 80}]} delay={4} />
  </>}>
    <ShotCam preset="push" from={[3, -9, 28]} to={[2.4, -9.5, 24]} look={[[0, -3, 0], [0, -7, 3]]} fov0={56} fov1={54} start={0} end={60} ease="inout" />
    <World f={f + 130} />
    {f < fallEnd && <Dog position={[-0.5, y, z]} rotation={0} look="golden" pose="leap" pitch={-t * 0.035} frame={f} shadow={false} scale={1.9} />}
    <Burst kind="splash" position={[-0.4, -15.2, 2.05 + 0.1 * fallEnd]} start={fallEnd} frame={f} count={50} speed={0.3} up={0.9} spread={1.0} gravity={0.02} life={24} color="#dff2f8" />
    {LEAVES(f + 130, [0, -6, 4], [12, 16, 10], 70)}
    <FogLayer y={-14.2} size={60} layers={3} thickness={1.4} color="#f0dcc0" opacity={0.18} frame={f} />
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- B1: crane-up reveal: the burn, the arches, the bridge, Overtoun House, the wooded gorge ----------
const B1 = () => {
  const f = useCurrentFrame(); const d = at(9.6) - LS[1]; const tb = wordAt('built', 1) - LS[1];
  const wx = -13 + f * 0.035;
  return <Stage palette={GOLDEN} fog={[40, 180]} overlay={<>
    <Pill text="OVERTOUN BRIDGE" y={236} variant="yellow" delay={4} />
    {f >= tb - 4 && <Headline y={318} lines={[{text: 'BUILT 1895', color: 'white', size: 112}]} delay={tb - 4} />}
    <LightLeak from={0} len={45} />
  </>}>
    <ShotCam preset="crane" target={[0, -6, 0]} angle={0.62} h0={-8} h1={14} r0={14} r1={34} lookY0={0} lookY1={-2} start={0} end={d} ease="inout" fov0={56} fov1={50} />
    <World f={f} lit={0.3} />
    <OutlineScope thickness={0.03}>
      <Person position={[wx, 0.04, -0.6]} rotation={Math.PI / 2} pose="walk" phase={f / 4} shadow {...VILLAGER_LOOKS[2]} />
    </OutlineScope>
    <Dog position={[wx + 1.4, DOG_Y, -0.2]} rotation={Math.PI / 2} look="collie" pose="walk" phase={f / 3} frame={f} />
    {RAYS(f, [-20, 22, -26])}{LEAVES(f, [0, -2, 0], [30, 22, 20], 80)}
    <FogLayer y={-13.6} size={70} layers={3} thickness={1.8} color="#f4e2c8" opacity={0.2} frame={f} />
    <Birds center={[4, 18, -6]} radius={14} frame={f} count={6} color="#2a1a14" speed={0.025} size={0.6} />
    <Post bloom={0.9} threshold={0.62} vignette={0} />
  </Stage>;
};

// ---------- B2: the real bridge (photo card) over a slow side view ----------
const B2 = () => {
  const f = useCurrentFrame(); const d = LS[2] - at(9.6);
  return <Stage palette={GOLDEN} fog={[40, 180]} overlay={<>
    <PhotoCard src="overtoun/IMG1.jpg" credit="Overtoun Bridge · photo: Lairich Rig, CC BY-SA 2.0" tag="THE REAL BRIDGE" dur={d} zoom={[1.02, 1.12]} pan={[0, -24]} />
  </>}>
    <ShotCam preset="push" from={[2, -4, 30]} to={[0, -3, 24]} target={[0, -5, 0]} fov0={50} fov1={48} start={0} end={d} />
    <World f={f + 96} />
    {LEAVES(f, [0, -2, 6], [30, 20, 16], 60)}
    <Post bloom={0.8} threshold={0.65} vignette={0} />
  </Stage>;
};

// ---------- C: LOOP2. three dogs, the same side, the same end ----------
const SPOT = [8.8, DOG_Y, 1.25];
const C = () => {
  const f = useCurrentFrame(); const d = LS[3] - LS[2]; const ts = wordAt('same', 2) - LS[2]; const te = wordAt('end', 2) - LS[2];
  const dogs = ['golden', 'collie', 'terrier'].map((look, i) => { const s0 = 8 + i * 36; const u = cl(f, s0, s0 + 44); const k = easeOut(u);
    const p = lerp3([-17, DOG_Y, -0.2 + i * 0.35], [SPOT[0] - i * 1.25, DOG_Y, SPOT[2] - i * 0.1], k);
    return {look, p, run: u < 1, rot: u < 1 ? Math.PI / 2 : 0.2, i}; });
  const pulse = 0.6 + 0.4 * Math.sin(f * 0.3);
  return <Stage palette={GOLDEN} fog={[40, 180]} overlay={<>
    <Pill text="OWNERS SAY" y={236} variant="yellow" delay={wordAt('owners', 2) - LS[2]} />
    {f >= ts - 3 && <Headline y={318} lines={[{text: 'SAME SIDE', color: 'white', size: 110}, ...(f >= te - 6 ? [{text: 'SAME END', color: 'red', size: 110}] : [])]} delay={ts - 3} stagger={te - ts - 3} />}
  </>}>
    <ShotCam preset="orbit" target={[6.5, 0, 0.8]} a0={Math.PI + 0.35} a1={Math.PI - 0.3} r0={12} r1={9.5} h0={9} h1={6.5} start={0} end={d} ease="inout" fov0={52} fov1={50} />
    <World f={f} />
    <Bridge glow={f > ts - 6 ? pulse : 0} />
    <Glow position={[SPOT[0] + 0.3, 1.3, WALL_Z]} size={f > ts - 6 ? 3.4 * pulse : 0.01} color="#ff3a2a" opacity={0.6} />
    <OutlineScope thickness={0.025}>
      {dogs.map((g) => <Dog key={g.i} position={g.p} rotation={g.rot} look={g.look} pose={g.run ? 'run' : 'freeze'} headUp={g.run ? 0 : 0.35} phase={f / 2.2 + g.i} frame={f} />)}
    </OutlineScope>
    {LEAVES(f, [5, 2, 0], [24, 10, 14], 60)}
    <Post bloom={1.0} threshold={0.55} vignette={0} />
  </Stage>;
};

// ---------- D1: 2014, Cassie stops and stares at something above the bridge (dolly zoom) ----------
const CAS = [2.6, DOG_Y, 0.9];
const D1 = () => {
  const f = useCurrentFrame(); const d = at(22.3) - LS[3]; const tst = wordAt('stared', 3) - LS[3];
  const walk = f < tst - 6; const cx = walk ? -6 + (f / (tst - 6)) * (CAS[0] + 6) : CAS[0];
  const ox = -9 + Math.min(f, tst + 10) * 0.045;
  const k = cl(f, tst - 10, d); const pal = mixPalette(GOLDEN, EERIE, easeInOut(k));
  return <Stage palette={pal} fog={[30, 150]} overlay={<>
    <Pill text="2014" y={236} variant="yellow" delay={2} />
    <Headline y={318} lines={[{text: 'CASSIE', color: 'yellow', size: 120}, {text: 'A SPRINGER SPANIEL', color: 'white', size: 64}]} delay={wordAt('spaniel', 3) - LS[3] - 6} />
    {f >= tst && <Pill text="STARING ABOVE THE BRIDGE" y={1060} variant="red" delay={tst} size={42} />}
  </>}>
    {f < tst - 8
      ? <CameraRig keys={[{f: 0, pos: [-7, 2.6, -5.0], look: [-4.6, 0.7, 0.9], fov: 54}, {f: tst - 8, pos: [1.6, 1.6, -3.4], look: [CAS[0], 0.8, 0.9], fov: 52}]} drift={0.05} />
      : <ShotCam preset="dollyZoom" target={[CAS[0], 0.75, CAS[2]]} dir={[-0.35, 0.3, -1]} d0={3.6} d1={9} fov0={50} start={tst - 8} end={d} ease="inout" drift={0} />}
    <World f={f} />
    <OutlineScope thickness={0.03}>
      <Dog position={[cx, DOG_Y, CAS[2]]} rotation={walk ? Math.PI / 2 : Math.PI - 0.5} look="cassie" pose={walk ? 'run' : 'freeze'} headUp={walk ? 0 : 0.85 * cl(f, tst - 6, tst + 6)} phase={f / 2.4} frame={f} />
      <Person position={[ox, 0.04, -0.4]} rotation={Math.PI / 2} pose={f < tst + 10 ? 'walk' : 'stand'} phase={f / 4} shadow skin="#e6b892" shirt="#3a6a8a" pants="#2a2a3a" hair="#7a4a2a" />
      <Person position={[ox - 1.3, 0.04, -0.9]} rotation={Math.PI / 2} scale={0.72} pose={f < tst + 10 ? 'walk' : 'lookup'} actT={cl(f, tst + 10, tst + 24)} phase={f / 3.5} shadow skin="#e6b892" shirt="#c43a2a" pants="#2a3a5a" hair="#5a3a1a" />
    </OutlineScope>
    {Array.from({length: 4}, (_, i) => <Glow key={i} position={[CAS[0] - 1 + i * 0.9, 7 + Math.sin(f * 0.05 + i) * 0.6, 1 + i * 0.5]} size={1.4 + 0.3 * Math.sin(f * 0.1 + i)} color="#cfe0ff" opacity={0.18 * k} />)}
    <Particles kind="motes" center={[CAS[0], 6, 1]} area={[6, 5, 4]} count={40} frame={f} color="#d8e6ff" opacity={0.6 * k + 0.1} />
    {LEAVES(f, [2, 2, 1], [18, 10, 10], 60)}
    <Post bloom={1.0} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- D2: she jumps the wall; her owner recoils; the owner's quote ----------
const D2 = () => {
  const f = useCurrentFrame(); const d = LS[4] - at(22.3); const t = f;
  const up = cl(t, 0, 10); const air = Math.max(0, t - 10);
  const pos = t < 10 ? [CAS[0], DOG_Y + up * (WALL_TOP - DOG_Y + 0.25) * Math.sin(up * Math.PI / 2), CAS[2] + up * 1.15] : [CAS[0], WALL_TOP + 0.25 + 0.06 * air - 0.012 * air * air, WALL_Z + 0.08 * air];
  const tq = wordAt('her', 3) - at(22.3);
  return <Stage palette={EERIE} fog={[30, 150]} overlay={<>
    <Flash at={10} y="56%" max={0.35} color="#e8eeff" />
    <DocCard top={300} size={40} width={900} lines={['"...she definitely saw', 'something that made her jump."']} source="CASSIE'S OWNER · 2014" delay={tq} highlight={[1]} />
    {f >= tq + 20 && <Pill text="SOMETHING SINISTER" y={1060} variant="red" delay={tq + 20} size={46} />}
  </>}>
    <ShotCam preset="push" from={[-4.5, 3.8, -8]} to={[-3.2, 3.0, -6.2]} target={[CAS[0] - 1.2, 0.8, 1.2]} fov0={56} fov1={52} start={0} end={d} shake={0.25} shakeFrom={10} shakeLen={12} ease="ramp" />
    <World f={f + 140} />
    <OutlineScope thickness={0.03}>
      {pos[1] > -6 && <Dog position={pos} rotation={0.0} look="cassie" pose={t < 4 ? 'freeze' : 'leap'} pitch={t > 10 ? -air * 0.05 : 0} frame={f} shadow={t < 3} />}
      <Person position={[-1.2, 0.04, -0.4]} rotation={1.2} pose="recoil" actT={cl(f, 8, 20)} phase={f / 6} shadow skin="#e6b892" shirt="#3a6a8a" pants="#2a2a3a" hair="#7a4a2a" />
      <Person position={[-2.6, 0.04, -0.9]} rotation={1.0} scale={0.72} pose="point" actT={cl(f, 12, 22)} phase={f / 6} shadow skin="#e6b892" shirt="#c43a2a" pants="#2a3a5a" hair="#5a3a1a" />
    </OutlineScope>
    <Burst kind="debris" position={[CAS[0], WALL_TOP, WALL_Z]} start={9} frame={f} count={26} speed={0.18} up={0.6} spread={1} gravity={0.012} life={40} color="#d0702a" />
    {LEAVES(f + 140, [1, 2, 2], [16, 10, 10], 60)}
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- E: since the 1950s: a procession of ghost dogs at dusk; no official records ----------
const E = () => {
  const f = useCurrentFrame(); const d = LS[5] - LS[4]; const tn = wordAt('no', 4) - LS[4];
  const n = Math.round(300 * easeOut(cl(f, 18, 90)));
  const ghosts = Array.from({length: 14}, (_, i) => { const x = -18 + ((f * 0.06 + i * 2.6) % 36); return {x, z: -1.2 + (i % 3) * 0.9, i}; });
  return <Stage palette={DUSK} fog={[30, 160]} overlay={<>
    <Pill text={f < tn ? 'LOCALS CLAIM · SINCE THE 1950s' : 'NO OFFICIAL RECORDS'} y={236} variant={f < tn ? 'yellow' : 'red'} delay={f < tn ? 2 : tn} size={40} />
    <div style={{position: 'absolute', top: 320, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 200, color: f < tn ? '#ffd93b' : '#ff5a4e', WebkitTextStroke: '16px #141414', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.3)', transform: `rotate(${f >= tn ? Math.sin(f * 0.8) * 2 : 0}deg)`}}>{f < tn ? `${n}+` : '???'}</div>
    <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 56, color: '#fff', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill'}}>{f < tn ? 'DOGS, THEY SAY' : 'NOBODY COUNTED'}</div>
  </>}>
    <ShotCam preset="orbit" target={[0, 0, 0]} a0={Math.PI + 0.7} a1={Math.PI + 0.25} r0={16} r1={13} h0={9} h1={7} start={0} end={d} ease="inout" fov0={52} fov1={50} />
    <World f={f} lit={1} seed={9} />
    {ghosts.map((g) => ({...g, o: 0.4 * clamp01(1 - Math.abs(g.x) / 18) * (f >= tn ? clamp01(1 - (f - tn) / 40) : 1)})).filter((g) => g.o > 0.02).map((g) => <Dog key={g.i} position={[g.x, DOG_Y + 0.1 + Math.sin(f * 0.08 + g.i) * 0.08, g.z]} rotation={Math.PI / 2} look="golden" scale={1.3} pose="walk" phase={f / 3 + g.i} frame={f} ghost={g.o} shadow={false} />)}
    <Orb position={[-40, 26, -90]} radius={4} color="#ffe2b0" />
    <Particles kind="motes" center={[0, 2, 0]} area={[30, 6, 8]} count={50} frame={f} color="#ffd8a0" />
    {LEAVES(f, [0, 2, 0], [30, 10, 14], 50)}
    <Post bloom={1.2} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- F0: whip into the theory ----------
const WhipShot = () => <Stage palette={GOLDEN} fog={[30, 150]}>
  <ShotCam preset="whip" from={[6, -6, 12]} lookA={[-10, 2, 0]} lookB={[6, -9, 3]} w0={0} w1={10} ease="ramp" drift={0} />
  <World f={useCurrentFrame()} />
  <Post bloom={0.9} threshold={0.6} vignette={0} />
</Stage>;
const F0 = () => <AbsoluteFill><MotionBlur samples={4} shutterAngle={220}><WhipShot /></MotionBlur><WhipStreaks from={0} to={10} dir="h" /></AbsoluteFill>;

// ---------- F1: LOOP3. the expert's theory: under the bridge ----------
const NEST = [7.4, -8.6, 3.4];
const F1 = () => {
  const f = useCurrentFrame(); const d = wordAt('and', 5) - LS[5] - 10; const tm = wordAt('mink', 5) - LS[5] - 10;
  return <Stage palette={GOLDEN} fog={[30, 150]} overlay={<>
    <Pill text="A DOG EXPERT'S THEORY" y={236} variant="yellow" delay={0} size={40} />
    <Headline y={318} lines={[{text: 'MINK NESTS', color: 'yellow', size: 112}, {text: 'UNDER THAT SIDE', color: 'white', size: 80}]} delay={tm - 4} />
  </>}>
    <ShotCam preset="push" from={[6.5, -6.4, 9.5]} to={[7.6, -7.4, 7.2]} target={[NEST[0], NEST[1] + 0.4, NEST[2]]} fov0={52} fov1={46} start={0} end={d} ease="out" />
    <World f={f} />
    {[[0, 0, 0, 1.2], [1.2, 0.2, -0.6, 0.9], [-1.0, -0.3, 0.3, 1.0], [0.4, -0.6, 1.1, 0.8]].map(([x, y, z, s], i) => <Rock key={i} position={[NEST[0] + x, NEST[1] + y - 0.4, NEST[2] + z - 0.8]} size={s} seed={i + 21} color="#7a6a58" moss="#6a7a3a" />)}
    <mesh position={[NEST[0] - 0.2, NEST[1] + 0.1, NEST[2] - 0.2]}><sphereGeometry args={[0.45, 8, 6]} /><meshBasicMaterial color="#120c08" /></mesh>
    <Mink position={[NEST[0] - 0.2 + cl(f, tm, tm + 24) * 1.3, NEST[1] - 0.05, NEST[2] + 0.2 + cl(f, tm, tm + 24) * 0.6]} rotation={0.9} frame={f} scale={1.5} />
    <Particles kind="motes" center={[NEST[0], NEST[1] + 4.5, NEST[2] - 0.6]} area={[2.2, 10, 2.2]} count={60} frame={f} color="#9bff6a" speed={1.6} opacity={0.75} />
    {LEAVES(f, [6, -5, 4], [10, 10, 8], 50)}
    <Post bloom={1.1} threshold={0.55} vignette={0} />
  </Stage>;
};

// ---------- F2: the scent test: 7 of 10 dogs run straight for the mink canister ----------
const F2 = () => {
  const f = useCurrentFrame(); const d = LS[6] - wordAt('and', 5);
  const cans = [[-3.4, 0, -3, '#3a8ad6'], [0, 0, -3.6, '#e8b830'], [3.4, 0, -3, '#d6302a']]; // mouse, squirrel, MINK
  const looks = ['golden', 'collie', 'terrier', 'lab', 'cassie', 'golden', 'collie', 'terrier', 'lab', 'cassie'];
  const goal = (i) => (i < 7 ? [3.4 + Math.cos(i * 0.9) * 1.1, 0, -3 + Math.sin(i * 0.9) * 1.1 + 0.9] : i === 7 ? [0, 0, -2.6] : [-5.5 + (i - 8) * 1.2, 0, 3.2]);
  return <Stage palette={FIELD} fog={[40, 200]} overlay={<>
    <Headline y={300} lines={[{text: '7 OF 10 DOGS', color: 'yellow', size: 110}, {text: 'CHOSE MINK SCENT', color: 'white', size: 74}]} delay={4} />
    <Pill text="RED = MINK" y={1080} x="74%" variant="red" delay={10} size={36} />
    <Pill text="BLUE = MOUSE" y={1080} x="27%" variant="white" delay={14} size={30} />
  </>}>
    <ShotCam preset="crane" target={[1.6, 0, -1.6]} angle={0.15} h0={4} h1={8} r0={9} r1={10.5} lookY0={0.5} lookY1={-0.5} start={0} end={d} ease="out" fov0={54} fov1={52} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><circleGeometry args={[60, 24]} /><meshLambertMaterial color="#7fae44" flatShading /></mesh>
    {[[-14, -16], [-6, -20], [4, -19], [13, -15], [18, -6], [-18, -5]].map(([x, z], i) => <Tree key={i} position={[x, 0, z]} s={2.4} color={['#d9a832', '#c4521f', '#7a8a2a'][i % 3]} seed={i} frame={f} />)}
    {cans.map(([x, y, z, c], i) => <Canister key={i} position={[x, y, z]} lid={c} />)}
    <Particles kind="motes" center={[3.4, 1.8, -3]} area={[1.2, 3, 1.2]} count={30} frame={f} color="#9bff6a" />
    <OutlineScope thickness={0.025}>
      {looks.map((lk, i) => { const s0 = 6 + (i % 5) * 4; const u = easeOut(cl(f, s0, s0 + 34)); const start = [-4 + (i % 5) * 2, 0, 5.5 + Math.floor(i / 5) * 1.2];
        const p = i >= 8 ? start : lerp3(start, goal(i), u); const g = goal(i);
        return <Dog key={i} position={[p[0], DOG_Y, p[2]]} rotation={i >= 8 ? Math.PI : Math.atan2(g[0] - start[0], g[2] - start[2])} look={lk} pose={i < 8 && u < 1 ? 'run' : 'stand'} phase={f / 2.2 + i} frame={f} />; })}
      {[0, 1].map((k) => <Person key={k} position={[-5.5 + k * 1.2, 0.04, 4.6]} rotation={0} pose="stand" phase={f / 10 + k} shadow {...VILLAGER_LOOKS[k + 3]} />)}
    </OutlineScope>
    <Burst kind="sparks" position={[3.4, 1.2, -3]} start={30} frame={f} count={30} speed={0.18} spread={1} gravity={0.004} life={26} color="#bfff9a" />
    <Post bloom={0.9} threshold={0.62} vignette={0} />
  </Stage>;
};

// ---------- G: dog's-eye view: the solid wall hides the drop; crane up and over to reveal it ----------
const G = () => {
  const f = useCurrentFrame(); const d = LS[7] - LS[6]; const tr = wordAt('drop', 6) - LS[6]; const tl = wordAt('leap', 6) - LS[6];
  const u = easeInOut(cl(f, tr - 16, tr + 14));
  const pos = lerp3([1.6, 0.55, -1.6], [2.2, 4.6, 5.2], u); const look = lerp3([0.6, 2.0, 6], [1.0, -12, 3.2], u);
  const jt = Math.max(0, f - tl); const dogP = jt < 8 ? [1.2, DOG_Y + cl(jt, 0, 8) * (WALL_TOP - DOG_Y + 0.2), 1.0 + cl(jt, 0, 8) * 1.0] : [1.2, WALL_TOP + 0.2 + 0.03 * (jt - 8) - 0.012 * (jt - 8) ** 2, WALL_Z + 0.07 * (jt - 8)];
  return <Stage palette={GOLDEN} fog={[30, 150]} overlay={<>
    <Pill text="A DOG'S-EYE VIEW" y={236} variant="yellow" delay={0} />
    <Headline y={318} lines={[{text: 'THE WALL HIDES', color: 'white', size: 100}, {text: 'THE DROP', color: 'red', size: 124}]} delay={wordAt('hides', 6) - LS[6] - 4} />
  </>}>
    <CameraRig keys={[{f: 0, pos, look, fov: 62}, {f: d, pos, look, fov: 62}]} drift={0.04} shake={0.2} shakeFrom={tr} shakeLen={14} />
    <World f={f} />
    {dogP[1] > -10 && <OutlineScope thickness={0.03}><Dog position={dogP} rotation={0} look="terrier" pose={jt === 0 ? 'freeze' : 'leap'} headUp={0.3} pitch={jt > 8 ? -(jt - 8) * 0.05 : 0} frame={f} shadow={jt === 0} /></OutlineScope>}
    {RAYS(f, [-12, 20, -14])}{LEAVES(f, [1, 0, 3], [14, 18, 10], 70)}
    <FogLayer y={-13.4} size={60} layers={3} thickness={1.6} color="#f4e2c8" opacity={0.22} frame={f} />
    <Post bloom={0.9} threshold={0.62} vignette={0} />
  </Stage>;
};

// ---------- H1: a local hunter: "no mink" ----------
const H1 = () => {
  const f = useCurrentFrame(); const d = wordAt('and', 7) - LS[7];
  return <Stage palette={EERIE} fog={[30, 150]} overlay={<>
    <Pill text="A LOCAL HUNTER SAYS" y={236} variant="yellow" delay={2} size={40} />
    <Headline y={318} lines={[{text: 'NO MINK', color: 'red', size: 130}, {text: 'AROUND HERE', color: 'white', size: 80}]} delay={wordAt('no', 7) - LS[7] - 4} />
  </>}>
    <ShotCam preset="orbit" target={[-17, 1.4, 6]} a0={0.5} a1={0.05} r0={7} r1={5.5} h0={1.2} h1={0.6} start={0} end={d} ease="inout" fov0={50} fov1={48} />
    <World f={f} />
    <OutlineScope thickness={0.03}>
      <group position={[-17, height(-17, 6), 6]} rotation={[0, Math.sin(f * 0.25) * 0.25 * cl(f, 20, 30), 0]}>
        <Person position={[0, 0, 0]} rotation={0.3} pose="stand" phase={f / 10} shadow skin="#d8a882" shirt="#4a5a2a" pattern="check" pants="#3a3226" hair="#9a9a9a" />
      </group>
    </OutlineScope>
    <Dog position={[-15.8, height(-15.8, 6.6) + 0.04, 6.6]} rotation={-0.4} look="lab" pose="stand" frame={f} />
    {LEAVES(f, [-16, 2, 5], [12, 8, 10], 50)}
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- H2: animal welfare investigation: nothing conclusive ----------
const H2 = () => {
  const f = useCurrentFrame(); const d = LS[8] - wordAt('and', 7); const tn = wordAt('nothing', 7) - wordAt('and', 7);
  return <Stage palette={EERIE} fog={[30, 150]} overlay={<>
    <DocCard top={300} size={42} width={880} lines={['ANIMAL WELFARE PROBE (SSPCA)', 'FINDINGS: INCONCLUSIVE']} source="SCOTTISH SPCA INVESTIGATION" delay={4} highlight={[1]} />
    {f >= tn && <Pill text="NOTHING CONCLUSIVE" y={1060} variant="red" delay={tn} size={46} />}
  </>}>
    <ShotCam preset="push" from={[6, 3.2, -7]} to={[4.6, 2.8, -5.2]} target={[1.8, 0.9, 0.4]} fov0={56} fov1={52} start={0} end={d} />
    <World f={f} />
    <OutlineScope thickness={0.03}>
      <Person position={[2.6, 0.04, 0.6]} rotation={0.4 + Math.sin(f * 0.04) * 0.6} pose="point" actT={cl(f, 30, 44)} phase={f / 8} prop="book" shadow skin="#e6b892" shirt="#1f3f6f" pants="#2a2a3a" hair="#2a1a10" />
      <Person position={[0.4, 0.04, 0.2]} rotation={0.8} pose="crouch" phase={f / 8} prop="camera" shadow skin="#8d5a36" shirt="#e8e2d4" pants="#3a3a4a" hair="#1b1310" />
    </OutlineScope>
    {LEAVES(f, [2, 2, 0], [16, 10, 10], 50)}
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- I: the question; ends on the opening frame (loop) ----------
const I = () => {
  const f = useCurrentFrame(); const d = OT_FRAMES - LS[8]; const u = easeInOut(cl(f, 0, d - 4));
  const pos = lerp3([4.5, 2.5, 10], HOOKCAM.pos, u); const look = lerp3([-0.5, 3, 2], HOOKCAM.look, u);
  return <Stage palette={GOLDEN} fog={[30, 140]} overlay={<>
    <Headline y={270} lines={[{text: 'A SCENT?', color: 'yellow', size: 110}, {text: 'OR SOMETHING THEY SEE?', color: 'white', size: 70}]} delay={3} stagger={wordAt('or', 8) - LS[8] - 3} />
    <Pill text="TELL ME IN THE COMMENTS" y={560} variant="red" delay={50} size={44} />
    <EndCard delay={40} sources={['WIKIPEDIA', 'SKEPTOID #320', 'NYT 2019']} />
  </>}>
    <CameraRig keys={[{f: 0, pos, look, fov: 52}, {f: d, pos, look, fov: 52}]} drift={0} />
    <World f={f} />
    <Dog position={[-0.5, WALL_TOP, 2.05]} rotation={1.75} scale={1.35} look="golden" pose="freeze" headUp={0.25} frame={f} shadow={false} />
    <Particles kind="motes" center={[-0.5, 6, 2]} area={[6, 5, 4]} count={30} frame={f} color="#d8e6ff" opacity={0.4} />
    {RAYS(f)}{LEAVES(f, [0, 1, 4], [14, 10, 8], 60)}
    <Birds center={[0, 16, -10]} radius={10} frame={f} count={5} color="#2a1a14" speed={0.03} size={0.5} />
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

export const SCENES = () => [
  [A1, 0, at(4.34)], [A2, at(4.34), LS[1]], [B1, LS[1], at(9.6)], [B2, at(9.6), LS[2]], [C, LS[2], LS[3]], [D1, LS[3], at(22.3)], [D2, at(22.3), LS[4]],
  [E, LS[4], LS[5]], [F0, LS[5], LS[5] + 10], [F1, LS[5] + 10, wordAt('and', 5)], [F2, wordAt('and', 5), LS[6]], [G, LS[6], LS[7]], [H1, LS[7], wordAt('and', 7)], [H2, wordAt('and', 7), LS[8]], [I, LS[8], OT_FRAMES],
];

export const Overtoun = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {SCENES().map(([Cmp, from, to], i) => <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && i !== 9 && <Dip inFrames={4} color="#1a0e08" />}</Sequence>)}
    <Grade look="golden" strength={0.1} />
    <Finish vignette={0.55} grain={0.06} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
