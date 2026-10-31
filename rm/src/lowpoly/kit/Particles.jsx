import * as THREE from 'three';
import {useMemo} from 'react';
import {rng, clamp01, easeOut} from './noise.js';

/**
 * ANIMATION UPGRADE 2026-10-22. Deterministic particle systems on ONE InstancedMesh each (one draw call, 100s of particles,
 * frame-driven: frame N always looks the same). Positions are written during render (same pattern as Water), never with a clock.
 */
const _o = new THREE.Object3D(); const _c = new THREE.Color();
const useInst = (count, kind, additive, color, opacity, lit, fog = true) => useMemo(() => {
  const geo = kind === 'streak' ? new THREE.BoxGeometry(1, 1, 1) : kind === 'chunk' ? new THREE.DodecahedronGeometry(1, 0) : new THREE.IcosahedronGeometry(1, 0);
  const mat = lit ? new THREE.MeshLambertMaterial({color: '#ffffff', flatShading: true, transparent: opacity < 1, opacity})
    : new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: fog && !additive, toneMapped: false});
  const m = new THREE.InstancedMesh(geo, mat, count); m.frustumCulled = false;
  for (let i = 0; i < count; i++) m.setColorAt(i, _c.set(color));
  return m;
}, [count, kind, additive, color, opacity, lit]);
const set = (m, i, x, y, z, s, rx = 0, ry = 0, rz = 0, sy) => { _o.position.set(x, y, z); _o.rotation.set(rx, ry, rz); if (sy !== undefined) _o.scale.set(s, sy, s); else _o.scale.setScalar(s); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix); };

// presets: motion model + look. vy = rise (+) / fall (-) in units per frame at speed 1.
const KINDS = {
  embers: {color: '#ffb347', size: 0.09, vy: 0.05, sway: 0.5, additive: true, flicker: true, life: 1, opacity: 1},
  sparks: {color: '#ffe08a', size: 0.06, vy: 0.12, sway: 0.2, additive: true, flicker: true, streak: true, opacity: 1},
  dust:   {color: '#fff2d0', size: 0.05, vy: 0.004, sway: 1.2, additive: true, flicker: false, opacity: 0.6},
  snow:   {color: '#ffffff', size: 0.07, vy: -0.035, sway: 0.9, additive: false, opacity: 0.95},
  ash:    {color: '#6d6a66', size: 0.06, vy: -0.015, sway: 1.4, additive: false, opacity: 0.9, tumble: true},
  spray:  {color: '#eaf8ff', size: 0.08, vy: -0.02, sway: 2.0, additive: false, opacity: 0.85},
  motes:  {color: '#bff4ff', size: 0.07, vy: 0.008, sway: 1.0, additive: true, flicker: true, opacity: 0.8},
};
/**
 * Ambient particles filling a box. kind: embers | sparks | dust | snow | ash | spray | motes. area = [w, h, d] around center
 * (particles wrap vertically so the box never empties). wind = [x, z] drift per frame. size/color/opacity override the preset.
 * <Particles kind="embers" center={[0, 0.5, 0]} area={[3, 6, 3]} count={70} frame={f} />  (embers rising from a fire)
 */
export const Particles = ({kind = 'dust', count = 120, center = [0, 0, 0], area = [20, 8, 20], frame = 0, seed = 1, color, size, speed = 1, wind = [0, 0], opacity}) => {
  const K = KINDS[kind] || KINDS.dust;
  const col = color || K.color, op = opacity ?? K.opacity, sz = size ?? K.size;
  const m = useInst(count, K.streak ? 'streak' : 'ico', K.additive, col, op, false);
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: r() - 0.5, y: r(), z: r() - 0.5, ph: r() * 6.28, s: 0.5 + r(), v: 0.6 + r() * 0.8})); }, [count, seed]);
  const H = area[1];
  ps.forEach((p, i) => {
    const prog = p.y * H + frame * K.vy * speed * p.v; const y = ((prog % H) + H) % H; // wraps
    const life = y / H; // 0 bottom .. 1 top
    const fadeEnds = Math.sin(Math.PI * clamp01(K.vy >= 0 ? life : 1 - life)) ** 0.5;
    const sw = K.sway * 0.35;
    const x = center[0] + p.x * area[0] + Math.sin(frame * 0.03 * p.v + p.ph) * sw + wind[0] * frame;
    const z = center[2] + p.z * area[2] + Math.cos(frame * 0.025 * p.v + p.ph) * sw + wind[1] * frame;
    const fl = K.flicker ? 0.55 + 0.45 * Math.sin(frame * 0.5 * p.v + p.ph * 3) : 1;
    const shrink = kind === 'embers' || kind === 'sparks' ? 1 - life * 0.7 : 1;
    const s = sz * p.s * fl * fadeEnds * shrink;
    if (K.streak) set(m, i, x, center[1] + y, z, s * 0.6, 0, 0, Math.sin(p.ph) * 0.3, s * 6);
    else set(m, i, x, center[1] + y, z, s, K.tumble ? frame * 0.1 + p.ph : 0, p.ph, 0);
  });
  m.instanceMatrix.needsUpdate = true;
  return <primitive object={m} />;
};

