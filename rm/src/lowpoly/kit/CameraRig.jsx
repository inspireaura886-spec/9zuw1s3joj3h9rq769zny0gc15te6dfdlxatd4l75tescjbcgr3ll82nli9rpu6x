import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import {easeInOut} from './noise.js';

/**
 * Keyframed camera. keys: [{f, pos:[x,y,z], look:[x,y,z], fov?}] in frames relative to the enclosing Sequence.
 * Eased (cubic in-out) between keys. orbit: optional {center, radius, height, from, to (radians)} overrides pos.
 * shake: amplitude (world units) for impact beats.
 */
export const CameraRig = ({keys, orbit, shake: _shake = 0, shakeFrom = 0, shakeLen = 20, drift: _drift = 0}) => {
  const shake = 0, drift = 0; // USER 2026-11-02: never shake or drift the frame (smooth eased moves only)
  const {camera} = useThree(); const f = useCurrentFrame();
  let pos, look, fov;
  if (orbit) {
    const {center = [0, 0, 0], radius = 30, height = 15, from = 0, to = 0.6, start = 0, end = 150, lookY = 0} = orbit;
    const t = easeInOut(Math.min(1, Math.max(0, (f - start) / (end - start)))); const a = from + (to - from) * t;
    pos = [center[0] + Math.sin(a) * radius, center[1] + height, center[2] + Math.cos(a) * radius]; look = [center[0], center[1] + lookY, center[2]];
    fov = orbit.fov || 50;
  } else {
    let i = 0; while (i < keys.length - 2 && f > keys[i + 1].f) i++;
    const A = keys[i], B = keys[Math.min(i + 1, keys.length - 1)];
    const t = B.f === A.f ? 1 : easeInOut(Math.min(1, Math.max(0, (f - A.f) / (B.f - A.f))));
    const L = (a, b) => a.map((x, k) => x + (b[k] - x) * t);
    pos = L(A.pos, B.pos); look = L(A.look, B.look); fov = (A.fov || 50) + ((B.fov || 50) - (A.fov || 50)) * t;
  }
  if (shake && f >= shakeFrom && f < shakeFrom + shakeLen) {
    const k = shake * (1 - (f - shakeFrom) / shakeLen);
    pos = [pos[0] + Math.sin(f * 2.3) * k, pos[1] + Math.cos(f * 3.1) * k, pos[2]];
  }
  // v2: always-on gentle handheld drift so no shot is ever static
  if (drift) pos = [pos[0] + Math.sin(f * 0.031) * drift + Math.sin(f * 0.077) * drift * 0.4, pos[1] + Math.sin(f * 0.043 + 1) * drift * 0.6, pos[2] + Math.cos(f * 0.027) * drift];
  camera.position.set(...pos); camera.fov = fov; camera.near = 0.3; camera.far = 600; camera.updateProjectionMatrix(); camera.lookAt(...look);
  return null;
};
