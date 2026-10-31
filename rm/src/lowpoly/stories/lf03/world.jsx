// LF01 world pieces: aircraft, sailing ships, props (primitives only, low-poly, flat shaded).
import * as THREE from 'three';
import {Glow, Smoke, rng, clamp01} from '../../kit/index.js';

const L = ({c, e, ...r}) => <meshLambertMaterial color={c} flatShading emissive={e || '#000000'} {...r} />;
const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', rot, e, ds}) => <mesh position={p} rotation={rot || [0, 0, 0]}><boxGeometry args={s} /><L c={c} e={e} side={ds ? THREE.DoubleSide : THREE.FrontSide} /></mesh>;
const Cy = ({p = [0, 0, 0], a = [0.5, 0.5, 1, 8], c = '#888', rot, e}) => <mesh position={p} rotation={rot || [0, 0, 0]}><cylinderGeometry args={a} /><L c={c} e={e} /></mesh>;

export const dirv = (r, s) => [Math.sin(r) * s, 0, Math.cos(r) * s];

/** Grumman Avenger torpedo bomber, faces +Z. */
export const Avenger = ({position = [0, 0, 0], rotation = 0, f = 0, bank = 0, pitch = 0, scale = 1, color = '#27375c', lights = false}) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}><group rotation={[pitch, 0, bank]}>
    <Cy a={[0.52, 0.4, 3.4, 8]} rot={[Math.PI / 2, 0, 0]} c={color} />
    <Cy p={[0, 0, 1.95]} a={[0.55, 0.52, 0.55, 8]} rot={[Math.PI / 2, 0, 0]} c="#3a3a40" />
    <Cy p={[0, 0, -2.3]} a={[0.1, 0.4, 1.3, 6]} rot={[Math.PI / 2, 0, 0]} c={color} />
    <Bx p={[0, -0.12, 0.2]} s={[6.6, 0.12, 1.35]} c={color} />
    <Bx p={[-3.35, -0.12, 0.2]} s={[0.4, 0.14, 1.0]} c="#d8d8d8" />
    <Bx p={[3.35, -0.12, 0.2]} s={[0.4, 0.14, 1.0]} c="#d8d8d8" />
    <Bx p={[0, 0.8, -2.3]} s={[0.1, 1.2, 0.9]} c={color} rot={[-0.25, 0, 0]} />
    <Bx p={[0, 0.2, -2.3]} s={[2.4, 0.08, 0.65]} c={color} />
    <Bx p={[0, 0.62, 0.2]} s={[0.6, 0.5, 1.5]} c="#9fc3dd" />
    {[-1.9, 1.9].map((x) => <mesh key={x} position={[x, -0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.32, 10]} /><meshBasicMaterial color="#f4f4f4" side={THREE.DoubleSide} /></mesh>)}
    <group position={[0, 0, 2.28]} rotation={[0, 0, f * 1.9]}>
      <Bx s={[2.3, 0.18, 0.04]} c="#222" /><Bx s={[0.18, 2.3, 0.04]} c="#222" />
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.15, 1.15, 0.01, 18]} /><meshBasicMaterial color="#e0e8f0" transparent opacity={0.16} side={THREE.DoubleSide} /></mesh>
    </group>
    {lights && <><Glow position={[3.4, -0.1, 0.2]} size={1.1} color="#ff3a2a" opacity={0.9} /><Glow position={[-3.4, -0.1, 0.2]} size={1.1} color="#3aff6a" opacity={0.9} /></>}
  </group></group>
);

/** V / echelon formation of n Avengers. t = frame for prop spin + bobbing. */
export const Squad = ({position = [0, 0, 0], rotation = 0, n = 5, f = 0, gap = [5.5, 3.2], bank = 0, scale = 1, color, lights, lost = null}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {Array.from({length: n}, (_, i) => { if (lost !== null && i >= lost) return null; const k = i === 0 ? 0 : Math.ceil(i / 2) * (i % 2 ? 1 : -1);
      return <Avenger key={i} position={[k * gap[0], Math.sin(f * 0.07 + i * 1.7) * 0.35 + (i ? 0 : 0.2), -Math.abs(k) * gap[1] + Math.cos(f * 0.05 + i) * 0.3]} f={f + i * 3} bank={bank + Math.sin(f * 0.05 + i) * 0.04} scale={scale} color={color} lights={lights} />; })}
  </group>
);

