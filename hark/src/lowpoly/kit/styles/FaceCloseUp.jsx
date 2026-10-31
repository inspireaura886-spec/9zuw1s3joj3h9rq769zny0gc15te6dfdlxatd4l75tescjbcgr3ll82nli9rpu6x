// STYLE i (2026-10-30): low-poly character close-up with simple facial animation. Flat-shaded head (subdivided icosahedron,
// sculpted by vertex offsets), eyes with darting irises (deterministic saccades), eyelids that blink (every ~2.5-4 s) and widen
// on fear, brows, mouth that flaps from VO word timing (vo.json words [[w, s, e], ...]; offsetSec = where this shot starts in the VO).
// 3 lights: key, fill, coloured rim (inside the CRASH-PROOF cap). Slow push-in. Pure function of frame.
// <FaceCloseUp dur={105} words={vo.words} offsetSec={12.4} skin="#c79a7a" hair="#2a1d16" expr="fear" />
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {Post} from '../Post.jsx';
import {cl, lerp, ramp, eio, h1} from './util.js';

const useHead = () => useMemo(() => {
  const g = new THREE.IcosahedronGeometry(1, 3); const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let {x, y, z} = v;
    y *= 1.22; x *= 0.86; z *= 0.95;                         // egg
    if (y < -0.2) { x *= 1 - (-0.2 - y) * 0.35; z *= 1 - (-0.2 - y) * 0.15; } // jaw taper
    if (z > 0.3 && y > -0.1 && y < 0.35) z -= 0.14 * Math.exp(-((Math.abs(x) - 0.31) ** 2) / 0.02); // eye sockets
    if (z > 0.6 && Math.abs(x) < 0.16 && y > -0.35 && y < 0.15) z += 0.2 * (1 - Math.abs(x) / 0.16) * (1 - Math.abs(y + 0.1) / 0.25); // nose
    if (z > 0.3 && y > 0.32 && y < 0.5) z += 0.05;           // brow ridge
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g.toNonIndexed();
}, []);

// mouth openness 0..1 from word timings: syllable-ish flaps inside each spoken word
export const mouthAt = (words, t) => {
  if (!words) return 0;
  for (const [w, s, e] of words) {
    if (t < s - 0.02) break;
    if (t <= e + 0.02) { const syl = Math.max(1, Math.round(String(w).replace(/[^a-z]/gi, '').length / 3)); const u = cl((t - s) / Math.max(0.05, e - s)); return 0.25 + 0.75 * Math.abs(Math.sin(u * Math.PI * syl)); }
  }
  return 0;
};

const Cam = ({f, dur}) => { const {camera} = useThree(); const t = eio(cl(f / dur));
  camera.position.set(lerp(0.6, 0.2, t), lerp(0.25, 0.1, t), lerp(8.4, 6.9, t)); camera.fov = 30; camera.updateProjectionMatrix(); camera.lookAt(0, -0.1, 0); return null; };

