import * as THREE from 'three';
import {useMemo} from 'react';
import {rng, hash2, clamp01, Glow, softTexture, Smoke, Clouds, Birds, Orb} from '../../kit/index.js';
import {Person} from './Chars.jsx';

// Strasbourg 1518 diorama: cobbled square at the origin, half-timbered houses on three sides (facades face the square),
// cathedral spire far behind (-z). Camera usually sits at +z looking toward -z.

// ---------- textures ----------
const TX = new Map();
const canvasTex = (key, w, h, draw, rep) => {
  if (TX.has(key)) return TX.get(key);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.magFilter = THREE.NearestFilter; }
  TX.set(key, t); return t;
};
export const cobbleTex = () => canvasTex('cobble', 64, 64, (g) => {
  g.fillStyle = '#6d6370'; g.fillRect(0, 0, 64, 64); const r = rng(5);
  const cols = ['#b9a99a', '#a8988e', '#c7b6a2', '#9d8f86', '#bfae9c', '#d1c0aa'];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; const ox = (y % 2) * 4; g.fillRect((x * 8 + ox) % 64 + 1, y * 8 + 1, 6, 6); if ((x * 8 + ox) % 64 + 7 > 64) g.fillRect(0, y * 8 + 1, ((x * 8 + ox) % 64 + 7) - 64, 6); }
}, [30, 30]);

