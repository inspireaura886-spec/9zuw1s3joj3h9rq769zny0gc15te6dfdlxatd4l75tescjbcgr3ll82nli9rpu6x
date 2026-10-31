// "The lights that went into the sea" (Shag Harbour, Nova Scotia, 4 Oct 1967) - low-poly 3D Short, ANIMATION UPGRADE 2026-10-22 kit.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, CameraRig, ShotCam, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Person, VILLAGER_LOOKS, Glow, Birds, Stars,
  Post, OutlineScope, Particles, Burst, Shockwave, GodRays, FogLayer, LightCone, Grade, Flash, WhipStreaks, MotionBlur, LightLeak, Building, Bubbles, Water, Ripples,
  clamp01, easeOut, easeInOut, mixPalette} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2} from '../common.jsx';
import {Land, Sea, Village, Wharf, Boat, Craft, Trail, Plane, Seabed, bedHeight, Diver, height, ROAD_Z, IMPACT} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
const LS = VO.line_starts.map((s) => at(s));
export const SH_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(txt)); return w ? at(w[1]) : LS[fromLine]; };
const cl = (f, a, b) => clamp01((f - a) / Math.max(1, b - a));
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// palettes: clear moonless night (indigo/teal + sodium-yellow lights), murky green-teal underwater, pink-orange dawn
const NIGHT = {top: '#03061a', mid: '#0b1d3e', hor: '#1d4a6a', fog: '#0c2238', amb: 0.75, hemiSky: '#5a7ab8', hemiGround: '#141a24', hemiI: 0.95, sun: '#8fb0ff', sunI: 0.9, sunPos: [-30, 30, -20], rim: '#ffb44a', rimI: 1.2, rimPos: [10, 10, -30], glow: 0.4};
const UNDER = {top: '#0b4a56', mid: '#0a3644', hor: '#06222e', fog: '#0a3442', amb: 1.0, hemiSky: '#6ad0d8', hemiGround: '#14302a', hemiI: 1.2, sun: '#bff6ff', sunI: 1.2, sunPos: [5, 40, 5], rim: '#4ab0c0', rimI: 0.8, rimPos: [-20, 10, -20], glow: 0};
const DAWN = {top: '#2a3a7a', mid: '#c46a7a', hor: '#ffb27a', fog: '#c08a8a', amb: 1.1, hemiSky: '#ffd0b0', hemiGround: '#3a3a4a', hemiI: 1.35, sun: '#ffc08a', sunI: 2.4, sunPos: [40, 8, -30], rim: '#ff8ab0', rimI: 1.4, rimPos: [-30, 15, 30], glow: 0.6};

// the dive path (u 0..1): from high in the west down to IMPACT at ~45 degrees
const path = (u) => [IMPACT[0] - 9 * (1 - u), 0.35 + 9 * (1 - u), IMPACT[2] - 2 * (1 - u)];
const U0 = 0.2; const HOOK_HIT = wordAt('sea'); const A1_END = wordAt('navy');
const HOOKCAM = {pos: [-0.3, 2.6, 17.5], look: [-0.5, 4.6, -12], fov: 58};
const Night = ({f, lit = 1, village = true, amp = 0.22}) => <><Stars count={320} radius={170} /><Land /><Sea frame={f} amp={amp} />{village && <Village lit={lit} frame={f} />}<Wharf />
  <Boat position={[17.5, 0, 3]} rotation={0.2} frame={f} /><Boat position={[22.6, 0, 4.2]} rotation={-0.25} frame={f + 40} hull="#c9d4dc" trim="#a8302a" /></>;
const SeaMist = ({f, y = 0.5, o = 0.12}) => <FogLayer y={y} size={90} layers={3} thickness={1.2} color="#9ab8d8" opacity={o} frame={f} center={[0, -12]} />;

