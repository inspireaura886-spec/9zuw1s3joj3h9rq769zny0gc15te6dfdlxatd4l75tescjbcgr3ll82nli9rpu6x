// Kecksburg (Dec 1965) diorama parts: fireball, six-state map table, seismograph, blue smoke, police car + tape, Geiger counter, acorn capsule, flatbed,
// NASA desk, satellite, trajectory diagram. Reuses forest Land/Pines, Hamlet, Car, Archive. Deterministic (no clocks).
import {Glow, Building} from '../../kit/index.js';
import {height as H0} from '../rendlesham-forest/world.jsx';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};
export {Land, Pines, height, Beam, Meteor, Archive} from '../rendlesham-forest/world.jsx';
export {Car} from '../solway-spaceman/world.jsx';

/** fireball: glowing head + long fading trail along a straight path from a to b, u 0..1 position of the head */
export const Fireball = ({a = [-60, 40, -40], b = [60, 8, -40], u = 0.5, size = 5, trail = 16, color = '#ffb060'}) => {
  const P = (v) => [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v, a[2] + (b[2] - a[2]) * v];
  return <group>{Array.from({length: trail}, (_, i) => { const v = u - i * 0.012; if (v < 0 || v > 1) return null;
    return <Glow key={i} position={P(v)} size={size * (1 - i / (trail + 2)) * (i === 0 ? 1.4 : 1)} color={i < 3 ? '#fff4d8' : i < 8 ? color : '#ff6a30'} opacity={Math.max(0, 1 - i / trail)} />; })}</group>;
};

const STATES = [[-2.6, 1.9, 1.6, 1.3, 'PA'], [-0.9, 1.5, 1.7, 1.6, ''], [0.8, 1.9, 1.5, 1.3, ''], [-1.6, -0.1, 1.9, 1.5, ''], [0.5, -0.1, 1.7, 1.4, ''], [2.3, 1.5, 1.5, 1.5, '']];
/** map table: six state blocks (the fireball's path states), fireball marker u 0..1 along an arc, canada block at the back */
export const MapTable = ({frame = 0, u = 0}) => <group>
  <Bx p={[0, 0, 0]} s={[11, 0.5, 8]} c="#2a2f3a" /><Bx p={[0, 0.3, 0]} s={[10.2, 0.1, 7.2]} c="#1b2a3c" />
  <Bx p={[0, 0.42, -3.0]} s={[9.4, 0.18, 1.3]} c="#6a7a8a" />
  {STATES.map(([x, z, w, d], i) => { const lit = u * 6 > i + 0.2; return <Bx key={i} p={[x, 0.42, z * 0.9 - 0.4]} s={[w - 0.12, 0.18, d - 0.12]} c={lit ? '#e8a050' : '#4a5a4a'} e={lit ? '#ff8030' : undefined} ei={0.7} />; })}
  {Array.from({length: 20}, (_, i) => { const t = i / 19; return <Bx key={i} p={[-4 + t * 8, 0.62 + Math.sin(t * Math.PI) * 0.9, 1.6 - t * 3.6]} s={[0.1, 0.1, 0.1]} c={t <= u ? '#ffd890' : '#8a8a8a'} basic />; })}
  <group position={[-4 + u * 8, 0.62 + Math.sin(u * Math.PI) * 0.9, 1.6 - u * 3.6]}><Glow position={[0, 0.1, 0]} size={2.2} color="#ffb060" opacity={0.95} /></group>
  <Glow position={[0, 3, 0]} size={12} color="#9ab8ff" opacity={0.12} />
</group>;

/** seismograph drum with paper strip; spike at spikeAt frame */
export const Seismo = ({frame = 0, spikeAt = 20}) => <group>
  <Bx p={[0, 0, 0]} s={[9, 0.5, 4]} c="#3a3a3a" /><Bx p={[0, 0.3, 0]} s={[8.4, 0.08, 3.4]} c="#e8dcb8" />
  {Array.from({length: 40}, (_, i) => { const x = -4 + i * 0.2; const k = i * 1.0 - (frame - spikeAt) * 0.45 + 12; const amp = frame < spikeAt ? 0.05 : Math.max(0.05, 1.5 * Math.exp(-Math.abs(k - 12) * 0.12));
    const h = amp * (i % 2 ? 1 : -1) * (0.6 + 0.4 * Math.sin(i * 2.7)); return <Bx key={i} p={[x, 0.4, h * 0.6]} s={[0.1, 0.05, Math.abs(h) + 0.1]} c="#1a1410" />; })}
  <Bx p={[3.8, 0.9, 0]} s={[0.12, 1.2, 0.12]} c="#555" /><Bx p={[3.8, 1.5, -0.4]} s={[0.6, 0.1, 0.1]} c="#aa2a22" />
  <Glow position={[0, 3, 1]} size={9} color="#ffe0a8" opacity={0.2} />
