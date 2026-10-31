// src/kit/DuskSky.tsx
import React from 'react';
import { THEME } from '../theme';
import { hash01 } from './math';

export interface DuskSkyProps {
  frame: number;
  variant?: 'dusk' | 'morning' | 'eclipse';
  cloudSpeed?: number;
  horizonY?: number;
}

/**
 * Anime-noir dusk sky (strictly NOT night, NO stars).
 * Deep indigo-violet zenith transitioning into purple-magenta and burnt orange-amber dusk horizon,
 * with cel-shaded drifting cloud bands and rising dust motes so the background always breathes.
 */
export const DuskSky: React.FC<DuskSkyProps> = ({
  frame,
  variant = 'dusk',
  cloudSpeed = 1,
  horizonY = 1220,
}) => {
  const isMorning = variant === 'morning';
  const isEclipse = variant === 'eclipse';

  const topColor = isMorning
    ? THEME.colors.dawnTop
    : isEclipse
    ? '#0E0920'
    : THEME.colors.duskTop;
  const midColor = isMorning
    ? THEME.colors.dawnMid
    : isEclipse
    ? '#231542'
    : THEME.colors.duskUpperMid;
  const lowColor = isMorning
    ? '#B86B5E'
    : isEclipse
    ? '#4F244B'
    : THEME.colors.duskLowerMid;
  const horizonColor = isMorning
    ? THEME.colors.dawnHorizon
    : isEclipse
    ? '#A64B3E'
    : THEME.colors.duskHorizon;

  // Periodic cloud drift (wraps cleanly or drifts smoothly)
  const drift1 = (frame * 0.55 * cloudSpeed) % 1400;
  const drift2 = (frame * 0.35 * cloudSpeed) % 1400;

  // Deterministic floating dust motes (not stars — strictly in the lower dusk haze & canyon air)
  const motes = Array.from({ length: 18 }, (_, i) => {
    const baseX = hash01(i * 11 + 3) * 1080;
    const baseY = 580 + hash01(i * 19 + 7) * 820;
    const r = 1.8 + hash01(i * 23 + 5) * 2.6;
    const dx = Math.sin(frame * 0.06 + i * 1.7) * 24 + ((frame * (0.4 + (i % 3) * 0.25)) % 220) - 110;
    const dy = Math.cos(frame * 0.05 + i * 2.1) * 16;
    const x = (baseX + dx + 1080) % 1080;
    const y = baseY + dy;
    const opacity = 0.18 + 0.15 * Math.sin(frame * 0.08 + i);
    return { x, y, r, opacity };
  });

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', inset: 0 }}
    >
      <defs>
        <linearGradient id={`sky-grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={topColor} />
          <stop offset="34%" stopColor={midColor} />
          <stop offset="62%" stopColor={lowColor} />
          <stop offset="82%" stopColor={horizonColor} />
          <stop offset="100%" stopColor="#140D26" />
        </linearGradient>

        <radialGradient id={`horizon-glow-${variant}`} cx="50%" cy="62%" r="55%">
          <stop
            offset="0%"
            stopColor={isMorning ? '#FFD08A' : THEME.colors.duskAmberGlow}
            stopOpacity={isEclipse ? 0.28 : 0.52}
          />
          <stop
            offset="55%"
            stopColor={ THEME.colors.duskHorizon }
            stopOpacity={0.2}
          />
          <stop offset="100%" stopColor="#160E2E" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Base Dusk Sky Gradient (No stars!) */}
      <rect width="1080" height="1920" fill={`url(#sky-grad-${variant})`} />

      {/* Warm Dusk / Dawn Sun-Below-Horizon Glow */}
      <rect width="1080" height="1920" fill={`url(#horizon-glow-${variant})`} />

      {/* Anime-noir hard-edged cel-shaded dusk light bands */}
      <polygon
        points={`0,${horizonY - 340} 1080,${horizonY - 390} 1080,${horizonY - 260} 0,${horizonY - 220}`}
        fill="#4A2459"
        opacity="0.32"
      />
      <polygon
        points={`0,${horizonY - 160} 1080,${horizonY - 200} 1080,${horizonY - 70} 0,${horizonY - 40}`}
        fill={isMorning ? '#F5B06B' : '#E37A52'}
        opacity="0.28"
      />

      {/* Cel-Shaded Drifting Dusk Cloud Layer 1 (Upper purple-blue shadow clouds with amber under-rim) */}
      <g transform={`translate(${-drift1}, 0)`}>
        {[0, 1400].map((offset) => (
          <g key={offset} transform={`translate(${offset}, 0)`}>
            {/* Cloud Bank A */}
            <polygon
              points="60,410 240,385 460,398 590,425 430,442 150,436"
              fill="#1E153B"
              opacity="0.78"
            />
            <polygon
              points="150,436 430,442 590,425 540,448 190,446"
              fill="#D96B4B"
              opacity="0.55"
            />
            {/* Cloud Bank B */}
            <polygon
              points="680,530 890,502 1180,515 1310,544 1090,558 760,552"
              fill="#251947"
              opacity="0.72"
            />
            <polygon
              points="760,552 1090,558 1310,544 1250,566 820,562"
              fill="#E58555"
              opacity="0.5"
            />
          </g>
        ))}
      </g>

      {/* Cel-Shaded Drifting Dusk Cloud Layer 2 (Lower horizon streaks) */}
      <g transform={`translate(${drift2 - 700}, 0)`}>
        {[0, 1400].map((offset) => (
          <g key={offset} transform={`translate(${offset}, 0)`}>
            <polygon
              points="120,740 420,722 710,735 620,756 210,754"
              fill="#1A1233"
              opacity="0.65"
            />
            <polygon
              points="210,754 620,756 710,735 660,764 260,762"
              fill="#F29F58"
              opacity="0.45"
            />
            <polygon
              points="840,660 1080,645 1290,658 1210,676 910,674"
              fill="#231742"
              opacity="0.6"
            />
          </g>
        ))}
      </g>

      {/* Atmospheric desert dust particles drifting in dusk wind */}
      {motes.map((m, idx) => (
        <circle
          key={idx}
          cx={m.x}
          cy={m.y}
          r={m.r}
          fill="#F5A86C"
          opacity={m.opacity}
        />
      ))}
    </svg>
  );
};
