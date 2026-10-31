import * as THREE from 'three';
import {useMemo} from 'react';
import {Terrain, makeHeight, Glow, Building, rng, hash2, clamp01, softTexture} from '../../kit/index.js';
import {Seg} from '../common.jsx';

export const height = makeHeight({seed: 8, amp: 0.7, freq: 0.05, oct: 2});
const sand = (y, x, z) => (hash2(Math.floor(x / 3), Math.floor(z / 3), 5) > 0.55 ? '#d6a46a' : hash2(x, z, 2) > 0.5 ? '#e0b784' : '#c99660');
export const Desert = ({tint = '#a898ea', size = 220, seg = 60, frame = 0}) => <group>
  <Terrain height={height} size={size} seg={seg} colorFn={sand} tint={tint} seed={4} />
  {Array.from({length: 11}, (_, i) => {
    const x = -140 + i * 28 + (hash2(i, 1, 2) - 0.5) * 8, h = 14 + hash2(i, 3, 4) * 20;
    return <group key={i} position={[x, h / 2 - 1, -135 - hash2(i, 8, 8) * 20]}>
      <mesh><coneGeometry args={[16 + hash2(i, 2, 9) * 8, h, 5]} /><meshLambertMaterial color={i % 2 ? '#6a4fb0' : '#5a3f9a'} flatShading /></mesh></group>;
  })}
  {/* scrub + rocks for scale / parallax */}
  {Array.from({length: 40}, (_, i) => { const x = (hash2(i, 5, 1) - 0.5) * 90, z = -30 + hash2(i, 6, 2) * 70; return <mesh key={i} position={[x, height(x, z) + 0.2, z]} rotation={[0, i, 0]} scale={[0.6 + hash2(i, 1, 1), 0.4 + hash2(i, 2, 2) * 0.6, 0.6 + hash2(i, 3, 3)]}>
    <dodecahedronGeometry args={[0.7, 0]} /><meshLambertMaterial color={i % 3 ? '#7a6a8a' : '#6a8a5a'} flatShading /></mesh>; })}
</group>;

/** Fly's Eye mirror: post + silver bowl facing the sky. flash 0..1 lights the bowl cyan. */
export const Mirror = ({position = [0, 0, 0], flash = 0, tilt = 0.6, yaw = 0, scale = 1}) => <group position={position} rotation={[0, yaw, 0]} scale={scale}>
  <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.14, 0.2, 1.4, 6]} /><meshLambertMaterial color="#8a90b0" flatShading /></mesh>
  <mesh position={[0, 0.15, 0]}><boxGeometry args={[1.0, 0.3, 1.0]} /><meshLambertMaterial color="#6a6f90" flatShading /></mesh>
  <group position={[0, 1.6, 0]} rotation={[tilt, 0, 0]}>
    <mesh position={[0, 0.9, 0]}><sphereGeometry args={[1.3, 12, 5, 0, Math.PI * 2, Math.PI - 0.95, 0.95]} />
      <meshPhongMaterial color={new THREE.Color('#dfe6ff').lerp(new THREE.Color('#7fe8ff'), flash)} emissive={new THREE.Color('#25d0ff')} emissiveIntensity={flash * 1.4} shininess={90} specular="#ffffff" flatShading side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.05, 1.32, 12]} /><meshLambertMaterial color="#4a4f70" side={THREE.DoubleSide} flatShading /></mesh>
    {flash > 0.02 && <mesh position={[0, 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.05, 12]} /><meshBasicMaterial color="#aef4ff" transparent opacity={0.8 * flash} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
    {flash > 0.02 && <Glow position={[0, 1.4, 0]} size={4.5 * (0.6 + flash)} color="#58e0ff" opacity={0.8 * flash} />}
  </group>
</group>;

export const MIRROR_POS = (() => { const out = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) out.push([(c - 2) * 4.4 + (r % 2) * 1.2, (r - 1) * 5.2]); return out; })();
/** the whole detector array. flashes: function(i)=> 0..1 */
export const FlysEye = ({frame = 0, flashFn = () => 0, tilt = 0.6, origin = [0, 0, 0]}) => <group position={origin}>
  {MIRROR_POS.map(([x, z], i) => <Mirror key={i} position={[x, height(x, z), z]} flash={flashFn(i)} yaw={Math.sin(frame * 0.012 + i) * 0.35 + (i % 3 - 1) * 0.3} tilt={tilt + Math.sin(frame * 0.02 + i * 1.7) * 0.06} />)}
  <Building position={[-13, height(-13, -3) , -3]} w={4.5} d={3} h={2.4} roof={1} color="#c9c2d8" roofColor="#6a5f9a" lit={1} frame={frame} door glow={0.8} />
</group>;

