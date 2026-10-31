import * as THREE from 'three';
import {useMemo} from 'react';
import {Terrain, makeHeight, Glow, rng, smoothstep, clamp01, softTexture, Fireflies, Person} from '../../kit/index.js';
import {KEEPERS} from './world.jsx';

const B = ({p, s, c, rot, basic, o}) => <mesh position={p} rotation={rot || [0, 0, 0]}><boxGeometry args={s} />
  {basic ? <meshBasicMaterial color={c} transparent={o !== undefined} opacity={o ?? 1} /> : <meshLambertMaterial color={c} flatShading transparent={o !== undefined} opacity={o ?? 1} />}</mesh>;

/** wall clock with hands frozen; pendulum hangs still (stopped). No numbers on the face. */
const Clock = ({position}) => <group position={position}>
  <B p={[0, 0, 0]} s={[1.2, 2.4, 0.35]} c="#6b4226" />
  <mesh position={[0, 0.55, 0.19]}><circleGeometry args={[0.45, 16]} /><meshLambertMaterial color="#f3ead6" /></mesh>
  {Array.from({length: 12}, (_, i) => <B key={i} p={[Math.sin(i * 0.5236) * 0.37, 0.55 + Math.cos(i * 0.5236) * 0.37, 0.2]} s={[0.04, 0.08, 0.01]} c="#2a1d16" rot={[0, 0, -i * 0.5236]} />)}
  <B p={[0.1, 0.62, 0.21]} s={[0.05, 0.3, 0.01]} c="#141414" rot={[0, 0, -0.75]} />
  <B p={[-0.12, 0.43, 0.21]} s={[0.04, 0.34, 0.01]} c="#141414" rot={[0, 0, -2.4]} />
  <B p={[0, -0.6, 0.19]} s={[0.7, 0.9, 0.02]} c="#3a2618" />
  <B p={[0, -0.55, 0.21]} s={[0.03, 0.6, 0.02]} c="#c9a24a" /><mesh position={[0, -0.88, 0.22]}><circleGeometry args={[0.12, 10]} /><meshLambertMaterial color="#d9b25a" /></mesh>
</group>;

const Bed = ({position, blanket = '#7a2f2f', rumple = 0}) => <group position={position}>
  <B p={[0, 0.35, 0]} s={[1.5, 0.3, 3.2]} c="#5a3b24" />
  <B p={[0, 0.6, 0]} s={[1.4, 0.22, 3.0]} c="#efe9dc" />
  <B p={[0.05, 0.76, 0.35]} s={[1.45, 0.16, 2.2]} c={blanket} rot={[0.05 * rumple, 0.12 * rumple, 0.06 * rumple]} />
  <B p={[0.4, 0.95, 0.9]} s={[0.7, 0.3, 0.6]} c={blanket} rot={[0.4, 0.3, 0.2]} o={rumple ? 1 : 0} />
  <B p={[0, 0.82, -1.15]} s={[1.0, 0.22, 0.55]} c="#ffffff" />
  <B p={[0, 0.85, -1.6]} s={[1.5, 1.1, 0.12]} c="#5a3b24" />
</group>;

/** heavy wool coat on a peg (the key object): body, sleeves hanging, collar, buttons, pockets */
export const Coat = ({position, sway = 0}) => <group position={position} rotation={[0, 0, sway]}>
  <B p={[0, -0.95, 0.12]} s={[1.0, 1.7, 0.28]} c="#2c3448" />
  <B p={[-0.62, -0.85, 0.1]} s={[0.26, 1.3, 0.26]} c="#262d3e" rot={[0, 0, 0.12]} />
  <B p={[0.62, -0.85, 0.1]} s={[0.26, 1.3, 0.26]} c="#262d3e" rot={[0, 0, -0.12]} />
  <B p={[0, -0.12, 0.2]} s={[0.8, 0.25, 0.2]} c="#1e2433" />
  <B p={[-0.28, -1.35, 0.27]} s={[0.32, 0.22, 0.03]} c="#20273a" /><B p={[0.28, -1.35, 0.27]} s={[0.32, 0.22, 0.03]} c="#20273a" />
  {[0, 1, 2, 3].map((i) => <mesh key={i} position={[0.02, -0.4 - i * 0.32, 0.27]}><circleGeometry args={[0.05, 6]} /><meshBasicMaterial color="#c9a24a" /></mesh>)}
  <B p={[0, -1.82, 0.12]} s={[1.02, 0.08, 0.3]} c="#1b2030" />
