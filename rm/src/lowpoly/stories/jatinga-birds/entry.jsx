import {registerRoot, Composition} from 'remotion';
import {Jb, JB_FRAMES} from './Jb.jsx';
registerRoot(() => <Composition id="Jb" component={Jb} durationInFrames={JB_FRAMES} fps={30} width={1080} height={1920} />);
