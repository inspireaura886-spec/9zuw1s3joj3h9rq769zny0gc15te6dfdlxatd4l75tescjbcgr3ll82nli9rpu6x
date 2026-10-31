// nottrue Short: thirteen-steps (folklore / "the stairs"). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Fog, Glow, Cone, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp, clamp, rnd} from '../World.jsx';
import VO from '../data/thirteen-steps.vo.json';

const A = '#ff4f8b';
const SOFT = '#7a2a45';
const DAD = '#b9c2dd';
const SX = 100, SY = 560, RUN = 52, RISE = 50;
const sp = (q) => [SX + q * RUN, SY + clamp(q + 0.5, 0, 99) * RISE]; // feet on tread (q = tread index + 0.5)

const Num = ({n, t, shake = 0}) => n === null || n === undefined ? null : <g transform={`translate(${810 + (shake ? Math.sin(t * 60) * 6 : 0)} 1090)`} opacity={0.92}>
  <text textAnchor="middle" fontFamily="Lilita One" fontSize={250} fill={A} opacity={0.4} style={{filter: 'blur(14px)'}}>{n}</text>
  <text textAnchor="middle" fontFamily="Lilita One" fontSize={250} fill={A} stroke="#07080c" strokeWidth={14} paintOrder="stroke">{n}</text>
</g>;
const Stairs = ({f, t, ex = 1, walkQ = -9, top = 1, thing = 0, pulse = 1, children}) => {
  const N = 22;
  return <g>
    <rect x={-600} y={-300} width={2600} height={2600} fill="#0b0c13" />
    {/* brick hints on wall */}
    {Array.from({length: 18}, (_, i) => <rect key={i} x={-300 + rnd(i) * 1800} y={100 + rnd(i + 5) * 1500} width={120 + rnd(i + 2) * 120} height={36} fill="#10121b" />)}
    {/* doorway at top with light */}
    <rect x={-420} y={SY - 440} width={470} height={440} fill="#05060a" />
    <rect x={-380} y={SY - 400} width={380} height={400} fill={A} opacity={0.12 + 0.55 * top} />
    <rect x={-380} y={SY - 400} width={380} height={400} fill="#fff1f4" opacity={0.25 * top} />
    <rect x={-420} y={SY - 440} width={470} height={30} fill="#1b1d2a" />
    {top > 0.02 && <path d={`M40 ${SY - 330} L40 ${SY - 20} L${SX + 13 * RUN + 160} ${SY + 13 * RISE + 40} L${SX + 8 * RUN} ${SY + 3 * RISE} Z`} fill={A} opacity={0.07 * top} />}
    <Glow x={-60} y={SY - 200} r={520} color={A} op={0.32 * top} id="tsd" />
    {/* underside void + landing */}
    <rect x={-600} y={SY + 13 * RISE} width={2600} height={1400} fill="#07080d" />
    <rect x={SX + 13 * RUN} y={SY + 13 * RISE} width={1400} height={14} fill="#262a3a" opacity={1 - 0.8 * ex} />
    <rect x={-600} y={SY} width={720} height={14} fill="#262a3a" />
    {/* the Thing under the stairs */}
    {thing > 0 && <ThickStickMan x={360} y={SY + 13 * RISE - 4} s={0.78} pose={['cower', 'lean', 0.4]} t={f} variant="shadow" rim={A} look={0.2} facing={1} opacity={thing} />}
    {/* stringer */}
    <path d={`M${SX - 20} ${SY - 10} L${SX + 13 * RUN} ${SY + 13 * RISE - 8} L${SX + 13 * RUN} ${SY + 13 * RISE + 36} L${SX - 20} ${SY + 40} Z`} fill="#2a2d42" stroke="#0a0b11" strokeWidth={6} />
    {/* treads */}
    {Array.from({length: N}, (_, i) => {
      const x0 = SX + i * RUN, yt = SY + (i + 1) * RISE;
      const near = Math.abs(walkQ - (i + 0.5)) < 0.9;
      if (i < 13) return <g key={i}>
        <rect x={x0 - 4} y={yt - 14} width={RUN + 8} height={18} rx={4} fill={near ? '#e8d9e0' : '#6a6f8c'} stroke="#0a0b11" strokeWidth={4} />
        {near && <rect x={x0 - 4} y={yt - 14} width={RUN + 8} height={18} rx={4} fill={A} opacity={0.55} />}
        <rect x={x0 + RUN - 6} y={yt + 4} width={8} height={RISE - 8} fill="#12141d" />
      </g>;
      const k = (i - 13) / 9; const br = 1 + 0.18 * Math.sin(t * 2.2 + i * 0.7) * pulse;
      return <g key={i} opacity={ex * (1 - 0.35 * k)}>
        <ellipse cx={x0 + RUN / 2} cy={yt - 6} rx={RUN / 2 + 8} ry={14 * br} fill={near ? A : SOFT} stroke="#2a0d19" strokeWidth={5} />
        <ellipse cx={x0 + RUN / 2 - 6} cy={yt - 10} rx={14} ry={4} fill="#ff9fbf" opacity={0.5} />
      </g>;
    })}
    {/* handrail */}
    <line x1={SX - 20} y1={SY - 250} x2={SX + 13 * RUN} y2={SY + 13 * RISE - 250} stroke="#5a5f7a" strokeWidth={12} strokeLinecap="round" />
    {Array.from({length: 13}, (_, i) => <line key={i} x1={SX + i * RUN + 20} y1={SY + i * RISE - 244} x2={SX + i * RUN + 20} y2={SY + (i + 1) * RISE - 20} stroke="#2e3246" strokeWidth={6} />)}
    {children}
    <Fog t={t} y={SY + 13 * RISE + 120} op={0.12} speed={20} seed={2} h={200} color={A} />
  </g>;
};

