import {registerRoot, Composition} from 'remotion';
import {Woolpit, WP_FRAMES} from './Woolpit.jsx';
registerRoot(() => <Composition id="Woolpit" component={Woolpit} durationInFrames={WP_FRAMES} fps={30} width={1080} height={1920} />);
