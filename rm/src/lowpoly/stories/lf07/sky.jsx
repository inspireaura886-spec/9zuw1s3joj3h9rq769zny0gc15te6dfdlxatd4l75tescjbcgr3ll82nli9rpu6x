import {pal} from '../../../palette.js'; // HUMANE caption palette 2026-11-03
// LF04 "Things in the Sky" (FILE 004) shot components, 1920x1080 @ 24 fps. Same overlay system as shots.jsx (big/pill with {l,w} word cues).
import * as THREE from 'three';
import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Particles, Tree, Building, FogLayer, Ocean, Smoke, Burst, Shockwave, LightCone, clamp01, easeOut, easeInOut} from '../../kit/index.js';
import {FR, FPS, PAL, useCh, relF, TimedOverlays, BigE, PillE, STROKE} from './shots.jsx';

const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Ov = ({big, pill, startSec, endSec}) => <>
  <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
  <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
</>;
const keysOf = (cam, d) => cam.map((k) => ({...k, f: Math.round(k.t * d)}));
const cue = (VO, e, startSec) => (e ? Math.max(0, relF(VO, e, startSec)) : null);
const Lilita = {fontFamily: 'Lilita One'};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const RecTag = () => <div style={{position: 'absolute', right: 96, bottom: 250, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.75, ...STROKE(6)}}>ILLUSTRATIVE RECREATION</div>;

// ---------------------------------------------------------------- glowing objects
const Fireball = ({p, f, color = '#ffb060', size = 1.6}) => <group position={p}>
  <Orb position={[0, 0, 0]} radius={size} color="#fff3d0" />
  <Glow position={[0, 0, 0]} size={size * 7} color={color} opacity={0.85} />
  <Glow position={[0, 0, 0]} size={size * 14} color={color} opacity={0.25} />
</group>;
const Disc = ({p, f, scale = 1}) => <group position={[p[0], p[1] + Math.sin(f * 0.07) * 0.25, p[2]]} scale={scale}>
  <mesh scale={[1, 0.28, 1]}><sphereGeometry args={[3.4, 18, 10]} /><meshLambertMaterial color="#cfd6de" flatShading /></mesh>
  <mesh position={[0, 0.55, 0]}><sphereGeometry args={[1.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshLambertMaterial color="#e8eef5" flatShading /></mesh>
  <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.0, 0.08, 5, 24]} /><meshBasicMaterial color="#9fe0ff" /></mesh>
</group>;
const RectLights = ({p, f}) => <group position={p}>
  <mesh><boxGeometry args={[7, 1.6, 0.6]} /><meshBasicMaterial color="#ffc070" /></mesh>
  <Glow position={[0, 0, 0]} size={13} color="#ff9a40" opacity={0.7} />
  {Array.from({length: 6}, (_, i) => <group key={i}><mesh position={[-6 - i * 2.4, Math.sin(i * 1.7 + f * 0.05) * 0.9, 0]}><sphereGeometry args={[0.32, 6, 5]} /><meshBasicMaterial color="#ffe0a0" /></mesh><Glow position={[-6 - i * 2.4, Math.sin(i * 1.7 + f * 0.05) * 0.9, 0]} size={2.4} color="#ffc070" opacity={0.6} /></group>)}
</group>;
const Plane = ({p}) => <group position={p}>
  <mesh><boxGeometry args={[14, 1.5, 1.5]} /><meshLambertMaterial color="#dfe4ee" flatShading /></mesh>
  <mesh position={[0.5, 0, 0]}><boxGeometry args={[2.2, 0.2, 14]} /><meshLambertMaterial color="#c4cad6" flatShading /></mesh>
  <mesh position={[-6, 1.4, 0]}><boxGeometry args={[1.6, 2.4, 0.2]} /><meshLambertMaterial color="#c4cad6" flatShading /></mesh>
  <mesh position={[0.5, 0, 7]}><sphereGeometry args={[0.28, 6, 5]} /><meshBasicMaterial color="#ff3a2a" /></mesh>
  <mesh position={[0.5, 0, -7]}><sphereGeometry args={[0.28, 6, 5]} /><meshBasicMaterial color="#40ff70" /></mesh>
</group>;

