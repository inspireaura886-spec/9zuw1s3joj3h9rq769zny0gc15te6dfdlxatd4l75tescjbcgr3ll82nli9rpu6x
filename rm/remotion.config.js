// Only the IA Science cast Shorts (three.js in Remotion, entry src/science/) switch to software WebGL on GitHub runners; every other entry keeps the default.
import {Config} from '@remotion/cli/config';
if (process.argv.some((a) => String(a).includes('src/science/'))) Config.setChromiumOpenGlRenderer('swangle');
