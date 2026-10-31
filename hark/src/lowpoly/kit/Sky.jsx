import {AbsoluteFill} from 'remotion';
import {useMemo} from 'react';
import * as THREE from 'three';
import {rng} from './noise.js';

// Palettes: sky gradient (top->horizon), fog colour, light setup. Mix two with mixPalette for day->night.
// v2 2026-10-15: vivid palettes (renderer is flat / no tone mapping, so intensities are physical: ~pi = full).
// rim = back light colour/intensity/position (edge highlights), glow = multiplier for window/door halos.
export const PALETTES = {
  day:   {top: '#1d6ae0', mid: '#4fb0ff', hor: '#ffe7b8', fog: '#bfe3fa', amb: 1.1, hemiSky: '#bfe4ff', hemiGround: '#6a9a3a', hemiI: 1.5, sun: '#fff1d6', sunI: 3.0, sunPos: [30, 50, 20], rim: '#ffd7a0', rimI: 1.6, rimPos: [-30, 25, -40], glow: 0.0},
  dusk:  {top: '#251a5e', mid: '#a0408a', hor: '#ff9a52', fog: '#b86a78', amb: 0.9, hemiSky: '#ffb08a', hemiGround: '#3d2a5a', hemiI: 1.3, sun: '#ffb27a', sunI: 2.6, sunPos: [-40, 12, -30], rim: '#ff7ab0', rimI: 1.6, rimPos: [40, 20, 30], glow: 0.7},
  night: {top: '#050a30', mid: '#1b2c8e', hor: '#6a4fc0', fog: '#26358f', amb: 0.6, hemiSky: '#7f9dff', hemiGround: '#1b1f50', hemiI: 1.1, sun: '#9fc0ff', sunI: 2.2, sunPos: [-20, 40, 10], rim: '#7fe3ff', rimI: 2.2, rimPos: [25, 18, -45], glow: 1.0},
  dawn:  {top: '#3256c8', mid: '#e58ab8', hor: '#ffc06a', fog: '#efbfa8', amb: 1.15, hemiSky: '#ffd8e0', hemiGround: '#5a6a3a', hemiI: 1.4, sun: '#ffcf8a', sunI: 2.9, sunPos: [40, 10, 10], rim: '#ff8ac0', rimI: 1.5, rimPos: [-35, 15, -30], glow: 0.0},
  blueprint: {top: '#123a6b', mid: '#18497f', hor: '#1d5793', fog: '#18497f', amb: 1.4, hemiSky: '#cfe3ff', hemiGround: '#123a6b', hemiI: 1.2, sun: '#ffffff', sunI: 2.2, sunPos: [10, 30, 20], rim: '#9fe8ff', rimI: 1.2, rimPos: [-10, 10, -30], glow: 0.0},
};
const lerpHex = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
export const mixPalette = (a, b, t) => {
  const A = typeof a === 'string' ? PALETTES[a] : a, B = typeof b === 'string' ? PALETTES[b] : b; const o = {};
  for (const k of Object.keys(A)) {
    const v = A[k];
    o[k] = typeof v === 'string' ? lerpHex(v, B[k], t) : Array.isArray(v) ? v.map((x, i) => x + (B[k][i] - x) * t) : v + (B[k] - v) * t;
  }
  return o;
};
const P = (p) => (typeof p === 'string' ? PALETTES[p] : p);

// CSS sky behind a transparent ThreeCanvas.
export const SkyGradient = ({palette = 'day'}) => {
  const p = P(palette);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 45% at 50% 58%, ${p.hor}cc 0%, transparent 70%), linear-gradient(180deg, ${p.top} 0%, ${p.mid} 40%, ${p.hor} 64%, ${p.hor} 100%)`}} />;
};

// Lights + fog for a palette (inside the canvas).
export const Lights = ({palette = 'day', fogNear = 40, fogFar = 160}) => {
  const p = P(palette);
  return (<>
    <ambientLight intensity={p.amb} />
    <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemiI ?? 1.4]} />
    <directionalLight position={p.sunPos} intensity={p.sunI} color={p.sun} />
    {p.rimI ? <directionalLight position={p.rimPos} intensity={p.rimI} color={p.rim} /> : null}
    <fog attach="fog" args={[p.fog, fogNear, fogFar]} />
  </>);
};

// Star dome for night scenes; opacity 0..1.
export const Stars = ({count = 260, radius = 180, opacity = 1, seed = 5}) => {
  const geo = useMemo(() => {
    const r = rng(seed); const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = r() * Math.PI * 2, ph = 0.08 + r() * 0.5; // above horizon
      pts[i * 3] = Math.cos(th) * Math.cos(ph) * radius; pts[i * 3 + 1] = Math.sin(ph) * radius; pts[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * radius;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pts, 3)); return g;
  }, [count, radius, seed]);
  return <points geometry={geo}><pointsMaterial color="#ffffff" size={1.6} sizeAttenuation={false} transparent opacity={opacity} fog={false} /></points>;
};

// Low-poly moon / sun disc.
export const Orb = ({position = [-40, 40, -80], radius = 3, color = '#f4f1de'}) => (
  <mesh position={position}><icosahedronGeometry args={[radius, 0]} /><meshBasicMaterial color={color} fog={false} /></mesh>
);

// Soft round sprite texture (gas, smoke, glow halos). Cached.
let _soft = null;
export const softTexture = () => {
  if (_soft) return _soft;
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); _soft = new THREE.CanvasTexture(cv); _soft.colorSpace = THREE.SRGBColorSpace; return _soft;
};
/** Additive glow halo sprite (windows, lamps, fireflies). */
export const Glow = ({position, size = 1.5, color = '#ffb84a', opacity = 0.8}) => (
  <sprite position={position} scale={[size, size, 1]}><spriteMaterial map={softTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></sprite>
);
