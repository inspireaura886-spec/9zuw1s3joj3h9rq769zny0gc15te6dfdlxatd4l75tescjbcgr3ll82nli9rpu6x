import * as THREE from 'three';
import {useMemo} from 'react';
import {Terrain, makeHeight, Building, Smoke, Glow, rng, smoothstep, fbm, clamp01, softTexture, Person} from '../../kit/index.js';

// Flannan Isles (Eilean Mor) diorama: cliff-walled island at the origin, sea at y=0, lighthouse near the summit,
// keeper's house + walled compound, a track down to the west landing (south-west inlet).
export const SEA_Y = 0;
const ANG_L = Math.atan2(-0.62, 0.78); // direction of the west landing inlet (towards -x,+z)
export const islandR = (x, z) => {
  const a = Math.atan2(x, z);
  let R = 19 + 2.6 * fbm(Math.cos(a) * 1.6 + 3, Math.sin(a) * 1.6 + 7, 5, 3);
  let d = Math.abs(a - ANG_L); d = Math.min(d, Math.PI * 2 - d);
  R -= 4.5 * Math.exp(-((d / 0.13) ** 2)); // the geo (inlet) of the west landing
  return R;
};
export const height = makeHeight({seed: 1900, amp: 1.1, freq: 0.09, shape: (x, z, h) => {
  const r = Math.hypot(x, z); const R = islandR(x, z);
  const top = 8.5 + 3.4 * Math.exp(-(((x - 0.5) ** 2 + (z + 3) ** 2) / 120)) + h;
  const e = smoothstep(R - 2.2, R + 0.6, r);
  const ledge = 0.9 * Math.exp(-(((r - R + 1.2) / 0.5) ** 2)); // rocky ledge mid-cliff
  return top * (1 - e) + (-3.5) * e + ledge * (1 - e) * 0;
}});
export const LH = {x: 0.5, z: -3}; // lighthouse
export const lhY = () => height(LH.x, LH.z);
export const LANDING = (() => { const R = islandR(Math.sin(ANG_L) * 10, Math.cos(ANG_L) * 10); return {x: Math.sin(ANG_L) * (R + 1.5), z: Math.cos(ANG_L) * (R + 1.5), a: ANG_L}; })();

const colorFn = (h, x, z) => {
  const r = Math.hypot(x, z); const R = islandR(x, z);
  if (r > R - 1.2 || h < 6.5) {
    const band = Math.floor((h + 4) / 1.3) % 3;
    return h < 0.6 ? '#2d3036' : ['#5a5049', '#6d625a', '#4b4540'][band];
  }
  return fbm(x * 0.3, z * 0.3, 4, 2) > 0.1 ? '#7fae4a' : '#5f9a3c';
};

