// "11 ABOARD. 1 WORD: STENDEC" (Star Dust, 2 Aug 1947) - PAPERCUT look (remotion/src/papercut), 26 scenes on cues.json cuts.
// Layer budget <= ~20 cut layers per scene. Facts on screen come from sources.txt only; body copy is never invented.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {ShotCam, WordCaption, FontFaces, Dip, Particles} from '../../kit/index.js';
import {NoirFonts} from '../../../noir/NoirKit.jsx';
import {PAPER, usePaperFonts, usePaperImages, CutLayer, PhotoCut, Note, Pin, RedString, Board, PaperStage, PaperFinish, PaperTitle, PaperGlow, tear} from '../../../papercut/PaperKit.jsx';
import VO from './vo.json';

const FPS = 30; const at = (s) => Math.round(s * FPS);
export const SD_FRAMES = Math.round(54.9 * FPS);
const W = VO.words;
const CS = [0.0, 2.2, 4.04, 4.92, 7.44, 9.22, 10.78, 12.18, 14.16, 16.66, 18.54, 19.95, 22.35, 24.0, 25.55, 27.21, 29.07, 31.55, 33.56, 35.84, 38.54, 41.26, 43.49, 45.05, 47.65, 51.31];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? SD_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

// ---------- shapes ----------
const P = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
// side-view airliner, nose right: fuselage, tail fin, wing, 2 engines
const planeShape = (g, w, h) => { g.beginPath(); g.ellipse(w * 0.5, h * 0.55, w * 0.46, h * 0.13, 0, 0, 6.283); g.fill();
  P(g, tear([[w * 0.1, h * 0.5], [w * 0.04, h * 0.08], [w * 0.17, h * 0.08], [w * 0.26, h * 0.5]], 3, 1.2, 6));
  P(g, tear([[w * 0.38, h * 0.55], [w * 0.62, h * 0.55], [w * 0.5, h * 0.96], [w * 0.4, h * 0.96]], 5, 1.2, 6));
  g.beginPath(); g.ellipse(w * 0.45, h * 0.7, w * 0.05, h * 0.07, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(w * 0.6, h * 0.72, w * 0.05, h * 0.07, 0, 0, 6.283); g.fill(); };
const portholes = function portholes(g, w, h) { g.fillStyle = 'rgba(20,24,40,0.75)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(w * (0.3 + i * 0.05), h * 0.53, h * 0.028, 0, 6.283); g.fill(); } };
const engineShape = (g, w, h) => { g.beginPath(); g.arc(w * 0.5, h * 0.5, w * 0.46, 0, 6.283); g.fill(); };
const engineDet = function engineDet(g, w, h) { g.fillStyle = '#10131e'; g.beginPath(); g.arc(w * 0.5, h * 0.5, w * 0.3, 0, 6.283); g.fill(); g.strokeStyle = '#8a93a8'; g.lineWidth = w * 0.03; for (let i = 0; i < 12; i++) { const a = i * 0.5236; g.beginPath(); g.moveTo(w * 0.5, h * 0.5); g.lineTo(w * 0.5 + Math.cos(a) * w * 0.3, h * 0.5 + Math.sin(a) * h * 0.3); g.stroke(); } g.fillStyle = '#c9ccd6'; g.beginPath(); g.arc(w * 0.5, h * 0.5, w * 0.07, 0, 6.283); g.fill(); };
const snowCap = function snowCap(g, w, h) { const gr = g.createLinearGradient(0, h * 0.12, 0, h * 0.6); gr.addColorStop(0, 'rgba(250,250,255,0.95)'); gr.addColorStop(0.55, 'rgba(235,240,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
const dotsDash = function dotsDash(g, w, h, r) { g.fillStyle = '#1a1712'; let x = w * 0.03; while (x < w * 0.96) { const dash = r() < 0.5; const ln = dash ? w * 0.045 : w * 0.014; g.beginPath(); g.roundRect(x, h * 0.36, ln, h * 0.28, h * 0.1); g.fill(); x += ln + w * 0.02; } };
const deskPlanks = function deskPlanks(g, w, h, r) { g.strokeStyle = 'rgba(20,10,4,0.45)'; g.lineWidth = 3; for (let y = 0; y < h; y += h / 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } };
const radioDet = function radioDet(g, w, h) { g.fillStyle = '#d8c58a'; g.beginPath(); g.arc(w * 0.28, h * 0.5, h * 0.24, 0, 6.283); g.fill(); g.beginPath(); g.arc(w * 0.72, h * 0.5, h * 0.24, 0, 6.283); g.fill(); g.fillStyle = '#1a1712'; g.fillRect(w * 0.26, h * 0.5 - 3, w * 0.04, 6); g.fillRect(w * 0.7, h * 0.5 - 3, w * 0.04, 6); g.fillStyle = 'rgba(255,220,150,0.8)'; g.fillRect(w * 0.42, h * 0.2, w * 0.16, h * 0.18); };
const keyShape = (g, w, h) => { g.fillRect(w * 0.05, h * 0.7, w * 0.9, h * 0.3); g.lineWidth = h * 0.12; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.15, h * 0.62); g.lineTo(w * 0.85, h * 0.4); g.stroke(); g.beginPath(); g.arc(w * 0.88, h * 0.34, h * 0.2, 0, 6.283); g.fill(); };
const towerShape = (g, w, h) => { P(g, tear([[w * 0.36, h], [w * 0.4, h * 0.34], [w * 0.6, h * 0.34], [w * 0.64, h]], 6, 1.5, 8)); P(g, tear([[w * 0.26, h * 0.34], [w * 0.74, h * 0.34], [w * 0.7, h * 0.14], [w * 0.3, h * 0.14]], 7, 1.5, 8)); g.fillRect(w * 0.48, 0, w * 0.04, h * 0.14); P(g, [[w * 0.24, h * 0.14], [w * 0.5, h * 0.05], [w * 0.76, h * 0.14]]); };
const towerWin = function towerWin(g, w, h) { g.fillStyle = '#f6d98a'; g.fillRect(w * 0.32, h * 0.18, w * 0.36, h * 0.12); };
const ringShape = (g, w, h) => { g.lineWidth = w * 0.035; g.beginPath(); g.arc(w / 2, h / 2, w * 0.44, -0.9, 0.9); g.stroke(); };
const clockShape = (g, w, h) => { g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, 6.283); g.fill(); };
const clockDet = function clockDet(g, w, h) { g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, 6.283); g.fill(); g.fillStyle = '#1a1712'; for (let i = 0; i < 12; i++) { const a = i * 0.5236; g.fillRect(w / 2 + Math.cos(a) * w * 0.34 - 4, h / 2 + Math.sin(a) * w * 0.34 - 4, 8, 8); } };
const handShape = (g, w, h) => { g.fillRect(w * 0.46, 0, w * 0.08, h); };
const qMark = function qMark(g, w, h) { g.fillStyle = '#c8372d'; g.font = `${Math.round(h * 0.8)}px "DM Serif Display"`; g.textAlign = 'center'; g.fillText('?', w / 2, h * 0.82); };
const climber = (g, w, h, r) => { g.beginPath(); g.arc(w / 2, h * 0.14, w * 0.17, 0, 6.283); g.fill(); P(g, tear([[w * 0.3, h * 0.28], [w * 0.7, h * 0.28], [w * 0.78, h * 0.64], [w * 0.6, h * 0.66], [w * 0.58, h], [w * 0.42, h], [w * 0.4, h * 0.66], [w * 0.22, h * 0.64]], 8, 1.2, 7)); g.fillRect(w * 0.82, h * 0.1, w * 0.06, h * 0.9); };
const wreckShape = (g, w, h) => { P(g, tear([[w * 0.05, h], [w * 0.1, h * 0.35], [w * 0.4, h * 0.5], [w * 0.55, h * 0.12], [w * 0.8, h * 0.45], [w * 0.95, h]], 9, 2.5, 9)); };
const glacierRidge = (g, w, h, r) => { const pts = [[0, h]]; for (let x = 0; x <= w; x += 8) pts.push([x, h * (0.3 + 0.12 * Math.sin(x / w * 7 + 1) + 0.06 * Math.sin(x / w * 19)) + (r() - 0.5) * 3]); pts.push([w, h]); P(g, pts); };

// ---------- shared pieces ----------
const SKY = 'linear-gradient(180deg,#14224a 0%,#4a5a8c 42%,#c9807a 78%,#f2b27a 100%)';
const NIGHT = 'linear-gradient(180deg,#0c1326 0%,#1b2848 100%)';
const DESKBG = 'linear-gradient(180deg,#1a1008 0%,#3a2616 100%)';
const KEY = {keyColor: '#ffe0b0', ambientColor: '#a9b4d8', ambient: 0.55, keyI: 2.5};
const Andes = ({f, z = -12, tone = 0, snow = true}) => {
  const c = [['#6b78a8', '#4a5888', '#2c3860'], ['#3f4a72', '#2c365a', '#1c2440']][tone];
  return <>
    <CutLayer shape="ridge" opts={{base: 0.5, amp: 0.34, freq: 3.2}} size={[44, 10]} px={[1760, 400]} position={[0, 4.6, z]} color={c[0]} seed={31} frame={f} details={snow ? snowCap : undefined} castShadow={false} />
    <CutLayer shape="ridge" opts={{base: 0.52, amp: 0.34, freq: 4.1}} size={[40, 9]} px={[1600, 360]} position={[2, 3.4, z + 3.4]} color={c[1]} seed={32} frame={f} details={snow ? snowCap : undefined} />
    <CutLayer shape="rect" opts={{margin: 0, amp: 0}} size={[60, 12]} px={[256, 64]} position={[0, -4.6, z + 6.5]} color={c[2]} edge={0} seed={34} frame={f} castShadow={false} />
    <CutLayer shape="ridge" opts={{base: 0.55, amp: 0.3, freq: 2.6}} size={[38, 8]} px={[1520, 320]} position={[-3, 2.1, z + 6.6]} color={c[2]} seed={33} frame={f} />
  </>;
};
const Clouds = ({f, z = -8, y = 6, tone = '#c89aa8', n = 2}) => <>
  {[[-4, y, z, 6.5], [5, y + 1.2, z - 1, 5.5], [0, y - 1.4, z + 1, 5]].slice(0, n + 1).map(([x, yy, zz, w], i) => <CutLayer key={i} shape="cloud" size={[w, w * 0.4]} px={[600, 240]} position={[x, yy, zz]} color={tone} seed={40 + i} frame={f} drift={[0.35, 0]} wrapX={[-14, 16]} bob={0.05} castShadow={false} />)}
</>;
const Scene = ({bg = SKY, kp, kt = [0, 2, -4], title, ks, children, seed = 1, vignette = 0.6, leak = true, flash = 0, ...rest}) => {
  const f = useCurrentFrame();
  return <PaperStage bg={bg} keyPos={kp || [-6, 10, 10]} keyTarget={kt} {...KEY} {...rest} overlay={<>
    {title && <PaperTitle y={ks || 250} lines={title} />}
    <PaperFinish seed={seed} vignette={vignette} leak={leak} />
    {flash > 0 && f < 5 && <AbsoluteFill style={{background: '#fff', opacity: flash * (1 - f / 5)}} />}
  </>}>{typeof children === 'function' ? children(f) : children}</PaperStage>;
};
const KZ = 1.5; // measured 2026-10-31: visible half-width ~0.13 x distance, so pull every pose back 1.5x from its look point
const away = (p, l, k = KZ) => [l[0] + (p[0] - l[0]) * k, l[1] + (p[1] - l[1]) * k, l[2] + (p[2] - l[2]) * k];
const cam = (from, to, look, d, fov = [40, 36], ease = 'inout', drift = 0.03, kz = KZ) => <ShotCam preset="push" from={away(from, look[0], kz)} to={away(to, look[1], kz)} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={Math.max(2, d - 1)} ease={ease} drift={drift} />;
const camOld = (from, to, look, d, fov = [40, 36], ease = 'inout', drift = 0.03) => <ShotCam preset="push" from={from} to={to} look={look} fov0={fov[0]} fov1={fov[1]} start={0} end={Math.max(2, d - 1)} ease={ease} drift={drift} />;
const MapBoard = ({f}) => <CutLayer shape="rect" opts={{margin: 4, amp: 1.5}} size={[9, 14]} px={[900, 1400]} position={[0, 0, -0.05]} color="#d9c79d" edge={5} seed={31} frame={f}
  details={function mapDet2(g, w, h, r) { g.strokeStyle = 'rgba(60,70,80,0.3)'; g.lineWidth = 2; for (let x = 0; x < w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += h / 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = 'rgba(120,130,150,0.55)'; for (let i = 0; i < 9; i++) { const x = w * (0.28 + i * 0.012), y = h * (0.2 + i * 0.075); g.beginPath(); g.moveTo(x - 50, y + 40); g.lineTo(x, y - 40); g.lineTo(x + 50, y + 40); g.closePath(); g.fill(); } }} />;
const Letters = ({word = 'STENDEC', f, onsets, y = 2.4, step = 1.15, size = [1.0, 1.3], red = false, rot = 1}) => <>
  {word.split('').map((ch, k) => { const row = k < 4 ? 0 : 1; const col = row ? k - 4 : k; const n = row ? 3 : 4; const x = (col - (n - 1) / 2) * step; const yy = y + (row ? -0.62 : 0.62) * (size[1] / 0.9);
    return f >= onsets[k] ? <group key={k} position={[x, yy + (k % 2 ? -0.06 : 0.05), 0.1 + k * 0.01]} rotation={[0, 0, (k % 2 ? 0.05 : -0.04) * rot]}>
    <Note lines={[ch]} size={size} color={red ? '#f1c9b8' : '#f2e7c8'} seed={50 + k} /></group> : null; })}
</>;

const S = [];
const POSE0 = {from: [0.5, 3.4, 11.5], to: [-0.1, 3.3, 8.6], look: [[0, 3.3, 0], [0, 3.3, 0]]};
const PlanePhoto = ({f, pos = [0, 3.3, 0.3], rot = -0.1, size = [4.8, 2.37]}) => <PhotoCut src="stardust/IMG1.jpg" size={size} position={pos} rotation={[0, 0, rot]} frame={f} sepia={0.35} seed={7} />;
// 0 FRAME 0: the Star Dust photo large, banking, in front of the paper Andes; title by 0.1 s
S[0] = () => { const d = dur(0); return <Scene seed={1} title={[{text: '11 ABOARD.', at: 0, size: 92}, {text: '1 WORD: STENDEC', at: 6, red: true, size: 76}]}>{(f) => <>
  {cam(POSE0.from, POSE0.to, POSE0.look, d, [42, 36], 'out', 0.02, 1.1)}<Andes f={f} /><Clouds f={f} n={1} /><PlanePhoto f={f} />
  <Particles kind="dust" count={50} center={[0, 3, -2]} area={[12, 8, 8]} frame={f} color="#f6e6b8" size={0.04} opacity={0.5} /></>}</Scene>; };
// 1 radio desk: operator silhouette at the key, lamp
S[1] = () => { const d = dur(1); return <Scene bg={DESKBG} seed={2} kp={[-3, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: 'LAST RADIO WORD', at: 6, red: true, size: 66}]}>{(f) => <>
  {cam([-2.4, 2.4, 10], [-0.4, 2.2, 7.6], [[0, 2.2, 0], [0, 2.2, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[11, 7]} px={[880, 560]} position={[0, 2.5, -1.4]} color="#4a3220" details={deskPlanks} seed={61} frame={f} edge={0} />
  <CutLayer shape="rect" size={[3.6, 1.8]} px={[540, 270]} position={[0.3, 3.1, -0.4]} color="#5d6a58" details={radioDet} seed={62} frame={f} />
  <CutLayer shape={keyShape} size={[2.0, 1.0]} px={[300, 150]} position={[0.9, 1.6, 0.3]} color="#2a2018" seed={63} frame={f} sway={0.05} speed={2.6} />
  <CutLayer shape="figure" size={[1.6, 3.6]} px={[200, 450]} position={[-1.9, 2.0, 0.0]} color="#10121e" seed={64} frame={f} bob={0.03} boil={0.01} />
  <PaperGlow position={[1.2, 4.6, 0.5]} size={6} color="#ffcf80" opacity={0.45} /></>}</Scene>; };
// 2 STENDEC letters slam onto a cork board
S[2] = () => { const d = dur(2); return <Scene bg="#2a1c12" seed={3} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.45} title={[{text: 'STENDEC.', at: 0, red: true, size: 108}]}>{(f) => <>
  {cam([0.4, 2.2, 11], [0, 2.3, 8.0], [[0, 2.3, 0], [0, 2.3, 0]], d, [42, 36], 'out', 0.03, 2.0)}<Board size={[18, 26]} />
  <Letters f={f} onsets={[2, 5, 8, 11, 14, 17, 20]} y={2.1} /></>}</Scene>; };
// 3 date + British airliner
S[3] = () => { const d = dur(3); return <Scene seed={4} title={[{text: '2 AUGUST 1947', at: 6, size: 70}]}>{(f) => <>
  {cam([3.4, 3.0, 12], [0.2, 3.2, 8.6], [[1, 3.2, 0], [0, 3.2, 0]], d, [42, 38])}<Andes f={f} tone={0} /><Clouds f={f} n={1} />
  <group position={[0.2, 4.6, 0.4]} rotation={[0, 0, -0.04]}><Note lines={['AUG 2', '1947']} size={[2.6, 1.5]} color="#f2e7c8" seed={5} /></group><Pin position={[0.2, 5.5, 0.5]} />
  <CutLayer shape={planeShape} size={[3.2, 1.4]} px={[640, 280]} position={[-0.3, 2.4, 0.2]} color="#e8e2d0" details={portholes} seed={71} frame={f} bob={0.1} sway={0.03} /></>}</Scene>; };
// 4 Star Dust flies (paper plane crossing the ridges)
S[4] = () => { const d = dur(4); return <Scene seed={5} title={[{text: 'STAR DUST', at: loc(7.44, 4), red: true, size: 92}]}>{(f) => <>
  {cam([-2.6, 3.0, 10.5], [1.8, 3.0, 8.2], [[-1, 3.2, 0], [1.2, 3.2, 0]], d, [42, 38])}<Andes f={f} tone={0} /><Clouds f={f} n={2} />
  <CutLayer shape={planeShape} size={[3.8, 1.7]} px={[760, 340]} position={[-2.0 + f * 0.05, 3.2, 0.3]} color="#e8e2d0" details={portholes} seed={72} frame={f} bob={0.08} sway={0.03} /></>}</Scene>; };
// 5 Buenos Aires: board, pin, string starts
const Route = ({f, start = 8, len = 60, withPlane = false}) => <>
  <Board size={[18, 26]} /><MapBoard f={f} />
  <Pin position={[1.2, -0.4, 0.1]} /><Pin position={[-1.2, 0.6, 0.1]} color="#e8e2d0" />
  <group position={[1.2, -1.3, 0.15]} rotation={[0, 0, -0.05]}><Note lines={['BUENOS', 'AIRES']} size={[1.7, 1.0]} /></group>
  <group position={[-1.1, 1.6, 0.15]} rotation={[0, 0, 0.05]}><Note lines={['SANTIAGO']} size={[1.9, 0.8]} /></group>
  <RedString points={[[1.2, -0.4], [0, 0.1], [-1.2, 0.6]]} frame={f} start={start} len={len} z={0.2} />
  {withPlane && <CutLayer shape={planeShape} size={[1.0, 0.45]} px={[300, 135]} position={[interpolate(f, [0, 60], [1.0, -1.1], {extrapolateRight: 'clamp'}), 0.2 + 0.22 * Math.sin(f * 0.1), 0.35]} color="#efe4c8" seed={73} frame={f} />}</>;
S[5] = () => { const d = dur(5); return <Scene seed={6} bg="#2a1c12" kp={(fr) => [-3 + 2.5 * Math.sin(fr * 0.05), 6, 7]} kt={[0, 0, 0]} ambient={0.45} title={[{text: 'BUENOS AIRES', at: loc(9.22, 5), size: 66}]}>{(f) => <>
  {cam([2.4, -1.0, 12.5], [0.8, -0.2, 9.4], [[0.9, -0.3, 0], [0.4, 0, 0]], d, [42, 38])}<Route f={f} start={2} len={40} /></>}</Scene>; };
// 6 Santiago, Chile
S[6] = () => { const d = dur(6); return <Scene seed={7} bg="#2a1c12" kp={(fr) => [-3 + 2.5 * Math.sin(fr * 0.05), 6, 7]} kt={[0, 0, 0]} ambient={0.45} title={[{text: 'TO SANTIAGO,', at: 0, size: 66}, {text: 'CHILE', at: 8, red: true, size: 80}]}>{(f) => <>
  {cam([-0.6, 0.8, 12.5], [-1.0, 1.0, 9.2], [[-0.8, 0.6, 0], [-1.0, 0.9, 0]], d, [42, 38])}<Route f={f + 40} start={2} len={40} withPlane /></>}</Scene>; };
// 7 radio operator on duty (clock note 17:41)
S[7] = () => { const d = dur(7); return <Scene bg={DESKBG} seed={8} kp={[2, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: '5:41 PM', at: 0, size: 84}]}>{(f) => <>
  {cam([1.8, 2.4, 10], [-0.2, 2.5, 7.8], [[0, 2.3, 0], [0, 2.4, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[11, 7]} px={[880, 560]} position={[0, 2.5, -1.4]} color="#4a3220" details={deskPlanks} seed={61} frame={f} edge={0} />
  <CutLayer shape="figure" size={[1.9, 4.2]} px={[220, 480]} position={[-1.3, 2.3, -0.2]} color="#10121e" seed={81} frame={f} bob={0.03} boil={0.01} />
  <CutLayer shape="rect" size={[3.4, 1.7]} px={[510, 255]} position={[1.4, 3.3, -0.5]} color="#5d6a58" details={radioDet} seed={82} frame={f} />
  <CutLayer shape={clockShape} size={[1.5, 1.5]} px={[256, 256]} position={[1.8, 5.0, -0.4]} color="#3a2616" details={clockDet} seed={83} frame={f} />
  <PaperGlow position={[1.4, 4.5, 0.5]} size={6} color="#ffcf80" opacity={0.4} /></>}</Scene>; };
// 8 Morse tape drifts under the operator's hand
S[8] = () => { const d = dur(8); return <Scene bg={DESKBG} seed={9} kp={[-2, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" title={[{text: 'ROUTINE', at: loc(14.8, 8), red: true, size: 84}]}>{(f) => <>
  {cam([-1.2, 2.2, 9.2], [0.6, 2.1, 7.6], [[0, 2.2, 0], [0, 2.2, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[11, 6]} px={[880, 480]} position={[0, 2.2, -1.0]} color="#4a3220" details={deskPlanks} seed={61} frame={f} edge={0} />
  <CutLayer shape="rect" size={[12, 0.9]} px={[1400, 105]} position={[0, 2.6, 0.1]} color="#efe4c8" details={dotsDash} seed={91} frame={f} drift={[-0.8, 0]} wrapX={[-9, 9]} edge={1} />
  <CutLayer shape="rect" size={[12, 0.9]} px={[1400, 105]} position={[0, 1.4, 0.2]} color="#e8dcc0" details={dotsDash} seed={92} frame={f} drift={[-1.2, 0]} wrapX={[-9, 9]} edge={1} />
  <CutLayer shape={keyShape} size={[1.8, 0.9]} px={[300, 150]} position={[1.6, 0.4, 0.4]} color="#2a2018" seed={93} frame={f} sway={0.06} speed={2.8} /></>}</Scene>; };
// 9 ETA 17:45: clock with a moving minute hand
S[9] = () => { const d = dur(9); return <Scene bg="#2a1c12" seed={10} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.45} title={[{text: 'ARRIVING', at: 0, size: 70}, {text: '5:45 PM', at: 10, red: true, size: 90}]}>{(f) => <>
  {cam([0, 2.4, 11], [0, 2.5, 8.4], [[0, 2.4, 0], [0, 2.4, 0]], d, [42, 36])}<Board size={[18, 26]} />
  <CutLayer shape={clockShape} size={[2.2, 2.2]} px={[600, 600]} position={[0, 3.7, 0.1]} color="#3a2616" details={clockDet} seed={101} frame={f} />
  <group position={[0, 3.7, 0.25]} rotation={[0, 0, -(0.2 + 0.0)]}><CutLayer shape={handShape} size={[0.1, 0.9]} px={[24, 160]} position={[0, 0.45, 0]} color="#1a1712" edge={1} seed={102} frame={f} /></group>
  <group position={[0, 3.7, 0.3]} rotation={[0, 0, -(1.0 + f * 0.012)]}><CutLayer shape={handShape} size={[0.08, 1.2]} px={[20, 220]} position={[0, 0.6, 0]} color="#c8372d" edge={1} seed={103} frame={f} /></group>
  <group position={[0.1, 1.9, 0.2]} rotation={[0, 0, 0.04]}><Note lines={['ETA SANTIAGO', '17.45 HRS']} size={[2.6, 1.05]} /></group></>}</Scene>; };
// 10 TWIST: But he adds one more word (flash, red tape piece)
S[10] = () => { const d = dur(10); return <Scene bg={DESKBG} seed={11} kp={[-2, 6, 7]} kt={[0, 1.5, 0]} ambient={0.42} ambientColor="#ffd9b0" flash={0.9} title={[{text: 'THE LAST WORD:', at: 0, size: 72}, {text: 'S-T-E-N-D-E-C', at: 5, red: true, size: 86}]}>{(f) => <>
  {cam([0.6, 2.2, 8.2], [0, 2.3, 9.6], [[0, 2.2, 0], [0, 2.2, 0]], d, [38, 42], 'out')}
  <CutLayer shape="rect" size={[11, 6]} px={[880, 480]} position={[0, 2.2, -1.0]} color="#4a3220" details={deskPlanks} seed={61} frame={f} edge={0} />
  <CutLayer shape="rect" size={[12, 0.9]} px={[1400, 105]} position={[0, 2.8, 0.1]} color="#efe4c8" details={dotsDash} seed={91} frame={f} drift={[-1.6, 0]} wrapX={[-9, 9]} edge={1} />
  <CutLayer shape="rect" size={[6.5, 1.0]} px={[780, 120]} position={[0.4, 1.4, 0.3]} color="#c8372d" details={dotsDash} seed={104} frame={f} drift={[-1.6, 0]} wrapX={[-5, 5]} edge={1} />
  <PaperGlow position={[0, 2.4, 1]} size={7} color="#ff7a5a" opacity={0.3} /></>}</Scene>; };
// 11 S T E N D E C letters land on word onsets
const ON = [19.951, 20.071, 20.391, 20.831, 21.131, 21.351, 21.691].map((s) => at(s) - at(19.95));
S[11] = () => { const d = dur(11); return <Scene bg="#2a1c12" seed={12} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.45}>{(f) => <>
  {cam([0, 2.4, 12], [0, 2.4, 8.4], [[0, 2.3, 0], [0, 2.3, 0]], d, [42, 36], 'inout', 0.03, 2.0)}<Board size={[18, 26]} />
  <Letters f={f} onsets={ON} y={2.4} />
  <RedString points={[[-1.4, 1.2], [0, 0.9], [1.4, 1.2]]} frame={f} start={60} len={14} z={0.3} /></>}</Scene>; };
// 12 Santiago tower asks again: tower + signal rings toward the plane
S[12] = () => { const d = dur(12); return <Scene bg={NIGHT} seed={13} kp={[-4, 9, 8]} kt={[0, 3, -2]} ambient={0.5} title={[{text: 'SANTIAGO:', at: 0, size: 70}, {text: 'SAY AGAIN?', at: 10, red: true, size: 78}]}>{(f) => <>
  {cam([-2.4, 3.0, 11.5], [-0.6, 3.2, 8.4], [[-1, 3.2, -2], [-0.4, 3.4, -2]], d, [42, 38])}<Andes f={f} tone={1} snow={false} />
  <CutLayer shape={towerShape} size={[2.2, 4.4]} px={[330, 660]} position={[-1.1, 2.9, -0.4]} color="#2a3550" details={towerWin} seed={111} frame={f} />
  {[0, 1, 2].map((k) => <CutLayer key={k} shape={ringShape} size={[1.6 + k * 1.5, 1.6 + k * 1.5]} px={[256, 256]} position={[-0.3 + k * 0.6, 3.6, -0.2]} color="#f2e7c8" edge={0} seed={112 + k} frame={f} opacity={Math.max(0.05, 0.85 - ((f * 0.04 + k * 0.33) % 1))} castShadow={false} boil={0.01} />)}
  <CutLayer shape={planeShape} size={[2.0, 0.9]} px={[400, 180]} position={[1.1, 4.8, -0.3]} color="#cfd6ea" seed={116} frame={f} bob={0.08} sway={0.03} /></>}</Scene>; };
// 13 sends it twice more: three STENDEC notes
S[13] = () => { const d = dur(13); return <Scene bg="#2a1c12" seed={14} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.45} title={[{text: 'TWICE MORE.', at: loc(24.63, 13), red: true, size: 90}]}>{(f) => <>
  {cam([0.6, 2.2, 10.5], [0, 2.3, 8.3], [[0, 2.2, 0], [0, 2.2, 0]], d, [42, 38])}<Board size={[18, 26]} />
  {[0, 1, 2].map((k) => (f >= k * 12 ? <group key={k} position={[0, 3.5 - k * 1.2, 0.1 + k * 0.02]} rotation={[0, 0, (k % 2 ? 0.04 : -0.04)]}><Note lines={['STENDEC']} size={[3.0, 0.95]} color={k ? '#f1d8c0' : '#f2e7c8'} seed={120 + k} /></group> : null))}</>}</Scene>; };
// 14 nothing else is ever heard: dark radio, flat line
S[14] = () => { const d = dur(14); return <Scene bg="linear-gradient(180deg,#090a12 0%,#161a2a 100%)" seed={15} kp={[3, 6, 7]} kt={[0, 2, 0]} ambient={0.3} ambientColor="#8a98c8" title={[{text: 'NOTHING ELSE.', at: 0, red: true, size: 80}]}>{(f) => <>
  {cam([0.6, 2.4, 9.4], [0, 2.5, 7.6], [[0, 2.4, 0], [0, 2.4, 0]], d, [40, 36], 'out')}
  <CutLayer shape="rect" size={[7, 3.4]} px={[700, 340]} position={[0, 2.5, -0.3]} color="#3a4538" details={radioDet} seed={141} frame={f} />
  <CutLayer shape="rect" size={[5.6, 0.07]} px={[600, 8]} position={[0, 2.2, 0.2]} color="#c8372d" edge={0} seed={142} frame={f} castShadow={false} /></>}</Scene>; };
// 15 search planes in the Andes (searchlight glow sweeps)
S[15] = () => { const d = dur(15); return <Scene seed={16} title={[{text: 'SEARCH PLANES', at: 0, size: 64}, {text: 'FIND NOTHING', at: 10, red: true, size: 70}]}>{(f) => <>
  {cam([2.6, 3.2, 12], [-0.6, 3.4, 8.8], [[1, 3.4, 0], [-0.6, 3.4, 0]], d, [42, 38])}<Andes f={f} tone={1} /><Clouds f={f} n={1} tone="#b28aa0" />
  {[[3.5, 4.8, -2.4, 1.6], [0, 3.6, -1.0, 1.9], [-2.4, 5.2, -3.4, 1.3]].map(([x, y, z, s], i) => <CutLayer key={i} shape={planeShape} size={[s * 2, s]} px={[480, 240]} position={[x - f * (0.03 + i * 0.012), y + 0.1 * Math.sin(f * 0.12 + i), z]} rotation={[0, 0, 0.05]} color="#d8d4c8" seed={150 + i} frame={f} />)}
  <PaperGlow position={[-1.4 + 0.04 * f, 2.6, 1]} size={5} color="#fff2c0" opacity={0.35} /></>}</Scene>; };
// 16 for over fifty years: calendar of years ticking
S[16] = () => { const d = dur(16); return <Scene bg="#2a1c12" seed={17} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.45} title={[{text: 'OVER 50 YEARS', at: loc(29.9, 16), size: 70}]}>{(f) => <>
  {cam([0, 2.2, 11.5], [0, 2.4, 8.6], [[0, 2.3, 0], [0, 2.3, 0]], d, [42, 36])}<Board size={[18, 26]} />
  <group position={[-0.8, 3.0, 0.1]} rotation={[0, 0, -0.05]}><Note lines={['1947']} size={[1.8, 1.1]} /></group>
  <group position={[0.8, 1.3, 0.12]} rotation={[0, 0, 0.05]}><Note lines={['1998']} size={[1.8, 1.1]} /></group>
  <Pin position={[-0.8, 3.7, 0.1]} /><Pin position={[0.8, 2.0, 0.1]} color="#e8e2d0" />
  <RedString points={[[-0.8, 3.7], [0, 2.6], [0.8, 2.0]]} frame={f} start={4} len={60} z={0.2} />
  {Array.from({length: 8}, (_, k) => (f >= 18 + k * 7 ? <CutLayer key={k} shape="rect" size={[0.38, 0.38]} px={[96, 96]} position={[-1.5 + k * 0.43, -0.9, 0.1]} color="#efe4c8" seed={160 + k} frame={f} /> : null))}</>}</Scene>; };
// 17 gone: empty sky, ghost outline of the plane
S[17] = () => { const d = dur(17); return <Scene bg={NIGHT} seed={18} kp={[-4, 9, 8]} kt={[0, 3, -2]} ambient={0.5} title={[{text: 'GONE.', at: 0, red: true, size: 120}]}>{(f) => <>
  {cam([0, 3.2, 12], [0, 3.4, 9.0], [[0, 3.4, -2], [0, 3.4, -2]], d, [42, 36])}<Andes f={f} tone={1} snow={false} /><Clouds f={f} n={1} tone="#38425e" />
  <CutLayer shape={planeShape} size={[3.6, 1.6]} px={[720, 320]} position={[0, 3.6, -0.2]} color="#e8e2d0" opacity={0.28} seed={171} frame={f} bob={0.08} castShadow={false} /></>}</Scene>; };
// 18 climbers find an engine in the glacier
S[18] = () => { const d = dur(18); return <Scene bg="linear-gradient(180deg,#2a3d66 0%,#8fb0d0 60%,#e0ecf4 100%)" seed={19} kp={[-4, 9, 8]} kt={[0, 2, -1]} ambient={0.6} ambientColor="#cfe0f4" keyColor="#fff4e0" title={[{text: '1998:', at: 0, size: 78}, {text: 'AN ENGINE', at: 10, red: true, size: 82}]}>{(f) => <>
  {cam([-2.2, 2.6, 11], [0.4, 2.2, 8.2], [[-0.4, 2.2, -1], [0.4, 2.0, 0]], d, [42, 38])}<Andes f={f} tone={0} />
  <CutLayer shape={glacierRidge} size={[16, 6]} px={[1280, 480]} position={[0, 0.6, -1.0]} color="#dfeaf4" seed={181} frame={f} />
  <CutLayer shape={engineShape} size={[1.7, 1.7]} px={[300, 300]} position={[0.4, 1.7, 0.3]} color="#6a6f7e" details={engineDet} seed={182} frame={f} sway={0.03} />
  {[-1.3, -0.85].map((x, i) => <CutLayer key={i} shape={climber} size={[0.5, 1.1]} px={[110, 240]} position={[x, 1.6 - i * 0.2, 0.4]} color="#10151f" seed={183 + i} frame={f} boil={0.01} />)}
  <Particles kind="ash" count={50} center={[0, 3, 1]} area={[12, 8, 3]} frame={f} color="#ffffff" size={0.05} /></>}</Scene>; };
// 19 Mount Tupungato: the aerial photo taped on the board
S[19] = () => { const d = dur(19); return <Scene bg="#2a1c12" seed={20} kp={(fr) => [-2.5 + 3 * Math.sin(fr * 0.05), 6, 6.5]} kt={[0, 1.5, 0]} ambient={0.45} title={[{text: 'MOUNT', at: loc(35.9, 19), size: 66}, {text: 'TUPUNGATO', at: loc(36.06, 19), red: true, size: 82}]}>{(f) => <>
  {cam([2.0, 1.6, 12], [-0.2, 2.2, 8.6], [[0.5, 2, 0], [0, 2.2, 0]], d, [42, 38])}<Board size={[18, 26]} />
  <PhotoCut src="stardust/IMG2.jpg" size={[2.9, 2.2]} position={[-0.2, 2.5, 0.08]} rotation={[0, 0, -0.04]} frame={f} sepia={0.15} seed={5} />
  <group position={[0.9, 3.5, 0.2]} rotation={[0, 0, 0.05]}><Note lines={['TUPUNGATO', '6,570 m']} size={[1.9, 0.95]} /></group>
  <Pin position={[0.9, 4.05, 0.3]} /></>}</Scene>; };
// 20 avalanche buries the wreck within seconds
S[20] = () => { const d = dur(20); return <Scene bg="linear-gradient(180deg,#2a3d66 0%,#8fb0d0 60%,#e0ecf4 100%)" seed={21} kp={[-4, 9, 8]} kt={[0, 2, -1]} ambient={0.6} ambientColor="#cfe0f4" keyColor="#fff4e0" flash={0.5} title={[{text: 'AVALANCHE.', at: 0, red: true, size: 92}]}>{(f) => { const t = Math.min(1, f / (d - 6)); return <>
  {cam([0.8, 2.8, 11], [-0.4, 2.4, 8.4], [[0, 2.4, -1], [0, 2.2, 0]], d, [42, 38], 'inout')}<Andes f={f} tone={0} />
  <CutLayer shape={wreckShape} size={[3.0, 1.5]} px={[480, 240]} position={[0, 1.3, -0.2]} color="#555b6a" seed={201} frame={f} />
  {[0, 1, 2].map((k) => <CutLayer key={k} shape={glacierRidge} size={[14, 5]} px={[1120, 400]} position={[2.5 - 2.5 * t - k * 0.8, 4.6 - 3.4 * t - k * 0.5, 0.2 + k * 0.25]} rotation={[0, 0, 0.35]} color={['#f2f6fb', '#e4edf6', '#d4e2f0'][k]} seed={202 + k} frame={f} />)}
  <Particles kind="ash" count={90} center={[0, 3, 1]} area={[10, 8, 3]} frame={f} color="#ffffff" size={0.07} /></>; }}</Scene>; };
// 21 they misjudged their position: believed vs actual pins
S[21] = () => { const d = dur(21); return <Scene seed={22} bg="#2a1c12" kp={(fr) => [-3 + 2.5 * Math.sin(fr * 0.05), 6, 7]} kt={[0, 0, 0]} ambient={0.45} title={[{text: 'WRONG', at: 0, size: 78}, {text: 'POSITION', at: 8, red: true, size: 84}]}>{(f) => <>
  {cam([0.6, 0.2, 12.5], [-0.2, 0.2, 9.4], [[0, 0, 0], [-0.1, 0, 0]], d, [42, 38])}<Board size={[18, 26]} /><MapBoard f={f} />
  <Pin position={[1.0, -0.8, 0.1]} color="#e8e2d0" /><Pin position={[-1.0, 0.6, 0.1]} />
  <group position={[1.0, -2.9, 0.15]} rotation={[0, 0, -0.05]}><Note lines={['THOUGHT', 'HERE']} size={[1.8, 1.1]} /></group>
  <group position={[-1.0, 1.7, 0.15]} rotation={[0, 0, 0.05]}><Note lines={['ACTUALLY', 'HERE']} size={[1.9, 1.1]} /></group>
  <RedString points={[[1.0, -0.8], [0, 0], [-1.0, 0.6]]} frame={f} start={10} len={40} z={0.2} /></>}</Scene>; };
// 22 lost in cloud: cloud layers swallow the plane
S[22] = () => { const d = dur(22); return <Scene bg="linear-gradient(180deg,#323a58 0%,#8a90aa 60%,#c8c6d2 100%)" seed={23} kp={[-4, 9, 8]} kt={[0, 3, -2]} ambient={0.6} title={[{text: 'IN CLOUD.', at: 0, size: 86}]}>{(f) => { const t = Math.min(1, f / (d - 4)); return <>
  {cam([0, 3.0, 11], [0, 3.2, 8.8], [[0, 3.2, -2], [0, 3.2, -2]], d, [42, 38])}<Andes f={f} tone={0} snow={false} />
  <CutLayer shape={planeShape} size={[3.2, 1.4]} px={[640, 280]} position={[0, 3.5, 0.0]} color="#e8e2d0" seed={221} frame={f} bob={0.08} />
  {[[-3, 3.2, 0.4, 8], [3.2, 4.0, 0.7, 8], [0, 2.4, 1.0, 9], [-1, 4.6, 1.3, 8]].map(([x, y, z, w], i) => <CutLayer key={i} shape="cloud" size={[w, w * 0.4]} px={[600, 240]} position={[x + (i % 2 ? -1 : 1) * (2.5 - 2.5 * t), y, z]} color={['#c9c6d6', '#bdbacb', '#d6d3e0', '#c2bfd0'][i]} seed={222 + i} frame={f} bob={0.05} drift={[i % 2 ? -0.2 : 0.2, 0]} castShadow={false} />)}</>; }}</Scene>; };
// 23 REVEAL: nobody has decoded STENDEC (flash, letters with question marks)
S[23] = () => { const d = dur(23); return <Scene bg="#2a1c12" seed={24} kp={[-3, 6, 7]} kt={[0, 2, 0]} ambient={0.5} flash={0.9} title={[{text: 'NOBODY HAS', at: 0, size: 76}, {text: 'DECODED IT.', at: 8, red: true, size: 90}]}>{(f) => <>
  {cam([0, 2.4, 10.5], [0, 2.4, 8.0], [[0, 2.3, 0], [0, 2.3, 0]], d, [42, 36], 'inout', 0.03, 2.0)}<Board size={[18, 26]} />
  <Letters f={f} onsets={[0, 0, 0, 0, 0, 0, 0]} y={2.4} red />
  {f >= at(46.673) - C[23] && <CutLayer shape="rect" size={[1.6, 1.6]} px={[200, 200]} position={[0, 0.6, 0.4]} color="#efe4c8" details={qMark} seed={231} frame={f} />}</>}</Scene>; };
// 24 DESCENT? vs TOO FAST? split
S[24] = () => { const d = dur(24); return <Scene bg="#10141f" seed={25} kp={[0, 8, 9]} kt={[0, 2, 0]} ambient={0.5} title={[{text: 'DESCENT?', at: 0, size: 96}, {text: 'OR TOO FAST?', at: 14, red: true, size: 80}]}>{(f) => <>
  {cam([0, 2.6, 12], [0, 2.8, 9.4], [[0, 2.6, 0], [0, 2.6, 0]], d, [42, 38])}
  <CutLayer shape="rect" size={[2.1, 9]} px={[200, 900]} position={[-1.07, 2.6, -1.0]} color="#233a5c" seed={241} frame={f} edge={0} />
  <CutLayer shape="rect" size={[2.1, 9]} px={[200, 900]} position={[1.07, 2.6, -1.0]} color="#3c2a28" seed={242} frame={f} edge={0} />
  <CutLayer shape={planeShape} size={[1.6, 0.75]} px={[480, 220]} position={[-0.92, 2.6 - f * 0.01, -0.2]} rotation={[0, 0, -0.35]} color="#e8e2d0" seed={243} frame={f} bob={0.06} />
  <CutLayer shape="rect" size={[1.7, 0.6]} px={[540, 105]} position={[0.92, 2.6, 0.1]} color="#efe4c8" details={dotsDash} seed={244} frame={f} drift={[-1.8, 0]} wrapX={[0.1, 1.8]} edge={1} />
  <CutLayer shape="rect" size={[1.7, 0.6]} px={[540, 105]} position={[0.92, 1.6, 0.2]} color="#e8dcc0" details={dotsDash} seed={245} frame={f} drift={[-2.6, 0]} wrapX={[0.1, 1.8]} edge={1} />
  <CutLayer shape="rect" size={[0.1, 9]} px={[30, 900]} position={[0, 2.6, 0.2]} color="#efe4c8" seed={246} frame={f} /></>}</Scene>; };
// 25 END = frame 0's set: the plane photo, camera returns to the frame-0 pose on the last frame (loop)
S[25] = () => { const d = dur(25); return <Scene seed={26} title={[{text: 'DESCENT?', at: 0, size: 92}, {text: 'OR TOO FAST?', at: 8, red: true, size: 76}]}>{(f) => <>
  {cam(POSE0.to, POSE0.from, POSE0.look.slice().reverse(), d, [36, 42], 'inout', 0.0, 1.1)}<Andes f={f} /><Clouds f={f} n={1} /><PlanePhoto f={f} />
  <Particles kind="dust" count={50} center={[0, 3, -2]} area={[12, 8, 8]} frame={f} color="#f6e6b8" size={0.04} opacity={0.5} /></>}</Scene>; };

export const SD = () => {
  const fonts = usePaperFonts(); const imgs = usePaperImages(['stardust/IMG1.jpg', 'stardust/IMG2.jpg']);
  return <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><NoirFonts />
    {fonts && imgs && S.map((Cmp, i) => { const from = C[i]; const to = i === S.length - 1 ? SD_FRAMES : C[i + 1]; return <Sequence key={i} from={from} durationInFrames={to - from}><Cmp />{i > 1 && <Dip inFrames={3} color="#0a0806" />}</Sequence>; })}
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>;
};
