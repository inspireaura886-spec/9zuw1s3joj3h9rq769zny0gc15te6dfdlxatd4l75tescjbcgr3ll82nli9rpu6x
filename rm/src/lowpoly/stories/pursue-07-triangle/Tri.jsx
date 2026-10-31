// "2 Agents Saw a Black Triangle. It Made No Sound." (PURSUE Release 07: FBI-UAP-D043 FD-302 + DOW-UAP-D176 AARO MFR) - ANIME-NOIR look.
// Document-accurate (case FACTCHECK.md): late dusk 20:23 with afterglow behind the western ridge; 2 agents on a hilltop post + a third on
// long-range thermal at a secondary post; matte featureless black triangle, NO lights; ~10 s level vertical climb over the ridge, ~20 s hover,
// then sideways at fighter-jet speed, bank, dive into a canyon in 2-3 s; even thermal signature, no exhaust; next-morning search found nothing.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {WordCaption} from '../../kit/Overlay.jsx';
import {AN, Cam, Layer, Svg, DuskSky, Ridge, Triangle, Agent, Figure, ObsPost, Shrub, Motes, Haze, AnimeFinish, RecTag, Slam, QuoteStrip, AnimeFonts, clamp01, ease, easeIn, easeOut, lerp, hash} from '../../../animenoir/AnimeNoirKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const TRI_FRAMES = Math.round(52.3 * FPS);
const CS = [0.0, 2.34, 4.22, 5.91, 10.16, 12.48, 13.64, 15.69, 18.13, 21.22, 23.86, 26.09, 29.54, 31.76, 34.2, 35.98, 37.77, 41.33, 47.45];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? TRI_FRAMES) - C[i];
const L = (s, i) => at(s) - C[i];   // global seconds -> local frame of scene i

// ---------- shared: hilltop + triangle rising over the western ridge ----------
const Rise = ({d, triY0, triY1, triW = 760, push = [1.0, 1.2], hover = false, seedA = 1}) => {
  const f = useCurrentFrame(); const t = clamp01(f / d);
  const ty = hover ? triY0 + Math.sin(f * 0.04) * 0.0 : lerp(triY0, triY1, t);   // perfectly level climb, no wobble
  return <Cam from={{s: push[0], y: 0, x: 0}} to={{s: push[1], y: -50, x: 10}} d={d} mode="out">
    <Layer depth={0}><DuskSky horizon={1180} glowX={420} /></Layer>
    <Layer depth={0.15}><Ridge seed={3} base={1210} amp={170} fill={AN.ridgeFar} rimO={0.75} /></Layer>
    <Layer depth={0.3}><Svg><Triangle x={540} y={ty} w={triW} /></Svg></Layer>
    <Layer depth={0.45}><Ridge seed={8} base={1330} amp={150} fill={AN.ridgeMid} rimO={0.55} freq={0.003} /></Layer>
    <Layer depth={0.45}><Haze y={1330} h={300} o={0.28} /></Layer>
    <Layer depth={1.0}><Svg>
      <path d="M-300,1700 C0,1640 400,1610 700,1630 C900,1645 1200,1690 1400,1720 L1400,2400 L-300,2400 Z" fill={AN.ridgeNear} stroke={AN.ink} strokeWidth={6} />
      <path d="M-300,1700 C0,1640 400,1610 700,1630" fill="none" stroke={AN.rim} strokeWidth={4} opacity={0.6} />
      <Figure x={360} y={1660} h={330} dir={-1} pose="stand" lookUp={0.9} rimO={1} />
      <Figure x={720} y={1675} h={350} dir={-1} pose="point" lookUp={0.8} coat="#2c2a3c" rimO={1} />
    </Svg></Layer>
    <Motes n={26} o={0.35} />
  </Cam>;
};

