// "Officer Saw It Lift Off" (Socorro, New Mexico, April 1964) - PAPERCUT look (remotion/src/papercut), 28 scenes on cues.json cuts.
// Styles (logged in STYLE_ROTATION.csv): face-closeup (scene 8, fear reaction on narration), particle-figure (scene 14, the two figures in white).
// Facts on screen come from sources.txt only (CIA story, UAP Codex / Blue Book case 8766). Body copy is never invented. No faces on paper figures.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {ShotCam, WordCaption, FontFaces, Dip, Particles, LightCone, FaceCloseUp, ParticleFigure} from '../../kit/index.js';
import {NoirFonts} from '../../../noir/NoirKit.jsx';
import {PAPER, usePaperFonts, usePaperImages, CutLayer, Note, Pin, Board, PaperStage, PaperFinish, PaperTitle, PaperGlow, tear} from '../../../papercut/PaperKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const SOC_FRAMES = Math.round(48.7 * FPS);
const W = VO.words;
const CS = [0.0, 1.22, 2.56, 4.28, 5.45, 7.36, 9.4, 11.54, 12.72, 14.26, 15.4, 17.54, 19.27, 21.3, 22.42, 24.64, 25.86, 27.02, 28.98, 30.0, 32.42, 34.7, 37.02, 39.31, 41.14, 43.4, 44.94, 46.48];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? SOC_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

// ---------- shapes (named functions so the texture cache keys differ) ----------
const P = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const mesaShape = (g, w, h, r) => { const pts = [[0, h]]; let x = 0; const step = w / 9;
  for (let i = 0; i < 9; i++) { const top = h * (0.18 + r() * 0.5); pts.push([x + step * 0.08, h * 0.75], [x + step * 0.14, top], [x + step * 0.86, top + (r() - 0.5) * 6], [x + step * 0.94, h * 0.75]); x += step; }
  pts.push([w, h]); P(g, tear(pts, 9, 2.5, 12)); };
const eggShape = (g, w, h) => { const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * 6.2832; const sy = Math.sin(a) > 0 ? 1 : 0.88; pts.push([w / 2 + Math.cos(a) * w * 0.46, h / 2 + Math.sin(a) * h * 0.47 * sy]); } P(g, tear(pts, 4, 1.8, 10)); };
const eggDet = function eggDet(g, w, h) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(w * 0.34, h * 0.34, w * 0.07, h * 0.2, 0.35, 0, 6.28); g.fill();
  g.fillStyle = 'rgba(40,52,70,0.45)'; g.fillRect(0, h * 0.62, w, h * 0.05); g.fillRect(0, h * 0.74, w, h * 0.03); };
const legsShape = (g, w, h) => { g.lineCap = 'round'; g.lineWidth = w * 0.07; g.beginPath(); g.moveTo(w * 0.36, 0); g.lineTo(w * 0.14, h * 0.94); g.moveTo(w * 0.64, 0); g.lineTo(w * 0.86, h * 0.94); g.stroke();
  g.lineWidth = w * 0.1; g.beginPath(); g.moveTo(w * 0.06, h * 0.97); g.lineTo(w * 0.24, h * 0.97); g.moveTo(w * 0.76, h * 0.97); g.lineTo(w * 0.94, h * 0.97); g.stroke(); };
const flameShape = (g, w, h, r) => { for (let i = 0; i < 3; i++) { const x = w * (0.28 + i * 0.22), bw = w * 0.16, th = 0.6 + r() * 0.4, lean = (r() - 0.5) * w * 0.1; g.beginPath(); g.moveTo(x - bw, 0); g.quadraticCurveTo(x - bw, h * 0.5, x + lean, h * th); g.quadraticCurveTo(x + bw, h * 0.5, x + bw, 0); g.fill(); } };
const carShape = (g, w, h) => { P(g, tear([[w * 0.02, h * 0.74], [w * 0.04, h * 0.5], [w * 0.28, h * 0.46], [w * 0.38, h * 0.18], [w * 0.68, h * 0.18], [w * 0.78, h * 0.46], [w * 0.97, h * 0.52], [w * 0.98, h * 0.74]], 7, 1.2, 8));
  g.beginPath(); g.arc(w * 0.22, h * 0.76, h * 0.17, 0, 6.28); g.fill(); g.beginPath(); g.arc(w * 0.78, h * 0.76, h * 0.17, 0, 6.28); g.fill(); g.fillRect(w * 0.47, h * 0.08, w * 0.12, h * 0.1); };
const carDet = function carDet(g, w, h) { g.fillStyle = '#9db8cf'; P(g, [[w * 0.4, h * 0.22], [w * 0.66, h * 0.22], [w * 0.74, h * 0.44], [w * 0.31, h * 0.44]]); g.fillStyle = '#f2ead4'; g.fillRect(w * 0.3, h * 0.5, w * 0.45, h * 0.12);
  g.fillStyle = '#ff4a3a'; g.fillRect(w * 0.47, h * 0.08, w * 0.06, h * 0.1); g.fillStyle = '#4a7aff'; g.fillRect(w * 0.53, h * 0.08, w * 0.06, h * 0.1); g.fillStyle = '#ffe9a0'; g.fillRect(w * 0.94, h * 0.54, w * 0.05, h * 0.1);
  g.fillStyle = '#1a1a22'; g.beginPath(); g.arc(w * 0.22, h * 0.76, h * 0.07, 0, 6.28); g.fill(); g.beginPath(); g.arc(w * 0.78, h * 0.76, h * 0.07, 0, 6.28); g.fill(); };
