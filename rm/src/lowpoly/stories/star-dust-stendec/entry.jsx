import {registerRoot, Composition} from 'remotion';
import {SD, SD_FRAMES} from './Sd.jsx';
registerRoot(() => <Composition id="SD" component={SD} durationInFrames={SD_FRAMES} fps={30} width={1080} height={1920} />);