// ---------- face close-up (anime bust, rim lit by the afterglow) ----------
const FaceCU = ({d, who = 'A', tilt = [0, -16], widen = [0, 1], widenAt = 0.3, look = -0.25, binos = [0, 0], mouth = 0, sweat = 0, x = 560, scale = 2.5, push = [1.0, 1.09], dx = 20}) => {
  const f = useCurrentFrame(); const t = clamp01(f / d); const wt = easeOut((t - widenAt) / 0.25);
  const A = who === 'A' ? {hair: 'spike', seed: 1} : {hair: 'crop', seed: 4, earpiece: true, jacket: '#2c2a3c'};
  return <Cam from={{s: push[0], x: 0, y: 0}} to={{s: push[1], x: dx, y: -20}} d={d} mode="inout">
    <Layer depth={0}><DuskSky horizon={1500} glowX={150} warmth={1.1} /></Layer>
    <Layer depth={0.1}><div style={{position: 'absolute', inset: 0, filter: 'blur(6px)'}}><Ridge seed={who === 'A' ? 5 : 9} base={1560} amp={200} fill={AN.ridgeFar} rimO={0.7} /></div></Layer>
    <Layer depth={0.6}><Svg><Agent x={x} y={1020} scale={scale} look={look} tilt={lerp(tilt[0], tilt[1], ease(t))} widen={lerp(widen[0], widen[1], wt)} binos={lerp(binos[0], binos[1], ease(clamp01(t * 1.6)))} mouth={mouth * wt} sweat={sweat * wt} {...A} /></Svg></Layer>
    <Motes n={18} o={0.4} seed={who === 'A' ? 3 : 6} />
  </Cam>;
};

// ---------- wide establishing: guarded hilltop post at late dusk ----------
const PostWide = ({d}) => {
  const f = useCurrentFrame();
  return <Cam from={{s: 1.25, x: -60, y: 120}} to={{s: 1.0, x: 40, y: 0}} d={d} mode="inout">
    <Layer depth={0}><DuskSky horizon={1100} glowX={180} /></Layer>
    <Layer depth={0.15}><Ridge seed={11} base={1120} amp={150} fill={AN.ridgeFar} rimO={0.8} /></Layer>
    <Layer depth={0.35}><Ridge seed={4} base={1260} amp={220} fill={AN.ridgeMid} rimO={0.5} hatch /></Layer>
    <Layer depth={0.35}><Haze y={1320} h={340} o={0.3} /></Layer>
    <Layer depth={0.8}><Svg>
      <ObsPost x={600} y={1560} scale={1} tripodDir={1} />
      <Figure x={470} y={1470} h={200} dir={1} pose="stand" phase={f * 0.1} />
      <Figure x={560} y={1468} h={210} dir={1} pose="stand" coat="#2c2a3c" phase={f * 0.1 + 2} />
      {/* tiny red beacon on the mast */}
      <circle cx={180} cy={1100} r={7} fill={AN.red} opacity={0.5 + 0.5 * Math.round(Math.sin(f * 0.2) * 0.5 + 0.5)} />
    </Svg></Layer>
    <Motes n={30} o={0.35} />
  </Cam>;
};

// ---------- the third agent on long-range thermal, radioing it in ----------
const Spotter = ({d}) => {
  const f = useCurrentFrame(); const t = clamp01(f / d);
  return <Cam from={{s: 1.0, x: 30, y: 0}} to={{s: 1.12, x: -30, y: -30}} d={d}>
    <Layer depth={0}><DuskSky horizon={1350} glowX={120} /></Layer>
    <Layer depth={0.2}><Ridge seed={21} base={1380} amp={180} fill={AN.ridgeFar} rimO={0.7} /></Layer>
    <Layer depth={0.5}><Svg>
      {/* big long-range thermal rig on tripod, screen shows a white-hot blip */}
      <g transform="translate(250,1150)">
        <line x1={0} y1={60} x2={-90} y2={520} stroke={AN.ink} strokeWidth={14} /><line x1={0} y1={60} x2={90} y2={520} stroke={AN.ink} strokeWidth={14} /><line x1={0} y1={60} x2={0} y2={540} stroke={AN.ink} strokeWidth={14} />
        <rect x={-150} y={-90} width={300} height={150} rx={16} fill="#2a2f3d" stroke={AN.ink} strokeWidth={7} />
        <rect x={-230} y={-70} width={90} height={110} rx={12} fill="#1b2030" stroke={AN.ink} strokeWidth={7} />
        <rect x={-120} y={-70} width={170} height={110} fill="#2b2b2b" stroke={AN.ink} strokeWidth={5} />
        <polygon points={`${-40 + t * 20},${-10} ${-10 + t * 20},${-10} ${-25 + t * 20},${-28}`} fill="#fff" />
        <circle cx={-25 + t * 20} cy={-16} r={18} fill="none" stroke="#ff6a4a" strokeWidth={3} opacity={0.5 + 0.5 * Math.sin(f * 0.6)} />
        <text x={-112} y={30} fontFamily="Special Elite" fontSize={22} fill="#e6e6e6">WHITE HOT</text>
      </g>
      {/* radio waves */}
      {[0, 1, 2].map((i) => { const p = ((f * 0.05 + i / 3) % 1); return <path key={i} d={`M${640 - 30 - p * 120},${930 - p * 110} a${60 + p * 160},${60 + p * 160} 0 0 0 ${-40 - p * 60},${120 + p * 220}`} fill="none" stroke="#9fd8ff" strokeWidth={5} opacity={(1 - p) * 0.8} />; })}
    </Svg></Layer>
    <Layer depth={0.8}><Svg><Agent x={760} y={1080} scale={1.9} hair="cap" seed={7} look={-0.2} tilt={-4} talk radio={easeOut(t * 3)} jacket="#263040" /></Svg></Layer>
    <Motes n={20} o={0.35} seed={9} />
  </Cam>;
};

