import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Usa32Farrah, FRAMES} from './Usa32Farrah.jsx';
registerRoot(() => <Composition id="Usa32Farrah" component={Usa32Farrah} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
