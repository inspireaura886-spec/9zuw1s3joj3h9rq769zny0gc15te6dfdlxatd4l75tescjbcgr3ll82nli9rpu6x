// Woolpit, Suffolk, 12th c.: wheat fields, wolf pit, thatched cottages, church, interiors, props. Deterministic.
import {Terrain, makeHeight, Tree, Building, rng, fbm, clamp01, softTexture} from '../../kit/index.js';

const PIT = [0, -4];
export const height = makeHeight({seed: 1189, amp: 0.55, freq: 0.05, shape: (x, z, h) => 0.15 + h * 0.7 - 1.7 * Math.exp(-(((x - PIT[0]) / 2.1) ** 2 + ((z - PIT[1]) / 2.1) ** 2))});
const colorFn = (h, x, z) => { const d = Math.hypot(x - PIT[0], z - PIT[1]); if (d < 2.6) return '#2a2218'; const n = fbm(x * 0.25, z * 0.25, 5, 2); return n > 0.1 ? '#d9b84e' : n > -0.1 ? '#c9a548' : '#8fa04a'; };
export const Fields = ({tint = '#ffffff'}) => <Terrain height={height} size={150} seg={90} colorFn={colorFn} tint={tint} center={[0, 0]} jitter={0.3} />;

const TUFTS = (() => { const r = rng(31); return Array.from({length: 230}, () => { let x, z; do { x = (r() - 0.5) * 56; z = (r() - 0.5) * 46 - 3; } while (Math.hypot(x - PIT[0], z - PIT[1]) < 3.4); return {x, z, s: 0.7 + r() * 0.7, c: ['#d8b24a', '#e2c35c', '#c49a3c'][Math.floor(r() * 3)]}; }); })();
export const Wheat = ({frame = 0, cut = 0}) => <group>{TUFTS.map((t, i) => { const sw = Math.sin(frame * 0.07 + i * 0.7) * 0.07; const low = cut && (i % 5 < cut * 5);
  return <group key={i} position={[t.x, height(t.x, t.z), t.z]} rotation={[0, i, sw]} scale={low ? [1, 0.25, 1] : 1}>
    <mesh position={[0, 0.5 * t.s, 0]}><cylinderGeometry args={[0.02, 0.03, 1.0 * t.s, 4]} /><meshLambertMaterial color="#b89a40" flatShading /></mesh>
    <mesh position={[0, 1.05 * t.s, 0]}><coneGeometry args={[0.1, 0.4, 4]} /><meshLambertMaterial color={t.c} flatShading /></mesh></group>; })}</group>;

