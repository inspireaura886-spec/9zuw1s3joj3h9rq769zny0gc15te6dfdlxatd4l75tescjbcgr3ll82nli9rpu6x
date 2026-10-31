// NOIR look demo (8 s, 240 f): rainy street crane-down to a walking silhouette, then an office lit through blinds with a swinging bulb that dies.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {ShotCam} from '../../lowpoly/kit/Camera.jsx';
import {Post} from '../../lowpoly/kit/Post.jsx';
import {Particles} from '../../lowpoly/kit/Particles.jsx';
import {FogLayer} from '../../lowpoly/kit/Light.jsx';

import {GrabProp, grabPaths} from '../../lowpoly/kit/Props.jsx';
import {usePreload} from '../../lowpoly/kit/glb.js';
import {NOIR, NoirStage, Silhouette, Streetlamp, Blinds, BlindsFloor, NoirRain, CityRow, NoirCar, HangingBulb, FogWall, WetStreet, NoirFinish, NoirTitle, NoirFonts} from '../NoirKit.jsx';

const Street = () => {
  const f = useCurrentFrame();
  const walkZ = interpolate(f, [0, 130], [-15, -6.5]);
  const carX = interpolate(f, [20, 110], [-26, 26], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <NoirStage density={0.03} overlay={<>
      <NoirTitle y={250} lines={[{text: '1 WITNESS.', at: 2}, {text: '0 FOOTPRINTS.', at: 14, red: true}]} sub="ELM STREET, 1:14 A.M." subAt={30} />
      <NoirFinish seed={1} />
    </>}>
      <ShotCam preset="push" from={[2.6, 8.5, 7]} to={[0.9, 1.25, 1.5]} look={[[0, 0.5, -16], [0, 1.7, -8]]} fov0={52} fov1={40} start={0} end={130} ease="out" drift={0.05} />
      <WetStreet />
      <CityRow side={-1} x={-6} zFrom={-48} zTo={8} seed={4} frame={f} offAt={70} offRate={0.5} />
      <CityRow side={1} x={6} zFrom={-48} zTo={8} seed={9} frame={f} offAt={90} offRate={0.4} />
      <CityRow side={0} x={-50} zFrom={-12} zTo={12} seed={2} frame={f} hMin={14} hMax={24} litFrac={0.2} />
      <Streetlamp position={[-3.6, 0, -6]} armDir={1} frame={f} seed={1} light />
      <Streetlamp position={[3.6, 0, -16]} armDir={-1} frame={f} seed={2} flick={0.4} dropout={0.18} />
      <Streetlamp position={[-3.6, 0, -27]} armDir={1} frame={f} seed={3} />
      <Streetlamp position={[3.6, 0, -38]} armDir={-1} frame={f} seed={4} />
      <Silhouette position={[0.2, 0, walkZ]} pose="walk" phase={f * 0.2} rim={NOIR.sodium} rimK={1.1} rimSide={[0, 1, -0.4]} />
      <NoirCar position={[carX, 0, -31]} heading={0} frame={f} beam={0.45} length={16} />
      <FogWall position={[0, 3, -36]} width={30} height={9} frame={f} opacity={0.2} />
      <FogLayer y={0.15} size={60} layers={3} thickness={1.2} opacity={0.12} color="#9fb2cc" frame={f} center={[0, -20]} />
      <NoirRain center={[0, 0, -10]} area={[14, 12, 26]} count={650} frame={f} />
      <Post bloom={1.25} threshold={0.42} vignette={0.5} />
    </NoirStage>
  );
};

