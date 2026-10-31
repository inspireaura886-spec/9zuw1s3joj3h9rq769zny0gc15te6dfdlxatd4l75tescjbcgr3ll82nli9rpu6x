// LF04 FILE 004 "Monsters in the Dark" shot components (1920x1080 @ 24 fps): night farm / Flatwoods hill / TNT road / Silver Bridge / Dover wall / owl,
// plus a height chart, a schematic Dover map and a Known/Proposed/Unsolved board. Same overlay system as shots.jsx ({l,w} word cues).
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Tree, Building, FogLayer, Ocean, Smoke, Burst, LightCone, Particles, clamp01, easeOut, easeInOut} from '../../kit/index.js';
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

// ---------------------------------------------------------------- creatures (low-poly, deliberately generic: every description is only a witness report)
const EyePair = ({p, color = '#ffd93b', gap = 0.5, r = 0.14, glow = 1.8, f = 0, blinkSeed = null}) => {
  const open = blinkSeed === null ? 1 : (((f + blinkSeed * 17) % 90) < 4 ? 0.1 : 1);
  return <group position={p} scale={[1, open, 1]}>
    {[-gap / 2, gap / 2].map((x, i) => <group key={i}><mesh position={[x, 0, 0]}><sphereGeometry args={[r, 8, 6]} /><meshBasicMaterial color={color} /></mesh><Glow position={[x, 0, 0.05]} size={glow} color={color} opacity={0.75} /></group>)}
  </group>;
};
const Goblin = ({p, s = 1, rot = 0, f = 0, seed = 1, eye = '#ffe27a'}) => {
  const bob = Math.sin(f * 0.12 + seed * 2) * 0.05;
  return <group position={[p[0], p[1] + bob, p[2]]} rotation={[0, rot, 0]} scale={s}>
    <mesh position={[0, 0.55, 0]} scale={[0.5, 0.7, 0.4]}><sphereGeometry args={[1, 10, 8]} /><meshLambertMaterial color="#6b7587" flatShading /></mesh>
    <mesh position={[0, 1.3, 0]} scale={[0.42, 0.38, 0.38]}><sphereGeometry args={[1, 10, 8]} /><meshLambertMaterial color="#7d889b" flatShading /></mesh>
    {[-1, 1].map((sd) => <group key={sd}>
      <mesh position={[sd * 0.5, 1.5, 0]} rotation={[0, 0, -sd * 0.7]}><coneGeometry args={[0.16, 0.6, 5]} /><meshLambertMaterial color="#7d889b" flatShading /></mesh>
      <mesh position={[sd * 0.62, 0.95 + Math.sin(f * 0.15 + seed + sd) * 0.08, 0.05]} rotation={[0, 0, sd * (0.9 + Math.sin(f * 0.15 + seed) * 0.12)]}><boxGeometry args={[0.14, 1.0, 0.14]} /><meshLambertMaterial color="#6b7587" flatShading /></mesh>
    </group>)}
    <EyePair p={[0, 1.33, 0.34]} gap={0.3} r={0.1} color={eye} glow={1.3} f={f} blinkSeed={seed} />
  </group>;
};
const Hooded = ({p, s = 1, f = 0, face = '#ff4a30'}) => {
  const sway = Math.sin(f * 0.05) * 0.04; const pulse = 0.65 + 0.35 * Math.sin(f * 0.22);
  return <group position={p} rotation={[0, 0, sway]} scale={s}>
    <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.45, 1.15, 3.2, 8]} /><meshLambertMaterial color="#12141c" flatShading /></mesh>
    <mesh position={[0, 4.0, 0]}><coneGeometry args={[0.95, 1.9, 8]} /><meshLambertMaterial color="#171a26" flatShading /></mesh>
    <mesh position={[0, 3.45, 0.4]}><sphereGeometry args={[0.52, 12, 8]} /><meshBasicMaterial color={face} /></mesh>
    <Glow position={[0, 3.45, 0.7]} size={5 + pulse * 3} color="#ff3a20" opacity={0.35 + 0.4 * pulse} />
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 1.0, 2.2, 0.3]} rotation={[0.3, 0, sd * 0.5]}><boxGeometry args={[0.18, 1.6, 0.18]} /><meshLambertMaterial color="#12141c" flatShading /></mesh>)}
  </group>;
};
const Moth = ({p, s = 1, f = 0, rot = 0}) => {
  const fl = Math.sin(f * 0.28) * 0.55;
  return <group position={p} rotation={[0, rot, 0]} scale={s}>
    <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.32, 0.4, 1.9, 8]} /><meshLambertMaterial color="#3a3238" flatShading /></mesh>
    <mesh position={[0, 2.05, 0]}><sphereGeometry args={[0.34, 8, 6]} /><meshLambertMaterial color="#2a2428" flatShading /></mesh>
    <EyePair p={[0, 2.08, 0.3]} gap={0.42} r={0.14} color="#ff2a1a" glow={2.2} f={f} />
    {[-1, 1].map((sd) => <group key={sd} position={[sd * 0.3, 1.5, -0.15]} rotation={[0, 0, sd * (0.55 + fl)]}>
      <mesh position={[sd * 1.15, 0, 0]}><boxGeometry args={[2.3, 0.06, 1.3]} /><meshLambertMaterial color="#26222c" flatShading /></mesh></group>)}
  </group>;
};
const Owl = ({p, s = 1, f = 0, color = '#8a6a48', belly = '#cdbb9a', eye = '#ffc21a', rot = 0}) => {
  const turn = Math.sin(f * 0.03) * 0.5;
  return <group position={p} rotation={[0, rot, 0]} scale={s}>
    <mesh position={[0, 0.7, 0]} scale={[0.62, 0.85, 0.55]}><sphereGeometry args={[1, 12, 9]} /><meshLambertMaterial color={color} flatShading /></mesh>
    <mesh position={[0, 0.62, 0.3]} scale={[0.42, 0.62, 0.3]}><sphereGeometry args={[1, 10, 8]} /><meshLambertMaterial color={belly} flatShading /></mesh>
    <group position={[0, 1.65, 0]} rotation={[0, turn, 0]}>
      <mesh scale={[0.58, 0.5, 0.52]}><sphereGeometry args={[1, 12, 9]} /><meshLambertMaterial color={color} flatShading /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.38, 0.5, 0]} rotation={[0, 0, -sd * 0.25]}><coneGeometry args={[0.13, 0.4, 5]} /><meshLambertMaterial color={color} flatShading /></mesh>)}
      {[-1, 1].map((sd) => <group key={'e' + sd}><mesh position={[sd * 0.24, 0.05, 0.46]}><sphereGeometry args={[0.2, 10, 8]} /><meshBasicMaterial color={eye} /></mesh><mesh position={[sd * 0.24, 0.05, 0.64]}><sphereGeometry args={[0.08, 6, 5]} /><meshBasicMaterial color="#05050a" /></mesh><Glow position={[sd * 0.24, 0.05, 0.5]} size={1.5} color={eye} opacity={0.55} /></group>)}
      <mesh position={[0, -0.12, 0.55]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.09, 0.22, 4]} /><meshLambertMaterial color="#d68a2a" flatShading /></mesh>
    </group>
    {[-1, 1].map((sd) => <mesh key={'w' + sd} position={[sd * 0.58, 0.75, -0.1]} rotation={[0, 0, sd * 0.08]} scale={[0.18, 0.78, 0.4]}><sphereGeometry args={[1, 8, 6]} /><meshLambertMaterial color={color} flatShading /></mesh>)}
  </group>;
};
const Car = ({p, f = 0, rot = 0, color = '#7a3a3a', lights = true}) => <group position={p} rotation={[0, rot, 0]}>
  <mesh position={[0, 0.7, 0]}><boxGeometry args={[1.9, 0.8, 4.4]} /><meshLambertMaterial color={color} flatShading /></mesh>
  <mesh position={[0, 1.3, -0.2]}><boxGeometry args={[1.6, 0.7, 2.3]} /><meshLambertMaterial color="#cfd6e0" flatShading /></mesh>
  {[-1, 1].map((sd) => <group key={sd}><mesh position={[sd * 0.65, 0.75, 2.2]}><sphereGeometry args={[0.2, 8, 6]} /><meshBasicMaterial color="#fff6c8" /></mesh>
    {lights && <><Glow position={[sd * 0.65, 0.75, 2.4]} size={3} color="#fff2b0" opacity={0.8} /><LightCone position={[sd * 0.65, 0.8, 2.3]} dir={[0, -0.06, 1]} length={26} radius={5.2} color="#fff2b0" opacity={0.3} frame={f} glow={false} /></>}
    <mesh position={[sd * 0.65, 0.75, -2.2]}><sphereGeometry args={[0.14, 6, 5]} /><meshBasicMaterial color="#ff2a1a" /></mesh></group>)}
  {[[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]].map(([x, z], i) => <mesh key={i} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.34, 0.34, 0.25, 8]} /><meshLambertMaterial color="#10121a" flatShading /></mesh>)}
