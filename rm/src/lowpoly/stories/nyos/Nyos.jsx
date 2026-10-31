import * as THREE from 'three';
import {useMemo} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Water, Fountain, PuffCloud, Bubbles,
  Person, Motorcycle, Raft, Rain, RoundHut, Cow, mixPalette, clamp01, easeOut, rng, COLORS,
  FogCloud, Smoke, Birds, Fireflies, Clouds, Ripples, Campfire, Glow, VILLAGER_LOOKS} from '../../kit/index.js';
import {NyosWorld, height, valleyX, WATER_Y, LAKE_R, village} from './world.jsx';
import VO from './vo.json';
import {cows as COWS} from './world.jsx';
const COWZ = Object.fromEntries(COWS.map((c) => [c.k, c.z]));

const FPS = 30;
const LS = VO.line_starts.map((s) => Math.round(s * FPS));
export const NYOS_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(txt)); return w ? Math.round(w[1] * FPS) : 0; };
const NIGHT_TINT = '#6f8cf0';
const JOSEPH = {skin: '#6b4226', shirt: '#8a5be0', pants: '#33384f', hair: '#120c0a', pattern: 'check'};
const Moon = () => <><Orb position={[-50, 55, -90]} radius={4} color="#fbf6dc" /><Glow position={[-50, 55, -89]} size={30} color="#9fc0ff" opacity={0.55} /></>;
// villagers walking along the valley road (alive scenes)
const Walkers = ({f, n = 4, z0 = 30, dir = -1, speed = 0.035, lantern = false}) => <>{Array.from({length: n}, (_, i) => {
  const z = z0 + i * 3.1 + dir * f * speed * (0.8 + (i % 3) * 0.15); const x = valleyX(z) + (i % 2 ? 0.45 : -0.45); const L = VILLAGER_LOOKS[i % VILLAGER_LOOKS.length];
  return <group key={i}><Person position={[x, height(x, z) + 0.2, z]} rotation={dir < 0 ? Math.PI : 0} scale={0.62} pose="walk" phase={f / 4.5 + i * 1.3} {...L} />
    {lantern && i % 2 === 0 && <Glow position={[x + 0.4, height(x, z) + 1.2, z]} size={1.8} color="#ffc04a" opacity={0.8} />}</group>;
})}</>;
const FIRE = (() => { const z = 41; return {x: valleyX(z) + 1.6, z}; })();
const FireCircle = ({f, fall = () => 0, out = 0}) => { const fy = height(FIRE.x, FIRE.z) + 0.15; return <>
  <Campfire position={[FIRE.x, fy, FIRE.z]} frame={f} scale={0.8} out={out} />
  {[0, 1, 2].map((i) => { const a = i * 2.1 + 0.4; const px = FIRE.x + Math.sin(a) * 1.2, pz = FIRE.z + Math.cos(a) * 1.2; const ft = fall(i);
    return <Person key={i} position={[px, height(px, pz) + 0.15, pz]} rotation={a + Math.PI} scale={0.62} pose={ft > 0 ? 'fall' : 'sit'} fallT={ft} phase={f / 8 + i} {...VILLAGER_LOOKS[(i + 2) % 6]} />; })}
</>; };
const rotY = ([x, z], a) => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
const HOUSE = village.find((h) => h.kind === 'house' && h.z > 28) || village[0];
const JHUT = village.filter((h) => h.kind === 'hut').sort((a, b) => b.z - a.z)[0];
const lerpCol = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(t)).getHexString();

