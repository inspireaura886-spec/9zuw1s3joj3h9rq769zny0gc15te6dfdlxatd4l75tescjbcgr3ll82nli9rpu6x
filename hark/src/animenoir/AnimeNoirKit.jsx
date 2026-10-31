// ANIME-NOIR KIT (2026-10-31): cel-shaded 2D/2.5D anime look for IA Shorts, pure SVG + CSS (no WebGL -> cheap, crash-free).
// Ink outlines, flat cel colours + one hard shadow tone, warm rim light from the key side, painted gradient skies,
// parallax layers under a moving camera, animated faces (blink, head turn/tilt, eyes widening, mouth, breath),
// running figures, haze particles, grain + light-leak transitions. Every value is a pure function of the frame.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, spring} from 'remotion';

export const AN = {
  ink: '#0b0a14', night: '#0d1030', sky0: '#121638', sky1: '#2c2456', sky2: '#6a2f63', sky3: '#d2603e', sky4: '#ffb35e',
  rim: '#ffae5c', rimHot: '#ffd59a', cold: '#8fb0ff', red: '#e0453a', paper: '#efe6d2', white: '#f6f1e6',
  skin: '#e2a989', skinS: '#a96d5c', skinR: '#ffc9a0', hair: '#1a1622', hairH: '#3c3554',
  jacket: '#22283a', jacketS: '#131726', shirt: '#cfd3dc', ridgeFar: '#3a2c55', ridgeMid: '#231d3b', ridgeNear: '#120f22',
};

// ---------- helpers ----------
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeIn = (t) => Math.pow(clamp01(t), 3);
export const lerp = (a, b, t) => a + (b - a) * t;
export const hash = (n, s = 1) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const vnoise = (x, s) => { const i = Math.floor(x), fr = x - i; const a = hash(i, s), b = hash(i + 1, s); const u = fr * fr * (3 - 2 * fr); return a + (b - a) * u; };
export const fbm = (x, s = 1) => vnoise(x, s) * 0.55 + vnoise(x * 2.1, s + 3) * 0.28 + vnoise(x * 4.3, s + 7) * 0.17;
/** blink amount 0 (open) .. 1 (closed): a 5-frame blink every ~2.5-4 s, seeded */
export const blink = (f, seed = 1) => {
  const period = 78 + Math.floor(hash(seed, 9) * 40); const ph = (f + Math.floor(hash(seed, 3) * period)) % period;
  return ph < 5 ? [0.5, 1, 1, 0.6, 0.2][ph] : 0;
};

// ---------- camera + parallax ----------
const CamCtx = createContext({x: 0, y: 0, s: 1, r: 0});
/** <Cam from={{x,y,s,r}} to={{...}} d={frames} ease="inout|out|in|lin" shake={px}> layers </Cam>; x/y in px (positive = camera moves right/down) */
export const Cam = ({from, to, d, children, mode = 'inout', shake = 0, start = 0}) => {
  const f = useCurrentFrame(); const t0 = clamp01((f - start) / Math.max(1, d - start));
  const t = mode === 'out' ? easeOut(t0) : mode === 'in' ? easeIn(t0) : mode === 'lin' ? t0 : ease(t0);
  const g = (k, dflt) => lerp(from[k] ?? dflt, (to || from)[k] ?? dflt, t);
  const sh = shake ? [(hash(f, 1) - 0.5) * shake, (hash(f, 2) - 0.5) * shake] : [0, 0];
  const v = {x: g('x', 0) + sh[0], y: g('y', 0) + sh[1], s: g('s', 1), r: g('r', 0)};
  return <CamCtx.Provider value={v}><AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill></CamCtx.Provider>;
};
/** a parallax layer. depth 0 = locked to infinity (sky), 1 = moves with the camera fully, >1 = foreground (moves more) */
export const Layer = ({depth = 1, children, style}) => {
  const c = useContext(CamCtx); const sc = 1 + (c.s - 1) * depth;
  return <AbsoluteFill style={{transform: `translate(${-c.x * depth}px, ${-c.y * depth}px) scale(${sc}) rotate(${c.r * Math.min(1, depth)}deg)`, transformOrigin: '50% 50%', ...style}}>{children}</AbsoluteFill>;
};
/** full-frame SVG in 1080x1920 coordinates (overflow visible so camera moves never show an edge) */
export const Svg = ({children, style}) => <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>{children}</svg>;

