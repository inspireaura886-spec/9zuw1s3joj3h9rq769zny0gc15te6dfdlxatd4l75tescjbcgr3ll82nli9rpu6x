// "Three Men Vanished. Dinner Was Laid." (Kaz II, April 2007) - NOIR look (remotion/src/noir/NoirKit.jsx), 28 scenes on cues.json cuts.
// Facts on screen come from sources.txt only (S1 Wikipedia KAZ II, S2 BBC 2007). No people shown in distress, no invented quotes/body copy.
import {useMemo} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import * as THREE from 'three';
import {ShotCam, WordCaption, FontFaces, Dip, Particles, Post, usePreload, GrabProp, grabPaths, LightCone} from '../../kit/index.js';
import {softTexture} from '../../kit/Sky.jsx';
import {hash2} from '../../kit/noise.js';
import {NOIR, NoirStage, Silhouette, HangingBulb, FogWall, NoirFinish, NoirTitle, NoirFonts, NoirRain, LightPool, flicker} from '../../../noir/NoirKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const KZ_FRAMES = Math.round(50.9 * FPS);
const W = VO.words;
const CS = [0.0, 1.52, 3.06, 4.48, 6.34, 7.9, 9.42, 10.76, 11.76, 13.7, 15.22, 16.64, 17.88, 19.38, 20.7, 22.54, 24.22, 26.36, 28.18, 29.77, 31.48, 33.58, 34.82, 36.93, 38.94, 41.0, 43.98, 47.4];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? KZ_FRAMES) - C[i];
const loc = (s, i) => Math.max(0, at(s) - C[i]);
const PROPS = ['old-radio'];

const Glow = ({p, s = 1, c = NOIR.cold, o = 0.6}) => <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={softTexture()} color={c} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} /></sprite>;
const Box = ({p, s, c = '#0b0c0f', r = [0, 0, 0], rough = 0.7, metal = 0}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={rough} metalness={metal} /></mesh>;
const Lit = ({p, s, c = '#ffffff', r = [0, 0, 0], o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><meshBasicMaterial color={c} toneMapped={false} transparent={o < 1} opacity={o} /></mesh>;
const Cyl = ({p, r = 0.1, h = 0.1, c = '#ccc', rot = [0, 0, 0], seg = 16, rough = 0.5, metal = 0, em}) => <mesh position={p} rotation={rot}><cylinderGeometry args={[r, r, h, seg]} /><meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={em || '#000'} emissiveIntensity={em ? 0.5 : 0} /></mesh>;
const cam = (from, to, look, d, fov = [44, 38], ease = 'inout', drift = 0.03, extra = {}) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={Math.max(2, d - 1)} ease={ease} drift={drift} {...extra} />;
const Spot = ({position, target, angle = 0.5, intensity = 9, distance = 8, color = '#fff2d2'}) => { const tgt = useMemo(() => new THREE.Object3D(), []); return <><primitive object={tgt} position={target} /><spotLight position={position} target={tgt} angle={angle} penumbra={0.7} intensity={intensity} distance={distance} decay={1.2} color={color} /></>; };

// flat expanding rings (ripples / wake)
const Pulse = ({position = [0, 0, 0], f = 0, color = '#9cc0ff', max = 8, n = 4, period = 60, o = 0.7, thick = 0.035}) => <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
  {Array.from({length: n}, (_, i) => { const t = ((f / period + i / n) % 1); const r = 0.3 + t * max;
    return <mesh key={i} scale={[r, r, 1]}><ringGeometry args={[1 - thick, 1, 48]} /><meshBasicMaterial color={color} transparent opacity={o * (1 - t) * Math.min(1, t * 6)} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></mesh>; })}
</group>;

// ---------- night sea ----------
const Sea = ({f = 0, y = 0, n = 34, spread = 40, moon = true, moonPos = [-10, 12, -60]}) => <>
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[160, 160]} /><meshStandardMaterial color="#04080d" roughness={0.3} metalness={0.45} /></mesh>
  {Array.from({length: n}, (_, i) => { const x = (hash2(i, 1, 7) - 0.5) * spread; const z0 = (hash2(i, 2, 7) - 0.5) * spread - 6; const z = ((z0 + f * 0.012 * (1 + hash2(i, 3, 7)) + 30) % 60) - 30 - 6;
    return <mesh key={i} position={[x, y + 0.02, z]}><boxGeometry args={[1.2 + hash2(i, 4, 7) * 2.4, 0.02, 0.05]} /><meshBasicMaterial color="#2c4156" toneMapped={false} transparent opacity={0.55} /></mesh>; })}
  {moon && <><Glow p={moonPos} s={34} c="#9cb4e0" o={0.5} /><mesh position={moonPos}><circleGeometry args={[2.4, 24]} /><meshBasicMaterial color="#dfe8f8" toneMapped={false} fog={false} /></mesh></>}
</>;

// ---------- the catamaran: bow +z, stern -z, waterline y=0 ----------
const Tri = ({pts, color = '#c9ced4', em = '#10151b', rot = [0, 0, 0], position = [0, 0, 0]}) => {
  const geo = useMemo(() => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => s.lineTo(p[0], p[1])); return new THREE.ShapeGeometry(s); }, [JSON.stringify(pts)]);
  return <mesh geometry={geo} position={position} rotation={rot}><meshStandardMaterial color={color} emissive={em} emissiveIntensity={0.6} side={THREE.DoubleSide} roughness={0.9} /></mesh>;
};
const Cat = ({position = [0, 0, 0], rotation = 0, f = 0, sail = 'torn', lights = true, s = 1}) => {
  const bob = Math.sin(f * 0.07) * 0.05, roll = Math.sin(f * 0.05) * 0.015;
  return <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotation, roll]} scale={s}>
    {[-1.5, 1.5].map((x) => <mesh key={x} position={[x, 0.15, 0]} scale={[0.55, 0.5, 5.6]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color="#9aa3ad" roughness={0.45} metalness={0.2} /></mesh>)}
    <Box p={[0, 0.78, 0]} s={[4.0, 0.14, 7.2]} c="#6c747d" />
    <Box p={[0, 0.8, 3.5]} s={[2.9, 0.03, 2.2]} c="#0a0d10" />
    <Box p={[0, 1.38, -0.2]} s={[3.0, 1.0, 3.6]} c="#848d96" rough={0.5} />
    <Box p={[0, 1.95, -0.2]} s={[3.2, 0.1, 3.9]} c="#58616a" />
    {lights && [-1.5, 1.5].map((x) => <Lit key={x} p={[x * 1.001, 1.5, 0.9]} s={[0.02, 0.4, 1.4]} c="#ffcf8a" />)}
    {lights && <Glow p={[0, 1.5, -0.2]} s={4} c="#ffcf8a" o={0.18} />}
    <Cyl p={[0, 5.0, 1.1]} r={0.06} h={9.2} c="#aeb6bf" metal={0.5} />
    <Box p={[0, 2.35, -0.9]} s={[0.07, 0.07, 3.8]} c="#aeb6bf" />
    {sail === 'up' && <Tri pts={[[0, 0], [3.6, 0], [0, 8]]} position={[0, 2.4, 1.0]} rot={[0, Math.PI / 2, 0]} />}
    {sail === 'torn' && [0, 1, 2, 3].map((i) => <Tri key={i} pts={[[0, 0], [0.22 + 0.1 * i, -1.5 - i * 0.8], [-0.2, -2.2 - i * 0.6]]} color="#b4bac2" position={[0.0, 5.5 - i * 0.9, -0.6 - i * 0.55]} rot={[Math.sin(f * 0.12 + i * 1.7) * 0.35, Math.PI / 2 + Math.sin(f * 0.1 + i) * 0.5, Math.sin(f * 0.15 + i * 2.3) * 0.4]} />)}
    {[-1.9, 1.9].map((x) => <Box key={x} p={[x, 1.1, -3.4]} s={[0.04, 0.5, 0.04]} c="#aeb6bf" />)}
    <Glow p={[0, 5.0, 1.1]} s={0.6} c="#ffffff" o={0.6} />
    <directionalLight position={[-6, 9, 7]} intensity={1.5} color="#a9c0e8" />
  </group>;
};