// ---------------------------------------------------------------- 3D scene: sky over harbour / forest / school field / Rendlesham / airliner
export const SkyShot = ({scene = 'forest', cam, big, pill, startSec, endSec, kind = 'orb', from = [-60, 70, -90], to = [20, 2, -30], objAt = 0, objDur = 5, arrived = false, smoke = false, pass = false,
  circles = 0, circleAt = null, jets = 0, lighthouse = false, lights = false, rec = true, stars = 0.9}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh();
  const sf = typeof objAt === 'object' ? cue(VO, objAt, startSec) : FR(objAt); const cs = circleAt ? cue(VO, circleAt, startSec) : null;
  const dur = FR(objDur); const p = arrived ? 1 : clamp01((f - sf) / dur); const shown = arrived || f >= sf;
  const e = pass ? p : p * p * (1.2 - 0.2 * p); const pos = mix(from, to, e);
  const landed = !pass && !arrived && p >= 1; const land = FR(0) + sf + dur;
  const day = scene === 'field'; const pal = day ? 'grey' : 'night';
  const tail = [1, 2, 3, 4, 5, 6].map((k) => mix(from, to, Math.max(0, e - k * 0.012)));
  const obj = shown ? (kind === 'disc' ? <Disc p={pos} f={f} scale={1.2} /> : kind === 'rect' ? <RectLights p={pos} f={f} /> : <>
    <Fireball p={pos} f={f} size={scene === 'harbour' ? 1.1 : 1.6} />{!arrived && tail.map((q, i) => <Glow key={i} position={q} size={5 - i * 0.7} color="#ff9a40" opacity={0.5 - i * 0.07} />)}</>) : null;
  return <Stage palette={PAL[pal]} fog={day ? [60, 260] : [30, 200]} overlay={<><Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />{rec && <RecTag />}</>}>
    {cam && <CameraRig keys={keysOf(cam, d)} drift={0.04} />}
    {!day && <Stars opacity={stars} count={220} />}
    {scene === 'harbour' && <><Orb position={[-70, 55, -130]} radius={3.6} color="#f1eed8" /><Glow position={[-70, 55, -129]} size={30} color="#9fc0ff" opacity={0.4} /></>}

    {scene === 'harbour' && <>
      <Ocean position={[0, -0.25, -70]} size={[300, 160]} seg={120} frame={f} amp={0.1} deep="#040e20" face="#061630" foam="#3a5a88" />
      <mesh position={[0, 0.02, 14]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[320, 34]} /><meshLambertMaterial color="#17261f" flatShading /></mesh>
      {[-70, -58, -47, -36].map((x, i) => <Building key={i} position={[x, 0, 0 + (i % 2) * 2]} w={4.2} d={3.6} h={2.8} roof={1.1} color={i % 2 ? '#8a8f98' : '#9a8a78'} roofColor="#3a3e4a" lit={0.9} frame={f} />)}
      {Array.from({length: 14}, (_, i) => <Glow key={'fs' + i} position={[-80 + i * 12 + rnd(i) * 5, 1.2, -118]} size={2.4} color="#ffd27a" opacity={0.6} />)}
      {[0, 1, 2, 3].map((i) => <mesh key={'w' + i} position={[-30 + i * 1.7, 0.5, -1]}><boxGeometry args={[0.35, 1.0, 6]} /><meshLambertMaterial color="#4a3a2a" flatShading /></mesh>)}
      {obj}
      {shown && (landed || arrived) && <><Glow position={[to[0], 0.6, to[2]]} size={11 + Math.sin(f * 0.2) * 1.2} color="#ffcf70" opacity={0.55} /><pointLight position={[to[0], 2, to[2]]} color="#ffcf70" intensity={14} distance={50} /></>}
      {landed && <><Shockwave position={[to[0], 0.2, to[2]]} start={land} frame={f} radius={14} life={30} color="#cfe6ff" /><Burst kind="sparks" position={[to[0], 0.4, to[2]]} start={land} frame={f} count={50} color="#cfe6ff" /></>}
      <FogLayer y={0.4} size={260} layers={3} thickness={2} color="#7088b8" opacity={0.2} frame={f} />
    </>}

    {(scene === 'forest' || scene === 'rendlesham') && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[170, 30]} /><meshLambertMaterial color={scene === 'forest' ? '#162a20' : '#1a2418'} flatShading /></mesh>
      {Array.from({length: scene === 'forest' ? 70 : 90}, (_, i) => { const a = i * 0.7 + rnd(i) ; const r = (scene === 'forest' ? 30 : 8) + rnd(i + 3) * 80; const tx = Math.cos(a) * r, tz = Math.sin(a) * r - 30; if (scene === 'forest' ? (tz > -50 && Math.abs(tx) < 55) : ((tz > -6 && Math.abs(tx) < 40) || (Math.abs(tx) < 16 && tz > -34) || (lighthouse && tx > 12 && tz > -90))) return null; return <Tree key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r - 30]} s={2 + rnd(i + 7) * 2} kind="pine" color={scene === 'forest' ? '#1a3a2a' : '#1c3622'} seed={i} frame={f} />; })}
      {obj}
      {landed && <><Shockwave position={[to[0], 0.3, to[2]]} start={land} frame={f} radius={10} life={26} color="#ffd9a0" /><Burst kind="sparks" position={[to[0], 0.6, to[2]]} start={land} frame={f} count={70} color="#ffb060" /><pointLight position={[to[0], 3, to[2]]} color="#ffb060" intensity={20} distance={60} /></>}
      {smoke && (landed || p > 0.9) && <Smoke position={[to[0], 0, to[2]]} frame={f} count={14} height={10} color="#8fb4ff" opacity={0.4} size={2.4} />}
      {lights && <>{[['#ff3a2a', 0], ['#3a7aff', 2.1], ['#ffffff', 4.2], ['#ffcf70', 1.2]].map(([c, ph], i) => { const on = 0.5 + 0.5 * Math.sin(f * 0.22 + ph); return <group key={i} position={[(i - 1.5) * 1.5, 3 + (i % 2) * 1.2 + Math.sin(f * 0.04 + i) * 0.3, -24 + (i % 2) * 2]}><mesh><sphereGeometry args={[0.38, 8, 6]} /><meshBasicMaterial color={c} /></mesh><Glow position={[0, 0, 0]} size={6 + on * 5} color={c} opacity={0.4 + 0.5 * on} /></group>; })}
        <mesh position={[0, 2.6, -23]} scale={[1, 0.45, 1]}><sphereGeometry args={[3.2, 14, 8]} /><meshLambertMaterial color="#9aa4b4" flatShading /></mesh></>}
      {lighthouse && <group position={[70, 0, -80]}><mesh position={[0, 7, 0]}><cylinderGeometry args={[1.1, 2, 14, 8]} /><meshLambertMaterial color="#e8e8ee" flatShading /></mesh><mesh position={[0, 14.6, 0]}><boxGeometry args={[1.8, 1.6, 1.8]} /><meshBasicMaterial color="#fff2b0" /></mesh>
        <Glow position={[0, 14.6, 0]} size={9} color="#fff2b0" opacity={0.8} /><group position={[0, 14.6, 0]} rotation={[0, f * 0.05, 0]}><LightCone position={[0, 0, 0]} dir={[-1, -0.05, 0]} length={90} radius={14} color="#fff2b0" opacity={0.22} frame={f} /></group></group>}
      <FogLayer y={0.8} size={220} layers={3} thickness={2.5} color="#6a80a8" opacity={0.2} frame={f} />
      <Particles kind="motes" center={[0, 6, -10]} area={[40, 10, 40]} count={30} frame={f} />
    </>}

    {scene === 'field' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[200, 30]} /><meshLambertMaterial color="#6a8a4a" flatShading /></mesh>
      {Array.from({length: 16}, (_, i) => <Tree key={i} position={[-44 + i * 5.8, 0, -38 - (i % 3)]} s={2.6 + rnd(i) * 1.2} kind="pine" color="#3f6a35" seed={i} frame={f} />)}
      <Building position={[-34, 0, -14]} w={18} d={7} h={4.6} roof={1.4} color="#c9b89a" roofColor="#7a4a3a" lit={0.2} frame={f} />
      {obj}
      {jets > 0 && Array.from({length: jets}, (_, i) => { const a = f * 0.012 + i * (Math.PI * 2 / jets); return <group key={i} position={[Math.cos(a) * 34, 26 + i * 1.5, -30 + Math.sin(a) * 14]} rotation={[0, -a, 0]}><mesh><boxGeometry args={[3.2, 0.5, 0.6]} /><meshLambertMaterial color="#5a6270" flatShading /></mesh><mesh><boxGeometry args={[0.8, 0.12, 3.2]} /><meshLambertMaterial color="#4a5260" flatShading /></mesh></group>; })}
      {circles > 0 && cs !== null && f >= cs && Array.from({length: circles}, (_, i) => <mesh key={i} position={[-5 + i * 7.5, 0.04, -22 + (i % 2) * 3]} rotation={[-Math.PI / 2, 0, 0]} scale={Math.min(1, (f - cs - i * 6) / 10 + 0.01)}><circleGeometry args={[3, 22]} /><meshBasicMaterial color="#2a2418" transparent opacity={0.75} /></mesh>)}
      <Particles kind="dust" center={[0, 4, -20]} area={[40, 8, 30]} count={40} frame={f} />
    </>}

    {scene === 'air' && <>
      <mesh position={[0, -34, -40]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[500, 300]} /><meshBasicMaterial color="#0a1226" /></mesh>
      <FogLayer y={-12} size={260} layers={5} thickness={5} color="#5a6a98" opacity={0.3} frame={f} />
      <Plane p={[-4 + f * 0.05, 4, -28]} />
      <RectLights p={[14 + f * 0.05, 5.4, -28]} f={f} />
    </>}
  </Stage>;
};