const scrubShape = (g, w, h, r) => { const n = Math.floor(w / 70); for (let i = 0; i < n; i++) { const x = (i + 0.3 + r() * 0.5) / n * w, bh = h * (0.4 + r() * 0.55), bw = 24 + r() * 40;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + (r() - 0.5) * bw, h - bh * (0.25 + r() * 0.5), bw * (0.5 + r() * 0.4), bh * (0.22 + r() * 0.2), 0, 0, 6.28); g.fill(); } g.fillRect(x - 2, h - bh * 0.4, 4, bh * 0.4); } g.fillRect(0, h * 0.94, w, h * 0.06); };
const shackShape = (g, w, h) => { P(g, tear([[w * 0.06, h], [w * 0.06, h * 0.36], [w * 0.5, h * 0.06], [w * 0.94, h * 0.36], [w * 0.94, h]], 5, 1.5, 9)); };
const shackDet = function shackDet(g, w, h) { g.fillStyle = '#2a1a10'; g.fillRect(w * 0.4, h * 0.56, w * 0.2, h * 0.44); g.fillStyle = '#d8c49a'; g.font = `${Math.round(h * 0.13)}px "Special Elite"`; g.textAlign = 'center'; g.fillText('DYNAMITE', w / 2, h * 0.5); };
const ringShape = (g, w, h) => { g.lineWidth = w * 0.04; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.46, h * 0.44, 0, 0, 6.28); g.stroke(); };
const dentsShape = (g, w, h) => { [[0.2, 0.3], [0.78, 0.26], [0.84, 0.74], [0.16, 0.7]].forEach(([x, y]) => { g.beginPath(); g.ellipse(w * x, h * y, w * 0.1, h * 0.09, 0, 0, 6.28); g.fill(); }); };
const dentRim = function dentRim(g, w, h) { g.fillStyle = 'rgba(20,10,4,0.6)'; [[0.2, 0.3], [0.78, 0.26], [0.84, 0.74], [0.16, 0.7]].forEach(([x, y]) => { g.beginPath(); g.ellipse(w * x, h * y + h * 0.02, w * 0.075, h * 0.06, 0, 0, 6.28); g.fill(); }); };
const handShape = (g, w, h) => { P(g, tear([[w * 0.1, h * 0.55], [w * 0.2, h * 0.5], [w * 0.25, h * 0.1], [w * 0.33, h * 0.1], [w * 0.36, h * 0.42], [w * 0.42, h * 0.02], [w * 0.5, h * 0.02], [w * 0.52, h * 0.42], [w * 0.58, h * 0.08], [w * 0.66, h * 0.1], [w * 0.64, h * 0.5], [w * 0.74, h * 0.2], [w * 0.8, h * 0.24], [w * 0.74, h * 0.7], [w * 0.5, h * 0.98], [w * 0.2, h * 0.9]], 5, 1, 6)); };
const gaugeShape = (g, w, h) => { g.beginPath(); g.arc(w / 2, h * 0.9, w * 0.46, Math.PI, 0); g.closePath(); g.fill(); g.fillRect(w * 0.04, h * 0.88, w * 0.92, h * 0.12); };
const gaugeDet = function gaugeDet(g, w, h) { g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(w / 2, h * 0.9, w * 0.42, Math.PI, 0); g.closePath(); g.fill(); g.strokeStyle = '#26211a'; g.lineWidth = 5;
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * w * 0.34, h * 0.9 + Math.sin(a) * w * 0.34); g.lineTo(w / 2 + Math.cos(a) * w * 0.4, h * 0.9 + Math.sin(a) * w * 0.4); g.stroke(); }
  g.fillStyle = '#c8372d'; g.beginPath(); g.arc(w / 2, h * 0.9, w * 0.42, Math.PI * 1.55, Math.PI * 2); g.lineTo(w / 2, h * 0.9); g.fill(); g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(w / 2, h * 0.9, w * 0.3, Math.PI, 0); g.fill();
  g.strokeStyle = '#26211a'; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * w * 0.3, h * 0.9 + Math.sin(a) * w * 0.3); g.lineTo(w / 2 + Math.cos(a) * w * 0.34, h * 0.9 + Math.sin(a) * w * 0.34); g.stroke(); } };
const needleShape = (g, w, h) => { P(g, [[w * 0.46, h], [w * 0.5, 0], [w * 0.54, h]]); };
const folderShape = (g, w, h) => { P(g, tear([[w * 0.03, h * 0.97], [w * 0.03, h * 0.08], [w * 0.36, h * 0.08], [w * 0.4, 0.0], [w * 0.62, 0.0], [w * 0.66, h * 0.08], [w * 0.97, h * 0.08], [w * 0.97, h * 0.97]], 6, 2, 10)); };
const folderDet = function folderDet(g, w, h) { g.fillStyle = '#26211a'; g.textAlign = 'center'; g.font = `${Math.round(h * 0.085)}px "Special Elite"`; g.fillText('PROJECT BLUE BOOK', w / 2, h * 0.3); g.font = `${Math.round(h * 0.06)}px "Special Elite"`; g.fillText('CASE 8766', w / 2, h * 0.4);
  g.fillStyle = 'rgba(40,36,30,0.5)'; for (let y = h * 0.5; y < h * 0.9; y += h * 0.07) g.fillRect(w * 0.12, y, w * 0.76 * (0.7 + ((y * 7) % 3) / 10), h * 0.022); };