/** Martin PBM Mariner flying boat (gull wing, twin tail), faces +Z. */
export const Mariner = ({position = [0, 0, 0], rotation = 0, f = 0, bank = 0, pitch = 0, scale = 1, lights = true}) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}><group rotation={[pitch, 0, bank]}>
    <Bx p={[0, 0, 0]} s={[2.0, 1.7, 8.4]} c="#a9b2bd" />
    <mesh position={[0, 0, 4.9]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[1.0, 1, 0.85]}><coneGeometry args={[1.35, 1.8, 4]} /><L c="#a9b2bd" /></mesh>
    <Bx p={[0, -0.95, 0.4]} s={[1.5, 0.3, 6.5]} c="#6c7480" />
    <Bx p={[0, 0.95, 2.4]} s={[1.2, 0.6, 2.4]} c="#8ec0d8" />
    {[-1, 1].map((sd) => <group key={sd}>
      <Bx p={[sd * 1.9, 1.2, -0.2]} s={[3.2, 0.2, 2.2]} c="#c9d0d8" rot={[0, 0, sd * 0.1]} />
      <Bx p={[sd * 5.7, 1.55, -0.2]} s={[4.6, 0.18, 1.9]} c="#c9d0d8" rot={[0, 0, -sd * 0.05]} />
      <Cy p={[sd * 3.4, 1.15, 1.0]} a={[0.42, 0.42, 1.8, 8]} rot={[Math.PI / 2, 0, 0]} c="#59606b" />
      <group position={[sd * 3.4, 1.15, 2.0]} rotation={[0, 0, f * 1.8 + sd]}><Bx s={[2.0, 0.16, 0.04]} c="#222" /><Bx s={[0.16, 2.0, 0.04]} c="#222" /></group>
      <Bx p={[sd * 2.0, 1.2, -3.9]} s={[0.12, 1.9, 1.1]} c="#a9b2bd" />
      <Bx p={[sd * 7.7, 1.35, -0.2]} s={[0.4, 0.16, 1.1]} c="#e8e8e8" />
    </group>)}
    <Bx p={[0, 0.5, -4.0]} s={[4.2, 0.1, 1.1]} c="#a9b2bd" />
    <Cy p={[0, 0.2, -4.7]} a={[0.1, 0.8, 1.6, 6]} rot={[Math.PI / 2, 0, 0]} c="#a9b2bd" />
    {lights && <><Glow position={[7.8, 1.4, -0.2]} size={1.4} color="#ff3a2a" opacity={0.9 * (0.6 + 0.4 * Math.sin(f * 0.4))} /><Glow position={[-7.8, 1.4, -0.2]} size={1.4} color="#3aff6a" opacity={0.9} /></>}
  </group></group>
);

const Sail = ({p, w = 2.2, h = 5, rot = [0, 0, 0], c = '#e9e2cc', bulge = 0.15, tatter = false}) => (
  <mesh position={p} rotation={rot}><planeGeometry args={[w, h, 3, 4]} /><L c={c} side={THREE.DoubleSide} wireframe={false} transparent opacity={tatter ? 0.85 : 1} /></mesh>
);
const hull = (len, w, h, c, stripe) => <>
  <Bx p={[0, 0.35, 0]} s={[w, h, len]} c={c} />
  <mesh position={[0, 0.35, len / 2 + w * 0.45]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[1, 1, h / (w * 1.0) * 0.9]}><coneGeometry args={[w * 0.72, w * 1.0, 4]} /><L c={c} /></mesh>
  <Bx p={[0, 0.35 + h / 2 - 0.12, 0]} s={[w + 0.04, 0.12, len + 0.02]} c={stripe} />
  <Bx p={[0, 0.35 + h / 2 + 0.03, 0]} s={[w - 0.15, 0.1, len - 0.15]} c="#8a6a48" />
