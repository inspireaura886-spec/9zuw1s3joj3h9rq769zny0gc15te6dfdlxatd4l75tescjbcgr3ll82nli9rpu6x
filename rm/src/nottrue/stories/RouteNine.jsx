// nottrue Short: route-9 (twist ending). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, NightSky, Fog, Glow, Cone, Paper, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp, clamp, rnd} from '../World.jsx';
import VO from '../data/route-9.vo.json';

const A = '#ffd400';
const WARM = '#ffe9a8';
const OLD = '#f3dfb4';

// ---------- bus seen from outside (travels left) ----------
const BusSide = ({x, y, s = 1, lit = 1, empty = true, t = 0}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-420} y={-330} width={840} height={300} rx={34} fill="#1a1d28" stroke="#2c3040" strokeWidth={10} />
  <rect x={-420} y={-90} width={840} height={60} fill="#11131b" />
  <rect x={-330} y={-312} width={160} height={46} rx={8} fill="#0b0c11" stroke={A} strokeWidth={5} />
  <text x={-250} y={-276} textAnchor="middle" fontFamily="Special Elite" fontSize={34} fill={A}>ROUTE 9</text>
  {Array.from({length: 6}, (_, i) => <rect key={i} x={-380 + i * 130} y={-240} width={100} height={110} rx={10} fill={lit ? WARM : '#0b0c11'} opacity={lit ? 0.55 + 0.1 * Math.sin(t * 5 + i) : 1} stroke="#0b0c11" strokeWidth={6} />)}
  {empty && <g><rect x={-380} y={-200} width={20} height={70} fill="#2a2418" /><rect x={-380} y={-140} width={64} height={14} fill="#2a2418" /></g>}
  <circle cx={-290} cy={-20} r={62} fill="#07080c" stroke="#2c3040" strokeWidth={10} /><circle cx={250} cy={-20} r={62} fill="#07080c" stroke="#2c3040" strokeWidth={10} />
  <circle cx={-415} cy={-140} r={22} fill="#fff5c0" />
</g>;

// ---------- the demolished stop ----------
const Rubble = ({y = 1470}) => <g>
  <rect x={-400} y={y} width={1900} height={800} fill="#0d0e14" />
  <rect x={-400} y={y} width={1900} height={10} fill="#222633" />
  {Array.from({length: 22}, (_, i) => { const bx = -100 + rnd(i) * 1300, by = y + 20 + rnd(i + 3) * 120, w = 30 + rnd(i + 6) * 80, h = 18 + rnd(i + 9) * 40;
    return <rect key={i} x={bx} y={by} width={w} height={h} fill={rnd(i) > 0.5 ? '#2a2d3a' : '#1b1d28'} transform={`rotate(${(rnd(i + 2) - 0.5) * 50} ${bx} ${by})`} />; })}
  {/* bench slab */}
  <rect x={60} y={y - 26} width={250} height={26} fill="#2a2d3a" transform={`rotate(-6 60 ${y})`} />
</g>;
const StopSign = ({x, y, t}) => <g transform={`translate(${x} ${y})`}>
  <line x1={0} y1={0} x2={14} y2={-560} stroke="#3a3e4e" strokeWidth={22} strokeLinecap="round" />
  <circle cx={14} cy={-600} r={86} fill={A} stroke="#0b0c11" strokeWidth={10} opacity={0.92 - 0.12 * (Math.sin(t * 9) > 0.8)} />
  <text x={14} y={-568} textAnchor="middle" fontFamily="Special Elite" fontSize={110} fill="#0b0c11">9</text>
  <rect x={-60} y={-460} width={120} height={40} fill="#2a2d3a" opacity={0.0} />
</g>;
const Lamp = ({x, y, id}) => <g><line x1={x} y1={y} x2={x} y2={y - 640} stroke="#2a2d3a" strokeWidth={18} /><line x1={x} y1={y - 640} x2={x + 90} y2={y - 640} stroke="#2a2d3a" strokeWidth={14} />
  <circle cx={x + 94} cy={y - 628} r={20} fill="#fff1b0" /><Cone x={x + 94} y={y - 620} len={700} spread={34} ang={90} color={WARM} op={0.2} id={id} /><Glow x={x + 94} y={y - 620} r={260} color={A} op={0.22} id={id + 'g'} /></g>;

