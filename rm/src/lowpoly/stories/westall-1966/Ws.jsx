import {pal} from '../../../palette.js';
// "The News Went Silent" (Southern TV hijack, 26 Nov 1977) - NOIR look (remotion/src/noir/NoirKit.jsx), 27 scenes on cues.json cuts.
// Facts on screen come from sources.txt only (S1 Wikipedia, S2 The Independent). No invented quotes, no invented body copy.
import {useMemo} from 'react';
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import * as THREE from 'three';
import {ShotCam, WordCaption, FontFaces, Dip, Particles, Post, usePreload, grabPaths} from '../../kit/index.js';
import {softTexture} from '../../kit/Sky.jsx';
import {hash2} from '../../kit/noise.js';
import {NOIR, NoirStage, Silhouette, Blinds, BlindsFloor, HangingBulb, FogWall, NoirFinish, NoirTitle, NoirFonts, NoirRain, LightPool, Streetlamp, CityRow, flicker} from '../../../noir/NoirKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const WS_FRAMES = Math.round(52.6 * FPS);
const W = VO.words;
const CS = [0.0,1.76,4.61,7.26,9.16,10.9,12.96,15.5,16.94,18.68,21.84,23.44,25.23,26.88,30.04,31.16,32.28,34.99,36.4,38.18,40.48,42.04,43.86,46.69,48.04,49.12,50.52];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? WS_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];
const PROPS = [];

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

const SILV = '#dfe9f5';
const BG_SKY = 'linear-gradient(180deg,#0a1220 0%,#25364f 70%,#3a4a63 100%)';
// silver disc: flattened lens, rim, underside glow, slow tilt
const Disc = ({position = [0, 8, -20], s = 3, f = 0, tilt = 0.1, glow = 0.7, color = SILV}) => <group position={[position[0], position[1] + Math.sin(f * 0.07) * 0.08 * s, position[2]]} rotation={[tilt + Math.sin(f * 0.05) * 0.04, f * 0.01, 0]} scale={s}>
  <mesh scale={[1, 0.2, 1]}><sphereGeometry args={[1, 28, 14]} /><meshStandardMaterial color="#c9d6e6" metalness={0.9} roughness={0.2} emissive={color} emissiveIntensity={0.55} /></mesh>
  <mesh position={[0, 0.17, 0]} scale={[0.4, 0.2, 0.4]}><sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color="#f3f8ff" toneMapped={false} /></mesh>
  <Glow p={[0, -0.1, 0]} s={3.6} c={color} o={glow} />
</group>;
const Oval = ({y = 0}) => <><Ground color="#070c10" /><mesh position={[0, y + 0.01, -6]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[14, 40]} /><meshStandardMaterial color="#0e1a14" roughness={1} /></mesh></>;
const Pines = ({z = -22, n = 14, span = 40, h = 7, f = 0}) => <>{Array.from({length: n}, (_, i) => <Tree key={i} p={[(i / (n - 1) - 0.5) * span + (hash2(i, 2, 3) - 0.5) * 2, 0, z - hash2(i, 5, 1) * 3]} h={h * (0.8 + hash2(i, 7, 2) * 0.5)} w={1.4 + hash2(i, 9, 4)} />)}</>;
const School = ({p = [0, 0, -14], f = 0}) => <group position={p}>
  <Box p={[0, 1.6, 0]} s={[14, 3.2, 3]} c="#10151b" /><Box p={[0, 3.4, 0]} s={[14.6, 0.3, 3.4]} c="#0a0d11" />
  {Array.from({length: 9}, (_, i) => <Lit key={i} p={[-6 + i * 1.5, 1.8, 1.52]} s={[0.7, 0.9, 0.02]} c={hash2(i, 3, 5) > 0.5 ? '#ffd9a0' : '#1a2230'} />)}
