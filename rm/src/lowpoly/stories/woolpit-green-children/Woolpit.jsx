// "The Green Children of Woolpit" (Suffolk, 12th c.) - low-poly 3D Short, ANIMATION UPGRADE kit + GitGems Rigged villagers.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, OutlineScope, Person, Particles, Burst, Shockwave, FogLayer, LightCone, GodRays, Rigged,
  Grade, Flash, WhipStreaks, KineticCard, cueLine, clamp01, mixPalette, PALETTES, usePreload} from '../../kit/index.js';
import {DocCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Fields, Wheat, WolfPit, Village, Hall, Hearth, Table, BeanPlants, Bed, Desk, Cave, Bell, BookOpen, Mist, Bx, Glow, hexMix, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const WP_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const CS = [0, 2.7, 5.1, 8.7, 11.1, 13.7, 16.3, 18.5, 20.6, 23.5, 25.0, 27.9, 31.3, 35.2, 39.0, 41.9, 44.0, 45.7, 48.7, 50.6, 53.0];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? WP_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k', 'm'].map((c) => `blocky/character-${c}.glb`);

const GREY = {top: '#3a4a6a', mid: '#8a96a4', hor: '#d0cab4', fog: '#8a96a0', amb: 1.0, hemiSky: '#e8ecf0', hemiGround: '#4a5a32', hemiI: 1.4, sun: '#ffe8b8', sunI: 1.8, sunPos: [-20, 18, -10], rim: '#ffcc90', rimI: 1.3, rimPos: [20, 8, 20], glow: 0.5};
const GOLD = {...GREY, top: '#4a6aa8', mid: '#e0b078', hor: '#ffe0a0', fog: '#e0c890', sun: '#ffd080', sunI: 2.4, hemiSky: '#fff0c8'};
const NIGHT = {top: '#06081a', mid: '#141c3e', hor: '#2c3a6a', fog: '#141c34', amb: 0.7, hemiSky: '#7a90e0', hemiGround: '#141c20', hemiI: 1.1, sun: '#a8bcff', sunI: 1.3, sunPos: [10, 20, -10], rim: '#6a88e8', rimI: 1.4, rimPos: [-20, 8, 20], glow: 0.5};
const CANDLE = {top: '#1a1008', mid: '#2a1a10', hor: '#5a3418', fog: '#241408', amb: 0.9, hemiSky: '#ffb870', hemiGround: '#3a2410', hemiI: 1.3, sun: '#ffc890', sunI: 1.2, sunPos: [3, 8, 6], rim: '#ff9a50', rimI: 1.5, rimPos: [-5, 3, -6], glow: 1};
const MARTIN = {top: '#0e1e12', mid: '#2e5a34', hor: '#a8ff8a', fog: '#2a5030', amb: 0.9, hemiSky: '#a8ffa8', hemiGround: '#1a3a1c', hemiI: 1.5, sun: '#c8ffb0', sunI: 0.9, sunPos: [0, 6, -20], rim: '#7affc0', rimI: 1.7, rimPos: [0, 6, -12], glow: 1};
const GREEN = '#7fc04c', PALE = '#e3b894';

const Kid = ({i = 0, k = 0, pos, rot = 0, pose = 'stand', f, actT = 1, scale = 0.62, prop}) => <Person position={pos} rotation={rot} scale={scale} pose={pose} actT={actT} phase={f / (pose === 'run' || pose === 'walk' ? 3.4 : 9) + i} skin={hexMix(GREEN, PALE, k)} shirt={i ? '#6a8a3a' : '#a07a3a'} pants={i ? '#4a3a2a' : '#3a4a3a'} hair={i ? '#d8c27a' : '#c8b060'} pattern={i ? 'check' : 'stripe'} prop={prop} shadow />;
const Crowd = ({list, t}) => <>{list.map((c, i) => <Rigged key={i} path={RIG[c.k % RIG.length]} time={t + i * 0.3} clips={c.clips || [{name: 'idle', from: 0}]} position={c.p} rotation={[0, c.r || 0, 0]} scale={0.46} />)}</>;
const Q = ({f, items}) => <>{items.map(([x, y, d], i) => { const t = f - d; if (t < 0) return null; const rise = Math.min(t, 60) * 1.2; const s = Math.min(1, t / 6);
  return <div key={i} style={{position: 'absolute', left: x, top: y - rise, fontFamily: 'Lilita One', fontSize: 150, color: '#ffe35a', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', transform: `scale(${s}) rotate(${(i % 2 ? 8 : -8)}deg)`, opacity: t > 50 ? 1 - (t - 50) / 14 : 1}}>?</div>; })}</>;
const Chip = ({f, d, x, y, text, c = '#fff'}) => f < d ? null : <div style={{position: 'absolute', left: x, top: y - Math.min(f - d, 24) * 1.5, transform: `scale(${Math.min(1, (f - d) / 5)})`, fontFamily: 'Lilita One', fontSize: 62, color: '#141414', background: c, padding: '8px 26px', borderRadius: 34, border: '6px solid #141414'}}>{text}</div>;
const Pit = ({f, children, kids = 0}) => <><Fields /><Wheat frame={f} /><WolfPit frame={f} /><Village frame={f} />{children}</>;

const S = [];
// 0 HOOK: two green children at the wolf pit, reapers closing in
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const t = f / FPS;
  return <Stage palette={GOLD} fog={[18, 70]} overlay={<><Flash at={at(2.0)} y="42%" max={0.5} color="#c8ff9a" />
    <KineticCard lines={[cueLine(W, 'Two children', 0, 'children'), cueLine(W, 'wolf pit', 1.7, 'wolf')]} y={300} size={110} hideAt={2.6} /></>}>
    <ShotCam preset="push" from={[1.5, 6.5, 9]} to={[0.4, 1.8, 2.2]} look={[[0, 0, -3], [0, 1.0, -1.4]]} fov0={52} fov1={44} start={0} end={d} ease="inout" drift={0.02} />
    <Pit f={f}>
      <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, -1.4), -1.4]} rot={0.2} pose="cower" f={f} /><Kid i={1} pos={[0.55, height(0.55, -1.4), -1.4]} rot={-0.2} pose="stand" f={f} /></OutlineScope>
      <Crowd t={t} list={[{k: 0, p: [-3.2, height(-3.2, 0.5), 0.5], r: 1.1, clips: [{name: 'walk', from: 0}]}, {k: 1, p: [3.4, height(3.4, 0.2), 0.2], r: -1.1, clips: [{name: 'walk', from: 0}]}, {k: 2, p: [0, height(0, 4), 4], r: Math.PI, clips: [{name: 'walk', from: 0}]}]} />
      <Burst kind="sparks" position={[0, 1.2, -1.4]} start={at(2.0)} frame={f} count={40} color="#b8ff7a" floorY={0} /><Particles kind="motes" center={[0, 2, -1]} area={[10, 4, 8]} count={34} frame={f} color="#e8ffb0" opacity={0.5} />
      <Post bloom={1.1} threshold={0.5} vignette={0.35} /></Pit></Stage>; };
// 1 skin was green: orbit close
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={GREY} fog={[12, 50]} overlay={<><Flash at={loc(4.82, 1)} y="40%" max={0.6} color="#b8ff90" /><Pill text="THEIR SKIN WAS GREEN" y={236} variant="dark" delay={loc(4.0, 1)} size={42} /></>}>
    <ShotCam preset="orbit" target={[0, 1.0, -1.4]} a0={-0.8} a1={0.6} r0={4.4} r1={2.9} h0={1.0} h1={1.2} start={0} end={d} ease="inout" fov0={48} fov1={40} />
    <Pit f={f}><OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, -1.4), -1.4]} rot={0.3} pose="stand" f={f} /><Kid i={1} pos={[0.55, height(0.55, -1.4), -1.4]} rot={-0.3} pose="lookup" f={f} actT={clamp01(f / 20)} /></OutlineScope>
      <Burst kind="sparks" position={[0, 1.4, -1.4]} start={loc(4.82, 1)} frame={f} count={30} color="#b8ff7a" floorY={0} /><Shockwave position={[0, 0.3, -1.4]} start={loc(4.82, 1)} frame={f} radius={2.4} color="#b8ff90" />
      <Post bloom={1.2} threshold={0.45} vignette={0.35} /></Pit></Stage>; };
