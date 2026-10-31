import * as THREE from 'three';
import {useMemo, useRef, useLayoutEffect} from 'react';
import {rng, clamp01, hash2} from '../kit/noise.js';
import {softTexture} from '../kit/Sky.jsx';
import {Guy} from './Guy.jsx';

const M = ({p, s, c, rot, geo = 'box', e, o = 1}) => (
  <mesh position={p} rotation={rot || [0, 0, 0]}>
    {geo === 'box' ? <boxGeometry args={s} /> : geo === 'cyl' ? <cylinderGeometry args={s} /> : geo === 'ico' ? <icosahedronGeometry args={s} /> : <sphereGeometry args={s} />}
    <meshLambertMaterial color={c} emissive={e || '#000000'} flatShading transparent={o < 1} opacity={o} /></mesh>
);

// ---------- text on a canvas texture (signs, labels, dice faces) ----------
const TT = new Map();
export const textTex = (text, {w = 256, h = 128, bg = '#f4ead2', fg = '#2a1a10', font = 'Lilita One', size = 64, border = '#5a3a22'} = {}) => {
  const key = [text, w, h, bg, fg, font, size, border].join('|'); if (TT.has(key)) return TT.get(key);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
  g.fillStyle = fg; g.font = `${size}px '${font}', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  String(text).split('\n').forEach((ln, i, a) => g.fillText(ln, w / 2, h / 2 + (i - (a.length - 1) / 2) * size * 1.05));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; TT.set(key, t); return t;
};
const CT = new Map();
export const skullTex = () => { if (CT.has('skull')) return CT.get('skull'); const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  g.fillStyle = '#f4ead2'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#111'; g.lineWidth = 5; g.strokeRect(2, 2, 60, 60);
  g.fillStyle = '#111'; g.beginPath(); g.arc(32, 27, 15, 0, Math.PI * 2); g.fill(); g.fillRect(23, 34, 18, 10);
  g.fillStyle = '#f4ead2'; g.beginPath(); g.arc(26, 26, 4.5, 0, 6.3); g.arc(38, 26, 4.5, 0, 6.3); g.fill(); g.fillRect(27, 39, 3, 5); g.fillRect(34, 39, 3, 5);
  g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.moveTo(12, 46); g.lineTo(52, 58); g.moveTo(52, 46); g.lineTo(12, 58); g.stroke();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; CT.set('skull', t); return t; };
export const diceTex = (n) => { const k = 'd' + n; if (CT.has(k)) return CT.get(k); const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#c22f2a';
  const P = {1: [[32, 32]], 2: [[18, 18], [46, 46]], 3: [[16, 16], [32, 32], [48, 48]], 4: [[18, 18], [46, 18], [18, 46], [46, 46]], 5: [[16, 16], [48, 16], [32, 32], [16, 48], [48, 48]], 6: [[18, 14], [46, 14], [18, 32], [46, 32], [18, 50], [46, 50]]}[n];
  P.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 6, 0, 6.3); g.fill(); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; CT.set(k, t); return t; };
export const Sign = ({position, rotation = 0, text, w = 2.4, h = 1.2, post = 1.4, opts = {}}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {post > 0 && <M p={[0, post / 2, -0.05]} s={[0.14, post, 0.14]} c="#6b4a2b" />}
    <mesh position={[0, post + h / 2, 0]}><boxGeometry args={[w, h, 0.08]} /><meshLambertMaterial attach="material-0" color="#8a6a42" />
      <meshLambertMaterial attach="material-1" color="#8a6a42" /><meshLambertMaterial attach="material-2" color="#8a6a42" /><meshLambertMaterial attach="material-3" color="#8a6a42" />
      <meshBasicMaterial attach="material-4" map={textTex(text, opts)} /><meshLambertMaterial attach="material-5" color="#8a6a42" /></mesh>
  </group>
);

// ---------- 1904 automobile (open tourer, brass lamps, spoked wheels, tall seats) ----------
const SpokeWheel = ({p, r = 0.48, dist = 0}) => (
  <group position={p} rotation={[dist / r, 0, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[r, 0.07, 5, 14]} /><meshLambertMaterial color="#1d1d22" flatShading /></mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} rotation={[i * Math.PI / 6 * 2, 0, 0]}><boxGeometry args={[0.04, r * 1.9, 0.04]} /><meshLambertMaterial color="#e9c46a" /></mesh>)}
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.14, 8]} /><meshLambertMaterial color="#c99a3a" /></mesh>
  </group>
);
export const OldCar = ({position = [0, 0, 0], rotation = 0, scale = 1, dist = 0, color = '#b3261e', trim = '#e9c46a', bounce = 0, frame = 0, smoke = 0, children}) => {
  const b = bounce ? Math.sin(frame * 0.9) * 0.03 * bounce + Math.sin(frame * 1.7) * 0.02 * bounce : 0;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <SpokeWheel p={[-0.85, 0.48, 1.15]} dist={dist} /><SpokeWheel p={[0.85, 0.48, 1.15]} dist={dist} />
      <SpokeWheel p={[-0.85, 0.48, -1.1]} dist={dist} r={0.52} /><SpokeWheel p={[0.85, 0.48, -1.1]} dist={dist} r={0.52} />
      <group position={[0, b, 0]}>
        <M p={[0, 0.72, 0]} s={[1.5, 0.22, 3.5]} c="#2a2220" />
        <M p={[0, 1.02, 1.25]} s={[1.2, 0.55, 0.95]} c={color} />{/* hood */}
        <M p={[0, 1.05, 1.74]} s={[1.0, 0.6, 0.06]} c={trim} />{/* radiator */}
        <M p={[0, 1.1, -0.35]} s={[1.5, 0.6, 2.1]} c={color} />{/* tub */}
        <M p={[0, 1.42, -0.95]} s={[1.4, 0.55, 0.25]} c="#3a1f14" />{/* rear seat back */}
        <M p={[0, 1.38, 0.15]} s={[1.4, 0.45, 0.2]} c="#3a1f14" />{/* front seat back */}
        <M p={[0, 1.42, -0.55]} s={[1.3, 0.12, 0.65]} c="#5a2f1c" />
        <M p={[-0.4, 1.5, 0.75]} s={[0.05, 0.6, 0.05]} c="#2a2a2a" rot={[-0.5, 0, 0]} />
        <mesh position={[-0.4, 1.78, 0.6]} rotation={[1.1, 0, 0]}><torusGeometry args={[0.18, 0.03, 4, 10]} /><meshLambertMaterial color="#2a2a2a" /></mesh>
        {[-0.62, 0.62].map((x) => <group key={x}><M p={[x, 1.25, 1.62]} s={[0.12, 0.2, 0.12, 8]} geo="cyl" c={trim} rot={[Math.PI / 2, 0, 0]} />
          <M p={[x, 1.25, 1.7]} s={[0.1, 0.1, 0.02, 8]} geo="cyl" c="#fff6c8" rot={[Math.PI / 2, 0, 0]} /></group>)}
        {[-0.85, 0.85].map((x) => <M key={'m' + x} p={[x, 0.98, 0]} s={[0.22, 0.06, 3.0]} c="#2a2220" />)}
        {children}
      </group>
      {smoke > 0 && <Puffs position={[0.3, 0.6, -1.9]} frame={frame} count={6} color="#e8e2d8" opacity={0.5 * smoke} height={1.6} size={0.6} wind={[0.2, 0, -1.2]} />}
    </group>
  );
};

// ---------- soft puff particles (exhaust, steam, stink) ----------
const Spr = ({p, s, c, o, add}) => <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={softTexture()} color={c} transparent opacity={o} depthWrite={false} blending={add ? THREE.AdditiveBlending : THREE.NormalBlending} /></sprite>;
export const Puffs = ({position = [0, 0, 0], frame = 0, count = 8, color = '#ddd', opacity = 0.5, height = 2, size = 0.8, wind = [0.3, 0, 0], speed = 0.02, add}) => (
  <group position={position}>{Array.from({length: count}, (_, i) => {
    const c = (i / count + frame * speed) % 1;
    return <Spr key={i} p={[wind[0] * c * height + Math.sin(c * 7 + i) * 0.15, c * height, wind[2] * c * height]} s={size * (0.4 + c * 1.6)} c={color} o={opacity * Math.sin(Math.PI * Math.min(1, c * 1.2))} add={add} />;
  })}</group>
);

/**
 * Dust trail: particles emitted along an emitter path pos(frame) -> [x,y,z]. Deterministic: particle k was born at frame f - k*every.
 * Billows up/outward and fades. Use behind cars / running crowds.
 */
export const DustTrail = ({pos, frame, every = 2, life = 60, size = 1.6, grow = 3.2, color = '#e8cfa0', opacity = 0.5, rise = 1.6, spread = 1.4, seed = 1}) => {
  const n = Math.ceil(life / every); const out = [];
  for (let k = 0; k < n; k++) {
    const birth = Math.floor(frame / every) * every - k * every; const age = (frame - birth) / life; if (age < 0 || age > 1 || birth < -400) continue;
    const p = pos(birth); const h1 = hash2(birth, seed, 3), h2 = hash2(seed, birth, 7);
    const x = p[0] + (h1 - 0.5) * spread * (0.4 + age * 2), z = p[2] + (h2 - 0.5) * spread * (0.4 + age * 2), y = p[1] + 0.3 + age * rise * (0.5 + h1);
    out.push(<Spr key={birth} p={[x, y, z]} s={size * (0.6 + age * grow)} c={color} o={opacity * Math.sin(Math.PI * Math.min(1, age * 1.15 + 0.08))} />);
  }
  return <group>{out}</group>;
};

/** Floating dust motes / heat shimmer specks in a box (additive, golden). */
export const Motes = ({center = [0, 2, 0], area = [30, 6, 30], count = 50, frame = 0, color = '#fff0b0', size = 0.25, opacity = 0.7, seed = 4}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => [r(), r(), r(), r() * 6.28]); }, [count, seed]);
  return <group>{ps.map(([a, b, c, ph], i) => <Spr key={i} add c={color} s={size} o={opacity * (0.5 + 0.5 * Math.sin(frame * 0.07 + ph))}
    p={[center[0] + (a - 0.5) * area[0] + Math.sin(frame * 0.013 + ph) * 1.5, center[1] + b * area[1] + Math.sin(frame * 0.02 + ph) * 0.4, center[2] + (c - 0.5) * area[2]]} />)}</group>;
};

// ---------- instanced crowd (grandstands): body + head + 2 arms per spectator, cheering bounce ----------
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
export const Crowd = ({spots, frame = 0, excite = 1, face = 0, hats = true, seed = 3, boo = 0}) => {
  const body = useRef(), head = useRef(), arms = useRef(), hat = useRef();
  const data = useMemo(() => { const r = rng(seed); return spots.map(() => ({ph: r() * 6.28, sp: 0.6 + r() * 0.7, col: Math.floor(r() * 10), skin: ['#e9b68e', '#c98a5a', '#a86a40', '#f0c8a0', '#7a4b2c'][Math.floor(r() * 5)], hat: r() < 0.6, hc: r() < 0.5 ? '#e9cf7a' : '#2a2420', up: r()})); }, [spots, seed]);
  const COLS = ['#c2453a', '#2f6db5', '#e9cf7a', '#3f8a4a', '#f4f1e8', '#7a5be0', '#e07a2f', '#2b2b33', '#d84a8a', '#4ab0c8'];
  useLayoutEffect(() => {
    if (!body.current) return;
    spots.forEach((sp, i) => {
      const d = data[i]; const s = Math.sin(frame * 0.33 * d.sp + d.ph);
      const jump = excite * Math.max(0, s) * 0.32; const y = sp[1] + jump; const rotY = (sp[3] || 0) + face;
      _e.set(0, rotY, boo ? Math.sin(frame * 0.2 + d.ph) * 0.05 : 0); _q.setFromEuler(_e);
      _p.set(sp[0], y + 0.75, sp[2]); _s.set(1, 1, 1); _m.compose(_p, _q, _s); body.current.setMatrixAt(i, _m); body.current.setColorAt(i, _c.set(COLS[d.col]));
      _p.set(sp[0], y + 1.38, sp[2]); _m.compose(_p, _q, _s); head.current.setMatrixAt(i, _m); head.current.setColorAt(i, _c.set(d.skin));
      _p.set(sp[0], y + 1.72, sp[2]); _s.set(d.hat && hats ? 1 : 0.001, 1, d.hat && hats ? 1 : 0.001); _m.compose(_p, _q, _s); hat.current.setMatrixAt(i, _m); hat.current.setColorAt(i, _c.set(d.hc));
      const raise = excite * (d.up < 0.75 ? 1 : 0.2) * (0.6 + 0.4 * s);
      for (let a = 0; a < 2; a++) {
        const side = a ? 1 : -1; const ang = side * (0.2 + raise * 2.6);
        _e.set(0, rotY, ang); _q.setFromEuler(_e);
        const ox = Math.cos(rotY) * side * 0.36, oz = -Math.sin(rotY) * side * 0.36;
        _p.set(sp[0] + ox, y + 1.0 + raise * 0.35, sp[2] + oz); _s.set(1, 1, 1); _m.compose(_p, _q, _s);
        arms.current.setMatrixAt(i * 2 + a, _m); arms.current.setColorAt(i * 2 + a, _c.set(COLS[d.col]).multiplyScalar(0.85));
      }
    });
    [body, head, arms, hat].forEach((r) => { r.current.instanceMatrix.needsUpdate = true; if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true; });
  });
  const n = spots.length;
  return <group>
    <instancedMesh ref={body} args={[null, null, n]}><boxGeometry args={[0.5, 0.72, 0.3]} /><meshLambertMaterial flatShading /></instancedMesh>
    <instancedMesh ref={head} args={[null, null, n]}><boxGeometry args={[0.46, 0.46, 0.46]} /><meshLambertMaterial flatShading /></instancedMesh>
    <instancedMesh ref={hat} args={[null, null, n]}><cylinderGeometry args={[0.36, 0.36, 0.1, 8]} /><meshLambertMaterial flatShading /></instancedMesh>
    <instancedMesh ref={arms} args={[null, null, n * 2]}><boxGeometry args={[0.16, 0.6, 0.16]} /><meshLambertMaterial flatShading /></instancedMesh>
  </group>;
};

// ---------- stadium (Francis Field style): oval track, infield, grandstand with crowd, flags, finish line ----------
const ovalShape = (a, b, seg = 48) => { const s = new THREE.Shape(); for (let i = 0; i <= seg; i++) { const t = i / seg * Math.PI * 2; const x = Math.cos(t) * a, y = Math.sin(t) * b; i ? s.lineTo(x, y) : s.moveTo(x, y); } return s; };
export const STAND = (() => { // crowd spots on a stepped grandstand along -z side and the +x curve
  const out = []; const r = rng(7);
  for (let row = 0; row < 7; row++) for (let i = 0; i < 46; i++) { const x = -27 + i * 1.2 + (r() - 0.5) * 0.3; out.push([x, 0.6 + row * 0.75, -17.5 - row * 1.1, 0]); }
  return out;
})();
export const Flag = ({position, color = '#d6302a', color2 = '#ffffff', frame = 0, h = 6, seed = 0}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(2.2, 1.3, 8, 2), []);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 1.1; p.setZ(i, Math.sin(x * 2.2 - frame * 0.25 + seed) * 0.18 * x); }
  p.needsUpdate = true; geo.computeVertexNormals();
  return <group position={position}>
    <M p={[0, h / 2, 0]} s={[0.07, 0.07, h, 6]} geo="cyl" c="#e8e2d0" />
    <mesh geometry={geo} position={[1.1, h - 0.7, 0]}><meshLambertMaterial color={color} side={THREE.DoubleSide} flatShading /></mesh>
    <mesh position={[1.1, h - 0.7, 0.01]} scale={[1, 0.3, 1]} geometry={geo}><meshLambertMaterial color={color2} side={THREE.DoubleSide} flatShading /></mesh>
  </group>;
};
export const Stadium = ({frame = 0, excite = 0.6, crowdFace = 0, boo = 0, tape = true, banner = 'OLYMPIC GAMES 1904'}) => {
  const track = useMemo(() => { const s = ovalShape(30, 14); s.holes.push(new THREE.Path(ovalShape(25, 10).getPoints(48))); const g = new THREE.ShapeGeometry(s, 48); g.rotateX(-Math.PI / 2); return g; }, []);
  const infield = useMemo(() => { const g = new THREE.ShapeGeometry(ovalShape(25, 10), 48); g.rotateX(-Math.PI / 2); return g; }, []);
  return <group>
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[200, 200]} /><meshLambertMaterial color="#7fb04a" /></mesh>
    <mesh geometry={track} position={[0, 0.02, 0]}><meshLambertMaterial color="#c9824a" flatShading /></mesh>
    {[26.6, 28.2].map((a, i) => <mesh key={i} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, (10 + (a - 25)) / a, 1]}><ringGeometry args={[a - 0.06, a + 0.06, 64]} /><meshBasicMaterial color="#f4ead2" /></mesh>)}
    <mesh geometry={infield} position={[0, 0.03, 0]}><meshLambertMaterial color="#5fae3a" flatShading /></mesh>
    {Array.from({length: 10}, (_, i) => <mesh key={i} position={[-22.5 + i * 5, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.5, 19]} /><meshLambertMaterial color="#6cbc44" /></mesh>)}
    {/* finish line across the near straight (z ~ +12) */}
    <mesh position={[0, 0.05, 12]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.6, 4.5]} /><meshBasicMaterial color="#ffffff" /></mesh>
    {tape && <M p={[0, 1.25, 12]} s={[0.04, 0.06, 3.6]} c="#d6302a" />}
    {/* grandstands */}
    {Array.from({length: 7}, (_, r) => <M key={'s' + r} p={[0, 0.3 + r * 0.75, -17.5 - r * 1.1]} s={[58, 0.6 + r * 0.0, 1.2]} c={r % 2 ? '#d9c8a6' : '#c9b48e'} />)}
    <M p={[0, 3, -26]} s={[60, 7, 1]} c="#b89a6e" />
    <M p={[0, 9.6, -21.5]} s={[62, 0.4, 10]} c="#a8352f" rot={[0.12, 0, 0]} />
    {Array.from({length: 9}, (_, i) => <M key={'p' + i} p={[-28 + i * 7, 4.8, -16.8]} s={[0.25, 9.4, 0.25]} c="#f4ead2" />)}
    {/* bunting along the stand roof */}
    {Array.from({length: 30}, (_, i) => <mesh key={'b' + i} position={[-29 + i * 2, 9.0, -16.6]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.45, 0.8, 3]} /><meshLambertMaterial color={['#d6302a', '#ffffff', '#2f5db5'][i % 3]} flatShading /></mesh>)}
    <mesh position={[0, 7.6, -16.55]}><planeGeometry args={[16, 1.6]} /><meshBasicMaterial map={textTex(banner, {w: 1024, h: 102, bg: '#f4ead2', fg: '#a8352f', size: 74, border: '#2f5db5'})} /></mesh>
    {[-24, -12, 12, 24].map((x, i) => <Flag key={x} position={[x, 9.8, -21]} frame={frame} seed={i} color={i % 2 ? '#2f5db5' : '#d6302a'} />)}
    <Crowd spots={STAND} frame={frame} excite={excite} face={crowdFace} boo={boo} />
    {/* trees ring */}
    {Array.from({length: 26}, (_, i) => { const a = i / 26 * Math.PI * 2; return <group key={'t' + i} position={[Math.cos(a) * 52, 0, Math.sin(a) * 38]} scale={1.8 + (i % 3) * 0.5}>
      <M p={[0, 0.7, 0]} s={[0.15, 0.22, 1.4, 5]} geo="cyl" c="#6b4a2b" /><M p={[0, 2.0, 0]} s={[1.1, 0]} geo="ico" c={['#3f8a3a', '#4f9a3a', '#2f7a3a'][i % 3]} /></group>; })}
  </group>;
};

// ---------- the well at mile 12 ----------
export const Well = ({position = [0, 0, 0], frame = 0, bucket = 0}) => (
  <group position={position}>
    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[1.1, 1.2, 1.0, 10, 1, true]} /><meshLambertMaterial color="#9a948a" flatShading side={THREE.DoubleSide} /></mesh>
    {Array.from({length: 10}, (_, i) => <M key={i} p={[Math.cos(i / 10 * 6.28) * 1.15, 0.25 + (i % 2) * 0.5, Math.sin(i / 10 * 6.28) * 1.15]} s={[0.5, 0.35, 0.3]} c={i % 3 ? '#8a847a' : '#b0aaa0'} rot={[0, -i / 10 * 6.28, 0]} />)}
    <mesh position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.0, 10]} /><meshLambertMaterial color="#14202a" /></mesh>
    {[-1, 1].map((s) => <M key={s} p={[s * 1.0, 1.6, 0]} s={[0.14, 2.2, 0.14]} c="#6b4a2b" />)}
    <mesh position={[0, 3.0, 0]} rotation={[0, 0, 0]}><coneGeometry args={[1.8, 1.0, 4]} /><meshLambertMaterial color="#a8352f" flatShading /></mesh>
    <group position={[0, 2.2, 0]} rotation={[frame * 0.15 * bucket, 0, 0]}><M p={[0, 0, 0]} s={[0.12, 0.12, 2.1, 8]} geo="cyl" c="#7a5a3a" rot={[0, 0, Math.PI / 2]} /></group>
    <M p={[0, 2.2 - 0.6 - bucket * 0.2, 0]} s={[0.02, 1.0, 0.02]} c="#d9c8a6" />
    <M p={[0, 1.2 - bucket * 0.4, 0]} s={[0.3, 0.22, 0.35, 8]} geo="cyl" c="#7a5a3a" />
  </group>
);

// ---------- apple tree ----------
export const AppleTree = ({position = [0, 0, 0], s = 1, seed = 1, frame = 0, rotten = 0}) => {
  const apples = useMemo(() => { const r = rng(seed * 13 + 1); return Array.from({length: 9}, () => [(r() - 0.5) * 2.2, 1.9 + r() * 1.3, (r() - 0.5) * 2.2]); }, [seed]);
  const sway = Math.sin(frame * 0.05 + seed) * 0.04;
  return <group position={position} scale={s} rotation={[0, seed, sway]}>
    <M p={[0, 0.8, 0]} s={[0.16, 0.24, 1.6, 6]} geo="cyl" c="#6b4a2b" />
    <M p={[0, 2.4, 0]} s={[1.35, 0]} geo="ico" c="#3f9a3a" /><M p={[0.6, 2.9, 0.2]} s={[0.8, 0]} geo="ico" c="#55b040" /><M p={[-0.6, 2.2, -0.3]} s={[0.9, 0]} geo="ico" c="#348a36" />
    {apples.map((a, i) => <M key={i} p={a} s={[0.16, 0]} geo="ico" c={rotten && i % 3 === 0 ? '#8a7a2a' : '#e0322a'} />)}
  </group>;
};
export const Apple = ({position, scale = 1, rotten = 0, bite = 0}) => (
  <group position={position} scale={scale}>
    <M p={[0, 0, 0]} s={[0.22, 0]} geo="ico" c={new THREE.Color('#e0322a').lerp(new THREE.Color('#7a6a24'), rotten).getStyle()} />
    <M p={[0, 0.22, 0]} s={[0.02, 0.02, 0.12, 4]} geo="cyl" c="#4a3020" /><M p={[0.06, 0.25, 0]} s={[0.12, 0.02, 0.06]} c="#3f9a3a" />
    {bite > 0 && <M p={[0.15, 0.03, 0.08]} s={[0.12, 0]} geo="ico" c="#f4ead2" />}
  </group>
);

// ---------- cornfield (instanced stalks that sway; parted by a runner path) ----------
export const Corn = ({x0 = -30, x1 = 30, z0 = -30, z1 = 30, step = 1.0, frame = 0, part, seed = 5, h = 2.6, groundFn}) => {
  const stalk = useRef(), leaf = useRef(), cob = useRef();
  const spots = useMemo(() => { const r = rng(seed); const o = []; for (let x = x0; x <= x1; x += step) for (let z = z0; z <= z1; z += step * 0.7) { const px = x + (r() - 0.5) * 0.35, pz = z + (r() - 0.5) * 0.35; o.push([px, pz, r() * 6.28, 0.8 + r() * 0.35]); } return o; }, [x0, x1, z0, z1, step, seed]);
  useLayoutEffect(() => {
    spots.forEach(([x, z, ph, s], i) => {
      let tilt = Math.sin(frame * 0.06 + x * 0.3 + z * 0.2) * 0.08; let tz = 0;
      if (part) { const d = part(x, z); tilt += d[0]; tz = d[1]; }
      _e.set(tz, ph, tilt); _q.setFromEuler(_e); _s.set(1, s, 1); _p.set(x, groundFn ? groundFn(x, z) - 0.05 : 0, z); _m.compose(_p, _q, _s); stalk.current.setMatrixAt(i, _m); leaf.current.setMatrixAt(i, _m); cob.current.setMatrixAt(i, _m);
    });
    stalk.current.instanceMatrix.needsUpdate = true; leaf.current.instanceMatrix.needsUpdate = true; cob.current.instanceMatrix.needsUpdate = true;
  });
  const sg = useMemo(() => { const g = new THREE.BoxGeometry(0.1, h, 0.1); g.translate(0, h / 2, 0); return g; }, [h]);
  const lg = useMemo(() => { const a = new THREE.BoxGeometry(0.9, 0.05, 0.22); a.translate(0.4, h * 0.55, 0); a.rotateZ(0); const b = new THREE.BoxGeometry(0.8, 0.05, 0.2); b.translate(-0.35, h * 0.75, 0); const c = new THREE.BoxGeometry(0.22, 0.05, 0.7); c.translate(0, h * 0.4, 0.3);
    const m = new THREE.BufferGeometry(); const parts = [a, b, c].map((g) => g.toNonIndexed()); const pos = []; parts.forEach((g) => pos.push(...g.attributes.position.array)); m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); m.computeVertexNormals(); return m; }, [h]);
  const cg = useMemo(() => { const g = new THREE.BoxGeometry(0.14, 0.3, 0.14); g.translate(0.12, h * 0.62, 0); return g; }, [h]);
  const n = spots.length;
  return <group>
    <instancedMesh ref={stalk} args={[sg, null, n]}><meshLambertMaterial color="#8fb83a" flatShading /></instancedMesh>
    <instancedMesh ref={leaf} args={[lg, null, n]}><meshLambertMaterial color="#6fa832" flatShading /></instancedMesh>
    <instancedMesh ref={cob} args={[cg, null, n]}><meshLambertMaterial color="#d9c25a" flatShading /></instancedMesh>
  </group>;
};

// ---------- blocky dog with gallop ----------
export const Dog = ({position = [0, 0, 0], rotation = 0, scale = 1, t = 0, color = '#8a6a4a', dark = '#4a3424', run = 1, bark = 0}) => {
  const ph = t * 0.55; const s = Math.sin(ph), c = Math.cos(ph);
  const bob = run * Math.abs(s) * 0.12; const pitch = run * Math.sin(ph) * 0.12;
  return <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotation, 0]} scale={scale}>
    <group rotation={[pitch, 0, 0]}>
      <M p={[0, 0.75, 0]} s={[0.5, 0.45, 1.15]} c={color} />
      <M p={[0, 0.82, -0.05]} s={[0.52, 0.2, 0.6]} c={dark} />
      <group position={[0, 1.0, 0.62]} rotation={[-0.2 + bark * Math.max(0, Math.sin(t * 1.3)) * 0.25, 0, 0]}>
        <M p={[0, 0.05, 0.1]} s={[0.46, 0.42, 0.44]} c={color} />
        <M p={[0, -0.05, 0.42]} s={[0.26, 0.2, 0.3]} c={dark} />
        <M p={[0, -0.18 - bark * Math.max(0, Math.sin(t * 1.3)) * 0.12, 0.4]} s={[0.22, 0.06, 0.26]} c="#c94a5a" />
        <M p={[0, 0.02, 0.58]} s={[0.1, 0.08, 0.06]} c="#111" />
        <M p={[-0.12, 0.12, 0.33]} s={[0.07, 0.07, 0.02]} c="#111" /><M p={[0.12, 0.12, 0.33]} s={[0.07, 0.07, 0.02]} c="#111" />
        <M p={[-0.2, 0.32, 0]} s={[0.12, 0.26, 0.1]} c={dark} rot={[0, 0, 0.3]} /><M p={[0.2, 0.32, 0]} s={[0.12, 0.26, 0.1]} c={dark} rot={[0, 0, -0.3]} />
      </group>
      <group position={[0, 0.9, -0.58]} rotation={[0.8 + Math.sin(t * 0.9) * 0.3, 0, Math.sin(t * 0.7) * 0.4]}><M p={[0, 0.2, 0]} s={[0.1, 0.42, 0.1]} c={dark} /></group>
      {[[-0.16, 0.42, s], [0.16, 0.42, s], [-0.16, -0.42, -s], [0.16, -0.42, -s]].map(([x, z, a], i) => <group key={i} position={[x, 0.6, z]} rotation={[a * 0.9 * run, 0, 0]}>
        <M p={[0, -0.26, 0]} s={[0.14, 0.5, 0.14]} c={color} /><M p={[0, -0.5, 0.03]} s={[0.15, 0.08, 0.2]} c={dark} /></group>)}
    </group>
  </group>;
};

// ---------- props held in hands ----------
export const PoisonBottle = ({scale = 1, glow = 0}) => (
  <group scale={scale} rotation={[Math.PI, 0, 0]} position={[0, -0.1, 0]}>
    <M p={[0, 0, 0]} s={[0.14, 0.16, 0.42, 8]} geo="cyl" c="#3a8a4a" e={glow ? '#1a6a2a' : '#000'} />
    <M p={[0, 0.27, 0]} s={[0.06, 0.12, 0.14, 8]} geo="cyl" c="#3a8a4a" />
    <M p={[0, 0.37, 0]} s={[0.07, 0.07, 0.07, 8]} geo="cyl" c="#7a4a2a" />
    <mesh position={[0, 0.0, 0.161]} rotation={[0, 0, Math.PI]}><planeGeometry args={[0.22, 0.24]} /><meshBasicMaterial map={skullTex()} /></mesh>
  </group>
);
export const Phone = () => <M p={[0, 0, 0.05]} s={[0.2, 0.36, 0.04]} c="#1a1a22" />;

// ---------- modern apartment (stairs / couch / laundry) ----------
export const ModernRoom = ({frame = 0, stairs = true, couch = true, laundry = false}) => (
  <group>
    <M p={[0, -0.05, 0]} s={[40, 0.1, 40]} c="#c9a27a" />
    {Array.from({length: 14}, (_, i) => <M key={'fl' + i} p={[-20 + i * 3, -0.04, 0]} s={[0.05, 0.1, 40]} c="#a8835e" />)}
    <M p={[0, 5, -8]} s={[40, 10, 0.3]} c="#e8dcf4" />
    <M p={[-12, 5, 0]} s={[0.3, 10, 40]} c="#d8ccec" />
    {stairs && Array.from({length: 12}, (_, i) => <M key={'st' + i} p={[3.5, 0.25 + i * 0.5, -1 - i * 0.55]} s={[3.2, 0.5, 0.6]} c={i % 2 ? '#e6e1da' : '#d8d2ca'} />)}
    {stairs && <M p={[5.2, 3.6, -4]} s={[0.12, 0.12, 7.8]} c="#555b66" rot={[0.74, 0, 0]} />}
    {couch && <group position={[-5, 0, -4]}><M p={[0, 0.5, 0]} s={[4.4, 1.0, 1.8]} c="#4a6ad8" /><M p={[0, 1.4, -0.75]} s={[4.4, 1.2, 0.4]} c="#3a58c0" /><M p={[-2.2, 0.9, 0]} s={[0.4, 1.0, 1.8]} c="#3a58c0" /><M p={[2.2, 0.9, 0]} s={[0.4, 1.0, 1.8]} c="#3a58c0" /></group>}
    <group position={[-10, 2.5, -6]}><M p={[0, 0, 0]} s={[0.3, 2.6, 4.2]} c="#1a1a22" /><mesh position={[0.17, 0, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[3.9, 2.3]} /><meshBasicMaterial color={new THREE.Color('#3fb0ff').lerp(new THREE.Color('#ff5ab0'), 0.5 + 0.5 * Math.sin(frame * 0.05))} /></mesh></group>
    <M p={[7, 0.6, -6]} s={[0.9, 1.2, 0.9]} c="#3a7a3a" /><M p={[7, 1.9, -6]} s={[1.2, 0]} geo="ico" c="#4aa04a" />
    {laundry && <group position={[-2.1, 0, 0.2]}>{Array.from({length: 16}, (_, i) => <M key={i} p={[Math.sin(i * 2.3) * 0.9, 0.2 + (i % 5) * 0.22, Math.cos(i * 1.7) * 0.7]} s={[0.9, 0.18, 0.7]} c={['#e05a5a', '#5a8ae0', '#f2c94c', '#ffffff', '#7a5be0', '#3fbf9a'][i % 6]} rot={[0, i, 0.1 * (i % 3)]} />)}</group>}
  </group>
);

// ---------- podium ----------
export const Podium = () => (
  <group>
    {[[-3.4, 1.2, '#c0c7d2'], [0, 1.9, '#e9c46a'], [3.4, 0.8, '#c98a5a']].map(([x, h, c], i) => <group key={i}>
      <M p={[x, h / 2, 0]} s={[3.2, h, 2.6]} c={c} />
    </group>)}
  </group>
);
