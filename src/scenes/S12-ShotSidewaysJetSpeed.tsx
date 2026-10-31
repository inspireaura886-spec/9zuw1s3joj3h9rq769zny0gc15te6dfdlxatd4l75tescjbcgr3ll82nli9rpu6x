// src/scenes/S12-ShotSidewaysJetSpeed.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { SpeedLines } from '../kit/SpeedLines';
import { THEME } from '../theme';
import { easeOutQuart } from '../kit/math';

/**
 * Scene 12 (26.09s - 29.54s | Frames 783 - 885, duration 103 frames)
 * Script: "From a dead stop, it shot sideways, fast as a fighter jet..."
 * HIT at 27.34s (Global Frame 820 -> local frame 37).
 * Visual: From a dead stop for the first 10 frames, the black triangle explodes sideways
 * across the frame with intense horizontal anime speed lines, afterimages, and a fighter-jet
 * velocity comparison silhouette at the 27.34s HIT.
 */
export const S12ShotSidewaysJetSpeed: React.FC = () => {
  const frame = useCurrentFrame(); // 0..102

  // Dead stop for frames 0..8, then violent lateral snap & high-speed tracking
  const moveProgress = frame < 8 ? 0 : easeOutQuart((frame - 8) / 94);
  const craftX = frame < 8 ? 260 : 260 + moveProgress * 460;
  const ridgeParallaxX = frame < 8 ? 0 : -moveProgress * 260;

  // At local frame 37 (27.34s HIT), show Fighter Jet Mach Speed comparison overlay
  const showJetOverlay = frame >= 34;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 783} variant="dusk" cloudSpeed={frame < 8 ? 1 : 6.5} horizonY={1220} />

      {/* Intense Horizontal Anime Speed Lines once it shoots sideways */}
      {frame >= 8 && (
        <SpeedLines
          frame={frame * 2}
          direction="horizontal"
          intensity={1.2}
          color={THEME.colors.textWhite}
        />
      )}

      <DesertRidge
        frame={frame + 783}
        ridgeY={1090}
        parallaxX={ridgeParallaxX}
        parallaxY={0}
        variant="ridge"
        windIntensity={frame < 8 ? 1 : 3.2}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Silent Mach Shock-Cone Geometry (No sound, purely visual air-displacement wedge) */}
        {frame >= 8 && (
          <g transform={`translate(${craftX + 260}, 580)`}>
            <polyline
              points="-420,-240 60,0 -420,240"
              fill="none"
              stroke={THEME.colors.celRimAmber}
              strokeWidth="5"
              opacity="0.75"
            />
            <polyline
              points="-580,-340 20,0 -580,340"
              fill="none"
              stroke={THEME.colors.celRimPurple}
              strokeWidth="3.5"
              strokeDasharray="24 12"
              opacity="0.65"
            />
          </g>
        )}

        {/* Featureless Matte-Black Triangle Shooting Sideways */}
        <BlackTriangleCraft
          x={craftX}
          y={580}
          scale={1.16}
          rotateDeg={frame < 8 ? 0 : 4}
          bankSkewX={frame < 8 ? 0 : -14}
          showAfterimage={frame >= 8}
          afterimageOffset={{ dx: -140, dy: 0 }}
        />

        {/* Fighter Jet Velocity Comparison Overlay triggered on the 27.34s HIT */}
        {showJetOverlay && (
          <g transform="translate(80, 170)">
            <rect
              x="0"
              y="0"
              width="920"
              height="210"
              fill="rgba(6, 5, 14, 0.9)"
              stroke={THEME.colors.textAmber}
              strokeWidth="4.5"
            />
            <text
              x="38"
              y="54"
              fill={THEME.colors.textAmber}
              fontFamily={THEME.fonts.display}
              fontSize="44"
              fontWeight="bold"
              letterSpacing="3"
            >
              0 TO FIGHTER-JET SPEED // INSTANTANEOUS
            </text>
            {/* Dashed Wireframe Fighter Jet Silhouette for Scale/Speed Reference */}
            <g transform="translate(680, 128) scale(1.15)">
              <polygon
                points="-140,10 -60,-12 -20,-42 10,-12 120,0 10,14 -20,42 -60,14"
                fill="none"
                stroke={THEME.colors.hudCyan}
                strokeWidth="3"
                strokeDasharray="8 5"
              />
            </g>
            <text
              x="38"
              y="118"
              fill={THEME.colors.textWhite}
              fontFamily={THEME.fonts.mono}
              fontSize="30"
              fontWeight="bold"
            >
              LATERAL ACCEL: DEAD STOP -&gt; MACH 1+
            </text>
            <text
              x="38"
              y="168"
              fill={THEME.colors.hudCyan}
              fontFamily={THEME.fonts.mono}
              fontSize="30"
              fontWeight="bold"
            >
              SONIC BOOM: NONE [0.0 dB]
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