// ---------------------------------------------------------------- 2D: radar scope with 4 stationary blips
export const RadarShot = ({big, pill, startSec, endSec, brightAt}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const bs = cue(VO, brightAt, startSec); const R = 330; const cx = 960, cy = 630;
  const blips = [[-150, -90], [90, -170], [170, 40], [-60, 120]]; const ang = f * 0.07;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0f2a1c 0%, #040a06 85%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {[0.25, 0.5, 0.75, 1].map((k) => <circle key={k} cx={cx} cy={cy} r={R * k} fill="none" stroke="#2f7a4a" strokeWidth={3} opacity={0.7} />)}
      <line x1={cx - R} x2={cx + R} y1={cy} y2={cy} stroke="#1f5a34" strokeWidth={2} /><line x1={cx} x2={cx} y1={cy - R} y2={cy + R} stroke="#1f5a34" strokeWidth={2} />
      <path d={`M${cx},${cy} L${cx + R * Math.cos(ang)},${cy + R * Math.sin(ang)} A${R},${R} 0 0 0 ${cx + R * Math.cos(ang - 0.5)},${cy + R * Math.sin(ang - 0.5)} Z`} fill="#4aff8a" opacity={0.22} />
      <line x1={cx} y1={cy} x2={cx + R * Math.cos(ang)} y2={cy + R * Math.sin(ang)} stroke="#7dffaa" strokeWidth={5} />
      {blips.map((b, i) => { const hot = bs !== null && f >= bs; const t = hot ? spring({frame: f - bs - i * 4, fps, config: {damping: 8, stiffness: 160}}) : 0;
        return <g key={i}><circle cx={cx + b[0]} cy={cy + b[1]} r={16} fill={hot ? pal().active : '#7dffaa'} opacity={0.9} /><circle cx={cx + b[0]} cy={cy + b[1]} r={30 + 16 * Math.sin(f * 0.2 + i)} fill="none" stroke={hot ? pal().active : '#7dffaa'} strokeWidth={3} opacity={0.6} />
          {hot && <circle cx={cx + b[0]} cy={cy + b[1]} r={44 * Math.max(0, t)} fill="none" stroke={pal().alt} strokeWidth={6} />}</g>; })}
    </svg>
    <div style={{position: 'absolute', top: 205, width: '100%', textAlign: 'center', ...Lilita, fontSize: 42, color: '#7dffaa', letterSpacing: 6, ...STROKE(8)}}>{bs !== null && f >= bs ? 'THEN HE LOOKED UP · 4 BRIGHT OBJECTS' : '4 STATIONARY BLIPS ON RADAR'}</div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- 2D: seismograph trace with a shock-wave burst
export const SeismoShot = ({big, pill, startSec, endSec, hitAt, label = 'SEISMOGRAPH · 25 MILES SW OF DETROIT'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh(); const hs = cue(VO, hitAt, startSec) ?? FR(2);
  const path = []; for (let x = 0; x <= 1500; x += 4) { const g = x / 4 + f * 1.0; const t0 = hs * 1.0 + 100; const dt = g - t0; const burst = dt > 0 ? Math.exp(-dt / 70) * 150 * Math.sin(dt * 0.9) : 0; path.push(`${x},${300 - burst - (rnd(Math.floor(g)) - 0.5) * 10}`); }
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #3a3226 0%, #120e0a 85%)'}}>
    <div style={{position: 'absolute', left: 180, top: 340, width: 1560, height: 540, background: '#f1ead4', transform: 'rotate(-1deg)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', overflow: 'hidden'}}>
      <svg width="1560" height="540" viewBox="0 -30 1560 540" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 27}, (_, i) => <line key={i} x1={i * 60} x2={i * 60} y1={0} y2={600} stroke="#e0b8b0" strokeWidth={2} />)}
        {Array.from({length: 11}, (_, i) => <line key={'h' + i} x1={0} x2={1560} y1={i * 60} y2={i * 60} stroke="#e8cfc8" strokeWidth={1.5} />)}
        <polyline points={path.join(' ')} fill="none" stroke="#1a2a5a" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 30, top: 18, fontFamily: 'Special Elite', fontSize: 34, color: '#5a4a30'}}>{label}</div>
    </div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- 2D: triangulating a fireball's path from two photographs
