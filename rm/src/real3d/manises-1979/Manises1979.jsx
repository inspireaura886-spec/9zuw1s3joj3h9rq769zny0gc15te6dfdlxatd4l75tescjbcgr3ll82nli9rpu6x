// manises-1979: FIRST REAL3D Short (2026-11-02). Plates = Blender Cycles on GitHub (blender/scenes/manises-1979),
// composited here. No shake, no dips, smooth emphasis pushes only; caption scheme 'ember' (CAPTION_LOG.csv).
import {AbsoluteFill, Sequence} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead} from '../Real3DKit.jsx';
import VO from './vo.json';

export const M79_FRAMES = 1530;
export const SCHEME = 'ember';
const P = 'real3d/manises-1979/';
const plates = [
  {src: P + 'b01h.mp4', from: 0, dur: 132},
  {src: P + 'b02.mp4', from: 132, dur: 102},
  {src: P + 'b03.mp4', from: 234, dur: 52},
  {src: P + 'b04.mp4', from: 286, dur: 117},
  {src: P + 'b05.mp4', from: 403, dur: 132},
  {src: P + 'b06.mp4', from: 535, dur: 177, punches: [{at: 2, to: 1.03, dur: 30}]},
  {src: P + 'b07.mp4', from: 712, dur: 206, punches: [{at: 63, to: 1.035, dur: 24}]},
  {src: P + 'b08.mp4', from: 918, dur: 70, punches: [{at: 22, to: 1.03, dur: 30}]},
  {src: P + 'b09.mp4', from: 988, dur: 134},
  {src: P + 'b10.mp4', from: 1122, dur: 216, punches: [{at: 190, to: 1.03, dur: 20}]},
  {src: P + 'b11.mp4', from: 1338, dur: 192},
];
const Head = ({from, dur, lines}) => (<Sequence from={from} durationInFrames={dur}><R3DHead scheme={SCHEME} lines={lines} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 300}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={32} /></Sequence>);
export const Manises1979 = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <PlateTrack plates={plates} dip={0} />
    <Real3DFinish seed={11} />
    <Head from={0} dur={80} lines={['2 red lights', 'chased a jet with 109 aboard']} />
    <Head from={537} dur={54} lines={['But...', "the Air Force wasn't done"]} />
    <Head from={940} dur={48} lines={['His warnings', 'went off']} />
    <Head from={1135} dur={72} lines={['Official answer', 'refinery flares']} />
    <Head from={1360} dur={170} lines={['Refinery flare', 'or two red lights?']} />
    <Tag from={140} dur={92} text="NEAR IBIZA · 11 NOV 1979" />
    <Tag from={292} dur={108} text="BARCELONA · MADRID RADAR" />
    <Tag from={410} dur={120} text="EMERGENCY LANDING · MANISES, VALENCIA" />
    <Tag from={600} dur={110} text="LOS LLANOS AIR BASE · ALBACETE" />
    <Tag from={716} dur={110} text="CAPT. FERNANDO CÁMARA · MIRAGE F1" />
    <Tag from={992} dur={60} text="SAGUNTO" />
    <Tag from={1210} dur={120} text="ESCOMBRERAS REFINERY · CARTAGENA" />
    <R3DCaption words={VO.words} scheme={SCHEME} y={1250} />
    <IAMark />
    <div style={{position: 'absolute', top: 1590, width: '100%', textAlign: 'center', fontFamily: 'Inter', fontWeight: 500, fontSize: 22, letterSpacing: 3, color: 'rgba(240,238,232,0.42)'}}>3D RECONSTRUCTION</div>
  </AbsoluteFill>
);
