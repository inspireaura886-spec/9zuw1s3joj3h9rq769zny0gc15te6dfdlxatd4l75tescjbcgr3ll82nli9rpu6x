// LF05 FILE 005 "Bodies With No Wounds" shot components (1920x1080 @ 24 fps): crater lake (Monoun/Nyos), Dyatlov snow slope, Roopkund lake, sleepy-sickness ward,
// plus a DNA/date timeline. Same overlay system as shots.jsx ({l,w} word cues). All people are generic low-poly figures: ILLUSTRATIVE RECREATION.
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Tree, Building, FogLayer, Smoke, Burst, Particles, Person, Cliff, clamp01, easeOut, easeInOut} from '../../kit/index.js';
import {FR, FPS, PAL, useCh, relF, TimedOverlays, BigE, PillE, STROKE} from './shots.jsx';

const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Ov = ({big, pill, startSec, endSec}) => <>
  <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
  <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
</>;
const keysOf = (cam, d) => cam.map((k) => ({...k, f: Math.round(k.t * d)}));
const cue = (VO, e, startSec) => (e ? Math.max(0, relF(VO, e, startSec)) : null);
const Lilita = {fontFamily: 'Lilita One'};
const RecTag = () => <div style={{position: 'absolute', right: 96, bottom: 250, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.75, ...STROKE(6)}}>ILLUSTRATIVE RECREATION</div>;
const mix = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(t)).getHexString();

// ---------------------------------------------------------------- props
const Cow = ({p, rot = 0, s = 1, dead = true}) => <group position={p} rotation={[0, rot, dead ? 0.0 : 0]} scale={s}>
  <mesh position={[0, 0.7, 0]}><boxGeometry args={[2.3, 1.0, 1.0]} /><meshLambertMaterial color="#6a4a32" flatShading /></mesh>
  <mesh position={[1.35, 0.95, 0]}><boxGeometry args={[0.7, 0.6, 0.6]} /><meshLambertMaterial color="#5a3d28" flatShading /></mesh>
  {[[-0.8, 0.45], [-0.8, -0.45], [0.8, 0.45], [0.8, -0.45]].map(([x, z], i) => <mesh key={i} position={[x, dead ? 0.55 : 0.1, z + (dead ? (z > 0 ? 0.6 : -0.6) : 0)]} rotation={dead ? [z > 0 ? 1.3 : -1.3, 0, 0] : [0, 0, 0]}><boxGeometry args={[0.2, 0.9, 0.2]} /><meshLambertMaterial color="#4a3222" flatShading /></mesh>)}
</group>;
const Bones = ({p, seed = 1, s = 1}) => <group position={p} rotation={[0, rnd(seed) * 6.28, 0]} scale={s}>
  <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.26, 8, 6]} /><meshLambertMaterial color="#e8e2cc" flatShading /></mesh>
  {[0, 1, 2].map((i) => <mesh key={i} position={[0.1 + (rnd(seed + i) - 0.5) * 0.6, 0.06, 0.3 + i * 0.22]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}><boxGeometry args={[0.07, 0.8, 0.12]} /><meshLambertMaterial color="#ddd5bc" flatShading /></mesh>)}
  {[0, 1].map((i) => <mesh key={'l' + i} position={[(i ? -0.3 : 0.4), 0.06, 1.2 + rnd(seed + 5 + i) * 0.3]} rotation={[0, 0.5 + i, Math.PI / 2]}><boxGeometry args={[0.09, 1.1, 0.09]} /><meshLambertMaterial color="#e2dac2" flatShading /></mesh>)}