// Billboard speech bubble with text ("?!", "!", "HELP"). pop 0..1 scales it in.
export const Bubble = ({position, text = '?!', pop = 1, size = 1.2, color = '#ffffff', ink = '#141414', textColor}) => {
  const tex = useMemo(() => canvasTex('bub' + text + color + (textColor || ''), 256, 256, (g) => {
    g.fillStyle = ink; g.beginPath(); g.ellipse(128, 112, 112, 92, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(80, 180); g.lineTo(60, 250); g.lineTo(130, 190); g.fill();
    g.fillStyle = color; g.beginPath(); g.ellipse(128, 112, 100, 80, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(88, 176); g.lineTo(72, 230); g.lineTo(124, 184); g.fill();
    g.fillStyle = textColor || ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    const fs = text.length > 3 ? 64 : 110; g.font = `900 ${fs}px "Lilita One", "Arial Black", sans-serif`; g.fillText(text, 128, 116);
  }), [text, color, ink, textColor]);
  if (pop <= 0) return null;
  const s = size * (pop < 1 ? 1.25 * Math.sin(pop * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) : 1);
  return <sprite position={position} scale={[s, s, 1]}><spriteMaterial map={tex} transparent depthWrite={false} fog={false} /></sprite>;
};
// spring-ish pop for bubbles: f frames since appear
export const popT = (f) => (f < 0 ? 0 : f > 8 ? 1 : f / 8);

// Musical note sprites floating up from a point
export const Notes = ({position = [0, 0, 0], frame = 0, count = 6, color = '#ffe14a', spread = 2, height = 4, seed = 2}) => {
  const tex = useMemo(() => canvasTex('note', 128, 128, (g) => {
    g.fillStyle = '#141414'; g.beginPath(); g.ellipse(46, 96, 30, 22, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(66, 18, 12, 80); g.fillRect(66, 18, 46, 14);
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(46, 96, 22, 15, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(69, 22, 6, 72); g.fillRect(69, 21, 40, 8);
  }), []);
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({ph: r(), x: (r() - 0.5) * spread, z: (r() - 0.5) * spread * 0.5})); }, [count, seed, spread]);
  return <group position={position}>{ps.map((q, i) => { const c = (q.ph + frame * 0.012) % 1;
    return <sprite key={i} position={[q.x + Math.sin(c * 9 + i) * 0.4, c * height, q.z]} scale={[0.9, 0.9, 1]}><spriteMaterial map={tex} color={color} transparent opacity={Math.sin(Math.PI * c)} depthWrite={false} fog={false} /></sprite>; })}</group>;
};

// ---------- architecture ----------
const B = ({p, s, c, rot, e}) => <mesh position={p} rotation={rot || [0, 0, 0]}><boxGeometry args={s} /><meshLambertMaterial color={c} emissive={e || '#000000'} flatShading /></mesh>;
const roofGeo = (w, d, h) => { const W = w / 2 + 0.35, D = d / 2 + 0.45; const v = [-W, 0, D, W, 0, D, W, h, 0, -W, 0, D, W, h, 0, -W, h, 0, W, 0, -D, -W, 0, -D, -W, h, 0, W, 0, -D, -W, h, 0, W, h, 0, -W, 0, -D, -W, 0, D, -W, h, 0, W, 0, D, W, 0, -D, W, h, 0];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g; };
const WIN_LIT = '#ffcf5a';
/** Half-timbered house, facade on +z. lit 0..1 = night windows; silhouettes = dancing shadows in windows (frame-driven). */
export const HalfTimber = ({position = [0, 0, 0], rotation = 0, w = 4.4, d = 4, floors = 3, fh = 2.3, color = '#f2c6c2', beam = '#4a2c1e', roof = '#b8452f', lit = 0, frame = 0, k = 0, door = true, flowers = true, silhouettes = 0, silStop = 1e9}) => {
  const H = floors * fh; const rg = useMemo(() => roofGeo(w, d, 3.2), [w, d]);
  const cols = Math.max(2, Math.round(w / 1.5)); const items = [];
  for (let f = 0; f < floors; f++) {
    const y = f * fh; items.push(<B key={'h' + f} p={[0, y + 0.1, d / 2 + 0.06]} s={[w + 0.05, 0.2, 0.12]} c={beam} />);
    for (let c = 0; c <= cols; c++) { const x = -w / 2 + (w / cols) * c; items.push(<B key={`v${f}${c}`} p={[x, y + fh / 2, d / 2 + 0.06]} s={[0.16, fh, 0.12]} c={beam} />); }
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + (w / cols) * (c + 0.5); const isDoor = door && f === 0 && c === Math.floor(cols / 2);
      if (isDoor) { items.push(<B key={`d${c}`} p={[x, 0.85, d / 2 + 0.05]} s={[0.95, 1.7, 0.1]} c="#5a3420" />); items.push(<B key={`dk${c}`} p={[x + 0.3, 0.85, d / 2 + 0.12]} s={[0.1, 0.1, 0.06]} c="#e0b84a" />); continue; }
      const kk = k * 17 + f * 5 + c; const on = lit > 0 && hash2(kk, 3) < lit;
      const flick = 0.85 + 0.15 * Math.sin(frame * 0.3 + kk);
      items.push(<mesh key={`w${f}${c}`} position={[x, y + fh * 0.58, d / 2 + 0.07]}><planeGeometry args={[0.8, 1.0]} />
        {on ? <meshBasicMaterial color={new THREE.Color(WIN_LIT).multiplyScalar(flick)} /> : <meshLambertMaterial color="#2d3c5e" />}</mesh>);
      items.push(<B key={`ws${f}${c}`} p={[x, y + fh * 0.58 - 0.55, d / 2 + 0.12]} s={[0.95, 0.1, 0.18]} c={beam} />);
      if (flowers && f > 0 && hash2(kk, 9) < 0.5) items.push(<group key={`fl${f}${c}`}>{[-0.3, 0, 0.3].map((dx, j) => <B key={j} p={[x + dx, y + fh * 0.58 - 0.45, d / 2 + 0.2]} s={[0.18, 0.18, 0.18]} c={j === 1 ? '#ff4f7a' : '#ff8a2a'} />)}</group>);
      if (on && silhouettes > 0 && hash2(kk, 21) < silhouettes) {
        const ff = Math.min(frame, silStop); const bob = Math.abs(Math.sin(ff * 0.25 + kk)) * 0.12; const sway = Math.sin(ff * 0.18 + kk) * 0.15;
        const arm = 0.35 + Math.abs(Math.sin(ff * 0.35 + kk)) * 0.5; const legA = Math.sin(ff * 0.35 + kk) * 0.35; const SC = '#140806';
        items.push(<group key={`s${f}${c}`} position={[x + sway, y + fh * 0.36 + bob, d / 2 + 0.09]} rotation={[0, 0, Math.sin(ff * 0.2 + kk) * 0.18]}>
          <mesh position={[0, 0.62, 0]}><circleGeometry args={[0.13, 10]} /><meshBasicMaterial color={SC} /></mesh>
          <mesh position={[0, 0.34, 0]}><planeGeometry args={[0.26, 0.36]} /><meshBasicMaterial color={SC} /></mesh>
          <group position={[-0.12, 0.48, 0]} rotation={[0, 0, Math.PI - arm]}><mesh position={[0, 0.17, 0]}><planeGeometry args={[0.08, 0.34]} /><meshBasicMaterial color={SC} /></mesh></group>
          <group position={[0.12, 0.48, 0]} rotation={[0, 0, -(Math.PI - arm)]}><mesh position={[0, 0.17, 0]}><planeGeometry args={[0.08, 0.34]} /><meshBasicMaterial color={SC} /></mesh></group>
          <group position={[-0.07, 0.17, 0]} rotation={[0, 0, legA]}><mesh position={[0, -0.15, 0]}><planeGeometry args={[0.09, 0.3]} /><meshBasicMaterial color={SC} /></mesh></group>
          <group position={[0.07, 0.17, 0]} rotation={[0, 0, -legA]}><mesh position={[0, -0.15, 0]}><planeGeometry args={[0.09, 0.3]} /><meshBasicMaterial color={SC} /></mesh></group>
        </group>);
      }
      if (on) items.push(<Glow key={`g${f}${c}`} position={[x, y + fh * 0.58, d / 2 + 0.5]} size={1.8} color="#ffb84a" opacity={0.5 * flick} />);
    }
    // diagonal braces on upper floors
    if (f > 0) items.push(<B key={'x' + f} p={[-w / 2 + 0.45, y + fh / 2, d / 2 + 0.07]} s={[0.13, fh * 1.05, 0.1]} rot={[0, 0, 0.45]} c={beam} />, <B key={'y' + f} p={[w / 2 - 0.45, y + fh / 2, d / 2 + 0.07]} s={[0.13, fh * 1.05, 0.1]} rot={[0, 0, -0.45]} c={beam} />);
  }
  return <group position={position} rotation={[0, rotation, 0]}>
    <B p={[0, H / 2, 0]} s={[w, H, d]} c={color} />
    {items}
    <B p={[0, H + 0.08, d / 2 + 0.06]} s={[w + 0.1, 0.2, 0.12]} c={beam} />
    <mesh geometry={rg} position={[0, H, 0]}><meshLambertMaterial color={roof} flatShading side={THREE.DoubleSide} /></mesh>
    <B p={[w * 0.25, H + 2.2, 0]} s={[0.5, 1.6, 0.5]} c="#8a4a3a" />
  </group>;
};