export const TriShot = ({big, pill, startSec, endSec, stamp = '4:43 PM'}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const k = easeInOut(clamp01(f / (d * 0.7)));
  const A = [420, 730], B = [1300, 760], P1 = [520, 330], P2 = [1380, 420]; const L = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #12304a 0%, #060c18 85%)'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 13}, (_, i) => <line key={i} x1={i * 160} y1={0} x2={i * 160} y2={1080} stroke="#1e4366" strokeWidth={1} opacity={0.5} />)}
      {Array.from({length: 8}, (_, i) => <line key={'h' + i} x1={0} y1={i * 160} x2={1920} y2={i * 160} stroke="#1e4366" strokeWidth={1} opacity={0.5} />)}
      <line x1={P1[0]} y1={P1[1]} x2={L(P1, P2, k)[0]} y2={L(P1, P2, k)[1]} stroke="#ffb060" strokeWidth={10} strokeDasharray="26 14" strokeLinecap="round" />
      {[[A, P1], [A, P2], [B, P1], [B, P2]].map(([s, e], i) => { const q = L(s, e, clamp01(k * 1.4 - i * 0.1)); return <line key={i} x1={s[0]} y1={s[1]} x2={q[0]} y2={q[1]} stroke="#7fe3ff" strokeWidth={4} opacity={0.8} />; })}
      {[[A, 'PHOTO 1'], [B, 'PHOTO 2']].map(([p, t]) => <g key={t}><circle cx={p[0]} cy={p[1]} r={22} fill={pal().active} stroke="#141414" strokeWidth={5} /><text x={p[0]} y={p[1] + 70} textAnchor="middle" fontFamily="Lilita One" fontSize={44} fill="#fff" stroke="#141414" strokeWidth={9} paintOrder="stroke" letterSpacing={3}>{t}</text></g>)}
      <circle cx={L(P1, P2, k)[0]} cy={L(P1, P2, k)[1]} r={20} fill="#ff9a40" stroke="#fff" strokeWidth={5} />
    </svg>
    <div style={{position: 'absolute', top: 200, right: 140, ...Lilita, fontSize: 110, color: pal().active, ...STROKE(14), opacity: clamp01((f - FR(1)) / 8)}}>{stamp}</div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- 2D: lined notebook, handwritten lines typed out (the 'WRITE IT DOWN' motif)
export const NotebookShot = ({big, pill, startSec, endSec, head = 'FILE 007 · FIELD NOTES', lines = ['TIME:', 'DIRECTION:', 'WITNESSES:'], hi = [], underline = false, typeSecs = 2.2}) => {
  const f = useCurrentFrame(); const all = lines.join('\n').length; const shown = Math.floor(clamp01(f / FR(typeSecs)) * all); let used = 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #2a2218 0%, #0a0806 85%)'}}>
    <div style={{position: 'absolute', left: 360, top: 200, width: 1200, height: 740, background: '#f4ecd6', transform: 'rotate(-1.4deg)', boxShadow: '0 40px 90px rgba(0,0,0,0.75)', borderRadius: 6, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 90, top: 0, bottom: 0, width: 3, background: '#d88a80'}} />
      {Array.from({length: 11}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 150 + i * 56, height: 2, background: '#b8c8e0', opacity: 0.8}} />)}
      <div style={{position: 'absolute', left: 120, top: 36, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 34, letterSpacing: 4, color: '#7a2a20'}}>{head}</div>
      <div style={{position: 'absolute', left: 120, top: 100}}>{lines.map((l, i) => { const vis = l.slice(0, Math.max(0, shown - used)); used += l.length + 1;
        return <div key={i} style={{fontFamily: 'Special Elite', fontSize: 54, lineHeight: '56px', height: 56, marginBottom: 0, color: hi.includes(i) ? '#9a1d14' : '#1f2a4a', whiteSpace: 'nowrap', textDecoration: underline && hi.includes(i) ? 'underline' : 'none'}}>{vis}</div>; })}</div>
    </div>
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};
