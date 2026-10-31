// Brown Mountain lights diorama (North Carolina, 1910s-1922): autumn ridge terrain + forest, glowing "ghost" lights, steam locomotive on a rail line with river + bridge
// (flood level param), winding road with headlight cars, hotel with porch + rocking chairs, survey camp (tent, fire, brass telescope, map table), brush fire, farm lamp,
// rooftop low-light cameras. Deterministic (no clocks). Ridge is far north (-z), valley at the origin, hotel hill south-west.
import {useMemo} from 'react';
import * as THREE from 'three';
import {Terrain, makeHeight, rng, Glow, Building, Car, LightCone, Particles} from '../../kit/index.js';
import {Bx, Cy} from '../uvb-76/world.jsx';
export {Bx, Cy};

const g = (x, c) => Math.exp(-x * x / (c * c));
export const height = makeHeight({seed: 31, amp: 0.45, freq: 0.06, shape: (x, z, h) => h * 0.4 + 27 * g(z + 62, 15) * (0.72 + 0.28 * Math.sin(x * 0.045 + 1.0)) + 12 * g(z + 92, 22) + 0.004 * Math.pow(Math.max(0, z - 34), 2) + 6 * g(x + 52, 16) * g(z + 15, 30) + 0.5 * Math.sin(x * 0.07) * Math.cos(z * 0.06)});
const AUT = ['#b8561e', '#c9791f', '#9a3a1c', '#8a6a22', '#d49a2a', '#6a5a2a'];
const colorFn = (h, x, z) => { const k = (Math.floor(x * 0.3) + Math.floor(z * 0.3)) & 1; if (h > 20) return k ? '#6a3a24' : '#5a3220'; if (h > 8) return k ? '#9a5a22' : '#8a4e1e'; return k ? '#6a5a2a' : '#5e5026'; };
export const Land = () => <Terrain height={height} size={300} seg={84} colorFn={colorFn} center={[0, -20]} jitter={0.14} />;

/** autumn forest on the slopes, kept out of the valley set */
export const Forest = ({count = 150, seed = 4, frame = 0}) => {
  const P = useMemo(() => { const r = rng(seed); const out = []; let n = 0;
    while (out.length < count && n++ < 4000) { const x = (r() - 0.5) * 200, z = -110 + r() * 170; const h = height(x, z);
      const inValley = Math.abs(x) < 48 && z > -26 && z < 34; if (inValley || h > 31) continue;
      out.push({x, z, h, s: 0.9 + r() * 1.3, c: AUT[Math.floor(r() * AUT.length)], k: r()}); } return out; }, [count, seed]);
  return <group>{P.map((p, i) => <group key={i} position={[p.x, p.h, p.z]} scale={p.s} rotation={[0, 0, Math.sin(frame * 0.03 + i) * 0.008]}>
    <Cy p={[0, 0.7, 0]} a={[0.14, 0.2, 1.4, 5]} c="#4a3626" />
    {p.k > 0.35 ? <><mesh position={[0, 2.0, 0]} scale={[1, 0.9, 1]}><icosahedronGeometry args={[1.25, 0]} /><meshLambertMaterial color={p.c} flatShading /></mesh>
      <mesh position={[0.4, 2.7, 0.2]}><icosahedronGeometry args={[0.8, 0]} /><meshLambertMaterial color={p.c} flatShading /></mesh></>
      : <mesh position={[0, 2.4, 0]}><coneGeometry args={[1.2, 3.2, 6]} /><meshLambertMaterial color="#2a4a32" flatShading /></mesh>}
  </group>)}</group>;
};

/** a floating ghost light: red-orange core + halo. r = core radius */
export const Orb = ({position = [0, 0, 0], r = 0.6, color = '#ff4a30', halo = 9, flare = 0, a = 1}) => <group position={position}>
  <mesh scale={1 + flare * 1.2}><icosahedronGeometry args={[r, 1]} /><meshBasicMaterial color={color} toneMapped={false} fog={false} transparent opacity={a} /></mesh>
  <mesh scale={0.5 + flare * 0.7}><icosahedronGeometry args={[r, 1]} /><meshBasicMaterial color="#fff0d0" toneMapped={false} fog={false} transparent opacity={a} /></mesh>
  <Glow position={[0, 0, 0]} size={halo * (1 + flare * 1.3)} color={color} opacity={0.75 * a} /></group>;
