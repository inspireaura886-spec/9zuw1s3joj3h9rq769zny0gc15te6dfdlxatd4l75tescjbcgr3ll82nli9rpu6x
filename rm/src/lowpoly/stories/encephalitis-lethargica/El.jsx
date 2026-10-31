// "500,000 Dead. Then It Vanished" (encephalitis lethargica 1917-1927) - low-poly 3D Short, ward of frozen Rigged patients. 22 scenes on cues.json cuts.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, Particles, FogLayer, Rigged, Glow, Grade, KineticCard, cueLine, clamp01, usePreload} from '../../kit/index.js';
import {PhotoCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx} from '../uvb-76/world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const EL_FRAMES = Math.round((VO.dur + 0.3) * FPS);
const W = VO.words;
const CS = [0.0, 2.6, 5.1, 7.3, 9.7, 12.0, 14.3, 16.6, 19.4, 22.3, 24.9, 27.5, 29.9, 32.7, 35.4, 37.9, 40.5, 43.0, 45.5, 47.9, 50.3, 52.8];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? EL_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);
const Man = ({p, clip = 'idle', rot = 0, s = 0.6, t = 0, i = 0}) => <Rigged path={RIG[i % 4]} time={t} clips={[{name: clip, from: 0}]} position={[p[0], p[1], p[2]]} rotation={[0, rot, 0]} scale={s} />;

const PAL = (mid, hor, sky, rim) => ({top: '#04060c', mid, hor, fog: mid, amb: 1.0, hemiSky: sky, hemiGround: '#1c2026', hemiI: 1.9, sun: '#d8e4ff', sunI: 1.5, sunPos: [-10, 20, 12], rim, rimI: 1.1, rimPos: [0, 8, -20], glow: 1});
const WARD = PAL('#10202c', '#2c4a5c', '#b8d8f0', '#7ad0ff');
const RED = PAL('#2a0c10', '#a8302a', '#ffc0b0', '#ff4a3a');
const GRN = PAL('#0a2420', '#2a7a5a', '#a0f0d0', '#40ffa0');
const WARM = PAL('#2a1c14', '#8a5a38', '#ffd8a8', '#ffa050');
const PURP = PAL('#1a1030', '#5a3a8a', '#d0b0ff', '#c070ff');
const DIM = PAL('#18283a', '#3a5a74', '#b8d8f0', '#7ad0ff');
const BLK = PAL('#06080c', '#10161c', '#7a8a9a', '#5a7a9a');

const Room = ({f, w = 26}) => <group><Bx p={[0, -0.1, -4]} s={[w, 0.2, 18]} c="#3a4650" /><Bx p={[0, 4, -13]} s={[w, 9, 0.3]} c="#566872" /><Bx p={[-w / 2, 4, -4]} s={[0.3, 9, 18]} c="#4a5a64" />
  {[-10, -6, -2, 2, 6, 10].map((x, i) => <Bx key={i} p={[x, 4.6, -12.8]} s={[1.6, 2.4, 0.1]} c="#a8c8e8" e="#6aa0d0" />)}
  <FogLayer y={0.8} size={60} layers={2} thickness={1} color="#8ab0c8" opacity={0.1} frame={f} center={[0, -4]} /></group>;
const Bed = ({p, c = '#d8dce0'}) => <group position={p}><Bx p={[0, 0.35, 0]} s={[1.5, 0.3, 3.2]} c="#6a747c" /><Bx p={[0, 0.6, 0]} s={[1.4, 0.2, 3.0]} c={c} /><Bx p={[0, 0.8, -1.2]} s={[1.0, 0.2, 0.6]} c="#f0f0f0" /></group>;
const Ward = ({f, n = 5, frozen = true, glow = false}) => <group><Room f={f} />
  {Array.from({length: n}, (_, i) => { const x = -9 + i * (18 / Math.max(1, n - 1)); return <group key={i}><Bed p={[x, 0, -7]} /><Man p={[x, 0.95, -7.2]} clip="idle" rot={Math.PI} t={frozen ? 0 : f / FPS + i * 0.3} i={i} s={0.55} />{glow && <Glow position={[x, 2, -7]} size={3.2} color="#9ad8ff" opacity={0.25} />}</group>; })}</group>;
