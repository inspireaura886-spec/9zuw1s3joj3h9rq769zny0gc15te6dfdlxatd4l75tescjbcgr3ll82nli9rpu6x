// USS Cyclops (1918) diorama parts: collier SHIP (splittable hull, lit portholes, smoke), harbour pier with palms + crane + ore, engine room with pistons,
// map table with route, periscope with wake, lantern. Camera usually at +z looking -z; ship bow points +x. Deterministic (no clocks).
import {Glow} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};

const PORTS = 12;
const half = (sign, {lit, hull, trim, ore, frame, flag}) => <group>
  <Bx p={[sign * 4, 0.2, 0]} s={[8, 1.8, 3.2]} c={hull} />
  <Bx p={[sign * 4, 1.15, 0]} s={[8.1, 0.18, 3.3]} c={trim} />
  <Bx p={[sign * 4, -0.55, 0]} s={[8.02, 0.5, 3.24]} c="#2a1a16" />
  {[1.4, 4.0, 6.4].map((x, i) => <group key={i}><Bx p={[sign * x, 1.4, 0]} s={[1.9, 0.4, 1.8]} c="#3a3430" /><Bx p={[sign * x, 1.62, 0]} s={[1.5, 0.1, 1.4]} c="#5a4a3c" />
    {ore > 0 && <mesh position={[sign * x, 1.7 + ore * 0.3, 0]} scale={[1, ore, 0.9]}><icosahedronGeometry args={[0.95, 0]} /><meshLambertMaterial color="#2a2428" flatShading /></mesh>}</group>)}
  <Cy p={[sign * 2.6, 3.2, 0]} a={[0.08, 0.1, 3.4, 6]} c="#3a3a3a" /><Bx p={[sign * 2.6 + sign * 0.9, 3.9, 0]} s={[2.4, 0.07, 0.07]} c="#3a3a3a" r={[0, 0, sign * -0.5]} />
  <Cy p={[sign * 6.0, 3.0, 0]} a={[0.08, 0.1, 3.0, 6]} c="#3a3a3a" /><Bx p={[sign * 6.0 - sign * 0.9, 3.6, 0]} s={[2.4, 0.07, 0.07]} c="#3a3a3a" r={[0, 0, sign * 0.5]} />
  {Array.from({length: 6}, (_, i) => { const idx = sign > 0 ? i : i + 6; const on = idx < lit; const x = sign * (0.8 + i * 1.3);
    return [1, -1].map((side) => <group key={side + '_' + i}><Bx p={[x, 0.6, side * 1.62]} s={[0.36, 0.32, 0.06]} c={on ? '#ffd890' : '#1a1410'} basic={on} />
      {on && <Glow position={[x, 0.6, side * 1.85]} size={1.2} color="#ffc860" opacity={0.7} />}</group>); })}
  {sign < 0 && <group>
    <Bx p={[-3.2, 2.3, 0]} s={[3.4, 1.8, 2.6]} c="#c9bfa8" /><Bx p={[-3.2, 3.35, 0]} s={[3.6, 0.2, 2.8]} c="#2a2a2a" />
    <Bx p={[-3.2, 3.9, 0]} s={[2.4, 0.9, 2.2]} c="#b9af98" /><Bx p={[-3.2, 4.4, 0]} s={[2.6, 0.14, 2.4]} c="#2a2a2a" />
    {[[-1, 0], [0, 0], [1, 0]].map(([k], i) => { const on = lit >= PORTS + 1; return <Bx key={i} p={[-2.0, 3.95, k * 0.7]} s={[0.06, 0.4, 0.5]} c={on ? '#ffe9b0' : '#14181c'} basic={on} />; })}
    <Cy p={[-5.4, 3.9, 0]} a={[0.55, 0.65, 2.8, 8]} c="#262626" /><Cy p={[-5.4, 4.9, 0]} a={[0.57, 0.57, 0.5, 8]} c="#b8322a" /><Cy p={[-5.4, 5.3, 0]} a={[0.6, 0.57, 0.18, 8]} c="#111" />
    {lit >= PORTS + 2 && <Glow position={[-3.2, 5.1, 0]} size={1.8} color="#ffe080" opacity={0.9} />}
    {flag && <><Cy p={[-7.7, 3.0, 0]} a={[0.04, 0.05, 2.2, 5]} c="#aaa" /><Bx p={[-8.1, 3.9 + Math.sin(frame * 0.3) * 0.04, 0]} s={[0.8, 0.45, 0.03]} c="#3a5aa8" r={[0, Math.sin(frame * 0.25) * 0.3, 0]} /></>}
  </group>}
  {sign > 0 && <group><mesh position={[8.9, 0.2, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.55, 1, 1]}><coneGeometry args={[1.6, 1.8, 6]} /><meshLambertMaterial color={hull} flatShading /></mesh>
    <mesh position={[8.9, 1.12, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.1, 1, 1]}><coneGeometry args={[1.62, 1.8, 6]} /><meshLambertMaterial color={trim} flatShading /></mesh>
    {lit >= 1 && <><Glow position={[7.6, 1.8, 1.4]} size={1.0} color="#40ff80" opacity={0.7} /><Glow position={[7.6, 1.8, -1.4]} size={1.0} color="#ff4040" opacity={0.7} /></>}</group>}
