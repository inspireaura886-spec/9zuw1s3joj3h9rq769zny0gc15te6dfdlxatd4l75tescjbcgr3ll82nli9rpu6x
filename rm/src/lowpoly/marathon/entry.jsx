// Entry for the 1904 Olympic marathon roast Short (own entry; shared index.jsx untouched).
import {registerRoot, Composition} from 'remotion';
import {Marathon, MARATHON_FRAMES} from './Marathon.jsx';
registerRoot(() => <>
  <Composition id="Marathon1904" component={Marathon} durationInFrames={MARATHON_FRAMES} fps={30} width={1080} height={1920} />
</>);