// ---------- the two agents sprint across the peak ----------
const Sprint = ({d}) => {
  const f = useCurrentFrame();
  return <Cam from={{s: 1.05, x: 120, y: 0}} to={{s: 1.1, x: -160, y: -10}} d={d} mode="lin" shake={3}>
    <Layer depth={0}><DuskSky horizon={1250} glowX={140} /></Layer>
    <Layer depth={0.2}><Ridge seed={13} base={1290} amp={140} fill={AN.ridgeFar} rimO={0.8} /></Layer>
    <Layer depth={1.0}><Svg>
      <path d="M-500,1500 C-100,1420 400,1400 1600,1460 L1600,2400 L-500,2400 Z" fill={AN.ridgeNear} stroke={AN.ink} strokeWidth={6} />
      <path d="M-500,1500 C-100,1420 400,1400 1600,1460" stroke={AN.rim} strokeWidth={5} fill="none" opacity={0.8} />
      <Figure x={760 - f * 14} y={1428} h={420} dir={-1} pose="run" phase={f * 0.55} rimO={1} />
      <Figure x={1100 - f * 13} y={1436} h={430} dir={-1} pose="run" phase={f * 0.55 + 1.7} coat="#2c2a3c" rimO={1} />
      {/* kicked-up dust */}
      {Array.from({length: 10}, (_, i) => <circle key={i} cx={780 - f * 14 + 40 + i * 14} cy={1430 - (i % 3) * 10} r={6 + i * 1.5} fill="#c9a07a" opacity={0.35 - i * 0.03} />)}
    </Svg></Layer>
    <Layer depth={1.6}><Svg><path d="M-400,1880 C0,1820 600,1840 1800,1900 L1800,2300 L-400,2300 Z" fill="#07060e" /></Svg></Layer>
  </Cam>;
};

// ---------- binocular POV: level vertical climb ----------
const Binos = ({d}) => {
  const f = useCurrentFrame(); const t = clamp01(f / d);
  const sx = Math.sin(f * 0.23) * 6 + Math.sin(f * 0.07) * 9, sy = Math.cos(f * 0.19) * 5;
  return <AbsoluteFill>
    <Cam from={{s: 1.5, x: sx, y: sy + 100}} to={{s: 1.6, x: sx, y: sy + 40}} d={d}>
      <Layer depth={0}><DuskSky horizon={1250} glowX={500} stars={10} /></Layer>
      <Layer depth={0.5}><Svg><Triangle x={540} y={lerp(1170, 900, t)} w={420} /></Svg></Layer>
      <Layer depth={0.6}><Ridge seed={8} base={1330} amp={120} fill={AN.ridgeMid} rimO={0.7} /></Layer>
    </Cam>
    <Svg>
      <defs><mask id="bm"><rect x={0} y={0} width={1080} height={1920} fill="#fff" /><circle cx={330} cy={930} r={420} fill="#000" /><circle cx={750} cy={930} r={420} fill="#000" /></mask></defs>
      <rect x={-50} y={-50} width={1180} height={2020} fill="#050409" mask="url(#bm)" />
      <line x1={540} y1={760} x2={540} y2={1100} stroke="#fff" strokeWidth={2} opacity={0.35} /><line x1={370} y1={930} x2={710} y2={930} stroke="#fff" strokeWidth={2} opacity={0.35} />
      {Array.from({length: 7}, (_, i) => <line key={i} x1={525} y1={790 + i * 46} x2={555} y2={790 + i * 46} stroke="#fff" strokeWidth={2} opacity={0.35} />)}
    </Svg>
  </AbsoluteFill>;
};

