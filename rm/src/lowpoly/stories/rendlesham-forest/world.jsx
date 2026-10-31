// Rendlesham Forest diorama (Suffolk, Dec 1980): flat pine forest + clearing, metallic triangle craft on three legs with red/blue/white lights, RAF Woodbridge gate,
// dents, tape recorder, survey meter, radar scope, lighthouse, rabbit holes, archive shelves. Deterministic (no clocks).
import {useMemo} from 'react';
import {Terrain, makeHeight, rng, Glow, Tree, Building} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};
export {Beam, Meteor} from '../flatwoods-monster/world.jsx';
export const height = makeHeight({seed: 1980, amp: 0.5, freq: 0.07, shape: (x, z, h) => 0.3 + h * 0.5});
const colorFn = (h, x, z) => (((Math.floor(x * 0.35) + Math.floor(z * 0.35)) & 1) ? '#2c3624' : '#242d20');
export const Land = () => <Terrain height={height} size={230} seg={80} colorFn={colorFn} center={[0, -30]} jitter={0.15} />;
/** pines everywhere except a clearing at (cx,cz) radius cr and the track corridor */
export const Pines = ({count = 120, seed = 7, frame = 0, cx = 0, cz = -14, cr = 7, spread = 80}) => {
  const P = useMemo(() => { const r = rng(seed); const o = []; let n = 0;
    while (o.length < count && n++ < 5000) { const x = -spread + r() * spread * 2, z = -spread * 1.1 + r() * spread * 1.15;
      if (Math.hypot(x - cx, z - cz) < cr) continue; if (Math.abs(x) < 3 && z > -6) continue; o.push({x, z, h: height(x, z), s: 1.5 + r() * 1.7, k: r()}); } return o; }, [count, seed, cx, cz, cr, spread]);
  return <group>{P.map((p, i) => <Tree key={i} position={[p.x, p.h - 0.1, p.z]} s={p.s} kind="pine" color={p.k > 0.5 ? '#14301f' : '#1c3a28'} seed={i} frame={frame} />)}</group>;
};
/** THE CRAFT: metallic triangular body on three legs, pulsing red top light, blue lights underneath, white glare. y = height of the ground under it */
export const Craft = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0, glow = 1, hover = 0, tilt = 0}) => {
  const red = 0.55 + 0.45 * Math.sin(frame * 0.32); const blue = 0.6 + 0.4 * Math.sin(frame * 0.32 + 3.1);
  const corners = [0, 1, 2].map((k) => { const a = k * Math.PI * 2 / 3 + Math.PI / 2; return [Math.cos(a) * 1.9, Math.sin(a) * 1.9]; });
  return <group position={[position[0], position[1] + hover, position[2]]} rotation={[tilt, rotation, 0]} scale={scale}>
    <mesh position={[0, 1.7, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.25, 1, 1.25]}><cylinderGeometry args={[2.4, 2.6, 1.1, 3]} /><meshLambertMaterial color="#aab4be" flatShading emissive="#6a7a8c" emissiveIntensity={0.45} /></mesh>
    <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.2, 1, 1.2]}><cylinderGeometry args={[1.5, 2.4, 0.45, 3]} /><meshLambertMaterial color="#c8d0d8" flatShading emissive="#8a9aac" emissiveIntensity={0.45} /></mesh>
    {corners.map(([x, z], i) => <group key={i}><Cy p={[x * 0.9, 0.7, z * 0.9]} a={[0.1, 0.16, 1.5, 5]} c="#6a747e" /><Bx p={[x * 0.9, 0.08, z * 0.9]} s={[0.55, 0.12, 0.55]} c="#555d66" />
      <mesh position={[x * 0.75, 1.1, z * 0.75]}><sphereGeometry args={[0.2, 8, 6]} /><meshBasicMaterial color={`rgb(${Math.round(40 + 40 * blue)},${Math.round(90 + 80 * blue)},255)`} toneMapped={false} /></mesh>
      <Glow position={[x * 0.75, 1.1, z * 0.75]} size={2.6 * blue * glow} color="#3a7aff" opacity={0.9} /></group>)}
    <mesh position={[0, 2.75, 0]}><sphereGeometry args={[0.34, 10, 8]} /><meshBasicMaterial color="#ff2a2a" toneMapped={false} /></mesh>
    <Glow position={[0, 2.8, 0]} size={5.5 * red * glow} color="#ff2a22" opacity={0.95} />
    <Glow position={[0, 1.9, 1.6]} size={9 * glow} color="#ffffff" opacity={0.5} />
  </group>; };
