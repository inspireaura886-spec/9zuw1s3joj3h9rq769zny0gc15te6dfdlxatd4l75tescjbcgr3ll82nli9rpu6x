import {pal} from '../palette.js';
// NOIR KIT (2026-10-30): shadow / silhouette look for IA Shorts. Remotion + three.js, every value a pure function of the frame.
// Black rim-lit silhouettes, sodium-amber + cold-blue volumetric light, fog walls, rain, venetian-blind light sheets,
// swinging bulbs, headlight sweeps, city blocks whose windows go dark. Re-uses lowpoly/kit (LightCone, FogLayer, Particles, Post).
import * as THREE from 'three';
import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {rng, hash2, clamp01} from '../lowpoly/kit/noise.js';
import {softTexture} from '../lowpoly/kit/Sky.jsx';
import {LightCone} from '../lowpoly/kit/Light.jsx';

export const NOIR = {ink: '#050608', steel: '#141a22', wall: '#1a1f27', fog: '#28313d', amber: '#ffcf8a', sodium: '#ffb35c', cold: '#9cc0ff', red: '#d8402e', white: '#f2efe8'};

/** deterministic flicker 0..1 (1 = full on). rate = changes per frame; dropout = chance of a dark frame-run. */
export const flicker = (frame, seed = 1, depth = 0.25, dropout = 0) => {
  const a = hash2(Math.floor(frame / 2), seed, 7); const b = hash2(Math.floor(frame / 5), seed, 11);
  let v = 1 - depth * a * (0.5 + 0.5 * b);
  if (dropout && hash2(Math.floor(frame / 3), seed, 13) < dropout) v *= 0.12;
  return v;
};

/** One noir shot: dark CSS backdrop + ThreeCanvas (exp fog, faint cold ambient) + DOM overlay. Gate weave of 1-2 px like a projector. */
export const NoirStage = ({children, overlay, fogColor = NOIR.fog, density = 0.035, bg, weave = 1.2, shadows = false, ambient = 0.14}) => {
  const {width, height} = useVideoConfig(); const f = useCurrentFrame();
  const wx = (hash2(f, 3, 1) - 0.5) * weave, wy = (hash2(f, 5, 2) - 0.5) * weave;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${wx}px, ${wy}px) scale(1.004)`}}>
        <AbsoluteFill style={{background: bg || 'radial-gradient(ellipse at 50% 32%, #2b3442 0%, #10141b 55%, #040506 100%)'}} />
        <ThreeCanvas flat shadows={shadows} width={width} height={height} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: 45, position: [0, 2, 10]}}>
          <fogExp2 attach="fog" args={[fogColor, density]} />
          <ambientLight intensity={ambient} color="#8fa6c8" />
          <hemisphereLight args={['#4a5a74', '#030405', 0.22]} />
          {children}
        </ThreeCanvas>
      </AbsoluteFill>
      {overlay}
    </AbsoluteFill>
  );
};

// ---------- rim-lit silhouette material (black body, fresnel rim that blooms) ----------
const rimVS = `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const rimFS = `uniform vec3 uBody; uniform vec3 uRim; uniform float uRimK; uniform vec3 uSide; varying vec3 vN; varying vec3 vV;
void main(){ float fr = pow(1.0 - clamp(abs(dot(vN, vV)), 0.0, 1.0), 4.0); float side = 0.45 + 0.55 * clamp(dot(vN, normalize(uSide)), 0.0, 1.0);
  gl_FragColor = vec4(uBody + uRim * fr * uRimK * side, 1.0); }`;
const rimMatCache = new Map();
export const rimMat = (rim = NOIR.cold, k = 1.4, body = '#030304', side = [0.3, 0.6, -1]) => {
  const key = [rim, k, body, side.join(',')].join('|');
  if (!rimMatCache.has(key)) rimMatCache.set(key, new THREE.ShaderMaterial({vertexShader: rimVS, fragmentShader: rimFS,
    uniforms: {uBody: {value: new THREE.Color(body)}, uRim: {value: new THREE.Color(rim)}, uRimK: {value: k}, uSide: {value: new THREE.Vector3(...side)}}}));
  return rimMatCache.get(key);
};
const Cap = ({r, l, p, rot = [0, 0, 0], m, s}) => <mesh position={p} rotation={rot} material={m} scale={s}><capsuleGeometry args={[r, l, 4, 10]} /></mesh>;

