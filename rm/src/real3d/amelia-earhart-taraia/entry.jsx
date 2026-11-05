import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Amelia, AMELIA_FRAMES} from './Amelia.jsx';
registerRoot(() => <Composition id="Amelia" component={Amelia} durationInFrames={AMELIA_FRAMES} fps={30} width={1080} height={1920} />);
