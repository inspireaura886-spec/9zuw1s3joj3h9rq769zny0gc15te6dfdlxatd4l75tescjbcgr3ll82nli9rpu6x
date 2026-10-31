import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Stage, CameraRig, Stars, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Person, Glow, Ripples,
  clamp01, easeOut, easeInOut, rng, hash2} from '../../kit/index.js';
import {Flash, flashAt, PhotoCard, DocCard, Fonts2, Seg} from '../common.jsx';
import {Desert, FlysEye, Mirror, MIRROR_POS, Particle, AirShower, Baseball, Ring, Galaxy, Stations, QMark, PHYS, Limit, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30;
const LS = VO.line_starts.map((s) => Math.round(s * FPS));
export const OMG_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(txt)); return w ? Math.round(w[1] * FPS) : LS[fromLine]; };

// palettes: neon desert night (violet -> magenta horizon), deep-space nebula, blueprint lab
const NIGHT = {top: '#0b0538', mid: '#3d1c94', hor: '#e0589e', fog: '#4a2a98', amb: 0.95, hemiSky: '#a99aff', hemiGround: '#5a3a70', hemiI: 1.5, sun: '#b9ccff', sunI: 2.3, sunPos: [-20, 40, 20], rim: '#ff80e6', rimI: 2.2, rimPos: [25, 18, -45], glow: 1};
const SPACE = {...NIGHT, top: '#08063a', mid: '#2b1a8a', hor: '#2a7ad0', fog: '#1a1470', amb: 1.2, hemiGround: '#2a2a80', sunI: 2.6};
const LAB = {top: '#0c3a78', mid: '#1b66b8', hor: '#58b8f0', fog: '#1b66b8', amb: 1.3, hemiSky: '#e0f0ff', hemiGround: '#123a6b', hemiI: 1.4, sun: '#ffffff', sunI: 2.4, sunPos: [10, 30, 20], rim: '#9fe8ff', rimI: 1.6, rimPos: [-10, 10, -30], glow: 0};
const NEBULA = 'radial-gradient(ellipse at 22% 26%, #7a34e0 0%, transparent 52%), radial-gradient(ellipse at 80% 72%, #1496d0 0%, transparent 55%), radial-gradient(ellipse at 60% 20%, #c0348e 0%, transparent 40%), linear-gradient(180deg,#160c5c,#1d1a80)';
const GOLD = '#ffd93b';
const Moon = () => <><mesh position={[-70, 52, -120]}><icosahedronGeometry args={[5, 0]} /><meshBasicMaterial color="#fff2d8" fog={false} /></mesh><Glow position={[-70, 52, -119]} size={40} color="#b9a0ff" opacity={0.55} /></>;
const FROM = [24, 100, -46], TO = [0, 0, -9];

// ---------- S1a: hook. a streak slams into the sky over the mirrors ----------
const S1a = () => {
  const f = useCurrentFrame(); const d = wordAt('thrown') ;
  const t = 0.42 + f * 0.058; const hit = f >= 10; const fl = (i) => hit ? clamp01(1 - (f - 10) / 46) * (i % 2 ? 1 : 0.75) : 0;
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Pill text="UTAH · 1991" y={236} variant="yellow" delay={-20} />
    <Headline y={318} lines={[{text: 'THE PARTICLE THAT', color: 'white', size: 78}, {text: 'SHOULD NOT EXIST', color: 'yellow', size: 98}]} delay={-20} />
    <Flash at={[10]} k={0.85} len={9} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-5, 2.0, 17], look: [0, 18, -9], fov: 60}, {f: d, pos: [-1, 2.8, 9], look: [0, 14, -9], fov: 54}]} shake={0.5} shakeFrom={10} shakeLen={22} />
    <Stars opacity={0.85} count={260} /><Moon />
    <Desert frame={f} /><FlysEye frame={f} flashFn={fl} />
    <Particle from={FROM} to={TO} t={Math.min(1, t)} trail={34} size={7} />
    <AirShower apex={[0, 48, -9]} base={[0, 0, -9]} u={(f - 10) / 26} radius={11} opacity={clamp01(1 - (f - 40) / 60)} />
  </Stage>;
};

