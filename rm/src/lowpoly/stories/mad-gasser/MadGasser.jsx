import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {Stage, Stars, Orb, Glow, Headline, Pill, FontFaces, Finish, Dip, EndCard, Person, Clouds, Fireflies, Bubbles, Smoke, Car, Tree, clamp01, easeOut, easeInOut, rng} from '../../kit/index.js';
import {CamRig, PAL, Town, HERO, Bedroom, WIN, You, Gasser, Gas, Tag, ALINE, BERT, BEULAH, CHIEF, YOU_LOOK, MilkCarton, Cloth, Shotgun, NailPolish} from './world.jsx';
import {EmCaption, Sticker, Bonk, Flash, FreezeFX, Newspaper, Counter, GroupChat, Wanted, Wobble} from './overlays.jsx';
import VO from './vo.json';

const FPS = 30;
const LS = VO.line_starts.map((s) => Math.round(s * FPS));
export const GASSER_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
export const wordAt = (txt, line = 0, nth = 0) => {
  const st = VO.line_starts[line] - 0.05; let k = 0;
  for (const w of W) if (w[1] >= st && norm(w[0]).startsWith(txt)) { if (k === nth) return Math.round(w[1] * FPS); k++; }
  return LS[line];
};
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const lerpCol = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(t)).getHexString();
const Moon = ({pos = [-40, 45, -90], color = '#fbf6dc', glow = '#9fc0ff'}) => <><Orb position={pos} radius={4} color={color} /><Glow position={[pos[0], pos[1], pos[2] + 1]} size={30} color={glow} opacity={0.55} /></>;

// freeze helper: returns [frameForAnimation, frozen?]
const useFreeze = (at) => { const f = useCurrentFrame(); return at != null && f >= at ? [at, true] : [f, false]; };
const FrozenWrap = ({frozen, children, over}) => <AbsoluteFill><AbsoluteFill style={{filter: frozen ? 'saturate(0.3) contrast(1.2) brightness(0.92)' : 'none'}}>{children}</AbsoluteFill>{over}</AbsoluteFill>;

// ---------------- A: hook, night street, gas creeping to the hero window ----------------
const A = () => {
  const f = useCurrentFrame(); const d = wordAt('and', 0) - LS[0];
  return <Stage palette={PAL.night} fog={[30, 140]} overlay={<>
    <Pill text="MATTOON, ILLINOIS · 1944" y={236} variant="yellow" delay={-20} />
    <Headline y={318} delay={-20} lines={[{text: 'THE MAD GASSER', color: 'red', size: 108}, {text: 'IS AT YOUR WINDOW', color: 'white', size: 78}]} />
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [1.5, 4.2, 9], look: [1.6, 1.8, -6.5], fov: 50}, {f: d, pos: [2.2, 2.6, 2.2], look: [2.4, 1.9, -6.6], fov: 44}]} />
    <Stars opacity={0.9} /><Moon /><Clouds frame={f} y={30} color="#6a5ad8" opacity={0.9} speed={0.06} count={8} />
    <Town frame={f} lit={0.55} heroLit={0.9} />
    <Gasser position={[3.4, 0, -6.4]} rotation={-0.35} frame={f} />
    <Gas from={[3.0, 1.2, -5.7]} dir={[-0.8, 0.1, -0.2]} len={3.2} frame={f} count={30} color="#b6ff7a" opacity={0.45} size={1.1} />
    <Fireflies center={[0, 0, 0]} area={[30, 3, 14]} count={40} frame={f} color="#c8ff6a" />
  </Stage>;
};

// ---------------- B: YOU, window open, scrolling. freeze + VICTIM #1 ----------------
const B = () => {
  const fz = wordAt('left', 0) - wordAt('and', 0);
  const [f, frozen] = useFreeze(fz); const g = useCurrentFrame();
  return <FrozenWrap frozen={frozen} over={<>
    {frozen && <><FreezeFX at={fz} label="VICTIM PROFILE" /><Sticker text="VICTIM #1" sub="window: open · brain: closed" x={540} y={560} rot={-6} delay={fz} size={96} /></>}
    <Flash at={fz} len={6} />
  </>}><Stage palette={PAL.bedroom} fog={[30, 120]} >
    <CamRig frame={f} keys={[{f: 0, pos: [3.5, 3.2, 8.5], look: [0.5, 1.8, -1], fov: 46}, {f: 60, pos: [1.6, 2.6, 5.2], look: [0.6, 1.7, -1.2], fov: 44}]} />
    <Stars opacity={0.8} radius={60} /><Moon pos={[8, 16, -40]} />
    <Bedroom frame={f} wall="#2fa3c8" floor="#d98a3a" bed={false} />
    <You position={[0.3, 0, -0.6]} rotation={0.15} frame={f} />
    <Gasser position={[2.1, 0.1, -4.6]} frame={f} opacity={0.95} scale={1.2} />
    <Gas from={[WIN.x, WIN.y, WIN.z]} dir={[-0.4, -0.15, 1]} len={3.2} frame={f} count={26} color="#b6ff7a" opacity={0.42} size={1.0} />
  </Stage></FrozenWrap>;
};

