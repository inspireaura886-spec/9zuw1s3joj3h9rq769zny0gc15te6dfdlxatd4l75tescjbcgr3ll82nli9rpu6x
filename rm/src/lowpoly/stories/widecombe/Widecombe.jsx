import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, CameraRig, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Person, Glow, Clouds, Birds,
  clamp01, easeOut, easeInOut, rng, hash2} from '../../kit/index.js';
import {Flash, PhotoCard, DocCard, Fonts2, Seg} from '../common.jsx';
import {Storm} from '../flannan-isles/world.jsx';
import {PHYS} from '../omg/world.jsx';
import {Moor, Church, Village, Fireball, Bolt, StormMass, Interior, Devil, Lab, LOOK, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30;
const LS = VO.line_starts.map((s) => Math.round(s * FPS));
export const WC_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words; const at = (s) => Math.round(s * FPS);
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(txt)); return w ? Math.round(w[1] * FPS) : LS[fromLine]; };

// sickly thunder-green + amber dusk; warm candle interior; blackout; violet lab; ember dusk
const STORMY = {top: '#16242c', mid: '#46663c', hor: '#e8bc4a', fog: '#6d7f44', amb: 1.0, hemiSky: '#d8e8a8', hemiGround: '#4a5a2a', hemiI: 1.4, sun: '#ffeaa0', sunI: 2.2, sunPos: [-30, 30, 30], rim: '#ffb060', rimI: 1.6, rimPos: [30, 15, -40], glow: 1};
const NAVE = {top: '#2c2318', mid: '#4a3822', hor: '#8a6a3a', fog: '#3a2a18', amb: 1.45, hemiSky: '#ffe2b0', hemiGround: '#6a5030', hemiI: 1.6, sun: '#ffe0b0', sunI: 1.9, sunPos: [0, 20, 10], rim: '#ffa050', rimI: 1.3, rimPos: [10, 10, -20], glow: 1};
const BLACKOUT = {...NAVE, top: '#0a121a', mid: '#162838', hor: '#223e4c', fog: '#0e1a24', amb: 0.62, hemiSky: '#7a9ab8', hemiGround: '#222f3c', hemiI: 0.7, sun: '#9ab8d8', sunI: 0.35, rim: '#7fb0ff', rimI: 0.8};
const LABP = {top: '#241a58', mid: '#5a3aa8', hor: '#d080b8', fog: '#5a3aa8', amb: 1.35, hemiSky: '#e8d8ff', hemiGround: '#4a3a80', hemiI: 1.5, sun: '#fff0e0', sunI: 2.2, sunPos: [10, 30, 20], rim: '#9fe8ff', rimI: 1.6, rimPos: [-10, 10, -30], glow: 0};
const EMBER = {top: '#2a1a50', mid: '#9a3a6a', hor: '#ffa04a', fog: '#b0605a', amb: 1.1, hemiSky: '#ffc0a0', hemiGround: '#5a3a50', hemiI: 1.4, sun: '#ffb070', sunI: 2.4, sunPos: [-30, 14, 20], rim: '#ff7ab0', rimI: 1.6, rimPos: [30, 18, -40], glow: 1};
const WARM_BG = 'radial-gradient(ellipse at 50% 55%, #c8601c 0%, #7a2a14 55%, #3a1210 100%)';
const GOLD = '#ffd93b';
const WIN = [3.0, 2.2, 3.6];
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// ---------- W1a: hook. a fireball hits the window of the church ----------
const W1a = () => {
  const f = useCurrentFrame(); const d = at(3.52); const tH = 16; const t = clamp01(0.25 + f / tH * 0.75);
  const P = lerp3([26, 24, 18], [3.0, 2.4, 3.9], t); const hit = f >= tH; const g = hit ? clamp01(1 - (f - tH) / 90) * 0.4 + 0.6 : 0.4;
  const rr = rng(4); const shards = Array.from({length: 12}, () => ({v: [(rr() - 0.2) * 5, rr() * 3 + 1, rr() * 6 + 1], s: 0.1 + rr() * 0.18}));
  return <Stage palette={STORMY} fog={[40, 190]} overlay={<>
    <Pill text="DEVON · 1638" y={236} variant="yellow" delay={-20} />
    <Headline y={318} lines={[{text: 'THE FIREBALL', color: 'white', size: 104}, {text: 'IN THE CHURCH', color: 'yellow', size: 98}]} delay={-20} />
    <Flash at={[0, tH]} k={0.8} len={8} color="#fff0d0" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [13, 3.4, 17], look: [3, 3.4, 3.5], fov: 62}, {f: d, pos: [7, 3.2, 10], look: [3, 3.2, 3.5], fov: 56}]} shake={0.5} shakeFrom={tH} shakeLen={20} />
    <StormMass frame={f} y={26} speed={0.1} /><Clouds frame={f} y={30} color="#3a4a40" opacity={0.95} speed={0.2} count={9} seed={4} />
    <Moor frame={f} /><Village frame={f} /><Church frame={f} glow={g} />
    <Fireball position={P} r={hit ? 0.001 : 1.3} frame={f} light seed={1} />
    {hit && <Fireball position={[3.0, 2.3, 3.2 + (f - tH) * 0.05]} r={1.0 + 0.2 * Math.sin(f * 0.4)} frame={f} light seed={2} />}
    {shards.map((s, i) => hit && <mesh key={i} position={[3 + s.v[0] * (f - tH) * 0.03, 2.4 + s.v[1] * (f - tH) * 0.03 - (f - tH) ** 2 * 0.0016, 3.6 + s.v[2] * (f - tH) * 0.035]} rotation={[f * 0.2 + i, f * 0.15, i]} scale={s.s}><boxGeometry args={[1, 1, 0.2]} /><meshBasicMaterial color="#cfe8ff" /></mesh>)}
    <Bolt from={[18, 55, 8]} to={[P[0], P[1] + 1, P[2]]} seed={3} t={clamp01(f / 4)} opacity={clamp01(1 - f / 9)} />
    <Storm frame={f} center={[3, 0, 6]} area={40} rain={0.8} wind={0.5} slant={0.3} count={200} />
  </Stage>;
};

