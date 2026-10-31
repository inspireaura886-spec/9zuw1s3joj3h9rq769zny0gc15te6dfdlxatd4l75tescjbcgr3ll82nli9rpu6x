import * as THREE from 'three';
import {useMemo} from 'react';
import {rng, hash2, clamp01} from './noise.js';
import {softTexture} from './Sky.jsx';

/** Flat low-poly water disc/plane. color can be animated by the caller (e.g. blue -> red). ripple uses frame. */
export const Water = ({position = [0, 0, 0], radius = 10, color = '#2f78b7', opacity = 0.95, frame = 0, ripple = 0.08, seg = 18, shape = 'circle', size = [20, 20], spec = '#33445a'}) => {
  const geo = useMemo(() => {
    const g = shape === 'circle' ? new THREE.CircleGeometry(radius, seg * 2, 0, Math.PI * 2) : new THREE.PlaneGeometry(size[0], size[1], seg, seg);
    g.rotateX(-Math.PI / 2); return g.toNonIndexed();
  }, [radius, seg, shape, size[0], size[1]]);
  const p = geo.attributes.position;
  if (ripple) {
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.9 + frame * 0.07) * Math.cos(z * 0.8 + frame * 0.05) * ripple); }
    p.needsUpdate = true; geo.computeVertexNormals();
  }
  return <mesh geometry={geo} position={position}><meshPhongMaterial color={color} flatShading transparent={opacity < 1} opacity={opacity} shininess={28} specular={spec} /></mesh>;
};

/**
 * Low-poly cloud / gas / smoke made of icosahedron puffs travelling along a path.
 * path: [[x,y,z],...] polyline; progress 0..1 = how far the front has travelled; spread = lateral width.
 * groundFn(x,z) keeps puffs hugging the terrain (heavy gas).
 */
export const PuffCloud = ({path, progress = 1, count = 90, spread = 4, size = 1.8, color = '#c9d8c0', opacity = 0.35, groundFn, lift = 0.8, frame = 0, seed = 2}) => {
  const puffs = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({s: r(), off: (r() - 0.5) * 2, up: r(), sz: 0.6 + r() * 0.8, ph: r() * 6.28})); }, [count, seed]);
  const lens = useMemo(() => { const l = [0]; for (let i = 1; i < path.length; i++) l.push(l[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2])); return l; }, [path]);
  const total = lens[lens.length - 1];
  const at = (s) => {
    const d = s * total; let i = 1; while (i < lens.length - 1 && lens[i] < d) i++;
    const t = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1); const a = path[i - 1], b = path[i];
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1;
    return {x: a[0] + dx * t, y: a[1] + (b[1] - a[1]) * t, z: a[2] + dz * t, nx: -dz / L, nz: dx / L};
  };
  return (<group>{puffs.map((q, i) => {
    if (q.s > progress) return null;
    const P = at(q.s); const age = clamp01((progress - q.s) * 6);
    const lat = q.off * spread * (0.5 + 0.5 * age);
    const x = P.x + P.nx * lat + Math.sin(frame * 0.03 + q.ph) * 0.3, z = P.z + P.nz * lat + Math.cos(frame * 0.025 + q.ph) * 0.3;
    const y = (groundFn ? groundFn(x, z) : P.y) + lift + q.up * size * 0.8;
    const sc = size * q.sz * (0.4 + 0.6 * age);
    return <mesh key={i} position={[x, y, z]} rotation={[q.ph, q.ph * 2, 0]} scale={sc}><icosahedronGeometry args={[1, 0]} />
      <meshLambertMaterial color={color} transparent opacity={opacity * age} depthWrite={false} flatShading /></mesh>;
  })}</group>);
};

/** Water/foam column (eruption, degassing jet). height grows with t 0..1, spray falls outward. */
export const Fountain = ({position = [0, 0, 0], t = 1, height = 20, width = 2, count = 70, color = '#e9f2f5', emissive = '#000000', puff = 0.45, frame = 0, seed = 4}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({a: r() * 6.28, h: r(), sp: r(), sz: 0.5 + r() * 0.9, ph: r()})); }, [count, seed]);
  const H = height * t;
  return (<group position={position}>
    {t > 0.02 && <mesh position={[0, H / 2, 0]}><cylinderGeometry args={[width * 0.35, width * 0.6, H, 7]} /><meshLambertMaterial color={color} emissive={emissive} flatShading transparent opacity={0.85} /></mesh>}
    {ps.map((p, i) => {
      const cyc = (p.ph + frame * 0.012) % 1; const top = p.h < 0.55;
      const y = top ? H * (0.75 + 0.25 * Math.sin(cyc * Math.PI)) : H * p.h;
      const rad = top ? width * (0.6 + cyc * 3.5 * p.sp) : width * 0.5;
      return <mesh key={i} position={[Math.cos(p.a) * rad, Math.max(0, y - (top ? cyc * cyc * H * 0.35 : 0)), Math.sin(p.a) * rad]} scale={p.sz * width * puff * Math.max(0.2, t)}>
        <icosahedronGeometry args={[1, 0]} /><meshLambertMaterial color={color} emissive={emissive} flatShading /></mesh>;
    })}
  </group>);
};

