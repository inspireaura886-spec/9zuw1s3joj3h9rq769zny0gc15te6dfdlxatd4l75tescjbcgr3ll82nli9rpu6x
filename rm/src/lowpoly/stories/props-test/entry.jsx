import {registerRoot, Composition} from 'remotion';
import {HauntedRoom} from './HauntedRoom.jsx';
registerRoot(() => <Composition id="PropsTest" component={HauntedRoom} durationInFrames={90} fps={30} width={1080} height={1920} />);
