// nimitz-tictac-2004: REAL3D A/B Short (30.4 s). Plates = Blender Cycles on GitHub (blender/scenes/nimitz-tictac-2004).
// Frame 0 = the radar scope with seven blips + claim headline. Real 1952 film (Samford, NARA PD) on the Pentagon line.
// No shake: plates use cruise-eased cameras; the archival card only gets a slow eased push. Scheme 'lavender'.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel} from '../Real3DKit.jsx';
import VO from './vo.json';

export const NIM_FRAMES = 1679;
export const SCHEME = 'sage';
const P = 'real3d/nimitz-tictac-2004/';
const plates = [
  {src: P + 'b01.mp4', from: 0, dur: 215},
  {src: P + 'b02.mp4', from: 215, dur: 240},
  {src: P + 'b03.mp4', from: 455, dur: 244},
  {src: P + 'b04.mp4', from: 699, dur: 183, punches: [{at: 60, to: 1.03, dur: 26}]},
  {src: P + 'b05.mp4', from: 882, dur: 209},
  {src: P + 'b06.mp4', from: 1091, dur: 247},
  {src: P + 'b07.mp4', from: 1338, dur: 110},
  {src: P + 'b08.mp4', from: 1448, dur: 92},
  {src: P + 'b09.mp4', from: 1540, dur: 139},
];
const Scrim = ({inF, outF}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 620, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 330}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
export const Nimitz2004 = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <PlateTrack plates={plates} dip={0} />
    <Real3DFinish seed={2004} />
    <Head from={0} dur={100} inF={-12} lines={['Navy flyers chase', 'a white Tic Tac']} />
    <Head from={222} dur={90} lines={['One week', 'on radar']} />
    <Head from={705} dur={80} lines={['40 feet long', 'no wings']} />
    <Head from={1100} dur={80} lines={['It mirrored', 'the jet']} />
    <Head from={1345} dur={90} lines={['Skeptics say', 'glare']} />
    <Head from={1455} dur={80} lines={['Four flyers', '5 minutes']} />
    <Tag from={4} dur={96} text="OFF SOUTHERN CALIFORNIA · 14 NOV 2004" y={1440} />
    <Tag from={225} dur={110} text="USS PRINCETON RADAR" />
    <Tag from={460} dur={110} text="CMDR DAVID FRAVOR · LCDR ALEX DIETRICH" />
    <Tag from={1500} dur={36} text="PENTAGON VIDEO · 2020" />
    <R3DCaption words={VO.words} scheme={SCHEME} y={1080} backing />
    <IAMark />
    <R3DLabel />
  </AbsoluteFill>
);
