// IA Science "What If" TEST Shorts (NOT for posting). npx remotion render src/science/entry.jsx <Id> --gl=swangle
import {registerRoot, Composition} from 'remotion';
import {Sheet} from './Sheet.jsx';
import {CardTest} from './CardTest.jsx';
import {CrewBoard} from './CrewTest.jsx';
import {SheetV2} from './SheetV2.jsx';
import {ExprTest, EXPR_FRAMES} from './ExprTest.jsx';
import {Ep1, EP1_FRAMES} from './ep1/Ep1.jsx';
import {Ep2, EP2_FRAMES} from './ep2/Ep2.jsx';
import {Ep3, EP3_FRAMES} from './ep3/Ep3.jsx';
registerRoot(() => <>
  <Composition id="SciSheet" component={Sheet} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="SciSheetV2" component={SheetV2} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="SciExprTest" component={ExprTest} durationInFrames={EXPR_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="SciCrewBoard" component={CrewBoard} durationInFrames={1} fps={30} width={1600} height={1920} />
  <Composition id="SciCardTest" component={CardTest} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="SciEp1" component={Ep1} durationInFrames={EP1_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="SciEp2" component={Ep2} durationInFrames={EP2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="SciEp3" component={Ep3} durationInFrames={EP3_FRAMES} fps={30} width={1080} height={1920} />
</>);
