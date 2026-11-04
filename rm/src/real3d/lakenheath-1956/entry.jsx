import './palette.pick.js'; // FIRST import
import {registerRoot, Composition} from 'remotion';
import {Lakenheath1956, LK_FRAMES} from './Lakenheath1956.jsx';
registerRoot(() => <Composition id="Lakenheath1956" component={Lakenheath1956} durationInFrames={LK_FRAMES} fps={30} width={1080} height={1920} />);
