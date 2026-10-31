// nottrue Short #3: eleven-customers (night shift). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, Glow, Captions, HookTitle, ScreenFlash, Finish, FontFaces, ramp, mouthAt} from '../World.jsx';
import VO from '../data/eleven-customers.vo.json';
import M from '../data/eleven-customers.mouth.json';

const A = '#7dff4a';
const Monitor = ({x, y, s = 1, t, aisle = 4, fig = true, wave = 0}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-330} y={-250} width={660} height={500} rx={24} fill="#05080a" stroke="#3a4048" strokeWidth={16} />
  <rect x={-300} y={-220} width={600} height={440} fill="#0b1510" />
  {[0, 1, 2, 3, 4].map(i => <rect key={i} x={-270 + i * 110} y={-120} width={50} height={280} fill="#16241b" stroke="#264a30" strokeWidth={3} />)}
  {fig && <g transform={`translate(${-270 + aisle * 110 + 25} 160)`}><ThickStickMan x={0} y={0} s={0.34} pose={wave ? 'wave' : 'stand'} t={t * 30} facing={0} variant="shadow" eyes="glow" rim={A} /></g>}
  <text x={-285} y={-190} fill={A} fontSize={26} fontFamily="Impact, sans-serif">CAM 02  AISLE {aisle}   REC</text>
  <text x={285} y={-190} textAnchor="end" fill="#ff4a4a" fontSize={26} fontFamily="Impact, sans-serif">CUSTOMERS: 11</text>
</g>;
const Store = ({f, t, pose = 'stand', eyes = 'normal', brow = 0, mouth = 0, look = 0, aisle = 4, figX = 300, figS = 1.3, behind = 0, trucker = 0, wave = 0, mon = true, fig = true, facing = 1}) => <g>
  <rect x={-400} y={-400} width={1880} height={2720} fill="#0d1210" />
  <rect x={-400} y={1500} width={1880} height={900} fill="#0a0e0c" />
  {[0, 1, 2].map(i => <rect key={i} x={-60 + i * 520} y={560} width={120} height={760} fill="#141c18" stroke="#1f2d25" strokeWidth={8} />)}
  <rect x={-100} y={1380} width={1300} height={150} rx={14} fill="#1b2420" />
  <Glow x={540} y={900} r={900} color={A} op={0.12} id="sg" />
  {mon && <Monitor x={780} y={1100} s={0.7} t={t} aisle={aisle} wave={wave} />}
  {trucker > 0 && <g opacity={trucker}><ThickStickMan x={880} y={1500} s={1.2} pose="stand" t={f} facing={0} mouth={0.5} eyes="normal" rim="#ffffff" /></g>}
  {fig && <ThickStickMan x={figX} y={1500} s={figS} pose={pose} t={f} facing={facing} eyes={eyes} brow={brow} mouth={mouth} look={look} rim={A} />}
  {behind > 0 && <g opacity={behind}><ThickStickMan x={figX - 70} y={1500} s={figS * 1.15} pose="lean" t={f} facing={1} variant="shadow" eyes="glow" rim={A} /></g>}
</g>;
const Bg = ({t, aisle, wave, fig = true, id}) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#07100b" /><Glow x={540} y={900} r={700} color={A} op={0.3} id={id} /><Monitor x={540} y={900} s={1.45} t={t} aisle={aisle} wave={wave} fig={fig} /></g>;

const W = VO.words;
export const EC_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const ElevenCustomers = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const hook = (t) => <Bg t={t} aisle={4} id="h" />;
  const scenes = [
    {a: 0, b: 3.1, cam: [[0, 540, 900, 1.0], [3.1, 540, 900, 1.3]], draw: hook},
    {a: 3.1, b: 6.4, cam: [[0, 300, 1250, 1.2], [3.3, 340, 1250, 1.6]], draw: (t) => <Store f={f} t={t} pose="talk" mouth={0.5 + 0.5 * Math.abs(Math.sin(t * 12))} />},
    {a: 6.4, b: 11.7, cam: [[0, 540, 900, 1.1], [5.3, 540, 900, 1.5]], draw: (t) => <Bg t={t} aisle={4} id="a" />},
    {a: 11.7, b: 14.1, cam: [[0, 300, 1250, 1.3], [2.4, 320, 1250, 1.7]], shake: 0.3, draw: (t) => <Store f={f} t={t} pose="lookback" eyes="wide" brow={1} look={1} aisle={3} />},
    {a: 14.1, b: 16.7, cam: [[0, 540, 900, 1.2], [2.6, 540, 900, 1.6]], draw: (t) => <Bg t={t} aisle={3} id="b" />},
    {a: 16.7, b: 20.0, cam: [[0, 300, 1250, 1.4], [3.3, 320, 1250, 1.7]], draw: (t) => <Store f={f} t={t} pose={t > 1.5 ? 'wave' : 'stand'} eyes="wide" brow={0.6} aisle={2} wave={t > 1.5 ? 1 : 0} />},
    {a: 20.0, b: 23.3, cam: [[0, 540, 900, 1.1], [3.3, 540, 900, 1.5]], draw: (t) => <Bg t={t} aisle={2} wave={1} id="c" />},
    {a: 23.3, b: 29.3, cam: [[0, 500, 1250, 1.2], [6, 560, 1250, 1.5]], draw: (t) => <Store f={f} t={t} pose="talk" mouth={0.4 + 0.4 * Math.abs(Math.sin(t * 11))} trucker={ramp(t, 0.2, 0.8)} aisle={2} />},
    {a: 29.3, b: 34.7, cam: [[0, 700, 1250, 1.3], [5.4, 800, 1250, 1.8]], draw: (t) => <Store f={f} t={t} pose="frozen" eyes="wide" brow={1} trucker={1} aisle={1} look={0.5} />},
    {a: 34.7, b: 36.8, cam: [[0, 540, 900, 1.3], [2.1, 540, 900, 1.8]], shake: 0.4, draw: (t) => <Bg t={t} aisle={1} id="d" />},
    {a: 36.8, b: 43.7, cam: [[0, 300, 1250, 1.5], [6.9, 300, 1230, 2.2]], shake: 0.4, draw: (t) => <Store f={f} t={t} pose="frozen" eyes="wide" brow={1} mon={false} behind={ramp(t, 0.2, 3) * 0.95} aisle={0} />},
    {a: 43.7, b: 46.2, cam: [[0, 300, 1250, 1.6], [2.5, 300, 1250, 1.9]], draw: (t) => <Store f={f} t={t} pose="cower" eyes="closed" mon={false} behind={0.95} />},
    {a: 46.2, b: 52.0, cam: [[0, 520, 1200, 1.0], [5.8, 520, 1200, 1.3]], draw: (t) => <Store f={f} t={t} pose="slump" eyes="normal" aisle={3} fig={t < 2.5} figX={300 + t * 150} facing={1} />},
    {a: 52.0, b: 70, cam: [[0, 540, 900, 1.0], [5, 540, 900, 1.4]], draw: (t) => <Bg t={t} aisle={Math.min(4, Math.floor(t * 1.2))} id="e" />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#07100b'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 540, 900, 1.0]], draw: hook}]} /></AbsoluteFill>}
    <ScreenFlash times={[0, 3.1, 11.7, 20.0, 29.3, 34.7, 36.8, 52.0]} color={A} max={0.4} />
    <ScreenFlash times={[0.02]} color="#ffffff" max={0.5} len={0.3} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'THE CAMERA', accent: true, size: 92}, {txt: 'SHOWED 11'}, {txt: 'HE SERVED 10'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