</group>;
const Tent = ({p, rot = 0, torn = false, glow = false, cutOpen = false, snowCover = 0}) => <group position={p} rotation={[0, rot, 0]}>
  {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 1.15, torn && sd === 1 ? 0.75 : 1.2, 0]} rotation={[0, 0, -sd * (torn && sd === 1 ? 0.45 : 0.95)]}><boxGeometry args={[2.9, 0.07, 5]} /><meshLambertMaterial color={snowCover > 0.5 && sd === 1 ? '#d9e4f2' : '#d9822a'} flatShading /></mesh>)}
  <mesh position={[0, 0.06, 0]}><boxGeometry args={[3.2, 0.1, 5]} /><meshLambertMaterial color="#8a5a22" flatShading /></mesh>
  {snowCover > 0 && <mesh position={[0.5, 0.35 + snowCover * 0.4, 0.6]} scale={[2.6, 0.5 + snowCover * 0.8, 3]}><sphereGeometry args={[1, 10, 6]} /><meshLambertMaterial color="#e6eefa" flatShading /></mesh>}
  {cutOpen && <><mesh position={[-1.62, 1.05, 0.6]} rotation={[0, Math.PI / 2, 0.52]}><planeGeometry args={[2.2, 0.28]} /><meshBasicMaterial color="#ffe9a8" side={THREE.DoubleSide} /></mesh><Glow position={[-1.9, 1.1, 0.6]} size={3} color="#ffd070" opacity={0.4} /></>}
  {glow && <Glow position={[0, 1.0, 0]} size={5} color="#ffb860" opacity={0.5} />}
</group>;
const Skis = ({p, rot = 0}) => <group position={p} rotation={[0.25, rot, 0]}>{[-0.2, 0.2].map((x, i) => <mesh key={i} position={[x, 0.9, 0]}><boxGeometry args={[0.1, 1.8, 0.06]} /><meshLambertMaterial color="#5a3a22" flatShading /></mesh>)}</group>;
const Bed = ({p, rot = 0}) => <group position={p} rotation={[0, rot, 0]}>
  <mesh position={[0, 0.45, 0]}><boxGeometry args={[1.9, 0.18, 4.4]} /><meshLambertMaterial color="#b8bcc4" flatShading /></mesh>
  <mesh position={[0, 0.65, 0.1]}><boxGeometry args={[1.7, 0.25, 4.0]} /><meshLambertMaterial color="#e8eaee" flatShading /></mesh>
  <mesh position={[0, 0.85, -1.6]}><boxGeometry args={[1.0, 0.2, 0.7]} /><meshLambertMaterial color="#f4f4f6" flatShading /></mesh>
  {[[-0.85, -2.1], [0.85, -2.1], [-0.85, 2.1], [0.85, 2.1]].map(([x, z], i) => <mesh key={i} position={[x, 0.22, z]}><boxGeometry args={[0.12, 0.44, 0.12]} /><meshLambertMaterial color="#8a8e96" flatShading /></mesh>)}
</group>;

