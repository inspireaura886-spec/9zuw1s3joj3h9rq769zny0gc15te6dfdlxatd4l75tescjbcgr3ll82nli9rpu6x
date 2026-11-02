// Only the IA Science cast Shorts (three.js in Remotion) need software WebGL on GitHub runners; every other entry keeps the default.
import {Config} from '@remotion/cli/config';
if (process.argv.some((a) => a.includes('src/science/'))) Config.setChromiumOpenGlRenderer('swangle');
