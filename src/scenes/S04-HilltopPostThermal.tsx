// src/scenes/S04-HilltopPostThermal.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ThermalScopeOverlay } from '../kit/ThermalScopeOverlay';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { THEME } from '../theme';
import { easeInOutCubic } from '../kit/math';

/**
 * Scene 04 (5.91s - 10.16s | Frames 177 - 304, duration 128 frames)
 * Script: "Twenty twenty-six. A guarded hilltop post, eight twenty-three p.m."
 * Rule: 5.91 to 13.64 includes a green thermal-scope view.
 * Visual: Green FLIR thermal-scope view scanning across the guarded hilltop post
 * (warm engine block of federal SUV, guard tower/comms mast, perimeter fence) and
 * spotting the cold black triangle emerging over the distant thermal ridge.
 */
export const S04HilltopPostThermal: React.FC = () => {
  const frame = useCurrentFrame(); // 0..127
  const p = easeInOutCubic(frame / 127);

  // Scope pans from the guarded hilltop post on the left toward the ridge center
  const panX = 140 * (1 - p);
  const reticleX = 540 - panX * 0.4;
  const reticleY = 670 - 30 * p;

  return (
    <ThermalScopeOverlay
      frame={frame}
      timecodeText="YEAR: 2026 // 20:23:00 PM"
      statusText="GUARDED HILLTOP POST // IR-CAM"
      zoomText="FLIR 2.5X WIDE"
      targetLocked={frame > 75}
      reticleX={reticleX}
      reticleY={reticleY}
    >
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <g transform={`translate(${panX}, 0)`}>
          {/* Distant Desert Ridge in Green Thermal Palette */}
          <polygon
            points="-200,830 160,730 490,770 760,695 1180,760 1180,1440 -200,1440"
            fill="#072814"
            stroke={THEME.colors.thermalBright}
            strokeWidth="3"
          />

          {/* Cold Matte-Black Triangle Rising Behind Distant Ridge */}
          <BlackTriangleCraft
            x={600}
            y={640 - 60 * p}
            scale={0.82 + 0.12 * p}
            variant="thermal"
          />

          {/* Foreground Guarded Hilltop Post Perimeter & Comms Tower */}
          <polygon
            points="-200,1040 380,985 880,1025 1220,990 1220,1440 -200,1440"
            fill="#041A0C"
            stroke={THEME.colors.thermalGrid}
            strokeWidth="3"
          />

          {/* Guarded Post Radio Mast & Rotating Radar Dish (Left Hilltop) */}
          <g transform="translate(210, 995)">
            <polygon
              points="-45,0 -18,-310 18,-310 45,0"
              fill="none"
              stroke={THEME.colors.thermalBright}
              strokeWidth="4"
            />
            <line x1="-32" y1="-100" x2="32" y2="-180" stroke={THEME.colors.thermalBright} strokeWidth="3" />
            <line x1="32" y1="-100" x2="-32" y2="-180" stroke={THEME.colors.thermalBright} strokeWidth="3" />
            {/* Rotating Dish at top of mast */}
            <g transform={`translate(0, -325) scale(${Math.cos(frame * 0.08)}, 1)`}>
              <ellipse
                cx="0"
                cy="0"
                rx="46"
                ry="18"
                fill="#187A3E"
                stroke={THEME.colors.thermalWhiteHot}
                strokeWidth="4"
              />
            </g>
            {/* Blinking Thermal Beacon Heat Spot on Mast */}
            <circle
              cx="0"
              cy="-355"
              r={6 + Math.sin(frame * 0.25) * 2}
              fill={THEME.colors.thermalWhiteHot}
            />
          </g>

          {/* Guarded Post Perimeter Barbed-Wire Fence Posts */}
          {[60, 160, 260, 360, 460].map((fx, i) => (
            <g key={i} transform={`translate(${fx}, ${1015 - i * 5})`}>
              <line x1="0" y1="0" x2="0" y2="-75" stroke={THEME.colors.thermalBright} strokeWidth="3" />
              <line x1="0" y1="-65" x2="100" y2="-70" stroke={THEME.colors.thermalGrid} strokeWidth="2" />
              <line x1="0" y1="-40" x2="100" y2="-45" stroke={THEME.colors.thermalGrid} strokeWidth="2" />
            </g>
          ))}

          {/* Federal Patrol SUV Parked at Guarded Post (White-Hot Engine & Tires) */}
          <g transform="translate(340, 1020)">
            <polygon
              points="-95,0 -88,-55 -52,-95 48,-95 82,-55 95,0"
              fill="#0D4A25"
              stroke={THEME.colors.thermalBright}
              strokeWidth="3.5"
            />
            {/* Glowing White-Hot Engine Block & Exhaust */}
            <rect
              x="42"
              y="-48"
              width="44"
              height="28"
              rx="6"
              fill={THEME.colors.thermalWhiteHot}
            />
            <circle cx="-55" cy="0" r="22" fill={THEME.colors.thermalWhiteHot} />
            <circle cx="55" cy="0" r="22" fill={THEME.colors.thermalWhiteHot} />
          </g>

          {/* Large Stamp in Thermal View: "2026 // 8:23 PM" */}
          <g transform="translate(460, 340)">
            <rect
              x="-260"
              y="-55"
              width="520"
              height="110"
              fill="rgba(3, 20, 10, 0.86)"
              stroke={THEME.colors.thermalBright}
              strokeWidth="3.5"
            />
            <text
              x="0"
              y="-6"
              textAnchor="middle"
              fill={THEME.colors.thermalWhiteHot}
              fontFamily={THEME.fonts.mono}
              fontSize="40"
              fontWeight="bold"
              letterSpacing="4"
            >
              2026 // 8:23 P.M.
            </text>
            <text
              x="0"
              y="36"
              textAnchor="middle"
              fill={THEME.colors.thermalBright}
              fontFamily={THEME.fonts.mono}
              fontSize="26"
              fontWeight="bold"
              letterSpacing="3"
            >
              GUARDED HILLTOP POST
            </text>
          </g>
        </g>
      </svg>
    </ThermalScopeOverlay>
  );
};
