import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Stage, CameraRig, Orb, Clouds, Birds, Glow, Building, rng, clamp01, easeOut, easeInOut, smoothstep, PALETTES, mixPalette} from '../kit/index.js';
import {Guy, LOOKS, runPose, wobblePose, idlePose, cheerPose, wavePose, pointPose, sitPose, crampPose, drinkPose, eatPose, sleepPose, thumbPose, carriedPose, shakePhonePose, mix} from './Guy.jsx';
import {OldCar, DustTrail, Motes, Stadium, Well, AppleTree, Apple, Dog, PoisonBottle, Phone, ModernRoom, Podium, Puffs, Sign, Crowd, textTex, diceTex} from './Props.jsx';
import {RoadWorld, roadX, ground} from './World.jsx';
import {UIFonts, Captions, chunkWords, TitleBox, Tag, Stamp, Grade, Float, Counter, C} from './UI.jsx';
import VO from './vo.json';

const FPS = 30;
export const MARATHON_FRAMES = Math.round((VO.dur + 0.75) * FPS);
const W = VO.words; const SEG = VO.segs;
/** start time (s) of the first word in segment `seg` that starts with `txt` */
const tw = (seg, txt) => { const w = W.find((x) => x[3] === seg && x[0].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(txt)); return w ? w[1] : SEG[seg].start; };
const fr = (s) => Math.round(s * FPS);

// ---------- palettes ----------
const HEAT = {...PALETTES.day, top: '#1f6fd8', mid: '#62b8f2', hor: '#ffe0a0', fog: '#f3dcae', amb: 1.15, hemiSky: '#cfe8ff', hemiGround: '#a07a3a', hemiI: 1.5, sun: '#fff0c8', sunI: 3.2, sunPos: [40, 45, 30], rim: '#ffc078', rimI: 1.8, rimPos: [-30, 20, -40]};
const DUSTY = {...HEAT, top: '#5a8ad0', mid: '#d8b880', hor: '#f0d2a0', fog: '#e8c898'};
const MODERN = {top: '#3a2a7a', mid: '#7a5bd5', hor: '#ff9ad0', fog: '#c8b8f0', amb: 1.25, hemiSky: '#e8dcff', hemiGround: '#a07a5a', hemiI: 1.4, sun: '#ffffff', sunI: 2.2, sunPos: [10, 20, 25], rim: '#7fe3ff', rimI: 1.4, rimPos: [-20, 15, -20], glow: 0};
const NOLA = {...PALETTES.night, top: '#0b0a2e', mid: '#3a1f7a', hor: '#c2508a', fog: '#3a2a6a', amb: 0.8, sunI: 1.6, sun: '#ffd8a0', sunPos: [10, 20, 30], rim: '#ff7ab0', rimI: 2.0};
const PSY = (f) => ({...HEAT, top: '#' + new THREE.Color().setHSL((0.75 + f * 0.01) % 1, 0.8, 0.45).getHexString(), mid: '#' + new THREE.Color().setHSL((0.9 + f * 0.01) % 1, 0.85, 0.6).getHexString(), hor: '#' + new THREE.Color().setHSL((0.12 + f * 0.01) % 1, 0.95, 0.7).getHexString()});

const Sun = ({p = [70, 60, -120]}) => <><Orb position={p} radius={6} color="#fff6d0" /><Glow position={p} size={70} color="#ffcf6a" opacity={0.7} /></>;
const g = (x, z) => ground(x, z);
const onRoad = (z, off = 0) => [roadX(z) + off, g(roadX(z) + off, z), z];