const stampShape = (g, w, h) => { g.lineWidth = h * 0.07; g.strokeStyle = '#000'; g.strokeRect(w * 0.04, h * 0.08, w * 0.92, h * 0.84); g.fillStyle = '#000'; g.font = `${Math.round(h * 0.52)}px "Lilita One"`; g.textAlign = 'center'; g.fillText('UNKNOWN', w / 2, h * 0.7); };
const collegeShape = (g, w, h) => { g.fillRect(w * 0.08, h * 0.42, w * 0.84, h * 0.5); P(g, [[w * 0.04, h * 0.42], [w * 0.5, h * 0.08], [w * 0.96, h * 0.42]]); g.fillRect(w * 0.02, h * 0.92, w * 0.96, h * 0.08); g.fillRect(w * 0.44, h * 0.0, w * 0.12, h * 0.1); };
const collegeDet = function collegeDet(g, w, h) { g.fillStyle = '#ead9b0'; for (let i = 0; i < 7; i++) g.fillRect(w * (0.12 + i * 0.12), h * 0.46, w * 0.05, h * 0.44); g.fillStyle = '#e9c97a'; [0.2, 0.5, 0.8].forEach((x) => g.fillRect(w * x - w * 0.03, h * 0.25, w * 0.06, h * 0.08)); };
const qmarkShape = (g, w, h) => { g.font = `${Math.round(h * 1.0)}px "DM Serif Display"`; g.textAlign = 'center'; g.fillText('?', w / 2, h * 0.9); };
const crossShape = (g, w, h) => { g.lineCap = 'round'; g.lineWidth = w * 0.14; g.beginPath(); g.moveTo(w * 0.15, h * 0.15); g.lineTo(w * 0.85, h * 0.85); g.moveTo(w * 0.85, h * 0.15); g.lineTo(w * 0.15, h * 0.85); g.stroke(); };
const gullyShape = (g, w, h, r) => P(g, tear([[0, 0], [w, 0], [w * 0.8, h * 0.72], [w * 0.62, h], [w * 0.38, h], [w * 0.2, h * 0.72]], 12, 3, 10));
const personShape = (g, w, h) => { g.beginPath(); g.arc(w / 2, h * 0.11, w * 0.15, 0, 6.28); g.fill(); P(g, tear([[w * 0.28, h * 0.22], [w * 0.72, h * 0.22], [w * 0.8, h * 0.58], [w * 0.66, h * 0.6], [w * 0.64, h], [w * 0.52, h], [w * 0.5, h * 0.66], [w * 0.48, h], [w * 0.36, h], [w * 0.34, h * 0.6], [w * 0.2, h * 0.58]], 5, 1.2, 7)); };
const hatDet = function hatDet(g, w, h) { g.fillStyle = '#1a1a22'; g.fillRect(w * 0.3, h * 0.02, w * 0.4, h * 0.05); g.fillRect(w * 0.36, h * -0.02, w * 0.28, h * 0.06); };
const streakShape = (g, w, h) => { P(g, [[0, h * 0.5], [w * 0.96, h * 0.1], [w, h * 0.5], [w * 0.96, h * 0.9]]); };

// ---------- shared pieces ----------
const AFT = 'linear-gradient(180deg,#34456e 0%,#b87a78 52%,#f4b878 100%)';
const DUSK = 'linear-gradient(180deg,#1d2448 0%,#6a4a6a 50%,#e0905a 100%)';
const NIGHT = 'linear-gradient(180deg,#0e1430 0%,#2a2a50 60%,#5a3a50 100%)';
const KEY = {keyColor: '#ffd9a8', ambientColor: '#b9a9d0', ambient: 0.55, keyI: 2.5};
const TONE = {aft: {far: '#8a6478', mid: '#a8705e', near: '#c28458', sand: '#d2a064', dark: '#8a5a44', scrub: '#5a6a44'}, dusk: {far: '#4a3a62', mid: '#6a4660', near: '#8a5058', sand: '#a8684c', dark: '#5a3640', scrub: '#3a4838'}};
const Land = ({f, t = 'aft', scrub = true, sun = true}) => { const c = TONE[t]; return <>
  {sun && <><PaperGlow position={[-2.5, 3.6, -16]} size={11} color="#ffd08a" opacity={0.6} /><CutLayer shape="moon" size={[3.4, 3.4]} px={[512, 512]} position={[-2.5, 3.6, -15.8]} color="#ffe3a0" emissive={0.7} seed={3} frame={f} bob={0.04} castShadow={false} receiveShadow={false} /></>}
  <CutLayer shape={mesaShape} size={[34, 5]} px={[1700, 250]} position={[-1, 3.0, -14]} color={c.far} seed={41} frame={f} />
  <CutLayer shape="ridge" opts={{base: 0.5, amp: 0.4, freq: 3}} size={[40, 5]} px={[1600, 200]} position={[0, 2.0, -11]} color={c.mid} seed={42} frame={f} />
  <CutLayer shape={mesaShape} size={[34, 3.6]} px={[1700, 180]} position={[2, 1.6, -8.5]} color={c.near} seed={43} frame={f} />
  <CutLayer shape="rect" opts={{margin: 0, amp: 0}} size={[44, 9]} px={[256, 64]} position={[0, -2.1, -6]} color={c.sand} edge={0} seed={44} frame={f} castShadow={false} />
  {scrub && <CutLayer shape={scrubShape} size={[12, 1.3]} px={[960, 104]} position={[-1.5, 2.45, -5.6]} color={c.scrub} seed={45} frame={f} />}
</>; };
const Scene = ({bg = AFT, kp, kt = [0, 2, -4], title, ks, children, seed = 1, vignette = 0.6, leak = true, flash = 0, ...rest}) => {
  const f = useCurrentFrame();
  return <PaperStage bg={bg} keyPos={kp || [-6, 10, 10]} keyTarget={kt} {...KEY} {...rest} overlay={<>
    {title && <PaperTitle y={ks || 250} lines={title} />}
    <PaperFinish seed={seed} vignette={vignette} leak={leak} />
    {flash > 0 && f < 5 && <AbsoluteFill style={{background: '#fff', opacity: flash * (1 - f / 5)}} />}
  </>}>{typeof children === 'function' ? children(f) : children}</PaperStage>;
};
const cam = (from, to, look, d, fov = [40, 36], ease = 'inout', drift = 0.03) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={Math.max(2, d - 1)} ease={ease} drift={drift} />;
// the egg-shaped object. local origin = foot pads; legs 0..1.7, body centre 3.0; flame hangs under the body. lift raises body+flame off the legs.
const Egg = ({f, x = 0, y = 0, z = -4.5, s = 1, lift = 0, flame = 0, legs = true, seed = 1, tilt = 0}) => <group position={[x, y, z]} scale={s} rotation={[0, 0, tilt]}>
  {legs && <CutLayer shape={legsShape} size={[2.2, 1.9]} px={[330, 285]} position={[0, 0.95 + lift * 0.15, -0.08]} color="#7e8890" seed={seed + 1} frame={f} />}
  <CutLayer shape={eggShape} size={[2.3, 3.1]} px={[368, 496]} position={[0, 3.1 + lift, 0]} color="#cfd8de" details={eggDet} seed={seed + 2} frame={f} bob={0.04} speed={1.2} />
  {flame > 0 && <>
    <CutLayer shape={flameShape} size={[2.4, 3.4 * flame]} px={[256, 300]} position={[0, 1.3 + lift - 0.35 * flame, 0.1]} rotation={[0, 0, Math.PI]} color="#4aa8ff" emissive={0.9} seed={seed + 3} frame={f} bob={0.1} speed={1.7} castShadow={false} />
    <CutLayer shape={flameShape} size={[1.6, 2.4 * flame]} px={[200, 220]} position={[0, 1.7 + lift - 0.2 * flame, 0.2]} rotation={[0, 0, Math.PI]} color="#ffb040" emissive={0.9} seed={seed + 4} frame={f} bob={0.12} speed={2.1} castShadow={false} />
    <PaperGlow position={[0, 1.6 + lift, 0.4]} size={7} color="#7ac0ff" opacity={0.5} />
  </>}
