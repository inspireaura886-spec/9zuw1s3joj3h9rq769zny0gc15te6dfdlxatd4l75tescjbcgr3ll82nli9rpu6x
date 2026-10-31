// Overtoun Bridge world: autumn wooded gorge (runs along z), three-arch stone bridge (spans x), Overtoun House, blocky dogs, mink.
import * as THREE from 'three';
import {useMemo} from 'react';
import {Terrain, Tree, Building, Water, Rock, Glow, useOutline, ink, fbm, rng, smoothstep, clamp01, ContactShadow} from '../../kit/index.js';

// ---- ground: flat banks at y~0, a deep gorge |x| < 12 down to ~-16 ----
export const GORGE_D = 16;
export const height = (x, z) => {
  const ax = Math.abs(x + Math.sin(z * 0.06) * 1.2);
  const depth = GORGE_D * (1 - smoothstep(3.5, 12, ax));
  const bank = 0.6 * fbm(x * 0.05, z * 0.05, 7, 3) + Math.max(0, ax - 18) * 0.12;
  return bank * (1 - depth / GORGE_D) - depth + fbm(x * 0.4, z * 0.4, 3, 2) * 0.5 * (depth / GORGE_D);
};
const groundCol = (y) => (y < -14.2 ? '#6a5a48' : y < -9 ? '#5d6a3a' : y < -3 ? '#7a7a3a' : '#6f8a36');
export const Ground = () => <Terrain height={height} size={150} seg={90} colorFn={(y) => groundCol(y)} />;

// ---- the burn at the bottom ----
export const Burn = ({frame = 0}) => <group>
  <Water position={[0, -15.3, 0]} shape="rect" size={[3.4, 150]} seg={30} color="#3a6a78" frame={frame} ripple={0.06} opacity={0.95} />
  {[[-1.2, 4], [1.0, -3], [0.4, 9], [-0.8, -9], [1.3, 1.5], [-1.4, -1], [0.2, 14], [-0.3, -15]].map(([x, z], i) => <Rock key={i} position={[x, -15.4, z]} size={0.7 + (i % 3) * 0.3} seed={i + 3} color="#7c7066" moss={i % 2 ? '#6a7a3a' : undefined} />)}
</group>;

// ---- stone: extruded elevation with three arch holes ----
const STONE = '#b49a86'; const STONE_D = '#8d7766';
let _ash = null;
const ashlar = () => { if (_ash) return _ash; const N = 128, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); const r = rng(77);
  g.fillStyle = '#5e4c40'; g.fillRect(0, 0, N, N);
  for (let row = 0; row < 4; row++) { const off = row % 2 ? 0 : 20; for (let x = -40; x < N; x += 40) { const v = 0.82 + r() * 0.3, gg = Math.round(180 * v), rr = Math.round(196 * v), bb = Math.round(166 * v);
    g.fillStyle = `rgb(${rr},${gg},${bb})`; g.fillRect(x + off + 2, row * 32 + 2, 36, 28); g.fillStyle = 'rgba(80,90,40,' + (r() * 0.25).toFixed(2) + ')'; g.fillRect(x + off + 2, row * 32 + 22, 36, 8); } }
  _ash = new THREE.CanvasTexture(cv); _ash.wrapS = _ash.wrapT = THREE.RepeatWrapping; _ash.repeat.set(0.42, 0.42); _ash.colorSpace = THREE.SRGBColorSpace; _ash.magFilter = THREE.NearestFilter; return _ash; };
const archHole = (x0, x1, spring, bottom) => { const r = (x1 - x0) / 2, cx = (x0 + x1) / 2; const h = new THREE.Path();
  h.moveTo(x0, bottom); h.lineTo(x0, spring); h.absarc(cx, spring, r, Math.PI, 0, true); h.lineTo(x1, bottom); h.lineTo(x0, bottom); return h; };
