// Kazakh steppe diorama + the Saiga (drooping-nose antelope). Deterministic.
import {useMemo} from 'react';
import {Terrain, makeHeight, Tree, rng, fbm, clamp01, easeInOut} from '../../kit/index.js';

export const height = makeHeight({seed: 2015, amp: 0.7, freq: 0.05, shape: (x, z, h) => 0.3 + h * 0.8 + 1.4 * Math.exp(-(((x - 18) / 9) ** 2) - (((z + 18) / 7) ** 2))});
const colorFn = (h, x, z) => { const n = fbm(x * 0.2, z * 0.2, 4, 2); return n > 0.1 ? '#b9a85a' : n > -0.1 ? '#a8a04e' : '#8f9a48'; };
export const Steppe = ({tint = '#ffffff'}) => <Terrain height={height} size={150} seg={90} colorFn={colorFn} tint={tint} center={[0, 0]} jitter={0.3} />;

const TUFTS = (() => { const r = rng(77); return Array.from({length: 150}, () => ({x: (r() - 0.5) * 60, z: (r() - 0.5) * 50 - 4, s: 0.5 + r() * 0.7, c: ['#8da040', '#a8b04a', '#c4b858'][Math.floor(r() * 3)], f: r() > 0.85})); })();
export const Grass = ({frame = 0}) => <group>{TUFTS.map((t, i) => { const y = height(t.x, t.z); const sw = Math.sin(frame * 0.08 + i) * 0.1;
  return <group key={i} position={[t.x, y, t.z]} rotation={[0, i, sw]}>
    <mesh position={[0, 0.25 * t.s, 0]}><coneGeometry args={[0.18 * t.s, 0.6 * t.s, 4]} /><meshLambertMaterial color={t.c} flatShading /></mesh>
    {t.f && <mesh position={[0.1, 0.5, 0]}><icosahedronGeometry args={[0.1, 0]} /><meshLambertMaterial color={i % 2 ? '#e8e0f0' : '#f0d84a'} flatShading /></mesh>}</group>; })}</group>;

const Bx = ({p, s, c}) => <mesh position={p}><boxGeometry args={s} /><meshLambertMaterial color={c} flatShading /></mesh>;
/** pose: graze | stand | sway | fall (fallT 0..1 -> lies on its side, eyes closed, no gore) */
export const SaigaAnimal = ({position = [0, 0, 0], rotation = 0, scale = 1, frame = 0, seed = 0, fallT = 0, calf = false, still = false}) => {
  const t = easeInOut(clamp01(fallT)); const k = calf ? 0.55 : 1; const body = calf ? '#d8c49a' : '#c9a26a';
  const head = fallT > 0 ? 0.1 : still ? 0.05 + Math.sin(frame * 0.12 + seed) * 0.05 : -0.4 - 0.3 * (0.5 + 0.5 * Math.sin(frame * 0.045 + seed));
  const ear = Math.sin(frame * 0.3 + seed * 3) > 0.9 ? 0.4 : 0; const tail = Math.sin(frame * 0.2 + seed) * 0.4;
  return <group position={position} rotation={[0, rotation, 0]} scale={scale * k}>
    <group rotation={[0, 0, (Math.PI / 2) * t]} position={[0.55 * t, 0, 0]}>
      <Bx p={[0, 0.85, 0]} s={[0.55, 0.55, 1.3]} c={body} /><Bx p={[0, 0.6, 0]} s={[0.5, 0.2, 1.2]} c="#f2ead8" />
      <group position={[0, 1.05, 0.65]} rotation={[-head, 0, 0]}>
        <Bx p={[0, 0.05, 0.15]} s={[0.3, 0.3, 0.4]} c={body} />
        <Bx p={[0, -0.02, 0.45]} s={[0.26, 0.24, 0.28]} c="#b88e58" /><Bx p={[0, -0.2, 0.55]} s={[0.2, 0.2, 0.22]} c="#8a6a44" />{/* drooping bulbous snout */}
        {!calf && <><Bx p={[-0.1, 0.28, 0.05]} s={[0.04, 0.22, 0.04]} c="#d8c070" /><Bx p={[0.1, 0.28, 0.05]} s={[0.04, 0.22, 0.04]} c="#d8c070" /></>}
        <Bx p={[-0.2, 0.15, 0]} s={[0.12, 0.05, 0.16]} c={body} /><Bx p={[0.2, 0.15 + ear * 0.2, 0]} s={[0.12, 0.05, 0.16]} c={body} />
        <Bx p={[-0.13, 0.1, 0.32]} s={[0.04, 0.05, 0.03]} c={fallT > 0.3 ? body : '#141414'} /><Bx p={[0.13, 0.1, 0.32]} s={[0.04, 0.05, 0.03]} c={fallT > 0.3 ? body : '#141414'} />
      </group>
      <group position={[0, 1.0, -0.65]} rotation={[0.4, 0, tail]}><Bx p={[0, -0.1, -0.03]} s={[0.05, 0.25, 0.05]} c="#f2ead8" /></group>
      {[[-0.18, 0.5], [0.18, 0.5], [-0.18, -0.5], [0.18, -0.5]].map(([x, z], i) => <group key={i} position={[x, 0.6, z]} rotation={[t * (i % 2 ? 0.5 : -0.4), 0, 0]}><Bx p={[0, -0.3, 0]} s={[0.08, 0.6, 0.08]} c="#9a7a4a" /></group>)}
    </group>
  </group>; };
export const Herd = ({n = 40, frame = 0, area = [40, 30], center = [0, -6], seed = 5, fallAt = null, fallLen = 40, still = false, calves = 0.15}) => {
  const A = useMemo(() => { const r = rng(seed); return Array.from({length: n}, (_, i) => ({x: center[0] + (r() - 0.5) * area[0], z: center[1] + (r() - 0.5) * area[1], rot: r() * 6.28, calf: r() < calves, o: r()})); }, [n, seed]);
  return <group>{A.map((a, i) => { const ft = fallAt == null ? 0 : clamp01((frame - fallAt - a.o * fallLen) / 14); return <SaigaAnimal key={i} position={[a.x, height(a.x, a.z), a.z]} rotation={a.rot} scale={1.7} frame={frame} seed={i} calf={a.calf} fallT={ft} still={still || (fallAt != null && frame > fallAt - 20)} />; })}</group>; };
export const Camp = () => <group position={[-8, 0, 2]}>{[[0, 0], [3.2, 0.8]].map(([x, z], i) => <group key={i} position={[x, height(-8 + x, 2 + z), z]}>
  <mesh position={[0, 0.8, 0]}><coneGeometry args={[1.6, 1.6, 4]} /><meshLambertMaterial color={i ? '#e8e2cc' : '#6a8a5a'} flatShading /></mesh></group>)}
  <Bx p={[-3, height(-11, 2) + 0.6, 0]} s={[1.0, 0.8, 2.2]} c="#c8c8c0" /><Bx p={[-3, height(-11, 2) + 1.4, -0.2]} s={[0.05, 1.6, 0.05]} c="#444" /></group>;
export { Tree };
