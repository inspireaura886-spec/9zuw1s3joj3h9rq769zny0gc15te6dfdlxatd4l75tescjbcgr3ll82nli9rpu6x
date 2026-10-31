// Entry for IA POV series ep1 v2 (own entry; v1 entry + shared index.jsx untouched).
import {registerRoot, Composition} from 'remotion';
import {Pov, POV_FRAMES} from './Pov2.jsx';
registerRoot(() => <>
  <Composition id="PovEp1v2" component={Pov} durationInFrames={POV_FRAMES} fps={30} width={1080} height={1920} />
</>);