// the old railway from the lighthouse down to the west landing (curving), as a list of points on the ground
export const trackPts = (() => {
  const pts = []; const A = [LH.x - 1.5, LH.z + 1.5], B = [LANDING.x * 0.78, LANDING.z * 0.78];
  for (let i = 0; i <= 24; i++) { const t = i / 24; const x = A[0] + (B[0] - A[0]) * t - Math.sin(t * Math.PI) * 4.5, z = A[1] + (B[1] - A[1]) * t + Math.sin(t * Math.PI) * 1.2; pts.push([x, height(x, z) + 0.12, z]); }
  return pts;
})();
const Track = ({color = '#9a968c'}) => {
  const geo = useMemo(() => {
    const v = []; const w = 0.55;
    for (let i = 0; i < trackPts.length - 1; i++) {
      const a = trackPts[i], b = trackPts[i + 1]; const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1; const nx = -dz / L * w, nz = dx / L * w;
      v.push(a[0] - nx, a[1], a[2] - nz, b[0] - nx, b[1], b[2] - nz, a[0] + nx, a[1], a[2] + nz, a[0] + nx, a[1], a[2] + nz, b[0] - nx, b[1], b[2] - nz, b[0] + nx, b[1], b[2] + nz);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  }, []);
  return <mesh geometry={geo}><meshLambertMaterial color={color} flatShading side={THREE.DoubleSide} /></mesh>;
};

// ---------- the lighthouse ----------
const beamMat = (o) => ({transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false});
/** beam 0..1 brightness, ang = beam heading (radians). lantern = glass glow 0..1. */
export const Lighthouse = ({position, frame = 0, beam = 1, ang = 0, lantern = 1, scale = 1}) => {
  const lampCol = new THREE.Color('#2a3348').lerp(new THREE.Color('#fff1b0'), clamp01(lantern));
  return <group position={position} scale={scale}>
    <mesh position={[0, 2.6, 0]}><cylinderGeometry args={[0.78, 1.05, 5.2, 10]} /><meshLambertMaterial color="#f4f1ea" flatShading /></mesh>
    <mesh position={[0, 5.25, 0]}><cylinderGeometry args={[1.12, 1.0, 0.22, 12]} /><meshLambertMaterial color="#c99a3a" flatShading /></mesh>
    {Array.from({length: 12}, (_, i) => <mesh key={i} position={[Math.sin(i / 12 * 6.283) * 1.08, 5.62, Math.cos(i / 12 * 6.283) * 1.08]}><boxGeometry args={[0.05, 0.55, 0.05]} /><meshLambertMaterial color="#20242c" /></mesh>)}
    <mesh position={[0, 5.9, 0]}><torusGeometry args={[1.08, 0.04, 4, 16]} /><meshLambertMaterial color="#20242c" /></mesh>
    <mesh position={[0, 5.95, 0]}><cylinderGeometry args={[0.72, 0.72, 1.15, 10]} /><meshBasicMaterial color={lampCol} /></mesh>
    {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.sin(i * 1.2566) * 0.73, 5.95, Math.cos(i * 1.2566) * 0.73]}><boxGeometry args={[0.07, 1.15, 0.07]} /><meshLambertMaterial color="#1a1d24" /></mesh>)}
    <mesh position={[0, 6.8, 0]}><coneGeometry args={[0.85, 0.65, 10]} /><meshLambertMaterial color="#1c1f26" flatShading /></mesh>
    <mesh position={[0, 7.2, 0]}><sphereGeometry args={[0.12, 6, 4]} /><meshLambertMaterial color="#1c1f26" /></mesh>
    {lantern > 0.05 && <Glow position={[0, 5.95, 0]} size={7 * lantern} color="#ffd36a" opacity={0.85 * lantern} />}
    {beam > 0.01 && [0, Math.PI].map((o, i) => <group key={i} position={[0, 5.95, 0]} rotation={[0, ang + o, 0]}>
      <mesh position={[0, 0, 16]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[3.2, 32, 14, 1, true]} /><meshBasicMaterial color="#fff2c0" {...beamMat(0.2 * beam)} /></mesh>
      <mesh position={[0, 0, 9]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[1.0, 18, 10, 1, true]} /><meshBasicMaterial color="#fffbe6" {...beamMat(0.3 * beam)} /></mesh>
    </group>)}
  </group>;
};

/** Low stone wall rectangle around the station with a closed (or open) gate on the +z side. */
const Compound = ({x, z, y, w = 9, d = 7.5, gateOpen = 0}) => {
  const segs = [[0, -d / 2, w, 0], [-w / 2, 0, d, Math.PI / 2], [w / 2, 0, d, Math.PI / 2], [-w / 2 + (w / 2 - 0.9) / 2, d / 2, w / 2 - 0.9, 0], [w / 2 - (w / 2 - 0.9) / 2, d / 2, w / 2 - 0.9, 0]];
  return <group position={[x, y, z]}>
    {segs.map(([sx, sz, L, r], i) => <mesh key={i} position={[sx, 0.45, sz]} rotation={[0, r, 0]}><boxGeometry args={[L, 0.9, 0.35]} /><meshLambertMaterial color="#d9d4c8" flatShading /></mesh>)}
    {[-0.9, 0.9].map((gx, i) => <mesh key={'p' + i} position={[gx, 0.65, d / 2]}><boxGeometry args={[0.4, 1.3, 0.4]} /><meshLambertMaterial color="#cfc9bc" flatShading /></mesh>)}
    {[-1, 1].map((s, i) => <group key={'g' + i} position={[s * 0.7, 0.5, d / 2]} rotation={[0, s * -gateOpen * 1.4, 0]}>
      <mesh position={[-s * 0.35, 0, 0]}><boxGeometry args={[0.7, 0.8, 0.07]} /><meshLambertMaterial color="#2b3b52" /></mesh></group>)}
  </group>;
};

