import {registerRoot, Composition} from 'remotion';
import {Shag, SH_FRAMES} from './Shag.jsx';
registerRoot(() => <Composition id="Shag" component={Shag} durationInFrames={SH_FRAMES} fps={30} width={1080} height={1920} />);
