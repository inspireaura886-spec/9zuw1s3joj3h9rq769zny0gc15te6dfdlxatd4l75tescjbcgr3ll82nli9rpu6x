import {registerRoot, Composition} from 'remotion';
import {Manises, MANISES_FRAMES} from './Manises.jsx';
registerRoot(() => <Composition id="R3DManises" component={Manises} durationInFrames={MANISES_FRAMES} fps={30} width={1080} height={1920} />);