</>;

/** Five-masted schooner (Carroll A. Deering). sails 0..1 amount set. */
export const Schooner = ({position = [0, 0, 0], rotation = 0, f = 0, rough = 1, masts = 5, sails = 1, scale = 1, c = '#1c2430', tilt = 0, sink = 0}) => {
  const pitch = Math.sin(f * 0.07) * 0.05 * rough, roll = Math.sin(f * 0.05 + 1) * 0.07 * rough + tilt, heave = Math.sin(f * 0.08) * 0.2 * rough;
  const len = 13; const mz = Array.from({length: masts}, (_, i) => -len / 2 + 1.8 + i * ((len - 3.2) / (masts - 1)));
  return <group position={[position[0], position[1] + heave - sink, position[2]]} rotation={[0, rotation, 0]} scale={scale}><group rotation={[pitch, 0, roll]}>
    {hull(len, 2.4, 1.3, c, '#b8342c')}
    <Cy p={[0, 1.2, len / 2 + 1.2]} a={[0.05, 0.08, 3.4, 5]} rot={[Math.PI / 2 - 0.35, 0, 0]} c="#4a3626" />
    {mz.map((z, i) => <group key={i}>
      <Cy p={[0, 4.4, z]} a={[0.07, 0.11, 8.2, 6]} c="#5a4630" />
      {sails > 0 && <Sail p={[0.12, 3.5, z - 1.25]} w={2.5} h={5.2 * sails} rot={[0, Math.PI / 2 + Math.sin(f * 0.04 + i) * 0.04, 0.0]} />}
      {sails > 0 && <Sail p={[0.12, 7.0, z - 0.95]} w={1.9} h={2.4 * sails} rot={[0, Math.PI / 2, 0]} c="#e0d8c0" />}
    </group>)}
  </group></group>;
};

/** Brigantine (Mary Celeste): two masts, square sails. set = [fore, main] sail amounts (0-1). */
export const Brig = ({position = [0, 0, 0], rotation = 0, f = 0, rough = 1, set = [1, 1], scale = 1, c = '#20262e', tatter = false}) => {
  const pitch = Math.sin(f * 0.07) * 0.05 * rough, roll = Math.sin(f * 0.05 + 1) * 0.07 * rough, heave = Math.sin(f * 0.08) * 0.2 * rough;
  const len = 8.6; const mz = [1.7, -1.6];
  return <group position={[position[0], position[1] + heave, position[2]]} rotation={[0, rotation, 0]} scale={scale}><group rotation={[pitch, 0, roll]}>
    {hull(len, 2.3, 1.2, c, '#e6e0d0')}
    <Cy p={[0, 1.15, len / 2 + 1.1]} a={[0.05, 0.08, 3.2, 5]} rot={[Math.PI / 2 - 0.4, 0, 0]} c="#4a3626" />
    {mz.map((z, i) => <group key={i}>
      <Cy p={[0, 3.6, z]} a={[0.07, 0.11, 7.0, 6]} c="#5a4630" />
      {[2.0, 3.7, 5.2].map((y, k) => (set[i] > k / 3 + 0.05) && <Sail key={k} p={[0, y + 0.1, z + 0.08 + Math.sin(f * 0.04 + k) * 0.05]} w={3.6 - k * 0.5} h={1.5} rot={[0, 0, tatter && k === 2 ? 0.12 : 0]} tatter={tatter} />)}
    </group>)}
    <Bx p={[0, 1.55, -len / 2 + 0.7]} s={[1.5, 0.7, 1.4]} c="#cbb892" />
  </group></group>;
};

