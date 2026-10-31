// Ghost rockets (Sweden 1946) diorama parts: Baltic lake basin with pine shores (lake centred at (0,-30), surface y=0, camera usually at +z looking -z),
// glowing cigar ROCKET with fire tail, raft with poles, lakebed crater, radar scope, press desk with papers/map, briefcase, officers' table with folders,
// airfield with plane + tower, meteor streaks. Deterministic (no clocks).
import {useMemo} from 'react';
import * as THREE from 'three';
import {Terrain, makeHeight, rng, smoothstep, Glow, Tree, Ocean, Building} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};

const lakeR = (x, z) => Math.hypot(x / 54, (z + 32) / 40);
export const height = makeHeight({seed: 1946, amp: 0.5, freq: 0.07, shape: (x, z, h) => {
  const r = lakeR(x, z); const basin = smoothstep(0.78, 1.04, r);
  return -2.4 * (1 - basin) + basin * (0.45 + h * 0.5 + 9 * smoothstep(1.1, 2.0, r) + 0.6 * Math.sin(x * 0.05) * smoothstep(1.0, 1.6, r));
}});
const colorFn = (h, x, z) => { if (h < 0.1) return h < -0.7 ? '#1a2a2e' : '#5a5648'; if (h < 0.7) return '#4a5238'; return ((Math.floor(x * 0.3) + Math.floor(z * 0.3)) & 1) ? '#3f5a34' : '#365030'; };
export const Land = ({tint = '#ffffff'}) => <Terrain height={height} size={230} seg={90} colorFn={colorFn} tint={tint} center={[0, -30]} jitter={0.2} />;
export const Lake = ({frame = 0, amp = 0.07, face = '#1b3c4a', deep = '#050e16'}) => <Ocean position={[0, 0, -30]} size={[120, 90]} seg={48} frame={frame} amp={amp} choppy={0.8} deep={deep} face={face} foam="#6a8a94" foamAt={0.97} groundFn={height} shore={0.7} />;

/** dark pine shores (never inside the lake) */
export const Pines = ({count = 130, seed = 7, frame = 0, area = [-95, 95, -95, 3]}) => {
  const P = useMemo(() => { const r = rng(seed); const out = []; let n = 0;
    while (out.length < count && n++ < 5000) { const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]); const h = height(x, z);
      if (h < 0.7 || lakeR(x, z) < 1.04) continue; out.push({x, z, h, s: 1.4 + r() * 1.5, k: r()}); } return out; }, [count, seed]);
  return <group>{P.map((p, i) => <Tree key={i} position={[p.x, p.h - 0.1, p.z]} s={p.s} kind="pine" color={p.k > 0.5 ? '#1b3a2c' : '#24442e'} seed={i} frame={frame} />)}</group>;
};

/** THE ROCKET: grey cigar along +x with fins and a fire tail (-x). scale ~1 = 5 m long. fire 0..1.5 */
export const Rocket = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, fire = 1, frame = 0, glow = 1}) => {
  const fl = fire * (0.85 + 0.15 * Math.sin(frame * 1.3)) ;
  return <group position={position} rotation={rotation} scale={scale}>
    <Cy p={[0, 0, 0]} a={[0.42, 0.42, 4.2, 12]} c="#cfd6de" e="#9fb0c0" ei={0.9} r={[0, 0, Math.PI / 2]} />
    <mesh position={[2.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.42, 1.0, 12]} /><meshLambertMaterial color="#e8eef6" emissive="#bfd0e0" emissiveIntensity={0.9} flatShading /></mesh>
    {[0, 1.57, 3.14, 4.71].map((a, i) => <mesh key={i} position={[-1.7, Math.cos(a) * 0.55, Math.sin(a) * 0.55]} rotation={[a, 0, 0]}><boxGeometry args={[0.9, 0.7, 0.06]} /><meshLambertMaterial color="#8a949e" flatShading /></mesh>)}
    <Bx p={[0.4, 0, 0]} s={[0.25, 0.9, 0.9]} c="#c8302a" e="#c8302a" ei={0.4} />
    {fire > 0 && <>
      <mesh position={[-3.6 * fl - 2.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}><coneGeometry args={[0.5, 3.6 * fl + 1, 10]} /><meshBasicMaterial color="#ffb040" transparent opacity={0.85} toneMapped={false} /></mesh>
      <mesh position={[-2.9 * fl - 2.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.28, 2.6 * fl + 0.6, 10]} /><meshBasicMaterial color="#fff6d8" transparent opacity={0.95} toneMapped={false} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => <Glow key={i} position={[-2.4 - i * 1.3 * fl, 0, 0]} size={(3.2 - i * 0.35) * fl * glow} color={i < 2 ? '#ffd890' : '#ff8a3a'} opacity={0.8 - i * 0.1} />)}
    </>}
  </group>;
};

