// "The Valley Where Birds Fall" (Jatinga) - low-poly 3D Short. 19 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, FogLayer, Rigged, Glow, Stars, Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Land, Pines, Village, Bird, Flock, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const JB_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0, 3.74, 6.6, 9.3, 13.35, 15.7, 19.44, 21.46, 23.9, 27.34, 29.8, 33.71, 35.34, 38.96, 40.54, 43.5, 47.39, 50.0, 52.06];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? JB_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);
const FOG = {top: '#04080f', mid: '#0e2230', hor: '#2c4a58', fog: '#0c2230', amb: 1.0, hemiSky: '#7ab8d0', hemiGround: '#14241a', hemiI: 1.5, sun: '#a8c8ff', sunI: 1.1, sunPos: [-20, 30, 10], rim: '#ffb050', rimI: 1.0, rimPos: [0, 8, -30], glow: 1};
const WARM = {...FOG, mid: '#2a1a12', hor: '#8a5a30', fog: '#241810', rim: '#ffd080', rimI: 1.5, hemiSky: '#e0b080'};
const Man = ({p, clip = 'idle', rot = 0, s = 0.55, t, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={p} rotation={[0, rot, 0]} scale={s} />;
const Stamp = ({f, at: a, text, y = 700, color = '#d6302a', size = 130, rot = -8}) => f < a ? null : <div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: size, color, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', letterSpacing: 4, transform: `scale(${1 + Math.max(0, 1 - (f - a) / 5) * 0.7}) rotate(${rot}deg)`, opacity: Math.min(1, (f - a + 1) / 2)}}>{text}</div>;
const Sky = ({f, mist = 0.35, trees = 80}) => <><Stars count={60} radius={170} /><Land /><Pines count={trees} frame={f} />
  <FogLayer y={0.8} size={120} layers={4} thickness={1.4} color="#8ab8c8" opacity={mist} frame={f} center={[0, -10]} /></>;
const VZ = -8;
const P = (children, {pal = FOG, fog = [20, 120], ov = null, bloom = 1.5, vig = 0.4} = {}) => <Stage palette={pal} fog={fog} overlay={ov}>{children}<Post bloom={bloom} threshold={0.4} vignette={vig} /></Stage>;
const Cam = ({d, from, to, look, fov0 = 54, fov1 = 44, shake = 0, shakeFrom = 0}) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov0} fov1={fov1} start={0} end={d} ease="inout" shake={shake} shakeFrom={shakeFrom} shakeLen={14} />;
const Orb = ({d, target, a0 = 0.2, a1 = -0.5, r0 = 16, r1 = 11, h0 = 4, h1 = 3, fov0 = 54, fov1 = 46}) => <ShotCam preset="orbit" target={target} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={fov0} fov1={fov1} start={0} end={d} ease="inout" />;
const VT = [0, height(0, VZ) + 3, VZ];

const S = [];
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const u = clamp01(f / d);
  return P(<><Cam d={d} from={[0, 2, 14]} to={[0, 4, 6]} look={[[0, 9, -8], [0, 5, -8]]} fov0={70} fov1={46} shake={0.3} shakeFrom={3} /><Sky f={f} /><Village frame={f} /><Flock n={30} u={0.3 + u * 0.7} frame={f} target={VT} top={16} /></>,
    {ov: <><CFlash at={[at(0.1)]} k={0.6} color="#ffe0a0" />{kc(0, 'Birds fall', 0.6, 'fall', 330, 110, 3.7)}<Pill text="EVERY AUTUMN" y={236} variant="red" delay={3} size={54} /></>, bloom: 1.7}); };
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const u = clamp01(f / d);
  return P(<><Cam d={d} from={[-6, 3, 10]} to={[2, 4, 2]} look={[[0, 6, -8], [0, 4, -8]]} /><Sky f={f} /><Village frame={f} /><Flock n={26} u={u} frame={f} target={VT} /></>, {ov: <Pill text="NOBODY AGREES WHY" y={236} variant="yellow" delay={loc(4.6, 1)} size={46} />}); };
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return P(<><Orb d={d} target={[0, 4, VZ]} r0={30} r1={22} h0={14} h1={9} fov0={50} fov1={46} /><Sky f={f} trees={50} mist={0.3} /><Village frame={f} /></>,
    {ov: <><Pill text="JATINGA · ASSAM" y={236} variant="yellow" delay={loc(6.6, 2)} size={50} /><Stamp f={f} at={loc(6.9, 2)} text="INDIA" y={640} size={170} rot={-5} color="#e8d8a0" /></>}); };
