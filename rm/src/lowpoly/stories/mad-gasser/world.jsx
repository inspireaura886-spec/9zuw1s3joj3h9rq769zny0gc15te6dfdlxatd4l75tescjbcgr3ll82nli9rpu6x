// Mad Gasser of Mattoon (1944) - roast horror-comedy test. Own copies of anything that needed changing; kit untouched.
import * as THREE from 'three';
import {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {Building, Tree, Fence, Person, Glow, softTexture, rng, clamp01, easeInOut, PALETTES} from '../../kit/index.js';

// ---------- camera rig copy that takes an explicit frame (so freeze-frames can stop it) ----------
export const CamRig = ({keys, frame, shake = 0, shakeFrom = 0, shakeLen = 20, drift = 0.15}) => {
  const {camera} = useThree(); const f = frame;
  let i = 0; while (i < keys.length - 2 && f > keys[i + 1].f) i++;
  const A = keys[i], B = keys[Math.min(i + 1, keys.length - 1)];
  const t = B.f === A.f ? 1 : easeInOut(clamp01((f - A.f) / (B.f - A.f)));
  const L = (a, b) => a.map((x, k) => x + (b[k] - x) * t);
  let pos = L(A.pos, B.pos); const look = L(A.look, B.look); const fov = (A.fov || 50) + ((B.fov || 50) - (A.fov || 50)) * t;
  if (shake && f >= shakeFrom && f < shakeFrom + shakeLen) { const k = shake * (1 - (f - shakeFrom) / shakeLen); pos = [pos[0] + Math.sin(f * 2.3) * k, pos[1] + Math.cos(f * 3.1) * k, pos[2]]; }
  if (drift) pos = [pos[0] + Math.sin(f * 0.031) * drift, pos[1] + Math.sin(f * 0.043 + 1) * drift * 0.6, pos[2] + Math.cos(f * 0.027) * drift];
  camera.position.set(...pos); camera.fov = fov; camera.near = 0.1; camera.far = 600; camera.updateProjectionMatrix(); camera.lookAt(...look);
  return null;
};

// ---------- palettes ----------
export const PAL = {
  night: {...PALETTES.night, top: '#070634', mid: '#2a1f9e', hor: '#c04fd0', fog: '#2c2a9a'},
  bedroom: {...PALETTES.dusk, top: '#14123f', mid: '#3b2a8f', hor: '#7a4fd0', fog: '#2a2060', amb: 1.0, hemiSky: '#ffc38a', hemiGround: '#40306a', hemiI: 1.3, sun: '#ffd09a', sunI: 1.6, sunPos: [6, 10, 12], rim: '#8fb0ff', rimI: 1.6, rimPos: [-8, 6, -10]},
  horror: {...PALETTES.night, top: '#0c0108', mid: '#3d0616', hor: '#9e1027', fog: '#33040f', amb: 0.32, hemiSky: '#ff4a5e', hemiGround: '#1a0207', hemiI: 0.75, sun: '#ff8a8a', sunI: 0.9, sunPos: [-10, 20, 10], rim: '#ff2a3a', rimI: 2.6, rimPos: [10, 8, -20]},
  day: {...PALETTES.day},
  dawn: {...PALETTES.dawn},
  lab: {...PALETTES.blueprint},
};

// ---------- canvas-text sprite (YOU tag etc) ----------
const TXT = new Map();
const textTex = (text, bg, fg) => {
  const k = text + bg + fg; if (TXT.has(k)) return TXT.get(k);
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 160; const g = cv.getContext('2d');
  g.fillStyle = '#141414'; g.beginPath(); g.roundRect(14, 10, 228, 104, 26); g.fill();
  g.fillStyle = bg; g.beginPath(); g.roundRect(22, 18, 212, 88, 20); g.fill();
  g.fillStyle = '#141414'; g.beginPath(); g.moveTo(104, 112); g.lineTo(152, 112); g.lineTo(128, 150); g.fill();
  g.fillStyle = bg; g.beginPath(); g.moveTo(112, 104); g.lineTo(144, 104); g.lineTo(128, 136); g.fill();
  g.font = '900 70px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg; g.fillText(text, 128, 64);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; TXT.set(k, t); return t;
};
export const Tag = ({text = 'YOU', position, scale = 1.2, bg = '#ffd93b', fg = '#141414', frame = 0}) => (
  <sprite position={[position[0], position[1] + Math.sin(frame * 0.15) * 0.06, position[2]]} scale={[scale * 1.6, scale, 1]}>
    <spriteMaterial map={textTex(text, bg, fg)} transparent depthTest={false} fog={false} /></sprite>
);

// ---------- characters ----------
export const YOU_LOOK = {skin: '#e0ac7e', shirt: '#ff4fa8', pants: '#2b3a7a', hair: '#3a2214', shoes: '#f4f4f4', pattern: 'plain'};
export const ALINE = {skin: '#f0c49a', shirt: '#7fd0ff', pants: '#3a5fb0', hair: '#8a4a1c', pattern: 'check'};
export const BERT = {skin: '#d9a77a', shirt: '#e8b23a', pants: '#4a3a2a', hair: '#2a1a10', pattern: 'stripe'};
export const BEULAH = {skin: '#f2c8a2', shirt: '#9be15d', pants: '#5a3d7a', hair: '#c9a040', pattern: 'plain'};
export const CHIEF = {skin: '#d8a070', shirt: '#2f4fa8', pants: '#1f2a50', hair: '#5a5a5a', pattern: 'plain'};

/** YOU: pink hoodie, glowing phone in front, YOU tag over head. */
export const You = ({position = [0, 0, 0], rotation = 0, scale = 1, pose = 'stand', frame = 0, phone = true, tag = true, tagText = 'YOU', fallT = 0, expr, ...rest}) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <Person pose={pose} phase={pose === 'walk' ? frame / 4 : frame / 9} fallT={fallT} expr={expr} {...YOU_LOOK} {...rest} />
    {/* hood */}
    {pose !== 'fall' && <mesh position={[0, pose === 'sit' ? 1.38 : 1.7, -0.2]}><boxGeometry args={[0.5, 0.36, 0.14]} /><meshLambertMaterial color="#e03a8f" flatShading /></mesh>}
    {phone && pose !== 'fall' && <group position={[0.05, pose === 'sit' ? 1.05 : 1.12, 0.42]} rotation={[-0.5, 0, 0]}>
      <mesh><boxGeometry args={[0.2, 0.34, 0.04]} /><meshLambertMaterial color="#141414" /></mesh>
      <mesh position={[0, 0, 0.022]}><planeGeometry args={[0.17, 0.29]} /><meshBasicMaterial color={['#7fe3ff', '#ff9ad5', '#ffe066'][Math.floor(frame / 9) % 3]} /></mesh>
      <Glow position={[0, 0, 0.12]} size={0.9} color="#7fe3ff" opacity={0.6} />
    </group>}
    {tag && <Tag text={tagText} position={[0, pose === 'sit' ? 2.3 : 2.75, 0]} frame={frame} />}
  </group>
);