// ---------- A1: hook. four lights dive out of the night sky into the sea ----------
const A1 = () => {
  const f = useCurrentFrame(); const u = U0 + (1 - U0) * Math.pow(cl(f, 0, HOOK_HIT), 1.6); const hit = f >= HOOK_HIT; const p = path(Math.min(u, 1));
  return <Stage palette={NIGHT} fog={[40, 170]} overlay={<>
    <Pill text="NOVA SCOTIA · 1967" y={236} variant="yellow" delay={-20} />
    <Headline y={318} lines={[{text: '4 LIGHTS', color: 'yellow', size: 120}, {text: 'INTO THE SEA', color: 'white', size: 100}]} delay={-20} />
    <Flash at={HOOK_HIT} y="62%" max={0.55} color="#ffe2a0" />
  </>}>
    <ShotCam preset="push" from={HOOKCAM.pos} to={[0.0, 2.3, 15.6]} look={[HOOKCAM.look, [0.6, 3.8, -11]]} fov0={58} fov1={56} start={0} end={A1_END} ease="inout" drift={0.04} shake={0.35} shakeFrom={HOOK_HIT} shakeLen={16} />
    <Night f={f} />
    {!hit && <><Craft position={p} rotation={[0, 0, -0.18]} frame={f} /><Trail path={path} t={u} /></>}
    {hit && <Craft position={[IMPACT[0], 0.3, IMPACT[2]]} lights={1} white={1} body={0} glow={0.9} frame={f} />}
    <Shockwave position={[IMPACT[0], 0.15, IMPACT[2]]} start={HOOK_HIT} frame={f} radius={8} />
    <Burst kind="splash" position={[IMPACT[0], 0.2, IMPACT[2]]} start={HOOK_HIT} frame={f} count={70} speed={0.38} up={1.1} spread={1.1} gravity={0.02} life={34} color="#dff2ff" floorY={0} />
    <Particles kind="motes" center={[-2, 3, 8]} area={[24, 6, 14]} count={40} frame={f} color="#ffd890" opacity={0.5} />
    <SeaMist f={f} />
    <Post bloom={1.25} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- A2: Navy divers went down... and found nothing ----------
const UnderSet = ({f}) => <><Seabed frame={f} /><GodRays position={[2, 14, -10]} dir={[0.1, -1, 0.2]} length={18} width={2.4} count={6} spread={0.4} frame={f} color="#bff6ff" opacity={0.18} dust={50} />
  <Particles kind="motes" center={[0, 3, -4]} area={[24, 10, 24]} count={90} frame={f} color="#cff8ff" opacity={0.55} speed={0.6} /></>;
const Torch = ({p, h, pitch = -0.35, f, len = 9, o = 0.32}) => <LightCone position={p} dir={[Math.sin(h), pitch, Math.cos(h)]} length={len} radius={2.2} frame={f} color="#e8fbff" opacity={o} />;
const A2 = () => {
  const f = useCurrentFrame(); const d = LS[1] - A1_END; const tn = wordAt('nothing') - A1_END;
  const divers = [0, 1].map((i) => { const x = -7 + f * 0.06 + i * 1.6; const z = -7.5 + i * 1.6; return {p: [x, bedHeight(x, z) + 1.6 + i * 0.4, z], h: Math.PI / 2 + 0.1 - i * 0.2, i}; });
  return <Stage palette={UNDER} fog={[4, 30]} overlay={<>
    <Pill text="NAVY DIVERS" y={236} variant="yellow" delay={0} />
    {f >= tn - 3 && <Headline y={318} lines={[{text: 'FOUND', color: 'white', size: 100}, {text: 'NOTHING', color: 'red', size: 140}]} delay={tn - 3} stagger={3} />}
  </>}>
    <ShotCam preset="push" from={[0.5, 3.2, 3.5]} to={[0.2, 2.9, 1.8]} look={[[-3, 1.4, -7], [-1, 1.2, -7]]} fov0={56} fov1={54} start={0} end={d} ease="out" />
    <UnderSet f={f} />
    <OutlineScope thickness={0.025}>{divers.map((v) => <Diver key={v.i} position={v.p} heading={v.h} kick={f / 5 + v.i} frame={f} />)}</OutlineScope>
    {divers.map((v) => <Torch key={v.i} p={[v.p[0] + Math.sin(v.h) * 0.8, v.p[1] - 0.1, v.p[2] + Math.cos(v.h) * 0.8]} h={v.h + Math.sin(f * 0.06 + v.i) * 0.35} f={f} />)}
    {divers.map((v) => <Bubbles key={'b' + v.i} position={[v.p[0], v.p[1] + 0.3, v.p[2] - 0.6]} height={8} count={14} frame={f + v.i * 20} speed={0.03} size={0.1} />)}
    <Post bloom={1.0} threshold={0.55} vignette={0} />
  </Stage>;
};

// ---------- B1: crane-up reveal: Shag Harbour at night, then the real place ----------
const B1 = () => {
  const f = useCurrentFrame(); const d = LS[2] - LS[1] - (LS[2] - wordAt('five', 1)); const tn = wordAt('nineteen', 1) - LS[1];
  return <Stage palette={NIGHT} fog={[40, 180]} overlay={<>
    <Pill text="SHAG HARBOUR · NOVA SCOTIA" y={236} variant="yellow" delay={4} size={38} />
    {f >= tn - 4 && f < tn + 4 && <Headline y={318} lines={[{text: 'OCT 4, 1967', color: 'white', size: 112}]} delay={tn - 4} />}
    {f >= tn + 4 && <PhotoCard src="shag/IMG9.jpg" credit="Shag Harbour today · photo: J5255, CC BY-SA 4.0" tag="THE REAL HARBOUR" delay={tn + 4} dur={d - tn} zoom={[1.02, 1.1]} pan={[0, -16]} />}
  </>}>
    <ShotCam preset="crane" target={[6, 0, 10]} angle={Math.PI + 0.35} h0={0.8} h1={11} r0={10} r1={30} lookY0={1.2} lookY1={0.5} start={0} end={d} ease="inout" fov0={56} fov1={50} />
    <Night f={f} />
    <Particles kind="motes" center={[6, 3, 10]} area={[30, 6, 16]} count={40} frame={f} color="#ffd890" opacity={0.45} />
    <Post bloom={1.2} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- B2: five young people in a convertible on the coast road ----------
const Convertible = ({x, f, stop}) => <group position={[x, height(x, ROAD_Z) + 0.05, ROAD_Z]} rotation={[0, Math.PI / 2, 0]}>
  <mesh position={[0, 0.62, 0]}><boxGeometry args={[1.8, 0.6, 4.2]} /><meshLambertMaterial color="#c8302a" flatShading /></mesh>
  <mesh position={[0, 0.95, 1.2]} rotation={[-0.5, 0, 0]}><boxGeometry args={[1.6, 0.5, 0.05]} /><meshLambertMaterial color="#cfe0f0" /></mesh>
  {[[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]].map(([a, b], i) => <mesh key={i} position={[a, 0.36, b]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.36, 0.36, 0.22, 10]} /><meshLambertMaterial color="#141414" /></mesh>)}
  <Glow position={[-0.6, 0.65, 2.15]} size={1.1} color="#fff2c0" opacity={0.9} /><Glow position={[0.6, 0.65, 2.15]} size={1.1} color="#fff2c0" opacity={0.9} />
  <Glow position={[-0.7, 0.7, -2.15]} size={stop ? 1.3 : 0.6} color="#ff3020" opacity={0.9} /><Glow position={[0.7, 0.7, -2.15]} size={stop ? 1.3 : 0.6} color="#ff3020" opacity={0.9} />
  <LightCone position={[0, 0.65, 2.2]} dir={[0, -0.08, 1]} length={12} radius={2.6} frame={f} color="#fff2c0" opacity={0.28} glow={false} />
  <OutlineScope thickness={0.02}>
    {[[-0.45, 0.2, 0], [0.45, 0.2, 1]].map(([a, b, k]) => <Person key={'f' + k} position={[a, 0.25, b]} scale={0.62} pose="sit" phase={f / 9 + k} {...VILLAGER_LOOKS[k]} />)}
    <Person position={[-0.5, 0.35, -1.2]} scale={0.6} rotation={stop ? -1.2 : 0} pose={stop ? 'point' : 'sit'} actT={stop ? 1 : 0} phase={f / 9} {...VILLAGER_LOOKS[2]} />
    <Person position={[0.05, 0.35, -1.3]} scale={0.58} pose={stop ? 'lookup' : 'sit'} actT={stop ? 1 : 0} phase={f / 9} {...VILLAGER_LOOKS[3]} />
    <Person position={[0.55, 0.35, -1.2]} scale={0.6} rotation={stop ? -0.9 : 0} pose={stop ? 'recoil' : 'sit'} actT={stop ? 1 : 0} phase={f / 9} {...VILLAGER_LOOKS[4]} />
  </OutlineScope>
</group>;
const B2 = () => {
  const f = useCurrentFrame(); const t0 = wordAt('five', 1); const d = LS[2] - t0; const ts = wordAt('saw', 1) - t0;
  const x = -24 + 0.21 * Math.min(f, ts) + 0.21 * Math.max(0, f - ts) * (1 - cl(f, ts, ts + 14)) * 0.5;
  const stop = f >= ts + 4;
  return <Stage palette={NIGHT} fog={[40, 180]} overlay={<>
    <Pill text="HIGHWAY 3 · 11:20 PM" y={236} variant="yellow" delay={2} size={38} />
    <Headline y={318} lines={[{text: '5 YOUNG PEOPLE', color: 'yellow', size: 96}, {text: 'SAW IT FIRST', color: 'white', size: 92}]} delay={4} stagger={ts - 6} />
  </>}>
    <ShotCam preset="track" target={(fr) => [x + 0.6, 1.0, ROAD_Z - 2]} from={[x, 0, 0]} to={[x, 0, 0]} offset={[-3, 2.4, 9.5]} fov0={54} start={0} end={d} drift={0.04} />
    <Night f={f + 60} />
    <Convertible x={x} f={f} stop={stop} />
    {f > ts - 10 && <Craft position={[x + 9 + (f - ts) * 0.04, 3.4 - (f - ts) * 0.03, ROAD_Z - 14]} rotation={[0, 0, -0.18]} frame={f} glow={cl(f, ts - 10, ts)} />}
    <Post bloom={1.2} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- C1: LOOP2. a row of yellow lights, as big as a plane (orbit around the object) ----------
const C1 = () => {
  const f = useCurrentFrame(); const d = wordAt('diving', 2) - LS[2]; const tb = wordAt('big', 2) - LS[2];
  const u = U0 + 0.12 * cl(f, 0, d); const p = path(u);
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Pill text="A ROW OF YELLOW LIGHTS" y={236} variant="yellow" delay={0} size={40} />
    {f >= tb - 3 && <Headline y={318} lines={[{text: 'BIG AS', color: 'white', size: 100}, {text: 'A PLANE', color: 'yellow', size: 130}]} delay={tb - 3} stagger={4} />}
  </>}>
    <ShotCam preset="orbit" target={p} a0={-0.6} a1={0.5} r0={13} r1={10} h0={-2.5} h1={-1.2} start={0} end={d} ease="inout" fov0={50} fov1={48} drift={0.05} />
    <Night f={f + 90} />
    <OutlineScope thickness={0.04}><Craft position={p} rotation={[0, 0, -0.18]} frame={f} /></OutlineScope>
    <Trail path={path} t={u} />
    <Particles kind="sparks" center={p} area={[10, 3, 3]} count={30} frame={f} color="#ffc060" wind={[-0.05, 0.05]} />
    <Post bloom={1.3} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- C2: diving at 45 degrees, whistling like a bomb (seen from the road) ----------
const C2 = () => {
  const f = useCurrentFrame(); const t0 = wordAt('diving', 2); const d = LS[3] - t0; const tw = wordAt('whistling', 2) - t0; const tb = wordAt('bomb', 2) - t0;
  const u = 0.34 + 0.5 * Math.pow(cl(f, 0, d), 1.4); const p = path(u);
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Headline y={300} lines={[{text: '45°', color: 'yellow', size: 150}, {text: 'STRAIGHT DOWN AT THE SEA', color: 'white', size: 58}]} delay={2} />
    {f >= tw && <Pill text="WHISTLING LIKE A BOMB" y={1080} variant="red" delay={tw} size={46} />}
  </>}>
    <ShotCam preset="push" from={[-8, 2.0, ROAD_Z - 2.5]} to={[-7.2, 1.8, ROAD_Z - 4]} look={[[-2, 5, -10], [1, 2.5, -10]]} fov0={52} fov1={46} start={0} end={d} ease="ramp" shake={0.3} shakeFrom={tb} shakeLen={18} />
    <Night f={f + 120} />
    <Craft position={p} rotation={[0, 0, -0.18]} frame={f} /><Trail path={path} t={u} n={18} />
    <Particles kind="sparks" center={p} area={[8, 2, 2]} count={24} frame={f} color="#ffc060" wind={[-0.06, 0.06]} />
    <Post bloom={1.3} threshold={0.5} vignette={0} ca={f >= tb && f < tb + 10 ? 0.002 : 0} />
  </Stage>;
};

// ---------- D1: a hill hid it for ten seconds ----------
const D1 = () => {
  const f = useCurrentFrame(); const d = wordAt('when', 3) - LS[3]; const n = Math.max(0, 10 - Math.floor(f / (d / 10)));
  const x = -12 + f * 0.13;
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Pill text="A HILL HID IT" y={236} variant="yellow" delay={0} />
    <div style={{position: 'absolute', top: 320, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 210, color: '#ffd93b', WebkitTextStroke: '16px #141414', paintOrder: 'stroke fill'}}>{n}</div>
    <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 60, color: '#fff', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill'}}>SECONDS IN THE DARK</div>
  </>}>
    <ShotCam preset="push" from={[-5.5, 8.0, -2]} to={[-4.5, 7.4, -0.8]} look={[[-6, 0.2, 11], [-4, 0.2, 11]]} fov0={52} fov1={50} start={0} end={d} ease="inout" />
    <Night f={f + 150} />
    <Convertible x={x} f={f} stop={false} />
    <Craft position={[IMPACT[0], 0.3, IMPACT[2]]} lights={1} white={1} body={0} glow={0.3} frame={f} />
    <Post bloom={1.2} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- D2: when the water came back: one white light floating (dolly zoom) ----------
const D2 = () => {
  const f = useCurrentFrame(); const t0 = wordAt('when', 3); const d = LS[4] - t0; const to = wordAt('one', 3) - t0;
  const L = [IMPACT[0], 0.25 + Math.sin(f * 0.08) * 0.08, IMPACT[2]];
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    {f >= to - 2 && <Headline y={300} lines={[{text: 'ONE WHITE LIGHT', color: 'white', size: 104}, {text: 'ON THE WATER', color: 'yellow', size: 80}]} delay={to - 2} stagger={6} />}
  </>}>
    {f < to - 4
      ? <CameraRig keys={[{f: 0, pos: [-2, 2.6, 13.2], look: [-1, 1.5, -6], fov: 50}, {f: to - 4, pos: [0, 2.2, 10.5], look: [L[0], 0.5, L[2]], fov: 48}]} drift={0.04} />
      : <ShotCam preset="dollyZoom" target={L} dir={[-0.25, 0.12, 1]} d0={7} d1={19} fov0={48} start={to - 4} end={d} ease="inout" drift={0} />}
    <Night f={f + 180} />
    <Craft position={L} lights={1} white={1} body={0} glow={1} frame={f} />
    <mesh position={[L[0], 0.05, L[2] + 2.5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.6, 5]} /><meshBasicMaterial color="#cfe6ff" transparent opacity={0.35} depthWrite={false} /></mesh>
    <Ripples center={[L[0], 0.12, L[2]]} area={1.5} count={4} frame={f} maxR={2.4} opacity={0.5} />
    <SeaMist f={f} o={0.14} />
    <Post bloom={1.35} threshold={0.48} vignette={0} />
  </Stage>;
};