const HOUSE_COLS = ['#f7c8c0', '#ffe08a', '#a8e0d0', '#ffb36b', '#c9b8ff', '#fff2d6', '#9fd3ff', '#ff9e9e'];
const ROOF_COLS = ['#c2412b', '#a8352f', '#d4572e', '#8f3a2a'];
export const HOUSES = (() => { const r = rng(1518); const hs = []; let x = -22;
  while (x < 22) { const w = 3.8 + r() * 1.6; hs.push({x: x + w / 2, z: -8, rot: 0, w, floors: 3 + (r() < 0.4 ? 1 : 0), color: HOUSE_COLS[hs.length % 8], roof: ROOF_COLS[Math.floor(r() * 4)], k: hs.length}); x += w + 0.05; }
  // side rows facing in
  for (const side of [-1, 1]) { let z = -4; while (z < 14) { const w = 3.8 + r() * 1.4; hs.push({x: side * 13.5, z: z + w / 2, rot: -side * Math.PI / 2, w, floors: 3, color: HOUSE_COLS[(hs.length * 3) % 8], roof: ROOF_COLS[Math.floor(r() * 4)], k: hs.length}); z += w + 0.05; } }
  return hs; })();
export const TROFFEA_HOUSE = HOUSES.find((h) => h.z === -8 && h.x > -1.5) || HOUSES[5];

export const Cathedral = ({position = [4, 0, -55], tint = '#d98b7a'}) => <group position={position}>
  <B p={[0, 12, 0]} s={[16, 24, 10]} c={tint} />
  <B p={[-5, 30, 0]} s={[5, 12, 5]} c={tint} />
  <mesh position={[-5, 44, 0]}><coneGeometry args={[2.8, 16, 8]} /><meshLambertMaterial color={tint} flatShading /></mesh>
  <mesh position={[0, 16, 5.1]}><circleGeometry args={[3, 12]} /><meshLambertMaterial color="#7a3a4a" /></mesh>
  {[-6, -3, 0, 3, 6].map((x) => <B key={x} p={[x, 6, 5.1]} s={[1, 8, 0.2]} c="#a85a50" />)}