/** The Gasser: tall dark figure, tight cap, glowing eyes, little flit-gun sprayer. */
export const Gasser = ({position = [0, 0, 0], rotation = 0, scale = 1.25, opacity = 1, frame = 0, pose = 'stand', eyes = 1, gun = true}) => (
  <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <Person pose={pose} phase={pose === 'walk' ? frame / 3 : frame / 12} skin="#1c1a22" shirt="#141218" pants="#100e14" hair="#08070a" shoes="#060506" eye="#08070a" opacity={opacity} />
    <mesh position={[0, 2.07, 0]}><boxGeometry args={[0.6, 0.14, 0.6]} /><meshLambertMaterial color="#0a090c" transparent={opacity < 1} opacity={opacity} /></mesh>
    <mesh position={[0, 2.0, 0.32]}><boxGeometry args={[0.6, 0.04, 0.1]} /><meshLambertMaterial color="#0a090c" transparent={opacity < 1} opacity={opacity} /></mesh>
    {eyes > 0 && <>{[-0.14, 0.14].map((x) => <group key={x}><mesh position={[x, 1.79, 0.275]}><boxGeometry args={[0.12, 0.06, 0.02]} /><meshBasicMaterial color="#ff3045" transparent opacity={opacity * eyes} /></mesh>
      <Glow position={[x, 1.79, 0.36]} size={0.6} color="#ff2a3a" opacity={0.9 * opacity * eyes * (0.8 + 0.2 * Math.sin(frame * 0.4))} /></group>)}</>}
    {gun && <group position={[0.42, 1.05, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[0.1, 0.1, 0.36, 7]} /><meshLambertMaterial color="#5a6a3a" transparent={opacity < 1} opacity={opacity} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.025, 0.025, 0.32, 5]} /><meshLambertMaterial color="#7a7a7a" transparent={opacity < 1} opacity={opacity} /></mesh></group>}
  </group>
);

