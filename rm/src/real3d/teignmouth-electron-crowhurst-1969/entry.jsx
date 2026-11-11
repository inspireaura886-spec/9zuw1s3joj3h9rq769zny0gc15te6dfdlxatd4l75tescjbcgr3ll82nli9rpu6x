import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {Crowhurst1969, FRAMES} from './Crowhurst1969.jsx';
registerRoot(() => <Composition id="Crowhurst1969" component={Crowhurst1969} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
