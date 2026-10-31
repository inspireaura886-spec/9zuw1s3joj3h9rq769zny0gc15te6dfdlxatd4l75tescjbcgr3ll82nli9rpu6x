// UVB-76 "The Buzzer" diorama parts: snowy forest, red-white lattice mast, concrete bunker with door, receiver with dial+waveform,
// empty radio room, shaft with missing ladder, dog on a chain. Deterministic (no clocks).
import {useMemo} from 'react';
import * as THREE from 'three';
import {Terrain, makeHeight, rng} from '../../kit/index.js';

export const Bx = ({p = [0, 0, 0], s = [1, 1, 1], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
export const Cy = ({p = [0, 0, 0], a = [0.2, 0.2, 1, 8], c = '#888', r = [0, 0, 0], e, ei = 1, basic = false, o = 1}) => <mesh position={p} rotation={r}><cylinderGeometry args={a} />
  {basic ? <meshBasicMaterial color={c} transparent={o < 1} opacity={o} /> : <meshLambertMaterial color={c} flatShading emissive={e || '#000'} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />}</mesh>;
/** thin beam between two points */
const Beam = ({a, b, w = 0.07, c = '#cfd4da'}) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b); const d = vb.clone().sub(va); const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); const m = va.clone().add(vb).multiplyScalar(0.5);
  return <mesh position={m.toArray()} quaternion={q}><boxGeometry args={[w, len, w]} /><meshLambertMaterial color={c} flatShading /></mesh>;
};

// ---------- buzz envelope: a burst of buzz every 2.4 s (25 a minute), `period` overrides for the hook ----------
export const buzz = (t, period = 2.4, len = 0.55) => { const m = ((t % period) + period) % period; return m < len ? 1 : 0; };

// ---------- ground + forest ----------
export const height = makeHeight({seed: 76, amp: 0.45, freq: 0.05, shape: (x, z, h) => h * Math.min(1, Math.hypot(x, z) / 12)});
const snowColor = (h, x, z) => ((Math.floor(x * 0.35) + Math.floor(z * 0.35)) % 2 ? '#dfe8f6' : '#cdd9ee');
export const Snow = () => <Terrain height={height} size={220} seg={64} colorFn={snowColor} center={[0, 0]} jitter={0.12} />;
export const Pines = ({count = 70, seed = 9, keepOut = 11, spread = 70, sway = 0, frame = 0}) => {
  const P = useMemo(() => { const r = rng(seed); const out = []; while (out.length < count) { const x = (r() - 0.5) * 2 * spread, z = (r() - 0.7) * 2 * spread; if (Math.hypot(x, z) < keepOut) continue; out.push({x, z, s: 0.8 + r() * 1.1, tint: r()}); } return out; }, [count, seed]);
  return <group>{P.map((p, i) => <group key={i} position={[p.x, height(p.x, p.z), p.z]} scale={p.s} rotation={[0, 0, Math.sin(frame * 0.04 + i) * sway]}>
    <Cy p={[0, 0.6, 0]} a={[0.14, 0.2, 1.2, 5]} c="#4a3626" />
    {[0, 1, 2].map((k) => <mesh key={k} position={[0, 1.5 + k * 0.95, 0]}><coneGeometry args={[1.5 - k * 0.38, 1.7, 6]} /><meshLambertMaterial color={p.tint > 0.5 ? '#1f4a3c' : '#26584a'} flatShading /></mesh>)}
    {[0, 1, 2].map((k) => <mesh key={'s' + k} position={[0, 1.72 + k * 0.95, 0]}><coneGeometry args={[1.18 - k * 0.3, 0.5, 6]} /><meshLambertMaterial color="#eaf2ff" flatShading /></mesh>)}
  </group>)}</group>;
};

