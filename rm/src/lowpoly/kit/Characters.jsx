import * as THREE from 'three';
import {useMemo} from 'react';
import {clamp01, easeInOut, easeOut} from './noise.js';
import {useOutline, ink} from './Toon.jsx';
import {softTexture} from './Sky.jsx';

// v2 (2026-10-15): Minecraft-style blocky characters with pixel-texture faces.
// Person: cube head (8x8 pixel face texture), rectangular torso, separate arms/legs pivoting at shoulders/hips.
const Box = ({p, s, c, o = 1, rot, map, mats}) => {
  const ol = useOutline(); // ANIMATION UPGRADE 2026-10-22: ink outline when inside <OutlineScope>
  const m = <mesh position={p} rotation={rot || [0, 0, 0]} material={mats}><boxGeometry args={s} />
    {!mats && <meshLambertMaterial color={c} map={map || null} transparent={o < 1} opacity={o} depthWrite={o >= 1} flatShading />}</mesh>;
  if (!ol || o < 1 || !ol.thickness) return m;
  const t = ol.thickness;
  return <>{m}<mesh position={p} rotation={rot || [0, 0, 0]} material={ink(ol.color)}><boxGeometry args={[s[0] + 2 * t, s[1] + 2 * t, s[2] + 2 * t]} /></mesh></>;
};

// ---- pixel textures (cached by colour key) ----
const TEX = new Map();
const pixTex = (key, draw) => {
  if (TEX.has(key)) return TEX.get(key);
  const cv = document.createElement('canvas'); cv.width = 8; cv.height = 8; const g = cv.getContext('2d');
  draw((x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); });
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false;
  TEX.set(key, t); return t;
};
const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
// head materials: [+x, -x, +y, -y, +z(front), -z(back)]
const headMats = (skin, hair, eye, expr, ghost, o) => {
  const k = `${skin}|${hair}|${eye}|${expr}`;
  const front = pixTex('f' + k, (r) => {
    r(0, 0, 8, 8, skin); r(0, 0, 8, 2, hair); r(0, 2, 1, 1, hair); r(7, 2, 1, 1, hair);
    if (expr === 'closed') { r(1, 4, 2, 1, shade(skin, 0.55)); r(5, 4, 2, 1, shade(skin, 0.55)); }
    else { r(1, 4, 2, 1, '#ffffff'); r(5, 4, 2, 1, '#ffffff'); r(2, 4, 1, 1, eye); r(5, 4, 1, 1, eye); r(1, 3, 2, 1, shade(hair, 0.9)); r(5, 3, 2, 1, shade(hair, 0.9)); }
    r(3, 5, 2, 1, shade(skin, 0.8)); // nose shadow
    if (expr === 'o') r(3, 6, 2, 1, '#3a1410'); else r(2, 6, 4, 1, shade(skin, 0.55));
  });
  const side = pixTex('s' + k, (r) => { r(0, 0, 8, 8, skin); r(0, 0, 8, 3, hair); r(5, 3, 3, 1, hair); r(2, 4, 1, 2, shade(skin, 0.8)); });
  const back = pixTex('b' + k, (r) => { r(0, 0, 8, 8, hair); r(0, 6, 8, 2, shade(skin, 0.95)); r(2, 1, 1, 1, shade(hair, 1.25)); r(5, 3, 1, 1, shade(hair, 1.25)); });
  const top = pixTex('t' + k, (r) => { r(0, 0, 8, 8, hair); r(1, 2, 2, 1, shade(hair, 1.25)); r(5, 5, 2, 1, shade(hair, 1.2)); });
  const M = (map) => new THREE.MeshLambertMaterial({map, transparent: o < 1, opacity: o, color: ghost ? '#dfe9ff' : '#ffffff'});
  return [M(side), M(side), M(top), M(top), M(front), M(back)];
};
const shirtTex = (shirt, pattern) => pixTex(`sh${shirt}${pattern}`, (r) => {
  r(0, 0, 8, 8, shirt);
  if (pattern === 'stripe') { r(0, 2, 8, 1, shade(shirt, 0.7)); r(0, 5, 8, 1, shade(shirt, 0.7)); }
  else if (pattern === 'check') { for (let y = 0; y < 8; y += 2) for (let x = (y / 2) % 2 * 2; x < 8; x += 4) r(x, y, 2, 2, shade(shirt, 0.75)); }
  else { r(3, 0, 2, 2, shade(shirt, 0.75)); r(3, 3, 1, 1, shade(shirt, 0.7)); r(3, 5, 1, 1, shade(shirt, 0.7)); }
  r(0, 7, 8, 1, '#3a2a1c');
});

