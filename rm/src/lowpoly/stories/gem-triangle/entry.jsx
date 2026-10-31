import {registerRoot, Composition} from 'remotion';
import {GemTriangle, GEMTRI_FRAMES} from './GemTriangle.jsx';

registerRoot(() => (
  <Composition
    id="GEMTRI"
    component={GemTriangle}
    durationInFrames={GEMTRI_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
));
