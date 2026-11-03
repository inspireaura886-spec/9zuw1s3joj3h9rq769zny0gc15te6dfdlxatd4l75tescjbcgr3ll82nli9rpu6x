import {pal} from '../../../palette.js'; // HUMANE caption palette 2026-11-03
// LF02 "Signals From Nowhere" shot components (1920x1080 @ 24 fps). Same overlay system as shots.jsx (big/pill with {l,w} word cues).
import * as THREE from 'three';
import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Particles, Tree, Building, FogLayer, clamp01, easeOut, easeInOut} from '../../kit/index.js';
import {FR, FPS, PAL, useCh, relF, TimedOverlays, BigE, PillE, STROKE} from './shots.jsx';

const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Ov = ({big, pill, startSec, endSec}) => <>
  <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
  <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
</>;
const keysOf = (cam, d) => cam.map((k) => ({...k, f: Math.round(k.t * d)}));
const cue = (VO, e, startSec) => (e ? Math.max(0, relF(VO, e, startSec)) : null);
const Lilita = {fontFamily: 'Lilita One'};

// ------------------------------------------------------------------ 3D: radio telescope under the stars
const Dish = ({position = [0, 0, 0], tilt = 0.9, yaw = 0, r = 5, f = 0}) => (
  <group position={position} rotation={[0, yaw, 0]}>
    <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.35, 0.6, 3.2, 6]} /><meshLambertMaterial color="#8a93a0" flatShading /></mesh>
    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[2.2, 2.6, 0.4, 8]} /><meshLambertMaterial color="#5a6270" flatShading /></mesh>
    <group position={[0, 3.4, 0]} rotation={[-tilt, 0, 0]}>
      <mesh><sphereGeometry args={[r, 22, 7, 0, Math.PI * 2, 0, 0.95]} /><meshLambertMaterial color="#cfd6e0" flatShading side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, r * 0.62, 0]}><cylinderGeometry args={[0.07, 0.07, r * 0.8, 5]} /><meshLambertMaterial color="#9aa2ae" flatShading /></mesh>
      <mesh position={[0, r * 1.02, 0]}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshLambertMaterial color="#3a3f48" flatShading /></mesh>
      <mesh position={[0, r * 1.04, 0]}><sphereGeometry args={[0.16 + 0.05 * Math.sin(f * 0.3), 6, 5]} /><meshBasicMaterial color="#ff4a3a" /></mesh>
    </group>
  </group>
);
/** rings that travel along the dish axis toward the dish (a signal arriving) */
const Rings = ({from = [0, 40, -40], to = [0, 6, 0], f = 0, n = 5, speed = 0.012, color = '#8fe6ff', start = 0}) => {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to); const dir = b.clone().sub(a); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
  return <>{Array.from({length: n}, (_, i) => { const t = ((Math.max(0, f - start) * speed + i / n) % 1); const p = a.clone().add(dir.clone().multiplyScalar(t)); const rad = 1.2 + 4.5 * (1 - t) * 0.6 + 0.8;
    return <mesh key={i} position={p.toArray()} quaternion={q}><torusGeometry args={[rad, 0.07, 6, 40]} /><meshBasicMaterial color={color} transparent opacity={Math.sin(Math.PI * t) * 0.9} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>; })}</>;
};
export const DishShot = ({cam, orbit, dishes = [[0, 0, 0]], aim = 0.9, yaw = 0, signal = false, signalAt = 0, stars = 0.9, moon = false, big, pill, startSec, endSec, ground = '#14231c', snow = false, fogC}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh(); const sf = signal ? (typeof signalAt === 'object' ? cue(VO, signalAt, startSec) : FR(signalAt)) : 1e9;
  return <Stage palette={PAL.night} fog={[40, 220]} overlay={<Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />}>
    {cam ? <CameraRig keys={keysOf(cam, d)} /> : <CameraRig orbit={{...orbit, start: 0, end: d}} />}
    <Stars opacity={stars} count={220} />
    {moon && <><Orb position={[-70, 60, -120]} radius={4.5} color="#fbf6dc" /><Glow position={[-70, 60, -119]} size={38} color="#9fc0ff" opacity={0.5} /></>}
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[160, 30]} /><meshLambertMaterial color={ground} flatShading /></mesh>
    {Array.from({length: 22}, (_, i) => <Tree key={i} position={[Math.cos(i * 1.9) * (38 + rnd(i) * 40), 0, -20 - Math.abs(Math.sin(i * 2.3)) * 60]} s={1.6 + rnd(i + 4)} kind="pine" color="#1d3a2c" seed={i} frame={f} />)}
    {dishes.map((p, i) => <Dish key={i} position={p} tilt={aim} yaw={yaw} f={f + i * 5} />)}
    {f >= sf && <Rings from={[0, 60, -50]} to={[dishes[0][0], 7, dishes[0][2]]} f={f} start={sf} />}
    <FogLayer y={0.8} size={200} layers={3} thickness={2.5} color="#7088b8" opacity={0.22} frame={f} />
    {snow && <Particles kind="snow" center={[0, 8, 0]} area={[40, 16, 40]} count={160} frame={f} />}
    <Particles kind="motes" center={[0, 6, 0]} area={[30, 10, 30]} count={30} frame={f} />
  </Stage>;
};