// ---------- S1: night opener ----------
const S1 = () => {
  const f = useCurrentFrame();
  return <Stage palette="night" fog={[30, 150]} overlay={<>
    <Pill text="CAMEROON · 1986" y={236} variant="yellow" delay={-20} />
    <Headline y={318} lines={[{text: 'THIS LAKE', color: 'white'}, {text: 'BREATHED OUT.', color: 'yellow', size: 104}]} delay={-20} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [9, 9.5, 58], look: [0, 0.5, 30], fov: 48}, {f: LS[1], pos: [6.5, 9, 55.5], look: [0, 0.8, 27.5], fov: 46}]} />
    <Stars opacity={0.9} /><Moon /><Clouds frame={f} y={30} color="#5a68c8" opacity={0.9} speed={0.05} count={7} />
    <NyosWorld frame={f} lake="#2450a8" tint={NIGHT_TINT} lit={0.8} smoke={1} smokeColor="#8a96d8" spec="#3a4a78" />
    <Walkers f={f} n={3} z0={45} dir={-1} speed={0.025} lantern /><FireCircle f={f} />
    <Fireflies center={[0, 0, 44]} area={[26, 3, 22]} count={70} frame={f} groundFn={height} />
  </Stage>;
};

// ---------- S2: day aerial orbit of the crater ----------
const S2 = () => {
  const f = useCurrentFrame(); const d = LS[2] - LS[1];
  return <Stage palette="day" fog={[60, 200]} overlay={<>
    <Pill text="LAKE NYOS · CAMEROON" y={236} variant="white" delay={2} />
    <Headline y={318} lines={[{text: 'INSIDE AN', color: 'white'}, {text: 'OLD VOLCANO', color: 'green', size: 100}]} delay={5} />
  </>}>
    <CameraRig orbit={{center: [0, 0, 6], radius: 46, height: 30, from: 0.9, to: 0.15, start: 0, end: d, lookY: 0, fov: 46}} />
    <Clouds frame={f} y={26} count={9} speed={0.06} /><Birds center={[0, 16, 2]} radius={14} frame={f} count={8} />
    <NyosWorld frame={f} lake="#1f9be0" lit={0} smoke={0.8} spec="#4a5a6e" />
    <Walkers f={f} n={5} z0={28} dir={1} speed={0.03} />
  </Stage>;
};

