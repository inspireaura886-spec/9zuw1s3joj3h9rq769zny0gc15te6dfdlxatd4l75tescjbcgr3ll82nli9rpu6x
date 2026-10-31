import {useMemo} from 'react';
import {Terrain, makeHeight, RoundHut, Building, Tree, Cow, Water, Road, Smoke, rng, smoothstep, fbm} from '../../kit/index.js';

// Lake Nyos world: crater lake at the origin, a winding valley running toward +Z with the village in it.
export const LAKE_R = 9.5, WATER_Y = 1.2;
export const valleyX = (z) => 3.5 * Math.sin(z * 0.075);
export const height = makeHeight({seed: 7, amp: 2.4, freq: 0.05, shape: (x, z, h) => {
  const r = Math.hypot(x, z);
  const notch = 1 - 0.6 * Math.exp(-(((x - valleyX(z)) / 6) ** 2)) * smoothstep(0, 8, z);
  let y = h + 7.5 * Math.exp(-(((r - 13) / 4) ** 2)) * notch - 0.05 * r;
  // valley carved toward +z, hills either side
  const d = Math.abs(x - valleyX(z));
  const vz = smoothstep(12, 22, z);
  y += vz * (-3.2 * Math.exp(-((d / 7) ** 2)) + 2.2 * smoothstep(9, 22, d));
  // crater bowl
  if (r < 12) { const bowl = WATER_Y - 6 * (1 - (r / 11.5) ** 2); const k = smoothstep(9.5, 12, r); y = bowl * (1 - k) + y * k; }
  return y;
}});

const BANDS = [[-99, '#5fae3a'], [0.9, '#4fa032'], [2.0, '#62b23c'], [3.6, '#7cc444'], [5.5, '#9ccd52'], [7.5, '#c2b56a']];
const pickBand = (h) => { let c = BANDS[0][1]; for (const [l, col] of BANDS) if (h >= l) c = col; return c; };
const colorFn = (h, x, z) => { const r = Math.hypot(x, z); if (r < 10.8) return h < WATER_Y - 0.3 ? '#7a6040' : '#b08a58'; return pickBand(h); };

export const village = (() => {
  const r = rng(1986); const huts = [];
  for (let i = 0; i < 26; i++) {
    const z = 22 + r() * 30; const side = r() < 0.5 ? -1 : 1; const x = valleyX(z) + side * (2.5 + r() * 7);
    const tooClose = huts.some((h) => Math.hypot(h.x - x, h.z - z) < 3.3); if (tooClose) continue;
    huts.push({x, z, rot: r() * 6.28, kind: r() < 0.35 ? 'house' : 'hut', s: 0.8 + r() * 0.35, k: i});
  }
  return huts;
})();
export const cows = (() => { const r = rng(44); return Array.from({length: 9}, (_, i) => { const z = 26 + r() * 22; return {x: valleyX(z) + (r() < 0.5 ? -1 : 1) * (1.8 + r() * 2.6), z, rot: r() * 6.28, k: i}; }); })();
export const trees = (() => {
  const r = rng(12); const t = [];
  for (let i = 0; i < 140; i++) {
    const x = (r() - 0.5) * 130, z = (r() - 0.5) * 130 + 10; const rr = Math.hypot(x, z);
    if (rr < 15) continue; if (Math.abs(x - valleyX(z)) < 2.5 && z > 15) continue;
    if (village.some((h) => Math.hypot(h.x - x, h.z - z) < 2.6)) continue;
    t.push({x, z, s: 0.8 + r() * 0.8, kind: r() < 0.3 ? 'pine' : 'round', seed: i});
  }
  return t;
})();

/**
 * The whole valley. lake: water colour; lit: 0..1 village lights; litOff(k): per-hut override (lights going out);
 * cowsLying; tint (terrain multiply, e.g. night blue); showVillage.
 */
const lerpRoad = (tint) => (tint === '#ffffff' ? '#c99a5e' : '#9a7c58');
/** v2: frame drives swaying trees, flickering windows, grazing cows, hut smoke. cowFall: 0..1 or fn(k) collapse; smoke 0..1. */
export const NyosWorld = ({frame = 0, lake = '#2f78b7', lit = 0, litFn, cowsLying = false, cowFall, tint = '#ffffff', showVillage = true, lakeOpacity = 0.96, smoke = 0, smokeColor = '#e6e9f0', wind = 1, spec}) => (
  <group>
    <Terrain height={height} size={170} seg={84} colorFn={colorFn} tint={tint} center={[0, 18]} />
    <Road cx={valleyX} z0={12} z1={68} groundFn={height} color={lerpRoad(tint)} />
    <Water position={[0, WATER_Y, 0]} radius={LAKE_R + 1.8} color={lake} frame={frame} ripple={0.09} opacity={lakeOpacity} spec={spec} />
    {trees.map((t, i) => <Tree key={i} position={[t.x, height(t.x, t.z) - 0.1, t.z]} s={t.s} kind={t.kind} seed={t.seed} frame={frame} wind={wind} color={['#2f8a3a', '#3fa040', '#2a7a45'][i % 3]} />)}
    {showVillage && village.map((h, i) => {
      const L = litFn ? litFn(h.k) : lit; const y = height(h.x, h.z) - 0.15;
      return <group key={i}>{h.kind === 'hut'
        ? <RoundHut position={[h.x, y, h.z]} rotation={h.rot} scale={h.s} lit={L} frame={frame} k={h.k} />
        : <Building position={[h.x, y, h.z]} rotation={h.rot} scale={h.s * 0.75} w={3.6} d={2.8} h={2.2} roof={1.0} color="#e8c890" roofColor={['#c4473a', '#4f86c6', '#8f9ba6'][h.k % 3]} lit={L} litSeed={h.k} frame={frame} />}
        {smoke > 0 && h.k % 3 === 0 && <Smoke position={[h.x, y + (h.kind === 'hut' ? 2.6 : 2.4) * h.s, h.z]} frame={frame + h.k * 37} seed={h.k} opacity={0.4 * smoke} color={smokeColor} height={5} />}
      </group>;
    })}
    {showVillage && cows.map((c, i) => <Cow key={i} position={[c.x, height(c.x, c.z) - 0.05, c.z]} rotation={c.rot} scale={0.7} frame={frame} seed={c.k}
      fallT={typeof cowFall === 'function' ? cowFall(c.k) : cowFall !== undefined ? cowFall : cowsLying ? 1 : 0} color={i % 2 ? '#f1ebe0' : '#9a5e34'} patch={i % 2 ? '#3a2a22' : '#f1ebe0'} />)}
  </group>
);