// ------------------------------------------------------------------ 3D: lonely radio tower in a snowy forest (UVB-76 mood)
const Mast = ({position = [0, 0, 0], h = 26, f = 0}) => {
  const legs = [[-0.7, -0.7], [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7]]; const sec = 10;
  return <group position={position}>
    {legs.map((l, i) => <mesh key={i} position={[l[0] * 0.5, h / 2, l[1] * 0.5]}><cylinderGeometry args={[0.07, 0.12, h, 4]} /><meshLambertMaterial color="#9aa0aa" flatShading /></mesh>)}
    {Array.from({length: sec}, (_, i) => <mesh key={'b' + i} position={[0, 1 + (i * (h - 2)) / sec, 0]}><boxGeometry args={[1.2 - i * 0.04, 0.07, 1.2 - i * 0.04]} /><meshLambertMaterial color="#9aa0aa" flatShading /></mesh>)}
    <mesh position={[0, h + 0.2, 0]}><sphereGeometry args={[0.28, 6, 5]} /><meshBasicMaterial color={Math.floor(f / 14) % 2 ? '#ff2a1a' : '#4a0a08'} /></mesh>
    <Glow position={[0, h + 0.2, 0]} size={Math.floor(f / 14) % 2 ? 5 : 1.2} color="#ff3a2a" opacity={0.8} />
  </group>;
};
export const TowerShot = ({cam, orbit, big, pill, startSec, endSec, buzz = false, doorOpen = true}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec);
  return <Stage palette={PAL.night} fog={[22, 120]} overlay={<Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />}>
    {cam ? <CameraRig keys={keysOf(cam, d)} /> : <CameraRig orbit={{...orbit, start: 0, end: d}} />}
    <Stars opacity={0.8} count={180} />
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[120, 28]} /><meshLambertMaterial color="#c9d4e6" flatShading /></mesh>
    {Array.from({length: 40}, (_, i) => { const a = i * 0.62; const rr = 16 + rnd(i) * 40; return <Tree key={i} position={[Math.cos(a) * rr, 0, Math.sin(a) * rr - 6]} s={1.8 + rnd(i + 9) * 1.2} kind="pine" color="#1b3a2e" seed={i} frame={f} wind={0.5} />; })}
    <Building position={[-6, 0, 2]} w={5} d={4} h={2.6} roof={0.6} color="#8a8f96" roofColor="#4a4e56" lit={0.6} frame={f} />
    <Mast position={[3, 0, -2]} h={28} f={f} />
    {buzz && Array.from({length: 4}, (_, i) => { const t = ((f * 0.02 + i / 4) % 1); return <mesh key={i} position={[3, 28, -2]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1 + t * 14, 0.1, 6, 36]} /><meshBasicMaterial color="#ff8a5a" transparent opacity={(1 - t) * 0.7} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>; })}
    <FogLayer y={1} size={150} layers={3} thickness={3} color="#aab8d8" opacity={0.28} frame={f} />
    <Particles kind="snow" center={[0, 8, 0]} area={[36, 16, 36]} count={220} frame={f} />
  </Stage>;
};

