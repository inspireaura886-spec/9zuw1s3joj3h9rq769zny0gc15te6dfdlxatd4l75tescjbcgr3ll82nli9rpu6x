// nottrue Short: floor-zero (liminal). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp} from '../World.jsx';
import VO from '../data/floor-zero.vo.json';

const A = '#ffc23d';
const Panel = ({x, y, s = 1, zero = 1, lit = 0}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-170} y={-330} width={340} height={660} rx={30} fill="#15161a" stroke="#3a3d46" strokeWidth={14} />
  {[4, 3, 2, 1].map((n, i) => <g key={n}><circle cx={0} cy={-240 + i * 130} r={46} fill="#0a0a0d" stroke="#8a8d99" strokeWidth={8} />
    <text x={0} y={-222 + i * 130} textAnchor="middle" fontSize={56} fontFamily="Impact, sans-serif" fill="#cfd2dc">{n}</text></g>)}
  <g opacity={zero}><circle cx={0} cy={280} r={46} fill="#1a1405" stroke={A} strokeWidth={10} />
    <text x={0} y={300} textAnchor="middle" fontSize={60} fontFamily="Impact, sans-serif" fill={A}>0</text>
    <Glow x={0} y={280} r={260} color={A} op={0.35 + 0.25 * lit} id={'pz' + Math.round(x)} /></g>
</g>;
const Elev = ({f, t, pose = 'stand', eyes = 'normal', brow = 0, look = 0, x = 400, s = 1.3, zero = 0, coat = false, corner = false, glow = A}) => <g>
  <rect x={-400} y={-400} width={1880} height={2720} fill="#0e0d0a" />
  <rect x={120} y={420} width={840} height={1100} fill="#17150f" stroke="#2c281b" strokeWidth={10} />
  <rect x={-400} y={1500} width={1880} height={900} fill="#0a0907" />
  <Glow x={540} y={300} r={700} color={glow} op={0.18} id="el" />
  {zero > 0 && <Panel x={1020} y={950} s={0.8} zero={zero} />}
  <ThickStickMan x={corner ? 960 : x} y={1500} s={s} pose={pose} t={f} facing={corner ? 0 : 1} eyes={eyes} brow={brow} look={look} rim={coat ? '#ff4d3d' : A} variant={corner ? 'shadow' : undefined} />
</g>;
const Lobby = ({f, t, ghost = false, empty = true, pose = 'stand', eyes = 'normal', figX = 300}) => <g>
  <rect x={-400} y={-400} width={1880} height={2720} fill="#0b0c0d" />
  <rect x={-400} y={1500} width={1880} height={900} fill="#08090a" />
  {[0, 1, 2].map(i => <g key={i} transform={`translate(${160 + i * 380} 560)`}><circle r={90} fill="#14161a" stroke="#4a4f5c" strokeWidth={10} />
    <line x1={0} y1={0} x2={0} y2={-60} stroke={A} strokeWidth={10} strokeLinecap="round" /><line x1={0} y1={0} x2={-40} y2={-5} stroke={A} strokeWidth={10} strokeLinecap="round" /></g>)}
  <rect x={560} y={1300} width={360} height={200} rx={10} fill="#1b1d22" />
  {ghost && <ThickStickMan x={740} y={1290} s={0.9} pose="sit" t={f} facing={0} rim="#ff4d3d" />}
  <ThickStickMan x={figX} y={1500} s={1.3} pose={pose} t={f} facing={1} eyes={eyes} rim={A} />
</g>;
const Cam = ({t, zoomed = false}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#06080a" />
  <rect x={120} y={500} width={840} height={620} fill="#0b100e" stroke="#2e3a34" strokeWidth={12} />
  <ThickStickMan x={540} y={1100} s={0.55} pose="stand" t={t * 30} facing={0} variant="shadow" eyes="glow" rim="#ff4d3d" />
  <text x={140} y={550} fill="#6bff9a" fontSize={30} fontFamily="Impact, sans-serif">LIFT CAM   REC</text>
  <Glow x={540} y={800} r={700} color="#6bff9a" op={0.12} id="cm" />
</g>;
const Hook = ({t}) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#0b0a07" /><Panel x={540} y={900} s={1.6} zero={1} lit={Math.sin(t * 8) * 0.5 + 0.5} /></g>;

const W = VO.words;
export const FZ_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const FloorZero = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const scenes = [
    {a: 0, b: 3.4, cam: [[0, 540, 900, 1.0], [3.4, 540, 900, 1.3]], draw: (t) => <Hook t={t} />},
    {a: 3.4, b: 5.5, cam: [[0, 400, 1250, 1.2], [2.1, 500, 1250, 1.6]], draw: (t) => <Elev f={f} t={t} zero={1} pose="reach" eyes="wide" />},
    {a: 5.5, b: 8.0, cam: [[0, 400, 1250, 1.2], [2.5, 400, 1200, 1.6]], draw: (t) => <Lobby f={f} t={t} pose="sneak" figX={250 + t * 80} eyes="wide" />},
    {a: 8.0, b: 11.8, cam: [[0, 540, 600, 1.0], [3.8, 540, 700, 1.8]], draw: (t) => <Lobby f={f} t={t} pose="frozen" eyes="wide" figX={300} />},
    {a: 11.8, b: 15.4, cam: [[0, 700, 1250, 1.2], [3.6, 740, 1300, 2.0]], shake: 0.3, draw: (t) => <Lobby f={f} t={t} ghost pose="frozen" eyes="wide" />},
    {a: 15.4, b: 19.4, cam: [[0, 500, 1250, 1.2], [4, 500, 1250, 1.6]], draw: (t) => <Elev f={f} t={t} zero={1} pose="run" />},
    {a: 19.4, b: 22.4, cam: [[0, 400, 1250, 1.3], [3, 400, 1250, 1.6]], draw: (t) => <Lobby f={f} t={t} pose="wave" />},
    {a: 22.4, b: 26.0, cam: [[0, 300, 1250, 1.2], [3.6, 330, 1250, 1.6]], draw: (t) => <Lobby f={f} t={t} pose="stand" eyes="wide" />},
    {a: 26.0, b: 29.7, cam: [[0, 300, 1250, 1.4], [3.7, 330, 1250, 1.9]], shake: 0.3, draw: (t) => <Lobby f={f} t={t} pose="frozen" eyes="wide" />},
    {a: 29.7, b: 35.5, cam: [[0, 540, 900, 1.0], [5.8, 540, 900, 1.5]], draw: (t) => <Cam t={t} />},
    {a: 35.5, b: 41.5, cam: [[0, 400, 1250, 1.2], [6, 420, 1250, 1.7]], draw: (t) => <Elev f={f} t={t} pose="walk" x={300 + t * 60} />},
    {a: 41.5, b: 45.2, cam: [[0, 700, 1250, 1.2], [3.7, 800, 1250, 1.7]], draw: (t) => <Elev f={f} t={t} pose="stand" x={900} s={1.2} zero={0} />},
    {a: 45.2, b: 70, cam: [[0, 540, 900, 1.0], [5, 540, 900, 1.5]], draw: (t) => <Hook t={t} />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#0b0a07'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 540, 900, 1.0]], draw: (t) => <Hook t={t} />}]} /></AbsoluteFill>}
    <ScreenFlash times={[0, 3.4, 11.8, 15.4, 26.0, 29.7, 45.2]} color={A} max={0.4} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'A BUTTON', accent: true, size: 92}, {txt: "THAT WASN'T"}, {txt: 'THERE YESTERDAY'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