const Bx = ({p, s, c, r}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><meshLambertMaterial color={c} flatShading /></mesh>;
const Glow = ({p, s = 2, c = '#ffb050', o = 0.7}) => <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={softTexture()} color={c} transparent opacity={o} depthWrite={false} blending={2} fog={false} /></sprite>;
export {Bx, Glow};

export const WolfPit = ({frame = 0}) => { const [x, z] = PIT; const y = height(x, z);
  return <group>
    {Array.from({length: 14}, (_, i) => { const a = i / 14 * 6.283; return <Bx key={i} p={[x + Math.cos(a) * 2.5, height(x + Math.cos(a) * 2.5, z + Math.sin(a) * 2.5) + 0.3, z + Math.sin(a) * 2.5]} s={[0.1, 0.9, 0.1]} c="#5a4228" r={[Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]} />; })}
    <mesh position={[x, y + 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.5, 10]} /><meshBasicMaterial color="#05060a" /></mesh>
    <Glow p={[x, y + 0.5, z]} s={3.5} c="#7aff90" o={0.12 + 0.05 * Math.sin(frame * 0.1)} /></group>; };

export const Cottage = ({x, z, rot = 0, s = 1, lit = 0, frame = 0}) => <Building position={[x, height(x, z), z]} rotation={rot} w={3.2} d={2.6} h={1.9} roof={1.5} color="#d8c39a" roofColor="#a8863a" lit={lit} frame={frame} scale={s} />;
export const Church = ({x, z, rot = 0}) => { const y = height(x, z); return <group position={[x, y, z]} rotation={[0, rot, 0]}>
  <Bx p={[0, 1.4, 0]} s={[3.2, 2.8, 6]} c="#bdb7a6" /><mesh position={[0, 3.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[1.5, 1.5, 6, 3]} /><meshLambertMaterial color="#6a5a48" flatShading /></mesh>
  <Bx p={[0, 3.2, 3.8]} s={[2, 6.4, 2]} c="#c8c2b0" /><mesh position={[0, 7.4, 3.8]}><coneGeometry args={[1.5, 2, 4]} /><meshLambertMaterial color="#5a5048" flatShading /></mesh>
  <Bx p={[0, 5.6, 4.85]} s={[0.7, 1, 0.1]} c="#1a1410" /></group>; };
export const Smokes = ({frame = 0, x, z}) => <group>{[0, 1, 2, 3].map((i) => { const k = ((frame * 0.02 + i * 0.25) % 1); return <mesh key={i} position={[x + k * 0.8, height(x, z) + 2.6 + k * 3, z]} scale={0.3 + k * 0.7}><icosahedronGeometry args={[0.5, 0]} /><meshBasicMaterial color="#d8d8d8" transparent opacity={0.5 * (1 - k)} depthWrite={false} /></mesh>; })}</group>;
export const Village = ({frame = 0, lit = 0}) => <group>
  {[[-9, -9, 0.3], [-14, -4, -0.5], [10, -8, -0.2], [14, -2, 0.7], [-7, -16, 0.1], [6, -15, 0.4]].map(([x, z, r], i) => <Cottage key={i} x={x} z={z} rot={r} lit={lit} frame={frame} />)}
  <Church x={-3} z={-22} rot={0.1} />{[[-9, -9], [10, -8]].map(([x, z], i) => <Smokes key={i} frame={frame + i * 20} x={x} z={z} />)}
  {[[-18, 4], [18, 3], [-20, -10], [20, -12], [3, -26], [-12, -26]].map(([x, z], i) => <Tree key={i} position={[x, height(x, z), z]} s={1.5 + (i % 3) * 0.3} color="#5c7a32" seed={i} frame={frame} />)}</group>;

// interiors
export const Hall = ({frame = 0, fire = true}) => { const fl = 1 + 0.2 * Math.sin(frame * 0.9) + 0.1 * Math.sin(frame * 2.3); return <group>
  <Bx p={[0, -0.1, 0]} s={[16, 0.2, 14]} c="#5a4228" /><Bx p={[0, 3, -6]} s={[16, 6, 0.3]} c="#7a6446" /><Bx p={[-7, 3, 0]} s={[0.3, 6, 14]} c="#6a5438" /><Bx p={[7, 3, 0]} s={[0.3, 6, 14]} c="#6a5438" />
  {[-4, 0, 4].map((x) => <Bx key={x} p={[x, 5.7, 0]} s={[0.35, 0.35, 14]} c="#3a2a18" />)}
  {fire && <><pointLight position={[0, 1.4, -4.4]} color="#ff9a40" intensity={9 * fl} distance={14} decay={1.5} /><Glow p={[0, 0.9, -4.8]} s={4} c="#ff9a3a" o={0.5 * fl} /></>}
  {[-5.8, 5.8].map((x, i) => <group key={i} position={[x, 3.2, -5.6]}><Bx p={[0, 0, 0]} s={[0.12, 0.8, 0.12]} c="#3a2a18" /><mesh position={[0, 0.5, 0]} scale={[0.14, 0.3 * (1 + 0.2 * Math.sin(frame * 1.1 + i)), 0.14]}><coneGeometry args={[1, 1, 5]} /><meshBasicMaterial color="#ffb02e" toneMapped={false} /></mesh><Glow p={[0, 0.6, 0]} s={1.8} c="#ffa040" o={0.5} /></group>)}
</group>; };
export const Hearth = ({frame = 0}) => <group position={[0, 0, -4.8]}>
  {Array.from({length: 8}, (_, i) => { const a = i / 8 * 6.283; return <mesh key={i} position={[Math.cos(a) * 0.9, 0.25, Math.sin(a) * 0.9]}><dodecahedronGeometry args={[0.28, 0]} /><meshLambertMaterial color="#5a5650" flatShading /></mesh>; })}
  {[0, 1, 2].map((i) => <mesh key={i} position={[(i - 1) * 0.15, 0.7 + Math.sin(frame * 0.4 + i) * 0.08, 0]} scale={[0.35, 0.9 + 0.3 * Math.sin(frame * 0.7 + i * 2), 0.35]}><coneGeometry args={[1, 1, 5]} /><meshBasicMaterial color={['#ff7a1a', '#ffb02e', '#ffe08a'][i]} toneMapped={false} /></mesh>)}</group>;
export const Table = ({x = 0, z = 0, bread = true, beans = false}) => <group position={[x, 0, z]}>
  <Bx p={[0, 0.95, 0]} s={[3.2, 0.14, 1.5]} c="#6a4a28" />{[[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]].map(([a, b], i) => <Bx key={i} p={[a, 0.45, b]} s={[0.14, 0.9, 0.14]} c="#4a3218" />)}
  {bread && <><Bx p={[-0.9, 1.15, 0]} s={[0.7, 0.3, 0.45]} c="#c8964a" /><Bx p={[-0.2, 1.08, 0.2]} s={[0.5, 0.16, 0.5]} c="#e8d8a0" /><mesh position={[0.5, 1.1, -0.1]}><cylinderGeometry args={[0.3, 0.22, 0.2, 7]} /><meshLambertMaterial color="#8a6a4a" flatShading /></mesh></>}
  {beans && <group position={[0.2, 1.05, 0]}><mesh><cylinderGeometry args={[0.5, 0.3, 0.3, 8]} /><meshLambertMaterial color="#6a4a28" flatShading /></mesh>{Array.from({length: 14}, (_, i) => <mesh key={i} position={[Math.cos(i * 1.7) * 0.28, 0.2 + (i % 3) * 0.04, Math.sin(i * 1.7) * 0.28]} scale={[1, 0.7, 1.3]}><icosahedronGeometry args={[0.1, 0]} /><meshLambertMaterial color={i % 2 ? '#7aa83a' : '#5a8a2e'} flatShading /></mesh>)}</group>}
</group>;
export const BeanPlants = ({frame = 0, x = 0, z = 0, n = 6}) => <group position={[x, 0, z]}>{Array.from({length: n}, (_, i) => <group key={i} position={[(i - n / 2) * 0.7, 0, Math.sin(i * 2) * 0.5]} rotation={[0, 0, Math.sin(frame * 0.06 + i) * 0.04]}>
  <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.03, 0.05, 1.6, 4]} /><meshLambertMaterial color="#4a7a2a" flatShading /></mesh>
  {[0.5, 0.9, 1.3].map((y, k) => <group key={k}><Bx p={[0.14, y, 0]} s={[0.3, 0.05, 0.12]} c="#5a9a34" r={[0, 0, 0.3]} /><mesh position={[-0.1, y - 0.1, 0.06]} rotation={[0, 0, 0.1]} scale={[0.07, 0.34, 0.07]}><capsuleGeometry args={[1, 1, 3, 5]} /><meshLambertMaterial color="#7ab036" flatShading /></mesh></group>)}</group>)}</group>;
