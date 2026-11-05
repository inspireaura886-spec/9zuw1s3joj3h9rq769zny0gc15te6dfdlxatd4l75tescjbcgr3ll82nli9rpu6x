// jimmy-hoffa: REAL3D Short, 46.5 s = 1395 f (Qwen narrator_m seed 41). CASE FILE format, 14 shots, wide.
// Frame 0 + loop = REAL Library of Congress photo (M. Trikosko, 1 Feb 1963, no known restrictions, credit on screen).
// Plates = Blender Cycles on GitHub (blender/scenes/jimmy-hoffa): lot, diner, phone, car gone, garage, court x2, lab, field, bridge, radar.
// Remotion: photo, FBI statement card. No shake: eased pushes only. Scheme dusk-rose. Plates in public/real3d/jimmy-hoffa/<plate>.mp4
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel, SCHEMES} from '../Real3DKit.jsx';
import {SAFE} from '../textfit.js';
import VO from './vo.json';

export const HOFFA_FRAMES = 1395;
export const SCHEME = 'dusk-rose';
const P = 'real3d/jimmy-hoffa/';
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const S = SCHEMES[SCHEME];
const INK = S.text, ACC = S.active;
const B = (x) => ({filter: `brightness(${x}) contrast(1.04)`});
// cut map (frames, cues.json): 0 photo | 83 lot | 176 diner | 254 phone | 367 car gone | 468 garage | 590 court | 686 court2 |
// 777 lab | 875 field | 994 bridge | 1082 radar | 1173 FBI card | 1287 photo loop | 1395 end
const plates = [
  {src: P + 'h02_lot.mp4', from: 83, dur: 93, drift: 0.01, style: B(1.3)},
  {src: P + 'h03_diner.mp4', from: 176, dur: 78, drift: 0.01, style: B(1.2)},
  {src: P + 'h04_phone.mp4', from: 254, dur: 113, drift: 0.01, style: B(1.3)},
  {src: P + 'h05_cargone.mp4', from: 367, dur: 101, drift: 0.01, style: B(1.3)},
  {src: P + 'h06_garage.mp4', from: 468, dur: 122, drift: 0.01, style: B(1.45)},
  {src: P + 'h07_court.mp4', from: 590, dur: 96, drift: 0.01, style: B(1.3)},
  {src: P + 'h08_court2.mp4', from: 686, dur: 91, drift: 0.01, style: B(1.3)},
  {src: P + 'h09_lab.mp4', from: 777, dur: 98, drift: 0.01, style: B(1.25)},
  {src: P + 'h10_field.mp4', from: 875, dur: 119, drift: 0.01, style: B(1.3)},
  {src: P + 'h11_bridge.mp4', from: 994, dur: 88, drift: 0.01, style: B(1.3)},
  {src: P + 'h12_radar.mp4', from: 1082, dur: 91, drift: 0.01, style: B(1.3)},
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

// Real LC photo as a lit sheet (cropped on Hoffa) over a blurred copy; one eased push. Frame 0 of the loop.
const Photo = ({dur, s0 = 1.0, s1 = 1.07, fadeIn = 0}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [s0, s1], {easing: ez, ...cl});
  const a = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], cl) : 1;
  return (<AbsoluteFill style={{opacity: a}}>
    <AbsoluteFill style={{background: '#0c0d10', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: 'scale(3.0)', filter: 'blur(30px) brightness(0.42)'}}><Img src={staticFile(P + 'hoffa1963.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill></AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '45% 40%'}}>
      <div style={{position: 'absolute', left: 0, top: 440, width: 1080, height: 840, boxShadow: '0 24px 70px rgba(0,0,0,0.85)', overflow: 'hidden', background: '#222'}}>
        <Img src={staticFile(P + 'hoffa1963.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '46% 40%', filter: 'contrast(1.05) brightness(1.02)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)'}} />
      </div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// FBI statement card (fbi.gov Detroit field office, 50th anniversary page, 2025: "The Hoffa investigation remains active").
const FbiCard = ({dur}) => { const f = useCurrentFrame();
  const o = interpolate(f, [0, 8], [0, 1], cl);
  const s = interpolate(f, [0, dur], [1.05, 1.0], {easing: ez, ...cl});
  const q = interpolate(f, [10, 24], [0, 1], {easing: ez, ...cl});
  return (<AbsoluteFill style={{opacity: o}}>
    <AbsoluteFill style={{background: 'linear-gradient(#0d1116, #12171d)'}} />
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 610, width: SAFE.width, textAlign: 'center', fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 6, color: ACC}}>FBI DETROIT · 2025</div>
      <div style={{position: 'absolute', left: SAFE.left + 40, top: 700, width: SAFE.width - 80, height: 3, background: ACC, opacity: 0.6 * q, transformOrigin: 'left', transform: `scaleX(${q})`}} />
      <div style={{position: 'absolute', left: SAFE.left + 20, top: 740, width: SAFE.width - 40, textAlign: 'center', fontFamily: 'DM Serif Display', fontSize: 78, lineHeight: 1.12, color: INK, opacity: q, transform: `translateY(${(1 - q) * 18}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>“The Hoffa investigation remains active.”</div>
      <div style={{position: 'absolute', left: SAFE.left, top: 1060, width: SAFE.width, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 24, letterSpacing: 3, color: INK, opacity: 0.7 * q}}>FBI.GOV · 50TH ANNIVERSARY STATEMENT</div>
    </AbsoluteFill><Bottom /></AbsoluteFill>); };

const Cap = () => { const f = useCurrentFrame(); const y = (f < 83 || f >= 1287) ? 1330 : 1290;
  return <R3DCaption words={VO.words} scheme={SCHEME} y={y} backing />; };

export const Hoffa = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <Sequence from={0} durationInFrames={83}><Photo dur={83} s0={1.0} s1={1.05} /></Sequence>
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={1173} durationInFrames={114}><Fade><FbiCard dur={114} /></Fade></Sequence>
    <Sequence from={1287} durationInFrames={108}><Photo dur={108} s0={1.05} s1={1.0} fadeIn={10} /></Sequence>
    <Real3DFinish seed={1975} />
    <Head from={0} dur={79} inF={-12} lines={['Last seen in', 'a parking lot']} />
    <Head from={87} dur={85} lines={['1975.', 'Then he was gone']} />
    <Head from={180} dur={70} lines={['Two reputed', 'mobsters']} />
    <Head from={258} dur={105} lines={['A pay phone.', 'He was stood up']} />
    <Head from={371} dur={93} lines={['His car was', 'found in the lot']} />
    <Head from={472} dur={114} lines={['Weeks later:', 'his scent, another car']} />
    <Head from={594} dur={88} lines={['Declared dead', 'in 1982']} />
    <Head from={690} dur={83} lines={['There was', 'still no body']} />
    <Head from={781} dur={90} lines={['2001:', 'DNA matches a hair']} />
    <Head from={879} dur={111} lines={['2013: a field', 'near Detroit. Nothing']} />
    <Head from={998} dur={80} lines={['A tip:', 'a New Jersey bridge']} />
    <Head from={1086} dur={83} lines={['Nothing of', 'evidentiary value']} />
    <Head from={1177} dur={106} lines={['Fifty years on', 'the case is active']} />
    <Sequence from={1287} durationInFrames={108}><Scrim inF={-6} outF={102} /><R3DHead scheme={SCHEME} lines={['Last seen in', 'a parking lot']} inF={-12} /></Sequence>
    <Tag from={4} dur={75} text="PHOTO: M. TRIKOSKO · LIBRARY OF CONGRESS" />
    <Chip from={10} dur={68} text="LAST SEEN · 30 JULY 1975" y={1150} w={700} />
    <Chip from={468} dur={122} text="AUG 21, 1975 · SCENT" y={1090} w={620} />
    <Chip from={590} dur={96} text="DECLARED DEAD · 1982" y={1090} w={640} />
    <Chip from={686} dur={91} text="BODY · NOT FOUND" y={1090} w={560} />
    <Chip from={777} dur={98} text="DNA MATCH · 2001" y={1090} w={540} />
    <Chip from={875} dur={119} text="2013 · FIELD NEAR DETROIT" y={1090} w={720} />
    <Chip from={1082} dur={91} text="NOTHING FOUND" y={1090} w={520} />
    <Tag from={1287} dur={108} text="WHERE IS JIMMY HOFFA?" />
    <Cap />
    <IAMark />
    <Sequence from={83} durationInFrames={1090}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
