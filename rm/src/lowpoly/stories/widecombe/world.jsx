import * as THREE from 'three';
import {Terrain, makeHeight, Glow, Building, Person, Tree, rng, hash2, clamp01, smoothstep} from '../../kit/index.js';
import {Seg} from '../common.jsx';

const base = makeHeight({seed: 5, amp: 7, freq: 0.03, oct: 3});
export const height = (x, z) => base(x, z) * smoothstep(14, 40, Math.hypot(x, z)) + 0.0;
const BANDS = [[-99, '#6f8f3a'], [0.5, '#7fa23f'], [2, '#92a24c'], [4, '#a89650'], [6, '#8e6e92']];
export const Moor = ({tint = '#ffffff', size = 200, seg = 56, frame = 0}) => <group>
  <Terrain height={height} size={size} seg={seg} bands={BANDS} tint={tint} seed={6} />
  {/* granite tors + heather clumps */}
  {Array.from({length: 22}, (_, i) => { const a = i * 2.4, r = 38 + hash2(i, 1, 1) * 50, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8 - 10;
    return <group key={i} position={[x, height(x, z), z]}>{[0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * 1.8, 1.0 + k * 0.5, hash2(i, k, 4)]} rotation={[0.3 * k, i + k, 0]} scale={[2.2 - k * 0.4, 1.6, 2]}><dodecahedronGeometry args={[1.5, 0]} /><meshLambertMaterial color={k % 2 ? '#9a968c' : '#847f78'} flatShading /></mesh>)}</group>; })}
  {Array.from({length: 26}, (_, i) => { const x = (hash2(i, 7, 1) - 0.5) * 120, z = (hash2(i, 8, 2) - 0.5) * 100 - 8; if (Math.hypot(x, z) < 18) return null;
    return <Tree key={i} position={[x, height(x, z), z]} s={1.2 + hash2(i, 3, 3)} kind={i % 3 ? 'round' : 'pine'} color={i % 2 ? '#4a7a2e' : '#5a8a34'} seed={i} frame={frame} wind={2} />; })}
</group>;

/** St Pancras: nave (ridge along X) + west tower with 4 pinnacles. glow lights the south window; pinFall 0..1 topples the NE pinnacle. */
export const Church = ({frame = 0, glow = 0, pinFall = 0, lit = 0.5}) => {
  const fl = 0.85 + 0.15 * Math.sin(frame * 0.7);
  const P = [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]];
  return <group>
    <Building position={[0, 0, 0]} w={14} d={7} h={5} roof={2.8} color="#b0aa9c" roofColor="#4d5568" lit={lit} litSeed={4} door={false} frame={frame} glow={0.6} />
    <mesh position={[-8.2, 6.5, 0]}><boxGeometry args={[3.6, 13, 3.6]} /><meshLambertMaterial color="#a39d90" flatShading /></mesh>
    <mesh position={[-8.2, 13.2, 0]}><boxGeometry args={[4.0, 0.5, 4.0]} /><meshLambertMaterial color="#8c867a" flatShading /></mesh>
    {P.map(([px, pz], i) => { const fall = i === 1 ? pinFall : 0; return <group key={i} position={[-8.2 + px * 1.1 + fall * 3.2, 13.9 - fall * fall * 11, pz * 1.1]} rotation={[fall * 2.0, 0, -fall * 2.4]}>
      <mesh><boxGeometry args={[0.6, 0.9, 0.6]} /><meshLambertMaterial color="#9a9488" flatShading /></mesh><mesh position={[0, 0.9, 0]}><coneGeometry args={[0.5, 1.3, 4]} /><meshLambertMaterial color="#8a8478" flatShading /></mesh></group>; })}
    {[0, 1].map((k) => <mesh key={k} position={[-8.2, 8 + k * 3.2, 1.83]}><planeGeometry args={[0.7, 1.4]} /><meshLambertMaterial color="#222c3a" /></mesh>)}
    <mesh position={[3.0, 2.0, 3.53]}><planeGeometry args={[1.5, 2.6]} /><meshBasicMaterial color={new THREE.Color('#ffb030').multiplyScalar(0.25 + glow * fl * 0.9)} /></mesh>
    {glow > 0.05 && <Glow position={[3.0, 2.2, 4.2]} size={6.5 * glow * fl} color="#ff8a2a" opacity={0.7} />}
    <mesh position={[-3.5, 1.1, 3.55]}><planeGeometry args={[1.3, 2.2]} /><meshLambertMaterial color="#4a2f1a" /></mesh>
  </group>;
};