</group>;

// bunting lines across the square: flags flutter
export const Bunting = ({frame = 0, y = 7.5, z = -2, x0 = -13, x1 = 13, n = 22, seed = 3}) => {
  const cols = ['#ff4d4d', '#ffd23a', '#3ad1ff', '#7dff6a', '#ff7ae0'];
  return <group>{Array.from({length: n}, (_, i) => { const t = i / (n - 1); const x = x0 + (x1 - x0) * t; const yy = y - Math.sin(Math.PI * t) * 1.4;
    return <mesh key={i} position={[x, yy - 0.35, z]} rotation={[Math.sin(frame * 0.15 + i) * 0.35, 0, 0]}><coneGeometry args={[0.32, 0.7, 3]} /><meshLambertMaterial color={cols[(i + seed) % 5]} side={THREE.DoubleSide} flatShading /></mesh>; })}
    <mesh position={[(x0 + x1) / 2, y - 0.7, z]} rotation={[0, 0, 0]}><boxGeometry args={[x1 - x0, 0.04, 0.04]} /><meshBasicMaterial color="#3a2a1a" /></mesh></group>;
};

// blocky chicken that wanders / flaps (comic moving part)
export const Chicken = ({position = [0, 0, 0], frame = 0, seed = 0, panic = 0, path = 3}) => {
  const r = seed * 1.7; const t = frame * (0.02 + panic * 0.06) + r;
  const x = position[0] + Math.sin(t) * path, z = position[2] + Math.sin(t * 1.3 + r) * path * 0.6;
  const dir = Math.atan2(Math.cos(t) * path, Math.cos(t * 1.3 + r) * 1.3 * path * 0.6);
  const peck = panic ? 0 : Math.max(0, Math.sin(frame * 0.25 + r * 3)) * 0.5; const hop = panic ? Math.abs(Math.sin(frame * 0.5 + r)) * 0.4 : 0; const flap = panic ? Math.sin(frame * 1.2 + r) * 0.9 : 0;
  return <group position={[x, position[1] + hop, z]} rotation={[0, dir, 0]} scale={0.55}>
    <B p={[0, 0.55, 0]} s={[0.5, 0.45, 0.7]} c="#ffffff" />
    <group position={[0, 0.85, 0.3]} rotation={[peck, 0, 0]}><B p={[0, 0.1, 0]} s={[0.32, 0.4, 0.32]} c="#ffffff" /><B p={[0, 0.1, 0.22]} s={[0.12, 0.1, 0.16]} c="#ffb020" /><B p={[0, 0.0, 0.2]} s={[0.08, 0.12, 0.06]} c="#e02020" /><B p={[0, 0.34, 0]} s={[0.08, 0.12, 0.2]} c="#e02020" /></group>
    <B p={[-0.3, 0.6, 0]} s={[0.08, 0.3, 0.5]} rot={[0, 0, flap]} c="#f2f2f2" /><B p={[0.3, 0.6, 0]} s={[0.08, 0.3, 0.5]} rot={[0, 0, -flap]} c="#f2f2f2" />
    <B p={[-0.12, 0.17, 0]} s={[0.06, 0.34, 0.06]} c="#ffb020" /><B p={[0.12, 0.17, 0]} s={[0.06, 0.34, 0.06]} c="#ffb020" />
  </group>;
};