/**
 * Noir figure: long coat, fedora (hat), rounded head; black body + rim light. pose 'walk' | 'stand' | 'turn' | 'raise' (arm points/raises lantern).
 * <Silhouette position={[0,0,-6]} rotation={0} pose="walk" phase={f*0.18} rim={NOIR.cold} rimK={1.6} />
 * skirt=true gives a dress/cape figure; hat=false bare head; scale 1 = 1.85 m tall.
 */
export const Silhouette = ({position = [0, 0, 0], rotation = 0, pose = 'stand', phase = 0, scale = 1, rim = NOIR.cold, rimK = 1.5, hat = true, skirt = false, rimSide = [0.2, 0.5, -1], actT = 1, shadow = true}) => {
  const m = rimMat(rim, rimK, '#030304', rimSide);
  let lL = 0, rL = 0, lA = 0.06, rA = -0.06, bob = 0, lean = 0, head = 0, rAx = 0;
  if (pose === 'walk') { const s = Math.sin(phase); lL = s * 0.5; rL = -s * 0.5; lA = -s * 0.35; rA = s * 0.35; bob = Math.abs(Math.cos(phase)) * 0.045; lean = 0.05; }
  if (pose === 'stand') { lA = 0.05 + Math.sin(phase * 0.5) * 0.02; rA = -lA; bob = Math.sin(phase * 0.6) * 0.008; head = Math.sin(phase * 0.23) * 0.15; }
  if (pose === 'turn') { head = 0.9 * clamp01(actT); }
  if (pose === 'raise') { rA = -2.4 * clamp01(actT); rAx = 0.2; }
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotation, 0]} scale={scale}>
      {shadow && <mesh position={[0, 0.015 - bob, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.0, 0.7, 1]}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={softTexture()} color="#000" transparent opacity={0.55} depthWrite={false} /></mesh>}
      <group rotation={[lean, 0, 0]}>
        {[[-0.1, lL], [0.1, rL]].map(([x, a], i) => <group key={i} position={[x, 0.86, 0]} rotation={[a, 0, 0]}><Cap r={0.075} l={0.66} p={[0, -0.42, 0]} m={m} /><mesh position={[0, -0.82, 0.06]} material={m}><boxGeometry args={[0.13, 0.08, 0.26]} /></mesh></group>)}
        <mesh position={[0, skirt ? 0.78 : 1.0, 0]} material={m}><cylinderGeometry args={[0.2, skirt ? 0.42 : 0.31, skirt ? 1.05 : 0.78, 14, 1]} /></mesh>
        <Cap r={0.19} l={0.32} p={[0, 1.36, 0]} m={m} s={[1.25, 1, 0.8]} />
        <Cap r={0.06} l={0.05} p={[0, 1.6, 0]} m={m} />
        {[[-0.27, lA, 0], [0.27, rA, rAx]].map(([x, a, ax], i) => <group key={i} position={[x, 1.5, 0]} rotation={[a, 0, (i ? -1 : 1) * (0.08 + ax)]}><Cap r={0.065} l={0.5} p={[0, -0.32, 0]} m={m} /></group>)}
        <group position={[0, 1.7, 0]} rotation={[0, head, 0]}>
          <mesh material={m} position={[0, 0, 0]} scale={[0.95, 1.1, 1]}><sphereGeometry args={[0.12, 16, 12]} /></mesh>
          {hat && <><mesh material={m} position={[0, 0.08, 0]}><cylinderGeometry args={[0.24, 0.24, 0.02, 24]} /></mesh>
            <mesh material={m} position={[0, 0.15, 0]}><cylinderGeometry args={[0.115, 0.135, 0.13, 18]} /></mesh></>}
        </group>
      </group>
    </group>
  );
};

/** Additive soft light pool on the ground (fake bounce of a lamp/headlight). */
export const LightPool = ({position = [0, 0.02, 0], radius = 3, color = NOIR.sodium, opacity = 0.5, stretch = 1}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[radius * 2 * stretch, radius * 2, 1]} renderOrder={2}>
    <planeGeometry args={[1, 1]} /><meshBasicMaterial map={softTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} />
  </mesh>
);
const GlowS = ({p, s, c, o}) => <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={softTexture()} color={c} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} /></sprite>;

