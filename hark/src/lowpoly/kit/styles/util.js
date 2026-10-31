// NEW ANIMATION STYLES 2026-10-30: shared helpers (pure functions of frame, no clocks, no Math.random).
export const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (f, a, b) => cl((f - a) / Math.max(1, b - a));
export const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eout = (t) => 1 - Math.pow(1 - t, 3);
export const ebackOut = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
// deterministic hash 0..1
export const h1 = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
// lat/lon (deg) -> unit sphere (y up, lon 0 faces +z)
export const ll2v = (lat, lon, r = 1) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)]; };
// IA style palettes for the 2D/3D styles (override per Short)
export const STYLE_PAL = {
  ia: {bg: '#07090c', ink: '#0d0f12', paper: '#e9dcc0', accent: '#ffd93b', red: '#ff5a4e', cyan: '#7fe3ff', glow: '#ffb070', line: '#9fe8ff'},
  sepia: {bg: '#120c07', ink: '#1a120a', paper: '#e6d2a8', accent: '#ffcf7a', red: '#d6302a', cyan: '#bfe3ff', glow: '#ffb46a', line: '#ffe1a8'},
  cold: {bg: '#050a14', ink: '#0a0f18', paper: '#d8e2e6', accent: '#7fe3ff', red: '#ff5a4e', cyan: '#7fe3ff', glow: '#a9cbe0', line: '#9fe8ff'},
};
export const pal = (p) => (typeof p === 'string' ? STYLE_PAL[p] || STYLE_PAL.ia : {...STYLE_PAL.ia, ...(p || {})});
