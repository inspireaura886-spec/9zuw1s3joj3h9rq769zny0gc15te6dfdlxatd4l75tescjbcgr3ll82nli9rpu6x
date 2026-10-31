import * as THREE from 'three';
import {useMemo} from 'react';
import {clamp01, easeInOut} from '../kit/noise.js';

// Marathon-1904 characters: Minecraft-style blocky people with a 16x16 pixel face (many expressions),
// hats, shorts/tank tops, and fully posable joints (direct angles, driven by pose helpers below).
const TEX = new Map();
const pixTex = (key, n, draw) => {
  if (TEX.has(key)) return TEX.get(key);
  const cv = document.createElement('canvas'); cv.width = n; cv.height = n; const g = cv.getContext('2d');
  draw((x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); });
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false;
  TEX.set(key, t); return t;
};
export const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();

// expr: open | happy | o | closed | swirl | dead | angry | sleepy | grin | sad
const faceTex = (skin, hair, eye, expr, beard) => pixTex(`F${skin}${hair}${eye}${expr}${beard}`, 16, (r) => {
  const dk = shade(skin, 0.62), mouth = '#3a1410';
  r(0, 0, 16, 16, skin); r(0, 0, 16, 4, hair); r(0, 4, 2, 2, hair); r(14, 4, 2, 2, hair);
  r(7, 9, 2, 2, shade(skin, 0.82)); // nose
  r(2, 9, 2, 1, shade(skin, 1.08)); r(12, 9, 2, 1, shade(skin, 1.08));
  const eyes = (fn) => { fn(3); fn(10); };
  if (expr === 'closed' || expr === 'sleepy') eyes((x) => r(x, 7, 3, 1, dk));
  else if (expr === 'happy') eyes((x) => { r(x, 7, 3, 1, dk); r(x, 6, 1, 1, dk); r(x + 2, 6, 1, 1, dk); });
  else if (expr === 'dead') eyes((x) => { r(x, 5, 1, 1, '#111'); r(x + 2, 5, 1, 1, '#111'); r(x + 1, 6, 1, 1, '#111'); r(x, 7, 1, 1, '#111'); r(x + 2, 7, 1, 1, '#111'); });
  else if (expr === 'swirl') eyes((x) => { r(x - 1, 5, 4, 4, '#ffffff'); r(x - 1, 5, 4, 1, '#7a2fd0'); r(x + 2, 5, 1, 4, '#7a2fd0'); r(x - 1, 8, 4, 1, '#7a2fd0'); r(x, 6, 1, 2, '#7a2fd0'); r(x + 1, 7, 1, 1, '#ff3b8a'); });
  else { eyes((x) => { r(x, 6, 3, 2, '#ffffff'); r(expr === 'angry' ? x + 1 : x + 1, 6, 1, 2, eye); });
    if (expr === 'angry') eyes((x) => { r(x, 5, 3, 1, hair); r(x === 3 ? x + 2 : x, 4, 1, 1, hair); });
    else if (expr === 'sad') eyes((x) => { r(x, 5, 3, 1, shade(hair, 1.1)); r(x === 3 ? x : x + 2, 4, 1, 1, shade(hair, 1.1)); });
    else eyes((x) => r(x, 4, 3, 1, shade(hair, 0.9))); }
  if (beard) { r(2, 11, 12, 5, beard); r(0, 8, 2, 6, beard); r(14, 8, 2, 6, beard); }
  if (expr === 'o' || expr === 'swirl') { r(6, 12, 4, 3, mouth); r(7, 13, 2, 1, '#c9455a'); }
  else if (expr === 'happy' || expr === 'grin') { r(4, 12, 8, 1, mouth); r(5, 13, 6, 1, mouth); r(6, 12, 4, 1, '#ffffff'); }
  else if (expr === 'dead') { r(5, 12, 6, 1, mouth); r(9, 13, 2, 2, '#e8607a'); }
  else if (expr === 'sleepy') { r(6, 12, 3, 2, mouth); }
  else if (expr === 'sad' || expr === 'angry') { r(5, 13, 6, 1, mouth); r(4, 14, 1, 1, mouth); r(11, 14, 1, 1, mouth); }
  else r(5, 12, 6, 1, shade(skin, 0.5));
});
const sideTex = (skin, hair) => pixTex(`S${skin}${hair}`, 8, (r) => { r(0, 0, 8, 8, skin); r(0, 0, 8, 3, hair); r(5, 3, 3, 1, hair); r(2, 4, 1, 2, shade(skin, 0.8)); });
const backTex = (skin, hair) => pixTex(`B${skin}${hair}`, 8, (r) => { r(0, 0, 8, 8, hair); r(0, 6, 8, 2, shade(skin, 0.95)); r(2, 1, 1, 1, shade(hair, 1.25)); });
const topTex = (hair) => pixTex(`T${hair}`, 8, (r) => { r(0, 0, 8, 8, hair); r(1, 2, 2, 1, shade(hair, 1.25)); r(5, 5, 2, 1, shade(hair, 1.2)); });
const shirtTex = (shirt, pattern, num) => pixTex(`sh${shirt}${pattern}${num}`, 16, (r) => {
  r(0, 0, 16, 16, shirt);
  if (pattern === 'stripe') { r(0, 4, 16, 2, shade(shirt, 0.7)); r(0, 10, 16, 2, shade(shirt, 0.7)); }
  else if (pattern === 'sash') { for (let i = 0; i < 16; i++) r(i, i, 3, 2, '#d6302a'); }
  else if (pattern === 'suit') { r(6, 0, 4, 9, '#f4f1e8'); r(7, 1, 2, 6, '#c22f2a'); r(5, 0, 1, 16, shade(shirt, 0.7)); r(10, 0, 1, 16, shade(shirt, 0.7)); }
  else if (pattern === 'tank') { r(0, 0, 3, 16, 'rgba(0,0,0,0)'); }
  else if (pattern === 'hoodie') { r(4, 0, 8, 3, shade(shirt, 0.8)); r(5, 9, 6, 4, shade(shirt, 0.85)); r(7, 3, 1, 4, '#eeeeee'); r(9, 3, 1, 4, '#eeeeee'); }
  if (num) { r(4, 5, 8, 6, '#fbf6e6'); r(5, 6, 2, 4, '#1a1a1a'); r(9, 6, 2, 4, '#1a1a1a'); }
  r(0, 15, 16, 1, '#3a2a1c');
});