// ---------- W1b: inside, the ball drifts over the pews ----------
const W1b = () => {
  const f = useCurrentFrame(); const d = LS[1] - at(3.52); const u = easeInOut(clamp01(f / (d - 4))); const tE = wordAt('explained') - at(3.52);
  const P = lerp3([3.7, 3.2, -1.8], [0.2, 2.5, 2.8], u);
  return <Stage palette={NAVE} fog={[30, 160]} overlay={<>
    {f >= tE - 10 && <Pill text="NOBODY HAS EXPLAINED IT" y={1070} variant="red" delay={tE - 10} size={44} />}
    <Headline y={300} lines={[{text: 'A GREAT', color: 'white', size: 92}, {text: 'FIERY BALL', color: 'yellow', size: 110}]} delay={3} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 2.0, -6.9], look: [0, 2.4, 6], fov: 74}, {f: d, pos: [0.4, 2.5, -3.6], look: [0, 2.6, 6], fov: 70}]} />
    <Interior frame={f} winGlow={0.9} scared={1} />
    <Fireball position={P} r={0.9} frame={f} seed={5} />
  </Stage>;
};

// ---------- W2a: real photo of the tower, then the storm rolls over the moor; villagers walk to church ----------
const W2a = () => {
  const f = useCurrentFrame(); const d = at(11.22) - LS[1]; const tc = 72; const fl = (f > 98 && f < 106) || (f > 150 && f < 158);
  const walkers = Array.from({length: 8}, (_, i) => { const s = clamp01((f - i * 6) / 150); const pos = lerp3([26 + i * 1.3, 0, 22 + (i % 3)], [3.2, 0, 5.2], easeOut(s)); return {pos: [pos[0], height(pos[0], pos[2]) + 0.03, pos[2]], s, i}; });
  return <Stage palette={STORMY} fog={[50, 230]} overlay={<>
    {f < tc && <PhotoCard src="widecombe/IMG3.jpg" credit="St Pancras church tower · photo: David Jones, CC BY 2.0" tag="WIDECOMBE-IN-THE-MOOR" dur={tc} zoom={[1.02, 1.14]} pan={[10, -30]} />}
    {f >= tc && <><Pill text="SUN 21 OCT 1638" y={236} variant="yellow" delay={tc} size={38} />
      <Headline y={318} lines={[{text: 'WIDECOMBE', color: 'white', size: 100}, {text: 'ON DARTMOOR', color: 'yellow', size: 92}]} delay={tc + 2} /></>}
    {fl && <Flash at={[f > 120 ? 150 : 98]} k={0.6} len={8} color="#f2f8ff" />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [36, 16, 44], look: [0, 3, 0], fov: 54}, {f: d, pos: [-6, 9, 40], look: [2, 4, 0], fov: 52}]} />
    <StormMass frame={f * 1.6} y={30} speed={0.16} color="#25322e" /><Clouds frame={f} y={36} color="#2c3a36" opacity={0.95} speed={0.3} count={10} seed={8} />
    <Moor frame={f} /><Village frame={f} /><Church frame={f} glow={0} lit={0.7} />
    {walkers.map((w) => <Person key={w.i} position={w.pos} rotation={Math.atan2(3.2 - w.pos[0], 5.2 - w.pos[2])} scale={0.8} pose={w.s < 1 ? 'walk' : 'stand'} phase={f / 4 + w.i} {...LOOK(w.i)} />)}
    <Bolt from={[-30, 60, -20]} to={[-28, 6, -16]} seed={9} t={fl ? 1 : 0} />
    <Storm frame={f} center={[2, 0, 10]} area={70} rain={0.9} wind={1} slant={0.4} count={240} />
    <Birds center={[0, 24, 0]} radius={16} frame={f} count={6} color="#1a2220" speed={0.03} size={0.5} />
  </Stage>;
};

