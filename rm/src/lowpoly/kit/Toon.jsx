import * as THREE from 'three';
import {createContext, useContext, useMemo} from 'react';

/**
 * ANIMATION UPGRADE 2026-10-22. Cel/toon shading + ink outlines that work under swangle at ~zero cost.
 * toonGradient(steps): NearestFilter ramp for meshToonMaterial (3 = classic cel, 4 = softer).
 * Outlines use the inverted-hull trick (back faces of a slightly larger copy, solid ink colour). Cheap and stable for the kit's
 * convex blocky parts (boxes, icosahedra, cylinders). A screen-space normal/depth edge pass looks nicer but costs a full extra
 * render target under software GL, so it is not used.
 */
const GR = new Map();
export const toonGradient = (steps = 3) => {
  if (GR.has(steps)) return GR.get(steps);
  const d = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) { const v = Math.round(255 * (0.35 + 0.65 * (i / (steps - 1)))); d.set([v, v, v, 255], i * 4); }
  const t = new THREE.DataTexture(d, steps, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  GR.set(steps, t); return t;
};
/** <ToonMat color steps /> as a child of a mesh. */
export const ToonMat = ({color = '#ffffff', steps = 3, ...rest}) => <meshToonMaterial color={color} gradientMap={toonGradient(steps)} {...rest} />;

/** Outline scope: every kit Box (Person, Cow) inside gets an ink outline. <OutlineScope thickness={0.035}>...</OutlineScope> */
export const OutlineCtx = createContext(null);
export const OutlineScope = ({thickness = 0.035, color = '#141018', children}) => <OutlineCtx.Provider value={{thickness, color}}>{children}</OutlineCtx.Provider>;
export const useOutline = () => useContext(OutlineCtx);
const inkMat = new Map();
export const ink = (color) => { if (!inkMat.has(color)) inkMat.set(color, new THREE.MeshBasicMaterial({color, side: THREE.BackSide, fog: true})); return inkMat.get(color); };

const GEO = {
  box: (a) => new THREE.BoxGeometry(...a), ico: (a) => new THREE.IcosahedronGeometry(...a), dodeca: (a) => new THREE.DodecahedronGeometry(...a),
  cyl: (a) => new THREE.CylinderGeometry(...a), cone: (a) => new THREE.ConeGeometry(...a), sphere: (a) => new THREE.SphereGeometry(...a),
};
/**
 * Toon-shaded primitive with optional ink outline. type: box|ico|dodeca|cyl|cone|sphere, args = three.js geometry args.
 * <ToonMesh type="ico" args={[1, 0]} color="#ff5a4e" outline={0.05} position={[0, 1, 0]} />  (outline in world units, 0 = none)
 */
export const ToonMesh = ({type = 'box', args = [1, 1, 1], color = '#ffffff', outline = 0.05, outlineColor = '#141018', steps = 3, position, rotation, scale = 1, emissive}) => {
  const geo = useMemo(() => GEO[type](args), [type, ...args]);
  const size = useMemo(() => { geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s); return s; }, [geo]);
  const k = (v) => (v + 2 * outline) / Math.max(v, 1e-3);
  return <group position={position} rotation={rotation} scale={scale}>
    <mesh geometry={geo}><meshToonMaterial color={color} gradientMap={toonGradient(steps)} emissive={emissive || '#000000'} /></mesh>
    {outline > 0 && <mesh geometry={geo} material={ink(outlineColor)} scale={[k(size.x), k(size.y), k(size.z)]} />}
  </group>;
};
