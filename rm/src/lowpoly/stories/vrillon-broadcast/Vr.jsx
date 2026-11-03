import {pal} from '../../../palette.js';
// "The News Went Silent" (Southern TV hijack, 26 Nov 1977) - NOIR look (remotion/src/noir/NoirKit.jsx), 27 scenes on cues.json cuts.
// Facts on screen come from sources.txt only (S1 Wikipedia, S2 The Independent). No invented quotes, no invented body copy.
import {useMemo} from 'react';
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import * as THREE from 'three';
import {ShotCam, WordCaption, FontFaces, Dip, Particles, Post, usePreload, GrabProp, grabPaths} from '../../kit/index.js';
import {softTexture} from '../../kit/Sky.jsx';
import {hash2} from '../../kit/noise.js';
import {NOIR, NoirStage, Silhouette, Blinds, BlindsFloor, HangingBulb, FogWall, NoirFinish, NoirTitle, NoirFonts, NoirRain, LightPool, Streetlamp, CityRow, flicker} from '../../../noir/NoirKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const VR_FRAMES = Math.round(49.6 * FPS);
const W = VO.words;
const CS = [0.0, 2.02, 4.46, 6.41, 8.1, 9.24, 11.3, 13.74, 15.2, 17.42, 19.33, 21.07, 22.97, 24.09, 26.24, 28.14, 30.02, 32.2, 34.18, 36.04, 37.56, 39.18, 40.6, 42.22, 43.34, 45.2, 46.66];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? VR_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const PROPS = ['old-radio'];

const Glow = ({p, s = 1, c = NOIR.cold, o = 0.6}) => <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={softTexture()} color={c} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} /></sprite>;
const Box = ({p, s, c = '#0b0c0f', r = [0, 0, 0], rough = 0.7, metal = 0}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={rough} metalness={metal} /></mesh>;
const Lit = ({p, s, c = '#ffffff', r = [0, 0, 0], o = 1}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><meshBasicMaterial color={c} toneMapped={false} transparent={o < 1} opacity={o} /></mesh>;

// camera helper
const cam = (from, to, look, d, fov = [44, 38], ease = 'inout', drift = 0.03, extra = {}) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={Math.max(2, d - 1)} ease={ease} drift={drift} {...extra} />;

// ---------- 1977 living room shell ----------
const Room = ({back = -1.3, left = -3.2, floor = '#1a1e25', wall = '#262e3a'}) => <>
  <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 16]} /><meshStandardMaterial color={floor} roughness={0.55} metalness={0.2} /></mesh>
  <mesh position={[0, 3, back]}><planeGeometry args={[16, 6]} /><meshStandardMaterial color={wall} roughness={0.95} /></mesh>
  <mesh position={[left, 3, 2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[16, 6]} /><meshStandardMaterial color="#181c23" roughness={0.95} /></mesh>
  {Array.from({length: 9}, (_, i) => <mesh key={i} position={[-4.2 + i * 1.05, 2.6, back + 0.012]}><planeGeometry args={[0.16, 5]} /><meshStandardMaterial color="#222a35" roughness={1} /></mesh>)}
</>;

// ---------- the TV set: local origin = floor under the cabinet. mode news | static | dark | buzz ----------
const Telly = ({position = [0, 0, 0], rotation = 0, s = 1, f = 0, mode = 'news', light = true, tint = '#6f8fc4', seed = 3, glitchAt = 99999}) => {
  const k = flicker(f, seed, 0.12);
  const g = f >= glitchAt && f < glitchAt + 5;
  const m = g ? 'static' : mode;
  const SX = 0.84, SY = 0.62, SC = [0, 0.47 + 0.5, 0.362];
  return <group position={position} rotation={[0, rotation, 0]} scale={s}>
    <Box p={[0, 0.25, 0]} s={[1.3, 0.5, 0.8]} c="#18110c" rough={0.5} />
    <Box p={[0, 0.5 + 0.43, 0]} s={[1.1, 0.86, 0.7]} c="#17120e" rough={0.45} />
    <Box p={[0, 0.5 + 0.47, 0.35]} s={[0.96, 0.74, 0.02]} c="#050505" />
    {[-1, 1].map((q) => <mesh key={q} position={[q * 0.16, 1.46 + 0.2, 0]} rotation={[0, 0, -q * 0.5]}><cylinderGeometry args={[0.007, 0.007, 0.45, 4]} /><meshStandardMaterial color="#aaa" /></mesh>)}
    {m === 'news' && <>
      {f >= glitchAt - 40 && f < glitchAt && <><Lit p={[0, 0.7 + ((f * 0.02) % 0.6), 0.372]} s={[SX, 0.05, 0.002]} c="#9fb8e8" /><Lit p={[0.03, 0.74 + ((f * 0.02) % 0.6), 0.373]} s={[SX, 0.015, 0.002]} c="#e06a6a" /></>}
      <Lit p={SC} s={[SX, SY, 0.004]} c={tint} o={1} />
      <Lit p={[0, 1.2, 0.366]} s={[SX, SY * 0.45, 0.002]} c="#4d6a9c" />
      <Lit p={[0, 0.84, 0.368]} s={[SX * 0.92, 0.07, 0.002]} c="#0c111c" />
      <mesh position={[0, 1.01, 0.372]}><sphereGeometry args={[0.07, 12, 10]} /><meshBasicMaterial color="#0a0b10" toneMapped={false} /></mesh>
      <mesh position={[0, 0.9, 0.372]} scale={[1, 1.1, 0.2]}><sphereGeometry args={[0.14, 12, 10]} /><meshBasicMaterial color="#0a0b10" toneMapped={false} /></mesh>
    </>}
    {m === 'static' && <>
      <Lit p={SC} s={[SX, SY, 0.004]} c="#5a626c" />
      {Array.from({length: 22}, (_, i) => { const v = hash2(Math.floor(f / 2), i, seed); const w = 0.25 + hash2(Math.floor(f / 2), i, 9) * 0.6; const x = (hash2(Math.floor(f / 2), i, 4) - 0.5) * (SX - w);
        return <Lit key={i} p={[x, 0.97 - SY / 2 + (i + 0.5) * SY / 22, 0.368]} s={[w, SY / 22 * 0.98, 0.002]} c={v > 0.5 ? '#aeb6c2' : '#14171b'} />; })}
    </>}
    {m === 'buzz' && <>
      <Lit p={SC} s={[SX, SY, 0.004]} c="#242c38" />
      {Array.from({length: 7}, (_, i) => <Lit key={i} p={[0, 0.97 - SY / 2 + ((i * 0.31 + f * 0.012) % 1) * SY, 0.368]} s={[SX, 0.03 + 0.03 * hash2(i, Math.floor(f / 3), 2), 0.002]} c="#8896ae" />)}
    </>}
    {m === 'dark' && <Lit p={SC} s={[SX, SY, 0.004]} c="#0b0e12" />}
    <Glow p={[0, 0.97, 0.6]} s={2.2 * (m === 'dark' ? 0.2 : 1)} c={m === 'static' || m === 'buzz' ? '#b8c6dc' : '#7f9fe0'} o={(m === 'dark' ? 0.1 : 0.22) * k} />
    {light && m !== 'dark' && <pointLight position={[0, 1, 0.9]} intensity={1.8 * k} distance={6} decay={1.5} color={m === 'news' ? '#9cc0ff' : '#c8d2e4'} />}
  </group>;
};

// the "sound line": flat when silent, jagged when a voice speaks. width in local units, drawn in front of z.
const Wave = ({position = [0, 0, 0], width = 0.8, n = 34, amp = 0, f = 0, color = '#7dffb0', speed = 1, seed = 5, thick = 0.014}) => <group position={position}>
  {Array.from({length: n}, (_, i) => { const x = (i / (n - 1) - 0.5) * width; const env = Math.sin(Math.PI * i / (n - 1));
    const h = Math.max(thick, amp * env * (0.25 + 0.75 * hash2(i, Math.floor(f * speed / 2), seed)) * 0.5);
    return <mesh key={i} position={[x, 0, 0]}><boxGeometry args={[width / n * 1.02, h * 2, 0.006]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>; })}
</group>;

// expanding signal rings (flat, in XZ) around a point
const Pulse = ({position = [0, 0, 0], f = 0, color = '#9cc0ff', max = 8, n = 4, period = 60, vertical = false, o = 0.7, thick = 0.035}) => <group position={position} rotation={[vertical ? 0 : -Math.PI / 2, 0, 0]}>
  {Array.from({length: n}, (_, i) => { const t = ((f / period + i / n) % 1); const r = 0.3 + t * max;
    return <mesh key={i} scale={[r, r, 1]}><ringGeometry args={[1 - thick, 1, 48]} /><meshBasicMaterial color={color} transparent opacity={o * (1 - t) * Math.min(1, t * 6)} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></mesh>; })}
</group>;

// lattice transmitter mast with blinking red lights
const Mast = ({position = [0, 0, 0], h = 18, w = 0.9, f = 0, lights = true, k = 1}) => {
  const levels = 7; const blink = (Math.floor(f / 18) % 2) === 0;
  return <group position={position}>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <mesh key={i} position={[a * w / 2, h / 2, b * w / 2]}><boxGeometry args={[0.07, h, 0.07]} /><meshStandardMaterial color="#0d0f13" metalness={0.5} roughness={0.5} /></mesh>)}
    {Array.from({length: levels}, (_, i) => { const y = (i + 0.5) * h / levels; const ww = w * 1.45;
      return <group key={i} position={[0, y, 0]}><mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[ww, 0.04, 0.04]} /><meshStandardMaterial color="#0d0f13" /></mesh><mesh rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[ww, 0.04, 0.04]} /><meshStandardMaterial color="#0d0f13" /></mesh>
        <mesh rotation={[0, Math.PI / 2, Math.PI / 4]}><boxGeometry args={[ww, 0.04, 0.04]} /><meshStandardMaterial color="#0d0f13" /></mesh></group>; })}
    {lights && [0.5, 1].map((q) => <Glow key={q} p={[0, h * q + 0.1, 0]} s={blink ? 1.6 : 0.2} c={NOIR.red} o={blink ? 1 : 0.15} />)}
  </group>;
};
const Spot = ({position, target, angle = 0.5, intensity = 9, distance = 8, color = '#fff2d2'}) => { const tgt = useMemo(() => new THREE.Object3D(), []); return <><primitive object={tgt} position={target} /><spotLight position={position} target={tgt} angle={angle} penumbra={0.7} intensity={intensity} distance={distance} decay={1.2} color={color} /></>; };
const Ground = ({color = '#06080b', y = 0, size = 120}) => <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[size, size]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>;
const Tree = ({p, h = 3, w = 1.3}) => <group position={p}><mesh position={[0, h / 2, 0]}><coneGeometry args={[w, h, 6]} /><meshStandardMaterial color="#04070a" roughness={1} /></mesh></group>;
const Hill = ({p, s = [30, 5, 12], c = '#050709'}) => <mesh position={p} scale={s}><sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={c} roughness={1} /></mesh>;
const MoonGlow = ({p = [-14, 16, -60], s = 30}) => <><Glow p={p} s={s} c="#9cb4e0" o={0.5} /><mesh position={p}><circleGeometry args={[s * 0.07, 24]} /><meshBasicMaterial color="#dfe8f8" toneMapped={false} fog={false} /></mesh></>;
const RackLights = ({p, cols = 6, rows = 5, f = 0, dieAt = 99999, color = '#ffcf8a', seed = 4, size = 0.1, gap = 0.2}) => <group position={p}>
  {Array.from({length: cols * rows}, (_, i) => { const c = i % cols, r = Math.floor(i / cols);
    const on = hash2(Math.floor(f / 5), i, seed) > 0.45 && !(f > dieAt && hash2(i, 3, seed) * 40 < f - dieAt);
    return <mesh key={i} position={[(c - (cols - 1) / 2) * gap, (r - (rows - 1) / 2) * gap, 0]}><boxGeometry args={[size, size * 0.7, 0.03]} /><meshBasicMaterial color={on ? color : '#1a1c20'} toneMapped={false} /></mesh>; })}