</group>;
const Car = ({f, x = 0, y = 0, z = -3.5, s = 1, flip = false, seed = 1, body = '#1d2a4a'}) => <group position={[x, y, z]} scale={[s * (flip ? -1 : 1), s, s]}>
  <CutLayer shape={carShape} size={[3.6, 1.5]} px={[540, 225]} position={[0, 0.75, 0]} color={body} details={carDet} seed={seed + 1} frame={f} bob={0.03} speed={1.4} />
</group>;
const Dust = ({f, x, y, z, n = 3, dir = -1}) => <>{Array.from({length: n}, (_, k) => <CutLayer key={k} shape="cloud" size={[1.6 + k * 0.5, 0.7 + k * 0.2]} px={[320, 140]} position={[x + dir * (0.7 + k * 0.9), y + 0.2 + k * 0.18, z - 0.1 - k * 0.05]} color="#d8b890" opacity={0.7} seed={70 + k} frame={f} bob={0.05} drift={[dir * 0.5, 0.1]} castShadow={false} />)}</>;
const Gully = ({f, x = 0, z = -5.1, w = 7, h = 2.6, y = 1.5}) => <CutLayer shape={gullyShape} size={[w, h]} px={[Math.round(w * 90), Math.round(h * 90)]} position={[x, y, z]} color="#4a2c30" seed={51} frame={f} />;
const Person = ({f, x, y, z, s = 1, color = '#1a1c2c', seed = 80, hat = false, bob = 0.03}) => <CutLayer shape={personShape} size={[0.9 * s, 2.0 * s]} px={[120, 260]} position={[x, y, z]} color={color} details={hat ? hatDet : undefined} seed={seed} frame={f} bob={bob} boil={0.01} />;

const S = [];
const POSE0 = {from: [1.4, 3.6, 13.4], to: [0.2, 4.0, 8.6], look: [[0, 4.0, -4.5], [0, 4.4, -4.5]]};
// 0 FRAME 0: egg lifting out of the gully with a flame cone, scorched bushes, patrol car on the ridge; fastest push from frame 0
S[0] = () => { const d = dur(0); return <Scene seed={1} title={[{text: 'OFFICER SAW', at: 0, size: 86}, {text: 'IT LIFT OFF', at: 8, red: true, size: 86}]}>{(f) => <>
  {cam(POSE0.from, POSE0.to, POSE0.look, d, [44, 36], 'out', 0.02)}<Land f={f} /><Gully f={f} />
  <Car f={f} x={-2.6} y={2.2} z={-7.2} s={0.55} seed={5} />
  <Egg f={f} y={1.5} lift={0.9} flame={1} />
  <CutLayer shape={scrubShape} size={[3.4, 1.0]} px={[340, 100]} position={[2.6, 2.2, -4.0]} color="#1a1210" seed={91} frame={f} />
  <CutLayer shape={scrubShape} size={[3.0, 0.9]} px={[300, 90]} position={[-2.7, 2.1, -4.0]} color="#1a1210" seed={92} frame={f} />
  <Particles kind="embers" count={60} center={[0, 3, -3]} area={[4, 6, 3]} frame={f} /></>}</Scene>; };
// 1 close on the egg lifting higher
S[1] = () => { const d = dur(1); return <Scene seed={2} title={[{text: 'OFFICER SAW', at: -30, size: 86}, {text: 'IT LIFT OFF', at: -30, red: true, size: 86}]}>{(f) => <>
  {cam([-0.6, 3.2, 10.8], [0.4, 4.8, 8.2], [[0, 4.2, -4.5], [0, 5.2, -4.5]], d, [40, 36], 'inout')}<Land f={f} /><Gully f={f} />
  <Egg f={f} y={1.5} lift={1.6 + (f / d) * 1.2} flame={1.1} />
  <Particles kind="embers" count={60} center={[0, 3, -3]} area={[4, 6, 3]} frame={f} /></>}</Scene>; };
// 2 burned bushes left behind, still glowing
S[2] = () => { const d = dur(2); return <Scene seed={3} bg={DUSK} title={[{text: 'BURNED', at: loc(3.52, 2), size: 90}, {text: 'BUSHES.', at: loc(3.92, 2), red: true, size: 90}]}>{(f) => <>
  {cam([-2.2, 2.6, 9.6], [0.6, 2.7, 7.0], [[0, 2.6, -4.5], [0.4, 2.6, -4.5]], d, [42, 36])}<Land f={f} t="dusk" sun={false} />
  <CutLayer shape={scrubShape} size={[8.4, 2.6]} px={[900, 280]} position={[0, 2.5, -4.2]} color="#17110e" seed={95} frame={f} />
  {[[-2.2, 2.3], [-0.3, 2.1], [1.7, 2.3]].map(([x, y], i) => <PaperGlow key={i} position={[x, y, -3.9]} size={2.4} color="#ff7a2a" opacity={0.55} />)}
  <Particles kind="embers" count={70} center={[0, 2.8, -3.5]} area={[7, 3, 2]} frame={f} /></>}</Scene>; };
// 3 wide New Mexico desert, patrol car crossing small
S[3] = () => { const d = dur(3); return <Scene seed={4} title={[{text: 'APRIL 1964', at: loc(5.45, 3), size: 80}]}>{(f) => <>
  {cam([-2.5, 2.8, 14], [2.0, 3.0, 11], [[-1, 2.8, -6], [1, 2.8, -6]], d, [44, 40])}<Land f={f} />
  <Car f={f} x={interpolate(f, [0, d], [-4, -1])} y={2.0} z={-6.6} s={0.6} seed={6} /></>}</Scene>; };