const B = ({p, s, c, map, rot, o = 1}) => (
  <mesh position={p} rotation={rot || [0, 0, 0]}><boxGeometry args={s} />
    <meshLambertMaterial color={c} map={map || null} transparent={o < 1} opacity={o} flatShading /></mesh>
);

const Hat = ({kind, color}) => {
  if (!kind) return null;
  if (kind === 'boater') return <group position={[0, 0.56, 0]}><mesh><cylinderGeometry args={[0.46, 0.46, 0.05, 12]} /><meshLambertMaterial color={color || '#e9cf7a'} flatShading /></mesh>
    <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.3, 0.3, 0.18, 12]} /><meshLambertMaterial color={color || '#e9cf7a'} flatShading /></mesh>
    <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.305, 0.305, 0.06, 12]} /><meshLambertMaterial color="#20243a" flatShading /></mesh></group>;
  if (kind === 'bowler') return <group position={[0, 0.56, 0]}><mesh><cylinderGeometry args={[0.4, 0.4, 0.04, 12]} /><meshLambertMaterial color={color || '#24201c'} flatShading /></mesh>
    <mesh position={[0, 0.14, 0]}><sphereGeometry args={[0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshLambertMaterial color={color || '#24201c'} flatShading /></mesh></group>;
  if (kind === 'beret') return <mesh position={[0.04, 0.6, 0]} rotation={[0, 0, -0.18]} scale={[1, 0.32, 1]}><sphereGeometry args={[0.36, 10, 6]} /><meshLambertMaterial color={color || '#1d1d24'} flatShading /></mesh>;
  if (kind === 'cap') return <group position={[0, 0.56, 0]}><B p={[0, 0.05, 0]} s={[0.56, 0.12, 0.56]} c={color || '#c22f2a'} /><B p={[0, 0, 0.36]} s={[0.5, 0.04, 0.24]} c={color || '#c22f2a'} /></group>;
  if (kind === 'top') return <group position={[0, 0.56, 0]}><mesh><cylinderGeometry args={[0.42, 0.42, 0.04, 12]} /><meshLambertMaterial color="#141418" flatShading /></mesh>
    <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.28, 0.28, 0.55, 12]} /><meshLambertMaterial color="#141418" flatShading /></mesh></group>;
  if (kind === 'wreath') return <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.07, 5, 12]} /><meshLambertMaterial color="#3f9a3a" flatShading /></mesh>;
  return null;
};

