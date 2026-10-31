// nottrue Short: replacement-1 'The Wishing Well Gave Everything Back' (folklore bargain). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Fog, NightSky, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp, rnd} from '../World.jsx';
import VO from '../data/replacement-1.vo.json';

const A = '#8fb8ff';
const GOLD = '#ffd45a';
const GY = 1500; // ground

const House = ({x, h = 420, w = 300, lit = false, id}) => <g transform={`translate(${x} ${GY})`}>
  <rect x={-w / 2} y={-h} width={w} height={h} fill="#10131c" stroke="#1d2230" strokeWidth={8} />
  <path d={`M${-w / 2 - 30} ${-h} L0 ${-h - 150} L${w / 2 + 30} ${-h} Z`} fill="#0c0e15" stroke="#1d2230" strokeWidth={8} />
  <rect x={-40} y={-h + 120} width={80} height={90} fill={lit ? '#ffcf80' : '#161a26'} opacity={lit ? 0.85 : 1} />
</g>;

const Well = ({t, glow = 0.6, rise = 0, item = null, bucket = 0, ripple = 0, x = 540}) => <g transform={`translate(${x} ${GY}) scale(1.25)`}>
  <Glow x={0} y={-150} r={520} color={A} op={glow * 0.55} id={`wg${Math.round(x)}`} />
  {/* posts + roof */}
  <line x1={-120} y1={-170} x2={-120} y2={-420} stroke="#2a2f3f" strokeWidth={22} strokeLinecap="round" />
  <line x1={120} y1={-170} x2={120} y2={-420} stroke="#2a2f3f" strokeWidth={22} strokeLinecap="round" />
  <path d="M-190 -410 L0 -520 L190 -410 Z" fill="#12151f" stroke="#2a2f3f" strokeWidth={10} strokeLinejoin="round" />
  <line x1={-120} y1={-330} x2={120} y2={-330} stroke="#3a4054" strokeWidth={14} />
  {bucket > 0 && <g transform={`translate(0 ${-330 + bucket * 150})`}>
    <line x1={0} y1={0} x2={0} y2={-bucket * 150 + 40} stroke="#6a5a40" strokeWidth={6} />
    <path d="M-44 0 L44 0 L34 70 L-34 70 Z" fill="#3a2e22" stroke="#8a7050" strokeWidth={6} /></g>}
  {/* stone ring */}
  <ellipse cx={0} cy={-150} rx={190} ry={50} fill="#080a12" stroke="#3a4054" strokeWidth={16} />
  <ellipse cx={0} cy={-150} rx={160} ry={34} fill={A} opacity={0.35 + glow * 0.4} />
  {ripple > 0 && [0, 1, 2].map(i => { const k = ((ripple * 1.6 + i * 0.33) % 1); return <ellipse key={i} cx={0} cy={-150} rx={30 + k * 140} ry={8 + k * 26} fill="none" stroke="#e8f0ff" strokeWidth={5 * (1 - k)} opacity={1 - k} />; })}
  <path d="M-190 -150 L-190 0 L190 0 L190 -150" fill="#1a1e2c" stroke="#3a4054" strokeWidth={14} />
  {[0, 1, 2, 3].map(i => <line key={i} x1={-190 + i * 95} y1={-110} x2={-190 + i * 95} y2={0} stroke="#2a2f3f" strokeWidth={6} />)}
  {/* item rising out of the well */}
  {item === 'key' && <g transform={`translate(0 ${-150 - rise * 380}) rotate(${rise * 40})`}>
    <Glow x={0} y={0} r={160} color={GOLD} op={0.8} id="keyg" />
    <circle cx={-26} cy={0} r={26} fill="none" stroke={GOLD} strokeWidth={14} /><line x1={0} y1={0} x2={80} y2={0} stroke={GOLD} strokeWidth={14} strokeLinecap="round" />
    <line x1={60} y1={0} x2={60} y2={22} stroke={GOLD} strokeWidth={12} /><line x1={80} y1={0} x2={80} y2={22} stroke={GOLD} strokeWidth={12} /></g>}
  {item === 'cup' && <g transform={`translate(0 ${-150 - rise * 380})`}>
    <Glow x={0} y={0} r={140} color="#fff2c4" op={0.6} id="cupg" />
    <path d="M-40 -34 L40 -34 L30 34 L-30 34 Z" fill="#cbb89a" stroke="#fff2c4" strokeWidth={6} /><path d="M40 -18 Q70 -14 40 14" fill="none" stroke="#cbb89a" strokeWidth={10} /></g>}