export const Village = ({frame = 0}) => <group>
  {[[-22, 8, 0.5], [-26, 18, -0.4], [16, 14, 2.4], [24, 6, 3.6], [-14, 26, 0.9], [30, 20, -0.2]].map(([x, z, r], i) => <Building key={i} position={[x, height(x, z), z]} rotation={r} w={4} d={3.2} h={2.6} roof={1.6} color={i % 2 ? '#d8c9a4' : '#c9b48a'} roofColor={i % 2 ? '#a8864a' : '#8a6a38'} lit={0.8} litSeed={i} frame={frame} />)}
</group>;

/** fireball: layered glowing icosahedra + halo + sparks + warm point light */
export const Fireball = ({position = [0, 0, 0], r = 1, frame = 0, light = true, k = 1, seed = 1}) => {
  const fl = 0.92 + 0.08 * Math.sin(frame * 0.9 + seed) + 0.04 * Math.sin(frame * 2.1);
  return <group position={position} scale={r * fl * k}>
    <mesh rotation={[frame * 0.05, frame * 0.07, 0]}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color="#ff9a2e" /></mesh>
    <mesh rotation={[frame * -0.06, frame * 0.05, 0]}><icosahedronGeometry args={[0.72, 0]} /><meshBasicMaterial color="#ffe9a0" /></mesh>
    <mesh rotation={[frame * 0.04, 0, frame * 0.08]}><icosahedronGeometry args={[1.25, 0]} /><meshBasicMaterial color="#ff5a1a" wireframe transparent opacity={0.7} /></mesh>
    <Glow position={[0, 0, 0]} size={7} color="#ff7a20" opacity={0.85 * k} /><Glow position={[0, 0, 0]} size={3.4} color="#fff0b0" opacity={0.95 * k} />
    {Array.from({length: 7}, (_, i) => { const a = i * 0.9 + frame * 0.05 * (i % 2 ? 1 : -1), b = i * 1.7; return <Seg key={i} a={[Math.cos(a) * 1.1, Math.sin(b) * 0.9, Math.sin(a) * 1.1]} b={[Math.cos(a) * (1.9 + 0.4 * Math.sin(frame * 0.7 + i)), Math.sin(b) * 1.6, Math.sin(a) * (1.9 + 0.4 * Math.sin(frame * 0.7 + i))]} w={0.05} color="#ffd070" opacity={0.9} />; })}
    {light && <pointLight color="#ff8a30" intensity={24 * k} distance={22} decay={1.5} />}
  </group>;
};

export const Bolt = ({from = [0, 40, 0], to = [0, 0, 0], seed = 1, t = 1, opacity = 1, w = 0.16, n = 9}) => {
  const r = rng(seed); const pts = [from]; for (let i = 1; i < n; i++) { const u = i / n; pts.push(from.map((v, k) => v + (to[k] - v) * u + (k === 1 ? 0 : (r() - 0.5) * 5 * (1 - u * 0.4)))); } pts.push(to);
  const m = Math.floor(clamp01(t) * (pts.length - 1));
  return <group>{pts.slice(0, m).map((p, i) => <group key={i}><Seg a={p} b={pts[i + 1]} w={w * 3.2} color="#9fb8ff" opacity={0.35 * opacity} /><Seg a={p} b={pts[i + 1]} w={w} color="#ffffff" opacity={opacity} /></group>)}</group>;
};

