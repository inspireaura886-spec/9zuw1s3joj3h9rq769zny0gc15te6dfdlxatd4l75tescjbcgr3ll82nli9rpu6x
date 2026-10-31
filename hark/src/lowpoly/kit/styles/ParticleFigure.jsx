// STYLE g (2026-10-30): particle / dust reconstruction of a figure. Up to 400 glowing points (CRASH-PROOF cap) fly in from a
// scattered cloud, assemble into a figure (staggered bottom-up, overshoot), hold with a shimmer, then disperse on the wind.
// shape: 'person' | 'ufo' | 'creature' (tall thin, long arms) | custom `targets` [[x,y,z], ...]. One THREE.Points draw call.
// <ParticleFigure dur={105} shape="person" color="#9fe8ff" label="THE LAST WITNESS" />
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {rng} from '../noise.js';
import {softTexture} from '../Sky.jsx';
import {Post} from '../Post.jsx';
import {cl, lerp, ramp, eio, eout} from './util.js';

// sample points on boxes / ellipsoids (surface-ish) -> deterministic target list
const sampleShape = (shape, n, seed) => {
  const r = rng(seed); const parts = [];
  if (shape === 'ufo') parts.push(['ell', [0, 1.6, 0], [2.4, 0.35, 2.4], 0.6], ['ell', [0, 2.05, 0], [0.9, 0.55, 0.9], 0.25], ['ring', [0, 1.45, 0], [2.0, 0, 2.0], 0.15]);
  else if (shape === 'creature') parts.push(['ell', [0, 3.3, 0], [0.32, 0.42, 0.3], 0.12], ['box', [0, 2.35, 0], [0.42, 1.3, 0.25], 0.26],
    ['box', [-0.45, 2.05, 0], [0.1, 1.7, 0.1], 0.1], ['box', [0.45, 2.05, 0], [0.1, 1.7, 0.1], 0.1], ['box', [-0.15, 0.85, 0], [0.13, 1.7, 0.13], 0.14], ['box', [0.15, 0.85, 0], [0.13, 1.7, 0.13], 0.14], ['eyes', [0, 3.35, 0.27], [0.12, 0, 0], 0.03]);
  else parts.push(['ell', [0, 2.75, 0], [0.26, 0.3, 0.26], 0.15], ['box', [0, 1.95, 0], [0.62, 0.95, 0.3], 0.3], ['box', [-0.42, 1.95, 0], [0.16, 0.9, 0.16], 0.1],
    ['box', [0.42, 1.95, 0], [0.16, 0.9, 0.16], 0.1], ['box', [-0.16, 0.75, 0], [0.22, 1.45, 0.22], 0.17], ['box', [0.16, 0.75, 0], [0.22, 1.45, 0.22], 0.17]);
  const tot = parts.reduce((s, p) => s + p[3], 0); const pts = [];
  parts.forEach(([k, c, s, w]) => {
    const m = Math.round(n * w / tot);
    for (let i = 0; i < m && pts.length < n; i++) {
      if (k === 'box') { const face = Math.floor(r() * 3); const v = [r() - 0.5, r() - 0.5, r() - 0.5]; v[face] = r() < 0.5 ? -0.5 : 0.5; pts.push([c[0] + v[0] * s[0], c[1] + v[1] * s[1], c[2] + v[2] * s[2]]); }
      else if (k === 'ell') { const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u); pts.push([c[0] + q * Math.cos(th) * s[0], c[1] + u * s[1], c[2] + q * Math.sin(th) * s[2]]); }
      else if (k === 'ring') { const th = r() * Math.PI * 2; pts.push([c[0] + Math.cos(th) * s[0], c[1], c[2] + Math.sin(th) * s[2]]); }
      else if (k === 'eyes') { const sd = i % 2 ? 1 : -1; pts.push([c[0] + sd * s[0] + (r() - 0.5) * 0.05, c[1] + (r() - 0.5) * 0.04, c[2]]); }
    }
  });
  while (pts.length < n) pts.push(pts[pts.length % Math.max(1, pts.length)] || [0, 1, 0]);
  return pts;
};

const Cam = ({f, dur}) => { const {camera} = useThree(); const t = eio(cl(f / dur)); const a = lerp(-0.35, 0.35, t);
  camera.position.set(Math.sin(a) * 11, 2.4, Math.cos(a) * 11); camera.fov = 32; camera.updateProjectionMatrix(); camera.lookAt(0, 1.8, 0); return null; };

export const ParticleFigure = ({dur = 105, count = 400, shape = 'person', targets, color = '#9fe8ff', seed = 7, size = 0.13, label, assemble = [0.05, 0.5], disperse = 0.78}) => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  const N = Math.min(count, 400); // CRASH-PROOF cap (raise only after a still test)
  const T = useMemo(() => targets || sampleShape(shape, N, seed), [targets, shape, N, seed]);
  const S = useMemo(() => { const r = rng(seed + 11); return T.map(() => { const th = r() * 6.283, ph = Math.acos(r() * 2 - 1), d = 5 + r() * 6; return [Math.sin(ph) * Math.cos(th) * d, 1.8 + Math.cos(ph) * d * 0.7, Math.sin(ph) * Math.sin(th) * d - 2, r()]; }); }, [T, seed]);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); return g; }, [N]);
  const mat = useMemo(() => new THREE.PointsMaterial({size, map: softTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false}), [size, color]);
  const a0 = dur * assemble[0], a1 = dur * assemble[1], d0 = dur * disperse;
  const pos = geo.attributes.position.array;
  for (let i = 0; i < N; i++) {
    const t = T[i], s = S[i]; const order = (t[1] / 3.6) * 0.6 + s[3] * 0.4; // bottom-up with jitter
    const st = lerp(a0, a1 - 12, order); const k = cl((f - st) / 14);
    const e = k < 1 ? eout(k) * (1 + 0.08 * Math.sin(k * Math.PI)) : 1;
    const sh = 0.015 * Math.sin(f * 0.3 + i);
    let x = lerp(s[0], t[0], e) + sh, y = lerp(s[1], t[1], e), z = lerp(s[2], t[2], e) + sh;
    if (f > d0) { const dk = cl((f - d0 - s[3] * 10) / (dur - d0)); const w = dk * dk; x += w * (2.5 + s[3] * 3); y += w * (0.8 + Math.sin(i) * 0.8); z -= w * s[3] * 2; }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
  }
  geo.attributes.position.needsUpdate = true;
  mat.opacity = f > d0 ? 1 - 0.85 * ramp(f, d0 + 6, dur) : 1;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 50%, #0d1a24 0%, #030507 80%)'}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}}>
        <Cam f={f} dur={dur} />
        <points geometry={geo} material={mat} />
        {/* faint floor ring for scale */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[0.9, 0.95, 48]} /><meshBasicMaterial color={color} transparent opacity={0.25 * ramp(f, a1 - 10, a1)} toneMapped={false} /></mesh>
        <Post bloom={1.2} threshold={0.35} vignette={0.5} />
      </ThreeCanvas>
      {label && <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', top: 1440, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 70, color: '#fff', WebkitTextStroke: '7px #141414', paintOrder: 'stroke fill', letterSpacing: 2, opacity: ramp(f, a1 - 6, a1 + 4)}}>{label}</div></AbsoluteFill>}
    </AbsoluteFill>
  );
};
