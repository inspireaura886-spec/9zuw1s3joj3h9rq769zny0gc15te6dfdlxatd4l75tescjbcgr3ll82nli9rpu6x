// src/scenes/S17-NoWreckageNoScarredGround.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { THEME } from '../theme';

/**
 * Scene 17 (37.77s - 41.33s | Frames 1133 - 1239, duration 107 frames)
 * HIT at 37.77s (Global Frame 1133 -> local frame 0).
 * Script: "No wreckage. No scarred ground. Not one damaged plant."
 * Visual: Forensic close-up of the canyon floor and desert agave/sagebrush swaying unharmed
 * in the morning breeze, with three sequential forensic scan boxes:
 * 1) f 0..32:  "NO WRECKAGE"
 * 2) f 33..68: "NO SCARRED GROUND"
 * 3) f 69..106: "NOT ONE DAMAGED PLANT"
 */
export const S17NoWreckageNoScarredGround: React.FC = () => {
  const frame = useCurrentFrame(); // 0..106
  const sway = Math.sin(frame * 0.16) * 8;
  const laserY = 420 + ((frame * 14) % 860);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 1133} variant="morning" cloudSpeed={1.0} horizonY={1120} />

      <DesertRidge
        frame={frame + 1133}
        parallaxX={0}
        parallaxY={0}
        variant="canyon-floor"
        windIntensity={1.2}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Detailed Foreground Untouched Desert Agave / Sage Plant in Cel-Shaded Silhouette */}
        <g transform="translate(540, 1120)">
          {/* Unscarred Ground Strata */}
          <ellipse
            cx="0"
            cy="20"
            rx="340"
            ry="55"
            fill="#140F2D"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="3.5"
          />
          {/* Intact Desert Agave Leaves Swaying Gently */}
          <path
            d={`M0,10 Q-120,-80 ${-190 + sway},-220 Q-70,-120 0,-30 Z`}
            fill="#122438"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3.5"
          />
          <path
            d={`M0,10 Q120,-80 ${190 + sway},-220 Q70,-120 0,-30 Z`}
            fill="#122438"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3.5"
          />
          <path
            d={`M-20,10 Q-65,-160 ${-85 + sway},-310 Q-10,-160 15,-20 Z`}
            fill="#19334D"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3.5"
          />
          <path
            d={`M20,10 Q65,-160 ${85 + sway},-310 Q10,-160 -15,-20 Z`}
            fill="#19334D"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3.5"
          />
          <path
            d={`M-18,10 L${sway * 1.1},-360 L18,10 Z`}
            fill="#214463"
            stroke="#8AE2FF"
            strokeWidth="4"
          />

          {/* Forensic Reticle Around Intact Plant */}
          <rect
            x="-260"
            y="-400"
            width="520"
            height="460"
            fill="none"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3.5"
            strokeDasharray="20 12"
          />
        </g>

        {/* Scanning Laser Line */}
        <line
          x1="140"
          y1={laserY}
          x2="940"
          y2={laserY}
          stroke={THEME.colors.hudCyan}
          strokeWidth="3"
          opacity="0.65"
        />

        {/* Three Progressive Forensic Checklists (y: 140, 275, 410) */}
        <g transform="translate(90, 140)">
          <rect
            x="0"
            y="0"
            width="900"
            height="105"
            fill="rgba(6, 5, 14, 0.9)"
            stroke={THEME.colors.hudCyan}
            strokeWidth="4"
          />
          <text
            x="36"
            y="68"
            fill={THEME.colors.textWhite}
            fontFamily={THEME.fonts.display}
            fontSize="48"
            fontWeight="bold"
            letterSpacing="3"
          >
            [X] NO WRECKAGE
          </text>
        </g>

        {frame >= 32 && (
          <g transform="translate(90, 268)">
            <rect
              x="0"
              y="0"
              width="900"
              height="105"
              fill="rgba(6, 5, 14, 0.9)"
              stroke={THEME.colors.textAmber}
              strokeWidth="4"
            />
            <text
              x="36"
              y="68"
              fill={THEME.colors.textAmber}
              fontFamily={THEME.fonts.display}
              fontSize="48"
              fontWeight="bold"
              letterSpacing="3"
            >
              [X] NO SCARRED GROUND
            </text>
          </g>
        )}

        {frame >= 66 && (
          <g transform="translate(90, 396)">
            <rect
              x="0"
              y="0"
              width="900"
              height="105"
              fill="rgba(6, 5, 14, 0.92)"
              stroke={THEME.colors.textCrimson}
              strokeWidth="4.5"
            />
            <text
              x="36"
              y="68"
              fill={THEME.colors.textCrimson}
              fontFamily={THEME.fonts.display}
              fontSize="48"
              fontWeight="bold"
              letterSpacing="3"
            >
              [X] NOT ONE DAMAGED PLANT
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
