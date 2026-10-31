import {registerRoot, Composition} from 'remotion';
import {VG, VG_FRAMES} from './Vg.jsx';
registerRoot(() => <Composition id="VG" component={VG} durationInFrames={VG_FRAMES} fps={30} width={1080} height={1920} />);