/**
 * Street lamp: pole + arm + hood, volumetric cone down, glow, ground pool, optional real spot light (light=true, 1 per shot is plenty).
 * <Streetlamp position={[-3,0,-8]} height={5.2} frame={f} flick={0.2} dropout={0.1} seed={2} />
 */
export const Streetlamp = ({position = [0, 0, 0], height = 5.2, color = NOIR.sodium, frame = 0, flick = 0.12, dropout = 0, seed = 1, armDir = 1, cone = 0.42, light = false, on = 1}) => {
  const k = flicker(frame, seed, flick, dropout) * on;
  const head = [armDir * 0.9, height, 0];
  const tgt = useMemo(() => new THREE.Object3D(), []);
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}><cylinderGeometry args={[0.06, 0.1, height, 8]} /><meshStandardMaterial color="#0b0c0e" roughness={0.6} /></mesh>
      <mesh position={[armDir * 0.45, height + 0.05, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.95, 6]} /><meshStandardMaterial color="#0b0c0e" /></mesh>
      <mesh position={[head[0], height - 0.05, 0]}><coneGeometry args={[0.32, 0.26, 12, 1, true]} /><meshStandardMaterial color="#0e0f12" side={THREE.DoubleSide} /></mesh>
      <mesh position={[head[0], height - 0.16, 0]}><sphereGeometry args={[0.11, 10, 8]} /><meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.25 + 0.75 * k} /></mesh>
      <LightCone position={[head[0], height - 0.12, 0]} dir={[0, -1, 0]} length={height} radius={height * 0.48} color={color} opacity={cone * k} frame={frame} noise={0.35} />
      <GlowS p={[head[0], height - 0.2, 0]} s={1.6} c={color} o={0.85 * k} />
      <LightPool position={[head[0], 0.03, 0]} radius={height * 0.55} color={color} opacity={0.42 * k} />
      {light && <><primitive object={tgt} position={[head[0], 0, 0]} /><spotLight position={head} target={tgt} angle={0.7} penumbra={0.7} intensity={6 * k} distance={height * 3} decay={1.2} color={color} /></>}
    </group>
  );
};

const sheetVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const sheetFS = `uniform vec3 uColor; uniform float uOp; uniform float uT; varying vec2 vUv;
void main(){ float along = (1.0 - vUv.y); float side = sin(3.14159*vUv.x); float n = 0.75 + 0.25*sin(vUv.x*31.0 + uT*0.07)*sin(vUv.y*9.0 - uT*0.05);
  float a = uOp * pow(along, 1.4) * side * n * smoothstep(0.0, 0.04, vUv.y); gl_FragColor = vec4(uColor*a, a); }`;
let _stripe = null;
const stripeTex = () => { if (_stripe) return _stripe; const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const g = cv.getContext('2d');
  for (let y = 0; y < 256; y++) { const s = Math.sin((y / 256) * Math.PI * 2 * 9); const a = clamp01(s * 1.6 + 0.2); const e = Math.sin(Math.PI * y / 256);
    for (let x = 0; x < 64; x++) { const ex = Math.sin(Math.PI * x / 64); g.fillStyle = `rgba(255,255,255,${(a * ex * e).toFixed(3)})`; g.fillRect(x, y, 1, 1); } }
  _stripe = new THREE.CanvasTexture(cv); return _stripe; };
/**
 * Venetian-blind window: frame + slats + glowing pane; light sheets pour through the gaps along `dir` and paint a striped pool on the floor (y=0).
 * Window is in the local XY plane at `position` (facing +z by default; rotate the group to put it on a side wall).
 * <Blinds position={[-4,2.2,-2]} rotation={[0,Math.PI/2,0]} width={2} height={2.2} dir={[0.9,-0.55,0.35]} frame={f} />
 */