// 2 no language: villagers around, question marks
S[2] = () => { const f = useCurrentFrame(); const d = dur(2); const t = f / FPS;
  return <Stage palette={GREY} fog={[14, 60]} overlay={<><Pill text="NO KNOWN LANGUAGE" y={236} variant="yellow" delay={loc(6.0, 2)} size={42} /><Q f={f} items={[[190, 600, 6], [770, 540, 20], [480, 470, 36]]} /></>}>
    <ShotCam preset="push" from={[-4.5, 2.2, 5]} to={[-1.4, 1.5, 1.6]} look={[[0, 1, -1], [0, 1.1, -1.2]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Pit f={f}><OutlineScope thickness={0.025}><Kid i={0} pos={[-0.4, height(-0.4, -1), -1]} rot={0.5} pose="stand" f={f} /><Kid i={1} pos={[0.5, height(0.5, -1), -1]} rot={-0.4} pose="cower" f={f} /></OutlineScope>
      <Crowd t={t} list={[{k: 0, p: [-2.2, height(-2.2, 0.8), 0.8], r: 0.9, clips: [{name: 'emote-no', from: 0.2}]}, {k: 1, p: [2.1, height(2.1, 0.8), 0.8], r: -0.9, clips: [{name: 'idle', from: 0}, {name: 'emote-no', from: 1.2}]}, {k: 3, p: [0, height(0, 1.9), 1.9], r: Math.PI, clips: [{name: 'emote-no', from: 0.7}]}]} />
      <Post bloom={1.0} threshold={0.55} vignette={0.35} /></Pit></Stage>; };
// 3 Woolpit, Suffolk, 12th century: aerial
S[3] = () => { const f = useCurrentFrame(); const d = dur(3);
  return <Stage palette={GOLD} fog={[40, 140]} overlay={<><Pill text="WOOLPIT, SUFFOLK" y={236} variant="yellow" delay={loc(8.8, 3)} size={44} /><Pill text="12TH CENTURY" y={312} variant="red" delay={loc(10.0, 3)} size={44} /></>}>
    <ShotCam preset="crane" target={[0, 1.5, -10]} h0={3} h1={17} r0={14} r1={28} angle={0.2} lookY0={1} lookY1={0} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Pit f={f}><GodRays position={[-8, 16, -8]} dir={[0.3, -1, -0.3]} length={22} count={6} frame={f} /><FogLayer y={0.6} size={90} layers={3} thickness={1.2} color="#f0e0b0" opacity={0.12} frame={f} /><Post bloom={1.1} threshold={0.55} vignette={0.3} /></Pit></Stage>; };
// 4 reapers find a brother and sister
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const t = f / FPS;
  return <Stage palette={GOLD} fog={[18, 70]} overlay={<><Pill text="REAPERS FIND THEM" y={236} variant="yellow" delay={loc(11.2, 4)} size={42} /><Pill text="A BROTHER AND SISTER" y={312} variant="dark" delay={loc(12.3, 4)} size={38} /></>}>
    <ShotCam preset="push" from={[-8, 1.3, 7]} to={[-1.6, 1.4, 1.5]} look={[[-1, 0.8, -1], [0, 1.0, -3.4]]} fov0={52} fov1={46} start={0} end={d} ease="inout" shake={0.04} shakeFrom={0} shakeLen={d} />
    <Pit f={f}>
      <Crowd t={t} list={[{k: 0, p: [-2.6, height(-2.6, 0.6), 0.6], r: 1.2, clips: [{name: 'attack-melee-right', from: 0}]}, {k: 1, p: [-1.4, height(-1.4, 1.8), 1.8], r: 1.3, clips: [{name: 'attack-melee-right', from: 0.4}]}, {k: 2, p: [-3.4, height(-3.4, -0.8), -0.8], r: 1.0, clips: [{name: 'walk', from: 0}, {name: 'emote-yes', from: 2.0, loop: false}]}]} />
      <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, -2.2), -2.2]} rot={0.2} pose="crouch" f={f} /><Kid i={1} pos={[0.5, height(0.5, -2.2), -2.2]} rot={-0.2} pose="cower" f={f} /></OutlineScope>
      <Particles kind="dust" center={[-2, 1.5, 1]} area={[12, 3, 8]} count={46} frame={f} color="#f2dc8a" opacity={0.5} /><Post bloom={1.1} threshold={0.55} vignette={0.3} /></Pit></Stage>; };
