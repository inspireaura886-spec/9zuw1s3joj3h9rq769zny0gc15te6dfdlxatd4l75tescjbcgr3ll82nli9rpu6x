import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Californian1912, FRAMES} from './Californian1912.jsx';
registerRoot(() => <Composition id="Californian1912" component={Californian1912} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
