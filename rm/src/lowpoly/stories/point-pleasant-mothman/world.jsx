// Point Pleasant / Mothman (Nov 1966) diorama parts: night road + sodium lamps, Mothman (flapping wings, red eyes), TNT plant domes, newspapers, calendar,
// Silver Bridge (towers, eyebar chain, deck with cars, collapse u 0..1), eyebar macro with crack, ruler, sandhill crane, barred owl, river debris. Deterministic (no clocks).
import {Glow, Tree, Ocean} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};
export {Archive, Land, Pines, height} from '../rendlesham-forest/world.jsx';
export {Car} from '../solway-spaceman/world.jsx';

/** straight night road along x at z0, dashes scroll with frame*speed, ground field around it */
export const NightRoad = ({frame = 0, z0 = 0, speed = 0.9, len = 120, lamps = true, trees = true}) => {
  const off = (frame * speed) % 6;
  return <group>
    <Bx p={[0, -0.12, z0 - 14]} s={[len * 1.6, 0.2, 60]} c="#1a2418" />
    <Bx p={[0, 0, z0]} s={[len * 1.6, 0.14, 7]} c="#25272c" /><Bx p={[0, 0.08, z0 - 3.5]} s={[len * 1.6, 0.02, 0.12]} c="#c8b878" /><Bx p={[0, 0.08, z0 + 3.5]} s={[len * 1.6, 0.02, 0.12]} c="#c8b878" />
    {Array.from({length: 28}, (_, i) => <Bx key={i} p={[-84 + i * 6 + off, 0.09, z0]} s={[2.6, 0.02, 0.2]} c="#e8d890" />)}
    {Array.from({length: 24}, (_, i) => <group key={'p' + i} position={[-70 + i * 6.2, 0, z0 + 6.2]}><Bx p={[0, 0.5, 0]} s={[0.14, 1.0, 0.14]} c="#5a4a38" /><Bx p={[0, 0.85, 0]} s={[0.2, 0.2, 0.06]} c="#e8e8e8" e="#ffffff" ei={0.5} /></group>)}
    {lamps && [-30, -10, 10, 30].map((x, i) => <group key={i} position={[x + ((i * 7) % 3), 0, z0 - 5]}><Cy p={[0, 3, 0]} a={[0.1, 0.14, 6, 6]} c="#2a2a2e" /><Bx p={[0.6, 6, 0]} s={[1.6, 0.18, 0.4]} c="#2a2a2e" /><Bx p={[1.2, 5.88, 0]} s={[0.6, 0.12, 0.34]} c="#ffcf80" basic />
      <Glow position={[1.2, 5.8, 0]} size={7} color="#ffb860" opacity={0.65} /></group>)}
    {trees && Array.from({length: 22}, (_, i) => <Tree key={i} position={[-60 + i * 5.7, 0, z0 - 11 - (i % 3) * 3.5]} s={2 + (i % 4) * 0.5} kind={i % 3 ? 'pine' : 'bare'} color="#14301f" seed={i} frame={frame} />)}
  </group>;
};