// 5 strange clothes, green skin
S[5] = () => { const f = useCurrentFrame(); const d = dur(5);
  return <Stage palette={GREY} fog={[12, 50]} overlay={<><Pill text="STRANGE CLOTHES" y={236} variant="yellow" delay={4} size={42} /><Pill text="GREEN SKIN" y={236} variant="dark" delay={loc(15.26, 5)} size={46} /><CFlash at={[loc(15.26, 5)]} k={0.4} color="#b8ff90" /></>}>
    <ShotCam preset="push" from={[2.4, 0.5, 3]} to={[0.3, 1.7, 0.9]} look={[[-0.4, 0.5, -1.4], [-0.1, 1.5, -1.4]]} fov0={50} fov1={38} start={0} end={d} ease="inout" />
    <Pit f={f}><OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, -1.4), -1.4]} rot={-0.3} pose="stand" f={f} scale={0.8} /><Kid i={1} pos={[0.6, height(0.6, -1.4), -1.4]} rot={-0.6} pose="stand" f={f} scale={0.8} /></OutlineScope>
      <Post bloom={1.2} threshold={0.5} vignette={0.4} /></Pit></Stage>; };
// 6 they refuse all food
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const t = f / FPS;
  return <Stage palette={CANDLE} fog={[12, 40]} overlay={<><Pill text="THEY REFUSE ALL FOOD" y={236} variant="red" delay={loc(16.4, 6)} size={42} /><CFlash at={[loc(17.36, 6)]} k={0.35} /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, 0]} a0={0.4} a1={-0.7} r0={6.5} r1={5} h0={1.8} h1={2.2} start={0} end={d} ease="inout" fov0={50} fov1={46} />
    <Hall frame={f} /><Hearth frame={f} /><Table x={0} z={-0.8} />
    <OutlineScope thickness={0.025}><Kid i={0} pos={[-1.2, 0, 1.5]} rot={Math.PI - 0.3 + Math.sin(f * 0.15) * 0.35} pose="stand" f={f} /><Kid i={1} pos={[1.2, 0, 1.5]} rot={Math.PI + 0.3 - Math.sin(f * 0.15) * 0.35} pose="cower" f={f} /></OutlineScope>
    <Crowd t={t} list={[{k: 0, p: [0.2, 0, -1.8], r: 0, clips: [{name: 'holding-right', from: 0}]}]} />
    <Particles kind="dust" center={[0, 2, 0]} area={[10, 4, 8]} count={40} frame={f} color="#ffd890" opacity={0.4} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 7 days pass with nothing eaten
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const k = 0.5 - 0.5 * Math.cos(f * 0.26); const a = f * 0.26;
  return <Stage palette={mixPalette(GOLD, NIGHT, k)} fog={[16, 60]} overlay={<><Pill text="DAYS PASS" y={236} variant="yellow" delay={loc(18.5, 7)} size={46} /><Pill text="THEY EAT NOTHING" y={236} variant="red" delay={loc(19.2, 7)} size={42} /></>}>
    <ShotCam preset="push" from={[0, 1.4, 6]} to={[0, 1.1, 3.4]} look={[[0, 1, 0], [0, 0.8, 0]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Pit f={f}>
      <mesh position={[Math.cos(a - 1.57) * 20, 12 + Math.sin(a - 1.57) * 14, -26]}><sphereGeometry args={[1.8, 10, 8]} /><meshBasicMaterial color={k > 0.5 ? '#e8f0ff' : '#ffe9a0'} /></mesh>
      <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.7, height(-0.7, 0), 0]} rot={0.4} pose="sit" f={f} /><Kid i={1} pos={[0.7, height(0.7, 0), 0]} rot={-0.4} pose="sit" f={f} /></OutlineScope>
      <Table x={3.2} z={-1} /><Post bloom={1.1} threshold={0.55} vignette={0.4} /></Pit></Stage>; };