// ---------- W2b: inside: 300 people ----------
const W2b = () => {
  const f = useCurrentFrame(); const d = LS[2] - at(11.22); const n = Math.round(300 * easeOut(clamp01(f / 50)));
  return <Stage palette={NAVE} fog={[40, 200]} overlay={<>
    <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 190, color: GOLD, WebkitTextStroke: '16px #141414', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>{n}</div>
    <Pill text="PEOPLE PACKED INSIDE" y={560} variant="white" delay={20} size={40} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 1.6, 7.6], look: [0, 2.2, -4], fov: 74}, {f: d, pos: [0, 4.2, 3.5], look: [0, 1.6, -4], fov: 70}]} />
    <Interior frame={f} winGlow={f % 90 > 80 ? 0.6 : 0.1} />
  </Stage>;
};

// ---------- W3a: a strange darkness ----------
const W3a = () => {
  const f = useCurrentFrame(); const d = at(17.0) - LS[2];
  return <Stage palette={BLACKOUT} fog={[20, 90]} overlay={<>
    <Headline y={300} lines={[{text: 'A STRANGE', color: 'white', size: 104}, {text: 'DARKNESS', color: 'cyan', size: 120}]} delay={3} />
    <DocCard top={700} size={38} width={900} lines={['"...a strange darknesse..."', 'nobody could see the next person']} source="PAMPHLET · LONDON 1638" delay={14} highlight={[0]} />
    <Flash at={[60]} k={0.35} len={6} color="#cfe0ff" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 1.7, -5.8], look: [0, 2.0, 6], fov: 76}, {f: d, pos: [0, 2.0, -2.8], look: [0, 2.0, 6], fov: 70}]} />
    <Interior frame={f} winGlow={0} scared={1} dark={0.3} />
    {Array.from({length: 8}, (_, i) => <Glow key={i} position={[Math.sin(f * 0.02 + i) * 3, 1.5 + (i % 4) * 0.8, -4 + i * 1.8]} size={3} color="#3a5a78" opacity={0.35} />)}
  </Stage>;
};

// ---------- W3b: the ball enters and splits in two ----------
const W3b = () => {
  const f = useCurrentFrame(); const d = LS[3] - at(17.0); const s = clamp01((f - 14) / 40);
  const A = lerp3([3.8, 3.4, 1.9], [0.8, 2.6, -1.5], clamp01(f / 14));
  const B1 = lerp3(A, [-3.9, 3.3, -1.8], s), B2 = lerp3(A, [0.0, 1.8, -6.6], s);
  return <Stage palette={NAVE} fog={[30, 160]} overlay={<>
    <Pill text="IT SPLIT IN TWO" y={1060} variant="red" delay={14} size={50} />
    <DocCard top={290} size={42} width={900} lines={['"...a great fiery ball..."']} source="PAMPHLET · WIDECOMBE 1638" delay={4} highlight={[0]} />
    <Flash at={[0, 14]} k={0.55} len={7} color="#fff0d0" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-2, 2.4, 5.5], look: [3, 3, 1], fov: 72}, {f: 16, pos: [0.5, 2.5, 4.5], look: [0, 2.6, -2], fov: 70}, {f: d, pos: [0, 2.6, 2.2], look: [0, 2.2, -6], fov: 66}]} shake={0.35} shakeFrom={14} shakeLen={14} />
    <Interior frame={f} winGlow={1} scared={1} />
    {f < 14 ? <Fireball position={A} r={1.1} frame={f} seed={2} /> : <><Fireball position={B1} r={0.9 - 0.2 * s} frame={f} seed={3} light={false} /><Fireball position={B2} r={0.9 - 0.2 * s} frame={f} seed={4} /></>}
  </Stage>;
};