const Hall = ({f, t, doorOpen = 0.3, tally = 0, bricks = 0, children, glow = 1}) => {
  const rows = [['13', '14'], ['13', '15'], ['13', '16']];
  const bx = 640, bw = 300, by = 760, bh = 740;
  const nb = Math.floor(bricks * 54);
  return <g>
    <rect x={-600} y={-300} width={2600} height={2600} fill="#12131d" />
    {Array.from({length: 9}, (_, i) => <rect key={i} x={-300 + i * 200} y={0} width={4} height={1500} fill="#181a27" />)}
    <rect x={-600} y={1500} width={2600} height={800} fill="#0d0e15" /><rect x={-600} y={1496} width={2600} height={10} fill="#262a3a" />
    {/* door frame */}
    <rect x={bx - 30} y={by - 30} width={bw + 60} height={bh + 34} fill="#06070b" stroke="#2b2f40" strokeWidth={10} />
    <defs><linearGradient id="hdoor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd0e0" stopOpacity={0.95} /><stop offset="1" stopColor={A} stopOpacity={0.25} /></linearGradient></defs>
    <rect x={bx} y={by} width={bw} height={bh} fill="url(#hdoor)" opacity={(0.35 + 0.65 * glow) * (1 - bricks)} />
    {Array.from({length: 11}, (_, i) => <g key={i} opacity={(1 - bricks) * 0.8}><rect x={bx + i * 26} y={by + 120 + i * 52} width={bw - i * 26} height={14} fill="#2a1019" /></g>)}
    <Glow x={bx + bw / 2} y={by + bh / 2} r={620} color={A} op={0.35 * glow * (1 - bricks * 0.9)} id="hdg" />
    {doorOpen > 0 && bricks < 0.01 && <g transform={`translate(${bx + bw} ${by})`}><path d={`M0 0 L${-bw * (1 - doorOpen * 0.5)} 0 L${-bw * (1 - doorOpen * 0.5)} ${bh} L0 ${bh} Z`} fill="#1a1c28" stroke="#0a0b11" strokeWidth={8} transform={`scale(${1 - doorOpen * 0.9} 1)`} /></g>}
    {/* bricks */}
    {Array.from({length: nb}, (_, i) => { const r = Math.floor(i / 3), c = i % 3; const off = r % 2 ? -50 : 0;
      return <rect key={i} x={bx + c * 100 + off} y={by + bh - (r + 1) * 41} width={98} height={39} fill={rnd(i) > 0.5 ? '#4a2f33' : '#3b2528'} stroke="#150d0f" strokeWidth={3} />; })}
    {/* chalk tallies */}
    <g opacity={0.9}>
      <text x={110} y={800} fontFamily="Special Elite" fontSize={40} fill="#d9d4c4" opacity={clamp(tally * 4)}>NIGHT 1   down 13</text>
      {rows.map((r, i) => <text key={i} x={110} y={870 + i * 64} fontFamily="Special Elite" fontSize={44} fill={i === 2 ? A : '#d9d4c4'} opacity={clamp(tally * 4 - i - 0.2)}>down {r[0]}  up {r[1]}</text>)}
    </g>
    {children}
  </g>;
};

