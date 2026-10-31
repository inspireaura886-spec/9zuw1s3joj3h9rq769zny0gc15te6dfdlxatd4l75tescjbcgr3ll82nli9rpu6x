// src/scenes/S08-NoTiltNoWobbleNoLights.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { SpeedLines } from '../kit/SpeedLines';
import { THEME } from '../theme';

/**
 * Scene 08 (15.69s - 18.13s | Frames 471 - 543, duration 73 frames)
 * Script: "No tilt. No wobble. No lights."
 * HIT at 17.37s (Global Frame 521 -> local frame 50).
 * Visual: Geometric orthographic close-up on the rising matte-black triangle with
 * three progressive forensic check callouts locking in on cue:
 * 1) f 0..23:  "NO TILT [0.00° PITCH/ROLL]"
 * 2) f 24..49: "NO WOBBLE [0.00 mm DRIFT]"
 * 3) f 50..72 (HIT at 17.37s): "NO LIGHTS [0 LUMENS / PURE VOID]"
 */
export const S08NoTiltNoWobbleNoLights: React.FC = () => {
  const frame = useCurrentFrame(); // 0..72

  const showNoTilt = frame >= 0;
  const showNoWobble = frame >= 22;
  const showNoLights = frame >= 48; // Aligns with HIT at 17.37s (local frame 50)

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 471} variant="eclipse" cloudSpeed={2.2} horizonY={1320} />

      {/* Subtle vertical motion lines as craft continues ascending flawlessly */}
      <SpeedLines
        frame={frame + 60}
        direction="vertical"
        intensity={0.55}
        color={THEME.colors.celRimBlue}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Precision Gyroscopic Horizon Ring Behind Craft */}
        <g transform="translate(540, 680)">
          <circle
            cx="0"
            cy="0"
            r="410"
            fill="none"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="3"
            strokeDasharray="10 10"
          />
          <line
            x1="-460"
            y1="0"
            x2="460"
            y2="0"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3"
            opacity="0.8"
          />
          <line
            x1="0"
            y1="-460"
            x2="0"
            y2="460"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3"
            opacity="0.8"
          />
        </g>

        {/* Featureless Matte-Black Triangle (Dead-level 0.0° tilt, 0 wobble, 0 lights) */}
        <BlackTriangleCraft
          x={540}
          y={680}
          scale={1.36}
          rotateDeg={0}
        />

        {/* Three Progressive Diagnostic Callout Cards (All above y=1400) */}
        {showNoTilt && (
          <g transform="translate(90, 170)">
            <rect
              x="0"
              y="0"
              width="900"
              height="108"
              fill="rgba(6, 5, 14, 0.9)"
              stroke={THEME.colors.hudCyan}
              strokeWidth="4"
            />
            <text
              x="40"
              y="68"
              fill={THEME.colors.textWhite}
              fontFamily={THEME.fonts.display}
              fontSize="52"
              fontWeight="bold"
              letterSpacing="3"
            >
              01 // NO TILT
            </text>
            <text
              x="860"
              y="66"
              textAnchor="end"
              fill={THEME.colors.hudCyan}
              fontFamily={THEME.fonts.mono}
              fontSize="32"
              fontWeight="bold"
            >
              PITCH: 0.00°
            </text>
          </g>
        )}

        {showNoWobble && (
          <g transform="translate(90, 1020)">
            <rect
              x="0"
              y="0"
              width="900"
              height="108"
              fill="rgba(6, 5, 14, 0.9)"
              stroke={THEME.colors.textAmber}
              strokeWidth="4"
            />
            <text
              x="40"
              y="68"
              fill={THEME.colors.textWhite}
              fontFamily={THEME.fonts.display}
              fontSize="52"
              fontWeight="bold"
              letterSpacing="3"
            >
              02 // NO WOBBLE
            </text>
            <text
              x="860"
              y="66"
              textAnchor="end"
              fill={THEME.colors.textAmber}
              fontFamily={THEME.fonts.mono}
              fontSize="32"
              fontWeight="bold"
            >
              OSC: 0.00 mm
            </text>
          </g>
        )}

        {showNoLights && (
          <g transform="translate(90, 1165)">
            <rect
              x="0"
              y="0"
              width="900"
              height="120"
              fill="rgba(16, 6, 24, 0.95)"
              stroke={THEME.colors.textCrimson}
              strokeWidth="5"
            />
            <text
              x="40"
              y="76"
              fill={THEME.colors.textCrimson}
              fontFamily={THEME.fonts.display}
              fontSize="58"
              fontWeight="bold"
              letterSpacing="4"
            >
              03 // NO LIGHTS
            </text>
            <text
              x="860"
              y="72"
              textAnchor="end"
              fill={THEME.colors.textWhite}
              fontFamily={THEME.fonts.mono}
              fontSize="32"
              fontWeight="bold"
            >
              0.0 LUMENS [MATTE VOID]
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