</group>;

// ---------------------------------------------------------------- 3D scene
export const DarkShot = ({scene = 'farm', cam, big, pill, startSec, endSec, gob = [], eyes = [], shoot = false, cops = false, fig = false, figAt = null, beacons = 0, party = false,
  carFrom = [3, 0, -70], carTo = [3, 0, -8], carDur = 6, carAt = 0, moth = null, collapseAt = null, owls = [], wallBeast = false, headlights = false, rec = true, drift = 0.04, flashDrop = null}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh();
  const fa = cue(VO, figAt, startSec); const figOn = fig && (fa === null || f >= fa); const cc = cue(VO, collapseAt, startSec); const fd = cue(VO, flashDrop, startSec);
  const pal = 'night';
  const flashOn = shoot && (Math.floor(f / 4) % 3 === 0) && rnd(Math.floor(f / 4)) > 0.25;
  const cp = clamp01((f - FR(carAt)) / FR(carDur)); const carPos = carFrom.map((v, i) => v + (carTo[i] - v) * easeInOut(cp));
  return <Stage palette={PAL[pal]} fog={scene === 'owl' ? [14, 90] : [26, 190]} overlay={<><Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />{rec && <RecTag />}</>}>
    {cam && <CameraRig keys={keysOf(cam, d)} drift={drift} />}
    <Stars opacity={0.85} count={200} />
    <Orb position={[-62, 52, -125]} radius={3.6} color="#f1eed8" /><Glow position={[-62, 52, -124]} size={32} color="#9fc0ff" opacity={0.38} />

    {scene === 'farm' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[170, 30]} /><meshLambertMaterial color="#1a2a1c" flatShading /></mesh>
      <Building position={[0, 0, -28]} w={9} d={6} h={3.2} roof={1.9} color="#8a7a66" roofColor="#3a2a2a" lit={1} litSeed={3} frame={f} />
      <Building position={[-17, 0, -34]} w={6} d={5} h={2.6} roof={1.4} color="#6a5a4a" roofColor="#2a2024" lit={0} frame={f} />
      {Array.from({length: 13}, (_, i) => <group key={'fn' + i}><mesh position={[-15 + i * 2.5, 0.55, -17]}><boxGeometry args={[0.18, 1.1, 0.18]} /><meshLambertMaterial color="#4a3a2a" flatShading /></mesh></group>)}
      <mesh position={[0, 0.7, -17]}><boxGeometry args={[30, 0.1, 0.1]} /><meshLambertMaterial color="#4a3a2a" flatShading /></mesh>
      <mesh position={[11, 0.45, -21]}><cylinderGeometry args={[0.9, 0.9, 0.9, 10]} /><meshLambertMaterial color="#6a6a70" flatShading /></mesh>
      {Array.from({length: 26}, (_, i) => { const a = 3.3 + i * 0.22 + rnd(i) * 0.1; return <Tree key={i} position={[Math.cos(a) * (46 + rnd(i + 4) * 30), 0, Math.sin(a) * 30 - 52 + rnd(i + 8) * 14]} s={2.2 + rnd(i + 5) * 1.6} kind="pine" color="#14301f" seed={i} frame={f} />; })}
      {gob.map((g, i) => <Goblin key={i} p={[g[0], g[1], g[2]]} s={g[3] ?? 1.3} rot={g[4] ?? 0} f={f} seed={i + 1} />)}
      {eyes.map((e, i) => <EyePair key={'ey' + i} p={[e[0], e[1], e[2]]} color={e[3] ?? '#ffd93b'} gap={e[4] ?? 0.5} r={e[5] ?? 0.14} glow={e[6] ?? 2.4} f={f} blinkSeed={i + 1} />)}
      {shoot && <>{[[-3.2, 1.9, -24.6], [3.4, 1.9, -24.6]].map((q, i) => <group key={i}><pointLight position={q} color="#ffcf70" intensity={flashOn && (Math.floor(f / 4) % 2 === i) ? 60 : 0} distance={30} />{flashOn && (Math.floor(f / 4) % 2 === i) && <Glow position={q} size={4.2} color="#ffe6a0" opacity={0.9} />}</group>)}</>}
      {cops && [[-9, 0, -8, 0.5], [9, 0, -6, -0.4]].map((c, i) => <group key={i}><Car p={[c[0], 0, c[2]]} rot={c[3]} f={f} color="#2a3a5a" lights={false} />
        {[['#ff2a1a', 0], ['#2a6aff', 3]].map(([col, ph], k) => { const on = ((Math.floor(f / 3) + ph + i) % 6) < 3; return <group key={k}><Glow position={[c[0] + (k ? 0.5 : -0.5), 1.9, c[2]]} size={on ? 5 : 1.2} color={col} opacity={on ? 0.95 : 0.2} /></group>; })}</group>)}
      <FogLayer y={0.5} size={200} layers={3} thickness={2} color="#6a80a8" opacity={0.17} frame={f} />
      <Particles kind="motes" center={[0, 5, -16]} area={[40, 8, 30]} count={26} frame={f} />
    </>}

    {scene === 'hill' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[170, 30]} /><meshLambertMaterial color="#15261c" flatShading /></mesh>
      <mesh position={[4, -6.5, -40]} scale={[44, 10, 28]}><sphereGeometry args={[1, 24, 12]} /><meshLambertMaterial color="#1a3022" flatShading /></mesh>
      {Array.from({length: 38}, (_, i) => { const a = i * 0.9; const tx = (rnd(i) - 0.5) * 100; const tz = -30 - rnd(i + 2) * 40; const th = 3.6 * Math.max(0, 1 - ((tx - 4) / 44) ** 2 - ((tz + 40) / 28) ** 2); if (Math.abs(tx - 6) < 6 && tz > -52 && tz < -26) return null; return <Tree key={i} position={[tx, th + 0.1, tz]} s={2.2 + rnd(i + 7) * 1.8} kind="pine" color="#14301f" seed={i} frame={f} />; })}
      <Building position={[-24, 0, -22]} w={7} d={5} h={2.8} roof={1.5} color="#8a7a66" roofColor="#3a2a2a" lit={0.7} frame={f} />
      {party && <>{[0, 1, 2, 3, 4].map((i) => { const t = clamp01(f / (d * 0.9)); const x = -14 + i * 1.6 + t * 12; const z = -8 - t * 14 - i * 0.7; return <group key={i} position={[x, 1.3, z]}><mesh><sphereGeometry args={[0.28, 6, 5]} /><meshBasicMaterial color="#fff2b0" /></mesh><Glow position={[0, 0, 0]} size={3} color="#fff2b0" opacity={0.7} /><LightCone position={[0, 0, 0]} dir={[0.5 + i * 0.05, -0.1, -1]} length={18} radius={3} color="#fff2b0" opacity={0.3} frame={f} glow={false} /></group>; })}</>}
      {figOn && <Hooded p={[7, 3.4, -40]} s={1.15} f={f} />}
      {figOn && fd !== null && <group>{f < fd ? <LightCone position={[-4, 1.6, -12]} dir={[0.4, 0.05, -1]} length={36} radius={4} color="#fff2b0" opacity={0.4} frame={f} /> : <Glow position={[-3 + Math.min(1, (f - fd) / 10) * 2, Math.max(0.2, 1.4 - (f - fd) * 0.12), -12]} size={1.6} color="#fff2b0" opacity={0.5} />}</group>}
      {beacons > 0 && Array.from({length: beacons}, (_, i) => { const on = ((f + i * 14) % 36) < 16; return <group key={i} position={[-30 + i * 24, 14 + (i % 2) * 5, -88]}><mesh><sphereGeometry args={[0.5, 6, 5]} /><meshBasicMaterial color={on ? '#ff2a1a' : '#3a0c0a'} /></mesh><Glow position={[0, 0, 0]} size={on ? 7 : 1.5} color="#ff3a20" opacity={on ? 0.95 : 0.15} /></group>; })}
      <FogLayer y={0.8} size={220} layers={3} thickness={2.5} color="#6a80a8" opacity={0.2} frame={f} />
      <Particles kind="motes" center={[0, 5, -20]} area={[40, 10, 40]} count={24} frame={f} />
    </>}

    {scene === 'road' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[190, 30]} /><meshLambertMaterial color="#16241a" flatShading /></mesh>
      <mesh position={[0, 0.02, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[9, 200]} /><meshLambertMaterial color="#202228" flatShading /></mesh>
      {Array.from({length: 22}, (_, i) => <mesh key={i} position={[0, 0.04, 20 - i * 8]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.3, 3.4]} /><meshBasicMaterial color="#d8c870" /></mesh>)}
      {[[-26, -38], [-34, -50], [-22, -64], [-40, -30]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><mesh scale={[1, 0.62, 1]}><sphereGeometry args={[4.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshLambertMaterial color="#4a5a4c" flatShading /></mesh><mesh position={[0, 1, 4]}><boxGeometry args={[1.8, 2, 0.6]} /><meshLambertMaterial color="#12161a" flatShading /></mesh></group>)}
      <mesh position={[-48, 7, -80]}><cylinderGeometry args={[0.9, 1.3, 14, 8]} /><meshLambertMaterial color="#3a3e46" flatShading /></mesh>
      {Array.from({length: 30}, (_, i) => { const side = i % 2 ? 1 : -1; return <Tree key={i} position={[side * (9 + rnd(i) * 18), 0, 10 - i * 5.5]} s={2 + rnd(i + 3) * 1.6} kind="pine" color="#14301f" seed={i} frame={f} />; })}
      {headlights !== false && <Car p={carPos} rot={0} f={f} />}
      {moth && <Moth p={[moth.x ?? 9, (moth.y ?? 2.6) + Math.sin(f * 0.14) * 0.5, moth.follow ? carPos[2] + 3 : (moth.z ?? -40)]} s={moth.s ?? 1.5} f={f} rot={moth.rot ?? -0.6} />}
      <FogLayer y={0.5} size={200} layers={3} thickness={2} color="#6a80a8" opacity={0.17} frame={f} />
    </>}

    {scene === 'bridge' && <>
      <Ocean position={[0, -0.25, -40]} size={[300, 120]} seg={90} frame={f} amp={0.08} deep="#040e20" face="#061630" foam="#3a5a88" />
      <mesh position={[-70, 3, -40]}><boxGeometry args={[50, 6, 30]} /><meshLambertMaterial color="#15261c" flatShading /></mesh>
      <mesh position={[70, 3, -40]}><boxGeometry args={[50, 6, 30]} /><meshLambertMaterial color="#15261c" flatShading /></mesh>
      {[-22, 22].map((x, i) => { const lean = cc !== null && f >= cc ? clamp01((f - cc) / 40) * (i ? -0.12 : 0.12) : 0; return <mesh key={i} position={[x, 8.5, -40]} rotation={[0, 0, lean]}><boxGeometry args={[1.3, 17, 1.3]} /><meshLambertMaterial color="#9aa2ae" flatShading /></mesh>; })}
      {/* the eyebar chain + hangers (intact until the collapse cue) */}
      {Array.from({length: 49}, (_, i) => { const x = -44 + i * 2; const fall = cc !== null && f >= cc ? clamp01((f - cc) / 30) : 0; const ax = Math.abs(x); const y = ax <= 22 ? 7.5 + 9.5 * (x / 22) ** 2 : 17 - (ax - 22) / 22 * 9.5;
        const yy = y - fall * 7 * (1 - Math.min(1, ax / 40)); return <mesh key={i} position={[x, yy, -39.4]}><boxGeometry args={[2.1, 0.32, 0.3]} /><meshLambertMaterial color="#aeb6c2" flatShading /></mesh>; })}
      {Array.from({length: 12}, (_, i) => { const x = -33 + i * 6; const t = cc !== null ? Math.max(0, f - cc - Math.abs(i - 5.5) * 4) : 0; const g = t > 0 ? 0.0065 * t * t : 0; const y = 6.2 - g; if (y < -1.5) return null;
        return <group key={i} position={[x, y, -40]} rotation={[0, 0, t > 0 ? Math.min(1.1, t * 0.02) * (i < 6 ? 1 : -1) : 0]}><mesh><boxGeometry args={[6.2, 0.5, 4.4]} /><meshLambertMaterial color="#6a707c" flatShading /></mesh>
          {Array.from({length: 3}, (_, k) => <mesh key={k} position={[-2 + k * 2, 0.3, 2.2]}><boxGeometry args={[0.14, 1.0, 0.14]} /><meshLambertMaterial color="#aeb6c2" flatShading /></mesh>)}</group>; })}
      {cc !== null && [-18, -6, 6, 18].map((x, i) => <Burst key={i} kind="splash" position={[x, 0.2, -40]} start={cc + 12 + i * 5} frame={f} count={40} color="#cfe6ff" />)}
      {Array.from({length: 18}, (_, i) => <Glow key={'bl' + i} position={[-44 + i * 5, 6.4, -37.5]} size={1.3} color="#ffd27a" opacity={cc !== null && f >= cc ? 0.15 : 0.55} />)}
      <FogLayer y={0.4} size={260} layers={3} thickness={2} color="#7088b8" opacity={0.2} frame={f} />
    </>}

    {scene === 'wall' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[170, 30]} /><meshLambertMaterial color="#1c2a1c" flatShading /></mesh>
      <mesh position={[0, 0.02, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[140, 8]} /><meshLambertMaterial color="#25272e" flatShading /></mesh>
      {Array.from({length: 26}, (_, i) => { if (i === 12 || i === 13) return null; const h = 0.8 + rnd(i) * 0.35; return <mesh key={i} position={[-16 + i * 1.25, h / 2, -8 + (rnd(i + 9) - 0.5) * 0.25]} rotation={[0, (rnd(i + 5) - 0.5) * 0.2, 0]}><boxGeometry args={[1.2, h, 0.9]} /><meshLambertMaterial color={i % 3 ? '#6e6a62' : '#58554f'} flatShading /></mesh>; })}
      {wallBeast && <group position={[0, 1.0, -8]} scale={1.4}>
        <mesh position={[0, 0.55, 0]} scale={[0.22, 0.6, 0.2]}><sphereGeometry args={[1, 8, 6]} /><meshLambertMaterial color="#b9a58a" flatShading /></mesh>
        <mesh position={[0, 1.55, 0]} scale={[0.55, 0.72, 0.5]}><sphereGeometry args={[1, 12, 9]} /><meshLambertMaterial color="#c4b093" flatShading /></mesh>
        {[-1, 1].map((sd) => <group key={sd}><mesh position={[sd * 0.26, 0.28, 0.1]} rotation={[0.2, 0, sd * 0.12]}><boxGeometry args={[0.1, 1.2, 0.1]} /><meshLambertMaterial color="#b9a58a" flatShading /></mesh>
          <mesh position={[sd * 0.28, 0.5, 0.15]} rotation={[0.9, 0, sd * 0.35]}><boxGeometry args={[0.08, 0.85, 0.08]} /><meshLambertMaterial color="#b9a58a" flatShading /></mesh></group>)}
        <EyePair p={[0, 1.6, 0.46]} gap={0.46} r={0.12} color="#ff8a1a" glow={1.1} f={f} />
      </group>}
      <Building position={[-26, 0, -26]} w={8} d={6} h={3} roof={1.7} color="#9a8a76" roofColor="#3a2a2a" lit={0.8} frame={f} />
      <Building position={[24, 0, -30]} w={7} d={5} h={2.8} roof={1.5} color="#8a8a96" roofColor="#2a2a34" lit={0.6} frame={f} />
      {Array.from({length: 24}, (_, i) => { const a = 3.4 + i * 0.2; return <Tree key={i} position={[Math.cos(a) * (36 + rnd(i) * 26), 0, Math.sin(a) * 24 - 34]} s={2.4 + rnd(i + 5) * 1.8} kind="round" color="#1a3022" seed={i} frame={f} />; })}
      {headlights && <LightCone position={[-18, 1.1, 0]} dir={[1, -0.02, -0.28]} length={44} radius={7} color="#fff2b0" opacity={0.35} frame={f} />}
      <FogLayer y={0.5} size={200} layers={3} thickness={2} color="#6a80a8" opacity={0.17} frame={f} />
    </>}

    {scene === 'owl' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[100, 24]} /><meshLambertMaterial color="#14221a" flatShading /></mesh>
      <mesh position={[0, 1.5, -10]} rotation={[0, 0, Math.PI / 2 - 0.08]}><cylinderGeometry args={[0.28, 0.4, 14, 7]} /><meshLambertMaterial color="#3a2a1e" flatShading /></mesh>
      {Array.from({length: 14}, (_, i) => <mesh key={i} position={[-6 + rnd(i) * 12, 2.4 + rnd(i + 3) * 4, -12 - rnd(i + 6) * 5]}><sphereGeometry args={[1.5 + rnd(i + 9) * 1.4, 7, 6]} /><meshLambertMaterial color="#10261a" flatShading /></mesh>)}
      {owls.map((o, i) => <Owl key={i} p={[o[0], o[1], o[2]]} s={o[3] ?? 1.5} f={f} rot={o[4] ?? 0} color={o[5] ?? '#8a6a48'} belly={o[6] ?? '#cdbb9a'} eye={o[7] ?? '#ffc21a'} />)}
      <Particles kind="motes" center={[0, 3, -8]} area={[14, 6, 12]} count={18} frame={f} />
    </>}
  </Stage>;
};