// ---------- E: police watch it drift on the tide; it vanishes before the boat reaches it ----------
const E = () => {
  const f = useCurrentFrame(); const d = LS[5] - LS[4]; const tv = wordAt('vanished', 4) - LS[4];
  const drift = f * 0.02; const sink = cl(f, tv, tv + 16);
  const L = [IMPACT[0] + drift, 0.25 - sink * 1.4, IMPACT[2]];
  const row = [IMPACT[0] - 6 + f * 0.035, 0, IMPACT[2] + 8 - f * 0.04];
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Pill text="POLICE ON THE SHORE" y={236} variant="yellow" delay={2} />
    {f < tv - 2 && <Headline y={318} lines={[{text: 'IT DRIFTED', color: 'white', size: 104}, {text: 'ON THE TIDE', color: 'yellow', size: 92}]} delay={6} />}
    {f >= tv - 2 && <Headline y={318} lines={[{text: 'GONE', color: 'red', size: 170}]} delay={tv - 2} />}
    <Flash at={tv + 6} y="58%" max={0.25} color="#cfe6ff" />
  </>}>
    <ShotCam preset="push" from={[-0.5, 2.6, 14]} to={[0.3, 2.4, 13.2]} look={[[2, -1, -6], [IMPACT[0], -0.8, IMPACT[2]]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Night f={f + 210} />
    <group position={[-4.2, height(-4.2, 12.6) + 0.05, 12.6]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0.62, 0]}><boxGeometry args={[1.8, 0.65, 4]} /><meshLambertMaterial color="#1a2236" flatShading /></mesh>
      <mesh position={[0, 1.25, -0.2]}><boxGeometry args={[1.6, 0.6, 2]} /><meshLambertMaterial color="#e8e8e8" flatShading /></mesh>
      <Glow position={[0, 1.7, -0.2]} size={0.8} color="#ff3a2a" opacity={0.6 + 0.4 * Math.sin(f * 0.5)} />
    </group>
    <OutlineScope thickness={0.03}>
      {[[0.4, 10.6, 0], [1.9, 10.3, 1]].map(([x, z, k]) => <Person key={k} position={[x, height(x, z) + 0.02, z]} rotation={Math.PI + 0.15 - k * 0.25} pose={k ? 'point' : 'stand'} actT={cl(f, 20, 34)} prop="torch" shadow skin="#e0b48e" shirt="#1a2a4a" pants="#1a1e2a" hair="#3a2a1a" />)}
    </OutlineScope>
    {[[0.4, 10.6, 0], [1.9, 10.3, 1]].map(([x, z, k]) => <LightCone key={'t' + k} position={[x + 0.3, height(x, z) + 1.1, z - 0.4]} dir={[(L[0] - x) * 0.05, -0.12, -1]} length={14} radius={2.2} frame={f} color="#fff2c0" opacity={0.22} />)}
    <Boat position={row} rotation={Math.PI * 0.85} frame={f} lit={1} scale={0.7} />
    {sink < 1 && <Craft position={L} lights={1} white={1} body={0} glow={1 - sink} frame={f} />}
    <Bubbles position={[L[0], -0.5, L[2]]} height={1} count={18} frame={f} speed={0.04} size={0.12} opacity={sink > 0 ? 0.9 : 0} />
    <Burst kind="splash" position={[L[0], 0.1, L[2]]} start={tv + 6} frame={f} count={30} speed={0.15} up={0.8} spread={0.6} gravity={0.02} life={24} color="#cfe6ff" floorY={0} />
    <Post bloom={1.25} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- F0: whip into LOOP3 ----------
const WhipShot = () => { const f = useCurrentFrame(); return <Stage palette={NIGHT} fog={[40, 200]}>
  <ShotCam preset="whip" from={[0, 3, 12]} lookA={[IMPACT[0], 0.3, IMPACT[2]]} lookB={[30, 6, 0]} w0={0} w1={10} ease="ramp" drift={0} />
  <Night f={f + 370} />
  <Post bloom={1.1} threshold={0.55} vignette={0} />
</Stage>; };
const F0 = () => <AbsoluteFill><MotionBlur samples={4} shutterAngle={220}><WhipShot /></MotionBlur><WhipStreaks from={0} to={10} dir="h" /></AbsoluteFill>;

// ---------- F1: LOOP3. by morning, no aircraft was missing anywhere on the coast ----------
const F1 = () => {
  const f = useCurrentFrame(); const t0 = LS[5] + 10; const d = LS[6] - t0; const tn = wordAt('no', 5) - t0;
  const planes = Array.from({length: 8}, (_, i) => ({x: -10.5 + (i % 4) * 7, z: i < 4 ? -4 : 4, i}));
  return <Stage palette={DAWN} fog={[40, 200]} overlay={<>
    <Pill text={f < tn ? "BUT HERE'S THE STRANGE PART" : 'BY MORNING'} y={236} variant={f < tn ? 'red' : 'yellow'} delay={f < tn ? 0 : tn} size={40} />
    {f >= tn - 3 && <Headline y={318} lines={[{text: 'NO AIRCRAFT', color: 'white', size: 112}, {text: 'MISSING', color: 'red', size: 140}]} delay={tn - 3} stagger={5} />}
    <LightLeak from={0} len={50} />
  </>}>
    <ShotCam preset="orbit" target={[0, 0.5, 0]} a0={0.9} a1={0.25} r0={22} r1={17} h0={9} h1={6} start={0} end={d} ease="inout" fov0={52} fov1={50} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[90, 24]} /><meshLambertMaterial color="#6a7a4a" flatShading /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[60, 4.5]} /><meshLambertMaterial color="#3a3a42" /></mesh>
    {Array.from({length: 12}, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-27 + i * 5, 0.04, 0]}><planeGeometry args={[2, 0.25]} /><meshBasicMaterial color="#f2f2e8" /></mesh>)}
    <Building position={[-8, 0, -14]} w={10} d={6} h={4} roof={2.2} color="#9aa4b0" roofColor="#4a5260" frame={f} />
    <Building position={[8, 0, -14]} w={4} d={4} h={6} roof={0.6} color="#d8d2c4" roofColor="#c8302a" lit={0.6} frame={f} />
    {planes.map((p) => <Plane key={p.i} position={[p.x, 1.0, p.z]} rotation={p.z < 0 ? 0 : Math.PI} color={p.i % 3 ? '#e8ecf0' : '#d8dce4'} stripe={['#c8302a', '#2a5a9a'][p.i % 2]} frame={p.i === 3 ? f : 0} />)}
    {planes.map((p) => { const s = tn + 4 + p.i * 3; const k = easeOut(cl(f, s, s + 8)); return k > 0 && <Glow key={'g' + p.i} position={[p.x, 3.4, p.z]} size={2.2 * k} color="#5aff7a" opacity={0.8 * k} />; })}
    <Birds center={[0, 14, -6]} radius={14} frame={f} count={6} color="#2a1a2a" speed={0.025} size={0.6} />
    <Particles kind="dust" center={[0, 2, 0]} area={[30, 4, 20]} count={40} frame={f} color="#ffd8b0" />
    <Post bloom={0.9} threshold={0.62} vignette={0} />
  </Stage>;
};