// ---------------- C: Aline, sweet smell, legs go numb ----------------
const C = () => {
  const f = useCurrentFrame(); const numb = wordAt('numb', 2) - LS[1]; const d = LS[3] - LS[1];
  const nt = clamp01((f - numb + 6) / 10);
  return <Stage palette={PAL.bedroom} fog={[30, 120]} overlay={<>
    <Pill text="SEPT 1, 1944 · 11 PM" y={236} variant="white" delay={2} />
    {f < numb - 8 ? <Headline key="a" y={318} delay={4} lines={[{text: 'SOMETHING', color: 'white'}, {text: 'SICKLY SWEET', color: '#ff9ad5', size: 100}]} />
      : <Headline key="b" y={318} lines={[{text: 'HER LEGS', color: 'white'}, {text: 'GO NUMB', color: 'red', size: 110}]} />}
    {f >= numb && <><Wobble text="NUMB" x={330} y={1060} color="#9fc4ff" delay={numb} rot={-10} /><Wobble text="NUMB" x={760} y={1010} color="#9fc4ff" delay={numb + 5} rot={8} /></>}
    {f > 20 && f < numb && <Wobble text="sniff sniff" x={700} y={760} color="#ffb3e0" delay={20} size={50} rot={6} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [0.5, 3.6, 9], look: [-0.6, 1.4, -1], fov: 46}, {f: numb, pos: [-0.8, 2.6, 6.2], look: [-1.2, 1.0, -0.6], fov: 44}, {f: d, pos: [-1.4, 1.6, 4.6], look: [-1.4, 0.7, -0.4], fov: 42}]} />
    <Stars opacity={0.8} radius={60} /><Moon pos={[8, 16, -40]} />
    <Bedroom frame={f} />
    <Person position={[-1.6, 0.42, -0.25]} pose="sit" phase={f / 9} {...ALINE} pants={lerpCol(ALINE.pants, '#cfe6ff', nt)} shoes={lerpCol('#2a1d16', '#cfe6ff', nt)} expr={f > numb ? 'o' : 'open'} />
    <Gas from={[WIN.x, WIN.y, WIN.z + 0.2]} dir={[-0.9, -0.3, 0.8]} len={3.4} frame={f} count={30} color="#ff9ad5" opacity={0.4} size={1.1} />
    {nt > 0 && [0, 1, 2, 3].map((i) => <mesh key={i} position={[-1.6 + (i - 1.5) * 0.25, 0.25 + 0.2 * Math.sin(f * 0.3 + i), 0.7]} rotation={[0, 0, f * 0.2 + i]}><octahedronGeometry args={[0.07 * nt, 0]} /><meshBasicMaterial color="#cfe6ff" /></mesh>)}
  </Stage>;
};

// ---------------- D: blames the flowers ----------------
const D = () => {
  const f = useCurrentFrame(); const d = wordAt('so', 3) - LS[3];
  return <Stage palette={PAL.bedroom} fog={[30, 120]} overlay={<>
    <Headline y={300} delay={2} lines={[{text: '"IT\'S JUST', color: 'white'}, {text: 'THE FLOWERS"', color: '#ffd93b', size: 104}]} />
    <Wobble text="(it was not the flowers)" x={540} y={1120} color="#ff9ad5" delay={14} size={44} />
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [1.8, 3.2, 2.6], look: [WIN.x - 0.5, WIN.y - 0.4, WIN.z], fov: 44}, {f: d, pos: [0.6, 2.7, 1.2], look: [WIN.x - 0.6, WIN.y - 0.5, WIN.z], fov: 40}]} />
    <Stars opacity={0.8} radius={60} /><Moon pos={[8, 16, -40]} />
    <Bedroom frame={f * 3} />
    <Gas from={[WIN.x, WIN.y, WIN.z + 0.2]} dir={[-0.5, -0.2, 0.9]} len={2.6} frame={f} count={24} color="#ff9ad5" opacity={0.45} size={0.9} />
  </Stage>;
};

// ---------------- E: YOU mid-scroll on the couch, freeze ----------------
const E = () => {
  const fz = wordAt('mid', 3) - wordAt('so', 3); const [f, frozen] = useFreeze(fz);
  return <FrozenWrap frozen={frozen} over={<>
    {frozen && <><FreezeFX at={fz} label="EVIDENCE" /><Sticker text="SCREEN TIME: 9H 41M" sub="gas level: also 9h 41m" x={540} y={580} rot={4} bg="#7fe3ff" fg="#141414" delay={fz} size={70} /></>}
    <Flash at={fz} len={6} />
  </>}><Stage palette={PAL.bedroom} fog={[30, 120]} >
    <CamRig frame={f} keys={[{f: 0, pos: [-0.6, 2.8, 8], look: [-1.2, 1.4, -1.5], fov: 46}, {f: 40, pos: [-1.0, 2.4, 6.4], look: [-1.4, 1.3, -1.6], fov: 44}]} />
    <Stars opacity={0.8} radius={60} /><Moon pos={[8, 16, -40]} />
    <Bedroom frame={f} wall="#2fa3c8" floor="#d98a3a" bed={false} couch />
    <You position={[-1.6, 0.28, -1.3]} pose="sit" frame={f} />
    <Gas from={[WIN.x, WIN.y, WIN.z]} dir={[-1, -0.3, 0.6]} len={3.4} frame={f} count={30} color="#b6ff7a" opacity={0.45} size={1.1} />
  </Stage></FrozenWrap>;
};