</group>;

/** The collier. lit = lamps on (0..PORTS+3); sink 0..1 sits lower; snap = hull break angle (rad) */
export const Ship = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, lit = 20, sink = 0, snap = 0, smoke = true, hull = '#7a3a28', trim = '#2c2a2a', ore = 0, flag = true, roll = 0}) => {
  const y = -0.15 - sink * 0.6 + Math.sin(frame * 0.07) * 0.06; const o = {lit, hull, trim, ore, frame, flag};
  return <group position={position} rotation={rotation} scale={scale}>
    <group position={[0, y, 0]} rotation={[Math.sin(frame * 0.05) * 0.02 + roll, 0, Math.sin(frame * 0.06) * 0.015]}>
      <group position={[snap * 2.5, -snap * 0.9, 0]} rotation={[0, 0, -snap]}>{half(1, o)}</group>
      <group position={[-snap * 2.5, -snap * 0.5, 0]} rotation={[0, 0, snap * 0.7]}>{half(-1, o)}</group>
      {smoke && Array.from({length: 7}, (_, i) => { const u = ((frame * 0.018 + i / 7) % 1); return <Glow key={i} position={[-5.4 - u * 4.5, 5.6 + u * 2.4, 0]} size={1.0 + u * 2.8} color="#7a7a7a" opacity={0.5 * (1 - u)} />; })}
    </group>
  </group>;
};

/** Barbados pier: planks, posts, crates, warehouse, crane, palms, ore heap. Pier front edge at z=0; ship moors at z~+3. */
export const Pier = ({frame = 0, ore = 1}) => <group>
  <Bx p={[0, 0.5, -4]} s={[34, 0.4, 7]} c="#7a5c3a" />
  {Array.from({length: 12}, (_, i) => <Cy key={i} p={[-15 + i * 2.8, -0.6, -0.4]} a={[0.18, 0.2, 2.4, 6]} c="#4a3626" />)}
  {Array.from({length: 17}, (_, i) => <Bx key={'p' + i} p={[-16 + i * 2, 0.72, -4]} s={[0.08, 0.02, 7]} c="#5a4228" />)}
  <Bx p={[-9, 2.2, -6.2]} s={[9, 3.4, 3.4]} c="#d8c9a0" /><Bx p={[-9, 4.15, -6.2]} s={[9.6, 0.5, 4]} c="#8a3a2a" />
  {[-12, -9, -6].map((x) => <Bx key={x} p={[x, 1.8, -4.45]} s={[1.3, 1.9, 0.1]} c="#3a2a1c" />)}
  {[[2, 0, 1.2], [3.4, 0, 1.4], [2.7, 1.0, 1.2], [5.6, 0, 1.0], [-3, 0, 1.1]].map(([x, yy, s], i) => <Bx key={i} p={[x, 1.2 + yy * 1, -2.4]} s={[s, s, s]} c={['#a5763a', '#8a5f2c', '#b98a4a', '#7a5028', '#9a6c36'][i]} />)}
  <group position={[9, 0.7, -3]}>
    <Bx p={[0, 3.4, 0]} s={[0.6, 6.8, 0.6]} c="#3a4650" /><Bx p={[2.2, 6.8, 0]} s={[6, 0.4, 0.4]} c="#3a4650" /><Bx p={[4.8, 5.4, 0]} s={[0.05, 2.8, 0.05]} c="#222" />
    <Bx p={[4.8, 3.9 + Math.sin(frame * 0.1) * 0.15, 0]} s={[0.7, 0.4, 0.5]} c="#d8a030" /></group>
  {[[-16, -3], [-14.5, -6], [14, -5.4]].map(([x, z], i) => <group key={i} position={[x, 0.7, z]} rotation={[0, i, Math.sin(frame * 0.05 + i) * 0.03]}>
    <Cy p={[0, 1.4, 0]} a={[0.12, 0.2, 2.8, 5]} c="#7a5a38" r={[0, 0, 0.12]} />
    {[0, 1, 2, 3, 4].map((k) => <Bx key={k} p={[Math.cos(k * 1.25) * 0.9 + 0.2, 2.9, Math.sin(k * 1.25) * 0.9]} s={[1.9, 0.08, 0.5]} c="#2f7a3a" r={[0, -k * 1.25, 0.35]} />)}</group>)}
  {ore > 0 && <mesh position={[3, 0.9, -2.4]} scale={[2.6 * ore, 1.2 * ore, 1.7 * ore]}><icosahedronGeometry args={[1, 0]} /><meshLambertMaterial color="#2c2630" flatShading /></mesh>}
  {[-6, 0, 6, 12].map((x) => <group key={x}><Cy p={[x, 2.0, -0.6]} a={[0.05, 0.05, 2.6, 5]} c="#222" /><Glow position={[x, 3.4, -0.6]} size={2.4} color="#ffd890" opacity={0.8} /></group>)}