// 4 date note over the desert
S[4] = () => { const d = dur(4); return <Scene seed={5} bg={AFT} title={[{text: 'APRIL 1964', at: 0, size: 86}]} ks={230}>{(f) => <>
  {cam([0.4, 3.0, 11.5], [0, 3.0, 9.2], [[0, 3, -6], [0, 3, -6]], d, [42, 38])}<Land f={f} />
  <group position={[0.1, 3.4, 0.2]} rotation={[0, 0, -0.04]}><Note lines={['APRIL', '1964']} size={[3.6, 2.0]} color="#f2e7c8" seed={5} /></group><Pin position={[0.1, 4.7, 0.3]} /></>}</Scene>; };
// 5 Socorro: small adobe town silhouette, a few lit windows
S[5] = () => { const d = dur(5); return <Scene seed={6} bg={DUSK} title={[{text: 'SOCORRO,', at: loc(7.36, 5), size: 84}, {text: 'NEW MEXICO', at: loc(8.18, 5), red: true, size: 74}]}>{(f) => <>
  {cam([2.6, 2.6, 13], [-0.8, 2.8, 9.6], [[0, 2.8, -5], [-0.8, 2.8, -5]], d, [44, 38])}<Land f={f} t="dusk" scrub={false} />
  {[[-2.6, 1.4, 2.2], [-0.8, 1.0, 1.6], [0.9, 1.3, 2.0], [2.6, 0.9, 1.4]].map(([x, h, w], i) => <CutLayer key={i} shape="rect" opts={{margin: 4, amp: 1.2}} size={[w, h]} px={[Math.round(w * 90), Math.round(h * 90)]} position={[x, 2.3 + h / 2, -5.0 + i * 0.1]} color={['#4a3040', '#5a3a44', '#3e2a3c', '#523648'][i]} seed={101 + i} frame={f}
    details={function win(g, ww, hh) { g.fillStyle = '#ffd88a'; g.fillRect(ww * 0.2, hh * 0.35, ww * 0.16, hh * 0.22); g.fillRect(ww * 0.62, hh * 0.35, ww * 0.16, hh * 0.22); }} />)}</>}</Scene>; };
// 6 Zamora (generic paper officer figure, hat, no face) beside the patrol car
S[6] = () => { const d = dur(6); return <Scene seed={7} title={[{text: 'OFFICER', at: loc(9.4, 6), size: 80}, {text: 'LONNIE ZAMORA', at: loc(9.62, 6), red: true, size: 70}]}>{(f) => <>
  {cam([-2.4, 2.8, 10.4], [1.0, 2.8, 8.2], [[0, 2.7, -3.5], [0.6, 2.7, -3.5]], d, [44, 38])}<Land f={f} />
  <Car f={f} x={0.4} y={1.6} z={-3.5} s={1.1} seed={7} /><Person f={f} x={-2.0} y={2.5} z={-3.2} s={1.2} hat seed={81} />
  <Dust f={f} x={-1.4} y={1.7} z={-3.6} /></>}</Scene>; };
// 7 the speeding car ahead, patrol car chasing (whip along the road)
S[7] = () => { const d = dur(7); return <Scene seed={8} title={[{text: 'SPEEDING CAR', at: loc(11.54, 7), size: 74}]}>{(f) => <>
  {cam([-3.6, 2.4, 11], [2.6, 2.6, 10], [[-1, 2.6, -4], [2, 2.6, -4]], d, [44, 42], 'inout', 0.05)}<Land f={f} />
  <Car f={f} x={interpolate(f, [0, d], [-1.4, 3.2])} y={1.7} z={-4.2} s={0.95} seed={8} />
  <Car f={f} x={interpolate(f, [0, d], [2.0, 5.8])} y={1.7} z={-4.8} s={0.85} seed={9} body="#7a2a2a" />
  <Dust f={f} x={interpolate(f, [0, d], [-2.6, 1.8])} y={1.8} z={-4.4} n={4} /></>}</Scene>; };
// 8 STYLE face-closeup (fear) on narration "He hears a roar and sees a blue flame"
S[8] = () => { const d = dur(8); return <AbsoluteFill><FaceCloseUp dur={d} words={W} offsetSec={CS[8]} expr="fear" skin="#c79a7a" hair="#2a1d16" rim="#7fe3ff" />
  <PaperTitle y={250} lines={[{text: 'A ROAR.', at: 0, size: 92, red: true}]} /><PaperFinish seed={9} /></AbsoluteFill>; };
// 9 blue flame beyond the ridge
S[9] = () => { const d = dur(9); return <Scene seed={10} bg={DUSK} title={[{text: 'BLUE FLAME', at: loc(14.26, 9), size: 90}]}>{(f) => <>
  {cam([1.8, 2.6, 12.6], [-0.2, 3.2, 9.4], [[0, 3.0, -6], [0, 3.6, -6]], d, [44, 36], 'inout')}<Land f={f} t="dusk" sun={false} />
  <CutLayer shape={flameShape} size={[2.6, 3.8]} px={[256, 300]} position={[0, 3.2, -6.4]} color="#4aa8ff" emissive={0.95} seed={111} frame={f} bob={0.14} speed={1.9} castShadow={false} />
  <CutLayer shape={flameShape} size={[1.4, 2.2]} px={[200, 220]} position={[0, 3.0, -6.2]} color="#ffb040" emissive={0.95} seed={112} frame={f} bob={0.12} speed={2.3} castShadow={false} />
  <PaperGlow position={[0, 3.6, -6]} size={9} color="#7ac0ff" opacity={0.55} /><Particles kind="embers" count={50} center={[0, 3.6, -5]} area={[3, 4, 2]} frame={f} /></>}</Scene>; };