// ---------- S3: blueprint cutaway (bespoke) ----------
const profile = (x) => { // ground surface for the cutaway (units: diorama)
  const r = Math.abs(x); if (r < 11) return 2.2 - 8.2 * (1 - (r / 11) ** 2) ** 0.9; return 2.2 + 3.2 * Math.exp(-(((r - 12.5) / 2.2) ** 2)) - (r - 12.5) * 0.08;
};
const shapeFrom = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => s.lineTo(p[0], p[1])); return s; };
const Cutaway = ({f, layer, cap}) => {
  const geos = useMemo(() => {
    const top = []; for (let x = -22; x <= 22; x += 0.5) top.push([x, profile(x)]);
    const earth = shapeFrom([[-22, -40], ...top, [22, -40]]);
    const water = []; for (let x = -10.4; x <= 10.4; x += 0.4) water.push([x, Math.min(2.0, profile(x))]);
    const wTop = shapeFrom([...water.map(([x, y]) => [x, y]).reverse(), ...[[-10.4, 2.0], [10.4, 2.0]].slice(0, 0)]);
    const deep = []; for (let x = -7.2; x <= 7.2; x += 0.4) deep.push([x, profile(x)]);
    const ex = {depth: 7, bevelEnabled: false};
    return {
      earth: new THREE.ExtrudeGeometry(earth, ex),
      water: new THREE.ExtrudeGeometry(shapeFrom([[-10.6, 2.0], ...water, [10.6, 2.0]]), ex),
      deep: new THREE.ExtrudeGeometry(shapeFrom([[-7.4, -2.6], ...deep, [7.4, -2.6]]), {depth: 7.02, bevelEnabled: false}),
    };
  }, []);
  const glow = 0.45 + 0.25 * Math.sin(f * 0.15) * layer;
  return <group position={[0, 0, -3.5]}>
    <mesh geometry={geos.earth}><meshLambertMaterial color="#7b5a3c" flatShading /></mesh>
    {/* strata lines */}
    {[-4, -8, -12].map((y, i) => <mesh key={i} position={[0, y, 7.02]}><planeGeometry args={[44, 0.18]} /><meshBasicMaterial color="#5f4630" /></mesh>)}
    <mesh geometry={geos.water}><meshLambertMaterial color="#3d8fd1" transparent opacity={0.72} flatShading /></mesh>
    <mesh geometry={geos.deep} position={[0, 0, -0.01]}><meshLambertMaterial color={lerpCol('#2a6aa0', '#3fbf9a', layer)} transparent opacity={0.55 + 0.35 * layer} emissive="#2fae7c" emissiveIntensity={glow * layer * 0.6} flatShading /></mesh>
    {/* hot rock below */}
    <mesh position={[0, -12.6, 7.1]} scale={[9, 2.2, 0.4]}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color={lerpCol('#e2502b', '#ff8a3a', 0.5 + 0.5 * Math.sin(f * 0.12))} /></mesh>
    <Glow position={[0, -12.2, 8]} size={22} color="#ff6a2a" opacity={0.45 + 0.1 * Math.sin(f * 0.12)} />
    <mesh position={[-5, -12.0, 7.3]} scale={[3.5, 1.4, 0.4]}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#ff8a3d" /></mesh>
    {/* spring channels + gas bubbles */}
    {[-4.5, 0.5, 4].map((x, i) => <group key={i}>
      <mesh position={[x, -8.6, 7.03]}><planeGeometry args={[0.35, 9.5]} /><meshBasicMaterial color="#d9a05a" /></mesh>
      <Bubbles position={[x, -12.4, 7.2]} height={7.5 + i * 0.6} count={14} frame={f} speed={0.012} size={0.2} color="#eafff5" spread={0.25} seed={i + 3} />
    </group>)}
    {/* fizz trapped in the deep layer */}
    {layer > 0 && <Bubbles position={[0, -5.3, 7.15]} height={2.4} count={Math.round(60 * layer)} frame={f} speed={0.004} size={0.12} spread={11} seed={21} color="#d6fff0" />}
    {/* soda bottle with cap (L3) */}
    {cap > 0 && <group position={[6.4, -15.2 + (1 - cap) * -3, 12]} scale={cap * 1.45} rotation={[0, f * 0.01, Math.sin(f * 0.2) * 0.03]}>
      <mesh position={[0, 2, 0]}><cylinderGeometry args={[1.1, 1.1, 4, 8]} /><meshLambertMaterial color="#3fbf9a" transparent opacity={0.85} flatShading /></mesh>
      <mesh position={[0, 4.7, 0]}><cylinderGeometry args={[0.45, 1.1, 1.4, 8]} /><meshLambertMaterial color="#3fbf9a" transparent opacity={0.85} flatShading /></mesh>
      <mesh position={[0, 5.6, 0]}><cylinderGeometry args={[0.55, 0.55, 0.5, 8]} /><meshLambertMaterial color="#d6302a" flatShading /></mesh>
      <Bubbles position={[0, 0.3, 0]} height={3.6} count={18} frame={f} speed={0.02} size={0.14} spread={1.3} seed={5} />
    </group>}
  </group>;
};
const S3 = () => {
  const f = useCurrentFrame(); const l3 = LS[3] - LS[2];
  const layer = clamp01((f - l3 * 0.15) / 40) ; const cap = clamp01((f - l3 - 6) / 14);
  const capT = easeOut(cap);
  const lbl = (txt, x, y, col, d) => <div style={{position: 'absolute', left: 0, width: '100%', textAlign: 'center', transform: `translateX(${x}px)`, top: y, fontFamily: 'Lilita One', fontSize: 38, color: col, WebkitTextStroke: '7px #0d2340', paintOrder: 'stroke fill', opacity: clamp01((f - d) / 8), letterSpacing: 2}}>{txt}</div>;
  const bg = 'linear-gradient(180deg,#0f3563 0%,#17497f 60%,#1b5590 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 60px)';
  return <Stage palette="blueprint" fog={[80, 300]} background={'repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 64px), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 64px), linear-gradient(180deg,#0f3563,#1b5590)'} overlay={<>
    <Pill text="CUTAWAY · NOT TO SCALE" y={236} variant="white" delay={2} size={34} />
    {f < l3 ? <Headline key="a" y={312} lines={[{text: 'GAS FROM', color: 'white'}, {text: 'DEEP HOT ROCK', color: 'yellow', size: 98}]} delay={4} />
      : <Headline key="b" y={312} lines={[{text: 'LIKE SODA', color: 'white'}, {text: 'WITH THE CAP ON', color: 'green', size: 92}]} />}
    {lbl('LAKE', 0, 585, '#bfe6ff', 10)}
    {lbl('HOT ROCK', 0, 1150, '#ffd0a8', 20)}
    {lbl('SPRINGS', 330, 960, '#ffe08a', 34)}
    {f > l3 * 0.3 && lbl('GAS-RICH WATER', 0, 770, '#9dffe0', l3 * 0.3)}
  </>}>
    <CameraRig keys={[{f: 0, pos: [-3, 7, 47], look: [0, -6.6, 0], fov: 50}, {f: l3, pos: [1.5, 6, 46], look: [0, -6.6, 0], fov: 50}, {f: LS[4] - LS[2], pos: [3.5, 5, 44], look: [0.6, -6.6, 0], fov: 50}]} />
    <Cutaway f={f} layer={layer} cap={capT} />
  </Stage>;
};

