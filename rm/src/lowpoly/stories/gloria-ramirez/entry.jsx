import {registerRoot, Composition} from 'remotion';
import {Glo, GLO_FRAMES} from './Glo.jsx';
registerRoot(() => <Composition id="Glo" component={Glo} durationInFrames={GLO_FRAMES} fps={30} width={1080} height={1920} />);
