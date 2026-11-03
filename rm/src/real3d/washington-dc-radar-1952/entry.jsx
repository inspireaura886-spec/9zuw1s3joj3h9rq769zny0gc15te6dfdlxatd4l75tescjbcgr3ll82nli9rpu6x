import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {DcRadar1952, DCR_FRAMES} from './DcRadar1952.jsx';
registerRoot(() => <Composition id="DcRadar1952" component={DcRadar1952} durationInFrames={DCR_FRAMES} fps={30} width={1080} height={1920} />);
