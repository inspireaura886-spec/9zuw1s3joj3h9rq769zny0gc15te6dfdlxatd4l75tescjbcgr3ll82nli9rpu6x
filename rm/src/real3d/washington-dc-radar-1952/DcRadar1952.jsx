// washington-dc-radar-1952: REAL3D A/B Short (30.4 s). Plates = Blender Cycles on GitHub (blender/scenes/washington-dc-radar-1952).
// Frame 0 = the radar scope with seven blips + claim headline. Real 1952 film (Samford, NARA PD) on the Pentagon line.
// No shake: plates use cruise-eased cameras; the archival card only gets a slow eased push. Scheme 'lavender'.
import {AbsoluteFill, Sequence, OffthreadVideo, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel} from '../Real3DKit.jsx';
import VO from './vo.json';

export const DCR_FRAMES = 912;
export const SCHEME = 'lavender';
const P = 'real3d/washington-dc-radar-1952/';
const plates = [
  {src: P + 'b01.mp4', from: 0, dur: 152},
  {src: P + 'b02.mp4', from: 152, dur: 97, style: {filter: 'brightness(1.18)'}},
  {src: P + 'b03.mp4', from: 249, dur: 63, style: {filter: 'brightness(1.15)'}},
  {src: P + 'b04.mp4', from: 312, dur: 136, punches: [{at: 22, to: 1.03, dur: 26}, {at: 109, to: 1.03, dur: 22}]},
  {src: P + 'b05.mp4', from: 448, dur: 140, punches: [{at: 118, to: 1.03, dur: 20}], style: {filter: 'brightness(1.4) contrast(1.05)'}},
  {src: P + 'b07.mp4', from: 745, dur: 167},
];
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const Scrim = ({inF, outF}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 620, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 330}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
// Real archival film card: blurred fill of the same film behind, the 4:3 frame centred, one slow eased push (no shake).
const Archive = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.07], {easing: ez, extrapolateRight: 'clamp'});
  const a = interpolate(f, [0, 5], [0, 1], {extrapolateRight: 'clamp'});
  return (<AbsoluteFill style={{background: '#0b0b0d', opacity: a}}>
    <AbsoluteFill style={{transform: `scale(${2.5 + 0.1 * f / dur})`, filter: 'blur(28px) brightness(0.35)'}}><OffthreadVideo src={staticFile(P + 'samford.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    <div style={{position: 'absolute', left: 60, top: 430, width: 960, height: 720, transform: `scale(${s})`, boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '2px solid rgba(240,238,232,0.25)', overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(P + 'samford.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </AbsoluteFill>); };
// captions sit above the blips on the plates (y 960) and under the archival film box (y 1200). fix r1 2026-11-04
const Cap = () => { const f = useCurrentFrame(); return <R3DCaption words={VO.words} scheme={SCHEME} y={f >= 588 && f < 745 ? 1200 : 960} backing />; };
export const DcRadar1952 = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={588} durationInFrames={157}><Archive dur={157} /></Sequence>
    <Real3DFinish seed={52} />
    <Head from={0} dur={96} inF={-12} lines={['7 unknown blips', 'over the White House']} />
    <Head from={318} dur={60} lines={['Every blip', 'vanished']} />
    <Head from={452} dur={76} lines={['3 radars', 'one target']} />
    <Head from={676} dur={66} lines={['Official answer', 'warm air']} />
    <Head from={750} dur={76} lines={['Too weak', 'to explain it']} />
    <Tag from={4} dur={92} text="WASHINGTON NATIONAL AIRPORT · JULY 1952" y={1440} />
    <Tag from={156} dur={88} text="CAPITAL AIRLINES PILOT · SAME NIGHT" />
    <Tag from={252} dur={58} text="F-94 JETS SCRAMBLED" />
    <Tag from={590} dur={150} text="REAL FILM · MAJ. GEN. JOHN SAMFORD, USAF · 1952" y={1330} />
    <Tag from={460} dur={120} text="NATIONAL ×2 + ANDREWS AIR FORCE BASE" y={1330} />
    <Cap />
    <IAMark />
    <Sequence from={0} durationInFrames={588}><R3DLabel /></Sequence>
    <Sequence from={745} durationInFrames={167}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