// 8 raw broad beans
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const t = f / FPS;
  return <Stage palette={CANDLE} fog={[12, 40]} overlay={<><Pill text="RAW BROAD BEANS" y={236} variant="dark" delay={loc(21.4, 8)} size={46} /><CFlash at={[loc(22.18, 8)]} k={0.4} color="#d8ffb0" /></>}>
    <ShotCam preset="push" from={[2.4, 2.5, 3.8]} to={[0.6, 1.5, 0.9]} look={[[0, 1, -0.8], [0.2, 1.1, -0.6]]} fov0={52} fov1={38} start={0} end={d} ease="inout" />
    <Hall frame={f} /><Hearth frame={f} /><Table x={0} z={-0.8} bread={false} beans /><BeanPlants frame={f} x={-2.8} z={-2.4} n={5} />
    <OutlineScope thickness={0.025}><Kid i={0} pos={[-1.0, 0, 0.8]} rot={Math.PI} pose="crouch" f={f} /><Kid i={1} pos={[1.0, 0, 0.8]} rot={Math.PI} pose="lookup" f={f} actT={clamp01(f / 40)} /></OutlineScope>
    <Crowd t={t} list={[{k: 2, p: [1.6, 0, -1.9], r: 0, clips: [{name: 'interact-right', from: 0.2}]}]} />
    <LightCone position={[0, 4.6, -0.8]} dir={[0, -1, 0]} length={4.2} radius={1.8} frame={f} color="#d8ffb0" opacity={0.28} />
    <Particles kind="dust" center={[0, 2, 0]} area={[8, 4, 6]} count={36} frame={f} color="#ffd890" opacity={0.4} /><Post bloom={1.2} threshold={0.5} vignette={0.45} /></Stage>; };
// 9 REVEAL: they devour them
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const tr = loc(23.54, 9);
  return <Stage palette={CANDLE} fog={[12, 40]} overlay={<><Flash at={tr} y="48%" max={0.8} color="#e8ffb0" />
    <KineticCard lines={[cueLine(W, 'They devour them', 23.5, 'devour')]} y={300} size={96} hideAt={25.0} offsetSec={CS[9]} /></>}>
    <ShotCam preset="push" from={[1.2, 2.6, 5.4]} to={[0, 1.7, 2.6]} look={[[0, 1.1, -0.2], [0, 1.0, -0.4]]} fov0={54} fov1={44} start={0} end={d} ease="ramp" shake={0.2} shakeFrom={tr} shakeLen={18} />
    <Hall frame={f} /><Hearth frame={f} /><Table x={0} z={-0.8} bread={false} beans /><BeanPlants frame={f} x={-2.8} z={-2.4} n={5} />
    <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.45, 0, 0.3]} rot={Math.PI} pose={f < tr ? 'crouch' : 'dig'} f={f * 1.6} /><Kid i={1} pos={[0.45, 0, 0.3]} rot={Math.PI} pose={f < tr ? 'crouch' : 'dig'} f={f * 1.8} /></OutlineScope>
    <Burst kind="sparks" position={[0, 1.4, -0.8]} start={tr} frame={f} count={60} color="#b8ff7a" floorY={0} /><Shockwave position={[0, 1.1, -0.8]} start={tr} frame={f} radius={3} color="#d8ffb0" />
    <Post bloom={1.5} threshold={0.4} vignette={0.45} ca={0.001} /></Stage>; };