// market stall with striped awning
export const Stall = ({position = [0, 0, 0], rotation = 0, color = '#ff5a4e', empty = false, frame = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <B p={[0, 0.5, 0]} s={[2.4, 1, 1.2]} c="#8a5a34" />
  {[-1.1, 1.1].map((x) => <B key={x} p={[x, 1.25, -0.5]} s={[0.12, 2.5, 0.12]} c="#6a4426" />)}
  {Array.from({length: 6}, (_, i) => <B key={i} p={[-1.0 + i * 0.4, 2.5 + Math.sin(frame * 0.1 + i) * 0.02, 0]} s={[0.4, 0.1, 1.6]} rot={[0.25, 0, 0]} c={i % 2 ? '#ffffff' : color} />)}
  {!empty && [[-0.7, '#ff9a2a'], [-0.2, '#9be15d'], [0.3, '#ffd23a'], [0.8, '#d6304a']].map(([x, c], i) => <B key={i} p={[x, 1.15, 0.1]} s={[0.35, 0.3, 0.35]} c={c} />)}
</group>;

export const Well = ({position = [0, 0, 0]}) => <group position={position}>
  <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.9, 0.95, 0.9, 8]} /><meshLambertMaterial color="#9a8f86" flatShading /></mesh>
  <mesh position={[0, 0.92, 0]}><cylinderGeometry args={[0.7, 0.7, 0.05, 8]} /><meshLambertMaterial color="#2a5a8a" /></mesh>
  {[-0.85, 0.85].map((x) => <B key={x} p={[x, 1.5, 0]} s={[0.12, 1.4, 0.12]} c="#6a4426" />)}
  <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.3, 0.8, 4]} /><meshLambertMaterial color="#b8452f" flatShading /></mesh>
</group>;

export const Torch = ({position, frame = 0, k = 0}) => { const fl = 0.8 + 0.2 * Math.sin(frame * 0.7 + k * 2.3);
  return <group position={position}><B p={[0, 1.2, 0]} s={[0.12, 2.4, 0.12]} c="#4a2c1e" />
    <mesh position={[0, 2.6, 0]} scale={[0.25 * fl, 0.5 * fl, 0.25 * fl]}><coneGeometry args={[1, 1, 5]} /><meshBasicMaterial color="#ffb02a" /></mesh>
    <Glow position={[0, 2.6, 0]} size={3.2} color="#ff8a2a" opacity={0.7 * fl} />
    <pointLight position={[0, 2.7, 0]} color="#ff9a4a" intensity={7 * fl} distance={9} decay={1.4} /></group>; };

export const Ground = ({tint = '#ffffff'}) => <>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}><planeGeometry args={[60, 60]} /><meshLambertMaterial map={cobbleTex()} color={tint} /></mesh>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[400, 400]} /><meshLambertMaterial color="#6aa84f" /></mesh>
</>;

/** The whole town. lit 0..1, tint multiplies cobbles. */
export const Town = ({frame = 0, lit = 0, tint, silhouettes = 0, silStop, stalls = true, emptyStalls = false, bunting = true, chickens = true, panic = 0, cathedral = true}) => <group>
  <Ground tint={tint} />
  {HOUSES.map((h) => <HalfTimber key={h.k} position={[h.x, 0, h.z]} rotation={h.rot} w={h.w} floors={h.floors} color={h.color} roof={h.roof} lit={lit} frame={frame} k={h.k} silhouettes={silhouettes} silStop={silStop} />)}
  {cathedral && <Cathedral />}
  {stalls && <><Stall position={[-8, 0, 2]} rotation={0.5} color="#ff5a4e" empty={emptyStalls} frame={frame} /><Stall position={[8.5, 0, 3]} rotation={-0.5} color="#3a9bff" empty={emptyStalls} frame={frame} /></>}
  <Well position={[-5, 0, -3.5]} />
  {bunting && <><Bunting frame={frame} z={-3} /><Bunting frame={frame} z={5} y={7} seed={2} /></>}
  {chickens && [0, 1, 2].map((i) => <Chicken key={i} position={[-3 + i * 4.5, 0, 6 + i]} frame={frame} seed={i + 1} panic={panic} path={1.6} />)}
</group>;

