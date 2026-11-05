import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {OakIsland, OAK_FRAMES} from './OakIsland.jsx';
registerRoot(() => <Composition id="OakIsland" component={OakIsland} durationInFrames={OAK_FRAMES} fps={30} width={1080} height={1920} />);