</group>;
const Kids = ({n = 5, z = 0, f = 0, rim = NOIR.cold, raise = false, sc = 0.55, x0 = -2.4, dx = 1.2}) => <>{Array.from({length: n}, (_, i) => <Silhouette key={i} position={[x0 + i * dx + (hash2(i, 1, 1) - 0.5) * 0.4, 0, z - (i % 2) * 0.7]} rotation={Math.PI + (i - n / 2) * 0.06} pose={raise && i % 2 === 0 ? 'raise' : 'stand'} actT={(f - 4 - i * 2) / 12} hat={false} scale={sc} rim={rim} rimK={1.5} rimSide={[0, 0.4, -1]} phase={f * 0.1 + i * 1.3} />)}</>;
const Streak = ({f = 0, from = [-6, 2, -16], to = [8, 14, -30], len = 6}) => { const t = Math.min(1, f / 40); const p = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t]; return <><Glow p={p} s={2.4} c="#bfe0ff" o={1} />{[1, 2, 3, 4, 5].map((k) => <Glow key={k} p={[p[0] - (to[0] - from[0]) * 0.012 * k * len / 5, p[1] - (to[1] - from[1]) * 0.012 * k * len / 5, p[2] - (to[2] - from[2]) * 0.012 * k * len / 5]} s={2.0 - k * 0.3} c="#8fb8ff" o={0.7 - k * 0.1} />)}</>; };
const Plane = ({p, f = 0, rot = 0, s = 1}) => <group position={p} rotation={[0, rot, Math.sin(f * 0.1) * 0.15]} scale={s}><Box p={[0, 0, 0]} s={[0.9, 0.16, 0.16]} c="#05070a" /><Box p={[0, 0.02, 0]} s={[0.12, 0.04, 1.5]} c="#05070a" /><Box p={[-0.45, 0.12, 0]} s={[0.1, 0.25, 0.04]} c="#05070a" /><Glow p={[0.1, 0.1, 0]} s={0.4} c={flicker(f, 3, 0.9) > 0.5 ? '#ff4a3a' : '#552018'} o={0.9} /></group>;
const Tower = ({f = 0, dark = false}) => <>
  <Box p={[0, 3, -2.5]} s={[14, 6, 0.1]} c="#14181e" /><Ground color="#0c0f13" />
  {[-1.3, 0, 1.3].map((x, i) => <group key={i} position={[x, 1.25, -1.0]} rotation={[0, -x * 0.18, 0]}><Box p={[0, 0, 0]} s={[1.0, 0.95, 0.5]} c="#0d1013" metal={0.4} /><Lit p={[0, 0.05, 0.26]} s={[0.78, 0.7, 0.01]} c="#07140d" />
    <mesh position={[0, 0.05, 0.27]} rotation={[0, 0, f * 0.12 * (i + 1)]}><planeGeometry args={[0.7, 0.012]} /><meshBasicMaterial color="#7dffb0" toneMapped={false} transparent opacity={0.9} /></mesh>
    <mesh position={[0, 0.05, 0.271]}><ringGeometry args={[0.28, 0.285, 32]} /><meshBasicMaterial color="#2a8a5a" toneMapped={false} /></mesh><Glow p={[0, 0.05, 0.6]} s={1.4} c="#7dffb0" o={0.12} /></group>)}
</>;

const Moon = () => <MoonGlow p={[-16, 18, -60]} s={26} />;
const Fld = ({f, kids = 0, raise = false, z = 1.0, disc = true}) => <>
  <Oval /><Pines f={f} /><School /><Moon />
  {kids > 0 && <Kids n={kids} z={z} f={f} raise={raise} />}
  <FogWall position={[0, 1.5, -12]} width={34} height={5} frame={f} opacity={0.2} />
</>;
const Sp = ({position, target, angle = 0.5, intensity = 9, distance = 8, color = '#fff2d2'}) => <Spot position={position} target={target} angle={angle} intensity={intensity} distance={distance} color={color} />;