export const Blinds = ({position = [0, 2, 0], rotation = [0, 0, 0], width = 2, height = 2.2, slats = 9, dir = [0, -0.5, 1], length = 7, color = '#ffe2b0', opacity = 0.5, frame = 0, flick = 0.06, seed = 3, floorY = 0, open = 0.55}) => {
  const k = flicker(frame, seed, flick);
  const D = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir[0], dir[1], dir[2]]);
  const sheets = useMemo(() => {
    const out = []; const gap = height / slats;
    for (let i = 0; i < slats; i++) {
      const y0 = -height / 2 + (i + 0.5) * gap; const hh = gap * open * 0.5;
      // parallelogram: window segment (x -w/2..w/2 at y0) swept along D*length, thickness = slat gap
      const g = new THREE.BufferGeometry(); const L = length; const P = [];
      for (const [yy] of [[y0 - hh], [y0 + hh]]) P.push([-width / 2, yy, 0], [width / 2, yy, 0], [-width / 2 + D.x * L, yy + D.y * L, D.z * L], [width / 2 + D.x * L, yy + D.y * L, D.z * L]);
      // two crossing faces: one at the mid line (main) facing camera-ish, plus a vertical "edge" sheet
      const mid = (a, b) => a.map((v, j) => (v + b[j]) / 2);
      const q = [mid(P[0], P[4]), mid(P[1], P[5]), mid(P[2], P[6]), mid(P[3], P[7])];
      const pos = new Float32Array([...q[0], ...q[1], ...q[2], ...q[3]]);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), 2));
      g.setIndex([0, 2, 1, 1, 2, 3]); g.computeVertexNormals(); out.push(g);
    }
    return out;
  }, [width, height, slats, length, open, D]);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: sheetVS, fragmentShader: sheetFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: {uColor: {value: new THREE.Color(color)}, uOp: {value: opacity}, uT: {value: 0}}}), [color]);
  mat.uniforms.uOp.value = opacity * k; mat.uniforms.uT.value = frame;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.06]}><planeGeometry args={[width, height]} /><meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9 * k} /></mesh>
      {Array.from({length: slats + 1}, (_, i) => <mesh key={i} position={[0, -height / 2 + i * height / slats, 0]} rotation={[-0.5, 0, 0]}><boxGeometry args={[width, (height / slats) * (1 - open) + 0.02, 0.01]} /><meshStandardMaterial color="#090a0c" /></mesh>)}
      {[[-width / 2 - 0.06, 0, 0.12, height + 0.24], [width / 2 + 0.06, 0, 0.12, height + 0.24], [0, height / 2 + 0.06, width + 0.24, 0.12], [0, -height / 2 - 0.06, width + 0.24, 0.12]].map(([x, y, w, h], i) =>
        <mesh key={i} position={[x, y, 0.02]}><boxGeometry args={[w, h, 0.12]} /><meshStandardMaterial color="#0c0d10" /></mesh>)}
      {sheets.map((g, i) => <mesh key={i} geometry={g} material={mat} frustumCulled={false} />)}
      <GlowS p={[0, 0, 0.1]} s={Math.max(width, height) * 1.6} c={color} o={0.35 * k} />
    </group>
  );
};
/** Striped floor patch of light from blinds (place it where the sheets land; rotate z to match the window). */
export const BlindsFloor = ({position = [0, 0.02, 0], size = [3, 4], rotation = 0, color = '#ffe2b0', opacity = 0.55, frame = 0, seed = 3, flick = 0.06}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} renderOrder={3}>
    <planeGeometry args={size} /><meshBasicMaterial map={stripeTex()} color={color} transparent opacity={opacity * flicker(frame, seed, flick)} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} />
  </mesh>
);

/**
 * Instanced rain streaks (one draw call) + ground splash rings. Lit look comes from additive blending in front of light.
 * <NoirRain center={[0,0,-8]} area={[16,14,30]} count={700} frame={f} wind={0.08} />
 */
