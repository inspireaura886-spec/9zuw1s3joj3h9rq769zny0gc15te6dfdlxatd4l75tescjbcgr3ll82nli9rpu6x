// "The Buzzer" (UVB-76, Russia, 4625 kHz) - low-poly 3D Short, ANIMATION UPGRADE kit + GitGems Rigged characters.
import {AbsoluteFill, Sequence, useCurrentFrame, Img, staticFile, spring, useVideoConfig} from 'remotion';
import {Stage, ShotCam, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Post, OutlineScope, Person, Particles, Burst, FogLayer, LightCone, Rigged,
  Grade, WhipStreaks, KineticCard, cueLine, clamp01, mixPalette, PALETTES, usePreload} from '../../kit/index.js';
import {PhotoCard, DocCard, Fonts2, Flash as CFlash} from '../common.jsx';
import {Bx, Cy, Snow, Pines, Mast, Rings, Bunker, Receiver, Room, Shaft, Rock, Dog, ChainPost, Bowl, buzz, height} from './world.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const UV_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const CS = [0.0, 2.8, 5.24, 7.32, 9.64, 11.58, 14.3, 16.18, 18.6, 20.64, 23.0, 25.5, 27.48, 29.43, 32.88, 35.18, 37.48, 39.0, 41.46, 44.56, 48.23, 51.38];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? UV_FRAMES) - C[i];
const sec = (i, f) => CS[i] + f / FPS;
const loc = (s, i) => at(s) - C[i];
const kc = (i, text, from, accent, y = 300, size = 100, hideAt = null) => <KineticCard lines={[cueLine(W, text, from, accent)]} y={y} size={size} hideAt={hideAt} offsetSec={CS[i]} />;
const RIG = ['b', 'e', 'h', 'k'].map((c) => `blocky/character-${c}.glb`);

const ROOMP = {top: '#140e08', mid: '#2c1e12', hor: '#6a4624', fog: '#20160c', amb: 1.1, hemiSky: '#ffd0a0', hemiGround: '#4a3a2c', hemiI: 1.5, sun: '#ffdca8', sunI: 1.1, sunPos: [3, 8, 6], rim: '#7a98e8', rimI: 1.4, rimPos: [-6, 3, -6], glow: 1};
const NIGHTP = {top: '#0a1030', mid: '#24366a', hor: '#5a72a8', fog: '#1e2c52', amb: 1.0, hemiSky: '#9ab0f0', hemiGround: '#2a3248', hemiI: 1.7, sun: '#b8c8ff', sunI: 1.9, sunPos: [-10, 30, 10], rim: '#7a98e8', rimI: 1.6, rimPos: [20, 10, -30], glow: 0.8};
const DUSKP = mixPalette('dusk', {...PALETTES.night, hor: '#8a6fb0'}, 0.35);
const BLACK = {skin: '#07070a', shirt: '#0b0b10', pants: '#08080c', hair: '#050507', shoes: '#050507'};