</group>;

/** The keepers' living room/kitchen. flash 0..1 = lightning through the window. door 0..1 open. */
export const Room = ({frame = 0, flash = 0, door = 0, moore = null, coatSway = 0}) => {
  const rainDrops = useMemo(() => { const r = rng(5); return Array.from({length: 30}, () => ({x: (r() - 0.5) * 1.5, ph: r()})); }, []);
  return <group>
    <B p={[0, -0.1, 0]} s={[14, 0.2, 11]} c="#8a6a48" />
    {Array.from({length: 7}, (_, i) => <B key={i} p={[-6 + i * 2, 0.01, 0]} s={[0.04, 0.02, 11]} c="#6e5236" />)}
    <B p={[0, 2.8, -5.5]} s={[14, 5.8, 0.3]} c="#e6dcc4" />
    <B p={[-7, 2.8, 0]} s={[0.3, 5.8, 11]} c="#d8cdb2" />
    <B p={[0, 0.3, -5.3]} s={[14, 0.6, 0.12]} c="#6b4a2e" />
    {/* window with storm outside */}
    <group position={[1.6, 3.2, -5.32]}>
      <B p={[0, 0, 0]} s={[2.0, 2.2, 0.05]} basic c={new THREE.Color('#2a3d66').lerp(new THREE.Color('#e8f0ff'), flash)} />
      {rainDrops.map((d, i) => { const y = 1 - ((d.ph + frame * 0.03) % 1) * 2; return <B key={i} p={[d.x * 1.2, y, 0.04]} s={[0.025, 0.25, 0.01]} basic c="#bcd0f5" />; })}
      <B p={[0, 0, 0.06]} s={[0.1, 2.2, 0.05]} c="#5a3b24" /><B p={[0, 0, 0.06]} s={[2.0, 0.1, 0.05]} c="#5a3b24" />
      <B p={[0, 1.15, 0.06]} s={[2.3, 0.15, 0.1]} c="#5a3b24" /><B p={[0, -1.15, 0.1]} s={[2.4, 0.15, 0.25]} c="#5a3b24" />
      <B p={[-1.25, 0.1, 0.12]} s={[0.4, 2.3, 0.05]} c="#8a2f2f" rot={[0, 0, Math.sin(frame * 0.05) * 0.04]} />
    </group>
    <Clock position={[-2.2, 3.4, -5.25]} />
    {/* cold fireplace on the left wall */}
    <group position={[-6.7, 0, -1.2]}>
      <B p={[0.3, 1.1, 0]} s={[0.8, 2.2, 2.6]} c="#8d8780" />
      <B p={[0.72, 0.6, 0]} s={[0.1, 1.1, 1.4]} c="#191a1d" />
      <B p={[0.72, 0.15, 0]} s={[0.12, 0.2, 1.0]} c="#6f6c68" />
      <B p={[0.5, 2.3, 0]} s={[1.2, 0.18, 2.9]} c="#6b4a2e" />
      <B p={[0.9, 2.55, -0.6]} s={[0.25, 0.3, 0.25]} c="#b5793a" /><B p={[0.9, 2.5, 0.5]} s={[0.2, 0.2, 0.2]} c="#3c5a7a" />
    </group>
    <Bed position={[-4.6, 0, 2.6]} blanket="#8a2f2f" rumple={1} />
    <Bed position={[-2.4, 0, 3.4]} blanket="#2f5a8a" rumple={1} />
    {/* tidy table: clean plates stacked, pots hung */}
    <group position={[2.2, 0, -1.2]}>
      <B p={[0, 1.0, 0]} s={[2.6, 0.12, 1.6]} c="#7a5634" />
      {[[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]].map(([x, z], i) => <B key={i} p={[x, 0.5, z]} s={[0.12, 1.0, 0.12]} c="#5a3b24" />)}
      {[0, 1, 2].map((i) => <mesh key={i} position={[-0.6, 1.1 + i * 0.05, 0]}><cylinderGeometry args={[0.3, 0.25, 0.04, 10]} /><meshLambertMaterial color="#f4f0e6" /></mesh>)}
      <mesh position={[0.6, 1.25, 0.1]}><cylinderGeometry args={[0.28, 0.28, 0.35, 8]} /><meshLambertMaterial color="#3a3f48" flatShading /></mesh>
      {[-1.2, -1.0].map((x, i) => <B key={'c' + i} p={[x, 0.55, 1.0]} s={[0.5, 1.1, 0.12]} c="#6b4a2e" />)}
    </group>
    {/* peg board by the door on the right: three pegs, only one coat */}
    <group position={[5.6, 3.6, -5.28]}>
      <B p={[0, 0, 0]} s={[3.0, 0.3, 0.1]} c="#6b4a2e" />
      {[-1, 0, 1].map((k) => <mesh key={k} position={[k * 1.0, -0.05, 0.18]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.3, 6]} /><meshLambertMaterial color="#4a3020" /></mesh>)}
      <Coat position={[1.0, -0.12, 0.1]} sway={coatSway} />
      <B p={[-0.5, -3.45, 0.3]} s={[1.6, 0.06, 0.6]} c="#5a3b24" />
    </group>
    {/* door on the right wall */}
    <group position={[6.95, 0, 1.2]}>
      <B p={[0, 2.8, -3.6]} s={[0.3, 5.8, 3.8]} c="#d8cdb2" /><B p={[0, 2.8, 3.6]} s={[0.3, 5.8, 3.8]} c="#d8cdb2" />
      <B p={[0, 4.4, 0]} s={[0.3, 2.6, 3.4]} c="#d8cdb2" />
      <B p={[-0.05, 1.55, 0]} s={[0.12, 3.1, 3.2]} basic c={new THREE.Color('#5a6b86').lerp(new THREE.Color('#dfe7f5'), flash * 0.6)} />
      <group position={[0, 0, -1.6]} rotation={[0, -door * 1.4, 0]}><B p={[0, 1.55, 1.6]} s={[0.14, 3.1, 3.2]} c="#3a4f6b" /></group>
    </group>
    {moore}
    <Fireflies center={[0, 2, 0]} area={[12, 4, 8]} count={70} frame={frame} color="#fff6dc" size={0.18} opacity={0.6} />
    <pointLight position={[1.6, 3.2, -3]} color="#cfe0ff" intensity={8 * flash} distance={16} decay={1.2} />
  </group>;
};