const _o = new THREE.Object3D();
export const NoirRain = ({center = [0, 0, 0], area = [16, 12, 24], count = 600, frame = 0, speed = 0.55, wind = 0.06, color = '#c9d8ff', opacity = 0.32, seed = 21, splashes = 70}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => [r() - 0.5, r(), r() - 0.5, 0.7 + r() * 0.6]); }, [count, seed]);
  const m = useMemo(() => { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.55, 0.012), new THREE.MeshBasicMaterial({color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false}), count); im.frustumCulled = false; return im; }, [count, color, opacity]);
  const H = area[1];
  ps.forEach((p, i) => { const y = H - ((p[1] * H + frame * speed * p[3]) % H); _o.position.set(p[0] * area[0] + wind * (H - y) * 0.6, y, p[2] * area[2]); _o.rotation.set(0, 0, wind * 1.2); _o.scale.set(1, p[3], 1); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix); });
  m.instanceMatrix.needsUpdate = true;
  const sp = useMemo(() => { const r = rng(seed + 9); return Array.from({length: splashes}, () => [r() - 0.5, r() - 0.5, r() * 40, 10 + r() * 8]); }, [splashes, seed]);
  const ring = useMemo(() => { const im = new THREE.InstancedMesh(new THREE.RingGeometry(0.8, 1, 16), new THREE.MeshBasicMaterial({color, transparent: true, opacity: opacity * 1.1, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, toneMapped: false}), splashes); im.frustumCulled = false; return im; }, [splashes, color, opacity]);
  sp.forEach((p, i) => { const t = ((frame + p[2]) % p[3]) / p[3]; _o.position.set(p[0] * area[0], 0.03, p[1] * area[2]); _o.rotation.set(-Math.PI / 2, 0, 0); _o.scale.setScalar(0.02 + t * 0.22); _o.updateMatrix(); ring.setMatrixAt(i, _o.matrix); });
  ring.instanceMatrix.needsUpdate = true;
  return <group position={center}><primitive object={m} /><primitive object={ring} /></group>;
};

/**
 * Row of dark buildings with lit window grids (one InstancedMesh). offAt: frame window lights start dying, `offRate` windows per frame.
 * side: -1 left (facade at x, faces +x; pass x negative), +1 right (facade at x, faces -x), 0 = across the back (facade at z = x, faces +z). zFrom/zTo = street extent (or x extent for side 0).
 */
export const CityRow = ({side = -1, x = 7, zFrom = -40, zTo = 6, seed = 4, frame = 0, offAt = 99999, offRate = 0.4, litFrac = 0.35, color = NOIR.amber, hMin = 6, hMax = 16}) => {
  const blds = useMemo(() => { const r = rng(seed); const out = []; let z = zFrom; while (z < zTo) { const w = 3 + r() * 4; out.push({z: z + w / 2, w, h: hMin + r() * (hMax - hMin), d: 4 + r() * 3}); z += w + 0.15; } return out; }, [seed, zFrom, zTo, hMin, hMax]);
  const wins = useMemo(() => { const r = rng(seed + 3); const out = []; blds.forEach((b) => { const cols = Math.max(2, Math.floor(b.w / 1.1)); const rows = Math.floor((b.h - 1.5) / 1.4);
    for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) if (r() < litFrac) out.push({u: b.z - b.w / 2 + (c + 0.5) * b.w / cols, y: 1.6 + rr * 1.4, o: r(), k: r(), warm: r() < 0.8}); }); return out; }, [blds, seed, litFrac]);
  const im = useMemo(() => { const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.55, 0.8), new THREE.MeshBasicMaterial({color: '#ffffff', toneMapped: false, fog: true}), Math.max(1, wins.length)); m.frustumCulled = false; return m; }, [wins.length]);
  const c = new THREE.Color();
  const dead = Math.max(0, (frame - offAt) * offRate);
  wins.forEach((w, i) => {
    const off = w.k * wins.length < dead ? 1 : 0;
    const flick = 0.75 + 0.25 * hash2(i, Math.floor(frame / 9), 5);
    const v = off ? 0 : flick;
    if (side === 0) _o.position.set(w.u, w.y, x + 0.01); else _o.position.set(x - side * 0.01, w.y, w.u);
    _o.rotation.set(0, side === 0 ? 0 : -side * Math.PI / 2, 0); _o.scale.setScalar(v > 0 ? 1 : 0.0001); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix);
    im.setColorAt(i, c.set(w.warm ? color : NOIR.cold).multiplyScalar(v * (0.55 + 0.45 * w.o)));
  });
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  return <group>
    {blds.map((b, i) => <mesh key={i} position={side === 0 ? [b.z, b.h / 2, x - b.d / 2] : [x + side * b.d / 2, b.h / 2, b.z]}>
      <boxGeometry args={side === 0 ? [b.w, b.h, b.d] : [b.d, b.h, b.w]} /><meshStandardMaterial color="#0d1015" roughness={0.9} /></mesh>)}
    <primitive object={im} />
  </group>;
};

