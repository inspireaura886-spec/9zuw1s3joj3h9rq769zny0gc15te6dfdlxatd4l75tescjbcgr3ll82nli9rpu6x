// amelia-earhart-taraia: REAL3D Short, 52.8 s = 1584 f (Qwen narrator_f seed 51). WHAT THEY FOUND, 16 shots, mostly wide. All visuals are 3D reconstructions (label on screen).
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel, SCHEMES} from '../Real3DKit.jsx';
import {SAFE} from '../textfit.js';
import VO from './vo.json';

export const AMELIA_FRAMES = 1584;
export const SCHEME = 'clay';
const P = 'real3d/amelia-earhart-taraia/';
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const S = SCHEMES[SCHEME];
const B = (x) => ({filter: `brightness(${x}) contrast(1.04)`});
// cut map (frames, cues.json): b01 0 | b02 106 | b03 160 | b04 309 | b05 474 | b06 570 | b07 638 | b08 729 | b09 854 | b10 921 | b11 982 | b12 1119 | b13 1217 | s14 1307 | b15 1380 | loop 1474 | end 1584
const plates = [
  {src: P + 'b01_atoll_top.mp4', from: 0, dur: 106, drift: 0.01, style: B(1.15)},
  {src: P + 'b02_lagoon_low.mp4', from: 106, dur: 54, drift: 0.01, style: B(1.15)},
  {src: P + 'b03_globe.mp4', from: 160, dur: 149, drift: 0.008, style: B(1.1)},
  {src: P + 'b04_aerial_bw.mp4', from: 309, dur: 165, drift: 0.01, style: B(1.25)},
  {src: P + 'b05_ship.mp4', from: 474, dur: 96, drift: 0.01, style: B(1.2)},
  {src: P + 'b06_approach.mp4', from: 570, dur: 68, drift: 0.01, style: B(1.2)},
  {src: P + 'b07_drone.mp4', from: 638, dur: 91, drift: 0.01, style: B(1.2)},
  {src: P + 'b08_seabed.mp4', from: 729, dur: 125, drift: 0.01, style: B(1.3)},
  {src: P + 'b09_spit_twist.mp4', from: 854, dur: 67, drift: 0.01, style: B(1.25)},
  {src: P + 'b10_trunks.mp4', from: 921, dur: 61, drift: 0.01, style: B(1.25)},
  {src: P + 'b11_spit_wash.mp4', from: 982, dur: 137, drift: 0.01, style: B(1.25)},
  {src: P + 'b12_macro.mp4', from: 1119, dur: 98, drift: 0.01, style: B(1.3)},
  {src: P + 'b13_tube.mp4', from: 1217, dur: 90, drift: 0.01, style: B(1.35)},
  {src: P + 'b07_drone.mp4', from: 1307, dur: 73, startFrom: 24, drift: 0.015, style: B(1.2)},
  {src: P + 'b15_dawn.mp4', from: 1380, dur: 94, drift: 0.01, style: B(1.2)},
  {src: P + 'b01_atoll_top_rev.mp4', from: 1474, dur: 110, startFrom: 4, drift: 0, style: B(1.15)},
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


const Cap = () => <R3DCaption words={VO.words} scheme={SCHEME} y={1290} backing />;

export const Amelia = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <PlateTrack plates={plates} dip={0} />
    <Real3DFinish seed={1937} />
    <Head from={0} dur={102} inF={-12} lines={["Earhart's plane,", 'in a Pacific lagoon?']} />
    <Head from={110} dur={46} lines={['A Pacific', 'lagoon']} />
    <Head from={164} dur={141} lines={['Spotted in 2020', 'on a remote atoll']} />
    <Head from={313} dur={157} lines={['Also in 1938', 'aerial photos']} />
    <Head from={478} dur={88} lines={['October 2026:', 'a team sails out']} />
    <Head from={574} dur={60} lines={['Five days', 'at sea']} />
    <Head from={642} dur={83} lines={['Drone, sonar,', 'a steel detector']} />
    <Head from={733} dur={117} lines={['Searching the', 'lagoon floor']} />
    <Head from={858} dur={59} lines={['Not her plane']} />
    <Head from={925} dur={53} lines={['Fallen trees']} />
    <Head from={986} dur={129} lines={['Mostly', 'washed away']} />
    <Head from={1123} dur={90} lines={['The shine:', 'hardened coral']} />
    <Head from={1221} dur={82} lines={['A 30-inch', 'steel tube']} />
    <Head from={1311} dur={65} lines={['Not tied to', 'her Electra']} />
    <Head from={1384} dur={86} lines={['89 years on']} />
    <Sequence from={1478} durationInFrames={106}><Scrim inF={-6} outF={98} /><R3DHead scheme={SCHEME} lines={['Where did', 'she go?']} inF={-12} /></Sequence>
    <Chip from={10} dur={92} text="THE TARAIA OBJECT" y={1150} w={620} />
    <Chip from={164} dur={141} text="NIKUMARORO · KIRIBATI · 2020" y={1090} w={800} />
    <Chip from={313} dur={157} text="1938 AERIAL PHOTOS (3D MODEL)" y={1090} w={800} />
    <Chip from={478} dur={88} text="OCT 2026 · 17 PEOPLE · 5 DAYS" y={1090} w={780} />
    <Chip from={858} dur={63} text="OCT 19 · NOT HER PLANE" y={1090} w={640} />
    <Chip from={1311} dur={65} text="STEEL TUBE · NOT LINKED TO HER ELECTRA" y={1090} w={900} />
    <Chip from={1384} dur={90} text="89 YEARS · NO CONFIRMED WRECKAGE" y={1090} w={860} />
    <Cap />
    <IAMark />
    <R3DLabel />
  </AbsoluteFill>
);
