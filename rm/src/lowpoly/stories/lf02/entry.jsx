import {registerRoot, Composition} from 'remotion';
import {Lf, IDS, frames, Sting, STING_FRAMES} from './Lf02.jsx';
registerRoot(() => <>{IDS.map((id) => <Composition key={id} id={'LF-' + id} component={Lf(id)} durationInFrames={frames(id)} fps={24} width={1920} height={1080} />)}<Composition id="LF-STING" component={Sting} durationInFrames={STING_FRAMES} fps={24} width={1920} height={1080} /></>);
