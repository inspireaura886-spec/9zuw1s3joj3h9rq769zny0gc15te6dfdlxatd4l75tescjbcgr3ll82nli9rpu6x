// STYLE a (2026-10-30): map / route tracing on a low-poly 3D globe. Animated great-circle arc between stops, pins pop in,
// globe turns to keep the travelling head in view, date stamp counts along. Pure function of frame.
// <RouteGlobe stops={[{lat: 49.2, lon: 4.0, label: 'DIJON', date: '16 SEP 1890'}, {lat: 48.85, lon: 2.35, label: 'PARIS', date: '16 SEP 1890'}]} dur={105} />
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {fbm} from '../noise.js';
import {isLand} from './landmask.js';
import {softTexture} from '../Sky.jsx';
import {Post} from '../Post.jsx';
import {cl, lerp, ramp, eio, ebackOut, ll2v, pal} from './util.js';

const R = 4;
// low-poly globe: icosahedron (33.6k faces, ~1.2 deg), each face coloured by the REAL Natural Earth 110m land mask (landmask.js), fbm only varies the land tone
const useGlobe = (seed, sea, land, land2, ice) => useMemo(() => {
  const g = new THREE.IcosahedronGeometry(R, 40).toNonIndexed();
  const p = g.attributes.position; const col = new Float32Array(p.count * 3); const c = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const lat = Math.asin(cy / Math.hypot(cx, cy, cz)) * 180 / Math.PI, lon = Math.atan2(cx, cz) * 180 / Math.PI;
    const n = fbm(cx * 0.9 + 10, cz * 0.9 + cy * 0.6, seed, 3);
    const land_ = isLand(lat, lon);
    if (Math.abs(lat) > 72 && land_ || Math.abs(lat) > 80) c.set(ice); else if (land_) c.set(n > 0.12 ? land2 : land); else c.set(sea);
    c.offsetHSL(0, 0, n * 0.06);
    for (let k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}, [seed, sea, land, land2, ice]);

const arcPoints = (a, b, lift = 0.35, n = 64) => {
  const A = new THREE.Vector3(...ll2v(a.lat, a.lon)), B = new THREE.Vector3(...ll2v(b.lat, b.lon));
  const ang = A.angleTo(B); const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; const v = ang < 1e-4 ? A.clone() : A.clone().multiplyScalar(Math.sin((1 - t) * ang) / Math.sin(ang)).add(B.clone().multiplyScalar(Math.sin(t * ang) / Math.sin(ang)));
    v.normalize().multiplyScalar(R * (1.01 + Math.sin(Math.PI * t) * lift * Math.min(1, ang * 1.4 + 0.15)));
    pts.push(v);
  }
  return pts;
};

const Cam = ({dist, tilt}) => { const {camera} = useThree(); camera.position.set(0, tilt, dist); camera.fov = 38; camera.near = 0.1; camera.far = 100; camera.updateProjectionMatrix(); camera.lookAt(0, 0, 0); return null; };