// ---------- W4a: four died, sixty hurt (calm: ghosts rise, no gore) ----------
const W4a = () => {
  const f = useCurrentFrame(); const d = wordAt('some', 3) - LS[3];
  return <Stage palette={NAVE} fog={[30, 160]} overlay={<>
    <Headline y={290} lines={[{text: '4 DIED', color: 'red', size: 118}, {text: '~60 HURT', color: 'yellow', size: 106}]} delay={3} />
    <Pill text="CHURCH BADLY DAMAGED" y={600} variant="white" delay={30} size={36} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 1.8, 7.4], look: [0, 2.0, -3], fov: 74}, {f: d, pos: [0, 6.4, 5.0], look: [0, 1.4, -3], fov: 70}]} />
    <Interior frame={f} winGlow={0.3} scared={1} rows={7} />
    {[[-2.0, -2.3], [2.0, -0.7], [-2.0, 0.9], [2.0, 2.4]].map(([x, z], i) => { const u = clamp01((f - 12 - i * 10) / 50); return <Person key={i} position={[x * 0.9, 0.6 + u * 3.2, z]} rotation={Math.PI} scale={0.8} pose="stand" phase={f / 10 + i} ghost opacity={clamp01(1 - u * 0.4) * clamp01(u * 4)} {...LOOK(i)} />; })}
  </Stage>;
};

// ---------- W4b: burnt skin, clothes not singed (quote card) ----------
const W4b = () => {
  const f = useCurrentFrame(); const d = LS[4] - wordAt('some', 3); const t = easeOut(clamp01(f / 24));
  return <Stage palette={NAVE} background={WARM_BG} fog={[40, 200]} overlay={<>
    <Headline y={280} lines={[{text: 'SKIN BURNT', color: 'red', size: 104}, {text: 'CLOTHES NOT SINGED', color: 'white', size: 70}]} delay={3} />
    <DocCard top={1000} size={40} width={880} lines={['"...not one thred singed."']} source="WIDECOMBE PAMPHLETS · LONDON 1638" delay={16} highlight={[0]} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-3, 3.4, 17], look: [0, 3.4, 0], fov: 52}, {f: d, pos: [2, 3.6, 13.5], look: [0, 3.5, 0], fov: 50}]} />
    <Person position={[0, 0, 0]} scale={3.4} pose="stand" phase={f / 12} skin={`#${new THREE.Color('#e6b892').lerp(new THREE.Color('#e0402a'), t).getHexString()}`} shirt="#efe6c8" pattern="stripe" pants="#3a3226" hair="#3a2a1a" expr="o" />
    <Fireball position={[Math.cos(f * 0.12) * 2.6, 3.6 + Math.sin(f * 0.17) * 0.8, Math.sin(f * 0.12) * 2.6]} r={0.6} frame={f} seed={6} />
    <Glow position={[0, 4.6, 0.5]} size={8} color="#ff6a2a" opacity={0.35 * t} />
  </Stage>;
};

// ---------- W5a: the air stank of sulphur ----------
const W5a = () => {
  const f = useCurrentFrame(); const d = wordAt('locals', 4) - LS[4];
  const r = rng(11); const puffs = Array.from({length: 16}, () => ({x: (r() - 0.5) * 8, y: 0.8 + r() * 3.5, z: -6 + r() * 14, s: 2.5 + r() * 2.5, ph: r() * 6}));
  return <Stage palette={NAVE} fog={[24, 130]} overlay={<>
    <Headline y={300} lines={[{text: 'IT STANK OF', color: 'white', size: 92}, {text: 'SULPHUR', color: 'green', size: 120}]} delay={3} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-3.2, 1.9, 6.5], look: [0, 2.0, -3], fov: 74}, {f: d, pos: [3.0, 2.2, 5.0], look: [0, 2.0, -3], fov: 72}]} />
    <Interior frame={f} winGlow={0.6} scared={1} />
    {puffs.map((p, i) => <Glow key={i} position={[p.x + Math.sin(f * 0.03 + p.ph) * 1.2, p.y + Math.sin(f * 0.05 + p.ph) * 0.3, p.z + ((f * 0.04) % 4)]} size={p.s} color="#9aa83a" opacity={0.1} />)}
    <Fireball position={[1.2 + Math.sin(f * 0.05), 3.0, -3.5]} r={0.4} frame={f} seed={7} light={false} />
  </Stage>;
};