export const FaceCloseUp = ({dur = 105, words, offsetSec = 0, skin = '#c79a7a', hair = '#2a1d16', eye = '#4a3a2a', expr = 'neutral', rim = '#7fe3ff', bg = '#0a0d12', seed = 3, demoTalk = false}) => {
  const f = useCurrentFrame(); const {width, height, fps} = useVideoConfig(); const head = useHead();
  const t = f / fps + offsetSec;
  // mouth: real VO timing, or a demo pattern
  const mo = words ? mouthAt(words, t) : demoTalk ? Math.max(0, Math.sin(f * 0.55)) * (Math.sin(f * 0.11) > -0.3 ? 1 : 0) : 0;
  // blink: deterministic intervals 75-120 frames, 6-frame close/open
  let blink = 0; { let s = 10 + Math.floor(h1(0, seed) * 40); let k = 1; while (s < f + 8) { const d = f - s; if (d >= 0 && d < 7) blink = Math.sin(d / 7 * Math.PI); s += 75 + Math.floor(h1(k++, seed) * 45); } }
  // saccades: hold a gaze target, jump in 2 frames
  const seg = Math.floor(f / 22); const gx = (h1(seg, seed + 1) - 0.5) * 0.11, gy = (h1(seg, seed + 2) - 0.5) * 0.06;
  const pg = Math.floor((f - 2) / 22); const k = cl(((f % 22)) / 2); const ex = lerp((h1(pg, seed + 1) - 0.5) * 0.11, gx, k), ey = lerp((h1(pg, seed + 2) - 0.5) * 0.06, gy, k);
  const fear = expr === 'fear' ? 1 : 0;
  const browY = 0.5 + 0.05 * fear + 0.02 * mo; const browTilt = fear ? 0.25 : 0.05;
  const headRot = [Math.sin(f * 0.04) * 0.04 + mo * 0.03, Math.sin(f * 0.027) * 0.12, Math.sin(f * 0.033) * 0.03];
  const skinMat = <meshLambertMaterial color={skin} flatShading />;
  const Eye = ({x}) => <group position={[x, 0.17, 0.75]}>
    <mesh><sphereGeometry args={[0.13, 12, 10]} /><meshLambertMaterial color="#efe9df" /></mesh>
    <group position={[ex, ey, 0.133]}>
      <mesh><circleGeometry args={[0.065, 12]} /><meshBasicMaterial color={eye} /></mesh>
      <mesh position={[0, 0, 0.002]}><circleGeometry args={[0.032 + fear * 0.008, 10]} /><meshBasicMaterial color="#050505" /></mesh>
      <mesh position={[0.02, 0.022, 0.004]}><circleGeometry args={[0.012, 6]} /><meshBasicMaterial color="#ffffff" /></mesh>
    </group>
    {/* upper lid: hemisphere shell rotating down to close */}
    <mesh rotation={[lerp(-1.05 - 0.35 * fear, 1.45, blink), 0, 0]}><sphereGeometry args={[0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />{skinMat}</mesh>
    <mesh rotation={[Math.PI - 0.35, 0, 0]}><sphereGeometry args={[0.142, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2 - 0.5]} />{skinMat}</mesh>
  </group>;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 50% at 50% 45%, #1c2430 0%, ${bg} 75%)`}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}}>
        <Cam f={f} dur={dur} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[-2.5, 2, 3]} intensity={2.6} color="#ffe2c4" />
        <directionalLight position={[2.5, 0.5, 2]} intensity={0.6} color="#9fb4d0" />
        <directionalLight position={[2, 2.5, -3]} intensity={3.2} color={rim} />
        <group rotation={headRot} position={[0, -0.15, 0]}>
          <mesh geometry={head}>{skinMat}</mesh>
          {/* hair cap */}
          <mesh position={[0, 0.05, -0.04]} rotation={[-0.22, 0, 0]} scale={[0.93, 1.27, 1.0]}><sphereGeometry args={[1.0, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.44]} /><meshLambertMaterial color={hair} flatShading side={THREE.DoubleSide} /></mesh>
          {/* ears */}
          {[-1, 1].map((s) => <mesh key={s} position={[s * 0.85, 0.05, 0]} scale={[0.12, 0.24, 0.16]}><icosahedronGeometry args={[1, 0]} />{skinMat}</mesh>)}
          <Eye x={-0.31} /><Eye x={0.31} />
          {/* brows */}
          {[-1, 1].map((s) => <mesh key={'b' + s} position={[s * 0.31, browY, 0.9]} rotation={[0, 0, -s * browTilt]}><boxGeometry args={[0.3, 0.055, 0.06]} /><meshLambertMaterial color={hair} flatShading /></mesh>)}
          {/* mouth: dark cavity scales open, lips around it */}
          <group position={[0, -0.5, 0.84]}>
            <mesh scale={[1 - mo * 0.2, 0.15 + mo * 0.85 + fear * 0.1, 1]}><circleGeometry args={[0.13, 10]} /><meshBasicMaterial color="#2a0d0b" /></mesh>
            <mesh position={[0, 0.03 + mo * 0.04, 0.012]} scale={[1, 0.35, 1]}><torusGeometry args={[0.13, 0.025, 4, 12, Math.PI]} /><meshLambertMaterial color="#9a5a50" flatShading /></mesh>
            <mesh position={[0, -0.03 - mo * 0.07, 0.012]} rotation={[0, 0, Math.PI]} scale={[1, 0.4, 1]}><torusGeometry args={[0.13, 0.028, 4, 12, Math.PI]} /><meshLambertMaterial color="#a8645a" flatShading /></mesh>
          </group>
          {/* neck + collar */}
          <mesh position={[0, -1.35, -0.1]}><cylinderGeometry args={[0.36, 0.5, 0.9, 7]} />{skinMat}</mesh>
          <mesh position={[0, -1.9, -0.1]}><cylinderGeometry args={[0.9, 1.4, 0.6, 7]} /><meshLambertMaterial color="#2f3b4a" flatShading /></mesh>
        </group>
        <Post bloom={0.5} threshold={0.75} vignette={0.6} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