// ---------- painted sky ----------
/** dusk sky: night top -> violet -> sunset afterglow at `horizon` px; glowX = where the sun went down. stars fade in at the top. */
export const DuskSky = ({horizon = 1150, glowX = 300, warmth = 1, stars = 26, morning = false}) => {
  const f = useCurrentFrame();
  const stops = morning
    ? ['#5d86c8 0%', '#9db6dc 40%', '#f2c6a8 ' + Math.round(horizon / 19.2) + '%', '#ffe2b8 100%']
    : [`${AN.sky0} 0%`, `${AN.sky1} 30%`, `${AN.sky2} ${Math.round(horizon / 19.2 - 14)}%`, `${AN.sky3} ${Math.round(horizon / 19.2 - 4)}%`, `${AN.sky4} ${Math.round(horizon / 19.2)}%`, '#3a2433 100%'];
  return <AbsoluteFill>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${stops.join(',')})`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 22% at ${glowX / 10.8}% ${horizon / 19.2}%, rgba(255,${morning ? 236 : 190},${morning ? 190 : 110},${0.75 * warmth}) 0%, rgba(255,120,80,${0.25 * warmth}) 40%, rgba(0,0,0,0) 75%)`}} />
    {!morning && <Svg>{Array.from({length: stars}, (_, i) => { const x = hash(i, 4) * 1300 - 110, y = hash(i, 5) * horizon * 0.55; const tw = 0.4 + 0.6 * Math.abs(Math.sin(f * 0.07 + i));
      return <circle key={i} cx={x} cy={y} r={1.2 + hash(i, 6) * 1.8} fill="#fff" opacity={(0.25 + 0.5 * hash(i, 7)) * tw * (1 - y / (horizon * 0.6))} />; })}</Svg>}
    {/* painted cloud streaks lit from below */}
    <Svg>{Array.from({length: 5}, (_, i) => { const y = horizon - 120 - i * 95 - hash(i, 2) * 40; const x = -200 + hash(i, 8) * 700 + ((f * (0.25 + i * 0.05)) % 2000) * 0.15; const w = 520 + hash(i, 3) * 520;
      return <path key={i} d={`M${x},${y} q${w * 0.25},-${18 + i * 3} ${w * 0.5},-6 t${w * 0.5},4 q-${w * 0.45},${16 + i * 2} -${w},2 z`} fill={morning ? '#fff4e6' : i < 2 ? '#ff9a6a' : '#8a4c7a'} opacity={morning ? 0.5 : 0.55 - i * 0.07} />; })}</Svg>
  </AbsoluteFill>;
};

// ---------- ridges ----------
const ridgePts = (seed, base, amp, w0 = -500, w1 = 1600, step = 18, freq = 0.0042) => {
  const pts = []; for (let x = w0; x <= w1; x += step) pts.push([x, base - fbm(x * freq, seed) * amp]); return pts;
};
/** ink-outlined ridge silhouette with a rim-lit top edge. base/amp in px. `rimO` = rim brightness (key light behind = west). */
export const Ridge = ({seed = 1, base = 1200, amp = 260, fill = AN.ridgeMid, rim = AN.rim, rimO = 0.9, ink = 5, freq = 0.0042, bottom = 2600, hatch = false}) => {
  const pts = ridgePts(seed, base, amp, -600, 1700, 16, freq);
  const top = 'M' + pts.map((p) => p.join(',')).join(' L');
  const d = top + ` L1700,${bottom} L-600,${bottom} Z`;
  return <Svg>
    <path d={d} fill={fill} stroke={AN.ink} strokeWidth={ink} strokeLinejoin="round" />
    {rimO > 0 && <path d={top} fill="none" stroke={rim} strokeWidth={4} opacity={rimO} transform="translate(0,3)" strokeLinejoin="round" />}
    {hatch && pts.filter((_, i) => i % 5 === 0).map((p, i) => <path key={i} d={`M${p[0]},${p[1] + 30} l${-20 - hash(i, seed) * 30},${70 + hash(i, seed + 1) * 90}`} stroke={AN.ink} strokeWidth={3} opacity={0.35} />)}
  </Svg>;
};