// ---------- people ----------
export const LOOKS = [
  {skin: '#f1c7a5', shirt: '#e0472f', pants: '#3b2f5a', hair: '#6b3a1a', pattern: 'stripe', hat: 'coif'},
  {skin: '#e8b48a', shirt: '#2fa38a', pants: '#4a3a26', hair: '#2a1a10', pattern: 'check'},
  {skin: '#d99a6c', shirt: '#f2b632', pants: '#2b3a5a', hair: '#1b1310', pattern: 'plain', hat: 'cap'},
  {skin: '#f4d0b0', shirt: '#7a5bd5', pants: '#3a3226', hair: '#c9902a', pattern: 'plain'},
  {skin: '#c98a5c', shirt: '#2f86e0', pants: '#5a3d2a', hair: '#151010', pattern: 'stripe'},
  {skin: '#eebd96', shirt: '#ff7aa8', pants: '#2a2a3a', hair: '#8a4a1a', pattern: 'check', hat: 'coif'},
  {skin: '#e0a57a', shirt: '#9be15d', pants: '#3b3b48', hair: '#3a2010', pattern: 'plain'},
  {skin: '#f0c49e', shirt: '#ff9a2a', pants: '#2b2b36', hair: '#1a1210', pattern: 'stripe', hat: 'cap'},
];
// Frau Troffea: bright blue dress (robe) + white coif, so she reads in every shot
export const TROFFEA = {skin: '#f2c4a0', shirt: '#2f6df0', pants: '#2f6df0', hair: '#7a3a14', robe: '#2f6df0', hat: 'coif', pattern: 'plain'};
export const DOCTOR = {skin: '#e8b48a', shirt: '#1d1a24', pants: '#1d1a24', hair: '#9a9a9a', robe: '#2a2233', hat: 'tall', pattern: 'plain'};

/** A ring/grid of dancers around a centre. n dancers, energy, frame. joinFn(i) -> 0..1 (0 = still walking/standing, 1 dancing). */
export const DANCER_SPOTS = (() => { const r = rng(77); const s = []; for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 1.6 + Math.sqrt(r()) * 7.5; s.push({x: Math.sin(a) * d, z: Math.cos(a) * d * 0.7 + 1, rot: r() * 6.28, style: Math.floor(r() * 4), ph: r() * 10, look: i % LOOKS.length}); } return s; })();
export const Dancers = ({frame, n = 12, energy = 1, offset = [0, 0, 0], skip = -1, collapse, expr, scale = 0.85, shoes}) => <>{DANCER_SPOTS.slice(0, n).map((d, i) => {
  if (i === skip) return null; const L = LOOKS[d.look]; const ct = collapse ? collapse(i) : 0;
  const x = d.x + offset[0], z = d.z + offset[2];
  if (ct > 0) return <Person key={i} position={[x, 0, z]} rotation={d.rot} scale={scale} pose="fall" fallT={ct} phase={frame / 3} {...L} shoes={shoes || L.shoes} expr={ct > 0.6 ? 'closed' : 'tired'} />;
  return <Person key={i} position={[x, 0, z]} rotation={d.rot + Math.sin(frame * 0.02 + i) * 0.6} scale={scale} pose="dance" style={d.style} energy={energy} phase={frame / 4 + d.ph} {...L} shoes={shoes || L.shoes} expr={expr || (i % 3 === 0 ? 'happy' : i % 3 === 1 ? 'shock' : 'o')} />;
})}</>;

/** Instanced far crowd: hundreds of tiny blocky dancers (2 boxes each) bobbing; count, area rect [x0,x1,z0,z1]. */
export const MiniCrowd = ({frame = 0, count = 360, area = [-12, 12, -6, 14], scale = 0.85, energy = 1, seed = 4, dark = 0}) => {
  const data = useMemo(() => {
    const r = rng(seed); const ps = Array.from({length: count}, () => ({x: area[0] + r() * (area[1] - area[0]), z: area[2] + r() * (area[3] - area[2]), ph: r() * 6.28, sp: 0.7 + r() * 0.6, c: LOOKS[Math.floor(r() * LOOKS.length)]}));
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const body = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({flatShading: true}), count);
    const head = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({flatShading: true}), count);
    const arms = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({flatShading: true}), count * 2);
    ps.forEach((p, i) => { body.setColorAt(i, new THREE.Color(p.c.shirt)); head.setColorAt(i, new THREE.Color(p.c.skin)); arms.setColorAt(i * 2, new THREE.Color(p.c.shirt)); arms.setColorAt(i * 2 + 1, new THREE.Color(p.c.shirt)); });
    return {ps, body, head, arms};
  }, [count, seed]);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  data.ps.forEach((p, i) => {
    const t = frame * 0.25 * p.sp + p.ph; const bob = Math.abs(Math.sin(t)) * 0.35 * energy * scale; const sw = Math.sin(t) * 0.25 * energy;
    e.set(0, p.ph + Math.sin(t * 0.3) * 0.8, sw); q.setFromEuler(e);
    m.compose(v.set(p.x, (0.75) * scale + bob, p.z), q, s.set(0.55 * scale, 1.5 * scale, 0.3 * scale)); data.body.setMatrixAt(i, m);
    m.compose(v.set(p.x + Math.sin(sw) * -0.6 * scale, 1.75 * scale + bob, p.z), q, s.set(0.5 * scale, 0.5 * scale, 0.5 * scale)); data.head.setMatrixAt(i, m);
    for (const k of [0, 1]) { const sd = k ? 1 : -1; e.set(0, p.ph, sd * (2.4 + Math.sin(t * 2 + k) * 0.6 * energy)); q.setFromEuler(e);
      m.compose(v.set(p.x + sd * 0.4 * scale, 1.45 * scale + bob, p.z), q, s.set(0.16 * scale, 0.7 * scale, 0.16 * scale)); data.arms.setMatrixAt(i * 2 + k, m); }
  });
  data.body.instanceMatrix.needsUpdate = true; data.head.instanceMatrix.needsUpdate = true; data.arms.instanceMatrix.needsUpdate = true;
  const tint = new THREE.Color('#ffffff').lerp(new THREE.Color('#5a2a3a'), dark);
  data.body.material.color = tint; data.head.material.color = tint; data.arms.material.color = tint;
  return <group><primitive object={data.body} /><primitive object={data.head} /><primitive object={data.arms} /></group>;
};

