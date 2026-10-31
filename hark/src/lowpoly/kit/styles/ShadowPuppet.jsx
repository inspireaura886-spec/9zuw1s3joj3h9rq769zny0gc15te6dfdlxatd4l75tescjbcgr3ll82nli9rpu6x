// STYLE f (2026-10-30): silhouette / shadow-puppet reenactment. Backlit paper screen (warm glow, fibre texture, flickering lamp
// hotspot), jointed black silhouettes (walk / stand / point / fall / reach) on visible rods, set pieces (house, tree, moon, lamppost,
// train, gate). 2D SVG, cheap. Figures move along x; poses switch at `at` frames. Pure function of frame.
// <ShadowPuppet dur={105} set={['moon', 'house', 'tree']} actors={[{x0: 200, x1: 560, pose: 'walk', hat: true}, {x0: 900, x1: 760, pose: 'stand', then: {at: 60, pose: 'fall'}}]} />
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cl, lerp, ramp, eio, h1} from './util.js';

const INK = '#120c08';
const Limb = ({x, y, len, ang, w = 16}) => { const a = ang * Math.PI / 180; return <line x1={x} y1={y} x2={x + Math.sin(a) * len} y2={y + Math.cos(a) * len} stroke={INK} strokeWidth={w} strokeLinecap="round" />; };
const end = (x, y, len, ang) => { const a = ang * Math.PI / 180; return [x + Math.sin(a) * len, y + Math.cos(a) * len]; };

const Figure = ({x, base = 1500, s = 1, pose, ph, t, hat, dress, flip}) => {
  // angles in degrees from straight down (0 = hanging down, +90 = forward)
  let lA = 0, rA = 0, lL = 0, rL = 0, lean = 0, fall = 0;
  if (pose === 'walk') { const k = Math.sin(ph); lA = 28 * k; rA = -28 * k; lL = -26 * k; rL = 26 * k; }
  else if (pose === 'stand') { lA = 6 + Math.sin(ph * 0.3) * 3; rA = -6; }
  else if (pose === 'point') { rA = lerp(0, 100, eio(t)); lA = 5; lean = 4 * t; }
  else if (pose === 'reach') { lA = rA = lerp(0, 150, eio(t)); lean = -6 * t; }
  else if (pose === 'fall') { fall = eio(t) * 88; lA = 40 * t; rA = 70 * t; lL = 20 * t; }
  const bob = pose === 'walk' ? Math.abs(Math.cos(ph)) * -6 : 0;
  const hip = [0, -170], neck = [0, -330];
  return <g transform={`translate(${x} ${base + bob}) scale(${flip ? -s : s} ${s}) rotate(${fall + lean})`}>
    {/* rod */}
    <line x1={0} y1={-170} x2={-30} y2={400} stroke={INK} strokeWidth={5} opacity={0.75} />
    <Limb x={-14} y={hip[1]} len={170} ang={lL} w={24} /><Limb x={14} y={hip[1]} len={170} ang={rL} w={24} />
    {dress ? <path d={`M -36 ${neck[1] + 20} L 36 ${neck[1] + 20} L 70 ${hip[1] + 40} L -70 ${hip[1] + 40} Z`} fill={INK} />
      : <rect x={-34} y={neck[1] + 10} width={68} height={170} rx={22} fill={INK} />}
    <Limb x={-26} y={neck[1] + 26} len={150} ang={lA} w={20} /><Limb x={26} y={neck[1] + 26} len={150} ang={rA} w={20} />
    <circle cx={0} cy={neck[1] - 40} r={42} fill={INK} />
    <polygon points={`38,${neck[1] - 46} 56,${neck[1] - 36} 38,${neck[1] - 28}`} fill={INK} />
    {hat && <><rect x={-60} y={neck[1] - 80} width={120} height={12} rx={4} fill={INK} /><rect x={-36} y={neck[1] - 150} width={72} height={76} rx={6} fill={INK} /></>}
  </g>;
};

