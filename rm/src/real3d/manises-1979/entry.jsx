import {registerRoot, Composition} from 'remotion';
import {Manises1979, M79_FRAMES} from './Manises1979.jsx';
registerRoot(() => <Composition id="Manises1979" component={Manises1979} durationInFrames={M79_FRAMES} fps={30} width={1080} height={1920} />);