// ---------------------------------------------------------------- 3D scenes
export const MassShot = ({scene = 'lake', cam, big, pill, startSec, endSec, rec = true, drift = 0.04,
  // lake
  lakeR = 18, redAt = null, gasAt = null, gasDur = 9, fountain = false, pipe = false, bubbles = false, dead = false, cattle = false, villageLit = 0.85, fogGround = 0.18,
  // tent / slope
  tent = null, hikers = false, trail = false, bodies = [], pineFire = false, ravine = false, slabAt = null, wind = 0.12, cutOpen = false,
  // roopkund
  bones = 0, hailAt = null, pilgrims = false, ranger = false, lakeFrozen = false,
  // ward
  patients = 8, nurse = true, statueFocus = false}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh();
  const rF = cue(VO, redAt, startSec); const gF = cue(VO, gasAt, startSec); const sF = cue(VO, slabAt, startSec); const hF = cue(VO, hailAt, startSec);
  const pal = scene === 'lake' ? 'night' : scene === 'tent' ? 'cold' : scene === 'roop' ? 'grey' : 'cold';
  const redT = rF === null ? 0 : clamp01((f - rF) / FR(2.5));
  const lakeCol = mix('#1f5a8a', '#a8281c', redT);
  const gp = gF === null ? -1 : (f - gF) / FR(gasDur);
  const fog = scene === 'ward' ? [30, 120] : scene === 'roop' ? [60, 320] : scene === 'tent' ? [30, 200] : [26, 190];
  const lakeZ = -30;
  return <Stage palette={PAL[pal]} fog={fog} overlay={<><Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />{rec && <RecTag />}</>}>
    {cam && <CameraRig keys={keysOf(cam, d)} drift={drift} />}
    {scene !== 'ward' && <Stars opacity={scene === 'roop' ? 0.1 : 0.85} count={200} />}
    {(scene === 'lake' || scene === 'tent') && <><Orb position={[-62, 52, -125]} radius={3.6} color="#f1eed8" /><Glow position={[-62, 52, -124]} size={32} color="#9fc0ff" opacity={0.38} /></>}

    {scene === 'lake' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[190, 30]} /><meshLambertMaterial color="#1b2c20" flatShading /></mesh>
      {Array.from({length: 17}, (_, i) => { const a = Math.PI * (1.0 + (i / 16)); const r = lakeR + 9 + rnd(i) * 3; return <mesh key={i} position={[Math.cos(a) * r, 2.5, lakeZ + Math.sin(a) * r]} scale={[11 + rnd(i + 3) * 4, 7 + rnd(i + 7) * 6, 11 + rnd(i + 9) * 3]}><sphereGeometry args={[1, 10, 6]} /><meshLambertMaterial color={i % 3 ? '#27402c' : '#3a3f34'} flatShading /></mesh>; })}
      {[-70, -34, 4, 40, 76].map((x, i) => <mesh key={'m' + i} position={[x, 10, -105 - (i % 2) * 14]} scale={[30, 18 + i % 3 * 6, 22]}><sphereGeometry args={[1, 10, 6]} /><meshLambertMaterial color="#1a2a3c" flatShading /></mesh>)}
      <mesh position={[0, 0.1, lakeZ]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[lakeR, 36]} /><meshLambertMaterial color={lakeCol} flatShading /></mesh>
      <mesh position={[0, 0.07, lakeZ]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[lakeR - 0.2, lakeR + 2.2, 36]} /><meshLambertMaterial color="#4a4a3c" flatShading /></mesh>
      {redT > 0 && <Glow position={[0, 1.5, lakeZ]} size={50} color="#ff3a20" opacity={0.28 * redT} />}
      {bubbles && <Particles kind="motes" color="#b8e8ff" center={[0, 1.4, lakeZ]} area={[lakeR * 1.6, 3, lakeR * 1.6]} count={70} frame={f} />}
      {fountain && (gF === null || f >= gF) && <>
        <mesh position={[0, 11, lakeZ]} scale={[1, Math.max(0.01, easeOut(clamp01((f - (gF ?? 0)) / FR(1.4)))), 1]}><cylinderGeometry args={[2.4, 3.4, 22, 10]} /><meshBasicMaterial color="#eef4ff" transparent opacity={0.72} depthWrite={false} /></mesh>
        {[[0, 22, 0, 5], [3.5, 19, 1, 3.5], [-3.5, 19, -1, 3.5], [0, 26, 0, 3]].map((q, i) => <mesh key={'fo' + i} position={[q[0], q[1] + Math.sin(f * 0.2 + i) * 0.4, lakeZ + q[2]]}><sphereGeometry args={[q[3], 8, 6]} /><meshBasicMaterial color="#f4f8ff" transparent opacity={0.8 * clamp01((f - (gF ?? 0)) / FR(1.4))} depthWrite={false} /></mesh>)}
        {[0, 1, 2, 3, 4, 5].map((k) => <Burst key={k} kind="splash" position={[0, 18, lakeZ]} start={(gF ?? 0) + k * 6} frame={f} count={46} color="#eaf4ff" />)}
      </>}
      {pipe && <>
        <mesh position={[0, 0.25, lakeZ + 8]}><boxGeometry args={[6, 0.5, 6]} /><meshLambertMaterial color="#7a6a50" flatShading /></mesh>
        <mesh position={[0, 5.5, lakeZ + 8]}><cylinderGeometry args={[0.45, 0.45, 11, 8]} /><meshLambertMaterial color="#c9ccd2" flatShading /></mesh>
        <mesh position={[0, 15, lakeZ + 8]} scale={[1, 0.8 + 0.2 * Math.sin(f * 0.3), 1]}><cylinderGeometry args={[0.55, 0.9, 8, 8]} /><meshBasicMaterial color="#eef4ff" transparent opacity={0.65} depthWrite={false} /></mesh>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <Burst key={k} kind="splash" position={[0, 19, lakeZ + 8]} start={k * 7 + Math.floor(f / 49) * 49} frame={f} count={34} color="#eaf4ff" />)}
      </>}
      {[[-13, 0, 8], [11, 0, 12], [-5, 0, 22], [15, 0, 27], [-14, 0, 33], [2, 0, 38]].map((b, i) => <Building key={i} position={b} rotation={(i - 2) * 0.15} w={5 + (i % 2)} d={4} h={2.6} roof={1.5} color={i % 2 ? '#a08a6a' : '#8a7a60'} roofColor="#4a3a2a" lit={villageLit} litSeed={i + 2} frame={f} />)}
      {dead && [[-10.5, 0.15, 9], [-9, 0.15, 11], [-14.5, 0.15, 10], [8.5, 0.15, 13], [9.5, 0.15, 15], [-3, 0.15, 20], [-6.5, 0.15, 24], [12.5, 0.15, 28], [-12, 0.15, 35], [0.5, 0.15, 36], [4.5, 0.15, 41], [-2, 0.15, 14], [6, 0.15, 19], [-9, 0.15, 28]].map((q, i) =>
        <Person key={i} position={q} rotation={rnd(i + 3) * 6.28} scale={0.95} pose="sleep" shirt={['#3a6aa8', '#a84a3a', '#5a8a4a', '#c8b048', '#7a4a8a', '#d8d8d0'][i % 6]} pants={['#2a2a3a', '#4a3a2a'][i % 2]} skin={['#6a4228', '#8d5a36', '#a87048'][i % 3]} />)}
      {cattle && [[-8, 0, 17], [5, 0, 22], [-1.5, 0, 31], [10, 0, 33], [-10, 0, 40]].map((c, i) => <Cow key={i} p={c} rot={rnd(i + 11) * 3} s={0.8} />)}
      {Array.from({length: 7}, (_, i) => { const gq = gp >= 0 ? clamp01(gp * 1.3 - i * 0.03) : 0; return gq > 0.001 ? Array.from({length: 4}, (_, j) => { const k = i * 4 + j; const t = clamp01(gq * 1.1 - j * 0.05); if (t <= 0) return null; return <mesh key={k} position={[(rnd(k) - 0.5) * (14 + t * 36), 1.1 + rnd(k + 2) * 1.2, lakeZ + t * 72 - j * 3]} scale={[4 + rnd(k + 4) * 2.5 + t * 3, 1.2 + rnd(k + 6) * 0.7, 4 + rnd(k + 8) * 2.5]}><sphereGeometry args={[1, 10, 6]} /><meshBasicMaterial color="#e8eef0" transparent opacity={0.3} depthWrite={false} /></mesh>; }) : null; })}
      <FogLayer y={0.6} size={220} layers={3} thickness={2} color="#6a80a8" opacity={fogGround} frame={f} />
      <Particles kind="motes" center={[0, 5, -6]} area={[40, 8, 40]} count={20} frame={f} />
    </>}

    {scene === 'tent' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[200, 30]} /><meshLambertMaterial color="#b8c8de" flatShading /></mesh>
      <mesh position={[0, -14, -100]} scale={[120, 24, 52]}><sphereGeometry args={[1, 24, 12]} /><meshLambertMaterial color="#c4d2e6" flatShading /></mesh>
      <mesh position={[-60, -8, -90]} scale={[60, 28, 40]}><sphereGeometry args={[1, 18, 10]} /><meshLambertMaterial color="#aab9d0" flatShading /></mesh>
      {Array.from({length: 26}, (_, i) => { const a = 3.5 + i * 0.2; return <Tree key={i} position={[Math.cos(a) * (50 + rnd(i) * 26) + 20, 0, Math.sin(a) * 36 - 60 + rnd(i + 8) * 12]} s={2.6 + rnd(i + 5) * 1.8} kind="pine" color="#12281c" seed={i} frame={f} />; })}
      {(tent || hikers) && null}
      {tent && <Tent p={tent.p ?? [0, 0, -12]} rot={tent.rot ?? 0.2} torn={!!tent.torn} glow={!!tent.glow} cutOpen={cutOpen} snowCover={tent.snow ?? 0} />}
      {tent && tent.skis && <><Skis p={[3.4, 0, -9]} rot={0.3} /><Skis p={[4.2, 0, -10.5]} rot={-0.2} /></>}
      {tent && tent.boots && [[1, -8.6], [2, -9], [-2.8, -9.4]].map(([x, z], i) => <mesh key={i} position={[x, 0.14, z]} rotation={[0, i, 0]}><boxGeometry args={[0.28, 0.28, 0.7]} /><meshLambertMaterial color="#3a2a22" flatShading /></mesh>)}
      {trail && Array.from({length: 9}, (_, k) => Array.from({length: 16}, (_, j) => <mesh key={k * 16 + j} position={[-2 + k * 0.55 + Math.sin(j * 0.4 + k) * 0.5 + j * 0.28, 0.03, -14 - j * 2.1]} rotation={[0, 0.1 + (k % 2) * 0.1, 0]}><boxGeometry args={[0.32, 0.04, 0.72]} /><meshLambertMaterial color="#6a7890" flatShading /></mesh>))}
      {pineFire && <>
        <Tree position={[-14, 0, -28]} s={5.4} kind="pine" color="#12281c" seed={3} frame={f} />
        <Glow position={[-12, 0.6, -26.5]} size={6} color="#ff9a40" opacity={0.7} /><Particles kind="embers" center={[-12, 0.6, -26.5]} area={[1.6, 5, 1.6]} count={40} frame={f} />
        {Array.from({length: 7}, (_, i) => <mesh key={i} position={[-14 + (rnd(i) - 0.5) * 2, 2.5 + i * 1.0, -28 + (rnd(i + 3) - 0.5) * 2]} rotation={[0.7, i, 0.4]}><boxGeometry args={[0.1, 1.6, 0.1]} /><meshLambertMaterial color="#4a3a22" flatShading /></mesh>)}
      </>}
      {ravine && <>
        <mesh position={[0, 0.02, -26]}><boxGeometry args={[7, 0.1, 60]} /><meshLambertMaterial color="#22304a" flatShading /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 6.5, 2.2, -26]} scale={[1, 1, 1]}><boxGeometry args={[7, 4.4, 60]} /><meshLambertMaterial color="#dfe8f6" flatShading /></mesh>)}
        {[[-1.8, -17.5], [1.8, -22.5], [-2, -26.5], [1.5, -31]].map(([mx, z], i) => <mesh key={i} position={[mx, 0.4, z]} scale={[1.8, 0.8, 2.0]}><sphereGeometry args={[1, 10, 6]} /><meshLambertMaterial color="#e6eefa" flatShading /></mesh>)}
        <mesh position={[3.6, 2.0, -18]}><boxGeometry args={[0.25, 4, 0.25]} /><meshLambertMaterial color="#c8382a" flatShading /></mesh>
        {[0, 1, 2, 3].map((i) => <mesh key={i} position={[3.6, 0.5 + i, -17.8]}><boxGeometry args={[0.8, 0.1, 0.1]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </>}
      {hikers && Array.from({length: 9}, (_, i) => { const t = clamp01(f / d); const x = -13 + i * 1.7 + t * 12; const z = -5 - i * 0.5; return <Person key={i} position={[x, 0, z]} rotation={Math.PI / 2} scale={1.5} pose="walk" phase={f / 4.2 + i * 0.7} shirt={['#c8382a', '#2f6db5', '#e0a020', '#3a8a4a', '#8a4aa8', '#d8d8d0', '#2a2a3a', '#d06a2a', '#4aa8c8'][i]} pants="#2a2f40" shadow />; })}
      {bodies.map((b, i) => <Person key={i} position={[b[0], 0.1, b[1]]} rotation={b[2] ?? 0} scale={0.95} pose="sleep" shirt={['#c8382a', '#2f6db5', '#e0a020', '#3a8a4a', '#8a4aa8', '#d8d8d0', '#2a2a3a', '#d06a2a', '#4aa8c8'][i % 9]} pants="#2a2f40" skin="#c8a898" />)}
      {sF !== null && (() => { const t = clamp01((f - sF) / FR(2.2)); const z = -34 + easeInOut(t) * 22; return <>
        <mesh position={[0.5, 0.9 + (1 - t) * 6, z]} rotation={[0.18 * (1 - t), 0, 0]}><boxGeometry args={[11, 1.3, 13]} /><meshLambertMaterial color="#f0f6ff" flatShading /></mesh>
        {t > 0 && t < 1 && <Smoke position={[0.5, 1.5, z + 6]} frame={f} count={10} height={5} color="#f0f6ff" opacity={0.5} size={2.2} />}
      </>; })()}
      <Particles kind="snow" center={[0, 7, -10]} area={[70, 16, 60]} count={300} frame={f} wind={[wind, 0]} />
      <FogLayer y={0.6} size={220} layers={3} thickness={2} color="#9fb4d8" opacity={0.16} frame={f} />
    </>}

    {scene === 'roop' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[220, 30]} /><meshLambertMaterial color="#7a7266" flatShading /></mesh>
      {[-90, -45, 0, 45, 90].map((x, i) => <mesh key={i} position={[x, 22 + (i % 2) * 8, -150 - (i % 3) * 12]} scale={[44, 48 + (i % 3) * 8, 36]}><coneGeometry args={[1, 1, 6]} /><meshLambertMaterial color={i % 2 ? '#eef2f8' : '#dde4ee'} flatShading /></mesh>)}
      <Cliff footprint="wall" width={90} depth={14} height={20} layers={7} seed={4} position={[0, -1, -70]} colors={['#7a6e62', '#8a7c6c', '#625850', '#9a8a76']} cap="#e8eef6" />
      <Cliff footprint="wall" width={50} depth={10} height={14} layers={6} seed={9} position={[-48, -1, -30]} rotation={[0, 0.9, 0]} colors={['#7a6e62', '#8a7c6c', '#625850', '#9a8a76']} cap="#e8eef6" />
      <Cliff footprint="wall" width={50} depth={10} height={14} layers={6} seed={12} position={[50, -1, -30]} rotation={[0, -0.9, 0]} colors={['#7a6e62', '#8a7c6c', '#625850', '#9a8a76']} cap="#e8eef6" />
      <mesh position={[0, 0.08, -26]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 28]} /><meshLambertMaterial color={lakeFrozen ? '#9ec4d8' : '#17324a'} flatShading /></mesh>
      <mesh position={[0, 0.06, -26]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[8.8, 11.5, 28]} /><meshLambertMaterial color="#d8e4f0" flatShading /></mesh>
      {Array.from({length: 16}, (_, i) => <mesh key={'sn' + i} position={[(rnd(i) - 0.5) * 70, 0.05, -10 - rnd(i + 4) * 40]} scale={[3 + rnd(i + 2) * 5, 0.5, 2 + rnd(i + 6) * 3]}><sphereGeometry args={[1, 8, 5]} /><meshLambertMaterial color="#e6eef8" flatShading /></mesh>)}
      {Array.from({length: Math.min(40, bones)}, (_, i) => { const a = i * 2.39996; const r = 10 + rnd(i + 20) * 9; return <Bones key={i} p={[Math.cos(a) * r, 0.1, -26 + Math.sin(a) * r * 0.8]} seed={i + 1} s={1.1} />; })}
      {pilgrims && Array.from({length: 10}, (_, i) => { const t = clamp01(f / d); const hit = hF !== null && f >= hF + i * 2; const x = -17 + i * 2.2 + (hit ? 0 : t * 6); return <Person key={i} position={[x, 0, -6 - (i % 3) * 1.2]} rotation={Math.PI / 2} scale={1.5} pose={hit ? 'fall' : 'walk'} fallT={hit ? clamp01((f - hF - i * 2) / 14) : 0} phase={f / 4.5 + i * 0.6} shirt={['#a82a3a', '#d8a020', '#2a6aa8', '#d8d0c0', '#6a3a8a'][i % 5]} pants="#3a2a2a" skin="#9a6a44" shadow />; })}
      {ranger && <Person position={[-4 + Math.min(1, f / d) * 6, 0, -8]} rotation={0.6} scale={1} pose="walk" phase={f / 5} shirt="#3a5a3a" pants="#4a3a2a" skin="#8d5a36" prop="lantern" shadow />}
      {hF !== null && f >= hF - 12 && <Particles kind="snow" color="#ffffff" size={0.2} speed={4} center={[0, 12, -12]} area={[50, 24, 24]} count={170} frame={f} wind={[0.1, 0]} />}
      <FogLayer y={1} size={260} layers={3} thickness={3} color="#c8d4e4" opacity={0.15} frame={f} />
      <Particles kind="snow" center={[0, 6, -20]} area={[60, 14, 50]} count={90} frame={f} wind={[0.05, 0]} />
    </>}

    {scene === 'ward' && <>
      <mesh position={[0, -0.1, -20]}><boxGeometry args={[30, 0.2, 70]} /><meshLambertMaterial color="#5e706e" flatShading /></mesh>
      <mesh position={[0, 3.5, -55]}><boxGeometry args={[30, 7.4, 0.4]} /><meshLambertMaterial color="#8c9c98" flatShading /></mesh>
      {[-11, 11].map((x) => <mesh key={x} position={[x, 3.5, -20]}><boxGeometry args={[0.4, 7.4, 70]} /><meshLambertMaterial color="#8a9a96" flatShading /></mesh>)}
      <mesh position={[0, 7.4, -20]}><boxGeometry args={[30, 0.3, 70]} /><meshLambertMaterial color="#4a5654" flatShading /></mesh>
      {[-1, 1].map((sd) => Array.from({length: 7}, (_, i) => <group key={sd + '_' + i}>
        <mesh position={[sd * 10.7, 4, -2 - i * 8]}><boxGeometry args={[0.15, 3.6, 2.4]} /><meshBasicMaterial color="#9ec0e8" /></mesh>
        <Glow position={[sd * 9.6, 4, -2 - i * 8]} size={7} color="#9ec0e8" opacity={0.3} />
      </group>))}
      {[-1, 1].map((sd) => Array.from({length: 7}, (_, i) => <Bed key={sd + 'b' + i} p={[sd * 7.5, 0, -3 - i * 6.5]} rot={0} />))}
      {Array.from({length: Math.min(14, patients)}, (_, i) => { const sd = i % 2 ? 1 : -1; const row = Math.floor(i / 2); const z = -3 - row * 6.5; const lying = i % 4 === 3; return lying
        ? <Person key={i} position={[sd * 7.5, 0.9, z]} rotation={0} scale={0.9} pose="sleep" shirt="#d8dce6" pants="#c8ccd6" skin="#b8a898" />
        : <Person key={i} position={[sd * 7.5, 0.62, z + 0.3]} rotation={sd > 0 ? -Math.PI / 2 : Math.PI / 2} scale={0.9} pose="sit" phase={0} shirt="#d8dce6" pants="#c8ccd6" skin="#aeb0a8" hair="#4a4a4a" expr="open" />; })}
      <Person position={[0, 0, -18]} rotation={0} scale={1.05} pose="stand" phase={0} shirt="#c4c8d0" pants="#b4b8c0" skin="#a8aca8" hair="#5a5a5a" />
      {nurse && <Person position={[2.2, 0, 4 - ((f * 0.05) % 38)]} rotation={Math.PI} scale={1} pose="walk" phase={f / 5} shirt="#f4f4f8" pants="#e8e8f0" skin="#8d5a36" shadow />}
      {Array.from({length: 7}, (_, i) => <group key={i}><mesh position={[0, 7.1, -3 - i * 8]}><boxGeometry args={[1.6, 0.15, 0.5]} /><meshBasicMaterial color="#fff2c0" /></mesh><Glow position={[0, 6.6, -3 - i * 8]} size={7} color="#ffe6a8" opacity={0.28} /></group>)}
      <Particles kind="dust" center={[0, 4, -20]} area={[20, 6, 50]} count={60} frame={f} />
    </>}
  </Stage>;
};

