import {registerRoot, Composition} from 'remotion';
import {Kk, KK_FRAMES} from './Kk.jsx';
registerRoot(() => <Composition id="Kk" component={Kk} durationInFrames={KK_FRAMES} fps={30} width={1080} height={1920} />);