// ---------- stormy sea ----------
export const Sea = ({frame = 0, color = '#2f63a8', amp = 0.55, size = 360, seg = 72, y = SEA_Y, spec = '#8fb0e0'}) => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2); return g.toNonIndexed(); }, [size, seg]);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const yy = Math.sin(x * 0.18 + frame * 0.09) * amp + Math.sin(z * 0.23 - frame * 0.07 + x * 0.05) * amp * 0.7 + Math.sin((x + z) * 0.5 + frame * 0.15) * amp * 0.25;
    p.setY(i, yy);
  }
  p.needsUpdate = true; geo.computeVertexNormals();
  return <mesh geometry={geo} position={[0, y, 0]}><meshPhongMaterial color={color} flatShading shininess={40} specular={spec} /></mesh>;
};
/** whitecaps: soft white sprites blinking on the sea; spray: bursts against the cliff foot. */
export const Whitecaps = ({frame = 0, count = 70, area = 120, seed = 3, opacity = 0.7, center = [0, 0]}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * area, z: (r() - 0.5) * area, ph: r(), s: 1 + r() * 2})); }, [count, area, seed]);
  return <group>{ps.map((q, i) => { const c = (q.ph + frame * 0.012) % 1; if (Math.hypot(q.x + center[0], q.z + center[1]) < 20) return null;
    return <sprite key={i} position={[q.x + center[0], 0.5, q.z + center[1]]} scale={[q.s * (1 + c), q.s * 0.35 * (1 + c), 1]}><spriteMaterial map={softTexture()} color="#f2f8ff" transparent opacity={opacity * Math.sin(Math.PI * c)} depthWrite={false} /></sprite>; })}</group>;
};
export const coastPts = (n = 40, off = 0.6) => Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2; const R = islandR(Math.sin(a) * 10, Math.cos(a) * 10) + off; return [Math.sin(a) * R, Math.cos(a) * R]; });
const COAST = coastPts(36);
export const Spray = ({frame = 0, pts = COAST, height = 4, size = 2.4, opacity = 0.75, period = 70}) => <group>{pts.map(([x, z], i) => {
  const c = ((frame + i * 23) % period) / period; const up = Math.sin(Math.PI * Math.min(1, c * 1.4));
  return <group key={i}>{[0, 1, 2].map((k) => <sprite key={k} position={[x * (1 + k * 0.01), 0.3 + up * height * (0.5 + k * 0.3), z * (1 + k * 0.01)]} scale={[size * (0.6 + c), size * (0.6 + c), 1]}>
    <spriteMaterial map={softTexture()} color="#ffffff" transparent opacity={opacity * up * (1 - k * 0.25)} depthWrite={false} /></sprite>)}</group>;
})}</group>;

/** slanted wind-driven rain + horizontal wind streaks around a centre */
export const Storm = ({frame = 0, center = [0, 0, 0], area = 50, rain = 1, wind = 1, count = 260, slant = 0.35, seed = 11}) => {
  const ds = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * area, y: r() * 22, z: (r() - 0.5) * area, ph: r()})); }, [count, area, seed]);
  const ws = useMemo(() => { const r = rng(seed + 5); return Array.from({length: 40}, () => ({y: 1 + r() * 14, z: (r() - 0.5) * area, ph: r(), L: 2 + r() * 4})); }, [area, seed]);
  return <group position={center}>
    {rain > 0 && ds.map((q, i) => { const fall = (q.ph * 22 + frame * 0.95) % 22; const y = 22 - fall; const x = q.x + fall * slant;
      return <mesh key={i} position={[((x + area / 2) % area + area) % area - area / 2, y, q.z]} rotation={[0, 0, slant]}><boxGeometry args={[0.04, 1.2, 0.04]} /><meshBasicMaterial color="#d6e4ff" transparent opacity={0.55 * rain} /></mesh>; })}
    {wind > 0 && ws.map((q, i) => { const c = (q.ph + frame * 0.03) % 1;
      return <mesh key={'w' + i} position={[-area / 2 + c * area, q.y, q.z]}><boxGeometry args={[q.L, 0.035, 0.035]} /><meshBasicMaterial color="#eef4ff" transparent opacity={0.45 * wind * Math.sin(Math.PI * c)} /></mesh>; })}
  </group>;
};

