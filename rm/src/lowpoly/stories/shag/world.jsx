// Shag Harbour (Nova Scotia, 4 Oct 1967) diorama: calm moonless sea at y=0 (z < shore), low coastal land rising to the north (+z),
// Highway 3 along z=ROAD_Z, a small hill on the seaward side of the road (x -9..-2) that hides the sea for a moment,
// a row of fishing houses + a wharf with Cape Islander boats, an island offshore (west). IMPACT = where the lights went in.
import * as THREE from 'three';
import {useMemo} from 'react';
import {Terrain, makeHeight, Building, Glow, Ocean, Rock, Tree, Person, rng, smoothstep, fbm, clamp01, seaHeight} from '../../kit/index.js';

export const ROAD_Z = 15;
export const IMPACT = [5, 0, -9];
export const shoreZ = (x) => 9 + 2.2 * Math.sin(x * 0.07 + 1) + 1.2 * fbm(x * 0.05, 3, 7, 2);
export const height = makeHeight({seed: 1967, amp: 0.5, freq: 0.12, shape: (x, z, h) => {
  const s = shoreZ(x); const land = smoothstep(s - 1.2, s + 1.6, z);
  let y = -2.2 * (1 - land) + (0.6 + 0.04 * (z - s) + h * 0.6) * land;
  y += 3.3 * Math.exp(-(((x + 5.5) / 3.4) ** 2) - (((z - 11.6) / 1.7) ** 2)) * land; // the hill between road and sea
  const isl = Math.hypot((x + 34) / 1.6, z + 22); y = Math.max(y, 1.6 * (1 - smoothstep(4, 9, isl)) - 2.2 * smoothstep(4, 9, isl) + (isl < 7 ? h : 0));
  const road = Math.exp(-(((z - ROAD_Z) / 0.9) ** 2)); y = y * (1 - road * 0.7) + (0.75 + 0.04 * (ROAD_Z - s)) * road * 0.7;
  return y;
}});
const colorFn = (h, x, z) => {
  if (Math.abs(z - ROAD_Z) < 0.75 && h > 0.2) return '#4a4a52';
  if (h < 0.15) return h < -0.6 ? '#1a2428' : '#4a4232';
  if (h < 0.5) return '#3a3e2a';
  return fbm(x * 0.25, z * 0.25, 4, 2) > 0.05 ? '#4f6e3a' : '#5d7d40';
};
export const Land = ({tint = '#ffffff'}) => <Terrain height={height} size={140} seg={110} colorFn={colorFn} tint={tint} center={[0, 10]} jitter={0.25} />;

/** calm black-blue sea, clear moonless night */
export const Sea = ({frame = 0, deep = '#02070f', face = '#0b2240', amp = 0.22, size = [150, 110], center = [0, -30]}) =>
  <Ocean position={[center[0], 0, center[1]]} size={size} seg={64} frame={frame} amp={amp} choppy={1.0} deep={deep} face={face} foam="#24466a" foamAt={0.95} groundFn={height} shore={0.9} />;

/** the village: houses with lit windows along the north side of the road, a wharf, moored boats */
const HOUSES = (() => { const r = rng(41); return Array.from({length: 11}, (_, i) => ({x: -26 + i * 5.4 + (r() - 0.5) * 1.5, z: ROAD_Z + 4 + r() * 3, w: 2.6 + r(), d: 2.2 + r() * 0.6, h: 1.6 + r() * 0.7,
  c: ['#e8e2d2', '#c94a3a', '#f2d88a', '#7aa0c0', '#efefe6'][i % 5], rc: ['#2e3440', '#4a3a32', '#3a4a5a'][i % 3], rot: (r() - 0.5) * 0.3, seed: i})); })();
export const Village = ({lit = 1, frame = 0}) => <group>
  {HOUSES.map((h, i) => <Building key={i} position={[h.x, height(h.x, h.z) - 0.1, h.z]} rotation={h.rot} w={h.w} d={h.d} h={h.h} roof={1.1} color={h.c} roofColor={h.rc} lit={lit} litSeed={h.seed} frame={frame} />)}
  {[[-30, 24], [-12, 26], [8, 27], [22, 25], [30, 22]].map(([x, z], i) => <Tree key={i} position={[x, height(x, z), z]} s={2.2} kind="pine" color="#1f3a2a" seed={i} frame={frame} />)}
  {/* telephone poles along the road */}
  {Array.from({length: 9}, (_, i) => { const x = -31.5 + i * 7; const z = ROAD_Z + 1.4; return <mesh key={'p' + i} position={[x, height(x, z) + 1.6, z]}><boxGeometry args={[0.14, 3.2, 0.14]} /><meshLambertMaterial color="#3a2e24" /></mesh>; })}
