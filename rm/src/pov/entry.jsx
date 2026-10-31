// Entry for IA POV series ep1 (own entry; shared index.jsx untouched).
import {registerRoot, Composition} from 'remotion';
import {Pov, POV_FRAMES} from './Pov.jsx';
registerRoot(() => <>
  <Composition id="PovEp1" component={Pov} durationInFrames={POV_FRAMES} fps={30} width={1080} height={1920} />
</>);