/** Car silhouette with headlight cones + tail glows. x/z can be numbers; heading in rad (0 = facing +x). */
export const NoirCar = ({position = [0, 0, 0], heading = 0, frame = 0, beam = 0.5, color = '#fff2d2', length = 14}) => {
  const fwd = [Math.cos(heading), -0.06, -Math.sin(heading)];
  return (
    <group position={position}>
      <group rotation={[0, heading, 0]}>
        <mesh position={[0, 0.55, 0]}><boxGeometry args={[4.2, 0.7, 1.8]} /><meshStandardMaterial color="#060708" /></mesh>
        <mesh position={[-0.3, 1.05, 0]}><boxGeometry args={[2.2, 0.55, 1.6]} /><meshStandardMaterial color="#060708" /></mesh>
        {[[-1.3, 0.85], [1.3, 0.85], [-1.3, -0.85], [1.3, -0.85]].map(([x, z], i) => <mesh key={i} position={[x, 0.32, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.2, 12]} /><meshStandardMaterial color="#030303" /></mesh>)}
        {[-0.6, 0.6].map((z) => <GlowS key={z} p={[2.15, 0.6, z]} s={0.9} c={color} o={0.95} />)}
        {[-0.65, 0.65].map((z) => <GlowS key={'t' + z} p={[-2.15, 0.65, z]} s={0.55} c={NOIR.red} o={0.9} />)}
      </group>
      {[-0.6, 0.6].map((z) => { const ox = Math.cos(heading) * 2.15 + Math.sin(heading) * z, oz = -Math.sin(heading) * 2.15 + Math.cos(heading) * z;
        return <LightCone key={z} position={[ox, 0.6, oz]} dir={fwd} length={length} radius={2.6} color={color} opacity={beam} frame={frame} glow={false} />; })}
      <LightPool position={[Math.cos(heading) * 7, 0.03, -Math.sin(heading) * 7]} radius={4} stretch={1.6} color={color} opacity={0.3} />
    </group>
  );
};

/** Bare bulb on a cable that swings (amp rad, period frames); cone + glow + real point light follow the swing. dieAt: frame it pops out. */
export const HangingBulb = ({position = [0, 3, 0], cable = 1.2, amp = 0.22, period = 70, frame = 0, color = '#ffd39a', seed = 9, flick = 0.15, dieAt = 99999, coneLen = 3.4, light = true}) => {
  const a = Math.sin((frame / period) * Math.PI * 2) * amp * Math.exp(-frame / 600);
  let k = flicker(frame, seed, flick);
  if (frame >= dieAt) k = frame < dieAt + 6 ? (hash2(frame, seed, 3) > 0.5 ? 1.4 : 0.05) : 0;
  return (
    <group position={position} rotation={[0, 0, a]}>
      <mesh position={[0, -cable / 2, 0]}><cylinderGeometry args={[0.012, 0.012, cable, 4]} /><meshStandardMaterial color="#050505" /></mesh>
      <mesh position={[0, -cable - 0.08, 0]}><sphereGeometry args={[0.09, 12, 10]} /><meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.15 + 0.85 * Math.min(1, k)} /></mesh>
      <GlowS p={[0, -cable - 0.08, 0]} s={0.9} c={color} o={0.7 * k} />
      <LightCone position={[0, -cable - 0.1, 0]} dir={[0, -1, 0]} length={coneLen} radius={coneLen * 0.65} color={color} opacity={0.32 * k} frame={frame} glow={false} />
      {light && <pointLight position={[0, -cable - 0.2, 0]} intensity={3.2 * k} distance={9} decay={1.4} color={color} />}
    </group>
  );
};

/** Backlit fog wall: big drifting additive sprites (the bright mist behind a silhouette). */
export const FogWall = ({position = [0, 2, -20], width = 24, height = 8, count = 14, color = NOIR.cold, opacity = 0.18, frame = 0, seed = 6, speed = 0.01}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => [r() - 0.5, r() - 0.5, r() - 0.5, 0.6 + r() * 0.8, r() * 6]); }, [count, seed]);
  return <group position={position}>{ps.map((p, i) => { const x = ((p[0] + frame * speed * (0.5 + p[3] * 0.5) / width + 0.5) % 1 - 0.5) * width;
    return <sprite key={i} position={[x, p[1] * height * 0.5, p[2] * 3]} scale={[height * p[3] * 1.4, height * p[3] * 0.8, 1]}>
      <spriteMaterial map={softTexture()} color={color} transparent opacity={opacity * (0.75 + 0.25 * Math.sin(frame * 0.02 + p[4]))} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} /></sprite>; })}</group>;
};