/** ANIMATION UPGRADE 2026-10-22: props held in the right hand. kind: lantern | torch | shovel | rope | book | camera */
const HandProp = ({kind, phase = 0, color}) => {
  if (kind === 'lantern') return <group position={[0, -0.78, 0.05]} rotation={[Math.sin(phase * 1.3) * 0.15, 0, 0]}>
    <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.2, 0.26, 0.2]} /><meshBasicMaterial color={color || '#ffd36a'} toneMapped={false} /></mesh>
    <mesh position={[0, 0.03, 0]}><boxGeometry args={[0.24, 0.05, 0.24]} /><meshLambertMaterial color="#2a2a2a" /></mesh>
    <sprite position={[0, -0.12, 0]} scale={[1.6, 1.6, 1]}><spriteMaterial map={softTexture()} color={color || '#ffb84a'} transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></sprite>
    <pointLight position={[0, -0.12, 0.2]} color={color || '#ffb050'} intensity={3} distance={6} decay={1.5} /></group>;
  if (kind === 'torch') return <group position={[0, -0.7, 0.1]} rotation={[0.9, 0, 0]}>
    <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.04, 0.05, 0.6, 5]} /><meshLambertMaterial color="#4a3020" flatShading /></mesh>
    <mesh position={[0, 0.62, 0]} scale={[0.14, 0.26 + Math.sin(phase * 5) * 0.04, 0.14]}><coneGeometry args={[1, 1, 5]} /><meshBasicMaterial color="#ffb02e" toneMapped={false} /></mesh>
    <sprite position={[0, 0.65, 0]} scale={[1.4, 1.4, 1]}><spriteMaterial map={softTexture()} color="#ff9a3a" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></sprite></group>;
  if (kind === 'shovel') return <group position={[0, -0.7, 0.1]} rotation={[1.2, 0, 0]}>
    <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.035, 0.035, 1.1, 5]} /><meshLambertMaterial color="#7a5232" flatShading /></mesh>
    <mesh position={[0, 0.72, 0]}><boxGeometry args={[0.26, 0.3, 0.03]} /><meshLambertMaterial color="#9aa3ad" flatShading /></mesh></group>;
  if (kind === 'book') return <mesh position={[0, -0.75, 0.12]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.3, 0.06, 0.38]} /><meshLambertMaterial color={color || '#7a2a2a'} flatShading /></mesh>;
  if (kind === 'camera') return <mesh position={[0, -0.75, 0.14]}><boxGeometry args={[0.32, 0.2, 0.16]} /><meshLambertMaterial color="#202020" flatShading /></mesh>;
  return null;
};

/**
 * Person v2. pose: 'stand' (idle sway) | 'walk' | 'sleep' (lying on back, eyes closed) | 'fall' (fallT 0..1 collapses) | 'sit' | 'ride' | 'lie' (= sleep).
 * phase: animation clock (pass frame/5 for walking, frame/10 for idle). skin/shirt/pants/hair/shoes/eye colours, pattern 'plain'|'stripe'|'check'.
 * expr: 'open' | 'closed' | 'o'. ghost: translucent pale figure. Height ~2 units at scale 1, facing +Z.
 * UPGRADE 2026-10-22 poses: 'run' | 'point' | 'recoil' (actT 0..1) | 'dig' | 'climb' | 'crouch' | 'cower' | 'lookup' (actT) | 'carry';
 * prop: 'lantern' | 'torch' | 'shovel' | 'book' | 'camera' (right hand); shadow: soft contact shadow under the feet.
 */