</group>;

/** engine room: floor, back wall, two triple-expansion engines (dead = index that is dark/still), boiler, flywheel, hanging lamps */
export const EngineRoom = ({frame = 0, dead = -1}) => <group>
  <Bx p={[0, -0.25, 0]} s={[18, 0.5, 10]} c="#3a3836" /><Bx p={[0, 3, -5]} s={[18, 7, 0.4]} c="#4a4440" /><Bx p={[-9, 3, 0]} s={[0.4, 7, 10]} c="#403a36" /><Bx p={[0, 6.6, 0]} s={[18, 0.3, 10]} c="#2a2624" />
  {[-4.2, 4.2].map((x, e) => { const ok = e !== dead; const ph = e * 1.7; const w = ok ? frame * 0.22 : 0;
    return <group key={e} position={[x, 0, -1.2]}>
      <Bx p={[0, 0.3, 0]} s={[5, 0.8, 3]} c={ok ? '#4a5a5e' : '#2a2c2e'} />
      {[-1.5, 0, 1.5].map((k, i) => <group key={i}><Cy p={[k, 2.2, 0]} a={[0.55, 0.55, 2.8, 10]} c={ok ? '#6a7a7e' : '#34383a'} /><Cy p={[k, 3.9 + (ok ? Math.sin(w + ph + i * 2.1) * 0.35 : 0), 0]} a={[0.12, 0.12, 1.4, 6]} c="#c8ccd0" />
        <Cy p={[k, 4.6, 0]} a={[0.7, 0.55, 0.3, 10]} c={ok ? '#8a9a9e' : '#3a3e40'} /></group>)}
      <group position={[0, 1.6, 2.1]} rotation={[0, 0, w]}><Cy p={[0, 0, 0]} a={[1.5, 1.5, 0.25, 14]} c={ok ? '#5a6468' : '#2c2e30'} r={[Math.PI / 2, 0, 0]} /><Bx p={[0, 0, 0]} s={[2.9, 0.18, 0.3]} c="#222" /><Bx p={[0, 0, 0]} s={[0.18, 2.9, 0.3]} c="#222" /></group>
      {ok ? <Glow position={[0, 5.2, 0]} size={3} color="#ffd890" opacity={0.35} /> : <Glow position={[0, 3.2, 1.8]} size={3 + Math.sin(frame * 0.4) * 1.2} color="#ff3020" opacity={0.85} />}
    </group>; })}
  <Cy p={[0, 1.7, -3.6]} a={[1.7, 1.7, 14, 12]} c="#5a4640" r={[0, 0, Math.PI / 2]} />
  {[-6, -2, 2, 6].map((x) => <Bx key={x} p={[x, 2.6, -2.2]} s={[0.35, 0.35, 0.35]} c="#d8c068" e="#d8c068" ei={0.7} />)}
  {[-6, 0, 6].map((x) => <group key={x}><Cy p={[x, 5.4, 1.5]} a={[0.03, 0.03, 2.4, 4]} c="#222" /><Glow position={[x, 4.2, 1.5]} size={6} color="#ffd070" opacity={0.8} /></group>)}
