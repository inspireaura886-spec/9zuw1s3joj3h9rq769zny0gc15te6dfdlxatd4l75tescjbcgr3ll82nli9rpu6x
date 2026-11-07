import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {GreatPyramid2017, FRAMES} from './GreatPyramid2017.jsx';
registerRoot(() => <Composition id="GreatPyramid2017" component={GreatPyramid2017} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
