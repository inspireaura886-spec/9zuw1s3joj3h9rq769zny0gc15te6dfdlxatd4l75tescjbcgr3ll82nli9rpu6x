// lakenheath-1956: REAL3D A/B Short (53.2 s). Plates = Blender Cycles on GitHub. No shake. Scheme 'dusty-teal'.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel} from '../Real3DKit.jsx';
import VO from './vo.json';

export const LK_FRAMES = 1596;
export const SCHEME = 'dusty-teal';
const P = 'real3d/lakenheath-1956/';
const NF = [171, 210, 211, 264, 115, 172, 222, 231];
let acc = 0;
const plates = NF.map((n, i) => { const p = {src: P + 'b0' + (i + 1) + '.mp4', from: acc, dur: n, style: {filter: 'brightness(1.2)'}}; acc += n; return p; });
const Scrim = ({inF, outF}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 620, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 330}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
export const Lakenheath1956 = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <PlateTrack plates={plates} dip={0} />
    <Real3DFinish seed={56} />
    <Head from={0} dur={96} inF={-12} lines={['Radar locked on', 'at 4,000 mph']} />
    <Head from={592} dur={90} lines={['It shadowed', 'the jet']} />
    <Head from={856} dur={80} lines={['Ten minutes', 'on its tail']} />
    <Head from={971} dur={110} lines={['Crews saw', 'only a blip']} />
    <Head from={1143} dur={100} lines={['Meteors?', 'False echoes?']} />
    <Head from={1365} dur={110} lines={['Outfly', 'a jet?']} />
    <Tag from={4} dur={92} text="RAF LAKENHEATH · SUFFOLK · AUGUST 1956" y={1440} />
    <Tag from={175} dur={120} text="13 AUGUST 1956 · C-47 PILOT" />
    <Tag from={385} dur={120} text="GOLF-BALL-SIZED LIGHTS" />
    <Tag from={1000} dur={110} text="CONDON REPORT · CASE 2 · 1968" y={1440} />
    <R3DCaption words={VO.words} scheme={SCHEME} y={960} backing />
    <IAMark />
    <Sequence from={0} durationInFrames={LK_FRAMES}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