// 10 the dynamite shack, flame glow behind
S[10] = () => { const d = dur(10); return <Scene seed={11} bg={DUSK} title={[{text: 'DYNAMITE', at: loc(16.04, 10), size: 86}, {text: 'SHACK?', at: loc(16.7, 10), red: true, size: 90}]}>{(f) => <>
  {cam([-2.2, 2.8, 11], [0.6, 2.9, 8.4], [[0, 2.8, -4.5], [0.4, 3.0, -4.5]], d, [44, 36])}<Land f={f} t="dusk" sun={false} />
  <PaperGlow position={[0, 3.6, -5.4]} size={9} color="#ff8a3a" opacity={0.5} />
  <CutLayer shape={shackShape} size={[3.6, 3.0]} px={[360, 300]} position={[0, 3.7, -4.5]} color="#7a5a3c" details={shackDet} seed={121} frame={f} sway={0.01} />
  <CutLayer shape={flameShape} size={[1.8, 2.6]} px={[200, 260]} position={[1.6, 2.7, -4.2]} color="#ff7a2a" emissive={0.9} seed={122} frame={f} bob={0.12} speed={1.8} castShadow={false} /></>}</Scene>; };
// 11 patrol car drives toward the flame
S[11] = () => { const d = dur(11); return <Scene seed={12} bg={DUSK} title={[{text: 'DRIVES', at: loc(17.88, 11), size: 86}, {text: 'TOWARD IT.', at: loc(18.16, 11), red: true, size: 80}]}>{(f) => <>
  {cam([-3.0, 2.2, 10], [1.6, 2.6, 9], [[0, 2.6, -4], [2, 2.8, -4]], d, [44, 40], 'inout', 0.04)}<Land f={f} t="dusk" sun={false} />
  <PaperGlow position={[2.4, 3.6, -7]} size={8} color="#7ac0ff" opacity={0.45} />
  <Car f={f} x={interpolate(f, [0, d], [-2.4, 1.4])} y={1.7} z={-3.8} s={1.0} seed={10} /><Dust f={f} x={interpolate(f, [0, d], [-3.8, 0.0])} y={1.8} z={-4.0} n={4} /></>}</Scene>; };
// 12 TWIST: in the gully sits the egg on legs, large (flash + hit at 19.27)
S[12] = () => { const d = dur(12); return <Scene seed={13} flash={0.8} title={[{text: 'LANDED.', at: 0, size: 100, red: true}, {text: 'TWO FIGURES.', at: 10, size: 74}]}>{(f) => <>
  {cam([-1.8, 3.4, 11.4], [0.4, 3.8, 8.6], [[0, 3.9, -4.5], [0.2, 4.0, -4.5]], d, [42, 36])}<Land f={f} /><Gully f={f} />
  <Egg f={f} y={1.45} flame={0} /></>}</Scene>; };
// 13 legs close-up (two slanted metal legs)
S[13] = () => { const d = dur(13); return <Scene seed={14} title={[{text: 'TWO FIGURES.', at: -30, size: 74}]}>{(f) => <>
  {cam([1.4, 2.4, 8.4], [-0.3, 2.5, 6.4], [[0, 2.2, -4.5], [0, 2.4, -4.5]], d, [42, 36])}<Land f={f} /><Gully f={f} />
  <Egg f={f} y={1.45} flame={0} /></>}</Scene>; };
// 14 STYLE particle-figure: the two figures in white
S[14] = () => { const d = dur(14); return <AbsoluteFill style={{background: NIGHT}}><ParticleFigure dur={d} shape="person" color="#fff6d8" label="" assemble={[0.04, 0.4]} disperse={0.86} seed={7} />
  <PaperTitle y={250} lines={[{text: 'IN WHITE.', at: loc(23.16, 14), size: 92, red: true}]} /><PaperFinish seed={15} /></AbsoluteFill>; };
// 15 it roars, rises: egg lifts with a flame cone (hit at 24.64)
S[15] = () => { const d = dur(15); return <Scene seed={16} flash={0.5} title={[{text: 'IT RISES.', at: loc(25.2, 15), size: 92, red: true}]}>{(f) => <>
  {cam([0.6, 2.6, 10.4], [-0.2, 4.6, 8.6], [[0, 3.4, -4.5], [0, 5.0, -4.5]], d, [42, 38], 'inout')}<Land f={f} /><Gully f={f} />
  <Egg f={f} y={1.45} lift={interpolate(f, [0, d], [0, 3.4])} flame={1.1} /><Particles kind="embers" count={60} center={[0, 3, -3]} area={[4, 6, 3]} frame={f} /></>}</Scene>; };
// 16 speeds away: streak across the sky, empty gully
S[16] = () => { const d = dur(16); return <Scene seed={17} title={[{text: 'GONE.', at: loc(26.04, 16), size: 100, red: true}]}>{(f) => <>
  {cam([0, 3.2, 12.4], [1.6, 3.6, 10.2], [[0, 3.4, -6], [1, 3.8, -6]], d, [44, 40], 'out')}<Land f={f} /><Gully f={f} />
  <CutLayer shape={streakShape} size={[3.4, 0.6]} px={[340, 60]} position={[interpolate(f, [0, d], [0.5, 6.5]), interpolate(f, [0, d], [5, 9]), -9]} rotation={[0, 0, 0.5]} color="#ffe7b0" emissive={0.9} seed={131} frame={f} castShadow={false} /></>}</Scene>; };
// 17 minutes later: second patrol car, sergeant with flashlight
S[17] = () => { const d = dur(17); return <Scene seed={18} bg={DUSK} title={[{text: 'MINUTES LATER', at: loc(27.02, 17), size: 76}]}>{(f) => <>
  {cam([2.6, 2.6, 11], [-0.6, 2.8, 8.8], [[0.4, 2.6, -4], [-0.4, 2.7, -4]], d, [44, 38])}<Land f={f} t="dusk" sun={false} />
  <Car f={f} x={1.8} y={1.7} z={-4.4} s={1.0} seed={11} /><Person f={f} x={-1.2} y={2.5} z={-3.6} s={1.2} hat seed={82} />
  <LightCone position={[-0.8, 3.2, -3.4]} dir={[-0.4, -0.45, -0.6]} length={7} radius={1.2} color="#ffe9b0" opacity={0.5} frame={f} /></>}</Scene>; };