// ---------- G1: fishermen found only a patch of yellow foam ----------
const G1 = () => {
  const f = useCurrentFrame(); const d = wordAt('navy', 6) - LS[6]; const tf = wordAt('foam', 6) - LS[6];
  const boats = Array.from({length: 5}, (_, i) => { const a = i / 5 * Math.PI * 2 + f * 0.006; return {p: [IMPACT[0] + Math.sin(a) * 7, 0, IMPACT[2] + Math.cos(a) * 7], r: a + Math.PI / 2, i}; });
  return <Stage palette={DAWN} fog={[40, 200]} overlay={<>
    <Pill text="FISHERMEN SEARCHED" y={236} variant="yellow" delay={2} />
    {f >= tf - 10 && <Headline y={318} lines={[{text: 'ONLY', color: 'white', size: 100}, {text: 'YELLOW FOAM', color: 'yellow', size: 120}]} delay={tf - 10} stagger={5} />}
  </>}>
    <ShotCam preset="crane" target={[IMPACT[0], 0, IMPACT[2]]} angle={0.4} h0={3} h1={16} r0={14} r1={9} lookY0={0.5} lookY1={0} start={0} end={d} ease="inout" fov0={54} fov1={50} />
    <Land /><Sea frame={f} deep="#1a3050" face="#5a7aa0" amp={0.2} /><Village lit={0.2} frame={f} /><Wharf />
    <Water position={[IMPACT[0], 0.32, IMPACT[2]]} radius={4.2} color="#e8d68a" opacity={0.75} frame={f} ripple={0.05} />
    <Particles kind="spray" center={[IMPACT[0], 0.5, IMPACT[2]]} area={[7, 0.6, 7]} count={50} frame={f} color="#fff2b0" />
    {boats.map((b) => <Boat key={b.i} position={b.p} rotation={b.r} frame={f + b.i * 30} lit={0.6} hull={['#e8e4da', '#c9d4dc', '#f0d27a'][b.i % 3]} trim={['#2a5a8a', '#a8302a'][b.i % 2]} amp={0.2} />)}
    <Birds center={[IMPACT[0], 8, IMPACT[2]]} radius={6} frame={f} count={5} color="#f4f0e6" speed={0.04} size={0.45} />
    <Post bloom={0.9} threshold={0.6} vignette={0} />
  </Stage>;
};