export const Bed = ({x = 0, z = 0}) => <group position={[x, 0, z]}><Bx p={[0, 0.2, 0]} s={[1.0, 0.4, 2.4]} c="#6a4a28" /><Bx p={[0, 0.45, 0]} s={[0.9, 0.16, 2.3]} c="#d8c080" /><Bx p={[0, 0.58, -0.8]} s={[0.6, 0.14, 0.4]} c="#e8e0cc" /></group>;
export const Desk = ({x = 0, z = 0, frame = 0}) => <group position={[x, 0, z]}><Bx p={[0, 0.95, 0]} s={[2.6, 0.14, 1.3]} c="#5a3a1c" />{[[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].map(([a, b], i) => <Bx key={i} p={[a, 0.45, b]} s={[0.14, 0.9, 0.14]} c="#3a2410" />)}
  <Bx p={[0, 1.04, 0.05]} s={[1.1, 0.04, 0.8]} c="#efe2bd" r={[0, 0.15, 0]} /><Bx p={[-0.9, 1.1, -0.3]} s={[0.1, 0.16, 0.1]} c="#e8e0c0" />
  <mesh position={[-0.9, 1.3 + Math.sin(frame * 0.8) * 0.01, -0.3]} scale={[0.08, 0.2 * (1 + 0.2 * Math.sin(frame * 0.9)), 0.08]}><coneGeometry args={[1, 1, 5]} /><meshBasicMaterial color="#ffb02e" toneMapped={false} /></mesh><Glow p={[-0.9, 1.35, -0.3]} s={1.4} /></group>;
export const Cave = () => <group position={[0, 0, -6]}>
  {[[-3.2, 1.6, 0, 2.4], [3.2, 1.6, 0, 2.4], [-2.2, 3.4, 0, 2.0], [2.2, 3.4, 0, 2.0], [0, 4.2, 0, 2.2], [-4.6, 0.9, 1, 2], [4.6, 0.9, 1, 2]].map(([x, y, z, s], i) => <mesh key={i} position={[x, y, z]} rotation={[i, i * 2, 0]} scale={s}><dodecahedronGeometry args={[1, 0]} /><meshLambertMaterial color={i % 2 ? '#5a5a5e' : '#4a4a50'} flatShading /></mesh>)}
  <mesh position={[0, 1.7, -0.6]}><planeGeometry args={[3.6, 3.4]} /><meshBasicMaterial color="#8fd8a8" /></mesh><Glow p={[0, 1.7, 0.2]} s={6} c="#a8ffc0" o={0.4} /></group>;
export const Bell = ({x = 0, z = 0, swing = 0}) => <group position={[x, 0, z]}><Bx p={[-0.9, 2.2, 0]} s={[0.15, 4.4, 0.15]} c="#4a3218" /><Bx p={[0.9, 2.2, 0]} s={[0.15, 4.4, 0.15]} c="#4a3218" /><Bx p={[0, 4.35, 0]} s={[2.1, 0.18, 0.18]} c="#4a3218" />
  <group position={[0, 4.25, 0]} rotation={[0, 0, swing]}><mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.2, 0.8, 1.2, 8]} /><meshStandardMaterial color="#d8a838" metalness={0.6} roughness={0.35} flatShading /></mesh><mesh position={[0, -1.55, 0]}><icosahedronGeometry args={[0.16, 0]} /><meshLambertMaterial color="#2a2018" /></mesh></group></group>;