</group>;

/** blue smoke column rising from (position) */
export const BlueSmoke = ({position = [0, 0, 0], frame = 0, h = 10, n = 12}) => <group position={position}>
  {Array.from({length: n}, (_, i) => { const u = ((frame * 0.02 + i / n) % 1); return <Glow key={i} position={[Math.sin(u * 6 + i) * 0.7 * (1 + u), u * h, Math.cos(u * 5 + i) * 0.5]} size={1.6 + u * 4.5} color="#6aa8ff" opacity={0.65 * (1 - u)} />; })}</group>;

/** police car: Car + flashing bar */
export const LightBar = ({position = [0, 0, 0], frame = 0, scale = 1}) => { const a = Math.floor(frame / 5) % 2;
  return <group position={position} scale={scale}><Bx p={[0, 0, 0]} s={[1.2, 0.18, 0.5]} c="#222" />
    <Bx p={[-0.4, 0.12, 0]} s={[0.4, 0.12, 0.4]} c={a ? '#ff2a2a' : '#5a1010'} basic /><Bx p={[0.4, 0.12, 0]} s={[0.4, 0.12, 0.4]} c={a ? '#1a2a5a' : '#2a6aff'} basic />
    <Glow position={[a ? -0.4 : 0.4, 0.3, 0]} size={5} color={a ? '#ff2a2a' : '#2a6aff'} opacity={0.85} /></group>; };
/** rope/tape line between stakes */
export const Tape = ({a = [-4, 0, 0], b = [4, 0, 0], frame = 0}) => { const n = 6; return <group>
  {[a, b].map((p, i) => <Cy key={i} p={[p[0], 0.7, p[2]]} a={[0.05, 0.06, 1.4, 5]} c="#6a5a42" />)}
  {Array.from({length: n}, (_, i) => { const t = (i + 0.5) / n; return <Bx key={i} p={[a[0] + (b[0] - a[0]) * t, 1.15 + Math.sin(t * Math.PI) * -0.08 + Math.sin(frame * 0.1 + i) * 0.01, a[2] + (b[2] - a[2]) * t]} s={[Math.abs(b[0] - a[0]) / n + 0.05, 0.12, 0.03]} c={i % 2 ? '#ffd93b' : '#1a1a1a'} />; })}</group>; };

/** hand Geiger counter, needle swings with frame; click lights */
export const Geiger = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[0.9, 0.7, 0.5]} c="#6a7a4a" /><Bx p={[0, 0.1, 0.26]} s={[0.6, 0.35, 0.04]} c="#e8e0b8" />
  <Bx p={[Math.sin(frame * 0.5) * 0.12, 0.1, 0.29]} s={[0.03, 0.3, 0.02]} c="#aa2a22" /><Cy p={[0, -0.7, 0.1]} a={[0.05, 0.05, 1.0, 5]} c="#222" />
  <Glow position={[0.3, 0.3, 0.3]} size={0.7} color="#40ff80" opacity={frame % 6 < 3 ? 0.9 : 0.15} /></group>;