</group>;
export const WHARF = {x: 20, z0: 8, z1: 1};
export const Wharf = () => <group>
  <mesh position={[WHARF.x, 0.55, (WHARF.z0 + WHARF.z1) / 2]}><boxGeometry args={[2, 0.25, WHARF.z0 - WHARF.z1 + 2]} /><meshLambertMaterial color="#7a6a54" flatShading /></mesh>
  {Array.from({length: 6}, (_, i) => <mesh key={i} position={[WHARF.x + (i % 2 ? 0.9 : -0.9), -0.4, WHARF.z1 + i * 1.4]}><boxGeometry args={[0.2, 2, 0.2]} /><meshLambertMaterial color="#4a3a2a" /></mesh>)}
  <Glow position={[WHARF.x, 2.1, WHARF.z1]} size={1.4} color="#ffcf7a" opacity={0.8} />
  <mesh position={[WHARF.x, 1.1, WHARF.z1]}><boxGeometry args={[0.1, 1.2, 0.1]} /><meshLambertMaterial color="#2a2a2a" /></mesh>
</group>;

/** Cape Islander fishing boat (bobs on the swell); lit = cabin window + mast light; lamp = searchlight on */
export const Boat = ({position = [0, 0, 0], rotation = 0, frame = 0, hull = '#e8e4da', trim = '#2a5a8a', lit = 1, scale = 1, amp = 0.22}) => {
  const y = seaHeight(position[0], position[2], frame, amp) * 0.8;
  return <group position={[position[0], y + position[1], position[2]]} rotation={[Math.sin(frame * 0.07 + position[0]) * 0.05, rotation, Math.sin(frame * 0.05 + position[2]) * 0.07]} scale={scale}>
    <mesh position={[0, 0.35, 0]}><boxGeometry args={[1.5, 0.8, 4.4]} /><meshLambertMaterial color={hull} flatShading /></mesh>
    <mesh position={[0, 0.35, 2.55]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[1.06, 1, 0.8]}><coneGeometry args={[0.75, 0.9, 4]} /><meshLambertMaterial color={hull} flatShading /></mesh>
    <mesh position={[0, 0.78, 0]}><boxGeometry args={[1.54, 0.1, 4.42]} /><meshLambertMaterial color={trim} /></mesh>
    <mesh position={[0, 1.25, 0.7]}><boxGeometry args={[1.1, 0.9, 1.3]} /><meshLambertMaterial color="#f4f0e6" flatShading /></mesh>
    <mesh position={[0, 1.3, 1.36]}><planeGeometry args={[0.8, 0.35]} />{lit > 0 ? <meshBasicMaterial color="#ffd27a" /> : <meshLambertMaterial color="#2a3442" />}</mesh>
    <mesh position={[0, 2.3, 0.6]}><boxGeometry args={[0.07, 2.2, 0.07]} /><meshLambertMaterial color="#3a3a3a" /></mesh>
    {lit > 0 && <Glow position={[0, 3.45, 0.6]} size={0.9} color="#ffe2a0" opacity={0.85 * lit} />}
  </group>;
};

/** THE OBJECT: a long dark shape with four evenly spaced yellow lights. glow 0..1; lights = how many are lit (1 = single white light) */
export const Craft = ({position = [0, 0, 0], rotation = [0, 0, 0], glow = 1, lights = 4, white = 0, scale = 1, frame = 0, body = 1}) => {
  const col = new THREE.Color('#ffc43a').lerp(new THREE.Color('#ffffff'), white);
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.4);
  return <group position={position} rotation={rotation} scale={scale}>
    {body > 0 && <mesh><boxGeometry args={[8.4, 0.7, 1.4]} /><meshLambertMaterial color="#0c0e14" flatShading transparent opacity={body} /></mesh>}
    {body > 0 && <mesh position={[0, -0.3, 0]}><boxGeometry args={[7.6, 0.2, 1.0]} /><meshLambertMaterial color="#1a1e28" flatShading transparent opacity={body} /></mesh>}
    {[-3, -1, 1, 3].map((x, i) => { const on = lights >= 4 || (lights === 1 ? i === 2 : i < lights); if (!on) return null;
      return <group key={i} position={[x, -0.15, 0.72]}>
        <mesh><sphereGeometry args={[0.36, 8, 6]} /><meshBasicMaterial color={col} /></mesh>
        <Glow position={[0, 0, 0.1]} size={2.6 * glow * pulse} color={white > 0.5 ? '#eaf4ff' : '#ffb43a'} opacity={0.9 * glow} />
      </group>; })}
  </group>;
};

/** light trail behind the descending object (fading glow sprites along its path) */
export const Trail = ({path, t, n = 14, color = '#ffb43a', size = 2, opacity = 0.5}) => <group>{Array.from({length: n}, (_, i) => {
  const u = t - i * 0.025; if (u <= 0) return null; const p = path(u);
  return <Glow key={i} position={p} size={size * (1 - i / n)} color={color} opacity={opacity * (1 - i / n)} />;
})}</group>;