/** a light trail of glow sprites along path(u) behind u */
export const FireTrail = ({path, u, n = 16, color = '#ff9a40', size = 2.4, opacity = 0.6, step = 0.02}) => <group>{Array.from({length: n}, (_, i) => { const v = u - i * step; if (v < 0) return null; return <Glow key={i} position={path(v)} size={size * (1 - i / n)} color={color} opacity={opacity * (1 - i / n)} />; })}</group>;

/** wooden raft with poles, lamp optional */
export const Raft = ({position = [0, 0, 0], rotation = 0, frame = 0, lamp = false, empty = false}) => <group position={[position[0], position[1] + Math.sin(frame * 0.06 + position[0]) * 0.04, position[2]]} rotation={[Math.sin(frame * 0.05) * 0.02, rotation, 0]}>
  <Bx p={[0, 0.1, 0]} s={[4.2, 0.22, 2.8]} c="#8a6a44" />
  {[-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => <Bx key={i} p={[x, 0.24, 0]} s={[0.55, 0.06, 2.7]} c={i % 2 ? '#7a5c3a' : '#9a7a50'} />)}
  {!empty && <><Cy p={[1.6, 1.1, 0.9]} a={[0.05, 0.05, 3.2, 5]} c="#6a4a2a" r={[0.2, 0, -0.5]} /><Cy p={[-1.3, 1.1, -0.9]} a={[0.05, 0.05, 3.2, 5]} c="#6a4a2a" r={[-0.2, 0, 0.5]} /></>}
  {empty && <Cy p={[0.4, 0.55, 0.4]} a={[0.05, 0.05, 1.6, 5]} c="#6a4a2a" r={[0, 0, 1.4]} />}
  {lamp && <><Cy p={[-1.9, 0.8, 0]} a={[0.05, 0.05, 1.3, 5]} c="#3a3a3a" /><mesh position={[-1.9, 1.5, 0]}><sphereGeometry args={[0.2, 8, 6]} /><meshBasicMaterial color="#fff2c0" toneMapped={false} /></mesh><Glow position={[-1.9, 1.5, 0]} size={3.5} color="#fff0b0" opacity={0.9} /></>}
</group>;

/** lakebed cutaway: strata block with a crater pit and broken mounds */
export const CraterBlock = ({frame = 0}) => <group>
  {[['#4a4034', 0], ['#5a4e3e', 1], ['#3a3226', 2], ['#6a5a44', 3]].map(([c, i]) => <Bx key={i} p={[0, -0.6 - i * 0.7, 0]} s={[16, 0.7, 10]} c={c} />)}
  <Cy p={[0, 0.0, 0]} a={[3.3, 1.2, 1.6, 10]} c="#14100c" />
  {Array.from({length: 14}, (_, i) => { const a = i / 14 * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 4.3, 0.15, Math.sin(a) * 3.8]} rotation={[0.3 * i, a, 0.2]} scale={0.7 + (i % 3) * 0.3}><icosahedronGeometry args={[0.75, 0]} /><meshLambertMaterial color={i % 2 ? '#6a5a44' : '#7a6a50'} flatShading /></mesh>; })}
  {Array.from({length: 22}, (_, i) => <Bx key={'s' + i} p={[-7 + (i * 0.67) % 14, 0.0 + (i % 3) * 0.02, -4 + (i * 1.7) % 8]} s={[0.5 + (i % 4) * 0.2, 0.12, 0.4]} c={i % 3 ? '#8a7a5c' : '#5a5040'} />)}
</group>;

/** radar scope: dark disc, rings, rotating sweep, blips (n visible out of a deterministic scatter) */
export const Radar = ({frame = 0, n = 60, size = 9}) => {
  const B = useMemo(() => { const r = rng(21); return Array.from({length: 200}, () => { const a = r() * 6.283, d = Math.sqrt(r()) * 0.9; return [Math.cos(a) * d, Math.sin(a) * d, r()]; }); }, []);
  const sw = frame * 0.09;
  return <group>
    <Cy p={[0, 0, 0]} a={[size * 1.12, size * 1.12, 0.5, 40]} c="#2a2c30" r={[Math.PI / 2, 0, 0]} />
    <Cy p={[0, 0, 0.3]} a={[size, size, 0.1, 40]} c="#06160c" r={[Math.PI / 2, 0, 0]} />
    {[0.33, 0.66, 1].map((k) => <mesh key={k} position={[0, 0, 0.4]}><ringGeometry args={[size * k - 0.07, size * k, 48]} /><meshBasicMaterial color="#2aff7a" transparent opacity={0.55} toneMapped={false} /></mesh>)}
    <Bx p={[0, 0, 0.4]} s={[size * 2, 0.05, 0.02]} c="#1f9a4a" basic /><Bx p={[0, 0, 0.4]} s={[0.05, size * 2, 0.02]} c="#1f9a4a" basic />
    <group position={[0, 0, 0.45]} rotation={[0, 0, -sw]}><mesh position={[size / 2, 0, 0]}><planeGeometry args={[size, 0.14]} /><meshBasicMaterial color="#8affb0" toneMapped={false} /></mesh>
      <mesh position={[size / 2, -size * 0.12, -0.01]}><planeGeometry args={[size, size * 0.26]} /><meshBasicMaterial color="#2aff7a" transparent opacity={0.16} toneMapped={false} /></mesh></group>
    {B.slice(0, n).map(([x, y, k], i) => <mesh key={i} position={[x * size, y * size, 0.5]}><circleGeometry args={[0.1 + k * 0.07, 8]} /><meshBasicMaterial color={k > 0.8 ? '#e8ffe0' : '#4aff90'} toneMapped={false} /></mesh>)}
    <Glow position={[0, 0, 1]} size={size * 2.6} color="#2aff7a" opacity={0.22} />
  </group>;
};

