import {registerRoot, Composition} from 'remotion';
import {Cyc, CYC_FRAMES} from './Cyc.jsx';
registerRoot(() => <Composition id="Cyc" component={Cyc} durationInFrames={CYC_FRAMES} fps={30} width={1080} height={1920} />);