export const BRIDGE_X = 15; export const DECK_Y = 0; export const PARAPET_H = 1.15; export const WALL_Z = 2.05;
export const Bridge = ({glow = 0}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-BRIDGE_X, -17); s.lineTo(BRIDGE_X, -17); s.lineTo(BRIDGE_X, 0); s.lineTo(-BRIDGE_X, 0); s.lineTo(-BRIDGE_X, -17);
    s.holes.push(archHole(-4.4, 4.4, -9.5, -16.9), archHole(-11.6, -6.6, -4.3, -16.9), archHole(6.6, 11.6, -4.3, -16.9));
    const g = new THREE.ExtrudeGeometry(s, {depth: 4.1, bevelEnabled: false, curveSegments: 7}); g.translate(0, 0, -2.05); return g.toNonIndexed();
  }, []);
  const ol = useOutline();
  const bart = (x, z, k) => <group key={k} position={[x, 0, z]}>
    <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.75, 0.6, 1.9, 8]} /><meshLambertMaterial color={STONE} flatShading /></mesh>
    <mesh position={[0, -0.6, 0]}><coneGeometry args={[0.6, 1.2, 8]} /><meshLambertMaterial color={STONE_D} flatShading /></mesh>
    <mesh position={[0, 2.1, 0]}><coneGeometry args={[0.85, 0.6, 8]} /><meshLambertMaterial color={STONE_D} flatShading /></mesh>
  </group>;
  return <group>
    <mesh geometry={geo}><meshLambertMaterial map={ashlar()} color="#ffffff" flatShading /></mesh>
    {ol && <mesh geometry={geo} material={ink('#2a1a14')} scale={[1.003, 1.003, 1.02]} />}
    {/* string course + road */}
    <mesh position={[0, -1.2, 0]}><boxGeometry args={[BRIDGE_X * 2 + 0.2, 0.3, 4.5]} /><meshLambertMaterial color={STONE_D} flatShading /></mesh>
    <mesh position={[0, 0.02, 0]}><boxGeometry args={[BRIDGE_X * 2 + 6, 0.06, 3.5]} /><meshLambertMaterial color="#8a7a62" flatShading /></mesh>
    {/* parapet walls (solid, waist high on a man, taller than a dog) with a tapered coping */}
    {[-WALL_Z, WALL_Z].map((z, i) => <group key={i}>
      <mesh position={[0, PARAPET_H / 2, z]}><boxGeometry args={[BRIDGE_X * 2 + 4, PARAPET_H, 0.42]} /><meshLambertMaterial color={STONE} flatShading /></mesh>
      <mesh position={[0, PARAPET_H + 0.08, z]} rotation={[0, 0, 0]}><boxGeometry args={[BRIDGE_X * 2 + 4.2, 0.16, 0.5]} /><meshLambertMaterial color="#c8b29e" flatShading /></mesh>
      {Array.from({length: 17}, (_, k) => <mesh key={k} position={[-BRIDGE_X - 1.6 + k * 2.05, PARAPET_H * 0.5, z + (z > 0 ? 0.215 : -0.215)]}><boxGeometry args={[0.05, PARAPET_H * 0.9, 0.02]} /><meshLambertMaterial color={STONE_D} /></mesh>)}
    </group>)}
    {[[-4.9, WALL_Z + 0.5], [4.9, WALL_Z + 0.5], [-4.9, -WALL_Z - 0.5], [4.9, -WALL_Z - 0.5]].map(([x, z], i) => bart(x, z, i))}
    {glow > 0 && <Glow position={[11, 1.2, WALL_Z + 0.6]} size={3 * glow} color="#ff4a3a" opacity={0.7 * glow} />}
  </group>;
};

// ---- Overtoun House (Scots baronial: tall block, towers, lit windows) ----
export const House = ({position = [30, 0, -16], lit = 0.4, frame = 0}) => <group position={position} rotation={[0, -0.5, 0]}>
  <Building w={9} d={6} h={6} floors={3} roof={2.4} color="#9a8a7c" roofColor="#4a4a58" lit={lit} frame={frame} />
  <group position={[-4.6, 0, 3]}>
    <mesh position={[0, 4.5, 0]}><cylinderGeometry args={[1.3, 1.4, 9, 8]} /><meshLambertMaterial color="#a39282" flatShading /></mesh>
    <mesh position={[0, 10, 0]}><coneGeometry args={[1.6, 2.6, 8]} /><meshLambertMaterial color="#3e3e4c" flatShading /></mesh>
  </group>
  <group position={[4.4, 0, 3]}>
    <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[1.0, 1.1, 7, 8]} /><meshLambertMaterial color="#a39282" flatShading /></mesh>
    <mesh position={[0, 7.9, 0]}><coneGeometry args={[1.3, 2.0, 8]} /><meshLambertMaterial color="#3e3e4c" flatShading /></mesh>
  </group>
</group>;

