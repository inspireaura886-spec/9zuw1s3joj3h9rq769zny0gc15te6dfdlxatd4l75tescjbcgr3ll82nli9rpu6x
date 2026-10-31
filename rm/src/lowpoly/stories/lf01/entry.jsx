import {registerRoot, Composition} from 'remotion';
import {Lf, IDS, frames} from './Lf01.jsx';
registerRoot(() => <>{IDS.map((id) => <Composition key={id} id={'LF-' + id} component={Lf(id)} durationInFrames={frames(id)} fps={24} width={1920} height={1080} />)}</>);