S[3] = () => { const f = useCurrentFrame(); const d = dur(3);
  return P(<><Cam d={d} from={[0, 3, 12]} to={[0, 5, 4]} look={[[0, 7, -8], [0, 9, -8]]} fov0={60} fov1={50} /><Sky f={f} mist={0.6} /><Village frame={f} /><FogLayer y={2} size={80} layers={5} thickness={2.4} color="#a8c8d0" opacity={0.35} frame={f} center={[0, -6]} /></>,
    {ov: <><Pill text="FOGGY" y={236} variant="yellow" delay={loc(10.0, 3)} size={52} /><Pill text="MOONLESS" y={316} variant="dark" delay={loc(10.5, 3)} size={46} /><Pill text="6 TO 9:30 PM" y={1130} variant="red" delay={loc(11.6, 3)} size={44} /></>}); };
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const u = clamp01(f / d);
  return P(<><Cam d={d} from={[0, 6, 12]} to={[0, 5, 3]} look={[[0, 5, -8], [0, 3, -8]]} fov0={56} fov1={44} shake={0.6} shakeFrom={0} /><Sky f={f} /><Village frame={f} /><Flock n={40} u={u} frame={f} target={VT} top={16} spread={10} seed={3} /></>,
    {ov: <><CFlash at={[2]} k={0.7} color="#ffffff" len={8} /><Pill text="DROPPING TO THE LIGHTS" y={236} variant="red" delay={loc(13.5, 4)} size={42} /></>, bloom: 1.8}); };
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const t = f / FPS;
  return P(<><Orb d={d} target={[0, 3.2, VZ]} r0={9} r1={6} h0={3} h1={3.4} /><Sky f={f} trees={40} /><Village frame={f} />{[0, 1, 2, 3].map((i) => <Bird key={i} p={[-2 + i * 1.4, 2.2 + 0.3 * Math.sin(f * 0.3 + i), VZ + 2 - i * 0.3]} rot={i} s={1.6} flap={Math.sin(f * 0.8 + i) * 0.6} c={['#5aa0d8', '#d8d8d0', '#8a6a4a', '#d8d0f0'][i]} />)}</>,
    {ov: <><Pill text="KINGFISHERS" y={236} variant="yellow" delay={loc(16.0, 5)} size={44} /><Pill text="HERONS · PIGEONS" y={316} variant="dark" delay={loc(17.0, 5)} size={40} /><Pill text="MOSTLY YOUNG" y={1130} variant="red" delay={loc(18.4, 5)} size={42} /></>}); };
S[6] = () => { const f = useCurrentFrame(); const d = dur(6); const t = f / FPS;
  return P(<><Cam d={d} from={[3, 2.2, 6]} to={[1, 2.4, 2]} look={[[0, 2, VZ + 4], [0, 2, VZ + 4]]} fov0={52} fov1={42} /><Sky f={f} trees={50} /><Village frame={f} />{[0, 1, 2].map((i) => <Man key={i} p={[-1.6 + i * 1.5, height(0, 0), 0 - (i % 2)]} clip="idle" rot={Math.PI + 0.2 * i} t={t + i * 0.3} i={i} s={0.7} />)}</>,
    {pal: WARM, ov: <>{kc(6, 'curse', 19.44, 'curse', 300, 112, 21.4)}<Pill text="LOCALS FEARED A CURSE" y={236} variant="yellow" delay={loc(19.6, 6)} size={42} /></>}); };