// ---------- S4: the night something popped the cap (landslide) ----------
const S4 = () => {
  const f = useCurrentFrame(); const base = LS[4];
  const tLand = wordAt('landslide', 4) - base, tRain = wordAt('cold', 4) - base;
  const rocks = useMemo(() => { const r = rng(9); return Array.from({length: 9}, () => ({a: -2.2 + r() * 0.5, d: r(), s: 0.5 + r() * 0.7})); }, []);
  return <Stage palette="night" fog={[25, 120]} overlay={<>
    <Pill text="21 AUGUST 1986 · NIGHT" y={236} variant="yellow" delay={2} />
    <Headline y={318} lines={[{text: 'SOMETHING', color: 'white'}, {text: 'POPPED THE CAP', color: 'yellow', size: 96}]} delay={4} />
    {f >= tLand && <Pill text="A LANDSLIDE?" y={1060} x="30%" variant="red" delay={tLand} size={44} />}
    {f >= tRain && <Pill text="COLD RAIN?" y={1150} x="68%" variant="white" delay={tRain} size={44} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [20, 22, 34], look: [-2, 1, -3], fov: 46}, {f: LS[5] - base, pos: [15, 18, 27], look: [-3, 1.5, -4], fov: 44}]} />
    <Stars opacity={0.8} /><Moon /><Clouds frame={f} y={24} color="#4a56a8" opacity={0.95} speed={0.08} count={9} seed={8} />
    <NyosWorld frame={f} lake="#2a5cb0" tint={NIGHT_TINT} lit={0.6} wind={2} spec="#3a4a78" />
    {f >= tRain && <Ripples center={[0, WATER_Y, 0]} area={14} count={22} frame={f} period={22} maxR={0.9} opacity={0.6} />}
    {f >= tRain - 4 && <Rain center={[-2, 0, -2]} area={34} height={22} frame={f} opacity={0.5 * clamp01((f - tRain + 4) / 8)} />}
    {rocks.map((q, i) => { // rocks tumble off the far rim into the lake
      const t = clamp01((f - tLand + 4 - q.d * 10) / 26); if (t <= 0) return null;
      const R = 13 - t * 6; const x = Math.sin(q.a) * R, z = Math.cos(q.a) * R; const y = Math.max(WATER_Y, height(x, z) + 0.6) ;
      return <mesh key={i} position={[x, t >= 1 ? WATER_Y - 0.3 : y, z]} rotation={[f * 0.2, f * 0.13, 0]} scale={q.s}><dodecahedronGeometry args={[1, 0]} /><meshLambertMaterial color="#6a6258" flatShading /></mesh>;
    })}
    {f > tLand + 22 && <Fountain position={[Math.sin(-1.95) * 7, WATER_Y, Math.cos(-1.95) * 7]} t={clamp01((f - tLand - 22) / 10) * (1 - clamp01((f - tLand - 40) / 20))} height={3} width={1} count={20} frame={f} />}
  </Stage>;
};

