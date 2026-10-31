import * as THREE from 'three';
import {useMemo} from 'react';
import {hash2} from './noise.js';
import {Glow} from './Sky.jsx';

// Triangular prism roof geometry (ridge along X).
const roofGeo = (w, d, h, over) => {
  const W = w / 2 + over, D = d / 2 + over;
  const v = [
    -W, 0, D, W, 0, D, W, h, 0,  -W, 0, D, W, h, 0, -W, h, 0,     // front slope
    W, 0, -D, -W, 0, -D, -W, h, 0,  W, 0, -D, -W, h, 0, W, h, 0, // back slope
    -W, 0, -D, -W, 0, D, -W, h, 0,  W, 0, D, W, 0, -D, W, h, 0,  // gables
    -W, 0, -D, W, 0, -D, W, 0, D,  -W, 0, -D, W, 0, D, -W, 0, D,  // underside
  ];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
};

const WIN_DARK = '#27324a';
const WIN_LIT = '#ffcf5a';
const flick = (frame, k) => 0.82 + 0.18 * Math.sin(frame * 0.35 + k * 1.7) * Math.sin(frame * 0.13 + k);

/**
 * Box house with pitched roof and window rectangles.
 * lit: 0..1 share of windows glowing (night); litSeed varies which ones. floors: rows of windows.
 */
export const Building = ({position = [0, 0, 0], rotation = 0, w = 4, d = 3, h = 3, floors = 1, roof = 1.4, color = '#d8c39a', roofColor = '#a8352f', lit = 0, litSeed = 1, door = true, scale = 1, frame = 0, glow = 1}) => {
  const rg = useMemo(() => roofGeo(w, d, roof, 0.25), [w, d, roof]);
  const wins = useMemo(() => {
    const out = []; const cols = Math.max(1, Math.round(w / 1.4)); const sideCols = Math.max(1, Math.round(d / 1.6));
    for (let f = 0; f < floors; f++) {
      const y = (h / floors) * (f + 0.58);
      for (let c = 0; c < cols; c++) {
        const x = -w / 2 + (w / cols) * (c + 0.5);
        if (door && f === 0 && c === Math.floor(cols / 2)) continue;
        out.push({p: [x, y, d / 2 + 0.02], r: 0, k: f * 31 + c}); out.push({p: [x, y, -d / 2 - 0.02], r: Math.PI, k: f * 31 + c + 7});
      }
      for (let c = 0; c < sideCols; c++) {
        const z = -d / 2 + (d / sideCols) * (c + 0.5);
        out.push({p: [w / 2 + 0.02, y, z], r: Math.PI / 2, k: f * 13 + c + 3}); out.push({p: [-w / 2 - 0.02, y, z], r: -Math.PI / 2, k: f * 17 + c + 5});
      }
    }
    return out;
  }, [w, d, h, floors, door]);
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, h / 2, 0]}><boxGeometry args={[w, h, d]} /><meshLambertMaterial color={color} flatShading /></mesh>
      <mesh geometry={rg} position={[0, h, 0]}><meshLambertMaterial color={roofColor} flatShading side={THREE.DoubleSide} /></mesh>
      {wins.map((wd, i) => {
        const on = hash2(wd.k, litSeed, 3) < lit;
        const fl = flick(frame, wd.k + litSeed);
        return <group key={i}><mesh position={wd.p} rotation={[0, wd.r, 0]}><planeGeometry args={[0.55, 0.75]} />
          {on ? <meshBasicMaterial color={new THREE.Color(WIN_LIT).multiplyScalar(0.85 + 0.25 * fl)} /> : <meshLambertMaterial color={WIN_DARK} />}</mesh>
          {on && glow > 0 && <Glow position={[wd.p[0] * 1.08, wd.p[1], wd.p[2] * 1.08]} size={2.8} opacity={0.75 * glow * fl} />}</group>;
      })}
      {door && <mesh position={[0, 0.65, d / 2 + 0.02]}><planeGeometry args={[0.7, 1.3]} /><meshLambertMaterial color="#5a3b24" /></mesh>}
    </group>
  );
};

/** Round hut: low-poly cylinder wall + cone thatch roof (grassland villages). lit: door glow 0..1 */
export const RoundHut = ({position = [0, 0, 0], rotation = 0, r = 1.4, h = 1.5, wall = '#c97a42', roofColor = '#e0a640', lit = 0, scale = 1, frame = 0, glow = 1, k = 0}) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[r, r * 1.04, h, 9]} /><meshLambertMaterial color={wall} flatShading /></mesh>
    <mesh position={[0, h + r * 0.55, 0]}><coneGeometry args={[r * 1.35, r * 1.3, 9]} /><meshLambertMaterial color={roofColor} flatShading /></mesh>
    <mesh position={[0, 0.5, r * 1.0 + 0.03]}><planeGeometry args={[0.55, 1.0]} />
      {lit > 0.5 ? <meshBasicMaterial color={new THREE.Color('#ffb648').multiplyScalar(0.8 + 0.3 * flick(frame, k))} /> : <meshLambertMaterial color="#3a2618" />}</mesh>
    {lit > 0.5 && glow > 0 && <Glow position={[0, 0.6, r + 0.4]} size={3.4} color="#ffa63a" opacity={0.85 * glow * flick(frame, k + 3)} />}
    {/* thatch rings for texture */}
    <mesh position={[0, h + r * 0.12, 0]}><coneGeometry args={[r * 1.38, r * 0.25, 9, 1, true]} /><meshLambertMaterial color="#a8823e" flatShading side={THREE.DoubleSide} /></mesh>
  </group>
);

/** Low-poly tree: trunk + 1-2 icosahedron/cone canopies. kind 'round' | 'pine' */
export const Tree = ({position = [0, 0, 0], s = 1, kind = 'round', color = '#3f7a35', seed = 1, frame = 0, wind = 1}) => (
  <group position={position} scale={s} rotation={[0, seed * 1.7, 0]}>
   <group rotation={[Math.sin(frame * 0.06 + seed) * 0.05 * wind, 0, Math.sin(frame * 0.045 + seed * 0.7) * 0.08 * wind]}>
    <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.14, 0.2, 1.2, 5]} /><meshLambertMaterial color="#6b4a2b" flatShading /></mesh>
    {kind === 'pine'
      ? <><mesh position={[0, 1.7, 0]}><coneGeometry args={[0.9, 1.6, 6]} /><meshLambertMaterial color={color} flatShading /></mesh>
          <mesh position={[0, 2.5, 0]}><coneGeometry args={[0.65, 1.2, 6]} /><meshLambertMaterial color={color} flatShading /></mesh></>
      : <><mesh position={[0, 1.75, 0]}><icosahedronGeometry args={[0.95, 0]} /><meshLambertMaterial color={color} flatShading /></mesh>
          <mesh position={[0.35, 2.3, 0.1]}><icosahedronGeometry args={[0.55, 0]} /><meshLambertMaterial color={new THREE.Color(color).multiplyScalar(1.25)} flatShading /></mesh></>}
   </group>
  </group>
);

/** Fence / post line between two points */
export const Fence = ({from = [0, 0, 0], to = [5, 0, 0], posts = 6, color = '#7a5a3a'}) => {
  const items = [];
  for (let i = 0; i < posts; i++) { const t = i / (posts - 1); items.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t]); }
  return <group>{items.map((p, i) => <mesh key={i} position={[p[0], p[1] + 0.4, p[2]]}><boxGeometry args={[0.12, 0.8, 0.12]} /><meshLambertMaterial color={color} /></mesh>)}</group>;
};
