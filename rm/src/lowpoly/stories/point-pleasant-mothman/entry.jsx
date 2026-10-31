import {registerRoot, Composition} from 'remotion';
import {Mm, MM_FRAMES} from './Mm.jsx';
registerRoot(() => <Composition id="Mm" component={Mm} durationInFrames={MM_FRAMES} fps={30} width={1080} height={1920} />);