// ---------- the object: matte black featureless triangle (no lights) ----------
/** x,y centre px; w = wingspan px; tilt deg; bank 0..1 squashes for a banking turn; trail 0..1 motion streak strength; dir = streak direction (1 = moving right) */
export const Triangle = ({x, y, w = 420, tilt = 0, bank = 0, trail = 0, dir = 1, edge = 0.35}) => {
  const h = w * 0.3 * (1 - bank * 0.7), th = Math.max(5, w * 0.045);
  const P = `${-w / 2},${h * 0.45} ${w / 2},${h * 0.45} 0,${-h * 0.55}`;
  return <g transform={`translate(${x},${y}) rotate(${tilt})`}>
    {trail > 0 && Array.from({length: 6}, (_, i) => <polygon key={i} points={P} fill="#05050a" opacity={trail * (0.32 - i * 0.05)} transform={`translate(${-dir * (i + 1) * w * 0.22 * trail},${i * 2})`} />)}
    {trail > 0 && Array.from({length: 9}, (_, i) => { const yy = (hash(i, 3) - 0.5) * h * 1.2; const L = w * (0.8 + hash(i, 5) * 1.6) * trail;
      return <line key={'s' + i} x1={-dir * w * 0.45} y1={yy} x2={-dir * (w * 0.45 + L)} y2={yy} stroke="#fff3df" strokeWidth={2 + hash(i, 6) * 2} opacity={0.5 * trail} strokeLinecap="round" />; })}
    <polygon points={`${-w / 2},${h * 0.45} ${w / 2},${h * 0.45} ${w / 2 - 2},${h * 0.45 + th} ${-w / 2 + 2},${h * 0.45 + th}`} fill="#020205" />
    <polygon points={P} fill="#07070c" stroke={AN.ink} strokeWidth={4} strokeLinejoin="round" />
    <polygon points={`0,${-h * 0.55} ${w / 2 - 6},${h * 0.45 - 2} 0,${h * 0.45 - 2}`} fill="#101018" opacity={0.9} />
    {/* faint sky-glow along the lower edge only (matte, nonreflective) */}
    <line x1={-w / 2 + 8} y1={h * 0.45 - 1} x2={w / 2 - 8} y2={h * 0.45 - 1} stroke="#ff9f6e" strokeWidth={2} opacity={edge} />
  </g>;
};

// ---------- characters ----------
/**
 * Anime agent, bust. Head 3/4 facing left by default (flip = face right). Units: head radius ~100 px at scale 1.
 * look -1..1 turns the face (features slide), tilt = head pitch in deg (negative = looking up), widen 0..1 eyes widen + pupils shrink,
 * mouth 0..1 open, talk = animate mouth by frame, hair 'spike'|'crop'|'cap', earpiece, binos (raised binoculars 0..1).
 */