// ---------- G2: Navy divers searched the seabed for three days ----------
const G2 = () => {
  const f = useCurrentFrame(); const t0 = wordAt('navy', 6); const d = LS[7] - t0; const td = wordAt('three', 6) - t0;
  const divers = [0, 1, 2].map((i) => { const x = -4 + i * 4 + f * 0.04; const z = -6 + i * 0.4; return {p: [x, bedHeight(x, z) + 1.4, z], h: Math.PI / 2 + Math.sin(f * 0.04 + i) * 0.15, i}; });
  return <Stage palette={UNDER} fog={[4, 32]} overlay={<>
    <Pill text="NAVY DIVERS" y={236} variant="yellow" delay={2} />
    {f >= td - 3 && <Headline y={318} lines={[{text: '3 DAYS', color: 'yellow', size: 150}, {text: 'ON THE SEABED', color: 'white', size: 80}]} delay={td - 3} stagger={5} />}
  </>}>
    <ShotCam preset="push" from={[1, 4.5, 6]} to={[3, 3.6, 3.5]} look={[[0, 0.5, -6], [2, 0.5, -6]]} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <UnderSet f={f + 100} />
    <OutlineScope thickness={0.025}>{divers.map((v) => <Diver key={v.i} position={v.p} heading={v.h} kick={f / 5 + v.i} frame={f} />)}</OutlineScope>
    {divers.map((v) => <Torch key={v.i} p={[v.p[0] + 0.8, v.p[1] - 0.1, v.p[2]]} h={v.h + Math.sin(f * 0.07 + v.i * 2) * 0.5} pitch={-0.5} f={f} />)}
    <mesh position={[2, divers[0].p[1] - 0.2, -5.8]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 12, 4]} /><meshLambertMaterial color="#e8c84a" /></mesh>
    {divers.map((v) => <Bubbles key={'b' + v.i} position={[v.p[0] - 0.6, v.p[1] + 0.3, v.p[2]]} height={8} count={12} frame={f + v.i * 20} speed={0.03} size={0.1} />)}
    <Post bloom={1.0} threshold={0.55} vignette={0} />
  </Stage>;
};