</group>;

// DOM bits
const PhotoCard = ({src, w = 820, h = 600, x = 130, y = 640, rot = -2, f = 0, caption, credit, fromScale = 1.0, toScale = 1.06, d = 60, grade = 'grayscale(0.55) sepia(0.35) contrast(1.15) brightness(0.9)'}) => {
  const t = Math.min(1, f / Math.max(1, d)); const sc = fromScale + (toScale - fromScale) * t;
  const slam = Math.min(1, f / 4);
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${sc * (0.94 + 0.06 * slam)})`, opacity: slam, background: '#e9e4d6', padding: '18px 18px 70px', boxShadow: '0 20px 60px rgba(0,0,0,0.85)'}}>
    <div style={{width: '100%', height: h, overflow: 'hidden', background: '#111'}}><Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: grade}} /></div>
    {caption && <div style={{position: 'absolute', left: 24, bottom: 28, fontFamily: 'Special Elite', fontSize: 30, color: '#1b1612', letterSpacing: 1}}>{caption}</div>}
    {credit && <div style={{position: 'absolute', right: 14, bottom: 6, fontFamily: 'Special Elite', fontSize: 15, color: '#4a443a'}}>{credit}</div>}
  </div>;
};
const Typed = ({lines, x = 120, y = 700, w = 840, size = 44, f = 0, start = 0, cps = 1.4, bg = 'rgba(232,226,210,0.94)', color = '#1b1612', rot = -1.2, head}) => {
  let n = Math.max(0, Math.floor((f - start) * cps * 2)); const out = [];
  lines.forEach((l) => { out.push(l.slice(0, Math.max(0, n))); n -= l.length; });
  return <div style={{position: 'absolute', left: x, top: y, width: w, padding: '34px 40px', background: bg, transform: `rotate(${rot}deg)`, boxShadow: '0 18px 50px rgba(0,0,0,0.85)', opacity: Math.min(1, (f - start + 3) / 4)}}>
    {head && <div style={{fontFamily: 'Special Elite', fontSize: size * 0.62, color: pal().chip, letterSpacing: 3, marginBottom: 16, borderBottom: `2px solid ${pal().chip}`, paddingBottom: 8}}>{head}</div>}
    {out.map((l, i) => <div key={i} style={{fontFamily: 'Special Elite', fontSize: size, color, lineHeight: 1.18, minHeight: size * 1.18}}>{l}</div>)}
  </div>;
};

const Scene = ({bg, title, ty, sub, subAt = 0, seed = 1, density = 0.04, ambient = 0.14, fog, flash = 0, over, children}) => {
  const f = useCurrentFrame();
  return <NoirStage density={density} ambient={ambient} bg={bg} fogColor={fog} overlay={<>
    {title && <NoirTitle y={ty || 240} lines={title} sub={sub} subAt={subAt} />}
    {over && over(f)}
    <NoirFinish seed={seed} />
    {flash > 0 && f < 5 && <AbsoluteFill style={{background: '#fff', opacity: flash * (1 - f / 5)}} />}
  </>}>{children(f)}<Post bloom={1.25} threshold={0.42} vignette={0.5} /></NoirStage>;
};

const S = [];
const POSE0 = {from: [0.9, 1.75, 3.7], to: [0.1, 1.55, 2.3], look: [[0.0, 1.45, 0], [0.0, 1.42, 0]]};
const TVA = {position: [0, 0, 0], s: 1.6};
const LivingRoom = ({f, mode = 'news', glitchAt, tint, light = true, rad = true}) => <>
  <Room /><Telly {...TVA} f={f} mode={mode} glitchAt={glitchAt} tint={tint} light={light} />
  {rad && <GrabProp name="old-radio" position={[-1.45, 0.75, 0.05]} height={0.3} rotation={[0, 0.5, 0]} />}
  <Box p={[2.0, 0.28, -0.4]} s={[0.9, 0.56, 0.9]} c="#15110d" />
  <Box p={[2.0, 0.78, -0.4]} s={[0.04, 0.46, 0.04]} c="#0b0b0b" />
  <mesh position={[2.0, 1.05, -0.4]}><coneGeometry args={[0.35, 0.3, 14, 1, true]} /><meshStandardMaterial color="#2a1c12" side={THREE.DoubleSide} /></mesh>
  <Glow p={[2.0, 1.0, -0.4]} s={1.2} c={NOIR.amber} o={0.35} />
  <Particles kind="dust" count={120} center={[0, 1.6, 0.9]} area={[3.4, 2.6, 2.6]} frame={f} color="#cfe0ff" size={0.012} opacity={0.6} />
</>;

// 0 FRAME 0: the TV, newsreader large, sound line flat; glitch bursts mid-scene
S[0] = () => { const d = dur(0); return <Scene seed={1} bg="radial-gradient(ellipse at 50% 45%, #1a2230 0%, #07090d 70%)" density={0.05} title={[{text: 'NEWS: SILENT.', at: 0, size: 92}, {text: 'VOICE: UNKNOWN.', at: 8, red: true, size: 84}]}>{(f) => <>
  {cam(POSE0.from, POSE0.to, POSE0.look, d, [46, 38], 'out', 0.02)}
  <LivingRoom f={f} glitchAt={44} />
  <Wave position={[0, 1.5, 1.02]} width={0.9} amp={f >= 44 && f < 49 ? 0.22 : 0} f={f} speed={2} thick={0.01} />
</>}</Scene>; };
// 1 alien takes over: screen goes to static, wave jagged, push into the screen
S[1] = () => { const d = dur(1); return <Scene seed={2} bg="radial-gradient(ellipse at 50% 45%, #1a2230 0%, #07090d 70%)" density={0.05} title={[{text: 'THEN:', at: 4, size: 84}, {text: 'A VOICE.', at: loc(2.98, 1), red: true, size: 92}]}>{(f) => <>
  {cam([0.5, 1.6, 4.2], [0.0, 1.5, 2.6], [[0, 1.45, 0], [0, 1.5, 0]], d, [42, 36], 'ramp', 0.03, {shake: 0.05, shakeFrom: 0, shakeLen: 14})}
  <LivingRoom f={f} mode="static" rad={false} />
  <Wave position={[0, 1.5, 1.02]} width={0.95} amp={0.2} f={f} speed={2.5} thick={0.01} />
</>}</Scene>; };
// 2 Southern England, ten past five: viewer from behind, TV light on a face-less silhouette
S[2] = () => { const d = dur(2); return <Scene seed={3} bg="radial-gradient(ellipse at 50% 45%, #1a2230 0%, #07090d 70%)" density={0.05} title={[{text: 'SOUTHERN ENGLAND.', at: 0, size: 70}]} sub="SAT 26 NOV 1977 · 17:10" subAt={14}>{(f) => <>
  {cam([-1.4, 1.4, 4.4], [0.8, 1.45, 4.0], [[0, 1.3, 0], [0, 1.3, 0]], d, [46, 44], 'inout', 0.02)}
  <LivingRoom f={f} mode="news" rad={false} />
  <Box p={[0.2, 0.2, 1.9]} s={[0.9, 0.4, 0.8]} c="#0c0b0b" /><Box p={[0.2, 0.75, 2.25]} s={[0.9, 0.7, 0.14]} c="#0c0b0b" />
  <Silhouette position={[0.2, 0.3, 1.9]} rotation={Math.PI} pose="stand" hat={false} scale={0.75} rim="#9cc0ff" rimK={1.6} rimSide={[0, 0.3, -1]} phase={f * 0.1} />
</>}</Scene>; };
// 3 twenty-sixth of November: rainy 1977 street, houses with TV-blue windows
S[3] = () => { const d = dur(3); return <Scene seed={4} bg="linear-gradient(180deg,#0b1018 0%,#1b2433 100%)" density={0.05} ty={250} title={[{text: '26 NOVEMBER', at: 0, size: 92}, {text: '1977', at: 8, red: true, size: 100}]}>{(f) => <>
  {cam([2.5, 2.4, 9], [0.6, 1.9, 3.4], [[-0.5, 2.4, -10], [-0.3, 2.2, -10]], d, [48, 42], 'out', 0.04)}
  <Ground color="#0a0c10" /><CityRow side={-1} x={-5} zFrom={-40} zTo={6} seed={8} frame={f} color="#9cc0ff" litFrac={0.45} hMin={5} hMax={9} />
  <CityRow side={1} x={5} zFrom={-40} zTo={6} seed={12} frame={f} color={NOIR.amber} litFrac={0.4} hMin={5} hMax={9} />
  <Streetlamp position={[-2.6, 0, -4]} armDir={1} frame={f} seed={2} light /><Streetlamp position={[2.6, 0, -14]} armDir={-1} frame={f} seed={5} />
  <NoirRain center={[0, 0, -8]} area={[12, 10, 24]} count={550} frame={f} /><FogWall position={[0, 3, -30]} width={28} height={8} frame={f} opacity={0.2} />
</>}</Scene>; };
// 4 5:10 on a wall clock
S[4] = () => { const d = dur(4); return <Scene seed={5} bg="radial-gradient(ellipse at 50% 40%, #232a36 0%, #07090d 75%)" density={0.04} title={[{text: '5:10 PM.', at: 0, size: 110}, {text: 'SATURDAY.', at: 10, red: true, size: 84}]}>{(f) => { const sec = Math.floor(f / 3) * 0.02; return <>
  {cam([0.3, 2.3, 6.6], [0.0, 2.35, 4.8], [[0, 2.3, 0], [0, 2.3, 0]], d, [46, 40], 'inout', 0.03)}
  <Box p={[0, 3, -0.3]} s={[14, 6, 0.1]} c="#171c24" />
  <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.95, 0.95, 0.12, 40]} /><meshStandardMaterial color="#0e0f12" metalness={0.4} roughness={0.4} /></mesh>
  <mesh position={[0, 2.3, 0.07]}><circleGeometry args={[0.86, 40]} /><meshStandardMaterial color="#a8a290" roughness={0.8} emissive="#26231a" emissiveIntensity={0.4} /></mesh>
  {Array.from({length: 12}, (_, i) => { const a = i * Math.PI / 6; return <Box key={i} p={[Math.sin(a) * 0.74, 2.3 + Math.cos(a) * 0.74, 0.1]} s={[0.05, i % 3 ? 0.1 : 0.17, 0.02]} c="#15130f" r={[0, 0, -a]} />; })}
  <group position={[0, 2.3, 0.12]}><group rotation={[0, 0, -(5 + 10 / 60) * Math.PI / 6]}><Box p={[0, 0.25, 0]} s={[0.07, 0.5, 0.02]} c="#0b0a08" /></group>
    <group rotation={[0, 0, -(10 / 60) * Math.PI * 2 + 0.0]}><Box p={[0, 0.38, 0.01]} s={[0.045, 0.76, 0.02]} c="#0b0a08" /></group>
    <group rotation={[0, 0, -f * 0.12]}><Box p={[0, 0.32, 0.02]} s={[0.015, 0.7, 0.01]} c="#a8261c" /></group></group>
  <Glow p={[0, 2.3, 0.6]} s={3} c="#ffe2b0" o={0.12} />
  <Silhouette position={[-1.9, 0, 0.8]} rotation={0.5} pose="stand" scale={1.0} rim="#ffe2b0" rimK={1.4} rimSide={[1, 0.5, 0]} phase={f * 0.1} />
  <Particles kind="dust" count={90} center={[0, 2.3, 1.2]} area={[3, 2.5, 2]} frame={f} color="#ffe6c0" size={0.012} opacity={0.6} />
</>; }}</Scene>; };
// 5 distorted voice calls itself Vrillon: close on the screen, big jagged wave + rings from the speaker
S[5] = () => { const d = dur(5); return <Scene seed={6} bg="radial-gradient(ellipse at 50% 45%, #1a2230 0%, #07090d 70%)" density={0.05} title={[{text: 'IT CALLS ITSELF', at: 0, size: 62}, {text: 'VRILLON.', at: loc(10.1, 5), red: true, size: 120}]}>{(f) => <>
  {cam([-1.3, 1.3, 4.4], [0.2, 1.5, 3.0], [[0, 1.35, 0], [0, 1.5, 0]], d, [48, 40], 'inout', 0.03)}
  <LivingRoom f={f} mode="buzz" />
  <Wave position={[0, 1.5, 1.03]} width={1.0} amp={0.26} f={f} speed={3} n={40} thick={0.01} />
  <Pulse position={[0, 1.5, 1.2]} f={f} max={3} n={3} period={36} vertical color="#cfe0ff" o={0.5} />
</>}</Scene>; };
// 6 Ashtar Galactic Command: typed transcript card under a swinging bulb
S[6] = () => { const d = dur(6); return <Scene seed={7} bg="radial-gradient(ellipse at 50% 30%, #2a2320 0%, #07080a 75%)" density={0.05} ty={230} title={[{text: 'ASHTAR GALACTIC', at: 0, size: 76}, {text: 'COMMAND.', at: loc(12.2, 6), red: true, size: 96}]}
  over={(f) => <Typed lines={['"THIS IS VRILLON,', 'A REPRESENTATIVE OF', 'THE ASHTAR GALACTIC', 'COMMAND"']} y={760} x={110} w={860} size={42} f={f} start={6} cps={1.1} head="CALLER — TRANSCRIPT" />}>{(f) => <>
  {cam([0, 3.2, 6], [0, 2.9, 4.3], [[0, 2.6, 0], [0, 2.6, 0]], d, [46, 40], 'inout', 0.03)}
  <Box p={[0, 3, -2]} s={[14, 6, 0.1]} c="#14161b" />
  <HangingBulb position={[0.4, 5.2, 0]} cable={2.2} amp={0.3} period={60} frame={f} seed={4} />
  <Particles kind="dust" count={150} center={[0, 3, 1]} area={[4, 3, 3]} frame={f} color="#ffe6c0" size={0.012} opacity={0.7} />
</>}</Scene>; };
// 7 five and a half minutes: three silhouettes watching, counter ticking to 5:30
S[7] = () => { const d = dur(7); return <Scene seed={8} bg="radial-gradient(ellipse at 50% 45%, #1a2230 0%, #07090d 70%)" density={0.05} ty={230} title={[{text: 'FIVE AND A HALF', at: 0, size: 70}, {text: 'MINUTES.', at: 6, red: true, size: 96}]}
  over={(f) => { const t = Math.min(1, f / (d - 8)); const sec = Math.round(t * 330); const mm = Math.floor(sec / 60), ss = sec % 60;
    return <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: 'Special Elite', fontSize: 110, color: '#e8e2d2', letterSpacing: 6, textShadow: '0 0 30px rgba(120,170,255,0.55)'}}>{`0${mm}:${ss < 10 ? '0' : ''}${ss}`}</div>; }}>{(f) => <>
  {cam([-0.5, 2.5, 8.4], [0.0, 2.3, 7.2], [[0, 1.2, 0], [0, 1.3, 0]], d, [48, 44], 'inout', 0.03)}
  <LivingRoom f={f} mode="buzz" rad={false} />
  {[[-1.1, 3.4, 1], [0.0, 3.7, 1], [1.1, 3.4, 1]].map(([x, z, s], i) => <Silhouette key={i} position={[x, 0, z]} rotation={Math.PI} pose="stand" hat={false} scale={0.7} rim="#9cc0ff" rimK={1.5} rimSide={[0, 0.3, -1]} phase={f * 0.1 + i * 2} />)}
</>}</Scene>; };
// 8 put down its weapons: line of silhouettes in fog, backlit, one raises an arm
S[8] = () => { const d = dur(8); return <Scene seed={9} bg="radial-gradient(ellipse at 50% 55%, #2b3544 0%, #0a0d12 70%)" density={0.05} title={[{text: 'ITS DEMAND:', at: 0, size: 70}, {text: 'WEAPONS DOWN.', at: loc(16.0, 8), red: true, size: 96}]}>{(f) => <>
  {cam([0, 1.3, 7], [0.4, 1.7, 4.0], [[0, 1.6, -4], [0, 1.7, -4]], d, [48, 42], 'inout', 0.03)}
  <Ground color="#07090c" /><FogWall position={[0, 2.5, -9]} width={26} height={7} frame={f} opacity={0.34} count={16} />
  {[-3, -1.5, 0, 1.5, 3].map((x, i) => <Silhouette key={i} position={[x * 1.0, 0, -3 - (i % 2) * 0.8]} rotation={i * 0.05} pose={i === 2 && f > 20 ? 'raise' : 'stand'} actT={(f - 20) / 14} scale={0.95 + (i % 3) * 0.04} rim={NOIR.cold} rimK={1.5} rimSide={[0, 0.4, -1]} phase={f * 0.1 + i * 1.7} />)}
  <Particles kind="dust" count={100} center={[0, 1.6, 0]} area={[8, 3, 5]} frame={f} color="#cfe0ff" size={0.014} opacity={0.5} />
</>}</Scene>; };
// 9 TWIST: the control room, ON AIR sign, operator frozen; the station has no idea
S[9] = () => { const d = dur(9); return <Scene seed={10} flash={0.8} bg="radial-gradient(ellipse at 50% 40%, #2a2530 0%, #08080b 70%)" density={0.05} ty={230} title={[{text: 'STATION:', at: 0, size: 100}, {text: 'NO IDEA.', at: 5, red: true, size: 116}]}>{(f) => <>
  {cam([0, 1.8, 4.6], [0, 1.75, 3.4], [[0, 1.6, 0], [0, 1.6, 0]], d, [48, 40], 'out', 0.03, {shake: 0.1, shakeFrom: 0, shakeLen: 12})}
  <Box p={[0, 3, -1.2]} s={[14, 6, 0.1]} c="#14161b" /><Ground color="#101216" />
  {[-1.25, 0, 1.25].map((x, i) => <Telly key={i} position={[x, 0, -0.3]} s={0.95} f={f} mode={i === 1 ? 'static' : 'news'} light={i === 1} seed={i + 2} />)}
  <Lit p={[0, 3.35, -1.1]} s={[1.1, 0.34, 0.05]} c={flicker(f, 3, 0.4) > 0.8 ? '#ff3b2a' : '#a0201a'} /><Glow p={[0, 3.35, -0.9]} s={2.2} c="#ff3b2a" o={0.45 * flicker(f, 3, 0.4)} />
  <Silhouette position={[-0.9, 0, 1.2]} rotation={0.3} pose="turn" actT={f / 20} scale={0.9} rim="#ff6a50" rimK={1.5} rimSide={[0.4, 0.4, -1]} phase={f * 0.1} />
</>}</Scene>; };
// 10 hundreds of viewers ring in: switchboard lamps blinking, operator
S[10] = () => { const d = dur(10); return <Scene seed={11} bg="radial-gradient(ellipse at 50% 40%, #2a2218 0%, #07080a 70%)" density={0.045} ty={230} title={[{text: 'HUNDREDS', at: 0, size: 104}, {text: 'CALL IN.', at: 6, red: true, size: 100}]}>{(f) => <>
  {cam([-0.8, 1.9, 7.2], [0.6, 2.0, 5.4], [[0, 2, 0], [0, 2, 0]], d, [48, 42], 'inout', 0.03)}
  <Box p={[0, 3, -0.5]} s={[14, 6, 0.1]} c="#14161b" /><Ground color="#101216" />
  <Box p={[0, 2.0, -0.2]} s={[3.2, 2.2, 0.25]} c="#0d0e10" metal={0.4} />
  <RackLights p={[0, 2.0, 0.02]} cols={10} rows={8} gap={0.28} size={0.14} f={f} color="#ffcf8a" seed={6} />
  <Glow p={[0, 2, 0.6]} s={5} c="#ffcf8a" o={0.1} />
  <Silhouette position={[-1.2, 0, 3.6]} rotation={0.5} pose="stand" hat={false} scale={1.0} rim={NOIR.amber} rimK={1.4} rimSide={[0.7, 0.5, -0.2]} phase={f * 0.1} />
</>}</Scene>; };
// 11 Winchester, more than fifty dial: rotary dial turns
const Dial = ({position = [0, 0, 0], f = 0, s = 1, spin = true}) => {
  const t = (f % 40) / 40; const ang = spin ? (t < 0.6 ? -t / 0.6 * 2.3 : -2.3 * (1 - (t - 0.6) / 0.4)) : 0;
  return <group position={position} scale={s}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.0, 1.0, 0.15, 36]} /><meshStandardMaterial color="#2a2d33" metalness={0.3} roughness={0.5} /></mesh>
    <group position={[0, 0, 0.09]} rotation={[0, 0, ang]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.88, 0.88, 0.04, 36]} /><meshStandardMaterial color="#a9a392" roughness={0.6} emissive="#1e1b14" emissiveIntensity={0.3} /></mesh>
      {Array.from({length: 10}, (_, i) => { const a = (0.6 + i * 0.5) * 1; return <mesh key={i} position={[Math.sin(a + 0.4) * 0.62, Math.cos(a + 0.4) * 0.62, 0.025]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.03, 16]} /><meshStandardMaterial color="#050505" /></mesh>; })}
    </group>
    <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.24, 0.24, 0.05, 20]} /><meshStandardMaterial color="#9a9486" metalness={0.5} roughness={0.4} /></mesh>
  </group>;
};
S[11] = () => { const d = dur(11); return <Scene seed={12} bg="radial-gradient(ellipse at 50% 40%, #241b14 0%, #07080a 70%)" density={0.04} ty={230} title={[{text: 'WINCHESTER:', at: 0, size: 84}, {text: '50+ DIAL.', at: loc(22.4, 11) - 6, red: true, size: 104}]}>{(f) => <>
  {cam([1.4, 2.2, 7.2], [0.2, 2.15, 5.4], [[0, 2.1, 0], [0, 2.1, 0]], d, [46, 38], 'inout', 0.03)}
  <Box p={[0, 3, -0.4]} s={[14, 6, 0.1]} c="#14161b" /><Box p={[0, 2.1, -0.1]} s={[3.2, 3.2, 0.2]} c="#0d0f12" />
  <Dial position={[0, 2.15, 0.1]} f={f} s={1.2} />
  <Glow p={[0, 2.2, 1.0]} s={5} c="#ffd9a0" o={0.1} /><pointLight position={[0.8, 3.4, 2.2]} intensity={2.4} distance={10} decay={1.4} color="#ffd9a0" />
</>}</Scene>; };
// 12 nine-nine-nine: dial close-up, big 999 flashes
S[12] = () => { const d = dur(12); return <Scene seed={13} bg="radial-gradient(ellipse at 50% 40%, #241b14 0%, #07080a 70%)" density={0.04} ty={240} title={[{text: '999', at: 0, size: 190, red: true}]}
  over={(f) => <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: 'Special Elite', fontSize: 44, color: '#e8e2d2', letterSpacing: 4}}>{'EMERGENCY LINES'.slice(0, Math.max(0, Math.floor((f - 12) * 1.4)))}</div>}>{(f) => <>
  {cam([0.4, 1.7, 5.4], [-0.1, 1.95, 4.2], [[0, 1.9, 0], [0, 2.0, 0]], d, [50, 42], 'ramp', 0.03)}
  <Box p={[0, 3, -0.4]} s={[14, 6, 0.1]} c="#14161b" /><Box p={[0, 2.0, -0.1]} s={[3.2, 3.2, 0.2]} c="#0d0f12" />
  <Dial position={[0, 2.0, 0.1]} f={f * 1.6} s={1.2} />
  <Glow p={[0, 2.1, 1.0]} s={5} c="#ffd9a0" o={0.1} /><pointLight position={[0.8, 3.4, 2.2]} intensity={2.4} distance={10} decay={1.4} color="#ffd9a0" />
</>}</Scene>; };
// 13 engineers find the answer: engineer with a torch at an equipment rack
S[13] = () => { const d = dur(13); return <Scene seed={14} bg="radial-gradient(ellipse at 50% 40%, #1d2630 0%, #07090c 70%)" density={0.05} title={[{text: 'ENGINEERS', at: 0, size: 96}, {text: 'TRACE IT.', at: loc(24.6, 13), red: true, size: 100}]}>{(f) => <>
  {cam([-2.6, 1.6, 7.6], [-0.6, 1.7, 5.8], [[0, 1.6, 0], [0.2, 1.7, 0]], d, [48, 40], 'inout', 0.03)}
  <Box p={[0, 3, -0.8]} s={[14, 6, 0.1]} c="#14161b" /><Ground color="#101216" />
  {[-1.6, 0, 1.6].map((x, i) => <group key={i}><Box p={[x, 1.6, -0.4]} s={[1.3, 3.2, 0.5]} c="#0e1013" metal={0.4} /><RackLights p={[x, 1.7, -0.13]} cols={5} rows={9} gap={0.2} size={0.09} f={f} color={['#7dffb0', '#ffcf8a', '#9cc0ff'][i]} seed={i + 3} /></group>)}
  <Silhouette position={[-0.4, 0, 0.9]} rotation={0.6} pose="raise" actT={f / 14} hat={false} scale={0.9} rim="#cfe0ff" rimK={1.5} rimSide={[0.6, 0.4, -0.2]} phase={f * 0.1} />
  <Spot position={[-0.5, 1.9, 2.0]} angle={0.5} intensity={9} distance={7} color="#fff2d2" target={[0.8, 1.6, -0.4]} />
  <Particles kind="dust" count={100} center={[0, 1.8, 0.4]} area={[4, 3, 3]} frame={f} color="#cfe0ff" size={0.012} opacity={0.6} />
</>}</Scene>; };
// 14 Hannington transmitter: photo card over the mast scene
S[14] = () => { const d = dur(14); return <Scene seed={15} bg="linear-gradient(180deg,#05080d 0%,#141c28 100%)" density={0.03} ty={230} title={[{text: 'HANNINGTON', at: 0, size: 96}, {text: 'TRANSMITTER.', at: 7, red: true, size: 80}]}
  over={(f) => <PhotoCard src="vrillon/IMG1.jpg" x={150} y={520} w={780} h={520} rot={-2.2} f={f} d={d} caption="HANNINGTON, HAMPSHIRE" credit="Photo: Roberto Casula, CC BY-SA 3.0" />}>{(f) => <>
  {cam([5, 5, 14], [3, 7, 11], [[0, 8, 0], [0, 8, 0]], d, [50, 46], 'inout', 0.04)}
  <Ground /><Hill p={[-8, -0.5, -14]} /><MoonGlow />
  <Mast position={[0, 0, 0]} h={20} f={f} /><Pulse position={[0, 0.1, 0]} f={f} max={14} n={4} period={70} color="#9cc0ff" o={0.5} />
  <FogWall position={[0, 3, -12]} width={30} height={7} frame={f} opacity={0.22} />
</>}</Scene>; };
// 15 signal from the Isle of Wight: Rowridge photo
S[15] = () => { const d = dur(15); return <Scene seed={16} bg="linear-gradient(180deg,#05080d 0%,#141c28 100%)" density={0.03} ty={230} title={[{text: 'ISLE OF WIGHT.', at: 0, size: 84}]} sub="ROWRIDGE RELAY" subAt={10}
  over={(f) => <PhotoCard src="vrillon/IMG2.jpg" x={250} y={560} w={580} h={720} rot={2} f={f} d={d} caption="ROWRIDGE DOWN" credit="Photo: David Jones, CC BY 2.0" />}>{(f) => <>
  {cam([-6, 4, 14], [-3, 6, 11], [[0, 8, 0], [0, 8, 0]], d, [50, 46], 'inout', 0.04)}
  <Ground /><Hill p={[10, -0.5, -12]} /><MoonGlow p={[14, 15, -60]} />
  <Mast position={[3, 0, -2]} h={24} f={f + 9} /><Pulse position={[3, 0.1, -2]} f={f} max={16} n={4} period={60} color="#9cc0ff" o={0.55} />
  <FogWall position={[0, 3, -12]} width={30} height={7} frame={f} opacity={0.22} />
</>}</Scene>; };
// 16 a small unauthorised transmitter hidden in woods
S[16] = () => { const d = dur(16); return <Scene seed={17} flash={0.5} bg="linear-gradient(180deg,#05070b 0%,#0e141c 100%)" density={0.06} ty={230} title={[{text: 'A SMALL,', at: 0, size: 84}, {text: 'UNAUTHORISED', at: 10, red: true, size: 80}, {text: 'TRANSMITTER.', at: 12, size: 74}]}>{(f) => <>
  {cam([2.0, 1.1, 6.6], [0.6, 0.9, 3.6], [[0, 0.7, 0], [0, 0.7, 0]], d, [48, 40], 'inout', 0.03)}
  <Ground /><MoonGlow p={[-10, 12, -50]} s={26} />
  {[[-3, -3, 4, 1.4], [3.2, -4, 5, 1.6], [-5, -7, 6, 1.8], [5.5, -8, 5, 1.5], [1, -10, 6, 1.8], [-1.5, -12, 5, 1.6]].map(([x, z, h, w], i) => <Tree key={i} p={[x, 0, z]} h={h} w={w} />)}
  <Box p={[0, 0.2, 0]} s={[0.7, 0.4, 0.5]} c="#16191e" metal={0.5} /><Box p={[0.1, 0.9, 0]} s={[0.025, 1.0, 0.025]} c="#2a2d33" /><Box p={[0.1, 1.3, 0]} s={[0.5, 0.02, 0.02]} c="#2a2d33" />
  <Glow p={[-0.2, 0.3, 0.3]} s={0.7} c={NOIR.red} o={flicker(f, 5, 0.9) > 0.5 ? 1 : 0.2} />
  <Pulse position={[0.1, 0.2, 0]} f={f} max={3.2} n={4} period={30} color="#ff6a50" o={0.7} />
  <FogWall position={[0, 1.2, -6]} width={14} height={4} frame={f} opacity={0.25} color="#9fb2cc" />
</>}</Scene>; };
// 17 nearby has overpowered it: top-down, blue rings from the big mast swamped by red rings
S[17] = () => { const d = dur(17); return <Scene seed={18} bg="radial-gradient(ellipse at 50% 50%, #131b26 0%, #05070a 80%)" density={0.01} ty={230} title={[{text: 'OVERPOWERED.', at: loc(33.0, 17), red: true, size: 104}]}>{(f) => { const grow = Math.min(1, f / (d - 6)); return <>
  {cam([0, 15, 5.5], [0, 12, 3.5], [[0, 0, 0], [0, 0, 0]], d, [46, 44], 'inout', 0.02)}
  <Ground color="#080b0f" y={-0.02} />
  <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 40]} /><meshBasicMaterial color="#0b1118" /></mesh>
  <Box p={[-3.2, 0.3, -2]} s={[0.6, 0.6, 0.6]} c="#9cc0ff" /><Glow p={[-3.2, 0.5, -2]} s={2.4} c="#9cc0ff" o={0.8} />
  <Pulse position={[-3.2, 0.05, -2]} f={f} max={9 - grow * 5} n={4} period={50} color="#9cc0ff" o={0.9 * (1 - grow * 0.65)} />
  <Box p={[3.2, 0.2, 2]} s={[0.35, 0.35, 0.35]} c="#ff6a50" /><Glow p={[3.2, 0.4, 2]} s={2} c="#ff3b2a" o={0.9} />
  <Pulse position={[3.2, 0.06, 2]} f={f} max={3 + grow * 10} n={5} period={36} color="#ff5a40" o={0.95} thick={0.05} />
</>; }}</Scene>; };
// 18 IBA: an official behind a desk lit through blinds
S[18] = () => { const d = dur(18); return <Scene seed={19} bg="radial-gradient(ellipse at 30% 40%, #1d232c 0%, #07090c 70%)" density={0.045} ambient={0.1} ty={230} title={[{text: 'THE BROADCASTING', at: 0, size: 62}, {text: 'AUTHORITY SAYS:', at: 8, red: true, size: 64}]}>{(f) => <>
  {cam([3.4, 1.9, 2.6], [1.3, 1.6, 0.8], [[-3.4, 1.7, -1.6], [-3.4, 1.8, -1.0]], d, [50, 42], 'inout', 0.04)}
  <Box p={[0, 0, 0]} s={[14, 0.01, 14]} c="#14171c" /><Box p={[0, 3, -4]} s={[14, 6, 0.1]} c="#1b1f26" /><Box p={[-4.2, 3, 0]} s={[0.1, 6, 14]} c="#181c22" />
  <Blinds position={[-4.15, 2.1, -1.2]} rotation={[0, Math.PI / 2, 0]} width={2.2} height={2.3} dir={[0.85, -0.42, 0.25]} length={7.5} opacity={0.55} frame={f} />
  <BlindsFloor position={[-1.4, 0.02, -0.7]} size={[2.6, 3.6]} rotation={Math.PI / 2 + 0.28} frame={f} opacity={0.38} />
  <Box p={[1.2, 0.78, -1.6]} s={[2.2, 0.08, 1.0]} c="#0d0b0a" />
  {[[0.2, -2.0], [2.2, -2.0], [0.2, -1.2], [2.2, -1.2]].map(([x, z], i) => <Box key={i} p={[x, 0.38, z]} s={[0.07, 0.76, 0.07]} c="#0d0b0a" />)}
  <Silhouette position={[-2.9, 0, -1.0]} rotation={-Math.PI / 2 - 0.15} pose="stand" rim="#ffe2b0" rimK={1.3} rimSide={[-1, 0.4, 0]} phase={f * 0.1} />
  <Silhouette position={[1.2, 0, -2.5]} rotation={0.0} pose="stand" scale={1.0} rim="#ffe2b0" rimK={1.0} rimSide={[-1, 0.4, 0.3]} phase={f * 0.1 + 2} />
  <Particles kind="dust" count={200} center={[-2.4, 1.4, -1.0]} area={[3.2, 2.6, 2.4]} frame={f} color="#ffe6c0" size={0.012} opacity={0.7} />
</>}</Scene>; };
// 19 the statement: typed card, "a considerable amount" (S1: IBA via Guardian 28 Nov 1977)
S[19] = () => { const d = dur(19); return <Scene seed={20} bg="radial-gradient(ellipse at 50% 30%, #2a2320 0%, #07080a 75%)" density={0.05} ty={230} title={[{text: 'IT TOOK', at: 0, size: 96}, {text: 'CONSIDERABLE', at: 6, red: true, size: 84}]}
  over={(f) => <Typed lines={['"A CONSIDERABLE', 'AMOUNT OF TECHNICAL', 'KNOW-HOW"']} y={780} x={110} w={860} size={46} f={f} start={4} cps={1.15} head="INDEPENDENT BROADCASTING AUTHORITY" />}>{(f) => <>
  {cam([0, 3.2, 6], [0, 2.9, 4.3], [[0, 2.6, 0], [0, 2.6, 0]], d, [46, 40], 'inout', 0.03)}
  <Box p={[0, 3, -2]} s={[14, 6, 0.1]} c="#14161b" />
  <HangingBulb position={[-0.5, 5.2, 0]} cable={2.2} amp={0.26} period={72} frame={f + 20} seed={7} />
  <Particles kind="dust" count={150} center={[0, 3, 1]} area={[4, 3, 3]} frame={f} color="#ffe6c0" size={0.012} opacity={0.7} />
</>}</Scene>; };
// 20 technical know-how: oscilloscope bench, hands of a silhouette at the knobs
S[20] = () => { const d = dur(20); return <Scene seed={21} bg="radial-gradient(ellipse at 50% 50%, #12201a 0%, #05080a 75%)" density={0.05} ty={230} title={[{text: 'TECHNICAL', at: 0, size: 100}, {text: 'KNOW-HOW.', at: 5, red: true, size: 100}]}>{(f) => <>
  {cam([-1.6, 1.5, 3.8], [0.2, 1.45, 2.4], [[0, 1.3, 0], [0, 1.3, 0]], d, [48, 40], 'inout', 0.03)}
  <Box p={[0, 3, -0.8]} s={[14, 6, 0.1]} c="#14161b" /><Box p={[0, 0.6, 0.2]} s={[4, 0.1, 1.4]} c="#17130e" />
  <Box p={[0, 1.35, -0.1]} s={[1.5, 1.2, 0.8]} c="#0d1013" metal={0.4} />
  <Lit p={[-0.15, 1.5, 0.31]} s={[0.95, 0.75, 0.01]} c="#0a1a12" />
  {Array.from({length: 4}, (_, i) => { const k = i / 3; return <Wave key={i} position={[-0.15, 1.5 + (k - 0.5) * 0.18, 0.325]} width={0.9} n={46} amp={0.14 + 0.1 * Math.sin(f * 0.1 + i)} f={f * 0.6 + i * 3} speed={0.5} seed={i + 2} thick={0.01} color={i % 2 ? '#7dffb0' : '#3fe0a0'} />; })}
  {[0.55, 0.72].map((x, i) => <mesh key={i} position={[x, 1.7 - i * 0.22, 0.32]} rotation={[Math.PI / 2, 0, f * 0.05]}><cylinderGeometry args={[0.06, 0.06, 0.06, 12]} /><meshStandardMaterial color="#2a2c30" metalness={0.5} /></mesh>)}
  <Glow p={[-0.15, 1.5, 0.9]} s={2.2} c="#7dffb0" o={0.1} />
  <Box p={[1.8, 0.78, 0.1]} s={[0.4, 0.3, 0.3]} c="#14161a" /><Glow p={[1.8, 0.95, 0.3]} s={0.5} c={NOIR.red} o={0.7 * flicker(f, 2, 0.5)} />
  <Silhouette position={[1.6, 0, 1.3]} rotation={-0.5} pose="stand" hat={false} rim="#7dffb0" rimK={1.3} rimSide={[-0.7, 0.4, -0.2]} phase={f * 0.1} />
</>}</Scene>; };
// 21 Someone put a rival transmitter ...: silhouette carrying the box through the woods, torch beam
S[21] = () => { const d = dur(21); return <Scene seed={22} flash={0.5} bg="linear-gradient(180deg,#05070b 0%,#0e141c 100%)" density={0.06} ty={230} title={[{text: 'SOMEONE', at: 0, size: 100}, {text: 'BUILT A RIVAL.', at: 7, red: true, size: 88}]}>{(f) => { const wz = interpolate(f, [0, d], [-7, -1]); return <>
  {cam([3.0, 1.3, 4.2], [1.6, 1.4, 1.6], [[-1.0, 1.1, -4], [-0.2, 1.1, -3]], d, [48, 42], 'inout', 0.03)}
  <Ground /><MoonGlow p={[-12, 12, -50]} s={26} />
  {[[-3, -3, 4, 1.4], [3.2, -4, 5, 1.6], [-5, -7, 6, 1.8], [5.5, -8, 5, 1.5], [1, -10, 6, 1.8], [-1.5, -12, 5, 1.6]].map(([x, z, h, w], i) => <Tree key={i} p={[x, 0, z]} h={h} w={w} />)}
  <Silhouette position={[-0.4, 0, wz]} rotation={0.0} pose="walk" phase={f * 0.2} rim="#cfe0ff" rimK={1.6} rimSide={[0.6, 0.4, -0.2]} />
  <Box p={[-0.4, 1.0, wz + 0.25]} s={[0.4, 0.3, 0.25]} c="#16191e" />
  <Spot position={[-0.4, 1.4, wz + 0.4]} angle={0.45} intensity={10} distance={9} color="#fff2d2" target={[-0.6, 0.2, wz + 5]} />
  <Glow p={[-0.4, 1.35, wz + 0.5]} s={1.0} c="#fff2d2" o={0.7} />
  <FogWall position={[0, 1.2, -8]} width={16} height={4} frame={f} opacity={0.25} color="#9fb2cc" />
</>; }}</Scene>; };
// 22 close to that mast: the figure at the foot of the tower, fog
S[22] = () => { const d = dur(22); return <Scene seed={23} bg="linear-gradient(180deg,#05080d 0%,#141c28 100%)" density={0.035} ty={230} title={[{text: 'CLOSE TO', at: 0, size: 88}, {text: 'THAT MAST.', at: 7, red: true, size: 100}]}>{(f) => <>
  {cam([3.4, 0.8, 8], [1.6, 1.3, 5.6], [[0, 6, 0], [0, 4, 0]], d, [52, 48], 'inout', 0.04)}
  <Ground /><Hill p={[-10, -0.5, -16]} /><MoonGlow />
  <Mast position={[0, 0, -2]} h={20} f={f + 5} />
  <Silhouette position={[-0.2, 0, 2.2]} rotation={0.8} pose="stand" scale={1.0} rim="#cfe0ff" rimK={1.6} rimSide={[0.4, 0.6, -0.6]} phase={f * 0.1} />
  <Box p={[-0.2, 0.2, 1.7]} s={[0.4, 0.3, 0.25]} c="#16191e" /><Glow p={[-0.2, 0.4, 1.9]} s={0.5} c={NOIR.red} o={flicker(f, 5, 0.9) > 0.5 ? 1 : 0.2} />
  <Pulse position={[0, 0.1, -2]} f={f} max={12} n={4} period={70} color="#9cc0ff" o={0.45} />
  <FogWall position={[0, 2, -8]} width={26} height={6} frame={f} opacity={0.28} />
</>}</Scene>; };
// 23 REVEAL: never found. Figure is gone, only the dying transmitter light; flash
S[23] = () => { const d = dur(23); return <Scene seed={24} flash={0.9} bg="linear-gradient(180deg,#05070b 0%,#0e141c 100%)" density={0.06} ty={230} title={[{text: 'NEVER', at: 0, size: 130}, {text: 'FOUND.', at: 4, red: true, size: 130}]}>{(f) => <>
  {cam([0.4, 1.3, 4.4], [0.1, 1.2, 6.8], [[0, 0.5, 0], [0, 0.5, 0]], d, [42, 50], 'out', 0.02)}
  <Ground /><MoonGlow p={[-10, 12, -50]} s={26} />
  {[[-3, -3, 4, 1.4], [3.2, -4, 5, 1.6], [-5, -7, 6, 1.8], [5.5, -8, 5, 1.5]].map(([x, z, h, w], i) => <Tree key={i} p={[x, 0, z]} h={h} w={w} />)}
  <Box p={[0, 0.2, 0]} s={[0.7, 0.4, 0.5]} c="#16191e" metal={0.5} /><Box p={[0.1, 0.9, 0]} s={[0.025, 1.0, 0.025]} c="#2a2d33" />
  <Glow p={[-0.2, 0.3, 0.3]} s={0.7} c={NOIR.red} o={f < 12 ? 1 : f < 18 ? (flicker(f, 7, 0.9) > 0.5 ? 0.8 : 0.1) : 0} />
  {f < 12 && <Silhouette position={[-1.4, 0, 0.6]} rotation={0.8} pose="walk" phase={f * 0.2} rim="#cfe0ff" rimK={1.6} rimSide={[0.6, 0.4, -0.2]} />}
  <FogWall position={[0, 1.2, -6]} width={14} height={4} frame={f} opacity={0.3} color="#9fb2cc" />
</>}</Scene>; };
// 24 prankster or a team: one silhouette vs a group, two lit pools
S[24] = () => { const d = dur(24); return <Scene seed={25} bg="radial-gradient(ellipse at 50% 55%, #222b38 0%, #07090c 70%)" density={0.05} ty={230} title={[{text: 'PRANKSTER?', at: 0, size: 100}, {text: 'OR A TEAM?', at: loc(44.0, 24), red: true, size: 100}]}>{(f) => <>
  {cam([0, 1.5, 10], [0, 1.6, 6.8], [[0, 1.5, -3], [0, 1.5, -3]], d, [52, 44], 'inout', 0.03)}
  <Ground color="#07090c" /><FogWall position={[0, 2.5, -9]} width={26} height={7} frame={f} opacity={0.3} count={14} />
  <LightPool position={[-2.5, 0.02, -3]} radius={2.2} color={NOIR.cold} opacity={0.5} /><LightPool position={[2.6, 0.02, -3]} radius={3.0} color={NOIR.amber} opacity={0.5} />
  <Silhouette position={[-2.5, 0, -3]} pose="stand" rim={NOIR.cold} rimK={1.6} rimSide={[0, 0.4, -1]} phase={f * 0.1} />
  {[[1.8, -3.4], [2.7, -2.8], [3.5, -3.6], [2.3, -4.2]].map(([x, z], i) => <Silhouette key={i} position={[x, 0, z]} rotation={-0.3 + i * 0.2} pose="stand" scale={0.95 + i * 0.03} rim={NOIR.amber} rimK={1.5} rimSide={[0, 0.4, -1]} phase={f * 0.1 + i * 2} />)}
  <Particles kind="dust" count={80} center={[0, 1.6, -2]} area={[8, 3, 5]} frame={f} color="#cfe0ff" size={0.014} opacity={0.5} />
</>}</Scene>; };
// 25 who knew how to silence a live bulletin: transmitter rack lights die one by one
S[25] = () => { const d = dur(25); return <Scene seed={26} bg="radial-gradient(ellipse at 50% 40%, #1d2630 0%, #07090c 70%)" density={0.05} ty={230} title={[{text: 'KNEW HOW TO', at: 0, size: 84}, {text: 'SILENCE IT.', at: 8, red: true, size: 100}]}>{(f) => <>
  {cam([0, 1.8, 7.5], [0, 1.9, 4.6], [[0, 1.8, 0], [0, 1.8, 0]], d, [48, 40], 'inout', 0.03)}
  <Box p={[0, 3, -0.8]} s={[14, 6, 0.1]} c="#14161b" /><Ground color="#101216" />
  {[-1.6, 0, 1.6].map((x, i) => <group key={i}><Box p={[x, 1.6, -0.4]} s={[1.3, 3.2, 0.5]} c="#0e1013" metal={0.4} /><RackLights p={[x, 1.7, -0.13]} cols={5} rows={9} gap={0.2} size={0.09} f={f} dieAt={6} color={['#7dffb0', '#ffcf8a', '#9cc0ff'][i]} seed={i + 3} /></group>)}
  <Silhouette position={[0.0, 0, 0.9]} rotation={Math.PI} pose="stand" hat={false} scale={0.9} rim="#cfe0ff" rimK={1.5} rimSide={[0, 0.3, -1]} phase={f * 0.1} />
</>}</Scene>; };
// 26 END = frame 0's set, camera ends on the frame-0 pose, sound line flat again
S[26] = () => { const d = dur(26); return <Scene seed={27} bg="radial-gradient(ellipse at 50% 45%, #1a2230 0%, #07090d 70%)" density={0.05} title={[{text: 'A LIVE NEWS', at: 0, size: 80}, {text: 'BULLETIN?', at: 8, red: true, size: 96}]}>{(f) => <>
  {cam(POSE0.to, POSE0.from, POSE0.look.slice().reverse(), d, [38, 46], 'inout', 0.0)}
  <LivingRoom f={f} mode={f < 14 ? 'buzz' : 'news'} />
  <Wave position={[0, 1.5, 1.02]} width={0.9} amp={0} f={f} thick={0.01} />
</>}</Scene>; };

export const VR = () => {
  const ready = usePreload(grabPaths(PROPS));
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><NoirFonts />
    {ready && S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? VR_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#040506" />}</Sequence>; })}
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