// ---------- S1b: pitcher throws a baseball: same energy as the speck ----------
const S1b = () => {
  const f = useCurrentFrame(); const base = LS[0] + wordAt('thrown'); const d = LS[1] - wordAt('thrown'); const tE = wordAt('explain') - wordAt('thrown');
  const th = clamp01((f - 34) / 60); const bx = -3.0 + th * 8.2, by = 2.3 + Math.sin(th * Math.PI) * 2.6, bz = 5;
  const px = -4.2, pz = 5; const land = f > 94;
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Pill text="ENERGY OF A THROWN BASEBALL" y={250} variant="white" delay={2} size={38} />
    <Headline y={330} lines={[{text: '1 TINY PARTICLE', color: 'yellow', size: 92}, {text: '= 1 BASEBALL', color: 'white', size: 92}]} delay={14} />
    {f >= tE && <Pill text="NOTHING CAN EXPLAIN IT" y={1080} variant="red" delay={tE} size={46} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [-1, 2.4, 25], look: [-2, 2.6, 5], fov: 56}, {f: 50, pos: [0, 2.8, 23], look: [0.5, 2.6, 5], fov: 54}, {f: d, pos: [3.5, 3, 19], look: [5, 2.2, 5], fov: 48}]} />
    <Stars opacity={0.8} count={220} /><Moon />
    <Desert frame={f} /><FlysEye frame={f} flashFn={(i) => 0.15 * (0.5 + 0.5 * Math.sin(f * 0.2 + i))} origin={[6, 0, -12]} />
    <Person position={[px, height(px, pz), pz]} rotation={Math.PI / 2} scale={1.8} pose="stand" phase={f / 6} wave={f > 8 && f < 34} shirt="#e8eef8" pants="#2a3350" hair="#2a1d16" skin="#e0b48e" />
    {th > 0 && !land && <><Baseball position={[bx, by, bz]} spin={f * 0.5} scale={1.3} />
      {[1, 2, 3, 4].map((k) => <Glow key={k} position={[bx - k * 0.7, by - Math.sin(Math.PI * Math.max(0, th - k * 0.02)) * 0 - k * 0.05, bz]} size={1.6 - k * 0.25} color="#ffffff" opacity={0.5 - k * 0.1} />)}</>}
    {land && <><Glow position={[5.2, 1.9, bz]} size={4.5 + Math.sin(f * 0.4)} color="#7fe8ff" opacity={0.95} /><Glow position={[5.2, 1.9, bz]} size={1.8} color="#ffffff" opacity={1} /></>}
    {f > 40 && !land && <Glow position={[5.2, 1.9, bz]} size={1.1} color="#ffffff" opacity={0.8} />}
  </Stage>;
};

// ---------- S2: Fly's Eye watches the sky (real photo of the Utah desert) ----------
const S2 = () => {
  const f = useCurrentFrame(); const d = LS[2] - LS[1]; const tc = 78;
  const flick = (i) => { const k = Math.floor((f + i * 7) / 6); return hash2(k, i, 4) > 0.9 ? 0.9 : 0.12 * (0.5 + 0.5 * Math.sin(f * 0.15 + i)); };
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    {f < tc && <PhotoCard src="omg/IMG2.jpg" credit="Great Salt Lake Desert, Utah · photo: David Jolley, CC BY-SA 3.0" tag="UTAH WEST DESERT" dur={tc} zoom={[1.02, 1.16]} pan={[10, -20]} />}
    {f >= tc && <><Pill text="15 OCT 1991 · DUGWAY, UTAH" y={236} variant="yellow" delay={tc} size={36} />
      <Headline y={318} lines={[{text: "FLY'S EYE", color: 'white', size: 100}, {text: 'WATCHING THE SKY', color: 'yellow', size: 80}]} delay={tc + 2} /></>}
  </>}>
    <CameraRig orbit={{center: [0, 1.5, 0], radius: 24, height: 5, from: -0.75, to: 0.55, start: 0, end: d, lookY: 1, fov: 52}} />
    <Stars opacity={0.85} count={260} /><Moon />
    <Desert frame={f} /><FlysEye frame={f} flashFn={flick} />
    {[0, 1, 2].map((k) => { const c = ((f + k * 53) % 120) / 120; const sx = -40 + k * 30; return <Particle key={k} from={[sx, 70, -50]} to={[sx + 40, 38, -10]} t={c} trail={9} size={2.4} opacity={Math.sin(Math.PI * c)} />; })}
  </Stage>;
};