// ---------------------------------------------------------------- 2D: height chart (witness 2-4 ft vs a great horned owl ~ 2/3 m)
export const SizeShot = ({big, pill, startSec, endSec, owlAt}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const os = cue(VO, owlAt, startSec) ?? FR(3);
  const x0 = 360, x1 = 1560; const X = (ft) => x0 + (ft / 4.5) * (x1 - x0);
  const k = easeOut(clamp01(f / 14)); const ok = f >= os ? spring({frame: f - os, fps, config: {damping: 10, stiffness: 160}}) : 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1a2a40 0%, #060a14 85%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      <line x1={x0} x2={x1} y1={700} y2={700} stroke="#cfd6e6" strokeWidth={6} />
      {[0, 1, 2, 3, 4].map((ft) => <g key={ft}><line x1={X(ft)} x2={X(ft)} y1={680} y2={720} stroke="#cfd6e6" strokeWidth={5} /><text x={X(ft)} y={662} textAnchor="middle" fontFamily="Lilita One" fontSize={44} fill="#cfd6e6" stroke="#141414" strokeWidth={8} paintOrder="stroke">{ft} FT</text></g>)}
      <rect x={X(2)} y={500} width={(X(4) - X(2)) * k} height={110} rx={14} fill="#ff9a40" stroke="#141414" strokeWidth={6} />
      <text x={(X(2) + X(4)) / 2} y={470} textAnchor="middle" fontFamily="Lilita One" fontSize={52} fill="#ffb060" stroke="#141414" strokeWidth={10} paintOrder="stroke" letterSpacing={2} opacity={k}>FAMILY'S REPORT: 2-4 FT</text>
      {ok > 0 && <g transform={`translate(${X(2.19)},${700}) scale(${ok})`}><line x1={0} x2={0} y1={0} y2={100} stroke="#ffd93b" strokeWidth={8} />
        <circle cx={0} cy={110} r={26} fill="#ffd93b" stroke="#141414" strokeWidth={6} /><text x={0} y={178} textAnchor="middle" fontFamily="Lilita One" fontSize={46} fill="#ffd93b" stroke="#141414" strokeWidth={10} paintOrder="stroke" letterSpacing={2}>GREAT HORNED OWL ~2.2 FT</text></g>}
    </svg>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- 2D: schematic Dover map (NOT to scale): three sightings on a straight line
export const DoverMapShot = ({big, pill, startSec, endSec, pins = [], lineAt = null, shown = false}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const d = FR(endSec - startSec);
  const P = [{n: 'BARTLETT · FARM ST', date: '21 APR', x: 480, y: 780}, {n: 'BAXTER · MILLER HILL RD', date: '21 APR', x: 960, y: 520}, {n: 'BRABHAM · SPRINGDALE AVE', date: '22 APR', x: 1440, y: 260}];
  const ls = lineAt ? cue(VO, lineAt, startSec) : (shown ? 0 : null); const lp = ls !== null && f >= ls ? easeInOut(clamp01((f - ls) / 28)) : 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #123456 0%, #08182c 80%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 13}, (_, i) => <line key={i} x1={i * 160} y1={0} x2={i * 160} y2={1080} stroke="#1e4366" strokeWidth={1} opacity={0.5} />)}
      {Array.from({length: 8}, (_, i) => <line key={'h' + i} x1={0} y1={i * 160} x2={1920} y2={i * 160} stroke="#1e4366" strokeWidth={1} opacity={0.5} />)}
      {[[200, 900, 700, 860, 900, 700], [300, 420, 760, 420, 1000, 300], [1100, 900, 1200, 640, 1700, 520], [700, 200, 1000, 330, 1200, 120]].map((r, i) => <polyline key={i} points={`${r[0]},${r[1]} ${r[2]},${r[3]} ${r[4]},${r[5]}`} fill="none" stroke="#2b5a7a" strokeWidth={8} strokeLinejoin="round" opacity={0.7} />)}
      {lp > 0 && <line x1={P[0].x} y1={P[0].y} x2={P[0].x + (P[2].x - P[0].x) * lp} y2={P[0].y + (P[2].y - P[0].y) * lp} stroke="#ff5a4e" strokeWidth={9} strokeDasharray="26 14" strokeLinecap="round" />}
      {P.map((p, i) => { const t = pins[i] ? Math.max(0, cue(VO, pins[i], startSec)) : 0; if (f < t) return null; const k = spring({frame: f - t, fps, config: {damping: 9, stiffness: 170}});
        return <g key={i} transform={`translate(${p.x},${p.y}) scale(${k})`}><circle r={24} fill="#ffd93b" stroke="#141414" strokeWidth={6} /><circle r={46} fill="none" stroke="#ffd93b" strokeWidth={4} opacity={0.6} />
          <text y={i === 1 ? 82 : -48} textAnchor="middle" fontFamily="Lilita One" fontSize={38} fill="#fff" stroke="#141414" strokeWidth={9} paintOrder="stroke" letterSpacing={2}>{p.n}</text>
          <text y={i === 1 ? 126 : -90} textAnchor="middle" fontFamily="Lilita One" fontSize={34} fill="#ffd93b" stroke="#141414" strokeWidth={8} paintOrder="stroke" letterSpacing={2}>{p.date} 1977</text></g>; })}
    </svg>
    {lp > 0.9 && <div style={{position: 'absolute', width: 1100, top: 790, textAlign: 'right', right: 96, ...Lilita, fontSize: 60, color: '#ff5a4e', letterSpacing: 4, ...STROKE(12), opacity: clamp01((lp - 0.9) * 10)}}>A STRAIGHT LINE · OVER 2 MILES</div>}
    <div style={{position: 'absolute', left: 96, top: 150, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.8, ...STROKE(6)}}>SCHEMATIC · NOT TO SCALE · DOVER, MASSACHUSETTS</div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- 2D: KNOWN / PROPOSED / UNSOLVED board
export const KpuShot = ({rows, startSec, endSec, big, pill}) => {
  const {VO} = useCh(); const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1a2a44 0%, #060a14 85%)'}}>
    <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', ...Lilita, fontSize: 70, color: '#ffd93b', ...STROKE(12), letterSpacing: 4}}>THE HONEST VERSION</div>
    {rows.map((r, i) => { const t = Math.max(0, relF(VO, r, startSec)); if (f < t) return null; const s = spring({frame: f - t, fps, config: {damping: 12, stiffness: 170}});
      return <div key={i} style={{position: 'absolute', top: 270 + i * 235, left: 220, width: 1480, height: 195, background: '#f3ead2', border: '6px solid #141414', borderRadius: 18, display: 'flex', alignItems: 'center', boxSizing: 'border-box', transform: `translateX(${(1 - s) * -1000}px)`, boxShadow: '0 10px 0 rgba(0,0,0,0.4)', overflow: 'hidden'}}>
        <div style={{width: 400, height: '100%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', ...Lilita, fontSize: 68, color: '#141414', letterSpacing: 3, borderRight: '6px solid #141414'}}>{r.name}</div>
        <div style={{flex: 1, padding: '0 40px', fontFamily: 'Special Elite', fontSize: 44, lineHeight: 1.15, color: '#2a2116'}}>{r.what}</div>
      </div>; })}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};