/** Joyita: small motor yacht. sink 0..1 = low in the water; tilt = list. */
export const Joyita = ({position = [0, 0, 0], rotation = 0, f = 0, rough = 1, sink = 0, tilt = 0, scale = 1.35, lit = false}) => {
  const heave = Math.sin(f * 0.08) * 0.16 * rough, roll = Math.sin(f * 0.05) * 0.06 * rough + tilt, pitch = Math.sin(f * 0.07) * 0.04 * rough;
  return <group position={[position[0], position[1] + heave - sink * 0.75, position[2]]} rotation={[0, rotation, 0]} scale={scale}><group rotation={[pitch, 0, roll]}>
    <Bx p={[0, 0.35, 0]} s={[1.7, 1.0, 6.2]} c="#d9d5c8" />
    <mesh position={[0, 0.35, 3.55]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[1, 1, 0.8]}><coneGeometry args={[1.25, 1.4, 4]} /><L c="#d9d5c8" /></mesh>
    <Bx p={[0, 0.2, 0]} s={[1.74, 0.3, 6.25]} c="#2b5a8a" />
    <Bx p={[0, 1.2, -0.5]} s={[1.3, 0.9, 2.6]} c="#efece0" />
    <Bx p={[0, 1.15, -0.5]} s={[1.34, 0.35, 2.64]} c="#6aa0c0" e={lit ? '#ffcf70' : '#000000'} />
    <Bx p={[0, 1.7, -0.5]} s={[1.4, 0.1, 2.8]} c="#a8423a" />
    <Cy p={[0, 2.9, -1.2]} a={[0.04, 0.05, 2.8, 5]} c="#777" />
    <Cy p={[0, 2.8, 1.0]} a={[0.04, 0.05, 2.4, 5]} c="#777" />
  </group></group>;
};

/** Generic merchant/liner/collier hull (use for Waratah, Cyclops, tankers). */
export const Liner = ({position = [0, 0, 0], rotation = 0, f = 0, rough = 1, scale = 1, hullC = '#16161c', band = '#d8d0c0', funnelC = '#c9a85a', funnels = 1, len = 11, lit = 0, smoke = true, sink = 0, masts = 2}) => {
  const pitch = Math.sin(f * 0.07) * 0.045 * rough, roll = Math.sin(f * 0.05 + 1) * 0.08 * rough, heave = Math.sin(f * 0.08) * 0.22 * rough;
  return <group position={[position[0], position[1] + heave - sink, position[2]]} rotation={[0, rotation, 0]} scale={scale}><group rotation={[pitch, 0, roll]}>
    <Bx p={[0, 0.55, 0]} s={[2.4, 1.5, len]} c={hullC} />
    <mesh position={[0, 0.55, len / 2 + 1.0]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[1.2, 1, 0.9]}><coneGeometry args={[1.4, 2.0, 4]} /><L c={hullC} /></mesh>
    <Bx p={[0, 1.35, 0]} s={[2.44, 0.14, len + 0.02]} c={band} />
    <Bx p={[0, 2.1, 0.0]} s={[1.9, 1.3, len * 0.55]} c="#e8e2d2" />
    <Bx p={[0, 3.0, 0.6]} s={[1.6, 0.6, len * 0.3]} c="#d8d0be" />
    {Array.from({length: funnels}, (_, i) => <group key={i}><Cy p={[0, 3.9, 1.2 - i * 1.7]} a={[0.45, 0.55, 1.9, 8]} c={funnelC} /><Cy p={[0, 4.95, 1.2 - i * 1.7]} a={[0.47, 0.47, 0.25, 8]} c="#141414" />
      {smoke && <Smoke position={[0, 5.0, 1.2 - i * 1.7]} frame={f * 2} count={9} height={5} color="#8b93a3" opacity={0.45} wind={[0, 0, -1.2]} size={1.5} />}</group>)}
    {Array.from({length: masts}, (_, i) => <Cy key={'m' + i} p={[0, 4.2, len / 2 - 1.2 - i * (len - 2.4)]} a={[0.05, 0.08, 5.2, 5]} c="#3a2e24" />)}
    {lit > 0 && [-1.3, -0.4, 0.5, 1.4, 2.3].map((z, i) => [-1, 1].map((sd) => <mesh key={z + '' + sd} position={[sd * 0.96, 2.1, z * 0.9]} rotation={[0, sd * Math.PI / 2, 0]}><circleGeometry args={[0.12, 8]} /><meshBasicMaterial color="#ffd36a" /></mesh>))}
  </group></group>;
};