// ---------- telephoto close-up: featureless, no lights ----------
const TriCU = ({d}) => {
  const f = useCurrentFrame();
  return <Cam from={{s: 1.0, x: -40, y: 0, r: -1.5}} to={{s: 1.14, x: 40, y: -30, r: 1.0}} d={d}>
    <Layer depth={0}><DuskSky horizon={1600} glowX={700} stars={14} /></Layer>
    <Layer depth={0.3}><Svg><Triangle x={540} y={980 - f * 0.6} w={900} edge={0.5} /></Svg></Layer>
    <Motes n={22} o={0.3} seed={5} />
  </Cam>;
};

// ---------- the dash: from a dead stop, sideways, fast ----------
const Dash = ({d, go}) => {
  const f = useCurrentFrame(); const g = clamp01((f - go) / 14); const u = Math.max(0, f - go);
  const pan = 900 * (1 - Math.exp(-u / 9));                       // whip-pan travel (px) following the object
  const sx = 470 + Math.min(200, u * 7) + Math.max(0, u - 50) * 55;   // object drifts right on screen, then exits
  return <AbsoluteFill>
    <Cam from={{s: 1.1, x: 0, y: 0}} to={{s: 1.1, x: 0, y: 0}} d={d} shake={u > 0 ? 7 : 0}>
      <Layer depth={0}><DuskSky horizon={1220} glowX={260 - pan * 0.05} /></Layer>
      <Layer depth={0.2}><div style={{position: 'absolute', inset: 0, transform: `translateX(${-pan * 0.25}px)`}}><Ridge seed={3} base={1250} amp={160} fill={AN.ridgeFar} rimO={0.7} /></div></Layer>
      <Layer depth={0.5}><div style={{position: 'absolute', inset: 0, transform: `translateX(${-pan * 0.6}px)`}}><Ridge seed={8} base={1380} amp={150} fill={AN.ridgeMid} rimO={0.5} /></div></Layer>
      <Layer depth={1}><div style={{position: 'absolute', inset: 0, transform: `translateX(${-pan * 1.1}px)`}}><Svg>
        <path d="M-300,1760 C100,1700 700,1690 1400,1760 L9000,1760 L9000,2400 L-300,2400 Z" fill={AN.ridgeNear} stroke={AN.ink} strokeWidth={6} />
        <Figure x={300} y={1720} h={300} dir={1} pose="stand" lookUp={0.5} />
        <Figure x={560} y={1716} h={310} dir={1} pose="point" coat="#2c2a3c" lookUp={0.5} />
      </Svg></div></Layer>
    </Cam>
    <Svg><Triangle x={sx} y={880 + u * 2.5} w={360} tilt={6 * g} trail={g} dir={1} /></Svg>
    {u > 0 && <Svg>{Array.from({length: 18}, (_, i) => { const y = 380 + hash(i, 4) * 1050; const xx = 1300 - ((hash(i, 2) * 1500 + u * 110) % 1600); return <line key={i} x1={xx} y1={y} x2={xx + 340} y2={y} stroke="#fff4e0" strokeWidth={3} opacity={0.4 * g} />; })}</Svg>}
  </AbsoluteFill>;
};

