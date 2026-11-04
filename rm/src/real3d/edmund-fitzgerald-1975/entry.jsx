import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Fitzgerald1975, FITZ_FRAMES} from './Fitzgerald1975.jsx';
registerRoot(() => <Composition id="Fitzgerald1975" component={Fitzgerald1975} durationInFrames={FITZ_FRAMES} fps={30} width={1080} height={1920} />);
