// src/scenes/S11-AcousticContrast.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';

/**
 * Scene 11 (23.86s - 26.09s | Frames 716 - 782, duration 67 frames)
 * Script context: Contrast between the loud 1-mile drone and the massive black triangle
 * hovering directly overhead in complete silence right before it shoots sideways at 26.09s.
 */
export const S11AcousticContrast: React.FC = () => {
  const frame = useCurrentFrame(); // 0..66

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 716} variant="dusk" cloudSpeed={1.3} horizonY={1220} />

      <DesertRidge
        frame={frame + 716}
        ridgeY={1100}
        parallaxX={0}
        parallaxY={0}
        variant="ridge"
        windIntensity={1.2}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Top Comparison Box: Small Drone 1 Mile Away (Noisy Red Waveform Spikes) */}
        <g transform="translate(80, 140)">
          <rect
            x="0"
            y="0"
            width="920"
            height="190"
            fill="rgba(6, 5, 14, 0.9)"
            stroke={THEME.colors.textCrimson}
            strokeWidth="4"
          />
          <text
            x="36"
            y="48"
            fill={THEME.colors.textCrimson}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
            letterSpacing="2"
          >
            SMALL DRONE (1 MILE AWAY) // AUDIBLE BUZZ
          </text>
          {/* Chaotic High-Amplitude Acoustic Waveform */}
          <polyline
            points={Array.from({ length: 38 }, (_, i) => {
              const x = 40 + i * 23;
              const amp = Math.sin(frame * 0.65 + i * 1.3) * 42;
              return `${x},${125 + amp}`;
            }).join(' ')}
            fill="none"
            stroke={THEME.colors.textCrimson}
            strokeWidth="4.5"
          />
        </g>

        {/* Massive Black Triangle Hanging Overhead */}
        <BlackTriangleCraft x={540} y={620} scale={1.34} rotateDeg={0} />

        {/* Lower Comparison Box: Giant Black Triangle Overhead (0.0 dB Dead Flatline) */}
        <g transform="translate(80, 860)">
          <rect
            x="0"
            y="0"
            width="920"
            height="190"
            fill="rgba(6, 5, 14, 0.92)"
            stroke={THEME.colors.hudCyan}
            strokeWidth="4"
          />
          <text
            x="36"
            y="48"
            fill={THEME.colors.hudCyan}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
            letterSpacing="2"
          >
            BLACK TRIANGLE (OVERHEAD) // 0.0 dB FLATLINE
          </text>
          <line
            x1="40"
            y1="125"
            x2="880"
            y2="125"
            stroke={THEME.colors.hudCyan}
            strokeWidth="6"
          />
        </g>

        <AgentSilhouettes
          frame={frame + 716}
          pose="ridge-watch"
          leftAgentX={320}
          rightAgentX={750}
          groundY={1395}
          scale={0.94}
        />
      </svg>
    </div>
  );
};