export const RouteGlobe = ({stops, dur = 105, palette = 'ia', seed = 3, zoom, lift = 0.35, showDate = true, labelY = 1180, title,
  colors = {sea: '#123a52', land: '#3c5a3a', land2: '#5b6e45', ice: '#d8e6ea'}}) => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig(); const P = pal(palette);
  const geo = useGlobe(seed, colors.sea, colors.land, colors.land2, colors.ice);
  const legs = stops.length - 1;
  // auto zoom: whole globe -> the route's region (span = largest angle between stops)
  const span = useMemo(() => { let m = 0; stops.forEach((a) => stops.forEach((b) => { m = Math.max(m, new THREE.Vector3(...ll2v(a.lat, a.lon)).angleTo(new THREE.Vector3(...ll2v(b.lat, b.lon)))); })); return m; }, [JSON.stringify(stops)]);
  const Z = zoom || [18, R + cl(span * R * 1.9, 2.4, 9)];
  const k = Z[1] / 12; // size of strokes / pins scales with the final view
  // timeline: 15% intro spin, then legs evenly, 12% hold
  const t0 = dur * 0.15, t1 = dur * 0.88; const legLen = (t1 - t0) / Math.max(1, legs);
  const curves = useMemo(() => stops.slice(1).map((s, i) => new THREE.CatmullRomCurve3(arcPoints(stops[i], s, lift))), [JSON.stringify(stops), lift]);
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 96, 0.04 * k, 6, false)), [curves, k]);
  const legIdx = Math.min(legs - 1, Math.max(0, Math.floor((f - t0) / legLen)));
  const legT = eio(cl((f - t0 - legIdx * legLen) / legLen));
  // head position (lat/lon) to aim the globe at
  const a = stops[legIdx], b = stops[legIdx + 1] || a;
  const head = f < t0 ? stops[0] : {lat: lerp(a.lat, b.lat, legT), lon: lerp(a.lon, b.lon, legT)};
  const intro = eio(ramp(f, 0, t0 + 6));
  const lat = head.lat * intro * 0.85, lon = head.lon - (1 - intro) * 70;
  const dist = lerp(Z[0], Z[1], eio(ramp(f, 0, dur * 0.6)));
  const cur = f < t0 ? 0 : legIdx + legT;
  const st = stops[Math.min(stops.length - 1, Math.round(cur))];
  const dateTxt = showDate ? (st.date || '') : '';
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 50%, #0f2233 0%, ${P.bg} 75%)`}}>
      <ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true}}>
        <Cam dist={dist} tilt={1.2} />
        <hemisphereLight args={['#cfe3ff', '#0a0c10', 1.4]} />
        <directionalLight position={[-6, 5, 8]} intensity={2.6} color="#fff1d6" />
        <directionalLight position={[8, 2, -6]} intensity={1.4} color={P.cyan} />
        <group rotation={[lat * Math.PI / 180, -lon * Math.PI / 180, 0]}>
          <mesh geometry={geo}><meshLambertMaterial vertexColors flatShading /></mesh>
          {/* atmosphere rim */}
          <mesh scale={1.06}><sphereGeometry args={[R, 32, 24]} /><meshBasicMaterial color={P.cyan} transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} /></mesh>
          {tubes.map((g, i) => {
            const prog = f < t0 ? 0 : i < legIdx ? 1 : i === legIdx ? legT : 0;
            const cnt = Math.floor(g.index.count * prog / 36) * 36;
            g.setDrawRange(0, cnt);
            return <mesh key={i} geometry={g}><meshBasicMaterial color={P.accent} toneMapped={false} /></mesh>;
          })}
          {f >= t0 && (() => { const c = curves[legIdx]; const p = c.getPointAt(cl(legT)); return <sprite position={p.toArray()} scale={[0.55 * k, 0.55 * k, 1]}><spriteMaterial map={softTexture()} color={P.accent} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>; })()}
          {stops.map((s, i) => {
            const at = i === 0 ? t0 - 8 : t0 + i * legLen - 2;
            if (f < at) return null;
            const v = new THREE.Vector3(...ll2v(s.lat, s.lon, R)); const n = v.clone().normalize(); const kk = ebackOut(cl((f - at) / 10)) * k * 0.5;
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
            const pulse = 1 + 0.25 * Math.sin((f - at) * 0.25);
            return <group key={i} position={v.toArray()} quaternion={q} scale={kk}>
              <mesh position={[0, 0.35, 0]}><coneGeometry args={[0.13, 0.5, 6]} /><meshBasicMaterial color={i === stops.length - 1 ? P.red : P.accent} toneMapped={false} /></mesh>
              <mesh position={[0, 0.66, 0]}><icosahedronGeometry args={[0.16, 0]} /><meshBasicMaterial color={i === stops.length - 1 ? P.red : P.accent} toneMapped={false} /></mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={pulse}><ringGeometry args={[0.22, 0.3, 24]} /><meshBasicMaterial color={P.accent} transparent opacity={0.7} toneMapped={false} /></mesh>
            </group>;
          })}
        </group>
        <Post bloom={0.9} threshold={0.55} vignette={0.5} />
      </ThreeCanvas>
      {/* labels + date stamp (DOM) */}
      <AbsoluteFill style={{pointerEvents: 'none', fontFamily: 'Lilita One'}}>
        {title && <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', color: '#fff', fontSize: 78, letterSpacing: 2, WebkitTextStroke: '8px #141414', paintOrder: 'stroke fill', opacity: ramp(f, 2, 10)}}>{title}</div>}
        {f >= t0 - 8 && <div style={{position: 'absolute', top: labelY, width: '100%', textAlign: 'center'}}>
          <span style={{background: P.accent, color: '#141414', fontSize: 54, padding: '8px 28px', borderRadius: 16, border: '5px solid #141414', letterSpacing: 2}}>{st.label}</span>
        </div>}
        {dateTxt && <div style={{position: 'absolute', top: labelY + 110, width: '100%', textAlign: 'center'}}>
          <span style={{display: 'inline-block', transform: 'rotate(-3deg)', background: '#d6302a', color: '#fff', fontSize: 46, padding: '6px 24px', borderRadius: 12, border: '5px solid #141414', letterSpacing: 3, fontFamily: 'monospace', fontWeight: 700}}>{dateTxt}</span>
        </div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