/** THE MOTHMAN: tall dark body, small head, two big folded/spread wings (flap), red eyes. wings 0 folded .. 1 spread */
export const Mothman = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, wings = 1, flap = 0.5, eyes = 1}) => {
  const fl = Math.sin(frame * 0.38) * flap; const sp = 0.2 + wings * 0.9;
  return <group position={position} rotation={rotation} scale={scale}>
    <Bx p={[0, 0, 0]} s={[0.9, 2.2, 0.6]} c="#2b2830" /><Bx p={[0, 1.35, 0.05]} s={[0.7, 0.62, 0.55]} c="#34303a" /><Bx p={[0, -1.5, 0.05]} s={[0.55, 1.2, 0.4]} c="#26232a" />
    {[-1, 1].map((s) => <group key={s}>
      <group position={[s * 0.5, 0.5, -0.1]} rotation={[0, s * 0.2, s * (0.1 + sp * 0.28 + fl * 0.55)]}>
        <Bx p={[s * 1.7, 0.35, 0]} s={[3.4, 0.16, 2.4]} c="#2a2630" r={[0, 0, s * -0.12]} /><Bx p={[s * 3.0, 0.9, 0]} s={[2.0, 0.14, 1.6]} c="#322d3a" r={[0, 0, s * 0.2]} />
        <Bx p={[s * 1.5, -0.45, 0.1]} s={[2.8, 0.12, 1.9]} c="#221f27" r={[0, 0, s * -0.22]} /></group>
      <Bx p={[s * 0.2, 1.4, 0.34]} s={[0.26, 0.2, 0.1]} c="#ff2418" e="#ff3020" ei={2.6 * eyes} basic />
      <Glow position={[s * 0.2, 1.4, 0.45]} size={0.8 * eyes} color="#ff2a20" opacity={0.9 * Math.min(1, eyes)} /></group>)}
    <Glow position={[0, 1.4, 0.5]} size={1.6 * eyes} color="#ff2a20" opacity={0.12 * Math.min(eyes,1)} />
  </group>;
};

/** munitions plant: earth-covered domes (igloos) with doors + a chimney + fence + warning light */
export const TntPlant = ({frame = 0, lit = 1}) => <group>
  <Bx p={[0, -0.12, 0]} s={[70, 0.2, 40]} c="#1c2418" />
  {[[-14, -2, 4.2], [-5, -6, 4.8], [5, -3, 4.4], [13, -7, 4.0], [0, 4, 3.6]].map(([x, z, r], i) => <group key={i} position={[x, 0, z]}>
    <mesh scale={[1, 0.62, 1]}><sphereGeometry args={[r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshLambertMaterial color={i % 2 ? '#3a4a30' : '#34422c'} flatShading /></mesh>
    <Bx p={[0, 0.9, r * 0.92]} s={[1.5, 1.8, 0.3]} c="#5a4a30" /><Bx p={[0, 1.9, r * 0.9]} s={[1.0, 0.22, 0.3]} c="#c8281c" basic /></group>)}
  <Cy p={[18, 5, 4]} a={[0.7, 1.0, 10, 8]} c="#6a3a2a" /><Glow position={[18, 10.4, 4]} size={4} color="#ff5a30" opacity={0.5 + 0.3 * Math.sin(frame * 0.25)} />
  {Array.from({length: 16}, (_, i) => <Bx key={i} p={[-24 + i * 3.2, 0.7, 12]} s={[0.12, 1.4, 0.12]} c="#555" />)}<Bx p={[0, 1.2, 12]} s={[50, 0.08, 0.08]} c="#555" />
  <Bx p={[-24, 4, 12]} s={[0.2, 3, 0.2]} c="#333" /><Glow position={[-24, 5.6, 12]} size={3.4} color="#ff3a20" opacity={frame % 24 < 12 ? 0.85 : 0.15} />
  <Glow position={[0, 8, 0]} size={30} color="#ff9a50" opacity={0.12 * lit} />
</group>;

/** newspaper: sheet with headline bars + photo box. headline color bars only (words come from Pills) */
export const Paper = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, tone = '#e8e0c8', head = '#1a1a1a', photo = true}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[3.0, 0.06, 4.0]} c={tone} /><Bx p={[0, 0.05, -1.3]} s={[2.6, 0.03, 0.55]} c={head} />
  {photo && <Bx p={[0, 0.05, -0.1]} s={[1.5, 0.03, 1.0]} c="#5a5650" />}
  {[0.9, 1.15, 1.4, 1.65].map((z, i) => <Bx key={i} p={[0, 0.05, z]} s={[2.5 - (i % 2) * 0.4, 0.03, 0.09]} c="#7a7468" />)}
  {[-1, 1].map((s) => [0.5, 0.75].map((z, j) => <Bx key={s + '_' + j} p={[s * 0.8, 0.05, z - 0.2]} s={[1.0, 0.03, 0.09]} c="#7a7468" />))}