S[7] = () => { const f = useCurrentFrame(); const d = dur(7);
  return P(<><Cam d={d} from={[-2, 3, 8]} to={[0, 3.4, 4]} look={[[0, 3, VZ], [0, 3, VZ]]} fov0={58} fov1={46} /><Sky f={f} trees={50} /><Village frame={f} /></>,
    {ov: <><Pill text="1960s" y={236} variant="yellow" delay={loc(21.6, 7)} size={60} /><Stamp f={f} at={loc(22.4, 7)} text="THE WORLD HEARD" y={640} size={90} rot={-4} color="#e8d8a0" /></>}); };
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const u = clamp01(f / d);
  return P(<><Orb d={d} target={VT} a0={0} a1={1.2} r0={14} r1={10} h0={6} h1={4} /><Sky f={f} trees={40} /><Village frame={f} /><Flock n={30} u={u} frame={f} target={VT} seed={11} /></>,
    {ov: <><Pill text="PRESS: BIRD SUICIDE" y={236} variant="red" delay={loc(24.2, 8)} size={46} /></>}); };
S[9] = () => { const f = useCurrentFrame(); const d = dur(9);
  return P(<><Cam d={d} from={[0, 3, 9]} to={[0, 4, 3]} look={[[0, 6, VZ], [0, 6, VZ]]} fov0={56} fov1={40} shake={0.7} shakeFrom={at(0.1)} /><Sky f={f} trees={40} /><Village frame={f} /><Flock n={20} u={0.9} frame={f} target={VT} seed={2} /></>,
    {ov: <><CFlash at={[at(0.1)]} k={0.8} color="#ffffff" len={8} />{kc(9, 'suicide', 26.54, 'suicide', 320, 120, 29.6)}</>, bloom: 1.9}); };
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const u = clamp01(f / d);
  return P(<><Orb d={d} target={[0, 5, VZ]} a0={-0.6} a1={0.5} r0={22} r1={16} h0={14} h1={8} /><Sky f={f} /><Village frame={f} />
    {[0, 1, 2, 3, 4, 5].map((i) => <Glow key={i} position={[-12 + i * 5, 10 + 3 * Math.sin(u * 6 + i), VZ - 4]} size={3 + (i % 2)} color="#a8d8ff" opacity={0.7} />)}</>,
    {ov: <><Pill text="MAGNETIC RIDGE?" y={236} variant="yellow" delay={loc(29.0, 10)} size={46} /><Pill text="OR WIND + FOG?" y={316} variant="dark" delay={loc(31.0, 10)} size={42} /></>}); };
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const t = f / FPS;
  return P(<><Cam d={d} from={[0, 2.2, 11]} to={[0, 2.4, 7.5]} look={[[0, 1.6, 0], [0, 1.6, 0]]} fov0={50} fov1={40} shake={0.8} shakeFrom={2} /><Sky f={f} trees={40} /><Village frame={f} />
    <Man p={[0, height(0, 0) , 0]} clip="idle" rot={Math.PI} t={t} i={1} s={0.8} /><Bird p={[0.6, 1.6, 0.8]} rot={2.6} s={1.8} flap={0.2} c="#e8e8f0" /></>,
    {ov: <><CFlash at={[2, 12]} k={0.9} color="#ffffff" len={9} />{kc(11, 'twist', 34.3, 'twist', 320, 120, 35.3)}</>, bloom: 2.0}); };
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const u = clamp01(f / d);
  return P(<><Cam d={d} from={[0, 3, 7]} to={[0, 4.4, 5]} look={[[0, 2, 0], [0, 6, -4]]} fov0={52} fov1={46} /><Sky f={f} trees={30} />
    <Bird p={[0, 0.9 + u * 6, 0 - u * 6]} rot={Math.PI} s={2.2} flap={Math.sin(f * 0.9)} c="#e8e8f0" /><Bird p={[-2, 0.9 + u * 5, 1 - u * 6]} rot={Math.PI} s={1.8} flap={Math.sin(f * 0.9 + 1)} c="#5aa0d8" /></>,
    {ov: <><Pill text="THEY RECOVERED" y={236} variant="yellow" delay={loc(36.2, 12)} size={46} /><Pill text="AND FLEW AWAY" y={316} variant="dark" delay={loc(37.0, 12)} size={42} /></>}); };
S[13] = () => { const f = useCurrentFrame(); const d = dur(13);
  return P(<><Orb d={d} target={[0, 3, VZ]} r0={14} r1={9} h0={5} h1={3.4} /><Sky f={f} trees={40} /><Village frame={f} /></>,
    {ov: <><Pill text="NOT TRYING TO DIE" y={236} variant="red" delay={loc(39.1, 13)} size={46} /><Stamp f={f} at={loc(39.76, 13)} text="NOT SUICIDE" y={640} size={110} rot={-6} /></>}); };