// ---------- gas: soft coloured sprites drifting from a point along a direction ----------
export const Gas = ({from = [0, 0, 0], dir = [0, 0, 1], frame = 0, count = 26, len = 4, spread = 0.8, color = '#b6ff7a', opacity = 0.35, size = 1.2, seed = 3, progress = 1}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({ph: r(), o: [(r() - 0.5), (r() - 0.5), (r() - 0.5)], sp: 0.6 + r() * 0.8, w: r() * 6.28})); }, [count, seed]);
  return (<group>{ps.map((q, i) => {
    const c = ((q.ph + frame * 0.006 * q.sp) % 1) * progress;
    const d = c * len; const sp = spread * (0.3 + c);
    const p = [from[0] + dir[0] * d + q.o[0] * sp + Math.sin(frame * 0.05 + q.w) * 0.15, from[1] + dir[1] * d + q.o[1] * sp * 0.5 + Math.sin(frame * 0.04 + q.w) * 0.1, from[2] + dir[2] * d + q.o[2] * sp];
    return <sprite key={i} position={p} scale={[size * (0.5 + c * 1.4), size * (0.5 + c * 1.4) * 0.7, 1]}>
      <spriteMaterial map={softTexture()} color={color} transparent opacity={opacity * Math.sin(Math.PI * Math.min(1, c * 1.15))} depthWrite={false} /></sprite>;
  })}</group>);
};

// ---------- town ----------
const HOUSE_COLS = ['#ffd27a', '#ff9a8a', '#8fe3c8', '#9fc4ff', '#ffb3e0', '#c9f27a', '#ffe6a8'];
const ROOF_COLS = ['#d6302a', '#2f6fd6', '#7a3fd0', '#1f9e6a', '#e06a1f'];
export const HOUSES = (() => {
  const r = rng(1944); const out = [];
  for (let i = 0; i < 7; i++) for (const side of [-1, 1]) {
    const x = -27 + i * 9 + (r() - 0.5) * 1.2; if (side === 1 && Math.abs(x) < 4) continue; // hero house slot (x~0, z=-9)
    out.push({x, z: side * 9, rot: side < 0 ? 0 : Math.PI, w: 4 + r() * 1.5, h: 2.6 + r() * 1.2, floors: r() < 0.4 ? 2 : 1, col: HOUSE_COLS[(i * 2 + (side > 0)) % 7], roof: ROOF_COLS[(i + (side > 0) * 2) % 5], k: i * 2 + (side > 0)});
  }
  return out;
})();
export const HERO = {x: 0, z: -9}; // Kearney house (front faces +z towards the street)
export const LAMPS = [-22, -8, 8, 22];

