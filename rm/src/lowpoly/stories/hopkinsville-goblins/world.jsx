// Kelly-Hopkinsville 1955 diorama parts: night farm ground, creature (silver, big yellow eyes, long arms), great horned owl,
// interior wall-with-window, bed, wall clock, road. Deterministic (no clocks).
import {useMemo} from 'react';
import * as THREE from 'three';
import {Terrain, makeHeight} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};

export const height = makeHeight({seed: 55, amp: 0.25, freq: 0.05, shape: (x, z, h) => h * Math.min(1, Math.hypot(x, z) / 10)});
const grass = (h, x, z) => ((Math.floor(x * 0.4) + Math.floor(z * 0.4)) % 2 ? '#3e5a3a' : '#35522f');
export const Field = () => <Terrain height={height} size={200} seg={56} colorFn={grass} center={[0, 0]} jitter={0.1} />;
export const Road = ({z = 14, len = 120, w = 3.2}) => <group><Bx p={[0, 0.04, z]} s={[len, 0.06, w]} c="#2a2c34" /><Bx p={[0, 0.075, z]} s={[len, 0.01, 0.12]} c="#c8b878" /></group>;

const eyeMat = (i = 2.6, c = '#ffe45a') => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={i} toneMapped={false} />;

/** the visitor: silver, ~1 m tall, big head, huge eyes, pointed ears, long thin arms, spindly legs. arms = raise 0..1, wiggle = frame */
export const Creature = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0, arms = 0.7, eyes = 2.6, opacity = 1, lean = 0, glow = 0}) => {
  const w = Math.sin(frame * 0.35) * 0.25; const o = opacity;
  const M = ({c, ...p}) => <meshLambertMaterial color={c} flatShading transparent={o < 1} opacity={o} {...p} />;
  return <group position={position} rotation={[lean, rotation, 0]} scale={scale}>
    <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.46, 0.56, 0.3]} /><M c="#7e8c98" /></mesh>
    <mesh position={[0, 1.4, 0.02]} scale={[1.15, 1, 0.95]}><icosahedronGeometry args={[0.36, 1]} /><M c="#8e9ca8" /></mesh>
    {[-0.17, 0.17].map((x, i) => <mesh key={i} position={[x, 1.43, 0.3]} scale={[1.0, 1.45, 0.5]}><sphereGeometry args={[0.13, 10, 8]} />{eyeMat(eyes)}</mesh>)}
    {[-1, 1].map((s, i) => <mesh key={'e' + i} position={[s * 0.44, 1.62, 0]} rotation={[0, 0, -s * 1.2]}><coneGeometry args={[0.11, 0.42, 4]} /><M c="#8896a2" /></mesh>)}
    {[-1, 1].map((s, i) => <group key={'a' + i} position={[s * 0.3, 1.05, 0]} rotation={[0, 0, s * (0.35 + arms * 1.9) + s * w * arms]}>
      <mesh position={[0, -0.5, 0]}><boxGeometry args={[0.1, 1.05, 0.1]} /><M c="#8d9ba7" /></mesh>
      <mesh position={[0, -1.05, 0.02]}><boxGeometry args={[0.2, 0.16, 0.1]} /><M c="#7d8b97" /></mesh></group>)}
    {[-0.12, 0.12].map((x, i) => <mesh key={'l' + i} position={[x, 0.3, 0]} rotation={[Math.sin(frame * 0.2 + i * 3) * 0.2, 0, 0]}><boxGeometry args={[0.1, 0.62, 0.1]} /><M c="#8896a2" /></mesh>)}
    {glow > 0 && <pointLight position={[0, 1.2, 0.6]} color="#c8ff90" intensity={glow * 3} distance={5} />}
  </group>;
};

