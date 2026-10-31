// STYLE d (2026-10-30): top-down diorama with tilt-shift miniature feel. High camera, long lens, slow drift; saturated toy colours;
// fake depth of field = blurred copy bands top + bottom (CSS backdrop-filter with a gradient mask, no 3D DOF pass); stop-motion
// time (animation steps every `step` frames) sells "miniature". Default scene = a small village street at dusk; pass children to replace.
// <TiltShift dur={105} label="WOOLPIT, 12TH CENTURY" />   <TiltShift>{my 3D diorama}</TiltShift>
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Building, Tree, Fence} from '../Building.jsx';
import {Person} from '../Characters.jsx';
import {Car} from '../Vehicles.jsx';
import {Post} from '../Post.jsx';
import {cl, lerp, eio, ramp} from './util.js';

const Cam = ({f, dur, target, dist, ang}) => {
  const {camera} = useThree(); const t = eio(cl(f / dur));
  const a = lerp(ang - 0.18, ang + 0.18, t); const tilt = lerp(1.05, 0.95, t);
  const d = lerp(dist * 1.08, dist * 0.94, t);
  camera.position.set(target[0] + Math.sin(a) * Math.cos(tilt) * d, target[1] + Math.sin(tilt) * d, target[2] + Math.cos(a) * Math.cos(tilt) * d);
  camera.fov = 17; camera.near = 1; camera.far = 400; camera.updateProjectionMatrix(); camera.lookAt(...target); return null;
};

export const VillageDiorama = ({f}) => {
  const walkers = [[-3, 0.0, 0.9, '#c0392b'], [2, 1.2, -0.7, '#2f6db5'], [-6, 2.1, 0.9, '#d4a017'], [5, 0.5, -0.9, '#6a3d9a']];
  return <>
    {/* ground tile = the diorama base */}
    <mesh position={[0, -0.5, 0]}><boxGeometry args={[30, 1, 22]} /><meshLambertMaterial color="#5f8f3a" flatShading /></mesh>
    <mesh position={[0, -1.6, 0]}><boxGeometry args={[30.4, 1.2, 22.4]} /><meshLambertMaterial color="#6b4a2f" /></mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 3.2]} /><meshLambertMaterial color="#b89a6a" /></mesh>
    <Building position={[-8, 0, -4.5]} w={4} d={3.2} h={2.6} color="#e7d3a8" roofColor="#b8452f" lit={0.35} frame={f} />
    <Building position={[-2, 0, -5]} w={3.4} d={3} h={3.2} floors={2} color="#d9c8b4" roofColor="#7a3b2e" lit={0.4} litSeed={3} frame={f} />
    <Building position={[4, 0, -4.6]} w={4.6} d={3.4} h={2.4} color="#f0e2c0" roofColor="#3f5a7a" lit={0.5} litSeed={5} frame={f} />
    <Building position={[-5, 0, 4.8]} rotation={Math.PI} w={4} d={3} h={2.4} color="#e2cfa0" roofColor="#8a3a2a" lit={0.7} litSeed={7} frame={f} />
    <Building position={[3, 0, 5]} rotation={Math.PI} w={5} d={3.4} h={3} floors={2} color="#cfc0a8" roofColor="#5a6a3a" lit={0.6} litSeed={9} frame={f} />
    {[[-12, -7], [10, -8], [11, 6], [-11, 7], [8.5, -2.8], [-12.5, 0.5], [12.5, 1]].map(([x, z], i) => <Tree key={i} position={[x, 0, z]} s={1.3 + (i % 3) * 0.3} kind={i % 2 ? 'pine' : 'round'} seed={i} frame={f} />)}
    <Fence from={[-14, 0, -2.2]} to={[-9, 0, -2.2]} posts={6} />
    <Fence from={[8, 0, 2.2]} to={[14, 0, 2.2]} posts={7} />
    {walkers.map(([x0, ph, z, c], i) => { const x = x0 + ((f * 0.05 + i * 3) % 18) - 9; return <Person key={i} position={[cl(x, -13, 13) * (i % 2 ? -1 : 1), 0, z]} rotation={i % 2 ? -Math.PI / 2 : Math.PI / 2} pose="walk" phase={f / 4 + ph} shirt={c} scale={0.5} />; })}
    <Car position={[((f * 0.12) % 34) - 17, 0, 0.0]} rotation={Math.PI / 2} dist={f * 0.12} color="#e2b23a" />
  </>;
};

export const TiltShift = ({dur = 105, target = [0, 0, 0], dist = 70, angle = 0.5, step = 2, blur = 9, band = 30, label, children, sky = '#2b3a52'}) => {
  const raw = useCurrentFrame(); const f = Math.floor(raw / step) * step; // stop-motion steps
  const {width, height} = useVideoConfig();
  const mask = (dir) => `linear-gradient(${dir}, black 0%, black ${band * 0.45}%, transparent ${band}%)`;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${sky} 0%, #10141c 100%)`}}>
      <AbsoluteFill style={{filter: 'saturate(1.45) contrast(1.08)'}}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}}>
          <Cam f={raw} dur={dur} target={target} dist={dist} ang={angle} />
          <ambientLight intensity={0.7} />
          <hemisphereLight args={['#ffd9b0', '#2a3a5a', 1.3]} />
          <directionalLight position={[-20, 30, 12]} intensity={2.8} color="#ffcf9a" />
          {children || <VillageDiorama f={f} />}
          <Post bloom={0.7} threshold={0.6} vignette={0.3} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* tilt-shift blur bands (fake DOF) */}
      <AbsoluteFill style={{pointerEvents: 'none', backdropFilter: `blur(${blur}px)`, WebkitMaskImage: mask('180deg'), maskImage: mask('180deg')}} />
      <AbsoluteFill style={{pointerEvents: 'none', backdropFilter: `blur(${blur}px)`, WebkitMaskImage: mask('0deg'), maskImage: mask('0deg')}} />
      {label && <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', top: 1220, width: '100%', textAlign: 'center'}}>
        <span style={{fontFamily: 'Lilita One', fontSize: 58, background: '#ffd93b', color: '#141414', padding: '8px 28px', borderRadius: 16, border: '5px solid #141414', letterSpacing: 2, opacity: ramp(raw, 4, 12)}}>{label}</span></div></AbsoluteFill>}
    </AbsoluteFill>
  );
};