/** Rising bubbles in a vertical column (for cutaways). */
export const Bubbles = ({position = [0, 0, 0], height = 8, count = 30, frame = 0, speed = 0.01, size = 0.18, color = '#e8fbff', spread = 1, seed = 8, opacity = 0.9}) => {
  const bs = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * spread, z: (r() - 0.5) * spread, ph: r(), s: 0.6 + r() * 0.8})); }, [count, seed, spread]);
  return (<group position={position}>{bs.map((b, i) => {
    const c = (b.ph + frame * speed * b.s) % 1;
    return <mesh key={i} position={[b.x + Math.sin(c * 12 + i) * 0.1, c * height, b.z]} scale={size * b.s * (0.6 + c)}><icosahedronGeometry args={[1, 0]} />
      <meshLambertMaterial color={color} transparent opacity={opacity * (1 - c * 0.5)} flatShading /></mesh>;
  })}</group>);
};

/** Dirt road / path strip following a centre-line fn x=cx(z) over the terrain. */
export const Road = ({cx, z0 = 0, z1 = 50, width = 1.8, step = 0.5, groundFn, color = '#a5835a', lift = 0.3}) => {
  const geo = useMemo(() => {
    const v = [];
    for (let z = z0; z < z1; z += step) {
      const a = [cx(z) - width / 2, z], b = [cx(z) + width / 2, z], c = [cx(z + step) - width / 2, z + step], d = [cx(z + step) + width / 2, z + step];
      const Y = ([x, zz]) => [x, groundFn(x, zz) + lift, zz];
      v.push(...Y(a), ...Y(c), ...Y(b), ...Y(b), ...Y(c), ...Y(d));
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  }, [z0, z1, width, step]);
  return <mesh geometry={geo}><meshLambertMaterial color={color} flatShading side={THREE.DoubleSide} /></mesh>;
};

/** Rain streaks in a box around center (night storms, "cold rain" beats). */
export const Rain = ({center = [0, 0, 0], area = 30, height = 25, count = 220, frame = 0, speed = 0.9, color = '#cfe0ff', opacity = 0.55, seed = 11}) => {
  const ds = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * area, z: (r() - 0.5) * area, ph: r()})); }, [count, area, seed]);
  return (<group position={center}>{ds.map((q, i) => {
    const y = height - ((q.ph * height + frame * speed) % height);
    return <mesh key={i} position={[q.x, y, q.z]} rotation={[0, 0, 0.12]}><boxGeometry args={[0.04, 1.1, 0.04]} /><meshBasicMaterial color={color} transparent opacity={opacity} /></mesh>;
  })}</group>);
};

// ===================== v2 (2026-10-15) moving-parts effects =====================
const Sprite = ({p, s, c, o, add}) => (
  <sprite position={p} scale={[s, s * 0.62, 1]}><spriteMaterial map={softTexture()} color={c} transparent opacity={o} depthWrite={false} blending={add ? THREE.AdditiveBlending : THREE.NormalBlending} /></sprite>
);

/**
 * Soft rolling low fog (heavy gas): layered translucent billboards flowing along a path, hugging the ground, billowing.
 * Same path/progress/groundFn API as PuffCloud. layers = vertical sheets.
 */
