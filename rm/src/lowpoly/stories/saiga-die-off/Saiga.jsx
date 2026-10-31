// "200,000 dead in 3 weeks" (Saiga die-off, Kazakhstan, May 2015) - low-poly 3D Short, golden steppe, ANIMATION UPGRADE kit.
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Person, VILLAGER_LOOKS, Birds, Post, OutlineScope, Particles, Burst, Shockwave, GodRays, FogLayer, LightCone,
  Grade, Flash, WhipStreaks, MotionBlur, KineticCard, cueLine, clamp01, mixPalette, PALETTES} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2} from '../common.jsx';
import {Steppe, Grass, Herd, SaigaAnimal, Camp, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const SG_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const C = [0, 3.86, 6.574, 9.3, 14.677, 17.12, 19.856, 23.908, 29.844, 32.3, 35.0, 38.7, 40.599, 45.17, 47.82, 49.92].map(at);
const cl = (f, a, b) => clamp01((f - a) / Math.max(1, b - a));
const DAWN = {top: '#3a5a9a', mid: '#e8a878', hor: '#ffe0a0', fog: '#e8c898', amb: 1.1, hemiSky: '#fff0c8', hemiGround: '#6a6a3a', hemiI: 1.4, sun: '#ffd890', sunI: 2.6, sunPos: [-30, 14, -30], rim: '#ffb870', rimI: 1.4, rimPos: [30, 10, 30], glow: 0.5};
const DUSK = {top: '#2a1a4e', mid: '#9a4a7a', hor: '#ff9a52', fog: '#a86070', amb: 0.9, hemiSky: '#ffa07a', hemiGround: '#3d2a4a', hemiI: 1.2, sun: '#ff9a62', sunI: 2.2, sunPos: [-40, 8, -30], rim: '#c05a9a', rimI: 1.4, rimPos: [40, 12, 30], glow: 0.7};
const pal = (k) => mixPalette(DAWN, DUSK, k);
const Sc = ({k = 0, f, herd = {}, children, fog = true, kites = true}) => <>
  <Steppe /><Grass frame={f} />
  <Herd frame={f} {...herd} />
  <Particles kind="dust" center={[0, 1.5, -2]} area={[30, 3, 24]} count={50} frame={f} color="#ffe8a8" opacity={0.5} />
  <Particles kind="motes" center={[0, 2, 2]} area={[24, 4, 14]} count={30} frame={f} color="#fff2c0" opacity={0.5} />
  {kites && <Birds position={[0, 14, -14]} frame={f} />}
  {fog && <FogLayer y={0.3} size={80} layers={3} thickness={1.2} color="#f0d8a8" opacity={0.1} frame={f} />}
  {children}
  <Post bloom={1.1} threshold={0.55} vignette={0.3} />
</>;
const dur = (i) => (C[i + 1] ?? SG_FRAMES) - C[i];
const kc = (text, from, accent, y = 300, size = 104, hideAt = null, si = 0) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={C[si] / 30} />;
const Team = ({f, pose = 'stand', pos = [-3, 0, 6], rot = 0.5}) => <OutlineScope thickness={0.025}>{[0, 1].map((i) => <Person key={i} position={[pos[0] + i * 1.1, height(pos[0] + i * 1.1, pos[2]), pos[2]]} scale={0.7} rotation={rot + i * 0.4} pose={i ? pose : 'stand'} actT={1} phase={f / 9} {...VILLAGER_LOOKS[i]} />)}</OutlineScope>;

const S = [];
// S1 hook: aerial crane-down over a herd going down in a wave
S[0] = () => { const f = useCurrentFrame(); const d = dur(0);
  return <Stage palette={pal(0)} fog={[40, 150]} overlay={<><Flash at={at(2.0)} y="60%" max={0.5} color="#ffe2a0" />
    <KineticCard lines={[cueLine(W, 'Two hundred thousand', 0, 'thousand'), cueLine(W, 'dropped dead', 1.3, 'dead')]} y={300} size={84} hideAt={3.8} /></>}>
    <ShotCam preset="push" from={[0, 16, 20]} to={[2, 3.2, 12]} look={[[0, 0, -6], [0, 0.8, -4]]} fov0={58} fov1={54} start={0} end={d} ease="inout" drift={0.03} />
    <Sc f={f} herd={{n: 70, area: [34, 26], center: [0, -6], fallAt: at(1.8), fallLen: 70}}><GodRays position={[-6, 12, -10]} dir={[0.3, -1, 0.5]} length={15} count={6} frame={f} /></Sc></Stage>; };
// S2 field team on ridge
S[1] = () => { const f = useCurrentFrame(); const d = dur(1);
  return <Stage palette={pal(0.1)} fog={[40, 150]} overlay={<Pill text="SCIENTISTS WATCHING" y={236} variant="yellow" delay={2} size={40} />}>
    <ShotCam preset="push" from={[0, 1.4, 11]} to={[-1.5, 1.3, 8]} look={[[-2.5, 1.1, 6], [-2.4, 1.1, 6]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 30, area: [30, 12], center: [0, -8], fallAt: 0, fallLen: 60}}><Team f={f} pose="point" /></Sc></Stage>; };
// S3 camp dolly + pill
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return <Stage palette={pal(0.1)} fog={[40, 150]} overlay={<Pill text="KAZAKHSTAN · MAY 2015" y={236} variant="yellow" delay={4} size={40} />}>
    <ShotCam preset="push" from={[10, 2.5, 14]} to={[-2, 2.0, 10]} look={[[-8, 1, 2], [-8, 1, 2]]} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 20, area: [30, 10], center: [8, -10]}}><Camp /></Sc></Stage>; };
