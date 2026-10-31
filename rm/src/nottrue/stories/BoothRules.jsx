// nottrue Short #1: booth-rules (rules-style). Fictional. Scenes keyed to vo word times (data/booth-rules.vo.json).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThickStickMan} from '../ThickStickMan.jsx';
import {Scenes, NightSky, Fog, Glow, Cone, Road, TollBooth, Barrier, Car, Paper, CCTV, Captions, HookTitle, ScreenFlash, Finish, FontFaces, kv, ramp, clamp, mouthAt} from '../World.jsx';
import VO from '../data/booth-rules.vo.json';
import M from '../data/booth-rules.mouth.json';

const A = '#ff3b3b';
const RULES = (scratch = 0, glow7 = false, r1 = false) => [
  {txt: '1. NEVER OPEN THE WINDOW FOR', glow: r1}, {txt: '   A CAR WITH NO HEADLIGHTS.', glow: r1},
  {txt: '2. DO NOT LEAVE THE BOOTH.'}, {txt: '3. THE RADIO STAYS ON.'}, {txt: '4. COUNT EVERY CAR.'},
  {txt: '5. NO ONE WALKS HERE.'}, {txt: '6. DON\'T WAVE BACK.'},
  glow7 ? {txt: '7. IF YOU OPENED IT, GO BACK', glow: true} : {txt: '7. ██████████████████', scratch, tear: scratch > 0.6},
  glow7 ? {txt: '   TO RULE ONE.', glow: true} : {txt: ''},
];

// exterior: booth + road + sky. Marcus seen in booth window.
const Exterior = ({t, carX = null, carLights = false, fog = 0, kids = false, winOpen = 0, marcus = {}, flicker = 0, carGhost = 0, barrierUp = 0, carColor = '#2b303d', eyesIn = 0}) => <g>
  <NightSky t={t} moon={[220, 330]} id="skyB" />
  <Fog t={t} y={1180} op={0.12} />
  {/* distant tree line */}
  <path d="M-600 1180 L-500 1090 L-420 1170 L-330 1060 L-240 1170 L-120 1080 L0 1170 L110 1070 L230 1170 L330 1090 L450 1170 L560 1060 L700 1170 L820 1080 L940 1170 L1060 1090 L1200 1170 L1320 1080 L1500 1170 L1700 1180 Z" fill="#0d0f16" />
  <Road t={t} y={1300} />
  <TollBooth x={640} y={1300} accent={A} window={winOpen} flicker={flicker} />
  <g>{/* Marcus inside the window */}
    <ThickStickMan x={640} y={1080} s={0.62} pose="stand" facing={-1} t={t * 30} rim="#ffcf7a" {...marcus} />
  </g>
  <rect x={470} y={1070} width={340} height={230} fill="#262a36" />{/* booth lower wall hides legs */}
  <Barrier x={880} y={1300} up={barrierUp} accent={A} />
  {carX !== null && <Car x={carX} y={1330} s={0.9} lights={carLights} fogWin={fog} kids={kids} accent={A} ghost={carGhost} color={carColor} t={t} eyesIn={eyesIn} />}
  <Fog t={t} y={1360} op={0.16} speed={45} seed={4} />
</g>;

const Interior = ({t, f, pose = 'stand', eyes = 'normal', brow = 0, mouth = 0, look = 0, smile = 0, lamp = 1, monitor = false, shake = 0}) => <g>
  <rect x={-400} y={-400} width={1880} height={2720} fill="#1a1c25" />
  {/* back wall + window to the night */}
  <rect x={120} y={420} width={840} height={620} rx={10} fill="#0b0d16" stroke="#2c3040" strokeWidth={24} />
  <NightSky t={t} w={840} h={600} id="skyI" stars={18} />
  <rect x={-400} y={-400} width={520} height={2720} fill="#1a1c25" /><rect x={960} y={-400} width={520} height={2720} fill="#1a1c25" />
  <rect x={-400} y={-400} width={1880} height={820} fill="#1a1c25" /><rect x={-400} y={1040} width={1880} height={1400} fill="#1a1c25" />
  <rect x={120} y={420} width={840} height={620} rx={10} fill="none" stroke="#2c3040" strokeWidth={24} />
  {/* rules paper on wall */}
  <rect x={760} y={1120} width={150} height={190} fill="#e9e2cc" transform="rotate(3 835 1215)" />
  {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={778} y={1150 + i * 24} width={110} height={6} fill="#3a352a" transform="rotate(3 835 1215)" />)}
  <Glow x={260} y={1180} r={520} color="#ffcf7a" op={0.32 * lamp} id="lampI" />
  <ThickStickMan x={500} y={1720} s={1.25} pose={pose} t={f} facing={1} eyes={eyes} brow={brow} mouth={mouth} look={look} smile={smile} rim={monitor ? A : '#ffcf7a'} />
  {/* desk */}
  <rect x={-100} y={1560} width={1280} height={60} fill="#2a2e3c" /><rect x={-100} y={1620} width={1280} height={800} fill="#14161e" />
  <path d="M190 1560 l 40 -90 l 30 0" stroke="#3c4152" strokeWidth={10} fill="none" /><ellipse cx={240} cy={1470} rx={46} ry={20} fill="#ffcf7a" opacity={lamp} />
  {monitor && <g><rect x={640} y={1300} width={360} height={250} rx={10} fill="#0e1015" stroke="#3c4152" strokeWidth={10} /><rect x={660} y={1320} width={320} height={210} fill={A} opacity={0.18 + 0.08 * Math.sin(t * 20)} />
    <Glow x={640} y={1300} r={500} color={A} op={0.25} id="monI" /></g>}
