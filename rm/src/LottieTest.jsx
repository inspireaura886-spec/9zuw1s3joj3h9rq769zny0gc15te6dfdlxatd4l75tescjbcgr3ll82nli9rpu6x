// 3 s proof clip: a Lottie stick figure walks across, and a hand-drawn roughjs circle marks it (roughjs = MIT, sketchy annotations).
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import rough from 'roughjs';
import {useMemo} from 'react';
import {LottieClip} from './LottieClip.jsx';
const RoughCircle = ({progress}) => {
  const paths = useMemo(() => {
    const g = rough.generator();
    const d = g.ellipse(540, 960, 620, 620, {stroke: '#e3262e', strokeWidth: 8, roughness: 2.2, seed: 7});
    return g.toPaths(d);
  }, []);
  return (<svg width={1080} height={1920} style={{position: 'absolute'}}>
    {paths.map((p, i) => <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none"
      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />)}
  </svg>);
};
export const LottieTest = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 90], [-250, 250], {easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const draw = interpolate(f, [30, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<AbsoluteFill style={{backgroundColor: '#0b0c10'}}>
    <div style={{position: 'absolute', left: 290 + x, top: 710, width: 500, height: 500}}>
      <LottieClip src="lottie/stick-walk.json" style={{width: 500, height: 500}} />
    </div>
    <RoughCircle progress={draw} />
    <div style={{position: 'absolute', top: 1400, width: '100%', textAlign: 'center', color: 'white',
      fontFamily: 'Arial Black, sans-serif', fontSize: 70, letterSpacing: 2}}>LOTTIE TEST</div>
  </AbsoluteFill>);
};