// S4 saiga close-up + photo cards
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const t1 = at(11.0) - C[3]; const t2 = at(12.0) - C[3];
  return <Stage palette={pal(0.15)} fog={[30, 120]} overlay={<>
    {f >= t1 && f < t2 + 10 && <PhotoCard src="saiga/IMG7.jpg" credit="Saiga · CC BY-SA" tag="DROOPING NOSES" delay={t1} dur={t2 - t1 + 10} />}
    {f >= t2 + 10 && f < t2 + 60 && <PhotoCard src="saiga/IMG8.jpg" credit="Saiga herd · CC BY-SA" tag="THE GATHERING" delay={t2 + 10} dur={50} />}</>}>
    <ShotCam preset="orbit" target={[0, 0.9, 4]} a0={-0.9} a1={0.7} r0={5} r1={7} h0={0.2} h1={1.0} start={0} end={d} ease="inout" fov0={48} fov1={52} />
    <Sc f={f} herd={{n: 14, area: [14, 8], center: [0, -1], calves: 0.4}}><OutlineScope thickness={0.02}><SaigaAnimal position={[0, height(0, 4), 4]} rotation={0.6} frame={f} /></OutlineScope></Sc></Stage>; };
// S5 mothers stop and sway
S[4] = () => { const f = useCurrentFrame(); const d = dur(4);
  return <Stage palette={pal(0.35)} fog={[30, 120]} overlay={<Pill text="THE MOTHERS STOP" y={236} variant="yellow" delay={2} size={40} />}>
    <ShotCam preset="push" from={[-10, 0.9, 6]} to={[3, 0.9, 5]} look={[[0, 1, 0], [6, 1, 0]]} fov0={52} fov1={50} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 24, area: [22, 6], center: [0, 0], still: true, calves: 0.3}}><FogLayer y={0.2} size={60} layers={3} thickness={1.6} color="#e8c8a0" opacity={0.18} frame={f} /></Sc></Stage>; };
