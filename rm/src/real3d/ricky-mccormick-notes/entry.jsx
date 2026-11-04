import './palette.pick.js'; // FIRST import: sets the humane caption palette
import {registerRoot, Composition} from 'remotion';
import {McCormickNotes, MC_FRAMES} from './McCormickNotes.jsx';
registerRoot(() => <Composition id="McCormickNotes" component={McCormickNotes} durationInFrames={MC_FRAMES} fps={30} width={1080} height={1920} />);