/** dark rolling thunderhead */
export const StormMass = ({frame = 0, y = 34, color = '#2c3a3a', speed = 0.05, count = 26, area = 120, z0 = -10, seed = 3}) => {
  const r = rng(seed); const cs = Array.from({length: count}, () => ({x: (r() - 0.5) * area, z: (r() - 0.5) * area * 0.8 + z0, y: y + r() * 10, s: 7 + r() * 8, ph: r()}));
  return <group>{cs.map((c, i) => { const x = ((c.x + frame * speed * (0.6 + c.ph) + area / 2) % area + area) % area - area / 2;
    return <mesh key={i} position={[x, c.y + Math.sin(frame * 0.02 + i) * 0.6, c.z]} rotation={[frame * 0.002 * (i % 2 ? 1 : -1), i, 0]} scale={[c.s, c.s * 0.55, c.s]}>
      <icosahedronGeometry args={[1, 1]} /><meshLambertMaterial color={i % 3 ? color : '#3a4a44'} flatShading fog={false} /></mesh>; })}</group>;
};

const LOOKS = [{shirt: '#4a3a2a', pants: '#2a2420', skin: '#e0b48e', hair: '#3a2a1a'}, {shirt: '#2a3a4a', pants: '#26242a', skin: '#d9a984', hair: '#1b1310'}, {shirt: '#5a2f2a', pants: '#2a2420', skin: '#e6b892', hair: '#7a3d1e'}, {shirt: '#3a4a2f', pants: '#2c2a22', skin: '#c8966e', hair: '#2a1d16'}, {shirt: '#8a8478', pants: '#3a3226', skin: '#e0b48e', hair: '#9a9a9a'}, {shirt: '#6a4a6a', pants: '#2a2630', skin: '#dcae88', hair: '#141010'}];
export const LOOK = (i) => LOOKS[i % LOOKS.length];