// 10 they learn English
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const t = f / FPS;
  return <Stage palette={GOLD} fog={[18, 70]} overlay={<><Pill text="LEARNING ENGLISH" y={236} variant="yellow" delay={loc(25.2, 10)} size={44} /><Chip f={f} d={14} x={120} y={640} text="BREAD" /><Chip f={f} d={36} x={640} y={600} text="WATER" c="#c8ecff" /><Chip f={f} d={60} x={330} y={540} text="HELLO" c="#ffe58a" /></>}>
    <ShotCam preset="orbit" target={[0, 1.2, 0]} a0={-0.5} a1={0.7} r0={6} r1={4.6} h0={1.6} h1={2.0} start={0} end={d} ease="inout" fov0={50} fov1={46} />
    <Pit f={f}><Crowd t={t} list={[{k: 0, p: [-1.7, height(-1.7, 0), 0], r: 1.2, clips: [{name: 'emote-yes', from: 0.4}]}, {k: 3, p: [1.8, height(1.8, 0.2), 0.2], r: -1.2, clips: [{name: 'idle', from: 0}, {name: 'emote-yes', from: 1.4}]}]} />
      <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, 0), 0]} rot={0.2} pose="stand" f={f} k={0.1} /><Kid i={1} pos={[0.5, height(0.5, 0), 0]} rot={-0.2} pose="stand" f={f} k={0.1} /></OutlineScope>
      <Post bloom={1.0} threshold={0.55} vignette={0.3} /></Pit></Stage>; };
// 11 green fades, the boy grows sick and dies
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const k = clamp01(f / 70); const fall = clamp01((f - loc(29.2, 11)) / 36);
  return <Stage palette={CANDLE} fog={[10, 36]} overlay={<><Pill text="THE GREEN FADES" y={236} variant="yellow" delay={loc(27.5, 11)} size={42} /><Pill text="THE BOY DIES" y={236} variant="red" delay={loc(29.9, 11)} size={46} /><CFlash at={[loc(30.22, 11)]} k={0.35} /></>}>
    <ShotCam preset="push" from={[5.0, 4.2, 6.4]} to={[2.6, 2.9, 3.6]} look={[[0, 0.6, -0.3], [0, 0.5, -0.3]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Hall frame={f} fire={false} /><Bed x={0} z={-0.4} /><pointLight position={[1.2, 1.6, 0.8]} color="#ffb060" intensity={5} distance={7} decay={1.6} /><Glow p={[1.2, 1.6, 0.8]} s={2.4} c="#ffb060" o={0.6} />
    <OutlineScope thickness={0.025}><Person position={[0, 0.58, -0.3]} rotation={Math.PI} scale={0.6} pose="fall" fallT={fall} phase={f / 9} skin={hexMix(GREEN, PALE, 0.5 + k * 0.5)} shirt="#a07a3a" pants="#3a4a3a" hair="#c8b060" shadow />
      <Kid i={1} k={k} pos={[1.0, 0, -0.1]} rot={-1.9} pose="crouch" f={f} /></OutlineScope>
    <Particles kind="dust" center={[0, 1.8, 0]} area={[6, 3, 5]} count={36} frame={f} color="#ffe0a0" opacity={0.45} /><Post bloom={1.2} threshold={0.5} vignette={0.5} /></Stage>; };
// 12 the girl lives, tells her story by the fire
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const t = f / FPS;
  return <Stage palette={CANDLE} fog={[12, 44]} overlay={<><Pill text="THE GIRL LIVES" y={236} variant="dark" delay={loc(31.4, 12)} size={46} /><Pill text="SHE TELLS HER STORY" y={236} variant="yellow" delay={loc(33.0, 12)} size={40} /></>}>
    <ShotCam preset="orbit" target={[0, 1.0, -2.6]} a0={-0.6} a1={0.8} r0={7.5} r1={5.2} h0={1.8} h1={2.4} start={0} end={d} ease="inout" fov0={50} fov1={44} />
    <Hall frame={f} /><Hearth frame={f} />
    <OutlineScope thickness={0.025}><Kid i={1} k={1} pos={[0, 0, -2.0]} rot={0} pose="stand" f={f} scale={0.7} />
      {[[-2.2, -2.8], [-2.6, -1.4], [2.2, -2.8], [2.6, -1.3]].map(([x, z], i) => <Person key={i} position={[x, 0, z]} rotation={x < 0 ? 1.2 : -1.2} scale={0.62} pose="sit" phase={f / 10 + i} shirt={['#8a4a2a', '#3a5a7a', '#6a3a5a', '#5a6a3a'][i]} pants="#3a2a1a" shadow />)}</OutlineScope>
    <Particles kind="embers" center={[0, 1, -4.8]} area={[2, 3, 2]} count={30} frame={f} color="#ffb040" opacity={0.7} /><Post bloom={1.2} threshold={0.5} vignette={0.5} /></Stage>; };