// ---------- ships ----------
/** NLB tender (Hesperus) or a passing steamer. pitch/roll from frame; lit portholes at night. */
export const Ship = ({position = [0, 0, 0], rotation = 0, frame = 0, hull = '#1e2634', band = '#b8342c', funnel = '#d8b04a', lit = 0, scale = 1, rough = 1, smoke = true}) => {
  const pitch = Math.sin(frame * 0.08) * 0.07 * rough, roll = Math.sin(frame * 0.06 + 1) * 0.09 * rough, heave = Math.sin(frame * 0.09) * 0.25 * rough;
  return <group position={[position[0], position[1] + heave, position[2]]} rotation={[0, rotation, 0]} scale={scale}>
    <group rotation={[pitch, 0, roll]}>
      <mesh position={[0, 0.55, 0]}><boxGeometry args={[1.8, 1.3, 7]} /><meshLambertMaterial color={hull} flatShading /></mesh>
      <mesh position={[0, 0.55, 4.0]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[1.27, 1, 0.92]}><coneGeometry args={[1.0, 1.6, 4]} /><meshLambertMaterial color={hull} flatShading /></mesh>
      <mesh position={[0, 1.12, 0]}><boxGeometry args={[1.84, 0.16, 7.02]} /><meshLambertMaterial color={band} /></mesh>
      <mesh position={[0, 1.65, -0.6]}><boxGeometry args={[1.3, 0.9, 2.4]} /><meshLambertMaterial color="#efe9dc" flatShading /></mesh>
      <mesh position={[0, 2.6, -0.3]}><cylinderGeometry args={[0.32, 0.36, 1.4, 8]} /><meshLambertMaterial color={funnel} flatShading /></mesh>
      <mesh position={[0, 3.35, -0.3]}><cylinderGeometry args={[0.34, 0.34, 0.25, 8]} /><meshLambertMaterial color="#141414" /></mesh>
      {[2.2, -2.8].map((z, i) => <mesh key={i} position={[0, 2.7, z]}><cylinderGeometry args={[0.05, 0.07, 3.2, 5]} /><meshLambertMaterial color="#3a2e24" /></mesh>)}
      {[-0.66, 0.66].map((x) => [-1.4, -0.6, 0.2].map((z, k) => <mesh key={x + '_' + k} position={[x * 1.0, 1.65, z - 0.6]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}><circleGeometry args={[0.13, 8]} />
        {lit > 0 ? <meshBasicMaterial color="#ffd36a" /> : <meshLambertMaterial color="#26303e" />}</mesh>))}
      {lit > 0 && <Glow position={[0, 4.2, 2.2]} size={1.6} color="#ff4a3a" opacity={0.9 * (0.6 + 0.4 * Math.sin(frame * 0.3))} />}
      {smoke && <Smoke position={[0, 3.4, -0.3]} frame={frame * 2} count={10} height={5} color="#8b93a3" opacity={0.5} wind={[0, 0, -1.2]} size={1.4} />}
    </group>
  </group>;
};

/** keeper looks: Ducat (principal), Marshall (oilskins), McArthur (shirt sleeves), Moore (relief keeper) */
export const KEEPERS = {
  ducat: {skin: '#e0b48e', shirt: '#3a4150', pants: '#22262e', hair: '#5a4a3a', pattern: 'plain'},
  marshall: {skin: '#d9a984', shirt: '#d4a62a', pants: '#2a2a2a', hair: '#2a1d16', pattern: 'plain'},
  mcarthur: {skin: '#e6b892', shirt: '#f2efe6', pants: '#2b3a5a', hair: '#7a3d1e', pattern: 'stripe'},
  moore: {skin: '#dcae88', shirt: '#2d4f7a', pants: '#2a2e38', hair: '#1b1310', pattern: 'check'},
};

/** whole island. lantern/beam for the light; gateOpen; tint multiplies terrain colours (night blue / dawn grey). */
export const Island = ({frame = 0, beam = 0, ang = 0, lantern = 0, tint = '#ffffff', lit = 0, gateOpen = 0, house = true}) => {
  const y = lhY();
  return <group>
    <Terrain height={height} size={64} seg={92} colorFn={colorFn} tint={tint} center={[0, 0]} jitter={0.28} />
    <Track />
    <Lighthouse position={[LH.x, y - 0.1, LH.z]} frame={frame} beam={beam} ang={ang} lantern={lantern} />
    {house && <Building position={[LH.x + 3.3, height(LH.x + 3.3, LH.z + 0.3) - 0.15, LH.z + 0.3]} w={4.4} d={3} h={2.0} roof={1.0} color="#f2efe6" roofColor="#3c4250" lit={lit} litSeed={4} frame={frame} />}
    {house && <Compound x={LH.x + 1.6} z={LH.z + 0.6} y={height(LH.x + 1.6, LH.z + 4) - 0.2} gateOpen={gateOpen} />}
    {/* west landing crane + railings at the inlet */}
    <group position={[LANDING.x * 0.86, 2.2, LANDING.z * 0.86]} rotation={[0, LANDING.a, 0]}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[2.4, 0.3, 1.6]} /><meshLambertMaterial color="#9a958a" /></mesh>
      <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.15, 2.6, 0.15]} /><meshLambertMaterial color="#3a3f48" /></mesh>
    </group>
  </group>;
};
