// src/scenes/S15-StillTotalSilence.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';

/**
 * Scene 15 (34.20s - 35.98s | Frames 1026 - 1078, duration 53 frames)
 * Script: "Still, total silence."
 * Visual: Wide anime-noir dusk shot of the now-empty sky above the canyon ridge.
 * The two federal agent silhouettes stand staring into the empty gorge while their coats
 * flutter gently in the desert breeze and a 0.0 dB acoustic flatline spans the sky.
 */
export const S15StillTotalSilence: React.FC = () => {
  const frame = useCurrentFrame(); // 0..52

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 1026} variant="dusk" cloudSpeed={1.0} horizonY={1220} />

      <DesertRidge
        frame={frame + 1026}
        ridgeY={1050}
        parallaxX={0}
        parallaxY={0}
        variant="ridge"
        windIntensity={0.9}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Centered Minimalist "TOTAL SILENCE // 0.0 dB" Flatline Across Empty Dusk Sky */}
        <g transform="translate(540, 520)">
          <line
            x1="-420"
            y1="0"
            x2="420"
            y2="0"
            stroke={THEME.colors.hudCyan}
            strokeWidth="5"
          />
          <rect
            x="-310"
            y="-110"
            width="620"
            height="86"
            fill="rgba(6, 5, 14, 0.88)"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3.5"
          />
          <text
            x="0"
            y="-54"
            textAnchor="middle"
            fill={THEME.colors.textWhite}
            fontFamily={THEME.fonts.display}
            fontSize="46"
            fontWeight="bold"
            letterSpacing="5"
          >
            STILL, TOTAL SILENCE // 0.0 dB
          </text>
        </g>

        <AgentSilhouettes
          frame={frame + 1026}
          pose="ridge-watch"
          leftAgentX={330}
          rightAgentX={740}
          groundY={1380}
          scale={1}
        />
      </svg>
    </div>
  );
};
