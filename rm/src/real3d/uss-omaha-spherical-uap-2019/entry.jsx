import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {UssOmaha2019, FRAMES} from './UssOmaha2019.jsx';
registerRoot(() => <Composition id="UssOmaha2019" component={UssOmaha2019} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