// ---------- S3a: ONE mirror catches a monster streak ----------
const S3a = () => {
  const f = useCurrentFrame(); const d = wordAt('energy', 2) - LS[2]; const t = clamp01(f / 26);
  const pulse = clamp01(1 - Math.max(0, f - 14) / 70) * (0.8 + 0.2 * Math.sin(f * 0.9));
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    {f < 40 && <Headline y={300} lines={[{text: 'ONE STREAK', color: 'white', size: 104}, {text: 'CAUGHT', color: 'yellow', size: 104}]} delay={2} />}
    {f > 40 && <PhotoCard src="omg/IMG3.jpg" credit="SIMULATED air shower · Dinoj, CC BY 2.5" tag="WHAT IT LOOKS LIKE" delay={40} dur={90} zoom={[1.0, 1.1]} pan={[0, 0]} rot={2} />}
    <Flash at={[14]} k={0.6} len={8} color="#d8f8ff" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-3, 1.4, 6], look: [0, 4, -4], fov: 64}, {f: 18, pos: [-1.2, 1.8, 4.5], look: [0, 3.5, -3], fov: 56}, {f: d, pos: [2.6, 2.4, 3.2], look: [0.5, 3, -3], fov: 46}]} shake={0.45} shakeFrom={14} shakeLen={20} />
    <Stars opacity={0.85} count={260} /><Moon />
    <Desert frame={f} /><FlysEye frame={f} flashFn={(i) => i === 7 ? pulse : 0.1 * pulse} tilt={0.9} />
    <Particle from={[-60, 62, -42]} to={[8, 16, -4]} t={t} trail={30} size={7} opacity={t < 1 ? 1 : clamp01(1 - (f - 26) / 10)} />
    <Glow position={[0, 3.4, -4]} size={12 * pulse} color="#58e0ff" opacity={0.6 * pulse} />
  </Stage>;
};

// ---------- S3b: 40 million times a collider's energy ----------
const S3b = () => {
  const f = useCurrentFrame(); const d = LS[3] - wordAt('energy', 2); const n = Math.round(40000000 * easeOut(clamp01(f / 40)));
  const g = 2 + easeOut(clamp01((f - 8) / 40)) * 11;
  return <Stage palette={LAB} fog={[60, 240]} overlay={<>
    <Pill text="BEST ACCELERATOR ON EARTH" y={236} variant="white" delay={4} size={34} />
    <div style={{position: 'absolute', top: 310, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 130, color: GOLD, WebkitTextStroke: '14px #141414', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>{n.toLocaleString('en-US')}×</div>
    <Pill text="ITS ENERGY, IN ONE SPECK" y={540} variant="red" delay={24} size={36} />
  </>}>
    <CameraRig orbit={{center: [0, 0, 0], radius: 36, height: 17, from: 0.2, to: 1.1, start: 0, end: d, lookY: 0, fov: 54}} />
    <Stars opacity={0.35} count={120} />
    <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[34, 24]} /><meshLambertMaterial color="#2a7ac8" flatShading /></mesh>
    <Ring radius={10} frame={f} tilt={0} />
    <group position={[2, 6, -2]}><Glow position={[0, 0, 0]} size={g} color="#ffe070" opacity={0.85} /><Glow position={[0, 0, 0]} size={g * 0.4} color="#ffffff" opacity={1} /></group>
  </Stage>;
};

// ---------- S4a: trace the path backwards, from the ground into the sky ----------
const S4a = () => {
  const f = useCurrentFrame(); const d = wordAt('nothing', 3) - LS[3]; const u = easeInOut(clamp01(f / (d - 6)));
  const A = [0, 1, -8], B = [34, 110, -62]; const P = A.map((v, i) => v + (B[i] - v) * u);
  return <Stage palette={NIGHT} fog={[40, 220]} overlay={<>
    <Pill text="TRACE IT BACK" y={236} variant="yellow" delay={3} />
    <Headline y={318} lines={[{text: 'SCIENTISTS', color: 'white', size: 96}, {text: 'TRACED IT BACK', color: 'yellow', size: 92}]} delay={4} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-5, 1.8, 15], look: [0, 6, -8], fov: 58}, {f: d, pos: [-2, 2.4, 8], look: [P[0] * 0.5, 40, -30], fov: 66}]} />
    <Stars opacity={0.9} count={280} /><Moon />
    <Desert frame={f} /><FlysEye frame={f} flashFn={(i) => 0.2 + 0.1 * Math.sin(f * 0.3 + i)} />
    <Seg a={A} b={P} w={0.22} color="#ffe070" opacity={0.8} />
    {[0.2, 0.4, 0.6, 0.8].map((q, i) => u > q * 0.9 && <Glow key={i} position={A.map((v, k) => v + (B[k] - v) * q * u * 1.0)} size={3} color="#ffffff" opacity={0.85} />)}
    <Particle from={A} to={B} t={u} trail={22} size={6} color="#ffffff" glow="#ffd070" />
  </Stage>;
};