/** great horned owl: 0.6 m, ear tufts, yellow eyes, head turn (rad), wings spread 0..1, scale 1 = about 0.9 units */
export const Owl = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0, head = 0, wings = 0, eyes = 2.2}) => {
  const flap = wings > 0 ? Math.sin(frame * 0.5) * 0.35 : 0;
  return <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <mesh position={[0, 0.5, 0]} scale={[0.95, 1.25, 0.85]}><icosahedronGeometry args={[0.36, 1]} /><meshLambertMaterial color="#7a5a3c" flatShading /></mesh>
    <mesh position={[0, 0.44, 0.22]} scale={[0.7, 0.9, 0.3]}><icosahedronGeometry args={[0.3, 1]} /><meshLambertMaterial color="#d8c8a4" flatShading /></mesh>
    <group position={[0, 0.98, 0]} rotation={[0, head, 0]}>
      <mesh scale={[1.2, 0.95, 0.95]}><icosahedronGeometry args={[0.3, 1]} /><meshLambertMaterial color="#8a6a48" flatShading /></mesh>
      <mesh position={[0, -0.02, 0.2]} scale={[1.7, 1.4, 0.35]}><sphereGeometry args={[0.2, 10, 8]} /><meshLambertMaterial color="#d4c4a0" flatShading /></mesh>
      {[-0.1, 0.1].map((x, i) => <mesh key={i} position={[x, 0.03, 0.27]}><sphereGeometry args={[0.075, 10, 8]} />{eyeMat(eyes, '#ffd23a')}</mesh>)}
      {[-0.1, 0.1].map((x, i) => <mesh key={'p' + i} position={[x, 0.03, 0.335]}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color="#080808" /></mesh>)}
      <mesh position={[0, -0.06, 0.34]} rotation={[0.5, 0, 0]}><coneGeometry args={[0.04, 0.1, 4]} /><meshLambertMaterial color="#3a3028" flatShading /></mesh>
      {[-1, 1].map((s, i) => <mesh key={'t' + i} position={[s * 0.2, 0.3, 0]} rotation={[0, 0, -s * 0.3]}><coneGeometry args={[0.07, 0.3, 4]} /><meshLambertMaterial color="#5a4028" flatShading /></mesh>)}
    </group>
    {[-1, 1].map((s, i) => <group key={'w' + i} position={[s * 0.3, 0.6, 0]} rotation={[0, 0, s * (-0.15 - wings * (1.2 + flap))]}>
      <mesh position={[s * (0.06 + 0.4 * wings), -0.12, 0]} scale={[0.4 + wings * 2.0, 1, 1]}><boxGeometry args={[0.7, 0.62, 0.1]} /><meshLambertMaterial color="#6a4a30" flatShading /></mesh></group>)}
    {[-0.12, 0.12].map((x, i) => <mesh key={'f' + i} position={[x, 0.08, 0.05]}><boxGeometry args={[0.1, 0.16, 0.14]} /><meshLambertMaterial color="#3a3028" flatShading /></mesh>)}
  </group>;
};

/** interior: back wall (z=-3) with a window hole, plank floor, side walls, curtains, lamp. winLit = outside tint */
export const Inside = ({lamp = 1, broken = 0, curtains = true, children, wallColor = '#8a6e4c'}) => <>
  <Bx p={[0, -0.05, 0]} s={[10, 0.1, 9]} c="#6a4c30" /><Bx p={[0, 4.2, 0]} s={[10, 0.2, 9]} c="#5a4228" />
  <Bx p={[-5, 2.1, 0]} s={[0.2, 4.2, 9]} c={wallColor} /><Bx p={[5, 2.1, 0]} s={[0.2, 4.2, 9]} c={wallColor} />
  <Bx p={[-3.2, 2.1, -3]} s={[3.6, 4.2, 0.2]} c={wallColor} /><Bx p={[3.2, 2.1, -3]} s={[3.6, 4.2, 0.2]} c={wallColor} />
  <Bx p={[0, 0.55, -3]} s={[2.8, 1.1, 0.2]} c={wallColor} /><Bx p={[0, 3.5, -3]} s={[2.8, 1.4, 0.2]} c={wallColor} />
  <Bx p={[0, 1.2, -2.86]} s={[2.9, 0.1, 0.16]} c="#4a3420" /><Bx p={[0, 2.8, -2.86]} s={[2.9, 0.1, 0.16]} c="#4a3420" />
  <Bx p={[-1.4, 2.0, -2.86]} s={[0.1, 1.7, 0.16]} c="#4a3420" /><Bx p={[1.4, 2.0, -2.86]} s={[0.1, 1.7, 0.16]} c="#4a3420" />
  {broken < 1 && <Bx p={[0, 2.0, -2.9]} s={[0.05, 1.6, 0.05]} c="#4a3420" />}
  {broken < 1 && <Bx p={[0, 2.0, -2.9]} s={[2.7, 0.05, 0.05]} c="#4a3420" />}
  {curtains && <><Bx p={[-1.15, 2.2, -2.7]} s={[0.55, 2.2, 0.08]} c="#9a4a40" r={[0, 0, 0.04]} /><Bx p={[1.15, 2.2, -2.7]} s={[0.55, 2.2, 0.08]} c="#9a4a40" r={[0, 0, -0.04]} /></>}
  <group position={[3.3, 0, -2]}><Bx p={[0, 0.55, 0]} s={[1.4, 0.1, 0.8]} c="#7a5a38" />{[-0.6, 0.6].map((x) => <Bx key={x} p={[x, 0.27, 0]} s={[0.1, 0.55, 0.7]} c="#5a4028" />)}
    <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.28, 0.4, 0.5, 6]} /><meshLambertMaterial color="#ffe0a0" emissive="#ffb858" emissiveIntensity={1.4 * lamp} flatShading /></mesh>
    <pointLight position={[0, 1.4, 0.3]} color="#ffc878" intensity={7 * lamp} distance={11} /></group>
  <pointLight position={[0, 3.4, 2]} color="#ffd8a0" intensity={4 * lamp} distance={12} />
  <pointLight position={[0, 2.2, -5]} color="#8aa4f0" intensity={3.5} distance={9} />
  {children}</>;

