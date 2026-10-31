// src/scenes/S07-StraightUpClimb.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { SpeedLines } from '../kit/SpeedLines';
import { THEME } from '../theme';

/**
 * Scene 07 (13.64s - 15.69s | Frames 409 - 470, duration 62 frames)
 * HIT at 13.64s (Frame 409).
 * Script: "It climbed straight up for ten seconds."
 * Visual: Anime-noir vertical tracking shot with downward vertical speed lines,
 * receding desert ridge below, and a 10-SECOND vertical climb altitude ladder ticking from 01s to 10s
 * as the featureless matte-black triangle ascends straight up without tilting.
 */
export const S07StraightUpClimb: React.FC = () => {
  const frame = useCurrentFrame(); // 0..61
  const p = frame / 61;

  // Ridge drops rapidly downward as camera tracks the vertical climb
  const ridgeDropY = 1080 + p * 340;
  const craftY = 740 - p * 220;
  const elapsedClimbSec = Math.min(10, Math.max(1, Math.ceil(p * 10)));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 409} variant="dusk" cloudSpeed={2.5} horizonY={1260} />

      {/* Vertical Anime Speed Lines rushing downward */}
      <SpeedLines
        frame={frame}
        direction="vertical"
        intensity={0.95}
        color={THEME.colors.celRimPurple}
      />

      {/* Receding Desert Ridge at bottom of frame */}
      <DesertRidge
        frame={frame + 409}
        ridgeY={ridgeDropY}
        parallaxX={0}
        parallaxY={p * 120}
        variant="ridge"
        windIntensity={2.0}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Vertical Plumb-Line Trajectory Axis (0.0° Vertical Climb) */}
        <line
          x1="540"
          y1="120"
          x2="540"
          y2="1380"
          stroke={THEME.colors.celRimAmber}
          strokeWidth="3.5"
          strokeDasharray="16 12"
          opacity="0.7"
        />

        {/* Altitude Scale Ladder on Left Side (y: 220..1240) */}
        <g transform="translate(110, 0)">
          <line
            x1="0"
            y1="220"
            x2="0"
            y2="1240"
            stroke={THEME.colors.textWhite}
            strokeWidth="4"
            opacity="0.75"
          />
          {Array.from({ length: 11 }, (_, i) => {
            const ty = 1220 - i * 98;
            const active = i <= elapsedClimbSec;
            return (
              <g key={i} transform={`translate(0, ${ty})`}>
                <line
                  x1="-18"
                  y1="0"
                  x2="28"
                  y2="0"
                  stroke={active ? THEME.colors.textAmber : THEME.colors.celRimPurple}
                  strokeWidth={active ? 5 : 3}
                />
                <text
                  x="44"
                  y="9"
                  fill={active ? THEME.colors.textAmber : '#8B7EC4'}
                  fontFamily={THEME.fonts.mono}
                  fontSize="26"
                  fontWeight="bold"
                >
                  {`+${i.toString().padStart(2, '0')}s`}
                </text>
              </g>
            );
          })}
        </g>

        {/* Featureless Matte-Black Triangle Ascending Straight Up (0° tilt) */}
        <BlackTriangleCraft
          x={540}
          y={craftY}
          scale={1.24}
          rotateDeg={0}
          showAfterimage={true}
          afterimageOffset={{ dx: 0, dy: 85 }}
        />

        {/* Top-Right Climb Timer Readout */}
        <g transform="translate(640, 160)">
          <rect
            x="0"
            y="0"
            width="340"
            height="120"
            fill="rgba(6, 5, 14, 0.88)"
            stroke={THEME.colors.textAmber}
            strokeWidth="4"
          />
          <text
            x="170"
            y="46"
            textAnchor="middle"
            fill={THEME.colors.textWhite}
            fontFamily={THEME.fonts.mono}
            fontSize="24"
            fontWeight="bold"
            letterSpacing="2"
          >
            VERTICAL CLIMB
          </text>
          <text
            x="170"
            y="98"
            textAnchor="middle"
            fill={THEME.colors.textAmber}
            fontFamily={THEME.fonts.display}
            fontSize="54"
            fontWeight="bold"
            letterSpacing="3"
          >
            {elapsedClimbSec.toString().padStart(2, '0')}.0 SEC
          </text>
        </g>
      </svg>
    </div>
  );
};