// ---- autumn woods: banks + gorge walls ----
export const AUTUMN = ['#c4521f', '#e08a2a', '#d9a832', '#9a3a1c', '#7a8a2a', '#b8661e'];
export const Woods = ({frame = 0, seed = 5, n = 70, near = 7, far = 45, skipBridge = true}) => {
  const items = useMemo(() => { const r = rng(seed); const out = [];
    while (out.length < n) { const x = (r() - 0.5) * 2 * far, z = (r() - 0.5) * 2 * far; const ax = Math.abs(x);
      if (skipBridge && Math.abs(z) < 4.2 && ax < 22) continue; if (ax < 3.2) continue; if (Math.hypot(x - 30, z + 16) < 10) continue;
      out.push({x, z, s: 1.4 + r() * 1.5, c: AUTUMN[Math.floor(r() * AUTUMN.length)], k: r() < 0.18 ? 'pine' : 'round', sd: Math.floor(r() * 100)}); }
    return out; }, [seed, n, far]);
  return <group>{items.map((t, i) => <Tree key={i} position={[t.x, height(t.x, t.z) - 0.1, t.z]} s={t.k === 'pine' ? t.s * 1.2 : t.s} kind={t.k} color={t.k === 'pine' ? '#2f4a2a' : t.c} seed={t.sd} frame={frame} />)}</group>;
};

// ---- blocky dog ----
const DBox = ({p, s, c, rot, o = 1}) => { const ol = useOutline();
  return <>{<mesh position={p} rotation={rot || [0, 0, 0]}><boxGeometry args={s} /><meshLambertMaterial color={c} flatShading transparent={o < 1} opacity={o} depthWrite={o >= 1} /></mesh>}
    {ol && ol.thickness > 0 && o >= 1 && <mesh position={p} rotation={rot || [0, 0, 0]} material={ink(ol.color)}><boxGeometry args={s.map((v) => v + ol.thickness * 1.4)} /></mesh>}</>; };
export const DOGS = {
  cassie: {color: '#f2ece0', patch: '#6a2e18', ears: '#6a2e18'},  // springer spaniel: liver + white
  golden: {color: '#d9a04a', patch: '#c58a38', ears: '#b87a30'},
  collie: {color: '#1e1c22', patch: '#f2f0ea', ears: '#1e1c22'},
  lab: {color: '#2a2622', patch: '#3a332c', ears: '#2a2622'},
  terrier: {color: '#b07a4a', patch: '#3a2a20', ears: '#3a2a20'},
};
/**
 * pose: stand | walk | run | freeze (rigid, head up) | leap (stretched) ; headUp 0..1 lifts the gaze ; phase = gait clock.
 * Faces +z, ~0.85 tall at scale 1 (Person ~2).
 */
