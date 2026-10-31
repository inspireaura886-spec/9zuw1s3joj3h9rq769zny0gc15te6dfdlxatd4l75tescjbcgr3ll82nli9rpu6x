// Separate entry for the Mad Gasser roast test (keeps the shared src/lowpoly/index.jsx untouched).
import {registerRoot, Composition} from 'remotion';
import {MadGasser, GASSER_FRAMES} from './stories/mad-gasser/MadGasser.jsx';
registerRoot(() => <>
  <Composition id="MadGasser" component={MadGasser} durationInFrames={GASSER_FRAMES} fps={30} width={1080} height={1920} />
</>);
