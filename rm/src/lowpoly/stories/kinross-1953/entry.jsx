import {registerRoot, Composition} from 'remotion';
import {Kinross, KN_FRAMES} from './Kinross.jsx';
registerRoot(() => <Composition id="Kinross" component={Kinross} durationInFrames={KN_FRAMES} fps={30} width={1080} height={1920} />);
