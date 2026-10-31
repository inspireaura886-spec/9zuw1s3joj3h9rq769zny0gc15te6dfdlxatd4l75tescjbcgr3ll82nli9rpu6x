// nottrue Short: trail-cam (found footage). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp, rnd} from '../World.jsx';
import VO from '../data/trail-cam.vo.json';

const A = '#b8ff3d';
const PALE = '#e4e8d8';
const BG = '#0b0e0a';

// ---------- the Thing: pale, blank-faced, tall ----------
const Blank = ({x, y, s, pose = 'stand', f, facing = 0.5, op = 1, rim = A}) =>
  <ThickStickMan x={x} y={y} s={s} pose={pose} t={f} facing={facing} eyes="none" ink={PALE} head={PALE} rim={rim} opacity={op} />;

// ---------- forest photo world (night IR look) ----------
const Forest = ({f, t, kind = 'trees', fig = null, flash = 0}) => {
  const trunks = Array.from({length: 11}, (_, i) => ({x: -260 + i * 190 + rnd(i) * 60, w: 36 + rnd(i + 3) * 60, lean: (rnd(i + 8) - 0.5) * 30, c: rnd(i + 20) > 0.7 ? '#2b3326' : '#141a12'}));
  return <g>
    <defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10150f" /><stop offset="1" stopColor="#2b342a" /></linearGradient></defs>
    <rect x={-600} y={-600} width={2300} height={2100} fill="url(#fsky)" />
    <rect x={-600} y={1260} width={2300} height={1400} fill="#171c14" />
    {Array.from({length: 40}, (_, i) => <line key={i} x1={-400 + rnd(i) * 1900} y1={1290 + rnd(i + 2) * 500} x2={-370 + rnd(i) * 1900} y2={1298 + rnd(i + 2) * 500} stroke="#2f3a2a" strokeWidth={6} strokeLinecap="round" />)}
    {trunks.map((tr, i) => <g key={i}><line x1={tr.x} y1={1290} x2={tr.x + tr.lean} y2={-500} stroke={tr.c} strokeWidth={tr.w} strokeLinecap="butt" />
      {i % 3 === 0 && <line x1={tr.x + tr.lean * 0.4} y1={600} x2={tr.x + 140} y2={430} stroke={tr.c} strokeWidth={tr.w * 0.35} strokeLinecap="round" />}</g>)}
    {kind === 'creek' && <g><rect x={-600} y={1390} width={2300} height={190} fill="#3b4a48" opacity={0.85} />
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M${-300 + i * 150 + (t * 20) % 150} ${1420 + (i % 3) * 50} q 40 -10 80 0`} stroke="#7e9490" strokeWidth={5} fill="none" strokeLinecap="round" />)}</g>}
    {kind === 'fence' && <g>{Array.from({length: 9}, (_, i) => <rect key={i} x={-120 + i * 170} y={1190} width={34} height={260} fill="#4a4636" stroke="#14120c" strokeWidth={5} />)}
      <rect x={-200} y={1240} width={2000} height={20} fill="#3c3828" /><rect x={-200} y={1330} width={2000} height={20} fill="#3c3828" /></g>}
    <g style={{filter: 'blur(24px)'}}>{Array.from({length: 4}, (_, i) => <ellipse key={i} cx={((rnd(i) * 1600 + t * 22 * (0.6 + rnd(i + 5))) % 2000) - 400} cy={1330 + i * 40} rx={420} ry={60} fill="#8a9a88" opacity={0.2} />)}</g>
    {fig && <Blank {...fig} f={f} />}
    <g fill="#0a0d08">{Array.from({length: 46}, (_, i) => { const bx = -300 + i * 50 + rnd(i) * 30; const hh = 90 + rnd(i + 4) * 170; const sw = (rnd(i + 9) - 0.5) * 70 + Math.sin(t * 1.2 + i) * 6;
      return <path key={i} d={`M${bx} 1980 Q ${bx + sw * 0.4} ${1980 - hh * 0.5} ${bx + sw} ${1980 - hh} Q ${bx + sw * 0.6 + 14} ${1980 - hh * 0.5} ${bx + 22} 1980 Z`} />; })}</g>
    <ellipse cx={220} cy={1640} rx={330} ry={44} fill="#222b1e" stroke="#0a0d08" strokeWidth={8} /><ellipse cx={920} cy={1760} rx={110} ry={34} fill="#2a3326" />
    {/* foreground bright trunk (IR) */}
    <line x1={-40} y1={2100} x2={-10} y2={-500} stroke="#3c4636" strokeWidth={140} />
    <line x1={1130} y1={2100} x2={1105} y2={-500} stroke="#323b2d" strokeWidth={110} />
    {flash > 0 && <rect x={-600} y={-600} width={2300} height={2400} fill="#f2ffe0" opacity={flash} />}
  </g>;
};

// photo chrome in screen space: border + timestamp strip
const Chrome = ({time, t, note = ''}) => <g>
  <rect x={0} y={1640} width={1080} height={64} fill="rgba(5,7,4,0.82)" />
  <text x={40} y={1686} fontFamily="Special Elite" fontSize={40} fill="#dfe8cf">{'\u25B6 ' + time}</text>
  <text x={1040} y={1686} textAnchor="end" fontFamily="Special Elite" fontSize={36} fill={A}>{note || 'CAM 01   41\u00B0F'}</text>
  <rect x={26} y={26} width={1028} height={1868} fill="none" stroke="#cfdcbf" strokeWidth={3} opacity={0.35} />
  <circle cx={1010} cy={250} r={11} fill={A} opacity={Math.sin(t * 6) > 0 ? 1 : 0.15} />
</g>;

// ---------- Owen's room ----------
const Clock = ({x, y, h = 5, m = 58}) => {
  const ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
  return <g transform={`translate(${x} ${y})`}><circle r={110} fill="#14180f" stroke={A} strokeWidth={10} />
    {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-96} x2={0} y2={-84} stroke="#cfdcbf" strokeWidth={5} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={0} y2={-58} stroke="#e8f0d8" strokeWidth={9} strokeLinecap="round" transform={`rotate(${ha})`} />
    <line x1={0} y1={0} x2={0} y2={-88} stroke={A} strokeWidth={6} strokeLinecap="round" transform={`rotate(${ma})`} /><circle r={9} fill="#e8f0d8" /></g>;
};
const Icon = ({kind, x, y}) => <g transform={`translate(${x} ${y})`} stroke="#aeb8a0" strokeWidth={8} fill="#aeb8a0" strokeLinecap="round">
  {kind === 'deer' && <g><ellipse cx={0} cy={0} rx={52} ry={26} /><line x1={-34} y1={20} x2={-34} y2={70} /><line x1={30} y1={20} x2={30} y2={70} /><circle cx={54} cy={-28} r={16} /><path d="M56 -44 l-10 -40 m10 40 l22 -34" fill="none" /></g>}
  {kind === 'squirrel' && <g><ellipse cx={0} cy={0} rx={24} ry={32} /><circle cx={14} cy={-36} r={14} /><path d="M-22 10 q-56 -20 -30 -84" fill="none" strokeWidth={16} /></g>}
  {kind === 'dog' && <g><ellipse cx={0} cy={0} rx={50} ry={22} /><line x1={-34} y1={16} x2={-34} y2={56} /><line x1={30} y1={16} x2={30} y2={56} /><circle cx={56} cy={-18} r={17} /><line x1={-50} y1={-8} x2={-76} y2={-34} /></g>}
  {kind === 'tree' && <g><line x1={0} y1={60} x2={0} y2={-30} strokeWidth={16} /><circle cx={0} cy={-52} r={40} /></g>}
</g>;
const Room = ({f, t, owen = 'sit', ox = 330, of = 1, eyes = 'normal', brow = 0, ghost = 0, gx = 800, gs = 1.1, screen = true, bubble = null, look = 0, desk = true}) => <g>
  <rect x={-600} y={-600} width={2300} height={3000} fill="#0a0d09" />
  <rect x={-600} y={1500} width={2300} height={1000} fill="#10150e" />
  <rect x={640} y={430} width={300} height={380} fill="#121a22" stroke="#2c3a2a" strokeWidth={10} />
  <line x1={790} y1={430} x2={790} y2={810} stroke="#2c3a2a" strokeWidth={8} /><line x1={640} y1={620} x2={940} y2={620} stroke="#2c3a2a" strokeWidth={8} />
  <Clock x={190} y={620} />
  {Array.from({length: 7}, (_, i) => <line key={i} x1={-400 + i * 330} y1={1500} x2={-500 + i * 400} y2={2100} stroke="#161d12" strokeWidth={6} />)}
  {desk && <g><rect x={120} y={1330} width={700} height={36} fill="#2a2c1f" stroke="#070905" strokeWidth={8} />
  <rect x={160} y={1366} width={26} height={140} fill="#1c1e14" /><rect x={750} y={1366} width={26} height={140} fill="#1c1e14" /><rect x={90} y={1380} width={90} height={120} fill="#1c2218" /></g>}
  {screen && desk && <g><rect x={330} y={1130} width={300} height={200} rx={10} fill="#0e140c" stroke={A} strokeWidth={8} /><Glow x={480} y={1230} r={420} color={A} op={0.28 + 0.06 * Math.sin(t * 5)} id="lap" /></g>}
  {desk && <Owen_ x={ox} f={f} pose={owen} facing={of} eyes={eyes} brow={brow} look={look} />}{!desk && <Owen_ x={ox} f={f} pose={owen} facing={of} eyes={eyes} brow={brow} look={look} />}
  {ghost > 0 && <Blank x={gx} y={1500} s={gs} pose="stand" f={f} facing={0} op={ghost} />}
  {bubble}
</g>;
const Owen_ = ({x, f, pose, facing, eyes, brow, look}) => <ThickStickMan x={x} y={1500} s={1.25} pose={pose} t={f} facing={facing} eyes={eyes} brow={brow} look={look} rim={A} />;

const Bear = ({x, y, s = 1}) => <g transform={`translate(${x} ${y}) scale(${s})`} fill="#3a4034" stroke="#0a0c08" strokeWidth={8}>
  <ellipse cx={0} cy={0} rx={90} ry={150} /><circle cx={0} cy={-170} r={62} /><circle cx={-44} cy={-222} r={20} /><circle cx={44} cy={-222} r={20} />
  <line x1={-80} y1={-60} x2={-150} y2={20} strokeWidth={30} strokeLinecap="round" /><line x1={80} y1={-60} x2={150} y2={20} strokeWidth={30} strokeLinecap="round" />
  <circle cx={-20} cy={-176} r={7} fill="#b8ff3d" stroke="none" /><circle cx={20} cy={-176} r={7} fill="#b8ff3d" stroke="none" /></g>;

// laptop grid of day photos
const PhotoGrid = ({t}) => <g>
  <rect x={-600} y={-600} width={2300} height={3000} fill="#080a07" />
  <rect x={90} y={520} width={900} height={760} rx={26} fill="#0e140c" stroke={A} strokeWidth={14} />
  {[['deer', 0, 0], ['squirrel', 1, 0], ['dog', 0, 1], ['tree', 1, 1]].map(([k, cx, cy], i) => <g key={i} opacity={Math.min(1, Math.max(0, t * 2.2 - i * 0.35))}>
    <rect x={140 + cx * 440} y={580 + cy * 320} width={400} height={290} fill="#1d251a" stroke="#cfdcbf" strokeWidth={4} opacity={0.9} />
    <Icon kind={k} x={340 + cx * 440} y={730 + cy * 320} />
    <text x={150 + cx * 440} y={858 + cy * 320} fontFamily="Special Elite" fontSize={26} fill="#cfdcbf">{['DAY 11:02', 'DAY 14:00', 'DAY 16:30', 'DAY 09:00'][i]}</text></g>)}
  <text x={540} y={1360} textAnchor="middle" fontFamily="Special Elite" fontSize={48} fill={A}>NORMAL WOODS</text>
  <Glow x={540} y={900} r={760} color={A} op={0.2} id="pg" />
</g>;

// hallway and bedroom for the indoor trail-cam photos
const Hall = ({f, t, figX = 760, figS = 0.5, figY = 1360, flash = 0}) => <g>
  <rect x={-600} y={-600} width={2300} height={3000} fill="#1a2018" />
  <rect x={-600} y={1380} width={2300} height={1200} fill="#141a12" />
  <rect x={160} y={300} width={760} height={1090} fill="#10150e" stroke="#2e3a2a" strokeWidth={16} />
  {[220, 880].map((dx, i) => <rect key={i} x={dx} y={560} width={110} height={800} fill="#232c20" stroke="#0a0c08" strokeWidth={8} />)}
  <rect x={410} y={480} width={260} height={260} fill="#12170f" stroke="#cfdcbf" strokeWidth={6} opacity={0.7} />
  <rect x={470} y={930} width={140} height={440} fill="#0a0d08" stroke="#2e3a2a" strokeWidth={8} />
  <Blank x={figX} y={figY} s={figS} f={f} />
  <rect x={-600} y={1380} width={2300} height={8} fill="#2b3626" />
  {flash > 0 && <rect x={-600} y={-600} width={2300} height={2600} fill="#f2ffe0" opacity={flash} />}
</g>;
const Bedroom = ({f, t, gx = 640, gs = 1.25, gpose = 'stand', flash = 0}) => <g>
  <rect x={-600} y={-600} width={2300} height={3000} fill="#171d15" />
  <rect x={560} y={380} width={300} height={420} fill="#10150e" stroke="#2e3a2a" strokeWidth={12} />
  <rect x={-600} y={1480} width={2300} height={1000} fill="#10150e" />
  <rect x={-600} y={1478} width={2300} height={8} fill="#2b3626" />
  <Blank x={gx} y={1400} s={gs} pose={gpose} f={f} />
  <rect x={140} y={1180} width={780} height={320} rx={14} fill="#2a3426" stroke="#070905" strokeWidth={10} />
  <rect x={160} y={1110} width={220} height={110} rx={30} fill="#4a5642" />
  <ThickStickMan x={880} y={1150} s={1.15} rot={-90} pose="frozen" t={f} facing={1} eyes="closed" ink={PALE} head={PALE} rim={A} />
  <rect x={400} y={1120} width={520} height={130} rx={24} fill="#3b4834" opacity={0.96} />
  <rect x={120} y={1500} width={820} height={40} fill="#0a0d08" />
  {flash > 0 && <rect x={-600} y={-600} width={2300} height={2600} fill="#f2ffe0" opacity={flash} />}
</g>;

const FaceClose = ({t}) => <g>
  <rect x={-600} y={-600} width={2300} height={3000} fill="#0a0d09" />
  <circle cx={540} cy={1000} r={330} fill={PALE} stroke="#0a0c08" strokeWidth={16} />
  <path d="M400 1130 Q540 1200 680 1130" stroke="#1a1e14" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
  <Glow x={540} y={1000} r={720} color="#f2ffe0" op={0.35} id="fc" />
</g>;
const Lens = ({t, flash = 0}) => <g>
  <rect x={-600} y={-600} width={2300} height={3000} fill="#10150e" />
  <line x1={-40} y1={2200} x2={-20} y2={-500} stroke="#2b3326" strokeWidth={320} />
  <rect x={190} y={540} width={700} height={900} rx={50} fill="#2f3a28" stroke="#070905" strokeWidth={16} />
  <rect x={150} y={760} width={40} height={300} fill="#171d12" /><rect x={890} y={760} width={40} height={300} fill="#171d12" />
  <circle cx={540} cy={860} r={200} fill="#070905" stroke={A} strokeWidth={18} />
  <circle cx={540} cy={860} r={96} fill="#0c1a0c" /><circle cx={500} cy={820} r={26} fill="#cfdcbf" opacity={0.5} />
  {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={330 + i * 84} cy={1210} r={22} fill={A} opacity={0.35 + 0.45 * (Math.sin(t * 7 + i) > 0)} />)}
  <rect x={300} y={1300} width={480} height={40} fill="#171d12" />
  <Glow x={540} y={860} r={520} color={A} op={0.25 + 0.1 * Math.sin(t * 6)} id="ln" />
  {flash > 0 && <rect x={-600} y={-600} width={2300} height={3200} fill="#f2ffe0" opacity={flash} />}
</g>;

const W = VO.words;
export const TC_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const TrailCam = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const L = VO.line_starts; const E = VO.dur + 0.6;
  const b = (i) => (L[i] !== undefined ? L[i] : E);
  const photo = (a, bb, time, draw, cam, extra = {}) => ({a, b: bb, cam, ...extra, draw,
    overlay: (t) => <Chrome time={time} t={t} note={extra.note} />});
  const fl = (t, k = 0.25) => Math.max(0, 0.9 - t / k);
  const third = (i) => { const d = (b(i + 1) - b(i)) / 3; return [b(i), b(i) + d, b(i) + 2 * d, b(i + 1)]; };
  const half = (i) => [b(i), (b(i) + b(i + 1)) / 2, b(i + 1)];
  const T1 = third(1), H4 = half(4), H5 = half(5), H6 = half(6), H7 = half(7), H2 = half(2);
  const scenes = [
    photo(0, b(1), '00:00:07  OCT 14', (t) => <Forest f={f} t={t} fig={{x: 780, y: 1262, s: 0.38, pose: 'stand'}} flash={fl(t, 0.2)} />, [[0, 540, 1000, 1.0], [b(1), 700, 1120, 1.9]]),
    photo(T1[0], T1[1], '00:00  TREE LINE', (t) => <Forest f={f} t={t} fig={{x: 330, y: 1264, s: 0.4}} flash={fl(t)} />, [[0, 540, 1010, 1.1], [1.9, 400, 1110, 1.5]], {note: 'IMG_0000'}),
    photo(T1[1], T1[2], '01:00  CREEK', (t) => <Forest f={f} t={t} kind="creek" fig={{x: 640, y: 1400, s: 0.7}} flash={fl(t)} />, [[0, 640, 1060, 1.1], [1.9, 640, 1190, 1.6]], {note: 'IMG_0001'}),
    photo(T1[2], b(2), '02:00  FENCE', (t) => <Forest f={f} t={t} kind="fence" fig={{x: 560, y: 1470, s: 1.0}} flash={fl(t)} />, [[0, 560, 1050, 1.0], [2, 560, 1080, 1.5]], {note: 'IMG_0002', shake: 0.2}),
    {a: H2[0], b: H2[1], cam: [[0, 420, 1150, 1.25], [3, 480, 1180, 1.6]], draw: (t) => <Room f={f} t={t} owen="sit" ox={250} eyes="wide" />},
    {a: H2[1], b: b(3), cam: [[0, 540, 920, 1.0], [3, 540, 900, 1.2]], draw: (t) => <PhotoGrid t={t} />},
    {a: b(3), b: b(4), cam: [[0, 480, 1150, 1.2], [3.6, 520, 1100, 1.6]], draw: (t) => <Room f={f} t={t} owen="point" ox={330} brow={0.3} desk={false} screen={false}
      bubble={<g opacity={ramp(t, 0.4, 0.9)}><ellipse cx={760} cy={800} rx={190} ry={230} fill="#10150e" stroke={A} strokeWidth={8} /><circle cx={560} cy={1010} r={14} fill={A} /><circle cx={600} cy={960} r={9} fill={A} /><Bear x={760} y={860} s={0.8} /></g>} />},
    photo(H4[0], H4[1], '03:00  FLASH', (t) => <Forest f={f} t={t} fig={{x: 540, y: 1480, s: 1.45}} flash={fl(t, 0.3)} />, [[0, 540, 900, 1.0], [3.5, 540, 920, 1.5]], {note: 'IMG_0003', shake: 0.15}),
    {a: H4[1], b: b(5), cam: [[0, 540, 1000, 1.0], [3.5, 540, 1000, 1.25]], shake: 0.35, draw: (t) => <FaceClose t={t} />, overlay: (t) => <Chrome time="03:00  NO EYES" t={t} note="IMG_0003" />},
    photo(H5[0], H5[1], '04:00  HALLWAY', (t) => <Hall f={f} t={t} figX={540} figS={0.4} figY={1380} flash={fl(t)} />, [[0, 540, 900, 1.0], [3.5, 540, 1050, 1.6]], {note: 'IMG_0004'}),
    photo(H5[1], b(6), '04:00  HALLWAY', (t) => <Hall f={f} t={t} figX={540 + t * 10} figS={0.75} figY={1385} />, [[0, 540, 1050, 1.5], [3.5, 540, 1130, 2.1]], {note: 'IMG_0004', shake: 0.3}),
    photo(H6[0], H6[1], '05:00  BEDROOM', (t) => <Bedroom f={f} t={t} gx={560} gs={1.2} flash={fl(t, 0.3)} />, [[0, 540, 1000, 1.0], [2.6, 560, 1030, 1.35]], {note: 'IMG_0005', shake: 0.15}),
    photo(H6[1], b(7), '05:00  BEDROOM', (t) => <Bedroom f={f} t={t} gx={560} gs={1.2} />, [[0, 560, 1030, 1.4], [4.1, 560, 880, 2.6]], {note: 'IMG_0005', shake: 0.3}),
    {a: H7[0], b: H7[1], cam: [[0, 480, 1150, 1.2], [3.5, 500, 1170, 1.5]], shake: 0.2, draw: (t) => <Room f={f} t={t} owen="sit" ox={250} eyes="wide" brow={1} ghost={ramp(t, 1.5, 3.4)} gx={880} gs={1.15} />},
    {a: H7[1], b: b(8), cam: [[0, 190, 640, 1.0], [2.8, 190, 640, 2.6]], shake: 0.2, draw: (t) => <Room f={f} t={t} owen="sit" ox={250} eyes="wide" brow={1} ghost={1} gx={880} gs={1.15} />,
      overlay: (t) => <g opacity={ramp(t, 1.8, 2.4)}><rect x={0} y={0} width={1080} height={1920} fill="#050604" opacity={0.0} /></g>},
    {a: b(8), b: b(9), cam: [[0, 540, 900, 1.0], [4, 540, 880, 1.45]], draw: (t) => <Lens t={t} />},
    {a: b(9), b: E + 10, cam: [[0, 540, 880, 1.45], [4, 540, 860, 2.0]], shake: 0.1, draw: (t) => <Lens t={t} flash={ramp(t, VO.dur - b(9) - 0.2, VO.dur - b(9) + 0.2)} />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: BG}}>
    <FontFaces />
    <Scenes scenes={scenes} bg={BG} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 540, 1230, 1.0]], draw: (t) => <Forest f={f} t={t} fig={{x: 780, y: 1262, s: 0.38, pose: 'stand'}} flash={0} />, overlay: (t) => <Chrome time="00:00:07  OCT 14" t={t} />}]} bg={BG} /></AbsoluteFill>}
    <ScreenFlash times={[b(1), T1[1], T1[2], b(4), b(5), H5[1], b(6), b(7)]} color="#f2ffe0" max={0.35} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'THE TRAIL CAM', accent: true, size: 92}, {txt: 'FIGURE GOT'}, {txt: 'CLOSER EVERY HOUR'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