</group>;

/** wall calendar page with grid + circled date + month ripple */
export const Calendar = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, mark = 15, frame = 0, flip = 0}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[4.4, 5.4, 0.2]} c="#efe6cc" /><Bx p={[0, 2.2, 0.12]} s={[4.4, 1.0, 0.1]} c="#a8281c" />
  {Array.from({length: 35}, (_, i) => { const x = (i % 7 - 3) * 0.58, y = 1.0 - Math.floor(i / 7) * 0.62; const m = i === mark; return <Bx key={i} p={[x, y, 0.13]} s={[0.46, 0.42, 0.04]} c={m ? '#c8281c' : '#cfc6aa'} e={m ? '#ff3a20' : undefined} ei={0.6} />; })}
  <Cy p={[-1.2, 2.8, 0.1]} a={[0.1, 0.1, 0.6, 6]} c="#333" /><Cy p={[1.2, 2.8, 0.1]} a={[0.1, 0.1, 0.6, 6]} c="#333" />
</group>;

/** Silver Bridge: two A-frame steel towers, eyebar chain (catenary of links), deck, cars; u = collapse 0..1 (deck tears, towers lean, chain whips) */
export const SilverBridge = ({frame = 0, u = 0, cars = true, rush = 1}) => {
  const L = 34; const chainY = (x) => 9.5 - 6.5 * (1 - Math.pow(x / L, 2)); // catenary-ish sag between towers
  const fall = (x, i) => u <= 0 ? 0 : -Math.pow(Math.max(0, u - 0.05 * Math.abs(x) / 10), 1.4) * (22 + (i % 3) * 5);
  const tilt = (x) => u <= 0 ? 0 : Math.sign(x || 1) * Math.min(1.3, u * 1.5);
  const N = 18;
  return <group>
    {[-L, L].map((tx, k) => <group key={k} position={[tx, 0, 0]} rotation={[0, 0, u * (k ? -0.28 : 0.28)]}>
      {[-1.7, 1.7].map((tz) => <group key={tz}><Bx p={[0, 6, tz]} s={[1.0, 12, 0.7]} c="#8a9098" /><Bx p={[0, 12.2, tz]} s={[1.5, 0.5, 1.0]} c="#6a7078" /></group>)}
      <Bx p={[0, 9.6, 0]} s={[0.7, 0.6, 4.2]} c="#7a8088" /><Bx p={[0, 5, 0]} s={[0.7, 0.5, 4.2]} c="#7a8088" /><Bx p={[0.3, 7.4, 0]} s={[0.5, 0.4, 4.0]} c="#7a8088" r={[0, 0, 0.1]} /></group>)}
    {[-1.9, 1.9].map((cz) => <group key={cz}>{Array.from({length: N}, (_, i) => { const x = -L + (2 * L) * (i + 0.5) / N; const xs = x; const y = chainY(xs) + 2.5 + fall(x, i) * 0.6; const dy = chainY(xs + 2) - chainY(xs - 2);
      return <group key={i} position={[x, y, cz]} rotation={[0, 0, Math.atan2(dy, 4) + tilt(x) * 0.0 + (u > 0 ? Math.sin(i + frame * 0.2) * 0.1 * u : 0)]}><Bx p={[0, 0, 0]} s={[2.0, 0.34, 0.26]} c="#a2a9b2" /><Cy p={[-0.95, 0, 0]} a={[0.3, 0.3, 0.3, 8]} c="#c0c6ce" r={[Math.PI / 2, 0, 0]} /><Cy p={[0.95, 0, 0]} a={[0.3, 0.3, 0.3, 8]} c="#c0c6ce" r={[Math.PI / 2, 0, 0]} /></group>; })}
      {Array.from({length: 11}, (_, i) => { const x = -L + 4 + i * 6; const y0 = chainY(x) + 2.5; return <Bx key={i} p={[x, (y0 + 2) / 2 + fall(x, i) * 0.8, cz]} s={[0.08, y0 - 2, 0.08]} c="#8a9098" />; })}</group>)}
    {Array.from({length: 9}, (_, i) => { const x = -L + 4 + i * 7.5; const f = fall(x, i); return <group key={i} position={[x, 2 + f, 0]} rotation={[tilt(x) * (i % 2 ? 1 : -1) * (u > 0 ? 1 : 0), 0, tilt(x) * 0.6 * (i % 2 ? 1 : -1)]}>
      <Bx p={[0, 0, 0]} s={[7.7, 0.5, 5.2]} c="#4a4e56" /><Bx p={[0, 0.3, 0]} s={[7.7, 0.04, 0.12]} c="#d8c878" />
      {cars && rush > 0 && [[-2.4, 1.0, '#c83a30'], [0.6, -1.0, '#3a6ac8'], [2.8, 1.0, '#e8c040']].map(([cx, cz, col], j) => <Bx key={j} p={[cx, 0.7, cz]} s={[1.9, 0.7, 1.0]} c={col} />)}</group>; })}
    <Glow position={[0, 14, 0]} size={50} color="#ffb870" opacity={0.08} />
  </group>;
};

