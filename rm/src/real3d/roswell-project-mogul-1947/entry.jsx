import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Roswell1947, FRAMES} from './Roswell1947.jsx';
registerRoot(() => <Composition id="Roswell1947" component={Roswell1947} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