const SetPiece = ({kind, x, f}) => {
  if (kind === 'moon') return <g opacity={0.9}><circle cx={x} cy={430} r={95} fill="#fff1c8" opacity={0.55} /><circle cx={x + 34} cy={410} r={85} fill="#f4c27a" opacity={0.0} /></g>;
  if (kind === 'house') return <g fill={INK}><rect x={x - 170} y={1160} width={340} height={340} /><polygon points={`${x - 210},1170 ${x},990 ${x + 210},1170`} /><rect x={x + 70} y={1010} width={40} height={90} />
    <rect x={x - 110} y={1240} width={70} height={80} fill="#ffcf7a" opacity={0.55 + 0.3 * Math.sin(f * 0.4) ** 2} /><rect x={x + 40} y={1240} width={70} height={80} fill="#ffcf7a" opacity={0.6} /></g>;
  if (kind === 'tree') return <g fill={INK}><path d={`M ${x - 18} 1500 L ${x - 10} 1150 L ${x + 10} 1150 L ${x + 18} 1500 Z`} />
    {[[-90, 1110, 110], [70, 1080, 120], [-10, 980, 130], [-110, 1000, 80], [100, 990, 80]].map(([dx, y, r], i) => <circle key={i} cx={x + dx + Math.sin(f * 0.05 + i) * 4} cy={y} r={r} />)}</g>;
  if (kind === 'lamppost') return <g fill={INK}><rect x={x - 8} y={1060} width={16} height={440} /><rect x={x - 26} y={1020} width={52} height={50} rx={6} /><circle cx={x} cy={1045} r={60} fill="#fff1c8" opacity={0.35} /></g>;
  if (kind === 'gate') return <g stroke={INK} strokeWidth={12} fill="none"><path d={`M ${x - 140} 1500 V 1180 Q ${x} 1080 ${x + 140} 1180 V 1500`} />{[-90, -45, 0, 45, 90].map((d) => <line key={d} x1={x + d} y1={1500} x2={x + d} y2={1150} />)}</g>;
  if (kind === 'train') { const tx = x - f * 6; return <g fill={INK}><rect x={tx} y={1310} width={520} height={170} rx={14} /><rect x={tx + 20} y={1250} width={140} height={70} /><rect x={tx + 60} y={1200} width={40} height={60} />
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={tx + 70 + i * 130} cy={1490} r={38} />)}{[0, 1, 2].map((i) => <rect key={'w' + i} x={tx + 200 + i * 100} y={1340} width={70} height={60} fill="#ffcf7a" opacity={0.6} />)}
    {[0, 1, 2].map((i) => <circle key={'s' + i} cx={tx + 80 - i * 40 + Math.sin(f * 0.2 + i) * 10} cy={1170 - i * 60} r={30 + i * 12} fill={INK} opacity={0.5 - i * 0.12} />)}</g>; }
  return null;
};

export const ShadowPuppet = ({dur = 105, actors = [{x0: 180, x1: 600, pose: 'walk', hat: true}, {x0: 860, x1: 860, pose: 'stand', dress: true, flip: true, then: {at: 62, pose: 'point'}}],
  set = ['moon', 'house', 'tree'], glow = '#ffb45a', paper = '#f3d9a4', label}) => {
  const f = useCurrentFrame();
  const flick = 0.92 + 0.08 * Math.sin(f * 0.9) * Math.sin(f * 0.37 + 1);
  const hx = 540 + Math.sin(f * 0.03) * 60;
  const setX = {moon: 780, house: 300, tree: 820, lamppost: 640, gate: 540, train: 1200};
  return <AbsoluteFill style={{background: '#0a0604'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="sp-lamp" cx={hx / 1080} cy="0.45" r="0.75"><stop offset="0" stopColor="#fff4d6" /><stop offset="0.35" stopColor={paper} /><stop offset="0.8" stopColor={glow} /><stop offset="1" stopColor="#5a2a0c" /></radialGradient>
        <filter id="sp-soft"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="sp-fibre"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.6" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 0.35 0" /></filter>
      </defs>
      {/* the screen */}
      <rect x={40} y={180} width={1000} height={1500} rx={10} fill="url(#sp-lamp)" opacity={flick} />
      <rect x={40} y={180} width={1000} height={1500} rx={10} filter="url(#sp-fibre)" />
      <g filter="url(#sp-soft)">
        {set.map((k) => <SetPiece key={k} kind={k} x={setX[k] ?? 540} f={f} />)}
        <rect x={40} y={1500} width={1000} height={180} fill={INK} />
        {actors.map((a, i) => {
          const tw = eio(ramp(f, a.from ?? 0, a.to ?? dur));
          const th = a.then && f >= a.then.at; const pose = th ? a.then.pose : a.pose;
          const t = th ? ramp(f, a.then.at, a.then.at + (a.then.len ?? 14)) : ramp(f, 0, 14);
          return <Figure key={i} x={lerp(a.x0, a.x1, th && a.then.pose !== 'walk' ? eio(ramp(a.then.at, a.from ?? 0, a.to ?? dur)) : tw)} s={a.s ?? 1} pose={pose} ph={f / 4 + i} t={t} hat={a.hat} dress={a.dress} flip={a.flip} />;
        })}
      </g>
      {/* frame + lamp falloff */}
      <rect x={40} y={180} width={1000} height={1500} rx={10} fill="none" stroke="#2a1a0c" strokeWidth={28} />
    </svg>
    {label && <div style={{position: 'absolute', top: 236, width: '100%', textAlign: 'center', fontFamily: 'DM Serif Display, Georgia, serif', fontStyle: 'italic', fontSize: 64, color: '#2a1608', opacity: ramp(f, 4, 14)}}>{label}</div>}
  </AbsoluteFill>;
};