// 13 Saint Martin: green twilight land where the sun never shone
S[13] = () => { const f = useCurrentFrame(); const d = dur(13);
  return <Stage palette={MARTIN} fog={[10, 60]} overlay={<><CFlash at={[at(0.1), at(0.8)]} k={0.3} color="#b8ffb0" />
    <KineticCard lines={[cueLine(W, 'Saint Martin', 35.8, 'Martin'), cueLine(W, 'sun never shone', 37.2, 'sun')]} y={300} size={78} hideAt={38.9} offsetSec={CS[13]} /><Pill text="LAND OF NO SUN" y={236} variant="dark" delay={loc(35.3, 13)} size={40} /></>}>
    <ShotCam preset="push" from={[0, 1.8, 12]} to={[0, 1.4, 7.2]} look={[[0, 1.3, -6], [0, 1.4, -8]]} fov0={56} fov1={46} start={0} end={d} ease="inout" drift={0.03} />
    <group><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]}><planeGeometry args={[120, 120]} /><meshLambertMaterial color="#2c6a34" flatShading /></mesh>
      {Array.from({length: 26}, (_, i) => { const x = (i % 2 ? 1 : -1) * (4 + (i * 7) % 11), z = -3 - i * 1.7; return <mesh key={i} position={[x, 1.2 + (i % 4) * 0.3, z]} scale={[0.8, 2.2 + (i % 5) * 0.5, 0.8]}><coneGeometry args={[1, 1, 5]} /><meshLambertMaterial color={i % 3 ? '#3a8a44' : '#58b45a'} flatShading /></mesh>; })}
      <mesh position={[0, 5, -34]}><circleGeometry args={[7, 20]} /><meshBasicMaterial color="#d8ffc0" transparent opacity={0.85} /></mesh><Glow p={[0, 5, -33]} s={40} c="#a8ff8a" o={0.7} /></group>
    <Mist frame={f} />
    <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.7, 0, 4.2 - f * 0.05]} rot={Math.PI} pose="walk" f={f} scale={0.7} /><Kid i={1} pos={[0.7, 0, 4.2 - f * 0.05]} rot={Math.PI} pose="walk" f={f + 8} scale={0.7} /></OutlineScope>
    <Particles kind="motes" center={[0, 2, -2]} area={[16, 5, 16]} count={70} frame={f} color="#b8ffa0" opacity={0.7} /><Post bloom={1.6} threshold={0.35} vignette={0.4} /></Stage>; };
// 14 bells, then a cave
S[14] = () => { const f = useCurrentFrame(); const d = dur(14); const sw = Math.sin(f * 0.5) * 0.5 * Math.exp(-((f % 36) / 40)) * 1.3; const hit = [loc(39.1, 14), loc(39.64, 14)];
  return <Stage palette={MARTIN} fog={[10, 50]} overlay={<><Pill text="THEY HEARD BELLS" y={236} variant="yellow" delay={loc(39.0, 14)} size={44} /><Pill text="THROUGH A CAVE" y={236} variant="dark" delay={loc(40.2, 14)} size={44} /><Flash at={loc(40.88, 14)} y="50%" max={0.7} color="#d8ffd0" /></>}>
    <ShotCam preset="push" from={[-1.0, 2.6, 11]} to={[0, 1.9, 4.6]} look={[[-1.5, 2.2, 0], [0, 1.6, -6]]} fov0={56} fov1={48} start={0} end={d} ease="inout" shake={0.08} shakeFrom={0} shakeLen={d} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]}><planeGeometry args={[80, 80]} /><meshLambertMaterial color="#2c6a34" flatShading /></mesh>
    <Cave /><Bell x={-1.9} z={1.2} swing={sw} />
    {hit.map((h, i) => <Shockwave key={i} position={[-1.9, 2.8, 1.2]} start={h} frame={f} radius={4} color="#ffe08a" />)}
    <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.6 + f * 0.004, 0, 6.2 - f * 0.055]} rot={Math.PI} pose="walk" f={f} scale={0.7} /><Kid i={1} pos={[0.8 + f * 0.003, 0, 6.2 - f * 0.055]} rot={Math.PI} pose="walk" f={f + 6} scale={0.7} /></OutlineScope>
    <Mist frame={f} /><Particles kind="motes" center={[0, 2, -2]} area={[14, 5, 14]} count={50} frame={f} color="#b8ffa0" opacity={0.6} /><Post bloom={1.5} threshold={0.35} vignette={0.4} /></Stage>; };