// ---------- the mast: 4 legs, red/white bands, cross braces, blinking light, guy wires ----------
export const Mast = ({position = [0, 0, 0], H = 22, frame = 0, light = true}) => {
  const base = 1.7, top = 0.35; const lv = (k, u) => { const w = base + (top - base) * u; return [(k % 2 ? 1 : -1) * w, u * H, (k < 2 ? 1 : -1) * w]; };
  const legs = []; const N = 8;
  for (let k = 0; k < 4; k++) for (let i = 0; i < N; i++) legs.push(<Beam key={k + '_' + i} a={lv(k, i / N)} b={lv(k, (i + 1) / N)} w={0.16} c={i % 2 ? '#f2f2ee' : '#d4382c'} />);
  const braces = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; braces.push(<Beam key={'x' + i + k} a={lv(k, i / N)} b={lv(k2, (i + 1) / N)} w={0.07} />); braces.push(<Beam key={'y' + i + k} a={lv(k2, i / N)} b={lv(k, (i + 1) / N)} w={0.07} />); }
  const on = Math.sin(frame * 0.18) > 0;
  return <group position={position}>{legs}{braces}
    <Cy p={[0, H + 0.6, 0]} a={[0.04, 0.08, 1.4, 5]} c="#cfd4da" />
    {light && <mesh position={[0, H + 1.4, 0]}><sphereGeometry args={[0.22, 8, 6]} /><meshBasicMaterial color={on ? '#ff3a2a' : '#5a1410'} /></mesh>}
    {light && on && <pointLight position={[0, H + 1.4, 0]} color="#ff4a3a" intensity={9} distance={14} />}
    {[0, 1, 2, 3].map((k) => { const a = k * 1.5708 + 0.785; return <Beam key={'g' + k} a={[0, H * 0.8, 0]} b={[Math.cos(a) * 14, 0.1, Math.sin(a) * 14]} w={0.03} c="#9aa0a8" />; })}
    <Bx p={[0, 0.2, 0]} s={[5, 0.4, 5]} c="#6c7078" />
  </group>;
};
/** expanding radio rings (centred at y) */
export const Rings = ({position = [0, 0, 0], t0, frame, fps = 30, n = 3, gap = 0.5, life = 1.6, rMax = 30, color = '#7affc0', vertical = false}) => <group position={position}>
  {Array.from({length: n}, (_, i) => { const k = (frame / fps - t0 - i * gap) / life; if (k < 0 || k > 1) return null; const r = 0.5 + k * rMax;
    return <mesh key={i} rotation={[vertical ? 0 : -Math.PI / 2, 0, 0]}><ringGeometry args={[r, r + 0.18 + k * 0.25, 48]} /><meshBasicMaterial color={color} transparent opacity={0.85 * (1 - k)} side={THREE.DoubleSide} depthWrite={false} /></mesh>; })}
</group>;

// ---------- bunker: concrete building, door hinged at the left of a gap (front = +z) ----------
export const Bunker = ({position = [0, 0, 0], open = 0, frame = 0}) => {
  const W = 7, D = 5.5, Hh = 3.4, gap = 1.3, dh = 2.4; const side = (W - gap) / 2;
  return <group position={position}>
    <Bx p={[0, Hh / 2, 0]} s={[W, Hh, D - 0.3]} c="#7c838c" />
    <Bx p={[0, Hh + 0.2, 0]} s={[W + 0.5, 0.4, D + 0.4]} c="#4e5560" />
    <Bx p={[-side / 2 - gap / 2, Hh / 2, D / 2 - 0.1]} s={[side, Hh, 0.3]} c="#868d96" />
    <Bx p={[side / 2 + gap / 2, Hh / 2, D / 2 - 0.1]} s={[side, Hh, 0.3]} c="#868d96" />
    <Bx p={[0, dh + (Hh - dh) / 2, D / 2 - 0.1]} s={[gap, Hh - dh, 0.3]} c="#868d96" />
    <Bx p={[0, dh / 2, D / 2 - 0.5]} s={[gap, dh, 0.4]} c="#000000" basic />
    <group position={[-gap / 2, 0, D / 2 + 0.05]} rotation={[0, -open, 0]}><Bx p={[gap / 2, dh / 2, 0]} s={[gap, dh, 0.1]} c="#7a3a26" /><Bx p={[gap * 0.8, dh * 0.5, 0.08]} s={[0.12, 0.12, 0.08]} c="#c8b070" /><Bx p={[gap / 2, dh * 0.85, 0.06]} s={[gap * 0.8, 0.06, 0.04]} c="#4a2616" /></group>
    {[-2.2, 2.2].map((x) => <group key={x} position={[x, 2.2, D / 2 + 0.07]}><Bx s={[1.0, 0.6, 0.05]} c="#1a2230" /><Bx p={[0, 0, 0.03]} s={[0.9, 0.5, 0.02]} c="#2a4058" e="#3a5878" ei={0.4} /></group>)}
    {/* rust streaks + pipes */}
    {[-3, -1.6, 2.4, 3].map((x, i) => <Bx key={i} p={[x, Hh - 0.9 - i * 0.1, D / 2 + 0.07]} s={[0.12, 1.6 + i * 0.2, 0.03]} c="#6a4a3a" />)}
    <Cy p={[3.5, 1.7, -1.5]} a={[0.12, 0.12, 3.4, 6]} c="#5a6068" /><Cy p={[-3.5, 2.6, -1]} a={[0.16, 0.16, 1.6, 6]} r={[0, 0, Math.PI / 2]} c="#5a6068" />
    <Bx p={[0, 0.06, D / 2 + 0.9]} s={[2.2, 0.1, 1.8]} c="#a8b2c2" />
    {open > 0.2 && <pointLight position={[0, 1.4, D / 2 + 1.2]} color="#ffb060" intensity={2.2} distance={5} />}
  </group>;
};