// ---------- H1: "Not a trace... not a clue" (the Navy) ----------
const H1 = () => {
  const f = useCurrentFrame(); const d = wordAt('and', 7) - LS[7];
  return <Stage palette={UNDER} fog={[4, 30]} overlay={<>
    <DocCard top={300} size={46} width={900} lines={['"Not a trace...', 'not a clue...', 'not a bit of anything."']} source="THE NAVY · CHRONICLE-HERALD, 9 OCT 1967" delay={4} highlight={[2]} />
  </>}>
    <ShotCam preset="push" from={[0, 2.4, 4]} to={[0, 2.0, 1.5]} look={[[0, 0.3, -8], [0, 0.2, -8]]} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <UnderSet f={f + 200} />
    <Torch p={[1.2, 2.2, 2]} h={Math.PI + Math.sin(f * 0.05) * 0.6} pitch={-0.35} f={f} len={12} o={0.38} />
    <Post bloom={1.0} threshold={0.55} vignette={0} />
  </Stage>;
};

// ---------- H2: investigators noted no one actually saw it enter the water ----------
const H2 = () => {
  const f = useCurrentFrame(); const t0 = wordAt('and', 7); const d = LS[8] - t0; const tn = at((W.find((x) => x[1] >= VO.line_starts[7] && x[0].toLowerCase() === 'no') || [0, VO.line_starts[7]])[1]) - t0;
  const hov = [IMPACT[0] - 1, 1.6 + Math.sin(f * 0.06) * 0.25, IMPACT[2]];
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <DocCard top={300} size={42} width={900} lines={['"Apparently no one actually', 'saw anything enter the water."']} source="CONDON REPORT · CASE 34 (RCMP CORPORAL)" delay={tn - 4} highlight={[1]} />
    {f >= tn + 30 && <Pill text="DID IT EVER GO IN?" y={610} variant="red" delay={tn + 30} size={46} />}
  </>}>
    <ShotCam preset="push" from={[-3, 0.9, 9]} to={[-1.5, 0.7, 6.5]} look={[[IMPACT[0] - 1, 1.6, IMPACT[2]], [IMPACT[0] - 1, 1.5, IMPACT[2]]]} fov0={50} fov1={46} start={0} end={d} ease="inout" />
    <Night f={f + 300} village={false} />
    <Craft position={hov} rotation={[0, -0.3, 0]} body={0.25} glow={0.6 + 0.2 * Math.sin(f * 0.2)} frame={f} />
    {[-3, -1, 1, 3].map((x, i) => <Glow key={i} position={[hov[0] + x * Math.cos(0.3), 0.08, hov[2] + x * Math.sin(0.3) + 0.6]} size={1.4} color="#ffb43a" opacity={0.3} />)}
    <Post bloom={1.3} threshold={0.5} vignette={0} />
  </Stage>;
};

