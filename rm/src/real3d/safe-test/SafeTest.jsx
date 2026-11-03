// Safe-area test frame for the Real3DKit layout (2026-11-03). Worst-case text lengths: long headline, long 3-word
// caption, long tag, IA mark, '3D RECONSTRUCTION' label. Not a Short.
import {AbsoluteFill, Img, staticFile, getInputProps} from 'remotion';
import {R3DFonts, R3DHead, R3DCaption, R3DTag, R3DTitle, IAMark, R3DLabel} from '../Real3DKit.jsx';
const words = [['Unidentified', 0, 0.5], ['radar', 0.5, 0.8], ['contacts.', 0.8, 1.4]];
export const SafeTest = () => (<AbsoluteFill style={{background: '#000'}}>
  <R3DFonts />
  {getInputProps().nobg ? null : <Img src={staticFile('real3d/safe-test/bg.png')} style={{width: 1080, height: 1920}} />}
  <R3DHead lines={['Official explanation', 'nobody could match the radar tracks']} y={250} />
  <R3DTag text="USS PRINCETON · SAN DIEGO · 14 NOV 2004" y={600} />
  <R3DTitle lines={[{text: 'FORTY THOUSAND FEET', at: 0}]} y={760} />
  <R3DCaption words={words} y={1250} backing={!getInputProps().nobg} />
  <IAMark />
  <R3DLabel />
</AbsoluteFill>);