// ---------- W5b: legend: the Devil on the tower ----------
const W5b = () => {
  const f = useCurrentFrame(); const d = LS[5] - wordAt('locals', 4);
  return <Stage palette={STORMY} fog={[40, 190]} overlay={<>
    <Pill text="THE LEGEND" y={236} variant="yellow" delay={2} />
    <Headline y={318} lines={[{text: 'LOCALS BLAMED', color: 'white', size: 86}, {text: 'THE DEVIL', color: 'red', size: 118}]} delay={3} />
    <Flash at={[6]} k={0.55} len={6} color="#f2f8ff" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-20, 3, 16], look: [-8.2, 12, 0], fov: 62}, {f: d, pos: [-14, 5, 12], look: [-8.2, 14, 0], fov: 58}]} />
    <StormMass frame={f} y={28} speed={0.14} /><Moor frame={f} /><Church frame={f} glow={0.3} />
    <Devil position={[-8.2, 13.45, 0]} rotation={0.5} scale={1.5} frame={f} />
    <Bolt from={[-18, 60, -12]} to={[-9.5, 16, -2]} seed={13} t={clamp01(f / 4)} opacity={f % 14 < 7 ? 1 : 0.2} />
    <Storm frame={f} center={[-8, 0, 6]} area={40} rain={0.9} wind={1} slant={0.4} count={200} />
  </Stage>;
};

// ---------- W6a: LOOP3: a ball of fire that splits ----------
const W6a = () => {
  const f = useCurrentFrame(); const d = at(32.9) - LS[5]; const s = clamp01((f - 16) / 30);
  return <Stage palette={STORMY} fog={[40, 190]} overlay={<>
    <Headline y={300} lines={[{text: 'A BALL OF FIRE', color: 'white', size: 84}, {text: 'THAT SPLITS', color: 'yellow', size: 108}]} delay={2} />
    <Flash at={[16]} k={0.5} len={7} color="#fff0d0" />
  </>}>
    <CameraRig orbit={{center: [0, 6, 0], radius: 18, height: 1, from: -0.8, to: 1.0, start: 0, end: d, lookY: 0, fov: 56}} shake={0.4} shakeFrom={16} shakeLen={12} />
    <StormMass frame={f} y={26} speed={0.1} /><Moor frame={f} />
    <Fireball position={[-s * 4, 6 + s * 1.2, 0]} r={1.6 - s * 0.5} frame={f} seed={1} /><Fireball position={[s * 4, 6 - s * 0.8, s * 2]} r={s > 0 ? 1.4 * s + 0.01 : 0.01} frame={f} seed={2} />
    <Storm frame={f} center={[0, 0, 0]} area={40} rain={0.8} wind={0.8} slant={0.3} count={160} />
  </Stage>;
};

// ---------- W6b: burns skin but not clothes: an orb passes a row of people ----------
const W6b = () => {
  const f = useCurrentFrame(); const d = at(35.0) - at(32.9); const x = -6 + (f / d) * 12;
  return <Stage palette={NAVE} background={WARM_BG} fog={[40, 200]} overlay={<>
    <Headline y={290} lines={[{text: 'BURNS SKIN', color: 'red', size: 112}, {text: 'NOT CLOTHES', color: 'white', size: 100}]} delay={2} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-3, 1.6, 19], look: [-1, 2.6, 0], fov: 56}, {f: d, pos: [3, 2.2, 19], look: [1, 2.6, 0], fov: 56}]} />
    {[-3.9, -1.3, 1.3, 3.9].map((px, i) => { const t = clamp01((x - px + 1) / 1.6); return <Person key={i} position={[px, 0, 0]} rotation={0} scale={1.9} pose="stand" phase={f / 9 + i * 2} expr="o"
      skin={`#${new THREE.Color('#e6b892').lerp(new THREE.Color('#e0402a'), t).getHexString()}`} shirt={['#efe6c8', '#7ab0d8', '#d8c04a', '#9ac060'][i]} pants="#3a3226" hair={LOOK(i).hair} pattern={i % 2 ? 'stripe' : 'plain'} />; })}
    <Fireball position={[x, 3.4, 1.4]} r={0.8} frame={f} seed={8} />
  </Stage>;
};

