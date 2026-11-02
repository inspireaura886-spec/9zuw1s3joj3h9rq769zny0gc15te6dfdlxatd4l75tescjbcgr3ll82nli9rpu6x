// REAL3D test Short (NOT for posting): Manises 1979, first three VO lines. Plates: Blender on GitHub (blender/scenes/manises).
import {AbsoluteFill, Sequence} from 'remotion';
import {WordCaption, FontFaces} from '../../lowpoly/kit/Overlay.jsx';
import {PlateTrack, Real3DFinish, R3DTitle, R3DTag, IAMark, R3DFonts} from '../Real3DKit.jsx';
import VO from './vo.json';

export const MANISES_FRAMES = 600;
const P = 'real3d/manises-test/';
const plates = [
  {src: P + 'p1.mp4', from: 0, dur: 230},
  {src: P + 'p2.mp4', from: 230, dur: 92, punches: [{at: 34, to: 1.06, dur: 9}], flashAt: [49]},
  {src: P + 'p3.mp4', from: 322, dur: 95, punches: [{at: 35, to: 1.05, dur: 10}]},
  {src: P + 'p4.mp4', from: 417, dur: 183},
];
export const Manises = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><R3DFonts />
    <PlateTrack plates={plates} dip={2} />
    <Real3DFinish seed={7} />
    <Sequence from={0} durationInFrames={80}><R3DTitle out={70} lines={[{text: '109 PASSENGERS.', at: 0, size: 84}, {text: 'Two red lights.', at: 6, red: true, size: 92}]} sub={{text: 'SPAIN · 11 NOV 1979', at: 12}} /></Sequence>
    <Sequence from={322} durationInFrames={95}><R3DTag text="BARCELONA · MADRID RADAR" at={4} y={300} /></Sequence>
    <WordCaption words={VO.words} y={1310} />
    <IAMark />
  </AbsoluteFill>
);