/** nave interior along Z (altar at -z). dark 0..1 dims; win = window colour. */
export const Interior = ({frame = 0, expr = 'open', scared = 0, winGlow = 0, people = true, rows = 8, dark = 1}) => {
  const fl = 0.85 + 0.15 * Math.sin(frame * 0.8);
  return <group>
    <mesh position={[0, -0.2, 0]}><boxGeometry args={[9, 0.4, 17]} /><meshLambertMaterial color="#8a7660" flatShading /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 4.3, 3, 0]}><boxGeometry args={[0.5, 6.2, 17]} /><meshLambertMaterial color="#a69f90" flatShading /></mesh>)}
    <mesh position={[0, 3, -8.4]}><boxGeometry args={[9, 6.2, 0.5]} /><meshLambertMaterial color="#9a9486" flatShading /></mesh>
    <mesh position={[0, 3, 8.4]}><boxGeometry args={[9, 6.2, 0.5]} /><meshLambertMaterial color="#9a9486" flatShading /></mesh>
    <mesh position={[0, 6.1, 0]}><boxGeometry args={[9, 0.3, 17]} /><meshLambertMaterial color="#5a3a22" flatShading /></mesh>
    {[-6, -3, 0, 3, 6].map((z) => <mesh key={z} position={[0, 5.7, z]}><boxGeometry args={[9, 0.45, 0.4]} /><meshLambertMaterial color="#3a2414" flatShading /></mesh>)}
    {[-1, 1].map((s) => [-5.5, -1.8, 1.9, 5.6].map((z, i) => <group key={s + '' + i}><mesh position={[s * 4.02, 3.2, z]} rotation={[0, -s * Math.PI / 2, 0]}><planeGeometry args={[1.3, 2.4]} />
      <meshBasicMaterial color={new THREE.Color('#9ab8c8').lerp(new THREE.Color('#ff9a30'), winGlow).multiplyScalar((0.75 + winGlow * 0.3) * dark)} /></mesh>
      <mesh position={[s * 4.03, 3.2, z]} rotation={[0, -s * Math.PI / 2, 0]}><planeGeometry args={[0.1, 2.4]} /><meshLambertMaterial color="#2a2a30" /></mesh></group>))}
    {/* altar + cross + pulpit */}
    <mesh position={[0, 0.55, -7.4]}><boxGeometry args={[3, 1.1, 1]} /><meshLambertMaterial color="#b89a6a" flatShading /></mesh>
    <mesh position={[0, 2.0, -7.9]}><boxGeometry args={[0.25, 2.2, 0.2]} /><meshLambertMaterial color="#e8c860" /></mesh><mesh position={[0, 2.5, -7.9]}><boxGeometry args={[1.2, 0.25, 0.2]} /><meshLambertMaterial color="#e8c860" /></mesh>
    <mesh position={[-2.9, 1.0, -5.2]}><boxGeometry args={[1.2, 2.0, 1.2]} /><meshLambertMaterial color="#6a4528" flatShading /></mesh>
    {/* pews + people facing the altar */}
    {Array.from({length: rows}, (_, k) => { const z = -4.8 + k * 1.55; return [-1, 1].map((s) => <group key={k + '_' + s}>
      <mesh position={[s * 2.0, 0.45, z + 0.55]}><boxGeometry args={[3.1, 0.9, 0.22]} /><meshLambertMaterial color="#6a4528" flatShading /></mesh>
      <mesh position={[s * 2.0, 0.3, z]}><boxGeometry args={[3.1, 0.12, 0.5]} /><meshLambertMaterial color="#7a5232" flatShading /></mesh>
      {people && [-0.95, 0, 0.95].map((dx, j) => { const lk = LOOK(k * 5 + j * 2 + (s > 0 ? 1 : 0)); return <Person key={j} position={[s * 2.0 + dx, 0.06, z - 0.05]} rotation={Math.PI} scale={0.66} pose="stand" phase={frame / 14 + k + j} expr={scared > 0.5 && (k + j) % 2 ? 'o' : expr} {...lk} />; })}
    </group>); })}
    {[[-3.4, 7.0], [3.4, 7.0], [-3.4, -6.4], [3.4, -6.4]].map(([x, z], i) => <group key={i}><mesh position={[x, 0.9, z]}><cylinderGeometry args={[0.08, 0.1, 1.8, 5]} /><meshLambertMaterial color="#d8cfa8" /></mesh><Glow position={[x, 2.0, z]} size={2.4 * (0.8 + 0.2 * Math.sin(frame * 0.5 + i))} color="#ffc060" opacity={0.85} /></group>)}
  </group>;
};

/** horned red devil (legend) */
export const Devil = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0}) => <group position={position} rotation={[0, rotation, 0]} scale={scale}>
  <Person position={[0, 0, 0]} scale={1} pose="stand" phase={frame / 8} wave={frame % 50 < 25} shirt="#7a0e12" pants="#2a0a0a" skin="#d0382c" hair="#1a0a0a" eye="#ffe040" expr="o" />
  {[-1, 1].map((s) => <mesh key={s} position={[s * 0.22, 2.2, 0]} rotation={[0, 0, -s * 0.35]}><coneGeometry args={[0.1, 0.55, 5]} /><meshLambertMaterial color="#3a0a0a" flatShading /></mesh>)}
  <group position={[0.7, 1.0, 0.25]} rotation={[0, 0, -0.15]}><mesh><boxGeometry args={[0.07, 3.0, 0.07]} /><meshLambertMaterial color="#3a2a1a" /></mesh>
    {[-0.2, 0, 0.2].map((x, i) => <mesh key={i} position={[x, 1.7, 0]}><boxGeometry args={[0.06, 0.5, 0.06]} /><meshBasicMaterial color="#ff8a3a" /></mesh>)}</group>
  <mesh position={[0, 1.2, -0.25]} rotation={[0.15, 0, 0]}><boxGeometry args={[0.9, 1.5, 0.06]} /><meshLambertMaterial color="#2a0608" flatShading /></mesh>
  <Glow position={[0, 1.2, 0]} size={4} color="#ff3a20" opacity={0.5} />