// ---------- S4b: fly through empty space: nothing there ----------
const FIELD = (() => { const r = rng(21); return Array.from({length: 70}, () => ({x: (r() - 0.5) * 60, y: (r() - 0.5) * 36, z: -r() * 220, s: 0.3 + r() * 0.9, c: ['#ffe9b0', '#9fd8ff', '#ffb0e0', '#ffffff'][Math.floor(r() * 4)]})); })();
const S4b = () => {
  const f = useCurrentFrame(); const d = LS[4] - wordAt('nothing', 3);
  return <Stage palette={SPACE} background={NEBULA} fog={[80, 400]} overlay={<>
    <Headline y={300} lines={[{text: 'NOTHING OUT THERE', color: 'white', size: 86}, {text: 'POWERFUL ENOUGH', color: 'red', size: 86}]} delay={2} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [3, 2, 40], look: [0, 0, -40], fov: 62}, {f: d, pos: [-2, -1, -60], look: [0, 0, -140], fov: 70}]} drift={0.4} />
    <Stars opacity={1} count={300} />
    {FIELD.map((q, i) => <group key={i} position={[q.x, q.y, q.z]}><mesh><icosahedronGeometry args={[q.s, 0]} /><meshBasicMaterial color={q.c} fog={false} /></mesh><Glow position={[0, 0, 0]} size={q.s * 5} color={q.c} opacity={0.5} /></group>)}
    <Seg a={[0, 0, 30]} b={[0, 0, -200]} w={0.16} color="#ffe070" opacity={0.7} />
    <Particle from={[0, 0, 40]} to={[0, 0, -200]} t={clamp01(f / (d + 40) * 0.9)} trail={26} size={5} glow="#ffd070" />
    <Galaxy position={[-26, 8, -150]} radius={22} rot={f * 0.002} tilt={1.0} seed={5} /><Galaxy position={[28, -6, -190]} radius={26} rot={-f * 0.002} tilt={1.2} seed={9} colorA="#ffb0e0" colorB="#9f80ff" />
  </Stage>;
};

