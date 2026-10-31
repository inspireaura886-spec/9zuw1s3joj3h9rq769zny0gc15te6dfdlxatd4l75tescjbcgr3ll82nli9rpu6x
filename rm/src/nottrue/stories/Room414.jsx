// nottrue Short: room-414 (liminal hotel hall, doubles). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Paper, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp, clamp, rnd} from '../World.jsx';
import VO from '../data/room-414.vo.json';

const A = '#3dffd0';
const K = 1.36;
const pj = (X, Y, z) => [540 + X * K / z, 820 + Y * K / z];
const pts = (a) => a.map((p) => p.join(',')).join(' ');
const mod = (a, b) => ((a % b) + b) % b;

// one-point perspective hallway, camera looks at the far door. scroll = distance walked (z units)
const PerspHall = ({t, scroll = 0, endZ = 4, flick = 0}) => {
  const doors = [];
  for (let i = 0; i < 14; i++) { const z = mod(i * 1.1 - scroll, 15.4) + 0.6; if (z < endZ - 0.3) doors.push(z); }
  doors.sort((a, b) => b - a);
  const lamps = [];
  for (let i = 0; i < 7; i++) { const z = mod(i * 2.2 - scroll, 15.4) + 0.8; if (z < endZ - 0.2) lamps.push(z); }
  const stripes = [];
  for (let j = 0; j < 26; j++) { const z = mod(j * 0.6 - scroll, 15.6) + 0.55; if (z < endZ) stripes.push(z); }
  const lit = 1 - flick * (Math.sin(t * 47) > 0.2 ? 0.7 : 0);
  return <g>
    <rect x={-500} y={-500} width={2100} height={3200} fill="#090a0f" />
    <polygon points={pts([pj(-420, -250, 0.5), pj(420, -250, 0.5), pj(420, -250, 60), pj(-420, -250, 60)])} fill="#11121a" />
    <polygon points={pts([pj(-420, 500, 0.5), pj(420, 500, 0.5), pj(420, 500, 60), pj(-420, 500, 60)])} fill="#0d1a1b" />
    <polygon points={pts([pj(-420, -250, 0.5), pj(-420, 500, 0.5), pj(-420, 500, 60), pj(-420, -250, 60)])} fill="#181a25" />
    <polygon points={pts([pj(420, -250, 0.5), pj(420, 500, 0.5), pj(420, 500, 60), pj(420, -250, 60)])} fill="#171925" />
    {stripes.map((z, i) => { const a = pj(-420, 500, z), b = pj(420, 500, z); return <line key={'s' + i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={A} strokeWidth={2 + 7 / z} opacity={Math.min(0.32, 0.5 / z)} />; })}
    {doors.map((z, i) => [-420, 420].map((X) => <g key={'d' + i + X}>
      <polygon points={pts([pj(X, -150, z + 0.5), pj(X, -150, z), pj(X, 500, z), pj(X, 500, z + 0.5)])} fill="#20202e" stroke="#3a3a52" strokeWidth={Math.max(2, 5 / z)} />
      <polygon points={pts([pj(X, -200, z + 0.4), pj(X, -200, z + 0.1), pj(X, -170, z + 0.1), pj(X, -170, z + 0.4)])} fill="#cfc9b0" opacity={0.6} />
    </g>))}
    {lamps.map((z, i) => { const p = pj(0, -250, z); return <g key={'l' + i}><ellipse cx={p[0]} cy={p[1] + 4} rx={170 / z + 8} ry={22 / z + 3} fill="#efe9d4" opacity={0.85 * lit} /><Glow x={p[0]} y={p[1] + 40} r={620 / z + 40} color="#d8ffee" op={0.2 * lit} id={`pl${i}`} /></g>; })}
    {/* far wall + the door */}
    <polygon points={pts([pj(-420, -250, endZ), pj(420, -250, endZ), pj(420, 500, endZ), pj(-420, 500, endZ)])} fill="#0a0b10" />
    <polygon points={pts([pj(-160, -140, endZ), pj(160, -140, endZ), pj(160, 500, endZ), pj(-160, 500, endZ)])} fill={A} opacity={0.9} />
    {(() => { const c = pj(0, 60, endZ); return <g><Glow x={c[0]} y={c[1]} r={2600 / endZ + 80} color={A} op={0.55} id="enddoor" />
      <text x={c[0]} y={pj(0, -60, endZ)[1]} textAnchor="middle" fontFamily="Special Elite" fontSize={Math.max(14, 330 / endZ)} fill="#06231d">414</text></g>; })()}
  </g>;
};

// side-on hallway (scrolling) ; open = 0..1 for the door with index openIdx
const SideHall = ({f, t, scroll = 0, open = 0, openIdx = 2, flick = 0, children}) => {
  const base = scroll % 560;
  const fl = 1 - flick * (Math.sin(t * 43) > 0.1 ? 0.75 : 0);
  return <g>
    <rect x={-700} y={-300} width={3000} height={1860} fill="#15171f" />
    <rect x={-700} y={-300} width={3000} height={960} fill="#0e0f15" />
    <rect x={-700} y={1250} width={3000} height={260} fill="#1c1f2a" />
    <rect x={-700} y={1500} width={3000} height={1100} fill="#0e1b1c" />
    <rect x={-700} y={1500} width={3000} height={8} fill="#2a3a3c" />
    {Array.from({length: 18}, (_, k) => { const x = k * 140 - mod(scroll, 140) - 400; return <g key={'c' + k}><polygon points={`${x},1640 ${x + 70},1590 ${x + 140},1640 ${x + 70},1690`} fill="none" stroke={A} strokeWidth={5} opacity={0.2} /><polygon points={`${x + 70},1790 ${x + 140},1740 ${x + 210},1790 ${x + 140},1840`} fill="none" stroke={A} strokeWidth={5} opacity={0.14} /></g>; })}
    {Array.from({length: 6}, (_, i) => { const x0 = i * 560 - base - 280; const k = Math.floor(scroll / 560) + i; const isOpen = i === openIdx && open > 0;
      return <g key={'d' + i}>
        <rect x={x0} y={820} width={280} height={680} fill={isOpen ? '#05100e' : '#20202e'} stroke="#3a3a52" strokeWidth={10} />
        {isOpen && <><Glow x={x0 + 140} y={1160} r={520} color={A} op={0.55 * open} id={`od${i}`} /><rect x={x0 + 10} y={830} width={260} height={670} fill={A} opacity={0.5 * open} /></>}
        <polygon points={`${x0},820 ${x0 + 280 * (1 - open * 0.86)},${820 + 30 * open} ${x0 + 280 * (1 - open * 0.86)},${1500 - 30 * open} ${x0},1500`} fill="#262637" stroke="#3a3a52" strokeWidth={8} />
        <circle cx={x0 + 280 * (1 - open * 0.86) - 36} cy={1170} r={14} fill="#bfae6a" />
        <rect x={x0 + 70} y={740} width={140} height={58} fill="#cfc9b0" opacity={0.85} />
        <text x={x0 + 140} y={786} textAnchor="middle" fontFamily="Special Elite" fontSize={44} fill="#1d1a14">{410 + (k % 2)}</text>
      </g>; })}
    {Array.from({length: 6}, (_, i) => { const x = i * 560 - base - 0; return <g key={'l' + i}><rect x={x - 90} y={655} width={180} height={18} fill="#efe9d4" opacity={0.9 * fl} /><Glow x={x} y={760} r={440} color="#d8ffee" op={0.2 * fl} id={`sl${i}`} /></g>; })}
    {children}
  </g>;
};

const Lobby = ({f, t, jay = null, clerk = null, sigh = 0, children}) => <g>
  <rect x={-700} y={-300} width={3000} height={1860} fill="#3a3226" />
  <rect x={-700} y={-300} width={3000} height={560} fill="#2b251c" />
  <rect x={-700} y={1500} width={3000} height={1100} fill="#241f19" />
  <rect x={-700} y={1500} width={3000} height={10} fill="#5a4b34" />
  <Glow x={600} y={600} r={900} color="#ffe2a8" op={0.5} id="lobbyglow" />
  {/* key board */}
  <rect x={700} y={700} width={330} height={300} fill="#1a1510" stroke="#6b5a3a" strokeWidth={10} />
  {Array.from({length: 12}, (_, i) => <g key={i}><circle cx={740 + (i % 4) * 82} cy={760 + Math.floor(i / 4) * 80} r={10} fill="#c9a24a" /></g>)}
  <rect x={1020 - 120} y={1010} width={0} height={0} />
  {jay}{clerk}
  {/* desk in front of clerk */}
  <rect x={560} y={1240} width={760} height={270} fill="#5a4326" stroke="#2c2012" strokeWidth={10} />
  <rect x={540} y={1215} width={800} height={36} fill="#7a5c34" stroke="#2c2012" strokeWidth={8} />
  <circle cx={640} cy={1200} r={24} fill="#c9a24a" /><rect x={630} y={1170} width={20} height={14} fill="#c9a24a" />
  {sigh > 0 && <g opacity={sigh}>{[0, 1, 2].map((i) => <ellipse key={i} cx={760 + i * 36 + sigh * 20} cy={1010 - i * 24 - (1 - sigh) * 40} rx={26 + i * 8} ry={14 + i * 4} fill="#e8dfc8" opacity={0.5 - i * 0.12} />)}</g>}
  {children}
</g>;

const Monitor = ({t, rows = 3}) => <g>
  <rect x={-700} y={-300} width={3000} height={2600} fill="#06100e" />
  <rect x={120} y={560} width={840} height={760} rx={26} fill="#07140f" stroke="#3a4a46" strokeWidth={22} />
  <text x={170} y={660} fontFamily="Special Elite" fontSize={44} fill={A}>FRONT DESK  v2.1</text>
  <line x1={170} y1={690} x2={910} y2={690} stroke={A} strokeWidth={4} opacity={0.6} />
  {[['22:04', 'CHECK-IN  ROOM 414'], ['22:31', 'CHECK-IN  ROOM 414'], ['23:02', 'CHECK-IN  ROOM 414']].map((r, i) => <g key={i} opacity={i < rows ? 1 : 0}>
    <text x={170} y={780 + i * 105} fontFamily="Special Elite" fontSize={50} fill="#d8ffee">{r[0]}</text>
    <text x={350} y={780 + i * 105} fontFamily="Special Elite" fontSize={44} fill={A}>{r[1]}</text></g>)}
  <text x={170} y={1130} fontFamily="Special Elite" fontSize={44} fill="#d8ffee" opacity={Math.sin(t * 7) > 0 ? 1 : 0}>GUEST: JAY M. _</text>
  <Glow x={540} y={940} r={900} color={A} op={0.22} id="mon" />
</g>;

// back view of the thick stick-man (walking away from camera)
const BackMan = ({x, y, s = 1, w = 0, ink = '#f1ede2', rot = 0}) => {
  const a = Math.sin(w), lift = (v) => Math.max(0, v) * 34;
  const ln = (x1, y1, x2, y2, wd, c = ink) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={wd} strokeLinecap="round" />;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={80} ry={12} fill="rgba(0,0,0,0.45)" />
    <g transform={`translate(0 ${-Math.abs(a) * 8})`}>
      {ln(-14, -184, -24, -92 - lift(a) / 2, 26, '#a9a69c')}{ln(-24, -92 - lift(a) / 2, -26, -lift(a), 26, '#a9a69c')}
      {ln(14, -184, 24, -92 - lift(-a) / 2, 26, '#a9a69c')}{ln(24, -92 - lift(-a) / 2, 26, -lift(-a), 26, '#a9a69c')}
      {ln(-6, -324, -52, -250 + a * 10, 24, '#a9a69c')}{ln(-52, -250 + a * 10, -58, -176 + a * 22, 24, '#a9a69c')}
      {ln(6, -324, 52, -250 - a * 10, 24, '#a9a69c')}{ln(52, -250 - a * 10, 58, -176 - a * 22, 24, '#a9a69c')}
      {ln(0, -184, 0, -334, 32)}
      <circle cx={0} cy={-398} r={46} fill={ink} stroke={ink} strokeWidth={12} />
    </g>
  </g>;
};

const W = VO.words;
export const R414_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const Room414 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const T = f / fps;
  const L = VO.line_starts; const E = VO.dur + 0.6;
  const b = (i) => (L[i] !== undefined ? L[i] : E);
  const mo = (t) => 0.45 + 0.4 * Math.sin(t * 10);
  const jayBack = (t, z) => { const p = pj(-70, 500, z); return <BackMan x={p[0]} y={p[1]} s={1.3 / z} w={t * 5.5} rot={Math.sin(t * 2.7) * 1.4} />; };
  const scenes = [
    // 0 hook: hall pulls away
    {a: 0, b: b(1), cam: [[0, 540, 840, 1.0], [b(1), 540, 1010, 1.5]], shake: 0.1,
      draw: (t) => <g><PerspHall t={t} scroll={t * 0.9} endZ={4 + 6.5 * ramp(t, 0.6, b(1) - 0.2)} flick={0} />{jayBack(t, 1.3)}</g>},
    // 1 corridor numbers
    {a: b(1), b: b(2), cam: [[0, 480, 1200, 1.25], [b(2) - b(1), 620, 1220, 1.55]], shake: 0.1,
      draw: (t) => <SideHall f={f} t={t} scroll={t * 380} flick={0.5 * ramp(t, 3.8, 4.0)}>
        <ThickStickMan x={430} y={1500} s={1.3} pose="walk" t={f} facing={1} eyes="wide" rim={null} brow={0.6} />
      </SideHall>,
      overlay: (t) => null},
    // 2 door opens, double steps out
    {a: b(2), b: b(3), cam: [[0, 640, 1250, 1.2], [3.6, 680, 1230, 1.35], [4.4, 640, 1100, 2.2], [b(3) - b(2), 660, 1120, 2.4]], shake: (t) => 0.1 + (t > 1.8 && t < 2.6 ? 0.3 : 0),
      draw: (t) => <SideHall f={f} t={t} scroll={0} open={ramp(t, 0.25, 1.3)} openIdx={2} flick={0.3}>
        <ThickStickMan x={420} y={1500} s={1.3} pose={['walk', 'frozen', ramp(t, 1.0, 2.2)]} t={f} facing={1} eyes="wide" brow={1} />
        {t > 1.6 && <ThickStickMan x={1020 - 250 * ramp(t, 1.7, 4.2)} y={1500} s={1.3} pose={['walk', 'stand', ramp(t, 3.8, 4.4)]} t={f} facing={-1} eyes="normal" rim={A} opacity={ramp(t, 1.6, 2.0)} />}
      </SideHall>},
    // 3 lobby, bright
    {a: b(3), b: b(4), cam: [[0, 380, 1250, 1.2], [b(4) - b(3), 640, 1250, 1.55]],
      draw: (t) => <Lobby f={f} t={t}
        jay={<ThickStickMan x={140 + 280 * ramp(t, 0.2, 3.0)} y={1500} s={1.3} pose={t < 3.0 ? 'walk' : ['walk', t > 5.0 ? 'talk' : 'slump', ramp(t, 3.0, 3.5)]} t={f} facing={1} eyes="normal" mouth={t > 5.0 ? mo(t) : 0} />}
        clerk={<ThickStickMan x={880} y={1500} s={1.3} pose="lean" t={f} facing={-1} eyes="closed" head="#d9d3bf" ink="#d9d3bf" />} />},
    // 4 different room / sigh
    {a: b(4), b: b(5), cam: [[0, 560, 1200, 1.55], [b(5) - b(4), 600, 1180, 1.9]],
      draw: (t) => <Lobby f={f} t={t} sigh={ramp(t, 2.3, 3.0) * (1 - ramp(t, 3.4, 3.95))}
        jay={<ThickStickMan x={420} y={1500} s={1.3} pose="talk" t={f} facing={1} eyes="normal" mouth={t < 2.3 ? mo(t) : 0} brow={0.3} />}
        clerk={<ThickStickMan x={880} y={1500} s={1.3} pose={['lean', 'slump', ramp(t, 2.3, 3.0)]} t={f} facing={-1} eyes="normal" mouth={0} head="#d9d3bf" ink="#d9d3bf" />} />},
    // 5 the screen
    {a: b(5), b: b(6), cam: [[0, 540, 940, 1.0], [b(6) - b(5), 540, 940, 1.12]], shake: 0.15,
      draw: (t) => <Monitor t={t} rows={t > 3.6 ? 3 : t > 2.4 ? 2 : 1} />},
    // 6 guestbook
    {a: b(6), b: b(7), cam: [[0, 540, 760, 1.0, -1.5], [b(7) - b(6), 560, 760, 1.15, 1.2]],
      draw: (t) => <g><rect x={-700} y={-300} width={3000} height={2600} fill="#0b0d12" />
        <Paper x={540} y={760} w={880} h={980} title="GUEST BOOK" accent={A} t={t} reveal={ramp(t, 0.3, 4.6, (x) => x)}
          lines={[{txt: 'Oct 29   Jay M.   Rm 414'}, {txt: 'Oct 29   Jay M.   Rm 414'}, {txt: 'Oct 29   Jay M.   Rm 414'}, {txt: 'Mar 2024   Jay M.   Rm 414'}, {txt: 'Aug 2022   Jay M.   Rm 414'}, {txt: 'Jun 2019   Jay M.   Rm 414'}, {txt: 'Feb 2016   Jay M.   Rm 414'}, {txt: 'Nov 2012   Jay M.   Rm 414', glow: true}]} />
      </g>},
    // 7 three of him
    {a: b(7), b: b(8), cam: [[0, 640, 1230, 1.15], [b(8) - b(7), 760, 1230, 1.45]],
      draw: (t) => <SideHall f={f} t={t} scroll={t * 300} flick={0.2}>
        <rect x={1280 - t * 300} y={820} width={280} height={680} fill={A} opacity={0.85} />
        <text x={1420 - t * 300} y={1180} textAnchor="middle" fontFamily="Special Elite" fontSize={90} fill="#06231d">414</text>
        <Glow x={1420 - t * 300} y={1150} r={640} color={A} op={0.5} id="d414" />
        {[0, 1, 2].map((i) => <ThickStickMan key={i} x={300 + i * 190} y={1500} s={1.3} pose="walk" t={f + i * 9} facing={1} eyes={i === 2 && t > 2.3 ? 'wide' : 'normal'} look={i === 2 && t > 2.3 ? 1 : 0} rim={A} />)}
      </SideHall>},
    // 8 turn around early
    {a: b(8), b: b(9), cam: [[0, 520, 1250, 1.35], [b(9) - b(8), 500, 1230, 1.7]],
      draw: (t) => { const sc = t < 2.7 ? t * 300 : 810 - (t - 2.7) * 360; const turned = t >= 2.7;
        return <SideHall f={f} t={t} scroll={sc} flick={0.15}>
          <g transform={`translate(${250 - sc} 0)`}><rect x={-100} y={560} width={200} height={72} fill="#06231d" stroke={A} strokeWidth={8} /><text x={0} y={614} textAnchor="middle" fontFamily="Lilita One" fontSize={52} fill={A}>EXIT</text><Glow x={0} y={600} r={380} color={A} op={0.45} id="exit" /></g>
          <ThickStickMan x={500} y={1500} s={1.3} pose="walk" t={f} facing={turned ? -1 : 1} look={turned ? 0 : 1} eyes="wide" brow={0.8} rim={null} />
        </SideHall>; }},
    // 9 loop: back to the far door
    {a: b(9), b: E + 10, cam: [[0, 540, 840, 1.0], [E - b(9), 540, 840, 1.0]], shake: 0.1,
      draw: (t) => <g><PerspHall t={t} scroll={t * 0.9} endZ={10 - 6 * ramp(t, 0.2, E - b(9))} />{jayBack(t, 1.3)}</g>},
  ];
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#090a0f'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 540, 840, 1.0]], draw: (t) => <g><PerspHall t={0} scroll={0} endZ={4} />{jayBack(0, 1.3)}</g>}]} /></AbsoluteFill>}
    <ScreenFlash times={[b(2) + 1.75, b(3), b(6), b(7) + 1.0]} color={A} max={0.35} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'ROOM 414', accent: true, size: 118}, {txt: 'KEPT GETTING'}, {txt: 'FURTHER AWAY'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
