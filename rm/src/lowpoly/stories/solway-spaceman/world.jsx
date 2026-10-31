// Solway Firth Spaceman (Burgh Marsh 1964) parts: sage salt marsh + firth water, reeds, the white figure / woman (expo bloom), 1960s car, camera, film strip, lab light table, shelves, rocket pad.
import {useMemo} from 'react';
import {Terrain, makeHeight, rng, smoothstep, Glow, Ocean} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};
export {Desk} from '../ghost-rockets/world.jsx';

export const height = makeHeight({seed: 1964, amp: 0.18, freq: 0.09, shape: (x, z, h) => { const w = smoothstep(-34, -52, z); return h * (1 - w) - 1.6 * w + 0.1 * Math.sin(x * 0.2 + z * 0.1); }});
const colorFn = (h, x, z) => h < -0.4 ? '#3a4a46' : ((Math.floor(x * 0.4) + Math.floor(z * 0.4)) & 1) ? '#8a9560' : '#7b8a58';
export const Marsh = () => <Terrain height={height} size={200} seg={80} colorFn={colorFn} center={[0, -30]} jitter={0.15} />;
export const Firth = ({frame = 0}) => <Ocean position={[0, -0.9, -75]} size={[220, 70]} seg={36} frame={frame} amp={0.05} choppy={0.6} deep="#2a3e50" face="#5d7d95" foam="#b8cad4" foamAt={0.98} />;
export const Reeds = ({count = 140, seed = 3, area = [-40, 40, -30, 12]}) => {
  const P = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => { const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]); return {x, z, h: height(x, z), s: 0.7 + r() * 0.9, k: r()}; }); }, [count, seed]);
  return <group>{P.map((p, i) => <group key={i} position={[p.x, p.h, p.z]} rotation={[0, i, 0.05 * Math.sin(i)]}><Cy p={[0, p.s * 0.5, 0]} a={[0.02, 0.05, p.s, 4]} c={p.k > 0.5 ? '#a8a870' : '#8a8a5a'} /></group>)}</group>;
};
/** the white-suited "spaceman" (expo 0 = suit) or Annie from behind (woman=true: dress blown out to white by expo 0..1) */
export const Fig = ({position = [0, 0, 0], rotation = 0, scale = 1, woman = false, expo = 1, glow = 0.5}) => {
  const dress = woman ? (expo > 0.5 ? '#ffffff' : '#7a98c8') : '#f4f6fa';
  return <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <Bx p={[-0.18, 0.55, 0]} s={[0.22, 1.1, 0.26]} c={woman ? '#d8b49a' : '#eef0f4'} e={woman ? undefined : '#ffffff'} ei={0.5} />
    <Bx p={[0.18, 0.55, 0]} s={[0.22, 1.1, 0.26]} c={woman ? '#d8b49a' : '#eef0f4'} e={woman ? undefined : '#ffffff'} ei={0.5} />
    <mesh position={[0, 1.65, 0]}><cylinderGeometry args={[woman ? 0.5 : 0.36, woman ? 0.2 : 0.36, 1.2, 8]} /><meshLambertMaterial color={dress} emissive={dress} emissiveIntensity={woman ? 0.2 + expo * 1.0 : 0.9} flatShading /></mesh>
    <Bx p={[-0.55, 1.7, 0]} s={[0.2, 0.8, 0.22]} c={dress} e={dress} ei={woman ? 0.2 + expo : 0.8} r={[0, 0, 0.3]} /><Bx p={[0.55, 1.7, 0]} s={[0.2, 0.8, 0.22]} c={dress} e={dress} ei={woman ? 0.2 + expo : 0.8} r={[0, 0, -0.3]} />
    <mesh position={[0, 2.5, 0]}><sphereGeometry args={[woman ? 0.3 : 0.38, 10, 8]} /><meshLambertMaterial color={woman ? '#16100c' : '#f4f6fa'} flatShading emissive={woman ? '#000' : '#fff'} emissiveIntensity={woman ? 0 : 0.7} /></mesh>
    {!woman && <Bx p={[0, 2.5, 0.28]} s={[0.5, 0.22, 0.2]} c="#0a0c10" />}
    {!woman && <Glow position={[0, 1.6, 0.4]} size={4.5} color="#ffffff" opacity={glow} />}
    {woman && expo > 0.5 && <Glow position={[0, 1.6, 0]} size={6 * expo} color="#ffffff" opacity={0.5 * expo} />}
  </group>;
};
export const Car = ({position = [0, 0, 0], rotation = 0, scale = 1, color = '#2a2e36'}) => <group position={position} rotation={[0, rotation, 0]} scale={scale}>
  <Bx p={[0, 0.7, 0]} s={[4.2, 0.9, 1.9]} c={color} /><Bx p={[-0.2, 1.4, 0]} s={[2.2, 0.7, 1.7]} c={color} /><Bx p={[-0.2, 1.42, 0]} s={[2.0, 0.5, 1.75]} c="#9ab4c4" />
  {[[-1.3, 0.35, 1], [1.3, 0.35, 1], [-1.3, 0.35, -1], [1.3, 0.35, -1]].map((p, i) => <Cy key={i} p={p} a={[0.38, 0.38, 0.3, 10]} c="#141414" r={[Math.PI / 2, 0, 0]} />)}
  <Bx p={[2.12, 0.75, 0.6]} s={[0.1, 0.25, 0.3]} c="#fff2c0" e="#fff2c0" ei={0.8} /><Bx p={[2.12, 0.75, -0.6]} s={[0.1, 0.25, 0.3]} c="#fff2c0" e="#fff2c0" ei={0.8} />
