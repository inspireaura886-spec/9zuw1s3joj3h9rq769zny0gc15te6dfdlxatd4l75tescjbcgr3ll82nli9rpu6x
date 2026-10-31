import {registerRoot, Composition} from 'remotion';
import {SOC, SOC_FRAMES} from './Soc.jsx';
registerRoot(() => <Composition id="SOC" component={SOC} durationInFrames={SOC_FRAMES} fps={30} width={1080} height={1920} />);
