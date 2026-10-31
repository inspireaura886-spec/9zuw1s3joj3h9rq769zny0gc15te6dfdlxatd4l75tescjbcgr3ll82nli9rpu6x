// NEW ANIMATION STYLES 2026-10-30: test + showcase. StylesDemo = all 9 in sequence (105 f each); StyleA..StyleI = one each (bench).
import {registerRoot, Composition, Sequence, AbsoluteFill} from 'remotion';
import {FontFaces, Finish} from '../../kit/index.js';
import {RouteGlobe, BlueprintXray, PovWalk, TiltShift, FoundFootage, ShadowPuppet, ParticleFigure, TimelineClock, FaceCloseUp} from '../../kit/styles/index.js';

const D = 105;
export const DEMOS = {
  A: () => <RouteGlobe dur={D} title="USS CYCLOPS, 1918" stops={[{lat: -22.9, lon: -43.2, label: 'RIO DE JANEIRO', date: 'FEB 1918'}, {lat: 13.1, lon: -59.6, label: 'BARBADOS', date: '4 MAR 1918'}, {lat: 39.29, lon: -76.61, label: 'BALTIMORE?', date: 'NEVER ARRIVED'}]} />,
  B: () => <BlueprintXray dur={D} label="RECONSTRUCTED" />,
  C: () => <PovWalk dur={D} palette="ia-dark" label="ROOM 3 · 01:12" />,
  D: () => <TiltShift dur={D} label="THE VILLAGE, 1890" />,
  E: () => <FoundFootage dur={D} images={['leprince/IMG1.jpg', 'leprince/IMG2.jpg', 'leprince/IMG3.jpg']} headlines={['INVENTOR MISSING', 'NO TRACE', 'THE FIRST FILM']} hero="leprince/IMG2.jpg" />,
  F: () => <ShadowPuppet dur={D} label="He boarded the train..." set={['moon', 'tree', 'train']} actors={[{x0: 160, x1: 640, pose: 'walk', hat: true, to: 70, then: {at: 70, pose: 'reach'}}]} />,
  G: () => <ParticleFigure dur={D} shape="person" label="NEVER SEEN AGAIN" />,
  H: () => <TimelineClock dur={D} from="06:00" to="23:58" events={[{date: '1888', label: 'FIRST FILM'}, {date: '16 SEP 1890', label: 'BOARDS TRAIN'}, {date: '1897', label: 'DECLARED DEAD'}]} />,
  I: () => <FaceCloseUp dur={D} expr="fear" demoTalk />,
};
const Wrap = ({C}) => <AbsoluteFill><FontFaces /><C /><Finish vignette={0.3} grain={0.05} /></AbsoluteFill>;
const All = () => <AbsoluteFill style={{background: '#000'}}><FontFaces />
  {Object.values(DEMOS).map((C, i) => <Sequence key={i} from={i * D} durationInFrames={D}><C /><Finish vignette={0.3} grain={0.05} /></Sequence>)}</AbsoluteFill>;
registerRoot(() => <>
  <Composition id="StylesDemo" component={All} durationInFrames={D * 9} fps={30} width={1080} height={1920} />
  {Object.entries(DEMOS).map(([k, C]) => <Composition key={k} id={'Style' + k} component={() => <Wrap C={C} />} durationInFrames={D} fps={30} width={1080} height={1920} />)}
</>);
