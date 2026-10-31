// "Two blips became one" (Kinross incident, Lake Superior, 23 Nov 1953) - low-poly 3D Short, radar-scope hero, ANIMATION UPGRADE kit.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, OutlineScope, Person, Particles, Burst, Shockwave, FogLayer, LightCone, Ocean, Rain, Rigged,
  Grade, Flash, WhipStreaks, KineticCard, cueLine, clamp01, mixPalette, PALETTES, usePreload} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Scope, Jet, C47, SnowField, Runway, RadarRoom, Cockpit, RadioDesk, Puffs, RestrictedZone, blips, mPos, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const KN_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const CS = [0.0, 2.68, 6.47, 8.9, 11.3, 13.84, 16.22, 19.96, 22.32, 24.94, 28.82, 30.19, 33.7, 35.31, 37.54, 41.22, 43.02, 46.75, 50.28, 52.38];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? KN_FRAMES) - C[i];
const sec = (i, f) => CS[i] + f / FPS; // absolute story seconds
const loc = (s, i) => at(s) - C[i]; // local frame of absolute second s in scene i
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;

const ROOM = {top: '#05181e', mid: '#0a3038', hor: '#14504e', fog: '#06222a', amb: 0.75, hemiSky: '#6ae0a0', hemiGround: '#123a2c', hemiI: 1.2, sun: '#9affc8', sunI: 0.9, sunPos: [0, 10, 5], rim: '#4affb0', rimI: 1.3, rimPos: [0, 5, -10], glow: 1};
const STORM = {top: '#10183a', mid: '#2c3e68', hor: '#607498', fog: '#2a3a5a', amb: 0.95, hemiSky: '#a8b8e8', hemiGround: '#2a3248', hemiI: 1.6, sun: '#c0d0ff', sunI: 1.9, sunPos: [-10, 30, 10], rim: '#7a98e8', rimI: 1.6, rimPos: [20, 10, -30], glow: 0.8};
const SNOWDUSK = mixPalette('dusk', {...PALETTES.night, hor: '#8a6fb0'}, 0.45);
const DAWN = {...PALETTES.dawn, top: '#243a7a', mid: '#9a6a9a'};
const SEA = {deep: '#0a2238', face: '#28587e', foam: '#c0cce0', foamAt: 0.92};
const Lake = ({f, amp = 0.9, choppy = 1.4, size = [130, 80]}) => <Ocean size={size} frame={f} amp={amp} choppy={choppy} position={[0, -0.3, 0]} {...SEA} />;
const Sto = ({f, jet, children, rain = true, puffs = true, fog = false}) => <>
  <Lake f={f} />{rain && <Rain center={[0, 4, 0]} area={30} height={16} count={160} frame={f} opacity={0.4} />}
  {puffs && <Puffs frame={f} y={[2, 9]} z0={-40} z1={30} color="#2a3452" count={18} />}
  {fog && <FogLayer y={0.6} size={90} layers={3} thickness={1.2} color="#3a4a6a" opacity={0.14} frame={f} />}
  {jet}{children}<Post bloom={1.1} threshold={0.5} vignette={0.3} /></>;
const hookT = (t) => 25.68 - (1.88 - t) * 1.8;

const S = [];
// 0 HOOK: radar scope, two blips merge into one at "one"
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const t = f / FPS; const m = mPos(25.68);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<><Flash at={at(1.9)} y="48%" max={0.6} color="#d8ffd0" />
    <KineticCard lines={[cueLine(W, 'Two blips', 0, 'blips'), cueLine(W, 'became one', 0.5, 'one')]} y={300} size={96} hideAt={2.6} /></>}>
    <ShotCam preset="push" from={[0.5, 6.0, 5.5]} to={[0.4, 3.6, 1.6]} look={[[0, 0, 0], [0.3, 0, -0.3]]} fov0={50} fov1={42} start={0} end={d} ease="inout" drift={0.02} />
    <Scope frame={f} tt={hookT(t)} />
    <Burst kind="sparks" position={[m[0], 0.2, m[1]]} start={at(1.88)} frame={f} count={46} color="#ffe08a" floorY={0} /><Shockwave position={[m[0], 0.1, m[1]]} start={at(1.88)} frame={f} radius={2.4} />
    <Particles kind="motes" center={[0, 1.5, 0]} area={[8, 3, 8]} count={30} frame={f} color="#7affb0" opacity={0.5} /><Post bloom={1.4} threshold={0.35} vignette={0.3} /></Stage>; };
