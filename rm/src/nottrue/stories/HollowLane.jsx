// nottrue Short: hollow-lane (don't look behind you). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp} from '../World.jsx';
import VO from '../data/hollow-lane.vo.json';

const A = '#ff7a1a';
const Road = ({f, t, figX = 300, pose = 'walk', eyes = 'normal', s = 1.3, look = 0, thing = 0, thingX = 80, porch = 0, mom = false, momPose = 'wave', two = false, facing = 1, brow = 0}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#07080c" />
  <circle cx={820} cy={300} r={120} fill="#1a1d28" />
  <rect x={-500} y={1500} width={2100} height={1000} fill="#0c0d12" />
  {[0, 1, 2, 3].map(i => <g key={i} transform={`translate(${100 + i * 330} 1500)`}><line x1={0} y1={0} x2={0} y2={-620} stroke="#1c1e28" strokeWidth={16} />
    <line x1={0} y1={-500} x2={-90} y2={-380} stroke="#1c1e28" strokeWidth={12} /><line x1={0} y1={-420} x2={80} y2={-330} stroke="#1c1e28" strokeWidth={12} /></g>)}
  <path d="M-500 1560 L1600 1560" stroke="#1a1c26" strokeWidth={6} />
  {porch > 0 && <g opacity={porch}>
    <rect x={820} y={1000} width={300} height={500} fill="#141218" stroke="#2c2830" strokeWidth={8} />
    <circle cx={970} cy={1080} r={34} fill="#ffd9a0" /><Glow x={970} y={1080} r={520} color="#ffb060" op={0.5} id="porch" />
    {mom && <ThickStickMan x={980} y={1500} s={1.0} pose={momPose} t={f} facing={0} eyes="wide" rim="#ffe2b0" />}
  </g>}
  {thing > 0 && <g opacity={thing}><ThickStickMan x={figX - thingX} y={1500} s={s} pose="stand" t={f} facing={1} variant="shadow" eyes="glow" rim="#ff3d3d" /></g>}
  {two && <ThickStickMan x={figX + 150} y={1500} s={s} pose="frozen" t={f} facing={1} variant="shadow" eyes="glow" rim="#ff3d3d" />}
  <ThickStickMan x={figX} y={1500} s={s} pose={pose} t={f} facing={facing} eyes={eyes} look={look} brow={brow} rim={A} />
</g>;
const Sign = ({t}) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#07080c" />
  <rect x={300} y={700} width={480} height={160} rx={10} fill="#1a1612" stroke={A} strokeWidth={10} />
  <text x={540} y={810} textAnchor="middle" fontSize={64} fontFamily="Impact, sans-serif" fill={A}>HOLLOW LN</text>
  <line x1={540} y1={860} x2={540} y2={1500} stroke="#2a2c36" strokeWidth={22} />
  <Glow x={540} y={780} r={620} color={A} op={0.25 + 0.1 * Math.sin(t * 6)} id="sg" />
  <ThickStickMan x={540} y={1700} s={1.1} pose="stand" t={t * 30} facing={0} variant="shadow" eyes="glow" rim="#ff3d3d" /></g>;

const W = VO.words;
export const HL_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const HollowLane = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const z = (a, b, c) => [[0, a, 1250, b], [9, c, 1250, b + 0.4]];
  const scenes = [
    {a: 0, b: 4.8, cam: [[0, 540, 900, 1.0], [4.8, 540, 900, 1.4]], draw: (t) => <Sign t={t} />},
    {a: 4.8, b: 9.4, cam: [[0, 400, 1250, 1.3], [4.6, 500, 1250, 1.6]], draw: (t) => <Road f={f} t={t} pose="walk" figX={200 + t * 50} look={0} eyes="wide" thing={t > 3 ? 0.4 : 0} thingX={400} />},
    {a: 9.4, b: 14.7, cam: [[0, 450, 1250, 1.4], [5.3, 450, 1250, 2.0]], shake: 0.2, draw: (t) => <Road f={f} t={t} pose="frozen" figX={400} eyes="wide" thing={0.7} thingX={300 - t * 25} />},
    {a: 14.7, b: 21.6, cam: [[0, 600, 1250, 1.2], [6.9, 800, 1250, 1.5]], draw: (t) => <Road f={f} t={t} pose="walk" figX={300 + t * 60} porch={Math.min(1, t)} mom momPose="wave" />},
    {a: 21.6, b: 26.4, cam: [[0, 500, 1250, 1.4], [4.8, 500, 1250, 2.1]], shake: 0.3, draw: (t) => <Road f={f} t={t} pose="frozen" figX={600} eyes="wide" porch={1} thing={0.7} thingX={200} />},
    {a: 26.4, b: 31.5, cam: [[0, 900, 1250, 1.6], [5.1, 960, 1250, 2.2]], draw: (t) => <Road f={f} t={t} pose="stand" figX={500} porch={1} mom momPose="frozen" eyes="wide" />},
    {a: 31.5, b: 36.7, cam: [[0, 540, 1250, 1.3], [5.2, 620, 1250, 1.8]], shake: 0.25, draw: (t) => <Road f={f} t={t} pose="sneak" figX={400 + t * 40} porch={1} mom thing={0.8} thingX={160 - t * 20} eyes="wide" />},
    {a: 36.7, b: 39.6, cam: [[0, 560, 1250, 1.2], [2.9, 600, 1250, 1.7]], draw: (t) => <Road f={f} t={t} pose="run" figX={300 + t * 150} porch={1} mom two eyes="wide" />},
    {a: 39.6, b: 44.8, cam: [[0, 900, 1250, 1.5], [5.2, 900, 1250, 2.0]], draw: (t) => <Road f={f} t={t} pose="hug" figX={800} porch={1} mom={false} eyes="wide" />},
    {a: 44.8, b: 50.8, cam: [[0, 540, 1250, 1.2], [6, 540, 1250, 1.8]], draw: (t) => <Road f={f} t={t} pose="stand" figX={480} porch={0.5} thing={0.8} thingX={-200} two />},
    {a: 50.8, b: 70, cam: [[0, 540, 900, 1.0], [5, 540, 900, 1.4]], draw: (t) => <Sign t={t} />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#07080c'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 540, 900, 1.0]], draw: (t) => <Sign t={t} />}]} /></AbsoluteFill>}
    <ScreenFlash times={[0, 9.4, 21.6, 36.7, 44.8]} color={A} max={0.4} />
    <HookTitle accent={A} until={2.8} lines={[{txt: "DON'T TURN", accent: true, size: 92}, {txt: 'WHEN IT SAYS'}, {txt: 'YOUR NAME'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