// ---------- shot wrapper: whip-in, punch zoom, freeze for stings ----------
const Shot = ({children, whip = 0, punch = 0, sting = null, dur, filter = ''}) => {
  const f = useCurrentFrame();
  let tx = 0, blur = 0, sc = 1, extra = '';
  let rot = 0; if (whip) { const k = clamp01(1 - f / 6); sc = 1 + 0.22 * k * k; blur = 16 * k; rot = whip * 3 * k * k; }
  if (punch) sc *= 1 + punch * easeOut(clamp01(f / 10));
  if (sting !== null && f >= sting) { const k = f - sting; sc *= 1 + 0.12 * easeOut(clamp01(k / 5)); tx += Math.sin(k * 2.7) * 10 * clamp01(1 - k / 8); extra = ' saturate(0.55) contrast(1.15)'; }
  return <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${sc}) rotate(${rot}deg)`, filter: `${blur ? `blur(${blur}px)` : ''} saturate(1.12)${extra} ${filter}`}}>{children}</AbsoluteFill>;
};
/** frame for animation that freezes at the sting */
const useF = (freezeAt = 1e9) => Math.min(useCurrentFrame(), freezeAt);

// ---------- reusable crowds of runners on the road ----------
const RUNNERS = (() => { const r = rng(31); return Array.from({length: 14}, (_, i) => ({off: (r() - 0.5) * 2.6, dz: -i * 2.4 - r() * 2, sp: 0.85 + r() * 0.3, look: LOOKS.runners[i % 5], k: r() * 0.8, ph: r() * 40})); })();
const RoadRunners = ({f, z0 = 0, speed = 0.11, n = 8, skip = []}) => <>{RUNNERS.slice(0, n).map((R, i) => {
  if (skip.includes(i)) return null; const z = z0 + R.dz + f * speed * R.sp; const x = roadX(z) + R.off;
  return <Guy key={i} position={[x, g(x, z), z]} rotation={0} scale={0.95} look={R.look} j={runPose(f + R.ph, R.k, R.sp)} expr={R.k > 0.5 ? 'sad' : 'open'} sweat={1} frame={f} />;
})}</>;

// =====================================================================================
// SHOTS
// =====================================================================================
const STAIRS_GUY = [2.5, 0, 2.2];
const StairsShot = ({end = false}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const k0 = {f: 0, pos: [1.2, 0.85, 8.4], look: [2.9, 2.3, -0.6], fov: 52}; const k1 = {f: d, pos: [1.7, 1.05, 6.6], look: [2.9, 2.4, -0.8], fov: 46};
  const keys = end ? [{...k1, f: 0, pos: [2.0, 1.3, 5.6], fov: 42}, {...k0, f: d}] : [k0, k1];
  const sigh = Math.sin(f * 0.12);
  const j = end ? {...idlePose(f), lA: 0.1, rA: -0.3 + Math.sin(f * 0.5) * 0.05, headX: -0.25, headY: 0.4, lean: -0.05, rAz: 0.4, rEl: -1.6} : {...idlePose(f), lean: -0.12 + sigh * 0.04, headX: -0.55 + sigh * 0.1, lA: 0.15, rA: 0.15, lAz: 0.25 + sigh * 0.05, rAz: 0.25 + sigh * 0.05, roll: Math.sin(f * 0.07) * 0.05, bob: -0.04 + sigh * 0.02};
  return <Stage palette={MODERN} fog={[30, 90]}>
    <CameraRig keys={keys} drift={0.05} />
    <ModernRoom frame={f} couch={false} />
    <Guy position={STAIRS_GUY} rotation={end ? 0.25 : -0.2} look={LOOKS.modern} j={j} expr={end ? 'sad' : 'sad'} sweat={end ? 0 : 1} frame={f} />
    {/* "top floor" sign at the stair top */}
    <Sign position={[3.5, 6.1, -7.7]} text={'1st FLOOR'} w={2.4} h={0.8} post={0} opts={{size: 56, bg: '#ffffff', fg: '#3a2a7a', border: '#3a2a7a'}} />
  </Stage>;
};

const StadiumCrane = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const lap = (i) => { const a = -f * 0.012 - i * 0.07; return [Math.cos(a) * 27.4 + (i % 2) * 0.8, 0.05, Math.sin(a) * 11.7 + (i % 2) * 0.6, a]; };
  return <Stage palette={HEAT} fog={[60, 260]}>
    <CameraRig keys={[{f: 0, pos: [-34, 34, 52], look: [0, 2, 0], fov: 46}, {f: d, pos: [-12, 9, 30], look: [8, 2, 6], fov: 50}]} />
    <Sun /><Clouds frame={f} y={45} count={6} speed={0.06} /><Birds center={[0, 26, -10]} radius={20} frame={f} count={6} />
    <Stadium frame={f} excite={0.8} />
    {Array.from({length: 10}, (_, i) => { const [x, y, z, a] = lap(i); return <Guy key={i} position={[x, y, z]} rotation={-a + Math.PI} look={LOOKS.runners[i % 5]} j={runPose(f + i * 7, 0.1)} frame={f} />; })}
    <Motes center={[0, 2, 0]} area={[60, 10, 40]} count={60} frame={f} />
  </Stage>;
};

const DogChase = ({z0 = 30, drone = false, teaser = false}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const v = 0.17; const zr = z0 + f * v;
  // runner swerves off the road into the corn (x decreasing)
  const off = teaser ? -2 : drone ? -8.5 - smoothstep(0, d, f) * 2.5 : -1.5 - smoothstep(0, d * 0.7, f) * 7; const rx = roadX(zr) + off;
  const zA = drone ? z0 - 9 : z0; const ax = roadX(zA) - 1.5;
  const trailX = (z) => teaser ? roadX(z) - 2 : ax + (rx - ax) * clamp01((z - zA) / Math.max(0.1, zr - zA));
  const part = (x, z) => { if (z > zr + 0.6 || z < zA - 1) return [0, 0]; const dx = x - trailX(z); return Math.abs(dx) < 1.5 ? [Math.sign(dx || 1) * 0.65 * (1 - Math.abs(dx) / 1.5), 0.12] : [0, 0]; };
  const dogs = [[-1.2, -3.2], [1.0, -4.6], [-0.2, -6.4]];
  const keys = drone
    ? [{f: 0, pos: [rx + 9, 11, zr - 9], look: [rx, 0.5, zr + 1], fov: 50}, {f: d, pos: [rx + 6, 8, zr + 9], look: [rx - 0.5, 0.5, zr - 1], fov: 50}]
    : teaser ? [{f: 0, pos: [rx + 1.2, 0.7, zr + 5.5], look: [rx - 0.5, 1.2, zr - 3], fov: 56}, {f: d, pos: [rx + 2.6, 1.0, zr + 6.2], look: [rx - 0.2, 1.1, zr - 3.5], fov: 50}]
      : [{f: 0, pos: [roadX(zr) + 3.2, 3.4, zr + 7.5], look: [rx, 0.8, zr - 2], fov: 52}, {f: d, pos: [roadX(zr) + 4.5, 4.4, zr + 6.5], look: [rx, 0.6, zr - 2.5], fov: 54}];
  return <Stage palette={HEAT} fog={[45, 190]}>
    <CameraRig keys={keys} drift={0.12} />
    <Sun p={[-60, 55, 140]} /><Clouds frame={f} y={40} count={6} speed={0.07} z0={60} />
    <RoadWorld frame={f} win={[z0 - 50, z0 + 70]} center={z0 + 10} corn={z0 + 18} cornPart={part} />
    <Guy position={[rx, g(rx, zr), zr]} rotation={-0.25} look={LOOKS.len} j={{...runPose(f, 0.05, 1.35), headY: Math.sin(f * 0.2) > 0.6 ? 2.4 : 0}} expr="o" sweat={1} frame={f} />
    {dogs.map(([dx, dz], i) => { const x = rx + dx + Math.sin(f * 0.15 + i) * 0.3, z = zr + dz; return <Dog key={i} position={[x, g(x, z), z]} rotation={-0.2} scale={drone ? 1.5 : 1.15} t={f + i * 9} bark={1} color={['#8a6a4a', '#5a4a3a', '#b89a6a'][i]} dark={['#4a3424', '#2a2018', '#6a5034'][i]} />; })}
    {teaser && <DustTrail pos={(fb) => { const z = z0 + fb * v - 4; return [roadX(z) + off, g(roadX(z) + off, z), z]; }} frame={f} every={3} life={40} size={1.1} opacity={0.35} />}
  </Stage>;
};

const PoisonTeaser = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 120 + f * 0.03; const x = roadX(z);
  const p = clamp01((f - 12) / 10); const swirl = f > 34;
  return <Stage palette={swirl ? PSY(f) : HEAT} fog={[40, 180]}>
    <CameraRig keys={[{f: 0, pos: [x + 3.2, 2.2, z + 5], look: [x, 1.7, z], fov: 48}, {f: d, pos: [x + 1.1, 2.15, z + 2.4], look: [x, 2.0, z], fov: 40}]} drift={0.06} />
    <Sun p={[-70, 50, 150]} />
    <RoadWorld frame={f} win={[z - 40, z + 80]} center={z + 20} />
    <Guy position={[x, g(x, z), z]} rotation={0.4} look={LOOKS.hicks} j={{...wobblePose(f, 0.4), ...drinkPose(f, p)}} expr={swirl ? 'swirl' : 'open'} holdR={<PoisonBottle scale={1.5} />} sweat={1} frame={f} />
    <Guy position={[x + 1.4, g(x + 1.4, z - 0.6), z - 0.6]} rotation={-0.9} look={LOOKS.trainer} j={{...idlePose(f), rA: -1.0, rEl: -0.4}} expr="grin" frame={f} />
  </Stage>;
};

const StartLine = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const bang = 1; const go = clamp01((f - bang) / 6);
  return <Stage palette={HEAT} fog={[50, 220]}>
    <CameraRig keys={[{f: 0, pos: [-3.5, 1.0, 18.5], look: [1.5, 1.6, 11.5], fov: 50}, {f: d, pos: [-6.5, 1.5, 19.5], look: [-1, 1.8, 11.5], fov: 54}]} shake={0.25} shakeFrom={bang} shakeLen={10} />
    <Sun p={[-50, 45, -60]} />
    <Stadium frame={f} excite={go} tape={false} />
    {Array.from({length: 9}, (_, i) => { const lane = 9.8 + (i % 5) * 0.95, row = Math.floor(i / 5); const x = 2 - row * 1.4 - f * 0.16 * go * (0.9 + (i % 3) * 0.1); return <Guy key={i} position={[x, 0.05, lane]} rotation={-Math.PI / 2} look={LOOKS.runners[i % 5]} j={go > 0 ? runPose(f + i * 5, 0, 1.1) : {...idlePose(f, i), lean: 0.3, lA: 0.5, rA: -0.6, lL: -0.4, rK: 0.3}} expr={go ? 'angry' : 'open'} frame={f} />; })}
    <Guy position={[3.2, 0.05, 15.6]} rotation={-0.7} look={LOOKS.official} j={{rA: f < bang ? -2.9 : -2.9 + clamp01((f - bang) / 8) * 0.4, rAz: 0.1, lA: 0.1, headX: -0.1}} holdR={<mesh rotation={[Math.PI / 2, 0, 0]}><boxGeometry args={[0.1, 0.5, 0.12]} /><meshLambertMaterial color="#222" /></mesh>} frame={f} />
    {f >= bang && <Puffs position={[3.6, 3.6, 15.4]} frame={(f - bang) * 3} count={5} color="#f4f0e8" opacity={0.85 * clamp01(1 - (f - bang) / 30)} height={1.2} size={0.9} speed={0.02} />}
    {f >= bang && f < bang + 3 && <Glow position={[3.5, 3.5, 15.5]} size={5} color="#fff2a0" opacity={0.9} />}
    <Motes center={[0, 1, 12]} area={[30, 5, 12]} count={50} frame={f} />
  </Stage>;
};

const DustRoad = ({z0 = 40}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const v = 0.11; const zc = z0 + f * v; const cz = (k) => zc - 5 - k * 7 + f * 0.05;
  return <Stage palette={DUSTY} fog={[25, 150]}>
    <CameraRig keys={[{f: 0, pos: [roadX(zc) + 7.5, 3.4, zc + 1], look: [roadX(zc), 1.3, zc - 2], fov: 50}, {f: d, pos: [roadX(zc) + 4.5, 2.2, zc + 7.5], look: [roadX(zc), 1.4, zc - 2.5], fov: 52}]} />
    <Sun p={[-80, 50, 100]} />
    <RoadWorld frame={f} win={[zc - 50, zc + 80]} center={zc + 10} />
    <RoadRunners f={f} z0={z0} speed={v} n={7} />
    {[0, 1].map((k) => { const z = cz(k); const x = roadX(z) + (k ? -0.9 : 1.0); return <group key={k}>
      <OldCar position={[x, g(x, z) + 0.02, z]} rotation={0} dist={z} frame={f} bounce={1} color={k ? '#2f5db5' : '#b3261e'} smoke={1}>
        <Guy position={[-0.35, 1.0, 0.45]} look={LOOKS.official} j={sitPose(f)} frame={f} scale={0.95} />
        <Guy position={[0.35, 1.0, -0.6]} look={{...LOOKS.trainer, hat: 'bowler'}} j={{...sitPose(f), ...pointPose(f, 0.5)}} frame={f} scale={0.95} expr="grin" />
      </OldCar>
      <DustTrail pos={(fb) => { const zz = z0 + fb * v - 5 - k * 7 + fb * 0.05; return [roadX(zz) + (k ? -0.9 : 1), g(roadX(zz), zz), zz - 2]; }} frame={f} every={3} life={55} size={1.6} grow={3.0} opacity={0.38} spread={2.6} seed={k + 3} color="#ecd2a0" />
    </group>; })}
    <Motes center={[roadX(zc), 1, zc]} area={[20, 5, 30]} count={60} frame={f} color="#ffe4a8" size={0.18} />
  </Stage>;
};

const GarciaFall = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z0 = 70; const fall = clamp01((f - 8) / 16); const z = z0 + Math.min(f, 14) * 0.08; const x = roadX(z) - 1.2 - fall * 0.8;
  return <Stage palette={DUSTY} fog={[12, 90]}>
    <CameraRig keys={[{f: 0, pos: [x + 2.6, 1.0, z + 4.2], look: [x - 0.2, 1.0, z], fov: 50}, {f: d, pos: [x + 2.0, 0.8, z + 3.0], look: [x - 0.4, 0.4, z - 0.2], fov: 46}]} shake={0.12} shakeFrom={22} shakeLen={8} />
    <RoadWorld frame={f} win={[z - 40, z + 60]} center={z + 10} />
    <Guy position={[x, g(x, z), z]} rotation={0.3} look={LOOKS.garcia} j={mix({...runPose(f, 0.9), headX: 0.5}, {...sleepPose(f), lA: -0.4, rA: 0.3}, fall)} expr={fall > 0.5 ? 'dead' : 'sad'} sweat={1 - fall} frame={f} />
    <DustTrail pos={(fb) => { const zz = z - 6 + fb * 0.12; return [roadX(zz) + 1.2, g(roadX(zz), zz), zz]; }} frame={f} every={2} life={50} size={2.0} grow={2.6} opacity={0.42} spread={3} color="#e6cc98" />
    {fall >= 1 && <Puffs position={[x, g(x, z) + 0.2, z]} frame={f * 2} count={6} color="#e6cc98" opacity={0.6} height={1.0} size={0.8} />}
  </Stage>;
};

const WellShot = ({sting}) => {
  const f = useF(sting); const {durationInFrames: d} = useVideoConfig();
  const zw = 160; const wx = roadX(zw) + 5.5; const wy = g(wx, zw);
  const rz = zw - 3 + Math.min(f, 25) * 0.12; const rx = roadX(rz) + 2.5 + clamp01((f - 10) / 20) * 1.4;
  const lean = clamp01((f - 28) / 12);
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [wx + 7, 2.2, zw + 9], look: [wx - 1, 1.6, zw], fov: 46}, {f: d, pos: [wx + 9, 11, zw + 13], look: [wx - 1.5, 0.8, zw - 1], fov: 50}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[zw - 45, zw + 70]} center={zw + 10} />
    <Well position={[wx, wy, zw]} frame={f} bucket={lean} />
    <Sign position={[wx - 2.3, g(wx - 2.3, zw + 1.6), zw + 1.6]} rotation={0.5} text={'WATER\nMILE 12'} w={2.0} h={1.3} post={1.3} opts={{size: 46, h: 160}} />
    <Guy position={[rx, g(rx, rz), rz]} rotation={0.9 + lean * 0.6} look={LOOKS.runners[1]} j={lean ? {...idlePose(f), lean: 0.6 * lean, lA: -1.2 * lean, rA: -1.2 * lean, headX: 0.5 * lean} : runPose(f, 0.7)} expr={lean ? 'o' : 'sad'} sweat={1} frame={f} />
    <Guy position={[wx + 1.8, g(wx + 1.8, zw - 1.6), zw - 1.6]} rotation={-0.6} look={LOOKS.scientist} j={{...idlePose(f), rA: -1.3, rEl: -0.9, lA: -1.1, lEl: -1.2, headX: 0.2}} holdL={<mesh rotation={[0.3, 0, 0]}><boxGeometry args={[0.45, 0.06, 0.6]} /><meshLambertMaterial color="#c9a27a" /></mesh>} expr="grin" frame={f} />
    <RoadRunners f={f} z0={zw - 12} speed={0.09} n={4} />
  </Stage>;
};

const ScienceShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 175, x = roadX(z) - 2.4;
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 0.3, 1.9, z + 6.4], look: [x + 0.6, 1.1, z - 0.1], fov: 50}, {f: d, pos: [x - 0.1, 1.7, z + 5.6], look: [x + 0.6, 1.1, z - 0.1], fov: 48}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 60]} center={z + 10} />
    <Guy position={[x - 0.6, g(x, z), z + 0.2]} rotation={-1.57} look={LOOKS.runners[2]} j={{...sleepPose(f), rA: -1.6 + Math.sin(f * 0.3) * 0.3}} expr="dead" frame={f} />
    <Guy position={[x + 1.9, g(x, z), z - 0.5]} rotation={-0.5} look={LOOKS.scientist} j={{lean: 0.22, rA: -1.2, rEl: -0.5 + Math.sin(f * 0.6) * 0.15, lA: -1.0, lEl: -1.3, headX: 0.35, lK: 0.1, rK: 0.1}} holdL={<mesh rotation={[0.4, 0, 0]}><boxGeometry args={[0.45, 0.06, 0.6]} /><meshLambertMaterial color="#c9a27a" /></mesh>}
      holdR={<group><mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}><torusGeometry args={[0.16, 0.035, 5, 12]} /><meshLambertMaterial color="#c9a23a" /></mesh><mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.15, 12]} /><meshBasicMaterial color="#bfe8ff" transparent opacity={0.5} /></mesh></group>} expr="grin" frame={f} />
    <Sign position={[x - 2.6, g(x - 2.6, z - 2.2), z - 2.2]} rotation={0.4} text={'DEHYDRATION\nSTUDY'} w={2.6} h={1.3} post={1.2} opts={{size: 40, h: 160, bg: '#ffffff', fg: '#1d4a8a', border: '#1d4a8a'}} />
  </Stage>;
};

const CrampShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 200, x = roadX(z) + 1.2; const cz = z - 16 + f * 0.25;
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 3.6, 1.0, z + 4.2], look: [x, 1.1, z], fov: 48}, {f: d, pos: [x + 2.4, 0.9, z + 2.8], look: [x - 0.2, 0.9, z - 1], fov: 44}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 60]} center={z + 10} />
    <Guy position={[x, g(x, z), z]} rotation={0.5} look={LOOKS.lorz} j={crampPose(f)} expr="angry" sweat={1} frame={f} />
    <OldCar position={[roadX(cz) - 0.6, g(roadX(cz), cz), cz]} dist={cz} frame={f} bounce={1} color="#2a7a4a" smoke={1}>
      <Guy position={[-0.35, 1.0, 0.45]} look={{...LOOKS.official, beard: ''}} j={sitPose(f)} frame={f} scale={0.95} />
    </OldCar>
  </Stage>;
};

const LorzCar = ({waveAt}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const v = 0.3; const z = 210 + f * v; const x = roadX(z) - 0.4; const waving = f >= waveAt;
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 8, 3.0, z - 3], look: [x, 1.6, z + 0.5], fov: 48}, {f: waveAt, pos: [x + 5.4, 2.4, z + 6.0], look: [x, 1.8, z - 0.6], fov: 46}, {f: d, pos: [x + 4.8, 2.5, z + 6.4], look: [x, 2.0, z - 0.6], fov: 44}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 45, z + 70]} center={z + 10} />
    <OldCar position={[x, g(x, z) + 0.02, z]} dist={z} frame={f} bounce={1} color="#2a7a4a" smoke={1}>
      <Guy position={[-0.35, 1.0, 0.45]} look={{...LOOKS.official, beard: ''}} j={sitPose(f)} frame={f} scale={0.95} />
      <Guy position={[0.35, 1.05, -0.6]} rotation={waving ? 0.6 : 0} look={LOOKS.lorz} j={{...sitPose(f), ...(waving ? wavePose(f) : {rA: -0.6, rEl: -0.8, headX: -0.15, lean: -0.15})}} expr={waving ? 'happy' : 'grin'} frame={f} scale={0.95} />
    </OldCar>
    <DustTrail pos={(fb) => { const zz = 210 + fb * v; return [roadX(zz) - 0.4, g(roadX(zz), zz), zz - 2.2]; }} frame={f} every={2} life={60} size={1.8} grow={3.4} opacity={0.5} spread={2.2} color="#ecd2a0" />
    {/* runners being passed */}
    {[0, 1, 2].map((i) => { const rz = 214 + i * 5 + f * 0.1; const rx = roadX(rz) + 1.4 + (i % 2) * 0.6; return <Guy key={i} position={[rx, g(rx, rz), rz]} rotation={waving ? -0.6 : 0} look={LOOKS.runners[(i + 2) % 5]} j={runPose(f + i * 11, 0.7)} expr={waving ? 'angry' : 'sad'} sweat={1} frame={f} />; })}
  </Stage>;
};

const FinishShot = ({who = 'lorz', cheer = 1, psy = false, carried = false, place, medalAt, sting}) => {
  const f = useF(sting); const {durationInFrames: d} = useVideoConfig();
  const look = LOOKS[who]; const spd = carried ? 0.07 : 0.12; const x = 5 - f * spd; const z = 12; const xa = 5, xb = 5 - d * spd;
  const pal = psy ? PSY(f * 3) : HEAT;
  const medal = medalAt !== undefined ? clamp01((f - medalAt) / 10) : 0;
  const j = carried ? carriedPose(f) : who === 'carvajal' ? {...runPose(f, 0.4), ...wavePose(f)} : {...runPose(f, 0.2), ...(f > 14 ? {lA: -2.6, rA: -2.6, lAz: 0.4, rAz: 0.4} : {})};
  return <Stage palette={pal} fog={[60, 240]}>
    <CameraRig keys={carried ? [{f: 0, pos: [xa - 6.2, 1.5, 14.6], look: [xa, 1.9, 12], fov: 46}, {f: d, pos: [xb - 4.6, 1.6, 14.2], look: [xb, 2.0, 12], fov: medalAt !== undefined ? 40 : 44}] : [{f: 0, pos: [xa - 4.2, 1.2, 17.4], look: [xa - 0.3, 1.6, 11.8], fov: 46}, {f: d, pos: [xb - 3.2, 1.3, 16.6], look: [xb - 0.2, 1.8, 11.8], fov: 42}]} />
    <Sun p={[-50, 45, -60]} />
    <Stadium frame={f} excite={cheer} tape={!carried && who === 'lorz' ? x > 0.25 : false} />
    <Guy position={[x, carried ? 0.25 : 0.05, z]} rotation={-Math.PI / 2} look={medal > 0 ? {...look} : look} j={j} expr={carried ? 'swirl' : 'happy'} sweat={1} frame={f}>
      {medal > 0 && <group position={[0, 0.25 + (1 - medal) * 1.8, 0.16]}><mesh><torusGeometry args={[0.28, 0.03, 4, 12]} /><meshLambertMaterial color="#2f5db5" /></mesh>
        <mesh position={[0, -0.3, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.04, 12]} /><meshLambertMaterial color="#ffcf3a" emissive="#7a5a00" /></mesh></group>}
    </Guy>
    {carried && [-1, 1].map((s) => <Guy key={s} position={[x, 0.05, z + s * 0.75]} rotation={-Math.PI / 2} look={s > 0 ? LOOKS.trainer : {...LOOKS.official, beard: ''}} j={{...runPose(f, 0.3, 0.6), [s > 0 ? 'lA' : 'rA']: -0.3, [s > 0 ? 'lAz' : 'rAz']: 1.0, lean: 0.1}} expr="angry" sweat={1} frame={f} />)}
    {who === 'lorz' && !carried && <Guy position={[-2.2, 0.05, 14.4]} rotation={-2.2} look={{...LOOKS.official, hat: 'top'}} j={{...idlePose(f), rA: -1.5, rEl: -0.5, lA: -0.3}} holdR={<mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.25, 0.06, 5, 12]} /><meshLambertMaterial color="#3f9a3a" /></mesh>} expr="happy" frame={f} />}
    {psy && <Motes center={[0, 3, 12]} area={[20, 6, 10]} count={40} frame={f} color="#ff7ac8" size={0.6} />}
  </Stage>;
};

const CrowdShot = () => {
  const f = useCurrentFrame();
  const front = Array.from({length: 6}, (_, i) => ({x: -4 + i * 1.6, look: {skin: ['#e9b68e', '#c98a5a', '#f0c8a0', '#a86a40', '#e0a679', '#7a4b2c'][i], hair: '#3a2416', shirt: LOOKS.crowd[i], pants: '#2b2b33', pattern: i % 2 ? 'suit' : 'plain', hat: i % 3 === 0 ? 'boater' : i % 3 === 1 ? 'bowler' : null, beard: i === 2 ? '#5a3a22' : ''}}));
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [3.4, 2.4, -9.0], look: [3.4, 2.6, -17], fov: 52}, {f: 30, pos: [3.4, 2.4, -10.4], look: [3.4, 2.8, -17], fov: 46}]} shake={0.1} shakeFrom={0} shakeLen={12} />
    <Stadium frame={f} excite={0.4} boo={1} crowdFace={0} />
    {front.map((p, i) => <Guy key={i} position={[p.x + 3.4, 0.62, -16.4]} rotation={(i - 2.5) * -0.06} look={p.look} j={i % 2 ? pointPose(f + i * 3) : {...cheerPose(f, i), lA: -0.4}} expr={i % 2 ? 'angry' : 'o'} frame={f} />)}
  </Stage>;
};

const LorzBusted = ({sting}) => {
  const f = useF(sting); const {durationInFrames: d} = useVideoConfig();
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [0.8, 1.9, 17.0], look: [0.3, 1.9, 12], fov: 40}, {f: d, pos: [0.6, 2.0, 16.0], look: [0.3, 2.0, 12], fov: 36}]} drift={0.03} />
    <Stadium frame={f} excite={0.2} boo={1} />
    <Guy position={[0, 0.05, 12]} rotation={0.2} look={{...LOOKS.lorz, hat: 'wreath'}} j={{...idlePose(f), lA: -0.2, rA: -0.6, rEl: -1.2, headX: -0.1}} expr={f > 8 ? 'o' : 'happy'} sweat={1} frame={f} />
    <Guy position={[1.5, 0.05, 11.2]} rotation={-0.9} look={{...LOOKS.official, hat: 'top'}} j={{...pointPose(f, 0.4)}} expr="angry" frame={f} />
  </Stage>;
};

const PhoneShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  return <Stage palette={MODERN} fog={[30, 90]}>
    <CameraRig keys={[{f: 0, pos: [-3.4, 1.5, 3.0], look: [-5, 1.3, -3.8], fov: 50}, {f: d, pos: [-4.2, 1.4, 1.6], look: [-5, 1.4, -3.8], fov: 46}]} />
    <ModernRoom frame={f} stairs={false} />
    <Guy position={[-5, 0.35, -3.9]} rotation={0.15} look={LOOKS.modern} j={{...sitPose(f), ...shakePhonePose(f), lA: -0.5}} holdR={<Phone />} expr="grin" frame={f} />
  </Stage>;
};

const HicksRoad = ({giveAt}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const v = 0.06; const z = 250 + f * v; const x = roadX(z) + 1.2; const give = clamp01((f - giveAt) / 10);
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 5.5, 2.8, z + 6], look: [x - 1.0, 1.5, z], fov: 46}, {f: d, pos: [x + 3.6, 2.1, z + 4.6], look: [x - 1.0, 1.7, z], fov: 44}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 45, z + 70]} center={z + 10} />
    <Guy position={[x, g(x, z), z]} rotation={0} look={LOOKS.hicks} j={{...wobblePose(f, 0.8), ...(give > 0.8 ? {rA: -1.0, rEl: -0.6} : {})}} expr="sad" sweat={1} frame={f} />
    <OldCar position={[x - 2.3, g(x - 2.3, z) + 0.02, z - 0.2]} dist={z} frame={f} bounce={0.5} color="#7a3a8a">
      <Guy position={[-0.35, 1.0, 0.45]} look={{...LOOKS.official, beard: ''}} j={sitPose(f)} frame={f} scale={0.95} />
      <Guy position={[0.4, 1.05, -0.5]} rotation={-1.3 * give} look={LOOKS.trainer} j={{...sitPose(f), rA: -1.5 * give - 0.3, rEl: -0.2, rAz: 0.2}} holdR={give > 0.1 && give < 0.9 ? <PoisonBottle scale={1.3} /> : null} expr="grin" frame={f} scale={0.95} />
    </OldCar>
    <DustTrail pos={(fb) => { const zz = 250 + fb * v; return [roadX(zz) - 1.1, g(roadX(zz), zz), zz - 2.4]; }} frame={f} every={3} life={60} size={1.4} opacity={0.35} />
  </Stage>;
};

const Recipe = ({rat, egg, brandy}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 262, x = roadX(z) + 1.2; const item = (at) => easeOut(clamp01((f - at) / 9));
  const swirl = f > egg;
  return <Stage palette={swirl ? PSY(f * 2) : HEAT} fog={[40, 200]}>
    <CameraRig orbit={{center: [x, 1.8, z], radius: 3.4, height: 0.5, from: 0.5, to: -0.3, start: 0, end: d, lookY: 0.2, fov: 44}} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 50]} center={z + 10} />
    <Guy position={[x, g(x, z), z]} rotation={0} look={LOOKS.hicks} j={{...wobblePose(f, 0.5), ...drinkPose(f, 0.5 + 0.5 * Math.sin(f * 0.15))}} holdR={<PoisonBottle scale={1.4} />} expr={swirl ? 'swirl' : 'o'} sweat={1} frame={f} />
    <group position={[x, g(x, z) + 2.5, z]}>
      {item(rat) > 0 && <group position={[-1.1, 0.4 + Math.sin(f * 0.1) * 0.1, 0.3]} scale={item(rat) * 2.0} rotation={[0, f * 0.05, 0.2]}><group rotation={[Math.PI, 0, 0]}><PoisonBottle /></group></group>}
      {item(egg) > 0 && <mesh position={[1.1, 0.5 + Math.sin(f * 0.1 + 1) * 0.1, 0.3]} scale={[0.32 * item(egg), 0.42 * item(egg), 0.32 * item(egg)]}><icosahedronGeometry args={[1, 1]} /><meshLambertMaterial color="#fbf6e6" flatShading /></mesh>}
      {item(brandy) > 0 && <group position={[0, 1.2 + Math.sin(f * 0.1 + 2) * 0.1, 0.2]} scale={item(brandy) * 1.5} rotation={[0, -f * 0.05, -0.2]}>
        <mesh><cylinderGeometry args={[0.18, 0.2, 0.55, 8]} /><meshLambertMaterial color="#a8552a" flatShading transparent opacity={0.9} /></mesh>
        <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.06, 0.1, 0.25, 8]} /><meshLambertMaterial color="#a8552a" /></mesh></group>}
    </group>
  </Stage>;
};

const LieDown = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 270, x = roadX(z) + 1.2; const sag = clamp01((f - 8) / 22);
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 1.6, 1.0, z + 6.6], look: [x, 1.4, z], fov: 48}, {f: d, pos: [x + 1.0, 0.8, z + 5.4], look: [x, 1.1, z], fov: 46}]} drift={0.08} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 50]} center={z + 10} />
    <Guy position={[x, g(x, z), z]} rotation={0} look={LOOKS.hicks} j={{...wobblePose(f, 1), lean: -0.35 * sag, lK: 0.9 * sag, rK: 0.9 * sag, bob: -0.35 * sag, lAz: 1.1, rAz: 1.1, headX: 0.6}} expr="sleepy" sweat={1} frame={f} />
    {[-1, 1].map((s) => <Guy key={s} position={[x + s * 1.05, g(x, z), z - 0.35]} rotation={-s * 1.2} look={s > 0 ? LOOKS.trainer : {...LOOKS.official, beard: '', hat: 'boater'}} j={{lean: 0.25, lA: -1.3, rA: -1.3, lEl: -0.3, rEl: -0.3, lK: 0.3, rK: 0.3, headX: 0.2, roll: s * 0.1}} expr="angry" frame={f} />)}
  </Stage>;
};

const DiceShot = ({lose}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const fly = clamp01((f - lose) / 24);
  const dice = [[-0.3, 0.2], [0.25, -0.1]];
  return <Stage palette={NOLA} fog={[25, 120]}>
    <CameraRig keys={[{f: 0, pos: [-1.6, 2.6, 5.4], look: [0, 1.3, -0.8], fov: 48}, {f: d, pos: [-0.9, 2.2, 4.0], look: [0, 1.4, -0.9], fov: 44}]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[120, 120]} /><meshLambertMaterial color="#4a3a5a" /></mesh>
    {Array.from({length: 7}, (_, i) => <Building key={i} position={[-15 + i * 5, 0, -9 - (i % 2)]} w={4.6} d={3} h={6 + (i % 3)} floors={3} roof={0.6} color={['#e07a5a', '#f2c94c', '#7ac8b0', '#e8a0c0', '#8a9ae0', '#f4ead2', '#c96a4a'][i]} roofColor="#2a2a3a" lit={0.7} litSeed={i} frame={f} />)}
    {[-6, 6].map((x) => <group key={x}><mesh position={[x, 2.2, -2]}><cylinderGeometry args={[0.08, 0.1, 4.4, 6]} /><meshLambertMaterial color="#1a1a22" /></mesh><Glow position={[x, 4.5, -2]} size={6} color="#ffc060" opacity={0.85} /></group>)}
    <pointLight position={[0, 4, 1]} color="#ffc070" intensity={30} distance={14} decay={1.6} />
    <mesh position={[0, 0.85, 0]}><boxGeometry args={[3.2, 0.12, 1.8]} /><meshLambertMaterial color="#2f7a4a" /></mesh>
    {[[-1.4, -0.7], [1.4, -0.7], [-1.4, 0.7], [1.4, 0.7]].map(([x, z], i) => <mesh key={i} position={[x, 0.4, z]}><boxGeometry args={[0.12, 0.8, 0.12]} /><meshLambertMaterial color="#4a3020" /></mesh>)}
    {dice.map(([x, z], i) => <mesh key={i} position={[x, 1.02, z]} rotation={[f * 0.2 * (f < lose ? 1 : 0), i, 0]}><boxGeometry args={[0.24, 0.24, 0.24]} /><meshLambertMaterial map={diceTex(i ? 4 : 1)} /></mesh>)}
    {Array.from({length: 9}, (_, i) => { const a = i * 0.7; const t = fly; return <mesh key={'c' + i} position={[0.3 + Math.cos(a) * t * 3 + t * 2.5, 1.0 + Math.sin(t * Math.PI) * (1.2 + (i % 3) * 0.4), -0.1 + Math.sin(a) * t * 1.5 + t * 1.5]} rotation={[f * 0.3 + i, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.04, 10]} /><meshLambertMaterial color="#ffcf3a" emissive="#6a4a00" /></mesh>; })}
    <Guy position={[-0.1, 0, -1.4]} rotation={0} look={LOOKS.carvajal} j={f < lose ? {...sitPose(f), rA: -1.4 + Math.sin(f * 0.5) * 0.3, rEl: -0.5} : {...sitPose(f), lA: -2.6, rA: -2.6, lAz: 0.4, rAz: 0.4, headX: -0.3}} expr={f < lose ? 'grin' : 'o'} frame={f} />
    <Guy position={[2.0, 0, 0.1]} rotation={-Math.PI / 2} look={{skin: '#c98a5a', hair: '#1a1210', shirt: '#2b2b33', pants: '#2b2b33', pattern: 'suit', hat: 'top'}} j={{...sitPose(f), rA: f > lose ? -1.5 : -0.6, rEl: -0.4}} expr="grin" frame={f} />
    <mesh position={[-0.1, 0.45, -1.4]}><boxGeometry args={[0.6, 0.08, 0.6]} /><meshLambertMaterial color="#5a3a22" /></mesh>
    <mesh position={[2.0, 0.45, 0.1]}><boxGeometry args={[0.6, 0.08, 0.6]} /><meshLambertMaterial color="#5a3a22" /></mesh>
  </Stage>;
};

const HitchShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 300, x = roadX(z) + 2.6; const cz = z - 18 + f * 0.6;
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 3, 1.3, z + 5.5], look: [x - 1, 1.4, z], fov: 48}, {f: d, pos: [x + 2.2, 1.2, z + 4.6], look: [x - 1, 1.4, z - 1], fov: 46}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 50]} center={z + 10} />
    <Guy position={[x, g(x, z), z]} rotation={-0.4} look={{...LOOKS.carvajal, shorts: false}} j={thumbPose(f)} expr="grin" frame={f} />
    <OldCar position={[roadX(cz) - 0.5, g(roadX(cz), cz), cz]} dist={cz} frame={f} bounce={1} color="#e9a23a" smoke={1} />
  </Stage>;
};

const PantsShot = ({snip}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 320, x = roadX(z) + 1; const cut = f >= snip; const sc = clamp01((f - snip + 8) / 8);
  const run = f > snip + 8; const rz = z + (run ? (f - snip - 8) * 0.1 : 0);
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 2.6, 1.2, z + 4.2], look: [x, 0.9, z], fov: 44}, {f: d, pos: [x + 3.6, 1.6, z + 6.5], look: [x, 1.1, z + 1], fov: 48}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 50]} center={z + 10} />
    <Guy position={[x, g(x, rz), rz]} rotation={0.3} look={{...LOOKS.carvajal, shorts: cut}} j={run ? runPose(f, 0, 1) : {...idlePose(f), lA: -0.2, rA: -0.2, headX: 0.45}} expr={cut ? 'happy' : 'o'} frame={f} />
    {f > snip - 10 && f < snip + 12 && <group position={[x + 0.45, g(x, z) + 0.5, z + 0.2]} scale={1.4} rotation={[0, 0.3, 0]}>
      {[-1, 1].map((s) => <group key={s} rotation={[0, 0, s * (0.5 - 0.5 * sc)]}>
        <mesh position={[0.35, 0, 0]}><boxGeometry args={[0.7, 0.05, 0.08]} /><meshLambertMaterial color="#d8dde6" /></mesh>
        <mesh position={[-0.12, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.035, 5, 10]} /><meshLambertMaterial color={s > 0 ? '#d6302a' : '#2f5db5'} /></mesh></group>)}
    </group>}
    {cut && f < snip + 20 && [0, 1].map((i) => <mesh key={i} position={[x + (i ? 0.13 : -0.13), g(x, z) + 0.12, z + 0.3 + (f - snip) * 0.02]} rotation={[0.3, i, 0]}><boxGeometry args={[0.26, 0.2, 0.28]} /><meshLambertMaterial color="#2d2d38" /></mesh>)}
  </Stage>;
};

const AppleShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 360, x = roadX(z) - 4.4;
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 3.4, 2.2, z + 4.0], look: [x, 1.6, z], fov: 46}, {f: d, pos: [x + 2.7, 2.1, z + 3.2], look: [x, 1.7, z], fov: 44}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 50]} center={z + 10} orchard={z} />
    <Guy position={[x, g(x, z), z]} rotation={0.6} look={LOOKS.carvajal} j={eatPose(f)} holdR={<Apple position={[0, 0.05, 0.12]} scale={0.9} rotten={0.85} bite={1} />} expr="happy" frame={f} />
    <Puffs position={[x + 0.3, g(x, z) + 1.8, z + 0.5]} frame={f} count={7} color="#9be15d" opacity={0.55} height={1.8} size={0.55} wind={[0.4, 0, 0.2]} speed={0.03} />
  </Stage>;
};

const NapShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 366, x = roadX(z) - 3.9;
  return <Stage palette={HEAT} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [x + 5.5, 3.6, z + 5.5], look: [x, 0.6, z], fov: 44}, {f: d, pos: [x + 3.8, 2.4, z + 3.9], look: [x, 0.5, z], fov: 42}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 40, z + 50]} center={z + 10} orchard={360} />
    <Guy position={[x, g(x, z), z]} rotation={1.2} look={LOOKS.carvajal} j={sleepPose(f)} expr="sleepy" frame={f}>
    </Guy>
    {[0, 1, 2].map((i) => <Apple key={i} position={[x + 0.8 + i * 0.3, g(x, z) + 0.2, z + 0.9 - i * 0.2]} scale={0.8} rotten={0.9} bite={i === 0 ? 1 : 0} />)}
  </Stage>;
};

const LaundryShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  return <Stage palette={MODERN} fog={[30, 90]}>
    <CameraRig keys={[{f: 0, pos: [-0.4, 1.9, 6.4], look: [-0.2, 1.2, 0.5], fov: 50}, {f: d, pos: [-0.3, 1.8, 5.4], look: [-0.1, 1.3, 0.5], fov: 48}]} />
    <ModernRoom frame={f} stairs={false} laundry />
    <Guy position={[0.55, 0, 0.5]} rotation={-0.2} look={LOOKS.modern} j={{...drinkPose(f, 0.6 + 0.4 * Math.sin(f * 0.2)), lean: -0.1, lA: 0.1, lAz: 0.3, headX: -0.35}} holdR={<group><mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.13, 0.11, 0.4, 10]} /><meshLambertMaterial color="#1a1a22" /></mesh><mesh position={[0, -0.28, 0]}><cylinderGeometry args={[0.14, 0.14, 0.08, 10]} /><meshLambertMaterial color="#ff4a8a" /></mesh></group>} expr="sleepy" frame={f} />
  </Stage>;
};

const AftermathShot = () => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const z = 420; const fallen = useMemoFallen();
  return <Stage palette={DUSTY} fog={[40, 200]}>
    <CameraRig keys={[{f: 0, pos: [roadX(z) + 16, 26, z - 14], look: [roadX(z), 0, z + 6], fov: 46}, {f: d, pos: [roadX(z) + 10, 18, z - 4], look: [roadX(z), 0, z + 9], fov: 48}]} />
    <Sun p={[-60, 55, -100]} />
    <RoadWorld frame={f} win={[z - 30, z + 70]} center={z + 15} />
    {fallen.map((p, i) => { const zz = z + p.dz, xx = roadX(zz) + p.off; return <Guy key={i} position={[xx, g(xx, zz), zz]} rotation={p.rot} look={LOOKS.runners[i % 5]} j={p.sit ? {...sitPose(f), headX: 0.6, lA: 0.2, rA: 0.2} : {...sleepPose(f), lA: -0.3}} expr={p.sit ? 'sad' : 'dead'} frame={f} />; })}
    {[0, 1].map((i) => { const zz = z + 6 + i * 14 + f * 0.04; const xx = roadX(zz) + 0.4; return <Guy key={'w' + i} position={[xx, g(xx, zz), zz]} look={LOOKS.runners[(i + 3) % 5]} j={wobblePose(f + i * 20, 1)} expr="sleepy" sweat={1} frame={f} />; })}
    <OldCar position={[roadX(z + 26) - 0.8, g(roadX(z + 26), z + 26), z + 26]} rotation={0.2} frame={f} color="#b3261e" smoke={0} />
  </Stage>;
};
const FALLEN = (() => { const r = rng(55); return Array.from({length: 11}, (_, i) => ({dz: i * 3.2 + r() * 2, off: (r() < 0.5 ? -1 : 1) * (1.6 + r() * 1.4), rot: r() * 6.28, sit: r() < 0.4})); })();
const useMemoFallen = () => FALLEN;

const PodiumShot = ({marks}) => {
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  return <Stage palette={HEAT} fog={[50, 220]}>
    <CameraRig keys={[{f: 0, pos: [-0.5, 3.3, 13.2], look: [-0.1, 2.5, 0], fov: 50}, {f: d, pos: [0.5, 3.4, 13.6], look: [0.1, 2.5, 0], fov: 50}]} />
    <Sun p={[-50, 45, -60]} />
    <group position={[0, 0, -4]}><Stadium frame={f} excite={0.9} tape={false} /></group>
    {[[-2.45, 1.2, '#c0c7d2'], [0, 1.9, '#e9c46a'], [2.45, 0.8, '#c98a5a']].map(([x, h, c], i) => <group key={i}><mesh position={[x, h / 2, 0]}><boxGeometry args={[2.35, h, 2.4]} /><meshLambertMaterial color={c} flatShading /></mesh>
      <mesh position={[x, h * 0.55, 1.21]}><planeGeometry args={[1.2, 0.75]} /><meshBasicMaterial map={textTex(['', '1', '4'][i], {w: 128, h: 80, bg: c, fg: '#3a2a1a', size: 66, border: null})} /></mesh></group>)}
    <OldCar position={[-2.45, 1.2, 0.1]} rotation={0.5} frame={f} color="#2a7a4a" scale={0.62}>
      <Guy position={[0.35, 1.05, -0.6]} look={LOOKS.lorz} j={{...sitPose(f), ...wavePose(f)}} expr="happy" frame={f} scale={1.5} />
    </OldCar>
    <Guy position={[0, 1.9, 0.2]} rotation={0} scale={1.35} look={LOOKS.hicks} j={{...wobblePose(f, 0.7), ...drinkPose(f, 0.5 + 0.5 * Math.sin(f * 0.12))}} holdR={<PoisonBottle scale={1.4} />} expr="swirl" sweat={1} frame={f} />
    <Guy position={[3.0, 0.8, 0.3]} rotation={1.57} scale={1.2} look={LOOKS.carvajal} j={sleepPose(f)} expr="sleepy" frame={f} />
    <Apple position={[2.0, 1.0, 1.0]} rotten={0.9} bite={1} />
  </Stage>;
};

// =====================================================================================
// TIMELINE
// =====================================================================================
const T = {
  stairs: 0, crane: tw(0, 'in') - 0.04, dogs: tw(0, 'chased') - 0.05, poison: tw(0, 'and') - 0.04, start: SEG[1].start - 0.05, dust: tw(1, 'cars') - 0.05, garcia: tw(1, 'one') - 0.05,
  well: SEG[2].start - 0.02, sting1: SEG[3].start, science: SEG[4].start, cramp: SEG[5].start - 0.05, car: tw(5, 'rode') - 0.06, wave: tw(5, 'waving'), finish: tw(5, 'then') - 0.05,
  crowd: SEG[6].start - 0.05, busted: SEG[7].start, banned: SEG[8].start, phone: tw(8, 'like') + 0.25, hicks: SEG[9].start - 0.05, give: tw(9, 'strychnine'), recipe: tw(9, 'basically') - 0.05,
  rat: tw(9, 'rat'), egg: tw(9, 'egg'), brandy: tw(9, 'brandy'), liedown: SEG[10].start - 0.05, carried: SEG[11].start - 0.05, gold: tw(11, 'gold') - 0.05, sting3: SEG[12].start,
  dice: SEG[13].start - 0.02, gambled: tw(13, 'gambled'), hitch: tw(13, 'hitchhiked') - 0.05, pants: tw(13, 'ran') - 0.05, cutoff: tw(13, 'cutoff'), apple: SEG[14].start - 0.05, nap: tw(14, 'napped') - 0.05,
  fourth: tw(14, 'still') - 0.05, laundry: SEG[15].start - 0.1, corn1: SEG[16].start - 0.1, corn2: tw(16, 'off') - 0.1, ninth: tw(16, 'but') - 0.08, after: SEG[17].start - 0.05,
  podium: SEG[18].start - 0.05, car2: tw(18, 'car'), poison2: tw(18, 'poison'), nap2: tw(18, 'nap'), comment: tw(18, 'comment'), end: SEG[19].start - 0.05,
};
const END = MARATHON_FRAMES;
const segWords = (i) => W.filter((w) => w[3] === i);

/** Speaker bubble whose words appear as they are spoken (word-timed). */
const SpeakBubble = ({who, seg, color = C.mint, y = 280, side = 'left', base = 0}) => {
  const f0 = useCurrentFrame(); const {fps} = useVideoConfig(); const f = f0 + fr(base); const t = f / fps; const ws = segWords(seg); const t0 = ws[0][1];
  const s = spring({frame: f - fr(t0 - 0.12), fps, config: {damping: 11, stiffness: 220}});
  if (t < t0 - 0.15 || t > SEG[seg].end + 0.9) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: y, left: 80, width: 880, transform: `scale(${0.6 + 0.4 * s}) rotate(${side === 'left' ? -1.5 : 1.5}deg)`, opacity: s, transformOrigin: side === 'left' ? '12% 40%' : '88% 40%'}}>
      <div style={{display: 'flex', justifyContent: side === 'left' ? 'flex-start' : 'flex-end'}}><div style={{fontFamily: 'Lilita One', fontSize: 52, background: C.ink, color, padding: '6px 24px', borderRadius: 14, letterSpacing: 3}}>{who}</div></div>
      <div style={{marginTop: 10, background: '#ffffff', border: `9px solid ${C.ink}`, borderRadius: 32, padding: '18px 28px 22px', fontFamily: 'Lilita One', fontSize: 74, lineHeight: 1.06, color: C.ink, textAlign: 'center', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
        {ws.map((w, i) => { const on = t >= w[1] - 0.04; const cur = on && (i === ws.length - 1 || t < ws[i + 1][1] - 0.04);
          return <span key={i} style={{opacity: on ? 1 : 0.13, color: cur ? '#e0261f' : C.ink, display: 'inline-block', margin: '0 9px', transform: `scale(${cur ? 1.08 : 1})`}}>{w[0].toUpperCase()}</span>; })}
      </div>
    </div>
  </AbsoluteFill>;
};

const S = ({at, to, children, name, ...shot}) => {
  const from = fr(at), dur = Math.max(1, fr(to) - from);
  return <Sequence from={from} durationInFrames={dur} name={name}><Shot dur={dur} {...shot}>{children}</Shot></Sequence>;
};
const L = (a, b, props) => ({at: a, to: b, ...props});
const rel = (t, base) => fr(t) - fr(base);

export const Marathon = () => {
  const chunks = chunkWords(W.filter((w) => SEG[w[3]].type === 'N'));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <UIFonts />
      <S {...L(T.stairs, T.crane)} name="stairs" punch={0.04}><StairsShot /></S>
      <S {...L(T.crane, T.dogs)} name="crane" whip={1}><StadiumCrane /></S>
      <S {...L(T.dogs, T.poison)} name="dogs-teaser" punch={0.06}><DogChase z0={30} teaser /></S>
      <S {...L(T.poison, T.start)} name="poison-teaser" whip={-1}><PoisonTeaser /></S>
      <S {...L(T.start, T.dust)} name="start" whip={1}><StartLine /></S>
      <S {...L(T.dust, T.garcia)} name="dust"><DustRoad z0={40} /></S>
      <S {...L(T.garcia, T.well)} name="garcia" punch={0.05}><GarciaFall /></S>
      <S {...L(T.well, T.science)} name="well" whip={-1} sting={rel(T.sting1, T.well)}><WellShot sting={rel(T.sting1, T.well)} /></S>
      <S {...L(T.science, T.cramp)} name="science"><ScienceShot /></S>
      <S {...L(T.cramp, T.car)} name="cramp" punch={0.05}><CrampShot /></S>
      <S {...L(T.car, T.finish)} name="car" whip={1}><LorzCar waveAt={rel(T.wave, T.car)} /></S>
      <S {...L(T.finish, T.crowd)} name="finish-lorz" whip={-1}><FinishShot who="lorz" cheer={1} /></S>
      <S {...L(T.crowd, T.busted)} name="crowd" punch={0.06}><CrowdShot /></S>
      <S {...L(T.busted, T.phone)} name="busted" sting={0}><LorzBusted sting={2} /></S>
      <S {...L(T.phone, T.hicks)} name="phone" whip={1}><PhoneShot /></S>
      <S {...L(T.hicks, T.recipe)} name="hicks-road" whip={-1}><HicksRoad giveAt={rel(T.give, T.hicks)} /></S>
      <S {...L(T.recipe, T.liedown)} name="recipe" punch={0.04}><Recipe rat={rel(T.rat, T.recipe)} egg={rel(T.egg, T.recipe)} brandy={rel(T.brandy, T.recipe)} /></S>
      <S {...L(T.liedown, T.carried)} name="liedown"><LieDown /></S>
      <S {...L(T.carried, T.gold)} name="carried" whip={1} filter={''}><FinishShot who="hicks" carried psy cheer={1} /></S>
      <S {...L(T.gold, T.dice)} name="gold" punch={0.08} sting={rel(T.sting3, T.gold)}><FinishShot who="hicks" carried psy cheer={1} medalAt={2} sting={rel(T.sting3, T.gold)} /></S>
      <S {...L(T.dice, T.hitch)} name="dice" whip={-1}><DiceShot lose={rel(T.gambled, T.dice) + 6} /></S>
      <S {...L(T.hitch, T.pants)} name="hitch" whip={1}><HitchShot /></S>
      <S {...L(T.pants, T.apple)} name="pants"><PantsShot snip={rel(T.cutoff, T.pants)} /></S>
      <S {...L(T.apple, T.nap)} name="apple" whip={-1}><AppleShot /></S>
      <S {...L(T.nap, T.fourth)} name="nap"><NapShot /></S>
      <S {...L(T.fourth, T.laundry)} name="fourth" whip={1}><FinishShot who="carvajal" cheer={0.9} /></S>
      <S {...L(T.laundry, T.corn1)} name="laundry"><LaundryShot /></S>
      <S {...L(T.corn1, T.corn2)} name="corn-chase" whip={-1}><DogChase z0={470} /></S>
      <S {...L(T.corn2, T.ninth)} name="corn-drone"><DogChase z0={470 + 0.17 * 50} drone /></S>
      <S {...L(T.ninth, T.after)} name="ninth" whip={1}><FinishShot who="len" cheer={0.9} /></S>
      <S {...L(T.after, T.podium)} name="aftermath"><AftermathShot /></S>
      <S {...L(T.podium, T.end)} name="podium" whip={-1}><PodiumShot marks={[0, rel(T.poison2, T.podium), rel(T.nap2, T.podium)]} /></S>
      <S {...L(T.end, END / FPS)} name="end-loop" whip={1}><StairsShot end /></S>
      <Overlays chunks={chunks} />
    </AbsoluteFill>
  );
};

const Seq = ({at, to, children}) => { const a = fr(at); return <Sequence from={a} durationInFrames={Math.max(1, (to !== undefined ? fr(to) : END) - a)}>{children}</Sequence>; };
const Overlays = ({chunks}) => {
  const f = useCurrentFrame();
  const heat = f < fr(T.dice) || (f >= fr(T.hitch) && f < fr(T.laundry)) || (f >= fr(T.corn1) && f < fr(T.end)) ? 1 : 0;
  return <>
    <Grade heat={heat} warm={heat} vignette={0.5} grain={0.05} />
    <Captions chunks={chunks} y={1300} />
    {/* hook title box on frame 0 */}
    <Seq at={0} to={T.crane + 0.3}><TitleBox lines={[{text: 'OLYMPIANS DRANK', size: 92}, {text: 'RAT POISON', size: 128, color: '#e0261f'}]} y={290} out={fr(T.crane) + 8} /></Seq>
    <Seq at={T.crane} to={T.dogs}><Tag text="OLYMPIC MARATHON · 1904" y={250} variant="white" size={50} delay={9} /></Seq>
    <Seq at={T.dogs} to={T.poison}><Tag text="WILD DOGS" y={300} variant="red" size={80} /></Seq>
    <Seq at={T.poison} to={T.start}><Tag text="RAT POISON" y={300} variant="red" size={80} delay={rel(tw(0, 'rat'), T.poison)} /></Seq>
    <Seq at={T.start} to={T.dust}><Tag text="ST. LOUIS · AUG 30, 1904" y={250} variant="white" size={46} /><Tag text="90°F" y={340} variant="gold" size={110} delay={rel(tw(1, 'ninety'), T.start)} rot={4} /></Seq>
    <Seq at={T.garcia} to={T.well}><Tag text="WILLIAM GARCIA" y={290} variant="white" size={56} delay={4} /><Tag text="NEARLY DIED" y={390} variant="red" size={70} delay={rel(tw(1, 'nearly'), T.garcia)} /></Seq>
    <Seq at={T.well} to={T.science}><Tag text="WATER STOPS: 1" y={270} variant="gold" size={74} delay={rel(tw(2, 'one'), T.well)} /><Tag text="ON PURPOSE" y={385} variant="red" size={66} delay={rel(tw(2, 'on'), T.well)} /></Seq>
    <Seq at={T.science} to={T.cramp}><SpeakBubble who="ME:" seg={4} y={260} base={T.science} /></Seq>
    <Seq at={T.cramp} to={T.car}><Tag text="FRED LORZ" y={280} variant="white" size={66} delay={2} /></Seq>
    <Seq at={T.car} to={T.finish}><Tag text="11 MILES BY CAR" y={280} variant="gold" size={70} delay={rel(tw(5, 'eleven'), T.car)} /></Seq>
    <Seq at={T.finish} to={T.crowd}><Tag text="WINNER?!" y={290} variant="gold" size={96} delay={rel(tw(5, 'won'), T.finish)} rot={-5} /></Seq>
    <Seq at={T.crowd} to={T.busted}><SpeakBubble who="THE CROWD:" seg={6} y={250} color={C.gold} side="right" base={T.crowd} /></Seq>
    <Seq at={T.banned} to={T.phone}><Stamp text="BANNED" y={560} /></Seq>
    <Seq at={T.phone} to={T.hicks}><Float text={'STEPS: ' + (1000 + Math.min(f - fr(T.phone), 60) * 657).toLocaleString('en-US')} x={540} y={300} size={64} color={C.gold} /></Seq>
    <Seq at={T.hicks} to={T.recipe}><Tag text="THOMAS HICKS" y={280} variant="white" size={66} delay={2} /><Tag text="STRYCHNINE" y={380} variant="red" size={72} delay={rel(T.give, T.hicks)} /></Seq>
    <Seq at={T.recipe} to={T.liedown}><Tag text="RAT POISON" x={300} y={300} variant="red" size={60} delay={rel(T.rat, T.recipe)} rot={-6} /><Tag text="+ EGG" x={790} y={300} variant="white" size={60} delay={rel(T.egg, T.recipe)} rot={4} /><Tag text="+ BRANDY" x={540} y={420} variant="gold" size={64} delay={rel(T.brandy, T.recipe)} /></Seq>
    <Seq at={T.liedown} to={T.carried}><SpeakBubble who="HICKS:" seg={10} y={260} color={C.pink} base={T.liedown} /></Seq>
    <Seq at={T.carried} to={T.gold}><Tag text="HALLUCINATING" y={290} variant="pink" size={78} delay={2} rot={-3} /></Seq>
    <Seq at={T.gold} to={T.dice}><Tag text="GOLD MEDAL" y={290} variant="gold" size={92} delay={3} /></Seq>
    <Seq at={T.dice} to={T.hitch}><Tag text="FÉLIX CARVAJAL" y={250} variant="white" size={60} delay={2} /><Tag text="NEW ORLEANS" y={350} variant="ink" size={52} delay={8} /><Tag text="$0" y={450} variant="red" size={110} delay={rel(T.gambled, T.dice) + 14} /></Seq>
    <Seq at={T.hitch} to={T.pants}><Tag text="HITCHHIKED" y={290} variant="gold" size={70} delay={2} /></Seq>
    <Seq at={T.pants} to={T.apple}><Tag text="CUT-OFF PANTS" y={290} variant="white" size={70} delay={rel(T.cutoff, T.pants)} /></Seq>
    <Seq at={T.apple} to={T.nap}><Tag text="ROTTEN APPLES" y={290} variant="mint" size={72} delay={3} rot={-4} /></Seq>
    <Seq at={T.nap} to={T.fourth}><Tag text="NAP BREAK" y={290} variant="white" size={70} delay={3} /><ZZZ /></Seq>
    <Seq at={T.fourth} to={T.laundry}><Tag text="STILL 4TH" y={290} variant="gold" size={120} delay={3} rot={-4} /></Seq>
    <Seq at={T.laundry} to={T.corn1}><SpeakBubble who="ME:" seg={15} y={260} base={T.laundry} /></Seq>
    <Seq at={T.corn1} to={T.corn2}><Tag text="LEN TAUNYANE" y={280} variant="white" size={66} delay={3} /></Seq>
    <Seq at={T.corn2} to={T.ninth}><Tag text="1 MILE OFF COURSE" y={290} variant="red" size={70} delay={2} /></Seq>
    <Seq at={T.ninth} to={T.after}><Tag text="STILL 9TH" y={290} variant="gold" size={120} delay={rel(tw(16, 'ninth'), T.ninth)} rot={3} /></Seq>
    <Seq at={T.after} to={T.podium}><Counter from={32} to={14} total={32} delay={rel(tw(17, 'fourteen'), T.after)} dur={18} y={250} /></Seq>
    <Seq at={T.podium} to={T.end}>
      <Tag text="CAR GUY (DQ)" x={345} y={560} variant="gold" size={50} delay={rel(T.car2, T.podium)} rot={-5} />
      <Tag text="POISON GUY" x={540} y={420} variant="red" size={56} delay={rel(T.poison2, T.podium)} />
      <Tag text="NAP GUY" x={830} y={760} variant="mint" size={56} delay={rel(T.nap2, T.podium)} rot={5} />
      <Tag text="COMMENT BELOW" y={260} variant="white" size={72} delay={rel(T.comment, T.podium)} />
    </Seq>
    <Seq at={T.end}><Tag text="IA · @ia.unfolds" y={250} variant="ink" size={44} delay={4} /><SourcesLine /></Seq>
  </>;
};
const ZZZ = () => { const f = useCurrentFrame(); return <>{[0, 1, 2].map((i) => { const c = ((f * 0.025 + i / 3) % 1); return <div key={i} style={{position: 'absolute', left: 520 + c * 160 + i * 20, top: 760 - c * 260, fontFamily: 'Lilita One', fontSize: 70 + c * 50, color: '#ffffff', opacity: Math.sin(Math.PI * c), WebkitTextStroke: '8px #120d0a', paintOrder: 'stroke fill'}}>Z</div>; })}</>; };
const SourcesLine = () => { const f = useCurrentFrame(); return <div style={{position: 'absolute', top: 1420, width: 1080, textAlign: 'center', opacity: clamp01(f / 10), fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, color: '#fff4dc', WebkitTextStroke: '5px #120d0a', paintOrder: 'stroke fill'}}>SOURCES: SMITHSONIAN · OLYMPICS.COM · WIKIPEDIA</div>; };
