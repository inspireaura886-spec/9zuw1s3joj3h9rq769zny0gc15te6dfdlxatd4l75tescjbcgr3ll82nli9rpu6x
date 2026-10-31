// Own entry for the Dancing Plague test Short (keeps the shared src/lowpoly/index.jsx untouched).
import {registerRoot, Composition} from 'remotion';
import {Dancing, DANCING_FRAMES} from './Dancing.jsx';
registerRoot(() => <>
  <Composition id="DancingPlague" component={Dancing} durationInFrames={DANCING_FRAMES} fps={30} width={1080} height={1920} />
</>);