/** Open rowing/lifeboat with oars. */
export const Lifeboat = ({position = [0, 0, 0], rotation = 0, f = 0, scale = 1, c = '#8a4a2a'}) => (
  <group position={[position[0], position[1] + Math.sin(f * 0.1) * 0.15, position[2]]} rotation={[0, rotation, Math.sin(f * 0.08) * 0.08]} scale={scale}>
    <Bx p={[0, 0.3, 0]} s={[1.2, 0.55, 3.2]} c={c} />
    <mesh position={[0, 0.3, 1.9]} rotation={[Math.PI / 2, Math.PI / 4, 0]}><coneGeometry args={[0.85, 1.2, 4]} /><L c={c} /></mesh>
    {[-1, 1].map((sd) => <Bx key={sd} p={[sd * 1.0, 0.55, 0.1]} s={[1.6, 0.05, 0.1]} c="#caa87a" rot={[0, Math.sin(f * 0.2) * 0.3 * sd, 0.1 * sd]} />)}
  </group>
);

/** wet planked deck floor. */
export const Deck = ({w = 20, d = 20, y = 0, c = '#7a5a3c', wet = false}) => {
  const planks = useMemoPlanks(w, d);
  return <group position={[0, y, 0]}>
    <Bx p={[0, -0.1, 0]} s={[w, 0.2, d]} c={c} />
    {planks.map((x, i) => <Bx key={i} p={[x, 0.005, 0]} s={[0.05, 0.02, d]} c={wet ? '#2a1f16' : '#4a3623'} />)}
  </group>;
};
const useMemoPlanks = (w, d) => { const n = Math.floor(w / 0.9); return Array.from({length: n}, (_, i) => -w / 2 + 0.45 + i * 0.9); };

// ------------------------------------------------------------------ PROPS (dark room / close-up hero objects)
export const Compass = ({f = 0, mad = 1}) => {
  const a = mad ? Math.sin(f * 0.21) * 2.1 + Math.sin(f * 0.53) * 0.9 + f * 0.04 : 0;
  return <group rotation={[-0.55, 0, 0]}>
    <Cy a={[2.4, 2.5, 0.5, 24]} c="#b88a3a" />
    <Cy p={[0, 0.28, 0]} a={[2.05, 2.05, 0.1, 24]} c="#efe9d6" />
    {Array.from({length: 36}, (_, i) => <Bx key={i} p={[Math.sin(i / 36 * 6.283) * 1.85, 0.36, Math.cos(i / 36 * 6.283) * 1.85]} s={[i % 9 === 0 ? 0.16 : 0.07, 0.04, i % 9 === 0 ? 0.42 : 0.22]} c="#222" rot={[0, i / 36 * 6.283, 0]} />)}
    <group position={[0, 0.5, 0]} rotation={[0, a, 0]}>
      <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.2, 1.7, 4]} /><L c="#d6302a" /></mesh>
      <mesh position={[0, 0, -0.8]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[0.2, 1.7, 4]} /><L c="#e8e8e8" /></mesh>
      <Cy p={[0, 0.05, 0]} a={[0.18, 0.18, 0.18, 8]} c="#222" />
    </group>
    <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[2.05, 2.05, 0.02, 24]} /><meshPhongMaterial color="#cfe6ff" transparent opacity={0.18} shininess={120} /></mesh>
  </group>;
};
/** the Compass but the needle is gone (missing instrument). */
export const EmptyBracket = ({label}) => <group><Cy a={[2.4, 2.5, 0.5, 24]} c="#3a3228" /><Cy p={[0, 0.28, 0]} a={[2.05, 2.05, 0.1, 24]} c="#171411" /></group>;

