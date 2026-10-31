// nottrue Short #2: voicemail-312 (found-footage/voicemail). Fictional.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, NightSky, Fog, Glow, Captions, HookTitle, ScreenFlash, Finish, FontFaces, kv, ramp, clamp, mouthAt} from '../World.jsx';
import VO from '../data/voicemail-312.vo.json';
import M from '../data/voicemail-312.mouth.json';

const A = '#36d1ff';
const Phone = ({x, y, s = 1, t, label = 'MY NUMBER', sub = 'VOICEMAIL  03:12 AM  TOMORROW', play = 0, rot = 0}) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
  <rect x={-190} y={-380} width={380} height={760} rx={46} fill="#0a0c12" stroke="#3c4152" strokeWidth={14} />
  <rect x={-170} y={-350} width={340} height={700} rx={30} fill="#0e1622" />
  <text x={0} y={-230} textAnchor="middle" fill={A} fontSize={42} fontWeight={900} fontFamily="Impact, sans-serif">{label}</text>
  <text x={0} y={-170} textAnchor="middle" fill="#9fb4c8" fontSize={22} fontFamily="Impact, sans-serif">{sub}</text>
  {Array.from({length: 22}).map((_, i) => { const h = 14 + 70 * Math.abs(Math.sin(i * 1.7 + t * 9 * (0.3 + play))) * (0.3 + 0.7 * play); return <rect key={i} x={-140 + i * 13} y={20 - h / 2} width={8} height={h} rx={4} fill={A} opacity={0.5 + 0.5 * play} />; })}
  <circle cx={0} cy={230} r={52} fill={A} opacity={0.9} /><path d="M-16 205 L28 230 L-16 255Z" fill="#06101a" />
</g>;
const Room = ({t, f, door = 0, pose = 'sit', eyes = 'normal', brow = 0, mouth = 0, look = 0, lamp = 0.6, phone = true, fig = true, figX = 420, figS = 1.3, behind = 0, knock = 0}) => <g>
  <rect x={-400} y={-400} width={1880} height={2720} fill="#13151d" />
  <rect x={640} y={520} width={300} height={880} fill="#0b0c12" stroke="#2c3040" strokeWidth={18} />
  <rect x={640} y={520} width={300} height={880} fill={A} opacity={door * 0.35} />
  <circle cx={680} cy={980} r={14} fill="#c9a96a" />
  <Glow x={520} y={1250} r={700} color={A} op={0.14 + 0.1 * lamp + knock * 0.15} id="rg" />
  <rect x={-100} y={1500} width={1300} height={900} fill="#0d0f16" />
  <rect x={-60} y={1380} width={640} height={140} rx={16} fill="#1d2130" />
  {fig && <ThickStickMan x={figX} y={1500} s={figS} pose={pose} t={f} facing={1} eyes={eyes} brow={brow} mouth={mouth} look={look} rim={A} />}
  {behind > 0 && <g opacity={behind}><ThickStickMan x={figX + 30} y={1500} s={figS * 1.12} pose="stand" t={f} facing={1} variant="shadow" eyes="glow" rim={A} /></g>}
  {phone && <Phone x={figX + 210} y={1260} s={0.28} t={t} play={0.6} />}
</g>;

