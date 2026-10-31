import {registerRoot, Composition} from 'remotion';
import {FL, FL_FRAMES} from './Fl.jsx';
registerRoot(() => <Composition id="FLA" component={FL} durationInFrames={FL_FRAMES} fps={30} width={1080} height={1920} />);
