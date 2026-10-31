import {registerRoot, Composition} from 'remotion';
import {NoirDemo} from './NoirDemo.jsx';
registerRoot(() => <Composition id="NoirDemo" component={NoirDemo} durationInFrames={240} fps={30} width={1080} height={1920} />);
