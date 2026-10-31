// "10 Vanished at Sea. Their Ship Kept Sailing." (Mary Celeste, Dec 1872) - PAPERCUT look (remotion/src/papercut), 25 scenes on cues.json cuts.
// Layer budget <= ~22 cut layers per scene. Facts on screen come from sources.txt only; body copy is never invented.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {ShotCam, WordCaption, FontFaces, Dip, Particles} from '../../kit/index.js';
import {NoirFonts} from '../../../noir/NoirKit.jsx';
import {PAPER, usePaperFonts, usePaperImages, CutLayer, SHAPES, PhotoCut, Note, Pin, RedString, Board, PaperStage, PaperFinish, PaperTitle, PaperGlow, tear} from '../../../papercut/PaperKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const MC_FRAMES = Math.round(58.46 * FPS);
const W = VO.words;
const CS = [0.0, 1.74, 3.98, 5.92, 8.24, 10.18, 12.34, 15.5, 17.44, 19.24, 21.28, 22.72, 25.24, 28.56, 32.15, 34.39, 36.49, 38.79, 40.29, 41.93, 44.26, 46.68, 49.64, 53.2, 55.51];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? MC_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

// ---------- shapes (named so the texture cache keys differ) ----------
const P = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const hullShape = (g, w, h) => P(g, tear([[w * 0.02, h * 0.1], [w * 0.5, h * 0.16], [w * 0.99, h * 0.02], [w * 0.84, h * 0.96], [w * 0.12, h * 0.96]], 11, 2.5, 10));
const railShape = (g, w, h) => { g.fillRect(0, h * 0.06, w, h * 0.13); for (let i = 0; i < 30; i++) g.fillRect(w * (i + 0.2) / 30, h * 0.06, w * 0.012, h * 0.94); };
const sailShape = (g, w, h, r, o = {}) => { const pts = [[w * 0.03, 0], [w * 0.97, 0], [w * 0.95, h * 0.88]]; for (let i = 1; i < 12; i++) { const t = 1 - i / 12; pts.push([w * (0.05 + 0.9 * t), h * (0.9 + (o.bill ?? 0.1) * Math.sin(Math.PI * t))]); } pts.push([w * 0.05, h * 0.88]);
  const T = tear(pts, o.seed || 3, 2, 14); if (o.torn) { T.splice(Math.floor(T.length * 0.55), 0, [w * 0.5, h * 0.55], [w * 0.62, h * 0.82]); } P(g, T); };
const mastsShape = (g, w, h) => { [0.3, 0.7].forEach((x) => g.fillRect(w * x - w * 0.012, 0, w * 0.024, h)); g.fillRect(w * 0.05, h * 0.62, w * 0.9, h * 0.012); };
const jibShape = (g, w, h) => P(g, tear([[w * 0.04, h * 0.02], [w * 0.96, h * 0.96], [w * 0.04, h * 0.96]], 5, 2, 12));
const wheelShape = (g, w, h) => { g.lineWidth = w * 0.09; g.beginPath(); g.arc(w / 2, h / 2, w * 0.38, 0, 6.283); g.stroke(); g.lineWidth = w * 0.05; for (let i = 0; i < 8; i++) { const a = i * 0.785; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * w * 0.48, h / 2 + Math.sin(a) * h * 0.48); g.stroke(); } };
const cabinWin = function cabinWin(g, w, h) { g.fillStyle = '#e9c97a'; [0.2, 0.5, 0.8].forEach((x) => g.fillRect(w * x - w * 0.07, h * 0.3, w * 0.14, h * 0.32)); g.fillStyle = '#5a3a20'; g.fillRect(0, h * 0.86, w, h * 0.14); };
const barrels = (g, w, h, r, o = {}) => { const n = o.rows || 4; const bw = w / n * 0.94, bh = Math.min(bw * 1.12, h / n * 0.98);
  for (let k = 0; k < n; k++) { const cnt = n - k; for (let i = 0; i < cnt; i++) { const x = w / 2 + (i - (cnt - 1) / 2) * bw * 1.04 - bw / 2; const y = h - (k + 1) * bh; g.beginPath(); g.roundRect(x, y, bw, bh, bw * 0.28); g.fill(); } } };
const hoops4 = function hoops4(g, w, h) { const n = 4; const bw = w / n * 0.94, bh = Math.min(bw * 1.12, h / n * 0.98); g.strokeStyle = 'rgba(30,18,8,0.7)'; g.lineWidth = 4;
  for (let k = 0; k < n; k++) { const cnt = n - k; for (let i = 0; i < cnt; i++) { const x = w / 2 + (i - (cnt - 1) / 2) * bw * 1.04 - bw / 2; const y = h - (k + 1) * bh; [0.25, 0.75].forEach((t) => { g.beginPath(); g.moveTo(x, y + bh * t); g.lineTo(x + bw, y + bh * t); g.stroke(); }); } } };
