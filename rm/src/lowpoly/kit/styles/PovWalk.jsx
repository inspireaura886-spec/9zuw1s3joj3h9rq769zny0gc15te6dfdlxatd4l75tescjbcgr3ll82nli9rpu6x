// STYLE c (2026-10-30): first-person POV walk-through of a haunted room, dressed with Grab3D props (recoloured palette), handheld
// flashlight (shadow spot), flickering bulb, head-bob steps, a slow look-around and a jolt at the end: the mannequin is suddenly closer.
// Inside the GRAB3D cap: 8 instances, 2 big (>15k), 113k tris, 8 distinct GLBs; 3 lights (1 shadow), 1 dust system (220), no fog sheet.
// MUST be mounted only after usePreload(POV_PATHS(palette)) is ready (PovWalk does it itself and renders a dark frame until then).
// <PovWalk dur={105} palette="ia-dark" label="ROOM 3, 1:12 AM" />
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {GrabProp, grabPaths, grabTris} from '../Props.jsx';
import {usePreload} from '../glb.js';
import {Particles} from '../Particles.jsx';
import {Post} from '../Post.jsx';
import {cl, lerp, ramp, eio, pal} from './util.js';

export const POV_SET = [
  {name: 'old-iron-bed', position: [1.55, 0, -1.2], rotation: [0, -Math.PI / 2, 0]},
  {name: 'old-wardrobe', position: [-2.0, 0, -3.6], rotation: [0, 0.5, 0]},
  {name: 'cracked-mirror', position: [2.38, 1.0, 1.6], rotation: [0, -Math.PI / 2, 0]},
  {name: 'old-cradle', position: [-1.6, 0, 0.9], rotation: [0, 0.9, 0]},
  {name: 'haunted-photo-wall', position: [-2.42, 1.25, 2.8], rotation: [0, Math.PI / 2, 0]},
  {name: 'dress-form-mannequin', position: [0.35, 0, -4.1], rotation: [0, 0.15, 0], key: 'mannequin'},
  {name: 'hanging-light-bulb', position: [0, 2.35, -0.6]},
  {name: 'cobweb', position: [2.2, 2.3, -4.4], rotation: [0, -Math.PI / 2, 0]},
];
export const POV_TRIS = grabTris(POV_SET.map((s) => s.name));
export const POV_PATHS = (palette = 'ia-dark') => grabPaths(POV_SET.map((s) => s.name), palette);

const Rig = ({f, dur, spot}) => {
  const {camera, scene} = useThree();
  const walkEnd = dur * 0.72; const w = eio(cl(f / walkEnd));
  const z = lerp(6.2, 1.0, w); const step = f * 0.42; const moving = f < walkEnd ? 1 : Math.max(0, 1 - (f - walkEnd) / 8);
  const bobY = Math.abs(Math.sin(step)) * 0.055 * moving, bobX = Math.sin(step) * 0.03 * moving;
  // look: sweep left (photo wall) -> right (mirror) -> centre (mannequin), jolt at the end
  const look = f < dur * 0.3 ? lerp(0, -0.55, eio(ramp(f, 4, dur * 0.3))) : f < dur * 0.6 ? lerp(-0.55, 0.6, eio(ramp(f, dur * 0.3, dur * 0.6))) : lerp(0.6, 0.02, eio(ramp(f, dur * 0.6, dur * 0.8)));
  const jolt = f > dur * 0.8 ? Math.sin((f - dur * 0.8) * 2.1) * 0.025 * Math.max(0, 1 - (f - dur * 0.8) / 12) : 0;
  const pitch = -0.06 + Math.sin(f * 0.05) * 0.02 + jolt;
  const pos = [bobX, 1.62 + bobY, z];
  camera.position.set(...pos); camera.fov = 62; camera.near = 0.05; camera.far = 60; camera.updateProjectionMatrix();
  camera.lookAt(pos[0] + Math.sin(look) * 4, pos[1] + pitch * 4 - 0.15, pos[2] - Math.cos(look) * 4);
  // flashlight in the right hand, aimed slightly ahead of the gaze, with hand jitter
  const hj = Math.sin(f * 0.37) * 0.04 + Math.sin(f * 0.91) * 0.02;
  spot.position.set(pos[0] + 0.25, pos[1] - 0.3, pos[2] - 0.1);
  spot.target.position.set(pos[0] + Math.sin(look + hj) * 4, pos[1] - 0.55 + hj, pos[2] - Math.cos(look + hj) * 4);
  spot.target.updateMatrixWorld();
  if (!spot.parent) scene.add(spot, spot.target);
  return null;
};

