import {registerRoot, Composition} from 'remotion';
import {Overtoun, OT_FRAMES} from './Overtoun.jsx';
registerRoot(() => <Composition id="Overtoun" component={Overtoun} durationInFrames={OT_FRAMES} fps={30} width={1080} height={1920} />);
