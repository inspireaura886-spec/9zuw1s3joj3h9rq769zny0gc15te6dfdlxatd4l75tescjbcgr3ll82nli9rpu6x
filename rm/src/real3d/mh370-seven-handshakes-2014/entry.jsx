import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Mh370, MH_FRAMES} from './Mh370.jsx';
registerRoot(() => <Composition id="Mh370" component={Mh370} durationInFrames={MH_FRAMES} fps={30} width={1080} height={1920} />);
