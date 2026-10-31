// nottrue Short: second-voice (twist). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp} from '../World.jsx';
import VO from '../data/second-voice.vo.json';
const A = '#c86bff';
const Room = ({f, t, nora = 'stand', nx = 400, nf = 1, eyes = 'normal', girl = 0, monitor = 0, crib = false, look = 0, s = 1.3, mom = false}) => <g>
  <rect x={-500} y={-500} width={2100} height={3000} fill="#0a0810" />
  <rect x={-500} y={1500} width={2100} height={1000} fill="#120e1a" />
  <rect x={700} y={500} width={260} height={360} fill="#16122a" stroke="#2c2640" strokeWidth={8} />
  <circle cx={830} cy={600} r={50} fill="#d8d4ff" opacity={0.5} />
  {crib && <g><rect x={640} y={1250} width={380} height={250} fill="#1a1426" stroke={A} strokeWidth={8} /><circle cx={830} cy={1300} r={36} fill="#e8e0ff" /></g>}
  {girl > 0 && <g opacity={girl}><ThickStickMan x={150} y={1500} s={s} pose="sit" t={f} facing={1} variant="shadow" eyes="glow" mouth={0.5 + 0.4 * Math.sin(t * 9)} rim={A} /></g>}
  {mom && <ThickStickMan x={880} y={1500} s={s} pose="frozen" t={f} facing={0} eyes="wide" rim="#e8e0ff" />}
  <ThickStickMan x={nx} y={1500} s={s} pose={nora} t={f} facing={nf} eyes={eyes} look={look} rim={A} />
  {monitor > 0 && <g opacity={monitor}><rect x={120} y={1380} width={150} height={120} rx={14} fill="#15111f" stroke={A} strokeWidth={8} /><Glow x={195} y={1440} r={260} color={A} op={0.4 + 0.2 * Math.sin(t * 8)} id="mon" /></g>}
</g>;
const Screen = ({t}) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#0a0810" />
  <rect x={140} y={600} width={800} height={600} rx={30} fill="#120e1c" stroke={A} strokeWidth={14} />
  {[0, 1, 2, 3, 4, 5, 6].map(i => <rect key={i} x={220 + i * 100} y={900 - (30 + 90 * Math.abs(Math.sin(t * 7 + i * 1.3)))} width={50} height={60 + 180 * Math.abs(Math.sin(t * 7 + i * 1.3))} fill={A} />)}
  <text x={540} y={1330} textAnchor="middle" fontSize={64} fontFamily="Impact, sans-serif" fill={A}>BABY MONITOR 9:00</text>
  <Glow x={540} y={900} r={700} color={A} op={0.25} id="scr" /></g>;
const W = VO.words;
export const SV_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const SecondVoice = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const L = VO.line_starts; const E = VO.dur + 0.6;
  const b = (i) => (L[i] !== undefined ? L[i] : E);
  const sc = (i, j, draw, z0 = 1.3, z1 = 1.8, extra = {}) => ({a: i === 0 ? 0 : b(i), b: j >= 10 ? E + 10 : b(j), cam: [[0, 540, 1250, z0], [Math.max(1, b(j) - b(i)), 560, 1250, z1]], ...extra, draw});
  const scenes = [
    sc(0, 1, (t) => <Screen t={t} />, 1.0, 1.4),
    sc(1, 2, (t) => <Room f={f} t={t} nora="stand" nx={500} monitor={1} eyes="wide" girl={0} />, 1.3, 1.9, {shake: 0.2}),
    sc(2, 3, (t) => <Room f={f} t={t} nora="run" nx={150 + t * 120} crib eyes="wide" />, 1.2, 1.5),
    sc(3, 4, (t) => <Room f={f} t={t} nora="walk" nx={700 - t * 80} monitor={0.6} crib look={1} />, 1.3, 1.6),
    sc(4, 5, (t) => <Room f={f} t={t} nora="cower" nx={450} monitor={1} girl={0.4} eyes="wide" />, 1.4, 2.0, {shake: 0.3}),
    sc(5, 6, (t) => <Room f={f} t={t} nora="phone" nx={500} eyes="wide" monitor={1} />, 1.4, 1.9),
    sc(6, 7, (t) => <Room f={f} t={t} nora="frozen" nx={500} eyes="wide" girl={1} mom />, 1.1, 1.5, {shake: 0.2}),
    sc(7, 8, (t) => <Screen t={t} />, 1.0, 1.6, {shake: 0.2}),
    sc(8, 9, (t) => <Room f={f} t={t} nora="slump" nx={300} girl={1} eyes="glow" />, 1.4, 2.0),
    sc(9, 10, (t) => <Screen t={t} />, 1.0, 1.4),
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#0a0810'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 540, 1250, 1.0]], draw: (t) => <Screen t={t} />}]} /></AbsoluteFill>}
    <ScreenFlash times={[b(1), b(4), b(6), b(8)]} color={A} max={0.4} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'THE MONITOR', accent: true, size: 92}, {txt: 'PICKED UP'}, {txt: 'A SECOND VOICE'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
