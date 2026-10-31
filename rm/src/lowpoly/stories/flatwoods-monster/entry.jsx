import {registerRoot, Composition} from 'remotion';
import {Fw, FW_FRAMES} from './Fw.jsx';
registerRoot(() => <Composition id="Fw" component={Fw} durationInFrames={FW_FRAMES} fps={30} width={1080} height={1920} />);