</group>;

/** Atlantic map table: sea, US coast, Barbados, route dots. prog 0..1 = ship marker along route; gone => marker vanishes at prog and a ? glows */
const route = (u) => [-3.8 + u * 7.4 + Math.sin(u * 5) * 0.25, 0.46, 2.4 - u * 5.0];
export const MapTable = ({frame = 0, prog = 0, lost = false}) => <group>
  <Bx p={[0, 0, 0]} s={[11.5, 0.5, 8.5]} c="#4a3626" /><Bx p={[0, 0.3, 0]} s={[10.4, 0.1, 7.6]} c="#9ab8ae" />
  <Bx p={[3.8, 0.4, -2.9]} s={[3.8, 0.12, 1.8]} c="#cdb98a" /><Bx p={[4.2, 0.4, -0.9]} s={[2.4, 0.12, 2.2]} c="#cdb98a" /><Bx p={[2.6, 0.4, -3.2]} s={[1.8, 0.12, 1.2]} c="#bda878" />
  <Bx p={[-3.8, 0.4, 2.5]} s={[0.6, 0.14, 0.5]} c="#6aa04a" /><Bx p={[-4.4, 0.4, 1.2]} s={[1.1, 0.12, 0.7]} c="#c8b484" />
  {Array.from({length: 22}, (_, i) => { const u = i / 21; const p = route(u); const seen = u <= prog; const dead = lost && u > prog;
    return <Bx key={i} p={p} s={[0.16, 0.05, 0.16]} c={seen ? '#e8302a' : dead ? '#6a6a6a' : '#c8c8b8'} basic />; })}
  <group position={route(prog)}>{(!lost || frame % 8 < 6) && <><Ship scale={0.12} position={[0, 0.25, 0]} rotation={[0, -0.9, 0]} frame={frame} smoke={false} flag={false} /><Glow position={[0, 0.5, 0]} size={1.4} color={lost ? '#ff5040' : '#ffd890'} opacity={0.8} /></>}</group>
  <Glow position={[3.4, 0.9, -1.0]} size={2.4} color="#ffe0a0" opacity={0.25} />
</group>;

/** U-boat periscope with V wake */
export const Periscope = ({position = [0, 0, 0], rotation = 0, frame = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <Cy p={[0, 0.5, 0]} a={[0.08, 0.09, 1.3, 6]} c="#22282c" /><Bx p={[0.1, 1.15, 0]} s={[0.35, 0.16, 0.14]} c="#22282c" /><Glow position={[0.3, 1.15, 0]} size={0.5} color="#a0e0ff" opacity={0.6} />
  {[1, -1].map((s) => <Bx key={s} p={[-1.6 - Math.sin(frame * 0.1) * 0.1, 0.03, s * 0.9]} s={[3.6, 0.04, 0.12]} c="#e8f4f8" r={[0, s * 0.45, 0]} basic o={0.7} />)}
</group>;

export const Lantern = ({position = [0, 0, 0], frame = 0, color = '#ffb050'}) => <group position={position}>
  <Cy p={[0, 0, 0]} a={[0.18, 0.2, 0.4, 6]} c="#2a2a2a" /><mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.15, 8, 6]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
  <Glow position={[0, 0.05, 0]} size={4.5 + Math.sin(frame * 0.3) * 0.4} color={color} opacity={0.8} /></group>;

/** wooden deck plank floor for crew scenes */
export const DeckFloor = ({w = 22, d = 12}) => <group><Bx p={[0, -0.15, 0]} s={[w, 0.3, d]} c="#6a5236" />
  {Array.from({length: Math.round(w / 1.3)}, (_, i) => <Bx key={i} p={[-w / 2 + 0.7 + i * 1.3, 0.01, 0]} s={[0.05, 0.02, d]} c="#4a3822" />)}</group>;