// ---------------- F: HORROR. tall man in a tight cap at the window; chase; vanishes ----------------
const F = () => {
  const f = useCurrentFrame(); const l5 = LS[5] - LS[4]; const van = wordAt('vanish', 5) - LS[4]; const d = LS[6] - LS[4];
  const bertZ = interpolate(f, [0, l5], [2.5, -4.6], cl); const run = f > l5;
  const gx = run ? 1.8 + easeInOut(clamp01((f - l5) / (van - l5 + 10))) * 7 : 1.8;
  const gop = run ? interpolate(f, [van - 8, van + 6], [1, 0], cl) : interpolate(f, [8, 26], [0, 1], cl);
  const bx = run ? -0.5 + clamp01((f - l5 - 4) / 40) * 5 : -0.5;
  const pal = f < 12 ? PAL.night : PAL.horror;
  return <Stage palette={pal} fog={[16, 70]} overlay={<>
    <Pill text="JUST AFTER MIDNIGHT" y={236} variant="dark" delay={2} />
    {f < l5 ? <Headline key="a" y={318} delay={14} lines={[{text: 'A TALL MAN', color: 'white'}, {text: 'IN A TIGHT CAP', color: 'red', size: 100}]} />
      : <Headline key="b" y={318} delay={l5 + 2} lines={[{text: 'HE CHASES HIM...', color: 'white', size: 80}]} />}
    {f >= van && <Sticker text="VANISHED." x={540} y={760} rot={-3} bg="#141414" fg="#ff3b3b" delay={van} size={110} />}
  </>}>
    <CamRig frame={f} shake={0.12} shakeFrom={10} shakeLen={14} keys={[{f: 0, pos: [-2.5, 2.2, 6.5], look: [1.2, 1.6, -7], fov: 46}, {f: l5 - 6, pos: [-1.6, 1.9, 1.5], look: [1.6, 1.8, -7], fov: 40}, {f: d, pos: [2.5, 2.6, 2.5], look: [5.5, 1.4, -6.5], fov: 46}]} />
    <Stars opacity={0.5} /><Moon color="#ffb0b0" glow="#ff3a4a" />
    <Town frame={f} lit={0.12} heroLit={0.35} lamps={0.45} ground="#1f6a3a" road="#241e34" />
    <Car position={[-6, 0, 1.6]} rotation={Math.PI / 2} color="#ffd93b" />
    <Person position={[bx, 0, bertZ]} rotation={run ? Math.PI * 0.6 : Math.PI} pose="walk" phase={f / (run ? 2.5 : 4.5)} {...BERT} />
    <Gasser position={[gx, 0, -6.4]} rotation={run ? Math.PI / 2 : 0} pose={run ? 'walk' : 'stand'} frame={f} opacity={gop} />
    <Gas from={[1.8, 1.4, -6.6]} dir={[-0.3, 0.05, -0.6]} len={1.5} frame={f} count={16} color="#9dff6a" opacity={0.35 * (run ? 0.4 : 1)} size={0.8} />
  </Stage>;
};

// ---------------- G: newspaper + town lighting up house by house + counter ----------------
const G = () => {
  const f = useCurrentFrame(); const soon = wordAt('soon', 6) - LS[6]; const d = LS[7] - LS[6];
  return <Stage palette={PAL.night} fog={[30, 160]} overlay={<>
    {f < soon - 4 ? <Newspaper delay={2} /> : <Counter from={1} to={25} start={soon} end={soon + 40} y={1080} label="REPORTED GASSINGS" />}
    {f >= soon && <Headline y={300} delay={soon} lines={[{text: 'IT SPREADS', color: 'red', size: 112}]} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [-18, 16, 22], look: [0, 0, -2], fov: 50}, {f: d, pos: [14, 14, 20], look: [0, 0, -2], fov: 50}]} />
    <Stars opacity={0.9} /><Moon /><Clouds frame={f} y={30} color="#6a5ad8" opacity={0.9} speed={0.08} count={8} />
    <Town frame={f} litFn={(k) => (f > soon + (k % 13) * 3 ? 0.95 : 0.15)} heroLit={0.9} />
    {[[-18, -9], [-9, 9], [9, -9], [18, 9], [-27, 9], [27, -9]].map(([x, z], i) => f > soon + i * 6 && <Gas key={i} from={[x, 1.5, z + (z < 0 ? 2 : -2)]} dir={[0, 0.4, 0]} len={2.5} frame={f} count={14} color="#b6ff7a" opacity={0.4} size={1.6} seed={i + 2} />)}
  </Stage>;
};

