import {registerRoot, Composition} from 'remotion';
import {Hop, HOP_FRAMES} from './Hop.jsx';
registerRoot(() => <Composition id="Hop" component={Hop} durationInFrames={HOP_FRAMES} fps={30} width={1080} height={1920} />);