// ------------------------------------------------------------------ 3D: steel mill (Zug Island) with glowing stacks
export const MillShot = ({cam, big, pill, startSec, endSec, offAt = null}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh(); const off = offAt ? cue(VO, offAt, startSec) : 1e9; const on = f < off ? 1 : Math.max(0, 1 - (f - off) / 20);
  return <Stage palette={PAL.night} fog={[30, 200]} overlay={<Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />}>
    <CameraRig keys={keysOf(cam, d)} />
    <Stars opacity={0.7} count={160} />
    <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[400, 400]} /><meshLambertMaterial color="#0d2038" flatShading /></mesh>
    <mesh position={[0, 0, -10]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[120, 30]} /><meshLambertMaterial color="#2a2c30" flatShading /></mesh>
    {[-20, -9, 3, 14].map((x, i) => <group key={i} position={[x, 0, -10 - (i % 2) * 4]}>
      <mesh position={[0, 8, 0]}><cylinderGeometry args={[1.6, 2.4, 16, 8]} /><meshLambertMaterial color="#5a5048" flatShading /></mesh>
      <mesh position={[0, 16.2, 0]}><cylinderGeometry args={[1.8, 1.6, 0.5, 8]} /><meshBasicMaterial color={on > 0.1 ? '#ff7a2a' : '#2a1a14'} /></mesh>
      <Glow position={[0, 17, 0]} size={9 * on + 0.1} color="#ff7a2a" opacity={0.85 * on} />
      {on > 0.1 && <Particles kind="embers" center={[0, 20, 0]} area={[2, 10, 2]} count={30} frame={f + i * 9} />}
      <Particles kind="ash" center={[0, 24 + (i % 3), 0]} area={[3, 12, 3]} count={on > 0.1 ? 40 : 10} frame={f + i * 7} color={on > 0.1 ? '#8a8078' : '#4a4a50'} opacity={on > 0.1 ? 0.7 : 0.3} />
    </group>)}
    {[[-14, 0, -4, 8, 5], [8, 0, -3, 10, 4], [22, 0, -6, 6, 6]].map((b, i) => <mesh key={'s' + i} position={[b[0], b[3] / 2, b[2]]}><boxGeometry args={[b[4] + 3, b[3], 5]} /><meshLambertMaterial color="#3a3c42" flatShading /></mesh>)}
    {on > 0.1 && <pointLight position={[0, 14, -8]} color="#ff7a2a" intensity={26 * on} distance={50} />}
    <FogLayer y={0} size={300} layers={3} thickness={2} color="#8aa0c8" opacity={0.25} frame={f} />
  </Stage>;
};

// ------------------------------------------------------------------ 3D: pulsar (rotating neutron star, two beams)
export const PulsarShot = ({cam, big, pill, startSec, endSec, period = 32.1}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const a = (f / period) * Math.PI * 2;
  return <Stage palette={PAL.night} fog={[100, 400]} background="radial-gradient(ellipse at 50% 50%, #12183a 0%, #04050c 80%)" overlay={<Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />}>
    <CameraRig keys={keysOf(cam, d)} drift={0.05} />
    <Stars opacity={1} count={260} />
    <group rotation={[0.3, 0, 0.5]}>
      <group rotation={[0, a, 0]}>
        <mesh><icosahedronGeometry args={[1.5, 1]} /><meshBasicMaterial color="#dff4ff" /></mesh>
        <Glow position={[0, 0, 0]} size={9} color="#7fc8ff" opacity={0.8} />
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[0, 11, 0]}><coneGeometry args={[4.2, 22, 18, 1, true]} /><meshBasicMaterial color="#8fe6ff" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -11, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[4.2, 22, 18, 1, true]} /><meshBasicMaterial color="#8fe6ff" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
        </group>
      </group>
    </group>
    <Particles kind="motes" center={[0, 0, 0]} area={[30, 20, 30]} count={60} frame={f} color="#9fd8ff" />
  </Stage>;
};