export const StreetLamp = ({x, z, frame, on = 1}) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.08, 0.12, 3.6, 6]} /><meshLambertMaterial color="#2a2a33" /></mesh>
    <mesh position={[0, 3.65, 0]}><boxGeometry args={[0.45, 0.35, 0.45]} /><meshBasicMaterial color={on ? '#ffe9a0' : '#444'} /></mesh>
    {on > 0 && <Glow position={[0, 3.6, 0]} size={4.5} color="#ffcf6a" opacity={0.7 * on * (0.92 + 0.08 * Math.sin(frame * 0.7 + x))} />}
    {on > 0 && <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.4, 16]} /><meshBasicMaterial color="#ffcf6a" transparent opacity={0.22 * on} depthWrite={false} /></mesh>}
  </group>
);

/**
 * Town street at night/day. lit(k) per-house window share; heroLit for the Kearney house.
 */
export const Town = ({frame = 0, lit = 0.6, litFn, heroLit = 0.8, lamps = 1, ground = '#3fbf5a', road = '#3a3550', trees = true}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[220, 220]} /><meshLambertMaterial color={ground} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[220, 6]} /><meshLambertMaterial color={road} /></mesh>
    {[-3.6, 3.6].map((z) => <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, z]}><planeGeometry args={[220, 1.2]} /><meshLambertMaterial color="#c9c3d8" /></mesh>)}
    {Array.from({length: 22}, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-55 + i * 5, 0.05, 0]}><planeGeometry args={[2, 0.16]} /><meshBasicMaterial color="#ffd93b" /></mesh>)}
    {HOUSES.map((h) => <Building key={h.k} position={[h.x, 0, h.z]} rotation={h.rot} w={h.w} d={3.4} h={h.h} floors={h.floors} roof={1.5} color={h.col} roofColor={h.roof} lit={litFn ? litFn(h.k) : lit} litSeed={h.k} frame={frame} />)}
    <Building position={[HERO.x, 0, HERO.z]} w={5} d={3.6} h={3} roof={1.7} color="#fff0c2" roofColor="#c4223a" lit={heroLit} litSeed={7} frame={frame} />
    {HOUSES.filter((h, i) => i % 2 === 0).map((h) => <Fence key={'f' + h.k} from={[h.x - 2.5, 0, h.z + (h.z < 0 ? 2.6 : -2.6)]} to={[h.x + 2.5, 0, h.z + (h.z < 0 ? 2.6 : -2.6)]} posts={7} color="#f4f0e6" />)}
    {LAMPS.map((x, i) => <StreetLamp key={x} x={x} z={i % 2 ? 3.9 : -3.9} frame={frame} on={lamps} />)}
    {trees && HOUSES.map((h, i) => i % 3 === 1 && <Tree key={'t' + h.k} position={[h.x + 3.6, 0, h.z * 1.05]} s={1.4} kind={i % 2 ? 'round' : 'pine'} seed={h.k} frame={frame} color={['#2fbf5a', '#1f9e6a', '#5fd04a'][i % 3]} />)}
  </group>
);