export const SignalLamp = ({f = 0, pattern = '1110110111010111'}) => {
  const on = pattern[Math.floor(f / 5) % pattern.length] === '1';
  return <group>
    <Cy p={[0, 0.9, 0]} a={[0.08, 0.08, 1.8, 6]} c="#333" />
    <group position={[0, 1.9, 0]}>
      <Cy a={[0.8, 0.9, 1.7, 14]} rot={[Math.PI / 2, 0, 0]} c="#2c3a2c" />
      <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.72, 0.72, 0.05, 14]} /><meshBasicMaterial color={on ? '#fff6c0' : '#4a4430'} /></mesh>
      <Bx p={[0, 0.95, -0.2]} s={[0.25, 0.3, 0.9]} c="#222" />
      {on && <Glow position={[0, 0, 1.1]} size={6} color="#ffe9a0" opacity={0.95} />}
      {on && <pointLight position={[0, 0, 2]} color="#ffe6a0" intensity={14} distance={14} decay={1.5} />}
    </group>
  </group>;
};

export const Derby = ({position = [0, 0, 0], rot = 0}) => <group position={position} rotation={[0, rot, 0]}>
  <Cy p={[0, 0.2, 0]} a={[0.55, 0.7, 0.5, 14]} c="#1b1713" />
  <mesh position={[0, 0.45, 0]} scale={[1, 0.55, 1]}><sphereGeometry args={[0.56, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><L c="#1b1713" /></mesh>
  <Cy p={[0, 0.02, 0]} a={[1.0, 1.0, 0.05, 16]} c="#16120f" />
  <Cy p={[0, 0.1, 0]} a={[0.72, 0.72, 0.1, 14]} c="#2a2a30" />
</group>;
export const Chair = ({position = [0, 0, 0], rot = 0}) => <group position={position} rotation={[0, rot, 0]}>
  <Bx p={[0, 1.0, 0]} s={[1.5, 0.12, 1.5]} c="#6a4a2e" />
  <Bx p={[0, 2.0, -0.7]} s={[1.5, 1.9, 0.12]} c="#5a3d26" />
  {[[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]].map(([x, z], i) => <Bx key={i} p={[x, 0.5, z]} s={[0.12, 1.0, 0.12]} c="#5a3d26" />)}
  {[-0.45, 0, 0.45].map((x) => <Bx key={x} p={[x, 2.2, -0.62]} s={[0.1, 1.2, 0.05]} c="#4a3220" />)}
</group>;

export const Hatch = ({f = 0}) => <group>
  <Bx p={[0, 0.15, 0]} s={[3.4, 0.3, 3.4]} c="#6a5038" />
  <Bx p={[0, 0.31, 0]} s={[2.6, 0.04, 2.6]} c="#000000" />
  {[[-1.5, 0], [1.5, 0]].map(([x], i) => <Bx key={i} p={[x, 0.35, 0]} s={[0.25, 0.5, 3.4]} c="#7d6244" />)}
  {[[0, -1.5], [0, 1.5]].map(([, z], i) => <Bx key={'z' + i} p={[0, 0.35, z]} s={[3.4, 0.5, 0.25]} c="#7d6244" />)}
  <Bx p={[-2.6, 0.2, -0.4]} s={[1.9, 0.12, 2.6]} c="#8a6a48" rot={[0, 0.15, -0.35]} />
  <group position={[0, -1.5, 0]}>{[0, 1, 2, 3, 4].map((i) => <Bx key={i} p={[0.9, i * 0.6, 0]} s={[0.05, 0.05, 1.0]} c="#4a3a2a" />)}</group>
  <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[1.0, 1.35, 2.2, 10, 1, true]} /><meshBasicMaterial color="#ffe2a0" transparent opacity={0.12 + Math.sin(f * 0.05) * 0.02} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
</group>;

export const Stove = ({f = 0}) => <group>
  <Bx p={[0, 0.9, 0]} s={[3.2, 1.8, 1.8]} c="#202226" />
  <Bx p={[0, 1.85, 0]} s={[3.3, 0.12, 1.9]} c="#33363c" />
  {[[-0.9, 0.3], [0.9, 0.3], [0, -0.35]].map(([x, z], i) => <group key={i} position={[x, 1.92, z]}>
    <Cy p={[0, 0.5, 0]} a={[0.55, 0.45, 0.9, 12]} c="#3b3f46" />
    <Cy p={[0, 1.0 + Math.max(0, Math.sin(f * 0.9 + i * 2)) * 0.06, 0]} a={[0.56, 0.56, 0.08, 12]} c="#555a63" rot={[Math.sin(f * 0.8 + i) * 0.05, 0, 0]} />
    <Smoke position={[0, 1.05, 0]} frame={f + i * 17} count={6} height={2.6} color="#e8ecf2" opacity={0.4} wind={[0.1, 0, 0]} size={0.7} />
  </group>)}
  <Cy p={[1.2, 3.1, -0.7]} a={[0.16, 0.16, 2.5, 8]} c="#18191c" />
  <Bx p={[0, 0.2, 1.0]} s={[2.4, 0.4, 0.05]} c="#ff8a2a" e="#ff5a10" />
</group>;
export const Cat = ({position = [0, 0, 0], rot = 0, f = 0}) => <group position={position} rotation={[0, rot, 0]}>
  <Bx p={[0, 0.25, 0]} s={[0.35, 0.28, 0.9]} c="#4a4038" /><Bx p={[0, 0.42, 0.55]} s={[0.3, 0.28, 0.3]} c="#4a4038" />
  <Bx p={[-0.09, 0.62, 0.58]} s={[0.07, 0.12, 0.07]} c="#4a4038" /><Bx p={[0.09, 0.62, 0.58]} s={[0.07, 0.12, 0.07]} c="#4a4038" />
  <Bx p={[0, 0.3, -0.55 + Math.sin(f * 0.1) * 0.05]} s={[0.07, 0.07, 0.6]} c="#3a322c" rot={[0.5, 0, 0]} />
  <mesh position={[-0.07, 0.45, 0.71]}><boxGeometry args={[0.05, 0.05, 0.02]} /><meshBasicMaterial color="#e8ff7a" /></mesh><mesh position={[0.07, 0.45, 0.71]}><boxGeometry args={[0.05, 0.05, 0.02]} /><meshBasicMaterial color="#e8ff7a" /></mesh>
</group>;

export const DoctorBag = ({f = 0}) => <group>
  <Bx p={[0, 0.5, 0]} s={[2.4, 0.9, 1.2]} c="#4a2e1c" />
  <Bx p={[0, 0.95, -0.55]} s={[2.4, 0.1, 0.12]} c="#2a1a10" />
  <Bx p={[0, 1.15, -0.1]} s={[2.4, 0.08, 1.2]} c="#5a3822" rot={[-1.1, 0, 0]} />
  <mesh position={[0, 1.45, 0.3]} rotation={[0, 0, 0]}><torusGeometry args={[0.55, 0.05, 6, 12, Math.PI]} /><L c="#2a1a10" /></mesh>
  <group position={[2.0, 0.04, 0.5]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.35, 0.04, 6, 14]} /><L c="#c8ccd2" /></mesh>
    <mesh position={[0.5, 0, 0.2]} rotation={[-Math.PI / 2, 0, 0.5]}><torusGeometry args={[0.7, 0.025, 5, 14, 3.3]} /><L c="#222" /></mesh>
    <Cy p={[0.5, 0.03, -0.7]} a={[0.1, 0.1, 0.05, 8]} c="#c8ccd2" />
  </group>
  <Bx p={[-2.0, 0.03, 0.6]} s={[0.9, 0.02, 0.06]} c="#dfe3e8" rot={[0, 0.6, 0]} />
  <Bx p={[-1.4, 0.03, 1.4]} s={[0.12, 0.02, 0.5]} c="#c8ccd2" rot={[0, 0.3, 0]} />
  {[[-2.2, -0.8, 0.2], [-2.8, -0.2, -0.5], [-1.5, -1.3, 0.8], [-2.6, -1.0, 1.0]].map(([x, z, r], i) => <group key={i} position={[x, 0.04, z + 1.2]} rotation={[0, r, 0]}>
    <Bx s={[0.9, 0.04, 0.35]} c="#eee8dc" /><Bx p={[0.1 * (i - 1.5), 0.03, 0]} s={[0.22, 0.02, 0.2]} c="#a01c14" /></group>)}