/** cosmic ray: glowing head moving from `from` to `to`; t 0..1 head position; trail length in world units */
export const Particle = ({from = [30, 90, -30], to = [0, 0, -8], t = 0, trail = 26, size = 5, color = '#ffffff', glow = '#7fe8ff', opacity = 1}) => {
  const p = (u) => from.map((v, i) => v + (to[i] - v) * u);
  const head = p(clamp01(t)); const d = new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize();
  const tail = [head[0] - d.x * trail, head[1] - d.y * trail, head[2] - d.z * trail];
  if (t <= 0) return null;
  return <group>
    <Seg a={tail} b={head} w={0.35} color={glow} opacity={0.45 * opacity} />
    <Seg a={tail.map((v, i) => v + (head[i] - v) * 0.4)} b={head} w={0.14} color={color} opacity={opacity} />
    <Glow position={head} size={size} color={glow} opacity={0.95 * opacity} />
    <Glow position={head} size={size * 0.45} color="#ffffff" opacity={opacity} />
  </group>;
};

/** air shower: cone of light + branching tracks growing from apex down to `base` (u 0..1 growth) */
export const AirShower = ({apex = [0, 40, -8], base = [0, 0, -8], u = 1, radius = 9, opacity = 1, seed = 3}) => {
  const lines = useMemo(() => { const r = rng(seed); return Array.from({length: 34}, () => ({a: r() * 6.28, rr: r(), l: 0.4 + r() * 0.6, c: r() < 0.5 ? '#9ff2ff' : r() < 0.5 ? '#ffffff' : '#b58cff'})); }, [seed]);
  if (u <= 0) return null;
  const A = new THREE.Vector3(...apex), B = new THREE.Vector3(...base); const tip = A.clone().lerp(B, clamp01(u));
  const axis = B.clone().sub(A); const L = axis.length() * clamp01(u);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize().negate());
  const mid = A.clone().add(tip).multiplyScalar(0.5);
  const r = radius * clamp01(u);
  return <group>
    <mesh position={mid.toArray()} quaternion={q}><coneGeometry args={[r, L, 10, 1, true]} /><meshBasicMaterial color="#6fdcff" transparent opacity={0.28 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} /></mesh>
    {lines.map((ln, i) => { const f = ln.l * clamp01(u); const s = A.clone().lerp(B, 0.15 + 0.3 * ln.rr * f); const e = A.clone().lerp(B, clamp01(u) * ln.l + 0.1);
      const off = new THREE.Vector3(Math.cos(ln.a), 0, Math.sin(ln.a)).multiplyScalar(radius * ln.rr * clamp01(u) * 0.9);
      return <Seg key={i} a={s.toArray()} b={e.add(off).toArray()} w={0.09} color={ln.c} opacity={0.9 * opacity} />; })}
    <Glow position={tip.toArray()} size={8 * clamp01(u)} color="#aef4ff" opacity={0.7 * opacity} />
  </group>;
};

/** baseball with stitches */
export const Baseball = ({position = [0, 0, 0], spin = 0, scale = 1}) => <group position={position} scale={scale} rotation={[spin, spin * 0.6, 0]}>
  <mesh><icosahedronGeometry args={[0.5, 1]} /><meshLambertMaterial color="#f7f3ea" flatShading /></mesh>
  {[0.52, -0.52].map((z, i) => <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0.5 * i]}><torusGeometry args={[0.36, 0.035, 5, 14, 3.4]} /><meshBasicMaterial color="#d6302a" /></mesh>)}
</group>;

/** particle accelerator ring with a proton racing round it */
export const Ring = ({position = [0, 0, 0], radius = 9, frame = 0, color = '#5a8ad6', tilt = 0.35}) => <group position={position} rotation={[tilt, 0, 0]}>
  <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.55, 8, 44]} /><meshPhongMaterial color={color} flatShading shininess={60} specular="#bfe0ff" /></mesh>
  <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.14, 5, 44]} /><meshBasicMaterial color="#9fe8ff" /></mesh>
  {[0, 1, 2, 3].map((i) => { const a = frame * 0.16 + i * 1.57; return <Glow key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} size={2.0} color="#ffffff" opacity={0.9} />; })}
  {Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4; return <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} rotation={[0, -a, 0]}><boxGeometry args={[1.6, 1.3, 1.6]} /><meshLambertMaterial color="#e0e6f5" flatShading /></mesh>; })}
</group>;