const planks = function planks(g, w, h, r) { g.strokeStyle = 'rgba(20,10,4,0.5)'; g.lineWidth = 4; for (let x = 0; x < w; x += w / 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(30,16,6,0.25)'; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 6, 8 + r() * 14, 0, 0, 6.28); g.fill(); } };
const ladder = (g, w, h) => { g.fillRect(w * 0.08, 0, w * 0.12, h); g.fillRect(w * 0.8, 0, w * 0.12, h); for (let y = h * 0.04; y < h; y += h / 12) g.fillRect(w * 0.08, y, w * 0.84, h * 0.025); };
const flameShape = (g, w, h, r) => { for (let i = 0; i < 5; i++) { const x = w * (0.12 + i * 0.19), bw = w * 0.13, th = 0.55 + r() * 0.45, lean = (r() - 0.5) * w * 0.12; g.beginPath(); g.moveTo(x - bw, h); g.quadraticCurveTo(x - bw, h * 0.5, x + lean, h * (1 - th)); g.quadraticCurveTo(x + bw, h * 0.5, x + bw, h); g.fill(); } };
const stainShape = (g, w, h, r) => { for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(w * (0.2 + r() * 0.6), h * (0.3 + r() * 0.4), w * (0.05 + r() * 0.08), h * (0.06 + r() * 0.12), r() * 3, 0, 6.28); g.fill(); } g.fillRect(w * 0.3, h * 0.4, w * 0.4, h * 0.12); };
const ringShape = (g, w, h) => { g.lineWidth = w * 0.035; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.46, h * 0.44, -0.05, 0, 6.28); g.stroke(); };
const gashShape = (g, w, h) => { g.lineCap = 'round'; for (let i = 0; i < 5; i++) { g.lineWidth = 8 + i; g.beginPath(); g.moveTo(w * (0.1 + i * 0.17), h * 0.1); g.lineTo(w * (0.2 + i * 0.17), h * 0.9); g.stroke(); } };
const magShape = (g, w, h) => { g.lineWidth = w * 0.06; g.beginPath(); g.arc(w * 0.4, h * 0.4, w * 0.32, 0, 6.283); g.stroke(); g.lineWidth = w * 0.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.64, h * 0.64); g.lineTo(w * 0.93, h * 0.93); g.stroke(); };
const ladyShape = (g, w, h) => { g.beginPath(); g.arc(w / 2, h * 0.11, w * 0.13, 0, 6.28); g.fill(); g.beginPath(); g.arc(w / 2, h * 0.03, w * 0.08, 0, 6.28); g.fill(); P(g, tear([[w * 0.36, h * 0.2], [w * 0.64, h * 0.2], [w * 0.68, h * 0.42], [w * 0.9, h * 0.99], [w * 0.1, h * 0.99], [w * 0.32, h * 0.42]], 8, 1.5, 7)); };
const davitShape = (g, w, h) => { g.lineCap = 'round'; g.lineWidth = w * 0.08; g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(w * 0.3, h * 0.3); g.quadraticCurveTo(w * 0.3, h * 0.04, w * 0.85, h * 0.06); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.85, h * 0.06); g.lineTo(w * 0.85, h * 0.5); g.stroke(); g.beginPath(); g.arc(w * 0.85, h * 0.55, w * 0.05, 0, 6.28); g.fill(); };
const pumpShape = (g, w, h) => { g.fillRect(w * 0.04, h * 0.38, w * 0.46, h * 0.24); g.fillRect(w * 0.0, h * 0.34, w * 0.05, h * 0.32); g.save(); g.translate(w * 0.62, h * 0.18); g.rotate(-0.35); g.fillRect(0, 0, w * 0.34, h * 0.07); g.restore(); g.beginPath(); g.arc(w * 0.62, h * 0.72, h * 0.12, 0, 6.28); g.fill(); g.beginPath(); g.arc(w * 0.84, h * 0.8, h * 0.08, 0, 6.28); g.fill(); g.fillRect(w * 0.55, h * 0.5, w * 0.12, h * 0.07); };
const crossShape = (g, w, h) => { g.lineCap = 'round'; g.lineWidth = w * 0.14; g.beginPath(); g.moveTo(w * 0.15, h * 0.15); g.lineTo(w * 0.85, h * 0.85); g.moveTo(w * 0.85, h * 0.15); g.lineTo(w * 0.15, h * 0.85); g.stroke(); };
const coatShape = (g, w, h) => { P(g, tear([[w * 0.38, 0], [w * 0.62, 0], [w * 0.72, h * 0.1], [w * 0.98, h * 0.6], [w * 0.84, h * 0.66], [w * 0.74, h * 0.4], [w * 0.8, h], [w * 0.2, h], [w * 0.26, h * 0.4], [w * 0.16, h * 0.66], [w * 0.02, h * 0.6], [w * 0.28, h * 0.1]], 4, 1.5, 8)); };
const bootsShape = (g, w, h) => { [0.08, 0.55].forEach((x) => P(g, tear([[w * x, 0], [w * (x + 0.2), 0], [w * (x + 0.2), h * 0.62], [w * (x + 0.4), h * 0.8], [w * (x + 0.4), h], [w * x, h]], 6, 1.2, 6))); };
const trunkDet = function trunkDet(g, w, h) { g.fillStyle = '#2a1a0c'; g.fillRect(w * 0.12, 0, w * 0.06, h); g.fillRect(w * 0.82, 0, w * 0.06, h); g.fillStyle = '#d8b25a'; g.fillRect(w * 0.45, h * 0.35, w * 0.1, h * 0.2); };
const mapDet = function mapDet(g, w, h, r) { g.fillStyle = '#9db9bb'; g.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92); g.fillStyle = '#c8b68a'; g.beginPath(); g.moveTo(w * 0.78, 0); g.quadraticCurveTo(w * 0.7, h * 0.3, w * 0.82, h * 0.5); g.quadraticCurveTo(w * 0.74, h * 0.75, w * 0.86, h); g.lineTo(w, h); g.lineTo(w, 0); g.fill();
  g.fillStyle = '#7d9a5c'; [[0.3, 0.46, 0.04], [0.37, 0.5, 0.03], [0.24, 0.42, 0.025], [0.42, 0.55, 0.025], [0.33, 0.41, 0.018]].forEach(([x, y, s]) => { g.beginPath(); g.ellipse(w * x, h * y, w * s * 1.7, w * s, 0.5, 0, 6.28); g.fill(); });
  g.strokeStyle = 'rgba(60,70,80,0.35)'; g.lineWidth = 2; for (let x = 0; x < w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += h / 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } };

// ---------- shared pieces ----------
const DAWN = 'linear-gradient(180deg,#27325e 0%,#7a5a8a 38%,#e0806e 66%,#f6b878 100%)';
const DUSKBG = 'linear-gradient(180deg,#1a2040 0%,#4a3a62 45%,#b86a6a 100%)';
const KEY = {keyColor: '#ffd9a8', ambientColor: '#b9a9d0', ambient: 0.55, keyI: 2.5};
const WAVE = [PAPER.sea, PAPER.sea2, '#1f4566'];
const Sea = ({f, y = 0, tone = WAVE, z = -4.5}) => <>
  <CutLayer shape="waves" opts={{waves: 7, amp: 0.2}} size={[40, 2.6]} px={[1600, 104]} position={[0, y + 0.3, z - 2.2]} color={tone[0]} seed={11} frame={f} bob={0.1} speed={0.9} />
  <CutLayer shape="waves" opts={{waves: 6, amp: 0.22, phase: 1.3}} size={[40, 2.6]} px={[1600, 104]} position={[0, y - 0.2, z + 0.5]} color={tone[1]} seed={13} frame={f} bob={0.12} speed={1.1} />
  <CutLayer shape="waves" opts={{waves: 5, amp: 0.25, phase: 2.4}} size={[40, 2.6]} px={[1600, 104]} position={[0, y - 0.8, z + 2.6]} color={tone[2]} seed={14} frame={f} bob={0.14} speed={0.8} edgeColor="#cfe2ea" />
  <CutLayer shape="rect" opts={{margin: 0, amp: 0}} size={[40, 5]} px={[256, 32]} position={[0, y - 4.1, z + 2.7]} color={tone[2]} edge={0} seed={16} frame={f} castShadow={false} />