// S6 collapse
S[5] = () => { const f = useCurrentFrame(); const d = dur(5);
  return <Stage palette={pal(0.45)} fog={[30, 120]} overlay={<>{kc('Every sick one', 17.9, 'died', 300, 104, null, 5)}<Flash at={at(18.9)} y="60%" max={0.4} color="#ffd8a0" /></>}>
    <ShotCam preset="push" from={[0, 1.2, 11]} to={[0, 1.6, 7.5]} look={[[0, 0.8, 0], [0, 0.8, 0]]} fov0={58} fov1={44} start={0} end={d} ease="inout" shake={0.2} shakeFrom={at(0.5)} shakeLen={14} />
    <Sc f={f} herd={{n: 26, area: [20, 8], center: [0, 0], fallAt: 10, fallLen: 40, calves: 0.2}}><Burst kind="debris" position={[0, 0.2, 0]} start={14} frame={f} count={30} floorY={0} color="#d8c090" /></Sc></Stage>; };
// S7 calves with still mothers
S[6] = () => { const f = useCurrentFrame(); const d = dur(6);
  return <Stage palette={pal(0.65)} fog={[30, 120]} overlay={<Pill text="THE CALVES KEPT TRYING" y={236} variant="yellow" delay={4} size={38} />}>
    <ShotCam preset="push" from={[2, 1.0, 6]} to={[7, 4, 14]} look={[[0, 0.5, 0], [0, 0.6, -1]]} fov0={46} fov1={54} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 12, area: [14, 6], center: [0, 0], fallAt: -100, calves: 0.2}}>{[0, 1, 2].map((i) => <SaigaAnimal key={i} position={[-2 + i * 2.2, height(-2 + i * 2.2, 3), 3]} rotation={1.2} scale={1} fallT={frameFall(f, i)} frame={f} seed={i} calf calfDummy />)}</Sc></Stage>; };
const frameFall = (f, i) => clamp01((f - 30 - i * 12) / 20);
// S8 hundreds of km: whip to map card
S[7] = () => { const f = useCurrentFrame(); const d = dur(7);
  return <Stage palette={pal(0.75)} fog={[30, 120]} overlay={<>
    <Pill text="HUNDREDS OF KM APART" y={236} variant="red" delay={at(26.2) - C[7]} size={40} />
    <MapCard f={f} /></>}>
    <ShotCam preset="push" from={[0, 6, 18]} to={[4, 12, 22]} look={[[0, 0, -4], [0, 0, -4]]} fov0={56} fov1={60} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 40, area: [40, 20], center: [0, -6], fallAt: 0, fallLen: 60}} /></Stage>; };
const MapCard = ({f}) => { const pts = [[300, 760], [560, 640], [780, 900]]; const t0 = 40;
  return <AbsoluteFill style={{pointerEvents: 'none'}}><AbsoluteFill style={{background: 'rgba(15,10,30,0.55)', opacity: cl(f, 30, 45)}} />
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: cl(f, 32, 48)}}><path d="M120 820 L260 640 L520 560 L860 640 L960 840 L820 1040 L520 1080 L260 1020 Z" fill="#e8d8a0" stroke="#141414" strokeWidth="8" opacity="0.9" />
      {pts.map(([x, y], i) => { const k = clamp01((f - t0 - i * 8) / 6); const r = 24 + ((f - t0 - i * 8) % 30) * 2; return k > 0 ? <g key={i}><circle cx={x} cy={y} r={18} fill="#d6302a" /><circle cx={x} cy={y} r={r} fill="none" stroke="#d6302a" strokeWidth="5" opacity={0.7 - (r - 24) / 90} /></g> : null; })}</svg></AbsoluteFill>; };
// S9 switch: separate herds drop in sync
S[8] = () => { const f = useCurrentFrame(); const d = dur(8);
  return <Stage palette={pal(0.8)} fog={[30, 120]} overlay={<Pill text="THE SAME WEEK" y={236} variant="yellow" delay={2} size={40} />}>
    <ShotCam preset="orbit" target={[0, 1, 0]} a0={0.4} a1={-0.6} r0={22} r1={16} h0={4} h1={2} start={0} end={d} ease="inout" fov0={52} fov1={50} />
    <Sc f={f} herd={{n: 50, area: [36, 24], center: [0, 0], fallAt: 10, fallLen: 8}} /></Stage>; };