// ---------- S5: our galaxy: every suspect is too weak; real quote card; the name ----------
const SUSPECTS = [{p: [-8, 0.2, 6], t: 10, label: 'BLACK HOLE · TOO WEAK'}, {p: [7, 0.2, -6], t: 44, label: 'DEAD STAR · TOO WEAK'}, {p: [4, 0.2, 10], t: 78, label: 'SUPERNOVA · TOO WEAK'}];
const S5 = () => {
  const f = useCurrentFrame(); const d = LS[5] - LS[4]; const tN = wordAt('named', 4) - LS[4];
  const cur = [...SUSPECTS].reverse().find((s) => f >= s.t);
  return <Stage palette={SPACE} background={NEBULA} fog={[80, 400]} overlay={<>
    {f < tN - 4 && <DocCard top={250} size={34} width={960} lines={['"...you trace its trajectory to its', 'source and there\'s nothing high', 'energy enough to have produced it."']} source="JOHN MATTHEWS · TELESCOPE ARRAY · UNIV. OF UTAH" delay={2} />}
    {f >= tN && <Headline y={300} lines={[{text: 'THE', color: 'white', size: 70}, {text: 'OH-MY-GOD', color: 'yellow', size: 118}, {text: 'PARTICLE', color: 'white', size: 100}]} delay={tN} />}
    {cur && f < tN + 10 && <Pill text={cur.label} y={1060} variant="red" delay={cur.t} size={44} />}
    <Flash at={[SUSPECTS[0].t, SUSPECTS[1].t, SUSPECTS[2].t, tN]} k={0.35} len={6} color="#ffe9c0" />
  </>}>
    <CameraRig orbit={{center: [0, 0, 0], radius: 44, height: 44, from: -0.6, to: 0.7, start: 0, end: d, lookY: 0, fov: 50}} />
    <Stars opacity={1} count={300} />
    <Galaxy position={[0, 0, 0]} radius={26} rot={f * 0.006} tilt={0.0} count={3600} size={3.6} />
    {SUSPECTS.map((s, i) => { const k = clamp01((f - s.t) / 10); return k > 0 && <group key={i} position={s.p} scale={0.5 + 0.5 * k}>
      {i === 0 && <><mesh><sphereGeometry args={[1.4, 10, 8]} /><meshBasicMaterial color="#000000" /></mesh><mesh rotation={[Math.PI / 2 - 0.35, 0, f * 0.05]}><torusGeometry args={[2.6, 0.5, 6, 20]} /><meshBasicMaterial color="#ff9a3a" /></mesh></>}
      {i === 1 && <><mesh rotation={[f * 0.04, f * 0.05, 0]}><icosahedronGeometry args={[1.3, 0]} /><meshBasicMaterial color="#9fd8ff" /></mesh><Glow position={[0, 0, 0]} size={7} color="#9fd8ff" opacity={0.8} /></>}
      {i === 2 && [0, 1, 2].map((r) => <mesh key={r} rotation={[Math.PI / 2, 0, 0]} scale={1 + ((f - s.t + r * 8) % 24) * 0.12}><ringGeometry args={[1.5, 1.8, 18]} /><meshBasicMaterial color="#ff7a9a" transparent opacity={clamp01(1 - ((f - s.t + r * 8) % 24) / 24)} side={THREE.DoubleSide} /></mesh>)}
      <Glow position={[0, 0.5, 0]} size={5} color="#ff4a4a" opacity={0.45 * (1 - clamp01((f - s.t - 25) / 20))} />
      <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.35, 3, 0.2]} /><meshBasicMaterial color="#ff3030" /></mesh><mesh position={[0, 3.6, 0]} rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[0.35, 3, 0.2]} /><meshBasicMaterial color="#ff3030" /></mesh>
    </group>; })}
  </Stage>;
};

