import {registerRoot, Composition} from 'remotion';
import {MH, MH_FRAMES} from './Mh.jsx';
registerRoot(() => <Composition id="MH" component={MH} durationInFrames={MH_FRAMES} fps={30} width={1080} height={1920} />);