export const Dents = ({position = [0, 0, 0], scale = 1, ruler = false}) => <group position={position} scale={scale}>
  {[0, 1, 2].map((k) => { const a = k * Math.PI * 2 / 3 + Math.PI / 2; return <group key={k} position={[Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7]}>
    <Cy p={[0, 0.02, 0]} a={[0.55, 0.45, 0.06, 8]} c="#8a5a1e" e="#ff9a2a" ei={0.5} /><Cy p={[0, 0.0, 0]} a={[0.35, 0.3, 0.08, 8]} c="#3a2410" /></group>; })}
  {ruler && <group position={[1.1, 0.1, 0.4]}><Bx p={[0, 0, 0]} s={[1.6, 0.05, 0.22]} c="#f0e2a0" />{Array.from({length: 9}, (_, i) => <Bx key={i} p={[-0.7 + i * 0.175, 0.04, 0.0]} s={[0.02, 0.05, 0.15]} c="#222" />)}</group>}
</group>;
export const Gate = ({frame = 0}) => <group>
  {[-3.2, 3.2].map((x, i) => <group key={i}><Bx p={[x, 1.6, 0]} s={[0.9, 3.2, 0.9]} c="#8a6a52" /><Bx p={[x, 3.3, 0]} s={[1.1, 0.2, 1.1]} c="#5a4a40" />
    <Cy p={[x, 4.2, 0]} a={[0.07, 0.09, 2.2, 5]} c="#444" /><Glow position={[x, 5.3, 0]} size={5} color="#ff9a30" opacity={0.7} /></group>)}
  <Bx p={[-1.2, 2.0, 0]} s={[4, 0.14, 0.14]} c="#e8e8e8" /><Bx p={[-1.2, 2.0, 0.0]} s={[0.5, 0.15, 0.15]} c="#d83a2a" />
  <Bx p={[0, 3.8, 0]} s={[7.6, 0.8, 0.2]} c="#2a3a52" /><Bx p={[-6, 1.1, -0.2]} s={[4, 2.2, 0.1]} c="#555d4a" /><Bx p={[6, 1.1, -0.2]} s={[4, 2.2, 0.1]} c="#555d4a" />
  <Bx p={[-5.5, 1.1, -2.8]} s={[2.6, 2.2, 2]} c="#7a6a58" /><Bx p={[-5.5, 2.3, -2.8]} s={[2.9, 0.25, 2.3]} c="#3a3a40" /><Bx p={[-4.2, 1.2, -2.6]} s={[0.06, 0.8, 0.8]} c="#ffd890" basic />
  <Bx p={[0, -0.02, 0]} s={[8, 0.06, 20]} c="#3a3a3c" />
</group>;
export const Recorder = ({position = [0, 0, 0], frame = 0, scale = 1}) => <group position={position} scale={scale}>
  <Bx p={[0, 0, 0]} s={[0.9, 0.5, 0.2]} c="#2a2a2e" />{[-0.22, 0.22].map((x, i) => <Cy key={i} p={[x, 0.05, 0.12]} a={[0.15, 0.15, 0.06, 10]} c="#c8c8c8" r={[Math.PI / 2, frame * 0.2 * (i ? 1 : -1), 0]} />)}
  <mesh position={[0.34, 0.2, 0.12]}><sphereGeometry args={[0.04, 6, 6]} /><meshBasicMaterial color={frame % 24 < 14 ? '#ff2a2a' : '#401010'} toneMapped={false} /></mesh></group>;
export const Meter = ({position = [0, 0, 0], needle = 0.1, scale = 1}) => <group position={position} scale={scale}>
  <Bx p={[0, 0, 0]} s={[0.9, 0.7, 0.35]} c="#4a5a3a" /><Bx p={[0, 0.1, 0.19]} s={[0.7, 0.4, 0.02]} c="#e8e4c8" basic />
  <Bx p={[0, 0.0, 0.22]} s={[0.02, 0.32, 0.02]} c="#c82020" basic r={[0, 0, -0.9 + needle * 2.4]} /><Cy p={[0, -0.55, 0]} a={[0.04, 0.04, 0.9, 5]} c="#333" /></group>;
