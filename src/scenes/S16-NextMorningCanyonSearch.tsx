// src/scenes/S16-NextMorningCanyonSearch.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';
import { easeOutCubic } from '../kit/math';

/**
 * Scene 16 (35.98s - 37.77s | Frames 1079 - 1132, duration 54 frames)
 * Script: "Next morning, they searched the canyon."
 * Visual: Warm amber-purple early morning light shafts slicing into the deep canyon floor
 * as the two federal agent silhouettes walk along the rocky gorge searching for impact traces.
 */
export const S16NextMorningCanyonSearch: React.FC = () => {
  const frame = useCurrentFrame(); // 0..53
  const p = easeOutCubic(frame / 53);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 1079} variant="morning" cloudSpeed={1.1} horizonY={1180} />

      {/* Canyon Walls and Floor */}
      <DesertRidge
        frame={frame + 1079}
        parallaxX={-24 * p}
        parallaxY={0}
        variant="canyon-floor"
        windIntensity={1.0}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Diagonal Morning Light Shafts Piercing Canyon */}
        <polygon
          points="240,0 560,0 880,1260 480,1260"
          fill="#FFD08A"
          opacity="0.14"
        />
        <polygon
          points="620,0 860,0 1080,1180 820,1260"
          fill="#FFD08A"
          opacity="0.1"
        />

        {/* Two Agents Walking & Searching Canyon Floor */}
        <AgentSilhouettes
          frame={frame}
          pose="canyon-walk"
          leftAgentX={340}
          rightAgentX={720}
          groundY={1320}
          scale={1.05}
        />

        {/* Morning Search Header Stamp */}
        <g transform="translate(80, 150)">
          <rect
            x="0"
            y="0"
            width="580"
            height="98"
            fill="rgba(6, 5, 14, 0.88)"
            stroke={THEME.colors.textAmber}
            strokeWidth="4"
          />
          <text
            x="32"
            y="62"
            fill={THEME.colors.textAmber}
            fontFamily={THEME.fonts.display}
            fontSize="44"
            fontWeight="bold"
            letterSpacing="3"
          >
            NEXT MORNING // CANYON SEARCH
          </text>
        </g>
      </svg>
    </div>
  );
};
