import {registerRoot, Composition} from 'remotion';
import {Sp, SP_FRAMES} from './Sp.jsx';
registerRoot(() => <Composition id="Sp" component={Sp} durationInFrames={SP_FRAMES} fps={30} width={1080} height={1920} />);