/** Wet street: dark glossy ground + kerbs; puddle glints are added with LightPool under lamps. */
export const WetStreet = ({width = 8, length = 70, z = -25, color = '#0a0c10'}) => (
  <group>
    <mesh position={[0, 0, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, length]} /><meshStandardMaterial color={color} roughness={0.35} metalness={0.4} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * (width / 2 + 0.1), 0.08, z]}><boxGeometry args={[0.2, 0.16, length]} /><meshStandardMaterial color="#15181d" /></mesh>)}
  </group>
);

// ---------------- DOM finishing layer ----------------
/**
 * Projector-film finish: heavy grain, vignette, exposure flicker, sparse scratches + dust specks, cold-shadow / warm-light split tone, halation.
 * <NoirFinish /> as the last overlay child. Costs ~0 (CSS).
 */
export const NoirFinish = ({grain = 0.14, vignette = 0.78, flick = 0.06, scratches = true, tone = true, seed = 0}) => {
  const f = useCurrentFrame();
  const ex = flick * hash2(f, 17, seed);
  const r = rng(Math.floor(f / 2) * 13 + seed);
  const lines = scratches ? Array.from({length: 2}, () => ({x: r() * 100, o: r() < 0.3 ? 0.1 + r() * 0.15 : 0, w: 1 + r() * 1.5})) : [];
  const specks = Array.from({length: 6}, () => ({x: r() * 100, y: r() * 100, s: 2 + r() * 6, o: r() < 0.5 ? 0.5 : 0}));
  return (<AbsoluteFill style={{pointerEvents: 'none'}}>
    {tone && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(40,70,120,0.18), rgba(10,20,40,0.10) 60%, rgba(120,70,20,0.10))', mixBlendMode: 'soft-light'}} />}
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,${vignette}) 100%)`}} />
    <AbsoluteFill style={{background: '#000', opacity: ex}} />
    {lines.map((l, i) => l.o > 0 && <div key={i} style={{position: 'absolute', left: `${l.x}%`, top: 0, width: l.w, height: '100%', background: `rgba(230,230,220,${l.o})`}} />)}
    {specks.map((s, i) => s.o > 0 && <div key={'s' + i} style={{position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s * 0.7, borderRadius: '50%', background: `rgba(0,0,0,${s.o})`}} />)}
    <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${(f + seed) % 60}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`}} />
  </AbsoluteFill>);
};

/** Noir title card: white condensed caps + one red accent word, thin rules, typewriter sub-line. Words appear on their frames. */
export const NoirTitle = ({lines = [], y = 260, size = 92, accent, sub, subAt = 0}) => {
  accent = accent || pal().active; // HUMANE 2026-11-03: accent line from the muted palette, never NOIR.red
  const f = useCurrentFrame();
  return (<div style={{position: 'absolute', top: y, left: 0, width: '100%', textAlign: 'center'}}>
    {lines.map((l, i) => { const t = clamp01((f - (l.at || 0)) / 6); if (t <= 0) return null;
      return <div key={i} style={{fontFamily: l.red ? 'DM Serif Display' : 'Lilita One', fontStyle: l.red ? 'italic' : 'normal', fontSize: (l.size || size) * (l.red ? 1.12 : 1), letterSpacing: l.red ? 1 : 4, lineHeight: 1.02, color: l.red ? accent : pal().text, opacity: t,
        transform: `translateY(${(1 - t) * 18}px) scale(${1 + (1 - t) * 0.08})`, textShadow: '0 0 24px rgba(0,0,0,0.9), 0 4px 0 rgba(0,0,0,0.6)'}}>{l.text}</div>; })}
    {sub && f >= subAt && <div style={{marginTop: 18, fontFamily: 'Special Elite', fontSize: 40, color: '#e8e2d2', letterSpacing: 2, textShadow: '0 0 12px #000'}}>{sub.slice(0, Math.max(0, Math.floor((f - subAt) * 1.2)))}</div>}
  </div>);
};

/** Fonts used by the noir/papercut kits (OFL files in public/fonts): Lilita One, DM Serif Display italic, Special Elite (typewriter). */
import {staticFile} from 'remotion';
export const NoirFonts = () => (
  <style>{`
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'DM Serif Display';font-style:italic;src:url('${staticFile('fonts/DMSerifDisplay-Italic.ttf')}') format('truetype');}
  @font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}
  `}</style>
);