/**
 * Guy: blocky person ~2 units tall at scale 1, facing +Z.
 * look: {skin, hair, eye, shirt, pants, shoes, pattern, num, hat, hatColor, shorts, beard, sleeves(false = tank)}
 * j (joints, radians): lA rA (arm swing, negative = forward/up), lAz rAz (arm out), lL rL (leg swing), lK rK (knee bend), lean (+ forward), roll (side tilt),
 *   twist (y), headX (nod +down), headZ (tilt), headY (turn), bob (y offset), lie (0..1 lie on back), face (expr)
 */
export const Guy = ({position = [0, 0, 0], rotation = 0, scale = 1, look = {}, j = {}, expr, children, holdR, holdL, sweat = 0, frame = 0}) => {
  const L = {skin: '#c98a5a', hair: '#2a1a12', eye: '#2b1a10', shirt: '#f4f1e8', pants: '#2b3a5a', shoes: '#2a1d16', pattern: 'plain', ...look};
  const ex = expr || j.face || 'open';
  const hm = useMemo(() => {
    const M = (map) => new THREE.MeshLambertMaterial({map});
    const s = sideTex(L.skin, L.hair), t = topTex(L.hair);
    return [M(s), M(s), M(t), M(t), M(faceTex(L.skin, L.hair, L.eye, ex, L.beard || '')), M(backTex(L.skin, L.hair))];
  }, [L.skin, L.hair, L.eye, ex, L.beard]);
  const st = useMemo(() => shirtTex(L.shirt, L.pattern, L.num || ''), [L.shirt, L.pattern, L.num]);
  const {lA = 0, rA = 0, lAz = 0.06, rAz = 0.06, lL = 0, rL = 0, lK = 0, rK = 0, lean = 0, roll = 0, twist = 0, headX = 0, headZ = 0, headY = 0, bob = 0, lie = 0, lEl = 0, rEl = 0} = j;
  const hipY = 0.75; const sleeve = L.sleeves !== false;
  const lieT = easeInOut(clamp01(lie));
  const leg = (x, a, k, key) => <group key={key} position={[x, hipY, 0]} rotation={[a, 0, 0]}>
    {L.shorts ? <B p={[0, -0.13, 0]} s={[0.26, 0.28, 0.28]} c={L.pants} /> : <B p={[0, -0.17, 0]} s={[0.25, 0.36, 0.27]} c={L.pants} />}
    <group position={[0, -0.34, 0]} rotation={[k, 0, 0]}>
      <B p={[0, -0.13, 0]} s={[0.24, 0.3, 0.26]} c={L.shorts ? L.skin : L.pants} />
      <B p={[0, -0.33, 0.03]} s={[0.26, 0.13, 0.32]} c={L.shoes} />
    </group>
  </group>;
  const arm = (x, a, z, el, hold, key) => <group key={key} position={[x, 0.3, 0]} rotation={[a, 0, z]}>
    <B p={[0, -0.12, 0]} s={[0.23, 0.26, 0.24]} c={sleeve ? L.shirt : L.skin} />
    <group position={[0, -0.25, 0]} rotation={[el, 0, 0]}>
      <B p={[0, -0.12, 0]} s={[0.22, 0.26, 0.23]} c={L.skin} />
      {hold && <group position={[0, -0.3, 0.05]}>{hold}</group>}
    </group>
  </group>;
  return (
    <group position={[position[0], position[1] + bob + 0.15 * lieT, position[2]]} rotation={[0, rotation, 0]} scale={scale}>
      <group rotation={[-Math.PI / 2 * lieT, 0, 0]}>
        <group rotation={[lean, twist, roll]} position={[0, 0, 0]}>
          {leg(-0.13, lL, lK, 'l')}{leg(0.13, rL, rK, 'r')}
          <group position={[0, hipY + 0.375, 0]}>
            <B p={[0, 0, 0]} s={[0.52, 0.75, 0.28]} map={st} c="#ffffff" />
            {arm(-0.385, lA, -lAz, lEl, holdL, 'la')}{arm(0.385, rA, rAz, rEl, holdR, 'ra')}
            <group position={[0, 0.375, 0]} rotation={[headX, headY, headZ]}>
              <mesh position={[0, 0.28, 0]} material={hm}><boxGeometry args={[0.56, 0.56, 0.56]} /></mesh>
              <group position={[0, 0.0, 0]}><Hat kind={L.hat} color={L.hatColor} /></group>
              {sweat > 0 && [0, 1].map((i) => { const c = ((frame * 0.05 + i * 0.5) % 1); return <mesh key={i} position={[0.32 - i * 0.64, 0.45 - c * 0.5, 0.22]} scale={0.07 * (1 - c * 0.5)}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#9fe0ff" transparent opacity={sweat * (1 - c)} /></mesh>; })}
            </group>
            {children}
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------------- pose helpers (all deterministic from a clock t in frames) ----------------
/** Run cycle. k = 0 fresh .. 1 dead-tired (shorter stride, droopy arms, head lolling, wobble). */
export const runPose = (t, k = 0, speed = 1) => {
  const ph = t * 0.42 * speed; const s = Math.sin(ph); const amp = 1 - 0.45 * k;
  return {lA: -s * 1.0 * amp + 0.15 * k, rA: s * 1.0 * amp + 0.15 * k, lEl: -1.2 * amp, rEl: -1.2 * amp, lL: s * 0.85 * amp, rL: -s * 0.85 * amp,
    lK: Math.max(0, -Math.cos(ph)) * 1.1 * amp + 0.2, rK: Math.max(0, Math.cos(ph)) * 1.1 * amp + 0.2,
    bob: Math.abs(Math.cos(ph)) * 0.12 * amp, lean: 0.18 + 0.15 * k, roll: Math.sin(ph * 0.5) * 0.12 * k, headX: 0.1 * k + Math.sin(ph) * 0.05 * k, headZ: Math.sin(ph * 0.5 + 1) * 0.3 * k,
    lAz: 0.1 + 0.25 * k, rAz: 0.1 + 0.25 * k};
};
/** Zombie-wobble exhausted shuffle (Hicks). */
export const wobblePose = (t, k = 1) => {
  const ph = t * 0.22; const s = Math.sin(ph);
  return {lA: 0.25, rA: 0.25, lAz: 0.35 + Math.sin(t * 0.13) * 0.15, rAz: 0.35 + Math.cos(t * 0.11) * 0.15, lL: s * 0.35, rL: -s * 0.35, lK: 0.3, rK: 0.3,
    bob: Math.abs(Math.cos(ph)) * 0.05, lean: 0.25 * k, roll: Math.sin(t * 0.09) * 0.22 * k, headX: 0.45 * k, headZ: Math.sin(t * 0.12) * 0.45 * k, headY: Math.sin(t * 0.07) * 0.3};
};
export const idlePose = (t, seed = 0) => ({lA: Math.sin(t * 0.05 + seed) * 0.08, rA: -Math.sin(t * 0.05 + seed) * 0.08, headZ: Math.sin(t * 0.04 + seed) * 0.12, headY: Math.sin(t * 0.03 + seed * 2) * 0.25, bob: Math.sin(t * 0.08 + seed) * 0.01});
export const cheerPose = (t, seed = 0) => { const s = Math.sin(t * 0.35 + seed); return {lA: -2.7 + s * 0.3, rA: -2.7 - s * 0.3, lAz: 0.35, rAz: 0.35, bob: Math.max(0, s) * 0.25, headX: -0.25, lK: Math.max(0, -s) * 0.4, rK: Math.max(0, -s) * 0.4}; };
export const wavePose = (t) => ({rA: -2.6 + Math.sin(t * 0.5) * 0.15, rAz: 0.3 + Math.sin(t * 0.5) * 0.35, rEl: -0.3, lA: -0.2, headZ: Math.sin(t * 0.2) * 0.1});
export const pointPose = (t, shake = 1) => ({rA: -1.55 + Math.sin(t * 0.9) * 0.08 * shake, rAz: 0.05, lA: -0.4, lAz: 0.5, lEl: -1.6, lean: 0.12, headX: -0.1, bob: Math.abs(Math.sin(t * 0.45)) * 0.08 * shake});
export const sitPose = (t = 0) => ({lL: -1.5, rL: -1.5, lK: 1.5, rK: 1.5, lA: -0.5, rA: -0.5, lEl: -0.6, rEl: -0.6});
export const crampPose = (t) => ({lean: 0.75, lA: 0.6, rA: 0.9, rEl: -1.4, lEl: -0.6, rAz: 0.1, lL: 0.2, rL: -0.6, rK: 1.2, lK: 0.3, bob: -0.12, headX: -0.4, roll: Math.sin(t * 0.6) * 0.06});
export const drinkPose = (t, p = 1) => ({rA: -1.2 * p - 0.6 * p, rEl: -1.6 * p, rAz: 0.25, headX: -0.5 * p, lA: -0.2});
export const eatPose = (t) => ({rA: -1.6, rEl: -1.7 + Math.max(0, Math.sin(t * 0.5)) * 0.25, rAz: 0.3, headX: 0.12 - Math.max(0, Math.sin(t * 0.5)) * 0.1, lA: -0.3});
export const sleepPose = (t) => ({lie: 1, lA: -2.9, rA: -0.2, lAz: 0.5, rAz: 0.5, lEl: -1.6, lL: 0.1, rL: -0.25, rK: 0.6, bob: 0, headZ: 0.25 + Math.sin(t * 0.05) * 0.03});
export const thumbPose = (t) => ({rA: -1.4, rAz: 0.9 + Math.sin(t * 0.2) * 0.08, rEl: 0, lA: 0.1, headY: 0.5, headZ: Math.sin(t * 0.1) * 0.1});
export const carriedPose = (t) => { const s = Math.sin(t * 0.55); return {lAz: 1.25, rAz: 1.25, lA: 0, rA: 0, lL: s * 0.7, rL: -s * 0.7, lK: 0.6, rK: 0.6, headX: 0.6 + Math.sin(t * 0.13) * 0.15, headZ: Math.sin(t * 0.17) * 0.5, lean: 0.12, bob: 0.35}; };
export const shakePhonePose = (t) => ({rA: -1.2 + Math.sin(t * 1.6) * 0.45, rEl: -1.0, rAz: 0.2, lA: -0.3, headX: 0.25});
export const mix = (a, b, t) => { const o = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]); for (const k of keys) { const x = typeof a[k] === 'number' ? a[k] : 0, y = typeof b[k] === 'number' ? b[k] : 0; o[k] = x + (y - x) * t; } return o; };

// ---------------- looks ----------------
export const LOOKS = {
  lorz: {skin: '#e0a679', hair: '#6a3b1c', shirt: '#f6f3ea', pants: '#1f3c8a', shorts: true, sleeves: false, num: '1', shoes: '#3a2a1c'},
  hicks: {skin: '#e8b48c', hair: '#3a2416', shirt: '#f6f3ea', pants: '#7a1f24', shorts: true, sleeves: false, num: '2', pattern: 'sash'},
  carvajal: {skin: '#b97a4a', hair: '#1a120e', shirt: '#ffffff', pants: '#2d2d38', shorts: true, hat: 'beret', hatColor: '#26242e', shoes: '#4a3022'},
  len: {skin: '#5a341d', hair: '#120b08', shirt: '#f2c94c', pants: '#2a2a2a', shorts: true, sleeves: false, num: '3'},
  garcia: {skin: '#c99064', hair: '#1c1410', shirt: '#f6f3ea', pants: '#2e6b3a', shorts: true, sleeves: false},
  official: {skin: '#e2ab84', hair: '#4a3020', shirt: '#2b2b33', pants: '#2b2b33', pattern: 'suit', hat: 'bowler', beard: '#5a3a22'},
  trainer: {skin: '#d89a70', hair: '#2a1a10', shirt: '#7a5a3a', pants: '#3a3026', pattern: 'suit', hat: 'boater'},
  scientist: {skin: '#efc29a', hair: '#e8e2d8', shirt: '#f4f4f0', pants: '#3a3a44', pattern: 'suit', beard: '#d8d2c8'},
  modern: {skin: '#d9a072', hair: '#2a1a12', shirt: '#7a5be0', pants: '#2b3045', pattern: 'hoodie', shoes: '#f4f4f4'},
  runners: [
    {skin: '#e9b68e', hair: '#8a5a2a', shirt: '#f6f3ea', pants: '#1f3c8a', shorts: true, sleeves: false},
    {skin: '#c98a5a', hair: '#1a120e', shirt: '#e8e2d0', pants: '#7a1f24', shorts: true, sleeves: false},
    {skin: '#f0c8a0', hair: '#c9a24a', shirt: '#ffffff', pants: '#2b2b2b', shorts: true, sleeves: false},
    {skin: '#a86a40', hair: '#120b08', shirt: '#f2efe6', pants: '#2e6b3a', shorts: true, sleeves: false},
    {skin: '#e0a679', hair: '#3a2416', shirt: '#f6f3ea', pants: '#5a3a8a', shorts: true, sleeves: false},
  ],
  crowd: ['#c2453a', '#2f6db5', '#e9cf7a', '#3f8a4a', '#f4f1e8', '#7a5be0', '#e07a2f', '#2b2b33', '#d84a8a', '#4ab0c8'],
};
