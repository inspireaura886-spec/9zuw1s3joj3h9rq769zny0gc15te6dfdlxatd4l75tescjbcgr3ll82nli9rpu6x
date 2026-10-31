// Entry for low-poly 3D Shorts: npx remotion render src/lowpoly/index.jsx <Id> out.mp4 --gl=swangle
import {registerRoot, Composition} from 'remotion';
import {Nyos, NYOS_FRAMES} from './stories/nyos/Nyos.jsx';
import {Flannan, FLANNAN_FRAMES} from './stories/flannan-isles/Flannan.jsx';
import {Omg, OMG_FRAMES} from './stories/omg/Omg.jsx';
import {Widecombe, WC_FRAMES} from './stories/widecombe/Widecombe.jsx';
import {Saiga, SG_FRAMES} from './stories/saiga-die-off/Saiga.jsx';
import {Kinross, KN_FRAMES} from './stories/kinross-1953/Kinross.jsx';
registerRoot(() => <>
  <Composition id="Nyos" component={Nyos} durationInFrames={NYOS_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Flannan" component={Flannan} durationInFrames={FLANNAN_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Omg" component={Omg} durationInFrames={OMG_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Widecombe" component={Widecombe} durationInFrames={WC_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Saiga" component={Saiga} durationInFrames={SG_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="Kinross" component={Kinross} durationInFrames={KN_FRAMES} fps={30} width={1080} height={1920} />
</>);