// ---------- receiver: dial at 4625, speaker, equalizer bars. mode: buzz | voice | dead | glitch ----------
export const Receiver = ({position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, frame = 0, amp = 0, mode = 'buzz', needle = 0.625, power = true}) => {
  const bars = 21; const on = power && mode !== 'dead';
  const hgt = (i) => { if (mode === 'dead') return 0.02; if (mode === 'voice') return 0.06 + 0.5 * amp * Math.abs(Math.sin(frame * 0.5 + i * 1.9) * Math.cos(frame * 0.23 + i * 0.7));
    if (mode === 'glitch') return 0.04 + 0.6 * Math.abs(Math.sin(frame * 1.7 + i * 5.1)) * (Math.sin(frame * 0.9) > -0.2 ? 1 : 0.1);
    return 0.05 + amp * 0.42 * (0.8 + 0.2 * Math.sin(frame * 1.3 + i)); };
  return <group position={position} rotation={rotation} scale={scale}>
    <Bx p={[0, 0, 0]} s={[2.6, 1.5, 1.2]} c="#4a5a4c" /><Bx p={[0, 0.8, 0]} s={[2.7, 0.1, 1.3]} c="#2e382f" />
    <Bx p={[-0.15, 0.15, 0.61]} s={[1.9, 0.5, 0.04]} c="#10140f" />
    {/* dial: ticks along the scale, needle at 4625 */}
    {Array.from({length: 21}, (_, i) => <Bx key={i} p={[-1.0 + i * 0.09, 0.28 + (i % 5 === 0 ? 0.03 : 0), 0.64]} s={[0.012, i % 5 === 0 ? 0.14 : 0.08, 0.01]} c={on ? '#ffd080' : '#4a4030'} basic />)}
    <Bx p={[-1.0 + needle * 1.8, 0.15, 0.65]} s={[0.03, 0.4, 0.02]} c={on ? '#ff4a30' : '#502018'} basic />
    <Bx p={[-0.15, 0.15, 0.625]} s={[1.9, 0.48, 0.01]} c="#ffb040" basic o={on ? 0.22 : 0.0} />
    {/* equalizer */}
    <Bx p={[-0.15, -0.38, 0.62]} s={[1.9, 0.6, 0.03]} c="#0a0e0a" />
    {Array.from({length: bars}, (_, i) => { const h = hgt(i); return <Bx key={i} p={[-1.0 + i * 0.09, -0.66 + h / 2, 0.65]} s={[0.06, Math.max(0.02, h), 0.02]} c={mode === 'voice' ? '#ffd24a' : '#8affc0'} basic />; })}
    {/* knobs + speaker */}
    {[0.0, 1].map((k, i) => <Cy key={i} p={[1.04 + i * 0.0, 0.36 - i * 0.42, 0.66]} a={[0.15, 0.15, 0.14, 10]} r={[Math.PI / 2, 0, 0]} c="#1a1a1a" />)}
    <Cy p={[1.04, -0.38, 0.62]} a={[0.2, 0.2, 0.04, 14]} r={[Math.PI / 2, 0, 0]} c="#202820" />
    <mesh position={[1.05, 0.1, 0.65]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color={on ? '#58ff6a' : '#183a1c'} /></mesh>
    {/* antenna wire */}
    <Beam a={[1.0, 0.8, -0.3]} b={[2.4, 3.2, -1.8]} w={0.02} c="#9aa0a8" />
    {on && <pointLight position={[0, 0.2, 1.5]} color={mode === 'voice' ? '#ffd070' : '#7affc0'} intensity={2.5 + amp * 3} distance={6} />}
  </group>;
};

// ---------- desk + chair + mic + wall clock + hanging bulb (the radio room) ----------
export const Room = ({frame = 0, door = 0, knock = 0, lamp = 1, amp = 0, mode = 'dead', chairEmpty = true, floorColor = '#4a4640'}) => <group>
  <Bx p={[0, -0.05, 0]} s={[14, 0.1, 12]} c={floorColor} />
  <Bx p={[0, 2.6, -5.9]} s={[14, 5.2, 0.2]} c="#6c7a72" /><Bx p={[-7, 2.6, 0]} s={[0.2, 5.2, 12]} c="#627068" /><Bx p={[7, 2.6, 0]} s={[0.2, 5.2, 12]} c="#627068" /><Bx p={[0, 5.3, 0]} s={[14, 0.2, 12]} c="#4a5650" />
  {/* back wall: window with the mast outside + panel */}
  <group position={[-2.6, 2.7, -5.78]}><Bx s={[2.6, 1.8, 0.1]} c="#1c2640" /><Bx p={[0, 0, 0.04]} s={[2.4, 1.6, 0.04]} c="#5a78b8" e="#3a5898" ei={0.6} /><Bx p={[0, 0, 0.07]} s={[0.06, 1.6, 0.04]} c="#2a2a2a" /><Bx p={[0, 0, 0.07]} s={[2.4, 0.06, 0.04]} c="#2a2a2a" /></group>
  {/* door in the right wall (dark corridor) */}
  <group position={[6.88, 0, 1.2]}><Bx p={[0, 1.15, 0]} s={[0.2, 2.3, 1.5]} c="#000" basic />
    <Bx p={[-0.06, 2.4, 0]} s={[0.2, 0.2, 1.9]} c="#4a3220" />{[-0.85, 0.85].map((z) => <Bx key={z} p={[-0.06, 1.2, z]} s={[0.2, 2.4, 0.2]} c="#4a3220" />)}
    <Bx p={[-0.12, 0.03, 0]} s={[0.04, 0.05, 1.5]} c="#ffd890" basic o={0.2 + 0.8 * (0.5 + 0.5 * Math.sin(frame * 0.9))} />
    <group position={[0, 0, -0.75]} rotation={[0, door, 0]}><Bx p={[0, 1.15, 0.75]} s={[0.08, 2.3, 1.5]} c="#7a4a2a" /><Bx p={[0.1, 1.1, 1.3]} s={[0.1, 0.1, 0.1]} c="#c8b070" /></group></group>
  {/* desk, receiver, mic, chair */}
  <group position={[0, 0, -2.4]}><Bx p={[0, 0.9, 0]} s={[4.4, 0.14, 1.8]} c="#7a5a3a" />{[-2, 2].map((x) => <Bx key={x} p={[x, 0.45, 0]} s={[0.14, 0.9, 1.6]} c="#5a4228" />)}
    <Receiver position={[0.3, 1.7, -0.1]} scale={0.95} frame={frame} amp={amp} mode={mode} power={mode !== 'off'} />
    <Cy p={[-1.5, 1.05, 0.3]} a={[0.05, 0.05, 0.3, 6]} c="#aaa" /><Cy p={[-1.5, 1.35, 0.3]} a={[0.04, 0.04, 0.5, 6]} c="#aaa" /><mesh position={[-1.5, 1.65, 0.3]}><sphereGeometry args={[0.14, 8, 6]} /><meshLambertMaterial color="#222" flatShading /></mesh>
    <Bx p={[1.6, 0.99, 0.2]} s={[0.5, 0.04, 0.35]} c="#e8e0c8" r={[0, 0.3, 0]} /><Bx p={[-0.6, 0.99, 0.5]} s={[0.4, 0.05, 0.3]} c="#2a2a2a" />
    <Bx p={[1.2, 1.02, 0.5]} s={[0.12, 0.12, 0.12]} c="#e8e0d0" /></group>
  <group position={[0.3, 0, -0.2]} rotation={[0, knock * 0.0 + 0.2, 0]}><Bx p={[0, 0.5, 0]} s={[0.8, 0.1, 0.8]} c="#3a2a22" /><Bx p={[0, 1.0, 0.36]} s={[0.8, 0.9, 0.1]} c="#3a2a22" />{[-0.3, 0.3].map((x) => [-0.3, 0.3].map((z) => <Cy key={x + '_' + z} p={[x, 0.22, z]} a={[0.04, 0.04, 0.45, 5]} c="#2a2a2a" />))}</group>
  <group position={[3.8, 3.7, -5.78]}><Cy a={[0.8, 0.8, 0.08, 20]} r={[Math.PI / 2, 0, 0]} c="#e8e0c8" /><Bx p={[0, 0.25, 0.05]} s={[0.05, 0.5, 0.02]} c="#222" /><Bx p={[0.15, 0, 0.05]} s={[0.35, 0.05, 0.02]} c="#222" r={[0, 0, 0.5]} /></group>
  <group position={[0, 5.1, -1]}><Cy p={[0, 0.2, 0]} a={[0.02, 0.02, 0.8, 4]} c="#222" /><mesh position={[0, -0.25, 0]}><sphereGeometry args={[0.2, 8, 6]} /><meshBasicMaterial color="#fff2c0" /></mesh><pointLight position={[0, -0.6, 0]} color="#ffd890" intensity={7 * lamp} distance={14} /></group>
  <pointLight position={[-2.6, 2.7, -4.6]} color="#7a98d8" intensity={3} distance={8} />
</group>;

// ---------- shaft: concrete floor with a square hole, a ladder stub that ends in nothing ----------
export const Shaft = ({frame = 0, depth = 30}) => <group>
  {[4.2, -4.2].map((z, i) => <Bx key={i} p={[0, -0.1, z]} s={[14, 0.2, 6.4]} c="#7a8088" />)}
  <Bx p={[-4, -0.1, 0]} s={[6, 0.2, 2]} c="#7a8088" /><Bx p={[4, -0.1, 0]} s={[6, 0.2, 2]} c="#7a8088" />
  {[[-1.1, 0, 0.14, 2.2], [1.1, 0, 0.14, 2.2]].map(([x, z, w, d], i) => <Bx key={i} p={[x, 0.04, z]} s={[w, 0.08, d]} c="#caa84a" />)}
  {[[0, -1.1], [0, 1.1]].map(([x, z], i) => <Bx key={i} p={[x, 0.04, z]} s={[2.2, 0.08, 0.14]} c="#caa84a" />)}
  {/* hole walls going down to darkness */}
  {[[-1, 0, 0.1, 2], [1, 0, 0.1, 2]].map(([x, z], i) => <Bx key={i} p={[x, -depth / 2, z]} s={[0.1, depth, 2]} c="#18202e" />)}
  {[[0, -1], [0, 1]].map(([x, z], i) => <Bx key={i} p={[x, -depth / 2, z]} s={[2, depth, 0.1]} c="#18202e" />)}
  {Array.from({length: Math.floor(depth / 7)}, (_, i) => <group key={i} position={[0.88, -4 - i * 7, 0]}><Bx s={[0.1, 0.3, 0.3]} c="#ffd890" basic /><pointLight position={[-0.4, 0, 0]} color="#ffc880" intensity={4} distance={7} /></group>)}
  <Bx p={[0, -depth, 0]} s={[2, 0.1, 2]} c="#2a3850" basic />
  {/* ladder: rails and a few rungs that stop after 1.6 units */}
  {[-0.28, 0.28].map((x) => <Bx key={x} p={[x, -0.8, -0.93]} s={[0.07, 1.8, 0.07]} c="#6a4a38" />)}
  {[0, 1, 2, 3].map((i) => <Bx key={i} p={[0, -0.2 - i * 0.4, -0.93]} s={[0.56, 0.05, 0.05]} c="#6a4a38" />)}
  {/* rusty ring on the broken end */}
  <Bx p={[0.28, -1.75, -0.93]} s={[0.1, 0.1, 0.1]} c="#8a4a2a" r={[0.4, 0.3, 0.2]} />
  <pointLight position={[0, 3.2, 0]} color="#ffe0b0" intensity={8} distance={14} />
</group>;
export const Rock = ({position = [0, 0, 0], scale = 0.18, spin = 0}) => <mesh position={position} scale={scale} rotation={[spin, spin * 0.7, 0]}><dodecahedronGeometry args={[1, 0]} /><meshLambertMaterial color="#9a9288" flatShading emissive="#3a342c" emissiveIntensity={0.6} /></mesh>;

// ---------- dog on a chain, bowl, post ----------
export const Dog = ({position = [0, 0, 0], rotation = 0, frame = 0, tail = 1, head = 0}) => {
  const wag = Math.sin(frame * 0.55) * 0.7 * tail; const c = '#6a4a30', d = '#3a2a1c';
  return <group position={position} rotation={[0, rotation, 0]}>
    <Bx p={[0, 0.62, 0]} s={[0.5, 0.45, 1.1]} c={c} />
    <group position={[0, 0.95, 0.65]} rotation={[head, Math.sin(frame * 0.07) * 0.25, 0]}><Bx s={[0.42, 0.4, 0.45]} c={c} /><Bx p={[0, -0.07, 0.34]} s={[0.24, 0.2, 0.3]} c="#c8a880" /><Bx p={[0, 0.0, 0.5]} s={[0.1, 0.08, 0.06]} c="#111" />
      {[-1, 1].map((s) => <Bx key={s} p={[s * 0.2, 0.26, -0.05]} s={[0.12, 0.26, 0.1]} c={d} r={[0, 0, s * 0.25]} />)}
      {[-1, 1].map((s) => <mesh key={'e' + s} position={[s * 0.1, 0.06, 0.24]}><sphereGeometry args={[0.035, 6, 5]} /><meshBasicMaterial color="#111" /></mesh>)}
      <Bx p={[0, -0.24, 0.0]} s={[0.46, 0.08, 0.1]} c="#a82a2a" /></group>
    {[[-0.18, 0.4], [0.18, 0.4], [-0.18, -0.4], [0.18, -0.4]].map(([x, z], i) => <Bx key={i} p={[x, 0.2, z]} s={[0.14, 0.4, 0.14]} c={d} />)}
    <group position={[0, 0.8, -0.58]} rotation={[0.5, wag, 0]}><Bx p={[0, 0.2, 0]} s={[0.1, 0.5, 0.1]} c={c} /></group>
  </group>; };
export const ChainPost = ({position = [0, 0, 0], to = [1.6, 0.9, 0]}) => {
  const pts = Array.from({length: 9}, (_, i) => { const u = i / 8; return [to[0] * u, 1.1 + (to[1] - 1.1) * u - Math.sin(u * Math.PI) * 0.45, to[2] * u]; });
  return <group position={position}><Cy p={[0, 0.7, 0]} a={[0.1, 0.12, 1.4, 6]} c="#6a4a2e" /><Bx p={[0, 1.4, 0]} s={[0.3, 0.12, 0.3]} c="#4a3220" />
    {pts.slice(1).map((p, i) => <Bx key={i} p={p} s={[0.08, 0.08, 0.14]} c="#8a9098" r={[0, i * 0.7, i * 0.9]} />)}</group>; };
export const Bowl = ({position = [0, 0, 0], fill = 0, frame = 0}) => <group position={position}>
  <Cy p={[0, 0.1, 0]} a={[0.32, 0.22, 0.2, 10]} c="#b8bcc4" />
  {fill > 0 && <mesh position={[0, 0.2 + fill * 0.08, 0]} scale={[1, fill, 1]}><sphereGeometry args={[0.28, 8, 5, 0, 6.28, 0, 1.57]} /><meshLambertMaterial color="#8a5a34" flatShading /></mesh>}</group>;