// 1 radar room crane, "never seen again"
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<><Pill text="RADAR CONTROL ROOM" y={236} variant="yellow" delay={4} size={40} /><Pill text="NEVER SEEN AGAIN" y={236} variant="red" delay={loc(4.9, 1)} size={44} /></>}>
    <ShotCam preset="crane" target={[0, 2, -3]} h0={1.4} h1={4.2} r0={12} r1={9} angle={0.35} lookY0={0.6} lookY1={0.2} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <RadarRoom frame={f} tt={22 + f / FPS * 0.6} /><LightCone position={[0, 5.6, -2]} dir={[0, -1, 0]} length={5.6} radius={3} frame={f} color="#c8ffd8" opacity={0.25} />
    <Particles kind="motes" center={[0, 2.5, -2]} area={[12, 4, 8]} count={40} frame={f} color="#9affc0" opacity={0.5} /><Post bloom={1.1} threshold={0.45} vignette={0.3} /></Stage>; };
// 2 NOVEMBER 1953: base in the snow, crew runs to the jet
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const t = f / FPS;
  return <Stage palette={SNOWDUSK} fog={[24, 110]} overlay={<Pill text="NOV 23, 1953 · KINROSS AFB" y={236} variant="yellow" delay={3} size={38} />}>
    <ShotCam preset="orbit" target={[0, 1, 0]} a0={-0.9} a1={0.2} r0={17} r1={13} h0={2.5} h1={4.5} start={0} end={d} ease="inout" fov0={52} fov1={48} />
    <SnowField /><Runway frame={f} /><Jet position={[0, 0.7, 0]} rotation={[0, 1.2, 0]} burn={0} frame={f} scale={1.25} />
    <OutlineScope thickness={0.025}>{[0, 1].map((i) => { const tm = Math.min(t, 2.1 + i * 0.1); const run = t < 2.1 + i * 0.1;
      return <Person key={i} position={[-8 - i * 1.2 + tm * 2.8, 0.4, 2.5 + i * 0.8 - tm * 1.0]} rotation={1.1} scale={0.7} pose={run ? 'run' : 'point'} actT={clamp01((t - 2.2) * 2)} phase={f / 3.2 + i} shirt={i ? '#6a7a58' : '#5a6a48'} pants="#3a4a30" shadow />; })}</OutlineScope>
    <Particles kind="snow" center={[0, 5, 0]} area={[30, 10, 24]} count={140} frame={f} /><Post bloom={1.0} threshold={0.6} vignette={0.4} /></Stage>; };
// 3 radar catches something: unknown return appears
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const t = sec(3, f);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<Pill text="UNIDENTIFIED RETURN" y={236} variant="red" delay={loc(9.6, 3)} size={42} />}>
    <ShotCam preset="push" from={[3.2, 4.6, 4.4]} to={[1.6, 2.4, 1.4]} look={[[0, 0, 0], [0.7, 0, -0.5]]} fov0={50} fov1={42} start={0} end={d} ease="inout" drift={0.02} />
    <Scope frame={f} tt={21 + (t - 8.9) * 0.3} mode="unknown" />
    <Particles kind="motes" center={[0, 1.5, 0]} area={[8, 3, 8]} count={26} frame={f} color="#7affb0" opacity={0.5} /><Post bloom={1.4} threshold={0.35} vignette={0.3} /></Stage>; };
// 4 restricted airspace over Lake Superior
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={STORM} fog={[30, 120]} overlay={<Pill text="RESTRICTED AIRSPACE" y={236} variant="red" delay={loc(11.5, 4)} size={44} />}>
    <ShotCam preset="crane" target={[0, 2, 0]} h0={14} h1={5} r0={22} r1={16} angle={0.6} lookY0={0} lookY1={1.5} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <Sto f={f} fog><RestrictedZone frame={f} /></Sto></Stage>; };
