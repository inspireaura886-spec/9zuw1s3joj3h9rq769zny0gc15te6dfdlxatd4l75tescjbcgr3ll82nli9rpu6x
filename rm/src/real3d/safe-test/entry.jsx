import './palette.pick.js';
import {registerRoot, Composition} from 'remotion';
import {SafeTest} from './SafeTest.jsx';
registerRoot(() => <Composition id="SafeTest" component={SafeTest} durationInFrames={60} fps={30} width={1080} height={1920} />);