// ---------- W6c: it sounds like ball lightning ----------
const W6c = () => {
  const f = useCurrentFrame(); const d = LS[6] - at(35.0);
  return <Stage palette={EMBER} fog={[50, 230]} overlay={<>
    <Pill text="SOUNDS LIKE" y={236} variant="white" delay={2} />
    <Headline y={310} lines={[{text: 'BALL', color: 'yellow', size: 130}, {text: 'LIGHTNING', color: 'white', size: 112}]} delay={4} />
  </>}>
    <CameraRig orbit={{center: [0, 4, 0], radius: 24, height: 0, from: 0.5, to: -0.7, start: 0, end: d, lookY: 0, fov: 52}} />
    <StormMass frame={f} y={30} speed={0.08} color="#3a2a3a" /><Moor frame={f} tint="#ffd0c0" />
    <Fireball position={[Math.sin(f * 0.03) * 8, 6 + Math.sin(f * 0.07) * 1.2, Math.cos(f * 0.03) * 4]} r={1.7} frame={f} seed={3} />
    <Person position={[-4, height(-4, 6), 6]} rotation={0.9} scale={1.2} pose="stand" phase={f / 9} expr="o" {...LOOK(2)} />
  </Stage>;
};

// ---------- W7: science has no accepted explanation ----------
const W7 = () => {
  const f = useCurrentFrame(); const d = LS[7] - LS[6]; const tS = wordAt('scarce', 6) - LS[6];
  return <Stage palette={LABP} fog={[40, 200]} overlay={<>
    <Headline y={290} lines={[{text: 'NO ACCEPTED', color: 'white', size: 100}, {text: 'EXPLANATION', color: 'red', size: 110}]} delay={3} />
    {f >= tS - 10 && <Pill text="GOOD DATA IS SCARCE" y={1060} variant="yellow" delay={tS - 10} size={44} />}
  </>}>
    <CameraRig orbit={{center: [0, 3, 0], radius: 15, height: 1.5, from: 0.6, to: -0.5, start: 0, end: d, lookY: 0.5, fov: 56}} />
    <Lab frame={f} />
    {PHYS.map((p, i) => { const q = [[-4.4, 2.5], [4.4, 2.5], [0, -4.2]][i]; return <Person key={i} position={[q[0], 0, q[1]]} rotation={Math.atan2(-q[0], -q[1])} scale={1.35} pose="stand" phase={f / 8 + i * 2} wave={i === 2 && f % 60 < 36} {...p} />; })}
  </Stage>;
};

// ---------- W8a: plain lightning hits the tower ----------
const W8a = () => {
  const f = useCurrentFrame(); const d = wordAt('fear', 7) - LS[7]; const tB = 26; const fall = easeInOut(clamp01((f - tB - 6) / 46));
  return <Stage palette={STORMY} fog={[40, 190]} overlay={<>
    <Pill text="ANOTHER THEORY" y={236} variant="yellow" delay={2} />
    <Headline y={318} lines={[{text: 'A PLAIN BOLT', color: 'white', size: 98}, {text: 'HITS THE TOWER', color: 'yellow', size: 88}]} delay={3} />
    <Flash at={[tB]} k={0.8} len={9} color="#f2f8ff" />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-16, 4, 18], look: [-8.2, 11, 0], fov: 64}, {f: d, pos: [-12, 6, 13], look: [-8.2, 12, 0], fov: 58}]} shake={0.5} shakeFrom={tB} shakeLen={16} />
    <StormMass frame={f} y={28} speed={0.14} /><Moor frame={f} /><Church frame={f} glow={0} pinFall={fall} />
    <Bolt from={[-5, 62, -6]} to={[-6.6, 14.6, 1.0]} seed={5} t={clamp01((f - tB + 3) / 3)} opacity={f >= tB - 3 && f < tB + 10 ? 1 : 0} />
    {[0, 1, 2, 3, 4].map((i) => <Person key={i} position={[-12 + i * 1.7, height(-12 + i * 1.7, 7), 7 + (i % 2)]} rotation={0.2} scale={1.0} pose="stand" phase={f / 8 + i} expr={f > tB ? 'o' : 'open'} {...LOOK(i)} />)}
    <Storm frame={f} center={[-8, 0, 6]} area={40} rain={1} wind={1.2} slant={0.5} count={220} />
  </Stage>;
};

