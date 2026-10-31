import * as THREE from 'three';
import {useMemo} from 'react';
import {rng, clamp01, smoothstep, hash2} from './noise.js';

/**
 * ANIMATION UPGRADE 2026-10-22. Stylised sea: flat-shaded swell made of summed directional waves, faces coloured by height
 * (deep trough -> lit face -> WHITE foam on the crests) plus a foam band where the sea meets land (groundFn), so coasts read
 * instantly. Recomputed per frame on the CPU (seg 70 ~ 30k verts: a few ms).
 */
const WAVES = [[1, 0.0, 0.22, 0.05], [0.55, 0.9, 0.37, 0.07], [0.3, -0.7, 0.61, 0.09], [0.18, 2.1, 0.95, 0.12]]; // [amp, dirAngle, k, omega]
export const seaHeight = (x, z, frame, amp = 0.6, choppy = 1, dirOffset = 0) => {
  let y = 0;
  for (const [a, d, k, w] of WAVES) { const dd = d + dirOffset; const p = (x * Math.cos(dd) + z * Math.sin(dd)) * k * (1 + (choppy - 1) * 0.3) - frame * w;
    const s = Math.sin(p); y += a * amp * (Math.sign(s) * Math.pow(Math.abs(s), 0.8) * 0.6 + 0.4 * (1 - Math.abs(Math.cos(p))) * choppy); }
  return y;
};
/**
 * <Ocean position={[0, 0, 0]} size={[120, 120]} frame={f} amp={0.7} deep="#0e3a5c" face="#2c7fa8" foam="#f4fbff" groundFn={height} />
 * amp: swell height (0.3 calm .. 1.4 storm). foamAt: crest threshold (0..1 of amp). groundFn(x,z): land height => shore foam band.
 * Storm look: amp 1.2, choppy 1.6, deep '#0b2233', face '#2f5f73'.
 */
export const Ocean = ({position = [0, 0, 0], size = [100, 100], seg = 70, frame = 0, amp = 0.6, choppy = 1, deep = '#0e3a5c', face = '#2c7fa8', foam = '#f4fbff', foamAt = 0.62, groundFn, shore = 1.2, opacity = 1, dir = 0}) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size[0], size[1], seg, Math.round(seg * size[1] / size[0])); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const c = size[0] / seg * 0.35; p.setX(i, x + (hash2(x, z, 4) - 0.5) * c); p.setZ(i, z + (hash2(z, x, 5) - 0.5) * c); }
    const n = g.toNonIndexed(); n.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count * 3), 3)); n.userData.base = n.attributes.position.array.slice(); return n;
  }, [size[0], size[1], seg]);
  const D = new THREE.Color(deep), F = new THREE.Color(face), W = new THREE.Color(foam), c = new THREE.Color();
  const p = geo.attributes.position, col = geo.attributes.color, base = geo.userData.base;
  for (let i = 0; i < p.count; i++) { const x = base[i * 3] + position[0], z = base[i * 3 + 2] + position[2]; p.setY(i, seaHeight(x, z, frame, amp, choppy, dir)); }
  for (let i = 0; i < p.count; i += 3) {
    const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3; const t = clamp01(h / (amp * 1.6) + 0.5);
    c.copy(D).lerp(F, smoothstep(0.2, 0.75, t));
    let fo = smoothstep(foamAt, foamAt + 0.12, t) * (0.6 + 0.4 * hash2(base[i * 3], base[i * 3 + 2], Math.floor(frame / 6)));
    if (groundFn) { const x = base[i * 3] + position[0], z = base[i * 3 + 2] + position[2]; const g = groundFn(x, z) - position[1];
      const band = 1 - clamp01(Math.abs(g + 0.2 + Math.sin(frame * 0.08 + x * 0.3) * 0.25) / shore); fo = Math.max(fo, band * 0.95); }
    c.lerp(W, clamp01(fo));
    for (let k = 0; k < 3; k++) col.setXYZ(i + k, c.r, c.g, c.b);
  }
  p.needsUpdate = true; col.needsUpdate = true; geo.computeVertexNormals();
  return <mesh geometry={geo} position={position} frustumCulled={false}><meshLambertMaterial vertexColors flatShading transparent={opacity < 1} opacity={opacity} /></mesh>;
};

/**
 * Curling, breaking wave (barrel) that rolls along +z and peels along x. t 0..1: 0 swell, ~0.55 lip throwing, 0.8 lip lands,
 * 1 collapsed into whitewater. Foam lip + spray particles from the lip + whitewater at the base after impact.
 * Place it in front of a cliff / beach and drive t with interpolate(). width along x, height = crest height.
 * <BreakingWave position={[0, 0, 6]} rotation={[0, Math.PI, 0]} width={30} height={5} t={interpolate(f, [0, 70], [0, 1])} frame={f} />
 */