// 18 four fresh dents
S[18] = () => { const d = dur(18); return <Scene bg="linear-gradient(180deg,#3a2a30 0%,#7a5040 100%)" seed={19} kp={[-3, 7, 7]} kt={[0, 2, 0]} ambient={0.45} title={[{text: 'FOUR', at: loc(28.58, 18), size: 90}, {text: 'FRESH DENTS', at: loc(28.98, 18), red: true, size: 74}]}>{(f) => <>
  {cam([-0.4, 3.4, 11], [0.2, 2.6, 8.6], [[0, 2.4, 0], [0, 2.2, 0]], d, [42, 38])}
  <CutLayer shape="rect" opts={{margin: 2, amp: 0.6}} size={[9, 7]} px={[900, 700]} position={[0, 2.6, -0.6]} color="#c28a58" seed={141} frame={f} edge={0} />
  <CutLayer shape={dentsShape} size={[4.4, 3.4]} px={[440, 340]} position={[0, 2.6, 0.05]} color="#9a6a42" details={dentRim} seed={142} frame={f} edge={1} />
  {f > 8 && <CutLayer shape={ringShape} size={[5.2, 4.0]} px={[520, 400]} position={[0, 2.6, 0.15]} color={PAPER.red} edge={0} seed={143} frame={f} />}</>}</Scene>; };
// 19 burned brush, cold to the touch (hand reaches the charred bush)
S[19] = () => { const d = dur(19); return <Scene bg={DUSK} seed={20} title={[{text: 'COLD TO', at: loc(31.1, 19), size: 80}, {text: 'THE TOUCH.', at: loc(31.58, 19), red: true, size: 80}]}>{(f) => <>
  {cam([1.8, 2.6, 10.4], [-0.2, 2.7, 8.2], [[0, 2.5, -4.2], [0, 2.6, -4.2]], d, [42, 36])}<Land f={f} t="dusk" sun={false} />
  <CutLayer shape={scrubShape} size={[5.6, 2.6]} px={[640, 300]} position={[0, 2.6, -4.2]} color="#17110e" seed={95} frame={f} />
  <CutLayer shape={handShape} size={[1.1, 1.4]} px={[160, 200]} position={[interpolate(f, [0, d], [2.2, 0.5]), interpolate(f, [0, d], [3.4, 2.7]), -3.4]} rotation={[0, 0, 0.4]} color="#d8a888" seed={151} frame={f} boil={0.01} /></>}</Scene>; };
// 20 Air Force: no radiation (Geiger dial sits at zero)
S[20] = () => { const d = dur(20); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={21} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.45} ambientColor="#ffd9b0" title={[{text: 'NO RADIATION', at: loc(33.36, 20), size: 74}]}>{(f) => <>
  {cam([0.4, 2.6, 10.6], [0, 2.7, 8.4], [[0, 2.6, 0], [0, 2.6, 0]], d, [42, 36])}
  <CutLayer shape="rect" opts={{margin: 2, amp: 0.6}} size={[10, 8]} px={[800, 640]} position={[0, 2.6, -0.8]} color="#5a3d28" seed={161} frame={f} edge={0} />
  <CutLayer shape={gaugeShape} size={[5.2, 3.0]} px={[520, 300]} position={[0, 2.4, 0]} color="#2a2a30" details={gaugeDet} seed={162} frame={f} />
  <CutLayer shape={needleShape} size={[0.14, 2.2]} px={[28, 260]} position={[-2.0, 2.4 + 1.0, 0.12]} rotation={[0, 0, Math.PI / 2 + 0.02 * Math.sin(f * 0.8)]} color="#c8372d" edge={0} seed={163} frame={f} /></>}</Scene>; };
// 21 no propellant, no vehicle: checklist with red crosses slapping on word times
S[21] = () => { const d = dur(21); return <Scene bg="#2a1c12" seed={22} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.45} title={[{text: 'NO PROPELLANT.', at: loc(34.82, 21), size: 66}, {text: 'NO VEHICLE.', at: loc(35.56, 21), red: true, size: 74}]}>{(f) => { const x1 = f >= loc(33.7, 21) && true; return <>
  {cam([0, 2.4, 11], [0, 2.6, 9], [[0, 2.4, 0], [0, 2.4, 0]], d, [42, 38])}<Board size={[18, 26]} />
  {[['RADIATION', 3.4, 0], ['PROPELLANT', 2.0, loc(34.82, 21)], ['VEHICLE', 0.6, loc(35.56, 21)]].map(([t, y, when], i) => <group key={i}>
    <group position={[-0.5, y, 0.1]} rotation={[0, 0, i % 2 ? 0.03 : -0.03]}><Note lines={[t]} size={[3.8, 1.1]} color="#efe4c8" seed={171 + i} /></group>
    {f >= when && <CutLayer shape={crossShape} size={[1.0, 1.0]} px={[128, 128]} position={[1.9, y, 0.3]} color={PAPER.red} edge={0} seed={175 + i} frame={f} />}</group>)}</>; }}</Scene>; };
// 22 REVEAL: Blue Book folder, UNKNOWN stamp (flash + drop)
S[22] = () => { const d = dur(22); return <Scene bg="#2a1c12" seed={23} kp={[-3, 6, 7]} kt={[0, 1, 0]} ambient={0.5} flash={0.9} title={[{text: 'BLUE BOOK:', at: 0, size: 80}, {text: 'UNKNOWN', at: 6, red: true, size: 100}]}>{(f) => <>
  {cam([0.4, 2.4, 11.4], [0, 2.4, 12.6], [[0, 2.3, 0], [0, 2.3, 0]], d, [38, 42], 'out')}<Board size={[18, 26]} />
  <group position={[0, 2.2, 0.1]} rotation={[0, 0, 0.03]}><CutLayer shape={folderShape} size={[4.6, 5.6]} px={[460, 560]} position={[0, 0, 0]} color="#d9c08a" details={folderDet} seed={181} frame={f} /></group>
  {f >= at(38.24) - C[22] - 2 && <CutLayer shape={stampShape} size={[3.8, 1.2]} px={[480, 150]} position={[0.2, 1.4, 0.35]} rotation={[0, 0, -0.18]} color={PAPER.red} edge={0} seed={182} frame={f} />}</>}</Scene>; };
