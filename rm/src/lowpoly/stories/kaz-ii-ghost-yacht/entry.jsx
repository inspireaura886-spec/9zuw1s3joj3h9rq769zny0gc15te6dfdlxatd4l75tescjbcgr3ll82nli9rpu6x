import {registerRoot, Composition} from 'remotion';
import {KZ, KZ_FRAMES} from './Kz.jsx';
registerRoot(() => <Composition id="KZ" component={KZ} durationInFrames={KZ_FRAMES} fps={30} width={1080} height={1920} />);
