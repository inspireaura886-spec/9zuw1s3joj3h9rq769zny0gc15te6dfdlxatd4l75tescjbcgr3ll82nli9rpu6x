// usage: node stills.mjs <bundleDir> <outDir> f1 f2 ...   (one shared browser, swangle)
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
const [bundle, out, ...frames] = process.argv.slice(2);
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
const comp = await selectComposition({serveUrl: bundle, id: 'Marathon1904', puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}});
for (const f of frames) {
  const t = Date.now();
  try { await renderStill({serveUrl: bundle, composition: comp, frame: +f, output: `${out}/f${String(f).padStart(4, '0')}.png`, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}, imageFormat: 'png'});
    console.log('ok', f, Date.now() - t, 'ms'); } catch (e) { console.log('ERR', f, String(e).slice(0, 400)); }
}
await browser.close({silent: true});
