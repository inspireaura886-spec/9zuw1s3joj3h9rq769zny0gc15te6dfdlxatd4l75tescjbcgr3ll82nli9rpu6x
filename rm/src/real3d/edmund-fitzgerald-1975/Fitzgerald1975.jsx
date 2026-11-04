// edmund-fitzgerald-1975: REAL3D A/B Short (33.3 s). Plates = Blender Cycles on GitHub (blender/scenes/edmund-fitzgerald-1975).
// Frame 0 = the real USCG photo of the Fitzgerald + claim headline; one slow eased push into the hull nameplate.
// Real NTSB wreck sketch on "Torn in two". Ends on the photo again for a seamless loop. No shake: plates use eased
// cameras, stills only get eased pushes. Scheme 'clay' (no yellow/red anywhere).
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel} from '../Real3DKit.jsx';
import VO from './vo.json';

export const FITZ_FRAMES = 1000;
export const SCHEME = 'clay';
const P = 'real3d/edmund-fitzgerald-1975/';
const lift = (b, c = 1.0) => ({filter: `brightness(${b}) contrast(${c})`});
const plates = [
  {src: P + 'b2.mp4', from: 148, dur: 150, drift: 0.02},                          // radar: echo gone at plate f90 = 7.93 s ("gone")
  {src: P + 'b1.mp4', from: 298, dur: 49, drift: 0.03, style: lift(1.3)},          // night lake: "No Mayday. 29 men."
  {src: P + 'b3.mp4', from: 347, dur: 159, drift: 0.02, style: lift(1.18)},        // deck: radars dead, heavy seas
  {src: P + 'b4.mp4', from: 506, dur: 84, drift: 0.02},                            // wreck 530 ft down
  {src: P + 'hatch.mp4', from: 709, dur: 60, drift: 0.03},
  {src: P + 'b5s.mp4', from: 769, dur: 60, drift: 0.03},
  {src: P + 'b5w.mp4', from: 829, dur: 59, drift: 0.03, style: lift(1.35)},
  {src: P + 'b6.mp4', from: 888, dur: 100, drift: 0.02, style: lift(1.3)},
];
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const Scrim = ({inF, outF}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 640, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 1440}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);

// Real USCG photo: cover-fit, one continuous eased push toward the hull nameplate (no pan reversal, no shake).
const Photo = ({dur, fadeIn = 0, still = false}) => { const f = useCurrentFrame();
  const s = still ? 1.0 : interpolate(f, [0, dur], [1.0, 1.55], {easing: ez, ...cl});
  const a = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], cl) : 1;
  return (<AbsoluteFill style={{background: '#0b0b0d', opacity: a, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '52% 69%'}}>
      <Img src={staticFile(P + 'uscg.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) brightness(0.92) sepia(0.12)'}} />
    </AbsoluteFill>
    <div style={{position: 'absolute', left: 0, top: 1280, width: 1080, height: 640, background: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.7) 100%)'}} />
  </AbsoluteFill>); };
// Real NTSB sketch card over a blurred, darkened copy of itself; one continuous accelerating push into the stern
// section (bottom right of the sketch) for "The stern, upside down". Fixed origin, single eased curve: no stall, no shake.
const Sketch = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.6], {easing: Easing.bezier(0.5, 0, 0.8, 0.7), ...cl});
  const ty = interpolate(f, [0, dur], [10, -10], {easing: ez, ...cl});
  const a = interpolate(f, [0, 5], [0, 1], cl);
  return (<AbsoluteFill style={{background: '#0b0b0d', opacity: a}}>
    <AbsoluteFill style={{transform: `scale(${2.2 + 0.08 * f / dur})`, filter: 'blur(26px) brightness(0.28)'}}><Img src={staticFile(P + 'ntsb.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    <div style={{position: 'absolute', left: 60, top: 470, width: 960, height: 838, transform: `translateY(${ty}px)`, boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '2px solid rgba(240,238,232,0.25)', overflow: 'hidden'}}>
      <Img src={staticFile(P + 'ntsb.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) sepia(0.15)', transform: `scale(${s})`, transformOrigin: '58% 64%'}} />
    </div>
  </AbsoluteFill>); };
const Cap = () => { const f = useCurrentFrame(); const y = f < 148 || f >= 988 ? 980 : (f >= 590 && f < 709 ? 1340 : 1280);
  return <R3DCaption words={VO.words} scheme={SCHEME} y={y} backing />; };

export const Fitzgerald1975 = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <Sequence from={0} durationInFrames={148}><Photo dur={148} /></Sequence>
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={590} durationInFrames={119}><Sketch dur={119} /></Sequence>
    <Sequence from={988} durationInFrames={12}><Photo dur={12} fadeIn={12} still /></Sequence>
    <Real3DFinish seed={75} />
    <Head from={0} dur={100} inF={-12} lines={['729-ft ship sank', 'no Mayday was sent']} />
    <Head from={232} dur={66} lines={['Gone from radar', 'in 10 minutes']} />
    <Head from={300} dur={46} lines={['29 men', 'no distress call']} />
    <Head from={410} dur={80} lines={['Both radars', 'dead']} />
    <Head from={512} dur={76} lines={['530 ft down', 'found by the U.S. Navy']} />
    <Head from={592} dur={66} lines={['Torn in two', 'bow and stern 170 ft apart']} />
    <Head from={662} dur={46} lines={['Stern', 'upside down']} />
    <Head from={712} dur={56} lines={['Theory 1', 'hatch covers']} />
    <Head from={772} dur={56} lines={['Theory 2', 'a shoal']} />
    <Head from={832} dur={55} lines={['Theory 3', '3 rogue waves']} />
    <Head from={894} dur={90} lines={['No final answer', '29 men lost']} />
    <Sequence from={988} durationInFrames={12}><Scrim inF={0} outF={99} /><R3DHead scheme={SCHEME} lines={['729-ft ship sank', 'no Mayday was sent']} inF={-12} /></Sequence>
    <Tag from={4} dur={70} text="LAKE SUPERIOR · NOV 10, 1975" />
    <Tag from={78} dur={68} text="REAL PHOTO · SS EDMUND FITZGERALD · USCG" />
    <Tag from={152} dur={144} text="TRAILING SHIP ARTHUR M. ANDERSON · RADAR" />
    <Tag from={350} dur={150} text="ABOUT 4:10 PM · CAPT. ERNEST McSORLEY" />
    <Tag from={510} dur={78} text="U.S. NAVY CURV-III SURVEY" />
    <Tag from={594} dur={112} text="REAL SKETCH · NTSB FIGURE 3" />
    <Tag from={712} dur={56} text="U.S. COAST GUARD · 1977 REPORT" />
    <Tag from={772} dur={56} text="SHOAL NEAR CARIBOU ISLAND" />
    <Tag from={832} dur={55} text="THE 'THREE SISTERS'" />
    <Cap />
    <IAMark />
    <Sequence from={148} durationInFrames={442}><R3DLabel /></Sequence>
    <Sequence from={709} durationInFrames={279}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
