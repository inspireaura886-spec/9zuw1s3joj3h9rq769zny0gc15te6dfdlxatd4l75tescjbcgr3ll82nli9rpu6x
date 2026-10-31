import * as THREE from 'three';
import {useMemo} from 'react';
import {Terrain, makeHeight, Building, Tree, Fence, rng, smoothstep, fbm, hash2} from '../kit/index.js';
import {AppleTree, Corn, Sign} from './Props.jsx';

// Countryside around St. Louis: rolling farmland, one dusty road running along +z.
export const roadX = (z) => 4 * Math.sin(z * 0.018) + 1.5 * Math.sin(z * 0.047 + 1);
const base = makeHeight({seed: 19, amp: 3.2, freq: 0.035});
export const ground = (x, z) => {
  const d = Math.abs(x - roadX(z));
  return base(x, z) * smoothstep(3.5, 16, d) + 0.02 * d - 0.15 + 0.0 * z;
};
const ROAD_W = 4.2;
const colorFn = (cornX) => (h, x, z) => {
  const d = Math.abs(x - roadX(z));
  if (d < ROAD_W / 2) return hash2(Math.floor(x * 2), Math.floor(z * 2), 3) < 0.5 ? '#d9a865' : '#cf9b58';
  if (d < ROAD_W / 2 + 0.9) return '#b98f4e';
  const field = Math.floor((x + 400) / 14) + Math.floor((z + 400) / 18);
  const pal = ['#8cc24a', '#a6c94e', '#d8b84e', '#7ab446', '#c9a948', '#94c656'];
  return pal[((field % pal.length) + pal.length) % pal.length];
};

const props = (() => {
  const r = rng(77); const houses = [], trees = [], poles = [], hay = [];
  for (let z = -160; z < 220; z += 24 + r() * 18) { const side = r() < 0.5 ? -1 : 1; houses.push({z, x: roadX(z) + side * (14 + r() * 18), rot: r() * 6.28, c: ['#e8d6b0', '#d8b48a', '#f0e2c8', '#c96a4a'][Math.floor(r() * 4)], rc: ['#a8352f', '#5a6a8a', '#7a4a2a'][Math.floor(r() * 3)], barn: r() < 0.35}); }
  for (let i = 0; i < 260; i++) { const z = -170 + r() * 400; const side = r() < 0.5 ? -1 : 1; const x = roadX(z) + side * (7 + Math.pow(r(), 0.7) * 60); trees.push({x, z, s: 0.9 + r() * 1.3, kind: r() < 0.25 ? 'pine' : 'round', seed: i}); }
  for (let z = -170; z < 230; z += 9) poles.push({z, x: roadX(z) + 3.6});
  for (let i = 0; i < 40; i++) { const z = -160 + r() * 380; const side = r() < 0.5 ? -1 : 1; hay.push({z, x: roadX(z) + side * (9 + r() * 25), rot: r() * 3}); }
  return {houses, trees, poles, hay};
})();

/** Telegraph pole with crossbar. */
const Pole = ({x, z}) => <group position={[x, ground(x, z), z]}>
  <mesh position={[0, 3, 0]}><cylinderGeometry args={[0.09, 0.12, 6, 5]} /><meshLambertMaterial color="#6b4a2b" flatShading /></mesh>
  <mesh position={[0, 5.6, 0]}><boxGeometry args={[1.4, 0.1, 0.1]} /><meshLambertMaterial color="#6b4a2b" /></mesh>
</group>;

/**
 * RoadWorld: the whole countryside. window [zMin,zMax] limits which props render (performance).
 * orchard: rows of apple trees around zOrchard; corn: cornfield around zCorn with optional part fn.
 */