// ---------- cabin interior (frame-0 set) ----------
const Cabin = ({f = 0, flash = 0, rain = true}) => {
  const k = flicker(f, 3, 0.1);
  return <>
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8, 8]} /><meshStandardMaterial color="#2a1f17" roughness={0.5} metalness={0.15} /></mesh>
    <Box p={[0, 1.5, -2.0]} s={[8, 3, 0.1]} c="#3b2d22" rough={0.8} />
    <Box p={[-2.6, 1.5, 0]} s={[0.1, 3, 8]} c="#2f241b" rough={0.8} />
    <Box p={[2.9, 1.5, 0]} s={[0.1, 3, 8]} c="#2f241b" rough={0.8} />
    {[-1.5, -0.5, 0.5, 1.5].map((x) => <Box key={x} p={[x * 1.4, 1.5, -1.94]} s={[0.04, 3, 0.03]} c="#1c140e" />)}
    <Box p={[-2.35, 0.45, -0.6]} s={[0.5, 0.9, 3]} c="#241a13" />
    {/* porthole */}
    <group position={[1.15, 1.75, -1.93]}>
      <mesh><circleGeometry args={[0.36, 24]} /><meshBasicMaterial color={flash > 0.5 ? '#dfe8ff' : '#16222f'} toneMapped={false} /></mesh>
      <mesh position={[0, 0, 0.02]}><torusGeometry args={[0.37, 0.04, 8, 28]} /><meshStandardMaterial color="#6d737a" metalness={0.7} roughness={0.35} /></mesh>
      {rain && Array.from({length: 9}, (_, i) => { const x = (hash2(i, 1, 5) - 0.5) * 0.5; const y = 0.3 - (((f * (0.011 + 0.006 * hash2(i, 2, 5))) + hash2(i, 3, 5)) % 1) * 0.6;
        return <Lit key={i} p={[x, y, 0.012]} s={[0.012, 0.07, 0.002]} c="#b8d2ff" o={0.8} />; })}
      <Glow p={[0, 0, 0.3]} s={1.8} c="#6f9bd8" o={0.2 + flash * 0.4} />
    </group>
  </>;
};
const Chair = ({p, rot = 0, c = '#241a12'}) => <group position={p} rotation={[0, rot, 0]}>
  <Box p={[0, 0.45, 0]} s={[0.46, 0.06, 0.46]} c={c} />
  <Box p={[0, 0.85, -0.2]} s={[0.46, 0.8, 0.05]} c={c} />
  {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => <Box key={i} p={[x, 0.22, z]} s={[0.04, 0.44, 0.04]} c={c} />)}
