// GRAB3D PROPS render-weight test (2026-10-30): indoor haunted room, heaviest realistic prop set (6 big props + 2 cobwebs + bulb),
// inside the CRASH-PROOF scene-weight cap: 3 lights (1 shadow), 1 particle system (300 dust), 1 fog layer, bloom+FXAA.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {usePreload, CamPath, Post, Particles, FogLayer, GrabProp, grabPaths, grabTris} from '../../kit/index.js';

const SET = [
  {name: 'old-wardrobe', position: [-2.1, 0, -2.3], rotation: [0, 0.35, 0]},
  {name: 'secret-bookcase-door', position: [0.4, 0, -2.75]},
  {name: 'old-iron-bed', position: [2.0, 0, -1.4], rotation: [0, -Math.PI / 2, 0]},
  {name: 'hospital-gurney', position: [-1.6, 0, 0.3], rotation: [0, 1.2, 0]},
  {name: 'clawfoot-bathtub', position: [1.5, 0, 1.0], rotation: [0, -0.4, 0]},
  {name: 'dusty-chandelier', position: [0, 2.0, -0.6]},
  {name: 'cobweb', position: [-2.9, 2.0, -2.9], scale: 1.2},
  {name: 'cobweb', position: [2.9, 2.0, -2.9], rotation: [0, -Math.PI / 2, 0], scale: 1.2},
  {name: 'hanging-light-bulb', position: [0.9, 2.4, 0.4]},
];
export const PROPS_TEST_NAMES = SET.map((s) => s.name);
export const PROPS_TEST_TRIS = grabTris(PROPS_TEST_NAMES);
const PATHS = grabPaths(PROPS_TEST_NAMES);

// stress={1}: adds a 2nd copy of the 6 big props (different palette files = separate textures) behind/around, to find the ceiling.
const EXTRA = SET.slice(0, 6).map((p, i) => ({...p, position: [p.position[0] * 0.6 + (i % 2 ? 1.2 : -1.2), p.position[1], p.position[2] - 0.6], rotation: [0, (p.rotation?.[1] || 0) + 2.4, 0], palette: 'ia-sepia'}));
export const HauntedRoom = ({stress = 0}) => {
  const frame = useCurrentFrame();
  const ready = usePreload(stress ? [...PATHS, ...EXTRA.map((p) => `props/grab3d-cozy-horror/ia-sepia/${p.name}.glb`)] : PATHS);
  const flick = 1 + 0.18 * Math.sin(frame * 1.3) + 0.1 * Math.sin(frame * 3.7);
  const sway = Math.sin(frame * 0.06) * 0.12;
  return (
    <AbsoluteFill style={{background: '#07090c'}}>
      {ready && <ThreeCanvas width={1080} height={1920} shadows camera={{fov: 42, position: [0, 1.6, 5]}}>
        <CamPath frame={frame} start={0} end={90} fov={52}
          points={[[0.3, 2.0, 7.2], [-0.3, 1.8, 6.0], [-0.8, 1.6, 4.9]]}
          looks={[[0, 1.0, -1.0], [0.1, 0.95, -1.2], [0.4, 0.9, -0.8]]} />
        <color attach="background" args={['#07090c']} />
        <fog attach="fog" args={['#0b1216', 5, 14]} />
        <hemisphereLight args={['#8aa6b0', '#1a1612', 1.1]} />
        <spotLight position={[2.5, 3.4, 3.2]} angle={0.7} penumbra={0.6} intensity={70} color="#a9cbe0" decay={1.2} castShadow
          shadow-mapSize-width={1024} shadow-mapSize-height={1024} target-position={[0, 0, -1]} />
        <pointLight position={[0.9 + sway, 2.0, 0.4]} intensity={9 * flick} distance={7} decay={1.3} color="#ffb070" />
        {/* room shell */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3.9]} receiveShadow><planeGeometry args={[6.2, 14]} /><meshStandardMaterial color="#2a2621" roughness={0.95} /></mesh>
        <mesh position={[0, 1.6, -3.1]} receiveShadow><planeGeometry args={[6.2, 3.2]} /><meshStandardMaterial color="#232a2c" roughness={1} /></mesh>
        <mesh position={[-3.1, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[6.2, 3.2]} /><meshStandardMaterial color="#1f2527" roughness={1} /></mesh>
        <mesh position={[3.1, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[6.2, 3.2]} /><meshStandardMaterial color="#1f2527" roughness={1} /></mesh>
        <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[6.2, 6.2]} /><meshStandardMaterial color="#141819" /></mesh>
        {SET.map((p, i) => <GrabProp key={i} {...p} rotation={p.name === 'hanging-light-bulb' ? [sway * 0.4, 0, sway] : p.rotation} glow={p.name === 'hanging-light-bulb' ? 2 * flick : 1} />)}
        {stress ? EXTRA.map((p, i) => <GrabProp key={'x' + i} {...p} />) : null}
        <Particles kind="dust" count={300} center={[0, 0, 0]} area={[5, 3, 5]} frame={frame} size={0.012} opacity={0.5} />
        <FogLayer y={0.08} size={7} layers={3} thickness={0.3} color="#a9bcc4" opacity={0.035} frame={frame} />
        <Post bloom={0.9} threshold={0.6} vignette={0.5} aa="fxaa" />
      </ThreeCanvas>}
    </AbsoluteFill>
  );
};