const Statues = ({f, n = 5, z = 0, tint}) => <group>{Array.from({length: n}, (_, i) => { const x = (i - (n - 1) / 2) * 2.2; return <group key={i}><Man p={[x, 0, z]} clip="idle" t={0} rot={0.2 * (i - 2)} i={i} s={0.8} />{tint && <Glow position={[x, 1.4, z]} size={2.6} color={tint} opacity={0.22} />}</group>; })}</group>;
const Floor = ({c = '#1c2630'}) => <Bx p={[0, -0.1, 0]} s={[60, 0.2, 40]} c={c} />;
const Orb = ({p, s = 1, c = '#ff6a50', e = '#ff3020', ei = 0.6}) => <mesh position={p} scale={s}><icosahedronGeometry args={[1, 0]} /><meshLambertMaterial color={c} flatShading emissive={e} emissiveIntensity={ei} /></mesh>;
const Globe = ({f, u = 1}) => <group><mesh position={[0, 3, -2]} rotation={[0.3, f * 0.012, 0]}><icosahedronGeometry args={[4, 2]} /><meshLambertMaterial color="#2a5a8a" flatShading emissive="#0a2a4a" emissiveIntensity={0.7} /></mesh>
  {Array.from({length: 34}, (_, i) => { const a = i * 2.4 + f * 0.012, b = Math.sin(i * 1.7) * 1.1, lit = i / 34 < u; return lit ? <Glow key={i} position={[Math.cos(a) * Math.cos(b) * 4.1, 3 + Math.sin(b) * 4.1, -2 + Math.sin(a) * Math.cos(b) * 4.1]} size={0.9} color="#ff4a3a" opacity={0.9} /> : null; })}</group>;
const Dots = ({f, n = 90, dead = 0.5}) => <group>{Array.from({length: n}, (_, i) => { const x = (i % 15 - 7) * 1.0, z = (Math.floor(i / 15) - 3) * 1.0; const d = i / n < dead; return <group key={i}><Bx p={[x, 0.3, z]} s={[0.7, 0.5, 0.7]} c={d ? '#1a1a1e' : '#c8a090'} e={d ? '#000' : '#a05040'} /></group>; })}</group>;
const Tissue = ({f, c = '#d8a0b0', spots = 0, spotC = '#40ff80', n = 22}) => <group>
  {Array.from({length: n}, (_, i) => { const a = i * 2.39, r = 0.7 + (i % 5) * 0.6; return <Orb key={i} p={[Math.cos(a) * r * 1.6, 1.6 + Math.sin(a * 1.3) * 1.4, Math.sin(a) * r * 0.8]} s={0.55 + (i % 3) * 0.2} c={c} e="#502030" ei={0.3} />; })}
  {Array.from({length: spots}, (_, i) => { const a = i * 1.7 + f * 0.03; return <Orb key={'s' + i} p={[Math.cos(a) * 2.6, 1.6 + Math.sin(a * 2) * 1.2, Math.sin(a) * 1.4 + 1.2]} s={0.22} c={spotC} e={spotC} ei={1.2} />; })}</group>;

const S = [];
const mk = (i, {pal, fog = [30, 120], pills = [], cam, children, flash = [], extra = null, bloom = 1.4, card = null}) => { S[i] = () => { const f = useCurrentFrame(); const d = dur(i);
  return <Stage palette={pal} fog={fog} overlay={<>{pills.map(([t, y, v, s, sec], k) => <Pill key={k} text={t} y={y} variant={v} delay={loc(sec, i)} size={s} />)}{flash.map((s, k) => <CFlash key={k} at={[loc(s, i)]} k={0.5} color="#ffffff" len={6} />)}{card && card(f, d)}{extra && extra(f, d)}</>}>
    {cam(d)}{children(f, d)}<Post bloom={bloom} threshold={0.4} vignette={0.42} /></Stage>; }; };