// ---------- S6a: maybe another galaxy: the speck should fade on the way ----------
const S6a = () => {
  const f = useCurrentFrame(); const d = wordAt('but', 5) - LS[5]; const u = clamp01(f / (d + 10));
  const A = [34, 12, -90], B = [-8, -2, 14];
  return <Stage palette={SPACE} background={NEBULA} fog={[80, 400]} overlay={<>
    <Pill text="ANOTHER GALAXY?" y={236} variant="yellow" delay={3} />
    <Headline y={318} lines={[{text: 'IT SHOULD ARRIVE', color: 'white', size: 78}, {text: 'WEAKER', color: 'red', size: 112}]} delay={Math.round(d * 0.55)} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-20, 12, 40], look: [8, 0, -30], fov: 56}, {f: d, pos: [-6, 6, 30], look: [-4, 0, -2], fov: 50}]} />
    <Stars opacity={1} count={300} />
    <Galaxy position={[38, 14, -100]} radius={28} rot={f * 0.003} tilt={0.8} seed={11} colorA="#ffb0e0" colorB="#9f80ff" />
    <Galaxy position={[-8, -2, 14]} radius={9} rot={-f * 0.004} tilt={1.1} seed={5} size={3} />
    <mesh position={[-8.4, -2, 16]}><icosahedronGeometry args={[0.7, 1]} /><meshPhongMaterial color="#3a8aff" emissive="#2060d0" emissiveIntensity={0.7} flatShading /></mesh>
    <Seg a={A} b={B} w={0.08} color="#ffffff" opacity={0.25} />
    <Particle from={A} to={B} t={u} trail={30} size={7 - 5 * u} color="#ffffff" glow={u < 0.5 ? '#ffe070' : '#ff7a3a'} opacity={1 - 0.45 * u} />
  </Stage>;
};

// ---------- S6b: bars: the OMG particle blows through the energy limit ----------
const S6b = () => {
  const f = useCurrentFrame(); const d = LS[6] - wordAt('but', 5); const g = easeOut(clamp01((f - 14) / 40)); const through = g > 0.5;
  return <Stage palette={LAB} fog={[60, 240]} overlay={<>
    <Headline y={290} lines={[{text: 'MORE ENERGY', color: 'white', size: 96}, {text: 'THAN POSSIBLE', color: 'yellow', size: 96}]} delay={3} />
    <Pill text="PHYSICS' LIMIT" x="26%" y={1000} variant="white" delay={4} size={32} />
    <Pill text="OH-MY-GOD" x="74%" y={1000} variant="red" delay={20} size={32} />
    <Flash at={[Math.round(14 + 40 * 0.55)]} k={0.5} len={9} color="#fff0c0" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-4, 6, 24], look: [0, 4, 0], fov: 50}, {f: d, pos: [7, 9, 17], look: [0, 5.5, 0], fov: 50}]} shake={0.4} shakeFrom={Math.round(14 + 40 * 0.55)} shakeLen={16} />
    <Stars opacity={0.3} count={100} />
    <mesh position={[0, -0.2, 0]}><boxGeometry args={[18, 0.4, 9]} /><meshLambertMaterial color="#1d6ab8" flatShading /></mesh>
    <mesh position={[-3, 2.0, 0]}><boxGeometry args={[2.6, 4, 2.6]} /><meshPhongMaterial color="#3aa0ff" flatShading shininess={60} /></mesh>
    <mesh position={[3, 0.1 + g * 4.5, 0]}><boxGeometry args={[2.6, 0.2 + g * 9, 2.6]} /><meshPhongMaterial color="#ffb02e" emissive="#ff6a00" emissiveIntensity={0.5} flatShading shininess={60} /></mesh>
    <Limit position={[0, 4.4, 0]} w={10} d={3.6} opacity={through ? 0.25 : 0.6} />
    <Glow position={[3, 4.4, 0]} size={through ? 8 * clamp01(1 - (g - 0.55) * 2) : 0.01} color="#ffe070" opacity={0.9} />
    <Glow position={[3, 0.3 + g * 9, 0]} size={4} color="#ffd070" opacity={0.7} />
    {through && Array.from({length: 10}, (_, i) => <Glow key={i} position={[3 + Math.cos(i * 0.63) * (f % 20) * 0.12, 4.5 + Math.sin(i * 0.63) * (f % 20) * 0.12, Math.sin(i) * 1.5]} size={0.9} color="#fff0c0" opacity={0.8} />)}
  </Stage>;
};

