// Jatinga: foggy ridge village with lamps, falling low-poly birds. Deterministic.
import {useMemo} from 'react';
import {Glow, Building, rng} from '../../kit/index.js';
import {Bx, Cy, Land, Pines, height} from '../flatwoods-monster/world.jsx';
export {Bx, Cy, Land, Pines, height};
export const Village = ({frame = 0, lit = 1}) => <group>
  {[[-5, -8, 0.3], [0, -12, -0.2], [5, -7, 0.5], [-9, -14, 0.1], [9, -13, -0.4]].map(([x, z, r], i) =>
    <group key={i}><Building position={[x, height(x, z) - 0.1, z]} rotation={r} w={3.4} d={3} h={2.4} roof={1.6} color={i % 2 ? '#6a4a30' : '#5a3a28'} roofColor="#2a2e26" lit={lit} litSeed={i + 3} frame={frame} />
    <Glow position={[x + 1.2, height(x, z) + 2.4, z + 1.8]} size={2.2 + 0.3 * Math.sin(frame * 0.3 + i)} color="#ffd890" opacity={0.8 * lit} /></group>)}
  <Cy p={[0, height(0, -4) + 2, -4]} a={[0.08, 0.08, 4, 5]} c="#4a3a2a" /><Glow position={[0, height(0, -4) + 4.2, -4]} size={2.6} color="#fff0c0" opacity={0.7 * lit} />
</group>;
export const Bird = ({p, rot = 0, s = 1, flap = 0, c = '#cfd6e0'}) => <group position={p} rotation={[0, rot, 0]} scale={s}>
  <mesh><sphereGeometry args={[0.28, 8, 6]} /><meshLambertMaterial color={c} flatShading /></mesh>
  <mesh position={[0, 0.05, 0.3]}><coneGeometry args={[0.12, 0.3, 5]} /><meshLambertMaterial color="#e0a040" flatShading /></mesh>
  <Bx p={[-0.5, 0.05, 0]} s={[0.7, 0.04, 0.3]} c={c} r={[0, 0, 0.5 * flap]} /><Bx p={[0.5, 0.05, 0]} s={[0.7, 0.04, 0.3]} c={c} r={[0, 0, -0.5 * flap]} /></group>;
/** flock spiralling down toward target; u 0..1 */
export const Flock = ({n = 24, u = 0, frame = 0, target = [0, 3, -8], top = 14, spread = 9, seed = 7}) => {
  const B = useMemo(() => { const r = rng(seed); return Array.from({length: n}, () => ({a: r() * 6.28, rad: 1 + r() * spread, d: r() * 0.4, ph: r() * 6})); }, [n, seed, spread]);
  return <group>{B.map((b, i) => { const k = Math.min(1, Math.max(0, u * 1.3 - b.d)); const ang = b.a + k * 2.5; const rr = b.rad * (1 - k * 0.85);
    return <Bird key={i} p={[target[0] + Math.cos(ang) * rr, top + (target[1] - top) * k, target[2] + Math.sin(ang) * rr]} rot={-ang} s={0.9} flap={Math.sin(frame * 0.8 + b.ph)} />; })}</group>;
};