export const FogCloud = ({path, progress = 1, count = 260, spread = 6, size = 6, color = '#d9f2c8', opacity = 0.22, groundFn, lift = 0.4, frame = 0, seed = 2, layers = 3, tail = 1}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({s: Math.pow(r(), 0.8), off: (r() - 0.5) * 2, l: Math.floor(r() * layers), sz: 0.6 + r() * 0.9, ph: r() * 6.28, sp: 0.5 + r()})); }, [count, seed, layers]);
  const lens = useMemo(() => { const l = [0]; for (let i = 1; i < path.length; i++) l.push(l[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2])); return l; }, [path]);
  const total = lens[lens.length - 1];
  const at = (s) => {
    const d = Math.min(1, Math.max(0, s)) * total; let i = 1; while (i < lens.length - 1 && lens[i] < d) i++;
    const t = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1); const a = path[i - 1], b = path[i];
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1;
    return {x: a[0] + dx * t, z: a[2] + dz * t, nx: -dz / L, nz: dx / L};
  };
  return (<group>{ps.map((q, i) => {
    // each puff creeps forward slowly within the body of the cloud (rolling), front edge thin
    const s = q.s * progress; if (s > progress) return null;
    const front = clamp01((progress - s) * 8); const back = tail < 1 ? clamp01((s - (1 - tail) * progress) * 4 + 0.3) : 1;
    const roll = (frame * 0.004 * q.sp + q.ph) % 1;
    const P = at(s + roll * 0.02);
    const lat = q.off * spread * (0.55 + 0.45 * front);
    const x = P.x + P.nx * lat + Math.sin(frame * 0.02 + q.ph) * 0.8, z = P.z + P.nz * lat + Math.cos(frame * 0.017 + q.ph) * 0.8;
    const y = (groundFn ? groundFn(x, z) : 0) + lift + q.l * size * 0.16 + Math.sin(frame * 0.03 + q.ph) * 0.15;
    const sc = size * q.sz * (0.5 + 0.5 * front) * (1 + 0.12 * Math.sin(frame * 0.025 + q.ph));
    return <Sprite key={i} p={[x, y, z]} s={sc} c={color} o={opacity * front * back * (q.l === 0 ? 1 : 0.7)} />;
  })}</group>);
};

/** Chimney / hut smoke: soft sprites rising and drifting from a point. */
export const Smoke = ({position = [0, 0, 0], frame = 0, count = 10, height = 5, color = '#d8dde6', opacity = 0.45, wind = [0.8, 0, 0.3], seed = 1, size = 1.4}) => {
  const ps = useMemo(() => { const r = rng(seed); return Array.from({length: count}, (_, i) => ({ph: i / count + r() * 0.05, w: r()})); }, [count, seed]);
  return (<group position={position}>{ps.map((q, i) => {
    const c = (q.ph + frame * 0.006) % 1;
    return <Sprite key={i} p={[wind[0] * c * height + Math.sin(c * 6 + q.w * 6) * 0.25, c * height, wind[2] * c * height]} s={size * (0.5 + c * 1.6)} c={color} o={opacity * Math.sin(Math.PI * Math.min(1, c * 1.3))} />;
  })}</group>);
};

/** Flock of low-poly birds circling (flapping wings). center/radius/height in world units. */
export const Birds = ({center = [0, 20, 0], radius = 12, count = 7, frame = 0, speed = 0.01, color = '#1f2433', size = 0.5, seed = 3}) => {
  const bs = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({a: r() * 0.9, r: radius * (0.75 + r() * 0.4), h: (r() - 0.5) * 3, ph: r() * 6.28})); }, [count, radius, seed]);
  return (<group>{bs.map((b, i) => {
    const a = b.a + frame * speed; const x = center[0] + Math.cos(a) * b.r, z = center[2] + Math.sin(a) * b.r, y = center[1] + b.h + Math.sin(frame * 0.05 + b.ph) * 0.5;
    const flap = Math.sin(frame * 0.45 + b.ph) * 0.7;
    return <group key={i} position={[x, y, z]} rotation={[0, -a, 0]} scale={size}>
      <mesh><boxGeometry args={[0.3, 0.2, 0.9]} /><meshLambertMaterial color={color} flatShading /></mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, flap]}><boxGeometry args={[1.0, 0.06, 0.45]} /><meshLambertMaterial color={color} flatShading /></mesh>
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, -flap]}><boxGeometry args={[1.0, 0.06, 0.45]} /><meshLambertMaterial color={color} flatShading /></mesh>
    </group>;
  })}</group>);
};

