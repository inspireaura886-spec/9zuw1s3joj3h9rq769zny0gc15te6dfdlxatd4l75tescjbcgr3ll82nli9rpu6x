import {registerRoot, Composition} from 'remotion';
import {VL, VL_FRAMES} from './Vl.jsx';
registerRoot(() => <Composition id="VL" component={VL} durationInFrames={VL_FRAMES} fps={30} width={1080} height={1920} />);