/** THE ACORN (locals' account): brown bulb body, cap with ridge, gold glyph band; glow 0..1 */
export const Acorn = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, glow = 0.3, glyphs = true}) => <group position={position} rotation={rotation} scale={scale}>
  <mesh position={[0, 1.2, 0]} scale={[1, 1.1, 1]}><sphereGeometry args={[1.5, 12, 10]} /><meshLambertMaterial color="#8a6a3a" flatShading emissive="#6a4a20" emissiveIntensity={0.3 + glow * 0.5} /></mesh>
  <mesh position={[0, 2.35, 0]}><cylinderGeometry args={[1.1, 1.45, 0.5, 12]} /><meshLambertMaterial color="#5a4226" flatShading /></mesh>
  <mesh position={[0, 2.85, 0]}><cylinderGeometry args={[0.2, 0.9, 0.5, 8]} /><meshLambertMaterial color="#6a4e2c" flatShading /></mesh>
  <mesh position={[0, 0.0, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.9, 0.8, 12]} /><meshLambertMaterial color="#7a5a30" flatShading /></mesh>
  {glyphs && Array.from({length: 11}, (_, i) => { const a = i / 11 * Math.PI * 2; return <Bx key={i} p={[Math.cos(a) * 1.5, 1.25 + (i % 3) * 0.12, Math.sin(a) * 1.5]} s={[0.12, 0.3 + (i % 2) * 0.12, 0.1]} c="#ffd860" e="#ffcc40" ei={0.9 + glow} r={[0, -a + Math.PI / 2, 0]} />; })}
  <Glow position={[0, 1.4, 0]} size={7 * (0.5 + glow)} color="#ffc060" opacity={0.35 * (0.4 + glow)} />
</group>;

/** flatbed truck (army olive), cab at +x; optional load */
export const Flatbed = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0, load = true, tarp = true}) => <group position={position} rotation={[0, rotation, 0]} scale={scale}>
  <Bx p={[1.6, 1.3, 0]} s={[1.8, 1.7, 2.3]} c="#4a5a3a" /><Bx p={[2.0, 1.55, 0]} s={[1.0, 0.7, 2.2]} c="#9ab4c4" /><Bx p={[-0.6, 0.65, 0]} s={[5.4, 0.3, 2.5]} c="#3a3a32" />
  {[[2, 0], [-1.8, 1], [-2.9, 1]].map(([x], i) => [1, -1].map((s) => <Cy key={i + '_' + s} p={[x, 0.45, s * 1.15]} a={[0.45, 0.45, 0.35, 10]} c="#141414" r={[Math.PI / 2, 0, 0]} />))}
  {load && <group position={[-1.0, 1.0, 0]}>{tarp ? <><Bx p={[0, 0.9, 0]} s={[3.2, 1.7, 2.1]} c="#6a7a52" /><Bx p={[0, 1.8, 0]} s={[2.6, 0.2, 1.7]} c="#5a6a42" /></> : <Acorn scale={0.55} position={[0, 0.0, 0]} frame={frame} glow={0.2} />}</group>}
  <Bx p={[2.55, 0.9, 0.8]} s={[0.1, 0.25, 0.3]} c="#fff2c0" e="#fff2c0" ei={0.9} /><Bx p={[2.55, 0.9, -0.8]} s={[0.1, 0.25, 0.3]} c="#fff2c0" e="#fff2c0" ei={0.9} />
</group>;

/** NASA records room: desk with dated folders, one shelf empty. empty 0..1 how many boxes gone */
export const Sat = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[1.6, 1.6, 1.6]} c="#c8a850" /><Bx p={[0, 0, 0]} s={[1.7, 0.2, 1.7]} c="#6a5a30" />
  <Bx p={[-2.6, 0, 0]} s={[3.2, 0.05, 1.4]} c="#2a4a9a" e="#3a6aff" ei={0.35} /><Bx p={[2.6, 0, 0]} s={[3.2, 0.05, 1.4]} c="#2a4a9a" e="#3a6aff" ei={0.35} />
  <Bx p={[-2.6, 0.06, 0]} s={[0.05, 0.02, 1.4]} c="#8ab0ff" /><Bx p={[2.6, 0.06, 0]} s={[0.05, 0.02, 1.4]} c="#8ab0ff" />
  <Cy p={[0, 1.3, 0]} a={[0.04, 0.04, 1.0, 4]} c="#ddd" /><Glow position={[0, 1.9, 0]} size={0.8} color="#ff3030" opacity={frame % 20 < 8 ? 0.9 : 0.1} />
</group>;