// confetti burst (fanfare gag)
export const Confetti = ({origin = [0, 3, 0], frame = 0, count = 70, seed = 9}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({vx: (r() - 0.5) * 0.5, vy: 0.25 + r() * 0.35, vz: (r() - 0.5) * 0.4, c: ['#ff4d4d', '#ffd23a', '#3ad1ff', '#7dff6a', '#ff7ae0'][Math.floor(r() * 5)], rs: r() * 0.3})); }, [count, seed]);
  if (frame < 0) return null;
  return <group>{ps.map((p, i) => { const t = frame; const y = origin[1] + p.vy * t - 0.006 * t * t; if (y < 0) return null;
    return <mesh key={i} position={[origin[0] + p.vx * t, y, origin[2] + p.vz * t]} rotation={[t * p.rs, t * 0.2, 0]}><boxGeometry args={[0.18, 0.04, 0.12]} /><meshBasicMaterial color={p.c} side={THREE.DoubleSide} /></mesh>; })}</group>;
};

// red footprints on the cobbles appearing over time
export const Footprints = ({frame = 0, n = 40, area = 3, seed = 6, start = 0, rate = 2.2}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: n}, () => ({x: (r() - 0.5) * area * 2, z: (r() - 0.5) * area, a: r() * 6.28, s: 0.8 + r() * 0.4})); }, [n, seed, area]);
  const shown = Math.floor(Math.max(0, frame - start) / rate);
  return <group>{ps.slice(0, shown).map((p, i) => <mesh key={i} position={[p.x, 0.02 + i * 0.0005, p.z]} rotation={[-Math.PI / 2, 0, p.a]} scale={p.s}><planeGeometry args={[0.22, 0.42]} /><meshBasicMaterial color="#8a0f16" transparent opacity={0.85} /></mesh>)}</group>;
};

// mountain chapel (St Vitus shrine) on a hill
export const Chapel = ({position = [0, 0, 0]}) => <group position={position}>
  <B p={[0, 1.6, 0]} s={[3, 3.2, 4.5]} c="#f4ead6" />
  <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}><primitive object={roofGeo(4.5, 3, 1.8)} attach="geometry" /><meshLambertMaterial color="#b8452f" flatShading side={THREE.DoubleSide} /></mesh>
  <B p={[0, 4.4, 2.0]} s={[1, 2.6, 1]} c="#f4ead6" />
  <mesh position={[0, 6.3, 2.0]}><coneGeometry args={[0.8, 1.6, 4]} /><meshLambertMaterial color="#b8452f" flatShading /></mesh>
  <B p={[0, 7.4, 2.0]} s={[0.12, 0.8, 0.12]} c="#ffd23a" /><B p={[0, 7.5, 2.0]} s={[0.5, 0.12, 0.12]} c="#ffd23a" />
  <B p={[0, 0.9, 2.27]} s={[1, 1.8, 0.05]} c="#5a3420" />
  <Glow position={[0, 1.2, 2.6]} size={2.2} color="#ffd27a" opacity={0.5} />
</group>;