const Q = ({f, items}) => <>{items.map(([x, y, d], i) => { const t = f - d; if (t < 0) return null; const rise = Math.min(t, 60) * 1.2; const s = Math.min(1, t / 6);
  return <div key={i} style={{position: 'absolute', left: x, top: y - rise, fontFamily: 'Lilita One', fontSize: 150, color: '#ffe35a', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', transform: `scale(${s}) rotate(${(i % 2 ? 8 : -8)}deg)`, opacity: t > 50 ? 1 - (t - 50) / 14 : 1}}>?</div>; })}</>;
const Chip = ({f, d, x, y, text, c = '#ffe35a'}) => f < d ? null : <div style={{position: 'absolute', left: x, top: y - Math.min(f - d, 40) * 1.2, transform: `scale(${Math.min(1, (f - d) / 5)}) rotate(${(x % 7) - 3}deg)`, opacity: f - d > 36 ? 1 - (f - d - 36) / 10 : 1, fontFamily: 'Lilita One', fontSize: 66, color: '#141414', background: c, padding: '8px 26px', borderRadius: 34, border: '6px solid #141414'}}>{text}</div>;
const Strip = ({src, credit, delay = 0, top = 1010}) => { const f = useCurrentFrame() - delay; const {fps} = useVideoConfig(); const s = spring({frame: f, fps, config: {damping: 15, stiffness: 160}}); if (f < 0) return null;
  return <div style={{position: 'absolute', left: 90, top, width: 900, background: '#f4efe4', padding: '14px 14px 44px', boxSizing: 'border-box', borderRadius: 8, transform: `translateY(${(1 - s) * 120}px) rotate(${1.5 * s}deg)`, opacity: s, boxShadow: '0 24px 50px rgba(0,0,0,0.6)'}}>
    <Img src={staticFile(src)} style={{width: '100%', height: 280, objectFit: 'cover', borderRadius: 4, display: 'block'}} />
    <div style={{position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#3a3a3a'}}>{credit}</div></div>; };

// ---- shared sets ----
const Ext = ({f, children, rings = null, night = false, dog = false, doorOpen = 0, dogHead = 0, bowl = 0, trees = 70}) => <>
  <Snow /><Pines count={trees} frame={f} sway={0.01} />
  <Mast position={[0, 0, -3]} frame={f} /><Bunker position={[0, 0, 2]} open={doorOpen} frame={f} />
  {dog && <><ChainPost position={[6.0, 0, 6.6]} to={[-1.6, 0.8, 0]} /><Dog position={[4.3, 0, 6.6]} rotation={-1.4} frame={f} head={dogHead} /><Bowl position={[3.2, 0, 7.4]} fill={bowl} frame={f} /></>}
  {rings}{children}
  <FogLayer y={0.5} size={110} layers={3} thickness={1.2} color={night ? '#3a4a6a' : '#6a7a98'} opacity={0.12} frame={f} />
  <Particles kind="snow" center={[0, 5, 2]} area={[34, 12, 30]} count={120} frame={f} />
</>;
/** the hobbyist's shack: desk, receiver, lamp, window to the night, a person on a chair */
const Shack = ({f, mode = 'buzz', amp = 0, needle = 0.625, power = true, who = true, children, lamp = 1}) => { const t = f / FPS; return <>
  <Bx p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#5a4a3a" /><Bx p={[0, 5.3, 0]} s={[12, 0.2, 10]} c="#4a3c2e" /><Bx p={[0, 2.6, -4]} s={[12, 5.2, 0.2]} c="#6a5a48" /><Bx p={[-6, 2.6, 0]} s={[0.2, 5.2, 10]} c="#5e5040" /><Bx p={[6, 2.6, 0]} s={[0.2, 5.2, 10]} c="#5e5040" />
  <group position={[-2.8, 3.0, -3.88]}><Bx s={[2.8, 2.0, 0.1]} c="#2a1c10" /><Bx p={[0, 0, 0.04]} s={[2.6, 1.8, 0.04]} c="#5a78b8" e="#3a5898" ei={0.7} /><Bx p={[0, 0, 0.07]} s={[0.07, 1.8, 0.04]} c="#2a1c10" /><Bx p={[0, 0, 0.07]} s={[2.6, 0.07, 0.04]} c="#2a1c10" /></group>
  <group position={[0, 0, -2]}><Bx p={[0, 0.9, 0]} s={[4.6, 0.14, 1.8]} c="#8a6a44" />{[-2.1, 2.1].map((x) => <Bx key={x} p={[x, 0.45, 0]} s={[0.14, 0.9, 1.6]} c="#6a4a2c" />)}
    <Receiver position={[0.2, 1.72, -0.15]} scale={1.0} frame={f} amp={amp} mode={mode} needle={needle} power={power} />
    <Bx p={[-1.7, 0.99, 0.3]} s={[0.5, 0.04, 0.35]} c="#e8e0c8" r={[0, 0.3, 0]} /><Cy p={[1.7, 1.2, 0.2]} a={[0.04, 0.04, 0.5, 5]} c="#aaa" /><mesh position={[1.7, 1.5, 0.2]} scale={[1.4, 0.9, 1.4]}><sphereGeometry args={[0.2, 8, 6]} /><meshLambertMaterial color="#ffd890" emissive="#ffb050" emissiveIntensity={1.2 * lamp} flatShading /></mesh>
    <pointLight position={[1.7, 2.0, 0.5]} color="#ffc880" intensity={5 * lamp} distance={9} /></group>
  {who && <group position={[-2.9, 0, -1.7]} rotation={[0, Math.PI / 2, 0]}><Bx p={[0, 0.55, 0]} s={[0.8, 0.1, 0.8]} c="#3a2a22" /><Bx p={[0, 1.05, -0.38]} s={[0.8, 0.9, 0.1]} c="#3a2a22" />{[-0.3, 0.3].map((x) => [-0.3, 0.3].map((z) => <Cy key={x + '_' + z} p={[x, 0.27, z]} a={[0.04, 0.04, 0.55, 5]} c="#2a2a2a" />))}
    <Rigged path={RIG[0]} time={t} clips={[{name: 'sit', from: 0}]} position={[0, 0.5, 0.05]} rotation={[0, 0, 0]} scale={0.55} /></group>}
  <pointLight position={[0, 4.6, 1]} color="#ffe0b0" intensity={4} distance={12} />{children}</>; };

const S = [];
// 0 HOOK: the receiver buzzes in the dark room; rings pulse out
S[0] = () => { const f = useCurrentFrame(); const d = dur(0); const t = f / FPS;
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<><CFlash at={[at(1.78)]} k={0.4} color="#bfffe0" />
    <KineticCard lines={[cueLine(W, 'A radio station', 0, 'radio'), cueLine(W, 'twenty-five times', 1.6, 'twenty-five')]} y={290} size={80} hideAt={2.7} /></>}>
    <ShotCam preset="push" from={[2.0, 2.9, 5.6]} to={[0.5, 2.0, 2.0]} look={[[0, 1.6, -2.5], [0.3, 1.75, -2.5]]} fov0={54} fov1={44} start={0} end={d} ease="inout" drift={0.02} />
    <Room frame={f} amp={buzz(t, 0.9, 0.4)} mode="buzz" />
    <Rings position={[0.3, 1.75, -1.9]} t0={0.1} frame={f} n={2} gap={0.9} life={1.1} rMax={4} vertical />
    <Rings position={[0.3, 1.75, -1.9]} t0={1.9} frame={f} n={2} gap={0.5} life={1.0} rMax={4} vertical />
    <Particles kind="dust" center={[0, 2.5, -1]} area={[10, 4, 8]} count={36} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.3} threshold={0.4} vignette={0.3} /></Stage>; };
// 1 day and night: sun and moon sweep around the mast, rings pulse
S[1] = () => { const f = useCurrentFrame(); const d = dur(1); const u = clamp01(f / d); const a = u * Math.PI * 2.0 + 0.3;
  return <Stage palette={mixPalette('dusk', PALETTES.night, 0.2 + 0.7 * Math.abs(Math.sin(u * Math.PI * 2)))} fog={[40, 150]} overlay={<Pill text="DAY AND NIGHT" y={236} variant="yellow" delay={loc(3.8, 1)} size={44} />}>
    <ShotCam preset="orbit" target={[0, 9, -3]} a0={0.3} a1={1.5} r0={30} r1={22} h0={4} h1={9} start={0} end={d} ease="inout" fov0={52} fov1={48} />
    <Ext f={f} rings={[0.2, 1.0, 1.8].map((t0, i) => <Rings key={i} position={[0, 22, -3]} t0={t0} frame={f} n={2} gap={0.4} life={1.1} rMax={34} />)}>
      <mesh position={[Math.cos(a) * 46, 8 + Math.sin(a) * 36, -40]}><sphereGeometry args={[3, 10, 8]} /><meshBasicMaterial color={Math.sin(a) > 0 ? '#ffd870' : '#e8f0ff'} /></mesh>
    </Ext><Post bloom={1.1} threshold={0.5} vignette={0.3} /></Stage>; };
// 2 since 1982: low camera at the mast foot, snow piling
S[2] = () => { const f = useCurrentFrame(); const d = dur(2);
  return <Stage palette={DUSKP} fog={[24, 110]} overlay={<>{kc(2, 'since at least 1982.', 4.8, '1982.', 300, 86)}<Pill text="RUST. SNOW. STILL BUZZING." y={236} variant="dark" delay={loc(5.6, 2)} size={36} /></>}>
    <ShotCam preset="crane" target={[0, 6, -3]} h0={0.6} h1={14} r0={9} r1={13} angle={0.5} lookY0={7} lookY1={13} fov0={56} fov1={50} start={0} end={d} ease="inout" />
    <Ext f={f} rings={<Rings position={[0, 22, -3]} t0={0.3} frame={f} n={3} gap={0.6} life={1.4} rMax={30} />} /><Post bloom={1.0} threshold={0.55} vignette={0.35} /></Stage>; };
// 3 nobody will say who runs it: shut bunker + question marks + the 1984 aerial
S[3] = () => { const f = useCurrentFrame(); const d = dur(3); const p1 = loc(8.0, 3);
  return <Stage palette={DUSKP} fog={[24, 110]} overlay={<><Q f={f} items={[[170, 640, 6], [780, 580, 20], [470, 520, 34]]} />{f >= p1 && <PhotoCard src="uvb76/IMG1.jpg" credit="Povarovo transmitter site · 1984 aerial photo · public domain" tag="THE SITE" delay={p1} dur={d - p1} />}</>}>
    <ShotCam preset="push" from={[-7, 2.6, 13]} to={[-2.5, 2.0, 9.5]} look={[[0, 1.8, 3], [0, 1.6, 3]]} fov0={52} fov1={44} start={0} end={d} ease="inout" />
    <Ext f={f} /><Post bloom={1.0} threshold={0.55} vignette={0.35} /></Stage>; };
// 4 hobbyists call it the Buzzer
S[4] = () => { const f = useCurrentFrame(); const d = dur(4); const t = sec(4, f);
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<>{kc(4, 'the Buzzer.', 10.4, 'Buzzer.', 300, 110, 11.5)}<Pill text="HOBBYISTS" y={236} variant="yellow" delay={4} size={42} /></>}>
    <ShotCam preset="push" from={[-1.2, 2.5, 8.4]} to={[-0.9, 2.1, 6.6]} look={[[-1.1, 1.3, -1.8], [-1.0, 1.3, -1.8]]} fov0={54} fov1={52} start={0} end={d} ease="inout" drift={0.02} />
    <Shack f={f} mode="buzz" amp={buzz(t, 2.4, 0.55)} /><Particles kind="dust" center={[0, 2.5, -1]} area={[8, 4, 6]} count={30} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.2} threshold={0.45} vignette={0.3} /></Stage>; };
// 5 a flat tone on 4625: needle slides to the number, spectrogram strip
S[5] = () => { const f = useCurrentFrame(); const d = dur(5); const t = sec(5, f); const ne = 0.25 + 0.375 * Math.min(1, Math.max(0, (t - 12.0) / 0.9));
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<>{kc(5, '4625', 12.8, '4625', 290, 150, 14.3)}<Strip src="uvb76/IMG2.png" credit="Spectrogram of the signal · CC BY-SA 3.0 · Wikimedia Commons" delay={loc(13.0, 5)} top={1000} /><CFlash at={[loc(12.9, 5)]} k={0.35} color="#ffe0a0" /></>}>
    <ShotCam preset="push" from={[1.4, 2.4, 3.4]} to={[0.1, 1.9, 1.5]} look={[[0.2, 1.7, -2.1], [0.2, 1.8, -2.1]]} fov0={46} fov1={32} start={0} end={d} ease="inout" />
    <Shack f={f} mode="buzz" amp={0.5} needle={ne} who={false} /><Post bloom={1.3} threshold={0.4} vignette={0.3} /></Stage>; };
// 6 the tone blankets the land: wide with rings
S[6] = () => { const f = useCurrentFrame(); const d = dur(6);
  return <Stage palette={DUSKP} fog={[40, 170]} overlay={<Pill text="ONE FLAT TONE" y={236} variant="red" delay={loc(14.5, 6)} size={44} />}>
    <ShotCam preset="crane" target={[0, 8, -3]} h0={3} h1={20} r0={26} r1={42} angle={-0.7} lookY0={9} lookY1={6} fov0={54} fov1={50} start={0} end={d} ease="inout" />
    <Ext f={f} rings={[0, 0.6, 1.2].map((t0, i) => <Rings key={i} position={[0, 22, -3]} t0={t0} frame={f} n={3} gap={0.45} life={1.6} rMax={50} color="#8affc0" />)} /><Post bloom={1.2} threshold={0.5} vignette={0.3} /></Stage>; };
// 7 a man's voice cuts in
S[7] = () => { const f = useCurrentFrame(); const d = dur(7); const t = sec(7, f); const v = t >= 17.4;
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<><Pill text="A MAN'S VOICE" y={236} variant="red" delay={loc(17.2, 7)} size={46} /><CFlash at={[loc(17.4, 7)]} k={0.5} color="#ffe0a0" /></>}>
    <ShotCam preset="orbit" target={[0.2, 1.7, -2.1]} a0={0.7} a1={-0.3} r0={6.6} r1={5.0} h0={3.0} h1={2.4} fov0={50} fov1={44} start={0} end={d} ease="inout" />
    <Shack f={f} mode={v ? 'voice' : 'buzz'} amp={v ? 0.9 : buzz(t, 0.9, 0.35)} who={false} />
    {v && <Rings position={[0.5, 1.9, -1.4]} t0={0.6} frame={f} n={3} gap={0.25} life={0.9} rMax={4} color="#ffd24a" vertical />}<Post bloom={1.3} threshold={0.4} vignette={0.3} /></Stage>; };
// 8 reading names and numbers: chips float out of the speaker
S[8] = () => { const f = useCurrentFrame(); const d = dur(8); const t = sec(8, f);
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<><Chip f={f} d={loc(18.7, 8)} x={120} y={900} text="BORIS" /><Chip f={f} d={loc(19.0, 8)} x={640} y={820} text="7 4 3 9" c="#9affc0" /><Chip f={f} d={loc(19.5, 8)} x={180} y={700} text="ZHENYA" /><Chip f={f} d={loc(19.9, 8)} x={600} y={640} text="2 6 0 5" c="#9affc0" />
    <Pill text="NAMES AND NUMBERS" y={236} variant="yellow" delay={loc(18.8, 8)} size={40} /></>}>
    <ShotCam preset="push" from={[-2.8, 2.6, 4.4]} to={[-0.6, 2.2, 1.6]} look={[[0.2, 1.7, -2.1], [0.2, 1.7, -2.1]]} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Shack f={f} mode="voice" amp={0.9} who /><Post bloom={1.2} threshold={0.45} vignette={0.3} /></Stage>; };
// 9 In 2010 it broke: glitch, sparks, red flash
S[9] = () => { const f = useCurrentFrame(); const d = dur(9); const t = sec(9, f); const br = t >= 21.9;
  return <Stage palette={t >= 21.9 ? {...ROOMP, hemiSky: '#ff7a6a', rim: '#ff4a3a'} : ROOMP} fog={[14, 60]} overlay={<>{kc(9, 'In 2010', 20.6, '2010', 300, 120, 22.2)}<CFlash at={[loc(21.9, 9), loc(22.1, 9)]} k={0.6} color="#ff6a50" />{br && <Pill text="IT BROKE" y={236} variant="red" delay={loc(21.9, 9)} size={50} />}</>}>
    <ShotCam preset="push" from={[0, 2.4, 4.2]} to={[0.1, 2.0, 2.0]} look={[[0.2, 1.8, -2.1], [0.2, 1.7, -2.1]]} fov0={46} fov1={38} start={0} end={d} ease="inout" shake={0.2} shakeFrom={loc(21.9, 9)} shakeLen={26} />
    <Shack f={f} mode={br ? 'glitch' : 'buzz'} amp={0.6} who={false} lamp={br ? 0.5 + 0.5 * (Math.sin(f * 1.3) > 0 ? 1 : 0.2) : 1} />
    {br && <Burst kind="sparks" position={[0.2, 2.1, -1.4]} start={loc(21.9, 9)} frame={f} count={28} color="#ffb040" floorY={1.0} />}<Post bloom={1.4} threshold={0.4} vignette={0.35} ca={0.0012} /></Stage>; };
// 10 August 25: silence
S[10] = () => { const f = useCurrentFrame(); const d = dur(10); const t = sec(10, f);
  return <Stage palette={{...ROOMP, amb: 0.9, hemiI: 1.1}} fog={[10, 40]} overlay={<><DocCard lines={['AUG 25, 2010', '10:13 AM', '', 'SILENCE.']} source="WIRED UK, 2011" delay={loc(23.2, 10)} top={700} width={800} size={52} highlight={[3]} />{t >= 24.4 && <Pill text="SILENCE" y={236} variant="red" delay={loc(24.4, 10)} size={46} />}</>}>
    <ShotCam preset="push" from={[2.4, 2.6, 4.6]} to={[0.8, 2.0, 2.4]} look={[[0.2, 1.7, -2.1], [0.2, 1.6, -2.1]]} fov0={50} fov1={42} start={0} end={d} ease="inout" />
    <Shack f={f} mode="dead" amp={0} who={false} lamp={0.35} />
    <Particles kind="dust" center={[0, 2, -1]} area={[8, 3, 6]} count={44} frame={f} color="#ffe0a0" opacity={0.6} speed={0.4} /><Post bloom={0.9} threshold={0.55} vignette={0.45} /></Stage>; };
// 11 REVEAL: knocks on the door of the empty room
S[11] = () => { const f = useCurrentFrame(); const d = dur(11); const k = [loc(25.54, 11), loc(25.98, 11), loc(26.45, 11)];
  const shake = k.reduce((m, a) => (f >= a && f < a + 6 ? Math.max(m, 0.07 * (1 - (f - a) / 6) * (Math.sin((f - a) * 2.5) > 0 ? 1 : -1)) : m), 0);
  return <Stage palette={{...ROOMP, hemiSky: '#a0b8ff'}} fog={[12, 50]} overlay={<><CFlash at={k} k={0.7} color="#fff0d0" />{kc(11, 'Then knocks.', 25.4, 'knocks.', 300, 112, 27.4)}</>}>
    <ShotCam preset="push" from={[-3.5, 1.9, 5.4]} to={[0.5, 1.6, 3.2]} look={[[6.9, 1.3, 1.2], [6.9, 1.3, 1.2]]} fov0={52} fov1={40} start={0} end={d} ease="ramp" shake={0.25} shakeFrom={k[0]} shakeLen={14} />
    <Room frame={f} door={shake} mode="dead" lamp={0.6 + 0.4 * (Math.sin(f * 0.7) > 0.6 ? 0.2 : 1)} />
    <Burst kind="debris" position={[6.7, 2.0, 1.2]} start={k[0]} frame={f} count={26} color="#d8c8a8" floorY={0} /><Post bloom={1.2} threshold={0.45} vignette={0.4} /></Stage>; };
// 12 as if someone stepped into the room: a dark figure walks in
S[12] = () => { const f = useCurrentFrame(); const d = dur(12); const u = clamp01(f / d); const open = Math.min(1.1, f / 8 * 1.1);
  return <Stage palette={{...ROOMP, hemiSky: '#a0b8ff'}} fog={[12, 50]} overlay={<Pill text="SOMEONE ENTERS" y={236} variant="red" delay={loc(27.9, 12)} size={44} />}>
    <ShotCam preset="push" from={[-1.5, 1.7, 5.8]} to={[1.0, 1.9, 4.0]} look={[[5.2, 1.2, 1.2], [3.2, 1.1, 1.2]]} fov0={54} fov1={46} start={0} end={d} ease="inout" />
    <Room frame={f} door={open} mode="dead" lamp={Math.sin(f * 0.9) > 0 ? 0.35 : 0.8} />
    <OutlineScope thickness={0.03}><Person position={[6.6 - u * 3.6, 0, 1.2]} rotation={-1.5} scale={1.05} pose="walk" phase={f / 3.4} {...BLACK} shadow /></OutlineScope>
    <Particles kind="dust" center={[3, 2, 1]} area={[8, 3, 6]} count={40} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.1} threshold={0.5} vignette={0.45} /></Stage>; };