// 15 two monks wrote it down
S[15] = () => { const f = useCurrentFrame(); const d = dur(15);
  return <Stage palette={CANDLE} fog={[10, 36]} overlay={<><Pill text="TWO MONKS WROTE IT DOWN" y={236} variant="yellow" delay={loc(41.95, 15)} size={38} />
    {f >= loc(42.6, 15) && <DocCard lines={['WILLIAM OF NEWBURGH', 'RALPH OF COGGESHALL', '', '12TH-CENTURY CHRONICLERS']} source="BOTH RECORDED THE WOOLPIT CHILDREN" delay={loc(42.6, 15)} top={520} width={880} size={42} highlight={[0, 1]} />}</>}>
    <ShotCam preset="orbit" target={[0, 1.2, 0]} a0={-0.5} a1={0.5} r0={7.2} r1={5.6} h0={2.6} h1={2.2} start={0} end={d} ease="inout" fov0={50} fov1={46} />
    <Hall frame={f} fire={false} /><Desk x={0} z={-0.6} frame={f} /><pointLight position={[-0.9, 2.0, -0.9]} color="#ffb060" intensity={7} distance={8} decay={1.5} />
    <OutlineScope thickness={0.025}>{[-1, 1].map((s, i) => <Person key={i} position={[s * 1.15, 0.3, -0.4]} rotation={s > 0 ? -1.5 : 1.5} scale={0.7} pose="sit" phase={f / 9 + i} shirt="#4a3a2a" pants="#3a2a1a" hair="#6a5030" skin="#e0b890" prop={i ? 'book' : undefined} shadow />)}</OutlineScope>
    <Particles kind="dust" center={[0, 2, 0]} area={[8, 4, 6]} count={40} frame={f} color="#ffe0a0" opacity={0.45} /><Post bloom={1.2} threshold={0.5} vignette={0.5} /></Stage>; };
// 16 neither could explain it
S[16] = () => { const f = useCurrentFrame(); const d = dur(16);
  return <Stage palette={CANDLE} fog={[10, 36]} overlay={<><Pill text="NEITHER COULD EXPLAIN IT" y={236} variant="red" delay={loc(44.1, 16)} size={38} /><Q f={f} items={[[200, 640, 8], [760, 600, 22]]} /></>}>
    <ShotCam preset="push" from={[0, 2.8, 7.5]} to={[0, 2.0, 4.6]} look={[[0, 1.2, 0], [0, 1.4, 0]]} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Hall frame={f} fire={false} /><Desk x={0} z={-0.6} frame={f} /><pointLight position={[-0.9, 2.0, -0.9]} color="#ffb060" intensity={6} distance={8} decay={1.5} />
    <OutlineScope thickness={0.025}>{[-1, 1].map((s, i) => <Person key={i} position={[s * 0.95, 0, 0.8]} rotation={s > 0 ? -2.6 : 2.6} scale={0.7} pose={i ? 'recoil' : 'lookup'} actT={clamp01((f - 10) / 14)} phase={f / 9 + i} shirt="#4a3a2a" pants="#3a2a1a" hair="#6a5030" skin="#e0b890" shadow />)}</OutlineScope>
    <Post bloom={1.1} threshold={0.5} vignette={0.5} /></Stage>; };
// 17 Flemish orphans with a sickness
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const t = f / FPS;
  return <Stage palette={GREY} fog={[16, 70]} overlay={<><Pill text="FLEMISH ORPHANS?" y={236} variant="yellow" delay={loc(46.2, 17)} size={44} /><Pill text="A SICKNESS?" y={236} variant="red" delay={loc(47.5, 17)} size={46} /></>}>
    <ShotCam preset="track" from={[-9, 1.6, 5]} to={[6, 1.8, 5.5]} offset={[0, 0.8, 5]} target={(ff) => [-8 + ff * 0.17, 1, 0]} fov0={52} start={0} end={d} ease="inout" />
    <Pit f={f}>
      <mesh position={[-4 + f * 0.17 - 4, height(0, 0) + 0.55, -0.4]}><boxGeometry args={[2.6, 0.2, 1.4]} /><meshLambertMaterial color="#6a4a28" flatShading /></mesh>
      <OutlineScope thickness={0.025}>{[0, 1, 2, 3, 4].map((i) => <Person key={i} position={[-8 + f * 0.17 + i * 1.5, height(0, 0), 0]} rotation={Math.PI / 2} scale={0.5} pose="walk" phase={f / 3.2 + i} shirt={['#8a5a3a', '#4a6a8a', '#7a7a4a', '#8a4a4a', '#5a5a8a'][i]} skin={['#d8c07a', '#cfd08a', '#d8b890', '#c8c880', '#d8c07a'][i]} pants="#3a3022" shadow />)}</OutlineScope>
      <Post bloom={1.0} threshold={0.55} vignette={0.4} /></Pit></Stage>; };