// ---------------- H: porch cloth, sniff, violently sick ----------------
const H = () => {
  const f = useCurrentFrame(); const sn = wordAt('sniff', 7) - LS[7]; const sick = wordAt('sick', 7) - LS[7]; const d = LS[8] - LS[7];
  const pick = clamp01((f - (sn - 14)) / 10); const fall = clamp01((f - sick + 4) / 14);
  return <Stage palette={PAL.night} fog={[20, 100]} overlay={<>
    <Pill text="SEPT 5, 1944" y={236} variant="yellow" delay={2} />
    <Headline y={318} delay={4} lines={[{text: 'A DAMP CLOTH', color: 'white'}, {text: 'ON THE PORCH', color: '#b6ff7a', size: 100}]} />
    {f >= sn && f < sick && <Wobble text="*SNIFF*" x={720} y={800} color="#b6ff7a" delay={sn} size={70} rot={8} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [-12.5, 5.0, -7.0], look: [-9, 1.2, 6.2], fov: 46}, {f: d, pos: [-11.6, 4.0, -4.6], look: [-9, 0.9, 6.2], fov: 46}]} />
    <Stars opacity={0.8} /><Moon />
    <Town frame={f} lit={0.6} heroLit={0.6} />
    {/* porch deck in front of the house at x=-9, z=+9 (front faces -z) */}
    <mesh position={[-9, 0.12, 6.4]}><boxGeometry args={[3.6, 0.24, 1.6]} /><meshLambertMaterial color="#b0703a" flatShading /></mesh>
    <Person position={[-9, 0.24, 6.3]} rotation={0} pose={fall > 0 ? 'fall' : 'stand'} fallT={fall} phase={f / 8} {...BEULAH} expr={f > sn ? 'o' : 'open'} />
    {fall === 0 && <Cloth position={pick > 0 ? [-8.65, 0.95 + pick * 0.6, 6.6] : [-8.5, 0.27, 6.7]} rotation={[pick * 1.2, 0, 0]} />}
    {fall > 0 && <Cloth position={[-8.3, 0.27, 6.9]} />}
    {f > sn && <Gas from={[-8.7, 1.6, 6.6]} dir={[0, 0.5, 0.3]} len={1.6} frame={f} count={18} color="#9dff6a" opacity={0.5} size={0.8} />}
  </Stage>;
};

// ---------------- I: YOU sniff expired milk. BONK ----------------
const I = () => {
  const f = useCurrentFrame(); const milk = wordAt('milk', 8) - LS[8]; const d = LS[9] - LS[8];
  const fall = clamp01((f - milk + 2) / 9);
  return <Stage palette={PAL.bedroom} fog={[30, 120]} overlay={<>
    <Headline y={300} delay={2} lines={[{text: 'OF COURSE', color: 'white', size: 80}, {text: 'YOU\'D SNIFF IT', color: '#ff5fc8', size: 100}]} />
    {f > 10 && <Sticker text="EXP: LAST TUESDAY" x={300} y={760} rot={-8} bg="#ffffff" fg="#d6302a" delay={10} size={50} />}
    <Bonk text="BONK!" x={600} y={980} delay={milk + 8} />
  </>}>
    <CamRig frame={f} shake={0.2} shakeFrom={milk + 8} shakeLen={12} keys={[{f: 0, pos: [0.6, 2.4, 5.6], look: [0, 1.4, -0.5], fov: 44}, {f: d, pos: [0.3, 1.9, 4.4], look: [0, 0.9, -0.5], fov: 44}]} />
    <Bedroom frame={f} wall="#ffd27a" floor="#5fc0a0" bed={false} flowers={false} lamp={0.6} />
    <mesh position={[-2.6, 0.9, -2.2]}><boxGeometry args={[2.2, 1.8, 1.2]} /><meshLambertMaterial color="#e8f6ff" flatShading /></mesh>
    <You position={[0, 0, -0.3]} pose={fall > 0 ? 'fall' : 'stand'} fallT={fall} frame={f} phone={false} tag={false} expr={f > milk - 30 ? 'o' : 'open'} />
    <MilkCarton position={fall > 0 ? [0.7, 0.02, 0.8] : [0.18, 1.55, 0.5]} rotation={fall > 0 ? [0, 0, Math.PI / 2] : [0.3, 0, 0]} scale={0.8} />
    <Gas from={fall > 0 ? [0.7, 0.3, 0.8] : [0.18, 2.1, 0.5]} dir={[0, 1, 0]} len={1.4} frame={f} count={16} color="#9dff6a" opacity={0.5} size={0.6} />
    {fall >= 1 && [0, 1, 2].map((i) => { const a = f * 0.2 + i * 2.1; return <mesh key={i} position={[Math.cos(a) * 0.6, 0.6, 0.6 + Math.sin(a) * 0.6]}><octahedronGeometry args={[0.12, 0]} /><meshBasicMaterial color="#ffd93b" /></mesh>; })}
  </Stage>;
};

