import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';

/**
 * ANIMATION UPGRADE 2026-10-22. Cheap DOM finishing layers (put them in <Stage overlay> or above the Stage).
 */
const GRADES = {
  // [shadow tint, highlight tint, strength] applied as soft-light gradient + a subtle colour wash
  tealOrange: ['#0e4a5a', '#ffb070', 0.32], cold: ['#0b1e3a', '#bfe3ff', 0.3], warm: ['#4a1e0a', '#ffd08a', 0.28],
  horror: ['#1a0610', '#9fbf9a', 0.34], night: ['#050a30', '#7fa0ff', 0.3], golden: ['#3a1a40', '#ffcf7a', 0.34],
};
/** Colour grade (one look per Short = series consistency). <Grade look="tealOrange" /> ; strength overrides. */
export const Grade = ({look = 'tealOrange', strength}) => {
  const [sh, hi, k0] = GRADES[look] || GRADES.tealOrange; const k = strength ?? k0;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${hi} 0%, ${sh} 100%)`, mixBlendMode: 'soft-light', opacity: k}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${hi}33 0%, transparent 70%)`, mixBlendMode: 'screen', opacity: k * 0.8}} />
  </AbsoluteFill>;
};
/** Impact flash: radial screen-blend bloom from a point, capped at 0.8 (never a full white frame). <Flash at={30} x="50%" y="55%" /> */
export const Flash = ({at = 0, len = 10, x = '50%', y = '50%', color = '#fff6dc', max = 0.8}) => {
  const f = useCurrentFrame(); const t = (f - at) / len; if (t < 0 || t > 1) return null;
  const o = max * (t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 2));
  return <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle at ${x} ${y}, ${color} 0%, ${color}88 25%, transparent 70%)`, mixBlendMode: 'screen', opacity: o}} />;
};
/** Speed streaks for whip pans / fast moves (horizontal or vertical), frames from..to. <WhipStreaks from={20} to={30} dir="h" /> */
export const WhipStreaks = ({from = 0, to = 10, dir = 'h', color = '#ffffff', seed = 1}) => {
  const f = useCurrentFrame(); if (f < from || f > to) return null;
  const t = (f - from) / Math.max(1, to - from); const o = Math.sin(Math.PI * t);
  const lines = Array.from({length: 26}, (_, i) => { const r = Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1; return {p: r * 100, w: 1 + (i % 4) * 2, l: 30 + r * 60, s: (i * 37 + f * 53) % 140 - 40}; });
  return <AbsoluteFill style={{pointerEvents: 'none', opacity: o * 0.85}}>
    <AbsoluteFill style={{backdropFilter: 'none', background: dir === 'h' ? 'linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.22), rgba(255,255,255,0.10))' : 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.22), rgba(255,255,255,0.10))'}} />
    {lines.map((q, i) => <div key={i} style={dir === 'h' ? {position: 'absolute', top: `${q.p}%`, left: `${q.s}%`, width: `${q.l}%`, height: q.w, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.55}
      : {position: 'absolute', left: `${q.p}%`, top: `${q.s}%`, height: `${q.l}%`, width: q.w, background: `linear-gradient(180deg, transparent, ${color}, transparent)`, opacity: 0.55}} />)}
  </AbsoluteFill>;
};
/**
 * True motion blur via @remotion/motion-blur (renders the children `samples` times at sub-frame offsets and averages them).
 * Under swangle every sample is a full extra 3D render, so only wrap SHORT fast moments (a whip, a crash, a fall), e.g.
 * <Sequence from={120} durationInFrames={10}><MotionBlur samples={4}><Shot/></MotionBlur></Sequence>. Cost ~ samples x shot cost.
 */
export const MotionBlur = ({samples = 4, shutterAngle = 200, children}) => <CameraMotionBlur samples={samples} shutterAngle={shutterAngle}>{children}</CameraMotionBlur>;
/** Light leak / lens flare sweep across the frame (golden-hour beats, scene transitions). <LightLeak from={0} len={40} /> */
export const LightLeak = ({from = 0, len = 40, color = '#ffb46a', angle = 115}) => {
  const f = useCurrentFrame(); const t = (f - from) / len; if (t < 0 || t > 1) return null;
  const x = interpolate(t, [0, 1], [-60, 160]);
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: Math.sin(Math.PI * t) * 0.6,
    background: `linear-gradient(${angle}deg, transparent ${x - 30}%, ${color}aa ${x}%, transparent ${x + 25}%)`}} />;
};