// ------------------------------------------------------------------ 2D: bar-scale of the Wow! signal (1..9 then letters climb to U)
const ORDER = ['·', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
export const WowBarsShot = ({big, pill, startSec, endSec, seq = ['6', 'E', 'Q', 'U', 'J', '5'], circleAt, label = 'BIG EAR · 15 AUG 1977 · 11:16 PM'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const d = FR(endSec - startSec); const cs = cue(VO, circleAt, startSec);
  const idx = seq.map((c) => ORDER.indexOf(c));
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #16224a 0%, #060814 85%)'}}>
    <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', ...Lilita, fontSize: 40, color: '#7fe3ff', letterSpacing: 6, ...STROKE(8)}}>{label}</div>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 6}, (_, i) => <line key={i} x1={300} x2={1620} y1={760 - i * 90} y2={760 - i * 90} stroke="#24366a" strokeWidth={2} />)}
      {seq.map((c, i) => { const t = Math.round(FR(0.5) + i * FR(0.55)); const k = spring({frame: f - t, fps, config: {damping: 11, stiffness: 120}}); const h = Math.max(0, k) * (idx[i] / 30) * 480 + 20 * Math.max(0, k); const x = 400 + i * 190;
        const hot = c === 'U' && cs !== null && f >= cs - 2;
        return <g key={i} opacity={f >= t ? 1 : 0}><rect x={x} y={760 - h} width={120} height={h} rx={10} fill={c === 'U' ? pal().active : '#4fa8ff'} stroke="#0a0f22" strokeWidth={5} />
          <text x={x + 60} y={800 + 70} textAnchor="middle" fontFamily="Special Elite" fontSize={86} fill={hot ? pal().active : '#fff'}>{c}</text></g>; })}
      {cs !== null && f >= cs && <ellipse cx={960} cy={870} rx={640 * Math.min(1, (f - cs) / 8 + 0.2)} ry={92} fill="none" stroke={pal().alt} strokeWidth={9} />}
      {cs !== null && f >= cs + 6 && <text x={1500} y={960} fontFamily="Special Elite" fontSize={130} fill={pal().alt} transform={`rotate(-8 1500 960)`}>Wow!</text>}
    </svg>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: dot-matrix computer printout (rows of digits, one row circled)
export const PrintoutShot = ({big, pill, startSec, endSec, circleAt, rows = 16, hot = '6EQUJ5'}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh(); const cs = cue(VO, circleAt, startSec); const sc = easeInOut(clamp01(f / d));
  const lines = useMemo(() => Array.from({length: rows}, (_, r) => r === Math.floor(rows / 2) ? hot.split('').join('  ') : Array.from({length: 7}, (_, c) => { const v = rnd(r * 7 + c + 3); return v < 0.55 ? '·' : String(1 + Math.floor(v * 3)); }).join('  ')), [rows, hot]);
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #3a3226 0%, #120e0a 85%)'}}>
    <div style={{position: 'absolute', left: 520, top: -80 - sc * 60, width: 880, padding: '70px 60px', background: 'repeating-linear-gradient(0deg,#e9f1e0 0 62px,#d2e4c6 62px 124px)', transform: 'rotate(-2deg)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', borderLeft: '40px dotted #b9ccae', borderRight: '40px dotted #b9ccae', boxSizing: 'border-box'}}>
      {lines.map((l, i) => <div key={i} style={{fontFamily: 'Special Elite', fontSize: 52, height: 62, lineHeight: '62px', color: i === Math.floor(rows / 2) ? '#1a2a3a' : '#2a3a2a', letterSpacing: 8, textAlign: 'center'}}>{l}</div>)}
      {cs !== null && f >= cs && <div style={{position: 'absolute', left: 150, top: 70 + Math.floor(rows / 2) * 62 - 6, width: 580 * Math.min(1, (f - cs) / 8 + 0.2), height: 72, border: `8px solid ${pal().chip}`, borderRadius: 40}} />}
      {cs !== null && f >= cs + 6 && <div style={{position: 'absolute', left: 700, top: 70 + Math.floor(rows / 2) * 62 - 36, fontFamily: 'Special Elite', fontSize: 100, color: pal().chip, transform: 'rotate(-10deg)'}}>Wow!</div>}
    </div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: frequency dial + buzz waveform (UVB-76) / digits pad (numbers station)
export const BuzzShot = ({big, pill, startSec, endSec, freq = '4625', unit = 'kHz', rate = 25, msgAt, msg = [], label = 'SHORTWAVE', quiet = false}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh(); const ms = cue(VO, msgAt, startSec);
  const per = 60 / rate * FPS; const pts = []; for (let x = 0; x <= 1920; x += 6) { const t = (x / 6 + f * 1.4); const ph = (t % (per / 1.4)) / (per / 1.4); const amp = quiet || (ms !== null && f >= ms) ? 4 : (ph < 0.5 ? 150 : 4); pts.push(`${x},${660 - amp * (0.5 + 0.5 * Math.sin(x * 0.9 + f))}`); }
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1a2e24 0%, #050a08 85%)'}}>
    <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', ...Lilita, fontSize: 40, color: '#9be15d', letterSpacing: 8, ...STROKE(8)}}>{label}</div>
    <div style={{position: 'absolute', top: 310, width: '100%', textAlign: 'center', ...Lilita, fontSize: 250, color: '#fff', ...STROKE(16), lineHeight: 1}}>{freq}<span style={{fontSize: 90, color: pal().active}}> {unit}</span></div>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}><polyline points={pts.join(' ')} fill="none" stroke="#9be15d" strokeWidth={6} strokeLinejoin="round" /><line x1={0} x2={1920} y1={660} y2={660} stroke="#24442e" strokeWidth={2} /></svg>
    {ms !== null && f >= ms && <div style={{position: 'absolute', top: 700, width: '100%', textAlign: 'center', fontFamily: 'Special Elite', fontSize: 70, color: pal().active, letterSpacing: 6}}>{msg.map((m, i) => <div key={i} style={{opacity: f >= ms + i * 10 ? 1 : 0}}>{m}</div>)}</div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

export const DigitsShot = ({big, pill, startSec, endSec, groups = ['0 2 5 8 8', '4 1 7 0 3', '9 6 2 2 5', '1 8 3 4 0'], head = 'LINCOLNSHIRE POACHER · 5-DIGIT GROUPS', stampAt, stamp = 'LAST HEARD · 2008'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const st = cue(VO, stampAt, startSec);
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2a1a 0%, #0a0a06 85%)'}}>
    <div style={{position: 'absolute', left: 430, top: 250, width: 1060, background: 'linear-gradient(180deg,#f3ead2,#e2d4ae)', borderRadius: 8, padding: '36px 60px', boxSizing: 'border-box', transform: 'rotate(-1.2deg)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)'}}>
      <div style={{...Lilita, fontSize: 32, letterSpacing: 3, color: '#7a2a20', marginBottom: 14}}>{head}</div>
      {groups.map((g, i) => { const t = FR(0.4 + i * 0.7); const shown = Math.floor(clamp01((f - t) / 12) * g.length); return <div key={i} style={{fontFamily: 'Special Elite', fontSize: 98, letterSpacing: 14, color: '#2a2116', height: 112}}>{f >= t ? g.slice(0, shown) : ''}</div>; })}
    </div>
    {st !== null && f >= st && <div style={{position: 'absolute', right: 230, bottom: 150, transform: `rotate(-9deg) scale(${spring({frame: f - st, fps, config: {damping: 8, stiffness: 220}, from: 2.2, to: 1})})`, border: `10px solid ${pal().chip}`, color: pal().chip, ...Lilita, fontSize: 84, padding: '2px 30px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', letterSpacing: 4}}>{stamp}</div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: big stat card
export const StatShot = ({big, pill, startSec, endSec, number = 22000, text, label, sub, color = pal().active, bg = 'radial-gradient(ellipse at 50% 45%, #1a2850 0%, #060814 85%)', rings = false, decimals = 0, suffix = ''}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const n = number * easeOut(clamp01(f / (d * 0.5)));
  return <AbsoluteFill style={{background: bg}}>
    {rings && <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>{Array.from({length: 6}, (_, i) => { const t = ((f * 0.012 + i / 6) % 1); return <circle key={i} cx={960} cy={560} r={80 + t * 700} fill="none" stroke="#7fe3ff" strokeWidth={5} opacity={(1 - t) * 0.5} />; })}</svg>}
    <div style={{position: 'absolute', top: 370, width: '100%', textAlign: 'center', ...Lilita, fontSize: text ? 200 : 270, color: '#fff', ...STROKE(18), lineHeight: 1}}>{text ?? (decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US'))}{suffix}</div>
    <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', ...Lilita, fontSize: 70, color, ...STROKE(12), letterSpacing: 3}}>{label}</div>
    {sub && <div style={{position: 'absolute', top: 800, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 44, color: '#d8e0f0', ...STROKE(8)}}>{sub}</div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: hum scale 32-80 Hz with listeners
export const HumShot = ({big, pill, startSec, endSec}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: 'linear-gradient(180deg,#0a1030 0%,#1c2a5a 70%,#2a3a6a 100%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 7}, (_, i) => { const t = ((f * 0.011 + i / 7) % 1); return <ellipse key={i} cx={960} cy={420} rx={60 + t * 1100} ry={30 + t * 330} fill="none" stroke="#9fc0ff" strokeWidth={6} opacity={(1 - t) * 0.55} />; })}
      {[[120, 90, 190], [330, 120, 160], [520, 80, 210], [1150, 100, 180], [1390, 130, 150], [1600, 90, 200]].map((h, i) => <g key={i}><rect x={h[0]} y={900 - h[2]} width={h[1] + 40} height={h[2]} fill="#05070f" /><polygon points={`${h[0] - 10},${900 - h[2]} ${h[0] + 20 + (h[1] + 40) / 2},${860 - h[2]} ${h[0] + h[1] + 50},${900 - h[2]}`} fill="#05070f" />
        <rect x={h[0] + 24} y={900 - h[2] + 50} width={34} height={44} fill={rnd(i * 3) > 0.35 ? '#ffd27a' : '#1a2036'} /></g>)}
      <rect x={0} y={900} width={1920} height={180} fill="#05070f" />
      <rect x={300} y={560} width={1320} height={14} rx={7} fill="#24366a" />{[32, 40, 50, 60, 70, 80].map((hz, i) => <g key={hz}><line x1={300 + ((hz - 32) / 48) * 1320} x2={300 + ((hz - 32) / 48) * 1320} y1={540} y2={590} stroke="#9fc0ff" strokeWidth={4} /><text x={300 + ((hz - 32) / 48) * 1320} y={650} textAnchor="middle" fontFamily="Lilita One" fontSize={40} fill="#fff" stroke="#05070f" strokeWidth={8} paintOrder="stroke">{hz} Hz</text></g>)}
    </svg>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: CRT TV hijack (static -> black -> masked figure)
const Figure = ({f, soda = false}) => { const sway = Math.sin(f * 0.18) * 26; return <g transform={`translate(${sway},0)`}>
  <rect x={-250} y={520} width={500} height={300} fill="#1a2030" /><rect x={-70} y={470} width={140} height={90} fill="#c9a98a" />
  <ellipse cx={0} cy={330} rx={150} ry={190} fill="#d4dde6" stroke="#0a0f1a" strokeWidth={8} /><path d="M-155,300 Q0,90 155,300 Q130,220 0,200 Q-130,220 -155,300Z" fill="#e8c860" stroke="#0a0f1a" strokeWidth={6} />
  <rect x={-130} y={300} width={260} height={56} rx={10} fill="#10141c" /><rect x={-24} y={400} width={48} height={24} fill="#8a6a5a" /><path d="M-70,470 Q0,520 70,470" fill="none" stroke="#10141c" strokeWidth={10} />
  {soda && <g transform="translate(210,440)"><rect width={64} height={110} rx={10} fill={pal().chip} stroke="#fff" strokeWidth={5} /></g>}</g>; };
export const TvShot = ({big, pill, startSec, endSec, states = [{s: 0, t: 'static'}]}) => {
  const f = useCurrentFrame(); const {VO} = useCh(); const ss = states.map((e) => ({...e, f: Math.max(0, relF(VO, e, startSec))})).sort((a, b) => a.f - b.f); let cur = ss[0]; ss.forEach((e) => { if (f >= e.f) cur = e; });
  const noise = useMemo(() => null, []);
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a2418 0%, #0a0806 85%)'}}>
    <div style={{position: 'absolute', left: 360, top: 250, width: 1200, height: 760, background: '#4a3a28', borderRadius: 50, border: '10px solid #1a120a', boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}} />
    <div style={{position: 'absolute', left: 420, top: 300, width: 1080, height: 660, background: '#05070a', borderRadius: 60, overflow: 'hidden', border: '8px solid #0a0a0a'}}>
      <svg width="1080" height="660" viewBox="0 0 1080 660">
        {cur.t === 'static' && Array.from({length: 33}, (_, r) => Array.from({length: 54}, (_, c) => <rect key={r + '-' + c} x={c * 20} y={r * 20} width={20} height={20} fill={`hsl(0,0%,${Math.floor(rnd(r * 54 + c + f * 97) * 85)}%)`} />))}
        {(cur.t === 'mask' || cur.t === 'soda') && <g><rect width={1080} height={660} fill="#1a3a5a" />{Array.from({length: 14}, (_, i) => <rect key={i} x={0} y={i * 50 + ((f * 3) % 50)} width={1080} height={14} fill="#2a5a8a" opacity={0.7} />)}<g transform="translate(540,-95) scale(0.9)"><Figure f={f} soda={cur.t === 'soda'} /></g></g>}
        {cur.t === 'black' && <rect width={1080} height={660} fill="#000" />}
        <rect width={1080} height={660} fill="url(#scan)" opacity={0.0} />
        {Array.from({length: 66}, (_, i) => <rect key={'l' + i} x={0} y={i * 10} width={1080} height={3} fill="#000" opacity={0.22} />)}
      </svg>
    </div>
    <div style={{position: 'absolute', left: 1450, top: 990, width: 14, height: 14, borderRadius: 7, background: '#ff3a2a'}} />
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: pen-chart paper with a periodic pulse (Jocelyn Bell)
export const ChartShot = ({big, pill, startSec, endSec, period = 1.337, stampAt, stamp = 'LGM-1', label = 'CAMBRIDGE · 1967 · PEN CHART'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const st = cue(VO, stampAt, startSec); const pp = period * FPS * 4.4;
  const path = []; for (let x = 0; x <= 1500; x += 5) { const g = x + f * 4.4; const ph = (g % pp) / pp; const spike = ph < 0.05 ? Math.sin((ph / 0.05) * Math.PI) * 190 : 0; path.push(`${x},${540 - spike - (rnd(Math.floor(g / 5)) - 0.5) * 34}`); }
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #3a3226 0%, #120e0a 85%)'}}>
    <div style={{position: 'absolute', left: 180, top: 220, width: 1560, height: 640, background: '#f1ead4', transform: 'rotate(-1deg)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', overflow: 'hidden'}}>
      <svg width="1560" height="640" viewBox="0 -140 1560 640" style={{position: 'absolute', inset: 0}}>
        <g transform="translate(30,-160)">{Array.from({length: 25}, (_, i) => <line key={i} x1={i * 60} x2={i * 60} y1={0} y2={800} stroke="#e0b8b0" strokeWidth={2} />)}{Array.from({length: 14}, (_, i) => <line key={'h' + i} x1={0} x2={1500} y1={i * 60 + 140} y2={i * 60 + 140} stroke="#e0b8b0" strokeWidth={2} />)}
          <polyline points={path.join(' ')} fill="none" stroke="#1a2a5a" strokeWidth={4} strokeLinejoin="round" /></g>
      </svg>
      <div style={{position: 'absolute', left: 30, top: 18, fontFamily: 'Special Elite', fontSize: 34, color: '#5a4a30'}}>{label}</div>
      <div style={{position: 'absolute', right: 40, top: 20, fontFamily: 'Special Elite', fontSize: 40, color: '#7a2a20'}}>{period} s</div>
    </div>
    {st !== null && f >= st && <div style={{position: 'absolute', right: 210, bottom: 120, transform: `rotate(-8deg) scale(${spring({frame: f - st, fps, config: {damping: 8, stiffness: 220}, from: 2.2, to: 1})})`, border: '10px solid #3fae4a', color: '#3fae4a', ...Lilita, fontSize: 100, padding: '2px 34px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', letterSpacing: 4}}>{stamp}</div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2D: outro end-card (subscribe + next video)
export const EndCardShot = ({big, pill, startSec, endSec, subscribeAt, title = 'VANISHED WITHOUT A TRACE', sub = 'WATCH NEXT'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const sb = cue(VO, subscribeAt, startSec) ?? 1e9; const sp = f >= sb ? spring({frame: f - sb, fps, config: {damping: 10, stiffness: 150}}) : 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1a2850 0%, #060814 85%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>{Array.from({length: 5}, (_, i) => { const t = ((f * 0.01 + i / 5) % 1); return <circle key={i} cx={960} cy={440} r={60 + t * 620} fill="none" stroke="#7fe3ff" strokeWidth={4} opacity={(1 - t) * 0.35} />; })}</svg>
    <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', ...Lilita, fontSize: 56, color: '#9be15d', ...STROKE(10), letterSpacing: 6}}>{sub}</div>
    <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', ...Lilita, fontSize: 130, color: '#fff', ...STROKE(16), lineHeight: 1.05}}>{title}</div>
    {sp > 0 && <div style={{position: 'absolute', left: 560, top: 640, width: 800, height: 130, transform: `scale(${sp})`, background: pal().chip, border: '6px solid #141414', borderRadius: 66, display: 'flex', alignItems: 'center', justifyContent: 'center', ...Lilita, fontSize: 66, color: '#fff', letterSpacing: 3}}>SUBSCRIBE · IA UNFOLDS</div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ------------------------------------------------------------------ 2 s IA brand sting (inserted after the cold open, no VO)
export const StingShot = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f, fps, config: {damping: 9, stiffness: 140}}); const out = clamp01((f - 38) / 10);
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #12204a 0%, #04060e 85%)', opacity: 1 - out}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>{Array.from({length: 4}, (_, i) => { const t = clamp01((f - i * 5) / 30); return <circle key={i} cx={960} cy={540} r={40 + t * 760} fill="none" stroke="#7fe3ff" strokeWidth={6} opacity={(1 - t) * 0.7} />; })}</svg>
    <div style={{position: 'absolute', top: 410, width: '100%', textAlign: 'center', ...Lilita, fontSize: 190, color: '#fff', ...STROKE(18), letterSpacing: 8, transform: `scale(${0.7 + 0.3 * s})`, opacity: clamp01(s * 1.5)}}>IA <span style={{color: pal().active}}>UNFOLDS</span></div>
    <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 44, color: '#9be15d', letterSpacing: 10, ...STROKE(8), opacity: clamp01((f - 10) / 8)}}>TRUE MYSTERIES · UNFOLDED</div>
  </AbsoluteFill>;
};
