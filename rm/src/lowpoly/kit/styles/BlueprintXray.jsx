// STYLE b (2026-10-30): blueprint / wireframe X-ray reconstruction. Every part's edges draw in as glowing struts (staggered),
// then a scan plane sweeps up and the solid toon body fills in below it (clipping plane), on a blueprint grid. Orbiting camera.
// parts = [{type: 'box'|'cyl'|'cone'|'roof', args, position, rotation, color}], default = a lighthouse + keeper's cottage.
// <BlueprintXray dur={105} label="THE LIGHTHOUSE, 1900" />  or  <BlueprintXray parts={MY_PARTS} target={[0, 2, 0]} />
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {Post} from '../Post.jsx';
import {cl, lerp, ramp, eio, eout, pal} from './util.js';

export const LIGHTHOUSE_PARTS = [
  {type: 'cyl', args: [1.5, 1.9, 0.6, 8], position: [0, 0.3, 0], color: '#8a8f96'},
  {type: 'cyl', args: [0.95, 1.35, 6.2, 8], position: [0, 3.7, 0], color: '#e8e2d6'},
  {type: 'cyl', args: [1.25, 1.1, 0.25, 8], position: [0, 6.9, 0], color: '#3a3f46'},
  {type: 'cyl', args: [0.75, 0.75, 1.1, 8], position: [0, 7.6, 0], color: '#ffd36a'},
  {type: 'cone', args: [0.95, 0.8, 8], position: [0, 8.55, 0], color: '#a8352f'},
  {type: 'box', args: [3.2, 1.8, 2.2], position: [3.4, 0.9, 0.6], color: '#d8c39a'},
  {type: 'roof', args: [3.4, 1.1, 2.4], position: [3.4, 1.8, 0.6], color: '#a8352f'},
  {type: 'box', args: [0.5, 1.0, 0.5], position: [4.3, 2.4, 0.2], color: '#7a6a5a'},
];

const geomFor = (p) => {
  const a = p.args;
  if (p.type === 'cyl') return new THREE.CylinderGeometry(a[0], a[1], a[2], a[3] || 8);
  if (p.type === 'cone') return new THREE.ConeGeometry(a[0], a[1], a[2] || 8);
  if (p.type === 'roof') { // gable prism, width x height x depth, sits on y=0
    const s = new THREE.Shape(); s.moveTo(-a[0] / 2, 0); s.lineTo(a[0] / 2, 0); s.lineTo(0, a[1]); s.lineTo(-a[0] / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, {depth: a[2], bevelEnabled: false}); g.translate(0, 0, -a[2] / 2); return g; }
  return new THREE.BoxGeometry(...a);
};

const Cam = ({f, dur, target, r, h}) => {
  const {camera} = useThree(); const t = eio(cl(f / dur));
  const ang = lerp(-0.9, 0.55, t); const rr = lerp(r * 1.12, r * 0.92, t);
  camera.position.set(target[0] + Math.sin(ang) * rr, target[1] + lerp(h * 1.3, h * 0.8, t), target[2] + Math.cos(ang) * rr);
  camera.fov = 40; camera.near = 0.1; camera.far = 200; camera.updateProjectionMatrix(); camera.lookAt(...target); return null;
};

