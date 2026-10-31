import * as THREE from 'three';
import {useMemo} from 'react';
import {fbm, hash2} from './noise.js';

// Height function factory. shape(x,z,h) lets a story carve craters/valleys.
export const makeHeight = ({seed = 1, amp = 2.2, freq = 0.06, oct = 3, shape} = {}) => (x, z) => {
  let h = fbm(x * freq, z * freq, seed, oct) * amp;
  return shape ? shape(x, z, h) : h;
};

const DEFAULT_BANDS = [
  [-99, '#8a6a3f'], [-0.6, '#6f9a3a'], [0.8, '#5f8f34'], [2.2, '#79a843'], [4, '#8db552'], [6.5, '#a39a6a'],
];
const pick = (bands, h) => { let c = bands[0][1]; for (const [lim, col] of bands) if (h >= lim) c = col; return c; };

/**
 * Flat-shaded low-poly terrain. Each triangle gets one colour (height band + jitter),
 * vertices are jittered in x/z so the grid never looks regular.
 * props: height(x,z) fn, size, seg, bands [[minH,'#hex'],...], tint (multiply colour), jitter, center [x,z]
 */
export const Terrain = ({height, size = 140, seg = 70, bands = DEFAULT_BANDS, tint = '#ffffff', jitter = 0.35, center = [0, 0], seed = 3, colorFn}) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; const cell = size / seg;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i) + center[0], z = p.getZ(i) + center[1];
      x += (hash2(x, z, seed) - 0.5) * cell * jitter * 2; z += (hash2(z, x, seed + 9) - 0.5) * cell * jitter * 2;
      p.setXYZ(i, x, height(x, z), z);
    }
    const ng = g.toNonIndexed(); const q = ng.attributes.position; const cols = new Float32Array(q.count * 3);
    const c = new THREE.Color(), t = new THREE.Color(tint);
    for (let i = 0; i < q.count; i += 3) {
      const cx = (q.getX(i) + q.getX(i + 1) + q.getX(i + 2)) / 3, cz = (q.getZ(i) + q.getZ(i + 1) + q.getZ(i + 2)) / 3;
      const cy = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3;
      c.set(colorFn ? colorFn(cy, cx, cz) : pick(bands, cy));
      const j = 0.9 + hash2(cx, cz, seed + 4) * 0.2; c.multiplyScalar(j).multiply(t);
      for (let k = 0; k < 3; k++) { cols[(i + k) * 3] = c.r; cols[(i + k) * 3 + 1] = c.g; cols[(i + k) * 3 + 2] = c.b; }
    }
    ng.setAttribute('color', new THREE.BufferAttribute(cols, 3)); ng.computeVertexNormals();
    return ng;
  }, [height, size, seg, tint, jitter, seed, center[0], center[1]]);
  return <mesh geometry={geo}><meshLambertMaterial vertexColors flatShading /></mesh>;
};