// 13 two weeks later: a voice, a new call sign
S[13] = () => { const f = useCurrentFrame(); const d = dur(13); const t = sec(13, f); const v = t >= 30.6;
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<><Pill text="TWO WEEKS LATER" y={236} variant="yellow" delay={loc(29.5, 13)} size={42} />
    <DocCard lines={['SEPT 7, 2010', 'NEW CALL SIGN:', '"MIKHAIL DMITRI', ' ZHENYA BORIS"']} source="WIRED UK, 2011" delay={loc(30.9, 13)} top={760} width={860} size={46} highlight={[2, 3]} /></>}>
    <ShotCam preset="orbit" target={[0.2, 1.7, -2.1]} a0={-0.1} a1={0.9} r0={8.2} r1={6.4} h0={3.4} h1={2.6} fov0={50} fov1={46} start={0} end={d} ease="inout" />
    <Shack f={f} mode={v ? 'voice' : 'buzz'} amp={v ? 0.9 : buzz(t, 2.4, 0.5)} who /><Post bloom={1.2} threshold={0.45} vignette={0.3} /></Stage>; };
// 14 not the strangest part: pull out to the night mast
S[14] = () => { const f = useCurrentFrame(); const d = dur(14);
  return <Stage palette={NIGHTP} fog={[24, 100]} overlay={<>{kc(14, 'strangest part.', 33.4, 'strangest', 300, 108, 35.1)}<CFlash at={[at(0.5), at(1.3)]} k={0.5} color="#c0d0ff" /></>}>
    <ShotCam preset="push" from={[6, 2.2, 24]} to={[2.5, 3.0, 12]} look={[[0, 11, -3], [0, 12, -3]]} fov0={56} fov1={52} start={0} end={d} ease="inout" />
    <Ext f={f} night /><Post bloom={1.1} threshold={0.5} vignette={0.4} /></Stage>; };
