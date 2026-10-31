import {registerRoot, Composition} from 'remotion';
import {MC, MC_FRAMES} from './Mc.jsx';
registerRoot(() => <Composition id="MC" component={MC} durationInFrames={MC_FRAMES} fps={30} width={1080} height={1920} />);
