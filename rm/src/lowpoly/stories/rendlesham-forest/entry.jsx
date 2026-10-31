import {registerRoot, Composition} from 'remotion';
import {Rf, RF_FRAMES} from './Rf.jsx';
registerRoot(() => <Composition id="Rf" component={Rf} durationInFrames={RF_FRAMES} fps={30} width={1080} height={1920} />);