/**
 * One-shot ballistic burst from a point, starting at frame `start` (local frame). kind: sparks (glowing streaks) | debris (lit rock
 * chunks, tumble, bounce on floorY) | splash (white droplets) | embers. speed = launch speed (units/frame), up = upward bias 0..1,
 * spread = cone half-angle (rad, PI = all directions), gravity per frame^2, life in frames.
 * <Burst kind="debris" position={[0, 1, 0]} start={30} frame={f} count={40} color="#6d625a" />
 */
export const Burst = ({kind = 'sparks', position = [0, 0, 0], start = 0, frame = 0, count = 60, speed = 0.35, up = 0.6, spread = 1.2, gravity = 0.012, life = 45, size, color, seed = 3, floorY, dir = [0, 1, 0]}) => {
  const conf = {sparks: {c: '#ffd36a', s: 0.07, add: true, lit: false, g: 'streak'}, debris: {c: '#6d625a', s: 0.22, add: false, lit: true, g: 'chunk'},
    splash: {c: '#f2fbff', s: 0.16, add: false, lit: false, g: 'ico'}, embers: {c: '#ff9a3a', s: 0.1, add: true, lit: false, g: 'ico'}, dust: {c: '#d8c090', s: 0.18, add: false, lit: true, g: 'chunk'}}[kind] || {c: '#d8c090', s: 0.18, add: false, lit: true, g: 'chunk'}; // unknown kind no longer crashes
  const m = useInst(count, conf.g, conf.add, color || conf.c, 1, conf.lit);
  const ps = useMemo(() => {
    const r = rng(seed); const d = new THREE.Vector3(...dir).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    return Array.from({length: count}, () => {
      const th = r() * Math.PI * 2, ph = Math.acos(1 - r() * (1 - Math.cos(spread)));
      const v = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)).applyQuaternion(q).multiplyScalar(speed * (0.4 + r() * 0.9));
      v.y += up * speed * 0.5 * r(); return {v, s: 0.5 + r(), sp: (r() - 0.5) * 0.4, l: life * (0.6 + r() * 0.6)};
    });
  }, [count, seed, speed, up, spread, life, dir[0], dir[1], dir[2]]);
  const t = frame - start; const sz = size ?? conf.s;
  ps.forEach((p, i) => {
    if (t < 0 || t > p.l) { set(m, i, 0, -999, 0, 0.0001); return; }
    let x = position[0] + p.v.x * t, y = position[1] + p.v.y * t - 0.5 * gravity * t * t, z = position[2] + p.v.z * t;
    if (floorY !== undefined && y < floorY) y = floorY + Math.abs(Math.sin((y - floorY) * 2)) * 0.1; // settle
    const k = 1 - t / p.l; const s = sz * p.s * (kind === 'debris' ? 1 : Math.max(0.15, k));
    if (conf.g === 'streak') { const vy = p.v.y - gravity * t; const ang = Math.atan2(p.v.x, vy); set(m, i, x, y, z, s * 0.7, Math.atan2(p.v.z, vy) * 0.8, 0, -ang, s * 7 * k + s); }
    else set(m, i, x, y, z, s, p.sp * t, p.sp * t * 1.3, 0);
  });
  m.instanceMatrix.needsUpdate = true;
  return <primitive object={m} />;
};

/**
 * Impact shockwave: three expanding rings (wide + faint, medium, thin + bright), flat on the ground (or vertical=true facing +z).
 * <Shockwave position={[0, 0.1, 0]} start={30} frame={f} radius={8} color="#ffe2a0" />
 */
export const Shockwave = ({position = [0, 0, 0], start = 0, frame = 0, radius = 6, life = 22, color = '#fff1c8', vertical = false}) => {
  const t = (frame - start) / life; if (t < 0 || t > 1) return null;
  const rings = [[1.0, 0.18, 0.25], [0.82, 0.08, 0.5], [0.66, 0.025, 0.95]]; // [radius scale, width, opacity]
  return <group position={position} rotation={vertical ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}>
    {rings.map(([rs, w, o], i) => { const R = radius * rs * easeOut(t) + 0.01; return <mesh key={i}><ringGeometry args={[Math.max(0.001, R * (1 - w)), R, 48]} />
      <meshBasicMaterial color={color} transparent opacity={o * (1 - t) ** 1.5} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} fog={false} /></mesh>; })}
  </group>;
};