S[14] = () => { const f = useCurrentFrame(); const d = dur(14);
  return P(<><Cam d={d} from={[0, 3, 16]} to={[0, 4, 10]} look={[[0, 20, -30], [4, 16, -30]]} fov0={60} fov1={52} /><Sky f={f} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <Bird key={i} p={[-14 + i * 4.5 + f * 0.1, 18 + 2 * Math.sin(f * 0.1 + i), -30 + (i % 3) * 2]} rot={-1.57} s={1.6} flap={Math.sin(f * 0.6 + i)} />)}</>,
    {ov: <><Pill text="5-YEAR STUDY" y={236} variant="yellow" delay={loc(40.6, 14)} size={50} /><Pill text="YOUNG MIGRANTS" y={316} variant="dark" delay={loc(41.4, 14)} size={42} /></>}); };
S[15] = () => { const f = useCurrentFrame(); const d = dur(15);
  return P(<><Cam d={d} from={[0, 4, 12]} to={[0, 5, 6]} look={[[0, 22, -30], [0, 26, -30]]} fov0={60} fov1={50} /><Sky f={f} />
    <Glow position={[10, 26, -34]} size={14} color="#f8f4e0" opacity={Math.max(0, 1 - (f / d) * 1.4)} /></>,
    {ov: <>{kc(15, 'NO MOON', 43.5, 'MOON', 310, 120, 45.2)}<Pill text="STEERING BY THE MOON" y={236} variant="yellow" delay={loc(43.7, 15)} size={40} /></>, pal: {...FOG, hor: '#1c2e3c'}}); };
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const u = clamp01(f / d);
  return P(<><Cam d={d} from={[0, 5, 14]} to={[0, 4, 5]} look={[[0, 6, VZ], [0, 4, VZ]]} fov0={62} fov1={44} shake={0.5} shakeFrom={at(0.3)} /><Sky f={f} /><Village frame={f} lit={1.3} /><Flock n={44} u={u} frame={f} target={VT} top={18} spread={11} seed={9} /></>,
    {ov: <><CFlash at={[at(0.1)]} k={0.8} color="#fff0c0" len={8} /><Pill text="ANY LIGHT PULLS THEM IN" y={236} variant="red" delay={loc(47.6, 16)} size={42} /></>, bloom: 1.9}); };
S[17] = () => { const f = useCurrentFrame(); const d = dur(17); const t = f / FPS;
  return P(<><Cam d={d} from={[-4, 2.4, 8]} to={[0, 2.8, 3.4]} look={[[0, 2, 0], [0, 2.4, 0]]} fov0={56} fov1={40} /><Sky f={f} trees={40} mist={0.4} /><Village frame={f} />
    {[0, 1, 2].map((i) => <group key={i}><Man p={[-2 + i * 2, height(0, 0), 0]} clip="idle" rot={Math.PI + 0.3 * i} t={t + i * 0.3} i={i + 1} s={0.8} /><Glow position={[-1.6 + i * 2, 2, 0.6]} size={2.2} color="#ffb040" opacity={0.9} /><Bx p={[-1.4 + i * 2, 2.2, 0.2]} s={[0.06, 3, 0.06]} c="#9a8a50" r={[0, 0, 0.3]} /></group>)}</>,
    {pal: WARM, ov: <><Pill text="TORCHES + BAMBOO POLES" y={236} variant="red" delay={loc(50.0, 17)} size={40} />{kc(17, 'torches', 49.76, 'torches', 300, 100, 52.0)}</>}); };
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const u = clamp01(f / d);
  return P(<><Cam d={d} from={[0, 2, 14]} to={[0, 4, 6]} look={[[0, 9, -8], [0, 5, -8]]} fov0={70} fov1={56} /><Sky f={f} /><Village frame={f} /><Flock n={30} u={0.3 + u * 0.7} frame={f} target={VT} top={16} /></>,
    {ov: <><Pill text="SUICIDE... OR A TRAP?" y={1130} variant="red" delay={2} size={44} /><EndCard delay={2} sources={['WIKIPEDIA', 'INDIAN FORESTER 2001', 'TIMES OF INDIA 2024']} /></>, bloom: 1.7}); };

export const Jb = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? JB_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
