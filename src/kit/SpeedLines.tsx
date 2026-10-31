// src/kit/SpeedLines.tsx
import React from 'react';
import { THEME } from '../theme';
import { hash01 } from './math';

export interface SpeedLinesProps {
  frame: number;
  direction: 'vertical' | 'horizontal' | 'diagonal-dive' | 'radial';
  intensity?: number;
  color?: string;
}

/**
 * Anime-noir speed lines on fast moves (S07 vertical climb, S12 sideways fighter-jet shot,
 * S13 banked canyon dive, S14 thermal scope exit).
 */
export const SpeedLines: React.FC<SpeedLinesProps> = ({
  frame,
  direction,
  intensity = 1,
  color = THEME.colors.textWhite,
}) => {
  const count = Math.round(28 * intensity);

  if (direction === 'vertical') {
    return (
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {Array.from({ length: count }, (_, i) => {
          const x = 40 + hash01(i * 17 + 3) * 1000;
          const len = 220 + hash01(i * 31 + 9) * 420;
          const speed = 65 + hash01(i * 13 + 5) * 55;
          const y = ((frame * speed + i * 190) % 2100) - 200;
          const strokeW = 2 + hash01(i * 7 + 1) * 4.5;
          const op = (0.22 + hash01(i * 23) * 0.45) * intensity;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x}
              y2={y + len}
              stroke={i % 3 === 0 ? THEME.colors.celRimPurple : color}
              strokeWidth={strokeW}
              opacity={op}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  if (direction === 'horizontal') {
    return (
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {Array.from({ length: count }, (_, i) => {
          // Keep speed lines concentrated in upper/mid frame above 1400
          const y = 120 + hash01(i * 19 + 7) * 1240;
          const len = 280 + hash01(i * 29 + 3) * 520;
          const speed = 90 + hash01(i * 11 + 2) * 70;
          const x = 1300 - ((frame * speed + i * 170) % 1800);
          const strokeW = 2.5 + hash01(i * 5 + 4) * 5;
          const op = (0.28 + hash01(i * 17) * 0.5) * intensity;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + len}
              y2={y}
              stroke={i % 2 === 0 ? color : THEME.colors.duskAmberGlow}
              strokeWidth={strokeW}
              opacity={op}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  if (direction === 'diagonal-dive') {
    return (
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <g transform="rotate(34 540 820)">
          {Array.from({ length: count }, (_, i) => {
            const x = -200 + hash01(i * 23 + 5) * 1480;
            const len = 260 + hash01(i * 17 + 9) * 480;
            const speed = 85 + hash01(i * 13 + 7) * 65;
            const y = ((frame * speed + i * 160) % 2200) - 300;
            const strokeW = 2.5 + hash01(i * 9 + 3) * 4.5;
            const op = (0.26 + hash01(i * 29) * 0.48) * intensity;
            return (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x}
                y2={y + len}
                stroke={i % 3 === 0 ? THEME.colors.celRimAmber : color}
                strokeWidth={strokeW}
                opacity={op}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>
    );
  }

  // Radial anime action lines
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <g transform="translate(540, 680)">
        {Array.from({ length: 36 }, (_, i) => {
          const angle = (i * 10 + (frame % 3) * 3) * (Math.PI / 180);
          const r1 = 340 + (hash01(i + frame) * 90);
          const r2 = 980;
          return (
            <line
              key={i}
              x1={Math.cos(angle) * r1}
              y1={Math.sin(angle) * r1}
              x2={Math.cos(angle) * r2}
              y2={Math.sin(angle) * r2}
              stroke={color}
              strokeWidth={2 + (i % 3) * 1.5}
              opacity={0.28 * intensity}
            />
          );
        })}
      </g>
    </svg>
  );
};