/** ghost lights above the ridge crest; n lights drifting slowly. */
export const RidgeLights = ({frame = 0, n = 3, r = 0.7, halo = 10, t0 = 0, rise = 0, color = '#ff4a30'}) => <group>
  {Array.from({length: n}, (_, i) => { const x = -14 + i * (28 / Math.max(1, n - 1 || 1)) + Math.sin((frame + i * 40) * 0.025) * 2; const y = 33 + i * 1.5 + Math.sin((frame + i * 23) * 0.04) * 1.1 + (i === 0 ? rise : 0);
    return <Orb key={i} position={[n === 1 ? 0 : x, y, -52]} r={r} halo={halo} color={i % 2 ? '#ff8a40' : color} flare={Math.max(0, Math.sin((frame + i * 17 - t0) * 0.07)) > 0.96 ? 0.5 : 0} />; })}</group>;

// ---------- trains, rails, river, bridge ----------
const Wheel = ({p, r = 0.5, spin = 0}) => <group position={p} rotation={[0, 0, Math.PI / 2]}><mesh rotation={[0, spin, 0]}><cylinderGeometry args={[r, r, 0.18, 10]} /><meshLambertMaterial color="#1c1c20" flatShading /></mesh><Bx p={[0, 0, 0]} s={[0.1, 0.2, 0.2]} c="#c8c8c8" /></group>;
/** steam locomotive facing +x (rotation 0). head = headlight beam on */
export const Loco = ({position = [0, 0, 0], rotation = 0, frame = 0, head = true, beam = 16, moving = true, cars = 2}) => { const s = moving ? frame * 0.22 : 0; return <group position={position} rotation={[0, rotation, 0]}>
  <Bx p={[0, 0.7, 0]} s={[5.2, 0.35, 1.7]} c="#2a2a30" />
  <Cy p={[0.7, 1.75, 0]} a={[0.82, 0.82, 3.6, 10]} c="#25262c" r={[0, 0, Math.PI / 2]} />
  <Cy p={[2.55, 1.75, 0]} a={[0.55, 0.82, 0.12, 10]} c="#8a2a1e" r={[0, 0, Math.PI / 2]} />
  <Cy p={[1.9, 2.9, 0]} a={[0.3, 0.2, 1.1, 8]} c="#1a1a1e" /><Cy p={[1.9, 3.5, 0]} a={[0.42, 0.3, 0.18, 8]} c="#1a1a1e" />
  <Cy p={[0.0, 2.55, 0]} a={[0.2, 0.2, 0.5, 8]} c="#c8a84a" />
  <Bx p={[-1.7, 2.2, 0]} s={[1.5, 2.1, 1.7]} c="#7a2a22" /><Bx p={[-1.7, 3.35, 0]} s={[1.8, 0.2, 2.0]} c="#2a2a30" /><Bx p={[-1.7, 2.4, 0.87]} s={[0.7, 0.6, 0.04]} c="#ffd890" e="#ffb050" ei={0.8} />
  <Bx p={[2.8, 0.95, 0]} s={[0.5, 0.5, 1.3]} c="#555a60" r={[0, 0, 0.6]} />
  {[-1.5, -0.3, 0.9, 2.1].map((x, i) => [-0.85, 0.85].map((z) => <Wheel key={i + '_' + z} p={[x, 0.5, z]} r={i === 3 ? 0.4 : 0.55} spin={s + i} />))}
  {head && <><mesh position={[2.9, 1.95, 0]}><sphereGeometry args={[0.3, 8, 6]} /><meshBasicMaterial color="#fff6c8" toneMapped={false} /></mesh><Glow position={[3.1, 1.95, 0]} size={7} color="#fff0b0" opacity={0.9} />
    <LightCone position={[3.0, 1.95, 0]} dir={[1, -0.02, 0]} length={beam} radius={4.2} color="#fff0b8" opacity={0.3} frame={frame} /></>}
  {Array.from({length: cars}, (_, i) => <group key={i} position={[-5.1 - i * 4.4, 0, 0]}><Bx p={[0, 0.7, 0]} s={[4, 0.3, 1.7]} c="#2a2a30" /><Bx p={[0, 1.7, 0]} s={[3.8, 1.7, 1.6]} c={i % 2 ? '#7a4a22' : '#6a3a22'} />{[-1.2, 1.2].map((x) => [-0.85, 0.85].map((z) => <Wheel key={x + '_' + z} p={[x, 0.45, z]} r={0.4} spin={s + 2} />))}</group>)}
</group>; };
export const Track = ({z = 4, from = -120, to = 120, y = 0.32}) => { const n = Math.floor((to - from) / 1.4); const L = to - from; return <group>
  <Bx p={[(from + to) / 2, y - 0.05, z]} s={[L, 0.16, 3.4]} c="#3a3430" />
  {Array.from({length: n}, (_, i) => <Bx key={i} p={[from + i * 1.4, y + 0.06, z]} s={[0.3, 0.08, 2.5]} c="#4a3626" />)}
  {[-0.7, 0.7].map((o) => <Bx key={o} p={[(from + to) / 2, y + 0.14, z + o]} s={[L, 0.08, 0.1]} c="#9aa0a8" />)}</group>; };