// S10 vet kneels
S[9] = () => { const f = useCurrentFrame(); const d = dur(9);
  return <Stage palette={pal(0.85)} fog={[30, 120]} overlay={kc('like a switch', 32.0, 'switch', 300, 96, null, 9)}>
    <ShotCam preset="push" from={[-6, 1.8, 9]} to={[-2.5, 1.2, 6]} look={[[0, 0.6, 3], [0, 0.5, 3]]} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 10, area: [10, 5], center: [0, 3], fallAt: -100}}><Team f={f} pose="recoil" pos={[-2, 0, 6]} rot={2.6} /></Sc></Stage>; };
// S11 lab tent: microscope light cone
const Lab = ({f}) => <group position={[0, 0, 0]}><mesh position={[0, 0.5, 0]}><boxGeometry args={[4, 0.1, 1.6]} /><meshLambertMaterial color="#8a7a5a" flatShading /></mesh>
  <mesh position={[0.5, 1.0, 0]}><cylinderGeometry args={[0.12, 0.16, 0.9, 6]} /><meshLambertMaterial color="#222" flatShading /></mesh>
  <LightCone position={[0.5, 2.6, 0]} dir={[0, -1, 0]} length={2.2} radius={0.7} frame={f} color="#f8f0c8" opacity={0.4} /></group>;
const Germs = ({f}) => <group>{Array.from({length: 18}, (_, i) => <mesh key={i} position={[Math.sin(i * 2.1 + f * 0.02) * 1.8, 1.4 + Math.cos(i * 1.7 + f * 0.015) * 0.8, Math.cos(i * 3.1) * 0.8]} rotation={[f * 0.02 + i, i, 0]}><capsuleGeometry args={[0.09, 0.28, 3, 6]} /><meshLambertMaterial color="#6ad060" emissive="#2a7a30" flatShading /></mesh>)}</group>;
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const tk = at(36.0) - C[10];
  return <Stage palette={{...DUSK, hor: '#4a2a5a'}} fog={[10, 60]} overlay={<>{kc('The killer', 35.4, 'killer', 300, 110, null, 10)}<Flash at={tk} y="55%" max={0.6} color="#d8ffd0" /></>}>
    <ShotCam preset="push" from={[1.5, 2.2, 5]} to={[0.5, 1.6, 2.6]} look={[[0.5, 1.2, 0], [0.5, 1.4, 0]]} fov0={52} fov1={42} start={0} end={d} ease="inout" />
    <Steppe /><Lab f={f} /><Germs f={f} /><Burst kind="sparks" position={[0.5, 1.4, 0]} start={tk} frame={f} count={50} color="#a8ff98" floorY={0} /><Shockwave position={[0.5, 1.2, 0]} start={tk} frame={f} radius={5} />
    <Particles kind="motes" center={[0, 1.5, 0]} area={[8, 3, 4]} count={40} frame={f} color="#c8ffb8" opacity={0.6} /><Post bloom={1.4} threshold={0.45} vignette={0.4} /></Stage>; };
// S12 nose inset photo
S[11] = () => { const f = useCurrentFrame(); const d = dur(11);
  return <Stage palette={pal(0.9)} fog={[30, 120]} overlay={<PhotoCard src="saiga/IMG9.jpg" credit="Saiga · CC BY-SA" tag="IN EVERY NOSE" delay={at(39.0) - C[11]} dur={50} />}>
    <ShotCam preset="orbit" target={[0, 0.9, 3]} a0={0.6} a1={-0.5} r0={4} r1={6} h0={0.1} h1={0.8} start={0} end={d} ease="inout" fov0={46} fov1={50} />
    <Sc f={f} herd={{n: 8, area: [8, 4], center: [0, 2]}}><SaigaAnimal position={[0, height(0, 3), 3]} rotation={-0.4} frame={f} still /></Sc></Stage>; };