export const Agent = ({x = 540, y = 1100, scale = 1, flip = false, look = 0, tilt = 0, widen = 0, mouth = 0, talk = false, seed = 1, hair = 'spike', earpiece = false, binos = 0, rimO = 1, jacket = AN.jacket, sweat = 0, radio = 0}) => {
  const f = useCurrentFrame();
  const bl = widen > 0.6 ? blink(f, seed) * 0.3 : blink(f, seed);
  const br = Math.sin(f * 0.11 + seed) * 0.012;
  const m = talk ? 0.15 + 0.6 * Math.abs(Math.sin(f * 0.55 + seed)) * (hash(Math.floor(f / 3), seed) > 0.25 ? 1 : 0.2) : mouth;
  const lx = look * 26, open = Math.max(0.04, (1 - bl) * (1 + widen * 0.35));
  const pr = 10.5 * (1 - widen * 0.4);
  const Eye = ({ex, ey, k = 1}) => <g transform={`translate(${ex},${ey}) scale(${k * 1.22},${open * 1.3})`}>
    <path d="M-24,2 Q-2,-17 24,-3 Q2,13 -24,2 Z" fill="#fbf7f0" stroke={AN.ink} strokeWidth={2.5} />
    <ellipse cx={-3 + look * 4} cy={0} rx={pr} ry={pr * 1.18} fill="#2a2140" />
    <ellipse cx={-3 + look * 4} cy={3} rx={pr * 0.65} ry={pr * 0.5} fill="#5d4c8a" />
    <circle cx={-7 + look * 4} cy={-4} r={3.4} fill="#fff" />
    <path d="M-26,3 Q-4,-20 26,-4" fill="none" stroke={AN.ink} strokeWidth={6} strokeLinecap="round" />
  </g>;
  const browY = -42 - widen * 12;
  return <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    {/* torso + jacket (breathing) */}
    <g transform={`scale(1,${1 + br})`} style={{transformOrigin: '0px 300px'}}>
      <path d="M-175,420 C-178,250 -120,175 -45,158 L45,158 C120,172 182,240 190,420 Z" fill={jacket} stroke={AN.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M35,160 C110,175 175,240 186,420 L60,420 C80,330 70,230 35,160 Z" fill={AN.jacketS} opacity={0.85} />
      <path d="M-40,158 L0,250 L40,158 Z" fill={AN.shirt} stroke={AN.ink} strokeWidth={4} />
      <path d="M-45,158 L-10,275 L-80,190 Z M45,158 L10,275 L80,190 Z" fill={jacket} stroke={AN.ink} strokeWidth={4} strokeLinejoin="round" />
      {rimO > 0 && <path d="M-175,420 C-178,250 -120,175 -45,158" fill="none" stroke={AN.rim} strokeWidth={6} opacity={0.85 * rimO} />}
    </g>
    {/* neck */}
    <path d="M-34,95 L-30,165 L34,165 L36,90 Z" fill={AN.skinS} stroke={AN.ink} strokeWidth={5} />
    <path d="M-32,112 C-10,130 20,128 35,108 L34,135 C10,150 -16,148 -31,135 Z" fill="#7a4a44" opacity={0.6} />
    {/* head */}
    <g transform={`rotate(${tilt * 0.9}, 0, 110)`}>
      <g transform={`translate(0,${tilt * 0.6})`}>
        <path d="M78,-20 C92,-12 92,22 74,30" fill={AN.skin} stroke={AN.ink} strokeWidth={5} />
        <path d="M-72,-95 C-104,-40 -104,25 -86,58 C-66,95 -40,118 -12,124 C14,126 40,108 62,76 C86,40 94,-20 80,-80 C62,-128 -40,-140 -72,-95 Z" fill={AN.skin} stroke={AN.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* cel shadow side (away from the rim) */}
        <path d="M30,-110 C70,-90 92,-40 86,10 C80,50 62,82 36,106 C52,60 60,0 30,-110 Z" fill={AN.skinS} opacity={0.75} />
        {rimO > 0 && <path d="M-72,-95 C-104,-40 -104,25 -86,58 C-66,95 -40,118 -12,124" fill="none" stroke={AN.skinR} strokeWidth={5} opacity={0.9 * rimO} />}
        <ellipse cx={-62 + lx} cy={34} rx={20} ry={9} fill="#ff8a7a" opacity={0.35} />
        <ellipse cx={40 + lx} cy={36} rx={14} ry={7} fill="#ff8a7a" opacity={0.25} />
        <path d="M-90,-40 C-60,-62 0,-70 80,-40 L80,-26 C10,-52 -50,-48 -92,-24 Z" fill={AN.skinS} opacity={0.55} />
        {/* face */}
        <g transform={`translate(${lx},0)`}>
          <path d={`M-70,${browY} Q-46,${browY - 9} -24,${browY + 2}`} stroke={AN.hair} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d={`M4,${browY + 1} Q22,${browY - 6} 38,${browY + 4}`} stroke={AN.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Eye ex={-46} ey={-12} k={1} />
          <Eye ex={22} ey={-11} k={0.78} />
          <path d={`M-14,10 L-24,46 L-10,48`} fill="none" stroke={AN.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          {m < 0.08 ? <path d="M-34,78 Q-14,82 4,77" fill="none" stroke={AN.ink} strokeWidth={4.5} strokeLinecap="round" />
            : <path d={`M-34,76 Q-14,${76 - 4} 4,76 Q-12,${80 + m * 30} -34,76 Z`} fill="#4a1f2a" stroke={AN.ink} strokeWidth={4} />}
          {sweat > 0 && <path d="M58,-30 q8,14 0,22 q-8,-8 0,-22 z" fill="#cfe6ff" stroke={AN.ink} strokeWidth={2} opacity={sweat} />}
        </g>
        {/* hair */}
        {hair === 'spike' && <>
          <path d="M-100,-20 C-120,-110 -40,-170 40,-150 C110,-132 118,-60 96,-4 L84,-40 L64,-66 L58,-30 L30,-78 L4,-50 L-6,-84 L-36,-56 L-52,-86 L-74,-44 L-86,-62 Z" fill={AN.hair} stroke={AN.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-60,-128 C-20,-150 30,-146 60,-128" stroke={AN.hairH} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.9} />
        </>}
        {hair === 'crop' && <>
          <path d="M-96,-30 C-110,-115 -30,-160 44,-146 C104,-132 112,-70 92,-20 C84,-58 60,-84 20,-88 C-20,-92 -60,-80 -96,-30 Z" fill="#2a2018" stroke={AN.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-58,-124 C-10,-144 36,-140 64,-120" stroke="#5a4636" strokeWidth={9} fill="none" strokeLinecap="round" />
        </>}
        {hair === 'cap' && <>
          <path d="M-100,-40 C-108,-120 -30,-158 46,-146 C102,-134 112,-80 98,-40 Z" fill="#1d2433" stroke={AN.ink} strokeWidth={6} />
          <path d="M-100,-42 L-160,-30 C-150,-18 -120,-14 -96,-22 Z" fill="#141a26" stroke={AN.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-70,-120 C-20,-140 30,-136 62,-118" stroke="#3a4560" strokeWidth={8} fill="none" />
        </>}
        {earpiece && <path d="M70,0 q16,4 14,26 q-2,30 -30,62" fill="none" stroke="#c9cfd8" strokeWidth={4} />}
        {binos > 0 && <g transform={`translate(${-60 + lx},${-12 + (1 - binos) * 260}) rotate(${-8})`} opacity={binos > 0.02 ? 1 : 0}>
          <rect x={-70} y={-30} width={70} height={60} rx={14} fill="#15161c" stroke={AN.ink} strokeWidth={5} />
          <rect x={10} y={-26} width={62} height={54} rx={13} fill="#15161c" stroke={AN.ink} strokeWidth={5} />
          <rect x={-8} y={-12} width={26} height={22} fill="#262833" stroke={AN.ink} strokeWidth={4} />
          <circle cx={-88} cy={0} r={20} fill="#2b3550" stroke={AN.ink} strokeWidth={5} /><circle cx={-92} cy={-6} r={5} fill={AN.rim} opacity={0.7} />
          <path d="M-40,30 C-40,90 -10,160 0,220" stroke={AN.skin} strokeWidth={34} strokeLinecap="round" fill="none" />
        </g>}
        {radio > 0 && <g transform={`translate(${-120 + lx},${110 + (1 - radio) * 240}) rotate(-24)`}>
          <rect x={-26} y={-60} width={52} height={120} rx={10} fill="#1b1d24" stroke={AN.ink} strokeWidth={5} />
          <rect x={-14} y={-48} width={28} height={26} fill="#3c7a5a" stroke={AN.ink} strokeWidth={3} />
          <line x1={14} y1={-60} x2={20} y2={-120} stroke={AN.ink} strokeWidth={7} strokeLinecap="round" />
          <path d="M-20,60 C-30,120 -20,170 -10,220" stroke={AN.skin} strokeWidth={36} strokeLinecap="round" fill="none" />
        </g>}
      </g>
    </g>
  </g>;
};

/** small full-body figure (side view, facing `dir`), inked limbs. pose 'run' | 'stand' | 'walk' | 'kneel' | 'point'; phase drives the cycle */
export const Figure = ({x, y, h = 300, dir = -1, pose = 'stand', phase = 0, coat = AN.jacket, skin = AN.skin, hat = false, rimO = 1, lookUp = 0}) => {
  const s = h / 300;
  let hipA = 0, hipB = 0, kA = 0, kB = 0, shA = 0.1, shB = -0.1, eA = 0.3, eB = 0.3, lean = 0, bob = 0, crouch = 0;
  if (pose === 'run') { const c = Math.sin(phase); hipA = c * 0.9; hipB = -c * 0.9; kA = Math.max(0, -c) * 1.4 + 0.2; kB = Math.max(0, c) * 1.4 + 0.2; shA = -c * 1.1; shB = c * 1.1; eA = eB = 1.4; lean = 0.28; bob = Math.abs(Math.cos(phase)) * 10; }
  if (pose === 'walk') { const c = Math.sin(phase); hipA = c * 0.45; hipB = -c * 0.45; kA = Math.max(0, -c) * 0.6; kB = Math.max(0, c) * 0.6; shA = -c * 0.4; shB = c * 0.4; eA = eB = 0.4; lean = 0.06; bob = Math.abs(Math.cos(phase)) * 4; }
  if (pose === 'kneel') { hipA = -1.4; kA = 2.6; hipB = 0.2; kB = 1.6; crouch = 70; shA = -1.2; eA = 0.6; lean = 0.35; }
  if (pose === 'point') { shA = -1.75; eA = 0.05; }
  const limb = (x0, y0, a1, l1, a2, l2, w, col) => { const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1; const x2 = x1 + Math.sin(a1 - a2 * (col === 'arm' ? -1 : 1)) * l2, y2 = y1 + Math.cos(a1 - a2 * (col === 'arm' ? -1 : 1)) * l2;
    const d = `M${x0},${y0} L${x1},${y1} L${x2},${y2}`; const c = col === 'arm' ? coat : '#1b1f2c';
    return <><path d={d} stroke={AN.ink} strokeWidth={w + 9} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></>; };
  return <g transform={`translate(${x},${y - bob * s}) scale(${dir * s},${s})`}>
    <ellipse cx={0} cy={4 + bob} rx={60} ry={10} fill="#000" opacity={0.35} />
    <g transform={`translate(0,${crouch}) rotate(${lean * 57}, 0, -150)`}>
      {limb(0, -150, hipB, 78, kB, 78, 26, 'leg')}
      {limb(0, -150, shB * 0 + 0, 0, 0, 0, 0, 'leg') && null}
      <g>{limb(6, -250, shB, 58, eB, 56, 20, 'arm')}</g>
      <path d="M-28,-262 C-34,-220 -30,-170 -26,-140 L28,-140 C32,-180 34,-226 26,-262 Z" fill={coat} stroke={AN.ink} strokeWidth={6} strokeLinejoin="round" />
      {rimO > 0 && <path d="M-28,-262 C-34,-220 -30,-170 -26,-140" stroke={AN.rim} strokeWidth={5} fill="none" opacity={0.8 * rimO} />}
      {limb(0, -150, hipA, 78, kA, 78, 26, 'leg')}
      <g transform={`rotate(${-lookUp * 25}, 0, -270)`}>
        <circle cx={6} cy={-292} r={27} fill={skin} stroke={AN.ink} strokeWidth={5} />
        <path d="M-20,-300 C-24,-326 10,-334 30,-312 L22,-298 C10,-310 -4,-306 -20,-300 Z" fill={hat ? '#1d2433' : AN.hair} stroke={AN.ink} strokeWidth={4} />
        {hat && <path d="M24,-306 L52,-302 L26,-296 Z" fill="#141a26" stroke={AN.ink} strokeWidth={3} />}
        <circle cx={26} cy={-292} r={3} fill={AN.ink} />
      </g>
      {limb(-6, -250, shA, 58, eA, 56, 20, 'arm')}
    </g>
  </g>;
};

// ---------- environment pieces ----------
/** hilltop observation post: rocky crest + tripod sensor + mast + sandbag wall, drawn at (x,y) ground point */
export const ObsPost = ({x = 540, y = 1500, scale = 1, rimO = 1, tripodDir = 1}) => <g transform={`translate(${x},${y}) scale(${scale})`}>
  <path d="M-700,0 C-500,-40 -260,-90 -60,-96 C160,-100 420,-60 700,10 L700,400 L-700,400 Z" fill="#17132a" stroke={AN.ink} strokeWidth={6} />
  {rimO > 0 && <path d="M-700,0 C-500,-40 -260,-90 -60,-96" fill="none" stroke={AN.rim} strokeWidth={5} opacity={0.7 * rimO} />}
  {Array.from({length: 7}, (_, i) => <ellipse key={i} cx={-300 + i * 70} cy={-80 + Math.abs(i - 3) * 6} rx={44} ry={20} fill="#3a3a33" stroke={AN.ink} strokeWidth={4} />)}
  <g transform={`translate(260,-90) scale(${tripodDir},1)`}>
    <line x1={0} y1={0} x2={-40} y2={130} stroke={AN.ink} strokeWidth={9} /><line x1={0} y1={0} x2={40} y2={130} stroke={AN.ink} strokeWidth={9} /><line x1={0} y1={0} x2={0} y2={140} stroke={AN.ink} strokeWidth={9} />
    <rect x={-20} y={-60} width={110} height={52} rx={8} fill="#2a2e3a" stroke={AN.ink} strokeWidth={5} /><circle cx={92} cy={-34} r={18} fill="#1c2a44" stroke={AN.ink} strokeWidth={5} />
  </g>
  <line x1={-420} y1={-60} x2={-420} y2={-460} stroke={AN.ink} strokeWidth={8} />
  {[0, 1, 2].map((i) => <line key={i} x1={-460 + i * 8} y1={-420 + i * 70} x2={-380 - i * 8} y2={-420 + i * 70} stroke={AN.ink} strokeWidth={5} />)}
</g>;

/** desert shrub (canyon floor), inked */
export const Shrub = ({x, y, s = 1, sway = 0, col = '#5d7a4a'}) => <g transform={`translate(${x},${y}) scale(${s})`}>
  {Array.from({length: 9}, (_, i) => { const a = -1.2 + i * 0.3 + Math.sin(sway + i) * 0.04; return <path key={i} d={`M0,0 Q${Math.sin(a) * 30},${-40} ${Math.sin(a) * 70},${-Math.cos(a) * 90}`} stroke={AN.ink} strokeWidth={7} fill="none" strokeLinecap="round" />; })}
  {Array.from({length: 9}, (_, i) => { const a = -1.2 + i * 0.3 + Math.sin(sway + i) * 0.04; return <circle key={i} cx={Math.sin(a) * 70} cy={-Math.cos(a) * 90} r={22} fill={col} stroke={AN.ink} strokeWidth={4} />; })}
</g>;

// ---------- atmosphere + finish ----------
/** drifting haze motes (DOM, cheap) */
export const Motes = ({n = 34, color = '#ffd8a8', o = 0.5, seed = 2, speed = 1}) => {
  const f = useCurrentFrame();
  return <Svg>{Array.from({length: n}, (_, i) => { const x = (hash(i, seed) * 1200 + f * (0.6 + hash(i, seed + 1)) * speed) % 1200 - 60; const y = (hash(i, seed + 2) * 2000 - f * 0.35 * speed + 4000) % 2000 - 40; const r = 1.5 + hash(i, seed + 3) * 4;
    return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o * (0.3 + 0.7 * Math.abs(Math.sin(f * 0.05 + i)))} />; })}</Svg>;
};
/** low haze band */
export const Haze = ({y = 1250, h = 380, color = '255,170,130', o = 0.35}) => <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(${color},0) ${(y - h / 2) / 19.2}%, rgba(${color},${o}) ${y / 19.2}%, rgba(${color},0) ${(y + h / 2) / 19.2}%)`}} />;

/** film finish: grain (4 PNGs cycled), vignette, light-leak flare at given frames (cut times), slight warm/cold split */
export const AnimeFinish = ({leaks = [], vignette = 0.55, grainO = 0.22}) => {
  const f = useCurrentFrame();
  let leak = 0, lx = 0;
  for (const c of leaks) { const d = f - c; if (d >= -3 && d < 9) { leak = Math.max(leak, d < 0 ? (d + 3) / 3 : 1 - d / 9); lx = (d + 3) / 12; } }
  const gi = f % 4, gx = Math.floor(hash(f, 11) * 200), gy = Math.floor(hash(f, 12) * 300);
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(5,4,12,${vignette}) 100%)`}} />
    {leak > 0 && <AbsoluteFill style={{mixBlendMode: 'screen', opacity: leak * 0.85, background: `radial-gradient(ellipse 60% 45% at ${10 + lx * 80}% ${30 + lx * 30}%, rgba(255,170,90,0.95) 0%, rgba(255,90,60,0.5) 35%, rgba(0,0,0,0) 70%)`}} />}
    <AbsoluteFill style={{opacity: grainO, mixBlendMode: 'overlay', backgroundImage: `url(${staticFile(`animenoir/grain${gi}.png`)})`, backgroundSize: '540px 960px', backgroundPosition: `${gx}px ${gy}px`}} />
  </AbsoluteFill>;
};

/** "RECREATION" tag (top-left, inside the safe area) */
export const RecTag = ({text = 'RECREATION'}) => <div style={{position: 'absolute', top: 240, left: 64, fontFamily: 'Special Elite', fontSize: 30, letterSpacing: 4, color: '#f3e7d0', opacity: 0.8, padding: '4px 12px', border: '2px solid rgba(243,231,208,0.6)', background: 'rgba(10,8,20,0.35)'}}>{text}</div>;

/** slammed title text: lines [{text, red}], appears at frame `at` with a scale slam */
export const Slam = ({lines, at = 0, y = 300, size = 104, out = 9999}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); if (f < at || f > out) return null;
  const s = spring({frame: f - at, fps, config: {damping: 10, stiffness: 260, mass: 0.6}, from: at === 0 ? 1.12 : 1.6, to: 1});
  const o = (at === 0 ? 1 : clamp01((f - at) / 3)) * clamp01((out - f) / 4 + 0.001);
  return <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `scale(${s})`, opacity: o}}>
    {lines.map((l, i) => <div key={i} style={{fontFamily: l.red ? 'DM Serif Display' : 'Lilita One', fontStyle: l.red ? 'italic' : 'normal', fontSize: (l.size || size) * (l.red ? 1.08 : 1), color: l.red ? AN.red : AN.white, letterSpacing: l.red ? 1 : 3, lineHeight: 1.04,
      WebkitTextStroke: l.red ? '0px' : '3px #0b0a14', textShadow: '0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.7)'}}>{l.text}</div>)}
  </div>;
};

