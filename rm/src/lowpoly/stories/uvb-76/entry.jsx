import {registerRoot, Composition} from 'remotion';
import {Uvb, UV_FRAMES} from './Uvb.jsx';
registerRoot(() => <Composition id="Uvb" component={Uvb} durationInFrames={UV_FRAMES} fps={30} width={1080} height={1920} />);