// ---------- dollhouse bedroom (open towards +z) ----------
/** Wall with a window hole on the back (z = -3). window centre at (wx, wy), size ww x wh. */
const WallWithHole = ({w = 9, h = 5, wx = 1.6, wy = 2.6, ww = 2, wh = 1.8, color, z = -3}) => {
  const l = wx - ww / 2 + w / 2, r = w / 2 - (wx + ww / 2), b = wy - wh / 2, t = h - (wy + wh / 2);
  const M = (p, s) => <mesh position={p}><boxGeometry args={s} /><meshLambertMaterial color={color} flatShading /></mesh>;
  return <group position={[0, 0, z]}>
    {M([-w / 2 + l / 2, h / 2, 0], [l, h, 0.3])}{M([w / 2 - r / 2, h / 2, 0], [r, h, 0.3])}
    {M([wx, b / 2, 0], [ww, b, 0.3])}{M([wx, h - t / 2, 0], [ww, t, 0.3])}
  </group>;
};
export const WIN = {x: 1.6, y: 2.6, z: -3};
/** shutter: 0 open .. 1 slammed shut. curtains sway with frame. */
export const Bedroom = ({frame = 0, wall = '#7a5be0', floor = '#c98a4a', lamp = 1, shutter = 0, flowers = true, bed = true, couch = false}) => (
  <group>
    <mesh position={[0, -0.15, 0]}><boxGeometry args={[9, 0.3, 6]} /><meshLambertMaterial color={floor} flatShading /></mesh>
    {Array.from({length: 8}, (_, i) => <mesh key={i} position={[-4 + i * 1.15, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.04, 6]} /><meshBasicMaterial color="#9a6a3a" /></mesh>)}
    <WallWithHole color={wall} />
    <mesh position={[-4.5, 2.5, 0]}><boxGeometry args={[0.3, 5, 6]} /><meshLambertMaterial color={new THREE.Color(wall).multiplyScalar(0.8)} flatShading /></mesh>
    {/* wallpaper stripes */}
    {Array.from({length: 7}, (_, i) => i !== 4 && i !== 5 && <mesh key={'s' + i} position={[-3.9 + i * 1.3, 2.5, -2.84]}><planeGeometry args={[0.18, 5]} /><meshBasicMaterial color={new THREE.Color(wall).multiplyScalar(1.25)} /></mesh>)}
    {/* window frame + sill */}
    <mesh position={[WIN.x, WIN.y - 0.95, WIN.z + 0.25]}><boxGeometry args={[2.4, 0.12, 0.5]} /><meshLambertMaterial color="#f4f0e6" /></mesh>
    {[[-1.05, 0], [1.05, 0]].map(([dx], i) => <mesh key={i} position={[WIN.x + dx, WIN.y, WIN.z + 0.17]}><boxGeometry args={[0.12, 1.9, 0.12]} /><meshLambertMaterial color="#f4f0e6" /></mesh>)}
    <mesh position={[WIN.x, WIN.y + 0.95, WIN.z + 0.17]}><boxGeometry args={[2.3, 0.12, 0.12]} /><meshLambertMaterial color="#f4f0e6" /></mesh>
    {/* curtains */}
    {[-1, 1].map((s) => <mesh key={s} position={[WIN.x + s * 1.35, WIN.y + 0.1, WIN.z + 0.3]} rotation={[Math.sin(frame * 0.07 + s) * 0.12, 0, Math.sin(frame * 0.05 + s) * 0.06]}><boxGeometry args={[0.45, 2.3, 0.08]} /><meshLambertMaterial color="#ff6a8a" flatShading /></mesh>)}
    {/* shutters slam (hinged at window sides) */}
    {shutter > 0 && [-1, 1].map((s) => <group key={'sh' + s} position={[WIN.x + s * 1.0, WIN.y, WIN.z - 0.2]} rotation={[0, s * (1 - shutter) * 1.5, 0]}>
      <mesh position={[-s * 0.5, 0, 0]}><boxGeometry args={[1.0, 1.8, 0.08]} /><meshLambertMaterial color="#2fa36a" flatShading /></mesh></group>)}
    {flowers && <group position={[WIN.x - 0.6, WIN.y - 0.85, WIN.z + 0.3]}>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.14, 0.1, 0.3, 6]} /><meshLambertMaterial color="#e06a1f" /></mesh>
      {[0, 1, 2].map((i) => <group key={i} position={[(i - 1) * 0.12, 0.3, 0]} rotation={[0, 0, (i - 1) * 0.3 + Math.sin(frame * 0.1 + i) * 0.1]}>
        <mesh position={[0, 0.25, 0]}><boxGeometry args={[0.03, 0.5, 0.03]} /><meshLambertMaterial color="#2f9e3a" /></mesh>
        <mesh position={[0, 0.52, 0]} rotation={[0, frame * 0.03, 0]}><icosahedronGeometry args={[0.1, 0]} /><meshLambertMaterial color={['#ffd93b', '#ff4fa8', '#ffffff'][i]} flatShading /></mesh></group>)}
    </group>}
    {bed && <group position={[-1.6, 0, -1.4]}>
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[2.2, 0.6, 3.0]} /><meshLambertMaterial color="#8a4a2a" flatShading /></mesh>
      <mesh position={[0, 0.7, 0.05]}><boxGeometry args={[2.0, 0.25, 2.8]} /><meshLambertMaterial color="#ffffff" flatShading /></mesh>
      <mesh position={[0, 1.0, -1.45]}><boxGeometry args={[2.2, 1.4, 0.15]} /><meshLambertMaterial color="#8a4a2a" flatShading /></mesh>
      <mesh position={[0, 0.9, -1.05]}><boxGeometry args={[1.4, 0.2, 0.55]} /><meshLambertMaterial color="#ffe6f0" flatShading /></mesh>
    </group>}
    {couch && <group position={[-1.6, 0, -1.6]}>
      <mesh position={[0, 0.35, 0]}><boxGeometry args={[3.2, 0.7, 1.3]} /><meshLambertMaterial color="#2fbfa0" flatShading /></mesh>
      <mesh position={[0, 0.95, -0.55]}><boxGeometry args={[3.2, 0.9, 0.3]} /><meshLambertMaterial color="#25a088" flatShading /></mesh>
      {[-1.6, 1.6].map((x) => <mesh key={x} position={[x, 0.65, 0]}><boxGeometry args={[0.3, 0.7, 1.3]} /><meshLambertMaterial color="#25a088" flatShading /></mesh>)}
    </group>}
    {/* nightstand + lamp */}
    <group position={[-3.6, 0, -2.2]}>
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshLambertMaterial color="#5a3a8a" flatShading /></mesh>
      <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.06, 0.1, 0.5, 6]} /><meshLambertMaterial color="#333" /></mesh>
      <mesh position={[0, 1.4, 0]}><coneGeometry args={[0.35, 0.4, 7, 1, true]} /><meshBasicMaterial color={lamp ? '#ffd27a' : '#555'} side={THREE.DoubleSide} /></mesh>
      {lamp > 0 && <Glow position={[0, 1.35, 0.1]} size={3.2} color="#ffb84a" opacity={0.7 * lamp} />}
      {lamp > 0 && <pointLight position={[0, 1.6, 0.6]} color="#ffb06a" intensity={5 * lamp} distance={9} decay={1.4} />}
    </group>
  </group>
);