</g>;

const W = VO.words;
export const BOOTH_FRAMES = Math.ceil((VO.dur + 0.6) * 30);

export const BoothRules = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const m = (a, b) => mouthAt(M, f, fps, a, b);
  const hook = (t, k = 1) => <Exterior t={t} carX={kv(t, [[0, 360], [3, 375]])} carLights={false} fog={0.75} winOpen={0.25 * k} eyesIn={1}
    marcus={{pose: 'reach', eyes: 'closed', smile: 1}} />;
  const scenes = [
    {a: 0, b: 2.9, cam: [[0, 500, 900, 1.4], [2.9, 520, 930, 1.6]], draw: (t) => hook(t)},
    {a: 2.9, b: 6.46, cam: [[0, 540, 760, 1.25], [3.56, 470, 700, 1.55]], draw: (t) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#141016" /><Glow x={540} y={760} r={700} color="#ffcf7a" op={0.25} id="pg1" />
      <Paper x={540} y={960} lines={RULES(0, false, t > 0.1)} accent={A} t={t} /></g>},
    {a: 6.46, b: 8.2, cam: [[0, 520, 1300, 1.0], [1.74, 520, 1270, 1.1]], draw: (t) => <Interior t={t} f={f} pose="talk" mouth={0.5 + 0.5 * Math.abs(Math.sin(t * 14))} eyes="closed" look={0.2} />},
    {a: 8.2, b: 11.65, cam: [[0, 640, 1080, 1.35], [3.45, 640, 1060, 0.95]], draw: (t) => <Exterior t={t} marcus={{pose: 'sit'}} />},
    {a: 11.65, b: 17.1, cam: [[0, 540, 960, 1.0], [2.0, 470, 1250, 1.9], [5.45, 470, 1250, 2.1]], shake: (t) => (t > 4.0 && t < 4.5 ? 1.5 : 0.15),
      draw: (t) => <g><rect x={-500} y={-500} width={2100} height={3000} fill="#141016" /><Glow x={540} y={1200} r={600} color="#ffcf7a" op={0.2 + 0.1 * (Math.sin(t * 31) > 0.7 ? 0 : 1)} id="pg2" />
        <Paper x={540} y={960} lines={RULES(clamp(ramp(t, 1.9, 3.2) + ramp(t, 3.9, 4.6)) , false)} accent={A} t={t} /></g>},
    {a: 17.1, b: 22.63, cam: [[0, 600, 1150, 1.15], [5.5, 700, 1150, 1.0]], draw: (t) => <Exterior t={t} carX={kv(t, [[0, -500], [2.3, 330], [4.3, 330], [5.53, 900]])} carLights kids carColor="#5a4b3a"
      marcus={{pose: t < 3.7 ? 'wave' : ['stand', 'slump', ramp(t, 3.7, 4.4)], smile: t < 3.7 ? 1 : 0, eyes: t > 3.9 ? 'closed' : 'normal'}} />},
    {a: 22.63, b: 27.9, cam: [[0, 400, 1100, 1.0], [5.27, 450, 1110, 1.35]], shake: 0.25, draw: (t) => <Exterior t={t} carX={kv(t, [[0, -520], [3.2, 330]])} carLights={false} fog={ramp(t, 3.3, 5.2) * 0.6}
      flicker={Math.sin(t * 40) > 0.85 ? 0.7 : 0} marcus={{pose: 'frozen', eyes: 'wide', brow: 1}} />},
    {a: 27.9, b: 30.09, cam: [[0, 370, 1170, 2.6], [2.2, 400, 1180, 3.2]], shake: 0.3, draw: (t) => <Exterior t={t} carX={330} carLights={false} fog={0.6 + ramp(t, 0, 1.6) * 0.4} eyesIn={ramp(t, 0.9, 1.5)} marcus={{pose: 'frozen', eyes: 'wide', brow: 1}} />},
    {a: 30.09, b: 32.66, cam: [[0, 520, 1260, 1.25], [2.57, 520, 1220, 1.45]], draw: (t) => <Interior t={t} f={f} pose={['reach', 'cower', ramp(t, 1.2, 1.9)]} eyes="wide" brow={1} look={t > 1.6 ? -0.3 : 0} />},
    {a: 32.66, b: 35.99, cam: [[0, 500, 1150, 1.0], [3.33, 980, 1150, 1.15]], shake: (t) => (t > 1.9 && t < 2.6 ? 1.2 : 0.1),
      draw: (t) => <Exterior t={t} carX={kv(t, [[0, 330], [0.8, 330], [3.3, 1500]], (x) => x * x)} carGhost={ramp(t, 1.7, 2.1) * (1 - ramp(t, 2.6, 3))} carLights={false} fog={1} marcus={{pose: 'cower', eyes: 'wide', brow: 1}} />},
    {a: 35.99, b: 37.96, cam: [[0, 880, 1200, 1.7], [1.97, 880, 1200, 1.9]], hard: true, filter: 'grayscale(0.85) contrast(1.2)', draw: (t) => <Exterior t={t} carX={null} />, overlay: (t) => <CCTV t={t} label="CAM 01 REWIND" stamp={`03:0${Math.floor(clamp(9 - t * 4, 0, 9))}:${String(Math.floor((59 - t * 40 + 600) % 60)).padStart(2, '0')}`} accent={A} />},
    {a: 37.96, b: 44.66, cam: [[0, 640, 1150, 2.0], [1.98, 640, 1110, 2.6], [6.7, 640, 1100, 2.9]], hard: true, shake: (t) => (Math.sin(t * 9) > 0.92 ? 1.6 : 0.1),
      filter: 'grayscale(0.85) contrast(1.25)', draw: (t) => <Exterior t={t} carX={330} fog={0.9} winOpen={ramp(t, 4.0, 5.9)} marcus={{pose: t > 4.1 ? 'reach' : 'stand', eyes: 'closed', smile: t > 3.0 ? 1 : 0}} />,
        overlay: (t) => <CCTV t={t} label="CAM 02" stamp={`03:01:${String(7 + Math.floor(t)).padStart(2, '0')}`} accent={A} />},
    {a: 44.66, b: 46.34, cam: [[0, 560, 1320, 1.5], [1.68, 560, 1300, 1.75]], shake: 0.35, draw: (t) => <Interior t={t} f={f} pose="shiver" eyes="wide" brow={1} monitor look={0.3} lamp={0.4} />},
    {a: 46.34, b: 49.71, cam: [[0, 540, 1150, 1.0], [3.37, 540, 1150, 1.1]], draw: (t) => <g><NightSky t={t} moon={[820, 300]} id="skyR" /><Fog t={t} y={1180} op={0.12} />
      <Road t={t} y={1300} speed={900} /><Car x={420} y={1360} s={1.0} lights accent={A} t={t * 3} color="#3b4152" /><Fog t={t} y={1380} op={0.15} speed={300} seed={8} /></g>},
    {a: 49.71, b: 60, cam: [[0, 540, 960, 1.0], [2.5, 540, 1250, 1.45], [5.6, 540, 1260, 1.6]],
      draw: (t) => { const rev = ramp(t, 3.1, 3.7); const back = ramp(t, 5.75, 6.25);
        return <g><rect x={-500} y={-500} width={2100} height={3000} fill="#141016" /><Glow x={480} y={1250} r={380} color="#fff1c8" op={0.45} id="pg3" />
          <Paper x={540} y={960} lines={RULES(1 - rev, rev > 0.5)} accent={A} t={t} />
          {back > 0 && <g opacity={back}><g transform="translate(470 1260) scale(0.55) translate(-560 -1080) scale(1.55) translate(-0 0)" /></g>}</g>; }},
  ];
  const T = f / fps;
  const loopK = ramp(T, VO.dur + 0.05, VO.dur + 0.55);
  return <AbsoluteFill style={{background: '#0b0c11'}}>
    <FontFaces />
    <Scenes scenes={scenes} />
    {loopK > 0 && <AbsoluteFill style={{opacity: loopK}}><Scenes scenes={[{a: -10, b: 60, cam: [[0, 500, 900, 1.4]], draw: (t) => hook(0)}]} /></AbsoluteFill>}
    <ScreenFlash times={[0, 2.9, 13.68, 15.68, 25.9, 34.64, 35.99, 41.84, 52.9]} color={A} max={0.45} />
    <ScreenFlash times={[0.02]} color="#ffffff" max={0.5} len={0.3} />
    <HookTitle accent={A} until={2.8} lines={[{txt: 'RULE #1:', accent: true, size: 92}, {txt: 'NEVER OPEN'}, {txt: 'THE WINDOW'}]} />
    <Captions words={W} accent={A} hideBefore={2.85} />
    <Finish accent={A} />
  </AbsoluteFill>;
};
