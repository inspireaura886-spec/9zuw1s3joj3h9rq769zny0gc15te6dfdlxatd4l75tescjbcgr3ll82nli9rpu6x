import {registerRoot, Composition} from 'remotion';
import {Bml, BML_FRAMES} from './Bml.jsx';
registerRoot(() => <Composition id="Bml" component={Bml} durationInFrames={BML_FRAMES} fps={30} width={1080} height={1920} />);