const talk = (t) => 0.5 + 0.4 * Math.sin(t * 9);
const W = VO.words;
export const TS_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const ThirteenSteps = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const L = VO.line_starts; const E = VO.dur + 0.6;
  const b = (i) => (L[i] !== undefined ? L[i] : E);
  const eliS = 0.62;
  // scene 0: hook, Eli goes down then comes up
  const s0 = (t) => {
    const down = t < 2.5; const q = down ? 0.2 + 12.8 * ramp(t, 0.1, 2.4, (x) => x) : 13 - 13.8 * ramp(t, 2.9, 4.7, (x) => x);
    const [x, y] = sp(q);
    return <Stairs f={f} t={t} ex={1} walkQ={q} top={1}>
      <ThickStickMan x={x} y={y} s={eliS} pose="walk" t={f} facing={down ? 1 : -1} rim={A} eyes="normal" />
    </Stairs>;
  };
  const s0cnt = (t) => { const down = t < 2.5; const q = down ? 0.2 + 12.8 * ramp(t, 0.1, 2.4, (x) => x) : 13; return t < 0.4 ? 13 : down ? Math.round(q) : (t < 2.9 ? 13 : 1 + Math.min(13, Math.floor(14 * ramp(t, 2.9, 4.4, (x) => x)))); };
  const l4cnt = (t) => { const down = t < 1.8; const q = 0.2 + 12.8 * ramp(t, 0.1, 1.7, (x) => x); return down ? Math.round(q) : (t < 3.6 ? Math.min(16, 1 + Math.floor(15 * ramp(t, 2.1, 3.55, (x) => x))) : t < 4.2 ? 17 : 18); };
  const m = (a, c) => (a + c) / 2;
  const s0End = b(1);
  const scenes = [
    {a: 0, b: s0End, cam: [[0, 480, 1000, 1.0], [2.4, 760, 1260, 1.35], [4.0, 520, 900, 1.15]], draw: s0, overlay: (t) => <Num n={s0cnt(t)} t={t} />},
    // L1: hallway, Eli with the door, tallies
    {a: b(1), b: b(2), cam: [[0, 560, 1150, 1.0], [b(2) - b(1), 700, 1080, 1.5]], draw: (t) => <Hall f={f} t={t} doorOpen={0.5} tally={ramp(t, 1.4, 4.4, (x) => x)}>
      <ThickStickMan x={420} y={1500} s={0.9} pose={t < 2.2 ? 'lookback' : 'stand'} t={f} facing={1} look={t < 2.2 ? 0 : 0} rim={A} eyes="normal" mouth={t > 0.2 && t < 1.2 ? talk(t) : 0} />
    </Hall>},
    // L2a: counter 15, 16 on stairs
    {a: b(2), b: b(2) + 1.25, hard: false, cam: [[0, 640, 1300, 1.8], [1.25, 700, 1350, 2.0]], shake: 0.4, draw: (t) => {
      const q = 13 - 3 * ramp(t, 0, 1.2, (x) => x); const [x, y] = sp(q);
      return <Stairs f={f} t={t} walkQ={q}><ThickStickMan x={x} y={y} s={eliS} pose="scared" t={f} facing={-1} eyes="wide" brow={1} rim={A} /></Stairs>; }, overlay: (t) => <Num n={t < 0.6 ? 15 : 16} t={t} shake={1} />},
    // L2b: tells dad
    {a: b(2) + 1.25, b: b(3), cam: [[0, 500, 1180, 1.2], [b(3) - b(2) - 1.25, 440, 1150, 1.5]], draw: (t) => <Hall f={f} t={t} doorOpen={0.3} tally={1}>
      <ThickStickMan x={330} y={1500} s={0.78} pose="point" t={f} facing={1} rim={A} eyes="wide" brow={0.8} mouth={talk(t)} />
      <ThickStickMan x={150} y={1500} s={1.05} pose="stand" t={f} facing={1} ink={DAD} head={DAD} eyes="normal" />
    </Hall>},
    // L3a: dad and Eli count together
    {a: b(3), b: m(b(3), b(4)) + 0.6, cam: [[0, 520, 900, 1.15], [3.5, 520, 1000, 1.0]], draw: (t) => {
      const q = t < 1.8 ? 0.3 + 12.5 * ramp(t, 0.15, 1.9, (x) => x) : 13 - 13 * ramp(t, 2.1, 3.1, (x) => x);
      const dir = t < 2.0 ? 1 : -1;
      const [x, y] = sp(q); const [x2, y2] = sp(q - 1.6 * dir);
      return <Stairs f={f} t={t} ex={0} walkQ={q} top={0.6} pulse={0}>
        <ThickStickMan x={x2} y={y2} s={0.98} pose="walk" t={f} facing={dir} ink={DAD} head={DAD} eyes="normal" />
        <ThickStickMan x={x} y={y} s={eliS} pose="walk" t={f} facing={dir} rim={A} eyes="normal" />
      </Stairs>; }, overlay: (t) => <Num n={t < 2.0 ? Math.round(12.5 * ramp(t, 0.15, 1.9, (x) => x)) : Math.round(13 * ramp(t, 2.1, 3.1, (x) => x))} t={t} />},
    // L3b: Eli feels stupid
    {a: m(b(3), b(4)) + 0.6, b: b(4), cam: [[0, 520, 1250, 1.3], [b(4) - m(b(3), b(4)) - 0.6, 480, 1200, 1.9]], draw: (t) => <Hall f={f} t={t} doorOpen={0.1} tally={1} glow={0.5}>
      <ThickStickMan x={330} y={1500} s={0.9} pose="slump" t={f} facing={1} rim={A} eyes="closed" />
      <ThickStickMan x={130} y={1500} s={1.15} pose="lean" t={f} facing={1} ink={DAD} head={DAD} eyes="normal" />
    </Hall>},
    // L4: alone, 17, 18
    {a: b(4), b: b(5), cam: [[0, 640, 1000, 1.1], [1.5, 760, 1250, 1.4], [3.2, 600, 1100, 1.8], [b(5) - b(4), 680, 1180, 2.2]], shake: 0.2, draw: (t) => {
      const down = t < 1.8; const q = down ? 0.2 + 12.8 * ramp(t, 0.1, 1.7, (x) => x) : 13 + 0 - 12 * ramp(t, 2.1, 4.3, (x) => x) ; const [x, y] = sp(down ? q : 13 - 0.0 * q + (q - 13));
      const cnt = t < 0.4 ? 13 : down ? Math.round(q) : (t < 3.6 ? Math.min(16, 1 + Math.floor(15 * ramp(t, 2.1, 3.55, (x) => x))) : t < 4.2 ? 17 : 18);
      return <Stairs f={f} t={t} walkQ={q} top={0.7}>
        <ThickStickMan x={x} y={y} s={eliS} pose={down ? 'walk' : 'sneak'} t={f} facing={down ? 1 : -1} rim={A} eyes={down ? 'normal' : 'wide'} brow={down ? 0 : 1} />
      </Stairs>; }, overlay: (t) => <Num n={l4cnt(t)} t={t} />},
    // L5: understood - soft, breathing
    {a: b(5), b: b(6), cam: [[0, 800, 1330, 1.5], [2.0, 900, 1420, 2.3], [b(6) - b(5), 960, 1470, 2.7]], shake: 0.15, draw: (t) => {
      const [x, y] = sp(13.5); const reach = ramp(t, 0.9, 1.8);
      return <Stairs f={f} t={t} walkQ={14.5 * ramp(t, 1.9, 2.4)} top={0.35} pulse={1 + 1.6 * ramp(t, 2.6, 3.6)}>
        <ThickStickMan x={x - 6} y={y} s={eliS} pose={['stand', 'reach', reach]} t={f} facing={1} rim={A} eyes="wide" brow={1} look={0.3} />
        {Array.from({length: 6}, (_, i) => { const k = ((t * 0.5 + i * 0.17) % 1); return <circle key={i} cx={sp(14.5)[0] + 20 + Math.sin(i * 2 + t) * 30} cy={sp(14.5)[1] - 20 - k * 150} r={8 + k * 18} fill="#ffc2d6" opacity={0.28 * (1 - k) * ramp(t, 2.4, 3.2)} />; })}
      </Stairs>; }},
    // L6: light out, voice below
    {a: b(6), b: b(7), cam: [[0, 520, 1000, 1.1], [2.0, 460, 1080, 1.35], [3.4, 400, 1180, 2.0], [b(7) - b(6), 380, 1200, 2.4]], shake: 0.12, draw: (t) => {
      const q = 8; const [x, y] = sp(q);
      return <Stairs f={f} t={t} walkQ={q} ex={0.4} top={1 - ramp(t, 1.95, 2.1)} thing={ramp(t, 2.6, 3.1)} pulse={1}>
        <ThickStickMan x={x} y={y} s={eliS} pose="frozen" t={f} facing={-1} rim={A} eyes="wide" brow={1} />
      </Stairs>; }, overlay: (t) => t < 2.0 ? <Num n={20} t={t} /> : null},
    // L7a: 21
    {a: b(7), b: b(7) + 1.0, cam: [[0, 480, 1050, 1.7], [1.0, 440, 1050, 2.0]], shake: 0.8, draw: (t) => {
      const [x, y] = sp(8);
      return <Stairs f={f} t={t} walkQ={8} ex={0.4} top={0} thing={1}>
        <ThickStickMan x={x} y={y} s={eliS} pose="shiver" t={f} facing={-1} rim={A} eyes="wide" brow={1} />
      </Stairs>; }, overlay: (t) => <Num n={21} t={t} shake={1} />},
    // L7b: dad bricks it shut
    {a: b(7) + 1.0, b: b(8), cam: [[0, 520, 1150, 1.1], [b(8) - b(7) - 1.0, 680, 1100, 1.35]], draw: (t) => {
      const k = ramp(t, 0.5, 3.6, (x) => x);
      return <Hall f={f} t={t} doorOpen={0} tally={1} bricks={k}>
        <ThickStickMan x={520 + (k * 3 % 1) * 40} y={1500} s={1.2} pose={['reach', 'lean', 0.5 + 0.5 * Math.sin(t * 6)]} t={f} facing={1} ink={DAD} head={DAD} eyes="normal" brow={0.3} />
        <ThickStickMan x={170} y={1500} s={0.7} pose="hug" t={f} facing={1} rim={A} eyes="wide" />
      </Hall>; }},
    // L8: count yours tonight (viewer's door)
    {a: b(8), b: b(9), cam: [[0, 700, 1150, 1.0], [b(9) - b(8), 790, 1130, 2.1]], shake: 0.1, draw: (t) => <Hall f={f} t={t} doorOpen={0.55} tally={0} glow={0.7 + 0.3 * Math.sin(t * 3)} />},
    // L9: last line, stairs (loops into frame 0)
    {a: b(9), b: E + 10, cam: [[0, 480, 1000, 1.0], [E - b(9), 480, 1000, 1.0]], draw: (t) => <Stairs f={f} t={t + 6} ex={1} walkQ={-9} top={1} />, overlay: (t) => <Num n={13} t={t} />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#0a0810'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 480, 1000, 1.0]], draw: () => s0(0), overlay: (t) => <Num n={13} t={t} />}]} /></AbsoluteFill>}
    <ScreenFlash times={[b(5), b(6) + 2.0, b(7)]} color={A} max={0.4} />
    <HookTitle accent={A} until={2.8} lines={[{txt: '13 STEPS DOWN.', accent: true, size: 100}, {txt: '14 STEPS UP.', size: 100}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