// ---------- S7a: 2021: the Telescope Array catches a second one ----------
const S7a = () => {
  const f = useCurrentFrame(); const d = wordAt('from', 6) - LS[6]; const t0 = 22;
  return <Stage palette={NIGHT} fog={[60, 240]} overlay={<>
    <Pill text="MAY 2021 · TELESCOPE ARRAY" y={236} variant="yellow" delay={3} size={36} />
    <Headline y={318} lines={[{text: 'A SECOND', color: 'white', size: 100}, {text: 'ONE ARRIVED', color: 'yellow', size: 100}]} delay={5} />
    <Flash at={[t0]} k={0.5} len={8} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 30, 30], look: [0, 0, 0], fov: 54}, {f: d, pos: [20, 22, 12], look: [0, 0, 0], fov: 50}]} shake={0.4} shakeFrom={t0} shakeLen={16} />
    <Stars opacity={0.85} count={260} /><Moon />
    <Desert frame={f} />
    <Stations n={9} frame={f} t0={t0} hit={[0, 0]} />
    <Particle from={[10, 80, -20]} to={[0, 0, 0]} t={clamp01(0.45 + f * 0.05)} trail={30} size={7} opacity={f < t0 + 2 ? 1 : 0} />
    <AirShower apex={[0, 36, 0]} base={[0, 0, 0]} u={(f - t0) / 22} radius={9} opacity={clamp01(1 - (f - t0 - 30) / 40)} seed={7} />
  </Stage>;
};

// ---------- S7b: it came from the Local Void: empty space ----------
const RING_G = [0, 1, 2, 3, 4, 5, 6].map((i) => ({a: i * 0.9, r: 30 + (i % 2) * 5, s: 7 + (i % 3) * 2}));
const S7b = () => {
  const f = useCurrentFrame(); const d = LS[7] - wordAt('from', 6); const u = clamp01(f / (d - 8));
  return <Stage palette={SPACE} background={NEBULA} fog={[80, 400]} overlay={<>
    <Pill text="THE LOCAL VOID · EMPTY SPACE" y={236} variant="white" delay={3} size={34} />
    {f > d * 0.5 && <Pill text="NO SOURCE FOUND" y={1060} variant="red" delay={Math.round(d * 0.5)} size={46} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [-26, 12, 50], look: [0, 0, 0], fov: 58}, {f: d, pos: [-6, 3, 36], look: [0, 0, 0], fov: 54}]} />
    <Stars opacity={1} count={300} />
    {RING_G.map((g, i) => <Galaxy key={i} position={[Math.cos(g.a) * g.r, Math.sin(g.a * 1.7) * 6, Math.sin(g.a) * g.r * 0.5 - 8]} radius={g.s} rot={f * 0.004 * (i % 2 ? 1 : -1)} tilt={0.6 + i * 0.15} seed={30 + i} count={900} size={2.6} colorB={i % 2 ? '#ff9fd8' : '#6aa8ff'} />)}
    <mesh scale={1 + Math.sin(f * 0.1) * 0.02}><icosahedronGeometry args={[9, 1]} /><meshBasicMaterial color="#04021a" /></mesh>
    <mesh rotation={[0, f * 0.01, 0]}><icosahedronGeometry args={[9.3, 1]} /><meshBasicMaterial color="#58e0ff" wireframe transparent opacity={0.55} /></mesh>
    <Particle from={[0, 0, 0]} to={[-3, 1, 60]} t={u} trail={22} size={5 + 8 * u} glow="#ffe070" />
  </Stage>;
};

// ---------- S8: physicists, a giant question mark: physics we don't know ----------
const S8 = () => {
  const f = useCurrentFrame(); const d = LS[8] - LS[7];
  return <Stage palette={NIGHT} fog={[60, 240]} overlay={<>
    <Headline y={300} lines={[{text: 'PHYSICS WE', color: 'white', size: 104}, {text: "DON'T KNOW YET?", color: 'yellow', size: 92}]} delay={3} />
  </>}>
    <CameraRig orbit={{center: [0, 3, -3], radius: 21, height: 4.5, from: -0.5, to: 0.4, start: 0, end: d, lookY: 2.8, fov: 58}} />
    <Stars opacity={0.8} count={220} />
    <mesh position={[0, -0.25, -2]}><boxGeometry args={[30, 0.5, 26]} /><meshLambertMaterial color="#5a3aa8" flatShading /></mesh>
    <Ripples center={[0, 0.0, -4]} area={14} count={12} frame={f} period={46} maxR={4.5} color="#7fe8ff" />
    <QMark position={[0, 0.4, -6]} frame={f} scale={1.15} />
    <Glow position={[0, 5, -6.5]} size={22} color="#b05cff" opacity={0.55} />
    {PHYS.map((p, i) => <Person key={i} position={[-3.0 + i * 3.0, 0, 2 - (i % 2) * 1.2]} rotation={Math.PI + (i - 1) * 0.3} scale={1.9} pose="stand" phase={f / 7 + i * 2} wave={i === 1 && f % 60 < 40} {...p} />)}
    {Array.from({length: 6}, (_, i) => <Glow key={i} position={[Math.cos(f * 0.03 + i) * 8, 4 + Math.sin(f * 0.05 + i * 2) * 3, -5 + Math.sin(f * 0.03 + i) * 3]} size={1.4} color="#ffe070" opacity={0.7} />)}
  </Stage>;
};