// 15 a writer walks up to the old tower
S[15] = () => { const f = useCurrentFrame(); const d = dur(15); const t = f / FPS; const z = 13 - t * 2.4;
  return <Stage palette={DUSKP} fog={[24, 110]} overlay={<><Pill text="THE OLD TOWER" y={236} variant="yellow" delay={4} size={42} /><Pill text="A WRITER" y={312} variant="dark" delay={loc(36.6, 15)} size={40} /></>}>
    <ShotCam preset="push" from={[-3.5, 1.4, 20]} to={[-2.4, 1.6, 13]} look={[[0, 1.1, 9], [0, 1.2, 6]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Ext f={f}><Rigged path={RIG[1]} time={t} clips={[{name: 'walk', from: 0}]} position={[0, height(0, z), z]} rotation={[0, Math.PI, 0]} scale={0.5} /></Ext><Post bloom={1.0} threshold={0.55} vignette={0.35} /></Stage>; };
// 16 the door is ajar
S[16] = () => { const f = useCurrentFrame(); const d = dur(16); const t = sec(16, f); const open = 0.95 * Math.min(1, Math.max(0, (t - 37.6) / 0.7));
  return <Stage palette={DUSKP} fog={[24, 110]} overlay={<>{kc(16, 'door ajar,', 37.5, 'ajar,', 300, 120, 38.95)}<CFlash at={[loc(37.9, 16)]} k={0.3} color="#ffb060" /></>}>
    <ShotCam preset="push" from={[-4.5, 1.8, 11]} to={[-0.6, 1.5, 7.4]} look={[[0, 1.3, 4.7], [0, 1.2, 4.7]]} fov0={50} fov1={36} start={0} end={d} ease="inout" shake={0.06} shakeFrom={loc(37.6, 16)} shakeLen={20} />
    <Ext f={f} doorOpen={open}><Rigged path={RIG[1]} time={t} clips={[{name: 'idle', from: 0}]} position={[-2.2, height(-2.2, 8), 8]} rotation={[0, Math.PI + 0.5, 0]} scale={0.5} /></Ext><Post bloom={1.1} threshold={0.5} vignette={0.35} /></Stage>; };
// 17 a black hole where the ladder should be
S[17] = () => { const f = useCurrentFrame(); const d = dur(17);
  return <Stage palette={{...ROOMP, top: '#0a0c10', mid: '#1c2026', hor: '#2a2e36', fog: '#0c0e12'}} fog={[10, 40]} overlay={<>{kc(17, 'a black hole', 39.0, 'black', 300, 104, 41.3)}<Pill text="LADDER: MISSING" y={236} variant="red" delay={loc(40.1, 17)} size={42} /></>}>
    <ShotCam preset="push" from={[3.0, 3.4, 3.4]} to={[0.9, 2.2, 1.2]} look={[[0, 0, 0], [0, -1.6, -0.4]]} fov0={52} fov1={46} start={0} end={d} ease="inout" />
    <Shaft frame={f} /><LightCone position={[0, 3.2, 0]} dir={[0, -1, 0]} length={6} radius={1.0} frame={f} color="#ffe8b0" opacity={0.22} />
    <Particles kind="dust" center={[0, 1, 0]} area={[3, 3, 3]} count={36} frame={f} color="#ffe8b0" opacity={0.6} speed={0.5} /><Post bloom={1.0} threshold={0.5} vignette={0.45} /></Stage>; };
// 18 drop a rock in: it falls, one second
S[18] = () => { const f = useCurrentFrame(); const d = dur(18); const t = sec(18, f); const k = Math.max(0, t - 42.5); const ry = k > 0 ? 2.4 - 27 * k * k : 2.6; const hit = loc(43.6, 18);
  return <Stage palette={{...ROOMP, top: '#141a26', mid: '#26303e', hor: '#3a4658', fog: '#18202c', amb: 2.4, hemiI: 3.0, hemiSky: '#9ab0e0'}} fog={[10, 40]} overlay={<><Pill text="DROP A ROCK IN" y={236} variant="yellow" delay={loc(41.6, 18)} size={42} />{t >= 43.1 && <Pill text="ONE SECOND" y={312} variant="red" delay={loc(43.1, 18)} size={50} />}<CFlash at={[hit]} k={0.45} color="#fff0d0" /></>}>
    <ShotCam preset="push" from={[0.4, 3.6, 0.8]} to={[0.1, 2.6, 0.3]} look={[[0, 0, 0], [0, -12, 0]]} fov0={50} fov1={56} start={0} end={d} ease="inout" />
    <Shaft frame={f} depth={36} /><Rock position={[0, ry, 0]} spin={k * 9} scale={0.22} />
    <pointLight position={[0, ry + 0.4, 0]} color="#ffd8a0" intensity={7} distance={8} />
    <Burst kind="sparks" position={[0, -34, 0]} start={hit} frame={f} count={30} color="#ffd8a0" floorY={-36} /><Post bloom={1.1} threshold={0.5} vignette={0.5} /></Stage>; };
// 19 outside, a dog is tied up; someone feeds it
S[19] = () => { const f = useCurrentFrame(); const d = dur(19); const t = sec(19, f); const fed = clamp01((t - 46.9) / 0.5);
  return <Stage palette={DUSKP} fog={[24, 110]} overlay={<>{kc(19, 'a dog was tied up.', 44.9, 'dog', 290, 84, 46.7)}<Pill text="SOMEONE FEEDS IT" y={236} variant="red" delay={loc(46.8, 19)} size={44} /><CFlash at={[loc(47.1, 19)]} k={0.3} color="#ffe0b0" /></>}>
    <ShotCam preset="orbit" target={[4.4, 0.7, 6.8]} a0={0.2} a1={1.3} r0={5.4} r1={4.0} h0={1.6} h1={1.3} fov0={48} fov1={42} start={0} end={d} ease="inout" />
    <Ext f={f} dog dogHead={t >= 47.2 ? 0.9 : 0.0} bowl={fed} trees={50} />
    {fed > 0 && <Burst kind="sparks" position={[3.2, 0.5, 7.4]} start={loc(46.9, 19)} frame={f} count={20} color="#ffd8a0" floorY={0} />}
    <Particles kind="motes" center={[3.2, 0.9, 7.4]} area={[0.8, 1.2, 0.8]} count={10} frame={f} color="#ffffff" opacity={0.5} /><Post bloom={1.0} threshold={0.55} vignette={0.35} /></Stage>; };
// 20 the military never confirmed it
S[20] = () => { const f = useCurrentFrame(); const d = dur(20); const tx = loc(49.9, 20);
  return <Stage palette={DUSKP} fog={[24, 110]} overlay={<><DocCard lines={['RUSSIAN MILITARY', '', 'OWNERSHIP OF', 'THE BUZZER:']} source="PUBLIC RECORD, 2010-2024" delay={loc(48.9, 20)} top={640} width={860} size={50} highlight={[]} />
    {f >= tx && <div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', fontFamily: 'Lilita One', fontSize: 120, color: '#d6302a', WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', transform: `scale(${1 + Math.max(0, 1 - (f - tx) / 6) * 0.5}) rotate(-6deg)`}}>NEVER CONFIRMED</div>}
    <Pill text="NO OFFICIAL ANSWER" y={236} variant="dark" delay={loc(50.6, 20)} size={40} /></>}>
    <ShotCam preset="orbit" target={[0, 1.8, 3]} a0={0.9} a1={-0.1} r0={14} r1={10} h0={3.6} h1={2.4} fov0={52} fov1={48} start={0} end={d} ease="inout" />
    <Ext f={f} /><Post bloom={1.0} threshold={0.55} vignette={0.4} /></Stage>; };
// 21 the question, loops to the opening shot
S[21] = () => { const f = useCurrentFrame(); const d = dur(21); const t = sec(21, f);
  return <Stage palette={ROOMP} fog={[14, 60]} overlay={<><Pill text="WHO IS IN THAT ROOM?" y={236} variant="yellow" delay={loc(51.5, 21)} size={40} /><Pill text="WHO IS IT TALKING TO?" y={312} variant="red" delay={loc(53.0, 21)} size={40} /><Pill text="TELL ME BELOW" y={1130} variant="red" delay={loc(55.4, 21)} size={46} /><EndCard delay={loc(54.0, 21)} sources={['WIKIPEDIA', 'WIRED UK']} /></>}>
    <ShotCam preset="push" from={[0.5, 2.0, 2.0]} to={[2.0, 2.9, 5.6]} look={[[0.3, 1.75, -2.5], [0, 1.6, -2.5]]} fov0={44} fov1={54} start={0} end={d} ease="inout" drift={0.02} />
    <Room frame={f} amp={buzz(t, 2.4, 0.5)} mode="buzz" door={t > 52 ? 0.0 : 0} />
    <Particles kind="dust" center={[0, 2.5, -1]} area={[10, 4, 8]} count={36} frame={f} color="#ffe0a0" opacity={0.5} /><Post bloom={1.3} threshold={0.4} vignette={0.3} /></Stage>; };

export const Uvb = () => {
  const ready = usePreload(RIG);
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? UV_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#06080c" />}</Sequence>; })}
    <Grade look="cold" strength={0.25} /><Finish vignette={0.28} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
