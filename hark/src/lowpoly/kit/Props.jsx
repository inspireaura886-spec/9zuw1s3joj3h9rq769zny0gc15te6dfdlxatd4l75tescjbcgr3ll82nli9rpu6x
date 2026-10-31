// Grab3D Cozy Horror Props (CC0, 34 models) for the R3F/ThreeCanvas kit. See ../PROPS.md.
// Files: public/props/grab3d-cozy-horror/<name>.glb = palette 'ia-dark' (default); other palettes made with
// `node tools/recolor_props.mjs --palette <preset|palette.json>` land in public/props/grab3d-cozy-horror/<palette>/.
// Real-world metres (h = height). Load through glb.js (delayRender-safe): call usePreload(grabPaths([...]))
// BEFORE mounting ThreeCanvas, exactly like the Kenney/graveyard props.
import {useMemo} from 'react';
import * as THREE from 'three';
import {useGLB} from './glb.js';

export const GRAB_DIR = 'props/grab3d-cozy-horror';
export const GRAB_SIZE = {
  'barricaded-door': {h: 2.17, w: 1.183, d: 0.235},
  'boarded-window': {h: 1.615, w: 1.2, d: 0.235},
  'broken-furniture': {h: 0.801, w: 1.793, d: 1.409},
  'chains-and-hooks': {h: 1.877, w: 1.322, d: 0.278},
  'clawfoot-bathtub': {h: 0.774, w: 1.624, d: 0.774},
  'cobweb': {h: 0.953, w: 0.954, d: 0.939},
  'cracked-mirror': {h: 1.183, w: 0.745, d: 0.06},
  'creepy-puppet': {h: 0.812, w: 0.34, d: 0.43},
  'creepy-swing': {h: 2.2, w: 2.16, d: 1.42},
  'cymbal-monkey': {h: 0.32, w: 0.173, d: 0.204},
  'dress-form-mannequin': {h: 1.607, w: 0.628, d: 0.549},
  'dust-sheet-sofa': {h: 1.079, w: 2.344, d: 1.553},
  'dusty-chandelier': {h: 1.002, w: 0.775, d: 0.775},
  'film-projector': {h: 1.586, w: 0.761, d: 0.795},
  'flashlight': {h: 0.067, w: 0.268, d: 0.083},
  'fuse-box': {h: 0.95, w: 0.546, d: 0.516},
  'hanging-light-bulb': {h: 0.6, w: 0.233, d: 0.232},
  'haunted-dollhouse': {h: 0.743, w: 0.537, d: 0.417},
  'haunted-photo-wall': {h: 1.2, w: 1.5, d: 0.065},
  'hospital-gurney': {h: 1.868, w: 1.97, d: 0.752},
  'old-camcorder': {h: 0.177, w: 0.215, d: 0.339},
  'old-cradle': {h: 0.955, w: 1.032, d: 0.56},
  'old-crt-tv': {h: 0.972, w: 0.55, d: 0.633},
  'old-iron-bed': {h: 1.378, w: 1.084, d: 2.044},
  'old-key-ring': {h: 0.034, w: 0.171, d: 0.172},
  'old-pram': {h: 1.182, w: 1.162, d: 0.644},
  'old-radio': {h: 0.297, w: 0.556, d: 0.317},
  'old-sewing-machine': {h: 1.035, w: 0.92, d: 0.506},
  'old-wardrobe': {h: 2.064, w: 1.232, d: 0.743},
  'padlocked-chest': {h: 0.479, w: 0.939, d: 0.576},
  'porcelain-mask': {h: 0.244, w: 0.17, d: 0.139},
  'rusty-cage': {h: 1.958, w: 0.902, d: 0.813},
  'secret-bookcase-door': {h: 2.2, w: 1.28, d: 0.484},
  'tomb': {h: 3.285, w: 4.1, d: 4.311}
};
export const GRAB_TRIS = {'barricaded-door': 11478, 'boarded-window': 9278, 'broken-furniture': 10013, 'chains-and-hooks': 24149, 'clawfoot-bathtub': 23487, 'cobweb': 8292, 'cracked-mirror': 13113, 'creepy-puppet': 12210, 'creepy-swing': 11972, 'cymbal-monkey': 13458, 'dress-form-mannequin': 14446, 'dust-sheet-sofa': 14693, 'dusty-chandelier': 22286, 'film-projector': 14983, 'flashlight': 5088, 'fuse-box': 14905, 'hanging-light-bulb': 8033, 'haunted-dollhouse': 14028, 'haunted-photo-wall': 14660, 'hospital-gurney': 22938, 'old-camcorder': 9561, 'old-cradle': 13168, 'old-crt-tv': 14725, 'old-iron-bed': 19247, 'old-key-ring': 6144, 'old-pram': 14216, 'old-radio': 12994, 'old-sewing-machine': 14178, 'old-wardrobe': 22281, 'padlocked-chest': 12252, 'porcelain-mask': 12682, 'rusty-cage': 18762, 'secret-bookcase-door': 19763, 'tomb': 24650};
export const grabPath = (name, palette = 'ia-dark') => `${GRAB_DIR}/${palette && palette !== 'ia-dark' ? palette + '/' : ''}${name}.glb`;
export const grabPaths = (names, palette) => [...new Set(names.map((n) => grabPath(n, palette)))];
export const grabTris = (names) => names.reduce((s, n) => s + (GRAB_TRIS[n] || 0), 0);

// GrabProp: name (slug, see GRAB_SIZE / INDEX.csv), palette (folder), height (metres; overrides scale),
// glow (emissive multiplier, e.g. 0 to kill a bulb, 2 to punch it), shadows (cast+receive, default true).
export const GrabProp = ({name, palette = 'ia-dark', height, scale = 1, glow = 1, shadows = true, ...props}) => {
  if (!GRAB_SIZE[name]) console.error('GrabProp: unknown prop', name);
  const g = useGLB(grabPath(name, palette));
  const obj = useMemo(() => {
    if (!g) return null;
    const o = g.scene.clone(true);
    o.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = m.receiveShadow = shadows;
      const src = Array.isArray(m.material) ? m.material : [m.material];
      const mats = src.map((mt) => {
        // glb.js sets NearestFilter for Kenney pixel textures; these are painted 1K maps -> smooth + mipmaps
        for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) {
          const t = mt[k]; if (t && t.minFilter !== THREE.LinearMipmapLinearFilter) { t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true; }
        }
        if (glow !== 1 && mt.emissive && mt.emissive.getHex() !== 0) { const c = mt.clone(); c.emissiveIntensity = (mt.emissiveIntensity ?? 1) * glow; return c; }
        return mt;
      });
      m.material = Array.isArray(m.material) ? mats : mats[0];
    });
    return o;
  }, [g, glow, shadows]);
  const s = height ? height / (GRAB_SIZE[name]?.h || 1) : scale;
  return obj ? <primitive object={obj} scale={s} {...props} /> : null;
};