/** eyebar link macro: big steel bar, round eye holes with pin, hairline crack (red-lit) at the pin hole. crack 0..1 grows */
export const Eyebar = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, crack = 1, frame = 0}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[9, 2.2, 1.0]} c="#8e969f" />
  {[-1, 1].map((s) => <group key={s}><Cy p={[s * 4.5, 0, 0]} a={[1.7, 1.7, 1.0, 20]} c="#8e969f" r={[Math.PI / 2, 0, 0]} /><Cy p={[s * 4.5, 0, 0.1]} a={[0.95, 0.95, 1.1, 16]} c="#1a1c20" r={[Math.PI / 2, 0, 0]} /></group>)}
  <Cy p={[4.5, 0, 0.1]} a={[0.7, 0.7, 1.6, 12]} c="#5a5e66" r={[Math.PI / 2, 0, 0]} />
  <Bx p={[4.5 + 0.1, 0.95 + 0.0, 0.52]} s={[0.07, 0.55 * crack, 0.04]} c="#ff3a20" e="#ff3a20" ei={2.2} basic />
  <Glow position={[4.6, 1.2, 0.6]} size={1.4 * crack} color="#ff3a20" opacity={0.6 * crack * (0.7 + 0.3 * Math.sin(frame * 0.3))} />
  {Array.from({length: 6}, (_, i) => <Bx key={i} p={[-2.6 + i * 0.9, -0.2 + (i % 2) * 0.5, 0.52]} s={[0.5, 0.05, 0.03]} c="#6a7078" />)}
</group>;

/** ruler with a highlighted 1/10 inch gap */
export const Ruler = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, hl = 1}) => <group position={position} rotation={rotation} scale={scale}>
  <Bx p={[0, 0, 0]} s={[9, 0.16, 1.4]} c="#d8c890" />
  {Array.from({length: 41}, (_, i) => <Bx key={i} p={[-4.0 + i * 0.2, 0.1, 0.4]} s={[0.025, 0.04, i % 5 === 0 ? 0.6 : 0.35]} c="#2a2a2a" />)}
  <Bx p={[-3.9, 0.14, 0]} s={[0.2, 0.05, 1.4]} c="#ff3a20" e="#ff3a20" ei={1.2 * hl} basic />
</group>;

