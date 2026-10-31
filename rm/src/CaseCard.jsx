import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
// Animated case-file title card: date stamp, typewriter title, location line, grain.
const E = Easing.bezier(0.16, 1, 0.3, 1);
export const CaseCard = ({kicker, title, date, place}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = spring({frame: f - 8, fps, config: {damping: 14, stiffness: 160, mass: 0.6}});
  const chars = Math.floor(interpolate(f, [20, 60], [0, title.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const line = interpolate(f, [55, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E});
  const zoom = interpolate(f, [0, 120], [1, 1.08]);
  return (
    <AbsoluteFill style={{background: '#0c0b09', fontFamily: 'DejaVu Sans Mono, monospace', color: '#e9e2d0', transform: `scale(${zoom})`}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>
        <div style={{fontSize: 46, letterSpacing: 18, opacity: interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'})}}>{kicker}</div>
        <div style={{fontSize: 96, fontWeight: 700, textAlign: 'center', width: 900, minHeight: 240}}>{title.slice(0, chars)}</div>
        <div style={{height: 6, width: 700 * line, background: '#b3261e'}} />
        <div style={{fontSize: 44, opacity: line}}>{place}</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 360, right: 110, border: '8px solid #b3261e', color: '#b3261e', padding: '14px 26px', fontSize: 54, fontWeight: 700,
        transform: `rotate(-12deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`, opacity: stamp}}>{date}</div>
    </AbsoluteFill>
  );
};