const W = VO.words;
export const VM_FRAMES = Math.ceil((VO.dur + 0.6) * 30);
export const Voicemail312 = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const m = (a, b) => mouthAt(M, f, fps, a, b);
  const hookScene = (t) => <Room t={t} f={f} fig pose="phone" eyes="wide" brow={1} behind={0.8} />;
  const scenes = [
    {a: 0, b: 3.0, cam: [[0, 500, 1100, 1.2], [3, 520, 1250, 1.6]], draw: hookScene},
    {a: 3.0, b: 8.4, cam: [[0, 540, 900, 1.0], [5.4, 540, 880, 1.35]], draw: (t) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#0a0d14" /><Glow x={540} y={900} r={650} color={A} op={0.3} id="p1" /><Phone x={540} y={900} s={1.6} t={t} play={ramp(t, 0.3, 1)} /></g>},
    {a: 8.4, b: 14.4, cam: [[0, 540, 900, 1.1], [6, 540, 900, 1.5]], draw: (t) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#0a0d14" /><Glow x={540} y={900} r={650} color={A} op={0.3} id="p2" />
      <Phone x={540} y={900} s={1.6} t={t} play={0.3} sub={t < 3 ? 'TIMESTAMP: 03:12 AM' : 'DATE: TOMORROW'} /></g>},
    {a: 14.4, b: 17.7, cam: [[0, 420, 1300, 1.2], [3.3, 420, 1300, 1.5]], draw: (t) => <Room t={t} f={f} pose={['sit', 'slump', ramp(t, 1.5, 2.5)]} eyes="closed" smile={1} lamp={0.2} phone={false} />},
    {a: 17.7, b: 21.4, cam: [[0, 700, 900, 1.0], [3.7, 760, 950, 1.5]], shake: (t) => (Math.sin(t * 8) > 0.8 ? 1 : 0.2), draw: (t) => <Room t={t} f={f} fig pose="hide" eyes="wide" brow={1} door={0.5 + 0.5 * Math.abs(Math.sin(t * 5))} knock={1} phone={false} figX={300} />},
    {a: 21.4, b: 26.6, cam: [[0, 420, 1200, 1.3], [5.2, 480, 1250, 1.7]], draw: (t) => <Room t={t} f={f} pose="cower" eyes="wide" brow={1} door={0.4} look={0.4} figX={300} />},
    {a: 26.6, b: 31.0, cam: [[0, 520, 1150, 1.0], [4.4, 600, 1100, 1.3]], draw: (t) => <Room t={t} f={f} pose="talk" mouth={0.5 + 0.5 * Math.abs(Math.sin(t * 13))} eyes="normal" brow={0.5} phone={false} />},
    {a: 31.0, b: 36.8, cam: [[0, 420, 1250, 1.3], [5.8, 440, 1250, 1.8]], shake: 0.3, draw: (t) => <Room t={t} f={f} pose="frozen" eyes="wide" brow={1} door={0.1} phone figX={420} />},
    {a: 36.8, b: 42.2, cam: [[0, 540, 900, 1.0], [5.4, 540, 900, 1.5]], draw: (t) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#0a0d14" /><Glow x={540} y={900} r={700} color={A} op={0.35} id="p3" />
      <Phone x={540} y={900} s={1.6} t={t} play={1} label="MY NUMBER" sub={t < 2.5 ? 'BREATHING...' : 'I AM ALREADY IN'} /></g>},
    {a: 42.2, b: 48.0, cam: [[0, 420, 1300, 1.8], [5.8, 440, 1250, 2.2]], shake: 0.4, draw: (t) => <Room t={t} f={f} pose="frozen" eyes="wide" brow={1} look={0} behind={ramp(t, 0.3, 2.5) * 0.9} phone={false} />},
    {a: 48.0, b: 60, cam: [[0, 520, 1200, 1.2], [5, 520, 1180, 1.6], [9, 520, 1180, 1.9]], draw: (t) => <Room t={t} f={f} pose={t > 5 ? 'phone' : 'talk'} mouth={m(0, 0) + 0.5 + 0.5 * Math.abs(Math.sin(t * 12))} eyes="wide" brow={1} behind={0.6 + 0.4 * ramp(t, 6, 8)} />},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#0b0c11'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 500, 1100, 1.2]], draw: hookScene}]} /></AbsoluteFill>}
    <ScreenFlash times={[0, 3.0, 8.4, 17.7, 21.4, 31.0, 36.8, 42.2, 54.6]} color={A} max={0.4} />
    <ScreenFlash times={[0.02]} color="#ffffff" max={0.5} len={0.3} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'A VOICEMAIL', accent: true, size: 92}, {txt: 'FROM MY OWN'}, {txt: 'NUMBER'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
