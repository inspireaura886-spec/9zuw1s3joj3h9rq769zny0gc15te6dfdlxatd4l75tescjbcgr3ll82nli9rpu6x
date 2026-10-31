import {EffectComposer, Bloom, Vignette, ChromaticAberration, SMAA, FXAA} from '@react-three/postprocessing';
import {Vector2} from 'three';

/**
 * ANIMATION UPGRADE 2026-10-22. Real post-processing inside a <Stage> (put it LAST among the 3D children).
 * Tested under --gl=swangle: keeps the CSS sky (alpha) intact; costs ~+0.25 s/frame at 1080x1920 (resolution-bound, not scene-bound).
 * bloom = strength (0 = off); threshold: luminance above which things glow (0.45 = windows, fire, beams, emissive, sky-bright foam).
 * Everything you want to glow: meshBasicMaterial / emissive / additive sprites with bright colours (>= ~#ffcc66).
 * ca = chromatic aberration offset (0.0015 for impact frames only). DepthOfField is NOT here: 3.6 s/frame under swangle (fake it with
 * foreground blur layers instead). smaa adds anti-aliasing (composer disables canvas MSAA): ~+0.05 s/frame.
 */
export const Post = ({bloom = 1.1, threshold = 0.5, smoothing = 0.3, levels = 6, vignette = 0.45, ca = 0, aa = 'fxaa', smaa, enabled = true}) => {
  if (smaa === true) aa = 'smaa'; if (smaa === false && aa === 'smaa') aa = 'none';
  if (!enabled) return null;
  const fx = [];
  if (bloom > 0) fx.push(<Bloom key="b" intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={smoothing} mipmapBlur levels={levels} />);
  if (ca > 0) fx.push(<ChromaticAberration key="c" offset={new Vector2(ca, ca * 0.6)} radialModulation={false} modulationOffset={0} />);
  if (vignette > 0) fx.push(<Vignette key="v" offset={0.3} darkness={vignette} />);
  if (aa === 'smaa') fx.push(<SMAA key="s" />); else if (aa === 'fxaa') fx.push(<FXAA key="f" />);
  return <EffectComposer multisampling={aa === 'msaa' ? 4 : 0} disableNormalPass>{fx}</EffectComposer>;
};