/** river running north-south at x, flood 0..1 widens + raises it over the rails; bridge carries the track */
export const River = ({x = 24, z0 = -40, z1 = 70, flood = 0, frame = 0, w = 6}) => { const ww = w + flood * 22; const y = 0.14 + flood * 1.1; const L = z1 - z0;
  return <group>
    <mesh position={[x, y, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[ww, L]} /><meshLambertMaterial color={flood > 0.2 ? '#6a5a3a' : '#3a6a9a'} emissive={flood > 0.2 ? '#2a2010' : '#1a3050'} emissiveIntensity={0.7} flatShading transparent opacity={0.92} /></mesh>
    {Array.from({length: 8}, (_, i) => <Bx key={i} p={[x + Math.sin(i * 2.3) * ww * 0.3, y + 0.06, ((frame * 0.12 + i * 14) % L) + z0]} s={[0.12, 0.05, 2.2 + flood * 2]} c="#e8f4ff" basic o={0.5} />)}</group>; };
export const Bridge = ({x = 24, z = 4, w = 8}) => <group>
  <Bx p={[x, 0.55, z]} s={[w + 2, 0.3, 3.6]} c="#4a4038" />
  {[-w / 2, 0, w / 2].map((o) => <Bx key={o} p={[x + o, -0.2, z]} s={[0.7, 2.2, 3.2]} c="#6a625a" />)}
  {[-1.6, 1.6].map((o) => <Bx key={o} p={[x, 1.1, z + o]} s={[w + 2, 0.12, 0.1]} c="#5a4a3a" />)}</group>;

// ---------- road + cars with headlights ----------
export const Road = ({pts = [[-70, 0, -10], [-30, 0, -14], [0, 0, -9], [30, 0, -15], [70, 0, -10]], w = 3}) => <group>
  {pts.slice(0, -1).map((a, i) => { const b = pts[i + 1]; const dx = b[0] - a[0], dz = b[2] - a[2]; const L = Math.hypot(dx, dz); const ang = -Math.atan2(dz, dx);
    return <group key={i} position={[(a[0] + b[0]) / 2, 0.07, (a[2] + b[2]) / 2]} rotation={[0, ang, 0]}><Bx s={[L + 0.4, 0.08, w]} c="#2c2a2a" /><Bx p={[0, 0.06, 0]} s={[L, 0.02, 0.1]} c="#b8a868" /></group>; })}</group>;
/** point on the road polyline at u 0..1 -> [x, z, heading] */
export const roadAt = (pts, u) => { const n = pts.length - 1; const k = Math.min(n - 1, Math.max(0, Math.floor(u * n))); const t = u * n - k; const a = pts[k], b = pts[k + 1];
  return [a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t, Math.atan2(b[0] - a[0], b[2] - a[2])]; };
/** Model-T-ish car with real headlights (Car faces +z; dir = heading rad) */
export const HeadCar = ({position = [0, 0, 0], rotation = 0, dist = 0, color = '#2a2a2a', beam = 12, on = true, frame = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <Car position={[0, 0, 0]} rotation={0} dist={dist} color={color} cabin="#8a98a8" />
  {on && [-0.55, 0.55].map((x) => <group key={x}><mesh position={[x, 0.85, 1.85]}><sphereGeometry args={[0.2, 6, 5]} /><meshBasicMaterial color="#fff6c8" toneMapped={false} /></mesh><Glow position={[x, 0.85, 2.0]} size={4} color="#fff0b0" opacity={0.9} /></group>)}
  {on && <LightCone position={[0, 0.85, 1.9]} dir={[0, -0.03, 1]} length={beam} radius={3.2} color="#fff0b8" opacity={0.3} frame={frame} />}</group>;

// ---------- hotel with porch (front faces -z, towards the ridge) ----------
export const Hotel = ({position = [0, 0, 0], frame = 0, lit = 1}) => <group position={position}>
  <Building position={[0, 0, 0]} rotation={Math.PI} w={10} d={6} h={3.6} floors={2} roof={1.8} color="#b89a6a" roofColor="#5a3a2a" lit={lit} litSeed={4} frame={frame} />
  <Bx p={[0, 0.3, -5]} s={[10.8, 0.3, 3.8]} c="#7a5a3a" /><Bx p={[0, 3.2, -5]} s={[10.8, 0.2, 3.8]} c="#5a3a2a" />
  {[-5.2, -2.6, 0, 2.6, 5.2].map((x) => <Bx key={x} p={[x, 1.75, -6.7]} s={[0.22, 2.9, 0.22]} c="#d8ccb0" />)}
  <Bx p={[0, 1.0, -6.7]} s={[10.8, 0.1, 0.1]} c="#d8ccb0" /><Bx p={[0, 1.2, -6.7]} s={[10.8, 0.08, 0.08]} c="#d8ccb0" />
  {[-3.4, 0, 3.4].map((x, i) => <group key={x} position={[x, 0.45, -5.6]} rotation={[Math.sin(frame * 0.07 + i * 2) * 0.12, 0, 0]}>
    <Bx p={[0, 0.35, 0]} s={[0.8, 0.1, 0.8]} c="#5a3a22" /><Bx p={[0, 0.8, 0.34]} s={[0.8, 0.9, 0.08]} c="#5a3a22" /><Bx p={[-0.45, 0.55, 0]} s={[0.08, 0.5, 0.8]} c="#4a2e1a" /><Bx p={[0.45, 0.55, 0]} s={[0.08, 0.5, 0.8]} c="#4a2e1a" /></group>)}
  {[-3.4, 3.4].map((x) => <group key={x}><mesh position={[x, 2.3, -6.9]}><sphereGeometry args={[0.16, 6, 5]} /><meshBasicMaterial color="#fff0b0" toneMapped={false} /></mesh><Glow position={[x, 2.3, -6.9]} size={4} opacity={0.9} /></group>)}
  <pointLight position={[0, 2.4, -6.2]} color="#ffc070" intensity={7} distance={14} />
</group>;

// ---------- survey camp ----------
export const Tent = ({position = [0, 0, 0], rotation = 0, glow = 1}) => <group position={position} rotation={[0, rotation, 0]}>
  <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0, 1.9, 2.4, 3, 1]} /><meshLambertMaterial color="#c8b48a" flatShading side={THREE.DoubleSide} /></mesh>
  <Bx p={[0, 0.7, 1.2]} s={[0.04, 1.2, 0.04]} c="#6a4a2a" /><Bx p={[0, 0.5, 0.95]} s={[0.8, 1.0, 0.04]} c="#1a1208" /><Glow position={[0, 0.7, 1.15]} size={3} color="#ffb860" opacity={0.5 * glow} /></group>;
export const Fire = ({position = [0, 0, 0], frame = 0, size = 1}) => { const fl = 0.85 + 0.15 * Math.sin(frame * 0.9) * Math.cos(frame * 0.37); return <group position={position} scale={size}>
  {[0, 1, 2, 3, 4].map((i) => <Bx key={i} p={[Math.cos(i * 1.25) * 0.5, 0.12, Math.sin(i * 1.25) * 0.5]} s={[0.9, 0.16, 0.16]} c="#3a2418" r={[0, i * 1.25, 0.1]} />)}
  <mesh position={[0, 0.5 * fl, 0]} scale={[1, fl * 1.3, 1]}><coneGeometry args={[0.45, 1.1, 6]} /><meshBasicMaterial color="#ff8a1a" toneMapped={false} /></mesh>
  <mesh position={[0, 0.4 * fl, 0]} scale={[1, fl * 1.2, 1]}><coneGeometry args={[0.26, 0.8, 5]} /><meshBasicMaterial color="#ffe070" toneMapped={false} /></mesh>
  <Glow position={[0, 0.7, 0]} size={5 * fl} color="#ff9a30" opacity={0.7} /><pointLight position={[0, 1.0, 0]} color="#ff9a40" intensity={9 * fl} distance={13} />
  <Particles kind="embers" center={[0, 1.2, 0]} area={[1.2, 3.5, 1.2]} count={30} frame={frame} /></group>; };
/** brass survey telescope on a tripod, aimed with pitch (rad) + yaw (rad) */
export const Telescope = ({position = [0, 0, 0], yaw = 0, pitch = 0.4, scale = 1}) => <group position={position} scale={scale} rotation={[0, yaw, 0]}>
  {[0, 2.1, 4.2].map((a, i) => <Cy key={i} p={[Math.cos(a) * 0.45, 0.8, Math.sin(a) * 0.45]} a={[0.04, 0.05, 1.7, 5]} c="#5a3a22" r={[Math.sin(a) * 0.28, 0, -Math.cos(a) * 0.28]} />)}
  <Bx p={[0, 1.65, 0]} s={[0.3, 0.2, 0.3]} c="#caa84a" />
  <group position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2 - pitch]}><Cy p={[0, 0.7, 0]} a={[0.12, 0.16, 1.6, 10]} c="#c89a3a" /><Cy p={[0, 1.55, 0]} a={[0.2, 0.2, 0.14, 10]} c="#8a6a22" /><Cy p={[0, -0.05, 0]} a={[0.1, 0.1, 0.3, 8]} c="#6a4a1a" /></group></group>;