// ---------- S5: the lake erupts (bespoke) ----------
const S5 = () => {
  const f = useCurrentFrame(); const d = LS[6] - LS[5];
  const t = easeOut(clamp01(f / 22)); const ring = clamp01(f / 50);
  return <Stage palette="night" fog={[25, 130]} overlay={<>
    <Headline y={300} lines={[{text: 'THE LAKE ERUPTS', color: 'white'}, {text: '≈100 M FOUNTAIN', color: 'yellow', size: 100}]} delay={3} />
    <Finish vignette={0.6} grain={0} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 7, 42], look: [0, 9, 0], fov: 50}, {f: d, pos: [5, 6, 38], look: [0, 10, 0], fov: 52}]} shake={0.6} shakeFrom={0} shakeLen={30} />
    <Stars opacity={0.7} /><Moon />
    <NyosWorld frame={f} lake="#2a5cb0" tint={NIGHT_TINT} lit={0.55} wind={2.5} spec="#4a5a6e" />
    <Glow position={[0, WATER_Y + 12 * t, 2]} size={34 * t + 1} color="#bfe0ff" opacity={0.35} />
    <Ripples center={[0, WATER_Y, 0]} area={12} count={16} frame={f} period={30} maxR={1.6} />
    <mesh position={[0, WATER_Y + 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + clamp01((f - 15) / 50) * 9}><torusGeometry args={[1, 0.1, 4, 24]} /><meshBasicMaterial color="#cfe8ff" transparent opacity={1 - clamp01((f - 15) / 50)} /></mesh>
    <Birds center={[-4, 12 + f * 0.08, 18]} radius={6} frame={f} count={6} speed={0.03} color="#141830" />
    <Fountain position={[0, WATER_Y, 0]} t={t} height={17} width={2.4} count={140} puff={0.28} frame={f} color="#eef6f8" emissive="#6f8295" />
    <mesh position={[0, WATER_Y + 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + ring * 8}><torusGeometry args={[1, 0.12, 4, 24]} /><meshBasicMaterial color="#dfe9ee" transparent opacity={1 - ring} /></mesh>
  </Stage>;
};

// ---------- S6+S7: the invisible cloud pours down the valley (bespoke) ----------
const cloudPath = (() => { const p = [[0, 0, 0]]; for (let z = 6; z <= 64; z += 4) p.push([valleyX(z), 0, z]); return p; })();
const S6 = () => {
  const f = useCurrentFrame(); const base = LS[6]; const d = LS[8] - base; const l7 = LS[7] - base;
  const prog = clamp01(f / d) * 0.75 + 0.25; const fz = Math.max(4, prog * 64 - 8); const front = prog * 64;
  return <Stage palette="night" fog={[25, 140]} overlay={<>
    {f < l7 ? <Headline key="a" y={300} lines={[{text: 'CARBON DIOXIDE', color: 'white', size: 74}, {text: 'INVISIBLE.', color: 'green', size: 92}, {text: 'HEAVIER THAN AIR.', color: 'yellow', size: 80}]} delay={2} stagger={9} />
      : <Headline key="b" y={300} lines={[{text: 'FASTER THAN', color: 'white'}, {text: 'MOST CAN RUN', color: 'yellow', size: 96}]} />}
    {f >= l7 + 30 && <Pill text="UP TO 25 KM AWAY" y={560} variant="red" delay={l7 + 30} size={44} />}
    <div style={{position: 'absolute', top: 1500, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 28, color: '#cfe0ff', opacity: 0.85, WebkitTextStroke: '5px #0b1020', paintOrder: 'stroke fill'}}>gas shown for clarity · it was invisible</div>
  </>}>
    <CameraRig keys={[{f: 0, pos: [valleyX(fz) - 17, height(valleyX(fz), fz) + 17, fz - 12], look: [valleyX(fz), height(valleyX(fz), fz), fz + 3], fov: 50}]} />
    <Stars opacity={0.8} /><Moon />
    <NyosWorld frame={f} lake="#2a5cb0" tint={NIGHT_TINT} litFn={(k) => { const h = village.find((v) => v.k === k); return h && h.z < front - 2 ? 0 : 0.7; }} cowFall={(k) => clamp01((front - COWZ[k]) / 3)} spec="#3a4a78" />
    <FireCircle f={f} out={clamp01((front - FIRE.z) / 3)} fall={(i) => clamp01((front - FIRE.z - i * 0.6) / 4)} />
    <FogCloud path={cloudPath} progress={prog} count={300} spread={7.5} size={7} color="#d8f5c0" opacity={0.2} groundFn={height} lift={0.2} frame={f} />
    <FogCloud path={cloudPath} progress={prog * 0.985} count={120} spread={5} size={4} color="#f0ffe0" opacity={0.22} groundFn={height} lift={0.1} frame={f + 500} seed={7} layers={1} />
  </Stage>;
};

// ---------- S8: lights go out, in their sleep (bespoke) ----------
const S8 = () => {
  const f = useCurrentFrame(); const d = LS[9] - LS[8];
  const off = (k) => { const t0 = 8 + (k % 13) * 5; return f < t0 - 3 ? 1 : f < t0 ? (Math.sin(f * 2.7 + k) > 0 ? 1 : 0) : 0; };
  return <Stage palette="night" fog={[20, 110]} overlay={<>
    <Headline y={300} lines={[{text: '1,746 PEOPLE DIED', color: 'red', size: 84}, {text: 'MOST IN THEIR SLEEP', color: 'white', size: 74}]} delay={2} stagger={10} />
    <Pill text="+ 3,500 CATTLE" y={540} variant="white" delay={30} size={38} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [HOUSE.x + 9, height(HOUSE.x, HOUSE.z) + 6, HOUSE.z + 12], look: [HOUSE.x, height(HOUSE.x, HOUSE.z) + 0.5, HOUSE.z], fov: 46}, {f: d, pos: [HOUSE.x + 7, height(HOUSE.x, HOUSE.z) + 5, HOUSE.z + 9.5], look: [HOUSE.x, height(HOUSE.x, HOUSE.z) + 0.6, HOUSE.z], fov: 44}]} />
    <Stars opacity={0.8} /><Moon />
    <NyosWorld frame={f} lake="#2a5cb0" tint={NIGHT_TINT} litFn={off} cowFall={(k) => clamp01((f - 24 - k * 6) / 16)} spec="#3a4a78" />
    <FogCloud path={cloudPath} progress={1} count={220} spread={7} size={6} color="#d4f0c4" opacity={0.13} groundFn={height} lift={0.2} frame={f + 300} />
  </Stage>;
};