// ---------------------------------------------------------------- 2D: Roopkund timeline (two separate events, a thousand years apart)
export const TwoEventsShot = ({big, pill, startSec, endSec, cues = {}}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh();
  const t1 = cue(VO, cues.a, startSec) ?? FR(1); const t2 = cue(VO, cues.b, startSec) ?? FR(6); const t3 = cue(VO, cues.c, startSec) ?? FR(10); const t4 = cue(VO, cues.d, startSec) ?? FR(13);
  const X = (ce) => 240 + (ce / 2000) * 1440; const Y = 760;
  const dots = (n, cx, col, t0, cols = 6) => Array.from({length: n}, (_, i) => { const r = Math.floor(i / cols); const c = i % cols; const k = f >= t0 + i * 1.6 ? spring({frame: f - t0 - i * 1.6, fps, config: {damping: 10, stiffness: 200}}) : 0;
    return k > 0 ? <circle key={i} cx={cx + (c - (cols - 1) / 2) * 44} cy={Y - 90 - r * 46} r={17 * k} fill={col} stroke="#141414" strokeWidth={5} /> : null; });
  const lbl = (x, y, txt, col, sz = 40) => <text x={x} y={y} textAnchor="middle" fontFamily="Lilita One" fontSize={sz} fill={col} stroke="#141414" strokeWidth={9} paintOrder="stroke" letterSpacing={2}>{txt}</text>;
  const gap = f >= t4 ? easeOut(clamp01((f - t4) / 14)) : 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1e2c44 0%, #070a14 85%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      <line x1={X(0)} x2={X(2000)} y1={Y} y2={Y} stroke="#cfd6e6" strokeWidth={6} />
      {[0, 500, 1000, 1500, 2000].map((ce) => <g key={ce}><line x1={X(ce)} x2={X(ce)} y1={Y - 14} y2={Y + 14} stroke="#cfd6e6" strokeWidth={5} />{lbl(X(ce), Y + 62, ce === 0 ? '0 CE' : String(ce), '#cfd6e6', 34)}</g>)}
      {f >= t1 && <>{dots(23, X(800), '#7fe3ff', t1)}{lbl(X(800), Y - 560 + 60, '23 · SOUTH ASIAN', '#7fe3ff', 44)}{lbl(X(800), Y - 510 + 60, '~800 CE', '#fff', 40)}</>}
      {f >= t2 && <>{dots(14, X(1800) - 50, '#ffb060', t2, 5)}{lbl(X(1800) - 50, Y - 560 + 60, '14 · E. MEDITERRANEAN', '#ffb060', 44)}{lbl(X(1800) - 50, Y - 510 + 60, '~1800 CE', '#fff', 40)}</>}
      {f >= t3 && <>{dots(1, X(1800) + 150, '#9be15d', t3, 1)}{lbl(X(1800) + 150, Y - 200, '1 · SE ASIAN', '#9be15d', 36)}</>}
      {gap > 0 && <g opacity={gap}><line x1={X(800)} x2={X(1800)} y1={Y + 120} y2={Y + 120} stroke="#ff5a4e" strokeWidth={10} strokeLinecap="round" />{lbl((X(800) + X(1800)) / 2, Y + 200, '1,000 YEARS APART', '#ff5a4e', 56)}</g>}
    </svg>
    <div style={{position: 'absolute', left: 96, top: 150, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.8, ...STROKE(6)}}>38 INDIVIDUALS · RADIOCARBON + GENOME-WIDE ANALYSIS</div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};