/** typewriter quote strip (exact source quote), e.g. FBI FD-302 line */
export const QuoteStrip = ({text, source, at = 0, out = 9999, y = 880}) => {
  const f = useCurrentFrame(); if (f < at || f > out) return null;
  const n = Math.floor((f - at) * 2.4); const o = clamp01((f - at) / 5) * clamp01((out - f) / 5);
  return <div style={{position: 'absolute', top: y, left: 70, width: 940, opacity: o, transform: `rotate(-1.2deg) translateY(${(1 - clamp01((f - at) / 6)) * 20}px)`}}>
    <div style={{background: AN.paper, padding: '22px 28px', border: `4px solid ${AN.ink}`, boxShadow: '8px 10px 0 rgba(0,0,0,0.55)'}}>
      <div style={{fontFamily: 'Special Elite', fontSize: 40, lineHeight: 1.25, color: '#1d1a16'}}>“{text.slice(0, n)}{n < text.length ? '▌' : '”'}</div>
      <div style={{fontFamily: 'Lilita One', fontSize: 28, marginTop: 10, color: AN.red, letterSpacing: 2}}>{source}</div>
    </div>
  </div>;
};

/** fonts (OFL files in public/fonts) */
export const AnimeFonts = () => <style>{`
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'DM Serif Display';font-style:italic;src:url('${staticFile('fonts/DMSerifDisplay-Italic.ttf')}') format('truetype');}
  @font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'Fredoka';src:url('${staticFile('fonts/Fredoka-Variable.ttf')}') format('truetype');font-weight:300 700;}
`}</style>;
