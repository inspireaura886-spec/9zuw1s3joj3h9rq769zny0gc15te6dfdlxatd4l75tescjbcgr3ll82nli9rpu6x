// IA Science "What If" TEST Shorts (NOT for posting). npx remotion render src/science/entry.jsx <Id> --gl=swangle
import {registerRoot, Composition} from 'remotion';
import {Sheet} from './Sheet.jsx';
import {CardTest} from './CardTest.jsx';
import {Ep1, EP1_FRAMES} from './ep1/Ep1.jsx';
registerRoot(() => <>
  <Composition id="SciSheet" component={Sheet} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="SciCardTest" component={CardTest} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="SciEp1" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={1080} height={1920} />
</>);
