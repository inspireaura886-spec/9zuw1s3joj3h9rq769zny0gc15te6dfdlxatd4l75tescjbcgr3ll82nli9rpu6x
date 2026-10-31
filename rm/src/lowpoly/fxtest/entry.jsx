import {registerRoot, Composition} from 'remotion';
import {FxTest} from './FxTest.jsx';
registerRoot(() => <Composition id="FxTest" component={FxTest} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{variant: 'base'}} />);
