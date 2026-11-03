import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {VR, VR_FRAMES} from './Vr.jsx';
registerRoot(() => <Composition id="VR" component={VR} durationInFrames={VR_FRAMES} fps={30} width={1080} height={1920} />);