export const Scope = ({frame = 0, size = 2.4, blips = 0}) => { const a = frame * 0.09;
  return <group><Cy p={[0, 0, 0]} a={[size, size * 1.05, 0.3, 24]} c="#0c1a12" /><Cy p={[0, 0.17, 0]} a={[size * 0.92, size * 0.92, 0.04, 24]} c="#12301c" e="#2aff6a" ei={0.35} />
    {[0.33, 0.66, 1].map((k, i) => <mesh key={i} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[size * 0.9 * k - 0.025, size * 0.9 * k, 40]} /><meshBasicMaterial color="#2aff6a" transparent opacity={0.5} toneMapped={false} /></mesh>)}
    <group rotation={[0, a, 0]}><Bx p={[size * 0.45, 0.21, 0]} s={[size * 0.9, 0.03, 0.06]} c="#8affa8" basic /><Bx p={[size * 0.45, 0.2, -0.28]} s={[size * 0.9, 0.02, 0.5]} c="#2aff6a" basic o={0.18} /></group>
    {Array.from({length: blips}, (_, i) => <Glow key={i} position={[Math.cos(i * 2.1) * size * 0.5, 0.4, Math.sin(i * 2.1) * size * 0.5]} size={0.7} color="#aaffbb" opacity={0.9} />)}</group>; };
/** Orfordness-style lighthouse: striped tower, lamp, rotating beam (period 150 frames = 5 s) */
export const Lighthouse = ({position = [0, 0, 0], frame = 0, scale = 1}) => { const a = (frame / 150) * Math.PI * 2;
  return <group position={position} scale={scale}>{[0, 1, 2, 3].map((i) => <Cy key={i} p={[0, 1.6 + i * 3.2, 0]} a={[1.5 - i * 0.18, 1.7 - i * 0.18, 3.2, 8]} c={i % 2 ? '#c83a2a' : '#f0eadc'} />)}
    <Cy p={[0, 13.4, 0]} a={[1.1, 1.1, 1.0, 8]} c="#ffe8a0" basic /><Bx p={[0, 14.2, 0]} s={[1.9, 0.3, 1.9]} c="#222" /><Glow position={[0, 13.4, 0]} size={7} color="#fff2c0" opacity={0.9} />
    <group position={[0, 13.4, 0]} rotation={[0, a, 0]}><mesh position={[16, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[2.6, 32, 12, 1, true]} /><meshBasicMaterial color="#fff2c8" transparent opacity={0.28} toneMapped={false} depthWrite={false} /></mesh></group></group>; };
export const Holes = ({position = [0, 0, 0], rabbit = false, frame = 0}) => <group position={position}>
  {[[0, 0], [1.4, 0.6], [-1.2, 0.9], [0.4, -1.3], [-0.2, 1.8]].map(([x, z], i) => <group key={i}><Cy p={[x, 0.03, z]} a={[0.42, 0.42, 0.05, 9]} c="#6a5a42" /><Cy p={[x, 0.06, z]} a={[0.28, 0.28, 0.05, 9]} c="#0a0806" /></group>)}
  {rabbit && <group position={[1.4, 0.35 + Math.abs(Math.sin(frame * 0.2)) * 0.12, 0.6]}><mesh scale={[1, 0.8, 1.3]}><sphereGeometry args={[0.35, 8, 6]} /><meshLambertMaterial color="#9a7a58" flatShading /></mesh>
    <mesh position={[0, 0.3, 0.38]}><sphereGeometry args={[0.2, 8, 6]} /><meshLambertMaterial color="#a88a68" flatShading /></mesh>
    <Bx p={[-0.07, 0.65, 0.35]} s={[0.07, 0.4, 0.05]} c="#a88a68" /><Bx p={[0.07, 0.65, 0.35]} s={[0.07, 0.4, 0.05]} c="#a88a68" /></group>}</group>;
export const Archive = ({frame = 0}) => <group>
  {[0, 1, 2].map((r) => <group key={r}><Bx p={[0, r * 2.3, 0]} s={[13, 0.2, 2.4]} c="#5a4a38" />
    {Array.from({length: 11}, (_, i) => { const hot = r === 1 && i === 5; return <Bx key={i} p={[-5.5 + i * 1.1, r * 2.3 + 0.75, 0]} s={[0.85, 1.3, 1.8]} c={hot ? '#e8d890' : ['#a89878', '#8a7a62', '#b8a888'][i % 3]} e={hot ? '#ffd860' : undefined} ei={0.7} />; })}</group>)}
  <Bx p={[-6.6, 2.3, 0]} s={[0.25, 7, 2.4]} c="#4a3a2a" /><Bx p={[6.6, 2.3, 0]} s={[0.25, 7, 2.4]} c="#4a3a2a" /><Glow position={[0.5, 2.8, 1.8]} size={5} color="#ffe8a8" opacity={0.28} /></group>;