</group>;

export const Radio = ({f = 0}) => <group>
  <Bx p={[0, 0.9, 0]} s={[3.0, 1.6, 1.4]} c="#3a3a32" />
  <Bx p={[0, 0.9, 0.72]} s={[2.6, 1.2, 0.05]} c="#1a1a16" />
  <Bx p={[-0.4, 1.15, 0.76]} s={[1.5, 0.45, 0.03]} c="#b8c8a0" e="#6a8a50" />
  {[-0.9, 0.4, 1.1].map((x, i) => <Cy key={i} p={[x, 0.55, 0.78]} a={[0.2, 0.2, 0.12, 10]} c="#c8c0a8" rot={[Math.PI / 2, 0, 0]} />)}
  <Bx p={[0, 2.0, -0.2]} s={[0.05, 1.4, 0.05]} c="#999" />
  <mesh position={[1.7, 0.5, 0.2]} rotation={[0, 0, 0]}><torusGeometry args={[0.9, 0.06, 6, 20, 4.2]} /><L c="#1b1b1b" /></mesh>
  <mesh position={[1.7, 0.5, 0.2]} rotation={[0, 0, 0.6]}><torusGeometry args={[0.9, 0.075, 6, 10, 0.9]} /><L c="#f2f2ea" /></mesh>