// 5 the jet scrambles into the storm
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const u = clamp01(f / d);
  const z = -34 + 66 * Math.pow(u, 1.7); const lift = Math.max(0, u - 0.6); const y = 0.75 + lift * lift * 90; const pitch = Math.min(0.42, lift * 1.6);
  const tgt = (ff) => { const uu = clamp01(ff / d); const l = Math.max(0, uu - 0.6); return [0, 0.75 + l * l * 90, -34 + 66 * Math.pow(uu, 1.7)]; };
  return <Stage palette={SNOWDUSK} fog={[24, 110]} overlay={<><Pill text="SCRAMBLE" y={236} variant="red" delay={3} size={48} /><Flash at={at(0.3)} y="70%" max={0.4} color="#ffb860" /></>}>
    <ShotCam preset="track" from={[0, 0.5, -16]} to={[0, 2.5, 6]} offset={[-8, 1.6, 3]} target={tgt} fov0={52} start={0} end={d} ease="ramp" shake={0.12} shakeFrom={at(0.4)} shakeLen={30} drift={0.05} />
    <SnowField /><Runway frame={f} />
    <group position={[0, y, z]}><group rotation={[-pitch, 0, 0]}><Jet frame={f} burn={1.2} scale={1.25} /></group></group>
    <Burst kind="embers" position={[0, 0.6, z - 2]} start={0} frame={f} count={40} color="#ffb040" floorY={0} life={30} />
    <Particles kind="snow" center={[0, 5, 0]} area={[34, 10, 40]} count={160} frame={f} speed={2} /><Post bloom={1.1} threshold={0.5} vignette={0.4} /></Stage>; };
// 6 the crew: cockpit + portrait
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const p1 = loc(16.7, 6), p2 = loc(17.9, 6); const t0 = loc(19.0, 6);
  return <Stage palette={STORM} fog={[16, 70]} overlay={<><div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,12,0.6) 0%, rgba(0,0,12,0) 42%), radial-gradient(circle at 50% 80%, rgba(255,170,60,0.5) 0%, rgba(255,170,60,0) 42%)'}} />{f >= p1 && f < p2 + 8 && <PhotoCard src="kinross/IMG1.jpg" credit="Lt. Gene Moncla, 1953 · CC BY-SA" tag="PILOT FELIX MONCLA" delay={p1} dur={p2 - p1 + 8} />}
    {f >= t0 && <Pill text="RADAR MAN ROBERT WILSON" y={236} variant="yellow" delay={t0} size={36} />}<CFlash at={[at(0.9), at(1.9), at(2.8)]} k={0.5} /></>}>
    <ShotCam preset="push" from={[1.8, 2.1, -4.8]} to={[1.0, 1.5, -3.8]} look={[[0, 0.2, 1.2], [0, 0.2, 1.0]]} fov0={56} fov1={48} start={0} end={d} ease="inout" shake={0.06} shakeFrom={0} shakeLen={d} />
    <Cockpit frame={f} /><Puffs frame={f} speed={-1.4} z0={-4} z1={40} y={[-2, 5]} x={9} color="#2a3452" count={26} size={1.6} /><Rain center={[0, 1, 8]} area={14} height={8} count={140} frame={f} speed={1.2} opacity={0.45} />
    <Post bloom={1.1} threshold={0.5} vignette={0.3} /></Stage>; };
// 7 thirty minutes of chase
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const jx = -4 + f * 0.1; const bank = Math.sin(f * 0.05) * 0.25;
  return <Stage palette={STORM} fog={[30, 120]} overlay={<><Pill text="30 MINUTES OF CHASE" y={236} variant="yellow" delay={3} size={40} /><CFlash at={[at(1.0)]} k={0.5} /></>}>
    <ShotCam preset="orbit" target={(ff) => [-4 + ff * 0.1, 4, 0]} a0={0.6} a1={2.0} r0={11} r1={9} h0={1.0} h1={3.0} fov0={50} fov1={46} start={0} end={d} ease="inout" />
    <Sto f={f} fog jet={<Jet position={[jx, 4, 0]} rotation={[0, Math.PI / 2, bank]} frame={f} burn={0.7} scale={1.2} />}>
      {[0, 1, 2].map((i) => { const k = ((f + i * 14) % 42) / 42; return <mesh key={i} position={[jx - 6, 4, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.4 + k * 3.4}><ringGeometry args={[0.8, 0.88, 24]} /><meshBasicMaterial color="#8affc0" transparent opacity={0.6 * (1 - k)} /></mesh>; })}
    </Sto></Stage>; };
