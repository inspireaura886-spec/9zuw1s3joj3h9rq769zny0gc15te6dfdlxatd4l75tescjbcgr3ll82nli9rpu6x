import {registerRoot, Composition} from 'remotion';
import {KitDemo, KD} from './KitDemo.jsx';
registerRoot(() => <Composition id="KitDemo" component={KitDemo} durationInFrames={KD.END} fps={30} width={1080} height={1920} />);