export const BookOpen = ({frame = 0}) => <group rotation={[-0.25, 0, 0]}>
  <Bx p={[-0.95, 0, 0]} s={[1.8, 0.1, 2.4]} c="#efe2bd" r={[0, 0, 0.18]} /><Bx p={[0.95, 0, 0]} s={[1.8, 0.1, 2.4]} c="#efe2bd" r={[0, 0, -0.18]} /><Bx p={[0, -0.12, 0]} s={[4, 0.1, 2.6]} c="#6a2a22" />
  {Array.from({length: 5}, (_, i) => <Bx key={i} p={[-1.2 + (i % 2) * 2.4, 0.12, -0.8 + (i % 3) * 0.7]} s={[1.2, 0.02, 0.06]} c="#5a4020" />)}<Glow p={[0, 0.7, 0]} s={6} c="#ffd870" o={0.55 + 0.1 * Math.sin(frame * 0.2)} /></group>;
export const Mist = ({frame = 0}) => <group>{[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.5 + i * 0.5, -6 - i * 4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 14]} /><meshBasicMaterial color="#9aff9a" transparent opacity={0.05 + 0.02 * Math.sin(frame * 0.05 + i)} depthWrite={false} /></mesh>)}</group>;
export const hexMix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp01(k)).toString(16).padStart(2, '0')).join(''); };