export const MapTable = ({position = [0, 0, 0], rotation = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <Bx p={[0, 0.85, 0]} s={[1.8, 0.1, 1.2]} c="#7a5a3a" />{[[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]].map(([x, z], i) => <Bx key={i} p={[x, 0.4, z]} s={[0.1, 0.8, 0.1]} c="#5a3a22" />)}
  <Bx p={[0, 0.92, 0]} s={[1.5, 0.02, 1.0]} c="#e8dcb8" /><Bx p={[0.1, 0.94, -0.1]} s={[0.9, 0.01, 0.02]} c="#3a2a1a" r={[0, 0.5, 0]} /><Bx p={[-0.2, 0.94, 0.1]} s={[0.7, 0.01, 0.02]} c="#3a2a1a" r={[0, -0.7, 0]} />
  <mesh position={[0.5, 1.15, 0.3]}><sphereGeometry args={[0.13, 6, 5]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh><pointLight position={[0.5, 1.4, 0.3]} color="#ffd890" intensity={3} distance={5} /></group>;

// ---------- brush fire, farm lamp, rooftop cameras ----------
export const BrushFire = ({position = [0, 0, 0], frame = 0, size = 1}) => <group position={position} scale={size}>
  {Array.from({length: 7}, (_, i) => { const fl = 0.7 + 0.3 * Math.sin(frame * 0.5 + i * 2.1); return <mesh key={i} position={[Math.cos(i * 0.9) * 1.8, 0.6 * fl, Math.sin(i * 0.9) * 1.3]} scale={[1, fl * (1 + (i % 3) * 0.3), 1]}><coneGeometry args={[0.55, 1.5, 5]} /><meshBasicMaterial color={i % 2 ? '#ff6a1a' : '#ffa030'} toneMapped={false} /></mesh>; })}
  <Glow position={[0, 1.2, 0]} size={11} color="#ff7a20" opacity={0.65} /><pointLight position={[0, 2, 0]} color="#ff7a30" intensity={10} distance={16} />
  <Particles kind="embers" center={[0, 2, 0]} area={[4, 6, 3]} count={40} frame={frame} /></group>;
export const FarmLamp = ({position = [0, 0, 0]}) => <group position={position}>
  <Building position={[0, 0, 0]} w={4} d={3} h={2.2} roof={1.2} color="#8a7a5a" roofColor="#4a3226" lit={0.8} litSeed={2} glow={0.8} />
  <Cy p={[3.2, 1.6, 0]} a={[0.07, 0.09, 3.2, 6]} c="#4a3a2a" /><Bx p={[3.2, 3.3, 0]} s={[0.4, 0.2, 0.4]} c="#2a2a2a" />
  <mesh position={[3.2, 3.1, 0]}><sphereGeometry args={[0.22, 8, 6]} /><meshBasicMaterial color="#fff2c0" toneMapped={false} /></mesh><Glow position={[3.2, 3.1, 0]} size={6} color="#ffe8a0" opacity={0.9} /><pointLight position={[3.2, 2.8, 0]} color="#ffe0a0" intensity={6} distance={10} /></group>;
export const Cam = ({position = [0, 0, 0], yaw = 0, pitch = 0.1, blink = true, frame = 0}) => <group position={position} rotation={[0, yaw, 0]}>
  {[0, 2.1, 4.2].map((a, i) => <Cy key={i} p={[Math.cos(a) * 0.35, 0.55, Math.sin(a) * 0.35]} a={[0.03, 0.04, 1.1, 5]} c="#3a3a40" r={[Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22]} />)}
  <group position={[0, 1.2, 0]} rotation={[-pitch, 0, 0]}><Bx s={[0.6, 0.5, 0.9]} c="#2a2c32" /><Cy p={[0, 0, 0.7]} a={[0.22, 0.22, 0.5, 10]} c="#1a1a1e" r={[Math.PI / 2, 0, 0]} /><mesh position={[0, 0, 0.96]}><circleGeometry args={[0.18, 10]} /><meshBasicMaterial color="#3a5a8a" toneMapped={false} /></mesh>
    <mesh position={[0.2, 0.32, -0.2]}><sphereGeometry args={[0.05, 6, 5]} /><meshBasicMaterial color={blink && Math.sin(frame * 0.2) > 0 ? '#ff3a2a' : '#4a1410'} toneMapped={false} /></mesh></group></group>;
export const Roof = ({position = [0, 0, 0]}) => <group position={position}>
  <Bx p={[0, -1.6, 0]} s={[14, 3.2, 10]} c="#6a6a72" /><Bx p={[0, 0.1, 0]} s={[14.4, 0.3, 10.4]} c="#4a4a52" />
  <Bx p={[-5, 0.9, 3]} s={[1.4, 1.2, 1.4]} c="#5a5a62" /><Bx p={[5.2, 1.0, -2]} s={[1.0, 1.6, 1.0]} c="#5a5a62" /><Bx p={[0, 0.35, 4.9]} s={[14.4, 0.7, 0.2]} c="#4a4a52" /></group>;
