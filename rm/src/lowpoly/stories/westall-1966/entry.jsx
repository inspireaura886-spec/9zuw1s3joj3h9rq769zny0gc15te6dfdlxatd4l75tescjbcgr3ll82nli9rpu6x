import {registerRoot, Composition} from 'remotion';
import {WS, WS_FRAMES} from './Ws.jsx';
registerRoot(() => <Composition id="WS" component={WS} durationInFrames={WS_FRAMES} fps={30} width={1080} height={1920} />);
