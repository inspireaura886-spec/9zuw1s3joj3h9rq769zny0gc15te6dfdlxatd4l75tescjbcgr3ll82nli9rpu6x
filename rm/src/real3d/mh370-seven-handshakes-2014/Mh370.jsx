// mh370-seven-handshakes-2014: REAL3D Short, 54.5 s = 1635 f (Qwen narrator_m seed 41). CASE FILE format, 17 shots, mostly wide.
// Frame 0 = REAL photo 9M-MRO at Narita (Kentaro Iemoto 2009, CC BY-SA 2.0, credit on screen). Plates = Blender Cycles on GitHub
// (blender/scenes/mh370-seven-handshakes-2014). Remotion: photo, route schematic card (s07), BTO arc inset (CC BY 3.0, Inmarsat), deal chip, loop.
// No shake: eased pushes only. Scheme sand. Plates in public/real3d/mh370-seven-handshakes-2014/<plate>.mp4
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel, SCHEMES} from '../Real3DKit.jsx';
import {SAFE} from '../textfit.js';
import VO from './vo.json';

export const MH_FRAMES = 1635;
export const SCHEME = 'sand';
const P = 'real3d/mh370-seven-handshakes-2014/';
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const S = SCHEMES[SCHEME];
const INK = S.text, ACC = S.active;
const pl = (n, from, dur, o = {}) => ({src: P + n + '.mp4', from, dur, drift: 0.01, ...o});
// cut map (frames, cues.json): 0 photo | 143 b02 | 262 b03 | 356 b04 | 441 b05 | 524 b06 | 590 map | 657 b08 | 738 b09 | 787 b10 |
// 867 b11 | 972 b12 | 1084 b13 | 1161 b14 | 1282 b15a | 1358 b15b | 1458 b13 tail (deal) | 1546 photo loop | 1635 end
const plates = [
  pl('b02_cruise', 143, 119), pl('b03_atc', 262, 94), pl('b04_console', 356, 85), pl('b05_scope', 441, 83), pl('b06_milradar', 524, 66),
  pl('b08_strait', 657, 81), pl('b09_dish', 738, 49), pl('b10_sat', 787, 80), pl('b11_globe', 867, 105), pl('b12_ring7', 972, 112),
  pl('b13_ocean', 1084, 77), pl('b14_beach', 1161, 121), pl('b15a_ship', 1282, 76), pl('b15b_seafloor', 1358, 100),
  pl('b13_ocean', 1458, 88, {startFrom: 80}),
];
const Scrim = ({inF, outF, h = 640}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: h, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 1440}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
const Fade = ({children}) => { const f = useCurrentFrame(); return <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], cl)}}>{children}</AbsoluteFill>; };
const Bottom = () => <div style={{position: 'absolute', left: 0, top: 1240, width: 1080, height: 680, background: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.75) 100%)'}} />;
const ChipIn = ({text, y, w, dur}) => { const f = useCurrentFrame();
  const t = interpolate(f, [0, 8], [0, 1], {easing: ez, ...cl}) * (1 - interpolate(f, [dur - 8, dur], [0, 1], cl));
  return (<div style={{position: 'absolute', left: (1080 - w) / 2, top: y, width: w, padding: '16px 0', textAlign: 'center', borderRadius: 12, background: S.chip, color: S.chipText, opacity: 0.92 * t, transform: `translateY(${(1 - t) * 14}px)`, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 32, letterSpacing: 2, boxShadow: '0 6px 24px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{text}</div>); };
const Chip = ({from, dur, text, y = 1090, w = 700}) => (<Sequence from={from} durationInFrames={dur}><ChipIn text={text} y={y} w={w} dur={dur} /></Sequence>);

// Real photo of 9M-MRO as a lit sheet over a blurred copy; one eased push. Frame 0 of the loop.
const Photo = ({dur, s0 = 1.0, s1 = 1.08, fadeIn = 0}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [s0, s1], {easing: ez, ...cl});
  const a = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], cl) : 1;
  return (<AbsoluteFill style={{opacity: a}}>
    <AbsoluteFill style={{background: '#0c0d10', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: 'scale(3.2)', filter: 'blur(30px) brightness(0.42)'}}><Img src={staticFile(P + 'mro.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill></AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '30% 50%'}}>
      <div style={{position: 'absolute', left: 0, top: 600, width: 1080, height: 720, boxShadow: '0 24px 70px rgba(0,0,0,0.85)', overflow: 'hidden', background: '#222'}}>
        <Img src={staticFile(P + 'mro.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) brightness(0.92)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)'}} />
      </div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// Route schematic (approximate, not to scale): IGARI -> turn back across the peninsula -> Strait -> last radar 02:22.
const LON0 = 95, LAT1 = 8.3, K = 80; // px per degree
const px = (lon, lat) => [(lon - LON0) * K + 18, (LAT1 - lat) * K + 18];
const route = [[103.6, 6.9], [102.9, 6.5], [102.25, 6.15], [101.3, 5.85], [100.3, 5.7], [99.0, 6.0], [97.6, 6.4], [96.4, 6.7]];
const places = [['KOTA BHARU', 102.25, 6.1, 'r'], ['PENANG', 100.33, 5.3, 'b'], ['KUALA LUMPUR', 101.69, 3.14, 'r'], ['SUMATRA', 95.4, 4.6, 'r']];
const MapCard = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.06, 1.0], {easing: ez, ...cl});
  const o = interpolate(f, [0, 8], [0, 1], cl);
  const draw = interpolate(f, [8, 52], [0, 1], {easing: ez, ...cl});
  const d = route.map((p, i) => { const [x, y] = px(p[0], p[1]); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join(' ');
  const [ix, iy] = px(route[0][0], route[0][1]); const [lx, ly] = px(route[route.length - 1][0], route[route.length - 1][1]);
  const grid = [];
  for (let lo = 95; lo <= 105; lo += 2) { const [x] = px(lo, 0); grid.push(<line key={'v' + lo} x1={x} y1={18} x2={x} y2={px(0, 2.4)[1]} stroke="rgba(247,243,234,0.12)" strokeWidth={1.5} />); }
  for (let la = 3; la <= 8; la += 1) { const [, y] = px(0, la); grid.push(<line key={'h' + la} x1={18} y1={y} x2={738} y2={y} stroke="rgba(247,243,234,0.12)" strokeWidth={1.5} />); }
  return (<AbsoluteFill style={{opacity: o}}>
    <AbsoluteFill style={{background: 'linear-gradient(#0b1015, #10161c)'}} />
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 560, width: SAFE.width, textAlign: 'center', fontFamily: 'Special Elite', fontSize: 26, letterSpacing: 5, color: ACC}}>ROUTE SCHEMATIC · NOT TO SCALE</div>
      <svg style={{position: 'absolute', left: SAFE.left, top: 620}} width={756} height={470} viewBox="0 0 756 470">
        {grid}
        <path d={d} fill="none" stroke="rgba(247,243,234,0.18)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} pathLength={1} fill="none" stroke={ACC} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - draw} />
        {places.map(([n, lo, la, side]) => { const [x, y] = px(lo, la); return (<g key={n}><circle cx={x} cy={y} r={7} fill={INK} opacity={0.85} />
          <text x={side === 'l' ? x - 14 : side === 'b' ? x : x + 14} y={side === 'b' ? y + 34 : y + 8} textAnchor={side === 'l' ? 'end' : side === 'b' ? 'middle' : 'start'} fontFamily="Montserrat" fontWeight={700} fontSize={22} letterSpacing={1} fill={INK} opacity={0.8}>{n}</text></g>); })}
        <circle cx={ix} cy={iy} r={10} fill={ACC} /><text x={ix - 6} y={iy - 20} textAnchor="end" fontFamily="Montserrat" fontWeight={800} fontSize={24} letterSpacing={1} fill={INK}>IGARI</text>
        <circle cx={lx} cy={ly} r={10 + 3 * Math.sin(f * 0.4)} fill="none" stroke={ACC} strokeWidth={4} opacity={interpolate(f, [48, 56], [0, 1], cl)} />
        <text x={lx + 4} y={ly - 24} fontFamily="Montserrat" fontWeight={800} fontSize={24} letterSpacing={1} fill={INK} opacity={interpolate(f, [48, 56], [0, 1], cl)}>02:22 LAST RADAR</text>
      </svg>
    </AbsoluteFill><Bottom /></AbsoluteFill>); };

// Inmarsat BTO arc figure inset (CC BY 3.0) ~1.5 s over the globe plate.
const BtoInset = ({dur}) => { const f = useCurrentFrame();
  const t = interpolate(f, [0, 8], [0, 1], {easing: ez, ...cl}) * (1 - interpolate(f, [dur - 8, dur], [0, 1], cl));
  return (<div style={{position: 'absolute', left: (1080 - 640) / 2, top: 560, width: 640, opacity: t, transform: `translateY(${(1 - t) * 16}px)`, boxShadow: '0 14px 44px rgba(0,0,0,0.75)', background: '#fff', padding: 6}}>
    <Img src={staticFile(P + 'bto.jpg')} style={{width: '100%', display: 'block'}} />
    <div style={{position: 'absolute', left: 0, top: '100%', marginTop: 10, width: '100%', textAlign: 'center', fontFamily: 'Special Elite', fontSize: 22, letterSpacing: 2, color: '#e9e3d4', textShadow: '0 0 10px #000'}}>INMARSAT · BTO ARC · CC BY 3.0</div></div>); };

// 7/7 counter on the globe shot.
const Counter = ({dur, fixed}) => { const f = useCurrentFrame();
  const n = fixed || Math.min(7, 1 + Math.floor(f / 12)); const t = interpolate(f, [0, 8], [0, 1], cl) * (1 - interpolate(f, [dur - 8, dur], [0, 1], cl));
  return (<div style={{position: 'absolute', left: SAFE.left, top: 520, width: SAFE.width, textAlign: 'center', opacity: t, fontFamily: 'DM Serif Display', fontSize: 120, lineHeight: 1, color: INK, textShadow: '0 6px 30px rgba(0,0,0,0.85)'}}>{n}<span style={{fontSize: 64, color: ACC}}> / 7</span></div>); };

const Cap = () => { const f = useCurrentFrame(); const y = (f < 143 || f >= 1546) ? 1330 : 1290;
  return <R3DCaption words={VO.words} scheme={SCHEME} y={y} backing />; };

export const Mh370 = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <Sequence from={0} durationInFrames={143}><Photo dur={143} s0={1.0} s1={1.07} /></Sequence>
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={590} durationInFrames={67}><Fade><MapCard dur={67} /></Fade></Sequence>
    <Sequence from={1546} durationInFrames={89}><Photo dur={89} s0={1.07} s1={1.0} fadeIn={10} /></Sequence>
    <Real3DFinish seed={370} />
    <Head from={0} dur={139} inF={-12} lines={['The jet vanished', 'A satellite heard it 7 times']} />
    <Head from={147} dur={111} lines={['Silent jet,', 'still answering']} />
    <Head from={266} dur={86} lines={['01:19 a.m.', 'last radio call']} />
    <Head from={360} dur={77} lines={['“Good night,', 'Malaysian 370”']} />
    <Head from={445} dur={75} lines={['Two minutes later', 'transponder: dark']} />
    <Head from={528} dur={58} lines={['Military radar', 'kept watching']} />
    <Head from={594} dur={59} lines={['It turned back', 'across Malaysia']} />
    <Head from={661} dur={73} lines={['An hour later', 'off radar']} />
    <Head from={742} dur={41} lines={['A ground station', 'in Perth']} />
    <Head from={791} dur={72} lines={['It pinged', 'the jet. It answered']} />
    <Head from={871} dur={97} lines={['Each reply:', 'one distance, one ring']} />
    <Head from={976} dur={104} lines={['The seventh reply', 'was the last']} />
    <Head from={1088} dur={69} lines={['Its ring crossed', 'the southern Indian Ocean']} />
    <Head from={1165} dur={113} lines={['2015: a wing part', 'washes up on Réunion']} />
    <Head from={1286} dur={68} lines={['120,000 km² of', 'seafloor searched']} />
    <Head from={1362} dur={92} lines={['Nothing', 'found']} />
    <Head from={1462} dur={80} lines={['Search extended', 'to June 2027']} />
    <Sequence from={1546} durationInFrames={89}><Scrim inF={-6} outF={83} /><R3DHead scheme={SCHEME} lines={['The jet vanished', 'A satellite heard it 7 times']} inF={-12} /></Sequence>
    <Tag from={4} dur={135} text="PHOTO: K. IEMOTO · CC BY-SA 2.0" />
    <Chip from={10} dur={125} text="8 MARCH 2014 · 239 ABOARD" y={1090} w={760} />
    <Chip from={356} dur={85} text="01:19" y={1090} w={260} />
    <Chip from={657} dur={81} text="02:22 · LAST RADAR" y={1090} w={560} />
    <Chip from={1161} dur={121} text="29 JULY 2015 · RÉUNION" y={1090} w={640} />
    <Chip from={1358} dur={100} text="NOT FOUND" y={1090} w={440} />
    <Chip from={1458} dur={88} text="7,428 KM² STILL TO SEARCH" y={1090} w={720} />
    <Sequence from={143} durationInFrames={119}><Counter dur={119} /></Sequence>
    <Sequence from={900} durationInFrames={48}><BtoInset dur={48} /></Sequence>
    <Sequence from={1000} durationInFrames={84}><Counter dur={84} fixed={7} /></Sequence>
    <Chip from={1000} dur={84} text="08:19 · LAST TRANSMISSION" y={1090} w={740} />
    <Tag from={1546} dur={89} text="WHERE IS MH370?" />
    <Cap />
    <IAMark />
    <Sequence from={143} durationInFrames={447}><R3DLabel /></Sequence>
    <Sequence from={657} durationInFrames={889}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