</group>;
export const Camera = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[0.9, 0.55, 0.4]} c="#1c1c20" /><Bx p={[0, 0.34, 0]} s={[0.4, 0.14, 0.3]} c="#9a9aa2" /><Cy p={[0, 0, 0.35]} a={[0.2, 0.22, 0.3, 10]} c="#2a2a30" r={[Math.PI / 2, 0, 0]} /><mesh position={[0, 0, 0.52]}><circleGeometry args={[0.15, 10]} /><meshBasicMaterial color="#8ab8e8" toneMapped={false} /></mesh>
</group>;
export const FilmStrip = ({position = [0, 0, 0], rotation = [0, 0, 0], lit = 1, frames = 3}) => <group position={position} rotation={rotation}>
  <Bx p={[0, 0, 0]} s={[frames * 2.0 + 0.6, 2.2, 0.08]} c="#14100c" />
  {Array.from({length: frames}, (_, i) => <Bx key={i} p={[(i - (frames - 1) / 2) * 2.0, 0, 0.06]} s={[1.7, 1.6, 0.05]} c={i === 1 ? '#fffbe8' : '#c8d0a0'} e={i === lit ? '#fff4c0' : '#667'} ei={i === lit ? 1.3 : 0.4} />)}
  {Array.from({length: frames * 5}, (_, i) => <Bx key={'h' + i} p={[-frames + 0.3 + i * 0.4, 1.0, 0.08]} s={[0.14, 0.12, 0.02]} c="#e8e8e0" basic />)}
</group>;
export const LightTable = ({frame = 0, ei = 1.1, glow = 0.3}) => <group>
  <Bx p={[0, 0, 0]} s={[12, 0.5, 6]} c="#3a3a40" /><Bx p={[0, 0.3, 0]} s={[8, 0.1, 4.4]} c="#fffbe8" e="#fff8d8" ei={ei} />
  <Glow position={[0, 1.2, 0]} size={12} color="#fff8d8" opacity={glow} />
</group>;
export const Shelves = ({count = 3}) => <group>
  {Array.from({length: count}, (_, r) => <group key={r}><Bx p={[0, r * 2.4, 0]} s={[12, 0.2, 2.2]} c="#5a4630" />
    {Array.from({length: 14}, (_, i) => <Bx key={i} p={[-5.6 + i * 0.85, r * 2.4 + 0.75, 0]} s={[0.6, 1.3 - (i % 3) * 0.12, 1.6]} c={['#a8885a', '#7a8a9a', '#b86a4a', '#d8d0b8'][i % 4]} />)}</group>)}
  <Bx p={[-6, 2.4, 0]} s={[0.2, 7, 2.2]} c="#4a3a28" /><Bx p={[6, 2.4, 0]} s={[0.2, 7, 2.2]} c="#4a3a28" />
</group>;
export const Pad = () => <group>
  <Bx p={[0, 0, 0]} s={[10, 0.4, 10]} c="#8a8478" /><Cy p={[0, 6, 0]} a={[0.9, 1.1, 12, 10]} c="#e8e8ea" e="#cfd0d6" ei={0.3} /><mesh position={[0, 12.8, 0]}><coneGeometry args={[0.9, 1.8, 10]} /><meshLambertMaterial color="#c8c8d0" flatShading /></mesh>
  <Bx p={[0, 1.8, 0.6]} s={[0.9, 3.6, 0.9]} c="#d8302a" />{[[-2.6, 6], [2.6, 6]].map(([x, y], i) => <Bx key={i} p={[x, y, -1.2]} s={[0.5, 12, 0.5]} c="#6a6a72" r={[0, 0, x > 0 ? -0.05 : 0.05]} />)}
</group>;
export const Dunes = () => <group>{Array.from({length: 18}, (_, i) => <mesh key={i} position={[-60 + i * 7, -2.5, -25 - (i % 4) * 9]} scale={[8, 3 + (i % 3), 6]}><icosahedronGeometry args={[1, 1]} /><meshLambertMaterial color={i % 2 ? '#c8683a' : '#b85a30'} flatShading /></mesh>)}<Bx p={[0, -1.1, -10]} s={[200, 0.2, 120]} c="#c4693a" /></group>;