</group>;

export const WallClock = ({f = 0}) => <group>
  <Cy a={[1.5, 1.5, 0.25, 24]} rot={[Math.PI / 2, 0, 0]} c="#2a2018" />
  <Cy p={[0, 0, 0.14]} a={[1.32, 1.32, 0.05, 24]} rot={[Math.PI / 2, 0, 0]} c="#f1ecda" />
  {Array.from({length: 12}, (_, i) => { const a = i / 12 * Math.PI * 2; return <Bx key={i} p={[Math.sin(a) * 1.1, Math.cos(a) * 1.1, 0.19]} s={[0.07, 0.22, 0.02]} c="#222" rot={[0, 0, -a]} />; })}
  {/* 10:25 */}
  <Bx p={[Math.sin(-1.05) * 0.36, Math.cos(-1.05) * 0.36, 0.22]} s={[0.1, 0.7, 0.03]} c="#111" rot={[0, 0, 1.05]} />
  <Bx p={[Math.sin(2.62) * 0.55, Math.cos(2.62) * 0.55, 0.24]} s={[0.07, 1.05, 0.03]} c="#111" rot={[0, 0, -2.62]} />
  <Cy p={[0, 0, 0.26]} a={[0.1, 0.1, 0.05, 8]} c="#aa2a20" rot={[Math.PI / 2, 0, 0]} />
</group>;

export const Bulb = ({position = [0, 0, 0], f = 0}) => <group position={position}>
  <Cy p={[0, 0.8, 0]} a={[0.02, 0.02, 1.6, 4]} c="#111" />
  <mesh><sphereGeometry args={[0.22, 8, 8]} /><meshBasicMaterial color="#fff0b0" /></mesh>
  <Glow position={[0, 0, 0]} size={3.2} color="#ffd890" opacity={0.7 + Math.sin(f * 0.7) * 0.12} />
</group>;