</>;
const SkyBits = ({f, sun = true, z = -16}) => <>
  {sun && <><PaperGlow position={[-2, 4.2, z + 0.2]} size={9} color="#ffd08a" opacity={0.6} /><CutLayer shape="moon" size={[3.6, 3.6]} px={[512, 512]} position={[-2, 4.2, z]} color="#ffe3a0" emissive={0.7} seed={3} frame={f} bob={0.05} castShadow={false} receiveShadow={false} /></>}
  {[[-5, 8.4, -13, 6], [5, 7.2, -12.5, 5]].map(([x, y, zz, w], i) => <CutLayer key={i} shape="cloud" size={[w, w * 0.4]} px={[600, 240]} position={[x, y, zz]} color="#a8738a" seed={20 + i} frame={f} drift={[0.3, 0]} wrapX={[-14, 16]} bob={0.04} castShadow={false} />)}
</>;
// brigantine. sail: 'full' | 'half' | 'bare'; lite = 5 layers for background ships. local hull 7 wide, mast tops at y 7.9
const Brig = ({x = 0, y = 0, z = -4, s = 1, f = 0, sail = 'half', lite = false, flip = false, tilt = 0, seed = 1, hull = '#4a2e1a'}) => {
  const st = Math.floor(f * 12 / 30); const gy = y + 0.1 * s * Math.sin(st * 0.9 + seed); const sw = 0.02 * Math.sin(st * 0.6 + seed);
  const SAIL = '#eadfc2'; const mx = [-1.4, 1.4];
  return <group position={[x, gy, z]} scale={[s * (flip ? -1 : 1), s, s]} rotation={[0, 0, tilt + sw]}>
    <CutLayer shape={hullShape} size={[7, 1.5]} px={[1120, 240]} position={[0, 0.75, 0]} color={hull} seed={seed + 1} frame={f} />
    {!lite && <>
      <CutLayer shape={railShape} size={[6.6, 0.7]} px={[1056, 112]} position={[0, 1.85, 0.35]} color="#6b4a2c" seed={seed + 2} frame={f} />
      <CutLayer shape="rect" size={[6.6, 0.7]} px={[528, 56]} position={[0, 1.85, -0.35]} color="#2a1a10" edge={0} seed={seed + 3} frame={f} />
      <CutLayer shape="rect" size={[1.7, 0.95]} px={[340, 190]} position={[-2.3, 2.3, -0.2]} color="#9a7a52" details={cabinWin} seed={seed + 4} frame={f} />
      <CutLayer shape={wheelShape} size={[0.5, 0.5]} px={[192, 192]} position={[-3.1, 2.05, 0.1]} color="#3a2a1a" seed={seed + 5} frame={f} sway={0.06} speed={0.7} />
    </>}
    <CutLayer shape={mastsShape} size={[7, 6.4]} px={[448, 410]} position={[0, 4.7, -0.1]} color="#3a2616" seed={seed + 6} frame={f} />
    {(sail === 'full') && mx.map((m, k) => <group key={k}>
      <CutLayer shape={sailShape} size={[2.7, 1.9]} px={[400, 285]} position={[m, 3.4, 0.12]} color={SAIL} seed={seed + 10 + k} frame={f} sway={sw * 2} />
      <CutLayer shape={sailShape} size={[2.3, 1.6]} px={[340, 240]} position={[m, 5.1, 0.12]} color={SAIL} seed={seed + 12 + k} frame={f} sway={sw * 2} />
      {!lite && <CutLayer shape={sailShape} size={[1.7, 1.2]} px={[260, 190]} position={[m, 6.45, 0.12]} color={SAIL} seed={seed + 14 + k} frame={f} sway={sw * 2} />}
    </group>)}
    {(sail === 'half') && <>
      <CutLayer shape={sailShape} opts={{bill: 0.14}} size={[2.7, 1.9]} px={[400, 285]} position={[mx[0], 3.4, 0.12]} color={SAIL} seed={seed + 10} frame={f} sway={sw * 2} />
      <CutLayer shape={sailShape} opts={{bill: 0.14}} size={[2.7, 1.9]} px={[400, 285]} position={[mx[1], 3.4, 0.12]} color={SAIL} seed={seed + 11} frame={f} sway={sw * 2} />
      {!lite && <CutLayer shape={sailShape} opts={{torn: true}} size={[2.3, 1.6]} px={[340, 240]} position={[mx[1], 5.1, 0.12]} rotation={[0, 0, 0.1]} color={SAIL} seed={seed + 13} frame={f} sway={sw * 3} />}
    </>}
    {(sail === 'bare') && <CutLayer shape={sailShape} opts={{torn: true}} size={[2.7, 1.9]} px={[400, 285]} position={[mx[0], 3.4, 0.12]} rotation={[0, 0, -0.08]} color="#d8cba8" seed={seed + 10} frame={f} sway={sw * 3} />}
    <CutLayer shape={jibShape} size={[2.0, 3.0]} px={[256, 384]} position={[3.2, 3.3, 0.05]} color={SAIL} seed={seed + 20} frame={f} sway={sw * 2} />
  </group>;
};
const Scene = ({bg = DAWN, kp, kt = [0, 2, -4], title, ks, children, seed = 1, vignette = 0.6, leak = true, flash = 0, ...rest}) => {
  const f = useCurrentFrame();
  return <PaperStage bg={bg} keyPos={kp || [-6, 10, 10]} keyTarget={kt} {...KEY} {...rest} overlay={<>
    {title && <PaperTitle y={ks || 250} lines={title} />}
    <PaperFinish seed={seed} vignette={vignette} leak={leak} />
    {flash > 0 && f < 5 && <AbsoluteFill style={{background: '#fff', opacity: flash * (1 - f / 5)}} />}
  </>}>{typeof children === 'function' ? children(f) : children}</PaperStage>;
};
const cam = (from, to, look, d, fov = [40, 36], ease = 'inout', drift = 0.03) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={Math.max(2, d - 1)} ease={ease} drift={drift} />;
const MapBoard = ({f, pos = [0, 0, -0.05]}) => <CutLayer shape="rect" opts={{margin: 4, amp: 1.5}} size={[9, 14]} px={[900, 1400]} position={pos} color="#d9c79d" edge={5} seed={31} frame={f} details={mapDet} />;