const S = [];
// 0 FRAME 0: giant disc dropping behind the pines, kids' silhouettes arms up, crash push-in
S[0] = () => { const d = dur(0); return <Scene seed={1} flash={0.7} bg={BG_SKY} density={0.025} title={[{text: '100 STUDENTS', at: 0, size: 92}, {text: '1 SILVER DISC', at: 8, red: true, size: 90}]}>{(f) => { const dy = interpolate(f, [0, d], [7.5, 5.2]); return <>
  {cam([0.6, 1.5, 9], [0.0, 2.2, 4.4], [[0, 6, -20], [0, 5.5, -20]], d, [46, 40], 'out', 0.03, {shake: 0.1, shakeFrom: 0, shakeLen: 12})}
  <Fld f={f} kids={6} raise z={2.5} /><Disc position={[0, dy + 2, -18]} s={6.5} f={f} />
  <Particles kind="dust" count={80} center={[0, 3, -8]} area={[10, 5, 6]} frame={f} color="#cfe0ff" size={0.014} opacity={0.5} />
</>; }}</Scene>; };
// 1 disc settles behind the school: low crane
S[1] = () => { const d = dur(1); return <Scene seed={2} bg={BG_SKY} density={0.025} title={[{text: 'BEHIND THEIR', at: 0, size: 80}, {text: 'SCHOOL.', at: 6, red: true, size: 110}]}>{(f) => <>
  {cam([-3, 0.8, 7], [2.5, 3.6, 5], [[0, 5, -18], [0, 4.2, -18]], d, [50, 44], 'inout', 0.03)}
  <Fld f={f} kids={5} z={3} /><Disc position={[0, 5.0 - f * 0.01, -18]} s={6} f={f} />
</>}</Scene>; };
// 2 Melbourne / April 1966: skyline row, calendar-like card
S[2] = () => { const d = dur(2); return <Scene seed={3} bg="linear-gradient(180deg,#0b1018 0%,#2a3648 100%)" density={0.035} title={[{text: 'MELBOURNE.', at: 0, size: 96}, {text: 'APRIL 1966.', at: 8, red: true, size: 92}]}>{(f) => <>
  {cam([4, 2.2, 8], [1, 3.0, 2], [[0, 3, -20], [0, 3, -20]], d, [50, 42], 'out', 0.03)}
  <Ground /><CityRow side={-1} x={-6} zFrom={-44} zTo={6} seed={5} frame={f} color={NOIR.amber} litFrac={0.35} hMin={4} hMax={12} /><CityRow side={1} x={6} zFrom={-44} zTo={6} seed={9} frame={f} color="#9cc0ff" litFrac={0.3} hMin={4} hMax={14} />
  <Moon /><Streetlamp position={[-2.5, 0, -2]} armDir={1} frame={f} seed={2} light /><FogWall position={[0, 3, -30]} width={30} height={8} frame={f} opacity={0.22} />
</>}</Scene>; };
// 3 morning break: students on the oval, school bell glow
S[3] = () => { const d = dur(3); return <Scene seed={4} bg="linear-gradient(180deg,#14202f 0%,#47596f 100%)" density={0.03} title={[{text: 'MORNING', at: 0, size: 100}, {text: 'BREAK.', at: 7, red: true, size: 110}]}>{(f) => <>
  {cam([-3.4, 1.4, 8], [-0.6, 1.5, 5.6], [[0, 2, -6], [0, 3, -10]], d, [50, 42], 'inout', 0.03)}
  <Fld f={f} /><Kids n={7} z={1.5} f={f} x0={-3.6} dx={1.2} rim="#ffe2b0" />
  {[0, 1, 2].map((i) => <Silhouette key={i} position={[2.8 + i * 0.9, 0, -2 - i]} rotation={-0.5} pose="walk" phase={f * 0.2 + i * 2} scale={0.6} rim="#ffe2b0" rimK={1.4} />)}
</>}</Scene>; };
// 4 teacher and students look up: silhouettes from behind, one arm up, sky glow
S[4] = () => { const d = dur(4); return <Scene seed={5} bg={BG_SKY} density={0.03} title={[{text: 'LOOK UP.', at: 0, size: 130, red: true}]}>{(f) => <>
  {cam([0.4, 0.9, 5.6], [0.2, 1.4, 4.2], [[0, 2, -2], [0, 8, -18]], d, [52, 46], 'inout', 0.03)}
  <Fld f={f} kids={0} />
  <Silhouette position={[-0.4, 0, 1.6]} rotation={Math.PI} pose="raise" actT={f / 12} scale={1.0} rim={SILV} rimK={1.6} rimSide={[0, 0.4, -1]} phase={f * 0.1} />
  {[0.6, 1.4, -1.3].map((x, i) => <Silhouette key={i} position={[x, 0, 1.2 - i * 0.3]} rotation={Math.PI} pose="stand" hat={false} scale={0.62} rim={SILV} rimK={1.5} rimSide={[0, 0.4, -1]} phase={f * 0.1 + i} />)}
  <Disc position={[0, 6.5, -16]} s={3.2} f={f} />
</>}</Scene>; };
// 5 round, silent, silver: disc close, rim-lit, soundless rings
S[5] = () => { const d = dur(5); return <Scene seed={6} bg="radial-gradient(ellipse at 50% 38%, #3a4a63 0%, #07090d 72%)" density={0.02} title={[{text: 'ROUND.', at: 0, size: 100}, {text: 'SILENT.', at: 6, size: 100}, {text: 'SILVER.', at: 12, red: true, size: 110}]}>{(f) => <>
  {cam([2.6, 3.4, 4.5], [0.6, 4.4, 1.2], [[0, 5, -12], [0, 5.2, -12]], d, [48, 38], 'inout', 0.04, {orbit: 0})}
  <Ground /><Disc position={[0, 5.2, -12]} s={4.8} f={f} tilt={0.22} /><Pulse position={[0, 5.0, -12]} f={f} max={7} n={3} period={50} vertical color="#cfe0ff" o={0.35} />
  <Particles kind="dust" count={90} center={[0, 5, -8]} area={[8, 4, 5]} frame={f} color="#cfe0ff" size={0.014} opacity={0.5} />
</>}</Scene>; };
// 6 a science teacher says it rose again: figure pointing, streak rising
S[6] = () => { const d = dur(6); return <Scene seed={7} bg={BG_SKY} density={0.025} title={[{text: 'A TEACHER SAYS:', at: 0, size: 70}, {text: 'IT ROSE AGAIN.', at: 8, red: true, size: 88}]}>{(f) => <>
  {cam([-2.2, 1.0, 6.4], [-0.8, 1.6, 4.4], [[2, 3, -14], [4, 9, -26]], d, [50, 44], 'inout', 0.03)}
  <Fld f={f} /><Silhouette position={[-1.4, 0, 1.4]} rotation={Math.PI - 0.3} pose="raise" actT={f / 10} scale={1.0} rim={SILV} rimK={1.5} rimSide={[0, 0.4, -1]} phase={f * 0.1} />
  <Disc position={[2 + f * 0.05, 3.6 + f * 0.1, -18]} s={3.4} f={f} />
</>}</Scene>; };
// 7 silver streak: cold-blue streak, whip-pan
S[7] = () => { const d = dur(7); return <Scene seed={8} flash={0.5} bg="linear-gradient(180deg,#05080f 0%,#1c2a40 100%)" density={0.02} title={[{text: 'A SILVER', at: 0, size: 96}, {text: 'STREAK.', at: 6, red: true, size: 110}]}>{(f) => <>
  {cam([0, 1.5, 6], [3, 4.5, 4.4], [[-3, 3, -18], [6, 11, -30]], d, [52, 44], 'in', 0.02, {shake: 0.06, shakeFrom: 0, shakeLen: 8})}
  <Ground /><Pines /><Moon /><Streak f={f * 1.4} from={[-8, 2, -16]} to={[10, 14, -30]} len={9} />
</>}</Scene>; };
// 8 five light planes: orbit around the streak, 5 small plane silhouettes
S[8] = () => { const d = dur(8); return <Scene seed={9} bg="linear-gradient(180deg,#05080f 0%,#1c2a40 100%)" density={0.02} title={[{text: '5 LIGHT', at: 0, size: 100}, {text: 'PLANES.', at: 5, red: true, size: 110}]}>{(f) => <>
  {cam([0, 3, 9], [1.5, 5.4, 6.5], [[0, 8, -16], [0, 9, -16]], d, [50, 44], 'inout', 0.04)}
  <Ground /><Moon /><Glow p={[0, 9, -16]} s={3} c="#bfe0ff" o={1} />
  {[0, 1, 2, 3, 4].map((i) => { const a = f * 0.05 + i * 1.26; return <Plane key={i} p={[Math.cos(a) * 4.2, 9 + Math.sin(a * 1.3) * 1.2, -16 + Math.sin(a) * 3]} f={f + i * 5} rot={-a} s={1.1} />; })}
</>}</Scene>; };
// 9 TWIST: control tower, blinds light, blank radar scopes, slam
S[9] = () => { const d = dur(9); return <Scene seed={10} flash={0.9} bg="radial-gradient(ellipse at 40% 40%, #232c36 0%, #07090c 70%)" density={0.04} ty={230} title={[{text: 'NO PILOT', at: 0, size: 112}, {text: 'REPORTED IT.', at: 5, red: true, size: 100}]}>{(f) => <>
  {cam([0.4, 1.7, 6.6], [0.2, 1.65, 4.6], [[0, 1.4, 0], [0, 1.4, 0]], d, [50, 38], 'out', 0.02, {shake: 0.1, shakeFrom: 0, shakeLen: 12})}
  <Tower f={f} />
  <Blinds position={[-3.2, 2.2, -1.6]} rotation={[0, Math.PI / 2, 0]} width={2.0} height={2.4} dir={[0.9, -0.3, 0.3]} length={7} opacity={0.5} frame={f} />
  <BlindsFloor position={[-0.6, 0.02, 0.2]} size={[2.6, 3.4]} rotation={Math.PI / 2 + 0.3} frame={f} opacity={0.3} />
  <Silhouette position={[1.8, 0, 2.2]} rotation={Math.PI + 0.4} pose="stand" scale={0.95} rim="#ffe2b0" rimK={1.4} rimSide={[-1, 0.4, 0]} phase={f * 0.1} />
  <Particles kind="dust" count={160} center={[-1, 1.5, 0.5]} area={[3.2, 2.6, 2.4]} frame={f} color="#ffe6c0" size={0.012} opacity={0.7} />
</>}</Scene>; };
// 10 commercial/private/air force: three radio handsets / phone swinging
const Phone = ({position, f = 0, amp = 0.3}) => <group position={position}><mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.01, 0.01, 1.8, 4]} /><meshBasicMaterial color="#0a0a0a" /></mesh><group position={[0, -0.0, 0]} rotation={[0, 0, Math.sin(f * 0.14) * amp]}><mesh position={[0, 0, 0]}><capsuleGeometry args={[0.05, 0.4, 4, 8]} /><meshStandardMaterial color="#08090b" /></mesh></group></group>;
S[10] = () => { const d = dur(10); return <Scene seed={11} bg="radial-gradient(ellipse at 50% 40%, #232c36 0%, #07090c 70%)" density={0.04} ty={230} title={[{text: 'COMMERCIAL.', at: 0, size: 80}, {text: 'PRIVATE.', at: 7, size: 84}, {text: 'AIR FORCE.', at: 14, red: true, size: 84}]}>{(f) => <>
  {cam([-0.6, 1.5, 6.4], [0.5, 1.7, 4.2], [[0, 1.5, 0], [0, 1.5, 0]], d, [50, 42], 'inout', 0.03)}
  <Tower f={f} /><Blinds position={[-3.2, 2.2, -1.6]} rotation={[0, Math.PI / 2, 0]} width={2.0} height={2.4} dir={[0.9, -0.3, 0.3]} length={7} opacity={0.4} frame={f} />
  {[-1.2, 0, 1.2].map((x, i) => <Glow key={i} p={[x, 2.5, 0.6]} s={0.5} c={f > 12 + i * 7 ? '#ff4a3a' : '#2a3a50'} o={0.9} />)}
  <Silhouette position={[0.9, 0, 2.4]} rotation={Math.PI + 0.2} pose="stand" scale={0.95} rim="#ffe2b0" rimK={1.4} rimSide={[-1, 0.4, 0.3]} phase={f * 0.1} />
</>}</Scene>; };
// 11 anything unusual: empty scope sweeping, dolly zoom
S[11] = () => { const d = dur(11); return <Scene seed={12} bg="radial-gradient(ellipse at 50% 50%, #0d2018 0%, #04080a 75%)" density={0.03} ty={230} title={[{text: 'NOTHING', at: 0, size: 110}, {text: 'UNUSUAL.', at: 6, red: true, size: 100}]}>{(f) => <>
  {cam([0, 1.4, 3.6], [0, 1.4, 1.9], [[0, 1.4, 0], [0, 1.4, 0]], d, [58, 34], 'inout', 0.02)}
  <Box p={[0, 3, -1]} s={[14, 6, 0.1]} c="#101418" /><Box p={[0, 1.4, 0]} s={[2.6, 2.6, 0.3]} c="#0c1013" metal={0.4} /><Lit p={[0, 1.4, 0.16]} s={[2.2, 2.2, 0.01]} c="#06130c" />
  {[0.3, 0.6, 0.9].map((r, i) => <mesh key={i} position={[0, 1.4, 0.17]}><ringGeometry args={[r - 0.008, r, 48]} /><meshBasicMaterial color="#2a8a5a" toneMapped={false} /></mesh>)}
  <mesh position={[0, 1.4, 0.18]} rotation={[0, 0, -f * 0.1]}><planeGeometry args={[2.0, 0.015]} /><meshBasicMaterial color="#7dffb0" toneMapped={false} transparent opacity={0.9} /></mesh>
  <Glow p={[0, 1.4, 0.9]} s={3} c="#7dffb0" o={0.12} />
</>}</Scene>; };
// 12 next day's paper: newspaper card slam over a dark desk
const Paper = ({f, d, head, x = 110, y = 700, w = 860, rot = -2}) => <div style={{position: 'absolute', left: x, top: y, width: w, padding: '34px 40px', background: 'rgba(232,226,210,0.96)', transform: `rotate(${rot}deg) scale(${0.94 + 0.06 * Math.min(1, f / 4) + 0.04 * f / d})`, opacity: Math.min(1, f / 4), boxShadow: '0 18px 50px rgba(0,0,0,0.85)'}}>
  <div style={{fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 50, color: '#1b1612', borderBottom: '3px double #1b1612', paddingBottom: 10}}>THE MORNING PAPER</div>
  <div style={{fontFamily: 'Special Elite', fontSize: 62, color: '#1b1612', lineHeight: 1.15, marginTop: 18}}>{head}</div>
  <div style={{height: 14, background: 'repeating-linear-gradient(#5a5448 0 3px,transparent 3px 14px)', marginTop: 20, opacity: 0.6}} /></div>;
