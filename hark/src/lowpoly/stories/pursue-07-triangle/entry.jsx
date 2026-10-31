import {registerRoot, Composition} from 'remotion';
import {TRI, TRI_FRAMES} from './Tri.jsx';
registerRoot(() => <Composition id="TRI" component={TRI} durationInFrames={TRI_FRAMES} fps={30} width={1080} height={1920} />);