/** Blinking fireflies / floating motes (additive). area box around center. */
export const Fireflies = ({center = [0, 2, 0], area = [30, 4, 30], count = 60, frame = 0, color = '#d8ff6a', size = 0.7, opacity = 0.9, seed = 9, groundFn}) => {
  const fs = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * area[0], y: r() * area[1], z: (r() - 0.5) * area[2], ph: r() * 6.28, sp: 0.5 + r()})); }, [count, seed, area[0], area[1], area[2]]);
  return (<group>{fs.map((q, i) => {
    const x = center[0] + q.x + Math.sin(frame * 0.02 * q.sp + q.ph) * 1.2, z = center[2] + q.z + Math.cos(frame * 0.017 * q.sp + q.ph) * 1.2;
    const y = (groundFn ? groundFn(x, z) : center[1]) + 0.6 + q.y + Math.sin(frame * 0.04 + q.ph) * 0.4;
    const blink = Math.max(0, Math.sin(frame * 0.09 * q.sp + q.ph));
    return <Sprite key={i} p={[x, y, z]} s={size} c={color} o={opacity * blink} add />;
  })}</group>);
};

/** Drifting low-poly clouds (white puffy clusters). */
export const Clouds = ({count = 8, frame = 0, y = 28, area = 160, color = '#ffffff', opacity = 0.95, speed = 0.03, seed = 4, z0 = 0}) => {
  const cs = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * area, z: (r() - 0.5) * area * 0.7 + z0, y: y + r() * 8, s: 2.5 + r() * 3, n: 3 + Math.floor(r() * 3), ph: r()})); }, [count, area, seed, y, z0]);
  return (<group>{cs.map((c, i) => {
    const x = ((c.x + frame * speed * (0.7 + c.ph) + area / 2) % area + area) % area - area / 2;
    return <group key={i} position={[x, c.y, c.z]} scale={c.s}>
      {Array.from({length: c.n}, (_, k) => <mesh key={k} position={[(k - c.n / 2) * 0.9, Math.sin(k * 2.1) * 0.25, Math.cos(k * 1.3) * 0.3]} scale={[1 - Math.abs(k - c.n / 2) * 0.18, 0.75, 0.8]}>
        <icosahedronGeometry args={[1, 0]} /><meshLambertMaterial color={color} flatShading transparent={opacity < 1} opacity={opacity} fog={false} /></mesh>)}
    </group>;
  })}</group>);
};

/** Expanding ripple rings on water (rain, bubbles, raft). */
export const Ripples = ({center = [0, 0, 0], area = 8, count = 8, frame = 0, color = '#e8f6ff', period = 60, maxR = 1.6, seed = 6, opacity = 0.7}) => {
  const rs = useMemo(() => { const r = rng(seed); return Array.from({length: count}, () => ({x: (r() - 0.5) * area, z: (r() - 0.5) * area, ph: r()})); }, [count, area, seed]);
  return (<group position={center}>{rs.map((q, i) => {
    const c = ((frame / period) + q.ph) % 1;
    return <mesh key={i} position={[q.x, 0.05, q.z]} rotation={[-Math.PI / 2, 0, 0]} scale={0.2 + c * maxR}><ringGeometry args={[0.85, 1, 20]} /><meshBasicMaterial color={color} transparent opacity={opacity * (1 - c)} depthWrite={false} /></mesh>;
  })}</group>);
};

/** Campfire with flickering flames + glow (for villagers at night). */
export const Campfire = ({position = [0, 0, 0], frame = 0, scale = 1, out = 0}) => {
  const k = 1 - clamp01(out);
  return (<group position={position} scale={scale}>
    {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.1, 0]} rotation={[0, i * 1.05, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.9, 5]} /><meshLambertMaterial color="#5a3a22" flatShading /></mesh>)}
    {k > 0 && [0, 1, 2, 3].map((i) => { const fl = 0.75 + 0.25 * Math.sin(frame * 0.6 + i * 2.1); return <mesh key={'f' + i} position={[Math.sin(i * 1.6) * 0.12, 0.3 + i * 0.08, Math.cos(i * 1.6) * 0.12]} rotation={[0, frame * 0.1 + i, 0]} scale={[0.28 * fl * k, 0.6 * fl * k * (1 - i * 0.15), 0.28 * fl * k]}>
      <coneGeometry args={[1, 1, 5]} /><meshBasicMaterial color={i % 2 ? '#ffd23a' : '#ff6a1f'} /></mesh>; })}
    {k > 0 && <sprite position={[0, 0.5, 0]} scale={[3.2 * k, 3.2 * k, 1]}><spriteMaterial map={softTexture()} color="#ff9a3a" transparent opacity={0.6 * (0.85 + 0.15 * Math.sin(frame * 0.5))} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>}
    {k > 0 && <pointLight position={[0, 0.8, 0]} color="#ff9a4a" intensity={6 * k} distance={7} decay={1.5} />}
  </group>);
};
