import {registerRoot, Composition} from 'remotion';
import {PoseTest} from './PoseTest.jsx';
import {BoothRules, BOOTH_FRAMES} from './stories/BoothRules.jsx';
import {Voicemail312, VM_FRAMES} from './stories/Voicemail312.jsx';
import {ElevenCustomers, EC_FRAMES} from './stories/ElevenCustomers.jsx';
import {FloorZero, FZ_FRAMES} from './stories/FloorZero.jsx';
import {HollowLane, HL_FRAMES} from './stories/HollowLane.jsx';
import {SecondVoice, SV_FRAMES} from './stories/SecondVoice.jsx';
import {WishingWell, WW_FRAMES} from './stories/WishingWell.jsx';
import {Room414, R414_FRAMES} from './stories/Room414.jsx';
import {TrailCam, TC_FRAMES} from './stories/TrailCam.jsx';
import {RouteNine, R9_FRAMES} from './stories/RouteNine.jsx';
import {ThirteenSteps, TS_FRAMES} from './stories/ThirteenSteps.jsx';
const Root=()=> <>
  <Composition id="NTPoseTest" component={PoseTest} durationInFrames={60} fps={30} width={1080} height={1920}/>
  <Composition id="NTBoothRules" component={BoothRules} durationInFrames={BOOTH_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTVoicemail312" component={Voicemail312} durationInFrames={VM_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTElevenCustomers" component={ElevenCustomers} durationInFrames={EC_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTFloorZero" component={FloorZero} durationInFrames={FZ_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTHollowLane" component={HollowLane} durationInFrames={HL_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTSecondVoice" component={SecondVoice} durationInFrames={SV_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTWishingWell" component={WishingWell} durationInFrames={WW_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTRoom414" component={Room414} durationInFrames={R414_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTTrailCam" component={TrailCam} durationInFrames={TC_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTRouteNine" component={RouteNine} durationInFrames={R9_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="NTThirteenSteps" component={ThirteenSteps} durationInFrames={TS_FRAMES} fps={30} width={1080} height={1920}/>
</>;
registerRoot(Root);