/** wall clock (face toward +z) at h:m */
export const Clock = ({position = [0, 2, 0], hour = 3, min = 30, scale = 1}) => {
  const ha = -((hour % 12) + min / 60) / 12 * Math.PI * 2, ma = -min / 60 * Math.PI * 2;
  return <group position={position} scale={scale}>
    <Cy p={[0, 0, 0]} a={[0.9, 0.9, 0.12, 20]} c="#f4efe0" r={[Math.PI / 2, 0, 0]} />
    <Cy p={[0, 0, -0.01]} a={[1.0, 1.0, 0.1, 20]} c="#2a1c10" r={[Math.PI / 2, 0, 0]} />
    {Array.from({length: 12}, (_, i) => { const a = i / 12 * Math.PI * 2; return <Bx key={i} p={[Math.sin(a) * 0.72, Math.cos(a) * 0.72, 0.08]} s={[0.07, 0.16, 0.03]} c="#1a1a1a" r={[0, 0, -a]} />; })}
    <group position={[0, 0, 0.1]} rotation={[0, 0, ha]}><Bx p={[0, 0.2, 0]} s={[0.1, 0.5, 0.04]} c="#141414" /></group>
    <group position={[0, 0, 0.13]} rotation={[0, 0, ma]}><Bx p={[0, 0.32, 0]} s={[0.07, 0.78, 0.03]} c="#d6302a" /></group>
  </group>;
};

export const Bed = ({position = [0, 0, 0], eyes = 1}) => <group position={position}>
  <Bx p={[0, 0.7, 0]} s={[2.6, 0.18, 1.8]} c="#e0d0b0" /><Bx p={[0, 0.88, 0]} s={[2.5, 0.16, 1.7]} c="#6a8ab8" />
  <Bx p={[-1.15, 0.95, 0]} s={[0.5, 0.18, 1.3]} c="#f4f0e8" />
  {[[-1.25, -0.8], [1.25, -0.8], [-1.25, 0.8], [1.25, 0.8]].map(([x, z], i) => <Bx key={i} p={[x, 0.3, z]} s={[0.14, 0.6, 0.14]} c="#5a4028" />)}
  <Bx p={[-1.35, 1.2, 0]} s={[0.1, 1.2, 1.8]} c="#5a4028" />
  {[[-0.5, 0.45, 0.35], [0.0, 0.42, 0.55], [0.55, 0.44, 0.3]].map(([x, y, z], i) => <group key={i}>
    {[-0.07, 0.07].map((d) => <mesh key={d} position={[x + d, y, z + 0.8]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#fff6d8" transparent opacity={eyes} /></mesh>)}
  </group>)}
  {[[-0.3, 0.1, 1.05], [0.7, 0.1, 1.0]].map(([x, y, z], i) => <Bx key={'s' + i} p={[x, y + 0.08, z]} s={[0.22, 0.16, 0.34]} c="#3a2a22" />)}
</group>;

/** meteor streak across the sky */
export const Meteor = ({from = [-20, 25, -30], to = [20, 10, -30], u = 0, len = 0.12}) => {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const t0 = Math.max(0, u - len), t1 = Math.min(1, u); if (u <= 0 || u >= 1 + len) return null;
  const p0 = a.clone().lerp(b, t0), p1 = a.clone().lerp(b, t1); const d = p1.clone().sub(p0); const L = d.length(); if (L < 0.01) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return <mesh position={p0.clone().add(p1).multiplyScalar(0.5).toArray()} quaternion={q}><cylinderGeometry args={[0.18, 0.02, L, 5]} /><meshBasicMaterial color="#e8f4ff" toneMapped={false} fog={false} /></mesh>;
};