// ---------- S9: next morning, Joseph Nkwain ----------
const S9 = () => {
  const f = useCurrentFrame(); const d = LS[10] - LS[9];
  const H = JHUT; const hy = height(H.x, H.z); const doorR = 1.4 * H.s * 1.0;
  const step = clamp01((f - 20) / 60);
  const P = rotY([0.1, doorR + 0.35 + step * 1.6], H.rot); const C0 = rotY([3.8, doorR + 12.5], H.rot), C1 = rotY([2.6, doorR + 10], H.rot); const Lk = rotY([0, doorR + 1.2], H.rot);
  return <Stage palette="dawn" fog={[25, 130]} overlay={<>
    <Pill text="SUBUM · NEXT MORNING" y={236} variant="yellow" delay={2} />
    <Headline y={318} lines={[{text: 'ONE SURVIVOR', color: 'white'}, {text: 'JOSEPH NKWAIN', color: 'yellow', size: 92}]} delay={4} />
    {f > wordAt('daughter', 9) - LS[9] && <Pill text="HIS DAUGHTER · HIS NEIGHBOURS" y={560} variant="dark" delay={wordAt('daughter', 9) - LS[9]} size={36} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [H.x + C0[0], hy + 3.8, H.z + C0[1]], look: [H.x + Lk[0], hy + 1.6, H.z + Lk[1]], fov: 42}, {f: d, pos: [H.x + C1[0], hy + 3.2, H.z + C1[1]], look: [H.x + Lk[0], hy + 1.5, H.z + Lk[1]], fov: 40}]} />
    <NyosWorld frame={f} lake="#8a3a2e" tint="#fff0e6" lit={0} cowsLying wind={0.6} />
    <FogCloud path={cloudPath} progress={1} count={120} spread={8} size={7} color="#fff0f0" opacity={0.12} groundFn={height} lift={0.1} frame={f + 900} />
    <Fireflies center={[H.x, hy, H.z]} area={[12, 3, 12]} count={30} frame={f} color="#fff1d0" size={0.35} opacity={0.6} />
    <Person position={[H.x + P[0], hy, H.z + P[1]]} rotation={H.rot + (step >= 1 ? Math.sin(f * 0.05) * 0.5 : 0)} pose={step > 0 && step < 1 ? 'walk' : 'stand'} phase={step > 0 && step < 1 ? f / 5 : f / 8} {...JOSEPH} />
  </Stage>;
};

