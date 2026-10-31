// src/kit/DesertRidge.tsx
import React from 'react';
import { THEME } from '../theme';

export interface DesertRidgeProps {
  frame: number;
  ridgeY?: number;
  parallaxX?: number;
  parallaxY?: number;
  variant?: 'ridge' | 'canyon-dive' | 'canyon-floor';
  windIntensity?: number;
}

/**
 * Anime-noir desert ridge and canyon layers with hard purple-blue cel-shaded shadows,
 * warm dusk rim highlights, and wind-swept scrub/dust streaks.
 * Important visuals stay above y = 1440 (bottom 25% kept clear for captions).
 */
export const DesertRidge: React.FC<DesertRidgeProps> = ({
  frame,
  ridgeY = 1040,
  parallaxX = 0,
  parallaxY = 0,
  variant = 'ridge',
  windIntensity = 1,
}) => {
  const windSway = Math.sin(frame * 0.14) * 6 * windIntensity;
  const windStreakX = (frame * 14 * windIntensity) % 1200;

  if (variant === 'canyon-dive') {
    return (
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* Distant Mesa Wall */}
        <g transform={`translate(${parallaxX * 0.3}, ${parallaxY * 0.3})`}>
          <polygon
            points="-80,820 260,740 540,860 830,720 1160,790 1160,1920 -80,1920"
            fill="#1A1336"
          />
          {/* Cel-shaded purple-blue cliff facet */}
          <polygon
            points="260,740 540,860 540,1420 210,1420"
            fill="#281F54"
          />
          <polygon
            points="830,720 1160,790 1160,1420 790,1420"
            fill="#231A4A"
          />
        </g>

        {/* Left & Right Steep Canyon Gorge Walls Converging into Abyss */}
        <g transform={`translate(${parallaxX * 0.7}, ${parallaxY * 0.7})`}>
          {/* Left Canyon Wall */}
          <polygon
            points="-60,520 340,780 450,1180 390,1920 -60,1920"
            fill={THEME.colors.silhouetteBlack}
          />
          {/* Hard purple-blue shadow planes on Left Wall */}
          <polygon
            points="160,665 340,780 450,1180 310,1210 210,870"
            fill={THEME.colors.celShadowMid}
          />
          <polyline
            points="340,780 450,1180 410,1430"
            fill="none"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="5"
          />

          {/* Right Canyon Wall */}
          <polygon
            points="1140,480 730,760 610,1190 670,1920 1140,1920"
            fill={THEME.colors.silhouetteBlack}
          />
          {/* Hard purple-blue shadow planes on Right Wall */}
          <polygon
            points="920,630 730,760 610,1190 760,1220 860,840"
            fill="#191438"
          />
          <polyline
            points="730,760 610,1190 650,1430"
            fill="none"
            stroke={THEME.colors.celRimAmber}
            strokeWidth="4"
            opacity="0.75"
          />
        </g>
      </svg>
    );
  }

  if (variant === 'canyon-floor') {
    return (
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* Towering Canyon Walls Framing Morning Search */}
        <g transform={`translate(${parallaxX * 0.4}, ${parallaxY * 0.4})`}>
          <polygon
            points="-60,180 280,340 360,980 240,1260 -60,1260"
            fill="#140F2D"
          />
          <polygon
            points="280,340 360,980 310,1020 220,410"
            fill="#2B2259"
          />
          <polygon
            points="1140,140 780,320 700,960 820,1260 1140,1260"
            fill="#140F2D"
          />
          <polygon
            points="780,320 700,960 755,1000 840,390"
            fill="#382966"
          />
        </g>

        {/* Canyon Floor Ground Plane (above 1440 caption zone) */}
        <g transform={`translate(${parallaxX}, ${parallaxY})`}>
          <polygon
            points="-80,1020 360,960 700,960 1160,1030 1160,1920 -80,1920"
            fill="#0A0818"
          />
          {/* Cel-shaded rock strata and purple-blue shadow ledges */}
          <polygon
            points="60,1120 480,1060 980,1110 860,1210 180,1190"
            fill="#1B153B"
          />
          <polygon
            points="220,1240 640,1200 1020,1260 920,1350 140,1330"
            fill="#130E29"
          />
          {/* Unscarred Desert Sage & Agave Plants Swaying Gently */}
          {[
            { x: 260, y: 1180, scale: 1.0 },
            { x: 540, y: 1150, scale: 1.25 },
            { x: 810, y: 1210, scale: 0.95 },
          ].map((plant, i) => (
            <g
              key={i}
              transform={`translate(${plant.x}, ${plant.y}) scale(${plant.scale})`}
            >
              <path
                d={`M0,0 L${-28 + windSway},-46 L-8,-14 L${-4 + windSway},-62 L8,-14 L${30 + windSway},-44 L0,0 Z`}
                fill="#1D2B44"
                stroke="#587CE0"
                strokeWidth="2.5"
              />
            </g>
          ))}
        </g>
      </svg>
    );
  }

  // Default 'ridge' variant (used in Frame 0, Hook, Stopped Dead, Loop End, etc.)
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Distant Background Canyon Mesa */}
      <g transform={`translate(${parallaxX * 0.35}, ${parallaxY * 0.35})`}>
        <polygon
          points={`-80,${ridgeY - 80} 180,${ridgeY - 165} 410,${ridgeY - 140} 670,${ridgeY - 210} 920,${ridgeY - 130} 1160,${ridgeY - 175} 1160,1920 -80,1920`}
          fill="#1B1338"
        />
        {/* Hard purple-blue cel-shaded facet on distant mesa */}
        <polygon
          points={`180,${ridgeY - 165} 410,${ridgeY - 140} 360,${ridgeY + 40} 120,${ridgeY + 20}`}
          fill="#2B2159"
        />
        <polygon
          points={`670,${ridgeY - 210} 920,${ridgeY - 130} 840,${ridgeY + 50} 610,${ridgeY + 20}`}
          fill="#261D52"
        />
        {/* Crisp Dusk Amber Rim Line along Distant Mesa */}
        <polyline
          points={`-80,${ridgeY - 80} 180,${ridgeY - 165} 410,${ridgeY - 140} 670,${ridgeY - 210} 920,${ridgeY - 130} 1160,${ridgeY - 175}`}
          fill="none"
          stroke={THEME.colors.celRimAmber}
          strokeWidth="3.5"
          opacity="0.7"
        />
      </g>

      {/* Main Midground Jagged Desert Ridge */}
      <g transform={`translate(${parallaxX * 0.7}, ${parallaxY * 0.7})`}>
        <polygon
          points={`-80,${ridgeY + 30} 140,${ridgeY - 45} 370,${ridgeY + 15} 540,${ridgeY - 75} 760,${ridgeY - 20} 960,${ridgeY - 60} 1160,${ridgeY + 10} 1160,1920 -80,1920`}
          fill="#0D0A1C"
        />
        {/* Hard Cel-Shaded Purple-Blue Shadow Blocks on Ridge Slope */}
        <polygon
          points={`140,${ridgeY - 45} 370,${ridgeY + 15} 310,${ridgeY + 160} 70,${ridgeY + 120}`}
          fill={THEME.colors.celShadowMid}
        />
        <polygon
          points={`540,${ridgeY - 75} 760,${ridgeY - 20} 690,${ridgeY + 185} 470,${ridgeY + 140}`}
          fill="#191438"
        />
        <polygon
          points={`960,${ridgeY - 60} 1160,${ridgeY + 10} 1110,${ridgeY + 170} 890,${ridgeY + 135}`}
          fill={THEME.colors.celShadowMid}
        />
        {/* Electric Purple-Blue Cel Rim on Main Ridge */}
        <polyline
          points={`-80,${ridgeY + 30} 140,${ridgeY - 45} 370,${ridgeY + 15} 540,${ridgeY - 75} 760,${ridgeY - 20} 960,${ridgeY - 60} 1160,${ridgeY + 10}`}
          fill="none"
          stroke={THEME.colors.celRimPurple}
          strokeWidth="4.5"
        />
      </g>

      {/* Foreground Hilltop Ledge Where the Two Agents Stand (y ~ 1210..1440) */}
      <g transform={`translate(${parallaxX}, ${parallaxY})`}>
        <polygon
          points={`-80,${ridgeY + 210} 230,${ridgeY + 150} 610,${ridgeY + 175} 890,${ridgeY + 140} 1160,${ridgeY + 190} 1160,1920 -80,1920`}
          fill={THEME.colors.silhouetteBlack}
        />
        {/* Hard Purple-Blue Rim Highlight on Foreground Ledge */}
        <polygon
          points={`230,${ridgeY + 150} 610,${ridgeY + 175} 570,${ridgeY + 245} 180,${ridgeY + 225}`}
          fill="#151030"
        />
        <polyline
          points={`-80,${ridgeY + 210} 230,${ridgeY + 150} 610,${ridgeY + 175} 890,${ridgeY + 140} 1160,${ridgeY + 190}`}
          fill="none"
          stroke={THEME.colors.celRimBlue}
          strokeWidth="3"
          opacity="0.65"
        />

        {/* Wind-blown desert scrub silhouettes on ridge (always subtly swaying) */}
        {[150, 880, 965].map((bx, idx) => (
          <g key={idx} transform={`translate(${bx}, ${ridgeY + 155 + (idx % 2) * 18})`}>
            <path
              d={`M0,0 L${-18 + windSway},-32 L-4,-8 L${4 + windSway},-38 L6,-10 L${22 + windSway},-28 Z`}
              fill="#090714"
              stroke={THEME.colors.celRimPurple}
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Horizontal Anime Wind-Dust Streaks Sweeping Across the Ridge */}
        <g opacity={0.35}>
          <line
            x1={1180 - windStreakX}
            y1={ridgeY + 60}
            x2={1360 - windStreakX}
            y2={ridgeY + 60}
            stroke={THEME.colors.celRimPurple}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1={1180 - ((windStreakX + 540) % 1200)}
            y1={ridgeY + 125}
            x2={1410 - ((windStreakX + 540) % 1200)}
            y2={ridgeY + 125}
            stroke={THEME.colors.celRimBlue}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
};
