// IA Science "What If" kit: 2D cartoon cast cards in a toon-shaded three.js world inside Remotion.
// Style rules (user, binding): no camera shake / kicks / jitter / wobble anywhere - every move is a smootherstep glide;
// captions use a per-Short colour scheme (tools/caption_next.py), never the default yellow.
import * as THREE from 'three';
import React, {useMemo, useState, useEffect, createContext, useContext} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender} from 'remotion';
import {DRAW, HEIGHT, CARD, INK} from './cast.js';

export const FPS = 30;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const sstep = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); }; // smootherstep
export const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** value along keys [{f, v}] (v number or array), smootherstep between keys */
export const keyed = (keys, f) => {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b.f) { const t = sstep((f - a.f) / Math.max(1, b.f - a.f)); return Array.isArray(a.v) ? a.v.map((x, k) => lerp(x, b.v[k], t)) : lerp(a.v, b.v, t); }
  }
  return keys[keys.length - 1].v;
};

// ------------------------------------------------------------ voice helpers
export const lineAt = (vo, t) => { let k = -1; vo.lines.forEach((l, i) => { if (t >= l.s - 0.05) k = i; }); return k; };
export const mouthFor = (vo, who, t) => {
  for (const [w, s, e, wh] of vo.words) {
    if (wh !== who || t < s - 0.02 || t > e + 0.02) continue;
    const n = Math.max(1, Math.round(w.replace(/[^a-z]/gi, '').length / 3));
    return clamp(0.25 + 0.75 * Math.abs(Math.sin(Math.PI * n * clamp((t - s) / Math.max(0.05, e - s)))));
  }
  return 0;
};
export const blinkAt = (t, seed) => { const p = 2.3 + (seed % 3) * 0.6; const u = ((t + seed * 0.77) % p); return u < 0.14 ? Math.sin((u / 0.14) * Math.PI) : 0; };

// ------------------------------------------------------------ textures
const texCache = {};
export const useTex = (file) => {
  const [h] = useState(() => delayRender('tex ' + file));
  const [ok, setOk] = useState(false);
  const advance = useThree((st) => st.advance);
  const tex = useMemo(() => {
    let e = texCache[file];
    if (!e) {
      e = {loaded: false, cbs: []};
      e.t = new THREE.TextureLoader().load(staticFile(file), () => { e.loaded = true; e.cbs.forEach((c) => c()); }, undefined, () => { e.loaded = true; e.cbs.forEach((c) => c()); });
      e.t.colorSpace = THREE.SRGBColorSpace; e.t.anisotropy = 4; texCache[file] = e;
    }
    if (e.loaded) setTimeout(() => setOk(true)); else e.cbs.push(() => setOk(true));
    return e.t;
  }, [file]);
  useEffect(() => { if (ok) { tex.needsUpdate = true; advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); } }, [ok]);
  return tex;
};
let _grad = null;
export const toonGrad = () => {
  if (_grad) return _grad;
  const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); _grad.minFilter = _grad.magFilter = THREE.NearestFilter; _grad.needsUpdate = true; return _grad;
};
export const Toon = ({color = '#ffffff', map, emissive = '#000000', ...r}) => <meshToonMaterial color={color} map={map} gradientMap={toonGrad()} emissive={emissive} {...r} />;
/** ink outline = inverted hull */
export const Ink = ({children, s = 1.035}) => <group scale={[s, s, s]}>{children}</group>;
export const InkMat = () => <meshBasicMaterial color={INK} side={THREE.BackSide} />;

// ------------------------------------------------------------ camera
const CamCtx = createContext({pos: [0, 0, 10], look: [0, 0, 0]});
export const useCam = () => useContext(CamCtx);
export const Cam = ({pos, look, fov = 40, children}) => {
  const {camera} = useThree();
  camera.position.set(...pos); camera.up.set(0, 1, 0); camera.lookAt(...look); camera.fov = fov; camera.near = 0.05; camera.far = 3000; camera.updateProjectionMatrix();
  return <CamCtx.Provider value={{pos, look, q: camera.quaternion.clone()}}>{children}</CamCtx.Provider>;
};