// 8 eight thousand feet, closing in
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const jy = 7 - f * 0.05;
  return <Stage palette={STORM} fog={[24, 100]} overlay={<><div style={{position: 'absolute', top: 270, left: 60, right: 60, height: 330, background: 'rgba(0,0,0,0.4)', borderRadius: 28}} />{kc(8, 'Eight thousand feet', 22.9, 'feet', 300, 92, 24.85)}<CFlash at={[at(1.9)]} k={0.4} /></>}>
    <ShotCam preset="push" from={[-9, 3.2, 8]} to={[-3, 5.6, 5]} look={[[0, jy, 0], [3, jy - 1, 0]]} fov0={52} fov1={44} start={0} end={d} ease="inout" shake={0.1} shakeFrom={0} shakeLen={d} />
    <Sto f={f} jet={<Jet position={[-2 + f * 0.14, jy, 0]} rotation={[0, Math.PI / 2, -0.12]} frame={f} burn={0.9} scale={1.2} />} /></Stage>; };
// 9 the two dots touch
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const t = sec(9, f); const tt = t < 25.68 ? 25.68 - (25.68 - t) * 2.2 : t; const m = mPos(25.68);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<><Flash at={loc(25.68, 9)} y="48%" max={0.7} color="#fff0c0" /><Pill text="WAITING FOR THEM TO SPLIT" y={236} variant="yellow" delay={loc(26.3, 9)} size={36} /></>}>
    <ShotCam preset="push" from={[2.6, 5.0, 3.6]} to={[0.5, 2.0, 0.8]} look={[[0, 0, 0], [0.1, 0, -0.1]]} fov0={52} fov1={38} start={0} end={d} ease="ramp" shake={0.18} shakeFrom={loc(25.68, 9)} shakeLen={16} drift={0.02} />
    <Scope frame={f} tt={tt} />
    <Burst kind="sparks" position={[m[0], 0.2, m[1]]} start={loc(25.68, 9)} frame={f} count={50} color="#ffe08a" floorY={0} /><Shockwave position={[m[0], 0.1, m[1]]} start={loc(25.68, 9)} frame={f} radius={2.2} />
    <Post bloom={1.5} threshold={0.35} vignette={0.3} ca={0.001} /></Stage>; };
// 10 they never do
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const t = sec(10, f);
  return <Stage palette={{...ROOM, amb: 1.1, hemiI: 1.8, top: '#0a2a30', mid: '#10444a'}} fog={[14, 60]} overlay={<><Pill text="THEY NEVER SPLIT" y={236} variant="red" delay={loc(28.9, 10)} size={44} /><WhipStreaks from={0} to={8} dir="h" /></>}>
    <ShotCam preset="push" from={[-0.1, 2.8, 1.8]} to={[-0.7, 2.0, 1.0]} look={[[0.1, 0, 0.0], [-0.8, 0, 0.3]]} fov0={46} fov1={36} start={0} end={d} ease="inout" />
    <Scope frame={f} tt={t} /><Post bloom={1.4} threshold={0.35} vignette={0.35} /></Stage>; };
// 11 one blip flies on alone, IFF lost
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const t = sec(11, f);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<><Pill text="ONE BLIP, ALONE" y={236} variant="yellow" delay={loc(31.0, 11)} size={40} /><Pill text="JET SIGNAL: LOST" y={236} variant="red" delay={loc(33.0, 11)} size={42} /><Flash at={loc(33.0, 11)} y="50%" max={0.4} color="#ff9a8a" /></>}>
    <ShotCam preset="orbit" target={[-0.6, 0, 0.3]} a0={0.5} a1={-0.7} r0={5.4} r1={4.4} h0={3.4} h1={2.6} fov0={46} fov1={42} start={0} end={d} ease="inout" />
    <Scope frame={f} tt={t} iffGone={33.0} /><Post bloom={1.4} threshold={0.35} vignette={0.3} /></Stage>; };
// 12 the radio, silent
S[12] = () => { const f = useCurrentFrame(); const d = dur(12);
  return <Stage palette={{...ROOM, hor: '#1a1408', mid: '#0a0e12'}} fog={[10, 40]} overlay={<Pill text="RADIO: SILENT" y={236} variant="red" delay={loc(34.0, 12)} size={46} />}>
    <ShotCam preset="push" from={[2.6, 2.8, 6.4]} to={[1.5, 2.1, 4.6]} look={[[0, 1.2, 0], [0, 1.3, 0]]} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <RadioDesk frame={f} /><LightCone position={[0, 4.4, 0.4]} dir={[0, -1, 0]} length={3.6} radius={1.8} frame={f} color="#ffe8b0" opacity={0.3} />
    <Particles kind="dust" center={[0, 1.8, 0]} area={[6, 3, 5]} count={40} frame={f} color="#ffe8b0" opacity={0.5} /><Post bloom={1.1} threshold={0.5} vignette={0.3} /></Stage>; };