S[12] = () => { const d = dur(12); return <Scene seed={13} flash={0.6} bg="radial-gradient(ellipse at 50% 30%, #2a2320  0%, #07080a 75%)" density={0.05} ty={230} title={[{text: 'NEXT DAY.', at: 0, size: 100}, {text: 'THE PAPER:', at: 6, red: true, size: 90}]}
  over={(f) => <Paper f={f} d={d} head="OBJECT PERHAPS BALLOON" />}>{(f) => <>
  {cam([0, 3.2, 6], [0, 2.9, 4.3], [[0, 2.6, 0], [0, 2.6, 0]], d, [46, 40], 'inout', 0.03)}
  <Box p={[0, 3, -2]} s={[14, 6, 0.1]} c="#14161b" /><HangingBulb position={[0.4, 5.2, 0]} cable={2.2} amp={0.3} period={60} frame={f} seed={4} />
  <Particles kind="dust" count={150} center={[0, 3, 1]} area={[4, 3, 3]} frame={f} color="#ffe6c0" size={0.012} opacity={0.7} />
</>}</Scene>; };
// 13 weather balloon released miles away: balloon rising in fog, found-footage drift
const Balloon = ({position, f = 0, s = 1}) => <group position={[position[0] + Math.sin(f * 0.04) * 0.5, position[1] + f * 0.02, position[2]]} scale={s}><mesh scale={[1, 1.15, 1]}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color="#d9c9a8" roughness={0.6} emissive="#4a3c24" emissiveIntensity={0.5} /></mesh><mesh position={[0, -1.6, 0]}><cylinderGeometry args={[0.01, 0.01, 1.2, 4]} /><meshBasicMaterial color="#222" /></mesh><Box p={[0, -2.3, 0]} s={[0.3, 0.22, 0.2]} c="#121212" /><Glow p={[0, 0, 0]} s={3.4} c="#ffd9a0" o={0.3} /></group>;
S[13] = () => { const d = dur(13); return <Scene seed={14} bg="linear-gradient(180deg,#1a2230 0%,#6a5a46 100%)" density={0.04} ty={230} title={[{text: 'WEATHER', at: 0, size: 100}, {text: 'BALLOON?', at: 6, red: true, size: 110}]}>{(f) => <>
  {cam([-3, 1.2, 8], [0.6, 3.6, 5.4], [[0, 6, -14], [0, 9, -14]], d, [50, 44], 'inout', 0.04)}
  <Oval /><Pines /><Moon /><FogWall position={[0, 3, -12]} width={34} height={8} frame={f} opacity={0.3} color="#c9b89a" />
  <Balloon position={[1.5, 5, -14]} f={f} s={1.3} />
</>}</Scene>; };
// 14 flattened grass: tilt-shift paddock, grass blades lying in a ring
const Grass = ({f = 0, rings = 1, r = 1.3}) => <>{Array.from({length: 70}, (_, i) => { const a = i / 70 * Math.PI * 2; const R = r * 0.9 + (i % 3) * 0.12; return <mesh key={i} position={[Math.cos(a) * R, 0.03, Math.sin(a) * R]} rotation={[0, -a, 0]}><boxGeometry args={[0.5, 0.02, 0.04]} /><meshStandardMaterial color="#6b8a4a" roughness={1} emissive="#1e2c14" emissiveIntensity={0.6} /></mesh>; })}</>;
const Paddock = ({f, z = 0}) => <><Ground color="#0b130d" />{Array.from({length: 140}, (_, i) => <mesh key={i} position={[(hash2(i, 1, 7) - 0.5) * 16, 0.18, (hash2(i, 2, 7) - 0.5) * 12 - 2]} rotation={[0, 0, (hash2(i, 3, 7) - 0.5) * 0.3 + Math.sin(f * 0.06 + i) * 0.05]}><boxGeometry args={[0.025, 0.36, 0.025]} /><meshStandardMaterial color="#2a3a22" /></mesh>)}<Moon /></>;
S[14] = () => { const d = dur(14); return <Scene seed={15} bg={BG_SKY} density={0.03} title={[{text: 'FLATTENED', at: 0, size: 90}, {text: 'GRASS.', at: 6, red: true, size: 110}]}>{(f) => <>
  {cam([0, 4.8, 5.4], [0, 3.2, 2.4], [[0, 0, 0], [0, 0, 0]], d, [48, 40], 'inout', 0.03)}
  <Paddock f={f} /><Grass f={f} /><Spot position={[-2, 4, 3]} target={[0, 0, 0]} angle={0.5} intensity={8} distance={9} color="#cfe0ff" />
  <Particles kind="dust" count={70} center={[0, 1.5, 0]} area={[5, 2, 5]} frame={f} color="#cfe0ff" size={0.014} opacity={0.5} />
</>}</Scene>; };
// 15 "but": the ring splits
S[15] = () => { const d = dur(15); return <Scene seed={16} bg={BG_SKY} density={0.03} title={[{text: 'BUT...', at: 0, size: 130, red: true}]}>{(f) => <>
  {cam([0, 5.6, 4.6], [0, 4.4, 2.8], [[0, 0, 0], [0, 0, 0]], d, [48, 40], 'out', 0.03)}
  <Paddock f={f} /><Grass f={f} r={1.3 + f * 0.01} />
  <Spot position={[-2, 4, 3]} target={[0, 0, 0]} angle={0.5} intensity={8} distance={9} color="#cfe0ff" />
</>}</Scene>; };
// 16 one circle or three: diorama with 1 -> 3 rings
S[16] = () => { const d = dur(16); return <Scene seed={17} bg={BG_SKY} density={0.03} ty={230} title={[{text: 'ONE CIRCLE', at: 0, size: 96}, {text: 'OR THREE?', at: loc(33.2, 16), red: true, size: 110}]}>{(f) => { const split = f > 24; return <>
  {cam([0, 8, 6], [0, 6.2, 3.4], [[0, 0, 0], [0, 0, 0]], d, [46, 40], 'inout', 0.03)}
  <Paddock f={f} />
  {!split ? <Grass f={f} r={1.6} /> : [-2.2, 0, 2.2].map((x, i) => <group key={i} position={[x, 0, i === 1 ? -0.6 : 0.8]} scale={0.55}><Grass f={f} r={1.3} /></group>)}
  <Spot position={[-2, 5, 3]} target={[0, 0, 0]} angle={0.6} intensity={9} distance={10} color="#cfe0ff" />
</>; }}</Scene>; };
// 17 Air force men search the field: torch silhouettes cross
S[17] = () => { const d = dur(17); return <Scene seed={18} bg="linear-gradient(180deg,#05080f 0%,#14202e 100%)" density={0.045} ty={230} title={[{text: 'AIR FORCE', at: 0, size: 96}, {text: 'SEARCHES.', at: 6, red: true, size: 100}]}>{(f) => <>
  {cam([3.2, 1.6, 8], [1.2, 1.7, 5.6], [[-1, 1, -4], [0, 1, -4]], d, [50, 42], 'inout', 0.03)}
  <Paddock f={f} />{[0, 1, 2].map((i) => { const x = -4 + i * 2.2 + f * 0.04; const z = -2 - i * 0.8; return <group key={i}><Silhouette position={[x, 0, z]} rotation={Math.PI / 2 - 0.2} pose="walk" phase={f * 0.2 + i * 2} rim={SILV} rimK={1.5} rimSide={[0, 0.4, -1]} scale={0.9} /><Spot position={[x + 0.3, 1.2, z]} target={[x + 3, 0, z + 0.5]} angle={0.4} intensity={9} distance={8} color="#fff2d2" /><Glow p={[x + 0.4, 1.2, z]} s={0.8} c="#fff2d2" o={0.8} /></group>; })}
  <FogWall position={[0, 1.2, -8]} width={20} height={4} frame={f} opacity={0.25} color="#9fb2cc" />
</>}</Scene>; };
// 18 find nothing: empty paddock, torch beam sweeps empty ground
S[18] = () => { const d = dur(18); return <Scene seed={19} bg="linear-gradient(180deg,#05080f 0%,#14202e 100%)" density={0.045} ty={230} title={[{text: 'FIND', at: 0, size: 100}, {text: 'NOTHING.', at: 5, red: true, size: 120}]}>{(f) => <>
  {cam([0, 1.8, 7], [0, 1.6, 4.8], [[0, 0.2, -2], [0, 0.2, -2]], d, [48, 40], 'inout', 0.03)}
  <Paddock f={f} /><Silhouette position={[-1.4, 0, 1.0]} rotation={Math.PI - 0.3} pose="stand" rim={SILV} rimK={1.5} rimSide={[0.6, 0.4, -1]} phase={f * 0.1} />
  <Spot position={[-1.2, 1.3, 1.1]} target={[Math.sin(f * 0.08) * 2.4, 0, -3]} angle={0.35} intensity={12} distance={10} color="#fff2d2" />
</>}</Scene>; };
// 19 landowner burns the grass: fire wall
const Flame = ({position, f = 0, s = 1, seed = 1}) => <group position={position} scale={s}>{[0, 1, 2].map((i) => <mesh key={i} position={[(i - 1) * 0.22, 0.4 + 0.05 * Math.sin(f * 0.4 + i + seed), 0]} scale={[0.5 + 0.1 * Math.sin(f * 0.5 + i), 1.1 + 0.4 * hash2(Math.floor(f / 2), i, seed), 0.5]}><coneGeometry args={[0.35, 1.0, 5]} /><meshBasicMaterial color={i === 1 ? '#ffcf6a' : '#ff7a2a'} toneMapped={false} transparent opacity={0.9} /></mesh>)}<Glow p={[0, 0.7, 0.4]} s={2.6} c="#ff9a4a" o={0.55} /></group>;
S[19] = () => { const d = dur(19); return <Scene seed={20} flash={0.5} bg="linear-gradient(180deg,#0a0806 0%,#2a1408 100%)" density={0.05} ty={230} title={[{text: 'THE LANDOWNER', at: 0, size: 74}, {text: 'BURNS IT.', at: 8, red: true, size: 110}]}>{(f) => <>
  {cam([0, 1.6, 7.6], [0, 1.9, 5.4], [[0, 0.8, -2], [0, 0.8, -2]], d, [50, 42], 'inout', 0.03)}
  <Paddock f={f} />{Array.from({length: 11}, (_, i) => <Flame key={i} position={[-5 + i, 0, -1.5 - (i % 2) * 0.6]} f={f + i * 3} s={0.8 + 0.5 * Math.min(1, f / 30) * hash2(i, 4, 2)} seed={i} />)}
  <pointLight position={[0, 1.5, -1]} intensity={4} distance={12} decay={1.4} color="#ff8a3a" />
  <Particles kind="dust" count={120} center={[0, 2, -2]} area={[10, 4, 3]} frame={f} color="#ffb060" size={0.016} opacity={0.8} />
</>}</Scene>; };
// 20 skeptics say one plane towed: plane through light cone
const Drogue = ({position, f = 0}) => <group position={position}><mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.5, 2.2, 14, 1, true]} /><meshStandardMaterial color="#d8e2ee" emissive="#d8e2ee" emissiveIntensity={0.5} side={THREE.DoubleSide} /></mesh><Glow p={[0, 0, 0]} s={2.4} c={SILV} o={0.4} /></group>;
S[20] = () => { const d = dur(20); return <Scene seed={21} bg="linear-gradient(180deg,#05080f 0%,#1c2a40 100%)" density={0.025} title={[{text: 'SKEPTICS SAY:', at: 0, size: 76}, {text: 'ONE PLANE.', at: 8, red: true, size: 100}]}>{(f) => <>
  {cam([-3, 4.2, 9], [1, 5.4, 6.4], [[0, 7, -14], [1, 7, -14]], d, [50, 44], 'inout', 0.03)}
  <Ground /><Moon /><Plane p={[-7 + f * 0.16, 7.5, -14]} f={f} rot={Math.PI / 2} s={1.6} />
</>}</Scene>; };
// 21 towed a target drogue: plane + sleeve in light cone
S[21] = () => { const d = dur(21); return <Scene seed={22} bg="linear-gradient(180deg,#05080f 0%,#1c2a40 100%)" density={0.025} title={[{text: 'TARGET', at: 0, size: 100}, {text: 'DROGUE.', at: 6, red: true, size: 110}]}>{(f) => <>
  {cam([2, 4.8, 8], [0.4, 6.2, 5.6], [[0, 7.5, -14], [0, 7.5, -14]], d, [48, 40], 'inout', 0.03)}
  <Ground /><Moon /><Plane p={[-1.8, 7.5, -14]} f={f} rot={Math.PI / 2} s={1.8} /><Drogue position={[1.9 + Math.sin(f * 0.1) * 0.15, 7.5 + Math.sin(f * 0.13) * 0.1, -14]} f={f} />
  <mesh position={[0, 7.5, -14]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 3.4, 4]} /><meshBasicMaterial color="#cfd8e2" /></mesh>
  <Sp position={[-3, 11, -10]} target={[0, 7.5, -14]} angle={0.5} intensity={12} distance={14} color="#fff2d2" />
</>}</Scene>; };
// 22 no record of exercise: records room, empty filing drawer, slam
S[22] = () => { const d = dur(22); return <Scene seed={23} bg="radial-gradient(ellipse at 50% 40%, #232c36 0%, #07090c 70%)" density={0.045} ty={230} title={[{text: 'NO RECORD', at: 0, size: 100}, {text: 'OF AN EXERCISE.', at: 6, red: true, size: 80}]}>{(f) => <>
  {cam([0.8, 1.7, 6.4], [0.2, 1.7, 4.0], [[0, 1.6, 0], [0, 1.6, 0]], d, [50, 42], 'inout', 0.03)}
  <Box p={[0, 3, -1]} s={[14, 6, 0.1]} c="#12161b" /><Ground color="#0c0f13" />
  {[-1.8, -0.6, 0.6, 1.8].map((x, i) => <group key={i}><Box p={[x, 1.3, -0.4]} s={[1.0, 2.6, 0.7]} c="#0e1115" metal={0.4} />{[0, 1, 2, 3].map((j) => <Lit key={j} p={[x, 0.45 + j * 0.62, -0.03]} s={[0.8, 0.02, 0.01]} c="#1c242e" />)}</group>)}
  <mesh position={[0.6, 1.5, 0.2]}><boxGeometry args={[0.92, 0.5, 0.7]} /><meshStandardMaterial color="#090b0e" /></mesh><Lit p={[0.6, 1.5, 0.56]} s={[0.8, 0.38, 0.01]} c="#02030a" />
  <Silhouette position={[-0.9, 0, 2.2]} rotation={Math.PI - 0.3} pose="stand" hat rim="#ffe2b0" rimK={1.4} rimSide={[1, 0.4, 0]} phase={f * 0.1} />
  <Sp position={[-1, 3, 2.5]} target={[0.6, 1.4, 0]} angle={0.45} intensity={9} distance={8} />
</>}</Scene>; };
// 23 REVEAL: split amber/blue sky, balloon+drogue vs disc
S[23] = () => { const d = dur(23); return <Scene seed={24} flash={0.9} bg="linear-gradient(90deg,#3a2a14 0%,#3a2a14 49.5%,#000 49.5%,#000 50.5%,#14243a 50.5%,#14243a 100%)" density={0.02} ty={230} title={[{text: 'BALLOON?', at: 0, size: 96}, {text: 'OR DISC?', at: 10, red: true, size: 96}]}>{(f) => <>
  {cam([0, 3.4, 12], [0, 3.8, 9.4], [[0, 5, -14], [0, 5, -14]], d, [52, 46], 'inout', 0.03)}
  <Ground /><Balloon position={[-3.6, 3.2, -14]} f={f} s={1.2} /><Plane p={[-3.6, 6.8, -14]} f={f} rot={Math.PI / 2} s={1.0} /><Disc position={[3.6, 5.4, -14]} s={2.6} f={f} />
</>}</Scene>; };
// 24 drogue or: drogue close
S[24] = () => { const d = dur(24); return <Scene seed={25} bg="linear-gradient(180deg,#05080f 0%,#1c2a40 100%)" density={0.02} ty={230} title={[{text: 'DROGUE...', at: 0, size: 110}]}>{(f) => <>
  {cam([2.4, 7.4, 6], [0.6, 7.6, 4.2], [[0, 7.5, -14], [0, 7.5, -14]], d, [48, 42], 'in', 0.03)}
  <Ground /><Moon /><Drogue position={[0, 7.5, -14]} f={f} />
</>}</Scene>; };
// 25 or silver disc behind their: disc rises over the pines
S[25] = () => { const d = dur(25); return <Scene seed={26} bg={BG_SKY} density={0.025} ty={230} title={[{text: 'OR A', at: 0, size: 90}, {text: 'SILVER DISC...', at: 6, red: true, size: 90}]}>{(f) => <>
  {cam([0, 1.6, 8], [0, 2.0, 5.6], [[0, 5, -18], [0, 5, -18]], d, [50, 44], 'inout', 0.03)}
  <Fld f={f} kids={5} z={3} /><Disc position={[0, 3.5 + f * 0.05, -18]} s={5.5} f={f} />
</>}</Scene>; };
// 26 END = frame 0's set: camera ends on the frame-0 pose
S[26] = () => { const d = dur(26); return <Scene seed={27} bg={BG_SKY} density={0.025} title={[{text: 'BEHIND THEIR', at: 0, size: 80}, {text: 'SCHOOL?', at: 6, red: true, size: 110}]}>{(f) => <>
  {cam([0.0, 2.2, 4.4], [0.6, 1.5, 9], [[0, 5.5, -20], [0, 6, -20]], d, [40, 46], 'inout', 0.0)}
  <Fld f={f} kids={6} raise z={2.5} /><Disc position={[0, 7.2, -18]} s={6.5} f={f} />
</>}</Scene>; };

export const WS = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><NoirFonts />
    {S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? WS_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 0 && <Dip inFrames={3} color="#040506" />}</Sequence>; })}
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