// ---------- S10: motorcycle through silent Nyos (bespoke) ----------
const S10 = () => {
  const f = useCurrentFrame(); const d = LS[11] - LS[10];
  const z = 52 - (f / d) * 26; const x = valleyX(z); const y = height(x, z);
  const z2 = z - 0.5; const ang = Math.atan2(valleyX(z2) - x, z2 - z);
  return <Stage palette="dawn" fog={[25, 120]} overlay={<>
    <Headline y={300} lines={[{text: '"NO SIGN OF', color: 'white'}, {text: 'ANY LIVING THING"', color: 'yellow', size: 92}]} delay={3} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [x - Math.sin(ang) * 7 - Math.cos(ang) * 1.2, Math.max(y, height(x - Math.sin(ang) * 7, z - Math.cos(ang) * 7)) + 5.2, z - Math.cos(ang) * 7 + Math.sin(ang) * 1.2], look: [x + Math.sin(ang) * 3, y + 1.2, z + Math.cos(ang) * 3], fov: 46}]} />
    <NyosWorld frame={f} lake="#8a3a2e" tint="#fff0e6" lit={0} cowsLying wind={0.6} />
    <Motorcycle position={[x, y + 0.05, z]} rotation={ang} dist={(f / d) * 26} rider={JOSEPH} />
    <Smoke position={[x - Math.sin(ang) * 0.9, y + 0.2, z - Math.cos(ang) * 0.9]} frame={f * 3} count={8} height={1.6} wind={[-Math.sin(ang) * 2.2, 0, -Math.cos(ang) * 2.2]} color="#e0c49a" opacity={0.55} size={1.0} />
  </Stage>;
};

// ---------- S11: blue to red (bespoke) ----------
const S11 = () => {
  const f = useCurrentFrame(); const d = LS[12] - LS[11]; const tRed = wordAt('red', 11) - LS[11];
  const k = clamp01((f - tRed + 18) / 30);
  return <Stage palette="day" fog={[60, 200]} overlay={<>
    <Headline y={300} lines={[{text: 'BLUE', color: '#6cc3ff', size: 110}]} delay={2} />
    {f >= tRed - 8 && <Headline y={420} lines={[{text: 'DEEP RED', color: '#ff5a4e', size: 110}]} delay={tRed - 8} />}
    <Pill text="IRON FROM THE BOTTOM" y={1080} variant="white" delay={tRed + 10} size={38} />
  </>}>
    <CameraRig orbit={{center: [0, 0, 0], radius: 27, height: 13, from: -0.7, to: 0.35, start: 0, end: d, lookY: 0, fov: 46}} />
    <Clouds frame={f} y={24} count={8} speed={0.06} />
    <NyosWorld frame={f} lake={lerpCol('#1f9be0', '#a8261a', k)} lit={0} showVillage={false} spec="#4a5a6e" />
    <Ripples center={[0, WATER_Y, 0]} area={14} count={14} frame={f} period={50} maxR={1.4} color={lerpCol('#e8f6ff', '#ffb0a0', k)} opacity={0.5} />
  </Stage>;
};