// ---------- W8b: fear inflated the story: a spark grows into a giant fireball ----------
const W8b = () => {
  const f = useCurrentFrame(); const d = LS[8] - wordAt('fear', 7); const k = easeInOut(clamp01(f / (d - 10)));
  return <Stage palette={EMBER} fog={[50, 230]} overlay={<>
    <Headline y={290} lines={[{text: 'FEAR MADE', color: 'white', size: 100}, {text: 'IT BIGGER?', color: 'yellow', size: 112}]} delay={3} />
    <Pill text="UNPROVEN THEORY" y={1060} variant="red" delay={10} size={44} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 2.4, 16], look: [0, 4, 0], fov: 60}, {f: d, pos: [0, 2.0, 10], look: [0, 6, 0], fov: 62}]} />
    <StormMass frame={f} y={30} speed={0.08} color="#4a3040" /><Moor frame={f} tint="#ffd8c0" />
    {Array.from({length: 7}, (_, i) => { const px = -6 + i * 2, pz = 4 + (i % 2) * 1.6; return <Person key={i} position={[px, height(px, pz), pz]} rotation={Math.PI * 0.05 * (i - 3)} scale={1.3} pose="stand" phase={f / 6 + i} expr="o" {...LOOK(i + 1)} />; })}
    <Fireball position={[0, 8 + k * 1.2, -2]} r={0.2 + k * 2.4} frame={f} seed={9} />
  </Stage>;
};

// ---------- W9: end question (loops to the opening window glow) ----------
const W9 = () => {
  const f = useCurrentFrame(); const d = WC_FRAMES - LS[8]; const pulse = 0.55 + 0.3 * Math.sin(f * 0.15);
  return <Stage palette={EMBER} fog={[40, 200]} overlay={<>
    <Headline y={270} lines={[{text: 'BALL LIGHTNING?', color: 'white', size: 92}, {text: 'OR AN ORDINARY BOLT?', color: 'yellow', size: 68}]} delay={3} stagger={8} />
    <Pill text="TELL ME IN THE COMMENTS" y={560} variant="red" delay={30} size={44} />
    <EndCard delay={24} sources={['PAMPHLETS OF 1638', 'WIKIPEDIA']} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [4, 4, 24], look: [-2, 4, 3], fov: 56}, {f: d, pos: [13, 3.4, 17], look: [3, 3.4, 3.5], fov: 62}]} />
    <StormMass frame={f} y={30} speed={0.05} color="#4a3040" /><Moor frame={f} tint="#ffd8c0" /><Village frame={f} /><Church frame={f} glow={pulse + (f > d - 30 ? 0.3 : 0)} lit={0.7} />
    {f > d - 14 && <Fireball position={lerp3([26, 24, 18], [3.0, 2.4, 3.9], 0.25 + 0.06 * (f - d + 14))} r={1.3} frame={f} seed={1} />}
  </Stage>;
};

const SCENES = () => [
  [W1a, 0, at(3.52)], [W1b, at(3.52), LS[1]], [W2a, LS[1], at(11.22)], [W2b, at(11.22), LS[2]], [W3a, LS[2], at(17.0)], [W3b, at(17.0), LS[3]],
  [W4a, LS[3], wordAt('some', 3)], [W4b, wordAt('some', 3), LS[4]], [W5a, LS[4], wordAt('locals', 4)], [W5b, wordAt('locals', 4), LS[5]],
  [W6a, LS[5], at(32.9)], [W6b, at(32.9), at(35.0)], [W6c, at(35.0), LS[6]], [W7, LS[6], LS[7]], [W8a, LS[7], wordAt('fear', 7)], [W8b, wordAt('fear', 7), LS[8]], [W9, LS[8], WC_FRAMES],
];

export const Widecombe = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {SCENES().map(([C, from, to], i) => <Sequence key={i} from={from} durationInFrames={to - from}><C />{i > 0 && <Dip inFrames={5} color="#140c06" />}</Sequence>)}
    <Finish vignette={0.5} grain={0.07} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