export const Dog = ({position = [0, 0, 0], rotation = 0, scale = 1, look = 'cassie', pose = 'stand', phase = 0, headUp = 0, frame = 0, shadow = true, pitch = 0, ghost = 0}) => {
  const L0 = DOGS[look] || DOGS.cassie; const L = ghost ? {color: '#dfe9ff', patch: '#c8d8f5', ears: '#c8d8f5'} : L0; const o = ghost ? ghost : 1;
  const run = pose === 'run', walk = pose === 'walk', leap = pose === 'leap', freeze = pose === 'freeze';
  const amp = run ? 0.9 : walk ? 0.45 : 0; const sp = run ? 1.0 : 1;
  const bob = run ? Math.abs(Math.sin(phase * sp)) * 0.08 : walk ? Math.abs(Math.sin(phase)) * 0.03 : 0;
  const breathe = freeze ? 0 : Math.sin(frame * 0.15) * 0.01;
  const tail = freeze ? 0 : leap ? 0.9 : Math.sin(frame * (run ? 0.6 : 0.35)) * 0.6;
  const hp = -0.15 - headUp * 0.6 + (run ? Math.sin(phase * 2) * 0.05 : 0);
  const legs = [[-0.12, 0.28, 0], [0.12, 0.28, Math.PI], [-0.12, -0.3, Math.PI], [0.12, -0.3, 0]];
  return <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    {shadow && !leap && !ghost && <ContactShadow position={[0, 0.02, 0]} radius={0.55} stretch={1.6} opacity={0.4} />}
    <group position={[0, bob + breathe, 0]} rotation={[pitch + (leap ? -0.35 : run ? Math.sin(phase * sp) * 0.05 : 0), 0, 0]}>
      <DBox o={o} p={[0, 0.55, 0]} s={[0.36, 0.34, 0.82]} c={L.color} />
      <DBox o={o} p={[0, 0.66, -0.12]} s={[0.37, 0.14, 0.36]} c={L.patch} />
      <group position={[0, 0.74, 0.42]} rotation={[hp, Math.sin(frame * 0.05) * (freeze ? 0 : 0.15), 0]}>
        <DBox o={o} p={[0, 0.06, 0.06]} s={[0.32, 0.3, 0.3]} c={L.color} />
        <DBox o={o} p={[0, 0.07, 0.065]} s={[0.33, 0.12, 0.31]} c={L.patch} />
        <DBox o={o} p={[0, -0.02, 0.28]} s={[0.17, 0.14, 0.2]} c={L.color} />
        <mesh position={[0, 0.03, 0.385]}><boxGeometry args={[0.08, 0.06, 0.03]} /><meshLambertMaterial color="#111" /></mesh>
        <mesh position={[-0.09, 0.12, 0.215]}><boxGeometry args={[0.05, 0.05, 0.02]} /><meshBasicMaterial color="#0c0a0a" /></mesh>
        <mesh position={[0.09, 0.12, 0.215]}><boxGeometry args={[0.05, 0.05, 0.02]} /><meshBasicMaterial color="#0c0a0a" /></mesh>
        <DBox o={o} p={[-0.19, -0.02, 0.03]} s={[0.07, 0.24, 0.15]} c={L.ears} rot={[0, 0, freeze ? -0.1 : Math.sin(phase) * 0.15 * amp]} />
        <DBox o={o} p={[0.19, -0.02, 0.03]} s={[0.07, 0.24, 0.15]} c={L.ears} rot={[0, 0, freeze ? 0.1 : -Math.sin(phase) * 0.15 * amp]} />
      </group>
      <group position={[0, 0.68, -0.4]} rotation={[0.7, 0, tail]}><DBox o={o} p={[0, 0.14, -0.04]} s={[0.07, 0.3, 0.07]} c={L.ears} /></group>
      {legs.map(([x, z, ph], i) => { const a = leap ? (z > 0 ? -1.1 : 1.0) : Math.sin(phase * sp + ph) * amp * 0.7;
        return <group key={i} position={[x, 0.42, z]} rotation={[a, 0, 0]}><DBox o={o} p={[0, -0.2, 0]} s={[0.1, 0.42, 0.1]} c={i < 2 ? L.color : L.color} /></group>; })}
    </group>
  </group>;
};

// ---- mink (long low dark body) ----
export const Mink = ({position = [0, 0, 0], rotation = 0, frame = 0, scale = 1}) => <group position={position} rotation={[0, rotation, 0]} scale={scale}>
  <group position={[0, Math.abs(Math.sin(frame * 0.4)) * 0.04, 0]}>
    <DBox p={[0, 0.16, 0]} s={[0.16, 0.14, 0.6]} c="#3a2418" />
    <group position={[0, 0.2, 0.32]} rotation={[0, Math.sin(frame * 0.12) * 0.4, 0]}><DBox p={[0, 0, 0.06]} s={[0.14, 0.12, 0.16]} c="#3a2418" />
      <mesh position={[-0.04, 0.03, 0.145]}><boxGeometry args={[0.03, 0.03, 0.01]} /><meshBasicMaterial color="#000" /></mesh><mesh position={[0.04, 0.03, 0.145]}><boxGeometry args={[0.03, 0.03, 0.01]} /><meshBasicMaterial color="#000" /></mesh>
      <mesh position={[0, -0.03, 0.15]}><boxGeometry args={[0.06, 0.03, 0.02]} /><meshBasicMaterial color="#f0e8e0" /></mesh></group>
    <group position={[0, 0.17, -0.3]} rotation={[0.5 + Math.sin(frame * 0.2) * 0.2, 0, 0]}><DBox p={[0, 0, -0.15]} s={[0.07, 0.07, 0.32]} c="#2a1810" /></group>
    {[[-0.06, 0.2], [0.06, 0.2], [-0.06, -0.2], [0.06, -0.2]].map(([x, z], i) => <DBox key={i} p={[x, 0.05, z]} s={[0.05, 0.1, 0.05]} c="#2a1810" />)}
  </group>
</group>;

// ---- scent canister for the test ----
export const Canister = ({position = [0, 0, 0], lid = '#d6302a', label = '', open = 1}) => <group position={position}>
  <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.28, 0.28, 0.6, 10]} /><meshLambertMaterial color="#c9ccd2" flatShading /></mesh>
  <mesh position={[0, 0.63 + open * 0.0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.08, 10]} /><meshLambertMaterial color={lid} flatShading /></mesh>
</group>;
