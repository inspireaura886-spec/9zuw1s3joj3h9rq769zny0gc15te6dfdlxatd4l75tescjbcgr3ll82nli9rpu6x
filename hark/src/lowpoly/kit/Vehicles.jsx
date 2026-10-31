import {Person} from './Characters.jsx';
const M = ({p, s, c, rot, geo = 'box'}) => (
  <mesh position={p} rotation={rot || [0, 0, 0]}>
    {geo === 'box' ? <boxGeometry args={s} /> : <cylinderGeometry args={s} />}
    <meshLambertMaterial color={c} flatShading /></mesh>
);
// wheels rotate by distance travelled (dist in world units).
const Wheel = ({p, r = 0.38, w = 0.18, dist = 0}) => (
  <group position={p} rotation={[dist / r, 0, 0]}><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[r, r, w, 10]} /><meshLambertMaterial color="#1d1d22" flatShading /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[r * 0.45, r * 0.45, w + 0.02, 6]} /><meshLambertMaterial color="#9aa0a8" flatShading /></mesh></group>
);

/** Motorcycle facing +Z. rider: props for Person or null. headlight: true for night. */
export const Motorcycle = ({position = [0, 0, 0], rotation = 0, dist = 0, color = '#b3261e', rider = {}, headlight = false}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Wheel p={[0, 0.38, 0.75]} dist={dist} /><Wheel p={[0, 0.38, -0.75]} dist={dist} />
    <M p={[0, 0.72, 0]} s={[0.3, 0.32, 1.2]} c={color} />
    <M p={[0, 0.95, -0.25]} s={[0.34, 0.12, 0.7]} c="#1e1e1e" />
    <M p={[0, 0.95, 0.45]} s={[0.36, 0.3, 0.42]} c={color} />
    <M p={[0, 1.2, 0.62]} s={[0.8, 0.06, 0.06]} c="#2a2a2a" />
    <M p={[0, 0.6, 0.72]} s={[0.06, 0.6, 0.06]} c="#888" rot={[0.35, 0, 0]} />
    {headlight && <mesh position={[0, 1.0, 0.7]}><boxGeometry args={[0.18, 0.14, 0.05]} /><meshBasicMaterial color="#fff6c8" /></mesh>}
    {rider && <Person position={[0, 0.42, -0.2]} pose="ride" {...rider} />}
  </group>
);

/** Box car / pickup facing +Z. */
export const Car = ({position = [0, 0, 0], rotation = 0, dist = 0, color = '#e2b23a', cabin = '#cfd8e3', pickup = false}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <M p={[0, 0.7, 0]} s={[1.7, 0.7, 3.6]} c={color} />
    <M p={[0, 1.35, pickup ? 0.5 : -0.1]} s={[1.5, 0.65, pickup ? 1.4 : 2.0]} c={color} />
    <M p={[0, 1.37, pickup ? 1.21 : 0.91]} s={[1.4, 0.5, 0.02]} c={cabin} />
    {[[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.2], [0.85, -1.2]].map(([x, z], i) => <Wheel key={i} p={[x, 0.38, z]} dist={dist} />)}
  </group>
);

/** Small raft/boat platform (for lake scenes). */
export const Raft = ({position = [0, 0, 0], rotation = 0, w = 3, d = 3, color = '#c9c2b0'}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <M p={[0, 0.15, 0]} s={[w, 0.3, d]} c={color} />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <M key={i} geo="cyl" p={[x * w * 0.4, 0, z * d * 0.4]} s={[0.35, 0.35, 0.5, 8]} c="#e46b2e" />)}
  </group>
);