export const Person = ({position = [0, 0, 0], rotation = 0, scale = 1, pose = 'stand', phase = 0, fallT = 0, skin = '#8d5a36', shirt = '#2f6db5', pants = '#2b3a5a', hair = '#1b1310', shoes = '#2a1d16', eye = '#2b1a10', pattern = 'plain', expr, opacity = 1, ghost = false, wave = false, actT = 1, prop, shadow = false, propColor}) => {
  const o = ghost ? opacity * 0.42 : opacity;
  const C = ghost ? {skin: '#e8f0ff', shirt: '#dfe9ff', pants: '#cfdcf5', hair: '#e8f0ff', shoes: '#cfdcf5'} : {skin, shirt, pants, hair, shoes};
  const sleeping = pose === 'sleep' || pose === 'lie';
  const ex = expr || (sleeping ? 'closed' : pose === 'fall' && fallT > 0.6 ? 'closed' : 'open');
  const hm = useMemo(() => headMats(C.skin, C.hair, eye, ex, ghost, o), [C.skin, C.hair, eye, ex, ghost, o]);
  const st = useMemo(() => shirtTex(C.shirt, pattern), [C.shirt, pattern]);
  let lArm = 0, rArm = 0, lLeg = 0, rLeg = 0, armOut = 0.06, bob = 0, lean = 0, headTilt = 0;
  if (pose === 'walk') { const s = Math.sin(phase); lArm = -s * 0.75; rArm = s * 0.75; lLeg = s * 0.7; rLeg = -s * 0.7; bob = Math.abs(Math.cos(phase)) * 0.07; lean = 0.06; }
  else if (pose === 'stand') { const s = Math.sin(phase * 0.6); lArm = s * 0.08; rArm = -s * 0.08; bob = Math.sin(phase * 0.9) * 0.015; headTilt = Math.sin(phase * 0.37) * 0.12; }
  else if (pose === 'sit' || pose === 'ride') { lLeg = rLeg = -1.4; lArm = rArm = pose === 'ride' ? -1.15 : -0.3; }
  else if (pose === 'fall') { const t = clamp01(fallT); lArm = -t * 2.6 + Math.sin(phase * 2) * 0.3 * (1 - t); rArm = -t * 2.2 - Math.sin(phase * 2) * 0.3 * (1 - t); armOut = 0.06 + t * 0.35; lLeg = t * 0.25; rLeg = -t * 0.1; }
  // ---- ANIMATION UPGRADE 2026-10-22: action poses with secondary motion (actT 0..1 = how far into the action) ----
  let headPitch = 0, hipDrop = 0, squash = 1;
  const A = easeOut(clamp01(actT));
  if (pose === 'run') { const s = Math.sin(phase); lArm = -s * 1.25 - 0.2; rArm = s * 1.25 - 0.2; lLeg = s * 1.1; rLeg = -s * 1.1; armOut = 0.12; bob = Math.abs(Math.cos(phase)) * 0.16; lean = 0.28; headPitch = -0.12 + Math.sin(phase * 2 + 0.6) * 0.06; squash = 1 - Math.abs(Math.sin(phase)) * 0.04; }
  else if (pose === 'point') { const s = Math.sin(phase * 0.6); rArm = -1.5 * A + Math.sin(phase * 2) * 0.03; lArm = s * 0.08; lean = 0.08 * A; headTilt = 0.15 * A; headPitch = -0.08 * A; }
  else if (pose === 'recoil') { const sh = (1 - A) * Math.sin(phase * 9) * 0.08; lArm = rArm = -2.1 * A + sh; armOut = 0.06 + 0.45 * A; lean = -0.32 * A; lLeg = 0.45 * A; rLeg = -0.1 * A; headPitch = 0.18 * A; bob = 0.06 * Math.sin(Math.PI * clamp01(actT)); }
  else if (pose === 'dig') { const s = Math.sin(phase); lArm = rArm = -0.9 - 0.75 * s; armOut = 0.02; lean = 0.42 + 0.18 * s; lLeg = -0.25; rLeg = 0.25; hipDrop = 0.06 + 0.05 * s; headPitch = 0.25; }
  else if (pose === 'climb') { const s = Math.sin(phase); lArm = -2.75 + s * 0.4; rArm = -2.75 - s * 0.4; lLeg = -0.75 + s * 0.55; rLeg = -0.75 - s * 0.55; armOut = 0.1; lean = -0.08; bob = s * 0.05; headPitch = -0.35; }
  else if (pose === 'crouch') { lLeg = rLeg = -1.0; lean = 0.38; hipDrop = 0.24; lArm = rArm = -0.6; headPitch = -0.25; headTilt = Math.sin(phase * 0.5) * 0.25; }
  else if (pose === 'cower') { lLeg = rLeg = -1.05; lean = 0.5; hipDrop = 0.26; lArm = rArm = -2.7; armOut = 0.35; headPitch = 0.35; bob = Math.sin(phase * 7) * 0.012; }
  else if (pose === 'lookup') { const s = Math.sin(phase * 0.6); lArm = s * 0.06 + 0.12 * A; rArm = -s * 0.06 + 0.12 * A; armOut = 0.06 + 0.15 * A; headPitch = -0.55 * A; lean = -0.06 * A; }
  else if (pose === 'carry') { const s = Math.sin(phase); lArm = rArm = -1.2; armOut = 0.0; lLeg = s * 0.55; rLeg = -s * 0.55; bob = Math.abs(Math.cos(phase)) * 0.05; lean = -0.05; }
  if (wave) rArm = -2.6 + Math.sin(phase * 3) * 0.35;
  const hipY = (pose === 'sit' || pose === 'ride' ? 0.42 : 0.75) - hipDrop;
  let gRot = [lean, rotation, 0], lift = bob;
  if (sleeping) { gRot = [-Math.PI / 2, rotation, 0]; lift = 0.14; }
  if (pose === 'fall') { const t = easeInOut(clamp01(fallT)); gRot = [-Math.PI / 2 * t, rotation, 0]; lift = 0.14 * t; }
  const breathe = sleeping ? Math.sin(phase * 0.5) * 0.02 : 0;
  return (
    <group position={[position[0], position[1] + lift, position[2]]} rotation={[0, gRot[1], 0]} scale={scale}>
      {shadow && <mesh position={[0, 0.02 - lift, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.1 - lift, 0.8 - lift * 0.5, 1]} renderOrder={1}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={softTexture()} color="#000000" transparent opacity={0.42} depthWrite={false} /></mesh>}
      <group rotation={[gRot[0], 0, 0]} scale={[1, squash, 1]}>
        {/* legs pivot at hips; trousers + shoes */}
        {[[-0.13, lLeg], [0.13, rLeg]].map(([x, a], i) => <group key={'l' + i} position={[x, hipY, 0]} rotation={[a, 0, 0]}>
          <Box p={[0, -0.3, 0]} s={[0.25, 0.6, 0.27]} c={C.pants} o={o} /><Box p={[0, -0.67, 0.02]} s={[0.26, 0.15, 0.31]} c={C.shoes} o={o} />
        </group>)}
        {/* torso */}
        <group position={[0, hipY + 0.375 + breathe, 0]}>
          <Box p={[0, 0, 0]} s={[0.52, 0.75, 0.27]} map={ghost ? null : st} c={ghost ? C.shirt : '#ffffff'} o={o} />
          {/* arms pivot at shoulders: sleeve + skin hand */}
          {[[-0.385, lArm, -armOut], [0.385, rArm, armOut]].map(([x, a, z], i) => <group key={'a' + i} position={[x, 0.3, 0]} rotation={[a, 0, z]}>
            <Box p={[0, -0.2, 0]} s={[0.24, 0.42, 0.25]} c={C.shirt} o={o} /><Box p={[0, -0.55, 0]} s={[0.22, 0.3, 0.23]} c={C.skin} o={o} />
            {i === 1 && prop && <HandProp kind={prop} phase={phase} color={propColor} />}
          </group>)}
          {/* head */}
          <group position={[0, 0.375, 0]} rotation={[headPitch, headTilt, 0]}>
            <mesh position={[0, 0.27, 0]} material={hm}><boxGeometry args={[0.54, 0.54, 0.54]} /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

/** Translucent ghost figure for legend / memory beats. bob uses frame. */
export const Ghost = ({frame = 0, position = [0, 0, 0], opacity = 1, ...rest}) => (
  <Person {...rest} ghost opacity={opacity} phase={frame / 10} position={[position[0], position[1] + 0.25 + Math.sin(frame / 18 + position[0]) * 0.15, position[2]]} />
);

/** Preset villagers: varied skin tones / clothing. pick by index. */
export const VILLAGER_LOOKS = [
  {skin: '#6b4226', shirt: '#e0472f', pants: '#2b3a5a', hair: '#141010', pattern: 'stripe'},
  {skin: '#8d5a36', shirt: '#f2b632', pants: '#3a3226', hair: '#1b1310', pattern: 'plain'},
  {skin: '#5a3520', shirt: '#2fa38a', pants: '#2b2b36', hair: '#0f0b0a', pattern: 'check'},
  {skin: '#7a4b2c', shirt: '#7a5bd5', pants: '#3b3b48', hair: '#241a14', pattern: 'plain'},
  {skin: '#9a6440', shirt: '#ffffff', pants: '#5a3d2a', hair: '#151010', pattern: 'stripe'},
  {skin: '#62391f', shirt: '#2f86e0', pants: '#2a2a2a', hair: '#1a1210', pattern: 'check'},
];

/** Blocky cow with pixel-patched hide. graze (0/1) bobs the head down; fallT 0..1 animates a collapse onto its side. frame drives tail/head. */
const cowTex = (color, patch) => pixTex(`cow${color}${patch}`, (r) => { r(0, 0, 8, 8, color); r(1, 1, 3, 2, patch); r(5, 4, 2, 3, patch); r(2, 5, 2, 1, patch); r(6, 0, 2, 1, patch); });
const cowFace = (color, patch) => pixTex(`cf${color}${patch}`, (r) => { r(0, 0, 8, 8, color); r(0, 0, 3, 3, patch); r(1, 3, 1, 1, '#111111'); r(6, 3, 1, 1, '#111111'); r(1, 5, 6, 3, '#d99a90'); r(2, 6, 1, 1, '#6b3a34'); r(5, 6, 1, 1, '#6b3a34'); });
export const Cow = ({position = [0, 0, 0], rotation = 0, scale = 1, color = '#f1ebe0', patch = '#3a2a22', lying = false, fallT, frame = 0, graze = 1, seed = 0}) => {
  const t = easeInOut(clamp01(fallT !== undefined ? fallT : lying ? 1 : 0));
  const hide = useMemo(() => cowTex(color, patch), [color, patch]); const face = useMemo(() => cowFace(color, patch), [color, patch]);
  const faceMats = useMemo(() => { const m = new THREE.MeshLambertMaterial({map: hide}); const fm = new THREE.MeshLambertMaterial({map: face}); return [m, m, m, m, fm, m]; }, [hide, face]);
  const alive = t < 0.01;
  const head = alive ? (graze ? -0.35 - 0.25 * (0.5 + 0.5 * Math.sin(frame * 0.05 + seed)) : 0) : 0.1;
  const tail = alive ? Math.sin(frame * 0.18 + seed * 2) * 0.5 : 0;
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <group rotation={[0, 0, (Math.PI / 2) * t]} position={[0.45 * t, 0, 0]}>
        <Box p={[0, 0.95, 0]} s={[0.8, 0.7, 1.6]} map={hide} c="#ffffff" />
        <group position={[0, 1.05, 0.8]} rotation={[-head, 0, 0]}>
          <mesh position={[0, 0.0, 0.25]} material={faceMats}><boxGeometry args={[0.5, 0.48, 0.5]} /></mesh>
          <Box p={[-0.22, 0.3, 0.2]} s={[0.08, 0.2, 0.08]} c="#e8e0c0" /><Box p={[0.22, 0.3, 0.2]} s={[0.08, 0.2, 0.08]} c="#e8e0c0" />
          <Box p={[-0.32, 0.12, 0.18]} s={[0.18, 0.1, 0.12]} c={patch} /><Box p={[0.32, 0.12, 0.18]} s={[0.18, 0.1, 0.12]} c={patch} />
        </group>
        <group position={[0, 1.2, -0.8]} rotation={[0.3, 0, tail]}><Box p={[0, -0.3, -0.03]} s={[0.07, 0.6, 0.07]} c={patch} /></group>
        {[[-0.28, 0.6], [0.28, 0.6], [-0.28, -0.6], [0.28, -0.6]].map(([x, z], i) => <group key={i} position={[x, 0.6, z]} rotation={[t * (i % 2 ? 0.5 : -0.4), 0, 0]}>
          <Box p={[0, -0.3, 0]} s={[0.2, 0.6, 0.2]} c={color} /><Box p={[0, -0.55, 0]} s={[0.21, 0.1, 0.21]} c="#2a2220" /></group>)}
      </group>
    </group>
  );
};