export const RoadWorld = ({frame = 0, win = [-60, 80], center = 10, orchard = null, corn = null, cornPart, tint = '#ffffff', houses = true, extra}) => {
  const cf = useMemo(() => colorFn(), []);
  const inW = (z) => z > win[0] && z < win[1];
  return <group>
    <Terrain height={ground} size={230} seg={100} colorFn={cf} center={[roadX(center), center]} tint={tint} jitter={0.25} />
    {props.poles.filter((p) => inW(p.z)).map((p, i) => <Pole key={i} x={p.x} z={p.z} />)}
    {/* wires */}
    {props.poles.filter((p) => inW(p.z)).slice(0, -1).map((p, i, a) => { const q = props.poles[props.poles.indexOf(p) + 1]; const mz = (p.z + q.z) / 2, mx = (p.x + q.x) / 2, L = Math.hypot(q.z - p.z, q.x - p.x);
      return <mesh key={'w' + i} position={[mx, ground(mx, mz) + 5.45, mz]} rotation={[0, Math.atan2(q.x - p.x, q.z - p.z), 0]}><boxGeometry args={[0.03, 0.03, L]} /><meshBasicMaterial color="#3a2a1c" /></mesh>; })}
    {houses && props.houses.filter((h) => inW(h.z)).map((h, i) => <Building key={i} position={[h.x, ground(h.x, h.z) - 0.1, h.z]} rotation={h.rot} w={h.barn ? 5 : 4} d={h.barn ? 4 : 3.2} h={h.barn ? 3.4 : 2.8} roof={h.barn ? 2.0 : 1.3} color={h.barn ? '#b8402e' : h.c} roofColor={h.barn ? '#5a3a2a' : h.rc} frame={frame} />)}
    {props.trees.filter((t) => inW(t.z) && !(orchard && Math.abs(t.z - orchard) < 22) && !(corn && Math.abs(t.z - corn) < 40 && Math.abs(t.x - roadX(t.z)) < 34)).map((t, i) =>
      <Tree key={i} position={[t.x, ground(t.x, t.z) - 0.1, t.z]} s={t.s} kind={t.kind} seed={t.seed} frame={frame} color={['#3f8a3a', '#4fa040', '#2f7a3a'][i % 3]} />)}
    {props.hay.filter((h) => inW(h.z)).map((h, i) => <mesh key={'h' + i} position={[h.x, ground(h.x, h.z) + 0.6, h.z]} rotation={[0, h.rot, Math.PI / 2]}><cylinderGeometry args={[0.7, 0.7, 1.2, 8]} /><meshLambertMaterial color="#e2c25a" flatShading /></mesh>)}
    {/* roadside fences */}
    {[-1, 1].map((s) => Array.from({length: 14}, (_, i) => { const z = win[0] + (i / 13) * (win[1] - win[0]); const z2 = z + (win[1] - win[0]) / 13 * 0.85; const x = roadX(z) + s * 3.2, x2 = roadX(z2) + s * 3.2;
      if (corn && Math.abs(z - corn) < 30 && s < 0) return null;
      return <Fence key={s + '_' + i} from={[x, ground(x, z), z]} to={[x2, ground(x2, z2), z2]} posts={5} color="#8a6a42" />; }))}
    {orchard !== null && <group>
      {Array.from({length: 5}, (_, row) => Array.from({length: 8}, (_, k) => { const z = orchard - 16 + k * 4.4; const x = roadX(z) - 6 - row * 4.2 - (k % 2) * 1.2; return <AppleTree key={row + '_' + k} position={[x, ground(x, z) - 0.05, z]} s={1.25} seed={row * 10 + k} frame={frame} />; }))}
      {Array.from({length: 4}, (_, row) => Array.from({length: 8}, (_, k) => { const z = orchard - 14 + k * 4.6; const x = roadX(z) + 7 + row * 4.4 + (k % 2) * 1.1; return <AppleTree key={'b' + row + '_' + k} position={[x, ground(x, z) - 0.05, z]} s={1.2} seed={row * 7 + k + 50} frame={frame} />; }))}
      <Sign position={[roadX(orchard - 18) - 3.6, ground(roadX(orchard - 18) - 3.6, orchard - 18), orchard - 18]} rotation={0.4} text={'ORCHARD'} w={2.6} h={0.9} post={1.2} opts={{size: 54}} />
    </group>}
    {corn !== null && <group position={[0, 0, 0]}>
      <Corn x0={roadX(corn) - 40} x1={roadX(corn) - 4.6} z0={corn - 34} z1={corn + 34} step={1.1} frame={frame} part={cornPart} seed={9} groundFn={ground} h={1.75} />
      <Corn x0={roadX(corn) + 4.6} x1={roadX(corn) + 30} z0={corn - 34} z1={corn + 34} step={1.15} frame={frame} seed={10} groundFn={ground} h={1.75} />
    </group>}
    {extra}
  </group>;
};