// ---------------- J: lab finds nothing ----------------
const J = () => {
  const f = useCurrentFrame(); const no = wordAt('nothing', 9) - LS[9]; const d = LS[10] - LS[9];
  return <Stage palette={PAL.lab} background="repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 64px), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 64px), linear-gradient(180deg,#0f3563,#1b5590)" overlay={<>
    <Headline y={300} delay={2} lines={[{text: 'LAB TESTS', color: 'white'}, {text: 'ON THE CLOTH', color: '#7fe3ff', size: 90}]} />
    {f >= no && <Sticker text="NOTHING." x={540} y={1020} rot={-8} bg="#d6302a" fg="#fff" delay={no} size={130} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [0, 4, 6], look: [0, 1, 0], fov: 46}, {f: d, pos: [1.2, 3, 4.2], look: [0, 1, 0], fov: 44}]} />
    <mesh position={[0, 0.5, 0]}><boxGeometry args={[6, 0.2, 3]} /><meshLambertMaterial color="#3a4f8a" flatShading /></mesh>
    {[[-2.7, -1.3], [2.7, -1.3], [-2.7, 1.3], [2.7, 1.3]].map(([x, z], i) => <mesh key={i} position={[x, 0, z]}><boxGeometry args={[0.15, 1, 0.15]} /><meshLambertMaterial color="#9aa8c0" /></mesh>)}
    <Cloth position={[0, 0.62, 0.2]} />
    <group position={[Math.sin(f * 0.06) * 0.8, 1.5, 0.2 + Math.cos(f * 0.05) * 0.3]} rotation={[-Math.PI / 2.4, 0, 0]} scale={0.6}>
      <mesh><torusGeometry args={[0.55, 0.07, 6, 18]} /><meshLambertMaterial color="#2a2a33" /></mesh>
      <mesh><circleGeometry args={[0.5, 18]} /><meshBasicMaterial color="#bfe8ff" transparent opacity={0.35} /></mesh></group>
    {[[-2, '#7fe3ff'], [-1.3, '#ff9ad5'], [1.6, '#b6ff7a'], [2.2, '#ffd93b']].map(([x, c], i) => <group key={i} position={[x, 0.6, -0.6]}>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.18, 0.28, 0.8, 7]} /><meshLambertMaterial color={c} transparent opacity={0.8} flatShading /></mesh>
      <Bubbles position={[0, 0.2, 0]} height={1.4} count={10} frame={f} speed={0.02} size={0.06} spread={0.2} seed={i + 5} /></group>)}
  </Stage>;
};

// ---------------- K: town panics + group chat ----------------
const K = () => {
  const f = useCurrentFrame(); const d = LS[11] - LS[10];
  const runners = Array.from({length: 8}, (_, i) => i);
  return <Stage palette={PAL.night} fog={[30, 140]} overlay={<>
    <Headline y={280} delay={2} lines={[{text: 'THE TOWN PANICS', color: 'red', size: 96}]} />
    <GroupChat delay={wordAt('like', 10) - LS[10] - 4} />
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [0, 9, 16], look: [0, 0.8, 0], fov: 50}, {f: d, pos: [4, 7, 12], look: [0, 0.8, 0], fov: 48}]} />
    <Stars opacity={0.8} /><Moon />
    <Town frame={f} litFn={(k) => ((Math.floor(f / 6) + k) % 3 ? 0.9 : 0.2)} heroLit={0.9} />
    {runners.map((i) => { const a = f * 0.05 * (i % 2 ? 1 : -1) + i * 0.8; const r = 2.2 + (i % 3) * 0.9;
      return <Person key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r * 0.6]} rotation={-a + (i % 2 ? 0 : Math.PI)} pose="walk" phase={f / 2.2 + i} scale={0.9} {...[ALINE, BERT, BEULAH, CHIEF, YOU_LOOK][i % 5]} expr="o" />; })}
  </Stage>;
};

// ---------------- L: armed patrols, then the kitchen-wall shot ----------------
const Patrol = ({f, i}) => { const x = -14 + f * 0.06 + i * 2.2; const z = (i % 2 ? 1.2 : -1.2);
  return <group position={[x, 0, z]}><Person rotation={Math.PI / 2} pose="walk" phase={f / 4 + i} {...[BERT, CHIEF, ALINE, BEULAH][i % 4]} />
    <Shotgun position={[0.3, 1.2, 0.35]} rotation={[0, Math.PI / 2, 0.2]} />
    <mesh position={[1.7, 1.0, 0.3]} rotation={[0, 0, Math.PI / 2 + 0.25]}><coneGeometry args={[0.7, 2.6, 10, 1, true]} /><meshBasicMaterial color="#fff2a8" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh></group>; };
