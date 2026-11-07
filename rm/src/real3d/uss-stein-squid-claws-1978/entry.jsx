import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {UssSteinSquid1978, FRAMES} from './UssSteinSquid1978.jsx';
registerRoot(() => <Composition id="UssSteinSquid1978" component={UssSteinSquid1978} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
