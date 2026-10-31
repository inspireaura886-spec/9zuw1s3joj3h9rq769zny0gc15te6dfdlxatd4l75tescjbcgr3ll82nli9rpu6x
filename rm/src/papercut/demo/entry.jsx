import {registerRoot, Composition} from 'remotion';
import {PaperDemo} from './PaperDemo.jsx';
registerRoot(() => <Composition id="PaperDemo" component={PaperDemo} durationInFrames={240} fps={30} width={1080} height={1920} />);
