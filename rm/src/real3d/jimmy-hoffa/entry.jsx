import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Hoffa, HOFFA_FRAMES} from './Hoffa.jsx';
registerRoot(() => <Composition id="Hoffa" component={Hoffa} durationInFrames={HOFFA_FRAMES} fps={30} width={1080} height={1920} />);