/** points galaxy: logarithmic spiral arms + bulge */
export const Galaxy = ({position = [0, 0, 0], radius = 20, rot = 0, tilt = 0.9, colorA = '#ffd9a0', colorB = '#6aa8ff', arms = 3, count = 2600, seed = 4, size = 3.2, opacity = 1}) => {
  const geo = useMemo(() => {
    const r = rng(seed); const pos = new Float32Array(count * 3), col = new Float32Array(count * 3); const A = new THREE.Color(colorA), B = new THREE.Color(colorB), c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const rr = Math.pow(r(), 0.7) * radius, arm = Math.floor(r() * arms), ang = (arm / arms) * Math.PI * 2 + rr * 0.28 + (r() - 0.5) * (0.6 + 0.8 * (1 - rr / radius));
      pos[i * 3] = Math.cos(ang) * rr; pos[i * 3 + 1] = (r() - 0.5) * 1.2 * (1 - rr / radius * 0.6); pos[i * 3 + 2] = Math.sin(ang) * rr;
      c.copy(A).lerp(B, clamp01(rr / radius * 1.1)).multiplyScalar(0.7 + r() * 0.6); col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
  }, [radius, colorA, colorB, arms, count, seed]);
  return <group position={position} rotation={[tilt, 0, 0]}><group rotation={[0, rot, 0]}>
    <points geometry={geo}><pointsMaterial vertexColors size={size} sizeAttenuation={false} transparent opacity={opacity} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
    <Glow position={[0, 0, 0]} size={radius * 0.9} color={colorA} opacity={0.55 * opacity} />
  </group></group>;
};

/** detector station grid (Telescope Array): small boxes with solar panels; lights ripple out from `hit` at time t0 */
export const Stations = ({n = 9, spacing = 4.2, frame = 0, t0 = 0, hit = [0, 0], origin = [0, 0, 0]}) => <group position={origin}>
  {Array.from({length: n * n}, (_, k) => { const i = k % n, j = Math.floor(k / n); const x = (i - (n - 1) / 2) * spacing, z = (j - (n - 1) / 2) * spacing;
    const d = Math.hypot(x - hit[0], z - hit[1]); const on = clamp01(1 - Math.abs((frame - t0) * 0.55 - d) / 3.5) * (frame >= t0 ? 1 : 0);
    const fade = frame >= t0 ? clamp01(1 - (frame - t0 - d * 1.8) / 90) : 0; const lit = Math.max(on, fade * 0.7 * (on > 0 || frame - t0 > d / 0.55 ? 1 : 0));
    return <group key={k} position={[x, height(x, z), z]}>
      <mesh position={[0, 0.35, 0]}><boxGeometry args={[0.8, 0.7, 0.8]} /><meshLambertMaterial color={new THREE.Color('#cfd6ee').lerp(new THREE.Color('#ffe98a'), lit)} emissive={new THREE.Color('#ffd23a')} emissiveIntensity={lit * 1.3} flatShading /></mesh>
      <mesh position={[0.05, 1.0, 0]} rotation={[-0.5, 0, 0]}><boxGeometry args={[1.3, 0.06, 0.9]} /><meshLambertMaterial color="#2a3f8a" flatShading /></mesh>
      {lit > 0.1 && <Glow position={[0, 0.9, 0]} size={3.2 * lit + 0.5} color="#ffe070" opacity={0.85 * lit} />}
    </group>; })}
</group>;

/** big pixel '?' made of glowing cubes */
const Q = ['01110', '10001', '00001', '00110', '00100', '00000', '00100'];
export const QMark = ({position = [0, 0, 0], frame = 0, scale = 1, color = '#ffd93b', pulse = 1}) => <group position={position} scale={scale}>
  {Q.flatMap((row, y) => row.split('').map((c, x) => c === '1' ? <mesh key={x + '_' + y} position={[(x - 2) * 1.05, (6 - y) * 1.05, Math.sin(frame * 0.1 + x + y) * 0.25 * pulse]} rotation={[frame * 0.01 * (x % 2 ? 1 : -1), 0, 0]}>
    <boxGeometry args={[0.95, 0.95, 0.95]} /><meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.55 + 0.25 * Math.sin(frame * 0.2 + x)} flatShading /></mesh> : null))}
</group>;

/** lab-coat physicist */
export const PHYS = [{skin: '#e0b48e', shirt: '#f4f6fb', pants: '#2a3350', hair: '#3a2a1a'}, {skin: '#8d5a36', shirt: '#eaf0ff', pants: '#3a2a50', hair: '#1b1310', pattern: 'stripe'}, {skin: '#d9a984', shirt: '#ffffff', pants: '#22302a', hair: '#9a9a9a'}];

/** thick translucent glass plane (the energy limit) */
export const Limit = ({position = [0, 0, 0], w = 8, h = 0.12, d = 5, color = '#ff6a6a', opacity = 0.5}) => <mesh position={position}><boxGeometry args={[w, h, d]} /><meshPhongMaterial color={color} transparent opacity={opacity} shininess={90} flatShading /></mesh>;