export const PovWalk = ({dur = 105, palette = 'ia-dark', label, colors = {floor: '#2a2621', wall: '#232a2c', wall2: '#1f2527', ceil: '#141819'}}) => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig(); const P = pal('ia');
  const ready = usePreload(POV_PATHS(palette));
  const spot = useMemo(() => { const s = new THREE.SpotLight('#fff1d0', 260, 18, 0.45, 0.5, 1.3); s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0008; return s; }, []);
  // flicker = deterministic
  const flick = (Math.sin(f * 1.7) > 0.93 ? 0.15 : 1) * (1 + 0.15 * Math.sin(f * 0.9));
  const bulb = f > dur * 0.78 && f < dur * 0.84 ? 0.05 : flick;
  const jump = f > dur * 0.82; // mannequin closer after the blackout
  return (
    <AbsoluteFill style={{background: '#050607'}}>
      {ready && <ThreeCanvas width={width} height={height} shadows gl={{antialias: true}}>
        <Rig f={f} dur={dur} spot={spot} />
        <color attach="background" args={['#050607']} />
        <fog attach="fog" args={['#07090b', 3, 13]} />
        <hemisphereLight args={['#7f9aa4', '#1a140e', 1.1]} />
        <pointLight position={[0, 2.05, -0.6]} intensity={16 * bulb} distance={8} decay={1.4} color="#ffb070" />
        {/* room shell 5 x 11 x 3 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow><planeGeometry args={[5, 12]} /><meshStandardMaterial color={colors.floor} roughness={0.95} /></mesh>
        <mesh position={[0, 1.5, -4.9]} receiveShadow><planeGeometry args={[5, 3]} /><meshStandardMaterial color={colors.wall} roughness={1} /></mesh>
        <mesh position={[-2.5, 1.5, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[12, 3]} /><meshStandardMaterial color={colors.wall2} roughness={1} /></mesh>
        <mesh position={[2.5, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[12, 3]} /><meshStandardMaterial color={colors.wall2} roughness={1} /></mesh>
        <mesh position={[0, 3, 1]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[5, 12]} /><meshStandardMaterial color={colors.ceil} /></mesh>
        {/* door frame on the back wall */}
        <mesh position={[-1.0, 1.05, -4.88]}><boxGeometry args={[1.0, 2.1, 0.05]} /><meshStandardMaterial color="#0b0a09" /></mesh>
        {POV_SET.map((p, i) => {
          const isBulb = p.name === 'hanging-light-bulb';
          const pos = p.key === 'mannequin' && jump ? [0.15, 0, 0.2] : p.position;
          const rot = p.key === 'mannequin' && jump ? [0, 0, 0] : isBulb ? [Math.sin(f * 0.06) * 0.05, 0, Math.sin(f * 0.06) * 0.12] : p.rotation;
          return <GrabProp key={i} name={p.name} palette={palette} position={pos} rotation={rot} glow={isBulb ? 2 * bulb : 1} />;
        })}
        <Particles kind="dust" count={220} center={[0, 0.2, -2.6]} area={[4.4, 2.6, 4.2]} frame={f} size={0.006} opacity={0.45} />
        <Post bloom={0.8} threshold={0.6} vignette={0.65} />
      </ThreeCanvas>}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 45% at 52% 52%, transparent 40%, rgba(0,0,0,0.75) 100%)'}} />
      {label && <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', top: 250, left: 80, fontFamily: 'monospace', fontWeight: 700, fontSize: 38, color: '#e8e2d0', letterSpacing: 4, opacity: 0.85 * ramp(f, 3, 10)}}>{label}</div></AbsoluteFill>}
    </AbsoluteFill>
  );
};