</group>;
const Table = ({f = 0, laptop = true, plates = 3}) => {
  const k = flicker(f, 5, 0.1);
  return <group>
    <Box p={[0, 0.78, 0]} s={[2.4, 0.06, 1.1]} c="#3a2a1d" rough={0.4} />
    {[[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].map(([x, z], i) => <Box key={i} p={[x, 0.39, z]} s={[0.07, 0.78, 0.07]} c="#1f160f" />)}
    {Array.from({length: plates}, (_, i) => { const x = (i - (plates - 1) / 2) * 0.72;
      return <group key={i} position={[x, 0.82, 0.22]}>
        <Cyl p={[0, 0, 0]} r={0.17} h={0.025} c="#dcdfe3" rough={0.3} em="#3a4048" />
        <mesh position={[0.02, 0.035, 0]} scale={[1, 0.5, 1]}><sphereGeometry args={[0.08, 10, 8]} /><meshStandardMaterial color="#6b4a2a" roughness={0.8} /></mesh>
        <Box p={[-0.26, 0, 0.02]} s={[0.018, 0.012, 0.19]} c="#c9ccd2" metal={0.8} rough={0.25} />
        <Box p={[0.26, 0, 0.02]} s={[0.018, 0.012, 0.19]} c="#c9ccd2" metal={0.8} rough={0.25} />
        <Cyl p={[0.2, 0.09, -0.24]} r={0.04} h={0.16} c="#9fb4c8" rough={0.1} em="#223040" />
      </group>; })}
    {laptop && <group position={[0, 0.81, -0.28]}>
      <Box p={[0, 0.015, 0]} s={[0.52, 0.03, 0.36]} c="#15171a" metal={0.6} rough={0.3} />
      <group position={[0, 0.03, -0.17]} rotation={[-0.28, 0, 0]}>
        <Box p={[0, 0.18, 0]} s={[0.52, 0.36, 0.02]} c="#15171a" metal={0.6} rough={0.3} />
        <Lit p={[0, 0.18, 0.012]} s={[0.47, 0.31, 0.002]} c="#a7c4f0" />
        {[0.08, 0.02, -0.04, -0.1].map((y, i) => <Lit key={i} p={[-0.09 + i * 0.02, 0.18 + y, 0.014]} s={[0.22 - i * 0.03, 0.018, 0.001]} c="#e8f0ff" />)}
      </group>
      <Glow p={[0, 0.25, 0.25]} s={1.5} c="#9cc0ff" o={0.35 * k} />
      <pointLight position={[0, 0.35, 0.3]} intensity={2.4 * k} distance={5} decay={1.5} color="#9cc0ff" />
    </group>}
  </group>;
};
const Chairs3 = ({z = -0.95}) => <>{[-0.72, 0, 0.72].map((x, i) => <Chair key={i} p={[x, 0, z]} rot={Math.PI} />)}</>;
const Jackets = ({f = 0, x0 = 0, y = 1.4, z = -1.85, n = 5, c = '#b5541f'}) => <group position={[x0, y, z]}>
  <Box p={[0, 0.5, -0.04]} s={[n * 0.5 + 0.3, 0.06, 0.06]} c="#aeb6bf" metal={0.6} />
  {Array.from({length: n}, (_, i) => <group key={i} position={[(i - (n - 1) / 2) * 0.5, 0, 0]} rotation={[0, 0, Math.sin(f * 0.04 + i) * 0.03]}>
    <Box p={[-0.1, 0, 0]} s={[0.18, 0.7, 0.12]} c={c} rough={0.9} /><Box p={[0.1, 0, 0]} s={[0.18, 0.7, 0.12]} c={c} rough={0.9} /><Box p={[0, 0.3, 0]} s={[0.12, 0.1, 0.1]} c="#4a2410" />
    <Lit p={[0, 0, 0.065]} s={[0.4, 0.03, 0.003]} c="#d8d2c0" />
  </group>)}
</group>;

// ---------- deck set (open deck beside the cabin wall) ----------
const Deck = ({f = 0, rail = true}) => <>
  <Box p={[0, -0.05, 0]} s={[5.5, 0.1, 9]} c="#5b636b" rough={0.6} metal={0.2} />
  <Box p={[0, 1.0, -2.6]} s={[4.4, 2.0, 0.12]} c="#7a838c" rough={0.5} />
  <Box p={[-2.2, 0.55, 0.4]} s={[0.1, 0.1, 6]} c="#58616a" />
  {rail && [-2.2, 2.2].map((x) => [-1.6, 0, 1.6, 3.2].map((z, i) => <Box key={x + '_' + i} p={[x, 0.3, z]} s={[0.05, 0.6, 0.05]} c="#aeb6bf" metal={0.6} />))}
  {rail && [-2.2, 2.2].map((x) => <Box key={x} p={[x, 0.6, 0.8]} s={[0.04, 0.04, 6.4]} c="#aeb6bf" metal={0.6} />)}
  <Box p={[0, 0.3, -0.2]} s={[1.5, 0.6, 0.9]} c="#4a3a2c" /><Chair p={[-1.3, 0, -0.2]} rot={1.57} c="#3a2c20" /><Chair p={[1.3, 0, -0.4]} rot={-1.57} c="#3a2c20" />
  <Lit p={[1.5, 1.3, -2.53]} s={[0.7, 0.45, 0.01]} c="#ffcf8a" /><Glow p={[1.5, 1.3, -2.3]} s={3} c="#ffcf8a" o={0.3} />
  <Cyl p={[0.2, 0.64, -0.1]} r={0.05} h={0.09} c="#cfd3d8" em="#333" /><Cyl p={[-0.3, 0.62, 0.0]} r={0.14} h={0.02} c="#dcdfe3" em="#333" />
</>;

// ---------- helicopter silhouette ----------
const Heli = ({position = [0, 9, -14], f = 0, rotation = 0}) => <group position={position} rotation={[0, rotation, 0]}>
  <mesh scale={[0.5, 0.45, 1.25]}><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#060708" roughness={0.6} /></mesh>
  <Box p={[0, 0.05, -1.9]} s={[0.12, 0.14, 2.0]} c="#060708" /><Box p={[0.05, 0.3, -2.9]} s={[0.04, 0.5, 0.3]} c="#060708" />
  <group position={[0, 0.5, 0]} rotation={[0, f * 1.3, 0]}><Box p={[0, 0, 0]} s={[5.2, 0.025, 0.14]} c="#070809" /><Box p={[0, 0, 0]} s={[0.14, 0.025, 5.2]} c="#070809" /></group>
  <Lit p={[0, -0.4, 1.0]} s={[0.15, 0.1, 0.15]} c="#fff2d2" /><Glow p={[0, -0.4, 1.0]} s={1.2} c="#fff2d2" o={0.9} />
  <Glow p={[0.55, 0, 0]} s={0.5} c={NOIR.red} o={Math.floor(f / 15) % 2 ? 1 : 0.1} />
</group>;

// ---------- scene wrapper ----------
const Scene = ({bg, title, ty, sub, subAt = 0, seed = 1, density = 0.04, ambient = 0.34, fog, flash = 0, over, children}) => {
  const f = useCurrentFrame();
  return <NoirStage density={density} ambient={ambient} bg={bg} fogColor={fog} overlay={<>
    {title && <NoirTitle y={ty || 240} lines={title} sub={sub} subAt={subAt} />}
    {over && over(f)}
    <NoirFinish seed={seed} />
    {flash > 0 && f < 5 && <AbsoluteFill style={{background: '#fff', opacity: flash * (1 - f / 5)}} />}
  </>}>{children(f)}<Post bloom={1.25} threshold={0.42} vignette={0.5} /></NoirStage>;
};
const BG_CAB = 'radial-gradient(ellipse at 50% 45%, #1c2430 0%, #07090d 70%)';
const BG_SEA = 'linear-gradient(180deg,#05080d 0%,#142030 100%)';
const BG_SEA2 = 'linear-gradient(180deg,#06090e 0%,#1b2a3c 100%)';
const Dust = ({f, center = [0, 1.4, 0.6], area = [3, 2, 2.4], color = '#cfe0ff'}) => <Particles kind="dust" count={110} center={center} area={area} frame={f} color={color} size={0.012} opacity={0.6} />;

const S = [];
const POSE0 = {from: [0.55, 1.5, 2.3], to: [0.05, 1.12, 1.2], look: [[0, 0.95, 0], [0, 0.98, -0.2]]};
// 0 FRAME 0: laid table + laptop glow + 3 empty chairs, rain on the porthole
S[0] = () => { const d = dur(0); return <Scene seed={1} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: '3 MEN GONE.', at: 0, size: 100}, {text: 'DINNER LAID.', at: 8, red: true, size: 92}]}>{(f) => <>
  {cam(POSE0.from, POSE0.to, POSE0.look, d, [46, 38], 'out', 0.02)}
  <Cabin f={f} /><Table f={f} /><Chairs3 /><Dust f={f} />
</>}</Scene>; };
// 1 yacht, engine running: catamaran adrift in moonlight, wake rings from the stern
S[1] = () => { const d = dur(1); return <Scene seed={2} bg={BG_SEA} density={0.03} title={[{text: 'ENGINE', at: 0, size: 100}, {text: 'RUNNING.', at: 8, red: true, size: 104}]}>{(f) => <>
  {cam([10, 3.4, 17], [7.5, 2.9, 14], [[0, 3, 0], [0, 3.2, 0]], d, [48, 42], 'inout', 0.03)}
  <Sea f={f} /><Cat position={[0, 0, 0]} rotation={0.35} f={f} sail="up" />
  <Pulse position={[-1.6, 0.03, -4.8]} f={f} max={3} n={3} period={34} color="#9cc0ff" o={0.6} /><FogWall position={[0, 1, -10]} width={30} height={5} frame={f} opacity={0.2} />
</>}</Scene>; };
// 2 dinner on the table: top-ish close on plates
S[2] = () => { const d = dur(2); return <Scene seed={3} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'DINNER', at: 0, size: 104}, {text: 'ON THE TABLE.', at: 7, red: true, size: 84}]}>{(f) => <>
  {cam([-0.6, 1.5, 1.4], [0.5, 1.15, 1.0], [[0, 0.8, 0.2], [0.3, 0.82, 0.2]], d, [50, 40], 'inout', 0.03)}
  <Cabin f={f} /><Table f={f} /><Chairs3 /><Dust f={f} />
</>}</Scene>; };
// 3 April 2007
S[3] = () => { const d = dur(3); return <Scene seed={4} bg={BG_SEA2} density={0.03} title={[{text: 'APRIL', at: 0, size: 112}, {text: '2007.', at: loc(5.07, 3) - 6, red: true, size: 130}]} sub="KAZ II · GREAT BARRIER REEF" subAt={26}>{(f) => <>
  {cam([0, 3.2, 14], [0, 2.6, 11], [[0, 1.0, 0], [0, 1.0, 0]], d, [46, 42], 'inout', 0.03)}
  <Sea f={f} moonPos={[8, 11, -60]} /><Cat position={[3, 0, -12]} rotation={0.9} f={f} sail="up" /><FogWall position={[0, 0.8, -20]} width={36} height={4} frame={f} opacity={0.3} />
</>}</Scene>; };
// 4 three neighbours from Perth: three silhouettes on a pier, lamp
S[4] = () => { const d = dur(4); return <Scene seed={5} bg={BG_SEA} density={0.04} title={[{text: 'THREE NEIGHBOURS', at: 0, size: 70}, {text: 'FROM PERTH.', at: loc(7.02, 4), red: true, size: 100}]}>{(f) => <>
  {cam([-1.5, 1.4, 6.6], [0.6, 1.5, 4.4], [[0, 1.4, -2], [0, 1.4, -2]], d, [48, 42], 'inout', 0.03)}
  <Sea f={f} y={-0.5} /><Box p={[0, -0.1, -2]} s={[5, 0.2, 14]} c="#20252b" />
  {[-1.5, 0, 1.5].map((q) => <Box key={q} p={[q * 1.5, 0.4, -2]} s={[0.1, 1, 0.1]} c="#14171a" />)}
  <Box p={[2.0, 1.6, -4]} s={[0.06, 3.2, 0.06]} c="#0b0c0e" /><Lit p={[2.0, 3.25, -4]} s={[0.3, 0.14, 0.3]} c="#ffcf8a" /><Glow p={[2.0, 3.25, -4]} s={3} c="#ffcf8a" o={0.7} /><pointLight position={[1.4, 3.1, -3.4]} intensity={4} distance={9} decay={1.4} color="#ffcf8a" />
  {[[-0.9, 0.35], [0, 0], [0.9, 0.35]].map(([x, z], i) => <Silhouette key={i} position={[x, 0, -1.6 + z]} rotation={0.2 - i * 0.2} pose="stand" hat={false} rim="#ffcf8a" rimK={1.5} rimSide={[1, 0.5, -0.4]} phase={f * 0.1 + i * 2} />)}
  <FogWall position={[0, 1.2, -10]} width={24} height={5} frame={f} opacity={0.22} />
</>}</Scene>; };
// 5 the catamaran Kaz II at her mooring: side-on, name card
S[5] = () => { const d = dur(5); return <Scene seed={6} bg={BG_SEA} density={0.035} title={[{text: 'THE CATAMARAN', at: 0, size: 80}, {text: 'KAZ II.', at: loc(8.4, 5), red: true, size: 130}]}>{(f) => <>
  {cam([-16, 2.8, 5], [-13, 3.0, 6.5], [[0, 3.2, 0], [0, 3.2, 0]], d, [50, 44], 'inout', 0.03)}
  <Sea f={f} moonPos={[14, 12, -50]} /><Cat position={[0, 0, 0]} rotation={0} f={f} sail="up" />
  <Pulse position={[0, 0.03, 0]} f={f} max={6} n={3} period={50} color="#9cc0ff" o={0.35} />
</>}</Scene>; };
// 6 out of Airlie Beach: the boat sails away from the pier lamps
S[6] = () => { const d = dur(6); return <Scene seed={7} bg={BG_SEA} density={0.035} title={[{text: 'OUT OF', at: 0, size: 92}, {text: 'AIRLIE BEACH.', at: loc(9.86, 6), red: true, size: 92}]}>{(f) => { const z = interpolate(f, [0, d], [-4, -22]); return <>
  {cam([4, 3.2, 11], [3, 3.0, 8.5], [[0, 2.5, -10], [0, 2.5, -14]], d, [48, 42], 'inout', 0.03)}
  <Sea f={f} /><Cat position={[0, 0, z]} rotation={Math.PI} f={f} sail="up" />
  {[-3, 0, 3].map((x, i) => <group key={i}><Box p={[x * 3.2, 1.5, 5]} s={[0.05, 3, 0.05]} c="#0b0c0e" /><Lit p={[x * 3.2, 3.05, 5]} s={[0.22, 0.1, 0.22]} c="#ffcf8a" /><Glow p={[x * 3.2, 3.05, 5]} s={2.4} c="#ffcf8a" o={0.7} /></group>)}
  <Pulse position={[0, 0.03, z + 3]} f={f} max={4} n={3} period={30} color="#9cc0ff" o={0.5} />
</>; }}</Scene>; };
// 7 Australia: coastline lights far off, small boat
S[7] = () => { const d = dur(7); return <Scene seed={8} bg={BG_SEA2} density={0.03} title={[{text: 'AUSTRALIA.', at: 0, size: 112, red: true}]}>{(f) => <>
  {cam([0, 2.5, 12], [0, 2.3, 8.5], [[0, 1.2, -20], [0, 1.2, -20]], d, [50, 44], 'out', 0.03)}
  <Sea f={f} />
  {Array.from({length: 26}, (_, i) => <Glow key={i} p={[-18 + i * 1.4 + hash2(i, 1, 3) * 0.6, 0.5 + hash2(i, 2, 3) * 0.7, -34]} s={0.8 + hash2(i, 3, 3)} c={NOIR.amber} o={0.5 + 0.4 * hash2(i, 4, 3)} />)}
  <Cat position={[3, 0, -6]} rotation={1.2} f={f} sail="up" /><FogWall position={[0, 1.5, -30]} width={50} height={5} frame={f} opacity={0.25} />
</>}</Scene>; };
// 8 helicopter spots her: heli above with a searchlight cone sweeping the boat
S[8] = () => { const d = dur(8); return <Scene seed={9} bg={BG_SEA2} density={0.03} title={[{text: 'A HELICOPTER', at: 0, size: 76}, {text: 'SPOTS HER.', at: loc(12.18, 8), red: true, size: 100}]}>{(f) => { const hx = interpolate(f, [0, d], [-5, 3]); const tx = interpolate(f, [0, d], [-2, 0.5]); return <>
  {cam([4, 2.0, 17], [2, 3.0, 14], [[0, 5, -3], [0, 3.5, -3]], d, [52, 46], 'inout', 0.04)}
  <Sea f={f} /><Cat position={[0, 0, -3]} rotation={0.5} f={f} sail="up" />
  <Heli position={[hx, 8.5, 1]} f={f} rotation={0.3} />
  <LightCone position={[hx, 8.0, 2]} dir={[tx - hx, -8.0, -5 - 2]} length={11} radius={2.2} color="#fff2d2" opacity={0.5} frame={f} />
  <LightPool position={[tx, 0.03, -3]} radius={2.4} color="#fff2d2" opacity={0.6} />
  <FogWall position={[0, 1.2, -14]} width={30} height={5} frame={f} opacity={0.22} />
</>; }}</Scene>; };
// 9 Great Barrier Reef: high, pale reef patches in dark water around the drifting boat
S[9] = () => { const d = dur(9); return <Scene seed={10} bg={BG_SEA2} density={0.02} title={[{text: 'GREAT BARRIER', at: 0, size: 78}, {text: 'REEF.', at: loc(14.26, 9) - 3, red: true, size: 120}]}>{(f) => <>
  {cam([0, 21, 13], [0, 17, 9], [[0, 0, -2], [0, 0, -2]], d, [48, 44], 'inout', 0.02)}
  <Sea f={f} n={20} moon={false} />
  {Array.from({length: 18}, (_, i) => <mesh key={i} position={[(hash2(i, 1, 4) - 0.5) * 24, 0.03, (hash2(i, 2, 4) - 0.5) * 20 - 6]} rotation={[-Math.PI / 2, 0, hash2(i, 5, 4) * 3]} scale={[1.2 + hash2(i, 3, 4) * 2.4, 0.7 + hash2(i, 6, 4) * 1.2, 1]}><circleGeometry args={[1, 16]} /><meshBasicMaterial color="#2f6f74" transparent opacity={0.35 + 0.15 * hash2(i, 4, 4)} toneMapped={false} /></mesh>)}
  <Cat position={[0, 0, -2]} rotation={0.9} f={f} sail="up" />
  <Heli position={[-2 + f * 0.04, 12, 4]} f={f} rotation={1.1} />
</>}</Scene>; };
// 10 rescuers board: two silhouettes climbing aboard at the stern ladder, torch beam
S[10] = () => { const d = dur(10); return <Scene seed={11} bg={BG_SEA} density={0.04} title={[{text: 'RESCUERS', at: 0, size: 100}, {text: 'BOARD.', at: loc(15.72, 10), red: true, size: 120}]}>{(f) => { const t = Math.min(1, f / (d - 6)); return <>
  {cam([-5, 2.2, -11.5], [-3, 1.9, -9.2], [[0, 1.4, -3.8], [0, 1.4, -3.8]], d, [50, 44], 'inout', 0.03)}
  <Sea f={f} /><Cat position={[0, 0, 0]} rotation={0} f={f} sail="up" />
  <Box p={[0.3, 0.45, -3.75]} s={[0.05, 0.9, 0.05]} c="#aeb6bf" metal={0.6} /><Box p={[0.9, 0.45, -3.75]} s={[0.05, 0.9, 0.05]} c="#aeb6bf" metal={0.6} />
  <Silhouette position={[0.6, 0.85, -3.2]} rotation={Math.PI} pose="walk" phase={f * 0.2} hat={false} scale={0.9} rim="#cfe0ff" rimK={1.6} rimSide={[0.4, 0.4, 0.6]} />
  <Spot position={[0.6, 2.4, -5.2]} angle={0.4} intensity={10} distance={9} color="#fff2d2" target={[0, 0.8, 0.4]} />
  <Glow p={[0.6, 2.4, -5.0]} s={0.7} c="#fff2d2" o={0.4} />
  <Pulse position={[0.6, 0.03, -5.6]} f={f} max={3} n={3} period={50} color="#9cc0ff" o={0.4} />
</>; }}</Scene>; };
// 11 engine running: stern from behind, churning water, exhaust mist, red engine light
S[11] = () => { const d = dur(11); return <Scene seed={12} bg={BG_SEA} density={0.04} title={[{text: 'ENGINE', at: 0, size: 100}, {text: 'STILL RUNNING.', at: 7, red: true, size: 84}]}>{(f) => <>
  {cam([3, 2.4, -12.5], [1.5, 2.1, -10], [[0, 1.2, -4], [0, 1.2, -4]], d, [50, 44], 'inout', 0.03)}
  <Sea f={f} /><Cat position={[0, 0, 0]} rotation={0} f={f} sail="up" lights={false} />
  <Lit p={[-1.5, 0.35, -5.62]} s={[0.22, 0.12, 0.02]} c="#ff5a40" /><Glow p={[-1.5, 0.35, -5.7]} s={1.4} c="#ff5a40" o={0.55 * flicker(f, 4, 0.3)} />
  <Pulse position={[-1.5, 0.03, -6.2]} f={f} max={4.5} n={4} period={26} color="#bcd4ff" o={0.7} /><Pulse position={[1.5, 0.03, -6.2]} f={f + 9} max={4.5} n={4} period={26} color="#bcd4ff" o={0.7} />
  <FogWall position={[0, 0.9, -9]} width={12} height={2.4} frame={f} opacity={0.3} />
</>}</Scene>; };
// 12 TWIST: empty deck, wheel turning gently, flash
S[12] = () => { const d = dur(12); return <Scene seed={13} flash={0.8} bg={BG_SEA} density={0.05} title={[{text: 'NOBODY', at: 0, size: 120}, {text: 'ABOARD.', at: 5, red: true, size: 130}]}>{(f) => <>
  {cam([0.3, 1.7, 4.6], [0.0, 1.55, 3.2], [[0, 0.8, -1.5], [0, 0.8, -1.5]], d, [50, 42], 'out', 0.03, {shake: 0.1, shakeFrom: 0, shakeLen: 12})}
  <Deck f={f} /><Sea f={f} y={-0.6} />
  <Spot position={[1.8, 2.8, 2.6]} angle={0.7} intensity={8} distance={10} color="#cfe0ff" target={[0, 0.5, -1]} /><Dust f={f} center={[0, 1.2, -0.5]} area={[3, 2, 3]} />
  <FogWall position={[0, 1.2, -6]} width={14} height={3.5} frame={f} opacity={0.26} />
</>}</Scene>; };
// 13 a laptop is on: close on the glowing screen
S[13] = () => { const d = dur(13); return <Scene seed={14} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'A LAPTOP', at: 0, size: 96}, {text: 'IS ON.', at: loc(19.64, 13) - 2, red: true, size: 120}]}>{(f) => <>
  {cam([0.5, 1.2, 1.0], [0.1, 1.07, 0.4], [[0, 1.0, -0.28], [0, 1.0, -0.28]], d, [46, 36], 'ramp', 0.02)}
  <Cabin f={f} /><Table f={f} /><Chairs3 /><Dust f={f} />
</>}</Scene>; };
// 14 food and cutlery set out: low across the plates
S[14] = () => { const d = dur(14); return <Scene seed={15} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'FOOD. CUTLERY.', at: 0, size: 80}, {text: 'SET OUT.', at: loc(21.58, 14), red: true, size: 112}]}>{(f) => <>
  {cam([-1.4, 1.0, 1.4], [1.0, 1.0, 1.1], [[0, 0.85, 0.2], [0.2, 0.85, 0.2]], d, [48, 40], 'inout', 0.03)}
  <Cabin f={f} /><Table f={f} /><Chairs3 /><Dust f={f} />
</>}</Scene>; };
// 15 radio and GPS work: tube radio glowing + GPS screen with a moving dot
S[15] = () => { const d = dur(15); return <Scene seed={16} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'RADIO + GPS', at: 0, size: 92}, {text: 'WORK.', at: loc(23.44, 15), size: 120}]}>{(f) => <>
  {cam([0.0, 1.7, 3.9], [0.0, 1.55, 3.1], [[0, 1.45, 0], [0, 1.45, 0]], d, [48, 40], 'inout', 0.03)}
  <Cabin f={f} /><Box p={[0, 0.7, -0.2]} s={[2.6, 1.4, 0.8]} c="#2a2018" />
  <GrabProp name="old-radio" position={[-0.45, 1.4, -0.1]} height={0.45} rotation={[0, 0.25, 0]} />
  <Glow p={[-0.45, 1.6, 0.15]} s={0.9} c="#ffcf8a" o={0.3} />
  <group position={[0.45, 1.6, 0.15]}><Box p={[0, 0, 0]} s={[0.55, 0.4, 0.06]} c="#0e1013" metal={0.4} /><Lit p={[0, 0, 0.032]} s={[0.48, 0.33, 0.002]} c="#0f2a22" />
    {[-0.12, 0, 0.12].map((y, i) => <Lit key={i} p={[0, y, 0.034]} s={[0.46, 0.004, 0.001]} c="#2a6a54" />)}
    <Lit p={[Math.sin(f * 0.05) * 0.12, Math.cos(f * 0.05) * 0.08, 0.036]} s={[0.04, 0.04, 0.002]} c="#7dffb0" /><Glow p={[0, 0, 0.25]} s={0.6} c="#7dffb0" o={0.2} /></group>
  <Dust f={f} center={[0, 1.5, 0.6]} />
</>}</Scene>; };
// 16 life jackets still there: orange jackets on a rail
S[16] = () => { const d = dur(16); return <Scene seed={17} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'LIFE JACKETS', at: 0, size: 88}, {text: 'STILL THERE.', at: loc(25.14, 16), red: true, size: 100}]}>{(f) => <>
  {cam([-1.6, 1.6, 1.8], [0.2, 1.5, 1.0], [[0, 1.4, -1.85], [0, 1.4, -1.85]], d, [50, 42], 'inout', 0.03)}
  <Cabin f={f} rain={false} /><Jackets f={f} x0={-0.3} /><Spot position={[1.0, 2.6, 1.2]} angle={0.8} intensity={7} distance={7} color="#ffe2b0" target={[0, 1.4, -1.8]} /><Dust f={f} center={[0, 1.4, 0]} />
</>}</Scene>; };
// 17 shredded sail: rags of sail whipping against the mast, moon behind
S[17] = () => { const d = dur(17); return <Scene seed={18} bg={BG_SEA2} density={0.03} title={[{text: 'ONLY A', at: 0, size: 80}, {text: 'SHREDDED SAIL.', at: loc(26.52, 17), red: true, size: 92}]}>{(f) => <>
  {cam([-8, 5, 7], [-6.5, 5.2, 6], [[0, 5, -1], [0, 5, -1.2]], d, [52, 46], 'inout', 0.04)}
  <Sea f={f} /><Cat position={[0, 0, 0]} rotation={0} f={f * 1.6} sail="torn" /><Glow p={[-3, 8, -9]} s={14} c="#9cb4e0" o={0.5} />
  <FogWall position={[0, 3, -9]} width={24} height={6} frame={f} opacity={0.22} />
</>}</Scene>; };
// 18 missing life raft: empty cradle on the cabin roof
S[18] = () => { const d = dur(18); return <Scene seed={19} bg={BG_SEA2} density={0.035} title={[{text: 'LIFE RAFT', at: 0, size: 100}, {text: 'MISSING.', at: loc(28.18, 18) - 3, red: true, size: 120}]}>{(f) => <>
  {cam([-6, 4.8, 8], [-4.5, 4.2, 6.5], [[0, 2.1, -0.4], [0, 2.1, -0.4]], d, [50, 42], 'inout', 0.03)}
  <Sea f={f} /><Cat position={[0, 0, 0]} rotation={0} f={f} sail="up" />
  {[[-1.1, -1.6], [1.1, -1.6], [-1.1, 1.2], [1.1, 1.2]].map(([x, z], i) => <Box key={i} p={[x, 2.08, z]} s={[0.1, 0.12, 0.1]} c="#aeb6bf" metal={0.7} />)}
  <Box p={[0, 2.03, -0.2]} s={[2.4, 0.04, 2.9]} c="#1b2026" /><Spot position={[-2.6, 4.4, 3.4]} angle={0.5} intensity={9} distance={9} color="#cfe0ff" target={[0, 2, -0.2]} />
</>}</Scene>; };
// 19 coroner: report on a desk under a swinging bulb
S[19] = () => { const d = dur(19); return <Scene seed={20} bg="radial-gradient(ellipse at 50% 30%, #2a2320 0%, #07080a 75%)" density={0.05} title={[{text: 'THE CORONER', at: 0, size: 92}, {text: 'PROPOSES:', at: loc(30.52, 19) - 2, red: true, size: 100}]}>{(f) => <>
  {cam([0, 3.0, 4.6], [0, 2.1, 2.7], [[0, 0.8, 0], [0, 0.8, 0]], d, [48, 40], 'inout', 0.03)}
  <Box p={[0, 3, -1.6]} s={[14, 6, 0.1]} c="#14161b" /><Box p={[0, 0.7, 0]} s={[3.0, 0.1, 1.6]} c="#2a1f17" /><Box p={[0, 0.3, 0]} s={[2.8, 0.6, 1.4]} c="#17110c" />
  <Box p={[-0.5, 0.77, 0.1]} s={[0.9, 0.012, 0.65]} c="#e4dfcf" r={[0, 0.12, 0]} /><Box p={[0.55, 0.77, -0.1]} s={[0.8, 0.012, 0.6]} c="#d9d3c0" r={[0, -0.2, 0]} />
  {[0, 1, 2, 3].map((i) => <Lit key={i} p={[-0.7 + i * 0.12, 0.79, 0.1 - i * 0.04]} s={[0.4, 0.004, 0.012]} c="#4a443a" r={[0, 0.12, 0]} />)}
  <HangingBulb position={[0.2, 5.2, 0]} cable={2.6} amp={0.3} period={64} frame={f} seed={4} /><Dust f={f} center={[0, 2, 0.5]} area={[3, 3, 3]} color="#ffe6c0" />
</>}</Scene>; };
// 20 stern platform: fishing line trailing from the transom into the water, no person shown
S[20] = () => { const d = dur(20); return <Scene seed={21} bg={BG_SEA} density={0.04} title={[{text: 'FELL OFF', at: 0, size: 92}, {text: 'THE STERN.', at: loc(32.68, 20), size: 104}]} sub="CORONER'S THEORY" subAt={34}>{(f) => <>
  {cam([2.4, 1.4, -6.6], [0.9, 1.0, -5.4], [[-0.3, 0.2, -4.4], [-0.3, 0.1, -4.8]], d, [52, 44], 'inout', 0.03)}
  <Sea f={f} /><Cat position={[0, 0, 0]} rotation={0} f={f} sail="up" lights={false} />
  <Box p={[0, 0.35, -4.1]} s={[2.4, 0.06, 0.8]} c="#444c54" />
  <Cyl p={[-0.4, 0.62, -4.3]} r={0.015} h={0.9} c="#222" rot={[0.5, 0, 0.3]} />
  <mesh position={[-0.55, 0.12, -4.9]} rotation={[0.35, 0, 0.2]}><cylinderGeometry args={[0.004, 0.004, 1.15, 4]} /><meshBasicMaterial color="#cfe0ff" toneMapped={false} /></mesh>
  <Pulse position={[-0.7, 0.03, -5.4]} f={f} max={2.4} n={3} period={40} color="#9cc0ff" o={0.7} /><Spot position={[1.6, 2.2, -2.8]} angle={0.7} intensity={8} distance={8} color="#cfe0ff" target={[-0.3, 0.3, -4.4]} />
  <FogWall position={[0, 0.8, -12]} width={24} height={3} frame={f} opacity={0.25} />
</>}</Scene>; };
// 21 fishing lure: glinting lure tangled at the rudder
S[21] = () => { const d = dur(21); return <Scene seed={22} bg="linear-gradient(180deg,#05090e 0%,#0c1822 100%)" density={0.06} title={[{text: 'A FISHING', at: 0, size: 96}, {text: 'LURE.', at: loc(33.88, 21) - 2, red: true, size: 130}]}>{(f) => { const g = flicker(f, 6, 0.8); return <>
  {cam([0.25, 0.12, 1.9], [0.05, 0.03, 1.35], [[0, 0, 0], [0, 0, 0]], d, [44, 34], 'ramp', 0.02)}
  <Box p={[0, -0.5, -0.6]} s={[0.12, 1.8, 0.7]} c="#0e1317" metal={0.4} /><Box p={[0, 0.1, 0]} s={[0.06, 0.1, 0.06]} c="#1a1f24" />
  <group position={[0.02, 0, 0.1]} rotation={[0.3, 0.4, 0.8]}><mesh scale={[0.5, 0.11, 0.11]}><sphereGeometry args={[0.1, 14, 10]} /><meshStandardMaterial color="#c9d2dc" metalness={0.95} roughness={0.12} /></mesh>
    {[0.1, -0.1].map((x) => <mesh key={x} position={[x, -0.05, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}><torusGeometry args={[0.025, 0.004, 6, 12, Math.PI * 1.4]} /><meshStandardMaterial color="#d6dde4" metalness={0.9} roughness={0.2} /></mesh>)}</group>
  <Glow p={[0.05, 0.0, -0.3]} s={0.35} c="#cfe0ff" o={0.25 * g} />
  {[0, 1, 2].map((i) => <mesh key={i} position={[0.1 - i * 0.07, 0.05 - i * 0.09, 0]} rotation={[0, 0, 0.6 + i * 0.5]}><torusGeometry args={[0.06 + i * 0.02, 0.002, 4, 24, Math.PI * 1.5]} /><meshBasicMaterial color="#cfe0ff" toneMapped={false} /></mesh>)}
  <Spot position={[1.0, 1.0, 1.8]} angle={0.5} intensity={3} distance={5} color="#cfe0ff" target={[0, 0, 0]} /><Particles kind="dust" count={120} center={[0, 0.1, 0.4]} area={[1.6, 1.2, 1.4]} frame={f} color="#9cc0ff" size={0.012} opacity={0.5} />
</>; }}</Scene>; };
// 22 others drowned trying to save him: empty dark water, rings spread, a lifebuoy drifting (no people)
S[22] = () => { const d = dur(22); return <Scene seed={23} bg={BG_SEA2} density={0.04} title={[{text: 'THE OTHERS', at: 0, size: 92}, {text: 'TRIED TO HELP.', at: loc(35.42, 22), red: true, size: 90}]} sub="CORONER'S THEORY" subAt={4}>{(f) => <>
  {cam([0, 3.6, 7.5], [0, 2.4, 5.4], [[0, 0, -2], [0, 0, -2]], d, [50, 44], 'inout', 0.03)}
  <Sea f={f} />
  <Pulse position={[-1.4, 0.03, -2]} f={f} max={5} n={4} period={64} color="#9cc0ff" o={0.6} /><Pulse position={[1.2, 0.03, -3]} f={f + 20} max={4.5} n={3} period={72} color="#9cc0ff" o={0.45} />
  <mesh position={[0.3 + Math.sin(f * 0.04) * 0.2, 0.06, -1]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.09, 8, 20]} /><meshStandardMaterial color="#c8c2b4" emissive="#222" roughness={0.7} /></mesh>
  <Cat position={[-4, 0, -14]} rotation={0.8} f={f} sail="up" s={0.8} lights={false} /><FogWall position={[0, 0.8, -12]} width={30} height={3} frame={f} opacity={0.26} />
</>}</Scene>; };
// 23 REVEAL: police torch beam sweeping the empty deck
S[23] = () => { const d = dur(23); return <Scene seed={24} flash={0.9} bg={BG_SEA} density={0.05} title={[{text: 'NO SIGN OF', at: 0, size: 84}, {text: 'FOUL PLAY.', at: loc(38.06, 23), size: 116}]}>{(f) => { const sw = Math.sin(f * 0.07) * 1.1; return <>
  {cam([-0.9, 1.9, 4.6], [-0.4, 1.85, 3.6], [[0, 0.7, -2], [0, 0.7, -2]], d, [50, 42], 'inout', 0.03)}
  <Deck f={f} /><Sea f={f} y={-0.6} />
  <Silhouette position={[0.3, 0.0, 1.8]} rotation={Math.PI} pose="stand" scale={0.95} rim="#cfe0ff" rimK={1.5} rimSide={[-0.5, 0.4, 0.6]} phase={f * 0.1} />
  <Spot position={[0.55, 1.35, 1.5]} angle={0.28} intensity={14} distance={9} color="#fff2d2" target={[sw, 0.2, -2.5]} />
  <LightCone position={[0.55, 1.35, 1.5]} dir={[sw - 0.55, -1.15, -4.0]} length={5} radius={1.2} color="#fff2d2" opacity={0.4} frame={f} glow={false} />
  <Dust f={f} center={[0, 1.0, -0.5]} area={[3, 2, 4]} /><FogWall position={[0, 1.2, -6]} width={14} height={3.5} frame={f} opacity={0.24} />
</>; }}</Scene>; };
// 24 hung-out laundry: shirts on a line, swaying
S[24] = () => { const d = dur(24); return <Scene seed={25} bg={BG_SEA} density={0.045} title={[{text: 'LAUNDRY', at: 0, size: 100}, {text: 'HUNG OUT.', at: loc(40.7, 24) - 4, red: true, size: 110}]} sub="RELATIVES SAY" subAt={4}>{(f) => <>
  {cam([-2.6, 1.7, 3.2], [-0.6, 1.6, 2.0], [[0, 1.4, -1], [0, 1.4, -1]], d, [50, 42], 'inout', 0.03)}
  <Deck f={f} /><Sea f={f} y={-0.6} />
  <Box p={[-1.9, 1.2, -1]} s={[0.05, 2.4, 0.05]} c="#aeb6bf" metal={0.6} /><Box p={[1.9, 1.2, -1]} s={[0.05, 2.4, 0.05]} c="#aeb6bf" metal={0.6} /><Box p={[0, 2.2, -1]} s={[3.8, 0.012, 0.012]} c="#cfd3d8" />
  {[-1.3, -0.6, 0.1, 0.8, 1.4].map((x, i) => <group key={i} position={[x, 2.2, -1]} rotation={[0, 0, Math.sin(f * 0.07 + i * 1.3) * 0.12]}><Box p={[0, -0.32, 0]} s={[0.44, 0.62, 0.02]} c={['#7d8a99', '#a8a290', '#6f8aa0', '#9a9aa4', '#8b7a6a'][i]} rough={0.95} /></group>)}
  <Spot position={[-0.2, 3.2, 2.6]} angle={0.7} intensity={9} distance={9} color="#cfe0ff" target={[0, 1.6, -1]} /><Dust f={f} center={[0, 1.4, 0]} area={[4, 2, 3]} />
</>}</Scene>; };
// 25 stowed life jackets, no sudden storm: neat jackets on the cabin wall, calm porthole
S[25] = () => { const d = dur(25); return <Scene seed={26} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'JACKETS STOWED.', at: 0, size: 76}, {text: 'NO SUDDEN STORM.', at: loc(42.66, 25) - 12, red: true, size: 72}]}>{(f) => <>
  {cam([0.6, 1.5, 1.9], [-0.2, 1.4, 0.9], [[0, 1.4, -1.9], [0, 1.4, -1.9]], d, [50, 44], 'inout', 0.03)}
  <Cabin f={f * 0.3} /><Jackets f={f * 0.3} x0={-0.9} y={1.4} n={4} /><Box p={[1.0, 0.9, -1.78]} s={[1.0, 1.8, 0.1]} c="#2a2018" />
  <Spot position={[-0.6, 2.6, 1.4]} angle={0.8} intensity={7} distance={7} color="#ffe2b0" target={[-0.6, 1.4, -1.8]} /><Dust f={f} center={[0, 1.4, 0]} />
</>}</Scene>; };
// 26 question: three empty chairs, rain on the porthole, slow push
S[26] = () => { const d = dur(26); return <Scene seed={27} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'ONE FALL?', at: 0, size: 112}, {text: 'ALL THREE?', at: loc(45.02, 26), red: true, size: 112}]}>{(f) => <>
  {cam([0.8, 1.3, 2.9], [0.2, 1.15, 1.7], [[0, 0.9, -0.9], [0, 0.9, -0.9]], d, [48, 42], 'inout', 0.03)}
  <Cabin f={f} /><Table f={f} plates={0} laptop={false} /><Chairs3 /><Dust f={f} /><pointLight position={[0.3, 2.4, 0.9]} intensity={6} distance={8} decay={1.3} color="#ffd9a0" />
</>}</Scene>; };
// 27 END = frame 0's set; the camera finishes on the frame-0 pose, so it loops
S[27] = () => { const d = dur(27); return <Scene seed={28} bg={BG_CAB} ambient={0.6} density={0.05} title={[{text: 'OR A', at: 0, size: 100}, {text: 'MYSTERY?', at: loc(48.54, 27) - 4, red: true, size: 120}]}>{(f) => <>
  {cam([0.1, 1.9, 3.4], POSE0.from, [[0, 0.95, -0.1], [0, 0.95, 0]], d, [42, 46], 'inout', 0.0)}
  <Cabin f={f} /><Table f={f} /><Chairs3 /><Dust f={f} />
</>}</Scene>; };

export const KZ = () => {
  const ready = usePreload(grabPaths(PROPS));
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><NoirFonts />
    {ready && S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? KZ_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#040506" />}</Sequence>; })}
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
