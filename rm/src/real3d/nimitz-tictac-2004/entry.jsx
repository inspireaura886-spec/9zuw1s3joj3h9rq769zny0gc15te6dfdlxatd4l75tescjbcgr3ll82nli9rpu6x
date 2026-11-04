import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Nimitz2004, NIM_FRAMES} from './Nimitz2004.jsx';
registerRoot(() => <Composition id="Nimitz2004" component={Nimitz2004} durationInFrames={NIM_FRAMES} fps={30} width={1080} height={1920} />);
