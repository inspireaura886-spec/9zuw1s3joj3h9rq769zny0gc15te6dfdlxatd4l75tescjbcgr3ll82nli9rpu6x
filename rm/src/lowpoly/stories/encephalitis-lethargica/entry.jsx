import {registerRoot, Composition} from 'remotion';
import {El, EL_FRAMES} from './El.jsx';
registerRoot(() => <Composition id="El" component={El} durationInFrames={EL_FRAMES} fps={30} width={1080} height={1920} />);