/** sandhill crane: grey body, long neck + legs, red forehead; flies with wings flap */
export const Crane = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, wings = 0.6}) => { const fl = Math.sin(frame * 0.3) * 0.5 * wings;
  return <group position={position} rotation={rotation} scale={scale}>
    <Bx p={[0, 0, 0]} s={[2.6, 0.9, 0.9]} c="#8a8d92" /><Bx p={[1.9, 0.9, 0]} s={[0.35, 1.9, 0.35]} c="#a8abb0" r={[0, 0, -0.35]} /><Bx p={[2.55, 1.95, 0]} s={[0.7, 0.35, 0.34]} c="#c8cbd0" /><Bx p={[3.1, 1.88, 0]} s={[0.7, 0.1, 0.1]} c="#2a2a2a" />
    <Bx p={[2.55, 2.1, 0.0]} s={[0.35, 0.12, 0.36]} c="#e03a2a" e="#ff4a30" ei={0.8} /><Bx p={[-1.5, -0.1, 0]} s={[1.6, 0.18, 0.18]} c="#3a3a3a" />
    {[-1, 1].map((s) => <group key={s} position={[0, 0.4, s * 0.4]} rotation={[s * (0.5 + fl), 0, 0]}><Bx p={[0, 0.0, s * 1.8]} s={[2.6, 0.08, 3.6]} c="#9ea1a6" /><Bx p={[-0.2, 0.0, s * 3.2]} s={[1.9, 0.07, 1.4]} c="#7a7d82" /></group>)}
  </group>; };

/** barred owl: round body, big round head, two huge dark eyes with a red-eyeshine option, hooked beak, bars; perched */
export const Owl = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, shine = 0, frame = 0}) => <group position={position} rotation={rotation} scale={scale}>
  <mesh scale={[1, 1.3, 0.9]} position={[0, 0.8, 0]}><sphereGeometry args={[1.0, 12, 10]} /><meshLambertMaterial color="#7a6048" flatShading /></mesh>
  <mesh position={[0, 2.1, 0.05]}><sphereGeometry args={[0.85, 12, 10]} /><meshLambertMaterial color="#8a6e52" flatShading /></mesh>
  {Array.from({length: 4}, (_, i) => <Bx key={i} p={[0, 0.3 + i * 0.35, 0.82]} s={[1.2 - i * 0.1, 0.1, 0.12]} c="#4a3a2a" />)}
  {[-1, 1].map((s) => <group key={s}><Cy p={[s * 0.36, 2.2, 0.7]} a={[0.3, 0.3, 0.1, 12]} c="#0a0806" r={[Math.PI / 2, 0, 0]} /><Bx p={[s * 0.36, 2.2, 0.78]} s={[0.12, 0.12, 0.05]} c="#ff2a20" e="#ff3020" ei={2.4 * shine} basic />
    <Glow position={[s * 0.36, 2.2, 0.9]} size={1.2 * shine} color="#ff2a20" opacity={0.9 * shine} /></group>)}
  <Bx p={[0, 1.95, 0.88]} s={[0.18, 0.28, 0.2]} c="#d8b048" r={[0.4, 0, 0]} /><Cy p={[0, -0.4, 0]} a={[0.1, 0.1, 1.2, 5]} c="#3a2a1a" />
</group>;

/** debris + floating cars on the river; n pieces, sunk 0..1 */
export const RiverDebris = ({frame = 0, n = 14, sink = 0.4}) => <group>
  {Array.from({length: n}, (_, i) => { const x = -26 + i * 4 + Math.sin(i * 1.7) * 2, z = Math.sin(i * 2.3) * 5; const y = -0.2 - sink * (i % 3) * 0.5 + Math.sin(frame * 0.07 + i) * 0.12;
    return <group key={i} position={[x, y, z]} rotation={[Math.sin(i) * 0.3, i * 0.9, Math.cos(i * 1.3) * 0.3]}>
      {i % 3 === 0 ? <><Bx p={[0, 0.3, 0]} s={[2.0, 0.7, 1.0]} c={['#c83a30', '#3a6ac8', '#e8c040', '#3a9a5a'][i % 4]} /><Bx p={[0, 0.8, 0]} s={[1.0, 0.4, 0.9]} c="#222a32" /></> : <Bx p={[0, 0, 0]} s={[2.5 + (i % 4), 0.3, 0.8 + (i % 3) * 0.3]} c={i % 2 ? '#7a8088' : '#4a4e56'} />}</group>; })}
</group>;