export const BreakingWave = ({position = [0, 0, 0], rotation = [0, 0, 0], width = 24, height = 4, t = 0.5, frame = 0, peel = 0.35, travel = 6, deep = '#0f4a6e', face = '#3fa3c4', foam = '#f6fcff', seed = 2, spray = 90}) => {
  const WS = 22, PS = 18; // segments along width / along profile
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); const n = WS * PS * 6 * 2; g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3)); return g; }, []);
  const D = new THREE.Color(deep), F = new THREE.Color(face), W = new THREE.Color(foam), cc = new THREE.Color();
  // profile point s in [0,1] for local curl amount c: back slope -> crest -> lip (curls forward and down). returns [z, y, foam]
  const prof = (s, c, H) => {
    const crestZ = 0;
    if (s < 0.55) { const u = s / 0.55; const z = -H * 2.2 * (1 - u); const y = H * Math.pow(Math.sin(u * Math.PI / 2), 1.6); return [z + crestZ, y, u > 0.92 ? (u - 0.92) * 6 : 0]; }
    const u = (s - 0.55) / 0.45; const r = H * 0.46; const phi = u * Math.PI * (0.25 + 1.0 * c);
    const z = crestZ + Math.sin(phi) * r * (0.6 + c * 0.7); const y = H - r + Math.cos(phi) * r - u * u * H * 0.15 * c;
    return [z, Math.max(0, y), smoothstep(0.35, 0.9, u) * (0.5 + c * 0.5)];
  };
  const face2 = (s, c, H) => { // concave front face under the lip, from front trough up to the lip underside
    const zt = H * (0.55 + c * 0.35); const z = zt * (1 - s) * (1 - s * 0.35); const y = H * 0.92 * Math.pow(s, 1.25); return [z, y, s < 0.12 ? 0.6 : 0];
  };
  const pos = geo.attributes.position.array, col = geo.attributes.color.array; let k = 0;
  const C = (x) => clamp01(t * (1 + peel) - (x / width + 0.5) * peel); // local curl progress (peels from -x to +x)
  const Hx = (x) => { const c = C(x); return height * (c < 0.8 ? 0.55 + 0.45 * smoothstep(0, 0.5, c) : 1 - smoothstep(0.8, 1, c) * 0.75); };
  const push = (P, f) => { pos[k * 3] = P[0]; pos[k * 3 + 1] = P[1]; pos[k * 3 + 2] = P[2]; const yy = P[1] / height; cc.copy(D).lerp(F, smoothstep(0.05, 0.75, yy)).lerp(W, clamp01(f)); col[k * 3] = cc.r; col[k * 3 + 1] = cc.g; col[k * 3 + 2] = cc.b; k++; };
  for (const fn of [prof, face2]) for (let i = 0; i < WS; i++) for (let j = 0; j < PS; j++) {
    const x0 = (i / WS - 0.5) * width, x1 = ((i + 1) / WS - 0.5) * width, s0 = j / PS, s1 = (j + 1) / PS;
    const P = (x, s) => { const c = C(x), H = Hx(x); const [z, y, f] = fn(s, c, H); const tz = travel * t; return [[x, y + Math.sin(x * 0.7 + frame * 0.1) * 0.05 * H, z + tz + Math.sin(x * 0.4) * 0.3], f + (c > 0.8 ? (c - 0.8) * 2.5 : 0)]; };
    const a = P(x0, s0), b = P(x1, s0), c2 = P(x0, s1), d = P(x1, s1);
    push(a[0], a[1]); push(b[0], b[1]); push(c2[0], c2[1]); push(b[0], b[1]); push(d[0], d[1]); push(c2[0], c2[1]);
  }
  geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals();
  // spray from the lip + whitewater puffs after impact
  const sp = useMemo(() => { const r = rng(seed); return Array.from({length: spray}, () => ({x: r() - 0.5, ph: r(), v: 0.5 + r(), s: 0.5 + r()})); }, [spray, seed]);
  return <group position={position} rotation={rotation}>
    <mesh geometry={geo} frustumCulled={false}><meshLambertMaterial vertexColors flatShading side={THREE.DoubleSide} /></mesh>
    {sp.map((q, i) => {
      const x = q.x * width; const c = C(x); if (c < 0.3) return null; const H = Hx(x);
      const cyc = (q.ph + frame * 0.02 * q.v) % 1; const tz = travel * t;
      const lip = prof(1, c, H); const impact = c > 0.75;
      const px = x + Math.sin(i) * 0.3, pz = (impact ? H * 0.9 : lip[0]) + tz + cyc * (impact ? 2.5 : 1.6) * q.v, py = (impact ? 0.2 : lip[1]) + cyc * (impact ? H * 0.9 : 1.2) - cyc * cyc * H * (impact ? 1.1 : 1.0);
      const s = (impact ? 0.55 : 0.22) * q.s * (1 - cyc * 0.6) * H / 4;
      return <mesh key={i} position={[px, Math.max(0.05, py), pz]} rotation={[q.ph * 6, q.ph * 3, 0]} scale={s}><icosahedronGeometry args={[1, 0]} /><meshLambertMaterial color={foam} flatShading transparent opacity={0.92} /></mesh>;
    })}
  </group>;
};