const PROPS = ['old-radio', 'haunted-photo-wall'];
const Office = () => {
  const f = useCurrentFrame();
  const ready = usePreload(grabPaths(PROPS));
  return (
    <NoirStage density={0.045} fogColor="#1c222b" ambient={0.1} bg="radial-gradient(ellipse at 30% 40%, #1d232c 0%, #07090c 70%)" overlay={<>
      <NoirTitle y={250} lines={[{text: 'HE LOCKED IT', at: 4}, {text: 'FROM INSIDE.', at: 16, red: true}]} />
      <NoirFinish seed={7} />
    </>}>
      <ShotCam preset="push" from={[3.6, 1.9, 2.4]} to={[1.2, 1.55, 0.6]} look={[[-3.4, 1.7, -1.6], [-3.6, 1.8, -1.0]]} fov0={50} fov1={42} start={0} end={110} ease="inout" drift={0.04} />
      {/* room shell */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 14]} /><meshStandardMaterial color="#14171c" roughness={0.6} metalness={0.2} /></mesh>
      <mesh position={[0, 3, -4]}><planeGeometry args={[14, 6]} /><meshStandardMaterial color="#1b1f26" roughness={0.95} /></mesh>
      <mesh position={[-4.2, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[14, 6]} /><meshStandardMaterial color="#181c22" roughness={0.95} /></mesh>
      <Blinds position={[-4.15, 2.1, -1.2]} rotation={[0, Math.PI / 2, 0]} width={2.2} height={2.3} dir={[0.85, -0.42, 0.25]} length={7.5} opacity={0.55} frame={f} />
      <BlindsFloor position={[-1.4, 0.02, -0.7]} size={[2.6, 3.6]} rotation={Math.PI / 2 + 0.28} frame={f} opacity={0.38} />
      {/* desk + chair */}
      <mesh position={[1.2, 0.78, -1.6]}><boxGeometry args={[2.2, 0.08, 1.0]} /><meshStandardMaterial color="#0d0b0a" roughness={0.5} /></mesh>
      {[[0.2, -2.0], [2.2, -2.0], [0.2, -1.2], [2.2, -1.2]].map(([x, z], i) => <mesh key={i} position={[x, 0.38, z]}><boxGeometry args={[0.07, 0.76, 0.07]} /><meshStandardMaterial color="#0d0b0a" /></mesh>)}
      <mesh position={[1.4, 0.5, -0.7]}><boxGeometry args={[0.5, 0.06, 0.5]} /><meshStandardMaterial color="#0b0a09" /></mesh>
      <mesh position={[1.4, 0.82, -0.47]}><boxGeometry args={[0.5, 0.62, 0.05]} /><meshStandardMaterial color="#0b0a09" /></mesh>
      {ready && <><GrabProp name="old-radio" position={[1.75, 0.82, -1.75]} height={0.38} rotation={[0, -0.4, 0]} />
        <GrabProp name="haunted-photo-wall" position={[1.2, 2.3, -3.95]} height={1.3} /></>}
      {/* door with light under it */}
      <mesh position={[3.2, 1.1, -3.98]}><planeGeometry args={[1.0, 2.2]} /><meshStandardMaterial color="#0b0c0f" /></mesh>
      <mesh position={[3.2, 0.03, -3.9]}><planeGeometry args={[1.0, 0.05]} /><meshBasicMaterial color={NOIR.amber} toneMapped={false} /></mesh>
      <Silhouette position={[-3.0, 0, -1.0]} rotation={-Math.PI / 2 - 0.15} pose={f > 70 ? 'turn' : 'stand'} actT={(f - 70) / 20} phase={f * 0.1} rim={'#ffe2b0'} rimK={1.3} rimSide={[-1, 0.4, 0]} />
      <HangingBulb position={[0.2, 4.2, -2.2]} cable={1.3} amp={0.28} period={64} frame={f} dieAt={96} />
      <Particles kind="dust" count={220} center={[-2.4, 1.4, -1.0]} area={[3.2, 2.6, 2.4]} frame={f} color="#ffe6c0" size={0.012} opacity={0.7} />
      <Post bloom={1.35} threshold={0.4} vignette={0.55} />
    </NoirStage>
  );
};

export const NoirDemo = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <NoirFonts />
    <Sequence durationInFrames={130}><Street /></Sequence>
    <Sequence from={130} durationInFrames={110}><Office /></Sequence>
  </AbsoluteFill>
);