/** Lantern room: the clockwork lens (unlit but polished), the brass oil fountain, glazed storm panes. */
export const LanternRoom = ({frame = 0, glint = 0}) => {
  const panes = 10; const drops = useMemo(() => { const r = rng(9); return Array.from({length: 60}, () => ({a: r() * 6.283, y: r(), ph: r()})); }, []);
  return <group>
    <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[4.6, 4.6, 0.2, 20]} /><meshLambertMaterial color="#6f5b3e" flatShading /></mesh>
    {Array.from({length: panes}, (_, i) => { const a = (i / panes) * 6.283; return <group key={i} rotation={[0, a, 0]}>
      <mesh position={[0, 3, 4.3]}><boxGeometry args={[2.6, 5.4, 0.04]} /><meshBasicMaterial color="#5a78b8" transparent opacity={0.35} depthWrite={false} /></mesh>
      <mesh position={[1.36, 3, 4.25]}><boxGeometry args={[0.14, 5.6, 0.14]} /><meshLambertMaterial color="#20242c" /></mesh>
    </group>; })}
    {drops.map((d, i) => { const yy = 5.6 - ((d.y + frame * 0.02 * (0.7 + d.ph)) % 1) * 5.4; return <mesh key={'d' + i} position={[Math.sin(d.a) * 4.27, yy, Math.cos(d.a) * 4.27]} rotation={[0, d.a, 0]}><boxGeometry args={[0.03, 0.35, 0.01]} /><meshBasicMaterial color="#dfe8ff" transparent opacity={0.6} /></mesh>; })}
    {/* lens: stacked brass rings + glass prisms, slowly catching glints */}
    <group position={[0, 0, 0]} rotation={[0, frame * 0.004, 0]}>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[1.0, 1.3, 1.2, 10]} /><meshLambertMaterial color="#7a5a2a" flatShading /></mesh>
      {Array.from({length: 9}, (_, i) => <mesh key={i} position={[0, 1.6 + i * 0.33, 0]}><torusGeometry args={[1.25 - Math.abs(i - 4) * 0.08, 0.13, 4, 14]} />
        <meshPhongMaterial color={i % 2 ? '#ffe7a3' : '#d9f1ff'} emissive="#ffb84a" emissiveIntensity={0.15 + 0.5 * Math.max(0, Math.sin(frame * 0.05 + i * 0.6))} shininess={90} transparent opacity={0.85} flatShading /></mesh>)}
      {Array.from({length: 8}, (_, i) => <mesh key={'b' + i} position={[Math.sin(i * 0.785) * 1.1, 2.9, Math.cos(i * 0.785) * 1.1]}><boxGeometry args={[0.06, 3.0, 0.06]} /><meshLambertMaterial color="#b88a3a" /></mesh>)}
      <mesh position={[0, 4.6, 0]}><coneGeometry args={[1.25, 0.8, 10]} /><meshLambertMaterial color="#b88a3a" flatShading /></mesh>
    </group>
    {/* oil fountain (full) + cleaning cloth */}
    <group position={[2.4, 0, 1.4]}>
      <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.45, 0.5, 1.4, 10]} /><meshPhongMaterial color="#d4a548" shininess={80} flatShading /></mesh>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.15, 0.3, 0.3, 8]} /><meshPhongMaterial color="#d4a548" shininess={80} flatShading /></mesh>
    </group>
    <mesh position={[-2.2, 0.08, 1.8]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.9, 0.06, 0.6]} /><meshLambertMaterial color="#f0ece2" /></mesh>
    <Glow position={[0, 3, 0]} size={9} color="#ffcf6a" opacity={0.35 + 0.25 * glint} />
    <Fireflies center={[0, 1, 0]} area={[7, 4, 7]} count={50} frame={frame} color="#fff0c8" size={0.14} opacity={0.75} />
  </group>;
};

