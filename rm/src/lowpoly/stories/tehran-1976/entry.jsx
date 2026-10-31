import {registerRoot, Composition} from 'remotion';
import {TH, TH_FRAMES} from './Th.jsx';
registerRoot(() => <Composition id="TH" component={TH} durationInFrames={TH_FRAMES} fps={30} width={1080} height={1920} />);
