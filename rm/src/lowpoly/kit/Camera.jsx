import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import {easeInOut, clamp01} from './noise.js';

/**
 * ANIMATION UPGRADE 2026-10-22. Cinematic camera presets (drop-in alternative to <CameraRig>). All frame-driven, eased.
 * ease: 'inout' (cubic, default) | 'ramp' (speed ramp: slow -> FAST -> slow, expo) | 'out' (fast start, soft landing) | 'linear'.
 * preset:
 *  'push'      slow push-in: from -> to positions, look at target; fov0 -> fov1 (narrow a little for tension).
 *  'crane'     crane-up reveal: rises from h0 (low, behind foreground) to h1 while pulling back r0 -> r1 around target at angle `angle`.
 *  'orbit'     orbit reveal: angle a0 -> a1 (rad) around target, radius r0 -> r1, height h0 -> h1.
 *  'dollyZoom' Vertigo: camera travels d0 -> d1 along `dir` from target while fov compensates so the subject keeps its size
 *              (background stretches/compresses). Use on the "realisation" beat.
 *  'whip'      whip pan: camera at `from`, look swings lookA -> lookB between frames w0..w1 (speed-ramped). Pair with <WhipStreaks/> or <MotionBlurWindow/>.
 *  'track'     side tracking shot: camera slides from -> to keeping a fixed offset to a moving target (pass target as fn f => [x,y,z]).
 * start/end = frames (local to the Sequence). shake/shakeFrom/shakeLen as CameraRig. drift = handheld drift (0 to lock off).
 * <ShotCam preset="crane" target={[0, 2, 0]} h0={1} h1={14} r0={8} r1={22} angle={0.6} start={0} end={90} ease="inout" />
 */
const E = {inout: easeInOut, linear: (t) => t, in: (t) => t * t * t, out: (t) => 1 - Math.pow(1 - t, 3),
  ramp: (t) => (t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2)};
const L = (a, b, t) => a + (b - a) * t; const LV = (a, b, t) => a.map((x, i) => L(x, b[i], t));
export const shotPose = (o, f) => {
  const {preset = 'push', start = 0, end = 90, ease = 'inout'} = o;
  const t = E[ease](clamp01((f - start) / Math.max(1, end - start)));
  const tg = typeof o.target === 'function' ? o.target(f) : (o.target || [0, 0, 0]);
  if (preset === 'push') return {pos: LV(o.from, o.to, t), look: o.look ? LV(o.look[0], o.look[1], t) : tg, fov: L(o.fov0 ?? 45, o.fov1 ?? 40, t)};
  if (preset === 'crane') { const a = o.angle ?? 0, r = L(o.r0 ?? 8, o.r1 ?? 20, t), h = L(o.h0 ?? 1, o.h1 ?? 12, t);
    return {pos: [tg[0] + Math.sin(a) * r, tg[1] + h, tg[2] + Math.cos(a) * r], look: [tg[0], tg[1] + L(o.lookY0 ?? 1.5, o.lookY1 ?? 0, t), tg[2]], fov: L(o.fov0 ?? 50, o.fov1 ?? 45, t)}; }
  if (preset === 'orbit') { const a = L(o.a0 ?? 0, o.a1 ?? 1, t), r = L(o.r0 ?? 15, o.r1 ?? 12, t), h = L(o.h0 ?? 6, o.h1 ?? 8, t);
    return {pos: [tg[0] + Math.sin(a) * r, tg[1] + h, tg[2] + Math.cos(a) * r], look: tg, fov: L(o.fov0 ?? 45, o.fov1 ?? 45, t)}; }
  if (preset === 'dollyZoom') { const d = L(o.d0 ?? 6, o.d1 ?? 16, t); const dir = o.dir || [0, 0.15, 1]; const n = Math.hypot(...dir);
    const fov0 = o.fov0 ?? 60; const fov = 2 * Math.atan((o.d0 ?? 6) * Math.tan((fov0 * Math.PI / 180) / 2) / d) * 180 / Math.PI;
    return {pos: [tg[0] + dir[0] / n * d, tg[1] + dir[1] / n * d, tg[2] + dir[2] / n * d], look: tg, fov}; }
  if (preset === 'whip') { const w = E.ramp(clamp01((f - (o.w0 ?? 20)) / Math.max(1, (o.w1 ?? 30) - (o.w0 ?? 20))));
    const pre = clamp01(f / Math.max(1, o.w0 ?? 20)) * 0.08; return {pos: o.from, look: LV(o.lookA, o.lookB, Math.min(1, w + pre * (1 - w))), fov: o.fov0 ?? 45}; }
  if (preset === 'track') { const off = o.offset || [6, 3, 6]; const p = LV(o.from || tg, o.to || tg, t); return {pos: [p[0] + off[0], p[1] + off[1], p[2] + off[2]], look: tg, fov: o.fov0 ?? 45}; }
  throw new Error('ShotCam: unknown preset ' + preset);
};
export const ShotCam = ({shake = 0, shakeFrom = 0, shakeLen = 18, drift = 0.12, ...o}) => {
  const {camera} = useThree(); const f = useCurrentFrame();
  let {pos, look, fov} = shotPose(o, f);
  if (shake && f >= shakeFrom && f < shakeFrom + shakeLen) { const k = shake * Math.pow(1 - (f - shakeFrom) / shakeLen, 2); pos = [pos[0] + Math.sin(f * 2.3) * k, pos[1] + Math.cos(f * 3.1) * k, pos[2] + Math.sin(f * 1.7) * k * 0.5]; }
  if (drift) pos = [pos[0] + Math.sin(f * 0.031) * drift + Math.sin(f * 0.077) * drift * 0.4, pos[1] + Math.sin(f * 0.043 + 1) * drift * 0.6, pos[2] + Math.cos(f * 0.027) * drift];
  camera.position.set(...pos); camera.fov = fov; camera.near = 0.3; camera.far = 600; camera.updateProjectionMatrix(); camera.lookAt(...look);
  return null;
};