// ---------- west landing set (close cliff, landing steps, crane platform, box crevice 110 ft up) ----------
// scale: 1 unit = 11 ft, so the box crevice sits at y = 10 and the crane platform at y = 6.4.
const cliffH = makeHeight({seed: 77, amp: 0.7, freq: 0.35, shape: (x, z, h) => {
  // wall rises from the sea at z=2 to the top at z=-6; a gully (the geo) at x ~ 0 cuts in
  const g = Math.exp(-((x / 3.2) ** 2));
  const zz = z + g * 3.5;
  const wall = 15 * smoothstep(2.5, -5.5, zz);
  const ramp = (z > -4 && z < 2.6 && x > 2 && x < 9) ? Math.max(0, (2.2 - z) * 1.7) * 0 : 0;
  return wall + h * smoothstep(3, -1, zz) - 1.5 * smoothstep(1, 3, zz) + ramp;
}});
export const LANDING_SET = {box: [4.6, 10, -2.9], platform: [5.0, 6.4, -1.6]};
const cliffCol = (h, x, z) => (h > 14.2 ? '#6fa043' : h < 0.4 ? '#24272c' : ['#5a5049', '#6d625a', '#4b4540', '#625850'][Math.floor(h / 1.6) % 4]);
/** twist 0..1 bends the railings, boxGone 0..1 removes the rope box (ropes strewn) */
export const WestLanding = ({frame = 0, twist = 1, boxGone = 1, tint = '#ffffff', marker = 0}) => {
  const rails = useMemo(() => Array.from({length: 9}, (_, i) => ({x: 2.6 + i * 0.75, r1: (i % 3 - 1) * 0.7, r2: ((i * 7) % 5 - 2) * 0.3})), []);
  const P = LANDING_SET.platform, BX = LANDING_SET.box;
  return <group>
    <Terrain height={cliffH} size={46} seg={80} colorFn={cliffCol} tint={tint} center={[0, -6]} jitter={0.25} />
    {/* tramway incline up the cliff */}
    {Array.from({length: 12}, (_, i) => { const t = i / 11; return <mesh key={i} position={[5.4 - t * 1.2, 6.6 + t * 8.2, -1.8 - t * 3.6]} rotation={[0.9, 0, 0]}><boxGeometry args={[1.3, 0.12, 0.25]} /><meshLambertMaterial color="#6b5a48" /></mesh>; })}
    {/* concrete platform + steps down to the water */}
    <mesh position={[P[0], P[1] - 0.2, P[2]]}><boxGeometry args={[4.2, 0.4, 2.4]} /><meshLambertMaterial color="#a19c90" flatShading /></mesh>
    {Array.from({length: 10}, (_, i) => <mesh key={'s' + i} position={[3.1, 6.0 - i * 0.62, -0.4 + i * 0.32]}><boxGeometry args={[1.2, 0.3, 0.5]} /><meshLambertMaterial color="#8f8a80" flatShading /></mesh>)}
    {/* crane (unharmed) */}
    <group position={[6.4, P[1], -1.9]}><mesh position={[0, 0.9, 0]}><boxGeometry args={[0.3, 1.8, 0.3]} /><meshLambertMaterial color="#34404e" /></mesh>
      <mesh position={[-0.9, 1.6, 0.4]} rotation={[0, 0.4, 1.2]}><boxGeometry args={[0.16, 2.6, 0.16]} /><meshLambertMaterial color="#34404e" /></mesh></group>
    {/* railings: posts + rails, bent by twist */}
    {rails.map((r, i) => <group key={'r' + i} position={[r.x - 0.5, P[1], -0.5]} rotation={[r.r2 * twist, 0, r.r1 * twist]}>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.07, 1.0, 0.07]} /><meshLambertMaterial color="#2a2f38" /></mesh>
      <mesh position={[0.37, 0.95, 0]} rotation={[0, 0, r.r1 * twist * 0.8]}><boxGeometry args={[0.75, 0.05, 0.05]} /><meshLambertMaterial color="#2a2f38" /></mesh></group>)}
    {/* rope box in its crevice at 110 ft, or the empty crevice + strewn coils */}
    <mesh position={[BX[0], BX[1] - 0.3, BX[2] + 0.2]}><boxGeometry args={[1.6, 0.9, 0.5]} /><meshLambertMaterial color="#1c1e22" /></mesh>
    {boxGone < 1 && <group position={[BX[0], BX[1] + boxGone * -6, BX[2] + 0.5 + boxGone * 3]} rotation={[boxGone * 2, boxGone * 1.4, 0]}>
      <mesh><boxGeometry args={[1.3, 0.7, 0.7]} /><meshLambertMaterial color="#8a5a2e" flatShading /></mesh></group>}
    {boxGone > 0.6 && [[4.2, -1.2], [5.6, -0.9], [6.8, -1.3], [3.8, -2.0]].map(([x, z], i) => <mesh key={'c' + i} position={[x, P[1] + 0.08, z]} rotation={[-Math.PI / 2, 0, i]}><torusGeometry args={[0.32, 0.07, 4, 10]} /><meshLambertMaterial color="#c9a76a" /></mesh>)}
    {/* height marker: dashed line sea -> crevice */}
    {marker > 0 && Array.from({length: 10}, (_, i) => i / 10 < marker ? <mesh key={'m' + i} position={[BX[0] - 1.6, 0.5 + i * 0.98, BX[2] + 1.9]}><boxGeometry args={[0.14, 0.6, 0.14]} /><meshBasicMaterial color="#ffd93b" /></mesh> : null)}
  </group>;
};