</group>;

/** lab with a Tesla coil making little orbs */
export const Lab = ({frame = 0}) => {
  const arcs = Array.from({length: 5}, (_, i) => { const a = hash2(Math.floor(frame / 3), i, 9) * 6.28, r = 1.2 + hash2(Math.floor(frame / 3), i, 2) * 1.8; return [[0, 3.4, 0], [Math.cos(a) * r * 0.5, 3.8 + hash2(i, frame, 3), Math.sin(a) * r * 0.5], [Math.cos(a) * r, 2.2 + hash2(i, frame, 5) * 1.4, Math.sin(a) * r]]; });
  const oc = (frame % 70) / 70;
  return <group>
    <mesh position={[0, -0.25, 0]}><boxGeometry args={[18, 0.5, 18]} /><meshLambertMaterial color="#7f86a0" flatShading /></mesh>
    <mesh position={[0, 0.9, -7]}><boxGeometry args={[14, 4.6, 0.4]} /><meshLambertMaterial color="#2f4a3a" flatShading /></mesh>
    {[[-3, 1.6], [0, 2.4], [3, 1.4]].map(([x, y], i) => <group key={i}><mesh position={[x, 2.2 + y * 0.2, -6.75]}><boxGeometry args={[2.2, 0.12, 0.05]} /><meshBasicMaterial color="#f2f2e8" /></mesh>
      <mesh position={[x + 0.3, 2.8 + y * 0.2, -6.75]} rotation={[0, 0, 0.6]}><boxGeometry args={[1.6, 0.1, 0.05]} /><meshBasicMaterial color="#e8e8d8" /></mesh>
      <mesh position={[x, 1.4, -6.75]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.9, 0.12, 0.05]} /><meshBasicMaterial color="#ff5a4a" /></mesh><mesh position={[x, 1.4, -6.75]} rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[0.9, 0.12, 0.05]} /><meshBasicMaterial color="#ff5a4a" /></mesh></group>)}
    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[1.0, 1.3, 1.0, 8]} /><meshLambertMaterial color="#5a5f78" flatShading /></mesh>
    <mesh position={[0, 2.0, 0]}><cylinderGeometry args={[0.35, 0.6, 2.2, 8]} /><meshPhongMaterial color="#c47a3a" flatShading shininess={60} /></mesh>
    <mesh position={[0, 3.3, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.9, 0.3, 6, 14]} /><meshPhongMaterial color="#d6d9e8" flatShading shininess={90} /></mesh>
    {arcs.map((p, i) => <group key={i}><Seg a={p[0]} b={p[1]} w={0.05} color="#d8e8ff" opacity={0.9} /><Seg a={p[1]} b={p[2]} w={0.05} color="#b8d0ff" opacity={0.9} /></group>)}
    <Glow position={[0, 3.4, 0]} size={5} color="#9fc0ff" opacity={0.7 + 0.2 * Math.sin(frame)} />
    {oc < 0.85 && <group position={[Math.sin(oc * 9) * 0.5, 3.6 + oc * 4, Math.cos(oc * 9) * 0.5]} scale={0.5 + oc * 0.6}><Glow position={[0, 0, 0]} size={2.4} color="#ffb060" opacity={1 - oc} /><Glow position={[0, 0, 0]} size={1.0} color="#ffffff" opacity={1 - oc} /></group>}
    {oc >= 0.85 && <Glow position={[0, 8, 0]} size={6 * (oc - 0.85) * 7} color="#ffd9a0" opacity={clamp01(1 - (oc - 0.85) * 7)} />}
  </group>;
};
