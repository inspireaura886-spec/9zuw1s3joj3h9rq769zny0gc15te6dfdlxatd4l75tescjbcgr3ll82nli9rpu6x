// src/scenes/S06-ThermalLockTriangle.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ThermalScopeOverlay } from '../kit/ThermalScopeOverlay';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { THEME } from '../theme';
import { easeOutQuart } from '../kit/math';

/**
 * Scene 06 (12.48s - 13.64s | Frames 374 - 408, duration 35 frames)
 * Rule: 5.91 to 13.64 includes a green thermal-scope view.
 * Visual: Full-screen green thermal scope extreme 8.0X magnification locking tightly
 * onto the featureless pitch-black triangle right before the 13.64s vertical climb HIT.
 */
export const S06ThermalLockTriangle: React.FC = () => {
  const frame = useCurrentFrame(); // 0..34
  const p = easeOutQuart(frame / 34);

  const scale = 1.05 + 0.32 * p;
  const craftY = 680 - 50 * p;

  return (
    <ThermalScopeOverlay
      frame={frame + 374}
      timecodeText="YEAR: 2026 // 20:23:07 PM"
      statusText="THERMAL LOCK // ANOMALY CONFIRMED"
      zoomText="FLIR 8.0X LOCK"
      targetLocked={true}
      reticleX={540}
      reticleY={craftY}
    >
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Warm Thermal Ridge Below */}
        <polygon
          points="0,1120 290,1040 580,1080 860,1020 1080,1090 1080,1440 0,1440"
          fill="#0D4221"
          stroke={THEME.colors.thermalBright}
          strokeWidth="3.5"
        />

        {/* Two Warm Agent Heat Signatures on Foreground Ridge */}
        <g transform="translate(360, 1140)">
          <rect x="-18" y="-85" width="36" height="85" rx="8" fill={THEME.colors.thermalWhiteHot} />
          <circle cx="0" cy="-102" r="16" fill={THEME.colors.thermalWhiteHot} />
        </g>
        <g transform="translate(720, 1130)">
          <rect x="-18" y="-88" width="36" height="88" rx="8" fill={THEME.colors.thermalWhiteHot} />
          <circle cx="0" cy="-105" r="16" fill={THEME.colors.thermalWhiteHot} />
        </g>

        {/* Pitch-Black Cold Triangle Locked in Thermal Crosshairs */}
        <BlackTriangleCraft
          x={540}
          y={craftY}
          scale={scale}
          variant="thermal"
        />

        {/* Vertex Coordinate Callouts on the 3 Corners */}
        {[
          { vx: 540, vy: craftY - 165 * scale, label: 'V1 [0.0lm]' },
          { vx: 540 - 320 * scale, vy: craftY + 135 * scale, label: 'V2 [COLD]' },
          { vx: 540 + 320 * scale, vy: craftY + 135 * scale, label: 'V3 [COLD]' },
        ].map((v, i) => (
          <g key={i} transform={`translate(${v.vx}, ${v.vy})`}>
            <circle cx="0" cy="0" r="14" fill="none" stroke={THEME.colors.thermalWhiteHot} strokeWidth="3" />
            <text
              x="22"
              y="8"
              fill={THEME.colors.thermalWhiteHot}
              fontFamily={THEME.fonts.mono}
              fontSize="22"
              fontWeight="bold"
            >
              {v.label}
            </text>
          </g>
        ))}
      </svg>
    </ThermalScopeOverlay>
  );
};
