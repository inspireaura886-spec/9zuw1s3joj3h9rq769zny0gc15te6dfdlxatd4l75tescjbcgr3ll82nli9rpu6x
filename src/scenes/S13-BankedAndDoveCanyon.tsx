// src/scenes/S13-BankedAndDoveCanyon.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { SpeedLines } from '../kit/SpeedLines';
import { THEME } from '../theme';
import { easeInOutCubic } from '../kit/math';

/**
 * Scene 13 (29.54s - 31.76s | Frames 886 - 952, duration 67 frames)
 * Script: "...banked, and dove into a canyon."
 * HIT at 31.14s (Global Frame 934 -> local frame 48).
 * Visual: High-angle perspective looking down into the deep purple-shadowed canyon gorge.
 * The matte-black triangle banks sharply on its edge (rotateDeg 42°, bankSkewX -22°) and
 * plunges downward between the steep canyon walls with diagonal anime speed lines.
 */
export const S13BankedAndDoveCanyon: React.FC = () => {
  const frame = useCurrentFrame(); // 0..66
  const p = easeInOutCubic(frame / 66);

  const craftX = 320 + p * 310;
  const craftY = 340 + p * 680;
  const craftScale = 1.28 - p * 0.42;
  const bankAngle = 18 + p * 38;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 886} variant="eclipse" cloudSpeed={3.0} horizonY={1100} />

      {/* Diagonal Dive Speed Lines */}
      <SpeedLines
        frame={frame * 2}
        direction="diagonal-dive"
        intensity={1.1}
        color={THEME.colors.celRimPurple}
      />

      {/* Steep Converging Canyon Gorge Walls */}
      <DesertRidge
        frame={frame + 886}
        parallaxX={-p * 40}
        parallaxY={-p * 90}
        variant="canyon-dive"
        windIntensity={2.5}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Curved Bank & Dive Trajectory Arc */}
        <path
          d="M 180 220 Q 480 420 660 1120"
          fill="none"
          stroke={THEME.colors.celRimAmber}
          strokeWidth="5"
          strokeDasharray="20 12"
          opacity="0.8"
        />

        {/* Matte-Black Triangle Banking Sharply & Diving into Canyon Gorge */}
        <BlackTriangleCraft
          x={craftX}
          y={craftY}
          scale={craftScale}
          rotateDeg={bankAngle}
          bankSkewX={-22}
          showAfterimage={true}
          afterimageOffset={{ dx: -70, dy: -95 }}
        />

        {/* Bank Angle Telemetry Readout */}
        <g transform="translate(80, 150)">
          <rect
            x="0"
            y="0"
            width="520"
            height="110"
            fill="rgba(6, 5, 14, 0.88)"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="4"
          />
          <text
            x="32"
            y="48"
            fill={THEME.colors.textAmber}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
          >
            MANEUver: CANYON DIVE
          </text>
          <text
            x="32"
            y="88"
            fill={THEME.colors.textWhite}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
          >
            BANK ANGLE: {Math.round(bankAngle)}° // SILENT
          </text>
        </g>
      </svg>
    </div>
  );
};