const push = (from, to, look, d, fov = [58, 46], shake = 0) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={d} ease="inout" shake={shake} shakeFrom={0} shakeLen={d} />;
const orbit = (t, a0, a1, r0, r1, h0, h1, d) => <ShotCam preset="orbit" target={t} a0={a0} a1={a1} r0={r0} r1={r1} h0={h0} h1={h1} fov0={52} fov1={44} start={0} end={d} ease="inout" />;

mk(0, {pal: WARD, pills: [['500,000 DEAD', 236, 'red', 62, 0.0], ['THEN IT VANISHED', 316, 'yellow', 48, 0.5]], flash: [0.1], cam: (d) => push([0.9, 1.9, -3.6], [0.1, 1.7, -5.6], [[0, 1.45, -7.2], [0, 1.45, -7.2]], d, [52, 40], 0.5), children: (f) => <Ward f={f} glow />, extra: () => kc(0, '1917', 0.2, '1917', 440, 90, 2.4)});
mk(1, {pal: WARD, pills: [['VIENNA', 236, 'yellow', 54, 2.8], ['1917', 316, 'dark', 50, 3.6]], cam: (d) => orbit([0, 1.4, -7], -0.5, 0.4, 13, 9, 4, 3, d), children: (f) => <Ward f={f} n={5} />});
mk(2, {pal: WARD, pills: [['AWAKE', 236, 'yellow', 54, 5.8], ['BUT FROZEN', 316, 'red', 52, 6.4]], cam: (d) => push([-6, 1.8, 5], [-1, 1.5, 2], [[0, 1.1, 0], [0, 1.1, 0]], d, [54, 40]), children: (f) => <><Floor /><Statues f={f} n={4} tint="#9ad8ff" /></>});
mk(3, {pal: BLK, pills: [['SPEECHLESS', 236, 'yellow', 52, 8.0], ['MOTIONLESS', 316, 'red', 52, 8.7]], cam: (d) => push([0, 2, 10], [0, 2, 7], [[0, 1.5, 0], [0, 1.5, 0]], d, [50, 44]), children: () => <Floor c="#101418" />, card: (f, d) => <PhotoCard src="encephalitis/IMG4.jpg" credit="Encephalitis lethargica patient (public domain)" tag="REAL PATIENT" delay={0} dur={d} />});
mk(4, {pal: RED, pills: [['10 YEARS', 236, 'yellow', 54, 10.0], ['WHOLE WORLD', 316, 'red', 52, 10.8]], flash: [10.1], cam: (d) => orbit([0, 3, -2], 0.0, 0.8, 14, 11, 4, 4, d), children: (f, d) => <Globe f={f} u={clamp01(f / (d * 0.8))} />});
mk(5, {pal: RED, pills: [['1,000,000+', 236, 'red', 64, 11.9], ['FELL ILL', 316, 'yellow', 50, 12.8]], flash: [12.0], cam: (d) => push([0, 9, 11], [0, 6, 6], [[0, 0, 0], [0, 0, 0]], d, [58, 46]), children: (f) => <><Floor /><Dots f={f} dead={0.0} /></>});
mk(6, {pal: BLK, pills: [['500,000+', 236, 'red', 66, 14.3], ['DIED', 316, 'dark', 60, 15.2]], flash: [14.4, 15.0], cam: (d) => push([0, 9, 11], [0, 5, 5], [[0, 0, 0], [0, 0, 0]], d, [58, 44]), children: (f, d) => <><Floor c="#0c0e12" /><Dots f={f} dead={clamp01(f / (d * 0.7)) * 0.55} /></>});
mk(7, {pal: WARM, pills: [['SURVIVORS', 236, 'yellow', 52, 16.8], ['NEVER RECOVER', 316, 'red', 44, 17.6]], cam: (d) => orbit([0, 1, 0], 0.6, -0.3, 8, 6, 2.6, 2.0, d), children: (f) => <><Floor /><Statues f={f} n={3} tint="#ffb060" /></>});
mk(8, {pal: PURP, pills: [['1927', 236, 'yellow', 70, 19.5], ['IT STOPS', 316, 'red', 56, 20.4]], flash: [19.5], cam: (d) => push([0, 2.4, 10], [0, 2.8, 5], [[0, 2, 0], [0, 2, 0]], d, [58, 44], 0.3), children: (f, d) => <><Floor /><Statues f={f} n={5} tint="#c070ff" /><Glow position={[0, 3, -3]} size={Math.max(1, 14 * (1 - f / d))} color="#c070ff" opacity={0.4} /></>});
mk(9, {pal: BLK, pills: [['NO CURE', 236, 'dark', 56, 22.4], ['NO KNOWN CAUSE', 316, 'red', 44, 23.2]], cam: (d) => orbit([0, 1, 0], 0.0, 0.7, 9, 7, 3, 2.4, d), children: (f) => <><Floor c="#0c0e12" /><Statues f={f} n={3} /><Glow position={[0, 4, 0]} size={6} color="#5a7a9a" opacity={0.2} /></>});
mk(10, {pal: DIM, pills: [['IT JUST', 236, 'yellow', 54, 24.9], ['VANISHES', 316, 'red', 62, 23.8 + 1.4]], flash: [25.6], cam: (d) => push([0, 2.6, 10], [0, 2.2, 6], [[0, 1.4, 0], [0, 1.4, 0]], d, [56, 44]), children: (f, d) => { const k = clamp01(f / (d * 0.9)); return <><Floor c="#1c2a38" />{[0, 1, 2, 3, 4].map((i) => k < 0.2 + i * 0.16 ? <Man key={i} p={[(i - 2) * 2.2, 0, 0]} t={0} i={i} s={0.8} rot={0.1 * i} /> : null)}<Glow position={[0, 2, 0]} size={4 + 6 * (1 - k)} color="#9ad8ff" opacity={0.35} /></>; }});
mk(11, {pal: GRN, pills: [['SPANISH FLU?', 236, 'yellow', 52, 27.6]], cam: (d) => orbit([0, 2, 0], 0.4, -0.4, 10, 7, 4, 3, d), children: (f) => <><Floor /><Orb p={[0, 2, 0]} s={2.0} c="#4aa86a" e="#40ff80" ei={0.8} />{[0, 1, 2, 3, 4, 5, 6].map((i) => <Orb key={i} p={[Math.cos(i * 0.9 + f * 0.03) * 3, 2 + Math.sin(i * 1.3 + f * 0.04), Math.sin(i * 0.9 + f * 0.03) * 3]} s={0.45} c="#6adc8a" e="#40ff80" ei={0.9} />)}</>});
mk(12, {pal: WARD, pills: [['1920s BRAIN TISSUE', 236, 'yellow', 44, 30.0], ['NO FLU VIRUS', 316, 'red', 56, 31.1]], flash: [31.0], bloom: 1.6, cam: (d) => push([0, 3, 12], [0, 2.4, 6], [[0, 1.6, 0], [0, 1.6, 0]], d, [54, 42]), children: (f) => <><Floor c="#10161c" /><Tissue f={f} /></>});
mk(13, {pal: WARM, pills: [['2004', 236, 'yellow', 70, 32.9]], flash: [32.8], cam: (d) => push([6, 4, 11], [2, 2.6, 6], [[0, 1.2, 0], [0, 1.2, 0]], d, [56, 44]), children: (f) => <><Floor /><Statues f={f} n={3} /><Glow position={[0, 3, -2]} size={10} color="#ffb060" opacity={0.2} /></>});
mk(14, {pal: GRN, pills: [['STREP', 236, 'red', 64, 35.0], ['BACTERIA', 316, 'yellow', 52, 35.6]], cam: (d) => orbit([0, 2, 0], 0.0, 0.8, 8, 5.5, 3.4, 2.4, d), children: (f) => <><Floor /><Tissue f={f} c="#c89aa8" spots={16} spotC="#c8ff40" /></>});
mk(15, {pal: RED, pills: [['IMMUNE SYSTEM', 236, 'yellow', 48, 38.0], ['ATTACKS THE BRAIN', 316, 'red', 42, 38.9]], flash: [38.0], cam: (d) => orbit([0, 2, 0], 0.6, -0.2, 8, 5.5, 3.2, 2.2, d), children: (f) => <><Floor /><Tissue f={f} c="#d89090" spots={24} spotC="#ff3a2a" /></>});
mk(16, {pal: PURP, pills: [['2012', 236, 'yellow', 70, 40.6], ['ENTEROVIRUS', 316, 'red', 50, 42.2]], flash: [40.6], cam: (d) => push([0, 3, 12], [0, 2.4, 6], [[0, 1.6, 0], [0, 1.6, 0]], d, [56, 44]), children: (f) => <><Floor c="#10161c" /><Tissue f={f} c="#b8a0c8" spots={14} spotC="#e070ff" /></>});
mk(17, {pal: WARD, pills: [['OLD TISSUE', 236, 'yellow', 54, 43.2]], cam: (d) => orbit([0, 2, 0], -0.4, 0.4, 9, 6, 3.4, 2.6, d), children: (f) => <><Floor c="#10161c" /><Tissue f={f} c="#c8b8a8" spots={8} spotC="#e070ff" /></>, card: (f, d) => f > at(1.0) ? <PhotoCard src="encephalitis/IMG5.jpg" credit="Wellcome Collection (CC BY 4.0)" tag="ARCHIVE" delay={at(1.0)} dur={d - at(1.0)} /> : null});
mk(18, {pal: DIM, pills: [['FLU?', 236, 'yellow', 52, 45.5], ['STREP?', 316, 'yellow', 52, 46.1], ['A VIRUS?', 396, 'yellow', 52, 46.6]], flash: [45.4], cam: (d) => orbit([0, 1.5, 0], 0, 0.6, 14, 11, 4, 3.6, d), children: (f) => <><Floor c="#1c2a38" />{[-4, 0, 4].map((x, i) => <group key={i}><Bx p={[x, 0.4, 0]} s={[2.2, 0.8, 2.2]} c="#2a3038" /><Orb p={[x, 1.8, 0]} s={0.9} c={['#4aa86a', '#c8ff40', '#e070ff'][i]} e={['#40ff80', '#c8ff40', '#e070ff'][i]} ei={0.9} /></group>)}</>});
mk(19, {pal: RED, pills: [['OR A BODY', 236, 'yellow', 52, 47.9], ['TURNING ON ITSELF?', 316, 'red', 40, 48.6]], cam: (d) => push([0, 3, 9], [0, 2.4, 4], [[0, 1.5, 0], [0, 1.5, 0]], d, [56, 44], 0.4), children: (f) => <><Floor /><Statues f={f} n={1} tint="#ff4a3a" />{Array.from({length: 12}, (_, i) => <Orb key={i} p={[Math.cos(i * 0.52 + f * 0.05) * 2.4, 1.4 + Math.sin(i * 2 + f * 0.06) * 0.9, Math.sin(i * 0.52 + f * 0.05) * 2.4]} s={0.25} c="#ff5a4a" e="#ff2a1a" ei={1.0} />)}</>});
mk(20, {pal: BLK, pills: [['THE CAUSE', 236, 'yellow', 56, 50.3], ['STILL UNKNOWN', 316, 'red', 54, 50.9]], flash: [50.8], cam: (d) => orbit([0, 1, 0], 0.5, -0.3, 9, 7, 3, 2.4, d), children: (f) => <><Floor c="#0c0e12" /><Statues f={f} n={4} /><Glow position={[0, 4, 0]} size={8} color="#7ad0ff" opacity={0.2} /></>});
mk(21, {pal: WARD, cam: (d) => push([0, 2.6, 9], [0, 2.55, 8.9], [[0, 1.2, -7], [0, 1.2, -7]], d, [70, 70]), children: (f) => <Ward f={f} glow />, extra: () => <><Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(54.0, 21)} size={46} /><EndCard delay={loc(54.0, 21)} sources={['WIKIPEDIA: ENCEPHALITIS LETHARGICA', 'BBC 2004', 'NINDS']} /></>});

export const El = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? EL_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.2} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
