import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Alcatraz1962, FRAMES} from './Alcatraz1962.jsx';
registerRoot(() => <Composition id="Alcatraz1962" component={Alcatraz1962} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