// 23 a college president later claimed...
S[23] = () => { const d = dur(23); return <Scene seed={24} bg={DUSK} title={[{text: 'A COLLEGE', at: loc(39.31, 23), size: 80}, {text: 'PRESIDENT', at: loc(39.7, 23), red: true, size: 80}]}>{(f) => <>
  {cam([-2.2, 2.4, 13], [0.6, 2.8, 10], [[0, 2.8, -4], [0.4, 2.8, -4]], d, [44, 38])}<Land f={f} t="dusk" sun={false} scrub={false} />
  <CutLayer shape={collegeShape} size={[6.2, 4.2]} px={[620, 420]} position={[0, 3.8, -4.6]} color="#8a6a5a" details={collegeDet} seed={191} frame={f} />
  <Person f={f} x={2.4} y={2.5} z={-3.4} s={1.2} seed={83} color="#1a1426" /></>}</Scene>; };
// 24 a student hoax, no proof: student silhouette, question mark, NO PROOF note
S[24] = () => { const d = dur(24); return <Scene seed={25} bg="#2a1c12" kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.45} title={[{text: 'A STUDENT HOAX.', at: loc(41.14, 24), size: 62}, {text: 'NO PROOF.', at: loc(42.22, 24), red: true, size: 96}]}>{(f) => <>
  {cam([0.4, 2.6, 11], [-0.2, 2.8, 8.8], [[0, 2.6, 0], [0, 2.6, 0]], d, [42, 38])}<Board size={[18, 26]} />
  <Person f={f} x={-1.5} y={2.3} z={0.2} s={2.2} seed={84} color="#1a1426" />
  <CutLayer shape={qmarkShape} size={[2.4, 3.2]} px={[300, 400]} position={[1.4, 3.2, 0.3]} color={PAPER.red} edge={2} seed={192} frame={f} bob={0.06} sway={0.04} />
  <group position={[0.7, 0.4, 0.25]} rotation={[0, 0, 0.07]}><Note lines={['NO PROOF']} size={[2.6, 1.0]} /></group><Pin position={[0.7, 1.0, 0.35]} /></>}</Scene>; };
// 25 "Was it a prank,": student shadow with a rope and a ladder in the gully
S[25] = () => { const d = dur(25); return <Scene seed={26} bg={NIGHT} title={[{text: 'A PRANK?', at: 0, size: 96}, {text: 'OR A SECRET MACHINE?', at: loc(44.36, 25), red: true, size: 54}]}>{(f) => <>
  {cam([1.8, 2.8, 12], [-0.2, 3.0, 9.6], [[0, 3, -4.5], [0, 3.2, -4.5]], d, [44, 38])}<Land f={f} t="dusk" sun={false} /><Gully f={f} />
  <Person f={f} x={-1.8} y={2.5} z={-3.4} s={1.5} seed={85} color="#10121e" /><Person f={f} x={-0.4} y={2.4} z={-3.7} s={1.3} seed={86} color="#10121e" />
  <CutLayer shape={qmarkShape} size={[1.8, 2.4]} px={[220, 300]} position={[1.8, 4.6, -3.2]} color="#efe4c8" edge={2} seed={193} frame={f} bob={0.06} emissive={0.4} castShadow={false} /></>}</Scene>; };
// 26 a machine nobody could find: searchlight beams sweep the empty desert
S[26] = () => { const d = dur(26); return <Scene seed={27} bg={NIGHT} title={[{text: 'A PRANK?', at: -30, size: 96}, {text: 'OR A SECRET MACHINE?', at: -30, red: true, size: 54}]}>{(f) => { const a = interpolate(f, [0, d], [-0.9, 0.9]); return <>
  {cam([0, 3.0, 12.4], [0, 3.2, 10.4], [[0, 3.0, -5], [0, 3.2, -5]], d, [44, 40])}<Land f={f} t="dusk" sun={false} />
  <Person f={f} x={-2.2} y={2.5} z={-3.4} s={1.3} seed={87} color="#10121e" />
  <LightCone position={[-1.8, 3.4, -3.3]} dir={[Math.sin(a) + 0.5, -0.35, -0.9]} length={14} radius={2.0} color="#ffe9b0" opacity={0.5} frame={f} />
  <LightCone position={[-1.8, 3.4, -3.3]} dir={[-Math.sin(a) + 0.9, -0.3, -0.9]} length={14} radius={1.6} color="#cfe8ff" opacity={0.35} frame={f} /></>; }}</Scene>; };
// 27 END = frame 0's set: gully at dusk, egg lifting with the flame cone, scorched bushes, patrol car on the ridge; same pose as frame 0 on the last frame
S[27] = () => { const d = dur(27); return <Scene seed={28} title={[{text: 'A PRANK?', at: -30, size: 96}, {text: 'OR A SECRET MACHINE?', at: -30, red: true, size: 54}]}>{(f) => <>
  {cam(POSE0.to, POSE0.from, POSE0.look.slice().reverse(), d, [36, 44], 'inout', 0.0)}<Land f={f} /><Gully f={f} />
  <Car f={f} x={-2.6} y={2.2} z={-7.2} s={0.55} seed={5} />
  <Egg f={f} y={1.5} lift={0.9} flame={1} />
  <CutLayer shape={scrubShape} size={[3.4, 1.0]} px={[340, 100]} position={[2.6, 2.2, -4.0]} color="#1a1210" seed={91} frame={f} />
  <CutLayer shape={scrubShape} size={[3.0, 0.9]} px={[300, 90]} position={[-2.7, 2.1, -4.0]} color="#1a1210" seed={92} frame={f} />
  <Particles kind="embers" count={60} center={[0, 3, -3]} area={[4, 6, 3]} frame={f} /></>}</Scene>; };

export const SOC = () => {
  const fonts = usePaperFonts(); const imgs = usePaperImages([]);
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><NoirFonts />
    {fonts && imgs && S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? SOC_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 1 && <Dip inFrames={3} color="#0a0806" />}</Sequence>; })}
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