</g>;

const Village = ({t, sky = 0, children, well = {}, stars = true, dawn = 0}) => <g>
  <NightSky h={1500} t={t} top={dawn ? '#1a2038' : '#05060c'} bot={dawn ? '#6a4a52' : '#151a2c'} stars={stars ? 60 : 0} moon={dawn ? null : [830, 330]} id={`sk${dawn ? 'd' : 'n'}`} />
  <House x={60} h={440} lit /><House x={1020} h={380} w={340} lit={!dawn} /><House x={-300} h={400} /><House x={1330} h={430} lit />
  <rect x={-600} y={GY} width={2300} height={1200} fill="#0d1019" />
  <path d={`M-600 ${GY + 4} L1700 ${GY + 4}`} stroke="#1c2133" strokeWidth={8} />
  <Fog t={t} y={GY - 30} h={160} op={0.13} color={A} speed={14} n={4} seed={3} />
  <Well t={t} {...well} />
  {children}
</g>;

const Flower = ({x, k}) => <g transform={`translate(${x} ${GY}) scale(${k})`}><line x1={0} y1={0} x2={0} y2={-70} stroke="#4a8a5a" strokeWidth={8} /><circle cx={0} cy={-82} r={18} fill={A} /><circle cx={0} cy={-82} r={7} fill={GOLD} /></g>;

const Crowd = ({f, xs, pose = 'frozen', s = 1.0, smile = 1, rim = A, headFill = '#e4eeff', ink = '#e4eeff'}) => <g>
  {xs.map((x, i) => <ThickStickMan key={i} x={x} y={GY + (i % 2) * 22} s={s} pose={pose} t={f} facing={i % 2 ? 1 : -1} eyes="wide" blink={false} smile={smile} rim={rim} head={headFill} ink={ink} />)}
</g>;

