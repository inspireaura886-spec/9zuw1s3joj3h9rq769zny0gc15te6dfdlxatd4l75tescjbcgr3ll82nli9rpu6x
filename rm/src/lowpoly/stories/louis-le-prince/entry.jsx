import {registerRoot, Composition} from 'remotion';
import {LP, LP_FRAMES} from './Lp.jsx';
const A = () => <LP hook="A" />; const B = () => <LP hook="B" />;
registerRoot(() => <><Composition id="LPA" component={A} durationInFrames={LP_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="LPB" component={B} durationInFrames={LP_FRAMES} fps={30} width={1080} height={1920} /></>);
