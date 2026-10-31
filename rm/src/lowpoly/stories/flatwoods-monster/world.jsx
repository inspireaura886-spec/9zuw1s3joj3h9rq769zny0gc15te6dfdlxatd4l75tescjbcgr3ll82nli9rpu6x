// Flatwoods diorama: Appalachian hill (crest at (0,-24)), pines, farm, the hooded red-faced figure, flashlight beam, barn owl, meteor. Deterministic.
import {useMemo} from 'react';
import * as THREE from 'three';
import {Terrain, makeHeight, rng, Glow, Tree, Building} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};
export const height = makeHeight({seed: 1952, amp: 0.8, freq: 0.06, shape: (x, z, h) => 1.2 + h * 0.6 + 4.5 * Math.exp(-((x * x) / 900 + ((z + 26) * (z + 26)) / 500)) - 1.5 * Math.exp(-((x * x) / 300 + ((z - 6) * (z - 6)) / 120))});
const colorFn = (h, x, z) => h > 8 ? '#2c4a30' : (((Math.floor(x * 0.3) + Math.floor(z * 0.3)) & 1) ? '#27422b' : '#1f3a26');
export const Land = () => <Terrain height={height} size={230} seg={90} colorFn={colorFn} center={[0, -30]} jitter={0.2} />;
export const Pines = ({count = 120, seed = 5, frame = 0}) => {
  const P = useMemo(() => { const r = rng(seed); const o = []; let n = 0;
    while (o.length < count && n++ < 4000) { const x = -90 + r() * 180, z = -90 + r() * 96; if (Math.abs(x) < 7 && z > -14) continue; if (Math.abs(x) < 4 && z > -34 && z < -16) continue; o.push({x, z, h: height(x, z), s: 1.4 + r() * 1.6, k: r()}); } return o; }, [count, seed]);
  return <group>{P.map((p, i) => <Tree key={i} position={[p.x, p.h - 0.1, p.z]} s={p.s} kind="pine" color={p.k > 0.5 ? '#16301f' : '#1d3a26'} seed={i} frame={frame} />)}</group>;
};
/** THE FIGURE: ~10 ft (scale 1 = 3 m), dark pointed hood, round glowing red face, wide skirt-like body, glow pulse */
export const Figure = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0, glow = 1}) => {
  const pulse = 0.75 + 0.25 * Math.sin(frame * 0.35);
  return <group position={[position[0], position[1] + Math.sin(frame * 0.1) * 0.08, position[2]]} rotation={[0, rotation, 0]} scale={scale}>
    <mesh position={[0, 1.0, 0]}><coneGeometry args={[0.95, 2.0, 7]} /><meshLambertMaterial color="#1a1c22" flatShading /></mesh>
    <mesh position={[0, 2.5, 0]}><cylinderGeometry args={[0.32, 0.5, 1.0, 7]} /><meshLambertMaterial color="#202228" flatShading /></mesh>
    <mesh position={[0, 3.35, 0]}><coneGeometry args={[0.7, 1.5, 6]} /><meshLambertMaterial color="#14161b" flatShading /></mesh>
    <mesh position={[0, 3.0, 0.32]}><sphereGeometry args={[0.46, 12, 10]} /><meshBasicMaterial color="#ff2a1c" toneMapped={false} /></mesh>
    <Glow position={[0, 3.0, 0.5]} size={5 * glow * pulse} color="#ff2a18" opacity={0.85} />
    <Bx p={[-0.55, 2.2, 0.45]} s={[0.12, 0.12, 0.9]} c="#1a1c22" r={[0.5, 0, 0]} /><Bx p={[0.55, 2.2, 0.45]} s={[0.12, 0.12, 0.9]} c="#1a1c22" r={[0.5, 0, 0]} />
  </group>; };
export const Farm = ({position = [-14, 0, -6]}) => <group position={[position[0], height(position[0], position[2]) - 0.1, position[2]]}>
  <Building position={[0, 0, 0]} rotation={0.3} w={5} d={4} h={3} roof={2} color="#6a3a2a" roofColor="#2a2a30" lit={1} litSeed={2} frame={0} />
  <Bx p={[7, 1.4, 1]} s={[4, 2.8, 5]} c="#7a2c24" /><Bx p={[7, 3.2, 1]} s={[4.2, 0.5, 5.2]} c="#2a2a2a" />
  <Cy p={[11, 2.2, 0]} a={[0.9, 0.9, 4.4, 8]} c="#9a9a96" /></group>;
export const Meteor = ({position = [0, 0, 0], dir = [1, -0.5, 0], len = 14, size = 1.6, color = '#cfe8ff'}) => { const d = new THREE.Vector3(...dir).normalize();
  return <group>{Array.from({length: 14}, (_, i) => <Glow key={i} position={[position[0] - d.x * len * i / 14, position[1] - d.y * len * i / 14, position[2] - d.z * len * i / 14]} size={size * (1 - i / 15) * (i === 0 ? 1.3 : 1)} color={i < 3 ? '#ffffff' : color} opacity={1 - i / 14} />)}</group>; };
/** flashlight beam cone from p along dir */
export const Beam = ({position, dir = [0, 0, -1], length = 20, radius = 3, opacity = 0.35}) => {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...dir).normalize()), [dir[0], dir[1], dir[2]]);
  return <group position={position} quaternion={q}><mesh position={[0, -length / 2, 0]}><coneGeometry args={[radius, length, 14, 1, true]} /><meshBasicMaterial color="#ffd89a" transparent opacity={opacity} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} /></mesh><Glow position={[0, 0, 0]} size={2.4} color="#fff0c0" opacity={0.9} /></group>; };
/** barn owl: round white face, brown body, spread wings */
export const Owl = ({position = [0, 0, 0], rotation = 0, scale = 1, flap = 0}) => <group position={position} rotation={[0, rotation, 0]} scale={scale}>
  <mesh position={[0, 0, 0]}><sphereGeometry args={[0.7, 10, 8]} /><meshLambertMaterial color="#b8905a" flatShading /></mesh>
  <mesh position={[0, 0.7, 0.3]}><sphereGeometry args={[0.55, 10, 8]} /><meshLambertMaterial color="#f4ecdc" flatShading /></mesh>
  <mesh position={[-0.2, 0.8, 0.75]}><sphereGeometry args={[0.1, 6, 6]} /><meshBasicMaterial color="#111" /></mesh><mesh position={[0.2, 0.8, 0.75]}><sphereGeometry args={[0.1, 6, 6]} /><meshBasicMaterial color="#111" /></mesh>
  <Bx p={[-1.3, 0.1, 0]} s={[1.6, 0.12, 0.8]} c="#a07a48" r={[0, 0, 0.3 + flap]} /><Bx p={[1.3, 0.1, 0]} s={[1.6, 0.12, 0.8]} c="#a07a48" r={[0, 0, -0.3 - flap]} /></group>;