const L1 = () => {
  const f = useCurrentFrame(); const d = wordAt('woman', 11) - LS[11];
  return <Stage palette={PAL.night} fog={[20, 110]} overlay={<Headline y={300} delay={2} lines={[{text: 'ARMED PATROLS', color: 'white', size: 96}, {text: 'HUNT THE STREETS', color: '#ffd93b', size: 80}]} />}>
    <CamRig frame={f} keys={[{f: 0, pos: [-4.5, 2.8, 5.6], look: [-10, 1.2, 0], fov: 50}, {f: d, pos: [-2.6, 2.6, 5.4], look: [-8.5, 1.2, 0], fov: 50}]} />
    <Stars opacity={0.8} /><Moon />
    <Town frame={f} lit={0.3} heroLit={0.3} />
    {[0, 1, 2, 3].map((i) => <Patrol key={i} f={f} i={i} />)}
  </Stage>;
};
const L2 = () => {
  const f = useCurrentFrame(); const bang = wordAt('blast', 11) - wordAt('woman', 11); const d = LS[12] - wordAt('woman', 11);
  return <Stage palette={PAL.bedroom} fog={[30, 120]} overlay={<>
    {f < bang ? <Headline key="a" y={300} delay={2} lines={[{text: 'LOADING', color: 'white'}, {text: 'A SHOTGUN...', color: '#ffd93b', size: 100}]} />
      : <Headline key="b" y={300} lines={[{text: 'HOLE IN HER', color: 'white'}, {text: 'KITCHEN WALL', color: 'red', size: 100}]} />}
    <Bonk text="BANG!" x={330} y={880} delay={bang} color="#ffffff" fg="#d6302a" size={340} />
    <Flash at={bang} len={5} color="#fff6c8" />
  </>}>
    <CamRig frame={f} shake={0.35} shakeFrom={bang} shakeLen={16} keys={[{f: 0, pos: [2.6, 2.8, 7.4], look: [-0.4, 1.3, -0.6], fov: 50}, {f: d, pos: [1.6, 2.5, 6.6], look: [-1.0, 1.3, -0.4], fov: 50}]} />
    <Bedroom frame={f} wall="#ffd27a" floor="#ff8a5a" bed={false} flowers={false} />
    <mesh position={[-2.8, 0.5, -2.3]}><boxGeometry args={[2.6, 1.0, 1.0]} /><meshLambertMaterial color="#2fbfa0" flatShading /></mesh>
    <Person position={[0.4, 0, -0.4]} rotation={-2.7} pose="stand" phase={f / 8} {...BEULAH} shirt="#ff9ad5" expr={f > bang ? 'o' : 'open'} />
    <Shotgun position={[-0.27, 1.15, -0.91]} rotation={[f > bang && f < bang + 6 ? -0.35 : 0, -2.7, 0]} />
    {f >= bang && <><mesh position={[-1.18, 1.2, -2.82]}><circleGeometry args={[0.5, 9]} /><meshBasicMaterial color="#141018" /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[-1.18 + Math.cos(i) * 0.55, 1.2 + Math.sin(i) * 0.55, -2.8]} rotation={[0, 0, i]}><planeGeometry args={[0.5, 0.06]} /><meshBasicMaterial color="#3a2a1a" /></mesh>)}
      <Smoke position={[-1.18, 1.2, -2.6]} frame={f - bang} count={8} height={2} color="#e8e0d0" opacity={0.6} size={0.8} /></>}
  </Stage>;
};

// ---------------- M: YOU holding the shotgun like a phone. freeze ----------------
const M = () => {
  const fz = wordAt('go', 12) - LS[12]; const [f, frozen] = useFreeze(fz);
  return <FrozenWrap frozen={frozen} over={<>
    <Headline y={300} delay={2} lines={[{text: 'HONESTLY?', color: '#ff5fc8', size: 100}]} />
    {frozen && <><FreezeFX at={fz} label="CAUSE OF EXIT" /><Sticker text="CAUSE: SKILL ISSUE" sub="(holding it like a phone)" x={540} y={620} rot={-5} delay={fz} size={78} bg="#ffd93b" fg="#141414" /></>}
    <Flash at={fz} len={6} />
  </>}><Stage palette={PAL.bedroom} fog={[30, 120]} >
    <CamRig frame={f} keys={[{f: 0, pos: [0.9, 2.6, 8.2], look: [0, 1.4, -0.5], fov: 46}, {f: 40, pos: [0.5, 2.3, 6.6], look: [0, 1.4, -0.5], fov: 44}]} />
    <Bedroom frame={f} wall="#ffd27a" floor="#ff8a5a" bed={false} flowers={false} />
    <You position={[0, 0, -0.4]} frame={f} phone={false} expr="o" />
    <Shotgun position={[0.42, 1.75, 0.1]} rotation={[-Math.PI / 2 + 0.25 + Math.sin(f * 0.2) * 0.05, 0, 0]} />
  </Stage></FrozenWrap>;
};