export const BlueprintXray = ({parts = LIGHTHOUSE_PARTS, dur = 105, target = [1.4, 4.3, 0], radius = 23, height = 3.5, palette = 'ia', label, strut = 0.035}) => {
  const f = useCurrentFrame(); const {width, height: H} = useVideoConfig(); const P = pal(palette);
  // build edge segments once: [{a, b, len, part}]
  const data = useMemo(() => {
    const segs = []; const geos = parts.map(geomFor);
    let yMin = Infinity, yMax = -Infinity;
    geos.forEach((g, pi) => {
      const p = parts[pi]; const m = new THREE.Matrix4().compose(new THREE.Vector3(...p.position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation || [0, 0, 0]))), new THREE.Vector3(1, 1, 1));
      const e = new THREE.EdgesGeometry(g, 20); const pos = e.attributes.position;
      for (let i = 0; i < pos.count; i += 2) {
        const a = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(m), b = new THREE.Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1)).applyMatrix4(m);
        yMin = Math.min(yMin, a.y, b.y); yMax = Math.max(yMax, a.y, b.y);
        segs.push({a, b, len: a.distanceTo(b), pi, mid: (a.y + b.y) / 2});
      }
    });
    // order: bottom-up so the build reads like a reconstruction
    segs.sort((s1, s2) => s1.mid - s2.mid || s1.pi - s2.pi);
    return {segs, geos, yMin, yMax};
  }, [parts]);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  // phases: edges 0..55%, scan fill 50..90%, hold
  const tE0 = 0, tE1 = dur * 0.55, tS0 = dur * 0.48, tS1 = dur * 0.9;
  const n = data.segs.length;
  const scanY = lerp(data.yMin - 0.2, data.yMax + 0.3, eio(ramp(f, tS0, tS1)));
  plane.constant = scanY;
  const strutMat = useMemo(() => new THREE.MeshBasicMaterial({color: P.line, toneMapped: false}), [P.line]);
  const cylG = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 5, 1, true), []);
  const up = new THREE.Vector3(0, 1, 0);
  const fade = 1 - 0.65 * eio(ramp(f, tS0 + 10, tS1 + 5));
  return (
    <AbsoluteFill style={{background: '#0e2f57'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(159,232,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(159,232,255,0.16) 2px, transparent 2px), linear-gradient(rgba(159,232,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(159,232,255,0.07) 1px, transparent 1px)',
        backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px', backgroundPosition: `${-f * 0.6}px ${f * 0.4}px`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 55% at 50% 48%, transparent 30%, rgba(4,14,30,0.85) 100%)'}} />
      <ThreeCanvas width={width} height={H} gl={{antialias: true, alpha: true, localClippingEnabled: true}} onCreated={({gl: g}) => { g.localClippingEnabled = true; }}>
        <Cam f={f} dur={dur} target={target} r={radius} h={height} />
        <hemisphereLight args={['#dff1ff', '#0e2f57', 1.3]} />
        <directionalLight position={[6, 10, 8]} intensity={2.4} color="#fff3dc" />
        <directionalLight position={[-8, 4, -6]} intensity={1.3} color={P.cyan} />
        {/* struts */}
        {data.segs.map((s, i) => {
          const st = lerp(tE0, tE1 - 8, i / n); const k = eout(cl((f - st) / 8)); if (k <= 0) return null;
          const len = s.len * k; const dir = s.b.clone().sub(s.a).normalize();
          const mid = s.a.clone().add(dir.clone().multiplyScalar(len / 2));
          const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
          return <mesh key={i} geometry={cylG} material={strutMat} position={mid.toArray()} quaternion={q} scale={[strut * fade + 0.008, len, strut * fade + 0.008]} />;
        })}
        {/* joints glow where the drawing head is */}
        {data.segs.map((s, i) => { const st = lerp(tE0, tE1 - 8, i / n); const k = cl((f - st) / 8); if (k <= 0 || k >= 1) return null;
          const p = s.a.clone().lerp(s.b, eout(k)); return <mesh key={'h' + i} position={p.toArray()}><icosahedronGeometry args={[0.09, 0]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>; })}
        {/* solids fill below the scan plane */}
        {f >= tS0 && data.geos.map((g, i) => <mesh key={'s' + i} geometry={g} position={parts[i].position} rotation={parts[i].rotation || [0, 0, 0]}>
          <meshLambertMaterial color={parts[i].color || '#d8d2c4'} flatShading clippingPlanes={[plane]} side={THREE.DoubleSide} />
        </mesh>)}
        {/* scan plane */}
        {f >= tS0 && f <= tS1 + 4 && <mesh position={[target[0], scanY, target[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.4, 32]} /><meshBasicMaterial color={P.line} transparent opacity={0.22 * (1 - ramp(f, tS1 - 4, tS1 + 4))} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>}
        <Post bloom={1.0} threshold={0.55} vignette={0.35} />
      </ThreeCanvas>
      <AbsoluteFill style={{pointerEvents: 'none', fontFamily: 'monospace', color: P.line}}>
        <div style={{position: 'absolute', top: 236, left: 90, fontSize: 30, letterSpacing: 4, opacity: 0.85}}>FIG. {String(Math.min(n, Math.floor(n * ramp(f, tE0, tE1)))).padStart(3, '0')} / {n}  ·  RECONSTRUCTION</div>
        <div style={{position: 'absolute', top: 236, right: 90, fontSize: 30, letterSpacing: 4, opacity: 0.85}}>{Math.round(100 * ramp(f, tS0, tS1))}%</div>
        {label && <div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 70, color: '#fff', letterSpacing: 3, WebkitTextStroke: '7px #0b2244', paintOrder: 'stroke fill', opacity: ramp(f, 8, 16)}}>{label}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