/** desk with lamp, stacked newspapers, optional map with black censor bars */
export const Desk = ({lampOn = true, papers = 5, map = false, bars = 0, frame = 0}) => <group>
  <Bx p={[0, 0, 0]} s={[12, 0.5, 6]} c="#4a3626" /><Bx p={[-5.4, -1.4, -2.5]} s={[0.5, 2.6, 0.5]} c="#3a2a1c" /><Bx p={[5.4, -1.4, -2.5]} s={[0.5, 2.6, 0.5]} c="#3a2a1c" />
  <Bx p={[-5.4, -1.4, 2.5]} s={[0.5, 2.6, 0.5]} c="#3a2a1c" /><Bx p={[5.4, -1.4, 2.5]} s={[0.5, 2.6, 0.5]} c="#3a2a1c" />
  {Array.from({length: papers}, (_, i) => <Bx key={i} p={[-3.4 + (i % 3) * 0.25, 0.32 + Math.floor(i / 2) * 0.14, 0.4 + (i % 2) * 0.2]} s={[2.6, 0.1, 3.4]} c={i % 2 ? '#e8e0cc' : '#d8d0bc'} r={[0, 0.08 * i - 0.1, 0]} />)}
  {map && <group position={[2.2, 0.32, 0]}><Bx p={[0, 0, 0]} s={[5.6, 0.08, 4]} c="#c8d4b0" />
    <Bx p={[-1.2, 0.07, -0.6]} s={[1.4, 0.04, 0.6]} c="#3a6a8a" /><Bx p={[1.0, 0.07, 0.5]} s={[1.8, 0.04, 0.8]} c="#3a6a8a" /><Bx p={[0.2, 0.07, -1.2]} s={[0.8, 0.04, 0.5]} c="#3a6a8a" />
    {[[-1.6, -0.3], [-0.2, 0.2], [1.4, -0.9], [0.9, 1.2], [-1.0, 1.0]].slice(0, bars).map(([x, z], i) => <Bx key={i} p={[x, 0.12, z]} s={[1.5, 0.06, 0.45]} c="#050505" />)}</group>}
  <Cy p={[4.6, 0.3, -1.8]} a={[0.5, 0.6, 0.15, 8]} c="#2a2a2a" /><Cy p={[4.6, 1.3, -1.8]} a={[0.06, 0.06, 2, 5]} c="#2a2a2a" />
  <mesh position={[4.2, 2.35, -1.8]} rotation={[0, 0, 0.5]}><coneGeometry args={[0.8, 0.9, 8, 1, true]} /><meshLambertMaterial color="#1c5a3a" emissive="#1c5a3a" emissiveIntensity={0.3} side={THREE.DoubleSide} /></mesh>
  {lampOn && <><Glow position={[4.0, 2.0, -1.8]} size={6} color="#ffd890" opacity={0.7} /><Glow position={[2.5, 0.8, -0.5]} size={9} color="#ffe0a8" opacity={0.18} /></>}
</group>;