/** simple low-poly propeller airliner for the 'no aircraft missing' scene */
export const Plane = ({position = [0, 0, 0], rotation = 0, color = '#e8ecf0', stripe = '#c8302a', scale = 1, frame = 0}) => <group position={position} rotation={[0, rotation, 0]} scale={scale}>
  <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.35, 5.2, 8]} /><meshLambertMaterial color={color} flatShading /></mesh>
  <mesh position={[0, 0, 2.75]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.45, 0.6, 8]} /><meshLambertMaterial color={color} flatShading /></mesh>
  <mesh position={[0, 0.05, 0]}><boxGeometry args={[5.4, 0.1, 1.0]} /><meshLambertMaterial color={color} flatShading /></mesh>
  <mesh position={[0, 0.08, 0.01]}><boxGeometry args={[5.42, 0.04, 0.2]} /><meshLambertMaterial color={stripe} /></mesh>
  <mesh position={[0, 0.2, -2.3]}><boxGeometry args={[2, 0.08, 0.6]} /><meshLambertMaterial color={color} flatShading /></mesh>
  <mesh position={[0, 0.65, -2.35]}><boxGeometry args={[0.08, 1.0, 0.7]} /><meshLambertMaterial color={stripe} flatShading /></mesh>
  {[-1.6, 1.6].map((x) => <group key={x} position={[x, -0.05, 0.6]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.9, 6]} /><meshLambertMaterial color="#8a9098" /></mesh>
    <mesh position={[0, 0, 0.5]} rotation={[0, 0, frame * 0.5]}><boxGeometry args={[1.2, 0.08, 0.04]} /><meshLambertMaterial color="#2a2a2a" /></mesh></group>)}
</group>;

// ---------- underwater: seabed of the Gulf of Maine, kelp, rocks, divers ----------
export const bedHeight = makeHeight({seed: 1008, amp: 1.2, freq: 0.08});
const bedColor = (h, x, z) => (fbm(x * 0.3, z * 0.3, 2, 2) > 0.15 ? '#6a6250' : h > 0.3 ? '#7d735a' : '#5a5444');
export const Seabed = ({frame = 0, seed = 3}) => {
  const kelp = useMemo(() => { const r = rng(seed); return Array.from({length: 46}, () => ({x: (r() - 0.5) * 40, z: (r() - 0.5) * 40 - 6, h: 1.5 + r() * 3, ph: r() * 6})); }, [seed]);
  const rocks = useMemo(() => { const r = rng(seed + 9); return Array.from({length: 18}, () => ({x: (r() - 0.5) * 36, z: (r() - 0.5) * 36 - 6, s: 0.5 + r() * 1.4, k: Math.floor(r() * 99)})); }, [seed]);
  return <group>
    <Terrain height={bedHeight} size={90} seg={60} colorFn={bedColor} center={[0, -6]} jitter={0.3} />
    {rocks.map((q, i) => <Rock key={i} position={[q.x, bedHeight(q.x, q.z) - 0.2, q.z]} size={q.s} seed={q.k} color="#55504a" moss="#3a5a3a" />)}
    {kelp.map((q, i) => { const y0 = bedHeight(q.x, q.z); return <group key={'k' + i} position={[q.x, y0, q.z]}>
      {[0, 1, 2, 3].map((s) => <mesh key={s} position={[Math.sin(frame * 0.05 + q.ph + s * 0.6) * 0.18 * s, q.h * (s + 0.5) / 4, 0]} rotation={[0, 0, Math.sin(frame * 0.05 + q.ph + s) * 0.25]}><boxGeometry args={[0.18, q.h / 4 + 0.05, 0.05]} /><meshLambertMaterial color={s % 2 ? '#3f6a2a' : '#4f7a30'} /></mesh>)}
    </group>; })}
  </group>;
};
/** a Navy diver swimming face-down towards local +z; kick = leg phase; torch = lamp in front */
export const Diver = ({position = [0, 0, 0], heading = 0, frame = 0, kick = 0, suit = '#1c1f26', tank = '#c8a23a', scale = 1}) =>
  <group position={position} rotation={[0, heading, 0]} scale={scale}>
    <group rotation={[Math.PI / 2 - 0.12, 0, 0]} position={[0, 0, -0.9]}>
      <Person pose="walk" phase={kick} skin="#d9a984" shirt={suit} pants={suit} hair="#111" shoes="#1a4a8a" />
      <mesh position={[0, 1.15, -0.32]} rotation={[0, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.8, 8]} /><meshLambertMaterial color={tank} flatShading /></mesh>
      <mesh position={[0, 1.65, 0.2]}><boxGeometry args={[0.36, 0.16, 0.08]} /><meshBasicMaterial color="#9fd6ff" /></mesh>
    </group>
  </group>;
