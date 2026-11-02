// Only the IA Science cast Shorts (three.js in Remotion, entry src/science/) switch to software WebGL on GitHub runners; every other entry keeps the default.
// Science v2 cards are heavy on the software canvas, so science entries also get a longer delayRender timeout (2026-11-02).
import {Config} from '@remotion/cli/config';
if (process.argv.some((a) => String(a).includes('src/science/'))) { Config.setChromiumOpenGlRenderer('swangle'); Config.setDelayRenderTimeoutInMilliseconds(180000); }
