import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {TaosHum, TAOS_FRAMES} from './TaosHum.jsx';
registerRoot(() => <Composition id="TaosHum" component={TaosHum} durationInFrames={TAOS_FRAMES} fps={30} width={1080} height={1920} />);