// 18 or a folktale
S[18] = () => { const f = useCurrentFrame(); const d = dur(18);
  return <Stage palette={CANDLE} fog={[8, 30]} overlay={<><Pill text="OR JUST A FOLKTALE?" y={236} variant="yellow" delay={loc(48.7, 18)} size={42} /><Flash at={loc(49.32, 18)} y="55%" max={0.5} color="#ffe8a0" /></>}>
    <ShotCam preset="orbit" target={[0, 0.4, 0]} a0={0.3} a1={-0.9} r0={6} r1={3.8} h0={4.2} h1={2.4} start={0} end={d} ease="inout" fov0={50} fov1={42} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}><circleGeometry args={[14, 12]} /><meshLambertMaterial color="#3a2410" flatShading /></mesh>
    <BookOpen frame={f} />
    {[0, 1].map((i) => <Person key={i} position={[(i ? 0.6 : -0.6) + Math.sin(f * 0.1 + i) * 0.1, 0.35 + clamp01((f - 8 - i * 6) / 30) * 1.4, 0.2]} rotation={0} scale={0.28} pose="stand" phase={f / 9 + i} skin={GREEN} shirt="#6a8a3a" pants="#4a3a2a" opacity={clamp01((f - 8) / 20)} />)}
    <Burst kind="sparks" position={[0, 0.6, 0]} start={loc(49.32, 18)} frame={f} count={50} color="#ffd870" floorY={0} life={50} />
    <Particles kind="motes" center={[0, 1.5, 0]} area={[5, 3, 5]} count={46} frame={f} color="#ffd870" opacity={0.7} /><Post bloom={1.5} threshold={0.35} vignette={0.5} /></Stage>; };
// 19 or visitors from elsewhere
S[19] = () => { const f = useCurrentFrame(); const d = dur(19);
  return <Stage palette={NIGHT} fog={[16, 70]} overlay={<><Pill text="VISITORS FROM ELSEWHERE?" y={236} variant="red" delay={loc(50.7, 19)} size={38} /><Flash at={loc(51.86, 19)} y="30%" max={0.7} color="#d8ffd0" /></>}>
    <ShotCam preset="crane" target={[0, 1.2, -1.4]} h0={1.0} h1={6} r0={7} r1={11} angle={0.2} lookY0={2.5} lookY1={4} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Pit f={f}>
      <mesh position={[0, 15, -2]} rotation={[1.2, 0, f * 0.05]}><torusGeometry args={[4, 0.18, 6, 24]} /><meshBasicMaterial color="#b8ffb0" /></mesh><mesh position={[0, 15, -2]} rotation={[1.2, 0, -f * 0.03]}><torusGeometry args={[2.6, 0.12, 6, 20]} /><meshBasicMaterial color="#e8ffd8" /></mesh>
      <LightCone position={[0, 15, -2]} dir={[0, -1, 0]} length={15} radius={3.4} frame={f} color="#b8ffb0" opacity={0.4} />
      <OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, -1.4), -1.4]} rot={0} pose="lookup" actT={clamp01(f / 30)} f={f} /><Kid i={1} pos={[0.55, height(0.55, -1.4), -1.4]} rot={0} pose="lookup" actT={clamp01(f / 30)} f={f} /></OutlineScope>
      <Shockwave position={[0, 0.2, -1.4]} start={loc(51.86, 19)} frame={f} radius={4} color="#b8ffb0" />
      <Particles kind="motes" center={[0, 5, -2]} area={[8, 12, 8]} count={60} frame={f} color="#b8ffb0" opacity={0.7} /><Post bloom={1.6} threshold={0.3} vignette={0.4} /></Pit></Stage>; };
// 20 the question: loops to the opening at the pit
S[20] = () => { const f = useCurrentFrame(); const d = dur(20);
  return <Stage palette={GOLD} fog={[18, 70]} overlay={<><Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(55.4, 20)} size={46} /><EndCard delay={loc(54.0, 20)} sources={['WILLIAM OF NEWBURGH', 'WIKIPEDIA', 'SKEPTOID']} /></>}>
    <ShotCam preset="push" from={[0.4, 1.8, 2.2]} to={[1.5, 6.5, 9]} look={[[0, 1.0, -1.4], [0, 0, -3]]} fov0={44} fov1={52} start={0} end={d} ease="inout" drift={0.02} />
    <Pit f={f}><OutlineScope thickness={0.025}><Kid i={0} pos={[-0.5, height(-0.5, -1.4), -1.4]} rot={0.2} pose="cower" f={f} /><Kid i={1} pos={[0.55, height(0.55, -1.4), -1.4]} rot={-0.2} pose="stand" f={f} /></OutlineScope>
      <Particles kind="motes" center={[0, 2, -1]} area={[10, 4, 8]} count={34} frame={f} color="#e8ffb0" opacity={0.5} /><Post bloom={1.1} threshold={0.5} vignette={0.35} /></Pit></Stage>; };

export const Woolpit = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? WP_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#080a06" />}</Sequence>; })}
    <Grade look="warm" strength={0.25} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