const S = [];
const POSE0 = {from: [1.6, 3.2, 14.6], to: [0.4, 2.8, 9.6], look: [[0, 3.4, -4], [-0.2, 3.1, -4]]};
// 0 FRAME 0: brigantine large, empty deck, sails half set; fastest push from frame 0; title by 0.3 s
S[0] = () => { const d = dur(0); return <Scene seed={1} title={[{text: '10 PEOPLE GONE.', at: 0, size: 84}, {text: 'THE SHIP SAILED ON.', at: 8, red: true, size: 74}]}>{(f) => <>
  {cam(POSE0.from, POSE0.to, POSE0.look, d, [42, 36], 'out', 0.02)}<SkyBits f={f} /><Sea f={f} /><Brig f={f} sail="half" x={0} z={-4} />
  <Particles kind="dust" count={60} center={[0, 3, -2]} area={[14, 8, 8]} frame={f} color="#f6e6b8" size={0.04} opacity={0.5} /></>}</Scene>; };
// 1 deck close-up: the unmanned wheel + empty deck behind the rail
S[1] = () => { const d = dur(1); return <Scene seed={2} title={[{text: 'NO ONE ON DECK.', at: 22, red: true, size: 74}]}>{(f) => <>
  {cam([-4.0, 1.9, 8.0], [-2.2, 1.9, 5.2], [[-1.5, 1.8, -4], [-0.8, 1.9, -4]], d, [44, 38], 'inout', 0.04)}<SkyBits f={f} /><Sea f={f} /><Brig f={f} sail="half" x={0} z={-4} /></>}</Scene>; };
// 2 date note over a distant sea
S[2] = () => { const d = dur(2); return <Scene seed={3} bg={DUSKBG} title={[{text: 'ATLANTIC.', at: 14, red: true, size: 80}]} ks={230}>{(f) => <>
  {cam([0, 2.4, 11], [0, 2.7, 8.6], [[0, 2.6, 0], [0, 2.6, 0]], d, [40, 36])}<SkyBits f={f} /><Sea f={f} y={-1} tone={['#2a3f66', '#23375a', '#182c4a']} />
  <Brig f={f} lite sail="bare" x={-3} z={-9} s={0.45} seed={4} />
  <group position={[0.2, 3.1, 0.2]} rotation={[0, 0, -0.04]}><Note lines={['DECEMBER', '1872']} size={[3.6, 2.0]} color="#f2e7c8" seed={5} /></group>
  <Pin position={[0.2, 4.4, 0.3]} /></>}</Scene>; };
// 3 a passing crew sights the drifting ship
S[3] = () => { const d = dur(3); return <Scene seed={4} title={[{text: 'MARY CELESTE', at: loc(7.0, 3), size: 78}]}>{(f) => <>
  {cam([4.8, 2.6, 12], [0.5, 2.8, 9.5], [[1.5, 3.0, -6], [-1.5, 3.0, -9]], d, [44, 38], 'inout', 0.03)}<SkyBits f={f} /><Sea f={f} />
  <Brig f={f} lite sail="bare" x={-2.2} z={-9.5} s={0.78} seed={6} tilt={0.03} /><Brig f={f} lite sail="full" x={3.6} z={-5.2} s={0.7} flip seed={7} hull="#2e2a30" /></>}</Scene>; };
// 4 map: the Azores
S[4] = () => { const d = dur(4); return <Scene seed={5} bg="#2a1c12" kp={(fr) => [-3 + 2.5 * Math.sin(fr * 0.05), 6, 7]} kt={[0, 0, 0]} ambient={0.45} title={[{text: 'THE AZORES', at: loc(8.6, 4), red: true, size: 80}]}>{(f) => <>
  {cam([2.5, -1, 14], [-1.0, 0.2, 9.5], [[0, 0, 0], [-1.7, 0.5, 0]], d, [42, 36])}<Board size={[18, 26]} /><MapBoard f={f} />
  <Pin position={[-1.8, 0.62, 0.1]} /><group position={[-0.2, -0.6, 0.15]} rotation={[0, 0, 0.06]}><Note lines={['AZORES']} size={[1.9, 0.8]} /></group>
  <Particles kind="ash" count={40} center={[0, 1, 2]} area={[8, 10, 3]} frame={f} color="#e6d6b4" size={0.05} /></>}</Scene>; };
// 5 boarding the ship
S[5] = () => { const d = dur(5); return <Scene seed={6} title={[{text: 'NO ONE ANSWERS.', at: loc(11.3, 5), red: true, size: 76}]}>{(f) => { const st = Math.floor(f * 12 / 30); return <>
  {cam([3.6, 2.2, 10.5], [0.8, 2.6, 7.4], [[1, 1.6, -4], [0.6, 2.2, -4]], d, [44, 38], 'inout', 0.04)}<SkyBits f={f} /><Sea f={f} />
  <Brig f={f} sail="half" x={0} z={-4} s={1.1} />
  <CutLayer shape={ladder} size={[0.7, 2.6]} px={[90, 330]} position={[0.5, 1.5, -3.2]} color="#7a5a34" seed={41} frame={f} />
  {[0, 1, 2].map((k) => <CutLayer key={k} shape="figure" size={[0.4, 0.95]} px={[100, 240]} position={[0.5, 0.7 + ((st * 0.12 + k * 0.62) % 1.9), -3.1]} color="#1a1c2c" seed={50 + k} frame={f} boil={0.01} />)}
  <CutLayer shape="boat" size={[2.1, 1.6]} px={[300, 230]} position={[-1.0, 0.45, -2.6]} color="#6b3f24" seed={44} frame={f} bob={0.1} sway={0.05} /></>; }}</Scene>; };