// S13 case closed
S[12] = () => { const f = useCurrentFrame(); const d = dur(12);
  return <Stage palette={pal(0.95)} fog={[30, 120]} overlay={<>{kc('Case closed', 40.6, 'closed', 300, 96, null, 12)}<Pill text="NOT EVEN CLOSE" y={560} variant="red" delay={at(41.9) - C[12]} size={46} /></>}>
    <ShotCam preset="push" from={[0, 5, 22]} to={[0, 2.5, 12]} look={[[0, 0, -4], [0, 0.5, -4]]} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 50, area: [36, 20], center: [0, -4], fallAt: 10, fallLen: 40}} /></Stage>; };
// S14 two studies: humid heat
S[13] = () => { const f = useCurrentFrame(); const d = dur(13);
  return <Stage palette={{...DUSK, top: '#5a3a3a', mid: '#c88a5a'}} fog={[20, 90]} overlay={<Pill text="STUDY 1: HOT AND HUMID" y={236} variant="yellow" delay={4} size={38} />}>
    <ShotCam preset="push" from={[-8, 2, 10]} to={[2, 1.6, 6]} look={[[0, 1, 0], [0, 1, 0]]} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 30, area: [20, 10], center: [0, 0], fallAt: -100}}><FogLayer y={0.4} size={60} layers={4} thickness={1.8} color="#f0b878" opacity={0.2} frame={f} /></Sc></Stage>; };
// S15 weather station red X
S[14] = () => { const f = useCurrentFrame(); const d = dur(14);
  return <Stage palette={pal(1)} fog={[30, 120]} overlay={<><Pill text="STUDY 2: NO WEATHER LINK" y={236} variant="red" delay={4} size={38} />{f > at(48.4) - C[14] && <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 380, color: '#d6302a', WebkitTextStroke: '10px #141414', paintOrder: 'stroke fill'}}>✕</div>}</>}>
    <ShotCam preset="push" from={[4, 2.5, 10]} to={[0, 2.0, 6]} look={[[0, 1.4, 0], [0, 1.4, 0]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 12, area: [14, 6], center: [-4, -4], fallAt: -100}}><group position={[0, height(0, 0), 0]}><mesh position={[0, 1.2, 0]}><boxGeometry args={[0.1, 2.4, 0.1]} /><meshLambertMaterial color="#ddd" /></mesh>
      {[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1 + f * 0.2) * 0.4, 2.4, Math.sin(i * 2.1 + f * 0.2) * 0.4]}><sphereGeometry args={[0.16, 6, 6]} /><meshLambertMaterial color="#f0f0f0" /></mesh>)}</group></Sc></Stage>; };
// S16 empty steppe at dusk, loop back to opening framing
S[15] = () => { const f = useCurrentFrame(); const d = dur(15);
  return <Stage palette={DUSK} fog={[30, 120]} overlay={<>{kc('flipped the switch', 50.0, 'switch', 280, 84, null, 15)}<Pill text="TELL ME BELOW" y={1130} variant="red" delay={50} size={44} /><EndCard delay={40} sources={['CDC EID', 'SCIENCE NEWS', 'WIKIPEDIA']} /></>}>
    <ShotCam preset="push" from={[0, 1.6, 10]} to={[0, 16, 20]} look={[[0, 0.6, -4], [0, 0, -6]]} fov0={52} fov1={58} start={0} end={d} ease="inout" />
    <Sc f={f} herd={{n: 70, area: [34, 26], center: [0, -6], fallAt: -200, still: true}}><FogLayer y={0.2} size={80} layers={4} thickness={1.6} color="#d8a0a0" opacity={0.15} frame={f} /></Sc></Stage>; };

const IDX = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const FROM = C;
export const Saiga = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {IDX.map((i) => { const Cmp = S[i]; const from = FROM[i]; const to = i === 15 ? SG_FRAMES : FROM[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={4} color="#1a1008" />}</Sequence>; })}
    <Grade look="golden" strength={0.3} /><Finish vignette={0.45} grain={0.06} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