// 13 not the strange part: storm wide
S[13] = () => { const f = useCurrentFrame(); const d = dur(13);
  return <Stage palette={STORM} fog={[30, 120]} overlay={<><Pill text="THAT'S NOT THE STRANGE PART" y={236} variant="yellow" delay={4} size={36} /><CFlash at={[at(0.7), at(1.5)]} k={0.55} /></>}>
    <ShotCam preset="crane" target={[0, 1, 0]} h0={2.5} h1={11} r0={14} r1={26} angle={-0.5} lookY0={2} lookY1={0} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Sto f={f} fog /></Stage>; };
// 14 REVEAL: the Air Force said it merged with an object
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const tr = loc(39.06, 14);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<><Flash at={tr} y="45%" max={0.75} color="#fff0c0" />
    <KineticCard lines={[cueLine(W, 'merged with', 38.9, 'merged'), cueLine(W, 'an object', 39.3, 'object')]} y={300} size={92} hideAt={41.0} offsetSec={CS[14]} />
    {f >= at(38.2) - C[14] && <DocCard lines={['AIR FORCE RELEASE', 'TO THE PRESS, 1953', '', '"...jet merged', ' with an object."']} source="AIR FORCE STATEMENT AS REPORTED BY AP" delay={at(38.2) - C[14]} top={760} width={860} size={46} highlight={[3, 4]} />}</>}>
    <ShotCam preset="push" from={[1.4, 4.8, 3.2]} to={[0.4, 3.0, 0.4]} look={[[0, 0, 0], [0.2, 0, 0]]} fov0={52} fov1={44} start={0} end={d} ease="inout" shake={0.2} shakeFrom={tr} shakeLen={14} />
    <Scope frame={f} tt={26 + (f / FPS) * 0.4} /><Burst kind="sparks" position={[0.1, 0.3, -0.1]} start={tr} frame={f} count={60} color="#ffe08a" floorY={0} /><Shockwave position={[0.1, 0.1, -0.1]} start={tr} frame={f} radius={3} />
    <Post bloom={1.5} threshold={0.35} vignette={0.35} ca={0.0012} /></Stage>; };