// ---------- S9: end: another streak (loops to frame 0); the question ----------
const S9 = () => {
  const f = useCurrentFrame(); const d = OMG_FRAMES - LS[8]; const ts = d - 16;
  const hits = [0, 1, 2].map((k) => { const c = (f + k * 52 + 20) % 156; return {k, c, x: (k - 1) * 4.4}; });
  return <Stage palette={NIGHT} fog={[40, 200]} overlay={<>
    <Headline y={280} lines={[{text: 'MONSTER FAR AWAY?', color: 'white', size: 80}, {text: 'OR NEW PHYSICS?', color: 'yellow', size: 92}]} delay={3} stagger={8} />
    <Pill text="TELL ME IN THE COMMENTS" y={600} variant="red" delay={30} size={44} />
    <EndCard delay={24} sources={['UNIVERSITY OF UTAH PHYSICS', 'WIKIPEDIA']} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-2, 3.2, 25], look: [0, 8.5, -9], fov: 58}, {f: d, pos: [-5, 2.6, 21], look: [0, 12, -9], fov: 60}]} />
    <Stars opacity={0.85} count={260} /><Moon />
    <Desert frame={f} /><FlysEye frame={f} flashFn={(i) => { const h = hits.find((q) => q.c >= 10 && q.c < 50 && i % 3 === q.k); return h ? clamp01(1 - (h.c - 10) / 40) : 0.15 + 0.1 * Math.sin(f * 0.2 + i); }} />
    {hits.map((h) => <group key={h.k}>
      {h.c < 12 && <Particle from={[h.x * 3 + 24, 100, -46]} to={[h.x, 0, -9]} t={0.3 + h.c * 0.06} trail={34} size={7} />}
      <AirShower apex={[h.x, 40, -9]} base={[h.x, 0, -9]} u={(h.c - 10) / 20} radius={8} opacity={h.c < 60 ? clamp01(1 - (h.c - 30) / 30) : 0} seed={h.k + 3} />
    </group>)}
    <Particle from={FROM} to={TO} t={0.42} trail={34} size={7} opacity={f >= ts ? 1 : 0} />
  </Stage>;
};

const SCENES = () => [
  [S1a, 0, wordAt('thrown')], [S1b, wordAt('thrown'), LS[1]], [S2, LS[1], LS[2]], [S3a, LS[2], wordAt('energy', 2)], [S3b, wordAt('energy', 2), LS[3]],
  [S4a, LS[3], wordAt('nothing', 3)], [S4b, wordAt('nothing', 3), LS[4]], [S5, LS[4], LS[5]], [S6a, LS[5], wordAt('but', 5)], [S6b, wordAt('but', 5), LS[6]],
  [S7a, LS[6], wordAt('from', 6)], [S7b, wordAt('from', 6), LS[7]], [S8, LS[7], LS[8]], [S9, LS[8], OMG_FRAMES],
];

export const Omg = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {SCENES().map(([C, from, to], i) => <Sequence key={i} from={from} durationInFrames={to - from}><C />{i > 0 && <Dip inFrames={4} color="#1a0a50" />}</Sequence>)}
    <Finish vignette={0.4} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