const Stop = ({f, t, bx = 1700, woman = true, mouth = 0, close = false}) => <g>
  <NightSky h={1500} top="#05060b" bot="#171a28" stars={50} t={t} id="r9sky" />
  <Rubble />
  <BusSide x={bx} y={1470} s={1.7} lit={1} t={t} />
  <Lamp x={780} y={1470} id="r9l" />
  <StopSign x={470} y={1470} t={t} />
  <Cone x={bx - 700} y={1330} len={900} spread={18} ang={-90} color="#fff5c0" op={0.25} id="r9hl" />
  {woman && <ThickStickMan x={300} y={1470} s={1.25} pose="stand" t={f} facing={1} look={0.0} mouth={mouth} ink={OLD} head={OLD} rim={A} />}
  <Fog t={t} y={1420} op={0.16} speed={50} seed={3} h={260} />
</g>;

// ---------- bus interior (travels left) ----------
const Cabin = ({f, t, walt = 'drive', waltOp = 1, waltEyes = 'normal', waltBrow = 0, woman = 'sit', womanMouth = 0, womanPose = null, counter = 0, speed = 700, showWoman = true}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#0a0b11" />
  {/* windshield and side windows with passing lights */}
  <rect x={-40} y={560} width={1160} height={420} fill="#06070d" stroke="#2b2f40" strokeWidth={12} />
  {Array.from({length: 7}, (_, i) => { const lx = ((i * 330 - t * speed) % 2310 + 2310) % 2310 - 400; return <g key={i}><circle cx={lx} cy={720} r={34} fill="#fff1b0" opacity={0.9} /><Glow x={lx} y={720} r={200} color={A} op={0.25} id={'cl' + i} />
    <rect x={lx - 8} y={760} width={16} height={220} fill="#14161f" /></g>; })}
  {Array.from({length: 6}, (_, i) => <rect key={i} x={((i * 520 - t * speed * 0.35) % 3120 + 3120) % 3120 - 600} y={880} width={300} height={100} fill="#0d0f18" />)}
  <line x1={380} y1={560} x2={380} y2={980} stroke="#2b2f40" strokeWidth={12} /><line x1={800} y1={560} x2={800} y2={980} stroke="#2b2f40" strokeWidth={12} />
  {/* ceiling light + counter */}
  <rect x={-40} y={440} width={1160} height={60} fill="#14161f" /><rect x={120} y={452} width={820} height={18} fill={WARM} opacity={0.55} />
  <rect x={170} y={520} width={220} height={96} rx={10} fill="#07080c" stroke={A} strokeWidth={6} />
  <text x={280} y={552} textAnchor="middle" fontFamily="Special Elite" fontSize={22} fill={A} opacity={0.8}>PASSENGERS</text>
  <text x={280} y={600} textAnchor="middle" fontFamily="Special Elite" fontSize={52} fill={A}>{counter}</text>
  {/* floor + seats */}
  <rect x={-500} y={1500} width={2100} height={800} fill="#11131b" /><rect x={-500} y={1498} width={2100} height={10} fill="#2b2f40" />
  {[700, 1000].map((sx, i) => <g key={i}><rect x={sx + 70} y={1000} width={150} height={480} rx={28} fill="#202434" stroke="#0a0b11" strokeWidth={8} /><rect x={sx - 120} y={1340} width={300} height={44} rx={16} fill="#2a2f44" stroke="#0a0b11" strokeWidth={8} /></g>)}
  <rect x={190} y={1340} width={190} height={44} rx={16} fill="#2a2f44" stroke="#0a0b11" strokeWidth={8} />
  <rect x={332} y={1050} width={96} height={290} rx={26} fill="#202434" stroke="#0a0b11" strokeWidth={8} />
  {/* wheel + dash */}
  <line x1={130} y1={1230} x2={100} y2={1110} stroke="#3a3e50" strokeWidth={22} strokeLinecap="round" />
  <ellipse cx={104} cy={1086} rx={22} ry={96} fill="none" stroke="#3a3e50" strokeWidth={20} transform="rotate(14 104 1086)" />
  <rect x={-30} y={1320} width={200} height={190} fill="#161824" stroke="#0a0b11" strokeWidth={8} />
  {/* driver */}
  <g opacity={waltOp}><ThickStickMan x={300} y={1500} s={1.2} pose={walt} t={f} facing={-1} eyes={waltEyes} brow={waltBrow} rim={A} /></g>
  {showWoman && <ThickStickMan x={720} y={1500} s={1.2} pose={womanPose || woman} t={f} facing={-1} mouth={womanMouth} ink={OLD} head={OLD} rim={A} eyes="normal" smile={0.8} look={-0.3} />}
  {showWoman && <g><rect x={640} y={1270} width={110} height={80} rx={14} fill="#5b3a22" stroke="#0a0b11" strokeWidth={6} /><path d="M662 1270 q33 -46 66 0" fill="none" stroke="#0a0b11" strokeWidth={8} /></g>}
  <Glow x={540} y={900} r={620} color={A} op={0.12} id="cab" />
</g>;

// ---------- other sets ----------
const Garage = ({f, t, mouth = 0}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#0d0d12" />
  <rect x={-500} y={1500} width={2100} height={800} fill="#14141b" />
  {Array.from({length: 9}, (_, i) => <g key={i}><rect x={-60 + i * 130} y={560 + (i % 3) * 20} width={20} height={150 + (i % 4) * 30} fill="#2a2d3a" /></g>)}
  <rect x={-100} y={520} width={1300} height={14} fill="#3a3e4e" />
  {/* bus wheel */}
  <circle cx={880} cy={1330} r={190} fill="#08090d" stroke="#2b2f40" strokeWidth={26} /><circle cx={880} cy={1330} r={70} fill="#1b1d28" />
  <rect x={120} y={1330} width={330} height={26} fill="#2a2d3a" /><rect x={150} y={1356} width={20} height={150} fill="#2a2d3a" /><rect x={400} y={1356} width={20} height={150} fill="#2a2d3a" />
  <line x1={540} y1={300} x2={540} y2={760} stroke="#2b2f40" strokeWidth={6} /><circle cx={540} cy={780} r={32} fill="#fff1b0" /><Glow x={540} y={780} r={560} color={A} op={0.28} id="gar" />
  <ThickStickMan x={820} y={1500} s={1.25} pose="stand" t={f} facing={-1} eyes="normal" rim={A} />
  <ThickStickMan x={300} y={1500} s={1.25} pose={t > 1.2 ? 'frozen' : 'talk'} t={f} facing={1} eyes="wide" brow={1} mouth={mouth} ink="#c9c3b4" head="#c9c3b4" rim={A} />
</g>;
const News = ({t}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#08090d" />
  <Paper x={540} y={960} w={860} h={1100} title="OCT 1987" accent={A} t={t} rot={-2} reveal={ramp(t, 0.2, 2.4, (x) => x)}
    lines={[{txt: 'ROUTE 9 CANCELLED', size: 56, glow: true}, {txt: 'Bus 31 left the road.'}, {txt: 'Driver: Walter Hale.'}, {txt: 'Never found.', scratch: 0.5}, {txt: 'Stop torn down.'}]} />
  <Glow x={540} y={960} r={760} color={A} op={0.2} id="np" />
</g>;
const Mirror = ({f, t, mouth = 0, ghostK = 0}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#07080c" />
  <rect x={60} y={620} width={960} height={620} rx={60} fill="#0e1018" stroke={A} strokeWidth={22} />
  <rect x={90} y={650} width={900} height={560} rx={44} fill="#161824" />
  <rect x={90} y={1020} width={900} height={190} fill="#1b1e2c" />
  <rect x={560} y={780} width={200} height={300} rx={26} fill="#222638" stroke="#0a0b11" strokeWidth={8} />
  <rect x={180} y={800} width={200} height={300} rx={26} fill="#222638" stroke="#0a0b11" strokeWidth={8} />
  <ThickStickMan x={330} y={1190} s={0.55} pose="sit" t={f} facing={1} mouth={mouth} ink={OLD} head={OLD} smile={1} rim={A} eyes="normal" />
  <rect x={430} y={900} width={120} height={46} rx={10} fill="#222638" />
  <rect x={560} y={1060} width={190} height={34} rx={12} fill="#2a2f44" />
  <Glow x={540} y={930} r={600} color={A} op={0.18} id="mir" />
</g>;
const RoadOut = ({f, t}) => <g>
  <NightSky h={1500} top="#04050a" bot="#14172a" stars={70} t={t} id="r9s2" />
  <rect x={-400} y={1450} width={1900} height={800} fill="#0c0d13" />
  {Array.from({length: 8}, (_, i) => <rect key={i} x={((i * 320 - t * 400) % 2560 + 2560) % 2560 - 600} y={1640} width={170} height={14} rx={6} fill={A} opacity={0.45} />)}
  <Lamp x={140} y={1450} id="r9l2" />
  <BusSide x={820 - t * 24} y={1520} s={1.2} lit={1} empty t={t} />
  <Cone x={820 - t * 24 - 500} y={1380} len={900} spread={18} ang={-90} color="#fff5c0" op={0.2} id="r9h2" />
  <ThickStickMan x={170} y={1450} s={1.2} pose="stand" t={f} facing={1} eyes="normal" rim={A} />
  <Fog t={t} y={1420} op={0.18} speed={60} seed={5} h={240} />
</g>;

const W = VO.words;
export const R9_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const RouteNine = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const L = VO.line_starts; const E = VO.dur + 0.6;
  const b = (i) => (L[i] !== undefined ? L[i] : E);
  const talk = (t) => 0.5 + 0.4 * Math.sin(t * 9);
  const scene0 = (t) => <Stop f={f} t={t} bx={2000 - ramp(t, 0.1, 5.2) * 1150} mouth={0} />;
  const mid0 = (b(0) + b(1)) / 2;
  const scenes = [
    {a: 0, b: mid0, cam: [[0, 700, 1120, 1.0], [mid0, 620, 1150, 1.2]], draw: scene0},
    {a: mid0, b: b(1), cam: [[0, 420, 1180, 1.4], [b(1) - mid0, 380, 1160, 1.45]], draw: (t) => <Stop f={f} t={t + 4} bx={620} mouth={0} />},
    {a: b(1), b: b(2), cam: [[0, 480, 1150, 1.25], [b(2) - b(1), 520, 1120, 1.75]], draw: (t) => <Cabin f={f} t={t} womanMouth={talk(t)} />},
    {a: b(2), b: b(3), cam: [[0, 300, 900, 1.2], [1.2, 280, 620, 2.6], [b(3) - b(2), 280, 600, 2.9]], shake: 0.15, draw: (t) => <Cabin f={f} t={t} counter={0} waltEyes="wide" waltBrow={0.4} womanMouth={t < 1.8 ? talk(t) : 0} />},
    {a: b(3), b: b(4), cam: [[0, 640, 1180, 1.2], [b(4) - b(3), 600, 1160, 1.7]], draw: (t) => <Cabin f={f} t={t} walt="drive" waltBrow={-0.4} womanMouth={talk(t)} womanPose="sit" />},
    {a: b(4), b: b(5), cam: [[0, 540, 1100, 1.1], [b(5) - b(4), 640, 1100, 1.45]], draw: (t) => <Garage f={f} t={t} mouth={t < 1.2 ? talk(t) : 0} />},
    {a: b(5), b: b(6), cam: [[0, 540, 960, 1.0], [b(6) - b(5), 540, 940, 1.3]], shake: 0.2, draw: (t) => <News t={t} />},
    {a: b(6), b: b(7), cam: [[0, 540, 940, 1.0], [b(7) - b(6), 520, 930, 1.5]], shake: 0.25, draw: (t) => <Mirror f={f} t={t} mouth={talk(t)} />},
    {a: b(7), b: b(8), cam: [[0, 520, 1150, 1.0], [b(8) - b(7), 400, 1160, 1.8]], shake: 0.1, draw: (t) => <Cabin f={f} t={t} counter={1} walt="drive" waltOp={1 - 0.65 * ramp(t, 0.4, 3.0)} waltEyes="closed" womanMouth={talk(t)} womanPose="sit" speed={500} />},
    {a: b(8), b: b(9), cam: [[0, 540, 1250, 1.0], [b(9) - b(8), 640, 1280, 1.35]], draw: (t) => <RoadOut f={f} t={t} />},
    {a: b(9), b: E + 10, cam: [[0, 700, 1120, 1.0], [E - b(9), 620, 1150, 1.1]], draw: (t) => <Stop f={f} t={t} bx={2000 - ramp(t, 0.1, 5.2) * 1150} />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#0a0810'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 700, 1120, 1.0]], draw: (t) => scene0(Math.max(0, t + 10) * 0)}]} /></AbsoluteFill>}
    <ScreenFlash times={[b(2), b(5), b(6), b(7)]} color={A} max={0.4} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'THE LAST BUS', accent: true, size: 92}, {txt: 'STOPS AT A STOP'}, {txt: 'DEMOLISHED IN 1987'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