// 6 hold: food and barrels
S[6] = () => { const d = dur(6); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={7} kp={[-3, 6, 7]} kt={[0, 1, 0]} ambient={0.4} ambientColor="#ffd9b0" title={[{text: 'SIX MONTHS OF FOOD', at: 0, size: 62}, {text: '1,701 BARRELS', at: loc(13.76, 6), red: true, size: 74}]}>{(f) => <>
  {cam([1.8, 2.4, 11.5], [0.2, 2.0, 8.2], [[0, 2, 0], [0, 1.8, 0]], d, [42, 36])}
  <CutLayer shape="rect" opts={{margin: 2, amp: 0.6}} size={[16, 14]} px={[1024, 896]} position={[0, 3, -2.6]} color="#5a3d28" details={planks} seed={61} frame={f} edge={0} />
  <CutLayer shape={barrels} size={[7, 5.6]} px={[900, 720]} position={[-1.6, 2.8, -1.4]} color="#a9733f" details={hoops4} seed={62} frame={f} />
  <CutLayer shape={barrels} size={[5.2, 4.2]} px={[760, 616]} position={[2.6, 2.1, -0.2]} color="#b98048" details={hoops4} seed={63} frame={f} />
  <group position={[-2.7, -0.9, 1.2]} rotation={[0, 0, -0.05]}><Note lines={['FOOD + WATER', 'SIX MONTHS']} size={[2.8, 1.5]} /></group>
  <PaperGlow position={[0, 4, 1]} size={7} color="#ffcf80" opacity={0.35} /></>}</Scene>; };
// 7 intact: barrels, stamp
S[7] = () => { const d = dur(7); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={8} kp={[2, 6, 7]} kt={[0, 1, 0]} ambient={0.4} ambientColor="#ffd9b0" title={[{text: 'ALMOST ALL', at: 0, size: 70}, {text: 'INTACT.', at: 7, red: true, size: 92}]}>{(f) => <>
  {cam([-1.5, 2.0, 7.2], [0.6, 2.4, 9.8], [[0, 2.2, 0], [0, 2.2, 0]], d, [38, 42])}
  <CutLayer shape="rect" opts={{margin: 2, amp: 0.6}} size={[16, 14]} px={[1024, 896]} position={[0, 3, -2.6]} color="#5a3d28" details={planks} seed={61} frame={f} edge={0} />
  <CutLayer shape={barrels} size={[7.5, 6]} px={[900, 720]} position={[0, 2.6, -0.8]} color="#b98048" details={hoops4} seed={65} frame={f} />
  <CutLayer shape={barrels} size={[4, 3.2]} px={[640, 512]} position={[-3.4, 1.6, 0.6]} color="#8d5c33" details={hoops4} seed={66} frame={f} /></>}</Scene>; };
// 8 belongings untouched
S[8] = () => { const d = dur(8); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={9} kp={[-4, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: 'UNTOUCHED.', at: 18, red: true, size: 88}]}>{(f) => <>
  {cam([2.6, 2.4, 10], [0.4, 2.1, 7.8], [[0, 2, 0], [0, 2, 0]], d, [42, 38])}
  <CutLayer shape="rect" opts={{margin: 2, amp: 0.6}} size={[16, 14]} px={[1024, 896]} position={[0, 3, -1.6]} color="#5a3d28" details={planks} seed={71} frame={f} edge={0} />
  <CutLayer shape={coatShape} size={[1.7, 2.5]} px={[220, 320]} position={[-1.2, 3.4, -0.6]} color="#2c3552" seed={72} frame={f} sway={0.03} />
  <Pin position={[-1.2, 4.75, -0.5]} color="#d8b25a" />
  <CutLayer shape="rect" size={[2.6, 1.5]} px={[420, 240]} position={[0.8, 0.9, -0.2]} color="#7a5230" details={trunkDet} seed={73} frame={f} />
  <CutLayer shape={bootsShape} size={[1.6, 1.2]} px={[240, 180]} position={[-1.3, 0.65, 0.5]} color="#1c1612" seed={74} frame={f} />
  <CutLayer shape="rect" size={[1.3, 1.6]} px={[200, 250]} position={[1.8, 3.5, -0.8]} color="#d8c49a" seed={75} frame={f} sway={0.02} />
  <PaperGlow position={[1.8, 3.5, -0.6]} size={3} color="#ffcf80" opacity={0.3} /></>}</Scene>; };
// 9 TWIST: only the lifeboat is gone (empty davits, chalk ghost of the boat)
S[9] = () => { const d = dur(9); return <Scene seed={10} title={[{text: 'LIFEBOAT GONE.', at: 0, red: true, size: 88}]}>{(f) => <>
  {cam([0.6, 2.8, 10.5], [-0.4, 3.0, 8.0], [[0, 3, -2], [0, 3, -2]], d, [44, 38], 'out')}<SkyBits f={f} /><Sea f={f} y={-0.5} />
  <CutLayer shape={railShape} size={[9, 1.0]} px={[1100, 122]} position={[0, 1.4, -1.5]} color="#6b4a2c" seed={81} frame={f} />
  <CutLayer shape={davitShape} size={[1.5, 3.4]} px={[200, 450]} position={[-1.9, 3.3, -1.7]} color="#2a1a10" seed={82} frame={f} />
  <CutLayer shape={davitShape} size={[1.5, 3.4]} px={[200, 450]} position={[1.9, 3.3, -1.7]} color="#2a1a10" seed={83} frame={f} />
  <CutLayer shape="boat" size={[4.4, 2.8]} px={[440, 280]} position={[0, 2.6, -1.9]} color="#1a1428" opacity={0.5} seed={84} frame={f} bob={0.05} />
  <CutLayer shape="rect" size={[0.05, 1.4]} px={[8, 140]} position={[-1.1, 3.0, -1.6]} color="#c8a878" edge={0} seed={85} frame={f} sway={0.1} /></>}</Scene>; };
