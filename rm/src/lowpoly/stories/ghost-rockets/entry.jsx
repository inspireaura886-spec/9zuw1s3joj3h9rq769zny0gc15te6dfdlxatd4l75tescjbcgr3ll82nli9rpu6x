import {registerRoot, Composition} from 'remotion';
import {Gr, GR_FRAMES} from './Gr.jsx';
registerRoot(() => <Composition id="Gr" component={Gr} durationInFrames={GR_FRAMES} fps={30} width={1080} height={1920} />);
