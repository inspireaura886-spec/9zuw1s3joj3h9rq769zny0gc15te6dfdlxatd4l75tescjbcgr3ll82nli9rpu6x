import {Composition} from 'remotion';
import {CaseCard} from './CaseCard.jsx';
import {StickBar} from './StickBar.jsx';
import {LottieTest} from './LottieTest.jsx';
export const Root = () => (<>
  <Composition id="CaseCard" component={CaseCard} durationInFrames={120} fps={30} width={1080} height={1920}
    defaultProps={{kicker: 'CASE FILE', title: 'THE SOMERTON MAN', date: '1 DEC 1948', place: 'ADELAIDE, AUSTRALIA'}} />
  <Composition id="StickBar" component={StickBar} durationInFrames={300} fps={30} width={1080} height={1920} />
  <Composition id="LottieTest" component={LottieTest} durationInFrames={90} fps={30} width={1080} height={1920} />
</>);
