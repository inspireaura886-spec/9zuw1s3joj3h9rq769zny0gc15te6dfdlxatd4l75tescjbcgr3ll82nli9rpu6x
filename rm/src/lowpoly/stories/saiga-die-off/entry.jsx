import {registerRoot, Composition} from 'remotion';
import {Saiga, SG_FRAMES} from './Saiga.jsx';
registerRoot(() => <Composition id="Saiga" component={Saiga} durationInFrames={SG_FRAMES} fps={30} width={1080} height={1920} />);