// ---------- bank + dive into the canyon ----------
const Dive = ({d}) => {
  const f = useCurrentFrame(); const t = clamp01(f / (d * 0.75));
  const x = lerp(980, 470, easeOut(t)), y = lerp(650, 1480, easeIn(t));
  return <Cam from={{s: 1.0, x: 80, y: -80}} to={{s: 1.12, x: -30, y: 120}} d={d} mode="out" shake={5}>
    <Layer depth={0}><DuskSky horizon={1000} glowX={200} /></Layer>
    <Layer depth={0.2}><Ridge seed={30} base={1050} amp={120} fill={AN.ridgeFar} rimO={0.7} /></Layer>
    {/* canyon floor deep in shadow */}
    <Layer depth={0.5}><Svg><path d="M-300,1300 L1400,1300 L1400,2400 L-300,2400 Z" fill="#0c0a18" /></Svg></Layer>
    <Layer depth={0.5}><Svg>{t < 1 && <Triangle x={x} y={y} w={lerp(320, 220, t)} tilt={lerp(0, -32, ease(clamp01(t * 1.5)))} bank={0.55 * Math.sin(Math.PI * clamp01(t * 1.2))} trail={0.8} dir={-1} />}</Svg></Layer>
    {/* canyon walls (left + right) */}
    <Layer depth={0.75}><Svg>
      <path d="M-300,1000 C-100,1060 160,1180 300,1400 C360,1500 380,1700 360,2400 L-300,2400 Z" fill="#2a1f3c" stroke={AN.ink} strokeWidth={6} />
      <path d="M-300,1000 C-100,1060 160,1180 300,1400" fill="none" stroke={AN.rim} strokeWidth={5} opacity={0.7} />
      <path d="M1400,950 C1100,1020 820,1200 700,1420 C640,1540 620,1800 640,2400 L1400,2400 Z" fill="#1d1630" stroke={AN.ink} strokeWidth={6} />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M${760 + i * 70},${1250 + i * 30} l${-30},${180}`} stroke={AN.ink} strokeWidth={3} opacity={0.4} />)}
    </Svg></Layer>
    <Haze y={1450} h={400} color="120,90,160" o={0.35} />
  </Cam>;
};

// ---------- thermal POV: evenly warm, no exhaust, outruns the scope ----------
const Thermal = ({d}) => {
  const f = useCurrentFrame(); const t = clamp01(f / (d * 0.5));
  const x = lerp(560, -400, easeIn(t)); const lost = t >= 0.92;
  return <AbsoluteFill style={{background: 'linear-gradient(180deg,#141414 0%,#2a2a2a 55%,#3d3d3d 100%)'}}>
    <Cam from={{s: 1.0, x: 0, y: 0}} to={{s: 1.06, x: -20, y: 0}} d={d} shake={lost ? 0 : 4}>
      <Layer depth={0.3}><Svg><path d={'M-300,1250 ' + Array.from({length: 30}, (_, i) => `L${-300 + i * 60},${1200 - Math.sin(i * 0.7) * 50 - (i % 4) * 12}`).join(' ') + ' L1500,2400 L-300,2400 Z'} fill="#5a5a5a" /></Svg></Layer>
      <Layer depth={0.3}><Svg>{!lost && <g style={{filter: 'drop-shadow(0 0 18px #fff)'}}><Triangle x={x} y={900} w={380} edge={0} trail={0} /></g>}
        {!lost && <polygon points={`${x - 190},${900 + 68} ${x + 190},${900 + 68} ${x},${900 - 88}`} fill="#fdfdf6" />}</Svg></Layer>
    </Cam>
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)'}} />
    <Svg>
      {[[90, 420], [990, 420], [90, 1420], [990, 1420]].map(([cx, cy], i) => <path key={i} d={`M${cx + (i % 2 ? -60 : 60)},${cy} L${cx},${cy} L${cx},${cy + (i < 2 ? 60 : -60)}`} stroke="#eaeaea" strokeWidth={5} fill="none" />)}
      <circle cx={540} cy={920} r={70} stroke="#eaeaea" strokeWidth={3} fill="none" /><line x1={540} y1={820} x2={540} y2={1020} stroke="#eaeaea" strokeWidth={2} /><line x1={440} y1={920} x2={640} y2={920} stroke="#eaeaea" strokeWidth={2} />
      <text x={110} y={480} fontFamily="Special Elite" fontSize={36} fill="#eaeaea">WHITE HOT</text>
      <text x={110} y={1390} fontFamily="Special Elite" fontSize={30} fill="#eaeaea">EVEN HEAT · NO EXHAUST</text>
      {lost && Math.floor(f / 6) % 2 === 0 && <text x={540} y={760} textAnchor="middle" fontFamily="Lilita One" fontSize={84} fill={AN.red} stroke="#000" strokeWidth={3}>TRACK LOST</text>}
    </Svg>
  </AbsoluteFill>;
};

// ---------- two agents, frozen in total silence ----------
const TwoFaces = ({d, flat = true}) => {
  const f = useCurrentFrame(); const t = clamp01(f / d);
  return <Cam from={{s: 1.0, x: -20, y: 0}} to={{s: 1.08, x: 20, y: -20}} d={d}>
    <Layer depth={0}><DuskSky horizon={1500} glowX={150} warmth={0.8} /></Layer>
    <Layer depth={0.1}><div style={{position: 'absolute', inset: 0, filter: 'blur(5px)'}}><Ridge seed={14} base={1540} amp={180} fill={AN.ridgeFar} /></div></Layer>
    <Layer depth={0.5}><Svg>
      <Agent x={780} y={1130} scale={1.45} hair="crop" seed={4} earpiece jacket="#2c2a3c" look={-0.35} tilt={-6} widen={0.8} />
      <Agent x={330} y={1180} scale={1.6} hair="spike" seed={1} look={-0.15} tilt={-10} widen={0.7} mouth={0.3} />
    </Svg></Layer>
    {flat && <Svg>
      <text x={540} y={560} textAnchor="middle" fontFamily="Special Elite" fontSize={34} fill="#f3e7d0" opacity={0.9}>WHAT THEY HEARD</text>
      <path d={`M120,640 L960,640`} stroke="#9fe0ff" strokeWidth={5} opacity={0.9} />
      <circle cx={120 + ((f * 18) % 840)} cy={640} r={8} fill="#9fe0ff" />
    </Svg>}
  </Cam>;
};

// ---------- next morning: canyon search ----------
const Morning = ({d, close = false}) => {
  const f = useCurrentFrame();
  if (close) return <Cam from={{s: 1.08, x: 0, y: -60}} to={{s: 1.0, x: 0, y: 40}} d={d}>
    <Layer depth={0}><DuskSky horizon={900} morning /></Layer>
    <Layer depth={0.3}><Svg><path d="M-300,880 C100,820 600,840 1400,900 L1400,2400 L-300,2400 Z" fill="#c98a5c" stroke={AN.ink} strokeWidth={6} /></Svg></Layer>
    <Layer depth={0.8}><Svg>
      <path d="M-300,1300 C200,1260 800,1270 1400,1310 L1400,2400 L-300,2400 Z" fill="#d9a777" stroke={AN.ink} strokeWidth={6} />
      {Array.from({length: 22}, (_, i) => <ellipse key={i} cx={hash(i, 2) * 1080} cy={1360 + hash(i, 3) * 500} rx={10 + hash(i, 4) * 18} ry={6 + hash(i, 5) * 8} fill="#a8794f" stroke={AN.ink} strokeWidth={3} />)}
      <Shrub x={560} y={1420} s={2.4} sway={f * 0.05} />
      <Shrub x={150} y={1380} s={1.2} sway={f * 0.05 + 1} />
      <Figure x={850} y={1520} h={460} dir={-1} pose="stand" lookUp={-0.8} rimO={0} />
    </Svg></Layer>
  </Cam>;
  return <Cam from={{s: 1.0, x: 0, y: 0}} to={{s: 1.14, x: -20, y: -40}} d={d}>
    <Layer depth={0}><DuskSky horizon={800} morning /></Layer>
    <Layer depth={0.3}><Svg>
      <path d="M-300,700 C-50,760 200,900 330,1200 C380,1320 390,1500 380,2400 L-300,2400 Z" fill="#b5683f" stroke={AN.ink} strokeWidth={6} />
      <path d="M1400,650 C1150,740 860,920 760,1220 C720,1340 700,1600 720,2400 L1400,2400 Z" fill="#9a5636" stroke={AN.ink} strokeWidth={6} />
      {Array.from({length: 10}, (_, i) => <path key={i} d={`M${-200 + i * 50},${800 + i * 50} q60,20 120,10`} stroke={AN.ink} strokeWidth={3} opacity={0.35} fill="none" />)}
    </Svg></Layer>
    <Layer depth={0.6}><Svg>
      <path d="M200,1300 C400,1270 700,1270 900,1300 L1000,2400 L100,2400 Z" fill="#e2b282" stroke={AN.ink} strokeWidth={5} />
      <Shrub x={380} y={1400} s={0.7} sway={f * 0.05} /><Shrub x={760} y={1460} s={0.8} sway={f * 0.05 + 2} /><Shrub x={560} y={1330} s={0.5} />
      <Figure x={470 + f * 0.6} y={1520} h={260} dir={-1} pose="walk" phase={f * 0.22} rimO={0} />
      <Figure x={640 + f * 0.55} y={1580} h={280} dir={-1} pose="walk" phase={f * 0.22 + 1.5} coat="#2c2a3c" rimO={0} />
    </Svg></Layer>
    <Motes n={20} o={0.4} color="#fff2d8" seed={8} speed={0.5} />
  </Cam>;
};

// ---------- the discrepancy: 3 s vs over 30 s ----------
const Compare = ({d, aAt, bAt}) => {
  const f = useCurrentFrame();
  const card = (x, y, label, big, sub, startF, sec, color) => { const k = easeOut((f - startF) / 8); if (k <= 0) return null; const sweep = Math.min(1, (f - startF) / (sec > 5 ? 45 : 10));
    return <g transform={`translate(${x + (1 - k) * (x < 540 ? -300 : 300)},${y}) rotate(${x < 540 ? -2 : 2})`} opacity={k}>
      <rect x={-230} y={-250} width={460} height={540} rx={20} fill={AN.paper} stroke={AN.ink} strokeWidth={7} />
      <text x={0} y={-180} textAnchor="middle" fontFamily="Lilita One" fontSize={44} fill="#1d1a16">{label}</text>
      <circle cx={0} cy={0} r={120} fill="#fff" stroke={AN.ink} strokeWidth={7} />
      <path d={`M0,0 L0,-120 A120,120 0 ${sweep * (sec / 60) > 0.5 ? 1 : 0} 1 ${Math.sin(sweep * sec / 60 * 2 * Math.PI) * 120},${-Math.cos(sweep * sec / 60 * 2 * Math.PI) * 120} Z`} fill={color} opacity={0.85} />
      <line x1={0} y1={0} x2={Math.sin(sweep * sec / 60 * 2 * Math.PI) * 110} y2={-Math.cos(sweep * sec / 60 * 2 * Math.PI) * 110} stroke={AN.ink} strokeWidth={8} strokeLinecap="round" />
      <text x={0} y={200} textAnchor="middle" fontFamily="Lilita One" fontSize={84} fill={color} stroke={AN.ink} strokeWidth={2}>{big}</text>
      <text x={0} y={260} textAnchor="middle" fontFamily="Special Elite" fontSize={28} fill="#1d1a16">{sub}</text>
    </g>; };
  return <Cam from={{s: 1.05, x: 0, y: 0}} to={{s: 1.0, x: 0, y: 0}} d={d}>
    <Layer depth={0}><DuskSky horizon={1350} glowX={540} /></Layer>
    <Layer depth={0.2}><Ridge seed={3} base={1420} amp={160} fill={AN.ridgeFar} rimO={0.7} /></Layer>
    <Layer depth={0.6}><Svg>
      <path d="M-300,1690 C100,1640 700,1640 1400,1700 L1400,2400 L-300,2400 Z" fill={AN.ridgeNear} stroke={AN.ink} strokeWidth={6} />
      <Figure x={420} y={1660} h={300} dir={-1} pose="stand" lookUp={0.4} />
      <Figure x={680} y={1668} h={310} dir={-1} pose="stand" coat="#2c2a3c" lookUp={0.4} />
      {card(290, 900, 'FBI STATEMENT', '3 SEC', 'FD-302, co-signed', aAt, 3, AN.red)}
      {card(790, 940, 'PENTAGON RECORD', '30+ SEC', 'AARO memo: 10 + 20 + 3', bAt, 33, '#3a6fd8')}
    </Svg></Layer>
  </Cam>;
};

// ---------- scene table ----------
const SCENES = [
  (d) => <Rise d={d} triY0={1100} triY1={880} triW={800} push={[1.0, 1.28]} />,                         // 0 hook
  (d) => <FaceCU d={d} who="A" widenAt={0.15} />,                                                          // 1 eyes widen
  (d) => <Rise d={d} triY0={860} triY1={820} triW={560} push={[1.1, 1.18]} />,                            // 2 no sound
  (d) => <PostWide d={d} />,                                                                                // 3 guarded hilltop post
  (d) => <Spotter d={d} />,                                                                                 // 4 thermal spotter calls it in
  (d) => <Sprint d={d} />,                                                                                  // 5 sprint across the peak
  (d) => <Binos d={d} />,                                                                                   // 6 straight up, level
  (d) => <TriCU d={d} />,                                                                                   // 7 no tilt, no wobble, no lights
  (d) => <Rise d={d} triY0={900} triY1={900} triW={480} push={[1.0, 1.1]} hover />,                       // 8 hover 20 s
  (d) => <FaceCU d={d} who="B" binos={[1, 0]} widen={[0.2, 1]} widenAt={0.2} mouth={0.5} sweat={1} tilt={[-8, -12]} look={-0.35} />, // 9 twist
  (d) => <TwoFaces d={d} />,                                                                                // 10 they'd hear a drone
  (d) => <Dash d={d} go={L(27.34, 11)} />,                                                                  // 11 shot sideways
  (d) => <Dive d={d} />,                                                                                    // 12 bank + dive into canyon
  (d) => <Thermal d={d} />,                                                                                 // 13 outran the scope
  (d) => <TwoFaces d={d} flat />,                                                                           // 14 total silence
  (d) => <Morning d={d} />,                                                                                 // 15 next morning search
  (d) => <Morning d={d} close />,                                                                           // 16 nothing damaged
  (d) => <Compare d={d} aAt={L(42.15, 17)} bAt={L(45.39, 17)} />,                                           // 17 3 s vs 30+ s
  (d) => <Rise d={d} triY0={1190} triY1={1100} triW={800} push={[1.22, 1.0]} />,                          // 18 loop back to frame 0
];

const TEXT = [
  {lines: [{text: '2 AGENTS.'}, {text: 'ZERO SOUND.', red: true}], at: 0, out: at(2.3)},
  {lines: [{text: '2026 · 8:23 PM'}], at: at(6.0), out: at(10.1), size: 80},
  {lines: [{text: 'NO TILT.'}], at: at(15.69), out: at(16.5), size: 110},
  {lines: [{text: 'NO TILT.'}, {text: 'NO WOBBLE.'}], at: at(16.51), out: at(17.36), size: 110},
  {lines: [{text: 'NO TILT.'}, {text: 'NO WOBBLE.'}, {text: 'NO LIGHTS.', red: true}], at: at(17.37), out: at(18.1), size: 110},
  {lines: [{text: 'HOVER:'}, {text: '20 SECONDS', red: true}], at: at(20.2), out: at(21.2), size: 100},
  {lines: [{text: 'A DRONE 1 MILE AWAY'}, {text: 'WOULD BE LOUD.', red: true}], at: at(21.22), out: at(23.8), size: 86},
  {lines: [{text: 'FIGHTER-JET'}, {text: 'FAST.', red: true}], at: at(28.26), out: at(29.5), size: 104},
  {lines: [{text: 'NO WRECKAGE.'}], at: at(37.77), out: at(38.62), size: 96},
  {lines: [{text: 'NO WRECKAGE.'}, {text: 'NO SCARRED GROUND.'}], at: at(38.63), out: at(39.82), size: 90},
  {lines: [{text: 'NO WRECKAGE.'}, {text: 'NO SCARRED GROUND.'}, {text: 'NO DAMAGED PLANT.', red: true}], at: at(39.83), out: at(41.3), size: 86},
  {lines: [{text: 'THE PENTAGON?'}, {text: 'OR THE 2 AGENTS?', red: true}], at: at(47.45), out: TRI_FRAMES, size: 96},
];
const REC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18];

export const TRI = () => {
  const f = useCurrentFrame();
  const si = C.findIndex((c, i) => f >= c && f < (C[i + 1] ?? TRI_FRAMES));
  return <AbsoluteFill style={{background: '#000'}}>
    <AnimeFonts />
    {SCENES.map((S, i) => <Sequence key={i} from={C[i]} durationInFrames={dur(i)}>{S(dur(i))}</Sequence>)}
    <AnimeFinish leaks={C.slice(1)} />
    {REC.includes(si) && <RecTag />}
    {TEXT.map((t, i) => <Slam key={i} lines={t.lines} at={t.at} out={t.out} size={t.size || 104} y={300} />)}
    <QuoteStrip text="a substantial, nonreflective, dark black triangular object most resembling a delta wing drone" source="FBI FD-302 · AGENTS' STATEMENT" at={at(18.3)} out={at(20.1)} y={430} />
    <QuoteStrip text="neither [REDACTED] nor I detected any auditory output" source="FBI FD-302 · AGENTS' STATEMENT" at={at(34.2)} out={at(35.95)} y={760} />
    <WordCaption words={VO.words} y={1310} size={92} />
  </AbsoluteFill>;
};