// 15 then the story changed: retracted
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const tx = loc(42.1, 15);
  return <Stage palette={{...ROOM, hemiSky: '#d08a6a', rim: '#ff7a5a'}} fog={[14, 60]} overlay={<>
    <DocCard lines={['"...jet merged', ' with an object."']} source="AIR FORCE, FIRST STATEMENT" delay={2} top={560} width={860} size={46} />
    {f >= tx && <div style={{position: 'absolute', top: 480, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 340, color: '#d6302a', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill', transform: `scale(${1 + Math.max(0, 1 - (f - tx) / 6) * 0.5}) rotate(-6deg)`}}>✕</div>}
    <Pill text="STORY CHANGED" y={236} variant="red" delay={tx} size={44} /></>}>
    <ShotCam preset="whip" from={[0, 2.2, 7]} lookA={[-6, 2, -3]} lookB={[0, 2.4, -3]} w0={0} w1={14} fov0={52} start={0} end={d} />
    <RadarRoom frame={f} tt={24} /><Particles kind="motes" center={[0, 2.5, -2]} area={[12, 4, 8]} count={30} frame={f} color="#ffb09a" opacity={0.5} /><Post bloom={1.1} threshold={0.45} vignette={0.3} /></Stage>; };
// 16 lost Canadian plane + dizzy pilot (vertigo)
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const roll = Math.sin(f * 0.06) * 0.5 + f * 0.012;
  return <Stage palette={STORM} fog={[24, 100]} overlay={<><Pill text="A LOST RCAF C-47?" y={236} variant="yellow" delay={4} size={38} /><Pill text="A DIZZY PILOT?" y={236} variant="red" delay={loc(45.1, 16)} size={42} /></>}>
    <ShotCam preset="dollyZoom" target={[0, 4, 0]} d0={7} d1={14} dir={[-0.7, 0.15, 1]} fov0={58} start={0} end={d} ease="inout" />
    <group position={[0, 4, 0]} rotation={[0, 0, roll]}><group position={[0, -4, 0]}>
      <Sto f={f} jet={<C47 position={[0, 4, 0]} rotation={[0, 1.2, 0.2]} frame={f} scale={0.9} />} /></group></group></Stage>; };
// 17 case closed? Canada says none were there
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const tx = loc(48.7, 17); const fade = 1 - clamp01((f - at(47.0) + C[17]) / 40);
  return <Stage palette={STORM} fog={[24, 100]} overlay={<>{kc(17, 'Case closed', 46.7, 'closed', 300, 100, 48.0)}<Pill text="CANADA: NONE WERE THERE" y={236} variant="red" delay={loc(48.2, 17)} size={38} />
    {f > tx && <div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 380, color: '#d6302a', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill'}}>✕</div>}</>}>
    <ShotCam preset="push" from={[-8, 3.4, 9]} to={[-2, 4.2, 6]} look={[[0, 3.6, 0], [0, 3.8, 0]]} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <Sto f={f} jet={<group position={[0, 0, 0]}><C47 position={[0 + f * 0.05, 4, 0]} rotation={[0, 1.57, 0]} frame={f} scale={0.9 * Math.max(0.01, fade)} /></group>} /></Stage>; };
// 18 no wreck ever found: search lights, then the F-89 photo
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const p1 = loc(50.7, 18);
  return <Stage palette={DAWN} fog={[30, 120]} overlay={<>{f >= p1 && <PhotoCard src="kinross/IMG3.jpg" credit="F-89 Scorpion · USAF, public domain" tag="NO WRECK FOUND" delay={p1} dur={d - p1} />}</>}>
    <ShotCam preset="push" from={[-10, 6, 12]} to={[-2, 9, 8]} look={[[0, 2, 0], [2, 1, 0]]} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <Ocean size={[130, 80]} frame={f} amp={0.5} choppy={1.0} position={[0, -0.3, 0]} deep="#16304a" face="#4a7a9a" foam="#c8d8e8" foamAt={0.92} />
    {[0, 1, 2].map((i) => <group key={i}><Jet position={[-14 + f * 0.18 + i * 7, 6 + i * 0.6, -4 - i * 5]} rotation={[0, Math.PI / 2, 0]} burn={0.2} frame={f} scale={1.0} />
      <LightCone position={[-14 + f * 0.18 + i * 7, 6 + i * 0.6, -4 - i * 5]} dir={[Math.sin(f * 0.05 + i) * 0.4, -1, 0.1]} length={9} radius={1.6} frame={f} color="#fff2c0" opacity={0.35} /></group>)}
    <Particles kind="spray" center={[0, 0.5, 0]} area={[30, 1, 20]} count={40} frame={f} opacity={0.5} /><Post bloom={1.0} threshold={0.55} vignette={0.4} /></Stage>; };
// 19 question + loop back to the opening scope
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const t = sec(19, f); const tt = 21.86 + (t - 52.38) * 1.8; const m = mPos(25.68); const p2 = loc(53.9, 19);
  return <Stage palette={ROOM} fog={[14, 60]} overlay={<>{f < p2 && f > 4 && <PhotoCard src="kinross/IMG2.jpg" credit="Moncla memorial marker · CC BY" tag="LT. FELIX MONCLA" delay={4} dur={p2 - 4} rot={2} />}
    <Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(54.6, 19)} size={46} /><EndCard delay={loc(54.0, 19)} sources={['USAF REPORT', 'WIKIPEDIA', 'HISTORY.COM']} /></>}>
    <ShotCam preset="push" from={[0.4, 3.6, 1.6]} to={[0.5, 6.0, 5.5]} look={[[0.3, 0, -0.3], [0, 0, 0]]} fov0={42} fov1={50} start={0} end={d} ease="inout" drift={0.02} />
    <Scope frame={f} tt={tt} />
    <Burst kind="sparks" position={[m[0], 0.2, m[1]]} start={at(54.5) - C[19]} frame={f} count={30} color="#ffe08a" floorY={0} />
    <Particles kind="motes" center={[0, 1.5, 0]} area={[8, 3, 8]} count={30} frame={f} color="#7affb0" opacity={0.5} /><Post bloom={1.4} threshold={0.35} vignette={0.3} /></Stage>; };

export const Kinross = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? KN_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#02080a" />}</Sequence>; })}
    <Grade look="cold" strength={0.3} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