// ---------------- N: spilled nail polish (sad trombone) ----------------
const N = () => {
  const f = useCurrentFrame(); const pol = wordAt('polish', 13) - LS[13]; const d = LS[14] - LS[13];
  const pud = clamp01((f - 4) / 40);
  return <Stage palette={PAL.bedroom} fog={[30, 120]} overlay={<>
    <Headline y={300} delay={2} lines={[{text: 'ONE "GAS ATTACK"', color: 'white', size: 84}, {text: 'WAS...', color: 'white', size: 84}]} />
    {f >= pol - 6 && <Sticker text="SPILLED NAIL POLISH" x={540} y={1060} rot={5} bg="#ff2f8a" fg="#fff" delay={pol - 6} size={78} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [3.4, 3.8, 8.2], look: [-0.2, 0.8, -0.4], fov: 46}, {f: d, pos: [2.4, 3.0, 6.2], look: [-0.2, 0.7, -0.4], fov: 46}]} />
    <Stars opacity={0.8} radius={60} /><Moon pos={[8, 16, -40]} />
    <Bedroom frame={f} />
    <NailPolish position={[0.1, 0.0, -0.5]} rotation={[0, 0.5, -0.95]} scale={0.9} />
    <mesh position={[1.2, 0.02, -0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.4 + pud * 1.4, 0.3 + pud * 1.0, 1]}><circleGeometry args={[1, 12]} /><meshPhongMaterial color="#ff2f8a" shininess={80} /></mesh>
    <Gas from={[1.2, 0.2, -0.2]} dir={[0, 1, 0.2]} len={1.6} frame={f} count={16} color="#ffb3e0" opacity={0.45} size={0.7} />
    <Person position={[-2.2, 0, 0.4]} rotation={0.5} pose="stand" phase={f / 6} {...ALINE} expr="o" />
  </Stage>;
};

// ---------------- O: police: probably no gasser, just fear spreading ----------------
const O = () => {
  const f = useCurrentFrame(); const fear = wordAt('fear', 14) - LS[14]; const d = LS[15] - LS[14];
  return <Stage palette={PAL.dawn} fog={[40, 180]} overlay={<>
    <Pill text="SEPT 12, 1944 · POLICE" y={236} variant="white" delay={2} />
    {f < fear - 4 ? <Headline key="a" y={318} delay={4} lines={[{text: 'PROBABLY', color: 'white'}, {text: 'NO GASSER', color: '#ffd93b', size: 108}]} />
      : <Headline key="b" y={318} lines={[{text: 'JUST FEAR', color: 'red', size: 108}, {text: 'HOUSE TO HOUSE', color: 'white', size: 74}]} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [0, 3.2, 10], look: [0, 1.6, 0], fov: 46}, {f: d, pos: [6, 9, 18], look: [0, 1, -2], fov: 50}]} />
    <Clouds frame={f} y={26} count={8} speed={0.07} />
    <Town frame={f} lit={0} heroLit={0} lamps={0} />
    <group position={[0, 0, 1.2]}><mesh position={[0, 0.6, 0]}><boxGeometry args={[1.2, 1.2, 0.6]} /><meshLambertMaterial color="#8a4a2a" flatShading /></mesh>
      <Person position={[0, 0, -0.6]} pose="stand" phase={f / 8} {...CHIEF} />
      <mesh position={[0.45, 1.9, -0.1]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.22, 0.6, 8, 1, true]} /><meshLambertMaterial color="#e8e8e8" side={THREE.DoubleSide} /></mesh></group>
    {[-27, -18, -9, 9, 18, 27].map((x, i) => { const z = i % 2 ? 9 : -9; const t = clamp01((f - fear - i * 5) / 12);
      return f > fear - 10 && <Gas key={i} from={[x, 1.5, z + (z < 0 ? 2 : -2)]} dir={[i % 2 ? -1 : 1, 0.2, 0]} len={6 * t + 0.5} frame={f} count={14} color="#ff6a8a" opacity={0.4} size={1.6} seed={i + 9} />; })}
  </Stage>;
};

// ---------------- P: attacks stop, nobody caught (wanted poster) ----------------
const P = () => {
  const f = useCurrentFrame(); const caught = wordAt('nobody', 15) - LS[15]; const d = LS[16] - LS[15];
  return <Stage palette={PAL.day} fog={[60, 200]} overlay={<>
    <Headline y={300} delay={2} lines={[{text: 'THE ATTACKS', color: 'white'}, {text: 'STOP', color: '#9be15d', size: 116}]} />
    {f >= caught - 6 && <Wanted delay={caught - 6} />}
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [-10, 8, 16], look: [0, 1, -3], fov: 48}, {f: d, pos: [8, 8, 16], look: [0, 1, -3], fov: 48}]} />
    <Clouds frame={f} y={26} count={9} speed={0.08} />
    <Town frame={f} lit={0} heroLit={0} lamps={0} />
    {[0, 1, 2].map((i) => <Person key={i} position={[-6 + i * 4 + f * 0.03, 0, 2 - i * 0.3]} rotation={Math.PI / 2} pose="walk" phase={f / 4.5 + i} {...[ALINE, BERT, BEULAH][i]} />)}
  </Stage>;
};