export const Briefcase = ({position = [0, 0, 0], rotation = 0, open = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <Bx p={[0, 0.35, 0]} s={[2.6, 0.7, 1.8]} c="#5a3a22" /><Bx p={[0, 0.71, 0]} s={[2.62, 0.05, 1.82]} c="#3a2414" />
  <Bx p={[0, 0.78, 0]} s={[0.9, 0.12, 0.12]} c="#2a1a10" /><Bx p={[-0.6, 0.45, 0.92]} s={[0.22, 0.14, 0.04]} c="#d8b448" e="#d8b448" ei={0.6} /><Bx p={[0.6, 0.45, 0.92]} s={[0.22, 0.14, 0.04]} c="#d8b448" e="#d8b448" ei={0.6} />
</group>;

/** officers' table with folders; litIndex = folder that glows */
export const FolderTable = ({litIndex = -1, count = 9, frame = 0, stamp = null}) => <group>
  <Bx p={[0, 0, 0]} s={[13, 0.5, 4.6]} c="#3a2c22" /><Bx p={[0, -1.6, 0]} s={[2, 3, 2]} c="#2a2018" />
  {Array.from({length: count}, (_, i) => { const x = -5.6 + (i % 5) * 2.8, z = i < 5 ? -1.0 : 1.0; const lit = i === litIndex;
    return <group key={i} position={[x + (i < 5 ? 0 : 1.2), 0.32, z]} rotation={[0, 0.1 * ((i * 7) % 5 - 2), 0]}>
      <Bx p={[0, 0, 0]} s={[1.6, 0.08, 2]} c={lit ? '#e8c86a' : '#a89a78'} e={lit ? '#ffd860' : undefined} ei={0.9} />
      <Bx p={[0.1, 0.07, 0.1]} s={[1.3, 0.04, 1.6]} c={lit ? '#fff2c0' : '#d8cfb4'} e={lit ? '#ffe9a0' : undefined} ei={0.8} />
      {lit && <Glow position={[0, 0.7, 0]} size={4.2} color="#ffe48a" opacity={0.75} />}</group>; })}
  <Bx p={[0, 0.5, -2.4]} s={[0.1, 0.1, 0.1]} c="#000" />
</group>;

/** airfield: runway strip, tower with beacon, dusk lamps */
export const Airfield = ({frame = 0}) => <group>
  <Bx p={[0, -0.05, 0]} s={[120, 0.1, 120]} c="#33403a" />
  <Bx p={[0, 0.02, 0]} s={[100, 0.06, 7]} c="#33363a" />
  {Array.from({length: 18}, (_, i) => <Bx key={i} p={[-48 + i * 5.6, 0.07, 0]} s={[2.6, 0.04, 0.3]} c="#e8e8d8" />)}
  {Array.from({length: 24}, (_, i) => <group key={'l' + i}><Bx p={[-55 + i * 4.8, 0.2, 4.2]} s={[0.15, 0.4, 0.15]} c="#222" /><Glow position={[-55 + i * 4.8, 0.55, 4.2]} size={1.4} color={i % 6 === 0 ? '#ff6a4a' : '#ffe9a8'} opacity={0.9} /></group>)}
  <group position={[-18, 0, -16]}><Bx p={[0, 3, 0]} s={[1.6, 6, 1.6]} c="#9a9a96" /><Bx p={[0, 6.6, 0]} s={[3.6, 1.6, 3.6]} c="#5a6a78" e="#ffd890" ei={0.5} /><Bx p={[0, 7.6, 0]} s={[4.0, 0.2, 4.0]} c="#2a2a30" />
    <Glow position={[0, 8.2, 0]} size={3 + Math.sin(frame * 0.2) * 0.6} color="#ff5a3a" opacity={0.9} /></group>
  <Bx p={[22, 1.4, -18]} s={[12, 2.8, 5]} c="#6a6a62" /><Bx p={[22, 3.0, -18]} s={[12.4, 0.4, 5.4]} c="#3a3a3a" />
</group>;

/** a meteor streak: bright head + glow trail along dir */
export const Meteor = ({position = [0, 0, 0], dir = [1, -0.5, 0], len = 14, size = 1.6, color = '#ffe8c0', opacity = 1}) => { const d = new THREE.Vector3(...dir).normalize();
  return <group>{Array.from({length: 14}, (_, i) => <Glow key={i} position={[position[0] - d.x * len * i / 14, position[1] - d.y * len * i / 14, position[2] - d.z * len * i / 14]} size={size * (1 - i / 15) * (i === 0 ? 1.3 : 1)} color={i < 3 ? '#ffffff' : color} opacity={opacity * (1 - i / 14)} />)}</group>; };

/** a few lit houses on the lake shore for the fireworks / meteor scenes */
export const Hamlet = ({frame = 0, x0 = -22, z = 12}) => <group>
  {[0, 1, 2, 3, 4].map((i) => { const x = x0 + i * 9 + (i % 2) * 2; return <Building key={i} position={[x, height(x, z + (i % 2) * 3) - 0.1, z + (i % 2) * 3]} rotation={0.2 * (i - 2)} w={3} d={2.6} h={2} roof={1.3} color={['#c94a3a', '#e8e2d2', '#d8b45a', '#7aa0c0', '#c8c0b0'][i]} roofColor="#3a3a46" lit={1} litSeed={i} frame={frame} />; })}
</group>;