// ---------- I: the question; the lights rise back up the dive path and land on the opening frame (loop) ----------
const I = () => {
  const f = useCurrentFrame(); const d = SH_FRAMES - LS[8]; const k = easeInOut(cl(f, 0, d - 3));
  const u = 1 - (1 - U0) * k; const p = path(u);
  const pos = lerp3([0.5, 2.8, 14], HOOKCAM.pos, k); const look = lerp3([2, 3, -10], HOOKCAM.look, k);
  return <Stage palette={NIGHT} fog={[40, 170]} overlay={<>
    <Headline y={270} lines={[{text: 'SANK?', color: 'yellow', size: 120}, {text: 'OR NEVER WENT IN?', color: 'white', size: 84}]} delay={3} stagger={wordAt('or', 8) - LS[8] - 3} />
    <Pill text="TELL ME IN THE COMMENTS" y={1130} variant="red" delay={50} size={44} />
    <EndCard delay={40} sources={['WIKIPEDIA', 'CONDON REPORT #34', 'CHRONICLE-HERALD 1967']} />
  </>}>
    <CameraRig keys={[{f: 0, pos, look, fov: 52 + 6 * k}, {f: d, pos, look, fov: 52 + 6 * k}]} drift={0} />
    <Night f={f} />
    <Craft position={p} rotation={[0, 0, -0.18]} frame={f} glow={0.6 + 0.4 * k} />
    {f > 6 && <Trail path={(v) => path(Math.min(1, v + 0.3))} t={u - 0.3 + 0.35} n={8} opacity={0.3} />}
    <Particles kind="motes" center={[-2, 3, 8]} area={[24, 6, 14]} count={40} frame={f} color="#ffd890" opacity={0.5} />
    <SeaMist f={f} />
    <Post bloom={1.25} threshold={0.5} vignette={0} />
  </Stage>;
};

export const SCENES = () => [
  [A1, 0, A1_END], [A2, A1_END, LS[1]], [B1, LS[1], wordAt('five', 1)], [B2, wordAt('five', 1), LS[2]], [C1, LS[2], wordAt('diving', 2)], [C2, wordAt('diving', 2), LS[3]],
  [D1, LS[3], wordAt('when', 3)], [D2, wordAt('when', 3), LS[4]], [E, LS[4], LS[5]], [F0, LS[5], LS[5] + 10], [F1, LS[5] + 10, LS[6]], [G1, LS[6], wordAt('navy', 6)],
  [G2, wordAt('navy', 6), LS[7]], [H1, LS[7], wordAt('and', 7)], [H2, wordAt('and', 7), LS[8]], [I, LS[8], SH_FRAMES],
];

export const Shag = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {SCENES().map(([Cmp, from, to], i) => <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && i !== 9 && i !== 10 && <Dip inFrames={4} color="#020814" />}</Sequence>)}
    <Grade look="night" strength={0.12} />
    <Finish vignette={0.5} grain={0.06} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
