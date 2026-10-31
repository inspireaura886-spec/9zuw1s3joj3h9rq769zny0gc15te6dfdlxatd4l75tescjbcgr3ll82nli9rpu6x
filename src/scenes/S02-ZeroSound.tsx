// src/scenes/S02-ZeroSound.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';
import { easeOutCubic } from '../kit/math';

/**
 * Scene 02 (2.34s - 4.22s | Frames 70 - 126, duration 57 frames)
 * Script: "...and it made no sound at all."
 * Visual: Close over-the-shoulder shot of the two agents in hard purple-blue shadow
 * watching the black triangle rise while an acoustic decibel flatline (0.0 dB) stretches across the frame.
 */
export const S02ZeroSound: React.FC = () => {
  const frame = useCurrentFrame(); // 0..56
  const p = easeOutCubic(frame / 56);

  const triangleY = 540 - 65 * p;
  const cursorX = 160 + (frame / 56) * 760;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 70} variant="dusk" cloudSpeed={1.1} horizonY={1180} />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <BlackTriangleCraft x={540} y={triangleY} scale={1.28} rotateDeg={0} />
      </svg>

      <DesertRidge
        frame={frame + 70}
        ridgeY={1080}
        parallaxX={-12 * p}
        parallaxY={10 * p}
        variant="ridge"
        windIntensity={1.2}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* Close over-the-shoulder silhouettes of the two agents */}
        <AgentSilhouettes
          frame={frame + 70}
          pose="close-shoulder"
          scale={1}
        />

        {/* Flatline Acoustic HUD Bar (0.0 dB — "...and it made no sound at all") */}
        <g transform="translate(120, 820)">
          <rect
            x="0"
            y="0"
            width="840"
            height="130"
            fill="rgba(6, 5, 14, 0.85)"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="4"
          />
          <text
            x="36"
            y="46"
            fill={THEME.colors.hudCyan}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
            letterSpacing="3"
          >
            ACOUSTIC LEVEL // 0.0 dB [DEAD SILENCE]
          </text>
          {/* Dead flat waveform line */}
          <line
            x1="40"
            y1="88"
            x2="800"
            y2="88"
            stroke="#2D225A"
            strokeWidth="4"
          />
          <line
            x1="40"
            y1="88"
            x2={cursorX - 80}
            y2="88"
            stroke={THEME.colors.hudCyan}
            strokeWidth="6"
          />
          <circle
            cx={cursorX - 80}
            cy="88"
            r="9"
            fill={THEME.colors.textWhite}
          />
        </g>
      </svg>
    </div>
  );
};