// ---------- S12: degassing pipe today ----------
const S12 = () => {
  const f = useCurrentFrame(); const d = LS[13] - LS[12];
  return <Stage palette="day" fog={[60, 200]} overlay={<>
    <Pill text="TODAY · PIPES SINCE 2001" y={236} variant="yellow" delay={2} />
    <Headline y={318} lines={[{text: 'THE SPRINGS', color: 'white'}, {text: 'NEVER STOPPED', color: 'green', size: 98}]} delay={4} />
  </>}>
    <CameraRig orbit={{center: [0, WATER_Y, 0], radius: 12, height: 6, from: -0.5, to: 0.35, start: 0, end: d, lookY: 4, fov: 56}} />
    <Clouds frame={f} y={22} count={9} speed={0.07} /><Birds center={[0, 13, 0]} radius={9} frame={f} count={6} speed={0.014} />
    <NyosWorld frame={f} lake="#1f9be0" lit={0} spec="#4a5a6e" />
    <Ripples center={[0, WATER_Y, 0]} area={7} count={12} frame={f} period={40} maxR={2.2} />
    <Raft position={[0, WATER_Y, 0]} />
    <mesh position={[0, WATER_Y + 1.5, 0]}><cylinderGeometry args={[0.2, 0.2, 3, 8]} /><meshLambertMaterial color="#e8e8e8" flatShading /></mesh>
    <Fountain position={[0, WATER_Y + 3, 0]} t={1} height={10} width={0.8} count={40} frame={f} color="#f2f7f9" />
  </Stage>;
};

// ---------- S13: still breathing (end) ----------
const S13 = () => {
  const f = useCurrentFrame(); const d = NYOS_FRAMES - LS[13];
  return <Stage palette="night" fog={[30, 150]} overlay={<>
    <Headline y={300} lines={[{text: 'WOULD YOU SLEEP', color: 'white', size: 80}, {text: 'BELOW A LAKE', color: 'white', size: 80}, {text: "THAT'S STILL BREATHING?", color: 'yellow', size: 74}]} delay={3} stagger={8} />
    <EndCard delay={20} sources={['BBC 1986', 'KLING ET AL. PNAS 2005', 'WIKIPEDIA']} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [0, 4, 20], look: [0, 2, 0], fov: 46}, {f: d, pos: [0, 12, 40], look: [0, 1, 8], fov: 48}]} />
    <Stars opacity={0.9} /><Moon /><Clouds frame={f} y={30} color="#5a68c8" opacity={0.9} speed={0.05} count={7} />
    <NyosWorld frame={f} lake="#2450a8" tint={NIGHT_TINT} lit={0.7} spec="#3a4a78" />
    <Ripples center={[2, WATER_Y, -1]} area={8} count={10} frame={f} period={45} maxR={1.0} opacity={0.5} />
    <Fireflies center={[0, 0, 14]} area={[30, 3, 20]} count={50} frame={f} groundFn={height} />
    <Bubbles position={[2, WATER_Y - 0.2, -1]} height={1.2} count={16} frame={f} speed={0.015} size={0.22} spread={8} color="#cfe6ff" opacity={0.8} />
  </Stage>;
};

const SCENES = [[S1, 0, 1], [S2, 1, 2], [S3, 2, 4], [S4, 4, 5], [S5, 5, 6], [S6, 6, 8], [S8, 8, 9], [S9, 9, 10], [S10, 10, 11], [S11, 11, 12], [S12, 12, 13], [S13, 13, null]];

export const Nyos = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FontFaces />
      {SCENES.map(([C, a, b], i) => {
        const from = LS[a]; const to = b === null ? NYOS_FRAMES : LS[b];
        return <Sequence key={i} from={from} durationInFrames={to - from}><C />{i > 0 && <Dip inFrames={6} />}</Sequence>;
      })}
      <Finish vignette={0.5} grain={0.05} />
      <WordCaption words={W} y={1310} />
    </AbsoluteFill>
  );
};