// ---------- props ----------
export const MilkCarton = ({position, rotation = [0, 0, 0], scale = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.35, 0]}><boxGeometry args={[0.35, 0.7, 0.35]} /><meshLambertMaterial color="#ffffff" flatShading /></mesh>
    <mesh position={[0, 0.35, 0.177]}><planeGeometry args={[0.3, 0.25]} /><meshBasicMaterial color="#2f86e0" /></mesh>
    <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.26, 0.22, 4]} /><meshLambertMaterial color="#e8e8e8" flatShading /></mesh>
  </group>
);
export const Cloth = ({position, rotation = [0, 0, 0], frame = 0}) => (
  <mesh position={position} rotation={rotation}><boxGeometry args={[0.55, 0.03, 0.45]} /><meshLambertMaterial color="#f8f8f0" flatShading /></mesh>
);
export const Shotgun = ({position, rotation = [0, 0, 0]}) => (
  <group position={position} rotation={rotation}>
    <mesh><boxGeometry args={[0.08, 0.08, 1.1]} /><meshLambertMaterial color="#2a2a30" /></mesh>
    <mesh position={[0, -0.04, -0.6]}><boxGeometry args={[0.1, 0.16, 0.4]} /><meshLambertMaterial color="#7a4a22" /></mesh>
  </group>
);
export const NailPolish = ({position, rotation = [0, 0, 0], scale = 1}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshPhongMaterial color="#ff2f8a" transparent opacity={0.9} shininess={60} flatShading /></mesh>
    <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.18, 0.22, 0.7, 6]} /><meshLambertMaterial color="#141414" flatShading /></mesh>
  </group>
);