/** earth disc segment + two trajectories (steep fireball vs shallow satellite) for the twist diagram. u = 0..1 draw progress */
export const Trajectory = ({frame = 0, u = 1, which = 'both'}) => { const nA = 22;
  return <group>
    <mesh position={[0, -14, 0]} scale={[1.6, 1, 0.3]}><sphereGeometry args={[14, 28, 18]} /><meshLambertMaterial color="#1a3a5a" flatShading emissive="#0a2038" emissiveIntensity={0.6} /></mesh>
    <mesh position={[0, -13.7, 0.2]} scale={[1.62, 1, 0.31]}><sphereGeometry args={[14.05, 28, 18]} /><meshBasicMaterial color="#6aa8ff" transparent opacity={0.12} toneMapped={false} /></mesh>
    {(which === 'both' || which === 'sat') && Array.from({length: nA}, (_, i) => { const t = i / (nA - 1); if (t > u) return null; return <Bx key={'s' + i} p={[-10 + t * 20, 3.4 - t * 3.0 + Math.sin(t * 2.6) * 0.0, 0.5]} s={[0.55, 0.12, 0.12]} c="#ffd93b" basic />; })}
    {(which === 'both' || which === 'fire') && Array.from({length: nA}, (_, i) => { const t = i / (nA - 1); if (t > u) return null; return <Bx key={'f' + i} p={[-4 + t * 6, 8 - t * 7.6, 0.6]} s={[0.12, 0.5, 0.12]} c="#ff5a30" basic r={[0, 0, 0.35]} />; })}
    {(which === 'both' || which === 'sat') && u > 0.2 && <Sat position={[-10 + Math.min(u, 1) * 20, 3.4 - Math.min(u, 1) * 3.0 + 0.8, 0.5]} scale={0.5} frame={frame} />}
    {(which === 'both' || which === 'fire') && <Glow position={[-4 + Math.min(u, 1) * 6, 8 - Math.min(u, 1) * 7.6, 0.6]} size={2.4} color="#ff9a40" opacity={0.9} />}
  </group>; };

/** NASA desk: lamp, papers, big folder, red LOST tab */
export const NasaDesk = ({frame = 0, stamp = false}) => <group>
  <Bx p={[0, 0, 0]} s={[10, 0.5, 5]} c="#3a2c20" /><Bx p={[0, 0.3, 0]} s={[9.4, 0.08, 4.4]} c="#4a3a2a" />
  {[[-2.6, 0.4, -0.6, 0.2], [-1.2, 0.5, 0.8, -0.15], [2.2, 0.4, -0.5, 0.1]].map(([x, y, z, r], i) => <Bx key={i} p={[x, y, z]} s={[1.9, 0.08, 2.5]} c={['#e8e0c8', '#d8d0b8', '#efe6cc'][i]} r={[0, r, 0]} />)}
  <Bx p={[0.4, 0.55, 0.2]} s={[2.6, 0.3, 3.2]} c="#c8a860" r={[0, 0.12, 0]} /><Bx p={[0.4, 0.72, 0.2]} s={[2.3, 0.04, 2.9]} c="#d8b870" r={[0, 0.12, 0]} />
  {stamp && <Bx p={[0.4, 0.78, 0.2]} s={[1.6, 0.03, 0.7]} c="#c8281c" basic r={[0, 0.12 + 0.2, 0]} />}
  <Cy p={[-4, 1.2, -1.4]} a={[0.05, 0.05, 1.8, 5]} c="#222" /><Cy p={[-4, 2.2, -1.4]} a={[0.1, 0.5, 0.5, 8]} c="#1c6a4a" /><Glow position={[-4, 1.9, -1.3]} size={8} color="#ffe0a8" opacity={0.4} />
</group>;

/** small village on the forest terrain: 6 houses with lit windows, firehouse tower */
export const Village = ({frame = 0, x0 = -16, z = -2, lit = 0.7}) => <group>
  {[0, 1, 2, 3, 4, 5].map((i) => { const x = x0 + i * 6.5 + (i % 2) * 1.5; const zz = z + (i % 3) * 3 - 3;
    return <Building key={i} position={[x, H0(x, zz) - 0.1, zz]} rotation={0.2 * (i - 2)} w={3} d={2.6} h={2} roof={1.3} lit={lit} litSeed={i + 3} color={['#c94a3a', '#e8e2d2', '#c8b078', '#9ab0c8', '#d8c8a0', '#b8785a'][i]} roofColor={['#4a3a3a', '#6a3a30', '#3a4a5a'][i % 3]} frame={frame} />; })}
  <Bx p={[x0 + 3 * 6.5 + 2.2, H0(x0 + 22, z) + 2.4, z - 4.2]} s={[1.6, 5, 1.6]} c="#a8352f" /><Glow position={[x0 + 3 * 6.5 + 2.2, H0(x0 + 22, z) + 5.4, z - 4.2]} size={2.4} color="#ffd890" opacity={0.7} />
</group>;