const W = VO.words;
export const WW_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const WishingWell = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const L = VO.line_starts; const E = VO.dur + 0.6;
  const b = (i) => (L[i] !== undefined ? L[i] : E);
  const T = f / fps;
  const cam = (a, z0, z1, x0 = 540, x1 = 540, y = 1080) => ({cam: [[0, x0, y, z0], [Math.max(1, a), x1, y, z1]]});
  const scenes = [
    // 0 hook: well + golden key floats out
    {a: 0, b: b(1), ...cam(b(1), 1.5, 1.2, 540, 540, 1050), draw: (t) => <Village t={t} well={{glow: 1, item: 'key', rise: ramp(t, 0.2, 2.2)}}><ThickStickMan x={300} y={GY} s={1.05} pose="stand" t={f} facing={1} look={0} eyes="wide" rim={A} /></Village>},
    // 1 Tomas drops the key, gold comes up; then cup
    {a: b(1), b: b(2), ...cam(b(2) - b(1), 1.5, 1.8, 480, 540, 1080), draw: (t) => {
      const T2 = b(1) + t, keyT = T2 < 7.8; const rise = keyT ? ramp(T2, 7.76, 8.5) : ramp(T2, 9.3, 10.2);
      return <Village t={t} well={{glow: 0.9, item: keyT ? 'key' : 'cup', rise: (T2 > 8.4 && T2 < 9.2) ? 1 - ramp(T2, 8.6, 9.0) : rise, ripple: ramp(t, 0.9, 1.6) * (T2 < 8 ? 1 : 0)}}>
        <ThickStickMan x={290} y={GY} s={1.1} pose={T2 < 7.2 ? 'reach' : 'wave'} t={f} facing={1} eyes="wide" mouth={0} rim={A} /></Village>; }},
    // 2 village lines up, flowers bloom, clocks tick
    {a: b(2), b: b(3), ...cam(b(3) - b(2), 1.2, 1.5, 420, 640, 1100), draw: (t) => {
      const k = ramp(t, 1.6, 3.2);
      return <Village t={t} well={{glow: 0.8}}>
        {[80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960].map((x, i) => <Flower key={i} x={x + (i % 3) * 14} k={k * (0.7 + (i % 3) * 0.15)} />)}
        {[0, 1, 2, 3, 4].map(i => <ThickStickMan key={i} x={1300 - i * 190 - Math.min(t, 3) * 90 * (1 - i * 0.05)} y={GY} s={1.0} pose={t < 3.5 ? 'walk' : 'stand'} t={f + i * 7} facing={-1} eyes="normal" rim={A} />)}
        <g transform="translate(150 1050)"><circle r={60} fill="#10131c" stroke={GOLD} strokeWidth={10} /><line x1={0} y1={0} x2={0} y2={-38} stroke={GOLD} strokeWidth={7} transform={`rotate(${t * 360})`} /><line x1={0} y1={0} x2={26} y2={0} stroke={GOLD} strokeWidth={7} /></g>
      </Village>; }},
    // 3 sister leans too far, splash, no scream
    {a: b(3), b: b(4), cam: [[0, 480, 1200, 1.4], [3.2, 540, 1180, 1.7], [5.7, 540, 1220, 2.0]], shake: (t) => (t > 3.2 && t < 3.6 ? 0.9 : 0.1), draw: (t) => {
      const fall = ramp(t, 3.0, 3.7);
      return <Village t={t} well={{glow: 0.7 + 0.3 * ramp(t, 3.2, 3.5), ripple: ramp(t, 3.3, 5.5)}}>
        <ThickStickMan x={400} y={GY} s={1.05} pose="frozen" t={f} facing={1} eyes="wide" brow={1} rim={A} />
        {t < 3.7 && <ThickStickMan x={410 + 90 * ramp(t, 0, 3.0) + 60 * fall} y={GY - 300 * fall} s={1.0} pose={[ 'lean', 'reach', fall]} t={f} facing={1} rot={50 * fall} eyes="wide" rim={A} grounded={fall === 0} />}
      </Village>; }},
    // 4 dawn, bucket heavy, sister inside smiling
    {a: b(4), b: b(5), cam: [[0, 540, 1150, 1.4], [3.2, 540, 1130, 1.6], [5.8, 540, 1100, 2.1]], draw: (t) => {
      const up = ramp(t, 0.3, 2.8);
      return <Village t={t} dawn={1} stars={false} well={{glow: 0.4, bucket: 1 - up * 0.1}}>
        <g opacity={ramp(t, 2.6, 3.3)}><ThickStickMan x={540} y={GY - 360} s={0.7} pose="sit" t={f} facing={1} eyes="normal" smile={1} blink={false} grounded={false} rim={A} head="#e4eeff" ink="#e4eeff" /></g>
        <ThickStickMan x={300} y={GY} s={1.05} pose={[ 'stand', 'scared', ramp(t, 3.0, 4.0)]} t={f} facing={1} eyes="wide" brow={1} rim={A} />
      </Village>; }},
    // 5 mother weeps with joy, Tomas notices her unblinking eyes
    {a: b(5), b: b(6), cam: [[0, 700, 1250, 1.4], [3.2, 760, 1250, 1.7], [6.0, 780, 1180, 2.4]], draw: (t) => <Village t={t} dawn={1} stars={false} well={{glow: 0.3}}>
      <ThickStickMan x={730} y={GY} s={1.05} pose="hug" t={f} facing={1} eyes="closed" smile={1} rim="#ffe2b0" />
      <ThickStickMan x={830} y={GY} s={1.0} pose="stand" t={f} facing={-1} eyes="wide" blink={false} smile={1} rim={A} head="#e4eeff" ink="#e4eeff" />
      <ThickStickMan x={300} y={GY} s={1.05} pose={['stand', 'lookback', ramp(t, 2.5, 3.2)]} t={f} facing={1} look={ramp(t, 2.5, 3.5) * 0.9} eyes="wide" brow={1} rim={A} />
    </Village>},
    // 6 baker whispers
    {a: b(6), b: b(7), cam: [[0, 520, 1230, 1.5], [5.7, 600, 1230, 2.0]], draw: (t) => <Village t={t} dawn={1} stars={false} well={{glow: 0.3}}>
      <ThickStickMan x={420} y={GY} s={1.1} pose={['stand', 'lean', 0.8]} t={f} facing={1} look={0.1} eyes="wide" brow={1} rim={A} />
      <ThickStickMan x={650} y={GY} s={1.1} pose="talk" t={f} facing={-1} eyes="normal" mouth={0.5 + 0.4 * Math.sin(t * 10)} rim="#ffe2b0" />
      <g transform="translate(650 1010)"><rect x={-34} y={-34} width={68} height={34} rx={8} fill="#f1ede2" stroke="#ccc" strokeWidth={4} /></g>
    </Village>},
    // 7 square full of identical smiles
    {a: b(7), b: b(8), cam: [[0, 200, 1250, 1.2], [3.0, 540, 1250, 1.45], [6.3, 900, 1250, 1.8]], draw: (t) => <Village t={t} dawn={1} stars={false} well={{glow: 0.3}}>
      <Crowd f={f} xs={[-40, 140, 320, 700, 880, 1060, 1240]} s={1.0} />
      <ThickStickMan x={500} y={GY} s={1.1} pose={['stand', 'lookback', 0.6]} t={f} facing={1} look={Math.sin(t * 0.8) * 0.7} eyes="wide" brow={1} rim={A} />
    </Village>},
    // 8 warn travellers
    {a: b(8), b: b(9), cam: [[0, 600, 1230, 1.3], [3.2, 700, 1230, 1.8]], shake: 0.15, draw: (t) => <Village t={t} well={{glow: 0.9}}>
      <Crowd f={f} xs={[820, 960, 1100, 1240]} s={1.0} />
      <ThickStickMan x={300 + 60 * ramp(t, 0, 1.4)} y={GY} s={1.1} pose={t < 1.2 ? 'walk' : 'point'} t={f} facing={1} eyes="wide" mouth={0.3 + 0.3 * Math.sin(t * 10)} brow={1} rim={A} />
    </Village>},
    // 9 loop: back to frame 0
    {a: b(9), b: E + 10, ...cam(6, 1.2, 1.5, 540, 540, 1050), draw: (t) => <Village t={t} well={{glow: 1, item: 'key', rise: ramp(t, 4.0, 6.0)}}><ThickStickMan x={300} y={GY} s={1.05} pose="stand" t={f} facing={1} eyes="wide" rim={A} /></Village>},
  ];
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  const first = [{a: -10, b: 60, cam: [[0, 540, 1050, 1.5]], draw: (t) => <Village t={0} well={{glow: 1, item: 'key', rise: ramp(0.0 + 0.2, 0.2, 2.2)}}><ThickStickMan x={300} y={GY} s={1.05} pose="stand" t={0} facing={1} eyes="wide" rim={A} /></Village>}];
  return <AbsoluteFill style={{background: '#07080c'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={first} /></AbsoluteFill>}
    <ScreenFlash times={[0, 5.5, 8.24, 21.9, 25.9, 32.7, 44.6]} color={A} max={0.4} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'THE WELL', accent: true, size: 104}, {txt: 'GIVES BACK'}, {txt: 'EVERYTHING'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