// ------------------------------------------------------------ cast card
export const Char = ({who, pos = [0, 0, 0], h, expr, armL, armR, look = 0, mouth = 0, blink = 0, glow = 0.6, flip = false, tilt = 0, shadow = true, opacity = 1, item = null, ...extra}) => {
  const RES = CARD.RES || 1;
  const {q} = useCam();
  const [cv, tex] = useMemo(() => {
    const c = document.createElement('canvas'); c.width = CARD.W * RES; c.height = CARD.H * RES;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return [c, t];
  }, []);
  const pose = {mouth, blink, look, glow, item, ...extra}; if (expr) pose.expr = expr; if (armL !== undefined) pose.armL = armL; if (armR !== undefined) pose.armR = armR;
  const g2 = cv.getContext('2d'); g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, CARD.W * RES, CARD.H * RES); g2.scale(RES, RES); g2.translate(CARD.PAD, 0); DRAW[who](g2, pose); tex.needsUpdate = true;
  const H = (h || HEIGHT[who]); const Wd = H * CARD.W / CARD.H;
  const e = new THREE.Euler().setFromQuaternion(q || new THREE.Quaternion());
  return (
    <group position={pos}>
      {shadow && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><circleGeometry args={[H * 0.16, 28]} /><meshBasicMaterial color="#000" transparent opacity={0.2 * opacity} depthWrite={false} /></mesh>}
      <group quaternion={q}>
        <group rotation={[0, 0, tilt]}>
          <mesh position={[0, H / 2 - H * 0.025, 0]} scale={[flip ? -1 : 1, 1, 1]}>
            <planeGeometry args={[Wd, H]} />
            <meshBasicMaterial map={tex} transparent alphaTest={0.02} opacity={opacity} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
/** card with automatic lip-sync + blink from vo.json */
export const Actor = ({who, vo, t, seed = 1, ...p}) => <Char who={who} mouth={mouthFor(vo, who, t)} blink={blinkAt(t, seed)} {...p} />;

// ------------------------------------------------------------ world pieces
export const Stars = ({n = 1400, r = 600, seed = 7}) => {
  const geo = useMemo(() => {
    let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, k = Math.sqrt(1 - u * u); p[i * 3] = r * k * Math.cos(th); p[i * 3 + 1] = r * u; p[i * 3 + 2] = r * k * Math.sin(th); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g;
  }, [n, r, seed]);
  return <points geometry={geo}><pointsMaterial color="#ffffff" size={2.6} sizeAttenuation={false} transparent opacity={0.85} /></points>;
};
export const Planet = ({file, color = '#ffffff', r = 1, pos = [0, 0, 0], rotY = 0, tilt = 0, atmo = null, ink = 1.03, emissive = '#000000', scale = 1}) => {
  const map = useTex(file);
  if (scale <= 0.001) return null;
  return (
    <group position={pos} scale={[scale, scale, scale]}>
      <group rotation={[0, 0, tilt]}>
        <mesh rotation={[0, rotY, 0]}><sphereGeometry args={[r, 64, 48]} /><Toon map={map} color={color} emissive={emissive} /></mesh>
        <mesh scale={[ink, ink, ink]}><sphereGeometry args={[r, 48, 32]} /><InkMat /></mesh>
      </group>
      {atmo && <mesh scale={[1.12, 1.12, 1.12]}><sphereGeometry args={[r, 48, 32]} /><meshBasicMaterial color={atmo} transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}
    </group>
  );
};
export const Ball = ({r = 1, pos = [0, 0, 0], color = '#fff', emissive = '#000', ink = 1.04, scale = 1, glow = null, glowS = 1.6, glowO = 0.35}) => scale <= 0.001 ? null : (
  <group position={pos} scale={[scale, scale, scale]}>
    <mesh><sphereGeometry args={[r, 40, 30]} /><Toon color={color} emissive={emissive} /></mesh>
    {ink > 0 && <mesh scale={[ink, ink, ink]}><sphereGeometry args={[r, 32, 24]} /><InkMat /></mesh>}
    {glow && <mesh scale={[glowS, glowS, glowS]}><sphereGeometry args={[r, 32, 24]} /><meshBasicMaterial color={glow} transparent opacity={glowO} side={THREE.BackSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>}
  </group>
);
export const Box = ({size = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0], color = '#ccc', ink = 0.04, emissive = '#000'}) => (
  <group position={pos} rotation={rot}>
    <mesh><boxGeometry args={size} /><Toon color={color} emissive={emissive} /></mesh>
    {ink > 0 && <mesh><boxGeometry args={size.map((x) => x + ink * 2)} /><InkMat /></mesh>}
  </group>
);
export const Cyl = ({r = 1, r2, h = 1, pos = [0, 0, 0], rot = [0, 0, 0], color = '#ccc', ink = 0.04, seg = 40, emissive = '#000'}) => (
  <group position={pos} rotation={rot}>
    <mesh><cylinderGeometry args={[r, r2 ?? r, h, seg]} /><Toon color={color} emissive={emissive} /></mesh>
    {ink > 0 && <mesh><cylinderGeometry args={[r + ink, (r2 ?? r) + ink, h + ink * 2, seg]} /><InkMat /></mesh>}
  </group>
);
/** 3D arrow from a to b */
export const Arrow = ({a, b, color = '#ffb547', w = 0.08, opacity = 1}) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); const L = d.length(); if (L < 0.01 || opacity <= 0) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const head = Math.min(L * 0.4, w * 4);
  return (
    <group position={a} quaternion={q}>
      <mesh position={[0, (L - head) / 2, 0]}><cylinderGeometry args={[w, w, L - head, 16]} /><meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} /></mesh>
      <mesh position={[0, L - head / 2, 0]}><coneGeometry args={[w * 2.4, head, 20]} /><meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} /></mesh>
    </group>
  );
};
/** expanding ring (pop / flash) */
export const Ring = ({pos = [0, 0, 0], r = 1, color = '#fff', opacity = 1, face}) => opacity <= 0 ? null : (
  <group position={pos} quaternion={face}><mesh><ringGeometry args={[r * 0.86, r, 64]} /><meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} /></mesh></group>
);
export const Lights = ({sun = [6, 5, 8], amb = 0.9, keyI = 1.7, color = '#ffffff'}) => (<>
  <ambientLight intensity={amb} />
  <directionalLight position={sun} intensity={keyI} color={color} />
</>);

