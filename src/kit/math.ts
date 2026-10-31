// src/kit/math.ts
export const clamp = (v: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, v));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp(t, 0, 1);

export const easeOutCubic = (t: number): number => {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
};

export const easeInOutCubic = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

export const easeOutQuart = (t: number): number => {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 4);
};

// Deterministic pseudo-random in [0, 1)
export const hash01 = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

// Smooth periodic wave that equals 0 at frame === 0
export const loopWaveSin = (frame: number, freq = 0.12): number =>
  Math.sin(frame * freq);

export const loopWaveCosDelta = (frame: number, freq = 0.09): number =>
  1 - Math.cos(frame * freq);
