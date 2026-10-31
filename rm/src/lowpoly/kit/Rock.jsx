import * as THREE from 'three';
import {useMemo} from 'react';
import {rng, fbm, hash2} from './noise.js';

/**
 * ANIMATION UPGRADE 2026-10-22. Procedural rocks and stratified cliffs (replace "abstract grey cliff" sets).
 * Faces get per-face colour variation and the cliff gets real geology: alternating strata bands, ledges, overhangs, cracks,
 * a grass cap and boulders at the foot.
 */
const tint = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
/** Lumpy low-poly rock. <Rock position={[2, 0, 1]} size={1.2} seed={4} color="#6d625a" squash={0.7} /> */
export const Rock = ({position = [0, 0, 0], size = 1, seed = 1, color = '#6f6760', squash = 0.75, detail = 1, rotation = 0, moss}) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, detail); const p = g.attributes.position; const r = rng(seed);
    const off = [r() * 10, r() * 10];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 + 0.35 * fbm(x * 1.3 + off[0], z * 1.3 + y + off[1], seed, 2); p.setXYZ(i, x * k, Math.max(-0.35, y * k * squash), z * k); }
    const n = g.toNonIndexed(); const q = n.attributes.position; const cols = new Float32Array(q.count * 3);
    for (let i = 0; i < q.count; i += 3) { const ny = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3; const c = moss && ny > 0.35 ? new THREE.Color(moss) : tint(color, 0.82 + 0.3 * hash2(i, seed));
      for (let k = 0; k < 3; k++) cols.set([c.r, c.g, c.b], (i + k) * 3); }
    n.setAttribute('color', new THREE.BufferAttribute(cols, 3)); n.computeVertexNormals(); return n;
  }, [seed, color, squash, detail, moss]);
  return <mesh geometry={geo} position={position} rotation={[0, rotation, 0]} scale={size}><meshLambertMaterial vertexColors flatShading /></mesh>;
};

/**
 * Stratified cliff. footprint 'wall' = a cliff face along x (front at z = 0, facing +z, depth back to -depth);
 * 'island' = a closed cliff ring of radius `radius` (sea stack / island). layers = strata count; colors cycle per stratum.
 * rough = how jagged the face is; ledge = how much strata step in/out (ledges + overhangs); taper = narrowing toward the top.
 * <Cliff footprint="wall" width={30} height={14} depth={10} layers={7} seed={3} position={[0, -2, -4]} />
 * <Cliff footprint="island" radius={12} height={10} layers={6} cap="#6fae45" />
 */
export const Cliff = ({footprint = 'wall', width = 30, depth = 10, radius = 10, height = 12, layers = 7, seed = 3, rough = 1.2, ledge = 0.6, taper = 0.12,
  colors = ['#6d625a', '#857868', '#5a524c', '#9a8a74', '#6a5e55'], cap = '#6fae45', capThickness = 0.5, boulders = 10, position = [0, 0, 0], rotation = [0, 0, 0]}) => {
  const {geo, rocks} = useMemo(() => {
    const r = rng(seed); const parts = []; const lh = height / layers; const N = footprint === 'wall' ? 36 : 48;
    const off = Array.from({length: layers + 1}, () => (r() - 0.5) * 2 * ledge);
    for (let L = 0; L <= layers; L++) {
      const isCap = L === layers; const y0 = L * lh, hh = isCap ? capThickness : lh * (0.92 + r() * 0.12);
      const shrink = 1 - taper * (L / layers); const pts = [];
      const jag = (u) => rough * (fbm(u * 6 + seed, L * 0.7, seed, 3) + 0.35 * (hash2(Math.floor(u * N), L, seed) - 0.5)) + off[L] + (isCap ? -0.25 : 0);
      if (footprint === 'wall') {
        for (let i = 0; i <= N; i++) { const u = i / N; pts.push(new THREE.Vector2((u - 0.5) * width * shrink, -(jag(u)))); } // shape y = -z
        pts.push(new THREE.Vector2(width * shrink / 2, depth), new THREE.Vector2(-width * shrink / 2, depth));
      } else {
        for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; const R = radius * shrink + jag(i / N); pts.push(new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R)); }
      }
      const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {depth: hh, bevelEnabled: false, steps: 1});
      g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
      const n = g.toNonIndexed(); const q = n.attributes.position;
      for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i); const j = 0.22 * lh; q.setXYZ(i, x + (hash2(x, y, seed + 1) - 0.5) * j * 0.6, y + (hash2(z, x, seed + 2) - 0.5) * j * (isCap ? 0.2 : 0.5), z + (hash2(y, z, seed + 3) - 0.5) * j * 0.6); }
      const cols = new Float32Array(q.count * 3); const base = isCap ? cap : colors[L % colors.length];
      for (let i = 0; i < q.count; i += 3) { const crack = hash2(Math.floor(q.getX(i) * 0.7), L, seed + 7) > 0.9 ? 0.62 : 1; const c = tint(base, (0.84 + 0.26 * hash2(i, L, seed)) * crack);
        for (let k = 0; k < 3; k++) cols.set([c.r, c.g, c.b], (i + k) * 3); }
      n.setAttribute('color', new THREE.BufferAttribute(cols, 3)); delete n.attributes.uv; delete n.attributes.normal; parts.push(n);
    }
    // merge
    let total = 0; parts.forEach((p) => (total += p.attributes.position.count));
    const P = new Float32Array(total * 3), C = new Float32Array(total * 3); let o = 0;
    parts.forEach((p) => { P.set(p.attributes.position.array, o * 3); C.set(p.attributes.color.array, o * 3); o += p.attributes.position.count; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.computeVertexNormals();
    const rocks = Array.from({length: boulders}, (_, i) => { if (footprint === 'wall') return {p: [(r() - 0.5) * width * 0.9, 0, 0.6 + r() * 2.5], s: 0.5 + r() * 1.3, seed: seed * 10 + i};
      const a = r() * Math.PI * 2, R = radius + 0.8 + r() * 1.8; return {p: [Math.cos(a) * R, 0, -Math.sin(a) * R], s: 0.5 + r() * 1.2, seed: seed * 10 + i}; });
    return {geo, rocks};
  }, [footprint, width, depth, radius, height, layers, seed, rough, ledge, taper, cap, capThickness, boulders, colors.join()]);
  return <group position={position} rotation={rotation}>
    <mesh geometry={geo}><meshLambertMaterial vertexColors flatShading side={THREE.DoubleSide} /></mesh>
    {rocks.map((b, i) => <Rock key={i} position={b.p} size={b.s} seed={b.seed} color={colors[i % colors.length]} />)}
  </group>;
};