// ------------------------------------------------------------ stage (one canvas; scenes are children)
export const Stage = ({bg = 'radial-gradient(120% 80% at 50% 30%, #2a2f6b 0%, #141436 55%, #090a1c 100%)', children, overlay}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: bg}} />
      <ThreeCanvas flat width={width} height={height} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: 40, position: [0, 0, 10]}}>
        {children}
      </ThreeCanvas>
      {overlay}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ overlays
export const SciFonts = () => (<style>{`
  @font-face{font-family:'Montserrat';src:url('${staticFile('fonts/Montserrat-Variable.ttf')}') format('truetype');font-weight:100 900;}
  @font-face{font-family:'Inter';src:url('${staticFile('fonts/Inter-Variable.ttf')}') format('truetype');font-weight:100 900;}
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
`}</style>);
const stroke = (px, c = '#120d1c') => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});

/** chunked word captions (1-3 words), active word in the scheme's accent colour */
export const chunks = (vo) => {
  const out = []; let cur = null;
  vo.words.forEach(([w, s, e, who, li], i) => {
    if (!cur || cur.words.length >= 3 || cur.li !== li || /[.,!?;:]$/.test(cur.words[cur.words.length - 1][0])) { cur = {li, who, words: []}; out.push(cur); }
    cur.words.push([w, s, e]);
  });
  out.forEach((c) => { c.s = c.words[0][1]; c.e = c.words[c.words.length - 1][2]; });
  out.forEach((c, i) => { c.next = out[i + 1] ? out[i + 1].s : 1e9; });
  return out;
};
export const Captions = ({vo, scheme, y = 1330, size = 72, hideAfter = 1e9}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const C = useMemo(() => chunks(vo), [vo]);
  const c = C.find((c) => t >= c.s - 0.03 && t < Math.min(c.next - 0.03, c.e + 0.3));
  if (!c || t > hideAfter) return null;
  const k = easeOut((t - c.s + 0.03) / 0.08);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: y - size * 0.7, left: 70, right: 70, textAlign: 'center', fontFamily: scheme.font, fontWeight: scheme.weight,
        fontSize: size, lineHeight: 1.12, transform: `scale(${0.9 + 0.1 * k})`, opacity: k, textTransform: 'uppercase', letterSpacing: 0.5}}>
        {c.words.map(([w, s], i) => {
          if (t < s - 0.03) return null; // never ahead of the voice
          const active = t >= s - 0.03 && (i === c.words.length - 1 || t < c.words[i + 1][1] - 0.03);
          return <span key={i} style={{color: active ? scheme.active : scheme.text, ...stroke(13), textShadow: '0 6px 0 rgba(10,6,20,0.45)', marginRight: 18}}>{w.replace(/[",]+$/g, '')}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
export const Title = ({lines, scheme, out = 75, y = 300}) => {
  const f = useCurrentFrame(); if (f > out + 10) return null;
  const k = easeOut(f / 8), o = 1 - sstep((f - out) / 10);
  return (
    <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', opacity: o, transform: `scale(${0.92 + 0.08 * k})`}}>
      {lines.map((l, i) => <div key={i} style={{display: 'inline-block', margin: '6px 40px', padding: '10px 26px', borderRadius: 18, background: i ? scheme.active : 'rgba(12,8,28,0.82)',
        color: i ? '#120d1c' : '#ffffff', fontFamily: 'Lilita One', fontSize: i ? 96 : 70, letterSpacing: 2, border: '6px solid #120d1c'}}>{l}</div>)}
    </div>
  );
};
/** a stat / label card that eases in at frame `at` (composition frames) and out at `to` */
export const Label = ({text, sub, at, to, scheme, y = 250, size = 84}) => {
  const f = useCurrentFrame(); if (f < at || f > to + 8) return null;
  const k = easeOut((f - at) / 9), o = Math.min(k, 1 - sstep((f - to) / 8));
  return (
    <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', opacity: o, transform: `translateY(${(1 - k) * 30}px)`}}>
      <div style={{display: 'inline-block', padding: '8px 30px', borderRadius: 20, background: 'rgba(12,8,28,0.78)', border: `6px solid ${scheme.active}`,
        fontFamily: 'Lilita One', fontSize: size, color: '#fff', letterSpacing: 2}}>{text}</div>
      {sub && <div style={{marginTop: 10, fontFamily: scheme.font, fontWeight: 800, fontSize: 40, color: scheme.active, ...stroke(8)}}>{sub}</div>}
    </div>
  );
};
export const EndQ = ({text, at, to, scheme, y = 330}) => {
  const f = useCurrentFrame(); if (f < at || f > to) return null;
  const k = easeOut((f - at) / 10);
  return (
    <div style={{position: 'absolute', top: y, left: 80, right: 80, textAlign: 'center', opacity: k, transform: `scale(${0.94 + 0.06 * k})`}}>
      <div style={{padding: '22px 30px', borderRadius: 26, background: 'rgba(12,8,28,0.85)', border: `7px solid ${scheme.active}`, fontFamily: 'Lilita One', fontSize: 66, lineHeight: 1.15, color: '#fff'}}>{text}</div>
    </div>
  );
};
export const Flash = ({at, len = 10, color = '#ffffff', peak = 0.85}) => {
  const f = useCurrentFrame(); const u = (f - at) / len; if (u < 0 || u > 1) return null;
  return <AbsoluteFill style={{background: color, opacity: peak * Math.sin(Math.PI * u), pointerEvents: 'none'}} />;
};
export const Vignette = () => <AbsoluteFill style={{background: 'radial-gradient(130% 95% at 50% 45%, rgba(0,0,0,0) 58%, rgba(5,3,15,0.55) 100%)', pointerEvents: 'none'}} />;
export const Mark = () => <div style={{position: 'absolute', top: 1560, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 28, letterSpacing: 5, color: 'rgba(244,241,234,0.5)'}}>IA · @ia.unfolds</div>;

/** shot list helper: shots [{from (frame), render: (f, t, lf) => JSX}] - hard cuts, one active at a time */
export const Shots = ({shots, f}) => {
  let k = 0; shots.forEach((s, i) => { if (f >= s.from) k = i; });
  const s = shots[k]; const end = shots[k + 1] ? shots[k + 1].from : s.from + 600;
  return s.render(f, f / FPS, f - s.from, (f - s.from) / Math.max(1, end - s.from));
};

/** frame of the k-th word (in line li) that starts with prefix */
export const wordF = (vo, li, prefix) => { const w = vo.words.find((w) => w[4] === li && w[0].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(prefix.toLowerCase())); return w ? Math.round(w[1] * FPS) : Math.round(vo.lines[li].s * FPS); };
export const lineF = (vo, li) => Math.round(vo.lines[li].s * FPS);
/** smooth camera glide between two framings over [a, b] */
export const glide = (f, a, b, A, B) => { const u = clamp((f - a) / Math.max(1, b - a)); const t = 0.4 * u + 0.6 * sstep(u); // never comes to a full stop inside a shot
  return {pos: lerp3(A.pos, B.pos, t), look: lerp3(A.look, B.look, t), fov: A.fov + (B.fov - A.fov) * t}; };
/** medium framing on a character standing at (x, z) with height h, camera d metres away (side offset sx) */
export const med = (x, z, h, d = 3.0, sx = 0, fov = 40) => ({pos: [x + sx, h * 0.66, z + d], look: [x, h * 0.52, z], fov});
/** slow push: same framing, d shrinks by k (creeping hold, never static) */
export const push = (A, k = 0.12) => ({pos: lerp3(A.pos, A.look, k), look: A.look, fov: A.fov - 1.5});
/** diagram camera (space diagrams: subject centred at y ~1.6, presenter card bottom corner) */
export const DG = {pos: [0, 1.2, 9.5], look: [0, 1.6, 0], fov: 44};

/** group framing used by the end-question shot of every episode (characters between the question card and the captions) */
export const GROUP = {pos: [0, 1.3, 7.0], look: [0, 0.55, 0], fov: 36};

export const lerpCol = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t)).getHexString();