// 10 the captain's instruments: ghost outlines on an empty desk
S[10] = () => { const d = dur(10); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={11} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: 'INSTRUMENTS', at: 0, size: 70}, {text: 'GONE.', at: 8, red: true, size: 88}]}>{(f) => <>
  {cam([-1.4, 2.6, 8.6], [0.4, 2.3, 7.4], [[0, 2.3, 0], [0, 2.3, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[7, 4.5]} px={[700, 450]} position={[0, 2.2, -0.5]} color="#6b4a2c" details={planks} seed={91} frame={f} />
  <CutLayer shape={ringShape} size={[1.9, 1.9]} px={[256, 256]} position={[-1.5, 2.6, 0.1]} color="#e9e2cf" opacity={0.5} seed={92} frame={f} />
  <CutLayer shape={ringShape} size={[1.2, 1.2]} px={[200, 200]} position={[1.2, 3.1, 0.1]} color="#e9e2cf" opacity={0.5} seed={93} frame={f} />
  <CutLayer shape={magShape} size={[1.8, 1.8]} px={[256, 256]} position={[1.3, 1.5, 0.1]} color="#e9e2cf" opacity={0.45} seed={94} frame={f} /></>}</Scene>; };
// 11 last log entry nine days old: the calendar ticks off
S[11] = () => { const d = dur(11); return <Scene bg="#2a1c12" seed={12} kp={[-3, 6, 7]} kt={[0, 0, 0]} ambient={0.45} title={[{text: 'LAST LOG:', at: 0, size: 78}, {text: '9 DAYS OLD', at: 8, red: true, size: 84}]}>{(f) => <>
  {cam([0, 0.2, 12], [0, 0.4, 9.6], [[0, 0, 0], [0, 0, 0]], d, [42, 38])}<Board size={[18, 26]} />
  <group position={[0, 0.2, 0.1]} rotation={[0, 0, 0.03]}><Note lines={['LAST', 'LOG ENTRY', 'NOV 25']} size={[3.6, 2.8]} color="#e8dcc0" /></group>
  {Array.from({length: 9}, (_, k) => { const x = -2.2 + (k % 5) * 1.1, y = -2.2 - Math.floor(k / 5) * 1.1; const show = f >= 40 + k * 3;
    return <group key={k}><CutLayer shape="rect" size={[0.9, 0.9]} px={[120, 120]} position={[x, y, 0.1]} color="#efe4c8" seed={101} frame={f} />{show && <CutLayer shape={crossShape} size={[0.8, 0.8]} px={[128, 128]} position={[x, y, 0.2]} color={PAPER.red} edge={0} seed={102} frame={f} />}</group>; })}
  <Pin position={[-2.2, 2.2, 0.2]} /></>}</Scene>; };
// 12 four hundred miles away: red string across the map
S[12] = () => { const d = dur(12); return <Scene seed={13} bg="#2a1c12" kp={(fr) => [-3 + 2.5 * Math.sin(fr * 0.05), 6, 7]} kt={[0, 0, 0]} ambient={0.45} title={[{text: 'NEARLY 400', at: 0, size: 78}, {text: 'MILES AWAY', at: 8, red: true, size: 78}]}>{(f) => <>
  {cam([-1.5, 0, 9.4], [0.8, -0.5, 13.5], [[-1, 0.3, 0], [0, 0, 0]], d, [38, 42])}<Board size={[18, 26]} /><MapBoard f={f} />
  <Pin position={[-2.2, 0.55, 0.1]} /><Pin position={[1.3, -1.9, 0.1]} color="#e8e2d0" />
  <RedString points={[[-2.2, 0.55], [-0.5, -0.7], [1.3, -1.9]]} frame={f} start={14} len={60} z={0.2} />
  <group position={[-1.6, 1.5, 0.15]} rotation={[0, 0, 0.05]}><Note lines={['ISLAND']} size={[1.8, 0.8]} /></group>
  <group position={[1.0, -3.0, 0.15]} rotation={[0, 0, -0.05]}><Note lines={['FOUND', 'ADRIFT']} size={[1.9, 1.2]} /></group></>}</Scene>; };
// 13 the Briggs family
S[13] = () => { const d = dur(13); return <Scene bg="linear-gradient(180deg,#3a2a40 0%,#a86a64 60%,#e8a070 100%)" seed={14} title={[{text: 'CAPTAIN BRIGGS', at: 0, size: 72}, {text: 'WIFE + DAUGHTER, 2', at: 12, red: true, size: 58}]}>{(f) => <>
  {cam([0.5, 2.6, 11], [-0.2, 2.8, 8.8], [[0, 2.6, 0], [0, 2.6, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[11, 9]} px={[880, 720]} position={[0, 3.5, -2.2]} color="#e8d6b0" seed={111} frame={f} edge={0} />
  <PaperGlow position={[0, 4.5, -1.8]} size={9} color="#ffd890" opacity={0.5} />
  <CutLayer shape="figure" size={[1.7, 3.9]} px={[200, 460]} position={[-1.7, 2.1, -0.4]} color="#1a1c2c" seed={112} frame={f} bob={0.03} boil={0.01} />
  <CutLayer shape={ladyShape} size={[1.8, 3.5]} px={[220, 430]} position={[0.15, 1.95, -0.2]} color="#2c2438" seed={113} frame={f} bob={0.03} boil={0.01} />
  <CutLayer shape="figure" size={[0.9, 1.9]} px={[120, 250]} position={[1.7, 1.0, 0.1]} color="#3a2c44" seed={114} frame={f} bob={0.04} boil={0.01} />
  <CutLayer shape="waves" opts={{waves: 6, amp: 0.2}} size={[16, 1.6]} px={[1200, 120]} position={[0, -0.4, 0.8]} color="#1f4566" seed={115} frame={f} bob={0.1} /></>}</Scene>; };
// 14 why leave a ship that still floated?
S[14] = () => { const d = dur(14); return <Scene seed={15} title={[{text: 'STILL FLOATING.', at: 0, size: 76}, {text: 'WHY LEAVE?', at: 16, red: true, size: 86}]}>{(f) => <>
  {cam([-2.6, 2.4, 15], [-0.4, 2.8, 12.5], [[0, 3.2, -4], [0, 3.2, -4]], d, [40, 34], 'inout', 0.02)}<SkyBits f={f} /><Sea f={f} /><Brig f={f} sail="half" x={0.6} z={-4} s={0.95} /></>}</Scene>; };
// 15 Gibraltar inquiry board
S[15] = () => { const d = dur(15); return <Scene seed={16} bg="#2a1c12" kp={(fr) => [-2.5 + 3.2 * Math.sin(fr * 0.06), 5.5, 6.5]} kt={[0, 0.5, 0]} ambient={0.42} ambientColor="#ffd9b0" angle={0.9} title={[{text: 'GIBRALTAR:', at: 0, size: 78}, {text: 'MURDER?', at: 7, red: true, size: 92}]}>{(f) => <>
  {cam([2.2, -1.8, 14.5], [-0.3, 0.2, 12.2], [[0.8, -0.5, 0], [-0.2, 0.4, 0]], d, [44, 40])}<Board size={[18, 26]} />
  <PhotoCut src="maryceleste/IMG2.png" size={[2.7, 5.0]} position={[-1.4, 0.2, 0.06]} rotation={[0, 0, -0.05]} frame={f} sepia={0.4} />
  <PhotoCut src="maryceleste/IMG1.jpg" size={[3.3, 2.3]} position={[1.7, 2.6, 0.08]} rotation={[0, 0, 0.05]} frame={f} seed={3} />
  <group position={[1.9, -1.2, 0.12]} rotation={[0, 0, 0.06]}><Note lines={['GIBRALTAR', 'INQUIRY']} size={[2.2, 1.3]} /></group>
  <Pin position={[-1.4, 2.55, 0.1]} /><Pin position={[1.7, 3.6, 0.1]} /><Pin position={[1.9, -0.7, 0.1]} color="#e8e2d0" />
  <RedString points={[[-1.4, 2.55], [1.7, 3.6], [1.9, -0.7]]} frame={f} start={14} len={40} z={0.2} /></>}</Scene>; };
// 16 stains on a rail, cuts on the bow
S[16] = () => { const d = dur(16); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={17} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: 'STAINS ON A RAIL.', at: 0, size: 64}, {text: 'CUTS ON THE BOW.', at: loc(37.4, 16), red: true, size: 64}]}>{(f) => <>
  {cam([-0.8, 2.3, 10], [0.2, 2.2, 8.4], [[-0.4, 2.3, 0], [0.2, 2.3, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[11, 6]} px={[880, 480]} position={[0, 2.4, -0.6]} color="#6b4a2c" details={planks} seed={121} frame={f} />
  <CutLayer shape={stainShape} size={[2.6, 1.0]} px={[400, 160]} position={[-0.9, 2.5, 0.1]} color="#7a1c14" edge={1} seed={122} frame={f} />
  <CutLayer shape={ringShape} size={[3.4, 1.7]} px={[420, 210]} position={[-0.9, 2.5, 0.2]} color={PAPER.red} edge={0} seed={123} frame={f} />
  <CutLayer shape={gashShape} size={[1.8, 1.8]} px={[200, 200]} position={[1.7, 2.1, 0.1]} color="#1a0e06" edge={1} seed={124} frame={f} />
  <PaperGlow position={[0, 4, 1]} size={7} color="#ffcf80" opacity={0.3} /></>}</Scene>; };
// 17 the tests: a magnifier crosses the stain
S[17] = () => { const d = dur(17); return <Scene bg="#2a1c12" seed={18} kp={[-3, 6, 7]} kt={[0, 1, 0]} ambient={0.45} title={[{text: 'THE TESTS', at: 0, size: 78}, {text: 'CAME BACK.', at: 8, red: true, size: 78}]}>{(f) => { const t = Math.min(1, f / (d - 1)); return <>
  {cam([0, 2.2, 10], [0, 2.4, 8.2], [[0, 2.2, 0], [0, 2.2, 0]], d, [42, 38])}<Board size={[18, 26]} />
  <CutLayer shape="rect" size={[5.6, 3.4]} px={[560, 340]} position={[0, 2.3, 0.05]} color="#e8dcc0" seed={131} frame={f} />
  <CutLayer shape={stainShape} size={[3.0, 1.2]} px={[400, 160]} position={[0, 2.3, 0.1]} color="#7a1c14" edge={1} seed={122} frame={f} />
  <group position={[-1.8 + t * 3.2, 1.7 + t * 0.4, 0.4]}><CutLayer shape={magShape} size={[2.6, 2.6]} px={[256, 256]} position={[0, 0, 0]} color="#2a1c12" seed={132} frame={f} boil={0.01} /><CutLayer shape="moon" size={[1.7, 1.7]} px={[256, 256]} position={[-0.3, 0.3, 0.02]} color="#cfe8ff" opacity={0.28} edge={0} seed={133} frame={f} castShadow={false} /></group></>; }}</Scene>; };
// 18 REVEAL: NOT BLOOD (flash, red stain turns to rust)
S[18] = () => { const d = dur(18); return <Scene bg="#2a1c12" seed={19} kp={[-3, 6, 7]} kt={[0, 1, 0]} ambient={0.5} flash={0.9} title={[{text: 'NOT', at: 0, red: true, size: 118}, {text: 'BLOOD.', at: 4, red: true, size: 118}]} ks={250}>{(f) => <>
  {cam([0.4, 2.2, 8.6], [0, 2.4, 9.8], [[0, 2.3, 0], [0, 2.3, 0]], d, [38, 42], 'out')}<Board size={[18, 26]} />
  <CutLayer shape="rect" size={[5.6, 3.4]} px={[560, 340]} position={[0, 2.3, 0.05]} color="#e8dcc0" seed={131} frame={f} />
  <CutLayer shape={stainShape} size={[3.0, 1.2]} px={[400, 160]} position={[0, 2.3, 0.1]} color={f < 10 ? '#7a1c14' : '#8a7a5a'} edge={1} seed={122} frame={f} />
  <CutLayer shape={crossShape} size={[2.4, 1.5]} px={[256, 150]} position={[0, 2.3, 0.2]} color={PAPER.red} edge={0} seed={134} frame={f} opacity={f > 8 ? 1 : 0.01} /></>}</Scene>; };
// 19 one pump lay taken apart on deck
S[19] = () => { const d = dur(19); return <Scene bg="linear-gradient(180deg,#1c120a 0%,#3a2616 100%)" seed={20} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: 'ONE PUMP', at: 4, size: 80}, {text: 'TAKEN APART.', at: 14, red: true, size: 78}]}>{(f) => <>
  {cam([-2.8, 2.6, 9.2], [1.6, 2.2, 7.6], [[-0.5, 2, 0], [0.8, 2, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[12, 5]} px={[960, 400]} position={[0, 2.0, -0.6]} color="#6b4a2c" details={planks} seed={141} frame={f} />
  <CutLayer shape={pumpShape} size={[6.5, 3.2]} px={[780, 384]} position={[0, 2.2, 0.2]} color="#3a3d44" seed={142} frame={f} boil={0.006} />
  <CutLayer shape="rect" size={[0.5, 2.6]} px={[60, 300]} position={[3.0, 2.0, -0.3]} color="#2a2d34" seed={143} frame={f} /></>}</Scene>; };
// 20 three and a half feet of water in the hold (water rises)
S[20] = () => { const d = dur(20); return <Scene bg="#1a120c" seed={21} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.45} title={[{text: '3½ FEET', at: 4, size: 90}, {text: 'OF WATER', at: 14, red: true, size: 86}]}>{(f) => { const lvl = interpolate(f, [0, d - 6], [0.2, 2.9], {extrapolateRight: 'clamp'}); return <>
  {cam([-1.2, 2.6, 10.5], [0.2, 2.5, 8.6], [[0, 2.3, 0], [0, 2.3, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[7.5, 7]} px={[750, 700]} position={[0, 3.2, -0.6]} color="#4a2e1a" details={planks} seed={151} frame={f} />
  <CutLayer shape={barrels} size={[6.2, 5]} px={[780, 630]} position={[0, 2.4, -0.3]} color="#a9733f" details={hoops4} seed={152} frame={f} />
  <CutLayer shape="waves" opts={{waves: 5, amp: 0.1}} size={[7.5, 3.4]} px={[750, 340]} position={[0, lvl - 1.5, 0.3]} color="#3d7194" opacity={0.82} seed={153} frame={f} bob={0.06} />
  <CutLayer shape="rect" size={[0.5, 4.2]} px={[60, 500]} position={[3.6, 2.2, 0.5]} color="#e8dcc0" seed={154} frame={f} /></>; }}</Scene>; };
// 21 a jammed pump: Briggs fears sinking (ship lists)
S[21] = () => { const d = dur(21); return <Scene bg={DUSKBG} seed={22} title={[{text: 'JAMMED PUMP?', at: 0, size: 72}, {text: 'SINKING?', at: 24, red: true, size: 92}]}>{(f) => <>
  {cam([-0.6, 2.2, 15], [0.4, 2.6, 12.5], [[0, 3, -4], [0.4, 3, -4]], d, [44, 40], 'inout', 0.05)}<SkyBits f={f} /><Sea f={f} tone={['#2a3f66', '#23375a', '#182c4a']} />
  <Brig f={f} lite sail="half" x={0.4} y={-0.3} z={-4} s={0.95} tilt={-0.13} seed={9} />
  <CutLayer shape="figure" size={[1.0, 2.3]} px={[130, 300]} position={[-2.0, 0.6, 0.3]} color="#10121e" seed={161} frame={f} boil={0.01} /></>}</Scene>; };
// 22 alcohol fumes: fire fear (warm glow, embers)
S[22] = () => { const d = dur(22); return <Scene bg="linear-gradient(180deg,#1c0c08 0%,#4a1a10 100%)" seed={23} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} keyColor="#ff9a5a" ambient={0.4} ambientColor="#ffb090" title={[{text: 'ALCOHOL FUMES', at: 0, size: 66}, {text: 'EXPLOSION?', at: loc(52.4, 22), red: true, size: 88}]}>{(f) => <>
  {cam([1.8, 2.4, 11.5], [-0.2, 2.6, 8.4], [[0, 2.4, 0], [0, 2.6, 0]], d, [42, 36])}
  <CutLayer shape={barrels} size={[7.4, 6]} px={[900, 730]} position={[0, 2.8, -1.0]} color="#8d5c33" details={hoops4} seed={171} frame={f} />
  {[[-2.2, 1.3, 0.2], [0.4, 1.0, 0.5], [2.4, 1.4, 0.2]].map(([x, y, z], i) => <CutLayer key={i} shape={flameShape} size={[2.2, 2.6]} px={[256, 300]} position={[x, y + 2.4, z]} color={['#ff7a2a', '#ffb040', '#ff5a1a'][i]} emissive={0.85} seed={172 + i} frame={f} bob={0.12} speed={1.7} castShadow={false} />)}
  <PaperGlow position={[0, 3.2, 1]} size={9} color="#ff8a3a" opacity={0.5} />
  <Particles kind="embers" count={60} center={[0, 3, 1]} area={[7, 6, 3]} frame={f} /></>}</Scene>; };
// 23 split: sinking or fire?
S[23] = () => { const d = dur(23); return <Scene bg="#10141f" seed={24} kp={[0, 8, 9]} kt={[0, 2, 0]} ambient={0.5} title={[{text: 'SINKING?', at: 0, size: 90}, {text: 'OR FIRE?', at: 8, red: true, size: 90}]}>{(f) => <>
  {cam([0, 2.6, 12], [0, 2.8, 9.4], [[0, 2.6, 0], [0, 2.6, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[4, 10]} px={[400, 1000]} position={[-2.0, 2.6, -1.0]} color="#16263c" seed={181} frame={f} edge={0} />
  <CutLayer shape="rect" size={[4, 10]} px={[400, 1000]} position={[2.0, 2.6, -1.0]} color="#5a1a14" seed={182} frame={f} edge={0} />
  {[0, 1, 2].map((k) => <CutLayer key={k} shape="waves" opts={{waves: 3, amp: 0.12, phase: k}} size={[4, 3.4]} px={[400, 340]} position={[-1.9, interpolate(f, [0, d], [-0.6, 1.6]) - 0.3 + k * 0.5, -0.6 + k * 0.3]} color={['#5a96ba', '#4a86aa', '#3d7194'][k]} seed={183 + k} frame={f} bob={0.1} />)}
  {[0, 1].map((k) => <CutLayer key={k} shape={flameShape} size={[2.3, 3.0]} px={[256, 320]} position={[1.4 + (k - 0.5) * 0.5, 0.2 + k * 0.5, -0.4 + k * 0.4]} color={['#ff7a2a', '#ffb040'][k]} emissive={0.85} seed={190 + k} frame={f} bob={0.12} speed={1.7} castShadow={false} />)}
  <CutLayer shape="rect" size={[0.22, 10]} px={[30, 1000]} position={[0, 2.6, 0.2]} color="#efe4c8" seed={195} frame={f} />
  <Particles kind="embers" count={40} center={[2, 2, 0.5]} area={[3.5, 5, 2]} frame={f} /></>}</Scene>; };
// 24 END = frame 0's set: same ship, same camera pose on the last frame (loop); headline in the frame-0 title box
S[24] = () => { const d = dur(24); return <Scene seed={25} title={[{text: 'SINKING?', at: 0, size: 84}, {text: 'OR FIRE?', at: 8, red: true, size: 84}]}>{(f) => <>
  {cam(POSE0.to, POSE0.from, POSE0.look.slice().reverse(), d, [36, 42], 'inout', 0.0)}<SkyBits f={f} /><Sea f={f} /><Brig f={f} sail="half" x={0} z={-4} />
  <Particles kind="dust" count={60} center={[0, 3, -2]} area={[14, 8, 8]} frame={f} color="#f6e6b8" size={0.04} opacity={0.5} /></>}</Scene>; };

export const MC = () => {
  const fonts = usePaperFonts(); const imgs = usePaperImages(['maryceleste/IMG1.jpg', 'maryceleste/IMG2.png']);
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><NoirFonts />
    {fonts && imgs && S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? MC_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 1 && <Dip inFrames={3} color="#0a0806" />}</Sequence>; })}
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