// ---------------- Q: HORROR return. who was at the window? ----------------
const Q = () => {
  const f = useCurrentFrame(); const who = wordAt('so', 16) - LS[16]; const d = LS[17] - LS[16];
  const gop = interpolate(f, [who - 10, who + 10], [0, 1], cl);
  return <Stage palette={PAL.horror} fog={[8, 50]} overlay={<>
    {f < who ? <Headline key="a" y={300} delay={4} lines={[{text: 'BERT SWORE', color: 'white'}, {text: 'A MAN STOOD HERE', color: 'red', size: 82}]} />
      : <Headline key="b" y={300} lines={[{text: 'SO WHO', color: 'white', size: 110}, {text: 'WAS IT?', color: 'red', size: 120}]} />}
  </>}>
    <CamRig frame={f} drift={0.05} keys={[{f: 0, pos: [0.4, 2.2, 3.5], look: [1.4, 1.9, -7.0], fov: 44}, {f: d, pos: [1.2, 2.1, -0.8], look: [1.7, 2.0, -7.0], fov: 40}]} />
    <Stars opacity={0.3} /><Moon color="#ffb0b0" glow="#ff3a4a" />
    <Town frame={f} lit={0.05} heroLit={0.25} lamps={0.25} ground="#1f4a2a" road="#1d1828" trees={false} />
    <Gasser position={[1.8, 0, -6.5]} frame={f} opacity={gop} eyes={gop} gun={false} />
    <Gas from={[0, 0.3, -5.5]} dir={[1, 0, 0.3]} len={5} frame={f} count={30} color="#7aa86a" opacity={0.28} size={1.8} />
  </Stage>;
};

// ---------------- R: final roast, shutters slam, end card ----------------
const R = () => {
  const f = useCurrentFrame(); const close = wordAt('close', 17) - LS[17]; const sniff = wordAt('sniff', 17) - LS[17]; const d = GASSER_FRAMES - LS[17];
  const rise = easeOut(clamp01((f - 6) / 40)); const sh = clamp01((f - close) / 4);
  const endAt = d - 80;
  return <Stage palette={PAL.bedroom} fog={[30, 120]} overlay={<>
    <Headline y={268} delay={2} stagger={6} lines={[{text: 'REAL GASSER', color: 'red', size: 92}, {text: 'OR A TOWN THAT', color: 'white', size: 64}, {text: 'SCARED ITSELF SICK?', color: '#ffd93b', size: 72}]} />
    <Bonk text="BONK!" x={720} y={760} delay={close + 3} />
    {f >= sniff && <Sticker text="YOU'D SNIFF THE CLOTH" x={540} y={1110} rot={-4} delay={sniff} size={66} />}
    {f >= endAt && <Pill text="COMMENT BELOW 👇" y={1450} variant="yellow" delay={endAt} size={48} />}
    <EndCard delay={endAt} sources={['WIKIPEDIA', 'ATLAS OBSCURA 2023', 'JOHNSON 1945']} />
  </>}>
    <CamRig frame={f} keys={[{f: 0, pos: [2.6, 3.0, 7.5], look: [0.6, 1.8, -1.2], fov: 46}, {f: close, pos: [1.6, 2.6, 5.6], look: [0.8, 1.9, -1.6], fov: 44}, {f: d, pos: [0.8, 2.8, 8.5], look: [0.5, 1.7, -1.2], fov: 48}]} shake={0.15} shakeFrom={close + 2} shakeLen={10} />
    <Stars opacity={0.8} radius={60} /><Moon pos={[8, 16, -40]} />
    <Bedroom frame={f} wall="#2fa3c8" floor="#d98a3a" bed={false} shutter={sh} />
    <You position={[0.15, 0, -0.6]} rotation={0.05} frame={f} />
    {sh < 1 && <Gasser position={[1.7, -1.6 + rise * 2.0, -4.3]} frame={f} scale={1.2} />}
  </Stage>;
};

const SCENES = [
  [A, LS[0], wordAt('and', 0)], [B, wordAt('and', 0), LS[1]], [C, LS[1], LS[3]], [D, LS[3], wordAt('so', 3)], [E, wordAt('so', 3), LS[4]],
  [F, LS[4], LS[6]], [G, LS[6], LS[7]], [H, LS[7], LS[8]], [I, LS[8], LS[9]], [J, LS[9], LS[10]], [K, LS[10], LS[11]],
  [L1, LS[11], wordAt('woman', 11)], [L2, wordAt('woman', 11), LS[12]], [M, LS[12], LS[13]], [N, LS[13], LS[14]], [O, LS[14], LS[15]],
  [P, LS[15], LS[16]], [Q, LS[16], LS[17]], [R, LS[17], GASSER_FRAMES],
];
export const SCENE_STARTS = SCENES.map((s) => s[1]);

export const MadGasser = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces />
    {SCENES.map(([Cmp, from, to], i) => <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><Cmp />{i > 0 && <Dip inFrames={4} />}</Sequence>)}
    <Finish vignette={0.5} grain={0.05} />
    <EmCaption words={W} y={1310} />
  </AbsoluteFill>
);
